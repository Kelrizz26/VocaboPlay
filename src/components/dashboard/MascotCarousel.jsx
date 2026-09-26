// src/components/dashboard/MascotCarousel.jsx
// ============================================================
// 🐐 MASCOT CAROUSEL — Preview + Lock + Swipe + Auto-play + Sound
// 10 Goats: goat1.png to goat10.png
// Level 1 user → goat1 unlocked, goat2-10 locked
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';

// ============================================================
// ✅ MASCOT DATA — All 10 goats with unlock requirements
// ============================================================
const MASCOT_STAGES = [
  { id: 1,  image: '/image/goat1.png',  stage: 'Baby Goat',      emoji: '🐐', color: '#6C5CE7', minLevel: 1  },
  { id: 2,  image: '/image/goat2.png',  stage: 'Young Goat',     emoji: '🐐', color: '#4CAF50', minLevel: 3  },
  { id: 3,  image: '/image/goat3.png',  stage: 'Teen Goat',      emoji: '🐐', color: '#2196F3', minLevel: 5  },
  { id: 4,  image: '/image/goat4.png',  stage: 'Adult Goat',     emoji: '🐐', color: '#9C27B0', minLevel: 7  },
  { id: 5,  image: '/image/goat5.png',  stage: 'Master Goat',    emoji: '👑', color: '#FFD700', minLevel: 10 },
  { id: 6,  image: '/image/goat6.png',  stage: 'Champion Goat',  emoji: '🏆', color: '#FF6B35', minLevel: 13 },
  { id: 7,  image: '/image/goat7.png',  stage: 'Hero Goat',      emoji: '⚔️', color: '#E53935', minLevel: 16 },
  { id: 8,  image: '/image/goat8.png',  stage: 'Legendary Goat', emoji: '🌟', color: '#E91E63', minLevel: 20 },
  { id: 9,  image: '/image/goat9.png',  stage: 'Mythic Goat',    emoji: '🔥', color: '#1F2937', minLevel: 25 },
  { id: 10, image: '/image/goat10.png', stage: 'Divine Goat',    emoji: '💎', color: '#FFD700', minLevel: 30 },
];

const AUTO_PLAY_INTERVAL = 5000;

// ============================================================
// ✅ HELPER
// ============================================================
const getCurrentMascotIndex = (level) => {
  if (level >= 30) return 9;
  if (level >= 25) return 8;
  if (level >= 20) return 7;
  if (level >= 16) return 6;
  if (level >= 13) return 5;
  if (level >= 10) return 4;
  if (level >= 7)  return 3;
  if (level >= 5)  return 2;
  if (level >= 3)  return 1;
  return 0;
};

// ============================================================
// 🔊 SOUND HELPER
// ============================================================
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

    setTimeout(() => {
      try { audioCtx.close(); } catch (e) {}
    }, 150);
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

    setTimeout(() => {
      try { audioCtx.close(); } catch (e) {}
    }, 500);
  } catch (e) {}
};

