// src/components/dashboard/LiveJoinModal.jsx
// ============================================================
// ✅ JOIN LIVE GAME MODAL - FULL SIZE
// ✅ FIXED: Auto-assigns account name (DisplayName or Username).
// ✅ REMOVED: Name input box. Read-only display instead.
// ============================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../../pages/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getAvatarById, DEFAULT_AVATAR_ID } from '../../data/avatarShop';
import { joinLiveSession } from '../../services/LiveGameService';

const palette = {
  warmOrange: '#E9A075', warmOrangeShadow: '#C27E4F',
  coral: '#DB7A64', coralShadow: '#A95845',
  teal: '#4F9188', tealShadow: '#3A6A63',
  deepNavy: '#2A2845', deepNavyLight: '#3A3757',
  bodyText: '#6B6880', bodyTextSoft: '#8A8799',
  cream: '#FDF9F3', creamSoft: '#F5EFE6',
  white: '#FFFFFF', border: '#EBE2D5', borderSoft: '#F2EBE0',
  softGreen: '#7FA574', softGreenShadow: '#5E7F55',
  gold: '#C9A227', shadow: 'rgba(42, 40, 69, 0.06)', shadowMd: 'rgba(42, 40, 69, 0.10)',
};

const BRAND_FONT_DISPLAY = "'Fredoka', sans-serif";
const BRAND_FONT_BODY = "'Nunito', sans-serif";

