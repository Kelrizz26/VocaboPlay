// src/components/dashboard/MatchGame.jsx

import React, { useState, useEffect, useRef } from 'react';
import { updateStreak } from '../../utils/streakHelper';
import { updateUserStats } from '../../services/firebaseService';
import { auth } from '../../pages/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// ============================================================
// ===== IMAGE / FULLSCREEN BACKGROUND CONFIGURATION =====
// ============================================================
const imageBasePath = 'src/image/';

const fullScreenBg = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  overflowY: 'auto',
  backgroundImage: `linear-gradient(135deg, rgba(10,20,60,0.25), rgba(10,20,60,0.35)), url(${imageBasePath}bg-matchgame.png)`,
  backgroundSize: '130% 130%',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  animation: 'bgPan 30s ease-in-out infinite alternate',
  fontFamily: "'Poppins', -apple-system, sans-serif",
};

const bgAnimationStyle = (
  <style>{`
    @keyframes bgPan {
      0% { background-position: 0% 0%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 50% 100%; }
    }

    /* ===== MOBILE RESPONSIVE STYLES ===== */
    @media (max-width: 768px) {
      .match-game-container {
        padding: 8px !important;
      }
      
      .match-game-header {
        padding: 8px 12px !important;
        margin-bottom: 8px !important;
        flex-wrap: wrap !important;
        gap: 4px !important;
      }
      
      .match-game-header > div {
        flex-wrap: wrap !important;
        gap: 4px !important;
      }
      
      .match-game-cards {
        gap: 4px !important;
        padding: 8px !important;
      }
      
      .match-game-card {
        aspect-ratio: 1 !important;
        min-height: 50px !important;
      }
      
      .match-game-card-back {
        font-size: 14px !important;
      }
      
      .match-game-card-front {
        font-size: 12px !important;
      }
      
      .match-game-card-front-emoji {
        font-size: 20px !important;
      }
      
      .match-game-footer {
        flex-wrap: wrap !important;
        gap: 4px !important;
        font-size: 10px !important;
        padding: 6px 12px !important;
      }
      
      .match-game-intro {
        padding: 20px 16px !important;
        margin: 12px !important;
      }
      
      .match-game-intro h1 {
        font-size: 22px !important;
      }
      
      .match-game-intro p {
        font-size: 13px !important;
      }
      
      .match-game-difficulty {
        gap: 6px !important;
        padding: 8px !important;
        flex-wrap: wrap !important;
      }
      
      .match-game-difficulty button {
        padding: 8px 6px !important;
        font-size: 11px !important;
        min-width: 60px !important;
      }
      
      .match-game-stats-grid {
        grid-template-columns: repeat(3, 1fr) !important;
        gap: 6px !important;
      }
      
      .match-game-stats-grid > div {
        padding: 10px !important;
      }
      
      .match-game-stats-grid > div div:first-child {
        font-size: 16px !important;
      }
      
      .match-game-modal {
        padding: 20px !important;
        max-width: 320px !important;
        margin: 12px !important;
      }
      
      .match-game-modal h3 {
        font-size: 16px !important;
      }
      
      .match-game-result {
        padding: 24px 16px !important;
        margin: 12px !important;
      }
      
      .match-game-result h2 {
        font-size: 22px !important;
      }
      
      .match-game-result-stats {
        grid-template-columns: repeat(3, 1fr) !important;
        gap: 6px !important;
      }
      
      .match-game-result-stats > div {
        padding: 8px !important;
      }
      
      .match-game-result-stats > div div:first-child {
        font-size: 16px !important;
      }
      
      .match-game-progress {
        height: 2px !important;
        margin-bottom: 8px !important;
      }
      
      .match-game-timer {
        font-size: 14px !important;
        min-width: 24px !important;
      }
      
      .match-game-score {
        font-size: 13px !important;
        padding: 2px 10px !important;
      }
      
      .match-game-music-toggle {
        font-size: 14px !important;
        padding: 2px 8px !important;
      }
      
      .match-game-loading {
        padding: 24px !important;
      }
      
      .match-game-loading h2 {
        font-size: 20px !important;
      }
      
      .match-game-loading-spinner {
        width: 60px !important;
        height: 60px !important;
      }
    }

    @media (max-width: 480px) {
      .match-game-cards {
        gap: 3px !important;
        padding: 6px !important;
      }
      
      .match-game-card {
        min-height: 40px !important;
      }
      
      .match-game-card-back {
        font-size: 10px !important;
        border-radius: 8px !important;
      }
      
      .match-game-card-front {
        font-size: 9px !important;
        border-radius: 8px !important;
      }
      
      .match-game-card-front-emoji {
        font-size: 16px !important;
      }
      
      .match-game-header {
        padding: 6px 10px !important;
        border-radius: 10px !important;
      }
      
      .match-game-header span {
        font-size: 12px !important;
      }
      
      .match-game-intro h1 {
        font-size: 18px !important;
      }
      
      .match-game-intro p {
        font-size: 11px !important;
      }
      
      .match-game-difficulty button {
        padding: 6px 4px !important;
        font-size: 10px !important;
        min-width: 50px !important;
      }
      
      .match-game-difficulty button div:first-child {
        font-size: 12px !important;
      }
      
      .match-game-stats-grid > div div:first-child {
        font-size: 14px !important;
      }
      
      .match-game-result h2 {
        font-size: 18px !important;
      }
      
      .match-game-result-stats > div div:first-child {
        font-size: 14px !important;
      }
      
      .match-game-modal {
        padding: 16px !important;
        max-width: 280px !important;
      }
      
      .match-game-modal button {
        font-size: 12px !important;
        padding: 8px !important;
      }
    }

    @media (max-width: 360px) {
      .match-game-cards {
        gap: 2px !important;
        padding: 4px !important;
      }
      
      .match-game-card {
        min-height: 32px !important;
      }
      
      .match-game-card-back {
        font-size: 8px !important;
      }
      
      .match-game-card-front {
        font-size: 7px !important;
      }
      
      .match-game-card-front-emoji {
        font-size: 12px !important;
      }
      
      .match-game-header {
        padding: 4px 8px !important;
        border-radius: 8px !important;
      }
      
      .match-game-header span {
        font-size: 10px !important;
      }
    }

    @media (orientation: landscape) and (max-height: 600px) {
      .match-game-cards {
        gap: 4px !important;
        padding: 6px !important;
      }
      
      .match-game-card {
        min-height: 44px !important;
      }
      
      .match-game-header {
        padding: 4px 12px !important;
        margin-bottom: 4px !important;
      }
      
      .match-game-footer {
        padding: 4px 12px !important;
        margin-top: 4px !important;
      }
      
      .match-game-progress {
        height: 2px !important;
        margin-bottom: 4px !important;
      }
    }
  `}</style>
);

