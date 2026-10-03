// =============================================================================
// screens/AssignmentsScreen.js
// Complete Assignment Planner. Phase 4 implementation — unchanged.
// =============================================================================

import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, StyleSheet, Modal, Pressable } from "react-native";

import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from "../theme/theme";
import PrimaryButton   from "../components/PrimaryButton";
import FormInput       from "../components/FormInput";
import EmptyState      from "../components/EmptyState";
import AssignmentCard  from "../components/AssignmentCard";
import DatePickerField from "../components/DatePickerField";

import {
  filterAssignments, sortAssignments, countByStatus,
  generateAssignmentId, getAssignmentStatus,
} from "../utils/assignmentUtils";
import { validateAssignment } from "../utils/validationUtils";
import { getTodayDateString }  from "../utils/dateUtils";

const FILTER_TABS = [
  { key: "all",       label: "All"       },
  { key: "pending",   label: "Pending"   },
  { key: "completed", label: "Completed" },
  { key: "overdue",   label: "Overdue"   },
];

const BLANK_FORM = { title: "", courseName: "", dueDate: "" };

export default function AssignmentsScreen({ assignments, setAssignments, courses }) {
  const [activeFilter,       setActiveFilter]       = useState("all");
  const [addModalVisible,    setAddModalVisible]    = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [coursePickerVisible,setCoursePickerVisible]= useState(false);
  const [form,               setForm]               = useState(BLANK_FORM);
  const [formErrors,         setFormErrors]         = useState({});
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const displayedAssignments = useMemo(() => {
    const filtered = filterAssignments(assignments, activeFilter);
    return sortAssignments(filtered);
  }, [assignments, activeFilter]);

  const counts = useMemo(() => countByStatus(assignments), [assignments]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: null, general: null }));
  };
  const resetForm = () => { setForm(BLANK_FORM); setFormErrors({}); };

  const openAddModal = () => {
    resetForm();
    setForm({ title: "", courseName: "", dueDate: getTodayDateString() });
    setAddModalVisible(true);
  };

  const handleAddAssignment = () => {
    const { valid, error } = validateAssignment(form.title, form.courseName, form.dueDate);
    if (!valid) { setFormErrors({ general: error }); return; }
    setAssignments((prev) => [...prev, {
      id: generateAssignmentId(), title: form.title.trim(),
      courseName: form.courseName, dueDate: form.dueDate, completed: false,
    }]);
    setAddModalVisible(false);
    resetForm();
  };

  const handleToggleComplete = (id) => {
    setAssignments((prev) => prev.map((a) => a.id === id ? { ...a, completed: !a.completed } : a));
  };

  const openDeleteModal = (assignment) => { setSelectedAssignment(assignment); setDeleteModalVisible(true); };

  const handleDeleteAssignment = () => {
    setAssignments((prev) => prev.filter((a) => a.id !== selectedAssignment.id));
    setDeleteModalVisible(false);
    setSelectedAssignment(null);
  };

  const getEmptyStateProps = () => {
    switch (activeFilter) {
      case "pending":   return { icon: "✅", title: "No pending assignments",  subtitle: "All assignments are complete or none have been added yet." };
      case "completed": return { icon: "📝", title: "No completed assignments", subtitle: "Mark an assignment complete to see it here." };
      case "overdue":   return { icon: "🎉", title: "No overdue assignments",   subtitle: "You're on top of your deadlines. Great work!" };
      default:          return { icon: "📋", title: "No assignments yet",        subtitle: "Add your first assignment to start planning." };
    }
  };

  const emp = getEmptyStateProps();

  return (
    <View style={styles.screen}>
      <View style={styles.screenHeader}>
        <View>
          <Text style={styles.screenTitle}>Assignments</Text>
          <Text style={styles.screenSub}>{assignments.length} total · {counts.overdue > 0 ? `${counts.overdue} overdue` : `${counts.pending} pending`}</Text>
        </View>
        <PrimaryButton title="+ Add" onPress={openAddModal} style={styles.addBtn} />
      </View>

      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBarContent}>
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.key;
            const count    = tab.key === "all" ? assignments.length : counts[tab.key] || 0;
            return (
              <Pressable key={tab.key} style={[styles.tab, isActive && styles.tabActive]} onPress={() => setActiveFilter(tab.key)} accessibilityRole="tab">
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
                <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                  <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>{count}</Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {displayedAssignments.length === 0 ? (
          <EmptyState icon={emp.icon} title={emp.title} subtitle={emp.subtitle} />
        ) : (
          displayedAssignments.map((a) => (
            <AssignmentCard
              key={a.id}
              assignment={a}
              onToggleComplete={() => handleToggleComplete(a.id)}
              onDelete={() => openDeleteModal(a)}
            />
          ))
        )}
        <View style={{ height: SPACING.xxxl }} />
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={addModalVisible} transparent animationType="slide" onRequestClose={() => { setAddModalVisible(false); resetForm(); }}>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.sheet}>
            <View style={modalStyles.header}>
              <Text style={modalStyles.title}>Add Assignment</Text>
              <Pressable onPress={() => { setAddModalVisible(false); resetForm(); }} style={modalStyles.closeBtn}><Text style={modalStyles.closeText}>✕</Text></Pressable>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <FormInput label="Assignment Title" value={form.title} onChangeText={(v) => updateField("title", v)} placeholder="e.g. Cloud Computing Report" maxLength={100} />
              <View style={modalStyles.fieldContainer}>
                <Text style={modalStyles.fieldLabel}>Course</Text>
                <Pressable style={({ pressed }) => [modalStyles.courseTrigger, pressed && { opacity: 0.8 }]} onPress={() => setCoursePickerVisible(true)} accessibilityRole="button">
                  <Text style={[modalStyles.courseTriggerText, !form.courseName && modalStyles.placeholder]} numberOfLines={1}>{form.courseName || "Select a course…"}</Text>
                  <Text style={modalStyles.chevron}>▼</Text>
                </Pressable>
              </View>
              <DatePickerField label="Due Date" value={form.dueDate} onChange={(d) => updateField("dueDate", d)} error={formErrors.dueDate} />
              {formErrors.general ? <View style={modalStyles.errorBox}><Text style={modalStyles.errorText}>⚠ {formErrors.general}</Text></View> : null}
              <View style={modalStyles.actions}>
                <PrimaryButton title="Cancel" onPress={() => { setAddModalVisible(false); resetForm(); }} variant="outline" style={modalStyles.actionBtn} />
                <PrimaryButton title="Add Assignment" onPress={handleAddAssignment} style={modalStyles.actionBtn} />
              </View>
            </ScrollView>
          </View>
          {/* Course Picker nested modal */}
          <Modal visible={coursePickerVisible} transparent animationType="slide" onRequestClose={() => setCoursePickerVisible(false)}>
            <View style={modalStyles.overlay}>
              <View style={modalStyles.sheet}>
                <View style={modalStyles.header}>
                  <Text style={modalStyles.title}>Select Course</Text>
                  <Pressable onPress={() => setCoursePickerVisible(false)} style={modalStyles.closeBtn}><Text style={modalStyles.closeText}>✕</Text></Pressable>
                </View>
                {courses.length === 0 ? (
                  <View style={modalStyles.noCourses}>
                    <Text style={modalStyles.noCoursesIcon}>📋</Text>
                    <Text style={modalStyles.noCoursesText}>No courses added yet.{"\n"}Go to Attendance to add courses first.</Text>
                  </View>
                ) : (
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {courses.map((course) => (
                      <Pressable key={course.id} style={({ pressed }) => [modalStyles.courseOption, form.courseName === course.name && modalStyles.courseOptionSelected, pressed && { opacity: 0.7 }]}
                        onPress={() => { updateField("courseName", course.name); setCoursePickerVisible(false); }}>
                        <Text style={[modalStyles.courseOptionText, form.courseName === course.name && modalStyles.courseOptionTextSelected]}>{course.name}</Text>
                        {form.courseName === course.name && <Text style={modalStyles.checkmark}>✓</Text>}
                      </Pressable>
                    ))}
                    <View style={{ height: SPACING.xl }} />
                  </ScrollView>
                )}
              </View>
            </View>
          </Modal>
        </View>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal visible={deleteModalVisible} transparent animationType="fade" onRequestClose={() => { setDeleteModalVisible(false); setSelectedAssignment(null); }}>
        <View style={modalStyles.overlay}>
          <View style={[modalStyles.sheet, modalStyles.confirmSheet]}>
            <Text style={modalStyles.confirmIcon}>🗑️</Text>
            <Text style={modalStyles.confirmTitle}>Delete Assignment?</Text>
            <Text style={modalStyles.confirmMessage}>Are you sure you want to delete{"\n"}<Text style={{ fontWeight: "700" }}>"{selectedAssignment?.title}"</Text>?{"\n"}This action cannot be undone.</Text>
            <View style={modalStyles.actions}>
              <PrimaryButton title="Cancel" onPress={() => { setDeleteModalVisible(false); setSelectedAssignment(null); }} variant="outline" style={modalStyles.actionBtn} />
              <PrimaryButton title="Delete" onPress={handleDeleteAssignment} variant="danger" style={modalStyles.actionBtn} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:          { flex: 1, backgroundColor: COLORS.background },
  screenHeader:    { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg, backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  screenTitle:     { fontSize: FONTS.large, fontWeight: "700", color: COLORS.text },
  screenSub:       { fontSize: FONTS.small, color: COLORS.secondaryText, marginTop: 2 },
  addBtn:          { paddingHorizontal: SPACING.lg, minHeight: 40 },
  tabBar:          { backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tabBarContent:   { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, gap: SPACING.sm },
  tab:             { flexDirection: "row", alignItems: "center", paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, backgroundColor: COLORS.background, gap: SPACING.xs, borderWidth: 1.5, borderColor: "transparent" },
  tabActive:       { backgroundColor: "#EEF2FF", borderColor: COLORS.indigo },
  tabLabel:        { fontSize: FONTS.body, color: COLORS.secondaryText, fontWeight: "600" },
  tabLabelActive:  { color: COLORS.indigo },
  tabBadge:        { backgroundColor: COLORS.border, borderRadius: RADIUS.full, paddingHorizontal: 7, paddingVertical: 1, minWidth: 22, alignItems: "center" },
  tabBadgeActive:  { backgroundColor: COLORS.indigo },
  tabBadgeText:    { fontSize: 11, color: COLORS.secondaryText, fontWeight: "700" },
  tabBadgeTextActive: { color: COLORS.card },
  list:            { flex: 1 },
  listContent:     { padding: SPACING.lg },
});

