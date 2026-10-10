// src/components/admin/AdminStudents.jsx
// ============================================================
// ✅ ADMIN STUDENTS - Polished to match Super Admin
// ✅ CONNECTED TO AVATAR SHOP — FACE FOCUS
// ============================================================

import React, { useState, useMemo } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../pages/firebase';
import ModalWrapper from './ModalWrapper';
import ConfirmDialog from './ConfirmDialog';
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

// ===== LOCAL STYLE HELPERS =====
const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  border: `1.5px solid ${palette.border}`,
  borderRadius: '10px',
  fontSize: '13px',
  fontFamily: FONT_BODY,
  fontWeight: 600,
  boxSizing: 'border-box',
  color: palette.deepNavy,
  outline: 'none',
  background: palette.creamSoft,
};

const labelStyle = {
  fontSize: '11px',
  fontWeight: 800,
  color: palette.bodyTextSoft,
  display: 'block',
  marginBottom: '6px',
  fontFamily: FONT_DISPLAY,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
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

const countBadgeStyle = (color, active) => ({
  display: 'inline-block',
  padding: '4px 12px',
  borderRadius: '999px',
  fontSize: '12px',
  fontWeight: 800,
  fontFamily: FONT_DISPLAY,
  background: active ? `${color}15` : palette.creamSoft,
  color: active ? color : palette.bodyTextSoft,
  border: `1px solid ${active ? color + '40' : palette.border}`,
  minWidth: '32px',
  textAlign: 'center',
});

// ===== DUOTONE SVG ICONS =====
const Icon = ({ name, size = 18, color = palette.bodyTextSoft }) => {
  const icons = {
    users: (
      <>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="9" cy="7" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2" fill="none"/>
        <path d="M21 21l-4.35-4.35" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    close: <path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
    edit: (
      <>
        <path d="M12 20h9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    chart: <path d="M18 20V10M12 20V4M6 20v-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
    trash: (
      <>
        <path d="M3 6h18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none"/>
        <path d="M12 6v6l4 2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    flame: (
      <path d="M12 2s4 5 4 9a4 4 0 0 1-8 0c0-1.5.5-2.5 1-3 0 0-2 1-2 4a5 5 0 0 0 10 0c0-4-5-10-5-10z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    ),
    zap: (
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    ),
    plus: <path d="M12 5v14M5 12h14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
    target: (
      <>
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none"/>
        <circle cx="12" cy="12" r="6" stroke={color} strokeWidth="2" fill="none"/>
        <circle cx="12" cy="12" r="2" stroke={color} strokeWidth="2" fill="none"/>
      </>
    ),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', flexShrink: 0 }}>
      {icons[name] || icons.users}
    </svg>
  );
};

// ✅ HELPER — Get the avatar image from the Avatar Shop
const getStudentAvatar = (student) => {
  if (!student) return AVATAR_SHOP_ITEMS[0]?.image || '';
  const avatarId = student.equippedAvatar || DEFAULT_AVATAR_ID;
  const found = AVATAR_SHOP_ITEMS.find(a => a.id === avatarId);
  return found?.image || AVATAR_SHOP_ITEMS[0]?.image || '';
};

// ✅ REUSABLE — StudentAvatar (FACE FOCUS)
const StudentAvatar = ({ student, fontSize = 14 }) => {
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
          backgroundColor: 'transparent',
          display: 'block'
        }}
        onError={() => setImgError(true)}
        aria-label={student.displayName}
      />
    );
  }

  return (
    <span style={{ color: palette.white, fontWeight: '800', fontSize, fontFamily: FONT_DISPLAY }}>
      {student.displayName?.charAt(0)?.toUpperCase() || '?'}
    </span>
  );
};

