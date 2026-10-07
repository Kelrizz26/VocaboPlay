// src/components/dashboard/ShortStoryGame.jsx
// ✅ Clean layout — walang Queen Elara sa gilid
// ✅ Book selection screen first (library catalog)
// ✅ Image-based quiz focused
// ✅ UPDATED: Points + Clickable Hearts (HeartShopModal sa intro state)
// ✅ UPDATED: Level Complete screen with diamond rewards
// ✅ UPDATED: Welcome modal shows on Dashboard entry, hides when returning from level
// ✅ NEW: Dev Panel integration (?dev=1)

import React from 'react';
import GameUI from './Story-quest/GameUI';
import { useGameLogic } from './Story-quest/useGameLogic';
import StoryQuestBookSelect from './Story-quest/StoryQuestBookSelect';
import StoryQuestDevPanel from './Story-quest/StoryQuestDevPanel';

const palette = {
  warmOrange: '#E9A075', warmOrangeShadow: '#C27E4F',
  coral: '#DB7A64', coralShadow: '#A95845',
  teal: '#4F9188',
  deepNavy: '#2A2845', deepNavyLight: '#3A3757',
  bodyText: '#6B6880', bodyTextSoft: '#8A8799',
  cream: '#FDF9F3', creamSoft: '#F5EFE6', white: '#FFFFFF',
  border: '#EBE2D5', borderSoft: '#F2EBE0',
  softGreen: '#7FA574', gold: '#d4af37',
  diamond: '#5DADE2', diamondShadow: '#3D8BBF',
  danger: '#DB7A64', dangerShadow: '#A95845',
  purple: '#7C3AED',
  purpleDeep: '#5B21B6',
};

const FONT_DISPLAY = "'Fredoka', sans-serif";
const FONT_BODY = "'Nunito', sans-serif";

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const LEVEL_CONFIG = {
  'A1': { timer: 15, emoji: '🟢' },
  'A2': { timer: 15, emoji: '🟢' },
  'B1': { timer: 15, emoji: '🟡' },
  'B2': { timer: 15, emoji: '🟡' },
  'C1': { timer: 15, emoji: '🟠' },
  'C2': { timer: 15, emoji: '👑' },
};

