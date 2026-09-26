// src/components/dashboard/dashboardStyles.js
//
// Shared "Clean-Minimalist" design tokens used across the Dashboard and all
// feature pages. Centralizing these keeps every screen visually consistent:
// off-white/white surfaces, slate/charcoal text, a single accent color,
// thin 1px borders instead of heavy shadows, and one type scale.

export const colors = {
  bg: 'var(--color-bg)',
  surface: 'var(--color-surface)',
  border: 'var(--color-border)',
  borderStrong: 'var(--color-border-strong)',
  textPrimary: 'var(--color-text-primary)',
  textSecondary: 'var(--color-text-secondary)',
  textMuted: 'var(--color-text-muted)',
  accent: 'var(--color-accent)',
  accentHover: 'var(--color-accent-hover)',
  accentSoft: 'var(--color-accent-soft)',
  danger: 'var(--color-danger)',
  dangerSoft: 'var(--color-danger-soft)',
  success: 'var(--color-success)',
  successSoft: 'var(--color-success-soft)',
  warning: 'var(--color-warning)',
  warningSoft: 'var(--color-warning-soft)',
};

export const fontFamily = "'Poppins', system-ui, -apple-system, sans-serif";

// Type scale: Headers 20-24px, Sub-headers 16px, Body 14px
export const type = {
  h1: { fontSize: '24px', fontWeight: 600, color: colors.textPrimary, fontFamily, letterSpacing: '-0.01em' },
  h2: { fontSize: '20px', fontWeight: 600, color: colors.textPrimary, fontFamily, letterSpacing: '-0.01em' },
  sub: { fontSize: '16px', fontWeight: 600, color: colors.textPrimary, fontFamily },
  body: { fontSize: '14px', fontWeight: 400, color: colors.textSecondary, fontFamily },
  small: { fontSize: '12px', fontWeight: 400, color: colors.textMuted, fontFamily },
};

export const card = {
  background: colors.surface,
  border: `1px solid ${colors.border}`,
  borderRadius: '12px',
  boxShadow: 'none',
};

export const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  border: `1px solid ${colors.border}`,
  borderRadius: '8px',
  fontSize: '14px',
  fontFamily,
  outline: 'none',
  color: colors.textPrimary,
  background: colors.surface,
};

export const labelStyle = {
  fontSize: '13px',
  fontWeight: 600,
  display: 'block',
  marginBottom: '6px',
  color: colors.textSecondary,
  fontFamily,
};

export const btnPrimary = {
  flex: 1,
  padding: '10px 16px',
  background: colors.accent,
  color: '#fff',
  border: `1px solid ${colors.accent}`,
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily,
};

export const btnSecondary = {
  flex: 1,
  padding: '10px 16px',
  background: colors.surface,
  color: colors.textSecondary,
  border: `1px solid ${colors.border}`,
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily,
};

/* ============================================================
   CEFR LEVEL SYSTEM
   ------------------------------------------------------------
   A1 -> Beginner (lightest green)
   A2 -> Elementary (green)
   B1 -> Intermediate (yellow)
   B2 -> Upper-Intermediate (orange)
   C1 -> Advanced (red)
   C2 -> Proficiency (dark red / maroon)
   ============================================================ */

export const CEFR_LEVELS = [
  { id: 'A1', name: 'A1', label: 'Beginner',             color: '#2E7D32', bg: '#E8F5E9' },
  { id: 'A2', name: 'A2', label: 'Elementary',           color: '#388E3C', bg: '#EDF7ED' },
  { id: 'B1', name: 'B1', label: 'Intermediate',         color: '#B85C1A', bg: '#FFF4E5' },
  { id: 'B2', name: 'B2', label: 'Upper-Intermediate',   color: '#E07B00', bg: '#FFF1DD' },
  { id: 'C1', name: 'C1', label: 'Advanced',             color: '#A93226', bg: '#FDECEA' },
  { id: 'C2', name: 'C2', label: 'Proficiency',          color: '#7B1E1E', bg: '#F8E1E1' },
];

// Fallback mapping from old difficulty values to CEFR
const LEGACY_DIFFICULTY_MAP = {
  beginner: 'A1',
  easy: 'A1',
  intermediate: 'B1',
  medium: 'B1',
  advanced: 'C1',
  hard: 'C1',
};

/**
 * Normalize any incoming level value to a valid CEFR code (A1..C2).
 * Falls back to legacy difficulty mapping, then to 'B1' as default.
 */
export const normalizeCefr = (value) => {
  if (!value) return 'B1';
  const upper = String(value).toUpperCase();
  if (['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(upper)) return upper;
  const lower = String(value).toLowerCase();
  return LEGACY_DIFFICULTY_MAP[lower] || 'B1';
};

/**
 * Get the color (text/accent) for a given CEFR level.
 */
export const cefrColor = (level) => {
  const code = normalizeCefr(level);
  const found = CEFR_LEVELS.find((l) => l.id === code);
  return found ? found.color : colors.textSecondary;
};

/**
 * Get the background color for a given CEFR level.
 */
export const cefrBg = (level) => {
  const code = normalizeCefr(level);
  const found = CEFR_LEVELS.find((l) => l.id === code);
  return found ? found.bg : colors.bg;
};

/**
 * Get the full level object (id, name, label, color, bg).
 */
export const cefrMeta = (level) => {
  const code = normalizeCefr(level);
  return CEFR_LEVELS.find((l) => l.id === code) || CEFR_LEVELS[2];
};

/* ============================================================
   BACKWARD-COMPATIBLE ALIASES
   ------------------------------------------------------------
   Old code that still calls diffColor()/diffBg() will keep working,
   but will now return CEFR-based colors.
   ============================================================ */
export const diffColor = (level) => cefrColor(level);
export const diffBg = (level) => cefrBg(level);