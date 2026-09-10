import React, { useState } from 'react';
import {
  Box,
  TextField,
  IconButton,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Chip,
  Typography,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import TuneIcon from '@mui/icons-material/Tune';
import { useTranslation } from 'react-i18next';
import ImageContextPopup from './ImageContextPopup';

export default function InputContainer({
  input,
  setInput,
  loading,
  selectedComplexity,
  setSelectedComplexity,
  onSend,
  onKeyPress,
  hasChatStarted,
  direction,
  isRTL,
  theme,
  // ── General image context props (shared across all tasks) ─────────
  tasks = [],
  originalPrompt = '',
  globalImageContext,          // current context object | null
  onGlobalImageContextChange,  // (context) => void
}) {
  const { t } = useTranslation();
  const [isContextPopupOpen, setIsContextPopupOpen] = useState(false);

  // Default theme if not provided
  const colors = theme || {
    background: '#1e1e1e',
    backgroundSecondary: '#2b2b2b',
    backgroundTertiary: '#3a3a3a',
    text: '#ffffff',
    textMuted: 'gray',
    border: '#4a4a4a',
    borderHover: '#6a6a6a',
    primary: '#4a9eff',
    primaryHover: '#3a8eef',
    shadow: 'rgba(0,0,0,0.3)',
  };

  // ── Complexity options ─────────────────────────────────────────────
  const complexityOptions = [
    { value: 'Basic', label: `${t('TextGenerative.basic')}  (${isRTL ? 'בסיסי' : 'Basic'})` },
    { value: 'Medium', label: `${t('TextGenerative.medium')} (${isRTL ? 'בינוני' : 'Medium'})` },
    { value: 'High', label: `${t('TextGenerative.high')}   (${isRTL ? 'גבוה' : 'High'})` },
  ];

  const getComplexityColor = (complexity) => {
    if (complexity.includes('Basic') || complexity.includes('בסיסי')) return 'success';
    if (complexity.includes('Medium') || complexity.includes('בינוני')) return 'warning';
    if (complexity.includes('High') || complexity.includes('גבוה')) return 'error';
    return 'default';
  };

  const containerSx = hasChatStarted ? {
    position: 'fixed',
    bottom: 16,
    left: 16,
    right: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    width: 'calc(100% - 32px)',
    maxWidth: '1400px',
    alignItems: 'stretch',
    justifyContent: 'center',
    margin: '0 auto',
    transition: 'all 0.5s ease',
    direction: direction,
    bgcolor: colors.background,
    padding: '12px 16px 16px',
    borderRadius: '12px 12px 0 0',
    boxShadow: `0 -4px 20px ${colors.shadow}`,
    zIndex: 1000,
  } : {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    width: '100%',
    direction: direction,
  };

  return (
    <Box sx={containerSx}>
      {/* ── Text field row ── */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end', width: '100%', direction: direction }}>

        <TextField
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder={t('TextGenerative.placeholder')}
          variant="outlined"
          multiline
          maxRows={4}
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position={isRTL ? 'end' : 'start'}>
                {/* Configure shared image context (environment/people/objects/style) for all tasks */}
                <Tooltip
                  title={
                    globalImageContext
                      ? t('ImageContext.contextSet', 'Context Set') + ' ✓'
                      : t('ImageContext.configureContext', 'Configure Image Context')
                  }
                >
                  <span>
                    <IconButton
                      disabled={loading}
                      onClick={() => setIsContextPopupOpen(true)}
                      sx={{
                        color: globalImageContext
                          ? colors.primary
                          : loading
                            ? colors.border
                            : colors.textMuted,
                        transition: 'color 0.2s',
                        '&:hover': { color: colors.primary },
                      }}
                    >
                      <TuneIcon sx={{ fontSize: '18px' }} />
                    </IconButton>
                  </span>
                </Tooltip>
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position={isRTL ? 'start' : 'end'}>
                <FormControl sx={{ minWidth: 160 }}>
                  <Select
                    value={selectedComplexity}
                    onChange={(e) => setSelectedComplexity(e.target.value)}
                    size="small"
                    disabled={loading}
                    startAdornment={
                      <InputAdornment position={ 'end' }>
                        <TuneIcon sx={{ color: loading ? colors.border : colors.primary, fontSize: '18px', mr: 0.5 }} />
                      </InputAdornment>
                    }
                    sx={{
                      bgcolor: colors.backgroundSecondary,
                      color: colors.text,
                      borderRadius: '25px',
                      height: '50px',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: loading ? colors.border : colors.borderHover },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: loading ? colors.border : colors.primary },
                      '& .MuiSelect-icon': {
                        color: loading ? colors.border : colors.primary,
                        right: isRTL ? 'auto' : '7px',
                        left: isRTL ? '7px' : 'auto',
                      },
                      '& .MuiSelect-select': {
                        paddingRight: isRTL ? '14px !important' : '32px !important',
                        paddingLeft: isRTL ? '32px !important' : '14px !important',
                      },
                      '&.Mui-disabled': { color: colors.textMuted },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          bgcolor: colors.backgroundSecondary,
                          color: colors.text,
                          '& .MuiMenuItem-root': {
                            direction: direction,
                            '&:hover': { bgcolor: colors.backgroundTertiary },
                            '&.Mui-selected': {
                              bgcolor: colors.primary,
                              '&:hover': { bgcolor: colors.primaryHover },
                            },
                          },
                        },
                      },
                    }}
                  >
                    {complexityOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                    color: input.trim() && !loading ? colors.primary : colors.textMuted,
                    position: 'relative',
                  }}
                  onClick={onSend}
                  disabled={!input.trim() || loading}
                >
                  {loading ? (
                    <CircularProgress size={20} sx={{ color: colors.primary, position: 'absolute' }} />
                  ) : (
                    <SendIcon sx={{ transform: isRTL ? 'scaleX(-1)' : 'none' }} />
                  )}
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              borderRadius: '30px',
              bgcolor: colors.backgroundSecondary,
              color: colors.text,
              minHeight: '50px',
              direction: direction,
              '& .MuiInputBase-input': { fontSize: '1.1rem', lineHeight: 1.4 },
              '& textarea': { fontSize: '1.1rem', lineHeight: 1.4 },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: loading ? colors.border : colors.borderHover },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: loading ? colors.border : colors.primary },
              '&.Mui-disabled': { color: colors.textMuted },
            },
          }}
          sx={{ flex: 1 }}
        />
      </Box>

      {/* General image context popup — shared context for all tasks */}
      <ImageContextPopup
        open={isContextPopupOpen}
        onClose={() => setIsContextPopupOpen(false)}
        onGenerate={(ctx) => onGlobalImageContextChange?.(ctx)}
        mode="general"
        tasks={tasks}
        originalPrompt={originalPrompt}
        initialContext={globalImageContext}
        theme={theme}
        isRTL={isRTL}
      />
    </Box>
  );
}