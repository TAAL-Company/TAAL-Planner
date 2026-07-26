import React, { useState, useEffect } from "react";
import { Chart } from "react-google-charts";
import {
  fetchSitesList,
  fetchSiteData,
  processSiteDataForScatterChart,
  getParentRoutes,
  getChildRoutes,
  getStudentsForRoute,
  getTasksForRoute,
  findSiteByRoute,
  getMostPopularRouteForSite
} from "../../services/dataService";
import "./ScatterChartEditor.css";

const TIME_RANGE_OPTIONS = [
  'Today',
  'Yesterday',
  'Last Week',
  'Last Month',
  'Last Year',
  'Custom'
];

export function ScatterChartEditor({
  siteIds: initialSiteIds = [],
  env = 'prod',
  role = 'ADMIN',
  sitesId: allowedSites = [],
  editorId = null,
  currentLanguage = 'en',
  graphSelectedDefault = null
}) {
  const [chartEditor, setChartEditor] = useState();
  const [chartWrapper, setChartWrapper] = useState();
  const [google, setGoogle] = useState();
  const [data, setData] = useState([["Task", "Duration (seconds)"]]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Data state
  const [sitesList, setSitesList] = useState([]);
  const [siteData, setSiteData] = useState(null);

  // Filter state
  const [selectedSiteIds, setSelectedSiteIds] = useState(initialSiteIds);
  const [selectedParentRoute, setSelectedParentRoute] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [selectedStationId, setSelectedStationId] = useState(null);
  const [timeRange, setTimeRange] = useState('Last Month');
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);

  const options = {
    title: "Task Duration Analysis",
    hAxis: { title: "Task", minValue: 0 },
    vAxis: { title: "Duration (seconds)", minValue: 0 },
    legend: { position: "top" },
  };

  // Load sites list on mount
  useEffect(() => {
    loadSites();
  }, [env, role, allowedSites]);

  // After sites are loaded, find default route and set selected site
  useEffect(() => {
    if (sitesList.length > 0 && graphSelectedDefault) {
      // Find the site that contains the default route
      const siteWithDefaultRoute = findSiteByRoute(sitesList, graphSelectedDefault);
      if (siteWithDefaultRoute) {
        setSelectedSiteIds([siteWithDefaultRoute.id]);
      } else if (sitesList.length > 0) {
        // Fallback to first site if default route not found
        setSelectedSiteIds([sitesList[0].id]);
      }
    } else if (sitesList.length > 0 && initialSiteIds.length > 0) {
      // Use initial site IDs if provided
      setSelectedSiteIds(initialSiteIds);
    } else if (sitesList.length > 0) {
      // Fallback to first site
      setSelectedSiteIds([sitesList[0].id]);
    }
  }, [sitesList, graphSelectedDefault, initialSiteIds]);

  // Load site data when site selection changes
  useEffect(() => {
    if (selectedSiteIds.length > 0) {
      loadSiteData();
    }
  }, [selectedSiteIds, env]);

  // After site data is loaded, set default route
  useEffect(() => {
    if (siteData && graphSelectedDefault) {
      // Check if the default route exists in this site
      const routeExists = siteData.routes?.some(r => r.id === graphSelectedDefault);
      if (routeExists) {
        setSelectedRoute(graphSelectedDefault);
        // Also set parent route if applicable
        const route = siteData.routes.find(r => r.id === graphSelectedDefault);
        if (route && route.parentRouteId) {
          setSelectedParentRoute(route.parentRouteId);
        }
      } else {
        // Fallback to most popular route
        const popularRoute = getMostPopularRouteForSite(siteData);
        if (popularRoute) {
          setSelectedRoute(popularRoute);
        }
      }
    } else if (siteData && !selectedRoute) {
      // Set most popular route as default
      const popularRoute = getMostPopularRouteForSite(siteData);
      if (popularRoute) {
        setSelectedRoute(popularRoute);
      }
    }
  }, [siteData, graphSelectedDefault]);

  // Update chart data when filters change
  useEffect(() => {
    if (siteData) {
      updateChartData();
    }
  }, [siteData, selectedRoute, selectedStudentIds, timeRange, customStartDate, customEndDate]);

  // Reset route selection when site changes
  useEffect(() => {
    setSelectedParentRoute(null);
    setSelectedRoute(null);
    setSelectedStudentIds([]);
    setSelectedStationId(null);
  }, [selectedSiteIds]);

  const loadSites = async () => {
    setLoading(true);
    try {
      const sites = await fetchSitesList(env, role, allowedSites);
      setSitesList(sites);
    } catch (err) {
      setError(err.message);
      console.error('Error loading sites:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSiteData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load data for first selected site (can be extended for multi-site aggregation)
      const data = await fetchSiteData(selectedSiteIds[0], env);
      setSiteData(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading site data:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateChartData = () => {
    const filters = {
      routeId: selectedRoute,
      studentIds: selectedStudentIds,
      timeRange,
      customStartDate,
      customEndDate
    };
    const chartData = processSiteDataForScatterChart(siteData, filters);
    setData(chartData);
  };

  const onEditClick = () => {
    if (!chartWrapper || !google || !chartEditor) {
      return;
    }

    chartEditor.openDialog(chartWrapper);

    google.visualization.events.addListener(chartEditor, "ok", () => {
      const newChartWrapper = chartEditor.getChartWrapper();

      newChartWrapper.draw();

      const newChartOptions = newChartWrapper.getOptions();
      const newChartType = newChartWrapper.getChartType();

      console.log("Chart type changed to ", newChartType);
      console.log("Chart options changed to ", newChartOptions);
    });
  };

  const handleSiteChange = (e) => {
    const value = e.target.value;
    if (value === "") {
      setSelectedSiteIds([]);
    } else {
      setSelectedSiteIds([value]);
    }
  };

  const handleParentRouteChange = (e) => {
    const value = e.target.value;
    setSelectedParentRoute(value === "" ? null : value);
    setSelectedRoute(null);
  };

  const handleRouteChange = (e) => {
    const value = e.target.value;
    setSelectedRoute(value === "" ? null : value);
  };

  const handleStudentChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedStudentIds(selectedOptions);
  };

  const handleStationChange = (e) => {
    const value = e.target.value;
    setSelectedStationId(value === "" ? null : value);
  };

  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
  };

  // Get available parent routes
  const parentRoutes = siteData ? getParentRoutes(siteData.routes) : [];

  // Get available routes based on parent route selection
  const availableRoutes = selectedParentRoute
    ? getChildRoutes(siteData?.routes, selectedParentRoute)
    : siteData?.routes || [];

  // Get available students for selected route
  const availableStudents = selectedRoute
    ? getStudentsForRoute(siteData?.routes, selectedRoute)
    : siteData?.students || [];

  // Get available stations for selected route
  const availableStations = selectedRoute
    ? getTasksForRoute(siteData?.routes, selectedRoute).flatMap(task => task.stations || [])
    : siteData?.stations || [];

  if (loading && !siteData) {
    return <div>Loading chart data...</div>;
  }

  if (error) {
    return <div>Error loading data: {error}</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {/* Site Selection */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Site:</label>
          <select
            value={selectedSiteIds[0] || ""}
            onChange={handleSiteChange}
            style={{ padding: '5px', minWidth: '200px' }}
          >
            <option value="">Select a site</option>
            {sitesList.map(site => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </select>
        </div>

        {/* Parent Route Selection */}
        {siteData && parentRoutes.length > 0 && (
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Parent Route:</label>
            <select
              value={selectedParentRoute || ""}
              onChange={handleParentRouteChange}
              style={{ padding: '5px', minWidth: '200px' }}
            >
              <option value="">All Parent Routes</option>
              {parentRoutes.map(route => (
                <option key={route.id} value={route.id}>
                  {route.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Route Selection */}
        {siteData && availableRoutes.length > 0 && (
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Route:</label>
            <select
              value={selectedRoute || ""}
              onChange={handleRouteChange}
              style={{ padding: '5px', minWidth: '200px' }}
            >
              <option value="">All Routes</option>
              {availableRoutes.map(route => (
                <option key={route.id} value={route.id}>
                  {route.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Student Selection */}
        {siteData && availableStudents.length > 0 && (
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Students:</label>
            <select
              multiple
              value={selectedStudentIds}
              onChange={handleStudentChange}
              style={{ padding: '5px', minWidth: '200px', height: '80px' }}
            >
              {availableStudents.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Station Selection */}
        {siteData && availableStations.length > 0 && (
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Station:</label>
            <select
              value={selectedStationId || ""}
              onChange={handleStationChange}
              style={{ padding: '5px', minWidth: '200px' }}
            >
              <option value="">All Stations</option>
              {availableStations.map(station => (
                <option key={station.id} value={station.id}>
                  {station.title || station.id}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Time Range Selection */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Time Range:</label>
          <select
            value={timeRange}
            onChange={handleTimeRangeChange}
            style={{ padding: '5px', minWidth: '150px' }}
          >
            {TIME_RANGE_OPTIONS.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Date Range */}
        {timeRange === 'Custom' && (
          <>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>From:</label>
              <input
                type="date"
                value={customStartDate || ''}
                onChange={(e) => setCustomStartDate(e.target.value)}
                style={{ padding: '5px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>To:</label>
              <input
                type="date"
                value={customEndDate || ''}
                onChange={(e) => setCustomEndDate(e.target.value)}
                style={{ padding: '5px' }}
              />
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
          <button onClick={onEditClick} style={{ padding: '8px 16px', cursor: 'pointer' }}>
            Edit Chart
          </button>
          <button onClick={loadSiteData} style={{ padding: '8px 16px', cursor: 'pointer' }}>
            Refresh Data
          </button>
        </div>
      </div>

      {!siteData && (
        <div>Please select a site to view data</div>
      )}

      {siteData && (
        <Chart
          chartType="ColumnChart"
          width="100%"
          height="400px"
          data={data}
          options={options}
          chartPackages={["corechart", "controls", "charteditor"]}
          getChartEditor={({ chartEditor, chartWrapper, google }) => {
            setChartEditor(chartEditor);
            setChartWrapper(chartWrapper);
            setGoogle(google);
          }}
        />
      )}
    </div>
  );
}

export default ScatterChartEditor;
