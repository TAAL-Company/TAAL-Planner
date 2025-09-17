import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Icon,
  IconButton,
  InputAdornment,
  Paper,
  Avatar,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Chip,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Alert,
  Skeleton,
  Tooltip,
} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import TableViewIcon from '@mui/icons-material/TableView';
import CloseIcon from '@mui/icons-material/Close';
import TaskIcon from '@mui/icons-material/Task';
import TuneIcon from '@mui/icons-material/Tune';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
import ImageIcon from '@mui/icons-material/Image';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import { useTranslation } from "react-i18next";
import { usePollinationsChat, usePollinationsImage } from '@pollinations/react';
import ReactMarkdown from 'react-markdown';
import "../../i18n"; // ensure i18n is initialized

export default function SearchUI() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [isTableOpen, setIsTableOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [complexity, setComplexity] = useState('');
  const [selectedComplexity, setSelectedComplexity] = useState('Medium');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [customSystemPrompt, setCustomSystemPrompt] = useState('');
  const [imagePrompts, setImagePrompts] = useState({}); // Store image prompts for each task
  const [editingTask, setEditingTask] = useState(null); // Track which task is being edited
  const [editFormData, setEditFormData] = useState({ title: '', subtitle: '', estimatedTimeMinutes: 0 });
  const chatContainerRef = useRef(null);

  // Get direction for RTL/LTR support
  const direction = t('Direction');
  const isRTL = direction === 'rtl';

  // Complexity options with i18n support
  const complexityOptions = [
    { value: 'Basic', label: `${t('TextGenerative.basic')} (${isRTL ? 'בסיסי' : 'Basic'})` },
    { value: 'Medium', label: `${t('TextGenerative.medium')} (${isRTL ? 'בינוני' : 'Medium'})` },
    { value: 'High', label: `${t('TextGenerative.high')} (${isRTL ? 'גבוה' : 'High'})` }
  ];

  // Default editable part of system prompt
  const defaultEditablePrompt = `You are Taal AI Assistant.
Your role is to take a user's request (a short free-text prompt) and turn it into a structured, easy-to-follow task plan inside Taal.work.

Accessibility Rules:
- Keep language short, clear, and simple.
- Avoid technical jargon; use plain explanations.
- Use subtitles to make tasks easier to understand when needed.
- Basic (בסיסי): 2–3 small steps, quick and simple (~5–15 min).
- Medium (בינוני): 4–6 steps, more detail, medium effort (~15–45 min).
- High (גבוה): 7–10 steps, detailed and structured, longer effort (~45+ min).
- If the user's request is vague, ask gentle clarifying questions first.

When a user asks for a task breakdown, respond with the JSON structure above. For other conversations, respond normally.`;

  // Fixed JSON structure part
  const fixedJsonStructure = `Always output tasks as JSON with this structure:
{
  "complexity": "Basic | Medium | High (בסיסי | בינוני | גבוה)",
  "tasks": [
    {
      "title": "Short and clear task title",
      "subtitle": "Optional plain-language instruction",
      "estimatedTimeMinutes": number
    }
  ]
}`;

  // Initialize custom prompt with default
  useEffect(() => {
    if (!customSystemPrompt) {
      setCustomSystemPrompt(defaultEditablePrompt);
    }
  }, []);

  // Complete system prompt combining custom and fixed parts
  const systemPrompt = `${customSystemPrompt}\n\n${fixedJsonStructure}`;

  const { sendUserMessage, messages, loading } = usePollinationsChat([
    { role: "system", content: systemPrompt }
  ], {
    seed: 42,
    model: 'openai'
  });

  // Check if chat has started
  const hasChatStarted = messages.length > 1;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Parse JSON from AI responses to extract tasks
  useEffect(() => {
    if (messages.length > 1 && !loading) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        try {
          // Look for JSON in the response
          const jsonMatch = lastMessage.content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const taskData = JSON.parse(jsonMatch[0]);
            if (taskData.tasks && Array.isArray(taskData.tasks)) {
              setTasks(taskData.tasks);
              setComplexity(taskData.complexity);
              setIsTableOpen(true); // Auto-open table when tasks are generated
              // Clear previous images when new tasks are loaded
              setImagePrompts({});
              setEditingTask(null); // Clear any editing state
            }
          }
        } catch (error) {
          console.log('No valid task JSON found in response');
        }
      }
    }
  }, [messages, loading]);

  // Function to trigger image generation for a specific task
  const generateTaskImage = useCallback((taskIndex, task) => {
    const taskKey = `task_${taskIndex}`;
    
    // Create a descriptive prompt for the image
    const imagePrompt = `Professional illustration of: ${task.title}. ${task.subtitle || ''}. Clean, modern, task-oriented visual representation. No text in image.`;
    
    // Set the prompt which will trigger the usePollinationsImage hook
    setImagePrompts(prev => ({ 
      ...prev, 
      [taskKey]: `${imagePrompt}_${Date.now()}_${Math.random()}` // Add unique identifier to force regeneration
    }));
  }, []);

  // Helper function to update image prompts indices when tasks are reordered
  const updateImagePromptsIndices = useCallback((insertIndex, isDelete = false, deleteIndex = null) => {
    const updatedImagePrompts = {};
    
    Object.keys(imagePrompts).forEach(key => {
      const index = parseInt(key.split('_')[1]);
      
      if (isDelete) {
        // For deletion: skip deleted index, shift down indices after deleted
        if (index < deleteIndex) {
          updatedImagePrompts[key] = imagePrompts[key];
        } else if (index > deleteIndex) {
          const newKey = `task_${index - 1}`;
          updatedImagePrompts[newKey] = imagePrompts[key];
        }
      } else {
        // For insertion: shift up indices at and after insert position
        if (index < insertIndex) {
          updatedImagePrompts[key] = imagePrompts[key];
        } else {
          const newKey = `task_${index + 1}`;
          updatedImagePrompts[newKey] = imagePrompts[key];
        }
      }
    });
    
    setImagePrompts(updatedImagePrompts);
  }, [imagePrompts]);

  // Task editing functions
  const startEditingTask = (taskIndex) => {
    const task = tasks[taskIndex];
    setEditingTask(taskIndex);
    setEditFormData({
      title: task.title,
      subtitle: task.subtitle || '',
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
        estimatedTimeMinutes: parseInt(editFormData.estimatedTimeMinutes) || 0
      };
      setTasks(updatedTasks);
      setEditingTask(null);
      setEditFormData({ title: '', subtitle: '', estimatedTimeMinutes: 0 });
    }
  };

  const deleteTask = (taskIndex) => {
    const updatedTasks = tasks.filter((_, index) => index !== taskIndex);
    setTasks(updatedTasks);
    
    // Update image prompts indices
    updateImagePromptsIndices(null, true, taskIndex);
    
    // Cancel editing if we're editing the deleted task
    if (editingTask === taskIndex) {
      cancelEditingTask();
    } else if (editingTask > taskIndex) {
      setEditingTask(editingTask - 1);
    }
  };

  // Add task after a specific task (insert at position + 1)
  const addTaskAfter = (taskIndex) => {
    const newTask = {
      title: "New Task",
      subtitle: "Task description", 
      estimatedTimeMinutes: 30
    };
    
    const insertIndex = taskIndex + 1;
    const updatedTasks = [...tasks];
    updatedTasks.splice(insertIndex, 0, newTask);
    setTasks(updatedTasks);
    
    // Update image prompts indices for tasks that come after the insertion point
    updateImagePromptsIndices(insertIndex);
    
    // Adjust editing task index if needed
    if (editingTask !== null && editingTask >= insertIndex) {
      setEditingTask(editingTask + 1);
    }
    
    // Start editing the new task immediately
    setTimeout(() => {
      startEditingTask(insertIndex);
    }, 0);
  };

  const addNewTask = () => {
    const newTask = {
      title: "New Task",
      subtitle: "Task description",
      estimatedTimeMinutes: 30
    };
    setTasks([...tasks, newTask]);
    
    // Start editing the new task immediately
    setTimeout(() => {
      startEditingTask(tasks.length);
    }, 0);
  };

  const handleSend = () => {
    if (input.trim() && !loading) {
      // Include complexity preference in the message
      const complexityInfo = complexityOptions.find(opt => opt.value === selectedComplexity);
      const messageWithComplexity = `${input}\n\nPlease create a task breakdown with ${complexityInfo.label} complexity level.`;
      sendUserMessage(messageWithComplexity);
      setInput('');
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const toggleTable = () => {
    setIsTableOpen(!isTableOpen);
  };

  const handleSettingsOpen = () => {
    setIsSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setIsSettingsOpen(false);
  };

  const handleSaveSettings = () => {
    setIsSettingsOpen(false);
    // The systemPrompt will be automatically updated due to the dependency
  };

  const handleResetToDefault = () => {
    setCustomSystemPrompt(defaultEditablePrompt);
  };

  const getComplexityColor = (complexity) => {
    if (complexity.includes('Basic') || complexity.includes('בסיסי')) return 'success';
    if (complexity.includes('Medium') || complexity.includes('בינוני')) return 'warning';
    if (complexity.includes('High') || complexity.includes('גבוה')) return 'error';
    return 'default';
  };

  const formatTime = (minutes) => {
    if (minutes < 60) {
      return `~${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `~${hours}h ${remainingMinutes}min` : `~${hours}h`;
    }
  };

  const totalTime = tasks.reduce((sum, task) => sum + task.estimatedTimeMinutes, 0);

  // Component for individual task images
  const TaskImage = React.memo(({ taskIndex, task }) => {
    const taskKey = `task_${taskIndex}`;
    const imagePrompt = imagePrompts[taskKey];
    
    const imageUrl = usePollinationsImage(imagePrompt || null, {
      width: 400,
      height: 300,
      seed: taskIndex + 42, // Use a more stable seed
      model: 'flux',
      nologo: true
    });

    const hasImage = imageUrl && imagePrompt;
    const isGenerating = imagePrompt && !imageUrl;

    return (
      <Box
        sx={{
          width: 80,
          height: 60,
          bgcolor: "#1a1a1a",
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          border: isGenerating ? "1px solid #4a9eff" : "1px solid #333",
          transition: "border-color 0.3s ease",
        }}
      >
        {hasImage ? (
          <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
            <img
              src={imageUrl}
              alt={task.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "4px",
              }}
            />
            {/* Regenerate overlay on hover */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: "rgba(0,0,0,0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0,
                transition: "opacity 0.2s",
                "&:hover": { opacity: 1 },
                cursor: "pointer",
              }}
              onClick={() => generateTaskImage(taskIndex, task)}
            >
              <RefreshIcon sx={{ color: "white", fontSize: 20 }} />
            </Box>
          </Box>
        ) : isGenerating ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              width: "100%",
              height: "100%",
              bgcolor: "rgba(74, 158, 255, 0.1)",
            }}
          >
            <CircularProgress 
              size={24} 
              sx={{ 
                color: "#4a9eff",
                animation: "pulse 2s infinite",
                "@keyframes pulse": {
                  "0%": {
                    opacity: 1,
                  },
                  "50%": {
                    opacity: 0.5,
                  },
                  "100%": {
                    opacity: 1,
                  },
                },
              }} 
            />
            <Typography 
              variant="caption" 
              sx={{ 
                color: "#4a9eff", 
                fontSize: "0.6rem",
                textAlign: "center",
                lineHeight: 1,
              }}
            >
              Generating...
            </Typography>
          </Box>
        ) : (
          <Tooltip title="Generate Image">
            <IconButton
              size="small"
              onClick={() => generateTaskImage(taskIndex, task)}
              sx={{
                color: "#4a9eff",
                "&:hover": {
                  bgcolor: "rgba(74, 158, 255, 0.1)",
                  transform: "scale(1.1)",
                },
                transition: "all 0.2s ease",
              }}
            >
              <ImageIcon sx={{ fontSize: 24 }} />
            </IconButton>
          </Tooltip>
        )}
        
        {/* Loading overlay for when switching from no image to generating */}
        {isGenerating && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: "rgba(26, 26, 26, 0.9)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.5,
              animation: "fadeIn 0.3s ease-in",
              "@keyframes fadeIn": {
                "0%": {
                  opacity: 0,
                },
                "100%": {
                  opacity: 1,
                },
              },
            }}
          >
            <CircularProgress 
              size={20} 
              sx={{ 
                color: "#4a9eff",
              }} 
            />
            <Box
              sx={{
                width: "80%",
                height: 2,
                bgcolor: "#333",
                borderRadius: 1,
                overflow: "hidden",
                mt: 0.5,
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  bgcolor: "#4a9eff",
                  borderRadius: 1,
                  animation: "loading 2s infinite",
                  "@keyframes loading": {
                    "0%": {
                      transform: "translateX(-100%)",
                    },
                    "100%": {
                      transform: "translateX(100%)",
                    },
                  },
                }}
              />
            </Box>
          </Box>
        )}
      </Box>
    );
  });

  // Loading skeleton component for AI response
  const LoadingSkeleton = () => (
    <Box
      sx={{
        display: "flex",
        justifyContent: isRTL ? "flex-end" : "flex-start",
        mb: 2,
        direction: direction,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1,
          maxWidth: "70%",
          flexDirection: isRTL ? "row" : "row",
        }}
      >
        <Avatar
          sx={{
            bgcolor: "#ff6b35",
            width: 32,
            height: 32,
            fontSize: "14px",
          }}
        >
          🤖
        </Avatar>
        <Paper
          sx={{
            p: 2,
            bgcolor: "#3a3a3a",
            color: "white",
            borderRadius: "15px",
            direction: direction,
            minWidth: "200px",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <CircularProgress size={16} sx={{ color: "#4a9eff" }} />
            <Typography variant="body2" sx={{ color: "#4a9eff" }}>
              {t('TextGenerative.generatingTasks')}
            </Typography>
          </Box>
          <Skeleton variant="text" width="100%" height={20} sx={{ bgcolor: "#2a2a2a" }} />
          <Skeleton variant="text" width="80%" height={20} sx={{ bgcolor: "#2a2a2a" }} />
          <Skeleton variant="text" width="90%" height={20} sx={{ bgcolor: "#2a2a2a" }} />
          <Skeleton variant="rectangular" width="100%" height={60} sx={{ bgcolor: "#2a2a2a", mt: 1, borderRadius: 1 }} />
        </Paper>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        bgcolor: "#1e1e1e",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: hasChatStarted ? "flex-start" : "center",
        color: "white",
        padding: 2,
        position: "relative",
        transition: "justify-content 0.5s ease",
        direction: direction,
      }}
    >
      {/* Settings FAB in top corner - position based on direction */}
      <Fab
        color="primary"
        size="small"
        onClick={handleSettingsOpen}
        sx={{
          position: "absolute",
          top: 16,
          [isRTL ? 'left' : 'right']: 16,
          bgcolor: "#4a9eff",
          "&:hover": {
            bgcolor: "#3a8eef",
          },
          zIndex: 1000,
        }}
      >
        <SettingsIcon />
      </Fab>

      {/* Settings Dialog */}
      <Dialog
        open={isSettingsOpen}
        onClose={handleSettingsClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "#2b2b2b",
            color: "white",
            direction: direction,
          },
        }}
      >
        <DialogTitle sx={{ 
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 1,
          direction: direction,
        }}>
          <SettingsIcon sx={{ color: "#4a9eff" }} />
          {t('TextGenerative.systemPromptSettings')}
        </DialogTitle>
        <DialogContent sx={{ direction: direction }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, color: "#4a9eff" }}>
              {t('TextGenerative.editableInstructions')}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={12}
              value={customSystemPrompt}
              onChange={(e) => setCustomSystemPrompt(e.target.value)}
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "#3a3a3a",
                  color: "white",
                  direction: "ltr", // Keep code LTR regardless of UI direction
                  "& fieldset": {
                    borderColor: "#4a4a4a",
                  },
                  "&:hover fieldset": {
                    borderColor: "#6a6a6a",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#4a9eff",
                  },
                },
              }}
            />
          </Box>

          <Divider sx={{ bgcolor: "#4a4a4a", my: 2 }} />

          <Box>
            <Typography variant="h6" sx={{ mb: 2, color: "#ff6b35" }}>
              {t('TextGenerative.fixedJsonStructure')}
            </Typography>
            <Alert 
              severity="info" 
              sx={{ 
                mb: 2,
                bgcolor: "#1a3a5c",
                color: "white",
                direction: direction,
                "& .MuiAlert-icon": {
                  color: "#4a9eff",
                },
              }}
            >
              {t('TextGenerative.fixedJsonDescription')}
            </Alert>
            <Paper
              sx={{
                bgcolor: "#1a1a1a",
                color: "#ccc",
                p: 2,
                borderRadius: 1,
                fontFamily: "monospace",
                fontSize: "0.9rem",
                border: "1px solid #4a4a4a",
                direction: "ltr", // Keep JSON LTR
              }}
            >
              <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                {fixedJsonStructure}
              </pre>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1, direction: direction }}>
          <Button
            onClick={handleResetToDefault}
            variant="outlined"
            sx={{
              color: "#ff6b35",
              borderColor: "#ff6b35",
              "&:hover": {
                bgcolor: "rgba(255, 107, 53, 0.1)",
                borderColor: "#ff6b35",
              },
            }}
          >
            {t('TextGenerative.resetToDefault')}
          </Button>
          <Button
            onClick={handleSettingsClose}
            variant="outlined"
            sx={{
              color: "gray",
              borderColor: "gray",
              "&:hover": {
                bgcolor: "rgba(128, 128, 128, 0.1)",
                borderColor: "gray",
              },
            }}
          >
            {t('TextGenerative.cancel')}
          </Button>
          <Button
            onClick={handleSaveSettings}
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{
              bgcolor: "#4a9eff",
              "&:hover": {
                bgcolor: "#3a8eef",
              },
            }}
          >
            {t('TextGenerative.saveSettings')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Title */}
      <Box sx={{ 
        display: "flex", 
        alignItems: "center", 
        gap: 0, 
        mb: hasChatStarted ? 3 : 6, 
        mt: hasChatStarted ? 2 : 0,
        transition: "all 0.5s ease",
        direction: direction,
      }}>
        <Icon
          sx={{
            width: 100,
            height: 106,
            backgroundImage: "url('../../Pictures/logo_Taal_Ai.svg')",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            borderRadius: 1,
            transform: isRTL ? "none" : "scaleX(-1)",
          }}
        />
        <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <Typography variant="h5">{t("TextGenerative.title")}</Typography>
          <Typography variant="body2" sx={{ color: "gray" }}>
            {t("TextGenerative.subtitle")}
          </Typography>
        </Box>
      </Box>

      {/* Action Buttons - Only show when chat has started */}
      {hasChatStarted && (
        <Box sx={{ 
          display: "flex", 
          gap: 2, 
          mb: 2, 
          alignSelf: isRTL ? "flex-end" : "flex-start", 
          maxWidth: "100%", 
          width: "100%",
          opacity: hasChatStarted ? 1 : 0,
          transform: hasChatStarted ? "translateY(0)" : "translateY(-20px)",
          transition: "all 0.5s ease",
          direction: direction,
        }}>
          <Button
            variant={isTableOpen ? "contained" : "outlined"}
            startIcon={<TaskIcon />}
            onClick={toggleTable}
            disabled={tasks.length === 0}
            sx={{
              color: isTableOpen ? "white" : "#4a9eff",
              borderColor: "#4a9eff",
              bgcolor: isTableOpen ? "#4a9eff" : "transparent",
              "&:hover": {
                bgcolor: isTableOpen ? "#3a8eef" : "rgba(74, 158, 255, 0.1)",
              },
              "&:disabled": {
                color: "gray",
                borderColor: "gray",
              },
            }}
          >
            {isTableOpen ? t('TextGenerative.hideTasks') : `${t('TextGenerative.showTasks')} ${tasks.length > 0 ? `(${tasks.length})` : ''}`}
          </Button>
          {complexity && (
            <Chip
              label={complexity}
              color={getComplexityColor(complexity)}
              size="small"
              sx={{ alignSelf: "center" }}
            />
          )}
        </Box>
      )}

      {/* Main Content Area - Chat and Table Side by Side */}
      {hasChatStarted && (
        <Box sx={{ 
          display: "flex", 
          gap: 2, 
          width: "100%", 
          flex: 1,
          mb: 2,
          opacity: hasChatStarted ? 1 : 0,
          transform: hasChatStarted ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.5s ease",
          direction: direction,
        }}>
          {/* Chat Messages Container */}
          <Paper
            ref={chatContainerRef}
            sx={{
              flex: isTableOpen ? 2 : 1,
              bgcolor: "#2b2b2b",
              overflowY: "auto",
              p: 2,
              borderRadius: "15px",
              transition: "all 0.3s ease",
              direction: direction,
            }}
          >
            {messages.slice(1).map((msg, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  justifyContent: msg.role === 'user' ? 
                    (isRTL ? "flex-start" : "flex-end") : 
                    (isRTL ? "flex-end" : "flex-start"),
                  mb: 2,
                  direction: direction,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1,
                    maxWidth: "70%",
                    flexDirection: msg.role === 'user'
                      ? (isRTL ? "row-reverse" : "row-reverse")
                      : (isRTL ? "row" : "row"),
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: msg.role === 'user' ? "#4a9eff" : "#ff6b35",
                      width: 32,
                      height: 32,
                      fontSize: "14px",
                    }}
                  >
                    {msg.role === 'user' ? '👤' : '🤖'}
                  </Avatar>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: msg.role === 'user' ? "#4a9eff" : "#3a3a3a",
                      color: "white",
                      borderRadius: "15px",
                      direction: direction,
                      "& .markdown-content": {
                        "& p": { margin: 0 },
                        "& pre": {
                          bgcolor: "#1a1a1a",
                          p: 1,
                          borderRadius: 1,
                          overflow: "auto",
                          direction: "ltr",
                        },
                        "& code": {
                          bgcolor: "#1a1a1a",
                          px: 0.5,
                          borderRadius: 0.5,
                        },
                      },
                    }}
                  >
                    <Box className="markdown-content">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </Box>
                  </Paper>
                </Box>
              </Box>
            ))}
            
            {/* Show loading skeleton when AI is responding */}
            {loading && <LoadingSkeleton />}
          </Paper>

          {/* Tasks Table Panel */}
          {isTableOpen && (
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
                  <IconButton onClick={() => setIsTableOpen(false)} sx={{ color: "gray" }}>
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
                        <React.Fragment key={index}>
                          <TableRow
                            sx={{
                              "&:hover": { bgcolor: "#3a3a3a" },
                              "& td": { borderColor: "#4a4a4a" },
                              bgcolor: editingTask === index ? "rgba(74, 158, 255, 0.1)" : "transparent",
                            }}
                          >
                            {/* Image Cell */}
                            <TableCell sx={{ padding: 1 }}>
                              <TaskImage taskIndex={index} task={task} />
                            </TableCell>
                            
                            {/* Title Cell */}
                            <TableCell sx={{ color: "white", fontSize: "0.8rem", fontWeight: "bold" }}>
                              {editingTask === index ? (
                                <TextField
                                  fullWidth
                                  value={editFormData.title}
                                  onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
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
                                  onChange={(e) => setEditFormData({...editFormData, subtitle: e.target.value})}
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
                                  onChange={(e) => setEditFormData({...editFormData, estimatedTimeMinutes: e.target.value})}
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
                                {/* Add Task After Button - only show when not editing */}
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
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Table Footer */}
                <Box sx={{ p: 2, borderTop: "1px solid #4a4a4a" }}>
                  <Typography variant="body2" sx={{ color: "gray", mb: 1 }}>
                    {t('TextGenerative.total')}: {tasks.length} {t('TextGenerative.tasks')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#4a9eff", fontWeight: "bold" }}>
                    {t('TextGenerative.estimatedTime')}: {formatTime(totalTime)}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}
        </Box>
      )}

      {/* Input Container with Complexity Selector */}
      <Box sx={{
        display: "flex",
        gap: 1,
        width: "100%",
        maxWidth: hasChatStarted ? "1400px" : "800px",
        alignItems: "flex-end",
        justifyContent: "center",
        transition: "all 0.5s ease",
        mt: hasChatStarted ? 0 : 4,
        direction: direction,
      }}>
        {/* Input Field */}
        <TextField
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={t('TextGenerative.placeholder')}
          variant="outlined"
          multiline
          maxRows={4}
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position={isRTL ? "end" : "start"}>
                <IconButton disabled={loading}>
                  <AddIcon sx={{ color: loading ? "#666" : "gray", fontSize: "18px" }} />
                </IconButton>
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position={isRTL ? "start" : "end"}>
                {/* Complexity Selector */}
                <FormControl sx={{ minWidth: 160 }}>
                  <Select
                    value={selectedComplexity}
                    onChange={(e) => setSelectedComplexity(e.target.value)}
                    size="small"
                    disabled={loading}
                    startAdornment={
                      <InputAdornment position="start">
                        <TuneIcon sx={{ color: loading ? "#666" : "#4a9eff", fontSize: "18px", mr: 0.5 }} />
                      </InputAdornment>
                    }
                    sx={{
                      bgcolor: "#2b2b2b",
                      color: "white",
                      borderRadius: "25px",
                      height: "50px",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: loading ? "#666" : "#4a4a4a",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: loading ? "#666" : "#6a6a6a",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: loading ? "#666" : "#4a9eff",
                      },
                      "& .MuiSelect-icon": {
                        color: loading ? "#666" : "#4a9eff",
                      },
                      "&.Mui-disabled": {
                        color: "#888",
                      },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          bgcolor: "#2b2b2b",
                          color: "white",
                          "& .MuiMenuItem-root": {
                            direction: direction,
                            "&:hover": {
                              bgcolor: "#3a3a3a",
                            },
                            "&.Mui-selected": {
                              bgcolor: "#4a9eff",
                              "&:hover": {
                                bgcolor: "#3a8eef",
                              },
                            },
                          },
                        },
                      },
                    }}
                  >
                    {complexityOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Chip
                            label={option.value}
                            color={getComplexityColor(option.label)}
                            size="small"
                            sx={{ minWidth: 50 }}
                          />
                          <Typography variant="body2">
                            {option.label.split('(')[1]?.replace(')', '') || option.label}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <IconButton
                  sx={{ 
                    color: (input.trim() && !loading) ? "#4a9eff" : "gray",
                    position: "relative",
                  }}
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                >
                  {loading ? (
                    <CircularProgress 
                      size={20} 
                      sx={{ 
                        color: "#4a9eff",
                        position: "absolute",
                      }} 
                    />
                  ) : (
                    <SendIcon sx={{
                      transform: isRTL ? "scaleX(-1)" : "none"
                    }} />
                  )}
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              borderRadius: "30px",
              bgcolor: "#2b2b2b",
              color: "white",
              minHeight: "50px",
              direction: direction,
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: loading ? "#666" : "#4a4a4a",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: loading ? "#666" : "#6a6a6a",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: loading ? "#666" : "#4a9eff",
              },
              "&.Mui-disabled": {
                color: "#888",
              },
            },
          }}
          sx={{ flex: 1 }}
        />
      </Box>
    </Box>
  );
}