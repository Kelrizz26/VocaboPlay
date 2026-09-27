// src/components/dashboard/MascotCarousel.jsx
// ============================================================
// 🐐 MASCOT CAROUSEL
// ✅ WALANG progress bar sa baba (nasa ExpBar na sa taas)
// ✅ Sa Level 2 → Young Goat (unlocked)
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';

const palette = {
  warmOrange: '#E9A075',
  warmOrangeShadow: '#C27E4F',
  coral: '#DB7A64',
  coralShadow: '#A95845',
  teal: '#4F9188',
  tealShadow: '#3A6A63',
  deepNavy: '#2A2845',
  deepNavyLight: '#3A3757',
  bodyText: '#6B6880',
  bodyTextSoft: '#8A8799',
  cream: '#FDF9F3',
  creamSoft: '#F5EFE6',
  white: '#FFFFFF',
  border: '#EBE2D5',
  borderSoft: '#F2EBE0',
  softGreen: '#7FA574',
  softGreenShadow: '#5E7F55',
  gold: '#C9A227',
  goldSoft: '#D9B44A',
  locked: '#8A8799',
  shadow: 'rgba(42, 40, 69, 0.06)',
  shadowMd: 'rgba(42, 40, 69, 0.10)',
};

const BRAND_FONT_DISPLAY = "'Fredoka', sans-serif";
const BRAND_FONT_BODY = "'Nunito', sans-serif";

const MASCOT_STAGES = [
  { id: 1,  image: '/image/goat1.png',  stage: 'Baby Goat',      emoji: '🐐', color: palette.warmOrange, minLevel: 1  },
  { id: 2,  image: '/image/goat2.png',  stage: 'Young Goat',     emoji: '🐐', color: palette.softGreen,  minLevel: 2  },
  { id: 3,  image: '/image/goat3.png',  stage: 'Teen Goat',      emoji: '🐐', color: palette.teal,       minLevel: 3  },
  { id: 4,  image: '/image/goat4.png',  stage: 'Adult Goat',     emoji: '🐐', color: palette.coral,      minLevel: 4  },
  { id: 5,  image: '/image/goat5.png',  stage: 'Master Goat',    emoji: '👑', color: palette.gold,       minLevel: 5  },
  { id: 6,  image: '/image/goat6.png',  stage: 'Champion Goat',  emoji: '🏆', color: palette.warmOrange, minLevel: 6  },
  { id: 7,  image: '/image/goat7.png',  stage: 'Hero Goat',      emoji: '⚔️', color: palette.coral,      minLevel: 7  },
  { id: 8,  image: '/image/goat8.png',  stage: 'Legendary Goat', emoji: '🌟', color: palette.gold,       minLevel: 8  },
  { id: 9,  image: '/image/goat9.png',  stage: 'Mythic Goat',    emoji: '🔥', color: palette.deepNavy,   minLevel: 9  },
  { id: 10, image: '/image/goat10.png', stage: 'Divine Goat',    emoji: '💎', color: palette.gold,       minLevel: 10 },
];

const AUTO_PLAY_INTERVAL = 5000;

const getCurrentMascotIndex = (level) => {
  if (level >= 10) return 9;
  if (level >= 9)  return 8;
  if (level >= 8)  return 7;
  if (level >= 7)  return 6;
  if (level >= 6)  return 5;
  if (level >= 5)  return 4;
  if (level >= 4)  return 3;
  if (level >= 3)  return 2;
  if (level >= 2)  return 1;
  return 0;
};

const playClickSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.08);
    gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.08);
    setTimeout(() => { try { audioCtx.close(); } catch (e) {} }, 150);
  } catch (e) {}
};

const playUnlockSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.06);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.06 + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(audioCtx.currentTime + i * 0.06);
      osc.stop(audioCtx.currentTime + i * 0.06 + 0.15);
    });
    setTimeout(() => { try { audioCtx.close(); } catch (e) {} }, 500);
  } catch (e) {}
};

