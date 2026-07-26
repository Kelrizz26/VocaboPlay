// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../pages/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useUserStats } from '../hooks/useUserStats';
import Profile from './Profile';
import Leaderboards from './Leaderboards';

// Import dashboard components
import WordPicsGame from './dashboard/WordPicsGame';
import QuizGame from './dashboard/QuizGame';
import MatchGame from './dashboard/MatchGame';
import GuessWhatGame from './dashboard/GuessWhatGame';
import ShortStoryGame from './dashboard/ShortStoryGame';
import SentenceBuilder from './dashboard/SentenceBuilder';
import MyProgress from './dashboard/MyProgress';
import WordLibrary from './dashboard/WordLibrary';
import FavoritesPage from './dashboard/FavoritesPage';
import PlayGames from './dashboard/PlayGames';
import { colors, fontFamily, type as textType } from './dashboard/dashboardStyles';
import ThemeToggle from './ThemeToggle';

// ============================================================
// ===== GET USER PROFILE FROM FIREBASE =====
// ============================================================
const getUserProfile = () => {
  try {
    const userId = localStorage.getItem('userId');
    const cachedData = localStorage.getItem('firebaseUserData');
    
    if (cachedData) {
      const data = JSON.parse(cachedData);
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
    
    // Fallback
    return {
      uid: userId || 'unknown',
      displayName: localStorage.getItem('userDisplayName') || 'New User',
      email: localStorage.getItem('userEmail') || '',
      avatar: '👤',
      role: 'student',
      progress: {
        wordsLearned: 0,
        gamesPlayed: 0,
        totalPoints: 0,
        level: 1,
        xp: 0,
        streak: 0,
        accuracy: 0,
        xpToNext: 100,
        lastPlayed: null,
        gameStats: {}
      }
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return {
      displayName: 'New User',
      email: '',
      avatar: '👤',
      progress: {
        wordsLearned: 0,
        gamesPlayed: 0,
        totalPoints: 0,
        level: 1,
        xp: 0,
        streak: 0,
        accuracy: 0,
        xpToNext: 100,
        lastPlayed: null,
        gameStats: {}
      }
    };
  }
};

// ============================================================
// ===== PROGRESS UPDATE HELPER =====
// ============================================================
const updateProgress = async (updates) => {
  console.log('📊 updateProgress called with:', updates);

  const userId = localStorage.getItem('userId');
  if (!userId) {
    console.error('❌ No userId found');
    return null;
  }

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

    // Streak logic
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

    // XP and level
    if (updates.xp !== undefined) {
      newProgress.xp = (currentProgress.xp || 0) + updates.xp;
    }
    if (updates.totalPoints !== undefined) {
      newProgress.totalPoints = (currentProgress.totalPoints || 0) + updates.totalPoints;
    }
    if (updates.gamesPlayed !== undefined) {
      newProgress.gamesPlayed = (currentProgress.gamesPlayed || 0) + updates.gamesPlayed;
    }
    if (updates.wordsLearned !== undefined) {
      newProgress.wordsLearned = (currentProgress.wordsLearned || 0) + updates.wordsLearned;
    }
    if (updates.correctAnswers !== undefined) {
      const currentCorrect = userData.correctAnswers || 0;
      const newCorrect = currentCorrect + updates.correctAnswers;
      const totalQuestions = (currentProgress.gameStats?.QuizGame?.total || 0) + (updates.QuizGame?.totalQuestions || 0);
      newProgress.accuracy = totalQuestions > 0 ? Math.round((newCorrect / totalQuestions) * 100) : 0;
    }
    
    newProgress.level = Math.floor((newProgress.xp || 0) / 100) + 1;

    // Merge game stats
    const gameStats = { ...currentProgress.gameStats };

    if (updates.WordPics) {
      gameStats.WordPics = {
        played: (gameStats.WordPics?.played || 0) + (updates.WordPics.gamesPlayed || 0),
        correct: (gameStats.WordPics?.correct || 0) + (updates.WordPics.correctAnswers || 0),
        total: (gameStats.WordPics?.total || 0) + (updates.WordPics.totalQuestions || 0)
      };
    }

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

    if (updates.GuessWhat) {
      gameStats.GuessWhat = {
        played: (gameStats.GuessWhat?.played || 0) + (updates.GuessWhat.gamesCompleted || 0),
        correct: (gameStats.GuessWhat?.correct || 0) + (updates.GuessWhat.correctAnswers || 0),
        total: (gameStats.GuessWhat?.total || 0) + (updates.GuessWhat.totalQuestions || 0)
      };
    }

    if (updates.SentenceBuilder) {
      gameStats.SentenceBuilder = {
        played: (gameStats.SentenceBuilder?.played || 0) + (updates.SentenceBuilder.gamesCompleted || 0),
        correct: (gameStats.SentenceBuilder?.correct || 0) + (updates.SentenceBuilder.correctAnswers || 0),
        total: (gameStats.SentenceBuilder?.total || 0) + (updates.SentenceBuilder.totalQuestions || 0)
      };
    }

    if (updates.ShortStorvGame) {
      gameStats.ShortStorvGame = {
        played: (gameStats.ShortStorvGame?.played || 0) + (updates.ShortStorvGame.storiesCompleted || 0),
        correct: (gameStats.ShortStorvGame?.correct || 0) + (updates.ShortStorvGame.quizzesPassed || 0),
        total: (gameStats.ShortStorvGame?.total || 0) + (updates.ShortStorvGame.chaptersRead || 0)
      };
    }

    newProgress.gameStats = gameStats;

    // Recalculate overall
    let totalGamesPlayed = 0;
    let totalQuestionsAll = 0;
    
    Object.values(gameStats).forEach(game => {
      if (game && typeof game === 'object') {
        totalGamesPlayed += game.played || 0;
        totalQuestionsAll += game.total || 0;
      }
    });
    
    if (!updates.gamesPlayed) {
      newProgress.gamesPlayed = totalGamesPlayed;
    }
    
    if (totalQuestionsAll > 0) {
      const totalCorrect = Object.values(gameStats).reduce((sum, game) => sum + (game.correct || 0), 0);
      newProgress.accuracy = Math.round((totalCorrect / totalQuestionsAll) * 100);
    }

    // Save to Firebase
    await updateDoc(userRef, {
      wordsLearned: newProgress.wordsLearned,
      gamesPlayed: newProgress.gamesPlayed,
      totalPoints: newProgress.totalPoints,
      level: newProgress.level,
      xp: newProgress.xp,
      currentStreak: newProgress.streak,
      accuracy: newProgress.accuracy,
      gameStats: newProgress.gameStats,
      correctAnswers: userData.correctAnswers ? userData.correctAnswers + (updates.correctAnswers || 0) : (updates.correctAnswers || 0),
      lastActive: new Date().toISOString()
    });

    // Update local cache
    const updatedUserData = {
      ...userData,
      wordsLearned: newProgress.wordsLearned,
      gamesPlayed: newProgress.gamesPlayed,
      totalPoints: newProgress.totalPoints,
      level: newProgress.level,
      xp: newProgress.xp,
      currentStreak: newProgress.streak,
      accuracy: newProgress.accuracy,
      gameStats: newProgress.gameStats,
      lastActive: new Date().toISOString()
    };
    localStorage.setItem('firebaseUserData', JSON.stringify(updatedUserData));

    // Dispatch event
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

// ============================================================
// ===== DASHBOARD COMPONENT =====
// ============================================================
const Dashboard = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentGame, setCurrentGame] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [contentKey, setContentKey] = useState(0); // NEW STATE - FOR RE-ANIMATION
  
  const userId = localStorage.getItem('userId');
  const { stats, loading, error } = useUserStats(userId);
  
  const [userProfile, setUserProfile] = useState(getUserProfile());
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

  // FUNCTION TO CHANGE MENU WITH RE-ANIMATION
  const changeMenu = (menu) => {
    setActiveMenu(menu);
    setContentKey(prev => prev + 1); // TRIGGER RE-ANIMATION
    setCurrentGame(null);
    if (window.innerWidth <= 768) setIsSidebarVisible(false);
  };

  // Update progress when Firebase data changes
  useEffect(() => {
    if (stats) {
      const newProgress = {
        wordsLearned: stats.wordsLearned || 0,
        gamesPlayed: stats.gamesPlayed || 0,
        totalPoints: stats.totalPoints || 0,
        level: stats.level || 1,
        xp: stats.xp || 0,
        streak: stats.currentStreak || 0,
        accuracy: stats.accuracy || 0,
        xpToNext: stats.xpToNext || 100,
        gameStats: stats.gameStats || {}
      };
      
      setProgress(newProgress);
      setUserProfile({
        ...stats,
        progress: newProgress,
        displayName: stats.displayName || 'User',
        email: stats.email || '',
        avatar: stats.avatar || '👤',
        role: stats.role || 'student',
        uid: userId
      });
      
      localStorage.setItem('vocaboplay_progress', JSON.stringify(newProgress));
      localStorage.setItem('firebaseUserData', JSON.stringify(stats));
    }
  }, [stats, userId]);

  // Update progress event listener
  useEffect(() => {
    const handleProgressUpdate = (event) => {
      setProgress(prev => ({ ...prev, ...event.detail }));
    };

    window.addEventListener('progressUpdate', handleProgressUpdate);
    return () => window.removeEventListener('progressUpdate', handleProgressUpdate);
  }, []);

  // Load user data from Firebase on mount
  useEffect(() => {
    const loadUserData = async () => {
      const userIdLocal = localStorage.getItem('userId');
      if (!userIdLocal) return;

      try {
        const userRef = doc(db, 'users', userIdLocal);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          localStorage.setItem('firebaseUserData', JSON.stringify(userData));
          
          const progressData = {
            wordsLearned: userData.wordsLearned || 0,
            gamesPlayed: userData.gamesPlayed || 0,
            totalPoints: userData.totalPoints || 0,
            level: userData.level || 1,
            xp: userData.xp || 0,
            streak: userData.currentStreak || 0,
            accuracy: userData.accuracy || 0,
            xpToNext: userData.xpToNext || 100,
            gameStats: userData.gameStats || {}
          };
          
          localStorage.setItem('vocaboplay_progress', JSON.stringify(progressData));
          setProgress(progressData);
          
          const event = new CustomEvent('progressUpdate', { detail: progressData });
          window.dispatchEvent(event);

          if (userData.favorites) {
            const favEvent = new CustomEvent('favoritesLoaded', { detail: userData.favorites });
            window.dispatchEvent(favEvent);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  // Update profile
  useEffect(() => {
    const handleProfileUpdate = (event) => {
      setUserProfile(event.detail);
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('vocaboplay_progress');
    localStorage.removeItem('firebaseUserData');
    sessionStorage.removeItem('userProfile');
    
    auth.signOut().catch(console.error);
    navigate('/');
  };

  // Start game
  const startGame = (gameId) => {
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
  
  const handleProfileUpdate = (updatedProfile) => {
    setUserProfile(updatedProfile);
  };

  const menuItems = [
    { name: 'Dashboard', icon: '⊞' },
    { name: 'Word Library', icon: '≡' },
    { name: 'Games', icon: '▶' },
    { name: 'My Progress', icon: '↗' },
    { name: 'Favorites', icon: '★' },
    { name: 'Leaderboards', icon: '⚑' },
  ];

  // Quick Access Shortcuts
  const shortcuts = [
    { label: 'Word Library', onClick: () => changeMenu('Word Library') },
    { label: 'Games', onClick: () => changeMenu('Games') },
    { label: 'My Progress', onClick: () => changeMenu('My Progress') },
    { label: 'Favorites', onClick: () => changeMenu('Favorites') },
    { label: 'Leaderboards', onClick: () => changeMenu('Leaderboards') },
    { label: 'My Profile', onClick: () => changeMenu('My Profile') },
  ];

  // Show loading state
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: colors.bg,
        fontFamily
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: `4px solid ${colors.border}`,
            borderTop: `4px solid ${colors.accent}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{ color: colors.textSecondary }}>Loading your stats...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: colors.bg,
        fontFamily
      }}>
        <div style={{ textAlign: 'center', color: colors.danger }}>
          <p>Error loading data: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              marginTop: '16px',
              padding: '10px 20px',
              background: colors.accent,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Use progress from Firebase or fallback
  const displayProgress = stats ? {
    wordsLearned: stats.wordsLearned || 0,
    gamesPlayed: stats.gamesPlayed || 0,
    totalPoints: stats.totalPoints || 0,
    level: stats.level || 1,
    xp: stats.xp || 0,
    streak: stats.currentStreak || 0,
    accuracy: stats.accuracy || 0,
    xpToNext: stats.xpToNext || 100
  } : progress;

  const displayName = stats?.displayName || userProfile?.displayName || 'User';
  const displayAvatar = stats?.avatar || userProfile?.avatar || '👤';
  const displayEmail = stats?.email || userProfile?.email || '';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Poppins', system-ui, sans-serif; background: ${colors.bg}; }
        .menu-item { transition: background 0.15s ease, color 0.15s ease; }
        .menu-item:hover { background: rgba(255,255,255,0.12); }
        .menu-item.active { background: rgba(255,255,255,0.18); border-left: 3px solid #ffffff; padding-left: 22px; }
        .shortcut-card { transition: border-color 0.15s ease, background 0.15s ease; }
        .shortcut-card:hover { border-color: ${colors.accent}; background: ${colors.accentSoft}; }

        /* To ensure "Light Mode" text of ThemeToggle inside the violet sidebar is visible.
           This is scoped to .theme-toggle-wrap so no other part of the app is affected. */
        .theme-toggle-wrap, .theme-toggle-wrap span, .theme-toggle-wrap p, .theme-toggle-wrap label {
          color: #ffffff !important;
          opacity: 1 !important;
        }

        /* FADE-IN ANIMATION - applied only to main content, not sidebar,
           because the transform here breaks position:fixed of children when
           they are in the same parent (creates new containing block). */
        .dashboard-container {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeInUp 0.8s ease-out forwards;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .sidebar-fixed { transform: translateX(-100%) !important; }
          .sidebar-fixed.open { transform: translateX(0) !important; }
          .main-content { margin-left: 0 !important; padding: 16px !important; }
          .hide-sidebar-btn { display: none !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .quick-actions-grid { grid-template-columns: 1fr !important; }
          .shortcuts-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .dashboard-welcome { flex-direction: column !important; text-align: center !important; padding: 20px !important; }
          .dashboard-welcome-img { width: 72px !important; height: 72px !important; }
          .dashboard-welcome-title { font-size: 20px !important; }
          .dashboard-welcome-buttons { justify-content: center !important; }
          .profile-menu-top { padding: 8px 12px !important; }
          .profile-menu-name { font-size: 12px !important; }
        }

        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr !important; }
          .main-content { padding: 12px !important; }
          .dashboard-welcome { padding: 16px !important; }
          .dashboard-welcome-title { font-size: 18px !important; }
          .shortcuts-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      {/* SIDEBAR - Moved outside dashboard-container (which has transform/animation)
          so position:fixed remains stable when scrolling. Background is now violet. */}
      <div
        className={`sidebar-fixed ${isSidebarVisible ? 'open' : ''}`}
        style={{
          width: '260px',
          background: '#6C5CE7', // VIOLET background - only this was changed
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          padding: '0',
          fontFamily,
          zIndex: 1000,
          transition: 'transform 0.3s ease',
          transform: isSidebarVisible ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        <div style={{
          padding: '24px 24px',
          fontSize: '20px',
          fontWeight: 700,
          borderBottom: '1px solid rgba(255,255,255,0.15)',
          letterSpacing: '-0.3px',
          color: '#ffffff',
          fontFamily,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="src/image/logo.png" alt="VocaboPlay" style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'block', flexShrink: 0 }} />
            <span>VocaboPlay</span>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '16px 0' }}>
          {menuItems.map((item) => (
            <div
              key={item.name}
              className={`menu-item ${activeMenu === item.name ? 'active' : ''}`}
              onClick={() => changeMenu(item.name)}
              style={{
                padding: '11px 24px',
                margin: '2px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeMenu === item.name ? 600 : 500,
                color: '#ffffff',
                fontFamily,
                background: 'transparent',
                borderRadius: '8px',
                borderLeft: '3px solid transparent',
              }}
            >
              <span style={{ fontSize: '16px', width: '18px', textAlign: 'center' }}>{item.icon}</span>
              <span>{item.name}</span>
            </div>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', padding: '12px 0' }}>
          <div className="theme-toggle-wrap">
            <ThemeToggle colors={colors} fontFamily={fontFamily} />
          </div>
          <div
            className="menu-item"
            onClick={() => changeMenu('My Profile')}
            style={{
              padding: '11px 24px',
              margin: '0 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeMenu === 'My Profile' ? 600 : 500,
              color: '#ffffff',
              fontFamily,
              background: 'transparent',
              borderRadius: '8px',
            }}
          >
            <span style={{ fontSize: '16px', width: '18px', textAlign: 'center' }}>⊙</span>
            <span>Profile</span>
          </div>
        </div>
      </div>

      {/* Sidebar Toggle Button - Mobile */}
      {!isSidebarVisible && (
        <button
          onClick={() => setIsSidebarVisible(true)}
          style={{
            position: 'fixed',
            top: '15px',
            left: '15px',
            zIndex: 1001,
            background: colors.surface,
            color: colors.accent,
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            cursor: 'pointer',
          }}
        >
          ☰
        </button>
      )}

      {/* Sidebar Overlay for Mobile */}
      {isSidebarVisible && window.innerWidth <= 768 && (
        <div
          onClick={() => setIsSidebarVisible(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.4)',
            zIndex: 999,
          }}
        />
      )}

      {/* MAIN WRAPPER - has key to trigger re-render; fade-in animation
          is now placed here, separate from sidebar */}
      <div key={contentKey} className="dashboard-container" style={{ 
        display: 'flex', 
        minHeight: '100vh', 
        background: colors.bg, 
        fontFamily,
      }}>
        {/* Main Content Area */}
        <div className="main-content" style={{
          flex: 1,
          marginLeft: isSidebarVisible ? '260px' : '0',
          padding: '24px 32px',
          overflowY: 'auto',
          transition: 'margin-left 0.3s ease',
        }}>
          {/* Top Bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '28px', gap: '15px', position: 'relative', flexWrap: 'wrap' }}>
            {isSidebarVisible && currentGame && (
              <button
                className="hide-sidebar-btn"
                onClick={() => setIsSidebarVisible(false)}
                style={{
                  position: 'absolute',
                  left: '0',
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                  color: colors.textSecondary,
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily,
                }}
              >
                ← Hide Sidebar
              </button>
            )}

            <div
              className="profile-menu-top"
              style={{
                background: colors.surface,
                padding: '6px 14px 6px 8px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                border: `1px solid ${colors.border}`,
                fontFamily,
              }}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                overflow: 'hidden',
                background: displayAvatar ? 'transparent' : colors.accentSoft,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '15px',
                color: colors.accent,
                flexShrink: 0,
              }}>
                {displayAvatar && typeof displayAvatar === 'string' && displayAvatar.startsWith('src/') ? (
                  <img 
                    src={`/${displayAvatar}`}
                    alt={displayName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentNode.style.background = colors.accentSoft;
                      e.target.parentNode.innerHTML = '👤';
                    }}
                  />
                ) : displayAvatar && displayAvatar !== '👤' && !displayAvatar.startsWith('src/') ? (
                  <img 
                    src={`/images/${displayAvatar}`}
                    alt={displayName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentNode.style.background = colors.accentSoft;
                      e.target.parentNode.innerHTML = '👤';
                    }}
                  />
                ) : (
                  <span>{typeof displayAvatar === 'string' && displayAvatar.startsWith('👤') ? displayAvatar : '👤'}</span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: '0' }}>
                <span className="profile-menu-name" style={{ fontSize: '13px', fontWeight: 600, color: colors.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>{displayName}</span>
                <span style={{ fontSize: '11px', color: colors.textMuted }}>{stats?.role === 'admin' ? 'Administrator' : 'Student'}</span>
              </div>
              <span style={{ fontSize: '10px', color: colors.textMuted, marginLeft: '2px' }}>▼</span>
            </div>

            {showProfileMenu && (
              <>
                <div
                  onClick={() => setShowProfileMenu(false)}
                  style={{ position: 'fixed', inset: 0, zIndex: 999 }}
                />
                <div style={{
                position: 'absolute',
                top: '50px',
                right: '0',
                background: colors.surface,
                borderRadius: '10px',
                zIndex: 1000,
                minWidth: '220px',
                overflow: 'hidden',
                border: `1px solid ${colors.border}`,
                fontFamily,
              }}>
                <div style={{ padding: '12px 14px', background: colors.bg, borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: displayAvatar ? 'transparent' : colors.accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    color: '#fff',
                  }}>
                    {displayAvatar && typeof displayAvatar === 'string' && displayAvatar.startsWith('src/') ? (
                      <img 
                        src={`/${displayAvatar}`}
                        alt={displayName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : displayAvatar && displayAvatar !== '👤' && !displayAvatar.startsWith('src/') ? (
                      <img 
                        src={`/images/${displayAvatar}`}
                        alt={displayName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span>{typeof displayAvatar === 'string' && displayAvatar.startsWith('👤') ? displayAvatar : '👤'}</span>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: colors.textPrimary }}>{displayName}</div>
                    <div style={{ fontSize: '11px', color: colors.textMuted }}>{displayEmail || 'user@example.com'}</div>
                  </div>
                </div>
                <div style={{ padding: '4px' }}>
                  <button onClick={() => { setShowProfileMenu(false); changeMenu('My Profile'); }} style={{ width: '100%', padding: '9px 12px', border: 'none', background: 'none', fontSize: '13px', cursor: 'pointer', textAlign: 'left', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '10px', color: colors.textSecondary, fontFamily }}>My Profile</button>
                  <button onClick={() => { setShowProfileMenu(false); changeMenu('My Progress'); }} style={{ width: '100%', padding: '9px 12px', border: 'none', background: 'none', fontSize: '13px', cursor: 'pointer', textAlign: 'left', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '10px', color: colors.textSecondary, fontFamily }}>My Progress</button>
                  <div style={{ height: '1px', background: colors.border, margin: '4px 0' }}></div>
                  <button onClick={handleLogout} style={{ width: '100%', padding: '9px 12px', border: 'none', background: 'none', fontSize: '13px', cursor: 'pointer', textAlign: 'left', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '10px', color: colors.danger, fontFamily }}>Sign Out</button>
                </div>
              </div>
              </>
            )}
          </div>

          {/* Game Components */}
          {currentGame === 'wordpics' && <WordPicsGame onBack={exitGame} updateProgress={updateProgress} />}
          {currentGame === 'quiz' && <QuizGame onBack={exitGame} updateProgress={updateProgress} />}
          {currentGame === 'match' && <MatchGame onBack={exitGame} updateProgress={updateProgress} />}
          {currentGame === 'guesswhat' && <GuessWhatGame onBack={exitGame} updateProgress={updateProgress} />}
          {currentGame === 'short-story' && <ShortStoryGame onBack={exitGame} updateProgress={updateProgress} />}
          {currentGame === 'sentence-builder' && <SentenceBuilder onBack={exitGame} updateProgress={updateProgress} />}

          {/* Main Menu Components */}
          {!currentGame && activeMenu === 'Word Library' && <WordLibrary />}
          {!currentGame && activeMenu === 'Games' && <PlayGames startGame={startGame} />}
          {!currentGame && activeMenu === 'My Progress' && <MyProgress />}
          {!currentGame && activeMenu === 'My Profile' && <Profile onBack={() => changeMenu('Dashboard')} userProfile={userProfile} onUpdate={handleProfileUpdate} />}
          {!currentGame && activeMenu === 'Leaderboards' && <Leaderboards onBack={() => changeMenu('Dashboard')} isAdmin={false} currentUserId={userId} />}
          {!currentGame && activeMenu === 'Favorites' && <FavoritesPage />}

          {/* Dashboard Home */}
          {!currentGame && activeMenu === 'Dashboard' && (
            <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
              {/* Welcome Section */}
              <div className="dashboard-welcome" style={{
                background: colors.accent,
                borderRadius: '12px',
                padding: '24px 32px',
                marginBottom: '24px',
                display: 'flex',
                gap: '24px',
                alignItems: 'center',
                color: 'white',
              }}>
                <div className="dashboard-welcome-img" style={{ width: '84px', height: '84px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <img src="src/image/bokawelcoming.jpg" alt="Mascot" style={{ width: '100%', height: '100%', borderRadius: '11px', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h2 className="dashboard-welcome-title" style={{ ...textType.h1, color: 'white', margin: '0 0 6px 0' }}>Welcome back, {displayName}</h2>
                  <p style={{ fontSize: '14px', opacity: '0.9', marginBottom: '18px', fontFamily }}>Continue your vocabulary journey with {Math.max(0, 30 - (displayProgress.wordsLearned || 0))} words to master.</p>
                  <div className="dashboard-welcome-buttons" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button onClick={() => changeMenu('Games')} style={{ background: 'white', color: colors.accent, border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily }}>Continue Learning</button>
                    <button onClick={() => changeMenu('Word Library')} style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.5)', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily }}>Browse Library</button>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {[
                  { label: 'Words Learned', value: displayProgress.wordsLearned || 0 },
                  { label: 'Games Played', value: displayProgress.gamesPlayed || 0 },
                  { label: 'Current Streak', value: displayProgress.streak || 0, unit: 'days' },
                  { label: 'Total Points', value: displayProgress.totalPoints || 0 },
                ].map((stat, i) => {
                  const xpToNextLevel = displayProgress.xpToNext || 100;
                  const currentLevelXp = (displayProgress.xp || 0) % xpToNextLevel;
                  const levelProgress = (currentLevelXp / xpToNextLevel) * 100;

                  return (
                    <div key={i} style={{ background: colors.surface, borderRadius: '12px', padding: '20px', border: `1px solid ${colors.border}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <span style={{ ...textType.small, fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{stat.label}</span>
                        {stat.label === 'Total Points' && <span style={{ padding: '3px 9px', background: colors.accentSoft, borderRadius: '6px', fontSize: '11px', color: colors.accent, fontWeight: 600 }}>Level {displayProgress.level || 1}</span>}
                      </div>
                      <div><span style={{ fontSize: '28px', fontWeight: 600, color: colors.textPrimary, fontFamily }}>{stat.value}</span>{stat.unit && <span style={{ fontSize: '13px', color: colors.textMuted, marginLeft: '4px' }}>{stat.unit}</span>}</div>
                      {stat.label === 'Total Points' && (
                        <div style={{ marginTop: '14px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '11px' }}>
                            <span style={{ color: colors.textMuted }}>XP to next level</span>
                            <span style={{ color: colors.accent, fontWeight: 600 }}>{currentLevelXp}/{xpToNextLevel}</span>
                          </div>
                          <div style={{ background: colors.bg, height: '6px', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${levelProgress}%`, background: colors.accent, borderRadius: '4px' }} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <div className="quick-actions-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: colors.surface, borderRadius: '12px', padding: '24px', border: `1px solid ${colors.border}` }}>
                  <h3 style={{ ...textType.sub, marginBottom: '16px' }}>Quick Actions</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {['Word Pics', 'Match Game', 'Quiz', 'Story'].map((name, i) => (
                      <button key={i} onClick={() => startGame(['wordpics', 'match', 'quiz', 'short-story'][i])} style={{ position: 'relative', height: '110px', borderRadius: '10px', overflow: 'hidden', border: `1px solid ${colors.border}`, cursor: 'pointer', padding: 0 }}>
                        <img src={`src/image/${['wordpics', 'matchgame', 'quizgame', 'shortstory'][i]}.png`} alt={name} style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.55), rgba(15,23,42,0.05))' }} />
                        <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', alignItems: 'flex-end', padding: '12px' }}><span style={{ color: 'white', fontSize: '13px', fontWeight: 600, fontFamily }}>{name}</span></div>
                      </button>
                    ))}
                  </div>
                  <button onClick={() => changeMenu('Games')} style={{ width: '100%', marginTop: '16px', padding: '10px', background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: colors.accent, cursor: 'pointer', fontFamily }}>View All Games</button>
                </div>

                <div style={{ background: colors.surface, borderRadius: '12px', padding: '24px', border: `1px solid ${colors.border}` }}>
                  <h3 style={{ ...textType.sub, marginBottom: '16px' }}>Recommended for You</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div onClick={() => startGame('short-story')} style={{ position: 'relative', height: '110px', borderRadius: '10px', overflow: 'hidden', border: `1px solid ${colors.border}`, cursor: 'pointer' }}>
                      <img src="src/image/shortstory.png" alt="The Learning Journey" style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.6), rgba(15,23,42,0.05))' }} />
                      <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '12px', color: 'white' }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, fontFamily }}>The Learning Journey</div>
                        <div style={{ fontSize: '12px', opacity: 0.9, fontFamily }}>Chapter 1: Classroom Adventures</div>
                      </div>
                    </div>
                    <div onClick={() => startGame('wordpics')} style={{ position: 'relative', height: '110px', borderRadius: '10px', overflow: 'hidden', border: `1px solid ${colors.border}`, cursor: 'pointer' }}>
                      <img src="src/image/wordpics.png" alt="Word Pics" style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.6), rgba(15,23,42,0.05))' }} />
                      <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '12px', color: 'white' }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, fontFamily }}>Word Pics Challenge</div>
                        <div style={{ fontSize: '12px', opacity: 0.9, fontFamily }}>30 words to review</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Access Shortcuts */}
              <div style={{ background: colors.surface, borderRadius: '12px', padding: '20px 24px', border: `1px solid ${colors.border}` }}>
                <h3 style={{ ...textType.sub, marginBottom: '14px' }}>Quick Access</h3>
                <div className="shortcuts-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${shortcuts.length}, 1fr)`, gap: '10px' }}>
                  {shortcuts.map((s) => (
                    <button
                      key={s.label}
                      className="shortcut-card"
                      onClick={s.onClick}
                      style={{
                        padding: '14px 10px',
                        background: colors.bg,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: colors.textPrimary,
                        cursor: 'pointer',
                        fontFamily,
                        textAlign: 'center',
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;