import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useTheme, ThemeProvider, createTheme } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import { cacheRtl, cacheLtr } from '../shiftPageConstants';

export const SHIFT_COLORS = [
  { label: 'Blue', value: '#1976d2' },
  { label: 'Green', value: '#388e3c' },
  { label: 'Orange', value: '#f57c00' },
  { label: 'Purple', value: '#7b1fa2' },
  { label: 'Red', value: '#d32f2f' },
  { label: 'Teal', value: '#00796b' },
];

export const defaultForm = {
  name: '',
  date: '',
  startTime: '',
  endTime: '',
  color: '#1976d2',
  notes: '',
};

export default function ShiftForm({ open, onClose, onSave, initialValues, title }) {
  const [form, setForm] = useState({ ...defaultForm });
  const [errors, setErrors] = useState({});
  const { t } = useTranslation();
  const theme = useTheme();
  const isRtl = theme.direction === 'rtl';
  const muiTheme = createTheme({ direction: isRtl ? 'rtl' : 'ltr' });
  const cache = isRtl ? cacheRtl : cacheLtr;

  useEffect(() => {
    if (open) {
      setForm(initialValues ? { ...defaultForm, ...initialValues } : { ...defaultForm });
      setErrors({});
    }
  }, [open, initialValues]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = t('ShiftPage.Errors.NameRequired', 'Name is required');
    if (!form.date) errs.date = t('ShiftPage.Errors.DateRequired', 'Date is required');
    if (!form.startTime) errs.startTime = t('ShiftPage.Errors.StartRequired', 'Start time is required');
    if (!form.endTime) errs.endTime = t('ShiftPage.Errors.EndRequired', 'End time is required');
    if (form.startTime && form.endTime && form.startTime >= form.endTime) {
      errs.endTime = t('ShiftPage.Errors.EndAfterStart', 'End time must be after start time');
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(form);
  };

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={muiTheme}>
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ backgroundColor: '#0d4264', color: 'white' }}>
        {title || t('ShiftPage.NewShift', 'New Shift')}
      </DialogTitle>
      <DialogContent sx={{ pt: 2, mt: 1 }}>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <TextField
              label={t('ShiftPage.ShiftName', 'Shift Name')}
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
              error={!!errors.name}
              helperText={errors.name}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label={t('ShiftPage.Date', 'Date')}
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!errors.date}
              helperText={errors.date}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label={t('ShiftPage.StartTime', 'Start Time')}
              name="startTime"
              type="time"
              value={form.startTime}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!errors.startTime}
              helperText={errors.startTime}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label={t('ShiftPage.EndTime', 'End Time')}
              name="endTime"
              type="time"
              value={form.endTime}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!errors.endTime}
              helperText={errors.endTime}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              select
              label={t('ShiftPage.Color', 'Color')}
              name="color"
              value={form.color}
              onChange={handleChange}
              fullWidth
            >
              {SHIFT_COLORS.map((c) => (
                <MenuItem key={c.value} value={c.value}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      backgroundColor: c.value,
                      [isRtl ? 'marginLeft' : 'marginRight']: 8,
                      verticalAlign: 'middle',
                    }}
                  />
                  {c.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label={t('ShiftPage.Notes', 'Notes')}
              name="notes"
              value={form.notes}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          {t('Cancel', 'Cancel')}
        </Button>
        <Button onClick={handleSave} variant="contained" sx={{ backgroundColor: '#0d4264' }}>
          {t('Save', 'Save')}
        </Button>
      </DialogActions>
        </Dialog>
      </ThemeProvider>
    </CacheProvider>
  );
}
