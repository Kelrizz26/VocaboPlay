// src/components/admin/adminStyles.js
//
// Shared "Clean-Minimalist" design tokens for the Admin area — mirrors
// src/components/dashboard/dashboardStyles.js so the whole app (student +
// admin) shares one visual language: off-white/white surfaces, slate/
// charcoal text, a single accent color, thin 1px borders, Poppins type.

import { colors } from '../dashboard/dashboardStyles';

export { colors };

export const fontFamily = "'Poppins', sans-serif";

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
  fontWeight: '600',
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
  fontWeight: '600',
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
  fontWeight: '600',
  cursor: 'pointer',
  fontFamily,
};

export const selectStyle = {
  width: '100%',
  padding: '10px 14px',
  border: `1px solid ${colors.border}`,
  borderRadius: '8px',
  fontSize: '14px',
  fontFamily,
  color: colors.textPrimary,
  background: colors.surface,
};

/* ============================================================
   CEFR LEVEL SYSTEM
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
 */
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
  return found ? found.bg : colors.bg;
};

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

/* ============================================================
   OTHER HELPERS (unchanged)
   ============================================================ */

export const catColor = (category) => {
  const map = { vocab: colors.accent, reading: colors.success, challenge: colors.warning };
  return map[category] || colors.accent;
};

export const catBg = (category) => {
  const map = { vocab: colors.accentSoft, reading: colors.successSoft, challenge: colors.warningSoft };
  return map[category] || colors.accentSoft;
};

export const gameImages = {
  'Word Pics': '/images/wordpics.png',
  'Match Game': '/images/matchgame.png',
  'Short Story': '/images/shortstory.png',
  'Quiz Master': '/images/quizgame.png',
  'GuessWhat': '/images/guesswhatgame.png',
  'Sentence Builder': '/images/sentence.png',
};