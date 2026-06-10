import React, { useState, useEffect, useRef } from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useTranslation } from "react-i18next";
import InputContainer from './InputContainer';
import SettingsDialog from './SettingsDialog';
import WelcomeView from './WelcomeView';
import ChatView from './ChatView';
import { TaalAiThemeProvider, useTaalAiTheme } from './ThemeContext';
import "../../../i18n";
import { createChatCompletion } from "../../../api/api";
import { useNotification } from '../../../components/Notification/NotificationProvider';

// Inner component that uses the theme
function SearchUIContent() {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const { theme, isDarkMode, toggleTheme } = useTaalAiTheme();
  const [input, setInput] = useState('');
  const [isTableOpen, setIsTableOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [complexity, setComplexity] = useState('');
  const [selectedComplexity, setSelectedComplexity] = useState('Medium');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [hasTasksReady, setHasTasksReady] = useState(false);
  const progressIntervalRef = useRef(null);

  // ── Base image (shared source for all task-image generations) ──────
  // { file: File, preview: string } | null
  const [baseImage, setBaseImage] = useState(null);

  // ── Global image context set via the general popup ───────────────
  // { environment, people, objects, styleMood, additionalDetails } | null
  const [globalImageContext, setGlobalImageContext] = useState(null);

  const handleBaseImageChange = (file) => {
    // Revoke previous preview URL to avoid memory leaks
    if (baseImage?.preview) URL.revokeObjectURL(baseImage.preview);

    if (!file) {
      setBaseImage(null);
      return;
    }
    setBaseImage({ file, preview: URL.createObjectURL(file) });
  };

  // Revoke object URL on unmount
  useEffect(() => {
    return () => {
      if (baseImage?.preview) URL.revokeObjectURL(baseImage.preview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add seed to image generation settings state
  const [imagePromptPrefix, setImagePromptPrefix] = useState(
    'A highly realistic photo of a person performing the task:'
  );
  const [imagePromptSuffix, setImagePromptSuffix] = useState(
    'The scene should look natural and immersive, fitting the task context (e.g., office, workshop, or classroom). Use natural lighting, realistic details, and authentic atmosphere. Ultra-realistic, cinematic composition, shallow depth of field, detailed textures, and no visible text or written words.'
  );
  const [imageWidth, setImageWidth] = useState(1024);
  const [imageHeight, setImageHeight] = useState(1024);
  const [imageModel, setImageModel] = useState('natural');
  const [imageNoLogo, setImageNoLogo] = useState(true);
  const [imageSeed, setImageSeed] = useState(1);

  // Get direction for RTL/LTR support
  const direction = t('Direction');
  const isRTL = direction === 'rtl';

  // Default editable part of system prompt
  const defaultEditablePrompt = `TAAL Internal AI Route Builder — System Message

Role:
You are TAAL's Internal AI Route Builder, an expert system that converts job descriptions or structured Excel inputs into production-ready task breakdowns for the TAAL platform.

Input
Input may be a free-text job description (Hebrew or English) or a structured Excel sheet.
Always answer in the same language as the input.

Output
No explanations, no markdown. JSON only.
Each task represents a single clear action.

Task Generation Guidelines
Short and action-oriented (≤ 12 words).
Use simple, direct, step-by-step language.
Break down the input into single, clear actions.
Each task line must contain only one simple instruction (no commas, no multi-actions).
Keep language simple, pre-school level, accessible to everyone.
Complexity Definition (TAAL-specific)

Basic (בסיסי) — Very detailed
Break every job step into very small, simple, explicit actions.
Use clear everyday words.
Each task describes one physical or mental action only.
Example: "Pick up the box." → "Put it on the shelf."

Medium (בינוני) — Balanced
Group related actions that naturally flow together.
Tasks may include short, simple sequences that make sense together.
Example: "Collect papers and put them in the folder."

High (גבוה) — Overview
Write a few broad, outcome-focused tasks.
Describe the end goals or results in very simple language.
Avoid micro-steps, but keep tasks clear and measurable.
**Language must stay simple.
The worker is fully independent.**

Monotone / Quantity Work
If the job involves repetitive or quantity-based work (e.g., assembly, packaging, cleaning multiple items):
Structure Work Station tasks so they could repeat naturally.
Do not implement explicit loops — just make them flow logically.

Accessibility Requirements
Use clear, simple, direct language.
Write tasks so they can be understood by workers with varied cognitive abilities.
`;

  // Fixed JSON structure part
  const fixedJsonStructure = `Always output tasks as JSON with this structure:
{
  "complexity": "Basic | Medium | High (בסיסי | בינוני | גבוה)",
  "stations": [
    {
      "title": "Station name",
      "tasks": [
        {
          "title": "Short and clear task title",
          "subtitle": "Optional plain-language instruction or clarification",
          "estimatedTimeMinutes": number,
          "picture_url": ""
        }
      ]
    }
  ]
}`;

  // Initialize custom prompt with default
  const [customSystemPrompt, setCustomSystemPrompt] = useState(defaultEditablePrompt);
  useEffect(() => {
    if (!customSystemPrompt) {
      setCustomSystemPrompt(defaultEditablePrompt);
    }
  }, []);

  // Complete system prompt combining custom and fixed parts
  const systemPrompt = `${customSystemPrompt} ${fixedJsonStructure}`;

  const [messages, setMessages] = useState([{ role: "system", content: systemPrompt }]);
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    setMessages((prev) => {
      const rest = prev[0]?.role === "system" ? prev.slice(1) : prev;
      return [{ role: "system", content: systemPrompt }, ...rest];
    });
  }, [systemPrompt]);

  // Add state to track original user inputs
  const [userInputs, setUserInputs] = useState([]);

  const sendMessageToAzure = async (content) => {
    const userMessage = { role: "user", content };
    const updatedMessages = [...messagesRef.current, userMessage];
    setMessages(updatedMessages);
    setLoading(true);
    setLoadingProgress(0);

    // Simulate progress while waiting for response
    progressIntervalRef.current = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 90) return prev;
        const increment = prev < 30 ? 8 : prev < 60 ? 5 : prev < 80 ? 2 : 1;
        return Math.min(prev + increment, 90);
      });
    }, 300);

    try {
      const response = await createChatCompletion(updatedMessages, { maxTokens: 800 });
      const assistantMessage = response?.choices?.[0]?.message;

      if (assistantMessage) {
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      showNotification('error', error.message);
      console.error('Azure OpenAI request failed:', error);
    } finally {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setLoadingProgress(100);
      setTimeout(() => {
        setLoading(false);
        setLoadingProgress(0);
      }, 200);
    }
  };

  useEffect(() => {
    if (messages[messages.length - 1]?.role === 'assistant') {
      setLoading(false);
    }
  }, [messages]);

  // Check if chat has started
  const hasChatStarted = messages.length > 1;

  const normalizeTaskData = (taskData) => {
    if (!taskData || typeof taskData !== 'object') return null;

    const normalizedComplexity = taskData.complexity || '';

    // Backward compatible: tasks at root
    if (Array.isArray(taskData.tasks)) {
      return {
        tasks: taskData.tasks.map(task => ({
          ...task,
          station: (task.station || task.stationName || '').toString(),
          picture_url: task.picture_url || ''
        })),
        complexity: normalizedComplexity
      };
    }

    // Current schema: stations array
    if (Array.isArray(taskData.stations)) {
      const flattenedTasks = [];
      for (let i = 0; i < taskData.stations.length; i++) {
        const stationObj = taskData.stations[i];
        const stationTitle = (stationObj?.title || '').toString().trim() || `Station ${i + 1}`;
        const stationTasks = Array.isArray(stationObj?.tasks) ? stationObj.tasks : [];

        for (const task of stationTasks) {
          flattenedTasks.push({
            ...task,
            station: (task?.station || task?.stationName || stationTitle).toString(),
            picture_url: task?.picture_url || ''
          });
        }
      }

      return {
        tasks: flattenedTasks,
        complexity: normalizedComplexity
      };
    }

    return null;
  };

  // Parse JSON from AI responses to extract tasks
  useEffect(() => {
    if (messages.length > 1 && !loading) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        try {
          const jsonMatch = lastMessage.content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            const normalized = normalizeTaskData(parsed);

            if (normalized?.tasks && Array.isArray(normalized.tasks)) {
              setTasks(normalized.tasks);
              setComplexity(normalized.complexity);
              setHasTasksReady(true);
            }
          }
        } catch (error) {
          console.log('No valid task JSON found in response');
          setHasTasksReady(false);
        }
      }
    }
  }, [messages, loading]);

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
        setHasTasksReady(false);
        setIsTableOpen(false);

        const complexityOptions = [
          { value: 'Basic',  label: `${t('TextGenerative.basic')}` },
          { value: 'Medium', label: `${t('TextGenerative.medium')}` },
          { value: 'High',   label: `${t('TextGenerative.high')}` }
        ];
        const complexityInfo = complexityOptions.find(opt => opt.value === selectedComplexity);

        const originalInput = input;
        const messageWithComplexity = `Input:\n${input}\n\nInstruction: Create a clear, pre-school level task breakdown with ${complexityInfo.label} complexity level.`;

        setUserInputs(prev => [...prev, originalInput]);

        await sendMessageToAzure(messageWithComplexity);
        setInput('');
      } catch (error) {
        showNotification('error', error.message);
        console.error('Azure OpenAI request failed:', error);
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
      const normalized = normalizeTaskData(taskDataFromMessage);
      if (normalized?.tasks && Array.isArray(normalized.tasks)) {
        setTasks(normalized.tasks);
        setComplexity(normalized.complexity);
        setHasTasksReady(true);
      }
    }
    setIsTableOpen(true);
  };

  const toggleTable = () => {
    setIsTableOpen(!isTableOpen);
  };

  // ── Shared InputContainer props ────────────────────────────────────
  const inputContainerProps = {
    input,
    setInput,
    loading,
    selectedComplexity,
    setSelectedComplexity,
    onSend: handleSend,
    onKeyPress: handleKeyPress,
    hasChatStarted,
    direction,
    isRTL,
    theme,
    baseImage,
    onBaseImageChange: handleBaseImageChange,
  };

  return (
    <Box
      sx={{
        bgcolor: theme.background,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: hasChatStarted ? "flex-start" : "center",
        color: theme.text,
        padding: 2,
        paddingBottom: hasChatStarted ? "120px" : 2,
        position: "relative",
        transition: "all 0.3s ease",
        direction: direction,
      }}
    >
      {/* Theme Toggle Button */}
      <Tooltip title={isDarkMode ? t('TextGenerative.lightMode') || 'Light Mode' : t('TextGenerative.darkMode') || 'Dark Mode'}>
        <IconButton
          onClick={toggleTheme}
          sx={{
            position: "absolute",
            top: 16,
            [isRTL ? 'left' : 'right']: 70,
            bgcolor: theme.backgroundSecondary,
            color: theme.primary,
            "&:hover": { bgcolor: theme.backgroundTertiary },
            zIndex: 1000,
          }}
        >
          {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Tooltip>

      {/* Settings Component */}
      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={(shouldOpen) => setIsSettingsOpen(shouldOpen === true ? true : false)}
        customSystemPrompt={customSystemPrompt}
        setCustomSystemPrompt={setCustomSystemPrompt}
        imagePromptPrefix={imagePromptPrefix}
        setImagePromptPrefix={setImagePromptPrefix}
        imagePromptSuffix={imagePromptSuffix}
        setImagePromptSuffix={setImagePromptSuffix}
        imageWidth={imageWidth}
        setImageWidth={setImageWidth}
        imageHeight={imageHeight}
        setImageHeight={setImageHeight}
        imageModel={imageModel}
        setImageModel={setImageModel}
        imageNoLogo={imageNoLogo}
        setImageNoLogo={setImageNoLogo}
        imageSeed={imageSeed}
        setImageSeed={setImageSeed}
        defaultEditablePrompt={defaultEditablePrompt}
        fixedJsonStructure={fixedJsonStructure}
        direction={direction}
        isRTL={isRTL}
        theme={theme}
      />

      {/* Welcome screen — no chat yet */}
      {!hasChatStarted && (
        <WelcomeView
          direction={direction}
          isRTL={isRTL}
          theme={theme}
          inputContainerProps={inputContainerProps}
        />
      )}

      {/* Chat layout — at least one message exchanged */}
      {hasChatStarted && (
        <ChatView
          direction={direction}
          isRTL={isRTL}
          theme={theme}
          inputContainerProps={inputContainerProps}
          isTableOpen={isTableOpen}
          toggleTable={toggleTable}
          setIsTableOpen={setIsTableOpen}
          hasTasksReady={hasTasksReady}
          tasks={tasks}
          setTasks={setTasks}
          complexity={complexity}
          getComplexityColor={getComplexityColor}
          messages={messages}
          userInputs={userInputs}
          loading={loading}
          loadingProgress={loadingProgress}
          handleShowTasks={handleShowTasks}
          imagePromptPrefix={imagePromptPrefix}
          imagePromptSuffix={imagePromptSuffix}
          imageWidth={imageWidth}
          imageHeight={imageHeight}
          imageModel={imageModel}
          imageNoLogo={imageNoLogo}
          imageSeed={imageSeed}
          baseImage={baseImage}
          originalPrompt={userInputs[userInputs.length - 1] || ""}
          globalImageContext={globalImageContext}
          setGlobalImageContext={setGlobalImageContext}
        />
      )}
    </Box>
  );
}

// Main export with theme provider wrapper
export default function SearchUI() {
  return (
    <TaalAiThemeProvider>
      <SearchUIContent />
    </TaalAiThemeProvider>
  );
}