// =============================================================================
// screens/SettingsScreen.js
// Application settings — attendance threshold, data management.
//
// Features:
//   - Attendance threshold slider (preset buttons + manual input)
//   - Live preview of how threshold change affects warning counts
//   - Reset to demo data (with confirmation)
//   - Clear all data (with confirmation)
//   - About section
// =============================================================================

import React, { useState, useMemo } from "react";
import {
  View, Text, ScrollView, StyleSheet,
  Modal, Pressable,
} from "react-native";

import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from "../theme/theme";
import PrimaryButton from "../components/PrimaryButton";
import FormInput     from "../components/FormInput";

import { calculateAttendance, getCoursesBelow } from "../utils/attendanceUtils";

// Preset threshold values for quick selection
const THRESHOLD_PRESETS = [65, 70, 75, 80, 85, 90];

export default function SettingsScreen({
  attendanceThreshold,
  setAttendanceThreshold,
  onResetData,
  onClearData,
  courses,
  assignments,
}) {
  // ── Local state for threshold editing ─────────────────────────
  const [thresholdInput,   setThresholdInput]   = useState(String(attendanceThreshold));
  const [thresholdError,   setThresholdError]   = useState(null);

  // ── Confirmation modal state ──────────────────────────────────
  const [confirmModal, setConfirmModal] = useState(null);
  // confirmModal: null | "reset" | "clear"

  // ── Live preview: courses affected at current vs proposed threshold ──
  const proposedThreshold = useMemo(() => {
    const val = parseInt(thresholdInput, 10);
    return isNaN(val) ? attendanceThreshold : val;
  }, [thresholdInput, attendanceThreshold]);

  const coursesBelow = useMemo(
    () => getCoursesBelow(courses, attendanceThreshold),
    [courses, attendanceThreshold]
  );

  const coursesBelowProposed = useMemo(
    () => getCoursesBelow(courses, proposedThreshold),
    [courses, proposedThreshold]
  );

  // ── Apply threshold ───────────────────────────────────────────
  const handleApplyThreshold = () => {
    const val = parseInt(thresholdInput, 10);
    if (isNaN(val) || val < 0 || val > 100) {
      setThresholdError("Threshold must be a number between 0 and 100.");
      return;
    }
    setAttendanceThreshold(val);
    setThresholdError(null);
  };

  const handlePresetSelect = (preset) => {
    setThresholdInput(String(preset));
    setThresholdError(null);
    setAttendanceThreshold(preset);
  };

  // ── Confirm actions ───────────────────────────────────────────
  const handleConfirmAction = () => {
    if (confirmModal === "reset") {
      onResetData();
      setThresholdInput("75");
    } else if (confirmModal === "clear") {
      onClearData();
    }
    setConfirmModal(null);
  };

  return (
    <View style={styles.screen}>
      {/* Screen Header */}
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Settings</Text>
        <Text style={styles.screenSub}>Customise your StudyMate experience</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Attendance Threshold ── */}
        <SectionLabel title="Attendance Settings" icon="📋" />
        <View style={styles.settingCard}>
          <View style={styles.settingCardHeader}>
            <Text style={styles.settingTitle}>Attendance Threshold</Text>
            <View style={styles.currentValueBadge}>
              <Text style={styles.currentValueText}>{attendanceThreshold}%</Text>
            </View>
          </View>
          <Text style={styles.settingDescription}>
            Courses below this percentage will trigger warnings on your Dashboard. Changes take effect immediately across all screens.
          </Text>

          {/* Preset quick-select buttons */}
          <Text style={styles.presetsLabel}>Quick select</Text>
          <View style={styles.presets}>
            {THRESHOLD_PRESETS.map((preset) => (
              <Pressable
                key={preset}
                style={({ pressed }) => [
                  styles.presetBtn,
                  attendanceThreshold === preset && styles.presetBtnActive,
                  pressed && styles.presetBtnPressed,
                ]}
                onPress={() => handlePresetSelect(preset)}
                accessibilityRole="button"
                accessibilityLabel={`Set threshold to ${preset}%`}
              >
                <Text style={[styles.presetBtnText, attendanceThreshold === preset && styles.presetBtnTextActive]}>
                  {preset}%
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Manual input */}
          <Text style={styles.presetsLabel}>Or enter manually</Text>
          <View style={styles.thresholdInputRow}>
            <View style={styles.thresholdInputWrapper}>
              <FormInput
                label=""
                value={thresholdInput}
                onChangeText={(v) => {
                  setThresholdInput(v);
                  setThresholdError(null);
                }}
                placeholder="e.g. 75"
                keyboardType="numeric"
                error={thresholdError}
              />
            </View>
            <PrimaryButton
              title="Apply"
              onPress={handleApplyThreshold}
              style={styles.applyBtn}
            />
          </View>

          {/* Live impact preview */}
          {courses.length > 0 && (
            <View style={styles.impactPreview}>
              <Text style={styles.impactTitle}>Impact Preview</Text>
              <ImpactRow
                label="Current threshold"
                value={`${attendanceThreshold}%`}
                detail={`${coursesBelow.length} course${coursesBelow.length !== 1 ? "s" : ""} below target`}
                color={coursesBelow.length > 0 ? COLORS.warning : COLORS.success}
              />
              {proposedThreshold !== attendanceThreshold && !thresholdError && (
                <ImpactRow
                  label="Proposed threshold"
                  value={`${proposedThreshold}%`}
                  detail={`${coursesBelowProposed.length} course${coursesBelowProposed.length !== 1 ? "s" : ""} would be below target`}
                  color={coursesBelowProposed.length > 0 ? COLORS.warning : COLORS.success}
                  isProposed
                />
              )}
            </View>
          )}
        </View>

        {/* ── Data Overview ── */}
        <SectionLabel title="Current Data" icon="📊" />
        <View style={styles.settingCard}>
          <DataRow label="Courses"     value={String(courses.length)} />
          <DataRow label="Assignments" value={String(assignments.length)} />
          <DataRow label="Threshold"   value={`${attendanceThreshold}%`} />
        </View>

        {/* ── Data Management ── */}
        <SectionLabel title="Data Management" icon="🗂️" />

        <View style={styles.settingCard}>
          <View style={styles.actionItem}>
            <View style={styles.actionItemLeft}>
              <Text style={styles.actionTitle}>Reset Demo Data</Text>
              <Text style={styles.actionDesc}>
                Restore the original 5 sample courses and 7 sample assignments. Your threshold will also reset to 75%.
              </Text>
            </View>
          </View>
          <PrimaryButton
            title="🔄 Reset to Demo Data"
            onPress={() => setConfirmModal("reset")}
            variant="secondary"
            style={styles.actionBtn}
          />
        </View>

        <View style={styles.settingCard}>
          <View style={styles.actionItem}>
            <View style={styles.actionItemLeft}>
              <Text style={styles.actionTitle}>Clear All Data</Text>
              <Text style={styles.actionDesc}>
                Remove all courses and assignments. This demonstrates the empty state of the application. This action cannot be undone without resetting demo data.
              </Text>
            </View>
          </View>
          <PrimaryButton
            title="🗑️ Clear All Data"
            onPress={() => setConfirmModal("clear")}
            variant="danger"
            style={styles.actionBtn}
          />
        </View>

        {/* ── About ── */}
        <SectionLabel title="About" icon="ℹ️" />
        <View style={styles.settingCard}>
          <AboutRow label="Application"  value="StudyMate" />
          <AboutRow label="Version"      value="1.0.0" />
          <AboutRow label="Framework"    value="React Native + Expo" />
          <AboutRow label="Charts"       value="react-native-chart-kit" />
          <AboutRow label="Assignment"   value="SMD Assignment 1" />
          <AboutRow label="Purpose"      value="Academic attendance & assignment tracker" />
        </View>

        <View style={{ height: SPACING.xxxl }} />
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        visible={confirmModal !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmModal(null)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.sheet}>
            <Text style={modalStyles.icon}>
              {confirmModal === "reset" ? "🔄" : "🗑️"}
            </Text>
            <Text style={modalStyles.title}>
              {confirmModal === "reset" ? "Reset Demo Data?" : "Clear All Data?"}
            </Text>
            <Text style={modalStyles.message}>
              {confirmModal === "reset"
                ? "This will restore the original 5 sample courses and 7 sample assignments. Your current data will be replaced."
                : "This will permanently remove all courses and assignments. The application will show empty states until you add new data or reset to demo data."}
            </Text>
            <View style={modalStyles.actions}>
              <PrimaryButton
                title="Cancel"
                onPress={() => setConfirmModal(null)}
                variant="outline"
                style={modalStyles.actionBtn}
              />
              <PrimaryButton
                title={confirmModal === "reset" ? "Reset" : "Clear All"}
                onPress={handleConfirmAction}
                variant={confirmModal === "reset" ? "secondary" : "danger"}
                style={modalStyles.actionBtn}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ── Local sub-components ──────────────────────────────────────────────────────

function SectionLabel({ title, icon }) {
  return (
    <View style={styles.sectionLabel}>
      <Text style={styles.sectionIcon}>{icon}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function ImpactRow({ label, value, detail, color, isProposed }) {
  return (
    <View style={[styles.impactRow, isProposed && styles.impactRowProposed]}>
      <View style={styles.impactLeft}>
        <Text style={styles.impactLabel}>{label}</Text>
        <Text style={[styles.impactDetail, { color }]}>{detail}</Text>
      </View>
      <Text style={[styles.impactValue, { color }]}>{value}</Text>
    </View>
  );
}

function DataRow({ label, value }) {
  return (
    <View style={styles.dataRow}>
      <Text style={styles.dataLabel}>{label}</Text>
      <Text style={styles.dataValue}>{value}</Text>
    </View>
  );
}

function AboutRow({ label, value }) {
  return (
    <View style={styles.dataRow}>
      <Text style={styles.dataLabel}>{label}</Text>
      <Text style={styles.aboutValue}>{value}</Text>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen:        { flex: 1, backgroundColor: COLORS.background },
  screenHeader:  { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg, backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  screenTitle:   { fontSize: FONTS.large, fontWeight: "700", color: COLORS.text },
  screenSub:     { fontSize: FONTS.small, color: COLORS.secondaryText, marginTop: 2 },
  scroll:        { flex: 1 },
  content:       { padding: SPACING.xl },

  sectionLabel:  { flexDirection: "row", alignItems: "center", marginTop: SPACING.xl, marginBottom: SPACING.md, gap: SPACING.sm },
  sectionIcon:   { fontSize: 18 },
  sectionTitle:  { fontSize: FONTS.medium, fontWeight: "700", color: COLORS.text },

  settingCard:   { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.xl, marginBottom: SPACING.md, ...SHADOW },
  settingCardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: SPACING.sm },
  settingTitle:  { fontSize: FONTS.medium, fontWeight: "700", color: COLORS.text },
  settingDescription: { fontSize: FONTS.body, color: COLORS.secondaryText, lineHeight: 20, marginBottom: SPACING.lg },

  currentValueBadge: { backgroundColor: COLORS.indigo, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full },
  currentValueText:  { color: COLORS.card, fontSize: FONTS.medium, fontWeight: "700" },

  presetsLabel:  { fontSize: FONTS.small, fontWeight: "600", color: COLORS.secondaryText, marginBottom: SPACING.sm, textTransform: "uppercase", letterSpacing: 0.5 },
  presets:       { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm, marginBottom: SPACING.lg },
  presetBtn:     { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, backgroundColor: COLORS.background, borderWidth: 1.5, borderColor: COLORS.border },
  presetBtnActive:    { backgroundColor: COLORS.indigo, borderColor: COLORS.indigo },
  presetBtnPressed:   { opacity: 0.7 },
  presetBtnText:      { fontSize: FONTS.body, fontWeight: "600", color: COLORS.secondaryText },
  presetBtnTextActive:{ color: COLORS.card },

  thresholdInputRow:    { flexDirection: "row", alignItems: "flex-start", gap: SPACING.md },
  thresholdInputWrapper:{ flex: 1 },
  applyBtn:             { minHeight: 48, paddingHorizontal: SPACING.lg, marginTop: 0 },

  // Impact preview
  impactPreview:   { backgroundColor: COLORS.background, borderRadius: RADIUS.md, padding: SPACING.lg, marginTop: SPACING.sm },
  impactTitle:     { fontSize: FONTS.small, fontWeight: "700", color: COLORS.secondaryText, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: SPACING.sm },
  impactRow:       { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: SPACING.sm },
  impactRowProposed:{ borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: SPACING.sm, paddingTop: SPACING.sm },
  impactLeft:      { flex: 1 },
  impactLabel:     { fontSize: FONTS.body, color: COLORS.text, fontWeight: "600" },
  impactDetail:    { fontSize: FONTS.small, marginTop: 2 },
  impactValue:     { fontSize: FONTS.large, fontWeight: "700" },

  // Data rows
  dataRow:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  dataLabel:  { fontSize: FONTS.body, color: COLORS.secondaryText },
  dataValue:  { fontSize: FONTS.body, fontWeight: "700", color: COLORS.text },
  aboutValue: { fontSize: FONTS.body, fontWeight: "500", color: COLORS.indigo, maxWidth: "60%", textAlign: "right" },

  // Action items
  actionItem:     { marginBottom: SPACING.md },
  actionItemLeft: { flex: 1 },
  actionTitle:    { fontSize: FONTS.medium, fontWeight: "700", color: COLORS.text, marginBottom: SPACING.xs },
  actionDesc:     { fontSize: FONTS.body, color: COLORS.secondaryText, lineHeight: 20 },
  actionBtn:      { marginTop: SPACING.xs },
});

const modalStyles = StyleSheet.create({
  overlay:   { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", paddingHorizontal: SPACING.xl },
  sheet:     { backgroundColor: COLORS.card, borderRadius: RADIUS.xl, padding: SPACING.xxl, alignItems: "center" },
  icon:      { fontSize: 44, marginBottom: SPACING.lg },
  title:     { fontSize: FONTS.large, fontWeight: "700", color: COLORS.text, textAlign: "center", marginBottom: SPACING.md },
  message:   { fontSize: FONTS.body, color: COLORS.secondaryText, textAlign: "center", lineHeight: 22, marginBottom: SPACING.xl },
  actions:   { flexDirection: "row", gap: SPACING.md, width: "100%" },
  actionBtn: { flex: 1 },
});
