export function getDateString(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function getPreviousHourRange(now = new Date()) {
  const prev = new Date(now.getTime() - 60 * 60 * 1000);
  const date = getDateString(prev);
  const hour = prev.getHours();
  const hourStart = hour.toString().padStart(2, '0');
  const hourEnd = (hour + 1).toString().padStart(2, '0');
  return { date, hourRange: `${hourStart}-${hourEnd}` };
}
