export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const TEMPLATE_STORAGE_KEY = 'taal_shift_templates';

export const DEFAULT_TEMPLATES = [
  { id: 'tpl-morning',   name: 'Morning Shift',  startTime: '08:00', endTime: '16:00', color: '#1976d2', emoji: '🌅' },
  { id: 'tpl-afternoon', name: 'Afternoon Shift', startTime: '14:00', endTime: '22:00', color: '#388e3c', emoji: '☀️' },
  { id: 'tpl-night',     name: 'Night Shift',     startTime: '22:00', endTime: '06:00', color: '#7b1fa2', emoji: '🌙' },
  { id: 'tpl-split',     name: 'Split Shift',     startTime: '07:00', endTime: '19:00', color: '#f57c00', emoji: '⚡' },
  { id: 'tpl-half',      name: 'Half Day',         startTime: '09:00', endTime: '13:00', color: '#00796b', emoji: '🌤' },
];

export const COLOR_OPTIONS = [
  '#1976d2', '#388e3c', '#7b1fa2', '#f57c00', '#00796b',
  '#c62828', '#0097a7', '#5d4037', '#e91e63', '#546e7a',
];
