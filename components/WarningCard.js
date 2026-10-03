// =============================================================================
// components/WarningCard.js
// Contextual alert card. type: "success"|"warning"|"error"|"info"
// Meaning conveyed by BOTH icon+text AND color for accessibility.
// =============================================================================

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from "../theme/theme";

const CONFIG = {
  success: { borderColor: COLORS.success, bg: "#F0FDF4", icon: "✅", labelColor: COLORS.success },
  warning: { borderColor: COLORS.warning, bg: "#FFFBEB", icon: "⚠️", labelColor: COLORS.warning },
  error:   { borderColor: COLORS.error,   bg: "#FFF1F2", icon: "🚨", labelColor: COLORS.error   },
  info:    { borderColor: COLORS.indigo,  bg: "#EEF2FF", icon: "ℹ️",  labelColor: COLORS.indigo  },
};

export default function WarningCard({ type = "info", title, message }) {
  const { borderColor, bg, icon, labelColor } = CONFIG[type] || CONFIG.info;
  return (
    <View style={[styles.card, { borderLeftColor: borderColor, backgroundColor: bg }]}>
      <Text style={styles.icon}>{icon}</Text>
      <View style={styles.content}>
        <Text style={[styles.title, { color: labelColor }]}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card:    { flexDirection: "row", alignItems: "flex-start", borderLeftWidth: 4, borderRadius: RADIUS.md, padding: SPACING.lg, marginBottom: SPACING.sm, ...SHADOW },
  icon:    { fontSize: 18, marginRight: SPACING.md, marginTop: 1 },
  content: { flex: 1 },
  title:   { fontSize: FONTS.body, fontWeight: "700", marginBottom: SPACING.xs },
  message: { fontSize: FONTS.body, color: COLORS.text, lineHeight: 20 },
});
