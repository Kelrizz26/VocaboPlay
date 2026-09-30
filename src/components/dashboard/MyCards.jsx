// src/components/dashboard/MyCards.jsx
// ============================================================
// 🎴 MY CARDS — Fully Responsive Card Collection
// ✅ MOBILE-FIRST — 2 columns on mobile, 3-5 columns on desktop
// ✅ Touch-friendly — larger tap targets
// ✅ Responsive text and padding
// ✅ Card Viewer — uses CardViewer
// ============================================================

import React, { useState, useEffect } from 'react';
import { getLevelCardData } from './GoatMascot';
import CardViewer from './CardViewer';

const palette = {
  warmOrange: '#E9A075',
  coral: '#DB7A64',
  teal: '#4F9188',
  deepNavy: '#2A2845',
  bodyTextSoft: '#8A8799',
  cream: '#FDF9F3',
  creamSoft: '#F5EFE6',
  white: '#FFFFFF',
  border: '#EBE2D5',
  softGreen: '#7FA574',
  gold: '#C9A227',
  locked: '#8A8799',
  shadow: 'rgba(42, 40, 69, 0.06)',
  shadowMd: 'rgba(42, 40, 69, 0.10)',
};

const FONT_DISPLAY = "'Fredoka', sans-serif";
const FONT_BODY = "'Nunito', sans-serif";

