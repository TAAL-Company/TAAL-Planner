import React, { useState, useEffect } from 'react';
import { getingTask_Performance, getingData_Tasks, getingData_Users, getingData_Places, getingData_Routes } from '../../api/api';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, FormControl, InputLabel, Button } from '@mui/material';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const TaskPerformanceTable = () => {
  const [data, setData] = useState({});
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [sites, setSites] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedSite, setSelectedSite] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all data without filters
        const response = await getingTask_Performance(
          '', // dateFilter
          "", // studentId
          "", // taskId
          "", // routeId
          "" // siteId
        );
        setData(response);

        const tasksResponse = await getingData_Tasks();
        setTasks(tasksResponse);

        const usersResponse = await getingData_Users();
        setUsers(usersResponse);

        const sitesResponse = await getingData_Places();
        setSites(sitesResponse);

        const routesResponse = await getingData_Routes();
        setRoutes(routesResponse);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // No dependencies, fetch data only once

  const handleSiteChange = (event) => {
    setSelectedSite(event.target.value);
    setSelectedRoute(''); // Reset route filter when site changes
  };

  const handleRouteChange = (event) => {
    setSelectedRoute(event.target.value);
  };

  const filteredData = Object.values(data).filter(task => {
    const siteMatch = selectedSite ? task.siteId === selectedSite : true;
    const routeMatch = selectedRoute ? task.routeId === selectedRoute : true;
    return siteMatch && routeMatch;
  });

  const downloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Task Performance');

    // Add headers
    worksheet.columns = [
      { header: 'שם משימה', key: 'taskName', width: 20 }, // Hebrew for "Task Name"
      { header: 'שם סטודנט', key: 'studentName', width: 20 }, // Hebrew for "Student Name"
      // { header: 'משקל', key: 'weight', width: 10 }, // Hebrew for "Weight"
      { header: 'שם מסלול', key: 'routeName', width: 20 }, // Hebrew for "Route Name"
      { header: 'שם אתר', key: 'siteName', width: 20 }, // Hebrew for "Site Name"
      { header: 'שעת התחלה', key: 'startTime', width: 20 }, // Hebrew for "Start Time"
      { header: 'שעת סיום', key: 'endTime', width: 20 }, // Hebrew for "End Time"
      { header: 'מתי סייעו', key: 'whenAssisted', width: 20 } // Hebrew for "When Assisted"
    ];

    // Add rows
    filteredData.forEach(task => {
      worksheet.addRow({
        taskName: tasks.find(t => t.id === task.taskId)?.title || '',
        studentName: users.find(u => u.id === task.studentId)?.name || '',
        // weight: task.dataEntered || '',
        routeName: routes.find(r => r.id === task.routeId)?.name || '',
        siteName: sites.find(s => s.id === task.siteId)?.name || '',
        startTime: task.startTime || '',
        endTime: task.endTime || '',
        whenAssisted: task.whenAssisted || ''
      });
    });

    // Set RTL direction for Hebrew
    worksheet.views = [{ rightToLeft: true }];

    // Generate Excel file and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'ביצועי_משימות.xlsx'); // Hebrew filename
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <FormControl sx={{ minWidth: 200, marginRight: 2 }}>
        <InputLabel>Filter by Site</InputLabel>
        <Select value={selectedSite} onChange={handleSiteChange}>
          <MenuItem value="">All Sites</MenuItem>
          {sites.map(site => (
            <MenuItem key={site.id} value={site.id}>
              {site.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel>Filter by Route</InputLabel>
        <Select value={selectedRoute} onChange={handleRouteChange} disabled={!selectedSite}>
          <MenuItem value="">All Routes</MenuItem>
          {routes
            .filter(route => !selectedSite || route.sites.some(site => site.id === selectedSite))
            .map(route => (
              <MenuItem key={route.id} value={route.id}>
                {route.name}
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      <Button
        variant="contained"
        color="primary"
        onClick={downloadExcel}
        style={{ marginTop: '20px', marginBottom: '20px' }}
      >
        הורד כקובץ אקסל (Download as Excel)
      </Button>

      <TableContainer component={Paper} sx={{ backgroundColor: '#f0f0f0', marginTop: 2 }}>
        <Table sx={{ minWidth: 650, backgroundColor: '#f0f0f0' }} aria-label="simple table">
          <TableHead sx={{ backgroundColor: '#114260', color: '#fff' }}>
            <TableRow>
              <TableCell sx={{ color: '#fff' }}>Task Name</TableCell>
              <TableCell sx={{ color: '#fff' }}>Student Name</TableCell>
              {/* <TableCell sx={{ color: '#fff' }}>Weight</TableCell> */}
              <TableCell sx={{ color: '#fff' }}>Route Name</TableCell>
              <TableCell sx={{ color: '#fff' }}>Site Name</TableCell>
              <TableCell sx={{ color: '#fff' }}>Start Time</TableCell>
              <TableCell sx={{ color: '#fff' }}>End Time</TableCell>
              <TableCell sx={{ color: '#fff' }}>When Assisted</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((task, index) => (
              <TableRow
                key={index}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row" sx={{ color: '#333' }}>
                  {tasks.find(t => t.id === task.taskId)?.title}
                </TableCell>
                <TableCell sx={{ color: '#333' }}>{users.find(u => u.id === task.studentId)?.name}</TableCell>
                {/* <TableCell sx={{ color: '#333' }}>{task.dataEntered}</TableCell> */}
                <TableCell sx={{ color: '#333' }}>{routes.find(r => r.id === task.routeId)?.name}</TableCell>
                <TableCell sx={{ color: '#333' }}>{sites.find(s => s.id === task.siteId)?.name}</TableCell>
                <TableCell sx={{ color: '#333' }}>{task.startTime}</TableCell>
                <TableCell sx={{ color: '#333' }}>{task.endTime}</TableCell>
                <TableCell sx={{ color: '#333' }}>{task.whenAssisted}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default TaskPerformanceTable;