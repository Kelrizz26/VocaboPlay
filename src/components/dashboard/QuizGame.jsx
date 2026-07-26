// src/components/dashboard/QuizGame.jsx

import React, { useState, useEffect } from 'react';
import useSound from '../../hooks/useSound';
import { updateUserStats } from '../../services/firebaseService'; // ✅ ADDED
import { auth } from '../../pages/firebase'; // ✅ ADDED
import { onAuthStateChanged } from 'firebase/auth'; // ✅ ADDED

const QuizGame = ({ onBack, updateProgress }) => {
  const [gameState, setGameState] = useState('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [dailySeed, setDailySeed] = useState('');
  const [streak, setStreak] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // ✅ ADDED
  const [isUserLoaded, setIsUserLoaded] = useState(false); // ✅ ADDED

  const { playCorrect, playWrong, playVictory } = useSound();

  const UNIFIED_VOCABULARY = [
    { id: 1, word: 'Participate', definition: 'To take part in an activity or discussion.' },
    { id: 2, word: 'Concentrate', definition: 'To focus all your attention on something.' },
    { id: 3, word: 'Summarize', definition: 'To give a brief statement of the main points.' },
    { id: 4, word: 'Analyze', definition: 'To examine something in detail to understand it better.' },
    { id: 5, word: 'Collaborate', definition: 'To work together with others on a project.' },
    { id: 6, word: 'Demonstrate', definition: 'To show clearly by giving proof or evidence.' },
    { id: 7, word: 'Review', definition: 'To look over or study again to remember better.' },
    { id: 8, word: 'Practice', definition: 'To do something repeatedly to improve your skill.' },
    { id: 9, word: 'Observe', definition: 'To watch carefully and notice details.' },
    { id: 10, word: 'Organize', definition: 'To arrange things in an orderly and structured way.' },
    { id: 11, word: 'Revise', definition: 'To make changes to improve your work.' },
    { id: 12, word: 'Discuss', definition: 'To talk about a topic with others to share ideas.' },
    { id: 13, word: 'Explain', definition: 'To make something clear and easy to understand.' },
    { id: 14, word: 'Compare', definition: 'To examine the similarities and differences between things.' },
    { id: 15, word: 'Identify', definition: 'To recognize and name something correctly.' },
    { id: 16, word: 'Evaluate', definition: 'To judge the value or quality of something.' },
    { id: 17, word: 'Research', definition: 'To study and investigate a topic carefully.' },
    { id: 18, word: 'Present', definition: 'To show or introduce information to others.' },
    { id: 19, word: 'Complete', definition: 'To finish something that was started.' },
    { id: 20, word: 'Illustrate', definition: 'To explain or make clear by using examples or pictures.' },
  ];

  const categories = [
    { id: 'all', name: 'All Words', icon: '📚' },
    { id: 'beginner', name: 'Beginner', icon: '🌱' },
    { id: 'intermediate', name: 'Intermediate', icon: '⚡' },
    { id: 'advanced', name: 'Advanced', icon: '🔥' },
  ];

  // ============================================================
  // ===== FIREBASE AUTH - GET CURRENT USER =====
  // ============================================================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setIsUserLoaded(true);
        console.log('✅ QuizGame: User loaded:', user.uid, user.email);
      } else {
        setCurrentUser(null);
        setIsUserLoaded(true);
        console.log('❌ QuizGame: No user logged in');
      }
    });
    
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    setDailySeed(dateString);
  }, []);

  const generateDailyQuiz = () => {
    const seed = dailySeed || new Date().toDateString();
    let seedValue = 0;
    for (let i = 0; i < seed.length; i++) {
      seedValue += seed.charCodeAt(i);
    }

    const seededRandom = (max) => {
      seedValue = (seedValue * 9301 + 49297) % 233280;
      return Math.floor((seedValue / 233280) * max);
    };

    const beginnerWords = UNIFIED_VOCABULARY.filter(w => w.id <= 6);
    const intermediateWords = UNIFIED_VOCABULARY.filter(w => w.id > 6 && w.id < 13);
    const advancedWords = UNIFIED_VOCABULARY.filter(w => w.id >= 13);

    const shuffleArray = (array) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = seededRandom(i + 1);
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    const shuffledBeginner = shuffleArray(beginnerWords);
    const shuffledIntermediate = shuffleArray(intermediateWords);
    const shuffledAdvanced = shuffleArray(advancedWords);

    const selectedBeginner = shuffledBeginner.slice(0, 5);
    const selectedIntermediate = shuffledIntermediate.slice(0, 5);
    const selectedAdvanced = shuffledAdvanced.slice(0, 5);

    const selectedWords = [...selectedBeginner, ...selectedIntermediate, ...selectedAdvanced];

    return selectedWords.map((word) => {
      const otherWords = UNIFIED_VOCABULARY.filter(w => w.id !== word.id);
      const wrongIndices = [];
      for (let i = 0; i < 3; i++) {
        let idx;
        do {
          idx = seededRandom(otherWords.length);
        } while (wrongIndices.includes(idx));
        wrongIndices.push(idx);
      }
      const wrongAnswers = wrongIndices.map(idx => otherWords[idx].definition);

      const allAnswers = [word.definition, ...wrongAnswers];
      for (let i = allAnswers.length - 1; i > 0; i--) {
        const j = seededRandom(i + 1);
        [allAnswers[i], allAnswers[j]] = [allAnswers[j], allAnswers[i]];
      }

      const correctIndex = allAnswers.indexOf(word.definition);

      let difficulty = 'intermediate';
      if (word.id <= 6) difficulty = 'beginner';
      else if (word.id >= 13) difficulty = 'advanced';

      let category = 'all';
      if (word.id % 3 === 0) category = 'action';
      else if (word.id % 3 === 1) category = 'academic';
      else category = 'all';

      return {
        id: word.id,
        question: `What does "${word.word}" mean?`,
        options: allAnswers,
        correct: correctIndex,
        word: word.word,
        definition: word.definition,
        difficulty: difficulty,
        category: category
      };
    });
  };

  useEffect(() => {
    const dailyQuiz = generateDailyQuiz();
    if (selectedCategory === 'all') {
      setFilteredQuizzes(dailyQuiz);
    } else {
      setFilteredQuizzes(dailyQuiz.filter(q => q.category === selectedCategory ||
        (selectedCategory === 'beginner' && q.difficulty === 'beginner') ||
        (selectedCategory === 'intermediate' && q.difficulty === 'intermediate') ||
        (selectedCategory === 'advanced' && q.difficulty === 'advanced')));
    }
    setCurrentIndex(0);
    setScore(0);
    setAnswered(false);
    setSelectedAnswer(null);
  }, [selectedCategory, dailySeed]);

  const current = filteredQuizzes[currentIndex];
  const progress = filteredQuizzes.length > 0 ? ((currentIndex + 1) / filteredQuizzes.length) * 100 : 0;
  const totalQuestions = filteredQuizzes.length;

  // ============================================================
  // ===== ✅ NEW: SAVE TO FIREBASE =====
  // ============================================================
  const saveGameToFirebase = async (finalScore, totalQ, isPerfect) => {
    if (!currentUser) {
      console.log('⚠️ No user logged in, skipping Firebase save');
      return;
    }

    const userId = currentUser.uid;
    const pointsEarned = finalScore * 15; // 15 points per correct answer
    const won = finalScore >= totalQ / 2;

    const gameData = {
      gameType: 'quizMaster',
      pointsEarned: pointsEarned,
      newWordsLearned: finalScore, // Each correct answer = new word learned
      correctAnswers: finalScore,
      totalQuestions: totalQ,
      won: won,
      score: finalScore,
      isPerfect: isPerfect
    };

    try {
      console.log('💾 Saving QuizMaster game to Firebase...');
      const result = await updateUserStats(userId, gameData);
      
      if (result.achievements && result.achievements.length > 0) {
        console.log('🏆 New Achievements Unlocked:', result.achievements);
        setFeedbackMessage(`🏆 New Achievements: ${result.achievements.join(', ')} 🎉`);
        setShowFeedback(true);
        setTimeout(() => setShowFeedback(false), 5000);
      }
      
      console.log('✅ QuizMaster game saved to Firebase successfully!');
    } catch (error) {
      console.error('❌ Error saving to Firebase:', error);
    }
  };

  // ============================================================
  // ===== HANDLE ANSWER - UPDATED =====
  // ============================================================
  const handleAnswer = (selected) => {
    if (!answered && current) {
      setSelectedAnswer(selected);
      setAnswered(true);
      
      const isCorrect = selected === current.correct;
      
      if (isCorrect) {
        playCorrect();
        setScore(score + 1);
        setStreak(streak + 1);
        setFeedbackMessage('✅ Correct! Great job!');
      
        const savedProgress = localStorage.getItem('vocaboplay_progress');
        const currentProgress = savedProgress ? JSON.parse(savedProgress) : null;
        
        if (currentProgress && updateProgress) {
          const updates = {
            totalAnswers: (currentProgress.totalAnswers || 0) + 1,
            correctAnswers: (currentProgress.correctAnswers || 0) + 1,
            totalPoints: (currentProgress.totalPoints || 0) + 15,
            xp: (currentProgress.xp || 0) + 8,
            wordsLearned: (currentProgress.wordsLearned || 0) + 1,
            QuizGame: {
              ...currentProgress.QuizGame,
              gamesCompleted: (currentProgress.QuizGame?.gamesCompleted || 0) + 1,
              correctAnswers: (currentProgress.QuizGame?.correctAnswers || 0) + 1,
              totalQuestions: (currentProgress.QuizGame?.totalQuestions || 0) + 1
            }
          };
          updateProgress(updates);
        }
      } else {
        playWrong();
        setStreak(0);
        setFeedbackMessage(`❌ Oops! The correct answer is option ${String.fromCharCode(65 + current.correct)}`);
      }
      
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 2000);
    }
  };

  // ============================================================
  // ===== HANDLE NEXT - UPDATED =====
  // ============================================================
  const handleNext = () => {
    if (currentIndex < filteredQuizzes.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setAnswered(false);
      setSelectedAnswer(null);
    } else {
      setGameState('finished');
      
      const isPerfect = score === filteredQuizzes.length;
      
      if (isPerfect) {
        playVictory();
      }
      
      // ✅ Save to Firebase when quiz finishes
      saveGameToFirebase(score, filteredQuizzes.length, isPerfect);
      
      const savedProgress = localStorage.getItem('vocaboplay_progress');
      const currentProgress = savedProgress ? JSON.parse(savedProgress) : null;
      
      if (currentProgress && updateProgress) {
        const updates = {
          gamesPlayed: (currentProgress.gamesPlayed || 0) + 1,
          quiz: {
            ...currentProgress.quiz,
            gamesCompleted: (currentProgress.quiz?.gamesCompleted || 0) + 1,
            bestScore: Math.max(currentProgress.quiz?.bestScore || 0, score)
          }
        };
        
        if (isPerfect) {
          updates.achievements = {
            ...currentProgress.achievements,
            perfectScore: true
          };
          updates.xp = (currentProgress.xp || 0) + 40;
          updates.totalPoints = (currentProgress.totalPoints || 0) + 120;
        } else {
          updates.xp = (currentProgress.xp || 0) + 20;
          updates.totalPoints = (currentProgress.totalPoints || 0) + 50;
        }
        updateProgress(updates);
      }
    }
  };

  const handleRestart = () => {
    setGameState('intro');
    setCurrentIndex(0);
    setScore(0);
    setAnswered(false);
    setSelectedAnswer(null);
    setStreak(0);
  };

  const handleExitGame = () => {
    // ✅ Save progress on exit if game is playing
    if (gameState === 'playing' && score > 0) {
      saveGameToFirebase(score, filteredQuizzes.length, false);
    }
    setShowExitConfirm(true);
  };
  
  const confirmExit = () => {
    setShowExitConfirm(false);
    if (onBack) onBack();
  };
  const cancelExit = () => setShowExitConfirm(false);

  // ===== EXIT CONFIRM MODAL =====
  const ExitConfirmModal = () => (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div style={{
        background: '#1E293B',
        borderRadius: '8px',
        padding: '32px',
        maxWidth: '380px',
        width: '100%',
        textAlign: 'center',
        border: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🚪</div>
        <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>Exit Quiz?</h3>
        <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>Your progress will be saved.</p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={confirmExit} style={{ flex: 1, padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>Exit</button>
          <button onClick={cancelExit} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>Cancel</button>
        </div>
      </div>
    </div>
  );

  // ===== LOADING SCREEN =====
  if (!isUserLoaded) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#1E293B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Poppins', -apple-system, sans-serif"
      }}>
        <div style={{
          background: '#1E293B',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%',
          border: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'white' }}>Loading...</h2>
          <p style={{ fontSize: '14px', color: '#94a3b8' }}>Please wait while we set up your game.</p>
        </div>
      </div>
    );
  }

  // ===== INTRO SCREEN =====
  if (gameState === 'intro') {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#1E293B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: "'Poppins', -apple-system, sans-serif"
      }}>
        <div style={{
          maxWidth: '500px',
          width: '100%',
          background: '#1E293B',
          borderRadius: '24px',
          padding: '40px',
          border: '1px solid rgba(255,255,255,0.06)'
        }}>
          {currentUser && (
            <div style={{
              background: 'rgba(92, 106, 196, 0.12)',
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

          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #5C6AC4, #5C6AC4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '36px'
            }}>
              📝
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>Quiz Master</h1>
            <p style={{ fontSize: '14px', color: '#94a3b8' }}>Test your vocabulary knowledge</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            marginBottom: '24px'
          }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#5C6AC4' }}>15</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Questions</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#5C6AC4' }}>+15</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>XP Each</div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0', display: 'block', marginBottom: '8px' }}>Select Difficulty</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              {['all', 'beginner', 'intermediate', 'advanced'].map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedCategory(d)}
                  style={{
                    padding: '8px',
                    borderRadius: '10px',
                    border: `2px solid ${selectedCategory === d ? '#5C6AC4' : 'rgba(255,255,255,0.08)'}`,
                    background: selectedCategory === d ? '#5C6AC4' : 'transparent',
                    color: selectedCategory === d ? 'white' : '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}
                >
                  {d === 'all' ? 'All' : d}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setGameState('playing')}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #5C6AC4, #5C6AC4)',
              color: 'white',
              border: 'none',
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            🚀 Start Quiz
          </button>
        </div>
      </div>
    );
  }

  // ===== PLAYING SCREEN =====
  if (gameState === 'playing') {
    if (!current) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#1E293B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ background: '#1E293B', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px' }}>📭</div>
            <h2 style={{ fontSize: '18px', color: 'white' }}>No Questions</h2>
            <button onClick={() => setGameState('intro')} style={{ marginTop: '16px', padding: '10px 24px', background: '#5C6AC4', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>Back</button>
          </div>
        </div>
      );
    }

    const letterLabels = ['A', 'B', 'C', 'D'];
    const difficultyColor = current.difficulty === 'advanced' ? '#ef4444' : 
                            current.difficulty === 'intermediate' ? '#f59e0b' : '#22c55e';

    return (
      <div style={{
        minHeight: '100vh',
        background: '#1E293B',
        padding: '20px',
        fontFamily: "'Poppins', -apple-system, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {showExitConfirm && <ExitConfirmModal />}

        {/* HEADER */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '720px',
          width: '100%',
          marginBottom: '24px',
          padding: '8px 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ 
              fontSize: '24px', 
              fontWeight: '800', 
              color: 'white',
              letterSpacing: '-0.5px'
            }}>
              📝 Quiz
            </span>
          </div>

          <button
            onClick={handleExitGame}
            style={{
              padding: '6px 20px',
              borderRadius: '8px',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              background: 'rgba(239, 68, 68, 0.08)',
              color: '#f87171',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
            }}
          >
            ✕ Exit
          </button>
        </div>

        {/* PROGRESS */}
        <div style={{
          maxWidth: '720px',
          width: '100%',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <span style={{
              padding: '4px 16px',
              borderRadius: '8px',
              background: `rgba(${current.difficulty === 'advanced' ? '239, 68, 68' : current.difficulty === 'intermediate' ? '245, 158, 11' : '34, 197, 94'}, 0.12)`,
              color: difficultyColor,
              fontSize: '12px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {current.difficulty}
            </span>
            <span style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              <span style={{ color: 'white', fontWeight: '700' }}>{score}</span>/{totalQuestions}
            </span>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px'
          }}>
            <span style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: '13px',
              fontWeight: '500'
            }}>
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <span style={{
              color: 'rgba(255,255,255,0.3)',
              fontSize: '13px',
              fontWeight: '500'
            }}>
              {Math.round(progress)}%
            </span>
          </div>

          <div style={{
            width: '100%',
            height: '4px',
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg, #5C6AC4, #5C6AC4)',
              width: `${progress}%`,
              transition: 'width 0.4s ease',
              borderRadius: '4px'
            }} />
          </div>
        </div>

        {/* QUESTION CARD */}
        <div style={{
          maxWidth: '720px',
          width: '100%',
          background: '#1E293B',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#5C6AC4',
            marginBottom: '16px',
            letterSpacing: '0.3px'
          }}>
            Question {currentIndex + 1}
          </div>

          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: 'white',
            marginBottom: '24px',
            lineHeight: '1.6'
          }}>
            {current.question}
          </h2>

          {/* OPTIONS */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            marginBottom: '20px'
          }}>
            {current.options.map((option, idx) => {
              let bgColor = 'rgba(255,255,255,0.03)';
              let borderColor = 'rgba(255,255,255,0.06)';
              let textColor = 'rgba(255,255,255,0.7)';
              let letterBg = 'rgba(255,255,255,0.05)';
              let letterColor = 'rgba(255,255,255,0.3)';

              if (answered) {
                if (idx === current.correct) {
                  bgColor = 'rgba(34, 197, 94, 0.1)';
                  borderColor = 'rgba(34, 197, 94, 0.25)';
                  textColor = '#4ade80';
                  letterBg = 'rgba(34, 197, 94, 0.15)';
                  letterColor = '#4ade80';
                } else if (idx === selectedAnswer && idx !== current.correct) {
                  bgColor = 'rgba(239, 68, 68, 0.1)';
                  borderColor = 'rgba(239, 68, 68, 0.25)';
                  textColor = '#f87171';
                  letterBg = 'rgba(239, 68, 68, 0.15)';
                  letterColor = '#f87171';
                } else {
                  bgColor = 'rgba(255,255,255,0.01)';
                  borderColor = 'rgba(255,255,255,0.03)';
                  textColor = 'rgba(255,255,255,0.2)';
                  letterBg = 'rgba(255,255,255,0.02)';
                  letterColor = 'rgba(255,255,255,0.15)';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={answered}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    border: `1px solid ${borderColor}`,
                    background: bgColor,
                    cursor: answered ? 'default' : 'pointer',
                    transition: 'all 0.2s ease',
                    width: '100%',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    if (!answered) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!answered) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                    }
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: letterBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: letterColor,
                    flexShrink: 0,
                    border: `1px solid ${answered && (idx === current.correct || idx === selectedAnswer) ? 'transparent' : 'rgba(255,255,255,0.05)'}`
                  }}>
                    {letterLabels[idx]}
                  </div>

                  <span style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: textColor,
                    flex: 1
                  }}>
                    {option}
                  </span>

                  {answered && idx === current.correct && (
                    <span style={{ fontSize: '18px', color: '#4ade80' }}>✓</span>
                  )}
                  {answered && idx === selectedAnswer && idx !== current.correct && (
                    <span style={{ fontSize: '18px', color: '#f87171' }}>✗</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div style={{
              padding: '10px 16px',
              borderRadius: '10px',
              background: feedbackMessage.includes('✅') ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
              border: `1px solid ${feedbackMessage.includes('✅') ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)'}`,
              marginBottom: '16px',
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: '500',
              color: feedbackMessage.includes('✅') ? '#4ade80' : '#f87171'
            }}>
              {feedbackMessage}
            </div>
          )}

          {/* Next Button */}
          {answered && (
            <button
              onClick={handleNext}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #5C6AC4, #5C6AC4)',
                color: 'white',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              {currentIndex === filteredQuizzes.length - 1 ? '🏆 Finish Quiz' : 'Next Question →'}
            </button>
          )}
        </div>

        {/* Streak Display */}
        {streak >= 2 && (
          <div style={{
            marginTop: '16px',
            padding: '6px 20px',
            borderRadius: '8px',
            background: 'rgba(251, 191, 36, 0.1)',
            color: '#fbbf24',
            fontSize: '13px',
            fontWeight: '600'
          }}>
            🔥 {streak} streak!
          </div>
        )}
      </div>
    );
  }

  // ===== FINISHED SCREEN =====
  if (gameState === 'finished') {
    const percentage = Math.round((score / filteredQuizzes.length) * 100);
    const isPerfect = score === filteredQuizzes.length;

    return (
      <div style={{
        minHeight: '100vh',
        background: '#1E293B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: "'Poppins', -apple-system, sans-serif"
      }}>
        <div style={{
          maxWidth: '420px',
          width: '100%',
          background: '#1E293B',
          borderRadius: '24px',
          padding: '40px',
          textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '8px' }}>
            {isPerfect ? '🏆' : '🎉'}
          </div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: isPerfect ? '#fbbf24' : 'white',
            marginBottom: '4px'
          }}>
            {isPerfect ? 'Perfect Score!' : 'Great Job!'}
          </h2>
          <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '20px' }}>
            You scored {score} out of {filteredQuizzes.length}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '24px' }}>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px' }}>
              <div style={{ fontSize: '22px', fontWeight: '700', color: '#5C6AC4' }}>{score}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Correct</div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px' }}>
              <div style={{ fontSize: '22px', fontWeight: '700', color: '#5C6AC4' }}>{percentage}%</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Score</div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px' }}>
              <div style={{ fontSize: '22px', fontWeight: '700', color: '#5C6AC4' }}>🔥{streak}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Streak</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
            <button
              onClick={handleRestart}
              style={{
                padding: '12px',
                background: 'linear-gradient(135deg, #5C6AC4, #5C6AC4)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              🔄 Play Again
            </button>
            <button
              onClick={onBack}
              style={{
                padding: '12px',
                background: 'transparent',
                color: '#94a3b8',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
              }}
            >
              More Games
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default QuizGame;