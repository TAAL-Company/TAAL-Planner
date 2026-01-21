import React from "react";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  CircularProgress,
  Skeleton,
  LinearProgress,
} from "@mui/material";
import { useTranslation } from "react-i18next";

export default function LoadingSkeleton({ direction, isRTL, theme, progress = 0 }) {
  const { t } = useTranslation();

  // Default theme if not provided
  const colors = theme || {
    backgroundTertiary: '#3a3a3a',
    text: '#ffffff',
    primary: '#4a9eff',
    accent: '#ff6b35',
  };

  const skeletonBg = theme?.mode === 'light' ? '#d0d0d0' : '#2a2a2a';
  
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isRTL ? "flex-end" : "flex-start",
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
          flexDirection: isRTL ? "row" : "row",
        }}
      >
        <Avatar
          sx={{
            bgcolor: colors.accent,
            width: 32,
            height: 32,
            fontSize: "14px",
          }}
        >
          🤖
        </Avatar>
        <Paper
          sx={{
            p: 2,
            bgcolor: colors.backgroundTertiary,
            color: colors.text,
            borderRadius: "15px",
            direction: direction,
            minWidth: "200px",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <CircularProgress size={16} sx={{ color: colors.primary }} />
            <Typography variant="body2" sx={{ color: colors.primary }}>
              {t('TextGenerative.generatingTasks')}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.primary, fontWeight: 'bold', ml: 'auto' }}>
              {Math.round(progress)}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              mb: 1.5, 
              height: 6, 
              borderRadius: 3,
              bgcolor: skeletonBg,
              '& .MuiLinearProgress-bar': {
                bgcolor: colors.primary,
                borderRadius: 3,
              }
            }} 
          />
          <Skeleton variant="text" width="100%" height={20} sx={{ bgcolor: skeletonBg }} />
          <Skeleton variant="text" width="80%" height={20} sx={{ bgcolor: skeletonBg }} />
          <Skeleton variant="text" width="90%" height={20} sx={{ bgcolor: skeletonBg }} />
          <Skeleton variant="rectangular" width="100%" height={60} sx={{ bgcolor: skeletonBg, mt: 1, borderRadius: 1 }} />
        </Paper>
      </Box>
    </Box>
  );
}