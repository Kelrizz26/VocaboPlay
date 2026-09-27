// src/components/dashboard/FavoritesPage.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../../pages/firebase';
import { doc, getDoc, updateDoc, arrayRemove, collection, getDocs } from 'firebase/firestore';
import { colors, fontFamily } from './dashboardStyles';

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

// ===== DUOTONE SVG ICONS =====
const Icon = ({ name, size = 20, color = palette.bodyTextSoft, secondaryColor = `${palette.bodyTextSoft}55` }) => {
  const icons = {
    star: (
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    ),
    starFilled: (
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={color}/>
    ),
    close: (
      <path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
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
    book: (
      <>
        <path d="M4 4h11a3 3 0 013 3v13H7a3 3 0 00-3 3V4z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M4 4v16" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      </>
    ),
    heart: (
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    ),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', flexShrink: 0 }}>
      {icons[name] || icons.star}
    </svg>
  );
};

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
    return palette.bodyTextSoft;
  };

  const diffBg = (d) => {
    if (d === 'Easy' || d === 'beginner') return `${palette.softGreen}15`;
    if (d === 'Medium' || d === 'intermediate') return `${palette.warmOrange}15`;
    if (d === 'Hard' || d === 'advanced') return `${palette.coral}15`;
    return palette.creamSoft;
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

  // ===== MODAL =====
  const WordDetailsModal = ({ word, onClose }) => (
    <div 
      className="fav-modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(42, 40, 69, 0.55)',
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
          borderRadius: '22px',
          padding: '36px',
          maxWidth: '680px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 50px rgba(42, 40, 69, 0.25)',
          border: `1.5px solid ${palette.border}`,
          position: 'relative',
        }} 
        onClick={(e) => e.stopPropagation()}
      >

        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: palette.creamSoft,
            border: `1.5px solid ${palette.border}`,
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.18s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = palette.coral;
            e.currentTarget.style.borderColor = palette.coral;
            const svg = e.currentTarget.querySelector('svg path');
            if (svg) svg.setAttribute('stroke', palette.white);
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = palette.creamSoft;
            e.currentTarget.style.borderColor = palette.border;
            const svg = e.currentTarget.querySelector('svg path');
            if (svg) svg.setAttribute('stroke', palette.bodyTextSoft);
          }}
        >
          <Icon name="close" size={16} color={palette.bodyTextSoft} />
        </button>

        <div className="fav-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px', paddingRight: '40px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ flex: '1 1 auto', minWidth: 0 }}>
            <h2 style={{ fontSize: '34px', fontWeight: '800', color: palette.deepNavy, margin: '0 0 8px 0', fontFamily: FONT_DISPLAY, letterSpacing: '-0.02em', wordBreak: 'break-word' }}>{word.word}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '15px', color: palette.bodyTextSoft, fontFamily: FONT_BODY, fontWeight: 600, fontStyle: 'italic' }}>{word.pronunciation}</span>
              <span style={{ padding: '4px 11px', background: palette.creamSoft, borderRadius: '7px', fontSize: '12px', color: palette.bodyText, fontFamily: FONT_DISPLAY, fontWeight: 700, border: `1px solid ${palette.border}` }}>{word.partOfSpeech || 'verb'}</span>
            </div>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); removeFavorite(word.id); }} 
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.15s ease',
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Icon name="starFilled" size={28} color="#d4af37" />
          </button>
        </div>

        <div style={{ background: palette.creamSoft, borderRadius: '14px', padding: '20px 22px', marginBottom: '22px', border: `1.5px solid ${palette.border}`, borderLeft: `4px solid ${palette.warmOrange}` }}>
          <h3 style={{ fontSize: '12px', fontWeight: '800', color: palette.warmOrange, margin: '0 0 8px 0', textTransform: 'uppercase', fontFamily: FONT_DISPLAY, letterSpacing: '0.08em' }}>Definition</h3>
          <p style={{ fontSize: '17px', lineHeight: '1.6', color: palette.deepNavy, margin: 0, fontFamily: FONT_BODY, fontWeight: 600 }}>{word.definition}</p>
        </div>

        <div style={{ marginBottom: '22px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: '800', color: palette.bodyTextSoft, margin: '0 0 14px 0', textTransform: 'uppercase', fontFamily: FONT_DISPLAY, letterSpacing: '0.08em' }}>Example Sentences</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {word.examples?.map((example, idx) => (
              <div key={idx} style={{ background: palette.white, padding: '14px 18px', borderRadius: '12px', border: `1.5px solid ${palette.border}`, fontStyle: 'italic', fontSize: '14px', color: palette.bodyText, lineHeight: '1.55', fontFamily: FONT_BODY, fontWeight: 600, position: 'relative', paddingLeft: '38px' }}>
                <span style={{ position: 'absolute', left: '14px', top: '14px', color: palette.warmOrange, fontSize: '12px', fontWeight: '800', fontFamily: FONT_DISPLAY, background: palette.creamSoft, width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{idx + 1}</span>
                {example}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '18px', borderTop: `1.5px solid ${palette.borderSoft}`, gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ padding: '5px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: '800', background: diffBg(word.difficulty), color: diffColor(word.difficulty), textTransform: 'capitalize', fontFamily: FONT_DISPLAY }}>{word.difficulty || 'Easy'}</span>
            <span style={{ padding: '5px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: '700', background: palette.creamSoft, color: palette.bodyTextSoft, textTransform: 'capitalize', fontFamily: FONT_DISPLAY, border: `1px solid ${palette.border}` }}>{word.category || 'Academic'}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // ===== EMPTY STATE =====
  if (favoriteWords.length === 0) {
    return (
      <div style={{ 
        background: 'transparent', 
        minHeight: '400px', 
        width: '100%', 
        padding: '20px', 
        boxSizing: 'border-box',
        opacity: pageLoaded ? 1 : 0,
        transform: pageLoaded ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
      }}>
        <div style={{
          maxWidth: '440px',
          margin: '40px auto',
          textAlign: 'center',
          padding: '60px 40px',
          background: palette.white,
          borderRadius: '20px',
          border: `1.5px solid ${palette.border}`,
          boxShadow: `0 2px 0 ${palette.border}`,
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: palette.creamSoft,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            border: `1.5px solid ${palette.border}`,
          }}>
            <Icon name="heart" size={36} color={palette.coral} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: palette.deepNavy, margin: '0 0 6px', fontFamily: FONT_DISPLAY }}>No favorite words yet</h2>
          <p style={{ fontSize: '13px', color: palette.bodyTextSoft, margin: '0 0 22px', fontFamily: FONT_BODY, fontWeight: 600, lineHeight: 1.55 }}>Star words in the Word Library to save them here</p>
          <button 
            onClick={() => window.location.href = '/dashboard?tab=word-library'} 
            style={{ 
              padding: '11px 26px', 
              background: palette.warmOrange, 
              color: 'white', 
              border: 'none', 
              borderRadius: '10px', 
              fontSize: '13px', 
              fontWeight: '800', 
              cursor: 'pointer', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              fontFamily: FONT_DISPLAY, 
              boxShadow: `0 3px 0 ${palette.warmOrangeShadow}`,
              transition: 'transform 0.1s ease, box-shadow 0.1s ease',
            }}
            onMouseDown={e => { e.currentTarget.style.transform = 'translateY(3px)'; e.currentTarget.style.boxShadow = 'none'; }}
            onMouseUp={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 3px 0 ${palette.warmOrangeShadow}`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 3px 0 ${palette.warmOrangeShadow}`; }}
          >
            <Icon name="book" size={14} color={palette.white} />
            Browse Word Library
          </button>
        </div>
      </div>
    );
  }

  // ===== MAIN VIEW =====
  return (
    <div 
      className="fav-container"
      style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0', 
        fontFamily: FONT_BODY,
        opacity: pageLoaded ? 1 : 0,
        transform: pageLoaded ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .fav-header { flex-direction: column !important; align-items: flex-start !important; gap: 16px; }
          .fav-header-controls { width: 100%; justify-content: space-between; }
        }
        @media (max-width: 640px) {
          .fav-modal-content { padding: 24px 20px !important; border-radius: 20px !important; }
          .fav-modal-header { padding-right: 32px !important; }
        }
        @media (max-width: 400px) {
          .fav-modal-overlay { padding: 10px !important; }
          .fav-modal-content { padding: 20px 16px !important; }
        }
        @media (max-width: 380px) {
          .fav-grid { grid-template-columns: 1fr !important; }
        }
        .fav-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .fav-card:hover {
          transform: translateY(-3px);
          border-color: ${palette.warmOrange} !important;
          box-shadow: 0 8px 22px ${palette.shadowMd} !important;
        }
      `}</style>

      {/* ===== HEADER ===== */}
      <div 
        className="fav-header"
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-end', 
          marginBottom: '20px', 
          borderBottom: `1.5px solid ${palette.border}`, 
          paddingBottom: '16px', 
          flexWrap: 'wrap', 
          gap: '12px' 
        }}
      >
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: palette.deepNavy, margin: '0 0 4px 0', fontFamily: FONT_DISPLAY, letterSpacing: '-0.5px' }}>My Favorite Words</h1>
          <p style={{ fontSize: '13px', color: palette.bodyTextSoft, margin: 0, fontFamily: FONT_BODY, fontWeight: 600 }}>
            {favoriteWords.length} {favoriteWords.length === 1 ? 'word' : 'words'} saved from Word Library
          </p>
        </div>

        <div className="fav-header-controls" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '2px', background: palette.creamSoft, padding: '3px', borderRadius: '8px', border: `1.5px solid ${palette.border}` }}>
            <button 
              onClick={() => setViewMode('grid')} 
              style={{ 
                padding: '6px 12px', 
                background: viewMode === 'grid' ? palette.white : 'transparent', 
                border: 'none', 
                borderRadius: '6px', 
                fontSize: '12px', 
                color: viewMode === 'grid' ? palette.warmOrange : palette.bodyTextSoft, 
                fontWeight: viewMode === 'grid' ? '800' : '700', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                fontFamily: FONT_DISPLAY,
                transition: 'all 0.18s ease',
              }}
            >
              <Icon name="grid" size={12} color={viewMode === 'grid' ? palette.warmOrange : palette.bodyTextSoft} />
              Grid
            </button>
            <button 
              onClick={() => setViewMode('list')} 
              style={{ 
                padding: '6px 12px', 
                background: viewMode === 'list' ? palette.white : 'transparent', 
                border: 'none', 
                borderRadius: '6px', 
                fontSize: '12px', 
                color: viewMode === 'list' ? palette.warmOrange : palette.bodyTextSoft, 
                fontWeight: viewMode === 'list' ? '800' : '700', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                fontFamily: FONT_DISPLAY,
                transition: 'all 0.18s ease',
              }}
            >
              <Icon name="list" size={12} color={viewMode === 'list' ? palette.warmOrange : palette.bodyTextSoft} />
              List
            </button>
          </div>
          <div style={{ background: palette.creamSoft, padding: '6px 14px', borderRadius: '8px', border: `1.5px solid ${palette.border}`, fontSize: '12px', color: palette.deepNavy, display: 'flex', alignItems: 'center', gap: '6px', fontFamily: FONT_DISPLAY, fontWeight: 700 }}>
            <Icon name="starFilled" size={12} color="#d4af37" />
            {favoriteWords.length}
          </div>
        </div>
      </div>

      {showWordDetails && selectedWord && (
        <WordDetailsModal word={selectedWord} onClose={() => { setShowWordDetails(false); setSelectedWord(null); }} />
      )}

      {/* ===== WORD GRID / LIST ===== */}
      <div 
        className="fav-grid"
        style={{ 
          display: viewMode === 'grid' ? 'grid' : 'flex', 
          gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : 'none', 
          flexDirection: viewMode === 'list' ? 'column' : 'none', 
          gap: viewMode === 'grid' ? '16px' : '10px' 
        }}
      >
        {favoriteWords.map((word) => (
          <div 
            key={word.id} 
            className="fav-card"
            onClick={() => { setSelectedWord(word); setShowWordDetails(true); }} 
            style={{ 
              background: palette.white, 
              borderRadius: '14px', 
              border: `1.5px solid ${palette.border}`, 
              padding: viewMode === 'grid' ? '20px' : '16px 20px', 
              position: 'relative', 
              cursor: 'pointer', 
              display: viewMode === 'list' ? 'flex' : 'block', 
              alignItems: viewMode === 'list' ? 'flex-start' : 'stretch', 
              gap: viewMode === 'list' ? '16px' : '0', 
              boxShadow: `0 2px 0 ${palette.border}`,
            }} 
          >
            <button 
              onClick={(e) => { e.stopPropagation(); removeFavorite(word.id); }} 
              style={{ 
                position: viewMode === 'grid' ? 'absolute' : 'relative', 
                top: viewMode === 'grid' ? '14px' : 'auto', 
                right: viewMode === 'grid' ? '14px' : 'auto', 
                order: viewMode === 'list' ? 3 : 'auto', 
                marginLeft: viewMode === 'list' ? 'auto' : '0', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer', 
                zIndex: 10, 
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.15s ease',
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.15)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Icon name="starFilled" size={18} color="#d4af37" />
            </button>

            <div style={{ flex: viewMode === 'list' ? '1' : 'none', paddingRight: viewMode === 'grid' ? '24px' : '0', marginBottom: viewMode === 'grid' ? '12px' : '0', width: '100%' }}>
              <div style={{ marginBottom: '8px' }}>
                <h3 style={{ fontSize: viewMode === 'grid' ? '20px' : '18px', fontWeight: '800', color: palette.deepNavy, margin: '0 0 3px 0', lineHeight: 1.2, fontFamily: FONT_DISPLAY }}>{word.word}</h3>
                <div style={{ fontSize: '12px', color: palette.bodyTextSoft, fontStyle: 'italic', marginBottom: '6px', fontFamily: FONT_BODY, fontWeight: 600 }}>{word.pronunciation}</div>
                <span style={{ fontSize: '10px', padding: '2px 9px', background: palette.creamSoft, borderRadius: '10px', color: palette.bodyTextSoft, display: 'inline-block', fontFamily: FONT_DISPLAY, fontWeight: 700, border: `1px solid ${palette.border}` }}>{word.partOfSpeech || 'verb'}</span>
              </div>
              <p style={{ fontSize: '13px', color: palette.bodyText, lineHeight: '1.55', marginBottom: '12px', fontFamily: FONT_BODY, fontWeight: 600 }}>{word.definition.length > 100 ? `${word.definition.substring(0, 100)}...` : word.definition}</p>
              {word.examples && word.examples[0] && (
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ fontSize: '12px', color: palette.bodyText, margin: '0', fontStyle: 'italic', position: 'relative', paddingLeft: '12px', borderLeft: `3px solid ${diffColor(word.difficulty)}`, fontFamily: FONT_BODY, fontWeight: 600 }}>"{word.examples[0].length > 60 ? `${word.examples[0].substring(0, 60)}...` : word.examples[0]}"</p>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginTop: '10px', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ padding: '4px 10px', borderRadius: '10px', fontSize: '10px', fontWeight: '800', background: diffBg(word.difficulty), color: diffColor(word.difficulty), fontFamily: FONT_DISPLAY, textTransform: 'capitalize' }}>{word.difficulty || 'Easy'}</span>
                <span style={{ padding: '4px 10px', borderRadius: '10px', fontSize: '10px', fontWeight: '700', background: palette.creamSoft, color: palette.bodyTextSoft, fontFamily: FONT_DISPLAY, border: `1px solid ${palette.border}`, textTransform: 'capitalize' }}>{word.category || 'Academic'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ===== FOOTER ===== */}
      {favoriteWords.length > 0 && (
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: `1.5px solid ${palette.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: palette.bodyTextSoft, fontFamily: FONT_BODY, fontWeight: 600, flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Icon name="book" size={12} color={palette.bodyTextSoft} />
            {favoriteWords.length} favorites saved
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Icon name="starFilled" size={11} color="#d4af37" />
            Click star to remove
          </span>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;