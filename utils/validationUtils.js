// =============================================================================
// utils/validationUtils.js
// Centralised form validation. All functions return { valid, error }.
// =============================================================================

/** Validate Add / Edit Course form. */
export function validateCourse(name, attended, total) {
  if (!name || name.trim() === "") {
    return { valid: false, error: "Course name cannot be empty." };
  }

  const attendedNum = parseInt(attended, 10);
  const totalNum    = parseInt(total, 10);

  if (String(attended).trim() === "" || isNaN(attendedNum)) {
    return { valid: false, error: "Attended classes must be a valid number." };
  }
  if (String(total).trim() === "" || isNaN(totalNum)) {
    return { valid: false, error: "Total classes must be a valid number." };
  }
  if (attendedNum < 0) {
    return { valid: false, error: "Attended classes cannot be negative." };
  }
  if (totalNum <= 0) {
    return { valid: false, error: "Total classes must be greater than zero." };
  }
  if (attendedNum > totalNum) {
    return { valid: false, error: "Attended classes cannot exceed total classes." };
  }

  return { valid: true, error: null };
}

/** Validate Add Assignment form. */
export function validateAssignment(title, courseName, dueDate) {
  if (!title || title.trim() === "") {
    return { valid: false, error: "Assignment title cannot be empty." };
  }
  if (!courseName || courseName.trim() === "") {
    return { valid: false, error: "Please select a course." };
  }
  if (!dueDate || dueDate.trim() === "") {
    return { valid: false, error: "Please select a due date." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    return { valid: false, error: "Invalid date format. Please use the date picker." };
  }
  return { valid: true, error: null };
}

/** Validate Recovery Calculator inputs. */
export function validateRecovery(targetPercentage, futureMissed) {
  const target = parseFloat(targetPercentage);
  const missed  = parseInt(futureMissed, 10);

  if (String(targetPercentage).trim() === "" || isNaN(target)) {
    return { valid: false, error: "Target percentage must be a valid number." };
  }
  if (target < 0 || target > 100) {
    return { valid: false, error: "Target must be between 0 and 100." };
  }
  if (String(futureMissed).trim() === "" || isNaN(missed)) {
    return { valid: false, error: "Future missed classes must be a valid number." };
  }
  if (missed < 0) {
    return { valid: false, error: "Future missed classes cannot be negative." };
  }

  return { valid: true, error: null };
}
