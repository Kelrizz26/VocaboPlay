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

export const diffColor = (difficulty) => {
  if (difficulty === 'Easy' || difficulty === 'beginner') return colors.success;
  if (difficulty === 'Medium' || difficulty === 'intermediate') return colors.warning;
  if (difficulty === 'Hard' || difficulty === 'advanced') return colors.danger;
  return colors.textSecondary;
};

export const diffBg = (difficulty) => {
  if (difficulty === 'Easy' || difficulty === 'beginner') return colors.successSoft;
  if (difficulty === 'Medium' || difficulty === 'intermediate') return colors.warningSoft;
  if (difficulty === 'Hard' || difficulty === 'advanced') return colors.dangerSoft;
  return colors.bg;
};
