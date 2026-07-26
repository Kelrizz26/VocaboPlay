// src/components/dashboard/MyProgress.jsx
import React, { useState, useEffect } from 'react';
import { useUserStats } from '../../hooks/useUserStats';
import { colors, fontFamily } from './dashboardStyles';

// ===== IMPORT IMAGES =====
import wordPicsImg from '../../image/Wordpics.png';
import quizGameImg from '../../image/quizgame.png';
import matchGameImg from '../../image/matchgame.png';
import guessWhatImg from '../../image/guesswhatgame.png';
import sentenceBuilderImg from '../../image/sentence.png';
import shortStoryImg from '../../image/shortstory.png';

// ===== ICON BADGE =====
const IconBadge = ({ icon, bg, size = 40 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '10px',
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
      background: colors.accent,
      color: '#fff',
      fontSize: '12px',
      fontWeight: 700,
      padding: '4px 10px',
      borderRadius: '999px',
      whiteSpace: 'nowrap',
      minWidth: '54px',
      textAlign: 'center'
    }}
  >
    {children}
  </span>
);

const MyProgress = () => {
  const userId = localStorage.getItem('userId');
  const { stats, loading, error } = useUserStats(userId);
  const [fadeIn, setFadeIn] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // ✅ PARA MA-FORCE RENDER

  const [progress, setProgress] = useState({
    wordsLearned: 0,
    accuracy: 0,
    gamesPlayed: 0,
    correctAnswers: 0,
    gameStats: {}
  });

  // ✅ PAG MAY DATA NA
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
          // sentenceBuilder uses "totalSentences" instead of "totalQuestions"
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
  }, [stats, refreshKey]); // ✅ DINAGDAGAN KO NG refreshKey

  // ✅ PAG TAPOS NA MAG-LOAD PERO WALANG DATA
  useEffect(() => {
    if (!loading && !stats) {
      setShowContent(true);
      setTimeout(() => {
        setFadeIn(true);
      }, 50);
    }
  }, [loading, stats]);

  // ✅ AUTO REFRESH EVERY 3 SECONDS - ITO LANG ANG BAGONG CODE
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // ✅ LOADING STATE
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
          background: colors.bg,
          fontFamily
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: `4px solid ${colors.border}`,
              borderTop: `4px solid ${colors.accent}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}
          />
          <p style={{ color: colors.textSecondary }}>Loading your progress...</p>
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

  // ✅ ERROR STATE
  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
          background: colors.bg,
          fontFamily
        }}
      >
        <div style={{ textAlign: 'center', color: colors.danger }}>
          <p>Error loading data: {error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '16px',
              padding: '10px 20px',
              background: colors.accent,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ✅ KUNG WALA PANG DATA
  if (!showContent) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
          background: colors.bg,
          fontFamily
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: `4px solid ${colors.border}`,
              borderTop: `4px solid ${colors.accent}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}
          />
          <p style={{ color: colors.textSecondary }}>Preparing your progress...</p>
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
  // ✅ FIXED: keys must match the actual field names inside Firestore's gameStats map
  const gameTypes = [
    {
      key: 'wordPics',
      label: 'Word Pics',
      image: wordPicsImg,
      data: gameStatsData.wordPics || { gamesPlayed: 0, correctAnswers: 0, totalQuestions: 0 }
    },
    {
      key: 'quizMaster',
      label: 'Quiz Master',
      image: quizGameImg,
      data: gameStatsData.quizMaster || { gamesPlayed: 0, correctAnswers: 0, totalQuestions: 0 }
    },
    {
      key: 'matchGame',
      label: 'Match Game',
      image: matchGameImg,
      data: gameStatsData.matchGame || { gamesPlayed: 0, correctAnswers: 0, totalQuestions: 0 }
    },
    {
      key: 'guessWhat',
      label: 'GuessWhat',
      image: guessWhatImg,
      data: gameStatsData.guessWhat || { gamesPlayed: 0, correctAnswers: 0, totalQuestions: 0 }
    },
    {
      key: 'sentenceBuilder',
      label: 'Sentence Builder',
      image: sentenceBuilderImg,
      data: gameStatsData.sentenceBuilder || { gamesPlayed: 0, correctAnswers: 0, totalSentences: 0 }
    },
    {
      key: 'shortStory',
      label: 'Short Story',
      image: shortStoryImg,
      data: gameStatsData.shortStory || { gamesPlayed: 0, correctAnswers: 0, totalQuestions: 0 }
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

  // ✅ Maximum na 100 games
  const maxPlayed = 100;

  return (
    <div
      style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '20px 24px',
        fontFamily,
        background: colors.bg,
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
            background: colors.surface,
            borderRadius: '14px',
            padding: '18px 20px',
            border: `1px solid ${colors.border}`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <IconBadge icon="🎯" bg="#FDECEA" />
            <span
              style={{
                fontSize: '13px',
                color: colors.textSecondary,
                fontWeight: 500
              }}
            >
              Current Level
            </span>
          </div>
          <div style={{ fontSize: '30px', fontWeight: 800, color: colors.textPrimary, marginBottom: '10px' }}>
            {level}
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: colors.textSecondary,
              marginBottom: '4px'
            }}
          >
            <span>XP Progress</span>
            <span>{xp} / {xpToNext}</span>
          </div>
          <div
            style={{
              width: '100%',
              height: '6px',
              background: colors.bg,
              borderRadius: '10px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${Math.min((xp / xpToNext) * 100, 100)}%`,
                height: '100%',
                background: colors.accent,
                borderRadius: '10px',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>

        {/* Total Points */}
        <div
          style={{
            background: colors.surface,
            borderRadius: '14px',
            padding: '18px 20px',
            border: `1px solid ${colors.border}`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <IconBadge icon="⭐" bg="#FFF6DB" />
            <span
              style={{
                fontSize: '13px',
                color: colors.textSecondary,
                fontWeight: 500
              }}
            >
              Total Points
            </span>
          </div>
          <div style={{ fontSize: '30px', fontWeight: 800, color: colors.textPrimary, marginBottom: '10px' }}>
            {totalPoints}
          </div>
          <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '8px' }}>
            <span style={{ fontSize: '12px', color: colors.textSecondary }}>
              • {gamesPlayed} games played
            </span>
          </div>
        </div>

        {/* Current Streak */}
        <div
          style={{
            background: colors.surface,
            borderRadius: '14px',
            padding: '18px 20px',
            border: `1px solid ${colors.border}`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <IconBadge icon="🔥" bg="#FFEDE0" />
            <span
              style={{
                fontSize: '13px',
                color: colors.textSecondary,
                fontWeight: 500
              }}
            >
              Current Streak
            </span>
          </div>
          <div style={{ fontSize: '30px', fontWeight: 800, color: colors.textPrimary, marginBottom: '10px' }}>
            {streak}
          </div>
          <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '8px' }}>
            <span style={{ fontSize: '12px', color: colors.textSecondary }}>
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
          gap: '10px',
          marginBottom: '20px'
        }}
      >
        {[
          { icon: '📚', bg: '#E9EEFF', value: wordsLearned, label: 'Words Learned' },
          { icon: '✅', bg: '#E3F8EA', value: `${displayAccuracy}%`, label: 'Accuracy' },
          { icon: '🎮', bg: '#F1E9FF', value: gamesPlayed, label: 'Games Played' },
          { icon: '🏆', bg: '#FFF3DA', value: correctAnswers, label: 'Correct Answers' }
        ].map((stat, index) => (
          <div
            key={index}
            style={{
              background: colors.surface,
              borderRadius: '12px',
              padding: '14px 16px',
              border: `1px solid ${colors.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <IconBadge icon={stat.icon} bg={stat.bg} size={38} />
            <div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: colors.textPrimary,
                  lineHeight: 1.1
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: colors.textSecondary,
                  fontWeight: 500
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
          background: colors.surface,
          borderRadius: '12px',
          padding: '18px 20px 8px',
          border: `1px solid ${colors.border}`
        }}
      >
        <div
          style={{
            fontSize: '16px',
            fontWeight: 700,
            color: colors.textPrimary,
            marginBottom: '10px'
          }}
        >
          Game Performance
        </div>

        {gameTypes.map((game, i) => {
          // ✅ FIXED: Firestore field is "gamesPlayed", not "played"
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
                  i !== gameTypes.length - 1 ? `1px solid ${colors.border}` : 'none'
              }}
            >
              {/* image */}
              <img
                src={game.image}
                alt={game.label}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '10px',
                  objectFit: 'cover',
                  flexShrink: 0
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />

              {/* label */}
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: colors.textPrimary,
                  width: '130px',
                  flexShrink: 0
                }}
              >
                {game.label}
              </span>

              {/* bar */}
              <div
                style={{
                  flex: 1,
                  height: '8px',
                  background: colors.bg,
                  borderRadius: '10px',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: `${barPct}%`,
                    height: '100%',
                    background: colors.accent,
                    borderRadius: '10px',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>

              {/* pill count */}
              <Pill>{gamesPlayedCount} games</Pill>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyProgress;