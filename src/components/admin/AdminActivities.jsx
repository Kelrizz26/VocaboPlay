// src/components/admin/AdminActivities.jsx
// ============================================================
// ✅ ADMIN ACTIVITIES - Polished to match Super Admin
// ✅ PRESERVED: TypableSelect + Activity Type field (from your version)
// ✅ PRESERVED: All Firebase logic, Edit Modal, Delete, Host Live
// ============================================================

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../pages/firebase';
import ModalWrapper from './ModalWrapper';
import ConfirmDialog from './ConfirmDialog';

// ===== MUTED DASHBOARD PALETTE =====
const palette = {
  warmOrange: '#E9A075',
  warmOrangeShadow: '#C27E4F',
  coral: '#DB7A64',
  coralShadow: '#A95845',
  teal: '#4F9188',
  tealShadow: '#3A6A63',
  deepNavy: '#2A2845',
  bodyText: '#6B6880',
  bodyTextSoft: '#8A8799',
  cream: '#FDF9F3',
  creamSoft: '#F5EFE6',
  white: '#FFFFFF',
  border: '#EBE2D5',
  borderSoft: '#F2EBE0',
  softGreen: '#7FA574',
  softGreenShadow: '#5E7F55',
  gold: '#C9A227',
  shadow: 'rgba(42, 40, 69, 0.06)',
  shadowMd: 'rgba(42, 40, 69, 0.10)',
  danger: '#DB7A64',
  dangerShadow: '#A95845',
};

const FONT_DISPLAY = "'Fredoka', sans-serif";
const FONT_BODY = "'Nunito', sans-serif";

// ===== LOCAL STYLE HELPERS =====
const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  border: `1.5px solid ${palette.border}`,
  borderRadius: '10px',
  fontSize: '13px',
  fontFamily: FONT_BODY,
  fontWeight: 600,
  boxSizing: 'border-box',
  color: palette.deepNavy,
  outline: 'none',
  background: palette.creamSoft,
};

