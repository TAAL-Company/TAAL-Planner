import React from 'react';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TableViewIcon from '@mui/icons-material/TableView';
import { useTranslation } from 'react-i18next';
import I18nHoverText from '../../components/I18nHoverText/I18nHoverText';

const Columns = ({ handleClickMenu, expandedRows, handleSectionExpandToggle }) => {
  const { t } = useTranslation();
  // DataGrid headerName stays a plain string (used for sorting/column menu a11y text); renderHeader adds the hover.
  const renderHeaderWithHover = (key) => () => (
    <I18nHoverText translationKey={key}>{t(key)}</I18nHoverText>
  );

  const columns = [
    {
      field: 'picture_url',
      headerName: t('SitePage.Avatar'),
      renderHeader: renderHeaderWithHover('SitePage.Avatar'),
      width: 100,
      renderCell: (params) => <Avatar alt="Site" src={params.value} />,
    },
    { field: 'name', headerName: t('SitePage.Name'), renderHeader: renderHeaderWithHover('SitePage.Name'), width: 150 },
    { field: 'description', headerName: t('SitePage.Description'), renderHeader: renderHeaderWithHover('SitePage.Description'), width: 200 },
    { field: 'nameInEnglish', headerName: t('SitePage.NameInEnglish'), renderHeader: renderHeaderWithHover('SitePage.NameInEnglish'), width: 180 },
    {
      field: 'expand_students',
      headerName: t('SitePage.Users'),
      renderHeader: renderHeaderWithHover('SitePage.Users'),
      width: 100,
      renderCell: (params) => {
        const hasStudents = params.row.students && params.row.students.length > 0;
        if (!hasStudents) return null;
        return (
          <div onClick={() => handleSectionExpandToggle(params.row.id, 'students', params.row)}>
            <TableViewIcon style={{ color: 'black', cursor: 'pointer' }} />
          </div>
        );
      },
    },
    {
      field: 'expand_routes',
      headerName: t('SitePage.Routes'),
      renderHeader: renderHeaderWithHover('SitePage.Routes'),
      width: 100,
      renderCell: (params) => {
        const hasRoutes = params.row.routes && params.row.routes.length > 0;
        if (!hasRoutes) return null;
        return (
          <div onClick={() => handleSectionExpandToggle(params.row.id, 'routes', params.row)}>
            <TableViewIcon style={{ color: 'blue', cursor: 'pointer' }} />
          </div>
        );
      },
    },
    {
      field: 'expand_tasks',
      headerName: t('SitePage.Tasks'),
      renderHeader: renderHeaderWithHover('SitePage.Tasks'),
      width: 100,
      renderCell: (params) => {
        const hasTasks = params.row.tasks && params.row.tasks.length > 0;
        if (!hasTasks) return null;
        return (
          <div onClick={() => handleSectionExpandToggle(params.row.id, 'tasks', params.row)}>
            <TableViewIcon style={{ color: 'orange', cursor: 'pointer' }} />
          </div>
        );
      },
    },
    {
      field: 'expand_stations',
      headerName: t('SitePage.Stations'),
      renderHeader: renderHeaderWithHover('SitePage.Stations'),
      width: 100,
      renderCell: (params) => {
        const hasStations = params.row.stations && params.row.stations.length > 0;
        if (!hasStations) return null;
        return (
          <div onClick={() => handleSectionExpandToggle(params.row.id, 'stations', params.row)}>
            <TableViewIcon style={{ color: 'red', cursor: 'pointer' }} />
          </div>
        );
      },
    },
    {
      field: 'expand_editors',
      headerName: t('SitePage.Editors'),
      renderHeader: renderHeaderWithHover('SitePage.Editors'),
      width: 100,
      renderCell: (params) => {
        const hasEditors = params.row.editors && params.row.editors.length > 0;
        if (!hasEditors) return null;
        return (
          <div onClick={() => handleSectionExpandToggle(params.row.id, 'editors', params.row)}>
            <TableViewIcon style={{ color: 'teal', cursor: 'pointer' }} />
          </div>
        );
      },
    },
    {
      field: 'created_at',
      headerName: t('SitePage.CreatedAt'),
      renderHeader: renderHeaderWithHover('SitePage.CreatedAt'),
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

  // Sub-table columns for each section
  const taskColumns = [
    { field: 'title', headerName: t('Task.title'), renderHeader: renderHeaderWithHover('Task.title'), width: 180 },
    { field: 'subtitle', headerName: t('Task.subtitle'), renderHeader: renderHeaderWithHover('Task.subtitle'), width: 220 },
    { field: 'picture_url', headerName: t('Task.picture_url'), renderHeader: renderHeaderWithHover('Task.picture_url'), width: 100, renderCell: (params) => params.value ? <img src={params.value} alt="" style={{ width: 40, height: 40 }} /> : null },
    { field: 'estimatedTimeSeconds', headerName: t('Task.estimatedTimeSeconds'), renderHeader: renderHeaderWithHover('Task.estimatedTimeSeconds'), width: 140 },
    { field: 'taskType', headerName: t('Task.taskType'), renderHeader: renderHeaderWithHover('Task.taskType'), width: 100 },
  ];

  const routeColumns = [
    { field: 'name', headerName: t('Route.Name'), renderHeader: renderHeaderWithHover('Route.Name'), width: 180 },
    { field: 'OnlyOnce', headerName: t('Route.OnlyOnce'), renderHeader: renderHeaderWithHover('Route.OnlyOnce'), width: 100, type: 'boolean' },
    { field: 'parentRouteId', headerName: t('Route.ParentRouteId'), renderHeader: renderHeaderWithHover('Route.ParentRouteId'), width: 220 },
  ];

  const stationColumns = [
    { field: 'title', headerName: t('Station.title'), renderHeader: renderHeaderWithHover('Station.title'), width: 160 },
    { field: 'subtitle', headerName: t('Station.subtitle'), renderHeader: renderHeaderWithHover('Station.subtitle'), width: 220 },
    // { field: 'parentSiteId', headerName: t('Station.ParentSiteId'), width: 220 },
  ];

  const studentColumns = [
    { field: 'name', headerName: t('UserPage.Name'), renderHeader: renderHeaderWithHover('UserPage.Name'), width: 120 },
    { field: 'user_name', headerName: t('UserPage.Username'), renderHeader: renderHeaderWithHover('UserPage.Username'), width: 140 },
    { field: 'email', headerName: t('UserPage.Email'), renderHeader: renderHeaderWithHover('UserPage.Email'), width: 180 },
    { field: 'phone', headerName: t('UserPage.Phone'), renderHeader: renderHeaderWithHover('UserPage.Phone'), width: 120 },
    { field: 'role', headerName: t('UserPage.Role'), renderHeader: renderHeaderWithHover('UserPage.Role'), width: 100 },
    { field: 'lastLoginAt', headerName: t('UserPage.LastLoginAt'), renderHeader: renderHeaderWithHover('UserPage.LastLoginAt'), width: 160, valueGetter: (value) => { if (!value) return ''; const d = new Date(value); return d.toLocaleDateString('en-GB') + ', ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); } },
    { field: 'createdAt', headerName: t('UserPage.CreatedAt'), renderHeader: renderHeaderWithHover('UserPage.CreatedAt'), width: 160, valueGetter: (value) => { if (!value) return ''; const d = new Date(value); return d.toLocaleDateString('en-GB') + ', ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); } },
  ];

  const editorColumns = [
    { field: 'name', headerName: t('Editor.Name'), renderHeader: renderHeaderWithHover('Editor.Name'), width: 120 },
    { field: 'email', headerName: t('Editor.Email'), renderHeader: renderHeaderWithHover('Editor.Email'), width: 180 },
    { field: 'googleID', headerName: t('Editor.GoogleID'), renderHeader: renderHeaderWithHover('Editor.GoogleID'), width: 120 },
    { field: 'phone', headerName: t('Editor.Phone'), renderHeader: renderHeaderWithHover('Editor.Phone'), width: 120 },
    { field: 'role', headerName: t('Editor.Role'), renderHeader: renderHeaderWithHover('Editor.Role'), width: 100 },
  ];

  return { columns, taskColumns, routeColumns, stationColumns, studentColumns, editorColumns };
};

export default Columns;