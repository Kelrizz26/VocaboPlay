// src/components/superadmin/SuperAdminActivities.jsx
// ============================================================
// ✅ SUPER ADMIN - ACTIVITIES MANAGEMENT
// With sorting, filtering by type/date/teacher, most played, recent
// ============================================================

import React, { useState, useMemo } from 'react';

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
  gold: '#C9A227',
  shadow: 'rgba(42, 40, 69, 0.06)',
  shadowMd: 'rgba(42, 40, 69, 0.10)',
  danger: '#DB7A64',
};

const FONT_DISPLAY = "'Fredoka', sans-serif";
const FONT_BODY = "'Nunito', sans-serif";

// ===== DUOTONE SVG ICONS =====
const Icon = ({ name, size = 16, color = palette.bodyTextSoft }) => {
  const icons = {
    quiz: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="3" stroke={color} strokeWidth="2" fill="none"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    target: (
      <>
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none"/>
        <circle cx="12" cy="12" r="6" stroke={color} strokeWidth="2" fill="none"/>
        <circle cx="12" cy="12" r="2" stroke={color} strokeWidth="2" fill="none"/>
      </>
    ),
    image: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="2" fill="none"/>
        <circle cx="8.5" cy="8.5" r="1.5" stroke={color} strokeWidth="2" fill="none"/>
        <path d="M21 15l-5-5L5 21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    book: (
      <>
        <path d="M4 4h11a3 3 0 013 3v13H7a3 3 0 00-3 3V4z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M4 4v16" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      </>
    ),
    game: (
      <>
        <path d="M6 12h4m-2-2v4m6-4h.01M17 12h.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M8 20h8a4 4 0 004-4V8a4 4 0 00-4-4H8a4 4 0 00-4 4v8a4 4 0 004 4z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    flame: (
      <path d="M12 2s4 5 4 9a4 4 0 0 1-8 0c0-1.5.5-2.5 1-3 0 0-2 1-2 4a5 5 0 0 0 10 0c0-4-5-10-5-10z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    ),
    add: <path d="M12 5v14M5 12h14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
    search: (
      <>
        <circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2" fill="none"/>
        <path d="M21 21l-4.35-4.35" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    users: (
      <>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="9" cy="7" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', flexShrink: 0 }}>
      {icons[name] || icons.game}
    </svg>
  );
};

const getTypeIconName = (type) => {
  switch (type) {
    case 'quiz': return 'quiz';
    case 'match': return 'target';
    case 'wordpics': return 'image';
    case 'guesswhat': return 'help';
    case 'short-story': return 'book';
    default: return 'game';
  }
};

const getTypeLabel = (type) => {
  switch (type) {
    case 'quiz': return 'Quiz';
    case 'match': return 'Match';
    case 'wordpics': return 'Word Pics';
    case 'guesswhat': return 'Guess What';
    case 'short-story': return 'Short Story';
    default: return 'Activity';
  }
};

const getTypeColor = (type) => {
  switch (type) {
    case 'quiz': return palette.warmOrange;
    case 'match': return palette.coral;
    case 'wordpics': return palette.teal;
    case 'guesswhat': return palette.softGreen;
    case 'short-story': return palette.gold;
    default: return palette.bodyText;
  }
};

const formatDate = (iso) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  } catch { return '—'; }
};

