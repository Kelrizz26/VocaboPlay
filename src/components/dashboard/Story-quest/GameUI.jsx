import React from 'react';

const GameUI = ({
  scene,
  currentScene,
  allScenes,
  score,
  lives,
  maxLives,
  timer,
  isSpeaking,
  displayText,
  isTyping,
  selectedChoice,
  feedbackType,
  feedbackMessage,
  showFeedback,
  handleChoice,
  handleExit,
  showExitConfirm,
  ExitConfirmModal,
  saveGameProgress,
  saveGameToFirebase,
  setGameState,
  stopSpeaking
}) => {
  const displayHearts = () => {
    const hearts = [];
    for (let i = 0; i < maxLives; i++) {
      hearts.push(i < lives ? '❤️' : '🖤');
    }
    return hearts.join('');
  };

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      pointerEvents: 'none', display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between', padding: '16px'
    }}>
      {/* TOP BAR */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 18px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)',
        borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)',
        pointerEvents: 'auto', maxWidth: '900px', width: '100%', margin: '0 auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontWeight: '600', color: 'white', fontSize: '14px' }}>📖 Story Quest</span>
          <span style={{ padding: '2px 10px', borderRadius: '8px', background: 'rgba(124, 111, 214, 0.2)', color: '#5C6AC4', fontSize: '10px', fontWeight: '600' }}>📚 {allScenes.length} Words</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '2px' }}>{displayHearts()}</span>
          <span style={{ fontSize: '14px', color: '#fbbf24', fontWeight: '600' }}>⭐ {score}</span>
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: timer <= 3 ? 'rgba(239, 68, 68, 0.3)' : timer <= 5 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255,255,255,0.1)',
            border: `2px solid ${timer <= 3 ? '#ef4444' : timer <= 5 ? '#f59e0b' : 'rgba(255,255,255,0.2)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: timer <= 3 ? '#ef4444' : timer <= 5 ? '#f59e0b' : 'white',
            fontSize: '13px', fontWeight: '700'
          }}>
            {timer}
          </div>
          <button onClick={handleExit} style={{ padding: '6px 16px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', cursor: 'pointer', fontSize: '13px', fontWeight: '600', pointerEvents: 'auto' }}>✕ Exit</button>
        </div>
      </div>

      {/* BOTTOM UI */}
      <div style={{
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(16px)',
        borderRadius: '16px', padding: '16px 20px',
        border: '1px solid rgba(255,255,255,0.06)',
        pointerEvents: 'auto', maxWidth: '900px', width: '100%',
        margin: '0 auto', maxHeight: '45vh', overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '11px', color: '#94a3b8' }}>
          <span>📖 Word {currentScene + 1} of {allScenes.length}</span>
          <span style={{ color: '#5C6AC4' }}>❤️ {lives}/{maxLives}</span>
        </div>

        <div style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', marginBottom: '10px', minHeight: '50px', maxHeight: '80px', overflow: 'auto' }}>
          <p style={{ color: '#e2e8f0', fontSize: '14px', lineHeight: '1.7', margin: 0 }}>
            {isTyping ? (
              <span>{displayText}<span style={{ display: 'inline-block', width: '2px', height: '16px', background: '#5C6AC4', animation: 'blink 0.8s step-end infinite' }} /></span>
            ) : (scene.text || 'Loading...')}
            <style>{`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }`}</style>
          </p>
        </div>

        {scene.vocabulary && (
          <div style={{ padding: '6px 12px', background: 'rgba(124, 111, 214, 0.1)', borderRadius: '8px', marginBottom: '10px', display: 'inline-block' }}>
            <span style={{ fontSize: '15px', color: '#5C6AC4', fontWeight: '600' }}>📚 {scene.vocabulary}</span>
          </div>
        )}

        {scene.choices && scene.choices.length > 0 && lives > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
            {scene.choices.map((choice) => {
              let bgColor = 'rgba(255,255,255,0.04)', borderColor = 'rgba(255,255,255,0.06)', textColor = '#e2e8f0';
              if (selectedChoice === choice.id) {
                if (feedbackType === 'correct') { bgColor = 'rgba(34, 197, 94, 0.2)'; borderColor = '#22c55e'; textColor = '#4ade80'; }
                else if (feedbackType === 'wrong') { bgColor = 'rgba(239, 68, 68, 0.2)'; borderColor = '#ef4444'; textColor = '#f87171'; }
              }
              return (
                <button key={choice.id} onClick={() => handleChoice(choice)} disabled={selectedChoice !== null || lives <= 0} style={{ padding: '10px 14px', borderRadius: '10px', border: `1px solid ${borderColor}`, background: bgColor, color: textColor, cursor: selectedChoice !== null || lives <= 0 ? 'default' : 'pointer', fontSize: '13px', fontWeight: '500', textAlign: 'center', fontFamily: "'Poppins', sans-serif" }}>
                  <span style={{ fontWeight: '600', marginRight: '6px' }}>{choice.id}.</span>{choice.text}
                  {selectedChoice === choice.id && feedbackType === 'correct' && <span style={{ marginLeft: '6px', color: '#4ade80' }}>✅</span>}
                  {selectedChoice === choice.id && feedbackType === 'wrong' && <span style={{ marginLeft: '6px', color: '#f87171' }}>❌</span>}
                </button>
              );
            })}
          </div>
        )}

        {showFeedback && (
          <div style={{ marginTop: '10px', padding: '8px', borderRadius: '10px', background: feedbackType === 'correct' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${feedbackType === 'correct' ? '#22c55e' : '#ef4444'}`, textAlign: 'center', fontSize: '13px', fontWeight: '500', color: feedbackType === 'correct' ? '#4ade80' : '#f87171' }}>
            {feedbackMessage}
          </div>
        )}

        {lives === 0 && (
          <div style={{ marginTop: '10px', padding: '10px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', textAlign: 'center', fontSize: '14px', color: '#f87171' }}>
            💀 No lives left! Game over...
            <button onClick={() => { saveGameProgress(false); saveGameToFirebase(false); setGameState('gameover'); }} style={{ marginLeft: '12px', padding: '4px 16px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#f87171', cursor: 'pointer', fontSize: '12px' }}>End Game</button>
          </div>
        )}
      </div>

      {isSpeaking && (
        <div style={{ position: 'absolute', top: '80px', right: '30px', padding: '6px 14px', background: 'rgba(34, 197, 94, 0.15)', backdropFilter: 'blur(10px)', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#4ade80', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', pointerEvents: 'none' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%', animation: 'pulse 0.8s ease-in-out infinite' }} />
          Speaking...
          <style>{`@keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 1; transform: scale(1.3); } }`}</style>
        </div>
      )}
    </div>
  );
};

export default GameUI;