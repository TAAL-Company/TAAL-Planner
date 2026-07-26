import axios from 'axios';
import { get_config } from '../config/apiConfig';

/**
 * Fetch the list of all sites (lightweight call to get site ids and names).
 */
export const fetchSitesList = async (env = 'prod', role = 'ADMIN', sitesId = []) => {
  try {
    const config = get_config(env);
    const response = await axios.get(config.SITE_URL);
    let data = response.data;

    // Flatten the nested JSON structure if needed
    if (typeof data === 'object' && !Array.isArray(data)) {
      data = Object.values(data);
    }

    // Apply role-based filtering
    if (role === 'EDITOR' && sitesId.length > 0) {
      data = data.filter(site => sitesId.includes(site.id));
    }

    return data;
  } catch (error) {
    console.error('Error fetching sites:', error);
    throw error;
  }
};

/**
 * POST request to fetch data by IDs.
 */
export const fetchDataByIds = async (url, ids) => {
  if (!ids || ids.length === 0) {
    return [];
  }

  try {
    const response = await axios.post(url, ids, {
      headers: { 'Content-Type': 'application/json' }
    });
    let data = response.data;

    // Flatten if needed
    if (typeof data === 'object' && !Array.isArray(data)) {
      data = Object.values(data);
    }

    return data;
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);
    throw error;
  }
};

/**
 * Fetch task performance data for a specific site using GET with siteId query param.
 */
