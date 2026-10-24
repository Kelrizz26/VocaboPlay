// src/components/dashboard/LivePlayerResults.jsx
// ============================================================
// ✅ STUDENT RESULTS - FULL SIZE
// ✅ UPDATED: Sariling result lang, may Exit Button agad
// ============================================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { subscribeToSession, calculateRankings } from '../../services/LiveGameService';

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
  shadow: 'rgba(42, 40, 69, 0.06)',
  shadowMd: 'rgba(42, 40, 69, 0.10)',
};

const BRAND_FONT_DISPLAY = "'Fredoka', sans-serif";
const BRAND_FONT_BODY = "'Nunito', sans-serif";

const getCorrectCount = (player) => {
  return player?.correctAnswers || player?.correct || 0;
};

const LivePlayerResults = ({ session: initialSession, playerId, onExit }) => {
  const [session, setSession] = useState(initialSession);

  useEffect(() => {
    if (!initialSession?.sessionId) return;
    const unsubscribe = subscribeToSession(initialSession.sessionId, (data) => {
      setSession(data);
    });
    return () => unsubscribe();
  }, [initialSession?.sessionId]);

  const players = session?.players || [];
  const rankedPlayers = calculateRankings(players);
  const myPlayer = rankedPlayers.find(p => p.userId === playerId);
  const myRank = myPlayer?.rank || 0;
  const totalPlayers = rankedPlayers.length;

  const getMedal = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankMessage = (rank, total) => {
    if (rank === 1) return 'Champion! 🏆';
    if (rank === 2) return 'So close! 🎉';
    if (rank === 3) return 'Podium finish! 🎊';
    if (rank <= total * 0.5) return 'Great job! 👏';
    return 'Good effort! 💪';
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        
        {/* ✅ BAGONG DAGDAG: Malinaw na tapos na si student */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '10px' }}
        >
          <h2 style={{ color: palette.white, fontFamily: BRAND_FONT_DISPLAY, fontSize: 'clamp(20px, 2.5vw, 28px)', textShadow: '0 2px 4px rgba(0,0,0,0.3)', margin: 0 }}>
            You have completed the quiz!
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontFamily: BRAND_FONT_BODY, fontSize: 'clamp(14px, 1.5vw, 18px)', marginTop: '8px' }}>
            You may now exit or wait for the teacher.
          </p>
        </motion.div>

        {/* My Result Card - DARK NAVY */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          style={styles.myResultCard}
        >
          <div style={styles.medalBig}>{getMedal(myRank)}</div>
          <h1 style={styles.rankMessage}>{getRankMessage(myRank, totalPlayers)}</h1>
          <p style={styles.rankText}>You ranked #{myRank} out of {totalPlayers}</p>

          {/* FULL BODY AVATAR */}
          <div style={styles.myAvatarWrapper}>
            {myPlayer?.avatarImage ? (
              <img
                src={myPlayer.avatarImage}
                alt={myPlayer.name}
                style={styles.myAvatarImg}
              />
            ) : (
              <span style={styles.myAvatarEmoji}>👤</span>
            )}
          </div>

          <h2 style={styles.myName}>{myPlayer?.name || 'You'}</h2>

          <div style={styles.myStats}>
            <div style={styles.statBox}>
              <div style={styles.statValue}>{getCorrectCount(myPlayer)}</div>
              <div style={styles.statLabel}>Points</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statValue}>
                {getCorrectCount(myPlayer)}/{session?.totalQuestions || 0}
              </div>
              <div style={styles.statLabel}>Correct</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statValue}>
                {session?.totalQuestions > 0
                  ? Math.round((getCorrectCount(myPlayer) / session.totalQuestions) * 100)
                  : 0}%
              </div>
              <div style={styles.statLabel}>Accuracy</div>
            </div>
          </div>
        </motion.div>

        {/* Exit Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onExit}
          style={styles.exitBtn}
        >
          🏠 Back to Dashboard
        </motion.button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    width: '100vw',
    backgroundImage: `url('/image/quiz-bg.png')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    backgroundRepeat: 'no-repeat',
    padding: 'clamp(16px, 3vw, 40px)',
    fontFamily: BRAND_FONT_BODY,
    color: palette.white,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
  },
  content: {
    width: '100%',
    maxWidth: 'min(800px, 100%)', 
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(16px, 2vw, 28px)',
  },
  myResultCard: {
    background: palette.deepNavy,
    borderRadius: '28px',
    padding: 'clamp(28px, 4vw, 56px) clamp(20px, 4vw, 60px)',
    textAlign: 'center',
    width: '100%',
    border: `1.5px solid ${palette.deepNavyLight}`,
    borderTop: `6px solid ${palette.warmOrange}`,
    boxShadow: `0 12px 32px rgba(0,0,0,0.25)`,
  },
  medalBig: {
    fontSize: 'clamp(64px, 9vw, 110px)',
    marginBottom: '12px',
    filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
  },
  rankMessage: {
    fontSize: 'clamp(26px, 3.6vw, 44px)',
    fontWeight: '800',
    margin: '0 0 8px 0',
    fontFamily: BRAND_FONT_DISPLAY,
    color: palette.white,
    letterSpacing: '-0.5px',
  },
  rankText: {
    fontSize: 'clamp(14px, 1.6vw, 20px)',
    color: palette.bodyTextSoft,
    margin: '0 0 28px 0',
    fontWeight: 700,
    fontFamily: BRAND_FONT_BODY,
  },
  myAvatarWrapper: {
    width: 'clamp(110px, 15vw, 140px)',
    height: 'clamp(130px, 18vw, 170px)',
    borderRadius: '24px',
    background: palette.creamSoft,
    overflow: 'hidden',
    margin: '0 auto 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `3px solid ${palette.warmOrange}80`,
    boxShadow: `0 8px 24px rgba(0,0,0,0.3)`,
  },
  myAvatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    padding: '8px',
  },
  myAvatarEmoji: {
    fontSize: 'clamp(52px, 7vw, 80px)',
  },
  myName: {
    fontSize: 'clamp(22px, 2.6vw, 32px)',
    fontWeight: '800',
    margin: '0 0 24px 0',
    fontFamily: BRAND_FONT_DISPLAY,
    color: palette.white,
  },
  myStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 'clamp(10px, 1.6vw, 20px)',
  },
  statBox: {
    background: palette.deepNavyLight,
    borderRadius: '16px',
    padding: 'clamp(14px, 1.8vw, 22px) clamp(10px, 1.5vw, 18px)',
    border: `1.5px solid #4A476B`,
    boxShadow: `0 4px 12px rgba(0,0,0,0.2)`,
  },
  statValue: {
    fontSize: 'clamp(22px, 2.8vw, 34px)',
    fontWeight: '800',
    color: palette.gold,
    fontFamily: BRAND_FONT_DISPLAY,
  },
  statLabel: {
    fontSize: 'clamp(10px, 1.2vw, 14px)',
    color: palette.bodyTextSoft,
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontFamily: BRAND_FONT_DISPLAY,
    marginTop: '4px',
  },
  exitBtn: {
    padding: 'clamp(14px, 1.8vw, 20px) clamp(30px, 4vw, 60px)',
    background: palette.warmOrange,
    color: palette.white,
    border: 'none',
    borderRadius: '16px',
    fontSize: 'clamp(15px, 1.6vw, 20px)',
    fontWeight: '800',
    cursor: 'pointer',
    fontFamily: BRAND_FONT_DISPLAY,
    transition: 'all 0.2s',
    boxShadow: `0 4px 0 ${palette.warmOrangeShadow}, 0 8px 24px rgba(0,0,0,0.2)`,
    letterSpacing: '0.5px',
    alignSelf: 'center',
    width: '100%',
    maxWidth: '480px',
  },
};

export default LivePlayerResults;