import React, { useState } from 'react';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Avatar,
  Chip,
  Paper,
  Divider,
  IconButton,
  Collapse,
} from '@mui/material';
import RouteIcon from '@mui/icons-material/Route';
import PersonIcon from '@mui/icons-material/Person';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { useTranslation } from 'react-i18next';
import { useTheme, ThemeProvider, createTheme } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import { cacheRtl, cacheLtr } from '../shiftPageConstants';

/**
 * ShiftTimelinePanel
 * Shows a vertical stepper timeline for a selected shift:
 *   each step = one assigned user, step content = their ordered routes.
 *
 * Props:
 *   shift   - shift object (with assignments[])
 *   users   - all users []
 *   routes  - all routes []
 */
export default function ShiftTimelinePanel({ shift, users = [], routes = [] }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isRtl = theme.direction === 'rtl';
  const muiTheme = createTheme({ direction: isRtl ? 'rtl' : 'ltr' });
  const cache = isRtl ? cacheRtl : cacheLtr;
  const [expanded, setExpanded] = useState(true);

  if (!shift) {
    return (
      <CacheProvider value={cache}>
        <ThemeProvider theme={muiTheme}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: 260,
              color: '#aaa',
              gap: 1.5,
              p: 3,
            }}
          >
            <EventNoteIcon sx={{ fontSize: 52, opacity: 0.3 }} />
            <Typography variant="body2" color="text.disabled" textAlign="center">
              {t('ShiftPage.SelectShiftToSeeTimeline', 'Select a shift to view its timeline')}
            </Typography>
          </Box>
        </ThemeProvider>
      </CacheProvider>
    );
  }

  const assignments = shift.assignments || [];

  // Build per-user ordered route list
  const steps = assignments.map((assignment) => {
    const user = users.find((u) => u.id === assignment.userId);
    const userRoutes = (assignment.routeIds || [])
      .map((rid) => routes.find((r) => r.id === rid))
      .filter(Boolean);
    return { assignment, user, userRoutes };
  });

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={muiTheme}>
      <Paper
      elevation={0}
      variant="outlined"
      sx={{ borderRadius: 2, overflow: 'hidden', height: '100%' }}
    >
      {/* Panel header */}
      <Box
        sx={{
          backgroundColor: shift.color || '#1976d2',
          color: 'white',
          px: 2,
          py: 1.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" fontWeight={700} noWrap>
            {shift.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
            <AccessTimeIcon sx={{ fontSize: 13, opacity: 0.85 }} />
            <Typography variant="caption" sx={{ opacity: 0.9, fontSize: 11 }}>
              {shift.date} · {shift.startTime} – {shift.endTime}
            </Typography>
          </Box>
        </Box>
        <IconButton
          size="small"
          sx={{ color: 'white', ml: 1 }}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        {/* Summary row */}
        <Box
          sx={{
            px: 2,
            py: 1,
            display: 'flex',
            gap: 1,
            backgroundColor: '#f7f9fb',
            borderBottom: '1px solid #eee',
          }}
        >
          <Chip
            icon={<PersonIcon sx={{ fontSize: 14 }} />}
            label={`${steps.length} ${t('ShiftPage.Users', 'users')}`}
            size="small"
            sx={{ height: 22, fontSize: 11 }}
          />
          <Chip
            icon={<RouteIcon sx={{ fontSize: 14 }} />}
            label={`${steps.reduce((a, s) => a + s.userRoutes.length, 0)} routes`}
            size="small"
            variant="outlined"
            sx={{ height: 22, fontSize: 11 }}
          />
        </Box>

        {steps.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <PersonIcon sx={{ fontSize: 36, color: '#ccc' }} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t('ShiftPage.NoAssignments', 'No staff assigned to this shift')}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ px: 1.5, py: 1.5, overflowY: 'auto', maxHeight: 480 }}>
            <Stepper orientation="vertical" nonLinear>
              {steps.map(({ assignment, user, userRoutes }, stepIndex) => (
                <Step key={assignment.userId} active={true} expanded={true}>
                  <StepLabel
                    StepIconComponent={() => (
                      <Avatar
                        src={user?.picture_url || assignment.pictureUrl}
                        sx={{
                          width: 32,
                          height: 32,
                          border: `2px solid ${shift.color || '#1976d2'}`,
                          fontSize: 13,
                          flexShrink: 0,
                        }}
                      >
                        {(user?.name || assignment.userName || '?')[0]}
                      </Avatar>
                    )}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight={600} lineHeight={1.3}>
                        {user?.name || assignment.userName || assignment.userId}
                      </Typography>
                      {user?.email && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {user.email}
                        </Typography>
                      )}
                    </Box>
                  </StepLabel>

                  <StepContent
                    sx={{
                      borderLeft: `2px solid ${shift.color || '#1976d2'}`,
                      ml: '15px',
                      pl: 1.5,
                      pb: stepIndex < steps.length - 1 ? 1.5 : 0,
                    }}
                  >
                    {userRoutes.length === 0 ? (
                      <Typography variant="caption" color="text.disabled">
                        {t('ShiftPage.NoRoutes', 'No routes assigned')}
                      </Typography>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mt: 0.5 }}>
                        {userRoutes.map((route, routeIdx) => (
                          <Box
                            key={route.id}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              backgroundColor: '#f0f4f8',
                              borderRadius: 1,
                              px: 1,
                              py: 0.5,
                            }}
                          >
                            {/* Step number bubble */}
                            <Box
                              sx={{
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                backgroundColor: shift.color || '#1976d2',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 10,
                                fontWeight: 700,
                                flexShrink: 0,
                              }}
                            >
                              {routeIdx + 1}
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="caption" fontWeight={600} noWrap display="block">
                                {route.name}
                              </Typography>
                              {route.tasks?.length > 0 && (
                                <Typography variant="caption" color="text.secondary">
                                  {route.tasks.length} tasks
                                </Typography>
                              )}
                            </Box>
                            <RouteIcon sx={{ fontSize: 14, color: shift.color || '#1976d2', opacity: 0.6, flexShrink: 0 }} />
                          </Box>
                        ))}
                      </Box>
                    )}
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Box>
        )}

        {shift.notes && (
          <>
            <Divider />
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block" fontWeight={600} sx={{ mb: 0.25 }}>
                {t('ShiftPage.Notes', 'Notes')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {shift.notes}
              </Typography>
            </Box>
          </>
        )}
      </Collapse>
    </Paper>
    </ThemeProvider>
    </CacheProvider>
  );
}
