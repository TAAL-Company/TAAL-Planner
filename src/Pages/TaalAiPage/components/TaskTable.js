import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider, Chip, Tooltip, Button } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import TaskIcon from '@mui/icons-material/Task';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import TuneIcon from '@mui/icons-material/Tune';
import { useTranslation } from "react-i18next";
import TaskImage from "./imageGenerate";
import PushToPlannerPopup from './pushtoplannerpopup';
import BreakTaskDialog from './BreakTaskDialog';
import VideoGenerateDialog from '../../../components/VideoGenerate/VideoGenerateDialog';
import ImageContextPopup from './ImageContextPopup';

export default function TaskTable({
  isOpen,
  onClose,
  tasks,
  setTasks,
  complexity,
  imagePromptPrefix,
  imagePromptSuffix,
  imageWidth,
  imageHeight,
  imageModel,
  imageNoLogo,
  imageSeed,
  originalPrompt = "",  // ← NEW: user's original prompt that generated these tasks
  // Global image context set via the "Configure Image Context" general popup.
  // When set it overrides GPT auto-enrichment for all tasks.
  globalImageContext = null,
  setGlobalImageContext,
  taskImageContexts = {},
  setTaskImageContexts,
  direction,
  isRTL,
  getComplexityColor,
  theme
}) {
  const { t } = useTranslation();

  // Default theme if not provided
  const colors = theme || {
    backgroundSecondary: '#2b2b2b',
    backgroundTertiary: '#3a3a3a',
    text: '#ffffff',
    textSecondary: '#cccccc',
    textMuted: 'gray',
    border: '#4a4a4a',
    primary: '#4a9eff',
    primaryHover: '#3a8eef',
    accent: '#ff6b35',
  };

  const [editingTask, setEditingTask] = useState(null);
  const [editFormData, setEditFormData] = useState({ station: '', title: '', subtitle: '', estimatedTimeMinutes: 0 });
  const [pushToPlannerOpen, setPushToPlannerOpen] = useState(false);
  const [bulkImageTrigger, setBulkImageTrigger] = useState(0);
  const [isGeneralContextPopupOpen, setIsGeneralContextPopupOpen] = useState(false);
  const lastBulkTimeRef = useRef(0);
  const [breakTaskDialogOpen, setBreakTaskDialogOpen] = useState(false);
  const [taskToBreak, setTaskToBreak] = useState(null);
  const [taskToBreakIndex, setTaskToBreakIndex] = useState(null);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const pendingRouteResolveRef = useRef(null);

  // Opens PushToPlannerPopup and resolves with { id, name } once the route is created.
  // Used by VideoGenerateDialog to create the route before saving the video.
  const getRouteId = () => new Promise((resolve, reject) => {
    pendingRouteResolveRef.current = { resolve, reject };
    setPushToPlannerOpen(true);
  });

  const handleRouteCreated = (id, name) => {
    if (pendingRouteResolveRef.current) {
      pendingRouteResolveRef.current.resolve({ id, name });
      pendingRouteResolveRef.current = null;
    }
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `~${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `~${hours}h ${remainingMinutes}min` : `~${hours}h`;
  };

  const handleOpenSitePopup = () => setPushToPlannerOpen(true);

  const startEditingTask = (taskIndex) => {
    const task = tasks[taskIndex];
    setEditingTask(taskIndex);
    setEditFormData({
      station: (task.station || '').toString(),
      title: task.title,
      subtitle: task.subtitle,
      estimatedTimeMinutes: task.estimatedTimeMinutes
    });
  };

  const cancelEditingTask = () => {
    setEditingTask(null);
    setEditFormData({ station: '', title: '', subtitle: '', estimatedTimeMinutes: 0 });
  };

  const saveEditedTask = () => {
    if (editingTask !== null && editFormData.title.trim()) {
      const updatedTasks = [...tasks];
      updatedTasks[editingTask] = {
        ...updatedTasks[editingTask],
        station: (editFormData.station || '').toString().trim(),
        title: editFormData.title.trim(),
        subtitle: editFormData.subtitle.trim(),
        estimatedTimeMinutes: parseInt(editFormData.estimatedTimeMinutes) || 0,
        picture_url: updatedTasks[editingTask].picture_url || ''
      };
      setTasks(updatedTasks);
      setEditingTask(null);
      setEditFormData({ station: '', title: '', subtitle: '', estimatedTimeMinutes: 0 });
    }
  };

  const deleteTask = (taskIndex) => {
    const updatedTasks = tasks.filter((_, index) => index !== taskIndex);
    setTasks(updatedTasks);
    if (editingTask === taskIndex) cancelEditingTask();
    else if (editingTask > taskIndex) setEditingTask(editingTask - 1);
  };

  // Small helper to hand every new task a stable, unique identity.
  // Everything downstream (row keys, image generation) matches on this id
  // instead of array position, so reordering/adding/deleting tasks can
  // never cause an in-flight image to land on the wrong row.
  const makeTaskId = () => `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const addTaskAfter = (taskIndex) => {
    const defaultStation = (tasks?.[taskIndex]?.station || tasks?.[tasks.length - 1]?.station || 'Station 1').toString();
    const newTask = { id: makeTaskId(), station: defaultStation, title: "New Task", subtitle: "Task description", estimatedTimeMinutes: 1, picture_url: '' };
    const insertIndex = taskIndex + 1;
    const updatedTasks = [...tasks];
    updatedTasks.splice(insertIndex, 0, newTask);
    setTasks(updatedTasks);
    if (editingTask !== null && editingTask >= insertIndex) setEditingTask(editingTask + 1);
  };

  const addNewTask = () => {
    const defaultStation = (tasks?.[tasks.length - 1]?.station || 'Station 1').toString();
    const newTask = { id: makeTaskId(), station: defaultStation, title: "New Task", subtitle: "Task description", estimatedTimeMinutes: 1, picture_url: '' };
    setTasks([...tasks, newTask]);
  };

  const handleBreakTask = (taskIndex) => {
    setTaskToBreak(tasks[taskIndex]);
    setTaskToBreakIndex(taskIndex);
    setBreakTaskDialogOpen(true);
  };

  const handleTasksBreak = (taskIndex, subtasks) => {
    const idBase = tasks?.[taskIndex]?.id || makeTaskId();
    const subtasksWithIds = subtasks.map((st, i) => ({ id: `${idBase}-${i}-${makeTaskId()}`, ...st }));
    const updatedTasks = [...tasks];
    // Remove the original task and insert subtasks in its place
    updatedTasks.splice(taskIndex, 1, ...subtasksWithIds);
    setTasks(updatedTasks);
    setBreakTaskDialogOpen(false);
    setTaskToBreak(null);
    setTaskToBreakIndex(null);
  };

  const totalTime = tasks.reduce((sum, task) => sum + task.estimatedTimeMinutes, 0);

  // Automatically trigger image generation for tasks missing an image
  useEffect(() => {
    if (!isOpen) return;
    if (!tasks || tasks.length === 0) return;
    const hasMissing = tasks.some(t => !t?.picture_url);
    if (!hasMissing) return;
    const now = Date.now();
    if (now - lastBulkTimeRef.current < 600) return;
    lastBulkTimeRef.current = now;
    setBulkImageTrigger(prev => prev + 1);
  }, [isOpen, tasks]);

  if (!isOpen) return null;

  return (
    <>
      <Paper
        sx={{
          flex: 4,
          maxWidth: "1400px",
          bgcolor: colors.backgroundSecondary,
          color: colors.text,
          borderRadius: "15px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transition: "all 0.3s ease",
          direction: direction,
        }}
      >
        {/* Table Header */}
        <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TaskIcon sx={{ color: colors.primary }} />
            <Typography variant="h6">{t('TextGenerative.taskBreakdown')}</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip title={t('TextGenerative.addNewTask')}>
              <IconButton onClick={addNewTask} sx={{ color: colors.primary, "&:hover": { bgcolor: `${colors.primary}1A` } }}>
                <AddCircleIcon />
              </IconButton>
            </Tooltip>
            <IconButton onClick={onClose} sx={{ color: colors.textMuted }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        <Divider sx={{ borderColor: colors.border }} />

        {/* Complexity Badge */}
        {complexity && (
          <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" sx={{ color: colors.textMuted }}>{t('TextGenerative.complexity')}:</Typography>
            <Chip label={complexity} color={getComplexityColor(complexity)} size="small" />
          </Box>
        )}

        {/* Table Content */}
        <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <TableContainer sx={{ flex: 1, overflow: "auto" }}>
            <Table size="small" sx={{ textAlign: isRTL ? "right" : "left" }} stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: colors.backgroundTertiary, color: colors.text, fontWeight: "bold", width: "14%", textAlign: isRTL ? "right" : "left" }}>
                    {t('TextGenerative.image')}
                  </TableCell>
                  <TableCell sx={{ bgcolor: colors.backgroundTertiary, color: colors.text, fontWeight: "bold", width: "14%", textAlign: isRTL ? "right" : "left" }}>
                    {t('TextGenerative.station') || 'Station'}
                  </TableCell>
                  <TableCell sx={{ bgcolor: colors.backgroundTertiary, color: colors.text, fontWeight: "bold", width: "27%", textAlign: isRTL ? "right" : "left" }}>
                    {t('TextGenerative.title_table')}
                  </TableCell>
                  <TableCell sx={{ bgcolor: colors.backgroundTertiary, color: colors.text, fontWeight: "bold", width: "30%", textAlign: isRTL ? "right" : "left" }}>
                    {t('TextGenerative.subtitle_table')}
                  </TableCell>
                  <TableCell sx={{ bgcolor: colors.backgroundTertiary, color: colors.text, fontWeight: "bold", width: "10%", textAlign: isRTL ? "right" : "left" }}>
                    {t('TextGenerative.time')}
                  </TableCell>
                  <TableCell sx={{ bgcolor: colors.backgroundTertiary, color: colors.text, fontWeight: "bold", width: "5%", textAlign: isRTL ? "right" : "left" }}>
                    {t('TextGenerative.actions')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((task, index) => (
                  <TableRow
                    key={task.id || index}
                    sx={{
                      "&:hover": { bgcolor: colors.backgroundTertiary },
                      "& td": { borderColor: colors.border },
                      bgcolor: editingTask === index ? `${colors.primary}1A` : "transparent",
                    }}
                  >
                    {/* Image Cell */}
                    <TableCell sx={{ padding: 1 }}>
                      <TaskImage
                        key={task.id || index}
                        tasks={tasks}
                        setTasks={setTasks}
                        taskIndex={index}
                        taskId={task.id}
                        task={task}
                        imagePromptPrefix={imagePromptPrefix}
                        imagePromptSuffix={imagePromptSuffix}
                        imageWidth={imageWidth}
                        imageHeight={imageHeight}
                        imageModel={imageModel}
                        imageNoLogo={imageNoLogo}
                        imageSeed={imageSeed}
                        originalPrompt={originalPrompt}  // ← forwarded
                        globalImageContext={globalImageContext}
                        taskImageContext={taskImageContexts[task.id] || null}
                        onTaskImageContextChange={(context) => {
                          if (!setTaskImageContexts || !task.id) return;
                          setTaskImageContexts(prev => ({ ...prev, [task.id]: context }));
                        }}
                        theme={theme}
                        isRTL={isRTL}
                        trigger={bulkImageTrigger}
                      />
                    </TableCell>

                    {/* Station Cell */}
                    <TableCell sx={{ color: colors.textSecondary, fontSize: "0.95rem", textAlign: isRTL ? "right" : "left" }}>
                      {editingTask === index ? (
                        <TextField
                          fullWidth
                          value={editFormData.station}
                          onChange={(e) => setEditFormData({ ...editFormData, station: e.target.value })}
                          variant="outlined"
                          size="small"
                          placeholder={t('TextGenerative.station') || 'Station'}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              bgcolor: colors.border, color: colors.text, fontSize: "0.95rem",
                              "& fieldset": { borderColor: colors.borderHover || colors.border },
                              "&:hover fieldset": { borderColor: colors.textMuted },
                              "&.Mui-focused fieldset": { borderColor: colors.primary },
                            },
                          }}
                        />
                      ) : (
                        task.station?.toString().trim() ? task.station : '-'
                      )}
                    </TableCell>

                    {/* Title Cell */}
                    <TableCell sx={{ color: colors.text, fontSize: "1rem", fontWeight: "bold", textAlign: isRTL ? "right" : "left" }}>
                      {editingTask === index ? (
                        <TextField
                          fullWidth
                          value={editFormData.title}
                          onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                          variant="outlined"
                          size="small"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              bgcolor: colors.border, color: colors.text, fontSize: "1rem",
                              "& fieldset": { borderColor: colors.borderHover || colors.border },
                              "&:hover fieldset": { borderColor: colors.textMuted },
                              "&.Mui-focused fieldset": { borderColor: colors.primary },
                            },
                          }}
                        />
                      ) : task.title}
                    </TableCell>

                    {/* Subtitle Cell */}
                    <TableCell sx={{ color: colors.textSecondary, fontSize: "1rem", fontStyle: "italic", textAlign: isRTL ? "right" : "left" }}>
                      {editingTask === index ? (
                        <TextField
                          fullWidth
                          value={editFormData.subtitle}
                          onChange={(e) => setEditFormData({ ...editFormData, subtitle: e.target.value })}
                          variant="outlined"
                          size="small"
                          placeholder="Task description"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              bgcolor: colors.border, color: colors.text, fontSize: "1rem",
                              "& fieldset": { borderColor: colors.borderHover || colors.border },
                              "&:hover fieldset": { borderColor: colors.textMuted },
                              "&.Mui-focused fieldset": { borderColor: colors.primary },
                            },
                          }}
                        />
                      ) : (task.subtitle || "-")}
                    </TableCell>

                    {/* Time Cell */}
                    <TableCell>
                      {editingTask === index ? (
                        <TextField
                          type="number"
                          value={editFormData.estimatedTimeMinutes}
                          onChange={(e) => setEditFormData({ ...editFormData, estimatedTimeMinutes: e.target.value })}
                          variant="outlined"
                          size="small"
                          inputProps={{ min: 1, max: 999 }}
                          sx={{
                            width: "80px",
                            "& .MuiOutlinedInput-root": {
                              bgcolor: colors.border, color: colors.text, fontSize: "0.9rem",
                              "& fieldset": { borderColor: colors.borderHover || colors.border },
                              "&:hover fieldset": { borderColor: colors.textMuted },
                              "&.Mui-focused fieldset": { borderColor: colors.primary },
                            },
                          }}
                        />
                      ) : (
                        <Chip
                          label={formatTime(task.estimatedTimeMinutes)}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: "0.9rem", height: "20px", color: colors.primary, borderColor: colors.primary }}
                        />
                      )}
                    </TableCell>

                    {/* Actions Cell */}
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 0.5, flexDirection: "column" }}>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          {editingTask === index ? (
                            <>
                              <Tooltip title={t('TextGenerative.save')}>
                                <IconButton size="small" onClick={saveEditedTask} sx={{ color: colors.primary, "&:hover": { bgcolor: `${colors.primary}1A` } }}>
                                  <CheckIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={t('TextGenerative.cancel')}>
                                <IconButton size="small" onClick={cancelEditingTask} sx={{ color: colors.textMuted, "&:hover": { bgcolor: "rgba(128,128,128,0.1)" } }}>
                                  <CancelIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                            </>
                          ) : (
                            <>
                              <Tooltip title={t('TextGenerative.edit')}>
                                <IconButton size="small" onClick={() => startEditingTask(index)} sx={{ color: colors.primary, "&:hover": { bgcolor: `${colors.primary}1A` } }}>
                                  <EditIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={t('TextGenerative.delete')}>
                                <IconButton size="small" onClick={() => deleteTask(index)} sx={{ color: colors.accent, "&:hover": { bgcolor: `${colors.accent}1A` } }}>
                                  <DeleteIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                        {editingTask !== index && (
                          <Box sx={{ display: "flex", gap: 0.5 }}>
                            <Tooltip title={t('TextGenerative.addTaskAfter')}>
                              <IconButton size="small" onClick={() => addTaskAfter(index)} sx={{ color: "#00e676", "&:hover": { bgcolor: "rgba(0,230,118,0.1)" }, alignSelf: "center" }}>
                                <PlaylistAddIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t('TextGenerative.breakTask') || 'Break into Subtasks'}>
                              <IconButton size="small" onClick={() => handleBreakTask(index)} sx={{ color: "#ffb74d", "&:hover": { bgcolor: "rgba(255,183,77,0.1)" }, alignSelf: "center" }}>
                                <CallSplitIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Table Footer */}
          <Box sx={{ p: 2, borderTop: `1px solid ${colors.border}` }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ color: colors.textMuted, mb: 1 }}>
                  {t('TextGenerative.total')}: {tasks.length} {t('TextGenerative.tasks')}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.primary, fontWeight: "bold" }}>
                  {t('TextGenerative.estimatedTime')}: {formatTime(totalTime)}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {/* General image context popup button */}
                <Button
                  variant="outlined"
                  startIcon={<TuneIcon />}
                  onClick={() => setIsGeneralContextPopupOpen(true)}
                  disabled={tasks.length === 0}
                  sx={{
                    color: globalImageContext ? colors.accent : colors.primary,
                    borderColor: globalImageContext ? colors.accent : colors.primary,
                    bgcolor: globalImageContext ? `${colors.accent}11` : 'transparent',
                    "&:hover": { bgcolor: globalImageContext ? `${colors.accent}22` : `${colors.primary}1A` },
                    "&:disabled": { borderColor: colors.border, color: colors.textMuted },
                    minWidth: "160px"
                  }}
                >
                  {globalImageContext
                    ? (t('ImageContext.contextSet', 'Context Set') + ' ✓')
                    : (t('ImageContext.configureContext', 'Configure Image Context'))}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<VideoFileIcon />}
                  onClick={() => setVideoDialogOpen(true)}
                  disabled={tasks.length === 0}
                  sx={{
                    color: colors.primary,
                    borderColor: colors.primary,
                    "&:hover": { bgcolor: `${colors.primary}1A`, borderColor: colors.primaryHover },
                    "&:disabled": { borderColor: colors.border, color: colors.textMuted },
                    minWidth: "140px"
                  }}
                >
                  {t('VideoGenerate.createVideo') || 'Create Video'}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                  onClick={handleOpenSitePopup}
                  disabled={tasks.length === 0}
                  sx={{
                    bgcolor: colors.primary,
                    "&:hover": { bgcolor: colors.primaryHover },
                    "&:disabled": { bgcolor: colors.border, color: colors.textMuted },
                    minWidth: "160px"
                  }}
                >
                  {t('PushToPlannerPopup.selectSiteAndUpload') || 'Select Site & Upload'}
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* General Image Context Popup */}
      <ImageContextPopup
        open={isGeneralContextPopupOpen}
        onClose={() => setIsGeneralContextPopupOpen(false)}
        onGenerate={(ctx) => {
          if (setGlobalImageContext) setGlobalImageContext(ctx);
          setBulkImageTrigger(prev => prev + 1);
        }}
        mode="general"
        tasks={tasks}
        originalPrompt={originalPrompt}
        initialContext={globalImageContext}
        theme={theme}
        isRTL={isRTL}
      />

      {/* Push to Planner Popup */}
      <PushToPlannerPopup
        isOpen={pushToPlannerOpen}
        onClose={() => {
          if (pendingRouteResolveRef.current) {
            pendingRouteResolveRef.current.reject(new Error('cancelled'));
            pendingRouteResolveRef.current = null;
          }
          setPushToPlannerOpen(false);
        }}
        tasks={tasks}
        complexity={complexity}
        direction={direction}
        onRouteCreated={handleRouteCreated}
      />

      {/* Video Generate Dialog */}
      <VideoGenerateDialog
        isOpen={videoDialogOpen}
        onClose={() => setVideoDialogOpen(false)}
        tasks={tasks}
        isRTL={isRTL}
        getRouteId={getRouteId}
        onVideoSaved={() => {}}
        theme={theme}
      />

      {/* Break Task Dialog */}
      <BreakTaskDialog
        isOpen={breakTaskDialogOpen}
        onClose={() => {
          setBreakTaskDialogOpen(false);
          setTaskToBreak(null);
          setTaskToBreakIndex(null);
        }}
        task={taskToBreak}
        taskIndex={taskToBreakIndex}
        onTasksBreak={handleTasksBreak}
        complexity={complexity}
        theme={theme}
        direction={direction}
        isRTL={isRTL}
      />
    </>
  );
}