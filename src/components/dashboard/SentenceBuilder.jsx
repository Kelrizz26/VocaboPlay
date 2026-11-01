// src/components/dashboard/SentenceBuilder.jsx

import React, { useState, useEffect } from 'react';
import useSound from '../../hooks/useSound';
import { auth } from '../../pages/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../pages/firebase'; 

import { sentenceBuilderCourses } from '../../data/sentenceBuilderData';

const SentenceBuilder = ({ onBack, onExitToGames, updateProgress, recordGame }) => {
  const [gameState, setGameState] = useState('topic_selection'); 
  
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [score, setScore] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0); 

  const getInitialUnlockedLevels = () => {
    const defaultLevels = {};
    sentenceBuilderCourses.forEach(course => {
      defaultLevels[course.id] = ['A1'];
    });
    return defaultLevels;
  };

  // ==========================================
  // ❤️ HEART / LIVES REFILL LOGIC
  // ==========================================
  const MAX_LIVES = 5;
  const REFILL_TIME_MS = 30 * 60 * 1000;

  const [lives, setLives] = useState(MAX_LIVES);
  const [nextRefillTime, setNextRefillTime] = useState(null);
  const [timeLeftStr, setTimeLeftStr] = useState('');

  const [diamonds, setDiamonds] = useState(150);
  const [unlockedLevels, setUnlockedLevels] = useState(getInitialUnlockedLevels());
  const [levelProgress, setLevelProgress] = useState({});

  const [currentUser, setCurrentUser] = useState(null);
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  // ✅ FUNCTION PARA MAG-SAVE SA FIREBASE
  const syncToFirebase = async (updates) => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, { sentenceBuilderData: updates });
    } catch (error) {
      console.error("Error syncing to Firebase:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setTotalPoints(userData.totalPoints || 0);
            if (userData.totalDiamonds !== undefined) {
               setDiamonds(userData.totalDiamonds);
            }

            const sbData = userData.sentenceBuilderData || {};
            
            setLives(sbData.lives !== undefined ? sbData.lives : MAX_LIVES);
            setNextRefillTime(sbData.nextRefillTime || null);
            setUnlockedLevels(sbData.unlockedLevels ? { ...getInitialUnlockedLevels(), ...sbData.unlockedLevels } : getInitialUnlockedLevels());
            setLevelProgress(sbData.levelProgress || {});

            localStorage.setItem(`sb_lives_${user.uid}`, (sbData.lives !== undefined ? sbData.lives : MAX_LIVES).toString());
            if (sbData.nextRefillTime) localStorage.setItem(`sb_next_refill_${user.uid}`, sbData.nextRefillTime.toString());
            if (sbData.unlockedLevels) localStorage.setItem(`sb_unlocked_${user.uid}`, JSON.stringify(sbData.unlockedLevels));
            if (sbData.levelProgress) localStorage.setItem(`sb_progress_${user.uid}`, JSON.stringify(sbData.levelProgress));
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
        setIsUserLoaded(true);
      } else {
        setCurrentUser(null);
        setLives(MAX_LIVES);
        setNextRefillTime(null);
        setDiamonds(150);
        setUnlockedLevels(getInitialUnlockedLevels());
        setLevelProgress({});
        setIsUserLoaded(true);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser && isUserLoaded) {
      localStorage.setItem(`sb_lives_${currentUser.uid}`, lives.toString());
      if (nextRefillTime) localStorage.setItem(`sb_next_refill_${currentUser.uid}`, nextRefillTime.toString());
      else localStorage.removeItem(`sb_next_refill_${currentUser.uid}`);
      localStorage.setItem(`sb_unlocked_${currentUser.uid}`, JSON.stringify(unlockedLevels));
      localStorage.setItem(`sb_progress_${currentUser.uid}`, JSON.stringify(levelProgress));
    }
  }, [lives, nextRefillTime, unlockedLevels, levelProgress, currentUser, isUserLoaded]);

  useEffect(() => {
    if (!isUserLoaded) return;

    const now = Date.now();
    if (lives < MAX_LIVES && nextRefillTime) {
      if (now >= nextRefillTime) {
        const timePassed = now - nextRefillTime;
        const heartsToAdd = Math.floor(timePassed / REFILL_TIME_MS) + 1;
        const newLives = Math.min(MAX_LIVES, lives + heartsToAdd);
        
        setLives(newLives);
        
        let newRefill = null;
        if (newLives < MAX_LIVES) {
          const remainder = timePassed % REFILL_TIME_MS;
          newRefill = now + REFILL_TIME_MS - remainder;
          setNextRefillTime(newRefill);
        } else {
          setNextRefillTime(null);
        }
        syncToFirebase({ lives: newLives, nextRefillTime: newRefill });
      }
    } else if (lives < MAX_LIVES && !nextRefillTime) {
      const newRefill = now + REFILL_TIME_MS;
      setNextRefillTime(newRefill);
      syncToFirebase({ lives, nextRefillTime: newRefill });
    }
  }, [isUserLoaded, lives, nextRefillTime]);

  useEffect(() => {
    if (lives >= MAX_LIVES || !nextRefillTime) {
      setTimeLeftStr('');
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = nextRefillTime - now;

      if (diff <= 0) {
        setLives(prev => {
          const newLives = Math.min(prev + 1, MAX_LIVES);
          let newRefill = newLives < MAX_LIVES ? Date.now() + REFILL_TIME_MS : null;
          setNextRefillTime(newRefill);
          syncToFirebase({ lives: newLives, nextRefillTime: newRefill });
          return newLives;
        });
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeftStr(`${mins}:${secs.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextRefillTime, lives]);

  const [wordBank, setWordBank] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null); 
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const { playCorrect, playWrong, playVictory } = useSound();

  const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
  
  const activeQuestions = selectedTopic && selectedLevel ? selectedTopic.levels[selectedLevel] : [];
  const currentQuestion = activeQuestions.length > 0 ? activeQuestions[currentIndex] : null;
  const progress = activeQuestions.length > 0 ? ((currentIndex + 1) / activeQuestions.length) * 100 : 0;

  const normalizeString = (str) => {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  const initQuestion = (question) => {
    if (!question) return;
    const shuffled = [...question.scrambledWords].sort(() => Math.random() - 0.5);
    setWordBank(shuffled);
    setSelectedWords([]);
    setAnswered(false);
    setIsCorrect(null);
  };

  const handleSelectTopic = (topic) => {
    if (!unlockedLevels[topic.id]) {
      const newUnlocked = { ...unlockedLevels, [topic.id]: ['A1'] };
      setUnlockedLevels(newUnlocked);
      syncToFirebase({ unlockedLevels: newUnlocked });
    }
    setSelectedTopic(topic);
    setGameState('level_selection');
  };

  const handleSelectLevel = (levelKey) => {
    const levelsForTopic = unlockedLevels[selectedTopic.id] || ['A1'];
    if (!levelsForTopic.includes(levelKey)) return; 
    
    if (lives <= 0) {
      alert("You are out of hearts! Please wait for a refill or buy more.");
      return;
    }

    const savedIndex = levelProgress[selectedTopic.id]?.[levelKey] || 0;
    const questionsInLevel = selectedTopic.levels[levelKey];
    const startIndex = savedIndex >= questionsInLevel.length ? 0 : savedIndex;

    setSelectedLevel(levelKey);
    setCurrentIndex(startIndex); 
    setScore(0); 
    setGameState('playing');
    initQuestion(selectedTopic.levels[levelKey][startIndex]);
  };

  const handleSelectWord = (word, index) => {
    if (answered) return;
    setWordBank(prev => prev.filter((_, i) => i !== index));
    setSelectedWords(prev => [...prev, word]);
  };

  const handleRemoveWord = (word, index) => {
    if (answered) return;
    setSelectedWords(prev => prev.filter((_, i) => i !== index));
    setWordBank(prev => [...prev, word]);
  };

  const handleCheckAnswer = () => {
    if (selectedWords.length === 0 || answered) return;
    
    setAnswered(true);
    const studentAnswer = selectedWords.join(' ');
    const isAnswerCorrect = normalizeString(studentAnswer) === normalizeString(currentQuestion.correctAnswer);

    if (isAnswerCorrect) {
      setIsCorrect(true);
      playCorrect();
      setScore(prev => prev + 1);
      setTotalPoints(prev => prev + 1); 
      setFeedbackMessage('✅ Great job! The sentence is correct.');
    } else {
      setIsCorrect(false);
      playWrong();
      
      setLives(prev => {
        const newLives = prev - 1;
        let newRefill = nextRefillTime;
        if (prev === MAX_LIVES && newLives < MAX_LIVES && !nextRefillTime) {
          newRefill = Date.now() + REFILL_TIME_MS;
          setNextRefillTime(newRefill);
        }
        syncToFirebase({ lives: newLives, nextRefillTime: newRefill });
        return newLives;
      });

      setFeedbackMessage(`❌ Not quite right. Try again!`);
      
      if (lives - 1 <= 0) {
        setTimeout(() => setGameState('gameover'), 2500);
      }
    }
  };

  const handleTryAgain = () => {
    initQuestion(currentQuestion);
  };

  const handleExitGame = () => {
    if (score > 0 && currentUser && recordGame) {
      recordGame(
        'sentence-builder', 
        score, 
        score, 
        currentIndex + 1, 
        [] 
      );
    }
    if (onExitToGames) {
      onExitToGames();
    } else if (onBack) {
      onBack();
    }
  };

  const handleNext = () => {
    if (lives <= 0) {
      setGameState('gameover');
      return;
    }

    if (currentIndex < activeQuestions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      
      const updatedProgress = {
        ...levelProgress,
        [selectedTopic.id]: {
          ...(levelProgress[selectedTopic.id] || {}),
          [selectedLevel]: nextIdx
        }
      };
      
      setLevelProgress(updatedProgress);
      syncToFirebase({ levelProgress: updatedProgress });

      initQuestion(activeQuestions[nextIdx]);
    } else {
      playVictory();
      const currentLevelIdx = CEFR_LEVELS.indexOf(selectedLevel);
      let updatedUnlocked = { ...unlockedLevels };

      if (currentLevelIdx < CEFR_LEVELS.length - 1) {
        const nextLevel = CEFR_LEVELS[currentLevelIdx + 1];
        const levelsForTopic = updatedUnlocked[selectedTopic.id] || ['A1'];
        if (!levelsForTopic.includes(nextLevel)) {
          updatedUnlocked = {
            ...updatedUnlocked,
            [selectedTopic.id]: [...levelsForTopic, nextLevel]
          };
          setUnlockedLevels(updatedUnlocked);
        }
      }

      const updatedProgress = { ...levelProgress };
      if (!updatedProgress[selectedTopic.id]) updatedProgress[selectedTopic.id] = {};
      updatedProgress[selectedTopic.id][selectedLevel] = activeQuestions.length;
      
      setLevelProgress(updatedProgress);

      syncToFirebase({ 
        unlockedLevels: updatedUnlocked, 
        levelProgress: updatedProgress 
      });

      if (currentUser && recordGame) {
        recordGame(
          'sentence-builder', 
          score, 
          score, 
          activeQuestions.length, 
          [] 
        );
      }
      setGameState('finished');
    }
  };

  const handleBuyHeart = async () => {
    if (lives >= MAX_LIVES) {
      alert("You already have max hearts!");
      return;
    }
    if (!currentUser) return;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const currentDiamondsFB = userSnap.data().totalDiamonds || 0;
        
        if (currentDiamondsFB >= 50) {
          const newDiamonds = currentDiamondsFB - 50;
          await updateDoc(userRef, { totalDiamonds: newDiamonds });
          
          setDiamonds(newDiamonds);
          
          setLives(prev => {
            const newLives = prev + 1;
            let newRefill = newLives >= MAX_LIVES ? null : nextRefillTime;
            if (newLives >= MAX_LIVES) setNextRefillTime(null);
            syncToFirebase({ lives: newLives, nextRefillTime: newRefill });
            return newLives;
          });
        } else {
          alert("Not enough diamonds in your account! You need 50 💎.");
        }
      }
    } catch (error) {
      console.error("Error buying heart:", error);
    }
  };

  const handleGameOverBuyHearts = async () => {
    if (!currentUser) return;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const currentDiamondsFB = userSnap.data().totalDiamonds || 0;
        
        if (currentDiamondsFB >= 50) {
          const newDiamonds = currentDiamondsFB - 50;
          await updateDoc(userRef, { totalDiamonds: newDiamonds });
          
          setDiamonds(newDiamonds);
          
          setLives(MAX_LIVES);
          setNextRefillTime(null);
          syncToFirebase({ lives: MAX_LIVES, nextRefillTime: null });
          
          setGameState('playing');
          initQuestion(activeQuestions[currentIndex]);
        } else {
          alert("Not enough diamonds! You need 50 💎.");
        }
      }
    } catch (error) {
      console.error("Error buying hearts:", error);
    }
  };

  if (!isUserLoaded) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#333', background: '#fdfbf7', minHeight: '100vh' }}>Loading...</div>;
  }

  const CozyThemeWrapper = ({ children }) => (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', 
      height: '100dvh', minHeight: '100dvh', overflowY: 'auto', overflowX: 'hidden',
      backgroundImage: `linear-gradient(135deg, rgba(42, 40, 69, 0.4), rgba(58, 55, 87, 0.3)), url('/image/sentence-bg.png')`, 
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      fontFamily: "'Fredoka', 'Poppins', sans-serif",
      color: '#4a3b32',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxSizing: 'border-box'
    }}>
      {/* 👇 DITO ANG MGA SOBRANG AGGRESSIVE NA MOBILE FIXES 👇 */}
      <style>{`
        .sb-container {
          max-width: 1200px;
          width: 100%;
          z-index: 1;
          padding: 24px;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }

        /* --- MOBILE RESPONSIVENESS (Max-width 768px) --- */
        @media (max-width: 768px) {
          .sb-container { padding: 6px !important; }

          /* Header HUD - Sobrang liit na */
          .sb-header-hud {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 4px !important;
            margin-bottom: 8px !important;
          }
          .sb-title-box {
            padding: 4px 8px !important;
            border-radius: 8px !important;
            border-width: 1.5px !important;
            box-shadow: 0 1.5px 0 #8c5728 !important;
            gap: 4px !important;
            width: 100%;
          }
          .sb-title-box span { font-size: 16px !important; }
          .sb-title-box h1 { font-size: 12px !important; margin: 0 !important; }
          .sb-title-box p { font-size: 7px !important; }
          
          .sb-stats-row {
            width: 100% !important;
            justify-content: space-between !important;
            gap: 4px !important;
          }
          .sb-stat-badge {
            padding: 2px 6px !important;
            border-radius: 6px !important;
            border-width: 1.5px !important;
            box-shadow: 0 1px 0 rgba(0,0,0,0.2) !important;
            gap: 2px !important;
          }
          .sb-stat-badge .stat-icon { font-size: 10px !important; }
          .sb-stat-badge span { font-size: 10px !important; }
          .sb-stat-badge button { width: 14px !important; height: 14px !important; font-size: 8px !important; }

          /* Banners - Pinaliit din */
          .sb-banner-box {
            padding: 2px 10px !important;
            border-width: 1.5px !important;
            box-shadow: 0 2px 0 #3a1f0a !important;
            border-radius: 8px !important;
            margin-top: 2px !important;
          }
          .sb-banner-box h2 { font-size: 12px !important; margin: 0 !important; }
          .sb-subtext-box {
            padding: 2px 8px !important;
            border-width: 1.5px !important;
            box-shadow: 0 1.5px 0 #8c5728 !important;
            border-radius: 6px !important;
            margin-top: 4px !important;
          }
          .sb-subtext-box p { font-size: 8px !important; text-align: center; margin: 0 !important; }

          /* Topic Cards - Sobrang liit na parang match game */
          .sb-topic-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 6px !important;
            margin-bottom: 12px !important;
          }
          .sb-topic-card {
            border-width: 1.5px !important;
            border-radius: 8px !important;
            box-shadow: 0 2px 0 var(--border-color) !important;
          }
          .sb-topic-card .card-image { height: 60px !important; border-bottom-width: 1.5px !important; }
          .sb-topic-card .card-content { padding: 6px !important; }
          .sb-topic-card .card-title { font-size: 11px !important; margin-bottom: 1px !important; }
          .sb-topic-card .card-desc { display: none !important; /* Tinatago natin muna para sobrang liit */ }
          .sb-topic-card .card-progress-text { font-size: 7px !important; margin-bottom: 1px !important; }
          .sb-topic-card .card-progress-bar { height: 3px !important; margin-bottom: 4px !important; }
          .sb-topic-card .card-badge { font-size: 6px !important; padding: 1px 3px !important; border-width: 1px !important; border-radius: 3px !important; }
          .sb-topic-card .card-arrow { width: 18px !important; height: 18px !important; border-width: 1.5px !important; }
          .sb-topic-card .card-arrow svg { width: 8px !important; height: 8px !important; }

          /* Level Selection */
          .sb-level-header {
            padding: 6px 8px !important;
            border-width: 1.5px !important;
            box-shadow: 0 1.5px 0 #8c5728 !important;
            gap: 6px !important;
            border-radius: 8px !important;
          }
          .sb-level-header span { font-size: 16px !important; }
          .sb-level-header h1 { font-size: 12px !important; }
          .sb-level-header p { font-size: 8px !important; }
          
          .sb-level-card { padding: 8px 10px !important; border-radius: 8px !important; gap: 6px !important; }
          .sb-level-card .level-icon { width: 30px !important; height: 30px !important; font-size: 12px !important; border-width: 1.5px !important; border-radius: 4px !important; }
          .sb-level-card .level-text-title { font-size: 12px !important; }
          .sb-level-card .level-text-desc { font-size: 9px !important; margin-top: 1px !important; }
          .sb-level-card > div:last-child span { font-size: 14px !important; }

          /* Playing Screen */
          .sb-top-hud { flex-direction: row !important; flex-wrap: wrap !important; align-items: center !important; justify-content: space-between !important; gap: 4px !important; margin-bottom: 6px !important; }
          .sb-top-stats { width: 100% !important; justify-content: space-between !important; gap: 4px !important; }
          .sb-top-stats > div { padding: 2px 6px !important; font-size: 10px !important; border-width: 1.5px !important; box-shadow: 0 1px 0 rgba(0,0,0,0.3) !important; }
          .sb-top-stats button { padding: 2px 8px !important; font-size: 10px !important; }
          
          .sb-progress-container { padding: 4px 8px !important; margin-bottom: 6px !important; border-width: 1.5px !important; border-radius: 6px !important; box-shadow: 0 1.5px 0 #8c5728 !important; }
          .sb-progress-text { font-size: 9px !important; margin-bottom: 2px !important; }
          .sb-progress-bar { height: 4px !important; }

          .sb-game-card { padding: 8px !important; border-width: 1.5px !important; border-radius: 8px !important; box-shadow: 0 3px 0 #8c5728 !important; }
          .sb-game-card h2 { font-size: 12px !important; margin-bottom: 8px !important; }
          .sb-level-badge, .sb-hint-badge { font-size: 8px !important; padding: 1px 4px !important; border-width: 1px !important; border-radius: 4px !important; }

          /* SENTENCE BOX */
          .sb-sentence-box { padding: 6px !important; min-height: 50px !important; max-height: 80px !important; overflow-y: auto !important; border-width: 1.5px !important; gap: 4px !important; border-radius: 6px !important; margin-bottom: 8px !important; align-content: flex-start; }
          .sb-sentence-box span { font-size: 10px !important; }

          /* WORD BUTTONS - THE FIX */
          .sb-word-bank-container { display: flex !important; flex-wrap: wrap !important; gap: 4px !important; align-items: flex-start !important; margin-bottom: 8px !important; }
          .sb-word-btn {
            padding: 4px 8px !important;
            height: auto !important; /* Prevent stretch */
            min-height: 0 !important; /* Prevent stretch */
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-size: 11px !important;
            border-width: 1.5px !important;
            border-radius: 6px !important;
            box-shadow: 0 1.5px 0 rgba(0,0,0,0.2) !important;
            flex: 0 0 auto !important;
            white-space: nowrap !important;
          }

          /* ACTION BUTTONS */
          .sb-action-buttons { flex-direction: row !important; gap: 6px !important; margin-top: 8px !important; }
          .sb-action-btn {
            flex: 1 !important;
            padding: 6px !important;
            min-height: 0 !important;
            height: 32px !important; /* Fixed height */
            font-size: 11px !important;
            border-width: 1.5px !important;
            border-radius: 6px !important;
            box-shadow: 0 2px 0 rgba(0,0,0,0.3) !important;
          }
          
          .sb-footer-btn { padding: 6px 12px !important; font-size: 10px !important; border-width: 1.5px !important; box-shadow: 0 2px 0 #3a1f0a !important; }
        }

        @media (max-width: 400px) {
          .sb-topic-grid { grid-template-columns: 1fr !important; }
          .sb-topic-card .card-image { height: 100px !important; }
          .sb-topic-card .card-title { font-size: 13px !important; }
          .sb-topic-card .card-desc { display: block !important; font-size: 9px !important; -webkit-line-clamp: unset !important; }
          .sb-topic-card .card-badge { font-size: 7px !important; padding: 2px 4px !important; }
          .sb-topic-card .card-arrow { width: 22px !important; height: 22px !important; }
          
          .sb-word-btn { font-size: 10px !important; padding: 4px 6px !important; min-height: 26px !important; }
          .sb-action-btn { font-size: 10px !important; padding: 6px !important; min-height: 30px !important; }
        }
      `}</style>

      <div className="sb-container">
        {children}
      </div>
    </div>
  );

  if (gameState === 'topic_selection') {
    
    const topicThemes = {
      'Daily Life & Routines': { bg: '#E58E27', border: '#B3620B', img: '/image/routines.png' },
      'Travel & Directions': { bg: '#2D89E5', border: '#125CA2', img: '/image/travel.png' },
      'Office & Workplace': { bg: '#8F38ED', border: '#5C10B3', img: '/image/office.png' },
      'Academic & Debate': { bg: '#34A853', border: '#1E7335', img: '/image/academic.png' },
      'Social & Hobbies': { bg: '#DE3F3F', border: '#9E1F1F', img: '/image/social.png' },
      'Health & Fitness': { bg: '#1FAEA1', border: '#0C7369', img: '/image/health.png' },
    };

    return (
      <CozyThemeWrapper>
        <style>{`
          .topic-card {
            transition: transform 0.1s ease-out, box-shadow 0.1s ease-out;
            will-change: transform, box-shadow;
          }
          .topic-card:hover { transform: translateY(-4px); }
          .topic-card:active {
            transform: translateY(6px) scale(0.98) !important;
            box-shadow: 0 2px 0 var(--border-color) !important;
          }
        `}</style>

        <div className="sb-header-hud" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          
          <div className="sb-title-box" style={{ background: 'linear-gradient(180deg, #fbd786 0%, #f5af19 100%)', padding: '12px 24px', borderRadius: '20px', border: '4px solid #b87a42', boxShadow: '0 6px 0 #8c5728, inset 0 4px 6px rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '32px', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.2))' }}>📖</span>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#5c3a21', margin: 0, lineHeight: 1.1 }}>Sentence Builder</h1>
              <p style={{ fontSize: '12px', color: '#7a4b24', margin: 0, fontWeight: 'bold' }}>Learn • Improve • Level Up</p>
            </div>
          </div>

          <div className="sb-stats-row" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            
            <div className="sb-stat-badge" style={{ background: 'linear-gradient(180deg, #fdfbfb 0%, #ebedee 100%)', border: '3px solid #d4af37', padding: '8px 18px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 0 #b8860b' }}>
              <span className="stat-icon" style={{ fontSize: '20px' }}>🪙</span>
              <span style={{ fontSize: '20px', fontWeight: '900', color: '#8c5728' }}>{totalPoints}</span>
            </div>

            <div className="sb-stat-badge" style={{ background: 'linear-gradient(180deg, #a1c4fd 0%, #c2e9fb 100%)', border: '3px solid #2980b9', padding: '8px 18px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 0 #1c5980' }}>
              <span className="stat-icon" style={{ fontSize: '20px' }}>💎</span>
              <span style={{ fontSize: '20px', fontWeight: '900', color: '#1c5980' }}>{diamonds}</span>
            </div>

            <div className="sb-stat-badge" style={{ background: 'linear-gradient(180deg, #ff9a9e 0%, #fecfef 100%)', border: '3px solid #c0392b', padding: '8px 18px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 0 #922b21' }}>
              <span className="stat-icon" style={{ fontSize: '20px' }}>❤️</span>
              <span style={{ fontSize: '20px', fontWeight: '900', color: '#922b21' }}>{lives}</span>
              
              {lives < MAX_LIVES && timeLeftStr && (
                <span style={{ fontSize: '14px', color: '#922b21', fontWeight: 'bold', marginLeft: '2px' }}>
                  ({timeLeftStr})
                </span>
              )}

              <button onClick={handleBuyHeart} style={{ background: '#e74c3c', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 0 #922b21' }}>+</button>
            </div>

          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="sb-banner-box" style={{ display: 'inline-block', background: '#6b4423', padding: '8px 40px', borderRadius: '40px', border: '4px solid #4a2c12', boxShadow: '0 8px 0 #3a1f0a, inset 0 4px 10px rgba(0,0,0,0.3)', position: 'relative' }}>
            <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#ffd700', margin: 0 }}>⭐ Select a Topic ⭐</h2>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center' }}>
            <div className="sb-subtext-box" style={{ background: '#fff8f0', padding: '8px 24px', borderRadius: '20px', border: '3px solid #b87a42', boxShadow: '0 4px 0 #8c5728', display: 'inline-block' }}>
              <p style={{ fontSize: '16px', color: '#3E2723', margin: 0, fontWeight: '800' }}>Choose a situational theme to practice your grammar.</p>
            </div>
          </div>
        </div>

        <div className="sb-topic-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          {sentenceBuilderCourses.map((course) => {
            const theme = topicThemes[course.title] || { bg: '#E58E27', border: '#B3620B', img: null };
            const levelsDone = unlockedLevels[course.id]?.length || 1;
            const courseProgress = Math.round((levelsDone / 5) * 100);

            return (
              <div 
                key={course.id} 
                onClick={() => handleSelectTopic(course)}
                className="topic-card sb-topic-card"
                style={{ 
                  border: `4px solid ${theme.border}`, 
                  borderRadius: '24px', 
                  overflow: 'hidden', 
                  cursor: 'pointer', 
                  boxShadow: `0 10px 0 ${theme.border}, 0 15px 25px rgba(0,0,0,0.3)`, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  position: 'relative',
                  '--border-color': theme.border,
                  background: theme.bg
                }}
              >
                <div className="card-image" style={{ 
                  height: '180px', 
                  backgroundColor: theme.bg,
                  borderBottom: `4px solid ${theme.border}`,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {theme.img ? (
                     <img 
                       src={theme.img} 
                       alt={course.title} 
                       style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }} 
                       onError={(e) => {
                         e.target.style.display = 'none';
                         e.target.nextSibling.style.display = 'block';
                       }}
                     />
                  ) : null}
                  
                  <div style={{ 
                    fontSize: '56px', 
                    filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.3))',
                    display: theme.img ? 'none' : 'block'
                  }}>
                    {course.icon}
                  </div>
                </div>

                <div className="card-content" style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', background: `linear-gradient(180deg, ${theme.bg} 0%, ${theme.border} 150%)` }}>
                  <h3 className="card-title" style={{ fontSize: '22px', fontWeight: '900', color: '#FFFFFF', margin: '0 0 8px 0', textShadow: '2px 2px 0px rgba(0,0,0,0.4)', letterSpacing: '0.5px' }}>{course.title}</h3>
                  <p className="card-desc" style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', lineHeight: '1.4', flex: 1, marginBottom: '20px', fontWeight: '700', textShadow: '1px 1px 0px rgba(0,0,0,0.3)' }}>{course.description}</p>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <div className="card-progress-text" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#FFFFFF', fontWeight: '900', marginBottom: '6px', textShadow: '1px 1px 0px rgba(0,0,0,0.3)' }}>
                      <span>Progress</span>
                      <span>{courseProgress}%</span>
                    </div>
                    <div className="card-progress-bar" style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.2)', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.4)' }}>
                      <div style={{ width: `${courseProgress}%`, height: '100%', background: '#FFFFFF', borderRadius: '10px', transition: 'width 0.5s ease' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    
                    <div className="card-badge" style={{ 
                      background: 'rgba(255,255,255,0.2)', 
                      backdropFilter: 'blur(4px)',
                      color: '#FFFFFF', 
                      padding: '6px 16px', 
                      borderRadius: '20px', 
                      fontSize: '12px', 
                      fontWeight: '900', 
                      border: '2px solid rgba(255,255,255,0.6)',
                      boxShadow: '0 2px 0 rgba(0,0,0,0.2)'
                    }}>
                      5 Levels (A1-C1)
                    </div>

                    <div className="card-arrow" style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%', 
                      background: '#FFFFFF', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '20px', 
                      color: theme.bg, 
                      border: `3px solid ${theme.border}`, 
                      boxShadow: '0 4px 0 rgba(0,0,0,0.3)',
                      transform: 'translateY(-2px)'
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12H19M13 6L19 12L13 18" stroke={theme.bg} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: '32px', marginBottom: '16px', flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <button onClick={handleExitGame} className="sb-footer-btn" style={{ background: '#7a4b24', border: '4px solid #4a2c12', padding: '12px 32px', borderRadius: '16px', color: '#fff', cursor: 'pointer', fontWeight: '900', fontSize: '16px', boxShadow: '0 6px 0 #3a1f0a, inset 0 4px 6px rgba(255,255,255,0.2)' }}>
            ← Back to Games
          </button>
        </div>
      </CozyThemeWrapper>
    );
  }

  if (gameState === 'level_selection' && selectedTopic) {
    return (
      <CozyThemeWrapper>
         <style>{`
          .level-card {
            transition: transform 0.1s ease-out, box-shadow 0.1s ease-out;
            will-change: transform, box-shadow;
          }
          .level-card:hover { transform: translateY(-2px); }
          .level-card:active { transform: translateY(4px) scale(0.99) !important; }
        `}</style>

        <div style={{ maxWidth: '950px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', flex: 1 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <button onClick={() => setGameState('topic_selection')} style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(180deg, #d89c63 0%, #b87a42 100%)', border: '3px solid #7a4b24', color: '#fff', fontSize: '18px', cursor: 'pointer', boxShadow: '0 4px 0 #5a3516' }}>←</button>
            
            <div className="sb-level-header" style={{ background: '#fff8f0', padding: '10px 20px', borderRadius: '16px', border: '3px solid #b87a42', boxShadow: '0 4px 0 #8c5728', display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
              <span style={{ fontSize: '28px' }}>{selectedTopic.icon}</span>
              <div>
                <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#3E2723', margin: 0 }}>{selectedTopic.title}</h1>
                <p style={{ fontSize: '13px', color: '#4E342E', margin: '2px 0 0 0', fontWeight: '700' }}>Select a level to start.</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            {CEFR_LEVELS.map((lvlKey) => {
              const levelsForTopic = unlockedLevels[selectedTopic.id] || ['A1'];
              const isUnlocked = levelsForTopic.includes(lvlKey);
              const questionCount = selectedTopic.levels[lvlKey]?.length || 0;
              
              const savedIndex = levelProgress[selectedTopic.id]?.[lvlKey];
              const isCompleted = savedIndex !== undefined && savedIndex >= questionCount;
              const hasProgress = savedIndex !== undefined && savedIndex > 0 && savedIndex < questionCount;
              
              return (
                <div 
                  key={lvlKey} 
                  onClick={() => isUnlocked && handleSelectLevel(lvlKey)}
                  className="sb-level-card"
                  style={{ 
                    background: isUnlocked ? '#fff8f0' : '#e0d6c8', 
                    border: `3px solid ${isUnlocked ? '#b87a42' : '#a89a8e'}`, 
                    borderRadius: '16px', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                    cursor: isUnlocked ? 'pointer' : 'not-allowed', 
                    boxShadow: isUnlocked ? '0 4px 0 #8c5728' : '0 3px 0 #a89a8e'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="level-icon" style={{ width: '56px', height: '56px', borderRadius: '14px', background: isUnlocked ? '#f5af19' : '#a89a8e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '900', border: `3px solid ${isUnlocked ? '#b87a42' : '#7a6c60'}` }}>{lvlKey}</div>
                    <div>
                      <div className="level-text-title" style={{ fontSize: '20px', fontWeight: '900', color: isUnlocked ? '#3E2723' : '#5c4e42' }}>
                        {lvlKey === 'A1' ? 'Beginner' : lvlKey === 'A2' ? 'Elementary' : lvlKey === 'B1' ? 'Intermediate' : lvlKey === 'B2' ? 'Upper Intermediate' : 'Advanced'}
                      </div>
                      <div className="level-text-desc" style={{ fontSize: '14px', color: isUnlocked ? '#7a4b24' : '#7a6c60', marginTop: '2px', fontWeight: '700' }}>
                        {questionCount} Sentences
                        {isCompleted ? (
                          <span style={{ color: '#27ae60', marginLeft: '6px' }}>• Completed ✅</span>
                        ) : hasProgress ? (
                          <span style={{ color: '#e67e22', marginLeft: '6px' }}>• Resume at Q{savedIndex + 1}</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div>{isUnlocked ? <span style={{ fontSize: '24px', color: '#f39c12' }}>▶️</span> : <span style={{ fontSize: '22px', color: '#5c4e42' }}>🔒</span>}</div>
                </div>
              );
            })}
          </div>
        </div>
      </CozyThemeWrapper>
    );
  }

  if (gameState === 'playing' && currentQuestion) {
    return (
      <CozyThemeWrapper>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flex: 1, width: '100%' }}>
          
          <div style={{ width: '100%', maxWidth: '950px' }}>
            
            <div className="sb-top-hud" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <button onClick={handleExitGame} style={{ background: '#e67e22', border: '3px solid #b9770e', padding: '8px 20px', borderRadius: '12px', color: '#fff', cursor: 'pointer', fontSize: '15px', fontWeight: '900', boxShadow: '0 4px 0 #8c5728' }}>Exit</button>
              
              <div className="sb-top-stats" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#fff', padding: '6px 16px', borderRadius: '16px', border: '3px solid #d4af37', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 3px 0 #b8860b' }}>
                  <span style={{ fontSize: '18px' }}>🪙</span>
                  <span style={{ fontSize: '18px', fontWeight: '900', color: '#8c5728' }}>{totalPoints}</span>
                </div>
                
                <div style={{ background: '#fff', padding: '6px 16px', borderRadius: '16px', border: '3px solid #c0392b', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 3px 0 #922b21' }}>
                  <span style={{ fontSize: '18px' }}>❤️</span>
                  <span style={{ fontSize: '18px', fontWeight: '900', color: '#c0392b' }}>{lives}</span>
                  {lives < MAX_LIVES && timeLeftStr && (
                    <span style={{ fontSize: '12px', color: '#c0392b', fontWeight: 'bold' }}>({timeLeftStr})</span>
                  )}
                </div>
                
                <div style={{ background: '#fff', padding: '6px 16px', borderRadius: '16px', border: '3px solid #2980b9', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 3px 0 #1c5980' }}>
                  <span style={{ fontSize: '18px', fontWeight: '900', color: '#2980b9' }}>🎯 {score}</span>
                </div>
              </div>
            </div>

            <div className="sb-progress-container" style={{ marginBottom: '20px', background: '#fff', padding: '10px 20px', borderRadius: '16px', border: '3px solid #b87a42', boxShadow: '0 4px 0 #8c5728' }}>
              <div className="sb-progress-text" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px', color: '#3E2723', fontWeight: '900' }}>
                <span>{selectedTopic.title} ({selectedLevel}) • Q{currentIndex + 1} of {activeQuestions.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="sb-progress-bar" style={{ width: '100%', height: '10px', background: '#e0e0e0', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'linear-gradient(90deg, #f39c12, #f1c40f)', width: `${progress}%`, transition: 'width 0.3s ease' }} />
              </div>
            </div>

            <div className="sb-game-card" style={{ background: '#fff8f0', borderRadius: '24px', padding: '40px', border: '4px solid #b87a42', boxShadow: '0 10px 0 #8c5728, 0 20px 40px rgba(0,0,0,0.2)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
                <span className="sb-level-badge" style={{ padding: '4px 14px', borderRadius: '12px', fontSize: '14px', fontWeight: '900', background: '#f5af19', color: '#fff', border: '2px solid #b87a42' }}>{selectedLevel} Level</span>
                <span className="sb-hint-badge" style={{ fontSize: '14px', color: '#7a4b24', fontStyle: 'italic', fontWeight: '700', background: '#fff', padding: '4px 12px', borderRadius: '10px', border: '2px dashed #d89c63' }}>💡 {currentQuestion.hint}</span>
              </div>

              <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#3E2723', marginBottom: '24px', textAlign: 'center' }}>Arrange the words to form a sentence.</h2>

              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '13px', fontWeight: '900', color: '#8c5728', letterSpacing: '1px', marginBottom: '8px' }}>YOUR SENTENCE</p>
                <div className="sb-sentence-box" style={{ minHeight: '100px', maxHeight: '150px', overflowY: 'auto', border: `3px dashed ${answered ? (isCorrect ? '#27ae60' : '#c0392b') : '#d89c63'}`, borderRadius: '16px', padding: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px', background: answered ? (isCorrect ? '#e8f8f5' : '#fdedec') : '#fff', alignContent: 'flex-start' }}>
                  {selectedWords.length === 0 && !answered && <span style={{ color: '#b87a42', fontSize: '16px', fontStyle: 'italic', fontWeight: '600' }}>Tap words below...</span>}
                  {selectedWords.map((word, index) => (
                    <button key={`selected-${index}`} onClick={() => handleRemoveWord(word, index)} disabled={answered} className="sb-word-btn" style={{ background: answered ? 'transparent' : '#2ecc71', border: '2px solid #1d8348', boxShadow: answered ? 'none' : '0 3px 0 #1d8348' }}>{word}</button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '13px', fontWeight: '900', color: '#8c5728', letterSpacing: '1px', marginBottom: '8px' }}>WORD BANK</p>
                <div className="sb-word-bank-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '50px' }}>
                  {wordBank.map((word, index) => (
                    <button key={`bank-${index}`} onClick={() => handleSelectWord(word, index)} disabled={answered} className="sb-word-btn" style={{ background: '#f39c12', border: '2px solid #b9770e', opacity: answered ? 0.3 : 1, boxShadow: answered ? 'none' : '0 3px 0 #b9770e' }}>{word}</button>
                  ))}
                </div>
              </div>

              {answered && (
                <div style={{ padding: '16px', borderRadius: '16px', background: isCorrect ? '#d4edda' : '#f8d7da', border: `3px solid ${isCorrect ? '#27ae60' : '#c0392b'}`, marginBottom: '24px', textAlign: 'center', fontSize: '18px', color: isCorrect ? '#155724' : '#721c24', fontWeight: '900' }}>{feedbackMessage}</div>
              )}

              <div className="sb-action-buttons" style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                {!answered ? (
                  <>
                    <button onClick={() => initQuestion(currentQuestion)} className="sb-action-btn" style={{ flex: 1, background: '#ecf0f1', color: '#7f8c8d', border: '3px solid #bdc3c7', borderRadius: '16px', cursor: 'pointer', fontWeight: '900', boxShadow: '0 4px 0 #bdc3c7' }}>Reset</button>
                    <button onClick={handleCheckAnswer} disabled={selectedWords.length === 0} className="sb-action-btn" style={{ flex: 2, background: '#f39c12', color: '#fff', border: '3px solid #b9770e', borderRadius: '16px', cursor: selectedWords.length === 0 ? 'not-allowed' : 'pointer', fontWeight: '900', opacity: selectedWords.length === 0 ? 0.5 : 1, boxShadow: '0 4px 0 #b9770e' }}>Check Answer</button>
                  </>
                ) : (
                  isCorrect ? (
                    <button onClick={handleNext} className="sb-action-btn" style={{ width: '100%', background: '#2ecc71', color: '#fff', border: '3px solid #1d8348', borderRadius: '16px', cursor: 'pointer', fontWeight: '900', boxShadow: '0 4px 0 #1d8348' }}>{currentIndex === activeQuestions.length - 1 ? 'Finish Level' : 'Next Sentence →'}</button>
                  ) : (
                    <button onClick={handleTryAgain} className="sb-action-btn" style={{ width: '100%', background: '#e74c3c', color: '#fff', border: '3px solid #c0392b', borderRadius: '16px', cursor: 'pointer', fontWeight: '900', boxShadow: '0 4px 0 #922b21' }}>Try Again 🔄</button>
                  )
                )}
              </div>

            </div>
          </div>
        </div>
      </CozyThemeWrapper>
    );
  }

  if (gameState === 'finished') {
    return (
      <CozyThemeWrapper>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
            <div style={{ background: '#fff8f0', borderRadius: '24px', padding: '30px', border: '4px solid #f39c12', boxShadow: '0 10px 0 #b9770e' }}>
              <div style={{ fontSize: '80px', marginBottom: '12px', filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.2))' }}>🏆</div>
              <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#e67e22', marginBottom: '8px' }}>Level Complete!</h2>
              <p style={{ fontSize: '16px', color: '#3E2723', marginBottom: '24px', fontWeight: '700' }}>You finished <b>{selectedTopic.title}</b> - {selectedLevel}!</p>
              <div style={{ background: '#fff', padding: '16px', borderRadius: '16px', marginBottom: '24px', border: '3px solid #b87a42' }}>
                <div style={{ fontSize: '14px', color: '#8c5728', textTransform: 'uppercase', fontWeight: '900' }}>Score</div>
                <div style={{ fontSize: '36px', color: '#e67e22', fontWeight: '900' }}>{score} / {activeQuestions.length}</div>
              </div>
              <button onClick={() => setGameState('level_selection')} style={{ width: '100%', padding: '16px', background: '#f39c12', color: '#fff', border: '3px solid #b9770e', borderRadius: '16px', cursor: 'pointer', fontSize: '18px', fontWeight: '900', boxShadow: '0 6px 0 #b9770e' }}>Back to Levels →</button>
            </div>
          </div>
        </div>
      </CozyThemeWrapper>
    );
  }

  if (gameState === 'gameover') {
    return (
      <CozyThemeWrapper>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
            <div style={{ background: '#fff8f0', borderRadius: '24px', padding: '30px', border: '4px solid #c0392b', boxShadow: '0 10px 0 #922b21' }}>
              <div style={{ fontSize: '80px', marginBottom: '12px', filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.2))' }}>💔</div>
              <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#c0392b', marginBottom: '8px' }}>Out of Hearts!</h2>
              <p style={{ fontSize: '16px', color: '#3E2723', marginBottom: '20px', fontWeight: '700' }}>You ran out of lives.</p>
              
              {lives < MAX_LIVES && timeLeftStr && (
                 <div style={{ background: '#fdedec', border: '2px solid #c0392b', padding: '10px', borderRadius: '10px', marginBottom: '20px' }}>
                    <p style={{ margin: 0, color: '#c0392b', fontWeight: 'bold' }}>Next heart in: <span style={{ fontSize: '18px' }}>{timeLeftStr}</span></p>
                 </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button onClick={handleGameOverBuyHearts} style={{ width: '100%', padding: '16px', background: '#3498db', color: '#fff', border: '3px solid #2980b9', borderRadius: '16px', cursor: diamonds >= 50 ? 'pointer' : 'not-allowed', fontSize: '16px', fontWeight: '900', opacity: diamonds >= 50 ? 1 : 0.5, boxShadow: '0 6px 0 #2980b9' }}>💎 Buy 5 Hearts (50 Diamonds)</button>
                <button onClick={handleExitGame} style={{ width: '100%', padding: '16px', background: '#ecf0f1', color: '#7f8c8d', border: '3px solid #bdc3c7', borderRadius: '16px', cursor: 'pointer', fontSize: '16px', fontWeight: '900', boxShadow: '0 4px 0 #bdc3c7' }}>Back to Levels</button>
              </div>
            </div>
          </div>
        </div>
      </CozyThemeWrapper>
    );
  }

  return null;
};

export default SentenceBuilder;