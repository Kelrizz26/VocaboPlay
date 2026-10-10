// src/components/AdminDashboard.jsx
// ============================================================
// ✅ ADMIN DASHBOARD - Updated with Top Navigation Bar
// ✅ UPDATED: Profile button now matches SuperAdmin dark style
// ✅ PRESERVED: All other existing code, modals, and logic
// ============================================================

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import AdminOverview from './admin/AdminOverview';
import AdminStudents from './admin/AdminStudents';
import AdminActivities from './admin/AdminActivities';
import AdminWords from './admin/AdminWords';
import AdminLeaderboards from './admin/AdminLeaderboards';

// ✅ LIVE GAME COMPONENTS
import LiveHostLobby from './admin/LiveHostLobby';
import LiveHostGame from './admin/LiveHostGame';
import LiveHostResults from './admin/LiveHostResults';

import { fontFamily } from './dashboard/dashboardStyles';

// ===== MUTED GAME UI PALETTE (soft, not too bright) =====
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
  shadow: 'rgba(42, 40, 69, 0.06)',
  shadowMd: 'rgba(42, 40, 69, 0.10)',
  danger: '#DB7A64',
  dangerShadow: '#A95845',
};

const FONT_DISPLAY = "'Fredoka', sans-serif";
const FONT_BODY = "'Nunito', sans-serif";

const chunkyButton = (bg, shadowColor) => ({
  background: bg,
  color: '#ffffff',
  border: 'none',
  borderRadius: '10px',
  fontWeight: '800',
  cursor: 'pointer',
  boxShadow: `0 3px 0 ${shadowColor}`,
  transition: 'transform 0.1s ease, box-shadow 0.1s ease',
  fontFamily: FONT_DISPLAY,
});

const pressBtn = (e, shadowColor) => {
  e.currentTarget.style.transform = 'translateY(3px)';
  e.currentTarget.style.boxShadow = 'none';
};
const releaseBtn = (e, shadowColor) => {
  e.currentTarget.style.transform = 'translateY(0)';
  e.currentTarget.style.boxShadow = `0 3px 0 ${shadowColor}`;
};

// ============================================================
// ✅ ACTIVITY TYPE OPTIONS & HELPERS
// ============================================================
const ACTIVITY_TYPE_SUGGESTIONS = [
  'Quiz', 'Short Quiz', 'Long Quiz', 'Prelim', 'Midterm', 'Final',
];

const ACTIVITY_TYPE_ALIASES = {
  'quiz': 'quiz', 'quiz master': 'quiz', 'short quiz': 'short-quiz', 'short-quiz': 'short-quiz',
  'long quiz': 'long-quiz', 'long-quiz': 'long-quiz', 'prelim': 'prelim', 'midterm': 'midterm',
  'final': 'final', 'finals': 'final', 'exam': 'exam', 'match': 'match', 'match game': 'match',
  'word pics': 'wordpics', 'word-pics': 'wordpics', 'wordpics': 'wordpics',
};

const slugifyActivityType = (input) => {
  if (!input || !input.trim()) return 'quiz';
  const lower = input.trim().toLowerCase().replace(/\s+/g, ' ');
  if (ACTIVITY_TYPE_ALIASES[lower]) return ACTIVITY_TYPE_ALIASES[lower];
  return lower.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
};

