// =============================================================================
// components/ChartCard.js
// White card wrapper for react-native-chart-kit charts.
// =============================================================================

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from "../theme/theme";

export default function ChartCard({ title, subtitle, children }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card:     { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, marginBottom: SPACING.lg, overflow: "hidden", ...SHADOW },
  header:   { paddingHorizontal: SPACING.xl, paddingTop: SPACING.xl, paddingBottom: SPACING.md },
  title:    { fontSize: FONTS.medium, fontWeight: "700", color: COLORS.text },
  subtitle: { fontSize: FONTS.small, color: COLORS.secondaryText, marginTop: SPACING.xs },
  body:     {},
});
