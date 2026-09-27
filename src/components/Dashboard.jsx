// src/components/Dashboard.jsx
// ============================================================
// ✅ FINAL: 1 Point = 1 XP. Level base sa totalPoints.
// ✅ LevelUpCelebration animation gagana pag nag-level up
// ✅ GoatCardCollection mula sa MyCards.jsx (hiwalay na file)
// ✅ FIXED: gamesPlayed at wordsLearned naka-increment na
// ============================================================
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../pages/firebase';
import {
  doc, getDoc, updateDoc, collection, query, where, getDocs, addDoc
} from 'firebase/firestore';
import { useUserStats } from '../hooks/useUserStats';
import Profile from './Profile';
import Leaderboards from './Leaderboards';

import WordPicsGame from './dashboard/SynoQuest';
import QuizGame from './dashboard/QuizGame';
import MatchGame from './dashboard/MatchGame';
import GuessWhatGame from './dashboard/GuessWhatGame';
import ShortStoryGame from './dashboard/ShortStoryGame';
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

import { LevelUpCelebration } from './dashboard/GoatMascot';
import GoatCardCollection from './dashboard/MyCards';

import { colors, fontFamily } from './dashboard/dashboardStyles';
import ThemeToggle from './ThemeToggle';

const DEMO_FORCE_LEVEL = false;

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
};

export const computeLevelFromPoints = (points) => Math.floor((points || 0) / 100) + 1;
export const computeCurrentXP = (points) => (points || 0) % 100;

const chunkyButton = (bg, shadowColor, size = 'md') => {
  const sizes = {
    sm: { padding: '8px 16px', fontSize: '13px', radius: '8px' },
    md: { padding: '12px 24px', fontSize: '15px', radius: '12px' },
    lg: { padding: '16px 32px', fontSize: '18px', radius: '14px' },
  };
  const s = sizes[size];
  return {
    background: bg, color: palette.white, border: 'none', borderRadius: s.radius,
    fontWeight: '800', cursor: 'pointer', fontFamily: "'Fredoka', sans-serif",
    fontSize: s.fontSize, padding: s.padding, boxShadow: `0 3px 0 ${shadowColor}`,
    transition: 'transform 0.1s ease, box-shadow 0.1s ease',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    textTransform: 'uppercase', letterSpacing: '0.5px',
  };
};

