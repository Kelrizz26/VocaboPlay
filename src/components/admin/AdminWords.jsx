// src/components/admin/AdminWords.jsx
//
// CEFR-based Word Library admin panel.
// WordPics sync removed. Antonyms removed.
// Uses `cefrLevel` (A1..C2) instead of `difficulty`.
// Has single example sentence + single synonym.

import React, { useState } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../pages/firebase';
import ModalWrapper from './ModalWrapper';
import ConfirmDialog from './ConfirmDialog';
import {
  inputStyle,
  labelStyle,
  btnPrimary,
  btnSecondary,
  cefrColor,
  cefrBg,
  CEFR_LEVELS,
  normalizeCefr,
} from './adminStyles';
import { colors, fontFamily, fontFamilyDisplay } from '../dashboard/dashboardStyles';

// ============================================================
// CATEGORY OPTIONS
// ============================================================
const CATEGORIES = [
  'academic',
  'action verbs',
  'learning strategies',
  'Emotions',
  'Size',
  'Speed',
  'Quality',
  'Personality',
  'Objects',
  'Discovery',
  'Actions',
  'Strength',
  'Wealth',
  'Appearance',
  'Humor',
  'Travel',
  'Verbs',
  'General',
];

// ============================================================
// PART OF SPEECH OPTIONS
// ============================================================
const PARTS_OF_SPEECH = [
  'noun',
  'verb',
  'adjective',
  'adverb',
  'preposition',
  'conjunction',
  'pronoun',
  'interjection',
  'determiner',
  'noun/verb',
  'preposition/conjunction',
];

// ============================================================
// SOURCE OPTIONS
// ============================================================
const SOURCES = [
  'Oxford 3000',
  'Oxford 5000',
  'Oxford 3000 / Oxford 5000',
  'Cambridge English Vocabulary Profile (EVP)',
  'Teacher-made',
  'Other',
];

// ============================================================
// HELPER: read CEFR from word doc (supports legacy `difficulty`)
// ============================================================
const getWordCefr = (w) => normalizeCefr(w.cefrLevel || w.difficulty);

