/**
 * Configuration module for dynamic environment-based URLs
 */

export const get_config = (env = 'prod') => {
  // Set the base URL based on the environment
  const base_url = env === 'stg' 
    ? 'https://stg-web-app0da5905.azurewebsites.net/'
    : 'https://prod-web-app0da5905.azurewebsites.net/';

  // Return all URLs as a dictionary
  return {
    STUDENTS_URL: base_url + 'students',
    STUDENTS_IDS_URL: base_url + 'students/ids',
    SITE_URL: base_url + 'sites',
    SITE_IDS_URL: base_url + 'sites/ids',
    ROUTE_URL: base_url + 'routes',
    ROUTE_IDS_URL: base_url + 'routes/ids',
    STATION_URL: base_url + 'stations',
    STATION_IDS_URL: base_url + 'stations/ids',
    TASK_URL: base_url + 'tasks',
    TASK_IDS_URL: base_url + 'tasks/ids',
    TASK_PREFORMANCE_URL: base_url + 'task-performance'
  };
};
