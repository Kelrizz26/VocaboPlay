// src/components/dashboard/LivePlayerResults.jsx
// ============================================================
// ✅ STUDENT RESULTS - FULL SIZE
// ============================================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { subscribeToSession, calculateRankings } from '../../services/LiveGameService';

// ===== MUTED DASHBOARD PALETTE (matches Avatar Shop) =====
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
        {/* My Result Card - FULL WIDTH */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          style={styles.myResultCard}
        >
          <div style={styles.medalBig}>{getMedal(myRank)}</div>
          <h1 style={styles.rankMessage}>{getRankMessage(myRank, totalPlayers)}</h1>
          <p style={styles.rankText}>You ranked #{myRank} out of {totalPlayers}</p>

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
              <div style={styles.statValue}>{myPlayer?.score || 0}</div>
              <div style={styles.statLabel}>Points</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statValue}>
                {myPlayer?.correctAnswers || 0}/{session?.totalQuestions || 0}
              </div>
              <div style={styles.statLabel}>Correct</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statValue}>
                {session?.totalQuestions > 0
                  ? Math.round(((myPlayer?.correctAnswers || 0) / session.totalQuestions) * 100)
                  : 0}%
              </div>
              <div style={styles.statLabel}>Accuracy</div>
            </div>
          </div>
        </motion.div>

        {/* Top 3 - FULL WIDTH */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={styles.topSection}
        >
          <h2 style={styles.sectionTitle}>🏆 Top Players</h2>
          <div style={styles.topList}>
            {rankedPlayers.slice(0, 3).map((player, index) => (
              <div
                key={player.userId}
                style={{
                  ...styles.topItem,
                  ...(player.userId === playerId ? styles.topItemMe : {})
                }}
              >
                <div style={styles.topRank}>{getMedal(player.rank)}</div>
                <div style={styles.topAvatarWrapper}>
                  {player.avatarImage ? (
                    <img
                      src={player.avatarImage}
                      alt={player.name}
                      style={styles.topAvatarImg}
                    />
                  ) : (
                    <span style={styles.topAvatarEmoji}>👤</span>
                  )}
                </div>
                <div style={styles.topName}>
                  {player.name}
                  {player.userId === playerId && <span style={styles.youTag}> (You)</span>}
                </div>
                <div style={styles.topScore}>{player.score} pts</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Exit Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
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
    background: palette.cream,
    padding: 'clamp(16px, 3vw, 40px)',
    fontFamily: BRAND_FONT_BODY,
    color: palette.deepNavy,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
  },
  content: {
    width: '100%',
    maxWidth: 'min(1100px, 100%)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(16px, 2vw, 28px)',
  },
  myResultCard: {
    background: palette.white,
    borderRadius: '28px',
    padding: 'clamp(28px, 4vw, 56px) clamp(20px, 4vw, 60px)',
    textAlign: 'center',
    width: '100%',
    border: `1.5px solid ${palette.border}`,
    borderTop: `6px solid ${palette.warmOrange}`,
    boxShadow: `0 2px 0 ${palette.border}, 0 12px 32px ${palette.shadow}`,
  },
  medalBig: {
    fontSize: 'clamp(64px, 9vw, 110px)',
    marginBottom: '12px',
    filter: 'drop-shadow(0 4px 12px rgba(42, 40, 69, 0.25))',
  },
  rankMessage: {
    fontSize: 'clamp(26px, 3.6vw, 44px)',
    fontWeight: '800',
    margin: '0 0 8px 0',
    fontFamily: BRAND_FONT_DISPLAY,
    color: palette.deepNavy,
    letterSpacing: '-0.5px',
  },
  rankText: {
    fontSize: 'clamp(14px, 1.6vw, 20px)',
    color: palette.bodyText,
    margin: '0 0 28px 0',
    fontWeight: 700,
    fontFamily: BRAND_FONT_BODY,
  },
  myAvatarWrapper: {
    width: 'clamp(110px, 15vw, 160px)',
    height: 'clamp(110px, 15vw, 160px)',
    borderRadius: '50%',
    background: palette.creamSoft,
    overflow: 'hidden',
    margin: '0 auto 16px',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    border: `3px solid ${palette.warmOrange}80`,
    position: 'relative',
    boxShadow: `0 8px 24px ${palette.shadowMd}`,
  },
  myAvatarImg: {
    width: '100%',
    height: '130%',
    objectFit: 'cover',
    objectPosition: 'center 15%',
    position: 'absolute',
    top: '0',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  myAvatarEmoji: {
    fontSize: 'clamp(52px, 7vw, 80px)',
    marginTop: '20px',
  },
  myName: {
    fontSize: 'clamp(22px, 2.6vw, 32px)',
    fontWeight: '800',
    margin: '0 0 24px 0',
    fontFamily: BRAND_FONT_DISPLAY,
    color: palette.deepNavy,
  },
  myStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 'clamp(10px, 1.6vw, 20px)',
  },
  statBox: {
    background: palette.creamSoft,
    borderRadius: '16px',
    padding: 'clamp(14px, 1.8vw, 22px) clamp(10px, 1.5vw, 18px)',
    border: `1.5px solid ${palette.border}`,
    boxShadow: `0 2px 0 ${palette.border}`,
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
  topSection: {
    background: palette.white,
    borderRadius: '24px',
    padding: 'clamp(20px, 3vw, 36px)',
    width: '100%',
    border: `1.5px solid ${palette.border}`,
    boxShadow: `0 2px 0 ${palette.border}, 0 8px 24px ${palette.shadow}`,
  },
  sectionTitle: {
    fontSize: 'clamp(16px, 1.8vw, 24px)',
    fontWeight: '800',
    margin: '0 0 18px 0',
    fontFamily: BRAND_FONT_DISPLAY,
    color: palette.deepNavy,
    letterSpacing: '-0.3px',
  },
  topList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(8px, 1.2vw, 14px)',
  },
  topItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 'clamp(10px, 1.5vw, 18px)',
    padding: 'clamp(10px, 1.5vw, 18px) clamp(14px, 2vw, 24px)',
    background: palette.creamSoft,
    borderRadius: '16px',
    border: `1.5px solid ${palette.border}`,
    boxShadow: `0 2px 0 ${palette.border}`,
  },
  topItemMe: {
    background: `${palette.softGreen}15`,
    border: `2px solid ${palette.softGreen}80`,
    boxShadow: `0 2px 0 ${palette.softGreen}40`,
  },
  topRank: {
    fontSize: 'clamp(20px, 2.4vw, 30px)',
    fontWeight: '800',
    width: 'clamp(36px, 4vw, 56px)',
    textAlign: 'center',
    fontFamily: BRAND_FONT_DISPLAY,
    color: palette.deepNavy,
  },
  topAvatarWrapper: {
    width: 'clamp(40px, 5vw, 60px)',
    height: 'clamp(40px, 5vw, 60px)',
    borderRadius: '50%',
    background: palette.creamSoft,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    flexShrink: 0,
    position: 'relative',
    border: `1.5px solid ${palette.border}`,
  },
  topAvatarImg: {
    width: '100%',
    height: '130%',
    objectFit: 'cover',
    objectPosition: 'center 15%',
    position: 'absolute',
    top: '0',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  topAvatarEmoji: {
    fontSize: 'clamp(20px, 2.4vw, 30px)',
    marginTop: '8px',
  },
  topName: {
    flex: 1,
    fontSize: 'clamp(14px, 1.5vw, 18px)',
    fontWeight: '700',
    fontFamily: BRAND_FONT_BODY,
    color: palette.deepNavy,
  },
  youTag: {
    color: palette.softGreen,
    fontSize: 'clamp(11px, 1.2vw, 14px)',
    fontWeight: 800,
  },
  topScore: {
    fontSize: 'clamp(16px, 1.8vw, 22px)',
    fontWeight: '800',
    color: palette.gold,
    fontFamily: BRAND_FONT_DISPLAY,
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
    boxShadow: `0 4px 0 ${palette.warmOrangeShadow}`,
    letterSpacing: '0.5px',
    alignSelf: 'center',
    width: '100%',
    maxWidth: '480px',
  },
};

export default LivePlayerResults;