// src/components/dashboard/SynoQuest.jsx
// ✅ LANDSCAPE-RESPONSIVE: Kasya na lahat sa landscape mobile
// ✅ All existing features preserved
// ✅ UPDATED: Timer 15s → 12s → 10s (max 10s)
// ✅ UPDATED: Dev Panel matches MatchGame layout
// ✅ NEW: FINISHED SCREEN with COMPLETION BONUS +50 💎 (same as MatchGame)
// ✅ FIXED: devForceLevelUp no longer crashes (removed undefined setters)
// ✅ FIXED: Exit returns to GAMES selection screen (via onExitToGames prop)
// ✅ FIXED: Back button returns to GAMES selection screen
// ✅ FIXED: Dev panel state preserved (call as function, not component)

import React, { useState, useEffect, useRef, useCallback } from 'react';
import backgroundMusic from '../../utils/backgroundMusic';
import { auth, db } from '../../pages/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateUserStats } from '../../services/firebaseService';
import { claimGameDiamonds, spendDiamonds, HEART_PRICES } from '../../services/diamondService';
import SynoQuestDevPanel from './SynoQuestDevPanel';

const palette = {
  warmOrange: '#E9A075', warmOrangeShadow: '#C27E4F',
  coral: '#DB7A64', coralShadow: '#A95845',
  teal: '#4F9188', tealShadow: '#3A6A63',
  deepNavy: '#2A2845', deepNavyLight: '#3A3757',
  bodyText: '#6B6880', bodyTextSoft: '#8A8799',
  cream: '#FDF9F3', creamSoft: '#F5EFE6', white: '#FFFFFF',
  border: '#EBE2D5', borderSoft: '#F2EBE0',
  softGreen: '#7FA574', softGreenShadow: '#5E7F55',
  gold: '#d4af37', diamond: '#5DADE2', diamondShadow: '#3D8BBF',
  danger: '#DB7A64', dangerShadow: '#A95845',
};

const FONT_DISPLAY = "'Fredoka', sans-serif";
const FONT_BODY = "'Nunito', sans-serif";

const imageBasePath = '/image/';
const vocabWords = [
  'above','across','action','activity','actress','add','address','adult','beach','change',
  'ability','able','accept','achieve','active','decision','education','famous','improve','journey',
  'balance','benefit','budget','capable','challenge','character','knowledge','opportunity','prepare','successful',
  'abandon','accurate','confident','conscious','demonstrate','efficient','organize','maintain','relevant','sufficient',
  'adapt','brilliant','complex','crucial','dominate','establish','flexible','genuine','isolate','vital',
  'abundant','decisive','exquisite','futile','harmonious','inevitable','lucid','profound','resilient','tranquil'
];

const images = {
  mascot: `${imageBasePath}mascot.png`, 'mascot-dad': `${imageBasePath}mascot-dad.png`,
  'mascot-happy': `${imageBasePath}mascot-happy.png`, 'mascot-sitting': `${imageBasePath}mascot-sitting.png`,
  'mascot-skateboard': `${imageBasePath}mascot-skateboard.png`,
  bokasadfavorite: `${imageBasePath}bokasadfavorite.jpg`, bokastudent: `${imageBasePath}bokastudent.png`,
  bokateacher: `${imageBasePath}bokateacher.png`, bokawelcoming: `${imageBasePath}bokawelcoming.jpg`,
  guesswhatgame: `${imageBasePath}guesswhatgame.png`, hide: `${imageBasePath}hide.png`,
  matchgame: `${imageBasePath}matchgame.png`, oepn: `${imageBasePath}oepn.png`,
  quizgame: `${imageBasePath}quizgame.png`, sadheart: `${imageBasePath}sadheart.jpg`,
  sentence: `${imageBasePath}sentence.png`, shortstory: `${imageBasePath}shortstory.png`,
  wordpics: `${imageBasePath}wordpics.png`, 'pixel-town': `${imageBasePath}pixel-town.png`,
  ...vocabWords.reduce((acc, word) => { acc[word] = `${imageBasePath}${word}.png`; return acc; }, {})
};

const fullScreenBg = {
  position: 'fixed', top: 0, left: 0, width: '100vw',
  height: '100vh', minHeight: '100dvh', overflowY: 'auto',
  backgroundImage: `linear-gradient(135deg, rgba(42, 40, 69, 0.65), rgba(58, 55, 87, 0.55)), url(${imageBasePath}bg-synoquest.png)`,
  backgroundSize: '130% 130%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
  animation: 'bgPan 30s ease-in-out infinite alternate', fontFamily: FONT_BODY,
};

const bgAnimationStyle = (<style>{`
  @keyframes bgPan { 0% { background-position: 0% 0%; } 50% { background-position: 100% 50%; } 100% { background-position: 50% 100%; } }

  @media (max-height: 500px) and (orientation: landscape) {
    .sq-play-wrapper { padding: 4px 10px !important; height: 100dvh !important; overflow: hidden !important; box-sizing: border-box !important; display: flex !important; flex-direction: column !important; align-items: center !important; }
    .sq-header { padding: 4px 10px !important; margin-bottom: 4px !important; border-radius: 10px !important; max-width: 100% !important; }
    .sq-header span { font-size: 9px !important; }
    .sq-header button { font-size: 12px !important; padding: 0 4px !important; }
    .sq-header > div { gap: 3px !important; }
    .sq-header > div > div { padding: 1px 6px !important; font-size: 8px !important; border-radius: 6px !important; }
    .sq-header > div > div:last-child { padding: 1px 8px !important; font-size: 10px !important; }
    .sq-header-hearts span { font-size: 11px !important; }
    .sq-header-timer { width: 20px !important; height: 20px !important; font-size: 9px !important; }
    .sq-main-card { padding: 8px 14px !important; border-radius: 14px !important; max-height: calc(100dvh - 45px) !important; overflow-y: auto !important; width: 100% !important; max-width: 720px !important; box-sizing: border-box !important; }
    .sq-level-row { margin-bottom: 6px !important; }
    .sq-level-row span { font-size: 11px !important; }
    .sq-image-row { padding: 6px 10px !important; margin-bottom: 8px !important; gap: 8px !important; border-radius: 10px !important; }
    .sq-image-box { width: 80px !important; height: 80px !important; border-radius: 8px !important; }
    .sq-image-arrow { font-size: 20px !important; }
    .sq-image-eq { font-size: 18px !important; padding: 0 10px !important; border-radius: 8px !important; }
    .sq-category { font-size: 11px !important; margin-bottom: 6px !important; }
    .sq-blanks-row { gap: 4px !important; margin-bottom: 8px !important; padding: 8px 10px !important; border-radius: 10px !important; }
    .sq-blank-box { width: 30px !important; height: 36px !important; font-size: 16px !important; border-radius: 8px !important; }
    .sq-letters-row { gap: 4px !important; margin-bottom: 8px !important; padding: 8px 10px !important; border-radius: 10px !important; min-height: 38px !important; }
    .sq-letter-btn { width: 34px !important; height: 34px !important; font-size: 14px !important; border-radius: 8px !important; }
    .sq-action-btns { gap: 6px !important; margin-bottom: 6px !important; }
    .sq-action-btn { padding: 8px !important; font-size: 11px !important; border-radius: 10px !important; }
    .sq-hint-btn { padding: 8px !important; font-size: 10px !important; border-radius: 10px !important; margin-bottom: 6px !important; }
    .sq-feedback { font-size: 10px !important; padding: 5px !important; border-radius: 8px !important; }
    .sq-intro-card { max-width: 720px !important; padding: 12px 20px !important; border-radius: 16px !important; max-height: calc(100dvh - 12px) !important; overflow-y: auto !important; }
    .sq-intro-icon { width: 44px !important; height: 44px !important; margin-bottom: 6px !important; }
    .sq-intro-icon > div { width: 28px !important; height: 28px !important; font-size: 16px !important; }
    .sq-intro-chip { padding: 3px 8px !important; font-size: 10px !important; margin-bottom: 4px !important; }
    .sq-intro-chip span { font-size: 10px !important; }
    .sq-intro-title { font-size: 20px !important; margin-bottom: 0 !important; }
    .sq-intro-sub { font-size: 10px !important; margin-bottom: 8px !important; }
    .sq-intro-stats { gap: 6px !important; margin-bottom: 8px !important; }
    .sq-intro-stats > div { padding: 4px 10px !important; }
    .sq-intro-stats span { font-size: 11px !important; }
    .sq-intro-levels { gap: 2px !important; padding: 4px !important; margin-bottom: 8px !important; }
    .sq-intro-level-item { padding: 2px !important; font-size: 7px !important; border-radius: 4px !important; }
    .sq-intro-level-item > div:first-child { font-size: 10px !important; }
    .sq-intro-hearts { padding: 4px !important; margin-bottom: 8px !important; }
    .sq-intro-hearts span { font-size: 14px !important; }
    .sq-intro-hearts + span { font-size: 10px !important; }
    .sq-intro-btn { padding: 10px !important; font-size: 12px !important; border-radius: 10px !important; }
    .sq-intro-back-btn { padding: 6px !important; font-size: 10px !important; margin-top: 4px !important; }
    .sq-end-card { max-width: 720px !important; padding: 14px 20px !important; border-radius: 16px !important; max-height: calc(100dvh - 12px) !important; overflow-y: auto !important; }
    .sq-end-emoji { font-size: 40px !important; margin-bottom: 2px !important; }
    .sq-end-title { font-size: 18px !important; margin-bottom: 2px !important; }
    .sq-end-sub { font-size: 11px !important; margin-bottom: 8px !important; }
    .sq-end-stats { gap: 6px !important; margin-bottom: 8px !important; }
    .sq-end-stat-box { padding: 8px !important; border-radius: 8px !important; }
    .sq-end-stat-box > div:first-child { font-size: 15px !important; }
    .sq-end-stat-box > div:last-child { font-size: 8px !important; }
    .sq-end-reward { padding: 8px !important; margin-bottom: 6px !important; border-radius: 10px !important; }
    .sq-end-reward span { font-size: 12px !important; }
    .sq-end-btn { padding: 8px !important; font-size: 11px !important; border-radius: 8px !important; }
    .sq-modal-card { padding: 14px 18px !important; max-width: 640px !important; max-height: calc(100dvh - 12px) !important; overflow-y: auto !important; border-radius: 14px !important; }
    .sq-modal-card h2 { font-size: 16px !important; margin-bottom: 2px !important; }
    .sq-modal-card h3 { font-size: 15px !important; margin-bottom: 4px !important; }
    .sq-modal-card p { font-size: 11px !important; margin-bottom: 6px !important; }
    .sq-modal-emoji { font-size: 32px !important; margin-bottom: 2px !important; }
    .sq-modal-price-btn { padding: 8px 12px !important; border-radius: 10px !important; }
    .sq-modal-price-btn > div:first-child > div:first-child { font-size: 20px !important; }
    .sq-modal-price-btn > div:first-child > div:last-child > div:first-child { font-size: 12px !important; }
    .sq-modal-btn { padding: 8px !important; font-size: 11px !important; border-radius: 8px !important; }
    .sq-loading-card { padding: 20px !important; max-width: 400px !important; }
    .sq-loading-card h2 { font-size: 22px !important; }
    .sq-loading-bar { height: 22px !important; margin-top: 16px !important; }
  }
  @media (max-height: 380px) and (orientation: landscape) {
    .sq-main-card { padding: 6px 10px !important; }
    .sq-image-box { width: 65px !important; height: 65px !important; }
    .sq-blank-box { width: 26px !important; height: 30px !important; font-size: 14px !important; }
    .sq-letter-btn { width: 28px !important; height: 28px !important; font-size: 12px !important; }
    .sq-header > div > div { padding: 1px 5px !important; font-size: 7px !important; }
  }
`}</style>);

const theme = {
  cardBg: palette.white, cardBorder: `1.5px solid ${palette.border}`,
  cardShadow: `0 10px 40px rgba(42, 40, 69, 0.20), 0 2px 0 ${palette.border}`,
  textPrimary: palette.deepNavy, textSecondary: palette.bodyText, textMuted: palette.bodyTextSoft,
  accent: palette.warmOrange, accentGradient: `linear-gradient(135deg, ${palette.warmOrange} 0%, ${palette.coral} 100%)`,
  chipBg: palette.creamSoft, surfaceBg: palette.creamSoft, surfaceBorder: palette.border,
};

const generateLetterOptions = (word) => {
  const letters = word.split('');
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const correctLetters = [...letters];
  const extraLetters = alphabet.filter(l => !correctLetters.includes(l));
  const numExtra = Math.floor(Math.random() * 6) + 3;
  const extra = [...extraLetters].sort(() => Math.random() - 0.5).slice(0, numExtra);
  return [...correctLetters, ...extra].sort(() => Math.random() - 0.5);
};

