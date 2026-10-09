// src/components/dashboard/MatchGame.jsx
// ✅ Same heart/diamond flow as SynoQuest
// ✅ 5 CONSECUTIVE wrong matches = -1 ❤️ (resets on correct match)
// ✅ Timeout = -1 ❤️ + GAME OVER AGAD (no restart)
// ✅ Diamond reward per level completion
// ✅ +50 💎 completion bonus (A1 → C2)
// ✅ FIXED: Dev panel state preserved (call as function, not component)
// ✅ NEW: Back button returns to GAMES selection (via onExitToGames)

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { auth, db } from '../../pages/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateUserStats } from '../../services/firebaseService';
import { claimGameDiamonds, spendDiamonds, HEART_PRICES } from '../../services/diamondService';
import MatchGameDevPanel from './MatchGameDevPanel';

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

const wordLevelMap = {
  'apple':'A1','bicycle':'A1','camera':'A1','doctor':'A1','elephant':'A1',
  'flower':'A1','guitar':'A1','hospital':'A1','island':'A1','jacket':'A1',
  'airport':'A2','butterfly':'A2','dangerous':'A2','exercise':'A2','festival':'A2',
  'kitchen':'A2','library':'A2','mountain':'A2','restaurant':'A2','umbrella':'A2',
  'achievement':'B1','celebration':'B1','cooperation':'B1','bravery':'B1','determination':'B1',
  'friendship':'B1','leadership':'B1','motivation':'B1','patience':'B1','teamwork':'B1',
  'accomplish':'B2','adventure':'B2','communicate':'B2','consequence':'B2','creativity':'B2',
  'discovery':'B2','exploration':'B2','innovation':'B2','perspective':'B2','significant':'B2',
  'aspiration':'C1','collaboration':'C1','dedication':'C1','eloquent':'C1','exceptional':'C1',
  'fundamental':'C1','perseverance':'C1','sophisticated':'C1','versatile':'C1','visionary':'C1',
  'ambivalent':'C2','clandestine':'C2','effervescent':'C2','transient':'C2','celestial':'C2',
  'gregarious':'C2','luminous':'C2','scrupulous':'C2','quintessential':'C2','serendipity':'C2',
};

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const LEVEL_PAIRS = {
  'A1': 10, 'A2': 12, 'B1': 14, 'B2': 16, 'C1': 18, 'C2': 20,
};

const LEVEL_GRID = {
  'A1': { cols: 5,  maxWidth: '560px' },
  'A2': { cols: 6,  maxWidth: '660px' },
  'B1': { cols: 7,  maxWidth: '750px' },
  'B2': { cols: 8,  maxWidth: '840px' },
  'C1': { cols: 9,  maxWidth: '930px' },
  'C2': { cols: 10, maxWidth: '1020px' },
};

const LEVEL_CONFIG = {
  'A1': { timer: 80, label: 'A1 - Beginner',          emoji: '🟢' },
  'A2': { timer: 75, label: 'A2 - Elementary',        emoji: '🟢' },
  'B1': { timer: 70, label: 'B1 - Intermediate',      emoji: '🟡' },
  'B2': { timer: 65, label: 'B2 - Upper Intermediate',emoji: '🟡' },
  'C1': { timer: 60, label: 'C1 - Advanced',          emoji: '🟠' },
  'C2': { timer: 55, label: 'C2 - Proficiency',       emoji: '👑' },
};

const COMPLETION_BONUS_DIAMONDS = 50;

const allVocabPairs = Object.keys(wordLevelMap).map((word, index) => ({
  id: index + 1,
  word: word.toUpperCase(),
  image: `${imageBasePath}${word}.png`,
  level: wordLevelMap[word],
}));

const getWordsForLevel = (level) => {
  const idx = CEFR_LEVELS.indexOf(level);
  const allowedLevels = CEFR_LEVELS.slice(0, idx + 1);
  return allVocabPairs.filter(p => allowedLevels.includes(p.level));
};

const fullScreenBg = {
  position: 'fixed', top: 0, left: 0, width: '100vw',
  height: '100vh', minHeight: '100dvh', overflowY: 'auto',
  backgroundImage: `linear-gradient(135deg, rgba(42, 40, 69, 0.65), rgba(58, 55, 87, 0.55)), url(${imageBasePath}bg-matchgame.png)`,
  backgroundSize: '130% 130%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
  animation: 'bgPan 30s ease-in-out infinite alternate', fontFamily: FONT_BODY,
};

const bgAnimationStyle = (
  <style>{`
    @keyframes bgPan { 0% { background-position: 0% 0%; } 50% { background-position: 100% 50%; } 100% { background-position: 50% 100%; } }

    @media (max-width: 1100px) {
      .mg-cards { gap: 5px !important; padding: 8px !important; }
    }

    @media (max-height: 500px) and (orientation: landscape) {
      .mg-header { padding: 4px 10px !important; margin-bottom: 4px !important; border-radius: 10px !important; }
      .mg-header span { font-size: 9px !important; }
      .mg-header button { font-size: 12px !important; padding: 2px 4px !important; }
      .mg-header > div { gap: 3px !important; }
      .mg-progress-wrap { margin-bottom: 4px !important; }
      .mg-progress-bar { height: 2px !important; }
      .mg-cards { gap: 3px !important; padding: 6px !important; border-radius: 10px !important; max-height: calc(100dvh - 70px) !important; }
      .mg-card { min-height: 0 !important; }
      .mg-card-face-front span { font-size: 11px !important; }
      .mg-card-face-back-word { font-size: 8px !important; padding: 1px !important; }
      .mg-footer { padding: 4px 10px !important; margin-top: 4px !important; font-size: 9px !important; border-radius: 8px !important; }
      .mg-intro-card { max-width: 640px !important; padding: 12px 20px !important; border-radius: 16px !important; max-height: calc(100dvh - 12px) !important; overflow-y: auto !important; }
      .mg-intro-card h1 { font-size: 20px !important; margin-bottom: 0 !important; }
      .mg-intro-card p { font-size: 10px !important; margin-bottom: 8px !important; }
      .mg-intro-icon { width: 44px !important; height: 44px !important; margin-bottom: 6px !important; }
      .mg-intro-icon > div { width: 28px !important; height: 28px !important; font-size: 16px !important; }
      .mg-intro-chips > div { padding: 3px 8px !important; font-size: 10px !important; }
      .mg-intro-chips span { font-size: 10px !important; }
      .mg-intro-levels { gap: 2px !important; padding: 4px !important; margin-bottom: 8px !important; }
      .mg-intro-level-item { padding: 2px !important; font-size: 7px !important; }
      .mg-intro-level-item div { font-size: 9px !important; }
      .mg-intro-hearts { padding: 4px !important; margin-bottom: 8px !important; }
      .mg-intro-hearts span { font-size: 14px !important; }
      .mg-intro-music { padding: 4px !important; margin-bottom: 8px !important; }
      .mg-intro-start-btn { padding: 10px !important; font-size: 12px !important; border-radius: 10px !important; }
      .mg-intro-back-btn { padding: 6px !important; font-size: 10px !important; margin-top: 4px !important; }
      .mg-levelup-card { padding: 16px 20px !important; max-width: 400px !important; max-height: calc(100dvh - 12px) !important; overflow-y: auto !important; }
      .mg-levelup-emoji { font-size: 40px !important; margin-bottom: 2px !important; }
      .mg-levelup-title { font-size: 20px !important; margin-bottom: 2px !important; }
      .mg-levelup-sub { font-size: 11px !important; margin-bottom: 10px !important; }
      .mg-levelup-badges { margin-bottom: 10px !important; }
      .mg-levelup-badges > div { padding: 8px 14px !important; font-size: 14px !important; }
      .mg-levelup-badges > div:last-child { padding: 10px 18px !important; font-size: 16px !important; }
      .mg-levelup-stats { gap: 6px !important; margin-bottom: 10px !important; }
      .mg-levelup-stat-box { padding: 8px !important; }
      .mg-levelup-stat-box > div:first-child { font-size: 16px !important; margin-bottom: 2px !important; }
      .mg-levelup-stat-box > div:nth-child(2) { font-size: 14px !important; }
      .mg-levelup-btn { padding: 10px !important; font-size: 12px !important; border-radius: 10px !important; }
      .mg-gameover-card { padding: 14px 20px !important; max-width: 520px !important; max-height: calc(100dvh - 12px) !important; overflow-y: auto !important; }
      .mg-gameover-emoji { font-size: 36px !important; margin-bottom: 2px !important; }
      .mg-gameover-title { font-size: 18px !important; margin-bottom: 2px !important; }
      .mg-gameover-sub { font-size: 11px !important; margin-bottom: 8px !important; }
      .mg-gameover-stats { gap: 6px !important; margin-bottom: 8px !important; }
      .mg-gameover-stat-box { padding: 8px !important; }
      .mg-gameover-stat-box > div:first-child { font-size: 15px !important; }
      .mg-gameover-stat-box > div:last-child { font-size: 8px !important; }
      .mg-gameover-reward { padding: 8px !important; margin-bottom: 6px !important; }
      .mg-gameover-reward span { font-size: 12px !important; }
      .mg-gameover-btn { padding: 10px !important; font-size: 11px !important; }
      .mg-loading-card { padding: 20px !important; max-width: 320px !important; }
      .mg-loading-card h2 { font-size: 18px !important; }
      .mg-loading-spinner { width: 56px !important; height: 56px !important; margin-bottom: 12px !important; }
      .mg-modal-card { padding: 14px 18px !important; max-width: 440px !important; max-height: calc(100dvh - 12px) !important; overflow-y: auto !important; border-radius: 14px !important; }
      .mg-modal-card h2 { font-size: 16px !important; margin-bottom: 2px !important; }
      .mg-modal-card h3 { font-size: 15px !important; margin-bottom: 4px !important; }
      .mg-modal-card p { font-size: 11px !important; margin-bottom: 8px !important; }
      .mg-modal-emoji { font-size: 32px !important; margin-bottom: 2px !important; }
      .mg-modal-price-btn { padding: 8px 12px !important; border-radius: 10px !important; }
      .mg-modal-price-btn > div:first-child { font-size: 20px !important; }
      .mg-modal-price-btn > div:last-child > div:first-child { font-size: 12px !important; }
      .mg-modal-btn { padding: 8px !important; font-size: 11px !important; border-radius: 8px !important; }
    }

    @media (max-height: 380px) and (orientation: landscape) {
      .mg-cards { gap: 2px !important; padding: 4px !important; }
      .mg-header { padding: 3px 8px !important; }
      .mg-header span { font-size: 8px !important; }
    }
  `}</style>
);

