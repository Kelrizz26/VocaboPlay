// src/components/admin/AdminLeaderboards.jsx
// ============================================================
// ✅ ADMIN LEADERBOARDS - Polished to match Super Admin
// Shows ONLY teacher's students (filtered by teacherId)
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import { db, auth } from '../../pages/firebase';
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc
} from 'firebase/firestore';
import { AVATAR_SHOP_ITEMS, DEFAULT_AVATAR_ID } from '../../data/avatarShop';

// ===== MUTED DASHBOARD PALETTE =====
const palette = {
  warmOrange: '#E9A075',
  warmOrangeShadow: '#C27E4F',
  coral: '#DB7A64',
  coralShadow: '#A95845',
  teal: '#4F9188',
  tealShadow: '#3A6A63',
  deepNavy: '#2A2845',
  bodyText: '#6B6880',
  bodyTextSoft: '#8A8799',
  cream: '#FDF9F3',
  creamSoft: '#F5EFE6',
  white: '#FFFFFF',
  border: '#EBE2D5',
  borderSoft: '#F2EBE0',
  softGreen: '#7FA574',
  softGreenShadow: '#5E7F55',
  gold: '#C9A227',
  shadow: 'rgba(42, 40, 69, 0.06)',
  shadowMd: 'rgba(42, 40, 69, 0.10)',
  danger: '#DB7A64',
  dangerShadow: '#A95845',
};

const FONT_DISPLAY = "'Fredoka', sans-serif";
const FONT_BODY = "'Nunito', sans-serif";

