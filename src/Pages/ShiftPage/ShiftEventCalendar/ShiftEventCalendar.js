import React, { useState, useMemo, useCallback } from 'react';
import { Calendar, Views, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import {
  Box,
  Popover,
  IconButton,
  Typography,
  Button,
  Divider,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import ShiftTimelinePanel from '../ShiftTimelinePanel/ShiftTimelinePanel';

/*─────────────────────────────────────────────────────────────────────────*/
/* calendarUtils (inlined)                                                 */
/*─────────────────────────────────────────────────────────────────────────*/

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

function shiftToEvent(shift) {
  const dateStr = shift.date || '';
  let start = new Date(`${dateStr}T${shift.startTime || '00:00'}:00`);
  let end   = new Date(`${dateStr}T${shift.endTime   || '01:00'}:00`);

  if (isNaN(start.getTime())) start = new Date();
  // Overnight shift: endTime < startTime → add 1 day to end
  if (isNaN(end.getTime()) || end <= start) {
    end = new Date(start.getTime());
    end.setDate(end.getDate() + 1);
    const [h, m] = (shift.endTime || '06:00').split(':').map(Number);
    end.setHours(h, m, 0, 0);
  }

  return { id: shift.id, title: shift.name, start, end, resource: shift };
}

/*─────────────────────────────────────────────────────────────────────────*/
/* ShiftEvent (inlined)                                                    */
/*─────────────────────────────────────────────────────────────────────────*/

function ShiftEvent({ event }) {
  return (
    <Box sx={{ lineHeight: 1.25, px: 0.25 }}>
      <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'inherit', lineHeight: 1.3 }} noWrap>
        {event.title}
      </Typography>
      <Typography sx={{ fontSize: 9.5, opacity: 0.85, color: 'inherit' }} noWrap>
        {event.resource?.startTime}–{event.resource?.endTime}
      </Typography>
    </Box>
  );
}

/*─────────────────────────────────────────────────────────────────────────*/
/* Main export                                                             */
/*─────────────────────────────────────────────────────────────────────────*/

/**
 * ShiftEventCalendar
 *
 * Matches the props API of @mui/x-scheduler EventCalendar:
 *   events              []      – accepts shift objects (also accepts EventCalendar-style {id, title, start, end})
 *   onEventsChange      fn([])  – called with updated events list
 *   defaultVisibleDate  Date    – initial date shown
 *
 * Extra props (used when embedded inside ShiftPage):
 *   shifts              []      – raw shift objects (preferred over events)
 *   users               []
 *   routes              []
 *   selectedShift       object | null
 *   onShiftClick        fn(shift)
 */
export default function ShiftEventCalendar({
  // EventCalendar-compatible API
  events: eventsProp,
  onEventsChange,
  defaultVisibleDate,
  // ShiftPage-specific
  shifts = [],
  users = [],
  routes = [],
  selectedShift,
  onShiftClick,
  onAddShift,
  onEditShift,
  onAssignShift,
}) {
  const { t } = useTranslation();
  const isRtl = useTheme().direction === 'rtl';

  // Prefer raw shifts if provided; otherwise convert eventsProp shape
  const sourceShifts = shifts.length > 0 ? shifts : (eventsProp || []);

  const [view, setView] = useState(Views.WEEK);
  const [date, setDate] = useState(defaultVisibleDate || new Date());
  const [popoverEl,    setPopoverEl]    = useState(null);
  const [popoverShift, setPopoverShift] = useState(null);

  const calEvents = useMemo(() => sourceShifts.map(shiftToEvent), [sourceShifts]);

  /* Colour each event by shift.color */
  const eventPropGetter = useCallback((event) => ({
    style: {
      backgroundColor: event.resource?.color || '#1976d2',
      border:          'none',
      borderRadius:    '4px',
      color:           'white',
      padding:         '2px 5px',
    },
  }), []);

  /* Clicking an event opens the vertical stepper Popover */
  const handleSelectEvent = useCallback((event, e) => {
    const target = (e && (e.currentTarget || e.target)) || null;
    setPopoverEl(target);
    setPopoverShift(event.resource);
    if (onShiftClick) onShiftClick(event.resource);
  }, [onShiftClick]);

  /* Clicking an empty slot → pre-fill the form with date+time */
  const handleSelectSlot = useCallback(({ start, end }) => {
    if (!onAddShift) return;
    const pad = (n) => String(n).padStart(2, '0');
    const date      = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
    const startTime = `${pad(start.getHours())}:${pad(start.getMinutes())}`;
    const endTime   = `${pad(end.getHours())}:${pad(end.getMinutes())}`;
    onAddShift({ date, startTime, endTime });
  }, [onAddShift]);

  return (
    <>
      <Box
        sx={{
          height: 580,
          '& .rbc-calendar':         { fontFamily: 'inherit' },
          '& .rbc-header':           { fontWeight: 700, fontSize: 12, padding: '6px 4px' },
          '& .rbc-toolbar button': {
            color:        '#0d4264',
            border:       '1px solid #d0d7de',
            borderRadius: '6px',
            fontSize:     12,
            padding:      '4px 12px',
            cursor:       'pointer',
          },
          '& .rbc-toolbar button.rbc-active': {
            backgroundColor: '#0d4264',
            color:           'white',
          },
          '& .rbc-today':  { backgroundColor: '#f0f7ff' },
          '& .rbc-event':  { padding: '2px 4px' },
          '& .rbc-slot-selecting': { cursor: 'default' },
        }}
      >
        <Calendar
          localizer={localizer}
          events={calEvents}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          eventPropGetter={eventPropGetter}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          components={{ event: ShiftEvent }}
          style={{ height: '100%' }}
          popup
        />
      </Box>

      {/*──── Event Popover ────*/}
      <Popover
        open={Boolean(popoverEl)}
        anchorEl={popoverEl}
        onClose={() => { setPopoverEl(null); }}
        anchorOrigin={{ vertical: 'top', horizontal: isRtl ? 'left' : 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: isRtl ? 'right' : 'left' }}
        sx={{
          '& .MuiPopover-paper': {
            width:        320,
            borderRadius: 2,
            overflow:     'hidden',
            boxShadow:    '0 8px 32px rgba(0,0,0,0.18)',
          },
        }}
      >
        {/* Coloured header with title + action buttons */}
        <Box
          sx={{
            backgroundColor: popoverShift?.color || '#1976d2',
            color: 'white',
            px: 2,
            py: 1.25,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight={700} noWrap>
              {popoverShift?.name}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.85 }}>
              {popoverShift?.date} · {popoverShift?.startTime} – {popoverShift?.endTime}
            </Typography>
          </Box>

          {/* Edit shift */}
          <Tooltip title={t('Edit', 'Edit')}>
            <IconButton
              size="small"
              sx={{ color: 'white' }}
              onClick={() => {
                setPopoverEl(null);
                if (onEditShift) onEditShift(popoverShift);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Assign users & routes */}
          <Tooltip title={t('ShiftPage.AssignUsers', 'Assign Users & Routes')}>
            <IconButton
              size="small"
              sx={{ color: 'white' }}
              onClick={() => {
                setPopoverEl(null);
                if (onAssignShift) onAssignShift(popoverShift);
              }}
            >
              <PersonAddIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Close */}
          <IconButton
            size="small"
            onClick={() => setPopoverEl(null)}
            sx={{ color: 'white' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Divider />
        <ShiftTimelinePanel shift={popoverShift} users={users} routes={routes} />
      </Popover>
    </>
  );
}
