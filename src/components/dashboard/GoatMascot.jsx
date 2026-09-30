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
// ============================================================

import React, { useEffect, useState } from 'react';

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
// ✅ GET MASCOT BY LEVEL — ALIGNED WITH MascotCarousel.jsx
// ============================================================
export const getMascotByLevel = (level) => {
  if (DEMO_MODE) {
    return { image: '/image/goat3.png', stage: 'Teen Goat', emoji: '🐐', color: palette.teal };
  }

  if (level >= 10) return { image: '/image/goat10.png', stage: 'Divine Goat',    emoji: '💎', color: palette.gold };
  if (level >= 9)  return { image: '/image/goat9.png',  stage: 'Mythic Goat',    emoji: '🔥', color: palette.deepNavy };
  if (level >= 8)  return { image: '/image/goat8.png',  stage: 'Legendary Goat', emoji: '🌟', color: palette.gold };
  if (level >= 7)  return { image: '/image/goat7.png',  stage: 'Hero Goat',      emoji: '⚔️', color: palette.coral };
  if (level >= 6)  return { image: '/image/goat6.png',  stage: 'Champion Goat',  emoji: '🏆', color: palette.warmOrange };
  if (level >= 5)  return { image: '/image/goat5.png',  stage: 'Master Goat',    emoji: '👑', color: palette.gold };
  if (level >= 4)  return { image: '/image/goat4.png',  stage: 'Adult Goat',     emoji: '🐐', color: palette.coral };
  if (level >= 3)  return { image: '/image/goat3.png',  stage: 'Teen Goat',      emoji: '🐐', color: palette.teal };
  if (level >= 2)  return { image: '/image/goat2.png',  stage: 'Young Goat',     emoji: '🐐', color: palette.softGreen };
  return                  { image: '/image/goat1.png',  stage: 'Baby Goat',      emoji: '🐐', color: palette.warmOrange };
};

