// src/components/dashboard/MatchGameDevPanel.jsx
// ============================================================
// 🧪 MATCH GAME DEV PANEL — Testing tools para sa lahat ng levels
// Only visible when ?dev=1 is in URL
// ============================================================

import React, { useState } from 'react';

const FONT_DISPLAY = "'Fredoka', sans-serif";
const FONT_BODY = "'Nunito', sans-serif";

const MatchGameDevPanel = ({
  currentLevel = 'A1',
  onJumpToLevel,      // (level) => void
  onForceLevelUp,     // (from, to) => void
  onForceGameOver,    // () => void
  onForceFinished,    // () => void
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 2000);
  };

  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  const handleJump = (lvl) => {
    if (onJumpToLevel) {
      onJumpToLevel(lvl);
      showMessage(`🚀 Jumped to ${lvl}`);
    }
  };

  const handleForceLevelUp = (from, to) => {
    if (onForceLevelUp) {
      onForceLevelUp(from, to);
      showMessage(`🎉 Level Up: ${from} → ${to}`);
    }
  };

  return (
    <>
      <style>{`
        .mg-dev-fab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7C3AED, #5B21B6);
          color: white;
          border: 3px solid #A78BFA;
          font-size: 24px;
          cursor: pointer;
          z-index: 99998;
          box-shadow: 0 6px 20px rgba(124, 58, 237, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.15s ease;
          font-family: ${FONT_DISPLAY};
        }
        .mg-dev-fab:hover { transform: scale(1.08); }
        .mg-dev-fab:active { transform: scale(0.95); }

        .mg-dev-panel {
          position: fixed;
          bottom: 90px;
          right: 24px;
          width: 320px;
          max-height: 80vh;
          overflow-y: auto;
          background: linear-gradient(180deg, #1F1B2E 0%, #2A2845 100%);
          border: 2px solid #7C3AED;
          border-radius: 18px;
          padding: 16px;
          z-index: 99999;
          color: white;
          font-family: ${FONT_BODY};
          box-shadow: 0 20px 60px rgba(0,0,0,0.6);
          animation: mgDevIn 0.25s ease-out;
        }
        @keyframes mgDevIn {
          from { transform: translateY(20px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }

        .mg-dev-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(167, 139, 250, 0.3);
        }
        .mg-dev-title {
          font-family: ${FONT_DISPLAY};
          font-size: 14px;
          font-weight: 800;
          color: #A78BFA;
        }
        .mg-dev-close {
          background: rgba(255,255,255,0.1);
          border: none;
          color: white;
          width: 26px;
          height: 26px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
        }

        .mg-dev-section {
          margin-bottom: 12px;
          padding: 10px;
          background: rgba(255,255,255,0.04);
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .mg-dev-label {
          font-size: 10px;
          font-weight: 800;
          color: #A78BFA;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 8px;
          display: block;
        }
        .mg-dev-current {
          font-family: ${FONT_DISPLAY};
          font-size: 16px;
          font-weight: 800;
          color: white;
          text-align: center;
          padding: 6px;
          background: rgba(167, 139, 250, 0.15);
          border-radius: 8px;
          margin-bottom: 8px;
        }

        .mg-dev-btn-row {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .mg-dev-btn {
          flex: 1;
          min-width: 42px;
          padding: 8px 4px;
          background: linear-gradient(180deg, #4F46E5, #4338CA);
          color: white;
          border: none;
          border-radius: 8px;
          font-family: ${FONT_DISPLAY};
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 3px 0 #312E81;
          transition: all 0.1s;
          text-align: center;
        }
        .mg-dev-btn:hover { transform: translateY(-1px); }
        .mg-dev-btn:active {
          transform: translateY(2px);
          box-shadow: 0 1px 0 #312E81;
        }
        .mg-dev-btn.active {
          background: linear-gradient(180deg, #FBBF24, #F59E0B);
          box-shadow: 0 3px 0 #B45309;
          color: #451A03;
        }
        .mg-dev-btn.active:active { box-shadow: 0 1px 0 #B45309; }

        .mg-dev-btn-gold {
          background: linear-gradient(180deg, #FBBF24, #F59E0B);
          box-shadow: 0 3px 0 #B45309;
          color: #451A03;
        }
        .mg-dev-btn-gold:active { box-shadow: 0 1px 0 #B45309; }

        .mg-dev-btn-danger {
          background: linear-gradient(180deg, #EF4444, #DC2626);
          box-shadow: 0 3px 0 #991B1B;
          color: white;
        }
        .mg-dev-btn-danger:active { box-shadow: 0 1px 0 #991B1B; }

        .mg-dev-btn-green {
          background: linear-gradient(180deg, #10B981, #059669);
          box-shadow: 0 3px 0 #065F46;
          color: white;
        }
        .mg-dev-btn-green:active { box-shadow: 0 1px 0 #065F46; }

        .mg-dev-message {
          font-size: 11px;
          font-weight: 700;
          padding: 6px 10px;
          border-radius: 6px;
          background: rgba(167, 139, 250, 0.15);
          color: #DDD6FE;
          text-align: center;
          margin-top: 8px;
        }
        .mg-dev-hint {
          font-size: 9px;
          color: rgba(255,255,255,0.4);
          text-align: center;
          margin-top: 8px;
          font-style: italic;
        }
      `}</style>

      {/* FAB Button */}
      <button
        className="mg-dev-fab"
        onClick={() => setIsOpen(!isOpen)}
        title="Match Game Dev Panel"
      >
        {isOpen ? '✕' : '🧪'}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="mg-dev-panel">
          <div className="mg-dev-header">
            <span className="mg-dev-title">🧪 MATCH GAME DEV</span>
            <button className="mg-dev-close" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          {/* Current Level */}
          <div className="mg-dev-current">
            Current: {currentLevel}
          </div>

          {/* Jump to Level */}
          <div className="mg-dev-section">
            <span className="mg-dev-label">🚀 Jump to Level</span>
            <div className="mg-dev-btn-row">
              {levels.map((lvl) => (
                <button
                  key={lvl}
                  className={`mg-dev-btn ${currentLevel === lvl ? 'active' : ''}`}
                  onClick={() => handleJump(lvl)}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Force Level Up Modal */}
          <div className="mg-dev-section">
            <span className="mg-dev-label">🎉 Show Level Up Modal</span>
            <div className="mg-dev-btn-row">
              <button className="mg-dev-btn mg-dev-btn-gold" onClick={() => handleForceLevelUp('A1', 'A2')}>A1→A2</button>
              <button className="mg-dev-btn mg-dev-btn-gold" onClick={() => handleForceLevelUp('B1', 'B2')}>B1→B2</button>
              <button className="mg-dev-btn mg-dev-btn-gold" onClick={() => handleForceLevelUp('C1', 'C2')}>C1→C2</button>
            </div>
          </div>

          {/* Force End Screens */}
          <div className="mg-dev-section">
            <span className="mg-dev-label">🎬 Force End Screens</span>
            <div className="mg-dev-btn-row">
              <button className="mg-dev-btn mg-dev-btn-danger" onClick={onForceGameOver}>
                💀 Game Over
              </button>
              <button className="mg-dev-btn mg-dev-btn-green" onClick={onForceFinished}>
                👑 All Complete
              </button>
            </div>
          </div>

          {message && <div className="mg-dev-message">{message}</div>}

          <div className="mg-dev-hint">
            Only visible with <strong>?dev=1</strong>
          </div>
        </div>
      )}
    </>
  );
};

export default MatchGameDevPanel;