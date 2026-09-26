// src/components/dashboard/AvatarShop.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../../pages/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { 
  AVATAR_SHOP_ITEMS, 
  RARITY_CONFIG, 
  DEFAULT_AVATAR_ID 
} from '../../data/avatarShop';
import { colors, fontFamily } from './dashboardStyles';

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

// ============================================================
// ✅ RARITY SIDEBAR CONFIG
// ============================================================
const RARITY_SIDEBAR = [
  { id: 'all', label: 'All', icon: '🌈', color: '#F4A261' },
  { id: 'free', label: 'Free', icon: '🎁', color: '#8AB17D' },
  { id: 'common', label: 'Common', icon: '🟢', color: '#8AB17D' },
  { id: 'rare', label: 'Rare', icon: '🔵', color: '#2A9D8F' },
  { id: 'epic', label: 'Epic', icon: '🟣', color: '#E76F51' },
  { id: 'legendary', label: 'Legend', icon: '🟡', color: '#F4A261' }
];

// ============================================================
// ✅ AVATAR SHOP
// ============================================================
const AvatarShop = ({ currentPoints, onPointsChange, onEquipChange }) => {
  const [ownedAvatars, setOwnedAvatars] = useState([]);
  const [equippedAvatar, setEquippedAvatar] = useState(DEFAULT_AVATAR_ID);
  const [previewAvatar, setPreviewAvatar] = useState(DEFAULT_AVATAR_ID);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // ===== LOAD USER DATA =====
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setLoading(false);
          return;
        }

        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          const freeAvatarIds = AVATAR_SHOP_ITEMS
            .filter(a => a.price === 0)
            .map(a => a.id);
          
          let owned = data.ownedAvatars || [];
          const newFreeAvatars = freeAvatarIds.filter(id => !owned.includes(id));
          
          if (newFreeAvatars.length > 0) {
            owned = [...owned, ...newFreeAvatars];
            await updateDoc(userRef, { ownedAvatars: owned });
          }
          
          setOwnedAvatars(owned);
          const equipped = data.equippedAvatar || DEFAULT_AVATAR_ID;
          setEquippedAvatar(equipped);
          setPreviewAvatar(equipped);
        } else {
          const freeAvatarIds = AVATAR_SHOP_ITEMS
            .filter(a => a.price === 0)
            .map(a => a.id);
          setOwnedAvatars(freeAvatarIds);
        }
      } catch (err) {
        console.error('Error loading avatar data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // ===== RESPONSIVE BREAKPOINTS =====
  useEffect(() => {
    const checkViewport = () => {
      const w = window.innerWidth;
      setScreenWidth(w);
      setIsMobileView(w < 900);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // ===== AUTO-HIDE MESSAGE =====
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  // ===== BUY =====
  const handleBuy = async () => {
    const avatarToBuy = previewAvatar;
    const avatarData = AVATAR_SHOP_ITEMS.find(a => a.id === avatarToBuy);
    
    if (!avatarData) return;
    const user = auth.currentUser;
    if (!user) return;

    if (ownedAvatars.includes(avatarToBuy)) {
      setMessage({ type: 'error', text: '✅ Already owned!' });
      setShowBuyModal(false);
      return;
    }

    if (currentPoints < avatarData.price) {
      setMessage({ 
        type: 'error', 
        text: `❌ Not enough points! Need ${avatarData.price - currentPoints} more.` 
      });
      setShowBuyModal(false);
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      const newPoints = currentPoints - avatarData.price;
      const newOwned = [...ownedAvatars, avatarToBuy];

      await updateDoc(userRef, {
        totalPoints: newPoints,
        ownedAvatars: newOwned
      });

      setOwnedAvatars(newOwned);
      onPointsChange(newPoints);
      setMessage({ type: 'success', text: `✅ Purchased ${avatarData.name}!` });
      setShowBuyModal(false);
    } catch (err) {
      console.error('Error buying avatar:', err);
      setMessage({ type: 'error', text: '❌ Purchase failed. Try again.' });
    }
  };

  // ===== EQUIP =====
  const handleEquip = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { equippedAvatar: previewAvatar });
      
      setEquippedAvatar(previewAvatar);
      setMessage({ type: 'success', text: '✅ Avatar equipped!' });
      
      if (onEquipChange) onEquipChange(previewAvatar);
    } catch (err) {
      console.error('Error equipping avatar:', err);
      setMessage({ type: 'error', text: '❌ Equip failed.' });
    }
  };

  // ===== RESET =====
  const handleReset = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { equippedAvatar: DEFAULT_AVATAR_ID });
      
      setEquippedAvatar(DEFAULT_AVATAR_ID);
      setPreviewAvatar(DEFAULT_AVATAR_ID);
      setMessage({ type: 'success', text: '↺ Reset to default!' });
      
      if (onEquipChange) onEquipChange(DEFAULT_AVATAR_ID);
    } catch (err) {
      console.error('Error resetting avatar:', err);
      setMessage({ type: 'error', text: '❌ Reset failed.' });
    }
  };

  // ===== FILTERED =====
  const filteredAvatars = selectedRarity === 'all'
    ? AVATAR_SHOP_ITEMS
    : AVATAR_SHOP_ITEMS.filter(a => a.rarity === selectedRarity);

  // ===== PREVIEW DATA =====
  const previewData = AVATAR_SHOP_ITEMS.find(a => a.id === previewAvatar);
  const previewRarity = previewData?.rarity || 'free';
  const previewConfig = RARITY_CONFIG[previewRarity];
  const isPreviewOwned = ownedAvatars.includes(previewAvatar);
  const isPreviewEquipped = equippedAvatar === previewAvatar;
  const canAfford = currentPoints >= (previewData?.price || 0);

  // ===== DYNAMIC GRID COLUMNS (5 ON MOBILE, AUTO ON DESKTOP) =====
  const getGridColumns = () => {
    if (screenWidth < 900) return 'repeat(5, 1fr)';   // FORCE 5 columns sa mobile/tablet
    return 'repeat(auto-fill, minmax(120px, 1fr))';   // auto-fill sa desktop
  };

  // ===== DYNAMIC CARD SIZES =====
  const isCompact = screenWidth < 480;
  const isPhone = screenWidth < 640;

  // ===== LOADING =====
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        background: palette.white,
        border: `2px solid ${palette.border}`,
        borderRadius: '24px',
        padding: '60px',
        color: palette.deepNavy,
        fontFamily: BRAND_FONT_BODY,
        boxShadow: '0 10px 30px rgba(244, 162, 97, 0.14)',
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            width: '50px',
            height: '50px',
            border: `4px solid ${palette.border}`,
            borderTop: `4px solid ${palette.warmOrange}`,
            borderRadius: '50%',
            marginBottom: '20px'
          }}
        />
        <span style={{ fontWeight: 700, fontFamily: BRAND_FONT_DISPLAY }}>Loading Avatar Shop...</span>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: '1400px',
      margin: '0 auto',
      padding: isMobileView ? '4px' : '20px',
      fontFamily: BRAND_FONT_BODY,
      borderRadius: isMobileView ? '0px' : '24px',
      position: 'relative',
      overflow: 'hidden',
      backgroundImage: `url(/image/bg-shop.png)`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      minHeight: '100vh'
    }}>

      {/* WARM OVERLAY (brand tint) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(135deg, ${palette.warmOrange}80 0%, ${palette.coral}80 100%)`,
        pointerEvents: 'none'
      }} />

      {/* CONTENT WRAPPER */}
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* LOCAL RESPONSIVE STYLES — FORCED 5 COLUMNS */}
        <style>{`
          /* FORCE 5 COLUMNS on mobile - highest specificity */
          @media (max-width: 900px) {
            .shop-avatar-grid {
              grid-template-columns: repeat(5, 1fr) !important;
              gap: 4px !important;
            }
          }
          @media (max-width: 640px) {
            .shop-preview-panel {
              padding: 12px !important;
            }
            .shop-preview-image {
              aspect-ratio: 1.6 !important;
            }
            .shop-modal-content {
              padding: 20px 16px !important;
              border-radius: 22px !important;
            }
            .shop-modal-image {
              width: 100px !important;
              height: 100px !important;
            }
            .shop-avatar-grid {
              grid-template-columns: repeat(5, 1fr) !important;
              gap: 4px !important;
            }
            .shop-avatar-card {
              padding: 3px !important;
            }
            .shop-avatar-img-wrap {
              margin-top: 6px !important;
              padding: 1px !important;
            }
            .shop-avatar-name {
              font-size: 6px !important;
              margin-top: 3px !important;
            }
            .shop-avatar-price {
              font-size: 5px !important;
            }
            .shop-rarity-badge {
              font-size: 5px !important;
              padding: 1px 2px !important;
            }
          }
          @media (max-width: 480px) {
            .shop-avatar-grid {
              grid-template-columns: repeat(5, 1fr) !important;
              gap: 4px !important;
            }
            .shop-avatar-card {
              padding: 3px !important;
            }
            .shop-avatar-img-wrap {
              margin-top: 6px !important;
              padding: 1px !important;
            }
            .shop-avatar-name {
              font-size: 6px !important;
              margin-top: 3px !important;
            }
            .shop-avatar-price {
              font-size: 5px !important;
            }
            .shop-rarity-badge {
              font-size: 5px !important;
              padding: 1px 2px !important;
            }
          }
          @media (max-width: 400px) {
            .shop-modal-content {
              padding: 16px 12px !important;
            }
            .shop-modal-image {
              width: 80px !important;
              height: 80px !important;
            }
            .shop-avatar-grid {
              gap: 3px !important;
            }
          }
        `}</style>

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '20px',
            padding: isMobileView ? '10px' : '20px 24px',
            marginBottom: '8px',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            boxShadow: '0 8px 32px 0 rgba(45, 42, 94, 0.25)'
          }}
        >
          <div>
            <h1 style={{
              fontSize: isCompact ? '16px' : (isMobileView ? '18px' : '26px'),
              fontWeight: '700',
              margin: '0 0 2px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              textShadow: '0 2px 8px rgba(45, 42, 94, 0.4)',
              fontFamily: BRAND_FONT_DISPLAY,
            }}>
              🛍️ Avatar Shop
            </h1>
            <p style={{ 
              fontSize: isCompact ? '10px' : (isMobileView ? '11px' : '13px'), 
              margin: 0,
              textShadow: '0 1px 4px rgba(45, 42, 94, 0.4)',
              opacity: 0.95,
              fontWeight: 600,
              fontFamily: BRAND_FONT_BODY,
            }}>
              Choose your anime character!
            </p>
          </div>
          
          <motion.div
            key={currentPoints}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            style={{
              background: 'rgba(255, 255, 255, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              padding: isCompact ? '6px 10px' : (isMobileView ? '8px 14px' : '10px 18px'),
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 16px rgba(45, 42, 94, 0.2)'
            }}
          >
            <span style={{ fontSize: isCompact ? '14px' : (isMobileView ? '16px' : '20px') }}>💰</span>
            <div>
              <div style={{ fontSize: '8px', opacity: 0.9, fontWeight: 700, fontFamily: BRAND_FONT_DISPLAY, letterSpacing: '0.05em' }}>POINTS</div>
              <div style={{ fontSize: isCompact ? '14px' : (isMobileView ? '16px' : '20px'), fontWeight: '800', fontFamily: BRAND_FONT_DISPLAY }}>
                {currentPoints.toLocaleString()}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* MESSAGE */}
        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              style={{
                background: message.type === 'success' 
                  ? 'rgba(138, 177, 125, 0.6)' 
                  : 'rgba(231, 111, 81, 0.6)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: `1px solid ${message.type === 'success' 
                  ? 'rgba(138, 177, 125, 0.8)' 
                  : 'rgba(231, 111, 81, 0.8)'}`,
                color: 'white',
                padding: '10px 14px',
                borderRadius: '12px',
                marginBottom: '8px',
                fontSize: '13px',
                fontWeight: 700,
                fontFamily: BRAND_FONT_BODY,
                textShadow: '0 1px 4px rgba(45, 42, 94, 0.4)',
                boxShadow: '0 4px 16px rgba(45, 42, 94, 0.2)'
              }}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN LAYOUT */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobileView ? '1fr' : '80px 1fr 340px',
          gap: '8px',
          alignItems: 'stretch'
        }}>

          {/* LEFT: RARITY SIDEBAR (desktop only) */}
          {!isMobileView && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '20px',
                padding: '12px 8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                height: 'fit-content',
                position: 'sticky',
                top: '20px',
                boxShadow: '0 8px 32px 0 rgba(45, 42, 94, 0.25)'
              }}
            >
              {RARITY_SIDEBAR.map((rarity) => (
                <motion.button
                  key={rarity.id}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedRarity(rarity.id)}
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    borderRadius: '14px',
                    border: selectedRarity === rarity.id 
                      ? `2px solid ${rarity.color}` 
                      : '1px solid rgba(255,255,255,0.2)',
                    background: selectedRarity === rarity.id 
                      ? `${rarity.color}CC`
                      : 'rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    gap: '2px',
                    padding: '6px',
                    transition: 'all 0.2s ease',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    boxShadow: selectedRarity === rarity.id 
                      ? `0 4px 16px ${rarity.color}66` 
                      : 'none'
                  }}
                >
                  <span style={{ fontSize: '22px' }}>{rarity.icon}</span>
                  <span style={{
                    fontSize: '9px',
                    fontWeight: '700',
                    color: 'white',
                    textTransform: 'uppercase',
                    textShadow: '0 1px 3px rgba(45, 42, 94, 0.5)',
                    fontFamily: BRAND_FONT_DISPLAY,
                    letterSpacing: '0.05em'
                  }}>
                    {rarity.label}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* MIDDLE: AVATAR GRID */}
          <div>
            {isMobileView && (
              <div style={{
                display: 'flex',
                gap: '5px',
                marginBottom: '8px',
                overflowX: 'auto',
                paddingBottom: '4px',
                WebkitOverflowScrolling: 'touch'
              }}>
                {RARITY_SIDEBAR.map((rarity) => (
                  <button
                    key={rarity.id}
                    onClick={() => setSelectedRarity(rarity.id)}
                    style={{
                      padding: isCompact ? '4px 8px' : '6px 10px',
                      borderRadius: '8px',
                      border: selectedRarity === rarity.id 
                        ? `2px solid ${rarity.color}` 
                        : '1px solid rgba(255,255,255,0.3)',
                      background: selectedRarity === rarity.id 
                        ? `${rarity.color}CC`
                        : 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(15px)',
                      WebkitBackdropFilter: 'blur(15px)',
                      color: 'white',
                      fontSize: isCompact ? '9px' : '11px',
                      fontWeight: '800',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      flexShrink: 0,
                      textShadow: '0 1px 3px rgba(45, 42, 94, 0.5)',
                      fontFamily: BRAND_FONT_DISPLAY,
                    }}
                  >
                    {rarity.icon} {rarity.label}
                  </button>
                ))}
              </div>
            )}

            <motion.div
              layout
              className="shop-avatar-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: getGridColumns(),
                gap: isMobileView ? '4px' : '12px'
              }}
            >
              <AnimatePresence>
                {filteredAvatars.map((avatar, index) => {
                  const isOwned = ownedAvatars.includes(avatar.id);
                  const isEquipped = equippedAvatar === avatar.id;
                  const isSelected = previewAvatar === avatar.id;
                  const rarityConfig = RARITY_CONFIG[avatar.rarity];

                  return (
                    <motion.div
                      key={avatar.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.25, delay: index * 0.02 }}
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setPreviewAvatar(avatar.id)}
                      className="shop-avatar-card"
                      style={{
                        background: 'rgba(255, 255, 255, 0.18)',
                        backdropFilter: 'blur(20px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                        borderRadius: '10px',
                        padding: isCompact ? '2px' : (isPhone ? '4px' : '10px'),
                        border: isSelected 
                          ? '2px solid #FFFFFF'
                          : isEquipped 
                            ? `2px solid ${palette.softGreen}`
                            : `2px solid ${rarityConfig.border}AA`,
                        boxShadow: isSelected 
                          ? '0 8px 32px rgba(255, 255, 255, 0.35), inset 0 1px 0 rgba(255,255,255,0.3)' 
                          : '0 4px 20px rgba(45, 42, 94, 0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      <div 
                        className="shop-rarity-badge"
                        style={{
                          position: 'absolute',
                          top: '2px',
                          left: '2px',
                          background: `${rarityConfig.color}EE`,
                          color: 'white',
                          padding: isCompact ? '1px 2px' : '2px 4px',
                          borderRadius: '4px',
                          fontSize: isCompact ? '5px' : '6px',
                          fontWeight: '800',
                          border: '1px solid rgba(255,255,255,0.4)',
                          textShadow: '0 1px 2px rgba(45, 42, 94, 0.5)',
                          boxShadow: '0 2px 6px rgba(45, 42, 94, 0.25)',
                          zIndex: 2,
                          fontFamily: BRAND_FONT_DISPLAY,
                          letterSpacing: '0.05em'
                        }}
                      >
                        {avatar.rarity.toUpperCase()}
                      </div>

                      {isEquipped && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          style={{
                            position: 'absolute',
                            top: '2px',
                            right: '2px',
                            width: isCompact ? '9px' : '14px',
                            height: isCompact ? '9px' : '14px',
                            borderRadius: '50%',
                            background: palette.softGreen,
                            color: 'white',
                            fontSize: isCompact ? '5px' : '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '800',
                            boxShadow: '0 2px 6px rgba(138, 177, 125, 0.5)',
                            border: '1px solid rgba(255,255,255,0.5)',
                            zIndex: 2
                          }}
                        >
                          ✓
                        </motion.div>
                      )}

                      <div 
                        className="shop-avatar-img-wrap"
                        style={{
                          width: '100%',
                          aspectRatio: '0.75',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '1px',
                          marginTop: isCompact ? '5px' : '8px',
                          background: 'transparent',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          position: 'relative'
                        }}
                      >
                        <img
                          src={avatar.image}
                          alt={avatar.name}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            filter: isOwned 
                              ? 'drop-shadow(0 4px 12px rgba(45, 42, 94, 0.4))' 
                              : 'grayscale(0.5) brightness(0.8)',
                            transition: 'filter 0.2s ease',
                            position: 'relative',
                            zIndex: 1
                          }}
                        />
                      </div>

                      <div 
                        className="shop-avatar-name"
                        style={{
                          fontSize: isCompact ? '5px' : '8px',
                          fontWeight: '800',
                          color: 'white',
                          marginTop: isCompact ? '2px' : '4px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          textShadow: '0 1px 4px rgba(45, 42, 94, 0.6)',
                          fontFamily: BRAND_FONT_DISPLAY,
                          padding: '0 1px'
                        }}
                      >
                        {avatar.name}
                      </div>

                      <div 
                        className="shop-avatar-price"
                        style={{
                          fontSize: isCompact ? '4px' : '7px',
                          fontWeight: '800',
                          color: isOwned ? '#A5FFB0' : '#FFD700',
                          marginTop: '1px',
                          textShadow: '0 1px 4px rgba(45, 42, 94, 0.6)',
                          fontFamily: BRAND_FONT_DISPLAY,
                          padding: '0 1px'
                        }}
                      >
                        {isOwned ? '✓' : (avatar.price === 0 ? '🎁' : `💰${avatar.price}`)}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* RIGHT: PREVIEW PANEL */}
          <motion.div
            className="shop-preview-panel"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(25px) saturate(180%)',
              WebkitBackdropFilter: 'blur(25px) saturate(180%)',
              border: `2px solid ${previewConfig.border}AA`,
              borderRadius: '20px',
              padding: isCompact ? '12px' : (isMobileView ? '14px' : '20px'),
              display: 'flex',
              flexDirection: 'column',
              position: isMobileView ? 'static' : 'sticky',
              top: '20px',
              height: 'fit-content',
              boxShadow: previewRarity === 'legendary' 
                ? `0 0 50px ${previewConfig.color}66, inset 0 1px 0 rgba(255,255,255,0.3)` 
                : '0 8px 32px rgba(45, 42, 94, 0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
              overflow: 'hidden'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <span style={{
                fontSize: '10px',
                fontWeight: '800',
                color: 'white',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                textShadow: '0 1px 4px rgba(45, 42, 94, 0.5)',
                opacity: 0.95,
                fontFamily: BRAND_FONT_DISPLAY,
              }}>
                Preview
              </span>
              <motion.div
                key={previewRarity}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  padding: '3px 10px',
                  borderRadius: '10px',
                  background: `${previewConfig.color}DD`,
                  color: 'white',
                  fontSize: '9px',
                  fontWeight: '800',
                  border: '1px solid rgba(255,255,255,0.4)',
                  textShadow: '0 1px 3px rgba(45, 42, 94, 0.5)',
                  boxShadow: `0 4px 16px ${previewConfig.color}66`,
                  fontFamily: BRAND_FONT_DISPLAY,
                  letterSpacing: '0.05em'
                }}
              >
                {previewConfig.label}
              </motion.div>
            </div>

            <div 
              className="shop-preview-image"
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: isCompact ? '1.6' : (isMobileView ? '1.2' : '0.85'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '10px',
                background: 'transparent',
                borderRadius: '16px',
                overflow: 'hidden',
              }}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={previewAvatar}
                  src={previewData?.image}
                  alt={previewData?.name}
                  initial={{ 
                    opacity: 0, 
                    scale: 0.5, 
                    rotate: -15 
                  }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    rotate: 0,
                    y: [0, -10, 0]
                  }}
                  exit={{ 
                    opacity: 0, 
                    scale: 0.5, 
                    rotate: 15 
                  }}
                  transition={{
                    opacity: { duration: 0.3 },
                    scale: { duration: 0.4, type: 'spring' },
                    rotate: { duration: 0.4 },
                    y: { 
                      duration: 3, 
                      repeat: Infinity, 
                      ease: 'easeInOut' 
                    }
                  }}
                  style={{
                    maxWidth: '85%',
                    maxHeight: '85%',
                    objectFit: 'contain',
                    filter: `drop-shadow(0 12px 30px ${previewConfig.color}88) drop-shadow(0 4px 8px rgba(45, 42, 94, 0.5))`,
                    position: 'relative',
                    zIndex: 2
                  }}
                />
              </AnimatePresence>
            </div>

            <motion.div
              key={previewAvatar + '_info'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: 'center', marginBottom: '10px' }}
            >
              <h2 style={{
                fontSize: isCompact ? '16px' : (isMobileView ? '18px' : '22px'),
                fontWeight: '800',
                color: 'white',
                margin: '0 0 2px 0',
                textShadow: '0 2px 12px rgba(45, 42, 94, 0.6)',
                fontFamily: BRAND_FONT_DISPLAY,
              }}>
                {previewData?.name}
              </h2>
              <p style={{
                fontSize: '11px',
                color: 'rgba(255,255,255,0.9)',
                margin: '0 0 4px 0',
                fontWeight: '700',
                textShadow: '0 1px 4px rgba(45, 42, 94, 0.5)',
                fontFamily: BRAND_FONT_BODY,
              }}>
                {previewData?.anime}
              </p>
              <p style={{
                fontSize: '10px',
                color: 'rgba(255,255,255,0.75)',
                margin: 0,
                fontStyle: 'italic',
                textShadow: '0 1px 4px rgba(45, 42, 94, 0.5)',
                fontWeight: 600,
                fontFamily: BRAND_FONT_BODY,
              }}>
                "{previewData?.description}"
              </p>
            </motion.div>

            <div style={{
              textAlign: 'center',
              marginBottom: '10px',
              padding: '8px',
              background: 'rgba(255, 255, 255, 0.18)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: '12px'
            }}>
              {isPreviewOwned ? (
                <span style={{
                  fontSize: '13px',
                  fontWeight: '800',
                  color: '#A5FFB0',
                  textShadow: '0 1px 4px rgba(45, 42, 94, 0.4)',
                  fontFamily: BRAND_FONT_DISPLAY,
                }}>
                  {isPreviewEquipped ? '✨ Currently Equipped' : '✓ Owned'}
                </span>
              ) : (
                <span style={{
                  fontSize: '15px',
                  fontWeight: '800',
                  color: previewData?.price === 0 ? '#A5FFB0' : '#FFD700',
                  textShadow: '0 2px 8px rgba(45, 42, 94, 0.5)',
                  fontFamily: BRAND_FONT_DISPLAY,
                }}>
                  {previewData?.price === 0 ? '🎁 FREE' : `💰 ${previewData?.price?.toLocaleString()} pts`}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {isPreviewOwned ? (
                isPreviewEquipped ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleReset}
                    style={{
                      padding: '11px',
                      background: 'rgba(255, 255, 255, 0.25)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.4)',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      fontFamily: BRAND_FONT_DISPLAY,
                      textShadow: '0 1px 4px rgba(45, 42, 94, 0.4)',
                      boxShadow: '0 4px 16px rgba(45, 42, 94, 0.25)'
                    }}
                  >
                    ↺ Reset Avatar
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleEquip}
                    style={{
                      padding: '11px',
                      background: `linear-gradient(135deg, ${palette.softGreen}, ${palette.teal})`,
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      boxShadow: `0 6px 0 ${palette.softGreenShadow}, 0 6px 24px rgba(138, 177, 125, 0.5)`,
                      fontFamily: BRAND_FONT_DISPLAY,
                      textShadow: '0 1px 3px rgba(45, 42, 94, 0.3)'
                    }}
                  >
                    ✓ Equip This Avatar
                  </motion.button>
                )
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowBuyModal(true)}
                  disabled={!canAfford}
                  style={{
                    padding: '11px',
                    background: canAfford 
                      ? `linear-gradient(135deg, ${palette.warmOrange} 0%, ${palette.coral} 100%)` 
                      : 'rgba(150,150,150,0.4)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: canAfford ? 'pointer' : 'not-allowed',
                    boxShadow: canAfford 
                      ? `0 6px 0 ${palette.warmOrangeShadow}, 0 6px 24px rgba(244, 162, 97, 0.5)` 
                      : 'none',
                    opacity: canAfford ? 1 : 0.6,
                    fontFamily: BRAND_FONT_DISPLAY,
                    textShadow: '0 1px 3px rgba(45, 42, 94, 0.3)'
                  }}
                >
                  {canAfford 
                    ? `💰 Buy for ${previewData?.price?.toLocaleString()} pts` 
                    : `❌ Need ${(previewData?.price || 0) - currentPoints} more pts`}
                </motion.button>
              )}
            </div>

            <div style={{
              marginTop: '10px',
              paddingTop: '10px',
              borderTop: '1px solid rgba(255,255,255,0.25)',
              textAlign: 'center',
              fontSize: '11px',
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 700,
              textShadow: '0 1px 4px rgba(45, 42, 94, 0.5)',
              fontFamily: BRAND_FONT_BODY,
            }}>
              🎨 Collection: <strong style={{ color: '#FFD700', fontSize: '13px', fontFamily: BRAND_FONT_DISPLAY, fontWeight: 800 }}>{ownedAvatars.length}</strong> / {AVATAR_SHOP_ITEMS.length}
            </div>
          </motion.div>
        </div>
      </div>

      {/* BUY MODAL */}
      <AnimatePresence>
        {showBuyModal && previewData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowBuyModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(45, 42, 94, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '16px',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)'
            }}
          >
            <motion.div
              className="shop-modal-content"
              initial={{ scale: 0.8, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 30, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: `linear-gradient(135deg, ${palette.warmOrange} 0%, ${palette.coral} 100%)`,
                border: '2px solid rgba(255, 255, 255, 0.4)',
                borderRadius: '24px',
                padding: '24px',
                maxWidth: '400px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(45, 42, 94, 0.6), inset 0 1px 0 rgba(255,255,255,0.3)'
              }}
            >
              <h2 style={{ 
                fontSize: isCompact ? '18px' : '20px', 
                margin: '0 0 14px 0',
                color: 'white',
                fontWeight: 800,
                textShadow: '0 2px 8px rgba(45, 42, 94, 0.5)',
                fontFamily: BRAND_FONT_DISPLAY,
              }}>
                Confirm Purchase
              </h2>

              <motion.div
                className="shop-modal-image"
                initial={{ scale: 0.5, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                style={{
                  width: '140px',
                  height: '140px',
                  margin: '0 auto 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'transparent',
                  borderRadius: '20px',
                  padding: '10px',
                  overflow: 'hidden'
                }}
              >
                <img
                  src={previewData.image}
                  alt={previewData.name}
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '100%', 
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 8px 20px rgba(45, 42, 94, 0.5))'
                  }}
                />
              </motion.div>

              <h3 style={{ 
                fontSize: isCompact ? '16px' : '18px', 
                margin: '0 0 2px 0',
                color: 'white',
                fontWeight: 800,
                textShadow: '0 2px 8px rgba(45, 42, 94, 0.5)',
                fontFamily: BRAND_FONT_DISPLAY,
              }}>
                {previewData.name}
              </h3>
              <p style={{ 
                fontSize: '12px', 
                color: 'rgba(255,255,255,0.9)', 
                margin: '0 0 10px 0',
                fontWeight: 700,
                textShadow: '0 1px 4px rgba(45, 42, 94, 0.4)',
                fontFamily: BRAND_FONT_BODY,
              }}>
                {previewData.anime}
              </p>

              <motion.p
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                style={{
                  fontSize: isCompact ? '22px' : '26px',
                  fontWeight: '800',
                  color: '#FFD700',
                  margin: '10px 0 6px 0',
                  textShadow: '0 2px 12px rgba(45, 42, 94, 0.6)',
                  fontFamily: BRAND_FONT_DISPLAY,
                }}
              >
                💰 {previewData.price.toLocaleString()} pts
              </motion.p>

              <p style={{
                fontSize: '12px',
                color: currentPoints >= previewData.price ? '#A5FFB0' : '#FFA5A5',
                margin: '0 0 16px 0',
                fontWeight: 700,
                textShadow: '0 1px 4px rgba(45, 42, 94, 0.5)',
                fontFamily: BRAND_FONT_BODY,
              }}>
                {currentPoints >= previewData.price 
                  ? `After purchase: ${(currentPoints - previewData.price).toLocaleString()} pts`
                  : `❌ Need ${(previewData.price - currentPoints).toLocaleString()} more pts`}
              </p>

              <div style={{ display: 'flex', gap: '8px' }}>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowBuyModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255,255,255,0.4)',
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    fontFamily: BRAND_FONT_DISPLAY,
                    textShadow: '0 1px 4px rgba(45, 42, 94, 0.4)'
                  }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleBuy}
                  disabled={currentPoints < previewData.price}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: currentPoints >= previewData.price 
                      ? `linear-gradient(135deg, ${palette.softGreen}, ${palette.teal})` 
                      : 'rgba(150,150,150,0.4)',
                    color: 'white',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: currentPoints >= previewData.price ? 'pointer' : 'not-allowed',
                    fontFamily: BRAND_FONT_DISPLAY,
                    boxShadow: currentPoints >= previewData.price 
                      ? `0 4px 0 ${palette.softGreenShadow}, 0 6px 24px rgba(138, 177, 125, 0.5)` 
                      : 'none',
                    textShadow: '0 1px 3px rgba(45, 42, 94, 0.3)'
                  }}
                >
                  Confirm
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AvatarShop;