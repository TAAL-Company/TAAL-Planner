import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Icon, Button, Chip } from "@mui/material";
import TaskIcon from '@mui/icons-material/Task';
import { useTranslation } from "react-i18next";
// import { usePollinationsChat } from '@pollinations/react';
import TaskTable from './TaskTable';
import ChatContainer from './ChatContainer';
import InputContainer from './InputContainer';
import SettingsDialog from './SettingsDialog';
import "../../../i18n";
import { createChatCompletion } from "../../../api/api";

export default function SearchUI() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [isTableOpen, setIsTableOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [complexity, setComplexity] = useState('');
  const [selectedComplexity, setSelectedComplexity] = useState('Medium');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasTasksReady, setHasTasksReady] = useState(false);

  // Add seed to image generation settings state
  const [imagePromptPrefix, setImagePromptPrefix] = useState(
    'A highly realistic photo of a person performing the task:'
  );
  const [imagePromptSuffix, setImagePromptSuffix] = useState(
    'The scene should look natural and immersive, fitting the task context (e.g., office, workshop, or classroom). Use natural lighting, realistic details, and authentic atmosphere. Ultra-realistic, cinematic composition, shallow depth of field, detailed textures, and no visible text or written words.'
  );
  const [imageWidth, setImageWidth] = useState(400);
  const [imageHeight, setImageHeight] = useState(300);
  const [imageModel, setImageModel] = useState('turbo');
  const [imageNoLogo, setImageNoLogo] = useState(true);
  const [imageSeed, setImageSeed] = useState(23297);

  // Get direction for RTL/LTR support
  const direction = t('Direction');
  const isRTL = direction === 'rtl';

  // Default editable part of system prompt
  const defaultEditablePrompt = `
TAAL Internal AI Route Builder — System Message

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
  "tasks": [
    {
      "title": "Short and clear task title",
      "subtitle": "Optional plain-language instruction or clarification",
      "estimatedTimeMinutes": number,
      "picture_url": ""
    }
  ]
}`;

  // Initialize custom prompt with default
  const [customSystemPrompt, setCustomSystemPrompt] = useState(defaultEditablePrompt);
  // Initialize custom prompt with default
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

    try {
      const response = await createChatCompletion(updatedMessages, { maxTokens: 800 });
      const assistantMessage = response?.choices?.[0]?.message;

      if (assistantMessage) {
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Azure OpenAI request failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // // Sync our loading state with the hook's loading state
  // useEffect(() => {
  //   if (hookLoading !== undefined) {
  //     setLoading(hookLoading);
  //     console.log("Hook loading state:", hookLoading);
  //   }
  // }, [hookLoading]);

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
          { value: 'Basic', label: `${t('TextGenerative.basic')}` },
          { value: 'Medium', label: `${t('TextGenerative.medium')}` },
          { value: 'High', label: `${t('TextGenerative.high')}` }
        ];
        const complexityInfo = complexityOptions.find(opt => opt.value === selectedComplexity);

        // Store the original user input
        const originalInput = input;

        // Create enhanced message for AI
        const messageWithComplexity = `Input:\n${input}\n\nInstruction: Create a clear, pre-school level task breakdown with ${complexityInfo.label} complexity level.`;

        // Track original inputs to filter them in ChatContainer
        setUserInputs(prev => [...prev, originalInput]);

        await sendMessageToAzure(messageWithComplexity);
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
      />

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
              userInputs={userInputs}
              loading={loading}
              direction={direction}
              isRTL={isRTL}
              isTableOpen={isTableOpen}
              onShowTasks={handleShowTasks}
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