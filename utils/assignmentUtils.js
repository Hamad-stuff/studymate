// =============================================================================
// utils/assignmentUtils.js
// All assignment helpers. Pure functions — no side effects.
// =============================================================================

/**
 * Generate a unique assignment ID.
 * Uses timestamp + random suffix to avoid collisions.
 */
export function generateAssignmentId() {
  return `assignment-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

/**
 * Today's date as YYYY-MM-DD string.
 * Used for overdue comparison — computed fresh each call.
 */
export function getTodayString() {
  const today = new Date();
  const y     = today.getFullYear();
  const m     = String(today.getMonth() + 1).padStart(2, "0");
  const d     = String(today.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * True if assignment is overdue:
 * dueDate < today AND not completed.
 */
export function isOverdue(assignment) {
  if (assignment.completed) return false;
  return assignment.dueDate < getTodayString();
}

/**
 * Canonical status string for one assignment.
 * Returns: "completed" | "overdue" | "pending"
 */
export function getAssignmentStatus(assignment) {
  if (assignment.completed)  return "completed";
  if (isOverdue(assignment)) return "overdue";
  return "pending";
}

/**
 * Filter assignments by status tab.
 * filter: "all" | "pending" | "completed" | "overdue"
 * Demonstrates Array.filter().
 */
export function filterAssignments(assignments, filter) {
  if (filter === "all") return assignments;
  return assignments.filter((a) => getAssignmentStatus(a) === filter);
}

/**
 * Sort assignments in student-priority order:
 * 1. Overdue  — most urgent
 * 2. Pending  — by due date, soonest first
 * 3. Completed — least urgent
 * Uses spread copy — does NOT mutate original array.
 */
export function sortAssignments(assignments) {
  const priority = { overdue: 0, pending: 1, completed: 2 };
  return [...assignments].sort((a, b) => {
    const pa = priority[getAssignmentStatus(a)];
    const pb = priority[getAssignmentStatus(b)];
    if (pa !== pb) return pa - pb;
    return a.dueDate.localeCompare(b.dueDate);
  });
}

/**
 * Return pending assignments due within `days` days from today.
 * Used on dashboard upcoming section.
 */
export function getUpcomingAssignments(assignments, days = 7) {
  const today     = getTodayString();
  const future    = new Date();
  future.setDate(future.getDate() + days);
  const futureStr = future.toISOString().split("T")[0];
  return assignments.filter(
    (a) => !a.completed && a.dueDate >= today && a.dueDate <= futureStr
  );
}

/**
 * Count assignments by status using reduce().
 * Returns { pending: n, completed: n, overdue: n }
 */
export function countByStatus(assignments) {
  return assignments.reduce(
    (counts, a) => {
      const s     = getAssignmentStatus(a);
      counts[s]   = (counts[s] || 0) + 1;
      return counts;
    },
    { pending: 0, completed: 0, overdue: 0 }
  );
}
