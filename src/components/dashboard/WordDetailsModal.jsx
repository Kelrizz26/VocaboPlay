// src/components/dashboard/WordDetailsModal.jsx

import React from 'react';
import ReactDOM from 'react-dom';
import { diffColor, diffBg } from './dashboardStyles';

const WordDetailsModal = ({ word, onClose, onToggleFavorite, isFavorite }) => {
  if (!word) return null;

  return ReactDOM.createPortal(
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
        background: '#ffffff',
        borderRadius: '24px',
        padding: '40px',
        maxWidth: '700px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: 'none',
        border: '1px solid #EEF0FB',
        position: 'relative',
      }} onClick={(e) => e.stopPropagation()}>

        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#F8FAFC',
            border: 'none',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            fontSize: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#e2e8f0';
            e.currentTarget.style.color = '#1E293B';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = '#F8FAFC';
            e.currentTarget.style.color = '#64748b';
          }}
        >
          ✕
        </button>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px',
          paddingRight: '40px',
        }}>
          <div>
            <h2 style={{
              fontSize: '36px',
              fontWeight: '700',
              color: '#1E293B',
              margin: '0 0 8px 0',
              fontFamily: "'Poppins', 'Poppins', sans-serif",
              letterSpacing: '-0.02em',
            }}>
              {word.word}
            </h2>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}>
              <span style={{
                fontSize: '16px',
                color: '#64748b',
                fontFamily: "'Poppins', 'Poppins', sans-serif",
              }}>
                {word.pronunciation}
              </span>
              <span style={{
                padding: '4px 12px',
                background: '#F8FAFC',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#475569',
                fontWeight: '500',
              }}>
                {word.partOfSpeech || 'verb'}
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
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {isFavorite ? '★' : '☆'}
          </button>
        </div>

        <div style={{
          background: '#EEF0FB',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '28px',
          border: '1px solid #EEF0FB',
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#5C6AC4',
            margin: '0 0 8px 0',
            fontFamily: "'Poppins', 'Poppins', sans-serif",
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Definition
          </h3>
          <p style={{
            fontSize: '18px',
            lineHeight: '1.6',
            color: '#1E293B',
            margin: '0',
            fontFamily: "'Poppins', 'Poppins', sans-serif",
            fontWeight: '500',
          }}>
            {word.definition}
          </p>
        </div>

        <div style={{ marginBottom: '28px' }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#475569',
            margin: '0 0 16px 0',
            fontFamily: "'Poppins', 'Poppins', sans-serif",
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Example Sentences
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {word.examples?.map((example, idx) => (
              <div key={idx} style={{
                background: '#ffffff',
                padding: '16px 20px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                fontStyle: 'italic',
                fontSize: '15px',
                color: '#334155',
                lineHeight: '1.6',
                fontFamily: "'Poppins', 'Poppins', sans-serif",
                position: 'relative',
                paddingLeft: '32px',
              }}>
                <span style={{
                  position: 'absolute',
                  left: '12px',
                  top: '16px',
                  color: '#5C6AC4',
                  fontSize: '14px',
                  fontWeight: '600',
                }}>#{idx + 1}</span>
                {example}
              </div>
            ))}
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '28px',
        }}>
          <div style={{
            background: '#f0fdf4',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #bbf7d0',
          }}>
            <h3 style={{
              fontSize: '15px',
              fontWeight: '600',
              color: '#166534',
              margin: '0 0 12px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{ fontSize: '18px' }}>↗️</span>
              Synonyms
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {word.synonyms?.length > 0 ? word.synonyms.map((syn, idx) => (
                <span key={idx} style={{
                  padding: '6px 14px',
                  background: '#ffffff',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#166534',
                  border: '1px solid #bbf7d0',
                }}>
                  {syn}
                </span>
              )) : (
                <span style={{ color: '#64748b', fontSize: '14px' }}>No synonyms available</span>
              )}
            </div>
          </div>

          <div style={{
            background: '#fef2f2',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #fecaca',
          }}>
            <h3 style={{
              fontSize: '15px',
              fontWeight: '600',
              color: '#991b1b',
              margin: '0 0 12px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{ fontSize: '18px' }}>↘️</span>
              Antonyms
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {word.antonyms?.length > 0 ? word.antonyms.map((ant, idx) => (
                <span key={idx} style={{
                  padding: '6px 14px',
                  background: '#ffffff',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#991b1b',
                  border: '1px solid #fecaca',
                }}>
                  {ant}
                </span>
              )) : (
                <span style={{ color: '#64748b', fontSize: '14px' }}>No antonyms available</span>
              )}
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '20px',
          borderTop: '1px solid #e2e8f0',
        }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span style={{
              padding: '6px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              background: diffBg(word.difficulty),
              color: diffColor(word.difficulty),
              textTransform: 'capitalize',
            }}>
              {word.difficulty || 'Easy'}
            </span>
            <span style={{
              padding: '6px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '500',
              background: '#F8FAFC',
              color: '#475569',
              textTransform: 'capitalize',
            }}>
              {word.category || 'Academic'}
            </span>
          </div>
          <span style={{
            fontSize: '13px',
            color: '#94a3b8',
            fontStyle: 'italic',
          }}>
            {word.teacherNote}
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default WordDetailsModal;