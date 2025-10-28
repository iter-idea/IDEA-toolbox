/**
 * Offset in minutes for the given zone at the given instant (default: now).
 */
export const getTzOffsetMinutes = (zone: string, date = new Date()): number => {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  const parts = Object.fromEntries(dtf.formatToParts(date).map(p => [p.type, p.value]));
  const y = Number(parts.year);
  const m = Number(parts.month);
  const d = Number(parts.day);
  const hh = Number(parts.hour);
  const mm = Number(parts.minute);
  const ss = Number(parts.second);
  // timestamp if the zone's wall time were UTC
  const asUTC = Date.UTC(y, m - 1, d, hh, mm, ss);
  // difference to the real instant gives the zone's UTC offset
  return Math.round((asUTC - date.getTime()) / 60000); // e.g. 120 for UTC+02:00
};

/**
 * Offset expressed as a string such as "+0200" for the given zone at the given instant (default: now).
 */
export const getTzOffsetMinutesString = (zone: string, date = new Date()): string => {
  const minutes = getTzOffsetMinutes(zone, date);
  const sign = minutes >= 0 ? '+' : '-';
  const abs = Math.abs(minutes);
  const h = String(Math.trunc(abs / 60)).padStart(2, '0');
  const m = String(abs % 60).padStart(2, '0');
  return `${sign}${h}${m}`;
};
