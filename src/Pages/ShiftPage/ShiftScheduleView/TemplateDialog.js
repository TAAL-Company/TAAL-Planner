import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useTheme, ThemeProvider, createTheme } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import { cacheRtl, cacheLtr } from '../shiftPageConstants';
import { COLOR_OPTIONS } from './scheduleConstants';

function TemplateDialog({ open, onClose, onSave }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isRtl = theme.direction === 'rtl';
  const muiTheme = createTheme({ direction: isRtl ? 'rtl' : 'ltr' });
  const cache = isRtl ? cacheRtl : cacheLtr;
  const [name, setName]           = useState('');
  const [emoji, setEmoji]         = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime]     = useState('16:00');
  const [color, setColor]         = useState('#1976d2');
  const [error, setError]         = useState('');

  const handleClose = () => {
    setName(''); setEmoji(''); setStartTime('08:00');
    setEndTime('16:00'); setColor('#1976d2'); setError('');
    onClose();
  };

  const handleSave = () => {
    if (!name.trim()) {
      setError(t('ShiftPage.TemplateNameRequired', 'Name is required'));
      return;
    }
    onSave({ name: name.trim(), emoji: emoji.trim() || '📋', startTime, endTime, color });
    handleClose();
  };

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={muiTheme}>
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {t('ShiftPage.CreateTemplate', 'Create Shift Template')}
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
        <TextField
          label={t('ShiftPage.TemplateName', 'Template Name')}
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); }}
          error={!!error}
          helperText={error}
          size="small"
          fullWidth
          required
          autoFocus
        />
        <TextField
          label={t('ShiftPage.Emoji', 'Emoji (optional)')}
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          size="small"
          fullWidth
          placeholder="e.g. 🌅"
          inputProps={{ maxLength: 2 }}
        />
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextField
            label={t('ShiftPage.StartTime', 'Start Time')}
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label={t('ShiftPage.EndTime', 'End Time')}
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        {/* Color picker */}
        <Box>
          <Typography variant="caption" color="text.secondary">
            {t('ShiftPage.Color', 'Color')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 0.5 }}>
            {COLOR_OPTIONS.map((c) => (
              <Box
                key={c}
                onClick={() => setColor(c)}
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  backgroundColor: c,
                  cursor: 'pointer',
                  border: color === c ? '3px solid #0d4264' : '2px solid transparent',
                  boxShadow: color === c ? '0 0 0 1.5px white inset' : 'none',
                  transition: 'border 0.15s',
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Live preview */}
        <Box sx={{ backgroundColor: color, color: 'white', borderRadius: 1.5, p: '7px 12px' }}>
          <Typography variant="caption" fontWeight={700} sx={{ fontSize: 12 }}>
            {emoji || '📋'} {name || 'Template Name'}
          </Typography>
          <Typography variant="caption" display="block" sx={{ opacity: 0.85, fontSize: 10 }}>
            {startTime} – {endTime}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('Cancel', 'Cancel')}</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          sx={{ backgroundColor: '#0d4264', '&:hover': { backgroundColor: '#0a3250' } }}
        >
          {t('ShiftPage.SaveTemplate', 'Save Template')}
        </Button>
      </DialogActions>
        </Dialog>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default TemplateDialog;