const modalStyles = StyleSheet.create({
  overlay:               { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet:                 { backgroundColor: COLORS.card, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, padding: SPACING.xl, paddingBottom: SPACING.xxxl, maxHeight: "92%" },
  confirmSheet:          { alignItems: "center", paddingTop: SPACING.xxl },
  header:                { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: SPACING.xl },
  title:                 { fontSize: FONTS.large, fontWeight: "700", color: COLORS.text },
  closeBtn:              { padding: SPACING.sm },
  closeText:             { fontSize: FONTS.large, color: COLORS.secondaryText },
  fieldContainer:        { marginBottom: SPACING.lg },
  fieldLabel:            { fontSize: FONTS.body, fontWeight: "600", color: COLORS.text, marginBottom: SPACING.sm },
  courseTrigger:         { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: COLORS.background, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.sm, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, minHeight: 48 },
  courseTriggerText:     { fontSize: FONTS.medium, color: COLORS.text, flex: 1 },
  placeholder:           { color: COLORS.secondaryText },
  chevron:               { color: COLORS.secondaryText, fontSize: FONTS.small },
  errorBox:              { backgroundColor: "#FFF1F2", borderRadius: RADIUS.sm, padding: SPACING.md, marginBottom: SPACING.lg, borderLeftWidth: 3, borderLeftColor: COLORS.error },
  errorText:             { fontSize: FONTS.body, color: COLORS.error, fontWeight: "600" },
  courseOption:          { flexDirection: "row", alignItems: "center", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg, borderRadius: RADIUS.md, marginVertical: 2, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.sm },
  courseOptionSelected:  { backgroundColor: "#EEF2FF", borderColor: COLORS.indigo },
  courseOptionText:      { fontSize: FONTS.medium, color: COLORS.text, flex: 1, fontWeight: "500" },
  courseOptionTextSelected: { color: COLORS.indigo, fontWeight: "700" },
  checkmark:             { color: COLORS.indigo, fontSize: FONTS.large, fontWeight: "700" },
  noCourses:             { alignItems: "center", paddingVertical: SPACING.xxxl },
  noCoursesIcon:         { fontSize: 40, marginBottom: SPACING.lg },
  noCoursesText:         { fontSize: FONTS.medium, color: COLORS.secondaryText, textAlign: "center", lineHeight: 24 },
  confirmIcon:           { fontSize: 44, marginBottom: SPACING.lg },
  confirmTitle:          { fontSize: FONTS.large, fontWeight: "700", color: COLORS.text, marginBottom: SPACING.md },
  confirmMessage:        { fontSize: FONTS.body, color: COLORS.secondaryText, textAlign: "center", lineHeight: 22, marginBottom: SPACING.xl },
  actions:               { flexDirection: "row", gap: SPACING.md, marginTop: SPACING.lg },
  actionBtn:             { flex: 1 },
});
