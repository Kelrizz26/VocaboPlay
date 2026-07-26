// src/components/admin/AdminWords.jsx

import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../../pages/firebase';
import ModalWrapper from './ModalWrapper';
import ConfirmDialog from './ConfirmDialog';
import { inputStyle, labelStyle, btnPrimary, btnSecondary, diffColor, diffBg } from './adminStyles';
import { colors, fontFamily } from '../dashboard/dashboardStyles';
import { getAllWordPicsWords, formatWordPicsForLibrary } from "../../utils/wordPicsUtils";

const AdminWords = ({ words, setWords, loading }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDiff, setFilterDiff] = useState('all');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ 
    word: '', 
    pronunciation: '', 
    definition: '', 
    difficulty: 'Easy',
    category: 'academic',
    fromWordPics: false,
    examples: ['', '', ''],
    synonyms: ['', '', '', ''],
    antonyms: ['', '', '', '']
  });
  const [confirmAction, setConfirmAction] = useState(null);
  
  const [showWordPicsTab, setShowWordPicsTab] = useState(false);
  const [wordPicsWords, setWordPicsWords] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  const categories = [
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
    'Verbs'
  ];

  useEffect(() => {
    const allWordPics = getAllWordPicsWords();
    setWordPicsWords(allWordPics);
  }, []);

  const getSyncedWordPicsIds = () => {
    const syncedIds = [];
    words.forEach(w => {
      if (w.fromWordPics && w.wordPicsId) {
        syncedIds.push(w.wordPicsId);
      }
    });
    return syncedIds;
  };

  const isWordPicsSynced = (wordPicsId) => {
    return words.some(w => w.wordPicsId === wordPicsId);
  };

  const getUnsyncedWordPics = () => {
    const syncedIds = getSyncedWordPicsIds();
    return wordPicsWords.filter(w => !syncedIds.includes(w.id));
  };

  const filtered = words.filter(w => {
    const s = w.word?.toLowerCase().includes(searchTerm.toLowerCase()) || 
              w.definition?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              w.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const d = filterDiff === 'all' || 
              w.difficulty === filterDiff || 
              (filterDiff === 'Easy' && w.difficulty === 'beginner') ||
              (filterDiff === 'Medium' && w.difficulty === 'intermediate') ||
              (filterDiff === 'Hard' && w.difficulty === 'advanced');
    return s && d;
  });

  const stats = {
    easy:   words.filter(w => w.difficulty === 'Easy' || w.difficulty === 'beginner').length,
    medium: words.filter(w => w.difficulty === 'Medium' || w.difficulty === 'intermediate').length,
    hard:   words.filter(w => w.difficulty === 'Hard' || w.difficulty === 'advanced').length,
    total:  words.reduce((a, w) => a + (w.timesStudied || 0), 0),
    wordPics: words.filter(w => w.fromWordPics).length,
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({ 
      word: '', 
      pronunciation: '', 
      definition: '', 
      difficulty: 'Easy',
      category: 'academic',
      fromWordPics: false,
      examples: ['', '', ''],
      synonyms: ['', '', '', ''],
      antonyms: ['', '', '', '']
    });
    setShowModal(true);
  };

  const openEdit = (w) => {
    setEditingId(w.id);
    const examples = w.examples && Array.isArray(w.examples) ? w.examples : ['', '', ''];
    const synonyms = w.synonyms && Array.isArray(w.synonyms) ? w.synonyms : ['', '', '', ''];
    const antonyms = w.antonyms && Array.isArray(w.antonyms) ? w.antonyms : ['', '', '', ''];
    
    setForm({ 
      word: w.word, 
      pronunciation: w.pronunciation || '', 
      definition: w.definition, 
      difficulty: w.difficulty === 'beginner' ? 'Easy' : w.difficulty === 'intermediate' ? 'Medium' : w.difficulty === 'advanced' ? 'Hard' : w.difficulty,
      category: w.category || 'academic',
      fromWordPics: w.fromWordPics || false,
      examples: examples,
      synonyms: synonyms,
      antonyms: antonyms
    });
    setShowModal(true);
  };

  const closeModal = () => { 
    setShowModal(false); 
    setEditingId(null); 
  };

  const handleExampleChange = (index, value) => {
    const newExamples = [...form.examples];
    newExamples[index] = value;
    setForm({ ...form, examples: newExamples });
  };

  const handleSynonymChange = (index, value) => {
    const newSynonyms = [...form.synonyms];
    newSynonyms[index] = value;
    setForm({ ...form, synonyms: newSynonyms });
  };

  const handleAntonymChange = (index, value) => {
    const newAntonyms = [...form.antonyms];
    newAntonyms[index] = value;
    setForm({ ...form, antonyms: newAntonyms });
  };

  const addExampleField = () => {
    setForm({ ...form, examples: [...form.examples, ''] });
  };

  const addSynonymField = () => {
    setForm({ ...form, synonyms: [...form.synonyms, ''] });
  };

  const addAntonymField = () => {
    setForm({ ...form, antonyms: [...form.antonyms, ''] });
  };

  const removeExampleField = (index) => {
    if (form.examples.length <= 1) return;
    const newExamples = form.examples.filter((_, i) => i !== index);
    setForm({ ...form, examples: newExamples });
  };

  const removeSynonymField = (index) => {
    if (form.synonyms.length <= 1) return;
    const newSynonyms = form.synonyms.filter((_, i) => i !== index);
    setForm({ ...form, synonyms: newSynonyms });
  };

  const removeAntonymField = (index) => {
    if (form.antonyms.length <= 1) return;
    const newAntonyms = form.antonyms.filter((_, i) => i !== index);
    setForm({ ...form, antonyms: newAntonyms });
  };

  const handleAdd = async () => {
    if (!form.word.trim() || !form.definition.trim()) {
      return alert('Word and definition are required.');
    }
    
    const examples = form.examples.filter(e => e.trim() !== '');
    const synonyms = form.synonyms.filter(s => s.trim() !== '');
    const antonyms = form.antonyms.filter(a => a.trim() !== '');
    
    if (examples.length === 0) {
      return alert('Please add at least one example sentence.');
    }

    setSaving(true);
    try {
      const difficulty = form.difficulty === 'Easy' ? 'beginner' : form.difficulty === 'Medium' ? 'intermediate' : 'advanced';
      const payload = {
        word: form.word.trim(),
        pronunciation: form.pronunciation.trim(),
        definition: form.definition.trim(),
        difficulty: difficulty,
        category: form.category || 'academic',
        timesStudied: 0,
        color: diffColor(form.difficulty),
        dateAdded: new Date().toISOString(),
        lastReviewed: null,
        fromWordPics: false,
        examples: examples,
        synonyms: synonyms,
        antonyms: antonyms
      };
      const ref = await addDoc(collection(db, 'words'), payload);
      setWords(prev => [...prev, { id: ref.id, ...payload }]);
      closeModal();
    } catch (err) {
      alert('Firestore error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!form.word.trim() || !form.definition.trim()) {
      return alert('Word and definition are required.');
    }
    
    const examples = form.examples.filter(e => e.trim() !== '');
    const synonyms = form.synonyms.filter(s => s.trim() !== '');
    const antonyms = form.antonyms.filter(a => a.trim() !== '');
    
    if (examples.length === 0) {
      return alert('Please add at least one example sentence.');
    }

    setSaving(true);
    try {
      const difficulty = form.difficulty === 'Easy' ? 'beginner' : form.difficulty === 'Medium' ? 'intermediate' : 'advanced';
      const payload = {
        word: form.word.trim(),
        pronunciation: form.pronunciation.trim(),
        definition: form.definition.trim(),
        difficulty: difficulty,
        category: form.category || 'academic',
        color: diffColor(form.difficulty),
        lastReviewed: new Date().toISOString(),
        examples: examples,
        synonyms: synonyms,
        antonyms: antonyms
      };
      await updateDoc(doc(db, 'words', editingId), payload);
      setWords(prev => prev.map(w => w.id === editingId ? { ...w, ...payload } : w));
      closeModal();
    } catch (err) {
      alert('Firestore error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'words', id));
      setWords(prev => prev.filter(w => w.id !== id));
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
      onConfirm: () => { handleDelete(id); setConfirmAction(null); },
    });
  };

  const handleIncrement = async (id) => {
    const word = words.find(w => w.id === id);
    const newCount = (word.timesStudied || 0) + 1;
    const now = new Date().toISOString();
    try {
      await updateDoc(doc(db, 'words', id), { timesStudied: newCount, lastReviewed: now });
      setWords(prev => prev.map(w => w.id === id ? { ...w, timesStudied: newCount, lastReviewed: now } : w));
    } catch (err) {
      alert('Firestore error: ' + err.message);
    }
  };

  const syncSingleWordPics = async (wordData) => {
    setSaving(true);
    try {
      const exists = words.some(w => 
        w.word.toLowerCase() === wordData.word.toLowerCase()
      );
      if (exists) {
        alert(`⚠️ "${wordData.word}" already exists in the library!`);
        setSaving(false);
        return;
      }

      const formatted = formatWordPicsForLibrary([wordData])[0];
      const payload = {
        word: formatted.word,
        pronunciation: formatted.pronunciation || `/ˈ${formatted.word.toLowerCase()}/`,
        definition: formatted.definition,
        difficulty: formatted.difficulty === 'Easy' ? 'beginner' : formatted.difficulty === 'Medium' ? 'intermediate' : 'advanced',
        category: formatted.category || 'Vocabulary',
        timesStudied: 0,
        color: diffColor(formatted.difficulty),
        dateAdded: new Date().toISOString(),
        lastReviewed: null,
        fromWordPics: true,
        wordPicsLevel: formatted.wordPicsLevel || 'medium',
        wordPicsId: formatted.wordPicsId,
        image1: formatted.image1 || '',
        image2: formatted.image2 || '',
        teacherNote: formatted.teacherNote || `WordPics vocabulary: ${formatted.word}`,
        examples: formatted.examples || [`"This is a ${formatted.word.toLowerCase()} example."`],
        synonyms: formatted.synonyms || [formatted.word.toLowerCase()],
        antonyms: formatted.antonyms || ['opposite']
      };

      const ref = await addDoc(collection(db, 'words'), payload);
      setWords(prev => [...prev, { id: ref.id, ...payload }]);
      alert(`✅ "${wordData.word}" added to the library!`);
    } catch (error) {
      console.error('Error syncing WordPics word:', error);
      alert('❌ Error adding word. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const syncAllWordPics = async () => {
    const unsynced = getUnsyncedWordPics();
    if (unsynced.length === 0) {
      alert('✅ All WordPics words are already synced!');
      return;
    }
    setShowBulkConfirm(true);
  };

  const confirmSyncAll = async () => {
    setShowBulkConfirm(false);
    setSyncing(true);
    
    const unsynced = getUnsyncedWordPics();
    let addedCount = 0;
    let errorCount = 0;

    for (const wordData of unsynced) {
      try {
        const formatted = formatWordPicsForLibrary([wordData])[0];
        const payload = {
          word: formatted.word,
          pronunciation: formatted.pronunciation || `/ˈ${formatted.word.toLowerCase()}/`,
          definition: formatted.definition,
          difficulty: formatted.difficulty === 'Easy' ? 'beginner' : formatted.difficulty === 'Medium' ? 'intermediate' : 'advanced',
          category: formatted.category || 'Vocabulary',
          timesStudied: 0,
          color: diffColor(formatted.difficulty),
          dateAdded: new Date().toISOString(),
          lastReviewed: null,
          fromWordPics: true,
          wordPicsLevel: formatted.wordPicsLevel || 'medium',
          wordPicsId: formatted.wordPicsId,
          image1: formatted.image1 || '',
          image2: formatted.image2 || '',
          teacherNote: formatted.teacherNote || `WordPics vocabulary: ${formatted.word}`,
          examples: formatted.examples || [`"This is a ${formatted.word.toLowerCase()} example."`],
          synonyms: formatted.synonyms || [formatted.word.toLowerCase()],
          antonyms: formatted.antonyms || ['opposite']
        };

        const ref = await addDoc(collection(db, 'words'), payload);
        setWords(prev => [...prev, { id: ref.id, ...payload }]);
        addedCount++;
      } catch (error) {
        console.error(`Error syncing ${wordData.word}:`, error);
        errorCount++;
      }
    }

    setSyncing(false);
    alert(`✅ Synced ${addedCount} WordPics words! ${errorCount > 0 ? `⚠️ ${errorCount} failed.` : ''}`);
  };

  return (
    <div>
      {/* HEADER - COLORS LANG PINALITAN */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-end', 
        marginBottom: '32px', 
        borderBottom: `1px solid ${colors.border}`, 
        paddingBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '600', 
            color: colors.textPrimary, 
            marginBottom: '6px', 
            fontFamily 
          }}>
            📚 Word Library
          </h1>
          <p style={{ 
            fontSize: '15px', 
            color: colors.textSecondary, 
            margin: 0, 
            fontWeight: '300',
            fontFamily
          }}>
            Manage vocabulary words across all games
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ 
            fontSize: '13px', 
            color: colors.textSecondary, 
            background: colors.bg, 
            padding: '8px 16px', 
            borderRadius: '90px', 
            border: `1px solid ${colors.border}`,
            fontFamily
          }}>
            Total: {words.length} Words
          </span>
          <span style={{ 
            fontSize: '13px', 
            color: colors.accent, 
            background: `${colors.accent}20`, 
            padding: '8px 16px', 
            borderRadius: '90px', 
            border: `1px solid ${colors.border}`,
            fontFamily
          }}>
            🎮 {stats.wordPics} from WordPics
          </span>
          <button onClick={openAdd} style={{ 
            padding: '10px 20px', 
            background: colors.accent, 
            color: '#fff', 
            border: 'none', 
            borderRadius: '90px', 
            fontSize: '13px', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            boxShadow: 'none', 
            fontFamily 
          }}>
            + Add New Word
          </button>
        </div>
      </div>

      {/* TABS - COLORS LANG PINALITAN */}
      <div style={{ 
        display: 'flex', 
        gap: '4px', 
        marginBottom: '24px',
        borderBottom: `1px solid ${colors.border}`,
        paddingBottom: '0'
      }}>
        <button
          onClick={() => setShowWordPicsTab(false)}
          style={{
            padding: '10px 24px',
            background: !showWordPicsTab ? colors.accent : 'transparent',
            color: !showWordPicsTab ? 'white' : colors.textSecondary,
            border: 'none',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            fontFamily
          }}
        >
          📚 Library Words
        </button>
        <button
          onClick={() => setShowWordPicsTab(true)}
          style={{
            padding: '10px 24px',
            background: showWordPicsTab ? colors.accent : 'transparent',
            color: showWordPicsTab ? 'white' : colors.textSecondary,
            border: 'none',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily
          }}
        >
          🎮 WordPics Words
          {getUnsyncedWordPics().length > 0 && (
            <span style={{
              background: colors.danger,
              color: 'white',
              borderRadius: '50%',
              padding: '2px 8px',
              fontSize: '11px',
              fontWeight: '700'
            }}>
              {getUnsyncedWordPics().length}
            </span>
          )}
        </button>
      </div>

      {/* TAB CONTENT */}
      {showWordPicsTab ? (
        <div>
          <div style={{
            background: `${colors.accent}20`,
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <h3 style={{ 
                margin: 0, 
                color: colors.textPrimary, 
                fontSize: '18px',
                fontFamily
              }}>
                🎮 WordPics Game Words
              </h3>
              <p style={{ 
                margin: '4px 0 0', 
                color: colors.textSecondary, 
                fontSize: '14px',
                fontFamily
              }}>
                {wordPicsWords.length} total words • {wordPicsWords.length - getUnsyncedWordPics().length} synced • {getUnsyncedWordPics().length} unsynced
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={syncAllWordPics}
                disabled={syncing || getUnsyncedWordPics().length === 0}
                style={{
                  padding: '10px 20px',
                  background: getUnsyncedWordPics().length === 0 ? colors.textMuted : colors.accent,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: getUnsyncedWordPics().length === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  fontFamily
                }}
              >
                {syncing ? '⏳ Syncing...' : `🔄 Sync All (${getUnsyncedWordPics().length})`}
              </button>
            </div>
          </div>

          {getUnsyncedWordPics().length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px',
              background: colors.bg,
              borderRadius: '12px',
              border: `1px solid ${colors.border}`
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
              <h3 style={{ 
                fontSize: '18px', 
                color: colors.textPrimary, 
                marginBottom: '8px',
                fontFamily
              }}>
                All WordPics Words Synced!
              </h3>
              <p style={{ 
                fontSize: '14px', 
                color: colors.textSecondary,
                fontFamily
              }}>
                All {wordPicsWords.length} words from WordPics are in your library.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {wordPicsWords.map((word, index) => {
                const synced = isWordPicsSynced(word.id);
                return (
                  <div key={index} style={{
                    background: colors.surface,
                    borderRadius: '12px',
                    padding: '16px',
                    border: `1px solid ${synced ? colors.success : colors.border}`,
                    boxShadow: synced ? `0 0 0 1px ${colors.success}` : 'none'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <h4 style={{ 
                            margin: 0, 
                            fontSize: '18px', 
                            fontWeight: '600', 
                            color: colors.textPrimary,
                            fontFamily
                          }}>
                            {word.word}
                          </h4>
                          <span style={{
                            padding: '2px 10px',
                            borderRadius: '12px',
                            fontSize: '10px',
                            fontWeight: '600',
                            background: synced ? colors.success : '#f59e0b',
                            color: 'white'
                          }}>
                            {synced ? '✅ Synced' : '📌 Not Synced'}
                          </span>
                        </div>
                        <p style={{ 
                          margin: '2px 0', 
                          fontSize: '13px', 
                          color: colors.textSecondary,
                          fontFamily
                        }}>
                          {word.category} • {word.difficulty}
                        </p>
                        <p style={{ 
                          margin: '8px 0 0', 
                          fontSize: '13px', 
                          color: colors.textPrimary, 
                          lineHeight: '1.5',
                          fontFamily
                        }}>
                          {word.definition}
                        </p>
                      </div>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      gap: '8px', 
                      marginTop: '12px',
                      padding: '8px',
                      background: colors.bg,
                      borderRadius: '8px',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {word.image1 && (
                        <img 
                          src={word.image1} 
                          alt={word.word} 
                          style={{ 
                            width: '50px', 
                            height: '50px', 
                            objectFit: 'contain',
                            borderRadius: '6px',
                            border: `1px solid ${colors.border}`
                          }}
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}
                      <span style={{ color: colors.accent, fontWeight: 'bold' }}>↔</span>
                      {word.image2 && (
                        <img 
                          src={word.image2} 
                          alt={word.word} 
                          style={{ 
                            width: '50px', 
                            height: '50px', 
                            objectFit: 'contain',
                            borderRadius: '6px',
                            border: `1px solid ${colors.border}`
                          }}
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}
                      <span style={{ 
                        fontSize: '12px', 
                        color: colors.accent, 
                        fontWeight: '600',
                        fontFamily
                      }}>
                        Level: {word.level || 'medium'}
                      </span>
                    </div>

                    {!synced && (
                      <button
                        onClick={() => syncSingleWordPics(word)}
                        disabled={saving}
                        style={{
                          width: '100%',
                          marginTop: '12px',
                          padding: '8px',
                          background: colors.accent,
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: saving ? 'not-allowed' : 'pointer',
                          fontSize: '13px',
                          fontWeight: '500',
                          fontFamily
                        }}
                      >
                        {saving ? '⏳ Adding...' : '➕ Add to Library'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* SEARCH & FILTER - COLORS LANG PINALITAN */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              background: colors.bg, 
              border: `1px solid ${colors.border}`, 
              borderRadius: '12px', 
              padding: '4px 4px 4px 16px', 
              flex: 1, 
              maxWidth: '400px' 
            }}>
              <span style={{ color: colors.textSecondary, marginRight: '8px' }}>🔍</span>
              <input 
                type="text" 
                placeholder="Search words..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                style={{ 
                  flex: 1, 
                  padding: '12px 0', 
                  border: 'none', 
                  background: 'transparent', 
                  fontSize: '15px', 
                  outline: 'none', 
                  fontFamily,
                  color: colors.textPrimary
                }} 
              />
            </div>
            <select 
              value={filterDiff} 
              onChange={e => setFilterDiff(e.target.value)} 
              style={{ 
                padding: '12px 24px', 
                border: `1px solid ${colors.border}`, 
                borderRadius: '8px', 
                fontSize: '13px', 
                background: colors.surface, 
                color: colors.textPrimary, 
                cursor: 'pointer', 
                outline: 'none', 
                fontFamily
              }}
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
            <span style={{ 
              fontSize: '13px', 
              color: colors.textSecondary, 
              background: colors.bg, 
              padding: '8px 16px', 
              borderRadius: '8px', 
              border: `1px solid ${colors.border}`,
              fontFamily
            }}>
              {filtered.length} of {words.length} shown
            </span>
          </div>

          {/* STATS - COLORS LANG PINALITAN */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '12px',
            marginBottom: '24px'
          }}>
            <div style={{ 
              padding: '12px', 
              background: '#f0fdf4', 
              borderRadius: '8px', 
              border: '1px solid #dcfce7' 
            }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#16a34a' }}>{stats.easy}</div>
              <div style={{ fontSize: '12px', color: colors.textSecondary }}>🟢 Easy</div>
            </div>
            <div style={{ 
              padding: '12px', 
              background: '#fefce8', 
              borderRadius: '8px', 
              border: '1px solid #fef08a' 
            }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#ca8a04' }}>{stats.medium}</div>
              <div style={{ fontSize: '12px', color: colors.textSecondary }}>🟡 Medium</div>
            </div>
            <div style={{ 
              padding: '12px', 
              background: '#fef2f2', 
              borderRadius: '8px', 
              border: '1px solid #fecaca' 
            }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#dc2626' }}>{stats.hard}</div>
              <div style={{ fontSize: '12px', color: colors.textSecondary }}>🔴 Hard</div>
            </div>
            <div style={{ 
              padding: '12px', 
              background: '#eff6ff', 
              borderRadius: '8px', 
              border: '1px solid #bfdbfe' 
            }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#2563eb' }}>{stats.total}</div>
              <div style={{ fontSize: '12px', color: colors.textSecondary }}>📖 Total Studies</div>
            </div>
          </div>

          {/* TABLE - COLORS LANG PINALITAN */}
          {loading.words ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '80px', 
              background: colors.surface, 
              borderRadius: '8px', 
              border: `1px solid ${colors.border}` 
            }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>⏳</div>
              <div style={{ fontSize: '16px', color: colors.textSecondary }}>Loading words from Firestore...</div>
            </div>
          ) : words.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '80px', 
              background: colors.surface, 
              borderRadius: '8px', 
              border: `1px solid ${colors.border}` 
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
              <h3 style={{ 
                fontSize: '20px', 
                color: colors.textPrimary, 
                marginBottom: '8px',
                fontFamily
              }}>No Words Yet</h3>
              <p style={{ 
                fontSize: '14px', 
                color: colors.textSecondary, 
                marginBottom: '24px',
                fontFamily
              }}>Add your first vocabulary word to get started.</p>
              <button onClick={openAdd} style={{ 
                padding: '12px 28px', 
                background: colors.accent, 
                color: '#fff', 
                border: 'none', 
                borderRadius: '8px', 
                fontSize: '14px', 
                cursor: 'pointer',
                fontFamily
              }}>Add First Word</button>
            </div>
          ) : (
            <div style={{ 
              background: colors.surface, 
              borderRadius: '8px', 
              boxShadow: 'none', 
              overflow: 'hidden', 
              border: `1px solid ${colors.border}` 
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse', 
                  fontFamily, 
                  minWidth: '1100px' 
                }}>
                  <thead style={{ 
                    background: colors.bg, 
                    borderBottom: `1px solid ${colors.border}` 
                  }}>
                    <tr>
                      {['Word','Pronunciation','Definition','Difficulty','Category','Times Studied','Last Reviewed','Actions'].map(h => (
                        <th key={h} style={{ 
                          padding: '16px 20px', 
                          textAlign: 'left', 
                          fontSize: '13px', 
                          fontWeight: '600', 
                          color: colors.textSecondary 
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(word => (
                      <tr key={word.id} style={{ 
                        borderBottom: `1px solid ${colors.border}`, 
                        transition: 'all .2s' 
                      }}
                        onMouseOver={e => e.currentTarget.style.background = colors.bg}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ 
                          padding: '16px 20px', 
                          fontSize: '15px', 
                          fontWeight: '600', 
                          color: colors.textPrimary 
                        }}>
                          {word.word}
                          {word.fromWordPics && (
                            <span style={{ 
                              marginLeft: '8px', 
                              fontSize: '11px', 
                              background: `${colors.accent}20`, 
                              padding: '2px 8px', 
                              borderRadius: '12px',
                              color: colors.accent
                            }}>
                              🎮
                            </span>
                          )}
                        </td>
                        <td style={{ 
                          padding: '16px 20px', 
                          fontSize: '14px', 
                          color: colors.textSecondary, 
                          fontStyle: 'italic' 
                        }}>{word.pronunciation}</td>
                        <td style={{ 
                          padding: '16px 20px', 
                          fontSize: '14px', 
                          color: colors.textPrimary, 
                          maxWidth: '240px', 
                          lineHeight: '1.5' 
                        }}>{word.definition}</td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ 
                            padding: '4px 12px', 
                            borderRadius: '8px', 
                            fontSize: '12px', 
                            fontWeight: '600', 
                            background: diffBg(word.difficulty), 
                            color: diffColor(word.difficulty) 
                          }}>
                            {word.difficulty === 'beginner' ? 'Easy' : word.difficulty === 'intermediate' ? 'Medium' : word.difficulty === 'advanced' ? 'Hard' : word.difficulty}
                          </span>
                        </td>
                        <td style={{ 
                          padding: '16px 20px', 
                          fontSize: '13px', 
                          color: colors.textSecondary 
                        }}>
                          {word.category || 'academic'}
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ 
                              fontSize: '14px', 
                              fontWeight: '600', 
                              color: colors.textPrimary 
                            }}>{word.timesStudied || 0}</span>
                            <button onClick={() => handleIncrement(word.id)} style={{ 
                              padding: '4px 10px', 
                              background: '#e8f5e9', 
                              border: 'none', 
                              borderRadius: '6px', 
                              fontSize: '11px', 
                              color: '#2e7d32', 
                              cursor: 'pointer' 
                            }}>+1</button>
                          </div>
                        </td>
                        <td style={{ 
                          padding: '16px 20px', 
                          fontSize: '13px', 
                          color: colors.textSecondary 
                        }}>{word.lastReviewed ? new Date(word.lastReviewed).toLocaleDateString() : 'Never'}</td>
                        <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                          <button onClick={() => openEdit(word)} style={{ 
                            padding: '6px 16px', 
                            background: colors.bg, 
                            border: `1px solid ${colors.border}`, 
                            borderRadius: '8px', 
                            fontSize: '12px', 
                            cursor: 'pointer', 
                            marginRight: '8px', 
                            color: colors.textSecondary 
                          }}>Edit</button>
                          <button onClick={() => requestDelete(word.id)} style={{ 
                            padding: '6px 16px', 
                            background: '#fef2f2', 
                            color: '#b91c1c', 
                            border: '1px solid #fee2e2', 
                            borderRadius: '8px', 
                            fontSize: '12px', 
                            cursor: 'pointer' 
                          }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ADD/EDIT MODAL - COLORS LANG PINALITAN */}
      {showModal && (
        <ModalWrapper onClose={closeModal}>
          <h2 style={{ 
            fontSize: '22px', 
            fontWeight: '600', 
            marginBottom: '24px', 
            color: colors.textPrimary 
          }}>
            {editingId ? 'Edit Word' : 'Add New Word'}
          </h2>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Word *</label>
            <input 
              type="text" 
              placeholder="Enter word" 
              value={form.word} 
              onChange={e => setForm({ ...form, word: e.target.value })} 
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
              onChange={e => setForm({ ...form, pronunciation: e.target.value })} 
              style={inputStyle} 
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Definition *</label>
            <textarea 
              placeholder="Enter definition" 
              rows="2" 
              value={form.definition} 
              onChange={e => setForm({ ...form, definition: e.target.value })} 
              style={{ ...inputStyle, resize: 'vertical' }} 
            />
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Category</label>
              <select 
                value={form.category} 
                onChange={e => setForm({ ...form, category: e.target.value })} 
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Difficulty</label>
              <select 
                value={form.difficulty} 
                onChange={e => setForm({ ...form, difficulty: e.target.value })} 
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={labelStyle}>Example Sentences *</label>
              <button 
                onClick={addExampleField}
                style={{ 
                  padding: '4px 12px', 
                  background: colors.accent, 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: 'pointer', 
                  fontSize: '12px' 
                }}
              >
                + Add
              </button>
            </div>
            {form.examples.map((example, index) => (
              <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input 
                  type="text" 
                  placeholder={`Example #${index + 1}`} 
                  value={example} 
                  onChange={e => handleExampleChange(index, e.target.value)} 
                  style={{ ...inputStyle, flex: 1 }} 
                />
                <button 
                  onClick={() => removeExampleField(index)}
                  style={{ 
                    padding: '8px 12px', 
                    background: '#fef2f2', 
                    color: '#dc2626', 
                    border: '1px solid #fee2e2', 
                    borderRadius: '6px', 
                    cursor: 'pointer', 
                    fontSize: '14px' 
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={labelStyle}>Synonyms</label>
              <button 
                onClick={addSynonymField}
                style={{ 
                  padding: '4px 12px', 
                  background: '#10b981', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: 'pointer', 
                  fontSize: '12px' 
                }}
              >
                + Add
              </button>
            </div>
            {form.synonyms.map((synonym, index) => (
              <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input 
                  type="text" 
                  placeholder={`Synonym #${index + 1}`} 
                  value={synonym} 
                  onChange={e => handleSynonymChange(index, e.target.value)} 
                  style={{ ...inputStyle, flex: 1 }} 
                />
                <button 
                  onClick={() => removeSynonymField(index)}
                  style={{ 
                    padding: '8px 12px', 
                    background: '#fef2f2', 
                    color: '#dc2626', 
                    border: '1px solid #fee2e2', 
                    borderRadius: '6px', 
                    cursor: 'pointer', 
                    fontSize: '14px' 
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={labelStyle}>Antonyms</label>
              <button 
                onClick={addAntonymField}
                style={{ 
                  padding: '4px 12px', 
                  background: '#ef4444', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: 'pointer', 
                  fontSize: '12px' 
                }}
              >
                + Add
              </button>
            </div>
            {form.antonyms.map((antonym, index) => (
              <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input 
                  type="text" 
                  placeholder={`Antonym #${index + 1}`} 
                  value={antonym} 
                  onChange={e => handleAntonymChange(index, e.target.value)} 
                  style={{ ...inputStyle, flex: 1 }} 
                />
                <button 
                  onClick={() => removeAntonymField(index)}
                  style={{ 
                    padding: '8px 12px', 
                    background: '#fef2f2', 
                    color: '#dc2626', 
                    border: '1px solid #fee2e2', 
                    borderRadius: '6px', 
                    cursor: 'pointer', 
                    fontSize: '14px' 
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={closeModal} style={btnSecondary}>Cancel</button>
            <button 
              onClick={editingId ? handleUpdate : handleAdd} 
              disabled={saving}
              style={{ 
                ...btnPrimary, 
                background: saving ? colors.border : colors.accent, 
                cursor: saving ? 'not-allowed' : 'pointer' 
              }}
            >
              {saving ? 'Saving...' : editingId ? 'Update Word' : 'Add Word'}
            </button>
          </div>
        </ModalWrapper>
      )}

      <ConfirmDialog
        open={showBulkConfirm}
        title="Sync All WordPics Words"
        message={`This will add ${getUnsyncedWordPics().length} WordPics words to your library. This may take a moment. Continue?`}
        confirmLabel="Sync All"
        danger={false}
        onConfirm={confirmSyncAll}
        onCancel={() => setShowBulkConfirm(false)}
      />

      <ConfirmDialog
        open={!!confirmAction && !confirmAction.isBulk}
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