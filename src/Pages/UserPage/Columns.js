import React from 'react';
import Avatar from '@mui/material/Avatar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Button from '@mui/material/Button'; // Add this import
import { useTranslation } from 'react-i18next';
import TableViewIcon from '@mui/icons-material/TableView';
import I18nHoverText from '../../components/I18nHoverText/I18nHoverText';

const Columns = ({ handleClickMenu, coaches, handleSectionExpandToggle }) => {
  const { t } = useTranslation();
  // DataGrid headerName stays a plain string (used for sorting/column menu a11y text); renderHeader adds the hover.
  const renderHeaderWithHover = (key) => () => (
    <I18nHoverText translationKey={key}>{t(key)}</I18nHoverText>
  );

  const columns = [
    {
      field: 'picture_url',
      headerName: t('UserPage.Avatar'),
      renderHeader: renderHeaderWithHover('UserPage.Avatar'),
      width: 70,
      renderCell: (params) => {
        if (params.row.isRoute) return null; // Skip avatar rendering for route rows
        return <Avatar alt="User Avatar" src={params.value} />;
      },
    },
    { field: 'name', headerName: t('UserPage.Name'), renderHeader: renderHeaderWithHover('UserPage.Name'), width: 150, editable: true },
    { field: 'user_name', headerName: t('UserPage.Username'), renderHeader: renderHeaderWithHover('UserPage.Username'), width: 150, editable: true },
    { field: 'email', headerName: t('UserPage.Email'), renderHeader: renderHeaderWithHover('UserPage.Email'), width: 200, editable: true },
    { field: 'phone', headerName: t('UserPage.Phone'), renderHeader: renderHeaderWithHover('UserPage.Phone'), width: 150, editable: true },
    { field: 'role', headerName: t('UserPage.Role'), renderHeader: renderHeaderWithHover('UserPage.Role'), width: 120 },
    {
      field: 'coach',
      headerName: t('UserPage.CoachName'),
      renderHeader: renderHeaderWithHover('UserPage.CoachName'),
      width: 150,
      valueGetter: (value, row) => {
        const params = { value, row };
        const coach = coaches.find(coach => coach.id === params.row.coachId);
        return coach ? coach.name : '';
      },
    },
    {
      field: 'sites',
      headerName: t('UserPage.SitesName'),
      renderHeader: renderHeaderWithHover('UserPage.SitesName'),
      width: 100,
      renderCell: (params) => {
        const hasSites = params.row.sites && params.row.sites.length > 0;
        if (!hasSites) return null;
        return (
          <div onClick={() => handleSectionExpandToggle(params.row.id, 'sites', params.row)}>
            <TableViewIcon style={{ color: 'teal', cursor: 'pointer' }} />
          </div>
        );
      },
    },
    {
      field: 'created_at',
      headerName: t('UserPage.CreatedAt'),
      renderHeader: renderHeaderWithHover('UserPage.CreatedAt'),
      width: 150,
      valueGetter: (value, row) => {
        const params = { value, row };
        const createdAt = params.row.createdAt;
        if (!createdAt) return '';
        const d = new Date(createdAt);
        return d.toLocaleDateString('en-GB') + ', ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      },
    },
    {
      field: 'last_login_at',
      headerName: t('UserPage.LastLoginAt'),
      renderHeader: renderHeaderWithHover('UserPage.LastLoginAt'),
      width: 150,
      valueGetter: (value, row) => {
        const params = { value, row };
        const lastLoginAt = params.row.lastLoginAt;
        if (!lastLoginAt) return '';
        const d = new Date(lastLoginAt);
        return d.toLocaleDateString('en-GB') + ', ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      },
    },
    {
      field: 'active',
      headerName: t('UserPage.Online'),
      renderHeader: renderHeaderWithHover('UserPage.Online'),
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
      renderHeader: renderHeaderWithHover('UserPage.Routes'),
      width: 100,
      renderCell: (params) => {
        const hasRoute = params.row.routes && params.row.routes.length > 0;
        if (!hasRoute) return null;
        return (
          <div onClick={() => handleSectionExpandToggle(params.row.id, 'routes', params.row)}>
            <TableViewIcon style={{ color: 'blue', cursor: 'pointer' }} />
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
    { field: 'name', headerName: t('Route.Name'), renderHeader: renderHeaderWithHover('Route.Name'), width: 180 },
    { field: 'OnlyOnce', headerName: t('Route.OnlyOnce'), renderHeader: renderHeaderWithHover('Route.OnlyOnce'), width: 100, type: 'boolean' },
    // { field: 'parentRouteId', headerName: t('Route.ParentRouteId'), width: 220 },
  ];

    const siteColumns = [
      { field: 'name', headerName: t('SitePage.Name'), renderHeader: renderHeaderWithHover('SitePage.Name'), width: 180 },
      { field: 'description', headerName: t('SitePage.Description'), renderHeader: renderHeaderWithHover('SitePage.Description'), width: 220 },
      { field: 'nameInEnglish', headerName: t('SitePage.NameInEnglish'), renderHeader: renderHeaderWithHover('SitePage.NameInEnglish'), width: 180 },
    ];

    return { columns, routeColumns, siteColumns };
};

export default Columns;