import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  List,
  ListItemButton,
  ListItemText,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import AddCommentIcon from '@mui/icons-material/AddComment';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloseIcon from '@mui/icons-material/Close';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { useTranslation } from 'react-i18next';

/**
 * ChatGPT/Claude-style chat history sidebar.
 * Lists saved conversations for the current editor, lets them resume one,
 * start a new chat, or delete an existing one.
 */
export default function HistorySidebar({
  open,
  onClose,
  conversations,
  activeId,
  loading,
  loadingConversationId,
  deletingConversationId,
  onSelect,
  onNew,
  onDelete,
  direction,
  isRTL,
  theme,
}) {
  const { t } = useTranslation();
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const colors = theme || {
    backgroundSecondary: '#2b2b2b',
    backgroundTertiary: '#3a3a3a',
    text: '#ffffff',
    textMuted: 'gray',
    border: '#4a4a4a',
    primary: '#4a9eff',
    primaryHover: '#3a8eef',
  };

  const formatRelativeTime = (isoDate) => {
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const diffMin = Math.round(diffMs / 60000);
    if (diffMin < 1) return t('TextGenerative.history_just_now', 'Just now');
    if (diffMin < 60) return t('TextGenerative.history_minutes_ago', '{{count}}m ago', { count: diffMin });
    const diffHr = Math.round(diffMin / 60);
    if (diffHr < 24) return t('TextGenerative.history_hours_ago', '{{count}}h ago', { count: diffHr });
    const diffDay = Math.round(diffHr / 24);
    return t('TextGenerative.history_days_ago', '{{count}}d ago', { count: diffDay });
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteId) return;
    await onDelete(pendingDeleteId);
    setPendingDeleteId(null);
  };

  return (
    <>
      <Drawer
        anchor={isRTL ? 'right' : 'left'}
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: 300,
            bgcolor: colors.backgroundSecondary,
            color: colors.text,
            direction,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
          <Typography variant="h6">{t('TextGenerative.chatHistory', 'Chat History')}</Typography>
          <IconButton onClick={onClose} sx={{ color: colors.textMuted }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ px: 2, pb: 1 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<AddCommentIcon />}
            onClick={onNew}
            disabled={!!loadingConversationId}
            sx={{
              color: colors.primary,
              borderColor: colors.primary,
              justifyContent: 'flex-start',
              textTransform: 'none',
              '&:hover': { bgcolor: `${colors.primary}1A`, borderColor: colors.primary },
            }}
          >
            {t('TextGenerative.newChat', 'New chat')}
          </Button>
        </Box>

        <Box sx={{ overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={24} sx={{ color: colors.primary }} />
            </Box>
          ) : conversations.length === 0 ? (
            <Typography variant="body2" sx={{ color: colors.textMuted, textAlign: 'center', p: 3 }}>
              {t('TextGenerative.noChatsYet', 'No saved chats yet')}
            </Typography>
          ) : (
            <List sx={{ py: 0 }}>
              {conversations.map((conv) => {
                const isLoadingThis = conv.id === loadingConversationId;
                const isDeletingThis = conv.id === deletingConversationId;
                const isAnyLoading = !!loadingConversationId || !!deletingConversationId;
                return (
                <ListItemButton
                  key={conv.id}
                  selected={conv.id === activeId}
                  onClick={() => onSelect(conv.id)}
                  disabled={isAnyLoading}
                  sx={{
                    px: 2,
                    py: 1,
                    gap: 1,
                    '&.Mui-selected': { bgcolor: `${colors.primary}26` },
                    '&:hover': { bgcolor: colors.backgroundTertiary },
                    '&:hover .history-delete-btn': { opacity: 1 },
                  }}
                >
                  {isLoadingThis ? (
                    <CircularProgress size={18} sx={{ color: colors.primary, flexShrink: 0 }} />
                  ) : (
                    <ChatBubbleOutlineIcon sx={{ fontSize: 18, color: colors.textMuted, flexShrink: 0 }} />
                  )}
                  <ListItemText
                    primary={conv.title || t('TextGenerative.newChat', 'New chat')}
                    secondary={formatRelativeTime(conv.updatedAt)}
                    primaryTypographyProps={{
                      noWrap: true,
                      sx: { fontSize: '0.9rem', color: colors.text },
                    }}
                    secondaryTypographyProps={{
                      sx: { fontSize: '0.75rem', color: colors.textMuted },
                    }}
                  />
                  <Tooltip title={t('TextGenerative.deleteChat', 'Delete chat')}>
                    <IconButton
                      size="small"
                      className="history-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingDeleteId(conv.id);
                      }}
                      disabled={isAnyLoading}
                      sx={{ color: colors.textMuted, opacity: isDeletingThis ? 1 : 0, '&:hover': { color: '#ff6b6b' } }}
                    >
                      {isDeletingThis ? (
                        <CircularProgress size={16} sx={{ color: '#ff6b6b' }} />
                      ) : (
                        <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                      )}
                    </IconButton>
                  </Tooltip>
                </ListItemButton>
                );
              })}
            </List>
          )}
        </Box>
      </Drawer>

      <Dialog open={!!pendingDeleteId} onClose={deletingConversationId ? undefined : () => setPendingDeleteId(null)} dir={direction}>
        <DialogTitle>{t('TextGenerative.deleteChatConfirmTitle', 'Delete this chat?')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {t('TextGenerative.deleteChatConfirmBody', 'This chat and its generated tasks/images will be permanently deleted.')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingDeleteId(null)} disabled={!!deletingConversationId}>
            {t('TextGenerative.cancel', 'Cancel')}
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDelete}
            disabled={!!deletingConversationId}
            startIcon={deletingConversationId ? <CircularProgress size={14} sx={{ color: 'white' }} /> : null}
          >
            {t('TextGenerative.delete', 'Delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
