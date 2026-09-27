// src/components/admin/LiveHostLobby.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../../pages/firebase';
import {
  createLiveSession,
  subscribeToSession,
  startGame,
  deleteSession
} from '../../services/LiveGameService';
import { getAvatarById } from '../../data/avatarShop';

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

const LiveHostLobby = ({ activity, onStart, onCancel }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(false);

  // Create session on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError('Not authenticated');
          setLoading(false);
          return;
        }

        const newSession = await createLiveSession(
          activity.id,
          user.uid,
          user.displayName || 'Teacher'
        );

        setSession(newSession);
        setLoading(false);
      } catch (err) {
        console.error('Error creating session:', err);
        setError(err.message || 'Failed to create session');
        setLoading(false);
      }
    };

    initSession();

    return () => {
      if (session?.sessionId) {
        deleteSession(session.sessionId).catch(console.error);
      }
    };
  }, [activity.id]);

  // Subscribe to session updates
  useEffect(() => {
    if (!session?.sessionId) return;

    const unsubscribe = subscribeToSession(session.sessionId, (data) => {
      setSession(data);
    });

    return () => unsubscribe();
  }, [session?.sessionId]);

  const handleStartGame = async () => {
    if (!session?.players || session.players.length === 0) {
      setError('No players have joined yet');
      return;
    }

    setStarting(true);
    try {
      await startGame(session.sessionId);
      onStart(session);
    } catch (err) {
      setError(err.message);
      setStarting(false);
    }
  };

  const handleCancel = async () => {
    if (session?.sessionId) {
      await deleteSession(session.sessionId);
    }
    onCancel();
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Creating lobby...</p>
      </div>
    );
  }

  const players = session?.players || [];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🎮 {session?.activityTitle || 'Live Game'}</h1>
          <p style={styles.subtitle}>Waiting for players to join...</p>
        </div>
        <button onClick={handleCancel} style={styles.closeBtn}>✕</button>
      </div>

      {/* PIN Display */}
      <div style={styles.pinSection}>
        <p style={styles.pinLabel}>GAME PIN</p>
        <motion.div
          style={styles.pinCode}
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {session?.gamePin}
        </motion.div>
        <p style={styles.pinHint}>Share this PIN with your students</p>
      </div>

      {/* Players Grid */}
      <div style={styles.playersSection}>
        <div style={styles.playersHeader}>
          <h2 style={styles.playersTitle}>
            👥 Players Joined
          </h2>
          <div style={styles.playerCount}>
            {players.length} player{players.length !== 1 ? 's' : ''}
          </div>
        </div>

        {players.length === 0 ? (
          <div style={styles.emptyState}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              style={styles.emptyIcon}
            >
              👋
            </motion.div>
            <p style={styles.emptyText}>Waiting for players to join...</p>
            <p style={styles.emptyHint}>Players will appear here once they enter the PIN</p>
          </div>
        ) : (
          <div style={styles.playersGrid}>
            <AnimatePresence>
              {players.map((player, index) => {
                const avatarData = getAvatarById(player.avatarId);
                return (
                  <motion.div
                    key={player.userId}
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ delay: index * 0.05 }}
                    style={styles.playerCard}
                  >
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
                    <div style={styles.playerName}>{player.name}</div>
                    {player.isConnected ? (
                      <div style={styles.onlineDot}></div>
                    ) : (
                      <div style={styles.offlineDot}></div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Error */}
      {error && <div style={styles.errorMsg}>{error}</div>}

      {/* Start Button */}
      <div style={styles.footer}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleStartGame}
          disabled={players.length === 0 || starting}
          style={{
            ...styles.startBtn,
            opacity: players.length === 0 || starting ? 0.5 : 1,
            cursor: players.length === 0 || starting ? 'not-allowed' : 'pointer'
          }}
        >
          {starting ? 'Starting...' : `🚀 Start Game (${players.length} player${players.length !== 1 ? 's' : ''})`}
        </motion.button>
      </div>
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
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: palette.cream,
    color: palette.deepNavy,
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: `4px solid ${palette.border}`,
    borderTop: `4px solid ${palette.warmOrange}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  },
  loadingText: {
    fontSize: '16px',
    fontWeight: '800',
    fontFamily: BRAND_FONT_DISPLAY,
    color: palette.bodyText,
    letterSpacing: '0.02em',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    gap: '12px',
  },
  title: {
    fontSize: '28px',
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
  closeBtn: {
    background: palette.white,
    border: `1.5px solid ${palette.border}`,
    color: palette.bodyText,
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    fontSize: '18px',
    cursor: 'pointer',
    fontWeight: 800,
    fontFamily: BRAND_FONT_DISPLAY,
    boxShadow: `0 2px 0 ${palette.border}`,
    flexShrink: 0,
  },
  pinSection: {
    background: palette.white,
    borderRadius: '20px',
    padding: '30px',
    textAlign: 'center',
    marginBottom: '24px',
    border: `1.5px solid ${palette.border}`,
    borderTop: `6px solid ${palette.warmOrange}`,
    boxShadow: `0 2px 0 ${palette.border}, 0 8px 24px ${palette.shadow}`,
  },
  pinLabel: {
    fontSize: '12px',
    color: palette.bodyTextSoft,
    margin: '0 0 8px 0',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    fontFamily: BRAND_FONT_DISPLAY,
  },
  pinCode: {
    fontSize: '64px',
    fontWeight: '800',
    letterSpacing: '8px',
    margin: '0 0 8px 0',
    fontFamily: BRAND_FONT_DISPLAY,
    color: palette.deepNavy,
  },
  pinHint: {
    fontSize: '13px',
    color: palette.bodyTextSoft,
    margin: 0,
    fontWeight: 600,
  },
  playersSection: {
    background: palette.white,
    borderRadius: '20px',
    padding: '24px',
    marginBottom: '24px',
    border: `1.5px solid ${palette.border}`,
    boxShadow: `0 2px 0 ${palette.border}, 0 8px 24px ${palette.shadow}`,
    minHeight: '300px',
  },
  playersHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: `1.5px solid ${palette.borderSoft}`,
  },
  playersTitle: {
    fontSize: '18px',
    fontWeight: '800',
    margin: 0,
    fontFamily: BRAND_FONT_DISPLAY,
    color: palette.deepNavy,
    letterSpacing: '-0.2px',
  },
  playerCount: {
    background: palette.creamSoft,
    color: palette.deepNavy,
    padding: '6px 16px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: '800',
    fontFamily: BRAND_FONT_DISPLAY,
    border: `1.5px solid ${palette.border}`,
    boxShadow: `0 2px 0 ${palette.border}`,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '60px',
    marginBottom: '16px',
  },
  emptyText: {
    fontSize: '18px',
    fontWeight: '800',
    margin: '0 0 8px 0',
    fontFamily: BRAND_FONT_DISPLAY,
    color: palette.deepNavy,
  },
  emptyHint: {
    fontSize: '14px',
    color: palette.bodyTextSoft,
    margin: 0,
    fontWeight: 600,
  },
  playersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: '16px',
  },
  playerCard: {
    background: palette.creamSoft,
    borderRadius: '16px',
    padding: '16px 12px',
    textAlign: 'center',
    border: `1.5px solid ${palette.border}`,
    boxShadow: `0 2px 0 ${palette.border}`,
    position: 'relative',
  },
  playerAvatar: {
    width: '60px',
    height: '60px',
    margin: '0 auto 8px',
    borderRadius: '50%',
    background: palette.white,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    border: `1.5px solid ${palette.border}`,
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
    fontSize: '30px',
    marginTop: '12px',
  },
  playerName: {
    fontSize: '13px',
    fontWeight: '700',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: palette.deepNavy,
    fontFamily: BRAND_FONT_BODY,
  },
  onlineDot: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: palette.softGreen,
    boxShadow: `0 0 8px ${palette.softGreen}80`,
  },
  offlineDot: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: palette.coral,
  },
  errorMsg: {
    background: `${palette.coral}15`,
    border: `1.5px solid ${palette.coral}66`,
    color: palette.coral,
    padding: '12px 20px',
    borderRadius: '12px',
    marginBottom: '16px',
    textAlign: 'center',
    fontWeight: '800',
    fontSize: '13px',
  },
  footer: {
    textAlign: 'center',
  },
  startBtn: {
    padding: '18px 48px',
    background: palette.softGreen,
    color: palette.white,
    border: 'none',
    borderRadius: '16px',
    fontSize: '18px',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: `0 4px 0 ${palette.softGreenShadow}`,
    fontFamily: BRAND_FONT_DISPLAY,
    transition: 'all 0.15s ease',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
};

// Add keyframe animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  if (!document.querySelector('#livelobby-styles')) {
    style.id = 'livelobby-styles';
    document.head.appendChild(style);
  }
}

export default LiveHostLobby;