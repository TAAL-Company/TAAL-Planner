export function midnight(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function addDays(date, n) {
  const d = new Date(date); d.setDate(d.getDate() + n); return d;
}

export function parseShiftDates(shift) {
  const base = shift.date || '';
  let start  = new Date(`${base}T${shift.startTime || '00:00'}:00`);
  let end    = new Date(`${base}T${shift.endTime   || '01:00'}:00`);
  if (isNaN(start)) start = new Date();
  if (isNaN(end) || end <= start) {
    // overnight
    end = new Date(`${base}T${shift.endTime}:00`);
    end.setDate(end.getDate() + 1);
  }
  return { start, end };
}

/**
 * Normalise whatever comes in as `events` or `shifts` into the internal format:
 *   { id, title, startMs, endMs, userId, shift, assignment }
 */
export function buildRows(sourceShifts, users) {
  const rows = {}; // userId → events[]

  sourceShifts.forEach((shift) => {
    const { start, end } = parseShiftDates(shift);

    (shift.assignments || []).forEach((a) => {
      if (!rows[a.userId]) rows[a.userId] = [];
      rows[a.userId].push({
        id:         `${shift.id}-${a.userId}`,
        title:      shift.name,
        startMs:    start.getTime(),
        endMs:      end.getTime(),
        shift,
        assignment: a,
      });
    });
  });

  return rows;
}

/* Normalise EventTimeline-style objects (from eventsProp) into shift-like objects */
export function normalisePropEvents(events) {
  return events.map((ev) => ({
    id:          ev.id,
    name:        ev.title,
    date:        typeof ev.start === 'string' ? ev.start.slice(0, 10) : '',
    startTime:   typeof ev.start === 'string' ? ev.start.slice(11, 16) : '00:00',
    endTime:     typeof ev.end   === 'string' ? ev.end.slice(11, 16)   : '01:00',
    color:       ev.color || '#1976d2',
    assignments: ev.resource
      ? [{ userId: ev.resource, routeIds: [] }]
      : [],
  }));
}
