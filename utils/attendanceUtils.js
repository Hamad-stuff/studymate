// =============================================================================
// utils/attendanceUtils.js
// All attendance calculations. Pure functions — no side effects.
// Imported by Dashboard, Attendance, Recovery screens.
// =============================================================================

/**
 * Calculate attendance percentage for one course.
 * Returns 0 safely when total is 0 — prevents NaN / division by zero.
 * Caps at 100 for safety.
 */
export function calculateAttendance(attended, total) {
  if (!total || total === 0) return 0;
  return Math.min((attended / total) * 100, 100);
}

/**
 * Determine attendance status category based on percentage vs threshold.
 * Returns: "good" | "attention" | "high-risk"
 */
export function getAttendanceStatus(percentage, threshold) {
  if (percentage >= threshold)          return "good";
  if (percentage >= threshold - 10)     return "attention";
  return "high-risk";
}

/**
 * Human-readable label for an attendance status.
 * Used alongside color so meaning is accessible without color alone.
 */
export function getAttendanceLabel(status) {
  switch (status) {
    case "good":       return "Good";
    case "attention":  return "Attention Required";
    case "high-risk":  return "High Risk";
    default:           return "Unknown";
  }
}

/**
 * Color value associated with an attendance status.
 * Centralised so every screen uses the exact same color per status.
 */
export function getAttendanceColor(status) {
  switch (status) {
    case "good":       return "#16A34A"; // COLORS.success
    case "attention":  return "#D97706"; // COLORS.warning
    case "high-risk":  return "#DC2626"; // COLORS.error
    default:           return "#64748B"; // COLORS.secondaryText
  }
}

/**
 * Calculate OVERALL attendance across ALL courses combined.
 * Sums attended and total separately — gives true overall %, not average of %.
 */
export function calculateOverallAttendance(courses) {
  if (!courses || courses.length === 0) return 0;
  const totalAttended = courses.reduce((sum, c) => sum + c.attendedClasses, 0);
  const totalClasses  = courses.reduce((sum, c) => sum + c.totalClasses, 0);
  return calculateAttendance(totalAttended, totalClasses);
}

/**
 * Return courses whose attendance is below the threshold.
 * Used for dashboard warnings and at-risk section.
 */
export function getCoursesBelow(courses, threshold) {
  return courses.filter((course) => {
    const pct = calculateAttendance(course.attendedClasses, course.totalClasses);
    return pct < threshold;
  });
}
