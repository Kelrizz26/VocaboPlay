// src/components/dashboard/WordLibrary.jsx
//
// Student-facing CEFR Word Library.
// Antonyms removed. Synonyms display restored.

import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '../../pages/firebase';
import WordDetailsModal from './WordDetailsModal';
import {
  colors,
  fontFamily,
  CEFR_LEVELS,
  normalizeCefr,
  cefrBg,
  cefrColor,
} from './dashboardStyles';

// ===== WARM & FRIENDLY PALETTE (Matched to Mascots) =====
const palette = {
  warmOrange: '#F4A261',
  warmOrangeShadow: '#C77E3E',
  coral: '#E76F51',
  coralShadow: '#B54A32',
  teal: '#2A9D8F',
  tealShadow: '#1E7268',
  deepNavy: '#2D2A5E',
  bodyText: '#5A587A',
  cream: '#FFF8F0',
  white: '#FFFFFF',
  border: '#E2E8F0',
  softGreen: '#8AB17D',
  softGreenShadow: '#6A8A5E',
};

const FONT_DISPLAY = "'Fredoka', sans-serif";
const FONT_BODY = "'Nunito', sans-serif";

const WordLibrary = () => {
  const [words, setWords] = useState([]);
  const [wordsLoading, setWordsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCefr, setFilterCefr] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('word');
  const [selectedWord, setSelectedWord] = useState(null);
  const [showWordDetails, setShowWordDetails] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [pageLoaded, setPageLoaded] = useState(false);
  const currentUserId = localStorage.getItem('userId');

  const categories = [
    { id: 'all', name: 'All Categories', color: palette.warmOrange },
    { id: 'action verbs', name: 'Action Verbs', color: palette.coral },
    { id: 'learning strategies', name: 'Learning Strategies', color: palette.teal },
    { id: 'academic', name: 'Academic', color: palette.deepNavy }
  ];

  const cefrFilterOptions = [
    { id: 'all', name: 'All Levels', color: palette.warmOrange },
    ...CEFR_LEVELS.map((lvl) => ({
      id: lvl.id,
      name: `${lvl.id} · ${lvl.label}`,
      color: lvl.color,
    })),
    { id: 'favorites', name: 'Favorites', color: palette.coral },
  ];

  useEffect(() => {
    setPageLoaded(true);
  }, []);

  useEffect(() => {
    const loadFavorites = async () => {
      if (!currentUserId) return;
      try {
        const userRef = doc(db, 'users', currentUserId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setFavorites(userData.favorites || []);
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    };
    loadFavorites();
  }, [currentUserId]);

  useEffect(() => {
    const fetchWords = async () => {
      setWordsLoading(true);
      try {
        const snapshot = await getDocs(collection(db, 'words'));
        const fetched = snapshot.docs.map((d) => {
          const data = d.data();
          const cefrLevel = normalizeCefr(data.cefrLevel || data.difficulty);
          return {
            id: d.id,
            ...data,
            cefrLevel,
            partOfSpeech: data.partOfSpeech || 'noun',
            pronunciation: data.pronunciation || '',
            examples: data.examples || [],
            synonyms: data.synonyms || [],
            category: data.category || 'academic',
            teacherNote: data.teacherNote || '',
          };
        });
        setWords(fetched);
      } catch (err) {
        console.error('Error fetching words:', err);
      } finally {
        setWordsLoading(false);
      }
    };
    fetchWords();
  }, []);

  const toggleFavorite = async (wordId) => {
    if (!currentUserId) {
      alert('Please login to add favorites');
      return;
    }
    try {
      const userRef = doc(db, 'users', currentUserId);
      const isFavorite = favorites.includes(wordId);
      if (isFavorite) {
        await updateDoc(userRef, { favorites: arrayRemove(wordId) });
        setFavorites((prev) => prev.filter((id) => id !== wordId));
      } else {
        await updateDoc(userRef, { favorites: arrayUnion(wordId) });
        setFavorites((prev) => [...prev, wordId]);
      }
      const event = new CustomEvent('favoritesUpdated', {
        detail: { wordId, action: isFavorite ? 'remove' : 'add' },
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Error updating favorites. Please try again.');
    }
  };

  const sortWords = (wordsToSort) => {
    switch (sortBy) {
      case 'word':
        return [...wordsToSort].sort((a, b) => a.word?.localeCompare(b.word));
      case 'cefr': {
        const order = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
        return [...wordsToSort].sort(
          (a, b) => (order[a.cefrLevel] || 99) - (order[b.cefrLevel] || 99)
        );
      }
      case 'category':
        return [...wordsToSort].sort((a, b) =>
          (a.category || '').localeCompare(b.category || '')
        );
      default:
        return wordsToSort;
    }
  };

  const filtered = words.filter((w) => {
    const matchesSearch =
      searchTerm === ''
        ? true
        : w.word?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.definition?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.partOfSpeech?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCefr =
      filterCefr === 'all'
        ? true
        : filterCefr === 'favorites'
        ? favorites.includes(w.id)
        : w.cefrLevel === filterCefr;

    const matchesCategory =
      selectedCategory === 'all' ? true : w.category === selectedCategory;

    return matchesSearch && matchesCefr && matchesCategory;
  });

  const sortedAndFilteredWords = sortWords(filtered);
  const totalWords = words.length;
  const masteredWords = favorites.length;

  const cefrCounts = CEFR_LEVELS.reduce((acc, lvl) => {
    acc[lvl.id] = words.filter((w) => w.cefrLevel === lvl.id).length;
    return acc;
  }, {});

  return (
    <div
      style={{
        opacity: pageLoaded ? 1 : 0,
        transform: pageLoaded ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '24px',
          borderBottom: `2px solid ${palette.border}`,
          paddingBottom: '16px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: '800',
              color: palette.deepNavy,
              marginBottom: '4px',
              fontFamily: FONT_DISPLAY,
              letterSpacing: '-0.5px',
            }}
          >
            Word Library
          </h1>
          <p
            style={{
              fontSize: '13px',
              color: palette.bodyText,
              margin: 0,
              fontWeight: '600',
              fontFamily: FONT_BODY,
            }}
          >
            A comprehensive CEFR-aligned collection of {totalWords} essential words
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span
            style={{
              fontSize: '12px',
              color: palette.bodyText,
              background: palette.cream,
              padding: '6px 14px',
              borderRadius: '8px',
              border: `2px solid ${palette.border}`,
              fontFamily: FONT_DISPLAY,
              fontWeight: '700',
            }}
          >
            Total: {totalWords} Words
          </span>
          <span
            style={{
              fontSize: '12px',
              color: palette.bodyText,
              background: palette.cream,
              padding: '6px 14px',
              borderRadius: '8px',
              border: `2px solid ${palette.border}`,
              fontFamily: FONT_DISPLAY,
              fontWeight: '700',
            }}
          >
            ⭐ {masteredWords} mastered
          </span>
        </div>
      </div>

      {/* FILTERS CONTAINER */}
      <div
        style={{
          background: palette.white,
          borderRadius: '12px',
          border: `2px solid ${palette.border}`,
          padding: '20px',
          marginBottom: '24px',
        }}
      >
        {/* SEARCH BAR */}
        <div style={{ marginBottom: '20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: palette.cream,
              border: `2px solid ${palette.border}`,
              borderRadius: '8px',
              padding: '2px 2px 2px 14px',
            }}
          >
            <span style={{ color: palette.bodyText, fontSize: '16px', marginRight: '6px' }}>
              🔍
            </span>
            <input
              type="text"
              placeholder="Search by word, definition, category, or part of speech..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 0',
                border: 'none',
                background: 'transparent',
                fontSize: '14px',
                fontFamily: FONT_BODY,
                fontWeight: '600',
                outline: 'none',
                color: palette.deepNavy,
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  padding: '6px 14px',
                  background: 'transparent',
                  border: 'none',
                  color: palette.bodyText,
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontFamily: FONT_DISPLAY,
                }}
              >
                ✕ Clear
              </button>
            )}
          </div>
        </div>

        {/* FILTER ROW */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-start' }}>
          {/* Category Filter */}
          <div style={{ flex: '1 1 280px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: '800',
                color: palette.bodyText,
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontFamily: FONT_DISPLAY,
              }}
            >
              Category
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {categories.map((category) => {
                const isActive = selectedCategory === category.id;
                const catColor = category.color;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontFamily: FONT_DISPLAY,
                      background: isActive ? `${catColor}20` : 'transparent',
                      color: isActive ? catColor : palette.bodyText,
                      border: isActive
                        ? `2px solid ${catColor}`
                        : `2px solid ${palette.border}`,
                    }}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CEFR Level Filter */}
          <div style={{ flex: '1 1 280px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: '800',
                color: palette.bodyText,
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontFamily: FONT_DISPLAY,
              }}
            >
              CEFR Level
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {cefrFilterOptions.map((level) => {
                const isActive = filterCefr === level.id;
                const lvlColor = level.color;
                return (
                  <button
                    key={level.id}
                    onClick={() => setFilterCefr(level.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontFamily: FONT_DISPLAY,
                      background: isActive ? `${lvlColor}20` : 'transparent',
                      color: isActive ? lvlColor : palette.bodyText,
                      border: isActive
                        ? `2px solid ${lvlColor}`
                        : `2px solid ${palette.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {level.id === 'favorites' && <span style={{ fontSize: '11px' }}>⭐</span>}
                    {level.name}
                    {level.id === 'favorites' && favorites.length > 0 && (
                      <span
                        style={{
                          background: isActive ? lvlColor : palette.border,
                          color: isActive ? '#ffffff' : palette.bodyText,
                          borderRadius: '12px',
                          padding: '2px 6px',
                          fontSize: '10px',
                          fontWeight: '800',
                          marginLeft: '2px',
                        }}
                      >
                        {favorites.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort & View Controls */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: '800',
                  color: palette.bodyText,
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontFamily: FONT_DISPLAY,
                }}
              >
                Sort by
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '6px 28px 6px 12px',
                  borderRadius: '8px',
                  border: `2px solid ${palette.border}`,
                  fontSize: '12px',
                  fontWeight: '700',
                  color: palette.deepNavy,
                  background: palette.white,
                  cursor: 'pointer',
                  outline: 'none',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%235A587A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 10px center',
                  fontFamily: FONT_DISPLAY,
                }}
              >
                <option value="word">Word (A-Z)</option>
                <option value="cefr">CEFR Level</option>
                <option value="category">Category</option>
              </select>
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: '800',
                  color: palette.bodyText,
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontFamily: FONT_DISPLAY,
                }}
              >
                View
              </label>
              <div
                style={{
                  display: 'flex',
                  gap: '2px',
                  padding: '2px',
                  background: palette.cream,
                  borderRadius: '8px',
                  border: `2px solid ${palette.border}`,
                }}
              >
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '18px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    background: viewMode === 'grid' ? palette.white : 'transparent',
                    color: viewMode === 'grid' ? palette.warmOrange : palette.bodyText,
                    fontFamily: FONT_DISPLAY,
                    transition: 'all 0.2s ease',
                  }}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '18px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    background: viewMode === 'list' ? palette.white : 'transparent',
                    color: viewMode === 'list' ? palette.warmOrange : palette.bodyText,
                    fontFamily: FONT_DISPLAY,
                    transition: 'all 0.2s ease',
                  }}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIVE FILTERS DISPLAY */}
        {(selectedCategory !== 'all' || filterCefr !== 'all' || searchTerm) && (
          <div
            style={{
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: `2px solid ${palette.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontSize: '12px',
                color: palette.bodyText,
                fontWeight: '700',
                fontFamily: FONT_DISPLAY,
              }}
            >
              Active filters:
            </span>
            {selectedCategory !== 'all' && (
              <span
                style={{
                  padding: '4px 10px',
                  background: palette.cream,
                  borderRadius: '16px',
                  fontSize: '11px',
                  color: palette.deepNavy,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontFamily: FONT_BODY,
                  fontWeight: '700',
                  border: `2px solid ${palette.border}`,
                }}
              >
                Category: {categories.find((c) => c.id === selectedCategory)?.name}
                <button
                  onClick={() => setSelectedCategory('all')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: palette.bodyText,
                    padding: '0 2px',
                    display: 'flex',
                    alignItems: 'center',
                    fontWeight: '700',
                  }}
                >
                  ×
                </button>
              </span>
            )}
            {filterCefr !== 'all' && (
              <span
                style={{
                  padding: '4px 10px',
                  background: palette.cream,
                  borderRadius: '16px',
                  fontSize: '11px',
                  color: palette.deepNavy,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontFamily: FONT_BODY,
                  fontWeight: '700',
                  border: `2px solid ${palette.border}`,
                }}
              >
                CEFR: {cefrFilterOptions.find((d) => d.id === filterCefr)?.name}
                <button
                  onClick={() => setFilterCefr('all')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: palette.bodyText,
                    padding: '0 2px',
                    display: 'flex',
                    alignItems: 'center',
                    fontWeight: '700',
                  }}
                >
                  ×
                </button>
              </span>
            )}
            {searchTerm && (
              <span
                style={{
                  padding: '4px 10px',
                  background: palette.cream,
                  borderRadius: '16px',
                  fontSize: '11px',
                  color: palette.deepNavy,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontFamily: FONT_BODY,
                  fontWeight: '700',
                  border: `2px solid ${palette.border}`,
                }}
              >
                Search: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: palette.bodyText,
                    padding: '0 2px',
                    display: 'flex',
                    alignItems: 'center',
                    fontWeight: '700',
                  }}
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSelectedCategory('all');
                setFilterCefr('all');
                setSearchTerm('');
              }}
              style={{
                padding: '4px 10px',
                background: 'transparent',
                border: `2px solid ${palette.coral}`,
                borderRadius: '16px',
                fontSize: '11px',
                color: palette.coral,
                cursor: 'pointer',
                fontWeight: '800',
                fontFamily: FONT_DISPLAY,
              }}
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* RESULTS COUNT */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <p style={{ fontSize: '13px', color: palette.bodyText, margin: '0', fontFamily: FONT_BODY, fontWeight: 600 }}>
          Showing{' '}
          <span style={{ fontWeight: '800', color: palette.deepNavy, fontFamily: FONT_DISPLAY }}>
            {sortedAndFilteredWords.length}
          </span>{' '}
          of{' '}
          <span style={{ fontWeight: '800', color: palette.deepNavy, fontFamily: FONT_DISPLAY }}>{totalWords}</span>{' '}
          words
        </p>
        {filterCefr === 'favorites' && favorites.length === 0 && (
          <p
            style={{
              fontSize: '12px',
              color: palette.bodyText,
              margin: '0',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontFamily: FONT_BODY,
              fontWeight: 600,
            }}
          >
            <span style={{ fontSize: '11px' }}>⭐</span> No favorites yet
          </p>
        )}
      </div>

      {/* WORD DETAILS MODAL */}
      {showWordDetails && selectedWord && (
        <WordDetailsModal
          word={selectedWord}
          onClose={() => {
            setShowWordDetails(false);
            setSelectedWord(null);
          }}
          onToggleFavorite={toggleFavorite}
          isFavorite={favorites.includes(selectedWord?.id)}
        />
      )}

      {/* LOADING STATE */}
      {wordsLoading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '80px',
            background: palette.white,
            borderRadius: '8px',
            border: `2px solid ${palette.border}`,
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>⏳</div>
          <div style={{ fontSize: '16px', color: palette.bodyText, fontFamily: FONT_BODY, fontWeight: 600 }}>Loading words...</div>
        </div>
      ) : filterCefr === 'favorites' && favorites.length === 0 ? (
        /* EMPTY FAVORITES STATE */
        <div
          style={{
            textAlign: 'center',
            padding: '80px 40px',
            background: palette.white,
            borderRadius: '24px',
            border: `2px solid ${palette.border}`,
            maxWidth: '500px',
            margin: '40px auto',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              background: palette.cream,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
            }}
          >
            <span style={{ fontSize: '32px' }}>⭐</span>
          </div>
          <h3
            style={{
              fontSize: '18px',
              fontWeight: '800',
              color: palette.deepNavy,
              marginBottom: '8px',
              fontFamily: FONT_DISPLAY,
            }}
          >
            No favorites yet
          </h3>
          <p
            style={{
              fontSize: '15px',
              color: palette.bodyText,
              marginBottom: '24px',
              fontFamily: FONT_BODY,
              fontWeight: 600,
            }}
          >
            Click the star icon on any word to add it to your favorites list
          </p>
          <button
            onClick={() => setFilterCefr('all')}
            style={{
              padding: '10px 24px',
              background: palette.warmOrange,
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '800',
              cursor: 'pointer',
              fontFamily: FONT_DISPLAY,
              boxShadow: `0 4px 0 ${palette.warmOrangeShadow}`,
            }}
          >
            Browse all words
          </button>
        </div>
      ) : sortedAndFilteredWords.length === 0 ? (
        /* NO RESULTS STATE */
        <div
          style={{
            textAlign: 'center',
            padding: '80px 40px',
            background: palette.white,
            borderRadius: '24px',
            border: `2px solid ${palette.border}`,
            maxWidth: '500px',
            margin: '40px auto',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              background: palette.cream,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
            }}
          >
            <span style={{ fontSize: '32px' }}>🔍</span>
          </div>
          <h3
            style={{
              fontSize: '18px',
              fontWeight: '800',
              color: palette.deepNavy,
              marginBottom: '8px',
              fontFamily: FONT_DISPLAY,
            }}
          >
            No words found
          </h3>
          <p
            style={{
              fontSize: '15px',
              color: palette.bodyText,
              marginBottom: '24px',
              fontFamily: FONT_BODY,
              fontWeight: 600,
            }}
          >
            Try adjusting your search or filter criteria
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setFilterCefr('all');
            }}
            style={{
              padding: '10px 24px',
              background: palette.warmOrange,
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '800',
              cursor: 'pointer',
              fontFamily: FONT_DISPLAY,
              boxShadow: `0 4px 0 ${palette.warmOrangeShadow}`,
            }}
          >
            Clear all filters
          </button>
        </div>
      ) : (
        /* WORD LIST DISPLAY */
        <div
          style={{
            display: viewMode === 'grid' ? 'grid' : 'flex',
            gridTemplateColumns:
              viewMode === 'grid' ? 'repeat(auto-fill, minmax(340px, 1fr))' : 'none',
            flexDirection: viewMode === 'list' ? 'column' : 'none',
            gap: viewMode === 'grid' ? '20px' : '12px',
          }}
        >
          {sortedAndFilteredWords.map((word) => (
            <div
              key={word.id}
              style={
                viewMode === 'grid'
                  ? {
                      background: palette.white,
                      borderRadius: '16px',
                      border: `2px solid ${palette.border}`,
                      padding: '24px',
                      transition: 'all 0.2s ease',
                      fontFamily: FONT_BODY,
                      boxShadow: '0 2px 4px rgba(45, 42, 94, 0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                    }
                  : {
                      background: palette.white,
                      borderRadius: '12px',
                      border: `2px solid ${palette.border}`,
                      padding: '20px 24px',
                      transition: 'all 0.2s ease',
                      fontFamily: FONT_BODY,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      cursor: 'pointer',
                    }
              }
              onClick={() => {
                setSelectedWord(word);
                setShowWordDetails(true);
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = palette.warmOrange;
                e.currentTarget.style.boxShadow = `0 4px 12px rgba(244, 162, 97, 0.15)`;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = palette.border;
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(45, 42, 94, 0.04)';
              }}
            >
              {viewMode === 'grid' ? (
                /* ===== GRID VIEW ===== */
                <>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '16px',
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontSize: '20px',
                          fontWeight: '800',
                          color: palette.deepNavy,
                          margin: '0 0 4px 0',
                          fontFamily: FONT_DISPLAY,
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {word.word}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <p
                          style={{
                            fontSize: '12px',
                            color: palette.bodyText,
                            margin: '0',
                            fontFamily: FONT_BODY,
                            fontWeight: 600,
                          }}
                        >
                          {word.pronunciation}
                        </p>
                        <span
                          style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            background: palette.cream,
                            borderRadius: '8px',
                            color: palette.bodyText,
                            fontFamily: FONT_BODY,
                            fontWeight: 700,
                          }}
                        >
                          {word.partOfSpeech}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(word.id);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '20px',
                        padding: '4px',
                        color: favorites.includes(word.id) ? '#FFD700' : palette.bodyText,
                        transition: 'all 0.2s ease',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                      onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      {favorites.includes(word.id) ? '★' : '☆'}
                    </button>
                  </div>
                  <p
                    style={{
                      fontSize: '14px',
                      color: palette.bodyText,
                      lineHeight: '1.6',
                      marginBottom: '16px',
                      fontFamily: FONT_BODY,
                      fontWeight: 600,
                    }}
                  >
                    {word.definition}
                  </p>

                  {word.examples && word.examples.length > 0 && (
                    <div
                      style={{
                        background: palette.cream,
                        borderRadius: '10px',
                        padding: '14px',
                        marginBottom: '16px',
                        borderLeft: `3px solid ${palette.warmOrange}`,
                      }}
                    >
                      <p
                        style={{
                          fontSize: '13px',
                          color: palette.bodyText,
                          margin: '0',
                          fontStyle: 'italic',
                          fontFamily: FONT_BODY,
                          fontWeight: 600,
                        }}
                      >
                        "{word.examples[0]}"
                      </p>
                    </div>
                  )}

                  {/* SYNONYM DISPLAY (GRID) */}
                  {word.synonyms && word.synonyms.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '16px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '11px',
                          color: palette.bodyText,
                          fontWeight: '700',
                        }}
                      >
                        ↗️
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          color: palette.softGreen,
                          background: `${palette.softGreen}18`,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontFamily: FONT_BODY,
                          fontWeight: 700,
                        }}
                      >
                        {word.synonyms.slice(0, 3).join(', ')}
                      </span>
                    </div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 'auto',
                    }}
                  >
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '800',
                        background: cefrBg(word.cefrLevel),
                        color: cefrColor(word.cefrLevel),
                        fontFamily: FONT_DISPLAY,
                      }}
                    >
                      {word.cefrLevel}
                    </span>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '700',
                        background: palette.cream,
                        color: palette.bodyText,
                        fontFamily: FONT_DISPLAY,
                        textTransform: 'capitalize',
                        border: `1px solid ${palette.border}`,
                      }}
                    >
                      {word.category}
                    </span>
                  </div>
                </>
              ) : (
                /* ===== LIST VIEW ===== */
                <>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(word.id);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '20px',
                        padding: '0',
                        color: favorites.includes(word.id) ? '#FFD700' : palette.bodyText,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {favorites.includes(word.id) ? '★' : '☆'}
                    </button>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <h3
                          style={{
                            fontSize: '18px',
                            fontWeight: '800',
                            color: palette.deepNavy,
                            margin: '0',
                            fontFamily: FONT_DISPLAY,
                          }}
                        >
                          {word.word}
                        </h3>
                        <span
                          style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            background: palette.cream,
                            borderRadius: '8px',
                            color: palette.bodyText,
                            fontFamily: FONT_BODY,
                            fontWeight: 700,
                          }}
                        >
                          {word.partOfSpeech}
                        </span>
                        <span
                          style={{
                            padding: '4px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '800',
                            background: cefrBg(word.cefrLevel),
                            color: cefrColor(word.cefrLevel),
                            fontFamily: FONT_DISPLAY,
                          }}
                        >
                          {word.cefrLevel}
                        </span>
                        <span
                          style={{
                            padding: '4px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '700',
                            background: palette.cream,
                            color: palette.bodyText,
                            textTransform: 'capitalize',
                            fontFamily: FONT_DISPLAY,
                            border: `1px solid ${palette.border}`,
                          }}
                        >
                          {word.category}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: '12px',
                          color: palette.bodyText,
                          margin: '4px 0 0 0',
                          fontFamily: FONT_BODY,
                          fontWeight: 600,
                        }}
                      >
                        {word.pronunciation}
                      </p>
                    </div>
                  </div>

                  <p
                    style={{
                      fontSize: '14px',
                      color: palette.bodyText,
                      margin: '0',
                      fontFamily: FONT_BODY,
                      fontWeight: 600,
                      paddingLeft: '4px',
                    }}
                  >
                    {word.definition}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      marginTop: '4px',
                      paddingLeft: '4px',
                      borderTop: `2px solid ${palette.border}`,
                      paddingTop: '12px',
                    }}
                  >
                    {word.examples && word.examples.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            color: palette.bodyText,
                            fontWeight: '700',
                            minWidth: '70px',
                            marginTop: '2px',
                            fontFamily: FONT_DISPLAY,
                          }}
                        >
                          Example:
                        </span>
                        <span
                          style={{
                            fontSize: '13px',
                            color: palette.bodyText,
                            fontStyle: 'italic',
                            background: palette.cream,
                            padding: '6px 12px',
                            borderRadius: '6px',
                            flex: '1',
                            fontFamily: FONT_BODY,
                            fontWeight: 600,
                          }}
                        >
                          "{word.examples[0]}"
                        </span>
                      </div>
                    )}

                    {/* SYNONYM DISPLAY (LIST) */}
                    {word.synonyms && word.synonyms.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            color: palette.bodyText,
                            fontWeight: '700',
                            fontFamily: FONT_DISPLAY,
                          }}
                        >
                          ↗️ Synonym:
                        </span>
                        <span
                          style={{
                            fontSize: '12px',
                            color: palette.softGreen,
                            background: `${palette.softGreen}18`,
                            padding: '3px 10px',
                            borderRadius: '4px',
                            fontFamily: FONT_BODY,
                            fontWeight: 700,
                          }}
                        >
                          {word.synonyms.slice(0, 4).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* FOOTER STATS */}
      {sortedAndFilteredWords.length > 0 && (
        <div
          style={{
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: `2px solid ${palette.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '13px',
            color: palette.bodyText,
            flexWrap: 'wrap',
            gap: '12px',
            fontFamily: FONT_BODY,
            fontWeight: 600,
          }}
        >
          <span style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            {CEFR_LEVELS.map((lvl) => (
              <span
                key={lvl.id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: lvl.color,
                    display: 'inline-block',
                  }}
                />
                {lvl.id}: {cefrCounts[lvl.id] || 0}
              </span>
            ))}
          </span>
          <span>
            ⭐ {masteredWords} mastered · 🎯 {totalWords - masteredWords} to learn
          </span>
        </div>
      )}
    </div>
  );
};

export default WordLibrary;