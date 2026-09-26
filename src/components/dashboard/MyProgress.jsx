// src/components/dashboard/MyProgress.jsx
import React, { useState, useEffect } from 'react';
import { useUserStats } from '../../hooks/useUserStats';
import { colors, fontFamily } from './dashboardStyles';
import { auth } from '../../pages/firebase';
import { onAuthStateChanged } from 'firebase/auth';

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

const BRAND_FONT_DISPLAY = "'Fredoka', sans-serif";
const BRAND_FONT_BODY = "'Nunito', sans-serif";

// ===== ICON BADGE =====
const IconBadge = ({ icon, bg, size = 40 }) => (
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
      fontSize: size * 0.5,
      lineHeight: 1
    }}
  >
    {icon}
  </div>
);

// ===== PILL BADGE =====
const Pill = ({ children }) => (
  <span
    style={{
      background: palette.warmOrange,
      color: '#fff',
      fontSize: '12px',
      fontWeight: 800,
      padding: '4px 12px',
      borderRadius: '999px',
      whiteSpace: 'nowrap',
      minWidth: '54px',
      textAlign: 'center',
      fontFamily: BRAND_FONT_DISPLAY,
      boxShadow: `0 2px 0 ${palette.warmOrangeShadow}`,
      letterSpacing: '0.02em'
    }}
  >
    {children}
  </span>
);

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

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
          background: palette.cream,
          fontFamily: BRAND_FONT_BODY
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: `4px solid ${palette.border}`,
              borderTop: `4px solid ${palette.warmOrange}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}
          />
          <p style={{ color: palette.bodyText, fontWeight: 600 }}>Loading your progress...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
          background: palette.cream,
          fontFamily: BRAND_FONT_BODY
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
              boxShadow: `0 4px 0 ${palette.warmOrangeShadow}`,
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!showContent) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
          background: palette.cream,
          fontFamily: BRAND_FONT_BODY
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: `4px solid ${palette.border}`,
              borderTop: `4px solid ${palette.warmOrange}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}
          />
          <p style={{ color: palette.bodyText, fontWeight: 600 }}>Preparing your progress...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const gameStatsData = progress.gameStats || {};

  // ===== GAME TYPES WITH IMAGES =====
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

  let totalCorrect = 0;
  let totalQuestions = 0;
  gameTypes.forEach(game => {
    totalCorrect += game.data.correctAnswers || 0;
    totalQuestions += game.data.totalQuestions || game.data.totalSentences || 0;
  });
  const overallAccuracy =
    totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const displayAccuracy = stats?.accuracy || overallAccuracy || 0;

  const level = stats?.level || 1;
  const xp = stats?.xp || 0;
  const xpToNext = stats?.xpToNext || 100;
  const totalPoints = stats?.totalPoints || 0;
  const gamesPlayed = stats?.gamesPlayed || 0;
  const streak = stats?.currentStreak || 0;
  const wordsLearned = stats?.wordsLearned || 0;
  const correctAnswers = stats?.correctAnswers || 0;

  const maxPlayed = 100;

  return (
    <div
      style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '20px 24px',
        fontFamily: BRAND_FONT_BODY,
        background: palette.cream,
        minHeight: '100vh',
        opacity: fadeIn ? 1 : 0,
        transform: fadeIn ? 'translateY(0)' : 'translateY(30px)',
        transition: 'opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {/* ===== TOP ROW ===== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '16px',
          marginBottom: '16px'
        }}
      >
        {/* Current Level */}
        <div
          style={{
            background: palette.white,
            borderRadius: '18px',
            padding: '18px 20px',
            border: `2px solid ${palette.border}`,
            boxShadow: '0 6px 18px rgba(244, 162, 97, 0.10)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <IconBadge icon="🎯" bg={palette.cream} />
            <span
              style={{
                fontSize: '13px',
                color: palette.bodyText,
                fontWeight: 700,
                fontFamily: BRAND_FONT_DISPLAY
              }}
            >
              Current Level
            </span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: palette.deepNavy, marginBottom: '10px', fontFamily: BRAND_FONT_DISPLAY }}>
            {level}
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: palette.bodyText,
              marginBottom: '4px',
              fontWeight: 700
            }}
          >
            <span>XP Progress</span>
            <span>{xp} / {xpToNext}</span>
          </div>
          <div
            style={{
              width: '100%',
              height: '8px',
              background: palette.cream,
              borderRadius: '10px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${Math.min((xp / xpToNext) * 100, 100)}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${palette.warmOrange} 0%, ${palette.coral} 100%)`,
                borderRadius: '10px',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>

        {/* Total Points */}
        <div
          style={{
            background: palette.white,
            borderRadius: '18px',
            padding: '18px 20px',
            border: `2px solid ${palette.border}`,
            boxShadow: '0 6px 18px rgba(244, 162, 97, 0.10)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <IconBadge icon="⭐" bg={palette.cream} />
            <span
              style={{
                fontSize: '13px',
                color: palette.bodyText,
                fontWeight: 700,
                fontFamily: BRAND_FONT_DISPLAY
              }}
            >
              Total Points
            </span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: palette.deepNavy, marginBottom: '10px', fontFamily: BRAND_FONT_DISPLAY }}>
            {totalPoints}
          </div>
          <div style={{ borderTop: `2px solid ${palette.border}`, paddingTop: '8px' }}>
            <span style={{ fontSize: '12px', color: palette.bodyText, fontWeight: 600 }}>
              • {gamesPlayed} games played
            </span>
          </div>
        </div>

        {/* Current Streak */}
        <div
          style={{
            background: palette.white,
            borderRadius: '18px',
            padding: '18px 20px',
            border: `2px solid ${palette.border}`,
            boxShadow: '0 6px 18px rgba(244, 162, 97, 0.10)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <IconBadge icon="🔥" bg={palette.cream} />
            <span
              style={{
                fontSize: '13px',
                color: palette.bodyText,
                fontWeight: 700,
                fontFamily: BRAND_FONT_DISPLAY
              }}
            >
              Current Streak
            </span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: palette.deepNavy, marginBottom: '10px', fontFamily: BRAND_FONT_DISPLAY }}>
            {streak}
          </div>
          <div style={{ borderTop: `2px solid ${palette.border}`, paddingTop: '8px' }}>
            <span style={{ fontSize: '12px', color: palette.bodyText, fontWeight: 600 }}>
              🔥 {streak} days in a row
            </span>
          </div>
        </div>
      </div>

      {/* ===== 4 STAT CARDS ===== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          marginBottom: '20px'
        }}
      >
        {[
          { icon: '📚', bg: palette.cream, value: wordsLearned, label: 'Words Learned' },
          { icon: '✅', bg: palette.cream, value: `${displayAccuracy}%`, label: 'Accuracy' },
          { icon: '🎮', bg: palette.cream, value: gamesPlayed, label: 'Games Played' },
          { icon: '🏆', bg: palette.cream, value: correctAnswers, label: 'Correct Answers' }
        ].map((stat, index) => (
          <div
            key={index}
            style={{
              background: palette.white,
              borderRadius: '16px',
              padding: '14px 16px',
              border: `2px solid ${palette.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 4px 14px rgba(244, 162, 97, 0.08)'
            }}
          >
            <IconBadge icon={stat.icon} bg={stat.bg} size={38} />
            <div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  color: palette.deepNavy,
                  lineHeight: 1.1,
                  fontFamily: BRAND_FONT_DISPLAY
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: palette.bodyText,
                  fontWeight: 700
                }}
              >
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ===== GAME PERFORMANCE ===== */}
      <div
        style={{
          background: palette.white,
          borderRadius: '20px',
          padding: '20px 20px 8px',
          border: `2px solid ${palette.border}`,
          boxShadow: '0 6px 18px rgba(244, 162, 97, 0.10)'
        }}
      >
        <div
          style={{
            fontSize: '18px',
            fontWeight: 800,
            color: palette.deepNavy,
            marginBottom: '10px',
            fontFamily: BRAND_FONT_DISPLAY
          }}
        >
          Game Performance
        </div>

        {gameTypes.map((game, i) => {
          const gamesPlayedCount = game.data.gamesPlayed || 0;
          const barPct = Math.min((gamesPlayedCount / maxPlayed) * 100, 100);

          return (
            <div
              key={game.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '16px 0',
                borderBottom:
                  i !== gameTypes.length - 1 ? `2px solid ${palette.border}` : 'none'
              }}
            >
              <img
                src={game.image}
                alt={game.label}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  objectFit: 'cover',
                  flexShrink: 0
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />

              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: palette.deepNavy,
                  width: '130px',
                  flexShrink: 0,
                  fontFamily: BRAND_FONT_DISPLAY
                }}
              >
                {game.label}
              </span>

              <div
                style={{
                  flex: 1,
                  height: '10px',
                  background: palette.cream,
                  borderRadius: '10px',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: `${barPct}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${palette.warmOrange} 0%, ${palette.coral} 100%)`,
                    borderRadius: '10px',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>

              <Pill>{gamesPlayedCount} games</Pill>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyProgress;