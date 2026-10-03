// =============================================================================
// utils/recoveryUtils.js
// Recovery calculator — determines how many future classes a student
// must attend to reach a target attendance percentage.
//
// Formula derivation:
//   We want: (A + x) / (T + x + m) >= R
//   Solving for x: x >= [R(T + m) - A] / (1 - R)
//   where:
//     A = current attended classes
//     T = current total classes held
//     x = future classes student must attend (what we solve for)
//     m = future classes student expects to miss
//     R = target percentage as decimal (e.g. 0.75 for 75%)
// =============================================================================

/**
 * Calculate required future classes to reach target attendance.
 *
 * @param {number} attended         - Currently attended classes
 * @param {number} total            - Current total classes held
 * @param {number} targetPercentage - Desired attendance % (0–100)
 * @param {number} futureMissed     - Future classes student plans to miss
 *
 * @returns {{ status, message, requiredClasses?, currentPercentage? }}
 *   status: "already-achieved" | "recovery-needed" | "impossible" | "invalid"
 */
export function calculateRequiredClasses(
  attended,
  total,
  targetPercentage,
  futureMissed
) {
  // ── Validate inputs ───────────────────────────────────────────
  if (targetPercentage < 0 || targetPercentage > 100) {
    return {
      status:  "invalid",
      message: "Target percentage must be between 0 and 100.",
    };
  }

  if (futureMissed < 0) {
    return {
      status:  "invalid",
      message: "Future missed classes cannot be negative.",
    };
  }

  // ── Special case: 100% target ─────────────────────────────────
  // Mathematically produces Infinity — handle explicitly.
  if (targetPercentage === 100) {
    return {
      status:  "impossible",
      message:
        "Reaching 100% attendance is not calculable — it would require attending every class forever with no absences.",
    };
  }

  const R          = targetPercentage / 100;
  const currentPct = total > 0 ? (attended / total) * 100 : 0;

  // ── Already at or above target ────────────────────────────────
  if (currentPct >= targetPercentage) {
    return {
      status:            "already-achieved",
      message:           `You are already at ${currentPct.toFixed(1)}%, which meets your ${targetPercentage}% target. No recovery needed.`,
      requiredClasses:   0,
      currentPercentage: parseFloat(currentPct.toFixed(1)),
    };
  }

  // ── Core formula: x >= [R(T + m) - A] / (1 - R) ─────────────
  const denominator = 1 - R;

  // denominator <= 0 means target >= 100%, already handled above
  if (denominator <= 0) {
    return {
      status:  "impossible",
      message: "Cannot calculate for this target. Please use a value below 100%.",
    };
  }

  const numerator = R * (total + futureMissed) - attended;

  if (numerator <= 0) {
    // Student already meets target even accounting for future misses
    return {
      status:            "already-achieved",
      message:           `You are already meeting your ${targetPercentage}% target.`,
      requiredClasses:   0,
      currentPercentage: parseFloat(currentPct.toFixed(1)),
    };
  }

  // Round UP — a student cannot attend a fraction of a class
  const requiredClasses = Math.ceil(numerator / denominator);

  return {
    status:            "recovery-needed",
    message:           `You need to attend ${requiredClasses} consecutive future class${requiredClasses === 1 ? "" : "es"} to reach ${targetPercentage}%.`,
    requiredClasses,
    targetPercentage,
    futureMissed,
    currentPercentage: parseFloat(currentPct.toFixed(1)),
  };
}
