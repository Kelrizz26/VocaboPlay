// src/components/Dashboard.jsx
// ============================================================
// ✅ FULLSCREEN API: Auto-fullscreen kapag nasa game
// ✅ FULLY RESPONSIVE IN LANDSCAPE MODE
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
import DevPanel from './dashboard/DevPanel';

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
};

const XP_BASE = 100;
const XP_INCREMENT = 30;
const MAX_LEVEL = 50;

const MILESTONE_DIAMOND_REWARDS = {
  6: 2, 11: 3, 16: 5, 21: 8, 26: 12,
  31: 18, 36: 25, 41: 35, 46: 50, 50: 75,
};

const getMilestoneDiamonds = (level) => MILESTONE_DIAMOND_REWARDS[level] || 0;

export const computeLevelFromPoints = (points) => {
  const total = points || 0;
  let level = 1, accumulated = 0;
  while (level < MAX_LEVEL) {
    const need = XP_BASE + (level - 1) * XP_INCREMENT;
    if (total >= accumulated + need) { accumulated += need; level++; } else break;
  }
  return level;
};

export const computeCurrentXP = (points) => {
  const total = points || 0;
  const level = computeLevelFromPoints(points);
  if (level >= MAX_LEVEL) return 0;
  let accumulated = 0, currentLvl = 1;
  while (currentLvl < MAX_LEVEL) {
    const need = XP_BASE + (currentLvl - 1) * XP_INCREMENT;
    if (total >= accumulated + need) { accumulated += need; currentLvl++; } else break;
  }
  return total - accumulated;
};

