import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Button,
  TextField,
  Typography,
  Box,
  Divider,
  Alert,
  Paper
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
import { useTranslation } from 'react-i18next';

export default function SettingsDialog({
  isOpen,
  onClose,
  customSystemPrompt,
  setCustomSystemPrompt,
  imagePromptPrefix,
  setImagePromptPrefix,
  imagePromptSuffix,
  setImagePromptSuffix,
  imageWidth,
  setImageWidth,
  imageHeight,
  setImageHeight,
  imageModel,
  setImageModel,
  imageNoLogo,
  setImageNoLogo,
  imageSeed,
  setImageSeed,
  defaultEditablePrompt,
  fixedJsonStructure,
  direction,
  isRTL,
  theme
}) {
  const { t } = useTranslation();

  // Default theme if not provided
  const colors = theme || {
    backgroundSecondary: '#2b2b2b',
    backgroundTertiary: '#3a3a3a',
    text: '#ffffff',
    textSecondary: '#cccccc',
    border: '#4a4a4a',
    borderHover: '#6a6a6a',
    primary: '#4a9eff',
    primaryHover: '#3a8eef',
    accent: '#ff6b35',
  };

  const handleSave = () => {
    onClose();
  };

  const handleResetToDefault = () => {
    setCustomSystemPrompt(defaultEditablePrompt);
    setImagePromptPrefix('A highly realistic photo of a person performing the task:');
    setImagePromptSuffix('The scene should look natural and immersive, fitting the task context (e.g., office, workshop, or classroom). Use natural lighting, realistic details, and authentic atmosphere. Ultra-realistic, cinematic composition, shallow depth of field, detailed textures, and no visible text or written words.');
    setImageWidth(1024);
    setImageHeight(1024);
    setImageModel("natural");
    setImageNoLogo(true);
    setImageSeed(432);
  };

  return (
    <>
      {/* Settings FAB */}
      <Fab
        color="primary"
        size="small"
        onClick={() => onClose(true)}
        sx={{
          position: "absolute",
          top: 16,
          [isRTL ? 'left' : 'right']: 16,
          bgcolor: colors.primary,
          "&:hover": { bgcolor: colors.primaryHover },
          zIndex: 1000,
        }}
      >
        <SettingsIcon />
      </Fab>

      {/* Settings Dialog */}
      <Dialog
        open={isOpen}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: colors.backgroundSecondary,
            color: colors.text,
            direction: direction,
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle sx={{
          color: colors.text,
          display: "flex",
          alignItems: "center",
          gap: 1,
          direction: direction,
        }}>
          <SettingsIcon sx={{ color: colors.primary }} />
          {t('TextGenerative.systemPromptSettings')}
        </DialogTitle>
        <DialogContent sx={{ direction: direction, overflow: "auto" }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, color: colors.primary }}>
              {t('TextGenerative.editableInstructions')}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={8}
              value={customSystemPrompt}
              onChange={(e) => setCustomSystemPrompt(e.target.value)}
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: colors.backgroundTertiary,
                  color: colors.text,
                  direction: "ltr",
                  "& fieldset": { borderColor: colors.border },
                  "&:hover fieldset": { borderColor: colors.borderHover },
                  "&.Mui-focused fieldset": { borderColor: colors.primary },
                },
              }}
            />
          </Box>

          <Divider sx={{ bgcolor: colors.border, my: 2 }} />

          {/* Image Generation Settings */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, color: colors.accent }}>
              {t('TextGenerative.imageGenerationSettings')}
            </Typography>

            {/* Image Prompt Settings */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: colors.textSecondary }}>
                {t('TextGenerative.imagePromptPrefix')}:
              </Typography>
              <TextField
                fullWidth
                value={imagePromptPrefix}
                onChange={(e) => setImagePromptPrefix(e.target.value)}
                variant="outlined"
                size="small"
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    bgcolor: colors.backgroundTertiary,
                    color: colors.text,
                    "& fieldset": { borderColor: colors.border },
                    "&:hover fieldset": { borderColor: colors.borderHover },
                    "&.Mui-focused fieldset": { borderColor: colors.primary },
                  },
                }}
              />
              <Typography variant="subtitle2" sx={{ mb: 1, color: colors.textSecondary }}>
                {t('TextGenerative.imagePromptSuffix')}:
              </Typography>
              <TextField
                fullWidth
                value={imagePromptSuffix}
                onChange={(e) => setImagePromptSuffix(e.target.value)}
                variant="outlined"
                size="small"
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    bgcolor: colors.backgroundTertiary,
                    color: colors.text,
                    "& fieldset": { borderColor: colors.border },
                    "&:hover fieldset": { borderColor: colors.borderHover },
                    "&.Mui-focused fieldset": { borderColor: colors.primary },
                  },
                }}
              />
            </Box>

            {/* Image Dimensions */}
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextField
                label={t('TextGenerative.width')}
                type="number"
                value={imageWidth}
                onChange={(e) => setImageWidth((e.target.value))}
                variant="outlined"
                size="small"
                // inputProps={{ min: 100, max: 1024 }}
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": {
                    bgcolor: colors.backgroundTertiary,
                    color: colors.text,
                    "& fieldset": { borderColor: colors.border },
                    "&:hover fieldset": { borderColor: colors.borderHover },
                    "&.Mui-focused fieldset": { borderColor: colors.primary },
                  },
                  "& .MuiInputLabel-root": {
                    color: colors.textSecondary,
                    "&.Mui-focused": { color: colors.primary },
                  },
                }}
              />
              <TextField
                label={t('TextGenerative.height')}
                type="number"
                value={imageHeight}
                onChange={(e) => setImageHeight((e.target.value))}
                variant="outlined"
                size="small"
                // inputProps={{ min: 100, max: 1024 }}
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": {
                    bgcolor: colors.backgroundTertiary,
                    color: colors.text,
                    "& fieldset": { borderColor: colors.border },
                    "&:hover fieldset": { borderColor: colors.borderHover },
                    "&.Mui-focused fieldset": { borderColor: colors.primary },
                  },
                  "& .MuiInputLabel-root": {
                    color: colors.textSecondary,
                    "&.Mui-focused": { color: colors.primary },
                  },
                }}
              />
              <TextField
                label={t('TextGenerative.seed')}
                type="number"
                value={imageSeed}
                onChange={(e) => setImageSeed(parseInt(e.target.value))}
                variant="outlined"
                size="small"
                inputProps={{ min: 1, max: 1000000 }}
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": {
                    bgcolor: colors.backgroundTertiary,
                    color: colors.text,
                    "& fieldset": { borderColor: colors.border },
                    "&:hover fieldset": { borderColor: colors.borderHover },
                    "&.Mui-focused fieldset": { borderColor: colors.primary },
                  },
                  "& .MuiInputLabel-root": {
                    color: colors.textSecondary,
                    "&.Mui-focused": { color: colors.primary },
                  },
                }}
              />
            </Box>

            {/* Model Selection */}
            <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
              <TextField
                select
                label={t('TextGenerative.model')}
                value={imageModel}
                onChange={(e) => setImageModel(e.target.value)}
                variant="outlined"
                size="small"
                sx={{
                  minWidth: 120,
                  "& .MuiOutlinedInput-root": {
                    bgcolor: colors.backgroundTertiary,
                    color: colors.text,
                    "& fieldset": { borderColor: colors.border },
                    "&:hover fieldset": { borderColor: colors.borderHover },
                    "&.Mui-focused fieldset": { borderColor: colors.primary },
                  },
                  "& .MuiInputLabel-root": {
                    color: colors.textSecondary,
                    "&.Mui-focused": { color: colors.primary },
                  },
                }}
                SelectProps={{
                  sx: {
                    "& .MuiMenuItem-root": {
                      bgcolor: colors.backgroundTertiary,
                      color: colors.text,
                      "&:hover": { bgcolor: colors.border },
                    },
                  },
                }}
              >
                <option value="natural">{('natural')}</option>
                <option value="vivid">{t('vivid')}</option>
                {/* <option value="midjourney">{t('TextGenerative.midjourney')}</option> */}
              </TextField>

              {/* <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <input
                  type="checkbox"
                  id="nologo-checkbox"
                  checked={imageNoLogo}
                  onChange={(e) => setImageNoLogo(e.target.checked)}
                  style={{
                    accentColor: colors.primary,
                    transform: "scale(1.2)"
                  }}
                />
                <label htmlFor="nologo-checkbox" style={{ color: colors.textSecondary, cursor: "pointer" }}>
                  {t('TextGenerative.noLogo')}
                </label>
              </Box> */}
            </Box>
          </Box>

          <Divider sx={{ bgcolor: colors.border, my: 2 }} />

          <Box>
            <Typography variant="h6" sx={{ mb: 2, color: colors.accent }}>
              {t('TextGenerative.fixedJsonStructure')}
            </Typography>
            <Alert
              severity="info"
              sx={{
                mb: 2,
                bgcolor: colors.mode === 'light' ? '#e3f2fd' : "#1a3a5c",
                color: colors.text,
                direction: direction,
                "& .MuiAlert-icon": {
                  color: colors.primary,
                },
              }}
            >
              {t('TextGenerative.fixedJsonDescription')}
            </Alert>
            <Paper
              sx={{
                bgcolor: colors.mode === 'light' ? '#f5f5f5' : "#1a1a1a",
                color: colors.textSecondary,
                p: 2,
                borderRadius: 1,
                fontFamily: "monospace",
                fontSize: "0.9rem",
                border: `1px solid ${colors.border}`,
                direction: "ltr",
              }}
            >
              <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                {fixedJsonStructure}
              </pre>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1, direction: direction }}>
          <Button onClick={handleResetToDefault} variant="outlined">
            {t('TextGenerative.resetToDefault')}
          </Button>
          <Button onClick={onClose} variant="outlined">
            {t('TextGenerative.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{ bgcolor: colors.primary, "&:hover": { bgcolor: colors.primaryHover } }}
          >
            {t('TextGenerative.saveSettings')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}