export const fetchTaskPerformanceBySite = async (siteId, env = 'prod') => {
  try {
    const config = get_config(env);
    const url = `${config.TASK_PREFORMANCE_URL}?siteId=${siteId}`;
    const response = await axios.get(url);
    let data = response.data;

    if (typeof data === 'object' && !Array.isArray(data)) {
      data = Object.values(data);
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Transform the JSON data
    return data.map(item => {
      const startTime = new Date(item.startTime);
      const endTime = new Date(item.endTime);
      const duration = (endTime - startTime) / 1000; // Convert to seconds
      const date = startTime.toISOString().split('T')[0];
      const assisted = item.whenAssisted !== '2001-01-01T00:00:00.000Z' ? 1 : 0;

      return {
        site_id: item.siteId,
        route_id: item.routeId,
        task_id: item.taskId,
        student_id: item.studentId,
        date,
        duration,
        assisted
      };
    });
  } catch (error) {
    console.error('Error fetching task performance:', error);
    throw error;
  }
};

/**
 * Extract IDs from site data for students, tasks, routes, stations.
 */
export const extractIdsFromSite = (siteData) => {
  const studentIds = siteData.students?.map(s => s.id) || [];
  const taskIds = siteData.tasks?.map(t => t.id) || [];
  const routeIds = siteData.routes?.map(r => r.id) || [];
  const stationIds = [];

  // Extract station IDs from tasks
  if (siteData.tasks) {
    siteData.tasks.forEach(task => {
      if (task.stations) {
        task.stations.forEach(station => {
          stationIds.push(station.id);
        });
      }
    });
  }

  return {
    studentIds,
    taskIds,
    routeIds,
    stationIds
  };
};

/**
 * Fetch complete site data including all related entities.
 */
export const fetchSiteData = async (siteId, env = 'prod') => {
  try {
    const config = get_config(env);

    // Fetch the specific site
    const sitesList = await fetchSitesList(env);
    const siteData = sitesList.find(site => site.id === siteId);

    if (!siteData) {
      throw new Error(`Site ${siteId} not found`);
    }

    // Extract IDs
    const { studentIds, taskIds, routeIds, stationIds } = extractIdsFromSite(siteData);

    // Fetch related data by IDs
    const [studentsData, tasksData, routesData, stationsData] = await Promise.all([
      studentIds.length > 0 ? fetchDataByIds(config.STUDENTS_IDS_URL, studentIds) : [],
      taskIds.length > 0 ? fetchDataByIds(config.TASK_IDS_URL, taskIds) : [],
      routeIds.length > 0 ? fetchDataByIds(config.ROUTE_IDS_URL, routeIds) : [],
      stationIds.length > 0 ? fetchDataByIds(config.STATION_IDS_URL, stationIds) : []
    ]);

    // Fetch task performance for the site
    const taskPerformanceData = await fetchTaskPerformanceBySite(siteId, env);

    // Find student IDs from task performance that are not in the site's student list
    const taskPerformanceStudentIds = [...new Set(taskPerformanceData.map(perf => perf.student_id))];
    const missingStudentIds = taskPerformanceStudentIds.filter(id => !studentIds.includes(id));

    // Fetch missing students if any
    let missingStudentsData = [];
    if (missingStudentIds.length > 0) {
      missingStudentsData = await fetchDataByIds(config.STUDENTS_IDS_URL, missingStudentIds);
    }

    // Combine students data
    const allStudentsData = [...studentsData, ...missingStudentsData];

    return {
      site: siteData,
      students: allStudentsData,
      tasks: tasksData,
      routes: routesData,
      stations: stationsData,
      taskPerformance: taskPerformanceData
    };
  } catch (error) {
    console.error('Error fetching site data:', error);
    throw error;
  }
};

/**
 * Fetch data for multiple sites.
 */
export const fetchMultipleSitesData = async (siteIds, env = 'prod') => {
  try {
    if (!siteIds || siteIds.length === 0) {
      return [];
    }

    const sitesData = await Promise.all(
      siteIds.map(siteId => fetchSiteData(siteId, env))
    );

    return sitesData;
  } catch (error) {
    console.error('Error fetching multiple sites data:', error);
    throw error;
  }
};

/**
 * Get parent routes (routes with no parent or parentRouteId equals route_id)
 */
export const getParentRoutes = (routes) => {
  if (!routes) return [];
  return routes.filter(route => 
    !route.parentRouteId || route.parentRouteId === route.id
  );
};

/**
 * Get child routes for a specific parent route
 */
export const getChildRoutes = (routes, parentRouteId) => {
  if (!routes) return [];
  const childRoutes = routes.filter(route => route.parentRouteId === parentRouteId);
  // Include the parent route itself if it's a valid route
  const parentRoute = routes.find(r => r.id === parentRouteId);
  if (parentRoute) {
    return [parentRoute, ...childRoutes];
  }
  return childRoutes;
};

/**
 * Get routes for a specific site
 */
export const getRoutesForSite = (routes, siteId) => {
  if (!routes) return [];
  return routes.filter(route => route.siteId === siteId);
};

/**
 * Get students for a specific route
 */
export const getStudentsForRoute = (routes, routeId) => {
  if (!routes) return [];
  const route = routes.find(r => r.id === routeId);
  return route?.students || [];
};

/**
 * Get tasks for a specific route
 */
export const getTasksForRoute = (routes, routeId) => {
  if (!routes) return [];
  const route = routes.find(r => r.id === routeId);
  return route?.tasks || [];
};

/**
 * Find the site that contains a specific route ID
 */
export const findSiteByRoute = (sitesList, routeId) => {
  if (!sitesList || !routeId) return null;
  return sitesList.find(site => {
    if (!site.routes) return false;
    return site.routes.some(route => route.id === routeId);
  });
};

/**
 * Get the most popular route for a specific site based on task performance
 */
export const getMostPopularRouteForSite = (siteData) => {
  if (!siteData || !siteData.taskPerformance || siteData.taskPerformance.length === 0) {
    return null;
  }

  // Count occurrences of each route in task performance
  const routeCounts = {};
  siteData.taskPerformance.forEach(perf => {
    if (!routeCounts[perf.route_id]) {
      routeCounts[perf.route_id] = 0;
    }
    routeCounts[perf.route_id]++;
  });

  // Find the route with the most occurrences
  let maxCount = 0;
  let popularRouteId = null;
  Object.entries(routeCounts).forEach(([routeId, count]) => {
    if (count > maxCount) {
      maxCount = count;
      popularRouteId = routeId;
    }
  });

  return popularRouteId;
};

/**
 * Filter task performance by date range
 */
export const filterByDateRange = (taskPerformance, timeRange, customStartDate, customEndDate) => {
  if (!taskPerformance || taskPerformance.length === 0) return taskPerformance;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let startDate, endDate;

  switch (timeRange) {
    case 'Today':
      startDate = new Date(today);
      endDate = new Date(today);
      break;
    case 'Yesterday':
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 1);
      endDate = new Date(startDate);
      break;
    case 'Last Week':
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - today.getDay());
      endDate = new Date(today);
      break;
    case 'Last Month':
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today);
      break;
    case 'Last Year':
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate = new Date(today);
      break;
    case 'Custom':
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
      break;
    default:
      return taskPerformance;
  }

  return taskPerformance.filter(perf => {
    const perfDate = new Date(perf.date);
    return perfDate >= startDate && perfDate <= endDate;
  });
};

