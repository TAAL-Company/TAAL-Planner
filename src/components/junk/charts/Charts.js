import React, { useRef, useState, useEffect } from "react";
import { Chart } from "react-google-charts";

// Sample mock data
const routes = [
  { id: 1, name: "Route A" },
  { id: 2, name: "Route B" },
];

const tasks = [
  { id: 10, name: "Task 1", routeId: 1, expectedTime: 60 },
  { id: 11, name: "Task 2", routeId: 1, expectedTime: 90 },
  { id: 12, name: "Task 3", routeId: 2, expectedTime: 100 },
];

const users = [
  { id: 101, name: "User A", routeId: 1 },
  { id: 102, name: "User B", routeId: 1 },
  { id: 103, name: "User C", routeId: 2 },
];

const performances = [
  { taskId: 10, userId: 101, time: 58 },
  { taskId: 10, userId: 102, time: 61 },
  { taskId: 11, userId: 101, time: 85 },
  { taskId: 11, userId: 102, time: 95 },
  { taskId: 12, userId: 103, time: 98 },
];

const Charts = () => {
  const chartEditorRef = useRef();
  const chartWrapperRef = useRef();
  const googleRef = useRef();

  const [chartData, setChartData] = useState([["Task", "User", "Expected"], ["No data", 0, 0]]);
  const [chartOptions, setChartOptions] = useState({
    title: "Task Performance",
    chartArea: { width: "60%" },
    hAxis: { title: "Time", minValue: 0 },
    bars: "horizontal",
  });
  const [chartType, setChartType] = useState("BarChart");
  const [selectedRouteId, setSelectedRouteId] = useState(null);

  // Handle chart editor dialog
  const onEditClick = () => {
    const chartEditor = chartEditorRef.current;
    const chartWrapper = chartWrapperRef.current;
    const google = googleRef.current;

    if (!chartWrapper || !google || !chartEditor) return;

    chartEditor.openDialog(chartWrapper);
    google.visualization.events.removeAllListeners(chartEditor);

    google.visualization.events.addListener(chartEditor, "ok", () => {
      const newChartWrapper = chartEditor.getChartWrapper();
      setChartData(newChartWrapper.getDataTable());
      setChartOptions(newChartWrapper.getOptions());
      setChartType(newChartWrapper.getChartType());
      console.log("Chart updated.");
    });
  };

  // Update chart when route changes
  useEffect(() => {
    if (!selectedRouteId) return;

    const routeTasks = tasks.filter((t) => t.routeId === selectedRouteId);
    const routeUsers = users.filter((u) => u.routeId === selectedRouteId);
    const routePerf = performances.filter(
      (p) =>
        routeTasks.find((t) => t.id === p.taskId) &&
        routeUsers.find((u) => u.id === p.userId)
    );

    const userNames = routeUsers.map((u) => u.name);
    const header = ["Task", ...userNames, "Expected"];

    const taskMap = {};
    routeTasks.forEach((t) => {
      taskMap[t.id] = { name: t.name, expected: t.expectedTime };
    });

    const userMap = {};
    routeUsers.forEach((u) => {
      userMap[u.id] = u.name;
    });

    const taskRows = {};
    routePerf.forEach((p) => {
      const taskId = p.taskId;
      const userId = p.userId;
      const userName = userMap[userId];

      if (!taskRows[taskId]) {
        taskRows[taskId] = {
          name: taskMap[taskId].name,
          expected: taskMap[taskId].expected,
          times: {},
        };
      }

      taskRows[taskId].times[userName] = p.time;
    });

    const newData = [header];
    Object.values(taskRows).forEach((row) => {
      const rowData = [row.name];
      userNames.forEach((user) => rowData.push(row.times[user] ?? 0));
      rowData.push(row.expected);
      newData.push(rowData);
    });

    setChartData(newData);
    setChartType("BarChart");
    setChartOptions({
      title: `Performance for Route ${routes.find(r => r.id === selectedRouteId).name}`,
      chartArea: { width: "60%" },
      hAxis: { title: "Time (minutes)", minValue: 0 },
      bars: "horizontal",
    });
  }, [selectedRouteId]);

  return (
    <div style={{ padding: "1rem", width: "100%", height: "90%" }}>
      <h2>Select Route</h2>
      <select onChange={(e) => setSelectedRouteId(Number(e.target.value))} defaultValue="">
        <option value="" disabled>
          -- Select a Route --
        </option>
        {routes.map((route) => (
          <option key={route.id} value={route.id}>
            {route.name}
          </option>
        ))}
      </select>

      <button style={{ marginLeft: "1rem" }} onClick={onEditClick}>
        Edit Chart
      </button>

      <div style={{ height: "500px", marginTop: "1rem" }}>
        <Chart
          chartType={chartType}
          width="100%"
          height="100%"
          data={chartData}
          options={chartOptions}
          chartPackages={["corechart", "controls", "charteditor"]}
          getChartEditor={({ chartEditor, chartWrapper, google }) => {
            chartEditorRef.current = chartEditor;
            chartWrapperRef.current = chartWrapper;
            googleRef.current = google;
          }}
        />
      </div>
    </div>
  );
};

export default Charts;