const ShortStoryGame = ({ onBack, updateProgress, recordGame }) => {
  const game = useGameLogic({ onBack, updateProgress, recordGame });
  const [hasSeenWelcome, setHasSeenWelcome] = React.useState(false);

  const showDevPanel = typeof window !== 'undefined' && window.location.search.includes('dev=1');

  const getDevPanelProps = () => ({
    gameState: game.gameState,
    currentLevel: game.currentLevel,
    currentScene: game.currentScene,
    totalScenes: game.scenes.length,
    lives: game.lives,
    maxLives: game.maxLives,
    localDiamonds: game.localDiamonds,
    localPoints: game.localPoints,
    completedLevels: game.completedLevels || [],
    onJumpToLevel: game.devJumpToLevel,
    onForceLevelComplete: game.devForceLevelComplete,
    onForceGameOver: game.devForceGameOver,
    onForceFinished: game.devForceFinished,
    onSkipToLastScene: game.devSkipToLastScene,
    onSetLives: game.devSetLives,
    onAddDiamonds: game.devAddDiamonds,
    onAddPoints: game.devAddPoints,
    onResetAll: game.devResetAll,
    onReturnToMap: game.devReturnToMap,
  });

  // ===== HEART SHOP =====
  const HeartShopModal = () => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(42, 40, 69, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '20px' }}>
      <div style={{ background: palette.white, borderRadius: '20px', padding: '28px 24px', maxWidth: '460px', width: '100%', border: `1.5px solid ${palette.border}`, boxShadow: '0 20px 50px rgba(42, 40, 69, 0.4)' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '4px' }}>❤️</div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: palette.deepNavy, marginBottom: '4px', fontFamily: FONT_DISPLAY }}>
            {game.continueFromGameOver ? 'Continue Playing?' : 'Refill Hearts'}
          </h2>
          <p style={{ fontSize: '13px', color: palette.bodyTextSoft, fontWeight: 600, fontFamily: FONT_BODY }}>Buy hearts with diamonds</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
          <div style={{ background: `linear-gradient(135deg, ${palette.diamond}20, ${palette.diamond}10)`, padding: '10px 20px', borderRadius: '12px', border: `1.5px solid ${palette.diamond}60`, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>💎</span>
            <span style={{ fontSize: '18px', fontWeight: '800', color: palette.diamond, fontFamily: FONT_DISPLAY }}>{game.localDiamonds}</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          {game.HEART_PRICES.map((pkg) => {
            const canAfford = game.localDiamonds >= pkg.diamonds;
            return (
              <button key={pkg.id} onClick={() => game.handleBuyHearts(pkg)} disabled={!canAfford || game.heartShopProcessing}
                style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '14px', border: `2px solid ${pkg.popular ? palette.warmOrange : canAfford ? palette.border : `${palette.danger}40`}`, background: pkg.popular ? `linear-gradient(135deg, ${palette.warmOrange}10, ${palette.coral}10)` : canAfford ? palette.creamSoft : `${palette.danger}08`, cursor: canAfford && !game.heartShopProcessing ? 'pointer' : 'not-allowed', opacity: game.heartShopProcessing ? 0.5 : 1, fontFamily: FONT_DISPLAY }}>
                {pkg.popular && (<div style={{ position: 'absolute', top: '-8px', right: '12px', background: palette.warmOrange, color: 'white', fontSize: '9px', fontWeight: '800', padding: '2px 8px', borderRadius: '6px' }}>POPULAR</div>)}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '28px' }}>❤️</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: palette.deepNavy }}>{pkg.label}</div>
                    <div style={{ fontSize: '10px', color: palette.bodyTextSoft, fontWeight: 600 }}>{pkg.sublabel}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: canAfford ? `${palette.diamond}20` : `${palette.danger}15`, borderRadius: '10px', border: `1px solid ${canAfford ? `${palette.diamond}50` : `${palette.danger}40`}` }}>
                  <span style={{ fontSize: '14px' }}>💎</span>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: canAfford ? palette.diamond : palette.danger, fontFamily: FONT_DISPLAY }}>{pkg.diamonds}</span>
                </div>
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={game.closeHeartShop} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: `1.5px solid ${palette.border}`, background: palette.creamSoft, color: palette.bodyText, cursor: 'pointer', fontSize: '13px', fontWeight: '800', fontFamily: FONT_DISPLAY }}>Cancel</button>
          {game.continueFromGameOver && (
            <button onClick={game.giveUpGame} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: palette.danger, color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '800', fontFamily: FONT_DISPLAY, boxShadow: `0 3px 0 ${palette.dangerShadow}` }}>Give Up</button>
          )}
        </div>
      </div>
    </div>
  );

  // ===== BOOK SELECT =====
  if (game.gameState === 'intro') {
    return (
      <>
        <StoryQuestBookSelect
          onSelectBook={(level) => game.startGame(level)}
          onBack={onBack}
          completedLevels={game.completedLevels || []}
          localDiamonds={game.localDiamonds}
          localPoints={game.localPoints || 0}
          lives={game.lives}
          maxLives={game.maxLives}
          timeRemaining={game.timeRemaining}
          onOpenHeartShop={game.openHeartShopFromMap}
          skipWelcome={hasSeenWelcome}
          onWelcomeShown={() => setHasSeenWelcome(true)}
        />
        {game.showHeartShop && <HeartShopModal />}
        {showDevPanel && <StoryQuestDevPanel {...getDevPanelProps()} />}
      </>
    );
  }

  // ===== LOADING =====
  if (game.gameState === 'loading') {
    return (
      <>
        <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${palette.purple}, ${palette.purpleDeep})`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: FONT_BODY }}>
          <div style={{ maxWidth: '420px', width: '100%', background: palette.white, borderRadius: '24px', padding: '36px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '26px', fontWeight: '800', color: palette.purple, margin: 0, fontFamily: FONT_DISPLAY }}>Loading...</h2>
            <div style={{ display: 'flex', gap: '4px', padding: '6px', border: `2px solid ${palette.purple}`, borderRadius: '999px', background: palette.creamSoft, marginTop: '20px' }}>
              {[...Array(14)].map((_, i) => (
                <div key={i} style={{ flex: 1, height: '16px', borderRadius: '4px', background: palette.purple, opacity: 0.2, animation: `segmentFill 1.4s ease-in-out ${i * 0.08}s infinite` }} />
              ))}
            </div>
            <p style={{ fontSize: '12px', color: palette.bodyTextSoft, marginTop: '18px', fontStyle: 'italic', fontWeight: 600 }}>Opening the book...</p>
          </div>
          <style>{`@keyframes segmentFill { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }`}</style>
        </div>
        {showDevPanel && <StoryQuestDevPanel {...getDevPanelProps()} />}
      </>
    );
  }

  // ===== LEVEL COMPLETE =====
  if (game.gameState === 'levelcomplete' && game.levelCompleteData) {
    const data = game.levelCompleteData;

    return (
      <>
        <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${palette.purple}, ${palette.purpleDeep})`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: FONT_BODY }}>
          <div style={{ maxWidth: '480px', width: '100%', background: palette.white, borderRadius: '28px', padding: '36px 32px', textAlign: 'center', boxShadow: '0 30px 80px rgba(0,0,0,0.4)', border: `3px solid ${palette.purple}` }}>
            <div style={{ fontSize: '72px', marginBottom: '8px' }}>🎉</div>
            <h2 style={{ fontSize: '30px', fontWeight: '900', color: palette.purple, fontFamily: FONT_DISPLAY, marginBottom: '6px' }}>
              Level Complete!
            </h2>
            <p style={{ fontSize: '14px', color: palette.bodyTextSoft, fontWeight: 700, marginBottom: '20px' }}>
              You finished <strong style={{ color: palette.purple, fontFamily: FONT_DISPLAY }}>{data.level}</strong>!
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
              <div style={{ padding: '14px', background: palette.creamSoft, borderRadius: '12px', border: `1.5px solid ${palette.border}` }}>
                <div style={{ fontSize: '22px', fontWeight: '900', color: palette.purple, fontFamily: FONT_DISPLAY }}>{data.score}</div>
                <div style={{ fontSize: '10px', color: palette.bodyTextSoft, fontWeight: 800, marginTop: '2px' }}>SCORE</div>
              </div>
              <div style={{ padding: '14px', background: palette.creamSoft, borderRadius: '12px', border: `1.5px solid ${palette.border}` }}>
                <div style={{ fontSize: '22px', fontWeight: '900', color: data.accuracy >= 80 ? palette.softGreen : data.accuracy >= 50 ? palette.gold : palette.danger, fontFamily: FONT_DISPLAY }}>{data.accuracy}%</div>
                <div style={{ fontSize: '10px', color: palette.bodyTextSoft, fontWeight: 800, marginTop: '2px' }}>ACCURACY</div>
              </div>
              <div style={{ padding: '14px', background: palette.creamSoft, borderRadius: '12px', border: `1.5px solid ${palette.border}` }}>
                <div style={{ fontSize: '22px', fontWeight: '900', color: palette.gold, fontFamily: FONT_DISPLAY }}>{data.correctAnswers}/{data.totalAnswers}</div>
                <div style={{ fontSize: '10px', color: palette.bodyTextSoft, fontWeight: 800, marginTop: '2px' }}>CORRECT</div>
              </div>
            </div>

            {!data.alreadyClaimedToday && data.diamondsEarned > 0 && (
              <div style={{
                padding: '16px',
                background: `linear-gradient(135deg, ${palette.diamond}20, ${palette.diamond}08)`,
                borderRadius: '14px',
                marginBottom: '16px',
                border: `2px solid ${palette.diamond}`,
                boxShadow: `0 4px 0 ${palette.diamondShadow}, 0 0 30px ${palette.diamond}40`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '32px' }}>💎</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '13px', fontWeight: '900', color: palette.diamondShadow, fontFamily: FONT_DISPLAY, letterSpacing: '0.5px' }}>
                      DIAMOND REWARD!
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: palette.diamond, fontFamily: FONT_DISPLAY }}>
                      +{data.diamondsEarned} 💎
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: palette.bodyTextSoft, fontWeight: 700 }}>
                  Base: {data.baseReward} 💎 × {data.accuracy}% accuracy
                </div>
              </div>
            )}

            {data.alreadyClaimedToday && (
              <div style={{
                padding: '14px',
                background: palette.creamSoft,
                borderRadius: '12px',
                marginBottom: '16px',
                border: `1.5px dashed ${palette.border}`,
              }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: palette.bodyTextSoft, fontFamily: FONT_DISPLAY, marginBottom: '4px' }}>
                  ⏰ Daily Reward Already Claimed
                </div>
                <div style={{ fontSize: '11px', color: palette.bodyTextSoft, fontWeight: 600 }}>
                  Come back tomorrow for a new diamond reward!
                </div>
                {data.potentialDiamonds > 0 && (
                  <div style={{ fontSize: '10px', color: palette.diamond, fontWeight: 700, marginTop: '6px' }}>
                    (Today's potential: {data.potentialDiamonds} 💎)
                  </div>
                )}
              </div>
            )}

            {!data.isLastLevel && data.nextLevel && (
              <div style={{
                padding: '12px 14px',
                background: `linear-gradient(90deg, ${palette.purple}15, ${palette.coral}15)`,
                borderRadius: '12px',
                marginBottom: '16px',
                border: `1.5px solid ${palette.purple}30`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}>
                <span style={{ fontSize: '11px', color: palette.bodyText, fontWeight: 700 }}>NEXT UP:</span>
                <span style={{
                  padding: '4px 12px',
                  background: `linear-gradient(135deg, ${palette.purple}, ${palette.coral})`,
                  color: 'white',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '900',
                  fontFamily: FONT_DISPLAY,
                  boxShadow: `0 2px 0 ${palette.purpleDeep}`,
                }}>{data.nextLevel}</span>
                <span style={{ fontSize: '10px', color: palette.bodyTextSoft, fontWeight: 600 }}>
                  up to {(data.baseReward + 5)} 💎
                </span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
              {!data.isLastLevel && data.nextLevel && (
                <button
                  onClick={game.handleNextLevel}
                  style={{
                    padding: '16px',
                    background: `linear-gradient(135deg, ${palette.purple}, ${palette.coral})`,
                    color: 'white',
                    border: 'none',
                    borderRadius: '16px',
                    fontSize: '16px',
                    fontWeight: '900',
                    cursor: 'pointer',
                    boxShadow: `0 4px 0 ${palette.purpleDeep}`,
                    fontFamily: FONT_DISPLAY,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Continue to {data.nextLevel} →
                </button>
              )}
              <button
                onClick={game.handleReturnToMap}
                style={{
                  padding: '14px',
                  background: palette.creamSoft,
                  color: palette.deepNavy,
                  border: `1.5px solid ${palette.border}`,
                  borderRadius: '14px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '800',
                  fontFamily: FONT_DISPLAY,
                }}
              >
                🗺️ Back to Map
              </button>
            </div>
          </div>
        </div>
        {showDevPanel && <StoryQuestDevPanel {...getDevPanelProps()} />}
      </>
    );
  }

  // ===== FINISHED =====
  if (game.gameState === 'finished') {
    const accuracy = game.totalAnswers > 0 ? Math.round((game.correctAnswers / game.totalAnswers) * 100) : 0;
    return (
      <>
        <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${palette.purple}, ${palette.purpleDeep})`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: FONT_BODY }}>
          <div style={{ maxWidth: '520px', width: '100%', background: palette.white, borderRadius: '24px', padding: '32px 28px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.35)' }}>
            <div style={{ fontSize: '64px', marginBottom: '6px' }}>👑</div>
            <h2 style={{ fontSize: '26px', fontWeight: '800', color: palette.gold, marginBottom: '4px', fontFamily: FONT_DISPLAY }}>All Chapters Complete!</h2>
            <p style={{ fontSize: '13px', color: palette.bodyTextSoft, marginBottom: '16px', fontWeight: 600 }}>You mastered <strong style={{ color: palette.gold, fontFamily: FONT_DISPLAY }}>A1 → C2</strong>! 🎉</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
              <div style={{ padding: '12px', background: palette.creamSoft, borderRadius: '10px', border: `1.5px solid ${palette.border}` }}>
                <div style={{ fontSize: '20px', fontWeight: '800', color: palette.purple, fontFamily: FONT_DISPLAY }}>{game.score}</div>
                <div style={{ fontSize: '10px', color: palette.bodyTextSoft, fontWeight: 800 }}>SCORE</div>
              </div>
              <div style={{ padding: '12px', background: palette.creamSoft, borderRadius: '10px', border: `1.5px solid ${palette.border}` }}>
                <div style={{ fontSize: '20px', fontWeight: '800', color: palette.teal, fontFamily: FONT_DISPLAY }}>{accuracy}%</div>
                <div style={{ fontSize: '10px', color: palette.bodyTextSoft, fontWeight: 800 }}>ACCURACY</div>
              </div>
              <div style={{ padding: '12px', background: palette.creamSoft, borderRadius: '10px', border: `1.5px solid ${palette.border}` }}>
                <div style={{ fontSize: '20px', fontWeight: '800', color: palette.gold, fontFamily: FONT_DISPLAY }}>{game.totalAnswers}</div>
                <div style={{ fontSize: '10px', color: palette.bodyTextSoft, fontWeight: 800 }}>QUESTIONS</div>
              </div>
            </div>
            {game.diamondsEarnedThisGame > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: `linear-gradient(135deg, ${palette.diamond}15, ${palette.diamond}08)`, borderRadius: '12px', marginBottom: '12px', border: `1.5px solid ${palette.diamond}50` }}>
                <span style={{ fontSize: '20px' }}>💎</span>
                <span style={{ fontSize: '16px', fontWeight: '800', color: palette.diamond, fontFamily: FONT_DISPLAY }}>+{game.diamondsEarnedThisGame} diamonds</span>
              </div>
            )}
            {game.completionBonus > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '16px', background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', borderRadius: '14px', marginBottom: '16px', border: `2px solid ${palette.gold}`, boxShadow: `0 4px 0 #B45309` }}>
                <span style={{ fontSize: '32px' }}>🏆</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#78350F', fontFamily: FONT_DISPLAY }}>COMPLETION BONUS!</div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#B45309', fontFamily: FONT_DISPLAY }}>+{game.completionBonus} 💎 Diamonds</div>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: '6px', flexDirection: 'column' }}>
              <button onClick={game.restartGame} style={{ padding: '12px', background: `linear-gradient(135deg, ${palette.purple}, ${palette.coral})`, color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '800', fontFamily: FONT_DISPLAY, boxShadow: `0 3px 0 ${palette.purpleDeep}` }}>
                📚 Back to Library
              </button>
            </div>
          </div>
        </div>
        {showDevPanel && <StoryQuestDevPanel {...getDevPanelProps()} />}
      </>
    );
  }

  // ===== GAME OVER =====
  if (game.gameState === 'gameover') {
    const accuracy = game.totalAnswers > 0 ? Math.round((game.correctAnswers / game.totalAnswers) * 100) : 0;
    return (
      <>
        <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${palette.purple}, ${palette.purpleDeep})`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: FONT_BODY }}>
          <div style={{ maxWidth: '420px', width: '100%', background: palette.white, borderRadius: '24px', padding: '36px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.35)' }}>
            <div style={{ fontSize: '64px', marginBottom: '8px' }}>💀</div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: palette.deepNavy, marginBottom: '4px', fontFamily: FONT_DISPLAY }}>Game Over!</h2>
            <p style={{ fontSize: '14px', color: palette.bodyTextSoft, marginBottom: '20px', fontWeight: 600 }}>
              You reached <strong style={{ color: palette.purple }}>{game.currentLevel}</strong> with <strong style={{ color: palette.softGreen }}>{game.correctAnswers}</strong> correct!
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
              <div style={{ background: palette.creamSoft, padding: '14px', borderRadius: '12px', border: `1.5px solid ${palette.border}` }}>
                <div style={{ fontSize: '22px', fontWeight: '800', color: palette.purple, fontFamily: FONT_DISPLAY }}>{game.correctAnswers}</div>
                <div style={{ fontSize: '10px', color: palette.bodyTextSoft, fontWeight: 700 }}>Correct</div>
              </div>
              <div style={{ background: palette.creamSoft, padding: '14px', borderRadius: '12px', border: `1.5px solid ${palette.border}` }}>
                <div style={{ fontSize: '22px', fontWeight: '800', color: palette.purple, fontFamily: FONT_DISPLAY }}>{game.currentLevel}</div>
                <div style={{ fontSize: '10px', color: palette.bodyTextSoft, fontWeight: 700 }}>Level</div>
              </div>
              <div style={{ background: palette.creamSoft, padding: '14px', borderRadius: '12px', border: `1.5px solid ${palette.border}` }}>
                <div style={{ fontSize: '22px', fontWeight: '800', color: palette.gold, fontFamily: FONT_DISPLAY }}>{accuracy}%</div>
                <div style={{ fontSize: '10px', color: palette.bodyTextSoft, fontWeight: 700 }}>Accuracy</div>
              </div>
            </div>
            {game.diamondsEarnedThisGame > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: `linear-gradient(135deg, ${palette.diamond}15, ${palette.diamond}08)`, borderRadius: '12px', marginBottom: '16px', border: `1.5px solid ${palette.diamond}50` }}>
                <span style={{ fontSize: '20px' }}>💎</span>
                <span style={{ fontSize: '16px', fontWeight: '800', color: palette.diamond, fontFamily: FONT_DISPLAY }}>+{game.diamondsEarnedThisGame} diamonds</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
              <button onClick={game.openHeartShopFromGameOver} style={{ padding: '13px', background: `linear-gradient(135deg, ${palette.diamond}, ${palette.diamondShadow})`, color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '800', boxShadow: `0 3px 0 ${palette.diamondShadow}`, fontFamily: FONT_DISPLAY }}>
                💎 Continue with Hearts ({game.localDiamonds} 💎)
              </button>
              <button onClick={game.restartGame} style={{ padding: '12px', background: palette.creamSoft, color: palette.deepNavy, border: `1.5px solid ${palette.border}`, borderRadius: '14px', cursor: 'pointer', fontSize: '13px', fontWeight: '800', fontFamily: FONT_DISPLAY }}>📚 Back to Library</button>
            </div>
          </div>
          {game.showHeartShop && <HeartShopModal />}
        </div>
        {showDevPanel && <StoryQuestDevPanel {...getDevPanelProps()} />}
      </>
    );
  }

  // ===== PLAYING =====
  if (game.gameState === 'playing') {
    const scene = game.scenes[game.currentScene] || game.scenes[0];
    if (!scene) return null;
    return (
      <>
        <div style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          background: `linear-gradient(135deg, #EDE9FE 0%, #FCE7F3 50%, #FEF3C7 100%)`,
          fontFamily: FONT_BODY,
          overflow: 'hidden'
        }}>
          <GameUI
            scene={scene}
            currentScene={game.currentScene}
            currentLevel={game.currentLevel}
            allScenes={game.scenes}
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
            points={game.localPoints || 0}
            diamonds={game.localDiamonds || 0}
          />
        </div>
        {showDevPanel && <StoryQuestDevPanel {...getDevPanelProps()} />}
      </>
    );
  }

  return null;
};

export default ShortStoryGame;