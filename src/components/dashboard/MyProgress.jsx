// src/components/dashboard/MyProgress.jsx
// ✅ NEW: Clickable stats → Words Learned, Games Played, Total Points
// ✅ FIXED: Words modal — uses `stats.progress.learnedWords` (correct path)
// ✅ UPDATED: Removed "Correct Answers", made stat cards into 3 columns
// ✅ NEW: Game Performance bar resets every 100 games (100/200, 200/300, ... 900/1000)
// ✅ NEW: Listens to `demo-overrides` window event from the DEV/DEMO PANEL

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStats } from '../../hooks/useUserStats';
import { colors, fontFamily } from './dashboardStyles';
import { auth, db } from '../../pages/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

// ===== MUTED GAME UI PALETTE (soft, not too bright) =====
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
  shadow: 'rgba(42, 40, 69, 0.06)',
  shadowMd: 'rgba(42, 40, 69, 0.10)',
};

const BRAND_FONT_DISPLAY = "'Fredoka', sans-serif";
const BRAND_FONT_BODY = "'Nunito', sans-serif";

// ===== DUOTONE SVG ICONS =====
const Icon = ({ name, size = 20, color = palette.bodyText, secondaryColor = `${palette.bodyText}55` }) => {
  const icons = {
    target: (
      <>
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none"/>
        <circle cx="12" cy="12" r="6" stroke={secondaryColor} strokeWidth="2" fill="none"/>
        <circle cx="12" cy="12" r="2" stroke={color} strokeWidth="2" fill="none"/>
      </>
    ),
    star: (
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    ),
    flame: (
      <path d="M12 2s4 6 4 10a4 4 0 11-8 0c0-2 1-3.5 2-5 0 2 1 3 2 3 0-2-1-5 0-8z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    ),
    book: (
      <>
        <path d="M4 4h11a3 3 0 013 3v13H7a3 3 0 00-3 3V4z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M4 4v16" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      </>
    ),
    check: (
      <>
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none"/>
        <path d="M8 12l3 3 5-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    game: (
      <>
        <path d="M6 12h4m-2-2v4m6-4h.01M17 12h.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M8 20h8a4 4 0 004-4V8a4 4 0 00-4-4H8a4 4 0 00-4 4v8a4 4 0 004 4z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    trophy: (
      <>
        <path d="M6 4h12v4a6 6 0 01-12 0V4z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M6 8H4a2 2 0 002 2M18 8h2a2 2 0 01-2 2M9 18h6M10 21h4M12 14v4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    close: (
      <path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    ),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', flexShrink: 0 }}>
      {icons[name] || icons.target}
    </svg>
  );
};

// ===== ICON BADGE (3D-style, muted) =====
const IconBadge = ({ icon, bg, iconColor = palette.bodyText, size = 40 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '12px',
      background: bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      border: `1.5px solid ${palette.border}`,
      boxShadow: `0 2px 0 ${palette.border}`,
    }}
  >
    <Icon name={icon} size={Math.round(size * 0.5)} color={iconColor} />
  </div>
);

// ===== PILL BADGE (muted warm orange) =====
const Pill = ({ children }) => (
  <span
    style={{
      background: palette.warmOrange,
      color: '#fff',
      fontSize: '11px',
      fontWeight: 800,
      padding: '4px 12px',
      borderRadius: '999px',
      whiteSpace: 'nowrap',
      minWidth: '60px',
      textAlign: 'center',
      fontFamily: BRAND_FONT_DISPLAY,
      boxShadow: `0 2px 0 ${palette.warmOrangeShadow}`,
      letterSpacing: '0.02em',
    }}
  >
    {children}
  </span>
);