const generateBlankPositions = (word, numBlanks) => {
  const wordLength = word.length;
  const visibleCount = wordLength - numBlanks;
  const visiblePositions = [];
  const available = Array.from({ length: wordLength }, (_, i) => i);
  for (let i = 0; i < visibleCount; i++) {
    const idx = Math.floor(Math.random() * available.length);
    visiblePositions.push(available[idx]);
    available.splice(idx, 1);
  }
  visiblePositions.sort((a, b) => a - b);
  const blankPositions = [];
  for (let i = 0; i < wordLength; i++) {
    if (!visiblePositions.includes(i)) blankPositions.push(i);
  }
  return { visiblePositions, blankPositions };
};

const REFILL_TIME = 1800;
const HINT_COSTS = [0, 3, 5, 7, 10, 15, 20, 25, 30, 40, 50, 75, 100, 150, 200];
const getHintCost = (n) => n < HINT_COSTS.length ? HINT_COSTS[n] : HINT_COSTS[HINT_COSTS.length - 1];

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const QUESTIONS_PER_LEVEL = 10;
const COMPLETION_BONUS_DIAMONDS = 50;

const LEVEL_CONFIG = {
  'A1': { timer: 15, label: 'A1 - Beginner', emoji: '🟢', questionsPerLevel: 10 },
  'A2': { timer: 12, label: 'A2 - Elementary', emoji: '🟢', questionsPerLevel: 10 },
  'B1': { timer: 10, label: 'B1 - Intermediate', emoji: '🟡', questionsPerLevel: 10 },
  'B2': { timer: 10, label: 'B2 - Upper Intermediate', emoji: '🟡', questionsPerLevel: 10 },
  'C1': { timer: 10, label: 'C1 - Advanced', emoji: '🟠', questionsPerLevel: 10 },
  'C2': { timer: 10, label: 'C2 - Proficiency', emoji: '👑', questionsPerLevel: 10 },
};

const wordLevelMap = {
  'above':'A1','across':'A1','action':'A1','activity':'A1','actress':'A1','add':'A1','address':'A1','adult':'A1','beach':'A1','change':'A1',
  'ability':'A2','able':'A2','accept':'A2','achieve':'A2','active':'A2','decision':'A2','education':'A2','famous':'A2','improve':'A2','journey':'A2',
  'balance':'B1','benefit':'B1','budget':'B1','capable':'B1','challenge':'B1','character':'B1','knowledge':'B1','opportunity':'B1','prepare':'B1','successful':'B1',
  'abandon':'B2','accurate':'B2','confident':'B2','conscious':'B2','demonstrate':'B2','efficient':'B2','organize':'B2','maintain':'B2','relevant':'B2','sufficient':'B2',
  'adapt':'C1','brilliant':'C1','complex':'C1','crucial':'C1','dominate':'C1','establish':'C1','flexible':'C1','genuine':'C1','isolate':'C1','vital':'C1',
  'abundant':'C2','decisive':'C2','exquisite':'C2','futile':'C2','harmonious':'C2','inevitable':'C2','lucid':'C2','profound':'C2','resilient':'C2','tranquil':'C2'
};

const allVocabPairs = Object.keys(wordLevelMap).map((word, index) => ({
  id: index + 1, word: word.toUpperCase(),
  image1: `${imageBasePath}${word}.png`, image2: `${imageBasePath}${word}1.png`,
  category: `📚 ${wordLevelMap[word]} Vocabulary`
}));

const wordPairs = {
  'A1': allVocabPairs.filter(p => p.category.includes('A1')),
  'A2': allVocabPairs.filter(p => p.category.includes('A2')),
  'B1': allVocabPairs.filter(p => p.category.includes('B1')),
  'B2': allVocabPairs.filter(p => p.category.includes('B2')),
  'C1': allVocabPairs.filter(p => p.category.includes('C1')),
  'C2': allVocabPairs.filter(p => p.category.includes('C2')),
};
const getWordsByLevel = (l) => wordPairs[l] || wordPairs['A1'];

