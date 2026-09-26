// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../pages/firebase';
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  onSnapshot
} from 'firebase/firestore';
import { useUserStats } from '../hooks/useUserStats';
import Profile from './Profile';
import Leaderboards from './Leaderboards';

import WordPicsGame from './dashboard/SynoQuest';
import QuizGame from './dashboard/QuizGame';
import MatchGame from './dashboard/MatchGame';
import GuessWhatGame from './dashboard/GuessWhatGame';
import ShortStoryGame from './dashboard/ShortStoryGame';
import SentenceBuilder from './dashboard/SentenceBuilder';
import MyProgress from './dashboard/MyProgress';
import WordLibrary from './dashboard/WordLibrary';
import FavoritesPage from './dashboard/FavoritesPage';
import PlayGames from './dashboard/PlayGames';

import AvatarShop from './dashboard/AvatarShop';
import CharacterAvatar from './CharacterAvatar';

import LiveJoinModal from './dashboard/LiveJoinModal';
import LivePlayerLobby from './dashboard/LivePlayerLobby';
import LivePlayerGame from './dashboard/LivePlayerGame';
import LivePlayerResults from './dashboard/LivePlayerResults';

import MascotCarousel from './dashboard/MascotCarousel';
import ExpBar from './dashboard/ExpBar';

import { colors, fontFamily, type as textType } from './dashboard/dashboardStyles';
import ThemeToggle from './ThemeToggle';

const DEMO_FORCE_LEVEL = false;

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
};

