// =============================================================================
// screens/AttendanceScreen.js
// Complete attendance management. Phase 3 implementation — unchanged.
// =============================================================================

import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, Modal, Pressable } from "react-native";

import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from "../theme/theme";
import PrimaryButton from "../components/PrimaryButton";
import FormInput     from "../components/FormInput";
import EmptyState    from "../components/EmptyState";

import {
  calculateAttendance,
  getAttendanceStatus,
  getAttendanceLabel,
  getAttendanceColor,
} from "../utils/attendanceUtils";
import { validateCourse } from "../utils/validationUtils";

function generateId() {
  return `course-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

const BLANK_FORM = { name: "", attended: "", total: "" };

export default function AttendanceScreen({ courses, setCourses, attendanceThreshold }) {
  const [addModalVisible,    setAddModalVisible]    = useState(false);
  const [editModalVisible,   setEditModalVisible]   = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [form,               setForm]               = useState(BLANK_FORM);
  const [formError,          setFormError]          = useState(null);
  const [selectedCourse,     setSelectedCourse]     = useState(null);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
  };
  const resetForm = () => { setForm(BLANK_FORM); setFormError(null); };

  const openAddModal = () => { resetForm(); setAddModalVisible(true); };

  const handleAddCourse = () => {
    const { valid, error } = validateCourse(form.name, form.attended, form.total);
    if (!valid) { setFormError(error); return; }
    setCourses((prev) => [...prev, {
      id: generateId(), name: form.name.trim(),
      attendedClasses: parseInt(form.attended, 10),
      totalClasses:    parseInt(form.total, 10),
    }]);
    setAddModalVisible(false);
    resetForm();
  };

  const openEditModal = (course) => {
    setSelectedCourse(course);
    setForm({ name: course.name, attended: String(course.attendedClasses), total: String(course.totalClasses) });
    setFormError(null);
    setEditModalVisible(true);
  };

  const handleEditCourse = () => {
    const { valid, error } = validateCourse(form.name, form.attended, form.total);
    if (!valid) { setFormError(error); return; }
    setCourses((prev) => prev.map((c) =>
      c.id === selectedCourse.id
        ? { ...c, name: form.name.trim(), attendedClasses: parseInt(form.attended, 10), totalClasses: parseInt(form.total, 10) }
        : c
    ));
    setEditModalVisible(false);
    resetForm();
    setSelectedCourse(null);
  };

  const openDeleteModal  = (course) => { setSelectedCourse(course); setDeleteModalVisible(true); };
  const handleDeleteCourse = () => {
    setCourses((prev) => prev.filter((c) => c.id !== selectedCourse.id));
    setDeleteModalVisible(false);
    setSelectedCourse(null);
  };

  const handleAttended = (courseId) => {
    setCourses((prev) => prev.map((c) =>
      c.id === courseId ? { ...c, attendedClasses: c.attendedClasses + 1, totalClasses: c.totalClasses + 1 } : c
    ));
  };

  const handleMissed = (courseId) => {
    setCourses((prev) => prev.map((c) =>
      c.id === courseId ? { ...c, totalClasses: c.totalClasses + 1 } : c
    ));
  };

  return (
    <View style={styles.screen}>
      <View style={styles.screenHeader}>
        <View>
          <Text style={styles.screenTitle}>Attendance</Text>
          <Text style={styles.screenSub}>{courses.length} course{courses.length !== 1 ? "s" : ""} · Target: {attendanceThreshold}%</Text>
        </View>
        <PrimaryButton title="+ Add Course" onPress={openAddModal} style={styles.addBtn} />
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {courses.length === 0 ? (
          <EmptyState icon="📋" title="No courses yet" subtitle="Add your first course to start tracking attendance." />
        ) : (
          courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              threshold={attendanceThreshold}
              onAttended={() => handleAttended(course.id)}
              onMissed={()   => handleMissed(course.id)}
              onEdit={()     => openEditModal(course)}
              onDelete={()   => openDeleteModal(course)}
            />
          ))
        )}
        <View style={{ height: SPACING.xxxl }} />
      </ScrollView>

      <CourseFormModal visible={addModalVisible}  title="Add Course"   form={form} formError={formError} onUpdateField={updateField} onSubmit={handleAddCourse}  onCancel={() => { setAddModalVisible(false);  resetForm(); }} submitLabel="Add Course"    />
      <CourseFormModal visible={editModalVisible} title="Edit Course"  form={form} formError={formError} onUpdateField={updateField} onSubmit={handleEditCourse} onCancel={() => { setEditModalVisible(false); resetForm(); }} submitLabel="Save Changes"  />
      <ConfirmDeleteModal visible={deleteModalVisible} courseName={selectedCourse?.name} onConfirm={handleDeleteCourse} onCancel={() => { setDeleteModalVisible(false); setSelectedCourse(null); }} />
    </View>
  );
}

function CourseCard({ course, threshold, onAttended, onMissed, onEdit, onDelete }) {
  const pct    = calculateAttendance(course.attendedClasses, course.totalClasses);
  const status = getAttendanceStatus(pct, threshold);
  const label  = getAttendanceLabel(status);
  const color  = getAttendanceColor(status);

  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.header}>
        <Text style={cardStyles.name} numberOfLines={2}>{course.name}</Text>
        <View style={[cardStyles.badge, { backgroundColor: color + "20" }]}>
          <Text style={[cardStyles.badgeText, { color }]}>{label}</Text>
        </View>
      </View>
      <View style={cardStyles.statsRow}>
        <Text style={[cardStyles.percentage, { color }]}>{pct.toFixed(1)}%</Text>
        <Text style={cardStyles.classCount}>{course.attendedClasses} / {course.totalClasses} classes</Text>
      </View>
      <View style={cardStyles.progressTrack}>
        <View style={[cardStyles.progressFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: color }]} />
        <View style={[cardStyles.thresholdLine, { left: `${threshold}%` }]} />
      </View>
      <View style={cardStyles.progressLabels}>
        <Text style={cardStyles.progressLabelText}>0%</Text>
        <Text style={[cardStyles.thresholdLabel, { left: `${threshold - 8}%` }]}>{threshold}%</Text>
        <Text style={cardStyles.progressLabelText}>100%</Text>
      </View>
      <View style={cardStyles.quickActions}>
        <QuickActionButton label="✓ Attended" onPress={onAttended} color={COLORS.success} />
        <QuickActionButton label="✗ Missed"   onPress={onMissed}   color={COLORS.error}   />
      </View>
      <View style={cardStyles.management}>
        <ManagementButton label="Edit"   onPress={onEdit}   variant="outline" />
        <ManagementButton label="Delete" onPress={onDelete} variant="danger"  />
      </View>
    </View>
  );
}

function QuickActionButton({ label, onPress, color }) {
  return (
    <Pressable
      style={({ pressed }) => [cardStyles.quickBtn, { borderColor: color, backgroundColor: pressed ? color + "15" : color + "10" }]}
      onPress={onPress} accessibilityRole="button" accessibilityLabel={label}
    >
      <Text style={[cardStyles.quickBtnText, { color }]}>{label}</Text>
    </Pressable>
  );
}

function ManagementButton({ label, onPress, variant }) {
  const isDelete = variant === "danger";
  return (
    <Pressable
      style={({ pressed }) => [
        cardStyles.mgmtBtn,
        isDelete
          ? { backgroundColor: pressed ? COLORS.error : "#FFF1F2", borderColor: COLORS.error }
          : { backgroundColor: pressed ? COLORS.background : COLORS.card, borderColor: COLORS.border },
      ]}
      onPress={onPress} accessibilityRole="button" accessibilityLabel={label}
    >
      <Text style={[cardStyles.mgmtBtnText, { color: isDelete ? COLORS.error : COLORS.text }]}>{label}</Text>
    </Pressable>
  );
}

function CourseFormModal({ visible, title, form, formError, onUpdateField, onSubmit, onCancel, submitLabel }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>{title}</Text>
            <Pressable onPress={onCancel} style={modalStyles.closeBtn}><Text style={modalStyles.closeText}>✕</Text></Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <FormInput label="Course Name"         value={form.name}     onChangeText={(v) => onUpdateField("name", v)}     placeholder="e.g. Cloud Computing" maxLength={60} />
            <FormInput label="Classes Attended"    value={form.attended} onChangeText={(v) => onUpdateField("attended", v)} placeholder="e.g. 14" keyboardType="numeric" />
            <FormInput label="Total Classes Held"  value={form.total}    onChangeText={(v) => onUpdateField("total", v)}    placeholder="e.g. 20" keyboardType="numeric" />
            {formError ? <View style={modalStyles.errorBox}><Text style={modalStyles.errorText}>⚠ {formError}</Text></View> : null}
            {form.attended && form.total && !isNaN(parseInt(form.attended)) && !isNaN(parseInt(form.total)) && parseInt(form.total) > 0 ? (
              <View style={modalStyles.preview}>
                <Text style={modalStyles.previewLabel}>Preview</Text>
                <Text style={modalStyles.previewValue}>{calculateAttendance(parseInt(form.attended), parseInt(form.total)).toFixed(1)}% attendance</Text>
              </View>
            ) : null}
            <View style={modalStyles.actions}>
              <PrimaryButton title="Cancel" onPress={onCancel} variant="outline" style={modalStyles.actionBtn} />
              <PrimaryButton title={submitLabel} onPress={onSubmit} style={modalStyles.actionBtn} />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function ConfirmDeleteModal({ visible, courseName, onConfirm, onCancel }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={modalStyles.overlay}>
        <View style={[modalStyles.sheet, modalStyles.confirmSheet]}>
          <Text style={modalStyles.confirmIcon}>🗑️</Text>
          <Text style={modalStyles.title}>Delete Course?</Text>
          <Text style={modalStyles.confirmMessage}>
            Are you sure you want to delete{" "}
            <Text style={{ fontWeight: "700" }}>{courseName}</Text>?{"\n"}This action cannot be undone.
          </Text>
          <View style={modalStyles.actions}>
            <PrimaryButton title="Cancel" onPress={onCancel} variant="outline" style={modalStyles.actionBtn} />
            <PrimaryButton title="Delete" onPress={onConfirm} variant="danger" style={modalStyles.actionBtn} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: COLORS.background },
  screenHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg, backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  screenTitle:  { fontSize: FONTS.large, fontWeight: "700", color: COLORS.text },
  screenSub:    { fontSize: FONTS.small, color: COLORS.secondaryText, marginTop: 2 },
  addBtn:       { paddingHorizontal: SPACING.lg, minHeight: 40 },
  list:         { flex: 1 },
  listContent:  { padding: SPACING.xl },
});

const cardStyles = StyleSheet.create({
  card:              { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.xl, marginBottom: SPACING.lg, ...SHADOW },
  header:            { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: SPACING.md },
  name:              { fontSize: FONTS.medium, fontWeight: "700", color: COLORS.text, flex: 1, marginRight: SPACING.sm },
  badge:             { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full },
  badgeText:         { fontSize: FONTS.small, fontWeight: "700" },
  statsRow:          { flexDirection: "row", alignItems: "baseline", marginBottom: SPACING.md },
  percentage:        { fontSize: FONTS.xlarge, fontWeight: "700", marginRight: SPACING.sm },
  classCount:        { fontSize: FONTS.body, color: COLORS.secondaryText },
  progressTrack:     { height: 8, backgroundColor: COLORS.border, borderRadius: RADIUS.full, overflow: "visible", position: "relative", marginBottom: 4 },
  progressFill:      { height: "100%", borderRadius: RADIUS.full },
  thresholdLine:     { position: "absolute", top: -4, width: 2, height: 16, backgroundColor: COLORS.navy, borderRadius: 1 },
  progressLabels:    { flexDirection: "row", justifyContent: "space-between", marginBottom: SPACING.lg, position: "relative" },
  progressLabelText: { fontSize: 10, color: COLORS.secondaryText },
  thresholdLabel:    { position: "absolute", fontSize: 10, color: COLORS.navy, fontWeight: "600" },
  quickActions:      { flexDirection: "row", gap: SPACING.md, marginBottom: SPACING.md },
  quickBtn:          { flex: 1, paddingVertical: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1.5, alignItems: "center" },
  quickBtnText:      { fontSize: FONTS.body, fontWeight: "700" },
  management:        { flexDirection: "row", gap: SPACING.md },
  mgmtBtn:           { flex: 1, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, borderWidth: 1, alignItems: "center" },
  mgmtBtnText:       { fontSize: FONTS.body, fontWeight: "600" },
});

const modalStyles = StyleSheet.create({
  overlay:        { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet:          { backgroundColor: COLORS.card, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, padding: SPACING.xl, paddingBottom: SPACING.xxxl, maxHeight: "90%" },
  confirmSheet:   { alignItems: "center", paddingTop: SPACING.xxl },
  header:         { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: SPACING.xl },
  title:          { fontSize: FONTS.large, fontWeight: "700", color: COLORS.text, marginBottom: SPACING.sm },
  closeBtn:       { padding: SPACING.sm },
  closeText:      { fontSize: FONTS.large, color: COLORS.secondaryText },
  errorBox:       { backgroundColor: "#FFF1F2", borderRadius: RADIUS.sm, padding: SPACING.md, marginBottom: SPACING.lg, borderLeftWidth: 3, borderLeftColor: COLORS.error },
  errorText:      { fontSize: FONTS.body, color: COLORS.error, fontWeight: "600" },
  preview:        { backgroundColor: "#EEF2FF", borderRadius: RADIUS.sm, padding: SPACING.md, marginBottom: SPACING.lg, alignItems: "center" },
  previewLabel:   { fontSize: FONTS.small, color: COLORS.indigo, fontWeight: "600" },
  previewValue:   { fontSize: FONTS.large, color: COLORS.indigo, fontWeight: "700", marginTop: 2 },
  confirmIcon:    { fontSize: 44, marginBottom: SPACING.lg },
  confirmMessage: { fontSize: FONTS.body, color: COLORS.secondaryText, textAlign: "center", lineHeight: 22, marginBottom: SPACING.xl },
  actions:        { flexDirection: "row", gap: SPACING.md, marginTop: SPACING.lg },
  actionBtn:      { flex: 1 },
});