const SynoQuest = ({ onBack, onExitToGames, updateProgress, recordGame, currentPoints, onPointsChange }) => {
  const [gameState, setGameState] = useState('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [questions, setQuestions] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showCorrectAnimation, setShowCorrectAnimation] = useState(false);
  const [stats, setStats] = useState({ gamesPlayed: 0, bestScore: 0, totalCorrect: 0 });

  const [localDiamonds, setLocalDiamonds] = useState(0);
  const [showHeartShop, setShowHeartShop] = useState(false);
  const [diamondsEarnedThisGame, setDiamondsEarnedThisGame] = useState(0);
  const [heartShopProcessing, setHeartShopProcessing] = useState(false);
  const [continueFromGameOver, setContinueFromGameOver] = useState(false);
  const [completionBonus, setCompletionBonus] = useState(0);

  const [currentUser, setCurrentUser] = useState(null);
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  const sessionSavedRef = useRef(false);
  const firebaseSavedRef = useRef(false);
  const diamondSavedRef = useRef(false);
  const progressSavedRef = useRef(false);
  const completionBonusSavedRef = useRef(false);

  const gameStateRef = useRef('intro');
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  const updateProgressRef = useRef(updateProgress);
  const recordGameRef = useRef(recordGame);
  const saveGameToFirebaseRef = useRef(null);

  useEffect(() => { updateProgressRef.current = updateProgress; }, [updateProgress]);
  useEffect(() => { recordGameRef.current = recordGame; }, [recordGame]);

  const answeredWordsRef = useRef([]);
  const wrongQueueRef = useRef([]);

  const [localPoints, setLocalPoints] = useState(currentPoints || 0);
  const [hintsUsedThisLevel, setHintsUsedThisLevel] = useState(0);

  const [timer, setTimer] = useState(15);
  const [timerRunning, setTimerRunning] = useState(false);
  const [lives, setLives] = useState(5);
  const [maxLives] = useState(5);
  const [lastRefillTime, setLastRefillTime] = useState(Date.now());
  const [timeRemaining, setTimeRemaining] = useState('');
  const [hintUsed, setHintUsed] = useState(false);
  const [showNoLivesMessage, setShowNoLivesMessage] = useState(false);

  const timerIntervalRef = useRef(null);
  const lastRefillTimeRef = useRef(Date.now());
  const livesRef = useRef(5);
  const isMountedRef = useRef(true);

  const [currentLevel, setCurrentLevel] = useState('A1');
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [streak, setStreak] = useState(0);

  const [answeredInLevel, setAnsweredInLevel] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [retryQuestion, setRetryQuestion] = useState(null);
  const [wrongQuestions, setWrongQuestions] = useState([]);
  const [retryPhase, setRetryPhase] = useState(false);
  const [retryIndex, setRetryIndex] = useState(0);

  const [blankPositions, setBlankPositions] = useState([]);
  const [visiblePositions, setVisiblePositions] = useState([]);
  const [userFilledBlanks, setUserFilledBlanks] = useState({});
  const [availableLetters, setAvailableLetters] = useState([]);
  const [usedLetters, setUsedLetters] = useState([]);

  const audioCtx = useRef(null);
  const gainNode = useRef(null);

  const getUserId = useCallback(() => currentUser ? currentUser.uid : 'guest', [currentUser]);
  const getLivesStorageKey = useCallback(() => `synoquest_lives_${getUserId()}`, [getUserId]);
  const getStatsStorageKey = useCallback(() => `synoquest_stats_${getUserId()}`, [getUserId]);
  const getLeaderboardStorageKey = useCallback(() => `synoquest_leaderboard_${getUserId()}`, [getUserId]);

  useEffect(() => { if (typeof currentPoints === 'number') setLocalPoints(currentPoints); }, [currentPoints]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => { setCurrentUser(user); setIsUserLoaded(true); });
    return () => unsub();
  }, []);

  useEffect(() => {
    const fetchCurrency = async () => {
      if (!currentUser) return;
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          const pts = data.totalPoints || 0;
          const dia = data.totalDiamonds || 0;
          setLocalPoints(pts);
          setLocalDiamonds(dia);
          if (onPointsChange) onPointsChange(pts);
        }
      } catch (err) { console.error('Error fetching currency:', err); }
    };
    if (currentUser && isUserLoaded) fetchCurrency();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, isUserLoaded]);

  const checkAndRefillLives = useCallback(() => {
    if (!currentUser || !isMountedRef.current) return;
    const key = getLivesStorageKey();
    const now = Date.now();
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const secondsPassed = (now - data.lastRefillTime) / 1000;
        if (secondsPassed >= REFILL_TIME && data.lives < maxLives) {
          const newLives = Math.min(data.lives + 1, maxLives);
          setLives(newLives); livesRef.current = newLives;
          setLastRefillTime(now); lastRefillTimeRef.current = now;
          localStorage.setItem(key, JSON.stringify({ lives: newLives, lastRefillTime: now }));
        } else {
          setLives(data.lives); livesRef.current = data.lives;
          setLastRefillTime(data.lastRefillTime); lastRefillTimeRef.current = data.lastRefillTime;
        }
      } catch (e) {
        setLives(maxLives); livesRef.current = maxLives;
        setLastRefillTime(Date.now()); lastRefillTimeRef.current = Date.now();
      }
    } else {
      setLives(maxLives); livesRef.current = maxLives;
      setLastRefillTime(Date.now()); lastRefillTimeRef.current = Date.now();
      localStorage.setItem(key, JSON.stringify({ lives: maxLives, lastRefillTime: Date.now() }));
    }
  }, [currentUser, maxLives, getLivesStorageKey]);

  const updateTimeRemaining = useCallback(() => {
    if (!currentUser || !isMountedRef.current) return;
    if (livesRef.current >= maxLives) { setTimeRemaining(''); return; }
    const now = Date.now();
    const elapsed = (now - lastRefillTimeRef.current) / 1000;
    if (elapsed < REFILL_TIME) {
      const remaining = REFILL_TIME - elapsed;
      const minutes = Math.floor(remaining / 60);
      const seconds = Math.floor(remaining % 60);
      setTimeRemaining(`${minutes}m ${seconds.toString().padStart(2, '0')}s`);
    } else { checkAndRefillLives(); setTimeRemaining(''); }
  }, [currentUser, maxLives, checkAndRefillLives]);

  useEffect(() => {
    if (currentUser && isUserLoaded) {
      isMountedRef.current = true;
      checkAndRefillLives();
      setTimeout(updateTimeRemaining, 100);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(updateTimeRemaining, 1000);
      return () => {
        isMountedRef.current = false;
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      };
    }
  }, [currentUser, isUserLoaded, checkAndRefillLives, updateTimeRemaining]);

  useEffect(() => {
    if (currentUser && gameState !== 'intro') {
      localStorage.setItem(getLivesStorageKey(), JSON.stringify({ lives, lastRefillTime }));
    }
  }, [lives, lastRefillTime, gameState, currentUser, getLivesStorageKey]);

  useEffect(() => {
    if (currentUser && isUserLoaded) {
      const savedStats = localStorage.getItem(getStatsStorageKey());
      if (savedStats) { try { setStats(JSON.parse(savedStats)); } catch (e) {} }
      const savedLB = localStorage.getItem(getLeaderboardStorageKey());
      if (savedLB) { try { setLeaderboardData(JSON.parse(savedLB)); } catch (e) {} }
    }
  }, [currentUser, isUserLoaded, getStatsStorageKey, getLeaderboardStorageKey]);

  useEffect(() => () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); }, []);

  const initAudio = () => {
    try {
      if (!audioCtx.current) {
        audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
        gainNode.current = audioCtx.current.createGain();
        gainNode.current.gain.value = isMuted ? 0 : 0.4;
        gainNode.current.connect(audioCtx.current.destination);
      }
      if (audioCtx.current.state === 'suspended') audioCtx.current.resume();
      return true;
    } catch (e) { return false; }
  };

  const playTone = (freq, dur = 0.2, type = 'sine') => {
    if (isMuted) return;
    try {
      initAudio();
      if (!audioCtx.current || !gainNode.current) return;
      const osc = audioCtx.current.createOscillator();
      const gain = audioCtx.current.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.current.currentTime);
      gain.gain.setValueAtTime(0.4, audioCtx.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.current.currentTime + dur);
      osc.connect(gain); gain.connect(gainNode.current);
      osc.start(); osc.stop(audioCtx.current.currentTime + dur);
    } catch (e) {}
  };

  const playCorrectSound = () => { if (isMuted) return; playTone(523.25, 0.12); setTimeout(() => playTone(659.25, 0.12), 120); setTimeout(() => playTone(783.99, 0.15), 240); setTimeout(() => playTone(1046.5, 0.2), 360); };
  const playWrongSound = () => { if (isMuted) return; playTone(150, 0.4, 'sawtooth'); setTimeout(() => playTone(120, 0.3, 'sawtooth'), 200); };
  const playGameOverSound = () => { if (isMuted) return; playTone(400, 0.2, 'sawtooth'); setTimeout(() => playTone(300, 0.2, 'sawtooth'), 200); setTimeout(() => playTone(200, 0.3, 'sawtooth'), 400); };
  const playLevelUpSound = () => { if (isMuted) return; playTone(440, 0.1); setTimeout(() => playTone(554.37, 0.1), 100); setTimeout(() => playTone(659.25, 0.15), 200); setTimeout(() => playTone(880, 0.2), 300); };
  const playHintSound = () => { if (isMuted) return; playTone(660, 0.08); setTimeout(() => playTone(880, 0.12), 80); };
  const playDiamondSound = () => { if (isMuted) return; playTone(880, 0.08); setTimeout(() => playTone(1100, 0.1), 80); setTimeout(() => playTone(1320, 0.15), 160); };
  const playBuySound = () => { if (isMuted) return; playTone(523.25, 0.1); setTimeout(() => playTone(783.99, 0.12), 100); setTimeout(() => playTone(1046.5, 0.18), 220); };
  const playCompletionFanfare = () => {
    [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00].forEach((f, i) => {
      setTimeout(() => playTone(f, 0.25), i * 130);
    });
  };

  useEffect(() => {
    if (!isMuted && gameState !== 'intro') backgroundMusic.start('gameplay');
    return () => backgroundMusic.stop();
  }, [isMuted, gameState]);

  const createWordPuzzle = (pair, level) => {
    const config = LEVEL_CONFIG[level] || LEVEL_CONFIG['A1'];
    const word = pair.word.toUpperCase();
    const ratio = 0.65 + Math.random() * 0.15;
    let numBlanks = Math.round(word.length * ratio);
    numBlanks = Math.max(3, Math.min(numBlanks, word.length - 1));
    const { visiblePositions, blankPositions } = generateBlankPositions(word, numBlanks);
    return {
      ...pair, word, wordDisplay: word, blankPositions, visiblePositions,
      letters: word.split(''), letterOptions: generateLetterOptions(word),
      level, timer: config.timer
    };
  };

  const generateQuestions = (level) => {
    const words = getWordsByLevel(level);
    let selected = [];
    if (words.length >= QUESTIONS_PER_LEVEL) {
      selected = [...words].sort(() => Math.random() - 0.5).slice(0, QUESTIONS_PER_LEVEL);
    } else {
      const shuffled = [...words].sort(() => Math.random() - 0.5);
      while (selected.length < QUESTIONS_PER_LEVEL) selected = [...selected, ...shuffled];
      selected = selected.slice(0, QUESTIONS_PER_LEVEL);
    }
    return selected.map(pair => createWordPuzzle(pair, level));
  };

  const getNextUnansweredQuestion = () => {
    if (retryQuestion && retryPhase) return retryQuestion;
    const unanswered = questions.filter(q => !answeredQuestions.includes(q.id));
    return unanswered.length === 0 ? null : unanswered[0];
  };

  const checkIfAllAnswered = () => answeredQuestions.length >= questions.length && questions.length === QUESTIONS_PER_LEVEL;

  const performLevelUp = () => {
    const currentIndex = CEFR_LEVELS.indexOf(currentLevel);
    setHintsUsedThisLevel(0);

    if (currentIndex === CEFR_LEVELS.length - 1) {
      if (!completionBonusSavedRef.current && currentUser) {
        completionBonusSavedRef.current = true;
        setCompletionBonus(COMPLETION_BONUS_DIAMONDS);
        playCompletionFanfare();
        (async () => {
          try {
            const userRef = doc(db, 'users', currentUser.uid);
            const userDoc = await getDoc(userRef);
            const current = userDoc.data()?.totalDiamonds || 0;
            const newTotal = current + COMPLETION_BONUS_DIAMONDS;
            await updateDoc(userRef, { totalDiamonds: newTotal });
            setLocalDiamonds(newTotal);
          } catch (err) { console.error('Error awarding bonus:', err); }
        })();
      }
      setTimerRunning(false);
      setGameState('finished');
      return;
    }

    const newLevel = CEFR_LEVELS[currentIndex + 1];
    setCurrentLevel(newLevel); setAnsweredInLevel(0); setAnsweredQuestions([]);
    setRetryQuestion(null); setWrongQuestions([]); wrongQueueRef.current = [];
    setRetryPhase(false); setRetryIndex(0);

    const config = LEVEL_CONFIG[newLevel];
    const newQuestions = generateQuestions(newLevel);
    setQuestions(newQuestions); setCurrentQuestionIndex(0);
    setTimer(config.timer); setTimerRunning(true); setAnswered(false);
    setHintUsed(false); setShowCorrectAnimation(false);
    setBlankPositions(newQuestions[0]?.blankPositions || []);
    setVisiblePositions(newQuestions[0]?.visiblePositions || []);
    setAvailableLetters(newQuestions[0]?.letterOptions || []);
    setUserFilledBlanks({}); setUsedLetters([]);

    setFeedbackMessage(`⬆️ LEVEL UP! ${config.emoji} ${config.label}`);
    setShowFeedback(true); setTimeout(() => setShowFeedback(false), 2500);
    playLevelUpSound();
  };

  const retryNextWrongQuestion = () => {
    const queue = wrongQueueRef.current;
    if (queue.length === 0) {
      setRetryPhase(false); setWrongQuestions([]); setRetryIndex(0);
      setRetryQuestion(null); performLevelUp(); saveProgressOnLevelUp();
      return;
    }
    const wrongQ = queue[0];
    const qIndex = questions.findIndex(q => q.id === wrongQ.id);
    if (qIndex === -1) {
      queue.shift(); setWrongQuestions([...queue]);
      setTimeout(retryNextWrongQuestion, 100); return;
    }
    setCurrentQuestionIndex(qIndex); setAnswered(false);
    setRetryQuestion(wrongQ); setAnsweredInLevel(0);
    setFeedbackMessage(`🔄 Retry: ${wrongQ.word} (${queue.length} left)`);
    setShowFeedback(true); setTimeout(() => setShowFeedback(false), 1500);
    const config = LEVEL_CONFIG[currentLevel] || LEVEL_CONFIG['A1'];
    setTimer(config.timer); setTimerRunning(true); setHintUsed(false);
    setBlankPositions(wrongQ.blankPositions); setVisiblePositions(wrongQ.visiblePositions);
    setUserFilledBlanks({}); setAvailableLetters(wrongQ.letterOptions || []);
    setUsedLetters([]);
  };

  const startRetryPhase = () => {
    if (wrongQueueRef.current.length === 0) { performLevelUp(); saveProgressOnLevelUp(); return; }
    setAnsweredInLevel(0); setRetryPhase(true); setRetryIndex(0);
    setFeedbackMessage(`🔄 Retry Phase! ${wrongQueueRef.current.length} wrong!`);
    setShowFeedback(true);
    setTimeout(() => { setShowFeedback(false); retryNextWrongQuestion(); }, 2000);
    playTone(440, 0.2);
  };

  const handleRetryAnswer = (isCorrect) => {
    const queue = wrongQueueRef.current;
    if (queue.length === 0) {
      setRetryPhase(false); setRetryQuestion(null); performLevelUp(); saveProgressOnLevelUp();
      return;
    }
    queue.shift(); setWrongQuestions([...queue]); setRetryIndex(0);
    if (isCorrect) { setFeedbackMessage(`✅ Correct! 🎉`); playCorrectSound(); }
    else { setFeedbackMessage(`❌ Still wrong!`); playWrongSound(); }
    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
      if (wrongQueueRef.current.length > 0) retryNextWrongQuestion();
      else {
        setRetryPhase(false); setWrongQuestions([]); setRetryIndex(0);
        setRetryQuestion(null); performLevelUp(); saveProgressOnLevelUp();
      }
    }, 1500);
  };

  const checkWord = async () => {
    if (answered || lives <= 0 || !currentQuestion) return;
    setTimerRunning(false); setAnswered(true);

    if (retryPhase && retryQuestion) {
      const word = currentQuestion.word;
      const blanks = currentQuestion.blankPositions || [];
      const filledWord = word.split('').map((letter, index) => blanks.includes(index) ? (userFilledBlanks[index] || '_') : letter).join('');
      const allFilled = blanks.every(pos => userFilledBlanks[pos] !== undefined);
      handleRetryAnswer(filledWord === word && allFilled);
      return;
    }

    const word = currentQuestion.word;
    const blanks = currentQuestion.blankPositions || [];
    const filledWord = word.split('').map((letter, index) => blanks.includes(index) ? (userFilledBlanks[index] || '_') : letter).join('');
    const allFilled = blanks.every(pos => userFilledBlanks[pos] !== undefined);
    const isCorrect = filledWord === word && allFilled;

    if (!answeredWordsRef.current.includes(word)) answeredWordsRef.current.push(word);

    if (isCorrect) {
      if (!answeredQuestions.includes(currentQuestion.id)) {
        setAnsweredQuestions(prev => [...prev, currentQuestion.id]);
        setAnsweredInLevel(prev => prev + 1); setQuestionNumber(prev => prev + 1);
      }
      const newStreak = streak + 1; setStreak(newStreak);
      setFeedbackMessage(`✅ Correct! (${newStreak}x streak)`);
      const newCombo = comboCount + 1; setComboCount(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);
      setCorrectCount(prev => prev + 1);
      setScore(prev => prev + 1);
      playCorrectSound(); setShowCorrectAnimation(true);
      setTimeout(() => setShowCorrectAnimation(false), 500);
    } else {
      setStreak(0); setComboCount(0);
      const missing = blanks.filter(pos => userFilledBlanks[pos] === undefined);
      if (!answeredQuestions.includes(currentQuestion.id) && !wrongQueueRef.current.some(q => q.id === currentQuestion.id)) {
        wrongQueueRef.current.push(currentQuestion);
        setWrongQuestions([...wrongQueueRef.current]);
      }
      if (!answeredQuestions.includes(currentQuestion.id)) {
        setAnsweredQuestions(prev => [...prev, currentQuestion.id]);
        setAnsweredInLevel(prev => prev + 1); setQuestionNumber(prev => prev + 1);
      }
      playWrongSound();
      const newLives = livesRef.current - 1;
      livesRef.current = newLives;
      setLives(newLives);
      
      if (newLives === 0) {
        setFeedbackMessage(`💀 Out of Hearts!`);
        setShowNoLivesMessage(true);
        setTimeout(() => { setGameState('gameover'); setShowFeedback(false); playGameOverSound(); }, 2000);
      } else {
        setFeedbackMessage(`❌ Wrong! ${missing.length} blank(s) left. ${newLives} ❤️`);
      }
    }
    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
      if (livesRef.current > 0 && gameStateRef.current === 'playing') generateNextQuestion();
    }, 1500);
  };

  const saveGameToFirebase = useCallback(async () => {
    if (!currentUser) return;
    const gameData = {
      gameType: 'synoQuest', pointsEarned: score || 0,
      newWordsLearned: correctCount || 0, correctAnswers: correctCount || 0,
      totalQuestions: questionNumber || 0,
      won: (correctCount || 0) >= (questionNumber || 0) / 2,
      score: score || 0, levelReached: currentLevel
    };
    try { await updateUserStats(currentUser.uid, gameData); }
    catch (error) { console.error('Error saving to Firebase:', error); }
  }, [currentUser, questionNumber, correctCount, score, currentLevel]);

  useEffect(() => { saveGameToFirebaseRef.current = saveGameToFirebase; }, [saveGameToFirebase]);

  const saveProgressOnLevelUp = async () => {
    if (!currentUser) return;
    const gameData = {
      gameType: 'synoQuest', pointsEarned: score || 0,
      newWordsLearned: Math.min(correctCount || 0, 5), correctAnswers: correctCount || 0,
      totalQuestions: questionNumber || 10, won: true,
      score: score || 0, levelReached: currentLevel
    };
    try { await updateUserStats(currentUser.uid, gameData); }
    catch (error) { console.error('Error saving on level up:', error); }
  };

  const generateNextQuestion = () => {
    if (livesRef.current <= 0) return;
    if (checkIfAllAnswered()) {
      if (wrongQueueRef.current.length > 0) startRetryPhase();
      else { performLevelUp(); saveProgressOnLevelUp(); }
      return;
    }
    const nextQ = getNextUnansweredQuestion();
    if (!nextQ) {
      if (checkIfAllAnswered()) {
        if (wrongQueueRef.current.length > 0) startRetryPhase();
        else { performLevelUp(); saveProgressOnLevelUp(); }
      }
      return;
    }
    const nextIndex = questions.findIndex(q => q.id === nextQ.id);
    if (nextIndex !== -1) {
      setCurrentQuestionIndex(nextIndex);
      const config = LEVEL_CONFIG[currentLevel] || LEVEL_CONFIG['A1'];
      setTimer(config.timer); setTimerRunning(true); setAnswered(false);
      setBlankPositions(nextQ.blankPositions); setVisiblePositions(nextQ.visiblePositions);
      setUserFilledBlanks({}); setAvailableLetters(nextQ.letterOptions || []);
      setUsedLetters([]); setHintUsed(false); setShowCorrectAnimation(false);
      setRetryQuestion(null);
    }
  };

  const startGame = () => {
    if (!currentUser) {
      setFeedbackMessage('⚠️ Please log in to play!');
      setShowFeedback(true); setTimeout(() => setShowFeedback(false), 3000);
      return;
    }
    if (lives <= 0) { setShowHeartShop(true); return; }
    setGameState('loading');
    setTimeout(() => {
      setScore(0); setCorrectCount(0); setComboCount(0); setMaxCombo(0);
      setStreak(0); setQuestionNumber(0); setAnswered(false); setHintUsed(false);
      setCurrentLevel('A1'); setAnsweredInLevel(0); setAnsweredQuestions([]);
      setRetryQuestion(null); setWrongQuestions([]); wrongQueueRef.current = [];
      setRetryPhase(false); setRetryIndex(0);
      setUserFilledBlanks({}); setUsedLetters([]);
      setHintsUsedThisLevel(0);
      setDiamondsEarnedThisGame(0);
      setContinueFromGameOver(false);
      setCompletionBonus(0);
      sessionSavedRef.current = false;
      firebaseSavedRef.current = false;
      diamondSavedRef.current = false;
      progressSavedRef.current = false;
      completionBonusSavedRef.current = false;
      answeredWordsRef.current = [];
      const newQuestions = generateQuestions('A1');
      setQuestions(newQuestions); setCurrentQuestionIndex(0);
      setBlankPositions(newQuestions[0]?.blankPositions || []);
      setVisiblePositions(newQuestions[0]?.visiblePositions || []);
      setAvailableLetters(newQuestions[0]?.letterOptions || []);
      setTimer(LEVEL_CONFIG['A1'].timer); setTimerRunning(true);
      setGameState('playing'); setShowNoLivesMessage(false);
    }, 2000);
  };

  const currentQuestion = questions[currentQuestionIndex];

  const useHint = async () => {
    if (hintUsed || !currentQuestion || answered || lives <= 0) return;
    const cost = getHintCost(hintsUsedThisLevel);
    const isFree = cost === 0;
    if (!isFree && localPoints < cost) {
      setFeedbackMessage(`❌ Need ${cost} pts (you have ${localPoints})`);
      setShowFeedback(true); setTimeout(() => setShowFeedback(false), 2500);
      playWrongSound(); return;
    }
    if (!isFree && currentUser) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const newPoints = localPoints - cost;
        await updateDoc(userRef, { totalPoints: newPoints });
        setLocalPoints(newPoints);
        if (onPointsChange) onPointsChange(newPoints);
      } catch (err) {
        setFeedbackMessage('❌ Failed to use hint.');
        setShowFeedback(true); setTimeout(() => setShowFeedback(false), 2000); return;
      }
    }
    setHintsUsedThisLevel(prev => prev + 1);
    setHintUsed(true);
    const blanks = currentQuestion.blankPositions || [];
    const word = currentQuestion.word;
    const firstBlank = blanks.find(pos => userFilledBlanks[pos] === undefined);
    if (firstBlank !== undefined) {
      const letter = word[firstBlank];
      setUserFilledBlanks({ ...userFilledBlanks, [firstBlank]: letter });
      const letterIndex = availableLetters.findIndex((l, idx) => l === letter && !usedLetters.includes(idx));
      if (letterIndex !== -1) setUsedLetters([...usedLetters, letterIndex]);
    }
    setFeedbackMessage(isFree ? '💡 Free hint used!' : `💡 -${cost} pts (Balance: ${localPoints - cost})`);
    setShowFeedback(true); setTimeout(() => setShowFeedback(false), 2000);
    setTimer(prev => Math.max(1, prev - 3));
    playHintSound();
  };

  const handleLetterClick = (letter, index) => {
    if (answered || lives <= 0 || timer === 0 || !currentQuestion) return;
    if (usedLetters.includes(index)) return;
    const blanks = currentQuestion.blankPositions || [];
    const firstEmpty = blanks.find(pos => userFilledBlanks[pos] === undefined);
    if (firstEmpty !== undefined) {
      setUserFilledBlanks({ ...userFilledBlanks, [firstEmpty]: letter });
      setUsedLetters([...usedLetters, index]);
    }
  };

  const handleBlankClick = (position) => {
    if (answered || lives <= 0 || timer === 0 || !currentQuestion) return;
    if (userFilledBlanks[position] === undefined) return;
    const letter = userFilledBlanks[position];
    const newFilled = { ...userFilledBlanks };
    delete newFilled[position];
    setUserFilledBlanks(newFilled);
    const letterIndex = availableLetters.findIndex((l, idx) => l === letter && !usedLetters.includes(idx));
    if (letterIndex !== -1) setUsedLetters(usedLetters.filter(idx => idx !== letterIndex));
  };

  const handleBuyHearts = async (heartPackage) => {
    if (!currentUser || heartShopProcessing) return;
    if (localDiamonds < heartPackage.diamonds) {
      setFeedbackMessage(`❌ Not enough diamonds! Need ${heartPackage.diamonds} 💎`);
      setShowFeedback(true); setTimeout(() => setShowFeedback(false), 2500);
      playWrongSound(); return;
    }
    setHeartShopProcessing(true);
    try {
      const result = await spendDiamonds(currentUser.uid, heartPackage.diamonds);
      if (!result.success) {
        setFeedbackMessage('❌ Purchase failed.');
        setShowFeedback(true); setTimeout(() => setShowFeedback(false), 2000);
        setHeartShopProcessing(false); return;
      }
      setLocalDiamonds(result.newBalance);
      const newLives = Math.min(livesRef.current + heartPackage.hearts, maxLives);
      setLives(newLives); livesRef.current = newLives;
      setLastRefillTime(Date.now()); lastRefillTimeRef.current = Date.now();
      localStorage.setItem(getLivesStorageKey(), JSON.stringify({ lives: newLives, lastRefillTime: Date.now() }));
      playBuySound();
      setShowHeartShop(false);
      setShowNoLivesMessage(false);

      if (continueFromGameOver) {
        firebaseSavedRef.current = false;
        diamondSavedRef.current = false;
        progressSavedRef.current = false;
        sessionSavedRef.current = false;

        setAnswered(false);
        setShowCorrectAnimation(false);
        setHintUsed(false);
        setShowFeedback(false);

        setGameState('playing');

        setFeedbackMessage(`💎 -${heartPackage.diamonds} | +${heartPackage.hearts} ❤️ — Continue!`);
        setShowFeedback(true); setTimeout(() => setShowFeedback(false), 2500);

        setTimeout(() => {
          if (gameStateRef.current === 'playing') {
            generateNextQuestion();
          }
        }, 400);
      } else {
        setFeedbackMessage(`💎 -${heartPackage.diamonds} | +${heartPackage.hearts} ❤️`);
        setShowFeedback(true); setTimeout(() => setShowFeedback(false), 2500);
      }
    } catch (err) {
      console.error('Error buying hearts:', err);
      setFeedbackMessage('❌ Purchase failed.');
      setShowFeedback(true); setTimeout(() => setShowFeedback(false), 2000);
    } finally { setHeartShopProcessing(false); }
  };

  const openHeartShopFromGameOver = () => { setContinueFromGameOver(true); setShowHeartShop(true); };
  const giveUpGame = () => { setContinueFromGameOver(false); setGameState('intro'); };

  useEffect(() => {
    if (isUserLoaded && currentUser) {
      const newQuestions = generateQuestions('A1');
      setQuestions(newQuestions); setCurrentQuestionIndex(0);
      setScore(0); setCorrectCount(0); setComboCount(0); setMaxCombo(0); setStreak(0);
      setAnswered(false); setHintUsed(false);
      setTimer(LEVEL_CONFIG['A1'].timer); setTimerRunning(false);
      setGameState('intro'); setShowNoLivesMessage(false);
      setCurrentLevel('A1'); setQuestionNumber(0); setAnsweredInLevel(0);
      setAnsweredQuestions([]); setRetryQuestion(null); setWrongQuestions([]);
      wrongQueueRef.current = []; setRetryPhase(false); setRetryIndex(0);
      setBlankPositions([]); setVisiblePositions([]);
      setUserFilledBlanks({}); setAvailableLetters([]); setUsedLetters([]);
      setHintsUsedThisLevel(0);
      setDiamondsEarnedThisGame(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUserLoaded, currentUser]);

  useEffect(() => {
    if (gameState === 'playing' && currentQuestion && !answered && livesRef.current > 0) {
      if (answeredQuestions.includes(currentQuestion.id) && !retryQuestion) {
        generateNextQuestion(); return;
      }
      const config = LEVEL_CONFIG[currentLevel] || LEVEL_CONFIG['A1'];
      setTimer(config.timer); setTimerRunning(true); setHintUsed(false);
      setBlankPositions(currentQuestion.blankPositions || []);
      setVisiblePositions(currentQuestion.visiblePositions || []);
      setUserFilledBlanks({}); setAvailableLetters(currentQuestion.letterOptions || []);
      setUsedLetters([]);
    } else if (livesRef.current <= 0) {
      setTimerRunning(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, gameState, answered]);

  useEffect(() => {
    if (livesRef.current <= 0) { setTimerRunning(false); return; }
    if (timerRunning && timer > 0) {
      const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && timerRunning) {
      setAnswered(true); setTimerRunning(false);
      if (!currentQuestion) { generateNextQuestion(); return; }
      if (!answeredWordsRef.current.includes(currentQuestion.word)) answeredWordsRef.current.push(currentQuestion.word);
      if (!answeredQuestions.includes(currentQuestion.id)) {
        if (!wrongQueueRef.current.some(q => q.id === currentQuestion.id)) {
          wrongQueueRef.current.push(currentQuestion);
          setWrongQuestions([...wrongQueueRef.current]);
        }
        setAnsweredQuestions(prev => [...prev, currentQuestion.id]);
        setAnsweredInLevel(prev => prev + 1); setQuestionNumber(prev => prev + 1);
      }
      setStreak(0); setComboCount(0); playWrongSound();
      
      const newLives = livesRef.current - 1;
      livesRef.current = newLives;
      setLives(newLives);
      
      if (newLives === 0) {
        setFeedbackMessage(`⏰ Out of Hearts!`);
        setShowNoLivesMessage(true);
        setTimeout(() => { setGameState('gameover'); setShowFeedback(false); playGameOverSound(); }, 2000);
      } else {
        setFeedbackMessage(`⏰ Time's up! ${newLives} ❤️`);
      }
      setShowFeedback(true);
      setTimeout(() => {
        setShowFeedback(false);
        if (livesRef.current > 0 && gameStateRef.current === 'playing') generateNextQuestion();
      }, 1500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer, timerRunning]);

  useEffect(() => {
    if (gameState !== 'gameover' && gameState !== 'finished') return;

    if (!firebaseSavedRef.current && currentUser) {
      firebaseSavedRef.current = true;
      if (saveGameToFirebaseRef.current) saveGameToFirebaseRef.current();
    }

    if (!diamondSavedRef.current && currentUser) {
      diamondSavedRef.current = true;
      const accuracy = questionNumber > 0 ? Math.round((correctCount / questionNumber) * 100) : 0;
      claimGameDiamonds(currentUser.uid, 'synoQuest', accuracy).then((result) => {
        if (result.earned > 0) {
          setDiamondsEarnedThisGame(result.earned);
          setLocalDiamonds(result.newBalance);
          playDiamondSound();
        }
      }).catch(err => console.error('Error claiming diamonds:', err));
    }

    if (!progressSavedRef.current && currentUser) {
      progressSavedRef.current = true;
      const totalQuestions = questionNumber || 0;
      const correctAnswers = correctCount || 0;
      const wordsList = [...answeredWordsRef.current];
      const saved = localStorage.getItem('vocaboplay_progress');
      const currentProgress = saved ? JSON.parse(saved) : {};
      const today = new Date().toDateString();
      const lastPlayed = localStorage.getItem('vocaboplay_lastPlayed');
      let newStreak = currentProgress.streak || 0;
      if (!lastPlayed || lastPlayed !== today) {
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
        if (lastPlayed === yesterday.toDateString()) newStreak = (currentProgress.streak || 0) + 1;
        else newStreak = 1;
        localStorage.setItem('vocaboplay_lastPlayed', today);
      }
      
      const progressFn = updateProgressRef.current;
      const recordFn = recordGameRef.current;
      
      if (progressFn) {
        progressFn({
          gamesPlayed: 1, totalPoints: score, xp: score, wordsLearned: correctCount,
          totalAnswers: totalQuestions, correctAnswers, streak: newStreak,
          SynoQuest: { gamesCompleted: 1, correctAnswers, totalQuestions }
        }).then(() => {
          if (recordFn) recordFn('synoquest', score, correctCount, totalQuestions, wordsList);
        }).catch(err => console.error('Error saving progress:', err));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  const handleExitGame = async () => {
    if (gameState !== 'intro' && gameState !== 'loading') {
      if (!firebaseSavedRef.current && currentUser && saveGameToFirebaseRef.current) {
        firebaseSavedRef.current = true;
        await saveGameToFirebaseRef.current();
      }
      if (!progressSavedRef.current && currentUser) {
        progressSavedRef.current = true;
        const totalQuestions = questionNumber || 0;
        const correctAnswers = correctCount || 0;
        const wordsList = [...answeredWordsRef.current];
        const progressFn = updateProgressRef.current;
        const recordFn = recordGameRef.current;
        if (progressFn) {
          progressFn({
            gamesPlayed: 1, totalPoints: score, xp: score, wordsLearned: correctCount,
            totalAnswers: totalQuestions, correctAnswers,
            SynoQuest: { gamesCompleted: 1, correctAnswers, totalQuestions }
          }).then(() => { if (recordFn) recordFn('synoquest', score, correctCount, totalQuestions, wordsList); })
            .catch(err => console.error('Error saving on exit:', err));
        }
      }
    }
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    setShowExitConfirm(false);
    setShowSettings(false);
    backgroundMusic.stop();
    if (onExitToGames) {
      onExitToGames();
    } else if (onBack) {
      onBack();
    }
  };

  const cancelExit = () => setShowExitConfirm(false);

  const showDevPanel = typeof window !== 'undefined' && window.location.search.includes('dev=1');

  const devJumpToLevel = (level) => {
    setScore(0);
    setCorrectCount(0);
    setComboCount(0);
    setMaxCombo(0);
    setStreak(0);
    setQuestionNumber(0);
    setAnswered(false);
    setHintUsed(false);
    setAnsweredInLevel(0);
    setAnsweredQuestions([]);
    setRetryQuestion(null);
    setWrongQuestions([]);
    wrongQueueRef.current = [];
    setRetryPhase(false);
    setRetryIndex(0);
    setUserFilledBlanks({});
    setUsedLetters([]);
    setHintsUsedThisLevel(0);
    setDiamondsEarnedThisGame(0);
    setContinueFromGameOver(false);
    setCompletionBonus(0);
    sessionSavedRef.current = false;
    firebaseSavedRef.current = false;
    diamondSavedRef.current = false;
    progressSavedRef.current = false;
    completionBonusSavedRef.current = false;
    answeredWordsRef.current = [];

    const newQuestions = generateQuestions(level);
    setQuestions(newQuestions);
    setCurrentQuestionIndex(0);
    setCurrentLevel(level);
    setBlankPositions(newQuestions[0]?.blankPositions || []);
    setVisiblePositions(newQuestions[0]?.visiblePositions || []);
    setAvailableLetters(newQuestions[0]?.letterOptions || []);
    const config = LEVEL_CONFIG[level] || LEVEL_CONFIG['A1'];
    setTimer(config.timer);
    setTimerRunning(true);
    setGameState('playing');
    setShowNoLivesMessage(false);

    setLives(maxLives); livesRef.current = maxLives;
    const key = getLivesStorageKey();
    localStorage.setItem(key, JSON.stringify({ lives: maxLives, lastRefillTime: Date.now() }));
    setLastRefillTime(Date.now()); lastRefillTimeRef.current = Date.now();
  };

  const devForceLevelUp = (from, to) => {
    devJumpToLevel(to);
  };

  const devForceGameOver = () => {
    setGameState('gameover');
    setShowNoLivesMessage(false);
  };

  const devForceFinished = () => {
    if (!completionBonusSavedRef.current && currentUser) {
      completionBonusSavedRef.current = true;
      setCompletionBonus(COMPLETION_BONUS_DIAMONDS);
      playCompletionFanfare();
      (async () => {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userRef);
          const cur = userDoc.data()?.totalDiamonds || 0;
          const newTotal = cur + COMPLETION_BONUS_DIAMONDS;
          await updateDoc(userRef, { totalDiamonds: newTotal });
          setLocalDiamonds(newTotal);
        } catch (err) { console.error('Error awarding bonus:', err); }
      })();
    }
    setGameState('finished');
  };

  const DevPanelElement = () => {
    if (!showDevPanel) return null;
    return (
      <SynoQuestDevPanel
        currentLevel={currentLevel}
        onJumpToLevel={devJumpToLevel}
        onForceLevelUp={devForceLevelUp}
        onForceGameOver={devForceGameOver}
        onForceFinished={devForceFinished}
      />
    );
  };

  const ExitConfirmModal = () => (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(42, 40, 69, 0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
      <div className="sq-modal-card" style={{ background: palette.white, borderRadius: '18px', padding: '28px', maxWidth: '340px', width: '100%', textAlign: 'center', border: `1.5px solid ${palette.border}`, boxShadow: '0 20px 50px rgba(42, 40, 69, 0.3)' }}>
        <div className="sq-modal-emoji" style={{ fontSize: '40px', marginBottom: '8px' }}>❌</div>
        <h3 style={{ fontSize: '18px', fontWeight: '800', color: palette.deepNavy, marginBottom: '6px', fontFamily: FONT_DISPLAY }}>Exit Game?</h3>
        <p style={{ fontSize: '13px', color: palette.bodyTextSoft, marginBottom: '20px', fontFamily: FONT_BODY, fontWeight: 600 }}>Your progress will be saved.</p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={confirmExit} className="sq-modal-btn" style={{ flex: 1, padding: '10px', background: palette.danger, color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '800', fontFamily: FONT_DISPLAY, boxShadow: `0 3px 0 ${palette.dangerShadow}` }}>Yes, End</button>
          <button onClick={cancelExit} className="sq-modal-btn" style={{ flex: 1, padding: '10px', background: palette.creamSoft, color: palette.deepNavy, border: `1.5px solid ${palette.border}`, borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '800', fontFamily: FONT_DISPLAY }}>Cancel</button>
        </div>
      </div>
    </div>
  );

  const HeartShopModal = () => (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(42, 40, 69, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2500, padding: '20px' }}>
      <div className="sq-modal-card" style={{ background: palette.white, borderRadius: '20px', padding: '28px 24px', maxWidth: '460px', width: '100%', border: `1.5px solid ${palette.border}`, boxShadow: '0 20px 50px rgba(42, 40, 69, 0.4)' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div className="sq-modal-emoji" style={{ fontSize: '48px', marginBottom: '4px' }}>❤️</div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: palette.deepNavy, marginBottom: '4px', fontFamily: FONT_DISPLAY }}>
            {continueFromGameOver ? 'Continue Playing?' : 'Refill Hearts'}
          </h2>
          <p style={{ fontSize: '13px', color: palette.bodyTextSoft, fontWeight: 600, fontFamily: FONT_BODY }}>
            {continueFromGameOver ? `You have ${questionNumber} questions completed. Buy hearts to continue!` : 'Buy hearts with diamonds to keep playing'}
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
          <div style={{ background: `linear-gradient(135deg, ${palette.diamond}20, ${palette.diamond}10)`, padding: '10px 20px', borderRadius: '12px', border: `1.5px solid ${palette.diamond}60`, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>💎</span>
            <span style={{ fontSize: '18px', fontWeight: '800', color: palette.diamond, fontFamily: FONT_DISPLAY }}>{localDiamonds}</span>
            <span style={{ fontSize: '11px', color: palette.bodyTextSoft, fontWeight: 600, fontFamily: FONT_BODY }}>diamonds</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          {HEART_PRICES.map((pkg) => {
            const canAfford = localDiamonds >= pkg.diamonds;
            return (
              <button key={pkg.id} onClick={() => handleBuyHearts(pkg)} disabled={!canAfford || heartShopProcessing}
                className="sq-modal-price-btn"
                style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '14px', border: `2px solid ${pkg.popular ? palette.warmOrange : canAfford ? palette.border : `${palette.danger}40`}`, background: pkg.popular ? `linear-gradient(135deg, ${palette.warmOrange}10, ${palette.coral}10)` : canAfford ? palette.creamSoft : `${palette.danger}08`, cursor: canAfford && !heartShopProcessing ? 'pointer' : 'not-allowed', opacity: heartShopProcessing ? 0.5 : 1, fontFamily: FONT_DISPLAY }}>
                {pkg.popular && (<div style={{ position: 'absolute', top: '-8px', right: '12px', background: palette.warmOrange, color: 'white', fontSize: '9px', fontWeight: '800', padding: '2px 8px', borderRadius: '6px' }}>POPULAR</div>)}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '28px' }}>❤️</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: palette.deepNavy, fontFamily: FONT_DISPLAY }}>{pkg.label}</div>
                    <div style={{ fontSize: '10px', color: palette.bodyTextSoft, fontWeight: 600, fontFamily: FONT_BODY }}>{pkg.sublabel}</div>
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
          <button onClick={() => { setShowHeartShop(false); setContinueFromGameOver(false); }} className="sq-modal-btn" style={{ flex: 1, padding: '12px', borderRadius: '12px', border: `1.5px solid ${palette.border}`, background: palette.creamSoft, color: palette.bodyText, cursor: 'pointer', fontSize: '13px', fontWeight: '800', fontFamily: FONT_DISPLAY }}>Cancel</button>
          {continueFromGameOver && (
            <button onClick={() => { setShowHeartShop(false); setContinueFromGameOver(false); giveUpGame(); }} className="sq-modal-btn" style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: palette.danger, color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '800', fontFamily: FONT_DISPLAY, boxShadow: `0 3px 0 ${palette.dangerShadow}` }}>Give Up</button>
          )}
        </div>
        <p style={{ fontSize: '10px', color: palette.bodyTextSoft, textAlign: 'center', marginTop: '12px', fontFamily: FONT_BODY, fontWeight: 600 }}>💡 Earn diamonds by playing with high accuracy!</p>
      </div>
    </div>
  );

  const SettingsModal = () => (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(42, 40, 69, 0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={() => setShowSettings(false)}>
      <div className="sq-modal-card" style={{ background: palette.white, borderRadius: '18px', padding: '24px', maxWidth: '360px', width: '100%', maxHeight: '90dvh', overflow: 'auto', border: `1.5px solid ${palette.border}`, boxShadow: '0 20px 50px rgba(42, 40, 69, 0.3)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: '800', color: palette.deepNavy, fontFamily: FONT_DISPLAY }}>Settings</h3>
          <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: palette.bodyTextSoft }}>✕</button>
        </div>
        <div style={{ marginBottom: '16px', padding: '12px', background: palette.creamSoft, borderRadius: '10px', border: `1.5px solid ${palette.border}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', textAlign: 'center' }}>
            <div><div style={{ fontSize: '18px', fontWeight: '800', color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>{stats.gamesPlayed}</div><div style={{ fontSize: '10px', color: palette.bodyTextSoft, fontFamily: FONT_BODY, fontWeight: 600 }}>Games</div></div>
            <div><div style={{ fontSize: '18px', fontWeight: '800', color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>{stats.bestScore}</div><div style={{ fontSize: '10px', color: palette.bodyTextSoft, fontFamily: FONT_BODY, fontWeight: 600 }}>Best Score</div></div>
            <div><div style={{ fontSize: '18px', fontWeight: '800', color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>Lv.{currentLevel}</div><div style={{ fontSize: '10px', color: palette.bodyTextSoft, fontFamily: FONT_BODY, fontWeight: 600 }}>Level</div></div>
          </div>
        </div>
        <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: palette.bodyText, fontFamily: FONT_DISPLAY }}>🔊 Sound</span>
          <button onClick={() => { const newMuted = !isMuted; setIsMuted(newMuted); if (gainNode.current) gainNode.current.gain.value = newMuted ? 0 : 0.4; }} className="sq-modal-btn" style={{ padding: '3px 14px', borderRadius: '8px', border: 'none', background: isMuted ? palette.danger : palette.softGreen, color: 'white', cursor: 'pointer', fontSize: '11px', fontWeight: '800', fontFamily: FONT_DISPLAY }}>{isMuted ? 'OFF' : 'ON'}</button>
        </div>
        <button onClick={() => { setShowLeaderboard(true); setShowSettings(false); }} className="sq-modal-btn" style={{ width: '100%', padding: '9px', borderRadius: '8px', border: `1.5px solid ${palette.border}`, background: palette.creamSoft, color: palette.bodyText, cursor: 'pointer', fontSize: '12px', fontWeight: '800', marginBottom: '6px', fontFamily: FONT_DISPLAY }}>🏆 Leaderboard</button>
        <button onClick={handleExitGame} className="sq-modal-btn" style={{ width: '100%', padding: '9px', borderRadius: '8px', border: `1.5px solid ${palette.danger}40`, background: `${palette.danger}10`, color: palette.danger, cursor: 'pointer', fontSize: '12px', fontWeight: '800', marginBottom: '6px', fontFamily: FONT_DISPLAY }}>❌ Exit Game</button>
        <button onClick={() => { setShowSettings(false); setGameState('intro'); }} className="sq-modal-btn" style={{ width: '100%', padding: '9px', borderRadius: '8px', border: `1.5px solid ${palette.border}`, background: palette.creamSoft, color: palette.bodyText, cursor: 'pointer', fontSize: '12px', fontWeight: '800', fontFamily: FONT_DISPLAY }}>🔄 New Game</button>
      </div>
    </div>
  );

  const LeaderboardModal = () => (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(42, 40, 69, 0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={() => setShowLeaderboard(false)}>
      <div className="sq-modal-card" style={{ background: palette.white, borderRadius: '18px', padding: '20px', maxWidth: '380px', width: '100%', maxHeight: '90dvh', overflow: 'auto', border: `1.5px solid ${palette.border}`, boxShadow: '0 20px 50px rgba(42, 40, 69, 0.3)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: '800', color: palette.deepNavy, fontFamily: FONT_DISPLAY }}>🏆 Leaderboard</h3>
          <button onClick={() => setShowLeaderboard(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: palette.bodyTextSoft }}>✕</button>
        </div>
        {leaderboardData.length === 0 ? (
          <div style={{ textAlign: 'center', color: palette.bodyTextSoft, padding: '24px 0' }}><div style={{ fontSize: '36px', marginBottom: '6px' }}>📊</div><p style={{ fontSize: '13px', fontFamily: FONT_BODY, fontWeight: 600 }}>No scores yet!</p></div>
        ) : leaderboardData.map((entry, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', padding: '8px 10px', borderRadius: '8px', background: index < 3 ? `${palette.warmOrange}10` : 'transparent', marginBottom: '4px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: index === 0 ? palette.gold : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : palette.creamSoft, color: index < 3 ? '#fff' : palette.bodyTextSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', marginRight: '10px', fontFamily: FONT_DISPLAY }}>{index + 1}</div>
            <div style={{ flex: 1 }}><div style={{ fontWeight: '800', fontSize: '13px', color: palette.deepNavy, fontFamily: FONT_DISPLAY }}>{entry.name || 'Player'}</div><div style={{ fontSize: '10px', color: palette.bodyTextSoft, fontFamily: FONT_BODY, fontWeight: 600 }}>Level {entry.level || 'A1'} • {entry.questions || 0} q</div></div>
            <div style={{ fontWeight: '800', fontSize: '15px', color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>{entry.score}</div>
          </div>
        ))}
        <button onClick={() => setShowLeaderboard(false)} className="sq-modal-btn" style={{ width: '100%', padding: '9px', borderRadius: '8px', border: 'none', background: palette.warmOrange, color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: '800', marginTop: '10px', fontFamily: FONT_DISPLAY, boxShadow: `0 3px 0 ${palette.warmOrangeShadow}` }}>Close</button>
      </div>
    </div>
  );

  const NoLivesOverlay = () => {
    if (!showNoLivesMessage && lives > 0) return null;
    if (gameState !== 'playing') return null;
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(42, 40, 69, 0.75)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
        <div className="sq-modal-card" style={{ background: palette.white, borderRadius: '20px', padding: '32px', maxWidth: '380px', width: '100%', textAlign: 'center', border: `1.5px solid ${palette.border}`, boxShadow: '0 20px 50px rgba(42, 40, 69, 0.3)' }}>
          <div className="sq-modal-emoji" style={{ fontSize: '56px', marginBottom: '8px' }}>😢</div>
          <h3 style={{ fontSize: '22px', fontWeight: '800', color: palette.deepNavy, marginBottom: '4px', fontFamily: FONT_DISPLAY }}>No Hearts Left!</h3>
          <p style={{ fontSize: '14px', color: palette.bodyTextSoft, marginBottom: '16px', fontFamily: FONT_BODY, fontWeight: 600 }}>Wait for refill or buy with diamonds</p>
          <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
            <button onClick={() => { setShowNoLivesMessage(false); setContinueFromGameOver(true); setShowHeartShop(true); }} className="sq-modal-btn" style={{ width: '100%', padding: '12px', background: `linear-gradient(135deg, ${palette.diamond}, ${palette.diamondShadow})`, color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '800', fontFamily: FONT_DISPLAY, boxShadow: `0 3px 0 ${palette.diamondShadow}` }}>💎 Buy Hearts & Continue</button>
            <button onClick={() => { setShowNoLivesMessage(false); setGameState('intro'); }} className="sq-modal-btn" style={{ width: '100%', padding: '12px', background: palette.creamSoft, color: palette.bodyText, border: `1.5px solid ${palette.border}`, borderRadius: '12px', cursor: 'pointer', fontSize: '13px', fontWeight: '800', fontFamily: FONT_DISPLAY }}>Back to Menu</button>
          </div>
        </div>
      </div>
    );
  };

  if (gameState === 'loading') {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100dvh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_BODY, zIndex: 999999, background: palette.deepNavy }}>
        {bgAnimationStyle}
        {DevPanelElement()}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
          <div className="loading-scroll-track">
            <img src={images['pixel-town']} className="loading-scroll-img" alt="" onError={(e) => { e.target.style.display = 'none'; }} />
            <img src={images['pixel-town']} className="loading-scroll-img" alt="" onError={(e) => { e.target.style.display = 'none'; }} />
          </div>
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${palette.deepNavy}80, ${palette.deepNavyLight}90)`, pointerEvents: 'none' }} />
        </div>
        <div className="sq-loading-card" style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '420px', width: '100%', padding: '40px 32px', background: 'rgba(255, 255, 255, 0.06)', backdropFilter: 'blur(16px)', borderRadius: '24px', border: `1.5px solid ${palette.border}30` }}>
          <h2 style={{ fontSize: '36px', fontWeight: '900', margin: 0, fontFamily: FONT_DISPLAY, color: palette.white, textShadow: '0 4px 12px rgba(0,0,0,0.3)', animation: 'textBounce 1.4s ease-in-out infinite' }}>Loading<span className="loading-dots">...</span></h2>
          <div className="sq-loading-bar" style={{ position: 'relative', width: '100%', height: '30px', borderRadius: '20px', background: 'rgba(255,255,255,0.06)', border: `2px solid ${palette.warmOrange}60`, overflow: 'hidden', marginTop: '28px' }}>
            <div className="progress-fill" style={{ position: 'absolute', top: '3px', left: '3px', bottom: '3px', width: '35%', borderRadius: '16px', background: `linear-gradient(90deg, ${palette.teal} 0%, ${palette.warmOrange} 50%, ${palette.coral} 100%)`, boxShadow: `0 0 12px ${palette.warmOrange}80`, animation: 'progressSlide 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite' }} />
            <div className="progress-shimmer" />
          </div>
        </div>
        <style>{`
          .loading-scroll-track { display: flex; height: 100%; width: max-content; animation: loadingScroll 14s linear infinite; }
          .loading-scroll-img { height: 100%; width: auto; max-width: none; flex-shrink: 0; display: block; object-fit: contain; }
          @keyframes loadingScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
          @keyframes textBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
          .loading-dots { display: inline-block; animation: textBounce 1.4s ease-in-out infinite; }
          @keyframes progressSlide { 0% { left: 3px; width: 20%; } 50% { left: 40%; width: 45%; } 100% { left: 97%; width: 20%; transform: translateX(-100%); } }
          .progress-shimmer { position: absolute; top: 0; left: -40%; width: 40%; height: 100%; background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0) 100%); animation: shimmerSweep 1.8s linear infinite; }
          @keyframes shimmerSweep { 0% { left: -40%; } 100% { left: 100%; } }
        `}</style>
      </div>
    );
  }

  if (!isUserLoaded) {
    return (
      <div style={{ ...fullScreenBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {bgAnimationStyle}
        {DevPanelElement()}
        <div style={{ background: palette.white, borderRadius: '16px', padding: '40px', textAlign: 'center', maxWidth: '400px', width: '100%', border: `1.5px solid ${palette.border}`, boxShadow: '0 10px 30px rgba(42,40,69,0.15)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: palette.deepNavy, fontFamily: FONT_DISPLAY }}>Loading...</h2>
        </div>
      </div>
    );
  }

  if (gameState === 'intro') {
    return (
      <div style={{ ...fullScreenBg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        {bgAnimationStyle}
        {DevPanelElement()}
        {showSettings && <SettingsModal />}
        {showLeaderboard && <LeaderboardModal />}
        {showExitConfirm && <ExitConfirmModal />}
        {showHeartShop && <HeartShopModal />}
        <div className="sq-intro-card" style={{ maxWidth: '520px', width: '100%', background: theme.cardBg, borderRadius: '24px', padding: '32px 28px', border: theme.cardBorder, boxShadow: theme.cardShadow, textAlign: 'center', maxHeight: 'calc(100dvh - 12px)', overflowY: 'auto' }}>
          <div className="sq-intro-icon" style={{ width: '84px', height: '84px', borderRadius: '50%', background: theme.accentGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: `0 8px 24px ${palette.warmOrange}40` }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: palette.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>📖</div>
          </div>
          {currentUser && (
            <div className="sq-intro-chip" style={{ background: theme.chipBg, padding: '4px 14px', borderRadius: '10px', marginBottom: '10px', display: 'inline-block', border: `1px solid ${palette.border}` }}>
              <span style={{ fontSize: '12px', color: palette.bodyText, fontWeight: '700', fontFamily: FONT_BODY }}>👤 {currentUser.displayName || currentUser.email || 'Player'}</span>
            </div>
          )}
          <h1 className="sq-intro-title" style={{ fontSize: '30px', fontWeight: '800', color: theme.textPrimary, marginBottom: '2px', letterSpacing: '-0.5px', fontFamily: FONT_DISPLAY }}>SynoQuest</h1>
          <p className="sq-intro-sub" style={{ fontSize: '12px', color: theme.textSecondary, marginBottom: '16px', fontWeight: '600', fontFamily: FONT_BODY }}>📚 10 questions per level • CEFR A1 to C2!</p>
          <div className="sq-intro-stats" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <div style={{ background: `linear-gradient(135deg, ${palette.gold}20, ${palette.warmOrange}20)`, padding: '8px 14px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '6px', border: `1.5px solid ${palette.gold}60` }}>
              <span style={{ fontSize: '14px' }}>💰</span>
              <span style={{ fontSize: '14px', color: palette.gold, fontWeight: '800', fontFamily: FONT_DISPLAY }}>{localPoints}</span>
              <span style={{ fontSize: '10px', color: palette.bodyTextSoft, fontWeight: 600, fontFamily: FONT_BODY }}>pts</span>
            </div>
            <div style={{ background: `linear-gradient(135deg, ${palette.diamond}20, ${palette.diamond}10)`, padding: '8px 14px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '6px', border: `1.5px solid ${palette.diamond}60` }}>
              <span style={{ fontSize: '14px' }}>💎</span>
              <span style={{ fontSize: '14px', color: palette.diamond, fontWeight: '800', fontFamily: FONT_DISPLAY }}>{localDiamonds}</span>
              <span style={{ fontSize: '10px', color: palette.bodyTextSoft, fontWeight: 600, fontFamily: FONT_BODY }}>gems</span>
            </div>
          </div>
          <div className="sq-intro-levels" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px', marginBottom: '14px', background: theme.surfaceBg, padding: '8px', borderRadius: '10px', border: `1px solid ${theme.surfaceBorder}` }}>
            {CEFR_LEVELS.map((level) => {
              const config = LEVEL_CONFIG[level];
              return (
                <div key={level} className="sq-intro-level-item" style={{ padding: '4px', borderRadius: '6px', background: level === 'A1' || level === 'A2' ? `${palette.softGreen}15` : level === 'B1' || level === 'B2' ? `${palette.warmOrange}15` : `${palette.coral}15`, textAlign: 'center', fontSize: '9px', fontWeight: '800', color: level === 'A1' || level === 'A2' ? palette.softGreen : level === 'B1' || level === 'B2' ? palette.warmOrange : palette.coral, border: `1px solid ${palette.border}`, fontFamily: FONT_DISPLAY }}>
                  <div style={{ fontSize: '12px' }}>{config.emoji}</div>
                  <div>{level}</div>
                </div>
              );
            })}
          </div>
          <div className="sq-intro-hearts" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '14px', padding: '10px', background: theme.surfaceBg, borderRadius: '10px', border: `1px solid ${theme.surfaceBorder}` }}>
            <div style={{ display: 'flex', gap: '1px' }}>
              {[...Array(lives)].map((_, i) => (<span key={i} style={{ fontSize: '18px' }}>❤️</span>))}
              {[...Array(maxLives - lives)].map((_, i) => (<span key={i} style={{ fontSize: '18px', opacity: 0.2 }}>❤️</span>))}
            </div>
            <span style={{ fontSize: '12px', color: theme.textSecondary, marginLeft: '4px', fontWeight: '600', fontFamily: FONT_BODY }}>{lives > 0 ? `${lives}/${maxLives} hearts` : 'No hearts'}</span>
            {lives < maxLives && timeRemaining && (<span style={{ fontSize: '11px', color: palette.warmOrange, fontWeight: '700', fontFamily: FONT_BODY }}>⏳ {timeRemaining}</span>)}
          </div>
          {lives > 0 ? (
            <button onClick={startGame} className="sq-intro-btn" style={{ width: '100%', padding: '14px', background: theme.accentGradient, color: 'white', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', boxShadow: `0 3px 0 ${palette.warmOrangeShadow}`, fontFamily: FONT_DISPLAY, textTransform: 'uppercase' }}>🚀 Start Game</button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ width: '100%', padding: '12px', background: theme.surfaceBg, color: theme.textSecondary, border: `1.5px solid ${palette.border}`, borderRadius: '12px', fontSize: '12px', fontWeight: '800', fontFamily: FONT_DISPLAY, textAlign: 'center' }}>
                ⏳ No Hearts — Refill: {timeRemaining || '30m'}
              </div>
              <button onClick={() => { setContinueFromGameOver(false); setShowHeartShop(true); }} className="sq-intro-btn" style={{ width: '100%', padding: '14px', background: `linear-gradient(135deg, ${palette.diamond}, ${palette.diamondShadow})`, color: 'white', border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: '800', cursor: 'pointer', boxShadow: `0 3px 0 ${palette.diamondShadow}`, fontFamily: FONT_DISPLAY }}>
                💎 Buy Hearts ({localDiamonds} 💎)
              </button>
            </div>
          )}
          {showFeedback && (<div className="sq-feedback" style={{ marginTop: '10px', padding: '8px', borderRadius: '10px', background: `${palette.warmOrange}12`, border: `1.5px solid ${palette.warmOrange}40`, textAlign: 'center', fontSize: '12px', fontWeight: '700', color: palette.warmOrange, fontFamily: FONT_BODY }}>{feedbackMessage}</div>)}
          {(onExitToGames || onBack) && (<button onClick={onExitToGames || onBack} className="sq-intro-back-btn" style={{ marginTop: '10px', width: '100%', padding: '10px', background: 'transparent', color: theme.textSecondary, border: `1.5px solid ${palette.border}`, borderRadius: '12px', cursor: 'pointer', fontSize: '12px', fontWeight: '800', fontFamily: FONT_DISPLAY }}>← Back</button>)}
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    const accuracy = questionNumber > 0 ? Math.round((correctCount / questionNumber) * 100) : 0;

    return (
      <div style={{ ...fullScreenBg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        {bgAnimationStyle}
        {DevPanelElement()}

        <div className="sq-end-card" style={{ maxWidth: '520px', width: '100%', background: theme.cardBg, borderRadius: '24px', padding: '32px 28px', border: theme.cardBorder, boxShadow: theme.cardShadow, textAlign: 'center', maxHeight: 'calc(100dvh - 12px)', overflowY: 'auto', animation: 'finishedPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
          <div className="sq-end-emoji" style={{ fontSize: '64px', marginBottom: '6px' }}>👑</div>

          <h2 className="sq-end-title" style={{ fontSize: '26px', fontWeight: '800', color: palette.gold, marginBottom: '4px', fontFamily: FONT_DISPLAY }}>
            All Levels Complete!
          </h2>

          <p className="sq-end-sub" style={{ fontSize: '13px', color: theme.textSecondary, marginBottom: '16px', fontFamily: FONT_BODY, fontWeight: 600 }}>
            You mastered <strong style={{ color: palette.gold, fontFamily: FONT_DISPLAY }}>A1 → C2</strong>! 🎉
          </p>

          <div className="sq-end-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
            <div className="sq-end-stat-box" style={{ padding: '12px', background: theme.surfaceBg, borderRadius: '10px', border: `1.5px solid ${palette.border}` }}>
              <div style={{ fontSize: '20px', fontWeight: '800', color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>{score}</div>
              <div style={{ fontSize: '10px', color: theme.textSecondary, fontFamily: FONT_DISPLAY, fontWeight: 800 }}>SCORE</div>
            </div>
            <div className="sq-end-stat-box" style={{ padding: '12px', background: theme.surfaceBg, borderRadius: '10px', border: `1.5px solid ${palette.border}` }}>
              <div style={{ fontSize: '20px', fontWeight: '800', color: palette.teal, fontFamily: FONT_DISPLAY }}>{accuracy}%</div>
              <div style={{ fontSize: '10px', color: theme.textSecondary, fontFamily: FONT_DISPLAY, fontWeight: 800 }}>ACCURACY</div>
            </div>
            <div className="sq-end-stat-box" style={{ padding: '12px', background: theme.surfaceBg, borderRadius: '10px', border: `1.5px solid ${palette.border}` }}>
              <div style={{ fontSize: '20px', fontWeight: '800', color: palette.gold, fontFamily: FONT_DISPLAY }}>{questionNumber}</div>
              <div style={{ fontSize: '10px', color: theme.textSecondary, fontFamily: FONT_DISPLAY, fontWeight: 800 }}>QUESTIONS</div>
            </div>
          </div>

          {completionBonus > 0 && (
            <div className="sq-end-reward" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '16px', background: `linear-gradient(135deg, #FEF3C7, #FDE68A)`, borderRadius: '14px', marginBottom: '16px', border: `2px solid ${palette.gold}`, boxShadow: `0 4px 0 #B45309, 0 0 24px ${palette.gold}80`, animation: 'bonusPop 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
              <div style={{ position: 'absolute', top: '-14px', left: '15%', fontSize: '20px', animation: 'sparkle 1.8s ease-in-out infinite' }}>✨</div>
              <div style={{ position: 'absolute', top: '-14px', right: '15%', fontSize: '20px', animation: 'sparkle 1.8s ease-in-out infinite 0.4s' }}>✨</div>
              <span style={{ fontSize: '32px', filter: 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.8))' }}>🏆</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#78350F', fontFamily: FONT_DISPLAY, letterSpacing: '0.5px' }}>
                  COMPLETION BONUS!
                </div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#B45309', fontFamily: FONT_DISPLAY }}>
                  +{completionBonus} 💎 Diamonds
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '6px', flexDirection: 'column' }}>
            <button onClick={startGame} disabled={lives <= 0} className="sq-end-btn" style={{ padding: '12px', background: lives > 0 ? theme.accentGradient : palette.creamSoft, color: lives > 0 ? 'white' : palette.bodyTextSoft, border: 'none', borderRadius: '12px', cursor: lives > 0 ? 'pointer' : 'not-allowed', fontSize: '14px', fontWeight: '800', boxShadow: lives > 0 ? `0 3px 0 ${palette.warmOrangeShadow}` : 'none', fontFamily: FONT_DISPLAY }}>
              {lives > 0 ? '🔄 Play Again' : `⏳ No Hearts - ${timeRemaining}`}
            </button>
            <button onClick={() => setGameState('intro')} className="sq-end-btn" style={{ padding: '10px', background: palette.creamSoft, color: palette.bodyText, border: `1.5px solid ${palette.border}`, borderRadius: '12px', cursor: 'pointer', fontSize: '13px', fontWeight: '800', fontFamily: FONT_DISPLAY }}>
              Back to Menu
            </button>
          </div>
        </div>

        <style>{`
          @keyframes finishedPop {
            0% { transform: scale(0.5) translateY(20px); opacity: 0; }
            60% { transform: scale(1.05) translateY(-3px); opacity: 1; }
            100% { transform: scale(1) translateY(0); opacity: 1; }
          }
          @keyframes bonusPop {
            0% { transform: scale(0.5) translateY(15px); opacity: 0; }
            60% { transform: scale(1.08) translateY(-3px); opacity: 1; }
            100% { transform: scale(1) translateY(0); opacity: 1; }
          }
          @keyframes sparkle {
            0%, 100% { opacity: 0.4; transform: scale(1) rotate(0deg); }
            50% { opacity: 1; transform: scale(1.3) rotate(15deg); }
          }
        `}</style>
      </div>
    );
  }

  if (gameState === 'gameover') {
    const accuracy = questionNumber > 0 ? Math.round((correctCount / questionNumber) * 100) : 0;
    return (
      <div style={{ ...fullScreenBg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        {bgAnimationStyle}
        {DevPanelElement()}
        {showHeartShop && <HeartShopModal />}
        <div className="sq-end-card" style={{ maxWidth: '520px', width: '100%', background: theme.cardBg, borderRadius: '24px', padding: '32px 28px', border: theme.cardBorder, boxShadow: theme.cardShadow, textAlign: 'center', maxHeight: 'calc(100dvh - 12px)', overflowY: 'auto' }}>
          <div className="sq-end-emoji" style={{ fontSize: '60px', marginBottom: '6px' }}>💀</div>
          <h2 className="sq-end-title" style={{ fontSize: '24px', fontWeight: '800', color: theme.textPrimary, marginBottom: '4px', fontFamily: FONT_DISPLAY }}>Game Over!</h2>
          <p className="sq-end-sub" style={{ fontSize: '13px', color: theme.textSecondary, marginBottom: '16px', fontFamily: FONT_BODY, fontWeight: 600 }}>
            Reached <strong style={{ color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>{currentLevel}</strong> with <strong style={{ color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>{correctCount}</strong> correct!
          </p>
          <div className="sq-end-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
            <div className="sq-end-stat-box" style={{ padding: '12px', background: theme.surfaceBg, borderRadius: '10px', border: `1.5px solid ${palette.border}` }}><div style={{ fontSize: '20px', fontWeight: '800', color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>{score}</div><div style={{ fontSize: '10px', color: theme.textSecondary, fontFamily: FONT_DISPLAY, fontWeight: 800 }}>SCORE</div></div>
            <div className="sq-end-stat-box" style={{ padding: '12px', background: theme.surfaceBg, borderRadius: '10px', border: `1.5px solid ${palette.border}` }}><div style={{ fontSize: '20px', fontWeight: '800', color: palette.teal, fontFamily: FONT_DISPLAY }}>{accuracy}%</div><div style={{ fontSize: '10px', color: theme.textSecondary, fontFamily: FONT_DISPLAY, fontWeight: 800 }}>ACCURACY</div></div>
            <div className="sq-end-stat-box" style={{ padding: '12px', background: theme.surfaceBg, borderRadius: '10px', border: `1.5px solid ${palette.border}` }}><div style={{ fontSize: '20px', fontWeight: '800', color: palette.gold, fontFamily: FONT_DISPLAY }}>×{maxCombo}</div><div style={{ fontSize: '10px', color: theme.textSecondary, fontFamily: FONT_DISPLAY, fontWeight: 800 }}>COMBO</div></div>
          </div>
          {diamondsEarnedThisGame > 0 && (
            <div className="sq-end-reward" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: `linear-gradient(135deg, ${palette.diamond}15, ${palette.diamond}08)`, borderRadius: '12px', marginBottom: '16px', border: `1.5px solid ${palette.diamond}50` }}>
              <span style={{ fontSize: '20px' }}>💎</span>
              <span style={{ fontSize: '16px', fontWeight: '800', color: palette.diamond, fontFamily: FONT_DISPLAY }}>+{diamondsEarnedThisGame} diamonds</span>
            </div>
          )}
          <div style={{ display: 'flex', gap: '6px', flexDirection: 'column' }}>
            <button onClick={openHeartShopFromGameOver} className="sq-end-btn" style={{ padding: '13px', background: `linear-gradient(135deg, ${palette.diamond}, ${palette.diamondShadow})`, color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '800', boxShadow: `0 3px 0 ${palette.diamondShadow}`, fontFamily: FONT_DISPLAY }}>
              💎 Continue with Hearts ({localDiamonds} 💎)
            </button>
            <button onClick={startGame} disabled={lives <= 0} className="sq-end-btn" style={{ padding: '12px', background: lives > 0 ? theme.accentGradient : palette.creamSoft, color: lives > 0 ? 'white' : palette.bodyTextSoft, border: 'none', borderRadius: '12px', cursor: lives > 0 ? 'pointer' : 'not-allowed', fontSize: '13px', fontWeight: '800', fontFamily: FONT_DISPLAY }}>{lives > 0 ? '🔄 Play Again' : `⏳ No Hearts - ${timeRemaining}`}</button>
            <button onClick={() => setGameState('intro')} className="sq-end-btn" style={{ padding: '10px', background: palette.creamSoft, color: palette.bodyText, border: `1.5px solid ${palette.border}`, borderRadius: '12px', cursor: 'pointer', fontSize: '12px', fontWeight: '800', fontFamily: FONT_DISPLAY }}>Back to Menu</button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'playing') {
    if (!currentQuestion) {
      return (<div style={{ ...fullScreenBg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>{bgAnimationStyle}{DevPanelElement()}<div style={{ background: theme.cardBg, border: theme.cardBorder, boxShadow: theme.cardShadow, borderRadius: '16px', padding: '24px' }}><div style={{ fontSize: '32px' }}>🔄</div></div></div>);
    }

    const word = currentQuestion.word || '';
    const blanks = currentQuestion.blankPositions || [];
    const visiblePositions = currentQuestion.visiblePositions || [];
    const letters = currentQuestion.letterOptions || [];
    const config = LEVEL_CONFIG[currentLevel] || LEVEL_CONFIG['A1'];
    const currentHintCost = getHintCost(hintsUsedThisLevel);
    const isFreeHint = currentHintCost === 0;
    const canAffordHint = isFreeHint || localPoints >= currentHintCost;
    
    let hintButtonLabel;
    if (hintUsed) hintButtonLabel = 'Hint Used This Question';
    else if (isFreeHint) hintButtonLabel = '💡 Use FREE Hint (1/level) (-3 secs)';
    else if (!canAffordHint) hintButtonLabel = `💡 Need ${currentHintCost} pts (You have ${localPoints})`;
    else hintButtonLabel = `💡 Buy Hint: ${currentHintCost} pts (-3 secs)`;

    return (
      <div className="sq-play-wrapper" style={{ ...fullScreenBg, padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100dvh', overflow: 'hidden', boxSizing: 'border-box' }}>
        {bgAnimationStyle}
        {DevPanelElement()}
        <NoLivesOverlay />
        {showExitConfirm && <ExitConfirmModal />}
        {showSettings && <SettingsModal />}
        {showLeaderboard && <LeaderboardModal />}
        {showHeartShop && <HeartShopModal />}
        <div className="sq-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', background: 'rgba(255,255,255,0.9)', borderRadius: '14px', maxWidth: '620px', width: '100%', margin: '0 auto 10px', border: `1.5px solid ${palette.border}`, boxSizing: 'border-box', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <button onClick={() => setShowSettings(true)} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: palette.bodyText, padding: 0, lineHeight: 1 }}>⚙️</button>
            <span style={{ fontWeight: '800', color: palette.deepNavy, fontSize: '12px', fontFamily: FONT_DISPLAY, whiteSpace: 'nowrap' }}>📝 {config.emoji} Lv.{currentLevel}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'nowrap', justifyContent: 'flex-end' }}>
            <div style={{ fontSize: '10px', color: palette.bodyText, fontWeight: '800', background: palette.creamSoft, padding: '2px 8px', borderRadius: '8px', fontFamily: FONT_DISPLAY, border: `1px solid ${palette.border}`, whiteSpace: 'nowrap' }}>
              {retryPhase ? `Retry: ${wrongQueueRef.current.length}` : `${answeredInLevel}/${QUESTIONS_PER_LEVEL}`}
            </div>
            <div style={{ fontSize: '10px', color: palette.gold, fontWeight: '800', background: `${palette.gold}15`, padding: '2px 8px', borderRadius: '8px', fontFamily: FONT_DISPLAY, border: `1px solid ${palette.gold}40`, whiteSpace: 'nowrap' }}>💰 {localPoints}</div>
            <div style={{ fontSize: '10px', color: palette.diamond, fontWeight: '800', background: `${palette.diamond}15`, padding: '2px 8px', borderRadius: '8px', fontFamily: FONT_DISPLAY, border: `1px solid ${palette.diamond}40`, whiteSpace: 'nowrap' }}>💎 {localDiamonds}</div>
            <div className="sq-header-hearts" style={{ display: 'flex', gap: '1px' }}>
              {[...Array(lives)].map((_, i) => (<span key={i} style={{ fontSize: '14px' }}>❤️</span>))}
              {[...Array(maxLives - lives)].map((_, i) => (<span key={i} style={{ fontSize: '14px', opacity: 0.2 }}>❤️</span>))}
            </div>
            <div className="sq-header-timer" style={{ width: '28px', height: '28px', borderRadius: '50%', background: timer <= 3 ? `${palette.danger}20` : timer <= 5 ? `${palette.warmOrange}20` : palette.creamSoft, border: `2px solid ${timer <= 3 ? palette.danger : timer <= 5 ? palette.warmOrange : palette.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: timer <= 3 ? palette.danger : timer <= 5 ? palette.warmOrange : palette.deepNavy, fontSize: '11px', fontWeight: '800', fontFamily: FONT_DISPLAY, flexShrink: 0 }}>{timer}</div>
            <div style={{ background: palette.warmOrange, padding: '2px 12px', borderRadius: '8px', color: 'white', fontWeight: '800', fontSize: '13px', fontFamily: FONT_DISPLAY, boxShadow: `0 2px 0 ${palette.warmOrangeShadow}`, whiteSpace: 'nowrap' }}>{score}</div>
            {comboCount >= 3 && (<div style={{ background: `${palette.gold}20`, padding: '2px 10px', borderRadius: '8px', color: palette.gold, fontWeight: '800', fontSize: '10px', border: `1.5px solid ${palette.gold}40`, fontFamily: FONT_DISPLAY, whiteSpace: 'nowrap' }}>🔥{comboCount}x</div>)}
          </div>
        </div>
        <div className="sq-main-card" style={{ maxWidth: '620px', width: '100%', background: theme.cardBg, borderRadius: '24px', padding: '30px 28px', border: theme.cardBorder, boxShadow: theme.cardShadow, position: 'relative', overflow: 'hidden', boxSizing: 'border-box' }}>
          {showCorrectAnimation && (<div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `${palette.softGreen}15`, animation: 'correctFlash 0.5s ease' }} />)}
          <div className="sq-level-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: '800', color: theme.textSecondary, fontFamily: FONT_DISPLAY }}>{config.emoji} Level {currentLevel}</span>
            <span style={{ fontSize: '13px', color: theme.textMuted, fontWeight: '700', fontFamily: FONT_DISPLAY }}>{retryPhase ? `Retry` : `Q${answeredInLevel + 1}/${QUESTIONS_PER_LEVEL}`}</span>
          </div>
          <div className="sq-image-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '18px', padding: '18px', background: theme.surfaceBg, borderRadius: '14px', border: `1.5px solid ${theme.surfaceBorder}`, flexWrap: 'wrap' }}>
            <div className="sq-image-box" style={{ position: 'relative', width: '150px', height: '150px', background: palette.white, borderRadius: '14px', border: `1.5px solid ${palette.border}`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={currentQuestion.image1} alt={currentQuestion.word} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; const parent = e.target.parentElement; const span = document.createElement('span'); span.style.fontSize = '48px'; span.textContent = '🖼️'; parent.appendChild(span); }} />
            </div>
            <span className="sq-image-arrow" style={{ fontSize: '30px', fontWeight: '800', color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>↔️</span>
            <div className="sq-image-box" style={{ position: 'relative', width: '150px', height: '150px', background: palette.white, borderRadius: '14px', border: `1.5px solid ${palette.border}`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={currentQuestion.image2} alt={currentQuestion.word} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; const parent = e.target.parentElement; const span = document.createElement('span'); span.style.fontSize = '48px'; span.textContent = '🖼️'; parent.appendChild(span); }} />
            </div>
            <span className="sq-image-eq" style={{ fontSize: '28px', fontWeight: '800', color: theme.textPrimary, background: theme.chipBg, padding: '0 14px', borderRadius: '10px', border: `1.5px solid ${palette.border}`, fontFamily: FONT_DISPLAY }}>= ?</span>
          </div>
          <div className="sq-category" style={{ textAlign: 'center', marginBottom: '16px', fontSize: '15px', color: theme.textSecondary, fontWeight: '700', fontFamily: FONT_DISPLAY }}>{currentQuestion.category || 'Vocabulary'}</div>
          <div className="sq-blanks-row" style={{ display: 'flex', justifyContent: 'center', gap: '7px', marginBottom: '18px', padding: '16px', background: theme.surfaceBg, borderRadius: '12px', border: `1.5px solid ${theme.surfaceBorder}`, flexWrap: 'wrap' }}>
            {word.split('').map((letter, index) => {
              const isVisible = visiblePositions.includes(index);
              const filledLetter = userFilledBlanks[index];
              if (isVisible) return (<div key={index} className="sq-blank-box" style={{ width: '42px', height: '48px', background: theme.chipBg, border: `1.5px solid ${theme.surfaceBorder}`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '23px', fontWeight: '800', color: theme.textSecondary, fontFamily: FONT_DISPLAY }}>{letter}</div>);
              return (<div key={index} onClick={() => handleBlankClick(index)} className="sq-blank-box" style={{ width: '42px', height: '48px', background: filledLetter ? theme.chipBg : palette.white, border: `2px ${filledLetter ? 'solid' : 'dashed'} ${filledLetter ? theme.accent : theme.surfaceBorder}`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '23px', fontWeight: '800', color: theme.textPrimary, cursor: filledLetter ? 'pointer' : 'default', fontFamily: FONT_DISPLAY }}>{filledLetter || ''}</div>);
            })}
          </div>
          <div className="sq-letters-row" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '7px', marginBottom: '18px', padding: '13px', background: theme.surfaceBg, borderRadius: '12px', border: `1.5px solid ${theme.surfaceBorder}`, minHeight: '48px' }}>
            {letters.map((letter, index) => {
              const isUsed = usedLetters.includes(index);
              return (<button key={index} onClick={() => handleLetterClick(letter, index)} disabled={isUsed || answered || lives === 0 || timer === 0} className="sq-letter-btn" style={{ width: '46px', height: '46px', borderRadius: '12px', background: isUsed ? 'transparent' : theme.chipBg, border: `2px solid ${isUsed ? theme.surfaceBorder : `${palette.warmOrange}50`}`, color: isUsed ? theme.textMuted : theme.textSecondary, fontSize: '19px', fontWeight: '800', cursor: isUsed || answered || lives === 0 || timer === 0 ? 'default' : 'pointer', fontFamily: FONT_DISPLAY }}>{letter}</button>);
            })}
          </div>
          <div className="sq-action-btns" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <button onClick={() => { setUserFilledBlanks({}); setUsedLetters([]); }} disabled={answered || lives === 0 || Object.keys(userFilledBlanks).length === 0} className="sq-action-btn" style={{ padding: '13px', borderRadius: '14px', border: `1.5px solid ${theme.surfaceBorder}`, background: Object.keys(userFilledBlanks).length > 0 ? theme.surfaceBg : 'transparent', color: theme.textSecondary, cursor: Object.keys(userFilledBlanks).length > 0 ? 'pointer' : 'default', fontSize: '14px', fontWeight: '800', fontFamily: FONT_DISPLAY }}>🔄 Clear</button>
            <button onClick={checkWord} disabled={answered || lives === 0 || Object.keys(userFilledBlanks).length < blanks.length} className="sq-action-btn" style={{ padding: '13px', borderRadius: '14px', border: 'none', background: Object.keys(userFilledBlanks).length >= blanks.length ? theme.accentGradient : theme.surfaceBg, color: Object.keys(userFilledBlanks).length >= blanks.length ? 'white' : theme.textMuted, cursor: Object.keys(userFilledBlanks).length >= blanks.length ? 'pointer' : 'default', fontSize: '14px', fontWeight: '800', boxShadow: Object.keys(userFilledBlanks).length >= blanks.length ? `0 3px 0 ${palette.warmOrangeShadow}` : 'none', fontFamily: FONT_DISPLAY }}>✅ Submit</button>
          </div>
          {!answered && lives > 0 && (
            <button onClick={useHint} disabled={hintUsed || (!isFreeHint && !canAffordHint)} className="sq-hint-btn" style={{ width: '100%', padding: '12px', borderRadius: '14px', border: `1.5px solid ${hintUsed ? theme.surfaceBorder : isFreeHint ? `${palette.softGreen}50` : canAffordHint ? `${palette.gold}50` : `${palette.danger}50`}`, background: hintUsed ? theme.surfaceBg : isFreeHint ? `${palette.softGreen}12` : canAffordHint ? `${palette.gold}12` : `${palette.danger}10`, color: hintUsed ? theme.textMuted : isFreeHint ? palette.softGreen : canAffordHint ? palette.gold : palette.danger, cursor: hintUsed || (!isFreeHint && !canAffordHint) ? 'default' : 'pointer', fontSize: '13px', fontWeight: '800', marginBottom: '12px', fontFamily: FONT_DISPLAY }}>{hintButtonLabel}</button>
          )}
          {showFeedback && (<div className="sq-feedback" style={{ padding: '8px', borderRadius: '10px', background: feedbackMessage.includes('✅') || feedbackMessage.includes('⬆️') || feedbackMessage.includes('💡') ? `${palette.softGreen}15` : feedbackMessage.includes('❌') || feedbackMessage.includes('💀') ? `${palette.danger}15` : `${palette.warmOrange}15`, border: `1.5px solid ${feedbackMessage.includes('✅') || feedbackMessage.includes('⬆️') || feedbackMessage.includes('💡') ? `${palette.softGreen}40` : feedbackMessage.includes('❌') || feedbackMessage.includes('💀') ? `${palette.danger}40` : `${palette.warmOrange}40`}`, marginBottom: '8px', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: feedbackMessage.includes('✅') || feedbackMessage.includes('⬆️') || feedbackMessage.includes('💡') ? palette.softGreen : feedbackMessage.includes('❌') || feedbackMessage.includes('💀') ? palette.danger : palette.warmOrange, fontFamily: FONT_BODY }}>{feedbackMessage}</div>)}
        </div>
        <style>{`@keyframes correctFlash { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }`}</style>
      </div>
    );
  }

  return null;
};

export default SynoQuest;