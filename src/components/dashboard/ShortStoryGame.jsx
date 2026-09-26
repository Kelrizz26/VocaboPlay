import React, { Suspense, lazy } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

// ===== LAZY LOAD 3D COMPONENTS =====
const Character3D = lazy(() => import('./story-quest/Character3D'));
const LibraryScene = lazy(() => import('./story-quest/LibraryScene'));
const SceneErrorBoundary = lazy(() => import('./story-quest/SceneErrorBoundary'));

import GameUI from './story-quest/GameUI';
import { useGameLogic } from './story-quest/useGameLogic';
import allScenes from './story-quest/storyScenes';

// ===== LOADING COMPONENT =====
const ThreeDLoading = () => (
  <div style={{
    width: '100vw',
    height: '100vh',
    background: 'radial-gradient(circle at 50% 30%, #2d1b4e 0%, #0a0a1a 70%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '16px'
  }}>
    <div style={{
      width: '48px',
      height: '48px',
      border: '3px solid rgba(92, 106, 196, 0.2)',
      borderTop: '3px solid #5C6AC4',
      borderRadius: '50%',
      animation: 'spin3d 0.8s linear infinite'
    }} />
    <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500' }}>
      Loading 3D World...
    </span>
    <style>{`
      @keyframes spin3d {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

const ShortStoryGame = ({ onBack, updateProgress }) => {
  const game = useGameLogic({ onBack, updateProgress });

  // ===== INTRO SCREEN =====
  if (game.gameState === 'intro') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'radial-gradient(circle at 50% 30%, #2d1b4e 0%, #0a0a1a 70%)',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '20px',
        fontFamily: "'Poppins', -apple-system, sans-serif"
      }}>
        <div style={{ 
          maxWidth: '520px', 
          width: '100%', 
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)', 
          borderRadius: '24px', 
          padding: '40px',
          border: '1px solid rgba(255,255,255,0.06)', 
          textAlign: 'center'
        }}>
          {game.currentUser && (
            <div style={{ 
              background: 'rgba(92, 106, 196, 0.12)',
              padding: '8px 16px',
              borderRadius: '12px',
              marginBottom: '16px',
              display: 'inline-block'
            }}>
              <span style={{ fontSize: '13px', color: '#5C6AC4', fontWeight: '600' }}>
                👤 {game.currentUser.displayName || game.currentUser.email || 'Player'}
              </span>
            </div>
          )}
          <div style={{ 
            width: '120px', height: '120px', margin: '0 auto 16px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #5C6AC4, #5C6AC4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '56px',
            animation: 'float 3s ease-in-out infinite'
          }}>📚</div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'white', marginBottom: '4px' }}>Story Quest</h1>
          <p style={{ fontSize: '16px', color: '#94a3b8', marginBottom: '4px' }}>The Dictionary of Power</p>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>📖 21 Vocabulary Words • 🎙️ Voice Narration • ⏱️ 15s Timer</p>

          <div style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
            marginBottom: '16px', padding: '8px 16px',
            background: 'rgba(255,255,255,0.04)', borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>❤️ {game.lives}/{game.maxLives}</span>
            {game.timeRemaining && game.lives < game.maxLives && (
              <span style={{ fontSize: '11px', color: '#f59e0b' }}>⏳ {game.timeRemaining}</span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '24px' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '12px' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#5C6AC4' }}>🧙</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>3D Character</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '12px' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#5C6AC4' }}>📖</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>{allScenes.length} Words</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '12px' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#5C6AC4' }}>⏱️</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>15s Timer</div>
            </div>
          </div>

          {game.lives > 0 ? (
            <button 
              onClick={game.startGame} 
              style={{ 
                width: '100%', padding: '16px',
                background: 'linear-gradient(135deg, #5C6AC4, #5C6AC4)',
                color: 'white', border: 'none', borderRadius: '14px',
                fontSize: '16px', fontWeight: '600', cursor: 'pointer'
              }}
            >
              🚀 Begin Vocabulary Adventure
            </button>
          ) : (
            <div style={{ 
              width: '100%', padding: '16px',
              background: 'rgba(255,255,255,0.04)',
              color: '#94a3b8', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '14px', fontSize: '16px', fontWeight: '600'
            }}>
              ⏳ No Lives - Come back in {game.timeRemaining || '30 minutes'}
            </div>
          )}
          <button 
            onClick={() => { game.stopSpeaking(); if (onBack) onBack(); }} 
            style={{ 
              width: '100%', padding: '12px', marginTop: '8px',
              background: 'transparent', color: '#94a3b8',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '14px', cursor: 'pointer', fontSize: '14px'
            }}
          >
            ← Back
          </button>
        </div>
        <style>{`@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }`}</style>
      </div>
    );
  }

  // ===== LOADING SCREEN =====
  if (game.gameState === 'loading') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'radial-gradient(circle at 50% 30%, #2d1b4e 0%, #0a0a1a 70%)',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '20px',
        fontFamily: "'Poppins', -apple-system, sans-serif"
      }}>
        <div style={{ 
          maxWidth: '420px', 
          width: '100%', 
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)', 
          borderRadius: '24px', 
          padding: '40px',
          border: '1px solid rgba(255,255,255,0.06)', 
          textAlign: 'center'
        }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '24px' }}>
            <span style={{ 
              position: 'absolute', left: '-26px', top: '2px',
              color: '#FDE047', fontSize: '16px',
              animation: 'sparkleTwinkle 1.6s ease-in-out infinite'
            }}>✦</span>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#A78BFA', margin: 0, letterSpacing: '0.5px' }}>
              Loading...
            </h2>
            <span style={{ 
              position: 'absolute', right: '-26px', top: '-6px',
              color: '#FDE047', fontSize: '14px',
              animation: 'sparkleTwinkle 1.6s ease-in-out 0.6s infinite'
            }}>✦</span>
          </div>
          <div style={{ 
            display: 'flex', gap: '4px', padding: '6px',
            border: '2px solid #A78BFA', borderRadius: '999px',
            background: 'rgba(0,0,0,0.35)'
          }}>
            {[...Array(14)].map((_, i) => (
              <div key={i} style={{ 
                flex: 1, height: '18px', borderRadius: '4px',
                background: '#A78BFA',
                opacity: 0.2,
                animation: `segmentFill 1.4s ease-in-out ${i * 0.08}s infinite`
              }} />
            ))}
          </div>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '18px', fontStyle: 'italic' }}>
            Preparing your Story Quest adventure...
          </p>
        </div>
        <style>{`
          @keyframes sparkleTwinkle { 0%, 100% { opacity: 0.2; transform: scale(0.8) rotate(0deg); } 50% { opacity: 1; transform: scale(1.3) rotate(20deg); } }
          @keyframes segmentFill { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }
        `}</style>
      </div>
    );
  }

  // ===== GAME OVER =====
  if (game.gameState === 'gameover') {
    const accuracy = game.totalAnswers > 0 ? Math.round((game.correctAnswers / game.totalAnswers) * 100) : 0;
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'radial-gradient(circle at 50% 30%, #2d1b4e 0%, #0a0a1a 70%)',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '20px',
        fontFamily: "'Poppins', -apple-system, sans-serif"
      }}>
        <div style={{ 
          maxWidth: '420px', 
          width: '100%', 
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)', 
          borderRadius: '24px', 
          padding: '40px',
          border: '1px solid rgba(255,255,255,0.06)', 
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '8px' }}>💀</div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>Game Over!</h2>
          <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '20px' }}>
            You reached <strong style={{ color: '#fbbf24' }}>Scene {game.currentScene + 1}</strong> with <strong style={{ color: '#5C6AC4' }}>{game.correctAnswers}</strong> correct answers!
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '24px' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '12px' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#5C6AC4' }}>{game.correctAnswers}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Correct</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '12px' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#5C6AC4' }}>{game.currentScene + 1}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Scenes</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '12px' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#fbbf24' }}>{accuracy}%</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Accuracy</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
            <button onClick={game.startGame} disabled={game.lives <= 0} style={{ 
              padding: '14px', 
              background: game.lives > 0 ? 'linear-gradient(135deg, #5C6AC4, #5C6AC4)' : '#4a4a5a', 
              color: game.lives > 0 ? 'white' : '#94a3b8', 
              border: 'none', borderRadius: '14px', 
              fontSize: '16px', fontWeight: '600', 
              cursor: game.lives > 0 ? 'pointer' : 'not-allowed' 
            }}>
              {game.lives > 0 ? '🔄 Play Again' : '⏳ No Lives - Wait 30 mins'}
            </button>
            <button onClick={game.restartGame} style={{ 
              padding: '12px', background: 'transparent', 
              color: '#94a3b8', border: '1px solid rgba(255,255,255,0.06)', 
              borderRadius: '14px', cursor: 'pointer', fontSize: '14px' 
            }}>
              ← Back to Menu
            </button>
            <button onClick={() => { game.stopSpeaking(); if (onBack) onBack(); }} style={{ 
              padding: '12px', background: 'transparent', 
              color: '#64748b', border: '1px solid rgba(255,255,255,0.04)', 
              borderRadius: '14px', cursor: 'pointer', fontSize: '14px' 
            }}>
              ← Exit Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== PLAYING SCREEN =====
  if (game.gameState === 'playing') {
    const scene = allScenes[game.currentScene] || allScenes[0];

    return (
      <div style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        width: '100vw', height: '100vh',
        background: 'radial-gradient(circle at 50% 30%, #2d1b4e 0%, #0a0a1a 70%)',
        fontFamily: "'Poppins', -apple-system, sans-serif",
        overflow: 'hidden'
      }}>
        {game.showExitConfirm && (
          <div style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2000, padding: '20px'
          }}>
            <div style={{ 
              background: 'white', borderRadius: '8px', padding: '32px',
              maxWidth: '380px', width: '100%', textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🚪</div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>Exit StoryQuest?</h3>
              <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px' }}>Your progress will be saved.</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={game.confirmExit} style={{ flex: 1, padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>✅ Yes, Exit</button>
                <button onClick={game.cancelExit} style={{ flex: 1, padding: '12px', background: '#F8FAFC', color: '#64748B', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>❌ Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* ===== 3D SCENE with Suspense ===== */}
        <Suspense fallback={<ThreeDLoading />}>
          <SceneErrorBoundary>
            <Canvas 
              camera={{ position: [4, 3, 6], fov: 45 }} 
              dpr={[1, 1]} 
              style={{ 
                width: '100vw', 
                height: '100vh', 
                background: 'radial-gradient(circle at 50% 30%, #2d1b4e 0%, #0a0a1a 70%)',
                display: 'block' 
              }}
            >
              <LibraryScene />
              <Character3D 
                emotion={scene.emotion || 'happy'} 
                isWalking={game.currentScene % 2 === 0} 
                isSpeaking={game.isSpeaking} 
              />
              <OrbitControls 
                enablePan={true} 
                enableZoom={true} 
                minDistance={2} 
                maxDistance={15} 
                maxPolarAngle={Math.PI / 1.8} 
                target={[0, 0.8, 0]} 
                dampingFactor={0.05} 
              />
            </Canvas>
          </SceneErrorBoundary>
        </Suspense>

        {/* UI OVERLAY */}
        <GameUI
          scene={scene}
          currentScene={game.currentScene}
          allScenes={allScenes}
          score={game.score}
          lives={game.lives}
          maxLives={game.maxLives}
          timer={game.timer}
          isSpeaking={game.isSpeaking}
          displayText={game.displayText}
          isTyping={game.isTyping}
          selectedChoice={game.selectedChoice}
          feedbackType={game.feedbackType}
          feedbackMessage={game.feedbackMessage}
          showFeedback={game.showFeedback}
          handleChoice={game.handleChoice}
          handleExit={game.handleExit}
        />
      </div>
    );
  }

  return null;
};

export default ShortStoryGame;