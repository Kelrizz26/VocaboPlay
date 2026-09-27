// src/components/dashboard/ExpBar.jsx
// ============================================================
// 📊 EXP BAR — Shows progress to next level
// ============================================================

import React, { useEffect, useState } from 'react';

// ===== WARM & FRIENDLY PALETTE (Matched to Mascots) =====
const palette = {
  warmOrange: '#F4A261',
  warmOrangeShadow: '#C77E3E',
  coral: '#E76F51',
  coralShadow: '#B54A32',
  teal: '#2A9D8F',
  tealShadow: '#1E7268',
  deepNavy: '#2D2A5E',
  bodyText: '#5A587A',
  cream: '#FFF8F0',
  white: '#FFFFFF',
  border: '#E2E8F0',
  softGreen: '#8AB17D',
  softGreenShadow: '#6A8A5E',
};

const FONT_DISPLAY = "'Fredoka', sans-serif";
const FONT_BODY = "'Nunito', sans-serif";

const ExpBar = ({
  xp = 0,
  xpToNext = 100,
  level = 1,
  color = '#FFD700',
  showLabel = true,
  compact = false
}) => {
  const [displayWidth, setDisplayWidth] = useState(0);
  const percentage = Math.min(100, Math.round((xp / xpToNext) * 100));

  useEffect(() => {
    const timer = setTimeout(() => setDisplayWidth(percentage), 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <>
      <style>{`
        @keyframes expShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .exp-bar-track {
          position: relative;
          width: 100%;
          height: ${compact ? '8px' : '14px'};
          background: rgba(45, 42, 94, 0.25);
          border-radius: 999px;
          overflow: hidden;
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          border: 2px solid rgba(255, 255, 255, 0.25);
        }
        .exp-bar-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, ${color}, #FFF8B0, ${color});
          background-size: 200% 100%;
          transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);
          animation: expShimmer 2s linear infinite;
          position: relative;
        }
        .exp-bar-fill::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          width: 20px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.7));
          border-radius: 999px;
        }
      `}</style>

      <div style={{ width: '100%' }}>
        {showLabel && !compact && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '6px',
              fontSize: '12px',
              fontWeight: '700',
              color: palette.white,
              textShadow: '0 1px 4px rgba(45, 42, 94, 0.5)',
              fontFamily: FONT_DISPLAY,
              letterSpacing: '0.02em',
            }}
          >
            <span>Level {level}</span>
            <span>{xp} / {xpToNext} XP · {percentage}%</span>
          </div>
        )}

        <div className="exp-bar-track">
          <div
            className="exp-bar-fill"
            style={{ width: `${displayWidth}%` }}
          />
        </div>

        {showLabel && compact && (
          <div
            style={{
              marginTop: '4px',
              fontSize: '11px',
              fontWeight: '700',
              color: palette.white,
              textAlign: 'center',
              fontFamily: FONT_BODY,
              textShadow: '0 1px 4px rgba(45, 42, 94, 0.5)',
            }}
          >
            {xp} / {xpToNext} XP
          </div>
        )}
      </div>
    </>
  );
};

export default ExpBar;