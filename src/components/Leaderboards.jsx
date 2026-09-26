// src/components/Leaderboards.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../pages/firebase';
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  getDoc
} from 'firebase/firestore';
import { getLeaderboard } from '../utils/streakHelper';
import { colors, fontFamily } from "./dashboard/dashboardStyles";
import { resetUserStats, removeUserFromLeaderboard, resetAllUserStats } from '../services/adminService';
import { AVATAR_SHOP_ITEMS, DEFAULT_AVATAR_ID } from '../data/avatarShop';

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
  danger: '#E76F51',
  dangerShadow: '#B54A32',
};

const BRAND_FONT_DISPLAY = "'Fredoka', sans-serif";
const BRAND_FONT_BODY = "'Nunito', sans-serif";

// ============================================================
// ✅ HELPER — Kunin yung avatar URL galing sa Avatar Shop
// ============================================================
const getStudentAvatarUrl = (user) => {
  if (!user) return AVATAR_SHOP_ITEMS[0]?.image || '';
  const avatarId = user.equippedAvatar || DEFAULT_AVATAR_ID;
  const found = AVATAR_SHOP_ITEMS.find(a => a.id === avatarId);
  return found?.image || AVATAR_SHOP_ITEMS[0]?.image || '';
};

// ============================================================
// ✅ REUSABLE — Face-focused Avatar component
// ============================================================
const PlayerAvatar = ({ user, size = 36, fontSize = 16, borderRadius = '50%' }) => {
  const [imgError, setImgError] = useState(false);
  const avatarSrc = getStudentAvatarUrl(user);

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
        aria-label={user?.displayName || 'Player'}
      />
    );
  }

  return (
    <span style={{ color: '#fff', fontWeight: '700', fontSize }}>
      {user?.displayName?.charAt(0)?.toUpperCase() || '?'}
    </span>
  );
};

