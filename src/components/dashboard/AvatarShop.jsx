// src/components/dashboard/AvatarShop.jsx
// ✅ NEW: Diamond purchasing option for avatars
// ✅ Dual currency: Points (grindable) + Diamonds (premium)
// ✅ Diamond price auto-computed based on rarity
// ✅ SMOOTH ANIMATIONS: Better transitions on filter change + avatar grid

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
  shadow: 'rgba(42, 40, 69, 0.06)',
  shadowMd: 'rgba(42, 40, 69, 0.10)',
  diamond: '#5DADE2',
  diamondShadow: '#3D8BBF',
  diamondSoft: '#DBEAFE',
  diamondSoftText: '#1E40AF',
  gold: '#d4af37',
  goldShadow: '#B8860B',
};

const BRAND_FONT_DISPLAY = "'Fredoka', sans-serif";
const BRAND_FONT_BODY = "'Nunito', sans-serif";

// 🎬 Smooth spring transitions
const SPRING_SMOOTH = { type: 'spring', stiffness: 320, damping: 30 };
const SPRING_SNAPPY = { type: 'spring', stiffness: 450, damping: 32 };

const DIAMOND_MULTIPLIERS = {
  free: 0,
  common: 0.15,
  rare: 0.12,
  epic: 0.10,
  legendary: 0.09,
  mythic: 0.08,
};

const getDiamondPrice = (item) => {
  if (!item) return 0;
  if (item.price === 0) return 0;
  if (item.diamondPrice && item.diamondPrice > 0) return item.diamondPrice;
  const multiplier = DIAMOND_MULTIPLIERS[item.rarity] || 0.10;
  return Math.max(5, Math.round(item.price * multiplier));
};

