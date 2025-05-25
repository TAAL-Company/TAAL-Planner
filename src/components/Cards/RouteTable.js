import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Menu, MenuItem, Toolbar } from '@mui/material';
import { useNotification } from '../Notification/NotificationProvider';
import { useTranslation } from 'react-i18next';
import { getingData_Routes, deleteRoute, getingData_Tasks, getingData_Places } from '../../api/api';
import RouteForm from './RouteForm';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import Columns from './Columns';
import Rows from './Rows';
import PopupTable from '../placesCards/popuptable';


// Create rtl cache
const cacheRtl = createCache({
  key: 'data-grid-rtl-demo',
  stylisPlugins: [prefixer, rtlPlugin],
});

// Create ltr cache
const cacheLtr = createCache({
  key: 'data-grid-ltr-demo',
  stylisPlugins: [prefixer],
});

export default function RouteTable() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [title, setTitle] = useState('');
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupSection, setPopupSection] = useState('');
  const [popupRow, setPopupRow] = useState(null);
  const [routeAction, setRouteAction] = useState('add');
  const [sites, setSites] = useState([]);
  const { showNotification } = useNotification();
  const { t } = useTranslation();

  const handleClickMenu = (event, route) => {
    setAnchorEl(event.currentTarget);
    setSelectedRoute(route);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedRoute(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRoute(null);
    setAnchorEl(null);
    setRouteAction('add');
  };

  const handleClickOpenDialog = () => {
    setOpenDialog(true);
    setTitle(t('RoutePage.ADDANewRoute'));
    setSelectedRoute(null);
    setRouteAction('add');
  };

  const handleClickOpenEditDialog = () => {
    setOpenDialog(true);
    setTitle(t('RoutePage.EditRouteInfo'));
    setRouteAction('edit');
  };

  const handlePopupOpen = (section, row) => {
    setPopupSection(section);
    if (section === 'tasks' && Array.isArray(row.tasks)) {
      row = { ...row, tasks: [...row.tasks].sort((a, b) => a.position - b.position) };
    }
    setPopupRow(row);
    setPopupOpen(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch all routes
        const routesData = await getingData_Routes();

        // 2. Collect all unique task IDs from all routes
        const allTaskIds = Array.from(
          new Set(
            routesData.flatMap(route =>
              Array.isArray(route.tasks) ? route.tasks.map(t => t.taskId) : []
            )
          )
        );

        // 3. Fetch all tasks by IDs
        let tasksMap = {};
        if (allTaskIds.length > 0) {
          const tasksDetails = await getingData_Tasks(allTaskIds);
          tasksMap = tasksDetails.reduce((acc, task) => {
            acc[task.id] = task;
            return acc;
          }, {});
        }

        // 4. Attach full task objects to each route's tasks array
        const routesWithTaskDetails = routesData.map(route => ({
          ...route,
          tasks: Array.isArray(route.tasks)
            ? route.tasks.map(t => ({
                ...t,
                ...tasksMap[t.taskId], // Merge task details by taskId
              }))
            : [],
        }));

        // Role-based filtering
        const jwt = sessionStorage.getItem('jwt');
        const jwtEditor = sessionStorage.getItem('jwt-EDITOR');

        let role = null;
        let userId = null;

        if (jwt) {
          try {
            role = JSON.parse(jwt)?.role;
          } catch (error) {
            console.error("Failed to parse JWT:", error);
          }
        }

        if (jwtEditor) {
          try {
            userId = JSON.parse(jwtEditor)?.id;
          } catch (error) {
            console.error("Failed to parse JWT-EDITOR:", error);
          }
        }

        if (role === "ADMIN") {
          setRoutes(routesWithTaskDetails);
        } else if (role === "EDITOR" && userId) {
          const filteredRoutes = routesWithTaskDetails.filter(route =>
            Array.isArray(route.editorIds) && route.editorIds.includes(userId)
          );
          setRoutes(filteredRoutes);
        } else if (role === "STUDENT" && userId) {
          const filteredRoutes = routesWithTaskDetails.filter(route =>
            Array.isArray(route.studentIds) && route.studentIds.includes(userId)
          );
          setRoutes(filteredRoutes);
        } else {
          setRoutes(routesWithTaskDetails);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSites = async () => {
      const sitesData = await getingData_Places();
      setSites(sitesData);
    };

    fetchData();
    fetchSites();
  }, []);

  const handleDeleteRoute = async () => {
    try {
      await deleteRoute(selectedRoute.id);
      showNotification('success', t('Success_delete_route'));
      setRoutes(prevRoutes => prevRoutes.filter(route => route.id !== selectedRoute.id));
      handleCloseMenu();
    } catch (error) {
      console.error(error.message);
      showNotification('error', t('Error_delete_route'));
    }
  };

  const { getRowsWithDetails } = Rows({ routes });
  const columnsObj = Columns({ handleClickMenu, handlePopupOpen });
  const { columns, taskColumns, studentColumns } = columnsObj;

  const existingTheme = useTheme();
  const theme = createTheme({
    direction: t('Direction'),
  });

  const cache = t('Direction') === 'rtl' ? cacheRtl : cacheLtr;

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <div dir={t('Direction')} style={{ textAlign: '-webkit-center' }}>
          <Button
            style={{ marginTop: '14px', marginBottom: '14px' }}
            variant="outlined"
            onClick={handleClickOpenDialog}
          >
            {t('RoutePage.ADDANewRoute')}
          </Button>
          <div style={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={getRowsWithDetails()}
              columns={columns}
              pageSize={12}
              autoHeight
              loading={loading}
              components={{
                Toolbar: Toolbar,
              }}
            />
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
              {/* <MenuItem onClick={handleClickOpenEditDialog}>{t('RoutePage.Edit')}</MenuItem> */}
              <MenuItem onClick={handleDeleteRoute}>{t('RoutePage.Delete')}</MenuItem>
            </Menu>

            <PopupTable
              open={popupOpen}
              onClose={() => setPopupOpen(false)}
              section={popupSection}
              row={popupRow}
              columnsMap={{
                taskColumns,
                studentColumns,
              }}
            />

            <RouteForm
              open={openDialog}
              handleCloseDialog={handleCloseDialog}
              title={title}
              initialValues={selectedRoute}
              setRoutes={setRoutes}
              RouteAction={routeAction}
              sites={sites}
            />
          </div>
        </div>
      </ThemeProvider>
    </CacheProvider>
  );
}