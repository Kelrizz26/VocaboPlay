// src/components/dashboard/ShortStoryGame.jsx
// ✅ NEW: Has recordGame prop and passes it to useGameLogic

import React, { Suspense, lazy } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

const Character3D = lazy(() => import('./Story-quest/Character3D'));
const LibraryScene = lazy(() => import('./Story-quest/LibraryScene'));
const SceneErrorBoundary = lazy(() => import('./Story-quest/SceneErrorBoundary'));

import GameUI from './Story-quest/GameUI';
import { useGameLogic } from './Story-quest/useGameLogic';
import allScenes from './Story-quest/storyScenes';

// ===== MUTED GAME UI PALETTE =====
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
  gold: '#d4af37',
  danger: '#DB7A64',
};

const FONT_DISPLAY = "'Fredoka', sans-serif";
const FONT_BODY = "'Nunito', sans-serif";

// ===== LOADING COMPONENT =====
const ThreeDLoading = () => (
  <div style={{ width: '100vw', height: '100vh', background: palette.deepNavy, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
    <div style={{ width: '48px', height: '48px', border: `3px solid ${palette.warmOrange}40`, borderTop: `3px solid ${palette.warmOrange}`, borderRadius: '50%', animation: 'spin3d 0.8s linear infinite' }} />
    <span style={{ color: palette.bodyTextSoft, fontSize: '14px', fontWeight: '700', fontFamily: FONT_BODY }}>Loading 3D World...</span>
    <style>{`@keyframes spin3d { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
  </div>
);

// ============================================================
// ✅ UPDATED: Has recordGame prop, passed to useGameLogic
// ============================================================
const ShortStoryGame = ({ onBack, updateProgress, recordGame }) => {
  const game = useGameLogic({ onBack, updateProgress, recordGame });

  // ===== INTRO SCREEN =====
  if (game.gameState === 'intro') {
    return (
      <div style={{ minHeight: '100vh', background: palette.deepNavy, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: FONT_BODY }}>
        <div style={{ maxWidth: '520px', width: '100%', background: palette.white, borderRadius: '24px', padding: '36px 30px', border: `1.5px solid ${palette.border}`, textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.35)' }}>
          {game.currentUser && (
            <div style={{ background: palette.creamSoft, padding: '6px 14px', borderRadius: '10px', marginBottom: '16px', display: 'inline-block', border: `1px solid ${palette.border}` }}>
              <span style={{ fontSize: '12px', color: palette.bodyText, fontWeight: '700', fontFamily: FONT_BODY }}>👤 {game.currentUser.displayName || game.currentUser.email || 'Player'}</span>
            </div>
          )}
          <div style={{ width: '100px', height: '100px', margin: '0 auto 16px', borderRadius: '50%', background: `linear-gradient(135deg, ${palette.warmOrange} 0%, ${palette.coral} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', boxShadow: `0 10px 30px ${palette.warmOrange}50` }}>📚</div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: palette.deepNavy, marginBottom: '4px', fontFamily: FONT_DISPLAY, letterSpacing: '-0.5px' }}>Story Quest</h1>
          <p style={{ fontSize: '15px', color: palette.bodyText, marginBottom: '4px', fontFamily: FONT_BODY, fontWeight: 600 }}>The Dictionary of Power</p>
          <p style={{ fontSize: '13px', color: palette.bodyTextSoft, marginBottom: '24px', fontFamily: FONT_BODY, fontWeight: 600 }}>📖 21 Vocabulary Words • 🎙️ Voice Narration • ⏱️ 15s Timer</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px', padding: '8px 16px', background: palette.creamSoft, borderRadius: '12px', border: `1.5px solid ${palette.border}` }}>
            <span style={{ fontSize: '11px', color: palette.bodyText, fontFamily: FONT_BODY, fontWeight: 700 }}>❤️ {game.lives}/{game.maxLives}</span>
            {game.timeRemaining && game.lives < game.maxLives && (<span style={{ fontSize: '11px', color: palette.warmOrange, fontFamily: FONT_BODY, fontWeight: 700 }}>⏳ {game.timeRemaining}</span>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '24px' }}>
            <div style={{ background: palette.creamSoft, padding: '14px', borderRadius: '12px', border: `1.5px solid ${palette.border}` }}><div style={{ fontSize: '24px', fontWeight: '700', color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>🧙</div><div style={{ fontSize: '11px', color: palette.bodyTextSoft, fontFamily: FONT_BODY, fontWeight: 700 }}>3D Character</div></div>
            <div style={{ background: palette.creamSoft, padding: '14px', borderRadius: '12px', border: `1.5px solid ${palette.border}` }}><div style={{ fontSize: '24px', fontWeight: '700', color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>📖</div><div style={{ fontSize: '11px', color: palette.bodyTextSoft, fontFamily: FONT_BODY, fontWeight: 700 }}>{allScenes.length} Words</div></div>
            <div style={{ background: palette.creamSoft, padding: '14px', borderRadius: '12px', border: `1.5px solid ${palette.border}` }}><div style={{ fontSize: '24px', fontWeight: '700', color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>⏱️</div><div style={{ fontSize: '11px', color: palette.bodyTextSoft, fontFamily: FONT_BODY, fontWeight: 700 }}>15s Timer</div></div>
          </div>
          {game.lives > 0 ? (
            <button onClick={game.startGame} style={{ width: '100%', padding: '14px', background: palette.warmOrange, color: 'white', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', fontFamily: FONT_DISPLAY, boxShadow: `0 3px 0 ${palette.warmOrangeShadow}`, textTransform: 'uppercase', letterSpacing: '0.05em' }}>🚀 Begin Vocabulary Adventure</button>
          ) : (
            <div style={{ width: '100%', padding: '14px', background: palette.creamSoft, color: palette.bodyTextSoft, border: `1.5px solid ${palette.border}`, borderRadius: '14px', fontSize: '14px', fontWeight: '800', fontFamily: FONT_DISPLAY }}>⏳ No Lives - Come back in {game.timeRemaining || '30 minutes'}</div>
          )}
          <button onClick={() => { game.stopSpeaking(); if (onBack) onBack(); }} style={{ width: '100%', padding: '12px', marginTop: '8px', background: 'transparent', color: palette.bodyTextSoft, border: `1.5px solid ${palette.border}`, borderRadius: '14px', cursor: 'pointer', fontSize: '13px', fontWeight: '800', fontFamily: FONT_DISPLAY }}>← Back</button>
        </div>
      </div>
    );
  }

  // ===== LOADING =====
  if (game.gameState === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: palette.deepNavy, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: FONT_BODY }}>
        <div style={{ maxWidth: '420px', width: '100%', background: palette.white, borderRadius: '24px', padding: '36px', border: `1.5px solid ${palette.border}`, textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.35)' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: '800', color: palette.warmOrange, margin: 0, letterSpacing: '0.5px', fontFamily: FONT_DISPLAY }}>Loading...</h2>
          </div>
          <div style={{ display: 'flex', gap: '4px', padding: '6px', border: `2px solid ${palette.warmOrange}`, borderRadius: '999px', background: palette.creamSoft }}>
            {[...Array(14)].map((_, i) => (
              <div key={i} style={{ flex: 1, height: '16px', borderRadius: '4px', background: palette.warmOrange, opacity: 0.2, animation: `segmentFill 1.4s ease-in-out ${i * 0.08}s infinite` }} />
            ))}
          </div>
          <p style={{ fontSize: '12px', color: palette.bodyTextSoft, marginTop: '18px', fontStyle: 'italic', fontFamily: FONT_BODY, fontWeight: 600 }}>Preparing your Story Quest adventure...</p>
        </div>
        <style>{`@keyframes segmentFill { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }`}</style>
      </div>
    );
  }

  // ===== GAME OVER =====
  if (game.gameState === 'gameover') {
    const accuracy = game.totalAnswers > 0 ? Math.round((game.correctAnswers / game.totalAnswers) * 100) : 0;
    return (
      <div style={{ minHeight: '100vh', background: palette.deepNavy, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: FONT_BODY }}>
        <div style={{ maxWidth: '420px', width: '100%', background: palette.white, borderRadius: '24px', padding: '36px', border: `1.5px solid ${palette.border}`, textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.35)' }}>
          <div style={{ fontSize: '64px', marginBottom: '8px' }}>💀</div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: palette.deepNavy, marginBottom: '4px', fontFamily: FONT_DISPLAY }}>Game Over!</h2>
          <p style={{ fontSize: '14px', color: palette.bodyTextSoft, marginBottom: '20px', fontFamily: FONT_BODY, fontWeight: 600 }}>
            You reached <strong style={{ color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>Scene {game.currentScene + 1}</strong> with <strong style={{ color: palette.softGreen, fontFamily: FONT_DISPLAY }}>{game.correctAnswers}</strong> correct answers!
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '24px' }}>
            <div style={{ background: palette.creamSoft, padding: '14px', borderRadius: '12px', border: `1.5px solid ${palette.border}` }}><div style={{ fontSize: '22px', fontWeight: '800', color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>{game.correctAnswers}</div><div style={{ fontSize: '10px', color: palette.bodyTextSoft, fontFamily: FONT_BODY, fontWeight: 700 }}>Correct</div></div>
            <div style={{ background: palette.creamSoft, padding: '14px', borderRadius: '12px', border: `1.5px solid ${palette.border}` }}><div style={{ fontSize: '22px', fontWeight: '800', color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>{game.currentScene + 1}</div><div style={{ fontSize: '10px', color: palette.bodyTextSoft, fontFamily: FONT_BODY, fontWeight: 700 }}>Scenes</div></div>
            <div style={{ background: palette.creamSoft, padding: '14px', borderRadius: '12px', border: `1.5px solid ${palette.border}` }}><div style={{ fontSize: '22px', fontWeight: '800', color: palette.gold, fontFamily: FONT_DISPLAY }}>{accuracy}%</div><div style={{ fontSize: '10px', color: palette.bodyTextSoft, fontFamily: FONT_BODY, fontWeight: 700 }}>Accuracy</div></div>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
            <button onClick={game.startGame} disabled={game.lives <= 0} style={{ padding: '14px', background: game.lives > 0 ? palette.warmOrange : palette.creamSoft, color: game.lives > 0 ? 'white' : palette.bodyTextSoft, border: game.lives > 0 ? 'none' : `1.5px solid ${palette.border}`, borderRadius: '14px', fontSize: '14px', fontWeight: '800', cursor: game.lives > 0 ? 'pointer' : 'not-allowed', fontFamily: FONT_DISPLAY, boxShadow: game.lives > 0 ? `0 3px 0 ${palette.warmOrangeShadow}` : 'none', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {game.lives > 0 ? '🔄 Play Again' : '⏳ No Lives - Wait 30 mins'}
            </button>
            <button onClick={game.restartGame} style={{ padding: '12px', background: palette.creamSoft, color: palette.deepNavy, border: `1.5px solid ${palette.border}`, borderRadius: '14px', cursor: 'pointer', fontSize: '13px', fontWeight: '800', fontFamily: FONT_DISPLAY }}>← Back to Menu</button>
            <button onClick={() => { game.stopSpeaking(); if (onBack) onBack(); }} style={{ padding: '12px', background: 'transparent', color: palette.bodyTextSoft, border: `1.5px solid ${palette.border}`, borderRadius: '14px', cursor: 'pointer', fontSize: '13px', fontWeight: '800', fontFamily: FONT_DISPLAY }}>← Exit Game</button>
          </div>
        </div>
      </div>
    );
  }

  // ===== PLAYING =====
  if (game.gameState === 'playing') {
    const scene = allScenes[game.currentScene] || allScenes[0];
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', background: palette.deepNavy, fontFamily: FONT_BODY, overflow: 'hidden' }}>
        {game.showExitConfirm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(42,40,69,0.75)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
            <div style={{ background: palette.white, borderRadius: '18px', padding: '32px', maxWidth: '380px', width: '100%', textAlign: 'center', border: `1.5px solid ${palette.border}` }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🚪</div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: palette.deepNavy, marginBottom: '8px', fontFamily: FONT_DISPLAY }}>Exit StoryQuest?</h3>
              <p style={{ fontSize: '14px', color: palette.bodyTextSoft, marginBottom: '24px', fontFamily: FONT_BODY, fontWeight: 600 }}>Your progress will be saved.</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={game.confirmExit} style={{ flex: 1, padding: '12px', background: palette.danger, color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '13px', fontWeight: '800', fontFamily: FONT_DISPLAY }}>✅ Yes, Exit</button>
                <button onClick={game.cancelExit} style={{ flex: 1, padding: '12px', background: palette.creamSoft, color: palette.deepNavy, border: `1.5px solid ${palette.border}`, borderRadius: '12px', cursor: 'pointer', fontSize: '13px', fontWeight: '800', fontFamily: FONT_DISPLAY }}>❌ Cancel</button>
              </div>
            </div>
          </div>
        )}

        <Suspense fallback={<ThreeDLoading />}>
          <SceneErrorBoundary>
            <Canvas camera={{ position: [4, 3, 6], fov: 45 }} dpr={[1, 1]} style={{ width: '100vw', height: '100vh', background: palette.deepNavy, display: 'block' }}>
              <LibraryScene />
              <Character3D emotion={scene.emotion || 'happy'} isWalking={game.currentScene % 2 === 0} isSpeaking={game.isSpeaking} />
              <OrbitControls enablePan={true} enableZoom={true} minDistance={2} maxDistance={15} maxPolarAngle={Math.PI / 1.8} target={[0, 0.8, 0]} dampingFactor={0.05} />
            </Canvas>
          </SceneErrorBoundary>
        </Suspense>

        <GameUI
          scene={scene} currentScene={game.currentScene} allScenes={allScenes}
          score={game.score} lives={game.lives} maxLives={game.maxLives}
          timer={game.timer} isSpeaking={game.isSpeaking} displayText={game.displayText}
          isTyping={game.isTyping} selectedChoice={game.selectedChoice}
          feedbackType={game.feedbackType} feedbackMessage={game.feedbackMessage}
          showFeedback={game.showFeedback} handleChoice={game.handleChoice}
          handleExit={game.handleExit}
        />
      </div>
    );
  }

  return null;
};

export default ShortStoryGame;