// src/components/AdminDashboard.jsx
// ============================================================
// ✅ ADMIN DASHBOARD - Updated with Teacher-Only Student Filter
// Shows only students who joined THIS teacher's activities
// ============================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../pages/firebase';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  deleteDoc
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';

// Import admin components
import AdminSidebar from './admin/AdminSidebar';
import AdminOverview from './admin/AdminOverview';
import AdminStudents from './admin/AdminStudents';
import AdminActivities from './admin/AdminActivities';
import AdminWords from './admin/AdminWords';
import AdminLeaderboards from './admin/AdminLeaderboards';   // ✅ BAGO

// ✅ LIVE GAME COMPONENTS
import LiveHostLobby from './admin/LiveHostLobby';
import LiveHostGame from './admin/LiveHostGame';
import LiveHostResults from './admin/LiveHostResults';

import { fontFamily } from './dashboard/dashboardStyles';

// ===== BRAND PALETTE (matches Landing) =====
const palette = {
  darkPurple: '#7C4DFF',
  violetDeep: '#5B34B8',
  purple: '#8B5CF6',
  softPurple: '#A78BFA',
  violetPale: '#F1ECFF',
  pastelViolet: '#F3EEFF',
  heading: '#2d2a5e',
  body: '#3d3a6b',
  white: '#FFFFFF',
  border: '#EDE7FB',
  lightGray: '#F0EFEF',
};

const chunkyButton = (bg, shadowColor) => ({
  background: bg,
  color: '#ffffff',
  border: '2px solid rgba(255,255,255,0.6)',
  borderRadius: '14px',
  fontWeight: '800',
  cursor: 'pointer',
  boxShadow: `0 4px 0 ${shadowColor}, 0 6px 14px rgba(45,42,94,0.18)`,
  transition: 'transform 0.12s ease, box-shadow 0.12s ease',
  fontFamily: "'Fredoka', sans-serif",
});
const pressBtn = (e, shadowColor) => {
  e.currentTarget.style.transform = 'translateY(3px)';
  e.currentTarget.style.boxShadow = `0 1px 0 ${shadowColor}, 0 3px 8px rgba(45,42,94,0.15)`;
};
const releaseBtn = (e, shadowColor) => {
  e.currentTarget.style.transform = 'translateY(0)';
  e.currentTarget.style.boxShadow = `0 4px 0 ${shadowColor}, 0 6px 14px rgba(45,42,94,0.18)`;
};

