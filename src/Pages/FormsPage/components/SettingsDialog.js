import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
  Divider,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import TranslateIcon from '@mui/icons-material/Translate';
import RestoreIcon from '@mui/icons-material/Restore';
import { useTranslation } from 'react-i18next';

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'he', name: 'עברית (Hebrew)' },
  { code: 'ar', name: 'العربية (Arabic)' },
  { code: 'ru', name: 'Русский (Russian)' },
];

const SettingsDialog = ({
  open,
  onClose,
  onTranslate,
  onRestore,
  isTranslating,
  isTranslated,
  currentTranslationLang,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const { t } = useTranslation();

  const handleLanguageChange = (event) => {
    setSelectedLanguage(event.target.value);
  };

  const handleTranslate = () => {
    onTranslate(selectedLanguage);
  };

  const handleRestore = () => {
    onRestore();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      dir={t('Direction')}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: '#114260',
          color: 'white',
        }}
      >
        <SettingsIcon />
        {t('FormsPage.settings') || 'Settings'}
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Box sx={{ py: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TranslateIcon color="primary" />
            {t('FormsPage.dataTranslation') || 'Data Translation'}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('FormsPage.translationDescription') || 'Translate all data from the API to your preferred language. This will translate user names, task names, route names, and other text content.'}
          </Typography>

          {isTranslated && (
            <Box
              sx={{
                mb: 2,
                p: 1.5,
                bgcolor: '#e3f2fd',
                borderRadius: 1,
                border: '1px solid #90caf9',
              }}
            >
              <Typography variant="body2" color="primary">
                {t('FormsPage.currentlyTranslated') || 'Currently translated to:'}{' '}
                <strong>
                  {SUPPORTED_LANGUAGES.find((l) => l.code === currentTranslationLang)?.name || currentTranslationLang}
                </strong>
              </Typography>
            </Box>
          )}

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="language-select-label">
              {t('FormsPage.selectLanguage') || 'Select Language'}
            </InputLabel>
            <Select
              labelId="language-select-label"
              value={selectedLanguage}
              label={t('FormsPage.selectLanguage') || 'Select Language'}
              onChange={handleLanguageChange}
              disabled={isTranslating}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <MenuItem key={lang.code} value={lang.code}>
                  {lang.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleTranslate}
              disabled={isTranslating}
              startIcon={isTranslating ? <CircularProgress size={20} color="inherit" /> : <TranslateIcon />}
              sx={{ flex: 1, minWidth: 150 }}
            >
              {isTranslating
                ? t('FormsPage.translating') || 'Translating...'
                : t('FormsPage.translateData') || 'Translate Data'}
            </Button>

            <Button
              variant="outlined"
              color="secondary"
              onClick={handleRestore}
              disabled={isTranslating || !isTranslated}
              startIcon={<RestoreIcon />}
              sx={{ flex: 1, minWidth: 150 }}
            >
              {t('FormsPage.restoreOriginal') || 'Restore Original'}
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="caption" color="text.secondary">
          {t('FormsPage.translationNote') || 'Note: Translation is performed using Google Translate API. Some specialized terms may not translate accurately.'}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          {t('FormsPage.close') || 'Close'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsDialog;