const Leaderboards = ({ onBack, isAdmin = false, currentUserId = null }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all');
  const [selectedLeaderboard, setSelectedLeaderboard] = useState('points');
  const [pageLoaded, setPageLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const unsubscribeRef = useRef(null);

  // State for profile modal
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // State for custom confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    danger: false,
    onConfirm: null
  });

  // ============================================================
  // ===== LOAD USER FROM LOCALSTORAGE =====
  // ============================================================
  useEffect(() => {
    setPageLoaded(true);
    const savedUser = localStorage.getItem('vocaboplay_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        console.log('✅ Current user from localStorage:', user);
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
  }, []);

  // ============================================================
  // ===== GET VALUE BASED ON SELECTED LEADERBOARD =====
  // ============================================================
  const getValue = useCallback((user) => {
    const stats = user.stats || user.progress || {};
    switch (selectedLeaderboard) {
      case 'points': return stats.totalPoints || 0;
      case 'words': return stats.wordsLearned || 0;
      case 'streak': return stats.longestStreak || stats.streak || 0;
      case 'games': return stats.gamesPlayed || 0;
      default: return stats.totalPoints || 0;
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

  const getSortField = useCallback(() => {
    switch (selectedLeaderboard) {
      case 'points': return 'stats.totalPoints';
      case 'words': return 'stats.wordsLearned';
      case 'streak': return 'stats.longestStreak';
      case 'games': return 'stats.gamesPlayed';
      default: return 'stats.totalPoints';
    }
  }, [selectedLeaderboard]);

  // ============================================================
  // ===== FETCH USER PROFILE FOR MODAL =====
  // ============================================================
  const fetchUserProfile = async (userId) => {
    setProfileLoading(true);
    try {
      console.log('🔍 Fetching profile for user:', userId);

      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      let profileData = null;

      if (userDoc.exists()) {
        const data = userDoc.data();
        const stats = data.stats || data.progress || {};

        profileData = {
          id: userId,
          displayName: data.displayName || 'Anonymous User',
          username: data.username || `@${data.displayName?.toLowerCase().replace(/\s/g, '') || 'user'}`,
          email: data.email || 'No email set',
          equippedAvatar: data.equippedAvatar || DEFAULT_AVATAR_ID,
          bio: data.bio || 'No bio yet',
          phone: data.phone || 'Not set',
          location: data.location || 'Not set',
          website: data.website || 'Not set',
          twitter: data.twitter || 'Not set',
          instagram: data.instagram || 'Not set',
          linkedin: data.linkedin || 'Not set',
          emailNotifications: data.emailNotifications !== undefined ? data.emailNotifications : true,
          darkMode: data.darkMode || false,
          language: data.language || 'English',
          stats: {
            wordsLearned: stats.wordsLearned || 0,
            gamesPlayed: stats.gamesPlayed || 0,
            streak: stats.streak || 0,
            longestStreak: stats.longestStreak || 0,
            totalPoints: stats.totalPoints || 0,
            level: stats.level || 1,
            accuracy: stats.accuracy || 0,
            correctAnswers: stats.correctAnswers || 0,
            totalQuestions: stats.totalQuestions || 0
          },
          isLocal: false
        };
      } else {
        const localData = getLeaderboard();
        const localUser = localData.find(u => u.userId === userId);
        if (localUser) {
          profileData = {
            id: userId,
            displayName: localUser.username || 'Player',
            username: `@${localUser.username?.toLowerCase().replace(/\s/g, '') || 'player'}`,
            email: 'Not synced',
            equippedAvatar: localUser.equippedAvatar || DEFAULT_AVATAR_ID,
            bio: 'Local player data',
            phone: 'Not set',
            location: 'Not set',
            website: 'Not set',
            twitter: 'Not set',
            instagram: 'Not set',
            linkedin: 'Not set',
            emailNotifications: true,
            darkMode: false,
            language: 'English',
            stats: {
              wordsLearned: localUser.wordsLearned || 0,
              gamesPlayed: localUser.gamesPlayed || 0,
              streak: localUser.streak || 0,
              longestStreak: localUser.streak || 0,
              totalPoints: localUser.totalPoints || 0,
              level: localUser.level || 1,
              accuracy: 0,
              correctAnswers: 0,
              totalQuestions: 0
            },
            isLocal: true
          };
        }
      }

      if (profileData) {
        setSelectedProfile(profileData);
        setShowProfileModal(true);
      } else {
        alert('User profile not found');
      }

    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      alert('Error loading profile. Please try again.');
    } finally {
      setProfileLoading(false);
    }
  };

  // ============================================================
  // ===== FETCH LEADERBOARD - FIXED MERGE LOGIC =====
  // ============================================================
  const fetchLeaderboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Fetching leaderboard from users collection...');
      console.log('📊 Selected category:', selectedLeaderboard);

      const usersRef = collection(db, 'users');
      const limitCount = isAdmin ? 50 : 20;
      const sortField = getSortField();

      console.log('📊 Sort field:', sortField);

      const q = query(
        usersRef,
        orderBy(sortField, 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);

      console.log('📊 Snapshot size:', snapshot.size);

      const firebaseUsers = snapshot.docs
        .map((doc, index) => {
          const data = doc.data();
          const stats = data.stats || {};

          if (!data.stats || Object.keys(stats).length === 0) {
            return null;
          }

          if (data.removedFromLeaderboard === true) {
            console.log(`🚫 User ${data.displayName} is removed from leaderboard`);
            return null;
          }

          if (doc.id === currentUserId) {
            console.log('👑 YOUR DATA FROM FIREBASE:', {
              id: doc.id,
              displayName: data.displayName,
              stats: stats
            });
          }

          return {
            id: doc.id,
            rank: index + 1,
            displayName: data.displayName || 'Anonymous User',
            equippedAvatar: data.equippedAvatar || DEFAULT_AVATAR_ID,
            email: data.email || 'No email',
            username: data.username || `@${data.displayName?.toLowerCase().replace(/\s/g, '') || 'user'}`,
            stats: stats,
            progress: {
              totalPoints: stats.totalPoints || 0,
              wordsLearned: stats.wordsLearned || 0,
              longestStreak: stats.longestStreak || 0,
              gamesPlayed: stats.gamesPlayed || 0,
              level: stats.level || 1,
              accuracy: stats.accuracy || 0,
              correctAnswers: stats.correctAnswers || 0,
              totalQuestions: stats.totalQuestions || 0
            },
            isLocal: false,
            _source: 'firebase'
          };
        })
        .filter(user => user !== null);

      const localData = getLeaderboard();
      console.log('📊 Local data from localStorage:', localData.length);

      const mergedMap = new Map();

      firebaseUsers.forEach(user => {
        if (user) mergedMap.set(user.id, { ...user });
      });

      localData.forEach(localUser => {
        const userId = localUser.userId;

        if (!mergedMap.has(userId)) {
          mergedMap.set(userId, {
            id: userId,
            rank: mergedMap.size + 1,
            displayName: localUser.username || 'Player',
            equippedAvatar: localUser.equippedAvatar || DEFAULT_AVATAR_ID,
            email: localUser.email || '',
            username: `@${localUser.username?.toLowerCase().replace(/\s/g, '') || 'player'}`,
            stats: {
              totalPoints: localUser.totalPoints || 0,
              wordsLearned: localUser.wordsLearned || 0,
              gamesPlayed: localUser.gamesPlayed || 0,
              longestStreak: localUser.longestStreak || localUser.streak || 0,
              level: localUser.level || 1
            },
            progress: {
              totalPoints: localUser.totalPoints || 0,
              wordsLearned: localUser.wordsLearned || 0,
              gamesPlayed: localUser.gamesPlayed || 0,
              longestStreak: localUser.longestStreak || localUser.streak || 0,
              level: localUser.level || 1
            },
            isLocal: true,
            _source: 'local'
          });
        } else {
          console.log(`⚠️ User ${userId} already in Firebase, skipping local data`);
        }
      });

      let mergedData = Array.from(mergedMap.values());

      mergedData.sort((a, b) => {
        const aVal = getValue(a);
        const bVal = getValue(b);
        return bVal - aVal;
      });

      mergedData.forEach((user, index) => {
        user.rank = index + 1;
      });

      setLeaderboardData(mergedData);
      console.log('✅ Leaderboard loaded:', mergedData.length, 'players');

      if (mergedData.length > 0) {
        console.log('🏆 Top 3:', mergedData.slice(0, 3).map(u => ({
          name: u.displayName,
          points: u.stats?.totalPoints || 0,
          words: u.stats?.wordsLearned || 0,
          games: u.stats?.gamesPlayed || 0,
          streak: u.stats?.longestStreak || 0
        })));
      }

    } catch (error) {
      console.error('❌ Error fetching leaderboard:', error);
      setError(error.message);

      const localData = getLeaderboard();
      const formatted = localData.map((entry, index) => ({
        id: entry.userId || `local_${index}`,
        rank: index + 1,
        displayName: entry.username || 'Player',
        equippedAvatar: entry.equippedAvatar || DEFAULT_AVATAR_ID,
        email: entry.email || '',
        username: `@${entry.username?.toLowerCase().replace(/\s/g, '') || 'player'}`,
        stats: {
          totalPoints: entry.totalPoints || 0,
          wordsLearned: entry.wordsLearned || 0,
          gamesPlayed: entry.gamesPlayed || 0,
          longestStreak: entry.longestStreak || entry.streak || 0,
          level: entry.level || 1
        },
        progress: {
          totalPoints: entry.totalPoints || 0,
          wordsLearned: entry.wordsLearned || 0,
          gamesPlayed: entry.gamesPlayed || 0,
          longestStreak: entry.longestStreak || entry.streak || 0,
          level: entry.level || 1
        },
        isLocal: true
      }));
      setLeaderboardData(formatted);
    } finally {
      setLoading(false);
    }
  }, [selectedLeaderboard, isAdmin, currentUserId, getSortField, getValue]);

  useEffect(() => {
    fetchLeaderboardData();
  }, [fetchLeaderboardData]);

  // ============================================================
  // ===== REAL-TIME LISTENER =====
  // ============================================================
  useEffect(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    const usersRef = collection(db, 'users');

    const q = query(
      usersRef,
      orderBy('stats.totalPoints', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('🔄 Real-time update detected!');

      if (!loading) {
        try {
          const firebaseUsers = snapshot.docs
            .map((doc) => {
              const data = doc.data();
              const stats = data.stats || {};

              if (!data.stats || Object.keys(stats).length === 0) {
                return null;
              }

              if (data.removedFromLeaderboard === true) {
                return null;
              }

              return {
                id: doc.id,
                displayName: data.displayName || 'Anonymous User',
                equippedAvatar: data.equippedAvatar || DEFAULT_AVATAR_ID,
                email: data.email || 'No email',
                username: data.username || `@${data.displayName?.toLowerCase().replace(/\s/g, '') || 'user'}`,
                stats: stats,
                progress: {
                  totalPoints: stats.totalPoints || 0,
                  wordsLearned: stats.wordsLearned || 0,
                  gamesPlayed: stats.gamesPlayed || 0,
                  longestStreak: stats.longestStreak || 0,
                  level: stats.level || 1
                },
                isLocal: false,
                _source: 'firebase'
              };
            })
            .filter(user => user !== null);

          const localData = getLeaderboard();
          const mergedMap = new Map();

          firebaseUsers.forEach(user => {
            if (user) mergedMap.set(user.id, { ...user });
          });

          localData.forEach(localUser => {
            const userId = localUser.userId;
            if (!mergedMap.has(userId)) {
              mergedMap.set(userId, {
                id: userId,
                rank: mergedMap.size + 1,
                displayName: localUser.username || 'Player',
                equippedAvatar: localUser.equippedAvatar || DEFAULT_AVATAR_ID,
                email: localUser.email || '',
                username: `@${localUser.username?.toLowerCase().replace(/\s/g, '') || 'player'}`,
                stats: {
                  totalPoints: localUser.totalPoints || 0,
                  wordsLearned: localUser.wordsLearned || 0,
                  gamesPlayed: localUser.gamesPlayed || 0,
                  longestStreak: localUser.longestStreak || localUser.streak || 0,
                  level: localUser.level || 1
                },
                progress: {
                  totalPoints: localUser.totalPoints || 0,
                  wordsLearned: localUser.wordsLearned || 0,
                  gamesPlayed: localUser.gamesPlayed || 0,
                  longestStreak: localUser.longestStreak || localUser.streak || 0,
                  level: localUser.level || 1
                },
                isLocal: true,
                _source: 'local'
              });
            }
          });

          let mergedData = Array.from(mergedMap.values());
          mergedData.sort((a, b) => {
            const aVal = getValue(a);
            const bVal = getValue(b);
            return bVal - aVal;
          });
          mergedData.forEach((user, index) => user.rank = index + 1);

          setLeaderboardData(mergedData);
          console.log('✅ Leaderboard updated in real-time:', mergedData.length, 'players');
        } catch (error) {
          console.error('Error refreshing real-time data:', error);
        }
      }
    }, (error) => {
      console.error('❌ Listener error:', error);
      setError(`Listener error: ${error.message}`);
    });

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [loading, getValue]);

  // ============================================================
  // ===== ADMIN FUNCTIONS =====
  // ============================================================
  const handleResetStats = async (userId) => {
    if (!isAdmin) return;

    const user = leaderboardData.find(u => u.id === userId);
    const userName = user?.displayName || 'this user';

    setConfirmDialog({
      isOpen: true,
      title: '⚠️ Reset User Stats',
      message: `Are you sure you want to reset ALL stats for "${userName}"?\n\nThis will:\n• Set all points to 0\n• Reset level to 1\n• Clear word progress\n• Reset streak\n\nThis action CANNOT be undone!`,
      confirmText: 'Yes, Reset Stats',
      cancelText: 'Cancel',
      danger: true,
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        try {
          setLoading(true);
          const result = await resetUserStats(userId);

          if (result.success) {
            alert(`✅ Successfully reset stats for "${userName}"`);
            await fetchLeaderboardData();
          }
        } catch (error) {
          console.error('❌ Reset failed:', error);
          alert(`❌ Failed to reset stats: ${error.message}`);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleRemoveUser = async (userId) => {
    if (!isAdmin) return;

    const user = leaderboardData.find(u => u.id === userId);
    const userName = user?.displayName || 'this user';

    setConfirmDialog({
      isOpen: true,
      title: '🗑️ Remove User',
      message: `Are you sure you want to remove "${userName}" from the leaderboard?\n\nThis will:\n• Remove user from leaderboard display\n• User will reappear when they log in again\n• Stats are preserved\n\nThis action CAN be reversed when user logs in again.`,
      confirmText: 'Yes, Remove User',
      cancelText: 'Cancel',
      danger: true,
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        try {
          setLoading(true);
          const result = await removeUserFromLeaderboard(userId);

          if (result.success) {
            alert(`✅ "${userName}" removed from leaderboard\nThey will reappear when they log in again.`);
            await fetchLeaderboardData();
          }
        } catch (error) {
          console.error('❌ Remove failed:', error);
          alert(`❌ Failed to remove user: ${error.message}`);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleResetAllStats = async () => {
    if (!isAdmin) return;

    setConfirmDialog({
      isOpen: true,
      title: '⚠️ DANGER: Reset ALL Stats',
      message: '⚠️ WARNING: This will reset ALL users\' stats!\n\nThis will:\n• Set all points to 0 for ALL users\n• Reset all levels to 1\n• Clear all word progress\n• Reset all streaks\n\nThis action CANNOT be undone!\n\nAre you sure you want to continue?',
      confirmText: 'Yes, Reset ALL',
      cancelText: 'Cancel',
      danger: true,
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        try {
          setLoading(true);
          const result = await resetAllUserStats();

          if (result.success) {
            alert(`✅ Successfully reset stats for ALL ${result.totalUsers} users`);
            await fetchLeaderboardData();
          }
        } catch (error) {
          console.error('❌ Reset all failed:', error);
          alert(`❌ Failed to reset all stats: ${error.message}`);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setSelectedProfile(null);
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ ...confirmDialog, isOpen: false });
  };

  const leaderboardTypes = [
    { id: 'points', label: 'Total Points', icon: '⭐', color: palette.warmOrange, bg: palette.cream },
    { id: 'words', label: 'Words Learned', icon: '📚', color: palette.softGreen, bg: palette.cream },
    { id: 'streak', label: 'Longest Streak', icon: '🔥', color: palette.coral, bg: palette.cream },
    { id: 'games', label: 'Games Played', icon: '🎮', color: palette.deepNavy, bg: palette.cream },
  ];

  const timeFilters = [
    { id: 'all', label: 'All Time' },
    { id: 'weekly', label: 'This Week' },
    { id: 'monthly', label: 'This Month' },
  ];

  const currentType = leaderboardTypes.find(t => t.id === selectedLeaderboard) || leaderboardTypes[0];

  const ConfirmationDialog = () => {
    if (!confirmDialog.isOpen) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(45, 42, 94, 0.5)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px',
      }} onClick={closeConfirmDialog}>
        <div style={{
          background: palette.white,
          borderRadius: '24px',
          maxWidth: '500px',
          width: '100%',
          padding: '32px',
          boxShadow: '0 25px 50px -12px rgba(244, 162, 97, 0.35)',
          fontFamily: BRAND_FONT_BODY,
          border: `2px solid ${palette.border}`,
        }} onClick={(e) => e.stopPropagation()}>
          <h3 style={{
            fontSize: '22px',
            fontWeight: '800',
            color: confirmDialog.danger ? palette.coral : palette.deepNavy,
            margin: '0 0 12px 0',
            fontFamily: BRAND_FONT_DISPLAY,
          }}>
            {confirmDialog.title}
          </h3>
          <p style={{
            fontSize: '15px',
            color: palette.bodyText,
            margin: '0 0 24px 0',
            lineHeight: '1.6',
            whiteSpace: 'pre-line',
            fontWeight: '600',
          }}>
            {confirmDialog.message}
          </p>
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
          }}>
            <button
              onClick={closeConfirmDialog}
              style={{
                padding: '10px 24px',
                background: palette.cream,
                border: `2px solid ${palette.border}`,
                borderRadius: '12px',
                color: palette.deepNavy,
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                fontFamily: BRAND_FONT_DISPLAY,
                transition: 'all 0.2s ease',
              }}
            >
              {confirmDialog.cancelText}
            </button>
            <button
              onClick={confirmDialog.onConfirm}
              style={{
                padding: '10px 24px',
                background: confirmDialog.danger ? palette.coral : palette.warmOrange,
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '800',
                cursor: 'pointer',
                fontFamily: BRAND_FONT_DISPLAY,
                transition: 'all 0.2s ease',
                boxShadow: confirmDialog.danger ? `0 4px 0 ${palette.coralShadow}` : `0 4px 0 ${palette.warmOrangeShadow}`,
              }}
            >
              {confirmDialog.confirmText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  // ===== RENDER =====
  // ============================================================
  return (
    <div className="leaderboard-container" style={{
      fontFamily: BRAND_FONT_BODY,
      maxWidth: isAdmin ? '1400px' : '1200px',
      margin: '0 auto',
      padding: '24px',
      color: palette.deepNavy,
      opacity: pageLoaded ? 1 : 0,
      transform: pageLoaded ? 'translateY(0)' : 'translateY(20px)',
      transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
    }}>
      <style>{`
        @media (max-width: 768px) {
          .leaderboard-container { padding: 16px !important; }
          .leaderboard-header { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
          .leaderboard-header h1 { font-size: 22px !important; }
          .leaderboard-header p { font-size: 13px !important; }
          .leaderboard-header-actions { width: 100% !important; justify-content: flex-start !important; }
          .leaderboard-time-filter { flex-wrap: wrap !important; gap: 8px !important; }
          .leaderboard-time-filter button { padding: 6px 14px !important; font-size: 12px !important; }
          .leaderboard-types { grid-template-columns: 1fr 1fr !important; gap: 8px !important; }
          .leaderboard-types button { padding: 12px !important; }
          .leaderboard-types button .type-icon { width: 32px !important; height: 32px !important; font-size: 16px !important; }
          .leaderboard-types button .type-label { font-size: 12px !important; }
          .leaderboard-podium { flex-direction: column !important; align-items: center !important; gap: 16px !important; padding: 12px !important; }
          .leaderboard-podium .podium-item { transform: none !important; }
          .leaderboard-podium .podium-item .podium-avatar { width: 64px !important; height: 64px !important; }
          .leaderboard-podium .podium-item .podium-name { font-size: 13px !important; }
          .leaderboard-podium .podium-item .podium-value { font-size: 12px !important; }
          .leaderboard-table th, .leaderboard-table td { padding: 10px 12px !important; font-size: 12px !important; }
          .leaderboard-table .player-cell { gap: 8px !important; }
          .leaderboard-table .player-cell .player-avatar { width: 32px !important; height: 32px !important; }
          .leaderboard-table .player-cell .player-name { font-size: 13px !important; }
          .leaderboard-table .rank-badge { width: 24px !important; height: 24px !important; font-size: 10px !important; }
          .leaderboard-table .level-badge { font-size: 11px !important; padding: 2px 8px !important; }
          .leaderboard-table .value-display { font-size: 14px !important; }
          .leaderboard-admin-stats { grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
          .leaderboard-admin-stats .stat-card { padding: 14px !important; }
          .leaderboard-admin-stats .stat-card .stat-number { font-size: 22px !important; }
          .leaderboard-footer { flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; font-size: 12px !important; }
          .leaderboard-footer .footer-stats { flex-wrap: wrap !important; gap: 8px !important; }
          .leaderboard-user-rank { flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; padding: 12px 16px !important; }
          .leaderboard-user-rank .rank-label { font-size: 13px !important; }
          .leaderboard-user-rank .rank-value { font-size: 14px !important; }
          .leaderboard-admin-actions { flex-direction: column !important; gap: 4px !important; }
          .leaderboard-admin-actions button { padding: 2px 8px !important; font-size: 10px !important; }
          .leaderboard-table .email-col { display: none !important; }
          .leaderboard-table .actions-col { display: none !important; }
        }
        @media (max-width: 480px) {
          .leaderboard-container { padding: 12px !important; }
          .leaderboard-header h1 { font-size: 18px !important; }
          .leaderboard-types { grid-template-columns: 1fr 1fr !important; gap: 6px !important; }
          .leaderboard-types button { padding: 10px !important; }
          .leaderboard-types button .type-icon { width: 28px !important; height: 28px !important; font-size: 14px !important; }
          .leaderboard-types button .type-label { font-size: 11px !important; }
          .leaderboard-table th, .leaderboard-table td { padding: 8px 10px !important; font-size: 11px !important; }
          .leaderboard-table .player-cell .player-avatar { width: 28px !important; height: 28px !important; }
          .leaderboard-table .player-cell .player-name { font-size: 12px !important; }
          .leaderboard-podium .podium-item .podium-avatar { width: 56px !important; height: 56px !important; }
          .leaderboard-admin-stats { grid-template-columns: 1fr !important; }
          .leaderboard-time-filter button { padding: 4px 10px !important; font-size: 11px !important; }
        }
        .profile-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(45, 42, 94, 0.5);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .profile-modal {
          background: ${palette.white};
          border-radius: 24px;
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px -12px rgba(244, 162, 97, 0.35);
          animation: slideUp 0.3s ease;
          position: relative;
          border: 2px solid ${palette.border};
        }
        .profile-modal-close {
          position: sticky;
          top: 0;
          right: 0;
          float: right;
          background: ${palette.cream};
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          font-size: 20px;
          cursor: pointer;
          margin: 16px 16px 0 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          z-index: 10;
          color: ${palette.deepNavy};
          font-family: ${BRAND_FONT_BODY};
        }
        .profile-modal-close:hover {
          background: ${palette.border};
          transform: scale(1.05);
        }
        .profile-content {
          padding: 0 40px 40px 40px;
        }
        .profile-header-section {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 24px 0 20px 0;
          border-bottom: 2px solid ${palette.border};
          margin-top: -12px;
        }
        .profile-avatar-large {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          overflow: hidden;
          background: ${palette.cream};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          flex-shrink: 0;
          border: 3px solid ${palette.warmOrange};
        }
        .profile-name-section h2 {
          margin: 0 0 4px 0;
          font-size: 24px;
          font-weight: 800;
          color: ${palette.deepNavy};
          font-family: ${BRAND_FONT_DISPLAY};
        }
        .profile-name-section .username {
          color: ${palette.bodyText};
          font-size: 14px;
          margin: 0;
          font-weight: 700;
        }
        .profile-name-section .bio {
          color: ${palette.bodyText};
          font-size: 14px;
          margin: 8px 0 0 0;
          line-height: 1.5;
          font-weight: 600;
        }
        .profile-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px 40px;
          margin-top: 24px;
        }
        .profile-info-section {
          margin-top: 24px;
        }
        .profile-info-section h4 {
          font-size: 13px;
          font-weight: 800;
          color: ${palette.bodyText};
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 16px 0;
          font-family: ${BRAND_FONT_DISPLAY};
        }
        .profile-info-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 2px solid ${palette.border};
          font-size: 14px;
        }
        .profile-info-item:last-child {
          border-bottom: none;
        }
        .profile-info-item .label {
          color: ${palette.bodyText};
          font-weight: 600;
        }
        .profile-info-item .value {
          color: ${palette.deepNavy};
          font-weight: 700;
          text-align: right;
        }
        .profile-info-item .value.not-set {
          color: ${palette.bodyText};
          font-weight: 500;
          opacity: 0.7;
        }
        .profile-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-top: 24px;
          padding: 20px;
          background: ${palette.cream};
          border-radius: 16px;
          border: 2px solid ${palette.border};
        }
        .profile-stat-item {
          text-align: center;
        }
        .profile-stat-item .stat-number {
          font-size: 24px;
          font-weight: 800;
          color: ${palette.deepNavy};
          font-family: ${BRAND_FONT_DISPLAY};
        }
        .profile-stat-item .stat-label {
          font-size: 12px;
          color: ${palette.bodyText};
          margin-top: 4px;
          font-weight: 700;
        }
        .profile-loading {
          text-align: center;
          padding: 80px 40px;
        }
        .profile-loading .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid ${palette.border};
          border-top-color: ${palette.warmOrange};
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 16px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 640px) {
          .profile-content { padding: 0 20px 24px 20px; }
          .profile-header-section { flex-direction: column; text-align: center; gap: 12px; }
          .profile-info-grid { grid-template-columns: 1fr; gap: 0; }
          .profile-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .profile-modal { max-width: 95%; }
          .profile-avatar-large { width: 64px; height: 64px; font-size: 32px; }
          .profile-name-section h2 { font-size: 20px; }
        }
        .player-clickable {
          cursor: pointer;
          transition: opacity 0.2s ease;
        }
        .player-clickable:hover {
          opacity: 0.7;
        }
        .player-clickable .player-avatar,
        .player-clickable .player-name {
          pointer-events: none;
        }
      `}</style>

      {/* HEADER */}
      <div className="leaderboard-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '28px',
        borderBottom: `2px solid ${palette.border}`,
        paddingBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '800',
            color: palette.deepNavy,
            margin: '0 0 8px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: BRAND_FONT_DISPLAY,
            letterSpacing: '-0.5px',
          }}>
            {isAdmin ? 'Admin Leaderboards' : '🏆 Leaderboards'}
          </h1>
          <p style={{
            fontSize: '15px',
            color: palette.bodyText,
            margin: '0',
            fontWeight: '600',
            fontFamily: BRAND_FONT_BODY,
          }}>
            {isAdmin ? 'Monitor and manage top performers' : 'See how you rank against other learners'}
          </p>
        </div>

        <div className="leaderboard-header-actions" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {isAdmin && (
            <button
              onClick={handleResetAllStats}
              style={{
                padding: '10px 20px',
                background: palette.coral,
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '800',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: BRAND_FONT_DISPLAY,
                boxShadow: `0 4px 0 ${palette.coralShadow}`,
              }}
            >
              🔄 Reset All Stats
            </button>
          )}

          <button
            onClick={onBack}
            style={{
              padding: '10px 24px',
              background: isAdmin ? palette.warmOrange : palette.white,
              color: isAdmin ? 'white' : palette.deepNavy,
              border: isAdmin ? 'none' : `2px solid ${palette.border}`,
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '800',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: BRAND_FONT_DISPLAY,
              boxShadow: isAdmin ? `0 4px 0 ${palette.warmOrangeShadow}` : `0 3px 0 ${palette.border}`,
            }}
          >
            ← Back
          </button>
        </div>
      </div>

      {/* TIME FILTER */}
      <div className="leaderboard-time-filter" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={{
          display: 'flex',
          gap: '8px',
          background: palette.cream,
          padding: '4px',
          borderRadius: '12px',
          flexWrap: 'wrap',
          border: `2px solid ${palette.border}`,
        }}>
          {timeFilters.map(filter => (
            <button
              key={filter.id}
              onClick={() => setTimeFilter(filter.id)}
              style={{
                padding: '8px 20px',
                borderRadius: '10px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: timeFilter === filter.id ? palette.white : 'transparent',
                color: timeFilter === filter.id ? palette.warmOrange : palette.bodyText,
                boxShadow: timeFilter === filter.id ? `0 2px 0 ${palette.border}` : 'none',
                fontFamily: BRAND_FONT_DISPLAY,
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <span style={{
          fontSize: '13px',
          color: palette.warmOrange,
          background: palette.cream,
          padding: '8px 16px',
          borderRadius: '10px',
          border: `2px solid ${palette.border}`,
          fontFamily: BRAND_FONT_DISPLAY,
          fontWeight: '700',
        }}>
          Top {leaderboardData.length} Learners
        </span>
      </div>

      {/* LEADERBOARD TYPE SELECTOR */}
      <div className="leaderboard-types" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
        marginBottom: '28px',
      }}>
        {leaderboardTypes.map(type => (
          <button
            key={type.id}
            onClick={() => setSelectedLeaderboard(type.id)}
            style={{
              background: selectedLeaderboard === type.id ? type.color : palette.white,
              border: selectedLeaderboard === type.id ? 'none' : `2px solid ${palette.border}`,
              borderRadius: '16px',
              padding: '16px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: selectedLeaderboard === type.id ? `0 4px 0 ${type.color}CC, 0 8px 16px ${type.color}44` : `0 3px 0 ${palette.border}`,
              fontFamily: BRAND_FONT_BODY,
            }}
          >
            <div className="type-icon" style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: selectedLeaderboard === type.id ? 'rgba(255,255,255,0.25)' : type.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}>
              {type.icon}
            </div>
            <div className="type-label" style={{
              fontSize: '14px',
              fontWeight: '800',
              color: selectedLeaderboard === type.id ? 'white' : palette.deepNavy,
              fontFamily: BRAND_FONT_DISPLAY,
            }}>
              {type.label}
            </div>
          </button>
        ))}
      </div>

      {/* ADMIN STATS SUMMARY */}
      {isAdmin && (
        <div className="leaderboard-admin-stats" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '24px',
        }}>
          <div className="stat-card" style={{
            background: palette.white,
            borderRadius: '16px',
            padding: '20px',
            border: `2px solid ${palette.border}`,
            boxShadow: '0 4px 14px rgba(244, 162, 97, 0.08)',
          }}>
            <div style={{ fontSize: '13px', color: palette.bodyText, marginBottom: '8px', fontFamily: BRAND_FONT_DISPLAY, fontWeight: '700' }}>Total Players</div>
            <div className="stat-number" style={{ fontSize: '28px', fontWeight: '800', color: palette.deepNavy, fontFamily: BRAND_FONT_DISPLAY }}>{leaderboardData.length}</div>
          </div>
          <div className="stat-card" style={{
            background: palette.white,
            borderRadius: '16px',
            padding: '20px',
            border: `2px solid ${palette.border}`,
            boxShadow: '0 4px 14px rgba(244, 162, 97, 0.08)',
          }}>
            <div style={{ fontSize: '13px', color: palette.bodyText, marginBottom: '8px', fontFamily: BRAND_FONT_DISPLAY, fontWeight: '700' }}>Avg Points</div>
            <div className="stat-number" style={{ fontSize: '28px', fontWeight: '800', color: palette.deepNavy, fontFamily: BRAND_FONT_DISPLAY }}>
              {leaderboardData.length > 0
                ? Math.round(leaderboardData.reduce((acc, u) => acc + getValue(u), 0) / leaderboardData.length)
                : 0}
            </div>
          </div>
          <div className="stat-card" style={{
            background: palette.white,
            borderRadius: '16px',
            padding: '20px',
            border: `2px solid ${palette.border}`,
            boxShadow: '0 4px 14px rgba(244, 162, 97, 0.08)',
          }}>
            <div style={{ fontSize: '13px', color: palette.bodyText, marginBottom: '8px', fontFamily: BRAND_FONT_DISPLAY, fontWeight: '700' }}>Active Today</div>
            <div className="stat-number" style={{ fontSize: '28px', fontWeight: '800', color: palette.deepNavy, fontFamily: BRAND_FONT_DISPLAY }}>12</div>
          </div>
          <div className="stat-card" style={{
            background: palette.white,
            borderRadius: '16px',
            padding: '20px',
            border: `2px solid ${palette.border}`,
            boxShadow: '0 4px 14px rgba(244, 162, 97, 0.08)',
          }}>
            <div style={{ fontSize: '13px', color: palette.bodyText, marginBottom: '8px', fontFamily: BRAND_FONT_DISPLAY, fontWeight: '700' }}>New This Week</div>
            <div className="stat-number" style={{ fontSize: '28px', fontWeight: '800', color: palette.deepNavy, fontFamily: BRAND_FONT_DISPLAY }}>5</div>
          </div>
        </div>
      )}

      {/* ERROR STATE */}
      {error && (
        <div style={{
          background: `${palette.coral}15`,
          border: `2px solid ${palette.coral}40`,
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div>
            <div style={{ fontWeight: '800', color: palette.coral, marginBottom: '4px', fontFamily: BRAND_FONT_DISPLAY }}>⚠️ Error Loading Leaderboard</div>
            <div style={{ fontSize: '14px', color: palette.bodyText, fontWeight: '600' }}>{error}</div>
          </div>
          <button
            onClick={fetchLeaderboardData}
            style={{
              padding: '8px 20px',
              background: palette.coral,
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontFamily: BRAND_FONT_DISPLAY,
              fontWeight: '800',
              boxShadow: `0 3px 0 ${palette.coralShadow}`,
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* LOADING STATE */}
      {loading ? (
        <div style={{
          textAlign: 'center',
          padding: '80px',
          background: palette.white,
          borderRadius: '24px',
          border: `2px solid ${palette.border}`,
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <h3 style={{ fontSize: '18px', color: palette.deepNavy, marginBottom: '8px', fontFamily: BRAND_FONT_DISPLAY, fontWeight: '800' }}>
            Loading Leaderboard
          </h3>
          <p style={{ fontSize: '14px', color: palette.bodyText, fontFamily: BRAND_FONT_BODY, fontWeight: '600' }}>
            Fetching top performers...
          </p>
        </div>
      ) : (
        <>
          {/* TOP 3 PODIUM */}
          {!isAdmin && leaderboardData.length >= 3 && (
            <div className="leaderboard-podium" style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              gap: '16px',
              marginBottom: '28px',
              padding: '16px',
              background: palette.cream,
              borderRadius: '20px',
              border: `2px solid ${palette.border}`,
              flexWrap: 'wrap',
            }}>
              {/* 2nd Place */}
              {leaderboardData[1] && (
                <div
                  className="podium-item player-clickable"
                  onClick={() => fetchUserProfile(leaderboardData[1].id)}
                  style={{ textAlign: 'center' }}
                >
                  <div className="podium-avatar" style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: `linear-gradient(135deg, ${palette.softGreen}, ${palette.teal})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px',
                    border: '3px solid #a0a0a0',
                    position: 'relative',
                  }}>
                    <PlayerAvatar user={leaderboardData[1]} size={80} fontSize={32} />
                    <div style={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: '#a0a0a0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: '800',
                      fontSize: '12px',
                      border: '2px solid #ffffff',
                      fontFamily: BRAND_FONT_DISPLAY,
                    }}>
                      2
                    </div>
                  </div>
                  <div className="podium-name" style={{ fontWeight: '700', color: palette.deepNavy, fontSize: '14px', marginBottom: '4px', fontFamily: BRAND_FONT_DISPLAY }}>
                    {leaderboardData[1].displayName}
                  </div>
                  <div className="podium-value" style={{ fontSize: '13px', color: palette.bodyText, background: palette.border, padding: '4px 10px', borderRadius: '12px', display: 'inline-block', fontFamily: BRAND_FONT_BODY, fontWeight: '700' }}>
                    {getValue(leaderboardData[1])} {getUnit()}
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {leaderboardData[0] && (
                <div
                  className="podium-item player-clickable"
                  onClick={() => fetchUserProfile(leaderboardData[0].id)}
                  style={{ textAlign: 'center', transform: 'scale(1.05)', zIndex: 2 }}
                >
                  <div className="podium-avatar" style={{
                    width: '96px',
                    height: '96px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: `linear-gradient(135deg, #FFD700, #FFA500)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px',
                    border: '3px solid #d4af37',
                    position: 'relative',
                  }}>
                    <PlayerAvatar user={leaderboardData[0]} size={96} fontSize={40} />
                    <div style={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: '#d4af37',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: '800',
                      fontSize: '14px',
                      border: '2px solid #ffffff',
                      fontFamily: BRAND_FONT_DISPLAY,
                    }}>
                      1
                    </div>
                  </div>
                  <div className="podium-name" style={{ fontWeight: '800', color: palette.deepNavy, fontSize: '16px', marginBottom: '4px', fontFamily: BRAND_FONT_DISPLAY }}>
                    {leaderboardData[0].displayName}
                  </div>
                  <div className="podium-value" style={{ fontSize: '14px', fontWeight: '800', color: palette.warmOrange, background: palette.cream, padding: '4px 12px', borderRadius: '12px', display: 'inline-block', fontFamily: BRAND_FONT_DISPLAY }}>
                    {getValue(leaderboardData[0])} {getUnit()}
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {leaderboardData[2] && (
                <div
                  className="podium-item player-clickable"
                  onClick={() => fetchUserProfile(leaderboardData[2].id)}
                  style={{ textAlign: 'center' }}
                >
                  <div className="podium-avatar" style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: `linear-gradient(135deg, #b08d6b, #8b6f4c)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px',
                    border: '3px solid #b08d6b',
                    position: 'relative',
                  }}>
                    <PlayerAvatar user={leaderboardData[2]} size={72} fontSize={28} />
                    <div style={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: '#b08d6b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: '800',
                      fontSize: '11px',
                      border: '2px solid #ffffff',
                      fontFamily: BRAND_FONT_DISPLAY,
                    }}>
                      3
                    </div>
                  </div>
                  <div className="podium-name" style={{ fontWeight: '700', color: palette.deepNavy, fontSize: '13px', marginBottom: '4px', fontFamily: BRAND_FONT_DISPLAY }}>
                    {leaderboardData[2].displayName}
                  </div>
                  <div className="podium-value" style={{ fontSize: '12px', color: palette.bodyText, background: palette.border, padding: '4px 10px', borderRadius: '12px', display: 'inline-block', fontFamily: BRAND_FONT_BODY, fontWeight: '700' }}>
                    {getValue(leaderboardData[2])} {getUnit()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* LEADERBOARD TABLE */}
          <div style={{
            background: palette.white,
            borderRadius: '20px',
            border: `2px solid ${palette.border}`,
            overflow: 'hidden',
            boxShadow: '0 6px 20px rgba(244, 162, 97, 0.08)',
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: `2px solid ${palette.border}`,
              background: palette.cream,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
            }}>
              <h3 style={{
                fontSize: '15px',
                fontWeight: '800',
                color: palette.deepNavy,
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: BRAND_FONT_DISPLAY,
              }}>
                <span style={{ fontSize: '18px', color: currentType.color }}>{currentType.icon}</span>
                {currentType.label} Ranking
              </h3>
              <span style={{
                fontSize: '12px',
                color: palette.warmOrange,
                background: palette.white,
                padding: '4px 10px',
                borderRadius: '12px',
                border: `2px solid ${palette.border}`,
                fontFamily: BRAND_FONT_DISPLAY,
                fontWeight: '700',
              }}>
                Total: {leaderboardData.length} players
              </span>
            </div>

            <div className="leaderboard-table" style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontFamily: BRAND_FONT_BODY,
                minWidth: '500px',
              }}>
                <thead>
                  <tr style={{
                    background: palette.white,
                    borderBottom: `2px solid ${palette.border}`,
                  }}>
                    <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '800', color: palette.bodyText, fontFamily: BRAND_FONT_DISPLAY, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Rank</th>
                    <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '800', color: palette.bodyText, fontFamily: BRAND_FONT_DISPLAY, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Player</th>
                    {isAdmin && <th className="email-col" style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '800', color: palette.bodyText, fontFamily: BRAND_FONT_DISPLAY, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email</th>}
                    <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '800', color: palette.bodyText, fontFamily: BRAND_FONT_DISPLAY, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Level</th>
                    <th style={{ padding: '14px 20px', textAlign: 'right', fontSize: '12px', fontWeight: '800', color: palette.bodyText, fontFamily: BRAND_FONT_DISPLAY, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{currentType.label}</th>
                    {isAdmin && <th className="actions-col" style={{ padding: '14px 20px', textAlign: 'center', fontSize: '12px', fontWeight: '800', color: palette.bodyText, fontFamily: BRAND_FONT_DISPLAY, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.map((user, index) => {
                    const isCurrentUser = user.id === currentUserId ||
                                         (user.isLocal && user.id === localStorage.getItem('userId'));

                    return (
                      <tr
                        key={user.id || index}
                        style={{
                          borderBottom: index < leaderboardData.length - 1 ? `2px solid ${palette.border}` : 'none',
                          background: isCurrentUser ? palette.cream : 'transparent',
                          transition: 'background 0.2s ease',
                        }}
                        onMouseOver={(e) => {
                          if (!isCurrentUser) {
                            e.currentTarget.style.background = palette.cream;
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!isCurrentUser) {
                            e.currentTarget.style.background = 'transparent';
                          }
                        }}
                      >
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {user.rank <= 3 ? (
                              <div className="rank-badge" style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: user.rank === 1 ? '#f5e9d3' : user.rank === 2 ? palette.cream : '#ede0d4',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: user.rank === 1 ? '#b38b40' : user.rank === 2 ? palette.warmOrange : '#8b6f4c',
                                fontWeight: '800',
                                fontSize: '12px',
                                fontFamily: BRAND_FONT_DISPLAY,
                              }}>
                                {user.rank}
                              </div>
                            ) : (
                              <span style={{
                                width: '28px',
                                height: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '13px',
                                fontWeight: '700',
                                color: palette.bodyText,
                                fontFamily: BRAND_FONT_DISPLAY,
                              }}>
                                #{user.rank}
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <div
                            className="player-cell player-clickable"
                            onClick={() => fetchUserProfile(user.id)}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                          >
                            <div className="player-avatar" style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              overflow: 'hidden',
                              background: `linear-gradient(135deg, ${palette.warmOrange}, ${palette.coral})`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              border: `2px solid ${palette.border}`
                            }}>
                              <PlayerAvatar user={user} size={40} fontSize={18} />
                            </div>
                            <div>
                              <div className="player-name" style={{
                                fontSize: '14px',
                                fontWeight: '700',
                                color: palette.deepNavy,
                                marginBottom: '2px',
                                fontFamily: BRAND_FONT_DISPLAY,
                              }}>
                                {user.displayName}
                                {isCurrentUser && !isAdmin && (
                                  <span style={{
                                    marginLeft: '8px',
                                    fontSize: '10px',
                                    background: palette.warmOrange,
                                    color: '#ffffff',
                                    padding: '2px 6px',
                                    borderRadius: '10px',
                                    fontWeight: '800',
                                    fontFamily: BRAND_FONT_DISPLAY,
                                  }}>
                                    You
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        {isAdmin && (
                          <td className="email-col" style={{ padding: '14px 20px', color: palette.bodyText, fontSize: '13px', fontFamily: BRAND_FONT_BODY, fontWeight: '600' }}>{user.email}</td>
                        )}
                        <td style={{ padding: '14px 20px' }}>
                          <span className="level-badge" style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '800',
                            background: palette.cream,
                            color: palette.warmOrange,
                            fontFamily: BRAND_FONT_DISPLAY,
                          }}>
                            Level {user.stats?.level || user.progress?.level || 1}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                          <span className="value-display" style={{
                            fontSize: '16px',
                            fontWeight: '800',
                            color: currentType.color,
                            fontFamily: BRAND_FONT_DISPLAY,
                          }}>
                            {getValue(user).toLocaleString()}
                          </span>
                          <span style={{
                            fontSize: '11px',
                            color: palette.bodyText,
                            marginLeft: '4px',
                            fontFamily: BRAND_FONT_BODY,
                            fontWeight: '700',
                          }}>
                            {getUnit()}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="actions-col" style={{ padding: '14px 20px', textAlign: 'center' }}>
                            <div className="leaderboard-admin-actions" style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleResetStats(user.id);
                                }}
                                style={{
                                  padding: '4px 10px',
                                  background: palette.cream,
                                  border: `2px solid ${palette.border}`,
                                  borderRadius: '8px',
                                  fontSize: '11px',
                                  color: palette.warmOrange,
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  fontFamily: BRAND_FONT_DISPLAY,
                                  fontWeight: '800',
                                }}
                              >
                                Reset
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveUser(user.id);
                                }}
                                style={{
                                  padding: '4px 10px',
                                  background: `${palette.coral}15`,
                                  border: `2px solid ${palette.coral}40`,
                                  borderRadius: '8px',
                                  fontSize: '11px',
                                  color: palette.coral,
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  fontFamily: BRAND_FONT_DISPLAY,
                                  fontWeight: '800',
                                }}
                              >
                                Remove
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* USER'S RANK */}
          {!isAdmin && (
            <div className="leaderboard-user-rank" style={{
              marginTop: '24px',
              padding: '16px 24px',
              background: palette.cream,
              borderRadius: '16px',
              border: `2px solid ${palette.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
            }}>
              <span className="rank-label" style={{ color: palette.bodyText, fontFamily: BRAND_FONT_DISPLAY, fontWeight: '700' }}>Your Current Rank</span>
              <span className="rank-value" style={{
                color: palette.warmOrange,
                fontWeight: '800',
                fontSize: '15px',
                fontFamily: BRAND_FONT_DISPLAY,
              }}>
                #{leaderboardData.findIndex(u => u.id === (currentUserId || localStorage.getItem('userId'))) + 1 || 'Not in leaderboard'}
              </span>
            </div>
          )}

          {/* FOOTER STATS */}
          {leaderboardData.length > 0 && (
            <div className="leaderboard-footer" style={{
              marginTop: '24px',
              padding: '20px',
              background: palette.cream,
              borderRadius: '16px',
              border: `2px solid ${palette.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '13px',
              color: palette.bodyText,
              flexWrap: 'wrap',
              gap: '8px',
              fontWeight: '700',
            }}>
              <div className="footer-stats" style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <span>🏆 Top Score: {leaderboardData.length > 0 ? getValue(leaderboardData[0]).toLocaleString() : 0} {getUnit()}</span>
                <span>📊 Average: {leaderboardData.length > 0 ? Math.round(leaderboardData.reduce((acc, u) => acc + getValue(u), 0) / leaderboardData.length).toLocaleString() : 0} {getUnit()}</span>
              </div>
              <span style={{ color: palette.warmOrange, fontFamily: BRAND_FONT_DISPLAY, fontWeight: '800' }}>
                Updated just now
              </span>
            </div>
          )}

          {/* EMPTY STATE */}
          {leaderboardData.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '80px 40px',
              background: palette.white,
              borderRadius: '24px',
              border: `2px solid ${palette.border}`,
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: palette.cream,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
              }}>
                <span style={{ fontSize: '40px', color: palette.warmOrange }}>🏆</span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: palette.deepNavy, marginBottom: '8px', fontFamily: BRAND_FONT_DISPLAY }}>
                No data yet
              </h3>
              <p style={{ fontSize: '14px', color: palette.bodyText, marginBottom: '24px', fontFamily: BRAND_FONT_BODY, fontWeight: '600' }}>
                Players will appear here once they start playing
              </p>
            </div>
          )}
        </>
      )}

      {/* PROFILE MODAL */}
      {showProfileModal && (
        <div className="profile-modal-overlay" onClick={closeProfileModal}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <button className="profile-modal-close" onClick={closeProfileModal}>✕</button>

            {profileLoading ? (
              <div className="profile-loading">
                <div className="spinner"></div>
                <p style={{ color: palette.bodyText, fontFamily: BRAND_FONT_BODY, fontWeight: '600' }}>Loading profile...</p>
              </div>
            ) : selectedProfile && (
              <div className="profile-content">
                <div className="profile-header-section">
                  <div className="profile-avatar-large" style={{
                    background: `linear-gradient(135deg, ${palette.warmOrange}, ${palette.coral})`,
                    padding: 0
                  }}>
                    <PlayerAvatar user={selectedProfile} size={96} fontSize={40} />
                  </div>
                  <div className="profile-name-section">
                    <h2>{selectedProfile.displayName}</h2>
                    <p className="username">{selectedProfile.username}</p>
                    <p className="bio">{selectedProfile.bio}</p>
                  </div>
                </div>

                <div className="profile-stats-grid">
                  <div className="profile-stat-item">
                    <div className="stat-number">{selectedProfile.stats?.wordsLearned || 0}</div>
                    <div className="stat-label">Words Learned</div>
                  </div>
                  <div className="profile-stat-item">
                    <div className="stat-number">{selectedProfile.stats?.gamesPlayed || 0}</div>
                    <div className="stat-label">Games Played</div>
                  </div>
                  <div className="profile-stat-item">
                    <div className="stat-number">{selectedProfile.stats?.streak || 0}</div>
                    <div className="stat-label">Day Streak</div>
                  </div>
                  <div className="profile-stat-item">
                    <div className="stat-number">{selectedProfile.stats?.totalPoints || 0}</div>
                    <div className="stat-label">Total Points</div>
                  </div>
                </div>

                <div className="profile-info-section">
                  <h4>Basic Information</h4>
                  <div className="profile-info-grid">
                    <div className="profile-info-item">
                      <span className="label">Display Name</span>
                      <span className="value">{selectedProfile.displayName}</span>
                    </div>
                    <div className="profile-info-item">
                      <span className="label">Username</span>
                      <span className="value">{selectedProfile.username}</span>
                    </div>
                    <div className="profile-info-item">
                      <span className="label">Email</span>
                      <span className="value">{selectedProfile.email}</span>
                    </div>
                    <div className="profile-info-item">
                      <span className="label">Bio</span>
                      <span className="value">{selectedProfile.bio}</span>
                    </div>
                  </div>
                </div>

                <div className="profile-info-section">
                  <h4>Contact Information</h4>
                  <div className="profile-info-grid">
                    <div className="profile-info-item">
                      <span className="label">Phone</span>
                      <span className={`value ${selectedProfile.phone === 'Not set' ? 'not-set' : ''}`}>{selectedProfile.phone}</span>
                    </div>
                    <div className="profile-info-item">
                      <span className="label">Location</span>
                      <span className={`value ${selectedProfile.location === 'Not set' ? 'not-set' : ''}`}>{selectedProfile.location}</span>
                    </div>
                    <div className="profile-info-item" style={{ gridColumn: '1 / -1' }}>
                      <span className="label">Website</span>
                      <span className={`value ${selectedProfile.website === 'Not set' ? 'not-set' : ''}`}>{selectedProfile.website}</span>
                    </div>
                  </div>
                </div>

                <div className="profile-info-section">
                  <h4>Social Links</h4>
                  <div className="profile-info-grid">
                    <div className="profile-info-item">
                      <span className="label">Twitter</span>
                      <span className={`value ${selectedProfile.twitter === 'Not set' ? 'not-set' : ''}`}>{selectedProfile.twitter}</span>
                    </div>
                    <div className="profile-info-item">
                      <span className="label">Instagram</span>
                      <span className={`value ${selectedProfile.instagram === 'Not set' ? 'not-set' : ''}`}>{selectedProfile.instagram}</span>
                    </div>
                    <div className="profile-info-item" style={{ gridColumn: '1 / -1' }}>
                      <span className="label">LinkedIn</span>
                      <span className={`value ${selectedProfile.linkedin === 'Not set' ? 'not-set' : ''}`}>{selectedProfile.linkedin}</span>
                    </div>
                  </div>
                </div>

                <div className="profile-info-section">
                  <h4>Settings</h4>
                  <div className="profile-info-grid">
                    <div className="profile-info-item">
                      <span className="label">Email Notifications</span>
                      <span className="value">{selectedProfile.emailNotifications ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div className="profile-info-item">
                      <span className="label">Dark Mode</span>
                      <span className="value">{selectedProfile.darkMode ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div className="profile-info-item" style={{ gridColumn: '1 / -1' }}>
                      <span className="label">Language</span>
                      <span className="value">{selectedProfile.language}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG */}
      <ConfirmationDialog />
    </div>
  );
};

export default Leaderboards;