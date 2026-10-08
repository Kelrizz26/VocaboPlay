// src/components/dashboard/Story-quest/GameUI.jsx
  // ✅ Dynamic vocabulary image in yellow box
  // ✅ VERTICAL STACK LAYOUT: image top center, story, question, choices
  // ✅ UPDATED: Larger image (400x300) + extended card layout
  // ✅ UPDATED: Supports level-specific images (e.g., garden-b1.png)
  // ✅ UPDATED: Supports scenario-based questions (scene.question)
  // ✅ ADDED: classNames para ma-target ng landscape CSS

  import React, { useState, useEffect } from 'react';

  const CenterVocabImage = ({ vocabulary, customImage, level }) => {
    const [srcIndex, setSrcIndex] = useState(0);

    const vocab = (vocabulary || '').toLowerCase().trim().replace(/\s+/g, '');
    const lvl = (level || '').toLowerCase().trim();

    const candidates = customImage
      ? [customImage]
      : vocab
        ? [
            ...(lvl ? [
              `/image/${vocab}-${lvl}.png`,
              `/image/${vocab}-${lvl}1.png`,
              `/image/${vocab}-${lvl}.jpg`,
            ] : []),
            `/image/${vocab}.png`,
            `/image/${vocab}1.png`,
            `/image/${vocab}.jpg`,
            `/image/${vocab}1.jpg`,
          ]
        : [];

    useEffect(() => { setSrcIndex(0); }, [vocab, customImage, lvl]);

    if (candidates.length === 0 || srcIndex >= candidates.length) {
      return (
        <div style={{
          fontSize: '120px',
          lineHeight: 1,
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))'
        }}>
          📖
        </div>
      );
    }

    return (
      <img
        key={candidates[srcIndex]}
        src={candidates[srcIndex]}
        alt={vocab}
        className="squiz-vocab-img"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          animation: 'imagePop 0.45s ease-out'
        }}
        onError={() => setSrcIndex(i => i + 1)}
      />
    );
  };

  const GameUI = ({
    scene, currentScene, currentLevel, allScenes,
    score, lives, maxLives, timer,
    isSpeaking, displayText, isTyping,
    selectedChoice, feedbackType, feedbackMessage, showFeedback,
    handleChoice, handleExit,
    points = 0, diamonds = 0,
  }) => {
    const displayHearts = () => {
      let s = '';
      for (let i = 0; i < maxLives; i++) s += i < lives ? '❤️' : '🖤';
      return s;
    };

    const isAdvancedLevel = ['B1', 'B2', 'C1', 'C2'].includes(currentLevel);
    const questionPrompt = scene.question
      ? scene.question
      : (isAdvancedLevel
          ? `In the scenario, what is the best meaning of "${scene.vocabulary}"?`
          : `What does "${scene.vocabulary}" mean?`);

    const renderStoryText = () => {
      const fullText = scene.text || '';
      const word = scene.vocabulary || '';

      if (isTyping) {
        return (
          <span>
            {displayText}
            <span style={{
              display: 'inline-block', width: '2px', height: '18px',
              background: '#7C3AED', animation: 'blink 0.8s step-end infinite',
              verticalAlign: 'middle', marginLeft: '2px'
            }} />
          </span>
        );
      }

      if (!word) return <span>{fullText}</span>;

      const regex = new RegExp(`\\b(${word})\\b`, 'gi');
      const parts = fullText.split(regex);

      return parts.map((part, i) => {
        if (part.toUpperCase() === word.toUpperCase()) {
          return (
            <span key={i} style={{
              background: 'linear-gradient(180deg, transparent 55%, #FDE68A 55%)',
              color: '#7C3AED', fontWeight: '900',
              padding: '0 4px', borderRadius: '3px',
            }}>
              {part}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      });
    };

    const choiceColors = [
      { bg: '#FEE2E2', border: '#FCA5A5', text: '#991B1B' },
      { bg: '#DBEAFE', border: '#93C5FD', text: '#1E40AF' },
      { bg: '#FEF3C7', border: '#FCD34D', text: '#92400E' },
      { bg: '#FCE7F3', border: '#F9A8D4', text: '#9F1239' },
    ];

    return (
      <div
        className="squiz-wrapper"
        style={{
          position: 'absolute', inset: 0,
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <style>{`
          @keyframes imagePop {
            0% { transform: scale(0.88); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.3); }
          }
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
        `}</style>

        {/* TOP BAR */}
        <div
          className="squiz-topbar"
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '8px 16px', background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(12px)', borderRadius: '14px',
            border: '2px solid #E5E7EB',
            pointerEvents: 'auto',
            maxWidth: '1000px',
            width: '100%',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontWeight: '800', color: '#7C3AED', fontSize: '14px', fontFamily: "'Fredoka', sans-serif" }}>📖 StoryQuest</span>
            <span style={{ padding: '3px 10px', borderRadius: '8px', background: '#EDE9FE', color: '#7C3AED', fontSize: '11px', fontWeight: '700' }}>{currentLevel}</span>
            <span style={{ padding: '3px 10px', borderRadius: '8px', background: '#F3F4F6', color: '#6B7280', fontSize: '11px', fontWeight: '600' }}>
              Chapter {currentScene + 1}/{allScenes.length}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px' }}>{displayHearts()}</span>
            
            <div style={{ fontSize: '12px', color: '#d4af37', fontWeight: '800', background: 'rgba(212, 175, 55, 0.15)', padding: '3px 10px', borderRadius: '8px', fontFamily: "'Fredoka', sans-serif", border: '1px solid rgba(212, 175, 55, 0.4)' }}>💰 {points}</div>
            <div style={{ fontSize: '12px', color: '#5DADE2', fontWeight: '800', background: 'rgba(93, 173, 226, 0.15)', padding: '3px 10px', borderRadius: '8px', fontFamily: "'Fredoka', sans-serif", border: '1px solid rgba(93, 173, 226, 0.4)' }}>💎 {diamonds}</div>

            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: timer <= 3 ? '#FEE2E2' : timer <= 5 ? '#FEF3C7' : '#F3F4F6',
              border: `2px solid ${timer <= 3 ? '#EF4444' : timer <= 5 ? '#F59E0B' : '#D1D5DB'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: timer <= 3 ? '#EF4444' : timer <= 5 ? '#F59E0B' : '#374151',
              fontSize: '13px', fontWeight: '800'
            }}>{timer}</div>
            <button onClick={handleExit} style={{
              padding: '5px 14px', borderRadius: '8px',
              border: '1.5px solid #FCA5A5', background: '#FEE2E2',
              color: '#DC2626', cursor: 'pointer', fontSize: '12px', fontWeight: '700'
            }}>✕ Exit</button>
          </div>
        </div>

        {/* QUIZ CARD — VERTICAL STACK LAYOUT (Extended) */}
        <div
          className="squiz-card"
          style={{
            background: '#FFFFFF', borderRadius: '18px', padding: '20px 28px 24px',
            border: '2px solid #E5E7EB', pointerEvents: 'auto',
            maxWidth: '1000px', width: '100%',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            marginBottom: '20px',
          }}
        >
          {/* Quiz header */}
          <div
            className="squiz-header"
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 14px',
              background: 'linear-gradient(90deg, #EDE9FE 0%, #FCE7F3 100%)',
              borderRadius: '10px'
            }}
          >
            <span style={{ fontSize: '15px', fontWeight: '800', color: '#7C3AED', fontFamily: "'Fredoka', sans-serif" }}>
              🎯 Story Quiz
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{ fontSize: '10px', background: '#FEF3C7', color: '#92400E', padding: '3px 8px', borderRadius: '6px', fontWeight: '700' }}>💰 Points: {points}</span>
              <span style={{ fontSize: '10px', background: '#DBEAFE', color: '#1E40AF', padding: '3px 8px', borderRadius: '6px', fontWeight: '700' }}>💎 Diamonds: {diamonds}</span>
            </div>
          </div>

          {/* ✅ 1. IMAGE — TOP, CENTERED, BIGGER */}
          <div
            className="squiz-image-box"
            style={{
              width: '420px',
              height: '320px',
              maxWidth: '100%',
              margin: '0 auto',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '4px solid #FCD34D',
              background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
              boxShadow: '0 6px 18px rgba(252, 211, 77, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              flexShrink: 0,
            }}
          >
            <CenterVocabImage 
              vocabulary={scene.vocabulary} 
              customImage={scene.image} 
              level={currentLevel}
            />
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              background: 'rgba(124, 58, 237, 0.9)',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: '800',
              fontFamily: "'Fredoka', sans-serif",
              letterSpacing: '0.5px'
            }}>
              Ch. {currentScene + 1}
            </div>
          </div>

          {/* ✅ 2. STORY TEXT — BELOW IMAGE, CENTERED */}
          <div
            className="squiz-story"
            style={{
              padding: '14px 20px',
              background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
              borderLeft: '4px solid #7C3AED', borderRadius: '10px',
              textAlign: 'center',
            }}
          >
            <p style={{
              color: '#1F2937', fontSize: '17px', lineHeight: '1.7',
              margin: 0, fontFamily: "'Nunito', sans-serif", fontWeight: '500'
            }}>
              {renderStoryText()}
            </p>
          </div>

          {/* ✅ 3. QUESTION PROMPT — BELOW STORY */}
          <div
            className="squiz-question"
            style={{
              textAlign: 'center',
              padding: '12px 16px', background: '#FEF3C7',
              borderRadius: '10px', border: '1.5px solid #FCD34D'
            }}
          >
            <span style={{ fontSize: '15px', color: '#92400E', fontWeight: '800' }}>
              Question {currentScene + 1}: {questionPrompt}
            </span>
          </div>

          {/* ✅ 4. CHOICES — 2x2 GRID */}
          {scene.choices && scene.choices.length > 0 && lives > 0 && (
            <div
              className="squiz-choices"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}
            >
              {scene.choices.map((choice, i) => {
                const colorSet = choiceColors[i % 4];
                let bg = colorSet.bg, border = colorSet.border, text = colorSet.text;
                let showCorrect = false, showWrong = false;

                if (selectedChoice === choice.id) {
                  if (feedbackType === 'correct') {
                    bg = '#D1FAE5'; border = '#10B981'; text = '#065F46'; showCorrect = true;
                  } else if (feedbackType === 'wrong') {
                    bg = '#FEE2E2'; border = '#EF4444'; text = '#991B1B'; showWrong = true;
                  }
                }

                return (
                  <button
                    key={choice.id}
                    className="squiz-choice"
                    onClick={() => handleChoice(choice)}
                    disabled={selectedChoice !== null || lives <= 0}
                    style={{
                      padding: '14px 18px', borderRadius: '12px',
                      border: `2px solid ${border}`, background: bg, color: text,
                      cursor: selectedChoice !== null || lives <= 0 ? 'default' : 'pointer',
                      fontSize: '14px', fontWeight: '700', textAlign: 'left',
                      fontFamily: "'Nunito', sans-serif", minHeight: '60px',
                      display: 'flex', alignItems: 'center', gap: '10px',
                      boxShadow: `0 3px 0 ${border}`
                    }}
                  >
                    <span style={{
                      fontWeight: '900', display: 'inline-flex',
                      alignItems: 'center', justifyContent: 'center',
                      background: border, color: 'white',
                      width: '24px', height: '24px', borderRadius: '50%',
                      fontSize: '12px', flexShrink: 0
                    }}>{choice.id}</span>
                    <span style={{ flex: 1 }}>{choice.text}</span>
                    {showCorrect && <span>✅</span>}
                    {showWrong && <span>❌</span>}
                  </button>
                );
              })}
            </div>
          )}

          {/* ✅ 5. FEEDBACK + PROGRESS */}
          <div
            className="squiz-footer"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}
          >
            <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600' }}>
              Chapter {currentScene + 1} of {allScenes.length}
            </span>
            {showFeedback && (
              <span style={{
                padding: '6px 14px', borderRadius: '8px',
                background: feedbackType === 'correct' ? '#D1FAE5' : '#FEE2E2',
                color: feedbackType === 'correct' ? '#065F46' : '#991B1B',
                fontSize: '13px', fontWeight: '800'
              }}>{feedbackMessage}</span>
            )}
          </div>

          <div style={{ height: '7px', background: '#F3F4F6', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg, #7C3AED, #EC4899)',
              width: `${((currentScene + 1) / allScenes.length) * 100}%`,
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>

        {isSpeaking && (
          <div
            className="squiz-speaking"
            style={{
              position: 'absolute', top: '70px', right: '24px',
              padding: '5px 12px', background: 'rgba(124, 58, 237, 0.15)',
              backdropFilter: 'blur(10px)', borderRadius: '18px',
              border: '1px solid rgba(124, 58, 237, 0.3)', color: '#7C3AED',
              fontSize: '11px', fontWeight: '700',
              display: 'flex', alignItems: 'center', gap: '6px', pointerEvents: 'none'
            }}
          >
            <span style={{
              display: 'inline-block', width: '7px', height: '7px',
              background: '#7C3AED', borderRadius: '50%',
              animation: 'pulse 0.8s ease-in-out infinite'
            }} />
            Speaking...
          </div>
        )}
      </div>
    );
  };

  export default GameUI;