const MascotCarousel = ({ level = 1, size = 250, animated = true }) => {
  const currentMascotIndex = getCurrentMascotIndex(level);
  
  const [previewIndex, setPreviewIndex] = useState(currentMascotIndex);
  const [isMobile, setIsMobile] = useState(false);
  const [justLeveledUp, setJustLeveledUp] = useState(false);
  const [slideDirection, setSlideDirection] = useState('right');
  const [isAnimating, setIsAnimating] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [showUnlockToast, setShowUnlockToast] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const autoPlayTimerRef = useRef(null);
  const touchStartXRef = useRef(null);
  const touchEndXRef = useRef(null);
  const lastUnlockCheckRef = useRef(currentMascotIndex);
  const prevLevelRef = useRef(level);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setPreviewIndex(currentMascotIndex);
    prevLevelRef.current = level;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (level !== prevLevelRef.current) {
      setPreviewIndex(currentMascotIndex);
      prevLevelRef.current = level;
    }
  }, [level, currentMascotIndex]);

  useEffect(() => {
    const key = 'lastSeenLevel';
    const lastSeen = parseInt(localStorage.getItem(key) || '0', 10);

    if (level > lastSeen && lastSeen > 0) {
      setJustLeveledUp(true);
      const timer = setTimeout(() => setJustLeveledUp(false), 4000);
      localStorage.setItem(key, String(level));
      return () => clearTimeout(timer);
    }
    localStorage.setItem(key, String(level));

    if (lastUnlockCheckRef.current !== currentMascotIndex) {
      const newMascot = MASCOT_STAGES[currentMascotIndex];
      setShowUnlockToast({ stage: newMascot.stage, minLevel: newMascot.minLevel });
      if (soundEnabled) playUnlockSound();
      lastUnlockCheckRef.current = currentMascotIndex;
      setTimeout(() => setShowUnlockToast(null), 5000);
    }
  }, [level, currentMascotIndex, soundEnabled]);

  useEffect(() => {
    if (!autoPlay) {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
      return;
    }
    autoPlayTimerRef.current = setInterval(() => {
      setSlideDirection('right');
      setPreviewIndex((prev) => (prev === MASCOT_STAGES.length - 1 ? 0 : prev + 1));
    }, AUTO_PLAY_INTERVAL);
    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
    };
  }, [autoPlay]);

  const responsiveSize = isMobile ? Math.min(size, 160) : size;
  const previewMascot = MASCOT_STAGES[previewIndex];
  const isLocked = level < previewMascot.minLevel;
  const isCurrent = previewIndex === currentMascotIndex;

  const levelsNeeded = Math.max(0, previewMascot.minLevel - level);

  const goPrev = useCallback(() => {
    setSlideDirection('left');
    setIsAnimating(true);
    if (soundEnabled) playClickSound();
    setPreviewIndex((prev) => (prev === 0 ? MASCOT_STAGES.length - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 300);
    if (autoPlay) setAutoPlay(false);
  }, [autoPlay, soundEnabled]);

  const goNext = useCallback(() => {
    setSlideDirection('right');
    setIsAnimating(true);
    if (soundEnabled) playClickSound();
    setPreviewIndex((prev) => (prev === MASCOT_STAGES.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 300);
    if (autoPlay) setAutoPlay(false);
  }, [autoPlay, soundEnabled]);

  const goToIndex = useCallback((idx) => {
    if (idx === previewIndex) return;
    setSlideDirection(idx > previewIndex ? 'right' : 'left');
    setIsAnimating(true);
    if (soundEnabled) playClickSound();
    setPreviewIndex(idx);
    setTimeout(() => setIsAnimating(false), 300);
    if (autoPlay) setAutoPlay(false);
  }, [previewIndex, autoPlay, soundEnabled]);

  const goToCurrent = useCallback(() => {
    if (previewIndex === currentMascotIndex) return;
    setSlideDirection(currentMascotIndex > previewIndex ? 'right' : 'left');
    setIsAnimating(true);
    if (soundEnabled) playClickSound();
    setPreviewIndex(currentMascotIndex);
    setTimeout(() => setIsAnimating(false), 300);
    if (autoPlay) setAutoPlay(false);
  }, [previewIndex, currentMascotIndex, autoPlay, soundEnabled]);

  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchEndXRef.current = null;
  };

  const handleTouchMove = (e) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const diff = touchStartXRef.current - touchEndXRef.current;
    const SWIPE_THRESHOLD = 50;
    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) goNext(); else goPrev();
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  const slideAnimation = isAnimating
    ? slideDirection === 'right'
      ? 'slideInRight 0.3s ease-out'
      : 'slideInLeft 0.3s ease-out'
    : 'none';

  return (
    <>
      <style>{`
        @keyframes mascotBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-6px) scale(1.03); }
        }
        @keyframes mascotGlow {
          0%, 100% { box-shadow: 0 0 0 0 ${previewMascot.color}40, 0 6px 16px ${palette.shadowMd}; }
          50% { box-shadow: 0 0 0 14px ${previewMascot.color}00, 0 6px 16px ${palette.shadowMd}; }
        }
        @keyframes sparkleFloat {
          0% { transform: translateY(0) scale(0); opacity: 0; }
          50% { transform: translateY(-14px) scale(1); opacity: 1; }
          100% { transform: translateY(-28px) scale(0); opacity: 0; }
        }
        @keyframes levelUpBurst {
          0% { transform: scale(1); filter: brightness(1); }
          30% { transform: scale(1.12); filter: brightness(1.15); }
          60% { transform: scale(1.04); filter: brightness(1.08); }
          100% { transform: scale(1); filter: brightness(1); }
        }
        @keyframes lockedPulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        @keyframes slideInRight {
          0% { transform: translateX(30px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInLeft {
          0% { transform: translateX(-30px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes toastSlideDown {
          0% { transform: translateY(-30px) translateX(-50%); opacity: 0; }
          100% { transform: translateY(0) translateX(-50%); opacity: 1; }
        }
        @keyframes currentPulse {
          0%, 100% { box-shadow: 0 0 0 2px ${palette.white}, 0 0 0 4px ${palette.warmOrange}; }
          50% { box-shadow: 0 0 0 2px ${palette.white}, 0 0 0 6px ${palette.warmOrange}; }
        }

        .mascot-carousel-wrap { display: flex; align-items: center; gap: 12px; position: relative; }
        .mascot-arrow { width: 40px; height: 40px; border-radius: 50%; border: 1.5px solid ${palette.border}; background: ${palette.white}; color: ${palette.deepNavy}; font-size: 20px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; flex-shrink: 0; font-family: ${BRAND_FONT_DISPLAY}; padding-bottom: 3px; user-select: none; box-shadow: 0 2px 0 ${palette.border}; }
        .mascot-arrow:hover { background: ${palette.creamSoft}; border-color: ${palette.warmOrange}80; color: ${palette.warmOrange}; transform: scale(1.06); }
        .mascot-arrow:active { transform: scale(0.95); box-shadow: 0 0 0 ${palette.border}; }
        .mascot-center-wrap { display: flex; flex-direction: column; align-items: center; gap: 8px; position: relative; }
        .mascot-swipe-area { position: relative; display: flex; align-items: center; justify-content: center; touch-action: pan-y; }
        .mascot-main-wrap { position: relative; display: flex; align-items: center; justify-content: center; animation: ${animated ? 'mascotBounce 3s ease-in-out infinite' : 'none'}; }
        .mascot-main-wrap.leveled-up { animation: levelUpBurst 1s ease-out; }
        .mascot-main-wrap.animating { animation: ${slideAnimation}; }
        .mascot-ring { position: relative; border-radius: 50%; padding: 6px; background: linear-gradient(135deg, ${previewMascot.color}CC, ${palette.creamSoft}, ${previewMascot.color}CC); animation: ${animated ? 'mascotGlow 3s ease-in-out infinite' : 'none'}; }
        .mascot-img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; object-position: center 20%; display: block; background: ${palette.white}; transition: filter 0.3s ease; }
        .mascot-img.locked { filter: grayscale(0.85) brightness(0.8); animation: lockedPulse 2.5s ease-in-out infinite; }
        .mascot-sparkle { position: absolute; font-size: 20px; animation: sparkleFloat 2s ease-in-out infinite; pointer-events: none; }
        .mascot-lock-badge { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 40px; z-index: 3; pointer-events: none; filter: drop-shadow(0 4px 12px rgba(42,40,69,0.5)); }
        .mascot-badge { position: absolute; bottom: -10px; right: -12px; background: ${previewMascot.color}; color: white; font-size: 12px; font-weight: 700; padding: 5px 12px; border-radius: 14px; border: 2px solid ${palette.white}; box-shadow: 0 4px 12px ${previewMascot.color}66, 0 2px 0 ${palette.border}; white-space: nowrap; z-index: 5; font-family: ${BRAND_FONT_DISPLAY}; letter-spacing: 0.02em; }
        .mascot-badge.locked { background: ${palette.locked}; box-shadow: 0 4px 12px ${palette.shadowMd}, 0 2px 0 ${palette.border}; }
        .mascot-dots { display: flex; gap: 5px; align-items: center; justify-content: center; margin-top: 4px; flex-wrap: wrap; max-width: 240px; }
        .mascot-dot { width: 8px; height: 8px; border-radius: 50%; background: ${palette.border}; cursor: pointer; transition: all 0.2s ease; border: none; padding: 0; }
        .mascot-dot:hover { transform: scale(1.3); background: ${palette.warmOrange}80; }
        .mascot-dot.active { background: ${palette.warmOrange}; width: 20px; border-radius: 4px; }
        .mascot-dot.unlocked { background: ${palette.softGreen}; }
        .mascot-dot.current { width: 12px; height: 12px; animation: currentPulse 2s ease-in-out infinite; }
        .mascot-dot.current.active { width: 20px; border-radius: 4px; }
        .mascot-level-req { font-size: 11px; font-weight: 700; color: ${palette.bodyTextSoft}; text-align: center; white-space: nowrap; font-family: ${BRAND_FONT_BODY}; }
        .mascot-controls { display: flex; gap: 6px; align-items: center; justify-content: center; margin-top: 6px; flex-wrap: wrap; }
        .mascot-ctrl-btn { padding: 4px 10px; border-radius: 12px; border: 1.5px solid ${palette.border}; background: ${palette.white}; color: ${palette.bodyText}; font-size: 10px; font-weight: 800; cursor: pointer; font-family: ${BRAND_FONT_DISPLAY}; transition: all 0.2s ease; display: flex; align-items: center; gap: 4px; user-select: none; letter-spacing: 0.04em; text-transform: uppercase; box-shadow: 0 2px 0 ${palette.border}; }
        .mascot-ctrl-btn:hover { background: ${palette.creamSoft}; border-color: ${palette.warmOrange}80; color: ${palette.warmOrange}; }
        .mascot-ctrl-btn.active { background: ${palette.warmOrange}15; border-color: ${palette.warmOrange}80; color: ${palette.warmOrange}; box-shadow: 0 2px 0 ${palette.warmOrange}40; }
        .mascot-ctrl-btn.current-btn { background: ${palette.warmOrange}15; border-color: ${palette.warmOrange}80; color: ${palette.warmOrange}; }
        .mascot-ctrl-btn.current-btn:hover { background: ${palette.warmOrange}25; }
        .mascot-unlock-toast { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 10000; background: ${palette.white}; color: ${palette.deepNavy}; padding: 12px 22px; border-radius: 14px; font-size: 14px; font-weight: 800; box-shadow: 0 6px 24px ${palette.shadowMd}, 0 2px 0 ${palette.border}; display: flex; align-items: center; gap: 10px; animation: toastSlideDown 0.4s ease-out; pointer-events: none; font-family: ${BRAND_FONT_DISPLAY}; border: 1.5px solid ${palette.warmOrange}66; border-left: 5px solid ${palette.warmOrange}; }
        .mascot-unlock-toast .toast-emoji { font-size: 22px; }
        @media (max-width: 768px) {
          .mascot-arrow { width: 32px; height: 32px; font-size: 16px; }
          .mascot-carousel-wrap { gap: 6px; }
          .mascot-dot { width: 6px; height: 6px; }
          .mascot-dot.active { width: 14px; }
          .mascot-dot.current { width: 10px; height: 10px; }
          .mascot-lock-badge { font-size: 30px; }
          .mascot-dots { max-width: 200px; gap: 4px; }
        }
      `}</style>

      {showUnlockToast && (
        <div className="mascot-unlock-toast">
          <span className="toast-emoji">🎉</span>
          <div>
            <div style={{ fontSize: '12px', color: palette.bodyTextSoft, fontWeight: 700, textTransform: 'uppercase' }}>New Mascot Unlocked!</div>
            <div style={{ fontSize: '15px', color: palette.deepNavy }}>{showUnlockToast.stage}</div>
          </div>
        </div>
      )}

      <div className="mascot-carousel-wrap">
        <button className="mascot-arrow" onClick={goPrev} title="Previous goat">‹</button>

        <div className="mascot-center-wrap" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
          <div className="mascot-swipe-area">
            <div className={`mascot-main-wrap ${justLeveledUp && isCurrent ? 'leveled-up' : ''} ${isAnimating ? 'animating' : ''}`}>
              <div className="mascot-ring" style={{ width: responsiveSize, height: responsiveSize }}>
                <img
                  src={previewMascot.image}
                  alt={previewMascot.stage}
                  className={`mascot-img ${isLocked ? 'locked' : ''}`}
                  onError={(e) => { e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🐐</text></svg>'; }}
                  draggable={false}
                />
                {isLocked && <span className="mascot-lock-badge">🔒</span>}
                {justLeveledUp && isCurrent && (
                  <>
                    <span className="mascot-sparkle" style={{ top: '10%', left: '0%', animationDelay: '0s' }}>✨</span>
                    <span className="mascot-sparkle" style={{ top: '0%', right: '10%', animationDelay: '0.3s' }}>⭐</span>
                    <span className="mascot-sparkle" style={{ bottom: '10%', right: '0%', animationDelay: '0.6s' }}>✨</span>
                    <span className="mascot-sparkle" style={{ bottom: '0%', left: '10%', animationDelay: '0.9s' }}>⭐</span>
                  </>
                )}
              </div>
              <div className={`mascot-badge ${isLocked ? 'locked' : ''}`}>
                {isLocked ? '🔒' : previewMascot.emoji} {previewMascot.stage}
              </div>
            </div>
          </div>

          {isLocked && (
            <div className="mascot-level-req">
              🔒 Level {previewMascot.minLevel}+ Required • {levelsNeeded} more to unlock
            </div>
          )}
          {!isLocked && isCurrent && <div className="mascot-level-req">✨ Current Mascot</div>}
          {!isLocked && !isCurrent && <div className="mascot-level-req">✅ Unlocked</div>}

          {/* ❌ WALANG PROGRESS BAR DITO — nasa ExpBar na sa taas */}

          <div className="mascot-dots">
            {MASCOT_STAGES.map((m, idx) => {
              const dotUnlocked = level >= m.minLevel;
              const isCurrentDot = idx === currentMascotIndex;
              return (
                <button
                  key={m.id}
                  className={`mascot-dot ${idx === previewIndex ? 'active' : ''} ${dotUnlocked ? 'unlocked' : ''} ${isCurrentDot ? 'current' : ''}`}
                  onClick={() => goToIndex(idx)}
                  title={`${m.stage} (Level ${m.minLevel}+)`}
                  aria-label={`Go to ${m.stage}`}
                />
              );
            })}
          </div>

          <div className="mascot-controls">
            <button className="mascot-ctrl-btn current-btn" onClick={goToCurrent} disabled={isCurrent} style={{ opacity: isCurrent ? 0.5 : 1 }}>
              🎯 Current
            </button>
            <button className={`mascot-ctrl-btn ${autoPlay ? 'active' : ''}`} onClick={() => { setAutoPlay(!autoPlay); if (soundEnabled) playClickSound(); }}>
              {autoPlay ? '⏸' : '▶'} Auto
            </button>
            <button className={`mascot-ctrl-btn ${soundEnabled ? 'active' : ''}`} onClick={() => setSoundEnabled(!soundEnabled)}>
              {soundEnabled ? '🔊' : '🔇'}
            </button>
          </div>
        </div>

        <button className="mascot-arrow" onClick={goNext} title="Next goat">›</button>
      </div>
    </>
  );
};

export default MascotCarousel;