const LiveJoinModal = ({ onClose, onJoined }) => {
  const [pin, setPin] = useState('');
  const [name, setName] = useState(''); 
  const [avatarId, setAvatarId] = useState(DEFAULT_AVATAR_ID);
  const [avatarImage, setAvatarImage] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userProfile, setUserProfile] = useState(null);

  const localUserId = localStorage.getItem('userId');

  useEffect(() => {
    const loadProfile = async () => {
      const user = auth.currentUser;
      if (!user) return; 

      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          const equippedId = data.equippedAvatar || DEFAULT_AVATAR_ID;
          const avatar = getAvatarById(equippedId);

          // ✅ SMART NAME RESOLUTION: Kung "User" ang displayName, gamitin ang username
          const invalidNames = ['User', 'New User', 'Student', 'Unknown', 'New', ''];
          let resolvedName = data.displayName;
          if (!resolvedName || invalidNames.includes(resolvedName.trim())) {
            resolvedName = data.username || 'Student';
          }

          setUserProfile({
            userId: localUserId || user.uid,
            avatarId: equippedId,
            avatarImage: avatar?.image || ''
          });
          
          setName(resolvedName); // ✅ Iset ang resolved name
          setAvatarId(equippedId);
          setAvatarImage(avatar?.image || '');
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      }
    };

    loadProfile();
  }, [localUserId]);

  const handlePinChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPin(value);
    setError('');
  };

  const handleFindSession = async () => {
    if (pin.length !== 6) {
      setError('Please enter a valid 6-digit PIN');
      return;
    }
    setLoading(true); setError('');
    try { setStep(2); } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const handleConfirmJoin = async () => {
    if (!name) { setError('Profile is still loading. Please wait.'); return; }

    setLoading(true); setError('');

    try {
      const result = await joinLiveSession(pin, {
        userId: userProfile?.userId || localUserId || auth.currentUser?.uid,
        name: name, // ✅ Gagamitin ang auto-resolved name
        avatarId: avatarId,
        avatarImage: avatarImage
      });
      onJoined(result);
    } catch (err) {
      setError(err.message);
      if (err.message.includes('PIN') || err.message.includes('session')) setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        style={styles.modalContent}
      >
        <button style={styles.closeBtn} onClick={onClose}>✕</button>

        {step === 1 && (
          <div style={styles.stepWrap}>
            <div style={styles.iconHeader}>🎮</div>
            <h2 style={styles.title}>Join Live Game</h2>
            <p style={styles.subtitle}>Enter the PIN from your teacher</p>
            {error && <div style={styles.errorMsg}>{error}</div>}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Game PIN</label>
              <input type="text" inputMode="numeric" placeholder="000000" value={pin} onChange={handlePinChange} style={styles.pinInput} maxLength={6} autoFocus />
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleFindSession} disabled={pin.length !== 6 || loading} style={{ ...styles.primaryBtn, opacity: pin.length !== 6 || loading ? 0.5 : 1 }}>
              {loading ? 'Searching...' : 'Continue →'}
            </motion.button>
          </div>
        )}

        {step === 2 && (
          <div style={styles.stepWrap}>
            <div style={styles.iconHeader}>✨</div>
            <h2 style={styles.title}>Confirm Profile</h2>
            <p style={styles.subtitle}>You will appear in the game as:</p>
            
            {error && <div style={styles.errorMsg}>{error}</div>}
            
            <div style={styles.avatarPreview}>
              {avatarImage ? <img src={avatarImage} alt="Avatar" style={styles.avatarImg} /> : <span style={styles.avatarEmoji}>👤</span>}
            </div>

            {/* ✅ READ-ONLY NAME DISPLAY (Walang input box) */}
            <div style={styles.nameDisplayBox}>
              <div style={styles.nameDisplayLabel}>Your Name</div>
              <div style={styles.nameDisplayValue}>{name || 'Loading...'}</div>
            </div>

            <div style={styles.actionsRow}>
              <button onClick={() => setStep(1)} style={styles.backBtn} disabled={loading}>← Back</button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleConfirmJoin} disabled={loading || !name} style={{ ...styles.primaryBtn, flex: 2, marginTop: 0, opacity: loading || !name ? 0.5 : 1 }}>
                {loading ? 'Joining...' : '🚀 Join Game'}
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const styles = {
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(42, 40, 69, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', padding: 'clamp(16px, 3vw, 40px)' },
  modalContent: { background: 'rgba(255, 255, 255, 0.92)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderRadius: '28px', padding: 'clamp(28px, 4vw, 56px)', width: '100%', maxWidth: 'min(680px, 100%)', minHeight: 'min(620px, calc(100vh - 80px))', color: palette.deepNavy, position: 'relative', boxShadow: `0 25px 60px rgba(42, 40, 69, 0.3)`, fontFamily: BRAND_FONT_BODY, border: `1.5px solid rgba(255, 255, 255, 0.8)`, display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  stepWrap: { display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, width: '100%' },
  closeBtn: { position: 'absolute', top: '18px', right: '22px', background: 'rgba(255, 255, 255, 0.6)', border: `1.5px solid rgba(0, 0, 0, 0.05)`, color: palette.deepNavy, width: '40px', height: '40px', borderRadius: '50%', fontSize: '18px', cursor: 'pointer', fontWeight: 800, zIndex: 10, boxShadow: `0 4px 12px rgba(0,0,0,0.1)`, fontFamily: BRAND_FONT_DISPLAY },
  iconHeader: { fontSize: 'clamp(52px, 7vw, 76px)', textAlign: 'center', marginBottom: '16px', filter: 'drop-shadow(0 6px 14px rgba(42, 40, 69, 0.18))' },
  title: { fontSize: 'clamp(26px, 3.6vw, 38px)', fontWeight: '800', margin: '0 0 10px 0', textAlign: 'center', fontFamily: BRAND_FONT_DISPLAY, letterSpacing: '-0.5px', color: palette.deepNavy },
  subtitle: { fontSize: 'clamp(14px, 1.4vw, 17px)', color: palette.bodyText, margin: '0 0 28px 0', textAlign: 'center', fontWeight: 600 },
  errorMsg: { background: `rgba(219, 122, 100, 0.15)`, border: `1.5px solid ${palette.coral}`, color: palette.coral, padding: '12px 16px', borderRadius: '12px', marginBottom: '16px', textAlign: 'center', fontSize: '13px', fontWeight: '800', fontFamily: BRAND_FONT_BODY },
  fieldGroup: { marginBottom: '18px' },
  label: { fontSize: '13px', fontWeight: '800', display: 'block', marginBottom: '8px', color: palette.bodyText, fontFamily: BRAND_FONT_DISPLAY, letterSpacing: '0.06em', textTransform: 'uppercase' },
  
  // ✅ BAGONG STYLE PARA SA READ-ONLY NAME
  nameDisplayBox: { 
    width: '100%', 
    padding: '16px 20px', 
    border: `1.5px solid ${palette.warmOrange}50`, 
    borderRadius: '14px', 
    background: palette.creamSoft, 
    textAlign: 'center',
    marginBottom: '24px'
  },
  nameDisplayLabel: { 
    fontSize: '11px', 
    fontWeight: 800, 
    color: palette.bodyTextSoft, 
    textTransform: 'uppercase', 
    letterSpacing: '1px', 
    marginBottom: '4px',
    fontFamily: BRAND_FONT_DISPLAY
  },
  nameDisplayValue: { 
    fontSize: 'clamp(20px, 2.5vw, 28px)', 
    fontWeight: 800, 
    color: palette.deepNavy, 
    fontFamily: BRAND_FONT_DISPLAY 
  },

  pinInput: { width: '100%', padding: '24px 20px', border: `1.5px solid rgba(0, 0, 0, 0.08)`, borderRadius: '16px', fontSize: 'clamp(32px, 5vw, 44px)', fontWeight: '800', background: 'rgba(255, 255, 255, 0.6)', color: palette.deepNavy, fontFamily: BRAND_FONT_DISPLAY, boxSizing: 'border-box', outline: 'none', textAlign: 'center', letterSpacing: '10px' },
  primaryBtn: { width: '100%', padding: '18px 24px', background: palette.softGreen, color: palette.white, border: 'none', borderRadius: '16px', fontSize: '17px', fontWeight: '800', cursor: 'pointer', fontFamily: BRAND_FONT_DISPLAY, boxShadow: `0 4px 0 ${palette.softGreenShadow}`, marginTop: '8px', letterSpacing: '0.5px', transition: 'all 0.15s ease' },
  avatarPreview: { width: 'clamp(140px, 20vw, 160px)', height: 'clamp(170px, 24vw, 200px)', margin: '0 auto 24px', borderRadius: '24px', background: palette.creamSoft, border: `3px solid ${palette.warmOrange}`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 24px rgba(42, 40, 69, 0.15)` },
  avatarImg: { width: '100%', height: '100%', objectFit: 'contain', padding: '8px' },
  avatarEmoji: { fontSize: 'clamp(52px, 8vw, 72px)' },
  actionsRow: { display: 'flex', gap: '12px', marginTop: '8px' },
  backBtn: { flex: 1, padding: '18px 24px', background: 'rgba(255, 255, 255, 0.6)', color: palette.deepNavy, border: `1.5px solid rgba(0, 0, 0, 0.08)`, borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', fontFamily: BRAND_FONT_DISPLAY, letterSpacing: '0.5px', boxShadow: `0 4px 12px rgba(0,0,0,0.05)` },
};

export default LiveJoinModal;