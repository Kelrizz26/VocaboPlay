// src/components/admin/LiveHostGame.jsx
// ============================================================
// ✅ TEACHER LIVE MONITOR - WAYGROUND STYLE
// FIXED: Avatar faces now visible in leaderboard
// ============================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  subscribeToSession,
  endGame,
  calculateRankings,
  checkAllPlayersCompleted,
  getPlayerProgress
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
  shadow: 'rgba(42, 40, 69, 0.06)',
  shadowMd: 'rgba(42, 40, 69, 0.10)',
};

const BRAND_FONT_DISPLAY = "'Fredoka', sans-serif";
const BRAND_FONT_BODY = "'Nunito', sans-serif";

const LiveHostGame = ({ session: initialSession, onEnd }) => {
  const [session, setSession] = useState(initialSession);

  // ============================================================
  // ✅ Subscribe to session updates
  // ============================================================
  useEffect(() => {
    if (!initialSession?.sessionId) return;

    const unsubscribe = subscribeToSession(initialSession.sessionId, (data) => {
      setSession(data);
    });

    return () => unsubscribe();
  }, [initialSession?.sessionId]);

  // ============================================================
  // ✅ Handle end game
  // ============================================================
  const handleEndGame = async () => {
    try {
      await endGame(session.sessionId);
      onEnd(session);
    } catch (error) {
      console.error('Error ending game:', error);
    }
  };

  // ============================================================
  // ✅ Data
  // ============================================================
  const players = session?.players || [];
  const totalQuestions = session?.totalQuestions || 0;

  const averageAnswered = players.length > 0
    ? players.reduce((sum, p) => {
        const answered = Object.keys(p.answers || {}).length;
        return sum + answered;
      }, 0) / players.length
    : 0;

  const classProgressPercent = totalQuestions > 0
    ? Math.round((averageAnswered / totalQuestions) * 100)
    : 0;

  const allCompleted = checkAllPlayersCompleted(players, totalQuestions);
  const rankedPlayers = calculateRankings(players);

  // ============================================================
  // ✅ Render
  // ============================================================
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>🎮 {session?.activityTitle}</h1>
          <p style={styles.subtitle}>
            Game in progress • {players.length} player{players.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={styles.headerRight}>
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              opacity: [1, 0.85, 1]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={styles.liveBadge}
          >
            🔴 LIVE
          </motion.div>
        </div>
      </div>

      {/* ✅ CLASS PROGRESS BAR */}
      <div style={styles.progressSection}>
        <div style={styles.progressHeader}>
          <div>
            <div style={styles.progressTitle}>📊 Class Progress</div>
            <div style={styles.progressSubtitle}>
              {Math.round(averageAnswered)} / {totalQuestions} questions answered
            </div>
          </div>
          <div style={styles.progressPercent}>
            {classProgressPercent}%
          </div>
        </div>
        <div style={styles.progressBar}>
          <motion.div
            style={styles.progressFill}
            animate={{ width: `${classProgressPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* ✅ ALL DONE INDICATOR */}
      <AnimatePresence>
        {allCompleted && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            style={styles.allDoneCard}
          >
            <div style={styles.allDoneContent}>
              <span style={styles.allDoneEmoji}>🎉</span>
              <div>
                <div style={styles.allDoneTitle}>All players completed!</div>
                <div style={styles.allDoneSubtitle}>Ready to show results?</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ LIVE LEADERBOARD */}
      <div style={styles.leaderboardSection}>
        <div style={styles.leaderboardHeader}>
          <h2 style={styles.leaderboardTitle}>🏆 Live Leaderboard</h2>
          <div style={styles.playerCountBadge}>
            {players.length} player{players.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div style={styles.leaderboardList}>
          <AnimatePresence>
            {rankedPlayers.map((player, index) => {
              const progress = getPlayerProgress(player, totalQuestions);
              const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;

              return (
                <motion.div
                  key={player.userId}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ layout: { duration: 0.3 } }}
                  style={{
                    ...styles.leaderboardItem,
                    ...(progress.isCompleted ? styles.leaderboardItemCompleted : {}),
                    ...(index === 0 ? styles.leaderboardItemTop : {}),
                  }}
                >
                  {/* Rank */}
                  <div style={styles.rankBadge}>{medal}</div>

                  {/* ✅ FIXED: Avatar - Face Visible */}
                  <div style={styles.playerAvatar}>
                    {player.avatarImage ? (
                      <img
                        src={player.avatarImage}
                        alt={player.name}
                        style={styles.avatarImg}
                      />
                    ) : (
                      <span style={styles.avatarEmoji}>👤</span>
                    )}
                  </div>

                  {/* Player Info + Progress */}
                  <div style={styles.playerInfo}>
                    <div style={styles.playerNameRow}>
                      <span style={styles.playerName}>{player.name}</span>
                      {progress.isCompleted && (
                        <span style={styles.completedBadge}>✅ Done</span>
                      )}
                    </div>

                    <div style={styles.playerProgressBar}>
                      <motion.div
                        style={{
                          ...styles.playerProgressFill,
                          background: progress.isCompleted
                            ? `linear-gradient(90deg, ${palette.softGreen}, ${palette.softGreen}CC)`
                            : `linear-gradient(90deg, ${palette.warmOrange}, ${palette.warmOrange}CC)`
                        }}
                        animate={{ width: `${progress.percentage}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <div style={styles.playerProgressText}>
                      {progress.answered}/{progress.total} answered
                    </div>
                  </div>

                  {/* Score */}
                  <div style={styles.playerScore}>
                    <span style={styles.scoreValue}>{player.score}</span>
                    <span style={styles.scoreLabel}>pts</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {players.length === 0 && (
            <div style={styles.noPlayers}>
              <p>No players yet</p>
            </div>
          )}
        </div>
      </div>

      {/* ✅ STATUS INDICATOR */}
      <div style={styles.statusSection}>
        {!allCompleted && (
          <div style={styles.waitingCard}>
            <motion.div
              animate={{
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={styles.waitingIcon}
            >
              ⏳
            </motion.div>
            <div style={styles.waitingText}>
              Waiting for players to finish...
            </div>
          </div>
        )}
      </div>

      {/* ✅ END GAME BUTTON */}
      <div style={styles.footer}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleEndGame}
          style={{
            ...styles.endBtn,
            ...(allCompleted ? styles.endBtnReady : {})
          }}
        >
          {allCompleted
            ? '🎉 Show Final Results'
            : '🏁 End Game & Show Results'}
        </motion.button>
      </div>
    </div>
  );
};

// ============================================================
// ✅ STYLES
// ============================================================
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px',
    fontFamily: BRAND_FONT_BODY,
    minHeight: '100vh',
    background: palette.cream,
    color: palette.deepNavy,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    background: palette.white,
    borderRadius: '20px',
    padding: '20px 24px',
    border: `1.5px solid ${palette.border}`,
    boxShadow: `0 2px 0 ${palette.border}, 0 8px 24px ${palette.shadow}`,
    gap: '12px',
    flexWrap: 'wrap',
  },
  headerLeft: {
    flex: 1,
    minWidth: 0,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    margin: '0 0 4px 0',
    fontFamily: BRAND_FONT_DISPLAY,
    color: palette.deepNavy,
    letterSpacing: '-0.4px',
  },
  subtitle: {
    fontSize: '14px',
    color: palette.bodyTextSoft,
    margin: 0,
    fontWeight: 600,
  },
  liveBadge: {
    background: `${palette.coral}18`,
    color: palette.coral,
    border: `1.5px solid ${palette.coral}66`,
    padding: '8px 16px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: '800',
    fontFamily: BRAND_FONT_DISPLAY,
    letterSpacing: '0.06em',
    boxShadow: `0 2px 0 ${palette.coral}33`,
  },
  progressSection: {
    background: palette.white,
    borderRadius: '20px',
    padding: '20px 24px',
    marginBottom: '20px',
    border: `1.5px solid ${palette.border}`,
    boxShadow: `0 2px 0 ${palette.border}`,
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    gap: '12px',
    flexWrap: 'wrap',
  },
  progressTitle: {
    fontSize: '16px',
    fontWeight: '800',
    marginBottom: '2px',
    fontFamily: BRAND_FONT_DISPLAY,
    color: palette.deepNavy,
    letterSpacing: '-0.2px',
  },
  progressSubtitle: {
    fontSize: '13px',
    color: palette.bodyTextSoft,
    fontWeight: 600,
  },
  progressPercent: {
    fontSize: '28px',
    fontWeight: '800',
    color: palette.gold,
    fontFamily: BRAND_FONT_DISPLAY,
  },
  progressBar: {
    width: '100%',
    height: '14px',
    background: palette.creamSoft,
    borderRadius: '999px',
    overflow: 'hidden',
    border: `1.5px solid ${palette.border}`,
  },
  progressFill: {
    height: '100%',
    background: `linear-gradient(90deg, ${palette.softGreen}, ${palette.teal})`,
    borderRadius: '999px',
  },
  allDoneCard: {
    background: `${palette.softGreen}12`,
    borderRadius: '20px',
    padding: '20px 24px',
    marginBottom: '20px',
    border: `1.5px solid ${palette.softGreen}66`,
    boxShadow: `0 2px 0 ${palette.softGreen}33`,
  },
  allDoneContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  allDoneEmoji: {
    fontSize: '48px',
  },
  allDoneTitle: {
    fontSize: '18px',
    fontWeight: '800',
    marginBottom: '2px',
    fontFamily: BRAND_FONT_DISPLAY,
    color: palette.deepNavy,
  },
  allDoneSubtitle: {
    fontSize: '14px',
    color: palette.bodyTextSoft,
    fontWeight: 600,
  },
  leaderboardSection: {
    background: palette.white,
    borderRadius: '20px',
    padding: '20px 24px',
    marginBottom: '20px',
    border: `1.5px solid ${palette.border}`,
    boxShadow: `0 2px 0 ${palette.border}, 0 8px 24px ${palette.shadow}`,
    flex: 1,
  },
  leaderboardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    paddingBottom: '14px',
    borderBottom: `1.5px solid ${palette.borderSoft}`,
    gap: '12px',
    flexWrap: 'wrap',
  },
  leaderboardTitle: {
    fontSize: '18px',
    fontWeight: '800',
    margin: 0,
    fontFamily: BRAND_FONT_DISPLAY,
    color: palette.deepNavy,
    letterSpacing: '-0.2px',
  },
  playerCountBadge: {
    background: palette.creamSoft,
    color: palette.deepNavy,
    padding: '4px 14px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: '800',
    fontFamily: BRAND_FONT_DISPLAY,
    border: `1.5px solid ${palette.border}`,
    boxShadow: `0 2px 0 ${palette.border}`,
  },
  leaderboardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  leaderboardItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px 16px',
    background: palette.creamSoft,
    borderRadius: '14px',
    border: `1.5px solid ${palette.border}`,
    boxShadow: `0 2px 0 ${palette.border}`,
    transition: 'all 0.3s',
  },
  leaderboardItemCompleted: {
    background: `${palette.softGreen}12`,
    border: `1.5px solid ${palette.softGreen}66`,
    boxShadow: `0 2px 0 ${palette.softGreen}33`,
  },
  leaderboardItemTop: {
    background: `${palette.gold}12`,
    border: `1.5px solid ${palette.gold}66`,
    boxShadow: `0 2px 0 ${palette.gold}33`,
  },
  rankBadge: {
    fontSize: '20px',
    fontWeight: '800',
    width: '44px',
    textAlign: 'center',
    flexShrink: 0,
    fontFamily: BRAND_FONT_DISPLAY,
    color: palette.deepNavy,
  },
  playerAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: palette.white,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    flexShrink: 0,
    border: `1.5px solid ${palette.border}`,
    position: 'relative',
  },
  avatarImg: {
    width: '100%',
    height: '130%',
    objectFit: 'cover',
    objectPosition: 'center 15%',
    position: 'absolute',
    top: '0',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  avatarEmoji: {
    fontSize: '24px',
    marginTop: '10px',
  },
  playerInfo: {
    flex: 1,
    minWidth: 0,
  },
  playerNameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px',
  },
  playerName: {
    fontSize: '15px',
    fontWeight: '700',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontFamily: BRAND_FONT_BODY,
    color: palette.deepNavy,
  },
  completedBadge: {
    fontSize: '11px',
    background: `${palette.softGreen}20`,
    color: palette.softGreen,
    padding: '2px 8px',
    borderRadius: '999px',
    fontWeight: '800',
    flexShrink: 0,
    fontFamily: BRAND_FONT_DISPLAY,
    letterSpacing: '0.04em',
    border: `1px solid ${palette.softGreen}40`,
  },
  playerProgressBar: {
    width: '100%',
    height: '8px',
    background: palette.white,
    borderRadius: '999px',
    overflow: 'hidden',
    marginBottom: '3px',
    border: `1px solid ${palette.border}`,
  },
  playerProgressFill: {
    height: '100%',
    borderRadius: '999px',
  },
  playerProgressText: {
    fontSize: '11px',
    color: palette.bodyTextSoft,
    fontWeight: 700,
  },
  playerScore: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  scoreValue: {
    fontSize: '22px',
    fontWeight: '800',
    color: palette.gold,
    lineHeight: 1,
    fontFamily: BRAND_FONT_DISPLAY,
  },
  scoreLabel: {
    fontSize: '11px',
    color: palette.bodyTextSoft,
    fontWeight: 700,
  },
  noPlayers: {
    textAlign: 'center',
    padding: '40px 20px',
    color: palette.bodyTextSoft,
    fontWeight: 600,
  },
  statusSection: {
    marginBottom: '20px',
  },
  waitingCard: {
    background: palette.white,
    borderRadius: '20px',
    padding: '20px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    border: `1.5px solid ${palette.border}`,
    boxShadow: `0 2px 0 ${palette.border}`,
  },
  waitingIcon: {
    fontSize: '32px',
  },
  waitingText: {
    fontSize: '16px',
    fontWeight: '700',
    fontFamily: BRAND_FONT_DISPLAY,
    color: palette.bodyText,
  },
  footer: {
    textAlign: 'center',
  },
  endBtn: {
    padding: '18px 48px',
    background: palette.coral,
    color: palette.white,
    border: 'none',
    borderRadius: '16px',
    fontSize: '17px',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: `0 4px 0 ${palette.coralShadow}`,
    fontFamily: BRAND_FONT_DISPLAY,
    transition: 'all 0.3s',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  endBtnReady: {
    background: palette.softGreen,
    boxShadow: `0 4px 0 ${palette.softGreenShadow}`,
  },
};

export default LiveHostGame;