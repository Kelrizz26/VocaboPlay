// src/components/SuperAdminDashboard.jsx
// ============================================================
// ✅ SUPER ADMIN DASHBOARD - Full Analytics & Management
// ✅ UPDATED: Profile dropdown with Settings & Logout
// ============================================================

import React, { useState, useEffect } from 'react';
import { auth, db } from '../pages/firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';

import SuperAdminActivities from './superadmin/SuperAdminActivities';
import SuperAdminVocabulary from './superadmin/SuperAdminVocabulary';

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
  gold: '#C9A227',
  shadow: 'rgba(42, 40, 69, 0.06)',
  shadowMd: 'rgba(42, 40, 69, 0.10)',
  danger: '#DB7A64',
  dangerShadow: '#A95845',
};

const FONT_DISPLAY = "'Fredoka', sans-serif";
const FONT_BODY = "'Nunito', sans-serif";

// ===== DUOTONE SVG ICONS =====
const Icon = ({ name, size = 20, color = palette.bodyTextSoft }) => {
  const icons = {
    crown: (
      <>
        <path d="M3 17l2-10 5 5 2-7 2 7 5-5 2 10H3z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M3 21h18" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      </>
    ),
    chart: (
      <path d="M18 20V10M12 20V4M6 20v-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    ),
    user: (
      <>
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    graduation: (
      <>
        <path d="M22 10L12 5 2 10l10 5 10-5z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M6 12v5c0 1 3 3 6 3s6-2 6-3v-5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    clipboard: (
      <>
        <rect x="8" y="2" width="8" height="4" rx="1" stroke={color} strokeWidth="2" fill="none"/>
        <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    trophy: (
      <>
        <path d="M6 4h12v4a6 6 0 01-12 0V4z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M6 8H4a2 2 0 002 2M18 8h2a2 2 0 01-2 2M9 18h6M10 21h4M12 14v4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    logout: (
      <>
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M16 17l5-5-5-5M21 12H9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    book: (
      <>
        <path d="M4 4h11a3 3 0 013 3v13H7a3 3 0 00-3 3V4z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M4 4v16" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      </>
    ),
    trend: (
      <>
        <path d="M23 6l-9.5 9.5-5-5L1 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M17 6h6v6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    activity: (
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none"/>
        <path d="M12 6v6l4 2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    star: (
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2" fill="none"/>
        <path d="M21 21l-4.35-4.35" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    zap: (
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    ),
    target: (
      <>
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none"/>
        <circle cx="12" cy="12" r="6" stroke={color} strokeWidth="2" fill="none"/>
        <circle cx="12" cy="12" r="2" stroke={color} strokeWidth="2" fill="none"/>
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" fill="none"/>
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    shield: (
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    ),
    chevronDown: (
      <path d="M6 9l6 6 6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    ),
    close: (
      <path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    ),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', flexShrink: 0 }}>
      {icons[name] || icons.crown}
    </svg>
  );
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const timeAgo = (dateStr) => {
  if (!dateStr) return 'Never';
  try {
    const now = new Date();
    const past = new Date(dateStr);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  } catch {
    return '—';
  }
};

const computeLevel = (points) => Math.floor((points || 0) / 100) + 1;

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [scores, setScores] = useState([]);
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('statistics');
  const [statsYear, setStatsYear] = useState(new Date().getFullYear());

  // ✅ Profile state
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [profile, setProfile] = useState({ displayName: 'Super Admin', email: '', avatar: '', gender: 'male' });

  // ✅ Teacher filters
  const [teacherSearch, setTeacherSearch] = useState('');
  const [teacherDateFilter, setTeacherDateFilter] = useState('all');
  const [teacherSort, setTeacherSort] = useState('newest');

  // ✅ Student filters
  const [studentSearch, setStudentSearch] = useState('');
  const [studentDateFilter, setStudentDateFilter] = useState('all');
  const [studentSort, setStudentSort] = useState('points');

  // Check if super admin
  useEffect(() => {
    const checkAuth = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/super-admin-login');
        return;
      }
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role !== 'super_admin') {
          navigate('/admin');
          return;
        }
        setProfile({
          displayName: userData.displayName || user.email?.split('@')[0] || 'Super Admin',
          email: userData.email || user.email || '',
          avatar: userData.avatar || '',
          gender: userData.gender || 'male',
        });
      } else {
        setProfile({
          displayName: user.displayName || user.email?.split('@')[0] || 'Super Admin',
          email: user.email || '',
          avatar: '',
          gender: 'male',
        });
      }
    };
    checkAuth();
  }, [navigate]);

  // Fetch all data
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const teachersSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'admin')));
        const teachersList = [];
        teachersSnap.forEach((doc) => teachersList.push({ id: doc.id, ...doc.data() }));
        setTeachers(teachersList);

        const studentsSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'student')));
        const studentsList = [];
        studentsSnap.forEach((doc) => studentsList.push({ id: doc.id, ...doc.data() }));
        setStudents(studentsList);

        const activitiesSnap = await getDocs(collection(db, 'activities'));
        const activitiesList = [];
        activitiesSnap.forEach((doc) => activitiesList.push({ id: doc.id, ...doc.data() }));
        setActivities(activitiesList);

        const scoresSnap = await getDocs(collection(db, 'scores'));
        const scoresList = [];
        scoresSnap.forEach((doc) => scoresList.push({ id: doc.id, ...doc.data() }));
        setScores(scoresList);

        const wordsSnap = await getDocs(collection(db, 'words'));
        const wordsList = [];
        wordsSnap.forEach((doc) => wordsList.push({ id: doc.id, ...doc.data() }));
        setWords(wordsList);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  // TEACHER STATS
  const teacherStats = React.useMemo(() => {
    return teachers.map(teacher => {
      const teacherActivities = activities.filter(a =>
        a.teacherId === teacher.id ||
        (a.teacherName && a.teacherName === (teacher.displayName || teacher.email?.split('@')[0]))
      );
      const activityIds = teacherActivities.map(a => a.id);

      const studentIdsSet = new Set();
      scores.forEach(s => {
        if (activityIds.includes(s.activityId) && s.studentId) {
          studentIdsSet.add(s.studentId);
        }
      });

      const lastActivityDate = teacherActivities
        .map(a => a.createdAt)
        .filter(Boolean)
        .sort((a, b) => new Date(b) - new Date(a))[0];

      const registered = teacher.createdAt || teacher.joinDate || teacher.lastActive;
      const lastActive = lastActivityDate || registered;

      return {
        ...teacher,
        _activityCount: teacherActivities.length,
        _studentCount: studentIdsSet.size,
        _lastActive: lastActive,
      };
    });
  }, [teachers, activities, scores]);

  // STUDENT STATS
  const studentStats = React.useMemo(() => {
    return students.map(student => {
      const studentScores = scores.filter(s => s.studentId === student.id);
      const gamesPlayed = studentScores.length;

      const progress = student.progress || {};
      const wordsLearned = progress.wordsLearned || student.wordsLearned ||
        (Array.isArray(student.learnedWordsList) ? student.learnedWordsList.length : 0);

      const accuracy = progress.accuracy || student.accuracy || 0;
      const totalPoints = student.totalPoints || progress.totalPoints || 0;
      const level = student.level || computeLevel(totalPoints);
      const streak = progress.streak || student.currentStreak || 0;
      const lastActive = student.lastActive || student.updatedAt || student.createdAt;
      const registered = student.createdAt || student.joinDate;

      return {
        ...student,
        _gamesPlayed: gamesPlayed,
        _wordsLearned: wordsLearned,
        _accuracy: accuracy,
        _totalPoints: totalPoints,
        _level: level,
        _streak: streak,
        _lastActive: lastActive,
        _registered: registered,
      };
    });
  }, [students, scores]);

  // STUDENT SUMMARY
  const studentSummary = React.useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(now); monthAgo.setDate(monthAgo.getDate() - 30);

    const activeThisWeek = studentStats.filter(s => s._lastActive && new Date(s._lastActive) >= weekAgo).length;
    const newThisMonth = studentStats.filter(s => s._registered && new Date(s._registered) >= monthAgo).length;
    const totalPoints = studentStats.reduce((sum, s) => sum + s._totalPoints, 0);
    const avgPoints = studentStats.length > 0 ? (totalPoints / studentStats.length).toFixed(1) : '0.0';

    return { total: studentStats.length, activeThisWeek, newThisMonth, avgPoints };
  }, [studentStats]);

  // TEACHER SUMMARY
  const teacherSummary = React.useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(now); monthAgo.setDate(monthAgo.getDate() - 30);

    const activeThisWeek = teacherStats.filter(t => t._lastActive && new Date(t._lastActive) >= weekAgo).length;
    const newThisMonth = teacherStats.filter(t => {
      const created = t.createdAt || t.joinDate;
      return created && new Date(created) >= monthAgo;
    }).length;
    const totalActivities = teacherStats.reduce((sum, t) => sum + t._activityCount, 0);
    const avgActivities = teacherStats.length > 0 ? (totalActivities / teacherStats.length).toFixed(1) : '0.0';

    return { total: teacherStats.length, activeThisWeek, newThisMonth, avgActivities };
  }, [teacherStats]);

  // FILTERED TEACHERS
  const filteredTeachers = React.useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const daysAgo = (days) => { const d = new Date(now); d.setDate(d.getDate() - days); return d; };
    const threshold =
      teacherDateFilter === 'today' ? startOfToday :
      teacherDateFilter === 'week' ? daysAgo(7) :
      teacherDateFilter === 'month' ? daysAgo(30) :
      teacherDateFilter === 'year' ? daysAgo(365) : null;

    let result = teacherStats.filter(t => {
      if (teacherSearch) {
        const q = teacherSearch.toLowerCase();
        if (!t.displayName?.toLowerCase().includes(q) && !t.email?.toLowerCase().includes(q)) return false;
      }
      if (threshold) {
        const created = t.createdAt || t.joinDate || t.lastActive;
        if (!created || new Date(created) < threshold) return false;
      }
      return true;
    });

    switch (teacherSort) {
      case 'newest': result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)); break;
      case 'oldest': result.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)); break;
      case 'mostActivities': result.sort((a, b) => b._activityCount - a._activityCount); break;
      case 'mostStudents': result.sort((a, b) => b._studentCount - a._studentCount); break;
      case 'nameAZ': result.sort((a, b) => (a.displayName || a.email || '').toLowerCase().localeCompare((b.displayName || b.email || '').toLowerCase())); break;
      case 'nameZA': result.sort((a, b) => (b.displayName || b.email || '').toLowerCase().localeCompare((a.displayName || a.email || '').toLowerCase())); break;
      default: break;
    }
    return result;
  }, [teacherStats, teacherSearch, teacherDateFilter, teacherSort]);

  // FILTERED STUDENTS
  const filteredStudents = React.useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const daysAgo = (days) => { const d = new Date(now); d.setDate(d.getDate() - days); return d; };
    const threshold =
      studentDateFilter === 'today' ? startOfToday :
      studentDateFilter === 'week' ? daysAgo(7) :
      studentDateFilter === 'month' ? daysAgo(30) :
      studentDateFilter === 'year' ? daysAgo(365) : null;

    let result = studentStats.filter(s => {
      if (studentSearch) {
        const q = studentSearch.toLowerCase();
        if (!s.displayName?.toLowerCase().includes(q) && !s.email?.toLowerCase().includes(q)) return false;
      }
      if (threshold) {
        const created = s._registered;
        if (!created || new Date(created) < threshold) return false;
      }
      return true;
    });

    switch (studentSort) {
      case 'points': result.sort((a, b) => b._totalPoints - a._totalPoints); break;
      case 'games': result.sort((a, b) => b._gamesPlayed - a._gamesPlayed); break;
      case 'words': result.sort((a, b) => b._wordsLearned - a._wordsLearned); break;
      case 'accuracy': result.sort((a, b) => b._accuracy - a._accuracy); break;
      case 'newest': result.sort((a, b) => new Date(b._registered || 0) - new Date(a._registered || 0)); break;
      case 'oldest': result.sort((a, b) => new Date(a._registered || 0) - new Date(b._registered || 0)); break;
      case 'nameAZ': result.sort((a, b) => (a.displayName || a.email || '').toLowerCase().localeCompare((b.displayName || b.email || '').toLowerCase())); break;
      case 'nameZA': result.sort((a, b) => (b.displayName || b.email || '').toLowerCase().localeCompare((a.displayName || a.email || '').toLowerCase())); break;
      default: break;
    }
    return result;
  }, [studentStats, studentSearch, studentDateFilter, studentSort]);

  // STATS
  const stats = React.useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const getYear = (item) => {
      const d = item.createdAt || item.joinDate || item.lastActive;
      if (!d) return null;
      try { return new Date(d).getFullYear(); } catch { return null; }
    };
    const getMonth = (item) => {
      const d = item.createdAt || item.joinDate || item.lastActive;
      if (!d) return null;
      try { return new Date(d).getMonth(); } catch { return null; }
    };

    const teachersThisMonth = teachers.filter(t => getYear(t) === currentYear && getMonth(t) === currentMonth).length;
    const teachersThisYear = teachers.filter(t => getYear(t) === currentYear).length;
    const studentsThisMonth = students.filter(s => getYear(s) === currentYear && getMonth(s) === currentMonth).length;
    const studentsThisYear = students.filter(s => getYear(s) === currentYear).length;

    const monthlyTeachers = Array(12).fill(0);
    const monthlyStudents = Array(12).fill(0);
    const monthlyActivities = Array(12).fill(0);
    teachers.forEach(t => { if (getYear(t) === statsYear) { const m = getMonth(t); if (m !== null) monthlyTeachers[m]++; } });
    students.forEach(s => { if (getYear(s) === statsYear) { const m = getMonth(s); if (m !== null) monthlyStudents[m]++; } });
    activities.forEach(a => { if (getYear(a) === statsYear) { const m = getMonth(a); if (m !== null) monthlyActivities[m]++; } });

    const yearlyTeachers = {};
    const yearlyStudents = {};
    const yearlyActivities = {};
    teachers.forEach(t => { const y = getYear(t); if (y) yearlyTeachers[y] = (yearlyTeachers[y] || 0) + 1; });
    students.forEach(s => { const y = getYear(s); if (y) yearlyStudents[y] = (yearlyStudents[y] || 0) + 1; });
    activities.forEach(a => { const y = getYear(a); if (y) yearlyActivities[y] = (yearlyActivities[y] || 0) + 1; });

    const activityPerf = activities.map(a => {
      const relatedScores = scores.filter(s => s.activityId === a.id);
      const avgScore = relatedScores.length > 0
        ? (relatedScores.reduce((sum, s) => sum + (s.score || 0), 0) / relatedScores.length).toFixed(1)
        : 0;
      return { id: a.id, title: a.title, gamePin: a.gamePin, teacherName: a.teacherName, participants: relatedScores.length, avgScore, totalQuestions: a.totalQuestions || 0, gameType: a.gameType };
    }).sort((a, b) => b.participants - a.participants);

    const vocabByDifficulty = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, unknown: 0 };
    const vocabByCategory = {};
    words.forEach(w => {
      const d = typeof w.difficulty === 'number' ? w.difficulty : parseInt(w.difficulty);
      if (d >= 1 && d <= 5) vocabByDifficulty[d]++;
      else vocabByDifficulty.unknown++;
      const cat = w.category || 'Uncategorized';
      vocabByCategory[cat] = (vocabByCategory[cat] || 0) + 1;
    });

    const recentEvents = [];
    teachers.forEach(t => { if (t.createdAt) recentEvents.push({ type: 'teacher', icon: 'user', color: palette.warmOrange, title: `New teacher: ${t.displayName || t.email?.split('@')[0]}`, time: t.createdAt }); });
    students.forEach(s => { if (s.createdAt) recentEvents.push({ type: 'student', icon: 'graduation', color: palette.softGreen, title: `New student: ${s.displayName || s.email?.split('@')[0]}`, time: s.createdAt }); });
    activities.forEach(a => { if (a.createdAt) recentEvents.push({ type: 'activity', icon: 'clipboard', color: palette.teal, title: `New activity: "${a.title}" (PIN ${a.gamePin})`, time: a.createdAt }); });
    scores.forEach(s => { if (s.completedAt) recentEvents.push({ type: 'score', icon: 'trophy', color: palette.coral, title: `${s.studentName} scored s.scorein"{s.activityTitle || 'Activity'}"`, time: s.completedAt }); });
    recentEvents.sort((a, b) => new Date(b.time) - new Date(a.time));
    const recentTop = recentEvents.slice(0, 15);

    return { teachersThisMonth, teachersThisYear, studentsThisMonth, studentsThisYear, monthlyTeachers, monthlyStudents, monthlyActivities, yearlyTeachers, yearlyStudents, yearlyActivities, activityPerf, vocabByDifficulty, vocabByCategory, recentEvents: recentTop };
  }, [teachers, students, activities, scores, words, statsYear]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: palette.cream, fontFamily: FONT_BODY }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;500;600;700;800&display=swap');`}</style>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '44px', height: '44px', border: `3px solid ${palette.border}`, borderTop: `3px solid ${palette.warmOrange}`, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 18px' }} />
          <p style={{ color: palette.bodyTextSoft, fontFamily: FONT_DISPLAY, fontWeight: 700, margin: 0 }}>Loading Master Dashboard...</p>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: palette.cream, fontFamily: FONT_BODY }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Nunito', sans-serif; background: ${palette.cream}; }
        .super-admin-stat { transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; }
        .super-admin-stat:hover { transform: translateY(-3px); border-color: ${palette.warmOrange}40 !important; box-shadow: 0 8px 22px ${palette.shadowMd} !important; }
        .super-admin-row { transition: background 0.15s ease; }
        .super-admin-row:hover { background: ${palette.creamSoft} !important; }
        .stat-bar { transition: height 0.4s cubic-bezier(0.4, 0, 0.2, 1), background 0.2s ease; }
        .stat-bar:hover { filter: brightness(1.1); }
        .timeline-item { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .timeline-item:hover { transform: translateX(3px); box-shadow: 0 4px 12px ${palette.shadowMd}; }
        .super-admin-nav-scroll::-webkit-scrollbar { height: 4px; }
        .super-admin-nav-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 4px; }
        .super-admin-nav-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
        .profile-menu-item { transition: background 0.15s ease; }
        .profile-menu-item:hover { background: ${palette.creamSoft}; }
      `}</style>

      {/* ===== TOP BAR ===== */}
      <div style={{
        background: `linear-gradient(135deg, ${palette.deepNavy} 0%, ${palette.deepNavyLight} 100%)`,
        color: 'white',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        borderBottom: `1px solid rgba(233, 160, 117, 0.15)`,
        gap: '16px',
        flexWrap: 'wrap',
      }}>
        <h1 style={{
          fontSize: '18px',
          fontWeight: '800',
          margin: 0,
          fontFamily: FONT_DISPLAY,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          letterSpacing: '-0.3px',
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }}>
          <Icon name="crown" size={18} color={palette.warmOrange} />
          Super Admin Dashboard
        </h1>

        {/* CENTER: Nav Tabs */}
        <div className="super-admin-nav-scroll" style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          flex: 1, justifyContent: 'center', minWidth: 0,
          overflowX: 'auto', paddingBottom: '2px',
        }}>
          {[
            { id: 'statistics', label: 'Statistics', icon: 'trend' },
            { id: 'teachers', label: 'Teachers', icon: 'user' },
            { id: 'students', label: 'Students', icon: 'graduation' },
            { id: 'activities', label: 'Activities', icon: 'clipboard' },
            { id: 'vocabulary', label: 'Vocabulary', icon: 'book' },
          ].map((tab) => {
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                style={{
                  padding: '7px 14px',
                  background: isActive ? palette.warmOrange : 'rgba(255,255,255,0.08)',
                  color: isActive ? palette.white : 'rgba(255,255,255,0.78)',
                  border: isActive ? `1.5px solid ${palette.warmOrange}` : `1.5px solid rgba(255,255,255,0.12)`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '12px',
                  fontFamily: FONT_DISPLAY,
                  boxShadow: isActive ? `0 2px 0 ${palette.warmOrangeShadow}` : 'none',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                <Icon name={tab.icon} size={13} color={isActive ? palette.white : 'rgba(255,255,255,0.7)'} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* RIGHT: PROFILE DROPDOWN */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{
              padding: '5px 12px 5px 6px',
              background: 'rgba(255,255,255,0.08)',
              color: palette.white,
              border: `1.5px solid rgba(255,255,255,0.15)`,
              borderRadius: '10px',
              cursor: 'pointer',
              fontFamily: FONT_DISPLAY,
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%',
              background: profile.gender === 'male' ? '#6B8ACB' : palette.coral,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', flexShrink: 0,
              border: '1.5px solid rgba(255,255,255,0.2)',
            }}>
              {profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ color: 'white', fontWeight: 800, fontSize: '13px', fontFamily: FONT_DISPLAY }}>
                  {profile.displayName?.charAt(0)?.toUpperCase() || 'S'}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.1 }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: palette.white, whiteSpace: 'nowrap' }}>
                {profile.displayName}
              </span>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                Super Admin
              </span>
            </div>
            <Icon name="chevronDown" size={12} color="rgba(255,255,255,0.6)" />
          </button>

          {showProfileMenu && (
            <>
              <div onClick={() => setShowProfileMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 999 }} />
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                background: palette.white,
                borderRadius: '14px',
                zIndex: 1000,
                minWidth: '250px',
                overflow: 'hidden',
                border: `1.5px solid ${palette.border}`,
                boxShadow: '0 10px 30px rgba(42, 40, 69, 0.15)',
              }}>
                <div style={{
                  padding: '12px 14px',
                  background: palette.creamSoft,
                  borderBottom: `1.5px solid ${palette.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: profile.gender === 'male' ? '#6B8ACB' : palette.coral,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden', flexShrink: 0,
                  }}>
                    {profile.avatar ? (
                      <img src={profile.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ color: 'white', fontWeight: 800, fontSize: '16px', fontFamily: FONT_DISPLAY }}>
                        {profile.displayName?.charAt(0)?.toUpperCase() || 'S'}
                      </span>
                    )}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: palette.deepNavy, fontFamily: FONT_DISPLAY, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {profile.displayName}
                    </div>
                    <div style={{ fontSize: '11px', color: palette.bodyTextSoft, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {profile.email || 'No email on file'}
                    </div>
                  </div>
                </div>

                <div style={{ padding: '6px' }}>
                  <button
                    onClick={() => { setShowProfileMenu(false); setShowSettingsModal(true); }}
                    className="profile-menu-item"
                    style={menuItemStyle}
                  >
                    <Icon name="settings" size={14} color={palette.bodyText} />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={() => { setShowProfileMenu(false); navigate('/super-admin-dashboard?tab=profile'); }}
                    className="profile-menu-item"
                    style={menuItemStyle}
                  >
                    <Icon name="shield" size={14} color={palette.bodyText} />
                    <span>Account Security</span>
                  </button>
                  <div style={{ height: '1px', background: palette.borderSoft, margin: '6px 0' }} />
                  <button
                    onClick={handleLogout}
                    className="profile-menu-item"
                    style={{
                      ...menuItemStyle,
                      color: palette.danger,
                    }}
                  >
                    <Icon name="logout" size={14} color={palette.danger} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div style={{ padding: '24px 40px 40px' }}>
        {/* STATISTICS */}
        {activeSection === 'statistics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              flexWrap: 'wrap', gap: '12px', padding: '16px 20px',
              background: palette.white, borderRadius: '14px',
              border: `1.5px solid ${palette.border}`, boxShadow: `0 2px 0 ${palette.border}`,
            }}>
              <div>
                <h2 style={{ margin: 0, fontFamily: FONT_DISPLAY, color: palette.deepNavy, fontWeight: 800, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon name="trend" size={18} color={palette.warmOrange} />
                  Platform Statistics
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: palette.bodyTextSoft, fontWeight: 600 }}>
                  Analytics overview of teachers, students, and activities
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: palette.bodyTextSoft, fontFamily: FONT_DISPLAY, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Year:</span>
                <select value={statsYear} onChange={(e) => setStatsYear(Number(e.target.value))} style={{ padding: '8px 14px', border: `1.5px solid ${palette.border}`, borderRadius: '10px', fontSize: '13px', fontFamily: FONT_BODY, fontWeight: 700, background: palette.creamSoft, color: palette.deepNavy, cursor: 'pointer', outline: 'none' }}>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              {[
                { value: stats.teachersThisMonth, label: 'Teachers This Month', color: palette.warmOrange, icon: 'user' },
                { value: stats.teachersThisYear, label: `Teachers in ${statsYear}`, color: palette.warmOrange, icon: 'user' },
                { value: stats.studentsThisMonth, label: 'Students This Month', color: palette.softGreen, icon: 'graduation' },
                { value: stats.studentsThisYear, label: `Students in ${statsYear}`, color: palette.softGreen, icon: 'graduation' },
              ].map((stat, i) => (
                <div key={i} className="super-admin-stat" style={{ background: palette.white, padding: '16px 18px', borderRadius: '14px', boxShadow: `0 2px 0 ${palette.border}`, border: `1.5px solid ${palette.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${stat.color}15`, border: `1.5px solid ${stat.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name={stat.icon} size={14} color={stat.color} />
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: palette.bodyTextSoft, fontFamily: FONT_DISPLAY, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {i % 2 === 0 ? 'Month' : 'Year'}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '24px', margin: '0 0 4px 0', color: stat.color, fontFamily: FONT_DISPLAY, fontWeight: 800, lineHeight: 1 }}>{stat.value}</h3>
                  <p style={{ margin: '0', color: palette.bodyTextSoft, fontSize: '11px', fontFamily: FONT_DISPLAY, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{stat.label}</p>
                </div>
              ))}
            </div>

            <div style={{ background: palette.white, padding: '24px', borderRadius: '16px', boxShadow: `0 2px 0 ${palette.border}`, border: `1.5px solid ${palette.border}` }}>
              <h3 style={{ margin: '0 0 20px 0', fontFamily: FONT_DISPLAY, color: palette.deepNavy, fontWeight: 800, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon name="chart" size={16} color={palette.teal} />
                Monthly Joins & Activity Creation ({statsYear})
              </h3>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {[{ label: 'Teachers', color: palette.warmOrange }, { label: 'Students', color: palette.softGreen }, { label: 'Activities', color: palette.teal }].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: item.color }} />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: palette.bodyText, fontFamily: FONT_BODY }}>{item.label}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px', height: '220px', padding: '16px 8px', background: palette.creamSoft, borderRadius: '12px', border: `1.5px solid ${palette.border}`, overflowX: 'auto' }}>
                {MONTH_NAMES.map((month, idx) => {
                  const maxVal = Math.max(...stats.monthlyTeachers, ...stats.monthlyStudents, ...stats.monthlyActivities, 1);
                  const tHeight = (stats.monthlyTeachers[idx] / maxVal) * 100;
                  const sHeight = (stats.monthlyStudents[idx] / maxVal) * 100;
                  const aHeight = (stats.monthlyActivities[idx] / maxVal) * 100;
                  return (
                    <div key={month} style={{ flex: 1, minWidth: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '3px', height: '100%', width: '100%' }}>
                        <div className="stat-bar" title={`Teachers: ${stats.monthlyTeachers[idx]}`} style={{ width: '22%', height: `${Math.max(tHeight, 2)}%`, background: palette.warmOrange, borderRadius: '4px 4px 0 0', minHeight: '4px' }} />
                        <div className="stat-bar" title={`Students: ${stats.monthlyStudents[idx]}`} style={{ width: '22%', height: `${Math.max(sHeight, 2)}%`, background: palette.softGreen, borderRadius: '4px 4px 0 0', minHeight: '4px' }} />
                        <div className="stat-bar" title={`Activities: ${stats.monthlyActivities[idx]}`} style={{ width: '22%', height: `${Math.max(aHeight, 2)}%`, background: palette.teal, borderRadius: '4px 4px 0 0', minHeight: '4px' }} />
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: palette.bodyTextSoft, fontFamily: FONT_DISPLAY, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{month}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              <div style={{ background: palette.white, padding: '24px', borderRadius: '16px', boxShadow: `0 2px 0 ${palette.border}`, border: `1.5px solid ${palette.border}` }}>
                <h3 style={{ margin: '0 0 16px 0', fontFamily: FONT_DISPLAY, color: palette.deepNavy, fontWeight: 800, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon name="trend" size={15} color={palette.warmOrange} />
                  Yearly Growth
                </h3>
                {Object.keys({ ...stats.yearlyTeachers, ...stats.yearlyStudents, ...stats.yearlyActivities }).sort().map((year) => {
                  const t = stats.yearlyTeachers[year] || 0;
                  const s = stats.yearlyStudents[year] || 0;
                  const a = stats.yearlyActivities[year] || 0;
                  return (
                    <div key={year} style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: `1.5px solid ${palette.borderSoft}` }}>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: palette.deepNavy, fontFamily: FONT_DISPLAY, width: '60px' }}>{year}</span>
                      <div style={{ display: 'flex', gap: '16px', flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, color: palette.warmOrange, fontFamily: FONT_BODY }}>
                          <Icon name="user" size={11} color={palette.warmOrange} />
                          {t}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, color: palette.softGreen, fontFamily: FONT_BODY }}>
                          <Icon name="graduation" size={11} color={palette.softGreen} />
                          {s}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, color: palette.teal, fontFamily: FONT_BODY }}>
                          <Icon name="clipboard" size={11} color={palette.teal} />
                          {a}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {Object.keys({ ...stats.yearlyTeachers, ...stats.yearlyStudents, ...stats.yearlyActivities }).length === 0 && (
                  <p style={{ color: palette.bodyTextSoft, fontSize: '13px', textAlign: 'center', margin: '20px 0', fontWeight: 600 }}>No yearly data yet</p>
                )}
              </div>

              <div style={{ background: palette.white, padding: '24px', borderRadius: '16px', boxShadow: `0 2px 0 ${palette.border}`, border: `1.5px solid ${palette.border}` }}>
                <h3 style={{ margin: '0 0 16px 0', fontFamily: FONT_DISPLAY, color: palette.deepNavy, fontWeight: 800, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon name="book" size={15} color={palette.gold} />
                  Vocabulary Breakdown ({words.length} total)
                </h3>
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: palette.bodyTextSoft, fontFamily: FONT_DISPLAY, textTransform: 'uppercase', letterSpacing: '0.05em' }}>By Difficulty</span>
                  {[
                    { level: 1, label: 'Beginner', color: palette.softGreen },
                    { level: 2, label: 'Easy', color: palette.softGreen },
                    { level: 3, label: 'Intermediate', color: palette.gold },
                    { level: 4, label: 'Advanced', color: palette.warmOrange },
                    { level: 5, label: 'Expert', color: palette.coral },
                  ].map(({ level, label, color }) => {
                    const count = stats.vocabByDifficulty[level] || 0;
                    const pct = words.length > 0 ? (count / words.length) * 100 : 0;
                    return (
                      <div key={level} style={{ marginTop: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: palette.bodyText, fontFamily: FONT_BODY }}>L{level} · {label}</span>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: color, fontFamily: FONT_DISPLAY }}>{count}</span>
                        </div>
                        <div style={{ height: '8px', background: palette.creamSoft, borderRadius: '999px', overflow: 'hidden', border: `1px solid ${palette.border}` }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '999px', transition: 'width 0.4s ease' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: palette.bodyTextSoft, fontFamily: FONT_DISPLAY, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Top Categories</span>
                  {Object.entries(stats.vocabByCategory).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([cat, count]) => (
                    <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: palette.creamSoft, borderRadius: '8px', marginTop: '6px', border: `1.5px solid ${palette.border}` }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: palette.bodyText, fontFamily: FONT_BODY }}>{cat}</span>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: palette.gold, fontFamily: FONT_DISPLAY }}>{count}</span>
                    </div>
                  ))}
                  {Object.keys(stats.vocabByCategory).length === 0 && (
                    <p style={{ color: palette.bodyTextSoft, fontSize: '12px', margin: '8px 0 0 0', fontWeight: 600 }}>No categories yet</p>
                  )}
                </div>
              </div>
            </div>

            <div style={{ background: palette.white, padding: '24px', borderRadius: '16px', boxShadow: `0 2px 0 ${palette.border}`, border: `1.5px solid ${palette.border}` }}>
              <h3 style={{ margin: '0 0 16px 0', fontFamily: FONT_DISPLAY, color: palette.deepNavy, fontWeight: 800, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon name="star" size={16} color={palette.coral} />
                Activity Performance (Top 10)
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONT_BODY, minWidth: '600px' }}>
                  <thead>
                    <tr style={{ borderBottom: `1.5px solid ${palette.border}` }}>
                      <th style={thStyle}>Title</th>
                      <th style={thStyle}>Teacher</th>
                      <th style={{ ...thStyle, textAlign: 'center' }}>Type</th>
                      <th style={{ ...thStyle, textAlign: 'center' }}>Participants</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>Avg Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.activityPerf.slice(0, 10).map((a) => (
                      <tr key={a.id} className="super-admin-row" style={{ borderBottom: `1.5px solid ${palette.borderSoft}` }}>
                        <td style={{ padding: '12px', fontWeight: 700, color: palette.deepNavy, fontFamily: FONT_DISPLAY }}>
                          {a.title}
                          <span style={{ fontSize: '10px', color: palette.bodyTextSoft, marginLeft: '6px', fontWeight: 600 }}>({a.gamePin})</span>
                        </td>
                        <td style={{ padding: '12px', color: palette.bodyText, fontWeight: 600, fontSize: '13px' }}>{a.teacherName || '—'}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '10px', fontWeight: 800, fontFamily: FONT_DISPLAY, textTransform: 'uppercase', background: `${palette.teal}15`, color: palette.teal, border: `1px solid ${palette.teal}40` }}>{a.gameType || 'quiz'}</span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: 800, color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>{a.participants}</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 800, color: palette.softGreen, fontFamily: FONT_DISPLAY }}>
                          {a.avgScore} {a.totalQuestions > 0 ? `/ ${a.totalQuestions}` : ''}
                        </td>
                      </tr>
                    ))}
                    {stats.activityPerf.length === 0 && (
                      <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: palette.bodyTextSoft, fontWeight: 600, fontSize: '13px' }}>No activities yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ background: palette.white, padding: '24px', borderRadius: '16px', boxShadow: `0 2px 0 ${palette.border}`, border: `1.5px solid ${palette.border}` }}>
              <h3 style={{ margin: '0 0 16px 0', fontFamily: FONT_DISPLAY, color: palette.deepNavy, fontWeight: 800, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon name="activity" size={16} color={palette.teal} />
                Recent System Activities
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {stats.recentEvents.map((event, i) => (
                  <div key={i} className="timeline-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: palette.creamSoft, borderRadius: '12px', border: `1.5px solid ${palette.border}` }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: `${event.color}20`, border: `1.5px solid ${event.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon name={event.icon} size={14} color={event.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: palette.deepNavy, fontFamily: FONT_BODY, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.title}</div>
                      <div style={{ fontSize: '11px', color: palette.bodyTextSoft, fontWeight: 600, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Icon name="clock" size={10} color={palette.bodyTextSoft} />
                        {new Date(event.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {' · '}
                        {new Date(event.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                {stats.recentEvents.length === 0 && (
                  <p style={{ color: palette.bodyTextSoft, fontSize: '13px', textAlign: 'center', margin: '20px 0', fontWeight: 600 }}>No recent activity yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TEACHERS */}
        {activeSection === 'teachers' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <div style={summaryCardStyle(palette.warmOrange)}>
                <div style={summaryIconStyle(palette.warmOrange)}><Icon name="user" size={14} color={palette.warmOrange} /></div>
                <div style={summaryLabelStyle}>Total Teachers</div>
                <div style={summaryValueStyle(palette.warmOrange)}>{teacherSummary.total}</div>
              </div>
              <div style={summaryCardStyle(palette.softGreen)}>
                <div style={summaryIconStyle(palette.softGreen)}><Icon name="zap" size={14} color={palette.softGreen} /></div>
                <div style={summaryLabelStyle}>Active This Week</div>
                <div style={summaryValueStyle(palette.softGreen)}>{teacherSummary.activeThisWeek}</div>
              </div>
              <div style={summaryCardStyle(palette.teal)}>
                <div style={summaryIconStyle(palette.teal)}><Icon name="star" size={14} color={palette.teal} /></div>
                <div style={summaryLabelStyle}>New This Month</div>
                <div style={summaryValueStyle(palette.teal)}>{teacherSummary.newThisMonth}</div>
              </div>
              <div style={summaryCardStyle(palette.gold)}>
                <div style={summaryIconStyle(palette.gold)}><Icon name="clipboard" size={14} color={palette.gold} /></div>
                <div style={summaryLabelStyle}>Avg Activities / Teacher</div>
                <div style={summaryValueStyle(palette.gold)}>{teacherSummary.avgActivities}</div>
              </div>
            </div>

            <div style={{ background: palette.white, padding: '24px', borderRadius: '16px', boxShadow: `0 2px 0 ${palette.border}`, border: `1.5px solid ${palette.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
                <h2 style={{ margin: 0, fontFamily: FONT_DISPLAY, color: palette.deepNavy, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px' }}>
                  <Icon name="user" size={18} color={palette.warmOrange} />
                  All Teachers
                  <span style={{ fontSize: '12px', fontWeight: 800, color: palette.warmOrange, background: `${palette.warmOrange}15`, padding: '3px 10px', borderRadius: '999px', border: `1px solid ${palette.warmOrange}40`, fontFamily: FONT_DISPLAY, marginLeft: '4px' }}>
                    {filteredTeachers.length}
                  </span>
                </h2>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <input type="text" placeholder="Search name or email..." value={teacherSearch} onChange={(e) => setTeacherSearch(e.target.value)} style={{ padding: '9px 12px 9px 32px', border: `1.5px solid ${palette.border}`, borderRadius: '10px', fontSize: '13px', fontFamily: FONT_BODY, fontWeight: 600, background: palette.creamSoft, color: palette.deepNavy, outline: 'none', width: '200px' }} />
                    <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}><Icon name="search" size={13} color={palette.bodyTextSoft} /></div>
                  </div>
                  <select value={teacherDateFilter} onChange={(e) => setTeacherDateFilter(e.target.value)} style={selectFilterStyle}>
                    <option value="all">All Time</option>
                    <option value="today">Registered Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                    <option value="year">Last Year</option>
                  </select>
                  <select value={teacherSort} onChange={(e) => setTeacherSort(e.target.value)} style={selectFilterStyle}>
                    <option value="newest">Sort: Newest First</option>
                    <option value="oldest">Sort: Oldest First</option>
                    <option value="mostActivities">Sort: Most Activities</option>
                    <option value="mostStudents">Sort: Most Students</option>
                    <option value="nameAZ">Sort: Name A→Z</option>
                    <option value="nameZA">Sort: Name Z→A</option>
                  </select>
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONT_BODY, minWidth: '750px' }}>
                  <thead>
                    <tr style={{ borderBottom: `1.5px solid ${palette.border}` }}>
                      <th style={thStyle}>Name</th>
                      <th style={thStyle}>Email</th>
                      <th style={{ ...thStyle, textAlign: 'center' }}>Activities</th>
                      <th style={{ ...thStyle, textAlign: 'center' }}>Students</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>Registered</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>Last Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeachers.map((teacher) => {
                      const created = teacher.createdAt || teacher.joinDate;
                      const formatted = created ? new Date(created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
                      return (
                        <tr key={teacher.id} className="super-admin-row" style={{ borderBottom: `1.5px solid ${palette.borderSoft}` }}>
                          <td style={{ padding: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `${palette.warmOrange}20`, border: `1.5px solid ${palette.warmOrange}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, color: palette.warmOrange, fontFamily: FONT_DISPLAY, flexShrink: 0 }}>
                                {(teacher.displayName || teacher.email || '?').charAt(0).toUpperCase()}
                              </div>
                              <div style={{ fontWeight: 700, color: palette.deepNavy, fontFamily: FONT_DISPLAY, fontSize: '13px' }}>
                                {teacher.displayName || teacher.email?.split('@')[0]}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px', color: palette.bodyText, fontWeight: 600, fontSize: '13px' }}>{teacher.email}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}><span style={countBadgeStyle(palette.teal, teacher._activityCount > 0)}>{teacher._activityCount}</span></td>
                          <td style={{ padding: '12px', textAlign: 'center' }}><span style={countBadgeStyle(palette.softGreen, teacher._studentCount > 0)}>{teacher._studentCount}</span></td>
                          <td style={{ padding: '12px', textAlign: 'right', color: palette.bodyTextSoft, fontSize: '11px', fontWeight: 600 }}>{formatted}</td>
                          <td style={{ padding: '12px', textAlign: 'right', color: palette.bodyTextSoft, fontSize: '11px', fontWeight: 600 }}>{timeAgo(teacher._lastActive)}</td>
                        </tr>
                      );
                    })}
                    {filteredTeachers.length === 0 && (
                      <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: palette.bodyTextSoft, fontWeight: 600, fontSize: '13px' }}>No teachers match your filters</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* STUDENTS */}
        {activeSection === 'students' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <div style={summaryCardStyle(palette.softGreen)}>
                <div style={summaryIconStyle(palette.softGreen)}><Icon name="graduation" size={14} color={palette.softGreen} /></div>
                <div style={summaryLabelStyle}>Total Students</div>
                <div style={summaryValueStyle(palette.softGreen)}>{studentSummary.total}</div>
              </div>
              <div style={summaryCardStyle(palette.warmOrange)}>
                <div style={summaryIconStyle(palette.warmOrange)}><Icon name="zap" size={14} color={palette.warmOrange} /></div>
                <div style={summaryLabelStyle}>Active This Week</div>
                <div style={summaryValueStyle(palette.warmOrange)}>{studentSummary.activeThisWeek}</div>
              </div>
              <div style={summaryCardStyle(palette.teal)}>
                <div style={summaryIconStyle(palette.teal)}><Icon name="star" size={14} color={palette.teal} /></div>
                <div style={summaryLabelStyle}>New This Month</div>
                <div style={summaryValueStyle(palette.teal)}>{studentSummary.newThisMonth}</div>
              </div>
              <div style={summaryCardStyle(palette.gold)}>
                <div style={summaryIconStyle(palette.gold)}><Icon name="target" size={14} color={palette.gold} /></div>
                <div style={summaryLabelStyle}>Avg Points / Student</div>
                <div style={summaryValueStyle(palette.gold)}>{studentSummary.avgPoints}</div>
              </div>
            </div>

            <div style={{ background: palette.white, padding: '24px', borderRadius: '16px', boxShadow: `0 2px 0 ${palette.border}`, border: `1.5px solid ${palette.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
                <h2 style={{ margin: 0, fontFamily: FONT_DISPLAY, color: palette.deepNavy, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px' }}>
                  <Icon name="graduation" size={18} color={palette.softGreen} />
                  All Students
                  <span style={{ fontSize: '12px', fontWeight: 800, color: palette.softGreen, background: `${palette.softGreen}15`, padding: '3px 10px', borderRadius: '999px', border: `1px solid ${palette.softGreen}40`, fontFamily: FONT_DISPLAY, marginLeft: '4px' }}>
                    {filteredStudents.length}
                  </span>
                </h2>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <input type="text" placeholder="Search name or email..." value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} style={{ padding: '9px 12px 9px 32px', border: `1.5px solid ${palette.border}`, borderRadius: '10px', fontSize: '13px', fontFamily: FONT_BODY, fontWeight: 600, background: palette.creamSoft, color: palette.deepNavy, outline: 'none', width: '200px' }} />
                    <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}><Icon name="search" size={13} color={palette.bodyTextSoft} /></div>
                  </div>
                  <select value={studentDateFilter} onChange={(e) => setStudentDateFilter(e.target.value)} style={selectFilterStyle}>
                    <option value="all">All Time</option>
                    <option value="today">Registered Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                    <option value="year">Last Year</option>
                  </select>
                  <select value={studentSort} onChange={(e) => setStudentSort(e.target.value)} style={selectFilterStyle}>
                    <option value="points">Sort: Most Points</option>
                    <option value="games">Sort: Most Games Played</option>
                    <option value="words">Sort: Most Words Learned</option>
                    <option value="accuracy">Sort: Highest Accuracy</option>
                    <option value="newest">Sort: Newest First</option>
                    <option value="oldest">Sort: Oldest First</option>
                    <option value="nameAZ">Sort: Name A→Z</option>
                    <option value="nameZA">Sort: Name Z→A</option>
                  </select>
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONT_BODY, minWidth: '900px' }}>
                  <thead>
                    <tr style={{ borderBottom: `1.5px solid ${palette.border}` }}>
                      <th style={thStyle}>Name</th>
                      <th style={thStyle}>Email</th>
                      <th style={{ ...thStyle, textAlign: 'center' }}>Level</th>
                      <th style={{ ...thStyle, textAlign: 'center' }}>Points</th>
                      <th style={{ ...thStyle, textAlign: 'center' }}>Games</th>
                      <th style={{ ...thStyle, textAlign: 'center' }}>Words</th>
                      <th style={{ ...thStyle, textAlign: 'center' }}>Accuracy</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>Last Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="super-admin-row" style={{ borderBottom: `1.5px solid ${palette.borderSoft}` }}>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `${palette.softGreen}20`, border: `1.5px solid ${palette.softGreen}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, color: palette.softGreen, fontFamily: FONT_DISPLAY, flexShrink: 0 }}>
                              {(student.displayName || student.email || '?').charAt(0).toUpperCase()}
                            </div>
                            <div style={{ fontWeight: 700, color: palette.deepNavy, fontFamily: FONT_DISPLAY, fontSize: '13px' }}>
                              {student.displayName || student.email?.split('@')[0]}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px', color: palette.bodyText, fontWeight: 600, fontSize: '13px' }}>{student.email}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, fontFamily: FONT_DISPLAY, background: `${palette.gold}15`, color: palette.gold, border: `1px solid ${palette.gold}40` }}>
                            Lv {student._level}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={{ fontWeight: 800, color: palette.warmOrange, fontFamily: FONT_DISPLAY, fontSize: '14px' }}>{student._totalPoints}</span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}><span style={countBadgeStyle(palette.teal, student._gamesPlayed > 0)}>{student._gamesPlayed}</span></td>
                        <td style={{ padding: '12px', textAlign: 'center' }}><span style={countBadgeStyle(palette.softGreen, student._wordsLearned > 0)}>{student._wordsLearned}</span></td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block', padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, fontFamily: FONT_DISPLAY,
                            background: student._accuracy >= 70 ? `palette.softGreen15`:student.accuracy>=40?`{palette.gold}15` : student._accuracy > 0 ? `${palette.danger}15` : palette.creamSoft,
                            color: student._accuracy >= 70 ? palette.softGreen : student._accuracy >= 40 ? palette.gold : student._accuracy > 0 ? palette.danger : palette.bodyTextSoft,
                            border: `1px solid ${student._accuracy >= 70 ? palette.softGreen + '40' : student._accuracy >= 40 ? palette.gold + '40' : student._accuracy > 0 ? palette.danger + '40' : palette.border}`,
                          }}>{student._accuracy}%</span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', color: palette.bodyTextSoft, fontSize: '11px', fontWeight: 600 }}>{timeAgo(student._lastActive)}</td>
                      </tr>
                    ))}
                    {filteredStudents.length === 0 && (
                      <tr><td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: palette.bodyTextSoft, fontWeight: 600, fontSize: '13px' }}>No students match your filters</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ACTIVITIES */}
        {activeSection === 'activities' && (
          <SuperAdminActivities activities={activities} scores={scores} teachers={teachers} />
        )}

        {/* VOCABULARY */}
        {activeSection === 'vocabulary' && (
          <SuperAdminVocabulary words={words} />
        )}
      </div>

      {/* ✅ SETTINGS MODAL */}
      {showSettingsModal && (
        <div
          onClick={() => setShowSettingsModal(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(42, 40, 69, 0.55)',
            backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: palette.white, borderRadius: '20px',
              maxWidth: '460px', width: '100%',
              padding: '24px', position: 'relative',
              border: `1.5px solid ${palette.border}`,
              boxShadow: '0 20px 50px rgba(42, 40, 69, 0.25)',
            }}
          >
            <button
              onClick={() => setShowSettingsModal(false)}
              style={{
                position: 'absolute', top: '16px', right: '18px',
                background: palette.creamSoft, border: `1.5px solid ${palette.border}`,
                width: '32px', height: '32px', borderRadius: '50%',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Icon name="close" size={16} color={palette.bodyTextSoft} />
            </button>

            <h2 style={{ margin: '0 0 20px 0', fontFamily: FONT_DISPLAY, color: palette.deepNavy, fontWeight: 800, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name="settings" size={20} color={palette.warmOrange} />
              Settings
            </h2>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '11px', fontWeight: 800, color: palette.bodyTextSoft, fontFamily: FONT_DISPLAY, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                Display Name
              </label>
              <input
                type="text"
                value={profile.displayName}
                onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                style={{
                  width: '100%', padding: '11px 14px', border: `1.5px solid ${palette.border}`,
                  borderRadius: '10px', fontSize: '13px', fontFamily: FONT_BODY,
                  fontWeight: 600, background: palette.creamSoft, color: palette.deepNavy, outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '11px', fontWeight: 800, color: palette.bodyTextSoft, fontFamily: FONT_DISPLAY, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                style={{
                  width: '100%', padding: '11px 14px', border: `1.5px solid ${palette.border}`,
                  borderRadius: '10px', fontSize: '13px', fontFamily: FONT_BODY,
                  fontWeight: 600, background: palette.creamSoft, color: palette.bodyTextSoft,
                  outline: 'none', boxSizing: 'border-box', cursor: 'not-allowed',
                }}
              />
              <p style={{ fontSize: '10px', color: palette.bodyTextSoft, margin: '4px 0 0 0', fontWeight: 600 }}>
                Email cannot be changed
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '11px', fontWeight: 800, color: palette.bodyTextSoft, fontFamily: FONT_DISPLAY, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                Role
              </label>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '999px',
                background: `${palette.warmOrange}15`, color: palette.warmOrange,
                border: `1.5px solid ${palette.warmOrange}40`,
                fontSize: '11px', fontWeight: 800, fontFamily: FONT_DISPLAY,
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                <Icon name="crown" size={11} color={palette.warmOrange} />
                Super Admin
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowSettingsModal(false)}
                style={{
                  flex: 1, padding: '12px', background: palette.creamSoft,
                  border: `1.5px solid ${palette.border}`, borderRadius: '10px',
                  cursor: 'pointer', fontFamily: FONT_DISPLAY, fontWeight: 800,
                  fontSize: '13px', color: palette.deepNavy,
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('✅ Settings saved! (Connect this to Firestore to actually save.)');
                  setShowSettingsModal(false);
                }}
                style={{
                  flex: 1, padding: '12px', background: palette.warmOrange,
                  border: 'none', borderRadius: '10px', cursor: 'pointer',
                  fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: '13px',
                  color: palette.white, boxShadow: `0 3px 0 ${palette.warmOrangeShadow}`,
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ===== Helper Styles =====
const summaryCardStyle = (color) => ({
  background: '#FFFFFF', padding: '16px 18px', borderRadius: '14px',
  boxShadow: `0 2px 0 #EBE2D5`, border: `1.5px solid #EBE2D5`,
  borderLeft: `4px solid ${color}`,
});

const summaryIconStyle = (color) => ({
  width: 28, height: 28, borderRadius: 8,
  background: `${color}15`, border: `1.5px solid ${color}30`,
  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8,
});

const summaryLabelStyle = {
  fontSize: '10px', fontWeight: 800, color: '#8A8799',
  fontFamily: "'Fredoka', sans-serif", textTransform: 'uppercase',
  letterSpacing: '0.05em', marginBottom: '4px',
};

const summaryValueStyle = (color) => ({
  fontSize: '22px', fontWeight: 800, color: color,
  fontFamily: "'Fredoka', sans-serif", lineHeight: 1,
});

const thStyle = {
  padding: '12px', textAlign: 'left', color: '#8A8799',
  fontFamily: "'Fredoka', sans-serif", fontSize: '10px',
  textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800,
};

const selectFilterStyle = {
  padding: '9px 14px', border: `1.5px solid #EBE2D5`, borderRadius: '10px',
  fontSize: '13px', fontFamily: "'Nunito', sans-serif", fontWeight: 700,
  background: '#FFFFFF', color: '#2A2845', cursor: 'pointer', outline: 'none',
};

const countBadgeStyle = (color, active) => ({
  display: 'inline-block', padding: '4px 12px', borderRadius: '999px',
  fontSize: '12px', fontWeight: 800, fontFamily: "'Fredoka', sans-serif",
  background: active ? `${color}15` : '#F5EFE6',
  color: active ? color : '#8A8799',
  border: `1px solid ${active ? color + '40' : '#EBE2D5'}`,
  minWidth: '32px',
});

const menuItemStyle = {
  width: '100%', padding: '10px 12px', border: 'none', background: 'none',
  fontSize: '13px', cursor: 'pointer', textAlign: 'left', borderRadius: '8px',
  display: 'flex', alignItems: 'center', gap: '10px',
  color: '#6B6880', fontFamily: "'Nunito', sans-serif", fontWeight: 700,
};

export default SuperAdminDashboard;

