// =============================================================================
// components/DatePickerField.js
// Custom date picker using three scrollable columns: Day | Month | Year
// No external dependency — built entirely with React Native primitives.
// Returns and accepts dates as "YYYY-MM-DD" strings.
// =============================================================================

import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Modal, ScrollView } from "react-native";
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from "../theme/theme";
import { MONTHS, getDaysInMonth, getYearOptions, formatDateLong } from "../utils/dateUtils";

export default function DatePickerField({ label, value, onChange, error }) {
  const [modalVisible, setModalVisible] = useState(false);

  const parseDate = (dateStr) => {
    if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [y, m, d] = dateStr.split("-").map(Number);
      return { year: y, month: m, day: d };
    }
    const t = new Date();
    return { year: t.getFullYear(), month: t.getMonth() + 1, day: t.getDate() };
  };

  const [tempDate, setTempDate] = useState(() => parseDate(value));

  const openPicker = () => {
    setTempDate(parseDate(value));
    setModalVisible(true);
  };

  const handleConfirm = () => {
    const maxDay  = getDaysInMonth(tempDate.month, tempDate.year);
    const safeDay = Math.min(tempDate.day, maxDay);
    const dateStr = `${tempDate.year}-${String(tempDate.month).padStart(2, "0")}-${String(safeDay).padStart(2, "0")}`;
    onChange(dateStr);
    setModalVisible(false);
  };

  const updateYear  = (year)  => {
    const maxDay = getDaysInMonth(tempDate.month, year);
    setTempDate((p) => ({ ...p, year, day: Math.min(p.day, maxDay) }));
  };
  const updateMonth = (month) => {
    const maxDay = getDaysInMonth(month, tempDate.year);
    setTempDate((p) => ({ ...p, month, day: Math.min(p.day, maxDay) }));
  };
  const updateDay   = (day)   => setTempDate((p) => ({ ...p, day }));

  const years  = getYearOptions();
  const months = MONTHS.map((name, i) => ({ value: i + 1, name }));
  const maxDay = getDaysInMonth(tempDate.month, tempDate.year);
  const days   = Array.from({ length: maxDay }, (_, i) => i + 1);

  const displayValue = value ? formatDateLong(value) : "Select a date";

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable
        style={({ pressed }) => [styles.trigger, error && styles.triggerError, pressed && styles.triggerPressed]}
        onPress={openPicker}
        accessibilityRole="button"
        accessibilityLabel={`Date picker: ${displayValue}`}
      >
        <Text style={[styles.triggerText, !value && styles.placeholder]}>📅 {displayValue}</Text>
        <Text style={styles.chevron}>▼</Text>
      </Pressable>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.sheet}>
            <View style={modalStyles.header}>
              <Text style={modalStyles.title}>Select Date</Text>
              <Pressable onPress={() => setModalVisible(false)} style={modalStyles.closeBtn}>
                <Text style={modalStyles.closeText}>✕</Text>
              </Pressable>
            </View>

            <View style={modalStyles.preview}>
              <Text style={modalStyles.previewText}>
                {tempDate.day} {MONTHS[tempDate.month - 1]} {tempDate.year}
              </Text>
            </View>

            <View style={modalStyles.selectors}>
              {/* Day */}
              <View style={modalStyles.column}>
                <Text style={modalStyles.colLabel}>Day</Text>
                <ScrollView style={modalStyles.scrollCol} showsVerticalScrollIndicator={false}>
                  {days.map((d) => (
                    <Pressable key={d} style={[modalStyles.option, tempDate.day === d && modalStyles.optionSelected]} onPress={() => updateDay(d)}>
                      <Text style={[modalStyles.optionText, tempDate.day === d && modalStyles.optionTextSelected]}>{String(d).padStart(2, "0")}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
              {/* Month */}
              <View style={[modalStyles.column, modalStyles.columnWide]}>
                <Text style={modalStyles.colLabel}>Month</Text>
                <ScrollView style={modalStyles.scrollCol} showsVerticalScrollIndicator={false}>
                  {months.map((m) => (
                    <Pressable key={m.value} style={[modalStyles.option, tempDate.month === m.value && modalStyles.optionSelected]} onPress={() => updateMonth(m.value)}>
                      <Text style={[modalStyles.optionText, tempDate.month === m.value && modalStyles.optionTextSelected]}>{m.name}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
              {/* Year */}
              <View style={modalStyles.column}>
                <Text style={modalStyles.colLabel}>Year</Text>
                <ScrollView style={modalStyles.scrollCol} showsVerticalScrollIndicator={false}>
                  {years.map((y) => (
                    <Pressable key={y} style={[modalStyles.option, tempDate.year === y && modalStyles.optionSelected]} onPress={() => updateYear(y)}>
                      <Text style={[modalStyles.optionText, tempDate.year === y && modalStyles.optionTextSelected]}>{y}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={modalStyles.actions}>
              <Pressable style={[modalStyles.btn, modalStyles.btnOutline]} onPress={() => setModalVisible(false)}>
                <Text style={modalStyles.btnOutlineText}>Cancel</Text>
              </Pressable>
              <Pressable style={[modalStyles.btn, modalStyles.btnPrimary]} onPress={handleConfirm}>
                <Text style={modalStyles.btnPrimaryText}>Confirm Date</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { marginBottom: SPACING.lg },
  label:          { fontSize: FONTS.body, fontWeight: "600", color: COLORS.text, marginBottom: SPACING.sm },
  trigger:        { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: COLORS.background, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.sm, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, minHeight: 48 },
  triggerError:   { borderColor: COLORS.error },
  triggerPressed: { opacity: 0.8 },
  triggerText:    { fontSize: FONTS.medium, color: COLORS.text, flex: 1 },
  placeholder:    { color: COLORS.secondaryText },
  chevron:        { color: COLORS.secondaryText, fontSize: FONTS.small },
  errorText:      { fontSize: FONTS.small, color: COLORS.error, marginTop: SPACING.xs },
});

const modalStyles = StyleSheet.create({
  overlay:            { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet:              { backgroundColor: COLORS.card, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, padding: SPACING.xl, paddingBottom: SPACING.xxxl },
  header:             { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: SPACING.lg },
  title:              { fontSize: FONTS.large, fontWeight: "700", color: COLORS.text },
  closeBtn:           { padding: SPACING.sm },
  closeText:          { fontSize: FONTS.large, color: COLORS.secondaryText },
  preview:            { backgroundColor: "#EEF2FF", borderRadius: RADIUS.md, padding: SPACING.md, alignItems: "center", marginBottom: SPACING.lg },
  previewText:        { fontSize: FONTS.large, fontWeight: "700", color: COLORS.indigo },
  selectors:          { flexDirection: "row", height: 200, marginBottom: SPACING.xl, gap: SPACING.sm },
  column:             { flex: 1, overflow: "hidden" },
  columnWide:         { flex: 1.6 },
  colLabel:           { fontSize: FONTS.small, fontWeight: "700", color: COLORS.secondaryText, textAlign: "center", marginBottom: SPACING.sm, textTransform: "uppercase", letterSpacing: 0.5 },
  scrollCol:          { flex: 1 },
  option:             { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.sm, borderRadius: RADIUS.sm, marginVertical: 1, alignItems: "center" },
  optionSelected:     { backgroundColor: COLORS.indigo },
  optionText:         { fontSize: FONTS.body, color: COLORS.text, textAlign: "center" },
  optionTextSelected: { color: COLORS.card, fontWeight: "700" },
  actions:            { flexDirection: "row", gap: SPACING.md },
  btn:                { flex: 1, paddingVertical: SPACING.md, borderRadius: RADIUS.md, alignItems: "center", minHeight: 48 },
  btnOutline:         { borderWidth: 1.5, borderColor: COLORS.indigo, backgroundColor: "transparent" },
  btnPrimary:         { backgroundColor: COLORS.indigo },
  btnOutlineText:     { color: COLORS.indigo, fontSize: FONTS.medium, fontWeight: "600" },
  btnPrimaryText:     { color: COLORS.card,   fontSize: FONTS.medium, fontWeight: "600" },
});
