import React, { useRef, useEffect } from "react";
import {Box,Paper,Avatar,Button,Chip,Typography} from "@mui/material";
import ReactMarkdown from 'react-markdown';
import LoadingSkeleton from './LoadingSkeleton';
import ViewListIcon from '@mui/icons-material/ViewList';
import { useTranslation } from 'react-i18next';

// Add userInputs prop and theme prop
export default function ChatContainer({ messages, userInputs = [], loading, direction, isRTL, isTableOpen, onShowTasks, getComplexityColor, theme }) {
  const { t } = useTranslation();
  const chatContainerRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Fallback function if getComplexityColor is not provided
  const getColor = (complexity) => {
    if (getComplexityColor) {
      return getComplexityColor(complexity);
    }
    // Fallback logic
    if (complexity?.includes('Basic') || complexity?.includes('בסיסי')) return 'success';
    if (complexity?.includes('Medium') || complexity?.includes('בינוני')) return 'warning';
    if (complexity?.includes('High') || complexity?.includes('גבוה')) return 'error';
    return 'default';
  };

  // Function to parse task data from message content
  const parseTaskData = (content) => {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const taskData = JSON.parse(jsonMatch[0]);
        if (taskData.tasks && Array.isArray(taskData.tasks)) {
          return {
            tasks: taskData.tasks.map(task => ({
              ...task,
              picture_url: task.picture_url || ''
            })),
            complexity: taskData.complexity
          };
        }
      }
    } catch (error) {
      console.log('No valid task JSON found in response');
    }
    return null;
  };

  // Function to handle showing tasks from a specific message
  const handleShowTasksFromMessage = (messageContent) => {
    const taskData = parseTaskData(messageContent);
    if (taskData && onShowTasks) {
      // You might need to modify this to pass the specific task data
      // For now, we'll call the existing onShowTasks function
      onShowTasks(taskData);
    }
  };

  // Function to extract original input from enhanced message
  const extractOriginalInput = (message, index) => {
    // If we have the original input stored, use it
    const userInputIndex = Math.floor(index / 2); // Every 2 messages (user + assistant) = 1 input
    if (userInputs[userInputIndex]) {
      return userInputs[userInputIndex];
    }
    
    // Fallback: extract from "Input:" prefix if present
    const match = message.match(/Input:\n([\s\S]*?)\n\nInstruction:/);
    return match ? match[1] : message;
  };

  // Default theme if not provided
  const colors = theme || {
    backgroundSecondary: '#2b2b2b',
    backgroundTertiary: '#3a3a3a',
    text: '#ffffff',
    textSecondary: '#cccccc',
    primary: '#4a9eff',
    primaryHover: '#3a8eef',
    accent: '#ff6b35',
    codeBackground: '#1a1a1a',
    userMessage: '#4a9eff',
    assistantMessage: '#3a3a3a',
  };
  
  return (
    <Paper
      ref={chatContainerRef}
      sx={{
        flex: isTableOpen ? 2 : 1,
        bgcolor: colors.backgroundSecondary,
        overflowY: "auto",
        p: 2,
        borderRadius: "15px",
        transition: "all 0.3s ease",
        direction: direction,
      }}
    >
      {messages.slice(1).map((msg, index) => {
        // Check if this assistant message contains task data
        const isAssistantWithTasks = msg.role === 'assistant' && parseTaskData(msg.content);
        const taskData = isAssistantWithTasks ? parseTaskData(msg.content) : null;
        
        return (
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
                  bgcolor: msg.role === 'user' ? colors.primary : colors.accent,
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
                  bgcolor: msg.role === 'user' ? colors.userMessage : colors.assistantMessage,
                  color: colors.mode === 'light' && msg.role !== 'user' ? colors.text : 'white',
                  borderRadius: "15px",
                  direction: direction,
                  "& .markdown-content": {
                    "& p": { margin: 0 },
                    "& pre": {
                      bgcolor: colors.codeBackground,
                      p: 1,
                      borderRadius: 1,
                      overflow: "auto",
                      direction: "ltr",
                    },
                    "& code": {
                      bgcolor: colors.codeBackground,
                      px: 0.5,
                      borderRadius: 0.5,
                    },
                  },
                }}
              >
                {/* Show button for assistant messages with task data */}
                {isAssistantWithTasks ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
                      {t('TextGenerative.taskGenerationCompleted')}
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<ViewListIcon />}
                      onClick={() => handleShowTasksFromMessage(msg.content)}
                      sx={{
                        bgcolor: colors.primary,
                        "&:hover": { bgcolor: colors.primaryHover },
                        borderRadius: "20px",
                        textTransform: "none",
                        px: 3,
                        py: 1,
                        alignSelf: 'flex-start',
                      }}
                    >
                      {t('TextGenerative.viewTasks', { count: taskData.tasks.length })}
                      {taskData.complexity && (
                        <Chip
                          label={taskData.complexity}
                          size="small"
                          sx={{ ml: 1, height: "20px" }}
                          color={getColor(taskData.complexity)}
                        />
                      )}
                    </Button>
                  </Box>
                ) : (
                  /* Show regular message content for non-task messages */
                  <Box className="markdown-content">
                    {/* When rendering user messages: */}
                    {msg.role === 'user' ? (
                      <Box sx={{ /* existing styles */ }}>
                        <Typography sx={{ /* existing styles */ }}>
                          {extractOriginalInput(msg.content, index)}
                        </Typography>
                      </Box>
                    ) : (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    )}
                  </Box>
                )}
              </Paper>
            </Box>
          </Box>
        );
      })}
      
      {/* Show loading skeleton when AI is responding */}
      {loading && <LoadingSkeleton direction={direction} isRTL={isRTL} theme={theme} />}
    </Paper>
  );
}