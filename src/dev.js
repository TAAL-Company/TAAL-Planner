import React, { useEffect, useState, useRef } from "react";
import axios from 'axios';
import {
  getingData_Places,
  uploadFiles,
  updateTask,
  generateAzureImage,
  getingData_Users,
  getingData_Routes,
  getingData_TasksbyIds,
  postTask_Performance,
} from './api/api';
import { useTranslator } from './Utility/TranslationProvider';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { Box, Button, CircularProgress, Backdrop, Typography, Select, MenuItem, FormControl, InputLabel, Checkbox, ListItemText, Tabs, Tab, TextField, Alert, Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress, Chip, Divider } from '@mui/material';

// Create rtl cache
const cacheRtl = createCache({
  key: 'dev-rtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

// Create ltr cache
const cacheLtr = createCache({
  key: 'dev-ltr',
  stylisPlugins: [prefixer],
});

const COLOR_RAMPS = ['#1D9E75', '#378ADD', '#D4537E', '#BA7517', '#7F77DD', '#D85A30'];

// Extracted component so the hook is called at component level
function TaskCard({ task, index, selectedSite, onTaskUpdated }) {
  const { translate } = useTranslator();
  const [translatedPrompt, setTranslatedPrompt] = useState(null);
  const [tTitle, setTTitle] = useState("");
  const [tSubtitle, setTSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState(task.picture_url || null); // Initialize with existing image
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [hasUploadedNewImage, setHasUploadedNewImage] = useState(false); // Track if we uploaded a NEW image in this session
  const [editablePrompt, setEditablePrompt] = useState(""); // User-editable prompt
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);

  // Image prompt settings (similar to TaalAi)
  const imagePromptPrefix = "A highly realistic photo of a person performing the task: " ;
  const imagePromptSuffix = 'The scene should look natural and immersive, fitting the task context (e.g., office, workshop, or classroom). Use natural lighting, realistic details, and authentic atmosphere. Ultra-realistic, cinematic composition, shallow depth of field, detailed textures, and no visible text or written words.';

  // Generate image using Azure
  const generateImage = async (promptToUse = null) => {
    setIsGenerating(true);
    setImageUrl(null);

    try {
      let prompt = promptToUse;

      if (!prompt) {
        // Translate title and subtitle to English
        const translatedTitle = await translate(task.title, "en");
        const translatedSubtitle = await translate(task.subtitle, "en");
        const title = translatedTitle || task.title;
        const subtitle = translatedSubtitle || task.subtitle;

        setTTitle(title);
        setTSubtitle(subtitle);

        prompt = `${imagePromptPrefix}: ${title}. ${subtitle}.${imagePromptSuffix}`;
        setTranslatedPrompt(prompt);
        setEditablePrompt(prompt);
      }

      console.log("Generating image with prompt:", prompt);

      const generatedUrl = await generateAzureImage(prompt, {
        size: '1024x1024',
        quality: 'medium',
        n: 1,
      });

      console.log("Generated Azure image URL:", generatedUrl);
      setImageUrl(generatedUrl);
    } catch (error) {
      console.error("Image generation error:", error);
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = () => {
    generateImage();
  };

  const handleApplyPromptChange = () => {
    // Trigger regeneration with the edited prompt
    setIsEditingPrompt(false);
    setHasUploadedNewImage(false);
    generateImage(editablePrompt);
  };

  const handleRegenerate = () => {
    // Reset states and regenerate
    setHasUploadedNewImage(false);
    const promptToUse = editablePrompt || translatedPrompt;
    generateImage(promptToUse);
  };

  // Convert image URL to File for Azure upload
  const urlToFile = async (url, filename) => {
    // Try direct fetch first (works for Azure signed URLs)
    try {
      console.log('Attempting direct fetch:', url);
      const response = await fetch(url);

      if (response.ok) {
        const blob = await response.blob();
        if (blob.type.startsWith('image/')) {
          console.log('✅ Direct fetch successful:', blob.type, blob.size);
          return new File([blob], filename, { type: blob.type });
        }
      }
    } catch (error) {
      console.log('Direct fetch failed, trying canvas method:', error.message);
    }

    // Fallback: Canvas-based conversion
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          canvas.width = img.width;
          canvas.height = img.height;

          ctx.drawImage(img, 0, 0);

          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], filename, { type: 'image/png' });
              console.log('✅ Image converted via canvas:', file.size);
              resolve(file);
            } else {
              console.error('❌ Failed to convert canvas to blob');
              resolve(null);
            }
          }, 'image/png');
        } catch (error) {
          console.error('❌ Canvas conversion failed:', error);
          resolve(null);
        }
      };

      img.onerror = () => {
        console.error('❌ Failed to load image for canvas conversion');
        resolve(null);
      };

      img.src = url;

      // Timeout after 15 seconds
      setTimeout(() => {
        console.error('❌ Image load timeout');
        resolve(null);
      }, 15000);
    });
  };

  // Upload image to Azure and update task
  const handleUploadToAzure = async () => {
    if (!imageUrl || !selectedSite) return;

    setIsUploading(true);

    try {
      // Convert the generated image URL to a File
      const translatedTitle = await translate(task.title, "en");
      const imageFile = await urlToFile(imageUrl, `AI_${translatedTitle}.png`);

      if (!imageFile) {
        console.error('Failed to convert image URL to file');
        alert('Failed to process image. Please try again.');
        setIsUploading(false);
        return;
      }

      console.log('📦 Uploading image to Azure:', imageFile.name, imageFile.size);

      // Upload to Azure Blob Storage (using site's nameInEnglish as folder structure)
      const azureImageUrl = await uploadFiles(imageFile, 'Task media/picture', selectedSite.nameInEnglish);

      console.log('✅ Image uploaded to Azure:', azureImageUrl);

      // Update the task with the new image URL
      const updatedTask = {
        picture_url: azureImageUrl
      };

      await updateTask(task.id, updatedTask);

      console.log('✅ Task updated with new image');

      setHasUploadedNewImage(true);

      // Notify parent component if callback provided
      if (onTaskUpdated) {
        onTaskUpdated(task.id, azureImageUrl);
      }

      alert('Image uploaded and task updated successfully!');

    } catch (error) {
      console.error('❌ Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: 16,
        boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
      }}
    >
      <h3 style={{ margin: "0 0 8px 0" }}>{index + 1}. {task.title} - {tTitle}</h3>
      <p style={{ margin: "0 0 12px 0", color: "#666" }}>{task.subtitle} - {tSubtitle}</p>

      {!imageUrl && !isGenerating ? (
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          style={{
            padding: "10px 20px",
            backgroundColor: isGenerating ? "#999" : "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: isGenerating ? "not-allowed" : "pointer",
            fontSize: 14,
            fontWeight: "bold",
          }}
        >
          {isGenerating ? "Generating..." : "Generate Image"}
        </button>
      ) : (
        <>
          {imageUrl && !isGenerating ? (
            <div>
              {/* Editable Prompt Section */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <label style={{ fontSize: 12, color: "#666", fontWeight: "bold" }}>Image Prompt:</label>
                  {!isEditingPrompt ? (
                    <button
                      onClick={() => setIsEditingPrompt(true)}
                      style={{
                        padding: "4px 8px",
                        backgroundColor: "#673AB7",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontSize: 12,
                      }}
                    >
                      ✏️ Edit Prompt
                    </button>
                  ) : (
                    <button
                      onClick={handleApplyPromptChange}
                      style={{
                        padding: "4px 8px",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontSize: 12,
                      }}
                    >
                      ✓ Apply & Regenerate
                    </button>
                  )}
                </div>
                {isEditingPrompt ? (
                  <textarea
                    value={editablePrompt}
                    onChange={(e) => setEditablePrompt(e.target.value)}
                    style={{
                      width: "100%",
                      minHeight: 80,
                      padding: 8,
                      borderRadius: 8,
                      border: "2px solid #673AB7",
                      fontSize: 12,
                      resize: "vertical",
                      boxSizing: "border-box",
                    }}
                  />
                ) : (
                  <p style={{
                    fontSize: 11,
                    color: "#888",
                    margin: 0,
                    padding: 8,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 4,
                    maxHeight: 60,
                    overflow: "auto",
                  }}>
                    {editablePrompt || translatedPrompt}
                  </p>
                )}
              </div>

              <img
                src={imageUrl}
                alt={task.title}
                style={{ width: "100%", borderRadius: 8 }}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button
                  onClick={handleRegenerate}
                  disabled={isUploading}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: isUploading ? "#999" : "#FF9800",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    cursor: isUploading ? "not-allowed" : "pointer",
                    fontSize: 14,
                    fontWeight: "bold",
                    flex: 1,
                  }}
                >
                  🔄 Regenerate
                </button>
                <button
                  onClick={handleUploadToAzure}
                  disabled={isUploading || hasUploadedNewImage}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: hasUploadedNewImage ? "#888" : isUploading ? "#999" : "#2196F3",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    cursor: hasUploadedNewImage || isUploading ? "not-allowed" : "pointer",
                    fontSize: 14,
                    fontWeight: "bold",
                    flex: 1,
                  }}
                >
                  {hasUploadedNewImage ? "✓ Uploaded" : isUploading ? "Uploading..." : "💾 Save to Task"}
                </button>
              </div>
              {hasUploadedNewImage && (
                <p style={{ color: "#4CAF50", fontSize: 12, marginTop: 8 }}>
                  Image saved to task successfully!
                </p>
              )}
            </div>
          ) : isGenerating ? (
            <p style={{ color: "#999", fontStyle: "italic" }}>Generating image with Azure...</p>
          ) : null}
        </>
      )}
    </div>
  );
}

