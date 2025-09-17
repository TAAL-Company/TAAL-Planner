import React, { useRef, useEffect } from "react";
import {Box,Paper,Avatar,Button,Chip,Typography} from "@mui/material";
import ReactMarkdown from 'react-markdown';
import LoadingSkeleton from './LoadingSkeleton';
import ViewListIcon from '@mui/icons-material/ViewList';
import { useTranslation } from 'react-i18next';

export default function ChatContainer({ messages, loading, direction, isRTL, isTableOpen, onShowTasks, tasksCount, complexity, getComplexityColor }) {
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

  return (
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
                {/* Show button for assistant messages with task data */}
                {isAssistantWithTasks ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2" sx={{ color: '#ccc', mb: 1 }}>
                      {t('TextGenerative.taskGenerationCompleted')}
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<ViewListIcon />}
                      onClick={() => handleShowTasksFromMessage(msg.content)}
                      sx={{
                        bgcolor: "#4a9eff",
                        "&:hover": { bgcolor: "#3a8eef" },
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
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </Box>
                )}
              </Paper>
            </Box>
          </Box>
        );
      })}
      
      {/* Show loading skeleton when AI is responding */}
      {loading && <LoadingSkeleton direction={direction} isRTL={isRTL} />}
    </Paper>
  );
}