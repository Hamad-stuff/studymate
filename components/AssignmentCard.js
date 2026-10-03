// =============================================================================
// components/AssignmentCard.js
// Displays one assignment with status, dates, and action buttons.
// Pure props-driven component — no internal state.
// =============================================================================

import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from "../theme/theme";
import { getAssignmentStatus } from "../utils/assignmentUtils";
import { formatDateLong, getDaysUntil } from "../utils/dateUtils";

const STATUS_CONFIG = {
  completed: { label: "Completed", color: COLORS.success, bg: "#F0FDF4", icon: "✅" },
  pending:   { label: "Pending",   color: COLORS.warning, bg: "#FFFBEB", icon: "⏳" },
  overdue:   { label: "Overdue",   color: COLORS.error,   bg: "#FFF1F2", icon: "🚨" },
};

export default function AssignmentCard({ assignment, onToggleComplete, onDelete }) {
  const status = getAssignmentStatus(assignment);
  const config = STATUS_CONFIG[status];
  const days   = getDaysUntil(assignment.dueDate);

  const getDueDateContext = () => {
    if (assignment.completed) return "Completed";
    if (days === null)        return "";
    if (days < 0)   return `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`;
    if (days === 0) return "Due today";
    if (days === 1) return "Due tomorrow";
    return `Due in ${days} days`;
  };

  const dueDateContext = getDueDateContext();
  const contextColor   =
    assignment.completed ? COLORS.success
    : days !== null && days < 0  ? COLORS.error
    : days !== null && days <= 2 ? COLORS.warning
    : COLORS.secondaryText;

  return (
    <View style={[styles.card, { borderLeftColor: config.color, borderLeftWidth: 4 }]}>
      <View style={styles.topRow}>
        <Text style={[styles.title, assignment.completed && styles.titleCompleted]} numberOfLines={2}>
          {assignment.title}
        </Text>
        <View style={[styles.badge, { backgroundColor: config.color + "20" }]}>
          <Text style={styles.badgeIcon}>{config.icon}</Text>
          <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
        </View>
      </View>

      <Text style={styles.courseName}>📚 {assignment.courseName}</Text>

      <View style={styles.dateRow}>
        <Text style={styles.dueDate}>📅 {formatDateLong(assignment.dueDate)}</Text>
        {dueDateContext
          ? <Text style={[styles.dateContext, { color: contextColor }]}>{dueDateContext}</Text>
          : null}
      </View>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.actionBtn, styles.toggleBtn,
            {
              backgroundColor: pressed
                ? (assignment.completed ? COLORS.warning : COLORS.success) + "25"
                : (assignment.completed ? COLORS.warning : COLORS.success) + "15",
              borderColor: assignment.completed ? COLORS.warning : COLORS.success,
            },
          ]}
          onPress={onToggleComplete}
          accessibilityRole="button"
          accessibilityLabel={assignment.completed ? "Mark as Pending" : "Mark as Complete"}
        >
          <Text style={[styles.actionBtnText, { color: assignment.completed ? COLORS.warning : COLORS.success }]}>
            {assignment.completed ? "↩ Mark Pending" : "✓ Mark Complete"}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.actionBtn, styles.deleteBtn, { backgroundColor: pressed ? "#FFF1F2" : "transparent" }]}
          onPress={onDelete}
          accessibilityRole="button"
          accessibilityLabel="Delete assignment"
        >
          <Text style={styles.deleteBtnText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card:           { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, ...SHADOW },
  topRow:         { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: SPACING.sm, gap: SPACING.sm },
  title:          { fontSize: FONTS.medium, fontWeight: "700", color: COLORS.text, flex: 1, lineHeight: 22 },
  titleCompleted: { textDecorationLine: "line-through", color: COLORS.secondaryText },
  badge:          { flexDirection: "row", alignItems: "center", paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, borderRadius: RADIUS.full, gap: SPACING.xs },
  badgeIcon:      { fontSize: 11 },
  badgeText:      { fontSize: FONTS.small, fontWeight: "700" },
  courseName:     { fontSize: FONTS.body, color: COLORS.secondaryText, marginBottom: SPACING.xs },
  dateRow:        { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: SPACING.lg },
  dueDate:        { fontSize: FONTS.body, color: COLORS.text },
  dateContext:    { fontSize: FONTS.small, fontWeight: "600" },
  actions:        { flexDirection: "row", gap: SPACING.sm },
  actionBtn:      { flex: 1, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, alignItems: "center", borderWidth: 1.5, minHeight: 40, justifyContent: "center" },
  toggleBtn:      {},
  actionBtnText:  { fontSize: FONTS.body, fontWeight: "700" },
  deleteBtn:      { borderColor: COLORS.error, flex: 0.5 },
  deleteBtnText:  { fontSize: FONTS.body, fontWeight: "600", color: COLORS.error },
});
