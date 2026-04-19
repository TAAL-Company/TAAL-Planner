export const LABEL_W       = 168;  // px — resource name column width
export const HOUR_W        = 52;   // px per hour — wide enough for "HH:00" label
export const COLUMN_W      = 24 * HOUR_W; // px per full day = 1248px (every hour visible)
export const ROW_H         = 60;   // px — height per resource row
export const HEADER_H      = 38;   // px — day-label row height
export const TIME_HEADER_H = 26;   // px — hour-label sub-row height
export const VISIBLE_DAYS  = 7;
export const MS_PER_DAY    = 86_400_000;
export const MS_PER_HOUR   = 3_600_000;

// Every hour 0–23
export const HOUR_TICKS = Array.from({ length: 24 }, (_, i) => i);

export const MONTH = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export const DAYS  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
