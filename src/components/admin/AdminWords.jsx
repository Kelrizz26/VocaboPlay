// src/components/admin/AdminWords.jsx
// ============================================================
// CEFR-based Word Library admin panel — polished to match Super Admin
// WordPics sync removed. Antonyms removed.
// Uses `cefrLevel` (A1..C2) instead of `difficulty`.
// Has single example sentence + single synonym.
// ============================================================

import React, { useState } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
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

const thStyle = {
  padding: '12px',
  textAlign: 'left',
  color: palette.bodyTextSoft,
  fontFamily: FONT_DISPLAY,
  fontSize: '10px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontWeight: 800,
};

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
    book: (
      <>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    add: <path d="M12 5v14M5 12h14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
    edit: (
      <>
        <path d="M12 20h9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    trash: (
      <>
        <path d="M3 6h18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2" fill="none"/>
        <path d="M21 21l-4.35-4.35" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none"/>
        <path d="M12 6v6l4 2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
    check: <path d="M20 6L9 17l-5-5" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
    graduation: (
      <>
        <path d="M22 10L12 5 2 10l10 5 10-5z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M6 12v5c0 1 3 3 6 3s6-2 6-3v-5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    target: (
      <>
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none"/>
        <circle cx="12" cy="12" r="6" stroke={color} strokeWidth="2" fill="none"/>
        <circle cx="12" cy="12" r="2" stroke={color} strokeWidth="2" fill="none"/>
      </>
    ),
    trend: (
      <>
        <path d="M23 6l-9.5 9.5-5-5L1 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M17 6h6v6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', flexShrink: 0 }}>
      {icons[name] || icons.book}
    </svg>
  );
};

// ============================================================
// CEFR SYSTEM (local)
// ============================================================
const CEFR_LEVELS = [
  { id: 'A1', name: 'A1', label: 'Beginner',           color: '#2E7D32', bg: 'rgba(46, 125, 50, 0.12)' },
  { id: 'A2', name: 'A2', label: 'Elementary',         color: '#388E3C', bg: 'rgba(56, 142, 60, 0.12)' },
  { id: 'B1', name: 'B1', label: 'Intermediate',       color: '#B85C1A', bg: 'rgba(184, 92, 26, 0.12)' },
  { id: 'B2', name: 'B2', label: 'Upper-Intermediate', color: '#E07B00', bg: 'rgba(224, 123, 0, 0.12)' },
  { id: 'C1', name: 'C1', label: 'Advanced',           color: '#A93226', bg: 'rgba(169, 50, 38, 0.12)' },
  { id: 'C2', name: 'C2', label: 'Proficiency',        color: '#7B1E1E', bg: 'rgba(123, 30, 30, 0.12)' },
];

const LEGACY_DIFFICULTY_MAP = {
  beginner: 'A1', easy: 'A1',
  intermediate: 'B1', medium: 'B1',
  advanced: 'C1', hard: 'C1',
};

const normalizeCefr = (value) => {
  if (!value) return 'B1';
  const upper = String(value).toUpperCase();
  if (['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(upper)) return upper;
  const lower = String(value).toLowerCase();
  return LEGACY_DIFFICULTY_MAP[lower] || 'B1';
};

const cefrColor = (level) => {
  const code = normalizeCefr(level);
  const found = CEFR_LEVELS.find((l) => l.id === code);
  return found ? found.color : palette.bodyTextSoft;
};

const cefrBg = (level) => {
  const code = normalizeCefr(level);
  const found = CEFR_LEVELS.find((l) => l.id === code);
  return found ? found.bg : palette.creamSoft;
};

// ============================================================
// CATEGORY / POS / SOURCE OPTIONS
// ============================================================
const CATEGORIES = [
  'academic','action verbs','learning strategies','Emotions','Size','Speed','Quality',
  'Personality','Objects','Discovery','Actions','Strength','Wealth','Appearance',
  'Humor','Travel','Verbs','General',
];

const PARTS_OF_SPEECH = [
  'noun','verb','adjective','adverb','preposition','conjunction','pronoun',
  'interjection','determiner','noun/verb','preposition/conjunction',
];

const SOURCES = [
  'Oxford 3000','Oxford 5000','Oxford 3000 / Oxford 5000',
  'Cambridge English Vocabulary Profile (EVP)','Teacher-made','Other',
];

const getWordCefr = (w) => normalizeCefr(w.cefrLevel || w.difficulty);

const EMPTY_FORM = {
  word: '',
  pronunciation: '',
  definition: '',
  cefrLevel: 'B1',
  partOfSpeech: 'noun',
  category: 'academic',
  source: 'Oxford 3000',
  example: '',
  synonym: '',
};

const AdminWords = ({ words, setWords, loading }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCefr, setFilterCefr] = useState('all');
  const [filterPos, setFilterPos] = useState('all');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [confirmAction, setConfirmAction] = useState(null);

  // ---------- FILTER ----------
  const filtered = words.filter((w) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      w.word?.toLowerCase().includes(term) ||
      w.definition?.toLowerCase().includes(term) ||
      w.category?.toLowerCase().includes(term) ||
      w.partOfSpeech?.toLowerCase().includes(term);

    const wordCefr = getWordCefr(w);
    const matchesCefr = filterCefr === 'all' || wordCefr === filterCefr;
    const matchesPos = filterPos === 'all' || (w.partOfSpeech || '') === filterPos;

    return matchesSearch && matchesCefr && matchesPos;
  });

  // ---------- STATS ----------
  const cefrCounts = CEFR_LEVELS.reduce((acc, lvl) => {
    acc[lvl.id] = words.filter((w) => getWordCefr(w) === lvl.id).length;
    return acc;
  }, {});

  const totalStudies = words.reduce((a, w) => a + (w.timesStudied || 0), 0);

  const groupedStats = {
    beginner: (cefrCounts.A1 || 0) + (cefrCounts.A2 || 0),
    intermediate: (cefrCounts.B1 || 0) + (cefrCounts.B2 || 0),
    advanced: (cefrCounts.C1 || 0) + (cefrCounts.C2 || 0),
  };

  // ---------- OPEN MODAL ----------
  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (w) => {
    setEditingId(w.id);

    const firstExample = Array.isArray(w.examples) && w.examples.length
      ? w.examples[0]
      : (typeof w.examples === 'string' ? w.examples : '');

    const firstSynonym = Array.isArray(w.synonyms) && w.synonyms.length
      ? w.synonyms[0]
      : (typeof w.synonyms === 'string' ? w.synonyms : '');

    setForm({
      word: w.word || '',
      pronunciation: w.pronunciation || '',
      definition: w.definition || '',
      cefrLevel: getWordCefr(w),
      partOfSpeech: w.partOfSpeech || 'noun',
      category: w.category || 'academic',
      source: w.source || 'Oxford 3000',
      example: firstExample,
      synonym: firstSynonym,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  // ---------- SAVE (ADD / UPDATE) ----------
  const buildPayload = () => {
    const example = form.example.trim();
    const synonym = form.synonym.trim();

    return {
      word: form.word.trim(),
      pronunciation: form.pronunciation.trim(),
      definition: form.definition.trim(),
      cefrLevel: form.cefrLevel,
      partOfSpeech: form.partOfSpeech,
      category: form.category || 'academic',
      source: form.source || 'Oxford 3000',
      examples: example ? [example] : [],
      synonyms: synonym ? [synonym] : [],
      antonyms: [],
      color: cefrColor(form.cefrLevel),
    };
  };

  const validate = () => {
    if (!form.word.trim()) {
      alert('Word is required.');
      return false;
    }
    if (!form.definition.trim()) {
      alert('Definition is required.');
      return false;
    }
    if (!form.example.trim()) {
      alert('Please add an example sentence.');
      return false;
    }
    return true;
  };

  const handleAdd = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        ...buildPayload(),
        timesStudied: 0,
        dateAdded: new Date().toISOString(),
        lastReviewed: null,
      };
      const ref = await addDoc(collection(db, 'words'), payload);
      setWords((prev) => [...prev, { id: ref.id, ...payload }]);
      closeModal();
    } catch (err) {
      alert('Firestore error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        ...buildPayload(),
        lastReviewed: new Date().toISOString(),
      };
      await updateDoc(doc(db, 'words', editingId), payload);
      setWords((prev) =>
        prev.map((w) => (w.id === editingId ? { ...w, ...payload } : w))
      );
      closeModal();
    } catch (err) {
      alert('Firestore error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // ---------- DELETE ----------
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'words', id));
      setWords((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      alert('Firestore error: ' + err.message);
    }
  };

  const requestDelete = (id) => {
    setConfirmAction({
      title: 'Delete Word',
      message: 'This will permanently delete this word. This cannot be undone.',
      confirmLabel: 'Delete',
      danger: true,
      onConfirm: () => {
        handleDelete(id);
        setConfirmAction(null);
      },
    });
  };

  // ---------- INCREMENT STUDY COUNT ----------
  const handleIncrement = async (id) => {
    const word = words.find((w) => w.id === id);
    const newCount = (word.timesStudied || 0) + 1;
    const now = new Date().toISOString();
    try {
      await updateDoc(doc(db, 'words', id), {
        timesStudied: newCount,
        lastReviewed: now,
      });
      setWords((prev) =>
        prev.map((w) =>
          w.id === id ? { ...w, timesStudied: newCount, lastReviewed: now } : w
        )
      );
    } catch (err) {
      alert('Firestore error: ' + err.message);
    }
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
            <Icon name="book" size={18} color={palette.warmOrange} />
            Word Library
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: palette.bodyTextSoft, fontWeight: 600 }}>
            Manage CEFR-aligned vocabulary across all games
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
            Total: {words.length} Words
          </span>
          <button
            onClick={openAdd}
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
            Add New Word
          </button>
        </div>
      </div>

      {/* ===== SUMMARY TILES ===== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
      }}>
        <div style={summaryCardStyle(palette.softGreen)}>
          <div style={summaryIconStyle(palette.softGreen)}>
            <Icon name="graduation" size={14} color={palette.softGreen} />
          </div>
          <div style={summaryLabelStyle}>Beginner (A1–A2)</div>
          <div style={summaryValueStyle(palette.softGreen)}>{groupedStats.beginner}</div>
        </div>
        <div style={summaryCardStyle(palette.gold)}>
          <div style={summaryIconStyle(palette.gold)}>
            <Icon name="target" size={14} color={palette.gold} />
          </div>
          <div style={summaryLabelStyle}>Intermediate (B1–B2)</div>
          <div style={summaryValueStyle(palette.gold)}>{groupedStats.intermediate}</div>
        </div>
        <div style={summaryCardStyle(palette.coral)}>
          <div style={summaryIconStyle(palette.coral)}>
            <Icon name="trend" size={14} color={palette.coral} />
          </div>
          <div style={summaryLabelStyle}>Advanced (C1–C2)</div>
          <div style={summaryValueStyle(palette.coral)}>{groupedStats.advanced}</div>
        </div>
        <div style={summaryCardStyle(palette.teal)}>
          <div style={summaryIconStyle(palette.teal)}>
            <Icon name="book" size={14} color={palette.teal} />
          </div>
          <div style={summaryLabelStyle}>Total Studies</div>
          <div style={summaryValueStyle(palette.teal)}>{totalStudies}</div>
        </div>
      </div>

      {/* ===== TABLE CARD ===== */}
      <div style={{
        background: palette.white,
        padding: '24px',
        borderRadius: '16px',
        boxShadow: `0 2px 0 ${palette.border}`,
        border: `1.5px solid ${palette.border}`,
      }}>
        {/* Card header + filters */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '18px',
        }}>
          <h3 style={{
            margin: 0,
            fontFamily: FONT_DISPLAY,
            color: palette.deepNavy,
            fontWeight: 800,
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            letterSpacing: '-0.2px',
          }}>
            <Icon name="book" size={16} color={palette.warmOrange} />
            All Words
            <span style={{
              fontSize: '12px',
              fontWeight: 800,
              color: palette.warmOrange,
              background: `${palette.warmOrange}15`,
              padding: '3px 10px',
              borderRadius: '999px',
              border: `1px solid ${palette.warmOrange}40`,
              fontFamily: FONT_DISPLAY,
              marginLeft: '4px',
            }}>
              {filtered.length}
            </span>
          </h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search words..."
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
                  width: '220px',
                }}
              />
              <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                <Icon name="search" size={13} color={palette.bodyTextSoft} />
              </div>
            </div>
            <select
              value={filterCefr}
              onChange={(e) => setFilterCefr(e.target.value)}
              style={selectFilterStyle}
            >
              <option value="all">All CEFR Levels</option>
              {CEFR_LEVELS.map((lvl) => (
                <option key={lvl.id} value={lvl.id}>
                  {lvl.id} · {lvl.label}
                </option>
              ))}
            </select>
            <select
              value={filterPos}
              onChange={(e) => setFilterPos(e.target.value)}
              style={selectFilterStyle}
            >
              <option value="all">All Parts of Speech</option>
              {PARTS_OF_SPEECH.map((pos) => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{
          fontSize: '12px',
          color: palette.bodyTextSoft,
          fontWeight: 700,
          marginBottom: '12px',
          fontFamily: FONT_BODY,
        }}>
          Showing <strong style={{ color: palette.warmOrange }}>{filtered.length}</strong> of {words.length} words
        </div>

        {/* Table */}
        {loading.words ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 20px',
            color: palette.bodyTextSoft,
            fontFamily: FONT_BODY,
            fontWeight: 600,
            fontSize: '13px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <Icon name="clock" size={32} color={palette.warmOrange} />
            </div>
            Loading words from Firestore...
          </div>
        ) : words.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{
              display: 'inline-flex',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: palette.creamSoft,
              border: `1.5px solid ${palette.border}`,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px',
            }}>
              <Icon name="book" size={28} color={palette.warmOrange} />
            </div>
            <h3 style={{
              fontSize: '16px',
              color: palette.deepNavy,
              marginBottom: '6px',
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
            }}>No Words Yet</h3>
            <p style={{
              fontSize: '13px',
              color: palette.bodyTextSoft,
              marginBottom: '20px',
              fontFamily: FONT_BODY,
              fontWeight: 600,
            }}>
              Add your first vocabulary word to get started.
            </p>
            <button
              onClick={openAdd}
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
              }}
            >
              Add First Word
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: FONT_BODY,
              minWidth: '1200px',
            }}>
              <thead>
                <tr style={{ borderBottom: `1.5px solid ${palette.border}` }}>
                  {['Word','Pronunciation','Part of Speech','Definition','CEFR','Category','Times Studied','Last Reviewed','Actions'].map((h) => (
                    <th
                      key={h}
                      style={{
                        ...thStyle,
                        textAlign: h === 'Times Studied' ? 'center' : h === 'Actions' ? 'right' : 'left',
                      }}
                    >{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((word) => {
                  const wordCefr = getWordCefr(word);
                  return (
                    <tr
                      key={word.id}
                      style={{
                        borderBottom: `1.5px solid ${palette.borderSoft}`,
                        transition: 'background 0.15s ease',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.background = palette.creamSoft)}
                      onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{
                        padding: '12px',
                        fontSize: '14px',
                        fontWeight: '800',
                        color: palette.deepNavy,
                        fontFamily: FONT_DISPLAY,
                      }}>
                        {word.word}
                      </td>
                      <td style={{
                        padding: '12px',
                        fontSize: '13px',
                        color: palette.bodyText,
                        fontStyle: 'italic',
                        fontWeight: 600,
                      }}>
                        {word.pronunciation}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '999px',
                          fontSize: '10px',
                          fontWeight: 800,
                          background: palette.creamSoft,
                          color: palette.bodyText,
                          border: `1.5px solid ${palette.border}`,
                          textTransform: 'lowercase',
                          fontFamily: FONT_DISPLAY,
                          letterSpacing: '0.02em',
                        }}>
                          {word.partOfSpeech || '—'}
                        </span>
                      </td>
                      <td style={{
                        padding: '12px',
                        fontSize: '13px',
                        color: palette.deepNavy,
                        maxWidth: '280px',
                        lineHeight: '1.5',
                        fontWeight: 600,
                      }}>
                        {word.definition}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: 800,
                          background: cefrBg(wordCefr),
                          color: cefrColor(wordCefr),
                          fontFamily: FONT_DISPLAY,
                          letterSpacing: '0.04em',
                          border: `1px solid ${cefrColor(wordCefr)}40`,
                        }}>
                          {wordCefr}
                        </span>
                      </td>
                      <td style={{
                        padding: '12px',
                        fontSize: '13px',
                        color: palette.bodyText,
                        fontWeight: 600,
                      }}>
                        {word.category || 'academic'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            fontSize: '14px',
                            fontWeight: '800',
                            color: palette.deepNavy,
                            fontFamily: FONT_DISPLAY,
                          }}>
                            {word.timesStudied || 0}
                          </span>
                          <button
                            onClick={() => handleIncrement(word.id)}
                            style={{
                              padding: '3px 8px',
                              background: `${palette.softGreen}15`,
                              color: palette.softGreen,
                              border: `1.5px solid ${palette.softGreen}40`,
                              borderRadius: '8px',
                              fontSize: '10px',
                              cursor: 'pointer',
                              fontWeight: 800,
                              fontFamily: FONT_DISPLAY,
                              boxShadow: `0 2px 0 ${palette.softGreen}20`,
                            }}
                          >
                            +1
                          </button>
                        </div>
                      </td>
                      <td style={{
                        padding: '12px',
                        fontSize: '11px',
                        color: palette.bodyTextSoft,
                        fontWeight: 600,
                      }}>
                        {word.lastReviewed
                          ? new Date(word.lastReviewed).toLocaleDateString()
                          : 'Never'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => openEdit(word)}
                          style={{
                            padding: '6px 12px',
                            background: palette.white,
                            border: `1.5px solid ${palette.border}`,
                            borderRadius: '8px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            marginRight: '6px',
                            color: palette.bodyText,
                            fontWeight: 800,
                            fontFamily: FONT_DISPLAY,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                            boxShadow: `0 2px 0 ${palette.border}`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Icon name="edit" size={10} color={palette.bodyText} />
                          Edit
                        </button>
                        <button
                          onClick={() => requestDelete(word.id)}
                          style={{
                            padding: '6px 12px',
                            background: `${palette.danger}12`,
                            color: palette.danger,
                            border: `1.5px solid ${palette.danger}40`,
                            borderRadius: '8px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            fontWeight: 800,
                            fontFamily: FONT_DISPLAY,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                            boxShadow: `0 2px 0 ${palette.danger}20`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Icon name="trash" size={10} color={palette.danger} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && words.length > 0 && (
                  <tr>
                    <td colSpan={9} style={{
                      padding: '32px',
                      textAlign: 'center',
                      color: palette.bodyTextSoft,
                      fontWeight: 600,
                      fontSize: '13px',
                    }}>
                      No words match your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===== ADD/EDIT MODAL ===== */}
      {showModal && (
        <ModalWrapper onClose={closeModal}>
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
            <Icon name={editingId ? 'edit' : 'add'} size={18} color={palette.warmOrange} />
            {editingId ? 'Edit Word' : 'Add New Word'}
          </h2>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Word *</label>
            <input
              type="text"
              placeholder="Enter word"
              value={form.word}
              onChange={(e) => setForm({ ...form, word: e.target.value })}
              style={inputStyle}
              autoFocus
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Pronunciation</label>
            <input
              type="text"
              placeholder="e.g., /ɪmˈpruːv/"
              value={form.pronunciation}
              onChange={(e) => setForm({ ...form, pronunciation: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Definition *</label>
            <textarea
              placeholder="Enter definition"
              rows="2"
              value={form.definition}
              onChange={(e) => setForm({ ...form, definition: e.target.value })}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <label style={labelStyle}>Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <label style={labelStyle}>CEFR Level</label>
              <select
                value={form.cefrLevel}
                onChange={(e) => setForm({ ...form, cefrLevel: e.target.value })}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {CEFR_LEVELS.map((lvl) => (
                  <option key={lvl.id} value={lvl.id}>
                    {lvl.id} · {lvl.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <label style={labelStyle}>Part of Speech</label>
              <select
                value={form.partOfSpeech}
                onChange={(e) => setForm({ ...form, partOfSpeech: e.target.value })}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {PARTS_OF_SPEECH.map((pos) => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <label style={labelStyle}>Source</label>
              <select
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {SOURCES.map((src) => (
                  <option key={src} value={src}>{src}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Example Sentence *</label>
            <input
              type="text"
              placeholder="Enter example sentence"
              value={form.example}
              onChange={(e) => setForm({ ...form, example: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Synonym</label>
            <input
              type="text"
              placeholder="e.g., regarding"
              value={form.synonym}
              onChange={(e) => setForm({ ...form, synonym: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              onClick={closeModal}
              style={{
                padding: '10px 20px',
                background: palette.white,
                color: palette.bodyText,
                border: `1.5px solid ${palette.border}`,
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: FONT_DISPLAY,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                boxShadow: `0 3px 0 ${palette.border}`,
              }}
            >
              Cancel
            </button>
            <button
              onClick={editingId ? handleUpdate : handleAdd}
              disabled={saving}
              style={{
                padding: '10px 20px',
                background: saving ? palette.border : palette.warmOrange,
                color: palette.white,
                border: 'none',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: FONT_DISPLAY,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                boxShadow: saving ? 'none' : `0 3px 0 ${palette.warmOrangeShadow}`,
              }}
            >
              {saving ? 'Saving...' : editingId ? 'Update Word' : 'Add Word'}
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

export default AdminWords;


