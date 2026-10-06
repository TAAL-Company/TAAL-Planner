import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Menu, MenuItem } from '@mui/material';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import VideoGenerateDialog from '../../components/VideoGenerate/VideoGenerateDialog';
import RouteQRCodeDialog from '../../components/QRCodeWithLogo/RouteQRCodeDialog';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import { useNotification } from '../../components/Notification/NotificationProvider';
import { useTranslation } from 'react-i18next';
import { getingData_Routes, deleteRoute, getingData_Tasks, getingData_Places, getTaskPerformanceByRoute } from '../../api/api';
import RouteForm from './RouteForm';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import Columns from './Columns';
import Rows from './Rows';
import PopupTable from '../../components/PopupTable/popuptable';
import { GridActionsCellItem } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import "./style.css";
import Toolbar from '../../components/Toolbar/Toolbar';
import I18nHoverText from '../../components/I18nHoverText/I18nHoverText';

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
  const [pageSize, setPageSize] = useState(10);
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
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [videoTasksForDialog, setVideoTasksForDialog] = useState([]);
  const [videoRouteId, setVideoRouteId] = useState(null);
  const [videoRouteName, setVideoRouteName] = useState('');
  const [videoSiteName, setVideoSiteName] = useState('');
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrRoute, setQrRoute] = useState(null);

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

        // 5. Fetch task-performance per route and compute lastUsed per student
        const performancesPerRoute = await Promise.all(
          routesWithTaskDetails.map(route => getTaskPerformanceByRoute(route.id))
        );

        // Build a map: routeId -> { studentId -> latestDate }
        const routeStudentLastUsed = {};
        routesWithTaskDetails.forEach((route, idx) => {
          const perfs = Array.isArray(performancesPerRoute[idx]) ? performancesPerRoute[idx] : [];
          const studentMap = {};
          perfs.forEach(perf => {
            const sid = perf.studentId;
            if (!sid) return;
            const perfDate = new Date(perf.endTime || perf.startTime);
            if (!studentMap[sid] || perfDate > studentMap[sid]) {
              studentMap[sid] = perfDate;
            }
          });
          routeStudentLastUsed[route.id] = studentMap;
        });

        // 6. Attach lastUsed to each student in each route
        const routesEnriched = routesWithTaskDetails.map(route => ({
          ...route,
          students: Array.isArray(route.students)
            ? route.students.map(student => ({
              ...student,
              lastUsed: routeStudentLastUsed[route.id]?.[student.id]
                ? routeStudentLastUsed[route.id][student.id].toISOString()
                : null,
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
          setRoutes(routesEnriched);
        } else if (role === "EDITOR" && userId) {
          const filteredRoutes = routesEnriched.filter(route =>
            Array.isArray(route.editorIds) && route.editorIds.includes(userId)
          );
          setRoutes(filteredRoutes);
        } else if (role === "STUDENT" && userId) {
          // Filter routes where the student is included in the students array
          const filteredRoutes = routesEnriched.filter(route =>
            Array.isArray(route.students) && route.students.some(student => student.id === userId)
          );
          setRoutes(filteredRoutes);
        } else {
          setRoutes(routesEnriched);
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

  const handleOpenQRCode = () => {
    setQrRoute(selectedRoute);
    setQrDialogOpen(true);
    handleCloseMenu();
  };

  const handleCreateVideo = () => {
    setVideoRouteId(selectedRoute?.id || null);
    setVideoRouteName(selectedRoute?.name || '');
    setVideoSiteName(selectedRoute?.sites?.[0]?.nameInEnglish || selectedRoute?.sites?.[0]?.name || '');
    setVideoTasksForDialog(selectedRoute?.tasks || []);
    setVideoDialogOpen(true);
    handleCloseMenu();
  };

  const handleVideoSaved = (videoUrl) => {
    setRoutes(prevRoutes =>
      prevRoutes.map(r =>
        r.id === selectedRoute?.id ? { ...r, video_link: videoUrl } : r
      )
    );
  };

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
            <I18nHoverText translationKey="RoutePage.Routes">{t('RoutePage.Routes')}</I18nHoverText>
          </div>
          <div
            style={{
              width: '80%',
              maxWidth: '1400px',
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
              maxWidth: '1400px',
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
                <I18nHoverText translationKey="RoutePage.ADDANewRoute">{t('RoutePage.ADDANewRoute')}</I18nHoverText>
              </Button>
            </div>
            <div style={{ width: '100%', minHeight: 100 }}>
              <DataGrid
                rows={getRowsWithDetails()}
                columns={columns}
                paginationModel={{ page: 0, pageSize: pageSize }}
                onPaginationModelChange={(model) => setPageSize(model.pageSize)}
                pageSizeOptions={[10, 25, 50, 100]}
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
                slots={{
                  toolbar: Toolbar,
                }}
              />
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
                {/* <MenuItem onClick={handleClickOpenEditDialog}>{t('RoutePage.Edit')}</MenuItem> */}
                <MenuItem onClick={handleDeleteRoute}><I18nHoverText translationKey="RoutePage.Delete">{t('RoutePage.Delete')}</I18nHoverText></MenuItem>
                <MenuItem onClick={handleCreateVideo}>
                  <VideoFileIcon sx={{ mr: 1, fontSize: 18 }} />
                  <I18nHoverText translationKey="VideoGenerate.createVideo">{t('VideoGenerate.createVideo') || 'Create Video'}</I18nHoverText>
                </MenuItem>
                <MenuItem onClick={handleOpenQRCode}>
                  <QrCode2Icon sx={{ mr: 1, fontSize: 18 }} />
                  <I18nHoverText translationKey="RoutePage.GenerateQR">{t('RoutePage.GenerateQR') || 'Generate QR Code'}</I18nHoverText>
                </MenuItem>
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
                routes={routes}
                RouteAction={routeAction}
                sites={sites}
              />
              <VideoGenerateDialog
                isOpen={videoDialogOpen}
                onClose={() => setVideoDialogOpen(false)}
                tasks={videoTasksForDialog}
                isRTL={t('Direction') === 'rtl'}
                routeId={videoRouteId}
                routeName={videoRouteName}
                siteName={videoSiteName}
                onVideoSaved={handleVideoSaved}
              />
              <RouteQRCodeDialog
                open={qrDialogOpen}
                onClose={() => setQrDialogOpen(false)}
                route={qrRoute}
              />
            </div>
          </div>
        </div>
      </ThemeProvider>
    </CacheProvider>
  );
}