export const computeXpToNext = (points) => {
  const level = computeLevelFromPoints(points);
  if (level >= MAX_LEVEL) return 0;
  return XP_BASE + (level - 1) * XP_INCREMENT;
};

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
    rotate: (<><path d="M21 2v6h-6M3 12a9 9 0 0115-6.7L21 8M3 22v-6h6M21 12a9 9 0 01-15 6.7L3 16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>),
  };
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block', flexShrink: 0 }}>{icons[name] || icons.grid}</svg>);
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentGame, setCurrentGame] = useState(null);
  
  const getInitialMobileState = () => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth <= 768 || window.innerHeight <= 500;
  };

  const [isMobile, setIsMobile] = useState(getInitialMobileState);
  const [isPortrait, setIsPortrait] = useState(
    typeof window !== 'undefined' ? window.innerHeight > window.innerWidth : true
  );
  const [isSidebarVisible, setIsSidebarVisible] = useState(
    typeof window !== 'undefined' ? !getInitialMobileState() : false
  );
  const [contentKey, setContentKey] = useState(0);

  const [recentActivities, setRecentActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
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
  const [levelUpDiamonds, setLevelUpDiamonds] = useState(0);

  const userId = localStorage.getItem('userId');
  const { stats, loading, error } = useUserStats(userId);

  const isInGame = currentGame !== null;

  // ✅ FIXED: Resize handler
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const mobile = width <= 768 || height <= 500;
      const portrait = height > width;
      
      setIsMobile(mobile);
      setIsPortrait(portrait);
      
      if (mobile) {
        setIsSidebarVisible(false);
      } else {
        setIsSidebarVisible(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // ✅ FULLSCREEN API: Auto-fullscreen kapag pumasok sa game
  useEffect(() => {
    if (currentGame) {
      setIsSidebarVisible(false);
      // Try to enter fullscreen
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(err => console.log('Fullscreen error:', err));
      } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
      }
    } else {
      setIsSidebarVisible(!isMobile);
      // Exit fullscreen kapag labas na sa game
      if (document.fullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(err => console.log('Exit fullscreen error:', err));
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentGame]);

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

  const refreshRecentActivities = async () => {
    if (!userId) return;
    try {
      const scoresQuery = query(collection(db, 'scores'), where('studentId', '==', userId));
      const scoresSnap = await getDocs(scoresQuery);
      const activities = scoresSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      activities.sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0));
      setRecentActivities(activities.slice(0, 5));
    } catch (e) { console.error('Error refreshing activities:', e); }
  };

  useEffect(() => {
    const fetchRecentActivities = async () => {
      if (!userId) return;
      setLoadingActivities(true);
      try {
        const scoresQuery = query(collection(db, 'scores'), where('studentId', '==', userId));
        const scoresSnap = await getDocs(scoresQuery);
        const activities = scoresSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        activities.sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0));
        setRecentActivities(activities.slice(0, 5));
      } catch (error) { console.error('Error fetching recent activities:', error); }
      finally { setLoadingActivities(false); }
    };
    fetchRecentActivities();
  }, [userId, contentKey]);

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

      const currentTotalPoints = userData.totalPoints || 0;
      const currentStreak = userData.currentStreak || 0;
      const currentGameStats = userData.gameStats || {};
      const currentWordsLearned = userData.wordsLearned || 0;
      const currentGamesPlayed = userData.gamesPlayed || 0;
      const currentAccuracy = userData.accuracy || 0;
      const currentDiamonds = userData.totalDiamonds || 0;
      const currentLearnedWords = userData.learnedWordsList || userData.learnedWords || [];

      let newLearnedWords = Array.isArray(currentLearnedWords) ? [...currentLearnedWords] : [];
      if (updates.newWords && Array.isArray(updates.newWords)) {
        updates.newWords.forEach(word => {
          const wordStr = typeof word === 'string' ? word : (word?.word || word?.term || '');
          const normalized = String(wordStr).trim().toUpperCase();
          if (normalized && !newLearnedWords.includes(normalized)) newLearnedWords.push(normalized);
        });
      }

      let pointsEarned = 0;
      if (updates.totalPoints !== undefined) pointsEarned = updates.totalPoints;
      else if (updates.score !== undefined) pointsEarned = updates.score;
      else if (updates.xp !== undefined) pointsEarned = updates.xp;

      const newTotalPoints = currentTotalPoints + pointsEarned;
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

      const oldLevel = computeLevelFromPoints(currentTotalPoints);
      const newLevel = computeLevelFromPoints(newTotalPoints);
      const currentXP = computeCurrentXP(newTotalPoints);
      const xpToNext = computeXpToNext(newTotalPoints);

      let milestoneDiamonds = 0;
      if (newLevel > oldLevel) {
        for (let lvl = oldLevel + 1; lvl <= newLevel; lvl++) milestoneDiamonds += getMilestoneDiamonds(lvl);
        setLevelUpCardLevel(newLevel);
        setLevelUpDiamonds(milestoneDiamonds);
        setShowLevelUpCard(true);
      }

      const newDiamonds = currentDiamonds + milestoneDiamonds;

      let newGamesPlayed = currentGamesPlayed;
      if (updates.gamesPlayed !== undefined && updates.gamesPlayed > 0) newGamesPlayed = currentGamesPlayed + updates.gamesPlayed;
      else {
        let totalGamesPlayed = 0;
        Object.values(gameStats).forEach(g => { if (g && typeof g === 'object') totalGamesPlayed += g.played || 0; });
        if (totalGamesPlayed > 0) newGamesPlayed = Math.max(totalGamesPlayed, currentGamesPlayed);
      }

      let totalQuestionsAll = 0;
      Object.values(gameStats).forEach(g => { if (g && typeof g === 'object') totalQuestionsAll += g.total || 0; });
      let newAccuracy = currentAccuracy;
      if (totalQuestionsAll > 0) {
        const totalCorrect = Object.values(gameStats).reduce((sum, g) => sum + (g.correct || 0), 0);
        newAccuracy = Math.round((totalCorrect / totalQuestionsAll) * 100);
      }

      const newWordsLearned = currentWordsLearned + (updates.wordsLearned || 0);

      const updateData = {
        totalPoints: newTotalPoints, level: newLevel, xp: currentXP, xpToNext,
        currentStreak: newStreak, gamesPlayed: newGamesPlayed, wordsLearned: newWordsLearned,
        learnedWordsList: newLearnedWords, accuracy: newAccuracy, gameStats,
        totalDiamonds: newDiamonds, lastActive: new Date().toISOString()
      };

      await updateDoc(userRef, updateData);

      const newProgress = {
        totalPoints: newTotalPoints, level: newLevel, xp: currentXP, xpToNext,
        streak: newStreak, gamesPlayed: newGamesPlayed, wordsLearned: newWordsLearned,
        learnedWordsList: newLearnedWords, accuracy: newAccuracy, gameStats, totalDiamonds: newDiamonds
      };
      localStorage.setItem('vocaboplay_progress', JSON.stringify(newProgress));

      try {
        const cached = JSON.parse(localStorage.getItem('firebaseUserData') || '{}');
        cached.totalPoints = newTotalPoints;
        cached.totalDiamonds = newDiamonds;
        cached.level = newLevel;
        localStorage.setItem('firebaseUserData', JSON.stringify(cached));
      } catch (e) {}

      window.dispatchEvent(new CustomEvent('progressUpdate', { detail: newProgress }));
      return newProgress;
    } catch (error) {
      console.error('❌ Firebase error:', error);
      return null;
    }
  };

  const completeActivity = async (activityId, score, correctAnswers, totalQuestions, answers = {}, wordsList = []) => {
    try {
      const activityRef = doc(db, 'activities', activityId);
      const activitySnap = await getDoc(activityRef);
      const activityData = activitySnap.exists() ? activitySnap.data() : {};

      await addDoc(collection(db, 'scores'), {
        activityId, studentId: userId,
        studentName: userProfile.displayName || 'Student',
        score, correctAnswers, totalQuestions,
        gameType: activityData.gameType || 'quiz',
        activityTitle: activityData.title || '',
        source: 'teacher-pin', answers, wordsList,
        completedAt: new Date().toISOString()
      });

      if (activitySnap.exists()) {
        await updateDoc(activityRef, { participants: (activitySnap.data().participants || 0) + 1 });
      }
      if (updateProgress) {
        await updateProgress({ totalPoints: score, wordsLearned: correctAnswers, gamesPlayed: 1, newWords: wordsList });
      }
      await refreshRecentActivities();
    } catch (error) { console.error('Error completing activity:', error); }
  };

  const recordSoloGame = async (gameType, score, correctAnswers, totalQuestions, wordsList = []) => {
    if (!userId) return;
    try {
      await addDoc(collection(db, 'scores'), {
        studentId: userId,
        studentName: userProfile.displayName || 'Student',
        score: score || 0, correctAnswers: correctAnswers || 0, totalQuestions: totalQuestions || 0,
        gameType, source: 'solo', wordsList,
        completedAt: new Date().toISOString()
      });
      if (wordsList && wordsList.length > 0) {
        await updateProgress({ newWords: wordsList });
      }
      await refreshRecentActivities();
    } catch (error) { console.error('Error recording solo game:', error); }
  };

  const handleLogout = () => { localStorage.clear(); auth.signOut().catch(console.error); navigate('/'); };

  const startGame = (gameId) => {
    const availableGames = ['wordpics', 'match', 'quiz', 'guesswhat', 'short-story'];
    if (!availableGames.includes(gameId)) {
      console.warn('❌ Invalid game ID:', gameId);
      return;
    }
    setCurrentGame(gameId);
    setActiveMenu(null);
    setIsSidebarVisible(false);
    window.scrollTo(0, 0);
  };

  const exitGame = () => {
    setCurrentGame(null);
    setActiveMenu('Dashboard');
    refreshRecentActivities();
  };

  const changeMenu = (menu) => {
    setActiveMenu(menu);
    setContentKey(prev => prev + 1);
    setCurrentGame(null);
    if (isMobile) setIsSidebarVisible(false);
  };

  const handleLiveJoined = (session) => { setLiveSession(session); setLivePlayerId(userId); setLiveView('lobby'); setShowLiveJoinModal(false); };
  const handleLiveGameStart = (session) => { setLiveSession(session); setLiveView('game'); };
  const handleLiveGameEnd = (session) => { setLiveSession(session); setLiveView('results'); refreshRecentActivities(); };
  const handleLiveExit = () => { setLiveSession(null); setLiveView(null); setLivePlayerId(null); refreshRecentActivities(); };

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

  const rawTotalPoints = DEMO_FORCE_LEVEL ? 250 : (stats?.progress?.totalPoints ?? progress.totalPoints ?? 0);

  const displayProgress = {
    wordsLearned: stats?.progress?.wordsLearned ?? progress.wordsLearned ?? 0,
    gamesPlayed: stats?.progress?.gamesPlayed ?? progress.gamesPlayed ?? 0,
    totalPoints: rawTotalPoints,
    level: computeLevelFromPoints(rawTotalPoints),
    xp: computeCurrentXP(rawTotalPoints),
    xpToNext: computeXpToNext(rawTotalPoints),
    isMaxLevel: computeLevelFromPoints(rawTotalPoints) >= MAX_LEVEL,
    streak: stats?.progress?.streak ?? progress.streak ?? 0,
    accuracy: stats?.progress?.accuracy ?? progress.accuracy ?? 0,
  };

  const displayName = stats?.displayName || userProfile?.displayName || 'User';

  if (liveView === 'lobby' && liveSession) return <LivePlayerLobby session={liveSession} playerId={livePlayerId} onGameStart={handleLiveGameStart} onCancel={handleLiveExit} />;
  if (liveView === 'game' && liveSession) return <LivePlayerGame session={liveSession} playerId={livePlayerId} onGameEnd={handleLiveGameEnd} completeActivity={completeActivity} />;
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
        body { font-family: 'Nunito', system-ui, sans-serif; background: ${palette.cream}; overflow-x: hidden; }
        .menu-item { transition: background 0.18s ease; }
        .menu-item:hover { background: rgba(233, 160, 117, 0.12) !important; }
        .menu-item.active { background: rgba(233, 160, 117, 0.18) !important; border-left: 3px solid ${palette.warmOrange} !important; padding-left: 21px !important; }
        .theme-toggle-wrap, .theme-toggle-wrap span { color: rgba(255,255,255,0.85) !important; }
        .dashboard-container { opacity: 0; transform: translateY(16px); animation: fadeInUp 0.7s ease-out forwards; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .profile-menu-item { transition: background 0.15s ease; }
        .profile-menu-item:hover { background: ${palette.creamSoft}; }
        .recent-activity-item { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .recent-activity-item:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(42, 40, 69, 0.06); }

        .hamburger-btn {
          display: none;
          position: fixed;
          top: 16px;
          left: 16px;
          z-index: 10001;
          width: 46px;
          height: 46px;
          background: ${palette.deepNavy};
          border: 2px solid rgba(255,255,255,0.15);
          border-radius: 12px;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(42, 40, 69, 0.4);
          transition: transform 0.15s ease, background 0.15s ease;
        }
        .hamburger-btn:hover { background: ${palette.deepNavyLight}; }
        .hamburger-btn:active { transform: scale(0.94); }

        @media (max-width: 768px), (max-height: 500px) and (orientation: landscape) {
          .hamburger-btn { display: flex !important; }
          .main-content { padding: 16px !important; }
          .dashboard-welcome { flex-direction: column !important; text-align: center !important; padding: 20px !important; }
          .recent-activity-item { flex-wrap: wrap; }
        }

        @media (orientation: landscape) and (max-height: 500px) {
          .main-content { padding: 12px 20px !important; }
          .dashboard-welcome { 
            flex-direction: row !important; 
            padding: 16px 24px !important; 
            min-height: auto !important; 
            gap: 16px !important; 
            text-align: left !important;
          }
          .dashboard-welcome h2 { font-size: 22px !important; margin-bottom: 4px !important; }
          .dashboard-welcome p { font-size: 13px !important; margin-bottom: 12px !important; }
          .dashboard-welcome > div:first-child { flex-shrink: 0; transform: scale(0.8); transform-origin: center left; }
          
          .stats-grid { 
            grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)) !important; 
            gap: 8px !important;
          }
          .stat-card-dash { padding: 12px 14px !important; }
          .stat-card-dash span:first-child { font-size: 10px !important; } 
          .stat-card-dash div span:first-child { font-size: 20px !important; } 
          
          .game-mode {
            padding: 0 !important;
            margin: 0 !important;
            width: 100dvw !important;
            height: 100dvh !important;
            overflow: hidden !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
          }
        }
      `}</style>

      {isInGame && isPortrait && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100000,
          background: `linear-gradient(135deg, ${palette.deepNavy} 0%, ${palette.deepNavyLight} 100%)`,
          color: 'white', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '30px', textAlign: 'center'
        }}>
          <div style={{ marginBottom: '24px', animation: 'rotatePhone 2s ease-in-out infinite' }}>
            <Icon name="rotate" size={80} color={palette.warmOrange} />
          </div>
          <h2 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: '24px', marginBottom: '12px' }}>
            I-rotate ang Phone Mo! 📱↔️
          </h2>
          <p style={{ fontSize: '15px', opacity: 0.8, maxWidth: '300px', lineHeight: 1.5 }}>
            Para sa mas magandang experience, pihitin mo yung phone mo papuntang <strong>landscape mode</strong> para magpatuloy sa game.
          </p>
          <style>{`
            @keyframes rotatePhone {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: rotate(90deg); }
            }
          `}</style>
        </div>
      )}

      {isMobile && !isInGame && !isSidebarVisible && (
        <button
          className="hamburger-btn"
          onClick={() => setIsSidebarVisible(true)}
          aria-label="Open menu"
        >
          <Icon name="menu" size={26} color={palette.white} />
        </button>
      )}

      {!isInGame && (
        <div className="sidebar-fixed open" style={{
          width: '260px',
          background: `linear-gradient(180deg, ${palette.deepNavy} 0%, ${palette.deepNavyLight} 100%)`,
          color: '#fff',
          display: 'flex', flexDirection: 'column',
          position: 'fixed', height: '100vh', left: 0, top: 0,
          zIndex: 1000,
          borderRight: `1px solid rgba(255,255,255,0.06)`,
          transform: isSidebarVisible ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
        }}>
          <div style={{ padding: '20px 22px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', fontFamily: "'Fredoka', sans-serif" }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src="/image/logo.png" alt="VocaboPlay" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
              <span style={{ fontSize: '19px', fontWeight: 700 }}>VocaboPlay</span>
            </div>
            <button
              onClick={() => setIsSidebarVisible(false)}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Close menu"
            >
              <Icon name="close" size={18} color={palette.white} />
            </button>
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
      )}

      {!isInGame && isSidebarVisible && isMobile && (
        <div onClick={() => setIsSidebarVisible(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(42, 40, 69, 0.4)', zIndex: 999 }} />
      )}

      <div key={contentKey} className={`dashboard-container ${isInGame ? 'game-mode' : ''}`} style={{ display: 'flex', minHeight: '100vh', background: palette.cream }}>
        <div className={`main-content ${isInGame ? 'game-mode' : ''}`} style={{
          flex: 1,
          marginLeft: (!isMobile && !isInGame && isSidebarVisible) ? '260px' : '0',
          padding: isInGame ? '0' : '24px 32px',
          transition: 'margin-left 0.3s ease',
          width: '100%',
        }}>

          {!isInGame && (
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
                  <div style={{ position: 'absolute', top: '50px', right: 0, background: palette.white, borderRadius: '14px', zIndex: 1000, minWidth: '240px', border: `1.5px solid ${palette.border}`, boxShadow: '0 10px 30px rgba(42, 40, 69, 0.12)', padding: '8px' }}>
                    <button onClick={() => { setShowProfileMenu(false); changeMenu('My Profile'); }} className="profile-menu-item" style={{ width: '100%', padding: '10px 12px', border: 'none', background: 'none', fontSize: '13px', cursor: 'pointer', textAlign: 'left', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: palette.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 3px 0 ${palette.tealShadow}` }}>
                        <Icon name="user" size={16} color={palette.white} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                        <span style={{ fontWeight: 800, color: palette.deepNavy, fontFamily: "'Fredoka', sans-serif", fontSize: '13px' }}>My Profile</span>
                        <span style={{ fontSize: '10px', color: palette.bodyTextSoft, fontWeight: 600, marginTop: '2px' }}>View your account</span>
                      </div>
                    </button>

                    <button onClick={handleLogout} className="profile-menu-item" style={{ width: '100%', padding: '10px 12px', border: 'none', background: 'none', fontSize: '13px', cursor: 'pointer', textAlign: 'left', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: palette.coral, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 3px 0 ${palette.coralShadow}` }}>
                        <Icon name="logout" size={16} color={palette.white} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                        <span style={{ fontWeight: 800, color: palette.coral, fontFamily: "'Fredoka', sans-serif", fontSize: '13px' }}>Sign Out</span>
                        <span style={{ fontSize: '10px', color: palette.bodyTextSoft, fontWeight: 600, marginTop: '2px' }}>Log out of account</span>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {currentGame === 'wordpics' && (
            <WordPicsGame
              onBack={exitGame}
              updateProgress={updateProgress}
              recordGame={recordSoloGame}
              currentPoints={displayProgress.totalPoints}
              onPointsChange={(newPoints) => setProgress({ ...progress, totalPoints: newPoints })}
            />
          )}
          {currentGame === 'match' && <MatchGame onBack={exitGame} updateProgress={updateProgress} recordGame={recordSoloGame} />}
          {currentGame === 'quiz' && <QuizGame onBack={exitGame} updateProgress={updateProgress} completeActivity={completeActivity} activityData={selectedActivity} recordGame={recordSoloGame} />}
          {currentGame === 'guesswhat' && <GuessWhatGame onBack={exitGame} updateProgress={updateProgress} recordGame={recordSoloGame} />}
          {currentGame === 'short-story' && <ShortStoryGame onBack={exitGame} updateProgress={updateProgress} recordGame={recordSoloGame} />}

          {!currentGame && activeMenu === 'Word Library' && <WordLibrary />}
          {!currentGame && activeMenu === 'Games' && <PlayGames startGame={startGame} />}
          {!currentGame && activeMenu === 'My Progress' && <MyProgress />}
          {!currentGame && activeMenu === 'My Cards' && (
            <GoatCardCollection
              currentLevel={displayProgress.level}
              onContinueLearning={() => changeMenu('Games')}
            />
          )}
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
                    <ExpBar xp={displayProgress.xp} xpToNext={displayProgress.xpToNext} level={displayProgress.level} isMaxLevel={displayProgress.isMaxLevel} color={palette.warmOrange} />
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

              <div style={{ background: palette.white, borderRadius: '16px', padding: '20px 24px', border: `1.5px solid ${palette.border}`, marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: palette.deepNavy, fontFamily: "'Fredoka', sans-serif", margin: 0 }}>Recent Activities and Recent Played</h3>
                    <p style={{ fontSize: '12px', color: palette.bodyTextSoft, margin: '4px 0 0 0' }}>Your recently played games and scores</p>
                  </div>
                  <button onClick={() => changeMenu('My Progress')} style={{ background: 'none', border: 'none', color: palette.warmOrange, fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Fredoka', sans-serif", padding: '4px 8px' }}>View All →</button>
                </div>

                {loadingActivities ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: palette.bodyTextSoft }}>
                    <div style={{ width: '28px', height: '28px', border: `3px solid ${palette.border}`, borderTop: `3px solid ${palette.warmOrange}`, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 10px' }} />
                    <p style={{ fontSize: '13px' }}>Loading activities...</p>
                  </div>
                ) : recentActivities.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: palette.bodyTextSoft }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎮</div>
                    <p style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px', color: palette.deepNavy }}>No activities yet</p>
                    <p style={{ fontSize: '12px', marginBottom: '16px' }}>Play a game to see your recent activities here!</p>
                    <button onClick={() => changeMenu('Games')} style={{ ...chunkyButton(palette.warmOrange, palette.warmOrangeShadow, 'sm'), fontSize: '12px', padding: '9px 20px' }}>Play Now</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {recentActivities.map((activity, idx) => {
                      const date = activity.completedAt ? new Date(activity.completedAt) : null;
                      const formattedDate = date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown date';
                      const formattedTime = date ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
                      const gameType = activity.gameType || activity.activityType || 'Game';
                      const gameTypeLower = String(gameType).toLowerCase();

                      const gameImage = {
                        'synoquest': '/image/wordpics.png', 'wordpics': '/image/wordpics.png',
                        'match': '/image/matchgame.png', 'matchgame': '/image/matchgame.png',
                        'quiz': '/image/quizgame.png', 'quizmaster': '/image/quizgame.png',
                        'guesswhat': '/image/guesswhatgame.png',
                        'short-story': '/image/shortstory.png', 'shortstory': '/image/shortstory.png',
                        'story-quest': '/image/shortstory.png', 'sentencebuilder': '/image/sentence.png',
                      }[gameTypeLower] || null;

                      const gameEmoji = { 'quiz': '🧠', 'match': '🃏', 'wordpics': '🖼️', 'synoquest': '🖼️', 'guesswhat': '❓', 'short-story': '📖', 'story-quest': '📖' }[gameTypeLower] || '🎮';
                      const gameLabel = { 'quiz': 'Quiz Master', 'match': 'Match Game', 'synoquest': 'SynoQuest', 'wordpics': 'SynoQuest', 'guesswhat': 'GuessWhat', 'short-story': 'Story Quest', 'story-quest': 'Story Quest' }[gameTypeLower] || 'Game';
                      const displayTitle = activity.activityTitle ? `${activity.activityTitle} · ${gameLabel}` : gameLabel;
                      const score = activity.score || 0;
                      const correct = activity.correctAnswers || 0;
                      const total = activity.totalQuestions || 0;
                      const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

                      return (
                        <div key={activity.id || idx} className="recent-activity-item" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', background: palette.creamSoft, borderRadius: '12px', border: `1px solid ${palette.borderSoft}` }}>
                          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: palette.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0, border: `1.5px solid ${palette.border}`, overflow: 'hidden' }}>
                            {gameImage ? (
                              <img src={gameImage} alt={gameType} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = gameEmoji; }} />
                            ) : gameEmoji}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: palette.deepNavy, fontFamily: "'Fredoka', sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayTitle}</span>
                              {activity.source === 'teacher-pin' && (
                                <span style={{ fontSize: '9px', padding: '2px 6px', flexShrink: 0, background: `${palette.warmOrange}22`, color: palette.warmOrange, borderRadius: '4px', fontWeight: 800 }}>PIN</span>
                              )}
                            </div>
                            <div style={{ fontSize: '11px', color: palette.bodyTextSoft, marginTop: '2px' }}>{formattedDate}{formattedTime ? ` · ${formattedTime}` : ''}</div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: '16px', fontWeight: 800, color: palette.warmOrange, fontFamily: "'Fredoka', sans-serif" }}>+{score} pts</div>
                            {total > 0 && <div style={{ fontSize: '11px', color: palette.bodyTextSoft, marginTop: '2px' }}>{correct}/{total} ({percentage}%)</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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
              diamondsEarned={levelUpDiamonds}
              onClose={() => { setShowLevelUpCard(false); setLevelUpDiamonds(0); }}
            />
          )}

          {typeof window !== 'undefined' && window.location.search.includes('dev=1') && !currentGame && (
            <DevPanel
              userId={userId}
              currentLevel={displayProgress.level}
              currentPoints={displayProgress.totalPoints}
              currentDiamonds={(() => { try { const cached = JSON.parse(localStorage.getItem('firebaseUserData') || '{}'); return cached.totalDiamonds || 0; } catch { return 0; } })()}
              onRefresh={() => { window.location.reload(); }}
              onTriggerLevelUp={(lvl, diamonds) => { setLevelUpCardLevel(lvl); setLevelUpDiamonds(diamonds); setShowLevelUpCard(true); }}
            />
          )}
        </div>
      </div>

      <style>{`@keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }`}</style>
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