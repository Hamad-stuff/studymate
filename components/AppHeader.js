// =============================================================================
// components/AppHeader.js
// Top navigation header with app branding and dropdown view selector.
// No navigation library — pure useState + Modal + conditional rendering.
// =============================================================================

import React, { useState } from "react";
import {
  View, Text, Pressable, Modal,
  StyleSheet, SafeAreaView, StatusBar,
} from "react-native";
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from "../theme/theme";

const NAV_ITEMS = [
  { key: "dashboard",   label: "Dashboard",          icon: "📊" },
  { key: "attendance",  label: "Attendance",          icon: "📋" },
  { key: "assignments", label: "Assignments",         icon: "📝" },
  { key: "recovery",    label: "Recovery Calculator", icon: "🔄" },
  { key: "settings",    label: "Settings",            icon: "⚙️"  },
];

export default function AppHeader({ currentView, onNavigate }) {
  const [open, setOpen] = useState(false);
  const active = NAV_ITEMS.find((item) => item.key === currentView);

  const handleSelect = (key) => {
    setOpen(false);
    onNavigate(key);
  };

  return (
    <>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />
        <View style={styles.header}>
          <View style={styles.brand}>
            <Text style={styles.brandIcon}>🎓</Text>
            <Text style={styles.brandName}>StudyMate</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.selector, pressed && styles.selectorPressed]}
            onPress={() => setOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Open navigation menu"
          >
            <Text style={styles.selectorLabel} numberOfLines={1}>
              {active ? active.label : "Menu"}
            </Text>
            <Text style={styles.selectorArrow}>▼</Text>
          </Pressable>
        </View>
      </SafeAreaView>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={styles.dropdown}>
            <Text style={styles.dropdownHeading}>Navigate to</Text>
            {NAV_ITEMS.map((item) => (
              <Pressable
                key={item.key}
                style={({ pressed }) => [
                  styles.dropdownItem,
                  currentView === item.key && styles.dropdownItemActive,
                  pressed && styles.dropdownItemPressed,
                ]}
                onPress={() => handleSelect(item.key)}
                accessibilityRole="menuitem"
              >
                <Text style={styles.dropdownIcon}>{item.icon}</Text>
                <Text style={[styles.dropdownLabel, currentView === item.key && styles.dropdownLabelActive]}>
                  {item.label}
                </Text>
                {currentView === item.key && <Text style={styles.activeDot}>●</Text>}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea:            { backgroundColor: COLORS.navy },
  header:              { backgroundColor: COLORS.navy, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  brand:               { flexDirection: "row", alignItems: "center" },
  brandIcon:           { fontSize: 22, marginRight: SPACING.sm },
  brandName:           { fontSize: FONTS.large, fontWeight: "700", color: COLORS.card, letterSpacing: 0.5 },
  selector:            { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.indigo, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, maxWidth: 190 },
  selectorPressed:     { opacity: 0.8 },
  selectorLabel:       { color: COLORS.card, fontSize: FONTS.body, fontWeight: "600", marginRight: SPACING.sm, flex: 1 },
  selectorArrow:       { color: COLORS.lavender, fontSize: FONTS.small },
  overlay:             { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-start", paddingTop: 88, paddingHorizontal: SPACING.lg },
  dropdown:            { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, paddingVertical: SPACING.sm, ...SHADOW },
  dropdownHeading:     { fontSize: FONTS.small, fontWeight: "700", color: COLORS.secondaryText, textTransform: "uppercase", letterSpacing: 0.5, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  dropdownItem:        { flexDirection: "row", alignItems: "center", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderRadius: RADIUS.sm, marginHorizontal: SPACING.sm, marginVertical: 2 },
  dropdownItemActive:  { backgroundColor: COLORS.background },
  dropdownItemPressed: { opacity: 0.7 },
  dropdownIcon:        { fontSize: 18, marginRight: SPACING.md },
  dropdownLabel:       { fontSize: FONTS.medium, color: COLORS.text, fontWeight: "500", flex: 1 },
  dropdownLabelActive: { color: COLORS.indigo, fontWeight: "700" },
  activeDot:           { color: COLORS.indigo, fontSize: 10 },
});
