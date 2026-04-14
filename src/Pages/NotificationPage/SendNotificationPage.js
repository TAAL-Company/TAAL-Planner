import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ScheduleIcon from '@mui/icons-material/Schedule';
import DeleteIcon from '@mui/icons-material/Delete';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../../components/Notification/NotificationProvider';
import {
  getingData_Users,
  getingData_Routes,
  sendNotification,
  scheduleNotification,
  getScheduledNotifications,
  deleteScheduledNotification,
} from '../../api/api';

const SendNotificationPage = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();

  // Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [notifType, setNotifType] = useState('message'); // 'message' | 'route-offer'
  const [sendMode, setSendMode] = useState('now'); // 'now' | 'scheduled'
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [targetType, setTargetType] = useState('all'); // 'all' | 'users' | 'route'
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState('');

  // Data
  const [users, setUsers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [scheduledNotifications, setScheduledNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, routesData, scheduled] = await Promise.all([
        getingData_Users(),
        getingData_Routes(),
        getScheduledNotifications().catch(() => []),
      ]);
      setUsers(usersData || []);
      setRoutes(routesData || []);
      setScheduledNotifications(scheduled || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setTitle('');
    setMessage('');
    setNotifType('message');
    setSendMode('now');
    setScheduledDate('');
    setScheduledTime('');
    setTargetType('all');
    setSelectedUserIds([]);
    setSelectedRouteId('');
  };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      showNotification('warning', t('NotificationPage.fill_required_fields'));
      return;
    }

    if (sendMode === 'scheduled' && (!scheduledDate || !scheduledTime)) {
      showNotification('warning', t('NotificationPage.select_date_time'));
      return;
    }

    if (targetType === 'users' && selectedUserIds.length === 0) {
      showNotification('warning', t('NotificationPage.select_at_least_one_user'));
      return;
    }

    if ((targetType === 'route' || notifType === 'route-offer') && !selectedRouteId) {
      showNotification('warning', t('NotificationPage.select_a_route'));
      return;
    }

    const selectedRoute = routes.find((r) => r.id === selectedRouteId);
    // Read logged-in editor info from session
    const jwt = sessionStorage.getItem('jwt');
    const jwtEditor = sessionStorage.getItem('jwt-EDITOR');
    const parsedJwt = jwt ? JSON.parse(jwt) : null;
    const parsedEditor = jwtEditor && jwtEditor !== 'undefined' ? JSON.parse(jwtEditor) : null;

    const payload = {
      title: title.trim(),
      message: message.trim(),
      type: notifType,
      targetType,
      userIds: targetType === 'users' ? selectedUserIds : undefined,
      routeId: (targetType === 'route' || notifType === 'route-offer') ? selectedRouteId : undefined,
      routeName: (targetType === 'route' || notifType === 'route-offer') ? selectedRoute?.name : undefined,
      createdById: parsedEditor?.id || parsedJwt?.id || undefined,
      createdByName: parsedEditor?.name || parsedJwt?.name || undefined,
    };

    setSending(true);

    try {
      if (sendMode === 'now') {
        await sendNotification(payload);
        showNotification('success', t('NotificationPage.notification_sent'));
      } else {
        const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
        await scheduleNotification({ ...payload, scheduledAt });
        showNotification('success', t('NotificationPage.notification_scheduled'));
        // Refresh scheduled list
        const updated = await getScheduledNotifications().catch(() => []);
        setScheduledNotifications(updated || []);
      }
      resetForm();
    } catch (err) {
      console.error('Error sending notification:', err);
      showNotification('error', t('NotificationPage.notification_error'));
    }

    setSending(false);
  };

  const handleDeleteScheduled = async (id) => {
    try {
      await deleteScheduledNotification(id);
      setScheduledNotifications((prev) => prev.filter((n) => n.id !== id));
      showNotification('success', t('NotificationPage.scheduled_deleted'));
    } catch (err) {
      showNotification('error', t('NotificationPage.error_deleting_scheduled'));
    }
  };

  // Build a minimum datetime string for the date picker (now)
  const nowDateStr = new Date().toISOString().split('T')[0];

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <NotificationsActiveIcon sx={{ fontSize: 32, color: '#0d4264' }} />
        <Typography variant="h5" fontWeight="bold" color="#0d4264">
          {t('NotificationPage.title')}
        </Typography>
      </Box>

      {/* Compose card */}
      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Notification title */}
          <TextField
            label={t('NotificationPage.notification_title')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
          />

          {/* Message body */}
          <TextField
            label={t('NotificationPage.message')}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            fullWidth
            multiline
            rows={3}
            required
          />

          {/* Notification type */}
          <FormControl>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {t('NotificationPage.notification_type')}
            </Typography>
            <RadioGroup row value={notifType} onChange={(e) => setNotifType(e.target.value)}>
              <FormControlLabel
                value="message"
                control={<Radio />}
                label={t('NotificationPage.type_message')}
              />
              <FormControlLabel
                value="route-offer"
                control={<Radio />}
                label={t('NotificationPage.type_route_offer')}
              />
            </RadioGroup>
          </FormControl>

          {/* Route selector for route-offer type */}
          {notifType === 'route-offer' && targetType !== 'route' && (
            <FormControl fullWidth>
              <InputLabel>{t('NotificationPage.select_route')}</InputLabel>
              <Select
                value={selectedRouteId}
                onChange={(e) => setSelectedRouteId(e.target.value)}
                label={t('NotificationPage.select_route')}
              >
                {routes.map((route) => (
                  <MenuItem key={route.id} value={route.id}>
                    {route.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Target audience */}
          <FormControl>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {t('NotificationPage.send_to')}
            </Typography>
            <RadioGroup row value={targetType} onChange={(e) => setTargetType(e.target.value)}>
              <FormControlLabel
                value="all"
                control={<Radio />}
                label={t('NotificationPage.all_users')}
              />
              <FormControlLabel
                value="users"
                control={<Radio />}
                label={t('NotificationPage.specific_users')}
              />
              <FormControlLabel
                value="route"
                control={<Radio />}
                label={t('NotificationPage.by_route')}
              />
            </RadioGroup>
          </FormControl>

          {/* User selector */}
          {targetType === 'users' && (
            <FormControl fullWidth>
              <InputLabel>{t('NotificationPage.select_users')}</InputLabel>
              <Select
                multiple
                value={selectedUserIds}
                onChange={(e) => setSelectedUserIds(e.target.value)}
                label={t('NotificationPage.select_users')}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((id) => {
                      const user = users.find((u) => u.id === id);
                      return <Chip key={id} label={user?.name || id} size="small" />;
                    })}
                  </Box>
                )}
              >
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    <Checkbox checked={selectedUserIds.indexOf(user.id) > -1} />
                    <ListItemText primary={user.name} secondary={user.email} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Route selector */}
          {targetType === 'route' && (
            <FormControl fullWidth>
              <InputLabel>{t('NotificationPage.select_route')}</InputLabel>
              <Select
                value={selectedRouteId}
                onChange={(e) => setSelectedRouteId(e.target.value)}
                label={t('NotificationPage.select_route')}
              >
                {routes.map((route) => (
                  <MenuItem key={route.id} value={route.id}>
                    {route.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Send mode toggle */}
          <FormControl>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {t('NotificationPage.when')}
            </Typography>
            <RadioGroup row value={sendMode} onChange={(e) => setSendMode(e.target.value)}>
              <FormControlLabel
                value="now"
                control={<Radio />}
                label={t('NotificationPage.send_now')}
              />
              <FormControlLabel
                value="scheduled"
                control={<Radio />}
                label={t('NotificationPage.schedule_later')}
              />
            </RadioGroup>
          </FormControl>

          {/* Scheduled date/time pickers */}
          {sendMode === 'scheduled' && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label={t('NotificationPage.date')}
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: nowDateStr }}
                sx={{ flex: 1 }}
              />
              <TextField
                label={t('NotificationPage.time')}
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1 }}
              />
            </Box>
          )}

          {/* Send button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleSend}
              disabled={sending}
              startIcon={sendMode === 'now' ? <SendIcon /> : <ScheduleIcon />}
              sx={{ backgroundColor: '#0d4264', '&:hover': { backgroundColor: '#0a3350' } }}
            >
              {sending
                ? t('NotificationPage.sending')
                : sendMode === 'now'
                ? t('NotificationPage.send_now')
                : t('NotificationPage.schedule')}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Scheduled notifications table */}
      {scheduledNotifications.length > 0 && (
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, color: '#0d4264' }}>
              <ScheduleIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              {t('NotificationPage.scheduled_notifications')}
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell><b>{t('NotificationPage.notification_title')}</b></TableCell>
                    <TableCell><b>{t('NotificationPage.message')}</b></TableCell>
                    <TableCell><b>{t('NotificationPage.send_to')}</b></TableCell>
                    <TableCell><b>{t('NotificationPage.scheduled_for')}</b></TableCell>
                    <TableCell align="center"><b>{t('NotificationPage.actions')}</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {scheduledNotifications.map((n) => (
                    <TableRow key={n.id}>
                      <TableCell>{n.title}</TableCell>
                      <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {n.message}
                      </TableCell>
                      <TableCell>
                        {n.targetType === 'all'
                          ? t('NotificationPage.all_users')
                          : n.targetType === 'route'
                          ? t('NotificationPage.by_route')
                          : `${n.userIds?.length || 0} ${t('NotificationPage.users')}`}
                      </TableCell>
                      <TableCell>{new Date(n.scheduledAt).toLocaleString()}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDeleteScheduled(n.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default SendNotificationPage;
