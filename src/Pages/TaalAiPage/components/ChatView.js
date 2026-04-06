import React from 'react';
import { Box, Typography, Icon, Button, Chip } from '@mui/material';
import TaskIcon from '@mui/icons-material/Task';
import { useTranslation } from 'react-i18next';
import ChatContainer from './ChatContainer';
import TaskTable from './TaskTable';
import InputContainer from './InputContainer';

/**
 * Shown once the user has sent at least one message.
 * Renders the header, action buttons, chat + task-table area, and the
 * fixed bottom input.
 */
export default function ChatView({
  direction,
  isRTL,
  theme,
  inputContainerProps,
  // table state
  isTableOpen,
  toggleTable,
  setIsTableOpen,
  hasTasksReady,
  tasks,
  setTasks,
  complexity,
  getComplexityColor,
  // chat
  messages,
  userInputs,
  loading,
  loadingProgress,
  handleShowTasks,
  // image settings
  imagePromptPrefix,
  imagePromptSuffix,
  imageWidth,
  imageHeight,
  imageModel,
  imageNoLogo,
  imageSeed,
  baseImage,
}) {
  const { t } = useTranslation();

  return (
    <>
      {/* Logo + Title — top positioned */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        transition: 'all 0.5s ease',
        direction,
        mb: 2,
      }}>
        <Icon
          sx={{
            width: 100,
            height: 106,
            backgroundImage: "url('../../Pictures/logo_Taal_Ai.svg')",
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            borderRadius: 1,
            transform: isRTL ? 'none' : 'scaleX(-1)',
            filter: theme.mode === 'light' ? 'invert(1)' : 'none',
          }}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="h5">{t('TextGenerative.title')}</Typography>
          <Typography variant="body2" sx={{ color: theme.textMuted }}>
            {t('TextGenerative.subtitle')}
          </Typography>
        </Box>
      </Box>

      {/* Action Buttons */}
      <Box sx={{
        display: 'flex',
        gap: 2,
        mb: 2,
        alignSelf: isRTL ? 'flex-end' : 'flex-start',
        maxWidth: '100%',
        width: '100%',
        opacity: 1,
        transform: 'translateY(0)',
        transition: 'all 0.5s ease',
        direction,
      }}>
        <Button
          variant={isTableOpen ? 'contained' : 'outlined'}
          startIcon={<TaskIcon />}
          onClick={toggleTable}
          disabled={!hasTasksReady}
          sx={{
            color: isTableOpen ? 'white' : theme.primary,
            borderColor: theme.primary,
            bgcolor: isTableOpen ? theme.primary : 'transparent',
            '&:hover': {
              bgcolor: isTableOpen ? theme.primaryHover : `${theme.primary}1A`,
            },
            '&:disabled': {
              color: theme.textMuted,
              borderColor: theme.textMuted,
            },
          }}
        >
          {isTableOpen
            ? t('TextGenerative.hideTasks')
            : `${t('TextGenerative.showTasks')} ${tasks.length > 0 ? `(${tasks.length})` : ''}`}
        </Button>

        {complexity && (
          <Chip
            label={complexity}
            color={getComplexityColor(complexity)}
            size="small"
            sx={{ alignSelf: 'center' }}
          />
        )}
      </Box>

      {/* Main Content Area: Chat + Task Table */}
      <Box sx={{
        display: 'flex',
        gap: 2,
        width: '100%',
        flex: 1,
        mb: 2,
        opacity: 1,
        transform: 'translateY(0)',
        transition: 'all 0.5s ease',
        direction,
      }}>
        <ChatContainer
          messages={messages}
          userInputs={userInputs}
          loading={loading}
          loadingProgress={loadingProgress}
          direction={direction}
          isRTL={isRTL}
          isTableOpen={isTableOpen}
          onShowTasks={handleShowTasks}
          getComplexityColor={getComplexityColor}
          theme={theme}
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
          baseImage={baseImage}
          direction={direction}
          isRTL={isRTL}
          getComplexityColor={getComplexityColor}
          theme={theme}
        />
      </Box>

      {/* Fixed bottom input */}
      <InputContainer {...inputContainerProps} />
    </>
  );
}
