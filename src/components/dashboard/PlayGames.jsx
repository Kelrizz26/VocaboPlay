import React, { useState, useEffect } from 'react';
import { colors, fontFamily } from './dashboardStyles';

const PlayGames = ({ startGame }) => {
  const [filter, setFilter] = useState('all');
  const [hoveredGame, setHoveredGame] = useState(null);
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    setPageLoaded(true);
  }, []);

  const games = [
    {
      id: 'wordpics',
      name: 'Syno Quest',
      description: 'Guess the word from the picture! Fun and visual vocabulary learning.',
      image: 'src/image/wordpics.png',
      accentColor: '#5C6AC4',
      lightColor: '#F3F1F9',
      category: 'vocab',
      timeEstimate: '5-10 min',
      difficulty: 'beginner',
      players: '1 player',
      available: true
    },
    {
      id: 'match',
      name: 'Match Game',
      description: 'Connect words with definitions in this fast-paced memory challenge.',
      image: 'src/image/matchgame.png',
      accentColor: '#B83B5E',
      lightColor: '#FDF1F4',
      category: 'vocab',
      timeEstimate: '3-5 min',
      difficulty: 'beginner',
      players: '1 player',
      available: true  // 👈 Match Game is now available again
    },
    {
      id: 'short-story',
      name: 'Story Quest',
      description: 'Immerse yourself in narratives while learning vocabulary in context.',
      image: 'src/image/shortstory.png',
      accentColor: '#2F5D62',
      lightColor: '#EEF3F3',
      category: 'reading',
      timeEstimate: '15-20 min',
      difficulty: 'intermediate',
      players: '1 player',
      available: true
    },
    {
      id: 'quiz',
      name: 'Quiz Master',
      description: 'Test your knowledge with adaptive multiple choice questions.',
      image: 'src/image/quizgame.png',
      accentColor: '#1F4E5F',
      lightColor: '#E8EDF0',
      category: 'challenge',
      timeEstimate: '10-15 min',
      difficulty: 'intermediate',
      players: '1 player',
      available: false  // 👈 Coming Soon
    },
    {
      id: 'guesswhat',
      name: 'GuessWhat',
      description: 'Deduce the correct word from visual context clues and sentences.',
      image: 'src/image/guesswhatgame.png',
      accentColor: '#C44545',
      lightColor: '#FCEEEE',
      category: 'challenge',
      timeEstimate: '8-12 min',
      difficulty: 'advanced',
      players: '1 player',
      available: false  // 👈 Coming Soon
    },
    {
      id: 'sentence-builder',
      name: 'Sentence Builder',
      description: 'Construct grammatically correct sentences using vocabulary in context.',
      image: 'src/image/sentence.png',
      accentColor: '#3A6B6B',
      lightColor: '#EDF3F3',
      category: 'vocab',
      timeEstimate: '6-10 min',
      difficulty: 'beginner',
      players: '1 player',
      available: false  // 👈 Coming Soon
    },
  ];

  const categories = [
    { id: 'all', name: 'All Games', icon: '🎮', color: '#1E293B' },
    { id: 'vocab', name: 'Vocabulary', icon: '📚', color: '#5E4B8C' },
    { id: 'reading', name: 'Reading', icon: '📖', color: '#2F5D62' },
    { id: 'challenge', name: 'Challenge', icon: '⚡', color: '#B83B5E' },
  ];

  const filteredGames = filter === 'all'
    ? games
    : games.filter(game => game.category === filter);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return '#2E7D32';
      case 'intermediate': return '#B85C1A';
      case 'advanced': return '#A93226';
      default: return '#64748b';
    }
  };

  return (
    <div className="playgames-container" style={{
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '32px 24px',
      fontFamily,
      color: colors.textPrimary,
      opacity: pageLoaded ? 1 : 0,
      transform: pageLoaded ? 'translateY(0)' : 'translateY(20px)',
      transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
    }}>
      <style>{`
        /* ===== MOBILE RESPONSIVE FOR PLAY GAMES ===== */
        @media (max-width: 768px) {
          .playgames-container {
            padding: 20px 16px !important;
          }
          .playgames-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 8px !important;
          }
          .playgames-header h1 {
            font-size: 20px !important;
          }
          .playgames-header p {
            font-size: 12px !important;
          }
          .playgames-filter-wrapper {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .playgames-categories {
            overflow-x: auto !important;
            flex-wrap: nowrap !important;
            padding: 4px 0 !important;
            gap: 4px !important;
            width: 100% !important;
            -webkit-overflow-scrolling: touch !important;
          }
          .playgames-categories button {
            padding: 6px 14px !important;
            font-size: 12px !important;
            white-space: nowrap !important;
            flex-shrink: 0 !important;
          }
          .playgames-categories button span:first-child {
            font-size: 12px !important;
          }
          .playgames-count {
            font-size: 11px !important;
            padding: 4px 12px !important;
            align-self: flex-start !important;
          }
          .playgames-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 12px !important;
          }
          .playgames-card {
            border-radius: 10px !important;
          }
          .playgames-card-image {
            height: 100px !important;
          }
          .playgames-card-content {
            padding: 14px !important;
          }
          .playgames-card-title {
            font-size: 15px !important;
          }
          .playgames-card-desc {
            font-size: 12px !important;
            margin-bottom: 8px !important;
          }
          .playgames-card-meta {
            font-size: 10px !important;
            gap: 8px !important;
          }
          .playgames-card-start {
            font-size: 12px !important;
          }
          .playgames-footer {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 8px !important;
            font-size: 12px !important;
          }
          .playgames-footer-stats {
            flex-wrap: wrap !important;
            gap: 8px !important;
          }
          .playgames-footer-stats span {
            font-size: 12px !important;
          }
          .playgames-badge {
            padding: 2px 8px !important;
            font-size: 10px !important;
          }
        }
        @media (max-width: 480px) {
          .playgames-container {
            padding: 12px !important;
          }
          .playgames-header h1 {
            font-size: 18px !important;
          }
          .playgames-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
          .playgames-card-image {
            height: 80px !important;
          }
          .playgames-card-content {
            padding: 12px !important;
          }
          .playgames-card-title {
            font-size: 14px !important;
          }
          .playgames-categories button {
            padding: 5px 10px !important;
            font-size: 11px !important;
          }
          .playgames-categories button span:first-child {
            font-size: 11px !important;
          }
        }
      `}</style>

      {/* Header Section */}
      <div className="playgames-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: '24px',
        borderBottom: `1px solid ${colors.border}`,
        paddingBottom: '16px',
      }}>
        <div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '500',
            color: colors.textPrimary,
            margin: '0 0 4px 0',
            letterSpacing: '-0.01em',
            fontFamily,
          }}>
            Learning Games
          </h1>
          <p style={{
            fontSize: '13px',
            color: colors.textSecondary,
            margin: '0',
            fontWeight: '400',
          }}>
            Choose your adventure • All games use your vocabulary library
          </p>
        </div>
      </div>

      {/* Category Filters */}
      <div className="playgames-filter-wrapper" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        gap: '12px',
      }}>
        <div className="playgames-categories" style={{
          display: 'flex',
          gap: '4px',
          background: colors.bg,
          padding: '4px',
          borderRadius: '8px',
          border: `1px solid ${colors.border}`,
          flexWrap: 'wrap',
        }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '32px',
                border: 'none',
                fontSize: '13px',
                fontWeight: '400',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: filter === cat.id ? colors.surface : 'transparent',
                color: filter === cat.id ? cat.color : colors.textSecondary,
                boxShadow: filter === cat.id ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily,
              }}
            >
              <span>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>

        <span className="playgames-count" style={{
          fontSize: '12px',
          color: colors.textSecondary,
          background: colors.surface,
          padding: '6px 14px',
          borderRadius: '8px',
          border: `1px solid ${colors.border}`,
          fontFamily,
          flexShrink: 0,
        }}>
          {filteredGames.length} games
        </span>
      </div>

      {/* Games Grid */}
      <div className="playgames-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
      }}>
        {filteredGames.map((game, index) => (
          <div
            key={game.id}
            className="playgames-card"
            onClick={() => game.available && startGame(game.id)}
            onMouseEnter={() => setHoveredGame(game.id)}
            onMouseLeave={() => setHoveredGame(null)}
            style={{
              background: colors.surface,
              border: `1px solid ${hoveredGame === game.id && game.available ? colors.accent : colors.border}`,
              borderRadius: '12px',
              overflow: 'hidden',
              cursor: game.available ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              boxShadow: hoveredGame === game.id && game.available
                ? `0 8px 16px -8px ${game.accentColor}30`
                : '0 2px 4px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            {/* Image on top - spans full width */}
            <div className="playgames-card-image" style={{
              width: '100%',
              height: '140px',
              background: `linear-gradient(135deg, ${game.accentColor}15, ${game.accentColor}05)`,
              position: 'relative',
              overflow: 'hidden',
            }}>
              <img 
                src={game.image}
                alt={game.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.2s ease, filter 0.2s ease',
                  transform: hoveredGame === game.id && game.available ? 'scale(1.03)' : 'scale(1)',
                  filter: game.available ? 'none' : 'blur(4px)',
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentNode.style.background = game.lightColor;
                  const fallback = document.createElement('div');
                  fallback.style.cssText = `
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 40px;
                    color: ${game.accentColor};
                  `;
                  fallback.textContent = '🎮';
                  e.target.parentNode.appendChild(fallback);
                }}
              />

              {/* Locked overlay - ONLY for unavailable games */}
              {!game.available && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  background: 'rgba(255, 255, 255, 0.35)',
                  zIndex: 1,
                }}>
                  <span style={{ fontSize: '22px' }}>🔒</span>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: colors.textPrimary,
                    background: 'rgba(255, 255, 255, 0.85)',
                    padding: '3px 10px',
                    borderRadius: '10px',
                    fontFamily,
                  }}>
                    Coming Soon
                  </span>
                </div>
              )}

              {/* Difficulty Badge Overlay */}
              <span className="playgames-badge" style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '500',
                background: 'rgba(255, 255, 255, 0.9)',
                color: getDifficultyColor(game.difficulty),
                textTransform: 'capitalize',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                zIndex: 2,
                fontFamily,
              }}>
                {game.difficulty}
              </span>
            </div>

            {/* Content Section */}
            <div className="playgames-card-content" style={{ padding: '20px' }}>
              {/* Icon and Status */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '10px',
              }}>
                <h3 className="playgames-card-title" style={{
                  fontSize: '18px',
                  fontWeight: '500',
                  color: colors.textPrimary,
                  margin: '0',
                  fontFamily,
                  letterSpacing: '-0.01em',
                }}>
                  {game.name}
                </h3>

                {!game.available && (
                  <span style={{
                    padding: '4px 10px',
                    background: colors.bg,
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '400',
                    color: colors.textMuted,
                    fontFamily,
                  }}>
                    Coming Soon
                  </span>
                )}
              </div>

              {/* Game Info */}
              <div style={{ flex: 1 }}>
                <p className="playgames-card-desc" style={{
                  fontSize: '13px',
                  color: colors.textSecondary,
                  lineHeight: '1.5',
                  margin: '0 0 10px 0',
                  fontFamily,
                }}>
                  {game.description}
                </p>
              </div>

              {/* Metadata and CTA */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '10px',
                paddingTop: '10px',
                borderTop: `1px solid ${colors.border}`,
              }}>
                <div className="playgames-card-meta" style={{
                  display: 'flex',
                  gap: '10px',
                  fontSize: '11px',
                  color: colors.textMuted,
                }}>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    <span style={{ fontSize: '12px' }}>⏱️</span>
                    {game.timeEstimate}
                  </span>
                </div>

                <div className="playgames-card-start" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: game.available ? game.accentColor : colors.textMuted,
                  fontSize: '13px',
                  fontWeight: '400',
                }}>
                  <span>{game.available ? 'Start Game' : 'Unavailable'}</span>
                  <span style={{
                    fontSize: '16px',
                    transition: 'transform 0.2s ease',
                    transform: hoveredGame === game.id && game.available ? 'translateX(3px)' : 'translateX(0)',
                  }}>
                    {game.available ? '→' : '⏳'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredGames.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '80px 40px',
          background: colors.surface,
          borderRadius: '24px',
          border: `1px solid ${colors.border}`,
          maxWidth: '500px',
          margin: '40px auto',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: colors.bg,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <span style={{ fontSize: '32px' }}>🎮</span>
          </div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: '8px',
            fontFamily,
          }}>
            No games in this category
          </h3>
          <p style={{
            fontSize: '15px',
            color: colors.textSecondary,
            marginBottom: '24px',
            fontFamily,
          }}>
            Try selecting a different filter
          </p>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '10px 24px',
              background: colors.accent,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background 0.2s ease',
              fontFamily,
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            View all games
          </button>
        </div>
      )}

      {/* Footer Stats */}
      {filteredGames.length > 0 && (
        <div className="playgames-footer" style={{
          marginTop: '32px',
          paddingTop: '20px',
          borderTop: `1px solid ${colors.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '13px',
          color: colors.textSecondary,
          flexWrap: 'wrap',
          gap: '8px',
        }}>
          <div className="playgames-footer-stats" style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
          }}>
            <span>🎮 {games.filter(g => g.available).length} available</span>
            <span>📚 {games.filter(g => g.category === 'vocab').length} vocabulary</span>
            <span>📖 {games.filter(g => g.category === 'reading').length} reading</span>
            <span>⚡ {games.filter(g => g.category === 'challenge').length} challenge</span>
          </div>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            color: colors.textMuted,
          }}>
            <span style={{ fontSize: '14px' }}>✨</span>
            New games added regularly
          </span>
        </div>
      )}
    </div>
  );
};

export default PlayGames;