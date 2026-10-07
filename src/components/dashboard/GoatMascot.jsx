// src/components/dashboard/GoatMascot.jsx
// ============================================================
// 🐐 GOAT MASCOT — Animated growth-stage mascot + CARD SYSTEM
// ✅ NORMAL MODE — live from level (no demo force)
// ✅ HAS LEVEL UP CARD (LevelUpCelebration)
// ✅ CUSTOM MESSAGES PER LEVEL + CEFR PROGRESSION (A1 → C2)
// ✅ SPECIAL EVOLUTION ANIMATION FOR MILESTONE LEVELS
// ✅ LEVEL OVERLAY — Cover the hardcoded "LEVEL X" in the image
// ✅ ALIGNED WITH MascotCarousel.jsx — 1:1 MAPPING PER LEVEL
// ✅ REMOVED: GoatCardCollection (now in MyCards.jsx)
// 🎵 NEW: LevelUpCelebration has built-in SOUND EFFECT (fanfare)
// 🆕 NEW: 10 goats × 5 levels each = 50 levels total (progressive)
// 🆕 NEW: CEFR aligned: A1(1-5), A2(6-10), B1(11-20), B2(21-30), C1(31-40), C2(41+)
// 🆕 NEW: Milestone every 5 levels (goat evolution)
// 💎 NEW: diamondsEarned prop — shows "+X Diamonds!" sa celebration card
// 🎨 UPDATED: Removed stars row for cleaner look, diamond reward centered
// ============================================================

import React, { useEffect, useState, useRef } from 'react';

// ===== MUTED DASHBOARD PALETTE =====
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
  goldDark: '#9E7F1F',
  goldBright: '#FFC107',
  shadow: 'rgba(42, 40, 69, 0.06)',
  shadowMd: 'rgba(42, 40, 69, 0.10)',
};

const FONT_DISPLAY = "'Fredoka', sans-serif";
const FONT_BODY = "'Nunito', sans-serif";

const DEMO_MODE = false;

// ============================================================
// 🐐 GET MASCOT BY LEVEL — 10 goats × 5 levels each
// Aligned with MascotCarousel.jsx
// ============================================================
export const getMascotByLevel = (level) => {
  if (DEMO_MODE) {
    return { image: '/image/goat3.png', stage: 'Teen Goat', emoji: '🐐', color: palette.teal };
  }

  // Levels 46-50+ → Divine Goat (goat10)
  if (level >= 46) return { image: '/image/goat10.png', stage: 'Divine Goat',    emoji: '💎', color: palette.gold };
  // Levels 41-45 → Mythic Goat (goat9)
  if (level >= 41) return { image: '/image/goat9.png',  stage: 'Mythic Goat',    emoji: '🔥', color: palette.deepNavy };
  // Levels 36-40 → Legendary Goat (goat8)
  if (level >= 36) return { image: '/image/goat8.png',  stage: 'Legendary Goat', emoji: '🌟', color: palette.gold };
  // Levels 31-35 → Hero Goat (goat7)
  if (level >= 31) return { image: '/image/goat7.png',  stage: 'Hero Goat',      emoji: '⚔️', color: palette.coral };
  // Levels 26-30 → Champion Goat (goat6)
  if (level >= 26) return { image: '/image/goat6.png',  stage: 'Champion Goat',  emoji: '🏆', color: palette.warmOrange };
  // Levels 21-25 → Master Goat (goat5)
  if (level >= 21) return { image: '/image/goat5.png',  stage: 'Master Goat',    emoji: '👑', color: palette.gold };
  // Levels 16-20 → Adult Goat (goat4)
  if (level >= 16) return { image: '/image/goat4.png',  stage: 'Adult Goat',     emoji: '🐐', color: palette.coral };
  // Levels 11-15 → Teen Goat (goat3)
  if (level >= 11) return { image: '/image/goat3.png',  stage: 'Teen Goat',      emoji: '🐐', color: palette.teal };
  // Levels 6-10 → Young Goat (goat2)
  if (level >= 6)  return { image: '/image/goat2.png',  stage: 'Young Goat',     emoji: '🐐', color: palette.softGreen };
  // Levels 1-5 → Baby Goat (goat1)
  return                  { image: '/image/goat1.png',  stage: 'Baby Goat',      emoji: '🐐', color: palette.warmOrange };
};

