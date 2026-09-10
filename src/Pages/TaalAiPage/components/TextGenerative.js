import React, { useState, useEffect, useRef } from "react";
import { Box, IconButton, Tooltip, Badge } from "@mui/material";
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import HistoryIcon from '@mui/icons-material/History';
import AddCommentIcon from '@mui/icons-material/AddComment';
import { useTranslation } from "react-i18next";
import InputContainer from './InputContainer';
import SettingsDialog from './SettingsDialog';
import WelcomeView from './WelcomeView';
import ChatView from './ChatView';
import HistorySidebar from './HistorySidebar';
import { TaalAiThemeProvider, useTaalAiTheme } from './ThemeContext';
import "../../../i18n";
import {
  createChatCompletion,
  listAiConversations,
  getAiConversation,
  createAiConversation,
  saveAiConversation,
  deleteAiConversation,
} from "../../../api/api";
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
  // Per-message image cache: { [messageKey]: string[] }
  // messageKey = index of the message in messages.slice(1)
  const taskImageCacheRef = useRef({});
  const activeMessageKeyRef = useRef(null);

  // Sync task picture_urls into the cache whenever tasks change
  useEffect(() => {
    if (activeMessageKeyRef.current !== null && tasks.length > 0) {
      taskImageCacheRef.current[activeMessageKeyRef.current] = tasks.map(t => t.picture_url || '');
    }
  }, [tasks]);

  // ── Global image context set via the general popup ───────────────
  // { environment, people, objects, styleMood, additionalDetails } | null
  const [globalImageContext, setGlobalImageContext] = useState(null);
  const [taskImageContexts, setTaskImageContexts] = useState({});

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

