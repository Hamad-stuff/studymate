// =============================================================================
// theme/theme.js
// Central design system for StudyMate.
// ALL colors, fonts, spacing, radius, and shadow values live here.
// Import from this file — never write raw color hex codes in components.
// =============================================================================

export const COLORS = {
  navy:          "#172554",
  indigo:        "#4F46E5",
  lavender:      "#A5B4FC",
  background:    "#F8FAFC",
  card:          "#FFFFFF",
  success:       "#16A34A",
  warning:       "#D97706",
  error:         "#DC2626",
  text:          "#0F172A",
  secondaryText: "#64748B",
  border:        "#E2E8F0",
};

export const FONTS = {
  small:  12,
  body:   14,
  medium: 16,
  large:  18,
  xlarge: 22,
  title:  26,
};

export const SPACING = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  24,
  xxxl: 32,
};

export const RADIUS = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  full: 999,
};

// Consistent elevation/shadow for all card surfaces
export const SHADOW = {
  shadowColor:   "#000",
  shadowOffset:  { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius:  8,
  elevation:     3,
};