// ============================================================
// ✅ GET CEFR BY LEVEL — Aligned with new 50-level system
// ============================================================
const getCEFRByLevel = (level) => {
  if (level >= 41) return { cefr: 'C2', cefrLabel: 'Proficient',        cefrColor: '#B71C1C', cefrBg: '#FFEBEE' };
  if (level >= 31) return { cefr: 'C1', cefrLabel: 'Advanced',          cefrColor: '#C2185B', cefrBg: '#FCE4EC' };
  if (level >= 21) return { cefr: 'B2', cefrLabel: 'Upper Intermediate',cefrColor: '#7B1FA2', cefrBg: '#F3E5F5' };
  if (level >= 11) return { cefr: 'B1', cefrLabel: 'Intermediate',      cefrColor: '#F57C00', cefrBg: '#FFF3E0' };
  if (level >= 6)  return { cefr: 'A2', cefrLabel: 'Elementary',        cefrColor: '#388E3C', cefrBg: '#E8F5E9' };
  return                  { cefr: 'A1', cefrLabel: 'Beginner',          cefrColor: '#1976D2', cefrBg: '#E3F2FD' };
};

// ============================================================
// ✅ GET CARD DATA BY LEVEL — Milestones every 5 levels
// ============================================================
export const getLevelCardData = (level) => {
  const mascot = getMascotByLevel(level);
  const cefrInfo = getCEFRByLevel(level);
  
  let data = {
    level,
    cefr: cefrInfo.cefr,
    cefrLabel: cefrInfo.cefrLabel,
    cefrColor: cefrInfo.cefrColor,
    cefrBg: cefrInfo.cefrBg,
    title: `Level ${level} reached`,
    emoji: '🎉',
    description: "You're building your ability to understand and use familiar English vocabulary.",
    goatMessage: "Your goat is growing with you!",
    goatEmoji: '✨',
    isMilestone: false,
    isEvolution: false,
    mascot: mascot,
  };

  // ============================================================
  // MILESTONE LEVELS (every 5 levels — goat evolution)
  // ============================================================
  if (level === 1) {
    data.emoji = '🌟'; data.title = "Welcome to VocaboPlay!";
    data.description = "Start your journey to becoming a confident English learner. Every word you learn brings you closer to fluency.";
    data.goatMessage = "Your Baby Goat is ready to learn with you!"; data.goatEmoji = '🐐';
  }
  else if (level === 5) {
    data.isMilestone = true; data.isEvolution = true; data.emoji = '🌱';
    data.title = "First Evolution!";
    data.description = "You've reached A1 completion! Your goat is ready to grow — meet your Young Goat!";
    data.goatMessage = "Your goat evolved! A new journey begins."; data.goatEmoji = '🎊';
  }
  else if (level === 10) {
    data.isMilestone = true; data.isEvolution = true; data.emoji = '🎓';
    data.title = "A2 Complete!";
    data.description = "You've mastered Elementary English! Your Teen Goat is growing stronger.";
    data.goatMessage = "Your goat evolved! Welcome to the Intermediate stage."; data.goatEmoji = '🎊';
  }
  else if (level === 15) {
    data.isMilestone = true; data.isEvolution = true; data.emoji = '📚';
    data.title = "Teen Goat Evolution!";
    data.description = "Your goat is becoming an Adult! You're building real fluency.";
    data.goatMessage = "Your goat evolved! Adult Goat has arrived."; data.goatEmoji = '🎊';
  }
  else if (level === 20) {
    data.isMilestone = true; data.isEvolution = true; data.emoji = '🐐';
    data.title = "B1 Complete!";
    data.description = "You've mastered Intermediate English! Master Goat is here.";
    data.goatMessage = "Your goat evolved! You're now an Upper Intermediate learner."; data.goatEmoji = '🎊';
  }
  else if (level === 25) {
    data.isMilestone = true; data.isEvolution = true; data.emoji = '🏆';
    data.title = "Champion Goat!";
    data.description = "You're becoming a Champion! Your hard work is paying off.";
    data.goatMessage = "Your goat evolved! Champion status unlocked."; data.goatEmoji = '🎊';
  }
  else if (level === 30) {
    data.isMilestone = true; data.isEvolution = true; data.emoji = '⚔️';
    data.title = "B2 Complete!";
    data.description = "Upper Intermediate mastered! You're now a Hero.";
    data.goatMessage = "Your goat evolved! Hero Goat has arrived."; data.goatEmoji = '🎊';
  }
  else if (level === 35) {
    data.isMilestone = true; data.isEvolution = true; data.emoji = '🌟';
    data.title = "Legendary Status!";
    data.description = "You're a Legend! Very few reach this far.";
    data.goatMessage = "Your goat evolved! Legendary Goat is here."; data.goatEmoji = '🎊';
  }
  else if (level === 40) {
    data.isMilestone = true; data.isEvolution = true; data.emoji = '🔥';
    data.title = "C1 Complete!";
    data.description = "Advanced English mastered! You're approaching mastery.";
    data.goatMessage = "Your goat evolved! Mythic Goat unlocked."; data.goatEmoji = '🎊';
  }
  else if (level === 45) {
    data.isMilestone = true; data.isEvolution = true; data.emoji = '💎';
    data.title = "Divine Evolution!";
    data.description = "Final evolution! Your goat has reached Divine status.";
    data.goatMessage = "Your goat has reached its final form!"; data.goatEmoji = '🎊';
  }
  else if (level === 50) {
    data.isMilestone = true; data.isEvolution = true; data.emoji = '👑';
    data.title = "C2 Complete!";
    data.description = "You've mastered English at the highest level. You're a true master!";
    data.goatMessage = "You've reached the pinnacle of proficiency!"; data.goatEmoji = '🎊';
  }
  // ============================================================
  // NON-MILESTONE LEVELS — varied messages per tier
  // ============================================================
  else if (level >= 2 && level <= 4) {
    const messages = [
      { emoji: '🎉', title: "Great Start!", desc: "Your vocabulary journey is growing stronger. Keep it up!", goat: 'Your goat is growing with you!' },
      { emoji: '🌱', title: "You're Making Progress!", desc: "You're becoming more comfortable with English vocabulary.", goat: 'Your goat is growing with you!' },
      { emoji: '⭐', title: "Keep Building Your Vocabulary!", desc: "Your daily practice is paying off!", goat: 'Your goat is getting stronger!' },
    ];
    const m = messages[(level - 2) % messages.length];
    data.emoji = m.emoji; data.title = m.title; data.description = m.desc;
    data.goatMessage = m.goat; data.goatEmoji = '🌱';
  }
  else if (level >= 6 && level <= 9) {
    const messages = [
      { emoji: '🚀', title: "You've Entered a New Stage!", desc: "You now understand sentences and common expressions.", goat: 'Your goat is getting stronger!' },
      { emoji: '📚', title: "Your Vocabulary is Expanding!", desc: "You're handling simple communication in familiar situations.", goat: 'Your goat is growing with you!' },
      { emoji: '⭐', title: "Keep Going!", desc: "Consistency is key to mastery!", goat: 'Your goat is growing with you!' },
      { emoji: '💪', title: "You're Getting Stronger!", desc: "You're building a solid foundation for advanced English!", goat: 'Your goat is growing with you!' },
    ];
    const m = messages[(level - 6) % messages.length];
    data.emoji = m.emoji; data.title = m.title; data.description = m.desc;
    data.goatMessage = m.goat; data.goatEmoji = '📖';
  }
  else if (level >= 11 && level <= 14) {
    const messages = [
      { emoji: '🚀', title: "Breaking New Ground!", desc: "You can deal with most travel situations. Independent learner ka na!", goat: 'Your goat is growing with you!' },
      { emoji: '📖', title: "Reading Between the Lines!", desc: "You understand standard input on familiar matters.", goat: 'Your goat is getting wiser!' },
      { emoji: '💬', title: "Conversations are Getting Easier!", desc: "You can produce connected text on familiar topics.", goat: 'Your goat is growing with you!' },
      { emoji: '🎯', title: "Precision is Growing!", desc: "You can describe experiences, dreams, and ambitions.", goat: 'Your goat is getting stronger!' },
    ];
    const m = messages[(level - 11) % messages.length];
    data.emoji = m.emoji; data.title = m.title; data.description = m.desc;
    data.goatMessage = m.goat; data.goatEmoji = '🌟';
  }
  else if (level >= 16 && level <= 19) {
    const messages = [
      { emoji: '🌟', title: "You're Shining!", desc: "You can give reasons and explanations for opinions.", goat: 'Your goat is glowing with you!' },
      { emoji: '📝', title: "Writing with Confidence!", desc: "Your written English is developing well.", goat: 'Your goat is growing with you!' },
      { emoji: '🎨', title: "Creativity is Blooming!", desc: "You're expressing yourself more freely in English.", goat: 'Your goat is growing with you!' },
      { emoji: '🔍', title: "Detail-Oriented!", desc: "You're picking up on nuances in English.", goat: 'Your goat is getting sharper!' },
    ];
    const m = messages[(level - 16) % messages.length];
    data.emoji = m.emoji; data.title = m.title; data.description = m.desc;
    data.goatMessage = m.goat; data.goatEmoji = '🌟';
  }
  else if (level >= 21 && level <= 24) {
    const messages = [
      { emoji: '⚡', title: "Fast Thinker!", desc: "You're processing English faster and more naturally!", goat: 'Your goat is quick on its feet!' },
      { emoji: '💎', title: "Polished and Refined!", desc: "You understand complex texts on concrete and abstract topics.", goat: 'Your English is maturing!' },
      { emoji: '🌍', title: "Global Citizen!", desc: "You interact with fluency and spontaneity.", goat: 'Your goat is growing with you!' },
      { emoji: '🎓', title: "Academic Excellence!", desc: "You produce clear, detailed text on a wide range of subjects.", goat: 'Impressive progress!' },
    ];
    const m = messages[(level - 21) % messages.length];
    data.emoji = m.emoji; data.title = m.title; data.description = m.desc;
    data.goatMessage = m.goat || 'Your goat is growing with you!'; data.goatEmoji = '💎';
  }
  else if (level >= 26 && level <= 29) {
    const messages = [
      { emoji: '🎭', title: "Expressive and Nuanced!", desc: "You can explain viewpoints with advantages and disadvantages.", goat: 'Your goat is growing with you!' },
      { emoji: '🏛️', title: "Deep Understanding!", desc: "You grasp main ideas of complex texts.", goat: 'Your goat is growing with you!' },
      { emoji: '✍️', title: "Eloquent Writer!", desc: "Your writing is becoming professional!", goat: 'Your goat is growing with you!' },
      { emoji: '🎤', title: "Confident Speaker!", desc: "You present clear descriptions on wide subjects.", goat: 'Well done!' },
    ];
    const m = messages[(level - 26) % messages.length];
    data.emoji = m.emoji; data.title = m.title; data.description = m.desc;
    data.goatMessage = m.goat || 'Your goat is growing with you!'; data.goatEmoji = '💎';
  }
  else if (level >= 31 && level <= 34) {
    const messages = [
      { emoji: '🧠', title: "Critical Thinker!", desc: "You analyze arguments in sophisticated English.", goat: 'Your goat is growing with you!' },
      { emoji: '🌈', title: "Colorful Vocabulary!", desc: "Your vocabulary range has expanded significantly.", goat: 'Your English is vibrant!' },
      { emoji: '🏆', title: "Advanced Mastery!", desc: "You express ideas fluently for social & academic purposes.", goat: 'Your goat is growing with you!' },
      { emoji: '👑', title: "Approaching Mastery!", desc: "You produce well-structured, detailed text.", goat: 'Your goat is growing with you!' },
    ];
    const m = messages[(level - 31) % messages.length];
    data.emoji = m.emoji; data.title = m.title; data.description = m.desc;
    data.goatMessage = m.goat || 'Your goat is growing with you!'; data.goatEmoji = '👑';
  }
  else if (level >= 36 && level <= 39) {
    const messages = [
      { emoji: '💫', title: "Fluent and Natural!", desc: "You're sounding more and more like a native!", goat: 'Your goat is growing with you!' },
      { emoji: '🎯', title: "Precise and Powerful!", desc: "You express yourself with precision and nuance.", goat: 'Exceptional English!' },
      { emoji: '🔮', title: "Visionary Communicator!", desc: "You recognize implicit meaning in demanding texts.", goat: 'Your goat is growing with you!' },
      { emoji: '🌟', title: "Star Learner!", desc: "You're among the most advanced English learners.", goat: 'Your dedication is remarkable!' },
    ];
    const m = messages[(level - 36) % messages.length];
    data.emoji = m.emoji; data.title = m.title; data.description = m.desc;
    data.goatMessage = m.goat || 'Your goat is growing with you!'; data.goatEmoji = '👑';
  }
  else if (level >= 41 && level <= 44) {
    const messages = [
      { emoji: '📜', title: "Eloquent and Articulate!", desc: "You use language effectively in every context.", goat: 'Your goat is growing with you!' },
      { emoji: '🎨', title: "Artistic with Words!", desc: "You craft sentences with beauty and precision.", goat: 'Your English is art form!' },
      { emoji: '🔬', title: "Analytical Excellence!", desc: "You produce complex, detailed, and analytical English.", goat: 'Your goat is growing with you!' },
      { emoji: '🌟', title: "Mastery Achieved!", desc: "You understand virtually everything you read or hear!", goat: 'Your goat is growing with you!' },
    ];
    const m = messages[(level - 41) % messages.length];
    data.emoji = m.emoji; data.title = m.title; data.description = m.desc;
    data.goatMessage = m.goat || 'Your goat is growing with you!'; data.goatEmoji = '💎';
  }
  else if (level >= 46 && level <= 49) {
    const messages = [
      { emoji: '🏅', title: "Native-Like Fluency!", desc: "You summarize information with ease.", goat: 'Your goat is growing with you!' },
      { emoji: '👑', title: "Crown of Mastery!", desc: "Your English is impeccable.", goat: 'You express yourself with elegance!' },
      { emoji: '🎓', title: "English Scholar!", desc: "You've reached the pinnacle of proficiency!", goat: 'You are a true master!' },
      { emoji: '🌟', title: "You're Shining!", desc: "You continue to grow beyond expectations.", goat: 'Truly remarkable!' },
    ];
    const m = messages[(level - 46) % messages.length];
    data.emoji = m.emoji; data.title = m.title; data.description = m.desc;
    data.goatMessage = m.goat || 'Your goat is growing with you!'; data.goatEmoji = '👑';
  }
  else if (level > 50) {
    data.emoji = '🌟'; data.title = `Level ${level} Mastery!`;
    data.description = "You continue to grow beyond expectations. Truly remarkable!";
    data.goatMessage = "Your goat continues to shine!"; data.goatEmoji = '👑';
  }
  else {
    data.title = `Level ${level} reached`;
    data.description = "You're making great progress in your English learning journey.";
    data.goatMessage = "Your goat is growing with you!";
  }

  return data;
};

