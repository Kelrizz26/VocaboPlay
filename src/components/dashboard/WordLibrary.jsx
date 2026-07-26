// src/components/dashboard/WordLibrary.jsx

import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '../../pages/firebase';
import WordDetailsModal from './WordDetailsModal';
import { diffColor, diffBg, colors, fontFamily } from './dashboardStyles';

const WordLibrary = () => {
  const [words, setWords] = useState([]);
  const [wordsLoading, setWordsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDiff, setFilterDiff] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('word');
  const [selectedWord, setSelectedWord] = useState(null);
  const [showWordDetails, setShowWordDetails] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [pageLoaded, setPageLoaded] = useState(false);
  const currentUserId = localStorage.getItem('userId');

  const categories = [
    { id: 'all', name: 'All Categories', color: '#5E4B8C' },
    { id: 'action verbs', name: 'Action Verbs', color: '#B83B5E' },
    { id: 'learning strategies', name: 'Learning Strategies', color: '#2F5D62' },
    { id: 'academic', name: 'Academic', color: '#1F4E5F' }
  ];

  const difficultyLevels = [
    { id: 'all', name: 'All Levels', color: '#5E4B8C' },
    { id: 'beginner', name: 'Beginner', color: '#2E7D32' },
    { id: 'intermediate', name: 'Intermediate', color: '#B85C1A' },
    { id: 'advanced', name: 'Advanced', color: '#A93226' },
    { id: 'favorites', name: 'Favorites', color: '#C44545' }
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
        const fetched = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          partOfSpeech: d.data().partOfSpeech || 'verb',
          pronunciation: d.data().pronunciation || '',
          examples: d.data().examples || [],
          synonyms: d.data().synonyms || [],
          antonyms: d.data().antonyms || [],
          category: d.data().category || 'academic',
          teacherNote: d.data().teacherNote || ''
        }));
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
        setFavorites(prev => prev.filter(id => id !== wordId));
      } else {
        await updateDoc(userRef, { favorites: arrayUnion(wordId) });
        setFavorites(prev => [...prev, wordId]);
      }
      const event = new CustomEvent('favoritesUpdated', { 
        detail: { wordId, action: isFavorite ? 'remove' : 'add' } 
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Error updating favorites. Please try again.');
    }
  };

  const sortWords = (wordsToSort) => {
    switch (sortBy) {
      case 'word': return [...wordsToSort].sort((a, b) => a.word?.localeCompare(b.word));
      case 'difficulty':
        const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
        return [...wordsToSort].sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
      case 'category': return [...wordsToSort].sort((a, b) => (a.category || '').localeCompare(b.category || ''));
      default: return wordsToSort;
    }
  };

  const filtered = words.filter(w => {
    const matchesSearch = searchTerm === '' ? true :
      w.word?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.definition?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.partOfSpeech?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDiff = filterDiff === 'all' ? true :
      filterDiff === 'favorites' ? favorites.includes(w.id) : w.difficulty === filterDiff;
    const matchesCategory = selectedCategory === 'all' ? true : w.category === selectedCategory;
    return matchesSearch && matchesDiff && matchesCategory;
  });

  const sortedAndFilteredWords = sortWords(filtered);
  const totalWords = words.length;
  const masteredWords = favorites.length;
  const beginnerWords = words.filter(w => w.difficulty === 'beginner').length;
  const intermediateWords = words.filter(w => w.difficulty === 'intermediate').length;
  const advancedWords = words.filter(w => w.difficulty === 'advanced').length;

  return (
    <div style={{
      opacity: pageLoaded ? 1 : 0,
      transform: pageLoaded ? 'translateY(0)' : 'translateY(20px)',
      transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
    }}>
      {/* HEADER - colors.textPrimary at colors.border na */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-end', 
        marginBottom: '24px', 
        borderBottom: `1px solid ${colors.border}`, 
        paddingBottom: '16px' 
      }}>
        <div>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: '500', 
            color: colors.textPrimary, 
            marginBottom: '4px', 
            fontFamily 
          }}>Word Library</h1>
          <p style={{ 
            fontSize: '13px', 
            color: colors.textSecondary, 
            margin: 0, 
            fontWeight: '400', 
            fontFamily 
          }}>A comprehensive collection of {totalWords} essential words</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ 
            fontSize: '12px', 
            color: colors.textSecondary, 
            background: colors.bg, 
            padding: '6px 14px', 
            borderRadius: '8px', 
            border: `1px solid ${colors.border}`, 
            fontFamily, 
            fontWeight: '400' 
          }}>Total: {totalWords} Words</span>
          <span style={{ 
            fontSize: '12px', 
            color: colors.textSecondary, 
            background: colors.bg, 
            padding: '6px 14px', 
            borderRadius: '8px', 
            border: `1px solid ${colors.border}`, 
            fontFamily, 
            fontWeight: '400' 
          }}>⭐ {masteredWords} mastered</span>
        </div>
      </div>

      {/* FILTERS CONTAINER - colors.surface na */}
      <div style={{ 
        background: colors.surface, 
        borderRadius: '12px', 
        border: `1px solid ${colors.border}`, 
        padding: '20px', 
        marginBottom: '24px' 
      }}>
        {/* SEARCH BAR */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            background: colors.bg, 
            border: `1px solid ${colors.border}`, 
            borderRadius: '8px', 
            padding: '2px 2px 2px 14px' 
          }}>
            <span style={{ color: colors.textMuted, fontSize: '16px', marginRight: '6px' }}>🔍</span>
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
                fontFamily, 
                outline: 'none', 
                color: colors.textPrimary, 
                fontWeight: '400' 
              }} 
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                style={{ 
                  padding: '6px 14px', 
                  background: 'transparent', 
                  border: 'none', 
                  color: colors.textMuted, 
                  fontSize: '12px', 
                  cursor: 'pointer', 
                  fontWeight: '400', 
                  fontFamily 
                }}
              >
                ✕ Clear
              </button>
            )}
          </div>
        </div>

        {/* FILTER ROW */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-start' }}>
          {/* Category */}
          <div style={{ flex: '1 1 280px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '11px', 
              fontWeight: '500', 
              color: colors.textMuted, 
              marginBottom: '6px', 
              textTransform: 'uppercase', 
              letterSpacing: '0.02em', 
              fontFamily 
            }}>Category</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {categories.map(category => {
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
                      fontWeight: '400', 
                      cursor: 'pointer', 
                      transition: 'all 0.2s ease', 
                      fontFamily, 
                      background: isActive ? `${catColor}20` : 'transparent', 
                      color: isActive ? catColor : colors.textSecondary, 
                      border: isActive ? `1px solid ${catColor}50` : `1px solid ${colors.border}` 
                    }}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty */}
          <div style={{ flex: '1 1 280px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '11px', 
              fontWeight: '500', 
              color: colors.textMuted, 
              marginBottom: '6px', 
              textTransform: 'uppercase', 
              letterSpacing: '0.02em', 
              fontFamily 
            }}>Difficulty</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {difficultyLevels.map(level => {
                const isActive = filterDiff === level.id;
                const lvlColor = level.color;
                return (
                  <button 
                    key={level.id} 
                    onClick={() => setFilterDiff(level.id)} 
                    style={{ 
                      padding: '6px 14px', 
                      borderRadius: '8px', 
                      fontSize: '12px', 
                      fontWeight: '400', 
                      cursor: 'pointer', 
                      transition: 'all 0.2s ease', 
                      fontFamily, 
                      background: isActive ? `${lvlColor}20` : 'transparent', 
                      color: isActive ? lvlColor : colors.textSecondary, 
                      border: isActive ? `1px solid ${lvlColor}50` : `1px solid ${colors.border}`,
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px' 
                    }}
                  >
                    {level.id === 'favorites' && <span style={{ fontSize: '11px' }}>⭐</span>}
                    {level.name}
                    {level.id === 'favorites' && favorites.length > 0 && (
                      <span style={{ 
                        background: isActive ? lvlColor : colors.border, 
                        color: isActive ? '#ffffff' : colors.textSecondary, 
                        borderRadius: '12px', 
                        padding: '2px 6px', 
                        fontSize: '10px', 
                        fontWeight: '500', 
                        marginLeft: '2px' 
                      }}>
                        {favorites.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort & View */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '11px', 
                fontWeight: '500', 
                color: colors.textMuted, 
                marginBottom: '6px', 
                textTransform: 'uppercase', 
                letterSpacing: '0.02em', 
                fontFamily 
              }}>Sort by</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)} 
                style={{ 
                  padding: '6px 28px 6px 12px', 
                  borderRadius: '8px', 
                  border: `1px solid ${colors.border}`, 
                  fontSize: '12px', 
                  fontWeight: '400', 
                  color: colors.textPrimary, 
                  background: colors.surface, 
                  cursor: 'pointer', 
                  outline: 'none', 
                  appearance: 'none', 
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%236f7887' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, 
                  backgroundRepeat: 'no-repeat', 
                  backgroundPosition: 'right 10px center', 
                  fontFamily 
                }}
              >
                <option value="word">Word (A-Z)</option>
                <option value="difficulty">Difficulty</option>
                <option value="category">Category</option>
              </select>
            </div>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '11px', 
                fontWeight: '500', 
                color: colors.textMuted, 
                marginBottom: '6px', 
                textTransform: 'uppercase', 
                letterSpacing: '0.02em', 
                fontFamily 
              }}>View</label>
              <div style={{ 
                display: 'flex', 
                gap: '2px', 
                padding: '2px', 
                background: colors.bg, 
                borderRadius: '8px', 
                border: `1px solid ${colors.border}` 
              }}>
                <button 
                  onClick={() => setViewMode('grid')} 
                  style={{ 
                    padding: '6px 14px', 
                    borderRadius: '18px', 
                    border: 'none', 
                    fontSize: '12px', 
                    fontWeight: '400', 
                    cursor: 'pointer', 
                    background: viewMode === 'grid' ? colors.surface : 'transparent', 
                    color: viewMode === 'grid' ? colors.accent : colors.textSecondary, 
                    fontFamily, 
                    transition: 'all 0.2s ease' 
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
                    fontWeight: '400', 
                    cursor: 'pointer', 
                    background: viewMode === 'list' ? colors.surface : 'transparent', 
                    color: viewMode === 'list' ? colors.accent : colors.textSecondary, 
                    fontFamily, 
                    transition: 'all 0.2s ease' 
                  }}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIVE FILTERS */}
        {(selectedCategory !== 'all' || filterDiff !== 'all' || searchTerm) && (
          <div style={{ 
            marginTop: '16px', 
            paddingTop: '16px', 
            borderTop: `1px solid ${colors.border}`, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            flexWrap: 'wrap' 
          }}>
            <span style={{ 
              fontSize: '12px', 
              color: colors.textSecondary, 
              fontWeight: '400', 
              fontFamily 
            }}>Active filters:</span>
            {selectedCategory !== 'all' && (
              <span style={{ 
                padding: '4px 10px', 
                background: colors.bg, 
                borderRadius: '16px', 
                fontSize: '11px', 
                color: colors.textPrimary, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px', 
                fontFamily, 
                border: `1px solid ${colors.border}` 
              }}>
                Category: {categories.find(c => c.id === selectedCategory)?.name}
                <button 
                  onClick={() => setSelectedCategory('all')} 
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer', 
                    fontSize: '14px', 
                    color: colors.textMuted, 
                    padding: '0 2px', 
                    display: 'flex', 
                    alignItems: 'center' 
                  }}
                >
                  ×
                </button>
              </span>
            )}
            {filterDiff !== 'all' && (
              <span style={{ 
                padding: '4px 10px', 
                background: colors.bg, 
                borderRadius: '16px', 
                fontSize: '11px', 
                color: colors.textPrimary, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px', 
                fontFamily, 
                border: `1px solid ${colors.border}` 
              }}>
                Level: {difficultyLevels.find(d => d.id === filterDiff)?.name}
                <button 
                  onClick={() => setFilterDiff('all')} 
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer', 
                    fontSize: '14px', 
                    color: colors.textMuted, 
                    padding: '0 2px', 
                    display: 'flex', 
                    alignItems: 'center' 
                  }}
                >
                  ×
                </button>
              </span>
            )}
            {searchTerm && (
              <span style={{ 
                padding: '4px 10px', 
                background: colors.bg, 
                borderRadius: '16px', 
                fontSize: '11px', 
                color: colors.textPrimary, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px', 
                fontFamily, 
                border: `1px solid ${colors.border}` 
              }}>
                Search: "{searchTerm}"
                <button 
                  onClick={() => setSearchTerm('')} 
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer', 
                    fontSize: '14px', 
                    color: colors.textMuted, 
                    padding: '0 2px', 
                    display: 'flex', 
                    alignItems: 'center' 
                  }}
                >
                  ×
                </button>
              </span>
            )}
            <button 
              onClick={() => { setSelectedCategory('all'); setFilterDiff('all'); setSearchTerm(''); }} 
              style={{ 
                padding: '4px 10px', 
                background: 'transparent', 
                border: `1px solid ${colors.border}`, 
                borderRadius: '16px', 
                fontSize: '11px', 
                color: colors.textSecondary, 
                cursor: 'pointer', 
                fontWeight: '400', 
                fontFamily 
              }}
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* RESULTS COUNT */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <p style={{ 
          fontSize: '13px', 
          color: colors.textSecondary, 
          margin: '0', 
          fontFamily 
        }}>
          Showing <span style={{ fontWeight: '500', color: colors.textPrimary }}>{sortedAndFilteredWords.length}</span> of <span style={{ fontWeight: '500', color: colors.textPrimary }}>{totalWords}</span> words
        </p>
        {filterDiff === 'favorites' && favorites.length === 0 && (
          <p style={{ 
            fontSize: '12px', 
            color: colors.textMuted, 
            margin: '0', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px', 
            fontFamily 
          }}>
            <span style={{ fontSize: '11px' }}>⭐</span> No favorites yet
          </p>
        )}
      </div>

      {/* WORD DETAILS MODAL */}
      {showWordDetails && selectedWord && (
        <WordDetailsModal 
          word={selectedWord} 
          onClose={() => { setShowWordDetails(false); setSelectedWord(null); }} 
          onToggleFavorite={toggleFavorite} 
          isFavorite={favorites.includes(selectedWord?.id)} 
        />
      )}

      {/* LOADING STATE */}
      {wordsLoading ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '80px', 
          background: colors.surface, 
          borderRadius: '8px', 
          border: `1px solid ${colors.border}` 
        }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>⏳</div>
          <div style={{ fontSize: '16px', color: colors.textSecondary }}>Loading words...</div>
        </div>
      ) : filterDiff === 'favorites' && favorites.length === 0 ? (
        /* EMPTY FAVORITES */
        <div style={{ 
          textAlign: 'center', 
          padding: '80px 40px', 
          background: colors.surface, 
          borderRadius: '24px', 
          border: `1px solid ${colors.border}`, 
          maxWidth: '500px', 
          margin: '40px auto' 
        }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            background: colors.bg, 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 24px' 
          }}>
            <span style={{ fontSize: '32px' }}>⭐</span>
          </div>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: colors.textPrimary, 
            marginBottom: '8px', 
            fontFamily 
          }}>No favorites yet</h3>
          <p style={{ 
            fontSize: '15px', 
            color: colors.textSecondary, 
            marginBottom: '24px', 
            fontFamily 
          }}>Click the star icon on any word to add it to your favorites list</p>
          <button 
            onClick={() => setFilterDiff('all')} 
            style={{ 
              padding: '10px 24px', 
              background: colors.accent, 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              fontSize: '14px', 
              fontWeight: '500', 
              cursor: 'pointer', 
              fontFamily 
            }}
          >
            Browse all words
          </button>
        </div>
      ) : sortedAndFilteredWords.length === 0 ? (
        /* NO RESULTS */
        <div style={{ 
          textAlign: 'center', 
          padding: '80px 40px', 
          background: colors.surface, 
          borderRadius: '24px', 
          border: `1px solid ${colors.border}`, 
          maxWidth: '500px', 
          margin: '40px auto' 
        }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            background: colors.bg, 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 24px' 
          }}>
            <span style={{ fontSize: '32px' }}>🔍</span>
          </div>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: colors.textPrimary, 
            marginBottom: '8px', 
            fontFamily 
          }}>No words found</h3>
          <p style={{ 
            fontSize: '15px', 
            color: colors.textSecondary, 
            marginBottom: '24px', 
            fontFamily 
          }}>Try adjusting your search or filter criteria</p>
          <button 
            onClick={() => { setSearchTerm(''); setSelectedCategory('all'); setFilterDiff('all'); }} 
            style={{ 
              padding: '10px 24px', 
              background: colors.accent, 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              fontSize: '14px', 
              fontWeight: '500', 
              cursor: 'pointer', 
              fontFamily 
            }}
          >
            Clear all filters
          </button>
        </div>
      ) : (
        /* WORD LIST */
        <div style={{ 
          display: viewMode === 'grid' ? 'grid' : 'flex', 
          gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(340px, 1fr))' : 'none', 
          flexDirection: viewMode === 'list' ? 'column' : 'none', 
          gap: viewMode === 'grid' ? '20px' : '12px' 
        }}>
          {sortedAndFilteredWords.map((word) => (
            <div 
              key={word.id} 
              style={viewMode === 'grid' ? { 
                background: colors.surface, 
                borderRadius: '16px', 
                border: `1px solid ${colors.border}`, 
                padding: '24px', 
                transition: 'all 0.2s ease', 
                fontFamily, 
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)', 
                display: 'flex', 
                flexDirection: 'column',
                cursor: 'pointer' 
              } : { 
                background: colors.surface, 
                borderRadius: '12px', 
                border: `1px solid ${colors.border}`, 
                padding: '20px 24px', 
                transition: 'all 0.2s ease', 
                fontFamily, 
                display: 'flex', 
                flexDirection: 'column',
                gap: '12px',
                cursor: 'pointer' 
              }} 
              onClick={() => { 
                setSelectedWord(word); 
                setShowWordDetails(true); 
              }} 
              onMouseOver={(e) => { 
                e.currentTarget.style.borderColor = colors.accent; 
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; 
              }} 
              onMouseOut={(e) => { 
                e.currentTarget.style.borderColor = colors.border; 
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)'; 
              }}
            >
              {viewMode === 'grid' ? (
                /* ===== GRID VIEW ===== */
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ 
                        fontSize: '20px', 
                        fontWeight: '600', 
                        color: colors.textPrimary, 
                        margin: '0 0 4px 0', 
                        fontFamily, 
                        letterSpacing: '-0.01em' 
                      }}>{word.word}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <p style={{ 
                          fontSize: '12px', 
                          color: colors.textMuted, 
                          margin: '0', 
                          fontFamily 
                        }}>{word.pronunciation}</p>
                        <span style={{ 
                          fontSize: '11px', 
                          padding: '2px 8px', 
                          background: colors.bg, 
                          borderRadius: '8px', 
                          color: colors.textSecondary 
                        }}>{word.partOfSpeech}</span>
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
                        color: favorites.includes(word.id) ? '#FFD700' : colors.textMuted, 
                        transition: 'all 0.2s ease' 
                      }} 
                      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'} 
                      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      {favorites.includes(word.id) ? '★' : '☆'}
                    </button>
                  </div>
                  <p style={{ 
                    fontSize: '14px', 
                    color: colors.textPrimary, 
                    lineHeight: '1.6', 
                    marginBottom: '16px', 
                    fontFamily 
                  }}>{word.definition}</p>
                  
                  {/* GRID: Examples */}
                  {word.examples && word.examples.length > 0 && (
                    <div style={{ 
                      background: colors.bg, 
                      borderRadius: '10px', 
                      padding: '14px', 
                      marginBottom: '16px', 
                      borderLeft: `3px solid ${diffColor(word.difficulty)}` 
                    }}>
                      <p style={{ 
                        fontSize: '13px', 
                        color: colors.textSecondary, 
                        margin: '0', 
                        fontStyle: 'italic', 
                        fontFamily 
                      }}>"{word.examples[0]}"</p>
                    </div>
                  )}

                  {/* GRID: Synonyms & Antonyms */}
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    {word.synonyms && word.synonyms.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: colors.textMuted, fontWeight: '500' }}>↗️</span>
                        <span style={{ 
                          fontSize: '11px', 
                          color: '#2F5D62', 
                          background: '#E8F5E9', 
                          padding: '2px 8px', 
                          borderRadius: '4px' 
                        }}>
                          {word.synonyms.slice(0, 3).join(', ')}
                        </span>
                      </div>
                    )}
                    {word.antonyms && word.antonyms.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: colors.textMuted, fontWeight: '500' }}>↘️</span>
                        <span style={{ 
                          fontSize: '11px', 
                          color: '#B83B5E', 
                          background: '#FFEBEE', 
                          padding: '2px 8px', 
                          borderRadius: '4px' 
                        }}>
                          {word.antonyms.slice(0, 3).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '8px', 
                      fontSize: '12px', 
                      fontWeight: '600', 
                      background: diffBg(word.difficulty), 
                      color: diffColor(word.difficulty), 
                      fontFamily, 
                      textTransform: 'capitalize' 
                    }}>{word.difficulty}</span>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '8px', 
                      fontSize: '12px', 
                      fontWeight: '500', 
                      background: colors.bg, 
                      color: colors.textSecondary, 
                      fontFamily, 
                      textTransform: 'capitalize' 
                    }}>{word.category}</span>
                  </div>
                </>
              ) : (
                /* ===== LIST VIEW ===== */
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
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
                        color: favorites.includes(word.id) ? '#FFD700' : colors.textMuted, 
                        transition: 'all 0.2s ease' 
                      }}
                    >
                      {favorites.includes(word.id) ? '★' : '☆'}
                    </button>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h3 style={{ 
                          fontSize: '18px', 
                          fontWeight: '600', 
                          color: colors.textPrimary, 
                          margin: '0', 
                          fontFamily 
                        }}>{word.word}</h3>
                        <span style={{ 
                          fontSize: '11px', 
                          padding: '2px 8px', 
                          background: colors.bg, 
                          borderRadius: '8px', 
                          color: colors.textSecondary 
                        }}>{word.partOfSpeech}</span>
                        <span style={{ 
                          padding: '4px 12px', 
                          borderRadius: '8px', 
                          fontSize: '12px', 
                          fontWeight: '600', 
                          background: diffBg(word.difficulty), 
                          color: diffColor(word.difficulty), 
                          textTransform: 'capitalize' 
                        }}>{word.difficulty}</span>
                        <span style={{ 
                          padding: '4px 12px', 
                          borderRadius: '8px', 
                          fontSize: '12px', 
                          fontWeight: '500', 
                          background: colors.bg, 
                          color: colors.textSecondary, 
                          textTransform: 'capitalize' 
                        }}>{word.category}</span>
                      </div>
                      <p style={{ 
                        fontSize: '12px', 
                        color: colors.textMuted, 
                        margin: '4px 0 0 0' 
                      }}>{word.pronunciation}</p>
                    </div>
                  </div>

                  <p style={{ 
                    fontSize: '14px', 
                    color: colors.textPrimary, 
                    margin: '0', 
                    fontFamily, 
                    paddingLeft: '4px' 
                  }}>
                    {word.definition}
                  </p>

                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '8px', 
                    marginTop: '4px',
                    paddingLeft: '4px',
                    borderTop: `1px solid ${colors.border}`,
                    paddingTop: '12px'
                  }}>
                    {word.examples && word.examples.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <span style={{ 
                          fontSize: '11px', 
                          color: colors.textMuted, 
                          fontWeight: '600', 
                          minWidth: '70px', 
                          marginTop: '2px' 
                        }}>Example:</span>
                        <span style={{ 
                          fontSize: '13px', 
                          color: colors.textSecondary, 
                          fontStyle: 'italic', 
                          background: colors.bg, 
                          padding: '6px 12px', 
                          borderRadius: '6px', 
                          flex: '1' 
                        }}>
                          "{word.examples[0]}"
                        </span>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {word.synonyms && word.synonyms.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '11px', color: colors.textMuted, fontWeight: '600' }}>↗️ Synonyms:</span>
                          <span style={{ 
                            fontSize: '12px', 
                            color: '#2F5D62', 
                            background: '#E8F5E9', 
                            padding: '3px 10px', 
                            borderRadius: '4px' 
                          }}>
                            {word.synonyms.slice(0, 4).join(', ')}
                          </span>
                        </div>
                      )}
                      {word.antonyms && word.antonyms.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '11px', color: colors.textMuted, fontWeight: '600' }}>↘️ Antonyms:</span>
                          <span style={{ 
                            fontSize: '12px', 
                            color: '#B83B5E', 
                            background: '#FFEBEE', 
                            padding: '3px 10px', 
                            borderRadius: '4px' 
                          }}>
                            {word.antonyms.slice(0, 4).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* FOOTER STATS */}
      {sortedAndFilteredWords.length > 0 && (
        <div style={{ 
          marginTop: '32px', 
          paddingTop: '24px', 
          borderTop: `1px solid ${colors.border}`, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          fontSize: '13px', 
          color: colors.textSecondary 
        }}>
          <span>📊 {beginnerWords} Beginner · {intermediateWords} Intermediate · {advancedWords} Advanced</span>
          <span>⭐ {masteredWords} mastered · 🎯 {totalWords - masteredWords} to learn</span>
        </div>
      )}
    </div>
  );
};

export default WordLibrary;