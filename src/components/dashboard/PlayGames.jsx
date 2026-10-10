import React, { useState, useEffect } from 'react';
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

// ===== DUOTONE SVG ICONS =====
const Icon = ({ name, size = 20, color = palette.bodyText, secondaryColor = `${palette.bodyText}66` }) => {
  const icons = {
    game: (
      <>
        <path d="M6 12h4m-2-2v4m6-4h.01M17 12h.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M8 20h8a4 4 0 004-4V8a4 4 0 00-4-4H8a4 4 0 00-4 4v8a4 4 0 004 4z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    book: (
      <>
        <path d="M4 4h11a3 3 0 013 3v13H7a3 3 0 00-3 3V4z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M4 4v16" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      </>
    ),
    zap: (
      <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none"/>
        <path d="M12 7v5l3 2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    lock: (
      <>
        <rect x="4" y="11" width="16" height="10" rx="2" stroke={color} strokeWidth="2" fill="none"/>
        <path d="M8 11V7a4 4 0 118 0v4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    arrowRight: (
      <path d="M5 12h14M12 5l7 7-7 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    ),
    sparkle: (
      <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    ),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', flexShrink: 0 }}>
      {icons[name] || icons.game}
    </svg>
  );
};

const PlayGames = ({ startGame }) => {
  const [filter, setFilter] = useState('all');
  const [hoveredGame, setHoveredGame] = useState(null);
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    setPageLoaded(true);
  }, []);

  // ✅ 6 games total:
  //    - 3 available (Syno Quest, Match Game, Story Quest)
  //    - 3 locked   (Quiz Master, GuessWhat, Sentence Builder) — All Games lang
  const games = [
    {
      id: 'wordpics',
      name: 'Syno Quest',
      description: 'Guess the word from the picture! Fun and visual vocabulary learning.',
      image: '/image/wordpics.png',
      accentColor: palette.warmOrange,
      lightColor: palette.creamSoft,
      categories: ['challenge'],
      timeEstimate: '5-10 min',
      difficulty: 'beginner',
      players: '1 player',
      available: true
    },
    {
      id: 'match',
      name: 'Match Game',
      description: 'Connect words with definitions in this fast-paced memory challenge.',
      image: '/image/matchgame.png',
      accentColor: palette.coral,
      lightColor: palette.creamSoft,
      categories: ['challenge'],
      timeEstimate: '3-5 min',
      difficulty: 'beginner',
      players: '1 player',
      available: true
    },
    {
      id: 'short-story',
      name: 'Story Quest',
      description: 'Immerse yourself in narratives while learning vocabulary in context.',
      image: '/image/shortstory.png',
      accentColor: palette.teal,
      lightColor: palette.creamSoft,
      categories: ['reading', 'challenge'],   // 👈 nasa both reading + challenge
      timeEstimate: '15-20 min',
      difficulty: 'intermediate',
      players: '1 player',
      available: true
    },
    // 🔒 LOCKED — All Games lang (walang category)
    {
      id: 'quiz',
      name: 'Quiz Master',
      description: 'Test your knowledge with adaptive multiple choice questions.',
      image: '/image/quizgame.png',
      accentColor: palette.deepNavy,
      lightColor: palette.creamSoft,
      categories: [],                          // 👈 walang category → All Games lang
      timeEstimate: '10-15 min',
      difficulty: 'intermediate',
      players: '1 player',
      available: false
    },
    {
      id: 'guesswhat',
      name: 'GuessWhat',
      description: 'Deduce the correct word from visual context clues and sentences.',
      image: '/image/guesswhatgame.png',
      accentColor: palette.coral,
      lightColor: palette.creamSoft,
      categories: [],                          // 👈 walang category → All Games lang
      timeEstimate: '8-12 min',
      difficulty: 'advanced',
      players: '1 player',
      available: false
    },
    {
      id: 'sentence-builder',
      name: 'Sentence Builder',
      description: 'Construct grammatically correct sentences using vocabulary in context.',
      image: '/image/sentence.png',
      accentColor: palette.softGreen,
      lightColor: palette.creamSoft,
      categories: [],                          // 👈 walang category → All Games lang
      timeEstimate: '6-10 min',
      difficulty: 'beginner',
      players: '1 player',
      available: false
    },
  ];

  // ✅ 3 filters: All Games, Reading, Challenge
  const categories = [
    { id: 'all',       name: 'All Games', icon: 'game', color: palette.deepNavy },
    { id: 'reading',   name: 'Reading',   icon: 'book', color: palette.teal },
    { id: 'challenge', name: 'Challenge', icon: 'zap',  color: palette.coral },
  ];

  // ✅ Filter using ARRAY includes
  const filteredGames = filter === 'all'
    ? games
    : games.filter(game => game.categories.includes(filter));

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return palette.softGreen;
      case 'intermediate': return palette.warmOrange;
      case 'advanced': return palette.coral;
      default: return palette.bodyTextSoft;
    }
  };

  const getDifficultyBg = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return `${palette.softGreen}15`;
      case 'intermediate': return `${palette.warmOrange}15`;
      case 'advanced': return `${palette.coral}15`;
      default: return palette.creamSoft;
    }
  };

  return (
    <div className="playgames-container" style={{
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '0',
      fontFamily,
      color: palette.deepNavy,
      opacity: pageLoaded ? 1 : 0,
      transform: pageLoaded ? 'translateY(0)' : 'translateY(16px)',
      transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
    }}>
      <style>{`
        @media (max-width: 768px) {
          .playgames-container { padding: 0 !important; }
          .playgames-header { flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; }
          .playgames-header h1 { font-size: 20px !important; }
          .playgames-header p { font-size: 12px !important; }
          .playgames-filter-wrapper { flex-direction: column !important; align-items: stretch !important; gap: 12px !important; }
          .playgames-categories { overflow-x: auto !important; flex-wrap: nowrap !important; padding: 4px 0 !important; gap: 4px !important; width: 100% !important; -webkit-overflow-scrolling: touch !important; }
          .playgames-categories button { padding: 6px 14px !important; font-size: 12px !important; white-space: nowrap !important; flex-shrink: 0 !important; }
          .playgames-count { font-size: 11px !important; padding: 4px 12px !important; align-self: flex-start !important; }
          .playgames-grid { grid-template-columns: 1fr 1fr !important; gap: 12px !important; }
          .playgames-card-image { height: 100px !important; }
          .playgames-card-content { padding: 14px !important; }
          .playgames-card-title { font-size: 15px !important; }
          .playgames-card-desc { font-size: 12px !important; margin-bottom: 8px !important; }
          .playgames-card-meta { font-size: 10px !important; gap: 8px !important; }
          .playgames-card-start { font-size: 12px !important; }
          .playgames-footer { flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; font-size: 12px !important; }
          .playgames-footer-stats { flex-wrap: wrap !important; gap: 8px !important; }
          .playgames-footer-stats span { font-size: 11px !important; }
          .playgames-badge { padding: 2px 8px !important; font-size: 10px !important; }
        }
        @media (max-width: 480px) {
          .playgames-header h1 { font-size: 18px !important; }
          .playgames-grid { grid-template-columns: 1fr !important; gap: 10px !important; }
          .playgames-card-image { height: 120px !important; }
          .playgames-card-content { padding: 14px !important; }
          .playgames-card-title { font-size: 15px !important; }
          .playgames-categories button { padding: 5px 10px !important; font-size: 11px !important; }
        }
        .playgames-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
      `}</style>

      {/* ===== HEADER ===== */}
      <div className="playgames-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: '20px',
        borderBottom: `1.5px solid ${palette.border}`,
        paddingBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '800',
            color: palette.deepNavy,
            margin: '0 0 4px 0',
            letterSpacing: '-0.5px',
            fontFamily,
          }}>
            Learning Games
          </h1>
          <p style={{
            fontSize: '13px',
            color: palette.bodyTextSoft,
            margin: '0',
            fontWeight: '600',
          }}>
            Choose your adventure • All games use your vocabulary library
          </p>
        </div>
      </div>

      {/* ===== FILTERS ===== */}
      <div className="playgames-filter-wrapper" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        gap: '12px',
      }}>
        <div className="playgames-categories" style={{
          display: 'flex',
          gap: '6px',
          background: palette.creamSoft,
          padding: '4px',
          borderRadius: '10px',
          border: `1.5px solid ${palette.border}`,
          flexWrap: 'wrap',
        }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              style={{
                padding: '7px 15px',
                borderRadius: '32px',
                border: 'none',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                background: filter === cat.id ? palette.white : 'transparent',
                color: filter === cat.id ? cat.color : palette.bodyTextSoft,
                boxShadow: filter === cat.id ? `0 1px 0 ${palette.border}` : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily,
              }}
            >
              <Icon 
                name={cat.icon} 
                size={13} 
                color={filter === cat.id ? cat.color : palette.bodyTextSoft} 
              />
              {cat.name}
            </button>
          ))}
        </div>

        <span className="playgames-count" style={{
          fontSize: '12px',
          color: palette.bodyText,
          background: palette.creamSoft,
          padding: '6px 14px',
          borderRadius: '8px',
          border: `1.5px solid ${palette.border}`,
          fontFamily: "'Fredoka', sans-serif",
          fontWeight: 700,
          flexShrink: 0,
        }}>
          {filteredGames.length} {filteredGames.length === 1 ? 'game' : 'games'}
        </span>
      </div>

      {/* ===== GAMES GRID ===== */}
      <div className="playgames-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '18px',
      }}>
        {filteredGames.map((game) => {
          const isHovered = hoveredGame === game.id && game.available;
          return (
            <div
              key={game.id}
              className="playgames-card"
              onClick={() => game.available && startGame(game.id)}
              onMouseEnter={() => setHoveredGame(game.id)}
              onMouseLeave={() => setHoveredGame(null)}
              style={{
                background: palette.white,
                border: `1.5px solid ${isHovered ? game.accentColor : palette.border}`,
                borderRadius: '14px',
                overflow: 'hidden',
                cursor: game.available ? 'pointer' : 'not-allowed',
                boxShadow: isHovered
                  ? `0 8px 24px ${palette.shadowMd}`
                  : `0 2px 0 ${palette.border}`,
                transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
              }}
            >
              {/* Image */}
              <div className="playgames-card-image" style={{
                width: '100%',
                height: '140px',
                background: `linear-gradient(135deg, ${game.accentColor}12, ${game.accentColor}04)`,
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
                    transition: 'transform 0.25s ease, filter 0.25s ease',
                    transform: isHovered ? 'scale(1.04)' : 'scale(1)',
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
                      font-size: 44px;
                    `;
                    fallback.innerHTML = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${game.accentColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12h4m-2-2v4m6-4h.01M17 12h.01"/><path d="M8 20h8a4 4 0 004-4V8a4 4 0 00-4-4H8a4 4 0 00-4 4v8a4 4 0 004 4z"/></svg>`;
                    e.target.parentNode.appendChild(fallback);
                  }}
                />

                {!game.available && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    background: 'rgba(253, 249, 243, 0.6)',
                    backdropFilter: 'blur(2px)',
                    WebkitBackdropFilter: 'blur(2px)',
                    zIndex: 1,
                  }}>
                    <Icon name="lock" size={24} color={palette.bodyTextSoft} />
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      color: palette.bodyText,
                      background: palette.white,
                      padding: '3px 10px',
                      borderRadius: '999px',
                      fontFamily: "'Fredoka', sans-serif",
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      border: `1px solid ${palette.border}`,
                    }}>
                      Coming Soon
                    </span>
                  </div>
                )}

                <span className="playgames-badge" style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '10px',
                  fontWeight: '800',
                  background: palette.white,
                  color: getDifficultyColor(game.difficulty),
                  boxShadow: `0 2px 4px ${palette.shadow}`,
                  zIndex: 2,
                  fontFamily: "'Fredoka', sans-serif",
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  border: `1px solid ${getDifficultyBg(game.difficulty)}`,
                }}>
                  {game.difficulty}
                </span>
              </div>

              {/* Content */}
              <div className="playgames-card-content" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 className="playgames-card-title" style={{
                  fontSize: '18px',
                  fontWeight: '800',
                  color: palette.deepNavy,
                  margin: '0 0 6px 0',
                  fontFamily,
                  letterSpacing: '-0.01em',
                }}>
                  {game.name}
                </h3>

                <p className="playgames-card-desc" style={{
                  fontSize: '13px',
                  color: palette.bodyText,
                  lineHeight: '1.55',
                  margin: '0 0 16px 0',
                  fontFamily,
                  fontWeight: 600,
                  flex: 1,
                }}>
                  {game.description}
                </p>

                {/* Meta row */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '14px',
                  borderTop: `1.5px solid ${palette.borderSoft}`,
                  gap: '10px',
                  flexWrap: 'wrap',
                }}>
                  <div className="playgames-card-meta" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    color: palette.bodyTextSoft,
                    fontWeight: 700,
                    fontFamily,
                  }}>
                    <Icon name="clock" size={12} color={palette.bodyTextSoft} />
                    {game.timeEstimate}
                  </div>

                  <div className="playgames-card-start" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: game.available ? game.accentColor : palette.bodyTextSoft,
                    fontSize: '12px',
                    fontWeight: '800',
                    fontFamily: "'Fredoka', sans-serif",
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    <span>{game.available ? 'Play Now' : 'Locked'}</span>
                    {game.available && (
                      <span style={{
                        display: 'flex',
                        transition: 'transform 0.2s ease',
                        transform: isHovered ? 'translateX(3px)' : 'translateX(0)',
                      }}>
                        <Icon name="arrowRight" size={13} color={game.accentColor} />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== EMPTY STATE ===== */}
      {filteredGames.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 40px',
          background: palette.white,
          borderRadius: '20px',
          border: `1.5px solid ${palette.border}`,
          maxWidth: '440px',
          margin: '40px auto',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: palette.creamSoft,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <Icon name="game" size={28} color={palette.bodyTextSoft} />
          </div>
          <h3 style={{
            fontSize: '17px',
            fontWeight: '800',
            color: palette.deepNavy,
            marginBottom: '6px',
            fontFamily,
          }}>
            No games in this category
          </h3>
          <p style={{
            fontSize: '13px',
            color: palette.bodyTextSoft,
            marginBottom: '20px',
            fontFamily,
            fontWeight: 600,
          }}>
            Try selecting a different filter
          </p>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '10px 22px',
              background: palette.warmOrange,
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '800',
              cursor: 'pointer',
              fontFamily: "'Fredoka', sans-serif",
              boxShadow: `0 3px 0 ${palette.warmOrangeShadow}`,
              transition: 'transform 0.1s ease, box-shadow 0.1s ease',
            }}
            onMouseDown={e => { e.currentTarget.style.transform = 'translateY(3px)'; e.currentTarget.style.boxShadow = 'none'; }}
            onMouseUp={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 3px 0 ${palette.warmOrangeShadow}`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 3px 0 ${palette.warmOrangeShadow}`; }}
          >
            View all games
          </button>
        </div>
      )}

      {/* ===== FOOTER STATS ===== */}
      {filteredGames.length > 0 && (
        <div className="playgames-footer" style={{
          marginTop: '28px',
          paddingTop: '18px',
          borderTop: `1.5px solid ${palette.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          color: palette.bodyTextSoft,
          flexWrap: 'wrap',
          gap: '10px',
          fontFamily,
          fontWeight: 600,
        }}>
          <div className="playgames-footer-stats" style={{
            display: 'flex',
            gap: '18px',
            flexWrap: 'wrap',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Icon name="game" size={12} color={palette.bodyTextSoft} />
              {games.filter(g => g.available).length} available
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Icon name="book" size={12} color={palette.bodyTextSoft} />
              {games.filter(g => g.categories.includes('reading')).length} reading
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Icon name="zap" size={12} color={palette.bodyTextSoft} />
              {games.filter(g => g.categories.includes('challenge')).length} challenge
            </span>
          </div>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '11px',
            color: palette.bodyTextSoft,
          }}>
            <Icon name="sparkle" size={12} color={palette.warmOrange} />
            New games added regularly
          </span>
        </div>
      )}
    </div>
  );
};

export default PlayGames;