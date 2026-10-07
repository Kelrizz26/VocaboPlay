// src/components/dashboard/SynoQuestDevPanel.jsx
// ============================================================
// 🧪 SYNOQUEST DEV PANEL — Same as MatchGame Dev Panel
// Only visible when ?dev=1 is in URL
// ============================================================

import React, { useState } from 'react';

const FONT_DISPLAY = "'Fredoka', sans-serif";
const FONT_BODY = "'Nunito', sans-serif";

const SynoQuestDevPanel = ({
  currentLevel = 'A1',
  onJumpToLevel,
  onForceLevelUp,
  onForceGameOver,
  onForceFinished,
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
        .sq-dev-fab {
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
        .sq-dev-fab:hover { transform: scale(1.08); }
        .sq-dev-fab:active { transform: scale(0.95); }

        .sq-dev-panel {
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
          animation: sqDevIn 0.25s ease-out;
        }
        @keyframes sqDevIn {
          from { transform: translateY(20px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }

        .sq-dev-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(167, 139, 250, 0.3);
        }
        .sq-dev-title {
          font-family: ${FONT_DISPLAY};
          font-size: 14px;
          font-weight: 800;
          color: #A78BFA;
        }
        .sq-dev-close {
          background: rgba(255,255,255,0.1);
          border: none;
          color: white;
          width: 26px;
          height: 26px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
        }

        .sq-dev-section {
          margin-bottom: 12px;
          padding: 10px;
          background: rgba(255,255,255,0.04);
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .sq-dev-label {
          font-size: 10px;
          font-weight: 800;
          color: #A78BFA;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 8px;
          display: block;
        }
        .sq-dev-current {
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

        .sq-dev-btn-row {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .sq-dev-btn {
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
        .sq-dev-btn:hover { transform: translateY(-1px); }
        .sq-dev-btn:active {
          transform: translateY(2px);
          box-shadow: 0 1px 0 #312E81;
        }
        .sq-dev-btn.active {
          background: linear-gradient(180deg, #FBBF24, #F59E0B);
          box-shadow: 0 3px 0 #B45309;
          color: #451A03;
        }
        .sq-dev-btn.active:active { box-shadow: 0 1px 0 #B45309; }

        .sq-dev-btn-gold {
          background: linear-gradient(180deg, #FBBF24, #F59E0B);
          box-shadow: 0 3px 0 #B45309;
          color: #451A03;
        }
        .sq-dev-btn-gold:active { box-shadow: 0 1px 0 #B45309; }

        .sq-dev-btn-danger {
          background: linear-gradient(180deg, #EF4444, #DC2626);
          box-shadow: 0 3px 0 #991B1B;
          color: white;
        }
        .sq-dev-btn-danger:active { box-shadow: 0 1px 0 #991B1B; }

        .sq-dev-btn-green {
          background: linear-gradient(180deg, #10B981, #059669);
          box-shadow: 0 3px 0 #065F46;
          color: white;
        }
        .sq-dev-btn-green:active { box-shadow: 0 1px 0 #065F46; }

        .sq-dev-message {
          font-size: 11px;
          font-weight: 700;
          padding: 6px 10px;
          border-radius: 6px;
          background: rgba(167, 139, 250, 0.15);
          color: #DDD6FE;
          text-align: center;
          margin-top: 8px;
        }
        .sq-dev-hint {
          font-size: 9px;
          color: rgba(255,255,255,0.4);
          text-align: center;
          margin-top: 8px;
          font-style: italic;
        }
      `}</style>

      <button
        className="sq-dev-fab"
        onClick={() => setIsOpen(!isOpen)}
        title="SynoQuest Dev Panel"
      >
        {isOpen ? '✕' : '🧪'}
      </button>

      {isOpen && (
        <div className="sq-dev-panel">
          <div className="sq-dev-header">
            <span className="sq-dev-title">🧪 SYNOQUEST DEV</span>
            <button className="sq-dev-close" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="sq-dev-current">
            Current: {currentLevel}
          </div>

          <div className="sq-dev-section">
            <span className="sq-dev-label">🚀 Jump to Level</span>
            <div className="sq-dev-btn-row">
              {levels.map((lvl) => (
                <button
                  key={lvl}
                  className={`sq-dev-btn ${currentLevel === lvl ? 'active' : ''}`}
                  onClick={() => handleJump(lvl)}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="sq-dev-section">
            <span className="sq-dev-label">🎉 Show Level Up Modal</span>
            <div className="sq-dev-btn-row">
              <button className="sq-dev-btn sq-dev-btn-gold" onClick={() => handleForceLevelUp('A1', 'A2')}>A1→A2</button>
              <button className="sq-dev-btn sq-dev-btn-gold" onClick={() => handleForceLevelUp('B1', 'B2')}>B1→B2</button>
              <button className="sq-dev-btn sq-dev-btn-gold" onClick={() => handleForceLevelUp('C1', 'C2')}>C1→C2</button>
            </div>
          </div>

          <div className="sq-dev-section">
            <span className="sq-dev-label">🎬 Force End Screens</span>
            <div className="sq-dev-btn-row">
              <button className="sq-dev-btn sq-dev-btn-danger" onClick={onForceGameOver}>
                💀 Game Over
              </button>
              <button className="sq-dev-btn sq-dev-btn-green" onClick={onForceFinished}>
                👑 All Complete
              </button>
            </div>
          </div>

          {message && <div className="sq-dev-message">{message}</div>}

          <div className="sq-dev-hint">
            Only visible with <strong>?dev=1</strong>
          </div>
        </div>
      )}
    </>
  );
};

export default SynoQuestDevPanel;