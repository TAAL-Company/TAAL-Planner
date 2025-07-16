import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Menu, MenuItem } from '@mui/material';
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
import { GridActionsCellItem } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import "./style.css";
import Toolbar from '../Student/Toolbar';

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
          // Filter routes where the student is included in the students array
          const filteredRoutes = routesWithTaskDetails.filter(route =>
            Array.isArray(route.students) && route.students.some(student => student.id === userId)
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

  const theme = React.useMemo(() =>
    createTheme({}, t('localeText', { returnObjects: true }), existingTheme, { direction: t('Direction'), }),
    [existingTheme],
  );

  // Determine the cache to use based on the direction
  const cache = t('Direction') === 'rtl' ? cacheRtl : cacheLtr;

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <div dir={t('Direction')} style={{ minHeight: '50vh', background: '#f5f6fa', padding: '32px 0' }}>
          <div
            className="headline"
            style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              margin: '20px 0 8px 0',
              textAlign: 'center',
              letterSpacing: '0.5px',
            }}
          >
            {t('RoutePage.Routes')}
          </div>
          <div
            style={{
              width: '80%',
              maxWidth: '1200px',
              margin: '0 auto 24px auto',
              borderBottom: '2px solid #e0e0e0',
            }}
          />
          <div
            className="table"
            style={{
              background: '#fff',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              padding: '32px 20px 24px 20px',
              maxWidth: '1200px',
              margin: '0 auto',
              minHeight: '700px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '18px' }}>
              <Button
                variant="outlined"
                onClick={handleClickOpenDialog}
                sx={{
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontSize: '1rem',
                }}
              >
                {t('RoutePage.ADDANewRoute')}
              </Button>
            </div>
            <div style={{ width: '100%', minHeight: 100 }}>
              <DataGrid
                rows={getRowsWithDetails()}
                columns={columns}
                pageSize={7}
                rowsPerPageOptions={[7, 14, 20]}
                autoHeight
                loading={loading}
                sx={{
                  background: '#fafbfc',
                  borderRadius: 2,
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: 'rgb(0, 112, 166)',
                    borderBottom: '1px solid rgb(224, 224, 224)',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    color: '#fff',
                  },
                  '& .MuiDataGrid-cell': {
                    fontSize: '1rem',
                  },
                }}
                components={{
                  Toolbar: Toolbar,
                }}
              />
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
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
        </div>
      </ThemeProvider>
    </CacheProvider>
  );
}