// ============================================================
// 🐐 MASCOT CAROUSEL COMPONENT
// ============================================================
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

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setPreviewIndex(currentMascotIndex);
  }, [currentMascotIndex]);

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
      setPreviewIndex((prev) => {
        const next = prev === MASCOT_STAGES.length - 1 ? 0 : prev + 1;
        return next;
      });
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

  const nextUnlockLevel = previewMascot.minLevel;
  const progressPercent = isLocked
    ? Math.min(100, Math.round((level / nextUnlockLevel) * 100))
    : 100;
  const levelsNeeded = Math.max(0, nextUnlockLevel - level);

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
      if (diff > 0) {
        goNext();
      } else {
        goPrev();
      }
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
          0%, 100% { box-shadow: 0 0 0 0 ${previewMascot.color}66, 0 8px 20px rgba(0,0,0,0.2); }
          50% { box-shadow: 0 0 0 16px ${previewMascot.color}00, 0 8px 20px rgba(0,0,0,0.2); }
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
        @keyframes lockedPulse {
          0%, 100% { opacity: 0.75; }
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

        .mascot-carousel-wrap { display: flex; align-items: center; gap: 12px; position: relative; }
        .mascot-arrow { width: 40px; height: 40px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.35); background: rgba(255,255,255,0.15); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); color: white; font-size: 22px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; flex-shrink: 0; font-family: 'Poppins', sans-serif; padding-bottom: 3px; user-select: none; }
        .mascot-arrow:hover { background: rgba(255,255,255,0.3); border-color: rgba(255,255,255,0.6); transform: scale(1.08); }
        .mascot-arrow:active { transform: scale(0.95); }
        .mascot-center-wrap { display: flex; flex-direction: column; align-items: center; gap: 8px; position: relative; }
        .mascot-swipe-area { position: relative; display: flex; align-items: center; justify-content: center; touch-action: pan-y; }
        .mascot-main-wrap { position: relative; display: flex; align-items: center; justify-content: center; animation: ${animated ? 'mascotBounce 3s ease-in-out infinite' : 'none'}; }
        .mascot-main-wrap.leveled-up { animation: levelUpBurst 1s ease-out; }
        .mascot-main-wrap.animating { animation: ${slideAnimation}; }
        .mascot-ring { position: relative; border-radius: 50%; padding: 6px; background: linear-gradient(135deg, ${previewMascot.color}, #fff, ${previewMascot.color}); animation: ${animated ? 'mascotGlow 3s ease-in-out infinite' : 'none'}; }
        .mascot-img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; object-position: center 20%; display: block; background: white; transition: filter 0.3s ease; }
        .mascot-img.locked { filter: grayscale(0.85) brightness(0.65); animation: lockedPulse 2.5s ease-in-out infinite; }
        .mascot-sparkle { position: absolute; font-size: 20px; animation: sparkleFloat 2s ease-in-out infinite; pointer-events: none; }
        .mascot-lock-badge { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 40px; z-index: 3; pointer-events: none; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.6)); }
        .mascot-badge { position: absolute; bottom: -10px; right: -12px; background: ${previewMascot.color}; color: white; font-size: 12px; font-weight: 700; padding: 5px 12px; border-radius: 14px; border: 2px solid white; box-shadow: 0 4px 12px ${previewMascot.color}88; white-space: nowrap; z-index: 5; }
        .mascot-badge.locked { background: #6B7280; box-shadow: 0 4px 12px rgba(107,114,128,0.5); }
        .mascot-dots { display: flex; gap: 5px; align-items: center; justify-content: center; margin-top: 4px; flex-wrap: wrap; max-width: 240px; }
        .mascot-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.35); cursor: pointer; transition: all 0.2s ease; border: none; padding: 0; }
        .mascot-dot:hover { transform: scale(1.3); background: rgba(255,255,255,0.7); }
        .mascot-dot.active { background: white; width: 20px; border-radius: 4px; }
        .mascot-dot.unlocked { background: ${previewMascot.color}; }
        .mascot-level-req { font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.85); text-align: center; text-shadow: 0 1px 4px rgba(0,0,0,0.4); white-space: nowrap; }
        .mascot-progress-track { width: 100%; max-width: 200px; height: 5px; background: rgba(255,255,255,0.2); border-radius: 999px; overflow: hidden; margin-top: 6px; }
        .mascot-progress-fill { height: 100%; background: linear-gradient(90deg, ${previewMascot.color}, ${previewMascot.color}CC); border-radius: 999px; transition: width 0.5s ease; box-shadow: 0 0 8px ${previewMascot.color}88; }
        .mascot-controls { display: flex; gap: 6px; align-items: center; justify-content: center; margin-top: 6px; }
        .mascot-ctrl-btn { padding: 4px 10px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: white; font-size: 10px; font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif; transition: all 0.2s ease; display: flex; align-items: center; gap: 4px; user-select: none; }
        .mascot-ctrl-btn:hover { background: rgba(255,255,255,0.25); border-color: rgba(255,255,255,0.5); }
        .mascot-ctrl-btn.active { background: rgba(255,255,255,0.35); border-color: white; }
        .mascot-unlock-toast { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 10000; background: linear-gradient(135deg, #FFD700, #FF9800); color: #1a1a1a; padding: 12px 24px; border-radius: 14px; font-size: 14px; font-weight: 700; box-shadow: 0 8px 32px rgba(255, 152, 0, 0.5); display: flex; align-items: center; gap: 10px; animation: toastSlideDown 0.4s ease-out; pointer-events: none; font-family: 'Poppins', sans-serif; }
        .mascot-unlock-toast .toast-emoji { font-size: 24px; }
        @media (max-width: 768px) {
          .mascot-arrow { width: 32px; height: 32px; font-size: 18px; }
          .mascot-carousel-wrap { gap: 6px; }
          .mascot-dot { width: 6px; height: 6px; }
          .mascot-dot.active { width: 14px; }
          .mascot-lock-badge { font-size: 30px; }
          .mascot-dots { max-width: 200px; gap: 4px; }
        }
      `}</style>

      {showUnlockToast && (
        <div className="mascot-unlock-toast">
          <span className="toast-emoji">🎉</span>
          <div>
            <div style={{ fontSize: '13px' }}>New Mascot Unlocked!</div>
            <div style={{ fontSize: '15px' }}>{showUnlockToast.stage}</div>
          </div>
        </div>
      )}

      <div className="mascot-carousel-wrap">
        <button className="mascot-arrow" onClick={goPrev} title="Previous goat" aria-label="Previous goat">‹</button>

        <div className="mascot-center-wrap" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
          <div className="mascot-swipe-area">
            <div className={`mascot-main-wrap ${justLeveledUp && isCurrent ? 'leveled-up' : ''} ${isAnimating ? 'animating' : ''}`}>
              <div className="mascot-ring" style={{ width: responsiveSize, height: responsiveSize }}>
                <img
                  src={previewMascot.image}
                  alt={previewMascot.stage}
                  className={`mascot-img ${isLocked ? 'locked' : ''}`}
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🐐</text></svg>';
                  }}
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

          {isLocked && (
            <div className="mascot-progress-track">
              <div className="mascot-progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          )}

          <div className="mascot-dots">
            {MASCOT_STAGES.map((m, idx) => {
              const dotUnlocked = level >= m.minLevel;
              return (
                <button
                  key={m.id}
                  className={`mascot-dot ${idx === previewIndex ? 'active' : ''} ${dotUnlocked ? 'unlocked' : ''}`}
                  onClick={() => goToIndex(idx)}
                  title={`${m.stage} (Level ${m.minLevel}+)`}
                  aria-label={`Go to ${m.stage}`}
                />
              );
            })}
          </div>

          <div className="mascot-controls">
            <button
              className={`mascot-ctrl-btn ${autoPlay ? 'active' : ''}`}
              onClick={() => {
                setAutoPlay(!autoPlay);
                if (soundEnabled) playClickSound();
              }}
              title={autoPlay ? 'Pause auto-play' : 'Auto-play'}
            >
              {autoPlay ? '⏸' : '▶'} Auto
            </button>
            <button
              className={`mascot-ctrl-btn ${soundEnabled ? 'active' : ''}`}
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute sounds' : 'Unmute sounds'}
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>
          </div>
        </div>

        <button className="mascot-arrow" onClick={goNext} title="Next goat" aria-label="Next goat">›</button>
      </div>
    </>
  );
};

export default MascotCarousel;