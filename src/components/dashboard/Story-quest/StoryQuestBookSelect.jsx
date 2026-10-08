// src/components/dashboard/Story-quest/StoryQuestBookSelect.jsx
// 🗺️ ADVENTURE MAP + Talking Video Character
// ✅ Background music: starts muted (auto-plays), unmutes sa first user click
// ✅ Welcome modal shows on Dashboard entry, hides when returning from level
// ✅ Full character visible (objectFit: contain)
// ✅ ADDED: classNames para ma-target ng landscape CSS

import React, { useState, useEffect, useRef } from 'react';

const FONT_DISPLAY = "'Fredoka', sans-serif";
const FONT_BODY = "'Nunito', sans-serif";

const MAP_BG = '/image/storyquest-bg.png';
const MAP_ASPECT = 2017 / 780;

const WELCOME_VIDEO = '/video/welcome.mp4';
const MAP_BGM = '/audio/map-bg.mp3';

const speakFallback = () => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(
    "Welcome to StoryQuest! Choose your adventure, and let the magic begin!"
  );
  utt.rate = 1.0;
  utt.pitch = 1.6;
  utt.lang = 'en-US';
  setTimeout(() => window.speechSynthesis.speak(utt), 300);
};

const LEVELS = [
  { level: 'A1', title: "Tom's First Day at School", left: '13%', top: '63%' },
  { level: 'A2', title: "The Lost Kitten",           left: '30%', top: '30%' },
  { level: 'B1', title: "The Secret Garden",         left: '43%', top: '72%' },
  { level: 'B2', title: "The Time Traveler's Diary", left: '55%', top: '30%' },
  { level: 'C1', title: "The Pianist's Farewell",    left: '65%', top: '72%' },
  { level: 'C2', title: "The Architect of Dreams",   left: '87%', top: '30%' },
];

