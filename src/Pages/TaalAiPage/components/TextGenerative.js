import React, { useState, useEffect } from "react";
import {Box,Typography,Icon,Button,Chip,Dialog,DialogTitle,DialogContent,DialogActions,Fab,Alert,Paper,TextField,Divider } from "@mui/material";
import SettingsIcon from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
import TaskIcon from '@mui/icons-material/Task';
import { useTranslation } from "react-i18next";
import { usePollinationsChat } from '@pollinations/react';
import TaskTable from './TaskTable';
import ChatContainer from './ChatContainer';
import InputContainer from './InputContainer';
import "../../../i18n";

export default function SearchUI() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [isTableOpen, setIsTableOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [complexity, setComplexity] = useState('');
  const [selectedComplexity, setSelectedComplexity] = useState('Medium');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [customSystemPrompt, setCustomSystemPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasTasksReady, setHasTasksReady] = useState(false);

  // Add seed to image generation settings state
  const [imagePromptPrefix, setImagePromptPrefix] = useState('Professional illustration of: ');
  const [imagePromptSuffix, setImagePromptSuffix] = useState(' Clean, modern, task-oriented visual representation. No text in image.');
  const [imageWidth, setImageWidth] = useState(400);
  const [imageHeight, setImageHeight] = useState(300);
  const [imageModel, setImageModel] = useState('flux');
  const [imageNoLogo, setImageNoLogo] = useState(true);
  const [imageSeed, setImageSeed] = useState(42); // Add seed setting

  // Get direction for RTL/LTR support
  const direction = t('Direction');
  const isRTL = direction === 'rtl';

  // Default editable part of system prompt
  const defaultEditablePrompt = `
You are TAAL's internal AI Route Builder. Your task is to take either a free-text description (Hebrew or English) or a structured Excel input and generate a production-ready route for the TAAL platform.

Core Instructions

Input

The user may write the job description in Hebrew or English.

Regardless of input language, always generate output with Hebrew first and English fallback.

Route Structure

A route consists of Stations → Tasks.

Default stations (if not otherwise specified):

Preparation Station – setup, workspace readiness.

Work Station – main job execution (must contain the central part of the work).

Finishing Station – cleanup, organization, shutdown.

Additional stations may be added depending on the description.

Tasks

Each station should contain as many tasks as needed to fully complete it.

No fixed limit:

Preparation/Finishing usually fewer tasks.

Work Station may have many tasks (10–15 or more for complex jobs).

Tasks must be short, precise, and action-oriented (≤12 words).

Always provide both Hebrew and English text.

Difficulty Levels

User chooses: Basic / Medium / High.

Basic: simpler, fewer tasks.

Medium: moderate detail.

High: more tasks, detailed and structured.

All levels must achieve the same end-goal.

Monotone / Quantity Work

If the description implies repetitive or quantity-based work (e.g., producing multiple items), design the Work Station tasks so they are naturally suitable for looping later (last task can flow back to the first).

Do not implement the loop directly; only structure tasks clearly.

Accessibility

Always adapt language for employees with cognitive disabilities: simple, direct, step-by-step.

Avoid idioms and abstract terms
  `;

  // Fixed JSON structure part
  const fixedJsonStructure = `Always output tasks as JSON with this structure:
{
  "complexity": "Basic | Medium | High (בסיסי | בינוני | גבוה)",
  "tasks": [
    {
      "title": "Short and clear task title",
      "subtitle": "Optional plain-language instruction",
      "estimatedTimeMinutes": number,
      "picture_url": ""
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

  const { sendUserMessage, messages, loading: hookLoading } = usePollinationsChat([
    { role: "system", content: systemPrompt }
  ], {
    seed: 42,
    model: 'openai'
  });

  // Sync our loading state with the hook's loading state
  useEffect(() => {
    if (hookLoading !== undefined) {
      setLoading(hookLoading);
      console.log("Hook loading state:", hookLoading);
    }
  }, [hookLoading]);

  useEffect(() => {
    if (messages[messages.length - 1]?.role === 'assistant') {
      setLoading(false); // Reset loading when AI responds
    }
  }, [messages]);

  // Check if chat has started
  const hasChatStarted = messages.length > 1;

  // Parse JSON from AI responses to extract tasks
  useEffect(() => {
    if (messages.length > 1 && !loading) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        try {
          const jsonMatch = lastMessage.content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const taskData = JSON.parse(jsonMatch[0]);
            if (taskData.tasks && Array.isArray(taskData.tasks)) {
              // Ensure each task has a picture_url field
              const tasksWithImageUrl = taskData.tasks.map(task => ({
                ...task,
                picture_url: task.picture_url || ''
              }));
              setTasks(tasksWithImageUrl);
              setComplexity(taskData.complexity);
              setHasTasksReady(true); // Mark that tasks are ready
            }
          }
        } catch (error) {
          console.log('No valid task JSON found in response');
          setHasTasksReady(false);
        }
      }
    }
  }, [messages, loading]);

  // Function to trigger image generation for a specific task
  // const imagePromptSuffix = ` Clean, modern, task-oriented visual representation. No text in image.`;

  const getComplexityColor = (complexity) => {
    if (complexity.includes('Basic') || complexity.includes('בסיסי')) return 'success';
    if (complexity.includes('Medium') || complexity.includes('בינוני')) return 'warning';
    if (complexity.includes('High') || complexity.includes('גבוה')) return 'error';
    return 'default';
  };

  const handleSend = async () => {
    if (input.trim() && !loading) {
      try {
        setLoading(true);
        setHasTasksReady(false); // Reset tasks ready state
        setIsTableOpen(false); // Close table if open
        const complexityOptions = [
          { value: 'Basic', label: `${t('TextGenerative.basic')} (${isRTL ? 'בסיסי' : 'Basic'})` },
          { value: 'Medium', label: `${t('TextGenerative.medium')} (${isRTL ? 'בינוני' : 'Medium'})` },
          { value: 'High', label: `${t('TextGenerative.high')} (${isRTL ? 'גבוה' : 'High'})` }
        ];
        const complexityInfo = complexityOptions.find(opt => opt.value === selectedComplexity);
        const messageWithComplexity = `${input}\n\nPlease create a task breakdown with ${complexityInfo.label} complexity level.`;
        await sendUserMessage(messageWithComplexity);
        setInput('');
      } catch (error) {
        console.error('Error sending message:', error);
        setLoading(false);
      }
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleShowTasks = (taskDataFromMessage = null) => {
    if (taskDataFromMessage) {
      // Update state with task data from the specific message
      setTasks(taskDataFromMessage.tasks);
      setComplexity(taskDataFromMessage.complexity);
      setHasTasksReady(true);
    }
    setIsTableOpen(true);
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
  };

  const handleResetToDefault = () => {
    setCustomSystemPrompt(defaultEditablePrompt);
    // Reset image settings to default
    setImagePromptPrefix('Professional illustration of: ');
    setImagePromptSuffix(' Clean, modern, task-oriented visual representation. No text in image.');
    setImageWidth(400);
    setImageHeight(300);
    setImageModel('flux');
    setImageNoLogo(true);
    setImageSeed(42); // Reset seed to default
  };

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
        paddingBottom: hasChatStarted ? "120px" : 2,
        position: "relative",
        transition: "justify-content 0.5s ease",
        direction: direction,
      }}
    >
      {/* Settings FAB */}
      <Fab
        color="primary"
        size="small"
        onClick={handleSettingsOpen}
        sx={{
          position: "absolute",
          top: 16,
          [isRTL ? 'left' : 'right']: 16,
          bgcolor: "#4a9eff",
          "&:hover": { bgcolor: "#3a8eef" },
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
            maxHeight: "90vh",
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
        <DialogContent sx={{ direction: direction, overflow: "auto" }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, color: "#4a9eff" }}>
              {t('TextGenerative.editableInstructions')}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={8}
              value={customSystemPrompt}
              onChange={(e) => setCustomSystemPrompt(e.target.value)}
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "#3a3a3a",
                  color: "white",
                  direction: "ltr",
                  "& fieldset": { borderColor: "#4a4a4a" },
                  "&:hover fieldset": { borderColor: "#6a6a6a" },
                  "&.Mui-focused fieldset": { borderColor: "#4a9eff" },
                },
              }}
            />
          </Box>

          <Divider sx={{ bgcolor: "#4a4a4a", my: 2 }} />

          {/* Image Generation Settings */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, color: "#ff6b35" }}>
              {t('TextGenerative.imageGenerationSettings')}
            </Typography>
            
            {/* Image Prompt Settings */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: "#ccc" }}>
                {t('TextGenerative.imagePromptPrefix')}:
              </Typography>
              <TextField
                fullWidth
                value={imagePromptPrefix}
                onChange={(e) => setImagePromptPrefix(e.target.value)}
                variant="outlined"
                size="small"
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#3a3a3a",
                    color: "white",
                    "& fieldset": { borderColor: "#4a4a4a" },
                    "&:hover fieldset": { borderColor: "#6a6a6a" },
                    "&.Mui-focused fieldset": { borderColor: "#4a9eff" },
                  },
                }}
              />
              <Typography variant="subtitle2" sx={{ mb: 1, color: "#ccc" }}>
                {t('TextGenerative.imagePromptSuffix')}:
              </Typography>
              <TextField
                fullWidth
                value={imagePromptSuffix}
                onChange={(e) => setImagePromptSuffix(e.target.value)}
                variant="outlined"
                size="small"
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#3a3a3a",
                    color: "white",
                    "& fieldset": { borderColor: "#4a4a4a" },
                    "&:hover fieldset": { borderColor: "#6a6a6a" },
                    "&.Mui-focused fieldset": { borderColor: "#4a9eff" },
                  },
                }}
              />
            </Box>

            {/* Image Dimensions */}
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextField
                label={t('TextGenerative.width')}
                type="number"
                value={imageWidth}
                onChange={(e) => setImageWidth(parseInt(e.target.value) || 400)}
                variant="outlined"
                size="small"
                inputProps={{ min: 100, max: 1024 }}
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#3a3a3a",
                    color: "white",
                    "& fieldset": { borderColor: "#4a4a4a" },
                    "&:hover fieldset": { borderColor: "#6a6a6a" },
                    "&.Mui-focused fieldset": { borderColor: "#4a9eff" },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#ccc",
                    "&.Mui-focused": { color: "#4a9eff" },
                  },
                }}
              />
              <TextField
                label={t('TextGenerative.height')}
                type="number"
                value={imageHeight}
                onChange={(e) => setImageHeight(parseInt(e.target.value) || 300)}
                variant="outlined"
                size="small"
                inputProps={{ min: 100, max: 1024 }}
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#3a3a3a",
                    color: "white",
                    "& fieldset": { borderColor: "#4a4a4a" },
                    "&:hover fieldset": { borderColor: "#6a6a6a" },
                    "&.Mui-focused fieldset": { borderColor: "#4a9eff" },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#ccc",
                    "&.Mui-focused": { color: "#4a9eff" },
                  },
                }}
              />
              <TextField
                label={t('TextGenerative.seed')}
                type="number"
                value={imageSeed}
                onChange={(e) => setImageSeed(parseInt(e.target.value) || 42)}
                variant="outlined"
                size="small"
                inputProps={{ min: 1, max: 1000000 }}
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#3a3a3a",
                    color: "white",
                    "& fieldset": { borderColor: "#4a4a4a" },
                    "&:hover fieldset": { borderColor: "#6a6a6a" },
                    "&.Mui-focused fieldset": { borderColor: "#4a9eff" },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#ccc",
                    "&.Mui-focused": { color: "#4a9eff" },
                  },
                }}
              />
            </Box>

            {/* Model Selection */}
            <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
              <TextField
                select
                label={t('TextGenerative.model')}
                value={imageModel}
                onChange={(e) => setImageModel(e.target.value)}
                variant="outlined"
                size="small"
                sx={{
                  minWidth: 120,
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#3a3a3a",
                    color: "white",
                    "& fieldset": { borderColor: "#4a4a4a" },
                    "&:hover fieldset": { borderColor: "#6a6a6a" },
                    "&.Mui-focused fieldset": { borderColor: "#4a9eff" },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#ccc",
                    "&.Mui-focused": { color: "#4a9eff" },
                  },
                }}
                SelectProps={{
                  sx: {
                    "& .MuiMenuItem-root": {
                      bgcolor: "#3a3a3a",
                      color: "white",
                      "&:hover": { bgcolor: "#4a4a4a" },
                    },
                  },
                }}
              >
                <option value="flux">{t('TextGenerative.flux')}</option>
                <option value="turbo">{t('TextGenerative.turbo')}</option>
                <option value="midjourney">{t('TextGenerative.midjourney')}</option>
              </TextField>
              
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <input
                  type="checkbox"
                  id="nologo-checkbox"
                  checked={imageNoLogo}
                  onChange={(e) => setImageNoLogo(e.target.checked)}
                  style={{ 
                    accentColor: "#4a9eff",
                    transform: "scale(1.2)"
                  }}
                />
                <label htmlFor="nologo-checkbox" style={{ color: "#ccc", cursor: "pointer" }}>
                  {t('TextGenerative.noLogo')}
                </label>
              </Box>
            </Box>
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
                direction: "ltr",
              }}
            >
              <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                {fixedJsonStructure}
              </pre>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1, direction: direction }}>
          <Button onClick={handleResetToDefault} variant="outlined">
            {t('TextGenerative.resetToDefault')}
          </Button>
          <Button onClick={handleSettingsClose} variant="outlined">
            {t('TextGenerative.cancel')}
          </Button>
          <Button
            onClick={handleSaveSettings}
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{ bgcolor: "#4a9eff", "&:hover": { bgcolor: "#3a8eef" } }}
          >
            {t('TextGenerative.saveSettings')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Title and Input Container - Centered when chat hasn't started */}
      {!hasChatStarted && (
        <Box sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          width: "100%",
          maxWidth: "800px",
        }}>
          {/* Title */}
          <Box sx={{
            display: "flex",
            alignItems: "center",
            gap: 0,
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

          {/* Input Container - Centered */}
          <InputContainer
            input={input}
            setInput={setInput}
            loading={loading}
            selectedComplexity={selectedComplexity}
            setSelectedComplexity={setSelectedComplexity}
            onSend={handleSend}
            onKeyPress={handleKeyPress}
            hasChatStarted={hasChatStarted}
            direction={direction}
            isRTL={isRTL}
          />
        </Box>
      )}

      {/* Chat Started Layout */}
      {hasChatStarted && (
        <>
          {/* Title - Top positioned */}
          <Box sx={{
            display: "flex",
            alignItems: "center",
            gap: 0,
            transition: "all 0.5s ease",
            direction: direction,
            mb: 2,
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

          {/* Action Buttons */}
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
              disabled={!hasTasksReady}
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

          {/* Main Content Area */}
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
            <ChatContainer
              messages={messages}
              loading={loading}
              direction={direction}
              isRTL={isRTL}
              isTableOpen={isTableOpen}
              onShowTasks={handleShowTasks}
              tasksCount={tasks.length}
              complexity={complexity}
              getComplexityColor={getComplexityColor}
            />

            <TaskTable
              isOpen={isTableOpen}
              onClose={() => setIsTableOpen(false)}
              tasks={tasks}
              setTasks={setTasks}
              complexity={complexity}
              imagePromptPrefix={imagePromptPrefix}
              imagePromptSuffix={imagePromptSuffix}
              imageWidth={imageWidth}
              imageHeight={imageHeight}
              imageModel={imageModel}
              imageNoLogo={imageNoLogo}
              imageSeed={imageSeed}
              direction={direction}
              isRTL={isRTL}
              getComplexityColor={getComplexityColor}
            />
          </Box>

          {/* Input Container - Fixed at bottom when chat started */}
          <InputContainer
            input={input}
            setInput={setInput}
            loading={loading}
            selectedComplexity={selectedComplexity}
            setSelectedComplexity={setSelectedComplexity}
            onSend={handleSend}
            onKeyPress={handleKeyPress}
            hasChatStarted={hasChatStarted}
            direction={direction}
            isRTL={isRTL}
          />
        </>
      )}
    </Box>
  );
}