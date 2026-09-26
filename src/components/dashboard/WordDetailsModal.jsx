// src/components/dashboard/WordDetailsModal.jsx
//
// Student-facing word details modal.
// Antonyms removed. Synonyms section restored.

import React from 'react';
import ReactDOM from 'react-dom';
import { cefrColor, cefrBg, cefrMeta } from './dashboardStyles';

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
  danger: '#E76F51',
};

const FONT_DISPLAY = "'Fredoka', sans-serif";
const FONT_BODY = "'Nunito', sans-serif";

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
            transition: 'all 0.2s ease',
            fontWeight: '700',
            fontFamily: FONT_DISPLAY,
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

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '24px',
            paddingRight: '40px',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '36px',
                fontWeight: '800',
                color: palette.deepNavy,
                margin: '0 0 8px 0',
                fontFamily: FONT_DISPLAY,
                letterSpacing: '-0.02em',
              }}
            >
              {word.word}
            </h2>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  fontSize: '16px',
                  color: palette.bodyText,
                  fontFamily: FONT_BODY,
                  fontWeight: 600,
                }}
              >
                {word.pronunciation}
              </span>
              <span
                style={{
                  padding: '4px 12px',
                  background: palette.cream,
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: palette.deepNavy,
                  fontWeight: '700',
                  fontFamily: FONT_DISPLAY,
                  border: `1px solid ${palette.border}`,
                }}
              >
                {word.partOfSpeech || 'noun'}
              </span>
              <span
                style={{
                  padding: '4px 12px',
                  background: cefrBg(word.cefrLevel),
                  color: cefrColor(word.cefrLevel),
                  borderRadius: '8px',
                  fontSize: '14px',
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
              fontSize: '32px',
              color: isFavorite ? '#FFD700' : '#94a3b8',
              transition: 'all 0.2s ease',
              padding: '8px',
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {isFavorite ? '★' : '☆'}
          </button>
        </div>

        <div
          style={{
            background: palette.cream,
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '28px',
            border: `2px solid ${palette.border}`,
          }}
        >
          <h3
            style={{
              fontSize: '16px',
              fontWeight: '800',
              color: palette.warmOrange,
              margin: '0 0 8px 0',
              fontFamily: FONT_DISPLAY,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Definition
          </h3>
          <p
            style={{
              fontSize: '18px',
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

        <div style={{ marginBottom: '28px' }}>
          <h3
            style={{
              fontSize: '16px',
              fontWeight: '800',
              color: palette.bodyText,
              margin: '0 0 16px 0',
              fontFamily: FONT_DISPLAY,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Example Sentences
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {word.examples?.map((example, idx) => (
              <div
                key={idx}
                style={{
                  background: palette.white,
                  padding: '16px 20px',
                  borderRadius: '12px',
                  border: `2px solid ${palette.border}`,
                  fontStyle: 'italic',
                  fontSize: '15px',
                  color: palette.bodyText,
                  lineHeight: '1.6',
                  fontFamily: FONT_BODY,
                  fontWeight: 600,
                  position: 'relative',
                  paddingLeft: '32px',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '16px',
                    color: palette.warmOrange,
                    fontSize: '14px',
                    fontWeight: '800',
                    fontFamily: FONT_DISPLAY,
                  }}
                >
                  #{idx + 1}
                </span>
                {example}
              </div>
            ))}
          </div>
        </div>

        {/* SYNONYMS SECTION (RESTORED) */}
        {word.synonyms && word.synonyms.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <div
              style={{
                background: `${palette.softGreen}18`,
                borderRadius: '16px',
                padding: '20px',
                border: `2px solid ${palette.softGreen}50`,
              }}
            >
              <h3
                style={{
                  fontSize: '15px',
                  fontWeight: '800',
                  color: palette.softGreen,
                  margin: '0 0 12px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: FONT_DISPLAY,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                <span style={{ fontSize: '18px' }}>↗️</span>
                Synonyms
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {word.synonyms.map((syn, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '6px 14px',
                      background: palette.white,
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      color: palette.softGreen,
                      border: `1px solid ${palette.softGreen}50`,
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

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '20px',
            borderTop: `2px solid ${palette.border}`,
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <span
              style={{
                padding: '6px 16px',
                borderRadius: '8px',
                fontSize: '13px',
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
                padding: '6px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '700',
                background: palette.cream,
                color: palette.bodyText,
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
              fontSize: '13px',
              color: palette.bodyText,
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