// ============================================================
// ✅ TypableSelect
// ============================================================
const TypableSelect = ({ value, onChange, options = [], placeholder = '', inputStyle: customInputStyle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);

  useEffect(() => { setInputValue(value || ''); }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false); setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    if (!inputValue || !inputValue.trim()) return options;
    const q = inputValue.trim().toLowerCase();
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [inputValue, options]);

  const handleInputChange = (e) => {
    const v = e.target.value; setInputValue(v); onChange(v); setIsOpen(true); setHighlightedIndex(-1);
  };
  const handleSelect = (option) => {
    setInputValue(option); onChange(option); setIsOpen(false); setHighlightedIndex(-1);
  };
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIsOpen(true); setHighlightedIndex((prev) => prev < filteredOptions.length - 1 ? prev + 1 : prev); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0)); }
    else if (e.key === 'Enter') { if (isOpen && highlightedIndex >= 0 && filteredOptions[highlightedIndex]) { e.preventDefault(); handleSelect(filteredOptions[highlightedIndex]); } }
    else if (e.key === 'Escape') { setIsOpen(false); setHighlightedIndex(-1); }
  };

  const baseInputStyle = customInputStyle || {
    width: '100%', padding: '11px 40px 11px 14px', border: `1.5px solid ${palette.border}`,
    borderRadius: '10px', fontSize: '13px', fontFamily: FONT_BODY, fontWeight: 600,
    boxSizing: 'border-box', color: palette.deepNavy, outline: 'none', background: palette.creamSoft, transition: 'border-color 0.15s ease',
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <input type="text" value={inputValue} onChange={handleInputChange} onFocus={() => setIsOpen(true)} onKeyDown={handleKeyDown} placeholder={placeholder} style={baseInputStyle} autoComplete="off" />
      <span onMouseDown={(e) => { e.preventDefault(); setIsOpen((prev) => !prev); }} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', color: palette.bodyTextSoft, cursor: 'pointer', userSelect: 'none', padding: '4px', lineHeight: 1 }}>▼</span>
      {isOpen && filteredOptions.length > 0 && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: palette.white, border: `1.5px solid ${palette.border}`, borderRadius: '10px', boxShadow: '0 8px 20px rgba(42, 40, 69, 0.12)', zIndex: 50, maxHeight: '220px', overflowY: 'auto', padding: '4px' }}>
          {filteredOptions.map((opt, idx) => {
            const isHighlighted = idx === highlightedIndex;
            const isSelected = opt === value;
            return (
              <div key={opt} onMouseDown={(e) => { e.preventDefault(); handleSelect(opt); }} onMouseEnter={() => setHighlightedIndex(idx)} style={{ padding: '9px 12px', borderRadius: '8px', fontSize: '13px', fontFamily: FONT_BODY, fontWeight: isSelected ? 800 : 600, color: isSelected ? palette.warmOrange : palette.deepNavy, background: isHighlighted ? `${palette.warmOrange}18` : isSelected ? `${palette.warmOrange}10` : 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s ease' }}>
                {opt}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ===== DUOTONE SVG ICONS =====
const Icon = ({ name, size = 20, color = palette.bodyTextSoft, secondaryColor = `${palette.bodyTextSoft}55` }) => {
  const icons = {
    game: (<><path d="M6 12h4m-2-2v4m6-4h.01M17 12h.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/><path d="M8 20h8a4 4 0 004-4V8a4 4 0 00-4-4H8a4 4 0 00-4 4v8a4 4 0 004 4z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>),
    plus: (<path d="M12 5v14M5 12h14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>),
    close: (<path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>),
    check: (<path d="M20 6L9 17l-5-5" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>),
    book: (<><path d="M4 4h11a3 3 0 013 3v13H7a3 3 0 00-3 3V4z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/><path d="M4 4v16" stroke={color} strokeWidth="2" strokeLinecap="round"/></>),
    pencil: (<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>),
    trophy: (<><path d="M6 4h12v4a6 6 0 01-12 0V4z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/><path d="M6 8H4a2 2 0 002 2M18 8h2a2 2 0 01-2 2M9 18h6M10 21h4M12 14v4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>),
    chart: (<path d="M18 20V10M12 20V4M6 20v-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>),
    logout: (<><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/><path d="M16 17l5-5-5-5M21 12H9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>),
    menu: (<path d="M3 12h18M3 6h18M3 18h18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>),
    // ✅ ADDED: users icon para sa Students tab
    users: (<><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/><circle cx="9" cy="7" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>),
    // ✅ ADDED: chevronDown para sa profile dropdown
    chevronDown: (<path d="M6 9l6 6 6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', flexShrink: 0 }}>
      {icons[name] || icons.game}
    </svg>
  );
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

  const [customForm, setCustomForm] = useState({ question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A' });
  const [formData, setFormData] = useState({ title: '', gameType: 'Quiz', questionCount: 10, difficulty: 3, category: '' });

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'words'));
        setWords(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) { console.error('Error fetching words:', error); }
    };
    fetchWords();
  }, []);

  const toggleWord = (word) => {
    const index = selectedWords.findIndex(w => w.id === word.id);
    if (index > -1) { setSelectedWords(selectedWords.filter((_, i) => i !== index)); }
    else {
      if (selectedWords.length >= formData.questionCount) { setError(`You can only select up to ${formData.questionCount} words`); return; }
      setSelectedWords([...selectedWords, word]); setError('');
    }
  };

  const generateQuestions = () => {
    if (selectedWords.length === 0) { setError('Please select at least one word'); return; }
    const shuffled = [...selectedWords].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(formData.questionCount, shuffled.length));
    const questions = selected.map((word) => {
      const otherWords = words.filter(w => w.id !== word.id);
      const shuffledOthers = [...otherWords].sort(() => Math.random() - 0.5);
      const wrongOptions = shuffledOthers.slice(0, 3).map(w => w.definition);
      while (wrongOptions.length < 3) { wrongOptions.push('None of the above'); }
      const options = [word.definition, ...wrongOptions];
      const shuffledOptions = options.sort(() => Math.random() - 0.5);
      return { type: 'generated', wordId: word.id, word: word.word, question: `What is the meaning of "${word.word}"?`, options: shuffledOptions, correctAnswer: word.definition, difficulty: word.difficulty || 3, category: word.category || 'general' };
    });
    setGeneratedQuestions(questions); setStep(3);
  };

  const addCustomQuestion = () => {
    if (!customForm.question.trim()) { setError('Please enter a question'); return; }
    if (!customForm.optionA.trim() || !customForm.optionB.trim()) { setError('Please enter at least options A and B'); return; }
    const options = [customForm.optionA.trim(), customForm.optionB.trim(), customForm.optionC.trim() || 'None of the above', customForm.optionD.trim() || 'None of the above'];
    const correctIndex = customForm.correctAnswer.charCodeAt(0) - 65;
    const correctAnswer = options[correctIndex] || options[0];
    setCustomQuestions([...customQuestions, { type: 'custom', id: Date.now(), question: customForm.question.trim(), options, correctAnswer, difficulty: formData.difficulty || 3, category: formData.category || 'custom', wordId: null, word: '' }]);
    setCustomForm({ question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A' }); setError('');
  };

  const removeCustomQuestion = (index) => { setCustomQuestions(customQuestions.filter((_, i) => i !== index)); };
  const getAllQuestions = () => [...generatedQuestions, ...customQuestions];

  const handlePublish = async () => {
    if (!formData.title) { setError('Please enter an activity title'); return; }
    const allQuestions = getAllQuestions();
    if (allQuestions.length === 0) { setError('Please add at least one question'); return; }
    setLoading(true); setError('');
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      const user = auth.currentUser;
      const formattedQuestions = allQuestions.map(q => ({ type: q.type || 'generated', wordId: q.wordId || null, word: q.word || '', question: q.question || '', options: q.options || [], correctAnswer: q.correctAnswer || '', difficulty: q.difficulty || 3, category: q.category || 'general' }));
      const activityData = { title: formData.title.trim(), teacherId: user.uid, teacherName: user.displayName || user.username || 'Teacher', gameType: slugifyActivityType(formData.gameType), gamePin: pin, questions: formattedQuestions, totalQuestions: formattedQuestions.length, difficulty: formData.difficulty, category: formData.category || 'general', isActive: true, participants: 0, createdAt: new Date().toISOString(), hasCustomQuestions: customQuestions.length > 0 };
      await addDoc(collection(db, 'activities'), activityData);
      onCreated(); onClose(); alert(`✅ Activity published! PIN: ${pin} | Questions: ${formattedQuestions.length}`);
    } catch (error) { console.error('❌ Error publishing activity:', error); setError('Failed to publish activity: ' + error.message); }
    finally { setLoading(false); }
  };

  const categories = [...new Set(words.map(w => w.category).filter(Boolean))];

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button style={styles.modalClose} onClick={onClose}><Icon name="close" size={20} color={palette.bodyTextSoft} /></button>
        <h2 style={styles.modalTitle}><Icon name="game" size={20} color={palette.warmOrange} />Create Activity</h2>
        {error && <div style={styles.errorMessage}>{error}</div>}
        {step === 1 && (
          <>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Activity Title *</label>
              <input type="text" placeholder="e.g., Vocabulary Quiz #1" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} style={styles.input} />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Activity Type</label>
              <TypableSelect value={formData.gameType} onChange={(val) => setFormData({ ...formData, gameType: val })} options={ACTIVITY_TYPE_SUGGESTIONS} placeholder="e.g., Quiz, Short Quiz, Prelim..." inputStyle={styles.input} />
              <div style={{ fontSize: '10px', color: palette.bodyTextSoft, marginTop: '4px', fontFamily: FONT_BODY, fontWeight: 600 }}>💡 Type any type or pick from suggestions</div>
            </div>
            <div style={styles.row}>
              <div style={{ flex: 1, marginRight: '8px' }}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Questions</label>
                  <select value={formData.questionCount} onChange={(e) => setFormData({ ...formData, questionCount: Number(e.target.value) })} style={styles.select}>
                    {[5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ flex: 1, marginLeft: '8px' }}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Difficulty</label>
                  <select value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: Number(e.target.value) })} style={styles.select}>
                    <option value={1}>Level 1 - Beginner</option><option value={2}>Level 2 - Easy</option><option value={3}>Level 3 - Intermediate</option><option value={4}>Level 4 - Advanced</option><option value={5}>Level 5 - Expert</option>
                  </select>
                </div>
              </div>
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Category (optional)</label>
              <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} style={styles.select}>
                <option value="">All Categories</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <button style={styles.nextBtn} onClick={() => setStep(2)} onMouseDown={e => pressBtn(e, palette.warmOrangeShadow)} onMouseUp={e => releaseBtn(e, palette.warmOrangeShadow)} onMouseLeave={e => releaseBtn(e, palette.warmOrangeShadow)}>Next →</button>
          </>
        )}
        {step === 2 && (
          <>
            <button style={styles.backBtn} onClick={() => setStep(1)}>← Back</button>
            <div style={styles.tabContainer}>
              <button style={{ ...styles.tabBtn, ...(questionSource === 'generate' ? styles.tabActive : {}) }} onClick={() => setQuestionSource('generate')}><Icon name="book" size={14} color={questionSource === 'generate' ? palette.warmOrange : palette.bodyText} />Generate from Library</button>
              <button style={{ ...styles.tabBtn, ...(questionSource === 'custom' ? styles.tabActive : {}) }} onClick={() => setQuestionSource('custom')}><Icon name="pencil" size={14} color={questionSource === 'custom' ? palette.warmOrange : palette.bodyText} />Add Custom Question</button>
            </div>
            {questionSource === 'generate' && (
              <>
                <div style={styles.wordFilters}>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} style={styles.filterSelect}><option value="">All Categories</option>{categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select>
                  <select value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: Number(e.target.value) })} style={styles.filterSelect}><option value={0}>All Difficulties</option><option value={1}>Level 1</option><option value={2}>Level 2</option><option value={3}>Level 3</option><option value={4}>Level 4</option><option value={5}>Level 5</option></select>
                </div>
                <div style={styles.wordGrid}>
                  {words.filter(w => { if (formData.category && w.category !== formData.category) return false; if (formData.difficulty && w.difficulty !== formData.difficulty) return false; return true; }).slice(0, 50).map(word => {
                    const isSelected = selectedWords.some(w => w.id === word.id);
                    return (
                      <div key={word.id} style={{ ...styles.wordCard, ...(isSelected ? styles.wordCardSelected : {}) }} onClick={() => toggleWord(word)}>
                        <div style={styles.wordCardWord}>{word.word}</div>
                        <div style={styles.wordCardDefinition}>{word.definition}</div>
                        {isSelected && <span style={styles.wordCardCheck}><Icon name="check" size={14} color={palette.softGreen} /></span>}
                      </div>
                    );
                  })}
                </div>
                <div style={styles.wordStats}><span>Selected: <strong>{selectedWords.length}</strong> / {formData.questionCount}</span></div>
                <button style={styles.nextBtn} onClick={generateQuestions} disabled={selectedWords.length === 0} onMouseDown={e => selectedWords.length > 0 && pressBtn(e, palette.warmOrangeShadow)} onMouseUp={e => selectedWords.length > 0 && releaseBtn(e, palette.warmOrangeShadow)} onMouseLeave={e => selectedWords.length > 0 && releaseBtn(e, palette.warmOrangeShadow)}>Generate Questions →</button>
              </>
            )}
            {questionSource === 'custom' && (
              <div style={styles.customSection}>
                <div style={styles.fieldGroup}><label style={styles.label}>Question *</label><input type="text" placeholder="Enter your question" value={customForm.question} onChange={(e) => setCustomForm({ ...customForm, question: e.target.value })} style={styles.input} /></div>
                <div style={styles.row}>
                  <div style={{ flex: 1, marginRight: '8px' }}><div style={styles.fieldGroup}><label style={styles.label}>Option A *</label><input type="text" placeholder="Option A" value={customForm.optionA} onChange={(e) => setCustomForm({ ...customForm, optionA: e.target.value })} style={styles.input} /></div></div>
                  <div style={{ flex: 1, marginLeft: '8px' }}><div style={styles.fieldGroup}><label style={styles.label}>Option B *</label><input type="text" placeholder="Option B" value={customForm.optionB} onChange={(e) => setCustomForm({ ...customForm, optionB: e.target.value })} style={styles.input} /></div></div>
                </div>
                <div style={styles.row}>
                  <div style={{ flex: 1, marginRight: '8px' }}><div style={styles.fieldGroup}><label style={styles.label}>Option C</label><input type="text" placeholder="Option C (optional)" value={customForm.optionC} onChange={(e) => setCustomForm({ ...customForm, optionC: e.target.value })} style={styles.input} /></div></div>
                  <div style={{ flex: 1, marginLeft: '8px' }}><div style={styles.fieldGroup}><label style={styles.label}>Option D</label><input type="text" placeholder="Option D (optional)" value={customForm.optionD} onChange={(e) => setCustomForm({ ...customForm, optionD: e.target.value })} style={styles.input} /></div></div>
                </div>
                <div style={styles.fieldGroup}><label style={styles.label}>Correct Answer *</label><select value={customForm.correctAnswer} onChange={(e) => setCustomForm({ ...customForm, correctAnswer: e.target.value })} style={styles.select}><option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option></select></div>
                <button style={styles.addCustomBtn} onClick={addCustomQuestion} onMouseDown={e => pressBtn(e, palette.softGreenShadow)} onMouseUp={e => releaseBtn(e, palette.softGreenShadow)} onMouseLeave={e => releaseBtn(e, palette.softGreenShadow)}><Icon name="plus" size={14} color={palette.white} />Add Question</button>
                {customQuestions.length > 0 && (
                  <div style={styles.customList}>
                    <h4 style={styles.customListTitle}>Your Custom Questions ({customQuestions.length})</h4>
                    {customQuestions.map((q, index) => (
                      <div key={q.id || index} style={styles.customItem}>
                        <div style={styles.customItemHeader}><span style={styles.customItemNumber}>#{index + 1}</span><span style={styles.customItemQuestion}>{q.question}</span><button style={styles.removeCustomBtn} onClick={() => removeCustomQuestion(index)}><Icon name="close" size={14} color={palette.danger} /></button></div>
                        <div style={styles.customItemOptions}>{q.options.map((opt, i) => (<div key={i} style={{ ...styles.customItemOption, ...(opt === q.correctAnswer ? styles.customItemCorrect : {}) }}>{String.fromCharCode(65 + i)}. {opt}{opt === q.correctAnswer && <Icon name="check" size={11} color={palette.softGreen} />}</div>))}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div style={styles.totalQuestions}><span>Total: <strong>{generatedQuestions.length + customQuestions.length}</strong></span>{generatedQuestions.length > 0 && <span>Generated: {generatedQuestions.length}</span>}{customQuestions.length > 0 && <span>Custom: {customQuestions.length}</span>}</div>
            <button style={styles.nextBtn} onClick={() => setStep(3)} disabled={generatedQuestions.length === 0 && customQuestions.length === 0} onMouseDown={e => (generatedQuestions.length > 0 || customQuestions.length > 0) && pressBtn(e, palette.warmOrangeShadow)} onMouseUp={e => releaseBtn(e, palette.warmOrangeShadow)} onMouseLeave={e => releaseBtn(e, palette.warmOrangeShadow)}>Preview & Publish →</button>
          </>
        )}
        {step === 3 && (
          <>
            <button style={styles.backBtn} onClick={() => setStep(2)}>← Back</button>
            <div style={styles.previewStats}><span>{getAllQuestions().length} Questions</span><span>{formData.category || 'All Categories'}</span><span>Level {formData.difficulty}</span>{customQuestions.length > 0 && <span style={styles.customBadge}>{customQuestions.length} Custom</span>}</div>
            <div style={styles.previewList}>
              {getAllQuestions().map((q, index) => (
                <div key={q.id || index} style={styles.previewQuestion}>
                  <div style={styles.previewQHeader}><span>Q{index + 1}: <strong>{q.question}</strong></span><span style={q.type === 'custom' ? styles.customTag : styles.generatedTag}>{q.type === 'custom' ? 'Custom' : 'Generated'}</span></div>
                  <div style={styles.previewQOptions}>{q.options.map((opt, i) => (<div key={i} style={{ ...styles.previewQOption, ...(opt === q.correctAnswer ? styles.previewQCorrect : {}) }}>{String.fromCharCode(65 + i)}. {opt}{opt === q.correctAnswer && <Icon name="check" size={11} color={palette.softGreen} />}</div>))}</div>
                </div>
              ))}
            </div>
            <button style={styles.publishBtn} onClick={handlePublish} disabled={loading} onMouseDown={e => !loading && pressBtn(e, palette.warmOrangeShadow)} onMouseUp={e => !loading && releaseBtn(e, palette.warmOrangeShadow)} onMouseLeave={e => !loading && releaseBtn(e, palette.warmOrangeShadow)}>{loading ? 'Publishing...' : 'Publish Activity'}</button>
          </>
        )}
      </div>
    </div>
  );
};

// ============================================================
// ===== LIVE SCOREBOARD (UPDATED WITH MATRIX & PRINT) =====
// ============================================================
const TeacherLiveScoreboard = ({ activity, students = [] }) => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const activityId = activity?.id;
  const totalQ = activity?.totalQuestions || 0;

  useEffect(() => {
    if (!activityId) return;
    const q = query(collection(db, 'scores'), where('activityId', '==', activityId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const scoresData = [];
      snapshot.forEach((doc) => { scoresData.push({ id: doc.id, ...doc.data() }); });
      scoresData.sort((a, b) => b.score - a.score);
      setScores(scoresData); setLoading(false);
    });
    return () => unsubscribe();
  }, [activityId]);

  const summaryStats = useMemo(() => {
    if (scores.length === 0) return { average: 0, highest: 0, lowest: 0 };
    const scoreValues = scores.map(s => s.score || 0);
    const total = scoreValues.reduce((sum, s) => sum + s, 0);
    return { average: (total / scores.length).toFixed(1), highest: Math.max(...scoreValues), lowest: Math.min(...scoreValues) };
  }, [scores]);

  const questionNumbers = Array.from({ length: totalQ }, (_, i) => i + 1);

  if (loading) return <div style={{ padding: '16px', textAlign: 'center', color: palette.bodyTextSoft, fontFamily: FONT_BODY, fontWeight: 600 }}>Loading scores...</div>;

  return (
    <div style={{ background: palette.creamSoft, padding: '16px', borderRadius: '14px', border: `1.5px solid ${palette.border}` }}>
      <style>{`
        @media print {
          @page { size: landscape; margin: 8mm; }
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .modal-overlay { position: static !important; background: transparent !important; padding: 0 !important; }
          .modal-content { max-width: 100% !important; max-height: 100% !important; overflow: visible !important; box-shadow: none !important; border: none !important; padding: 0 !important; background: white !important; }
          .print-table { width: 100%; border-collapse: collapse; font-size: 10px; }
          .print-table th, .print-table td { border: 1px solid #000 !important; padding: 4px !important; text-align: center; color: #000 !important; }
          .print-table th { background: #f0f0f0 !important; -webkit-print-color-adjust: exact; }
          .correct-cell { color: green !important; font-weight: bold; }
          .incorrect-cell { color: red !important; font-weight: bold; }
        }
      `}</style>
      <div className="print-only" style={{ display: 'none', marginBottom: '15px', textAlign: 'left' }}>
        <h2 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>Quiz Report: {activity?.title}</h2>
        <p style={{ margin: '0 0 5px 0', fontSize: '12px' }}><strong>Date:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        <p style={{ margin: 0, fontSize: '12px' }}><strong>Average:</strong> {summaryStats.average} | <strong>Highest:</strong> {summaryStats.highest} | <strong>Lowest:</strong> {summaryStats.lowest}</p>
      </div>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: palette.deepNavy, fontFamily: FONT_DISPLAY, display: 'flex', alignItems: 'center', gap: '8px' }}><Icon name="chart" size={14} color={palette.teal} />Live Scores & Matrix Breakdown</h3>
        <div style={{ display: 'flex', gap: '15px', fontSize: '12px', fontWeight: 700, color: palette.bodyText, fontFamily: FONT_BODY }}>
          <span>Avg: <span style={{ color: palette.warmOrange }}>{summaryStats.average}</span></span>
          <span>High: <span style={{ color: palette.softGreen }}>{summaryStats.highest}</span></span>
          <span>Low: <span style={{ color: palette.danger }}>{summaryStats.lowest}</span></span>
        </div>
      </div>
      {scores.length === 0 ? (
        <p style={{ color: palette.bodyTextSoft, fontFamily: FONT_BODY, fontWeight: 600, margin: 0 }}>No students have answered yet.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="print-table" style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONT_BODY }}>
            <thead>
              <tr style={{ borderBottom: `1.5px solid ${palette.border}` }}>
                <th style={{ padding: '8px', textAlign: 'left', color: palette.bodyTextSoft, fontFamily: FONT_DISPLAY, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800 }}>Rank</th>
                <th style={{ padding: '8px', textAlign: 'left', color: palette.bodyTextSoft, fontFamily: FONT_DISPLAY, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800 }}>Student</th>
                <th style={{ padding: '8px', textAlign: 'center', color: palette.bodyTextSoft, fontFamily: FONT_DISPLAY, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800 }}>Score</th>
                {questionNumbers.map(q => (<th key={`Q${q}`} style={{ padding: '4px', textAlign: 'center', color: palette.bodyTextSoft, fontFamily: FONT_DISPLAY, fontSize: '9px', fontWeight: 800 }}>Q{q}</th>))}
                <th style={{ padding: '8px', textAlign: 'center', color: palette.bodyTextSoft, fontFamily: FONT_DISPLAY, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800 }}>Correct</th>
                <th style={{ padding: '8px', textAlign: 'center', color: palette.bodyTextSoft, fontFamily: FONT_DISPLAY, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800 }}>Wrong</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((score, index) => {
                const correct = score.score || 0;
                const incorrect = totalQ - correct;
                const answers = score.answers || score.responses || {}; 
                const studentProfile = students.find(s => s.id === score.studentId);
                const studentDisplayName = studentProfile ? studentProfile.displayName : (score.studentName && score.studentName !== 'New User' ? score.studentName : 'Unknown Student');
                return (
                  <React.Fragment key={score.id}>
                    <tr style={{ borderBottom: `1.5px solid ${palette.borderSoft}` }}>
                      <td style={{ padding: '8px', fontWeight: 700, color: palette.deepNavy, fontFamily: FONT_DISPLAY }}>{index === 0 ? '1st' : index === 1 ? '2nd' : index === 2 ? '3rd' : `${index + 1}`}</td>
                      <td style={{ padding: '8px', fontWeight: 700, color: palette.deepNavy, fontFamily: FONT_DISPLAY, textAlign: 'left' }}>{studentDisplayName}</td>
                      <td style={{ padding: '8px', textAlign: 'center', color: palette.warmOrange, fontWeight: 800, fontFamily: FONT_DISPLAY }}>{correct}/{totalQ}</td>
                      {questionNumbers.map(q => {
                        let isCorrect = false;
                        if (Array.isArray(answers)) { isCorrect = answers[q - 1] === true; }
                        else if (typeof answers === 'object' && answers !== null) { isCorrect = answers[`Q${q}`] === true || answers[`q${q}`] === true || answers[q] === true || answers[`${q}`] === true; }
                        return (<td key={`Q${q}`} style={{ padding: '4px', textAlign: 'center' }}>{isCorrect ? <span className="correct-cell">✅</span> : <span className="incorrect-cell">❌</span>}</td>);
                      })}
                      <td style={{ padding: '8px', textAlign: 'center', color: palette.softGreen, fontWeight: 700 }}>{correct}</td>
                      <td style={{ padding: '8px', textAlign: 'center', color: palette.danger, fontWeight: 700 }}>{incorrect}</td>
                    </tr>
                    {(!score.answers && !score.responses) && index === 0 && (
                      <tr><td colSpan={questionNumbers.length + 5} style={{ color: palette.danger, fontSize: '11px', textAlign: 'center', padding: '8px', background: `${palette.danger}10` }}>⚠️ Warning: This score record does not contain per-question answers data. The matrix will show all as incorrect. Please check your game saving logic to ensure it saves the `answers` object.</td></tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
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
  const [showCreateActivity, setShowCreateActivity] = useState(false);
  const [showScoresModal, setShowScoresModal] = useState(false);
  const [selectedActivityForScores, setSelectedActivityForScores] = useState(null);

  const [liveActivity, setLiveActivity] = useState(null);
  const [liveSession, setLiveSession] = useState(null);
  const [liveView, setLiveView] = useState(null);

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
      if (!user) { navigate('/admin'); return; }
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role !== 'admin' && userData.role !== 'super_admin') { navigate('/dashboard'); return; }
        setTeacher({ uid: user.uid, displayName: userData.displayName || user.email?.split('@')[0] || 'Admin', email: userData.email || user.email || '', role: userData.role, avatar: userData.avatar || '', gender: userData.gender || (user.email?.charAt(0) === 'm' ? 'male' : 'female') });
      } else {
        setTeacher({ uid: user.uid, displayName: user.displayName || user.email?.split('@')[0] || 'Admin', email: user.email || '', role: 'admin', avatar: '', gender: user.email?.charAt(0) === 'm' ? 'male' : 'female' });
      }
      fetchAllData();
    };
    checkAuth();
  }, [navigate]);

  const fetchAllData = async () => {
    try {
      const user = auth.currentUser;
      const activitiesSnapshot = await getDocs(query(collection(db, 'activities'), where('teacherId', '==', user.uid)));
      const activitiesData = [];
      const teacherActivityIds = [];
      activitiesSnapshot.forEach((doc) => { activitiesData.push({ id: doc.id, ...doc.data() }); teacherActivityIds.push(doc.id); });
      setActivities(activitiesData);
      setLoading(prev => ({ ...prev, activities: false }));

      let studentIds = [];
      if (teacherActivityIds.length > 0) {
        const scoresSnapshot = await getDocs(collection(db, 'scores'));
        scoresSnapshot.forEach((doc) => {
          const scoreData = doc.data();
          if (teacherActivityIds.includes(scoreData.activityId)) { if (!studentIds.includes(scoreData.studentId)) { studentIds.push(scoreData.studentId); } }
        });
      }

      const usersSnapshot = await getDocs(collection(db, 'users'));
      const studentsData = usersSnapshot.docs.map(doc => {
        const data = doc.data();
        if (data.role === 'student' && studentIds.includes(doc.id)) {
          return { id: doc.id, ...data, displayName: data.displayName || data.email?.split('@')[0] || 'Unknown', avgScore: calculateAvgScore(data.progress), gamesPlayed: data.progress?.gamesPlayed || 0, joinDate: data.createdAt ? new Date(data.createdAt).toISOString().split('T')[0] : 'Unknown', progress: data.progress || {} };
        }
        return null;
      }).filter(student => student !== null);
      setStudents(studentsData);
      setLoading(prev => ({ ...prev, students: false }));

      const wordsSnapshot = await getDocs(collection(db, 'words'));
      setWords(wordsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
          { id: 'wordpics', name: 'Word Pics', icon: 'image', description: 'Guess the word from the picture!', totalWords: 30, timesPlayed: 0, avgScore: 0, color: palette.warmOrange, category: 'vocab', difficulty: 'beginner', timeEstimate: '5-10 min', lastUpdated: new Date().toISOString() },
          { id: 'match', name: 'Match Game', icon: 'game', description: 'Connect words with definitions', totalPairs: 6, timesPlayed: 0, avgScore: 0, color: palette.coral, category: 'vocab', difficulty: 'beginner', timeEstimate: '3-5 min', lastUpdated: new Date().toISOString() },
          { id: 'quiz', name: 'Quiz Master', icon: 'brain', description: 'Test your knowledge with multiple choice questions.', totalQuestions: 10, timesPlayed: 0, avgScore: 0, color: palette.teal, category: 'challenge', difficulty: 'intermediate', timeEstimate: '10-15 min', lastUpdated: new Date().toISOString() }
        ];
        for (const game of defaultGames) { await addDoc(collection(db, 'games'), game); }
        setGames(defaultGames);
      } else {
        setGames(gamesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    } catch (error) { console.error('Error initializing games:', error); }
    finally { setLoading(prev => ({ ...prev, games: false })); }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('adminToken'); localStorage.removeItem('userType'); localStorage.removeItem('userId'); localStorage.removeItem('token'); localStorage.removeItem('userProfile'); localStorage.removeItem('vocaboplay_progress');
      await auth.signOut(); navigate('/');
    } catch (error) { console.error('Logout error:', error); navigate('/'); }
  };

  const handleHostLive = (activity) => { setLiveActivity(activity); setLiveView('lobby'); };
  const handleLiveStart = (session) => { setLiveSession(session); setLiveView('game'); };
  const handleLiveEnd = (session) => { setLiveSession(session); setLiveView('results'); };
  const handleLiveExit = () => { setLiveActivity(null); setLiveSession(null); setLiveView(null); fetchAllData(); };
  const handleShowScores = (activity) => { setSelectedActivityForScores(activity); setShowScoresModal(true); };

  const renderContent = () => {
    switch (activeMenu) {
      case 'Overview': return <AdminOverview students={students} games={games} words={words} activities={activities} setActiveMenu={setActiveMenu} />;
      case 'Students': return <AdminStudents students={students} setStudents={setStudents} loading={loading} calculateAvgScore={calculateAvgScore} />;
      case 'Activities': return <AdminActivities activities={activities} setActivities={setActivities} loading={loading} onHostLive={handleHostLive} onShowScores={handleShowScores} onCreateActivity={() => setShowCreateActivity(true)} />;
      case 'Words': return <AdminWords words={words} setWords={setWords} loading={loading} />;
      case 'Leaderboards': return <AdminLeaderboards />;
      default: return <AdminOverview students={students} games={games} words={words} activities={activities} setActiveMenu={setActiveMenu} />;
    }
  };

  if (liveView === 'lobby' && liveActivity) { return <LiveHostLobby activity={liveActivity} onStart={handleLiveStart} onCancel={handleLiveExit} />; }
  if (liveView === 'game' && liveSession) { return <LiveHostGame session={liveSession} onEnd={handleLiveEnd} />; }
  if (liveView === 'results' && liveSession) { return <LiveHostResults session={liveSession} onPlayAgain={handleLiveExit} onBackToDashboard={handleLiveExit} />; }

  // ✅ NAVIGATION MENU ITEMS
  const menuItems = [
    { name: 'Overview', icon: 'chart' },
    { name: 'Students', icon: 'users' },
    { name: 'Activities', icon: 'game' },
    { name: 'Words', icon: 'book' },
    { name: 'Leaderboards', icon: 'trophy' }
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;500;600;700;800&display=swap');
        .admin-dashboard-wrapper * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Nunito', sans-serif; background: ${palette.cream}; }

        /* ✅ TOP NAVIGATION STYLES */
        .admin-top-nav {
          background: ${palette.deepNavy};
          padding: 12px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          flex-wrap: wrap;
          gap: 16px;
        }

        .admin-nav-links {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
          justify-content: center;
          flex: 1;
        }

        .admin-nav-link {
          background: transparent;
          color: rgba(255,255,255,0.7);
          border: none;
          padding: 8px 16px;
          border-radius: 10px;
          font-family: ${FONT_DISPLAY};
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }

        .admin-nav-link:hover {
          background: rgba(255,255,255,0.1);
          color: white;
        }

        .admin-nav-link.active {
          background: ${palette.warmOrange};
          color: white;
          box-shadow: 0 2px 0 ${palette.warmOrangeShadow};
        }

        /* ✅ UPDATED: Profile button hover para sa dark style */
        .profile-menu-btn {
          transition: background 0.15s ease, border-color 0.15s ease;
        }
        .profile-menu-btn:hover {
          background: rgba(255,255,255,0.15) !important;
          border-color: rgba(255,255,255,0.25) !important;
        }

        /* Mobile adjustments for Top Nav */
        @media (max-width: 768px) {
          .admin-top-nav { flex-direction: column; padding: 12px; gap: 12px; }
          .admin-nav-links { width: 100%; justify-content: flex-start; overflow-x: auto; padding-bottom: 4px; }
          .admin-nav-link { white-space: nowrap; padding: 6px 12px; font-size: 12px; }
          .admin-main-content { padding: 16px !important; }
        }
      `}</style>

      <div className="admin-dashboard-wrapper" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: palette.cream, fontFamily: FONT_BODY }}>
        
        {/* ✅ TOP NAVIGATION BAR */}
        <nav className="admin-top-nav">
          {/* LEFT: Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: '16px', flexShrink: 0 }}>
            <Icon name="trophy" size={20} color={palette.warmOrange} /> Admin Dashboard
          </div>

          {/* CENTER: Links */}
          <div className="admin-nav-links">
            {menuItems.map(item => (
              <button
                key={item.name}
                className={`admin-nav-link ${activeMenu === item.name ? 'active' : ''}`}
                onClick={() => setActiveMenu(item.name)}
              >
                <Icon name={item.icon} size={14} color={activeMenu === item.name ? 'white' : 'rgba(255,255,255,0.7)'} />
                {item.name}
              </button>
            ))}
          </div>

          {/* RIGHT: Profile Menu */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {/* ✅ UPDATED: Profile button - transparent dark style (SuperAdmin style) */}
            <button
              className="profile-menu-btn"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              style={{
                padding: '5px 12px 5px 6px',
                background: 'rgba(255,255,255,0.08)',
                color: palette.white,
                border: `1.5px solid rgba(255,255,255,0.15)`,
                borderRadius: '10px',
                cursor: 'pointer',
                fontFamily: FONT_DISPLAY,
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div style={{
                width: '30px', height: '30px', borderRadius: '50%',
                background: teacher?.gender === 'male' ? '#6B8ACB' : palette.coral,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', flexShrink: 0,
                border: '1.5px solid rgba(255,255,255,0.2)',
              }}>
                {teacher?.avatar && teacher?.avatar !== '' ? (
                  <img src={teacher.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: 'white', fontWeight: 800, fontSize: '13px', fontFamily: FONT_DISPLAY }}>
                    {teacher?.displayName?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.1, minWidth: 0 }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: palette.white, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '90px' }}>
                  {teacher?.displayName || 'Admin'}
                </span>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                  {teacher?.role || 'Admin'}
                </span>
              </div>
              <Icon name="chevronDown" size={12} color="rgba(255,255,255,0.6)" />
            </button>

            {showProfileMenu && (
              <>
                <div onClick={() => setShowProfileMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 999 }} />
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: '0', background: palette.white, borderRadius: '14px', zIndex: 1000, minWidth: '250px', overflow: 'hidden', border: `1.5px solid ${palette.border}`, fontFamily: FONT_BODY, boxShadow: '0 10px 30px rgba(42, 40, 69, 0.15)' }}>
                  <div style={{ padding: '12px 14px', background: palette.creamSoft, borderBottom: `1.5px solid ${palette.border}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', background: teacher?.gender === 'male' ? '#6B8ACB' : palette.coral }}>
                      {teacher?.avatar && teacher?.avatar !== '' ? (
                        <img src={teacher.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>{teacher?.displayName?.charAt(0)?.toUpperCase() || 'A'}</span>
                      )}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: palette.deepNavy, fontFamily: FONT_DISPLAY }}>{teacher?.displayName || 'Admin'}</div>
                      <div style={{ fontSize: '11px', color: palette.bodyTextSoft, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{teacher?.email || 'No email on file'}</div>
                    </div>
                  </div>
                  <div style={{ padding: '6px' }}>
                    <button onClick={handleLogout} style={{ width: '100%', padding: '10px 12px', border: 'none', background: 'none', fontSize: '13px', cursor: 'pointer', textAlign: 'left', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', color: palette.danger, fontFamily: FONT_BODY, fontWeight: 700, transition: 'background 0.15s ease' }} onMouseOver={e => e.currentTarget.style.background = `${palette.danger}10`} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                      <Icon name="logout" size={14} color={palette.danger} /> Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </nav>

        {/* ✅ MAIN CONTENT (Full Width, No Sidebar Margins) */}
        <div className="admin-main-content" style={{ flex: 1, padding: '32px', overflowY: 'auto', fontFamily: FONT_BODY }}>
          <div className="admin-content-wrapper">
            {renderContent()}
          </div>
        </div>
      </div>

      {showCreateActivity && (
        <CreateActivityModal onClose={() => setShowCreateActivity(false)} onCreated={fetchAllData} />
      )}

      {showScoresModal && selectedActivityForScores && (
        <div className="modal-overlay" style={styles.modalOverlay} onClick={() => setShowScoresModal(false)}>
          <div className="modal-content" style={{...styles.modalContent, maxWidth: '95vw', width: '100%'}} onClick={(e) => e.stopPropagation()}>
            <button className="no-print" style={styles.modalClose} onClick={() => setShowScoresModal(false)}>
              <Icon name="close" size={20} color={palette.bodyTextSoft} />
            </button>
            <h2 className="no-print" style={styles.modalTitle}>
              <Icon name="chart" size={18} color={palette.teal} /> Scores for: {selectedActivityForScores.title}
            </h2>
            <TeacherLiveScoreboard activity={selectedActivityForScores} students={students} />
            <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', gap: '10px' }}>
              <button onClick={() => window.print()} style={{...styles.publishBtn, background: palette.teal, boxShadow: `0 3px 0 ${palette.tealShadow}`, flex: '0 0 auto', padding: '12px 24px'}} onMouseDown={e => pressBtn(e)} onMouseUp={e => releaseBtn(e, palette.tealShadow)} onMouseLeave={e => releaseBtn(e, palette.tealShadow)}>🖨️ Print Report</button>
              <button onClick={() => setShowScoresModal(false)} style={{...styles.publishBtn, flex: '0 0 auto', padding: '12px 24px'}} onMouseDown={e => pressBtn(e)} onMouseUp={e => releaseBtn(e, palette.warmOrangeShadow)} onMouseLeave={e => releaseBtn(e, palette.warmOrangeShadow)}>Close</button>
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
  pageTitle: { fontSize: '24px', fontWeight: '800', color: palette.deepNavy, marginBottom: '24px', fontFamily: FONT_DISPLAY, letterSpacing: '-0.5px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard: { background: palette.white, padding: '20px', borderRadius: '14px', boxShadow: `0 2px 0 ${palette.border}`, border: `1.5px solid ${palette.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center' },
  statNumber: { fontSize: '28px', fontWeight: '800', color: palette.deepNavy, fontFamily: FONT_DISPLAY },
  statLabel: { fontSize: '12px', color: palette.bodyTextSoft, fontFamily: FONT_DISPLAY, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' },
  quickActions: { display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' },
  quickActionBtn: { ...chunkyButton(palette.warmOrange, palette.warmOrangeShadow), padding: '12px 24px', fontSize: '14px' },
  section: { marginBottom: '30px' },
  sectionTitle: { fontSize: '16px', fontWeight: 800, color: palette.deepNavy, marginBottom: '16px', fontFamily: FONT_DISPLAY },
  activityGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' },
  activityCard: { background: palette.white, padding: '20px', borderRadius: '14px', boxShadow: `0 2px 0 ${palette.border}`, border: `1.5px solid ${palette.border}` },
  activityHeader: { display: 'flex', gap: '12px', marginBottom: '12px' },
  activityIcon: { fontSize: '28px' },
  activityTitle: { fontSize: '15px', fontWeight: 700, color: palette.deepNavy, margin: '0', fontFamily: FONT_DISPLAY },
  activityMeta: { fontSize: '12px', color: palette.bodyTextSoft, margin: '2px 0 0 0', fontFamily: FONT_BODY, fontWeight: 600 },
  pinCode: { color: palette.warmOrange, fontSize: '14px', fontFamily: FONT_DISPLAY, fontWeight: 800 },
  activityStats: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: palette.bodyText, fontFamily: FONT_BODY, fontWeight: 600 },
  activeBadge: { color: palette.softGreen, fontWeight: '700' },
  inactiveBadge: { color: palette.danger, fontWeight: '700' },
  customBadgeSmall: { fontSize: '10px', padding: '2px 8px', background: `${palette.warmOrange}15`, color: palette.warmOrange, borderRadius: '10px', display: 'inline-block', marginTop: '4px', fontFamily: FONT_DISPLAY, fontWeight: 800, border: `1px solid ${palette.warmOrange}40` },
  noData: { color: palette.bodyTextSoft, textAlign: 'center', padding: '20px', fontWeight: 600 },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(42, 40, 69, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', padding: '16px' },
  modalContent: { background: palette.white, borderRadius: '20px', padding: '28px', maxWidth: '660px', width: '100%', maxHeight: '85vh', overflowY: 'auto', position: 'relative', border: `1.5px solid ${palette.border}`, boxShadow: '0 20px 50px rgba(42, 40, 69, 0.25)' },
  modalClose: { position: 'absolute', top: '16px', right: '18px', background: palette.creamSoft, border: `1.5px solid ${palette.border}`, width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 },
  modalTitle: { fontSize: '18px', fontWeight: 800, color: palette.deepNavy, margin: '0 0 20px 0', fontFamily: FONT_DISPLAY, display: 'flex', alignItems: 'center', gap: '10px' },
  errorMessage: { padding: '10px 14px', backgroundColor: `${palette.danger}12`, border: `1.5px solid ${palette.danger}40`, borderRadius: '10px', color: palette.danger, fontSize: '12px', marginBottom: '14px', fontFamily: FONT_BODY, fontWeight: 600 },
  fieldGroup: { marginBottom: '14px' },
  label: { fontSize: '11px', fontWeight: 800, color: palette.bodyTextSoft, display: 'block', marginBottom: '6px', fontFamily: FONT_DISPLAY, textTransform: 'uppercase', letterSpacing: '0.06em' },
  input: { width: '100%', padding: '11px 40px 11px 14px', border: `1.5px solid ${palette.border}`, borderRadius: '10px', fontSize: '13px', fontFamily: FONT_BODY, fontWeight: 600, boxSizing: 'border-box', color: palette.deepNavy, outline: 'none', background: palette.creamSoft, transition: 'border-color 0.15s ease' },
  select: { width: '100%', padding: '11px 14px', border: `1.5px solid ${palette.border}`, borderRadius: '10px', fontSize: '13px', fontFamily: FONT_BODY, fontWeight: 600, boxSizing: 'border-box', background: palette.creamSoft, color: palette.deepNavy, outline: 'none', cursor: 'pointer' },
  row: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  nextBtn: { width: '100%', padding: '13px', ...chunkyButton(palette.warmOrange, palette.warmOrangeShadow), fontSize: '14px', marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  backBtn: { padding: '8px 14px', background: palette.white, border: `1.5px solid ${palette.border}`, borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontFamily: FONT_DISPLAY, fontWeight: 800, color: palette.deepNavy, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: `0 2px 0 ${palette.border}` },
  tabContainer: { display: 'flex', gap: '6px', marginBottom: '16px', borderBottom: `1.5px solid ${palette.border}`, paddingBottom: '8px' },
  tabBtn: { padding: '8px 14px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 800, fontFamily: FONT_DISPLAY, color: palette.bodyTextSoft, borderRadius: '10px', transition: 'all 0.18s ease', display: 'flex', alignItems: 'center', gap: '6px' },
  tabActive: { background: `${palette.warmOrange}15`, color: palette.warmOrange, border: `1px solid ${palette.warmOrange}40` },
  wordFilters: { display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' },
  filterSelect: { padding: '8px 12px', border: `1.5px solid ${palette.border}`, borderRadius: '10px', fontSize: '12px', fontFamily: FONT_BODY, fontWeight: 600, background: palette.creamSoft, flex: '1', minWidth: '120px', color: palette.deepNavy, outline: 'none', cursor: 'pointer' },
  wordGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px', maxHeight: '280px', overflowY: 'auto', padding: '4px', marginBottom: '12px' },
  wordCard: { padding: '12px', border: `1.5px solid ${palette.border}`, borderRadius: '10px', cursor: 'pointer', transition: 'all 0.18s ease', position: 'relative', background: palette.white },
  wordCardSelected: { borderColor: palette.warmOrange, background: `${palette.warmOrange}10`, boxShadow: `0 2px 0 ${palette.warmOrange}40` },
  wordCardWord: { fontSize: '14px', fontWeight: 700, color: palette.deepNavy, fontFamily: FONT_DISPLAY },
  wordCardDefinition: { fontSize: '11px', color: palette.bodyTextSoft, fontFamily: FONT_BODY, fontWeight: 600, marginTop: '4px' },
  wordCardCheck: { position: 'absolute', top: '6px', right: '6px', background: palette.white, borderRadius: '50%', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${palette.softGreen}40` },
  wordStats: { textAlign: 'center', fontSize: '13px', color: palette.bodyText, marginBottom: '12px', fontFamily: FONT_BODY, fontWeight: 600 },
  customSection: { maxHeight: '400px', overflowY: 'auto', padding: '4px' },
  addCustomBtn: { width: '100%', padding: '12px', ...chunkyButton(palette.softGreen, palette.softGreenShadow), fontSize: '13px', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' },
  customList: { marginTop: '16px', borderTop: `1.5px solid ${palette.border}`, paddingTop: '12px' },
  customListTitle: { fontSize: '13px', fontWeight: 800, color: palette.deepNavy, marginBottom: '10px', fontFamily: FONT_DISPLAY },
  customItem: { background: palette.creamSoft, padding: '12px', borderRadius: '12px', marginBottom: '8px', border: `1.5px solid ${palette.border}` },
  customItemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', gap: '8px' },
  customItemNumber: { fontSize: '10px', fontWeight: 800, color: palette.warmOrange, background: `${palette.warmOrange}15`, padding: '2px 8px', borderRadius: '10px', fontFamily: FONT_DISPLAY, border: `1px solid ${palette.warmOrange}30` },
  customItemQuestion: { flex: 1, fontSize: '13px', fontWeight: 700, color: palette.deepNavy, fontFamily: FONT_BODY },
  removeCustomBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' },
  customItemOptions: { paddingLeft: '14px' },
  customItemOption: { fontSize: '12px', color: palette.bodyText, padding: '3px 0', fontFamily: FONT_BODY, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' },
  customItemCorrect: { color: palette.softGreen, fontWeight: 700 },
  totalQuestions: { display: 'flex', gap: '14px', padding: '12px', background: palette.creamSoft, borderRadius: '12px', marginTop: '12px', marginBottom: '12px', fontSize: '12px', color: palette.bodyText, flexWrap: 'wrap', fontFamily: FONT_BODY, fontWeight: 700, border: `1.5px solid ${palette.border}` },
  previewStats: { display: 'flex', gap: '10px', padding: '12px', background: palette.creamSoft, borderRadius: '12px', marginBottom: '16px', fontSize: '12px', color: palette.bodyText, flexWrap: 'wrap', fontFamily: FONT_BODY, fontWeight: 700, border: `1.5px solid ${palette.border}` },
  customBadge: { padding: '2px 10px', background: `${palette.warmOrange}15`, color: palette.warmOrange, borderRadius: '12px', fontSize: '11px', fontFamily: FONT_DISPLAY, fontWeight: 800 },
  previewList: { maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' },
  previewQuestion: { padding: '14px 16px', background: palette.creamSoft, borderRadius: '12px', border: `1.5px solid ${palette.border}` },
  previewQHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px', fontFamily: FONT_BODY, fontWeight: 700, color: palette.deepNavy, fontSize: '13px' },
  previewQOptions: { paddingLeft: '14px' },
  previewQOption: { fontSize: '12px', color: palette.bodyText, padding: '3px 0', fontFamily: FONT_BODY, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' },
  previewQCorrect: { color: palette.softGreen, fontWeight: 700 },
  customTag: { fontSize: '10px', padding: '2px 10px', background: `${palette.warmOrange}15`, color: palette.warmOrange, borderRadius: '12px', fontFamily: FONT_DISPLAY, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' },
  generatedTag: { fontSize: '10px', padding: '2px 10px', background: `${palette.softGreen}15`, color: palette.softGreen, borderRadius: '12px', fontFamily: FONT_DISPLAY, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' },
  publishBtn: { width: '100%', padding: '13px', ...chunkyButton(palette.warmOrange, palette.warmOrangeShadow), fontSize: '14px' },
};

export default AdminDashboard;