// src/components/dashboard/FavoritesPage.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../../pages/firebase';
import { doc, getDoc, updateDoc, arrayRemove, collection, getDocs } from 'firebase/firestore';
import { colors, fontFamily } from './dashboardStyles';

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
    if (d === 'Easy' || d === 'beginner') return palette.softGreen;
    if (d === 'Medium' || d === 'intermediate') return palette.warmOrange;
    if (d === 'Hard' || d === 'advanced') return palette.coral;
    return palette.bodyText;
  };

  const diffBg = (d) => {
    if (d === 'Easy' || d === 'beginner') return `${palette.softGreen}18`;
    if (d === 'Medium' || d === 'intermediate') return `${palette.warmOrange}18`;
    if (d === 'Hard' || d === 'advanced') return `${palette.coral}18`;
    return palette.cream;
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
    <div 
      className="fav-modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(45, 42, 94, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        padding: '20px',
      }} 
      onClick={onClose}
    >
      <div 
        className="fav-modal-content"
        style={{
          background: palette.white,
          borderRadius: '24px',
          padding: '40px',
          maxWidth: '700px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(45, 42, 94, 0.3)',
          border: `2px solid ${palette.border}`,
          position: 'relative',
        }} 
        onClick={(e) => e.stopPropagation()}
      >

        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: palette.cream,
            border: `2px solid ${palette.border}`,
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            fontSize: '18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: palette.bodyText,
            fontWeight: '700',
            fontFamily: FONT_DISPLAY,
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = palette.coral;
            e.currentTarget.style.color = palette.white;
            e.currentTarget.style.borderColor = palette.coral;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = palette.cream;
            e.currentTarget.style.color = palette.bodyText;
            e.currentTarget.style.borderColor = palette.border;
          }}
        >
          ✕
        </button>

        <div className="fav-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', paddingRight: '40px' }}>
          <div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: '800', color: palette.deepNavy, margin: '0 0 8px 0', fontFamily: FONT_DISPLAY, letterSpacing: '-0.02em' }}>{word.word}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '16px', color: palette.bodyText, fontFamily: FONT_BODY, fontWeight: 600 }}>{word.pronunciation}</span>
              <span style={{ padding: '4px 12px', background: palette.cream, borderRadius: '8px', fontSize: '14px', color: palette.deepNavy, fontFamily: FONT_DISPLAY, fontWeight: 700, border: `1px solid ${palette.border}` }}>{word.partOfSpeech || 'verb'}</span>
            </div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); removeFavorite(word.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '32px', color: '#FFD700', padding: '8px' }}>★</button>
        </div>

        <div style={{ background: palette.cream, borderRadius: '16px', padding: '24px', marginBottom: '28px', border: `2px solid ${palette.border}` }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: palette.warmOrange, margin: '0 0 8px 0', textTransform: 'uppercase', fontFamily: FONT_DISPLAY, letterSpacing: '0.5px' }}>Definition</h3>
          <p style={{ fontSize: '18px', lineHeight: '1.6', color: palette.deepNavy, margin: 0, fontFamily: FONT_BODY, fontWeight: 600 }}>{word.definition}</p>
        </div>

        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: palette.bodyText, margin: '0 0 16px 0', textTransform: 'uppercase', fontFamily: FONT_DISPLAY, letterSpacing: '0.5px' }}>Example Sentences</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {word.examples?.map((example, idx) => (
              <div key={idx} style={{ background: palette.white, padding: '16px 20px', borderRadius: '12px', border: `2px solid ${palette.border}`, fontStyle: 'italic', fontSize: '15px', color: palette.bodyText, lineHeight: '1.6', fontFamily: FONT_BODY, fontWeight: 600, position: 'relative', paddingLeft: '32px' }}>
                <span style={{ position: 'absolute', left: '12px', top: '16px', color: palette.warmOrange, fontSize: '14px', fontWeight: '800', fontFamily: FONT_DISPLAY }}>#{idx + 1}</span>
                {example}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: `2px solid ${palette.border}` }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span style={{ padding: '6px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '800', background: diffBg(word.difficulty), color: diffColor(word.difficulty), textTransform: 'capitalize', fontFamily: FONT_DISPLAY }}>{word.difficulty || 'Easy'}</span>
            <span style={{ padding: '6px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', background: palette.cream, color: palette.bodyText, textTransform: 'capitalize', fontFamily: FONT_DISPLAY, border: `1px solid ${palette.border}` }}>{word.category || 'Academic'}</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (favoriteWords.length === 0) {
    return (
      <div style={{ 
        background: palette.cream, 
        minHeight: '100vh', 
        width: '100%', 
        padding: '20px', 
        boxSizing: 'border-box',
        opacity: pageLoaded ? 1 : 0,
        transform: pageLoaded ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
      }}>
        <div style={{ width: '180px', height: '180px', margin: '40px auto 16px', display: 'block' }}>
          <img src="/image/sadheart.jpg" alt="No favorites yet" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: palette.deepNavy, textAlign: 'center', margin: '0 auto 8px', maxWidth: '400px', fontFamily: FONT_DISPLAY }}>No favorite words yet</h2>
        <p style={{ fontSize: '15px', color: palette.bodyText, textAlign: 'center', margin: '0 auto 24px', maxWidth: '400px', fontFamily: FONT_BODY, fontWeight: 600 }}>Star words in the Word Library to see them here</p>
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => window.location.href = '/dashboard?tab=word-library'} style={{ padding: '12px 28px', background: palette.warmOrange, color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', margin: '0 auto', fontFamily: FONT_DISPLAY, boxShadow: `0 4px 0 ${palette.warmOrangeShadow}` }}>Browse Word Library</button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fav-container"
      style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '24px', 
        fontFamily: FONT_BODY,
        opacity: pageLoaded ? 1 : 0,
        transform: pageLoaded ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
      }}
    >
      {/* ===== LOCAL RESPONSIVE STYLES ===== */}
      <style>{`
        @media (max-width: 768px) {
          .fav-container {
            padding: 16px 12px !important;
          }
          .fav-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px;
          }
          .fav-header-controls {
            width: 100%;
            justify-content: space-between;
          }
        }
        @media (max-width: 640px) {
          .fav-modal-content {
            padding: 24px 20px !important;
            border-radius: 20px !important;
          }
          .fav-modal-header {
            padding-right: 32px !important;
          }
        }
        @media (max-width: 400px) {
          .fav-modal-overlay {
            padding: 10px !important;
          }
          .fav-modal-content {
            padding: 20px 16px !important;
          }
        }
        @media (max-width: 380px) {
          .fav-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div 
        className="fav-header"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: `2px solid ${palette.border}`, paddingBottom: '16px', flexWrap: 'wrap', gap: '12px' }}
      >
        <div>
          <h1 style={{ fontSize: 'clamp(20px, 3vw, 24px)', fontWeight: '800', color: palette.deepNavy, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: FONT_DISPLAY, letterSpacing: '-0.5px' }}>My Favorite Words</h1>
          <p style={{ fontSize: '13px', color: palette.bodyText, margin: 0, fontFamily: FONT_BODY, fontWeight: 600 }}>{favoriteWords.length} {favoriteWords.length === 1 ? 'word' : 'words'} saved from Word Library</p>
        </div>

        <div className="fav-header-controls" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '4px', background: palette.cream, padding: '4px', borderRadius: '8px', border: `2px solid ${palette.border}` }}>
            <button onClick={() => setViewMode('grid')} style={{ padding: '6px 12px', background: viewMode === 'grid' ? palette.white : 'transparent', border: 'none', borderRadius: '6px', fontSize: '13px', color: viewMode === 'grid' ? palette.warmOrange : palette.bodyText, fontWeight: viewMode === 'grid' ? '800' : '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: FONT_DISPLAY }}><span style={{ fontSize: '14px' }}>⊞</span> Grid</button>
            <button onClick={() => setViewMode('list')} style={{ padding: '6px 12px', background: viewMode === 'list' ? palette.white : 'transparent', border: 'none', borderRadius: '6px', fontSize: '13px', color: viewMode === 'list' ? palette.warmOrange : palette.bodyText, fontWeight: viewMode === 'list' ? '800' : '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: FONT_DISPLAY }}><span style={{ fontSize: '14px' }}>☰</span> List</button>
          </div>
          <div style={{ background: palette.cream, padding: '6px 14px', borderRadius: '8px', border: `2px solid ${palette.border}`, fontSize: '13px', color: palette.deepNavy, display: 'flex', alignItems: 'center', gap: '6px', fontFamily: FONT_DISPLAY, fontWeight: 700 }}><span style={{ color: '#d4af37', fontSize: '12px' }}>⭐</span>{favoriteWords.length} words</div>
        </div>
      </div>

      {showWordDetails && selectedWord && (
        <WordDetailsModal word={selectedWord} onClose={() => { setShowWordDetails(false); setSelectedWord(null); }} />
      )}

      <div 
        className="fav-grid"
        style={{ 
          display: viewMode === 'grid' ? 'grid' : 'flex', 
          gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : 'none', 
          flexDirection: viewMode === 'list' ? 'column' : 'none', 
          gap: viewMode === 'grid' ? '20px' : '12px' 
        }}
      >
        {favoriteWords.map((word) => (
          <div 
            key={word.id} 
            onClick={() => { setSelectedWord(word); setShowWordDetails(true); }} 
            style={{ 
              background: palette.white, 
              borderRadius: '16px', 
              border: `2px solid ${palette.border}`, 
              padding: viewMode === 'grid' ? '20px' : '16px 20px', 
              position: 'relative', 
              transition: 'all 0.2s ease', 
              cursor: 'pointer', 
              display: viewMode === 'list' ? 'flex' : 'block', 
              alignItems: viewMode === 'list' ? 'flex-start' : 'stretch', 
              gap: viewMode === 'list' ? '16px' : '0', 
              boxShadow: '0 2px 4px rgba(45, 42, 94, 0.04)' 
            }} 
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = palette.warmOrange; e.currentTarget.style.backgroundColor = `${palette.warmOrange}08`; e.currentTarget.style.boxShadow = `0 4px 12px rgba(244, 162, 97, 0.15)`; }} 
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = palette.border; e.currentTarget.style.backgroundColor = palette.white; e.currentTarget.style.boxShadow = '0 2px 4px rgba(45, 42, 94, 0.04)'; }}
          >
            <button 
              onClick={(e) => { e.stopPropagation(); removeFavorite(word.id); }} 
              style={{ 
                position: viewMode === 'grid' ? 'absolute' : 'relative', 
                top: viewMode === 'grid' ? '16px' : 'auto', 
                right: viewMode === 'grid' ? '16px' : 'auto', 
                order: viewMode === 'list' ? 3 : 'auto', 
                marginLeft: viewMode === 'list' ? 'auto' : '0', 
                background: 'none', 
                border: 'none', 
                fontSize: '20px', 
                cursor: 'pointer', 
                color: '#d4af37', 
                zIndex: 10, 
                padding: '4px' 
              }}
            >
              ★
            </button>

            <div style={{ flex: viewMode === 'list' ? '1' : 'none', paddingRight: viewMode === 'grid' ? '24px' : '0', marginBottom: viewMode === 'grid' ? '12px' : '0', width: '100%' }}>
              <div style={{ marginBottom: '8px' }}>
                <h3 style={{ fontSize: viewMode === 'grid' ? '22px' : '20px', fontWeight: '800', color: palette.deepNavy, margin: '0 0 2px 0', lineHeight: 1.2, fontFamily: FONT_DISPLAY }}>{word.word}</h3>
                <div style={{ fontSize: viewMode === 'grid' ? '14px' : '13px', color: palette.bodyText, fontStyle: 'italic', marginBottom: '4px', fontFamily: FONT_BODY, fontWeight: 600 }}>{word.pronunciation}</div>
                <span style={{ fontSize: '12px', padding: '2px 10px', background: palette.cream, borderRadius: '12px', color: palette.bodyText, display: 'inline-block', fontFamily: FONT_DISPLAY, fontWeight: 700, border: `1px solid ${palette.border}` }}>{word.partOfSpeech || 'verb'}</span>
              </div>
              <p style={{ fontSize: '14px', color: palette.bodyText, lineHeight: '1.5', marginBottom: '12px', fontFamily: FONT_BODY, fontWeight: 600 }}>{word.definition.length > 100 ? `${word.definition.substring(0, 100)}...` : word.definition}</p>
              {word.examples && word.examples[0] && (
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ fontSize: '13px', color: palette.bodyText, margin: '0', fontStyle: 'italic', position: 'relative', paddingLeft: '12px', borderLeft: `3px solid ${diffColor(word.difficulty)}`, fontFamily: FONT_BODY, fontWeight: 600 }}>"{word.examples[0].length > 60 ? `${word.examples[0].substring(0, 60)}...` : word.examples[0]}"</p>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginTop: '8px', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '800', background: diffBg(word.difficulty), color: diffColor(word.difficulty), fontFamily: FONT_DISPLAY }}>{word.difficulty || 'Easy'}</span>
                <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', background: palette.cream, color: palette.bodyText, fontFamily: FONT_DISPLAY, border: `1px solid ${palette.border}` }}>{word.category || 'Academic'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {favoriteWords.length > 0 && (
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: `2px solid ${palette.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: palette.bodyText, fontFamily: FONT_BODY, fontWeight: 600, flexWrap: 'wrap', gap: '8px' }}>
          <span>📚 From Word Library • {favoriteWords.length} favorites</span>
          <span>⭐ Click star to remove • Click word for details</span>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;