const chunkyButton = (bg, shadowColor, size = 'md') => {
  const sizes = {
    sm: { padding: '8px 16px', fontSize: '13px', radius: '8px' },
    md: { padding: '12px 24px', fontSize: '15px', radius: '12px' },
    lg: { padding: '16px 32px', fontSize: '18px', radius: '14px' },
  };
  const s = sizes[size];
  
  return {
    background: bg,
    color: palette.white,
    border: 'none',
    borderRadius: s.radius,
    fontWeight: '800',
    cursor: 'pointer',
    fontFamily: "'Fredoka', sans-serif",
    fontSize: s.fontSize,
    padding: s.padding,
    boxShadow: `0 4px 0 ${shadowColor}`,
    transition: 'transform 0.1s ease, box-shadow 0.1s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };
};

const pressBtn = (e, shadowColor) => {
  e.currentTarget.style.transform = 'translateY(4px)';
  e.currentTarget.style.boxShadow = `0 0 0 ${shadowColor}`;
};
const releaseBtn = (e, shadowColor) => {
  e.currentTarget.style.transform = 'translateY(0)';
  e.currentTarget.style.boxShadow = `0 4px 0 ${shadowColor}`;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentGame, setCurrentGame] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [contentKey, setContentKey] = useState(0);

  const [equippedAvatar, setEquippedAvatar] = useState(null);

  const [joinPin, setJoinPin] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);

  const [showLiveJoinModal, setShowLiveJoinModal] = useState(false);
  const [liveSession, setLiveSession] = useState(null);
  const [liveView, setLiveView] = useState(null);
  const [livePlayerId, setLivePlayerId] = useState(null);

  const userId = localStorage.getItem('userId');
  const { stats, loading, error } = useUserStats(userId);

  const [userProfile, setUserProfile] = useState(() => {
    try {
      const cached = localStorage.getItem('firebaseUserData');
      if (cached) {
        const data = JSON.parse(cached);
        return {
          uid: userId || 'unknown',
          displayName: data.displayName || 'User',
          email: data.email || '',
          avatar: data.avatar || '👤',
          role: data.role || 'student',
          progress: {
            wordsLearned: data.wordsLearned || 0,
            gamesPlayed: data.gamesPlayed || 0,
            totalPoints: data.totalPoints || 0,
            level: data.level || 1,
            xp: data.xp || 0,
            streak: data.currentStreak || 0,
            accuracy: data.accuracy || 0,
            xpToNext: data.xpToNext || 100,
            lastPlayed: data.lastActive || null,
            gameStats: data.gameStats || {}
          }
        };
      }
    } catch (e) {}
    return {
      uid: userId || 'unknown',
      displayName: 'New User',
      email: '',
      avatar: '👤',
      role: 'student',
      progress: { wordsLearned: 0, gamesPlayed: 0, totalPoints: 0, level: 1, xp: 0, streak: 0, accuracy: 0, xpToNext: 100, lastPlayed: null, gameStats: {} }
    };
  });

  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem('vocaboplay_progress');
    return saved ? JSON.parse(saved) : {
      wordsLearned: 0,
      gamesPlayed: 0,
      totalPoints: 0,
      level: 1,
      xp: 0,
      streak: 0,
      accuracy: 0,
      xpToNext: 100
    };
  });

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!userId) {
        navigate('/login');
        return;
      }

      try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.role !== 'student') {
            navigate('/admin/dashboard');
            return;
          }
          if (userData.equippedAvatar) {
            setEquippedAvatar(userData.equippedAvatar);
          }
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
      }
    };

    fetchStudentData();
  }, [userId, navigate]);

  const handleJoinActivity = async () => {
    if (!joinPin.trim() || joinPin.length < 6) {
      setJoinError('Please enter a valid 6-digit PIN');
      return;
    }

    setJoinLoading(true);
    setJoinError('');

    try {
      const activitiesQuery = query(
        collection(db, 'activities'),
        where('gamePin', '==', joinPin.trim()),
        where('isActive', '==', true)
      );
      const activitiesSnap = await getDocs(activitiesQuery);

      if (activitiesSnap.empty) {
        setJoinError('❌ No active activity found with this PIN');
        setJoinLoading(false);
        return;
      }

      const activityDoc = activitiesSnap.docs[0];
      const activityData = { id: activityDoc.id, ...activityDoc.data() };

      const scoresQuery = query(
        collection(db, 'scores'),
        where('activityId', '==', activityDoc.id),
        where('studentId', '==', userId)
      );
      const scoresSnap = await getDocs(scoresQuery);

      if (!scoresSnap.empty) {
        setJoinError('✅ You have already completed this activity!');
        setJoinLoading(false);
        setTimeout(() => {
          setJoinPin('');
          setShowJoinModal(false);
          setJoinError('');
        }, 2000);
        return;
      }

      setSelectedActivity(activityData);
      setShowActivityModal(true);
      setJoinPin('');
      setShowJoinModal(false);
      setJoinError('');

    } catch (error) {
      console.error('Error joining activity:', error);
      setJoinError('Failed to join activity. Please try again.');
    } finally {
      setJoinLoading(false);
    }
  };

  const startActivity = async () => {
    if (!selectedActivity) return;

    const gameMap = {
      'quiz': 'quiz',
      'match': 'match',
      'wordpics': 'wordpics',
      'guesswhat': 'guesswhat'
    };

    const gameId = gameMap[selectedActivity.gameType] || 'quiz';
    setCurrentGame(gameId);
    setShowActivityModal(false);

    localStorage.setItem('currentActivity', JSON.stringify(selectedActivity));
  };

  const updateProgress = async (updates) => {
    if (!userId) return null;

    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : {};

      const currentProgress = {
        wordsLearned: userData.wordsLearned || 0,
        gamesPlayed: userData.gamesPlayed || 0,
        totalPoints: userData.totalPoints || 0,
        level: userData.level || 1,
        xp: userData.xp || 0,
        streak: userData.currentStreak || 0,
        accuracy: userData.accuracy || 0,
        xpToNext: userData.xpToNext || 100,
        lastPlayed: userData.lastActive || null,
        gameStats: userData.gameStats || {}
      };

      const newProgress = { ...currentProgress };

      const today = new Date().toDateString();
      const lastPlayed = currentProgress.lastPlayed ? new Date(currentProgress.lastPlayed).toDateString() : null;

      let newStreak = currentProgress.streak || 0;

      if (updates.gamesPlayed !== undefined || updates.wordsLearned !== undefined || updates.totalPoints !== undefined) {
        if (lastPlayed === today) {
          newStreak = currentProgress.streak || 0;
        } else if (lastPlayed) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          if (lastPlayed === yesterday.toDateString()) {
            newStreak = (currentProgress.streak || 0) + 1;
          } else {
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }
      }

      newProgress.streak = newStreak;
      newProgress.lastPlayed = new Date().toISOString();

      let pointsEarned = 0;
      if (updates.totalPoints !== undefined) {
        pointsEarned = updates.totalPoints;
      } else if (updates.score !== undefined) {
        pointsEarned = updates.score;
      }

      const xpGained = updates.xp !== undefined ? updates.xp : pointsEarned;

      if (updates.totalPoints !== undefined) {
        newProgress.totalPoints = (currentProgress.totalPoints || 0) + updates.totalPoints;
      } else if (pointsEarned > 0) {
        newProgress.totalPoints = (currentProgress.totalPoints || 0) + pointsEarned;
      }

      newProgress.xp = (currentProgress.xp || 0) + xpGained;

      if (updates.gamesPlayed !== undefined) newProgress.gamesPlayed = (currentProgress.gamesPlayed || 0) + updates.gamesPlayed;
      if (updates.wordsLearned !== undefined) newProgress.wordsLearned = (currentProgress.wordsLearned || 0) + updates.wordsLearned;

      newProgress.level = Math.floor((newProgress.xp || 0) / 100) + 1;
      newProgress.xpToNext = newProgress.level * 100;

      const gameStats = { ...currentProgress.gameStats };

      if (updates.QuizGame) {
        gameStats.QuizGame = {
          played: (gameStats.QuizGame?.played || 0) + (updates.QuizGame.gamesCompleted || 0),
          correct: (gameStats.QuizGame?.correct || 0) + (updates.QuizGame.correctAnswers || 0),
          total: (gameStats.QuizGame?.total || 0) + (updates.QuizGame.totalQuestions || 0)
        };
      }

      if (updates.MatchGame) {
        gameStats.MatchGame = {
          played: (gameStats.MatchGame?.played || 0) + (updates.MatchGame.gamesCompleted || 0),
          correct: (gameStats.MatchGame?.correct || 0) + (updates.MatchGame.correctPairs || 0),
          total: (gameStats.MatchGame?.total || 0) + (updates.MatchGame.totalPairs || 0)
        };
      }

      newProgress.gameStats = gameStats;

      let totalGamesPlayed = 0;
      let totalQuestionsAll = 0;

      Object.values(gameStats).forEach(game => {
        if (game && typeof game === 'object') {
          totalGamesPlayed += game.played || 0;
          totalQuestionsAll += game.total || 0;
        }
      });

      if (!updates.gamesPlayed) newProgress.gamesPlayed = totalGamesPlayed;

      if (totalQuestionsAll > 0) {
        const totalCorrect = Object.values(gameStats).reduce((sum, game) => sum + (game.correct || 0), 0);
        newProgress.accuracy = Math.round((totalCorrect / totalQuestionsAll) * 100);
      }

      const updateData = {
        wordsLearned: newProgress.wordsLearned,
        gamesPlayed: newProgress.gamesPlayed,
        totalPoints: newProgress.totalPoints,
        level: newProgress.level,
        xp: newProgress.xp,
        xpToNext: newProgress.xpToNext,
        currentStreak: newProgress.streak,
        accuracy: newProgress.accuracy,
        gameStats: newProgress.gameStats,
        lastActive: new Date().toISOString()
      };

      await updateDoc(userRef, updateData);
      localStorage.setItem('vocaboplay_progress', JSON.stringify(newProgress));

      const event = new CustomEvent('progressUpdate', {
        detail: {
          wordsLearned: newProgress.wordsLearned,
          gamesPlayed: newProgress.gamesPlayed,
          totalPoints: newProgress.totalPoints,
          level: newProgress.level,
          xp: newProgress.xp,
          streak: newProgress.streak,
          accuracy: newProgress.accuracy,
          gameStats: newProgress.gameStats
        }
      });
      window.dispatchEvent(event);

      return newProgress;
    } catch (error) {
      console.error('❌ Firebase error:', error);
      return null;
    }
  };

  const completeActivity = async (activityId, score, correctAnswers, totalQuestions) => {
    try {
      await addDoc(collection(db, 'scores'), {
        activityId: activityId,
        studentId: userId,
        studentName: userProfile.displayName || 'Student',
        score: score,
        correctAnswers: correctAnswers,
        totalQuestions: totalQuestions,
        completedAt: new Date().toISOString()
      });

      const activityRef = doc(db, 'activities', activityId);
      const activitySnap = await getDoc(activityRef);
      if (activitySnap.exists()) {
        await updateDoc(activityRef, {
          participants: (activitySnap.data().participants || 0) + 1
        });
      }

      if (updateProgress) {
        await updateProgress({
          totalPoints: score,
          xp: score,
          wordsLearned: correctAnswers,
          totalAnswers: totalQuestions,
          correctAnswers: correctAnswers,
        });
      }

    } catch (error) {
      console.error('Error completing activity:', error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    auth.signOut().catch(console.error);
    navigate('/');
  };

  const startGame = (gameId) => {
    const availableGames = ['wordpics', 'match', 'quiz', 'guesswhat', 'short-story'];
    if (!availableGames.includes(gameId)) return;
    setCurrentGame(gameId);
    setActiveMenu(null);
    setIsSidebarVisible(false);
    window.scrollTo(0, 0);
  };

  const exitGame = () => {
    setCurrentGame(null);
    setActiveMenu('Dashboard');
    setIsSidebarVisible(true);
  };

  const changeMenu = (menu) => {
    setActiveMenu(menu);
    setContentKey(prev => prev + 1);
    setCurrentGame(null);
    if (window.innerWidth <= 768) setIsSidebarVisible(false);
  };

  const handleLiveJoined = (session) => {
    setLiveSession(session);
    setLivePlayerId(userId);
    setLiveView('lobby');
    setShowLiveJoinModal(false);
  };

  const handleLiveGameStart = (session) => {
    setLiveSession(session);
    setLiveView('game');
  };

  const handleLiveGameEnd = (session) => {
    setLiveSession(session);
    setLiveView('results');
  };

  const handleLiveExit = () => {
    setLiveSession(null);
    setLiveView(null);
    setLivePlayerId(null);
  };

  const menuItems = [
    { name: 'Dashboard', icon: '⊞' },
    { name: 'Word Library', icon: '≡' },
    { name: 'Games', icon: '▶' },
    { name: 'My Progress', icon: '↗' },
    { name: 'Favorites', icon: '★' },
    { name: 'Leaderboards', icon: '⚑' },
    { name: 'Avatar Shop', icon: '🛍️' },
  ];

  const displayProgress = DEMO_FORCE_LEVEL ? {
    wordsLearned: stats?.progress?.wordsLearned || progress.wordsLearned || 0,
    gamesPlayed: stats?.progress?.gamesPlayed || progress.gamesPlayed || 0,
    totalPoints: stats?.progress?.totalPoints || progress.totalPoints || 0,
    level: 3,
    xp: 150,
    streak: stats?.progress?.streak || progress.streak || 0,
    accuracy: stats?.progress?.accuracy || progress.accuracy || 0,
    xpToNext: 300
  } : (stats?.progress ? {
    wordsLearned: stats.progress.wordsLearned || 0,
    gamesPlayed: stats.progress.gamesPlayed || 0,
    totalPoints: stats.progress.totalPoints || 0,
    level: stats.progress.level || 1,
    xp: stats.progress.xp || 0,
    streak: stats.progress.streak || 0,
    accuracy: stats.progress.accuracy || 0,
    xpToNext: stats.progress.xpToNext || 100
  } : progress);

  const displayName = stats?.displayName || userProfile?.displayName || 'User';
  const displayAvatar = stats?.avatar || userProfile?.avatar || '👤';
  const displayEmail = stats?.email || userProfile?.email || '';

  if (liveView === 'lobby' && liveSession) {
    return (
      <LivePlayerLobby
        session={liveSession}
        playerId={livePlayerId}
        onGameStart={handleLiveGameStart}
        onCancel={handleLiveExit}
      />
    );
  }

  if (liveView === 'game' && liveSession) {
    return (
      <LivePlayerGame
        session={liveSession}
        playerId={livePlayerId}
        onGameEnd={handleLiveGameEnd}
      />
    );
  }

  if (liveView === 'results' && liveSession) {
    return (
      <LivePlayerResults
        session={liveSession}
        playerId={livePlayerId}
        onExit={handleLiveExit}
      />
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: palette.cream, fontFamily: "'Nunito', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '50px', height: '50px', border: `4px solid ${palette.border}`, borderTop: `4px solid ${palette.warmOrange}`, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
          <p style={{ color: palette.bodyText, fontFamily: "'Fredoka', sans-serif", fontWeight: 600 }}>Loading your dashboard...</p>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;500;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Nunito', system-ui, sans-serif; background: #FFF8F0; }
        .menu-item { transition: background 0.15s ease, color 0.15s ease; }
        .menu-item:hover { background: rgba(255,255,255,0.15); }
        .menu-item.active { background: rgba(255,255,255,0.22); border-left: 3px solid #ffffff; padding-left: 22px; }
        .theme-toggle-wrap, .theme-toggle-wrap span, .theme-toggle-wrap p, .theme-toggle-wrap label { color: #ffffff !important; opacity: 1 !important; }
        .dashboard-container { opacity: 0; transform: translateY(20px); animation: fadeInUp 0.8s ease-out forwards; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 768px) {
          .sidebar-fixed { transform: translateX(-100%) !important; }
          .sidebar-fixed.open { transform: translateX(0) !important; }
          .main-content { margin-left: 0 !important; padding: 16px !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .dashboard-welcome { flex-direction: column !important; text-align: center !important; padding: 20px !important; }
          .dashboard-welcome-img { width: 72px !important; height: 72px !important; }
          .dashboard-welcome-title { font-size: 20px !important; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr !important; }
          .dashboard-welcome { padding: 16px !important; }
        }
      `}</style>

      <div className={`sidebar-fixed ${isSidebarVisible ? 'open' : ''}`} style={{
        width: '260px',
        background: `linear-gradient(180deg, ${palette.warmOrange} 0%, ${palette.coral} 100%)`,
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        left: 0,
        top: 0,
        padding: '0',
        fontFamily: "'Nunito', sans-serif",
        zIndex: 1000,
        transition: 'transform 0.3s ease',
        transform: isSidebarVisible ? 'translateX(0)' : 'translateX(-100%)',
        boxShadow: '4px 0 24px rgba(244, 162, 97, 0.35)',
      }}>
        <div style={{ padding: '24px 24px', fontSize: '22px', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.15)', color: '#ffffff', fontFamily: "'Fredoka', sans-serif" }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/image/logo.png" alt="VocaboPlay" style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'block', flexShrink: 0 }} />
            <span style={{ fontSize: '20px' }}>VocaboPlay</span>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '20px 0' }}>
          {menuItems.map((item) => (
            <div key={item.name} className={`menu-item ${activeMenu === item.name ? 'active' : ''}`} onClick={() => changeMenu(item.name)} style={{ padding: '14px 24px', margin: '4px 12px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', fontSize: '17px', fontWeight: activeMenu === item.name ? 700 : 500, color: '#ffffff', fontFamily: "'Fredoka', sans-serif", background: 'transparent', borderRadius: '10px', borderLeft: '3px solid transparent', letterSpacing: '0.3px' }}>
              <span style={{ fontSize: '20px', width: '22px', textAlign: 'center' }}>{item.icon}</span>
              <span>{item.name}</span>
            </div>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', padding: '12px 0' }}>
          <div className="theme-toggle-wrap"><ThemeToggle colors={colors} fontFamily={fontFamily} /></div>
          <div className="menu-item" onClick={() => changeMenu('My Profile')} style={{ padding: '14px 24px', margin: '4px 12px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', fontSize: '17px', fontWeight: activeMenu === 'My Profile' ? 700 : 500, color: '#ffffff', fontFamily: "'Fredoka', sans-serif", background: 'transparent', borderRadius: '10px', letterSpacing: '0.3px' }}>
            <span style={{ fontSize: '20px', width: '22px', textAlign: 'center' }}>⊙</span>
            <span>Profile</span>
          </div>
        </div>
      </div>

      {!isSidebarVisible && (
        <button onClick={() => setIsSidebarVisible(true)} style={{ position: 'fixed', top: '15px', left: '15px', zIndex: 1001, background: palette.white, color: palette.warmOrange, border: `2px solid ${palette.border}`, borderRadius: '10px', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', cursor: 'pointer', boxShadow: `0 4px 0 ${palette.border}` }}>☰</button>
      )}

      {isSidebarVisible && window.innerWidth <= 768 && (
        <div onClick={() => setIsSidebarVisible(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(45, 42, 94, 0.4)', zIndex: 999 }} />
      )}

      <div key={contentKey} className="dashboard-container" style={{ display: 'flex', minHeight: '100vh', background: palette.cream, fontFamily: "'Nunito', sans-serif" }}>
        <div className="main-content" style={{ flex: 1, marginLeft: isSidebarVisible ? '260px' : '0', padding: '24px 32px', overflowY: 'auto', transition: 'margin-left 0.3s ease' }}>

          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '28px', gap: '15px', position: 'relative', flexWrap: 'wrap' }}>
            <div className="profile-menu-top" style={{ background: palette.white, padding: '6px 14px 6px 8px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', border: `2px solid ${palette.border}`, fontFamily: "'Nunito', sans-serif", boxShadow: `0 3px 0 ${palette.border}` }} onClick={() => setShowProfileMenu(!showProfileMenu)}>

              <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                {equippedAvatar ? (
                  <CharacterAvatar avatarId={equippedAvatar} size="small" showBorder={false} />
                ) : (
                  <div style={{ width: '32px', height: '32px', background: palette.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', borderRadius: '50%' }}>
                    👤
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', minWidth: '0' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: palette.deepNavy, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px', fontFamily: "'Fredoka', sans-serif" }}>{displayName}</span>
                <span style={{ fontSize: '11px', color: palette.bodyText, fontWeight: 600 }}>Student</span>
              </div>
              <span style={{ fontSize: '10px', color: palette.bodyText, marginLeft: '2px' }}>▼</span>
            </div>

            {showProfileMenu && (
              <>
                <div onClick={() => setShowProfileMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 999 }} />
                <div style={{ position: 'absolute', top: '50px', right: '0', background: palette.white, borderRadius: '14px', zIndex: 1000, minWidth: '220px', overflow: 'hidden', border: `2px solid ${palette.border}`, fontFamily: "'Nunito', sans-serif", boxShadow: '0 10px 30px rgba(244, 162, 97, 0.18)' }}>
                  <div style={{ padding: '12px 14px', background: palette.cream, borderBottom: `2px solid ${palette.border}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                      {equippedAvatar ? (
                        <CharacterAvatar avatarId={equippedAvatar} size="small" showBorder={false} />
                      ) : (
                        <div style={{ width: '34px', height: '34px', background: palette.warmOrange, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', borderRadius: '50%', color: '#fff' }}>
                          👤
                        </div>
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: palette.deepNavy, fontFamily: "'Fredoka', sans-serif" }}>{displayName}</div>
                      <div style={{ fontSize: '11px', color: palette.bodyText, fontWeight: 600 }}>{displayEmail || 'student@email.com'}</div>
                    </div>
                  </div>
                  <div style={{ padding: '4px' }}>
                    <button onClick={() => { setShowProfileMenu(false); changeMenu('My Profile'); }} style={{ width: '100%', padding: '9px 12px', border: 'none', background: 'none', fontSize: '13px', cursor: 'pointer', textAlign: 'left', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', color: palette.bodyText, fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>👤 My Profile</button>
                    <button onClick={() => { setShowProfileMenu(false); changeMenu('My Progress'); }} style={{ width: '100%', padding: '9px 12px', border: 'none', background: 'none', fontSize: '13px', cursor: 'pointer', textAlign: 'left', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', color: palette.bodyText, fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>📊 My Progress</button>
                    <button onClick={() => { setShowProfileMenu(false); changeMenu('Leaderboards'); }} style={{ width: '100%', padding: '9px 12px', border: 'none', background: 'none', fontSize: '13px', cursor: 'pointer', textAlign: 'left', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', color: palette.bodyText, fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>🏆 Leaderboards</button>
                    <div style={{ height: '2px', background: palette.border, margin: '4px 0' }}></div>
                    <button onClick={handleLogout} style={{ width: '100%', padding: '9px 12px', border: 'none', background: 'none', fontSize: '13px', cursor: 'pointer', textAlign: 'left', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', color: '#d32f2f', fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>🚪 Sign Out</button>
                  </div>
                </div>
              </>
            )}
          </div>

          {currentGame === 'wordpics' && <WordPicsGame onBack={exitGame} updateProgress={updateProgress} />}
          {currentGame === 'match' && <MatchGame onBack={exitGame} updateProgress={updateProgress} />}
          {currentGame === 'quiz' && <QuizGame onBack={exitGame} updateProgress={updateProgress} completeActivity={completeActivity} activityData={selectedActivity} />}
          {currentGame === 'guesswhat' && <GuessWhatGame onBack={exitGame} updateProgress={updateProgress} />}
          {currentGame === 'short-story' && <ShortStoryGame onBack={exitGame} updateProgress={updateProgress} />}

          {!currentGame && activeMenu === 'Word Library' && <WordLibrary />}
          {!currentGame && activeMenu === 'Games' && <PlayGames startGame={startGame} />}
          {!currentGame && activeMenu === 'My Progress' && <MyProgress />}
          {!currentGame && activeMenu === 'My Profile' && <Profile onBack={() => changeMenu('Dashboard')} userProfile={userProfile} onUpdate={(p) => setUserProfile(p)} />}
          {!currentGame && activeMenu === 'Leaderboards' && <Leaderboards onBack={() => changeMenu('Dashboard')} isAdmin={false} currentUserId={userId} />}
          {!currentGame && activeMenu === 'Favorites' && <FavoritesPage />}

          {!currentGame && activeMenu === 'Avatar Shop' && (
            <AvatarShop
              currentPoints={displayProgress.totalPoints || 0}
              onPointsChange={(newPoints) => {
                setProgress({ ...progress, totalPoints: newPoints });
                const savedProgress = localStorage.getItem('vocaboplay_progress');
                if (savedProgress) {
                  const p = JSON.parse(savedProgress);
                  p.totalPoints = newPoints;
                  localStorage.setItem('vocaboplay_progress', JSON.stringify(p));
                }
              }}
              onEquipChange={(avatarId) => setEquippedAvatar(avatarId)}
            />
          )}

          {!currentGame && activeMenu === 'Dashboard' && (
            <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
              <div
                className="dashboard-welcome"
                style={{
                  background: `linear-gradient(135deg, ${palette.warmOrange} 0%, ${palette.coral} 100%)`,
                  borderRadius: '24px',
                  padding: '32px 36px',
                  marginBottom: '24px',
                  display: 'flex',
                  gap: '32px',
                  alignItems: 'center',
                  color: 'white',
                  flexWrap: 'wrap',
                  boxShadow: '0 8px 32px rgba(244, 162, 97, 0.3)',
                  minHeight: '300px',
                  border: '3px solid rgba(255,255,255,0.25)',
                }}
              >
                <div style={{ flexShrink: 0 }}>
                  <MascotCarousel level={displayProgress.level || 1} size={250} animated={true} />
                </div>

                <div style={{ flex: 1, minWidth: '300px' }}>
                  <h2
                    className="dashboard-welcome-title"
                    style={{ fontSize: '32px', fontWeight: 700, color: 'white', margin: '0 0 10px 0', fontFamily: "'Fredoka', sans-serif" }}
                  >
                    Welcome back, {displayName}! 🎉
                  </h2>
                  <p style={{ fontSize: '16px', opacity: '0.95', marginBottom: '20px', fontFamily: "'Nunito', sans-serif", fontWeight: 500 }}>
                    Continue your vocabulary journey and complete your activities!
                  </p>

                  <div style={{ marginBottom: '22px', maxWidth: '540px' }}>
                    <ExpBar
                      xp={displayProgress.xp || 0}
                      xpToNext={displayProgress.xpToNext || 100}
                      level={displayProgress.level || 1}
                      color="#FFD700"
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setShowJoinModal(true)}
                      style={{ ...chunkyButton('white', '#D8CCFF'), color: palette.deepNavy, padding: '12px 24px', fontSize: '14px' }}
                      onMouseDown={e => pressBtn(e, '#D8CCFF')}
                      onMouseUp={e => releaseBtn(e, '#D8CCFF')}
                      onMouseLeave={e => releaseBtn(e, '#D8CCFF')}
                    >🔑 Enter Code</button>
                    <button
                      onClick={() => setShowLiveJoinModal(true)}
                      style={{ ...chunkyButton(palette.softGreen, palette.softGreenShadow), padding: '12px 24px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      onMouseDown={e => pressBtn(e, palette.softGreenShadow)}
                      onMouseUp={e => releaseBtn(e, palette.softGreenShadow)}
                      onMouseLeave={e => releaseBtn(e, palette.softGreenShadow)}
                    >🎮 Join Live</button>
                    <button
                      onClick={() => changeMenu('Games')}
                      style={{ background: 'transparent', color: 'white', border: '2px solid rgba(255,255,255,0.6)', padding: '12px 24px', borderRadius: '14px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Fredoka', sans-serif" }}
                    >🎯 Play Games</button>
                  </div>
                </div>
              </div>

              <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {[
                  { label: 'Words Learned', value: displayProgress.wordsLearned || 0 },
                  { label: 'Games Played', value: displayProgress.gamesPlayed || 0 },
                  { label: 'Current Streak', value: displayProgress.streak || 0, unit: 'days' },
                  { label: 'Total Points', value: displayProgress.totalPoints || 0 },
                ].map((stat, i) => (
                  <div key={i} style={{ background: palette.white, borderRadius: '16px', padding: '20px', border: `2px solid ${palette.border}`, boxShadow: '0 6px 18px rgba(244, 162, 97, 0.10)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: palette.bodyText, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: "'Fredoka', sans-serif" }}>{stat.label}</span>
                      {stat.label === 'Total Points' && <span style={{ padding: '3px 9px', background: palette.cream, borderRadius: '8px', fontSize: '11px', color: palette.warmOrange, fontWeight: 700, fontFamily: "'Fredoka', sans-serif" }}>Level {displayProgress.level || 1}</span>}
                    </div>
                    <div><span style={{ fontSize: '28px', fontWeight: 800, color: palette.deepNavy, fontFamily: "'Fredoka', sans-serif" }}>{stat.value}</span>{stat.unit && <span style={{ fontSize: '13px', color: palette.bodyText, marginLeft: '4px', fontWeight: 600 }}>{stat.unit}</span>}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showJoinModal && (
            <div style={styles.modalOverlay} onClick={() => setShowJoinModal(false)}>
              <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button style={styles.modalClose} onClick={() => setShowJoinModal(false)}>✕</button>
                <h2 style={styles.modalTitle}>🔑 Enter Code</h2>
                <p style={styles.modalSubtitle}>Enter the 6-digit PIN provided by your teacher</p>

                {joinError && <div style={styles.errorMessage}>{joinError}</div>}

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Activity PIN</label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit PIN (e.g., 291954)"
                    value={joinPin}
                    onChange={(e) => setJoinPin(e.target.value.toUpperCase().slice(0, 6))}
                    style={styles.input}
                    maxLength={6}
                    autoFocus
                  />
                </div>

                <button
                  onClick={handleJoinActivity}
                  style={styles.primaryBtn}
                  disabled={joinLoading}
                  onMouseDown={e => !joinLoading && pressBtn(e, palette.warmOrangeShadow)}
                  onMouseUp={e => !joinLoading && releaseBtn(e, palette.warmOrangeShadow)}
                  onMouseLeave={e => !joinLoading && releaseBtn(e, palette.warmOrangeShadow)}
                >
                  {joinLoading ? 'Joining...' : 'Join Activity →'}
                </button>

                <div style={{
                  background: palette.cream,
                  border: `2px solid ${palette.warmOrange}`,
                  borderRadius: '12px',
                  padding: '12px 16px',
                  marginTop: '16px',
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'flex-start'
                }}>
                  <span style={{ fontSize: '20px' }}>💡</span>
                  <div style={{ fontSize: '12px', color: palette.bodyText, lineHeight: 1.4, fontWeight: 600 }}>
                    <strong style={{ color: palette.deepNavy, fontFamily: "'Fredoka', sans-serif" }}>Live Game?</strong> Click "🎮 Join Live Game" below if your teacher is hosting a live quiz.
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowJoinModal(false);
                    setShowLiveJoinModal(true);
                  }}
                  style={{
                    ...chunkyButton(palette.softGreen, palette.softGreenShadow),
                    width: '100%',
                    padding: '12px',
                    fontSize: '14px',
                    marginTop: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseDown={e => pressBtn(e, palette.softGreenShadow)}
                  onMouseUp={e => releaseBtn(e, palette.softGreenShadow)}
                  onMouseLeave={e => releaseBtn(e, palette.softGreenShadow)}
                >
                  🎮 Join Live Game
                </button>
              </div>
            </div>
          )}

          {showActivityModal && selectedActivity && (
            <div style={styles.modalOverlay} onClick={() => setShowActivityModal(false)}>
              <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button style={styles.modalClose} onClick={() => setShowActivityModal(false)}>✕</button>
                <h2 style={styles.modalTitle}>{selectedActivity.title}</h2>

                <div style={styles.activityDetail}>
                  <p><strong>Type:</strong> {selectedActivity.gameType || 'Quiz'}</p>
                  <p><strong>Questions:</strong> {selectedActivity.totalQuestions || 0}</p>
                  <p><strong>Difficulty:</strong> ⭐ {selectedActivity.difficulty || 3}</p>
                  {selectedActivity.category && <p><strong>Category:</strong> {selectedActivity.category}</p>}
                </div>

                <div style={styles.modalActions}>
                  <button onClick={() => setShowActivityModal(false)} style={styles.cancelBtn}>
                    Cancel
                  </button>
                  <button
                    onClick={startActivity}
                    style={styles.startBtn}
                    onMouseDown={e => pressBtn(e, palette.softGreenShadow)}
                    onMouseUp={e => releaseBtn(e, palette.softGreenShadow)}
                    onMouseLeave={e => releaseBtn(e, palette.softGreenShadow)}
                  >
                    🚀 Start Activity
                  </button>
                </div>
              </div>
            </div>
          )}

          {showLiveJoinModal && (
            <LiveJoinModal
              onClose={() => setShowLiveJoinModal(false)}
              onJoined={handleLiveJoined}
            />
          )}
        </div>
      </div>
    </>
  );
};

const styles = {
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(45, 42, 94, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' },
  modalContent: { background: 'white', borderRadius: '24px', padding: '32px', maxWidth: '440px', width: '90%', position: 'relative', border: `2px solid ${palette.border}`, boxShadow: '0 20px 60px rgba(244, 162, 97, 0.25)' },
  modalClose: { position: 'absolute', top: '16px', right: '20px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: palette.bodyText },
  modalTitle: { fontSize: '22px', fontWeight: 800, color: palette.deepNavy, margin: '0 0 8px 0', fontFamily: "'Fredoka', sans-serif" },
  modalSubtitle: { fontSize: '14px', color: palette.bodyText, margin: '0 0 20px 0', fontFamily: "'Nunito', sans-serif", fontWeight: 500 },
  errorMessage: { padding: '12px 14px', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '12px', color: '#c33', fontSize: '13px', marginBottom: '16px', fontFamily: "'Nunito', sans-serif", fontWeight: 600 },
  fieldGroup: { marginBottom: '16px' },
  label: { fontSize: '13px', fontWeight: 700, color: palette.deepNavy, display: 'block', marginBottom: '4px', fontFamily: "'Fredoka', sans-serif" },
  input: { width: '100%', padding: '12px 16px', border: `2px solid ${palette.border}`, borderRadius: '12px', fontSize: '18px', fontFamily: "'Nunito', sans-serif", fontWeight: 700, boxSizing: 'border-box', textAlign: 'center', letterSpacing: '4px', color: palette.deepNavy, outline: 'none' },
  primaryBtn: { width: '100%', padding: '14px', ...chunkyButton(palette.warmOrange, palette.warmOrangeShadow), fontSize: '16px' },
  activityDetail: { background: palette.cream, padding: '16px', borderRadius: '14px', marginBottom: '20px', border: `2px solid ${palette.border}`, fontFamily: "'Nunito', sans-serif", fontWeight: 600, color: palette.bodyText, fontSize: '14px', lineHeight: 1.8 },
  modalActions: { display: 'flex', gap: '12px' },
  cancelBtn: { flex: 1, padding: '12px', background: palette.cream, color: palette.deepNavy, border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Fredoka', sans-serif" },
  startBtn: { flex: 2, padding: '12px', ...chunkyButton(palette.softGreen, palette.softGreenShadow), fontSize: '15px' },
};

export default Dashboard;