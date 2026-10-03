// =============================================================================
// screens/RecoveryScreen.js
// Attendance Recovery Calculator.
//
// Purpose: Tell students how many consecutive future classes they must attend
// to reach a desired attendance target.
//
// Formula: x >= [R(T + m) - A] / (1 - R)
//   A = attended, T = total, m = future missed, R = target as decimal
//
// All calculation logic is in utils/recoveryUtils.js.
// This screen handles: course selection, input, validation, display of result.
// =============================================================================

import React, { useState, useMemo } from "react";
import {
  View, Text, ScrollView, StyleSheet,
  Modal, Pressable,
} from "react-native";

import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from "../theme/theme";
import PrimaryButton from "../components/PrimaryButton";
import FormInput     from "../components/FormInput";
import EmptyState    from "../components/EmptyState";

import { calculateRequiredClasses } from "../utils/recoveryUtils";
import { calculateAttendance }      from "../utils/attendanceUtils";
import { validateRecovery }         from "../utils/validationUtils";

export default function RecoveryScreen({ courses }) {
  // ── Input state ───────────────────────────────────────────────
  const [selectedCourseId,  setSelectedCourseId]  = useState(null);
  const [targetPercentage,  setTargetPercentage]  = useState("75");
  const [futureMissed,      setFutureMissed]      = useState("0");
  const [coursePickerOpen,  setCoursePickerOpen]  = useState(false);

  // ── Validation / result state ─────────────────────────────────
  const [validationError, setValidationError] = useState(null);
  const [result,          setResult]          = useState(null);

  // ── Derived: selected course object ──────────────────────────
  // Uses Array.find() — demonstrates JS array method
  const selectedCourse = useMemo(
    () => courses.find((c) => c.id === selectedCourseId) || null,
    [courses, selectedCourseId]
  );

  // ── Current attendance of selected course (live preview) ──────
  const currentPct = useMemo(() => {
    if (!selectedCourse) return null;
    return calculateAttendance(selectedCourse.attendedClasses, selectedCourse.totalClasses);
  }, [selectedCourse]);

  // ── Handlers ──────────────────────────────────────────────────
  const handleSelectCourse = (courseId) => {
    setSelectedCourseId(courseId);
    setCoursePickerOpen(false);
    // Clear previous result when course changes
    setResult(null);
    setValidationError(null);
  };

  const handleCalculate = () => {
    setValidationError(null);
    setResult(null);

    // Validate course selection
    if (!selectedCourse) {
      setValidationError("Please select a course first.");
      return;
    }

    // Validate numeric inputs
    const { valid, error } = validateRecovery(targetPercentage, futureMissed);
    if (!valid) {
      setValidationError(error);
      return;
    }

    // Run the calculation
    const calcResult = calculateRequiredClasses(
      selectedCourse.attendedClasses,
      selectedCourse.totalClasses,
      parseFloat(targetPercentage),
      parseInt(futureMissed, 10)
    );

    setResult(calcResult);
  };

  const handleReset = () => {
    setSelectedCourseId(null);
    setTargetPercentage("75");
    setFutureMissed("0");
    setValidationError(null);
    setResult(null);
  };

  // ── Result card config ────────────────────────────────────────
  const getResultConfig = () => {
    if (!result) return null;
    switch (result.status) {
      case "already-achieved":
        return { type: "success", icon: "🎉", color: COLORS.success, bg: "#F0FDF4", borderColor: COLORS.success };
      case "recovery-needed":
        return { type: "info",    icon: "📈", color: COLORS.indigo,  bg: "#EEF2FF", borderColor: COLORS.indigo  };
      case "impossible":
        return { type: "error",   icon: "⚠️", color: COLORS.error,   bg: "#FFF1F2", borderColor: COLORS.error   };
      case "invalid":
        return { type: "error",   icon: "❌", color: COLORS.error,   bg: "#FFF1F2", borderColor: COLORS.error   };
      default:
        return null;
    }
  };

  const resultConfig = getResultConfig();

  // ── No courses state ──────────────────────────────────────────
  if (courses.length === 0) {
    return (
      <View style={styles.screen}>
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>Recovery Calculator</Text>
          <Text style={styles.screenSub}>Attendance target planner</Text>
        </View>
        <EmptyState
          icon="🔄"
          title="No courses available"
          subtitle="Add courses in the Attendance section first, then return here to calculate recovery."
        />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Screen Header */}
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Recovery Calculator</Text>
        <Text style={styles.screenSub}>Plan your attendance recovery</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Explainer card */}
        <View style={styles.explainerCard}>
          <Text style={styles.explainerIcon}>💡</Text>
          <View style={styles.explainerContent}>
            <Text style={styles.explainerTitle}>How it works</Text>
            <Text style={styles.explainerText}>
              Select a course, set your attendance target, and specify how many future classes you expect to miss. The calculator tells you exactly how many classes you must attend to reach your goal.
            </Text>
          </View>
        </View>

        {/* ── Step 1: Course Selection ── */}
        <View style={styles.stepCard}>
          <View style={styles.stepHeader}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>1</Text>
            </View>
            <Text style={styles.stepTitle}>Select Course</Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.courseTrigger,
              !selectedCourse && styles.courseTriggerEmpty,
              pressed && styles.courseTriggerPressed,
            ]}
            onPress={() => setCoursePickerOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Select a course"
          >
            {selectedCourse ? (
              <View style={styles.selectedCourseContent}>
                <Text style={styles.selectedCourseName}>{selectedCourse.name}</Text>
                <Text style={styles.selectedCourseDetail}>
                  {selectedCourse.attendedClasses}/{selectedCourse.totalClasses} classes
                  attended · {currentPct !== null ? currentPct.toFixed(1) : "0"}%
                </Text>
              </View>
            ) : (
              <Text style={styles.coursePlaceholder}>Tap to select a course…</Text>
            )}
            <Text style={styles.chevron}>▼</Text>
          </Pressable>

          {/* Live attendance bar for selected course */}
          {selectedCourse && currentPct !== null && (
            <View style={styles.attendancePreview}>
              <View style={styles.attendanceBar}>
                <View
                  style={[
                    styles.attendanceFill,
                    {
                      width: `${Math.min(currentPct, 100)}%`,
                      backgroundColor:
                        currentPct >= 75 ? COLORS.success
                        : currentPct >= 65 ? COLORS.warning
                        : COLORS.error,
                    },
                  ]}
                />
              </View>
              <Text style={styles.attendanceBarLabel}>Current: {currentPct.toFixed(1)}%</Text>
            </View>
          )}
        </View>

        {/* ── Step 2: Target Percentage ── */}
        <View style={styles.stepCard}>
          <View style={styles.stepHeader}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>2</Text>
            </View>
            <Text style={styles.stepTitle}>Target Attendance %</Text>
          </View>

          <FormInput
            label=""
            value={targetPercentage}
            onChangeText={(v) => {
              setTargetPercentage(v);
              setValidationError(null);
              setResult(null);
            }}
            placeholder="e.g. 75"
            keyboardType="numeric"
          />

          {/* Quick preset buttons */}
          <View style={styles.presets}>
            {["75", "80", "85", "90"].map((preset) => (
              <Pressable
                key={preset}
                style={({ pressed }) => [
                  styles.presetBtn,
                  targetPercentage === preset && styles.presetBtnActive,
                  pressed && styles.presetBtnPressed,
                ]}
                onPress={() => {
                  setTargetPercentage(preset);
                  setValidationError(null);
                  setResult(null);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Set target to ${preset}%`}
              >
                <Text style={[styles.presetBtnText, targetPercentage === preset && styles.presetBtnTextActive]}>
                  {preset}%
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── Step 3: Future Missed Classes ── */}
        <View style={styles.stepCard}>
          <View style={styles.stepHeader}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>3</Text>
            </View>
            <Text style={styles.stepTitle}>Expected Future Absences</Text>
          </View>

          <FormInput
            label=""
            value={futureMissed}
            onChangeText={(v) => {
              setFutureMissed(v);
              setValidationError(null);
              setResult(null);
            }}
            placeholder="e.g. 0 (enter 0 if unsure)"
            keyboardType="numeric"
          />
          <Text style={styles.fieldHint}>
            How many future classes do you expect to miss? Enter 0 for the best-case scenario.
          </Text>
        </View>

        {/* Validation error */}
        {validationError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠ {validationError}</Text>
          </View>
        ) : null}

        {/* Calculate button */}
        <View style={styles.calcBtnRow}>
          <PrimaryButton
            title="Calculate Recovery"
            onPress={handleCalculate}
            style={styles.calcBtn}
          />
          {(result || selectedCourseId) && (
            <PrimaryButton
              title="Reset"
              onPress={handleReset}
              variant="outline"
              style={styles.resetBtn}
            />
          )}
        </View>

        {/* ── Result Card ── */}
        {result && resultConfig && (
          <View style={[styles.resultCard, { backgroundColor: resultConfig.bg, borderColor: resultConfig.borderColor }]}>
            <Text style={styles.resultIcon}>{resultConfig.icon}</Text>

            {result.status === "recovery-needed" ? (
              <>
                <Text style={[styles.resultNumber, { color: resultConfig.color }]}>
                  {result.requiredClasses}
                </Text>
                <Text style={[styles.resultNumberLabel, { color: resultConfig.color }]}>
                  consecutive class{result.requiredClasses === 1 ? "" : "es"} required
                </Text>
                <Text style={styles.resultDetail}>{result.message}</Text>

                {/* Summary breakdown */}
                <View style={styles.resultBreakdown}>
                  <BreakdownRow label="Current Attendance"  value={`${result.currentPercentage}%`} />
                  <BreakdownRow label="Target Attendance"   value={`${result.targetPercentage}%`} />
                  <BreakdownRow label="Expected Absences"   value={`${result.futureMissed} class${result.futureMissed === 1 ? "" : "es"}`} />
                  <BreakdownRow label="Classes to Attend"   value={`${result.requiredClasses}`} highlight />
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.resultMessage, { color: resultConfig.color }]}>
                  {result.message}
                </Text>
                {result.currentPercentage !== undefined && (
                  <View style={styles.resultBreakdown}>
                    <BreakdownRow label="Current Attendance" value={`${result.currentPercentage}%`} />
                  </View>
                )}
              </>
            )}
          </View>
        )}

        {/* Formula explanation */}
        <View style={styles.formulaCard}>
          <Text style={styles.formulaTitle}>📐 Formula Used</Text>
          <Text style={styles.formulaText}>
            {"(Attended + x) / (Total + x + Missed) ≥ Target\n\n"}
            {"Solving for x (classes needed):\n"}
            {"x ≥ [R × (Total + Missed) − Attended] / (1 − R)\n\n"}
            {"where R = Target / 100"}
          </Text>
        </View>

        <View style={{ height: SPACING.xxxl }} />
      </ScrollView>

      {/* Course Picker Modal */}
      <Modal
        visible={coursePickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setCoursePickerOpen(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.sheet}>
            <View style={modalStyles.header}>
              <Text style={modalStyles.title}>Select Course</Text>
              <Pressable onPress={() => setCoursePickerOpen(false)} style={modalStyles.closeBtn}>
                <Text style={modalStyles.closeText}>✕</Text>
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {courses.map((course) => {
                const pct       = calculateAttendance(course.attendedClasses, course.totalClasses);
                const isSelected = course.id === selectedCourseId;
                const pctColor  = pct >= 75 ? COLORS.success : pct >= 65 ? COLORS.warning : COLORS.error;
                return (
                  <Pressable
                    key={course.id}
                    style={({ pressed }) => [
                      modalStyles.courseOption,
                      isSelected && modalStyles.courseOptionSelected,
                      pressed && { opacity: 0.7 },
                    ]}
                    onPress={() => handleSelectCourse(course.id)}
                    accessibilityRole="menuitem"
                  >
                    <View style={modalStyles.courseOptionContent}>
                      <Text style={[modalStyles.courseOptionName, isSelected && modalStyles.courseOptionNameSelected]}>
                        {course.name}
                      </Text>
                      <Text style={modalStyles.courseOptionDetail}>
                        {course.attendedClasses}/{course.totalClasses} classes
                      </Text>
                    </View>
                    <Text style={[modalStyles.courseOptionPct, { color: pctColor }]}>
                      {pct.toFixed(1)}%
                    </Text>
                    {isSelected && <Text style={modalStyles.checkmark}>✓</Text>}
                  </Pressable>
                );
              })}
              <View style={{ height: SPACING.xl }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Small helper row for the result breakdown table
function BreakdownRow({ label, value, highlight }) {
  return (
    <View style={bStyles.row}>
      <Text style={bStyles.label}>{label}</Text>
      <Text style={[bStyles.value, highlight && bStyles.highlight]}>{value}</Text>
    </View>
  );
}

const bStyles = StyleSheet.create({
  row:       { flexDirection: "row", justifyContent: "space-between", paddingVertical: SPACING.xs },
  label:     { fontSize: FONTS.body, color: COLORS.secondaryText },
  value:     { fontSize: FONTS.body, fontWeight: "600", color: COLORS.text },
  highlight: { color: COLORS.indigo, fontSize: FONTS.medium, fontWeight: "700" },
});

const styles = StyleSheet.create({
  screen:        { flex: 1, backgroundColor: COLORS.background },
  screenHeader:  { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg, backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  screenTitle:   { fontSize: FONTS.large, fontWeight: "700", color: COLORS.text },
  screenSub:     { fontSize: FONTS.small, color: COLORS.secondaryText, marginTop: 2 },
  scroll:        { flex: 1 },
  content:       { padding: SPACING.xl },

  // Explainer
  explainerCard: { flexDirection: "row", backgroundColor: "#EEF2FF", borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.xl, gap: SPACING.md },
  explainerIcon: { fontSize: 24 },
  explainerContent: { flex: 1 },
  explainerTitle:{ fontSize: FONTS.body, fontWeight: "700", color: COLORS.indigo, marginBottom: SPACING.xs },
  explainerText: { fontSize: FONTS.small, color: COLORS.text, lineHeight: 18 },

  // Step cards
  stepCard:      { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.xl, marginBottom: SPACING.lg, ...SHADOW },
  stepHeader:    { flexDirection: "row", alignItems: "center", marginBottom: SPACING.lg, gap: SPACING.md },
  stepBadge:     { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.indigo, alignItems: "center", justifyContent: "center" },
  stepBadgeText: { color: COLORS.card, fontSize: FONTS.small, fontWeight: "700" },
  stepTitle:     { fontSize: FONTS.medium, fontWeight: "700", color: COLORS.text },

  // Course trigger
  courseTrigger: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.background, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.sm, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, minHeight: 56 },
  courseTriggerEmpty:   { borderStyle: "dashed" },
  courseTriggerPressed: { opacity: 0.8 },
  selectedCourseContent:{ flex: 1 },
  selectedCourseName:   { fontSize: FONTS.medium, fontWeight: "700", color: COLORS.text },
  selectedCourseDetail: { fontSize: FONTS.small, color: COLORS.secondaryText, marginTop: 2 },
  coursePlaceholder:    { fontSize: FONTS.medium, color: COLORS.secondaryText, flex: 1 },
  chevron:              { color: COLORS.secondaryText, fontSize: FONTS.small, marginLeft: SPACING.sm },

  // Attendance preview bar
  attendancePreview: { marginTop: SPACING.md },
  attendanceBar:     { height: 6, backgroundColor: COLORS.border, borderRadius: RADIUS.full, overflow: "hidden", marginBottom: SPACING.xs },
  attendanceFill:    { height: "100%", borderRadius: RADIUS.full },
  attendanceBarLabel:{ fontSize: FONTS.small, color: COLORS.secondaryText },

  // Target presets
  presets:           { flexDirection: "row", gap: SPACING.sm, flexWrap: "wrap" },
  presetBtn:         { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, backgroundColor: COLORS.background, borderWidth: 1.5, borderColor: COLORS.border },
  presetBtnActive:   { backgroundColor: COLORS.indigo, borderColor: COLORS.indigo },
  presetBtnPressed:  { opacity: 0.7 },
  presetBtnText:     { fontSize: FONTS.body, fontWeight: "600", color: COLORS.secondaryText },
  presetBtnTextActive:{ color: COLORS.card },

  // Field hint
  fieldHint: { fontSize: FONTS.small, color: COLORS.secondaryText, marginTop: -SPACING.sm, marginBottom: SPACING.sm, lineHeight: 18 },

  // Error
  errorBox:  { backgroundColor: "#FFF1F2", borderRadius: RADIUS.sm, padding: SPACING.md, marginBottom: SPACING.lg, borderLeftWidth: 3, borderLeftColor: COLORS.error },
  errorText: { fontSize: FONTS.body, color: COLORS.error, fontWeight: "600" },

  // Calculate button row
  calcBtnRow: { flexDirection: "row", gap: SPACING.md, marginBottom: SPACING.xl },
  calcBtn:    { flex: 1 },
  resetBtn:   { flex: 0.45 },

  // Result card
  resultCard: { borderWidth: 2, borderRadius: RADIUS.lg, padding: SPACING.xl, marginBottom: SPACING.xl, alignItems: "center" },
  resultIcon: { fontSize: 44, marginBottom: SPACING.md },
  resultNumber:      { fontSize: 56, fontWeight: "700", lineHeight: 60 },
  resultNumberLabel: { fontSize: FONTS.medium, fontWeight: "600", marginBottom: SPACING.md },
  resultDetail:      { fontSize: FONTS.body, color: COLORS.secondaryText, textAlign: "center", lineHeight: 20, marginBottom: SPACING.lg },
  resultMessage:     { fontSize: FONTS.medium, fontWeight: "600", textAlign: "center", lineHeight: 22, marginBottom: SPACING.md },
  resultBreakdown:   { width: "100%", backgroundColor: "rgba(255,255,255,0.7)", borderRadius: RADIUS.md, padding: SPACING.lg },

  // Formula card
  formulaCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.xl, marginBottom: SPACING.lg, ...SHADOW },
  formulaTitle:{ fontSize: FONTS.medium, fontWeight: "700", color: COLORS.text, marginBottom: SPACING.md },
  formulaText: { fontSize: FONTS.small, color: COLORS.secondaryText, lineHeight: 20, fontFamily: "monospace" },
});

const modalStyles = StyleSheet.create({
  overlay:                  { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet:                    { backgroundColor: COLORS.card, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, padding: SPACING.xl, paddingBottom: SPACING.xxxl, maxHeight: "80%" },
  header:                   { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: SPACING.xl },
  title:                    { fontSize: FONTS.large, fontWeight: "700", color: COLORS.text },
  closeBtn:                 { padding: SPACING.sm },
  closeText:                { fontSize: FONTS.large, color: COLORS.secondaryText },
  courseOption:             { flexDirection: "row", alignItems: "center", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg, borderRadius: RADIUS.md, marginVertical: 2, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.sm },
  courseOptionSelected:     { backgroundColor: "#EEF2FF", borderColor: COLORS.indigo },
  courseOptionContent:      { flex: 1 },
  courseOptionName:         { fontSize: FONTS.medium, fontWeight: "600", color: COLORS.text },
  courseOptionNameSelected: { color: COLORS.indigo },
  courseOptionDetail:       { fontSize: FONTS.small, color: COLORS.secondaryText, marginTop: 2 },
  courseOptionPct:          { fontSize: FONTS.medium, fontWeight: "700", marginRight: SPACING.sm },
  checkmark:                { color: COLORS.indigo, fontSize: FONTS.large, fontWeight: "700" },
});
