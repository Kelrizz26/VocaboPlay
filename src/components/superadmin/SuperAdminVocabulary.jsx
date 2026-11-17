// src/components/superadmin/SuperAdminVocabulary.jsx
// ============================================================
// ✅ SUPER ADMIN - VOCABULARY MANAGEMENT
// With filtering by difficulty/category and recently added
// ============================================================

import React, { useState, useMemo } from 'react';

const palette = {
  warmOrange: '#E9A075',
  coral: '#DB7A64',
  teal: '#4F9188',
  deepNavy: '#2A2845',
  bodyText: '#6B6880',
  bodyTextSoft: '#8A8799',
  cream: '#FDF9F3',
  creamSoft: '#F5EFE6',
  white: '#FFFFFF',
  border: '#EBE2D5',
  borderSoft: '#F2EBE0',
  softGreen: '#7FA574',
  gold: '#C9A227',
  danger: '#DB7A64',
};

const FONT_DISPLAY = "'Fredoka', sans-serif";
const FONT_BODY = "'Nunito', sans-serif";

// ===== DUOTONE SVG ICONS =====
const Icon = ({ name, size = 16, color = palette.bodyTextSoft }) => {
  const icons = {
    add: <path d="M12 5v14M5 12h14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
    search: (
      <>
        <circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2" fill="none"/>
        <path d="M21 21l-4.35-4.35" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
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

const DIFFICULTY_LABELS = {
  1: { label: 'Beginner', color: palette.softGreen },
  2: { label: 'Easy', color: palette.softGreen },
  3: { label: 'Intermediate', color: palette.gold },
  4: { label: 'Advanced', color: palette.warmOrange },
  5: { label: 'Expert', color: palette.coral },
};

const getDifficultyMeta = (d) => {
  const num = typeof d === 'number' ? d : parseInt(d);
  return DIFFICULTY_LABELS[num] || { label: 'Unknown', color: palette.bodyTextSoft };
};

const formatDate = (iso) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  } catch { return '—'; }
};

const SuperAdminVocabulary = ({ words = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const categories = useMemo(() => {
    const set = new Set();
    words.forEach(w => {
      if (w.category) set.add(w.category);
    });
    return Array.from(set).sort();
  }, [words]);

  const filtered = useMemo(() => {
    let result = words.filter(w => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchWord = w.word?.toLowerCase().includes(q);
        const matchDef = w.definition?.toLowerCase().includes(q);
        const matchCat = w.category?.toLowerCase().includes(q);
        if (!matchWord && !matchDef && !matchCat) return false;
      }
      if (filterDifficulty !== 'all') {
        const d = typeof w.difficulty === 'number' ? w.difficulty : parseInt(w.difficulty);
        if (String(d) !== filterDifficulty) return false;
      }
      if (filterCategory !== 'all' && w.category !== filterCategory) return false;
      return true;
    });

    switch (sortBy) {
      case 'recent':
        result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        break;
      case 'az':
        result.sort((a, b) => (a.word || '').localeCompare(b.word || ''));
        break;
      case 'za':
        result.sort((a, b) => (b.word || '').localeCompare(a.word || ''));
        break;
      default:
        break;
    }

    return result;
  }, [words, searchTerm, filterDifficulty, filterCategory, sortBy]);

  const difficultyCounts = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, unknown: 0 };
    words.forEach(w => {
      const d = typeof w.difficulty === 'number' ? w.difficulty : parseInt(w.difficulty);
      if (d >= 1 && d <= 5) counts[d]++;
      else counts.unknown++;
    });
    return counts;
  }, [words]);

  const recentlyAdded = useMemo(() => {
    return [...words]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 8);
  }, [words]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ====== TOP SUMMARY CARDS ====== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
        <div style={summaryCardStyle(palette.warmOrange)}>
          <div style={summaryLabelStyle}>Total Words</div>
          <div style={summaryValueStyle(palette.warmOrange)}>{words.length}</div>
        </div>
        <div style={summaryCardStyle(palette.softGreen)}>
          <div style={summaryLabelStyle}>Beginner + Easy</div>
          <div style={summaryValueStyle(palette.softGreen)}>
            {difficultyCounts[1] + difficultyCounts[2]}
          </div>
        </div>
        <div style={summaryCardStyle(palette.gold)}>
          <div style={summaryLabelStyle}>Intermediate</div>
          <div style={summaryValueStyle(palette.gold)}>{difficultyCounts[3]}</div>
        </div>
        <div style={summaryCardStyle(palette.coral)}>
          <div style={summaryLabelStyle}>Advanced + Expert</div>
          <div style={summaryValueStyle(palette.coral)}>
            {difficultyCounts[4] + difficultyCounts[5]}
          </div>
        </div>
        <div style={summaryCardStyle(palette.teal)}>
          <div style={summaryLabelStyle}>Categories</div>
          <div style={summaryValueStyle(palette.teal)}>{categories.length}</div>
        </div>
      </div>

      {/* ====== RECENTLY ADDED VOCABULARY ====== */}
      <div style={cardStyle}>
        <h3 style={cardTitleStyle}>
          <Icon name="add" size={16} color={palette.warmOrange} />
          Recently Added Vocabulary
        </h3>
        {recentlyAdded.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: palette.bodyTextSoft, fontSize: '13px', fontWeight: 600 }}>
            No vocabulary words yet
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '10px',
          }}>
            {recentlyAdded.map(w => {
              const meta = getDifficultyMeta(w.difficulty);
              return (
                <div key={w.id} style={{
                  padding: '12px 14px',
                  background: palette.creamSoft,
                  borderRadius: '10px',
                  border: `1.5px solid ${palette.border}`,
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '6px',
                    gap: '6px',
                  }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: 800,
                      color: palette.deepNavy,
                      fontFamily: FONT_DISPLAY,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {w.word}
                    </span>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontSize: '9px',
                      fontWeight: 800,
                      fontFamily: FONT_DISPLAY,
                      textTransform: 'uppercase',
                      background: `${meta.color}15`,
                      color: meta.color,
                      border: `1px solid ${meta.color}40`,
                      flexShrink: 0,
                    }}>{meta.label}</span>
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: palette.bodyText,
                    fontWeight: 600,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: 1.4,
                    marginBottom: '6px',
                  }}>
                    {w.definition}
                  </div>
                  <div style={{
                    fontSize: '10px',
                    color: palette.bodyTextSoft,
                    fontWeight: 600,
                    fontFamily: FONT_BODY,
                  }}>
                    {w.category || 'Uncategorized'} · {formatDate(w.createdAt)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ====== FILTER BAR ====== */}
      <div style={cardStyle}>
        <div style={{
          display: 'flex', gap: '10px', flexWrap: 'wrap',
          marginBottom: '16px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0 14px',
            border: `1.5px solid ${palette.border}`,
            borderRadius: '10px',
            background: palette.creamSoft,
            flex: '1',
            minWidth: '220px',
          }}>
            <Icon name="search" size={14} color={palette.bodyTextSoft} />
            <input
              type="text"
              placeholder="Search word, definition, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 0',
                border: 'none',
                background: 'transparent',
                fontSize: '13px',
                fontFamily: FONT_BODY,
                fontWeight: 600,
                color: palette.deepNavy,
                outline: 'none',
              }}
            />
          </div>
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            style={selectStyle}
          >
            <option value="all">All Difficulties</option>
            <option value="1">L1 · Beginner</option>
            <option value="2">L2 · Easy</option>
            <option value="3">L3 · Intermediate</option>
            <option value="4">L4 · Advanced</option>
            <option value="5">L5 · Expert</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={selectStyle}
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={selectStyle}
          >
            <option value="recent">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="az">Sort: A → Z</option>
            <option value="za">Sort: Z → A</option>
          </select>
        </div>

        <div style={{
          fontSize: '12px', color: palette.bodyTextSoft, fontWeight: 700,
          marginBottom: '12px', fontFamily: FONT_BODY,
        }}>
          Showing <strong style={{ color: palette.warmOrange }}>{filtered.length}</strong> of {words.length} words
        </div>

        {/* ====== VOCABULARY TABLE ====== */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONT_BODY, minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: `1.5px solid ${palette.border}` }}>
                <th style={thStyle}>Word</th>
                <th style={thStyle}>Definition</th>
                <th style={thStyle}>Category</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Difficulty</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Added</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 100).map(w => {
                const meta = getDifficultyMeta(w.difficulty);
                return (
                  <tr
                    key={w.id}
                    className="super-admin-row"
                    style={{ borderBottom: `1.5px solid ${palette.borderSoft}` }}
                  >
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        fontWeight: 800,
                        color: palette.deepNavy,
                        fontFamily: FONT_DISPLAY,
                        fontSize: '14px',
                      }}>{w.word}</span>
                    </td>
                    <td style={{
                      padding: '12px',
                      color: palette.bodyText,
                      fontSize: '13px',
                      fontWeight: 600,
                      maxWidth: '380px',
                    }}>
                      {w.definition}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={badgeStyle(palette.teal)}>{w.category || 'Uncategorized'}</span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={badgeStyle(meta.color)}>{meta.label}</span>
                    </td>
                    <td style={{
                      padding: '12px', textAlign: 'right',
                      color: palette.bodyTextSoft, fontSize: '11px', fontWeight: 600,
                    }}>
                      {formatDate(w.createdAt)}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{
                    padding: '32px', textAlign: 'center',
                    color: palette.bodyTextSoft, fontSize: '13px', fontWeight: 600,
                  }}>
                    No vocabulary words match your filters
                  </td>
                </tr>
              )}
              {filtered.length > 100 && (
                <tr>
                  <td colSpan={5} style={{
                    padding: '12px', textAlign: 'center',
                    color: palette.bodyTextSoft, fontSize: '11px', fontWeight: 600,
                  }}>
                    Showing first 100 of {filtered.length} results. Refine your filters to see more.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ===== STYLES =====
const cardStyle = {
  background: palette.white,
  padding: '24px',
  borderRadius: '16px',
  boxShadow: `0 2px 0 ${palette.border}`,
  border: `1.5px solid ${palette.border}`,
};

const cardTitleStyle = {
  margin: '0 0 16px 0',
  fontFamily: FONT_DISPLAY,
  color: palette.deepNavy,
  fontWeight: 800,
  fontSize: '15px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const summaryCardStyle = (color) => ({
  background: palette.white,
  padding: '16px 18px',
  borderRadius: '14px',
  boxShadow: `0 2px 0 ${palette.border}`,
  border: `1.5px solid ${palette.border}`,
  borderLeft: `4px solid ${color}`,
});

const summaryLabelStyle = {
  fontSize: '10px',
  color: palette.bodyTextSoft,
  fontFamily: FONT_DISPLAY,
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '6px',
};

const summaryValueStyle = (color) => ({
  fontSize: '24px',
  fontWeight: 800,
  color: color,
  fontFamily: FONT_DISPLAY,
  lineHeight: 1,
});

const selectStyle = {
  padding: '10px 14px',
  border: `1.5px solid ${palette.border}`,
  borderRadius: '10px',
  fontSize: '13px',
  fontFamily: FONT_BODY,
  fontWeight: 700,
  background: palette.white,
  color: palette.deepNavy,
  outline: 'none',
  cursor: 'pointer',
};

const thStyle = {
  padding: '12px',
  textAlign: 'left',
  color: palette.bodyTextSoft,
  fontFamily: FONT_DISPLAY,
  fontSize: '10px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontWeight: 800,
};

const badgeStyle = (color) => ({
  padding: '4px 10px',
  borderRadius: '999px',
  fontSize: '10px',
  fontWeight: 800,
  fontFamily: FONT_DISPLAY,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  background: `${color}15`,
  color: color,
  border: `1px solid ${color}40`,
  whiteSpace: 'nowrap',
});

export default SuperAdminVocabulary;

