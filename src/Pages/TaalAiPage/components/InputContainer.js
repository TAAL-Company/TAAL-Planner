import React from 'react';
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SendIcon from '@mui/icons-material/Send';
import TuneIcon from '@mui/icons-material/Tune';
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
}) {
  const { t } = useTranslation();

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

  // Complexity options with i18n support
  const complexityOptions = [
    { value: 'Basic', label: `${t('TextGenerative.basic')} (${isRTL ? 'בסיסי' : 'Basic'})` },
    { value: 'Medium', label: `${t('TextGenerative.medium')} (${isRTL ? 'בינוני' : 'Medium'})` },
    { value: 'High', label: `${t('TextGenerative.high')} (${isRTL ? 'גבוה' : 'High'})` }
  ];

  const getComplexityColor = (complexity) => {
    if (complexity.includes('Basic') || complexity.includes('בסיסי')) return 'success';
    if (complexity.includes('Medium') || complexity.includes('בינוני')) return 'warning';
    if (complexity.includes('High') || complexity.includes('גבוה')) return 'error';
    return 'default';
  };

  const containerSx = hasChatStarted ? {
    position: "fixed",
    bottom: 16,
    left: 16,
    right: 16,
    display: "flex",
    gap: 1,
    width: "calc(100% - 32px)",
    maxWidth: "1400px",
    alignItems: "flex-end",
    justifyContent: "center",
    margin: "0 auto",
    transition: "all 0.5s ease",
    direction: direction,
    bgcolor: colors.background,
    padding: "16px",
    borderRadius: "12px 12px 0 0",
    boxShadow: `0 -4px 20px ${colors.shadow}`,
    zIndex: 1000,
  } : {
    display: "flex",
    gap: 1,
    width: "100%",
    alignItems: "flex-end",
    direction: direction,
  };

  return (
    <Box sx={containerSx}>
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
            <InputAdornment position={isRTL ? "end" : "start"}>
              <IconButton disabled={loading}>
                <AddIcon sx={{ color: loading ? colors.border : colors.textMuted, fontSize: "18px" }} />
              </IconButton>
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position={isRTL ? "start" : "end"}>
              <FormControl sx={{ minWidth: 160 }}>
                <Select
                  value={selectedComplexity}
                  onChange={(e) => setSelectedComplexity(e.target.value)}
                  size="small"
                  disabled={loading}
                  startAdornment={
                    <InputAdornment position="start">
                      <TuneIcon sx={{ color: loading ? colors.border : colors.primary, fontSize: "18px", mr: 0.5 }} />
                    </InputAdornment>
                  }
                  sx={{
                    bgcolor: colors.backgroundSecondary,
                    color: colors.text,
                    borderRadius: "25px",
                    height: "50px",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: loading ? colors.border : colors.border,
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: loading ? colors.border : colors.borderHover,
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: loading ? colors.border : colors.primary,
                    },
                    "& .MuiSelect-icon": {
                      color: loading ? colors.border : colors.primary,
                    },
                    "&.Mui-disabled": {
                      color: colors.textMuted,
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: colors.backgroundSecondary,
                        color: colors.text,
                        "& .MuiMenuItem-root": {
                          direction: direction,
                          "&:hover": { bgcolor: colors.backgroundTertiary },
                          "&.Mui-selected": {
                            bgcolor: colors.primary,
                            "&:hover": { bgcolor: colors.primaryHover },
                          },
                        },
                      },
                    },
                  }}
                >
                  {complexityOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                  color: (input.trim() && !loading) ? colors.primary : colors.textMuted,
                  position: "relative",
                }}
                onClick={onSend}
                disabled={!input.trim() || loading}
              >
                {loading ? (
                  <CircularProgress
                    size={20}
                    sx={{
                      color: colors.primary,
                      position: "absolute",
                    }}
                  />
                ) : (
                  <SendIcon sx={{
                    transform: isRTL ? "scaleX(-1)" : "none"
                  }} />
                )}
              </IconButton>
            </InputAdornment>
          ),
          sx: {
            borderRadius: "30px",
            bgcolor: colors.backgroundSecondary,
            color: colors.text,
            minHeight: "50px",
            direction: direction,
            "& .MuiInputBase-input": {
              fontSize: "1.1rem",
              lineHeight: 1.4,
            },
            "& textarea": {
              fontSize: "1.1rem",
              lineHeight: 1.4,
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: loading ? colors.border : colors.border,
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: loading ? colors.border : colors.borderHover,
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: loading ? colors.border : colors.primary,
            },
            "&.Mui-disabled": {
              color: colors.textMuted,
            },
          },
        }}
        sx={{ flex: 1 }}
      />
    </Box>
  );
}