// src/components/dashboard/LivePlayerLobby.jsx
// ============================================================
// ✅ STUDENT LOBBY - FULL SIZE
// ============================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeToSession } from '../../services/LiveGameService';

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

const LivePlayerLobby = ({ session: initialSession, playerId, onGameStart, onCancel }) => {
  const [session, setSession] = useState(initialSession);
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!initialSession?.sessionId) return;

    const unsubscribe = subscribeToSession(initialSession.sessionId, (data) => {
      setSession(data);

      if (data.status === 'playing') {
        onGameStart(data);
      }
    });

    return () => unsubscribe();
  }, [initialSession?.sessionId, onGameStart]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const players = session?.players || [];
  const myPlayer = players.find(p => p.userId === playerId);
  const totalPlayers = players.length;

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.header}
        >
          <div style={styles.pinBox}>
            <span style={styles.pinLabel}>GAME PIN</span>
            <span style={styles.pinValue}>{session?.pin || '------'}</span>
          </div>

          <div style={styles.statusBox}>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={styles.statusDot}
            />
            <span style={styles.statusText}>Waiting for host{dots}</span>
          </div>
        </motion.div>

        {/* Main */}
        <div style={styles.mainGrid}>
          {/* Left: My Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            style={styles.myCard}
          >
            <div style={styles.myCardLabel}>You're in! 🎉</div>

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
            <p style={styles.myHint}>Get ready! Game starts soon</p>
          </motion.div>

          {/* Right: Players */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            style={styles.playersCard}
          >
            <div style={styles.playersHeader}>
              <span style={styles.playersTitle}>
                🎮 Players in Lobby
              </span>
              <span style={styles.playersCount}>
                {totalPlayers}
              </span>
            </div>

            <div style={styles.playersList}>
              <AnimatePresence>
                {players.map((player, index) => {
                  const isMe = player.userId === playerId;
                  return (
                    <motion.div
                      key={player.userId}
                      layout
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ delay: index * 0.05 }}
                      style={{
                        ...styles.playerItem,
                        ...(isMe ? styles.playerItemMe : {})
                      }}
                    >
                      <div style={styles.playerAvatarWrapper}>
                        {player.avatarImage ? (
                          <img
                            src={player.avatarImage}
                            alt={player.name}
                            style={styles.playerAvatarImg}
                          />
                        ) : (
                          <span style={styles.playerAvatarEmoji}>👤</span>
                        )}
                      </div>
                      <div style={styles.playerName}>
                        {player.name}
                        {isMe && <span style={styles.youTag}> (You)</span>}
                      </div>
                      <div style={styles.playerReady}>✓</div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {players.length === 0 && (
                <div style={styles.emptyState}>
                  <span style={{ fontSize: '48px' }}>👋</span>
                  <p style={{ fontWeight: 600, marginTop: '8px' }}>
                    Waiting for players to join
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Cancel */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCancel}
          style={styles.cancelBtn}
        >
          ← Leave Lobby
        </motion.button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    width: '100vw',
    background: `linear-gradient(135deg, ${palette.warmOrange} 0%, ${palette.coral} 100%)`,
    padding: 'clamp(16px, 3vw, 40px)',
    fontFamily: BRAND_FONT_BODY,
    color: 'white',
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 'clamp(12px, 2vw, 20px)',
    flexWrap: 'wrap',
  },
  pinBox: {
    background: 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '2px solid rgba(255,255,255,0.35)',
    borderRadius: '18px',
    padding: 'clamp(12px, 1.6vw, 18px) clamp(20px, 2.5vw, 32px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    boxShadow: '0 8px 24px rgba(45, 42, 94, 0.25)',
  },
  pinLabel: {
    fontSize: 'clamp(10px, 1.1vw, 12px)',
    opacity: 0.9,
    fontWeight: 800,
    letterSpacing: '2px',
    fontFamily: BRAND_FONT_DISPLAY,
  },
  pinValue: {
    fontSize: 'clamp(24px, 3vw, 36px)',
    fontWeight: '800',
    fontFamily: BRAND_FONT_DISPLAY,
    letterSpacing: '6px',
    textShadow: '0 2px 8px rgba(45, 42, 94, 0.4)',
  },
  statusBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(255,255,255,0.15)',
    padding: 'clamp(10px, 1.4vw, 16px) clamp(16px, 2vw, 24px)',
    borderRadius: '999px',
    border: '1px solid rgba(255,255,255,0.3)',
  },
  statusDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: palette.softGreen,
    boxShadow: `0 0 12px ${palette.softGreen}`,
  },
  statusText: {
    fontSize: 'clamp(13px, 1.4vw, 16px)',
    fontWeight: 700,
    fontFamily: BRAND_FONT_DISPLAY,
    textShadow: '0 1px 4px rgba(45, 42, 94, 0.4)',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 'clamp(16px, 2vw, 24px)',
  },
  myCard: {
    background: 'rgba(255,255,255,0.18)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '28px',
    padding: 'clamp(28px, 3.5vw, 44px)',
    textAlign: 'center',
    border: '2px solid rgba(255,215,0,0.5)',
    boxShadow: '0 0 40px rgba(255,215,0,0.25), inset 0 1px 0 rgba(255,255,255,0.3)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  myCardLabel: {
    fontSize: 'clamp(14px, 1.5vw, 18px)',
    fontWeight: '800',
    marginBottom: '20px',
    opacity: 0.95,
    fontFamily: BRAND_FONT_DISPLAY,
    textShadow: '0 1px 6px rgba(45, 42, 94, 0.4)',
  },
  myAvatarWrapper: {
    width: 'clamp(140px, 18vw, 200px)',
    height: 'clamp(140px, 18vw, 200px)',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    border: '4px solid white',
    position: 'relative',
    boxShadow: '0 8px 24px rgba(45, 42, 94, 0.4)',
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
    fontSize: 'clamp(64px, 9vw, 100px)',
    marginTop: '28px',
  },
  myName: {
    fontSize: 'clamp(22px, 2.8vw, 34px)',
    fontWeight: '800',
    margin: '0 0 8px 0',
    fontFamily: BRAND_FONT_DISPLAY,
    textShadow: '0 1px 8px rgba(45, 42, 94, 0.4)',
  },
  myHint: {
    fontSize: 'clamp(13px, 1.4vw, 16px)',
    opacity: 0.9,
    margin: 0,
    fontWeight: 600,
    fontFamily: BRAND_FONT_BODY,
    textShadow: '0 1px 4px rgba(45, 42, 94, 0.4)',
  },
  playersCard: {
    background: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '28px',
    padding: 'clamp(20px, 3vw, 32px)',
    border: '2px solid rgba(255,255,255,0.25)',
    boxShadow: '0 8px 24px rgba(45, 42, 94, 0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: 'min(560px, 70vh)',
  },
  playersHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    paddingBottom: '16px',
    borderBottom: '2px solid rgba(255,255,255,0.2)',
  },
  playersTitle: {
    fontSize: 'clamp(16px, 1.8vw, 22px)',
    fontWeight: '800',
    fontFamily: BRAND_FONT_DISPLAY,
    textShadow: '0 1px 6px rgba(45, 42, 94, 0.4)',
  },
  playersCount: {
    fontSize: 'clamp(16px, 1.8vw, 22px)',
    fontWeight: '800',
    background: 'rgba(255,255,255,0.25)',
    padding: '4px 14px',
    borderRadius: '999px',
    fontFamily: BRAND_FONT_DISPLAY,
    border: '1px solid rgba(255,255,255,0.3)',
  },
  playersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    overflowY: 'auto',
    flex: 1,
    paddingRight: '4px',
  },
  playerItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: 'clamp(10px, 1.4vw, 16px) clamp(14px, 1.8vw, 20px)',
    background: 'rgba(255,255,255,0.12)',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  playerItemMe: {
    background: 'rgba(138, 177, 125, 0.3)',
    border: `2px solid ${palette.softGreen}`,
  },
  playerAvatarWrapper: {
    width: 'clamp(40px, 5vw, 56px)',
    height: 'clamp(40px, 5vw, 56px)',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    flexShrink: 0,
    position: 'relative',
    border: '1px solid rgba(255,255,255,0.35)',
  },
  playerAvatarImg: {
    width: '100%',
    height: '130%',
    objectFit: 'cover',
    objectPosition: 'center 15%',
    position: 'absolute',
    top: '0',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  playerAvatarEmoji: {
    fontSize: 'clamp(20px, 2.4vw, 28px)',
    marginTop: '8px',
  },
  playerName: {
    flex: 1,
    fontSize: 'clamp(14px, 1.5vw, 18px)',
    fontWeight: '700',
    fontFamily: BRAND_FONT_BODY,
    textShadow: '0 1px 4px rgba(45, 42, 94, 0.4)',
  },
  youTag: {
    color: '#A5FFB0',
    fontSize: 'clamp(11px, 1.2vw, 14px)',
    fontWeight: 800,
    fontFamily: BRAND_FONT_DISPLAY,
  },
  playerReady: {
    width: 'clamp(24px, 3vw, 32px)',
    height: 'clamp(24px, 3vw, 32px)',
    borderRadius: '50%',
    background: palette.softGreen,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'clamp(12px, 1.5vw, 16px)',
    fontWeight: 800,
    color: 'white',
    boxShadow: '0 2px 8px rgba(138, 177, 125, 0.5)',
    flexShrink: 0,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    opacity: 0.8,
    textAlign: 'center',
    fontFamily: BRAND_FONT_BODY,
  },
  cancelBtn: {
    padding: 'clamp(14px, 1.8vw, 20px) clamp(30px, 4vw, 60px)',
    background: 'rgba(255,255,255,0.22)',
    color: 'white',
    border: '2px solid rgba(255,255,255,0.4)',
    borderRadius: '16px',
    fontSize: 'clamp(15px, 1.6vw, 20px)',
    fontWeight: '800',
    cursor: 'pointer',
    fontFamily: BRAND_FONT_DISPLAY,
    transition: 'all 0.2s',
    boxShadow: `0 4px 0 ${palette.coralShadow}`,
    letterSpacing: '0.5px',
    alignSelf: 'center',
    width: '100%',
    maxWidth: '480px',
  },
};

export default LivePlayerLobby;