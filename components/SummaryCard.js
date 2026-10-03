// =============================================================================
// components/SummaryCard.js
// Dashboard metric card. Data-driven via props.
// =============================================================================

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from "../theme/theme";

export default function SummaryCard({ title, value, subtitle, accentColor }) {
  return (
    <View style={[styles.card, accentColor && { borderLeftColor: accentColor, borderLeftWidth: 4 }]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.value, accentColor && { color: accentColor }]}>{value}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card:     { backgroundColor: COLORS.card, borderRadius: RADIUS.md, padding: SPACING.lg, flex: 1, marginHorizontal: SPACING.xs, ...SHADOW },
  title:    { fontSize: FONTS.small, fontWeight: "600", color: COLORS.secondaryText, marginBottom: SPACING.xs, textTransform: "uppercase", letterSpacing: 0.5 },
  value:    { fontSize: FONTS.xlarge, fontWeight: "700", color: COLORS.text, marginBottom: SPACING.xs },
  subtitle: { fontSize: FONTS.small, color: COLORS.secondaryText },
});
