/**
 * Date/time formatting. Formatting is pinned to a fixed locale + timezone so the
 * server-rendered output matches the client (no hydration mismatch) and reads
 * consistently for the club's audience.
 */
const LOCALE = "en-IN";
const TIME_ZONE = "Asia/Kolkata";

export function formatEventDate(date: Date): string {
  return new Intl.DateTimeFormat(LOCALE, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: TIME_ZONE,
  }).format(date);
}

export function formatEventTime(date: Date): string {
  return new Intl.DateTimeFormat(LOCALE, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: TIME_ZONE,
  }).format(date);
}

/** "Sat, 27 Sep 2026 · 5:00 PM – 7:00 PM" (end optional). */
export function formatEventWhen(start: Date, end?: Date | null): string {
  const date = formatEventDate(start);
  const startTime = formatEventTime(start);
  if (!end) return `${date} · ${startTime}`;

  const sameDay = start.toDateString() === end.toDateString();
  if (sameDay) return `${date} · ${startTime} – ${formatEventTime(end)}`;
  return `${date} ${startTime} – ${formatEventDate(end)} ${formatEventTime(end)}`;
}

export function formatMonthYear(date: Date): string {
  return new Intl.DateTimeFormat(LOCALE, {
    month: "long",
    year: "numeric",
    timeZone: TIME_ZONE,
  }).format(date);
}

/** Split day-of-month and short month for compact date chips. */
export function dateChip(date: Date): { day: string; month: string } {
  return {
    day: new Intl.DateTimeFormat(LOCALE, {
      day: "2-digit",
      timeZone: TIME_ZONE,
    }).format(date),
    month: new Intl.DateTimeFormat(LOCALE, {
      month: "short",
      timeZone: TIME_ZONE,
    })
      .format(date)
      .toUpperCase(),
  };
}
