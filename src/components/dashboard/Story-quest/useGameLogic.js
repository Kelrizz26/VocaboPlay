// src/components/dashboard/Story-quest/useGameLogic.js
// ✅ Level Complete screen with diamond rewards based on accuracy
// ✅ Daily reward limit (once per level per day)
// ✅ All levels have 5 hearts, 15s base timer
// ✅ FIXED: startGame uses livesRef.current (no stale state)
// ✅ FIXED: devForceLevelComplete simplified (no double-add)
// ✅ FIXED: Refs for correctAnswers/totalAnswers prevent race conditions

import { useState, useEffect, useRef, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../../pages/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateUserStats } from '../../../services/firebaseService';
import { claimGameDiamonds, spendDiamonds, HEART_PRICES } from '../../../services/diamondService';
import { STORY_ARCS } from './storyContent';

const REFILL_TIME = 1800;
const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const COMPLETION_BONUS_DIAMONDS = 50;

// 👈 Base diamond rewards per level
const DIAMOND_BASE_REWARDS = {
  'A1': 10, 'A2': 15, 'B1': 20, 'B2': 25, 'C1': 30, 'C2': 35,
};

const LEVEL_TIMER_BASE = {
  'A1': 15, 'A2': 15, 'B1': 15, 'B2': 15, 'C1': 15, 'C2': 15,
};

const getChapterTimer = (chapterIndex, level = 'A1') => {
  const base = LEVEL_TIMER_BASE[level] || 15;
  const chapterNumber = chapterIndex + 1;
  const reduction = Math.floor(chapterNumber);
  return Math.max(5, base - reduction + 1);
};

const getMaxLivesForLevel = (level) => {
  return 5;
};

// 👈 Daily reward helpers
const getTodayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

const getDailyRewardKey = (userId, level) => {
  return `storyquest_daily_reward_${userId || 'guest'}_${level}_${getTodayKey()}`;
};

const hasClaimedDailyReward = (userId, level) => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(getDailyRewardKey(userId, level)) === 'true';
};

const markDailyRewardClaimed = (userId, level) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getDailyRewardKey(userId, level), 'true');
};

const generateScenesForLevel = (level) => {
  const arc = STORY_ARCS[level];
  if (!arc || !arc.scenes) return [];

  const sameLevelPool = arc.scenes.map(s => ({
    def: s.definition,
    vocab: s.vocabulary
  }));

  return arc.scenes.map((scene, index) => {
    if (scene.question && scene.choices && scene.choices.length > 0) {
      const choices = scene.choices
        .map((c, i) => ({
          id: ['A', 'B', 'C', 'D'][i],
          text: c.text,
          correct: c.correct,
        }))
        .sort(() => Math.random() - 0.5);

      return {
        id: index,
        text: scene.text,
        vocabulary: scene.vocabulary,
        definition: scene.definition,
        image: scene.image,
        question: scene.question,
        choices,
      };
    }

    const correctDef = scene.definition;

    let wrongPool = sameLevelPool
      .filter(d => d.vocab !== scene.vocabulary)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(d => d.def);

    while (wrongPool.length < 3) {
      wrongPool.push("A completely different meaning that does not fit the context.");
    }

    const rawChoices = [
      { text: correctDef, correct: true },
      { text: wrongPool[0], correct: false },
      { text: wrongPool[1], correct: false },
      { text: wrongPool[2], correct: false },
    ].sort(() => Math.random() - 0.5);

    const choices = rawChoices.map((c, i) => ({
      id: ['A', 'B', 'C', 'D'][i],
      text: c.text,
      correct: c.correct,
    }));

    return {
      id: index,
      text: scene.text,
      vocabulary: scene.vocabulary,
      definition: correctDef,
      image: scene.image,
      choices,
    };
  });
};