const MatchGame = ({ onBack, updateProgress }) => {
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
  const [sessionSaved, setSessionSaved] = useState(false);

  // ===== FIREBASE USER =====
  const [currentUser, setCurrentUser] = useState(null);
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  // ===== BACKGROUND MUSIC =====
  const audioCtxRef = useRef(null);
  const musicIntervalRef = useRef(null);
  const musicGainRef = useRef(null);
  const isMusicPlaying = useRef(false);

  // Nintendo-style nostalgic melody notes (C major scale)
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
  // ===== FIREBASE AUTH - GET CURRENT USER =====
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
  // ===== SAVE TO FIREBASE - FIXED: 1 POINT ONLY =====
  // ============================================================
  const saveGameToFirebase = async (isWin) => {
    if (!currentUser) {
      console.log('⚠️ No user logged in, skipping Firebase save');
      return;
    }

    const userId = currentUser.uid;
    const totalPairs = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 10 : 12;
    const isPerfect = matches === totalPairs;
    const pointsEarned = matches; // ✅ 1 point per match

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

  // ===== BACKGROUND MUSIC FUNCTIONS =====
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
      if (!isMusicPlaying.current || isMuted) {
        return;
      }
      
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

  // Start/stop music based on game state
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

  // Cleanup on unmount
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

  // ===== GENERATE CARDS =====
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

  // ===== INITIALIZE GAME - FIXED: RESET SESSION SAVED =====
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
    setSessionSaved(false); // ✅ FIXED: Reset session saved flag for new game
    
    const saved = localStorage.getItem('matchgame_leaderboard');
    if (saved) setLeaderboardData(JSON.parse(saved));
    
    const savedStats = localStorage.getItem('matchgame_stats');
    if (savedStats) setStats(JSON.parse(savedStats));
  };

  // ===== START GAME FROM INTRO WITH LOADING - FIXED =====
  const startGame = () => {
    setSessionSaved(false); // ✅ FIXED: Reset before starting
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
    if (matches === totalPairs && totalPairs > 0 && !sessionSaved) {
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
  // ===== SAVE GAME PROGRESS - FIXED: 1 POINT PER MATCH =====
  // ============================================================
  const saveGameProgress = (isWin) => {
    // ✅ FIXED: Prevent duplicate saves
    if (sessionSaved) {
      console.log('⚠️ Game progress already saved, skipping duplicate save');
      return;
    }
    setSessionSaved(true);
    
    const totalPairs = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 10 : 12;
    const isPerfect = matches === totalPairs;
    const accuracy = attempts > 0 ? Math.round((matches / attempts) * 100) : 0;
    
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
    
    // ✅ FIXED: Use 'matches' for points, words, and correct answers
    // 1 match = 1 point = 1 word learned = 1 correct answer
    const progressData = {
      gamesPlayed: (currentProgress.gamesPlayed || 0) + 1,
      totalPoints: (currentProgress.totalPoints || 0) + matches,
      xp: (currentProgress.xp || 0) + matches,
      totalAnswers: (currentProgress.totalAnswers || 0) + attempts,
      correctAnswers: (currentProgress.correctAnswers || 0) + matches,
      wordsLearned: (currentProgress.wordsLearned || 0) + matches,
      streak: newStreak,
      match: {
        gamesCompleted: (currentProgress.match?.gamesCompleted || 0) + 1,
        totalPairs: (currentProgress.match?.totalPairs || 0) + matches,
        totalMoves: (currentProgress.match?.totalMoves || 0) + attempts,
        bestTime: currentProgress.match?.bestTime === 0 ? timer : Math.min(currentProgress.match?.bestTime || Infinity, timer),
        bestMoves: currentProgress.match?.bestMoves === 0 ? attempts : Math.min(currentProgress.match?.bestMoves || Infinity, attempts),
        perfectGames: isPerfect ? (currentProgress.match?.perfectGames || 0) + 1 : (currentProgress.match?.perfectGames || 0)
      }
    };
    
    if (updateProgress) {
      updateProgress(progressData)
        .then(() => {
          console.log('✅ MatchGame: Progress saved successfully!');
        })
        .catch(err => {
          console.error('❌ MatchGame: Error saving progress:', err);
        });
    }
  };

  // ============================================================
  // ===== HANDLE CARD CLICK - FIXED: 1 POINT PER MATCH =====
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
          // ✅ FIXED: 1 point per match
          setScore(prev => prev + 1);
          setAttempts(prev => prev + 1);
          setCorrectAnswers(prev => prev + 1);
          setTotalAnswers(prev => prev + 1);
          setFlippedCards([]);
          setIsLocked(false);
          playMatchSuccess();
          
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

  // ===== RESTART =====
  const handleRestart = () => {
    initializeGame();
    setShowAchievement(false);
    setUnlockedAchievements([]);
    if (!isMuted && !isMusicPlaying.current) {
      startBackgroundMusic();
    }
  };

  // ===== EXIT =====
  const handleExitGame = () => {
    if (gameState === 'playing' && !sessionSaved) {
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
        background: '#1E293B',
        color: 'white',
        padding: '12px 28px',
        borderRadius: '8px',
        boxShadow: 'none',
        animation: 'slideDown 0.4s ease',
        fontSize: '15px',
        fontWeight: '600',
        letterSpacing: '0.3px'
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
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '32px',
        maxWidth: '380px',
        width: '100%',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🚪</div>
        <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>Exit Game?</h3>
        <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px' }}>Your progress will be saved.</p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={confirmExit} style={{ flex: 1, padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>Exit</button>
          <button onClick={cancelExit} style={{ flex: 1, padding: '12px', background: '#F8FAFC', color: '#64748B', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>Cancel</button>
        </div>
      </div>
    </div>
  );

  // ===== SETTINGS =====
  const SettingsModal = () => (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }} onClick={() => setShowSettings(false)}>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '28px',
        maxWidth: '380px',
        width: '100%',
        maxHeight: '80vh',
        overflow: 'auto'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1E293B' }}>Settings</h3>
          <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748B' }}>✕</button>
        </div>

        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#F8FAFC', borderRadius: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>🎵</span>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Background Music</span>
          </div>
          <button 
            onClick={toggleMusic}
            style={{
              padding: '4px 16px',
              borderRadius: '8px',
              border: 'none',
              background: isMuted ? '#ef4444' : '#10b981',
              color: 'white',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            {isMuted ? 'OFF' : 'ON'}
          </button>
        </div>

        <div style={{ marginBottom: '20px', padding: '16px', background: '#F8FAFC', borderRadius: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#5C6AC4' }}>{stats.gamesPlayed}</div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>Games</div>
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#5C6AC4' }}>{stats.bestScore}</div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>Best Score</div>
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#5C6AC4' }}>{stats.bestTime || '-'}s</div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>Best Time</div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px' }}>Difficulty</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['easy', 'medium', 'hard'].map(d => (
              <button
                key={d}
                onClick={() => { setDifficulty(d); setShowSettings(false); }}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '10px',
                  border: `2px solid ${difficulty === d ? '#5C6AC4' : '#E2E8F0'}`,
                  background: difficulty === d ? '#5C6AC4' : 'transparent',
                  color: difficulty === d ? 'white' : '#64748B',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'capitalize'
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>🔊 Sound Effects</span>
          <button 
            onClick={() => {
              const newMuted = !isMuted;
              setIsMuted(newMuted);
              if (gainNode.current) gainNode.current.gain.value = newMuted ? 0 : 0.4;
            }}
            style={{
              padding: '4px 16px',
              borderRadius: '8px',
              border: 'none',
              background: isMuted ? '#ef4444' : '#10b981',
              color: 'white',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            {isMuted ? 'OFF' : 'ON'}
          </button>
        </div>

        <button onClick={() => { setShowLeaderboard(true); setShowSettings(false); }} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid #E2E8F0`, background: 'transparent', color: '#64748B', cursor: 'pointer', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
          🏆 Leaderboard
        </button>

        <button onClick={() => { setShowSettings(false); handleExitGame(); }} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid #fca5a5`, background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
          🚪 Exit
        </button>

        <button onClick={() => { setShowSettings(false); handleRestart(); }} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: 'none', background: '#F8FAFC', color: '#64748B', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
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
      background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }} onClick={() => setShowLeaderboard(false)}>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '24px',
        maxWidth: '400px',
        width: '100%',
        maxHeight: '70vh',
        overflow: 'auto'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1E293B' }}>🏆 Leaderboard</h3>
          <button onClick={() => setShowLeaderboard(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748B' }}>✕</button>
        </div>

        {leaderboardData.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748B', padding: '32px 0' }}>
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>📊</div>
            <p>No scores yet!</p>
          </div>
        ) : (
          leaderboardData.map((entry, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 12px',
              borderRadius: '10px',
              background: index < 3 ? '#f0f0ff' : 'transparent',
              marginBottom: '6px'
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#E2E8F0',
                color: index < 3 ? '#1E293B' : '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: '700',
                marginRight: '12px'
              }}>
                {index + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '14px', color: '#1E293B' }}>{entry.name || 'Player'}</div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>{entry.pairs} pairs • {entry.difficulty} • {entry.time}s</div>
              </div>
              <div style={{ fontWeight: '700', fontSize: '16px', color: '#5C6AC4' }}>{entry.score}</div>
            </div>
          ))
        )}

        <button onClick={() => setShowLeaderboard(false)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: 'none', background: '#5C6AC4', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '600', marginTop: '12px' }}>
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
          background: 'rgba(13, 20, 50, 0.45)',
          backdropFilter: 'blur(12px)',
          borderRadius: '24px',
          border: '1px solid rgba(255,255,255,0.15)'
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
              borderTop: '4px solid #FDE047',
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
            fontWeight: '700',
            color: '#FFFFFF',
            marginBottom: '8px',
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
                background: '#FDE047',
                animation: `bounceDot 1.4s ease-in-out ${i * 0.3}s infinite`
              }} />
            ))}
          </div>

          <p style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.75)',
            marginTop: '16px',
            fontStyle: 'italic'
          }}>
            Preparing your game...
          </p>
        </div>

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes spinBorder {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes fadeInOut {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
          }
          
          @keyframes bounceDot {
            0%, 100% { transform: scale(0.5); opacity: 0.3; }
            50% { transform: scale(1.2); opacity: 1; }
          }
          
          @keyframes floatShape {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-30px); }
          }
          
          @keyframes pulseShape {
            0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
            50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.1; }
          }
          
          @keyframes twinkle {
            0%, 100% { opacity: 0.1; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.5); }
          }
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
          background: 'linear-gradient(160deg, #1a1730 0%, #0d0b1a 100%)',
          border: '1px solid rgba(139,92,246,0.28)',
          borderRadius: '28px',
          padding: '32px 28px',
          textAlign: 'center',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.7), 0 0 0 1px rgba(139,92,246,0.05) inset'
        }}>
          {currentUser && (
            <div style={{
              background: 'rgba(139,92,246,0.16)',
              padding: '8px 16px',
              borderRadius: '12px',
              marginBottom: '16px',
              display: 'inline-block'
            }}>
              <span style={{ fontSize: '13px', color: '#C4B5FD', fontWeight: '600' }}>
                👤 {currentUser.displayName || currentUser.email || 'Player'}
              </span>
            </div>
          )}

          <div style={{
            width: '100px',
            height: '100px',
            margin: '0 auto 16px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            boxShadow: '0 10px 30px rgba(139,92,246,0.35)'
          }}>
            🧩
          </div>

          <h1 style={{
            fontSize: '28px',
            fontWeight: '800',
            color: '#F5F3FF',
            marginBottom: '4px'
          }}>
            Match Game
          </h1>
          <p style={{
            fontSize: '15px',
            color: '#C4B5FD',
            marginBottom: '4px'
          }}>
            Pair words with their emojis
          </p>
          <p style={{
            fontSize: '12px',
            color: '#9CA3AF',
            marginBottom: '20px'
          }}>
            🎯 {totalPairs} pairs • ⏱️ {timeLimit}s • 🎵 8-bit music
          </p>

          <div className="match-game-difficulty" style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '20px',
            padding: '12px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: '14px'
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
                    padding: '10px 8px',
                    borderRadius: '10px',
                    border: `2px solid ${difficulty === d ? '#A78BFA' : 'rgba(255,255,255,0.10)'}`,
                    background: difficulty === d ? 'rgba(139,92,246,0.16)' : 'transparent',
                    color: difficulty === d ? '#C4B5FD' : '#9CA3AF',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'capitalize',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '16px' }}>{d === 'easy' ? '🟢' : d === 'medium' ? '🟡' : '🔴'}</div>
                  <div>{d}</div>
                  <div style={{ fontSize: '10px', fontWeight: '400', opacity: 0.7 }}>
                    {pairCount} pairs • {time}s
                  </div>
                </button>
              );
            })}
          </div>

          <div className="match-game-stats-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
            marginBottom: '24px'
          }}>
            <div style={{
              padding: '14px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#A78BFA' }}>
                {difficulty === 'easy' ? 8 : difficulty === 'medium' ? 10 : 12}
              </div>
              <div style={{ fontSize: '10px', color: '#9CA3AF' }}>Pairs</div>
            </div>
            <div style={{
              padding: '14px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#FBBF24' }}>
                {difficulty === 'easy' ? 70 : difficulty === 'medium' ? 60 : 50}s
              </div>
              <div style={{ fontSize: '10px', color: '#9CA3AF' }}>Time Limit</div>
            </div>
            <div style={{
              padding: '14px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#A78BFA' }}>🧠</div>
              <div style={{ fontSize: '10px', color: '#9CA3AF' }}>Memory</div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '16px',
            padding: '8px 16px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: '12px'
          }}>
            <button
              onClick={toggleMusic}
              style={{
                padding: '6px 16px',
                borderRadius: '8px',
                border: 'none',
                background: isMuted ? '#ef4444' : '#10b981',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {isMuted ? '🔇' : '🔊'} {isMuted ? 'Music Off' : 'Music On'}
            </button>
            <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
              🎵 8-bit vibes
            </span>
          </div>

          <button
            onClick={startGame}
            style={{
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(139,92,246,0.4)',
              transition: 'transform 0.2s',
              touchAction: 'manipulation'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            onTouchStart={(e) => e.target.style.transform = 'scale(0.98)'}
            onTouchEnd={(e) => e.target.style.transform = 'scale(1)'}
          >
            🚀 Start Game
          </button>

          <button
            onClick={onBack}
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '8px',
              background: 'transparent',
              color: '#C4B5FD',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: '14px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              touchAction: 'manipulation'
            }}
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // ===== LOADING SCREEN (Initial Firebase auth loading) =====
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
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.5)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1E293B' }}>Loading...</h2>
          <p style={{ fontSize: '14px', color: '#64748B' }}>Please wait while we set up your game.</p>
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
          background: 'white',
          borderRadius: '24px',
          padding: '40px',
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.5)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '8px' }}>⏰</div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1E293B', marginBottom: '4px' }}>Time's Up!</h2>
          <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '20px' }}>You matched {matches} pairs</p>
          
          <div className="match-game-result-stats" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '10px',
            marginBottom: '24px'
          }}>
            <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '12px' }}>
              <div style={{ fontSize: '22px', fontWeight: '700', color: '#5C6AC4' }}>{matches}</div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>Pairs</div>
            </div>
            <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '12px' }}>
              <div style={{ fontSize: '22px', fontWeight: '700', color: '#5C6AC4' }}>{attempts}</div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>Attempts</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
            <button onClick={handleRestart} style={{ padding: '12px', background: '#5C6AC4', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', touchAction: 'manipulation' }}>🔄 Play Again</button>
            <button onClick={() => setGameState('intro')} style={{ padding: '12px', background: 'transparent', color: '#64748B', border: '1px solid #E2E8F0', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', touchAction: 'manipulation' }}>← Back to Menu</button>
            <button onClick={onBack} style={{ padding: '12px', background: 'transparent', color: '#94a3b8', border: '1px solid #E2E8F0', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', touchAction: 'manipulation' }}>← Exit</button>
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
        padding: '16px'
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
          padding: '12px 16px',
          background: 'white',
          borderRadius: '16px',
          maxWidth: '700px',
          margin: '0 auto 12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => setShowSettings(true)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', padding: '4px', touchAction: 'manipulation' }}>⚙️</button>
            <span style={{ fontWeight: '600', color: '#1E293B', fontSize: '15px' }}>Match</span>
            <span style={{
              padding: '2px 10px',
              borderRadius: '8px',
              background: '#F8FAFC',
              color: '#64748B',
              fontSize: '10px',
              fontWeight: '600',
              textTransform: 'capitalize'
            }}>{difficulty}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={toggleMusic}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '16px',
                cursor: 'pointer',
                padding: '2px 4px',
                opacity: isMuted ? 0.3 : 1,
                touchAction: 'manipulation'
              }}
              title={isMuted ? 'Turn music on' : 'Turn music off'}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '14px' }}>🎯</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>{matches}/{totalPairs}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '14px' }}>⏱️</span>
              <span className="match-game-timer" style={{
                fontWeight: '700',
                fontSize: '16px',
                color: timer <= 10 ? '#ef4444' : timer <= 20 ? '#f59e0b' : '#10b981',
                minWidth: '28px'
              }}>{timer}s</span>
            </div>
            <div className="match-game-score" style={{
              background: '#5C6AC4',
              padding: '2px 14px',
              borderRadius: '8px',
              color: 'white',
              fontWeight: '700',
              fontSize: '15px'
            }}>
              {matches}
            </div>
          </div>
        </div>

        <div className="match-game-progress" style={{ maxWidth: '700px', margin: '0 auto 12px' }}>
          <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.35)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg, #5C6AC4, #5C6AC4)',
              width: `${progress}%`,
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>

        <div className="match-game-cards" style={{
          maxWidth: '700px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: `repeat(${difficulty === 'easy' ? 4 : difficulty === 'medium' ? 5 : 6}, 1fr)`,
          gap: '8px',
          padding: '12px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          {cards.map((card, index) => (
            <div
              key={card.id}
              className="match-game-card"
              onClick={() => handleCardClick(index)}
              style={{
                aspectRatio: '1',
                cursor: card.isMatched || flippedCards.includes(index) || isLocked ? 'default' : 'pointer',
                opacity: card.isMatched ? 0.4 : 1,
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
                    background: 'linear-gradient(135deg, #5C6AC4, #5C6AC4)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    boxShadow: 'none',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  ✦
                </div>

                <div
                  className="match-game-card-front"
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    background: 'white',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: card.type === 'emoji' ? '28px' : '12px',
                    fontWeight: card.type === 'word' ? '600' : 'normal',
                    boxShadow: 'none',
                    border: `1px solid ${card.isMatched ? '#10b981' : '#E2E8F0'}`,
                    padding: '2px',
                    textAlign: 'center',
                    color: '#1E293B'
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
          maxWidth: '700px',
          margin: '12px auto 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 16px',
          background: 'white',
          borderRadius: '12px',
          fontSize: '12px',
          color: '#64748B',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <span>💡 Match words with emojis</span>
          <span>🔄 {attempts} attempts</span>
          {!isMuted && (
            <span style={{ fontSize: '10px', color: '#5C6AC4', fontStyle: 'italic' }}>🎵 8-bit vibes</span>
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
          background: 'white',
          borderRadius: '24px',
          padding: '36px',
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.5)'
        }}>
          <div style={{ fontSize: '72px', marginBottom: '4px' }}>
            {isPerfect ? '👑' : '🎉'}
          </div>
          
          <h2 style={{
            fontSize: '26px',
            fontWeight: '700',
            color: isPerfect ? '#f59e0b' : '#1E293B',
            marginBottom: '4px'
          }}>
            {isPerfect ? 'Perfect!' : 'Well Done!'}
          </h2>
          
          <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '16px' }}>
            {matches} pairs • {attempts} attempts • {accuracy}% accuracy
          </p>

          <div className="match-game-result-stats" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            marginBottom: '20px'
          }}>
            <div style={{ padding: '10px', background: '#F8FAFC', borderRadius: '10px' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#5C6AC4' }}>{matches}</div>
              <div style={{ fontSize: '10px', color: '#64748B' }}>Pairs</div>
            </div>
            <div style={{ padding: '10px', background: '#F8FAFC', borderRadius: '10px' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#5C6AC4' }}>{attempts}</div>
              <div style={{ fontSize: '10px', color: '#64748B' }}>Attempts</div>
            </div>
            <div style={{ padding: '10px', background: '#F8FAFC', borderRadius: '10px' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#5C6AC4' }}>{timer}s</div>
              <div style={{ fontSize: '10px', color: '#64748B' }}>Left</div>
            </div>
          </div>

          {unlockedAchievements.length > 0 && (
            <div style={{ marginBottom: '16px', padding: '10px', background: '#f0f0ff', borderRadius: '10px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#5C6AC4' }}>
                🏅 {unlockedAchievements.join(' • ')}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
            <button onClick={() => setShowLeaderboard(true)} style={{ padding: '11px', background: 'transparent', color: '#64748B', border: '1px solid #E2E8F0', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', touchAction: 'manipulation' }}>
              🏆 Leaderboard
            </button>
            <button onClick={handleRestart} style={{ padding: '11px', background: '#5C6AC4', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', touchAction: 'manipulation' }}>
              🔄 Play Again
            </button>
            <button onClick={() => setGameState('intro')} style={{ padding: '11px', background: 'transparent', color: '#64748B', border: '1px solid #E2E8F0', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', touchAction: 'manipulation' }}>
              ← Back to Menu
            </button>
            <button onClick={onBack} style={{ padding: '11px', background: 'transparent', color: '#94a3b8', border: '1px solid #E2E8F0', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', touchAction: 'manipulation' }}>
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