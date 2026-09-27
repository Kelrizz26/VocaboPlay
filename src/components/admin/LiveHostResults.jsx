// src/components/admin/LiveHostResults.jsx
// ============================================================
// ✅ TEACHER RESULTS - FIXED: Avatar faces visible in podium
// ============================================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  subscribeToSession,
  calculateRankings,
  deleteSession
} from '../../services/LiveGameService';

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
  silver: '#9CA3AF',
  bronze: '#B07A50',
  shadow: 'rgba(42, 40, 69, 0.06)',
  shadowMd: 'rgba(42, 40, 69, 0.10)',
};

const BRAND_FONT_DISPLAY = "'Fredoka', sans-serif";
const BRAND_FONT_BODY = "'Nunito', sans-serif";

const LiveHostResults = ({ session: initialSession, onPlayAgain, onBackToDashboard }) => {
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

  const podiumPlayers = rankedPlayers.slice(0, 3);
  const otherPlayers = rankedPlayers.slice(3);

  const handleBackToDashboard = async () => {
    if (session?.sessionId) {
      await deleteSession(session.sessionId);
    }
    onBackToDashboard();
  };

  return (
    <div style={styles.container}>
      {/* Confetti background */}
      <div style={styles.confettiBg}></div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.header}
      >
        <h1 style={styles.title}>🎉 Game Over!</h1>
        <p style={styles.subtitle}>{session?.activityTitle}</p>
      </motion.div>

      {/* Podium */}
      <div style={styles.podiumSection}>
        {/* 2nd Place */}
        {podiumPlayers[1] && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ ...styles.podiumCard, ...styles.podium2nd }}
          >
            <div style={styles.podiumRank}>🥈</div>
            <div style={styles.podiumAvatar}>
              {podiumPlayers[1].avatarImage ? (
                <img
                  src={podiumPlayers[1].avatarImage}
                  alt={podiumPlayers[1].name}
                  style={styles.podiumAvatarImg}
                />
              ) : (
                <span style={styles.podiumAvatarEmoji}>👤</span>
              )}
            </div>
            <div style={styles.podiumName}>{podiumPlayers[1].name}</div>
            <div style={styles.podiumScore}>{podiumPlayers[1].score} pts</div>
          </motion.div>
        )}

        {/* 1st Place */}
        {podiumPlayers[0] && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.1, type: 'spring' }}
            style={{ ...styles.podiumCard, ...styles.podium1st }}
          >
            <div style={styles.podiumRank}>🥇</div>
            <div style={styles.podiumAvatar}>
              {podiumPlayers[0].avatarImage ? (
                <img
                  src={podiumPlayers[0].avatarImage}
                  alt={podiumPlayers[0].name}
                  style={styles.podiumAvatarImg}
                />
              ) : (
                <span style={styles.podiumAvatarEmoji}>👤</span>
              )}
            </div>
            <div style={styles.podiumName}>{podiumPlayers[0].name}</div>
            <div style={styles.podiumScore}>{podiumPlayers[0].score} pts</div>
          </motion.div>
        )}

        {/* 3rd Place */}
        {podiumPlayers[2] && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{ ...styles.podiumCard, ...styles.podium3rd }}
          >
            <div style={styles.podiumRank}>🥉</div>
            <div style={styles.podiumAvatar}>
              {podiumPlayers[2].avatarImage ? (
                <img
                  src={podiumPlayers[2].avatarImage}
                  alt={podiumPlayers[2].name}
                  style={styles.podiumAvatarImg}
                />
              ) : (
                <span style={styles.podiumAvatarEmoji}>👤</span>
              )}
            </div>
            <div style={styles.podiumName}>{podiumPlayers[2].name}</div>
            <div style={styles.podiumScore}>{podiumPlayers[2].score} pts</div>
          </motion.div>
        )}
      </div>

      {/* Full Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        style={styles.leaderboardSection}
      >
        <h2 style={styles.leaderboardTitle}>📊 Full Leaderboard</h2>
        <div style={styles.leaderboardList}>
          {rankedPlayers.map((player, index) => (
            <div key={player.userId} style={styles.leaderboardItem}>
              <div style={styles.rankBadge}>
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
              </div>
              <div style={styles.playerAvatarSmall}>
                {player.avatarImage ? (
                  <img
                    src={player.avatarImage}
                    alt={player.name}
                    style={styles.avatarImgSmall}
                  />
                ) : (
                  <span style={styles.avatarEmojiSmall}>👤</span>
                )}
              </div>
              <div style={styles.playerName}>{player.name}</div>
              <div style={styles.playerStats}>
                <span style={styles.statItem}>✅ {player.correctAnswers}/{session.totalQuestions}</span>
                <span style={styles.statPoints}>{player.score} pts</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        style={styles.actions}
      >
        <button onClick={handleBackToDashboard} style={styles.backBtn}>
          🏠 Back to Dashboard
        </button>
      </motion.div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px',
    fontFamily: BRAND_FONT_BODY,
    minHeight: '100vh',
    background: palette.cream,
    color: palette.deepNavy,
    position: 'relative',
    overflow: 'hidden',
  },
  confettiBg: {
    position: 'absolute',
    inset: 0,
    background: `radial-gradient(circle at 20% 30%, ${palette.warmOrange}10 0%, transparent 50%), radial-gradient(circle at 80% 70%, ${palette.teal}10 0%, transparent 50%)`,
    pointerEvents: 'none',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
    position: 'relative',
    zIndex: 1,
  },
  title: {
    fontSize: '48px',
    fontWeight: '800',
    margin: '0 0 8px 0',
    fontFamily: BRAND_FONT_DISPLAY,
    color: palette.deepNavy,
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '18px',
    color: palette.bodyTextSoft,
    margin: 0,
    fontWeight: 600,
  },
  podiumSection: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: '20px',
    marginBottom: '40px',
    position: 'relative',
    zIndex: 1,
    flexWrap: 'wrap',
  },
  podiumCard: {
    background: palette.white,
    border: `1.5px solid ${palette.border}`,
    borderRadius: '24px',
    padding: '24px 20px',
    textAlign: 'center',
    minWidth: '180px',
    boxShadow: `0 2px 0 ${palette.border}, 0 8px 24px ${palette.shadow}`,
  },
  podium1st: {
    padding: '32px 24px',
    background: `${palette.gold}12`,
    borderColor: `${palette.gold}66`,
    boxShadow: `0 2px 0 ${palette.gold}40, 0 12px 32px ${palette.shadowMd}`,
  },
  podium2nd: {
    background: `${palette.silver}12`,
    borderColor: `${palette.silver}66`,
  },
  podium3rd: {
    background: `${palette.bronze}12`,
    borderColor: `${palette.bronze}66`,
  },
  podiumRank: {
    fontSize: '48px',
    marginBottom: '12px',
  },
  podiumAvatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: palette.creamSoft,
    overflow: 'hidden',
    margin: '0 auto 12px',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    position: 'relative',
    border: `1.5px solid ${palette.border}`,
  },
  podiumAvatarImg: {
    width: '100%',
    height: '130%',
    objectFit: 'cover',
    objectPosition: 'center 15%',
    position: 'absolute',
    top: '0',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  podiumAvatarEmoji: {
    fontSize: '40px',
    marginTop: '16px',
  },
  podiumName: {
    fontSize: '18px',
    fontWeight: '800',
    marginBottom: '4px',
    fontFamily: BRAND_FONT_DISPLAY,
    color: palette.deepNavy,
  },
  podiumScore: {
    fontSize: '20px',
    fontWeight: '800',
    color: palette.gold,
    fontFamily: BRAND_FONT_DISPLAY,
  },
  leaderboardSection: {
    background: palette.white,
    borderRadius: '20px',
    padding: '24px',
    marginBottom: '24px',
    border: `1.5px solid ${palette.border}`,
    boxShadow: `0 2px 0 ${palette.border}, 0 8px 24px ${palette.shadow}`,
    position: 'relative',
    zIndex: 1,
  },
  leaderboardTitle: {
    fontSize: '20px',
    fontWeight: '800',
    margin: '0 0 20px 0',
    fontFamily: BRAND_FONT_DISPLAY,
    color: palette.deepNavy,
    letterSpacing: '-0.3px',
  },
  leaderboardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  leaderboardItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: palette.creamSoft,
    borderRadius: '12px',
    border: `1.5px solid ${palette.border}`,
    boxShadow: `0 2px 0 ${palette.border}`,
  },
  rankBadge: {
    fontSize: '18px',
    fontWeight: '800',
    width: '40px',
    textAlign: 'center',
    fontFamily: BRAND_FONT_DISPLAY,
    color: palette.deepNavy,
  },
  playerAvatarSmall: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: palette.white,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    flexShrink: 0,
    position: 'relative',
    border: `1.5px solid ${palette.border}`,
  },
  avatarImgSmall: {
    width: '100%',
    height: '130%',
    objectFit: 'cover',
    objectPosition: 'center 15%',
    position: 'absolute',
    top: '0',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  avatarEmojiSmall: {
    fontSize: '20px',
    marginTop: '8px',
  },
  playerName: {
    flex: 1,
    fontSize: '15px',
    fontWeight: '700',
    fontFamily: BRAND_FONT_BODY,
    color: palette.deepNavy,
  },
  playerStats: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
  },
  statItem: {
    fontSize: '13px',
    color: palette.bodyTextSoft,
    fontWeight: 600,
  },
  statPoints: {
    fontSize: '16px',
    fontWeight: '800',
    color: palette.gold,
    fontFamily: BRAND_FONT_DISPLAY,
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    position: 'relative',
    zIndex: 1,
  },
  backBtn: {
    padding: '16px 40px',
    background: palette.warmOrange,
    color: palette.white,
    border: 'none',
    borderRadius: '16px',
    fontSize: '16px',
    fontWeight: '800',
    cursor: 'pointer',
    fontFamily: BRAND_FONT_DISPLAY,
    transition: 'all 0.15s ease',
    boxShadow: `0 4px 0 ${palette.warmOrangeShadow}`,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
};

export default LiveHostResults;