const AdminStudents = ({ students, setStudents, loading, calculateAvgScore }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelected] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editForm, setEditForm] = useState({ displayName: '', email: '' });
  const [newStudent, setNewStudent] = useState({ displayName: '', email: '', username: '' });
  const [confirmAction, setConfirmAction] = useState(null);

  // ✅ NEW: date filter + sort (matches Super Admin pattern)
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // ===== SUMMARY (matches Super Admin Student tab) =====
  const summary = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(now); monthAgo.setDate(monthAgo.getDate() - 30);

    const activeThisWeek = students.filter(s => {
      const t = s.lastActive || s.progress?.lastActive;
      return t && new Date(t) >= weekAgo;
    }).length;

    const newThisMonth = students.filter(s => {
      const t = s.createdAt || s.joinDate;
      return t && new Date(t) >= monthAgo;
    }).length;

    const totalPoints = students.reduce((sum, s) => sum + (s.progress?.totalPoints || s.totalPoints || 0), 0);
    const avgPoints = students.length > 0 ? (totalPoints / students.length).toFixed(1) : '0.0';

    return { total: students.length, activeThisWeek, newThisMonth, avgPoints };
  }, [students]);

  // ===== FILTERED + SORTED =====
  const filtered = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const daysAgo = (days) => { const d = new Date(now); d.setDate(d.getDate() - days); return d; };
    const threshold =
      dateFilter === 'today' ? startOfToday :
      dateFilter === 'week' ? daysAgo(7) :
      dateFilter === 'month' ? daysAgo(30) :
      dateFilter === 'year' ? daysAgo(365) : null;

    let result = students.filter(s => {
      const q = searchTerm.toLowerCase();
      if (searchTerm) {
        const matchName = s.displayName?.toLowerCase().includes(q);
        const matchEmail = s.email?.toLowerCase().includes(q);
        if (!matchName && !matchEmail) return false;
      }
      if (threshold) {
        const created = s.createdAt || s.joinDate;
        if (!created || new Date(created) < threshold) return false;
      }
      return true;
    });

    switch (sortBy) {
      case 'points': result.sort((a, b) => (b.progress?.totalPoints || b.totalPoints || 0) - (a.progress?.totalPoints || a.totalPoints || 0)); break;
      case 'games': result.sort((a, b) => (b.progress?.gamesPlayed || 0) - (a.progress?.gamesPlayed || 0)); break;
      case 'words': result.sort((a, b) => (b.progress?.wordsLearned || 0) - (a.progress?.wordsLearned || 0)); break;
      case 'accuracy': result.sort((a, b) => (b.avgScore || 0) - (a.avgScore || 0)); break;
      case 'newest': result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)); break;
      case 'oldest': result.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)); break;
      case 'nameAZ': result.sort((a, b) => (a.displayName || a.email || '').toLowerCase().localeCompare((b.displayName || b.email || '').toLowerCase())); break;
      case 'nameZA': result.sort((a, b) => (b.displayName || b.email || '').toLowerCase().localeCompare((a.displayName || a.email || '').toLowerCase())); break;
      default: break;
    }

    return result;
  }, [students, searchTerm, dateFilter, sortBy]);

  // Add a new student to Firestore
  const addStudent = async () => {
    if (!newStudent.displayName || !newStudent.email) return alert('Fill in all fields.');

    try {
      const newStudentData = {
        displayName: newStudent.displayName,
        username: newStudent.username || newStudent.displayName.toLowerCase().replace(/\s+/g, ''),
        email: newStudent.email,
        equippedAvatar: DEFAULT_AVATAR_ID,
        ownedAvatars: AVATAR_SHOP_ITEMS.filter(a => a.price === 0).map(a => a.id),
        role: 'student',
        totalPoints: 0,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        progress: {
          level: 1,
          xp: 0,
          totalPoints: 0,
          streak: 0,
          gamesPlayed: 0,
          wordsLearned: 0,
          correctAnswers: 0,
          totalAnswers: 0,
          wordPics: { gamesPlayed: 0, gamesCompleted: 0, cardsViewed: 0, correctAnswers: 0, knownWords: [], totalScore: 0 },
          quiz: { gamesCompleted: 0, correctAnswers: 0, totalQuestions: 0, bestScore: 0 },
          match: { gamesCompleted: 0, totalPairs: 0, totalMoves: 0, bestTime: 0, bestMoves: 0, perfectGames: 0 },
          guessWhat: { gamesCompleted: 0, correctAnswers: 0, totalQuestions: 0, bestScore: 0 },
          sentenceBuilder: { gamesCompleted: 0, correctAnswers: 0, totalSentences: 0, bestScore: 0 },
          shortStory: { chaptersRead: 0, quizzesPassed: 0, storiesCompleted: 0 },
          achievements: {
            firstGame: false,
            perfectScore: false,
            threeDayStreak: false,
            tenWords: false,
            masterLearner: false,
            speedDemon: false,
            vocabularyMaster: false
          }
        },
        favorites: [],
        settings: {
          emailNotifications: true,
          darkMode: false,
          language: 'en'
        }
      };

      const docRef = await addDoc(collection(db, 'users'), newStudentData);
      setStudents([...students, {
        id: docRef.id,
        ...newStudentData,
        avgScore: 0,
        gamesPlayed: 0,
        joinDate: new Date().toISOString().split('T')[0]
      }]);
      setIsAdding(false);
      setNewStudent({ displayName: '', email: '', username: '' });
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Error adding student');
    }
  };

  // Update an existing student in Firestore
  const updateStudent = async () => {
    try {
      const studentRef = doc(db, 'users', selectedStudent.id);
      await updateDoc(studentRef, {
        displayName: editForm.displayName,
        email: editForm.email
      });

      setStudents(students.map(s =>
        s.id === selectedStudent.id
          ? { ...s, displayName: editForm.displayName, email: editForm.email }
          : s
      ));
      setIsEditing(false);
      setSelected(null);
    } catch (error) {
      console.error('Error updating student:', error);
      alert('Error updating student');
    }
  };

  // Delete a student from Firestore
  const deleteStudent = async (id) => {
    try {
      await deleteDoc(doc(db, 'users', id));
      setStudents(students.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Error deleting student');
    }
  };

  // Show confirmation dialog before deleting
  const requestDeleteStudent = (id) => {
    setConfirmAction({
      title: 'Remove Student',
      message: 'This will remove the student account. This cannot be undone.',
      confirmLabel: 'Remove',
      danger: true,
      onConfirm: () => { deleteStudent(id); setConfirmAction(null); },
    });
  };

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
            <Icon name="users" size={18} color={palette.warmOrange} />
            Student Management
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: palette.bodyTextSoft, fontWeight: 600 }}>
            Students who joined your activities
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          style={{
            padding: '10px 18px',
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
            transition: 'transform 0.1s ease, box-shadow 0.1s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(3px)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = `0 3px 0 ${palette.warmOrangeShadow}`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = `0 3px 0 ${palette.warmOrangeShadow}`;
          }}
        >
          <Icon name="plus" size={13} color={palette.white} />
          Add Student
        </button>
      </div>

      {/* ===== SUMMARY TILES ===== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
      }}>
        <div style={summaryCardStyle(palette.warmOrange)}>
          <div style={summaryIconStyle(palette.warmOrange)}>
            <Icon name="users" size={14} color={palette.warmOrange} />
          </div>
          <div style={summaryLabelStyle}>Total Students</div>
          <div style={summaryValueStyle(palette.warmOrange)}>{summary.total}</div>
        </div>
        <div style={summaryCardStyle(palette.softGreen)}>
          <div style={summaryIconStyle(palette.softGreen)}>
            <Icon name="zap" size={14} color={palette.softGreen} />
          </div>
          <div style={summaryLabelStyle}>Active This Week</div>
          <div style={summaryValueStyle(palette.softGreen)}>{summary.activeThisWeek}</div>
        </div>
        <div style={summaryCardStyle(palette.teal)}>
          <div style={summaryIconStyle(palette.teal)}>
            <Icon name="chart" size={14} color={palette.teal} />
          </div>
          <div style={summaryLabelStyle}>New This Month</div>
          <div style={summaryValueStyle(palette.teal)}>{summary.newThisMonth}</div>
        </div>
        <div style={summaryCardStyle(palette.gold)}>
          <div style={summaryIconStyle(palette.gold)}>
            <Icon name="target" size={14} color={palette.gold} />
          </div>
          <div style={summaryLabelStyle}>Avg Points / Student</div>
          <div style={summaryValueStyle(palette.gold)}>{summary.avgPoints}</div>
        </div>
      </div>

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
            <Icon name="users" size={16} color={palette.warmOrange} />
            All Students
            <span style={{
              fontSize: '12px',
              fontWeight: 800,
              color: palette.warmOrange,
              background: `${palette.warmOrange}15`,
              padding: '3px 10px',
              borderRadius: '999px',
              border: `1px solid ${palette.warmOrange}40`,
              fontFamily: FONT_DISPLAY,
              marginLeft: '4px',
            }}>
              {filtered.length}
            </span>
          </h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search name or email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  padding: '9px 12px 9px 32px',
                  border: `1.5px solid ${palette.border}`,
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontFamily: FONT_BODY,
                  fontWeight: 600,
                  background: palette.creamSoft,
                  color: palette.deepNavy,
                  outline: 'none',
                  width: '220px',
                }}
              />
              <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                <Icon name="search" size={13} color={palette.bodyTextSoft} />
              </div>
            </div>
            <select value={dateFilter} onChange={e => setDateFilter(e.target.value)} style={selectFilterStyle}>
              <option value="all">All Time</option>
              <option value="today">Registered Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={selectFilterStyle}>
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="points">Sort: Most Points</option>
              <option value="games">Sort: Most Games</option>
              <option value="words">Sort: Most Words</option>
              <option value="accuracy">Sort: Highest Accuracy</option>
              <option value="nameAZ">Sort: Name A→Z</option>
              <option value="nameZA">Sort: Name Z→A</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading.students ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 20px',
            color: palette.bodyTextSoft,
            fontFamily: FONT_BODY,
            fontWeight: 600,
            fontSize: '13px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <Icon name="clock" size={32} color={palette.warmOrange} />
            </div>
            Loading students...
          </div>
        ) : students.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{
              display: 'inline-flex',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: palette.creamSoft,
              border: `1.5px solid ${palette.border}`,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px',
            }}>
              <Icon name="users" size={28} color={palette.warmOrange} />
            </div>
            <h3 style={{
              fontSize: '16px',
              color: palette.deepNavy,
              marginBottom: '6px',
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
            }}>No Students Yet</h3>
            <p style={{
              fontSize: '13px',
              color: palette.bodyTextSoft,
              margin: 0,
              fontFamily: FONT_BODY,
              fontWeight: 600,
            }}>
              Students will appear here once they join your live activities.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: FONT_BODY,
              minWidth: '900px',
            }}>
              <thead>
                <tr style={{ borderBottom: `1.5px solid ${palette.border}` }}>
                  <th style={thStyle}>Student</th>
                  <th style={thStyle}>Email</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Avg Score</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Games</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Words</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Streak</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Join Date</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(student => (
                  <tr
                    key={student.id}
                    style={{
                      borderBottom: `1.5px solid ${palette.borderSoft}`,
                      transition: 'background 0.15s ease',
                    }}
                    onMouseOver={e => e.currentTarget.style.background = palette.creamSoft}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
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
                          <StudentAvatar student={student} fontSize={14} />
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
                            fontWeight: 600,
                            marginTop: '2px',
                          }}>Level {student.progress?.level || 1}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{
                      padding: '12px',
                      fontSize: '13px',
                      color: palette.bodyText,
                      fontWeight: 600,
                    }}>{student.email}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={countBadgeStyle(
                        student.avgScore >= 80 ? palette.softGreen : student.avgScore >= 40 ? palette.gold : palette.danger,
                        student.avgScore > 0
                      )}>
                        {student.avgScore}%
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={countBadgeStyle(palette.teal, (student.progress?.gamesPlayed || 0) > 0)}>
                        {student.progress?.gamesPlayed || 0}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={countBadgeStyle(palette.softGreen, (student.progress?.wordsLearned || 0) > 0)}>
                        {student.progress?.wordsLearned || 0}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '13px',
                        fontWeight: 800,
                        fontFamily: FONT_DISPLAY,
                        color: (student.progress?.streak || 0) > 0 ? palette.gold : palette.bodyTextSoft,
                      }}>
                        <Icon name="flame" size={12} color={(student.progress?.streak || 0) > 0 ? palette.gold : palette.bodyTextSoft} />
                        {student.progress?.streak || 0}
                      </span>
                    </td>
                    <td style={{
                      padding: '12px',
                      textAlign: 'right',
                      fontSize: '11px',
                      color: palette.bodyTextSoft,
                      fontWeight: 600,
                    }}>{student.joinDate}</td>
                    <td style={{ padding: '12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => { setSelected(student); setEditForm({ displayName: student.displayName, email: student.email }); setIsEditing(true); }}
                        style={{
                          padding: '6px 12px',
                          background: palette.white,
                          border: `1.5px solid ${palette.border}`,
                          borderRadius: '8px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          marginRight: '6px',
                          color: palette.bodyText,
                          fontWeight: 800,
                          fontFamily: FONT_DISPLAY,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          boxShadow: `0 2px 0 ${palette.border}`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Icon name="edit" size={10} color={palette.bodyText} />
                        Edit
                      </button>
                      <button
                        onClick={() => setSelected(student)}
                        style={{
                          padding: '6px 12px',
                          background: `${palette.softGreen}15`,
                          border: `1.5px solid ${palette.softGreen}40`,
                          borderRadius: '8px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          marginRight: '6px',
                          color: palette.softGreen,
                          fontWeight: 800,
                          fontFamily: FONT_DISPLAY,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          boxShadow: `0 2px 0 ${palette.softGreen}20`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Icon name="chart" size={10} color={palette.softGreen} />
                        Progress
                      </button>
                      <button
                        onClick={() => requestDeleteStudent(student.id)}
                        style={{
                          padding: '6px 12px',
                          background: `${palette.danger}12`,
                          color: palette.danger,
                          border: `1.5px solid ${palette.danger}40`,
                          borderRadius: '8px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          fontWeight: 800,
                          fontFamily: FONT_DISPLAY,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          boxShadow: `0 2px 0 ${palette.danger}20`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Icon name="trash" size={10} color={palette.danger} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && students.length > 0 && (
                  <tr>
                    <td colSpan={8} style={{
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
        )}
      </div>

      {/* Add Student Modal */}
      {isAdding && (
        <ModalWrapper onClose={() => setIsAdding(false)}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 800,
            marginBottom: '20px',
            color: palette.deepNavy,
            fontFamily: FONT_DISPLAY,
            letterSpacing: '-0.2px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <Icon name="plus" size={18} color={palette.warmOrange} />
            Add New Student
          </h2>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Display Name *</label>
            <input
              type="text"
              value={newStudent.displayName}
              onChange={e => setNewStudent({ ...newStudent, displayName: e.target.value })}
              placeholder="e.g., John Smith"
              style={inputStyle}
              autoFocus
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Username</label>
            <input
              type="text"
              value={newStudent.username}
              onChange={e => setNewStudent({ ...newStudent, username: e.target.value })}
              placeholder="e.g., johnsmith"
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Email Address *</label>
            <input
              type="email"
              value={newStudent.email}
              onChange={e => setNewStudent({ ...newStudent, email: e.target.value })}
              placeholder="student@example.com"
              style={inputStyle}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setIsAdding(false)}
              style={{
                padding: '10px 20px',
                background: palette.white,
                color: palette.bodyText,
                border: `1.5px solid ${palette.border}`,
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: FONT_DISPLAY,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                boxShadow: `0 3px 0 ${palette.border}`,
              }}
            >Cancel</button>
            <button
              onClick={addStudent}
              style={{
                padding: '10px 20px',
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
              }}
            >Add Student</button>
          </div>
        </ModalWrapper>
      )}

      {/* Edit Student Modal */}
      {isEditing && (
        <ModalWrapper onClose={() => setIsEditing(false)}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 800,
            marginBottom: '20px',
            color: palette.deepNavy,
            fontFamily: FONT_DISPLAY,
            letterSpacing: '-0.2px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <Icon name="edit" size={18} color={palette.warmOrange} />
            Edit Student
          </h2>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Name</label>
            <input
              type="text"
              value={editForm.displayName}
              onChange={e => setEditForm({ ...editForm, displayName: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={editForm.email}
              onChange={e => setEditForm({ ...editForm, email: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setIsEditing(false)}
              style={{
                padding: '10px 20px',
                background: palette.white,
                color: palette.bodyText,
                border: `1.5px solid ${palette.border}`,
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: FONT_DISPLAY,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                boxShadow: `0 3px 0 ${palette.border}`,
              }}
            >Cancel</button>
            <button
              onClick={updateStudent}
              style={{
                padding: '10px 20px',
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
              }}
            >Save Changes</button>
          </div>
        </ModalWrapper>
      )}

      {/* Progress Modal */}
      {selectedStudent && !isEditing && (
        <ModalWrapper onClose={() => setSelected(null)}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              overflow: 'hidden',
              background: palette.creamSoft,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              border: `3px solid ${palette.warmOrange}40`,
            }}>
              <StudentAvatar student={selectedStudent} fontSize={32} />
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 800,
              color: palette.deepNavy,
              marginBottom: '4px',
              fontFamily: FONT_DISPLAY,
              letterSpacing: '-0.2px',
            }}>{selectedStudent.displayName}</h3>
            <p style={{
              fontSize: '13px',
              color: palette.bodyTextSoft,
              margin: 0,
              fontWeight: 600,
            }}>{selectedStudent.email}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            {[
              { label: 'Level', value: selectedStudent.progress?.level || 1, color: palette.warmOrange },
              { label: 'XP Points', value: selectedStudent.progress?.xp || 0, color: palette.gold },
              { label: 'Day Streak', value: selectedStudent.progress?.streak || 0, color: palette.coral },
              { label: 'Avg Score', value: `${selectedStudent.avgScore || 0}%`, color: palette.softGreen },
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

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{
              fontSize: '10px',
              fontWeight: 800,
              color: palette.bodyTextSoft,
              marginBottom: '10px',
              fontFamily: FONT_DISPLAY,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>Games Progress</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { label: 'Word Pics', value: `${selectedStudent.progress?.wordPics?.gamesPlayed || 0} plays` },
                { label: 'Match Game', value: `${selectedStudent.progress?.match?.gamesCompleted || 0} completed` },
                { label: 'Quiz Master', value: `${selectedStudent.progress?.quiz?.gamesCompleted || 0} completed` },
                { label: 'GuessWhat', value: `${selectedStudent.progress?.guessWhat?.gamesCompleted || 0} completed` },
                { label: 'Sentence Builder', value: `${selectedStudent.progress?.sentenceBuilder?.gamesCompleted || 0} completed` },
                { label: 'Short Story', value: `${selectedStudent.progress?.shortStory?.storiesCompleted || 0} stories` },
              ].map((g, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: palette.creamSoft,
                  borderRadius: '10px',
                  border: `1.5px solid ${palette.border}`,
                }}>
                  <span style={{ fontSize: '13px', color: palette.bodyText, fontWeight: 600 }}>
                    {g.label}
                  </span>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: 800,
                    color: palette.deepNavy,
                    fontFamily: FONT_DISPLAY,
                  }}>{g.value}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setSelected(null)}
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
            }}
          >
            Close
          </button>
        </ModalWrapper>
      )}

      <ConfirmDialog
        open={!!confirmAction}
        title={confirmAction?.title}
        message={confirmAction?.message}
        confirmLabel={confirmAction?.confirmLabel}
        danger={confirmAction?.danger}
        onConfirm={confirmAction?.onConfirm}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
};

export default AdminStudents;


