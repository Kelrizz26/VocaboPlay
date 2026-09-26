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
              opacity: [1, 0.8, 1]
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
                            ? 'linear-gradient(90deg, #4CAF50, #8BC34A)' 
                            : 'linear-gradient(90deg, #FFC107, #FFD700)'
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
    fontFamily: "'Poppins', sans-serif",
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #6C5CE7 0%, #9b8de8 100%)',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '20px 24px',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    margin: '0 0 4px 0',
  },
  subtitle: {
    fontSize: '14px',
    opacity: 0.9,
    margin: 0,
  },
  liveBadge: {
    background: '#F44336',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '700',
    boxShadow: '0 4px 12px rgba(244,67,54,0.4)',
  },
  progressSection: {
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '20px 24px',
    marginBottom: '20px',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  progressTitle: {
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '2px',
  },
  progressSubtitle: {
    fontSize: '13px',
    opacity: 0.8,
  },
  progressPercent: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#FFD700',
  },
  progressBar: {
    width: '100%',
    height: '14px',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '7px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #4CAF50, #8BC34A)',
    borderRadius: '7px',
  },
  allDoneCard: {
    background: 'rgba(76,175,80,0.3)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '20px 24px',
    marginBottom: '20px',
    border: '2px solid #4CAF50',
    boxShadow: '0 0 30px rgba(76,175,80,0.4)',
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
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '2px',
  },
  allDoneSubtitle: {
    fontSize: '14px',
    opacity: 0.9,
  },
  leaderboardSection: {
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '20px 24px',
    marginBottom: '20px',
    border: '1px solid rgba(255,255,255,0.2)',
    flex: 1,
  },
  leaderboardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  leaderboardTitle: {
    fontSize: '18px',
    fontWeight: '700',
    margin: 0,
  },
  playerCountBadge: {
    background: 'rgba(255,255,255,0.2)',
    padding: '4px 14px',
    borderRadius: '16px',
    fontSize: '13px',
    fontWeight: '600',
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
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '14px',
    transition: 'all 0.3s',
  },
  leaderboardItemCompleted: {
    background: 'rgba(76,175,80,0.15)',
    border: '1px solid rgba(76,175,80,0.4)',
  },
  leaderboardItemTop: {
    background: 'rgba(255,215,0,0.15)',
    border: '1px solid rgba(255,215,0,0.4)',
  },
  rankBadge: {
    fontSize: '20px',
    fontWeight: '700',
    width: '44px',
    textAlign: 'center',
    flexShrink: 0,
  },
  // ✅ FIXED: Avatar Circle - Face Visible
  playerAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    flexShrink: 0,
    border: '2px solid rgba(255,255,255,0.3)',
    position: 'relative',
  },
  // ✅ FIXED: Avatar Image - Face Visible
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
    fontWeight: '600',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  completedBadge: {
    fontSize: '11px',
    background: '#4CAF50',
    padding: '2px 8px',
    borderRadius: '10px',
    fontWeight: '700',
    flexShrink: 0,
  },
  playerProgressBar: {
    width: '100%',
    height: '8px',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '3px',
  },
  playerProgressFill: {
    height: '100%',
    borderRadius: '4px',
  },
  playerProgressText: {
    fontSize: '11px',
    opacity: 0.8,
    fontWeight: '500',
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
    color: '#FFD700',
    lineHeight: 1,
  },
  scoreLabel: {
    fontSize: '11px',
    opacity: 0.7,
    fontWeight: '600',
  },
  noPlayers: {
    textAlign: 'center',
    padding: '40px 20px',
    opacity: 0.6,
  },
  statusSection: {
    marginBottom: '20px',
  },
  waitingCard: {
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '20px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  waitingIcon: {
    fontSize: '32px',
  },
  waitingText: {
    fontSize: '16px',
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
  },
  endBtn: {
    padding: '18px 48px',
    background: '#F44336',
    color: 'white',
    border: 'none',
    borderRadius: '16px',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(244,67,54,0.4)',
    fontFamily: "'Poppins', sans-serif",
    transition: 'all 0.3s',
  },
  endBtnReady: {
    background: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
    boxShadow: '0 8px 24px rgba(76,175,80,0.5)',
    transform: 'scale(1.02)',
  },
};

export default LiveHostGame;