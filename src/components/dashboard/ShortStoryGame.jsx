// src/components/dashboard/ShortStoryGame.jsx
// ✅ LANDSCAPE-RESPONSIVE: Kasya na lahat sa landscape mobile
// ✅ Auto-adjust padding, font sizes, at image sizes kapag landscape
// ✅ Uses 100dvh (dynamic viewport height) for mobile browsers
// ============================================================

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

// ✅ Landscape CSS na ini-inject sa lahat ng screens
const LANDSCAPE_STYLES = `
  /* Base screen wrapper */
  .sq-screen {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    font-family: ${FONT_BODY};
    overflow: hidden;
    box-sizing: border-box;
  }

  .sq-card {
    width: 100%;
    box-sizing: border-box;
    max-height: calc(100dvh - 24px);
    overflow-y: auto;
  }

  /* Kapag naka-landscape ang phone (maliit ang height) */
  @media (max-height: 500px) and (orientation: landscape) {
    .sq-screen {
      padding: 6px 12px !important;
      align-items: center !important;
    }

    .sq-card {
      max-height: calc(100dvh - 12px) !important;
      padding: 12px 20px !important;
      border-radius: 16px !important;
    }

    /* Title/heading sizes */
    .sq-card h2 {
      font-size: 18px !important;
      margin-bottom: 4px !important;
    }
    .sq-card h3 {
      font-size: 15px !important;
    }

    /* Body text */
    .sq-card p {
      font-size: 11px !important;
      margin-bottom: 6px !important;
    }

    /* Emojis/icons sa header */
    .sq-big-emoji {
      font-size: 36px !important;
      margin-bottom: 4px !important;
    }

    /* Stat boxes sa loob ng card */
    .sq-stats-grid {
      gap: 6px !important;
      margin-bottom: 8px !important;
    }
    .sq-stat-box {
      padding: 8px 10px !important;
      border-radius: 10px !important;
    }
    .sq-stat-value {
      font-size: 16px !important;
    }
    .sq-stat-label {
      font-size: 9px !important;
    }

    /* Reward box */
    .sq-reward-box {
      padding: 8px 12px !important;
      margin-bottom: 8px !important;
    }
    .sq-reward-emoji {
      font-size: 22px !important;
    }
    .sq-reward-value {
      font-size: 18px !important;
    }

    /* Buttons */
    .sq-btn {
      padding: 10px 14px !important;
      font-size: 12px !important;
      border-radius: 10px !important;
    }

    /* Loading screen */
    .sq-loading-card {
      padding: 20px !important;
      max-width: 320px !important;
    }
    .sq-loading-card h2 {
      font-size: 20px !important;
    }

    /* Book select iframe/embed — full height */
    .sq-book-select-wrapper {
      width: 100vw !important;
      height: 100dvh !important;
      padding: 0 !important;
    }

    /* Playing screen — full viewport */
    .sq-playing-wrapper {
      position: fixed !important;
      inset: 0 !important;
      width: 100vw !important;
      height: 100dvh !important;
      overflow: hidden !important;
    }
  }

  /* Kapag sobrang liit ng height (halimbawa 350px) */
  @media (max-height: 380px) and (orientation: landscape) {
    .sq-card {
      padding: 8px 14px !important;
    }
    .sq-card h2 { font-size: 16px !important; }
    .sq-big-emoji { font-size: 28px !important; }
    .sq-stat-value { font-size: 14px !important; }
    .sq-btn { padding: 8px 12px !important; font-size: 11px !important; }
  }

  /* Scrollbar styling */
  .sq-card::-webkit-scrollbar {
    width: 4px;
  }
  .sq-card::-webkit-scrollbar-thumb {
    background: rgba(124, 58, 237, 0.3);
    border-radius: 4px;
  }
`;

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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(42, 40, 69, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '20px', overflow: 'auto' }}>
      <div className="sq-card" style={{ background: palette.white, borderRadius: '20px', padding: '28px 24px', maxWidth: '460px', border: `1.5px solid ${palette.border}`, boxShadow: '0 20px 50px rgba(42, 40, 69, 0.4)' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div className="sq-big-emoji" style={{ fontSize: '48px', marginBottom: '4px' }}>❤️</div>
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
                className="sq-btn"
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
          <button onClick={game.closeHeartShop} className="sq-btn" style={{ flex: 1, padding: '12px', borderRadius: '12px', border: `1.5px solid ${palette.border}`, background: palette.creamSoft, color: palette.bodyText, cursor: 'pointer', fontSize: '13px', fontWeight: '800', fontFamily: FONT_DISPLAY }}>Cancel</button>
          {game.continueFromGameOver && (
            <button onClick={game.giveUpGame} className="sq-btn" style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: palette.danger, color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '800', fontFamily: FONT_DISPLAY, boxShadow: `0 3px 0 ${palette.dangerShadow}` }}>Give Up</button>
          )}
        </div>
      </div>
    </div>
  );

  // ===== BOOK SELECT =====
  if (game.gameState === 'intro') {
    return (
      <>
        <style>{LANDSCAPE_STYLES}</style>
        <div className="sq-book-select-wrapper" style={{ width: '100%', height: '100dvh', overflow: 'hidden' }}>
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
        </div>
        {game.showHeartShop && <HeartShopModal />}
        {showDevPanel && <StoryQuestDevPanel {...getDevPanelProps()} />}
      </>
    );
  }

  // ===== LOADING =====
  if (game.gameState === 'loading') {
    return (
      <>
        <style>{LANDSCAPE_STYLES}</style>
        <div className="sq-screen" style={{ background: `linear-gradient(135deg, ${palette.purple}, ${palette.purpleDeep})` }}>
          <div className="sq-card sq-loading-card" style={{ maxWidth: '420px', background: palette.white, borderRadius: '24px', padding: '36px', textAlign: 'center' }}>
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
        <style>{LANDSCAPE_STYLES}</style>
        <div className="sq-screen" style={{ background: `linear-gradient(135deg, ${palette.purple}, ${palette.purpleDeep})` }}>
          <div className="sq-card" style={{ maxWidth: '480px', background: palette.white, borderRadius: '28px', padding: '36px 32px', textAlign: 'center', boxShadow: '0 30px 80px rgba(0,0,0,0.4)', border: `3px solid ${palette.purple}` }}>
            <div className="sq-big-emoji" style={{ fontSize: '72px', marginBottom: '8px' }}>🎉</div>
            <h2 style={{ fontSize: '30px', fontWeight: '900', color: palette.purple, fontFamily: FONT_DISPLAY, marginBottom: '6px' }}>
              Level Complete!
            </h2>
            <p style={{ fontSize: '14px', color: palette.bodyTextSoft, fontWeight: 700, marginBottom: '20px' }}>
              You finished <strong style={{ color: palette.purple, fontFamily: FONT_DISPLAY }}>{data.level}</strong>!
            </p>

            <div className="sq-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
              <div className="sq-stat-box" style={{ padding: '14px', background: palette.creamSoft, borderRadius: '12px', border: `1.5px solid ${palette.border}` }}>
                <div className="sq-stat-value" style={{ fontSize: '22px', fontWeight: '900', color: palette.purple, fontFamily: FONT_DISPLAY }}>{data.score}</div>
                <div className="sq-stat-label" style={{ fontSize: '10px', color: palette.bodyTextSoft, fontWeight: 800, marginTop: '2px' }}>SCORE</div>
              </div>
              <div className="sq-stat-box" style={{ padding: '14px', background: palette.creamSoft, borderRadius: '12px', border: `1.5px solid ${palette.border}` }}>
                <div className="sq-stat-value" style={{ fontSize: '22px', fontWeight: '900', color: data.accuracy >= 80 ? palette.softGreen : data.accuracy >= 50 ? palette.gold : palette.danger, fontFamily: FONT_DISPLAY }}>{data.accuracy}%</div>
                <div className="sq-stat-label" style={{ fontSize: '10px', color: palette.bodyTextSoft, fontWeight: 800, marginTop: '2px' }}>ACCURACY</div>
              </div>
              <div className="sq-stat-box" style={{ padding: '14px', background: palette.creamSoft, borderRadius: '12px', border: `1.5px solid ${palette.border}` }}>
                <div className="sq-stat-value" style={{ fontSize: '22px', fontWeight: '900', color: palette.gold, fontFamily: FONT_DISPLAY }}>{data.correctAnswers}/{data.totalAnswers}</div>
                <div className="sq-stat-label" style={{ fontSize: '10px', color: palette.bodyTextSoft, fontWeight: 800, marginTop: '2px' }}>CORRECT</div>
              </div>
            </div>

            {!data.alreadyClaimedToday && data.diamondsEarned > 0 && (
              <div className="sq-reward-box" style={{
                padding: '16px',
                background: `linear-gradient(135deg, ${palette.diamond}20, ${palette.diamond}08)`,
                borderRadius: '14px',
                marginBottom: '16px',
                border: `2px solid ${palette.diamond}`,
                boxShadow: `0 4px 0 ${palette.diamondShadow}, 0 0 30px ${palette.diamond}40`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span className="sq-reward-emoji" style={{ fontSize: '32px' }}>💎</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '13px', fontWeight: '900', color: palette.diamondShadow, fontFamily: FONT_DISPLAY, letterSpacing: '0.5px' }}>
                      DIAMOND REWARD!
                    </div>
                    <div className="sq-reward-value" style={{ fontSize: '24px', fontWeight: '900', color: palette.diamond, fontFamily: FONT_DISPLAY }}>
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
                  className="sq-btn"
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
                className="sq-btn"
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
        <style>{LANDSCAPE_STYLES}</style>
        <div className="sq-screen" style={{ background: `linear-gradient(135deg, ${palette.purple}, ${palette.purpleDeep})` }}>
          <div className="sq-card" style={{ maxWidth: '520px', background: palette.white, borderRadius: '24px', padding: '32px 28px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.35)' }}>
            <div className="sq-big-emoji" style={{ fontSize: '64px', marginBottom: '6px' }}>👑</div>
            <h2 style={{ fontSize: '26px', fontWeight: '800', color: palette.gold, marginBottom: '4px', fontFamily: FONT_DISPLAY }}>All Chapters Complete!</h2>
            <p style={{ fontSize: '13px', color: palette.bodyTextSoft, marginBottom: '16px', fontWeight: 600 }}>You mastered <strong style={{ color: palette.gold, fontFamily: FONT_DISPLAY }}>A1 → C2</strong>! 🎉</p>
            <div className="sq-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
              <div className="sq-stat-box" style={{ padding: '12px', background: palette.creamSoft, borderRadius: '10px', border: `1.5px solid ${palette.border}` }}>
                <div className="sq-stat-value" style={{ fontSize: '20px', fontWeight: '800', color: palette.purple, fontFamily: FONT_DISPLAY }}>{game.score}</div>
                <div className="sq-stat-label" style={{ fontSize: '10px', color: palette.bodyTextSoft, fontWeight: 800 }}>SCORE</div>
              </div>
              <div className="sq-stat-box" style={{ padding: '12px', background: palette.creamSoft, borderRadius: '10px', border: `1.5px solid ${palette.border}` }}>
                <div className="sq-stat-value" style={{ fontSize: '20px', fontWeight: '800', color: palette.teal, fontFamily: FONT_DISPLAY }}>{accuracy}%</div>
                <div className="sq-stat-label" style={{ fontSize: '10px', color: palette.bodyTextSoft, fontWeight: 800 }}>ACCURACY</div>
              </div>
              <div className="sq-stat-box" style={{ padding: '12px', background: palette.creamSoft, borderRadius: '10px', border: `1.5px solid ${palette.border}` }}>
                <div className="sq-stat-value" style={{ fontSize: '20px', fontWeight: '800', color: palette.gold, fontFamily: FONT_DISPLAY }}>{game.totalAnswers}</div>
                <div className="sq-stat-label" style={{ fontSize: '10px', color: palette.bodyTextSoft, fontWeight: 800 }}>QUESTIONS</div>
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
                <span className="sq-reward-emoji" style={{ fontSize: '32px' }}>🏆</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#78350F', fontFamily: FONT_DISPLAY }}>COMPLETION BONUS!</div>
                  <div className="sq-reward-value" style={{ fontSize: '16px', fontWeight: '800', color: '#B45309', fontFamily: FONT_DISPLAY }}>+{game.completionBonus} 💎 Diamonds</div>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: '6px', flexDirection: 'column' }}>
              <button onClick={game.restartGame} className="sq-btn" style={{ padding: '12px', background: `linear-gradient(135deg, ${palette.purple}, ${palette.coral})`, color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '800', fontFamily: FONT_DISPLAY, boxShadow: `0 3px 0 ${palette.purpleDeep}` }}>
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
        <style>{LANDSCAPE_STYLES}</style>
        <div className="sq-screen" style={{ background: `linear-gradient(135deg, ${palette.purple}, ${palette.purpleDeep})` }}>
          <div className="sq-card" style={{ maxWidth: '420px', background: palette.white, borderRadius: '24px', padding: '36px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.35)' }}>
            <div className="sq-big-emoji" style={{ fontSize: '64px', marginBottom: '8px' }}>💀</div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: palette.deepNavy, marginBottom: '4px', fontFamily: FONT_DISPLAY }}>Game Over!</h2>
            <p style={{ fontSize: '14px', color: palette.bodyTextSoft, marginBottom: '20px', fontWeight: 600 }}>
              You reached <strong style={{ color: palette.purple }}>{game.currentLevel}</strong> with <strong style={{ color: palette.softGreen }}>{game.correctAnswers}</strong> correct!
            </p>
            <div className="sq-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
              <div className="sq-stat-box" style={{ background: palette.creamSoft, padding: '14px', borderRadius: '12px', border: `1.5px solid ${palette.border}` }}>
                <div className="sq-stat-value" style={{ fontSize: '22px', fontWeight: '800', color: palette.purple, fontFamily: FONT_DISPLAY }}>{game.correctAnswers}</div>
                <div className="sq-stat-label" style={{ fontSize: '10px', color: palette.bodyTextSoft, fontWeight: 700 }}>Correct</div>
              </div>
              <div className="sq-stat-box" style={{ background: palette.creamSoft, padding: '14px', borderRadius: '12px', border: `1.5px solid ${palette.border}` }}>
                <div className="sq-stat-value" style={{ fontSize: '22px', fontWeight: '800', color: palette.purple, fontFamily: FONT_DISPLAY }}>{game.currentLevel}</div>
                <div className="sq-stat-label" style={{ fontSize: '10px', color: palette.bodyTextSoft, fontWeight: 700 }}>Level</div>
              </div>
              <div className="sq-stat-box" style={{ background: palette.creamSoft, padding: '14px', borderRadius: '12px', border: `1.5px solid ${palette.border}` }}>
                <div className="sq-stat-value" style={{ fontSize: '22px', fontWeight: '800', color: palette.gold, fontFamily: FONT_DISPLAY }}>{accuracy}%</div>
                <div className="sq-stat-label" style={{ fontSize: '10px', color: palette.bodyTextSoft, fontWeight: 700 }}>Accuracy</div>
              </div>
            </div>
            {game.diamondsEarnedThisGame > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: `linear-gradient(135deg, ${palette.diamond}15, ${palette.diamond}08)`, borderRadius: '12px', marginBottom: '16px', border: `1.5px solid ${palette.diamond}50` }}>
                <span style={{ fontSize: '20px' }}>💎</span>
                <span style={{ fontSize: '16px', fontWeight: '800', color: palette.diamond, fontFamily: FONT_DISPLAY }}>+{game.diamondsEarnedThisGame} diamonds</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
              <button onClick={game.openHeartShopFromGameOver} className="sq-btn" style={{ padding: '13px', background: `linear-gradient(135deg, ${palette.diamond}, ${palette.diamondShadow})`, color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '800', boxShadow: `0 3px 0 ${palette.diamondShadow}`, fontFamily: FONT_DISPLAY }}>
                💎 Continue with Hearts ({game.localDiamonds} 💎)
              </button>
              <button onClick={game.restartGame} className="sq-btn" style={{ padding: '12px', background: palette.creamSoft, color: palette.deepNavy, border: `1.5px solid ${palette.border}`, borderRadius: '14px', cursor: 'pointer', fontSize: '13px', fontWeight: '800', fontFamily: FONT_DISPLAY }}>📚 Back to Library</button>
            </div>
          </div>
        </div>
        {game.showHeartShop && <HeartShopModal />}
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
        <style>{LANDSCAPE_STYLES}</style>
        <div className="sq-playing-wrapper" style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100dvh',
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