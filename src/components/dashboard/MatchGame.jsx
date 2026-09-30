// src/components/dashboard/MatchGame.jsx
// ✅ NEW: Has recordGame prop to record in Recent Activities
// ✅ NEW: Passes the array of matched words

import React, { useState, useEffect, useRef } from 'react';
import { updateStreak } from '../../utils/streakHelper';
import { updateUserStats } from '../../services/firebaseService';
import { auth } from '../../pages/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// ============================================================
// ===== MUTED GAME UI PALETTE (matches SynoQuest) =====
// ============================================================
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
  softGreenShadow: '#5E7F55',
  gold: '#d4af37',
  danger: '#DB7A64',
  dangerShadow: '#A95845',
};

const FONT_DISPLAY = "'Fredoka', sans-serif";
const FONT_BODY = "'Nunito', sans-serif";

// ============================================================
// ===== IMAGE / FULLSCREEN BACKGROUND CONFIGURATION =====
// ============================================================
const imageBasePath = '/image/';

const fullScreenBg = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  overflowY: 'auto',
  backgroundImage: `linear-gradient(135deg, rgba(42, 40, 69, 0.65), rgba(58, 55, 87, 0.55)), url(${imageBasePath}bg-matchgame.png)`,
  backgroundSize: '130% 130%',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  animation: 'bgPan 30s ease-in-out infinite alternate',
  fontFamily: FONT_BODY,
};

const bgAnimationStyle = (
  <style>{`
    @keyframes bgPan {
      0% { background-position: 0% 0%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 50% 100%; }
    }

    @media (max-width: 768px) {
      .match-game-container { padding: 8px !important; }
      .match-game-header { padding: 6px 10px !important; margin-bottom: 8px !important; flex-wrap: wrap !important; gap: 4px !important; }
      .match-game-header > div { flex-wrap: wrap !important; gap: 4px !important; }
      .match-game-cards { gap: 4px !important; padding: 8px !important; }
      .match-game-card { aspect-ratio: 1 !important; min-height: 50px !important; }
      .match-game-card-back { font-size: 14px !important; }
      .match-game-card-front { font-size: 12px !important; }
      .match-game-card-front-emoji { font-size: 20px !important; }
      .match-game-footer { flex-wrap: wrap !important; gap: 4px !important; font-size: 10px !important; padding: 6px 12px !important; }
      .match-game-intro { padding: 16px 12px !important; margin: 8px !important; }
      .match-game-intro h1 { font-size: 20px !important; }
      .match-game-intro p { font-size: 12px !important; }
      .match-game-difficulty { gap: 4px !important; padding: 6px !important; flex-wrap: wrap !important; }
      .match-game-difficulty button { padding: 6px 4px !important; font-size: 10px !important; min-width: 50px !important; }
      .match-game-stats-grid { grid-template-columns: repeat(3, 1fr) !important; gap: 4px !important; }
      .match-game-stats-grid > div { padding: 8px !important; }
      .match-game-stats-grid > div div:first-child { font-size: 14px !important; }
      .match-game-modal { padding: 20px !important; max-width: 320px !important; margin: 12px !important; }
      .match-game-modal h3 { font-size: 16px !important; }
      .match-game-result { padding: 24px 16px !important; margin: 12px !important; }
      .match-game-result h2 { font-size: 22px !important; }
      .match-game-result-stats { grid-template-columns: repeat(3, 1fr) !important; gap: 6px !important; }
      .match-game-result-stats > div { padding: 8px !important; }
      .match-game-result-stats > div div:first-child { font-size: 16px !important; }
      .match-game-progress { height: 2px !important; margin-bottom: 8px !important; }
      .match-game-timer { font-size: 14px !important; min-width: 24px !important; }
      .match-game-score { font-size: 13px !important; padding: 2px 10px !important; }
      .match-game-music-toggle { font-size: 14px !important; padding: 2px 8px !important; }
      .match-game-loading { padding: 24px !important; }
      .match-game-loading h2 { font-size: 20px !important; }
      .match-game-loading-spinner { width: 60px !important; height: 60px !important; }
    }

    @media (max-width: 480px) {
      .match-game-cards { gap: 3px !important; padding: 6px !important; }
      .match-game-card { min-height: 40px !important; }
      .match-game-card-back { font-size: 10px !important; border-radius: 8px !important; }
      .match-game-card-front { font-size: 9px !important; border-radius: 8px !important; }
      .match-game-card-front-emoji { font-size: 16px !important; }
      .match-game-header { padding: 6px 10px !important; border-radius: 10px !important; }
      .match-game-header span { font-size: 12px !important; }
      .match-game-intro h1 { font-size: 16px !important; }
      .match-game-intro p { font-size: 10px !important; }
      .match-game-difficulty button { padding: 4px 3px !important; font-size: 9px !important; min-width: 40px !important; }
      .match-game-difficulty button div:first-child { font-size: 10px !important; }
      .match-game-stats-grid > div div:first-child { font-size: 12px !important; }
      .match-game-result h2 { font-size: 18px !important; }
      .match-game-result-stats > div div:first-child { font-size: 14px !important; }
      .match-game-modal { padding: 16px !important; max-width: 280px !important; }
      .match-game-modal button { font-size: 12px !important; padding: 8px !important; }
    }

    @media (max-width: 360px) {
      .match-game-cards { gap: 2px !important; padding: 4px !important; }
      .match-game-card { min-height: 32px !important; }
      .match-game-card-back { font-size: 8px !important; }
      .match-game-card-front { font-size: 7px !important; }
      .match-game-card-front-emoji { font-size: 12px !important; }
      .match-game-header { padding: 4px 8px !important; border-radius: 8px !important; }
      .match-game-header span { font-size: 10px !important; }
    }

    @media (orientation: landscape) and (max-height: 600px) {
      .match-game-cards { gap: 4px !important; padding: 6px !important; }
      .match-game-card { min-height: 44px !important; }
      .match-game-header { padding: 4px 12px !important; margin-bottom: 4px !important; }
      .match-game-footer { padding: 4px 12px !important; margin-top: 4px !important; }
      .match-game-progress { height: 2px !important; margin-bottom: 4px !important; }
    }
  `}</style>
);

// ============================================================
// ===== THEME (matches SynoQuest card style) =====
// ============================================================
const theme = {
  cardBg: palette.white,
  cardBorder: `1.5px solid ${palette.border}`,
  cardShadow: `0 10px 40px rgba(42, 40, 69, 0.20), 0 2px 0 ${palette.border}`,
  textPrimary: palette.deepNavy,
  textSecondary: palette.bodyText,
  textMuted: palette.bodyTextSoft,
  accent: palette.warmOrange,
  accentGradient: `linear-gradient(135deg, ${palette.warmOrange} 0%, ${palette.coral} 100%)`,
  chipBg: palette.creamSoft,
  surfaceBg: palette.creamSoft,
  surfaceBorder: palette.border,
};