// ============================================================
// 🐐 GOAT MASCOT COMPONENT (AVATAR)
// ============================================================
const GoatMascot = ({ 
  level = 1, 
  size = 96, 
  animated = true, 
  showBadge = true,
  onLevelUp = null,
  showLevelUpCard = false
}) => {
  const mascot = getMascotByLevel(level);
  const [justLeveledUp, setJustLeveledUp] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const responsiveSize = isMobile ? Math.min(size, 140) : size;

  useEffect(() => {
    const key = 'lastSeenLevel';
    const lastSeen = parseInt(localStorage.getItem(key) || '0', 10);
    
    if (level > lastSeen && lastSeen > 0) {
      setJustLeveledUp(true);
      if (showLevelUpCard) setShowCard(true);
      if (onLevelUp) onLevelUp(level);
      
      const timer = setTimeout(() => setJustLeveledUp(false), 4000);
      return () => clearTimeout(timer);
    }
    localStorage.setItem(key, String(level));
  }, [level, onLevelUp, showLevelUpCard]);

  return (
    <>
      <style>{`
        @keyframes mascotBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-6px) scale(1.03); }
        }
        @keyframes mascotGlow {
          0%, 100% { box-shadow: 0 0 0 0 ${mascot.color}40, 0 6px 16px ${palette.shadowMd}; }
          50% { box-shadow: 0 0 0 14px ${mascot.color}00, 0 6px 16px ${palette.shadowMd}; }
        }
        @keyframes sparkleFloat {
          0% { transform: translateY(0) scale(0); opacity: 0; }
          50% { transform: translateY(-14px) scale(1); opacity: 1; }
          100% { transform: translateY(-28px) scale(0); opacity: 0; }
        }
        @keyframes levelUpBurst {
          0% { transform: scale(1); filter: brightness(1); }
          30% { transform: scale(1.12); filter: brightness(1.15); }
          60% { transform: scale(1.04); filter: brightness(1.08); }
          100% { transform: scale(1); filter: brightness(1); }
        }
        .goat-mascot-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: ${animated ? 'mascotBounce 3s ease-in-out infinite' : 'none'};
        }
        .goat-mascot-wrap.leveled-up {
          animation: levelUpBurst 1s ease-out;
        }
        .goat-mascot-ring {
          position: relative;
          border-radius: 50%;
          padding: 6px;
          background: linear-gradient(135deg, ${mascot.color}CC, ${palette.creamSoft}, ${mascot.color}CC);
          animation: ${animated ? 'mascotGlow 3s ease-in-out infinite' : 'none'};
        }
        .goat-mascot-img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          object-position: center 20%;
          display: block;
          background: ${palette.white};
        }
        .goat-mascot-sparkle {
          position: absolute;
          font-size: 20px;
          animation: sparkleFloat 2s ease-in-out infinite;
          pointer-events: none;
        }
        .goat-level-overlay {
          position: absolute;
          bottom: 14%;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, ${mascot.color}, ${mascot.color}DD);
          color: white;
          padding: 3px 12px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 800;
          font-family: ${FONT_DISPLAY};
          letter-spacing: 0.5px;
          box-shadow: 0 3px 8px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.3);
          border: 2px solid ${palette.white};
          z-index: 3;
          white-space: nowrap;
          text-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }
        .goat-mascot-badge {
          position: absolute;
          bottom: -10px;
          right: -12px;
          background: ${mascot.color};
          color: white;
          font-size: 12px;
          font-weight: 800;
          padding: 5px 12px;
          border-radius: 14px;
          border: 2px solid ${palette.white};
          box-shadow: 0 4px 12px ${mascot.color}66, 0 2px 0 ${palette.border};
          white-space: nowrap;
          font-family: ${FONT_DISPLAY};
          letter-spacing: 0.02em;
        }
      `}</style>

      <div className={`goat-mascot-wrap ${justLeveledUp ? 'leveled-up' : ''}`}>
        <div
          className="goat-mascot-ring"
          style={{ width: responsiveSize, height: responsiveSize }}
        >
          <img
            src={mascot.image}
            alt={mascot.stage}
            className="goat-mascot-img"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🐐</text></svg>';
            }}
          />

          <div className="goat-level-overlay">
            LEVEL {level}
          </div>

          {justLeveledUp && (
            <>
              <span className="goat-mascot-sparkle" style={{ top: '10%', left: '0%', animationDelay: '0s' }}>✨</span>
              <span className="goat-mascot-sparkle" style={{ top: '0%', right: '10%', animationDelay: '0.3s' }}>⭐</span>
              <span className="goat-mascot-sparkle" style={{ bottom: '10%', right: '0%', animationDelay: '0.6s' }}>✨</span>
              <span className="goat-mascot-sparkle" style={{ bottom: '0%', left: '10%', animationDelay: '0.9s' }}>⭐</span>
            </>
          )}
        </div>

        {showBadge && (
          <div className="goat-mascot-badge">
            {mascot.emoji} {mascot.stage}
          </div>
        )}
      </div>

      {showCard && (
        <LevelUpCelebration 
          level={level} 
          onClose={() => setShowCard(false)} 
        />
      )}
    </>
  );
};

