// src/components/dashboard/GoatMascot.jsx
// ============================================================
// 🐐 GOAT MASCOT — Animated growth-stage mascot (RESPONSIVE)
// ✅ NORMAL MODE — live na from level (walang demo force)
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

// ============================================================
// ✅ NORMAL MODE — live na from level
// ============================================================
const DEMO_MODE = false;

// ============================================================
// ✅ GET MASCOT BY LEVEL
// ============================================================
export const getMascotByLevel = (level) => {
  if (DEMO_MODE) {
    return {
      image: '/image/goat3.png',
      stage: 'Teen Goat',
      emoji: '🐐',
      color: palette.teal
    };
  }

  if (level >= 10) return { image: '/image/goat5.png', stage: 'Master Goat', emoji: '👑', color: '#FFD700' };
  if (level >= 7)  return { image: '/image/goat4.png', stage: 'Adult Goat',  emoji: '🐐', color: '#9C27B0' };
  if (level >= 5)  return { image: '/image/goat3.png', stage: 'Teen Goat',   emoji: '🐐', color: palette.teal };
  if (level >= 3)  return { image: '/image/goat2.png', stage: 'Young Goat',  emoji: '🐐', color: palette.softGreen };
  return { image: '/image/goat1.png', stage: 'Baby Goat', emoji: '🐐', color: palette.warmOrange };
};

// ============================================================
// 🐐 GOAT MASCOT COMPONENT
// ============================================================
const GoatMascot = ({ level = 1, size = 96, animated = true, showBadge = true }) => {
  const mascot = getMascotByLevel(level);
  const [justLeveledUp, setJustLeveledUp] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const responsiveSize = isMobile ? Math.min(size, 140) : size;

  useEffect(() => {
    const key = 'lastSeenLevel';
    const lastSeen = parseInt(localStorage.getItem(key) || '0', 10);
    if (level > lastSeen && lastSeen > 0) {
      setJustLeveledUp(true);
      const timer = setTimeout(() => setJustLeveledUp(false), 4000);
      return () => clearTimeout(timer);
    }
    localStorage.setItem(key, String(level));
  }, [level]);

  return (
    <>
      <style>{`
        @keyframes mascotBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-6px) scale(1.03); }
        }
        @keyframes mascotGlow {
          0%, 100% { box-shadow: 0 0 0 0 ${mascot.color}66, 0 8px 20px rgba(45, 42, 94, 0.25); }
          50% { box-shadow: 0 0 0 16px ${mascot.color}00, 0 8px 20px rgba(45, 42, 94, 0.25); }
        }
        @keyframes sparkleFloat {
          0% { transform: translateY(0) scale(0); opacity: 0; }
          50% { transform: translateY(-14px) scale(1); opacity: 1; }
          100% { transform: translateY(-28px) scale(0); opacity: 0; }
        }
        @keyframes levelUpBurst {
          0% { transform: scale(1); filter: brightness(1); }
          30% { transform: scale(1.15); filter: brightness(1.4); }
          60% { transform: scale(1.05); filter: brightness(1.2); }
          100% { transform: scale(1); filter: brightness(1); }
        }
        .goat-mascot-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: ${animated ? 'mascotBounce 3s ease-in-out infinite' : 'none'};
        }
        .goat-mascot-wrap.leveled-up {
          animation: levelUpBurst 1s ease-out;
        }
        .goat-mascot-ring {
          position: relative;
          border-radius: 50%;
          padding: 6px;
          background: linear-gradient(135deg, ${mascot.color}, #fff, ${mascot.color});
          animation: ${animated ? 'mascotGlow 3s ease-in-out infinite' : 'none'};
        }
        .goat-mascot-img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          object-position: center 20%;
          display: block;
          background: ${palette.white};
        }
        .goat-mascot-sparkle {
          position: absolute;
          font-size: 20px;
          animation: sparkleFloat 2s ease-in-out infinite;
          pointer-events: none;
        }
        .goat-mascot-badge {
          position: absolute;
          bottom: -10px;
          right: -12px;
          background: ${mascot.color};
          color: white;
          font-size: 12px;
          font-weight: 800;
          padding: 5px 12px;
          border-radius: 14px;
          border: 3px solid ${palette.white};
          box-shadow: 0 4px 12px ${mascot.color}88;
          white-space: nowrap;
          font-family: ${FONT_DISPLAY};
          letter-spacing: 0.02em;
        }
      `}</style>

      <div className={`goat-mascot-wrap ${justLeveledUp ? 'leveled-up' : ''}`}>
        <div
          className="goat-mascot-ring"
          style={{ width: responsiveSize, height: responsiveSize }}
        >
          <img
            src={mascot.image}
            alt={mascot.stage}
            className="goat-mascot-img"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🐐</text></svg>';
            }}
          />

          {justLeveledUp && (
            <>
              <span className="goat-mascot-sparkle" style={{ top: '10%', left: '0%', animationDelay: '0s' }}>✨</span>
              <span className="goat-mascot-sparkle" style={{ top: '0%', right: '10%', animationDelay: '0.3s' }}>⭐</span>
              <span className="goat-mascot-sparkle" style={{ bottom: '10%', right: '0%', animationDelay: '0.6s' }}>✨</span>
              <span className="goat-mascot-sparkle" style={{ bottom: '0%', left: '10%', animationDelay: '0.9s' }}>⭐</span>
            </>
          )}
        </div>

        {showBadge && (
          <div className="goat-mascot-badge">
            {mascot.emoji} {mascot.stage}
          </div>
        )}
      </div>
    </>
  );
};

export default GoatMascot;