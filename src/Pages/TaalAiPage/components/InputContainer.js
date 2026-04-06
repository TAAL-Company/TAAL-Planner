import React, { useRef } from 'react';
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
import AddIcon from '@mui/icons-material/Add';
import SendIcon from '@mui/icons-material/Send';
import TuneIcon from '@mui/icons-material/Tune';
import CollectionsIcon from '@mui/icons-material/Collections';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';

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
  // ── Base image props ──────────────────────────────────────────────
  baseImage,        // { file: File, preview: string } | null  (controlled from parent)
  onBaseImageChange, // (file: File | null) => void
}) {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

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

  // ── File picker ────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
    if (!file) return;
    onBaseImageChange?.(file);
  };

  const handleRemoveBaseImage = () => {
    onBaseImageChange?.(null);
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

      {/* ── Base-image indicator strip (shown when an image is set) ── */}
      {baseImage && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: colors.backgroundSecondary,
            border: `1px solid ${colors.primary}`,
            borderRadius: 2,
            px: 1.5,
            py: 0.75,
            alignSelf: 'flex-start',
            maxWidth: '100%',
          }}
        >
          <img
            src={baseImage.preview}
            alt="base"
            style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
          />
          <Typography variant="caption" sx={{ color: colors.primary, fontWeight: 600, whiteSpace: 'nowrap' }}>
            {t('TextGenerative.base_image_label', 'Base image:')}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: colors.textMuted || 'gray',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: 180,
            }}
          >
            {baseImage.file.name}
          </Typography>
          <Tooltip title={t('TextGenerative.remove_base_image', 'Remove base image')}>
            <IconButton
              size="small"
              onClick={handleRemoveBaseImage}
              sx={{ color: colors.textMuted || 'gray', padding: '2px', ml: 'auto', '&:hover': { color: '#ff6b6b' } }}
            >
              <CloseIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* ── Text field row ── */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end', width: '100%', direction: direction }}>

        {/* Hidden file input for base image */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

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
                {/* Base-image upload button replaces the generic "+" */}
                <Tooltip
                  title={
                    baseImage
                      ? t('TextGenerative.change_base_image', 'Change base image for all tasks')
                      : t('TextGenerative.upload_base_image', 'Upload base image for all tasks')
                  }
                >
                  <span> {/* span needed so Tooltip works on disabled buttons */}
                    <IconButton
                      disabled={loading}
                      onClick={() => fileInputRef.current?.click()}
                      sx={{
                        color: baseImage
                          ? colors.primary
                          : loading
                            ? colors.border
                            : colors.textMuted,
                        transition: 'color 0.2s',
                        '&:hover': { color: colors.primary },
                      }}
                    >
                      {baseImage
                        ? <CollectionsIcon sx={{ fontSize: '18px' }} />
                        : <AddIcon sx={{ fontSize: '18px' }} />
                      }
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
    </Box>
  );
}