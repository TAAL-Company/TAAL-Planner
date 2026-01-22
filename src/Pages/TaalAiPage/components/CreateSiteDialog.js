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
  TextField,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useTranslation } from "react-i18next";

export default function CreateSiteDialog({
  open,
  onClose,
  isCreating,
  siteName,
  onSiteNameChange,
  siteNameEn,
  onSiteNameEnChange,
  siteDescription,
  onSiteDescriptionChange,
  siteImageFile,
  onSiteImageFileChange,
  isGeneratingImage,
  onGenerateImage,
  isValid,
  onCreateSite,
  direction
}) {
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
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
        <AddIcon sx={{ color: "#4a9eff" }} />
        {t('PushToPlannerPopup.createSiteTitle') || 'Create Site'}
        <IconButton
          onClick={onClose}
          sx={{ marginLeft: "auto", color: "gray" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            fullWidth
            required
            label={t('PushToPlannerPopup.siteName') || 'Site Name'}
            value={siteName}
            onChange={(e) => onSiteNameChange(e.target.value)}
            InputLabelProps={{ sx: { color: "#ccc" } }}
            sx={{
              bgcolor: "#3a3a3a",
              borderRadius: 1,
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": { borderColor: "#4a4a4a" },
                "&:hover fieldset": { borderColor: "#6a6a6a" },
              }
            }}
          />

          <TextField
            fullWidth
            required
            label={t('PushToPlannerPopup.siteNameEnglish') || 'Site Name (English)'}
            value={siteNameEn}
            onChange={(e) => onSiteNameEnChange(e.target.value)}
            InputLabelProps={{ sx: { color: "#ccc" } }}
            sx={{
              bgcolor: "#3a3a3a",
              borderRadius: 1,
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": { borderColor: "#4a4a4a" },
                "&:hover fieldset": { borderColor: "#6a6a6a" },
              }
            }}
          />

          <TextField
            fullWidth
            multiline
            minRows={3}
            label={t('PushToPlannerPopup.siteDescription') || 'Description'}
            value={siteDescription}
            onChange={(e) => onSiteDescriptionChange(e.target.value)}
            InputLabelProps={{ sx: { color: "#ccc" } }}
            sx={{
              bgcolor: "#3a3a3a",
              borderRadius: 1,
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": { borderColor: "#4a4a4a" },
                "&:hover fieldset": { borderColor: "#6a6a6a" },
              }
            }}
          />

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              disabled={isGeneratingImage}
              sx={{
                borderColor: "#4a4a4a",
                color: "#ccc",
                "&:hover": { borderColor: "#6a6a6a", bgcolor: "rgba(255,255,255,0.04)" },
                "&:disabled": { borderColor: "#333", color: "#666" },
              }}
            >
              {siteImageFile
                ? (t('PushToPlannerPopup.changePicture') || 'Change picture')
                : (t('PushToPlannerPopup.uploadPicture') || 'Upload picture')}
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files && e.target.files[0];
                  onSiteImageFileChange(file || null);
                }}
              />
            </Button>

            <Button
              variant="outlined"
              startIcon={isGeneratingImage ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />}
              onClick={onGenerateImage}
              disabled={isGeneratingImage || (!siteName.trim() && !siteNameEn.trim())}
              sx={{
                borderColor: "#4a9eff",
                color: "#4a9eff",
                "&:hover": { borderColor: "#3a8eef", bgcolor: "rgba(74, 158, 255, 0.08)" },
                "&:disabled": { borderColor: "#333", color: "#666" },
              }}
            >
              {isGeneratingImage
                ? (t('PushToPlannerPopup.generating') || 'Generating...')
                : (t('PushToPlannerPopup.generateImage') || 'Generate Image')}
            </Button>

            {siteImageFile && (
              <>
                <Typography variant="body2" sx={{ color: "#aaa", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: "100px" }}>
                  {siteImageFile.name}
                </Typography>
                <IconButton size="small" onClick={() => onSiteImageFileChange(null)} disabled={isGeneratingImage}>
                  <ClearIcon sx={{ color: "#aaa" }} />
                </IconButton>
              </>
            )}
          </Box>

          {/* Image Preview */}
          {siteImageFile && (
            <Box sx={{ 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center",
              mt: 1,
              p: 2,
              bgcolor: "#3a3a3a",
              borderRadius: 2,
              border: "1px solid #4a4a4a"
            }}>
              <Box
                component="img"
                src={URL.createObjectURL(siteImageFile)}
                alt={t('PushToPlannerPopup.siteImagePreview') || 'Site image preview'}
                sx={{
                  maxWidth: "100%",
                  maxHeight: "200px",
                  borderRadius: 1,
                  objectFit: "contain"
                }}
              />
            </Box>
          )}

          {!isValid && (
            <Typography variant="caption" sx={{ color: "#ff6b35" }}>
              {t('PushToPlannerPopup.siteNameRequired') || 'Site name and English name are required'}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ borderTop: "1px solid #4a4a4a", p: 2, gap: 1 }}>
        <Button onClick={onClose} sx={{ color: "gray" }}>
          {t('PushToPlannerPopup.cancel') || 'Cancel'}
        </Button>
        <Button
          variant="contained"
          onClick={onCreateSite}
          disabled={isCreating || !isValid}
          startIcon={isCreating ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
          sx={{
            bgcolor: "#4a9eff",
            "&:hover": { bgcolor: "#3a8eef" },
            "&:disabled": { bgcolor: "#555", color: "#999" },
            minWidth: "140px"
          }}
        >
          {isCreating
            ? (t('PushToPlannerPopup.creating') || 'Creating...')
            : (t('PushToPlannerPopup.create') || 'Create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
