// =============================================================================
// components/PrimaryButton.js
// Reusable button. variant: "primary" | "secondary" | "danger" | "outline"
// =============================================================================

import React from "react";
import { Pressable, Text, StyleSheet, ActivityIndicator } from "react-native";
import { COLORS, FONTS, SPACING, RADIUS } from "../theme/theme";

export default function PrimaryButton({
  title, onPress, variant = "primary",
  disabled = false, loading = false, style,
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.base, styles[variant],
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      {loading
        ? <ActivityIndicator color={variant === "outline" ? COLORS.indigo : COLORS.card} size="small" />
        : <Text style={[styles.baseText, styles[`${variant}Text`]]}>{title}</Text>
      }
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base:          { paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl, borderRadius: RADIUS.md, alignItems: "center", justifyContent: "center", minHeight: 48 },
  primary:       { backgroundColor: COLORS.indigo },
  primaryText:   { color: COLORS.card,   fontSize: FONTS.medium, fontWeight: "600" },
  secondary:     { backgroundColor: COLORS.lavender },
  secondaryText: { color: COLORS.navy,   fontSize: FONTS.medium, fontWeight: "600" },
  danger:        { backgroundColor: COLORS.error },
  dangerText:    { color: COLORS.card,   fontSize: FONTS.medium, fontWeight: "600" },
  outline:       { backgroundColor: "transparent", borderWidth: 1.5, borderColor: COLORS.indigo },
  outlineText:   { color: COLORS.indigo, fontSize: FONTS.medium, fontWeight: "600" },
  pressed:       { opacity: 0.8 },
  disabled:      { opacity: 0.45 },
});
