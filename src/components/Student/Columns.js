import React from 'react';
import Avatar from '@mui/material/Avatar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useTranslation } from 'react-i18next';

const Columns = ({ expandedRows,setExpandedRows, handleClickMenu, coaches }) => {
  const { t } = useTranslation();
    // Expand toggle for rows
    const handleRowExpandToggle = (id) => {
      setExpandedRows(prev => ({
        ...prev,
        [id]: !prev[id],
      }));
    };

  // Columns for the DataGrid
  const columns = [
    // { field: 'id', headerName: 'ID', width: 300 },
    {
      field: 'picture_url',
      headerName: t('UserPage.Avatar'),
      width: 70,
      renderCell: (params) => {
        if (params.row.isRoute) return null; // Skip avatar rendering for route rows
        return <Avatar alt="User Avatar" src={params.value} />;
      },
    },
    { field: 'name', headerName: t('UserPage.Name'), width: 150, editable: true },
    { field: 'user_name', headerName: t('UserPage.Username'), width: 150, editable: true },
    { field: 'email', headerName: t('UserPage.Email'), width: 200, editable: true },
    { field: 'phone', headerName: t('UserPage.Phone'), width: 150, editable: true },
    { field: 'role', headerName: t('UserPage.Role'), width: 120 },
    // { field: 'cognitiveProfile', headerName: t('UserPage.cognitive_profile'), width: 200 },
    {
      field: 'coach',
      headerName: t('UserPage.CoachName'),
      width: 150,
      valueGetter: (params) => {
        const coach = coaches.find(coach => coach.id === params.row.coachId);
        return coach ? coach.name : '';
      },
    },
    {
      field: 'sites',
      headerName: t('UserPage.SitesName'),
      width: 200,
      renderCell: (params) => {
        const sites = params.row.sites ? params.row.sites.map((site) => site.name) : [];
        const sitesfromsitesdata = params.row.sites ? params.row.sites.flatMap((site) => site.students?.find((student) => student.id === params.row.id)?.name) : [];
        const allsites = sites.concat(sitesfromsitesdata);
        return <div>{allsites.join(', ')}</div>;
      },
    },
    {
      field: 'created_at',
      headerName: t('UserPage.CreatedAt'),
      width: 150,
      valueGetter: (params) => {
        const createdAt = params.row.createdAt;
        return createdAt ? new Date(createdAt).toLocaleString() : '';
      },
    },
    {
      field: 'last_login_at',
      headerName: t('UserPage.LastLoginAt'),
      width: 150,
      valueGetter: (params) => {
        const lastLoginAt = params.row.lastLoginAt;
        return lastLoginAt ? new Date(lastLoginAt).toLocaleString() : '';
      },
    },
    {
      field: 'active',
      headerName: t('UserPage.Online'),
      width: 120,
      renderCell: (params) => {
        if (params.row.isRoute) return null; // Skip active status for route rows
        return params.value ? (
          <CheckCircleIcon style={{ color: 'green' }} />
        ) : (
          <CancelIcon style={{ color: 'red' }} />
        );
      },
    },
    {
      field: 'expand',
      headerName: '',
      width: 50,
      renderCell: (params) => {
        if (params.row.isRoute) return null; // Skip expand icon for route rows
        const hasRoutes = params.row.routes && params.row.routes.length > 0;
        return (
          <div onClick={() => handleRowExpandToggle(params.id)}>
            {hasRoutes ? (
              expandedRows[params.id] ? (
                <ExpandLessIcon style={{ color: 'blue' }} />
              ) : (
                <ExpandMoreIcon style={{ color: 'blue' }} />
              )
            ) : (
              <></>
            )}
          </div>
        );
      },
    },
    {
      field: 'menu',
      headerName: '',
      width: 50,
      renderCell: (params) => {
        if (params.row.isRoute) return null; // Skip menu for route rows
        return (
          <IconButton onClick={(e) => handleClickMenu(e, params.row)}>
            <MoreVertIcon />
          </IconButton>
        );
      },
    },
  ];

  // Custom columns for route data
  const customColumns = [
    { field: 'routeName', headerName: t('UserPage.RouteName'), width: 200 },
    // { field: 'routeOnlyOnce', headerName: t('UserPage.RouteOnlyOnce'), width: 100 },
  ];

  return { columns, customColumns };
};

export default Columns;