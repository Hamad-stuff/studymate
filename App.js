// =============================================================================
// App.js — Root component. Single source of truth for all shared state.
//
// State:
//   courses             — array of course objects
//   assignments         — array of assignment objects
//   attendanceThreshold — user-defined target % (default 75)
//   currentView         — which screen is active
//
// View switching: pure conditional rendering — no navigation library.
// Data flows DOWN via props. Actions flow UP via callbacks.
// =============================================================================

import React, { useState } from "react";
import { View, StyleSheet } from "react-native";

import { COLORS } from "./theme/theme";
import initialCourses     from "./data/initialCourses";
import initialAssignments from "./data/initialAssignments";

import AppHeader         from "./components/AppHeader";
import DashboardScreen   from "./screens/DashboardScreen";
import AttendanceScreen  from "./screens/AttendanceScreen";
import AssignmentsScreen from "./screens/AssignmentsScreen";
import RecoveryScreen    from "./screens/RecoveryScreen";
import SettingsScreen    from "./screens/SettingsScreen";

export default function App() {
  // ── Primary application state ─────────────────────────────────
  const [courses,             setCourses]             = useState(initialCourses);
  const [assignments,         setAssignments]         = useState(initialAssignments);
  const [attendanceThreshold, setAttendanceThreshold] = useState(75);
  const [currentView,         setCurrentView]         = useState("dashboard");

  // ── Settings callbacks ────────────────────────────────────────

  /** Restore factory sample data — threshold also resets to 75 */
  const handleResetData = () => {
    setCourses(initialCourses);
    setAssignments(initialAssignments);
    setAttendanceThreshold(75);
  };

  /** Clear all data — demonstrates every empty state */
  const handleClearData = () => {
    setCourses([]);
    setAssignments([]);
  };

  // ── Screen renderer ───────────────────────────────────────────
  const renderScreen = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <DashboardScreen
            courses={courses}
            assignments={assignments}
            attendanceThreshold={attendanceThreshold}
          />
        );
      case "attendance":
        return (
          <AttendanceScreen
            courses={courses}
            setCourses={setCourses}
            attendanceThreshold={attendanceThreshold}
          />
        );
      case "assignments":
        return (
          <AssignmentsScreen
            assignments={assignments}
            setAssignments={setAssignments}
            courses={courses}
          />
        );
      case "recovery":
        return <RecoveryScreen courses={courses} />;
      case "settings":
        return (
          <SettingsScreen
            attendanceThreshold={attendanceThreshold}
            setAttendanceThreshold={setAttendanceThreshold}
            onResetData={handleResetData}
            onClearData={handleClearData}
            courses={courses}
            assignments={assignments}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.root}>
      <AppHeader currentView={currentView} onNavigate={setCurrentView} />
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
});