const SuperAdminActivities = ({ activities = [], scores = [], teachers = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterTeacher, setFilterTeacher] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const teacherOptions = useMemo(() => {
    const set = new Set();
    activities.forEach(a => {
      if (a.teacherName) set.add(a.teacherName);
    });
    teachers.forEach(t => {
      if (t.displayName) set.add(t.displayName);
      else if (t.email) set.add(t.email.split('@')[0]);
    });
    return Array.from(set).sort();
  }, [activities, teachers]);

  const filtered = useMemo(() => {
    const now = new Date();
    const daysAgo = (days) => {
      const d = new Date(now);
      d.setDate(d.getDate() - days);
      return d;
    };
    const dateThreshold =
      filterDateRange === 'today' ? new Date(now.setHours(0, 0, 0, 0)) :
      filterDateRange === 'week' ? daysAgo(7) :
      filterDateRange === 'month' ? daysAgo(30) :
      filterDateRange === 'year' ? daysAgo(365) :
      null;

    let result = activities.filter(a => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchTitle = a.title?.toLowerCase().includes(q);
        const matchPin = a.gamePin?.includes(searchTerm);
        const matchTeacher = a.teacherName?.toLowerCase().includes(q);
        const matchCategory = a.category?.toLowerCase().includes(q);
        if (!matchTitle && !matchPin && !matchTeacher && !matchCategory) return false;
      }
      if (filterType !== 'all' && a.gameType !== filterType) return false;
      if (filterTeacher !== 'all' && a.teacherName !== filterTeacher) return false;
      if (dateThreshold && a.createdAt) {
        if (new Date(a.createdAt) < dateThreshold) return false;
      }

      return true;
    });

    result = result.map(a => {
      const participantCount = scores.filter(s => s.activityId === a.id).length;
      return { ...a, _participantCount: participantCount };
    });

    switch (sortBy) {
      case 'recent':
        result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        break;
      case 'mostPlayed':
        result.sort((a, b) => b._participantCount - a._participantCount);
        break;
      case 'leastPlayed':
        result.sort((a, b) => a._participantCount - b._participantCount);
        break;
      case 'titleAZ':
        result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'titleZA':
        result.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
        break;
      default:
        break;
    }

    return result;
  }, [activities, scores, searchTerm, filterType, filterTeacher, filterDateRange, sortBy]);

  const mostPlayed = useMemo(() => {
    return activities
      .map(a => ({
        ...a,
        _participantCount: scores.filter(s => s.activityId === a.id).length,
      }))
      .sort((a, b) => b._participantCount - a._participantCount)
      .slice(0, 5);
  }, [activities, scores]);

  const recentlyAdded = useMemo(() => {
    return [...activities]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5);
  }, [activities]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ====== MOST PLAYED & RECENTLY ADDED ====== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>

        {/* Most Played */}
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>
            <Icon name="flame" size={16} color={palette.warmOrange} />
            Most Played Activities
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {mostPlayed.map((a, i) => (
              <div key={a.id} style={smallRowStyle}>
                <span style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: i === 0 ? `${palette.gold}20` : palette.creamSoft,
                  color: i === 0 ? palette.gold : palette.bodyTextSoft,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 800, fontFamily: FONT_DISPLAY,
                  border: `1.5px solid ${i === 0 ? palette.gold + '40' : palette.border}`,
                  flexShrink: 0,
                }}>
                  {i + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={smallRowTitleStyle}>{a.title}</div>
                  <div style={smallRowSubStyle}>
                    {getTypeLabel(a.gameType)} · PIN {a.gamePin}
                  </div>
                </div>
                <span style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  fontSize: '13px', fontWeight: 800,
                  color: palette.warmOrange, fontFamily: FONT_DISPLAY,
                  flexShrink: 0,
                }}>
                  {a._participantCount}
                  <Icon name="users" size={12} color={palette.warmOrange} />
                </span>
              </div>
            ))}
            {mostPlayed.length === 0 && <EmptyMini text="No activities yet" />}
          </div>
        </div>

        {/* Recently Added */}
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>
            <Icon name="add" size={16} color={palette.warmOrange} />
            Recently Added Activities
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentlyAdded.map((a) => (
              <div key={a.id} style={smallRowStyle}>
                <span style={{
                  width: '28px', height: '28px', borderRadius: '8px',
                  background: `${getTypeColor(a.gameType)}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  border: `1.5px solid ${getTypeColor(a.gameType)}30`,
                }}>
                  <Icon name={getTypeIconName(a.gameType)} size={14} color={getTypeColor(a.gameType)} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={smallRowTitleStyle}>{a.title}</div>
                  <div style={smallRowSubStyle}>
                    {a.teacherName || 'Unknown'} · {formatDate(a.createdAt)}
                  </div>
                </div>
              </div>
            ))}
            {recentlyAdded.length === 0 && <EmptyMini text="No activities yet" />}
          </div>
        </div>
      </div>

      {/* ====== FILTER BAR ====== */}
      <div style={cardStyle}>
        <div style={{
          display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center',
          marginBottom: '16px',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
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
              placeholder="Search title, PIN, teacher, category..."
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
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={selectStyle}
          >
            <option value="all">All Types</option>
            <option value="quiz">Quiz</option>
            <option value="match">Match</option>
            <option value="wordpics">Word Pics</option>
            <option value="guesswhat">Guess What</option>
            <option value="short-story">Short Story</option>
          </select>
          <select
            value={filterTeacher}
            onChange={(e) => setFilterTeacher(e.target.value)}
            style={selectStyle}
          >
            <option value="all">All Teachers</option>
            {teacherOptions.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            value={filterDateRange}
            onChange={(e) => setFilterDateRange(e.target.value)}
            style={selectStyle}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={selectStyle}
          >
            <option value="recent">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="mostPlayed">Sort: Most Played</option>
            <option value="leastPlayed">Sort: Least Played</option>
            <option value="titleAZ">Sort: Title A→Z</option>
            <option value="titleZA">Sort: Title Z→A</option>
          </select>
        </div>

        <div style={{
          fontSize: '12px', color: palette.bodyTextSoft, fontWeight: 700,
          marginBottom: '12px', fontFamily: FONT_BODY,
        }}>
          Showing <strong style={{ color: palette.warmOrange }}>{filtered.length}</strong> of {activities.length} activities
        </div>

        {/* ====== ACTIVITIES TABLE ====== */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONT_BODY, minWidth: '720px' }}>
            <thead>
              <tr style={{ borderBottom: `1.5px solid ${palette.border}` }}>
                <th style={thStyle}>Title</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Teacher</th>
                <th style={thStyle}>PIN</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Participants</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr
                  key={a.id}
                  className="super-admin-row"
                  style={{ borderBottom: `1.5px solid ${palette.borderSoft}` }}
                >
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        width: '28px', height: '28px', borderRadius: '8px',
                        background: `${getTypeColor(a.gameType)}15`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                        border: `1.5px solid ${getTypeColor(a.gameType)}30`,
                      }}>
                        <Icon name={getTypeIconName(a.gameType)} size={14} color={getTypeColor(a.gameType)} />
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{
                          fontWeight: 700, color: palette.deepNavy,
                          fontFamily: FONT_DISPLAY, fontSize: '13px',
                        }}>{a.title}</div>
                        <div style={{
                          fontSize: '11px', color: palette.bodyTextSoft,
                          fontWeight: 600,
                        }}>
                          {a.category || 'General'} · {a.totalQuestions || 0} Q
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={badgeStyle(getTypeColor(a.gameType))}>
                      {getTypeLabel(a.gameType)}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: palette.bodyText, fontWeight: 600, fontSize: '13px' }}>
                    {a.teacherName || '—'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      fontFamily: FONT_DISPLAY, fontWeight: 800,
                      color: getTypeColor(a.gameType), fontSize: '14px',
                      letterSpacing: '1px',
                    }}>
                      {a.gamePin || '—'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{
                      fontWeight: 800, color: palette.warmOrange,
                      fontFamily: FONT_DISPLAY, fontSize: '14px',
                    }}>
                      {a._participantCount}
                    </span>
                  </td>
                  <td style={{
                    padding: '12px', textAlign: 'right',
                    color: palette.bodyTextSoft, fontSize: '11px', fontWeight: 600,
                  }}>
                    {formatDate(a.createdAt)}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{
                    padding: '32px', textAlign: 'center',
                    color: palette.bodyTextSoft, fontSize: '13px', fontWeight: 600,
                  }}>
                    No activities match your filters
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

const smallRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '10px 12px',
  background: palette.creamSoft,
  borderRadius: '10px',
  border: `1.5px solid ${palette.border}`,
};

const smallRowTitleStyle = {
  fontSize: '13px',
  fontWeight: 700,
  color: palette.deepNavy,
  fontFamily: FONT_BODY,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const smallRowSubStyle = {
  fontSize: '11px',
  color: palette.bodyTextSoft,
  fontWeight: 600,
  marginTop: '2px',
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

const EmptyMini = ({ text }) => (
  <div style={{
    padding: '20px',
    textAlign: 'center',
    color: palette.bodyTextSoft,
    fontSize: '12px',
    fontWeight: 600,
  }}>{text}</div>
);

export default SuperAdminActivities;

