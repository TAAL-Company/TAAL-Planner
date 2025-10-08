import React from 'react';
import Avatar from '@mui/material/Avatar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Button from '@mui/material/Button'; // Add this import
import { useTranslation } from 'react-i18next';
import TableViewIcon from '@mui/icons-material/TableView';

const Columns = ({ handleClickMenu, coaches, handleSectionExpandToggle }) => {
  const { t } = useTranslation();

  const columns = [
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
      type: 'boolean',
      renderCell: (params) => {
        if (params.row.isRoute) return null; // Skip rendering for route rows
        return params.value ? (
          <CheckCircleIcon style={{ color: 'green' }} />
        ) : (
          <CancelIcon style={{ color: 'red' }} />
        );
      },
    },
    {
      field: 'viewRoutes',
      headerName: t('UserPage.Routes'),
      width: 100,
      renderCell: (params) => {
        const hasRoute = params.row.routes && params.row.routes.length > 0;
        if (!hasRoute) return null;
        return (
          <div onClick={() => handleSectionExpandToggle(params.row.id, 'routes', params.row)}>
            <TableViewIcon style={{ color: 'teal', cursor: 'pointer' }} />
          </div>
        );
      },
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

  // Custom columns for routes
    const routeColumns = [
    { field: 'name', headerName: t('Route.Name'), width: 180 },
    { field: 'OnlyOnce', headerName: t('Route.OnlyOnce'), width: 100, type: 'boolean' },
    // { field: 'parentRouteId', headerName: t('Route.ParentRouteId'), width: 220 },
  ];

  // No need for customColumns for routes now
  return { columns, routeColumns };
};

export default Columns;