Conversation & Refinement
You maintain full conversation history. When the user sends a follow-up message (e.g. "add more tasks", "make task 3 simpler", "remove the last station"), treat it as a refinement of the previous JSON output. Return the complete updated JSON — never a partial result. Only generate a fresh breakdown if the user clearly provides a new job description.

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

  // ── Chat history (saved conversations) ────────────────────────────
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyListLoading, setHistoryListLoading] = useState(false);
  const [loadingConversationId, setLoadingConversationId] = useState(null);
  const [deletingConversationId, setDeletingConversationId] = useState(null);

  const activeConversationIdRef = useRef(null);
  const isHydratingRef = useRef(false);
  const lastSavedSnapshotRef = useRef('');
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  const serializeImageReference = (reference) => reference ? {
    url: reference.url || null,
    name: reference.name || null,
  } : null;

  const serializeImageContext = (imageContext) => imageContext ? {
    environment: imageContext.environment || "",
    people: imageContext.people || "",
    objects: imageContext.objects || "",
    styleMood: imageContext.styleMood || "",
    additionalDetails: imageContext.additionalDetails || "",
    peopleImage: serializeImageReference(imageContext.peopleImage),
    environmentImage: serializeImageReference(imageContext.environmentImage),
  } : null;

  const deserializeImageReference = (reference) => reference ? {
    file: null,
    preview: reference.url || null,
    url: reference.url || null,
    name: reference.name || null,
  } : null;

  const deserializeImageContext = (imageContext) => imageContext ? {
    ...imageContext,
    peopleImage: deserializeImageReference(imageContext.peopleImage),
    environmentImage: deserializeImageReference(imageContext.environmentImage),
  } : null;

  const buildStateSnapshot = () => ({
    messages,
    userInputs,
    tasks,
    complexity,
    globalImageContext: serializeImageContext(globalImageContext),
    taskImageContexts: Object.fromEntries(
      Object.entries(taskImageContexts).map(([taskId, imageContext]) => [taskId, serializeImageContext(imageContext)])
    ),
    // Generated images for every task breakdown in this chat, keyed by message index —
    // not just the one currently shown in the table.
    taskImageCache: taskImageCacheRef.current,
    activeMessageKey: activeMessageKeyRef.current,
  });

  // Loads a saved chat's full state so the user can continue where they left off.
  const handleSelectConversation = async (id) => {
    try {
      isHydratingRef.current = true;
      setLoadingConversationId(id);
      const conversation = await getAiConversation(id);
      const state = conversation.state || {};
      const restoredMessages = Array.isArray(state.messages) && state.messages.length > 0
        ? state.messages
        : [{ role: 'system', content: systemPrompt }];

      taskImageCacheRef.current = state.taskImageCache && typeof state.taskImageCache === 'object'
        ? state.taskImageCache
        : {};
      activeMessageKeyRef.current = state.activeMessageKey ?? null;

      setMessages(restoredMessages);
      setUserInputs(Array.isArray(state.userInputs) ? state.userInputs : []);
      setTasks(Array.isArray(state.tasks) ? state.tasks : []);
      setComplexity(state.complexity || '');
      setHasTasksReady(Array.isArray(state.tasks) && state.tasks.length > 0);
      const restoredGlobalContext = deserializeImageContext(state.globalImageContext);
      const restoredTaskImageContexts = Object.fromEntries(
        Object.entries(state.taskImageContexts || {}).map(([taskId, imageContext]) => [taskId, deserializeImageContext(imageContext)])
      );
      setGlobalImageContext(restoredGlobalContext);
      setTaskImageContexts(restoredTaskImageContexts);
      setIsTableOpen(false);
      setActiveConversationId(conversation.id);

      lastSavedSnapshotRef.current = JSON.stringify({
        messages: restoredMessages,
        userInputs: state.userInputs || [],
        tasks: state.tasks || [],
        complexity: state.complexity || '',
        globalImageContext: serializeImageContext(restoredGlobalContext),
        taskImageContexts: Object.fromEntries(
          Object.entries(restoredTaskImageContexts).map(([taskId, imageContext]) => [taskId, serializeImageContext(imageContext)])
        ),
        taskImageCache: taskImageCacheRef.current,
        activeMessageKey: activeMessageKeyRef.current,
      });
      setIsHistoryOpen(false);
    } catch (error) {
      showNotification('error', t('TextGenerative.loadChatFailed', 'Failed to load chat'));
      console.error('Failed to load AI conversation:', error);
    } finally {
      isHydratingRef.current = false;
      setLoadingConversationId(null);
    }
  };

  // Resets local state to a blank chat; the next message will create a new saved conversation.
  const handleNewChat = () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setMessages([{ role: 'system', content: systemPrompt }]);
    setUserInputs([]);
    setTasks([]);
    setComplexity('');
    setHasTasksReady(false);
    setIsTableOpen(false);
    setGlobalImageContext(null);
    setTaskImageContexts({});
    setActiveConversationId(null);
    taskImageCacheRef.current = {};
    activeMessageKeyRef.current = null;
    lastSavedSnapshotRef.current = '';
    setIsHistoryOpen(false);
  };

  const handleDeleteConversation = async (id) => {
    try {
      setDeletingConversationId(id);
      await deleteAiConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (id === activeConversationIdRef.current) {
        handleNewChat();
      }
    } catch (error) {
      showNotification('error', t('TextGenerative.deleteChatFailed', 'Failed to delete chat'));
      console.error('Failed to delete AI conversation:', error);
    } finally {
      setDeletingConversationId(null);
    }
  };

  // On first load: fetch the chat list and resume the most recent chat, if any.
  useEffect(() => {
    (async () => {
      setHistoryListLoading(true);
      try {
        const list = await listAiConversations();
        setConversations(list);
        if (list.length > 0) {
          await handleSelectConversation(list[0].id);
        }
      } catch (error) {
        console.error('Failed to load AI chat history:', error);
      } finally {
        setHistoryListLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced auto-save: persists prompts, AI responses, tasks, and generated
  // images whenever the chat state settles, skipping no-op saves.
  useEffect(() => {
    if (isHydratingRef.current || loading) return;
    if (messages.length <= 1) return;

    const snapshot = buildStateSnapshot();
    const serialized = JSON.stringify(snapshot);
    if (serialized === lastSavedSnapshotRef.current) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        if (!activeConversationIdRef.current) {
          const created = await createAiConversation(snapshot);
          activeConversationIdRef.current = created.id;
          setActiveConversationId(created.id);
          setConversations((prev) => [created, ...prev]);
        } else {
          const updated = await saveAiConversation(activeConversationIdRef.current, snapshot);
          setConversations((prev) => {
            const others = prev.filter((c) => c.id !== updated.id);
            return [
              { id: updated.id, title: updated.title, createdAt: updated.createdAt, updatedAt: updated.updatedAt },
              ...others,
            ];
          });
        }
        lastSavedSnapshotRef.current = serialized;
      } catch (error) {
        console.error('Failed to save AI chat history:', error);
      }
    }, 700);

    return () => clearTimeout(saveTimeoutRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, tasks, complexity, userInputs, globalImageContext, loading]);

  // Applies task JSON found in a NEW assistant response. This is called
  // explicitly, exactly once, right when a fresh reply arrives — never as
  // a side effect of `messages` changing for some other reason (loading a
  // saved conversation, the system-prompt sync effect touching messages,
  // etc). That distinction is what actually matters: parsing reactively
  // off `messages` used to re-run on every conversation switch, re-derive
  // tasks from the raw AI JSON (which never carries picture_url), and wipe
  // out the images that were just restored — triggering a full table
  // regeneration every time the user switched chats.
  const applyAssistantTasks = (content, messagesLength) => {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const normalized = normalizeTaskData(parsed);

        if (normalized?.tasks && Array.isArray(normalized.tasks)) {
          activeMessageKeyRef.current = messagesLength - 2;
          // Stable ids so image generation always targets the right task,
          // even after tasks are added/removed/reordered later.
          const tasksWithIds = normalized.tasks.map((task, i) => ({
            ...task,
            id: task.id || `task-${messagesLength}-${i}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          }));
          setTasks(tasksWithIds);
          setComplexity(normalized.complexity);
          setHasTasksReady(true);
          return;
        }
      }
    } catch (error) {
      console.log('No valid task JSON found in response');
    }
    setHasTasksReady(false);
  };

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
        const newMessages = [...updatedMessages, assistantMessage];
        setMessages(newMessages);
        if (assistantMessage.content) {
          applyAssistantTasks(assistantMessage.content, newMessages.length);
        }
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

  // NOTE: task parsing used to live in a `useEffect` watching `[messages, loading]`.
  // That effect re-ran on ANY change to `messages` — including loading a saved
  // conversation from history, or the system-prompt sync effect touching the
  // messages array — and would re-derive `tasks` from the raw AI JSON (which
  // never includes picture_url), wiping already-generated images and causing
  // a full table regeneration. Parsing now happens once, explicitly, inside
  // sendMessageToAzure (see applyAssistantTasks above) right when a genuinely
  // new assistant reply arrives — never as a side effect of switching chats.

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
        const isFirstUserMessage = messagesRef.current.filter(m => m.role !== 'system').length === 0;
        const messageContent = isFirstUserMessage
          ? `Input:\n${input}\n\nInstruction: Create a clear, pre-school level task breakdown with ${complexityInfo.label} complexity level.`
          : input;

        setUserInputs(prev => [...prev, originalInput]);

        await sendMessageToAzure(messageContent);
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

  const handleShowTasks = (taskDataFromMessage = null, messageKey = null) => {
    if (taskDataFromMessage) {
      const normalized = normalizeTaskData(taskDataFromMessage);
      if (normalized?.tasks && Array.isArray(normalized.tasks)) {
        // Restore cached images for this specific message
        const cachedImages = messageKey !== null
          ? (taskImageCacheRef.current[messageKey] || [])
          : [];
        const mergedTasks = normalized.tasks.map((newTask, index) => ({
          ...newTask,
          id: newTask.id || `task-${messageKey ?? 'x'}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          picture_url: cachedImages[index] || newTask.picture_url || '',
        }));
        activeMessageKeyRef.current = messageKey;
        setTasks(mergedTasks);
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
    tasks,
    originalPrompt: userInputs[userInputs.length - 1] || "",
    globalImageContext,
    onGlobalImageContextChange: setGlobalImageContext,
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
      {/* Chat History Button */}
      <Tooltip title={t('TextGenerative.chatHistory', 'Chat History')}>
        <IconButton
          onClick={() => setIsHistoryOpen(true)}
          sx={{
            position: "absolute",
            top: 16,
            [isRTL ? 'left' : 'right']: 124,
            bgcolor: theme.backgroundSecondary,
            color: theme.primary,
            "&:hover": { bgcolor: theme.backgroundTertiary },
            zIndex: 1000,
          }}
        >
          <Badge color="primary" variant="dot" invisible={conversations.length === 0}>
            <HistoryIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      {/* New Chat Button */}
      <Tooltip title={t('TextGenerative.newChat', 'New chat')}>
        <IconButton
          onClick={handleNewChat}
          disabled={!hasChatStarted}
          sx={{
            position: "absolute",
            top: 16,
            [isRTL ? 'left' : 'right']: 178,
            bgcolor: theme.backgroundSecondary,
            color: theme.primary,
            "&:hover": { bgcolor: theme.backgroundTertiary },
            "&:disabled": { color: theme.textMuted },
            zIndex: 1000,
          }}
        >
          <AddCommentIcon />
        </IconButton>
      </Tooltip>

      {/* Chat History Sidebar */}
      <HistorySidebar
        open={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        conversations={conversations}
        activeId={activeConversationId}
        loading={historyListLoading}
        loadingConversationId={loadingConversationId}
        deletingConversationId={deletingConversationId}
        onSelect={handleSelectConversation}
        onNew={handleNewChat}
        onDelete={handleDeleteConversation}
        direction={direction}
        isRTL={isRTL}
        theme={theme}
      />

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
          originalPrompt={userInputs[userInputs.length - 1] || ""}
          globalImageContext={globalImageContext}
          setGlobalImageContext={setGlobalImageContext}
          taskImageContexts={taskImageContexts}
          setTaskImageContexts={setTaskImageContexts}
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