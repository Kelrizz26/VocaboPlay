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
          animate={{ scale: [1, 1.05, 1] }}
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
                    {/* ✅ FIXED: Avatar Circle - Mukha Nakikita */}
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
    fontFamily: "'Poppins', sans-serif",
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #6C5CE7 0%, #9b8de8 100%)',
    color: 'white',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#6C5CE7',
    color: 'white',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid rgba(255,255,255,0.2)',
    borderTop: '4px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  },
  loadingText: {
    fontSize: '16px',
    fontWeight: '500',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    margin: '0 0 4px 0',
  },
  subtitle: {
    fontSize: '14px',
    opacity: 0.9,
    margin: 0,
  },
  closeBtn: {
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    color: 'white',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    fontSize: '20px',
    cursor: 'pointer',
  },
  pinSection: {
    background: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '30px',
    textAlign: 'center',
    marginBottom: '24px',
    border: '2px solid rgba(255,255,255,0.3)',
  },
  pinLabel: {
    fontSize: '14px',
    opacity: 0.9,
    margin: '0 0 8px 0',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '2px',
  },
  pinCode: {
    fontSize: '64px',
    fontWeight: '800',
    letterSpacing: '8px',
    margin: '0 0 8px 0',
    textShadow: '0 4px 12px rgba(0,0,0,0.3)',
  },
  pinHint: {
    fontSize: '13px',
    opacity: 0.8,
    margin: 0,
  },
  playersSection: {
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '24px',
    marginBottom: '24px',
    border: '1px solid rgba(255,255,255,0.2)',
    minHeight: '300px',
  },
  playersHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  playersTitle: {
    fontSize: '18px',
    fontWeight: '600',
    margin: 0,
  },
  playerCount: {
    background: 'rgba(255,255,255,0.2)',
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600',
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
    fontWeight: '600',
    margin: '0 0 8px 0',
  },
  emptyHint: {
    fontSize: '14px',
    opacity: 0.7,
    margin: 0,
  },
  playersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: '16px',
  },
  playerCard: {
    background: 'rgba(255,255,255,0.15)',
    borderRadius: '16px',
    padding: '16px 12px',
    textAlign: 'center',
    border: '1px solid rgba(255,255,255,0.3)',
    position: 'relative',
  },
  // ✅ FIXED: Avatar Circle
  playerAvatar: {
    width: '60px',
    height: '60px',
    margin: '0 auto 8px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  // ✅ FIXED: Avatar Image - Mukha Nakikita
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
    fontWeight: '600',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  onlineDot: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: '#4CAF50',
    boxShadow: '0 0 8px #4CAF50',
  },
  offlineDot: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: '#F44336',
  },
  errorMsg: {
    background: 'rgba(244,67,54,0.3)',
    border: '1px solid #F44336',
    padding: '12px 20px',
    borderRadius: '12px',
    marginBottom: '16px',
    textAlign: 'center',
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
  },
  startBtn: {
    padding: '18px 48px',
    background: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '16px',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(76,175,80,0.4)',
    fontFamily: "'Poppins', sans-serif",
    transition: 'all 0.2s',
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