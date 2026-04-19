import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Divider,
  Button,
  IconButton,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import AddIcon from '@mui/icons-material/Add';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import { insertShift } from '../../../api/api';
import { DAYS, TEMPLATE_STORAGE_KEY, DEFAULT_TEMPLATES } from './scheduleConstants';
import { getWeekDates, toLocalDateString } from './scheduleHelpers';
import TemplateDialog from './TemplateDialog';
import TemplateCard from './TemplateCard';
import ShiftBlock from './ShiftBlock';

/*─────────────────────────────────────────────────────────────────────────*/
/* Main export                                                             */
/*─────────────────────────────────────────────────────────────────────────*/

/**
 * ShiftScheduleView
 *
 * Layout:
 *   [Templates 158px] | [Weekly Calendar — takes remaining width]
 *
 * Clicking a shift block expands its inline timeline (per-user → routes).
 * Drag a template card onto any day column to create a new shift.
 *
 * Props:
 *   shifts         []
 *   users          []
 *   routes         []
 *   selectedShift  object | null   – highlighted shift (shown expanded)
 *   onShiftClick   fn(shift)       – called when a shift block is clicked
 *   onShiftsChange fn()            – called after a new shift is added via DnD
 */
export default function ShiftScheduleView({
  shifts = [],
  users = [],
  routes = [],
  selectedShift,
  onShiftClick,
  onShiftsChange,
}) {
  const { t } = useTranslation();
  const isRtl = useTheme().direction === 'rtl';
  const [anchor, setAnchor] = useState(new Date());
  const [tplDialogOpen, setTplDialogOpen] = useState(false);

  // Templates: load from localStorage, default to DEFAULT_TEMPLATES
  const [templates, setTemplates] = useState(() => {
    try {
      const saved = localStorage.getItem(TEMPLATE_STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_TEMPLATES;
    } catch {
      return DEFAULT_TEMPLATES;
    }
  });

  const weekDates = getWeekDates(anchor);
  const todayStr  = toLocalDateString(new Date());

  const goBack    = () => { const d = new Date(anchor); d.setDate(d.getDate() - 7); setAnchor(d); };
  const goForward = () => { const d = new Date(anchor); d.setDate(d.getDate() + 7); setAnchor(d); };
  const goToday   = () => setAnchor(new Date());

  const weekLabel = (() => {
    const [first, last] = [weekDates[0], weekDates[6]];
    return `${first.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${last.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
  })();

  /* ─── DnD handler ──────────────────────────────────────────────────── */
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { droppableId } = result.destination;
    const draggableId = result.draggableId; // NOTE: top-level, NOT result.source.draggableId

    // Only create a shift when dropped onto a date column (format YYYY-MM-DD)
    if (!droppableId.match(/^\d{4}-\d{2}-\d{2}$/)) return;

    const template = templates.find((tpl) => tpl.id === draggableId);
    if (!template) return;

    insertShift({
      name:      template.name,
      date:      droppableId,
      startTime: template.startTime,
      endTime:   template.endTime,
      color:     template.color,
      notes:     '',
      assignments: [],
    });

    if (onShiftsChange) onShiftsChange();
  };

  /* ─── Add custom template ───────────────────────────────────────────── */
  const handleAddTemplate = (tpl) => {
    const newTpl   = { ...tpl, id: `tpl-custom-${Date.now()}` };
    const updated  = [...templates, newTpl];
    setTemplates(updated);
    try { localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(updated)); } catch {}
    setTplDialogOpen(false);
  };

  /* ─── Render ────────────────────────────────────────────────────────── */
  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>

          {/*──────────────── Left: Template panel ────────────────────────*/}
          <Box sx={{ width: 158, flexShrink: 0 }}>
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              sx={{ display: 'block', mb: 0.5, textTransform: 'uppercase', fontSize: 10, letterSpacing: 0.8 }}
            >
              {t('ShiftPage.Templates', 'Templates')}
            </Typography>
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{ display: 'block', mb: 1, fontSize: 10, lineHeight: 1.5 }}
            >
              {t('ShiftPage.DragToDay', 'Drag to any day →')}
            </Typography>

            {/* Draggable template list — isDropDisabled so calendar cells are the real targets */}
            <Droppable droppableId="templates" isDropDisabled>
              {(provided) => (
                <Box ref={provided.innerRef} {...provided.droppableProps}>
                  {templates.map((template, index) => (
                    <Draggable key={template.id} draggableId={template.id} index={index}>
                      {(dragProvided) => (
                        <TemplateCard template={template} provided={dragProvided} />
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>

            {/* Create template button */}
            <Button
              fullWidth
              size="small"
              startIcon={<AddIcon sx={{ fontSize: 14 }} />}
              variant="outlined"
              onClick={() => setTplDialogOpen(true)}
              sx={{
                mt: 1,
                fontSize: 11,
                borderStyle: 'dashed',
                color: 'text.secondary',
                borderColor: 'divider',
                textTransform: 'none',
                py: 0.5,
              }}
            >
              {t('ShiftPage.NewTemplate', 'New Template')}
            </Button>

            <Divider sx={{ my: 1.5 }} />
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, lineHeight: 1.55 }}>
              {t('ShiftPage.TemplateTip', 'Drop onto a day to create a shift. Click a shift to expand its timeline.')}
            </Typography>
          </Box>

          {/*──────────────── Right: Weekly calendar ──────────────────────*/}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Week navigation bar */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 0.5 }}>
              <IconButton size="small" onClick={goBack}>{isRtl ? <ChevronRightIcon /> : <ChevronLeftIcon />}</IconButton>
              <Typography variant="subtitle2" fontWeight={700} sx={{ flex: 1, textAlign: 'center' }}>
                {weekLabel}
              </Typography>
              <IconButton size="small" onClick={goForward}>{isRtl ? <ChevronLeftIcon /> : <ChevronRightIcon />}</IconButton>
              <Chip
                icon={<TodayIcon fontSize="small" />}
                label={t('ShiftPage.Today', 'Today')}
                size="small"
                onClick={goToday}
                sx={{ cursor: 'pointer' }}
              />
            </Box>

            {/* 7-day grid — each day column is a Droppable */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.75 }}>
              {weekDates.map((date) => {
                const dateStr   = toLocalDateString(date);
                const isToday   = dateStr === todayStr;
                const dayShifts = shifts.filter((s) => s.date === dateStr);

                return (
                  <Droppable droppableId={dateStr} key={dateStr}>
                    {(provided, snapshot) => (
                      <Box>
                        {/* Day header */}
                        <Box
                          sx={{
                            textAlign: 'center',
                            mb: 0.5,
                            py: 0.4,
                            borderRadius: 1,
                            backgroundColor: isToday ? '#0d4264' : 'transparent',
                            color: isToday ? 'white' : 'inherit',
                          }}
                        >
                          <Typography
                            variant="caption"
                            display="block"
                            sx={{ fontWeight: 700, fontSize: 10 }}
                          >
                            {DAYS[date.getDay()]}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: isToday ? 700 : 400, fontSize: 13 }}
                          >
                            {date.getDate()}
                          </Typography>
                        </Box>

                        {/* Drop target cell */}
                        <Paper
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          variant="outlined"
                          sx={{
                            minHeight: 130,
                            p: 0.5,
                            backgroundColor: snapshot.isDraggingOver
                              ? '#dbeeff'
                              : isToday ? '#f0f7ff' : '#fafafa',
                            borderColor: snapshot.isDraggingOver
                              ? '#1976d2'
                              : isToday ? '#0d4264' : '#e0e0e0',
                            borderStyle: snapshot.isDraggingOver ? 'dashed' : 'solid',
                            transition: 'background-color 0.15s, border-color 0.15s',
                          }}
                        >
                          {dayShifts.length === 0 && !snapshot.isDraggingOver && (
                            <Typography
                              variant="caption"
                              color="text.disabled"
                              sx={{ display: 'block', textAlign: 'center', mt: 1.5, fontSize: 10 }}
                            >
                              —
                            </Typography>
                          )}

                          {dayShifts.map((shift) => (
                            <ShiftBlock
                              key={shift.id}
                              shift={shift}
                              users={users}
                              routes={routes}
                              isSelected={selectedShift?.id === shift.id}
                              onClick={onShiftClick}
                            />
                          ))}

                          {snapshot.isDraggingOver && (
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'block',
                                textAlign: 'center',
                                color: '#1976d2',
                                fontWeight: 700,
                                mt: 0.5,
                                fontSize: 10,
                              }}
                            >
                              + Drop here
                            </Typography>
                          )}

                          {provided.placeholder}
                        </Paper>
                      </Box>
                    )}
                  </Droppable>
                );
              })}
            </Box>

            {shifts.length > 0 && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 1.5, textAlign: 'center', fontSize: 10 }}
              >
                {t('ShiftPage.ClickShiftForTimeline', 'Click a shift to expand its user & route timeline')}
              </Typography>
            )}
          </Box>

        </Box>
      </DragDropContext>

      {/* Create template dialog */}
      <TemplateDialog
        open={tplDialogOpen}
        onClose={() => setTplDialogOpen(false)}
        onSave={handleAddTemplate}
      />
    </>
  );
}
