// src/components/dashboard/SentenceBuilder.jsx

import React, { useState, useEffect } from 'react';
import useSound from '../../hooks/useSound';
import { updateUserStats } from '../../services/firebaseService'; // ✅ ADDED
import { auth } from '../../pages/firebase'; // ✅ ADDED
import { onAuthStateChanged } from 'firebase/auth'; // ✅ ADDED

const SentenceBuilder = ({ onBack, updateProgress }) => {
  const [gameState, setGameState] = useState('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedWord, setSelectedWord] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [streak, setStreak] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

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
        console.log('✅ SentenceBuilder: User loaded:', user.uid, user.email);
      } else {
        setCurrentUser(null);
        setIsUserLoaded(true);
        console.log('❌ SentenceBuilder: No user logged in');
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
    const totalQuestions = sentences.length;
    const pointsEarned = score * 10; // 10 points per correct

    const gameData = {
      gameType: 'sentenceBuilder',
      pointsEarned: pointsEarned,
      newWordsLearned: score, // Each correct = new word learned
      correctAnswers: score,
      totalQuestions: totalQuestions,
      won: isWin || score >= totalQuestions / 2,
      score: score,
      isPerfect: isPerfect || score === totalQuestions
    };

    try {
      console.log('💾 Saving SentenceBuilder game to Firebase...');
      const result = await updateUserStats(userId, gameData);
      
      if (result.achievements && result.achievements.length > 0) {
        console.log('🏆 New Achievements Unlocked:', result.achievements);
        setFeedbackMessage(`🏆 New Achievements: ${result.achievements.join(', ')} 🎉`);
        setShowFeedback(true);
        setTimeout(() => setShowFeedback(false), 5000);
      }
      
      console.log('✅ SentenceBuilder game saved to Firebase successfully!');
    } catch (error) {
      console.error('❌ Error saving to Firebase:', error);
    }
  };

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
    { id: 'all', name: 'All Sentences', icon: '📝', color: '#5C6AC4' },
    { id: 'collaboration', name: 'Collaboration', icon: '🤝', color: '#ff6b6b' },
    { id: 'analysis', name: 'Analysis', icon: '🔍', color: '#4ecdc4' },
    { id: 'participation', name: 'Participation', icon: '🎯', color: '#ff9f4b' },
    { id: 'focus', name: 'Focus', icon: '⚡', color: '#5C6AC4' },
    { id: 'summary', name: 'Summary', icon: '📋', color: '#a06cd5' },
  ];

  const allSentences = [
    { id: 1, sentence: "To succeed in group projects, you need to ______ with your classmates.", correct: "Collaborate", options: UNIFIED_VOCABULARY.slice(4, 8).map(w => w.word), hint: 'Work together with others', category: 'collaboration', difficulty: 'beginner' },
    { id: 2, sentence: "Before making conclusions, you should ______ all the evidence carefully.", correct: "Analyze", options: UNIFIED_VOCABULARY.slice(2, 6).map(w => w.word), hint: 'Examine something in detail', category: 'analysis', difficulty: 'intermediate' },
    { id: 3, sentence: "In class discussions, it's important to ______ actively.", correct: "Participate", options: UNIFIED_VOCABULARY.slice(0, 4).map(w => w.word), hint: 'Take part in activities', category: 'participation', difficulty: 'beginner' },
    { id: 4, sentence: "When studying, you should ______ on one task at a time.", correct: "Concentrate", options: UNIFIED_VOCABULARY.slice(1, 5).map(w => w.word), hint: 'Focus all your attention', category: 'focus', difficulty: 'beginner' },
    { id: 5, sentence: "At the end of a chapter, you should ______ what you learned.", correct: "Summarize", options: UNIFIED_VOCABULARY.slice(2, 6).map(w => w.word), hint: 'Give a brief statement of main points', category: 'summary', difficulty: 'intermediate' },
    { id: 6, sentence: "The scientist will ______ the results to find patterns.", correct: "Analyze", options: UNIFIED_VOCABULARY.slice(2, 6).map(w => w.word), hint: 'Examine data', category: 'analysis', difficulty: 'intermediate' },
    { id: 7, sentence: "Team members must ______ effectively to complete the project.", correct: "Collaborate", options: UNIFIED_VOCABULARY.slice(4, 8).map(w => w.word), hint: 'Work as a team', category: 'collaboration', difficulty: 'beginner' },
    { id: 8, sentence: "Please ______ in the class discussion by sharing your ideas.", correct: "Participate", options: UNIFIED_VOCABULARY.slice(0, 4).map(w => w.word), hint: 'Join the conversation', category: 'participation', difficulty: 'beginner' },
    { id: 9, sentence: "To do well on the test, you need to ______ during the lecture.", correct: "Concentrate", options: UNIFIED_VOCABULARY.slice(1, 5).map(w => w.word), hint: 'Pay attention', category: 'focus', difficulty: 'beginner' },
    { id: 10, sentence: "Can you ______ the main points of the article in a few sentences?", correct: "Summarize", options: UNIFIED_VOCABULARY.slice(2, 6).map(w => w.word), hint: 'Briefly restate', category: 'summary', difficulty: 'intermediate' }
  ].map((sentence) => {
    if (!sentence.options.includes(sentence.correct)) sentence.options[0] = sentence.correct;
    sentence.options = sentence.options.sort(() => Math.random() - 0.5);
    return sentence;
  });

  const sentences = selectedCategory === 'all' ? allSentences : allSentences.filter(s => s.category === selectedCategory);
  const current = sentences[currentIndex];
  const progress = sentences.length > 0 ? ((currentIndex + 1) / sentences.length) * 100 : 0;

  const handleAnswer = (word) => {
    if (!answered && current) {
      setSelectedWord(word);
      setAnswered(true);

      const isCorrect = word === current.correct;
      if (isCorrect) {
        playCorrect();
        setScore(score + 1);
        setStreak(streak + 1);
        setFeedbackMessage('✅ Correct! Great job!');
      } else {
        playWrong();
        setStreak(0);
        setFeedbackMessage(`❌ Oops! The correct word is "${current.correct}"`);
      }
      
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 2000);

      const savedProgress = localStorage.getItem('vocaboplay_progress');
      const currentProgress = savedProgress ? JSON.parse(savedProgress) : null;

      if (currentProgress && updateProgress) {
        const updates = {
          totalAnswers: (currentProgress.totalAnswers || 0) + 1,
          SentenceBuilder: {
            ...currentProgress.SentenceBuilder,
            totalSentences: (currentProgress.SentenceBuilder?.totalSentences || 0) + 1,
            correctAnswers: isCorrect ? (currentProgress.SentenceBuilder?.correctAnswers || 0) + 1 : (currentProgress.SentenceBuilder?.correctAnswers || 0)
          }
        };
        if (isCorrect) {
          updates.correctAnswers = (currentProgress.correctAnswers || 0) + 1;
          updates.totalPoints = (currentProgress.totalPoints || 0) + 10;
          updates.xp = (currentProgress.xp || 0) + 5;
          updates.wordsLearned = (currentProgress.wordsLearned || 0) + 1;
        }
        updateProgress(updates);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < sentences.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setAnswered(false);
      setSelectedWord(null);
    } else {
      setGameState('finished');
      
      const isPerfect = score === sentences.length;
      
      if (isPerfect) {
        playVictory();
      }

      // ✅ Save to Firebase
      saveGameToFirebase(true, isPerfect);
      
      const savedProgress = localStorage.getItem('vocaboplay_progress');
      const currentProgress = savedProgress ? JSON.parse(savedProgress) : null;
      
      if (currentProgress && updateProgress) {
        const updates = {
          gamesPlayed: (currentProgress.gamesPlayed || 0) + 1,
          sentenceBuilder: {
            ...currentProgress.sentenceBuilder,
            gamesCompleted: (currentProgress.sentenceBuilder?.gamesCompleted || 0) + 1,
            bestScore: Math.max(currentProgress.sentenceBuilder?.bestScore || 0, score)
          }
        };
        if (isPerfect) {
          updates.achievements = { ...currentProgress.achievements, perfectScore: true };
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
    setSelectedWord(null);
    setStreak(0);
  };

  // ===== EXIT HANDLER =====
  const handleExit = () => {
    if (gameState === 'playing' && score > 0) {
      saveGameToFirebase(false, false);
    }
    if (onBack) onBack();
  };

  // ===== LOADING SCREEN =====
  if (!isUserLoaded) {
    return (
      <div className="sentence-container" style={{ fontFamily: "'Poppins', sans-serif", maxWidth: '500px', margin: '0 auto', padding: '24px' }}>
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
      <div className="sentence-container" style={{ fontFamily: "'Poppins', sans-serif", maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
        <style>{`
          /* ===== MOBILE RESPONSIVE FOR SENTENCE BUILDER ===== */
          @media (max-width: 768px) {
            .sentence-container {
              padding: 16px !important;
            }
            .sentence-category-grid {
              grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)) !important;
              gap: 6px !important;
            }
            .sentence-title {
              font-size: 22px !important;
            }
            .sentence-intro-card {
              padding: 20px !important;
            }
          }
          @media (max-width: 480px) {
            .sentence-container {
              padding: 12px !important;
            }
            .sentence-title {
              font-size: 18px !important;
            }
            .sentence-category-grid {
              grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)) !important;
            }
            .sentence-category-grid button {
              padding: 8px !important;
              font-size: 12px !important;
            }
            .sentence-category-grid button span:first-child {
              font-size: 20px !important;
            }
            .sentence-intro-card {
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

        <div className="sentence-intro-card" style={{ background: '#ffffff', borderRadius: '16px', padding: '32px', marginBottom: '24px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px', color: '#5C6AC4' }}>📝</div>
          <h2 className="sentence-title" style={{ fontSize: '28px', fontWeight: '500', color: '#1E293B', marginBottom: '8px' }}>Welcome to Sentence Builder!</h2>
          <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.6', marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px' }}>Complete each sentence by choosing the correct vocabulary word. Practice using words in context.</p>
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '20px', marginBottom: '24px', border: '1px solid #E2E8F0', textAlign: 'left' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '500', color: '#5C6AC4', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>How to Play:</h3>
            <ul style={{ paddingLeft: '20px', fontSize: '13px', color: '#64748B', lineHeight: '1.8', margin: 0 }}><li>Choose a category below or practice with all sentences</li><li>Read the sentence and identify the missing word</li><li>Select the correct word from the options</li><li>Use the hint if you need help</li><li>Earn points for each correct answer!</li></ul>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '500', color: '#1E293B', marginBottom: '12px' }}>Choose a Category</h3>
          <div className="sentence-category-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
            {categories.map(category => {
              const count = category.id === 'all' ? allSentences.length : allSentences.filter(s => s.category === category.id).length;
              return (
                <button key={category.id} onClick={() => setSelectedCategory(category.id)} style={{ background: selectedCategory === category.id ? `${category.color}15` : '#ffffff', border: `1px solid ${selectedCategory === category.id ? category.color : '#E2E8F0'}`, borderRadius: '12px', padding: '12px', cursor: 'pointer' }}>
                  <span style={{ fontSize: '24px', display: 'block', marginBottom: '4px' }}>{category.icon}</span>
                  <span style={{ fontSize: '13px', fontWeight: '500', color: selectedCategory === category.id ? category.color : '#1E293B' }}>{category.name}</span>
                  <span style={{ fontSize: '11px', color: selectedCategory === category.id ? category.color : '#64748B', display: 'block', marginTop: '2px' }}>{count} {count === 1 ? 'sentence' : 'sentences'}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button onClick={() => { setGameState('playing'); setCurrentIndex(0); setScore(0); setAnswered(false); setSelectedWord(null); }} style={{ width: '100%', padding: '12px', background: '#5C6AC4', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>Start {selectedCategory === 'all' ? 'Game' : categories.find(c => c.id === selectedCategory)?.name || 'Game'}</button>
      </div>
    );
  }

  if (!current) {
    return (
      <div style={{ fontFamily: "'Poppins', sans-serif", maxWidth: '500px', margin: '0 auto', padding: '24px' }}>
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '40px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px', color: '#64748B' }}>📭</div>
          <h2 style={{ fontSize: '18px', fontWeight: '500', color: '#1E293B', marginBottom: '4px' }}>No Sentences Available</h2>
          <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px' }}>Try selecting a different category</p>
          <button onClick={() => setGameState('intro')} style={{ padding: '10px 24px', background: '#5C6AC4', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>Back to Categories</button>
        </div>
      </div>
    );
  }

  if (gameState === 'playing') {
    const currentCategory = categories.find(c => c.id === current.category) || categories[0];

    return (
      <div className="sentence-container" style={{ fontFamily: "'Poppins', sans-serif", maxWidth: '700px', margin: '0 auto', padding: '24px' }}>
        <style>{`
          @media (max-width: 768px) {
            .sentence-container {
              padding: 16px !important;
            }
            .sentence-options {
              grid-template-columns: 1fr !important;
            }
            .sentence-card {
              padding: 20px !important;
            }
            .sentence-text {
              font-size: 16px !important;
            }
            .sentence-header h1 {
              font-size: 18px !important;
            }
          }
          @media (max-width: 480px) {
            .sentence-container {
              padding: 12px !important;
            }
            .sentence-card {
              padding: 16px !important;
            }
            .sentence-text {
              font-size: 14px !important;
            }
            .sentence-options button {
              padding: 10px 14px !important;
              font-size: 13px !important;
            }
          }
        `}</style>

        <div className="sentence-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>
          <button onClick={handleExit} style={{ background: '#ffffff', border: '1px solid #E2E8F0', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#64748B' }}>Exit</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ fontSize: '22px', color: currentCategory.color }}>{currentCategory.icon}</span><h1 className="sentence-title" style={{ fontSize: '20px', fontWeight: '500', color: '#1E293B', margin: '0' }}>{currentCategory.name}</h1></div>
          <div style={{ fontSize: '14px', fontWeight: '500', background: '#EEF0FB', color: '#5C6AC4', padding: '6px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>🔥 {streak} | 🎯 {score}/{sentences.length}</div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px', color: '#64748B' }}><span>Sentence {currentIndex + 1} of {sentences.length}</span><span>{Math.round(progress)}%</span></div>
          <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '8px', overflow: 'hidden' }}><div style={{ height: '100%', background: '#5C6AC4', width: `${progress}%`, transition: 'width 0.3s ease', borderRadius: '8px' }} /></div>
        </div>

        {showFeedback && <div style={{ padding: '10px', borderRadius: '8px', background: feedbackMessage.includes('✅') ? '#f0fdf4' : '#fef2f2', border: `1px solid ${feedbackMessage.includes('✅') ? '#bbf7d0' : '#fecaca'}`, marginBottom: '16px', textAlign: 'center', fontSize: '14px', color: feedbackMessage.includes('✅') ? '#166534' : '#991b1b' }}>{feedbackMessage}</div>}

        <div className="sentence-card" style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '500', background: current.difficulty === 'beginner' ? '#e8f5e9' : current.difficulty === 'intermediate' ? '#fff4e5' : '#ffebee', color: current.difficulty === 'beginner' ? '#2e7d32' : current.difficulty === 'intermediate' ? '#b85c1a' : '#b91c1c' }}>{current.difficulty}</span>
            <span style={{ padding: '4px 12px', background: '#EEF0FB', borderRadius: '12px', fontSize: '12px', color: '#5C6AC4', fontWeight: '500' }}>{currentCategory.name}</span>
          </div>

          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '24px', marginBottom: '16px', border: '1px solid #E2E8F0' }}>
              <h2 className="sentence-text" style={{ fontSize: '18px', fontWeight: '500', color: '#1E293B', lineHeight: '1.6', margin: 0 }}>{current.sentence}</h2>
            </div>
          </div>

          <div style={{ marginBottom: '20px', padding: '12px', background: '#EEF0FB', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px', color: '#5C6AC4' }}>💡</span>
            <p style={{ fontSize: '13px', color: '#64748B', fontStyle: 'italic', margin: 0 }}><strong>Hint:</strong> {current.hint}</p>
          </div>

          <div className="sentence-options" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px' }}>
            {current.options.map((option, idx) => {
              let bgColor = '#ffffff', borderColor = '#E2E8F0', textColor = '#1E293B';
              if (answered) {
                if (option === current.correct) { bgColor = '#f0fdf4'; borderColor = '#4ade80'; textColor = '#166534'; }
                else if (option === selectedWord && option !== current.correct) { bgColor = '#fef2f2'; borderColor = '#fecaca'; textColor = '#991b1b'; }
              }
              return (
                <button key={idx} onClick={() => handleAnswer(option)} disabled={answered} style={{ padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '12px', background: bgColor, fontSize: '14px', fontWeight: '400', color: textColor, cursor: answered ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{option}</span>
                  {answered && option === current.correct && <span style={{ color: '#22c55e', fontSize: '18px' }}>✓</span>}
                  {answered && option === selectedWord && option !== current.correct && <span style={{ color: '#ef4444', fontSize: '18px' }}>✗</span>}
                </button>
              );
            })}
          </div>

          {answered && <button onClick={handleNext} style={{ width: '100%', padding: '12px', background: '#5C6AC4', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>{currentIndex === sentences.length - 1 ? 'Finish Game' : 'Next Sentence'}</button>}
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    const percentage = Math.round((score / sentences.length) * 100);
    return (
      <div style={{ fontFamily: "'Poppins', sans-serif", maxWidth: '500px', margin: '0 auto', padding: '24px' }}>
        <style>{`
          @media (max-width: 480px) {
            .sentence-container {
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
          <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '20px' }}>You scored {score} out of {sentences.length}</p>
          <div style={{ width: '120px', height: '120px', margin: '0 auto 20px', borderRadius: '50%', background: `conic-gradient(#5C6AC4 0% ${percentage}%, #E2E8F0 ${percentage}% 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '500', color: '#5C6AC4' }}>{percentage}%</div>
          </div>
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', marginBottom: '24px', border: '1px solid #E2E8F0' }}>
            <p style={{ fontSize: '14px', color: '#64748B', margin: 0, lineHeight: '1.5' }}>{score === sentences.length ? 'Amazing! You got all sentences right! 🏆' : score >= sentences.length / 2 ? 'Great work! Keep practicing to improve! 👍' : 'Good start! Practice makes perfect! 💪'}</p>
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

export default SentenceBuilder;