// =============================================================================
// components/FormInput.js
// Reusable labeled TextInput with optional error message display.
// =============================================================================

import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { COLORS, FONTS, SPACING, RADIUS } from "../theme/theme";

export default function FormInput({
  label, value, onChangeText, placeholder,
  keyboardType = "default", error,
  editable = true, maxLength, multiline = false,
}) {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[
          styles.input,
          multiline  && styles.multiline,
          error      && styles.inputError,
          !editable  && styles.inputDisabled,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.secondaryText}
        keyboardType={keyboardType}
        editable={editable}
        maxLength={maxLength}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { marginBottom: SPACING.lg },
  label:         { fontSize: FONTS.body, fontWeight: "600", color: COLORS.text, marginBottom: SPACING.sm },
  input:         { backgroundColor: COLORS.background, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.sm, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, fontSize: FONTS.medium, color: COLORS.text, minHeight: 48 },
  multiline:     { minHeight: 80, textAlignVertical: "top" },
  inputError:    { borderColor: COLORS.error },
  inputDisabled: { backgroundColor: COLORS.border, color: COLORS.secondaryText },
  errorText:     { fontSize: FONTS.small, color: COLORS.error, marginTop: SPACING.xs },
});
