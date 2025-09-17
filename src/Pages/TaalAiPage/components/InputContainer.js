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
}) {
  const { t } = useTranslation();

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
    bgcolor: "#1e1e1e",
    padding: "16px",
    borderRadius: "12px 12px 0 0",
    boxShadow: "0 -4px 20px rgba(0,0,0,0.3)",
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
                <AddIcon sx={{ color: loading ? "#666" : "gray", fontSize: "18px" }} />
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
                      <TuneIcon sx={{ color: loading ? "#666" : "#4a9eff", fontSize: "18px", mr: 0.5 }} />
                    </InputAdornment>
                  }
                  sx={{
                    bgcolor: "#2b2b2b",
                    color: "white",
                    borderRadius: "25px",
                    height: "50px",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: loading ? "#666" : "#4a4a4a",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: loading ? "#666" : "#6a6a6a",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: loading ? "#666" : "#4a9eff",
                    },
                    "& .MuiSelect-icon": {
                      color: loading ? "#666" : "#4a9eff",
                    },
                    "&.Mui-disabled": {
                      color: "#888",
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: "#2b2b2b",
                        color: "white",
                        "& .MuiMenuItem-root": {
                          direction: direction,
                          "&:hover": { bgcolor: "#3a3a3a" },
                          "&.Mui-selected": {
                            bgcolor: "#4a9eff",
                            "&:hover": { bgcolor: "#3a8eef" },
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
                  color: (input.trim() && !loading) ? "#4a9eff" : "gray",
                  position: "relative",
                }}
                onClick={onSend}
                disabled={!input.trim() || loading}
              >
                {loading ? (
                  <CircularProgress
                    size={20}
                    sx={{
                      color: "#4a9eff",
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
            bgcolor: "#2b2b2b",
            color: "white",
            minHeight: "50px",
            direction: direction,
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: loading ? "#666" : "#4a4a4a",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: loading ? "#666" : "#6a6a6a",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: loading ? "#666" : "#4a9eff",
            },
            "&.Mui-disabled": {
              color: "#888",
            },
          },
        }}
        sx={{ flex: 1 }}
      />
    </Box>
  );
}