// src/components/ThemeToggle.jsx
import React from 'react';
import { useTheme } from '../context/ThemeContext';

// ===== MUTED GAME UI PALETTE (soft, not too bright) =====
const palette = {
  warmOrange: '#E9A075',
  warmOrangeShadow: '#C27E4F',
  deepNavy: '#2A2845',
  bodyTextSoft: '#8A8799',
  bodyText: '#6B6880',
  creamSoft: '#F5EFE6',
  white: '#FFFFFF',
  border: '#EBE2D5',
};

// A small light/dark toggle row styled to match the sidebar menu items
// (same glyph-icon language as the rest of the nav)
const ThemeToggle = ({ colors, fontFamily }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  // Use colors passed in from parent (dashboardStyles) for compatibility
  const accentColor = colors?.accent || palette.warmOrange;
  const borderColor = colors?.border || palette.border;
  const textColor = colors?.textSecondary || palette.bodyText;
  const surfaceColor = colors?.surface || palette.white;
  const surfaceSoft = colors?.surfaceSoft || palette.creamSoft;

  return (
    <div
      onClick={toggleTheme}
      role="button"
      aria-label="Toggle dark mode"
      style={{
        padding: '11px 18px',
        margin: '2px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 800,
        color: textColor,
        fontFamily: fontFamily || "'Nunito', sans-serif",
        background: 'transparent',
        borderRadius: '10px',
        border: `1.5px solid transparent`,
        transition: 'background 0.15s ease, border-color 0.15s ease',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = `${accentColor}15`;
        e.currentTarget.style.borderColor = `${accentColor}30`;
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.borderColor = 'transparent';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 18,
            height: 18,
          }}
        >
          {isDark ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke={accentColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke={accentColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </svg>
          )}
        </span>
        <span
          style={{
            fontFamily: "'Fredoka', sans-serif",
            fontWeight: 800,
            letterSpacing: '0.02em',
          }}
        >
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      </div>

      {/* Switch */}
      <div
        style={{
          width: '34px',
          height: '20px',
          borderRadius: '10px',
          background: isDark ? accentColor : surfaceSoft,
          position: 'relative',
          flexShrink: 0,
          transition: 'background 0.18s ease',
          border: `1.5px solid ${isDark ? accentColor : borderColor}`,
          boxShadow: isDark ? `0 2px 0 ${colors?.accentHover || palette.warmOrangeShadow}40` : `0 2px 0 ${borderColor}`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: isDark ? '17px' : '2px',
            transform: 'translateY(-50%)',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: surfaceColor,
            transition: 'left 0.18s ease',
            boxShadow: '0 1px 2px rgba(42, 40, 69, 0.15)',
          }}
        />
      </div>
    </div>
  );
};

export default ThemeToggle;