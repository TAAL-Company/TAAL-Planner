import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  Avatar,
  Divider,
  TextField,
  InputAdornment,
  Badge,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import RouteIcon from '@mui/icons-material/Route';
import { useTranslation } from 'react-i18next';
import { useTheme, ThemeProvider, createTheme } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import { cacheRtl, cacheLtr } from '../shiftPageConstants';

/**
 * ShiftAssignmentDialog
 * Allows assigning users to a shift and selecting routes per user.
 *
 * Props:
 *   open       - boolean
 *   onClose    - fn
 *   shift      - current shift object
 *   users      - all available users []
 *   routes     - all available routes []
 *   onSave     - fn(assignments) where assignments = [{ userId, userName, pictureUrl, routeIds }]
 */
export default function ShiftAssignmentDialog({ open, onClose, shift, users = [], routes = [], onSave }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isRtl = theme.direction === 'rtl';
  const muiTheme = createTheme({ direction: isRtl ? 'rtl' : 'ltr' });
  const cache = isRtl ? cacheRtl : cacheLtr;
  // assignments: Map<userId, { routeIds: Set<routeId> }>
  const [selectedUsers, setSelectedUsers] = useState({});
  const [userSearch, setUserSearch] = useState('');
  const [routeSearch, setRouteSearch] = useState('');
  const [expandedUser, setExpandedUser] = useState(null);

  // Initialise from existing shift assignments
  useEffect(() => {
    if (open && shift) {
      const init = {};
      (shift.assignments || []).forEach((a) => {
        init[a.userId] = { routeIds: new Set(a.routeIds || []) };
      });
      setSelectedUsers(init);
      setUserSearch('');
      setRouteSearch('');
      setExpandedUser(null);
    }
  }, [open, shift]);

  const toggleUser = (userId) => {
    setSelectedUsers((prev) => {
      const next = { ...prev };
      if (next[userId]) {
        delete next[userId];
        if (expandedUser === userId) setExpandedUser(null);
      } else {
        next[userId] = { routeIds: new Set() };
        setExpandedUser(userId);
      }
      return next;
    });
  };

  const toggleRoute = (userId, routeId) => {
    setSelectedUsers((prev) => {
      const userEntry = { ...prev[userId], routeIds: new Set(prev[userId]?.routeIds || []) };
      if (userEntry.routeIds.has(routeId)) {
        userEntry.routeIds.delete(routeId);
      } else {
        userEntry.routeIds.add(routeId);
      }
      return { ...prev, [userId]: userEntry };
    });
  };

  const handleSave = () => {
    const assignments = Object.entries(selectedUsers).map(([userId, { routeIds }]) => {
      const user = users.find((u) => u.id === userId);
      return {
        userId,
        userName: user?.name || user?.user_name || userId,
        pictureUrl: user?.picture_url || '',
        routeIds: Array.from(routeIds),
      };
    });
    onSave(assignments);
  };

  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.user_name || '').toLowerCase().includes(q)
    );
  });

  const filteredRoutes = routes.filter((r) => {
    const q = routeSearch.toLowerCase();
    return (r.name || '').toLowerCase().includes(q);
  });

  const assignedCount = Object.keys(selectedUsers).length;

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={muiTheme}>
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { minHeight: '70vh' } }}>
      <DialogTitle sx={{ backgroundColor: '#0d4264', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
        <PersonAddIcon />
        <Box>
          <Typography variant="h6" component="span">
            {t('ShiftPage.AssignUsersRoutes', 'Assign Users & Routes')}
          </Typography>
          {shift && (
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              {shift.name} — {shift.date} {shift.startTime}–{shift.endTime}
            </Typography>
          )}
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 2 }}>
        {/* Summary chips */}
        {assignedCount > 0 && (
          <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {t('ShiftPage.Assigned', 'Assigned')}:
            </Typography>
            {Object.entries(selectedUsers).map(([uid, { routeIds }]) => {
              const user = users.find((u) => u.id === uid);
              return (
                <Chip
                  key={uid}
                  avatar={<Avatar src={user?.picture_url} sx={{ width: 20, height: 20 }} />}
                  label={`${user?.name || user?.user_name} (${routeIds.size} routes)`}
                  size="small"
                  onDelete={() => toggleUser(uid)}
                  sx={{ backgroundColor: '#e3f0fa' }}
                />
              );
            })}
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
          {/* Left — Users list */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              {t('ShiftPage.SelectUsers', 'Select Users')}
            </Typography>
            <TextField
              size="small"
              placeholder={t('ShiftPage.SearchUsers', 'Search users…')}
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              fullWidth
              sx={{ mb: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ maxHeight: 380, overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: 1 }}>
              {filteredUsers.map((user) => {
                const isSelected = !!selectedUsers[user.id];
                const routeCount = selectedUsers[user.id]?.routeIds?.size || 0;
                return (
                  <Box
                    key={user.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      px: 1.5,
                      py: 0.75,
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#e3f0fa' : 'transparent',
                      '&:hover': { backgroundColor: isSelected ? '#cfe2f3' : '#f5f5f5' },
                      borderBottom: '1px solid #f0f0f0',
                    }}
                    onClick={() => toggleUser(user.id)}
                  >
                    <Checkbox
                      checked={isSelected}
                      size="small"
                      sx={{ p: 0.5 }}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleUser(user.id)}
                    />
                    <Avatar src={user.picture_url} sx={{ width: 32, height: 32, mx: 1 }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" noWrap fontWeight={isSelected ? 600 : 400}>
                        {user.name || user.user_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {user.email}
                      </Typography>
                    </Box>
                    {isSelected && routeCount > 0 && (
                      <Chip
                        icon={<RouteIcon sx={{ fontSize: 14 }} />}
                        label={routeCount}
                        size="small"
                        color="primary"
                        sx={{ height: 20, fontSize: 11 }}
                      />
                    )}
                  </Box>
                );
              })}
              {filteredUsers.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                  {t('ShiftPage.NoUsers', 'No users found')}
                </Typography>
              )}
            </Box>
          </Box>

          <Divider orientation="vertical" flexItem />

          {/* Right — Route assignment per user */}
          <Box sx={{ flex: 1.2, minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              {t('ShiftPage.AssignRoutes', 'Assign Routes per User')}
            </Typography>
            <TextField
              size="small"
              placeholder={t('ShiftPage.SearchRoutes', 'Search routes…')}
              value={routeSearch}
              onChange={(e) => setRouteSearch(e.target.value)}
              fullWidth
              sx={{ mb: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ maxHeight: 380, overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: 1 }}>
              {Object.keys(selectedUsers).length === 0 && (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <PersonAddIcon sx={{ fontSize: 40, color: '#ccc', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {t('ShiftPage.SelectUserFirst', 'Select a user on the left to assign routes')}
                  </Typography>
                </Box>
              )}
              {Object.keys(selectedUsers).map((userId) => {
                const user = users.find((u) => u.id === userId);
                const isExpanded = expandedUser === userId;
                const assignedRouteIds = selectedUsers[userId]?.routeIds || new Set();
                return (
                  <Accordion
                    key={userId}
                    expanded={isExpanded}
                    onChange={() => setExpandedUser(isExpanded ? null : userId)}
                    disableGutters
                    elevation={0}
                    sx={{ borderBottom: '1px solid #e0e0e0', '&:before': { display: 'none' } }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 48 }}>
                      <Avatar src={user?.picture_url} sx={{ width: 28, height: 28, mr: 1 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>
                        {user?.name || user?.user_name}
                      </Typography>
                      <Badge badgeContent={assignedRouteIds.size} color="primary" sx={{ mr: 2 }}>
                        <RouteIcon fontSize="small" color="action" />
                      </Badge>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0, pb: 1 }}>
                      {filteredRoutes.length === 0 && (
                        <Typography variant="caption" color="text.secondary">
                          {t('ShiftPage.NoRoutes', 'No routes found')}
                        </Typography>
                      )}
                      {filteredRoutes.map((route) => (
                        <FormControlLabel
                          key={route.id}
                          control={
                            <Checkbox
                              size="small"
                              checked={assignedRouteIds.has(route.id)}
                              onChange={() => toggleRoute(userId, route.id)}
                            />
                          }
                          label={
                            <Typography variant="body2">
                              {route.name}
                              {route.tasks?.length > 0 && (
                                <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                                  ({route.tasks.length} tasks)
                                </Typography>
                              )}
                            </Typography>
                          }
                          sx={{ display: 'flex', ml: 0 }}
                        />
                      ))}
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          {t('Cancel', 'Cancel')}
        </Button>
        <Button onClick={handleSave} variant="contained" sx={{ backgroundColor: '#0d4264' }}>
          {t('Save', 'Save')} ({assignedCount} {t('ShiftPage.Users', 'users')})
        </Button>
      </DialogActions>
        </Dialog>
      </ThemeProvider>
    </CacheProvider>
  );
}
