import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Tab,
  Tabs,
  Paper,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  AvatarGroup,
  Chip,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TableChartIcon from '@mui/icons-material/TableChart';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RouteIcon from '@mui/icons-material/Route';
import TimelineIcon from '@mui/icons-material/Timeline';
import ShiftTimelinePanel from './ShiftTimelinePanel/ShiftTimelinePanel';
import { useTranslation } from 'react-i18next';
import { CacheProvider } from '@emotion/react';
import { useTheme, ThemeProvider, createTheme } from '@mui/material/styles';
import { cacheRtl, cacheLtr } from './shiftPageConstants'; // kept at root
import TabPanel from './TabPanel';

import {
  getShifts,
  insertShift,
  updateShift,
  deleteShift,
  updateShiftAssignments,
  getingData_Users,
  getingData_Routes,
} from '../../api/api';
import { useNotification } from '../../components/Notification/NotificationProvider';
import ShiftForm from './ShiftForm/ShiftForm';
import ShiftAssignmentDialog from './ShiftAssignmentDialog/ShiftAssignmentDialog';
import ShiftEventCalendar from './ShiftEventCalendar/ShiftEventCalendar';
import ShiftResourceTimeline from './ShiftResourceTimeline/ShiftResourceTimeline';
import './style.css';

export default function ShiftPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isRtl = theme.direction === 'rtl';
  const { showNotification } = useNotification();

  const [shifts, setShifts] = useState([]);
  const [users, setUsers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [tab, setTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedShift, setSelectedShift] = useState(null); // for menu/edit context
  const [timelineShift, setTimelineShift] = useState(null); // for timeline/stepper panel

  // ShiftForm dialog
  const [formOpen, setFormOpen] = useState(false);
  const [formAction, setFormAction] = useState('add'); // 'add' | 'edit'
  const [formTitle, setFormTitle] = useState('');

  // Assignment dialog
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignShift, setAssignShift] = useState(null);

  // Load shifts from localStorage, users + routes from API
  const loadData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [usersData, routesData] = await Promise.all([
        getingData_Users(),
        getingData_Routes(),
      ]);
      setUsers(usersData || []);
      setRoutes(routesData || []);
    } catch (err) {
      console.error('Failed to load users/routes', err);
    }
    setShifts(getShifts());
    setLoadingData(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ---- Shift CRUD ---- */
  const handleOpenAdd = () => {
    setFormAction('add');
    setFormTitle(t('ShiftPage.NewShift', 'New Shift'));
    setSelectedShift(null);
    setFormOpen(true);
    setAnchorEl(null);
  };

  const handleOpenEdit = (shift) => {
    setFormAction('edit');
    setFormTitle(t('ShiftPage.EditShift', 'Edit Shift'));
    setSelectedShift(shift);
    setFormOpen(true);
    setAnchorEl(null);
  };

  const handleFormSave = (formData) => {
    if (formAction === 'add') {
      const created = insertShift(formData);
      setShifts(getShifts());
      showNotification('success', t('ShiftPage.ShiftCreated', 'Shift created'));
    } else {
      updateShift(selectedShift.id, formData);
      setShifts(getShifts());
      showNotification('success', t('ShiftPage.ShiftUpdated', 'Shift updated'));
    }
    setFormOpen(false);
  };

  const handleDelete = (shift) => {
    deleteShift(shift.id);
    setShifts(getShifts());
    setAnchorEl(null);
    showNotification('success', t('ShiftPage.ShiftDeleted', 'Shift deleted'));
  };

  /* ---- Assignment ---- */
  const handleOpenAssign = (shift) => {
    setAssignShift(shift);
    setAssignOpen(true);
    setAnchorEl(null);
  };

  const handleAssignSave = (assignments) => {
    updateShiftAssignments(assignShift.id, assignments);
    setShifts(getShifts());
    setAssignOpen(false);
    showNotification('success', t('ShiftPage.AssignmentsSaved', 'Assignments saved'));
  };

  /* ---- Menu ---- */
  const handleMenuOpen = (event, shift) => {
    setAnchorEl(event.currentTarget);
    setSelectedShift(shift);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  /* ---- DataGrid columns ---- */
  const columns = [
    {
      field: 'color',
      headerName: '',
      width: 16,
      sortable: false,
      renderCell: (params) => (
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: params.value || '#1976d2',
            mx: 'auto',
          }}
        />
      ),
    },
    { field: 'name', headerName: t('ShiftPage.ShiftName', 'Shift Name'), flex: 1.2, minWidth: 140 },
    { field: 'date', headerName: t('ShiftPage.Date', 'Date'), width: 120 },
    {
      field: 'time',
      headerName: t('ShiftPage.Time', 'Time'),
      width: 130,
      valueGetter: (params) => `${params.row.startTime} – ${params.row.endTime}`,
    },
    {
      field: 'assignments',
      headerName: t('ShiftPage.AssignedStaff', 'Assigned Staff'),
      flex: 1.5,
      minWidth: 180,
      sortable: false,
      renderCell: (params) => {
        const assignments = params.value || [];
        if (assignments.length === 0) {
          return (
            <Typography variant="caption" color="text.secondary">
              {t('ShiftPage.NoStaff', 'None')}
            </Typography>
          );
        }
        const usersInShift = assignments
          .map((a) => users.find((u) => u.id === a.userId))
          .filter(Boolean);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AvatarGroup
              max={4}
              sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: 11 } }}
            >
              {usersInShift.map((u) => (
                <Tooltip key={u.id} title={u.name || u.user_name}>
                  <Avatar src={u.picture_url} sx={{ width: 24, height: 24 }} />
                </Tooltip>
              ))}
            </AvatarGroup>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
              {assignments.length}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'routes',
      headerName: t('ShiftPage.Routes', 'Routes'),
      width: 90,
      sortable: false,
      renderCell: (params) => {
        const total = (params.row.assignments || []).reduce(
          (acc, a) => acc + (a.routeIds?.length || 0), 0
        );
        return total > 0 ? (
          <Chip
            icon={<RouteIcon sx={{ fontSize: 14 }} />}
            label={total}
            size="small"
            variant="outlined"
            color="primary"
          />
        ) : (
          <Typography variant="caption" color="text.secondary">—</Typography>
        );
      },
    },
    { field: 'notes', headerName: t('ShiftPage.Notes', 'Notes'), flex: 1, minWidth: 120 },
    {
      field: 'timeline',
      headerName: t('ShiftPage.Timeline', 'Timeline'),
      width: 90,
      sortable: false,
      renderCell: (params) => (
        <Tooltip title={t('ShiftPage.ViewTimeline', 'View timeline')}>
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); setTimelineShift(params.row); setTab(2); }}
            sx={{ color: timelineShift?.id === params.row.id ? '#0d4264' : 'inherit' }}
          >
            <TimelineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
    {
      field: 'actions',
      headerName: '',
      width: 60,
      sortable: false,
      renderCell: (params) => (
        <IconButton size="small" onClick={(e) => handleMenuOpen(e, params.row)}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  const muiTheme = createTheme({ direction: isRtl ? 'rtl' : 'ltr' });
  const cache = isRtl ? cacheRtl : cacheLtr;

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={muiTheme}>
      <Box dir={isRtl ? 'rtl' : 'ltr'} sx={{ p: 3 }}>
      {/* Page header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" fontWeight={700} color="#0d4264">
          {t('ShiftPage.Title', 'Shift Manager')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{ backgroundColor: '#0d4264', '&:hover': { backgroundColor: '#0a3250' } }}
        >
          {t('ShiftPage.NewShift', 'New Shift')}
        </Button>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ borderBottom: '1px solid #e0e0e0' }}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab icon={<TableChartIcon fontSize="small" />} iconPosition="start" label={t('ShiftPage.Shifts', 'Shifts')} />
          <Tab icon={<CalendarMonthIcon fontSize="small" />} iconPosition="start" label={t('ShiftPage.Scheduler', 'Scheduler')} />
          <Tab icon={<TimelineIcon fontSize="small" />} iconPosition="start" label={t('ShiftPage.Timeline', 'Timeline')} />
        </Tabs>
      </Paper>

      {loadingData ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Tab 0 — Shifts DataGrid + Timeline side panel */}
          <TabPanel value={tab} index={0}>
            <Paper>
              <DataGrid
                rows={shifts}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                autoHeight
                disableSelectionOnClick
                onRowClick={(params) => setTimelineShift(params.row)}
                sx={{
                  '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f0f4f8', fontWeight: 700 },
                  '& .MuiDataGrid-row': { cursor: 'pointer' },
                  '& .MuiDataGrid-row.Mui-selected': { backgroundColor: '#e3f0fa' },
                }}
                selectionModel={timelineShift ? [timelineShift.id] : []}
                localeText={{
                  noRowsLabel: t('ShiftPage.NoShifts', 'No shifts yet — click "New Shift" to get started'),
                }}
              />
            </Paper>
          </TabPanel>

          {/* Tab 1 — Scheduler (EventCalendar) */}
          {/* Clicking a shift event opens the vertical stepper inline as a popover */}
          <TabPanel value={tab} index={1}>
            <Paper sx={{ p: 2 }}>
              <ShiftEventCalendar
                shifts={shifts}
                users={users}
                routes={routes}
                selectedShift={timelineShift}
                onShiftClick={(shift) => setTimelineShift(shift)}
                defaultVisibleDate={new Date()}
                onAddShift={(prefill) => {
                  setFormAction('add');
                  setFormTitle(t('ShiftPage.NewShift', 'New Shift'));
                  setSelectedShift(prefill && prefill.date ? prefill : null);
                  setFormOpen(true);
                }}
                onEditShift={(shift) => handleOpenEdit(shift)}
                onAssignShift={(shift) => handleOpenAssign(shift)}
              />
            </Paper>
          </TabPanel>

          {/* Tab 2 — Timeline (resource timeline: user rows × shift events) */}
          <TabPanel value={tab} index={2}>
            <Paper sx={{ p: 2 }}>
              <ShiftResourceTimeline
                shifts={shifts}
                users={users}
                routes={routes}
                defaultVisibleDate={timelineShift ? new Date(`${timelineShift.date}T${timelineShift.startTime}`) : new Date()}
              />
            </Paper>
          </TabPanel>
        </>
      )}

      {/* Row action menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            handleOpenAssign(selectedShift);
          }}
        >
          <PersonAddIcon fontSize="small" sx={{ mr: 1 }} />
          {t('ShiftPage.AssignUsers', 'Assign Users & Routes')}
        </MenuItem>
        <MenuItem onClick={() => handleOpenEdit(selectedShift)}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          {t('Edit', 'Edit')}
        </MenuItem>
        <MenuItem
          onClick={() => handleDelete(selectedShift)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          {t('Delete', 'Delete')}
        </MenuItem>
      </Menu>

      {/* ShiftForm */}
      <ShiftForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleFormSave}
        initialValues={selectedShift}
        title={formTitle}
      />

      {/* Assignment dialog */}
      <ShiftAssignmentDialog
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        shift={assignShift}
        users={users}
        routes={routes}
        onSave={handleAssignSave}
      />
    </Box>
    </ThemeProvider>
    </CacheProvider>
  );
}