// ============================================================
// ✅ Modal Container (reusable)
// ============================================================
const Modal = ({ isOpen, onClose, title, subtitle, children }) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(42, 40, 69, 0.55)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 22 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: palette.white,
          borderRadius: '20px',
          padding: '24px',
          maxWidth: '640px',
          width: '100%',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          border: `1.5px solid ${palette.border}`,
          boxShadow: '0 20px 50px rgba(42, 40, 69, 0.3)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '18px' }}>
          <div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 800,
              color: palette.deepNavy,
              margin: 0,
              fontFamily: BRAND_FONT_DISPLAY,
              letterSpacing: '-0.3px',
            }}>
              {title}
            </h3>
            {subtitle && (
              <p style={{
                fontSize: '12px',
                color: palette.bodyTextSoft,
                margin: '4px 0 0 0',
                fontWeight: 600,
              }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: palette.creamSoft,
              border: `1.5px solid ${palette.border}`,
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon name="close" size={16} color={palette.bodyText} />
          </button>
        </div>

        {/* Content (scrollable) */}
        <div style={{ overflowY: 'auto', flex: 1, margin: '0 -4px', padding: '0 4px' }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
};

const MyProgress = () => {
  const [userId, setUserId] = useState(localStorage.getItem('userId'));

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        console.log('✅ MyProgress: Using auth uid:', user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const { stats, loading, error } = useUserStats(userId);
  const [fadeIn, setFadeIn] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [progress, setProgress] = useState({
    wordsLearned: 0,
    accuracy: 0,
    gamesPlayed: 0,
    correctAnswers: 0,
    gameStats: {}
  });

  // ✅ Modal state
  const [activeModal, setActiveModal] = useState(null); // 'words' | 'games' | 'points' | null
  const [learnedWords, setLearnedWords] = useState([]);
  const [gameHistory, setGameHistory] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // 🧪 DEMO overrides — driven by DEV/DEMO PANEL via window event
  const [demoOverrides, setDemoOverrides] = useState({
    level: '',
    xp: '',
    xpToNext: '',
    games: {}, // { synoQuest: '250', matchGame: '', ... }
  });

  // 🧪 Listen sa events galing sa DEV/DEMO PANEL
  useEffect(() => {
    const handler = (e) => {
      if (e.detail) {
        setDemoOverrides((prev) => ({ ...prev, ...e.detail }));
      }
    };
    window.addEventListener('demo-overrides', handler);
    return () => window.removeEventListener('demo-overrides', handler);
  }, []);

  useEffect(() => {
    if (stats) {
      const gameStats = stats.gameStats || {};

      let totalGames = 0;
      let totalCorrect = 0;
      let totalQuestions = 0;

      Object.values(gameStats).forEach(game => {
        if (game && typeof game === 'object') {
          totalGames += game.gamesPlayed || 0;
          totalCorrect += game.correctAnswers || 0;
          totalQuestions += game.totalQuestions || game.totalSentences || 0;
        }
      });

      const accuracy =
        totalQuestions > 0
          ? Math.round((totalCorrect / totalQuestions) * 100)
          : 0;

      setProgress({
        wordsLearned: stats.wordsLearned || 0,
        accuracy: stats.accuracy || accuracy,
        gamesPlayed: stats.gamesPlayed || totalGames,
        correctAnswers: stats.correctAnswers || totalCorrect,
        gameStats: gameStats
      });

      setShowContent(true);
      setTimeout(() => {
        setFadeIn(true);
      }, 50);
    }
  }, [stats, refreshKey]);

  useEffect(() => {
    if (!loading && !stats) {
      setShowContent(true);
      setTimeout(() => {
        setFadeIn(true);
      }, 50);
    }
  }, [loading, stats]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // ============================================================
  // ✅ Fetch details when modal opens
  // ✅ FIXED: Words modal — use `stats.progress.learnedWords`
  // ============================================================
  useEffect(() => {
    const fetchDetails = async () => {
      if (!activeModal || !userId) return;
      setLoadingDetails(true);

      try {
        if (activeModal === 'words') {
          // ✅ FIXED: Correct path — it's in `stats.progress.learnedWords`
          const words =
            stats?.progress?.learnedWords ||        // ✅ This is the correct one (nested in progress)
            stats?.progress?.learnedWordsList ||    // ✅ Alternative
            stats?.learnedWords ||                   // Fallback (top-level)
            [];
          console.log('📚 MyProgress: Fetching learned words:', words.length, 'words');
          setLearnedWords(Array.isArray(words) ? words : []);
        } else if (activeModal === 'games' || activeModal === 'points') {
          // ✅ Fetch game history from the `scores` collection
          const scoresQuery = query(
            collection(db, 'scores'),
            where('studentId', '==', userId)
          );
          const scoresSnap = await getDocs(scoresQuery);
          const activities = scoresSnap.docs.map(d => ({ id: d.id, ...d.data() }));

          activities.sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0));
          setGameHistory(activities);
        }
      } catch (err) {
        console.error('Error fetching details:', err);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [activeModal, userId, stats]);

  // ============================================================
  // ✅ Compute high scores per game
  // ============================================================
  const highScores = React.useMemo(() => {
    if (!gameHistory.length) return [];
    const map = {};

    gameHistory.forEach((entry) => {
      const key = entry.gameType || entry.activityType || 'Game';
      const gameTypeLower = String(key).toLowerCase();
      const correct = entry.correctAnswers || 0;
      const total = entry.totalQuestions || 0;
      const score = entry.score || correct; // 1 correct = 1 point

      if (!map[gameTypeLower]) {
        map[gameTypeLower] = {
          gameType: key,
          bestScore: score,
          bestCorrect: correct,
          bestTotal: total,
          timesPlayed: 0,
          bestDate: entry.completedAt,
        };
      } else {
        if (score > map[gameTypeLower].bestScore) {
          map[gameTypeLower].bestScore = score;
          map[gameTypeLower].bestCorrect = correct;
          map[gameTypeLower].bestTotal = total;
          map[gameTypeLower].bestDate = entry.completedAt;
        }
      }
      map[gameTypeLower].timesPlayed += 1;
    });

    return Object.values(map);
  }, [gameHistory]);

  // ✅ Game label helper
  const getGameLabel = (gameType) => {
    const key = String(gameType).toLowerCase();
    return {
      'quiz': 'Quiz Master',
      'match': 'Match Game',
      'wordpics': 'SynoQuest',
      'synoquest': 'SynoQuest',
      'guesswhat': 'GuessWhat',
      'short-story': 'Story Quest',
      'story-quest': 'Story Quest',
    }[key] || 'Game';
  };

  const getGameImage = (gameType) => {
    const key = String(gameType).toLowerCase();
    return {
      'quiz': '/image/quizgame.png',
      'match': '/image/matchgame.png',
      'wordpics': '/image/wordpics.png',
      'synoquest': '/image/wordpics.png',
      'guesswhat': '/image/guesswhatgame.png',
      'short-story': '/image/shortstory.png',
      'story-quest': '/image/shortstory.png',
    }[key] || null;
  };

  // ===== LOADING =====
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
          background: palette.cream,
          fontFamily: BRAND_FONT_BODY,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: `3px solid ${palette.border}`,
              borderTop: `3px solid ${palette.warmOrange}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}
          />
          <p style={{ color: palette.bodyText, fontWeight: 600 }}>Loading your progress...</p>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ===== ERROR =====
  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
          background: palette.cream,
          fontFamily: BRAND_FONT_BODY,
        }}
      >
        <div style={{ textAlign: 'center', color: palette.coral }}>
          <p style={{ fontWeight: 700 }}>Error loading data: {error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '16px',
              padding: '10px 20px',
              background: palette.warmOrange,
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 800,
              fontFamily: BRAND_FONT_DISPLAY,
              boxShadow: `0 3px 0 ${palette.warmOrangeShadow}`,
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ===== PREPARING =====
  if (!showContent) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
          background: palette.cream,
          fontFamily: BRAND_FONT_BODY,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: `3px solid ${palette.border}`,
              borderTop: `3px solid ${palette.warmOrange}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}
          />
          <p style={{ color: palette.bodyText, fontWeight: 600 }}>Preparing your progress...</p>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const gameStatsData = progress.gameStats || {};

  const gameTypes = [
    {
      key: 'synoQuest',
      label: 'Syno Quest',
      image: '/image/wordpics.png',
      data: gameStatsData.synoQuest || { gamesPlayed: 0, correctAnswers: 0, totalQuestions: 0 }
    },
    {
      key: 'matchGame',
      label: 'Match Game',
      image: '/image/matchgame.png',
      data: gameStatsData.matchGame || { gamesPlayed: 0, correctAnswers: 0, totalQuestions: 0 }
    },
    {
      key: 'shortStory',
      label: 'Short Story',
      image: '/image/shortstory.png',
      data: gameStatsData.shortStory || { gamesPlayed: 0, correctAnswers: 0, totalQuestions: 0 }
    },
    {
      key: 'quizMaster',
      label: 'Quiz Master',
      image: '/image/quizgame.png',
      data: gameStatsData.quizMaster || { gamesPlayed: 0, correctAnswers: 0, totalQuestions: 0 }
    },
    {
      key: 'guessWhat',
      label: 'GuessWhat',
      image: '/image/guesswhatgame.png',
      data: gameStatsData.guessWhat || { gamesPlayed: 0, correctAnswers: 0, totalQuestions: 0 }
    },
    {
      key: 'sentenceBuilder',
      label: 'Sentence Builder',
      image: '/image/sentence.png',
      data: gameStatsData.sentenceBuilder || { gamesPlayed: 0, correctAnswers: 0, totalSentences: 0 }
    }
  ];

  // 🧪 DEMO: apply per-game overrides
  const gameTypesFinal = gameTypes.map((g) => {
    const override = demoOverrides.games[g.key];
    if (override !== undefined && override !== '') {
      return {
        ...g,
        data: { ...g.data, gamesPlayed: Math.max(0, Number(override) || 0) },
      };
    }
    return g;
  });

  let totalCorrect = 0;
  let totalQuestions = 0;
  gameTypes.forEach(game => {
    totalCorrect += game.data.correctAnswers || 0;
    totalQuestions += game.data.totalQuestions || game.data.totalSentences || 0;
  });
  const overallAccuracy =
    totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const displayAccuracy = stats?.accuracy || overallAccuracy || 0;

  // 🧪 DEMO: apply XP overrides if set, otherwise use real stats
  const level = demoOverrides.level !== '' ? Number(demoOverrides.level) : (stats?.level || 1);
  const xp = demoOverrides.xp !== '' ? Number(demoOverrides.xp) : (stats?.xp || 0);
  const xpToNext = demoOverrides.xpToNext !== '' ? Number(demoOverrides.xpToNext) : (stats?.xpToNext || 100);

  const totalPoints = stats?.totalPoints || 0;
  const gamesPlayed = stats?.gamesPlayed || 0;
  const streak = stats?.currentStreak || 0;
  const wordsLearned = stats?.wordsLearned || 0;
  const correctAnswers = stats?.correctAnswers || 0;

  return (
    <div
      className="myprogress-container"
      style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '0',
        fontFamily: BRAND_FONT_BODY,
        background: 'transparent',
        opacity: fadeIn ? 1 : 0,
        transform: fadeIn ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {/* ===== HEADER ===== */}
      <div style={{
        marginBottom: '22px',
        borderBottom: `1.5px solid ${palette.border}`,
        paddingBottom: '16px',
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '800',
          color: palette.deepNavy,
          margin: '0 0 4px 0',
          fontFamily: BRAND_FONT_DISPLAY,
          letterSpacing: '-0.5px',
        }}>
          My Progress
        </h1>
        <p style={{
          fontSize: '13px',
          color: palette.bodyTextSoft,
          margin: 0,
          fontWeight: 600,
        }}>
          Track your learning journey and celebrate your achievements
        </p>
      </div>

      {/* ===== LOCAL RESPONSIVE STYLES ===== */}
      <style>{`
        @media (max-width: 768px) {
          .myprogress-top-row { grid-template-columns: 1fr !important; }
          .myprogress-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .myprogress-container { padding: 0 !important; }
        }
        @media (max-width: 400px) {
          .myprogress-stats-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .game-perf-row { flex-wrap: wrap !important; gap: 10px !important; }
          .game-perf-label { width: 100% !important; order: -1; font-size: 13px !important; }
          .game-perf-bar { flex: 1 1 100% !important; order: 1; }
          .game-perf-pill { order: 2; }
        }
        .progress-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .progress-card:hover {
          transform: translateY(-3px);
          border-color: ${palette.warmOrange}50 !important;
          box-shadow: 0 8px 22px ${palette.shadowMd} !important;
        }
        /* ✅ NEW: Clickable cards */
        .progress-card-clickable {
          cursor: pointer;
        }
        .progress-card-clickable:hover {
          transform: translateY(-4px) !important;
          border-color: ${palette.warmOrange} !important;
          box-shadow: 0 10px 26px ${palette.shadowMd} !important;
        }
        .progress-card-clickable:active {
          transform: translateY(-1px) !important;
        }
        .progress-card-clickable .click-hint {
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .progress-card-clickable:hover .click-hint {
          opacity: 1;
        }
      `}</style>

      {/* ===== TOP ROW (3 CARDS) ===== */}
      <div
        className="myprogress-top-row"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '14px',
          marginBottom: '14px',
        }}
      >
        {/* Current Level */}
        <div
          className="progress-card"
          style={{
            background: palette.white,
            borderRadius: '14px',
            padding: '18px 20px',
            border: `1.5px solid ${palette.border}`,
            boxShadow: `0 2px 0 ${palette.border}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <IconBadge icon="target" bg={palette.creamSoft} iconColor={palette.warmOrange} size={38} />
            <span
              style={{
                fontSize: '12px',
                color: palette.bodyTextSoft,
                fontWeight: 800,
                fontFamily: BRAND_FONT_DISPLAY,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Current Level
            </span>
          </div>
          <div style={{
            fontSize: '32px',
            fontWeight: 800,
            color: palette.deepNavy,
            marginBottom: '10px',
            fontFamily: BRAND_FONT_DISPLAY,
            lineHeight: 1,
          }}>
            {level}
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '10px',
              color: palette.bodyTextSoft,
              marginBottom: '6px',
              fontWeight: 800,
              fontFamily: BRAND_FONT_DISPLAY,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            <span>XP Progress</span>
            <span>{xp} / {xpToNext}</span>
          </div>
          <div
            style={{
              width: '100%',
              height: '8px',
              background: palette.creamSoft,
              borderRadius: '10px',
              overflow: 'hidden',
              border: `1px solid ${palette.border}`,
            }}
          >
            <div
              style={{
                width: `${Math.min((xp / xpToNext) * 100, 100)}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${palette.warmOrange} 0%, ${palette.coral} 100%)`,
                borderRadius: '10px',
                transition: 'width 0.5s ease',
              }}
            />
          </div>
        </div>

        {/* Total Points — ✅ CLICKABLE */}
        <div
          className="progress-card progress-card-clickable"
          onClick={() => setActiveModal('points')}
          title="Click to see high scores per game"
          style={{
            background: palette.white,
            borderRadius: '14px',
            padding: '18px 20px',
            border: `1.5px solid ${palette.border}`,
            boxShadow: `0 2px 0 ${palette.border}`,
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <IconBadge icon="star" bg={palette.creamSoft} iconColor="#d4af37" size={38} />
            <span
              style={{
                fontSize: '12px',
                color: palette.bodyTextSoft,
                fontWeight: 800,
                fontFamily: BRAND_FONT_DISPLAY,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Total Points
            </span>
          </div>
          <div style={{
            fontSize: '32px',
            fontWeight: 800,
            color: palette.deepNavy,
            marginBottom: '10px',
            fontFamily: BRAND_FONT_DISPLAY,
            lineHeight: 1,
          }}>
            {totalPoints.toLocaleString()}
          </div>
          <div style={{ borderTop: `1.5px solid ${palette.borderSoft}`, paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: palette.bodyTextSoft, fontWeight: 700, fontFamily: BRAND_FONT_BODY }}>
              • {gamesPlayed} {gamesPlayed === 1 ? 'game' : 'games'} played
            </span>
            <span className="click-hint" style={{ fontSize: '10px', color: palette.warmOrange, fontWeight: 800, fontFamily: BRAND_FONT_DISPLAY }}>
              View high scores →
            </span>
          </div>
        </div>

        {/* Current Streak */}
        <div
          className="progress-card"
          style={{
            background: palette.white,
            borderRadius: '14px',
            padding: '18px 20px',
            border: `1.5px solid ${palette.border}`,
            boxShadow: `0 2px 0 ${palette.border}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <IconBadge icon="flame" bg={palette.creamSoft} iconColor={palette.coral} size={38} />
            <span
              style={{
                fontSize: '12px',
                color: palette.bodyTextSoft,
                fontWeight: 800,
                fontFamily: BRAND_FONT_DISPLAY,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Current Streak
            </span>
          </div>
          <div style={{
            fontSize: '32px',
            fontWeight: 800,
            color: palette.deepNavy,
            marginBottom: '10px',
            fontFamily: BRAND_FONT_DISPLAY,
            lineHeight: 1,
          }}>
            {streak}
          </div>
          <div style={{ borderTop: `1.5px solid ${palette.borderSoft}`, paddingTop: '8px' }}>
            <span style={{ fontSize: '11px', color: palette.bodyTextSoft, fontWeight: 700, fontFamily: BRAND_FONT_BODY }}>
              • {streak === 1 ? '1 day in a row' : `${streak} days in a row`}
            </span>
          </div>
        </div>
      </div>

      {/* ===== 3 STAT CARDS — Words Learned, Accuracy, Games Played ===== */}
      <div
        className="myprogress-stats-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '14px',
          marginBottom: '20px',
        }}
      >
        {[
          { icon: 'book', bg: palette.creamSoft, iconColor: palette.warmOrange, value: wordsLearned, label: 'Words Learned', clickable: 'words' },
          { icon: 'check', bg: palette.creamSoft, iconColor: palette.softGreen, value: `${displayAccuracy}%`, label: 'Accuracy', clickable: null },
          { icon: 'game', bg: palette.creamSoft, iconColor: palette.teal, value: gamesPlayed, label: 'Games Played', clickable: 'games' }
        ].map((stat, index) => {
          const isClickable = stat.clickable !== null;
          return (
            <div
              key={index}
              className={`progress-card ${isClickable ? 'progress-card-clickable' : ''}`}
              onClick={isClickable ? () => setActiveModal(stat.clickable) : undefined}
              title={
                stat.clickable === 'words' ? 'Click to see learned words'
                  : stat.clickable === 'games' ? 'Click to see game history'
                  : undefined
              }
              style={{
                background: palette.white,
                borderRadius: '14px',
                padding: '18px 20px',
                border: `1.5px solid ${palette.border}`,
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                boxShadow: `0 2px 0 ${palette.border}`,
                position: 'relative',
              }}
            >
              <IconBadge icon={stat.icon} bg={stat.bg} iconColor={stat.iconColor} size={44} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '26px',
                    fontWeight: 800,
                    color: palette.deepNavy,
                    lineHeight: 1.1,
                    fontFamily: BRAND_FONT_DISPLAY,
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: palette.bodyTextSoft,
                    fontWeight: 800,
                    fontFamily: BRAND_FONT_DISPLAY,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginTop: '3px',
                  }}
                >
                  {stat.label}
                </div>
                {isClickable && (
                  <span
                    className="click-hint"
                    style={{
                      fontSize: '10px',
                      color: palette.warmOrange,
                      fontWeight: 800,
                      fontFamily: BRAND_FONT_DISPLAY,
                      marginTop: '4px',
                      display: 'block',
                    }}
                  >
                    Tap to view →
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== GAME PERFORMANCE ===== */}
      <div
        style={{
          background: palette.white,
          borderRadius: '16px',
          padding: '20px 22px 8px',
          border: `1.5px solid ${palette.border}`,
          boxShadow: `0 2px 0 ${palette.border}`,
        }}
      >
        <div
          style={{
            fontSize: '15px',
            fontWeight: 800,
            color: palette.deepNavy,
            marginBottom: '14px',
            fontFamily: BRAND_FONT_DISPLAY,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Icon name="game" size={16} color={palette.warmOrange} />
          Game Performance
        </div>

        {gameTypesFinal.map((game, i) => {
          const gamesPlayedCount = game.data.gamesPlayed || 0;

          // ✅ Tier-based progress — resets every 100 games
          // 0-99 → X/100, 100-199 → X/200, 200-299 → X/300, ... 900-999 → X/1000
          const tierEnd = (Math.floor(gamesPlayedCount / 100) + 1) * 100;
          const barPct = gamesPlayedCount % 100;

          return (
            <div
              key={game.key}
              className="game-perf-row"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 0',
                borderBottom:
                  i !== gameTypesFinal.length - 1 ? `1.5px solid ${palette.borderSoft}` : 'none'
              }}
            >
              <img
                src={game.image}
                alt={game.label}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  objectFit: 'cover',
                  flexShrink: 0,
                  border: `1.5px solid ${palette.border}`,
                  background: palette.creamSoft,
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />

              <span
                className="game-perf-label"
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: palette.deepNavy,
                  width: '130px',
                  flexShrink: 0,
                  fontFamily: BRAND_FONT_DISPLAY,
                }}
              >
                {game.label}
              </span>

              <div
                className="game-perf-bar"
                style={{
                  flex: 1,
                  height: '8px',
                  background: palette.creamSoft,
                  borderRadius: '10px',
                  overflow: 'hidden',
                  minWidth: '80px',
                  border: `1px solid ${palette.border}`,
                }}
              >
                <div
                  style={{
                    width: `${barPct}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${palette.warmOrange} 0%, ${palette.coral} 100%)`,
                    borderRadius: '10px',
                    transition: 'width 0.5s ease'
                  }}
                />
              </div>

              <div className="game-perf-pill">
                <Pill>{gamesPlayedCount}/{tierEnd} games</Pill>
              </div>
            </div>
          );
        })}
      </div>

      {/* ============================================================
          ✅ MODALS
         ============================================================ */}

      {/* ✅ Words Learned Modal */}
      <Modal
        isOpen={activeModal === 'words'}
        onClose={() => setActiveModal(null)}
        title="📚 Words Learned"
        subtitle={`${learnedWords.length} ${learnedWords.length === 1 ? 'word' : 'words'} recorded`}
      >
        {loadingDetails ? (
          <LoadingSpinner />
        ) : learnedWords.length === 0 ? (
          <EmptyState
            emoji="📖"
            title="No words recorded yet"
            subtitle="Play games to start learning new vocabulary!"
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {learnedWords.map((word, i) => (
              <div
                key={i}
                style={{
                  padding: '12px 14px',
                  background: palette.creamSoft,
                  borderRadius: '10px',
                  border: `1.5px solid ${palette.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <span style={{ fontSize: '16px' }}>📖</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: palette.deepNavy, fontFamily: BRAND_FONT_BODY }}>
                  {typeof word === 'string' ? word : word.word || word.term || JSON.stringify(word)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* ✅ Games Played Modal */}
      <Modal
        isOpen={activeModal === 'games'}
        onClose={() => setActiveModal(null)}
        title="🎮 Game History"
        subtitle={`${gameHistory.length} ${gameHistory.length === 1 ? 'activity' : 'activities'} played`}
      >
        {loadingDetails ? (
          <LoadingSpinner />
        ) : gameHistory.length === 0 ? (
          <EmptyState
            emoji="🎮"
            title="No games played yet"
            subtitle="Start playing to build your history!"
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {gameHistory.map((entry, i) => {
              const date = entry.completedAt ? new Date(entry.completedAt) : null;
              const formattedDate = date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
              const formattedTime = date ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
              const img = getGameImage(entry.gameType || entry.activityType);
              const label = entry.activityTitle
                ? `${entry.activityTitle} · ${getGameLabel(entry.gameType)}`
                : getGameLabel(entry.gameType);
              const correct = entry.correctAnswers || 0;
              const total = entry.totalQuestions || 0;
              const pts = entry.score || correct;

              return (
                <div
                  key={entry.id || i}
                  style={{
                    padding: '12px 14px',
                    background: palette.creamSoft,
                    borderRadius: '12px',
                    border: `1.5px solid ${palette.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', overflow: 'hidden', background: palette.white, border: `1.5px solid ${palette.border}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {img ? (
                      <img src={img} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '18px' }}>🎮</span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: palette.deepNavy, fontFamily: BRAND_FONT_DISPLAY, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
                      {entry.source === 'teacher-pin' && (
                        <span style={{ fontSize: '9px', padding: '2px 6px', background: `${palette.warmOrange}22`, color: palette.warmOrange, borderRadius: '4px', fontWeight: 800 }}>
                          PIN
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '11px', color: palette.bodyTextSoft, marginTop: '2px', fontWeight: 600 }}>
                      {formattedDate}{formattedTime ? ` · ${formattedTime}` : ''}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: palette.warmOrange, fontFamily: BRAND_FONT_DISPLAY }}>
                      +{pts} pts
                    </div>
                    {total > 0 && (
                      <div style={{ fontSize: '10px', color: palette.bodyTextSoft, marginTop: '2px', fontWeight: 700 }}>
                        {correct}/{total}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal>

      {/* ✅ Total Points / High Scores Modal */}
      <Modal
        isOpen={activeModal === 'points'}
        onClose={() => setActiveModal(null)}
        title="🏆 High Scores Per Game"
        subtitle="Your best score in each game"
      >
        {loadingDetails ? (
          <LoadingSpinner />
        ) : highScores.length === 0 ? (
          <EmptyState
            emoji="🏆"
            title="No high scores yet"
            subtitle="Play games to set your personal bests!"
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {highScores.map((entry, i) => {
              const img = getGameImage(entry.gameType);
              const label = getGameLabel(entry.gameType);
              const accuracy = entry.bestTotal > 0 ? Math.round((entry.bestCorrect / entry.bestTotal) * 100) : 0;
              const date = entry.bestDate ? new Date(entry.bestDate) : null;
              const formattedDate = date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

              return (
                <div
                  key={entry.gameType || i}
                  style={{
                    padding: '14px 16px',
                    background: palette.creamSoft,
                    borderRadius: '12px',
                    border: `1.5px solid ${palette.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                  }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', overflow: 'hidden', background: palette.white, border: `1.5px solid ${palette.border}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {img ? (
                      <img src={img} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '22px' }}>🎮</span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: palette.deepNavy, fontFamily: BRAND_FONT_DISPLAY }}>
                      {label}
                    </div>
                    <div style={{ fontSize: '11px', color: palette.bodyTextSoft, marginTop: '2px', fontWeight: 600 }}>
                      Played {entry.timesPlayed}× · Best: {entry.bestCorrect}/{entry.bestTotal} ({accuracy}%)
                    </div>
                    {formattedDate && (
                      <div style={{ fontSize: '10px', color: palette.bodyTextSoft, marginTop: '1px' }}>
                        {formattedDate}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: palette.warmOrange, fontFamily: BRAND_FONT_DISPLAY, lineHeight: 1 }}>
                      {entry.bestScore}
                    </div>
                    <div style={{ fontSize: '10px', color: palette.bodyTextSoft, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '3px' }}>
                      Best pts
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </div>
  );
};

// ============================================================
// ✅ Helper Components
// ============================================================
const LoadingSpinner = () => (
  <div style={{ textAlign: 'center', padding: '40px 0' }}>
    <div
      style={{
        width: '32px',
        height: '32px',
        border: `3px solid ${palette.border}`,
        borderTop: `3px solid ${palette.warmOrange}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 12px',
      }}
    />
    <p style={{ fontSize: '13px', color: palette.bodyTextSoft, fontWeight: 600 }}>Loading...</p>
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
  </div>
);

const EmptyState = ({ emoji, title, subtitle }) => (
  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
    <div style={{ fontSize: '48px', marginBottom: '12px' }}>{emoji}</div>
    <p style={{ fontSize: '15px', fontWeight: 700, color: palette.deepNavy, margin: '0 0 4px 0', fontFamily: BRAND_FONT_DISPLAY }}>
      {title}
    </p>
    <p style={{ fontSize: '13px', color: palette.bodyTextSoft, margin: 0, fontWeight: 600 }}>
      {subtitle}
    </p>
  </div>
);

export default MyProgress;