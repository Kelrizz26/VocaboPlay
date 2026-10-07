// src/components/dashboard/Story-quest/StoryQuestDevPanel.jsx
// 🧪 DEV PANEL — Para sa testing ng StoryQuest flow
// Lumalabas lang kapag ?dev=1 sa URL

import React, { useState } from 'react';

const FONT_DISPLAY = "'Fredoka', sans-serif";
const FONT_BODY = "'Nunito', sans-serif";

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const StoryQuestDevPanel = ({
  gameState,
  currentLevel,
  currentScene,
  totalScenes,
  lives,
  maxLives,
  localDiamonds,
  localPoints,
  completedLevels = [],
  onJumpToLevel,
  onForceLevelComplete,
  onForceGameOver,
  onForceFinished,
  onSkipToLastScene,
  onSetLives,
  onAddDiamonds,
  onAddPoints,
  onResetAll,
  onReturnToMap,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [diamondsInput, setDiamondsInput] = useState(100);
  const [pointsInput, setPointsInput] = useState(100);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          zIndex: 99999,
          padding: '10px 14px',
          background: 'linear-gradient(135deg, #1F2937, #111827)',
          color: '#10B981',
          border: '2px solid #10B981',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '800',
          fontFamily: FONT_DISPLAY,
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4), 0 0 20px rgba(16, 185, 129, 0.3)',
          letterSpacing: '0.5px',
        }}
      >
        🧪 DEV
      </button>
    );
  }

  const btnStyle = (color = '#3B82F6') => ({
    padding: '8px 10px',
    background: color,
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: '700',
    fontFamily: FONT_BODY,
    cursor: 'pointer',
    textAlign: 'center',
    width: '100%',
  });

  const sectionTitle = {
    fontSize: '10px',
    fontWeight: '800',
    color: '#10B981',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginTop: '12px',
    marginBottom: '6px',
    fontFamily: FONT_DISPLAY,
    borderBottom: '1px solid #374151',
    paddingBottom: '4px',
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '16px',
      right: '16px',
      zIndex: 99999,
      width: '280px',
      maxHeight: '90vh',
      overflowY: 'auto',
      background: 'linear-gradient(180deg, #1F2937, #111827)',
      border: '2px solid #10B981',
      borderRadius: '14px',
      padding: '14px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 40px rgba(16, 185, 129, 0.2)',
      fontFamily: FONT_BODY,
      color: '#E5E7EB',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
      }}>
        <span style={{
          fontSize: '13px',
          fontWeight: '900',
          color: '#10B981',
          fontFamily: FONT_DISPLAY,
          letterSpacing: '0.5px',
        }}>
          🧪 DEV PANEL
        </span>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#9CA3AF',
            fontSize: '16px',
            cursor: 'pointer',
            padding: '0 4px',
          }}
        >
          ✕
        </button>
      </div>

      {/* Current State */}
      <div style={{
        background: '#0F172A',
        padding: '8px 10px',
        borderRadius: '8px',
        fontSize: '11px',
        lineHeight: '1.6',
        marginBottom: '8px',
      }}>
        <div><strong style={{ color: '#10B981' }}>State:</strong> {gameState}</div>
        <div><strong style={{ color: '#10B981' }}>Level:</strong> {currentLevel}</div>
        <div><strong style={{ color: '#10B981' }}>Scene:</strong> {currentScene + 1}/{totalScenes || 0}</div>
        <div><strong style={{ color: '#10B981' }}>Lives:</strong> {lives}/{maxLives}</div>
        <div><strong style={{ color: '#10B981' }}>💎:</strong> {localDiamonds} | <strong style={{ color: '#10B981' }}>💰:</strong> {localPoints}</div>
        <div><strong style={{ color: '#10B981' }}>Completed:</strong> {completedLevels.length > 0 ? completedLevels.join(', ') : 'none'}</div>
      </div>

      {/* LEVEL CONTROLS */}
      <div style={sectionTitle}>🎮 Jump to Level</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
        {CEFR_LEVELS.map((lvl) => (
          <button
            key={lvl}
            onClick={() => onJumpToLevel(lvl)}
            style={{
              ...btnStyle(completedLevels.includes(lvl) ? '#10B981' : '#3B82F6'),
              padding: '6px 4px',
              fontSize: '11px',
            }}
          >
            {lvl}
          </button>
        ))}
      </div>

      {/* FLOW CONTROLS */}
      <div style={sectionTitle}>🚀 Flow Controls</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <button onClick={onForceLevelComplete} style={btnStyle('#8B5CF6')}>
          ⏭️ Force Complete Level → Return to Map
        </button>
        <button onClick={onSkipToLastScene} style={btnStyle('#F59E0B')}>
          ⏩ Skip to Last Scene
        </button>
        <button onClick={onForceGameOver} style={btnStyle('#EF4444')}>
          💀 Force Game Over
        </button>
        <button onClick={onForceFinished} style={btnStyle('#F97316')}>
          👑 Force Finished (All Complete)
        </button>
        <button onClick={onReturnToMap} style={btnStyle('#6B7280')}>
          🗺️ Return to Map
        </button>
      </div>

      {/* RESOURCES */}
      <div style={sectionTitle}>💎 Resources</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          <input
            type="number"
            value={diamondsInput}
            onChange={(e) => setDiamondsInput(Number(e.target.value))}
            style={{
              flex: 1,
              padding: '6px 8px',
              background: '#0F172A',
              border: '1px solid #374151',
              borderRadius: '6px',
              color: '#E5E7EB',
              fontSize: '11px',
              fontFamily: FONT_BODY,
            }}
          />
          <button
            onClick={() => onAddDiamonds(diamondsInput)}
            style={{ ...btnStyle('#06B6D4'), width: 'auto', padding: '6px 10px' }}
          >
            + 💎
          </button>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <input
            type="number"
            value={pointsInput}
            onChange={(e) => setPointsInput(Number(e.target.value))}
            style={{
              flex: 1,
              padding: '6px 8px',
              background: '#0F172A',
              border: '1px solid #374151',
              borderRadius: '6px',
              color: '#E5E7EB',
              fontSize: '11px',
              fontFamily: FONT_BODY,
            }}
          />
          <button
            onClick={() => onAddPoints(pointsInput)}
            style={{ ...btnStyle('#EAB308'), width: 'auto', padding: '6px 10px' }}
          >
            + 💰
          </button>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[0, 1, 3, 5].map((n) => (
            <button
              key={n}
              onClick={() => onSetLives(n)}
              style={{
                ...btnStyle('#DC2626'),
                padding: '6px 4px',
                fontSize: '10px',
                flex: 1,
              }}
            >
              ❤️ {n}
            </button>
          ))}
        </div>
      </div>

      {/* RESET */}
      <div style={sectionTitle}>⚠️ Danger Zone</div>
      <button
        onClick={() => {
          if (window.confirm('Reset ALL progress? Hindi na ito maibabalik.')) {
            onResetAll();
          }
        }}
        style={btnStyle('#7F1D1D')}
      >
        🔥 Reset All Progress
      </button>
    </div>
  );
};

export default StoryQuestDevPanel;