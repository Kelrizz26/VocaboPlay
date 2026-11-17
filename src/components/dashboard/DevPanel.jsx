// src/components/dashboard/DevPanel.jsx
// ============================================================
// 🧪 DEV / DEMO PANEL — Testing tools for diamond rewards
// Only visible when ?dev=1 is in URL
// ✅ NEW: XP Bar Override + Games Override sections (dispatch to MyProgress)
// ============================================================

import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../pages/firebase';

const FONT_DISPLAY = "'Fredoka', sans-serif";
const FONT_BODY = "'Nunito', sans-serif";

// ✅ List ng games para sa override inputs (key dapat match sa MyProgress)
const GAMES_LIST = [
  { key: 'synoQuest', label: 'Syno Quest' },
  { key: 'matchGame', label: 'Match Game' },
  { key: 'shortStory', label: 'Short Story' },
  { key: 'quizMaster', label: 'Quiz Master' },
  { key: 'guessWhat', label: 'GuessWhat' },
  { key: 'sentenceBuilder', label: 'Sentence Builder' },
];

const DevPanel = ({
  userId,
  currentLevel = 1,
  currentPoints = 0,
  currentDiamonds = 0,
  onRefresh,
  onTriggerLevelUp,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pointsInput, setPointsInput] = useState('');
  const [diamondsInput, setDiamondsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 🧪 MyProgress override state
  const [xpLevelInput, setXpLevelInput] = useState('');
  const [xpCurrentInput, setXpCurrentInput] = useState('');
  const [xpMaxInput, setXpMaxInput] = useState('');
  const [gamesInput, setGamesInput] = useState({}); // { synoQuest: '250', ... }

  // ✅ Points formula (same as Dashboard)
  const XP_BASE = 100;
  const XP_INCREMENT = 30;

  const computePointsForLevel = (targetLevel) => {
    let total = 0;
    for (let lvl = 1; lvl < targetLevel; lvl++) {
      total += XP_BASE + (lvl - 1) * XP_INCREMENT;
    }
    return total;
  };

  const handleSetPoints = async (points) => {
    if (!userId) return;
    setLoading(true);
    setMessage('');
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        totalPoints: points,
        lastActive: new Date().toISOString(),
      });

      try {
        const cached = JSON.parse(localStorage.getItem('firebaseUserData') || '{}');
        cached.totalPoints = points;
        localStorage.setItem('firebaseUserData', JSON.stringify(cached));
      } catch (e) {}

      setMessage(`✅ Points set to ${points}`);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Dev panel error:', err);
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 2500);
    }
  };

  const handleSetDiamonds = async (diamonds) => {
    if (!userId) return;
    setLoading(true);
    setMessage('');
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        totalDiamonds: diamonds,
        lastActive: new Date().toISOString(),
      });

      try {
        const cached = JSON.parse(localStorage.getItem('firebaseUserData') || '{}');
        cached.totalDiamonds = diamonds;
        localStorage.setItem('firebaseUserData', JSON.stringify(cached));
      } catch (e) {}

      setMessage(`✅ Diamonds set to ${diamonds} 💎`);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Dev panel error:', err);
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 2500);
    }
  };

  const handleJumpToLevel = async (targetLevel) => {
    const points = computePointsForLevel(targetLevel);
    await handleSetPoints(points);
    setMessage(`🚀 Jumped to Level ${targetLevel} (${points} pts)`);
  };

  const handleAddDiamonds = async (amount) => {
    const newAmount = (currentDiamonds || 0) + amount;
    await handleSetDiamonds(newAmount);
  };

  const handleResetAll = async () => {
    if (!window.confirm('Reset points to 0 and diamonds to 0?')) return;
    setLoading(true);
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        totalPoints: 0,
        totalDiamonds: 0,
        level: 1,
        xp: 0,
        xpToNext: 100,
        lastActive: new Date().toISOString(),
      });

      try {
        const cached = JSON.parse(localStorage.getItem('firebaseUserData') || '{}');
        cached.totalPoints = 0;
        cached.totalDiamonds = 0;
        cached.level = 1;
        localStorage.setItem('firebaseUserData', JSON.stringify(cached));
      } catch (e) {}

      setMessage('🔄 Reset to Level 1');
      if (onRefresh) onRefresh();
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 2500);
    }
  };

  // 🧪 ============================================================
  // 🧪 MyProgress override handlers
  // ============================================================
  const handleApplyOverrides = () => {
    const games = {};
    GAMES_LIST.forEach((g) => {
      const v = gamesInput[g.key];
      if (v !== '' && v !== undefined && v !== null) {
        games[g.key] = Number(v);
      }
    });

    window.dispatchEvent(
      new CustomEvent('demo-overrides', {
        detail: {
          level: xpLevelInput,
          xp: xpCurrentInput,
          xpToNext: xpMaxInput,
          games,
        },
      })
    );

    setMessage('✅ Applied to MyProgress');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleResetOverrides = () => {
    setXpLevelInput('');
    setXpCurrentInput('');
    setXpMaxInput('');
    setGamesInput({});

    window.dispatchEvent(
      new CustomEvent('demo-overrides', {
        detail: { level: '', xp: '', xpToNext: '', games: {} },
      })
    );

    setMessage('🔄 MyProgress overrides cleared');
    setTimeout(() => setMessage(''), 2000);
  };

  const applyXpPreset = (level, xp, xpToNext) => {
    setXpLevelInput(String(level));
    setXpCurrentInput(String(xp));
    setXpMaxInput(String(xpToNext));
  };

  const applyGamesPreset = (n) => {
    const newGames = {};
    GAMES_LIST.forEach((g) => {
      newGames[g.key] = String(n);
    });
    setGamesInput(newGames);
  };

  // ✅ UPDATED: Complete set ng levels — 1-6 (early), tapos lahat ng milestones
  const earlyLevels = [1, 2, 3, 4, 5, 6];
  const milestoneLevels = [10, 11, 16, 21, 26, 31, 36, 41, 46, 50];

  return (
    <>
      <style>{`
        .dev-fab {
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
        .dev-fab:hover { transform: scale(1.08); }
        .dev-fab:active { transform: scale(0.95); }

        .dev-panel {
          position: fixed;
          bottom: 90px;
          right: 24px;
          width: 340px;
          max-height: 80vh;
          overflow-y: auto;
          background: linear-gradient(180deg, #1F1B2E 0%, #2A2845 100%);
          border: 2px solid #7C3AED;
          border-radius: 18px;
          padding: 18px;
          z-index: 99999;
          color: white;
          font-family: ${FONT_BODY};
          box-shadow: 0 20px 60px rgba(0,0,0,0.6);
          animation: devPanelIn 0.25s ease-out;
        }
        @keyframes devPanelIn {
          from { transform: translateY(20px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }

        .dev-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(167, 139, 250, 0.3);
        }
        .dev-title {
          font-family: ${FONT_DISPLAY};
          font-size: 16px;
          font-weight: 800;
          color: #A78BFA;
        }
        .dev-close {
          background: rgba(255,255,255,0.1);
          border: none;
          color: white;
          width: 26px;
          height: 26px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
        }

        .dev-section {
          margin-bottom: 14px;
          padding: 10px;
          background: rgba(255,255,255,0.04);
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .dev-label {
          font-size: 10px;
          font-weight: 800;
          color: #A78BFA;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 8px;
          display: block;
        }

        .dev-stats {
          display: flex;
          gap: 8px;
          margin-bottom: 14px;
        }
        .dev-stat {
          flex: 1;
          background: rgba(255,255,255,0.06);
          border-radius: 10px;
          padding: 8px;
          text-align: center;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .dev-stat-value {
          font-family: ${FONT_DISPLAY};
          font-size: 18px;
          font-weight: 800;
          color: white;
          line-height: 1;
        }
        .dev-stat-label {
          font-size: 9px;
          color: rgba(255,255,255,0.5);
          letter-spacing: 0.5px;
          margin-top: 3px;
          text-transform: uppercase;
        }

        .dev-btn-row {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .dev-btn {
          flex: 1;
          min-width: 48px;
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
        .dev-btn:hover { transform: translateY(-1px); }
        .dev-btn:active {
          transform: translateY(2px);
          box-shadow: 0 1px 0 #312E81;
        }
        .dev-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .dev-btn-gold {
          background: linear-gradient(180deg, #FBBF24, #F59E0B);
          box-shadow: 0 3px 0 #B45309;
          color: #451A03;
        }
        .dev-btn-gold:active { box-shadow: 0 1px 0 #B45309; }

        .dev-btn-danger {
          background: linear-gradient(180deg, #EF4444, #DC2626);
          box-shadow: 0 3px 0 #991B1B;
        }
        .dev-btn-danger:active { box-shadow: 0 1px 0 #991B1B; }

        .dev-btn-diamond {
          background: linear-gradient(180deg, #38BDF8, #0284C7);
          box-shadow: 0 3px 0 #075985;
        }
        .dev-btn-diamond:active { box-shadow: 0 1px 0 #075985; }

        .dev-btn-green {
          background: linear-gradient(180deg, #10B981, #059669);
          box-shadow: 0 3px 0 #064E3B;
        }
        .dev-btn-green:active { box-shadow: 0 1px 0 #064E3B; }

        .dev-input {
          width: 100%;
          padding: 8px 10px;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(167, 139, 250, 0.4);
          border-radius: 8px;
          color: white;
          font-size: 13px;
          font-family: ${FONT_BODY};
          font-weight: 700;
          margin-bottom: 6px;
        }
        .dev-input::placeholder { color: rgba(255,255,255,0.3); }
        .dev-input:focus {
          outline: none;
          border-color: #A78BFA;
          box-shadow: 0 0 0 2px rgba(167, 139, 250, 0.3);
        }

        .dev-message {
          font-size: 11px;
          font-weight: 700;
          padding: 6px 10px;
          border-radius: 6px;
          background: rgba(167, 139, 250, 0.15);
          color: #DDD6FE;
          text-align: center;
          margin-top: 8px;
        }

        .dev-hint {
          font-size: 9px;
          color: rgba(255,255,255,0.4);
          text-align: center;
          margin-top: 10px;
          font-style: italic;
        }

        .dev-subsection {
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px dashed rgba(167, 139, 250, 0.25);
        }
        .dev-subsection-label {
          font-size: 9px;
          font-weight: 800;
          color: rgba(167, 139, 250, 0.7);
          letter-spacing: 0.5px;
          margin-bottom: 6px;
          display: block;
          text-transform: uppercase;
        }

        .dev-input-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 6px;
          margin-bottom: 6px;
        }
        .dev-input-grid .dev-input {
          margin-bottom: 0;
          padding: 8px 6px;
          font-size: 12px;
          text-align: center;
        }

        .dev-game-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 5px;
        }
        .dev-game-label {
          flex: 1;
          font-size: 11px;
          font-weight: 700;
          color: rgba(255,255,255,0.85);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .dev-game-input {
          width: 74px;
          padding: 6px 8px;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(167, 139, 250, 0.4);
          border-radius: 8px;
          color: white;
          font-size: 12px;
          font-family: ${FONT_BODY};
          font-weight: 700;
          text-align: center;
        }
        .dev-game-input:focus {
          outline: none;
          border-color: #A78BFA;
          box-shadow: 0 0 0 2px rgba(167, 139, 250, 0.3);
        }
        .dev-game-input::placeholder { color: rgba(255,255,255,0.3); }
      `}</style>

      {/* FAB Button */}
      <button
        className="dev-fab"
        onClick={() => setIsOpen(!isOpen)}
        title="Dev/Demo Testing Panel"
      >
        {isOpen ? '✕' : '🧪'}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="dev-panel">
          <div className="dev-header">
            <span className="dev-title">🧪 DEV / DEMO PANEL</span>
            <button className="dev-close" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          {/* Current Stats */}
          <div className="dev-stats">
            <div className="dev-stat">
              <div className="dev-stat-value">{currentLevel}</div>
              <div className="dev-stat-label">Level</div>
            </div>
            <div className="dev-stat">
              <div className="dev-stat-value">{currentPoints.toLocaleString()}</div>
              <div className="dev-stat-label">XP</div>
            </div>
            <div className="dev-stat">
              <div className="dev-stat-value">{currentDiamonds}</div>
              <div className="dev-stat-label">💎</div>
            </div>
          </div>

          {/* ✅ UPDATED: Jump to Level — may early levels na */}
          <div className="dev-section">
            <span className="dev-label">🚀 Jump to Level</span>

            {/* Early levels 1-6 */}
            <div className="dev-subsection">
              <span className="dev-subsection-label">Early Levels (A1 → A2)</span>
              <div className="dev-btn-row">
                {earlyLevels.map((lvl) => (
                  <button
                    key={lvl}
                    className="dev-btn"
                    onClick={() => handleJumpToLevel(lvl)}
                    disabled={loading}
                    title={`Jump to Level ${lvl}`}
                  >
                    L{lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Milestone levels */}
            <div className="dev-subsection">
              <span className="dev-subsection-label">Milestone Levels (💎 rewards)</span>
              <div className="dev-btn-row">
                {milestoneLevels.map((lvl) => (
                  <button
                    key={lvl}
                    className="dev-btn"
                    onClick={() => handleJumpToLevel(lvl)}
                    disabled={loading}
                    title={`Jump to Level ${lvl}`}
                  >
                    L{lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Custom Points */}
          <div className="dev-section">
            <span className="dev-label">📊 Set Custom Points</span>
            <input
              className="dev-input"
              type="number"
              placeholder="e.g. 5000"
              value={pointsInput}
              onChange={(e) => setPointsInput(e.target.value)}
            />
            <div className="dev-btn-row">
              <button
                className="dev-btn"
                onClick={() => handleSetPoints(Number(pointsInput) || 0)}
                disabled={loading || !pointsInput}
              >
                Set Points
              </button>
              <button
                className="dev-btn"
                onClick={() => handleSetPoints((currentPoints || 0) + (Number(pointsInput) || 0))}
                disabled={loading || !pointsInput}
              >
                + Add
              </button>
            </div>
          </div>

          {/* Diamonds */}
          <div className="dev-section">
            <span className="dev-label">💎 Diamonds</span>
            <input
              className="dev-input"
              type="number"
              placeholder="e.g. 100"
              value={diamondsInput}
              onChange={(e) => setDiamondsInput(e.target.value)}
            />
            <div className="dev-btn-row">
              <button
                className="dev-btn dev-btn-diamond"
                onClick={() => handleSetDiamonds(Number(diamondsInput) || 0)}
                disabled={loading || !diamondsInput}
              >
                Set 💎
              </button>
              <button
                className="dev-btn dev-btn-diamond"
                onClick={() => handleAddDiamonds(Number(diamondsInput) || 0)}
                disabled={loading || !diamondsInput}
              >
                + Add
              </button>
            </div>
            <div className="dev-btn-row" style={{ marginTop: '6px' }}>
              <button className="dev-btn dev-btn-diamond" onClick={() => handleAddDiamonds(10)} disabled={loading}>+10 💎</button>
              <button className="dev-btn dev-btn-diamond" onClick={() => handleAddDiamonds(50)} disabled={loading}>+50 💎</button>
              <button className="dev-btn dev-btn-diamond" onClick={() => handleAddDiamonds(100)} disabled={loading}>+100 💎</button>
            </div>
          </div>

          {/* 🧪 ============================================================ */}
          {/* 🧪 XP BAR OVERRIDE (MyProgress) */}
          {/* 🧪 ============================================================ */}
          <div className="dev-section">
            <span className="dev-label">📊 XP Bar Override (MyProgress)</span>

            <div className="dev-input-grid">
              <input
                className="dev-input"
                type="number"
                placeholder="Level"
                value={xpLevelInput}
                onChange={(e) => setXpLevelInput(e.target.value)}
              />
              <input
                className="dev-input"
                type="number"
                placeholder="XP"
                value={xpCurrentInput}
                onChange={(e) => setXpCurrentInput(e.target.value)}
              />
              <input
                className="dev-input"
                type="number"
                placeholder="Max"
                value={xpMaxInput}
                onChange={(e) => setXpMaxInput(e.target.value)}
              />
            </div>

            <div className="dev-subsection">
              <span className="dev-subsection-label">Quick Presets</span>
              <div className="dev-btn-row">
                <button className="dev-btn" onClick={() => applyXpPreset(1, 0, 100)}>0%</button>
                <button className="dev-btn" onClick={() => applyXpPreset(3, 25, 100)}>25%</button>
                <button className="dev-btn" onClick={() => applyXpPreset(5, 50, 100)}>50%</button>
                <button className="dev-btn" onClick={() => applyXpPreset(9, 99, 100)}>99%</button>
              </div>
            </div>
          </div>

          {/* 🧪 ============================================================ */}
          {/* 🧪 GAMES OVERRIDE (MyProgress) */}
          {/* 🧪 ============================================================ */}
          <div className="dev-section">
            <span className="dev-label">🎮 Games Override (MyProgress)</span>

            {GAMES_LIST.map((g) => (
              <div key={g.key} className="dev-game-row">
                <span className="dev-game-label">{g.label}</span>
                <input
                  className="dev-game-input"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={gamesInput[g.key] ?? ''}
                  onChange={(e) =>
                    setGamesInput((prev) => ({ ...prev, [g.key]: e.target.value }))
                  }
                />
              </div>
            ))}

            <div className="dev-subsection">
              <span className="dev-subsection-label">Quick Presets (all games)</span>
              <div className="dev-btn-row">
                <button className="dev-btn" onClick={() => applyGamesPreset(50)}>50</button>
                <button className="dev-btn" onClick={() => applyGamesPreset(100)}>100</button>
                <button className="dev-btn" onClick={() => applyGamesPreset(250)}>250</button>
                <button className="dev-btn" onClick={() => applyGamesPreset(999)}>999</button>
              </div>
            </div>

            <div className="dev-btn-row" style={{ marginTop: '10px' }}>
              <button
                className="dev-btn dev-btn-green"
                onClick={handleApplyOverrides}
                style={{ flex: 2 }}
              >
                ✅ Apply to MyProgress
              </button>
              <button
                className="dev-btn"
                onClick={handleResetOverrides}
                style={{ flex: 1 }}
              >
                🔄 Reset
              </button>
            </div>
          </div>

          {/* Trigger Celebration Manually */}
          {onTriggerLevelUp && (
            <div className="dev-section">
              <span className="dev-label">🎉 Test Celebration Card</span>
              <div className="dev-btn-row">
                <button
                  className="dev-btn dev-btn-gold"
                  onClick={() => onTriggerLevelUp(6, 2)}
                  disabled={loading}
                  title="Level 6 — 2 💎"
                >
                  L6 +2💎
                </button>
                <button
                  className="dev-btn dev-btn-gold"
                  onClick={() => onTriggerLevelUp(16, 5)}
                  disabled={loading}
                  title="Level 16 — 5 💎"
                >
                  L16 +5💎
                </button>
                <button
                  className="dev-btn dev-btn-gold"
                  onClick={() => onTriggerLevelUp(50, 75)}
                  disabled={loading}
                  title="Level 50 — 75 💎"
                >
                  L50 +75💎
                </button>
              </div>
            </div>
          )}

          {/* Reset */}
          <div className="dev-section">
            <span className="dev-label">⚠️ Danger Zone</span>
            <button
              className="dev-btn dev-btn-danger"
              onClick={handleResetAll}
              disabled={loading}
              style={{ width: '100%' }}
            >
              🔄 Reset Everything (Level 1, 0💎)
            </button>
          </div>

          {message && <div className="dev-message">{message}</div>}

          <div className="dev-hint">
            Only visible with <strong>?dev=1</strong> in URL
          </div>
        </div>
      )}
    </>
  );
};

export default DevPanel;