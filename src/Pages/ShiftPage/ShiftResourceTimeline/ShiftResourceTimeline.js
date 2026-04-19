import React, { useState, useMemo, useRef } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Tooltip,
  IconButton,
  Chip,
  Popover,
} from '@mui/material';
import ChevronLeftIcon   from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon  from '@mui/icons-material/ChevronRight';
import TodayIcon         from '@mui/icons-material/Today';
import RouteIcon         from '@mui/icons-material/Route';
import AccessTimeIcon    from '@mui/icons-material/AccessTime';
import TimelineIcon      from '@mui/icons-material/Timeline';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import { cacheLtr } from '../shiftPageConstants';
import {
  LABEL_W, HOUR_W, COLUMN_W, ROW_H, HEADER_H, TIME_HEADER_H,
  VISIBLE_DAYS, MS_PER_DAY, HOUR_TICKS, MONTH, DAYS,
} from './timelineConstants';
import { midnight, addDays, buildRows, normalisePropEvents } from './timelineHelpers';
import EventBar from './EventBar';

/*─────────────────────────────────────────────────────────────────────────*/
/* Main component                                                          */
/*─────────────────────────────────────────────────────────────────────────*/

export default function ShiftResourceTimeline({
  // EventTimelinePremium-compatible props
  events: eventsProp,
  onEventsChange,
  resources: resourcesProp,
  defaultVisibleDate,
  // Internal props
  shifts = [],
  users  = [],
  routes = [],
}) {
  const { t }        = useTranslation();
  const isRtl        = useTheme().direction === 'rtl';
  const bodyScrollRef = useRef(null); // single shared horizontal scroll container

  const [anchor, setAnchor]         = useState(() => {
    const base = defaultVisibleDate || new Date();
    return new Date(base.getFullYear(), base.getMonth(), base.getDate());
  });
  const [popoverEl,    setPopoverEl]    = useState(null);
  const [popoverEvent, setPopoverEvent] = useState(null);

  /* Decide source */
  const sourceShifts = useMemo(() => {
    if (shifts.length > 0) return shifts;
    if (eventsProp && eventsProp.length > 0) return normalisePropEvents(eventsProp);
    return [];
  }, [shifts, eventsProp]);

  /* Visible days */
  const visibleDays = useMemo(
    () => Array.from({ length: VISIBLE_DAYS }, (_, i) => addDays(anchor, i)),
    [anchor],
  );
  const anchorMs  = anchor.getTime();
  const todayMs   = midnight(new Date());
  const todayStr  = new Date().toISOString().slice(0, 10);

  /* Current-time indicator */
  const nowLeft = ((Date.now() - anchorMs) / MS_PER_DAY) * COLUMN_W;
  const showNow = nowLeft >= 0 && nowLeft <= VISIBLE_DAYS * COLUMN_W;

  /* Resources */
  const resources = useMemo(() => {
    if (resourcesProp && resourcesProp.length > 0) return resourcesProp;
    const ids = new Set();
    sourceShifts.forEach((s) =>
      (s.assignments || []).forEach((a) => ids.add(a.userId)),
    );
    return users
      .filter((u) => ids.has(u.id))
      .map((u) => ({
        id:         u.id,
        title:      u.name || u.user_name || u.id,
        pictureUrl: u.picture_url,
      }));
  }, [sourceShifts, users, resourcesProp]);

  /* Row data */
  const rowData = useMemo(
    () => buildRows(sourceShifts, users),
    [sourceShifts, users],
  );

  /* Navigation */
  const goBack    = () => setAnchor((d) => addDays(d, -VISIBLE_DAYS));
  const goForward = () => setAnchor((d) => addDays(d, VISIBLE_DAYS));
  const goToday   = () => setAnchor(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));

  const rangeLabel = (() => {
    const f = visibleDays[0], l = visibleDays[VISIBLE_DAYS - 1];
    if (f.getMonth() === l.getMonth())
      return `${MONTH[f.getMonth()]} ${f.getDate()}–${l.getDate()}, ${f.getFullYear()}`;
    return `${MONTH[f.getMonth()]} ${f.getDate()} – ${MONTH[l.getMonth()]} ${l.getDate()}, ${l.getFullYear()}`;
  })();

  /* Empty state */
  if (resources.length === 0) {
    return (
      <Paper
        variant="outlined"
        sx={{
          minHeight: 340, display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexDirection: 'column', gap: 1.5, p: 4,
        }}
      >
        <TimelineIcon sx={{ fontSize: 52, opacity: 0.18 }} />
        <Typography variant="body2" color="text.disabled" textAlign="center">
          {t('ShiftPage.NoAssignments', 'No staff assigned yet.\nAssign users & routes from the Shifts tab.')}
        </Typography>
      </Paper>
    );
  }

  const timelineW = VISIBLE_DAYS * COLUMN_W;

  return (
    <Box>
      {/*──── Toolbar ─────────────────────────────────────────────────*/}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
        <IconButton size="small" onClick={goBack}>{isRtl ? <ChevronRightIcon /> : <ChevronLeftIcon />}</IconButton>
        <Typography variant="subtitle2" fontWeight={700} sx={{ flex: 1, textAlign: 'center' }}>
          {rangeLabel}
        </Typography>
        <IconButton size="small" onClick={goForward}>{isRtl ? <ChevronLeftIcon /> : <ChevronRightIcon />}</IconButton>
        <Chip
          icon={<TodayIcon fontSize="small" />}
          label={t('ShiftPage.Today', 'Today')}
          size="small" onClick={goToday} sx={{ cursor: 'pointer' }}
        />
      </Box>

      {/*──── Grid ────────────────────────────────────────────────────*/}
      <Paper
        variant="outlined"
        sx={{ borderRadius: 2, overflow: 'hidden', display: 'flex', flexDirection: isRtl ? 'row-reverse' : 'row' }}
      >
        {/*── Fixed label column ──*/}
        <Box
          sx={{
            width: LABEL_W,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            borderRight: isRtl ? 'none' : '2px solid #d0d7de',
            borderLeft: isRtl ? '2px solid #d0d7de' : 'none',
            zIndex: 2,
          }}
        >
          {/* Label header — row 1 (day names height) */}
          <Box
            sx={{
              height: HEADER_H,
              backgroundColor: '#f5f7fa',
              borderBottom: '1px solid #d0d7de',
              display: 'flex', alignItems: 'center', px: 1.75,
              flexShrink: 0,
            }}
          >
            <Typography variant="caption" fontWeight={700} color="text.secondary"
              sx={{ textTransform: 'uppercase', fontSize: 10, letterSpacing: 0.9 }}>
              {t('ShiftPage.Staff', 'Staff')}
            </Typography>
          </Box>

          {/* Label header — row 2 (hour labels height) */}
          <Box
            sx={{
              height: TIME_HEADER_H,
              backgroundColor: '#f5f7fa',
              borderBottom: '2px solid #d0d7de',
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pr: 1,
              flexShrink: 0,
            }}
          >
            <Typography variant="caption" sx={{ fontSize: 9, color: '#aaa', userSelect: 'none' }}>
              UTC
            </Typography>
          </Box>

          {/* Resource label rows */}
          <Box sx={{ overflowY: 'hidden' }}>
            {resources.map((resource, ri) => {
              const events = rowData[resource.id] || [];
              return (
                <Box
                  key={resource.id}
                  sx={{
                    height: ROW_H,
                    display: 'flex', alignItems: 'center', gap: 1,
                    px: 1.25, backgroundColor: '#fafbfc',
                    borderBottom: ri < resources.length - 1 ? '1px solid #eef0f4' : 'none',
                  }}
                >
                  <Avatar
                    src={resource.pictureUrl}
                    sx={{ width: 30, height: 30, fontSize: 12, flexShrink: 0 }}
                  >
                    {(resource.title || '').charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" fontWeight={700} noWrap
                      sx={{ fontSize: 12, display: 'block' }}>
                      {resource.title}
                    </Typography>
                    {events.length > 0 && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                        {events.length} shift{events.length !== 1 ? 's' : ''}
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/*── Single shared horizontal + vertical scroll container ──*/}
        <CacheProvider value={cacheLtr}>
        <Box
          ref={bodyScrollRef}
          onScroll={() => {/* scroll is shared — nothing else to sync */}}
          sx={{
            flex: 1,
            overflowX: 'auto',
            overflowY: 'auto',
            maxHeight: HEADER_H + TIME_HEADER_H + resources.length * ROW_H + 2,
            '&::-webkit-scrollbar': { height: 6, width: 6 },
            '&::-webkit-scrollbar-track': { background: '#f0f0f0' },
            '&::-webkit-scrollbar-thumb': { background: '#c0c8d4', borderRadius: 3 },
          }}
        >
          <Box sx={{ width: timelineW, minWidth: timelineW }}>

            {/*── Day-name header row ──*/}
            <Box
              sx={{
                display: 'flex',
                height: HEADER_H,
                backgroundColor: '#f5f7fa',
                borderBottom: '1px solid #d0d7de',
                position: 'sticky',
                top: 0,
                zIndex: 3,
              }}
            >
              {visibleDays.map((date) => {
                const ds        = date.toISOString().slice(0, 10);
                const isToday   = ds === todayStr;
                const hasShifts = sourceShifts.some((s) => s.date === ds);
                return (
                  <Box
                    key={ds}
                    sx={{
                      width: COLUMN_W, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.6,
                      borderRight: '1px solid #d6dce6',
                      backgroundColor: isToday ? '#0d4264' : 'transparent',
                      color: isToday ? 'white' : 'inherit',
                      position: 'relative', px: 1,
                    }}
                  >
                    <Typography sx={{ fontSize: 12, fontWeight: 700 }}>{DAYS[date.getDay()]}</Typography>
                    <Typography sx={{ fontSize: 18, fontWeight: isToday ? 800 : 500, lineHeight: 1 }}>{date.getDate()}</Typography>
                    <Typography sx={{ fontSize: 10, opacity: 0.65, alignSelf: 'flex-end', mb: '2px' }}>
                      {MONTH[date.getMonth()]}
                    </Typography>
                    {hasShifts && !isToday && (
                      <Box sx={{ position: 'absolute', bottom: 3, width: 5, height: 5, borderRadius: '50%', backgroundColor: '#1976d2' }} />
                    )}
                  </Box>
                );
              })}
            </Box>

            {/*── Hour-label sub-header row ──*/}
            <Box
              sx={{
                display: 'flex',
                height: TIME_HEADER_H,
                backgroundColor: '#fafbfc',
                borderBottom: '2px solid #d0d7de',
                position: 'sticky',
                top: HEADER_H,
                zIndex: 3,
              }}
            >
              {visibleDays.map((date) => {
                const ds = date.toISOString().slice(0, 10);
                return (
                  <Box
                    key={ds}
                    sx={{ width: COLUMN_W, flexShrink: 0, display: 'flex', position: 'relative', borderRight: '1px solid #d6dce6' }}
                  >
                    {HOUR_TICKS.map((h) => (
                      <Box
                        key={h}
                        sx={{
                          position: 'absolute',
                          left: (h / 24) * COLUMN_W,
                          width: HOUR_W,
                          top: 0, bottom: 0,
                          display: 'flex', alignItems: 'center',
                          pl: '3px',
                          borderLeft: h > 0 ? '1px solid #e3e8ef' : 'none',
                        }}
                      >
                        {h > 0 && (
                          <Typography
                            sx={{
                              fontSize: 9.5,
                              color: h % 6 === 0 ? '#555' : '#aaa',
                              fontWeight: h % 6 === 0 ? 700 : 400,
                              userSelect: 'none',
                              fontVariantNumeric: 'tabular-nums',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {`${String(h).padStart(2, '0')}:00`}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                );
              })}
            </Box>

            {/*── Resource rows ──*/}
            {resources.map((resource, ri) => {
              const events = rowData[resource.id] || [];
              return (
                <Box
                  key={resource.id}
                  sx={{
                    display: 'flex',
                    height: ROW_H,
                    borderBottom: ri < resources.length - 1 ? '1px solid #eef0f4' : 'none',
                    '&:hover': { backgroundColor: '#f8fafc' },
                  }}
                >
                  <Box sx={{ width: timelineW, height: '100%', position: 'relative', flexShrink: 0 }}>

                    {/* Day column backgrounds + hour tick lines */}
                    {visibleDays.map((date, di) => {
                      const ds      = date.toISOString().slice(0, 10);
                      const isToday = ds === todayStr;
                      return (
                        <Box
                          key={ds}
                          sx={{
                            position: 'absolute',
                            left: di * COLUMN_W, width: COLUMN_W, top: 0, bottom: 0,
                            borderRight: '1px solid #d6dce6',
                            backgroundColor: isToday ? 'rgba(13,66,100,0.04)' : 'transparent',
                            pointerEvents: 'none',
                          }}
                        >
                          {HOUR_TICKS.filter((h) => h > 0).map((h) => (
                            <Box
                              key={h}
                              sx={{
                                position: 'absolute',
                                left: (h / 24) * COLUMN_W,
                                top: 0, bottom: 0,
                                width: '1px',
                                backgroundColor:
                                  h % 6 === 0 ? '#c4cbd8' :
                                  h % 3 === 0 ? '#d8dde8' :
                                               '#eceff4',
                              }}
                            />
                          ))}
                        </Box>
                      );
                    })}

                    {/* Current-time vertical line */}
                    {showNow && (
                      <Box
                        sx={{
                          position: 'absolute',
                          left: nowLeft,
                          top: 6, bottom: 6,
                          width: 2,
                          backgroundColor: '#e53935',
                          borderRadius: 1,
                          zIndex: 5,
                          pointerEvents: 'none',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: -4, left: -4,
                            width: 10, height: 10,
                            borderRadius: '50%',
                            backgroundColor: '#e53935',
                          },
                        }}
                      />
                    )}

                    {/* Event bars */}
                    {events.map((event) => (
                      <EventBar
                        key={event.id}
                        event={event}
                        anchorMs={anchorMs}
                        routes={routes}
                        onOpen={(e, ev) => { setPopoverEl(e.currentTarget); setPopoverEvent(ev); }}
                      />
                    ))}

                    {/* Empty row hint */}
                    {events.length === 0 && (
                      <Typography
                        variant="caption" color="text.disabled"
                        sx={{
                          position: 'absolute', top: '50%', left: '50%',
                          transform: 'translate(-50%, -50%)',
                          fontSize: 10, userSelect: 'none', pointerEvents: 'none',
                        }}
                      >
                        —
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
        </CacheProvider>
      </Paper>

      {/*──── Event detail popover ────────────────────────────────────*/}
      <Popover
        open={Boolean(popoverEl)}
        anchorEl={popoverEl}
        onClose={() => { setPopoverEl(null); setPopoverEvent(null); }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        sx={{ '& .MuiPopover-paper': { borderRadius: 2, minWidth: 220, boxShadow: '0 8px 28px rgba(0,0,0,0.18)' } }}
      >
        {popoverEvent && (() => {
          const { shift, assignment } = popoverEvent;
          const routeObjs = (assignment?.routeIds || [])
            .map((rid) => routes.find((r) => r.id === rid))
            .filter(Boolean);
          const user = users.find((u) => u.id === assignment?.userId);

          return (
            <Box>
              {/* Coloured header */}
              <Box
                sx={{
                  backgroundColor: shift?.color || '#1976d2',
                  color: 'white', px: 2, py: 1.25,
                }}
              >
                <Typography fontWeight={700} sx={{ fontSize: 14 }}>{shift?.name}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.35 }}>
                  <AccessTimeIcon sx={{ fontSize: 12, opacity: 0.8 }} />
                  <Typography sx={{ fontSize: 11, opacity: 0.9 }}>
                    {shift?.date} · {shift?.startTime}–{shift?.endTime}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ p: 1.5 }}>
                {/* User row */}
                {user && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Avatar src={user.picture_url} sx={{ width: 26, height: 26, fontSize: 11 }} />
                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: 12 }}>
                      {user.name || user.user_name}
                    </Typography>
                  </Box>
                )}

                {/* Route list */}
                {routeObjs.length > 0 && (
                  <Box>
                    <Typography variant="caption" color="text.secondary"
                      sx={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.7, mb: 0.5, display: 'block' }}>
                      {t('ShiftPage.Routes', 'Routes')}
                    </Typography>
                    {routeObjs.map((r, i) => (
                      <Box key={r.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, py: 0.3 }}>
                        <Box sx={{
                          width: 18, height: 18, borderRadius: '50%',
                          backgroundColor: shift?.color || '#1976d2',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <Typography sx={{ fontSize: 9, color: 'white', fontWeight: 700 }}>{i + 1}</Typography>
                        </Box>
                        <Typography variant="caption" sx={{ fontSize: 11.5 }}>{r.name}</Typography>
                      </Box>
                    ))}
                  </Box>
                )}

                {routeObjs.length === 0 && (
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>
                    {t('ShiftPage.NoRoutesAssigned', 'No routes assigned')}
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })()}
      </Popover>
    </Box>
  );
}
