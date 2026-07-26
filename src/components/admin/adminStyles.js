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
