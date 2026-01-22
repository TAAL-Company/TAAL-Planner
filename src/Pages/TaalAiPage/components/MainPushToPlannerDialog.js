import React from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton,
  Paper,
  TextField,
  LinearProgress
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useTranslation } from "react-i18next";

export default function MainPushToPlannerDialog({
  isOpen,
  onClose,
  tasks,
  complexity,
  direction,
  routeName,
  onRouteNameChange,
  suggestedRouteName,
  isRouteNameValid,
  isUploading,
  uploadStatus,
  uploadProgress,
  onOpenSitePopup
}) {
  const { t } = useTranslation();

  // Calculate total time
  const totalTime = tasks.reduce((sum, task) => sum + task.estimatedTimeMinutes, 0);
  
  const formatTime = (minutes) => {
    if (minutes < 60) {
      return `~${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `~${hours}h ${remainingMinutes}min` : `~${hours}h`;
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "#2b2b2b",
          color: "white",
          direction: direction
        }
      }}
    >
      <DialogTitle sx={{ 
        display: "flex", 
        alignItems: "center", 
        gap: 1,
        borderBottom: "1px solid #4a4a4a"
      }}>
        <CloudUploadIcon sx={{ color: "#4a9eff" }} />
        {t('PushToPlannerPopup.pushToPlanner') || 'Push to Planner'}
        <IconButton 
          onClick={onClose}
          sx={{ 
            marginLeft: "auto", 
            color: "gray" 
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ color: "#4a9eff", mb: 2 }}>
            {t('PushToPlannerPopup.uploadSummary') || 'Upload Summary'}
          </Typography>
          
          <Paper sx={{ 
            bgcolor: "#3a3a3a", 
            p: 2, 
            borderRadius: 2,
            border: "1px solid #4a4a4a"
          }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="body2" sx={{ color: "gray" }}>
                {t('PushToPlannerPopup.totalTasks') || 'Total Tasks'}:
              </Typography>
              <Typography variant="body2" sx={{ color: "white", fontWeight: "bold" }}>
                {tasks.length}
              </Typography>
            </Box>
            
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="body2" sx={{ color: "gray" }}>
                {t('PushToPlannerPopup.estimatedTime') || 'Estimated Time'}:
              </Typography>
              <Typography variant="body2" sx={{ color: "#4a9eff", fontWeight: "bold" }}>
                {formatTime(totalTime)}
              </Typography>
            </Box>
            
            {complexity && (
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" sx={{ color: "gray" }}>
                  {t('PushToPlannerPopup.complexity') || 'Complexity'}:
                </Typography>
                <Typography variant="body2" sx={{ color: "#00e676", fontWeight: "bold" }}>
                  {complexity}
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>

        {/* Route Name input */}
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            required
            label={t('PushToPlannerPopup.routeName') || 'Route Name'}
            placeholder={t('PushToPlannerPopup.routeNamePlaceholder') || suggestedRouteName}
            value={routeName}
            onChange={(e) => onRouteNameChange(e.target.value)}
            InputLabelProps={{ sx: { color: "#ccc" } }}
            inputProps={{ maxLength: 100 }}
            sx={{
              bgcolor: "#3a3a3a",
              borderRadius: 1,
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": { borderColor: "#4a4a4a" },
                "&:hover fieldset": { borderColor: "#6a6a6a" },
              }
            }}
            helperText={
              !isRouteNameValid
                ? (t('PushToPlannerPopup.routeNameRequired') || 'Please enter a route name')
                : " "
            }
            FormHelperTextProps={{ sx: { color: !isRouteNameValid ? "#ff6b35" : "#2b2b2b" } }}
          />
        </Box>

        <Typography variant="body2" sx={{ color: "#ccc", mb: 2, textAlign: "center" }}>
          {t('PushToPlannerPopup.selectSiteToUploadMessage') || 'Select a site to upload your AI-generated tasks and create a new route in the planner.'}
        </Typography>
        
        <Typography variant="caption" sx={{ color: "#ff6b35", fontStyle: "italic", display: "block", textAlign: "center" }}>
          {t('PushToPlannerPopup.uploadNote') || 'Note: This will create a new station and route with all your tasks.'}
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ borderTop: "1px solid #4a4a4a", p: 2, gap: 1 }}>
        <Button 
          onClick={onClose}
          sx={{ color: "gray" }}
        >
          {t('PushToPlannerPopup.cancel') || 'Cancel'}
        </Button>
        
        <Button
          variant="contained"
          startIcon={isUploading ? <CircularProgress size={16} color="inherit" /> : <CloudUploadIcon />}
          onClick={onOpenSitePopup}
          disabled={isUploading || tasks.length === 0 || !isRouteNameValid}
          sx={{
            bgcolor: "#4a9eff",
            "&:hover": { bgcolor: "#3a8eef" },
            "&:disabled": {
              bgcolor: "#555",
              color: "#999"
            },
            minWidth: "160px",
            flexDirection: 'column',
            py: isUploading ? 1 : undefined
          }}
        >
          {isUploading 
            ? (
              <Box sx={{ width: '100%', textAlign: 'center' }}>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  {uploadStatus} {uploadProgress}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={uploadProgress} 
                  sx={{ 
                    width: '100%', 
                    height: 4, 
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: 'white',
                      borderRadius: 2,
                    }
                  }} 
                />
              </Box>
            )
            : (t('PushToPlannerPopup.selectSiteAndUpload') || 'Select Site & Upload')
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
}