// ============================================================
// ✅ GET CEFR BY LEVEL
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
// ✅ GET CARD DATA BY LEVEL
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

  if (level === 1) {
    data.emoji = '🌟'; data.title = "Welcome to VocaboPlay!";
    data.description = "Start your journey to becoming a confident English learner. Every word you learn brings you closer to fluency.";
    data.goatMessage = "Your Baby Goat is ready to learn with you!"; data.goatEmoji = '🐐';
  } 
  else if (level === 2) {
    data.emoji = '🎉'; data.title = "Great Start!";
    data.description = "Your vocabulary journey is growing stronger. You're making progress toward becoming a more confident English learner!";
    data.goatMessage = "Your goat has grown! Keep learning to reach the next level!"; data.goatEmoji = '🌱';
  } 
  else if (level === 3) {
    data.emoji = '🌱'; data.title = "You're Making Progress!";
    data.description = "You're becoming more comfortable with English vocabulary. Keep practicing and building your word knowledge!";
    data.goatMessage = "Your goat is growing with you!"; data.goatEmoji = '🌱';
  } 
  else if (level === 4) {
    data.emoji = '⭐'; data.title = "Keep Building Your Vocabulary!";
    data.description = "You're developing a strong foundation in English. Your daily practice is paying off!";
    data.goatMessage = "Your goat is getting stronger!"; data.goatEmoji = '💪';
  } 
  else if (level === 5) {
    data.isMilestone = true; data.isEvolution = true; data.emoji = '🐐';
    data.title = "Goat Growth Milestone!";
    data.description = "You've reached a major milestone in your vocabulary journey. Your dedication is inspiring!";
    data.goatMessage = "Your goat evolved! Meet your Master Goat!"; data.goatEmoji = '🎊';
  } 
  else if (level === 6) {
    data.emoji = '🎉'; data.title = "You've Entered a New Stage!";
    data.description = "You can now understand sentences and frequently used expressions related to areas of most immediate relevance.";
    data.goatMessage = "Your goat is getting stronger!"; data.goatEmoji = '🚀';
  } 
  else if (level === 7) {
    data.emoji = '📚'; data.title = "Your Vocabulary is Expanding!";
    data.description = "You're expanding your vocabulary and can handle simple communication in familiar situations.";
    data.goatMessage = "Your goat is growing with you!"; data.goatEmoji = '📖';
  } 
  else if (level === 8) {
    data.emoji = '⭐'; data.title = "Keep Going!";
    data.description = "You're getting better at understanding English. Consistency is key to mastery!";
    data.goatMessage = "Your goat is growing with you!"; data.goatEmoji = '🌟';
  } 
  else if (level === 9) {
    data.emoji = '💪'; data.title = "You're Getting Stronger!";
    data.description = "Your hard work is paying off. You're building a solid foundation for more advanced English!";
    data.goatMessage = "Your goat is growing with you!"; data.goatEmoji = '🔥';
  } 
  else if (level === 10) {
    data.isMilestone = true; data.isEvolution = true; data.emoji = '🐐';
    data.title = "Another Goat Growth Milestone!";
    data.description = "You've mastered the basics and are ready for more! Your journey to fluency continues.";
    data.goatMessage = "Your goat evolved! Meet your Divine Goat!"; data.goatEmoji = '🎊';
  }
  else if (level >= 11 && level < 20) {
    const messages = [
      { emoji: '🚀', title: "Breaking New Ground!", desc: "You can deal with most situations likely to arise while traveling. You're becoming an independent learner!", goat: 'Your goat is growing with you!' },
      { emoji: '📖', title: "Reading Between the Lines!", desc: "You can understand the main points of clear standard input on familiar matters. Keep it up!", goat: 'Your goat is getting wiser!' },
      { emoji: '💬', title: "Conversations are Getting Easier!", desc: "You can produce simple connected text on topics that are familiar or of personal interest.", goat: 'Your goat is growing with you!' },
      { emoji: '🎯', title: "Precision is Growing!", desc: "You're developing the ability to describe experiences and events, dreams, hopes, and ambitions.", goat: 'Your goat is getting stronger!' },
      { emoji: '🌟', title: "You're Shining!", desc: "You can briefly give reasons and explanations for opinions and plans. Well done!", goat: 'Your goat is glowing with you!' },
      { emoji: '📝', title: "Writing with Confidence!", desc: "Your written English is developing. You can write simple connected text on familiar topics.", goat: 'Your goat is growing with you!' },
      { emoji: '🎨', title: "Creativity is Blooming!", desc: "You're expressing yourself more freely in English. Your voice is being heard!", goat: 'Your goat is growing with you!' },
      { emoji: '🔍', title: "Detail-Oriented!", desc: "You're picking up on nuances and details in English. Your comprehension is improving!", goat: 'Your goat is getting sharper!' },
      { emoji: '⚡', title: "Fast Thinker!", desc: "Your response time is improving. You're processing English faster and more naturally!", goat: 'Your goat is quick on its feet!' },
    ];
    const m = messages[(level - 11) % messages.length];
    data.emoji = m.emoji; data.title = m.title; data.description = m.desc;
    data.goatMessage = m.goat; data.goatEmoji = '🌟';
  }
  else if (level === 20) {
    data.isMilestone = true; data.isEvolution = true; data.emoji = '🐐';
    data.title = "Major Goat Milestone!";
    data.description = "You've reached an intermediate level. You can now handle more complex conversations with confidence!";
    data.goatMessage = "Your goat evolved! Meet your Divine Goat!"; data.goatEmoji = '👑';
  }
  else if (level >= 21 && level < 30) {
    const messages = [
      { emoji: '💎', title: "Polished and Refined!", desc: "You can understand complex texts on both concrete and abstract topics. Your English is maturing!" },
      { emoji: '🌍', title: "Global Citizen!", desc: "You can interact with a degree of fluency and spontaneity with native speakers." },
      { emoji: '🎓', title: "Academic Excellence!", desc: "You can produce clear, detailed text on a wide range of subjects. Impressive!" },
      { emoji: '🎭', title: "Expressive and Nuanced!", desc: "You can explain a viewpoint on a topical issue giving the advantages and disadvantages." },
      { emoji: '🏛️', title: "Deep Understanding!", desc: "You can understand the main ideas of complex texts on both concrete and abstract topics." },
      { emoji: '✍️', title: "Eloquent Writer!", desc: "You can write detailed text on many subjects. Your writing is becoming professional!" },
      { emoji: '🎤', title: "Confident Speaker!", desc: "You can present clear, detailed descriptions on a wide range of subjects. Well done!" },
      { emoji: '🧠', title: "Critical Thinker!", desc: "You can analyze arguments and express your own opinion in sophisticated English." },
      { emoji: '🌈', title: "Colorful Vocabulary!", desc: "Your vocabulary range has expanded significantly. Your English is vibrant!" },
    ];
    const m = messages[(level - 21) % messages.length];
    data.emoji = m.emoji; data.title = m.title; data.description = m.desc;
    data.goatMessage = "Your goat is growing with you!"; data.goatEmoji = '💎';
  }
  else if (level >= 31 && level < 40) {
    const messages = [
      { emoji: '🏆', title: "Advanced Mastery!", desc: "You can express ideas fluently and use language flexibly for social, academic, and professional purposes." },
      { emoji: '👑', title: "Approaching Mastery!", desc: "You can produce clear, well-structured, detailed text on complex subjects." },
      { emoji: '💫', title: "Fluent and Natural!", desc: "You can use language flexibly and effectively. You're sounding more and more like a native!" },
      { emoji: '🎯', title: "Precise and Powerful!", desc: "You can express yourself with precision and nuance. Your English is exceptional!" },
      { emoji: '🔮', title: "Visionary Communicator!", desc: "You can understand a wide range of demanding, longer texts and recognize implicit meaning." },
      { emoji: '🌟', title: "Star Learner!", desc: "You're among the most advanced English learners. Your dedication is truly remarkable!" },
      { emoji: '📜', title: "Eloquent and Articulate!", desc: "You can use language effectively for social, academic, and professional purposes." },
      { emoji: '🎨', title: "Artistic with Words!", desc: "You craft sentences with beauty and precision. Your English has become an art form!" },
      { emoji: '🔬', title: "Analytical Excellence!", desc: "You can understand and produce complex, detailed, and analytical English text." },
    ];
    const m = messages[(level - 31) % messages.length];
    data.emoji = m.emoji; data.title = m.title; data.description = m.desc;
    data.goatMessage = "Your goat is growing with you!"; data.goatEmoji = '👑';
  }
  else if (level === 40) {
    data.isMilestone = true; data.isEvolution = true; data.emoji = '🐐';
    data.title = "Legendary Goat Milestone!";
    data.description = "You've achieved advanced proficiency in English. You're an inspiration to other learners!";
    data.goatMessage = "Your goat evolved to its final form!"; data.goatEmoji = '👑';
  }
  else if (level >= 41) {
    const messages = [
      { emoji: '🌟', title: "Mastery Achieved!", desc: "You have mastered English at the highest level. You can understand virtually everything you read or hear!" },
      { emoji: '🏅', title: "Native-Like Fluency!", desc: "You can summarize information from different spoken and written sources with ease." },
      { emoji: '👑', title: "Crown of Mastery!", desc: "Your English is impeccable. You express yourself with the precision and elegance of a native speaker." },
      { emoji: '🎓', title: "English Scholar!", desc: "You've reached the pinnacle of English proficiency. You're a true master of the language!" },
    ];
    const m = messages[(level - 41) % messages.length];
    data.emoji = m.emoji; data.title = m.title; data.description = m.desc;
    data.goatMessage = "Your goat has reached its final form!"; data.goatEmoji = '👑';
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
// 🎉 LEVEL UP CELEBRATION COMPONENT
// ============================================================
export const LevelUpCelebration = ({ level, onClose }) => {
  const data = getLevelCardData(level);
  const mascot = getMascotByLevel(level);
  
  const starCount = Math.min(level, 10);
  const showPlus = level > 10;
  const extraStars = level - 10;

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
        
        @keyframes starAppear {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        
        @keyframes shimmer {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.25); }
        }
        
        @keyframes raysPulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.15); opacity: 0.9; }
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
          margin: 0 0 14px 0;
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
        
        .stars-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 3px;
          margin-bottom: 16px;
          flex-wrap: wrap;
          padding: 0 10px;
          position: relative;
          z-index: 2;
        }
        
        .bottom-star {
          font-size: 18px;
          animation: starAppear 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) backwards;
          filter: drop-shadow(0 0 4px rgba(255, 193, 7, 0.8));
          line-height: 1;
        }
        
        .plus-more {
          font-family: ${FONT_DISPLAY};
          font-size: 13px;
          font-weight: 800;
          color: #FFC107;
          margin-left: 4px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.6);
        }
        
        .celebration-cefr {
          display: inline-block;
          padding: 5px 14px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 900;
          margin-bottom: 16px;
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
          
          <div className="stars-row">
            {Array.from({ length: starCount }).map((_, i) => (
              <span 
                key={i} 
                className="bottom-star"
                style={{ animationDelay: `${0.6 + (i * 0.08)}s` }}
              >
                ⭐
              </span>
            ))}
            {showPlus && <span className="plus-more">+{extraStars}</span>}
          </div>
          
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