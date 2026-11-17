// src/components/dashboard/dashboardStyles.js
//
// Shared design tokens used across the Dashboard and all feature pages.
// Now aligned with the game-like muted palette used on Landing / Avatar Shop /
// Live Game / Mascot screens: cream + white surfaces, deepNavy text, muted
// warmOrange accent, Fredoka for display, Nunito for body.

export const colors = {
  // Surfaces
  bg: '#FDF9F3',              // cream
  surface: '#FFFFFF',
  surfaceSoft: '#F5EFE6',     // creamSoft
  border: '#EBE2D5',
  borderStrong: '#D9CFC0',
  borderSoft: '#F2EBE0',

  // Text
  textPrimary: '#2A2845',     // deepNavy
  textSecondary: '#6B6880',   // bodyText
  textMuted: '#8A8799',       // bodyTextSoft
  textInverse: '#FFFFFF',

  // Accent (muted warmOrange)
  accent: '#E9A075',
  accentHover: '#C27E4F',     // warmOrangeShadow
  accentSoft: 'rgba(233, 160, 117, 0.12)',

  // Status
  danger: '#DB7A64',          // coral
  dangerHover: '#A95845',     // coralShadow
  dangerSoft: 'rgba(219, 122, 100, 0.12)',

  success: '#7FA574',         // softGreen
  successHover: '#5E7F55',    // softGreenShadow
  successSoft: 'rgba(127, 165, 116, 0.12)',

  warning: '#C9A227',         // muted gold
  warningHover: '#A9881F',
  warningSoft: 'rgba(201, 162, 39, 0.12)',

  // Extra (used by game components)
  teal: '#4F9188',
  tealHover: '#3A6A63',
  tealSoft: 'rgba(79, 145, 136, 0.12)',

  // Shadows
  shadow: 'rgba(42, 40, 69, 0.06)',
  shadowMd: 'rgba(42, 40, 69, 0.10)',

  // Convenience aliases
  white: '#FFFFFF',
  cream: '#FDF9F3',
  creamSoft: '#F5EFE6',
  deepNavy: '#2A2845',
  bodyText: '#6B6880',
  bodyTextSoft: '#8A8799',
  warmOrange: '#E9A075',
  warmOrangeShadow: '#C27E4F',
  coral: '#DB7A64',
  coralShadow: '#A95845',
  softGreen: '#7FA574',
  softGreenShadow: '#5E7F55',
  gold: '#C9A227',
};

export const fontFamily = "'Nunito', system-ui, -apple-system, sans-serif";
export const fontFamilyDisplay = "'Fredoka', system-ui, -apple-system, sans-serif";

// Type scale (now with Fredoka on headings for the game feel)
export const type = {
  h1:    { fontSize: '28px', fontWeight: 800, color: colors.textPrimary, fontFamily: fontFamilyDisplay, letterSpacing: '-0.02em' },
  h2:    { fontSize: '22px', fontWeight: 800, color: colors.textPrimary, fontFamily: fontFamilyDisplay, letterSpacing: '-0.01em' },
  h3:    { fontSize: '18px', fontWeight: 800, color: colors.textPrimary, fontFamily: fontFamilyDisplay },
  sub:   { fontSize: '16px', fontWeight: 700, color: colors.textPrimary, fontFamily },
  body:  { fontSize: '14px', fontWeight: 500, color: colors.textSecondary, fontFamily },
  small: { fontSize: '12px', fontWeight: 600, color: colors.textMuted, fontFamily },
};

export const card = {
  background: colors.surface,
  border: `1.5px solid ${colors.border}`,
  borderRadius: '16px',
  boxShadow: `0 2px 0 ${colors.border}`,
};

export const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  border: `1.5px solid ${colors.border}`,
  borderRadius: '10px',
  fontSize: '14px',
  fontFamily,
  fontWeight: 600,
  outline: 'none',
  color: colors.textPrimary,
  background: colors.surfaceSoft,
  boxSizing: 'border-box',
};

