// src/components/Leaderboards.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../pages/firebase';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  where,
  onSnapshot,
  doc,
  getDoc
} from 'firebase/firestore';
import { getLeaderboard } from '../utils/streakHelper';
import { colors, fontFamily } from "./dashboard/dashboardStyles";

const Leaderboards = ({ onBack, isAdmin = false, currentUserId = null }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all');
  const [selectedLeaderboard, setSelectedLeaderboard] = useState('points');
  const [pageLoaded, setPageLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const unsubscribeRef = useRef(null);
  
  // NEW: State for profile modal
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

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
      
      // Try to get from Firebase first
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      let profileData = null;
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        const stats = data.stats || {};
        
        profileData = {
          id: userId,
          displayName: data.displayName || 'Anonymous User',
          username: data.username || `@${data.displayName?.toLowerCase().replace(/\s/g, '') || 'user'}`,
          email: data.email || 'No email set',
          avatar: data.avatar || '👤',
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
        // Check local storage if not in Firebase
        const localData = getLeaderboard();
        const localUser = localData.find(u => u.userId === userId);
        if (localUser) {
          profileData = {
            id: userId,
            displayName: localUser.username || 'Player',
            username: `@${localUser.username?.toLowerCase().replace(/\s/g, '') || 'player'}`,
            email: 'Not synced',
            avatar: '👤',
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
  // ===== FETCH LEADERBOARD - FIXED QUERY =====
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

      // FIXED: Removed where clause to avoid composite index requirement
      // Filtering is done in code instead
      const q = query(
        usersRef,
        orderBy(sortField, 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      
      console.log('📊 Snapshot size:', snapshot.size);
      
      // Filter out users with null stats
      const firebaseUsers = snapshot.docs
        .map((doc, index) => {
          const data = doc.data();
          const stats = data.stats || {};
          
          // Skip users with no stats
          if (!data.stats || Object.keys(stats).length === 0) {
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
            avatar: data.avatar || '👤',
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
            isLocal: false
          };
        })
        .filter(user => user !== null);

      // 2. GET LOCAL DATA (for backup/merge)
      const localData = getLeaderboard();
      console.log('📊 Local data from localStorage:', localData.length);

      // 3. CREATE MAP FOR MERGING
      const mergedMap = new Map();
      
      firebaseUsers.forEach(user => {
        if (user) mergedMap.set(user.id, { ...user });
      });
      
      localData.forEach(localUser => {
        const userId = localUser.userId;
        
        if (mergedMap.has(userId)) {
          const existing = mergedMap.get(userId);
          const stats = existing.stats || {};
          existing.stats = {
            totalPoints: Math.max(stats.totalPoints || 0, localUser.totalPoints || 0),
            wordsLearned: Math.max(stats.wordsLearned || 0, localUser.wordsLearned || 0),
            gamesPlayed: Math.max(stats.gamesPlayed || 0, localUser.gamesPlayed || 0),
            longestStreak: Math.max(stats.longestStreak || 0, localUser.streak || 0),
            level: Math.max(stats.level || 1, localUser.level || 1)
          };
          existing.progress = existing.stats;
          mergedMap.set(userId, existing);
        } else {
          mergedMap.set(userId, {
            id: userId,
            rank: mergedMap.size + 1,
            displayName: localUser.username || 'Player',
            avatar: '👤',
            email: '',
            username: `@${localUser.username?.toLowerCase().replace(/\s/g, '') || 'player'}`,
            stats: {
              totalPoints: localUser.totalPoints || 0,
              wordsLearned: localUser.wordsLearned || 0,
              gamesPlayed: localUser.gamesPlayed || 0,
              longestStreak: localUser.streak || 0,
              level: localUser.level || 1
            },
            progress: {
              totalPoints: localUser.totalPoints || 0,
              wordsLearned: localUser.wordsLearned || 0,
              gamesPlayed: localUser.gamesPlayed || 0,
              longestStreak: localUser.streak || 0,
              level: localUser.level || 1
            },
            isLocal: true
          });
        }
      });

      // 4. CONVERT TO ARRAY
      let mergedData = Array.from(mergedMap.values());

      // 5. SORT BY SELECTED CATEGORY
      mergedData.sort((a, b) => {
        const aVal = getValue(a);
        const bVal = getValue(b);
        return bVal - aVal;
      });

      // 6. UPDATE RANK
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
      
      // Fallback to local data
      const localData = getLeaderboard();
      const formatted = localData.map((entry, index) => ({
        id: entry.userId || `local_${index}`,
        rank: index + 1,
        displayName: entry.username || 'Player',
        avatar: '👤',
        email: '',
        username: `@${entry.username?.toLowerCase().replace(/\s/g, '') || 'player'}`,
        stats: {
          totalPoints: entry.totalPoints || 0,
          wordsLearned: entry.wordsLearned || 0,
          gamesPlayed: entry.gamesPlayed || 0,
          longestStreak: entry.streak || 0,
          level: entry.level || 1
        },
        progress: {
          totalPoints: entry.totalPoints || 0,
          wordsLearned: entry.wordsLearned || 0,
          gamesPlayed: entry.gamesPlayed || 0,
          longestStreak: entry.streak || 0,
          level: entry.level || 1
        },
        isLocal: true
      }));
      setLeaderboardData(formatted);
    } finally {
      setLoading(false);
    }
  }, [selectedLeaderboard, isAdmin, currentUserId, getSortField, getValue]);

  // ============================================================
  // ===== FETCH ON MOUNT AND WHEN DEPENDENCIES CHANGE =====
  // ============================================================
  useEffect(() => {
    fetchLeaderboardData();
  }, [fetchLeaderboardData]);

  // ============================================================
  // ===== REAL-TIME LISTENER - FIXED =====
  // ============================================================
  useEffect(() => {
    // Clean up previous listener
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    const usersRef = collection(db, 'users');
    
    // FIXED: Removed where clause to avoid composite index requirement
    const q = query(
      usersRef,
      orderBy('stats.totalPoints', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('🔄 Real-time update detected!');
      
      if (!loading) {
        try {
          // Filter out users with null stats
          const firebaseUsers = snapshot.docs
            .map((doc) => {
              const data = doc.data();
              const stats = data.stats || {};
              
              // Skip users with no stats
              if (!data.stats || Object.keys(stats).length === 0) {
                return null;
              }
              
              return {
                id: doc.id,
                displayName: data.displayName || 'Anonymous User',
                avatar: data.avatar || '👤',
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
                isLocal: false
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
            if (mergedMap.has(userId)) {
              const existing = mergedMap.get(userId);
              const stats = existing.stats || {};
              existing.stats = {
                totalPoints: Math.max(stats.totalPoints || 0, localUser.totalPoints || 0),
                wordsLearned: Math.max(stats.wordsLearned || 0, localUser.wordsLearned || 0),
                gamesPlayed: Math.max(stats.gamesPlayed || 0, localUser.gamesPlayed || 0),
                longestStreak: Math.max(stats.longestStreak || 0, localUser.streak || 0),
                level: Math.max(stats.level || 1, localUser.level || 1)
              };
              existing.progress = existing.stats;
              mergedMap.set(userId, existing);
            } else {
              mergedMap.set(userId, {
                id: userId,
                rank: mergedMap.size + 1,
                displayName: localUser.username || 'Player',
                avatar: '👤',
                email: '',
                username: `@${localUser.username?.toLowerCase().replace(/\s/g, '') || 'player'}`,
                stats: {
                  totalPoints: localUser.totalPoints || 0,
                  wordsLearned: localUser.wordsLearned || 0,
                  gamesPlayed: localUser.gamesPlayed || 0,
                  longestStreak: localUser.streak || 0,
                  level: localUser.level || 1
                },
                progress: {
                  totalPoints: localUser.totalPoints || 0,
                  wordsLearned: localUser.wordsLearned || 0,
                  gamesPlayed: localUser.gamesPlayed || 0,
                  longestStreak: localUser.streak || 0,
                  level: localUser.level || 1
                },
                isLocal: true
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
  // ===== HANDLE FUNCTIONS =====
  // ============================================================
  const handleResetStats = (userId) => {
    if (isAdmin && window.confirm('Reset stats for this user?')) {
      console.log('Reset user:', userId);
      alert('Reset functionality - implement as needed');
    }
  };

  const handleRemoveUser = (userId) => {
    if (isAdmin && window.confirm('Remove this user from leaderboard?')) {
      console.log('Remove user:', userId);
      alert('Remove functionality - implement as needed');
    }
  };

  // REMOVED: handleExportData function - no longer needed

  const handleRetry = () => {
    fetchLeaderboardData();
  };

  // ============================================================
  // ===== CLOSE PROFILE MODAL =====
  // ============================================================
  const closeProfileModal = () => {
    setShowProfileModal(false);
    setSelectedProfile(null);
  };

  const leaderboardTypes = [
    { id: 'points', label: 'Total Points', icon: '⭐', color: '#5C6AC4', bg: '#EEF0FB' },
    { id: 'words', label: 'Words Learned', icon: '📚', color: '#2E7D32', bg: '#e8f5e9' },
    { id: 'streak', label: 'Longest Streak', icon: '🔥', color: '#B85C1A', bg: '#fff4e5' },
    { id: 'games', label: 'Games Played', icon: '🎮', color: '#C44545', bg: '#fee9e9' },
  ];

  const timeFilters = [
    { id: 'all', label: 'All Time' },
    { id: 'weekly', label: 'This Week' },
    { id: 'monthly', label: 'This Month' },
  ];

  const currentType = leaderboardTypes.find(t => t.id === selectedLeaderboard) || leaderboardTypes[0];

  // ============================================================
  // ===== RENDER =====
  // ============================================================
  return (
    <div className="leaderboard-container" style={{
      fontFamily: fontFamily,
      maxWidth: isAdmin ? '1400px' : '1200px',
      margin: '0 auto',
      padding: '24px',
      color: colors.textPrimary,
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
          .leaderboard-table .player-cell .player-avatar { width: 28px !important; height: 28px !important; font-size: 14px !important; }
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
          .leaderboard-table .player-cell .player-avatar { width: 24px !important; height: 24px !important; font-size: 12px !important; }
          .leaderboard-table .player-cell .player-name { font-size: 12px !important; }
          .leaderboard-podium .podium-item .podium-avatar { width: 56px !important; height: 56px !important; }
          .leaderboard-admin-stats { grid-template-columns: 1fr !important; }
          .leaderboard-time-filter button { padding: 4px 10px !important; font-size: 11px !important; }
        }
        /* Profile Modal Styles */
        .profile-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
          animation: fadeIn 0.3s ease;
        }
        .profile-modal-overlay.closing {
          animation: fadeOut 0.3s ease;
        }
        .profile-modal {
          background: ${colors.surface};
          border-radius: 24px;
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: slideUp 0.3s ease;
          position: relative;
        }
        .profile-modal.closing {
          animation: slideDown 0.3s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(30px); opacity: 0; }
        }
        .profile-modal-close {
          position: sticky;
          top: 0;
          right: 0;
          float: right;
          background: ${colors.bg};
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
          color: ${colors.textPrimary};
          font-family: ${fontFamily};
        }
        .profile-modal-close:hover {
          background: ${colors.border};
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
          border-bottom: 1px solid ${colors.border};
          margin-top: -12px;
        }
        .profile-avatar-large {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          overflow: hidden;
          background: ${colors.bg};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          flex-shrink: 0;
          border: 3px solid ${colors.accent};
        }
        .profile-avatar-large img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .profile-name-section h2 {
          margin: 0 0 4px 0;
          font-size: 24px;
          font-weight: 600;
          color: ${colors.textPrimary};
        }
        .profile-name-section .username {
          color: ${colors.textSecondary};
          font-size: 14px;
          margin: 0;
        }
        .profile-name-section .bio {
          color: ${colors.textSecondary};
          font-size: 14px;
          margin: 8px 0 0 0;
          line-height: 1.5;
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
          font-weight: 600;
          color: ${colors.textSecondary};
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 16px 0;
        }
        .profile-info-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid ${colors.border};
          font-size: 14px;
        }
        .profile-info-item:last-child {
          border-bottom: none;
        }
        .profile-info-item .label {
          color: ${colors.textSecondary};
          font-weight: 400;
        }
        .profile-info-item .value {
          color: ${colors.textPrimary};
          font-weight: 500;
          text-align: right;
        }
        .profile-info-item .value.not-set {
          color: ${colors.textMuted};
          font-weight: 300;
        }
        .profile-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-top: 24px;
          padding: 20px;
          background: ${colors.bg};
          border-radius: 16px;
          border: 1px solid ${colors.border};
        }
        .profile-stat-item {
          text-align: center;
        }
        .profile-stat-item .stat-number {
          font-size: 24px;
          font-weight: 700;
          color: ${colors.textPrimary};
        }
        .profile-stat-item .stat-label {
          font-size: 12px;
          color: ${colors.textSecondary};
          margin-top: 4px;
        }
        .profile-loading {
          text-align: center;
          padding: 80px 40px;
        }
        .profile-loading .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid ${colors.border};
          border-top-color: ${colors.accent};
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
        /* Clickable cursor styles */
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

      {/* HEADER - ONLY COLORS CHANGED */}
      <div className="leaderboard-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '28px',
        borderBottom: `1px solid ${colors.border}`,
        paddingBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: colors.textPrimary,
            margin: '0 0 8px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            {isAdmin ? 'Admin Leaderboards' : '🏆 Leaderboards'}
          </h1>
          <p style={{
            fontSize: '15px',
            color: colors.textSecondary,
            margin: '0',
            fontWeight: '200',
          }}>
            {isAdmin ? 'Monitor and manage top performers' : 'See how you rank against other learners'}
          </p>
        </div>

        <div className="leaderboard-header-actions" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* REMOVED: Export Data Button */}
          
          <button
            onClick={onBack}
            style={{
              padding: '10px 24px',
              background: isAdmin ? colors.accent : colors.surface,
              color: isAdmin ? 'white' : colors.textSecondary,
              border: isAdmin ? 'none' : `1px solid ${colors.border}`,
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: fontFamily,
            }}
          >
            ← Back
          </button>
        </div>
      </div>

      {/* TIME FILTER - ONLY COLORS CHANGED */}
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
          background: colors.bg,
          padding: '4px',
          borderRadius: '8px',
          flexWrap: 'wrap',
        }}>
          {timeFilters.map(filter => (
            <button
              key={filter.id}
              onClick={() => setTimeFilter(filter.id)}
              style={{
                padding: '8px 20px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: timeFilter === filter.id ? colors.surface : 'transparent',
                color: timeFilter === filter.id ? colors.textPrimary : colors.textSecondary,
                boxShadow: timeFilter === filter.id ? '0 2px 8px rgba(0,0,0,0.04)' : 'none',
                fontFamily: fontFamily,
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <span style={{
          fontSize: '13px',
          color: colors.textSecondary,
          background: colors.surface,
          padding: '8px 16px',
          borderRadius: '8px',
          border: `1px solid ${colors.border}`,
          fontFamily: fontFamily,
        }}>
          Top {leaderboardData.length} Learners
        </span>
      </div>

      {/* LEADERBOARD TYPE SELECTOR - ONLY COLORS CHANGED */}
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
              background: selectedLeaderboard === type.id ? type.color : colors.surface,
              border: `1px solid ${selectedLeaderboard === type.id ? type.color : colors.border}`,
              borderRadius: '16px',
              padding: '16px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: selectedLeaderboard === type.id ? `0 4px 12px ${type.color}33` : 'none',
              fontFamily: fontFamily,
            }}
          >
            <div className="type-icon" style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: selectedLeaderboard === type.id ? 'rgba(255,255,255,0.2)' : type.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}>
              {type.icon}
            </div>
            <div className="type-label" style={{
              fontSize: '14px',
              fontWeight: '600',
              color: selectedLeaderboard === type.id ? 'white' : colors.textPrimary,
            }}>
              {type.label}
            </div>
          </button>
        ))}
      </div>

      {/* ADMIN STATS SUMMARY - ONLY COLORS CHANGED */}
      {isAdmin && (
        <div className="leaderboard-admin-stats" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '24px',
        }}>
          <div className="stat-card" style={{
            background: colors.surface,
            borderRadius: '16px',
            padding: '20px',
            border: `1px solid ${colors.border}`,
          }}>
            <div style={{ fontSize: '13px', color: colors.textSecondary, marginBottom: '8px' }}>Total Players</div>
            <div className="stat-number" style={{ fontSize: '28px', fontWeight: '700', color: colors.textPrimary }}>{leaderboardData.length}</div>
          </div>
          <div className="stat-card" style={{
            background: colors.surface,
            borderRadius: '16px',
            padding: '20px',
            border: `1px solid ${colors.border}`,
          }}>
            <div style={{ fontSize: '13px', color: colors.textSecondary, marginBottom: '8px' }}>Avg Points</div>
            <div className="stat-number" style={{ fontSize: '28px', fontWeight: '700', color: colors.textPrimary }}>
              {leaderboardData.length > 0 
                ? Math.round(leaderboardData.reduce((acc, u) => acc + getValue(u), 0) / leaderboardData.length)
                : 0}
            </div>
          </div>
          <div className="stat-card" style={{
            background: colors.surface,
            borderRadius: '16px',
            padding: '20px',
            border: `1px solid ${colors.border}`,
          }}>
            <div style={{ fontSize: '13px', color: colors.textSecondary, marginBottom: '8px' }}>Active Today</div>
            <div className="stat-number" style={{ fontSize: '28px', fontWeight: '700', color: colors.textPrimary }}>12</div>
          </div>
          <div className="stat-card" style={{
            background: colors.surface,
            borderRadius: '16px',
            padding: '20px',
            border: `1px solid ${colors.border}`,
          }}>
            <div style={{ fontSize: '13px', color: colors.textSecondary, marginBottom: '8px' }}>New This Week</div>
            <div className="stat-number" style={{ fontSize: '28px', fontWeight: '700', color: colors.textPrimary }}>5</div>
          </div>
        </div>
      )}

      {/* ERROR STATE - ONLY COLORS CHANGED */}
      {error && (
        <div style={{
          background: `${colors.danger}15`,
          border: `1px solid ${colors.danger}40`,
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div>
            <div style={{ fontWeight: '600', color: colors.danger, marginBottom: '4px' }}>⚠️ Error Loading Leaderboard</div>
            <div style={{ fontSize: '14px', color: colors.textSecondary }}>{error}</div>
          </div>
          <button
            onClick={handleRetry}
            style={{
              padding: '8px 20px',
              background: colors.danger,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: fontFamily,
              fontWeight: '500',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* LOADING STATE - ONLY COLORS CHANGED */}
      {loading ? (
        <div style={{
          textAlign: 'center',
          padding: '80px',
          background: colors.surface,
          borderRadius: '24px',
          border: `1px solid ${colors.border}`,
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <h3 style={{ fontSize: '18px', color: colors.textPrimary, marginBottom: '8px' }}>
            Loading Leaderboard
          </h3>
          <p style={{ fontSize: '14px', color: colors.textSecondary }}>
            Fetching top performers...
          </p>
        </div>
      ) : (
        <>
          {/* TOP 3 PODIUM - ONLY COLORS CHANGED */}
          {!isAdmin && leaderboardData.length >= 3 && (
            <div className="leaderboard-podium" style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              gap: '16px',
              marginBottom: '28px',
              padding: '16px',
              background: `${colors.accent}10`,
              borderRadius: '12px',
              border: `1px solid ${colors.border}`,
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
                    background: leaderboardData[1].avatar && leaderboardData[1].avatar !== '👤' ? 'transparent' : colors.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px',
                    border: '2px solid #ffffff',
                    boxShadow: 'none',
                    position: 'relative',
                  }}>
                    {leaderboardData[1].avatar && leaderboardData[1].avatar !== '👤' ? (
                      <img 
                        src={`/images/${leaderboardData[1].avatar}`}
                        alt={leaderboardData[1].displayName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentNode.style.background = colors.bg;
                          e.target.parentNode.innerHTML = '<span style="font-size: 32px;">👤</span>';
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: '32px' }}>👤</span>
                    )}
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
                      fontWeight: '500',
                      fontSize: '12px',
                      border: '2px solid #ffffff',
                      fontFamily: fontFamily,
                    }}>
                      2
                    </div>
                  </div>
                  <div className="podium-name" style={{ fontWeight: '500', color: colors.textPrimary, fontSize: '14px', marginBottom: '4px', fontFamily: fontFamily }}>
                    {leaderboardData[1].displayName}
                  </div>
                  <div className="podium-value" style={{ fontSize: '13px', color: colors.textSecondary, background: colors.border, padding: '4px 10px', borderRadius: '12px', display: 'inline-block', fontFamily: fontFamily }}>
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
                    background: leaderboardData[0].avatar && leaderboardData[0].avatar !== '👤' ? 'transparent' : '#f5e9d3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px',
                    border: '2px solid #ffffff',
                    boxShadow: 'none',
                    position: 'relative',
                  }}>
                    {leaderboardData[0].avatar && leaderboardData[0].avatar !== '👤' ? (
                      <img 
                        src={`/images/${leaderboardData[0].avatar}`}
                        alt={leaderboardData[0].displayName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentNode.style.background = '#f5e9d3';
                          e.target.parentNode.innerHTML = '<span style="font-size: 40px;">👤</span>';
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: '40px' }}>👤</span>
                    )}
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
                      fontWeight: '500',
                      fontSize: '14px',
                      border: '2px solid #ffffff',
                      fontFamily: fontFamily,
                    }}>
                      1
                    </div>
                  </div>
                  <div className="podium-name" style={{ fontWeight: '600', color: colors.textPrimary, fontSize: '16px', marginBottom: '4px', fontFamily: fontFamily }}>
                    {leaderboardData[0].displayName}
                  </div>
                  <div className="podium-value" style={{ fontSize: '14px', fontWeight: '500', color: colors.accent, background: `${colors.accent}20`, padding: '4px 12px', borderRadius: '12px', display: 'inline-block', fontFamily: fontFamily }}>
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
                    background: leaderboardData[2].avatar && leaderboardData[2].avatar !== '👤' ? 'transparent' : '#ede0d4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px',
                    border: '2px solid #ffffff',
                    boxShadow: 'none',
                    position: 'relative',
                  }}>
                    {leaderboardData[2].avatar && leaderboardData[2].avatar !== '👤' ? (
                      <img 
                        src={`/images/${leaderboardData[2].avatar}`}
                        alt={leaderboardData[2].displayName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentNode.style.background = '#ede0d4';
                          e.target.parentNode.innerHTML = '<span style="font-size: 28px;">👤</span>';
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: '28px' }}>👤</span>
                    )}
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
                      fontWeight: '500',
                      fontSize: '11px',
                      border: '2px solid #ffffff',
                      fontFamily: fontFamily,
                    }}>
                      3
                    </div>
                  </div>
                  <div className="podium-name" style={{ fontWeight: '500', color: colors.textPrimary, fontSize: '13px', marginBottom: '4px', fontFamily: fontFamily }}>
                    {leaderboardData[2].displayName}
                  </div>
                  <div className="podium-value" style={{ fontSize: '12px', color: colors.textSecondary, background: colors.border, padding: '4px 10px', borderRadius: '12px', display: 'inline-block', fontFamily: fontFamily }}>
                    {getValue(leaderboardData[2])} {getUnit()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* LEADERBOARD TABLE - ONLY COLORS CHANGED */}
          <div style={{
            background: colors.surface,
            borderRadius: '12px',
            border: `1px solid ${colors.border}`,
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: `1px solid ${colors.border}`,
              background: colors.bg,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
            }}>
              <h3 style={{
                fontSize: '15px',
                fontWeight: '500',
                color: colors.textPrimary,
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: fontFamily,
              }}>
                <span style={{ fontSize: '18px', color: currentType.color }}>{currentType.icon}</span>
                {currentType.label} Ranking
              </h3>
              <span style={{
                fontSize: '12px',
                color: colors.textSecondary,
                background: colors.surface,
                padding: '4px 10px',
                borderRadius: '12px',
                border: `1px solid ${colors.border}`,
                fontFamily: fontFamily,
              }}>
                Total: {leaderboardData.length} players
              </span>
            </div>

            <div className="leaderboard-table" style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontFamily: fontFamily,
                minWidth: '500px',
              }}>
                <thead>
                  <tr style={{
                    background: colors.surface,
                    borderBottom: `1px solid ${colors.border}`,
                  }}>
                    <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: colors.textMuted, fontFamily: fontFamily }}>Rank</th>
                    <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: colors.textMuted, fontFamily: fontFamily }}>Player</th>
                    {isAdmin && <th className="email-col" style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: colors.textMuted, fontFamily: fontFamily }}>Email</th>}
                    <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: colors.textMuted, fontFamily: fontFamily }}>Level</th>
                    <th style={{ padding: '14px 20px', textAlign: 'right', fontSize: '12px', fontWeight: '500', color: colors.textMuted, fontFamily: fontFamily }}>{currentType.label}</th>
                    {isAdmin && <th className="actions-col" style={{ padding: '14px 20px', textAlign: 'center', fontSize: '12px', fontWeight: '500', color: colors.textMuted, fontFamily: fontFamily }}>Actions</th>}
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
                          borderBottom: index < leaderboardData.length - 1 ? `1px solid ${colors.border}` : 'none',
                          background: isCurrentUser ? `${colors.accent}15` : 'transparent',
                          transition: 'background 0.2s ease',
                        }}
                        onMouseOver={(e) => {
                          if (!isCurrentUser) {
                            e.currentTarget.style.background = colors.bg;
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
                                background: user.rank === 1 ? '#f5e9d3' : user.rank === 2 ? colors.bg : '#ede0d4',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: user.rank === 1 ? '#b38b40' : user.rank === 2 ? colors.textSecondary : '#8b6f4c',
                                fontWeight: '500',
                                fontSize: '10px',
                                fontFamily: fontFamily,
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
                                fontWeight: '400',
                                color: colors.textMuted,
                                fontFamily: fontFamily,
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
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              overflow: 'hidden',
                              background: user.avatar && user.avatar !== '👤' ? 'transparent' : `${currentType.color}20`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}>
                              {user.avatar && user.avatar !== '👤' ? (
                                <img 
                                  src={`/images/${user.avatar}`}
                                  alt={user.displayName}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentNode.style.background = `${currentType.color}20`;
                                    e.target.parentNode.innerHTML = '<span style="font-size: 18px;">👤</span>';
                                  }}
                                />
                              ) : (
                                <span style={{ fontSize: '18px', color: currentType.color }}>👤</span>
                              )}
                            </div>
                            <div>
                              <div className="player-name" style={{
                                fontSize: '14px',
                                fontWeight: '500',
                                color: colors.textPrimary,
                                marginBottom: '2px',
                                fontFamily: fontFamily,
                              }}>
                                {user.displayName}
                                {isCurrentUser && !isAdmin && (
                                  <span style={{
                                    marginLeft: '8px',
                                    fontSize: '10px',
                                    background: colors.accent,
                                    color: '#ffffff',
                                    padding: '2px 6px',
                                    borderRadius: '10px',
                                    fontWeight: '400',
                                    fontFamily: fontFamily,
                                  }}>
                                    You
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        {isAdmin && (
                          <td className="email-col" style={{ padding: '14px 20px', color: colors.textSecondary, fontSize: '13px', fontFamily: fontFamily }}>{user.email}</td>
                        )}
                        <td style={{ padding: '14px 20px' }}>
                          <span className="level-badge" style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            background: colors.bg,
                            color: colors.textSecondary,
                            fontFamily: fontFamily,
                          }}>
                            Level {user.stats?.level || user.progress?.level || 1}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                          <span className="value-display" style={{
                            fontSize: '16px',
                            fontWeight: '500',
                            color: currentType.color,
                            fontFamily: fontFamily,
                          }}>
                            {getValue(user).toLocaleString()}
                          </span>
                          <span style={{
                            fontSize: '11px',
                            color: colors.textMuted,
                            marginLeft: '4px',
                            fontFamily: fontFamily,
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
                                  background: colors.bg,
                                  border: `1px solid ${colors.border}`,
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  color: colors.textSecondary,
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  fontFamily: fontFamily,
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
                                  background: colors.bg,
                                  border: `1px solid ${colors.border}`,
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  color: colors.danger,
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  fontFamily: fontFamily,
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

          {/* USER'S RANK - ONLY COLORS CHANGED */}
          {!isAdmin && (
            <div className="leaderboard-user-rank" style={{
              marginTop: '24px',
              padding: '16px 24px',
              background: colors.bg,
              borderRadius: '12px',
              border: `1px solid ${colors.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
            }}>
              <span className="rank-label" style={{ color: colors.textSecondary, fontFamily: fontFamily }}>Your Current Rank</span>
              <span className="rank-value" style={{ 
                color: colors.textMuted, 
                fontWeight: '300',
                fontSize: '15px',
                fontFamily: fontFamily,
              }}>
                #{leaderboardData.findIndex(u => u.id === (currentUserId || localStorage.getItem('userId'))) + 1 || 'Not in leaderboard'}
              </span>
            </div>
          )}

          {/* FOOTER STATS - ONLY COLORS CHANGED */}
          {leaderboardData.length > 0 && (
            <div className="leaderboard-footer" style={{
              marginTop: '24px',
              padding: '20px',
              background: colors.bg,
              borderRadius: '16px',
              border: `1px solid ${colors.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '13px',
              color: colors.textSecondary,
              flexWrap: 'wrap',
              gap: '8px',
            }}>
              <div className="footer-stats" style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <span>🏆 Top Score: {leaderboardData.length > 0 ? getValue(leaderboardData[0]).toLocaleString() : 0} {getUnit()}</span>
                <span>📊 Average: {leaderboardData.length > 0 ? Math.round(leaderboardData.reduce((acc, u) => acc + getValue(u), 0) / leaderboardData.length).toLocaleString() : 0} {getUnit()}</span>
              </div>
              <span style={{ color: colors.accent, fontWeight: '400', fontFamily: fontFamily }}>
                Updated just now
              </span>
            </div>
          )}

          {/* EMPTY STATE - ONLY COLORS CHANGED */}
          {leaderboardData.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '80px 40px',
              background: colors.surface,
              borderRadius: '24px',
              border: `1px solid ${colors.border}`,
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: `${colors.accent}20`,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
              }}>
                <span style={{ fontSize: '40px', color: colors.accent }}>🏆</span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.textPrimary, marginBottom: '8px' }}>
                No data yet
              </h3>
              <p style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '24px' }}>
                Players will appear here once they start playing
              </p>
            </div>
          )}
        </>
      )}

      {/* PROFILE MODAL - ONLY COLORS CHANGED */}
      {showProfileModal && (
        <div className="profile-modal-overlay" onClick={closeProfileModal}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <button className="profile-modal-close" onClick={closeProfileModal}>✕</button>
            
            {profileLoading ? (
              <div className="profile-loading">
                <div className="spinner"></div>
                <p style={{ color: colors.textSecondary, fontFamily: fontFamily }}>Loading profile...</p>
              </div>
            ) : selectedProfile && (
              <div className="profile-content">
                <div className="profile-header-section">
                  <div className="profile-avatar-large">
                    {selectedProfile.avatar && selectedProfile.avatar !== '👤' ? (
                      <img 
                        src={`/images/${selectedProfile.avatar}`}
                        alt={selectedProfile.displayName}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentNode.innerHTML = '<span style="font-size: 40px;">👤</span>';
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: '40px' }}>👤</span>
                    )}
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
    </div>
  );
};

export default Leaderboards;