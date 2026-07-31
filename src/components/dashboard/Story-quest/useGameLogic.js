// src/components/dashboard/story-quest/useGameLogic.js

import { useState, useEffect, useRef, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../pages/firebase';
import { updateUserStats } from '../../../services/firebaseService';
import allScenes from './storyScenes';

const REFILL_TIME = 1800;

export const useGameLogic = ({ onBack, updateProgress }) => {
  // ===== GAME STATE =====
  const [gameState, setGameState] = useState('intro');
  const [currentScene, setCurrentScene] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [maxLives] = useState(5);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [show3DScene, setShow3DScene] = useState(false);

  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAnswers, setTotalAnswers] = useState(0);
  const [sessionSaved, setSessionSaved] = useState(false);
  const [timer, setTimer] = useState(15);
  const [timerRunning, setTimerRunning] = useState(false);
  
  const [lastRefillTime, setLastRefillTime] = useState(Date.now());
  const [timeRemaining, setTimeRemaining] = useState('');
  const [showNoLivesMessage, setShowNoLivesMessage] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);
  const [isUserLoaded, setIsUserLoaded] = useState(true);
  const [isReady, setIsReady] = useState(true);

  // ===== REFS =====
  const textTimerRef = useRef(null);
  const speechSynthRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const livesIntervalRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const isMountedRef = useRef(true);
  const currentSceneRef = useRef(0);
  const typeIndexRef = useRef(0);
  const fullTextRef = useRef('');
  const livesRef = useRef(5);
  const lastRefillTimeRef = useRef(Date.now());

  // ============================================================
  // ===== LIVES STORAGE KEY =====
  // ============================================================
  const getLivesStorageKey = useCallback(() => {
    if (currentUser) {
      return `storyquest_lives_${currentUser.uid}`;
    }
    return 'storyquest_lives_guest';
  }, [currentUser]);

  // ============================================================
  // ===== CHECK AND REFILL LIVES =====
  // ============================================================
  const checkAndRefillLives = useCallback(() => {
    if (!isMountedRef.current) return;
    
    const key = getLivesStorageKey();
    const now = Date.now();
    const saved = localStorage.getItem(key);
    
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const secondsPassed = (now - data.lastRefillTime) / 1000;
        
        if (secondsPassed >= REFILL_TIME && data.lives < maxLives) {
          const newLives = Math.min(data.lives + 1, maxLives);
          setLives(newLives);
          livesRef.current = newLives;
          setLastRefillTime(now);
          lastRefillTimeRef.current = now;
          localStorage.setItem(key, JSON.stringify({
            lives: newLives,
            lastRefillTime: now
          }));
          console.log(`🔄 Refilled 1 life! Now: ${newLives}/${maxLives}`);
        } else {
          setLives(data.lives);
          livesRef.current = data.lives;
          setLastRefillTime(data.lastRefillTime);
          lastRefillTimeRef.current = data.lastRefillTime;
        }
      } catch (e) {
        console.error('Error loading lives:', e);
        setLives(maxLives);
        livesRef.current = maxLives;
        setLastRefillTime(Date.now());
        lastRefillTimeRef.current = Date.now();
        localStorage.setItem(key, JSON.stringify({
          lives: maxLives,
          lastRefillTime: Date.now()
        }));
      }
    } else {
      setLives(maxLives);
      livesRef.current = maxLives;
      setLastRefillTime(Date.now());
      lastRefillTimeRef.current = Date.now();
      localStorage.setItem(key, JSON.stringify({
        lives: maxLives,
        lastRefillTime: Date.now()
      }));
      console.log('🎉 New user! Starting with 5 lives!');
    }
  }, [maxLives, getLivesStorageKey]);

  // ============================================================
  // ===== UPDATE TIME REMAINING =====
  // ============================================================
  const updateTimeRemaining = useCallback(() => {
    if (!isMountedRef.current) return;
    
    if (livesRef.current >= maxLives) {
      setTimeRemaining('');
      return;
    }
    
    const now = Date.now();
    const elapsed = (now - lastRefillTimeRef.current) / 1000;
    
    if (elapsed < REFILL_TIME) {
      const remaining = REFILL_TIME - elapsed;
      const minutes = Math.floor(remaining / 60);
      const seconds = Math.floor(remaining % 60);
      const secondsStr = seconds.toString().padStart(2, '0');
      setTimeRemaining(`${minutes}m ${secondsStr}s`);
    } else {
      checkAndRefillLives();
      setTimeRemaining('');
    }
  }, [maxLives, checkAndRefillLives]);

  // ============================================================
  // ===== SAVE LIVES TO LOCALSTORAGE =====
  // ============================================================
  useEffect(() => {
    if (currentUser && gameState !== 'intro') {
      const key = getLivesStorageKey();
      localStorage.setItem(key, JSON.stringify({
        lives: lives,
        lastRefillTime: lastRefillTime
      }));
    }
  }, [lives, lastRefillTime, gameState, currentUser, getLivesStorageKey]);

  // ============================================================
  // ===== LIVES INTERVAL =====
  // ============================================================
  useEffect(() => {
    if (currentUser) {
      isMountedRef.current = true;
      
      setTimeout(() => {
        checkAndRefillLives();
        updateTimeRemaining();
      }, 100);
      
      if (livesIntervalRef.current) {
        clearInterval(livesIntervalRef.current);
        livesIntervalRef.current = null;
      }
      
      livesIntervalRef.current = setInterval(() => {
        if (isMountedRef.current) {
          checkAndRefillLives();
          updateTimeRemaining();
        }
      }, 1000);
      
      return () => {
        isMountedRef.current = false;
        if (livesIntervalRef.current) {
          clearInterval(livesIntervalRef.current);
          livesIntervalRef.current = null;
        }
      };
    }
  }, [currentUser, checkAndRefillLives, updateTimeRemaining]);

  // ============================================================
  // ===== FIREBASE AUTH =====
  // ============================================================
  useEffect(() => {
    isMountedRef.current = true;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (isMountedRef.current) {
        setCurrentUser(user);
      }
    });
    return () => {
      isMountedRef.current = false;
      unsubscribe();
    };
  }, []);

  // ============================================================
  // ===== SAVE TO FIREBASE - 1 POINT ONLY =====
  // ============================================================
  const saveGameToFirebase = useCallback(async (isComplete) => {
    if (!currentUser || !isMountedRef.current) {
      console.log('⚠️ No user logged in, skipping Firebase save');
      return;
    }

    const userId = currentUser.uid;
    const totalScenes = allScenes.length;
    const scenesCompleted = currentSceneRef.current + 1;
    
    // ✅ 1 point per correct answer - NO MULTIPLIER
    const pointsEarned = correctAnswers;

    const gameData = {
      gameType: 'shortStory',
      pointsEarned: pointsEarned, // ✅ 1 point per correct
      newWordsLearned: correctAnswers, // ✅ 1 per correct
      correctAnswers: correctAnswers,
      totalQuestions: totalAnswers,
      won: isComplete || scenesCompleted >= totalScenes / 2,
      score: pointsEarned, // ✅ 1 point per correct
      isComplete: isComplete,
      scenesCompleted: scenesCompleted,
      totalScenes: totalScenes,
      displayName: currentUser.displayName || currentUser.email || 'Player'
    };

    try {
      console.log('💾 Saving ShortStory game to Firebase...');
      console.log('📊 Points:', pointsEarned, 'Correct:', correctAnswers);
      const result = await updateUserStats(userId, gameData);
      
      if (result.achievements && result.achievements.length > 0) {
        console.log('🏆 New Achievements:', result.achievements);
        if (isMountedRef.current) {
          setFeedbackMessage(`🏆 New Achievements: ${result.achievements.join(', ')} 🎉`);
          setShowFeedback(true);
          setTimeout(() => {
            if (isMountedRef.current) {
              setShowFeedback(false);
            }
          }, 5000);
        }
      }
      
      console.log('✅ ShortStory game saved to Firebase successfully!');
    } catch (error) {
      console.error('❌ Error saving to Firebase:', error);
    }
  }, [currentUser, correctAnswers, totalAnswers]);

  // ===== SPEECH =====
  useEffect(() => {
    if (window.speechSynthesis) speechSynthRef.current = window.speechSynthesis;
    return () => {
      if (speechSynthRef.current) speechSynthRef.current.cancel();
    };
  }, []);

  const speakText = useCallback((text) => {
    if (!isVoiceEnabled || !window.speechSynthesis || !isMountedRef.current) return;
    if (speechSynthRef.current) speechSynthRef.current.cancel();
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    setTimeout(() => {
      if (!window.speechSynthesis || !isMountedRef.current) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;
      utterance.lang = 'en-US';
      utterance.onstart = () => { if (isMountedRef.current) { setIsSpeaking(true); isSpeakingRef.current = true; } };
      utterance.onend = () => { if (isMountedRef.current) { setIsSpeaking(false); isSpeakingRef.current = false; } };
      utterance.onerror = () => { if (isMountedRef.current) { setIsSpeaking(false); isSpeakingRef.current = false; } };
      speechSynthRef.current.speak(utterance);
    }, 50);
  }, [isVoiceEnabled]);

  const stopSpeaking = useCallback(() => {
    if (speechSynthRef.current) {
      speechSynthRef.current.cancel();
      if (isMountedRef.current) { setIsSpeaking(false); isSpeakingRef.current = false; }
    }
  }, []);

  // ===== TYPEWRITER =====
  const typeText = useCallback((text, callback) => {
    if (!isMountedRef.current) return;
    
    if (textTimerRef.current) {
      clearInterval(textTimerRef.current);
      textTimerRef.current = null;
    }
    
    stopSpeaking();
    setIsTyping(true);
    setDisplayText('');
    typeIndexRef.current = 0;
    fullTextRef.current = text;
    
    if (isVoiceEnabled && text) {
      speakText(text);
    }
    
    const totalLength = text.length;
    
    textTimerRef.current = setInterval(() => {
      if (!isMountedRef.current) {
        clearInterval(textTimerRef.current);
        textTimerRef.current = null;
        return;
      }
      
      if (typeIndexRef.current < totalLength) {
        const char = fullTextRef.current[typeIndexRef.current];
        setDisplayText(prev => prev + char);
        typeIndexRef.current++;
      } else {
        clearInterval(textTimerRef.current);
        textTimerRef.current = null;
        setIsTyping(false);
        setDisplayText(fullTextRef.current);
        if (callback) callback();
      }
    }, 30);
  }, [isVoiceEnabled, speakText, stopSpeaking]);

  // ===== START GAME =====
  const startGame = useCallback(() => {
    if (lives <= 0) {
      setShowNoLivesMessage(true);
      setFeedbackMessage(`😢 No lives left! Next heart in ${timeRemaining || '30 minutes'}`);
      setShowFeedback(true);
      setTimeout(() => {
        if (isMountedRef.current) { setShowFeedback(false); setGameState('intro'); }
      }, 3000);
      return;
    }

    setGameState('loading');
    setShow3DScene(false);
    currentSceneRef.current = 0;

    setTimeout(() => {
      if (!isMountedRef.current) return;
      setGameState('playing');
      setCurrentScene(0);
      setScore(0);
      setCorrectAnswers(0);
      setTotalAnswers(0);
      setTimer(15);
      setTimerRunning(true);
      setSelectedChoice(null);
      setSessionSaved(false);
      setDisplayText('');
      setIsTyping(false);
      
      setTimeout(() => {
        if (isMountedRef.current) setShow3DScene(true);
      }, 500);
      
      const scene = allScenes[0];
      if (scene) typeText(scene.text);
    }, 800);
  }, [lives, timeRemaining, typeText]);

  // ============================================================
  // ===== HANDLE CHOICE - 1 POINT ONLY, NO REAL-TIME SAVE =====
  // ============================================================
  const handleChoice = useCallback((choice) => {
    if (selectedChoice !== null || lives <= 0 || !isMountedRef.current) return;
    stopSpeaking();
    setTimerRunning(false);
    setSelectedChoice(choice.id);
    setTotalAnswers(prev => prev + 1);
    setShowFeedback(true);

    if (choice.correct) {
      setFeedbackType('correct');
      setFeedbackMessage('✅ Excellent! +1 point');
      setScore(prev => prev + 1); // ✅ 1 point lang
      setCorrectAnswers(prev => prev + 1); // ✅ 1 correct
      
      // ✅ WALANG REAL-TIME SAVE DITO - iwas double counting
      
    } else {
      setFeedbackType('wrong');
      setFeedbackMessage('❌ Incorrect. -1 life');
      
      setLives(prev => {
        const newLives = prev - 1;
        livesRef.current = newLives;
        
        const key = getLivesStorageKey();
        localStorage.setItem(key, JSON.stringify({
          lives: newLives,
          lastRefillTime: lastRefillTimeRef.current
        }));
        
        if (newLives === 0) {
          setTimeout(() => {
            if (isMountedRef.current) {
              saveGameToFirebase(false);
              setGameState('gameover');
              stopSpeaking();
            }
          }, 1500);
        }
        return newLives;
      });
    }

    setTimeout(() => {
      if (!isMountedRef.current) return;
      setShowFeedback(false);
      setSelectedChoice(null);
      if (lives <= 0) { 
        setGameState('gameover'); 
        stopSpeaking(); 
        saveGameToFirebase(false);
        return; 
      }
      if (choice.nextScene !== undefined) {
        const nextIdx = allScenes.findIndex(s => s.id === choice.nextScene);
        if (nextIdx !== -1) {
          currentSceneRef.current = nextIdx;
          setCurrentScene(nextIdx);
          setTimer(15);
          setTimerRunning(true);
          setDisplayText('');
          typeText(allScenes[nextIdx].text);
          
          if (allScenes[nextIdx].id === 20) {
            setTimeout(() => {
              if (isMountedRef.current) {
                saveGameToFirebase(true);
              }
            }, 1000);
          }
        }
      }
    }, 1500);
  }, [selectedChoice, lives, stopSpeaking, typeText, saveGameToFirebase, getLivesStorageKey]);

  // ===== RESTART =====
  const restartGame = useCallback(() => {
    stopSpeaking();
    if (textTimerRef.current) clearInterval(textTimerRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setGameState('intro');
    setShow3DScene(false);
    currentSceneRef.current = 0;
    setCurrentScene(0);
    setScore(0);
    setCorrectAnswers(0);
    setTotalAnswers(0);
    setSelectedChoice(null);
    setShowFeedback(false);
    setFeedbackMessage('');
    setIsTyping(false);
    setDisplayText('');
    setTimer(15);
    setTimerRunning(false);
    setShowNoLivesMessage(false);
    setSessionSaved(false);
  }, [stopSpeaking]);

  // ===== EXIT =====
  const handleExit = useCallback(() => {
    setShowExitConfirm(true);
  }, []);

  const confirmExit = useCallback(() => {
    stopSpeaking();
    if (textTimerRef.current) clearInterval(textTimerRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setShowExitConfirm(false);
    setShow3DScene(false);
    saveGameToFirebase(false);
    if (onBack) onBack();
  }, [onBack, stopSpeaking, saveGameToFirebase]);

  const cancelExit = useCallback(() => setShowExitConfirm(false), []);

  // ===== TIMER =====
  useEffect(() => {
    if (timerRunning && timer > 0 && isMountedRef.current) {
      timerIntervalRef.current = setInterval(() => {
        if (isMountedRef.current) setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0 && timerRunning && isMountedRef.current) {
      setTimerRunning(false);
      if (selectedChoice === null && lives > 0) {
        const scene = allScenes[currentSceneRef.current];
        if (scene && scene.choices) {
          const wrongChoices = scene.choices.filter(c => !c.correct);
          if (wrongChoices.length > 0) {
            const randomWrong = wrongChoices[Math.floor(Math.random() * wrongChoices.length)];
            setSelectedChoice(randomWrong.id);
            setTotalAnswers(prev => prev + 1);
            setShowFeedback(true);
            setFeedbackType('wrong');
            setFeedbackMessage('⏰ Time\'s up! -1 life');
            
            setLives(prev => {
              const newLives = prev - 1;
              livesRef.current = newLives;
              
              const key = getLivesStorageKey();
              localStorage.setItem(key, JSON.stringify({
                lives: newLives,
                lastRefillTime: lastRefillTimeRef.current
              }));
              
              if (newLives === 0) {
                setTimeout(() => {
                  if (isMountedRef.current) {
                    saveGameToFirebase(false);
                    setGameState('gameover');
                    stopSpeaking();
                  }
                }, 1500);
              }
              return newLives;
            });
            
            setTimeout(() => {
              if (!isMountedRef.current) return;
              setShowFeedback(false);
              setSelectedChoice(null);
              if (lives <= 0) { 
                setGameState('gameover'); 
                stopSpeaking(); 
                saveGameToFirebase(false);
                return; 
              }
              const nextIdx = allScenes.findIndex(s => s.id === randomWrong.nextScene);
              if (nextIdx !== -1) {
                currentSceneRef.current = nextIdx;
                setCurrentScene(nextIdx);
                setTimer(15);
                setTimerRunning(true);
                typeText(allScenes[nextIdx].text);
              }
            }, 1500);
          }
        }
      }
    }
    return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, [timer, timerRunning, selectedChoice, lives, stopSpeaking, typeText, saveGameToFirebase, getLivesStorageKey]);

  // ============================================================
  // ===== CLEANUP =====
  // ============================================================
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (textTimerRef.current) clearInterval(textTimerRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (livesIntervalRef.current) clearInterval(livesIntervalRef.current);
      if (speechSynthRef.current) speechSynthRef.current.cancel();
    };
  }, []);

  return {
    gameState, setGameState,
    currentScene,
    score,
    lives,
    maxLives,
    selectedChoice,
    showFeedback,
    feedbackMessage,
    feedbackType,
    showExitConfirm,
    isSpeaking,
    isVoiceEnabled, setIsVoiceEnabled,
    displayText,
    isTyping,
    show3DScene,
    correctAnswers,
    totalAnswers,
    timer,
    timeRemaining,
    showNoLivesMessage,
    currentUser,
    isUserLoaded,
    isReady,
    startGame,
    handleChoice,
    restartGame,
    handleExit,
    confirmExit,
    cancelExit,
    stopSpeaking,
    typeText,
    currentSceneRef,
    allScenes,
    saveGameToFirebase,
    checkAndRefillLives,
    updateTimeRemaining
  };
};