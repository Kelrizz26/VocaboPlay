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
            {/* ✅ FIXED: Podium Avatar - Face Visible */}
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
            {/* ✅ FIXED: Podium Avatar - Face Visible */}
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
            {/* ✅ FIXED: Podium Avatar - Face Visible */}
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
              {/* ✅ FIXED: Small Avatar - Face Visible */}
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
    fontFamily: "'Poppins', sans-serif",
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #6C5CE7 0%, #9b8de8 100%)',
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
  },
  confettiBg: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.1) 0%, transparent 50%)',
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
    textShadow: '0 4px 20px rgba(0,0,0,0.3)',
  },
  subtitle: {
    fontSize: '18px',
    opacity: 0.9,
    margin: 0,
  },
  podiumSection: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: '20px',
    marginBottom: '40px',
    position: 'relative',
    zIndex: 1,
  },
  podiumCard: {
    background: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(20px)',
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: '24px',
    padding: '24px 20px',
    textAlign: 'center',
    minWidth: '180px',
  },
  podium1st: {
    padding: '32px 24px',
    background: 'rgba(255, 215, 0, 0.2)',
    borderColor: '#FFD700',
    boxShadow: '0 0 40px rgba(255, 215, 0, 0.5)',
  },
  podium2nd: {
    background: 'rgba(192, 192, 192, 0.15)',
    borderColor: '#C0C0C0',
  },
  podium3rd: {
    background: 'rgba(205, 127, 50, 0.15)',
    borderColor: '#CD7F32',
  },
  podiumRank: {
    fontSize: '48px',
    marginBottom: '12px',
  },
  // ✅ FIXED: Podium Avatar - Face Visible
  podiumAvatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
    margin: '0 auto 12px',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    position: 'relative',
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
    fontWeight: '700',
    marginBottom: '4px',
  },
  podiumScore: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#FFD700',
  },
  leaderboardSection: {
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '24px',
    marginBottom: '24px',
    border: '1px solid rgba(255,255,255,0.2)',
    position: 'relative',
    zIndex: 1,
  },
  leaderboardTitle: {
    fontSize: '20px',
    fontWeight: '700',
    margin: '0 0 20px 0',
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
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '12px',
  },
  rankBadge: {
    fontSize: '18px',
    fontWeight: '700',
    width: '40px',
    textAlign: 'center',
  },
  // ✅ FIXED: Small Avatar - Face Visible
  playerAvatarSmall: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    flexShrink: 0,
    position: 'relative',
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
    fontWeight: '600',
  },
  playerStats: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
  },
  statItem: {
    fontSize: '13px',
    opacity: 0.9,
  },
  statPoints: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#FFD700',
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
    background: 'rgba(255,255,255,0.2)',
    color: 'white',
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: '16px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif",
    transition: 'all 0.2s',
  },
};

export default LiveHostResults;