const theme = {
  cardBg: palette.white, cardBorder: `1.5px solid ${palette.border}`,
  cardShadow: `0 10px 40px rgba(42, 40, 69, 0.20), 0 2px 0 ${palette.border}`,
  textPrimary: palette.deepNavy, textSecondary: palette.bodyText, textMuted: palette.bodyTextSoft,
  accent: palette.warmOrange, accentGradient: `linear-gradient(135deg, ${palette.warmOrange} 0%, ${palette.coral} 100%)`,
  chipBg: palette.creamSoft, surfaceBg: palette.creamSoft, surfaceBorder: palette.border,
};

const REFILL_TIME = 1800;

const MatchGame = ({ onBack, onExitToGames, updateProgress, recordGame }) => {
  const [gameState, setGameState] = useState('intro');
  const [currentLevel, setCurrentLevel] = useState('A1');
  const [previousLevel, setPreviousLevel] = useState('A1');
  const [nextLevelName, setNextLevelName] = useState('A2');
  const [score, setScore] = useState(0);
  const [matches, setMatches] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [flippedCards, setFlippedCards] = useState([]);
  const [cards, setCards] = useState([]);
  const [isLocked, setIsLocked] = useState(false);
  const [timer, setTimer] = useState(80);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const [localDiamonds, setLocalDiamonds] = useState(0);
  const [showHeartShop, setShowHeartShop] = useState(false);
  const [diamondsEarnedThisGame, setDiamondsEarnedThisGame] = useState(0);
  const [completionBonus, setCompletionBonus] = useState(0);
  const [heartShopProcessing, setHeartShopProcessing] = useState(false);
  const [continueFromGameOver, setContinueFromGameOver] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  const [localPoints, setLocalPoints] = useState(0);

  const [lives, setLives] = useState(5);
  const [maxLives] = useState(5);
  const [lastRefillTime, setLastRefillTime] = useState(Date.now());
  const [timeRemaining, setTimeRemaining] = useState('');
  const [showNoLivesMessage, setShowNoLivesMessage] = useState(false);

  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAnswers, setTotalAnswers] = useState(0);
  const [answeredPairsInLevel, setAnsweredPairsInLevel] = useState(0);

  const sessionSavedRef = useRef(false);
  const firebaseSavedRef = useRef(false);
  const diamondSavedRef = useRef(false);
  const progressSavedRef = useRef(false);
  const completionBonusSavedRef = useRef(false);
  const matchedWordsRef = useRef([]);
  const wrongAttemptsRef = useRef(0);
  const livesRef = useRef(5);
  const lastRefillTimeRef = useRef(Date.now());
  const timerIntervalRef = useRef(null);
  const isMountedRef = useRef(true);
  const gameStateRef = useRef('intro');
  const updateProgressRef = useRef(updateProgress);
  const recordGameRef = useRef(recordGame);

  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { updateProgressRef.current = updateProgress; }, [updateProgress]);
  useEffect(() => { recordGameRef.current = recordGame; }, [recordGame]);

  const audioCtx = useRef(null);
  const gainNode = useRef(null);
  const audioCtxRef = useRef(null);
  const musicIntervalRef = useRef(null);
  const musicGainRef = useRef(null);
  const isMusicPlaying = useRef(false);

  const NINTENDO_MELODY = [
    { note: 523.25, duration: 0.15 }, { note: 587.33, duration: 0.15 }, { note: 659.25, duration: 0.15 },
    { note: 783.99, duration: 0.15 }, { note: 659.25, duration: 0.15 }, { note: 587.33, duration: 0.15 },
    { note: 523.25, duration: 0.15 }, { note: 659.25, duration: 0.15 }, { note: 783.99, duration: 0.15 },
    { note: 880.00, duration: 0.15 }, { note: 783.99, duration: 0.15 }, { note: 659.25, duration: 0.15 },
    { note: 783.99, duration: 0.15 }, { note: 880.00, duration: 0.15 }, { note: 987.77, duration: 0.20 },
    { note: 880.00, duration: 0.20 }, { note: 783.99, duration: 0.20 }, { note: 659.25, duration: 0.15 },
    { note: 783.99, duration: 0.15 }, { note: 880.00, duration: 0.15 }, { note: 1046.50, duration: 0.25 },
    { note: 987.77, duration: 0.15 }, { note: 880.00, duration: 0.15 }, { note: 783.99, duration: 0.15 },
  ];

  const BASS_LINE = [
    { note: 130.81, duration: 0.4 }, { note: 130.81, duration: 0.4 }, { note: 146.83, duration: 0.4 },
    { note: 146.83, duration: 0.4 }, { note: 164.81, duration: 0.4 }, { note: 164.81, duration: 0.4 },
    { note: 196.00, duration: 0.4 }, { note: 196.00, duration: 0.4 },
  ];

  const CHORD_PROGRESSION = [
    { notes: [261.63, 329.63, 392.00], duration: 1.0 },
    { notes: [392.00, 493.88, 587.33], duration: 1.0 },
    { notes: [440.00, 523.25, 659.25], duration: 1.0 },
    { notes: [349.23, 440.00, 523.25], duration: 1.0 },
  ];

  const getUserId = useCallback(() => currentUser ? currentUser.uid : 'guest', [currentUser]);
  const getLivesStorageKey = useCallback(() => `matchgame_lives_${getUserId()}`, [getUserId]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsUserLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchCurrency = async () => {
      if (!currentUser) return;
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          setLocalPoints(data.totalPoints || 0);
          setLocalDiamonds(data.totalDiamonds || 0);
        }
      } catch (err) { console.error('Error fetching currency:', err); }
    };
    if (currentUser && isUserLoaded) fetchCurrency();
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

  const initMusicAudio = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        musicGainRef.current = audioCtxRef.current.createGain();
        musicGainRef.current.gain.value = isMuted ? 0 : 0.12;
        musicGainRef.current.connect(audioCtxRef.current.destination);
      }
      if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
      return true;
    } catch (e) { return false; }
  };

  const playMusicNote = (frequency, duration = 0.15, type = 'square', volume = 0.12) => {
    if (isMuted || !audioCtxRef.current) return;
    try {
      const oscillator = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, audioCtxRef.current.currentTime);
      gain.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + duration);
      oscillator.connect(gain);
      gain.connect(musicGainRef.current);
      oscillator.start();
      oscillator.stop(audioCtxRef.current.currentTime + duration);
      return oscillator;
    } catch (e) { return null; }
  };

  const playChord = (notes, duration = 1.0) => {
    if (isMuted || !audioCtxRef.current) return;
    notes.forEach(freq => {
      try {
        const oscillator = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
        gain.gain.setValueAtTime(0.05, audioCtxRef.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + duration);
        oscillator.connect(gain);
        gain.connect(musicGainRef.current);
        oscillator.start();
        oscillator.stop(audioCtxRef.current.currentTime + duration);
      } catch (e) {}
    });
  };

  const startBackgroundMusic = () => {
    if (!initMusicAudio()) return;
    if (isMusicPlaying.current) return;
    isMusicPlaying.current = true;
    let noteIndex = 0;
    let chordIndex = 0;

    const playNextNote = () => {
      if (!isMusicPlaying.current || isMuted) return;
      try {
        const melodyNote = NINTENDO_MELODY[noteIndex % NINTENDO_MELODY.length];
        playMusicNote(melodyNote.note, melodyNote.duration, 'square', 0.10);
        if (noteIndex % 4 === 0) {
          const bassNote = BASS_LINE[Math.floor(noteIndex / 4) % BASS_LINE.length];
          playMusicNote(bassNote.note, bassNote.duration, 'sawtooth', 0.05);
        }
        if (noteIndex % 8 === 0) {
          const chord = CHORD_PROGRESSION[chordIndex % CHORD_PROGRESSION.length];
          playChord(chord.notes, 2.0);
          chordIndex++;
        }
        noteIndex++;
        if (Math.random() > 0.7) {
          const arpNote = 523.25 + (Math.random() * 400);
          playMusicNote(arpNote, 0.05, 'sine', 0.025);
        }
      } catch (e) {}
      const nextDelay = 150 + (Math.random() * 20);
      musicIntervalRef.current = setTimeout(playNextNote, nextDelay);
    };
    setTimeout(playNextNote, 300);
  };

  const stopBackgroundMusic = () => {
    isMusicPlaying.current = false;
    if (musicIntervalRef.current) {
      clearTimeout(musicIntervalRef.current);
      musicIntervalRef.current = null;
    }
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch (e) {}
      audioCtxRef.current = null;
    }
  };

  const toggleMusic = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      if (musicGainRef.current && audioCtxRef.current) {
        musicGainRef.current.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
      }
      if (gainNode.current && audioCtx.current) {
        gainNode.current.gain.setValueAtTime(0, audioCtx.current.currentTime);
      }
    } else {
      if (musicGainRef.current && audioCtxRef.current) {
        musicGainRef.current.gain.setValueAtTime(0.12, audioCtxRef.current.currentTime);
      }
      if (gainNode.current && audioCtx.current) {
        gainNode.current.gain.setValueAtTime(0.4, audioCtx.current.currentTime);
      }
      if (!isMusicPlaying.current && gameState === 'playing') {
        startBackgroundMusic();
      }
    }
  };

  useEffect(() => {
    if (gameState === 'playing') {
      if (!isMuted && !isMusicPlaying.current) startBackgroundMusic();
    } else {
      stopBackgroundMusic();
    }
    return () => { stopBackgroundMusic(); };
  }, [gameState]);

  useEffect(() => { return () => { stopBackgroundMusic(); }; }, []);

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

  const playTone = (frequency, duration = 0.15, type = 'sine') => {
    if (isMuted) return;
    try {
      initAudio();
      if (!audioCtx.current || !gainNode.current) return;
      const oscillator = audioCtx.current.createOscillator();
      const gain = audioCtx.current.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, audioCtx.current.currentTime);
      gain.gain.setValueAtTime(0.3, audioCtx.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.current.currentTime + duration);
      oscillator.connect(gain);
      gain.connect(gainNode.current);
      oscillator.start();
      oscillator.stop(audioCtx.current.currentTime + duration);
    } catch (e) {}
  };

  const playCardFlip = () => playTone(800, 0.06);
  const playMatchSuccess = () => { playTone(523.25, 0.1); setTimeout(() => playTone(659.25, 0.1), 100); setTimeout(() => playTone(783.99, 0.12), 200); };
  const playMatchFail = () => playTone(300, 0.2, 'sawtooth');
  const playGameOver = () => { playTone(400, 0.2, 'sawtooth'); setTimeout(() => playTone(300, 0.2, 'sawtooth'), 200); setTimeout(() => playTone(200, 0.3, 'sawtooth'), 400); };
  const playLevelUpSound = () => { playTone(440, 0.1); setTimeout(() => playTone(554.37, 0.1), 100); setTimeout(() => playTone(659.25, 0.15), 200); setTimeout(() => playTone(880, 0.2), 300); setTimeout(() => playTone(1046.5, 0.3), 500); };
  const playDiamondSound = () => { playTone(880, 0.08); setTimeout(() => playTone(1100, 0.1), 80); setTimeout(() => playTone(1320, 0.15), 160); };
  const playBuySound = () => { playTone(523.25, 0.1); setTimeout(() => playTone(783.99, 0.12), 100); setTimeout(() => playTone(1046.5, 0.18), 220); };
  const playCompletionFanfare = () => {
    [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00].forEach((f, i) => {
      setTimeout(() => playTone(f, 0.25), i * 130);
    });
  };

  const generateCards = (level) => {
    const pairsCount = LEVEL_PAIRS[level] || 10;
    const words = getWordsForLevel(level);
    const selected = [...words].sort(() => Math.random() - 0.5).slice(0, pairsCount);

    let deck = [];
    selected.forEach((item, index) => {
      deck.push({
        id: `${index}-w-${Date.now()}-${Math.random()}`,
        pairId: index, content: item.word, type: 'word', word: item.word,
        isFlipped: false, isMatched: false,
      });
      deck.push({
        id: `${index}-i-${Date.now()}-${Math.random()}`,
        pairId: index, content: item.image, type: 'image', word: item.word,
        isFlipped: false, isMatched: false,
      });
    });
    return deck.sort(() => Math.random() - 0.5);
  };

  const startLevel = (level) => {
    const newCards = generateCards(level);
    const config = LEVEL_CONFIG[level] || LEVEL_CONFIG['A1'];
    setCards(newCards);
    setMatches(0);
    setAttempts(0);
    setCorrectAnswers(0);
    setTotalAnswers(0);
    setAnsweredPairsInLevel(0);
    setFlippedCards([]);
    setIsLocked(false);
    setTimer(config.timer);
    setTimerRunning(true);
    setCurrentLevel(level);
    matchedWordsRef.current = [];
    wrongAttemptsRef.current = 0;
    sessionSavedRef.current = false;
  };

  const startGame = () => {
    if (!currentUser) return;
    if (lives <= 0) { setShowHeartShop(true); return; }
    setGameState('loading');
    setTimeout(() => {
      setScore(0);
      setDiamondsEarnedThisGame(0);
      setCompletionBonus(0);
      setContinueFromGameOver(false);
      firebaseSavedRef.current = false;
      diamondSavedRef.current = false;
      progressSavedRef.current = false;
      completionBonusSavedRef.current = false;
      sessionSavedRef.current = false;
      wrongAttemptsRef.current = 0;
      startLevel('A1');
      setGameState('playing');
      setShowNoLivesMessage(false);
    }, 2000);
  };

  const restartGame = () => { startGame(); };

  useEffect(() => {
    if (livesRef.current <= 0) { setTimerRunning(false); return; }
    if (timerRunning && timer > 0) {
      const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && timerRunning) {
      setTimerRunning(false);
      const newLives = livesRef.current - 1;
      livesRef.current = newLives;
      setLives(newLives);
      playMatchFail();

      setShowNoLivesMessage(true);
      setTimeout(() => { setGameState('gameover'); playGameOver(); }, 1500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer, timerRunning]);

  const handleCardClick = (index) => {
    if (isLocked || livesRef.current <= 0) return;
    if (cards[index].isMatched) return;
    if (flippedCards.includes(index)) return;
    if (flippedCards.length === 2) return;

    playCardFlip();
    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setIsLocked(true);
      const card1 = newCards[newFlipped[0]];
      const card2 = newCards[newFlipped[1]];

      if (card1.pairId === card2.pairId && newFlipped[0] !== newFlipped[1]) {
        setTimeout(() => {
          const matched = [...newCards];
          matched[newFlipped[0]].isMatched = true;
          matched[newFlipped[1]].isMatched = true;
          setCards(matched);
          setMatches(prev => prev + 1);
          setScore(prev => prev + 1);
          setAttempts(prev => prev + 1);
          setCorrectAnswers(prev => prev + 1);
          setTotalAnswers(prev => prev + 1);
          setAnsweredPairsInLevel(prev => prev + 1);
          setFlippedCards([]);
          setIsLocked(false);
          playMatchSuccess();

          wrongAttemptsRef.current = 0;

          const matchedWord = card1.type === 'word' ? card1.content : card2.word;
          if (matchedWord && !matchedWordsRef.current.includes(matchedWord)) {
            matchedWordsRef.current.push(matchedWord);
          }
        }, 500);
      } else {
        setTimeout(() => {
          const flippedBack = [...newCards];
          flippedBack[newFlipped[0]].isFlipped = false;
          flippedBack[newFlipped[1]].isFlipped = false;
          setCards(flippedBack);
          setFlippedCards([]);
          setIsLocked(false);
          setAttempts(prev => prev + 1);
          setTotalAnswers(prev => prev + 1);
          playMatchFail();

          wrongAttemptsRef.current += 1;
          if (wrongAttemptsRef.current >= 5) {
            const newLives = livesRef.current - 1;
            livesRef.current = newLives;
            setLives(newLives);
            wrongAttemptsRef.current = 0;

            if (newLives === 0) {
              setShowNoLivesMessage(true);
              setTimeout(() => { setGameState('gameover'); playGameOver(); }, 1500);
            }
          }
        }, 700);
      }
    }
  };

  useEffect(() => {
    if (gameState !== 'playing') return;
    const totalPairsNeeded = LEVEL_PAIRS[currentLevel] || 10;
    if (matches === totalPairsNeeded && totalPairsNeeded > 0) {
      if (answeredPairsInLevel === totalPairsNeeded) {
        setTimerRunning(false);

        const awardLevelDiamonds = async () => {
          if (!currentUser) return;
          const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
          try {
            const result = await claimGameDiamonds(currentUser.uid, 'matchGame', accuracy);
            if (result.earned > 0) {
              setDiamondsEarnedThisGame(prev => prev + result.earned);
              setLocalDiamonds(result.newBalance);
              playDiamondSound();
            }
          } catch (err) {
            console.error('Error claiming level diamonds:', err);
          }
        };
        awardLevelDiamonds();

        const currentIdx = CEFR_LEVELS.indexOf(currentLevel);
        if (currentIdx === CEFR_LEVELS.length - 1) {
          playCompletionFanfare();
          setTimeout(() => { setGameState('finished'); }, 1500);
        } else {
          const nextLvl = CEFR_LEVELS[currentIdx + 1];
          setPreviousLevel(currentLevel);
          setNextLevelName(nextLvl);
          playLevelUpSound();
          setTimeout(() => { setGameState('levelup'); }, 800);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matches, answeredPairsInLevel, gameState, currentLevel]);

  const saveGameProgress = (isWin) => {
    if (sessionSavedRef.current) return;
    sessionSavedRef.current = true;

    const wordsList = [...matchedWordsRef.current];
    const saved = localStorage.getItem('vocaboplay_progress');
    const currentProgress = saved ? JSON.parse(saved) : {};
    const today = new Date().toDateString();
    const lastPlayed = localStorage.getItem('vocaboplay_lastPlayed');
    let newStreak = currentProgress.streak || 0;
    if (!lastPlayed || lastPlayed !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastPlayed === yesterday.toDateString()) newStreak = (currentProgress.streak || 0) + 1;
      else newStreak = 1;
      localStorage.setItem('vocaboplay_lastPlayed', today);
    }

    const progressFn = updateProgressRef.current;
    const recordFn = recordGameRef.current;

    if (progressFn) {
      progressFn({
        gamesPlayed: 1, totalPoints: score, xp: score,
        wordsLearned: correctAnswers, totalAnswers, correctAnswers,
        streak: newStreak,
        MatchGame: { gamesCompleted: 1, correctAnswers, totalQuestions: totalAnswers },
      }).then(() => {
        if (recordFn) recordFn('match', score, correctAnswers, totalAnswers, wordsList);
      }).catch(err => console.error('Error saving progress:', err));
    }
  };

  const saveGameToFirebase = async () => {
    if (!currentUser) return;
    const gameData = {
      gameType: 'matchGame',
      pointsEarned: score || 0,
      newWordsLearned: correctAnswers || 0,
      correctAnswers: correctAnswers || 0,
      totalQuestions: totalAnswers || 0,
      won: correctAnswers >= totalAnswers / 2,
      score: score || 0,
      levelReached: currentLevel,
    };
    try { await updateUserStats(currentUser.uid, gameData); }
    catch (err) { console.error('Error saving to Firebase:', err); }
  };

  useEffect(() => {
    if (gameState !== 'gameover' && gameState !== 'finished') return;

    if (!firebaseSavedRef.current && currentUser) {
      firebaseSavedRef.current = true;
      saveGameToFirebase();
    }

    if (gameState === 'finished' && !completionBonusSavedRef.current && currentUser) {
      completionBonusSavedRef.current = true;
      (async () => {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userRef);
          const currentDiamonds = userDoc.data()?.totalDiamonds || 0;
          const newTotal = currentDiamonds + COMPLETION_BONUS_DIAMONDS;
          await updateDoc(userRef, { totalDiamonds: newTotal });
          setLocalDiamonds(newTotal);
          setCompletionBonus(COMPLETION_BONUS_DIAMONDS);
          playDiamondSound();
        } catch (err) {
          console.error('Error awarding completion bonus:', err);
        }
      })();
    }

    if (!progressSavedRef.current && currentUser) {
      progressSavedRef.current = true;
      saveGameProgress(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  const handleBuyHearts = async (heartPackage) => {
    if (!currentUser || heartShopProcessing) return;
    if (localDiamonds < heartPackage.diamonds) { playMatchFail(); return; }
    setHeartShopProcessing(true);
    try {
      const result = await spendDiamonds(currentUser.uid, heartPackage.diamonds);
      if (!result.success) { setHeartShopProcessing(false); return; }

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
        completionBonusSavedRef.current = false;
        setDiamondsEarnedThisGame(0);
        setCompletionBonus(0);
        setScore(0);
        setContinueFromGameOver(false);
        wrongAttemptsRef.current = 0;
        startLevel(currentLevel);
        setGameState('playing');
      }
    } catch (err) {
      console.error('Error buying hearts:', err);
    } finally { setHeartShopProcessing(false); }
  };

  const openHeartShopFromGameOver = () => { setContinueFromGameOver(true); setShowHeartShop(true); };
  const giveUpGame = () => { setContinueFromGameOver(false); setGameState('intro'); };

  const handleExitGame = () => {
    if (gameState === 'playing' && !sessionSavedRef.current && currentUser) {
      progressSavedRef.current = true;
      saveGameProgress(false);
      saveGameToFirebase();
    }
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    setShowExitConfirm(false);
    setShowSettings(false);
    stopBackgroundMusic();
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
    setDiamondsEarnedThisGame(0);
    setCompletionBonus(0);
    firebaseSavedRef.current = false;
    diamondSavedRef.current = false;
    progressSavedRef.current = false;
    completionBonusSavedRef.current = false;
    sessionSavedRef.current = false;
    wrongAttemptsRef.current = 0;
    startLevel(level);
    setGameState('playing');
    setShowNoLivesMessage(false);
  };

  const devForceLevelUp = (from, to) => {
    setPreviousLevel(from);
    setNextLevelName(to);
    setCurrentLevel(from);
    setGameState('levelup');
    playLevelUpSound();
  };

  const devForceGameOver = () => {
    setGameState('gameover');
    setShowNoLivesMessage(false);
  };

  const devForceFinished = () => {
    setCurrentLevel('C2');
    setGameState('finished');
  };

  const DevPanelElement = () => {
    if (!showDevPanel) return null;
    return (
      <MatchGameDevPanel
        currentLevel={currentLevel}
        onJumpToLevel={devJumpToLevel}
        onForceLevelUp={devForceLevelUp}
        onForceGameOver={devForceGameOver}
        onForceFinished={devForceFinished}
      />
    );
  };

  const ExitConfirmModal = () => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(42, 40, 69, 0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
      <div className="mg-modal-card" style={{ background: palette.white, borderRadius: '18px', padding: '28px', maxWidth: '340px', width: '100%', textAlign: 'center', border: `1.5px solid ${palette.border}`, boxShadow: '0 20px 50px rgba(42, 40, 69, 0.3)' }}>
        <div className="mg-modal-emoji" style={{ fontSize: '40px', marginBottom: '8px' }}>❌</div>
        <h3 style={{ fontSize: '18px', fontWeight: '800', color: palette.deepNavy, marginBottom: '6px', fontFamily: FONT_DISPLAY }}>Exit Game?</h3>
        <p style={{ fontSize: '13px', color: palette.bodyTextSoft, marginBottom: '20px', fontFamily: FONT_BODY, fontWeight: 600 }}>Your progress will be saved.</p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={confirmExit} className="mg-modal-btn" style={{ flex: 1, padding: '10px', background: palette.danger, color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '800', fontFamily: FONT_DISPLAY, boxShadow: `0 3px 0 ${palette.dangerShadow}` }}>Yes, End</button>
          <button onClick={cancelExit} className="mg-modal-btn" style={{ flex: 1, padding: '10px', background: palette.creamSoft, color: palette.deepNavy, border: `1.5px solid ${palette.border}`, borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '800', fontFamily: FONT_DISPLAY }}>Cancel</button>
        </div>
      </div>
    </div>
  );

  const HeartShopModal = () => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(42, 40, 69, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2500, padding: '20px' }}>
      <div className="mg-modal-card" style={{ background: palette.white, borderRadius: '20px', padding: '28px 24px', maxWidth: '460px', width: '100%', border: `1.5px solid ${palette.border}`, boxShadow: '0 20px 50px rgba(42, 40, 69, 0.4)' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div className="mg-modal-emoji" style={{ fontSize: '48px', marginBottom: '4px' }}>❤️</div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: palette.deepNavy, marginBottom: '4px', fontFamily: FONT_DISPLAY }}>
            {continueFromGameOver ? 'Continue Playing?' : 'Refill Hearts'}
          </h2>
          <p style={{ fontSize: '13px', color: palette.bodyTextSoft, fontWeight: 600, fontFamily: FONT_BODY }}>
            {continueFromGameOver ? `You reached ${currentLevel}! Buy hearts to continue!` : 'Buy hearts with diamonds to keep playing'}
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
                className="mg-modal-price-btn"
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
          <button onClick={() => { setShowHeartShop(false); setContinueFromGameOver(false); }} className="mg-modal-btn" style={{ flex: 1, padding: '12px', borderRadius: '12px', border: `1.5px solid ${palette.border}`, background: palette.creamSoft, color: palette.bodyText, cursor: 'pointer', fontSize: '13px', fontWeight: '800', fontFamily: FONT_DISPLAY }}>Cancel</button>
          {continueFromGameOver && (
            <button onClick={() => { setShowHeartShop(false); setContinueFromGameOver(false); giveUpGame(); }} className="mg-modal-btn" style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: palette.danger, color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '800', fontFamily: FONT_DISPLAY, boxShadow: `0 3px 0 ${palette.dangerShadow}` }}>Give Up</button>
          )}
        </div>
        <p style={{ fontSize: '10px', color: palette.bodyTextSoft, textAlign: 'center', marginTop: '12px', fontFamily: FONT_BODY, fontWeight: 600 }}>💡 Earn diamonds by playing with high accuracy!</p>
      </div>
    </div>
  );

  const SettingsModal = () => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(42, 40, 69, 0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={() => setShowSettings(false)}>
      <div className="mg-modal-card" style={{ background: palette.white, borderRadius: '18px', padding: '24px', maxWidth: '360px', width: '100%', maxHeight: '90dvh', overflow: 'auto', border: `1.5px solid ${palette.border}`, boxShadow: '0 20px 50px rgba(42, 40, 69, 0.3)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: '800', color: palette.deepNavy, fontFamily: FONT_DISPLAY }}>Settings</h3>
          <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: palette.bodyTextSoft }}>✕</button>
        </div>
        <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: palette.bodyText, fontFamily: FONT_DISPLAY }}>🎵 Background Music</span>
          <button onClick={toggleMusic} className="mg-modal-btn" style={{ padding: '3px 14px', borderRadius: '8px', border: 'none', background: isMuted ? palette.danger : palette.softGreen, color: 'white', cursor: 'pointer', fontSize: '11px', fontWeight: '800', fontFamily: FONT_DISPLAY }}>{isMuted ? 'OFF' : 'ON'}</button>
        </div>
        <button onClick={() => { setShowLeaderboard(true); setShowSettings(false); }} className="mg-modal-btn" style={{ width: '100%', padding: '9px', borderRadius: '8px', border: `1.5px solid ${palette.border}`, background: palette.creamSoft, color: palette.bodyText, cursor: 'pointer', fontSize: '12px', fontWeight: '800', marginBottom: '6px', fontFamily: FONT_DISPLAY }}>🏆 Leaderboard</button>
        <button onClick={handleExitGame} className="mg-modal-btn" style={{ width: '100%', padding: '9px', borderRadius: '8px', border: `1.5px solid ${palette.danger}40`, background: `${palette.danger}10`, color: palette.danger, cursor: 'pointer', fontSize: '12px', fontWeight: '800', marginBottom: '6px', fontFamily: FONT_DISPLAY }}>❌ Exit Game</button>
        <button onClick={() => { setShowSettings(false); setGameState('intro'); }} className="mg-modal-btn" style={{ width: '100%', padding: '9px', borderRadius: '8px', border: `1.5px solid ${palette.border}`, background: palette.creamSoft, color: palette.bodyText, cursor: 'pointer', fontSize: '12px', fontWeight: '800', fontFamily: FONT_DISPLAY }}>🔄 New Game</button>
      </div>
    </div>
  );

  const LeaderboardModal = () => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(42, 40, 69, 0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={() => setShowLeaderboard(false)}>
      <div className="mg-modal-card" style={{ background: palette.white, borderRadius: '18px', padding: '20px', maxWidth: '380px', width: '100%', maxHeight: '90dvh', overflow: 'auto', border: `1.5px solid ${palette.border}`, boxShadow: '0 20px 50px rgba(42, 40, 69, 0.3)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: '800', color: palette.deepNavy, fontFamily: FONT_DISPLAY }}>🏆 Leaderboard</h3>
          <button onClick={() => setShowLeaderboard(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: palette.bodyTextSoft }}>✕</button>
        </div>
        {leaderboardData.length === 0 ? (
          <div style={{ textAlign: 'center', color: palette.bodyTextSoft, padding: '24px 0' }}>
            <div style={{ fontSize: '36px', marginBottom: '6px' }}>📊</div>
            <p style={{ fontSize: '13px', fontFamily: FONT_BODY, fontWeight: 600 }}>No scores yet!</p>
          </div>
        ) : leaderboardData.map((entry, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', padding: '8px 10px', borderRadius: '8px', background: index < 3 ? `${palette.warmOrange}10` : 'transparent', marginBottom: '4px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: index === 0 ? palette.gold : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : palette.creamSoft, color: index < 3 ? '#fff' : palette.bodyTextSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', marginRight: '10px', fontFamily: FONT_DISPLAY }}>{index + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '800', fontSize: '13px', color: palette.deepNavy, fontFamily: FONT_DISPLAY }}>{entry.name || 'Player'}</div>
              <div style={{ fontSize: '10px', color: palette.bodyTextSoft, fontFamily: FONT_BODY, fontWeight: 600 }}>Level {entry.level || 'A1'} • {entry.pairs || 0} pairs</div>
            </div>
            <div style={{ fontWeight: '800', fontSize: '15px', color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>{entry.score}</div>
          </div>
        ))}
        <button onClick={() => setShowLeaderboard(false)} className="mg-modal-btn" style={{ width: '100%', padding: '9px', borderRadius: '8px', border: 'none', background: palette.warmOrange, color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: '800', marginTop: '10px', fontFamily: FONT_DISPLAY, boxShadow: `0 3px 0 ${palette.warmOrangeShadow}` }}>Close</button>
      </div>
    </div>
  );

  const NoLivesOverlay = () => {
    if (!showNoLivesMessage && lives > 0) return null;
    if (gameState !== 'playing') return null;
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(42, 40, 69, 0.75)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
        <div className="mg-modal-card" style={{ background: palette.white, borderRadius: '20px', padding: '32px', maxWidth: '380px', width: '100%', textAlign: 'center', border: `1.5px solid ${palette.border}`, boxShadow: '0 20px 50px rgba(42, 40, 69, 0.3)' }}>
          <div className="mg-modal-emoji" style={{ fontSize: '56px', marginBottom: '8px' }}>😢</div>
          <h3 style={{ fontSize: '22px', fontWeight: '800', color: palette.deepNavy, marginBottom: '4px', fontFamily: FONT_DISPLAY }}>No Hearts Left!</h3>
          <p style={{ fontSize: '14px', color: palette.bodyTextSoft, marginBottom: '16px', fontFamily: FONT_BODY, fontWeight: 600 }}>Wait for refill or buy with diamonds</p>
          <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
            <button onClick={() => { setShowNoLivesMessage(false); setContinueFromGameOver(true); setShowHeartShop(true); }} className="mg-modal-btn" style={{ width: '100%', padding: '12px', background: `linear-gradient(135deg, ${palette.diamond}, ${palette.diamondShadow})`, color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '800', fontFamily: FONT_DISPLAY, boxShadow: `0 3px 0 ${palette.diamondShadow}` }}>💎 Buy Hearts & Continue</button>
            <button onClick={() => { setShowNoLivesMessage(false); setGameState('intro'); }} className="mg-modal-btn" style={{ width: '100%', padding: '12px', background: palette.creamSoft, color: palette.bodyText, border: `1.5px solid ${palette.border}`, borderRadius: '12px', cursor: 'pointer', fontSize: '13px', fontWeight: '800', fontFamily: FONT_DISPLAY }}>Back to Menu</button>
          </div>
        </div>
      </div>
    );
  };

  if (gameState === 'loading') {
    return (
      <div style={{ ...fullScreenBg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', overflow: 'hidden' }}>
        {bgAnimationStyle}
        {DevPanelElement()}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
          <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', top: '10%', left: '5%', animation: 'floatShape 8s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', bottom: '15%', right: '8%', animation: 'floatShape 10s ease-in-out infinite reverse' }} />
          <div style={{ position: 'absolute', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', animation: 'pulseShape 4s ease-in-out infinite' }} />
          {[...Array(12)].map((_, i) => (
            <div key={i} style={{ position: 'absolute', width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', top: `${10 + Math.random() * 80}%`, left: `${10 + Math.random() * 80}%`, animation: `twinkle 2s ease-in-out ${i * 0.3}s infinite` }} />
          ))}
        </div>
        <div className="mg-loading-card" style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '400px', width: '100%', padding: '40px', background: 'rgba(255, 255, 255, 0.06)', backdropFilter: 'blur(16px)', borderRadius: '24px', border: `1.5px solid ${palette.border}30` }}>
          <div className="mg-loading-spinner" style={{ width: '80px', height: '80px', margin: '0 auto 24px', position: 'relative', animation: 'spin 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite' }}>
            <div style={{ position: 'absolute', width: '100%', height: '100%', border: '4px solid rgba(255,255,255,0.2)', borderRadius: '16px', borderTop: `4px solid ${palette.warmOrange}`, animation: 'spinBorder 1.2s ease-in-out infinite' }}>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '32px' }}>🧩</div>
            </div>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#FFFFFF', marginBottom: '8px', fontFamily: FONT_DISPLAY, animation: 'fadeInOut 1.5s ease-in-out infinite' }}>Loading...</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: palette.warmOrange, animation: `bounceDot 1.4s ease-in-out ${i * 0.3}s infinite` }} />
            ))}
          </div>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', marginTop: '16px', fontStyle: 'italic', fontFamily: FONT_BODY, fontWeight: 600 }}>Preparing your game...</p>
        </div>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          @keyframes spinBorder { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          @keyframes fadeInOut { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
          @keyframes bounceDot { 0%, 100% { transform: scale(0.5); opacity: 0.3; } 50% { transform: scale(1.2); opacity: 1; } }
          @keyframes floatShape { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-30px); } }
          @keyframes pulseShape { 0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; } 50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.1; } }
          @keyframes twinkle { 0%, 100% { opacity: 0.1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.5); } }
        `}</style>
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
        <div className="mg-intro-card" style={{ maxWidth: '520px', width: '100%', background: theme.cardBg, borderRadius: '24px', padding: '32px 28px', border: theme.cardBorder, boxShadow: theme.cardShadow, textAlign: 'center', maxHeight: 'calc(100dvh - 12px)', overflowY: 'auto' }}>
          <div className="mg-intro-icon" style={{ width: '84px', height: '84px', borderRadius: '50%', background: theme.accentGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: `0 8px 24px ${palette.warmOrange}40` }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: palette.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>🧩</div>
          </div>
          {currentUser && (
            <div style={{ background: theme.chipBg, padding: '4px 14px', borderRadius: '10px', marginBottom: '10px', display: 'inline-block', border: `1px solid ${palette.border}` }}>
              <span style={{ fontSize: '12px', color: palette.bodyText, fontWeight: '700', fontFamily: FONT_BODY }}>👤 {currentUser.displayName || currentUser.email || 'Player'}</span>
            </div>
          )}
          <h1 style={{ fontSize: '30px', fontWeight: '800', color: theme.textPrimary, marginBottom: '2px', letterSpacing: '-0.5px', fontFamily: FONT_DISPLAY }}>Match Game</h1>
          <p style={{ fontSize: '12px', color: theme.textSecondary, marginBottom: '16px', fontWeight: '600', fontFamily: FONT_BODY }}>🧩 Match words with images • CEFR A1 to C2!</p>
          <div className="mg-intro-chips" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
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
          <div className="mg-intro-levels" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px', marginBottom: '14px', background: theme.surfaceBg, padding: '8px', borderRadius: '10px', border: `1px solid ${theme.surfaceBorder}` }}>
            {CEFR_LEVELS.map((level) => {
              const config = LEVEL_CONFIG[level];
              const pairs = LEVEL_PAIRS[level];
              return (
                <div key={level} className="mg-intro-level-item" style={{ padding: '4px', borderRadius: '6px', background: level === 'A1' || level === 'A2' ? `${palette.softGreen}15` : level === 'B1' || level === 'B2' ? `${palette.warmOrange}15` : `${palette.coral}15`, textAlign: 'center', fontSize: '9px', fontWeight: '800', color: level === 'A1' || level === 'A2' ? palette.softGreen : level === 'B1' || level === 'B2' ? palette.warmOrange : palette.coral, border: `1px solid ${palette.border}`, fontFamily: FONT_DISPLAY }}>
                  <div style={{ fontSize: '12px' }}>{config.emoji}</div>
                  <div>{level}</div>
                  <div style={{ fontSize: '7px', opacity: 0.75 }}>{pairs}p</div>
                  <div style={{ fontSize: '7px', opacity: 0.6 }}>{config.timer}s</div>
                </div>
              );
            })}
          </div>
          <div className="mg-intro-hearts" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '14px', padding: '10px', background: theme.surfaceBg, borderRadius: '10px', border: `1px solid ${theme.surfaceBorder}` }}>
            <div style={{ display: 'flex', gap: '1px' }}>
              {[...Array(lives)].map((_, i) => (<span key={i} style={{ fontSize: '18px' }}>❤️</span>))}
              {[...Array(maxLives - lives)].map((_, i) => (<span key={i} style={{ fontSize: '18px', opacity: 0.2 }}>❤️</span>))}
            </div>
            <span style={{ fontSize: '12px', color: theme.textSecondary, marginLeft: '4px', fontWeight: '600', fontFamily: FONT_BODY }}>{lives > 0 ? `${lives}/${maxLives} hearts` : 'No hearts'}</span>
            {lives < maxLives && timeRemaining && (<span style={{ fontSize: '11px', color: palette.warmOrange, fontWeight: '700', fontFamily: FONT_BODY }}>⏳ {timeRemaining}</span>)}
          </div>
          <div className="mg-intro-music" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '14px', padding: '8px 12px', background: theme.surfaceBg, border: `1px solid ${theme.surfaceBorder}`, borderRadius: '10px' }}>
            <button onClick={toggleMusic} style={{ padding: '4px 14px', borderRadius: '8px', border: 'none', background: isMuted ? palette.danger : palette.softGreen, color: 'white', cursor: 'pointer', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: FONT_DISPLAY }}>
              {isMuted ? '🔇 Music Off' : '🔊 Music On'}
            </button>
            <span style={{ fontSize: '10px', color: palette.bodyTextSoft, fontFamily: FONT_BODY, fontWeight: 600 }}>🎵 8-bit vibes</span>
          </div>
          {lives > 0 ? (
            <button onClick={startGame} className="mg-intro-start-btn" style={{ width: '100%', padding: '14px', background: theme.accentGradient, color: 'white', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', boxShadow: `0 3px 0 ${palette.warmOrangeShadow}`, fontFamily: FONT_DISPLAY, textTransform: 'uppercase' }}>🚀 Start Game</button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ width: '100%', padding: '12px', background: theme.surfaceBg, color: theme.textSecondary, border: `1.5px solid ${palette.border}`, borderRadius: '12px', fontSize: '12px', fontWeight: '800', fontFamily: FONT_DISPLAY, textAlign: 'center' }}>
                ⏳ No Hearts — Refill: {timeRemaining || '30m'}
              </div>
              <button onClick={() => { setContinueFromGameOver(false); setShowHeartShop(true); }} className="mg-intro-start-btn" style={{ width: '100%', padding: '14px', background: `linear-gradient(135deg, ${palette.diamond}, ${palette.diamondShadow})`, color: 'white', border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: '800', cursor: 'pointer', boxShadow: `0 3px 0 ${palette.diamondShadow}`, fontFamily: FONT_DISPLAY }}>
                💎 Buy Hearts ({localDiamonds} 💎)
              </button>
            </div>
          )}
          {(onExitToGames || onBack) && (<button onClick={onExitToGames || onBack} className="mg-intro-back-btn" style={{ marginTop: '10px', width: '100%', padding: '10px', background: 'transparent', color: theme.textSecondary, border: `1.5px solid ${palette.border}`, borderRadius: '12px', cursor: 'pointer', fontSize: '12px', fontWeight: '800', fontFamily: FONT_DISPLAY }}>← Back</button>)}
        </div>
      </div>
    );
  }

  if (gameState === 'levelup') {
    const nextConfig = LEVEL_CONFIG[nextLevelName];
    const nextPairs = LEVEL_PAIRS[nextLevelName];
    const nextTimer = nextConfig?.timer || 80;

    return (
      <div style={{ ...fullScreenBg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        {bgAnimationStyle}
        {DevPanelElement()}
        <div className="mg-levelup-card" style={{
          maxWidth: '440px', width: '100%', background: palette.white, borderRadius: '28px',
          padding: '40px 32px', textAlign: 'center', border: `3px solid ${palette.warmOrange}`,
          boxShadow: `0 30px 80px rgba(0,0,0,0.4), 0 0 0 8px rgba(233, 160, 117, 0.2)`,
          animation: 'levelPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)', position: 'relative',
          maxHeight: 'calc(100dvh - 12px)', overflowY: 'auto',
        }}>
          <div style={{ position: 'absolute', top: '-12px', left: '20%', fontSize: '28px', animation: 'floatUp 2s ease-in-out infinite' }}>✨</div>
          <div style={{ position: 'absolute', top: '-12px', right: '20%', fontSize: '28px', animation: 'floatUp 2s ease-in-out infinite 0.3s' }}>🎉</div>
          <div className="mg-levelup-emoji" style={{ fontSize: '72px', marginBottom: '8px', lineHeight: 1 }}>🏆</div>
          <h2 className="mg-levelup-title" style={{ fontSize: '32px', fontWeight: '900', color: palette.warmOrange, fontFamily: FONT_DISPLAY, marginBottom: '8px', letterSpacing: '1px', textShadow: `0 3px 0 ${palette.warmOrangeShadow}` }}>
            LEVEL UP!
          </h2>
          <p className="mg-levelup-sub" style={{ fontSize: '14px', color: palette.bodyTextSoft, fontFamily: FONT_BODY, fontWeight: '600', marginBottom: '24px' }}>
            You cleared {previousLevel}! Ready for the next challenge?
          </p>
          <div className="mg-levelup-badges" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '20px' }}>
            <div style={{ padding: '12px 22px', background: palette.creamSoft, borderRadius: '16px', border: `2px solid ${palette.border}`, fontFamily: FONT_DISPLAY, fontWeight: '800', fontSize: '18px', color: palette.bodyTextSoft, textDecoration: 'line-through', opacity: 0.7 }}>
              {previousLevel}
            </div>
            <div style={{ fontSize: '24px', color: palette.warmOrange, animation: 'arrowSlide 1.2s ease-in-out infinite' }}>→</div>
            <div style={{ padding: '14px 26px', background: theme.accentGradient, borderRadius: '16px', border: `2px solid ${palette.warmOrange}`, fontFamily: FONT_DISPLAY, fontWeight: '900', fontSize: '22px', color: 'white', boxShadow: `0 4px 0 ${palette.warmOrangeShadow}, 0 0 20px ${palette.warmOrange}60` }}>
              {nextLevelName}
            </div>
          </div>
          <div className="mg-levelup-stats" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
            <div className="mg-levelup-stat-box" style={{ padding: '14px', background: palette.creamSoft, borderRadius: '12px', border: `1.5px solid ${palette.border}` }}>
              <div style={{ fontSize: '22px', marginBottom: '4px' }}>🃏</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>{nextPairs} pairs</div>
              <div style={{ fontSize: '10px', color: palette.bodyTextSoft, fontFamily: FONT_BODY, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cards</div>
            </div>
            <div className="mg-levelup-stat-box" style={{ padding: '14px', background: palette.creamSoft, borderRadius: '12px', border: `1.5px solid ${palette.border}` }}>
              <div style={{ fontSize: '22px', marginBottom: '4px' }}>⏱</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>{nextTimer}s</div>
              <div style={{ fontSize: '10px', color: palette.bodyTextSoft, fontFamily: FONT_BODY, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Time Limit</div>
            </div>
          </div>
          <button
            onClick={() => { startLevel(nextLevelName); setGameState('playing'); }}
            className="mg-levelup-btn"
            style={{ width: '100%', padding: '16px', background: theme.accentGradient, color: 'white', border: 'none', borderRadius: '16px', fontSize: '16px', fontWeight: '900', cursor: 'pointer', boxShadow: `0 4px 0 ${palette.warmOrangeShadow}`, fontFamily: FONT_DISPLAY, textTransform: 'uppercase', letterSpacing: '1px' }}
          >
            Continue →
          </button>
          <style>{`
            @keyframes levelPop { 0% { transform: scale(0.5) translateY(20px); opacity: 0; } 60% { transform: scale(1.05) translateY(-3px); opacity: 1; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
            @keyframes floatUp { 0%, 100% { transform: translateY(0); opacity: 1; } 50% { transform: translateY(-8px); opacity: 0.7; } }
            @keyframes arrowSlide { 0%, 100% { transform: translateX(0); opacity: 1; } 50% { transform: translateX(6px); opacity: 0.6; } }
          `}</style>
        </div>
      </div>
    );
  }

  if (gameState === 'gameover' || gameState === 'finished') {
    const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
    const isFinished = gameState === 'finished';
    return (
      <div style={{ ...fullScreenBg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        {bgAnimationStyle}
        {DevPanelElement()}
        {showHeartShop && <HeartShopModal />}
        <div className="mg-gameover-card" style={{ maxWidth: '520px', width: '100%', background: theme.cardBg, borderRadius: '24px', padding: '32px 28px', border: theme.cardBorder, boxShadow: theme.cardShadow, textAlign: 'center', maxHeight: 'calc(100dvh - 12px)', overflowY: 'auto' }}>
          <div className="mg-gameover-emoji" style={{ fontSize: '64px', marginBottom: '6px' }}>{isFinished ? '👑' : '💀'}</div>
          <h2 className="mg-gameover-title" style={{ fontSize: '26px', fontWeight: '800', color: isFinished ? palette.gold : theme.textPrimary, marginBottom: '4px', fontFamily: FONT_DISPLAY }}>
            {isFinished ? 'All Levels Complete!' : 'Game Over!'}
          </h2>
          <p className="mg-gameover-sub" style={{ fontSize: '13px', color: theme.textSecondary, marginBottom: '16px', fontFamily: FONT_BODY, fontWeight: 600 }}>
            {isFinished ? (
              <>You mastered <strong style={{ color: palette.gold, fontFamily: FONT_DISPLAY }}>A1 → C2</strong>! 🎉</>
            ) : (
              <>Reached <strong style={{ color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>{currentLevel}</strong> with <strong style={{ color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>{correctAnswers}</strong> correct!</>
            )}
          </p>
          <div className="mg-gameover-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
            <div className="mg-gameover-stat-box" style={{ padding: '12px', background: theme.surfaceBg, borderRadius: '10px', border: `1.5px solid ${palette.border}` }}>
              <div style={{ fontSize: '20px', fontWeight: '800', color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>{score}</div>
              <div style={{ fontSize: '10px', color: theme.textSecondary, fontFamily: FONT_DISPLAY, fontWeight: 800 }}>SCORE</div>
            </div>
            <div className="mg-gameover-stat-box" style={{ padding: '12px', background: theme.surfaceBg, borderRadius: '10px', border: `1.5px solid ${palette.border}` }}>
              <div style={{ fontSize: '20px', fontWeight: '800', color: palette.teal, fontFamily: FONT_DISPLAY }}>{accuracy}%</div>
              <div style={{ fontSize: '10px', color: theme.textSecondary, fontFamily: FONT_DISPLAY, fontWeight: 800 }}>ACCURACY</div>
            </div>
            <div className="mg-gameover-stat-box" style={{ padding: '12px', background: theme.surfaceBg, borderRadius: '10px', border: `1.5px solid ${palette.border}` }}>
              <div style={{ fontSize: '20px', fontWeight: '800', color: palette.gold, fontFamily: FONT_DISPLAY }}>{attempts}</div>
              <div style={{ fontSize: '10px', color: theme.textSecondary, fontFamily: FONT_DISPLAY, fontWeight: 800 }}>ATTEMPTS</div>
            </div>
          </div>
          {diamondsEarnedThisGame > 0 && (
            <div className="mg-gameover-reward" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: `linear-gradient(135deg, ${palette.diamond}15, ${palette.diamond}08)`, borderRadius: '12px', marginBottom: '12px', border: `1.5px solid ${palette.diamond}50` }}>
              <span style={{ fontSize: '20px' }}>💎</span>
              <span style={{ fontSize: '16px', fontWeight: '800', color: palette.diamond, fontFamily: FONT_DISPLAY }}>+{diamondsEarnedThisGame} diamonds</span>
            </div>
          )}
          {isFinished && completionBonus > 0 && (
            <div className="mg-gameover-reward" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '16px', background: `linear-gradient(135deg, #FEF3C7, #FDE68A)`, borderRadius: '14px', marginBottom: '16px', border: `2px solid ${palette.gold}`, boxShadow: `0 4px 0 #B45309, 0 0 24px ${palette.gold}80`, animation: 'bonusPop 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
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
            {!isFinished && (
              <button onClick={openHeartShopFromGameOver} className="mg-gameover-btn" style={{ padding: '13px', background: `linear-gradient(135deg, ${palette.diamond}, ${palette.diamondShadow})`, color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '800', boxShadow: `0 3px 0 ${palette.diamondShadow}`, fontFamily: FONT_DISPLAY }}>
                💎 Continue with Hearts ({localDiamonds} 💎)
              </button>
            )}
            <button onClick={restartGame} disabled={lives <= 0} className="mg-gameover-btn" style={{ padding: '12px', background: lives > 0 ? theme.accentGradient : palette.creamSoft, color: lives > 0 ? 'white' : palette.bodyTextSoft, border: 'none', borderRadius: '12px', cursor: lives > 0 ? 'pointer' : 'not-allowed', fontSize: '13px', fontWeight: '800', fontFamily: FONT_DISPLAY }}>
              {lives > 0 ? '🔄 Play Again' : `⏳ No Hearts — ${timeRemaining}`}
            </button>
            <button onClick={() => setGameState('intro')} className="mg-gameover-btn" style={{ padding: '10px', background: palette.creamSoft, color: palette.bodyText, border: `1.5px solid ${palette.border}`, borderRadius: '12px', cursor: 'pointer', fontSize: '12px', fontWeight: '800', fontFamily: FONT_DISPLAY }}>Back to Menu</button>
          </div>
          <style>{`
            @keyframes bonusPop { 0% { transform: scale(0.5) translateY(15px); opacity: 0; } 60% { transform: scale(1.08) translateY(-3px); opacity: 1; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
            @keyframes sparkle { 0%, 100% { opacity: 0.4; transform: scale(1) rotate(0deg); } 50% { opacity: 1; transform: scale(1.3) rotate(15deg); } }
          `}</style>
        </div>
      </div>
    );
  }

  if (gameState === 'playing') {
    const config = LEVEL_CONFIG[currentLevel] || LEVEL_CONFIG['A1'];
    const totalPairs = LEVEL_PAIRS[currentLevel] || 10;
    const gridConfig = LEVEL_GRID[currentLevel] || { cols: 5, maxWidth: '560px' };
    const progress = (matches / totalPairs) * 100;

    return (
      <div style={{ ...fullScreenBg, padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100dvh', overflow: 'hidden', boxSizing: 'border-box' }}>
        {bgAnimationStyle}
        {DevPanelElement()}
        <NoLivesOverlay />
        {showExitConfirm && <ExitConfirmModal />}
        {showSettings && <SettingsModal />}
        {showLeaderboard && <LeaderboardModal />}
        {showHeartShop && <HeartShopModal />}
        <div className="mg-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', background: 'rgba(255,255,255,0.9)', borderRadius: '14px', maxWidth: gridConfig.maxWidth, width: '100%', margin: '0 auto 10px', border: `1.5px solid ${palette.border}`, transition: 'max-width 0.3s ease', boxSizing: 'border-box', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <button onClick={() => setShowSettings(true)} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: palette.bodyText, padding: 0, lineHeight: 1 }}>⚙️</button>
            <span style={{ fontWeight: '800', color: palette.deepNavy, fontSize: '12px', fontFamily: FONT_DISPLAY, whiteSpace: 'nowrap' }}>🧩 {config.emoji} Lv.{currentLevel}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'nowrap', justifyContent: 'flex-end' }}>
            <div style={{ fontSize: '10px', color: palette.bodyText, fontWeight: '800', background: palette.creamSoft, padding: '2px 8px', borderRadius: '8px', fontFamily: FONT_DISPLAY, border: `1px solid ${palette.border}`, whiteSpace: 'nowrap' }}>
              {matches}/{totalPairs}
            </div>
            <div style={{ fontSize: '10px', color: palette.gold, fontWeight: '800', background: `${palette.gold}15`, padding: '2px 8px', borderRadius: '8px', fontFamily: FONT_DISPLAY, border: `1px solid ${palette.gold}40`, whiteSpace: 'nowrap' }}>💰 {localPoints}</div>
            <div style={{ fontSize: '10px', color: palette.diamond, fontWeight: '800', background: `${palette.diamond}15`, padding: '2px 8px', borderRadius: '8px', fontFamily: FONT_DISPLAY, border: `1px solid ${palette.diamond}40`, whiteSpace: 'nowrap' }}>💎 {localDiamonds}</div>
            <div style={{ display: 'flex', gap: '1px' }}>
              {[...Array(lives)].map((_, i) => (<span key={i} style={{ fontSize: '14px' }}>❤️</span>))}
              {[...Array(maxLives - lives)].map((_, i) => (<span key={i} style={{ fontSize: '14px', opacity: 0.2 }}>❤️</span>))}
            </div>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: timer <= 10 ? `${palette.danger}20` : timer <= 20 ? `${palette.warmOrange}20` : palette.creamSoft, border: `2px solid ${timer <= 10 ? palette.danger : timer <= 20 ? palette.warmOrange : palette.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: timer <= 10 ? palette.danger : timer <= 20 ? palette.warmOrange : palette.deepNavy, fontSize: '11px', fontWeight: '800', fontFamily: FONT_DISPLAY, flexShrink: 0 }}>{timer}</div>
            <div style={{ background: palette.warmOrange, padding: '2px 12px', borderRadius: '8px', color: 'white', fontWeight: '800', fontSize: '13px', fontFamily: FONT_DISPLAY, boxShadow: `0 2px 0 ${palette.warmOrangeShadow}`, whiteSpace: 'nowrap' }}>{score}</div>
          </div>
        </div>
        <div className="mg-progress-wrap" style={{ maxWidth: gridConfig.maxWidth, width: '100%', margin: '0 auto 10px', transition: 'max-width 0.3s ease', boxSizing: 'border-box' }}>
          <div className="mg-progress-bar" style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.15)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: `linear-gradient(90deg, ${palette.warmOrange}, ${palette.coral})`, width: `${progress}%`, transition: 'width 0.4s ease' }} />
          </div>
        </div>
        <div
          className="mg-cards"
          style={{
            maxWidth: gridConfig.maxWidth,
            width: '100%',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: `repeat(${gridConfig.cols}, 1fr)`,
            gap: '8px',
            padding: '12px',
            background: theme.cardBg,
            borderRadius: '18px',
            border: theme.cardBorder,
            boxShadow: theme.cardShadow,
            transition: 'max-width 0.3s ease',
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}
        >
          {cards.map((card, index) => (
            <div key={card.id} className="mg-card" onClick={() => handleCardClick(index)} style={{ aspectRatio: '1', cursor: card.isMatched || flippedCards.includes(index) || isLocked ? 'default' : 'pointer', opacity: card.isMatched ? 0.35 : 1, perspective: '800px', touchAction: 'manipulation' }}>
              <div style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d', transform: card.isFlipped || card.isMatched ? 'rotateY(180deg)' : 'rotateY(0deg)', transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                <div className="mg-card-face-front" style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', background: `linear-gradient(135deg, ${palette.warmOrange} 0%, ${palette.coral} 100%)`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', fontSize: '18px', boxShadow: `0 3px 0 ${palette.warmOrangeShadow}`, border: `1.5px solid ${palette.warmOrangeShadow}` }}>
                  <span style={{ fontSize: '15px', filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.5))' }}>✦</span>
                  <span style={{ fontSize: '15px', filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.5))' }}>⚡</span>
                </div>
                <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: palette.white, borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: `0 3px 0 ${palette.border}`, border: `1.5px solid ${card.isMatched ? palette.softGreen : palette.border}`, padding: '2px', textAlign: 'center', overflow: 'hidden' }}>
                  {card.type === 'image' ? (
                    <img src={card.content} alt={card.word} style={{ width: '85%', height: '85%', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '🖼️'; }} />
                  ) : (
                    <span className="mg-card-face-back-word" style={{ fontSize: '11px', fontWeight: '800', color: palette.deepNavy, fontFamily: FONT_DISPLAY, wordBreak: 'break-word', padding: '2px', lineHeight: 1.1 }}>{card.content}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mg-footer" style={{ maxWidth: gridConfig.maxWidth, width: '100%', margin: '10px auto 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', background: 'rgba(255,255,255,0.9)', borderRadius: '12px', fontSize: '11px', color: palette.bodyText, border: `1.5px solid ${palette.border}`, fontFamily: FONT_BODY, fontWeight: 600, transition: 'max-width 0.3s ease', boxSizing: 'border-box' }}>
          <span>💡 Match words with images</span>
          <span>🔄 {attempts} attempts</span>
        </div>
      </div>
    );
  }

  return null;
};

export default MatchGame;