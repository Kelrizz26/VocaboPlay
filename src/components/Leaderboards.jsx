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
  shadow: 'rgba(42, 40, 69, 0.06)',
  shadowMd: 'rgba(42, 40, 69, 0.10)',
  gold: '#d4af37',
  silver: '#a8a8a8',
  bronze: '#b08d6b',
};

const BRAND_FONT_DISPLAY = "'Fredoka', sans-serif";
const BRAND_FONT_BODY = "'Nunito', sans-serif";

// ===== DUOTONE SVG ICONS =====
const Icon = ({ name, size = 20, color = palette.bodyText, secondaryColor = `${palette.bodyText}55` }) => {
  const icons = {
    trophy: (
      <>
        <path d="M6 4h12v4a6 6 0 01-12 0V4z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M6 8H4a2 2 0 002 2M18 8h2a2 2 0 01-2 2M9 18h6M10 21h4M12 14v4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    star: (
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    ),
    book: (
      <>
        <path d="M4 4h11a3 3 0 013 3v13H7a3 3 0 00-3 3V4z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M4 4v16" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      </>
    ),
    flame: (
      <path d="M12 2s4 6 4 10a4 4 0 11-8 0c0-2 1-3.5 2-5 0 2 1 3 2 3 0-2-1-5 0-8z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    ),
    game: (
      <>
        <path d="M6 12h4m-2-2v4m6-4h.01M17 12h.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M8 20h8a4 4 0 004-4V8a4 4 0 00-4-4H8a4 4 0 00-4 4v8a4 4 0 004 4z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    reset: (
      <>
        <path d="M1 4v6h6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M3.51 15a9 9 0 1014.85-9.36L1 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    trash: (
      <>
        <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M10 11v6M14 11v6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    close: (
      <path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    ),
    arrowLeft: (
      <path d="M19 12H5M12 19l-7-7 7-7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    ),
    warning: (
      <>
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M12 9v4M12 17h.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', flexShrink: 0 }}>
      {icons[name] || icons.trophy}
    </svg>
  );
};

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
// ✅ NEW HELPER — Extract last-active timestamp (ms) from user data
//    Tries common Firestore fields. Returns 0 if none found.
// ============================================================
const getLastActiveMs = (data) => {
  if (!data) return 0;
  const candidates = ['lastActive', 'lastPlayed', 'updatedAt', 'lastLogin', 'lastSeen', 'createdAt'];
  for (const field of candidates) {
    const val = data[field];
    if (!val) continue;
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const parsed = Date.parse(val);
      if (!isNaN(parsed)) return parsed;
      continue;
    }
    // Firestore Timestamp
    if (typeof val.toMillis === 'function') return val.toMillis();
    if (typeof val.seconds === 'number') return val.seconds * 1000;
  }
  return 0;
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
    <span style={{ color: '#fff', fontWeight: '700', fontSize, fontFamily: BRAND_FONT_DISPLAY }}>
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
  // ✅ NEW — Time filter helper. Returns true if user passes filter.
  // ============================================================
  const passesTimeFilter = useCallback((lastActiveMs) => {
    if (timeFilter === 'all') return true;
    const now = Date.now();
    const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    const MONTH_MS = 30 * 24 * 60 * 60 * 1000;
    if (timeFilter === 'weekly') return lastActiveMs >= (now - WEEK_MS);
    if (timeFilter === 'monthly') return lastActiveMs >= (now - MONTH_MS);
    return true;
  }, [timeFilter]);

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
  // ✅ Now applies timeFilter to firebase users
  // ============================================================
  const fetchLeaderboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Fetching leaderboard from users collection...');
      console.log('📊 Selected category:', selectedLeaderboard);
      console.log('⏱️ Time filter:', timeFilter);

      const usersRef = collection(db, 'users');
      const limitCount = isAdmin ? 100 : 50;   // ✅ raised limit so time filter has enough pool
      const sortField = getSortField();

      const q = query(
        usersRef,
        orderBy(sortField, 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);

      console.log('📊 Snapshot size:', snapshot.size);

      const firebaseUsers = snapshot.docs
        .map((docSnap) => {
          const data = docSnap.data();
          const stats = data.stats || {};

          if (!data.stats || Object.keys(stats).length === 0) return null;
          if (data.removedFromLeaderboard === true) return null;

          // ✅ Compute last-active ms
          const lastActiveMs = getLastActiveMs(data);

          // ✅ NEW: Apply time filter here
          if (!passesTimeFilter(lastActiveMs)) return null;

          return {
            id: docSnap.id,
            rank: 0,
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
            _source: 'firebase',
            _lastActiveMs: lastActiveMs,
          };
        })
        .filter(user => user !== null);

      // ===== LOCAL DATA =====
      const localData = getLeaderboard();
      console.log('📊 Local data from localStorage:', localData.length);

      const mergedMap = new Map();

      firebaseUsers.forEach(user => {
        if (user) mergedMap.set(user.id, { ...user });
      });

      // ✅ Local users: only include in 'all' time filter (they have no timestamp)
      if (timeFilter === 'all') {
        localData.forEach(localUser => {
          const userId = localUser.userId;
          if (!mergedMap.has(userId)) {
            mergedMap.set(userId, {
              id: userId,
              rank: 0,
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
              _source: 'local',
              _lastActiveMs: 0,
            });
          }
        });
      }

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

    } catch (error) {
      console.error('❌ Error fetching leaderboard:', error);
      setError(error.message);

      // Fallback: local only
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
  }, [selectedLeaderboard, isAdmin, currentUserId, getSortField, getValue, timeFilter, passesTimeFilter]);

  useEffect(() => {
    fetchLeaderboardData();
  }, [fetchLeaderboardData]);

  // ============================================================
  // ===== REAL-TIME LISTENER =====
  // ✅ Now also respects timeFilter
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
      limit(100)   // ✅ raised to have enough for time filter
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('🔄 Real-time update detected!');

      if (!loading) {
        try {
          const firebaseUsers = snapshot.docs
            .map((docSnap) => {
              const data = docSnap.data();
              const stats = data.stats || {};

              if (!data.stats || Object.keys(stats).length === 0) return null;
              if (data.removedFromLeaderboard === true) return null;

              const lastActiveMs = getLastActiveMs(data);

              // ✅ NEW: Apply time filter
              if (!passesTimeFilter(lastActiveMs)) return null;

              return {
                id: docSnap.id,
                rank: 0,
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
                _source: 'firebase',
                _lastActiveMs: lastActiveMs,
              };
            })
            .filter(user => user !== null);

          const localData = getLeaderboard();
          const mergedMap = new Map();

          firebaseUsers.forEach(user => {
            if (user) mergedMap.set(user.id, { ...user });
          });

          if (timeFilter === 'all') {
            localData.forEach(localUser => {
              const userId = localUser.userId;
              if (!mergedMap.has(userId)) {
                mergedMap.set(userId, {
                  id: userId,
                  rank: 0,
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
                  _source: 'local',
                  _lastActiveMs: 0,
                });
              }
            });
          }

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
  }, [loading, getValue, timeFilter, passesTimeFilter]);

  // ============================================================
  // ===== ADMIN FUNCTIONS =====
  // ============================================================
  const handleResetStats = async (userId) => {
    if (!isAdmin) return;

    const user = leaderboardData.find(u => u.id === userId);
    const userName = user?.displayName || 'this user';

    setConfirmDialog({
      isOpen: true,
      title: 'Reset User Stats',
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
      title: 'Remove User',
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
      title: 'DANGER: Reset ALL Stats',
      message: 'WARNING: This will reset ALL users\' stats!\n\nThis will:\n• Set all points to 0 for ALL users\n• Reset all levels to 1\n• Clear all word progress\n• Reset all streaks\n\nThis action CANNOT be undone!\n\nAre you sure you want to continue?',
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
    { id: 'points', label: 'Total Points', icon: 'star', color: palette.warmOrange, bg: palette.creamSoft },
    { id: 'words', label: 'Words Learned', icon: 'book', color: palette.softGreen, bg: palette.creamSoft },
    { id: 'streak', label: 'Longest Streak', icon: 'flame', color: palette.coral, bg: palette.creamSoft },
    { id: 'games', label: 'Games Played', icon: 'game', color: palette.teal, bg: palette.creamSoft },
  ];

  const timeFilters = [
    { id: 'all', label: 'All Time' },
    { id: 'weekly', label: 'This Week' },
    { id: 'monthly', label: 'This Month' },
  ];

  const currentType = leaderboardTypes.find(t => t.id === selectedLeaderboard) || leaderboardTypes[0];
  const currentTimeLabel = timeFilters.find(t => t.id === timeFilter)?.label || 'All Time';

  // ===== CONFIRMATION DIALOG =====
  const ConfirmationDialog = () => {
    if (!confirmDialog.isOpen) return null;

    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(42, 40, 69, 0.55)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px',
      }} onClick={closeConfirmDialog}>
        <div style={{
          background: palette.white,
          borderRadius: '20px',
          maxWidth: '480px',
          width: '100%',
          padding: '28px',
          boxShadow: '0 20px 50px rgba(42, 40, 69, 0.3)',
          fontFamily: BRAND_FONT_BODY,
          border: `1.5px solid ${palette.border}`,
        }} onClick={(e) => e.stopPropagation()}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '14px',
          }}>
            {confirmDialog.danger && (
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: `${palette.coral}15`,
                border: `1.5px solid ${palette.coral}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon name="warning" size={16} color={palette.coral} />
              </div>
            )}
            <h3 style={{
              fontSize: '18px',
              fontWeight: '800',
              color: confirmDialog.danger ? palette.coral : palette.deepNavy,
              margin: 0,
              fontFamily: BRAND_FONT_DISPLAY,
            }}>
              {confirmDialog.title}
            </h3>
          </div>
          <p style={{
            fontSize: '13px',
            color: palette.bodyText,
            margin: '0 0 22px 0',
            lineHeight: '1.65',
            whiteSpace: 'pre-line',
            fontWeight: '600',
          }}>
            {confirmDialog.message}
          </p>
          <div style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'flex-end',
          }}>
            <button
              onClick={closeConfirmDialog}
              style={{
                padding: '10px 22px',
                background: palette.white,
                border: `1.5px solid ${palette.border}`,
                borderRadius: '10px',
                color: palette.deepNavy,
                fontSize: '13px',
                fontWeight: '800',
                cursor: 'pointer',
                fontFamily: BRAND_FONT_DISPLAY,
                boxShadow: `0 2px 0 ${palette.border}`,
                transition: 'all 0.15s ease',
              }}
            >
              {confirmDialog.cancelText}
            </button>
            <button
              onClick={confirmDialog.onConfirm}
              style={{
                padding: '10px 22px',
                background: confirmDialog.danger ? palette.coral : palette.warmOrange,
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontSize: '13px',
                fontWeight: '800',
                cursor: 'pointer',
                fontFamily: BRAND_FONT_DISPLAY,
                boxShadow: confirmDialog.danger ? `0 3px 0 ${palette.coralShadow}` : `0 3px 0 ${palette.warmOrangeShadow}`,
                transition: 'all 0.15s ease',
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
      padding: '0',
      color: palette.deepNavy,
      opacity: pageLoaded ? 1 : 0,
      transform: pageLoaded ? 'translateY(0)' : 'translateY(16px)',
      transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
    }}>
      <style>{`
        @media (max-width: 768px) {
          .leaderboard-container { padding: 0 !important; }
          .leaderboard-header { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
          .leaderboard-header h1 { font-size: 22px !important; }
          .leaderboard-header p { font-size: 13px !important; }
          .leaderboard-header-actions { width: 100% !important; justify-content: flex-start !important; flex-wrap: wrap; }
          .leaderboard-time-filter { flex-wrap: wrap !important; gap: 8px !important; }
          .leaderboard-time-filter button { padding: 6px 14px !important; font-size: 12px !important; }
          .leaderboard-types { grid-template-columns: 1fr 1fr !important; gap: 8px !important; }
          .leaderboard-types button { padding: 12px !important; }
          .leaderboard-types button .type-icon { width: 32px !important; height: 32px !important; }
          .leaderboard-podium { flex-direction: column !important; align-items: center !important; gap: 16px !important; padding: 16px !important; }
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
          .leaderboard-user-rank { flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; padding: 12px 16px !important; }
          .leaderboard-admin-actions { flex-direction: column !important; gap: 4px !important; }
          .leaderboard-table .email-col { display: none !important; }
          .leaderboard-table .actions-col { display: none !important; }
        }
        @media (max-width: 480px) {
          .leaderboard-header h1 { font-size: 18px !important; }
          .leaderboard-types { grid-template-columns: 1fr 1fr !important; gap: 6px !important; }
          .leaderboard-types button { padding: 10px !important; }
          .leaderboard-types button .type-icon { width: 28px !important; height: 28px !important; }
          .leaderboard-types button .type-label { font-size: 11px !important; }
          .leaderboard-table th, .leaderboard-table td { padding: 8px 10px !important; font-size: 11px !important; }
          .leaderboard-table .player-cell .player-avatar { width: 28px !important; height: 28px !important; }
          .leaderboard-table .player-cell .player-name { font-size: 12px !important; }
          .leaderboard-podium .podium-item .podium-avatar { width: 56px !important; height: 56px !important; }
          .leaderboard-admin-stats { grid-template-columns: 1fr !important; }
          .leaderboard-time-filter button { padding: 4px 10px !important; font-size: 11px !important; }
        }
        .player-clickable {
          cursor: pointer;
          transition: opacity 0.2s ease;
        }
        .player-clickable:hover {
          opacity: 0.75;
        }
        .player-clickable .player-avatar,
        .player-clickable .player-name {
          pointer-events: none;
        }
        .leaderboard-table tbody tr {
          transition: background 0.15s ease;
        }
      `}</style>

      {/* HEADER */}
      <div className="leaderboard-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: '22px',
        borderBottom: `1.5px solid ${palette.border}`,
        paddingBottom: '18px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '800',
            color: palette.deepNavy,
            margin: '0 0 4px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontFamily: BRAND_FONT_DISPLAY,
            letterSpacing: '-0.5px',
          }}>
            <span style={{ display: 'flex', background: palette.creamSoft, width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${palette.border}` }}>
              <Icon name="trophy" size={16} color={palette.warmOrange} />
            </span>
            {isAdmin ? 'Admin Leaderboards' : 'Leaderboards'}
          </h1>
          <p style={{
            fontSize: '13px',
            color: palette.bodyTextSoft,
            margin: '0',
            fontWeight: '600',
            fontFamily: BRAND_FONT_BODY,
          }}>
            {isAdmin ? 'Monitor and manage top performers' : 'See how you rank against other learners'}
          </p>
        </div>

        <div className="leaderboard-header-actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {isAdmin && (
            <button
              onClick={handleResetAllStats}
              style={{
                padding: '10px 18px',
                background: palette.coral,
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: '800',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                fontFamily: BRAND_FONT_DISPLAY,
                boxShadow: `0 3px 0 ${palette.coralShadow}`,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Icon name="reset" size={13} color={palette.white} />
              Reset All Stats
            </button>
          )}

          <button
            onClick={onBack}
            style={{
              padding: '10px 20px',
              background: palette.white,
              color: palette.deepNavy,
              border: `1.5px solid ${palette.border}`,
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '800',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              fontFamily: BRAND_FONT_DISPLAY,
              boxShadow: `0 2px 0 ${palette.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Icon name="arrowLeft" size={13} color={palette.deepNavy} />
            Back
          </button>
        </div>
      </div>

      {/* TIME FILTER */}
      <div className="leaderboard-time-filter" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={{
          display: 'flex',
          gap: '6px',
          background: palette.creamSoft,
          padding: '4px',
          borderRadius: '10px',
          flexWrap: 'wrap',
          border: `1.5px solid ${palette.border}`,
        }}>
          {timeFilters.map(filter => {
            const isActive = timeFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setTimeFilter(filter.id)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  background: isActive ? palette.white : 'transparent',
                  color: isActive ? palette.deepNavy : palette.bodyTextSoft,
                  boxShadow: isActive ? `0 1px 0 ${palette.border}` : 'none',
                  fontFamily: BRAND_FONT_DISPLAY,
                }}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <span style={{
          fontSize: '12px',
          color: palette.deepNavy,
          background: palette.creamSoft,
          padding: '7px 14px',
          borderRadius: '10px',
          border: `1.5px solid ${palette.border}`,
          fontFamily: BRAND_FONT_DISPLAY,
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <Icon name="trophy" size={12} color={palette.warmOrange} />
          Top {leaderboardData.length} Learners
        </span>
      </div>

      {/* LEADERBOARD TYPE SELECTOR */}
      <div className="leaderboard-types" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '10px',
        marginBottom: '22px',
      }}>
        {leaderboardTypes.map(type => {
          const isActive = selectedLeaderboard === type.id;
          return (
            <button
              key={type.id}
              onClick={() => setSelectedLeaderboard(type.id)}
              style={{
                background: isActive ? `${type.color}12` : palette.white,
                border: isActive ? `1.5px solid ${type.color}` : `1.5px solid ${palette.border}`,
                borderRadius: '12px',
                padding: '14px',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: isActive ? `0 2px 0 ${type.color}40` : `0 2px 0 ${palette.border}`,
                fontFamily: BRAND_FONT_BODY,
              }}
            >
              <div className="type-icon" style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: isActive ? `${type.color}18` : palette.creamSoft,
                border: `1px solid ${isActive ? `${type.color}40` : palette.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon name={type.icon} size={16} color={isActive ? type.color : palette.bodyTextSoft} />
              </div>
              <div className="type-label" style={{
                fontSize: '13px',
                fontWeight: '800',
                color: isActive ? palette.deepNavy : palette.bodyText,
                fontFamily: BRAND_FONT_DISPLAY,
                textAlign: 'left',
              }}>
                {type.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* ADMIN STATS SUMMARY */}
      {isAdmin && (
        <div className="leaderboard-admin-stats" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          marginBottom: '20px',
        }}>
          <div className="stat-card" style={{
            background: palette.white,
            borderRadius: '14px',
            padding: '18px',
            border: `1.5px solid ${palette.border}`,
            boxShadow: `0 2px 0 ${palette.border}`,
          }}>
            <div style={{ fontSize: '10px', color: palette.bodyTextSoft, marginBottom: '8px', fontFamily: BRAND_FONT_DISPLAY, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Players</div>
            <div className="stat-number" style={{ fontSize: '26px', fontWeight: '800', color: palette.deepNavy, fontFamily: BRAND_FONT_DISPLAY, lineHeight: 1 }}>{leaderboardData.length}</div>
          </div>
          <div className="stat-card" style={{
            background: palette.white,
            borderRadius: '14px',
            padding: '18px',
            border: `1.5px solid ${palette.border}`,
            boxShadow: `0 2px 0 ${palette.border}`,
          }}>
            <div style={{ fontSize: '10px', color: palette.bodyTextSoft, marginBottom: '8px', fontFamily: BRAND_FONT_DISPLAY, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Avg Points</div>
            <div className="stat-number" style={{ fontSize: '26px', fontWeight: '800', color: palette.deepNavy, fontFamily: BRAND_FONT_DISPLAY, lineHeight: 1 }}>
              {leaderboardData.length > 0
                ? Math.round(leaderboardData.reduce((acc, u) => acc + getValue(u), 0) / leaderboardData.length)
                : 0}
            </div>
          </div>
          <div className="stat-card" style={{
            background: palette.white,
            borderRadius: '14px',
            padding: '18px',
            border: `1.5px solid ${palette.border}`,
            boxShadow: `0 2px 0 ${palette.border}`,
          }}>
            <div style={{ fontSize: '10px', color: palette.bodyTextSoft, marginBottom: '8px', fontFamily: BRAND_FONT_DISPLAY, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Active Today</div>
            <div className="stat-number" style={{ fontSize: '26px', fontWeight: '800', color: palette.deepNavy, fontFamily: BRAND_FONT_DISPLAY, lineHeight: 1 }}>12</div>
          </div>
          <div className="stat-card" style={{
            background: palette.white,
            borderRadius: '14px',
            padding: '18px',
            border: `1.5px solid ${palette.border}`,
            boxShadow: `0 2px 0 ${palette.border}`,
          }}>
            <div style={{ fontSize: '10px', color: palette.bodyTextSoft, marginBottom: '8px', fontFamily: BRAND_FONT_DISPLAY, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>New This Week</div>
            <div className="stat-number" style={{ fontSize: '26px', fontWeight: '800', color: palette.deepNavy, fontFamily: BRAND_FONT_DISPLAY, lineHeight: 1 }}>5</div>
          </div>
        </div>
      )}

      {/* ERROR STATE */}
      {error && (
        <div style={{
          background: `${palette.coral}12`,
          border: `1.5px solid ${palette.coral}40`,
          borderRadius: '14px',
          padding: '16px 18px',
          marginBottom: '18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icon name="warning" size={18} color={palette.coral} />
            <div>
              <div style={{ fontWeight: '800', color: palette.coral, marginBottom: '2px', fontFamily: BRAND_FONT_DISPLAY, fontSize: '13px' }}>Error Loading Leaderboard</div>
              <div style={{ fontSize: '12px', color: palette.bodyText, fontWeight: '600' }}>{error}</div>
            </div>
          </div>
          <button
            onClick={fetchLeaderboardData}
            style={{
              padding: '8px 18px',
              background: palette.coral,
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontFamily: BRAND_FONT_DISPLAY,
              fontWeight: '800',
              fontSize: '12px',
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
          padding: '60px 40px',
          background: palette.white,
          borderRadius: '20px',
          border: `1.5px solid ${palette.border}`,
          boxShadow: `0 2px 0 ${palette.border}`,
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: `3px solid ${palette.border}`,
            borderTop: `3px solid ${palette.warmOrange}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <h3 style={{ fontSize: '16px', color: palette.deepNavy, marginBottom: '6px', fontFamily: BRAND_FONT_DISPLAY, fontWeight: '800' }}>
            Loading Leaderboard
          </h3>
          <p style={{ fontSize: '13px', color: palette.bodyTextSoft, fontFamily: BRAND_FONT_BODY, fontWeight: '600', margin: 0 }}>
            Fetching top performers...
          </p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
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
              marginBottom: '22px',
              padding: '20px',
              background: palette.creamSoft,
              borderRadius: '18px',
              border: `1.5px solid ${palette.border}`,
              flexWrap: 'wrap',
            }}>
              {/* 2nd Place */}
              {leaderboardData[1] && (
                <div
                  className="podium-item player-clickable"
                  onClick={() => fetchUserProfile(leaderboardData[1].id)}
                  style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                  <div className="podium-avatar" style={{
                    width: '76px',
                    height: '76px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: palette.creamSoft,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 10px',
                    border: `3px solid ${palette.silver}`,
                    position: 'relative',
                  }}>
                    <PlayerAvatar user={leaderboardData[1]} size={76} fontSize={30} />
                    <div style={{
                      position: 'absolute',
                      top: -6,
                      right: -6,
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: palette.silver,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: '800',
                      fontSize: '12px',
                      border: `2px solid ${palette.white}`,
                      fontFamily: BRAND_FONT_DISPLAY,
                    }}>
                      2
                    </div>
                  </div>
                  <div className="podium-name" style={{ fontWeight: '800', color: palette.deepNavy, fontSize: '13px', marginBottom: '6px', fontFamily: BRAND_FONT_DISPLAY }}>
                    {leaderboardData[1].displayName}
                  </div>
                  <div className="podium-value" style={{ fontSize: '12px', color: palette.bodyText, background: palette.white, padding: '4px 12px', borderRadius: '8px', display: 'inline-block', fontFamily: BRAND_FONT_DISPLAY, fontWeight: '800', border: `1px solid ${palette.border}` }}>
                    {getValue(leaderboardData[1])} {getUnit()}
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {leaderboardData[0] && (
                <div
                  className="podium-item player-clickable"
                  onClick={() => fetchUserProfile(leaderboardData[0].id)}
                  style={{ textAlign: 'center', transform: 'scale(1.08)', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                  <div className="podium-avatar" style={{
                    width: '92px',
                    height: '92px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: `${palette.gold}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 10px',
                    border: `3px solid ${palette.gold}`,
                    position: 'relative',
                  }}>
                    <PlayerAvatar user={leaderboardData[0]} size={92} fontSize={38} />
                    <div style={{
                      position: 'absolute',
                      top: -6,
                      right: -6,
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: palette.gold,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: '800',
                      fontSize: '14px',
                      border: `2px solid ${palette.white}`,
                      fontFamily: BRAND_FONT_DISPLAY,
                    }}>
                      1
                    </div>
                  </div>
                  <div className="podium-name" style={{ fontWeight: '800', color: palette.deepNavy, fontSize: '14px', marginBottom: '6px', fontFamily: BRAND_FONT_DISPLAY }}>
                    {leaderboardData[0].displayName}
                  </div>
                  <div className="podium-value" style={{ fontSize: '13px', fontWeight: '800', color: palette.warmOrange, background: `${palette.warmOrange}12`, padding: '5px 14px', borderRadius: '10px', display: 'inline-block', fontFamily: BRAND_FONT_DISPLAY, border: `1.5px solid ${palette.warmOrange}40` }}>
                    {getValue(leaderboardData[0])} {getUnit()}
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {leaderboardData[2] && (
                <div
                  className="podium-item player-clickable"
                  onClick={() => fetchUserProfile(leaderboardData[2].id)}
                  style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                  <div className="podium-avatar" style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: `${palette.bronze}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 10px',
                    border: `3px solid ${palette.bronze}`,
                    position: 'relative',
                  }}>
                    <PlayerAvatar user={leaderboardData[2]} size={68} fontSize={26} />
                    <div style={{
                      position: 'absolute',
                      top: -6,
                      right: -6,
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: palette.bronze,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: '800',
                      fontSize: '11px',
                      border: `2px solid ${palette.white}`,
                      fontFamily: BRAND_FONT_DISPLAY,
                    }}>
                      3
                    </div>
                  </div>
                  <div className="podium-name" style={{ fontWeight: '800', color: palette.deepNavy, fontSize: '12px', marginBottom: '6px', fontFamily: BRAND_FONT_DISPLAY }}>
                    {leaderboardData[2].displayName}
                  </div>
                  <div className="podium-value" style={{ fontSize: '11px', color: palette.bodyText, background: palette.white, padding: '4px 10px', borderRadius: '8px', display: 'inline-block', fontFamily: BRAND_FONT_DISPLAY, fontWeight: '800', border: `1px solid ${palette.border}` }}>
                    {getValue(leaderboardData[2])} {getUnit()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* LEADERBOARD TABLE */}
          <div style={{
            background: palette.white,
            borderRadius: '16px',
            border: `1.5px solid ${palette.border}`,
            overflow: 'hidden',
            boxShadow: `0 2px 0 ${palette.border}`,
          }}>
            <div style={{
              padding: '14px 18px',
              borderBottom: `1.5px solid ${palette.border}`,
              background: palette.creamSoft,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
            }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '800',
                color: palette.deepNavy,
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: BRAND_FONT_DISPLAY,
              }}>
                <Icon name={currentType.icon} size={14} color={currentType.color} />
                {currentType.label} Ranking
                <span style={{ fontSize: '11px', color: palette.bodyTextSoft, fontWeight: 700 }}>• {currentTimeLabel}</span>
              </h3>
              <span style={{
                fontSize: '11px',
                color: palette.deepNavy,
                background: palette.white,
                padding: '4px 10px',
                borderRadius: '8px',
                border: `1.5px solid ${palette.border}`,
                fontFamily: BRAND_FONT_DISPLAY,
                fontWeight: 800,
              }}>
                {leaderboardData.length} {leaderboardData.length === 1 ? 'player' : 'players'}
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
                    borderBottom: `1.5px solid ${palette.border}`,
                  }}>
                    <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: '10px', fontWeight: '800', color: palette.bodyTextSoft, fontFamily: BRAND_FONT_DISPLAY, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Rank</th>
                    <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: '10px', fontWeight: '800', color: palette.bodyTextSoft, fontFamily: BRAND_FONT_DISPLAY, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Player</th>
                    {isAdmin && <th className="email-col" style={{ padding: '12px 18px', textAlign: 'left', fontSize: '10px', fontWeight: '800', color: palette.bodyTextSoft, fontFamily: BRAND_FONT_DISPLAY, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Email</th>}
                    <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: '10px', fontWeight: '800', color: palette.bodyTextSoft, fontFamily: BRAND_FONT_DISPLAY, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Level</th>
                    <th style={{ padding: '12px 18px', textAlign: 'right', fontSize: '10px', fontWeight: '800', color: palette.bodyTextSoft, fontFamily: BRAND_FONT_DISPLAY, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{currentType.label}</th>
                    {isAdmin && <th className="actions-col" style={{ padding: '12px 18px', textAlign: 'center', fontSize: '10px', fontWeight: '800', color: palette.bodyTextSoft, fontFamily: BRAND_FONT_DISPLAY, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Actions</th>}
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
                          borderBottom: index < leaderboardData.length - 1 ? `1.5px solid ${palette.borderSoft}` : 'none',
                          background: isCurrentUser ? `${palette.warmOrange}08` : 'transparent',
                        }}
                        onMouseOver={(e) => {
                          if (!isCurrentUser) {
                            e.currentTarget.style.background = palette.creamSoft;
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!isCurrentUser) {
                            e.currentTarget.style.background = 'transparent';
                          }
                        }}
                      >
                        <td style={{ padding: '12px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {user.rank <= 3 ? (
                              <div className="rank-badge" style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: user.rank === 1 ? `${palette.gold}18` : user.rank === 2 ? `${palette.silver}18` : `${palette.bronze}18`,
                                border: `1.5px solid ${user.rank === 1 ? palette.gold : user.rank === 2 ? palette.silver : palette.bronze}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: user.rank === 1 ? palette.gold : user.rank === 2 ? palette.silver : palette.bronze,
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
                                fontSize: '12px',
                                fontWeight: '800',
                                color: palette.bodyTextSoft,
                                fontFamily: BRAND_FONT_DISPLAY,
                              }}>
                                #{user.rank}
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '12px 18px' }}>
                          <div
                            className="player-cell player-clickable"
                            onClick={() => fetchUserProfile(user.id)}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                          >
                            <div className="player-avatar" style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              overflow: 'hidden',
                              background: palette.creamSoft,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              border: `1.5px solid ${palette.border}`
                            }}>
                              <PlayerAvatar user={user} size={38} fontSize={16} />
                            </div>
                            <div>
                              <div className="player-name" style={{
                                fontSize: '13px',
                                fontWeight: '800',
                                color: palette.deepNavy,
                                marginBottom: '2px',
                                fontFamily: BRAND_FONT_DISPLAY,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                flexWrap: 'wrap',
                              }}>
                                {user.displayName}
                                {isCurrentUser && !isAdmin && (
                                  <span style={{
                                    fontSize: '9px',
                                    background: palette.warmOrange,
                                    color: '#ffffff',
                                    padding: '2px 6px',
                                    borderRadius: '999px',
                                    fontWeight: '800',
                                    fontFamily: BRAND_FONT_DISPLAY,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                  }}>
                                    You
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        {isAdmin && (
                          <td className="email-col" style={{ padding: '12px 18px', color: palette.bodyText, fontSize: '12px', fontFamily: BRAND_FONT_BODY, fontWeight: '600' }}>{user.email}</td>
                        )}
                        <td style={{ padding: '12px 18px' }}>
                          <span className="level-badge" style={{
                            padding: '3px 10px',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: '800',
                            background: palette.creamSoft,
                            color: palette.deepNavy,
                            fontFamily: BRAND_FONT_DISPLAY,
                            border: `1px solid ${palette.border}`,
                          }}>
                            Lv {user.stats?.level || user.progress?.level || 1}
                          </span>
                        </td>
                        <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                          <span className="value-display" style={{
                            fontSize: '15px',
                            fontWeight: '800',
                            color: currentType.color,
                            fontFamily: BRAND_FONT_DISPLAY,
                          }}>
                            {getValue(user).toLocaleString()}
                          </span>
                          <span style={{
                            fontSize: '10px',
                            color: palette.bodyTextSoft,
                            marginLeft: '4px',
                            fontFamily: BRAND_FONT_BODY,
                            fontWeight: '700',
                          }}>
                            {getUnit()}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="actions-col" style={{ padding: '12px 18px', textAlign: 'center' }}>
                            <div className="leaderboard-admin-actions" style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleResetStats(user.id);
                                }}
                                style={{
                                  padding: '4px 10px',
                                  background: palette.creamSoft,
                                  border: `1.5px solid ${palette.border}`,
                                  borderRadius: '8px',
                                  fontSize: '10px',
                                  color: palette.warmOrange,
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                  fontFamily: BRAND_FONT_DISPLAY,
                                  fontWeight: '800',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.04em',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <Icon name="reset" size={10} color={palette.warmOrange} />
                                Reset
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveUser(user.id);
                                }}
                                style={{
                                  padding: '4px 10px',
                                  background: `${palette.coral}12`,
                                  border: `1.5px solid ${palette.coral}40`,
                                  borderRadius: '8px',
                                  fontSize: '10px',
                                  color: palette.coral,
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                  fontFamily: BRAND_FONT_DISPLAY,
                                  fontWeight: '800',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.04em',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <Icon name="trash" size={10} color={palette.coral} />
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
              marginTop: '20px',
              padding: '16px 22px',
              background: palette.creamSoft,
              borderRadius: '14px',
              border: `1.5px solid ${palette.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
            }}>
              <span className="rank-label" style={{ color: palette.bodyTextSoft, fontFamily: BRAND_FONT_DISPLAY, fontWeight: '800', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Your Current Rank
              </span>
              <span className="rank-value" style={{
                color: palette.warmOrange,
                fontWeight: '800',
                fontSize: '16px',
                fontFamily: BRAND_FONT_DISPLAY,
              }}>
                #{leaderboardData.findIndex(u => u.id === (currentUserId || localStorage.getItem('userId'))) + 1 || 'Not in leaderboard'}
              </span>
            </div>
          )}

          {/* FOOTER STATS */}
          {leaderboardData.length > 0 && (
            <div className="leaderboard-footer" style={{
              marginTop: '20px',
              padding: '16px 20px',
              background: palette.creamSoft,
              borderRadius: '14px',
              border: `1.5px solid ${palette.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '12px',
              color: palette.bodyText,
              flexWrap: 'wrap',
              gap: '8px',
              fontWeight: '700',
            }}>
              <div className="footer-stats" style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icon name="trophy" size={12} color={palette.gold} />
                  Top: {leaderboardData.length > 0 ? getValue(leaderboardData[0]).toLocaleString() : 0} {getUnit()}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icon name="star" size={12} color={palette.teal} />
                  Avg: {leaderboardData.length > 0 ? Math.round(leaderboardData.reduce((acc, u) => acc + getValue(u), 0) / leaderboardData.length).toLocaleString() : 0} {getUnit()}
                </span>
              </div>
              <span style={{ color: palette.bodyTextSoft, fontFamily: BRAND_FONT_DISPLAY, fontWeight: '800', fontSize: '11px' }}>
                Updated just now
              </span>
            </div>
          )}

          {/* EMPTY STATE */}
          {leaderboardData.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '60px 40px',
              background: palette.white,
              borderRadius: '20px',
              border: `1.5px solid ${palette.border}`,
              boxShadow: `0 2px 0 ${palette.border}`,
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: palette.creamSoft,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                border: `1.5px solid ${palette.border}`,
              }}>
                <Icon name="trophy" size={36} color={palette.warmOrange} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: palette.deepNavy, marginBottom: '6px', fontFamily: BRAND_FONT_DISPLAY }}>
                {timeFilter === 'all' ? 'No data yet' : `No activity ${currentTimeLabel.toLowerCase()}`}
              </h3>
              <p style={{ fontSize: '13px', color: palette.bodyTextSoft, margin: 0, fontFamily: BRAND_FONT_BODY, fontWeight: '600' }}>
                {timeFilter === 'all'
                  ? 'Players will appear here once they start playing'
                  : `Try selecting "All Time" to see everyone`}
              </p>
            </div>
          )}
        </>
      )}

      {/* PROFILE MODAL */}
      {showProfileModal && (
        <div style={{
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
        }} onClick={closeProfileModal}>
          <div style={{
            background: palette.white,
            borderRadius: '20px',
            maxWidth: '760px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(42, 40, 69, 0.35)',
            position: 'relative',
            border: `1.5px solid ${palette.border}`,
          }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeProfileModal}
              style={{
                position: 'sticky',
                top: 0,
                float: 'right',
                background: palette.creamSoft,
                border: `1.5px solid ${palette.border}`,
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                margin: '14px 14px 0 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
              }}
            >
              <Icon name="close" size={16} color={palette.bodyText} />
            </button>

            {profileLoading ? (
              <div style={{ textAlign: 'center', padding: '60px 40px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: `3px solid ${palette.border}`,
                  borderTop: `3px solid ${palette.warmOrange}`,
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  margin: '0 auto 16px',
                }} />
                <p style={{ color: palette.bodyTextSoft, fontFamily: BRAND_FONT_BODY, fontWeight: '600', margin: 0 }}>Loading profile...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : selectedProfile && (
              <div style={{ padding: '0 36px 36px 36px' }}>
                {/* Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  padding: '22px 0 20px 0',
                  borderBottom: `1.5px solid ${palette.border}`,
                  marginTop: '-8px',
                  flexWrap: 'wrap',
                }}>
                  <div style={{
                    width: '88px',
                    height: '88px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: palette.creamSoft,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: `3px solid ${palette.warmOrange}`,
                  }}>
                    <PlayerAvatar user={selectedProfile} size={88} fontSize={36} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: '800', color: palette.deepNavy, fontFamily: BRAND_FONT_DISPLAY, letterSpacing: '-0.3px' }}>
                      {selectedProfile.displayName}
                    </h2>
                    <p style={{ color: palette.bodyTextSoft, fontSize: '13px', margin: '0 0 6px 0', fontWeight: '700', fontFamily: BRAND_FONT_BODY }}>
                      {selectedProfile.username}
                    </p>
                    <p style={{ color: palette.bodyText, fontSize: '13px', margin: 0, lineHeight: 1.5, fontWeight: 600, fontFamily: BRAND_FONT_BODY }}>
                      {selectedProfile.bio}
                    </p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '10px',
                  marginTop: '20px',
                  padding: '18px',
                  background: palette.creamSoft,
                  borderRadius: '14px',
                  border: `1.5px solid ${palette.border}`,
                }}>
                  {[
                    { label: 'Words', value: selectedProfile.stats?.wordsLearned || 0, color: palette.warmOrange },
                    { label: 'Games', value: selectedProfile.stats?.gamesPlayed || 0, color: palette.coral },
                    { label: 'Streak', value: selectedProfile.stats?.streak || 0, color: palette.teal },
                    { label: 'Points', value: selectedProfile.stats?.totalPoints || 0, color: palette.softGreen },
                  ].map((stat, i) => (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '22px', fontWeight: '800', color: stat.color, fontFamily: BRAND_FONT_DISPLAY, lineHeight: 1 }}>
                        {stat.value}
                      </div>
                      <div style={{ fontSize: '10px', color: palette.bodyTextSoft, marginTop: '6px', fontWeight: '800', fontFamily: BRAND_FONT_DISPLAY, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Info sections */}
                {[
                  { title: 'Basic Information', items: [
                    ['Display Name', selectedProfile.displayName],
                    ['Username', selectedProfile.username],
                    ['Email', selectedProfile.email],
                    ['Bio', selectedProfile.bio],
                  ]},
                  { title: 'Contact Information', items: [
                    ['Phone', selectedProfile.phone],
                    ['Location', selectedProfile.location],
                    ['Website', selectedProfile.website],
                  ]},
                  { title: 'Social Links', items: [
                    ['Twitter', selectedProfile.twitter],
                    ['Instagram', selectedProfile.instagram],
                    ['LinkedIn', selectedProfile.linkedin],
                  ]},
                  { title: 'Settings', items: [
                    ['Email Notifications', selectedProfile.emailNotifications ? 'Enabled' : 'Disabled'],
                    ['Dark Mode', selectedProfile.darkMode ? 'Enabled' : 'Disabled'],
                    ['Language', selectedProfile.language],
                  ]},
                ].map((section, sIdx) => (
                  <div key={sIdx} style={{ marginTop: '22px' }}>
                    <h4 style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      color: palette.bodyTextSoft,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      margin: '0 0 12px 0',
                      fontFamily: BRAND_FONT_DISPLAY,
                    }}>
                      {section.title}
                    </h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '0 32px',
                    }}>
                      {section.items.map(([label, value], iIdx) => (
                        <div key={iIdx} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '8px 0',
                          borderBottom: `1.5px solid ${palette.borderSoft}`,
                          fontSize: '13px',
                          gap: '12px',
                        }}>
                          <span style={{ color: palette.bodyTextSoft, fontWeight: '700', fontFamily: BRAND_FONT_BODY }}>{label}</span>
                          <span style={{
                            color: (value === 'Not set' || !value) ? palette.bodyTextSoft : palette.deepNavy,
                            fontWeight: '700',
                            textAlign: 'right',
                            fontFamily: BRAND_FONT_BODY,
                            opacity: (value === 'Not set' || !value) ? 0.6 : 1,
                            wordBreak: 'break-word',
                          }}>{value || 'Not set'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
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