// ============================================================
// ✅ UPDATED: Has recordGame prop
// ============================================================
const MatchGame = ({ onBack, updateProgress, recordGame }) => {
  // ===== GAME STATE =====
  const [gameState, setGameState] = useState('intro');
  const [score, setScore] = useState(0);
  const [matches, setMatches] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [flippedCards, setFlippedCards] = useState([]);
  const [cards, setCards] = useState([]);
  const [isLocked, setIsLocked] = useState(false);
  const [timer, setTimer] = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [showWinScreen, setShowWinScreen] = useState(false);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [showAchievement, setShowAchievement] = useState(false);
  const [achievementMessage, setAchievementMessage] = useState('');
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    bestScore: 0,
    bestTime: 0,
    perfectGames: 0,
    bestMoves: 0
  });
  const [showStats, setShowStats] = useState(false);

  // ===== PROGRESS TRACKING =====
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAnswers, setTotalAnswers] = useState(0);

  // ============================================================
  // ✅ FIXED: Use useRef for the sessionSaved flag
  // ============================================================
  const sessionSavedRef = useRef(false);

  // ✅ NEW: Ref for matched words (for learned words tracking)
  const matchedWordsRef = useRef([]);

  // ===== FIREBASE USER =====
  const [currentUser, setCurrentUser] = useState(null);
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  // ===== BACKGROUND MUSIC =====
  const audioCtxRef = useRef(null);
  const musicIntervalRef = useRef(null);
  const musicGainRef = useRef(null);
  const isMusicPlaying = useRef(false);

  const NINTENDO_MELODY = [
    { note: 523.25, duration: 0.15 },
    { note: 587.33, duration: 0.15 },
    { note: 659.25, duration: 0.15 },
    { note: 783.99, duration: 0.15 },
    { note: 659.25, duration: 0.15 },
    { note: 587.33, duration: 0.15 },
    { note: 523.25, duration: 0.15 },
    { note: 659.25, duration: 0.15 },
    { note: 783.99, duration: 0.15 },
    { note: 880.00, duration: 0.15 },
    { note: 783.99, duration: 0.15 },
    { note: 659.25, duration: 0.15 },
    { note: 783.99, duration: 0.15 },
    { note: 880.00, duration: 0.15 },
    { note: 987.77, duration: 0.20 },
    { note: 880.00, duration: 0.20 },
    { note: 783.99, duration: 0.20 },
    { note: 659.25, duration: 0.15 },
    { note: 783.99, duration: 0.15 },
    { note: 880.00, duration: 0.15 },
    { note: 1046.50, duration: 0.25 },
    { note: 987.77, duration: 0.15 },
    { note: 880.00, duration: 0.15 },
    { note: 783.99, duration: 0.15 },
  ];

  const BASS_LINE = [
    { note: 130.81, duration: 0.4 },
    { note: 130.81, duration: 0.4 },
    { note: 146.83, duration: 0.4 },
    { note: 146.83, duration: 0.4 },
    { note: 164.81, duration: 0.4 },
    { note: 164.81, duration: 0.4 },
    { note: 196.00, duration: 0.4 },
    { note: 196.00, duration: 0.4 },
  ];

  const CHORD_PROGRESSION = [
    { notes: [261.63, 329.63, 392.00], duration: 1.0 },
    { notes: [392.00, 493.88, 587.33], duration: 1.0 },
    { notes: [440.00, 523.25, 659.25], duration: 1.0 },
    { notes: [349.23, 440.00, 523.25], duration: 1.0 },
  ];

  // ============================================================
  // ===== FIREBASE AUTH =====
  // ============================================================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setIsUserLoaded(true);
        console.log('✅ MatchGame: User loaded:', user.uid, user.email);
      } else {
        setCurrentUser(null);
        setIsUserLoaded(true);
        console.log('❌ MatchGame: No user logged in');
      }
    });

    return () => unsubscribe();
  }, []);

  // ============================================================
  // ===== SAVE TO FIREBASE =====
  // ============================================================
  const saveGameToFirebase = async (isWin) => {
    if (!currentUser) {
      console.log('⚠️ No user logged in, skipping Firebase save');
      return;
    }

    const userId = currentUser.uid;
    const totalPairs = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 10 : 12;
    const isPerfect = matches === totalPairs;

    const pointsEarned = matches;

    const gameData = {
      gameType: 'matchGame',
      pointsEarned: pointsEarned,
      newWordsLearned: matches,
      correctAnswers: matches,
      totalQuestions: attempts,
      won: isWin || isPerfect,
      score: matches,
      isPerfect: isPerfect,
      difficulty: difficulty,
      timeRemaining: timer,
      attempts: attempts
    };

    try {
      console.log('💾 Saving MatchGame to Firebase...');
      const result = await updateUserStats(userId, gameData);

      if (result.achievements && result.achievements.length > 0) {
        console.log('🏆 New Achievements Unlocked:', result.achievements);
        setAchievementMessage(`🏆 ${result.achievements.join(', ')} 🎉`);
        setShowAchievement(true);
        setTimeout(() => setShowAchievement(false), 5000);
      }

      console.log('✅ MatchGame saved to Firebase successfully!');
    } catch (error) {
      console.error('❌ Error saving to Firebase:', error);
    }
  };

  // ===== AUDIO =====
  const audioCtx = useRef(null);
  const gainNode = useRef(null);

  const initAudio = () => {
    try {
      if (!audioCtx.current) {
        audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
        gainNode.current = audioCtx.current.createGain();
        gainNode.current.gain.value = isMuted ? 0 : 0.4;
        gainNode.current.connect(audioCtx.current.destination);
      }
      if (audioCtx.current.state === 'suspended') {
        audioCtx.current.resume();
      }
      return true;
    } catch (e) {
      return false;
    }
  };

  const initMusicAudio = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        musicGainRef.current = audioCtxRef.current.createGain();
        musicGainRef.current.gain.value = isMuted ? 0 : 0.12;
        musicGainRef.current.connect(audioCtxRef.current.destination);
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      return true;
    } catch (e) {
      return false;
    }
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
    } catch (e) {
      return null;
    }
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
      try {
        audioCtxRef.current.close();
      } catch (e) {}
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
      if (!isMuted && !isMusicPlaying.current) {
        startBackgroundMusic();
      }
    } else {
      stopBackgroundMusic();
    }

    return () => {
      stopBackgroundMusic();
    };
  }, [gameState]);

  useEffect(() => {
    return () => {
      stopBackgroundMusic();
    };
  }, []);

  // ===== SOUND EFFECTS =====
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
  const playMatchSuccess = () => {
    playTone(523.25, 0.1);
    setTimeout(() => playTone(659.25, 0.1), 100);
    setTimeout(() => playTone(783.99, 0.12), 200);
  };
  const playMatchFail = () => playTone(300, 0.2, 'sawtooth');
  const playGameWin = () => {
    [523.25, 587.33, 659.25, 783.99, 880.00, 987.77].forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.1), i * 70);
    });
  };
  const playGameLose = () => {
    playTone(400, 0.2, 'sawtooth');
    setTimeout(() => playTone(300, 0.2, 'sawtooth'), 200);
    setTimeout(() => playTone(200, 0.3, 'sawtooth'), 400);
  };

  // ===== PAIRS DATA =====
  const pairCategories = {
    easy: [
      { id: 1, word: 'Sun', emoji: '☀️' },
      { id: 2, word: 'Moon', emoji: '🌙' },
      { id: 3, word: 'Star', emoji: '⭐' },
      { id: 4, word: 'Cloud', emoji: '☁️' },
      { id: 5, word: 'Rain', emoji: '🌧️' },
      { id: 6, word: 'Snow', emoji: '❄️' },
      { id: 7, word: 'Fire', emoji: '🔥' },
      { id: 8, word: 'Water', emoji: '💧' },
    ],
    medium: [
      { id: 1, word: 'Pizza', emoji: '🍕' },
      { id: 2, word: 'Burger', emoji: '🍔' },
      { id: 3, word: 'Sushi', emoji: '🍣' },
      { id: 4, word: 'Taco', emoji: '🌮' },
      { id: 5, word: 'Pasta', emoji: '🍝' },
      { id: 6, word: 'Salad', emoji: '🥗' },
      { id: 7, word: 'Bread', emoji: '🍞' },
      { id: 8, word: 'Cheese', emoji: '🧀' },
      { id: 9, word: 'Steak', emoji: '🥩' },
      { id: 10, word: 'Soup', emoji: '🍜' },
    ],
    hard: [
      { id: 1, word: 'Astronaut', emoji: '🧑‍🚀' },
      { id: 2, word: 'Rocket', emoji: '🚀' },
      { id: 3, word: 'Planet', emoji: '🪐' },
      { id: 4, word: 'Galaxy', emoji: '🌌' },
      { id: 5, word: 'Comet', emoji: '☄️' },
      { id: 6, word: 'Nebula', emoji: '🌠' },
      { id: 7, word: 'Telescope', emoji: '🔭' },
      { id: 8, word: 'Satellite', emoji: '🛰️' },
      { id: 9, word: 'Asteroid', emoji: '🪨' },
      { id: 10, word: 'Star', emoji: '🌟' },
      { id: 11, word: 'Moon', emoji: '🌙' },
      { id: 12, word: 'Sun', emoji: '☀️' },
    ]
  };

  const generateCards = () => {
    const pairs = pairCategories[difficulty];
    const shuffled = [...pairs].sort(() => Math.random() - 0.5);
    const count = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 10 : 12;
    const selected = shuffled.slice(0, count);

    let deck = [];
    selected.forEach((item, index) => {
      deck.push({
        id: index * 2,
        pairId: index,
        content: item.word,
        type: 'word',
        emoji: item.emoji,
        isFlipped: false,
        isMatched: false
      });
      deck.push({
        id: index * 2 + 1,
        pairId: index,
        content: item.emoji,
        type: 'emoji',
        word: item.word,
        isFlipped: false,
        isMatched: false
      });
    });
    return deck.sort(() => Math.random() - 0.5);
  };

  // ============================================================
  // ✅ FIXED: Reset sessionSavedRef every new game
  // ============================================================
  const initializeGame = () => {
    const newCards = generateCards();
    setCards(newCards);
    setScore(0);
    setMatches(0);
    setAttempts(0);
    setCorrectAnswers(0);
    setTotalAnswers(0);
    setFlippedCards([]);
    setIsLocked(false);
    setTimer(difficulty === 'easy' ? 70 : difficulty === 'medium' ? 60 : 50);
    setTimerRunning(true);
    setGameState('playing');
    setShowWinScreen(false);
    
    // ✅ Reset session saved flag
    sessionSavedRef.current = false;
    // ✅ NEW: Reset matched words ref
    matchedWordsRef.current = [];
    console.log('🔄 MatchGame: New game started — sessionSaved reset');

    const saved = localStorage.getItem('matchgame_leaderboard');
    if (saved) setLeaderboardData(JSON.parse(saved));

    const savedStats = localStorage.getItem('matchgame_stats');
    if (savedStats) setStats(JSON.parse(savedStats));
  };

  const startGame = () => {
    sessionSavedRef.current = false;
    matchedWordsRef.current = [];
    setGameState('loading');
    setTimeout(() => {
      initializeGame();
    }, 2000);
  };

  // ===== TIMER =====
  useEffect(() => {
    if (timerRunning && timer > 0) {
      const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && timerRunning) {
      setTimerRunning(false);
      playGameLose();
      setGameState('gameover');
      stopBackgroundMusic();
      saveGameProgress(false);
      saveGameToFirebase(false);
    }
  }, [timer, timerRunning]);

  // ===== CHECK WIN =====
  useEffect(() => {
    const totalPairs = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 10 : 12;
    if (matches === totalPairs && totalPairs > 0 && !sessionSavedRef.current) {
      setTimerRunning(false);
      playGameWin();

      const isPerfect = matches === totalPairs;
      const newStats = {
        gamesPlayed: stats.gamesPlayed + 1,
        bestScore: Math.max(stats.bestScore, matches),
        bestTime: stats.bestTime === 0 ? timer : Math.min(stats.bestTime, timer),
        perfectGames: isPerfect ? (stats.perfectGames || 0) + 1 : (stats.perfectGames || 0),
        bestMoves: stats.bestMoves === 0 ? attempts : Math.min(stats.bestMoves, attempts)
      };
      setStats(newStats);
      localStorage.setItem('matchgame_stats', JSON.stringify(newStats));

      const newEntry = {
        name: currentUser?.displayName || currentUser?.email || 'Player',
        score: matches,
        pairs: matches,
        time: timer,
        difficulty: difficulty,
        date: new Date().toISOString()
      };
      const updated = [...leaderboardData, newEntry].sort((a, b) => b.score - a.score).slice(0, 10);
      setLeaderboardData(updated);
      localStorage.setItem('matchgame_leaderboard', JSON.stringify(updated));

      saveGameProgress(true);
      saveGameToFirebase(true);

      setShowWinScreen(true);
      setTimeout(() => setGameState('finished'), 2500);
    }
  }, [matches, difficulty]);

  // ============================================================
  // ✅ UPDATED: saveGameProgress — now has recordGame and words array
  // ============================================================
  const saveGameProgress = (isWin) => {
    if (sessionSavedRef.current) {
      console.log('⚠️ MatchGame: Already saved — skipping duplicate');
      return;
    }
    
    sessionSavedRef.current = true;
    console.log(`✅ MatchGame: Saving progress (1st and ONLY time) — +${matches} pts`);

    const totalPairs = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 10 : 12;
    const isPerfect = matches === totalPairs;

    // ✅ NEW: Get the list of matched words
    const wordsList = [...matchedWordsRef.current];

    const saved = localStorage.getItem('vocaboplay_progress');
    const currentProgress = saved ? JSON.parse(saved) : {};

    const today = new Date().toDateString();
    const lastPlayed = localStorage.getItem('vocaboplay_lastPlayed');
    let newStreak = currentProgress.streak || 0;

    if (!lastPlayed || lastPlayed !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      if (lastPlayed === yesterdayStr) {
        newStreak = (currentProgress.streak || 0) + 1;
      } else {
        newStreak = 1;
      }
      localStorage.setItem('vocaboplay_lastPlayed', today);
    }

    const progressData = {
      gamesPlayed: 1,
      totalPoints: matches,
      xp: matches,
      totalAnswers: attempts,
      correctAnswers: matches,
      wordsLearned: matches,
      streak: newStreak,
      match: {
        gamesCompleted: 1,
        totalPairs: matches,
        totalMoves: attempts,
        bestTime: timer,
        bestMoves: attempts,
        perfectGames: isPerfect ? 1 : 0
      }
    };

    if (updateProgress) {
      updateProgress(progressData)
        .then(() => {
          console.log(`✅ MatchGame: SAVED! +${matches} pts, +${matches} XP, +1 game`);
          // ✅ NEW: Record to recent activities and pass the words
          if (recordGame) {
            recordGame('match', matches, matches, attempts, wordsList);
          }
        })
        .catch(err => {
          console.error('❌ MatchGame: Error saving:', err);
        });
    }
  };

  // ============================================================
  // ===== HANDLE CARD CLICK =====
  // ============================================================
  const handleCardClick = (index) => {
    if (isLocked) return;
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
          setFlippedCards([]);
          setIsLocked(false);
          playMatchSuccess();

          // ✅ NEW: Track the matched word (for learned words)
          const matchedWord = card1.type === 'word' ? card1.content
                            : card2.type === 'word' ? card2.content
                            : card1.word || card2.word;
          if (matchedWord && !matchedWordsRef.current.includes(matchedWord)) {
            matchedWordsRef.current.push(matchedWord);
          }

          const newMatches = matches + 1;
          const totalPairs = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 10 : 12;
          if (newMatches === totalPairs && !unlockedAchievements.includes('🏆 Perfect Match')) {
            setUnlockedAchievements(prev => [...prev, '🏆 Perfect Match']);
            setAchievementMessage('🏆 Perfect Match!');
            setShowAchievement(true);
            setTimeout(() => setShowAchievement(false), 2500);
          }
          if (attempts + 1 <= 10 && !unlockedAchievements.includes('🧠 Memory Master')) {
            setUnlockedAchievements(prev => [...prev, '🧠 Memory Master']);
            setAchievementMessage('🧠 Memory Master!');
            setShowAchievement(true);
            setTimeout(() => setShowAchievement(false), 2500);
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
        }, 700);
      }
    }
  };

  const handleRestart = () => {
    initializeGame();
    setShowAchievement(false);
    setUnlockedAchievements([]);
    if (!isMuted && !isMusicPlaying.current) {
      startBackgroundMusic();
    }
  };

  const handleExitGame = () => {
    if (gameState === 'playing' && !sessionSavedRef.current) {
      saveGameProgress(false);
      saveGameToFirebase(false);
    }
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    setShowExitConfirm(false);
    setShowSettings(false);
    stopBackgroundMusic();
    if (onBack) onBack();
  };

  const cancelExit = () => setShowExitConfirm(false);

  // ===== ACHIEVEMENT POPUP =====
  const AchievementPopup = () => {
    if (!showAchievement) return null;
    return (
      <div style={{
        position: 'fixed',
        top: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10000,
        background: palette.deepNavy,
        color: 'white',
        padding: '12px 28px',
        borderRadius: '14px',
        boxShadow: `0 8px 24px rgba(42,40,69,0.35)`,
        animation: 'slideDown 0.4s ease',
        fontSize: '14px',
        fontWeight: '800',
        fontFamily: FONT_DISPLAY,
        letterSpacing: '0.3px',
        border: `1.5px solid ${palette.warmOrange}60`
      }}>
        🎉 {achievementMessage}
        <style>{`
          @keyframes slideDown {
            0% { transform: translateX(-50%) translateY(-60px); opacity: 0; }
            100% { transform: translateX(-50%) translateY(0); opacity: 1; }
          }
        `}</style>
      </div>
    );
  };

  // ===== EXIT CONFIRM =====
  const ExitConfirmModal = () => (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(42, 40, 69, 0.6)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div style={{
        background: palette.white,
        borderRadius: '18px',
        padding: '28px',
        maxWidth: '340px',
        width: '100%',
        textAlign: 'center',
        border: `1.5px solid ${palette.border}`,
        boxShadow: '0 20px 50px rgba(42, 40, 69, 0.3)'
      }}>
        <div style={{ fontSize: '40px', marginBottom: '8px' }}>🚪</div>
        <h3 style={{ fontSize: '18px', fontWeight: '800', color: palette.deepNavy, marginBottom: '6px', fontFamily: FONT_DISPLAY }}>Exit Game?</h3>
        <p style={{ fontSize: '13px', color: palette.bodyTextSoft, marginBottom: '20px', fontFamily: FONT_BODY, fontWeight: 600 }}>Your progress will be saved.</p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={confirmExit} style={{
            flex: 1, padding: '10px', background: palette.danger, color: 'white',
            border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px',
            fontWeight: '800', fontFamily: FONT_DISPLAY, boxShadow: `0 3px 0 ${palette.dangerShadow}`
          }}>Exit</button>
          <button onClick={cancelExit} style={{
            flex: 1, padding: '10px', background: palette.creamSoft, color: palette.deepNavy,
            border: `1.5px solid ${palette.border}`, borderRadius: '10px', cursor: 'pointer',
            fontSize: '13px', fontWeight: '800', fontFamily: FONT_DISPLAY
          }}>Cancel</button>
        </div>
      </div>
    </div>
  );

  // ===== SETTINGS =====
  const SettingsModal = () => (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(42, 40, 69, 0.6)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }} onClick={() => setShowSettings(false)}>
      <div style={{
        background: palette.white,
        borderRadius: '18px',
        padding: '24px',
        maxWidth: '360px',
        width: '100%',
        maxHeight: '80vh',
        overflow: 'auto',
        border: `1.5px solid ${palette.border}`,
        boxShadow: '0 20px 50px rgba(42, 40, 69, 0.3)'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: '800', color: palette.deepNavy, fontFamily: FONT_DISPLAY }}>Settings</h3>
          <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: palette.bodyTextSoft }}>✕</button>
        </div>

        <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: palette.creamSoft, borderRadius: '10px', border: `1.5px solid ${palette.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>🎵</span>
            <span style={{ fontSize: '12px', fontWeight: '700', color: palette.bodyText, fontFamily: FONT_DISPLAY }}>Background Music</span>
          </div>
          <button
            onClick={toggleMusic}
            style={{
              padding: '4px 14px',
              borderRadius: '8px',
              border: 'none',
              background: isMuted ? palette.danger : palette.softGreen,
              color: 'white',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '800',
              fontFamily: FONT_DISPLAY
            }}
          >
            {isMuted ? 'OFF' : 'ON'}
          </button>
        </div>

        <div style={{ marginBottom: '16px', padding: '12px', background: palette.creamSoft, borderRadius: '10px', border: `1.5px solid ${palette.border}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>{stats.gamesPlayed}</div>
              <div style={{ fontSize: '10px', color: palette.bodyTextSoft, fontFamily: FONT_BODY, fontWeight: 600 }}>Games</div>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>{stats.bestScore}</div>
              <div style={{ fontSize: '10px', color: palette.bodyTextSoft, fontFamily: FONT_BODY, fontWeight: 600 }}>Best Score</div>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>{stats.bestTime || '-'}s</div>
              <div style={{ fontSize: '10px', color: palette.bodyTextSoft, fontFamily: FONT_BODY, fontWeight: 600 }}>Best Time</div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: palette.bodyText, display: 'block', marginBottom: '8px', fontFamily: FONT_DISPLAY }}>Difficulty</label>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['easy', 'medium', 'hard'].map(d => (
              <button
                key={d}
                onClick={() => { setDifficulty(d); setShowSettings(false); }}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '10px',
                  border: `2px solid ${difficulty === d ? palette.warmOrange : palette.border}`,
                  background: difficulty === d ? `${palette.warmOrange}15` : palette.creamSoft,
                  color: difficulty === d ? palette.warmOrange : palette.bodyTextSoft,
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '800',
                  textTransform: 'capitalize',
                  fontFamily: FONT_DISPLAY
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: palette.bodyText, fontFamily: FONT_DISPLAY }}>🔊 Sound Effects</span>
          <button
            onClick={() => {
              const newMuted = !isMuted;
              setIsMuted(newMuted);
              if (gainNode.current) gainNode.current.gain.value = newMuted ? 0 : 0.4;
            }}
            style={{
              padding: '4px 14px',
              borderRadius: '8px',
              border: 'none',
              background: isMuted ? palette.danger : palette.softGreen,
              color: 'white',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '800',
              fontFamily: FONT_DISPLAY
            }}
          >
            {isMuted ? 'OFF' : 'ON'}
          </button>
        </div>

        <button onClick={() => { setShowLeaderboard(true); setShowSettings(false); }} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: `1.5px solid ${palette.border}`, background: palette.creamSoft, color: palette.bodyText, cursor: 'pointer', fontSize: '12px', fontWeight: '800', marginBottom: '6px', fontFamily: FONT_DISPLAY }}>
          🏆 Leaderboard
        </button>

        <button onClick={() => { setShowSettings(false); handleExitGame(); }} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: `1.5px solid ${palette.danger}40`, background: `${palette.danger}10`, color: palette.danger, cursor: 'pointer', fontSize: '12px', fontWeight: '800', marginBottom: '6px', fontFamily: FONT_DISPLAY }}>
          🚪 Exit
        </button>

        <button onClick={() => { setShowSettings(false); handleRestart(); }} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: `1.5px solid ${palette.border}`, background: palette.creamSoft, color: palette.bodyText, cursor: 'pointer', fontSize: '12px', fontWeight: '800', fontFamily: FONT_DISPLAY }}>
          🔄 New Game
        </button>
      </div>
    </div>
  );

  // ===== LEADERBOARD =====
  const LeaderboardModal = () => (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(42, 40, 69, 0.6)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }} onClick={() => setShowLeaderboard(false)}>
      <div style={{
        background: palette.white,
        borderRadius: '18px',
        padding: '20px',
        maxWidth: '380px',
        width: '100%',
        maxHeight: '70vh',
        overflow: 'auto',
        border: `1.5px solid ${palette.border}`,
        boxShadow: '0 20px 50px rgba(42, 40, 69, 0.3)'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: '800', color: palette.deepNavy, fontFamily: FONT_DISPLAY }}>🏆 Leaderboard</h3>
          <button onClick={() => setShowLeaderboard(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: palette.bodyTextSoft }}>✕</button>
        </div>

        {leaderboardData.length === 0 ? (
          <div style={{ textAlign: 'center', color: palette.bodyTextSoft, padding: '24px 0' }}>
            <div style={{ fontSize: '36px', marginBottom: '6px' }}>📊</div>
            <p style={{ fontSize: '13px', fontFamily: FONT_BODY, fontWeight: 600 }}>No scores yet!</p>
          </div>
        ) : (
          leaderboardData.map((entry, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 10px',
              borderRadius: '8px',
              background: index < 3 ? `${palette.warmOrange}10` : 'transparent',
              marginBottom: '4px'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: index === 0 ? palette.gold : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : palette.creamSoft,
                color: index < 3 ? '#fff' : palette.bodyTextSoft,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: '800',
                marginRight: '10px',
                fontFamily: FONT_DISPLAY
              }}>
                {index + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '800', fontSize: '13px', color: palette.deepNavy, fontFamily: FONT_DISPLAY }}>{entry.name || 'Player'}</div>
                <div style={{ fontSize: '10px', color: palette.bodyTextSoft, fontFamily: FONT_BODY, fontWeight: 600 }}>{entry.pairs} pairs • {entry.difficulty} • {entry.time}s</div>
              </div>
              <div style={{ fontWeight: '800', fontSize: '15px', color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>{entry.score}</div>
            </div>
          ))
        )}

        <button onClick={() => setShowLeaderboard(false)} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: 'none', background: palette.warmOrange, color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: '800', marginTop: '10px', fontFamily: FONT_DISPLAY, boxShadow: `0 3px 0 ${palette.warmOrangeShadow}` }}>
          Close
        </button>
      </div>
    </div>
  );

  // ============================================================
  // ===== LOADING SCREEN =====
  // ============================================================
  if (gameState === 'loading') {
    return (
      <div style={{
        ...fullScreenBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflow: 'hidden'
      }}>
        {bgAnimationStyle}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0
        }}>
          <div style={{
            position: 'absolute',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            top: '10%',
            left: '5%',
            animation: 'floatShape 8s ease-in-out infinite'
          }} />
          <div style={{
            position: 'absolute',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            bottom: '15%',
            right: '8%',
            animation: 'floatShape 10s ease-in-out infinite reverse'
          }} />
          <div style={{
            position: 'absolute',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'pulseShape 4s ease-in-out infinite'
          }} />

          {[...Array(12)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              top: `${10 + Math.random() * 80}%`,
              left: `${10 + Math.random() * 80}%`,
              animation: `twinkle 2s ease-in-out ${i * 0.3}s infinite`
            }} />
          ))}
        </div>

        <div style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%',
          padding: '40px',
          background: 'rgba(255, 255, 255, 0.06)',
          backdropFilter: 'blur(16px)',
          borderRadius: '24px',
          border: `1.5px solid ${palette.border}30`
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 24px',
            position: 'relative',
            animation: 'spin 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite'
          }}>
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              border: '4px solid rgba(255,255,255,0.2)',
              borderRadius: '16px',
              borderTop: `4px solid ${palette.warmOrange}`,
              animation: 'spinBorder 1.2s ease-in-out infinite'
            }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '32px'
              }}>
                🧩
              </div>
            </div>
          </div>

          <h2 style={{
            fontSize: '24px',
            fontWeight: '800',
            color: '#FFFFFF',
            marginBottom: '8px',
            fontFamily: FONT_DISPLAY,
            animation: 'fadeInOut 1.5s ease-in-out infinite'
          }}>
            Loading...
          </h2>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '8px'
          }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: palette.warmOrange,
                animation: `bounceDot 1.4s ease-in-out ${i * 0.3}s infinite`
              }} />
            ))}
          </div>

          <p style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.65)',
            marginTop: '16px',
            fontStyle: 'italic',
            fontFamily: FONT_BODY,
            fontWeight: 600
          }}>
            Preparing your game...
          </p>
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

  // ============================================================
  // ===== INTRO SCREEN =====
  // ============================================================
  if (gameState === 'intro') {
    const totalPairs = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 10 : 12;
    const timeLimit = difficulty === 'easy' ? 70 : difficulty === 'medium' ? 60 : 50;

    return (
      <div style={{
        ...fullScreenBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        {bgAnimationStyle}
        {showExitConfirm && <ExitConfirmModal />}

        <div className="match-game-intro" style={{
          maxWidth: '520px',
          width: '100%',
          background: theme.cardBg,
          borderRadius: '24px',
          padding: '32px 28px',
          border: theme.cardBorder,
          boxShadow: theme.cardShadow,
          textAlign: 'center'
        }}>
          {currentUser && (
            <div style={{
              background: theme.chipBg,
              padding: '4px 14px',
              borderRadius: '10px',
              marginBottom: '10px',
              display: 'inline-block',
              border: `1px solid ${palette.border}`
            }}>
              <span style={{ fontSize: '12px', color: palette.bodyText, fontWeight: '700', fontFamily: FONT_BODY }}>
                👤 {currentUser.displayName || currentUser.email || 'Player'}
              </span>
            </div>
          )}

          <div style={{
            width: '84px',
            height: '84px',
            margin: '0 auto 14px',
            borderRadius: '50%',
            background: theme.accentGradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 8px 24px ${palette.warmOrange}40`
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: palette.white,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px'
            }}>
              🧩
            </div>
          </div>

          <h1 style={{
            fontSize: '30px',
            fontWeight: '800',
            color: theme.textPrimary,
            marginBottom: '2px',
            letterSpacing: '-0.5px',
            fontFamily: FONT_DISPLAY
          }}>
            Match Game
          </h1>
          <p style={{
            fontSize: '12px',
            color: theme.textSecondary,
            marginBottom: '16px',
            fontWeight: '600',
            fontFamily: FONT_BODY
          }}>
            Pair words with their emojis
          </p>

          <div className="match-game-difficulty" style={{
            display: 'flex',
            gap: '6px',
            marginBottom: '14px',
            padding: '8px',
            background: theme.surfaceBg,
            border: `1px solid ${theme.surfaceBorder}`,
            borderRadius: '10px'
          }}>
            {['easy', 'medium', 'hard'].map(d => {
              const pairCount = d === 'easy' ? 8 : d === 'medium' ? 10 : 12;
              const time = d === 'easy' ? 70 : d === 'medium' ? 60 : 50;
              return (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: `2px solid ${difficulty === d ? palette.warmOrange : palette.border}`,
                    background: difficulty === d ? `${palette.warmOrange}15` : palette.creamSoft,
                    color: difficulty === d ? palette.warmOrange : palette.bodyTextSoft,
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: '800',
                    textTransform: 'capitalize',
                    fontFamily: FONT_DISPLAY,
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '14px' }}>{d === 'easy' ? '🟢' : d === 'medium' ? '🟡' : '🔴'}</div>
                  <div>{d}</div>
                  <div style={{ fontSize: '9px', fontWeight: '600', opacity: 0.7, fontFamily: FONT_BODY }}>
                    {pairCount}p • {time}s
                  </div>
                </button>
              );
            })}
          </div>

          <div className="match-game-stats-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '6px',
            marginBottom: '14px'
          }}>
            <div style={{
              padding: '10px',
              background: theme.surfaceBg,
              border: `1px solid ${theme.surfaceBorder}`,
              borderRadius: '10px'
            }}>
              <div style={{ fontSize: '18px', fontWeight: '800', color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>
                {totalPairs}
              </div>
              <div style={{ fontSize: '10px', color: palette.bodyTextSoft, fontFamily: FONT_BODY, fontWeight: 600 }}>Pairs</div>
            </div>
            <div style={{
              padding: '10px',
              background: theme.surfaceBg,
              border: `1px solid ${theme.surfaceBorder}`,
              borderRadius: '10px'
            }}>
              <div style={{ fontSize: '18px', fontWeight: '800', color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>
                {timeLimit}s
              </div>
              <div style={{ fontSize: '10px', color: palette.bodyTextSoft, fontFamily: FONT_BODY, fontWeight: 600 }}>Time Limit</div>
            </div>
            <div style={{
              padding: '10px',
              background: theme.surfaceBg,
              border: `1px solid ${theme.surfaceBorder}`,
              borderRadius: '10px'
            }}>
              <div style={{ fontSize: '18px', fontWeight: '800', color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>🧠</div>
              <div style={{ fontSize: '10px', color: palette.bodyTextSoft, fontFamily: FONT_BODY, fontWeight: 600 }}>Memory</div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '14px',
            padding: '8px 12px',
            background: theme.surfaceBg,
            border: `1px solid ${theme.surfaceBorder}`,
            borderRadius: '10px'
          }}>
            <button
              onClick={toggleMusic}
              style={{
                padding: '4px 14px',
                borderRadius: '8px',
                border: 'none',
                background: isMuted ? palette.danger : palette.softGreen,
                color: 'white',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontFamily: FONT_DISPLAY
              }}
            >
              {isMuted ? '🔇' : '🔊'} {isMuted ? 'Music Off' : 'Music On'}
            </button>
            <span style={{ fontSize: '10px', color: palette.bodyTextSoft, fontFamily: FONT_BODY, fontWeight: 600 }}>
              🎵 8-bit vibes
            </span>
          </div>

          <button
            onClick={startGame}
            style={{
              width: '100%',
              padding: '14px',
              background: theme.accentGradient,
              color: 'white',
              border: 'none',
              borderRadius: '14px',
              fontSize: '15px',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: `0 3px 0 ${palette.warmOrangeShadow}`,
              fontFamily: FONT_DISPLAY,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              transition: 'transform 0.15s',
              touchAction: 'manipulation'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            onTouchStart={(e) => e.target.style.transform = 'scale(0.97)'}
            onTouchEnd={(e) => e.target.style.transform = 'scale(1)'}
          >
            🚀 Start Game
          </button>

          <button
            onClick={onBack}
            style={{
              width: '100%',
              padding: '10px',
              marginTop: '8px',
              background: palette.creamSoft,
              color: palette.bodyText,
              border: `1.5px solid ${palette.border}`,
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '800',
              fontFamily: FONT_DISPLAY,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              touchAction: 'manipulation'
            }}
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // ===== LOADING SCREEN (Firebase auth) =====
  if (!isUserLoaded) {
    return (
      <div style={{
        ...fullScreenBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {bgAnimationStyle}
        <div style={{
          background: palette.white,
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%',
          border: `1.5px solid ${palette.border}`,
          boxShadow: '0 10px 30px rgba(42,40,69,0.15)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: palette.deepNavy, fontFamily: FONT_DISPLAY }}>Loading...</h2>
          <p style={{ fontSize: '14px', color: palette.bodyTextSoft, fontFamily: FONT_BODY, fontWeight: 600 }}>Please wait while we set up your game.</p>
        </div>
      </div>
    );
  }

  // ===== GAME OVER =====
  if (gameState === 'gameover') {
    return (
      <div style={{
        ...fullScreenBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        {bgAnimationStyle}
        <div className="match-game-result" style={{
          background: theme.cardBg,
          borderRadius: '24px',
          padding: '32px 28px',
          textAlign: 'center',
          maxWidth: '520px',
          width: '100%',
          border: theme.cardBorder,
          boxShadow: theme.cardShadow
        }}>
          <div style={{ fontSize: '60px', marginBottom: '6px' }}>⏰</div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: theme.textPrimary, marginBottom: '4px', fontFamily: FONT_DISPLAY }}>Time's Up!</h2>
          <p style={{ fontSize: '13px', color: theme.textSecondary, marginBottom: '16px', fontFamily: FONT_BODY, fontWeight: 600 }}>
            You matched <strong style={{ color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>{matches}</strong> pairs
          </p>

          <div className="match-game-result-stats" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <div style={{ padding: '12px', background: theme.surfaceBg, borderRadius: '10px', border: `1.5px solid ${palette.border}` }}>
              <div style={{ fontSize: '20px', fontWeight: '800', color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>{matches}</div>
              <div style={{ fontSize: '10px', color: theme.textSecondary, fontFamily: FONT_DISPLAY, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pairs</div>
            </div>
            <div style={{ padding: '12px', background: theme.surfaceBg, borderRadius: '10px', border: `1.5px solid ${palette.border}` }}>
              <div style={{ fontSize: '20px', fontWeight: '800', color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>{attempts}</div>
              <div style={{ fontSize: '10px', color: theme.textSecondary, fontFamily: FONT_DISPLAY, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Attempts</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px', flexDirection: 'column' }}>
            <button onClick={handleRestart} style={{ padding: '12px', background: theme.accentGradient, color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '13px', fontWeight: '800', boxShadow: `0 3px 0 ${palette.warmOrangeShadow}`, fontFamily: FONT_DISPLAY, touchAction: 'manipulation' }}>🔄 Play Again</button>
            <button onClick={() => setGameState('intro')} style={{ padding: '10px', background: palette.creamSoft, color: palette.bodyText, border: `1.5px solid ${palette.border}`, borderRadius: '12px', cursor: 'pointer', fontSize: '12px', fontWeight: '800', fontFamily: FONT_DISPLAY, touchAction: 'manipulation' }}>Back to Menu</button>
            <button onClick={onBack} style={{ padding: '10px', background: 'transparent', color: palette.bodyTextSoft, border: `1.5px solid ${palette.border}`, borderRadius: '12px', cursor: 'pointer', fontSize: '12px', fontWeight: '800', fontFamily: FONT_DISPLAY, touchAction: 'manipulation' }}>← Exit</button>
          </div>
        </div>
      </div>
    );
  }

  // ===== PLAYING SCREEN =====
  if (gameState === 'playing') {
    const totalPairs = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 10 : 12;
    const progress = (matches / totalPairs) * 100;

    return (
      <div className="match-game-container" style={{
        ...fullScreenBg,
        padding: '12px'
      }}>
        {bgAnimationStyle}
        <AchievementPopup />
        {showExitConfirm && <ExitConfirmModal />}
        {showSettings && <SettingsModal />}
        {showLeaderboard && <LeaderboardModal />}

        <div className="match-game-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 14px',
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '14px',
          maxWidth: '520px',
          margin: '0 auto 10px',
          border: `1.5px solid ${palette.border}`,
          boxShadow: '0 4px 12px rgba(42,40,69,0.10)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => setShowSettings(true)} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', padding: '2px', color: palette.bodyText, touchAction: 'manipulation' }}>⚙️</button>
            <span style={{ fontWeight: '800', color: palette.deepNavy, fontSize: '12px', fontFamily: FONT_DISPLAY }}>🧩 Match</span>
            <span style={{
              padding: '2px 10px',
              borderRadius: '6px',
              background: palette.creamSoft,
              color: palette.bodyText,
              fontSize: '9px',
              fontWeight: '800',
              textTransform: 'capitalize',
              border: `1px solid ${palette.border}`,
              fontFamily: FONT_DISPLAY
            }}>{difficulty}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={toggleMusic}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '14px',
                cursor: 'pointer',
                padding: '2px 4px',
                opacity: isMuted ? 0.3 : 1,
                touchAction: 'manipulation',
                color: palette.bodyText
              }}
              title={isMuted ? 'Turn music on' : 'Turn music off'}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '12px', color: palette.bodyText }}>🎯</span>
              <span style={{ fontSize: '13px', fontWeight: '800', color: palette.deepNavy, fontFamily: FONT_DISPLAY }}>{matches}/{totalPairs}</span>
            </div>
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%',
              background: timer <= 10 ? `${palette.danger}20` : timer <= 20 ? `${palette.warmOrange}20` : palette.creamSoft,
              border: `2px solid ${timer <= 10 ? palette.danger : timer <= 20 ? palette.warmOrange : palette.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: timer <= 10 ? palette.danger : timer <= 20 ? palette.warmOrange : palette.deepNavy,
              fontSize: '12px', fontWeight: '800', fontFamily: FONT_DISPLAY
            }}>
              {timer}
            </div>
            <div className="match-game-score" style={{
              background: palette.warmOrange,
              padding: '2px 14px',
              borderRadius: '8px',
              color: 'white',
              fontWeight: '800',
              fontSize: '14px',
              fontFamily: FONT_DISPLAY,
              boxShadow: `0 2px 0 ${palette.warmOrangeShadow}`
            }}>
              {matches}
            </div>
          </div>
        </div>

        <div className="match-game-progress" style={{ maxWidth: '520px', margin: '0 auto 10px' }}>
          <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.15)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              background: `linear-gradient(90deg, ${palette.warmOrange}, ${palette.coral})`,
              width: `${progress}%`,
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>

        <div className="match-game-cards" style={{
          maxWidth: '520px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: `repeat(${difficulty === 'easy' ? 4 : difficulty === 'medium' ? 5 : 6}, 1fr)`,
          gap: '8px',
          padding: '12px',
          background: theme.cardBg,
          borderRadius: '18px',
          border: theme.cardBorder,
          boxShadow: theme.cardShadow
        }}>
          {cards.map((card, index) => (
            <div
              key={card.id}
              className="match-game-card"
              onClick={() => handleCardClick(index)}
              style={{
                aspectRatio: '1',
                cursor: card.isMatched || flippedCards.includes(index) || isLocked ? 'default' : 'pointer',
                opacity: card.isMatched ? 0.3 : 1,
                perspective: '800px',
                touchAction: 'manipulation'
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                  transformStyle: 'preserve-3d',
                  transform: card.isFlipped || card.isMatched ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <div
                  className="match-game-card-back"
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    background: `linear-gradient(135deg, ${palette.warmOrange} 0%, ${palette.coral} 100%)`,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '3px',
                    fontSize: '18px',
                    boxShadow: `0 3px 0 ${palette.warmOrangeShadow}`,
                    border: `1.5px solid ${palette.warmOrangeShadow}`
                  }}
                >
                  <span style={{ fontSize: '15px', filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.5))' }}>✦</span>
                  <span style={{ fontSize: '15px', filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.5))' }}>⚡</span>
                </div>

                <div
                  className="match-game-card-front"
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    background: palette.white,
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: card.type === 'emoji' ? '26px' : '11px',
                    fontWeight: card.type === 'word' ? '800' : 'normal',
                    boxShadow: `0 3px 0 ${palette.border}`,
                    border: `1.5px solid ${card.isMatched ? palette.softGreen : palette.border}`,
                    padding: '2px',
                    textAlign: 'center',
                    color: palette.deepNavy,
                    fontFamily: FONT_DISPLAY
                  }}
                >
                  {card.type === 'emoji' ? (
                    <span className="match-game-card-front-emoji">{card.content}</span>
                  ) : (
                    card.content
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="match-game-footer" style={{
          maxWidth: '520px',
          margin: '10px auto 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 14px',
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '12px',
          fontSize: '11px',
          color: palette.bodyText,
          border: `1.5px solid ${palette.border}`,
          fontFamily: FONT_BODY,
          fontWeight: 600
        }}>
          <span>💡 Match words with emojis</span>
          <span>🔄 {attempts} attempts</span>
          {!isMuted && (
            <span style={{ fontSize: '9px', color: palette.bodyTextSoft, fontStyle: 'italic' }}>🎵 8-bit vibes</span>
          )}
        </div>
      </div>
    );
  }

  // ===== FINISHED SCREEN =====
  if (gameState === 'finished') {
    const totalPairs = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 10 : 12;
    const isPerfect = matches === totalPairs;
    const accuracy = attempts > 0 ? Math.round((matches / attempts) * 100) : 0;

    return (
      <div style={{
        ...fullScreenBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        {bgAnimationStyle}
        <div className="match-game-result" style={{
          background: theme.cardBg,
          borderRadius: '24px',
          padding: '32px 28px',
          textAlign: 'center',
          maxWidth: '520px',
          width: '100%',
          border: theme.cardBorder,
          boxShadow: theme.cardShadow
        }}>
          <div style={{ fontSize: '64px', marginBottom: '4px' }}>
            {isPerfect ? '👑' : '🎉'}
          </div>

          <h2 style={{
            fontSize: '26px',
            fontWeight: '800',
            color: isPerfect ? palette.gold : theme.textPrimary,
            marginBottom: '4px',
            fontFamily: FONT_DISPLAY
          }}>
            {isPerfect ? 'Perfect!' : 'Well Done!'}
          </h2>

          <p style={{ fontSize: '13px', color: theme.textSecondary, marginBottom: '16px', fontFamily: FONT_BODY, fontWeight: 600 }}>
            {matches} pairs • {attempts} attempts • {accuracy}% accuracy
          </p>

          <div className="match-game-result-stats" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <div style={{ padding: '12px', background: theme.surfaceBg, borderRadius: '10px', border: `1.5px solid ${palette.border}` }}>
              <div style={{ fontSize: '20px', fontWeight: '800', color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>{matches}</div>
              <div style={{ fontSize: '10px', color: theme.textSecondary, fontFamily: FONT_DISPLAY, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pairs</div>
            </div>
            <div style={{ padding: '12px', background: theme.surfaceBg, borderRadius: '10px', border: `1.5px solid ${palette.border}` }}>
              <div style={{ fontSize: '20px', fontWeight: '800', color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>{attempts}</div>
              <div style={{ fontSize: '10px', color: theme.textSecondary, fontFamily: FONT_DISPLAY, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Attempts</div>
            </div>
            <div style={{ padding: '12px', background: theme.surfaceBg, borderRadius: '10px', border: `1.5px solid ${palette.border}` }}>
              <div style={{ fontSize: '20px', fontWeight: '800', color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>{timer}s</div>
              <div style={{ fontSize: '10px', color: theme.textSecondary, fontFamily: FONT_DISPLAY, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Left</div>
            </div>
          </div>

          {unlockedAchievements.length > 0 && (
            <div style={{ marginBottom: '16px', padding: '10px', background: `${palette.warmOrange}12`, borderRadius: '10px', border: `1.5px solid ${palette.warmOrange}40` }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: palette.warmOrange, fontFamily: FONT_BODY }}>
                🏅 {unlockedAchievements.join(' • ')}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '6px', flexDirection: 'column' }}>
            <button onClick={() => setShowLeaderboard(true)} style={{ padding: '11px', background: palette.creamSoft, color: palette.bodyText, border: `1.5px solid ${palette.border}`, borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: '800', fontFamily: FONT_DISPLAY, touchAction: 'manipulation' }}>
              🏆 Leaderboard
            </button>
            <button onClick={handleRestart} style={{ padding: '12px', background: theme.accentGradient, color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '13px', fontWeight: '800', boxShadow: `0 3px 0 ${palette.warmOrangeShadow}`, fontFamily: FONT_DISPLAY, touchAction: 'manipulation' }}>
              🔄 Play Again
            </button>
            <button onClick={() => setGameState('intro')} style={{ padding: '10px', background: palette.creamSoft, color: palette.bodyText, border: `1.5px solid ${palette.border}`, borderRadius: '12px', cursor: 'pointer', fontSize: '12px', fontWeight: '800', fontFamily: FONT_DISPLAY, touchAction: 'manipulation' }}>
              Back to Menu
            </button>
            <button onClick={onBack} style={{ padding: '10px', background: 'transparent', color: palette.bodyTextSoft, border: `1.5px solid ${palette.border}`, borderRadius: '12px', cursor: 'pointer', fontSize: '12px', fontWeight: '800', fontFamily: FONT_DISPLAY, touchAction: 'manipulation' }}>
              ← Exit
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default MatchGame;