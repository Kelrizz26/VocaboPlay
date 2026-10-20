// src/components/dashboard/LivePlayerLobby.jsx
// ============================================================
// ✅ STUDENT LOBBY - FULL SIZE
// ✅ UPDATED: Solid Dark Navy Containers + Full Body Avatars
// ============================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeToSession } from '../../services/LiveGameService';

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

            {/* ✅ FULL BODY AVATAR CONTAINER */}
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
                      {/* ✅ FULL BODY AVATAR FOR LIST */}
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
                  <p style={{ fontWeight: 600, marginTop: '8px' }}>Waiting for players to join</p>
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
    background: palette.deepNavy,
    border: `1.5px solid ${palette.deepNavyLight}`,
    borderLeft: `5px solid ${palette.warmOrange}`,
    borderRadius: '18px',
    padding: 'clamp(12px, 1.6vw, 18px) clamp(20px, 2.5vw, 32px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    boxShadow: `0 8px 24px rgba(0,0,0,0.25)`,
  },
  pinLabel: {
    fontSize: 'clamp(10px, 1.1vw, 12px)',
    color: palette.bodyTextSoft,
    fontWeight: 800,
    letterSpacing: '2px',
    fontFamily: BRAND_FONT_DISPLAY,
  },
  pinValue: {
    fontSize: 'clamp(24px, 3vw, 36px)',
    fontWeight: '800',
    fontFamily: BRAND_FONT_DISPLAY,
    letterSpacing: '6px',
    color: palette.white,
  },
  statusBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: palette.deepNavy,
    padding: 'clamp(10px, 1.4vw, 16px) clamp(16px, 2vw, 24px)',
    borderRadius: '999px',
    border: `1.5px solid ${palette.deepNavyLight}`,
    boxShadow: `0 8px 24px rgba(0,0,0,0.25)`,
  },
  statusDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: palette.softGreen,
    boxShadow: `0 0 10px ${palette.softGreen}80`,
  },
  statusText: {
    fontSize: 'clamp(13px, 1.4vw, 16px)',
    fontWeight: 800,
    fontFamily: BRAND_FONT_DISPLAY,
    color: palette.white,
    letterSpacing: '0.02em',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 'clamp(16px, 2vw, 24px)',
  },
  myCard: {
    background: palette.deepNavy,
    borderRadius: '28px',
    padding: 'clamp(28px, 3.5vw, 44px)',
    textAlign: 'center',
    border: `1.5px solid ${palette.deepNavyLight}`,
    borderTop: `6px solid ${palette.warmOrange}`,
    boxShadow: `0 12px 32px rgba(0,0,0,0.25)`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  myCardLabel: {
    fontSize: 'clamp(14px, 1.5vw, 18px)',
    fontWeight: '800',
    marginBottom: '20px',
    color: palette.warmOrange,
    fontFamily: BRAND_FONT_DISPLAY,
    letterSpacing: '0.02em',
  },
  
  // ✅ BAGONG FULL BODY AVATAR STYLE
  myAvatarWrapper: {
    width: 'clamp(140px, 18vw, 200px)',
    height: 'clamp(160px, 20vw, 220px)', // Mas mataas kaysa sa lapad
    borderRadius: '24px', // Rounded rectangle
    background: palette.creamSoft, // Light background para kita ang avatar
    overflow: 'hidden',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `4px solid ${palette.warmOrange}80`,
    boxShadow: `0 8px 24px rgba(0,0,0,0.3)`,
  },
  myAvatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain', // ✅ ITO ANG MAGPAPAKITA NG BUONG KATAWAN
    padding: '10px',
  },
  myAvatarEmoji: {
    fontSize: 'clamp(64px, 9vw, 100px)',
  },
  
  myName: {
    fontSize: 'clamp(22px, 2.8vw, 34px)',
    fontWeight: '800',
    margin: '0 0 8px 0',
    fontFamily: BRAND_FONT_DISPLAY,
    color: palette.white,
  },
  myHint: {
    fontSize: 'clamp(13px, 1.4vw, 16px)',
    color: palette.bodyTextSoft,
    margin: 0,
    fontWeight: 700,
    fontFamily: BRAND_FONT_BODY,
  },
  playersCard: {
    background: palette.deepNavy,
    borderRadius: '28px',
    padding: 'clamp(20px, 3vw, 32px)',
    border: `1.5px solid ${palette.deepNavyLight}`,
    boxShadow: `0 12px 32px rgba(0,0,0,0.25)`,
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
    borderBottom: `1.5px solid ${palette.deepNavyLight}`,
  },
  playersTitle: {
    fontSize: 'clamp(16px, 1.8vw, 22px)',
    fontWeight: '800',
    fontFamily: BRAND_FONT_DISPLAY,
    color: palette.white,
    letterSpacing: '-0.3px',
  },
  playersCount: {
    fontSize: 'clamp(16px, 1.8vw, 22px)',
    fontWeight: '800',
    background: palette.deepNavyLight,
    color: palette.white,
    padding: '4px 14px',
    borderRadius: '999px',
    fontFamily: BRAND_FONT_DISPLAY,
    border: `1.5px solid #4A476B`,
    boxShadow: `0 2px 4px rgba(0,0,0,0.2)`,
    minWidth: '42px',
    textAlign: 'center',
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
    padding: 'clamp(8px, 1vw, 12px) clamp(14px, 1.8vw, 20px)',
    background: palette.deepNavyLight,
    borderRadius: '16px',
    border: `1.5px solid #4A476B`,
    boxShadow: `0 2px 4px rgba(0,0,0,0.2)`,
  },
  playerItemMe: {
    background: `rgba(127, 165, 116, 0.2)`,
    border: `2px solid ${palette.softGreen}`,
    boxShadow: `0 2px 8px ${palette.softGreen}40`,
  },
  
  // ✅ FULL BODY AVATAR SA LIST
  playerAvatarWrapper: {
    width: 'clamp(36px, 4.5vw, 48px)',
    height: 'clamp(44px, 5.5vw, 60px)', // Mas mataas kaysa lapad
    borderRadius: '10px', // Rounded rectangle
    background: palette.creamSoft,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: `1.5px solid ${palette.warmOrange}80`,
  },
  playerAvatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain', // ✅ BUONG KATAWAN DIN DITO
    padding: '2px',
  },
  playerAvatarEmoji: {
    fontSize: 'clamp(20px, 2.4vw, 28px)',
  },
  
  playerName: {
    flex: 1,
    fontSize: 'clamp(14px, 1.5vw, 18px)',
    fontWeight: '700',
    fontFamily: BRAND_FONT_BODY,
    color: palette.white,
  },
  youTag: {
    color: palette.softGreen,
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
    color: palette.white,
    boxShadow: `0 2px 0 ${palette.softGreenShadow}`,
    flexShrink: 0,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    color: palette.bodyTextSoft,
    textAlign: 'center',
    fontFamily: BRAND_FONT_BODY,
  },
  cancelBtn: {
    padding: 'clamp(14px, 1.8vw, 20px) clamp(30px, 4vw, 60px)',
    background: palette.deepNavy,
    color: palette.coral,
    border: `2px solid ${palette.coral}80`,
    borderRadius: '16px',
    fontSize: 'clamp(15px, 1.6vw, 20px)',
    fontWeight: '800',
    cursor: 'pointer',
    fontFamily: BRAND_FONT_DISPLAY,
    transition: 'all 0.2s',
    boxShadow: `0 4px 12px rgba(0,0,0,0.25)`,
    letterSpacing: '0.5px',
    alignSelf: 'center',
    width: '100%',
    maxWidth: '480px',
  },
};

export default LivePlayerLobby;