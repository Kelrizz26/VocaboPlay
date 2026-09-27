// src/components/dashboard/WordDetailsModal.jsx
//
// Student-facing word details modal.
// Antonyms removed. Synonyms section restored.

import React from 'react';
import ReactDOM from 'react-dom';
import { cefrColor, cefrBg, cefrMeta } from './dashboardStyles';

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
const Icon = ({ name, size = 20, color = palette.bodyTextSoft }) => {
  const icons = {
    close: <path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
    star: (
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    ),
    starFilled: (
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={color}/>
    ),
    arrow: (
      <path d="M7 17L17 7M17 7H8M17 7v9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    ),
    book: (
      <>
        <path d="M4 4h11a3 3 0 013 3v13H7a3 3 0 00-3 3V4z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M4 4v16" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      </>
    ),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', flexShrink: 0 }}>
      {icons[name] || icons.book}
    </svg>
  );
};

const WordDetailsModal = ({ word, onClose, onToggleFavorite, isFavorite }) => {
  if (!word) return null;

  const level = cefrMeta(word.cefrLevel);

  return ReactDOM.createPortal(
    <div
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
            color: palette.bodyTextSoft,
            transition: 'all 0.18s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = palette.coral;
            e.currentTarget.style.color = palette.white;
            e.currentTarget.style.borderColor = palette.coral;
            const svg = e.currentTarget.querySelector('svg path');
            if (svg) svg.setAttribute('stroke', palette.white);
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = palette.creamSoft;
            e.currentTarget.style.color = palette.bodyTextSoft;
            e.currentTarget.style.borderColor = palette.border;
            const svg = e.currentTarget.querySelector('svg path');
            if (svg) svg.setAttribute('stroke', palette.bodyTextSoft);
          }}
        >
          <Icon name="close" size={16} color={palette.bodyTextSoft} />
        </button>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '22px',
            paddingRight: '40px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ flex: '1 1 auto', minWidth: 0 }}>
            <h2
              style={{
                fontSize: '34px',
                fontWeight: '800',
                color: palette.deepNavy,
                margin: '0 0 8px 0',
                fontFamily: FONT_DISPLAY,
                letterSpacing: '-0.02em',
                wordBreak: 'break-word',
              }}
            >
              {word.word}
            </h2>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  fontSize: '15px',
                  color: palette.bodyTextSoft,
                  fontFamily: FONT_BODY,
                  fontWeight: 600,
                  fontStyle: 'italic',
                }}
              >
                {word.pronunciation}
              </span>
              <span
                style={{
                  padding: '4px 11px',
                  background: palette.creamSoft,
                  borderRadius: '7px',
                  fontSize: '12px',
                  color: palette.bodyText,
                  fontWeight: '700',
                  fontFamily: FONT_DISPLAY,
                  border: `1px solid ${palette.border}`,
                  textTransform: 'lowercase',
                }}
              >
                {word.partOfSpeech || 'noun'}
              </span>
              <span
                style={{
                  padding: '4px 11px',
                  background: cefrBg(word.cefrLevel),
                  color: cefrColor(word.cefrLevel),
                  borderRadius: '7px',
                  fontSize: '12px',
                  fontWeight: '800',
                  letterSpacing: '0.02em',
                  fontFamily: FONT_DISPLAY,
                }}
              >
                {level.id} · {level.label}
              </span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleFavorite) onToggleFavorite(word.id);
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.15s ease',
              alignSelf: 'flex-start',
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.15)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Icon 
              name={isFavorite ? 'starFilled' : 'star'} 
              size={28} 
              color={isFavorite ? '#d4af37' : palette.bodyTextSoft} 
            />
          </button>
        </div>

        {/* DEFINITION */}
        <div
          style={{
            background: palette.creamSoft,
            borderRadius: '14px',
            padding: '20px 22px',
            marginBottom: '22px',
            border: `1.5px solid ${palette.border}`,
            borderLeft: `4px solid ${palette.warmOrange}`,
          }}
        >
          <h3
            style={{
              fontSize: '12px',
              fontWeight: '800',
              color: palette.warmOrange,
              margin: '0 0 8px 0',
              fontFamily: FONT_DISPLAY,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Definition
          </h3>
          <p
            style={{
              fontSize: '17px',
              lineHeight: '1.6',
              color: palette.deepNavy,
              margin: '0',
              fontFamily: FONT_BODY,
              fontWeight: '600',
            }}
          >
            {word.definition}
          </p>
        </div>

        {/* EXAMPLES */}
        <div style={{ marginBottom: '22px' }}>
          <h3
            style={{
              fontSize: '12px',
              fontWeight: '800',
              color: palette.bodyTextSoft,
              margin: '0 0 14px 0',
              fontFamily: FONT_DISPLAY,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Example Sentences
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {word.examples?.map((example, idx) => (
              <div
                key={idx}
                style={{
                  background: palette.white,
                  padding: '14px 18px',
                  borderRadius: '12px',
                  border: `1.5px solid ${palette.border}`,
                  fontStyle: 'italic',
                  fontSize: '14px',
                  color: palette.bodyText,
                  lineHeight: '1.55',
                  fontFamily: FONT_BODY,
                  fontWeight: 600,
                  position: 'relative',
                  paddingLeft: '38px',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '14px',
                    color: palette.warmOrange,
                    fontSize: '12px',
                    fontWeight: '800',
                    fontFamily: FONT_DISPLAY,
                    background: palette.creamSoft,
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {idx + 1}
                </span>
                {example}
              </div>
            ))}
          </div>
        </div>

        {/* SYNONYMS */}
        {word.synonyms && word.synonyms.length > 0 && (
          <div style={{ marginBottom: '22px' }}>
            <div
              style={{
                background: `${palette.softGreen}10`,
                borderRadius: '14px',
                padding: '18px 20px',
                border: `1.5px solid ${palette.softGreen}30`,
              }}
            >
              <h3
                style={{
                  fontSize: '12px',
                  fontWeight: '800',
                  color: palette.softGreen,
                  margin: '0 0 12px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: FONT_DISPLAY,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                <Icon name="arrow" size={14} color={palette.softGreen} />
                Synonyms
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {word.synonyms.map((syn, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '5px 12px',
                      background: palette.white,
                      borderRadius: '7px',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: palette.softGreen,
                      border: `1.5px solid ${palette.softGreen}30`,
                      fontFamily: FONT_BODY,
                    }}
                  >
                    {syn}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '18px',
            borderTop: `1.5px solid ${palette.borderSoft}`,
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <span
              style={{
                padding: '5px 14px',
                borderRadius: '7px',
                fontSize: '12px',
                fontWeight: '800',
                background: cefrBg(word.cefrLevel),
                color: cefrColor(word.cefrLevel),
                letterSpacing: '0.02em',
                fontFamily: FONT_DISPLAY,
              }}
            >
              {level.id} · {level.label}
            </span>
            <span
              style={{
                padding: '5px 14px',
                borderRadius: '7px',
                fontSize: '12px',
                fontWeight: '700',
                background: palette.creamSoft,
                color: palette.bodyTextSoft,
                textTransform: 'capitalize',
                fontFamily: FONT_DISPLAY,
                border: `1px solid ${palette.border}`,
              }}
            >
              {word.category || 'Academic'}
            </span>
          </div>
          <span
            style={{
              fontSize: '12px',
              color: palette.bodyTextSoft,
              fontStyle: 'italic',
              fontFamily: FONT_BODY,
              fontWeight: 600,
            }}
          >
            {word.teacherNote}
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default WordDetailsModal;