// ============================================================
// 🎵 SOUND HELPER — plays a fanfare using Web Audio API
// Self-contained, no external files needed
// ============================================================
const playLevelUpFanfare = (isMilestone = false) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const notes = isMilestone
      ? [
          { freq: 523.25, time: 0.00, dur: 0.18, vol: 0.30 },
          { freq: 659.25, time: 0.18, dur: 0.18, vol: 0.30 },
          { freq: 783.99, time: 0.36, dur: 0.18, vol: 0.30 },
          { freq: 1046.50, time: 0.54, dur: 0.20, vol: 0.35 },
          { freq: 1318.51, time: 0.74, dur: 0.20, vol: 0.35 },
          { freq: 1567.98, time: 0.94, dur: 0.25, vol: 0.40 },
          { freq: 2093.00, time: 1.20, dur: 0.50, vol: 0.45 },
        ]
      : [
          { freq: 523.25, time: 0.00, dur: 0.14, vol: 0.28 },
          { freq: 659.25, time: 0.14, dur: 0.14, vol: 0.28 },
          { freq: 783.99, time: 0.28, dur: 0.14, vol: 0.30 },
          { freq: 1046.50, time: 0.42, dur: 0.35, vol: 0.38 },
        ];

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(ctx.destination);

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.freq, ctx.currentTime + note.time);

      const startTime = ctx.currentTime + note.time;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(note.vol, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + note.dur);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(startTime);
      osc.stop(startTime + note.dur + 0.05);
    });

    const sparkleTimes = isMilestone ? [0.54, 0.74, 0.94, 1.20] : [0.42];
    sparkleTimes.forEach((t, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2637.02 + (i * 200), ctx.currentTime + t);
      gain.gain.setValueAtTime(0, ctx.currentTime + t);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.5);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(ctx.currentTime + t);
      osc.stop(ctx.currentTime + t + 0.6);
    });

    const totalDuration = isMilestone ? 2.0 : 1.0;
    setTimeout(() => {
      try { ctx.close(); } catch (e) {}
    }, totalDuration * 1000);
  } catch (err) {
    console.warn('Level up sound failed (likely browser autoplay policy):', err);
  }
};

