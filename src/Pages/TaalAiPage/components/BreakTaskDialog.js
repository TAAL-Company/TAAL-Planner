import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import { useTranslation } from 'react-i18next';
import { createChatCompletion } from '../../../api/api';
import { useNotification } from '../../../components/Notification/NotificationProvider';

export default function BreakTaskDialog({
  isOpen,
  onClose,
  task,
  taskIndex,
  onTasksBreak,
  complexity,
  theme,
  direction,
  isRTL
}) {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const [numSubtasks, setNumSubtasks] = useState(3);
  const [loading, setLoading] = useState(false);
  const [subtasks, setSubtasks] = useState([]);
  const [error, setError] = useState('');

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

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setNumSubtasks(3);
      setSubtasks([]);
      setError('');
    }
  }, [isOpen]);

  const handleGenerate = async () => {
    if (!task || numSubtasks < 2 || numSubtasks > 20) {
      setError('Please enter a number between 2 and 20');
      return;
    }

    setLoading(true);
    setError('');
    setSubtasks([]);

    try {
      // Create a system prompt for breaking down tasks
      const systemPrompt = `You are a task breakdown assistant. Your job is to break down a single task into smaller, more detailed subtasks.

Rules:
1. Break the task into exactly ${numSubtasks} subtasks
2. Keep each subtask clear, actionable, and simple
3. Use pre-school level language (simple and direct)
4. Each subtask should be a single clear action
5. Maintain the same complexity level as the original task: ${complexity || 'Medium'}
6. Distribute the estimated time across subtasks logically
7. Keep the same station as the original task
8. Output ONLY valid JSON, no explanations

Output format (JSON only):
{
  "subtasks": [
    {
      "station": "Same as original",
      "title": "Short task title (max 12 words)",
      "subtitle": "Brief description",
      "estimatedTimeMinutes": number,
      "picture_url": ""
    }
  ]
}`;

      const userPrompt = `Original Task:
Station: ${task.station || 'N/A'}
Title: ${task.title}
Description: ${task.subtitle || 'No description'}
Estimated Time: ${task.estimatedTimeMinutes} minutes

Please break this task into exactly ${numSubtasks} smaller subtasks.`;

      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ];

      const response = await createChatCompletion(messages, { maxTokens: 1000 });
      const assistantMessage = response?.choices?.[0]?.message?.content;

      if (!assistantMessage) {
        throw new Error('No response from AI');
      }

      // Extract JSON from response
      const jsonMatch = assistantMessage.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      if (!parsed.subtasks || !Array.isArray(parsed.subtasks)) {
        throw new Error('Invalid response format');
      }

      // Ensure we have the right number of subtasks
      if (parsed.subtasks.length !== numSubtasks) {
        console.warn(`Expected ${numSubtasks} subtasks but got ${parsed.subtasks.length}`);
      }

      setSubtasks(parsed.subtasks);
      showNotification('success', t('BreakTaskDialog.subtasksGenerated') || 'Subtasks generated successfully');

    } catch (err) {
      console.error('Error breaking down task:', err);
      setError(err.message || 'Failed to generate subtasks');
      showNotification('error', err.message || 'Failed to generate subtasks');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    if (subtasks.length > 0) {
      onTasksBreak(taskIndex, subtasks);
      onClose();
    }
  };

  const handleClose = () => {
    setSubtasks([]);
    setError('');
    onClose();
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `~${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `~${hours}h ${remainingMinutes}min` : `~${hours}h`;
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: colors.backgroundSecondary,
          color: colors.text,
          borderRadius: '15px',
          direction: direction,
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: `1px solid ${colors.border}`,
        pb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CallSplitIcon sx={{ color: colors.primary }} />
          <Typography variant="h6">
            {t('BreakTaskDialog.title') || 'Break Task into Subtasks'}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: colors.textMuted }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* Original Task Display */}
        <Box sx={{ 
          bgcolor: colors.backgroundTertiary, 
          p: 2, 
          borderRadius: '10px',
          mb: 3
        }}>
          <Typography variant="subtitle2" sx={{ color: colors.textMuted, mb: 1 }}>
            {t('BreakTaskDialog.originalTask') || 'Original Task'}
          </Typography>
          {task?.station && (
            <Chip 
              label={task.station} 
              size="small" 
              sx={{ mb: 1, bgcolor: colors.border, color: colors.text }}
            />
          )}
          <Typography variant="h6" sx={{ color: colors.text, mb: 1 }}>
            {task?.title || 'N/A'}
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textSecondary, fontStyle: 'italic', mb: 1 }}>
            {task?.subtitle || 'No description'}
          </Typography>
          <Chip 
            label={formatTime(task?.estimatedTimeMinutes || 0)}
            size="small"
            variant="outlined"
            sx={{ color: colors.primary, borderColor: colors.primary }}
          />
        </Box>

        {/* Number of Subtasks Input */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
            {t('BreakTaskDialog.numSubtasks') || 'How many subtasks?'}
          </Typography>
          <TextField
            type="number"
            value={numSubtasks}
            onChange={(e) => setNumSubtasks(parseInt(e.target.value) || 2)}
            inputProps={{ min: 2, max: 20 }}
            fullWidth
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: colors.backgroundTertiary,
                color: colors.text,
                '& fieldset': { borderColor: colors.border },
                '&:hover fieldset': { borderColor: colors.textMuted },
                '&.Mui-focused fieldset': { borderColor: colors.primary },
              }
            }}
          />
          <Typography variant="caption" sx={{ color: colors.textMuted, mt: 0.5, display: 'block' }}>
            {t('BreakTaskDialog.numSubtasksHint') || 'Enter a number between 2 and 20'}
          </Typography>
        </Box>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress sx={{ color: colors.primary }} />
            <Typography sx={{ ml: 2, color: colors.textSecondary }}>
              {t('BreakTaskDialog.generating') || 'Generating subtasks...'}
            </Typography>
          </Box>
        )}

        {/* Subtasks Preview */}
        {subtasks.length > 0 && !loading && (
          <Box>
            <Typography variant="subtitle1" sx={{ color: colors.text, mb: 2, fontWeight: 'bold' }}>
              {t('BreakTaskDialog.preview') || 'Preview Subtasks'} ({subtasks.length})
            </Typography>
            <List sx={{ 
              bgcolor: colors.backgroundTertiary, 
              borderRadius: '10px',
              maxHeight: '400px',
              overflow: 'auto'
            }}>
              {subtasks.map((subtask, index) => (
                <React.Fragment key={index}>
                  <ListItem sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'flex-start',
                    py: 2
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, width: '100%' }}>
                      <Chip 
                        label={`${index + 1}`} 
                        size="small" 
                        sx={{ bgcolor: colors.primary, color: '#fff', fontWeight: 'bold' }}
                      />
                      {subtask.station && (
                        <Chip 
                          label={subtask.station} 
                          size="small" 
                          sx={{ bgcolor: colors.border, color: colors.text }}
                        />
                      )}
                      <Chip 
                        label={formatTime(subtask.estimatedTimeMinutes || 1)}
                        size="small"
                        variant="outlined"
                        sx={{ color: colors.primary, borderColor: colors.primary, ml: 'auto' }}
                      />
                    </Box>
                    <ListItemText
                      primary={
                        <Typography variant="body1" sx={{ color: colors.text, fontWeight: 'bold' }}>
                          {subtask.title}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ color: colors.textSecondary, fontStyle: 'italic', mt: 0.5 }}>
                          {subtask.subtitle || 'No description'}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < subtasks.length - 1 && <Divider sx={{ borderColor: colors.border }} />}
                </React.Fragment>
              ))}
            </List>
            
            {/* Total Time */}
            <Box sx={{ mt: 2, textAlign: isRTL ? 'left' : 'right' }}>
              <Typography variant="body2" sx={{ color: colors.textMuted }}>
                {t('BreakTaskDialog.totalTime') || 'Total Time'}:{' '}
                <span style={{ color: colors.primary, fontWeight: 'bold' }}>
                  {formatTime(subtasks.reduce((sum, st) => sum + (st.estimatedTimeMinutes || 0), 0))}
                </span>
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ 
        borderTop: `1px solid ${colors.border}`, 
        p: 2, 
        gap: 1 
      }}>
        <Button
          onClick={handleClose}
          sx={{ 
            color: colors.textMuted,
            '&:hover': { bgcolor: `${colors.textMuted}1A` }
          }}
        >
          {t('BreakTaskDialog.cancel') || 'Cancel'}
        </Button>
        
        {subtasks.length === 0 ? (
          <Button
            onClick={handleGenerate}
            disabled={loading || numSubtasks < 2 || numSubtasks > 20}
            variant="contained"
            sx={{
              bgcolor: colors.primary,
              '&:hover': { bgcolor: colors.primaryHover },
              '&:disabled': { bgcolor: colors.border, color: colors.textMuted }
            }}
          >
            {t('BreakTaskDialog.generate') || 'Generate Subtasks'}
          </Button>
        ) : (
          <Button
            onClick={handleAccept}
            variant="contained"
            sx={{
              bgcolor: colors.primary,
              '&:hover': { bgcolor: colors.primaryHover }
            }}
          >
            {t('BreakTaskDialog.accept') || 'Accept & Replace'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