// ===== DUOTONE SVG ICONS =====
const Icon = ({ name, size = 18, color = palette.bodyTextSoft }) => {
  const icons = {
    trophy: (
      <>
        <path d="M6 4h12v4a6 6 0 01-12 0V4z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M6 8H4a2 2 0 002 2M18 8h2a2 2 0 01-2 2M9 18h6M10 21h4M12 14v4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
    book: (
      <>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    flame: (
      <path d="M12 2s4 5 4 9a4 4 0 0 1-8 0c0-1.5.5-2.5 1-3 0 0-2 1-2 4a5 5 0 0 0 10 0c0-4-5-10-5-10z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    ),
    game: (
      <>
        <path d="M6 12h4m-2-2v4m6-4h.01M17 12h.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M8 20h8a4 4 0 004-4V8a4 4 0 00-4-4H8a4 4 0 00-4 4v8a4 4 0 004 4z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none"/>
        <path d="M12 6v6l4 2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    alert: (
      <>
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none"/>
        <path d="M12 8v4M12 16h.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    trending: (
      <>
        <path d="M23 6l-9.5 9.5-5-5L1 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M17 6h6v6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', flexShrink: 0 }}>
      {icons[name] || icons.trophy}
    </svg>
  );
};

// ===== SHARED STYLE HELPERS =====
const summaryCardStyle = (color) => ({
  background: palette.white,
  padding: '16px 18px',
  borderRadius: '14px',
  boxShadow: `0 2px 0 ${palette.border}`,
  border: `1.5px solid ${palette.border}`,
  borderLeft: `4px solid ${color}`,
});

const summaryIconStyle = (color) => ({
  width: 28,
  height: 28,
  borderRadius: 8,
  background: `${color}15`,
  border: `1.5px solid ${color}30`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 8,
});

const summaryLabelStyle = {
  fontSize: '10px',
  fontWeight: 800,
  color: palette.bodyTextSoft,
  fontFamily: FONT_DISPLAY,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '4px',
};

const summaryValueStyle = (color) => ({
  fontSize: '22px',
  fontWeight: 800,
  color: color,
  fontFamily: FONT_DISPLAY,
  lineHeight: 1,
});

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

const selectFilterStyle = {
  padding: '9px 14px',
  border: `1.5px solid ${palette.border}`,
  borderRadius: '10px',
  fontSize: '13px',
  fontFamily: FONT_BODY,
  fontWeight: 700,
  background: palette.white,
  color: palette.deepNavy,
  cursor: 'pointer',
  outline: 'none',
};

// ✅ HELPER — Get avatar URL from the Avatar Shop
const getStudentAvatar = (student) => {
  if (!student) return AVATAR_SHOP_ITEMS[0]?.image || '';
  const avatarId = student.equippedAvatar || DEFAULT_AVATAR_ID;
  const found = AVATAR_SHOP_ITEMS.find(a => a.id === avatarId);
  return found?.image || AVATAR_SHOP_ITEMS[0]?.image || '';
};

// ✅ REUSABLE — Face-focused avatar
const StudentAvatar = ({ student, size = 40, borderRadius = '50%' }) => {
  const [imgError, setImgError] = useState(false);
  const avatarSrc = getStudentAvatar(student);

  if (!imgError && avatarSrc) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url(${avatarSrc})`,
          backgroundSize: '130%',
          backgroundPosition: 'center 20%',
          backgroundRepeat: 'no-repeat',
          borderRadius: borderRadius,
          display: 'block'
        }}
        aria-label={student.displayName}
      />
    );
  }

  return (
    <span style={{ color: palette.white, fontWeight: '800', fontSize: size * 0.4, fontFamily: FONT_DISPLAY }}>
      {student.displayName?.charAt(0)?.toUpperCase() || '?'}
    </span>
  );
};

const AdminLeaderboards = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLeaderboard, setSelectedLeaderboard] = useState('points');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // ✅ NEW: sort + date filter (matches SA pattern)
  const [sortBy, setSortBy] = useState('rank');
  const [dateFilter, setDateFilter] = useState('all');

  // ============================================================
  // ✅ GET VALUE PER CATEGORY
  // ============================================================
  const getValue = useCallback((student) => {
    const stats = student.progress || student.stats || {};
    switch (selectedLeaderboard) {
      case 'points': return stats.totalPoints || student.totalPoints || 0;
      case 'words': return stats.wordsLearned || student.wordsLearned || 0;
      case 'streak': return stats.longestStreak || stats.streak || student.currentStreak || 0;
      case 'games': return stats.gamesPlayed || student.gamesPlayed || 0;
      default: return stats.totalPoints || student.totalPoints || 0;
    }
  }, [selectedLeaderboard]);

  const getUnit = useCallback(() => {
    switch (selectedLeaderboard) {
      case 'points': return 'pts';
      case 'words': return 'words';
      case 'streak': return 'days';
      case 'games': return 'games';
      default: return 'pts';
    }
  }, [selectedLeaderboard]);

  // ============================================================
  // ✅ FETCH: Only students who joined the teacher's activities
  // ============================================================
  const fetchTeacherLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      // STEP 1: teacher data
      const teacherRef = doc(db, 'users', user.uid);
      const teacherDoc = await getDoc(teacherRef);
      const teacherData = teacherDoc.exists() ? teacherDoc.data() : {};

      // STEP 2: activities of the teacher
      const activitiesQuery = query(
        collection(db, 'activities'),
        where('teacherId', '==', user.uid)
      );
      const activitiesSnap = await getDocs(activitiesQuery);
      const activityIds = activitiesSnap.docs.map(d => d.id);

      if (activityIds.length === 0) {
        setLeaderboardData([]);
        setLoading(false);
        return;
      }

      // STEP 3: scores for teacher activities → student IDs
      const scoresSnap = await getDocs(collection(db, 'scores'));
      const studentIds = [];
      scoresSnap.forEach(d => {
        const s = d.data();
        if (activityIds.includes(s.activityId) && !studentIds.includes(s.studentId)) {
          studentIds.push(s.studentId);
        }
      });

      if (studentIds.length === 0) {
        setLeaderboardData([]);
        setLoading(false);
        return;
      }

      // STEP 4: student users in that set
      const usersSnap = await getDocs(collection(db, 'users'));
      const students = usersSnap.docs
        .map(d => {
          const data = d.data();
          if (data.role === 'student' && studentIds.includes(d.id)) {
            return {
              id: d.id,
              ...data,
              displayName: data.displayName || data.email?.split('@')[0] || 'Unknown',
              username: data.username || `@${(data.displayName || 'user').toLowerCase().replace(/\s/g, '')}`,
              email: data.email || 'No email',
              equippedAvatar: data.equippedAvatar || DEFAULT_AVATAR_ID,
              progress: data.progress || {},
              stats: data.progress || {},
              totalPoints: data.totalPoints || data.progress?.totalPoints || 0,
              currentStreak: data.currentStreak || data.progress?.streak || 0
            };
          }
          return null;
        })
        .filter(s => s !== null);

      // STEP 5: sort by selected category
      students.sort((a, b) => getValue(b) - getValue(a));

      // STEP 6: add rank
      students.forEach((s, i) => { s.rank = i + 1; });

      setLeaderboardData(students);
      console.log(`✅ Loaded ${students.length} students for teacher ${user.uid}`);
    } catch (err) {
      console.error('❌ Error fetching admin leaderboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getValue]);

  useEffect(() => {
    fetchTeacherLeaderboard();
  }, [fetchTeacherLeaderboard]);

  // ============================================================
  // ✅ RE-SORT when category changes
  // ============================================================
  useEffect(() => {
    if (leaderboardData.length > 0) {
      const sorted = [...leaderboardData].sort((a, b) => getValue(b) - getValue(a));
      sorted.forEach((s, i) => { s.rank = i + 1; });
      setLeaderboardData(sorted);
    }
  }, [selectedLeaderboard, getValue]);

  // ============================================================
  // ✅ FETCH PROFILE FOR MODAL
  // ============================================================
  const fetchUserProfile = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        setSelectedProfile({
          id: userId,
          displayName: data.displayName || 'Anonymous',
          username: data.username || `@${(data.displayName || 'user').toLowerCase().replace(/\s/g, '')}`,
          email: data.email || 'No email',
          bio: data.bio || 'No bio yet',
          equippedAvatar: data.equippedAvatar || DEFAULT_AVATAR_ID,
          progress: data.progress || {},
          stats: data.progress || {},
          totalPoints: data.totalPoints || 0
        });
        setShowProfileModal(true);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  // ============================================================
  // ✅ LEADERBOARD CATEGORIES
  // ============================================================
  const leaderboardTypes = [
    { id: 'points', label: 'Total Points',   icon: 'star',   color: palette.warmOrange, bg: `${palette.warmOrange}15` },
    { id: 'words',  label: 'Words Learned',  icon: 'book',   color: palette.softGreen,  bg: `${palette.softGreen}15` },
    { id: 'streak', label: 'Longest Streak', icon: 'flame',  color: palette.gold,       bg: `${palette.gold}15` },
    { id: 'games',  label: 'Games Played',   icon: 'game',   color: palette.coral,      bg: `${palette.coral}15` },
  ];

  const currentType = leaderboardTypes.find(t => t.id === selectedLeaderboard) || leaderboardTypes[0];

  // ============================================================
  // ✅ FILTERED + SORTED TABLE (for the sort/date dropdowns)
  // ============================================================
  const visibleRows = React.useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const daysAgo = (days) => { const d = new Date(now); d.setDate(d.getDate() - days); return d; };
    const threshold =
      dateFilter === 'today' ? startOfToday :
      dateFilter === 'week' ? daysAgo(7) :
      dateFilter === 'month' ? daysAgo(30) :
      dateFilter === 'year' ? daysAgo(365) : null;

    let result = leaderboardData.filter(s => {
      if (threshold) {
        const t = s.createdAt || s.joinDate || s._registered;
        if (!t || new Date(t) < threshold) return false;
      }
      return true;
    });

    switch (sortBy) {
      case 'rank': result.sort((a, b) => a.rank - b.rank); break;
      case 'value': result.sort((a, b) => getValue(b) - getValue(a)); break;
      case 'nameAZ': result.sort((a, b) => (a.displayName || '').toLowerCase().localeCompare((b.displayName || '').toLowerCase())); break;
      case 'nameZA': result.sort((a, b) => (b.displayName || '').toLowerCase().localeCompare((a.displayName || '').toLowerCase())); break;
      default: break;
    }

    return result;
  }, [leaderboardData, dateFilter, sortBy, getValue]);

  // ============================================================
  // ✅ SUMMARY (for tiles)
  // ============================================================
  const summary = React.useMemo(() => {
    if (leaderboardData.length === 0) return { top: 0, avg: 0, active: 0, low: 0 };
    const values = leaderboardData.map(getValue);
    const top = Math.max(...values);
    const low = Math.min(...values);
    const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
    const now = new Date();
    const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
    const active = leaderboardData.filter(s => {
      const t = s.lastActive || s.updatedAt;
      return t && new Date(t) >= weekAgo;
    }).length;
    return { top, avg, active, low };
  }, [leaderboardData, getValue]);

  // ============================================================
  // ✅ RENDER
  // ============================================================
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ===== HEADER BAR ===== */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '16px 20px',
        background: palette.white,
        borderRadius: '14px',
        border: `1.5px solid ${palette.border}`,
        boxShadow: `0 2px 0 ${palette.border}`,
      }}>
        <div>
          <h2 style={{
            margin: 0,
            fontFamily: FONT_DISPLAY,
            color: palette.deepNavy,
            fontWeight: 800,
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            letterSpacing: '-0.2px',
          }}>
            <Icon name="trophy" size={18} color={palette.gold} />
            Class Leaderboard
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: palette.bodyTextSoft, fontWeight: 600 }}>
            Rankings of your students — only those who joined your activities
          </p>
        </div>
        <span style={{
          fontSize: '12px',
          color: palette.bodyTextSoft,
          background: palette.creamSoft,
          padding: '8px 14px',
          borderRadius: '999px',
          border: `1.5px solid ${palette.border}`,
          fontFamily: FONT_BODY,
          fontWeight: 700,
        }}>
          {leaderboardData.length} Student{leaderboardData.length !== 1 ? 's' : ''} Enrolled
        </span>
      </div>

      {/* ===== CATEGORY TABS ===== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '10px',
      }}>
        {leaderboardTypes.map(type => {
          const active = selectedLeaderboard === type.id;
          return (
            <button
              key={type.id}
              onClick={() => setSelectedLeaderboard(type.id)}
              style={{
                background: active ? type.color : palette.white,
                border: `1.5px solid ${active ? type.color : palette.border}`,
                borderRadius: '12px',
                padding: '12px 14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: active ? `0 3px 0 ${type.color}AA` : `0 2px 0 ${palette.border}`,
                fontFamily: FONT_BODY,
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: active ? 'rgba(255,255,255,0.22)' : type.bg,
                border: active ? '1.5px solid rgba(255,255,255,0.35)' : `1.5px solid ${type.color}30`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon name={type.icon} size={16} color={active ? palette.white : type.color} />
              </div>
              <div style={{
                fontSize: '12px',
                fontWeight: 800,
                color: active ? palette.white : palette.deepNavy,
                fontFamily: FONT_DISPLAY,
                letterSpacing: '0.02em',
                textAlign: 'left',
              }}>{type.label}</div>
            </button>
          );
        })}
      </div>

      {/* ===== SUMMARY TILES (visible when we have data) ===== */}
      {leaderboardData.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
        }}>
          <div style={summaryCardStyle(palette.gold)}>
            <div style={summaryIconStyle(palette.gold)}>
              <Icon name="trophy" size={14} color={palette.gold} />
            </div>
            <div style={summaryLabelStyle}>Top Score</div>
            <div style={summaryValueStyle(palette.gold)}>{summary.top.toLocaleString()}</div>
          </div>
          <div style={summaryCardStyle(palette.warmOrange)}>
            <div style={summaryIconStyle(palette.warmOrange)}>
              <Icon name="trending" size={14} color={palette.warmOrange} />
            </div>
            <div style={summaryLabelStyle}>Class Average</div>
            <div style={summaryValueStyle(palette.warmOrange)}>{summary.avg}</div>
          </div>
          <div style={summaryCardStyle(palette.softGreen)}>
            <div style={summaryIconStyle(palette.softGreen)}>
              <Icon name="flame" size={14} color={palette.softGreen} />
            </div>
            <div style={summaryLabelStyle}>Active This Week</div>
            <div style={summaryValueStyle(palette.softGreen)}>{summary.active}</div>
          </div>
          <div style={summaryCardStyle(palette.coral)}>
            <div style={summaryIconStyle(palette.coral)}>
              <Icon name="alert" size={14} color={palette.coral} />
            </div>
            <div style={summaryLabelStyle}>Lowest Score</div>
            <div style={summaryValueStyle(palette.coral)}>{summary.low.toLocaleString()}</div>
          </div>
        </div>
      )}

      {/* ===== LOADING ===== */}
      {loading ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 20px',
          background: palette.white,
          borderRadius: '16px',
          border: `1.5px solid ${palette.border}`,
          boxShadow: `0 2px 0 ${palette.border}`,
          color: palette.bodyTextSoft,
          fontFamily: FONT_BODY,
          fontWeight: 600,
          fontSize: '13px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <Icon name="clock" size={32} color={palette.warmOrange} />
          </div>
          Loading your class leaderboard...
        </div>
      ) : error ? (
        <div style={{
          textAlign: 'center',
          padding: '32px 20px',
          background: `${palette.danger}12`,
          border: `1.5px solid ${palette.danger}40`,
          borderRadius: '16px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <Icon name="alert" size={32} color={palette.danger} />
          </div>
          <div style={{ fontSize: '14px', color: palette.danger, marginBottom: '16px', fontWeight: 700 }}>{error}</div>
          <button
            onClick={fetchTeacherLeaderboard}
            style={{
              padding: '10px 20px',
              background: palette.danger,
              color: palette.white,
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              fontSize: '12px',
              boxShadow: `0 3px 0 ${palette.dangerShadow}`,
            }}
          >Retry</button>
        </div>
      ) : leaderboardData.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: palette.white,
          borderRadius: '16px',
          border: `1.5px dashed ${palette.border}`,
        }}>
          <div style={{
            display: 'inline-flex',
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: palette.creamSoft,
            border: `1.5px solid ${palette.border}`,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}>
            <Icon name="trophy" size={32} color={palette.gold} />
          </div>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 800,
            color: palette.deepNavy,
            marginBottom: '6px',
            fontFamily: FONT_DISPLAY,
            letterSpacing: '-0.2px',
          }}>No students yet</h3>
          <p style={{
            fontSize: '13px',
            color: palette.bodyTextSoft,
            margin: 0,
            fontFamily: FONT_BODY,
            fontWeight: 600,
            maxWidth: '420px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.6,
          }}>
            Once a student joins your activities, they will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* ===== PODIUM ===== */}
          {leaderboardData.length >= 3 && (
            <div style={{
              background: palette.white,
              padding: '24px 20px',
              borderRadius: '16px',
              border: `1.5px solid ${palette.border}`,
              boxShadow: `0 2px 0 ${palette.border}`,
            }}>
              <h3 style={{
                margin: '0 0 20px 0',
                fontFamily: FONT_DISPLAY,
                color: palette.deepNavy,
                fontWeight: 800,
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                letterSpacing: '-0.2px',
              }}>
                <Icon name="trophy" size={16} color={palette.gold} />
                Top Performers
              </h3>

              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                gap: '16px',
                flexWrap: 'wrap',
              }}>
                {/* 2nd Place */}
                {leaderboardData[1] && (
                  <div
                    onClick={() => fetchUserProfile(leaderboardData[1].id)}
                    style={{ textAlign: 'center', cursor: 'pointer' }}
                  >
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      background: palette.creamSoft,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 8px',
                      border: '3px solid #a0a0a0',
                      position: 'relative',
                      boxShadow: `0 6px 16px ${palette.shadowMd}`,
                    }}>
                      <StudentAvatar student={leaderboardData[1]} />
                      <div style={{
                        position: 'absolute',
                        top: -4,
                        right: -4,
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: '#a0a0a0',
                        color: palette.white,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '13px',
                        fontWeight: 800,
                        border: `2px solid ${palette.white}`,
                        fontFamily: FONT_DISPLAY,
                      }}>2</div>
                    </div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 800,
                      color: palette.deepNavy,
                      marginBottom: '4px',
                      fontFamily: FONT_DISPLAY,
                    }}>{leaderboardData[1].displayName}</div>
                    <div style={{
                      fontSize: '12px',
                      color: palette.bodyTextSoft,
                      background: palette.creamSoft,
                      padding: '3px 10px',
                      borderRadius: '999px',
                      display: 'inline-block',
                      fontFamily: FONT_DISPLAY,
                      fontWeight: 800,
                      border: `1.5px solid ${palette.border}`,
                    }}>{getValue(leaderboardData[1])} {getUnit()}</div>
                  </div>
                )}

                {/* 1st Place */}
                {leaderboardData[0] && (
                  <div
                    onClick={() => fetchUserProfile(leaderboardData[0].id)}
                    style={{ textAlign: 'center', transform: 'scale(1.08)', zIndex: 2, cursor: 'pointer' }}
                  >
                    <div style={{
                      width: '96px',
                      height: '96px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      background: palette.creamSoft,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 8px',
                      border: `3px solid ${palette.gold}`,
                      position: 'relative',
                      boxShadow: `0 8px 20px ${palette.gold}40`,
                    }}>
                      <StudentAvatar student={leaderboardData[0]} />
                      <div style={{
                        position: 'absolute',
                        top: -4,
                        right: -4,
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        background: palette.gold,
                        color: palette.white,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '15px',
                        fontWeight: 800,
                        border: `2px solid ${palette.white}`,
                        fontFamily: FONT_DISPLAY,
                      }}>1</div>
                    </div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: 800,
                      color: palette.deepNavy,
                      marginBottom: '4px',
                      fontFamily: FONT_DISPLAY,
                    }}>{leaderboardData[0].displayName}</div>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: 800,
                      color: palette.warmOrange,
                      background: `${palette.warmOrange}15`,
                      padding: '4px 12px',
                      borderRadius: '999px',
                      display: 'inline-block',
                      fontFamily: FONT_DISPLAY,
                      border: `1.5px solid ${palette.warmOrange}40`,
                    }}>{getValue(leaderboardData[0])} {getUnit()}</div>
                  </div>
                )}

                {/* 3rd Place */}
                {leaderboardData[2] && (
                  <div
                    onClick={() => fetchUserProfile(leaderboardData[2].id)}
                    style={{ textAlign: 'center', cursor: 'pointer' }}
                  >
                    <div style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      background: palette.creamSoft,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 8px',
                      border: '3px solid #b08d6b',
                      position: 'relative',
                      boxShadow: `0 6px 16px ${palette.shadowMd}`,
                    }}>
                      <StudentAvatar student={leaderboardData[2]} />
                      <div style={{
                        position: 'absolute',
                        top: -4,
                        right: -4,
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: '#b08d6b',
                        color: palette.white,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 800,
                        border: `2px solid ${palette.white}`,
                        fontFamily: FONT_DISPLAY,
                      }}>3</div>
                    </div>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: 800,
                      color: palette.deepNavy,
                      marginBottom: '4px',
                      fontFamily: FONT_DISPLAY,
                    }}>{leaderboardData[2].displayName}</div>
                    <div style={{
                      fontSize: '12px',
                      color: palette.bodyTextSoft,
                      background: palette.creamSoft,
                      padding: '3px 10px',
                      borderRadius: '999px',
                      display: 'inline-block',
                      fontFamily: FONT_DISPLAY,
                      fontWeight: 800,
                      border: `1.5px solid ${palette.border}`,
                    }}>{getValue(leaderboardData[2])} {getUnit()}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== TABLE CARD ===== */}
          <div style={{
            background: palette.white,
            padding: '24px',
            borderRadius: '16px',
            boxShadow: `0 2px 0 ${palette.border}`,
            border: `1.5px solid ${palette.border}`,
          }}>
            {/* Card header + filters */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '18px',
            }}>
              <h3 style={{
                margin: 0,
                fontFamily: FONT_DISPLAY,
                color: palette.deepNavy,
                fontWeight: 800,
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                letterSpacing: '-0.2px',
              }}>
                <Icon name={currentType.icon} size={16} color={currentType.color} />
                {currentType.label} Ranking
                <span style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  color: currentType.color,
                  background: `${currentType.color}15`,
                  padding: '3px 10px',
                  borderRadius: '999px',
                  border: `1px solid ${currentType.color}40`,
                  fontFamily: FONT_DISPLAY,
                  marginLeft: '4px',
                }}>
                  {visibleRows.length}
                </span>
              </h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <select value={dateFilter} onChange={e => setDateFilter(e.target.value)} style={selectFilterStyle}>
                  <option value="all">All Time</option>
                  <option value="today">Registered Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="year">Last Year</option>
                </select>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={selectFilterStyle}>
                  <option value="rank">Sort: By Rank</option>
                  <option value="value">Sort: By Score</option>
                  <option value="nameAZ">Sort: Name A→Z</option>
                  <option value="nameZA">Sort: Name Z→A</option>
                </select>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontFamily: FONT_BODY,
                minWidth: '600px'
              }}>
                <thead>
                  <tr style={{ borderBottom: `1.5px solid ${palette.border}` }}>
                    <th style={{ ...thStyle, textAlign: 'left', width: '80px' }}>Rank</th>
                    <th style={thStyle}>Student</th>
                    <th style={thStyle}>Email</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Level</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>{currentType.label}</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((student) => (
                    <tr
                      key={student.id}
                      onClick={() => fetchUserProfile(student.id)}
                      style={{
                        borderBottom: `1.5px solid ${palette.borderSoft}`,
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseOver={e => e.currentTarget.style.background = palette.creamSoft}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: student.rank === 1 ? `palette.gold15`:student.rank===2?palette.creamSoft:student.rank===3?`{palette.coral}15` : 'transparent',
                          border: student.rank <= 3 ? `1.5px solid ${student.rank === 1 ? `${palette.gold}40` : student.rank === 2 ? palette.border : `${palette.coral}30`}` : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: student.rank === 1 ? palette.gold : student.rank === 2 ? palette.bodyText : student.rank === 3 ? palette.coral : palette.bodyTextSoft,
                          fontWeight: 800,
                          fontSize: '13px',
                          fontFamily: FONT_DISPLAY,
                        }}>
                          {student.rank <= 3 ? student.rank : `#${student.rank}`}
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            background: palette.creamSoft,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            border: `1.5px solid ${palette.border}`,
                          }}>
                            <StudentAvatar student={student} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{
                              fontSize: '13px',
                              fontWeight: 800,
                              color: palette.deepNavy,
                              fontFamily: FONT_DISPLAY,
                            }}>{student.displayName}</div>
                            <div style={{
                              fontSize: '11px',
                              color: palette.bodyTextSoft,
                              fontFamily: FONT_BODY,
                              fontWeight: 600,
                              marginTop: '2px',
                            }}>{student.username}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px', color: palette.bodyText, fontSize: '13px', fontFamily: FONT_BODY, fontWeight: 600 }}>{student.email}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: 800,
                          background: palette.creamSoft,
                          color: palette.bodyText,
                          fontFamily: FONT_DISPLAY,
                          border: `1.5px solid ${palette.border}`,
                        }}>
                          Lv {student.progress?.level || 1}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <span style={{
                          fontSize: '15px',
                          fontWeight: 800,
                          color: currentType.color,
                          fontFamily: FONT_DISPLAY,
                        }}>{getValue(student).toLocaleString()}</span>
                        <span style={{
                          fontSize: '11px',
                          color: palette.bodyTextSoft,
                          marginLeft: '4px',
                          fontFamily: FONT_BODY,
                          fontWeight: 600,
                        }}>{getUnit()}</span>
                      </td>
                    </tr>
                  ))}
                  {visibleRows.length === 0 && leaderboardData.length > 0 && (
                    <tr>
                      <td colSpan={5} style={{
                        padding: '32px',
                        textAlign: 'center',
                        color: palette.bodyTextSoft,
                        fontWeight: 600,
                        fontSize: '13px',
                      }}>
                        No students match your filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer stats */}
            {leaderboardData.length > 0 && (
              <div style={{
                marginTop: '20px',
                padding: '14px 18px',
                background: palette.creamSoft,
                borderRadius: '12px',
                border: `1.5px solid ${palette.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
                fontSize: '12px',
                color: palette.bodyTextSoft,
                fontFamily: FONT_BODY,
                fontWeight: 700,
              }}>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Icon name="trophy" size={12} color={palette.gold} />
                    Top: {leaderboardData[0] ? getValue(leaderboardData[0]).toLocaleString() : 0} {getUnit()}
                  </span>
                  <span>Average: {summary.avg} {getUnit()}</span>
                </div>
                <span style={{ color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>Live • Updated just now</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* ===== PROFILE MODAL ===== */}
      {showProfileModal && selectedProfile && (
        <div
          onClick={() => setShowProfileModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(42, 40, 69, 0.55)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: palette.white,
              borderRadius: '20px',
              maxWidth: '480px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              fontFamily: FONT_BODY,
              border: `1.5px solid ${palette.border}`,
              boxShadow: `0 2px 0 ${palette.border}, 0 20px 50px rgba(42, 40, 69, 0.3)`,
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                overflow: 'hidden',
                background: palette.creamSoft,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                border: `3px solid ${palette.warmOrange}40`,
              }}>
                <StudentAvatar student={selectedProfile} />
              </div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 800,
                color: palette.deepNavy,
                margin: '0 0 4px',
                fontFamily: FONT_DISPLAY,
                letterSpacing: '-0.2px',
              }}>{selectedProfile.displayName}</h2>
              <p style={{
                fontSize: '13px',
                color: palette.bodyTextSoft,
                margin: 0,
                fontWeight: 600,
              }}>{selectedProfile.email}</p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
            }}>
              {[
                { label: 'Words Learned', value: selectedProfile.progress?.wordsLearned || 0, color: palette.softGreen },
                { label: 'Games Played', value: selectedProfile.progress?.gamesPlayed || 0, color: palette.coral },
                { label: 'Streak', value: selectedProfile.progress?.streak || 0, color: palette.gold },
                { label: 'Total Points', value: selectedProfile.totalPoints || selectedProfile.progress?.totalPoints || 0, color: palette.warmOrange },
              ].map((stat, i) => (
                <div key={i} style={{
                  background: `${stat.color}15`,
                  padding: '14px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  border: `1.5px solid ${stat.color}30`,
                }}>
                  <div style={{
                    fontSize: '22px',
                    fontWeight: 800,
                    color: stat.color,
                    fontFamily: FONT_DISPLAY,
                    lineHeight: 1.1,
                  }}>{stat.value}</div>
                  <div style={{
                    fontSize: '11px',
                    color: stat.color,
                    marginTop: '4px',
                    fontWeight: 800,
                    fontFamily: FONT_DISPLAY,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowProfileModal(false)}
              style={{
                width: '100%',
                padding: '12px',
                background: palette.warmOrange,
                color: palette.white,
                border: 'none',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: FONT_DISPLAY,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                boxShadow: `0 3px 0 ${palette.warmOrangeShadow}`,
                marginTop: '20px',
              }}
            >Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLeaderboards;