// ============================================================
// ===== CREATE ACTIVITY MODAL =====
// ============================================================
const CreateActivityModal = ({ onClose, onCreated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [words, setWords] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);
  const [customQuestions, setCustomQuestions] = useState([]);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [step, setStep] = useState(1);
  const [questionSource, setQuestionSource] = useState('generate');

  const [customForm, setCustomForm] = useState({
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A'
  });

  const [formData, setFormData] = useState({
    title: '',
    gameType: 'quiz',
    questionCount: 10,
    difficulty: 3,
    category: ''
  });

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'words'));
        const wordsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setWords(wordsData);
      } catch (error) {
        console.error('Error fetching words:', error);
      }
    };
    fetchWords();
  }, []);

  const toggleWord = (word) => {
    const index = selectedWords.findIndex(w => w.id === word.id);
    if (index > -1) {
      setSelectedWords(selectedWords.filter((_, i) => i !== index));
    } else {
      if (selectedWords.length >= formData.questionCount) {
        setError(`You can only select up to ${formData.questionCount} words`);
        return;
      }
      setSelectedWords([...selectedWords, word]);
      setError('');
    }
  };

  const generateQuestions = () => {
    if (selectedWords.length === 0) {
      setError('Please select at least one word');
      return;
    }

    const shuffled = [...selectedWords].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(formData.questionCount, shuffled.length));

    const questions = selected.map((word) => {
      const otherWords = words.filter(w => w.id !== word.id);
      const shuffledOthers = [...otherWords].sort(() => Math.random() - 0.5);
      const wrongOptions = shuffledOthers.slice(0, 3).map(w => w.definition);

      while (wrongOptions.length < 3) {
        wrongOptions.push('None of the above');
      }

      const options = [word.definition, ...wrongOptions];
      const shuffledOptions = options.sort(() => Math.random() - 0.5);

      return {
        type: 'generated',
        wordId: word.id,
        word: word.word,
        question: `What is the meaning of "${word.word}"?`,
        options: shuffledOptions,
        correctAnswer: word.definition,
        difficulty: word.difficulty || 3,
        category: word.category || 'general'
      };
    });

    setGeneratedQuestions(questions);
    setStep(3);
  };

  const addCustomQuestion = () => {
    if (!customForm.question.trim()) {
      setError('Please enter a question');
      return;
    }
    if (!customForm.optionA.trim() || !customForm.optionB.trim()) {
      setError('Please enter at least options A and B');
      return;
    }

    const options = [
      customForm.optionA.trim(),
      customForm.optionB.trim(),
      customForm.optionC.trim() || 'None of the above',
      customForm.optionD.trim() || 'None of the above'
    ];

    const correctIndex = customForm.correctAnswer.charCodeAt(0) - 65;
    const correctAnswer = options[correctIndex] || options[0];

    const newQuestion = {
      type: 'custom',
      id: Date.now(),
      question: customForm.question.trim(),
      options: options,
      correctAnswer: correctAnswer,
      difficulty: formData.difficulty || 3,
      category: formData.category || 'custom',
      wordId: null,
      word: ''
    };

    setCustomQuestions([...customQuestions, newQuestion]);

    setCustomForm({
      question: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A'
    });
    setError('');
  };

  const removeCustomQuestion = (index) => {
    setCustomQuestions(customQuestions.filter((_, i) => i !== index));
  };

  const getAllQuestions = () => {
    return [...generatedQuestions, ...customQuestions];
  };

  const handlePublish = async () => {
    if (!formData.title) {
      setError('Please enter an activity title');
      return;
    }

    const allQuestions = getAllQuestions();
    if (allQuestions.length === 0) {
      setError('Please add at least one question');
      return;
    }

    setLoading(true);
    setError('');

    const pin = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      const user = auth.currentUser;

      const formattedQuestions = allQuestions.map(q => ({
        type: q.type || 'generated',
        wordId: q.wordId || null,
        word: q.word || '',
        question: q.question || '',
        options: q.options || [],
        correctAnswer: q.correctAnswer || '',
        difficulty: q.difficulty || 3,
        category: q.category || 'general'
      }));

      const activityData = {
        title: formData.title.trim(),
        teacherId: user.uid,
        teacherName: user.displayName || user.username || 'Teacher',
        gameType: formData.gameType,
        gamePin: pin,
        questions: formattedQuestions,
        totalQuestions: formattedQuestions.length,
        difficulty: formData.difficulty,
        category: formData.category || 'general',
        isActive: true,
        participants: 0,
        createdAt: new Date().toISOString(),
        hasCustomQuestions: customQuestions.length > 0
      };

      await addDoc(collection(db, 'activities'), activityData);

      onCreated();
      onClose();
      alert(`✅ Activity published! PIN: ${pin} | Questions: ${formattedQuestions.length}`);
    } catch (error) {
      console.error('❌ Error publishing activity:', error);
      setError('Failed to publish activity: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(words.map(w => w.category).filter(Boolean))];

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button style={styles.modalClose} onClick={onClose}>✕</button>
        <h2 style={styles.modalTitle}>🎮 Create Activity</h2>

        {error && <div style={styles.errorMessage}>{error}</div>}

        {step === 1 && (
          <>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Activity Title *</label>
              <input
                type="text"
                placeholder="e.g., Vocabulary Quiz #1"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Game Type</label>
              <select
                value={formData.gameType}
                onChange={(e) => setFormData({ ...formData, gameType: e.target.value })}
                style={styles.select}
              >
                <option value="quiz">📝 Quiz Master</option>
                <option value="match">🎯 Match Game</option>
                <option value="wordpics">🖼️ Word Pics</option>
              </select>
            </div>

            <div style={styles.row}>
              <div style={{ flex: 1, marginRight: '8px' }}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Questions</label>
                  <select
                    value={formData.questionCount}
                    onChange={(e) => setFormData({ ...formData, questionCount: Number(e.target.value) })}
                    style={styles.select}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                  </select>
                </div>
              </div>
              <div style={{ flex: 1, marginLeft: '8px' }}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: Number(e.target.value) })}
                    style={styles.select}
                  >
                    <option value={1}>⭐ Beginner</option>
                    <option value={2}>⭐⭐ Easy</option>
                    <option value={3}>⭐⭐⭐ Intermediate</option>
                    <option value={4}>⭐⭐⭐⭐ Advanced</option>
                    <option value={5}>⭐⭐⭐⭐⭐ Expert</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Category (optional)</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={styles.select}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <button
              style={styles.nextBtn}
              onClick={() => setStep(2)}
              onMouseDown={e => pressBtn(e, palette.violetDeep)}
              onMouseUp={e => releaseBtn(e, palette.violetDeep)}
              onMouseLeave={e => releaseBtn(e, palette.violetDeep)}
            >
              Next →
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <button style={styles.backBtn} onClick={() => setStep(1)}>← Back</button>

            <div style={styles.tabContainer}>
              <button
                style={{
                  ...styles.tabBtn,
                  ...(questionSource === 'generate' ? styles.tabActive : {})
                }}
                onClick={() => setQuestionSource('generate')}
              >
                📚 Generate from Library
              </button>
              <button
                style={{
                  ...styles.tabBtn,
                  ...(questionSource === 'custom' ? styles.tabActive : {})
                }}
                onClick={() => setQuestionSource('custom')}
              >
                ✏️ Add Custom Question
              </button>
            </div>

            {questionSource === 'generate' && (
              <>
                <div style={styles.wordFilters}>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={styles.filterSelect}
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: Number(e.target.value) })}
                    style={styles.filterSelect}
                  >
                    <option value={0}>All Difficulties</option>
                    <option value={1}>⭐ Beginner</option>
                    <option value={2}>⭐⭐ Easy</option>
                    <option value={3}>⭐⭐⭐ Intermediate</option>
                    <option value={4}>⭐⭐⭐⭐ Advanced</option>
                    <option value={5}>⭐⭐⭐⭐⭐ Expert</option>
                  </select>
                </div>

                <div style={styles.wordGrid}>
                  {words
                    .filter(w => {
                      if (formData.category && w.category !== formData.category) return false;
                      if (formData.difficulty && w.difficulty !== formData.difficulty) return false;
                      return true;
                    })
                    .slice(0, 50)
                    .map(word => {
                      const isSelected = selectedWords.some(w => w.id === word.id);
                      return (
                        <div
                          key={word.id}
                          style={{
                            ...styles.wordCard,
                            ...(isSelected ? styles.wordCardSelected : {})
                          }}
                          onClick={() => toggleWord(word)}
                        >
                          <div style={styles.wordCardWord}>{word.word}</div>
                          <div style={styles.wordCardDefinition}>{word.definition}</div>
                          {isSelected && <span style={styles.wordCardCheck}>✅</span>}
                        </div>
                      );
                    })}
                </div>

                <div style={styles.wordStats}>
                  <span>Selected: <strong>{selectedWords.length}</strong> / {formData.questionCount}</span>
                </div>

                <button
                  style={styles.nextBtn}
                  onClick={generateQuestions}
                  disabled={selectedWords.length === 0}
                  onMouseDown={e => selectedWords.length > 0 && pressBtn(e, palette.violetDeep)}
                  onMouseUp={e => selectedWords.length > 0 && releaseBtn(e, palette.violetDeep)}
                  onMouseLeave={e => selectedWords.length > 0 && releaseBtn(e, palette.violetDeep)}
                >
                  Generate Questions →
                </button>
              </>
            )}

            {questionSource === 'custom' && (
              <div style={styles.customSection}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Question *</label>
                  <input
                    type="text"
                    placeholder="Enter your question"
                    value={customForm.question}
                    onChange={(e) => setCustomForm({ ...customForm, question: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.row}>
                  <div style={{ flex: 1, marginRight: '8px' }}>
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Option A *</label>
                      <input
                        type="text"
                        placeholder="Option A"
                        value={customForm.optionA}
                        onChange={(e) => setCustomForm({ ...customForm, optionA: e.target.value })}
                        style={styles.input}
                      />
                    </div>
                  </div>
                  <div style={{ flex: 1, marginLeft: '8px' }}>
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Option B *</label>
                      <input
                        type="text"
                        placeholder="Option B"
                        value={customForm.optionB}
                        onChange={(e) => setCustomForm({ ...customForm, optionB: e.target.value })}
                        style={styles.input}
                      />
                    </div>
                  </div>
                </div>

                <div style={styles.row}>
                  <div style={{ flex: 1, marginRight: '8px' }}>
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Option C</label>
                      <input
                        type="text"
                        placeholder="Option C (optional)"
                        value={customForm.optionC}
                        onChange={(e) => setCustomForm({ ...customForm, optionC: e.target.value })}
                        style={styles.input}
                      />
                    </div>
                  </div>
                  <div style={{ flex: 1, marginLeft: '8px' }}>
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Option D</label>
                      <input
                        type="text"
                        placeholder="Option D (optional)"
                        value={customForm.optionD}
                        onChange={(e) => setCustomForm({ ...customForm, optionD: e.target.value })}
                        style={styles.input}
                      />
                    </div>
                  </div>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Correct Answer *</label>
                  <select
                    value={customForm.correctAnswer}
                    onChange={(e) => setCustomForm({ ...customForm, correctAnswer: e.target.value })}
                    style={styles.select}
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>

                <button
                  style={styles.addCustomBtn}
                  onClick={addCustomQuestion}
                  onMouseDown={e => pressBtn(e, '#2E7D32')}
                  onMouseUp={e => releaseBtn(e, '#2E7D32')}
                  onMouseLeave={e => releaseBtn(e, '#2E7D32')}
                >
                  ➕ Add Question
                </button>

                {customQuestions.length > 0 && (
                  <div style={styles.customList}>
                    <h4 style={styles.customListTitle}>Your Custom Questions ({customQuestions.length})</h4>
                    {customQuestions.map((q, index) => (
                      <div key={q.id || index} style={styles.customItem}>
                        <div style={styles.customItemHeader}>
                          <span style={styles.customItemNumber}>#{index + 1}</span>
                          <span style={styles.customItemQuestion}>{q.question}</span>
                          <button
                            style={styles.removeCustomBtn}
                            onClick={() => removeCustomQuestion(index)}
                          >
                            ✕
                          </button>
                        </div>
                        <div style={styles.customItemOptions}>
                          {q.options.map((opt, i) => (
                            <div
                              key={i}
                              style={{
                                ...styles.customItemOption,
                                ...(opt === q.correctAnswer ? styles.customItemCorrect : {})
                              }}
                            >
                              {String.fromCharCode(65 + i)}. {opt}
                              {opt === q.correctAnswer && <span> ✅</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div style={styles.totalQuestions}>
              <span>
                Total Questions: <strong>{generatedQuestions.length + customQuestions.length}</strong>
              </span>
              {generatedQuestions.length > 0 && (
                <span>📚 Generated: {generatedQuestions.length}</span>
              )}
              {customQuestions.length > 0 && (
                <span>✏️ Custom: {customQuestions.length}</span>
              )}
            </div>

            <button
              style={styles.nextBtn}
              onClick={() => setStep(3)}
              disabled={generatedQuestions.length === 0 && customQuestions.length === 0}
              onMouseDown={e => (generatedQuestions.length > 0 || customQuestions.length > 0) && pressBtn(e, palette.violetDeep)}
              onMouseUp={e => releaseBtn(e, palette.violetDeep)}
              onMouseLeave={e => releaseBtn(e, palette.violetDeep)}
            >
              Preview & Publish →
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <button style={styles.backBtn} onClick={() => setStep(2)}>← Back</button>

            <div style={styles.previewStats}>
              <span>📝 {getAllQuestions().length} Questions</span>
              <span>📚 {formData.category || 'All Categories'}</span>
              <span>⭐ Level {formData.difficulty}</span>
              {customQuestions.length > 0 && (
                <span style={styles.customBadge}>✏️ {customQuestions.length} Custom</span>
              )}
            </div>

            <div style={styles.previewList}>
              {getAllQuestions().map((q, index) => (
                <div key={q.id || index} style={styles.previewQuestion}>
                  <div style={styles.previewQHeader}>
                    <span>Q{index + 1}: <strong>{q.question}</strong></span>
                    <span style={q.type === 'custom' ? styles.customTag : styles.generatedTag}>
                      {q.type === 'custom' ? '✏️ Custom' : '📚 Generated'}
                    </span>
                  </div>
                  <div style={styles.previewQOptions}>
                    {q.options.map((opt, i) => (
                      <div
                        key={i}
                        style={{
                          ...styles.previewQOption,
                          ...(opt === q.correctAnswer ? styles.previewQCorrect : {})
                        }}
                      >
                        {String.fromCharCode(65 + i)}. {opt}
                        {opt === q.correctAnswer && <span> ✅</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              style={styles.publishBtn}
              onClick={handlePublish}
              disabled={loading}
              onMouseDown={e => !loading && pressBtn(e, palette.violetDeep)}
              onMouseUp={e => !loading && releaseBtn(e, palette.violetDeep)}
              onMouseLeave={e => !loading && releaseBtn(e, palette.violetDeep)}
            >
              {loading ? 'Publishing...' : '📤 Publish Activity'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ============================================================
// ===== LIVE SCOREBOARD =====
// ============================================================
const TeacherLiveScoreboard = ({ activityId }) => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activityId) return;

    const q = query(collection(db, 'scores'), where('activityId', '==', activityId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const scoresData = [];
      snapshot.forEach((doc) => {
        scoresData.push({ id: doc.id, ...doc.data() });
      });
      scoresData.sort((a, b) => b.score - a.score);
      setScores(scoresData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activityId]);

  if (loading) return <div style={{ padding: '16px', textAlign: 'center', color: palette.body, fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>Loading scores...</div>;

  return (
    <div style={{ background: palette.pastelViolet, padding: '16px', borderRadius: '16px', border: `2px solid ${palette.border}` }}>
      <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 800, color: palette.heading, fontFamily: "'Fredoka', sans-serif" }}>📊 Live Scores</h3>
      {scores.length === 0 ? (
        <p style={{ color: palette.body, fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>No students have answered yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Nunito', sans-serif" }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${palette.border}` }}>
              <th style={{ padding: '8px', textAlign: 'left', color: palette.heading, fontFamily: "'Fredoka', sans-serif", fontSize: '13px' }}>Student</th>
              <th style={{ padding: '8px', textAlign: 'center', color: palette.heading, fontFamily: "'Fredoka', sans-serif", fontSize: '13px' }}>Score</th>
              <th style={{ padding: '8px', textAlign: 'right', color: palette.heading, fontFamily: "'Fredoka', sans-serif", fontSize: '13px' }}>Rank</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((score, index) => (
              <tr key={score.id} style={{ borderBottom: `1px solid ${palette.border}` }}>
                <td style={{ padding: '8px', fontWeight: 700, color: palette.heading }}>{score.studentName}</td>
                <td style={{ padding: '8px', textAlign: 'center', color: palette.darkPurple, fontWeight: 800 }}>{score.score}</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// ============================================================
// ===== MAIN ADMIN DASHBOARD =====
// ============================================================
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('Overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showCreateActivity, setShowCreateActivity] = useState(false);
  const [showScoresModal, setShowScoresModal] = useState(false);
  const [selectedActivityForScores, setSelectedActivityForScores] = useState(null);

  // ✅ LIVE GAME STATES
  const [liveActivity, setLiveActivity] = useState(null);
  const [liveSession, setLiveSession] = useState(null);
  const [liveView, setLiveView] = useState(null); // 'lobby' | 'game' | 'results'

  const [students, setStudents] = useState([]);
  const [games, setGames] = useState([]);
  const [words, setWords] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState({ students: true, games: true, words: true, activities: true });
  const [teacher, setTeacher] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const calculateAvgScore = (progress) => {
    if (!progress || !progress.totalAnswers || progress.totalAnswers === 0) return 0;
    return Math.round((progress.correctAnswers / progress.totalAnswers) * 100);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/admin');
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role !== 'admin' && userData.role !== 'super_admin') {
          navigate('/dashboard');
          return;
        }
        setTeacher({
          uid: user.uid,
          displayName: userData.displayName || user.email?.split('@')[0] || 'Admin',
          email: userData.email || user.email || '',
          role: userData.role,
          avatar: userData.avatar || '',
          gender: userData.gender || (user.email?.charAt(0) === 'm' ? 'male' : 'female'),
        });
      } else {
        setTeacher({
          uid: user.uid,
          displayName: user.displayName || user.email?.split('@')[0] || 'Admin',
          email: user.email || '',
          role: 'admin',
          avatar: '',
          gender: user.email?.charAt(0) === 'm' ? 'male' : 'female',
        });
      }

      fetchAllData();
    };

    checkAuth();
  }, [navigate]);

  // ============================================================
  // ✅ FETCH ALL DATA - TEACHER-SPECIFIC
  // ============================================================
  const fetchAllData = async () => {
    try {
      const user = auth.currentUser;

      // ✅ STEP 1: Kunin lahat ng activities ng teacher
      const activitiesSnapshot = await getDocs(
        query(collection(db, 'activities'), where('teacherId', '==', user.uid))
      );
      const activitiesData = [];
      const teacherActivityIds = [];
      activitiesSnapshot.forEach((doc) => {
        activitiesData.push({ id: doc.id, ...doc.data() });
        teacherActivityIds.push(doc.id);
      });
      setActivities(activitiesData);
      setLoading(prev => ({ ...prev, activities: false }));

      // ✅ STEP 2: Kunin lahat ng scores sa activities ng teacher
      let studentIds = [];
      if (teacherActivityIds.length > 0) {
        const scoresSnapshot = await getDocs(collection(db, 'scores'));
        scoresSnapshot.forEach((doc) => {
          const scoreData = doc.data();
          if (teacherActivityIds.includes(scoreData.activityId)) {
            if (!studentIds.includes(scoreData.studentId)) {
              studentIds.push(scoreData.studentId);
            }
          }
        });
      }

      // ✅ STEP 3: Kunin lang ang students na nag-quiz sa activities ng teacher
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const studentsData = usersSnapshot.docs
        .map(doc => {
          const data = doc.data();
          if (data.role === 'student' && studentIds.includes(doc.id)) {
            return {
              id: doc.id,
              ...data,
              displayName: data.displayName || data.email?.split('@')[0] || 'Unknown',
              avgScore: calculateAvgScore(data.progress),
              gamesPlayed: data.progress?.gamesPlayed || 0,
              joinDate: data.createdAt ? new Date(data.createdAt).toISOString().split('T')[0] : 'Unknown',
              progress: data.progress || {}
            };
          }
          return null;
        })
        .filter(student => student !== null);
      setStudents(studentsData);
      setLoading(prev => ({ ...prev, students: false }));

      // ✅ STEP 4: Kunin words at games
      const wordsSnapshot = await getDocs(collection(db, 'words'));
      const wordsData = wordsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWords(wordsData);
      setLoading(prev => ({ ...prev, words: false }));

      await initializeGames();

    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading({ students: false, games: false, words: false, activities: false });
    }
  };

  const initializeGames = async () => {
    try {
      const gamesSnapshot = await getDocs(collection(db, 'games'));
      if (gamesSnapshot.empty) {
        const defaultGames = [
          { id: 'wordpics', name: 'Word Pics', icon: '🖼️', description: 'Guess the word from the picture!', totalWords: 30, timesPlayed: 0, avgScore: 0, color: '#7C4DFF', category: 'vocab', difficulty: 'beginner', timeEstimate: '5-10 min', lastUpdated: new Date().toISOString() },
          { id: 'match', name: 'Match Game', icon: '🎯', description: 'Connect words with definitions', totalPairs: 6, timesPlayed: 0, avgScore: 0, color: '#8B5CF6', category: 'vocab', difficulty: 'beginner', timeEstimate: '3-5 min', lastUpdated: new Date().toISOString() },
          { id: 'quiz', name: 'Quiz Master', icon: '❓', description: 'Test your knowledge with multiple choice questions.', totalQuestions: 10, timesPlayed: 0, avgScore: 0, color: '#5B34B8', category: 'challenge', difficulty: 'intermediate', timeEstimate: '10-15 min', lastUpdated: new Date().toISOString() }
        ];
        for (const game of defaultGames) {
          await addDoc(collection(db, 'games'), game);
        }
        setGames(defaultGames);
      } else {
        const gamesData = gamesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setGames(gamesData);
      }
    } catch (error) {
      console.error('Error initializing games:', error);
    } finally {
      setLoading(prev => ({ ...prev, games: false }));
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('userType');
      localStorage.removeItem('userId');
      localStorage.removeItem('token');
      localStorage.removeItem('userProfile');
      localStorage.removeItem('vocaboplay_progress');
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
    }
  };

  // ============================================================
  // ✅ HOST LIVE GAME
  // ============================================================
  const handleHostLive = (activity) => {
    setLiveActivity(activity);
    setLiveView('lobby');
  };

  const handleLiveStart = (session) => {
    setLiveSession(session);
    setLiveView('game');
  };

  const handleLiveEnd = (session) => {
    setLiveSession(session);
    setLiveView('results');
  };

  const handleLiveExit = () => {
    setLiveActivity(null);
    setLiveSession(null);
    setLiveView(null);
    fetchAllData();
  };

  // ============================================================
  // ✅ SHOW SCORES
  // ============================================================
  const handleShowScores = (activity) => {
    setSelectedActivityForScores(activity);
    setShowScoresModal(true);
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'Overview':
        return (
          <AdminOverview
            students={students}
            games={games}
            words={words}
            activities={activities}
            setActiveMenu={setActiveMenu}
          />
        );
      case 'Students':
        return <AdminStudents students={students} setStudents={setStudents} loading={loading} calculateAvgScore={calculateAvgScore} />;
      case 'Activities':
        return (
          <AdminActivities
            activities={activities}
            setActivities={setActivities}
            loading={loading}
            onHostLive={handleHostLive}
            onShowScores={handleShowScores}
          />
        );
      case 'Words':
        return <AdminWords words={words} setWords={setWords} loading={loading} />;
      case 'Leaderboards':
        return <AdminLeaderboards />;
      default:
        return (
          <AdminOverview
            students={students}
            games={games}
            words={words}
            activities={activities}
            setActiveMenu={setActiveMenu}
          />
        );
    }
  };

  // ============================================================
  // ✅ RENDER LIVE GAME VIEWSs
  // ============================================================
  if (liveView === 'lobby' && liveActivity) {
    return (
      <LiveHostLobby
        activity={liveActivity}
        onStart={handleLiveStart}
        onCancel={handleLiveExit}
      />
    );
  }

  if (liveView === 'game' && liveSession) {
    return (
      <LiveHostGame
        session={liveSession}
        onEnd={handleLiveEnd}
      />
    );
  }

  if (liveView === 'results' && liveSession) {
    return (
      <LiveHostResults
        session={liveSession}
        onPlayAgain={handleLiveExit}
        onBackToDashboard={handleLiveExit}
      />
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;500;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Nunito', sans-serif; background: #F3EEFF; }

        .admin-hamburger {
          display: none;
          position: fixed;
          top: 12px;
          left: 12px;
          z-index: 1001;
          background: white;
          border: 2px solid #EDE7FB;
          border-radius: 10px;
          padding: 8px 12px;
          font-size: 20px;
          cursor: pointer;
          color: #7C4DFF;
          box-shadow: 0 3px 0 #EDE7FB;
        }

        .admin-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(45, 42, 94, 0.4);
          z-index: 998;
        }

        .admin-overlay.active { display: block; }

        @media (max-width: 768px) {
          .admin-hamburger { display: block !important; }
          .admin-sidebar {
            position: fixed !important;
            top: 0 !important;
            left: -280px !important;
            width: 280px !important;
            height: 100vh !important;
            z-index: 1000 !important;
            transition: left 0.3s ease !important;
          }
          .admin-sidebar.open { left: 0 !important; }
          .admin-main-content {
            margin-left: 0 !important;
            padding: 16px !important;
            padding-top: 70px !important;
          }
        }

        @media (min-width: 769px) {
          .admin-hamburger { display: none !important; }
          .admin-sidebar {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 260px !important;
            height: 100vh !important;
            z-index: 1000 !important;
          }
          .admin-main-content {
            margin-left: 260px !important;
            padding: 24px 32px !important;
          }
          .admin-overlay { display: none !important; }
        }
      `}</style>

      <div
        className={`admin-overlay ${isSidebarOpen ? 'active' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      <button
        className="admin-hamburger"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? '✕' : '☰'}
      </button>

      <div style={{ display: 'flex', minHeight: '100vh', background: palette.pastelViolet, fontFamily: "'Nunito', sans-serif" }}>
        <div className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <AdminSidebar
            activeMenu={activeMenu}
            setActiveMenu={(menu) => {
              setActiveMenu(menu);
              if (window.innerWidth <= 768) setIsSidebarOpen(false);
            }}
            handleLogout={handleLogout}
          />
        </div>

        <div className="admin-main-content" style={{
          flex: 1,
          padding: '24px 32px',
          overflowY: 'auto',
          fontFamily: "'Nunito', sans-serif",
          transition: 'margin-left 0.3s ease',
        }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '28px', gap: '15px', position: 'relative', flexWrap: 'wrap' }}>
            <div
              style={{ background: 'white', padding: '8px 16px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', border: `2px solid ${palette.border}`, fontFamily: "'Nunito', sans-serif", boxShadow: '0 3px 0 #EDE7FB' }}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', flexShrink: 0, background: teacher?.gender === 'male' ? '#4A90E2' : '#E24A7A' }}>
                {teacher?.avatar && teacher?.avatar !== '' ? (
                  <img src={teacher.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: 'white', fontWeight: '700', fontSize: '13px' }}>
                    {teacher?.gender === 'male' ? '♂' : '♀'}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: '0' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: palette.heading, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px', fontFamily: "'Fredoka', sans-serif" }}>
                  {teacher?.displayName || 'Admin'}
                </span>
                <span style={{ fontSize: '11px', color: palette.body, fontWeight: 600 }}>{teacher?.role || 'Admin'}</span>
              </div>
              <span style={{ fontSize: '10px', color: palette.body }}>▼</span>
            </div>

            {showProfileMenu && (
              <>
                <div onClick={() => setShowProfileMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 999 }} />
                <div style={{ position: 'absolute', top: '50px', right: '0', background: 'white', borderRadius: '14px', zIndex: 1000, minWidth: '250px', overflow: 'hidden', border: `2px solid ${palette.border}`, fontFamily: "'Nunito', sans-serif", boxShadow: '0 10px 30px rgba(124, 77, 255, 0.18)' }}>
                  <div style={{ padding: '12px 14px', background: palette.pastelViolet, borderBottom: `2px solid ${palette.border}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', background: teacher?.gender === 'male' ? '#4A90E2' : '#E24A7A' }}>
                      {teacher?.avatar && teacher?.avatar !== '' ? (
                        <img src={teacher.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>
                          {teacher?.gender === 'male' ? '♂' : '♀'}
                        </span>
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: palette.heading, fontFamily: "'Fredoka', sans-serif" }}>{teacher?.displayName || 'Admin'}</div>
                      <div style={{ fontSize: '11px', color: palette.body, fontWeight: 600 }}>{teacher?.email || 'No email on file'}</div>
                    </div>
                  </div>
                  <div style={{ padding: '4px' }}>
                    <button onClick={handleLogout} style={{ width: '100%', padding: '9px 12px', border: 'none', background: 'none', fontSize: '13px', cursor: 'pointer', textAlign: 'left', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', color: '#d32f2f', fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}>🚪 Logout</button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="admin-content-wrapper">
            {renderContent()}
          </div>
        </div>
      </div>

      {showCreateActivity && (
        <CreateActivityModal
          onClose={() => setShowCreateActivity(false)}
          onCreated={fetchAllData}
        />
      )}

      {showScoresModal && selectedActivityForScores && (
        <div style={styles.modalOverlay} onClick={() => setShowScoresModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.modalClose} onClick={() => setShowScoresModal(false)}>✕</button>
            <h2 style={styles.modalTitle}>📊 Scores for: {selectedActivityForScores.title}</h2>

            <TeacherLiveScoreboard activityId={selectedActivityForScores.id} />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                onClick={() => setShowScoresModal(false)}
                style={styles.publishBtn}
                onMouseDown={e => pressBtn(e, palette.violetDeep)}
                onMouseUp={e => releaseBtn(e, palette.violetDeep)}
                onMouseLeave={e => releaseBtn(e, palette.violetDeep)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ============================================================
// ===== STYLES =====
// ============================================================
const styles = {
  pageTitle: { fontSize: '24px', fontWeight: '800', color: palette.heading, marginBottom: '24px', fontFamily: "'Fredoka', sans-serif" },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard: { background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 6px 18px rgba(124, 77, 255, 0.10)', border: `2px solid ${palette.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center' },
  statNumber: { fontSize: '28px', fontWeight: '800', color: palette.heading, fontFamily: "'Fredoka', sans-serif" },
  statLabel: { fontSize: '13px', color: palette.body, fontFamily: "'Nunito', sans-serif", fontWeight: 600 },
  quickActions: { display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' },
  quickActionBtn: { ...chunkyButton('linear-gradient(135deg, #A78BFA 0%, #7C4DFF 100%)', palette.violetDeep), padding: '12px 24px', fontSize: '14px' },
  section: { marginBottom: '30px' },
  sectionTitle: { fontSize: '18px', fontWeight: 700, color: palette.heading, marginBottom: '16px', fontFamily: "'Fredoka', sans-serif" },
  activityGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' },
  activityCard: { background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 6px 18px rgba(124, 77, 255, 0.10)', border: `2px solid ${palette.border}` },
  activityHeader: { display: 'flex', gap: '12px', marginBottom: '12px' },
  activityIcon: { fontSize: '28px' },
  activityTitle: { fontSize: '15px', fontWeight: 700, color: palette.heading, margin: '0', fontFamily: "'Fredoka', sans-serif" },
  activityMeta: { fontSize: '12px', color: palette.body, margin: '2px 0 0 0', fontFamily: "'Nunito', sans-serif", fontWeight: 600 },
  pinCode: { color: palette.darkPurple, fontSize: '14px' },
  activityStats: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: palette.body, fontFamily: "'Nunito', sans-serif", fontWeight: 600 },
  activeBadge: { color: '#4CAF50', fontWeight: '700' },
  inactiveBadge: { color: '#f44336', fontWeight: '700' },
  customBadgeSmall: { fontSize: '10px', padding: '2px 8px', background: '#fff3e0', color: '#ff9800', borderRadius: '10px', display: 'inline-block', marginTop: '4px' },
  noData: { color: '#999', textAlign: 'center', padding: '20px' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(45, 42, 94, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' },
  modalContent: { background: 'white', borderRadius: '24px', padding: '32px', maxWidth: '660px', width: '90%', maxHeight: '85vh', overflowY: 'auto', position: 'relative', border: `2px solid ${palette.border}`, boxShadow: '0 20px 60px rgba(124, 77, 255, 0.25)' },
  modalClose: { position: 'absolute', top: '16px', right: '20px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: palette.body },
  modalTitle: { fontSize: '22px', fontWeight: 800, color: palette.heading, margin: '0 0 20px 0', fontFamily: "'Fredoka', sans-serif" },
  errorMessage: { padding: '12px 14px', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '12px', color: '#c33', fontSize: '13px', marginBottom: '16px', fontFamily: "'Nunito', sans-serif", fontWeight: 600 },
  fieldGroup: { marginBottom: '16px' },
  label: { fontSize: '13px', fontWeight: 700, color: palette.heading, display: 'block', marginBottom: '4px', fontFamily: "'Fredoka', sans-serif" },
  input: { width: '100%', padding: '12px 16px', border: `2px solid ${palette.border}`, borderRadius: '12px', fontSize: '14px', fontFamily: "'Nunito', sans-serif", fontWeight: 600, boxSizing: 'border-box', color: palette.heading, outline: 'none' },
  select: { width: '100%', padding: '12px 16px', border: `2px solid ${palette.border}`, borderRadius: '12px', fontSize: '14px', fontFamily: "'Nunito', sans-serif", fontWeight: 600, boxSizing: 'border-box', background: 'white', color: palette.heading, outline: 'none', cursor: 'pointer' },
  row: { display: 'flex', gap: '16px' },
  nextBtn: { width: '100%', padding: '14px', ...chunkyButton('linear-gradient(135deg, #A78BFA 0%, #7C4DFF 100%)', palette.violetDeep), fontSize: '16px', marginTop: '12px' },
  backBtn: { padding: '8px 16px', background: palette.violetPale, border: `2px solid ${palette.border}`, borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontFamily: "'Fredoka', sans-serif", fontWeight: 700, color: palette.darkPurple, marginBottom: '16px' },
  tabContainer: { display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: `2px solid ${palette.border}`, paddingBottom: '8px' },
  tabBtn: { padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 700, fontFamily: "'Fredoka', sans-serif", color: palette.body, borderRadius: '10px', transition: 'all 0.2s' },
  tabActive: { background: palette.violetPale, color: palette.darkPurple },
  wordFilters: { display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' },
  filterSelect: { padding: '8px 12px', border: `2px solid ${palette.border}`, borderRadius: '10px', fontSize: '13px', fontFamily: "'Nunito', sans-serif", fontWeight: 600, background: 'white', flex: '1', minWidth: '120px', color: palette.heading, outline: 'none', cursor: 'pointer' },
  wordGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px', maxHeight: '280px', overflowY: 'auto', padding: '4px', marginBottom: '12px' },
  wordCard: { padding: '12px', border: `2px solid ${palette.border}`, borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', position: 'relative', background: 'white' },
  wordCardSelected: { borderColor: palette.darkPurple, background: palette.violetPale },
  wordCardWord: { fontSize: '15px', fontWeight: 700, color: palette.heading, fontFamily: "'Fredoka', sans-serif" },
  wordCardDefinition: { fontSize: '12px', color: palette.body, fontFamily: "'Nunito', sans-serif", fontWeight: 600 },
  wordCardCheck: { position: 'absolute', top: '-6px', right: '-6px', fontSize: '18px' },
  wordStats: { textAlign: 'center', fontSize: '14px', color: palette.body, marginBottom: '12px', fontFamily: "'Nunito', sans-serif", fontWeight: 600 },
  customSection: { maxHeight: '400px', overflowY: 'auto', padding: '4px' },
  addCustomBtn: { width: '100%', padding: '12px', ...chunkyButton('#4CAF50', '#2E7D32'), fontSize: '14px', marginTop: '8px' },
  customList: { marginTop: '16px', borderTop: `2px solid ${palette.border}`, paddingTop: '12px' },
  customListTitle: { fontSize: '14px', fontWeight: 700, color: palette.heading, marginBottom: '10px', fontFamily: "'Fredoka', sans-serif" },
  customItem: { background: palette.pastelViolet, padding: '12px', borderRadius: '12px', marginBottom: '8px', border: `2px solid ${palette.border}` },
  customItemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' },
  customItemNumber: { fontSize: '11px', fontWeight: 700, color: palette.darkPurple, background: palette.violetPale, padding: '2px 8px', borderRadius: '10px', fontFamily: "'Fredoka', sans-serif" },
  customItemQuestion: { flex: 1, fontSize: '14px', fontWeight: 700, color: palette.heading, marginLeft: '8px', fontFamily: "'Nunito', sans-serif" },
  removeCustomBtn: { background: 'none', border: 'none', color: '#f44336', cursor: 'pointer', fontSize: '16px', fontWeight: 700 },
  customItemOptions: { paddingLeft: '16px' },
  customItemOption: { fontSize: '13px', color: palette.body, padding: '2px 0', fontFamily: "'Nunito', sans-serif", fontWeight: 600 },
  customItemCorrect: { color: '#4CAF50', fontWeight: 700 },
  totalQuestions: { display: 'flex', gap: '16px', padding: '12px', background: palette.violetPale, borderRadius: '12px', marginTop: '12px', marginBottom: '12px', fontSize: '14px', color: palette.body, flexWrap: 'wrap', fontFamily: "'Nunito', sans-serif", fontWeight: 600, border: `2px solid ${palette.border}` },
  previewStats: { display: 'flex', gap: '12px', padding: '12px', background: palette.pastelViolet, borderRadius: '12px', marginBottom: '16px', fontSize: '13px', color: palette.body, flexWrap: 'wrap', fontFamily: "'Nunito', sans-serif", fontWeight: 600, border: `2px solid ${palette.border}` },
  customBadge: { padding: '2px 10px', background: '#fff3e0', color: '#ff9800', borderRadius: '12px', fontSize: '12px' },
  previewList: { maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' },
  previewQuestion: { padding: '14px 16px', background: palette.pastelViolet, borderRadius: '12px', border: `2px solid ${palette.border}` },
  previewQHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '4px', fontFamily: "'Nunito', sans-serif", fontWeight: 700, color: palette.heading },
  previewQOptions: { paddingLeft: '16px' },
  previewQOption: { fontSize: '13px', color: palette.body, padding: '2px 0', fontFamily: "'Nunito', sans-serif", fontWeight: 600 },
  previewQCorrect: { color: '#4CAF50', fontWeight: 700 },
  customTag: { fontSize: '11px', padding: '2px 10px', background: '#fff3e0', color: '#ff9800', borderRadius: '12px', fontFamily: "'Fredoka', sans-serif" },
  generatedTag: { fontSize: '11px', padding: '2px 10px', background: '#e8f5e9', color: '#4CAF50', borderRadius: '12px', fontFamily: "'Fredoka', sans-serif" },
  publishBtn: { width: '100%', padding: '14px', ...chunkyButton('linear-gradient(135deg, #A78BFA 0%, #7C4DFF 100%)', palette.violetDeep), fontSize: '16px' },
};

export default AdminDashboard;