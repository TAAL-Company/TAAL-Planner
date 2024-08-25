import React, { useState, useEffect } from 'react';
import { getingTask_Performance, getingData_Tasks, getingData_Users, getingData_Places, getingData_Routes } from '../../api/api';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const TaskPerformanceTable = () => {
  const [data, setData] = useState({});
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [sites, setSites] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
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
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const taskData = Object.values(data).filter(task => task.dataEntered !== '');

  return (
    <div style={{ padding: '20px' }}>
      <TableContainer component={Paper} sx={{ backgroundColor: '#f0f0f0' }}>
        <Table sx={{ minWidth: 650, backgroundColor: '#f0f0f0' }} aria-label="simple table">
          <TableHead sx={{ backgroundColor: '#114260', color: '#fff' }}>
            <TableRow>
              <TableCell sx={{ color: '#fff' }}>Task Name</TableCell>
              <TableCell sx={{ color: '#fff' }}>Student Name</TableCell>
              <TableCell sx={{ color: '#fff' }}>weight</TableCell>
              <TableCell sx={{ color: '#fff' }}>Route Name</TableCell>
              <TableCell sx={{ color: '#fff' }}>Site Name</TableCell>
              <TableCell sx={{ color: '#fff' }}>Start Time</TableCell>
              <TableCell sx={{ color: '#fff' }}>End Time</TableCell>
              <TableCell sx={{ color: '#fff' }}>When Assisted</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {taskData.map((task, index) => (
              <TableRow
                key={index}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row" sx={{ color: '#333' }}>
                  {tasks.find(t => t.id === task.taskId)?.title}
                </TableCell>
                <TableCell sx={{ color: '#333' }}>{users.find(u => u.id === task.studentId)?.name}</TableCell>
                <TableCell sx={{ color: '#333' }}>{task.dataEntered}</TableCell>
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