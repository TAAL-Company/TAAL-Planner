export function getWeekDates(anchor) {
  const d = new Date(anchor);
  const start = new Date(d);
  start.setDate(d.getDate() - d.getDay()); // Sunday
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return date;
  });
}

export function toLocalDateString(date) {
  const y  = date.getFullYear();
  const m  = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}
