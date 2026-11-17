// src/components/CharacterAvatar.jsx
import React from 'react';
import { getAvatarById, DEFAULT_AVATAR_ID, RARITY_CONFIG } from '../data/avatarShop';

// ============================================================
// ✅ REUSABLE CHARACTER AVATAR DISPLAY
// Gamitin sa Profile, Dashboard welcome, Leaderboards
// ============================================================
const CharacterAvatar = ({ 
  avatarId, 
  size = 'medium',    // 'small' | 'medium' | 'large' | 'xlarge'
  showBorder = true,
  showRarityGlow = false,
  fallbackEmoji = '👤'
}) => {
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

  // Size presets
  const sizeMap = {
    small:  { width: 36, height: 36, borderWidth: 2 },
    medium: { width: 56, height: 56, borderWidth: 3 },
    large:  { width: 80, height: 80, borderWidth: 3 },
    xlarge: { width: 120, height: 120, borderWidth: 4 }
  };
  
  const dims = sizeMap[size] || sizeMap.medium;
  
  // Get avatar data
  const avatarData = avatarId ? getAvatarById(avatarId) : null;
  const rarity = avatarData?.rarity || 'free';
  const rarityConfig = RARITY_CONFIG[rarity] || RARITY_CONFIG.free;
  
  // If no avatar found, show emoji fallback (themed to match palette)
  if (!avatarData) {
    return (
      <div
        style={{
          width: `${dims.width}px`,
          height: `${dims.height}px`,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${palette.cream}, ${palette.warmOrange}40)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: `${dims.width * 0.5}px`,
          border: showBorder ? `${dims.borderWidth}px solid ${palette.border}` : 'none',
          flexShrink: 0,
          color: palette.deepNavy,
          fontFamily: "'Fredoka', sans-serif",
        }}
      >
        {fallbackEmoji}
      </div>
    );
  }
  
  return (
    <div
      style={{
        width: `${dims.width}px`,
        height: `${dims.height}px`,
        borderRadius: '50%',
        overflow: 'hidden',
        background: rarityConfig.bg,
        border: showBorder ? `${dims.borderWidth}px solid ${rarityConfig.border}` : 'none',
        boxShadow: showRarityGlow ? rarityConfig.glow : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        position: 'relative'
      }}
    >
      <img
        src={avatarData.image}
        alt={avatarData.name}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center top'
        }}
        onError={(e) => {
          e.target.style.display = 'none';
          // Use palette-themed fallback when image fails
          e.target.parentNode.innerHTML = `
            <span style="
              font-size: ${dims.width * 0.5}px;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 100%;
              height: 100%;
              background: linear-gradient(135deg, ${palette.cream}, ${palette.warmOrange}40);
              color: ${palette.deepNavy};
              font-family: 'Fredoka', sans-serif;
            ">${fallbackEmoji}</span>
          `;
        }}
      />
    </div>
  );
};

export default CharacterAvatar;