export const useGameLogic = ({ onBack, updateProgress, recordGame }) => {
  const [gameState, setGameState] = useState('intro');
  const [currentScene, setCurrentScene] = useState(0);
  const [currentLevel, setCurrentLevel] = useState('A1');
  const [scenes, setScenes] = useState([]);
  const [completionBonus, setCompletionBonus] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [maxLives, setMaxLives] = useState(5);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAnswers, setTotalAnswers] = useState(0);
  const [timer, setTimer] = useState(getChapterTimer(0, 'A1'));
  const [timerRunning, setTimerRunning] = useState(false);
  const [lastRefillTime, setLastRefillTime] = useState(Date.now());
  const [timeRemaining, setTimeRemaining] = useState('');
  const [showNoLivesMessage, setShowNoLivesMessage] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [localPoints, setLocalPoints] = useState(0);
  const [localDiamonds, setLocalDiamonds] = useState(0);
  
  const [showHeartShop, setShowHeartShop] = useState(false);
  const [diamondsEarnedThisGame, setDiamondsEarnedThisGame] = useState(0);
  const [heartShopProcessing, setHeartShopProcessing] = useState(false);
  const [continueFromGameOver, setContinueFromGameOver] = useState(false);
  const [completedLevels, setCompletedLevels] = useState([]);
  
  // Level complete data
  const [levelCompleteData, setLevelCompleteData] = useState(null);

  const hasSavedProgressRef = useRef(false);
  const completionBonusSavedRef = useRef(false);
  const diamondSavedRef = useRef(false);
  const pointsSavedRef = useRef(false);
  const answeredWordsRef = useRef([]);
  const textTimerRef = useRef(null);
  const speechSynthRef = useRef(null);
  const audioRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const livesIntervalRef = useRef(null);
  const isMountedRef = useRef(true);
  const currentSceneRef = useRef(0);
  const scenesRef = useRef([]);
  const typeIndexRef = useRef(0);
  const livesRef = useRef(5);
  const maxLivesRef = useRef(5);
  const lastRefillTimeRef = useRef(Date.now());
  
  // 👈 BAGO: Refs para maiwasan ang race condition sa accuracy computation
  const correctAnswersRef = useRef(0);
  const totalAnswersRef = useRef(0);
  const scoreRef = useRef(0);

  useEffect(() => { scenesRef.current = scenes; }, [scenes]);
  useEffect(() => { maxLivesRef.current = maxLives; }, [maxLives]);
  useEffect(() => { correctAnswersRef.current = correctAnswers; }, [correctAnswers]);
  useEffect(() => { totalAnswersRef.current = totalAnswers; }, [totalAnswers]);
  useEffect(() => { scoreRef.current = score; }, [score]);

  const getLivesStorageKey = useCallback(() => {
    return currentUser ? `storyquest_lives_${currentUser.uid}` : 'storyquest_lives_guest';
  }, [currentUser]);

  const checkAndRefillLives = useCallback(() => {
    if (!isMountedRef.current) return;
    const key = getLivesStorageKey();
    const now = Date.now();
    const maxL = maxLivesRef.current;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const secs = (now - data.lastRefillTime) / 1000;
        if (secs >= REFILL_TIME && data.lives < maxL) {
          const newLives = Math.min(data.lives + 1, maxL);
          setLives(newLives); livesRef.current = newLives;
          setLastRefillTime(now); lastRefillTimeRef.current = now;
          localStorage.setItem(key, JSON.stringify({ lives: newLives, lastRefillTime: now }));
        } else {
          setLives(Math.min(data.lives, maxL));
          livesRef.current = Math.min(data.lives, maxL);
          setLastRefillTime(data.lastRefillTime); lastRefillTimeRef.current = data.lastRefillTime;
        }
      } catch (e) { /* ignore */ }
    } else {
      setLives(maxL); livesRef.current = maxL;
      setLastRefillTime(Date.now()); lastRefillTimeRef.current = Date.now();
      localStorage.setItem(key, JSON.stringify({ lives: maxL, lastRefillTime: Date.now() }));
    }
  }, [getLivesStorageKey]);

  const updateTimeRemaining = useCallback(() => {
    if (!isMountedRef.current) return;
    if (livesRef.current >= maxLivesRef.current) { setTimeRemaining(''); return; }
    const now = Date.now();
    const elapsed = (now - lastRefillTimeRef.current) / 1000;
    if (elapsed < REFILL_TIME) {
      const rem = REFILL_TIME - elapsed;
      setTimeRemaining(`${Math.floor(rem / 60)}m ${Math.floor(rem % 60).toString().padStart(2, '0')}s`);
    } else { checkAndRefillLives(); setTimeRemaining(''); }
  }, [checkAndRefillLives]);

  useEffect(() => {
    if (currentUser && gameState !== 'intro') {
      localStorage.setItem(getLivesStorageKey(), JSON.stringify({ lives, lastRefillTime }));
    }
  }, [lives, lastRefillTime, gameState, currentUser, getLivesStorageKey]);

  useEffect(() => {
    if (currentUser) {
      isMountedRef.current = true;
      setTimeout(() => { checkAndRefillLives(); updateTimeRemaining(); }, 100);
      if (livesIntervalRef.current) clearInterval(livesIntervalRef.current);
      livesIntervalRef.current = setInterval(() => {
        if (isMountedRef.current) { checkAndRefillLives(); updateTimeRemaining(); }
      }, 1000);
      return () => {
        isMountedRef.current = false;
        if (livesIntervalRef.current) clearInterval(livesIntervalRef.current);
      };
    }
  }, [currentUser, checkAndRefillLives, updateTimeRemaining]);

  useEffect(() => {
    isMountedRef.current = true;
    const unsub = onAuthStateChanged(auth, (user) => { if (isMountedRef.current) setCurrentUser(user); });
    return () => { isMountedRef.current = false; unsub(); };
  }, []);

  useEffect(() => {
    const fetchCurrency = async () => {
      if (!currentUser) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setLocalDiamonds(data.totalDiamonds || 0);
          setLocalPoints(data.totalPoints || 0);
        }
      } catch (e) { /* ignore */ }
    };
    if (currentUser) fetchCurrency();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const key = `storyquest_completed_${currentUser.uid}`;
    const stored = JSON.parse(localStorage.getItem(key) || '[]');
    setCompletedLevels(stored);
  }, [currentUser]);

  const savePointsToFirebase = useCallback(async () => {
    if (!currentUser || pointsSavedRef.current) return;
    pointsSavedRef.current = true;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const snap = await getDoc(userRef);
      const cur = snap.data()?.totalPoints || 0;
      const newTotal = cur + scoreRef.current;
      await updateDoc(userRef, { totalPoints: newTotal });
      setLocalPoints(newTotal);
    } catch (e) { console.error('Error saving points:', e); }
  }, [currentUser]);

  const saveGameToFirebase = useCallback(async (isComplete) => {
    if (!currentUser || !isMountedRef.current) return;
    try {
      await updateUserStats(currentUser.uid, {
        gameType: 'shortStory', pointsEarned: correctAnswersRef.current,
        newWordsLearned: correctAnswersRef.current, correctAnswers: correctAnswersRef.current,
        totalQuestions: totalAnswersRef.current,
        won: isComplete, score: correctAnswersRef.current,
        levelReached: currentLevel,
        displayName: currentUser.displayName || currentUser.email || 'Player',
      });
    } catch (e) { /* ignore */ }
  }, [currentUser, currentLevel]);

  const updateDashboardProgress = useCallback(() => {
    if (hasSavedProgressRef.current) return;
    hasSavedProgressRef.current = true;
    if (!updateProgress) return;
    const wordsList = [...answeredWordsRef.current];
    updateProgress({
      gamesPlayed: 1, totalPoints: correctAnswersRef.current, xp: correctAnswersRef.current,
      wordsLearned: correctAnswersRef.current, totalAnswers: totalAnswersRef.current, 
      correctAnswers: correctAnswersRef.current,
      shortStory: { gamesCompleted: 1, correctAnswers: correctAnswersRef.current, totalQuestions: totalAnswersRef.current, storiesCompleted: 1 }
    }).then(() => {
      if (recordGame) recordGame('short-story', correctAnswersRef.current, correctAnswersRef.current, totalAnswersRef.current, wordsList);
    }).catch(() => {});
  }, [updateProgress, recordGame]);

  useEffect(() => {
    if (window.speechSynthesis) speechSynthRef.current = window.speechSynthesis;
    return () => {
      if (speechSynthRef.current) speechSynthRef.current.cancel();
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    };
  }, []);

  const speakText = useCallback((text) => {
    if (!window.speechSynthesis || !isMountedRef.current) return;
    if (speechSynthRef.current) speechSynthRef.current.cancel();
    setTimeout(() => {
      if (!isMountedRef.current) return;
      try {
        const utt = new SpeechSynthesisUtterance(text);
        utt.rate = 1.0;
        utt.pitch = 1.3;
        utt.lang = 'en-US';
        utt.onstart = () => { if (isMountedRef.current) setIsSpeaking(true); };
        utt.onend = () => { if (isMountedRef.current) setIsSpeaking(false); };
        utt.onerror = () => { if (isMountedRef.current) setIsSpeaking(false); };
        speechSynthRef.current.speak(utt);
      } catch (e) { /* ignore */ }
    }, 50);
  }, []);

  const stopSpeaking = useCallback(() => {
    try {
      if (speechSynthRef.current) speechSynthRef.current.cancel();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.onplay = null;
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current = null;
      }
    } catch (e) { /* ignore */ }
    if (isMountedRef.current) setIsSpeaking(false);
  }, []);

  const playSentenceAudio = useCallback((level, sceneIndex, fallbackText) => {
    if (!isMountedRef.current) return;
    stopSpeaking();

    const levelKey = String(level || 'a1').toLowerCase().trim();
    const sceneNum = (Number(sceneIndex) || 0) + 1;
    const audioPath = `/audio/scenes/${levelKey}-ch${sceneNum}.mp3`;

    try {
      const audio = new Audio(audioPath);
      audio.volume = 1.0;
      audio.preload = 'auto';

      audio.onplay = () => { if (isMountedRef.current) setIsSpeaking(true); };
      audio.onended = () => {
        if (isMountedRef.current) setIsSpeaking(false);
        audioRef.current = null;
      };
      audio.onerror = () => {
        console.warn(`[StoryQuest] No MP3: ${audioPath}, using TTS fallback`);
        if (isMountedRef.current) {
          setIsSpeaking(false);
          if (fallbackText) speakText(fallbackText);
        }
        audioRef.current = null;
      };

      audioRef.current = audio;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('[StoryQuest] Audio play blocked:', err);
          if (isMountedRef.current) {
            setIsSpeaking(false);
            if (fallbackText) speakText(fallbackText);
          }
          audioRef.current = null;
        });
      }
    } catch (err) {
      console.warn('[StoryQuest] Audio error:', err);
      if (fallbackText) speakText(fallbackText);
    }
  }, [stopSpeaking, speakText]);

  const typeText = useCallback((text, callback) => {
    if (!isMountedRef.current) return;
    if (textTimerRef.current) { clearInterval(textTimerRef.current); textTimerRef.current = null; }
    setIsTyping(true); setDisplayText('');
    typeIndexRef.current = 0;
    textTimerRef.current = setInterval(() => {
      if (!isMountedRef.current) {
        if (textTimerRef.current) clearInterval(textTimerRef.current);
        return;
      }
      if (typeIndexRef.current < text.length) {
        setDisplayText(text.slice(0, typeIndexRef.current + 1));
        typeIndexRef.current++;
      } else {
        clearInterval(textTimerRef.current); textTimerRef.current = null;
        setIsTyping(false); setDisplayText(text);
        if (callback) callback();
      }
    }, 25);
  }, []);

  const startGame = useCallback((startLevel = 'A1') => {
    const levelToStart = CEFR_LEVELS.includes(startLevel) ? startLevel : 'A1';
    const newMaxLives = getMaxLivesForLevel(levelToStart);
    setMaxLives(newMaxLives);
    maxLivesRef.current = newMaxLives;

    // 👈 FIXED: Gamitin ang livesRef.current imbes na lives state
    if (livesRef.current <= 0) { setShowHeartShop(true); return; }
    setGameState('loading');
    currentSceneRef.current = 0;
    hasSavedProgressRef.current = false;
    completionBonusSavedRef.current = false;
    diamondSavedRef.current = false;
    pointsSavedRef.current = false;
    answeredWordsRef.current = [];
    
    // 👈 FIXED: Reset refs for accuracy computation
    correctAnswersRef.current = 0;
    totalAnswersRef.current = 0;
    scoreRef.current = 0;

    const initialScenes = generateScenesForLevel(levelToStart);
    setScenes(initialScenes); scenesRef.current = initialScenes;
    setCurrentLevel(levelToStart); setCompletionBonus(0); setDiamondsEarnedThisGame(0);

    setTimeout(() => {
      if (!isMountedRef.current) return;
      setGameState('playing');
      setCurrentScene(0); setScore(0); setCorrectAnswers(0); setTotalAnswers(0);
      setTimer(getChapterTimer(0, levelToStart));
      setTimerRunning(true);
      setSelectedChoice(null); setDisplayText(''); setIsTyping(false);
      if (initialScenes[0]) {
        typeText(initialScenes[0].text);
        playSentenceAudio(levelToStart, 0, initialScenes[0].text);
      }
    }, 800);
  }, [typeText, playSentenceAudio]);

  // Level Complete screen
  const performLevelUp = useCallback(async () => {
    // Mark current level as completed
    if (currentUser) {
      const key = `storyquest_completed_${currentUser.uid}`;
      const stored = JSON.parse(localStorage.getItem(key) || '[]');
      if (!stored.includes(currentLevel)) {
        stored.push(currentLevel);
        localStorage.setItem(key, JSON.stringify(stored));
        setCompletedLevels(stored);
      }
    }

    // Save progress
    saveGameToFirebase(true);
    savePointsToFirebase();
    updateDashboardProgress();

    // 👈 FIXED: Gamitin ang refs para hindi naapektuhan ng stale state
    const finalCorrect = correctAnswersRef.current;
    const finalTotal = totalAnswersRef.current;
    const finalScore = scoreRef.current;
    
    const accuracy = finalTotal > 0 ? Math.round((finalCorrect / finalTotal) * 100) : 0;
    const baseReward = DIAMOND_BASE_REWARDS[currentLevel] || 10;
    const potentialDiamonds = Math.round(baseReward * accuracy / 100);
    const userId = currentUser?.uid || 'guest';
    const alreadyClaimedToday = hasClaimedDailyReward(userId, currentLevel);
    const diamondsToGive = alreadyClaimedToday ? 0 : potentialDiamonds;

    // Give diamond reward to Firebase
    if (diamondsToGive > 0 && currentUser) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const snap = await getDoc(userRef);
        const cur = snap.data()?.totalDiamonds || 0;
        const newTotal = cur + diamondsToGive;
        await updateDoc(userRef, { totalDiamonds: newTotal });
        setLocalDiamonds(newTotal);
        markDailyRewardClaimed(userId, currentLevel);
      } catch (e) { console.error('Error giving diamond reward:', e); }
    }

    // Determine next level
    const idx = CEFR_LEVELS.indexOf(currentLevel);
    const isLastLevel = idx === CEFR_LEVELS.length - 1;
    const nextLevel = isLastLevel ? null : CEFR_LEVELS[idx + 1];

    // Set level complete data
    setLevelCompleteData({
      level: currentLevel,
      accuracy,
      diamondsEarned: diamondsToGive,
      potentialDiamonds,
      alreadyClaimedToday,
      nextLevel,
      isLastLevel,
      score: finalScore,
      correctAnswers: finalCorrect,
      totalAnswers: finalTotal,
      baseReward,
    });

    // Cleanup
    stopSpeaking();
    if (textTimerRef.current) { clearInterval(textTimerRef.current); textTimerRef.current = null; }
    if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; }
    setTimerRunning(false);
    setSelectedChoice(null);
    setShowFeedback(false);
    setDisplayText('');
    setIsTyping(false);

    // Go to level complete screen
    setGameState('levelcomplete');
  }, [currentLevel, currentUser, saveGameToFirebase, savePointsToFirebase, updateDashboardProgress, stopSpeaking]);

  // Handler para sa "Continue to Next Level" button
  const handleNextLevel = useCallback(() => {
    if (!levelCompleteData?.nextLevel) return;
    const nextLvl = levelCompleteData.nextLevel;
    setLevelCompleteData(null);

    stopSpeaking();
    if (textTimerRef.current) { clearInterval(textTimerRef.current); textTimerRef.current = null; }
    if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; }

    const newMaxLives = getMaxLivesForLevel(nextLvl);
    setMaxLives(newMaxLives);
    maxLivesRef.current = newMaxLives;
    setLives(newMaxLives);
    livesRef.current = newMaxLives;

    const newScenes = generateScenesForLevel(nextLvl);
    setScenes(newScenes);
    scenesRef.current = newScenes;
    setCurrentLevel(nextLvl);
    currentSceneRef.current = 0;
    setCurrentScene(0);

    setScore(0);
    setCorrectAnswers(0);
    setTotalAnswers(0);
    setSelectedChoice(null);
    setShowFeedback(false);
    setFeedbackMessage('');
    setDisplayText('');
    setIsTyping(false);
    
    // 👈 FIXED: Reset refs for new level
    correctAnswersRef.current = 0;
    totalAnswersRef.current = 0;
    scoreRef.current = 0;

    hasSavedProgressRef.current = false;
    diamondSavedRef.current = false;
    pointsSavedRef.current = false;
    answeredWordsRef.current = [];

    setGameState('playing');
    setTimer(getChapterTimer(0, nextLvl));
    setTimerRunning(true);

    if (newScenes[0]) {
      setTimeout(() => {
        if (isMountedRef.current) {
          typeText(newScenes[0].text);
          playSentenceAudio(nextLvl, 0, newScenes[0].text);
        }
      }, 300);
    }
  }, [levelCompleteData, stopSpeaking, typeText, playSentenceAudio]);

  // Handler para sa "Back to Map" button
  const handleReturnToMap = useCallback(() => {
    setLevelCompleteData(null);
    stopSpeaking();
    if (textTimerRef.current) { clearInterval(textTimerRef.current); textTimerRef.current = null; }
    if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; }

    currentSceneRef.current = 0;
    setCurrentScene(0);
    setScenes([]);
    scenesRef.current = [];
    setSelectedChoice(null);
    setShowFeedback(false);
    setFeedbackMessage('');
    setFeedbackType('');
    setDisplayText('');
    setIsTyping(false);
    setTimerRunning(false);
    setScore(0);
    setCorrectAnswers(0);
    setTotalAnswers(0);
    
    // 👈 FIXED: Reset refs
    correctAnswersRef.current = 0;
    totalAnswersRef.current = 0;
    scoreRef.current = 0;

    hasSavedProgressRef.current = false;
    diamondSavedRef.current = false;
    pointsSavedRef.current = false;
    answeredWordsRef.current = [];

    setGameState('intro');
  }, [stopSpeaking]);

  const continueToNextLevel = useCallback(() => {
    setSelectedChoice(null); setShowFeedback(false); setDisplayText('');
    setTimer(getChapterTimer(0, currentLevel));
    setTimerRunning(true);
    setGameState('playing');
    if (scenesRef.current[0]) {
      setTimeout(() => {
        if (isMountedRef.current) {
          typeText(scenesRef.current[0].text);
          playSentenceAudio(currentLevel, 0, scenesRef.current[0].text);
        }
      }, 300);
    }
  }, [typeText, playSentenceAudio, currentLevel]);

  const handleChoice = useCallback((choice) => {
    if (selectedChoice !== null || livesRef.current <= 0 || !isMountedRef.current) return;
    stopSpeaking(); setTimerRunning(false);
    setSelectedChoice(choice.id); 
    
    // 👈 FIXED: Update refs synchronously
    totalAnswersRef.current += 1;
    setTotalAnswers(p => p + 1); 
    setShowFeedback(true);

    const sceneObj = scenesRef.current[currentSceneRef.current];
    const word = sceneObj?.vocabulary;
    if (word && !answeredWordsRef.current.includes(word)) answeredWordsRef.current.push(word);

    if (choice.correct) {
      setFeedbackType('correct'); setFeedbackMessage('✅ Excellent! +1 point');
      scoreRef.current += 1;
      correctAnswersRef.current += 1;
      setScore(p => p + 1); 
      setCorrectAnswers(p => p + 1);
      setLocalPoints(p => p + 1);
    } else {
      const penalty = 1;
      setFeedbackType('wrong'); setFeedbackMessage(`❌ Incorrect. -${penalty} life`);
      setLives(p => {
        const newLives = Math.max(0, p - penalty); livesRef.current = newLives;
        localStorage.setItem(getLivesStorageKey(), JSON.stringify({ lives: newLives, lastRefillTime: lastRefillTimeRef.current }));
        if (newLives === 0) {
          setTimeout(() => {
            if (isMountedRef.current) {
              saveGameToFirebase(false); 
              savePointsToFirebase();
              updateDashboardProgress();
              setGameState('gameover'); stopSpeaking();
            }
          }, 1500);
        }
        return newLives;
      });
    }

    setTimeout(() => {
      if (!isMountedRef.current) return;
      setShowFeedback(false); setSelectedChoice(null);
      if (livesRef.current <= 0) {
        setGameState('gameover'); stopSpeaking();
        saveGameToFirebase(false); 
        savePointsToFirebase();
        updateDashboardProgress(); return;
      }
      const isLast = currentSceneRef.current >= scenesRef.current.length - 1;
      if (isLast) { performLevelUp(); return; }
      const nextIdx = currentSceneRef.current + 1;
      currentSceneRef.current = nextIdx; setCurrentScene(nextIdx);
      setTimer(getChapterTimer(nextIdx, currentLevel));
      setTimerRunning(true);
      setDisplayText('');
      if (scenesRef.current[nextIdx]) {
        typeText(scenesRef.current[nextIdx].text);
        playSentenceAudio(currentLevel, nextIdx, scenesRef.current[nextIdx].text);
      }
    }, 1800);
  }, [selectedChoice, stopSpeaking, typeText, saveGameToFirebase, savePointsToFirebase, updateDashboardProgress, getLivesStorageKey, performLevelUp, playSentenceAudio, currentLevel]);

  const restartGame = useCallback(() => {
    stopSpeaking();
    if (textTimerRef.current) clearInterval(textTimerRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setGameState('intro'); currentSceneRef.current = 0; setCurrentScene(0);
    setCurrentLevel('A1'); setScenes([]); setCompletionBonus(0);
    setMaxLives(5); maxLivesRef.current = 5;
    setScore(0); setCorrectAnswers(0); setTotalAnswers(0);
    setSelectedChoice(null); setShowFeedback(false); setFeedbackMessage('');
    setIsTyping(false); setDisplayText('');
    setTimer(getChapterTimer(0, 'A1'));
    setTimerRunning(false);
    setShowNoLivesMessage(false);
    setLevelCompleteData(null);
    
    // 👈 FIXED: Reset refs
    correctAnswersRef.current = 0;
    totalAnswersRef.current = 0;
    scoreRef.current = 0;

    hasSavedProgressRef.current = false; completionBonusSavedRef.current = false;
    diamondSavedRef.current = false; pointsSavedRef.current = false;
    answeredWordsRef.current = [];
  }, [stopSpeaking]);

  const handleExit = useCallback(() => setShowExitConfirm(true), []);
  const confirmExit = useCallback(() => {
    stopSpeaking();
    if (textTimerRef.current) clearInterval(textTimerRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setShowExitConfirm(false);
    saveGameToFirebase(false); 
    savePointsToFirebase();
    updateDashboardProgress();
    if (onBack) onBack();
  }, [onBack, stopSpeaking, saveGameToFirebase, savePointsToFirebase, updateDashboardProgress]);
  const cancelExit = useCallback(() => setShowExitConfirm(false), []);

  useEffect(() => {
    if (timerRunning && timer > 0 && isMountedRef.current) {
      timerIntervalRef.current = setInterval(() => { if (isMountedRef.current) setTimer(p => p - 1); }, 1000);
    } else if (timer === 0 && timerRunning && isMountedRef.current) {
      setTimerRunning(false);
      if (selectedChoice === null && livesRef.current > 0) {
        const scene = scenesRef.current[currentSceneRef.current];
        if (scene && scene.choices) {
          const wrongChoices = scene.choices.filter(c => !c.correct);
          if (wrongChoices.length > 0) {
            const randomWrong = wrongChoices[Math.floor(Math.random() * wrongChoices.length)];
            setSelectedChoice(randomWrong.id);
            
            // 👈 FIXED: Update refs synchronously
            totalAnswersRef.current += 1;
            setTotalAnswers(p => p + 1);
            
            setShowFeedback(true); setFeedbackType('wrong');
            const penalty = 1;
            setFeedbackMessage(`⏰ Time's up! -${penalty} life`);
            setLives(p => {
              const nl = Math.max(0, p - penalty); livesRef.current = nl;
              localStorage.setItem(getLivesStorageKey(), JSON.stringify({ lives: nl, lastRefillTime: lastRefillTimeRef.current }));
              if (nl === 0) {
                setTimeout(() => {
                  if (isMountedRef.current) {
                    saveGameToFirebase(false); 
                    savePointsToFirebase();
                    updateDashboardProgress();
                    setGameState('gameover'); stopSpeaking();
                  }
                }, 1500);
              }
              return nl;
            });
            setTimeout(() => {
              if (!isMountedRef.current) return;
              setShowFeedback(false); setSelectedChoice(null);
              if (livesRef.current <= 0) {
                setGameState('gameover'); stopSpeaking();
                saveGameToFirebase(false); 
                savePointsToFirebase();
                updateDashboardProgress(); return;
              }
              const isLast = currentSceneRef.current >= scenesRef.current.length - 1;
              if (isLast) { performLevelUp(); return; }
              const nextIdx = currentSceneRef.current + 1;
              currentSceneRef.current = nextIdx; setCurrentScene(nextIdx);
              setTimer(getChapterTimer(nextIdx, currentLevel));
              setTimerRunning(true);
              if (scenesRef.current[nextIdx]) {
                typeText(scenesRef.current[nextIdx].text);
                playSentenceAudio(currentLevel, nextIdx, scenesRef.current[nextIdx].text);
              }
            }, 1800);
          }
        }
      }
    }
    return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, [timer, timerRunning, selectedChoice, stopSpeaking, typeText, saveGameToFirebase, savePointsToFirebase, updateDashboardProgress, getLivesStorageKey, performLevelUp, playSentenceAudio, currentLevel]);

  useEffect(() => {
    if (gameState !== 'gameover' && gameState !== 'finished') return;
    if (!diamondSavedRef.current && currentUser) {
      diamondSavedRef.current = true;
      const acc = totalAnswersRef.current > 0 
        ? Math.round((correctAnswersRef.current / totalAnswersRef.current) * 100) 
        : 0;
      claimGameDiamonds(currentUser.uid, 'shortStory', acc).then((r) => {
        if (r.earned > 0) { setDiamondsEarnedThisGame(r.earned); setLocalDiamonds(r.newBalance); }
      }).catch(() => {});
    }
    if (!pointsSavedRef.current) {
      savePointsToFirebase();
    }
  }, [gameState, currentUser, savePointsToFirebase]);

  const handleBuyHearts = useCallback(async (pkg) => {
    if (!currentUser || heartShopProcessing) return;
    if (localDiamonds < pkg.diamonds) return;
    setHeartShopProcessing(true);
    try {
      const result = await spendDiamonds(currentUser.uid, pkg.diamonds);
      if (!result.success) { setHeartShopProcessing(false); return; }
      setLocalDiamonds(result.newBalance);
      const newLives = Math.min(livesRef.current + pkg.hearts, maxLivesRef.current);
      setLives(newLives); livesRef.current = newLives;
      setLastRefillTime(Date.now()); lastRefillTimeRef.current = Date.now();
      localStorage.setItem(getLivesStorageKey(), JSON.stringify({ lives: newLives, lastRefillTime: Date.now() }));
      setShowHeartShop(false); setShowNoLivesMessage(false);
      
      if (continueFromGameOver) {
        diamondSavedRef.current = false; hasSavedProgressRef.current = false;
        pointsSavedRef.current = false;
        setDiamondsEarnedThisGame(0); setScore(0); setContinueFromGameOver(false);
        setSelectedChoice(null); setShowFeedback(false); setDisplayText('');
        
        setTimer(getChapterTimer(currentSceneRef.current, currentLevel));
        setTimerRunning(true);
        setGameState('playing');
        
        const currentSceneData = scenesRef.current[currentSceneRef.current];
        if (currentSceneData) {
          setTimeout(() => {
            if (isMountedRef.current) {
              typeText(currentSceneData.text);
              playSentenceAudio(currentLevel, currentSceneRef.current, currentSceneData.text);
            }
          }, 300);
        }
      }
    } catch (e) { /* ignore */ }
    finally { setHeartShopProcessing(false); }
  }, [currentUser, localDiamonds, heartShopProcessing, getLivesStorageKey, continueFromGameOver, currentLevel, typeText, playSentenceAudio]);

  const openHeartShopFromGameOver = useCallback(() => { setContinueFromGameOver(true); setShowHeartShop(true); }, []);
  const closeHeartShop = useCallback(() => { setShowHeartShop(false); setContinueFromGameOver(false); }, []);
  const giveUpGame = useCallback(() => { setContinueFromGameOver(false); setShowHeartShop(false); setGameState('intro'); }, []);

  const openHeartShopFromMap = useCallback(() => {
    setContinueFromGameOver(false);
    setShowHeartShop(true);
  }, []);

  // 🧪 DEV FUNCTIONS
  const devJumpToLevel = useCallback((level) => {
    if (!CEFR_LEVELS.includes(level)) return;
    stopSpeaking();
    if (textTimerRef.current) { clearInterval(textTimerRef.current); textTimerRef.current = null; }
    if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; }

    const newMaxLives = getMaxLivesForLevel(level);
    setMaxLives(newMaxLives);
    maxLivesRef.current = newMaxLives;
    setLives(newMaxLives);
    livesRef.current = newMaxLives;

    const newScenes = generateScenesForLevel(level);
    setScenes(newScenes);
    scenesRef.current = newScenes;
    setCurrentLevel(level);
    currentSceneRef.current = 0;
    setCurrentScene(0);

    setScore(0);
    setCorrectAnswers(0);
    setTotalAnswers(0);
    setSelectedChoice(null);
    setShowFeedback(false);
    setFeedbackMessage('');
    setDisplayText('');
    setIsTyping(false);
    setLevelCompleteData(null);
    
    // 👈 FIXED: Reset refs
    correctAnswersRef.current = 0;
    totalAnswersRef.current = 0;
    scoreRef.current = 0;

    hasSavedProgressRef.current = false;
    diamondSavedRef.current = false;
    pointsSavedRef.current = false;
    answeredWordsRef.current = [];

    setGameState('playing');
    setTimer(getChapterTimer(0, level));
    setTimerRunning(true);

    if (newScenes[0]) {
      setTimeout(() => {
        if (isMountedRef.current) {
          typeText(newScenes[0].text);
          playSentenceAudio(level, 0, newScenes[0].text);
        }
      }, 300);
    }
  }, [stopSpeaking, typeText, playSentenceAudio]);

  // 👈 FIXED: Simpleng devForceLevelComplete — performLevelUp na ang bahala sa completed list
  const devForceLevelComplete = useCallback(() => {
    performLevelUp();
  }, [performLevelUp]);

  const devForceGameOver = useCallback(() => {
    stopSpeaking();
    if (textTimerRef.current) { clearInterval(textTimerRef.current); textTimerRef.current = null; }
    if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; }
    setTimerRunning(false);
    setLives(0);
    livesRef.current = 0;
    setGameState('gameover');
  }, [stopSpeaking]);

  const devForceFinished = useCallback(() => {
    stopSpeaking();
    if (textTimerRef.current) { clearInterval(textTimerRef.current); textTimerRef.current = null; }
    if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; }
    setTimerRunning(false);
    if (currentUser) {
      const key = `storyquest_completed_${currentUser.uid}`;
      const stored = ['A1', 'A2', 'B1', 'B2', 'C1'];
      localStorage.setItem(key, JSON.stringify(stored));
      setCompletedLevels(stored);
    }
    if (!completionBonusSavedRef.current && currentUser) {
      completionBonusSavedRef.current = true;
      setCompletionBonus(COMPLETION_BONUS_DIAMONDS);
    }
    setCurrentLevel('C2');
    setGameState('finished');
  }, [currentUser, stopSpeaking]);

  const devSkipToLastScene = useCallback(() => {
    const lastIdx = scenesRef.current.length - 1;
    if (lastIdx < 0) return;
    stopSpeaking();
    if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; }
    currentSceneRef.current = lastIdx;
    setCurrentScene(lastIdx);
    setSelectedChoice(null);
    setShowFeedback(false);
    setDisplayText('');
    setTimer(getChapterTimer(lastIdx, currentLevel));
    setTimerRunning(true);
    const lastScene = scenesRef.current[lastIdx];
    if (lastScene) {
      setTimeout(() => {
        if (isMountedRef.current) {
          typeText(lastScene.text);
          playSentenceAudio(currentLevel, lastIdx, lastScene.text);
        }
      }, 200);
    }
  }, [currentLevel, stopSpeaking, typeText, playSentenceAudio]);

  const devSetLives = useCallback((n) => {
    const clamped = Math.max(0, Math.min(n, maxLivesRef.current));
    setLives(clamped);
    livesRef.current = clamped;
    localStorage.setItem(getLivesStorageKey(), JSON.stringify({ lives: clamped, lastRefillTime: Date.now() }));
  }, [getLivesStorageKey]);

  const devAddDiamonds = useCallback(async (n) => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const snap = await getDoc(userRef);
      const cur = snap.data()?.totalDiamonds || 0;
      const newTotal = cur + n;
      await updateDoc(userRef, { totalDiamonds: newTotal });
      setLocalDiamonds(newTotal);
    } catch (e) { console.error('Dev add diamonds error:', e); }
  }, [currentUser]);

  const devAddPoints = useCallback(async (n) => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const snap = await getDoc(userRef);
      const cur = snap.data()?.totalPoints || 0;
      const newTotal = cur + n;
      await updateDoc(userRef, { totalPoints: newTotal });
      setLocalPoints(newTotal);
    } catch (e) { console.error('Dev add points error:', e); }
  }, [currentUser]);

  const devResetAll = useCallback(() => {
    stopSpeaking();
    if (textTimerRef.current) { clearInterval(textTimerRef.current); textTimerRef.current = null; }
    if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; }
    if (currentUser) {
      localStorage.removeItem(`storyquest_completed_${currentUser.uid}`);
      localStorage.removeItem(`storyquest_lives_${currentUser.uid}`);
      CEFR_LEVELS.forEach(lvl => {
        localStorage.removeItem(getDailyRewardKey(currentUser.uid, lvl));
      });
    }
    setCompletedLevels([]);
    setGameState('intro');
    setCurrentLevel('A1');
    setScenes([]);
    scenesRef.current = [];
    setScore(0);
    setCorrectAnswers(0);
    setTotalAnswers(0);
    setSelectedChoice(null);
    setShowFeedback(false);
    setDisplayText('');
    setIsTyping(false);
    setTimerRunning(false);
    setMaxLives(5);
    maxLivesRef.current = 5;
    setLives(5);
    livesRef.current = 5;
    setCompletionBonus(0);
    setLevelCompleteData(null);
    
    // 👈 FIXED: Reset refs
    correctAnswersRef.current = 0;
    totalAnswersRef.current = 0;
    scoreRef.current = 0;

    hasSavedProgressRef.current = false;
    completionBonusSavedRef.current = false;
    diamondSavedRef.current = false;
    pointsSavedRef.current = false;
    answeredWordsRef.current = [];
  }, [currentUser, stopSpeaking]);

  const devReturnToMap = useCallback(() => {
    stopSpeaking();
    if (textTimerRef.current) { clearInterval(textTimerRef.current); textTimerRef.current = null; }
    if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; }
    setTimerRunning(false);
    setLevelCompleteData(null);
    setGameState('intro');
  }, [stopSpeaking]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (textTimerRef.current) clearInterval(textTimerRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (livesIntervalRef.current) clearInterval(livesIntervalRef.current);
      if (speechSynthRef.current) speechSynthRef.current.cancel();
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    };
  }, []);

  return {
    gameState, currentScene, currentLevel, scenes, completionBonus, completedLevels,
    score, lives, maxLives, selectedChoice, showFeedback, feedbackMessage, feedbackType,
    showExitConfirm, isSpeaking, displayText, isTyping,
    correctAnswers, totalAnswers, timer, timeRemaining, showNoLivesMessage,
    currentUser, 
    localPoints, 
    localDiamonds, 
    showHeartShop, diamondsEarnedThisGame, heartShopProcessing, continueFromGameOver,
    levelCompleteData,
    startGame, handleChoice, restartGame, handleExit, confirmExit, cancelExit,
    stopSpeaking, currentSceneRef, scenesRef, playSentenceAudio,
    continueToNextLevel, handleBuyHearts, openHeartShopFromGameOver, openHeartShopFromMap, closeHeartShop, giveUpGame,
    handleNextLevel,
    handleReturnToMap,
    HEART_PRICES,
    // 🧪 DEV FUNCTIONS
    devJumpToLevel,
    devForceLevelComplete,
    devForceGameOver,
    devForceFinished,
    devSkipToLastScene,
    devSetLives,
    devAddDiamonds,
    devAddPoints,
    devResetAll,
    devReturnToMap,
  };
};