const labelStyle = {
  fontSize: '11px',
  fontWeight: 800,
  color: palette.bodyTextSoft,
  display: 'block',
  marginBottom: '6px',
  fontFamily: FONT_DISPLAY,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

const summaryCardStyle = (color) => ({
  background: palette.white,
  padding: '16px 18px',
  borderRadius: '14px',
  boxShadow: `0 2px 0 ${palette.border}`,
  border: `1.5px solid ${palette.border}`,
  borderLeft: `4px solid ${color}`,
});

const summaryIconStyle = (color) => ({
  width: 28,
  height: 28,
  borderRadius: 8,
  background: `${color}15`,
  border: `1.5px solid ${color}30`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 8,
});

const summaryLabelStyle = {
  fontSize: '10px',
  fontWeight: 800,
  color: palette.bodyTextSoft,
  fontFamily: FONT_DISPLAY,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '4px',
};

const summaryValueStyle = (color) => ({
  fontSize: '22px',
  fontWeight: 800,
  color: color,
  fontFamily: FONT_DISPLAY,
  lineHeight: 1,
});

const selectFilterStyle = {
  padding: '9px 14px',
  border: `1.5px solid ${palette.border}`,
  borderRadius: '10px',
  fontSize: '13px',
  fontFamily: FONT_BODY,
  fontWeight: 700,
  background: palette.white,
  color: palette.deepNavy,
  cursor: 'pointer',
  outline: 'none',
};

// ===== DUOTONE SVG ICONS =====
const Icon = ({ name, size = 18, color = palette.bodyTextSoft }) => {
  const icons = {
    activities: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M8 2v4M16 2v4M3 10h18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    add: <path d="M12 5v14M5 12h14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
    close: <path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
    check: <path d="M20 6L9 17l-5-5" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
    search: (
      <>
        <circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2" fill="none"/>
        <path d="M21 21l-4.35-4.35" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    trash: (
      <>
        <path d="M3 6h18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    edit: (
      <>
        <path d="M12 20h9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    play: <path d="M5 3l14 9-14 9V3z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
    pause: (
      <>
        <rect x="6" y="4" width="4" height="16" rx="1" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <rect x="14" y="4" width="4" height="16" rx="1" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    chart: <path d="M18 20V10M12 20V4M6 20v-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
    quiz: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="3" stroke={color} strokeWidth="2" fill="none"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    target: (
      <>
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none"/>
        <circle cx="12" cy="12" r="6" stroke={color} strokeWidth="2" fill="none"/>
        <circle cx="12" cy="12" r="2" stroke={color} strokeWidth="2" fill="none"/>
      </>
    ),
    image: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="2" fill="none"/>
        <circle cx="8.5" cy="8.5" r="1.5" stroke={color} strokeWidth="2" fill="none"/>
        <path d="M21 15l-5-5L5 21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    users: (
      <>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="9" cy="7" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    list: (
      <>
        <path d="M8 6h13M8 12h13M8 18h13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M3 6h.01M3 12h.01M3 18h.01" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    key: (
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    ),
    star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
    warning: (
      <>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M12 9v4M12 17h.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    searchOff: (
      <>
        <circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2" fill="none"/>
        <path d="M21 21l-4.35-4.35" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M8 8l6 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    clipboard: (
      <>
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <rect x="8" y="2" width="8" height="4" rx="1" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', flexShrink: 0 }}>
      {icons[name] || icons.activities}
    </svg>
  );
};

// ============================================================
// ✅ ACTIVITY TYPE OPTIONS + NORMALIZER (from your version)
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

const unSlugifyActivityType = (slug) => {
  if (!slug) return 'Quiz';
  const map = {
    'quiz': 'Quiz', 'short-quiz': 'Short Quiz', 'long-quiz': 'Long Quiz',
    'prelim': 'Prelim', 'midterm': 'Midterm', 'final': 'Final',
    'exam': 'Exam', 'match': 'Match Game', 'wordpics': 'Word Pics',
  };
  if (map[slug]) return map[slug];
  return slug.split(/[-\s]/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

// ============================================================
// ✅ TypableSelect (from your version)
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
    boxSizing: 'border-box', color: palette.deepNavy, outline: 'none', background: palette.creamSoft,
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

const getTypeIconName = (type) => {
  switch (type) {
    case 'quiz': return 'quiz';
    case 'match': return 'target';
    case 'wordpics': return 'image';
    default: return 'clipboard';
  }
};

const AdminActivities = ({
  activities,
  setActivities,
  loading,
  onHostLive,
  onShowScores,
  onCreateActivity,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingActivity, setEditingActivity] = useState(null);
  const [editQuestions, setEditQuestions] = useState([]);
  const [savingEdit, setSavingEdit] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    gameType: 'Quiz',
    category: '',
    difficulty: 3,
    isActive: true,
  });

  const filteredActivities = useMemo(() => {
    return activities.filter((a) => {
      const matchesSearch =
        !searchTerm ||
        a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.gamePin?.includes(searchTerm) ||
        a.category?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === 'all' || a.gameType === filterType;
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && a.isActive) ||
        (filterStatus === 'inactive' && !a.isActive);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [activities, searchTerm, filterType, filterStatus]);

  const stats = useMemo(() => {
    const total = activities.length;
    const totalQuestions = activities.reduce((sum, a) => sum + (a.totalQuestions || 0), 0);
    const totalParticipants = activities.reduce((sum, a) => sum + (a.participants || 0), 0);
    const activeCount = activities.filter((a) => a.isActive).length;
    return { total, totalQuestions, totalParticipants, activeCount };
  }, [activities]);

  const getTypeLabel = (type) => {
    if (!type) return 'Activity';
    const map = { 'quiz': 'Quiz', 'short-quiz': 'Short Quiz', 'long-quiz': 'Long Quiz', 'prelim': 'Prelim', 'midterm': 'Midterm', 'final': 'Final', 'exam': 'Exam', 'match': 'Match Game', 'wordpics': 'Word Pics' };
    if (map[type]) return map[type];
    return type.split(/[-\s]/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'quiz': return palette.warmOrange;
      case 'short-quiz': return palette.teal;
      case 'long-quiz': return palette.warmOrange;
      case 'prelim': return palette.coral;
      case 'midterm': return palette.warmOrange;
      case 'final': return palette.coral;
      case 'exam': return palette.coral;
      case 'match': return palette.coral;
      case 'wordpics': return palette.teal;
      default: return palette.bodyTextSoft;
    }
  };

  const getDifficultyLabel = (d) => {
    const map = { 1: 'Beginner', 2: 'Easy', 3: 'Intermediate', 4: 'Advanced', 5: 'Expert' };
    return map[d] || 'Intermediate';
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return '—'; }
  };

  const toggleActive = async (activity) => {
    try {
      const ref = doc(db, 'activities', activity.id);
      await updateDoc(ref, { isActive: !activity.isActive });
      setActivities(activities.map((a) => a.id === activity.id ? { ...a, isActive: !a.isActive } : a));
    } catch (error) { console.error(error); alert('Error updating status'); }
  };

  const startEdit = (activity) => {
    setEditingActivity(activity.id);
    setEditForm({
      title: activity.title || '',
      gameType: unSlugifyActivityType(activity.gameType || 'quiz'),
      category: activity.category || '',
      difficulty: activity.difficulty || 3,
      isActive: activity.isActive !== false,
    });
    const qs = (activity.questions || []).map((q, idx) => ({
      ...q,
      id: q.id || `q-${idx}-${Date.now()}`,
      options: Array.isArray(q.options) && q.options.length > 0
        ? [...q.options]
        : ['', '', '', ''],
    }));
    setEditQuestions(qs);
  };

  const updateQuestionText = (index, value) => {
    setEditQuestions(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], question: value };
      return copy;
    });
  };

  const updateOption = (qIndex, optIndex, value) => {
    setEditQuestions(prev => {
      const copy = [...prev];
      const opts = [...(copy[qIndex].options || [])];
      const oldValue = opts[optIndex];
      opts[optIndex] = value;
      const updatedQ = { ...copy[qIndex], options: opts };
      if (copy[qIndex].correctAnswer === oldValue) {
        updatedQ.correctAnswer = value;
      }
      copy[qIndex] = updatedQ;
      return copy;
    });
  };

  const setCorrectAnswer = (qIndex, optionText) => {
    setEditQuestions(prev => {
      const copy = [...prev];
      copy[qIndex] = { ...copy[qIndex], correctAnswer: optionText };
      return copy;
    });
  };

  const addQuestionToEdit = () => {
    setEditQuestions(prev => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        type: 'custom',
        wordId: null,
        word: '',
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        difficulty: editForm.difficulty || 3,
        category: editForm.category || 'custom',
      }
    ]);
  };

  const removeQuestionFromEdit = (index) => {
    setEditQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const saveEdit = async () => {
    if (!editForm.title.trim()) {
      alert('Title is required');
      return;
    }

    for (let i = 0; i < editQuestions.length; i++) {
      const q = editQuestions[i];
      if (!q.question?.trim()) {
        alert(`Question #${i + 1} is empty. Please fill it in or remove it.`);
        return;
      }
      if (!q.options || q.options.length < 2 || !q.options[0]?.trim() || !q.options[1]?.trim()) {
        alert(`Question #${i + 1} needs at least options A and B.`);
        return;
      }
      if (!q.correctAnswer?.trim()) {
        alert(`Question #${i + 1} needs a correct answer. Please click the circle next to the correct option.`);
        return;
      }
    }

    setSavingEdit(true);
    try {
      const ref = doc(db, 'activities', editingActivity);
      const updateData = {
        title: editForm.title.trim(),
        gameType: slugifyActivityType(editForm.gameType),
        category: editForm.category,
        difficulty: editForm.difficulty,
        isActive: editForm.isActive,
        questions: editQuestions,
        totalQuestions: editQuestions.length,
      };
      await updateDoc(ref, updateData);
      setActivities(activities.map((a) => a.id === editingActivity ? { ...a, ...updateData } : a));
      setEditingActivity(null);
      setEditQuestions([]);
    } catch (error) {
      console.error(error);
      alert('Error saving changes: ' + error.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const cancelEdit = () => {
    setEditingActivity(null);
    setEditQuestions([]);
  };

  const deleteActivity = async (id) => {
    try {
      await deleteDoc(doc(db, 'activities', id));
      setActivities(activities.filter((a) => a.id !== id));
    } catch (error) { console.error(error); alert('Error deleting activity'); }
  };

  const requestDelete = (activity) => {
    setConfirmAction({
      title: 'Delete Activity',
      message: `Are you sure you want to delete "${activity.title}"?`,
      confirmLabel: 'Delete',
      danger: true,
      onConfirm: () => { deleteActivity(activity.id); setConfirmAction(null); },
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ===== HEADER BAR ===== */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '16px 20px',
        background: palette.white,
        borderRadius: '14px',
        border: `1.5px solid ${palette.border}`,
        boxShadow: `0 2px 0 ${palette.border}`,
      }}>
        <div>
          <h2 style={{
            margin: 0,
            fontFamily: FONT_DISPLAY,
            color: palette.deepNavy,
            fontWeight: 800,
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            letterSpacing: '-0.2px',
          }}>
            <Icon name="activities" size={18} color={palette.warmOrange} />
            Activities
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: palette.bodyTextSoft, fontWeight: 600 }}>
            Manage all quizzes and exams created by teachers
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '12px',
            color: palette.bodyTextSoft,
            background: palette.creamSoft,
            padding: '8px 14px',
            borderRadius: '999px',
            border: `1.5px solid ${palette.border}`,
            fontFamily: FONT_BODY,
            fontWeight: 700,
          }}>
            Total: {stats.total} {stats.total === 1 ? 'Activity' : 'Activities'}
          </span>
          <button
            onClick={onCreateActivity}
            style={{
              padding: '10px 18px',
              background: palette.warmOrange,
              color: palette.white,
              border: 'none',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              fontFamily: FONT_DISPLAY,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              boxShadow: `0 3px 0 ${palette.warmOrangeShadow}`,
              transition: 'transform 0.1s ease, box-shadow 0.1s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(3px)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 3px 0 ${palette.warmOrangeShadow}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 3px 0 ${palette.warmOrangeShadow}`;
            }}
          >
            <Icon name="add" size={13} color={palette.white} />
            Create Activity
          </button>
        </div>
      </div>

      {/* ===== SUMMARY TILES ===== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
      }}>
        <div style={summaryCardStyle(palette.warmOrange)}>
          <div style={summaryIconStyle(palette.warmOrange)}>
            <Icon name="clipboard" size={14} color={palette.warmOrange} />
          </div>
          <div style={summaryLabelStyle}>Total Activities</div>
          <div style={summaryValueStyle(palette.warmOrange)}>{stats.total}</div>
        </div>
        <div style={summaryCardStyle(palette.softGreen)}>
          <div style={summaryIconStyle(palette.softGreen)}>
            <Icon name="check" size={14} color={palette.softGreen} />
          </div>
          <div style={summaryLabelStyle}>Active</div>
          <div style={summaryValueStyle(palette.softGreen)}>{stats.activeCount}</div>
        </div>
        <div style={summaryCardStyle(palette.coral)}>
          <div style={summaryIconStyle(palette.coral)}>
            <Icon name="quiz" size={14} color={palette.coral} />
          </div>
          <div style={summaryLabelStyle}>Total Questions</div>
          <div style={summaryValueStyle(palette.coral)}>{stats.totalQuestions}</div>
        </div>
        <div style={summaryCardStyle(palette.teal)}>
          <div style={summaryIconStyle(palette.teal)}>
            <Icon name="users" size={14} color={palette.teal} />
          </div>
          <div style={summaryLabelStyle}>Total Participants</div>
          <div style={summaryValueStyle(palette.teal)}>{stats.totalParticipants}</div>
        </div>
      </div>

      {/* ===== FILTER CARD ===== */}
      <div style={{
        background: palette.white,
        padding: '20px 24px',
        borderRadius: '16px',
        border: `1.5px solid ${palette.border}`,
        boxShadow: `0 2px 0 ${palette.border}`,
      }}>
        <div style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          <div style={{
            position: 'relative',
            flex: 1,
            minWidth: '220px',
          }}>
            <input
              type="text"
              placeholder="Search title, PIN, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '9px 12px 9px 32px',
                border: `1.5px solid ${palette.border}`,
                borderRadius: '10px',
                fontSize: '13px',
                fontFamily: FONT_BODY,
                fontWeight: 600,
                background: palette.creamSoft,
                color: palette.deepNavy,
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}>
              <Icon name="search" size={13} color={palette.bodyTextSoft} />
            </div>
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={selectFilterStyle}
          >
            <option value="all">All Types</option>
            <option value="quiz">Quiz</option>
            <option value="short-quiz">Short Quiz</option>
            <option value="long-quiz">Long Quiz</option>
            <option value="prelim">Prelim</option>
            <option value="midterm">Midterm</option>
            <option value="final">Final</option>
            <option value="match">Match</option>
            <option value="wordpics">Word Pics</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={selectFilterStyle}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div style={{
          fontSize: '12px',
          color: palette.bodyTextSoft,
          fontWeight: 700,
          marginTop: '12px',
          fontFamily: FONT_BODY,
        }}>
          Showing <strong style={{ color: palette.warmOrange }}>{filteredActivities.length}</strong> of {activities.length} activities
        </div>
      </div>

      {/* ===== ACTIVITIES GRID ===== */}
      {loading.activities ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 20px',
          background: palette.white,
          borderRadius: '16px',
          border: `1.5px solid ${palette.border}`,
          boxShadow: `0 2px 0 ${palette.border}`,
          color: palette.bodyTextSoft,
          fontFamily: FONT_BODY,
          fontWeight: 600,
          fontSize: '13px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <Icon name="activities" size={32} color={palette.warmOrange} />
          </div>
          Loading activities...
        </div>
      ) : filteredActivities.length === 0 ? (
        <EmptyState hasActivities={activities.length > 0} searchTerm={searchTerm} onCreateActivity={onCreateActivity} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {filteredActivities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onHostLive={onHostLive}
              onShowScores={onShowScores}
              onEdit={startEdit}
              onDelete={requestDelete}
              onToggleActive={toggleActive}
              getTypeLabel={getTypeLabel}
              getTypeColor={getTypeColor}
              getDifficultyLabel={getDifficultyLabel}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}

      {/* ===== EDIT MODAL (with TypableSelect for Activity Type) ===== */}
      {editingActivity && (
        <ModalWrapper onClose={cancelEdit}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 800,
            marginBottom: '20px',
            color: palette.deepNavy,
            fontFamily: FONT_DISPLAY,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            letterSpacing: '-0.2px',
          }}>
            <Icon name="edit" size={18} color={palette.warmOrange} />
            Edit Activity
          </h2>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Activity Title *</label>
            <input
              type="text"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              style={inputStyle}
              placeholder="e.g., Science Quiz #1"
            />
          </div>

          {/* ✅ Activity Type with TypableSelect */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Activity Type</label>
            <TypableSelect
              value={editForm.gameType}
              onChange={(val) => setEditForm({ ...editForm, gameType: val })}
              options={ACTIVITY_TYPE_SUGGESTIONS}
              placeholder="e.g., Quiz, Short Quiz, Prelim..."
              inputStyle={{ ...inputStyle, paddingRight: '40px' }}
            />
            <div style={{ fontSize: '10px', color: palette.bodyTextSoft, marginTop: '4px', fontFamily: FONT_BODY, fontWeight: 600 }}>
              💡 Type any type or pick from suggestions
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
              paddingBottom: '10px',
              borderBottom: `1.5px solid ${palette.border}`,
              flexWrap: 'wrap',
              gap: '10px',
            }}>
              <div>
                <div style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  color: palette.deepNavy,
                  fontFamily: FONT_DISPLAY,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <Icon name="list" size={14} color={palette.warmOrange} />
                  Questions ({editQuestions.length})
                </div>
                <div style={{
                  fontSize: '11px',
                  color: palette.bodyTextSoft,
                  fontFamily: FONT_BODY,
                  fontWeight: 600,
                  marginTop: '2px',
                }}>
                  Click the circle to mark the correct answer
                </div>
              </div>
              <button
                onClick={addQuestionToEdit}
                style={{
                  padding: '8px 14px',
                  background: palette.softGreen,
                  color: palette.white,
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontFamily: FONT_DISPLAY,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  boxShadow: `0 3px 0 ${palette.softGreenShadow}`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <Icon name="add" size={12} color={palette.white} />
                Add Question
              </button>
            </div>

            {editQuestions.length === 0 ? (
              <div style={{
                padding: '30px',
                textAlign: 'center',
                background: palette.creamSoft,
                borderRadius: '12px',
                border: `1.5px dashed ${palette.border}`,
                color: palette.bodyTextSoft,
                fontFamily: FONT_BODY,
                fontWeight: 600,
                fontSize: '13px',
              }}>
                No questions yet. Click "Add Question" to start.
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                maxHeight: '55vh',
                overflowY: 'auto',
                paddingRight: '6px',
              }}>
                {editQuestions.map((q, qIndex) => {
                  const correctOptionIndex = (q.options || []).findIndex(
                    (opt) => opt === q.correctAnswer && opt.trim() !== ''
                  );

                  return (
                    <div
                      key={q.id || qIndex}
                      style={{
                        padding: '16px',
                        background: palette.creamSoft,
                        borderRadius: '14px',
                        border: `1.5px solid ${palette.border}`,
                        boxShadow: `0 2px 0 ${palette.border}`,
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px',
                      }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          color: palette.warmOrange,
                          background: `${palette.warmOrange}15`,
                          padding: '3px 10px',
                          borderRadius: '999px',
                          fontFamily: FONT_DISPLAY,
                          border: `1px solid ${palette.warmOrange}40`,
                          letterSpacing: '0.04em',
                        }}>
                          Q{qIndex + 1}
                        </span>
                        <button
                          onClick={() => removeQuestionFromEdit(qIndex)}
                          style={{
                            background: `${palette.danger}15`,
                            border: `1.5px solid ${palette.danger}40`,
                            color: palette.danger,
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title="Remove question"
                        >
                          <Icon name="close" size={12} color={palette.danger} />
                        </button>
                      </div>

                      <div style={{ marginBottom: '12px' }}>
                        <label style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          color: palette.bodyTextSoft,
                          display: 'block',
                          marginBottom: '6px',
                          fontFamily: FONT_DISPLAY,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                        }}>
                          Question *
                        </label>
                        <input
                          type="text"
                          value={q.question || ''}
                          onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                          placeholder="Enter your question"
                          style={inputStyle}
                        />
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '10px',
                        marginBottom: '12px',
                      }}>
                        {['A', 'B', 'C', 'D'].map((letter, optIndex) => {
                          const optValue = q.options?.[optIndex] || '';
                          const isCorrect = optIndex === correctOptionIndex && optValue.trim() !== '';

                          return (
                            <div key={letter} style={{ position: 'relative' }}>
                              <label style={{
                                fontSize: '10px',
                                fontWeight: 800,
                                color: palette.bodyTextSoft,
                                display: 'block',
                                marginBottom: '4px',
                                fontFamily: FONT_DISPLAY,
                                letterSpacing: '0.06em',
                                textTransform: 'uppercase',
                              }}>
                                Option {letter} {(optIndex === 0 || optIndex === 1) && '*'}
                              </label>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <input
                                  type="text"
                                  value={optValue}
                                  onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                                  placeholder={`Option ${letter}${optIndex >= 2 ? ' (optional)' : ''}`}
                                  style={{
                                    ...inputStyle,
                                    borderColor: isCorrect ? palette.softGreen : palette.border,
                                    background: isCorrect ? `${palette.softGreen}10` : inputStyle.background,
                                  }}
                                />
                                <button
                                  onClick={() => optValue.trim() && setCorrectAnswer(qIndex, optValue)}
                                  disabled={!optValue.trim()}
                                  style={{
                                    flexShrink: 0,
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    border: `1.5px solid ${isCorrect ? palette.softGreen : palette.border}`,
                                    background: isCorrect ? palette.softGreen : palette.white,
                                    cursor: optValue.trim() ? 'pointer' : 'not-allowed',
                                    opacity: optValue.trim() ? 1 : 0.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.15s ease',
                                    boxShadow: isCorrect ? `0 2px 0 ${palette.softGreenShadow}` : `0 2px 0 ${palette.border}`,
                                  }}
                                  title={isCorrect ? 'Correct answer' : 'Mark as correct'}
                                >
                                  {isCorrect && <Icon name="check" size={14} color={palette.white} />}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {!q.correctAnswer && (
                        <div style={{
                          fontSize: '11px',
                          color: palette.danger,
                          fontFamily: FONT_BODY,
                          fontWeight: 700,
                          marginTop: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}>
                          <Icon name="warning" size={12} color={palette.danger} />
                          Please mark the correct answer by clicking the circle button.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'flex-end',
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: `1.5px solid ${palette.border}`,
          }}>
            <button
              onClick={cancelEdit}
              disabled={savingEdit}
              style={{
                padding: '10px 20px',
                background: palette.white,
                color: palette.bodyText,
                border: `1.5px solid ${palette.border}`,
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: savingEdit ? 'not-allowed' : 'pointer',
                fontFamily: FONT_DISPLAY,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                boxShadow: `0 3px 0 ${palette.border}`,
                opacity: savingEdit ? 0.6 : 1,
              }}
            >
              Cancel
            </button>
            <button
              onClick={saveEdit}
              disabled={savingEdit}
              style={{
                padding: '10px 20px',
                background: palette.warmOrange,
                color: palette.white,
                border: 'none',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: savingEdit ? 'not-allowed' : 'pointer',
                fontFamily: FONT_DISPLAY,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                boxShadow: `0 3px 0 ${palette.warmOrangeShadow}`,
                opacity: savingEdit ? 0.6 : 1,
              }}
            >
              {savingEdit ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </ModalWrapper>
      )}

      <ConfirmDialog
        open={!!confirmAction}
        title={confirmAction?.title}
        message={confirmAction?.message}
        confirmLabel={confirmAction?.confirmLabel}
        danger={confirmAction?.danger}
        onConfirm={confirmAction?.onConfirm}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
};

// ============================================================
// SUB-COMPONENTS
// ============================================================
const ActivityCard = ({
  activity,
  onHostLive,
  onShowScores,
  onEdit,
  onDelete,
  onToggleActive,
  getTypeLabel,
  getTypeColor,
  getDifficultyLabel,
  formatDate,
}) => {
  const [hovered, setHovered] = useState(false);
  const accent = getTypeColor(activity.gameType);
  const iconName = getTypeIconName(activity.gameType);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: palette.white,
        border: `1.5px solid ${hovered ? `${accent}66` : palette.border}`,
        borderTop: `6px solid ${accent}`,
        borderRadius: '16px',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        boxShadow: hovered
          ? `0 2px 0 ${palette.border}, 0 10px 24px ${palette.shadow}`
          : `0 2px 0 ${palette.border}`,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{
        padding: '18px 20px',
        background: `${accent}10`,
        borderBottom: `1.5px solid ${palette.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: `${accent}20`,
          border: `1.5px solid ${accent}40`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon name={iconName} size={20} color={accent} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontSize: '15px',
            fontWeight: 800,
            color: palette.deepNavy,
            margin: 0,
            fontFamily: FONT_DISPLAY,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            letterSpacing: '-0.2px',
          }}>{activity.title}</h3>
          <div style={{
            fontSize: '11px',
            color: palette.bodyTextSoft,
            fontFamily: FONT_BODY,
            marginTop: '2px',
            fontWeight: 600,
          }}>{getTypeLabel(activity.gameType)} • {activity.totalQuestions || 0} questions</div>
        </div>
        <span style={{
          fontSize: '10px',
          fontWeight: 800,
          padding: '4px 10px',
          borderRadius: '999px',
          background: activity.isActive ? `${palette.softGreen}15` : `${palette.danger}15`,
          color: activity.isActive ? palette.softGreen : palette.danger,
          border: `1.5px solid ${activity.isActive ? `${palette.softGreen}40` : `${palette.danger}40`}`,
          flexShrink: 0,
          fontFamily: FONT_DISPLAY,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}>{activity.isActive ? '● Active' : '○ Inactive'}</span>
      </div>

      <div style={{
        padding: '12px 20px',
        background: palette.creamSoft,
        borderBottom: `1.5px solid ${palette.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{
          fontSize: '11px',
          color: palette.bodyTextSoft,
          fontFamily: FONT_DISPLAY,
          fontWeight: 800,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <Icon name="key" size={11} color={palette.bodyTextSoft} />
          Game PIN
        </span>
        <span style={{
          fontSize: '17px',
          fontWeight: 800,
          color: accent,
          fontFamily: FONT_DISPLAY,
          letterSpacing: '2px',
        }}>{activity.gamePin || '------'}</span>
      </div>

      <div style={{ padding: '16px 20px', flex: 1 }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
          <Chip>{activity.category || 'General'}</Chip>
          <Chip icon={<Icon name="star" size={10} color={palette.gold} />}>
            {getDifficultyLabel(activity.difficulty)}
          </Chip>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '12px',
          background: palette.creamSoft,
          borderRadius: '10px',
          border: `1.5px solid ${palette.border}`,
          marginBottom: '14px',
        }}>
          <MiniStat label="Questions" value={activity.totalQuestions || 0} />
          <div style={{ width: '1px', background: palette.border }} />
          <MiniStat label="Participants" value={activity.participants || 0} />
          <div style={{ width: '1px', background: palette.border }} />
          <MiniStat label="Created" value={formatDate(activity.createdAt)} small />
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <button
            onClick={() => onHostLive && onHostLive(activity)}
            style={{
              flex: 1,
              padding: '9px',
              background: palette.warmOrange,
              color: palette.white,
              border: 'none',
              borderRadius: '10px',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              fontFamily: FONT_DISPLAY,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              boxShadow: `0 2px 0 ${palette.warmOrangeShadow}`,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
            }}
          >
            <Icon name="play" size={11} color={palette.white} />
            Host Live
          </button>
          <button
            onClick={() => onShowScores && onShowScores(activity)}
            style={{
              flex: 1,
              padding: '9px',
              background: palette.white,
              color: palette.deepNavy,
              border: `1.5px solid ${palette.border}`,
              borderRadius: '10px',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              fontFamily: FONT_DISPLAY,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              boxShadow: `0 2px 0 ${palette.border}`,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
            }}
          >
            <Icon name="chart" size={11} color={palette.deepNavy} />
            Scores
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onEdit(activity)}
            style={{
              flex: 1,
              padding: '8px',
              background: palette.white,
              color: palette.bodyText,
              border: `1.5px solid ${palette.border}`,
              borderRadius: '8px',
              fontSize: '10px',
              fontWeight: 800,
              cursor: 'pointer',
              fontFamily: FONT_DISPLAY,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              boxShadow: `0 2px 0 ${palette.border}`,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}
          >
            <Icon name="edit" size={10} color={palette.bodyText} />
            Edit
          </button>
          <button
            onClick={() => onToggleActive(activity)}
            style={{
              flex: 1,
              padding: '8px',
              background: palette.white,
              color: palette.bodyText,
              border: `1.5px solid ${palette.border}`,
              borderRadius: '8px',
              fontSize: '10px',
              fontWeight: 800,
              cursor: 'pointer',
              fontFamily: FONT_DISPLAY,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              boxShadow: `0 2px 0 ${palette.border}`,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}
          >
            <Icon name={activity.isActive ? 'pause' : 'play'} size={10} color={palette.bodyText} />
            {activity.isActive ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={() => onDelete(activity)}
            style={{
              padding: '8px 12px',
              background: `${palette.danger}12`,
              color: palette.danger,
              border: `1.5px solid ${palette.danger}40`,
              borderRadius: '8px',
              fontSize: '10px',
              fontWeight: 800,
              cursor: 'pointer',
              fontFamily: FONT_DISPLAY,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              boxShadow: `0 2px 0 ${palette.danger}20`,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="trash" size={10} color={palette.danger} />
          </button>
        </div>
      </div>
    </div>
  );
};

const Chip = ({ children, icon, style }) => (
  <span style={{
    fontSize: '11px',
    background: palette.creamSoft,
    color: palette.bodyText,
    padding: '4px 10px',
    borderRadius: '999px',
    fontFamily: FONT_DISPLAY,
    fontWeight: 800,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    border: `1.5px solid ${palette.border}`,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    ...style,
  }}>
    {icon}
    {children}
  </span>
);

const MiniStat = ({ label, value, small }) => (
  <div style={{ textAlign: 'center', flex: 1 }}>
    <div style={{
      fontSize: small ? '11px' : '16px',
      fontWeight: 800,
      color: palette.deepNavy,
      fontFamily: FONT_DISPLAY,
      lineHeight: 1.1,
    }}>{value}</div>
    <div style={{
      fontSize: '10px',
      color: palette.bodyTextSoft,
      fontFamily: FONT_DISPLAY,
      marginTop: '4px',
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
    }}>{label}</div>
  </div>
);

const EmptyState = ({ hasActivities, searchTerm, onCreateActivity }) => (
  <div style={{
    textAlign: 'center',
    padding: '60px 20px',
    background: palette.white,
    borderRadius: '16px',
    border: `1.5px dashed ${palette.border}`,
  }}>
    <div style={{
      display: 'inline-flex',
      width: '72px',
      height: '72px',
      borderRadius: '50%',
      background: palette.creamSoft,
      border: `1.5px solid ${palette.border}`,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '16px',
    }}>
      <Icon
        name={hasActivities ? 'searchOff' : 'clipboard'}
        size={32}
        color={palette.warmOrange}
      />
    </div>
    <h3 style={{
      fontSize: '16px',
      fontWeight: 800,
      color: palette.deepNavy,
      marginBottom: '6px',
      fontFamily: FONT_DISPLAY,
      letterSpacing: '-0.2px',
    }}>{hasActivities ? 'No activities match your search' : 'No activities yet'}</h3>
    <p style={{
      fontSize: '13px',
      color: palette.bodyTextSoft,
      fontFamily: FONT_BODY,
      fontWeight: 600,
      margin: '0 0 20px 0',
      maxWidth: '400px',
      marginLeft: 'auto',
      marginRight: 'auto',
      lineHeight: 1.6,
    }}>
      {hasActivities ? `Try a different search term${searchTerm ? ` than "${searchTerm}"` : ''}.` : 'Activities created by teachers will appear here.'}
    </p>
    {!hasActivities && onCreateActivity && (
      <button
        onClick={onCreateActivity}
        style={{
          padding: '11px 22px',
          background: palette.warmOrange,
          color: palette.white,
          border: 'none',
          borderRadius: '10px',
          fontSize: '12px',
          fontWeight: 800,
          cursor: 'pointer',
          fontFamily: FONT_DISPLAY,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          boxShadow: `0 3px 0 ${palette.warmOrangeShadow}`,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <Icon name="add" size={13} color={palette.white} />
        Create Your First Activity
      </button>
    )}
  </div>
);

export default AdminActivities;