/**
 * Process site data for scatter chart visualization with filters.
 * Returns data in format: [['Task', 'Student1', 'Student2', ..., 'Estimated Time'], ['Task1', val1, val2, ..., estVal], ...]
 * Shows each student as a separate series, plus estimated time as a dummy user.
 */
export const processSiteDataForScatterChart = (siteData, filters = {}) => {
  const {
    routeId = null,
    studentIds = [],
    timeRange = 'Last Month',
    customStartDate = null,
    customEndDate = null
  } = filters;

  if (!siteData || !siteData.taskPerformance || siteData.taskPerformance.length === 0) {
    return [['Task', 'Duration (seconds)']];
  }

  // Filter by route
  let filteredPerformance = siteData.taskPerformance;
  if (routeId) {
    filteredPerformance = filteredPerformance.filter(perf => perf.route_id === routeId);
  }

  // Filter by students
  if (studentIds && studentIds.length > 0) {
    filteredPerformance = filteredPerformance.filter(perf => studentIds.includes(perf.student_id));
  }

  // Filter by date range
  filteredPerformance = filterByDateRange(filteredPerformance, timeRange, customStartDate, customEndDate);

  if (filteredPerformance.length === 0) {
    return [['Task', 'Duration (seconds)']];
  }

  // Get task names and estimated times
  const taskMap = {};
  const taskEstimatedTimes = {};
  if (siteData.tasks) {
    siteData.tasks.forEach(task => {
      taskMap[task.id] = task.name || task.title || task.id;
      // Store estimated time if available (in seconds)
      if (task.estimatedTimeSeconds !== undefined && task.estimatedTimeSeconds !== null) {
        taskEstimatedTimes[task.id] = task.estimatedTimeSeconds;
      }
    });
  }

  // Get student names
  const studentMap = {};
  if (siteData.students) {
    siteData.students.forEach(student => {
      studentMap[student.id] = student.name || student.id;
    });
  }

  // Get unique tasks and students
  const uniqueTasks = [...new Set(filteredPerformance.map(perf => perf.task_id))];
  const uniqueStudents = [...new Set(filteredPerformance.map(perf => perf.student_id))];

  // Log missing student data for debugging
  uniqueStudents.forEach(studentId => {
    if (!studentMap[studentId]) {
      console.warn(`Student data not found for ID: ${studentId}`);
      studentMap[studentId] = `Student ${studentId}`;
    }
  });

  // Sort tasks by name for consistent ordering
  uniqueTasks.sort((a, b) => {
    const nameA = taskMap[a] || a;
    const nameB = taskMap[b] || b;
    return nameA.localeCompare(nameB);
  });

  // Sort students by name for consistent ordering
  uniqueStudents.sort((a, b) => {
    const nameA = studentMap[a] || a;
    const nameB = studentMap[b] || b;
    return nameA.localeCompare(nameB);
  });

  // Build chart data matrix with estimated time as a dummy user
  const chartData = [['Task', ...uniqueStudents.map(id => studentMap[id] || id), 'Estimated Time']];

  uniqueTasks.forEach(taskId => {
    const taskName = taskMap[taskId] || taskId;
    const row = [taskName];

    uniqueStudents.forEach(studentId => {
      // Find the duration for this task-student combination
      const perf = filteredPerformance.find(
        p => p.task_id === taskId && p.student_id === studentId
      );
      row.push(perf ? Math.round(perf.duration) : 0);
    });

    // Add estimated time as the last column
    row.push(taskEstimatedTimes[taskId] !== undefined ? Math.round(taskEstimatedTimes[taskId]) : 0);

    chartData.push(row);
  });

  return chartData;
};