// ============================================================
// 🎴 CARD COLLECTION COMPONENT
// ============================================================
const GoatCardCollection = ({ currentLevel = 1 }) => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // ✅ Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const maxDisplayLevel = Math.max(currentLevel + 5, 10);
  const levels = Array.from({ length: maxDisplayLevel }, (_, i) => i + 1);

  return (
    <>
      <style>{`
        .collection-container {
          padding: 16px 12px;
          font-family: ${FONT_BODY};
          max-width: 100%;
        }
        
        .collection-header {
          font-family: ${FONT_DISPLAY};
          font-size: 20px;
          color: ${palette.deepNavy};
          margin-bottom: 16px;
          padding-left: 4px;
        }
        
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          width: 100%;
        }
        
        .card-item {
          background: ${palette.white};
          border-radius: 14px;
          padding: 12px 8px;
          text-align: center;
          border: 2px solid ${palette.border};
          transition: all 0.2s;
          position: relative;
          cursor: pointer;
          min-height: 160px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }
        
        .card-item.unlocked {
          border-color: ${palette.warmOrange};
          box-shadow: 0 3px 10px ${palette.shadowMd};
          cursor: pointer;
        }
        
        .card-item.unlocked:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 6px 16px ${palette.shadowMd};
          border-color: ${palette.gold};
        }
        
        .card-item.unlocked:active {
          transform: translateY(-1px) scale(0.98);
        }
        
        .card-item.locked {
          background: ${palette.creamSoft};
          cursor: not-allowed;
          opacity: 0.85;
          pointer-events: none;
        }
        
        .card-item.locked .card-image {
          filter: grayscale(1) brightness(0.7);
          opacity: 0.6;
        }
        
        .card-item.locked .card-level,
        .card-item.locked .card-goat-stage {
          color: ${palette.bodyTextSoft};
          opacity: 0.75;
        }
        
        .card-item.milestone {
          border-color: ${palette.gold};
          background: linear-gradient(135deg, #FFFDF5, #FFF8E1);
        }
        
        .card-item.milestone .card-level {
          color: ${palette.gold};
        }
        
        .card-level {
          font-family: ${FONT_DISPLAY};
          font-size: 12px;
          color: ${palette.bodyTextSoft};
          font-weight: 700;
          margin-bottom: 6px;
          letter-spacing: 0.2px;
        }
        
        .card-image {
          width: 48px;
          height: 48px;
          margin: 0 auto 6px;
          object-fit: contain;
          display: block;
        }
        
        .card-goat-stage {
          font-family: ${FONT_DISPLAY};
          font-size: 11px;
          color: ${palette.deepNavy};
          font-weight: 700;
          margin-bottom: 4px;
          line-height: 1.2;
          word-break: break-word;
        }
        
        .card-cefr {
          font-size: 9px;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 10px;
          display: inline-block;
          letter-spacing: 0.3px;
        }
        
        .card-lock-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 28px;
          z-index: 3;
          pointer-events: none;
          filter: drop-shadow(0 2px 6px rgba(42, 40, 69, 0.4));
          opacity: 0.9;
        }
        
        .card-view-hint {
          font-size: 9px;
          color: ${palette.bodyTextSoft};
          margin-top: 4px;
          font-weight: 600;
          opacity: 0;
          transition: opacity 0.2s;
        }
        
        .card-item.unlocked:hover .card-view-hint {
          opacity: 1;
        }
        
        .card-image-wrapper {
          position: relative;
          width: 48px;
          height: 48px;
          margin: 0 auto 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .card-image-wrapper .card-image {
          margin: 0;
        }
        
        /* ✅ TABLET — 3 columns */
        @media (min-width: 640px) {
          .collection-container {
            padding: 20px;
          }
          .collection-header {
            font-size: 22px;
            margin-bottom: 18px;
          }
          .cards-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 14px;
          }
          .card-item {
            padding: 14px 10px;
            min-height: 180px;
          }
          .card-level {
            font-size: 13px;
          }
          .card-image {
            width: 56px;
            height: 56px;
          }
          .card-image-wrapper {
            width: 56px;
            height: 56px;
          }
          .card-goat-stage {
            font-size: 12px;
          }
          .card-cefr {
            font-size: 10px;
          }
          .card-lock-overlay {
            font-size: 32px;
          }
        }
        
        /* ✅ DESKTOP — 4 columns */
        @media (min-width: 900px) {
          .collection-container {
            padding: 24px 20px;
          }
          .collection-header {
            font-size: 24px;
            margin-bottom: 20px;
          }
          .cards-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
          }
          .card-item {
            padding: 16px 12px;
            min-height: 200px;
            border-radius: 16px;
          }
          .card-level {
            font-size: 14px;
            margin-bottom: 8px;
          }
          .card-image {
            width: 64px;
            height: 64px;
            margin-bottom: 8px;
          }
          .card-image-wrapper {
            width: 64px;
            height: 64px;
            margin-bottom: 8px;
          }
          .card-goat-stage {
            font-size: 13px;
            margin-bottom: 2px;
          }
          .card-cefr {
            font-size: 11px;
            padding: 2px 10px;
          }
          .card-view-hint {
            font-size: 10px;
            margin-top: 6px;
          }
        }
        
        /* ✅ LARGE DESKTOP — 5 columns */
        @media (min-width: 1200px) {
          .cards-grid {
            grid-template-columns: repeat(5, 1fr);
            gap: 18px;
          }
        }
        
        /* ✅ EXTRA SMALL MOBILE (below 380px) — more compact */
        @media (max-width: 379px) {
          .collection-container {
            padding: 12px 8px;
          }
          .collection-header {
            font-size: 18px;
            margin-bottom: 12px;
          }
          .cards-grid {
            gap: 8px;
          }
          .card-item {
            padding: 10px 6px;
            min-height: 140px;
          }
          .card-level {
            font-size: 11px;
            margin-bottom: 4px;
          }
          .card-image {
            width: 40px;
            height: 40px;
          }
          .card-image-wrapper {
            width: 40px;
            height: 40px;
          }
          .card-goat-stage {
            font-size: 10px;
          }
          .card-cefr {
            font-size: 8px;
            padding: 2px 6px;
          }
          .card-lock-overlay {
            font-size: 24px;
          }
        }
      `}</style>

      <div className="collection-container">
        <h2 className="collection-header">🎴 My Cards</h2>
        <div className="cards-grid">
          {levels.map((lvl) => {
            const isUnlocked = lvl <= currentLevel;
            const cardData = getLevelCardData(lvl);
            
            // ✅ LOCKED CARDS
            if (!isUnlocked) {
              return (
                <div key={lvl} className="card-item locked">
                  <div className="card-level">Level {lvl}</div>
                  <div className="card-image-wrapper">
                    <img 
                      src={cardData.mascot.image} 
                      alt={cardData.mascot.stage} 
                      className="card-image"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div className="card-lock-overlay">🔒</div>
                  </div>
                  <div className="card-goat-stage">{cardData.mascot.stage}</div>
                  <div className="card-cefr" style={{ background: '#E5E7EB', color: '#6B7280' }}>
                    LOCKED
                  </div>
                </div>
              );
            }

            // ✅ UNLOCKED CARDS
            return (
              <div 
                key={lvl} 
                className={`card-item unlocked ${cardData.isMilestone ? 'milestone' : ''}`}
                onClick={() => setSelectedCard(lvl)}
              >
                {cardData.isMilestone && (
                  <div style={{ position: 'absolute', top: -6, right: 6, fontSize: 14 }}>⭐</div>
                )}
                <div className="card-level">Level {lvl}</div>
                <img 
                  src={cardData.mascot.image} 
                  alt={cardData.mascot.stage} 
                  className="card-image"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div className="card-goat-stage">{cardData.mascot.stage}</div>
                <div 
                  className="card-cefr"
                  style={{ background: cardData.cefrBg, color: cardData.cefrColor }}
                >
                  CEFR {cardData.cefr}
                </div>
                {!isMobile && (
                  <div className="card-view-hint">👆 Click to view</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ✅ CARD VIEWER — White detailed card */}
      {selectedCard && (
        <CardViewer 
          key={`card-view-${selectedCard}`}
          level={selectedCard} 
          onClose={() => setSelectedCard(null)} 
        />
      )}
    </>
  );
};

export default GoatCardCollection;