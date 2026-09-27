// src/components/admin/adminStyles.js
//
// Shared design tokens for the Admin area. Mirrors
// src/components/dashboard/dashboardStyles.js so the whole app (student +
// admin) shares ONE visual language: the muted game palette from Landing.

import { colors } from '../dashboard/dashboardStyles';

export { colors };

export const fontFamily = "'Nunito', system-ui, -apple-system, sans-serif";
export const fontFamilyDisplay = "'Fredoka', system-ui, -apple-system, sans-serif";

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
   CEFR LEVEL SYSTEM (unchanged ids, softened bg alphas)
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