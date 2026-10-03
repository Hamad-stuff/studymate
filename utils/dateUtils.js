// =============================================================================
// utils/dateUtils.js
// Date formatting and helper utilities. Pure functions — no side effects.
// =============================================================================

export const MONTHS = [
  "January","February","March","April",
  "May","June","July","August",
  "September","October","November","December",
];

export const MONTHS_SHORT = [
  "Jan","Feb","Mar","Apr",
  "May","Jun","Jul","Aug",
  "Sep","Oct","Nov","Dec",
];

/** "2026-09-25" → "25 September 2026" */
export function formatDateLong(dateStr) {
  if (!dateStr) return "No date";
  const [year, month, day] = dateStr.split("-");
  return `${parseInt(day)} ${MONTHS[parseInt(month) - 1]} ${year}`;
}

/** "2026-09-25" → "25 Sep" */
export function formatDateShort(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${parseInt(day)} ${MONTHS_SHORT[parseInt(month) - 1]}`;
}

/**
 * Days from today until dueDate.
 * Returns negative number for past dates.
 * Returns 0 if due today.
 */
export function getDaysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);
  return Math.round((due - today) / (1000 * 60 * 60 * 24));
}

/** Time-of-day greeting string based on current hour. */
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/** Years from current year up to current + 3 for date picker. */
export function getYearOptions() {
  const current = new Date().getFullYear();
  return [current, current + 1, current + 2, current + 3];
}

/**
 * Number of days in a given month/year.
 * month is 1-indexed (January = 1).
 */
export function getDaysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

/** Today as YYYY-MM-DD — used as default value in date picker. */
export function getTodayDateString() {
  const d   = new Date();
  const y   = d.getFullYear();
  const m   = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
