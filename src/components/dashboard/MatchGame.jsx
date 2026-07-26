// src/components/dashboard/MatchGame.jsx

import React, { useState, useEffect, useRef } from 'react';
import { updateStreak } from '../../utils/streakHelper';
import { updateUserStats } from '../../services/firebaseService';
import { auth } from '../../pages/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const MatchGame = ({ onBack, updateProgress }) => {
  // ===== GAME STATE =====
  const [gameState, setGameState] = useState('intro'); // 'intro', 'loading', 'playing', 'gameover', 'finished'
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
    { note: 523.25, duration: 0.15 }, // C5
    { note: 587.33, duration: 0.15 }, // D5
    { note: 659.25, duration: 0.15 }, // E5
    { note: 783.99, duration: 0.15 }, // G5
    { note: 659.25, duration: 0.15 }, // E5
    { note: 587.33, duration: 0.15 }, // D5
    { note: 523.25, duration: 0.15 }, // C5
    { note: 659.25, duration: 0.15 }, // E5
    { note: 783.99, duration: 0.15 }, // G5
    { note: 880.00, duration: 0.15 }, // A5
    { note: 783.99, duration: 0.15 }, // G5
    { note: 659.25, duration: 0.15 }, // E5
    { note: 783.99, duration: 0.15 }, // G5
    { note: 880.00, duration: 0.15 }, // A5
    { note: 987.77, duration: 0.20 }, // B5
    { note: 880.00, duration: 0.20 }, // A5
    { note: 783.99, duration: 0.20 }, // G5
    { note: 659.25, duration: 0.15 }, // E5
    { note: 783.99, duration: 0.15 }, // G5
    { note: 880.00, duration: 0.15 }, // A5
    { note: 1046.50, duration: 0.25 }, // C6
    { note: 987.77, duration: 0.15 }, // B5
    { note: 880.00, duration: 0.15 }, // A5
    { note: 783.99, duration: 0.15 }, // G5
  ];

  // Bass line for nostalgic feel
  const BASS_LINE = [
    { note: 130.81, duration: 0.4 }, // C3
    { note: 130.81, duration: 0.4 }, // C3
    { note: 146.83, duration: 0.4 }, // D3
    { note: 146.83, duration: 0.4 }, // D3
    { note: 164.81, duration: 0.4 }, // E3
    { note: 164.81, duration: 0.4 }, // E3
    { note: 196.00, duration: 0.4 }, // G3
    { note: 196.00, duration: 0.4 }, // G3
  ];

  // Chord progression (C, G, Am, F)
  const CHORD_PROGRESSION = [
    { notes: [261.63, 329.63, 392.00], duration: 1.0 }, // C major
    { notes: [392.00, 493.88, 587.33], duration: 1.0 }, // G major
    { notes: [440.00, 523.25, 659.25], duration: 1.0 }, // A minor
    { notes: [349.23, 440.00, 523.25], duration: 1.0 }, // F major
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
  // ===== ✅ NEW: SAVE TO FIREBASE =====
  // ============================================================
  const saveGameToFirebase = async (isWin) => {
    if (!currentUser) {
      console.log('⚠️ No user logged in, skipping Firebase save');
      return;
    }

    const userId = currentUser.uid;
    const totalPairs = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 10 : 12;
    const isPerfect = matches === totalPairs;
    const pointsEarned = score;

    const gameData = {
      gameType: 'matchGame',
      pointsEarned: pointsEarned,
      newWordsLearned: matches,
      correctAnswers: matches,
      totalQuestions: attempts,
      won: isWin || isPerfect,
      score: score,
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

  // ===== INITIALIZE GAME =====
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
    setSessionSaved(false);
    
    const saved = localStorage.getItem('matchgame_leaderboard');
    if (saved) setLeaderboardData(JSON.parse(saved));
    
    const savedStats = localStorage.getItem('matchgame_stats');
    if (savedStats) setStats(JSON.parse(savedStats));
  };

  // ===== START GAME FROM INTRO WITH LOADING =====
  const startGame = () => {
    // Show loading screen first
    setGameState('loading');
    
    // After 2 seconds, initialize the game
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
        bestScore: Math.max(stats.bestScore, score),
        bestTime: stats.bestTime === 0 ? timer : Math.min(stats.bestTime, timer),
        perfectGames: isPerfect ? (stats.perfectGames || 0) + 1 : (stats.perfectGames || 0),
        bestMoves: stats.bestMoves === 0 ? attempts : Math.min(stats.bestMoves, attempts)
      };
      setStats(newStats);
      localStorage.setItem('matchgame_stats', JSON.stringify(newStats));
      
      const newEntry = {
        name: currentUser?.displayName || currentUser?.email || 'Player',
        score: score,
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
  // ===== SAVE GAME PROGRESS =====
  // ============================================================
  const saveGameProgress = (isWin) => {
    if (sessionSaved) return;
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
    
    const progressData = {
      gamesPlayed: (currentProgress.gamesPlayed || 0) + 1,
      totalPoints: (currentProgress.totalPoints || 0) + score,
      xp: (currentProgress.xp || 0) + score,
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

  // ===== HANDLE CARD CLICK =====
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
          setScore(prev => prev + 10 + Math.floor(timer / 10));
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
  // ===== LOADING SCREEN (NEW) =====
  // ============================================================
  if (gameState === 'loading') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: '#f8fafc',
        fontFamily: "'Poppins', -apple-system, sans-serif",
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background elements */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #f0f0ff 0%, #f8fafc 50%, #f0f0ff 100%)',
          zIndex: 0
        }}>
          {/* Floating geometric shapes */}
          <div style={{
            position: 'absolute',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'rgba(92, 106, 196, 0.05)',
            top: '10%',
            left: '5%',
            animation: 'floatShape 8s ease-in-out infinite'
          }} />
          <div style={{
            position: 'absolute',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'rgba(92, 106, 196, 0.04)',
            bottom: '15%',
            right: '8%',
            animation: 'floatShape 10s ease-in-out infinite reverse'
          }} />
          <div style={{
            position: 'absolute',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'rgba(92, 106, 196, 0.03)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'pulseShape 4s ease-in-out infinite'
          }} />
          
          {/* Decorative dots */}
          {[...Array(12)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'rgba(92, 106, 196, 0.1)',
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
          padding: '40px'
        }}>
          {/* Loading Animation - Spinning Puzzle Piece */}
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
              border: '4px solid #E2E8F0',
              borderRadius: '16px',
              borderTop: '4px solid #5C6AC4',
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

          {/* Loading Text with Animation */}
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#1E293B',
            marginBottom: '8px',
            animation: 'fadeInOut 1.5s ease-in-out infinite'
          }}>
            Loading...
          </h2>

          {/* Animated Dots */}
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
                background: '#5C6AC4',
                animation: `bounceDot 1.4s ease-in-out ${i * 0.3}s infinite`
              }} />
            ))}
          </div>

          {/* Small text */}
          <p style={{
            fontSize: '12px',
            color: '#94a3b8',
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
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: '#f8fafc',
        fontFamily: "'Poppins', -apple-system, sans-serif"
      }}>
        {showExitConfirm && <ExitConfirmModal />}

        <div style={{
          maxWidth: '500px',
          width: '100%',
          background: 'white',
          borderRadius: '24px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: 'none'
        }}>
          {currentUser && (
            <div style={{
              background: 'rgba(92, 106, 196, 0.08)',
              padding: '8px 16px',
              borderRadius: '12px',
              marginBottom: '16px',
              display: 'inline-block'
            }}>
              <span style={{ fontSize: '13px', color: '#5C6AC4', fontWeight: '600' }}>
                👤 {currentUser.displayName || currentUser.email || 'Player'}
              </span>
            </div>
          )}

          <div style={{
            width: '100px',
            height: '100px',
            margin: '0 auto 16px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #5C6AC4, #5C6AC4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px'
          }}>
            🧩
          </div>

          <h1 style={{
            fontSize: '28px',
            fontWeight: '800',
            color: '#1E293B',
            marginBottom: '4px'
          }}>
            Match Game
          </h1>
          <p style={{
            fontSize: '15px',
            color: '#64748B',
            marginBottom: '4px'
          }}>
            Pair words with their emojis
          </p>
          <p style={{
            fontSize: '12px',
            color: '#94a3b8',
            marginBottom: '20px'
          }}>
            🎯 {totalPairs} pairs • ⏱️ {timeLimit}s • 🎵 8-bit music
          </p>

          {/* DIFFICULTY SELECTOR */}
          <div style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '20px',
            padding: '12px',
            background: '#F8FAFC',
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
                    border: `2px solid ${difficulty === d ? '#5C6AC4' : '#E2E8F0'}`,
                    background: difficulty === d ? 'rgba(92, 106, 196, 0.08)' : 'transparent',
                    color: difficulty === d ? '#5C6AC4' : '#64748B',
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

          {/* GAME INFO */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
            marginBottom: '24px'
          }}>
            <div style={{
              padding: '14px',
              background: '#F8FAFC',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#5C6AC4' }}>
                {difficulty === 'easy' ? 8 : difficulty === 'medium' ? 10 : 12}
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>Pairs</div>
            </div>
            <div style={{
              padding: '14px',
              background: '#F8FAFC',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#f59e0b' }}>
                {difficulty === 'easy' ? 70 : difficulty === 'medium' ? 60 : 50}s
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>Time Limit</div>
            </div>
            <div style={{
              padding: '14px',
              background: '#F8FAFC',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#5C6AC4' }}>🧠</div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>Memory</div>
            </div>
          </div>

          {/* MUSIC TOGGLE */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '16px',
            padding: '8px 16px',
            background: '#F8FAFC',
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
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
              🎵 8-bit vibes
            </span>
          </div>

          {/* START BUTTON */}
          <button
            onClick={startGame}
            style={{
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(135deg, #5C6AC4, #5C6AC4)',
              color: 'white',
              border: 'none',
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: 'none',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
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
              color: '#94a3b8',
              border: '1px solid #E2E8F0',
              borderRadius: '14px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
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
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        fontFamily: "'Poppins', -apple-system, sans-serif"
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
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
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: '#f8fafc'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '40px',
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%',
          boxShadow: 'none'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '8px' }}>⏰</div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1E293B', marginBottom: '4px' }}>Time's Up!</h2>
          <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '20px' }}>You matched {matches} pairs</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '24px' }}>
            <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '12px' }}>
              <div style={{ fontSize: '22px', fontWeight: '700', color: '#5C6AC4' }}>{score}</div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>Score</div>
            </div>
            <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '12px' }}>
              <div style={{ fontSize: '22px', fontWeight: '700', color: '#5C6AC4' }}>{attempts}</div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>Attempts</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
            <button onClick={handleRestart} style={{ padding: '12px', background: '#5C6AC4', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>🔄 Play Again</button>
            <button onClick={() => setGameState('intro')} style={{ padding: '12px', background: 'transparent', color: '#64748B', border: '1px solid #E2E8F0', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>← Back to Menu</button>
            <button onClick={onBack} style={{ padding: '12px', background: 'transparent', color: '#94a3b8', border: '1px solid #E2E8F0', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>← Exit</button>
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
      <div style={{
        minHeight: '100vh',
        background: '#f8fafc',
        padding: '16px',
        fontFamily: "'Poppins', -apple-system, sans-serif"
      }}>
        <AchievementPopup />
        {showExitConfirm && <ExitConfirmModal />}
        {showSettings && <SettingsModal />}
        {showLeaderboard && <LeaderboardModal />}

        {/* HEADER - Minimal */}
        <div style={{
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
            <button onClick={() => setShowSettings(true)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', padding: '4px' }}>⚙️</button>
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
                opacity: isMuted ? 0.3 : 1
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
              <span style={{
                fontWeight: '700',
                fontSize: '16px',
                color: timer <= 10 ? '#ef4444' : timer <= 20 ? '#f59e0b' : '#10b981',
                minWidth: '28px'
              }}>{timer}s</span>
            </div>
            <div style={{
              background: '#5C6AC4',
              padding: '2px 14px',
              borderRadius: '8px',
              color: 'white',
              fontWeight: '700',
              fontSize: '15px'
            }}>
              {score}
            </div>
          </div>
        </div>

        {/* PROGRESS - Minimal */}
        <div style={{ maxWidth: '700px', margin: '0 auto 12px' }}>
          <div style={{ width: '100%', height: '3px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg, #5C6AC4, #5C6AC4)',
              width: `${progress}%`,
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>

        {/* CARDS - Clean Grid */}
        <div style={{
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
              onClick={() => handleCardClick(index)}
              style={{
                aspectRatio: '1',
                cursor: card.isMatched || flippedCards.includes(index) || isLocked ? 'default' : 'pointer',
                opacity: card.isMatched ? 0.4 : 1,
                perspective: '800px'
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
                {/* Back */}
                <div
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

                {/* Front */}
                <div
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
                  {card.type === 'emoji' ? card.content : card.content}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER - Clean */}
        <div style={{
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
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: '#f8fafc'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '36px',
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%',
          boxShadow: 'none'
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
            {score} points • {matches} pairs • {accuracy}% accuracy
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '20px' }}>
            <div style={{ padding: '10px', background: '#F8FAFC', borderRadius: '10px' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#5C6AC4' }}>{score}</div>
              <div style={{ fontSize: '10px', color: '#64748B' }}>Score</div>
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
            <button onClick={() => setShowLeaderboard(true)} style={{ padding: '11px', background: 'transparent', color: '#64748B', border: '1px solid #E2E8F0', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
              🏆 Leaderboard
            </button>
            <button onClick={handleRestart} style={{ padding: '11px', background: '#5C6AC4', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
              🔄 Play Again
            </button>
            <button onClick={() => setGameState('intro')} style={{ padding: '11px', background: 'transparent', color: '#64748B', border: '1px solid #E2E8F0', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
              ← Back to Menu
            </button>
            <button onClick={onBack} style={{ padding: '11px', background: 'transparent', color: '#94a3b8', border: '1px solid #E2E8F0', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
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