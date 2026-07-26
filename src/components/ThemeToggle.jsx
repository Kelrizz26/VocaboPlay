import React from 'react';
import { useTheme } from '../context/ThemeContext';

// A small light/dark toggle row styled to match the sidebar menu items
// (same glyph-icon language as the rest of the nav: ⊞ ▶ ≡ etc.)
const ThemeToggle = ({ colors, fontFamily }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      onClick={toggleTheme}
      role="button"
      aria-label="Toggle dark mode"
      style={{
        padding: '11px 24px',
        margin: '2px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 500,
        color: colors.textSecondary,
        fontFamily,
        background: 'transparent',
        borderRadius: '8px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '16px', width: '18px', textAlign: 'center' }}>{isDark ? '☾' : '☀'}</span>
        <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
      </div>
      <div
        style={{
          width: '34px',
          height: '18px',
          borderRadius: '10px',
          background: isDark ? colors.accent : colors.border,
          position: 'relative',
          flexShrink: 0,
          transition: 'background 0.15s ease',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '2px',
            left: isDark ? '18px' : '2px',
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            background: colors.surface,
            transition: 'left 0.15s ease',
          }}
        />
      </div>
    </div>
  );
};

export default ThemeToggle;
