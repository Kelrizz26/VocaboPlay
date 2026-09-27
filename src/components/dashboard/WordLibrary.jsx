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
};

const FONT_DISPLAY = "'Fredoka', sans-serif";
const FONT_BODY = "'Nunito', sans-serif";

// ===== DUOTONE SVG ICONS (Same style as Landing) =====
const Icon = ({ name, size = 20, color = palette.bodyText, secondaryColor = `${palette.bodyText}66` }) => {
  const icons = {
    search: (
      <>
        <circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2" fill="none"/>
        <path d="M21 21l-4.35-4.35" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      </>
    ),
    close: (
      <path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    ),
    star: (
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    ),
    starFilled: (
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={color}/>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" fill="none"/>
        <rect x="14" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" fill="none"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" fill="none"/>
        <rect x="14" y="14" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" fill="none"/>
      </>
    ),
    list: (
      <>
        <path d="M8 6h13M8 12h13M8 18h13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="4" cy="6" r="1.5" fill={color}/>
        <circle cx="4" cy="12" r="1.5" fill={color}/>
        <circle cx="4" cy="18" r="1.5" fill={color}/>
      </>
    ),
    arrow: (
      <path d="M7 17L17 7M17 7H8M17 7v9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none"/>
        <path d="M12 7v5l3 2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', flexShrink: 0 }}>
      {icons[name] || icons.search}
    </svg>
  );
};

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
        transform: pageLoaded ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '20px',
          borderBottom: `1.5px solid ${palette.border}`,
          paddingBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px',
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
              color: palette.bodyTextSoft,
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
              background: palette.creamSoft,
              padding: '6px 14px',
              borderRadius: '8px',
              border: `1.5px solid ${palette.border}`,
              fontFamily: FONT_DISPLAY,
              fontWeight: '700',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            Total: <strong style={{ color: palette.deepNavy }}>{totalWords}</strong>
          </span>
          <span
            style={{
              fontSize: '12px',
              color: palette.bodyText,
              background: palette.creamSoft,
              padding: '6px 14px',
              borderRadius: '8px',
              border: `1.5px solid ${palette.border}`,
              fontFamily: FONT_DISPLAY,
              fontWeight: '700',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Icon name="starFilled" size={12} color="#d4af37" />
            <strong style={{ color: palette.deepNavy }}>{masteredWords}</strong> mastered
          </span>
        </div>
      </div>

      {/* FILTERS CONTAINER */}
      <div
        style={{
          background: palette.white,
          borderRadius: '14px',
          border: `1.5px solid ${palette.border}`,
          padding: '20px',
          marginBottom: '20px',
          boxShadow: `0 2px 0 ${palette.border}`,
        }}
      >
        {/* SEARCH BAR */}
        <div style={{ marginBottom: '18px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: palette.creamSoft,
              border: `1.5px solid ${palette.border}`,
              borderRadius: '10px',
              padding: '2px 2px 2px 14px',
            }}
          >
            <span style={{ marginRight: '8px', display: 'flex' }}>
              <Icon name="search" size={16} color={palette.bodyTextSoft} />
            </span>
            <input
              type="text"
              placeholder="Search by word, definition, category, or part of speech..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 0',
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
                  color: palette.bodyTextSoft,
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontFamily: FONT_DISPLAY,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Icon name="close" size={12} color={palette.bodyTextSoft} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* FILTER ROW */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-start' }}>
          {/* Category Filter */}
          <div style={{ flex: '1 1 260px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '10px',
                fontWeight: '800',
                color: palette.bodyTextSoft,
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontFamily: FONT_DISPLAY,
              }}
            >
              Category
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
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
                      transition: 'all 0.18s ease',
                      fontFamily: FONT_DISPLAY,
                      background: isActive ? `${catColor}18` : palette.white,
                      color: isActive ? catColor : palette.bodyText,
                      border: isActive
                        ? `1.5px solid ${catColor}`
                        : `1.5px solid ${palette.border}`,
                      boxShadow: isActive ? `0 2px 0 ${catColor}40` : `0 2px 0 ${palette.border}`,
                    }}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CEFR Level Filter */}
          <div style={{ flex: '1 1 260px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '10px',
                fontWeight: '800',
                color: palette.bodyTextSoft,
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontFamily: FONT_DISPLAY,
              }}
            >
              CEFR Level
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
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
                      transition: 'all 0.18s ease',
                      fontFamily: FONT_DISPLAY,
                      background: isActive ? `${lvlColor}18` : palette.white,
                      color: isActive ? lvlColor : palette.bodyText,
                      border: isActive
                        ? `1.5px solid ${lvlColor}`
                        : `1.5px solid ${palette.border}`,
                      boxShadow: isActive ? `0 2px 0 ${lvlColor}40` : `0 2px 0 ${palette.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    {level.id === 'favorites' && <Icon name="starFilled" size={11} color={isActive ? lvlColor : '#d4af37'} />}
                    {level.name}
                    {level.id === 'favorites' && favorites.length > 0 && (
                      <span
                        style={{
                          background: isActive ? lvlColor : palette.border,
                          color: isActive ? '#ffffff' : palette.bodyTextSoft,
                          borderRadius: '12px',
                          padding: '1px 6px',
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
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '10px',
                  fontWeight: '800',
                  color: palette.bodyTextSoft,
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
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
                  border: `1.5px solid ${palette.border}`,
                  fontSize: '12px',
                  fontWeight: '700',
                  color: palette.deepNavy,
                  background: palette.white,
                  cursor: 'pointer',
                  outline: 'none',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%236B6880' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 10px center',
                  fontFamily: FONT_DISPLAY,
                  boxShadow: `0 2px 0 ${palette.border}`,
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
                  fontSize: '10px',
                  fontWeight: '800',
                  color: palette.bodyTextSoft,
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
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
                  background: palette.creamSoft,
                  borderRadius: '8px',
                  border: `1.5px solid ${palette.border}`,
                }}
              >
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    background: viewMode === 'grid' ? palette.white : 'transparent',
                    color: viewMode === 'grid' ? palette.warmOrange : palette.bodyText,
                    fontFamily: FONT_DISPLAY,
                    transition: 'all 0.18s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <Icon name="grid" size={12} color={viewMode === 'grid' ? palette.warmOrange : palette.bodyText} />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    background: viewMode === 'list' ? palette.white : 'transparent',
                    color: viewMode === 'list' ? palette.warmOrange : palette.bodyText,
                    fontFamily: FONT_DISPLAY,
                    transition: 'all 0.18s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <Icon name="list" size={12} color={viewMode === 'list' ? palette.warmOrange : palette.bodyText} />
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
              borderTop: `1.5px solid ${palette.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                color: palette.bodyTextSoft,
                fontWeight: '700',
                fontFamily: FONT_DISPLAY,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Active:
            </span>
            {selectedCategory !== 'all' && (
              <span
                style={{
                  padding: '4px 10px',
                  background: palette.creamSoft,
                  borderRadius: '16px',
                  fontSize: '11px',
                  color: palette.deepNavy,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: FONT_BODY,
                  fontWeight: '700',
                  border: `1.5px solid ${palette.border}`,
                }}
              >
                {categories.find((c) => c.id === selectedCategory)?.name}
                <button
                  onClick={() => setSelectedCategory('all')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Icon name="close" size={11} color={palette.bodyTextSoft} />
                </button>
              </span>
            )}
            {filterCefr !== 'all' && (
              <span
                style={{
                  padding: '4px 10px',
                  background: palette.creamSoft,
                  borderRadius: '16px',
                  fontSize: '11px',
                  color: palette.deepNavy,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: FONT_BODY,
                  fontWeight: '700',
                  border: `1.5px solid ${palette.border}`,
                }}
              >
                {cefrFilterOptions.find((d) => d.id === filterCefr)?.name}
                <button
                  onClick={() => setFilterCefr('all')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Icon name="close" size={11} color={palette.bodyTextSoft} />
                </button>
              </span>
            )}
            {searchTerm && (
              <span
                style={{
                  padding: '4px 10px',
                  background: palette.creamSoft,
                  borderRadius: '16px',
                  fontSize: '11px',
                  color: palette.deepNavy,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: FONT_BODY,
                  fontWeight: '700',
                  border: `1.5px solid ${palette.border}`,
                }}
              >
                "{searchTerm}"
                <button
                  onClick={() => setSearchTerm('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Icon name="close" size={11} color={palette.bodyTextSoft} />
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
                border: `1.5px solid ${palette.coral}`,
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
          marginBottom: '14px',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <p style={{ fontSize: '12px', color: palette.bodyTextSoft, margin: '0', fontFamily: FONT_BODY, fontWeight: 600 }}>
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
              fontSize: '11px',
              color: palette.bodyTextSoft,
              margin: '0',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontFamily: FONT_BODY,
              fontWeight: 600,
            }}
          >
            <Icon name="star" size={11} color={palette.bodyTextSoft} /> No favorites yet
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
            borderRadius: '14px',
            border: `1.5px solid ${palette.border}`,
          }}
        >
          <div style={{ 
            width: '36px', height: '36px', 
            border: `3px solid ${palette.border}`, 
            borderTop: `3px solid ${palette.warmOrange}`, 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite', 
            margin: '0 auto 16px' 
          }} />
          <div style={{ fontSize: '14px', color: palette.bodyTextSoft, fontFamily: FONT_BODY, fontWeight: 600 }}>Loading words...</div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : filterCefr === 'favorites' && favorites.length === 0 ? (
        /* EMPTY FAVORITES STATE */
        <div
          style={{
            textAlign: 'center',
            padding: '60px 40px',
            background: palette.white,
            borderRadius: '20px',
            border: `1.5px solid ${palette.border}`,
            maxWidth: '440px',
            margin: '40px auto',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              background: palette.creamSoft,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <Icon name="star" size={28} color={palette.warmOrange} />
          </div>
          <h3
            style={{
              fontSize: '17px',
              fontWeight: '800',
              color: palette.deepNavy,
              marginBottom: '6px',
              fontFamily: FONT_DISPLAY,
            }}
          >
            No favorites yet
          </h3>
          <p
            style={{
              fontSize: '13px',
              color: palette.bodyTextSoft,
              marginBottom: '20px',
              fontFamily: FONT_BODY,
              fontWeight: 600,
            }}
          >
            Click the star icon on any word to add it to your favorites
          </p>
          <button
            onClick={() => setFilterCefr('all')}
            style={{
              padding: '10px 22px',
              background: palette.warmOrange,
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '800',
              cursor: 'pointer',
              fontFamily: FONT_DISPLAY,
              boxShadow: `0 3px 0 ${palette.warmOrangeShadow}`,
              transition: 'transform 0.1s ease, box-shadow 0.1s ease',
            }}
            onMouseDown={e => { e.currentTarget.style.transform = 'translateY(3px)'; e.currentTarget.style.boxShadow = 'none'; }}
            onMouseUp={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 3px 0 ${palette.warmOrangeShadow}`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 3px 0 ${palette.warmOrangeShadow}`; }}
          >
            Browse all words
          </button>
        </div>
      ) : sortedAndFilteredWords.length === 0 ? (
        /* NO RESULTS STATE */
        <div
          style={{
            textAlign: 'center',
            padding: '60px 40px',
            background: palette.white,
            borderRadius: '20px',
            border: `1.5px solid ${palette.border}`,
            maxWidth: '440px',
            margin: '40px auto',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              background: palette.creamSoft,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <Icon name="search" size={28} color={palette.bodyTextSoft} />
          </div>
          <h3
            style={{
              fontSize: '17px',
              fontWeight: '800',
              color: palette.deepNavy,
              marginBottom: '6px',
              fontFamily: FONT_DISPLAY,
            }}
          >
            No words found
          </h3>
          <p
            style={{
              fontSize: '13px',
              color: palette.bodyTextSoft,
              marginBottom: '20px',
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
              padding: '10px 22px',
              background: palette.warmOrange,
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '800',
              cursor: 'pointer',
              fontFamily: FONT_DISPLAY,
              boxShadow: `0 3px 0 ${palette.warmOrangeShadow}`,
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
              viewMode === 'grid' ? 'repeat(auto-fill, minmax(320px, 1fr))' : 'none',
            flexDirection: viewMode === 'list' ? 'column' : 'none',
            gap: viewMode === 'grid' ? '16px' : '10px',
          }}
        >
          {sortedAndFilteredWords.map((word) => (
            <div
              key={word.id}
              className="word-card"
              style={
                viewMode === 'grid'
                  ? {
                      background: palette.white,
                      borderRadius: '14px',
                      border: `1.5px solid ${palette.border}`,
                      padding: '22px',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                      fontFamily: FONT_BODY,
                      boxShadow: `0 2px 0 ${palette.border}`,
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                    }
                  : {
                      background: palette.white,
                      borderRadius: '12px',
                      border: `1.5px solid ${palette.border}`,
                      padding: '18px 22px',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                      fontFamily: FONT_BODY,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      cursor: 'pointer',
                      boxShadow: `0 2px 0 ${palette.border}`,
                    }
              }
              onClick={() => {
                setSelectedWord(word);
                setShowWordDetails(true);
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = palette.warmOrange;
                e.currentTarget.style.boxShadow = `0 6px 16px ${palette.shadowMd}`;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = palette.border;
                e.currentTarget.style.boxShadow = `0 2px 0 ${palette.border}`;
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
                      marginBottom: '14px',
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontSize: '19px',
                          fontWeight: '800',
                          color: palette.deepNavy,
                          margin: '0 0 4px 0',
                          fontFamily: FONT_DISPLAY,
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {word.word}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <p
                          style={{
                            fontSize: '12px',
                            color: palette.bodyTextSoft,
                            margin: '0',
                            fontFamily: FONT_BODY,
                            fontWeight: 600,
                            fontStyle: 'italic',
                          }}
                        >
                          {word.pronunciation}
                        </p>
                        <span
                          style={{
                            fontSize: '10px',
                            padding: '2px 8px',
                            background: palette.creamSoft,
                            borderRadius: '6px',
                            color: palette.bodyTextSoft,
                            fontFamily: FONT_BODY,
                            fontWeight: 700,
                            border: `1px solid ${palette.border}`,
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
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.15s ease',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.15)')}
                      onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      <Icon 
                        name={favorites.includes(word.id) ? 'starFilled' : 'star'} 
                        size={20} 
                        color={favorites.includes(word.id) ? '#d4af37' : palette.bodyTextSoft} 
                      />
                    </button>
                  </div>
                  <p
                    style={{
                      fontSize: '13px',
                      color: palette.bodyText,
                      lineHeight: '1.6',
                      marginBottom: '14px',
                      fontFamily: FONT_BODY,
                      fontWeight: 600,
                    }}
                  >
                    {word.definition}
                  </p>

                  {word.examples && word.examples.length > 0 && (
                    <div
                      style={{
                        background: palette.creamSoft,
                        borderRadius: '10px',
                        padding: '12px 14px',
                        marginBottom: '14px',
                        borderLeft: `3px solid ${palette.warmOrange}`,
                      }}
                    >
                      <p
                        style={{
                          fontSize: '12px',
                          color: palette.bodyText,
                          margin: '0',
                          fontStyle: 'italic',
                          fontFamily: FONT_BODY,
                          fontWeight: 600,
                          lineHeight: 1.5,
                        }}
                      >
                        "{word.examples[0]}"
                      </p>
                    </div>
                  )}

                  {word.synonyms && word.synonyms.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '14px',
                      }}
                    >
                      <Icon name="arrow" size={12} color={palette.softGreen} />
                      <span
                        style={{
                          fontSize: '11px',
                          color: palette.softGreen,
                          background: `${palette.softGreen}15`,
                          padding: '3px 8px',
                          borderRadius: '6px',
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
                      paddingTop: '12px',
                      borderTop: `1.5px solid ${palette.borderSoft}`,
                    }}
                  >
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '8px',
                        fontSize: '11px',
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
                        fontSize: '11px',
                        fontWeight: '700',
                        background: palette.creamSoft,
                        color: palette.bodyTextSoft,
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
                      gap: '14px',
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
                        padding: '0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon 
                        name={favorites.includes(word.id) ? 'starFilled' : 'star'} 
                        size={20} 
                        color={favorites.includes(word.id) ? '#d4af37' : palette.bodyTextSoft} 
                      />
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
                            fontSize: '17px',
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
                            fontSize: '10px',
                            padding: '2px 8px',
                            background: palette.creamSoft,
                            borderRadius: '6px',
                            color: palette.bodyTextSoft,
                            fontFamily: FONT_BODY,
                            fontWeight: 700,
                            border: `1px solid ${palette.border}`,
                          }}
                        >
                          {word.partOfSpeech}
                        </span>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
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
                            padding: '3px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '700',
                            background: palette.creamSoft,
                            color: palette.bodyTextSoft,
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
                          fontSize: '11px',
                          color: palette.bodyTextSoft,
                          margin: '4px 0 0 0',
                          fontFamily: FONT_BODY,
                          fontWeight: 600,
                          fontStyle: 'italic',
                        }}
                      >
                        {word.pronunciation}
                      </p>
                    </div>
                  </div>

                  <p
                    style={{
                      fontSize: '13px',
                      color: palette.bodyText,
                      margin: '0',
                      fontFamily: FONT_BODY,
                      fontWeight: 600,
                      lineHeight: 1.55,
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
                      paddingTop: '12px',
                      borderTop: `1.5px solid ${palette.borderSoft}`,
                    }}
                  >
                    {word.examples && word.examples.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span
                          style={{
                            fontSize: '10px',
                            color: palette.bodyTextSoft,
                            fontWeight: '800',
                            minWidth: '60px',
                            marginTop: '3px',
                            fontFamily: FONT_DISPLAY,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          Ex.
                        </span>
                        <span
                          style={{
                            fontSize: '12px',
                            color: palette.bodyText,
                            fontStyle: 'italic',
                            background: palette.creamSoft,
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

                    {word.synonyms && word.synonyms.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            fontSize: '10px',
                            color: palette.bodyTextSoft,
                            fontWeight: '800',
                            fontFamily: FONT_DISPLAY,
                            minWidth: '60px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          Syn.
                        </span>
                        <span
                          style={{
                            fontSize: '11px',
                            color: palette.softGreen,
                            background: `${palette.softGreen}15`,
                            padding: '3px 10px',
                            borderRadius: '6px',
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
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: `1.5px solid ${palette.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px',
            color: palette.bodyTextSoft,
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
                <strong style={{ color: palette.deepNavy, fontFamily: FONT_DISPLAY }}>{lvl.id}:</strong> {cefrCounts[lvl.id] || 0}
              </span>
            ))}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Icon name="starFilled" size={12} color="#d4af37" />
            <strong style={{ color: palette.deepNavy, fontFamily: FONT_DISPLAY }}>{masteredWords}</strong> mastered
            <span style={{ color: palette.borderSoft, margin: '0 4px' }}>·</span>
            <Icon name="clock" size={12} color={palette.bodyTextSoft} />
            <strong style={{ color: palette.deepNavy, fontFamily: FONT_DISPLAY }}>{totalWords - masteredWords}</strong> to learn
          </span>
        </div>
      )}
    </div>
  );
};

export default WordLibrary;