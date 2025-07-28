import React from 'react';
import IconButton from '@mui/material/IconButton';
import TableViewIcon from '@mui/icons-material/TableView';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Avatar from '@mui/material/Avatar';
import { useTranslation } from 'react-i18next';

const Columns = ({ handleClickMenu, handlePopupOpen }) => {
  const { t } = useTranslation();

  const columns = [
    { field: 'name', headerName: t('Route.Name'), width: 180 },
    { field: 'OnlyOnce', headerName: t('Route.OnlyOnce'), width: 100, type: 'boolean', },
    { field: 'parentRouteId', headerName: t('Route.ParentRouteId'), width: 220, },
    {
      field: 'tasks',
      headerName: t('Route.tasks'),
      width: 100,
      renderCell: (params) =>
        Array.isArray(params.row.tasks) && params.row.tasks.length > 0 ? (
          <IconButton onClick={() => handlePopupOpen('tasks', params.row)}>
            <TableViewIcon style={{ color: 'orange' }} />
          </IconButton>
        ) : null,
    },
    {
      field: 'students',
      headerName: t('SitePage.Users'),
      width: 100,
      renderCell: (params) =>
        Array.isArray(params.row.students) && params.row.students.length > 0 ? (
          <IconButton onClick={() => handlePopupOpen('students', params.row)}>
            <TableViewIcon style={{ color: 'black' }} />
          </IconButton>
        ) : null,
    },
    {
      field: 'sites',
      headerName: t('RoutePage.sites'),
      width: 200,
      valueGetter: (params) => {
        // If your route has a sites array, show their names
        if (Array.isArray(params.row.sites)) {
          return params.row.sites.map(site => site.name).join(', ');
        }
        return '';
      }
    },
    {
      field: 'menu',
      headerName: '',
      width: 50,
      renderCell: (params) => (
        <IconButton onClick={(e) => handleClickMenu(e, params.row)}>
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  // Columns for the popup tables
  const taskColumns = [
    { field: 'position', headerName: t('Planner.Tasks.Title'), width: 90, resizable: true, flex: 0.5 },
    { field: 'title', headerName: t('Task.title'), width: 180, resizable: true, flex: 1 },
    {
      field: 'picture_url',
      headerName: t('Planner.Tasks.picture_url'),
      width: 80,
      resizable: true,
      flex: 0.5,
      renderCell: (params) =>
        params.value ? <img src={params.value} alt="task" style={{ width: 80, height: 80 }} /> : null,
    },
    // { field: 'taskId', headerName: 'Task ID', width: 220, resizable: true, flex: 1 },
    // { field: 'routeId', headerName: 'Route ID', width: 220, resizable: true, flex: 1 },
  ];

  const studentColumns = [
    { field: 'name', headerName: t('UserPage.Name'), width: 120, resizable: true, flex: 1 },
    { field: 'user_name', headerName: t('UserPage.Username'), width: 140, resizable: true, flex: 1 },
    { field: 'email', headerName: t('UserPage.Email'), width: 180, resizable: true, flex: 1.5 },
    { field: 'phone', headerName: t('UserPage.Phone'), width: 120, resizable: true, flex: 1 },
    { field: 'role', headerName: t('UserPage.Role'), width: 100, resizable: true, flex: 0.7 },
    { field: 'lastLoginAt', headerName: t('UserPage.LastLoginAt'), width: 160, resizable: true, flex: 1, valueGetter: (params) => params.value ? new Date(params.value).toLocaleString() : '' },
    { field: 'createdAt', headerName: t('UserPage.CreatedAt'), width: 160, resizable: true, flex: 1, valueGetter: (params) => params.value ? new Date(params.value).toLocaleString() : '' },
  ];

  return { columns, taskColumns, studentColumns };
};

export default Columns;