// ============================================================
// EMPTY FORM
// ============================================================
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

    // Support legacy arrays -> first item only
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

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div>
      {/* HEADER */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '32px',
          borderBottom: `1.5px solid ${colors.border}`,
          paddingBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: '800',
              color: colors.textPrimary,
              margin: '0 0 6px 0',
              fontFamily: fontFamilyDisplay,
              letterSpacing: '-0.4px',
            }}
          >
            📚 Word Library
          </h1>
          <p
            style={{
              fontSize: '15px',
              color: colors.textSecondary,
              margin: 0,
              fontWeight: 600,
              fontFamily,
            }}
          >
            Manage CEFR-aligned vocabulary words across all games
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '13px',
              color: colors.textSecondary,
              background: colors.surfaceSoft,
              padding: '8px 16px',
              borderRadius: '999px',
              border: `1.5px solid ${colors.border}`,
              fontFamily,
              fontWeight: 700,
              boxShadow: `0 2px 0 ${colors.border}`,
            }}
          >
            Total: {words.length} Words
          </span>
          <button
            onClick={openAdd}
            style={{
              padding: '10px 20px',
              background: colors.accent,
              color: colors.white,
              border: 'none',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: fontFamilyDisplay,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              boxShadow: `0 4px 0 ${colors.accentHover}`,
            }}
          >
            + Add New Word
          </button>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: colors.surfaceSoft,
            border: `1.5px solid ${colors.border}`,
            borderRadius: '12px',
            padding: '4px 4px 4px 16px',
            flex: 1,
            minWidth: '220px',
            maxWidth: '400px',
            boxShadow: `0 2px 0 ${colors.border}`,
          }}
        >
          <span style={{ color: colors.textMuted, marginRight: '8px', fontSize: '15px' }}>🔍</span>
          <input
            type="text"
            placeholder="Search words..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: '12px 0',
              border: 'none',
              background: 'transparent',
              fontSize: '15px',
              outline: 'none',
              fontFamily,
              fontWeight: 600,
              color: colors.textPrimary,
            }}
          />
        </div>

        <select
          value={filterCefr}
          onChange={(e) => setFilterCefr(e.target.value)}
          style={{
            padding: '12px 20px',
            border: `1.5px solid ${colors.border}`,
            borderRadius: '12px',
            fontSize: '13px',
            background: colors.surface,
            color: colors.textPrimary,
            cursor: 'pointer',
            outline: 'none',
            fontFamily,
            fontWeight: 700,
            boxShadow: `0 2px 0 ${colors.border}`,
          }}
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
          style={{
            padding: '12px 20px',
            border: `1.5px solid ${colors.border}`,
            borderRadius: '12px',
            fontSize: '13px',
            background: colors.surface,
            color: colors.textPrimary,
            cursor: 'pointer',
            outline: 'none',
            fontFamily,
            fontWeight: 700,
            boxShadow: `0 2px 0 ${colors.border}`,
          }}
        >
          <option value="all">All Parts of Speech</option>
          {PARTS_OF_SPEECH.map((pos) => (
            <option key={pos} value={pos}>
              {pos}
            </option>
          ))}
        </select>

        <span
          style={{
            fontSize: '13px',
            color: colors.textSecondary,
            background: colors.surfaceSoft,
            padding: '8px 16px',
            borderRadius: '12px',
            border: `1.5px solid ${colors.border}`,
            fontFamily,
            fontWeight: 700,
            boxShadow: `0 2px 0 ${colors.border}`,
          }}
        >
          {filtered.length} of {words.length} shown
        </span>
      </div>

      {/* STATS CARDS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            padding: '16px 18px',
            background: `${colors.success}12`,
            borderRadius: '14px',
            border: `1.5px solid ${colors.success}40`,
            boxShadow: `0 2px 0 ${colors.success}20`,
          }}
        >
          <div style={{ fontSize: '22px', fontWeight: '800', color: colors.success, fontFamily: fontFamilyDisplay, lineHeight: 1 }}>
            {groupedStats.beginner}
          </div>
          <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '4px', fontWeight: 700, fontFamily }}>
            🟢 Beginner (A1–A2)
          </div>
        </div>
        <div
          style={{
            padding: '16px 18px',
            background: `${colors.warning}12`,
            borderRadius: '14px',
            border: `1.5px solid ${colors.warning}40`,
            boxShadow: `0 2px 0 ${colors.warning}20`,
          }}
        >
          <div style={{ fontSize: '22px', fontWeight: '800', color: colors.warning, fontFamily: fontFamilyDisplay, lineHeight: 1 }}>
            {groupedStats.intermediate}
          </div>
          <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '4px', fontWeight: 700, fontFamily }}>
            🟡 Intermediate (B1–B2)
          </div>
        </div>
        <div
          style={{
            padding: '16px 18px',
            background: `${colors.danger}12`,
            borderRadius: '14px',
            border: `1.5px solid ${colors.danger}40`,
            boxShadow: `0 2px 0 ${colors.danger}20`,
          }}
        >
          <div style={{ fontSize: '22px', fontWeight: '800', color: colors.danger, fontFamily: fontFamilyDisplay, lineHeight: 1 }}>
            {groupedStats.advanced}
          </div>
          <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '4px', fontWeight: 700, fontFamily }}>
            🔴 Advanced (C1–C2)
          </div>
        </div>
        <div
          style={{
            padding: '16px 18px',
            background: `${colors.teal}12`,
            borderRadius: '14px',
            border: `1.5px solid ${colors.teal}40`,
            boxShadow: `0 2px 0 ${colors.teal}20`,
          }}
        >
          <div style={{ fontSize: '22px', fontWeight: '800', color: colors.teal, fontFamily: fontFamilyDisplay, lineHeight: 1 }}>
            {totalStudies}
          </div>
          <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '4px', fontWeight: 700, fontFamily }}>
            📖 Total Studies
          </div>
        </div>
      </div>

      {/* TABLE */}
      {loading.words ? (
        <div
          style={{
            textAlign: 'center',
            padding: '80px',
            background: colors.surface,
            borderRadius: '16px',
            border: `1.5px solid ${colors.border}`,
            boxShadow: `0 2px 0 ${colors.border}`,
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>⏳</div>
          <div style={{ fontSize: '15px', color: colors.textSecondary, fontWeight: 600, fontFamily }}>
            Loading words from Firestore...
          </div>
        </div>
      ) : words.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '80px',
            background: colors.surface,
            borderRadius: '16px',
            border: `1.5px solid ${colors.border}`,
            boxShadow: `0 2px 0 ${colors.border}`,
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
          <h3
            style={{
              fontSize: '20px',
              color: colors.textPrimary,
              marginBottom: '8px',
              fontFamily: fontFamilyDisplay,
              fontWeight: 800,
            }}
          >
            No Words Yet
          </h3>
          <p
            style={{
              fontSize: '14px',
              color: colors.textSecondary,
              marginBottom: '24px',
              fontFamily,
              fontWeight: 600,
            }}
          >
            Add your first vocabulary word to get started.
          </p>
          <button
            onClick={openAdd}
            style={{
              padding: '12px 28px',
              background: colors.accent,
              color: colors.white,
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              fontFamily: fontFamilyDisplay,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              boxShadow: `0 4px 0 ${colors.accentHover}`,
            }}
          >
            Add First Word
          </button>
        </div>
      ) : (
        <div
          style={{
            background: colors.surface,
            borderRadius: '16px',
            overflow: 'hidden',
            border: `1.5px solid ${colors.border}`,
            boxShadow: `0 2px 0 ${colors.border}, 0 8px 24px ${colors.shadow}`,
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontFamily,
                minWidth: '1200px',
              }}
            >
              <thead
                style={{
                  background: colors.surfaceSoft,
                  borderBottom: `1.5px solid ${colors.border}`,
                }}
              >
                <tr>
                  {[
                    'Word',
                    'Pronunciation',
                    'Part of Speech',
                    'Definition',
                    'CEFR Level',
                    'Category',
                    'Times Studied',
                    'Last Reviewed',
                    'Actions',
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '16px 20px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: 800,
                        color: colors.textSecondary,
                        fontFamily: fontFamilyDisplay,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {h}
                    </th>
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
                        borderBottom: `1.5px solid ${colors.borderSoft}`,
                        transition: 'all .2s',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.background = colors.surfaceSoft)}
                      onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td
                        style={{
                          padding: '16px 20px',
                          fontSize: '15px',
                          fontWeight: '800',
                          color: colors.textPrimary,
                          fontFamily: fontFamilyDisplay,
                        }}
                      >
                        {word.word}
                      </td>
                      <td
                        style={{
                          padding: '16px 20px',
                          fontSize: '14px',
                          color: colors.textSecondary,
                          fontStyle: 'italic',
                          fontWeight: 600,
                        }}
                      >
                        {word.pronunciation}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '999px',
                            fontSize: '11px',
                            fontWeight: '800',
                            background: colors.surfaceSoft,
                            color: colors.textSecondary,
                            border: `1.5px solid ${colors.border}`,
                            textTransform: 'lowercase',
                            fontFamily,
                          }}
                        >
                          {word.partOfSpeech || '—'}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: '16px 20px',
                          fontSize: '14px',
                          color: colors.textPrimary,
                          maxWidth: '240px',
                          lineHeight: '1.5',
                          fontWeight: 600,
                        }}
                      >
                        {word.definition}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span
                          style={{
                            padding: '4px 12px',
                            borderRadius: '999px',
                            fontSize: '12px',
                            fontWeight: '800',
                            background: cefrBg(wordCefr),
                            color: cefrColor(wordCefr),
                            fontFamily: fontFamilyDisplay,
                            letterSpacing: '0.04em',
                          }}
                        >
                          {wordCefr}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: '16px 20px',
                          fontSize: '13px',
                          color: colors.textSecondary,
                          fontWeight: 600,
                        }}
                      >
                        {word.category || 'academic'}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontSize: '14px',
                              fontWeight: '800',
                              color: colors.textPrimary,
                              fontFamily: fontFamilyDisplay,
                            }}
                          >
                            {word.timesStudied || 0}
                          </span>
                          <button
                            onClick={() => handleIncrement(word.id)}
                            style={{
                              padding: '4px 10px',
                              background: `${colors.success}15`,
                              color: colors.success,
                              border: `1px solid ${colors.success}40`,
                              borderRadius: '8px',
                              fontSize: '11px',
                              cursor: 'pointer',
                              fontWeight: 800,
                              fontFamily: fontFamilyDisplay,
                            }}
                          >
                            +1
                          </button>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: '16px 20px',
                          fontSize: '13px',
                          color: colors.textSecondary,
                          fontWeight: 600,
                        }}
                      >
                        {word.lastReviewed
                          ? new Date(word.lastReviewed).toLocaleDateString()
                          : 'Never'}
                      </td>
                      <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => openEdit(word)}
                          style={{
                            padding: '6px 16px',
                            background: colors.surface,
                            border: `1.5px solid ${colors.border}`,
                            borderRadius: '10px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            marginRight: '8px',
                            color: colors.textSecondary,
                            fontWeight: 800,
                            fontFamily: fontFamilyDisplay,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                            boxShadow: `0 2px 0 ${colors.border}`,
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => requestDelete(word.id)}
                          style={{
                            padding: '6px 16px',
                            background: `${colors.danger}12`,
                            color: colors.danger,
                            border: `1.5px solid ${colors.danger}40`,
                            borderRadius: '10px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontWeight: 800,
                            fontFamily: fontFamilyDisplay,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                            boxShadow: `0 2px 0 ${colors.danger}20`,
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <ModalWrapper onClose={closeModal}>
          <h2
            style={{
              fontSize: '22px',
              fontWeight: '800',
              marginBottom: '24px',
              color: colors.textPrimary,
              fontFamily: fontFamilyDisplay,
              letterSpacing: '-0.3px',
            }}
          >
            {editingId ? 'Edit Word' : 'Add New Word'}
          </h2>

          <div style={{ marginBottom: '20px' }}>
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

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Pronunciation</label>
            <input
              type="text"
              placeholder="e.g., /ɪmˈpruːv/"
              value={form.pronunciation}
              onChange={(e) => setForm({ ...form, pronunciation: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Definition *</label>
            <textarea
              placeholder="Enter definition"
              rows="2"
              value={form.definition}
              onChange={(e) => setForm({ ...form, definition: e.target.value })}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
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

          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Part of Speech</label>
              <select
                value={form.partOfSpeech}
                onChange={(e) => setForm({ ...form, partOfSpeech: e.target.value })}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {PARTS_OF_SPEECH.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Source</label>
              <select
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {SOURCES.map((src) => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* EXAMPLE SENTENCE (SINGLE) */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Example Sentence *</label>
            <input
              type="text"
              placeholder="Enter example sentence"
              value={form.example}
              onChange={(e) => setForm({ ...form, example: e.target.value })}
              style={inputStyle}
            />
          </div>

          {/* SYNONYM (SINGLE) */}
          <div style={{ marginBottom: '28px' }}>
            <label style={labelStyle}>Synonym</label>
            <input
              type="text"
              placeholder="e.g., regarding"
              value={form.synonym}
              onChange={(e) => setForm({ ...form, synonym: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={closeModal} style={btnSecondary}>
              Cancel
            </button>
            <button
              onClick={editingId ? handleUpdate : handleAdd}
              disabled={saving}
              style={{
                ...btnPrimary,
                background: saving ? colors.border : colors.accent,
                boxShadow: saving ? 'none' : `0 4px 0 ${colors.accentHover}`,
                cursor: saving ? 'not-allowed' : 'pointer',
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