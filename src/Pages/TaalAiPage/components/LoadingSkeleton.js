import React from "react";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import { useTranslation } from "react-i18next";

export default function LoadingSkeleton({ direction, isRTL }) {
  const { t } = useTranslation();
  
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
            bgcolor: "#ff6b35",
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
            bgcolor: "#3a3a3a",
            color: "white",
            borderRadius: "15px",
            direction: direction,
            minWidth: "200px",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <CircularProgress size={16} sx={{ color: "#4a9eff" }} />
            <Typography variant="body2" sx={{ color: "#4a9eff" }}>
              {t('TextGenerative.generatingTasks')}
            </Typography>
          </Box>
          <Skeleton variant="text" width="100%" height={20} sx={{ bgcolor: "#2a2a2a" }} />
          <Skeleton variant="text" width="80%" height={20} sx={{ bgcolor: "#2a2a2a" }} />
          <Skeleton variant="text" width="90%" height={20} sx={{ bgcolor: "#2a2a2a" }} />
          <Skeleton variant="rectangular" width="100%" height={60} sx={{ bgcolor: "#2a2a2a", mt: 1, borderRadius: 1 }} />
        </Paper>
      </Box>
    </Box>
  );
}