export const labelStyle = {
  fontSize: '12px',
  fontWeight: 800,
  display: 'block',
  marginBottom: '6px',
  color: colors.textSecondary,
  fontFamily: fontFamilyDisplay,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
};

export const btnPrimary = {
  flex: 1,
  padding: '12px 20px',
  background: colors.accent,
  color: colors.white,
  border: 'none',
  borderRadius: '12px',
  fontSize: '14px',
  fontWeight: 800,
  cursor: 'pointer',
  fontFamily: fontFamilyDisplay,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  boxShadow: `0 4px 0 ${colors.accentHover}`,
  transition: 'transform 0.12s ease, box-shadow 0.12s ease',
};

export const btnSecondary = {
  flex: 1,
  padding: '12px 20px',
  background: colors.white,
  color: colors.textSecondary,
  border: `1.5px solid ${colors.border}`,
  borderRadius: '12px',
  fontSize: '14px',
  fontWeight: 800,
  cursor: 'pointer',
  fontFamily: fontFamilyDisplay,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  boxShadow: `0 4px 0 ${colors.border}`,
  transition: 'transform 0.12s ease, box-shadow 0.12s ease',
};

export const selectStyle = {
  width: '100%',
  padding: '10px 14px',
  border: `1.5px solid ${colors.border}`,
  borderRadius: '10px',
  fontSize: '14px',
  fontFamily,
  fontWeight: 600,
  color: colors.textPrimary,
  background: colors.surface,
  cursor: 'pointer',
  outline: 'none',
  boxSizing: 'border-box',
};

/* ============================================================
   CEFR LEVEL SYSTEM (unchanged — already muted enough)
   ============================================================ */

export const CEFR_LEVELS = [
  { id: 'A1', name: 'A1', label: 'Beginner',           color: '#2E7D32', bg: 'rgba(46, 125, 50, 0.12)' },
  { id: 'A2', name: 'A2', label: 'Elementary',         color: '#388E3C', bg: 'rgba(56, 142, 60, 0.12)' },
  { id: 'B1', name: 'B1', label: 'Intermediate',       color: '#B85C1A', bg: 'rgba(184, 92, 26, 0.12)' },
  { id: 'B2', name: 'B2', label: 'Upper-Intermediate', color: '#E07B00', bg: 'rgba(224, 123, 0, 0.12)' },
  { id: 'C1', name: 'C1', label: 'Advanced',           color: '#A93226', bg: 'rgba(169, 50, 38, 0.12)' },
  { id: 'C2', name: 'C2', label: 'Proficiency',        color: '#7B1E1E', bg: 'rgba(123, 30, 30, 0.12)' },
];

const LEGACY_DIFFICULTY_MAP = {
  beginner: 'A1',
  easy: 'A1',
  intermediate: 'B1',
  medium: 'B1',
  advanced: 'C1',
  hard: 'C1',
};

export const normalizeCefr = (value) => {
  if (!value) return 'B1';
  const upper = String(value).toUpperCase();
  if (['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(upper)) return upper;
  const lower = String(value).toLowerCase();
  return LEGACY_DIFFICULTY_MAP[lower] || 'B1';
};

export const cefrColor = (level) => {
  const code = normalizeCefr(level);
  const found = CEFR_LEVELS.find((l) => l.id === code);
  return found ? found.color : colors.textSecondary;
};

export const cefrBg = (level) => {
  const code = normalizeCefr(level);
  const found = CEFR_LEVELS.find((l) => l.id === code);
  return found ? found.bg : colors.surfaceSoft;
};

export const cefrMeta = (level) => {
  const code = normalizeCefr(level);
  return CEFR_LEVELS.find((l) => l.id === code) || CEFR_LEVELS[2];
};

export const diffColor = (level) => cefrColor(level);
export const diffBg = (level) => cefrBg(level);