// Pull an estimated time (in seconds) out of a task object, trying every known field
const extractEstimatedSeconds = (task) => {
  const est =
    task?.acf?.Estimated_time ??
    task?.Estimated_time ??
    task?.estimatedTimeSeconds ??
    task?.acf?.estimatedTimeSeconds;
  const num = Number(est);
  return Number.isFinite(num) && num > 0 ? num : NaN;
};

// Normalise IDs so numeric vs string mismatches don't break lookups
const normId = (id) => (id === undefined || id === null ? '' : String(id));

// Simulation Component
function SimulationComponent() {
  const { t } = useTranslation();
  const existingTheme = useTheme();
  const [loading, setLoading] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [allRoutes, setAllRoutes] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);

  // Simulation state
  const [running, setRunning] = useState(false);
  const runningRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const [delay, setDelay] = useState(300);
  const delayRef = useRef(300);
  const [startTime, setStartTime] = useState(new Date());
  const [useCustomTime, setUseCustomTime] = useState(false);
  const useCustomTimeRef = useRef(false);
  const startTimeRef = useRef(new Date());
  const [currentTimeOffset, setCurrentTimeOffset] = useState(0);
  const currentTimeOffsetRef = useRef(0);
  const [totalSent, setTotalSent] = useState(0);
  const [queue, setQueue] = useState([]);
  const queueRef = useRef([]);
  const [studentState, setStudentState] = useState({});
  const [logs, setLogs] = useState([]);
  const [taskData, setTaskData] = useState({});
  const taskDataRef = useRef({}); // <-- read this inside the loop, never the state value
  const timerRef = useRef(null);
  const logBoxRef = useRef(null);

  // Sync refs with state so the async loop always sees fresh values
  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { runningRef.current = running; }, [running]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { delayRef.current = delay; }, [delay]);
  useEffect(() => { useCustomTimeRef.current = useCustomTime; }, [useCustomTime]);
  useEffect(() => { startTimeRef.current = startTime; }, [startTime]);
  useEffect(() => { currentTimeOffsetRef.current = currentTimeOffset; }, [currentTimeOffset]);

  useEffect(() => {
    fetchSimulationData();
    return () => {
      // Stop any pending loop on unmount
      runningRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (logBoxRef.current) {
      logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
    }
  }, [logs]);

  const fetchSimulationData = async () => {
    setLoading(true);
    try {
      const [users, routes] = await Promise.all([
        getingData_Users(),
        getingData_Routes()
      ]);
      setAllUsers(users || []);
      setAllRoutes(routes || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserChange = (event) => {
    setSelectedUsers(event.target.value);
  };

  const handleRouteChange = (event) => {
    const routeId = event.target.value;
    const route = allRoutes.find(r => r.id === routeId);
    setSelectedRoute(route);
    if (route && route.sites && route.sites.length > 0) {
      setSelectedSite(route.sites[0]);
    }
    setSelectedUsers([]);
  };

  const addLog = (msg, type = 'info') => {
    const ts = new Date().toLocaleTimeString();
    // Trim inside the updater so we never read a stale `logs` value
    setLogs(prev => [...prev, { ts, msg, type }].slice(-300));
  };

  // Loads estimated times and RETURNS the map (also stores it in a ref) so the
  // simulation loop can use it immediately, without waiting for a re-render.
  const loadTaskData = async () => {
    if (!selectedRoute || !selectedRoute.tasks) return {};

    addLog('Fetching task data from API…');
    try {
      const routeTaskIds = selectedRoute.tasks.map(t => normId(t.taskId || t.id));
      const uniqueIds = [...new Set(routeTaskIds)];
      console.log('Route task IDs:', routeTaskIds);
      console.log('Unique task IDs requested:', uniqueIds.length);

      const data = await getingData_TasksbyIds(uniqueIds);
      const arr = Array.isArray(data) ? data : [];

      console.log('API returned tasks:', arr.length);

      // Key everything by the normalised task ID
      const taskMap = {};
      arr.forEach(task => {
        const estNum = extractEstimatedSeconds(task);
        taskMap[normId(task.id)] = estNum;
        console.log(`Task ${task.id} (${task.title || task.name}): estimated time = ${estNum}s`);
      });

      const validCount = Object.values(taskMap).filter(v => Number.isFinite(v)).length;
      taskDataRef.current = taskMap;
      setTaskData(taskMap);

      addLog(
        `✓ API returned ${arr.length} tasks · ${validCount} valid estimated times loaded (route has ${routeTaskIds.length} entries, ${uniqueIds.length} unique)`,
        'ok'
      );

      Object.entries(taskMap).forEach(([taskId, estTime]) => {
        addLog(`  - ${taskId}: ${estTime}s`, 'info');
      });

      // Report route tasks that have no usable estimate
      const missing = uniqueIds.filter(id => !Number.isFinite(taskMap[id]));
      if (missing.length > 0) {
        addLog(`⚠ ${missing.length} route task(s) have no valid estimated time: ${missing.join(', ')}`, 'warn');
      }

      return taskMap;
    } catch (e) {
      addLog(`⚠ Failed to load task data (${e.message}) — simulation cannot proceed`, 'error');
      taskDataRef.current = {};
      setTaskData({});
      return {};
    }
  };

  const buildTimestamps = (estSec, customStartTime = null) => {
    // Add random 0-10 seconds on top of the estimated time (minimum is estSec)
    const extraSec = Math.floor(Math.random() * 11); // 0-10 seconds
    const durationMs = (estSec + extraSec) * 1000;
    const start = customStartTime || new Date();
    const endTime = new Date(start.getTime() + durationMs);
    return { startTime: start, endTime, durationMs, extraSec };
  };

  const buildQueue = () => {
    const q = [];
    if (!selectedRoute || !selectedRoute.tasks) return q;

    // Process all tasks for each student in order (maintains route task order)
    selectedUsers.forEach(student => {
      selectedRoute.tasks.forEach((task, taskIndex) => {
        q.push({
          taskId: normId(task.taskId || task.id),
          taskName: task.title || task.name || task.acf?.title || task.acf?.name || `Task ${taskIndex + 1}`,
          stationId: task.stationId || task.acf?.stationId || task.station_id || '',
          studentId: student.id,
          studentName: student.name,
          taskIndex
        });
      });
    });
    return q;
  };

  const initStudentState = () => {
    const state = {};
    selectedUsers.forEach(student => {
      state[student.id] = { done: 0, errors: 0 };
    });
    setStudentState(state);
  };

  const startSimulation = async () => {
    if (runningRef.current) return;

    initStudentState();
    const q = buildQueue();
    console.log('Built queue:', q);
    setQueue(q);
    queueRef.current = q;
    setTotalSent(0);
    setCurrentTimeOffset(0);
    currentTimeOffsetRef.current = 0;
    setPaused(false);
    pausedRef.current = false;
    setLogs([]);

    // Load task data BEFORE flipping to "running" so the loop has what it needs
    const map = await loadTaskData();
    taskDataRef.current = map;

    if (Object.keys(map).length === 0) {
      addLog('✗ No task data available — aborting simulation', 'error');
      return;
    }

    setRunning(true);
    runningRef.current = true;

    addLog(
      `Started simulation — ${selectedUsers.length} students · ${selectedRoute.tasks.length} tasks ${
        useCustomTimeRef.current ? `· Custom time: ${startTimeRef.current.toLocaleString()}` : '· Using current time'
      }`
    );
    runLoop();
  };

  const togglePause = () => {
    const next = !pausedRef.current;
    pausedRef.current = next;
    setPaused(next);
    addLog(next ? 'Pausing simulation' : 'Resuming simulation');
  };

  const resetSimulation = () => {
    setRunning(false);
    runningRef.current = false;
    setPaused(false);
    pausedRef.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setQueue([]);
    queueRef.current = [];
    setTotalSent(0);
    setCurrentTimeOffset(0);
    currentTimeOffsetRef.current = 0;
    initStudentState();
    setLogs([]);
    addLog('Simulation reset');
  };

  const bumpStudent = (studentId, field) => {
    setStudentState(prev => ({
      ...prev,
      [studentId]: {
        done: 0,
        errors: 0,
        ...prev[studentId],
        [field]: (prev[studentId]?.[field] || 0) + 1
      }
    }));
  };

  const sendTask = async (item) => {
    // Always read from the ref — the state value is stale inside this async loop
    const estSec = taskDataRef.current[item.taskId];

    if (!Number.isFinite(estSec) || estSec <= 0) {
      console.error('Invalid estimated time for task:', item.taskId, estSec);
      addLog(`✗ ${item.taskName} (${item.taskId}) → Invalid estimated time: ${estSec} (skipping task)`, 'error');
      bumpStudent(item.studentId, 'errors');
      return;
    }

    let customStartTime = null;
    if (useCustomTimeRef.current) {
      customStartTime = new Date(startTimeRef.current.getTime() + currentTimeOffsetRef.current);
    }

    const { startTime: taskStartTime, endTime, extraSec } = buildTimestamps(estSec, customStartTime);
    const totalSec = estSec + extraSec;

    // Validate the dates before proceeding
    if (isNaN(taskStartTime.getTime()) || isNaN(endTime.getTime())) {
      console.error('Invalid dates generated:', { taskStartTime, endTime, estSec, customStartTime });
      addLog(`✗ ${item.taskName} → Invalid date generated`, 'error');
      bumpStudent(item.studentId, 'errors');
      return;
    }

    addLog(`Sending task: ${item.taskName} for ${item.studentName} (est: ${estSec}s)...`);

    try {
      console.log('Calling postTask_Performance with:', {
        taskId: item.taskId,
        studentId: item.studentId,
        routeId: selectedRoute.id,
        siteId: selectedSite?.id || '',
        stationId: item.stationId || '',
        startTime: taskStartTime.toISOString(),
        endTime: endTime.toISOString()
      });

      const res = await postTask_Performance(
        item.taskId,
        item.studentId,
        selectedRoute.id,
        selectedSite?.id || '',
        item.stationId || '',
        taskStartTime.toISOString(),
        endTime.toISOString()
      );

      console.log('postTask_Performance response:', res);

      if (res) {
        // Update time offset for next task (use totalSec for accurate timeline)
        if (useCustomTimeRef.current) {
          const newOffset = currentTimeOffsetRef.current + (totalSec * 1000);
          setCurrentTimeOffset(newOffset);
          currentTimeOffsetRef.current = newOffset;
        }

        bumpStudent(item.studentId, 'done');
        setTotalSent(prev => prev + 1);
        addLog(`✓ ${item.studentName} · ${item.taskName} · ${estSec}s + ${extraSec}s = ${totalSec}s → Success`, 'ok');
      } else {
        bumpStudent(item.studentId, 'errors');
        addLog(`✗ ${item.studentName} · ${item.taskName} → Failed (no response)`, 'error');
      }
    } catch (e) {
      console.error('sendTask error:', e);
      bumpStudent(item.studentId, 'errors');
      addLog(`✗ ${item.studentName} · ${item.taskName} → ${e.message}`, 'error');
    }
  };

  const runLoop = async () => {
    if (!runningRef.current) return;

    // Paused: keep polling until resumed (do NOT end the simulation)
    if (pausedRef.current) {
      timerRef.current = setTimeout(runLoop, 200);
      return;
    }

    const currentQueue = queueRef.current;

    if (currentQueue.length === 0) {
      setRunning(false);
      runningRef.current = false;
      addLog('— Simulation complete —', 'ok');
      return;
    }

    const item = currentQueue[0];
    addLog(`Processing: ${item.taskName} for ${item.studentName}`);

    await sendTask(item);

    // The user may have hit Reset while we were awaiting the request
    if (!runningRef.current) return;

    // Remove the processed item
    const newQueue = queueRef.current.slice(1);
    setQueue(newQueue);
    queueRef.current = newQueue;

    if (newQueue.length === 0) {
      setRunning(false);
      runningRef.current = false;
      addLog('— Simulation complete —', 'ok');
      return;
    }

    // Schedule next iteration (pause is handled at the top of runLoop)
    timerRef.current = setTimeout(runLoop, delayRef.current);
  };

  const getInitials = (name) => {
    return (name || '').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  };

  const getColor = (index) => {
    return COLOR_RAMPS[index % COLOR_RAMPS.length];
  };

  const totalTasks = selectedRoute ? selectedRoute.tasks.length * selectedUsers.length : 0;

  const direction = t('Direction');

  const theme = React.useMemo(() =>
    createTheme({}, t('localeText', { returnObjects: true }), existingTheme, { direction }),
    [existingTheme, direction],
  );

  const cache = direction === 'rtl' ? cacheRtl : cacheLtr;

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <div className="simulation-page" dir={direction} style={{ padding: 24 }}>
          <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={loading}
          >
            <CircularProgress size='3rem' color='info' />
          </Backdrop>

          <div className="simulation-container" style={{ maxWidth: 1400, margin: '0 auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: 32 }}>
            <div className="simulation-header" style={{ marginBottom: 24, textAlign: 'center' }}>
              <Typography variant="h4" style={{ fontSize: '2rem', fontWeight: 'bold', color: '#114260', margin: '20px 0 8px 0' }}>
                Task Performance Simulation
              </Typography>
            </div>

            <div className="simulation-controls" style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
              <FormControl style={{ minWidth: 250 }}>
                <InputLabel>Select Route</InputLabel>
                <Select
                  value={selectedRoute?.id || ''}
                  onChange={handleRouteChange}
                  label="Select Route"
                >
                  {allRoutes.map(route => (
                    <MenuItem key={route.id} value={route.id}>
                      {route.name || route.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl style={{ minWidth: 250 }}>
                <InputLabel>Select Students</InputLabel>
                <Select
                  multiple
                  value={selectedUsers}
                  onChange={handleUserChange}
                  label="Select Students"
                  renderValue={(selected) => `${selected.length} students selected`}
                  disabled={!selectedRoute}
                >
                  {allUsers.map(user => (
                    <MenuItem key={user.id} value={user}>
                      <Checkbox checked={selectedUsers.indexOf(user) > -1} />
                      <ListItemText primary={user.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Checkbox
                  checked={useCustomTime}
                  onChange={(e) => setUseCustomTime(e.target.checked)}
                  size="small"
                />
                <label style={{ fontSize: 14, color: '#666' }}>Use custom start time</label>
              </div>

              {useCustomTime && (
                <TextField
                  type="datetime-local"
                  label="Start Time"
                  value={startTime.toISOString().slice(0, 16)}
                  onChange={(e) => {
                    const d = new Date(e.target.value);
                    if (!isNaN(d.getTime())) setStartTime(d);
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  size="small"
                  style={{ width: 220 }}
                />
              )}

              <div className="delay-control" style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
                <label style={{ fontSize: 14, color: '#666', whiteSpace: 'nowrap' }}>Delay (ms): {delay}</label>
                <input
                  type="range"
                  min="50"
                  max="2000"
                  value={delay}
                  onChange={(e) => setDelay(parseInt(e.target.value))}
                  step="50"
                  style={{ width: 120 }}
                />
              </div>
            </div>

            {selectedRoute && (
              <div className="simulation-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
                <Typography variant="body2" style={{ margin: '4px 0', color: '#666', fontSize: 13 }}>
                  Route: {selectedRoute.name || selectedRoute.title} · {selectedRoute.tasks?.length || 0} tasks · {selectedUsers.length} students
                </Typography>
                <Typography variant="body2" style={{ margin: '4px 0', color: '#666', fontSize: 13 }}>
                  Site: {selectedSite?.name || 'N/A'} · {totalSent} / {totalTasks} sent
                </Typography>
              </div>
            )}

            <div className="simulation-buttons" style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
              <Button
                variant="contained"
                onClick={startSimulation}
                disabled={running || !selectedRoute || selectedUsers.length === 0}
                style={{ padding: '8px 20px', fontSize: 14, textTransform: 'none', borderRadius: 8 }}
              >
                ▶ Start Simulation
              </Button>
              <Button
                variant="outlined"
                onClick={togglePause}
                disabled={!running}
                style={{ padding: '8px 20px', fontSize: 14, textTransform: 'none', borderRadius: 8 }}
              >
                {paused ? '▶ Resume' : '⏸ Pause'}
              </Button>
              <Button
                variant="outlined"
                onClick={resetSimulation}
                disabled={!running && totalSent === 0}
                style={{ padding: '8px 20px', fontSize: 14, textTransform: 'none', borderRadius: 8 }}
              >
                ↺ Reset
              </Button>
              <span className={`status-badge ${running ? (paused ? 'paused' : 'running') : 'ready'}`} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 12, background: running ? (paused ? '#BA7517' : '#1D9E75') : '#e0e0e0', color: running ? 'white' : '#666', marginLeft: 'auto' }}>
                {running ? (paused ? 'Paused' : 'Running…') : 'Ready'}
              </span>
            </div>

            <div className="progress-bar-container" style={{ height: 6, background: '#e0e0e0', borderRadius: 3, marginBottom: 24, overflow: 'hidden' }}>
              <div className="progress-bar" style={{ height: '100%', width: `${totalTasks > 0 ? (totalSent / totalTasks) * 100 : 0}%`, background: '#1D9E75', borderRadius: 3, transition: 'width 0.3s ease' }}></div>
            </div>

            <div className="student-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginBottom: 24 }}>
              {selectedUsers.map((student, index) => {
                const state = studentState[student.id] || { done: 0, errors: 0 };
                const totalRouteTasks = selectedRoute?.tasks?.length || 0;
                const progress = totalRouteTasks > 0 ? (state.done / totalRouteTasks) * 100 : 0;
                const color = getColor(index);

                return (
                  <div key={student.id} className="student-card" style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 12, padding: 12 }}>
                    <div className="student-header" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div className="student-avatar" style={{ width: 36, height: 36, borderRadius: '50%', background: `${color}22`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500, flexShrink: 0 }}>
                        {getInitials(student.name)}
                      </div>
                      <div className="student-info" style={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" className="student-name" style={{ fontSize: 14, fontWeight: 500, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {student.name}
                        </Typography>
                        <Typography variant="body2" className="student-username" style={{ fontSize: 11, color: '#666', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {student.user_name || student.email}
                        </Typography>
                      </div>
                      <span className="student-badge" style={{ fontSize: 11, padding: '3px 8px', borderRadius: 12, background: '#f5f5f5', color: '#666', whiteSpace: 'nowrap' }}>
                        {state.done}/{totalRouteTasks}
                      </span>
                    </div>
                    <div className="student-progress" style={{ height: 4, background: '#e0e0e0', borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
                      <div className="student-progress-bar" style={{ height: '100%', width: `${progress}%`, backgroundColor: color, borderRadius: 2, transition: 'width 0.3s ease' }}></div>
                    </div>
                    <Typography variant="body2" className="student-status" style={{ fontSize: 11, color: state.errors > 0 ? '#d32f2f' : '#666', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {state.done === totalRouteTasks && totalRouteTasks > 0
                        ? '✓ Complete'
                        : state.errors > 0
                          ? `In progress · ${state.errors} error${state.errors === 1 ? '' : 's'}`
                          : 'In progress'}
                    </Typography>
                  </div>
                );
              })}
            </div>

            <div className="log-box" ref={logBoxRef} style={{ background: '#f5f5f5', borderRadius: 8, padding: 12, maxHeight: 180, overflowY: 'auto', fontFamily: 'Courier New, monospace', fontSize: 11 }}>
              {logs.length === 0 && (
                <Typography variant="body2" style={{ color: '#999', textAlign: 'center', padding: 20 }}>
                  Ready to start simulation
                </Typography>
              )}
              {logs.map((log, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  style={{ margin: '2px 0', color: log.type === 'ok' ? '#1D9E75' : log.type === 'error' ? '#d32f2f' : log.type === 'warn' ? '#BA7517' : '#666' }}
                >
                  [{log.ts}] {log.msg}
                </Typography>
              ))}
            </div>
          </div>
        </div>
      </ThemeProvider>
    </CacheProvider>
  );
}


/* ==================================================================== */
/*  Environment Migration tab (Staging <-> Production)                   */
/* ==================================================================== */

/* ------------------------------------------------------------------ */
/*  1. ENVIRONMENT CONFIG                                              */
/* ------------------------------------------------------------------ */
// Each environment is a separate deployment of the same taal-backend-crud
// API, so both use the exact same paths — only the base URL differs.
const ENVIRONMENTS = {
  production: {
    label: 'Production',
    baseUrl: 'https://prod-web-app0da5905.azurewebsites.net',
  },
  staging: {
    label: 'Staging',
    baseUrl: 'https://staging-gfa2eybwcweaerds.westus2-01.azurewebsites.net', // e.g. https://staging-web-appXXXXXXX.azurewebsites.net
  },
};

/*
 * 2. AUTH
 *
 * Your app stores one JWT in sessionStorage('accessToken') and attaches it
 * to every request via an axios interceptor + a monkey-patched fetch — both
 * globally, for whichever baseUrl happens to be configured for THIS app.
 * That pattern can't hold two different tokens (staging + production) at
 * once, so this tab keeps its own two tokens in memory and attaches the
 * right one per call, independent of the app's global interceptor.
 *
 * Paste a token pair from each environment's login response (or read
 * sessionStorage.accessToken while logged into that environment).
 */
const authHeaders = (token) => (token ? { Authorization: `Bearer ${token}` } : {});

/* ------------------------------------------------------------------ */
/*  3. HTTP client bound to one environment, mirroring api.js          */
/* ------------------------------------------------------------------ */
const makeClient = (env, token) => {
  const baseUrl = ENVIRONMENTS[env].baseUrl;
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json', ...authHeaders(token) };

  const req = async (method, path, body) => {
    try {
      const res = await axios({ method, url: `${baseUrl}${path}`, data: body, headers });
      return res.data;
    } catch (e) {
      const status = e.response?.status;
      const detail = e.response?.data?.message || e.response?.data?.error || e.message;
      throw new Error(`${env} ${method.toUpperCase()} ${path} -> ${status ?? 'network error'}: ${JSON.stringify(detail).slice(0, 200)}`);
    }
  };

  return {
    // Sites
    listSites: () => req('get', '/sites'),
    getSite: (id) => req('get', `/sites/${id}`),
    sitesByIds: (ids) => req('post', '/sites/ids', ids),
    createSite: (b) => req('post', '/sites', b),
    updateSite: (id, b) => req('patch', `/sites/${id}`, b),
    // Stations
    listStations: () => req('get', '/stations'),
    getStation: (id) => req('get', `/stations/${id}`),
    stationsByIds: (ids) => req('post', '/stations/ids', ids),
    createStation: (b) => req('post', '/stations', b),
    updateStation: (id, b) => req('patch', `/stations/${id}`, b),
    // Tasks
    listTasks: () => req('get', '/tasks'),
    getTask: (id) => req('get', `/tasks/${id}`),
    tasksByIds: (ids) => req('post', '/tasks/ids', ids),
    createTask: (b) => req('post', '/tasks', b),
    updateTask: (id, b) => req('patch', `/tasks/${id}`, b),
    // Routes
    listRoutes: () => req('get', '/routes'),
    getRoute: (id) => req('get', `/routes/${id}`),
    routesByIds: (ids) => req('post', '/routes/ids', ids),
    createRoute: (b) => req('post', '/routes', b),
    updateRoute: (id, b) => req('patch', `/routes/${id}`, b),
  };
};

const arr = (v) => (Array.isArray(v) ? v : []);
const idOf = (o) => (o === null || o === undefined ? '' : String(typeof o === 'object' ? o.id : o));
const nameOf = (o) => o?.name || o?.title || o?.nameInEnglish || '(unnamed)';

/* ------------------------------------------------------------------ */
/*  4. Field maps and strip helpers for THIS API                       */
/*                                                                      */
/*  GET returns deeply nested objects; the create DTOs only accept      */
/*  scalar fields + a few ID arrays. Sending unknown/relational fields  */
/*  causes 500s. Each strip function keeps only what CreateDto accepts. */
/* ------------------------------------------------------------------ */

// Base: always strip server-generated fields
const stripBase = (obj) => {
  const { id, createdAt, updatedAt, created_at, updated_at, __v, ...rest } = obj || {};
  return rest;
};

// Generic fallback (use for routes, stations)
const stripServerFields = stripBase;

// Task: CreateTaskDto accepts title, subtitle, multi_language_description,
// estimatedTimeSeconds, picture_url, audio_url, siteIds, stationIds,
// dataEntryLabel, dataEntryValidation, dataEntryType, taskType, additonalHelp.
// Strip all relational arrays that contain IDs from the source env
// (alternativeTasks, tasksAlternativeTo, subtasks, parentTasks, siteIds,
// stationIds) and strip IDs+taskId from each additonalHelp entry so the
// backend creates them fresh rather than trying to resolve source-env IDs.
const stripTaskFields = (task, newSiteId, stationMap) => {
  const {
    id, createdAt, updatedAt, created_at, updated_at, __v,
    alternativeTasks, tasksAlternativeTo, subtasks, parentTasks,
    siteIds: _s, stationIds: _st,
    additonalHelp,
    ...rest
  } = task || {};

  // Remap stationIds using the new station ids, only send if the task had them
  const newStationIds = arr(_st)
    .map(idOf)
    .map(sid => stationMap.get(sid))
    .filter(Boolean);

  // Clean additonalHelp: strip server fields and the old taskId reference
  const cleanedHelp = arr(additonalHelp).map(h => {
    const { id: _hid, taskId: _tid, ...hRest } = h || {};
    return hRest;
  }).filter(h => Object.keys(h).length > 0);

  return {
    ...rest,
    siteIds: newSiteId ? [newSiteId] : [],
    ...(newStationIds.length > 0 ? { stationIds: newStationIds } : {}),
    ...(cleanedHelp.length > 0 ? { additonalHelp: cleanedHelp } : {}),
  };
};

// Route: CreateRouteDto accepts name, studentIds, taskIds, siteIds,
// OnlyOnce, parentRouteId, loopIds, video_link, multi_language_description.
// GET /routes/{id} returns the expanded shape with sites[], students[],
// loops[], and tasks[] as {position, routeId, taskId, stationId}.
// We must convert to ID-array form and remap all source-env IDs.
const stripRouteFields = (route, newSiteId, taskMap, routeMap) => {
  const {
    id, createdAt, updatedAt, created_at, updated_at, __v,
    // relational expanded arrays — replaced with ID arrays below
    tasks: rawTasks, students, sites, loops,
    parentRouteId,
    ...scalar
  } = route || {};

  // tasks[]: convert {position, routeId, taskId, stationId?} ->
  //          {position, taskId (remapped), stationId? (will be remapped by caller)}
  // routeId inside each task entry is a self-reference — drop it.
  const taskEntries = arr(rawTasks)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map(({ routeId: _rid, taskId, stationId, ...rest }) => ({
      ...rest,
      taskId: taskMap.get(idOf(taskId)) ?? idOf(taskId),
      ...(stationId ? { stationId } : {}), // stationId remapped by caller
    }));

  return {
    ...scalar,
    // Scalar fields the DTO accepts
    siteIds: newSiteId ? [newSiteId] : [],
    studentIds: [],
    loopIds: arr(loops).map(idOf).filter(Boolean),
    tasks: taskEntries,
    parentRouteId: parentRouteId
      ? (routeMap.get(idOf(parentRouteId)) ?? null)
      : null,
  };
};

const remapIdList = (list, map) => arr(list).map((x) => map.get(idOf(x)) ?? idOf(x));

// Run async work over a list with a small concurrency limit
const mapLimit = async (list, limit, fn) => {
  const out = new Array(list.length);
  let next = 0;
  const worker = async () => {
    while (next < list.length) {
      const i = next++;
      out[i] = await fn(list[i], i);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, list.length) }, worker));
  return out;
};

// Read the id out of whatever a create/update endpoint returns
const newIdFrom = (created, what) => {
  const id = idOf(created) || idOf(created?.data) || idOf(created?.result);
  if (!id) throw new Error(`Target API did not return an id for the created ${what}: ${JSON.stringify(created).slice(0, 150)}`);
  return id;
};

/* ------------------------------------------------------------------ */
/*  5. Gather everything a site references                             */
/*  GET /sites/{id} returns tasks[], stations[], routes[] embedded      */
/*  directly. A route's tasks[] (taskId/stationId/position) only shows  */
/*  up on GET /routes/{id}, so each route is re-fetched individually.   */
/* ------------------------------------------------------------------ */
const collectSiteBundle = async (site, src, warnings) => {
  const stations = arr(site.stations);
  const tasks = arr(site.tasks);
  const routeSummaries = arr(site.routes);

  const routes = await mapLimit(routeSummaries, 5, async (rs) => {
    try {
      const full = await src.getRoute(idOf(rs));
      return full && typeof full === 'object' ? { ...rs, ...full } : rs;
    } catch (e) {
      warnings.push(`Could not load full route detail for "${nameOf(rs)}" (${e.message.slice(0, 90)})`);
      return rs;
    }
  });

  const knownTaskIds = new Set(tasks.map(idOf));
  const extraTaskIds = new Set();
  routes.forEach((r) =>
    arr(r.tasks).forEach((rt) => {
      const tId = idOf(rt.taskId ?? rt.id);
      if (tId && !knownTaskIds.has(tId)) extraTaskIds.add(tId);
    })
  );
  let extraTasks = [];
  if (extraTaskIds.size) {
    try {
      extraTasks = arr(await src.tasksByIds([...extraTaskIds]));
    } catch (e) {
      warnings.push(`Could not load ${extraTaskIds.size} task(s) referenced only by a route (${e.message.slice(0, 90)})`);
    }
  }

  return { site, stations, tasks: [...tasks, ...extraTasks], routes };
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
function EnvironmentMigration() {
  const [direction, setDirection] = useState('staging->production');
  const [tokens, setTokens] = useState({ staging: '', production: '' });

  const [sourceSites, setSourceSites] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [conflictMode, setConflictMode] = useState({}); // siteId -> 'skip' | 'update' | 'copy'

  const [loadingSites, setLoadingSites] = useState(false);
  const [preview, setPreview] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [log, setLog] = useState([]);
  const [error, setError] = useState('');
  const cancelRef = useRef(false);

  const [srcEnv, dstEnv] = direction.split('->');
  const addLog = (msg, type = 'info') =>
    setLog((p) => [...p, { ts: new Date().toLocaleTimeString(), msg, type }].slice(-500));

  const bothConfigured = () =>
    !ENVIRONMENTS.staging.baseUrl.startsWith('PASTE_') &&
    !ENVIRONMENTS.production.baseUrl.startsWith('PASTE_');

  /* ---- load the source environment's sites ---- */
  const loadSourceSites = async () => {
    setError('');
    setPreview(null);
    setSelectedIds([]);
    if (!bothConfigured()) {
      setError('Set ENVIRONMENTS.staging.baseUrl at the top of EnvironmentMigration.jsx.');
      return;
    }
    setLoadingSites(true);
    try {
      const sites = arr(await makeClient(srcEnv, tokens[srcEnv]).listSites());
      setSourceSites(sites);
      addLog(`Loaded ${sites.length} sites from ${ENVIRONMENTS[srcEnv].label}`, 'ok');
    } catch (e) {
      setError(e.message);
      addLog(e.message, 'error');
    } finally {
      setLoadingSites(false);
    }
  };

  /* ---- DRY RUN: read only, nothing is written ---- */
  const runDryRun = async () => {
    setError('');
    setPreviewing(true);
    setPreview(null);
    try {
      const src = makeClient(srcEnv, tokens[srcEnv]);
      const dst = makeClient(dstEnv, tokens[dstEnv]);

      const dstSites = arr(await dst.listSites());
      const dstByName = new Map(dstSites.map((s) => [nameOf(s).trim().toLowerCase(), s]));

      const items = await mapLimit(selectedIds, 3, async (id) => {
        const listSite = sourceSites.find((s) => idOf(s) === id);
        const warnings = [];
        addLog(`Reading "${nameOf(listSite)}" and its stations/tasks/routes…`);

        const fullSite = await src.getSite(id).catch(() => listSite);
        const bundle = await collectSiteBundle(fullSite, src, warnings);

        const existing = dstByName.get(nameOf(fullSite).trim().toLowerCase()) || null;
        const mode = conflictMode[id] || 'skip';

        if (bundle.tasks.length === 0) warnings.push('This site has no tasks.');
        if (bundle.routes.length === 0) warnings.push('This site has no routes.');

        return {
          id, name: nameOf(fullSite), bundle, existing, mode, warnings,
          action: existing
            ? (mode === 'skip' ? 'SKIP (already exists)' : mode === 'update' ? 'UPDATE existing' : 'CREATE new copy')
            : 'CREATE',
        };
      });

      setPreview({ items, at: new Date() });
      addLog(`Dry run complete for ${items.length} site(s) — nothing was written`, 'ok');
    } catch (e) {
      setError(e.message);
      addLog(e.message, 'error');
    } finally {
      setPreviewing(false);
    }
  };

  /* ---- EXECUTE: writes to the target ----
   * Order: SITE (empty id lists) -> STATIONS -> TASKS -> ROUTES -> update the
   * site with the real stationIds/taskIds/routeIds. Stations and tasks both
   * need the new site's id (parentSiteId / siteIds), which is why the site is
   * created first.
   */
  const executeMigration = async () => {
    setConfirmOpen(false);
    setConfirmText('');
    setRunning(true);
    cancelRef.current = false;

    const dst = makeClient(dstEnv, tokens[dstEnv]);
    const actionable = preview.items.filter((i) => i.action !== 'SKIP (already exists)');
    const total = actionable.reduce(
      (n, i) => n + 2 + i.bundle.stations.length + i.bundle.tasks.length + i.bundle.routes.length, 0
    );
    setProgress({ done: 0, total });
    let done = 0;
    const tick = () => setProgress({ done: ++done, total });
    const checkCancel = () => { if (cancelRef.current) throw new Error('Cancelled by user'); };

    for (const item of actionable) {
      if (cancelRef.current) { addLog('Cancelled by user', 'warn'); break; }
      addLog(`── ${item.name}: ${item.action}`);

      const isUpdate = item.action === 'UPDATE existing';
      const stationMap = new Map(); // old station id -> new station id
      const taskMap = new Map();    // old task id -> new task id
      const routeMap = new Map();   // old route id -> new route id

      try {
        // 1. SITE — GET returns tasks/stations/routes as embedded objects, but
        // the create/update DTOs (per insertSite in api.js) take ID ARRAYS:
        // studentIds, editorIds, taskIds, routeIds, stationIds. Start empty —
        // children don't exist in the target yet — then link in step 5.
        const src0 = item.bundle.site;
        const siteBody = {
          name: src0.name,
          description: src0.description ?? '',
          picture_url: src0.picture_url ?? null,
          nameInEnglish: src0.nameInEnglish ?? src0.name,
          multi_language_description: src0.multi_language_description ?? null,
          audio_url: src0.audio_url ?? null,
          qr_code_url: src0.qr_code_url ?? null,
          studentIds: [],
          editorIds: [],
          taskIds: [],
          routeIds: [],
          stationIds: [],
        };

        let newSiteId;
        if (isUpdate) {
          await dst.updateSite(idOf(item.existing), siteBody);
          newSiteId = idOf(item.existing);
        } else {
          newSiteId = newIdFrom(await dst.createSite(siteBody), 'site');
        }
        addLog(`  ✓ site "${item.name}" ${isUpdate ? 'updated' : 'created'} (id ${newSiteId})`, 'ok'); tick();

        // 2. STATIONS — full copy, parentSiteId -> new site. Station.taskIds
        // (if the field exists) is remapped once tasks exist, in step 3b.
        for (const st of item.bundle.stations) {
          checkCancel();
          const body = stripServerFields(st);
          body.parentSiteId = newSiteId;
          if ('taskIds' in body) body.taskIds = [];
          const created = await dst.createStation(body);
          stationMap.set(idOf(st), newIdFrom(created, 'station'));
          addLog(`  ✓ station "${nameOf(st)}"`, 'ok'); tick();
        }

        // 3. TASKS — copy every scalar field and media URLs. Strip all
        // relational arrays (alternativeTasks, parentTasks, etc.) and
        // clean additonalHelp entries so they don't carry source-env IDs.
        for (const t of item.bundle.tasks) {
          checkCancel();
          const body = stripTaskFields(t, newSiteId, stationMap);
          const created = await dst.createTask(body);
          taskMap.set(idOf(t), newIdFrom(created, 'task'));
          addLog(`  ✓ task "${nameOf(t)}"`, 'ok'); tick();
        }

        // 3b. Back-fill each station's taskIds now that tasks exist, only if
        // the source station actually carried that field.
        for (const st of item.bundle.stations) {
          checkCancel();
          if (!('taskIds' in st)) continue;
          const newStId = stationMap.get(idOf(st));
          const newTaskIds = remapIdList(st.taskIds, taskMap);
          if (newStId && newTaskIds.length) {
            await dst.updateStation(newStId, { taskIds: newTaskIds });
          }
        }

        // 4. ROUTES — convert GET shape to CreateRouteDto shape.
        // stripRouteFields handles: dropping relational objects (sites[],
        // students[], loops[]), converting tasks[] from {routeId, taskId, ...}
        // to {taskId (remapped), position, ...}, setting siteIds/studentIds,
        // and remapping parentRouteId to the new target-env route id.
        for (const r of item.bundle.routes) {
          checkCancel();
          const body = stripRouteFields(r, newSiteId, taskMap, routeMap);
          // Remap stationId within each task entry now that stationMap is full
          body.tasks = body.tasks.map((rt) => ({
            ...rt,
            ...(rt.stationId
              ? { stationId: stationMap.get(idOf(rt.stationId)) ?? rt.stationId }
              : {}),
          }));
          const created = await dst.createRoute(body);
          routeMap.set(idOf(r), newIdFrom(created, 'route'));
          addLog(`  ✓ route "${nameOf(r)}"`, 'ok'); tick();
        }

        // 5. Point the site at everything that now exists
        checkCancel();
        await dst.updateSite(newSiteId, {
          stationIds: [...stationMap.values()],
          taskIds: [...taskMap.values()],
          routeIds: [...routeMap.values()],
        });
        addLog(`  ✓ site linked (${stationMap.size} stations · ${taskMap.size} tasks · ${routeMap.size} routes)`, 'ok'); tick();
      } catch (e) {
        const cancelled = e.message === 'Cancelled by user';
        addLog(`  ${cancelled ? '⚠' : '✗'} ${item.name} ${cancelled ? 'cancelled' : 'FAILED'}: ${e.message}`, cancelled ? 'warn' : 'error');
        addLog(`  "${item.name}" may exist partially in ${ENVIRONMENTS[dstEnv].label}. Nothing is rolled back — review the target before retrying.`, 'warn');
        if (cancelled) break;
      }
    }

    setRunning(false);
    addLog('— Migration finished —', 'ok');
  };

  const expectedPhrase = `MIGRATE TO ${ENVIRONMENTS[dstEnv].label.toUpperCase()}`;
  const willWrite = preview?.items.some((i) => i.action !== 'SKIP (already exists)');

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold', color: '#114260' }}>
        Environment Migration
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, color: '#666' }}>
        Copies a site with its stations, tasks and routes between Staging and Production.
        Order: site → stations → tasks → routes, then the site is linked to all of them.
        Media URLs are copied as-is (no files are moved). Student and editor assignments are not copied.
      </Typography>

      {!bothConfigured() && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Staging's base URL is not set yet. Edit <code>ENVIRONMENTS.staging.baseUrl</code> at the top of this file.
        </Alert>
      )}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Direction + tokens */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2, alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 260 }}>
          <InputLabel>Direction</InputLabel>
          <Select
            value={direction}
            label="Direction"
            disabled={running}
            onChange={(e) => { setDirection(e.target.value); setSourceSites([]); setSelectedIds([]); setPreview(null); }}
          >
            <MenuItem value="staging->production">Staging → Production</MenuItem>
            <MenuItem value="production->staging">Production → Staging</MenuItem>
          </Select>
        </FormControl>

        <TextField
          size="small" type="password" label={`${ENVIRONMENTS[srcEnv].label} JWT (source)`}
          value={tokens[srcEnv]} sx={{ minWidth: 280 }}
          onChange={(e) => setTokens((p) => ({ ...p, [srcEnv]: e.target.value }))}
        />
        <TextField
          size="small" type="password" label={`${ENVIRONMENTS[dstEnv].label} JWT (target)`}
          value={tokens[dstEnv]} sx={{ minWidth: 280 }}
          onChange={(e) => setTokens((p) => ({ ...p, [dstEnv]: e.target.value }))}
        />
        <Button variant="contained" onClick={loadSourceSites} disabled={loadingSites || running}>
          {loadingSites ? <CircularProgress size={20} /> : `Load sites from ${ENVIRONMENTS[srcEnv].label}`}
        </Button>
      </Box>

      {dstEnv === 'production' && (
        <Alert severity="error" sx={{ mb: 2 }}>
          The target is <strong>PRODUCTION</strong>. Real data will be written.
        </Alert>
      )}

      {/* Site picker */}
      {sourceSites.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <FormControl sx={{ minWidth: 360 }}>
            <InputLabel>Sites to migrate</InputLabel>
            <Select
              multiple value={selectedIds} label="Sites to migrate" disabled={running}
              onChange={(e) => { setSelectedIds(e.target.value); setPreview(null); }}
              renderValue={(sel) => `${sel.length} site(s) selected`}
            >
              {sourceSites.map((s) => (
                <MenuItem key={idOf(s)} value={idOf(s)}>
                  <Checkbox checked={selectedIds.includes(idOf(s))} />
                  <ListItemText primary={nameOf(s)} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedIds.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                If a site with the same name already exists in {ENVIRONMENTS[dstEnv].label}:
              </Typography>
              {selectedIds.map((id) => {
                const s = sourceSites.find((x) => idOf(x) === id);
                return (
                  <Box key={id} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography sx={{ minWidth: 220 }}>{nameOf(s)}</Typography>
                    <Select
                      size="small" value={conflictMode[id] || 'skip'} disabled={running}
                      onChange={(e) => { setConflictMode((p) => ({ ...p, [id]: e.target.value })); setPreview(null); }}
                    >
                      <MenuItem value="skip">Skip it</MenuItem>
                      <MenuItem value="update">Update the existing site</MenuItem>
                      <MenuItem value="copy">Create a new copy</MenuItem>
                    </Select>
                  </Box>
                );
              })}
              <Button variant="outlined" sx={{ mt: 1 }} onClick={runDryRun} disabled={previewing || running}>
                {previewing ? <CircularProgress size={20} /> : 'Preview (dry run — writes nothing)'}
              </Button>
            </Box>
          )}
        </Box>
      )}

      {/* Dry-run result */}
      {preview && (
        <Box sx={{ border: '1px solid #ddd', borderRadius: 2, p: 2, mb: 2, background: '#fafafa' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Dry-run preview: {ENVIRONMENTS[srcEnv].label} → {ENVIRONMENTS[dstEnv].label}
          </Typography>
          {preview.items.map((it) => (
            <Box key={it.id} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography sx={{ fontWeight: 500 }}>{it.name}</Typography>
                <Chip size="small" label={it.action}
                  color={it.action.startsWith('SKIP') ? 'default' : it.action.startsWith('UPDATE') ? 'warning' : 'success'} />
                <Typography variant="body2" sx={{ color: '#666' }}>
                  {it.bundle.stations.length} stations · {it.bundle.tasks.length} tasks · {it.bundle.routes.length} routes
                </Typography>
              </Box>
              {it.warnings.map((w, i) => <Alert key={i} severity="warning" sx={{ mt: 1 }}>{w}</Alert>)}
            </Box>
          ))}
          <Divider sx={{ my: 1 }} />
          <Button variant="contained" color={dstEnv === 'production' ? 'error' : 'primary'}
            disabled={!willWrite || running} onClick={() => setConfirmOpen(true)}>
            Confirm and migrate…
          </Button>
        </Box>
      )}

      {/* Progress */}
      {running && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress variant="determinate" value={progress.total ? (progress.done / progress.total) * 100 : 0} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="body2">{progress.done} / {progress.total} records</Typography>
            <Button size="small" color="warning" onClick={() => { cancelRef.current = true; }}>Cancel</Button>
          </Box>
        </Box>
      )}

      {/* Log */}
      <Box sx={{ background: '#f5f5f5', borderRadius: 2, p: 1.5, maxHeight: 280, overflowY: 'auto', fontFamily: 'Courier New, monospace', fontSize: 11 }}>
        {log.length === 0 && <Typography variant="body2" sx={{ color: '#999', textAlign: 'center', p: 2 }}>No activity yet</Typography>}
        {log.map((l, i) => (
          <div key={i} style={{ color: l.type === 'ok' ? '#1D9E75' : l.type === 'error' ? '#d32f2f' : l.type === 'warn' ? '#BA7517' : '#666' }}>
            [{l.ts}] {l.msg}
          </div>
        ))}
      </Box>

      {/* Typed confirmation */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm migration to {ENVIRONMENTS[dstEnv].label}</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            This will write {preview?.items.filter((i) => i.action !== 'SKIP (already exists)').length} site(s) and all their
            stations, tasks and routes into <strong>{ENVIRONMENTS[dstEnv].label}</strong>. There is no automatic rollback.
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>Type <code>{expectedPhrase}</code> to continue:</Typography>
          <TextField fullWidth size="small" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" disabled={confirmText !== expectedPhrase} onClick={executeMigration}>
            Migrate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}


export default function GenerateTaskImagesPage() {
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    getingData_Places()  // Use directly - it already returns parsed data
      .then(setSites)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const { t } = useTranslation();
  const existingTheme = useTheme();
  const direction = t('Direction');

  const theme = React.useMemo(() =>
    createTheme({}, t('localeText', { returnObjects: true }), existingTheme, { direction }),
    [existingTheme, direction],
  );

  const cache = direction === 'rtl' ? cacheRtl : cacheLtr;

  if (loading) return <p>Loading sites...</p>;

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <div dir={direction} style={{ padding: 24 }}>
          <Typography variant="h4" style={{ fontSize: '2rem', fontWeight: 'bold', color: '#114260', margin: '20px 0 24px 0', textAlign: 'center' }}>
            Developer Tools
          </Typography>

          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} style={{ marginBottom: 24 }}>
            <Tab label="Task Image Generator" />
            <Tab label="Task Simulation" />
            <Tab label="Environment Migration" />
          </Tabs>

          {tabValue === 0 && (
            <div>
              <h1>AI Task Image Generator</h1>
              <p>Generate visual instructions for each task</p>

              {/* Site Selector */}
              <select
                style={{ padding: 10, marginBottom: 24, width: 320 }}
                value={selectedSite?.id || ""}
                onChange={(e) =>
                  setSelectedSite(
                    sites.find((s) => s.id === e.target.value)
                  )
                }
              >
                <option value="">Select a site</option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>

              {/* Task Images */}
              {selectedSite && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: 24,
                  }}
                >
                  {selectedSite.tasks.map((task, index) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      index={index}
                      selectedSite={selectedSite}
                      onTaskUpdated={(taskId, newImageUrl) => {
                        console.log(`Task ${taskId} updated with image: ${newImageUrl}`);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {tabValue === 1 && (
            <SimulationComponent />
          )}

          {tabValue === 2 && (
            <EnvironmentMigration />
          )}
        </div>
      </ThemeProvider>
    </CacheProvider>
  );
}