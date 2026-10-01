/**
 * Date/time helpers. The club operates in India (IST), so admin <input> values
 * are always interpreted and displayed as IST wall-clock regardless of where the
 * server runs — critical because Vercel runs in UTC, and a naive `new Date("…")`
 * on a timezone-less string would otherwise bind to the host's zone and shift
 * every event time by 5½ hours between what an admin types and what the public
 * site (which formats in IST below) shows.
 *
 * India observes no daylight saving, so IST is a fixed UTC+5:30 year-round. That
 * makes wall-clock ⇄ UTC conversion exact with a single constant — no timezone
 * database required. These helpers are isomorphic (pure Date math, no imports),
 * so they are safe in both client forms and server actions.
 */

const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;

/**
 * Format a Date as an IST wall-clock value for `<input type="datetime-local">`
 * (YYYY-MM-DDTHH:mm). Slice to 10 chars for a date-only `<input type="date">`.
 */
export function toDateTimeLocal(
  date: Date | string | null | undefined,
): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  // Shift the instant by +IST so reading its UTC components yields IST wall-clock.
  const ist = new Date(d.getTime() + IST_OFFSET_MS);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${ist.getUTCFullYear()}-${pad(ist.getUTCMonth() + 1)}-${pad(
    ist.getUTCDate(),
  )}T${pad(ist.getUTCHours())}:${pad(ist.getUTCMinutes())}`;
}

/**
 * Parse an `<input type="datetime-local">` / `<input type="date">` value — which
 * the admin enters as IST wall-clock — into the corresponding UTC Date. Returns
 * an invalid Date (NaN) for unparseable input so callers can reject it. Accepts
 * "YYYY-MM-DD", "YYYY-MM-DDTHH:mm", and an optional ":ss".
 */
export function fromDateTimeLocal(value: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?$/.exec(
    value.trim(),
  );
  if (!m) return new Date(NaN);
  const [, y, mo, da, h = "0", mi = "0", s = "0"] = m;
  // Treat the entered components as IST wall-clock, then subtract the offset to
  // get the true UTC instant.
  const asIfUtc = Date.UTC(+y, +mo - 1, +da, +h, +mi, +s);
  return new Date(asIfUtc - IST_OFFSET_MS);
}

/** Human-readable date + time for admin tables, pinned to IST. */
export function formatDateTime(
  date: Date | string | null | undefined,
): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
}

/** Human-readable date (no time), pinned to IST. */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    dateStyle: "medium",
    timeZone: "Asia/Kolkata",
  });
}
