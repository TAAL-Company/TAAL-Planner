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
import ImageIcon from '@mui/icons-material/Image'; // added
import { useTranslation } from "react-i18next";
import TaskImage from "./imageGenerate";
import PushToPlannerPopup from './pushtoplannerpopup';

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
  imageSeed, // Add imageSeed prop
  direction,
  isRTL,
  getComplexityColor
}) {
  const { t } = useTranslation();
  const [editingTask, setEditingTask] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: '', subtitle: '', estimatedTimeMinutes: 0 });
  
  // Add missing state variables for upload functionality
  const [pushToPlannerOpen, setPushToPlannerOpen] = useState(false);
  const [bulkImageTrigger, setBulkImageTrigger] = useState(0); // ensures TaskImage runs automatically
  const lastBulkTimeRef = useRef(0); // throttle to avoid too many bursts

  const formatTime = (minutes) => {
    if (minutes < 60) {
      return `~${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `~${hours}h ${remainingMinutes}min` : `~${hours}h`;
    }
  };

  // Add missing function for opening the push to planner popup
  const handleOpenSitePopup = () => {
    setPushToPlannerOpen(true);
  };

  // // added: bulk generate missing images
  // const handleGenerateMissingImages = () => {
  //   if (tasks.length === 0) return;
  //   setBulkImageTrigger(prev => prev + 1);
  // };

  const startEditingTask = (taskIndex) => {
    const task = tasks[taskIndex];
    setEditingTask(taskIndex);
    setEditFormData({
      title: task.title,
      subtitle: task.subtitle,
      estimatedTimeMinutes: task.estimatedTimeMinutes
    });
  };

  const cancelEditingTask = () => {
    setEditingTask(null);
    setEditFormData({ title: '', subtitle: '', estimatedTimeMinutes: 0 });
  };

  const saveEditedTask = () => {
    if (editingTask !== null && editFormData.title.trim()) {
      const updatedTasks = [...tasks];
      updatedTasks[editingTask] = {
        ...updatedTasks[editingTask],
        title: editFormData.title.trim(),
        subtitle: editFormData.subtitle.trim(),
        estimatedTimeMinutes: parseInt(editFormData.estimatedTimeMinutes) || 0,
        // Preserve existing picture_url when editing
        picture_url: updatedTasks[editingTask].picture_url || ''
      };
      setTasks(updatedTasks);
      setEditingTask(null);
      setEditFormData({ title: '', subtitle: '', estimatedTimeMinutes: 0 });
    }
  };

  const deleteTask = (taskIndex) => {
    const updatedTasks = tasks.filter((_, index) => index !== taskIndex);
    setTasks(updatedTasks);

    if (editingTask === taskIndex) {
      cancelEditingTask();
    } else if (editingTask > taskIndex) {
      setEditingTask(editingTask - 1);
    }
  };

  const addTaskAfter = (taskIndex) => {
    const newTask = {
      title: "New Task",
      subtitle: "Task description",
      estimatedTimeMinutes: 1,
      picture_url: '' // Initialize with empty picture_url
    };

    const insertIndex = taskIndex + 1;
    const updatedTasks = [...tasks];
    updatedTasks.splice(insertIndex, 0, newTask);
    setTasks(updatedTasks);

    if (editingTask !== null && editingTask >= insertIndex) {
      setEditingTask(editingTask + 1);
    }

    // setTimeout(() => {
    //   startEditingTask(insertIndex);
    // }, 0);
  };

  const addNewTask = () => {
    const newTask = {
      title: "New Task",
      subtitle: "Task description",
      estimatedTimeMinutes: 1,
      picture_url: '' // Initialize with empty picture_url
    };
    setTasks([...tasks, newTask]);

    // setTimeout(() => {
    //   startEditingTask(tasks.length);
    // }, 0);
  };

  const totalTime = tasks.reduce((sum, task) => sum + task.estimatedTimeMinutes, 0);

  // Automatically trigger image generation for any tasks missing an image
  useEffect(() => {
    if (!isOpen) return;
    if (!tasks || tasks.length === 0) return;

    const hasMissing = tasks.some(t => !t?.picture_url);
    if (!hasMissing) return;

    const now = Date.now();
    if (now - lastBulkTimeRef.current < 600) return; // small throttle
    lastBulkTimeRef.current = now;

    setBulkImageTrigger(prev => prev + 1);
  }, [isOpen, tasks]);

  if (!isOpen) return null;

  return (
    <>
      <Paper
        sx={{
          flex: 4,
          maxWidth: "1000px",
          bgcolor: "#2b2b2b",
          color: "white",
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
            <TaskIcon sx={{ color: "#4a9eff" }} />
            <Typography variant="h6">{t('TextGenerative.taskBreakdown')}</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* <Tooltip title={t('TextGenerative.generateMissingImages') || 'Generate missing images'}>
              <Button
                variant="outlined"
                startIcon={<ImageIcon />}
                onClick={handleGenerateMissingImages}
                disabled={tasks.length === 0}
                sx={{
                  color: "#4a9eff",
                  borderColor: "#4a9eff",
                  "&:hover": { bgcolor: "rgba(74, 158, 255, 0.1)" }
                }}
              >
                {t('TextGenerative.generateMissingImages') || 'Generate missing images'}
              </Button>
            </Tooltip> */}
            <Tooltip title={t('TextGenerative.addNewTask')}>
              <IconButton
                onClick={addNewTask}
                sx={{
                  color: "#4a9eff",
                  "&:hover": { bgcolor: "rgba(74, 158, 255, 0.1)" }
                }}
              >
                <AddCircleIcon />
              </IconButton>
            </Tooltip>
            <IconButton onClick={onClose} sx={{ color: "gray" }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        <Divider sx={{ borderColor: "#4a4a4a" }} />

        {/* Complexity Badge */}
        {complexity && (
          <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" sx={{ color: "gray" }}>{t('TextGenerative.complexity')}:</Typography>
            <Chip
              label={complexity}
              color={getComplexityColor(complexity)}
              size="small"
            />
          </Box>
        )}

        {/* Table Content */}
        <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <TableContainer sx={{ flex: 1, overflow: "auto" }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: "#3a3a3a", color: "white", fontWeight: "bold", width: "15%" }}>
                    {t('TextGenerative.image')}
                  </TableCell>
                  <TableCell sx={{ bgcolor: "#3a3a3a", color: "white", fontWeight: "bold", width: "35%" }}>
                    {t('TextGenerative.title_table')}
                  </TableCell>
                  <TableCell sx={{ bgcolor: "#3a3a3a", color: "white", fontWeight: "bold", width: "35%" }}>
                    {t('TextGenerative.subtitle_table')}
                  </TableCell>
                  <TableCell sx={{ bgcolor: "#3a3a3a", color: "white", fontWeight: "bold", width: "10%" }}>
                    {t('TextGenerative.time')}
                  </TableCell>
                  <TableCell sx={{ bgcolor: "#3a3a3a", color: "white", fontWeight: "bold", width: "5%" }}>
                    {t('TextGenerative.actions')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((task, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      "&:hover": { bgcolor: "#3a3a3a" },
                      "& td": { borderColor: "#4a4a4a" },
                      bgcolor: editingTask === index ? "rgba(74, 158, 255, 0.1)" : "transparent",
                    }}
                  >
                    {/* Image Cell */}
                    <TableCell sx={{ padding: 1 }}>
                      <TaskImage
                        tasks={tasks}
                        setTasks={setTasks}
                        taskIndex={index}
                        task={task}
                        imagePromptPrefix={imagePromptPrefix}
                        imagePromptSuffix={imagePromptSuffix}
                        imageWidth={imageWidth}
                        imageHeight={imageHeight}
                        imageModel={imageModel}
                        imageNoLogo={imageNoLogo}
                        imageSeed={imageSeed}
                        trigger={bulkImageTrigger} // auto fire for rows without images
                      />
                    </TableCell>

                    {/* Title Cell */}
                    <TableCell sx={{ color: "white", fontSize: "0.8rem", fontWeight: "bold" }}>
                      {editingTask === index ? (
                        <TextField
                          fullWidth
                          value={editFormData.title}
                          onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                          variant="outlined"
                          size="small"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              bgcolor: "#4a4a4a",
                              color: "white",
                              fontSize: "0.8rem",
                              "& fieldset": { borderColor: "#6a6a6a" },
                              "&:hover fieldset": { borderColor: "#8a8a8a" },
                              "&.Mui-focused fieldset": { borderColor: "#4a9eff" },
                            },
                          }}
                        />
                      ) : (
                        task.title
                      )}
                    </TableCell>

                    {/* Subtitle Cell */}
                    <TableCell sx={{ color: "#ccc", fontSize: "0.75rem", fontStyle: "italic" }}>
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
                              bgcolor: "#4a4a4a",
                              color: "white",
                              fontSize: "0.75rem",
                              "& fieldset": { borderColor: "#6a6a6a" },
                              "&:hover fieldset": { borderColor: "#8a8a8a" },
                              "&.Mui-focused fieldset": { borderColor: "#4a9eff" },
                            },
                          }}
                        />
                      ) : (
                        task.subtitle || "-"
                      )}
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
                              bgcolor: "#4a4a4a",
                              color: "white",
                              fontSize: "0.7rem",
                              "& fieldset": { borderColor: "#6a6a6a" },
                              "&:hover fieldset": { borderColor: "#8a8a8a" },
                              "&.Mui-focused fieldset": { borderColor: "#4a9eff" },
                            },
                          }}
                        />
                      ) : (
                        <Chip
                          label={formatTime(task.estimatedTimeMinutes)}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: "0.7rem",
                            height: "20px",
                            color: "#4a9eff",
                            borderColor: "#4a9eff"
                          }}
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
                                <IconButton
                                  size="small"
                                  onClick={saveEditedTask}
                                  sx={{
                                    color: "#4a9eff",
                                    "&:hover": { bgcolor: "rgba(74, 158, 255, 0.1)" }
                                  }}
                                >
                                  <CheckIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={t('TextGenerative.cancel')}>
                                <IconButton
                                  size="small"
                                  onClick={cancelEditingTask}
                                  sx={{
                                    color: "gray",
                                    "&:hover": { bgcolor: "rgba(128, 128, 128, 0.1)" }
                                  }}
                                >
                                  <CancelIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                            </>
                          ) : (
                            <>
                              <Tooltip title={t('TextGenerative.edit')}>
                                <IconButton
                                  size="small"
                                  onClick={() => startEditingTask(index)}
                                  sx={{
                                    color: "#4a9eff",
                                    "&:hover": { bgcolor: "rgba(74, 158, 255, 0.1)" }
                                  }}
                                >
                                  <EditIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={t('TextGenerative.delete')}>
                                <IconButton
                                  size="small"
                                  onClick={() => deleteTask(index)}
                                  sx={{
                                    color: "#ff6b35",
                                    "&:hover": { bgcolor: "rgba(255, 107, 53, 0.1)" }
                                  }}
                                >
                                  <DeleteIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                        {editingTask !== index && (
                          <Tooltip title={t('TextGenerative.addTaskAfter')}>
                            <IconButton
                              size="small"
                              onClick={() => addTaskAfter(index)}
                              sx={{
                                color: "#00e676",
                                "&:hover": { bgcolor: "rgba(0, 230, 118, 0.1)" },
                                alignSelf: "center"
                              }}
                            >
                              <PlaylistAddIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Table Footer */}
          <Box sx={{ p: 2, borderTop: "1px solid #4a4a4a" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ color: "gray", mb: 1 }}>
                  {t('TextGenerative.total')}: {tasks.length} {t('TextGenerative.tasks')}
                </Typography>
                <Typography variant="body2" sx={{ color: "#4a9eff", fontWeight: "bold" }}>
                  {t('TextGenerative.estimatedTime')}: {formatTime(totalTime)}
                </Typography>
              </Box>

              {/* Upload Button */}
              <Button
                variant="contained"
                startIcon={<CloudUploadIcon />}
                onClick={handleOpenSitePopup}
                disabled={tasks.length === 0}
                sx={{
                  bgcolor: "#4a9eff",
                  "&:hover": { bgcolor: "#3a8eef" },
                  "&:disabled": {
                    bgcolor: "#555",
                    color: "#999"
                  },
                  minWidth: "160px"
                }}
              >
                {t('PushToPlannerPopup.selectSiteAndUpload') || 'Select Site & Upload'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Push to Planner Popup */}
      <PushToPlannerPopup
        isOpen={pushToPlannerOpen}
        onClose={() => setPushToPlannerOpen(false)}
        tasks={tasks}
        complexity={complexity}
        direction={direction}
      />
    </>
  );
}