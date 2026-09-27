// src/components/dashboard/CardViewer.jsx
// ============================================================
// 🎴 CARD VIEWER — White detailed card (Fully Responsive)
// ✅ Mobile-first design
// ✅ Touch-friendly buttons at spacing
// ✅ Responsive text sizes
// ✅ Scrollable kung hindi kasya sa screen
// ============================================================

import React, { useEffect } from 'react';
import { getLevelCardData } from './GoatMascot';

const FONT_DISPLAY = "'Fredoka', sans-serif";
const FONT_BODY = "'Nunito', sans-serif";

// ============================================================
// 🎴 CARD VIEWER COMPONENT
// ============================================================
export const CardViewer = ({ level, onClose }) => {
  const data = getLevelCardData(level);

  // ✅ Lock body scroll habang bukas ang modal
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <>
      <style>{`
        .cv-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 16px;
          animation: cvFadeIn 0.3s ease;
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          overflow-y: auto;
        }
        @keyframes cvFadeIn { from { opacity: 0; } to { opacity: 1; } }
        
        @keyframes cvPop {
          0% { transform: scale(0.7); opacity: 0; }
          60% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .cv-content {
          background: #FFFFFF;
          border-radius: 20px;
          padding: 24px 18px;
          max-width: 400px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          animation: cvPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          position: relative;
          margin: auto;
          max-height: calc(100vh - 32px);
          overflow-y: auto;
        }
        
        .cv-trophy-circle {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #E3F2FD;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 10px;
          font-size: 26px;
        }
        
        .cv-subtitle {
          font-family: ${FONT_BODY};
          font-size: 13px;
          color: #8A8799;
          margin: 0 0 4px 0;
          font-weight: 600;
          letter-spacing: 0.3px;
        }
        
        .cv-title {
          font-family: ${FONT_DISPLAY};
          font-size: 22px;
          color: #2A2845;
          margin: 0 0 18px 0;
          font-weight: 700;
          line-height: 1.3;
        }
        
        .cv-mascot-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #F5EFE6;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 14px;
          font-size: 42px;
          overflow: hidden;
        }
        
        .cv-mascot-img {
          width: 85%;
          height: 85%;
          object-fit: contain;
        }
        
        .cv-cefr {
          display: inline-block;
          background: #E3F2FD;
          color: #1976D2;
          padding: 5px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 14px;
          font-family: ${FONT_BODY};
        }
        
        .cv-desc {
          font-family: ${FONT_BODY};
          font-size: 13px;
          color: #6B6880;
          line-height: 1.5;
          margin-bottom: 14px;
          padding: 0 4px;
        }
        
        .cv-divider {
          height: 1px;
          background: #F2EBE0;
          margin: 14px 0;
        }
        
        .cv-goat-msg {
          font-family: ${FONT_BODY};
          font-size: 13px;
          color: #2A2845;
          font-weight: 700;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 0 4px;
        }
        
        .cv-btn {
          background: #FFFFFF;
          border: 2px solid #EBE2D5;
          color: #2A2845;
          padding: 12px 24px;
          border-radius: 12px;
          font-family: ${FONT_DISPLAY};
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          width: 100%;
          transition: all 0.2s;
          min-height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          -webkit-tap-highlight-color: transparent;
          user-select: none;
        }
        
        .cv-btn:hover {
          background: #F5EFE6;
          border-color: #E9A075;
        }
        
        .cv-btn:active {
          background: #F5EFE6;
          border-color: #E9A075;
          transform: scale(0.98);
        }
        
        /* ✅ TABLET at DESKTOP — bigger sizes */
        @media (min-width: 640px) {
          .cv-overlay {
            padding: 20px;
          }
          .cv-content {
            border-radius: 24px;
            padding: 32px 24px;
            max-height: calc(100vh - 40px);
          }
          .cv-trophy-circle {
            width: 64px;
            height: 64px;
            font-size: 28px;
            margin-bottom: 12px;
          }
          .cv-subtitle {
            font-size: 14px;
          }
          .cv-title {
            font-size: 26px;
            margin-bottom: 24px;
          }
          .cv-mascot-circle {
            width: 90px;
            height: 90px;
            font-size: 48px;
            margin-bottom: 18px;
          }
          .cv-cefr {
            padding: 6px 16px;
            font-size: 13px;
            margin-bottom: 18px;
          }
          .cv-desc {
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 18px;
            padding: 0 8px;
          }
          .cv-divider {
            margin: 18px 0;
          }
          .cv-goat-msg {
            font-size: 14px;
            gap: 8px;
            margin-bottom: 24px;
          }
          .cv-btn {
            padding: 14px 32px;
            font-size: 15px;
          }
        }
        
        /* ✅ EXTRA SMALL MOBILE — compact */
        @media (max-width: 379px) {
          .cv-overlay {
            padding: 10px;
          }
          .cv-content {
            padding: 20px 14px;
            border-radius: 18px;
            max-height: calc(100vh - 20px);
          }
          .cv-trophy-circle {
            width: 48px;
            height: 48px;
            font-size: 22px;
          }
          .cv-title {
            font-size: 20px;
            margin-bottom: 16px;
          }
          .cv-mascot-circle {
            width: 70px;
            height: 70px;
            font-size: 36px;
          }
          .cv-desc {
            font-size: 12px;
          }
          .cv-goat-msg {
            font-size: 12px;
          }
          .cv-btn {
            padding: 10px 20px;
            font-size: 13px;
            min-height: 40px;
          }
        }
        
        /* ✅ Landscape mobile — mas compact */
        @media (max-height: 500px) and (orientation: landscape) {
          .cv-content {
            max-height: 95vh;
            padding: 16px 18px;
          }
          .cv-title {
            font-size: 20px;
            margin-bottom: 12px;
          }
          .cv-mascot-circle {
            width: 64px;
            height: 64px;
            margin-bottom: 10px;
          }
          .cv-divider {
            margin: 10px 0;
          }
          .cv-goat-msg {
            margin-bottom: 14px;
          }
        }
      `}</style>

      <div className="cv-overlay" onClick={onClose}>
        <div className="cv-content" onClick={(e) => e.stopPropagation()}>
          
          {/* Trophy Icon */}
          <div className="cv-trophy-circle">🏆</div>
          
          {/* Subtitle */}
          <p className="cv-subtitle">Level up</p>
          
          {/* Title */}
          <h2 className="cv-title">Level {level} reached</h2>

          {/* Goat Image */}
          <div className="cv-mascot-circle">
            <img 
              src={data.mascot.image} 
              alt={data.mascot.stage} 
              className="cv-mascot-img"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '🐐';
              }}
            />
          </div>

          {/* CEFR Badge */}
          <div className="cv-cefr">
            CEFR {data.cefr} · {data.cefrLabel.toLowerCase()}
          </div>

          {/* Description */}
          <p className="cv-desc">{data.description}</p>

          {/* Divider */}
          <div className="cv-divider" />

          {/* Goat Growth Message */}
          <p className="cv-goat-msg">
            ✨ {data.goatMessage}
          </p>

          {/* Continue Button */}
          <button className="cv-btn" onClick={onClose}>
            Continue learning
          </button>
        </div>
      </div>
    </>
  );
};

export default CardViewer;