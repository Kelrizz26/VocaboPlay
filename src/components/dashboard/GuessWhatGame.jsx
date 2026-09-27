// src/components/dashboard/GuessWhatGame.jsx

import React, { useState, useEffect } from 'react';
import useSound from '../../hooks/useSound';
import { updateUserStats } from '../../services/firebaseService'; // ✅ ADDED
import { auth } from '../../pages/firebase'; // ✅ ADDED
import { onAuthStateChanged } from 'firebase/auth'; // ✅ ADDED

const GuessWhatGame = ({ onBack, updateProgress }) => {
  const [gameState, setGameState] = useState('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [streak, setStreak] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  // ===== GAME-FEEL ADDITIONS: timer, lives, combo bonus =====
  const MAX_LIVES = 3;
  const TIME_BY_DIFFICULTY = { beginner: 20, intermediate: 15, advanced: 12 };
  const [lives, setLives] = useState(MAX_LIVES);
  const [timer, setTimer] = useState(20);
  const [timerRunning, setTimerRunning] = useState(false);
  const [comboCount, setComboCount] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [bonusPoints, setBonusPoints] = useState(0);
  const [showComboPopup, setShowComboPopup] = useState(null);

  // ===== FIREBASE USER =====
  const [currentUser, setCurrentUser] = useState(null);
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  // ===== SOUND EFFECTS =====
  const { playCorrect, playWrong, playVictory } = useSound();

  // ============================================================
  // ===== FIREBASE AUTH - GET CURRENT USER =====
  // ============================================================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setIsUserLoaded(true);
        console.log('✅ GuessWhatGame: User loaded:', user.uid, user.email);
      } else {
        setCurrentUser(null);
        setIsUserLoaded(true);
        console.log('❌ GuessWhatGame: No user logged in');
      }
    });
    
    return () => unsubscribe();
  }, []);

  // ============================================================
  // ===== ✅ NEW: SAVE TO FIREBASE =====
  // ============================================================
  const saveGameToFirebase = async (isWin, isPerfect) => {
    if (!currentUser) {
      console.log('⚠️ No user logged in, skipping Firebase save');
      return;
    }

    const userId = currentUser.uid;
    const totalQuestions = filteredQuestions.length;
    const pointsEarned = score * 15 + bonusPoints; // 15 pts per correct + bonus

    const gameData = {
      gameType: 'guessWhat',
      pointsEarned: pointsEarned,
      newWordsLearned: score, // Each correct = new word learned
      correctAnswers: score,
      totalQuestions: totalQuestions,
      won: isWin || score >= totalQuestions / 2,
      score: score,
      isPerfect: isPerfect || score === totalQuestions,
      bonusPoints: bonusPoints,
      maxCombo: maxCombo,
      livesRemaining: lives
    };

    try {
      console.log('💾 Saving GuessWhat game to Firebase...');
      const result = await updateUserStats(userId, gameData);
      
      if (result.achievements && result.achievements.length > 0) {
        console.log('🏆 New Achievements Unlocked:', result.achievements);
        setFeedbackMessage(`🏆 New Achievements: ${result.achievements.join(', ')} 🎉`);
        setShowFeedback(true);
        setTimeout(() => setShowFeedback(false), 5000);
      }
      
      console.log('✅ GuessWhat game saved to Firebase successfully!');
    } catch (error) {
      console.error('❌ Error saving to Firebase:', error);
    }
  };

  const categories = [
    { id: 'all', name: 'All Words', icon: '📚', color: '#5C6AC4' },
    { id: 'action', name: 'Action Words', icon: '🏃', color: '#5C6AC4' },
    { id: 'focus', name: 'Focus & Attention', icon: '🎯', color: '#ff9f4b' },
    { id: 'collaboration', name: 'Collaboration', icon: '🤝', color: '#ff6b6b' },
    { id: 'analysis', name: 'Analysis', icon: '🔍', color: '#4ecdc4' },
    { id: 'communication', name: 'Communication', icon: '💬', color: '#a06cd5' },
    { id: 'problem-solving', name: 'Problem Solving', icon: '🧩', color: '#45b7d1' },
    { id: 'creativity', name: 'Creativity', icon: '🎨', color: '#f9ca24' },
    { id: 'leadership', name: 'Leadership', icon: '👑', color: '#e67e22' },
    { id: 'technology', name: 'Technology', icon: '💻', color: '#3498db' },
  ];

  const allQuestions = [
    { id: 1, question: 'Which word describes being actively involved in something?', image: 'https://placehold.co/400x300/7c6fd6/white?text=Participate', sentence: 'Students who ______ in class discussions often understand the material better.', answer: 'Participate', options: ['Engage', 'Observe', 'Listen', 'Participate', 'Watch'], category: 'action', difficulty: 'beginner', hint: 'Being part of an activity' },
    { id: 2, question: 'What word means working jointly with others?', image: 'https://placehold.co/400x300/4ECDC4/ffffff?text=Team+Work', sentence: 'The two companies decided to ______ on the new project to combine their expertise.', answer: 'Collaborate', options: ['Compete', 'Collaborate', 'Ignore', 'Avoid', 'Separate'], category: 'collaboration', difficulty: 'beginner', hint: 'Team up' },
    { id: 3, question: 'Which word means to put things in a systematic order?', image: 'https://placehold.co/400x300/FF9800/ffffff?text=Arrange+Items', sentence: 'Before the big presentation, she needed to ______ her thoughts and materials.', answer: 'Organize', options: ['Scatter', 'Organize', 'Confuse', 'Mix', 'Randomize'], category: 'action', difficulty: 'intermediate', hint: 'Put in order' },
    { id: 4, question: 'What word describes directing all your mental energy toward one thing?', image: 'https://placehold.co/400x300/ff6b6b/ffffff?text=Focus', sentence: 'To solve complex problems, you need to ______ fully on the task at hand.', answer: 'Concentrate', options: ['Distract', 'Concentrate', 'Ignore', 'Forget', 'Wander'], category: 'focus', difficulty: 'beginner', hint: 'Pay attention' },
    { id: 5, question: 'What does it mean to watch something carefully?', image: 'https://placehold.co/400x300/FF6B6B/ffffff?text=Watch+Carefully', sentence: 'The scientist used a microscope to ______ the behavior of the tiny organisms.', answer: 'Observe', options: ['Ignore', 'Observe', 'Forget', 'Miss', 'Overlook'], category: 'focus', difficulty: 'intermediate', hint: 'Watch carefully' },
    { id: 6, question: 'What word means to examine something methodically?', image: 'https://placehold.co/400x300/FFE66D/333333?text=Think+Deeply', sentence: 'The detective needed to ______ all the evidence before solving the mystery.', answer: 'Analyze', options: ['Guess', 'Analyze', 'Ignore', 'Skip', 'Assume'], category: 'analysis', difficulty: 'intermediate', hint: 'Examine carefully' },
    { id: 7, question: 'What does it mean to look for similarities and differences?', image: 'https://placehold.co/400x300/9C27B0/ffffff?text=Find+Similarities', sentence: 'When shopping for a new phone, it helps to ______ different models before deciding.', answer: 'Compare', options: ['Buy', 'Compare', 'Ignore', 'Choose', 'Pick'], category: 'analysis', difficulty: 'intermediate', hint: 'Find similarities and differences' },
    { id: 8, question: 'What word means to exchange information with others?', image: 'https://placehold.co/400x300/2196F3/ffffff?text=Share+Ideas', sentence: 'In today\'s global world, it\'s essential to ______ effectively across cultures.', answer: 'Communicate', options: ['Hide', 'Communicate', 'Keep', 'Withhold', 'Silence'], category: 'communication', difficulty: 'intermediate', hint: 'Share information' },
    { id: 9, question: 'What does it mean to make something clear and understandable?', image: 'https://placehold.co/400x300/3F51B5/ffffff?text=Make+Clear', sentence: 'The teacher asked the student to ______ the answer so everyone could understand.', answer: 'Explain', options: ['Confuse', 'Explain', 'Hide', 'Mislead', 'Complicate'], category: 'communication', difficulty: 'beginner', hint: 'Make clear' },
    { id: 10, question: 'What word means to give a brief account of main points?', image: 'https://placehold.co/400x300/4CAF50/ffffff?text=Main+Points', sentence: 'After the long meeting, the secretary will ______ the key decisions in an email.', answer: 'Summarize', options: ['Expand', 'Summarize', 'Detail', 'Elaborate', 'Prolong'], category: 'communication', difficulty: 'intermediate', hint: 'Brief statement' },
    { id: 11, question: 'What word means to show something with proof?', image: 'https://placehold.co/400x300/FF6B6B/ffffff?text=Show+Example', sentence: 'The scientist will ______ how the new medicine works through a series of experiments.', answer: 'Demonstrate', options: ['Hide', 'Demonstrate', 'Conceal', 'Deny', 'Refute'], category: 'action', difficulty: 'intermediate', hint: 'Show how' },
    { id: 12, question: 'What word means to establish the identity of something?', image: 'https://placehold.co/400x300/009688/ffffff?text=Recognize', sentence: 'Using the key features, you can ______ the different species of birds.', answer: 'Identify', options: ['Confuse', 'Identify', 'Mix', 'Mislead', 'Mistake'], category: 'analysis', difficulty: 'intermediate', hint: 'Point out' },
    { id: 13, question: 'What word means to carry out a systematic inquiry?', image: 'https://placehold.co/400x300/FF9800/ffffff?text=Search', sentence: 'The journalist traveled to three countries to ______ the story thoroughly.', answer: 'Investigate', options: ['Ignore', 'Investigate', 'Avoid', 'Overlook', 'Skip'], category: 'analysis', difficulty: 'advanced', hint: 'Look into' },
  ];

  const processedQuestions = allQuestions.map((q) => {
    const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);
    return { ...q, options: shuffledOptions };
  });

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredQuestions(processedQuestions);
    } else {
      setFilteredQuestions(processedQuestions.filter(q => q.category === selectedCategory));
    }
    setCurrentQuestion(0);
    setScore(0);
    setAnswered(false);
    setSelectedAnswer(null);
    setStreak(0);
    setLives(MAX_LIVES);
    setComboCount(0);
    setMaxCombo(0);
    setBonusPoints(0);
  }, [selectedCategory]);

  // Start/refresh the per-question timer, scaled by the question's difficulty
  useEffect(() => {
    if (gameState === 'playing' && current && !answered && lives > 0) {
      const t = TIME_BY_DIFFICULTY[current.difficulty] || 15;
      setTimer(t);
      setTimerRunning(true);
    } else {
      setTimerRunning(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, gameState, lives]);

  // Countdown ticker
  useEffect(() => {
    if (!timerRunning || gameState !== 'playing') return;
    if (timer <= 0) {
      setTimerRunning(false);
      if (!answered) {
        handleTimeUp();
      }
      return;
    }
    const id = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer, timerRunning, gameState]);

  const handleStartGame = () => setGameState('playing');
  const current = filteredQuestions[currentQuestion];
  const progress = filteredQuestions.length > 0 ? ((currentQuestion + 1) / filteredQuestions.length) * 100 : 0;

  const handleAnswer = (selected) => {
    if (!answered && current) {
      setSelectedAnswer(selected);
      setAnswered(true);
      setTimerRunning(false);
      
      const isCorrect = selected === current.answer;
      
      if (isCorrect) {
        playCorrect();
        setScore(score + 1);
        setStreak(streak + 1);
        setFeedbackMessage('✅ Correct! Great job!');

        // Combo bonus: base 10pts + 2 per combo step, capped, plus a small
        // speed bonus for answering with time to spare.
        const newCombo = comboCount + 1;
        setComboCount(newCombo);
        if (newCombo > maxCombo) setMaxCombo(newCombo);
        const speedBonus = timer >= 10 ? 5 : 0;
        const earned = Math.min(10 + newCombo * 2, 30) + speedBonus;
        setBonusPoints(prev => prev + earned);
        setShowComboPopup(`+${earned}`);
        setTimeout(() => setShowComboPopup(null), 900);
        
        const savedProgress = localStorage.getItem('vocaboplay_progress');
        const currentProgress = savedProgress ? JSON.parse(savedProgress) : null;
        
        if (currentProgress && updateProgress) {
          const updates = {
            totalAnswers: (currentProgress.totalAnswers || 0) + 1,
            correctAnswers: (currentProgress.correctAnswers || 0) + 1,
            totalPoints: (currentProgress.totalPoints || 0) + 15,
            xp: (currentProgress.xp || 0) + 8,
            wordsLearned: (currentProgress.wordsLearned || 0) + 1,
            GuessWhat: {
              ...currentProgress.GuessWhat,
              gamesCompleted: (currentProgress.GuessWhat?.gamesCompleted || 0) + 1,
              correctAnswers: (currentProgress.GuessWhat?.correctAnswers || 0) + 1,
              totalQuestions: (currentProgress.GuessWhat?.totalQuestions || 0) + 1
            }
          };
          updateProgress(updates);
        }
      } else {
        playWrong();
        setStreak(0);
        setComboCount(0);
        registerMiss(`❌ Oops! The correct word is "${current.answer}"`);
      }
      
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 2000);
    }
  };

  // Timeout also counts as a miss, mirroring a wrong answer
  const handleTimeUp = () => {
    if (answered || !current) return;
    setAnswered(true);
    setSelectedAnswer(null);
    playWrong();
    setStreak(0);
    setComboCount(0);
    registerMiss("⏰ Time's up! The correct word was \"" + current.answer + '"');
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 2000);
  };

  // Shared "wrong answer" handling: costs a life, ends the run early if
  // lives hit zero (a real Game Over instead of just continuing forever)
  const registerMiss = (message) => {
    setLives(prev => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        setFeedbackMessage(message + ' — Out of lives!');
        setTimeout(() => finishRun(false), 1200);
      } else {
        setFeedbackMessage(`${message} (${newLives} ${newLives === 1 ? 'life' : 'lives'} left)`);
      }
      return newLives;
    });
  };

  const handleNextQuestion = () => {
    if (lives <= 0) return; // already routed to game-over by registerMiss
    if (currentQuestion < filteredQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setAnswered(false);
      setSelectedAnswer(null);
    } else {
      finishRun(true);
    }
  };

  // Shared ending routine for both a natural finish (all questions
  // answered) and an early Game Over (lives depleted).
  const finishRun = (completedAll) => {
    setGameState(completedAll ? 'finished' : 'gameover');

    const isPerfect = completedAll && score === filteredQuestions.length;
    
    if (isPerfect) {
      playVictory();
    }

    // ✅ Save to Firebase
    saveGameToFirebase(completedAll, isPerfect);

    const savedProgress = localStorage.getItem('vocaboplay_progress');
    const currentProgress = savedProgress ? JSON.parse(savedProgress) : null;

    if (currentProgress && updateProgress) {
      const updates = {
        gamesPlayed: (currentProgress.gamesPlayed || 0) + 1,
        guessWhat: {
          ...currentProgress.guessWhat,
          gamesCompleted: (currentProgress.guessWhat?.gamesCompleted || 0) + 1,
          bestScore: Math.max(currentProgress.guessWhat?.bestScore || 0, score)
        }
      };

      if (isPerfect) {
        updates.xp = (currentProgress.xp || 0) + 35;
        updates.totalPoints = (currentProgress.totalPoints || 0) + 80;
        updates.achievements = { ...currentProgress.achievements, perfectScore: true };
      } else if (completedAll) {
        updates.xp = (currentProgress.xp || 0) + 20;
        updates.totalPoints = (currentProgress.totalPoints || 0) + 50;
      } else {
        updates.xp = (currentProgress.xp || 0) + 10;
        updates.totalPoints = (currentProgress.totalPoints || 0) + 25;
      }
      updateProgress(updates);
    }
  };

  const handleRestart = () => {
    setGameState('intro');
    setCurrentQuestion(0);
    setScore(0);
    setAnswered(false);
    setSelectedAnswer(null);
    setStreak(0);
    setLives(MAX_LIVES);
    setComboCount(0);
    setMaxCombo(0);
    setBonusPoints(0);
  };

  // ===== LOADING SCREEN =====
  if (!isUserLoaded) {
    return (
      <div className="guess-container" style={{ fontFamily: "'Poppins', sans-serif", maxWidth: '500px', margin: '0 auto', padding: '24px' }}>
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '40px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1E293B' }}>Loading...</h2>
          <p style={{ fontSize: '14px', color: '#64748B' }}>Please wait while we set up your game.</p>
        </div>
      </div>
    );
  }

  if (gameState === 'intro') {
    return (
      <div className="guess-container" style={{ fontFamily: "'Poppins', sans-serif", maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
        <style>{`
          /* ===== MOBILE RESPONSIVE FOR GUESS WHAT GAME ===== */
          @media (max-width: 768px) {
            .guess-container {
              padding: 16px !important;
            }
            .guess-category-grid {
              grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)) !important;
              gap: 6px !important;
            }
            .guess-title {
              font-size: 22px !important;
            }
            .guess-intro-card {
              padding: 20px !important;
            }
          }
          @media (max-width: 480px) {
            .guess-container {
              padding: 12px !important;
            }
            .guess-title {
              font-size: 18px !important;
            }
            .guess-category-grid {
              grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)) !important;
            }
            .guess-category-grid button {
              padding: 8px !important;
              font-size: 12px !important;
            }
            .guess-category-grid button span:first-child {
              font-size: 20px !important;
            }
            .guess-intro-card {
              padding: 16px !important;
            }
          }
        `}</style>

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

        <div className="guess-intro-card" style={{ background: '#ffffff', borderRadius: '16px', padding: '32px', marginBottom: '24px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px', color: '#5C6AC4' }}>🤔</div>
          <h2 className="guess-title" style={{ fontSize: '28px', fontWeight: '500', color: '#1E293B', marginBottom: '8px' }}>Welcome to GuessWhat!</h2>
          <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px' }}>Test your vocabulary skills by guessing the correct word from context clues and images.</p>
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '20px', marginBottom: '24px', border: '1px solid #E2E8F0', textAlign: 'left' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '500', color: '#5C6AC4', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>How to Play:</h3>
            <ul style={{ paddingLeft: '20px', fontSize: '13px', color: '#64748B', lineHeight: '1.8', margin: 0 }}><li>Choose a category below or play with all words</li><li>Read the sentence with the blank</li><li>Answer before the timer runs out — harder words move faster</li><li>Chain correct answers for combo bonus points 🔥</li><li>You have 3 lives — a wrong answer or timeout costs one</li></ul>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <span style={{ padding: '4px 12px', borderRadius: '8px', background: '#FEF2F2', color: '#DC2626', fontSize: '12px', fontWeight: '600' }}>❤️ 3 Lives</span>
            <span style={{ padding: '4px 12px', borderRadius: '8px', background: '#FFFBEB', color: '#D97706', fontSize: '12px', fontWeight: '600' }}>⏱️ 12-20s per question</span>
            <span style={{ padding: '4px 12px', borderRadius: '8px', background: '#F0FDF4', color: '#16A34A', fontSize: '12px', fontWeight: '600' }}>🔥 Combo bonus scoring</span>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '500', color: '#1E293B', marginBottom: '12px' }}>Choose a Category</h3>
          <div className="guess-category-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
            {categories.map(category => {
              const count = category.id === 'all' ? processedQuestions.length : processedQuestions.filter(q => q.category === category.id).length;
              return (
                <button key={category.id} onClick={() => setSelectedCategory(category.id)} style={{ background: selectedCategory === category.id ? `${category.color}15` : '#ffffff', border: `1px solid ${selectedCategory === category.id ? category.color : '#E2E8F0'}`, borderRadius: '12px', padding: '12px', cursor: 'pointer' }}>
                  <span style={{ fontSize: '24px', display: 'block', marginBottom: '4px' }}>{category.icon}</span>
                  <span style={{ fontSize: '13px', fontWeight: '500', color: selectedCategory === category.id ? category.color : '#1E293B' }}>{category.name}</span>
                  <span style={{ fontSize: '11px', color: selectedCategory === category.id ? category.color : '#64748B', display: 'block', marginTop: '2px' }}>{count} {count === 1 ? 'question' : 'questions'}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button onClick={handleStartGame} style={{ width: '100%', padding: '12px', background: '#5C6AC4', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>Start {selectedCategory === 'all' ? 'Game' : categories.find(c => c.id === selectedCategory)?.name || 'Game'}</button>
      </div>
    );
  }

  if (gameState === 'playing') {
    if (!current) {
      return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '40px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', color: '#64748B' }}>📭</div>
            <h2 style={{ fontSize: '18px', fontWeight: '500', color: '#1E293B', marginBottom: '4px' }}>No Questions Available</h2>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px' }}>Try adjusting your filters</p>
            <button onClick={() => setGameState('intro')} style={{ padding: '10px 24px', background: '#5C6AC4', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>Back to Settings</button>
          </div>
        </div>
      );
    }

    const currentCategory = categories.find(c => c.id === current.category) || categories[0];

    return (
      <div className="guess-container" style={{ fontFamily: "'Poppins', sans-serif", maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
        <style>{`
          @media (max-width: 768px) {
            .guess-container {
              padding: 16px !important;
            }
            .guess-options {
              grid-template-columns: 1fr !important;
            }
            .guess-card {
              padding: 20px !important;
            }
            .guess-image {
              width: 160px !important;
              height: 120px !important;
            }
            .guess-sentence {
              font-size: 15px !important;
            }
            .guess-header h1 {
              font-size: 18px !important;
            }
          }
          @media (max-width: 480px) {
            .guess-container {
              padding: 12px !important;
            }
            .guess-card {
              padding: 16px !important;
            }
            .guess-image {
              width: 120px !important;
              height: 100px !important;
            }
            .guess-sentence {
              font-size: 14px !important;
              padding: 10px !important;
            }
            .guess-options button {
              padding: 10px 14px !important;
              font-size: 13px !important;
            }
          }
        `}</style>

        <div className="guess-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <button onClick={() => setGameState('intro')} style={{ background: '#ffffff', border: '1px solid #E2E8F0', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#64748B' }}>Exit</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ fontSize: '22px', color: currentCategory.color }}>{currentCategory.icon}</span><h1 className="guess-title" style={{ fontSize: '20px', fontWeight: '500', color: '#1E293B', margin: '0' }}>{currentCategory.name}</h1></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[...Array(lives)].map((_, i) => (<span key={i} style={{ fontSize: '15px' }}>❤️</span>))}
              {[...Array(MAX_LIVES - lives)].map((_, i) => (<span key={i} style={{ fontSize: '15px', opacity: 0.2 }}>❤️</span>))}
            </div>
            <div style={{ fontSize: '14px', fontWeight: '500', background: '#EEF0FB', color: '#5C6AC4', padding: '6px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>{score}/{filteredQuestions.length}</div>
          </div>
        </div>

        {/* Timer + combo row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '50%',
            background: timer <= 3 ? '#FEF2F2' : timer <= 6 ? '#FFFBEB' : '#F8FAFC',
            border: `2px solid ${timer <= 3 ? '#DC2626' : timer <= 6 ? '#D97706' : '#E2E8F0'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: timer <= 3 ? '#DC2626' : timer <= 6 ? '#D97706' : '#64748B',
            fontSize: '14px', fontWeight: '700', flexShrink: 0,
            transition: 'all 0.2s ease',
          }}>{timer}</div>
          {comboCount >= 2 && (
            <div style={{ background: comboCount >= 4 ? '#FFFBEB' : '#F0FDF4', padding: '4px 12px', borderRadius: '12px', border: `1px solid ${comboCount >= 4 ? '#D97706' : '#16A34A'}`, fontSize: '12px', fontWeight: '700', color: comboCount >= 4 ? '#D97706' : '#16A34A' }}>
              🔥 {comboCount}x combo
            </div>
          )}
          {showComboPopup && (
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#16A34A', animation: 'floatUp 0.9s ease forwards' }}>{showComboPopup}</div>
          )}
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '4px 12px', borderRadius: '12px' }}>⭐ {bonusPoints} pts</div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px', color: '#64748B' }}><span>Question {currentQuestion + 1} of {filteredQuestions.length}</span><span>{Math.round(progress)}%</span></div>
          <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '8px', overflow: 'hidden' }}><div style={{ height: '100%', background: '#5C6AC4', width: `${progress}%`, transition: 'width 0.3s ease', borderRadius: '8px' }} /></div>
        </div>

        {showFeedback && <div style={{ padding: '10px', borderRadius: '8px', background: feedbackMessage.includes('✅') ? '#f0fdf4' : '#fef2f2', border: `1px solid ${feedbackMessage.includes('✅') ? '#bbf7d0' : '#fecaca'}`, marginBottom: '16px', textAlign: 'center', fontSize: '14px', color: feedbackMessage.includes('✅') ? '#166534' : '#991b1b' }}>{feedbackMessage}</div>}

        <style>{`
          @keyframes floatUp {
            0% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-16px); }
          }
        `}</style>


        <div className="guess-card" style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '500', background: current.difficulty === 'beginner' ? '#e8f5e9' : current.difficulty === 'intermediate' ? '#fff4e5' : '#ffebee', color: current.difficulty === 'beginner' ? '#2e7d32' : current.difficulty === 'intermediate' ? '#b85c1a' : '#b91c1c' }}>{current.difficulty}</span>
            <span style={{ padding: '4px 12px', background: '#EEF0FB', borderRadius: '12px', fontSize: '12px', color: '#5C6AC4', fontWeight: '500' }}>{currentCategory.name}</span>
          </div>

          <h2 style={{ fontSize: '18px', fontWeight: '500', color: '#1E293B', marginBottom: '20px', textAlign: 'center', lineHeight: '1.5' }}>{current.question}</h2>

          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <div className="guess-image" style={{ width: '240px', height: '160px', margin: '0 auto', borderRadius: '12px', overflow: 'hidden', background: '#f8fafc', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '60px' }}>🖼️</span>
            </div>
            <p className="guess-sentence" style={{ fontSize: '16px', fontWeight: '500', color: '#1E293B', marginTop: '16px', padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #E2E8F0' }}>{current.sentence}</p>
          </div>

          <div style={{ marginBottom: '20px', padding: '12px', background: '#EEF0FB', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px', color: '#5C6AC4' }}>💡</span>
            <p style={{ fontSize: '13px', color: '#64748B', fontStyle: 'italic', margin: 0 }}><strong>Hint:</strong> {current.hint}</p>
          </div>

          <div className="guess-options" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px' }}>
            {current.options.map((option, idx) => {
              let bgColor = '#ffffff', borderColor = '#E2E8F0', textColor = '#1E293B';
              if (answered) {
                if (option === current.answer) { bgColor = '#f0fdf4'; borderColor = '#4ade80'; textColor = '#166534'; }
                else if (option === selectedAnswer && option !== current.answer) { bgColor = '#fef2f2'; borderColor = '#fecaca'; textColor = '#991b1b'; }
              }
              return (
                <button key={idx} onClick={() => handleAnswer(option)} disabled={answered} style={{ padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '12px', background: bgColor, fontSize: '14px', fontWeight: '400', color: textColor, cursor: answered ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{option}</span>
                  {answered && option === current.answer && <span style={{ color: '#22c55e', fontSize: '18px' }}>✓</span>}
                  {answered && option === selectedAnswer && option !== current.answer && <span style={{ color: '#ef4444', fontSize: '18px' }}>✗</span>}
                </button>
              );
            })}
          </div>

          {answered && lives > 0 && <button onClick={handleNextQuestion} style={{ width: '100%', padding: '12px', background: '#5C6AC4', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>{currentQuestion === filteredQuestions.length - 1 ? 'Finish Game' : 'Next Question'}</button>}
        </div>
      </div>
    );
  }

  if (gameState === 'gameover') {
    return (
      <div style={{ fontFamily: "'Poppins', sans-serif", maxWidth: '500px', margin: '0 auto', padding: '24px' }}>
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '32px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>💔</div>
          <h2 style={{ fontSize: '22px', fontWeight: '600', color: '#1E293B', marginBottom: '4px' }}>Out of Lives!</h2>
          <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '20px' }}>
            You answered {score} question{score === 1 ? '' : 's'} correctly, with a best combo of {maxCombo}x and {bonusPoints} bonus points.
          </p>
          <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '16px', marginBottom: '24px', border: '1px solid #E2E8F0' }}>
            <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>Every attempt sharpens your vocabulary — give it another go!</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleRestart} style={{ flex: 1, padding: '12px', background: '#5C6AC4', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Try Again</button>
            <button onClick={onBack} style={{ flex: 1, padding: '12px', background: '#ffffff', color: '#64748B', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>More Games</button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    const percentage = Math.round((score / filteredQuestions.length) * 100);
    return (
      <div style={{ fontFamily: "'Poppins', sans-serif", maxWidth: '500px', margin: '0 auto', padding: '24px' }}>
        <style>{`
          @media (max-width: 480px) {
            .guess-container {
              padding: 12px !important;
            }
          }
        `}</style>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>
          <button onClick={() => setGameState('intro')} style={{ background: '#ffffff', border: '1px solid #E2E8F0', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#64748B' }}>Back</button>
          <h1 style={{ fontSize: '20px', fontWeight: '500', color: '#1E293B', margin: '0' }}>Game Complete!</h1>
          <div style={{ width: '40px' }}></div>
        </div>
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '32px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>{percentage === 100 ? '🏆' : '🎉'}</div>
          <h2 style={{ fontSize: '24px', fontWeight: '500', color: '#1E293B', marginBottom: '4px' }}>{percentage === 100 ? 'Perfect Score!' : 'Great Job!'}</h2>
          <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '20px' }}>You scored {score} out of {filteredQuestions.length}</p>
          <div style={{ width: '120px', height: '120px', margin: '0 auto 20px', borderRadius: '50%', background: `conic-gradient(#5C6AC4 0% ${percentage}%, #E2E8F0 ${percentage}% 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '500', color: '#5C6AC4' }}>{percentage}%</div>
          </div>
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: '1px solid #E2E8F0' }}>
            <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>{score === filteredQuestions.length ? 'Amazing! You got all questions right! 🏆' : score >= filteredQuestions.length / 2 ? 'Great work! Keep practicing to improve! 👍' : 'Good start! Practice makes perfect! 💪'}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
            <div style={{ background: '#FFFBEB', borderRadius: '10px', padding: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#D97706' }}>🔥 {maxCombo}x</div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>Best Combo</div>
            </div>
            <div style={{ background: '#EEF0FB', borderRadius: '10px', padding: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#5C6AC4' }}>⭐ {bonusPoints}</div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>Bonus Points</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleRestart} style={{ flex: 1, padding: '12px', background: '#5C6AC4', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Play Again</button>
            <button onClick={onBack} style={{ flex: 1, padding: '12px', background: '#ffffff', color: '#64748B', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>More Games</button>
          </div>
        </div>
      </div>
    );
  }
};

export default GuessWhatGame;