const Icon = ({ name, size = 20, color = palette.white, secondaryColor = 'rgba(255,255,255,0.5)' }) => {
  const icons = {
    grid: (<><rect x="3" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" fill="none"/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" fill="none"/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" fill="none"/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" fill="none"/></>),
    library: (<><path d="M4 19V5a2 2 0 012-2h11a2 2 0 012 2v14" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/><path d="M9 7h7M9 11h7" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/></>),
    game: (<><path d="M6 12h4m-2-2v4m6-4h.01M17 12h.01" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/><path d="M8 20h8a4 4 0 004-4V8a4 4 0 00-4-4H8a4 4 0 00-4 4v8a4 4 0 004 4z" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/></>),
    chart: (<path d="M18 20V10M12 20V4M6 20v-6" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>),
    star: (<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>),
    trophy: (<><path d="M6 4h12v4a6 6 0 01-12 0V4z" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/><path d="M6 8H4a2 2 0 002 2M18 8h2a2 2 0 01-2 2M9 18h6M10 21h4M12 14v4" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/></>),
    shop: (<><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/><circle cx="9" cy="20" r="1" stroke={color} strokeWidth="2" fill="none"/><circle cx="18" cy="20" r="1" stroke={color} strokeWidth="2" fill="none"/></>),
    card: (<><rect x="3" y="5" width="18" height="14" rx="2" stroke={color} strokeWidth="2" fill="none"/><path d="M14 9h4M14 13h4" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/></>),
    user: (<><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/><circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/></>),
    logout: (<><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/><path d="M16 17l5-5-5-5M21 12H9" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/></>),
    menu: (<path d="M3 12h18M3 6h18M3 18h18" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>),
    close: (<path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>),
    key: (<><circle cx="7.5" cy="15.5" r="5.5" stroke={color} strokeWidth="2" fill="none"/><path d="M21 2l-9.6 9.6M15.5 7.5l3 3L22 7l-3-3" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/></>),
    play: (<path d="M5 3l14 9-14 9V3z" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>),
    target: (<><circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none"/><circle cx="12" cy="12" r="6" stroke={secondaryColor} strokeWidth="2" fill="none"/><circle cx="12" cy="12" r="2" stroke={color} strokeWidth="2" fill="none"/></>),
  };
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block', flexShrink: 0 }}>{icons[name] || icons.grid}</svg>);
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

  const [showLevelUpCard, setShowLevelUpCard] = useState(false);
  const [levelUpCardLevel, setLevelUpCardLevel] = useState(1);

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
          progress: { totalPoints: data.totalPoints || 0 }
        };
      }
    } catch (e) {}
    return { uid: userId || 'unknown', displayName: 'New User', email: '', avatar: '👤', role: 'student', progress: { totalPoints: 0 } };
  });

  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem('vocaboplay_progress');
    return saved ? JSON.parse(saved) : { wordsLearned: 0, gamesPlayed: 0, totalPoints: 0, streak: 0, accuracy: 0, gameStats: {} };
  });

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!userId) { navigate('/login'); return; }
      try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.role !== 'student') { navigate('/admin/dashboard'); return; }
          if (userData.equippedAvatar) setEquippedAvatar(userData.equippedAvatar);
        }
      } catch (error) { console.error('Error fetching student data:', error); }
    };
    fetchStudentData();
  }, [userId, navigate]);

  const handleJoinActivity = async () => {
    if (!joinPin.trim() || joinPin.length < 6) { setJoinError('Please enter a valid 6-digit PIN'); return; }
    setJoinLoading(true); setJoinError('');
    try {
      const activitiesQuery = query(collection(db, 'activities'), where('gamePin', '==', joinPin.trim()), where('isActive', '==', true));
      const activitiesSnap = await getDocs(activitiesQuery);
      if (activitiesSnap.empty) { setJoinError('❌ No active activity found with this PIN'); setJoinLoading(false); return; }
      const activityDoc = activitiesSnap.docs[0];
      const activityData = { id: activityDoc.id, ...activityDoc.data() };
      const scoresQuery = query(collection(db, 'scores'), where('activityId', '==', activityDoc.id), where('studentId', '==', userId));
      const scoresSnap = await getDocs(scoresQuery);
      if (!scoresSnap.empty) {
        setJoinError('✅ You have already completed this activity!');
        setJoinLoading(false);
        setTimeout(() => { setJoinPin(''); setShowJoinModal(false); setJoinError(''); }, 2000);
        return;
      }
      setSelectedActivity(activityData); setShowActivityModal(true);
      setJoinPin(''); setShowJoinModal(false); setJoinError('');
    } catch (error) { setJoinError('Failed to join activity.'); }
    finally { setJoinLoading(false); }
  };

  const startActivity = async () => {
    if (!selectedActivity) return;
    const gameMap = { 'quiz': 'quiz', 'match': 'match', 'wordpics': 'wordpics', 'guesswhat': 'guesswhat' };
    const gameId = gameMap[selectedActivity.gameType] || 'quiz';
    setCurrentGame(gameId); setShowActivityModal(false);
    localStorage.setItem('currentActivity', JSON.stringify(selectedActivity));
  };

  // ============================================================
  // ✅ FIXED: updateProgress — Diretso nang tinatanggap ang gamesPlayed
  // ============================================================
  const updateProgress = async (updates) => {
    if (!userId) return null;
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : {};

      const currentTotalPoints = userData.totalPoints || 0;
      const currentStreak = userData.currentStreak || 0;
      const currentGameStats = userData.gameStats || {};
      const currentWordsLearned = userData.wordsLearned || 0;
      const currentGamesPlayed = userData.gamesPlayed || 0;
      const currentAccuracy = userData.accuracy || 0;

      // ✅ Points earned
      let pointsEarned = 0;
      if (updates.totalPoints !== undefined) pointsEarned = updates.totalPoints;
      else if (updates.score !== undefined) pointsEarned = updates.score;
      else if (updates.xp !== undefined) pointsEarned = updates.xp;

      const newTotalPoints = currentTotalPoints + pointsEarned;

      // ✅ Streak
      const today = new Date().toDateString();
      const lastPlayed = userData.lastActive ? new Date(userData.lastActive).toDateString() : null;
      let newStreak = currentStreak;
      if (pointsEarned > 0 || updates.gamesPlayed > 0) {
        if (lastPlayed === today) newStreak = currentStreak || 0;
        else if (lastPlayed) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          newStreak = (lastPlayed === yesterday.toDateString()) ? currentStreak + 1 : 1;
        } else newStreak = 1;
      }

      // ✅ Game stats update (per game)
      const gameStats = { ...currentGameStats };
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

      // ✅ Level & XP
      const oldLevel = computeLevelFromPoints(currentTotalPoints);
      const newLevel = computeLevelFromPoints(newTotalPoints);
      const currentXP = computeCurrentXP(newTotalPoints);

      if (newLevel > oldLevel) {
        setLevelUpCardLevel(newLevel);
        setShowLevelUpCard(true);
      }

      // ============================================================
      // ✅✅✅ FIXED: Games Played computation
      // Diretso nang dadagdagan kung may updates.gamesPlayed
      // ============================================================
      let newGamesPlayed = currentGamesPlayed;
      
      // Option 1: Direct gamesPlayed increment
      if (updates.gamesPlayed !== undefined && updates.gamesPlayed > 0) {
        newGamesPlayed = currentGamesPlayed + updates.gamesPlayed;
      } else {
        // Option 2: Fallback — compute from gameStats, pero hindi bababa sa current
        let totalGamesPlayed = 0;
        Object.values(gameStats).forEach(g => {
          if (g && typeof g === 'object') {
            totalGamesPlayed += g.played || 0;
          }
        });
        if (totalGamesPlayed > 0) {
          newGamesPlayed = Math.max(totalGamesPlayed, currentGamesPlayed);
        }
      }

      // ✅ Accuracy
      let totalQuestionsAll = 0;
      Object.values(gameStats).forEach(g => {
        if (g && typeof g === 'object') {
          totalQuestionsAll += g.total || 0;
        }
      });
      let newAccuracy = currentAccuracy;
      if (totalQuestionsAll > 0) {
        const totalCorrect = Object.values(gameStats).reduce((sum, g) => sum + (g.correct || 0), 0);
        newAccuracy = Math.round((totalCorrect / totalQuestionsAll) * 100);
      }

      // ✅ Words Learned
      const newWordsLearned = currentWordsLearned + (updates.wordsLearned || 0);

      const updateData = {
        totalPoints: newTotalPoints,
        level: newLevel,
        xp: currentXP,
        xpToNext: 100,
        currentStreak: newStreak,
        gamesPlayed: newGamesPlayed,
        wordsLearned: newWordsLearned,
        accuracy: newAccuracy,
        gameStats: gameStats,
        lastActive: new Date().toISOString()
      };

      await updateDoc(userRef, updateData);

      const newProgress = {
        totalPoints: newTotalPoints,
        level: newLevel,
        xp: currentXP,
        xpToNext: 100,
        streak: newStreak,
        gamesPlayed: newGamesPlayed,
        wordsLearned: newWordsLearned,
        accuracy: newAccuracy,
        gameStats: gameStats
      };
      localStorage.setItem('vocaboplay_progress', JSON.stringify(newProgress));

      const event = new CustomEvent('progressUpdate', { detail: newProgress });
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
        activityId, studentId: userId,
        studentName: userProfile.displayName || 'Student',
        score, correctAnswers, totalQuestions,
        completedAt: new Date().toISOString()
      });
      const activityRef = doc(db, 'activities', activityId);
      const activitySnap = await getDoc(activityRef);
      if (activitySnap.exists()) {
        await updateDoc(activityRef, { participants: (activitySnap.data().participants || 0) + 1 });
      }
      if (updateProgress) {
        await updateProgress({
          totalPoints: score,
          wordsLearned: correctAnswers,
          gamesPlayed: 1,  // ✅ IDINAGDAG
        });
      }
    } catch (error) { console.error('Error completing activity:', error); }
  };

  const handleLogout = () => { localStorage.clear(); auth.signOut().catch(console.error); navigate('/'); };

  const startGame = (gameId) => {
    const availableGames = ['wordpics', 'match', 'quiz', 'guesswhat', 'short-story'];
    if (!availableGames.includes(gameId)) return;
    setCurrentGame(gameId); setActiveMenu(null); setIsSidebarVisible(false); window.scrollTo(0, 0);
  };

  const exitGame = () => { setCurrentGame(null); setActiveMenu('Dashboard'); setIsSidebarVisible(true); };
  const changeMenu = (menu) => {
    setActiveMenu(menu); setContentKey(prev => prev + 1); setCurrentGame(null);
    if (window.innerWidth <= 768) setIsSidebarVisible(false);
  };

  const handleLiveJoined = (session) => { setLiveSession(session); setLivePlayerId(userId); setLiveView('lobby'); setShowLiveJoinModal(false); };
  const handleLiveGameStart = (session) => { setLiveSession(session); setLiveView('game'); };
  const handleLiveGameEnd = (session) => { setLiveSession(session); setLiveView('results'); };
  const handleLiveExit = () => { setLiveSession(null); setLiveView(null); setLivePlayerId(null); };

  const menuItems = [
    { name: 'Dashboard', icon: 'grid' },
    { name: 'Word Library', icon: 'library' },
    { name: 'Games', icon: 'game' },
    { name: 'My Progress', icon: 'chart' },
    { name: 'My Cards', icon: 'card' },
    { name: 'Favorites', icon: 'star' },
    { name: 'Leaderboards', icon: 'trophy' },
    { name: 'Avatar Shop', icon: 'shop' },
  ];

  const rawTotalPoints = DEMO_FORCE_LEVEL ? 250 : (
    stats?.progress?.totalPoints ?? progress.totalPoints ?? 0
  );

  const displayProgress = {
    wordsLearned: stats?.progress?.wordsLearned ?? progress.wordsLearned ?? 0,
    gamesPlayed: stats?.progress?.gamesPlayed ?? progress.gamesPlayed ?? 0,
    totalPoints: rawTotalPoints,
    level: computeLevelFromPoints(rawTotalPoints),
    xp: computeCurrentXP(rawTotalPoints),
    xpToNext: 100,
    streak: stats?.progress?.streak ?? progress.streak ?? 0,
    accuracy: stats?.progress?.accuracy ?? progress.accuracy ?? 0,
  };

  const displayName = stats?.displayName || userProfile?.displayName || 'User';
  const displayEmail = stats?.email || userProfile?.email || '';

  if (liveView === 'lobby' && liveSession) return <LivePlayerLobby session={liveSession} playerId={livePlayerId} onGameStart={handleLiveGameStart} onCancel={handleLiveExit} />;
  if (liveView === 'game' && liveSession) return <LivePlayerGame session={liveSession} playerId={livePlayerId} onGameEnd={handleLiveGameEnd} />;
  if (liveView === 'results' && liveSession) return <LivePlayerResults session={liveSession} playerId={livePlayerId} onExit={handleLiveExit} />;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: palette.cream }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '50px', height: '50px', border: `4px solid ${palette.border}`, borderTop: `4px solid ${palette.warmOrange}`, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
          <p style={{ color: palette.bodyText, fontWeight: 600 }}>Loading...</p>
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
        body { font-family: 'Nunito', system-ui, sans-serif; background: ${palette.cream}; }
        .menu-item { transition: background 0.18s ease; }
        .menu-item:hover { background: rgba(233, 160, 117, 0.12) !important; }
        .menu-item.active { background: rgba(233, 160, 117, 0.18) !important; border-left: 3px solid ${palette.warmOrange} !important; padding-left: 21px !important; }
        .theme-toggle-wrap, .theme-toggle-wrap span { color: rgba(255,255,255,0.85) !important; }
        .dashboard-container { opacity: 0; transform: translateY(16px); animation: fadeInUp 0.7s ease-out forwards; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .profile-menu-item { transition: background 0.15s ease; }
        .profile-menu-item:hover { background: ${palette.creamSoft}; }
        .stat-card-dash { transition: transform 0.2s ease; }
        .stat-card-dash:hover { transform: translateY(-3px); }
        @media (max-width: 768px) {
          .sidebar-fixed { transform: translateX(-100%) !important; }
          .sidebar-fixed.open { transform: translateX(0) !important; }
          .main-content { margin-left: 0 !important; padding: 16px !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .dashboard-welcome { flex-direction: column !important; text-align: center !important; padding: 20px !important; }
        }
        @media (max-width: 480px) { .stats-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* SIDEBAR */}
      <div className={`sidebar-fixed ${isSidebarVisible ? 'open' : ''}`} style={{
        width: '260px', background: `linear-gradient(180deg, ${palette.deepNavy} 0%, ${palette.deepNavyLight} 100%)`,
        color: '#fff', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh',
        left: 0, top: 0, zIndex: 1000, transition: 'transform 0.3s ease',
        transform: isSidebarVisible ? 'translateX(0)' : 'translateX(-100%)',
        borderRight: `1px solid rgba(255,255,255,0.06)`,
      }}>
        <div style={{ padding: '20px 22px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: "'Fredoka', sans-serif" }}>
          <img src="/image/logo.png" alt="VocaboPlay" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
          <span style={{ fontSize: '19px', fontWeight: 700 }}>VocaboPlay</span>
        </div>
        <nav style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
          {menuItems.map((item) => {
            const isActive = activeMenu === item.name;
            return (
              <div key={item.name} className={`menu-item ${isActive ? 'active' : ''}`} onClick={() => changeMenu(item.name)} style={{ padding: '13px 22px', margin: '3px 10px', display: 'flex', alignItems: 'center', gap: '13px', cursor: 'pointer', fontSize: '15px', fontWeight: isActive ? 700 : 500, color: isActive ? '#fff' : 'rgba(255,255,255,0.72)', fontFamily: "'Fredoka', sans-serif", borderRadius: '10px', borderLeft: '3px solid transparent' }}>
                <Icon name={item.icon} size={20} color={isActive ? palette.warmOrange : 'rgba(255,255,255,0.72)'} secondaryColor={isActive ? `${palette.warmOrange}66` : 'rgba(255,255,255,0.4)'} />
                <span>{item.name}</span>
              </div>
            );
          })}
        </nav>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '10px 0' }}>
          <div className="theme-toggle-wrap" style={{ padding: '4px 22px' }}>
            <ThemeToggle colors={colors} fontFamily={fontFamily} />
          </div>
        </div>
      </div>

      {isSidebarVisible && window.innerWidth <= 768 && (
        <div onClick={() => setIsSidebarVisible(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(42, 40, 69, 0.4)', zIndex: 999 }} />
      )}

      <div key={contentKey} className="dashboard-container" style={{ display: 'flex', minHeight: '100vh', background: palette.cream }}>
        <div className="main-content" style={{ flex: 1, marginLeft: isSidebarVisible ? '260px' : '0', padding: '24px 32px', transition: 'margin-left 0.3s ease' }}>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px', position: 'relative' }}>
            <div onClick={() => setShowProfileMenu(!showProfileMenu)} style={{ background: palette.white, padding: '6px 14px 6px 8px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', border: `1.5px solid ${palette.border}` }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden' }}>
                {equippedAvatar ? <CharacterAvatar avatarId={equippedAvatar} size="small" showBorder={false} /> : <div style={{ width: '32px', height: '32px', background: palette.creamSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: palette.deepNavy }}>{displayName}</div>
                <div style={{ fontSize: '11px', color: palette.bodyTextSoft }}>Student</div>
              </div>
            </div>
            {showProfileMenu && (
              <>
                <div onClick={() => setShowProfileMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 999 }} />
                <div style={{ position: 'absolute', top: '50px', right: 0, background: palette.white, borderRadius: '14px', zIndex: 1000, minWidth: '220px', border: `1.5px solid ${palette.border}`, boxShadow: '0 10px 30px rgba(42, 40, 69, 0.12)', padding: '8px' }}>
                  <button onClick={() => { setShowProfileMenu(false); changeMenu('My Profile'); }} className="profile-menu-item" style={{ width: '100%', padding: '9px 10px', border: 'none', background: 'none', fontSize: '13px', cursor: 'pointer', textAlign: 'left', borderRadius: '10px' }}>👤 My Profile</button>
                  <button onClick={() => { setShowProfileMenu(false); changeMenu('My Cards'); }} className="profile-menu-item" style={{ width: '100%', padding: '9px 10px', border: 'none', background: 'none', fontSize: '13px', cursor: 'pointer', textAlign: 'left', borderRadius: '10px' }}>🎴 My Cards</button>
                  <button onClick={handleLogout} className="profile-menu-item" style={{ width: '100%', padding: '9px 10px', border: 'none', background: 'none', fontSize: '13px', cursor: 'pointer', textAlign: 'left', borderRadius: '10px', color: palette.coral }}>🚪 Sign Out</button>
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
          {!currentGame && activeMenu === 'My Cards' && <GoatCardCollection currentLevel={displayProgress.level} />}
          {!currentGame && activeMenu === 'My Profile' && <Profile onBack={() => changeMenu('Dashboard')} userProfile={userProfile} onUpdate={(p) => setUserProfile(p)} />}
          {!currentGame && activeMenu === 'Leaderboards' && <Leaderboards onBack={() => changeMenu('Dashboard')} isAdmin={false} currentUserId={userId} />}
          {!currentGame && activeMenu === 'Favorites' && <FavoritesPage />}
          {!currentGame && activeMenu === 'Avatar Shop' && (
            <AvatarShop currentPoints={displayProgress.totalPoints} onPointsChange={(newPoints) => setProgress({ ...progress, totalPoints: newPoints })} onEquipChange={(avatarId) => setEquippedAvatar(avatarId)} />
          )}

          {!currentGame && activeMenu === 'Dashboard' && (
            <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
              <div className="dashboard-welcome" style={{ background: `linear-gradient(135deg, ${palette.deepNavy} 0%, ${palette.deepNavyLight} 100%)`, borderRadius: '20px', padding: '28px 32px', marginBottom: '20px', display: 'flex', gap: '28px', alignItems: 'center', color: 'white', flexWrap: 'wrap', minHeight: '280px', position: 'relative' }}>
                <div style={{ flexShrink: 0 }}>
                  <MascotCarousel key={`mascot-${displayProgress.level}`} level={displayProgress.level} size={220} animated={true} />
                </div>
                <div style={{ flex: 1, minWidth: '300px' }}>
                  <h2 style={{ fontSize: '30px', fontWeight: 700, color: 'white', margin: '0 0 8px 0', fontFamily: "'Fredoka', sans-serif" }}>Welcome back, {displayName}!</h2>
                  <p style={{ fontSize: '15px', opacity: '0.82', marginBottom: '20px' }}>Continue your vocabulary journey and complete your activities.</p>
                  <div style={{ marginBottom: '20px', maxWidth: '520px' }}>
                    <ExpBar
                      xp={displayProgress.xp}
                      xpToNext={displayProgress.xpToNext}
                      level={displayProgress.level}
                      color={palette.warmOrange}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button onClick={() => setShowJoinModal(true)} style={{ ...chunkyButton(palette.warmOrange, palette.warmOrangeShadow, 'sm'), display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Icon name="key" size={14} color={palette.white} /> Enter Code
                    </button>
                    <button onClick={() => setShowLiveJoinModal(true)} style={{ ...chunkyButton(palette.softGreen, palette.softGreenShadow, 'sm'), display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Icon name="play" size={14} color={palette.white} /> Join Live
                    </button>
                    <button onClick={() => changeMenu('Games')} style={{ background: 'transparent', color: 'white', border: `1.5px solid rgba(255,255,255,0.35)`, padding: '10px 20px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Icon name="target" size={14} color={palette.white} secondaryColor="rgba(255,255,255,0.5)" /> Play Games
                    </button>
                  </div>
                </div>
              </div>

              <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                {[
                  { label: 'Words Learned', value: displayProgress.wordsLearned },
                  { label: 'Games Played', value: displayProgress.gamesPlayed },
                  { label: 'Current Streak', value: displayProgress.streak, unit: 'days' },
                  { label: 'Total Points', value: displayProgress.totalPoints },
                ].map((stat, i) => (
                  <div key={i} className="stat-card-dash" style={{ background: palette.white, borderRadius: '14px', padding: '18px 20px', border: `1.5px solid ${palette.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: palette.bodyTextSoft, textTransform: 'uppercase', fontFamily: "'Fredoka', sans-serif" }}>{stat.label}</span>
                      {stat.label === 'Total Points' && <span style={{ padding: '3px 9px', background: palette.creamSoft, borderRadius: '8px', fontSize: '10px', color: palette.warmOrange, fontWeight: 800 }}>LVL {displayProgress.level}</span>}
                    </div>
                    <div>
                      <span style={{ fontSize: '26px', fontWeight: 800, color: palette.deepNavy, fontFamily: "'Fredoka', sans-serif" }}>{stat.value}</span>
                      {stat.unit && <span style={{ fontSize: '12px', color: palette.bodyTextSoft, marginLeft: '4px' }}>{stat.unit}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showJoinModal && (
            <div style={styles.modalOverlay} onClick={() => setShowJoinModal(false)}>
              <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button style={styles.modalClose} onClick={() => setShowJoinModal(false)}>✕</button>
                <h2 style={styles.modalTitle}>Enter Code</h2>
                {joinError && <div style={styles.errorMessage}>{joinError}</div>}
                <input type="text" placeholder="000000" value={joinPin} onChange={(e) => setJoinPin(e.target.value.toUpperCase().slice(0, 6))} style={styles.input} maxLength={6} />
                <button onClick={handleJoinActivity} style={styles.primaryBtn}>{joinLoading ? 'Joining...' : 'Join Activity →'}</button>
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
                </div>
                <div style={styles.modalActions}>
                  <button onClick={() => setShowActivityModal(false)} style={styles.cancelBtn}>Cancel</button>
                  <button onClick={startActivity} style={styles.startBtn}>Start</button>
                </div>
              </div>
            </div>
          )}

          {showLiveJoinModal && <LiveJoinModal onClose={() => setShowLiveJoinModal(false)} onJoined={handleLiveJoined} />}

          {showLevelUpCard && (
            <LevelUpCelebration 
              key={`levelup-${levelUpCardLevel}`}
              level={levelUpCardLevel} 
              onClose={() => setShowLevelUpCard(false)} 
            />
          )}
        </div>
      </div>
    </>
  );
};

const styles = {
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(42, 40, 69, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' },
  modalContent: { background: palette.white, borderRadius: '20px', padding: '28px', maxWidth: '420px', width: '100%', position: 'relative', border: `1.5px solid ${palette.border}` },
  modalClose: { position: 'absolute', top: '14px', right: '16px', background: palette.creamSoft, border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' },
  modalTitle: { fontSize: '20px', fontWeight: 800, color: palette.deepNavy, margin: '0 0 6px 0', fontFamily: "'Fredoka', sans-serif" },
  errorMessage: { padding: '10px 14px', backgroundColor: `${palette.coral}15`, border: `1.5px solid ${palette.coral}40`, borderRadius: '10px', color: palette.coral, fontSize: '12px', marginBottom: '14px' },
  input: { width: '100%', padding: '12px 16px', border: `1.5px solid ${palette.border}`, borderRadius: '12px', fontSize: '20px', fontWeight: 700, textAlign: 'center', letterSpacing: '6px', background: palette.creamSoft, marginBottom: '14px' },
  primaryBtn: { width: '100%', padding: '14px', ...chunkyButton(palette.warmOrange, palette.warmOrangeShadow), fontSize: '14px' },
  activityDetail: { background: palette.creamSoft, padding: '14px 16px', borderRadius: '12px', marginBottom: '18px', border: `1.5px solid ${palette.border}`, fontSize: '13px' },
  modalActions: { display: 'flex', gap: '10px' },
  cancelBtn: { flex: 1, padding: '12px', background: palette.creamSoft, color: palette.deepNavy, border: `1.5px solid ${palette.border}`, borderRadius: '12px', cursor: 'pointer' },
  startBtn: { flex: 2, padding: '12px', ...chunkyButton(palette.softGreen, palette.softGreenShadow), fontSize: '13px' },
};

export default Dashboard;