// ============================================================
// 🎉 LEVEL UP CELEBRATION COMPONENT
// 💎 diamondsEarned prop — shows "+X Diamonds!" sa card
// 🎨 UPDATED: Removed stars row, centered diamond reward
// ============================================================
export const LevelUpCelebration = ({ level, onClose, muted = false, diamondsEarned = 0 }) => {
  const data = getLevelCardData(level);
  const mascot = getMascotByLevel(level);

  // 🎵 Play sound on mount (unless muted)
  const soundPlayedRef = useRef(false);
  useEffect(() => {
    if (muted) return;
    if (soundPlayedRef.current) return;
    soundPlayedRef.current = true;

    const timer = setTimeout(() => {
      playLevelUpFanfare(data.isMilestone);
    }, 200);

    return () => clearTimeout(timer);
  }, [data.isMilestone, muted]);

  return (
    <>
      <style>{`
        .celebration-overlay {
          position: fixed;
          inset: 0;
          background: radial-gradient(circle at center, rgba(255, 200, 50, 0.12), rgba(0, 0, 0, 0.75));
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
          animation: fadeIn 0.3s ease;
          backdrop-filter: blur(6px);
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        
        @keyframes celebrationPop {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.04); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes starPop {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          60% { transform: scale(1.2) rotate(10deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        
        @keyframes starTwinkle {
          0%, 100% { transform: scale(1) rotate(0deg); filter: brightness(1); }
          50% { transform: scale(1.1) rotate(5deg); filter: brightness(1.2); }
        }
        
        @keyframes goatBounceIn {
          0% { transform: scale(0) translateY(30px); opacity: 0; }
          60% { transform: scale(1.1) translateY(-5px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        
        @keyframes goatGentleBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        
        @keyframes shimmer {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.25); }
        }
        
        @keyframes raysPulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.15); opacity: 0.9; }
        }

        @keyframes diamondPop {
          0% { transform: scale(0) translateY(10px); opacity: 0; }
          60% { transform: scale(1.15) translateY(-3px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes diamondShine {
          0%, 100% { 
            filter: brightness(1) drop-shadow(0 0 6px rgba(125, 211, 252, 0.6));
            transform: rotate(0deg) scale(1);
          }
          50% { 
            filter: brightness(1.3) drop-shadow(0 0 12px rgba(125, 211, 252, 1));
            transform: rotate(15deg) scale(1.15);
          }
        }
        @keyframes diamondGlow {
          0%, 100% { box-shadow: 0 0 15px rgba(125, 211, 252, 0.4), 0 4px 12px rgba(0,0,0,0.4); }
          50% { box-shadow: 0 0 25px rgba(125, 211, 252, 0.9), 0 4px 12px rgba(0,0,0,0.4); }
        }
        
        .celebration-content {
          background: linear-gradient(180deg, #3D2E20 0%, #2A1F14 100%);
          border-radius: 28px;
          padding: 28px 24px 24px;
          max-width: 400px;
          width: 100%;
          text-align: center;
          box-shadow: 
            0 30px 80px rgba(0,0,0,0.7),
            0 0 0 4px #FFC107,
            0 0 0 8px #2A1F14;
          animation: celebrationPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          position: relative;
          overflow: hidden;
        }
        
        .celebration-title {
          font-family: ${FONT_DISPLAY};
          font-size: 32px;
          font-weight: 900;
          color: #FFC107;
          margin: 0 0 18px 0;
          text-shadow: 
            0 3px 0 #8B4513,
            0 6px 12px rgba(0,0,0,0.5),
            0 0 20px rgba(255, 193, 7, 0.5);
          letter-spacing: 2px;
          animation: shimmer 2s ease-in-out infinite;
          position: relative;
          z-index: 2;
        }
        
        .mini-star-container {
          position: relative;
          width: 100px;
          height: 100px;
          margin: 0 auto 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          animation: starPop 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.2s backwards;
        }
        
        .mini-star-rays {
          position: absolute;
          inset: -25px;
          background: conic-gradient(
            from 0deg,
            rgba(255, 193, 7, 0.6) 0deg,
            transparent 20deg,
            rgba(255, 193, 7, 0.6) 40deg,
            transparent 60deg,
            rgba(255, 193, 7, 0.6) 80deg,
            transparent 100deg,
            rgba(255, 193, 7, 0.6) 120deg,
            transparent 140deg,
            rgba(255, 193, 7, 0.6) 160deg,
            transparent 180deg,
            rgba(255, 193, 7, 0.6) 200deg,
            transparent 220deg,
            rgba(255, 193, 7, 0.6) 240deg,
            transparent 260deg,
            rgba(255, 193, 7, 0.6) 280deg,
            transparent 300deg,
            rgba(255, 193, 7, 0.6) 320deg,
            transparent 340deg
          );
          border-radius: 50%;
          animation: raysPulse 2.5s ease-in-out infinite;
          z-index: 1;
        }
        
        .mini-star {
          width: 90px;
          height: 90px;
          background: linear-gradient(135deg, #FFF3C4 0%, #FFC107 50%, #FF9800 100%);
          clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          animation: starTwinkle 2s ease-in-out infinite;
          filter: drop-shadow(0 0 12px rgba(255, 193, 7, 0.7)) drop-shadow(0 4px 8px rgba(0,0,0,0.4));
          z-index: 2;
        }
        
        .mini-star-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding-top: 6px;
        }
        
        .mini-star-lv {
          font-family: ${FONT_DISPLAY};
          font-size: 11px;
          font-weight: 900;
          color: #8B4513;
          letter-spacing: 1.5px;
          text-shadow: 0 1px 0 rgba(255,255,255,0.6);
          line-height: 1;
        }
        
        .mini-star-number {
          font-family: ${FONT_DISPLAY};
          font-size: 32px;
          font-weight: 900;
          color: #8B4513;
          line-height: 1;
          text-shadow: 
            0 2px 0 rgba(255,255,255,0.5),
            0 3px 6px rgba(0,0,0,0.3);
        }
        
        .goat-showcase {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          margin: 0 0 18px 0;
          animation: goatBounceIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.4s backwards;
          position: relative;
          z-index: 2;
        }
        
        .goat-circle {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: linear-gradient(135deg, #FFF3C4, #FFC107);
          border: 4px solid #FFC107;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          box-shadow: 
            0 0 20px rgba(255, 193, 7, 0.5),
            0 6px 16px rgba(0,0,0,0.4),
            inset 0 0 15px rgba(255,255,255,0.3);
          animation: goatGentleBounce 2.5s ease-in-out infinite;
        }
        
        .goat-circle img {
          width: 88%;
          height: 88%;
          object-fit: contain;
        }
        
        .goat-stage-label {
          font-family: ${FONT_DISPLAY};
          font-size: 16px;
          font-weight: 800;
          color: #FFC107;
          text-shadow: 0 2px 4px rgba(0,0,0,0.6);
          letter-spacing: 0.5px;
        }

        /* 💎 Diamond reward — clean & centered */
        .diamond-reward {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 60%, #7DD3FC 100%);
          border: 3px solid #7DD3FC;
          border-radius: 16px;
          padding: 12px 24px;
          margin: 0 auto 14px;
          min-width: 180px;
          box-shadow: 
            0 4px 0 #38BDF8,
            0 6px 16px rgba(56, 189, 248, 0.35),
            inset 0 1px 0 rgba(255,255,255,0.7);
          animation: diamondPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.6s backwards, 
                     diamondGlow 2s ease-in-out infinite 1.2s;
          position: relative;
          z-index: 2;
        }
        
        .diamond-icon {
          font-size: 28px;
          animation: diamondShine 1.8s ease-in-out infinite;
          display: inline-block;
          line-height: 1;
        }
        
        .diamond-text {
          font-family: ${FONT_DISPLAY};
          font-weight: 900;
          font-size: 22px;
          color: #0369A1;
          letter-spacing: 0.5px;
          text-shadow: 0 1px 0 rgba(255,255,255,0.7);
          line-height: 1;
        }
        
        .diamond-subtext {
          font-family: ${FONT_BODY};
          font-size: 10px;
          font-weight: 800;
          color: #075985;
          letter-spacing: 1px;
          text-transform: uppercase;
          opacity: 0.85;
          display: block;
          margin-top: 3px;
        }
        
        .celebration-cefr {
          display: inline-block;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 900;
          margin-bottom: 18px;
          font-family: ${FONT_BODY};
          background: ${data.cefrBg};
          color: ${data.cefrColor};
          box-shadow: 0 3px 8px rgba(0,0,0,0.4);
          position: relative;
          z-index: 2;
        }
        
        .celebration-btn {
          background: linear-gradient(180deg, #FFE082 0%, #FFC107 50%, #FF9800 100%);
          border: 3px solid #FFF8E1;
          color: #8B4513;
          padding: 14px 32px;
          border-radius: 16px;
          font-family: ${FONT_DISPLAY};
          font-size: 17px;
          font-weight: 900;
          cursor: pointer;
          width: 100%;
          letter-spacing: 1px;
          text-transform: uppercase;
          box-shadow: 
            0 5px 0 #B8860B,
            0 8px 16px rgba(0,0,0,0.5),
            inset 0 2px 0 rgba(255,255,255,0.5);
          transition: all 0.1s;
          position: relative;
          z-index: 2;
        }
        
        .celebration-btn:hover {
          transform: translateY(-2px);
          box-shadow: 
            0 7px 0 #B8860B,
            0 10px 20px rgba(0,0,0,0.5),
            inset 0 2px 0 rgba(255,255,255,0.5);
        }
        
        .celebration-btn:active {
          transform: translateY(4px);
          box-shadow: 
            0 1px 0 #B8860B,
            0 4px 8px rgba(0,0,0,0.5),
            inset 0 2px 0 rgba(255,255,255,0.5);
        }
      `}</style>

      <div className="celebration-overlay" onClick={onClose}>
        <div className="celebration-content" onClick={(e) => e.stopPropagation()}>
          
          <h2 className="celebration-title">
            ⭐ LEVEL UP! ⭐
          </h2>
          
          <div className="mini-star-container">
            <div className="mini-star-rays" />
            <div className="mini-star">
              <div className="mini-star-content">
                <span className="mini-star-lv">LV.</span>
                <span className="mini-star-number">{level}</span>
              </div>
            </div>
          </div>
          
          <div className="goat-showcase">
            <div className="goat-circle">
              <img 
                src={mascot.image} 
                alt={mascot.stage}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '🐐';
                }}
              />
            </div>
            <div className="goat-stage-label">
              {mascot.emoji} {mascot.stage}
            </div>
          </div>

          {/* 💎 Diamond reward — clean, centered, no stars */}
          {diamondsEarned > 0 && (
            <div className="diamond-reward">
              <span className="diamond-icon">💎</span>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, textAlign: 'left' }}>
                <span className="diamond-text">+{diamondsEarned}</span>
                <span className="diamond-subtext">Diamonds Earned</span>
              </div>
            </div>
          )}
          
          <div className="celebration-cefr">
            CEFR {data.cefr} · {data.cefrLabel}
          </div>
          
          <button className="celebration-btn" onClick={onClose}>
            {data.isMilestone ? '🎉 Celebrate!' : 'Continue'}
          </button>
        </div>
      </div>
    </>
  );
};

export default GoatMascot;