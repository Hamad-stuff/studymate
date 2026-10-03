// =============================================================================
// screens/DashboardScreen.js
// Academic command center. ALL values derived from props — nothing hardcoded.
// Phase 5 chart safety: guards against empty arrays, single-value pie,
// and NaN/Infinity in chart data.
// =============================================================================

import React, { useMemo } from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions } from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";

import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from "../theme/theme";
import SummaryCard from "../components/SummaryCard";
import ChartCard   from "../components/ChartCard";
import WarningCard from "../components/WarningCard";
import EmptyState  from "../components/EmptyState";

import {
  calculateAttendance,
  calculateOverallAttendance,
  getAttendanceStatus,
  getCoursesBelow,
} from "../utils/attendanceUtils";
import {
  getAssignmentStatus,
  getUpcomingAssignments,
  countByStatus,
} from "../utils/assignmentUtils";
import { getGreeting, formatDateShort, getDaysUntil } from "../utils/dateUtils";

const SCREEN_WIDTH = Dimensions.get("window").width;

const CHART_CONFIG = {
  backgroundColor:        COLORS.card,
  backgroundGradientFrom: COLORS.card,
  backgroundGradientTo:   COLORS.card,
  decimalPlaces:          0,
  color:      (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
  propsForBackgroundLines: { strokeDasharray: "", stroke: COLORS.border, strokeWidth: 1 },
  propsForLabels:          { fontSize: 10 },
};

export default function DashboardScreen({ courses, assignments, attendanceThreshold }) {
  // ── All derived values use useMemo ────────────────────────────
  const overallAttendance = useMemo(() => calculateOverallAttendance(courses), [courses]);
  const statusCounts      = useMemo(() => countByStatus(assignments), [assignments]);
  const coursesBelow      = useMemo(() => getCoursesBelow(courses, attendanceThreshold), [courses, attendanceThreshold]);
  const upcomingAssignments = useMemo(() => getUpcomingAssignments(assignments, 7), [assignments]);

  // ── Bar chart — Phase 5 safety ────────────────────────────────
  // Guard: courses must be non-empty AND each value must be a finite number.
  const barChartData = useMemo(() => {
    if (courses.length === 0) return null;
    const values = courses.map((c) => {
      const pct = calculateAttendance(c.attendedClasses, c.totalClasses);
      // Ensure value is finite and non-NaN — chart-kit crashes on bad values
      return isFinite(pct) && !isNaN(pct) ? parseFloat(pct.toFixed(1)) : 0;
    });
    // Guard: all values zero is valid (empty semester) but chart still renders
    return {
      labels: courses.map((c) => {
        const words = c.name.split(" ");
        return words.length > 1
          ? words.map((w) => w[0]).join("").toUpperCase()
          : c.name.substring(0, 4);
      }),
      datasets: [{ data: values }],
    };
  }, [courses]);

  // ── Pie chart — Phase 5 safety ────────────────────────────────
  // Guard: react-native-chart-kit PieChart requires at least one segment
  // with a positive count. Never pass count: 0 to PieChart.
  const pieChartData = useMemo(() => {
    if (assignments.length === 0) return null;
    const segments = [];
    if (statusCounts.completed > 0)
      segments.push({ name: "Completed", count: statusCounts.completed, color: COLORS.success, legendFontColor: COLORS.text, legendFontSize: 13 });
    if (statusCounts.pending > 0)
      segments.push({ name: "Pending",   count: statusCounts.pending,   color: COLORS.warning, legendFontColor: COLORS.text, legendFontSize: 13 });
    if (statusCounts.overdue > 0)
      segments.push({ name: "Overdue",   count: statusCounts.overdue,   color: COLORS.error,   legendFontColor: COLORS.text, legendFontSize: 13 });
    // If somehow all counts are zero after assignments.length > 0, return null
    return segments.length > 0 ? segments : null;
  }, [assignments, statusCounts]);

  // ── Dynamic warnings ──────────────────────────────────────────
  const warnings = useMemo(() => {
    const result = [];
    coursesBelow.forEach((course) => {
      const pct    = calculateAttendance(course.attendedClasses, course.totalClasses);
      const status = getAttendanceStatus(pct, attendanceThreshold);
      result.push({
        id:      `att-${course.id}`,
        type:    status === "high-risk" ? "error" : "warning",
        title:   status === "high-risk" ? "High Risk — Attendance Critical" : "Attendance Alert",
        message: `${course.name} is at ${pct.toFixed(1)}%, below your ${attendanceThreshold}% target.`,
      });
    });
    assignments.filter((a) => getAssignmentStatus(a) === "overdue").forEach((a) => {
      const days = Math.abs(getDaysUntil(a.dueDate));
      result.push({
        id:      `overdue-${a.id}`,
        type:    "error",
        title:   "Overdue Assignment",
        message: `"${a.title}" was due ${days} day${days === 1 ? "" : "s"} ago (${a.courseName}).`,
      });
    });
    upcomingAssignments.filter((a) => { const d = getDaysUntil(a.dueDate); return d !== null && d <= 3; }).forEach((a) => {
      const days    = getDaysUntil(a.dueDate);
      const dayText = days === 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`;
      result.push({
        id:      `deadline-${a.id}`,
        type:    "warning",
        title:   "Upcoming Deadline",
        message: `"${a.title}" is due ${dayText} (${a.courseName}).`,
      });
    });
    if (result.length === 0) {
      result.push({ id: "all-good", type: "success", title: "You're on track", message: "No urgent academic issues detected. Keep up the great work!" });
    }
    return result;
  }, [coursesBelow, assignments, upcomingAssignments, attendanceThreshold]);

  const attendanceColor =
    overallAttendance >= attendanceThreshold ? COLORS.success
    : overallAttendance >= attendanceThreshold - 10 ? COLORS.warning
    : COLORS.error;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Greeting */}
      <View style={styles.greetingSection}>
        <Text style={styles.greeting}>{getGreeting()}, Student 👋</Text>
        <Text style={styles.greetingSub}>Your academic overview</Text>
      </View>

      {/* Summary Row 1 */}
      <View style={styles.cardRow}>
        <SummaryCard title="Courses" value={String(courses.length)} subtitle="enrolled" accentColor={COLORS.indigo} />
        <SummaryCard
          title="Attendance"
          value={courses.length > 0 ? `${overallAttendance.toFixed(1)}%` : "N/A"}
          subtitle={courses.length > 0 ? `Target: ${attendanceThreshold}%` : "No courses"}
          accentColor={courses.length > 0 ? attendanceColor : COLORS.secondaryText}
        />
      </View>

      {/* Summary Row 2 */}
      <View style={[styles.cardRow, { marginTop: SPACING.sm }]}>
        <SummaryCard
          title="Pending"
          value={String(statusCounts.pending + statusCounts.overdue)}
          subtitle={statusCounts.overdue > 0 ? `${statusCounts.overdue} overdue` : "assignments"}
          accentColor={statusCounts.overdue > 0 ? COLORS.error : COLORS.warning}
        />
        <SummaryCard title="Completed" value={String(statusCounts.completed)} subtitle="assignments" accentColor={COLORS.success} />
      </View>

      {/* Warnings */}
      <SectionHeader title="Academic Alerts" />
      {warnings.map((w) => <WarningCard key={w.id} type={w.type} title={w.title} message={w.message} />)}

      {/* Bar Chart */}
      <SectionHeader title="Attendance by Course" subtitle="Per-course breakdown" />
      <ChartCard title="Attendance Overview" subtitle={`Target: ${attendanceThreshold}%`}>
        {barChartData === null ? (
          <EmptyState icon="📊" title="No attendance data yet" subtitle="Add a course to see your attendance chart." />
        ) : (
          <BarChart
            data={barChartData}
            width={SCREEN_WIDTH - SPACING.xl * 2}
            height={210}
            chartConfig={CHART_CONFIG}
            fromZero
            showValuesOnTopOfBars
            withInnerLines
            yAxisSuffix="%"
            segments={5}
            style={styles.chart}
          />
        )}
      </ChartCard>

      {/* Pie Chart */}
      <SectionHeader title="Assignment Progress" subtitle="Status breakdown" />
      <ChartCard
        title="Assignment Status"
        subtitle={`${assignments.length} total assignment${assignments.length !== 1 ? "s" : ""}`}
      >
        {pieChartData === null ? (
          <EmptyState icon="📝" title="No assignment data yet" subtitle="Add assignments to track your progress." />
        ) : (
          <>
            <PieChart
              data={pieChartData}
              width={SCREEN_WIDTH - SPACING.xl * 2}
              height={180}
              chartConfig={CHART_CONFIG}
              accessor="count"
              backgroundColor="transparent"
              paddingLeft="16"
              absolute
              style={styles.chart}
            />
            <View style={styles.pieLegend}>
              {pieChartData.map((item) => (
                <View key={item.name} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <Text style={styles.legendText}>{item.name}: {item.count}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ChartCard>

      {/* Upcoming Assignments */}
      <SectionHeader title="Upcoming This Week" subtitle="Due within 7 days" />
      {upcomingAssignments.length === 0 ? (
        <EmptyState icon="🗓️" title="No upcoming deadlines" subtitle="Assignments due within 7 days will appear here." />
      ) : (
        <View style={styles.listCard}>
          {upcomingAssignments.map((a, i) => (
            <UpcomingRow key={a.id} assignment={a} isLast={i === upcomingAssignments.length - 1} />
          ))}
        </View>
      )}

      {/* At-Risk Courses */}
      {coursesBelow.length > 0 && (
        <>
          <SectionHeader title="Courses Needing Attention" subtitle={`Below ${attendanceThreshold}% threshold`} />
          <View style={styles.listCard}>
            {coursesBelow.map((course, i) => {
              const pct    = calculateAttendance(course.attendedClasses, course.totalClasses);
              const status = getAttendanceStatus(pct, attendanceThreshold);
              const color  = status === "high-risk" ? COLORS.error : COLORS.warning;
              return <AtRiskRow key={course.id} course={course} pct={pct} color={color} isLast={i === coursesBelow.length - 1} />;
            })}
          </View>
        </>
      )}

      <View style={{ height: SPACING.xxxl }} />
    </ScrollView>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSub}>{subtitle}</Text> : null}
    </View>
  );
}

function UpcomingRow({ assignment, isLast }) {
  const days    = getDaysUntil(assignment.dueDate);
  const dayText = days === 0 ? "Due today" : days === 1 ? "Due tomorrow" : `Due in ${days}d`;
  const color   = days <= 1 ? COLORS.error : days <= 3 ? COLORS.warning : COLORS.indigo;
  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowTitle} numberOfLines={1}>{assignment.title}</Text>
        <Text style={styles.rowSub}>{assignment.courseName}</Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.rowDate}>{formatDateShort(assignment.dueDate)}</Text>
        <Text style={[styles.rowDays, { color }]}>{dayText}</Text>
      </View>
    </View>
  );
}

function AtRiskRow({ course, pct, color, isLast }) {
  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowTitle}>{course.name}</Text>
        <Text style={styles.rowSub}>{course.attendedClasses}/{course.totalClasses} classes attended</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: color + "20" }]}>
        <Text style={[styles.badgeText, { color }]}>{pct.toFixed(1)}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:        { flex: 1, backgroundColor: COLORS.background },
  content:       { padding: SPACING.xl, paddingTop: SPACING.lg },
  greetingSection: { marginBottom: SPACING.xl, paddingTop: SPACING.sm },
  greeting:      { fontSize: FONTS.xlarge, fontWeight: "700", color: COLORS.text },
  greetingSub:   { fontSize: FONTS.body, color: COLORS.secondaryText, marginTop: SPACING.xs },
  cardRow:       { flexDirection: "row", marginHorizontal: -SPACING.xs },
  sectionHeader: { marginTop: SPACING.xl, marginBottom: SPACING.md },
  sectionTitle:  { fontSize: FONTS.medium, fontWeight: "700", color: COLORS.text },
  sectionSub:    { fontSize: FONTS.small, color: COLORS.secondaryText, marginTop: 2 },
  chart:         { borderRadius: 0, marginBottom: SPACING.sm },
  pieLegend:     { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", paddingHorizontal: SPACING.xl, paddingBottom: SPACING.lg, gap: SPACING.lg },
  legendItem:    { flexDirection: "row", alignItems: "center" },
  legendDot:     { width: 10, height: 10, borderRadius: 5, marginRight: SPACING.xs },
  legendText:    { fontSize: FONTS.small, color: COLORS.text, fontWeight: "500" },
  listCard:      { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, overflow: "hidden", ...SHADOW },
  row:           { flexDirection: "row", alignItems: "center", paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg },
  rowBorder:     { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  rowLeft:       { flex: 1, marginRight: SPACING.md },
  rowTitle:      { fontSize: FONTS.body, fontWeight: "600", color: COLORS.text },
  rowSub:        { fontSize: FONTS.small, color: COLORS.secondaryText, marginTop: 2 },
  rowRight:      { alignItems: "flex-end" },
  rowDate:       { fontSize: FONTS.small, fontWeight: "600", color: COLORS.text },
  rowDays:       { fontSize: FONTS.small, fontWeight: "500", marginTop: 2 },
  badge:         { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full },
  badgeText:     { fontSize: FONTS.body, fontWeight: "700" },
});