const StoryQuestBookSelect = ({
  onSelectBook,
  onBack,
  completedLevels = [],
  localDiamonds = 0,
  localPoints = 0,
  lives = 5,
  maxLives = 5,
  timeRemaining = '',
  onOpenHeartShop,
  skipWelcome = false,
  onWelcomeShown,
}) => {
  const [showWelcome, setShowWelcome] = useState(!skipWelcome);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isMusicMuted, setIsMusicMuted] = useState(true);
  const hasPlayedRef = useRef(false);
  const hasUnmutedRef = useRef(false);
  const videoRef = useRef(null);
  const bgMusicRef = useRef(null);

  useEffect(() => {
    if (skipWelcome && showWelcome) {
      setShowWelcome(false);
    }
  }, [skipWelcome]);

  useEffect(() => {
    const audio = new Audio(MAP_BGM);
    audio.loop = true;
    audio.volume = 0.35;
    audio.muted = true;
    bgMusicRef.current = audio;

    audio.play().then(() => {
      console.log('✅ Map BGM started (muted)');
    }).catch((err) => {
      console.warn('⚠️ Map BGM play failed:', err);
    });

    const unmuteMusic = () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.muted = false;
        if (bgMusicRef.current.paused) {
          bgMusicRef.current.play().catch(() => {});
        }
        setIsMusicMuted(false);
        console.log('🔊 Map BGM unmuted');
      }
      window.removeEventListener('click', unmuteMusic);
      window.removeEventListener('keydown', unmuteMusic);
      window.removeEventListener('touchstart', unmuteMusic);
    };

    window.addEventListener('click', unmuteMusic);
    window.addEventListener('keydown', unmuteMusic);
    window.addEventListener('touchstart', unmuteMusic);

    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current.currentTime = 0;
        bgMusicRef.current = null;
      }
      window.removeEventListener('click', unmuteMusic);
      window.removeEventListener('keydown', unmuteMusic);
      window.removeEventListener('touchstart', unmuteMusic);
    };
  }, []);

  useEffect(() => {
    if (bgMusicRef.current) {
      bgMusicRef.current.muted = isMusicMuted;
      if (!isMusicMuted && bgMusicRef.current.paused) {
        bgMusicRef.current.play().catch(() => {});
      }
    }
  }, [isMusicMuted]);

  const playVideoMuted = () => {
    if (!videoRef.current || videoError) {
      speakFallback();
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 5000);
      return;
    }
    try {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch((err) => {
        console.warn('Autoplay blocked:', err);
      });
    } catch (err) {
      console.warn('Video error:', err);
    }
  };

  const playVideoWithAudio = () => {
    if (!videoRef.current || videoError) {
      speakFallback();
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 5000);
      return;
    }
    try {
      setIsMuted(false);
      videoRef.current.muted = false;
      videoRef.current.volume = 1.0;
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch((err) => {
        console.warn('Play with audio blocked:', err);
        speakFallback();
        setIsSpeaking(true);
        setTimeout(() => setIsSpeaking(false), 5000);
      });
    } catch (err) {
      console.warn('Video error:', err);
      speakFallback();
    }
  };

  useEffect(() => {
    if (!showWelcome || hasPlayedRef.current) return;
    hasPlayedRef.current = true;

    const timer = setTimeout(() => {
      playVideoMuted();
    }, 400);

    return () => {
      clearTimeout(timer);
      if (videoRef.current) videoRef.current.pause();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, [showWelcome]);

  useEffect(() => {
    if (!showWelcome) return;

    const handleFirstInteraction = () => {
      if (hasUnmutedRef.current) return;
      hasUnmutedRef.current = true;
      playVideoWithAudio();
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [showWelcome]);

  const handleStartPlay = () => {
    if (videoRef.current) videoRef.current.pause();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setShowWelcome(false);
    if (onWelcomeShown) onWelcomeShown();
  };

  const handleReplayVoice = (e) => {
    e.stopPropagation();
    hasUnmutedRef.current = true;
    playVideoWithAudio();
  };

  const handleHeartsClick = () => {
    if (lives <= 0 && onOpenHeartShop) {
      onOpenHeartShop();
    }
  };

  const handleToggleMusic = () => {
    setIsMusicMuted((prev) => !prev);
  };

  const isUnlocked = (level) => {
    if (level === 'A1') return true;
    const idx = LEVELS.findIndex(l => l.level === level);
    if (idx <= 0) return true;
    return completedLevels.includes(LEVELS[idx - 1].level);
  };

  const isCompleted = (level) => completedLevels.includes(level);

  const currentNode = (() => {
    for (const lvl of LEVELS) {
      if (!completedLevels.includes(lvl.level) && isUnlocked(lvl.level)) return lvl.level;
    }
    return LEVELS[LEVELS.length - 1].level;
  })();

  const noLives = lives <= 0;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      fontFamily: FONT_BODY,
      background: '#0F172A',
    }}>

      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, #87CEEB 0%, #B0E0E6 22%, #A8D07B 78%, #6BA84F 100%)',
      }} />

      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: `min(100vw, calc(100vh * ${MAP_ASPECT}))`,
        height: `min(100vh, calc(100vw / ${MAP_ASPECT}))`,
        backgroundImage: `url(${MAP_BG})`,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
        filter: showWelcome ? 'blur(6px) brightness(0.75)' : 'none',
        transition: 'filter 0.4s ease',
      }}>
        {LEVELS.map((lvl, i) => {
          const unlocked = isUnlocked(lvl.level);
          const completed = isCompleted(lvl.level);
          const isCurrent = lvl.level === currentNode && unlocked && !completed;

          return (
            <div
              key={lvl.level}
              style={{
                position: 'absolute',
                left: lvl.left,
                top: lvl.top,
                transform: 'translate(-50%, -50%)',
                animation: `floatNode 3.2s ease-in-out ${i * 0.35}s infinite`,
                zIndex: 20,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                willChange: 'transform',
                pointerEvents: showWelcome ? 'none' : 'auto',
              }}
            >
              {isCurrent && (
                <div style={{
                  position: 'absolute', top: '50%', left: '50%',
                  width: '100px', height: '100px',
                  marginLeft: '-50px', marginTop: '-50px',
                  borderRadius: '50%', border: '3px solid #FFD700',
                  animation: 'pulseRing 1.8s ease-out infinite',
                  pointerEvents: 'none', zIndex: -1,
                }} />
              )}

              <button
                onClick={() => unlocked && onSelectBook(lvl.level)}
                disabled={!unlocked}
                style={{
                  position: 'relative', width: '82px', height: '74px',
                  border: 'none', background: 'transparent',
                  cursor: unlocked ? 'pointer' : 'not-allowed',
                  padding: 0, transition: 'transform 0.12s ease',
                  filter: unlocked ? 'none' : 'grayscale(0.7) brightness(0.7)',
                }}
              >
                <div style={{
                  position: 'absolute', inset: 0,
                  background: unlocked
                    ? 'linear-gradient(180deg, #B8824A 0%, #8B5A2B 45%, #6B4423 100%)'
                    : 'linear-gradient(180deg, #6B6B6B 0%, #4A4A4A 45%, #333 100%)',
                  borderRadius: '9px',
                  border: `3px solid ${unlocked ? '#5C3A1E' : '#2A2A2A'}`,
                  boxShadow: unlocked
                    ? '0 4px 0 #4A2E15, 0 6px 14px rgba(0,0,0,0.4), inset 0 2px 3px rgba(255,255,255,0.18)'
                    : '0 4px 0 #1A1A1A, 0 6px 14px rgba(0,0,0,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', inset: '3px', borderRadius: '6px',
                    background: unlocked
                      ? 'radial-gradient(ellipse at top, rgba(255,215,0,0.22), transparent 60%)'
                      : 'none',
                    pointerEvents: 'none',
                  }} />
                  <div style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: '0px',
                    position: 'relative', zIndex: 2,
                  }}>
                    <div style={{
                      fontSize: '7px', fontWeight: '900',
                      color: unlocked ? '#FFE082' : '#B0B0B0',
                      fontFamily: FONT_DISPLAY, letterSpacing: '1px',
                      textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                    }}>CEFR</div>
                    <div style={{
                      fontSize: '23px', fontWeight: '900',
                      color: unlocked ? '#FFFFFF' : '#D0D0D0',
                      fontFamily: FONT_DISPLAY, lineHeight: 1,
                      textShadow: '0 2px 3px rgba(0,0,0,0.5), 0 0 8px rgba(255,215,0,0.3)',
                    }}>{lvl.level}</div>
                  </div>
                  {!unlocked && (
                    <div style={{
                      position: 'absolute', top: '3px', right: '3px', fontSize: '13px',
                    }}>🔒</div>
                  )}
                  {completed && (
                    <div style={{
                      position: 'absolute', top: '-5px', right: '-5px',
                      width: '22px', height: '22px', borderRadius: '50%',
                      background: '#22C55E',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', color: 'white',
                      border: '2px solid #FFFFFF', fontWeight: '900',
                    }}>✓</div>
                  )}
                </div>
                <div style={{
                  position: 'absolute', bottom: '-9px', left: '50%',
                  transform: 'translateX(-50%)', fontSize: '16px',
                  filter: unlocked
                    ? 'drop-shadow(0 0 6px rgba(255,215,0,0.9))'
                    : 'grayscale(1) opacity(0.6)',
                  zIndex: 3,
                }}>⭐</div>
              </button>

              <div style={{
                marginTop: '18px', padding: '2px 7px',
                background: unlocked ? 'rgba(255,255,255,0.94)' : 'rgba(210,210,210,0.88)',
                borderRadius: '6px',
                border: `1.5px solid ${unlocked ? '#8B5A2B' : '#666'}`,
                fontSize: '8px', fontWeight: '800',
                fontFamily: FONT_DISPLAY,
                color: unlocked ? '#8B5A2B' : '#555',
                textAlign: 'center', maxWidth: '130px',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{lvl.title}</div>

              {isCurrent && (
                <div style={{
                  marginTop: '3px', fontSize: '8px', fontWeight: '900',
                  color: '#FFFFFF', fontFamily: FONT_DISPLAY,
                  background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
                  padding: '2px 8px', borderRadius: '5px',
                  animation: 'pulse 1.2s ease-in-out infinite',
                  whiteSpace: 'nowrap',
                }}>▶ PLAY NOW</div>
              )}
            </div>
          );
        })}
      </div>

      {/* TOP HUD */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        padding: '12px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 100, pointerEvents: 'none',
        opacity: showWelcome ? 0 : 1,
        transition: 'opacity 0.35s ease',
      }}>
        <button
          onClick={onBack}
          style={{
            padding: '10px 20px',
            background: 'rgba(255,255,255,0.94)',
            border: '2px solid rgba(139,90,43,0.35)',
            borderRadius: '12px',
            fontSize: '13px', fontWeight: '800',
            cursor: 'pointer', fontFamily: FONT_DISPLAY,
            color: '#8B5A2B', boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
            pointerEvents: 'auto',
          }}
        >← Back</button>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', pointerEvents: 'auto' }}>
          <button
            onClick={handleToggleMusic}
            style={{
              padding: '8px 14px',
              background: 'rgba(255,255,255,0.94)',
              border: '2px solid rgba(139,90,43,0.35)',
              borderRadius: '12px',
              fontSize: '14px', fontWeight: '800',
              cursor: 'pointer', fontFamily: FONT_DISPLAY,
              color: '#8B5A2B', boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
              pointerEvents: 'auto',
            }}
            title={isMusicMuted ? 'Unmute music' : 'Mute music'}
          >
            {isMusicMuted ? '🔇' : '🔊'}
          </button>

          <div style={{
            padding: '8px 16px', background: 'rgba(255,255,255,0.94)',
            borderRadius: '12px', border: '2px solid rgba(212, 175, 55, 0.55)',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <span style={{ fontSize: '16px' }}>💰</span>
            <span style={{
              fontSize: '15px', fontWeight: '800', color: '#B8860B',
              fontFamily: FONT_DISPLAY,
            }}>{localPoints}</span>
          </div>

          <div style={{
            padding: '8px 16px', background: 'rgba(255,255,255,0.94)',
            borderRadius: '12px', border: '2px solid rgba(93,173,226,0.45)',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <span style={{ fontSize: '16px' }}>💎</span>
            <span style={{
              fontSize: '15px', fontWeight: '800', color: '#3D8BBF',
              fontFamily: FONT_DISPLAY,
            }}>{localDiamonds}</span>
          </div>

          <div
            onClick={handleHeartsClick}
            style={{
              padding: '8px 16px',
              background: noLives ? 'linear-gradient(135deg, #FEF2F2, #FECACA)' : 'rgba(255,255,255,0.94)',
              borderRadius: '12px',
              border: noLives ? '2px solid #EF4444' : '2px solid rgba(220,38,38,0.35)',
              display: 'flex', alignItems: 'center', gap: '6px',
              cursor: noLives ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
              boxShadow: noLives
                ? '0 0 0 3px rgba(239, 68, 68, 0.2), 0 4px 12px rgba(239, 68, 68, 0.3)'
                : 'none',
              animation: noLives ? 'heartPulse 1.5s ease-in-out infinite' : 'none',
              position: 'relative',
            }}
            title={noLives ? 'Click to buy hearts with diamonds' : `${lives}/${maxLives} hearts`}
          >
            <span style={{ fontSize: '14px', fontWeight: '800', color: '#DC2626' }}>
              ❤️ {lives}/{maxLives}
            </span>
            {lives < maxLives && timeRemaining && !noLives && (
              <span style={{ fontSize: '10px', color: '#F59E0B', fontWeight: '700' }}>
                ⏳ {timeRemaining}
              </span>
            )}
            {noLives && (
              <span style={{
                fontSize: '10px', color: '#FFFFFF', fontWeight: '900',
                background: '#EF4444', padding: '2px 8px', borderRadius: '6px',
                fontFamily: FONT_DISPLAY, letterSpacing: '0.5px',
                animation: 'pulse 1.2s ease-in-out infinite',
              }}>
                BUY 💎
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ===== WELCOME MODAL WITH VIDEO ===== */}
      {showWelcome && (
        <div
          className="sq-welcome-overlay"
          style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 500, animation: 'fadeIn 0.35s ease',
          }}
        >
          <div
            className="sq-welcome-card"
            style={{
              position: 'relative',
              width: 'min(440px, 92vw)',
              background: 'linear-gradient(180deg, #FCD34D 0%, #F59E0B 60%, #EA580C 100%)',
              borderRadius: '24px',
              padding: '24px 22px 22px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 4px 8px rgba(255,255,255,0.35)',
              border: '4px solid #B45309',
              animation: 'popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              textAlign: 'center',
            }}
          >
            <div style={{ position: 'absolute', top: '-12px', left: '12%', fontSize: '20px', animation: 'bounceConfetti 2s infinite' }}>✨</div>
            <div style={{ position: 'absolute', top: '-10px', right: '15%', fontSize: '18px', animation: 'bounceConfetti 2.2s infinite 0.3s' }}>🎉</div>
            <div style={{ position: 'absolute', bottom: '-8px', left: '18%', fontSize: '16px', animation: 'bounceConfetti 2.4s infinite 0.6s' }}>⭐</div>
            <div style={{ position: 'absolute', bottom: '-8px', right: '14%', fontSize: '16px', animation: 'bounceConfetti 2.6s infinite 0.9s' }}>💫</div>

            <h2
              className="sq-welcome-title"
              style={{
                fontSize: '26px', fontWeight: '900', color: '#FFFFFF',
                fontFamily: FONT_DISPLAY, margin: '4px 0 16px 0',
                textShadow: '0 3px 6px rgba(0,0,0,0.35), 0 0 20px rgba(255,255,255,0.3)',
                letterSpacing: '-0.5px',
              }}
            >Start Adventure!</h2>

            <div
              className="sq-welcome-image"
              onClick={handleReplayVoice}
              style={{
                width: '180px', height: '180px',
                margin: '0 auto 16px',
                borderRadius: '50%',
                background: '#FFFFFF',
                border: '5px solid #FFFFFF',
                boxShadow: isSpeaking
                  ? '0 8px 32px rgba(255,215,0,0.5), 0 0 40px rgba(255,215,0,0.3)'
                  : '0 8px 24px rgba(0,0,0,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', position: 'relative',
                transition: 'box-shadow 0.3s ease',
                cursor: 'pointer',
              }}
            >
              <div style={{ position: 'absolute', top: '12px', left: '18px', fontSize: '10px', opacity: 0.8, animation: 'twinkle 1.5s infinite', zIndex: 2, color: '#F59E0B' }}>✦</div>
              <div style={{ position: 'absolute', top: '28px', right: '22px', fontSize: '8px', opacity: 0.7, animation: 'twinkle 1.8s infinite 0.3s', zIndex: 2, color: '#F59E0B' }}>✦</div>
              <div style={{ position: 'absolute', bottom: '18px', left: '26px', fontSize: '8px', opacity: 0.7, animation: 'twinkle 2s infinite 0.6s', zIndex: 2, color: '#F59E0B' }}>✦</div>
              <div style={{ position: 'absolute', bottom: '24px', right: '18px', fontSize: '10px', opacity: 0.8, animation: 'twinkle 2.2s infinite 0.9s', zIndex: 2, color: '#F59E0B' }}>✦</div>

              {!videoError ? (
                <video
                  ref={videoRef}
                  src={WELCOME_VIDEO}
                  playsInline
                  muted={isMuted}
                  loop
                  onPlay={() => setIsSpeaking(true)}
                  onPause={() => setIsSpeaking(false)}
                  onError={() => {
                    console.warn('Video not found, using TTS fallback');
                    setVideoError(true);
                  }}
                  style={{
                    width: '100%', height: '100%',
                    objectFit: 'contain',
                    display: 'block', background: 'transparent',
                  }}
                />
              ) : (
                <div style={{
                  fontSize: '90px',
                  animation: isSpeaking
                    ? 'talkingMascot 0.4s ease-in-out infinite'
                    : 'idleBounce 2s ease-in-out infinite',
                }}>👸</div>
              )}
            </div>

            {isSpeaking && !videoError && (
              <div
                className="sq-welcome-badge"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '4px 12px', background: 'rgba(255,255,255,0.25)',
                  borderRadius: '12px', marginBottom: '12px',
                  animation: 'fadeInOut 1.5s ease-in-out infinite',
                }}
              >
                <span style={{
                  display: 'inline-block', width: '7px', height: '7px',
                  background: '#FFFFFF', borderRadius: '50%',
                  animation: 'speakingDot 0.6s ease-in-out infinite',
                }} />
                <span style={{
                  fontSize: '11px', fontWeight: '800',
                  color: '#FFFFFF', fontFamily: FONT_DISPLAY,
                  letterSpacing: '0.5px',
                }}>{isMuted ? 'Tap to hear me! 👆' : 'Speaking...'}</span>
              </div>
            )}

            <p
              className="sq-welcome-text"
              style={{
                fontSize: '14px', fontWeight: '800', color: '#FFFFFF',
                fontFamily: FONT_DISPLAY,
                margin: (isSpeaking && !videoError) ? '0 0 20px 0' : '12px 0 20px 0',
                lineHeight: 1.4, textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              Welcome to StoryQuest!<br />
              Choose your adventure below! 👇
            </p>

            <button
              className="sq-welcome-start"
              onClick={handleStartPlay}
              style={{
                width: '100%', padding: '16px 24px',
                background: 'linear-gradient(135deg, #EC4899 0%, #A855F7 100%)',
                color: 'white',
                border: '3px solid #FFFFFF',
                borderRadius: '16px',
                fontSize: '17px', fontWeight: '900',
                fontFamily: FONT_DISPLAY, cursor: 'pointer',
                letterSpacing: '0.8px',
                boxShadow: '0 6px 0 #86198F, 0 10px 24px rgba(168, 85, 247, 0.5)',
                transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                textTransform: 'uppercase',
                animation: 'pulseButton 2s ease-in-out infinite',
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translateY(4px)';
                e.currentTarget.style.boxShadow = '0 2px 0 #86198F, 0 4px 12px rgba(168, 85, 247, 0.5)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 0 #86198F, 0 10px 24px rgba(168, 85, 247, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 0 #86198F, 0 10px 24px rgba(168, 85, 247, 0.5)';
              }}
            >
              ▶ Start Play
            </button>

            <button
              className="sq-welcome-replay"
              onClick={handleReplayVoice}
              style={{
                marginTop: '10px', padding: '6px 14px',
                background: 'transparent', border: 'none',
                color: 'rgba(255,255,255,0.85)',
                fontSize: '11px', fontWeight: '700',
                fontFamily: FONT_DISPLAY, cursor: 'pointer',
                textDecoration: 'underline', letterSpacing: '0.3px',
              }}
            >
              🔊 Play voice again
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes floatNode {
          0%, 100% { transform: translate(-50%, -50%) translateY(0); }
          50% { transform: translate(-50%, -50%) translateY(-8px); }
        }
        @keyframes pulseRing {
          0% { transform: scale(0.75); opacity: 0.9; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn {
          0% { transform: scale(0.6); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes bounceConfetti {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(8deg); }
        }
        @keyframes talkingMascot {
          0%, 100% { transform: translateY(0) scale(1) rotate(0deg); }
          25% { transform: translateY(-4px) scale(1.04) rotate(-2deg); }
          50% { transform: translateY(0) scale(0.98) rotate(0deg); }
          75% { transform: translateY(-3px) scale(1.03) rotate(2deg); }
        }
        @keyframes idleBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-5px) scale(1.02); }
        }
        @keyframes speakingDot {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes fadeInOut {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes pulseButton {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        @keyframes heartPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
      `}</style>
    </div>
  );
};

export default StoryQuestBookSelect;