const Icon = ({ name, size = 20, color = palette.bodyTextSoft, secondaryColor = `${palette.bodyTextSoft}55` }) => {
  const icons = {
    shop: (
      <>
        <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="9" cy="20" r="1" stroke={color} strokeWidth="2" fill="none"/>
        <circle cx="18" cy="20" r="1" stroke={color} strokeWidth="2" fill="none"/>
      </>
    ),
    coin: (
      <>
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none"/>
        <path d="M12 7v10M9.5 9.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5-2.5 1.12-2.5 2.5 1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    diamond: (
      <>
        <path d="M6 3h12l4 6-10 12L2 9l4-6z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M2 9h20M12 3l-4 6 4 12M12 3l4 6-4 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    check: (<path d="M20 6L9 17l-5-5" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>),
    lock: (
      <>
        <rect x="4" y="11" width="16" height="10" rx="2" stroke={color} strokeWidth="2" fill="none"/>
        <path d="M8 11V7a4 4 0 118 0v4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    sparkle: (<path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>),
    reset: (
      <>
        <path d="M1 4v6h6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M3.51 15a9 9 0 1014.85-9.36L1 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', flexShrink: 0 }}>
      {icons[name] || icons.shop}
    </svg>
  );
};

const RARITY_SIDEBAR = [
  { id: 'all', label: 'All', icon: 'sparkle', color: palette.warmOrange },
  { id: 'free', label: 'Free', icon: 'check', color: palette.softGreen },
  { id: 'common', label: 'Common', icon: 'check', color: palette.softGreen },
  { id: 'rare', label: 'Rare', icon: 'sparkle', color: palette.teal },
  { id: 'epic', label: 'Epic', icon: 'sparkle', color: palette.coral },
  { id: 'legendary', label: 'Legend', icon: 'sparkle', color: '#d4af37' }
];

const AvatarShop = ({ 
  currentPoints, 
  onPointsChange, 
  currentDiamonds = 0,
  onDiamondsChange,
  onEquipChange 
}) => {
  const [ownedAvatars, setOwnedAvatars] = useState([]);
  const [equippedAvatar, setEquippedAvatar] = useState(DEFAULT_AVATAR_ID);
  const [previewAvatar, setPreviewAvatar] = useState(DEFAULT_AVATAR_ID);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyCurrency, setBuyCurrency] = useState('points');
  const [isMobileView, setIsMobileView] = useState(false);
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [localDiamonds, setLocalDiamonds] = useState(currentDiamonds);

  useEffect(() => {
    setLocalDiamonds(currentDiamonds);
  }, [currentDiamonds]);

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
          
          if (typeof data.totalDiamonds === 'number') {
            setLocalDiamonds(data.totalDiamonds);
            if (onDiamondsChange) onDiamondsChange(data.totalDiamonds);
          }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  const handleBuy = async () => {
    const avatarToBuy = previewAvatar;
    const avatarData = AVATAR_SHOP_ITEMS.find(a => a.id === avatarToBuy);
    
    if (!avatarData) return;
    const user = auth.currentUser;
    if (!user) return;

    if (ownedAvatars.includes(avatarToBuy)) {
      setMessage({ type: 'error', text: 'Already owned!' });
      setShowBuyModal(false);
      return;
    }

    const diamondPrice = getDiamondPrice(avatarData);

    if (buyCurrency === 'diamonds') {
      if (localDiamonds < diamondPrice) {
        setMessage({ 
          type: 'error', 
          text: `Not enough diamonds! Need ${diamondPrice - localDiamonds} more.` 
        });
        setShowBuyModal(false);
        return;
      }

      try {
        const userRef = doc(db, 'users', user.uid);
        const newDiamonds = localDiamonds - diamondPrice;
        const newOwned = [...ownedAvatars, avatarToBuy];

        await updateDoc(userRef, {
          totalDiamonds: newDiamonds,
          ownedAvatars: newOwned
        });

        setOwnedAvatars(newOwned);
        setLocalDiamonds(newDiamonds);
        if (onDiamondsChange) onDiamondsChange(newDiamonds);
        setMessage({ type: 'success', text: `Purchased ${avatarData.name} with 💎!` });
        setShowBuyModal(false);
      } catch (err) {
        console.error('Error buying avatar with diamonds:', err);
        setMessage({ type: 'error', text: 'Purchase failed. Try again.' });
      }
      return;
    }

    if (currentPoints < avatarData.price) {
      setMessage({ 
        type: 'error', 
        text: `Not enough points! Need ${avatarData.price - currentPoints} more.` 
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
      setMessage({ type: 'success', text: `Purchased ${avatarData.name}!` });
      setShowBuyModal(false);
    } catch (err) {
      console.error('Error buying avatar:', err);
      setMessage({ type: 'error', text: 'Purchase failed. Try again.' });
    }
  };

  const handleEquip = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { equippedAvatar: previewAvatar });
      
      setEquippedAvatar(previewAvatar);
      setMessage({ type: 'success', text: 'Avatar equipped!' });
      
      if (onEquipChange) onEquipChange(previewAvatar);
    } catch (err) {
      console.error('Error equipping avatar:', err);
      setMessage({ type: 'error', text: 'Equip failed.' });
    }
  };

  const handleReset = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { equippedAvatar: DEFAULT_AVATAR_ID });
      
      setEquippedAvatar(DEFAULT_AVATAR_ID);
      setPreviewAvatar(DEFAULT_AVATAR_ID);
      setMessage({ type: 'success', text: 'Reset to default!' });
      
      if (onEquipChange) onEquipChange(DEFAULT_AVATAR_ID);
    } catch (err) {
      console.error('Error resetting avatar:', err);
      setMessage({ type: 'error', text: 'Reset failed.' });
    }
  };

  const openBuyModal = () => {
    const avatarData = AVATAR_SHOP_ITEMS.find(a => a.id === previewAvatar);
    const diamondPrice = getDiamondPrice(avatarData);
    const canAffordPoints = currentPoints >= (avatarData?.price || 0);
    const canAffordDiamonds = localDiamonds >= diamondPrice;

    if (canAffordPoints) setBuyCurrency('points');
    else if (canAffordDiamonds) setBuyCurrency('diamonds');
    else setBuyCurrency('points');

    setShowBuyModal(true);
  };

  const filteredAvatars = selectedRarity === 'all'
    ? AVATAR_SHOP_ITEMS
    : AVATAR_SHOP_ITEMS.filter(a => a.rarity === selectedRarity);

  const previewData = AVATAR_SHOP_ITEMS.find(a => a.id === previewAvatar);
  const previewRarity = previewData?.rarity || 'free';
  const previewConfig = RARITY_CONFIG[previewRarity];
  const isPreviewOwned = ownedAvatars.includes(previewAvatar);
  const isPreviewEquipped = equippedAvatar === previewAvatar;
  const canAffordPoints = currentPoints >= (previewData?.price || 0);
  const previewDiamondPrice = getDiamondPrice(previewData);
  const canAffordDiamonds = localDiamonds >= previewDiamondPrice;
  const canAffordEither = canAffordPoints || canAffordDiamonds;

  const isCompact = screenWidth < 480;

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        background: palette.white,
        border: `1.5px solid ${palette.border}`,
        borderRadius: '20px',
        padding: '60px',
        color: palette.deepNavy,
        fontFamily: BRAND_FONT_BODY,
        boxShadow: `0 2px 0 ${palette.border}`,
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            width: '44px',
            height: '44px',
            border: `3px solid ${palette.border}`,
            borderTop: `3px solid ${palette.warmOrange}`,
            borderRadius: '50%',
            marginBottom: '18px'
          }}
        />
        <span style={{ fontWeight: 700, fontFamily: BRAND_FONT_DISPLAY }}>Loading Avatar Shop...</span>
      </div>
    );
  }

  return (
    <div className="avatar-shop-root" style={{
      width: '100%',
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '0',
      fontFamily: BRAND_FONT_BODY,
      borderRadius: '0',
      position: 'relative',
      overflow: 'hidden',
      minHeight: 'auto',
      boxSizing: 'border-box'
    }}>

      <style>{`
        @media (max-width: 900px) {
          .shop-preview-panel { padding: 14px !important; }
          .shop-preview-image { aspect-ratio: 1.6 !important; }
          .shop-modal-content { padding: 20px 16px !important; border-radius: 22px !important; }
          .shop-modal-image { width: 100px !important; height: 100px !important; }
        }
        @media (max-width: 400px) {
          .shop-modal-content { padding: 16px 12px !important; }
          .shop-modal-image { width: 80px !important; height: 80px !important; }
        }
        .shop-avatar-card {
          transition: border-color 0.22s ease, box-shadow 0.22s ease;
        }
        .shop-avatar-card img {
          transition: filter 0.25s ease, transform 0.25s ease;
        }
      `}</style>

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          background: palette.white,
          border: `1.5px solid ${palette.border}`,
          borderRadius: '16px',
          padding: isMobileView ? '14px 16px' : '18px 22px',
          marginBottom: '14px',
          color: palette.deepNavy,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: `0 2px 0 ${palette.border}`
        }}
      >
        <div>
          <h1 style={{
            fontSize: isCompact ? '18px' : (isMobileView ? '20px' : '22px'),
            fontWeight: '800',
            margin: '0 0 3px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontFamily: BRAND_FONT_DISPLAY,
            color: palette.deepNavy,
            letterSpacing: '-0.4px',
          }}>
            <span style={{ display: 'flex', background: palette.creamSoft, width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${palette.border}` }}>
              <Icon name="shop" size={16} color={palette.warmOrange} />
            </span>
            Avatar Shop
          </h1>
          <p style={{ 
            fontSize: isCompact ? '11px' : (isMobileView ? '12px' : '13px'), 
            margin: 0,
            color: palette.bodyTextSoft,
            fontWeight: 600,
            fontFamily: BRAND_FONT_BODY,
          }}>
            Choose your character
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <motion.div
            key={currentPoints}
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            transition={SPRING_SMOOTH}
            style={{
              background: palette.creamSoft,
              border: `1.5px solid ${palette.border}`,
              padding: isCompact ? '6px 12px' : (isMobileView ? '8px 14px' : '10px 18px'),
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: `0 2px 0 ${palette.border}`
            }}
          >
            <span style={{ display: 'flex', background: palette.white, width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', border: `1px solid ${palette.border}` }}>
              <Icon name="coin" size={14} color="#d4af37" />
            </span>
            <div>
              <div style={{ fontSize: '9px', color: palette.bodyTextSoft, fontWeight: 800, fontFamily: BRAND_FONT_DISPLAY, letterSpacing: '0.08em', textTransform: 'uppercase' }}>POINTS</div>
              <div style={{ fontSize: isCompact ? '14px' : (isMobileView ? '16px' : '18px'), fontWeight: '800', fontFamily: BRAND_FONT_DISPLAY, color: palette.deepNavy, lineHeight: 1 }}>
                {currentPoints.toLocaleString()}
              </div>
            </div>
          </motion.div>

          <motion.div
            key={localDiamonds}
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            transition={SPRING_SMOOTH}
            style={{
              background: palette.diamondSoft,
              border: `1.5px solid ${palette.diamond}60`,
              padding: isCompact ? '6px 12px' : (isMobileView ? '8px 14px' : '10px 18px'),
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: `0 2px 0 ${palette.diamond}40`
            }}
          >
            <span style={{ display: 'flex', background: palette.white, width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', border: `1px solid ${palette.diamond}40` }}>
              <Icon name="diamond" size={14} color={palette.diamond} />
            </span>
            <div>
              <div style={{ fontSize: '9px', color: palette.diamondSoftText, fontWeight: 800, fontFamily: BRAND_FONT_DISPLAY, letterSpacing: '0.08em', textTransform: 'uppercase' }}>DIAMONDS</div>
              <div style={{ fontSize: isCompact ? '14px' : (isMobileView ? '16px' : '18px'), fontWeight: '800', fontFamily: BRAND_FONT_DISPLAY, color: palette.diamondSoftText, lineHeight: 1 }}>
                {localDiamonds.toLocaleString()}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* MESSAGE */}
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -16, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -16, height: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              background: message.type === 'success' 
                ? `${palette.softGreen}15` 
                : `${palette.coral}15`,
              border: `1.5px solid ${message.type === 'success' 
                ? `${palette.softGreen}40` 
                : `${palette.coral}40`}`,
              color: message.type === 'success' ? palette.softGreen : palette.coral,
              padding: '12px 16px',
              borderRadius: '12px',
              marginBottom: '14px',
              fontSize: '13px',
              fontWeight: 700,
              fontFamily: BRAND_FONT_BODY,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Icon name={message.type === 'success' ? 'check' : 'lock'} size={16} color={message.type === 'success' ? palette.softGreen : palette.coral} />
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN LAYOUT */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobileView ? '1fr' : '76px 1fr 320px',
        gap: '14px',
        alignItems: 'stretch',
      }}>

        {/* LEFT: RARITY SIDEBAR (desktop) */}
        {!isMobileView && (
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              background: palette.white,
              border: `1.5px solid ${palette.border}`,
              borderRadius: '14px',
              padding: '10px 6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              height: 'fit-content',
              position: 'sticky',
              top: '20px',
              boxShadow: `0 2px 0 ${palette.border}`
            }}
          >
            {RARITY_SIDEBAR.map((rarity) => {
              const isActive = selectedRarity === rarity.id;
              return (
                <motion.button
                  key={rarity.id}
                  onClick={() => setSelectedRarity(rarity.id)}
                  // ✅ Smooth active state transition
                  animate={{
                    scale: isActive ? 1.04 : 1,
                    borderColor: isActive ? rarity.color : palette.border,
                    backgroundColor: isActive ? `${rarity.color}12` : palette.creamSoft,
                    boxShadow: isActive 
                      ? `0 2px 0 ${rarity.color}40` 
                      : `0 0 0 rgba(0,0,0,0)`,
                  }}
                  whileHover={{ scale: isActive ? 1.06 : 1.05 }}
                  whileTap={{ scale: 0.94 }}
                  transition={SPRING_SNAPPY}
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    borderRadius: '10px',
                    borderWidth: '1.5px',
                    borderStyle: 'solid',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    gap: '3px',
                    padding: '6px 4px',
                  }}
                >
                  <motion.div
                    animate={{ 
                      color: isActive ? rarity.color : palette.bodyTextSoft,
                      scale: isActive ? 1.08 : 1,
                    }}
                    transition={SPRING_SNAPPY}
                  >
                    <Icon 
                      name={rarity.icon} 
                      size={18} 
                      color={isActive ? rarity.color : palette.bodyTextSoft} 
                    />
                  </motion.div>
                  <motion.span 
                    animate={{ 
                      color: isActive ? rarity.color : palette.bodyTextSoft,
                      fontWeight: isActive ? 800 : 700,
                    }}
                    transition={{ duration: 0.2 }}
                    style={{
                      fontSize: '8px',
                      textTransform: 'uppercase',
                      fontFamily: BRAND_FONT_DISPLAY,
                      letterSpacing: '0.05em'
                    }}
                  >
                    {rarity.label}
                  </motion.span>
                </motion.button>
              );
            })}
          </motion.div>
        )}

        {/* MIDDLE: AVATAR GRID */}
        <div style={{ minWidth: 0, width: '100%' }}>
          {isMobileView && (
            <div style={{
              display: 'flex',
              gap: '5px',
              marginBottom: '10px',
              overflowX: 'auto',
              paddingBottom: '4px',
              WebkitOverflowScrolling: 'touch'
            }}>
              {RARITY_SIDEBAR.map((rarity) => {
                const isActive = selectedRarity === rarity.id;
                return (
                  <motion.button
                    key={rarity.id}
                    onClick={() => setSelectedRarity(rarity.id)}
                    animate={{
                      scale: isActive ? 1.05 : 1,
                      borderColor: isActive ? rarity.color : palette.border,
                      backgroundColor: isActive ? `${rarity.color}12` : palette.white,
                      color: isActive ? rarity.color : palette.bodyTextSoft,
                      boxShadow: isActive 
                        ? `0 2px 0 ${rarity.color}40` 
                        : `0 2px 0 ${palette.border}`,
                    }}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.94 }}
                    transition={SPRING_SNAPPY}
                    style={{
                      padding: isCompact ? '5px 10px' : '6px 12px',
                      borderRadius: '999px',
                      borderWidth: '1.5px',
                      borderStyle: 'solid',
                      fontSize: isCompact ? '10px' : '11px',
                      fontWeight: '800',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      flexShrink: 0,
                      fontFamily: BRAND_FONT_DISPLAY,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <Icon name={rarity.icon} size={11} color={isActive ? rarity.color : palette.bodyTextSoft} />
                    {rarity.label}
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* ✅ SMOOTH GRID with popLayout + layout animations */}
          <motion.div
            layout
            className="shop-avatar-grid"
            transition={{ layout: { duration: 0.4, type: 'spring', stiffness: 300, damping: 32 } }}
            style={{
              display: 'grid',
              gridTemplateColumns: isMobileView 
                ? 'repeat(5, minmax(0, 1fr))' 
                : 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: isMobileView ? '6px' : '12px',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            {/* ✅ mode="popLayout" — exiting items pop out, remaining items slide smoothly */}
            <AnimatePresence mode="popLayout" initial={false}>
              {filteredAvatars.map((avatar, index) => {
                const isOwned = ownedAvatars.includes(avatar.id);
                const isEquipped = equippedAvatar === avatar.id;
                const isSelected = previewAvatar === avatar.id;
                const rarityConfig = RARITY_CONFIG[avatar.rarity];

                return (
                  <motion.div
                    key={avatar.id}
                    layout
                    initial={{ opacity: 0, scale: 0.7, y: 30 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1, 
                      y: 0,
                      transition: {
                        opacity: { duration: 0.25, delay: Math.min(index * 0.025, 0.3) },
                        scale: { duration: 0.35, delay: Math.min(index * 0.025, 0.3), type: 'spring', stiffness: 320, damping: 28 },
                        y: { duration: 0.35, delay: Math.min(index * 0.025, 0.3), type: 'spring', stiffness: 320, damping: 28 },
                        layout: { duration: 0.4, type: 'spring', stiffness: 280, damping: 30 },
                      }
                    }}
                    exit={{ 
                      opacity: 0, 
                      scale: 0.7, 
                      y: -20,
                      transition: { duration: 0.22, ease: 'easeIn' }
                    }}
                    whileHover={{ 
                      scale: 1.04, 
                      y: -3,
                      transition: { duration: 0.18, type: 'spring', stiffness: 400, damping: 25 }
                    }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setPreviewAvatar(avatar.id)}
                    className="shop-avatar-card"
                    style={{
                      background: palette.white,
                      borderRadius: '12px',
                      padding: isMobileView ? '4px' : '10px',
                      border: isSelected 
                        ? `2px solid ${palette.warmOrange}`
                        : isEquipped 
                          ? `2px solid ${palette.softGreen}`
                          : `1.5px solid ${palette.border}`,
                      boxShadow: isSelected 
                        ? `0 4px 12px ${palette.shadowMd}, 0 2px 0 ${palette.warmOrange}60` 
                        : `0 2px 0 ${palette.border}`,
                      cursor: 'pointer',
                      textAlign: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      minWidth: 0,
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  >
                    <div 
                      className="shop-rarity-badge"
                      style={{
                        position: 'absolute',
                        top: '3px',
                        left: '3px',
                        background: palette.creamSoft,
                        color: rarityConfig.color,
                        padding: isMobileView ? '1px 4px' : '2px 6px',
                        borderRadius: '5px',
                        fontSize: isMobileView ? '6px' : '7px',
                        fontWeight: '800',
                        border: `1px solid ${rarityConfig.color}40`,
                        zIndex: 2,
                        fontFamily: BRAND_FONT_DISPLAY,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {avatar.rarity}
                    </div>

                    {isEquipped && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={SPRING_SMOOTH}
                        style={{
                          position: 'absolute',
                          top: '3px',
                          right: '3px',
                          width: isMobileView ? '14px' : '18px',
                          height: isMobileView ? '14px' : '18px',
                          borderRadius: '50%',
                          background: palette.softGreen,
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: `0 2px 4px ${palette.softGreen}60`,
                          zIndex: 2
                        }}
                      >
                        <Icon name="check" size={isMobileView ? 8 : 10} color={palette.white} />
                      </motion.div>
                    )}

                    {!isOwned && (
                      <div style={{
                        position: 'absolute',
                        top: '3px',
                        right: '3px',
                        width: isMobileView ? '14px' : '18px',
                        height: isMobileView ? '14px' : '18px',
                        borderRadius: '50%',
                        background: palette.creamSoft,
                        border: `1px solid ${palette.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2
                      }}>
                        <Icon name="lock" size={isMobileView ? 8 : 10} color={palette.bodyTextSoft} />
                      </div>
                    )}

                    <div 
                      className="shop-avatar-img-wrap"
                      style={{
                        width: '100%',
                        aspectRatio: isMobileView ? '0.7' : '0.75',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2px',
                        marginTop: isMobileView ? '8px' : '14px',
                        background: palette.creamSoft,
                        borderRadius: '8px',
                        overflow: 'hidden',
                        position: 'relative',
                        border: `1px solid ${palette.border}`
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
                            ? 'none' 
                            : 'grayscale(0.6) brightness(0.85)',
                          position: 'relative',
                          zIndex: 1
                        }}
                      />
                    </div>

                    <div 
                      className="shop-avatar-name"
                      style={{
                        fontSize: isMobileView ? '7px' : '10px',
                        fontWeight: '800',
                        color: palette.deepNavy,
                        marginTop: isMobileView ? '4px' : '6px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontFamily: BRAND_FONT_DISPLAY,
                        padding: '0 2px'
                      }}
                    >
                      {avatar.name}
                    </div>

                    <div 
                      className="shop-avatar-price"
                      style={{
                        fontSize: isMobileView ? '6px' : '9px',
                        fontWeight: '800',
                        color: isOwned ? palette.softGreen : '#d4af37',
                        marginTop: '2px',
                        fontFamily: BRAND_FONT_DISPLAY,
                        padding: '0 2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '3px',
                        flexWrap: 'wrap',
                      }}
                    >
                      {isOwned ? (
                        <>
                          <Icon name="check" size={isMobileView ? 7 : 9} color={palette.softGreen} />
                          OWNED
                        </>
                      ) : (
                        <>
                          <Icon name="coin" size={isMobileView ? 7 : 9} color="#d4af37" />
                          {avatar.price === 0 ? 'FREE' : avatar.price}
                        </>
                      )}
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
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            background: palette.white,
            border: `1.5px solid ${palette.border}`,
            borderRadius: '16px',
            padding: isMobileView ? '16px' : '20px',
            display: 'flex',
            flexDirection: 'column',
            position: isMobileView ? 'static' : 'sticky',
            top: '20px',
            height: 'fit-content',
            boxShadow: `0 2px 0 ${palette.border}`,
            overflow: 'hidden',
            marginBottom: isMobileView ? '6px' : '0'
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '14px'
          }}>
            <span style={{
              fontSize: '10px',
              fontWeight: '800',
              color: palette.bodyTextSoft,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontFamily: BRAND_FONT_DISPLAY,
            }}>
              Preview
            </span>
            <motion.div
              key={previewRarity}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={SPRING_SMOOTH}
              style={{
                padding: '4px 11px',
                borderRadius: '8px',
                background: `${previewConfig.color}15`,
                color: previewConfig.color,
                fontSize: '10px',
                fontWeight: '800',
                border: `1.5px solid ${previewConfig.color}40`,
                fontFamily: BRAND_FONT_DISPLAY,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
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
              aspectRatio: isMobileView ? '1.6' : '0.9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px',
              background: palette.creamSoft,
              borderRadius: '14px',
              overflow: 'hidden',
              border: `1.5px solid ${palette.border}`,
            }}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={previewAvatar}
                src={previewData?.image}
                alt={previewData?.name}
                initial={{ opacity: 0, scale: 0.6, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0, y: [0, -8, 0] }}
                exit={{ opacity: 0, scale: 0.6, rotate: 10 }}
                transition={{
                  opacity: { duration: 0.3 },
                  scale: { duration: 0.4, type: 'spring', stiffness: 300, damping: 25 },
                  rotate: { duration: 0.4 },
                  y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }
                }}
                style={{
                  maxWidth: '85%',
                  maxHeight: '85%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 8px 20px rgba(42, 40, 69, 0.2))',
                  position: 'relative',
                  zIndex: 2
                }}
              />
            </AnimatePresence>
          </div>

          <motion.div
            key={previewAvatar + '_info'}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ textAlign: 'center', marginBottom: '14px' }}
          >
            <h2 style={{
              fontSize: isMobileView ? '18px' : '20px',
              fontWeight: '800',
              color: palette.deepNavy,
              margin: '0 0 3px 0',
              fontFamily: BRAND_FONT_DISPLAY,
              letterSpacing: '-0.3px',
            }}>
              {previewData?.name}
            </h2>
            <p style={{
              fontSize: '11px',
              color: palette.bodyTextSoft,
              margin: '0 0 6px 0',
              fontWeight: '700',
              fontFamily: BRAND_FONT_BODY,
            }}>
              {previewData?.anime}
            </p>
            <p style={{
              fontSize: '11px',
              color: palette.bodyTextSoft,
              margin: 0,
              fontStyle: 'italic',
              fontWeight: 600,
              fontFamily: BRAND_FONT_BODY,
              lineHeight: 1.5,
            }}>
              "{previewData?.description}"
            </p>
          </motion.div>

          <div style={{
            textAlign: 'center',
            marginBottom: '14px',
            padding: '12px',
            background: palette.creamSoft,
            border: `1.5px solid ${palette.border}`,
            borderRadius: '12px',
          }}>
            {isPreviewOwned ? (
              <span style={{
                fontSize: '13px',
                fontWeight: '800',
                color: palette.softGreen,
                fontFamily: BRAND_FONT_DISPLAY,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}>
                <Icon name="check" size={14} color={palette.softGreen} />
                {isPreviewEquipped ? 'Currently Equipped' : 'Owned'}
              </span>
            ) : previewData?.price === 0 ? (
              <span style={{
                fontSize: '15px',
                fontWeight: '800',
                color: palette.softGreen,
                fontFamily: BRAND_FONT_DISPLAY,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}>
                <Icon name="check" size={16} color={palette.softGreen} />
                FREE
              </span>
            ) : (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '8px',
                flexWrap: 'wrap',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 12px',
                  background: canAffordPoints ? `${palette.gold}15` : `${palette.coral}10`,
                  borderRadius: '8px',
                  border: `1.5px solid ${canAffordPoints ? palette.gold + '60' : palette.coral + '40'}`,
                }}>
                  <Icon name="coin" size={14} color={palette.gold} />
                  <span style={{
                    fontSize: '13px',
                    fontWeight: '800',
                    color: canAffordPoints ? palette.goldShadow : palette.coral,
                    fontFamily: BRAND_FONT_DISPLAY,
                  }}>
                    {previewData?.price?.toLocaleString()}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: palette.bodyTextSoft,
                  fontSize: '11px',
                  fontWeight: 700,
                  fontFamily: BRAND_FONT_BODY,
                }}>
                  or
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 12px',
                  background: canAffordDiamonds ? `${palette.diamond}15` : `${palette.coral}10`,
                  borderRadius: '8px',
                  border: `1.5px solid ${canAffordDiamonds ? palette.diamond + '60' : palette.coral + '40'}`,
                }}>
                  <Icon name="diamond" size={14} color={palette.diamond} />
                  <span style={{
                    fontSize: '13px',
                    fontWeight: '800',
                    color: canAffordDiamonds ? palette.diamondShadow : palette.coral,
                    fontFamily: BRAND_FONT_DISPLAY,
                  }}>
                    {previewDiamondPrice}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {isPreviewOwned ? (
              isPreviewEquipped ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReset}
                  transition={SPRING_SNAPPY}
                  style={{
                    padding: '12px',
                    background: palette.white,
                    color: palette.deepNavy,
                    border: `1.5px solid ${palette.border}`,
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    fontFamily: BRAND_FONT_DISPLAY,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: `0 3px 0 ${palette.border}`,
                  }}
                >
                  <Icon name="reset" size={14} color={palette.bodyText} />
                  Reset to Default
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEquip}
                  transition={SPRING_SNAPPY}
                  style={{
                    padding: '12px',
                    background: palette.softGreen,
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    boxShadow: `0 3px 0 ${palette.softGreenShadow}`,
                    fontFamily: BRAND_FONT_DISPLAY,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <Icon name="check" size={14} color={palette.white} />
                  Equip This Avatar
                </motion.button>
              )
            ) : (
              <>
                {canAffordPoints && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setBuyCurrency('points');
                      setShowBuyModal(true);
                    }}
                    transition={SPRING_SNAPPY}
                    style={{
                      padding: '12px',
                      background: palette.warmOrange,
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      boxShadow: `0 3px 0 ${palette.warmOrangeShadow}`,
                      fontFamily: BRAND_FONT_DISPLAY,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <Icon name="coin" size={14} color={palette.white} />
                    Buy for {previewData?.price?.toLocaleString()} pts
                  </motion.button>
                )}

                {canAffordDiamonds && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setBuyCurrency('diamonds');
                      setShowBuyModal(true);
                    }}
                    transition={SPRING_SNAPPY}
                    style={{
                      padding: '12px',
                      background: `linear-gradient(135deg, ${palette.diamond}, ${palette.diamondShadow})`,
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      boxShadow: `0 3px 0 ${palette.diamondShadow}`,
                      fontFamily: BRAND_FONT_DISPLAY,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <Icon name="diamond" size={14} color={palette.white} />
                    Buy for {previewDiamondPrice} 💎
                  </motion.button>
                )}

                {!canAffordEither && (
                  <motion.button
                    disabled
                    style={{
                      padding: '12px',
                      background: palette.creamSoft,
                      color: palette.bodyTextSoft,
                      border: `1.5px solid ${palette.border}`,
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '800',
                      cursor: 'not-allowed',
                      fontFamily: BRAND_FONT_DISPLAY,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      lineHeight: 1.4,
                      textAlign: 'center',
                    }}
                  >
                    Need {previewData?.price?.toLocaleString()} pts or {previewDiamondPrice} 💎
                  </motion.button>
                )}
              </>
            )}
          </div>

          <div style={{
            marginTop: '14px',
            paddingTop: '14px',
            borderTop: `1.5px solid ${palette.borderSoft}`,
            textAlign: 'center',
            fontSize: '11px',
            color: palette.bodyTextSoft,
            fontWeight: 700,
            fontFamily: BRAND_FONT_BODY,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}>
            <Icon name="sparkle" size={12} color={palette.warmOrange} />
            Collection: <strong style={{ color: palette.deepNavy, fontSize: '13px', fontFamily: BRAND_FONT_DISPLAY, fontWeight: 800 }}>{ownedAvatars.length}</strong> / {AVATAR_SHOP_ITEMS.length}
          </div>
        </motion.div>
      </div>

      {/* BUY MODAL */}
      <AnimatePresence>
        {showBuyModal && previewData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setShowBuyModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(42, 40, 69, 0.55)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '16px',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)'
            }}
          >
            <motion.div
              className="shop-modal-content"
              initial={{ scale: 0.85, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, y: 30, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: palette.white,
                border: `1.5px solid ${palette.border}`,
                borderRadius: '22px',
                padding: '26px',
                maxWidth: '400px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 20px 50px rgba(42, 40, 69, 0.3)'
              }}
            >
              <h2 style={{ 
                fontSize: '18px', 
                margin: '0 0 16px 0',
                color: palette.deepNavy,
                fontWeight: 800,
                fontFamily: BRAND_FONT_DISPLAY,
                letterSpacing: '-0.3px',
              }}>
                Confirm Purchase
              </h2>

              <motion.div
                className="shop-modal-image"
                initial={{ scale: 0.6, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 220, delay: 0.08 }}
                style={{
                  width: '140px',
                  height: '140px',
                  margin: '0 auto 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: palette.creamSoft,
                  borderRadius: '16px',
                  padding: '12px',
                  overflow: 'hidden',
                  border: `1.5px solid ${palette.border}`,
                }}
              >
                <img
                  src={previewData.image}
                  alt={previewData.name}
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '100%', 
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 8px 20px rgba(42, 40, 69, 0.2))'
                  }}
                />
              </motion.div>

              <h3 style={{ 
                fontSize: '18px', 
                margin: '0 0 3px 0',
                color: palette.deepNavy,
                fontWeight: 800,
                fontFamily: BRAND_FONT_DISPLAY,
              }}>
                {previewData.name}
              </h3>
              <p style={{ 
                fontSize: '12px', 
                color: palette.bodyTextSoft, 
                margin: '0 0 14px 0',
                fontWeight: 700,
                fontFamily: BRAND_FONT_BODY,
              }}>
                {previewData.anime}
              </p>

              {previewData.price > 0 && (
                <div style={{
                  display: 'flex',
                  gap: '6px',
                  padding: '4px',
                  background: palette.creamSoft,
                  borderRadius: '12px',
                  marginBottom: '14px',
                  border: `1.5px solid ${palette.border}`,
                }}>
                  <button
                    onClick={() => setBuyCurrency('points')}
                    disabled={!canAffordPoints}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '9px',
                      border: 'none',
                      background: buyCurrency === 'points' ? palette.white : 'transparent',
                      color: !canAffordPoints 
                        ? palette.bodyTextSoft 
                        : (buyCurrency === 'points' ? palette.goldShadow : palette.bodyText),
                      fontSize: '12px',
                      fontWeight: '800',
                      cursor: canAffordPoints ? 'pointer' : 'not-allowed',
                      fontFamily: BRAND_FONT_DISPLAY,
                      boxShadow: buyCurrency === 'points' ? `0 1px 4px rgba(0,0,0,0.08)` : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      opacity: canAffordPoints ? 1 : 0.5,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Icon name="coin" size={14} color={canAffordPoints ? palette.gold : palette.bodyTextSoft} />
                    Points
                  </button>
                  <button
                    onClick={() => setBuyCurrency('diamonds')}
                    disabled={!canAffordDiamonds}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '9px',
                      border: 'none',
                      background: buyCurrency === 'diamonds' ? palette.white : 'transparent',
                      color: !canAffordDiamonds 
                        ? palette.bodyTextSoft 
                        : (buyCurrency === 'diamonds' ? palette.diamondShadow : palette.bodyText),
                      fontSize: '12px',
                      fontWeight: '800',
                      cursor: canAffordDiamonds ? 'pointer' : 'not-allowed',
                      fontFamily: BRAND_FONT_DISPLAY,
                      boxShadow: buyCurrency === 'diamonds' ? `0 1px 4px rgba(0,0,0,0.08)` : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      opacity: canAffordDiamonds ? 1 : 0.5,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Icon name="diamond" size={14} color={canAffordDiamonds ? palette.diamond : palette.bodyTextSoft} />
                    Diamonds
                  </button>
                </div>
              )}

              <motion.div
                key={buyCurrency}
                initial={{ scale: 0.85 }}
                animate={{ scale: 1 }}
                transition={SPRING_SMOOTH}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  background: buyCurrency === 'points' ? `${palette.gold}12` : `${palette.diamond}12`,
                  borderRadius: '12px',
                  border: `1.5px solid ${buyCurrency === 'points' ? palette.gold + '40' : palette.diamond + '40'}`,
                  marginBottom: '12px',
                }}
              >
                <Icon 
                  name={buyCurrency === 'points' ? 'coin' : 'diamond'} 
                  size={20} 
                  color={buyCurrency === 'points' ? palette.gold : palette.diamond} 
                />
                <span style={{
                  fontSize: '22px',
                  fontWeight: '800',
                  color: palette.deepNavy,
                  fontFamily: BRAND_FONT_DISPLAY,
                }}>
                  {buyCurrency === 'points' 
                    ? previewData.price.toLocaleString() 
                    : previewDiamondPrice.toLocaleString()}
                </span>
                <span style={{ fontSize: '12px', color: palette.bodyTextSoft, fontWeight: 700, fontFamily: BRAND_FONT_DISPLAY }}>
                  {buyCurrency === 'points' ? 'pts' : '💎'}
                </span>
              </motion.div>

              <p style={{
                fontSize: '12px',
                color: (buyCurrency === 'points' ? canAffordPoints : canAffordDiamonds) 
                  ? palette.softGreen 
                  : palette.coral,
                margin: '0 0 18px 0',
                fontWeight: 700,
                fontFamily: BRAND_FONT_BODY,
              }}>
                {(buyCurrency === 'points' ? canAffordPoints : canAffordDiamonds)
                  ? `After purchase: ${
                      buyCurrency === 'points' 
                        ? (currentPoints - previewData.price).toLocaleString() + ' pts'
                        : (localDiamonds - previewDiamondPrice).toLocaleString() + ' 💎'
                    } remaining`
                  : `Need ${
                      buyCurrency === 'points'
                        ? (previewData.price - currentPoints).toLocaleString() + ' more pts'
                        : (previewDiamondPrice - localDiamonds).toLocaleString() + ' more 💎'
                    }`}
              </p>

              <div style={{ display: 'flex', gap: '10px' }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowBuyModal(false)}
                  transition={SPRING_SNAPPY}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: palette.white,
                    border: `1.5px solid ${palette.border}`,
                    color: palette.deepNavy,
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    fontFamily: BRAND_FONT_DISPLAY,
                    boxShadow: `0 3px 0 ${palette.border}`,
                  }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBuy}
                  disabled={buyCurrency === 'points' ? !canAffordPoints : !canAffordDiamonds}
                  transition={SPRING_SNAPPY}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: (buyCurrency === 'points' ? canAffordPoints : canAffordDiamonds)
                      ? (buyCurrency === 'points' ? palette.softGreen : `linear-gradient(135deg, ${palette.diamond}, ${palette.diamondShadow})`)
                      : palette.creamSoft,
                    color: (buyCurrency === 'points' ? canAffordPoints : canAffordDiamonds) ? 'white' : palette.bodyTextSoft,
                    border: (buyCurrency === 'points' ? canAffordPoints : canAffordDiamonds) ? 'none' : `1.5px solid ${palette.border}`,
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: (buyCurrency === 'points' ? canAffordPoints : canAffordDiamonds) ? 'pointer' : 'not-allowed',
                    fontFamily: BRAND_FONT_DISPLAY,
                    boxShadow: (buyCurrency === 'points' ? canAffordPoints : canAffordDiamonds)
                      ? `0 3px 0 ${buyCurrency === 'points' ? palette.softGreenShadow : palette.diamondShadow}`
                      : `0 2px 0 ${palette.border}`,
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