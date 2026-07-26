// src/components/dashboard/FavoritesPage.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../../pages/firebase';
import { doc, getDoc, updateDoc, arrayRemove, collection, getDocs } from 'firebase/firestore';
import { colors, fontFamily } from './dashboardStyles';

const FavoritesPage = () => {
  const [favoriteWords, setFavoriteWords] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);
  const [showWordDetails, setShowWordDetails] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [pageLoaded, setPageLoaded] = useState(false);
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    setPageLoaded(true);
  }, []);

  const diffColor = (d) => {
    if (d === 'Easy' || d === 'beginner') return '#4CAF50';
    if (d === 'Medium' || d === 'intermediate') return '#FF9800';
    if (d === 'Hard' || d === 'advanced') return '#F44336';
    return '#7c8b9c';
  };

  const diffBg = (d) => {
    if (d === 'Easy' || d === 'beginner') return '#e8f5e9';
    if (d === 'Medium' || d === 'intermediate') return '#fff4e5';
    if (d === 'Hard' || d === 'advanced') return '#ffebee';
    return '#F8FAFC';
  };

  useEffect(() => {
    const loadFavorites = async () => {
      if (!currentUserId) {
        return;
      }
      
      try {
        const userRef = doc(db, 'users', currentUserId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const favIds = userData.favorites || [];
          
          if (favIds.length > 0) {
            const wordsRef = collection(db, 'words');
            const wordsSnap = await getDocs(wordsRef);
            const allWords = wordsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const filtered = allWords.filter(word => favIds.includes(word.id));
            setFavoriteWords(filtered);
          } else {
            setFavoriteWords([]);
          }
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    };

    loadFavorites();
    
    const handleFavoritesUpdate = () => {
      loadFavorites();
    };
    
    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);
    window.addEventListener('favoritesLoaded', handleFavoritesUpdate);
    
    return () => {
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
      window.removeEventListener('favoritesLoaded', handleFavoritesUpdate);
    };
  }, [currentUserId]);

  const removeFavorite = async (wordId) => {
    if (!currentUserId) return;
    
    try {
      const userRef = doc(db, 'users', currentUserId);
      await updateDoc(userRef, {
        favorites: arrayRemove(wordId)
      });
      setFavoriteWords(prev => prev.filter(word => word.id !== wordId));
      
      const event = new CustomEvent('favoritesUpdated', { 
        detail: { wordId, action: 'remove' } 
      });
      window.dispatchEvent(event);
      
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert('Error removing favorite. Please try again.');
    }
  };

  const WordDetailsModal = ({ word, onClose }) => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      backdropFilter: 'blur(4px)',
      padding: '20px',
    }} onClick={onClose}>
      <div style={{
        background: colors.surface,
        borderRadius: '24px',
        padding: '40px',
        maxWidth: '700px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: 'none',
        border: `1px solid ${colors.border}`,
        position: 'relative',
      }} onClick={(e) => e.stopPropagation()}>

        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: colors.bg,
            border: 'none',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            fontSize: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.textSecondary,
          }}
        >
          ✕
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', paddingRight: '40px' }}>
          <div>
            <h2 style={{ fontSize: '36px', fontWeight: '700', color: colors.textPrimary, margin: '0 0 8px 0' }}>{word.word}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '16px', color: colors.textSecondary }}>{word.pronunciation}</span>
              <span style={{ padding: '4px 12px', background: colors.bg, borderRadius: '8px', fontSize: '14px', color: colors.textSecondary }}>{word.partOfSpeech || 'verb'}</span>
            </div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); removeFavorite(word.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '32px', color: '#FFD700', padding: '8px' }}>★</button>
        </div>

        <div style={{ background: `${colors.accent}15`, borderRadius: '16px', padding: '24px', marginBottom: '28px', border: `1px solid ${colors.border}` }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: colors.accent, margin: '0 0 8px 0', textTransform: 'uppercase' }}>Definition</h3>
          <p style={{ fontSize: '18px', lineHeight: '1.6', color: colors.textPrimary, margin: 0 }}>{word.definition}</p>
        </div>

        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: colors.textSecondary, margin: '0 0 16px 0', textTransform: 'uppercase' }}>Example Sentences</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {word.examples?.map((example, idx) => (
              <div key={idx} style={{ background: colors.bg, padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}`, fontStyle: 'italic', fontSize: '15px', color: colors.textPrimary, lineHeight: '1.6', position: 'relative', paddingLeft: '32px' }}>
                <span style={{ position: 'absolute', left: '12px', top: '16px', color: colors.accent, fontSize: '14px', fontWeight: '600' }}>#{idx + 1}</span>
                {example}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: `1px solid ${colors.border}` }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span style={{ padding: '6px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', background: diffBg(word.difficulty), color: diffColor(word.difficulty), textTransform: 'capitalize' }}>{word.difficulty || 'Easy'}</span>
            <span style={{ padding: '6px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', background: colors.bg, color: colors.textSecondary, textTransform: 'capitalize' }}>{word.category || 'Academic'}</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (favoriteWords.length === 0) {
    return (
      <div style={{ 
        background: colors.bg, 
        minHeight: '100vh', 
        width: '100%', 
        padding: '20px', 
        boxSizing: 'border-box',
        opacity: pageLoaded ? 1 : 0,
        transform: pageLoaded ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
      }}>
        <div style={{ width: '180px', height: '180px', margin: '40px auto 16px', display: 'block' }}>
          <img src="src/image/sadheart.jpg" alt="No favorites yet" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: '600', color: colors.textPrimary, textAlign: 'center', margin: '0 auto 8px', maxWidth: '400px' }}>No favorite words yet</h2>
        <p style={{ fontSize: '15px', color: colors.textSecondary, textAlign: 'center', margin: '0 auto 24px', maxWidth: '400px' }}>Star words in the Word Library to see them here</p>
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => window.location.href = '/dashboard?tab=word-library'} style={{ padding: '10px 24px', background: colors.accent, color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}>Browse Word Library</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '24px', 
      fontFamily,
      opacity: pageLoaded ? 1 : 0,
      transform: pageLoaded ? 'translateY(0)' : 'translateY(20px)',
      transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: `1px solid ${colors.border}`, paddingBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '500', color: colors.textPrimary, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>My Favorite Words</h1>
          <p style={{ fontSize: '13px', color: colors.textSecondary, margin: 0 }}>{favoriteWords.length} {favoriteWords.length === 1 ? 'word' : 'words'} saved from Word Library</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '4px', background: colors.bg, padding: '4px', borderRadius: '8px', border: `1px solid ${colors.border}` }}>
            <button onClick={() => setViewMode('grid')} style={{ padding: '6px 12px', background: viewMode === 'grid' ? colors.surface : 'transparent', border: 'none', borderRadius: '6px', fontSize: '13px', color: viewMode === 'grid' ? colors.accent : colors.textSecondary, fontWeight: viewMode === 'grid' ? '500' : '400', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ fontSize: '14px' }}>⊞</span> Grid</button>
            <button onClick={() => setViewMode('list')} style={{ padding: '6px 12px', background: viewMode === 'list' ? colors.surface : 'transparent', border: 'none', borderRadius: '6px', fontSize: '13px', color: viewMode === 'list' ? colors.accent : colors.textSecondary, fontWeight: viewMode === 'list' ? '500' : '400', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ fontSize: '14px' }}>☰</span> List</button>
          </div>
          <div style={{ background: colors.bg, padding: '6px 14px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontSize: '13px', color: colors.textSecondary, display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: '#d4af37', fontSize: '12px' }}>⭐</span>{favoriteWords.length} words</div>
        </div>
      </div>

      {showWordDetails && selectedWord && (
        <WordDetailsModal word={selectedWord} onClose={() => { setShowWordDetails(false); setSelectedWord(null); }} />
      )}

      <div style={{ display: viewMode === 'grid' ? 'grid' : 'flex', gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(320px, 1fr))' : 'none', flexDirection: viewMode === 'list' ? 'column' : 'none', gap: viewMode === 'grid' ? '20px' : '12px' }}>
        {favoriteWords.map((word) => (
          <div key={word.id} onClick={() => { setSelectedWord(word); setShowWordDetails(true); }} style={{ background: colors.surface, borderRadius: '10px', border: `1px solid ${colors.border}`, padding: viewMode === 'grid' ? '20px' : '16px 20px', position: 'relative', transition: 'all 0.2s ease', cursor: 'pointer', display: viewMode === 'list' ? 'flex' : 'block', alignItems: viewMode === 'list' ? 'flex-start' : 'stretch', gap: viewMode === 'list' ? '16px' : '0' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.accent; e.currentTarget.style.backgroundColor = `${colors.accent}10`; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.backgroundColor = colors.surface; }}>
            <button onClick={(e) => { e.stopPropagation(); removeFavorite(word.id); }} style={{ position: viewMode === 'grid' ? 'absolute' : 'relative', top: viewMode === 'grid' ? '16px' : 'auto', right: viewMode === 'grid' ? '16px' : 'auto', order: viewMode === 'list' ? 3 : 'auto', marginLeft: viewMode === 'list' ? 'auto' : '0', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#d4af37', zIndex: 10, padding: '4px' }}>★</button>

            <div style={{ flex: viewMode === 'list' ? '1' : 'none', paddingRight: viewMode === 'grid' ? '24px' : '0', marginBottom: viewMode === 'grid' ? '12px' : '0', width: '100%' }}>
              <div style={{ marginBottom: '8px' }}>
                <h3 style={{ fontSize: viewMode === 'grid' ? '24px' : '22px', fontWeight: '500', color: colors.textPrimary, margin: '0 0 2px 0', lineHeight: 1.2 }}>{word.word}</h3>
                <div style={{ fontSize: viewMode === 'grid' ? '14px' : '13px', color: colors.textSecondary, fontStyle: 'italic', marginBottom: '4px' }}>{word.pronunciation}</div>
                <span style={{ fontSize: '12px', padding: '2px 10px', background: colors.border, borderRadius: '12px', color: colors.textSecondary, display: 'inline-block' }}>{word.partOfSpeech || 'verb'}</span>
              </div>
              <p style={{ fontSize: viewMode === 'grid' ? '14px' : '14px', color: colors.textPrimary, lineHeight: '1.5', marginBottom: '12px' }}>{word.definition.length > 100 ? `${word.definition.substring(0, 100)}...` : word.definition}</p>
              {word.examples && word.examples[0] && (
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ fontSize: '13px', color: colors.textSecondary, margin: '0', fontStyle: 'italic', position: 'relative', paddingLeft: '12px', borderLeft: `2px solid ${diffColor(word.difficulty)}` }}>"{word.examples[0].length > 60 ? `${word.examples[0].substring(0, 60)}...` : word.examples[0]}"</p>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginTop: '8px', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '500', background: diffBg(word.difficulty), color: diffColor(word.difficulty) }}>{word.difficulty || 'Easy'}</span>
                <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '400', background: colors.border, color: colors.textSecondary }}>{word.category || 'Academic'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {favoriteWords.length > 0 && (
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: colors.textSecondary }}>
          <span>📚 From Word Library • {favoriteWords.length} favorites</span>
          <span>⭐ Click star to remove • Click word for details</span>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;