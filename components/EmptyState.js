// =============================================================================
// components/EmptyState.js
// Displayed when a list or section has no data to show.
// =============================================================================

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS, SPACING } from "../theme/theme";

export default function EmptyState({ icon, title, subtitle }) {
  return (
    <View style={styles.container}>
      {icon   ? <Text style={styles.icon}>{icon}</Text>         : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center", paddingVertical: SPACING.xxxl * 1.5, paddingHorizontal: SPACING.xxl },
  icon:      { fontSize: 44, marginBottom: SPACING.lg },
  title:     { fontSize: FONTS.large, fontWeight: "700", color: COLORS.text, textAlign: "center", marginBottom: SPACING.sm },
  subtitle:  { fontSize: FONTS.body, color: COLORS.secondaryText, textAlign: "center", lineHeight: 22 },
});
