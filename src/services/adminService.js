// src/services/adminService.js
import { db } from '../pages/firebase';
import { 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  collection,
  query,
  where,
  getDocs,
  setDoc
} from 'firebase/firestore';
import { getLeaderboard, saveLeaderboard } from '../utils/streakHelper';

/**
 * Reset a user's stats to zero
 * @param {string} userId - The user ID to reset
 * @returns {Promise<Object>} - Result of the operation
 */
export const resetUserStats = async (userId) => {
  try {
    console.log('🔄 Resetting stats for user:', userId);
    
    // 1. Reset in Firebase
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const resetStats = {
        totalPoints: 0,
        wordsLearned: 0,
        gamesPlayed: 0,
        streak: 0,
        longestStreak: 0,
        level: 1,
        accuracy: 0,
        correctAnswers: 0,
        totalQuestions: 0,
        lastUpdated: new Date().toISOString()
      };
      
      await updateDoc(userRef, {
        stats: resetStats,
        'progress.totalPoints': 0,
        'progress.wordsLearned': 0,
        'progress.gamesPlayed': 0,
        'progress.streak': 0,
        'progress.longestStreak': 0,
        'progress.level': 1
      });
      
      console.log('✅ Firebase stats reset for user:', userId);
    }
    
    // 2. Reset in Local Storage
    const localData = getLeaderboard();
    const updatedLocal = localData.map(entry => {
      if (entry.userId === userId) {
        return {
          ...entry,
          totalPoints: 0,
          wordsLearned: 0,
          gamesPlayed: 0,
          streak: 0,
          level: 1,
          lastUpdated: new Date().toISOString()
        };
      }
      return entry;
    });
    
    saveLeaderboard(updatedLocal);
    console.log('✅ Local storage stats reset for user:', userId);
    
    return {
      success: true,
      message: 'User stats reset successfully',
      userId: userId
    };
  } catch (error) {
    console.error('❌ Error resetting user stats:', error);
    throw new Error(`Failed to reset stats: ${error.message}`);
  }
};

/**
 * Remove a user from the leaderboard (temporary hide)
 * User will reappear when they log in again
 * @param {string} userId - The user ID to remove
 * @returns {Promise<Object>} - Result of the operation
 */
export const removeUserFromLeaderboard = async (userId) => {
  try {
    console.log('🗑️ Removing user from leaderboard (temporary hide):', userId);
    
    // 1. Mark user as removed in Firebase (but keep their data)
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      // Just mark as removed from leaderboard - data stays intact
      await updateDoc(userRef, {
        removedFromLeaderboard: true,
        removedAt: new Date().toISOString()
      });
      console.log('✅ Firebase user marked as removed from leaderboard:', userId);
    }
    
    // 2. Remove from Local Storage
    const localData = getLeaderboard();
    const updatedLocal = localData.filter(entry => entry.userId !== userId);
    saveLeaderboard(updatedLocal);
    console.log('✅ Local storage user removed:', userId);
    
    return {
      success: true,
      message: 'User removed from leaderboard (will reappear on login)',
      userId: userId
    };
  } catch (error) {
    console.error('❌ Error removing user:', error);
    throw new Error(`Failed to remove user: ${error.message}`);
  }
};

/**
 * Restore a user to the leaderboard (when they log in)
 * @param {string} userId - The user ID to restore
 * @returns {Promise<Object>} - Result of the operation
 */
export const restoreUserToLeaderboard = async (userId) => {
  try {
    console.log('🔄 Restoring user to leaderboard:', userId);
    
    // Remove the removed flag from Firebase
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      await updateDoc(userRef, {
        removedFromLeaderboard: false,
        removedAt: null
      });
      console.log('✅ User restored to leaderboard:', userId);
      
      // Also update local storage with their latest data
      const data = userDoc.data();
      const stats = data.stats || {};
      const localData = getLeaderboard();
      
      // Check if user already exists in local leaderboard
      const existingIndex = localData.findIndex(entry => entry.userId === userId);
      
      const entry = {
        userId: userId,
        username: data.displayName || 'Player',
        avatar: data.avatar || '👤',
        email: data.email || '',
        level: stats.level || 1,
        totalPoints: stats.totalPoints || 0,
        gamesPlayed: stats.gamesPlayed || 0,
        streak: stats.streak || 0,
        longestStreak: stats.longestStreak || 0,
        wordsLearned: stats.wordsLearned || 0,
        lastUpdated: new Date().toISOString()
      };
      
      if (existingIndex !== -1) {
        localData[existingIndex] = entry;
      } else {
        localData.push(entry);
      }
      
      // Sort and save
      localData.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
      saveLeaderboard(localData);
      
      return {
        success: true,
        message: 'User restored to leaderboard',
        userId: userId
      };
    } else {
      return {
        success: false,
        message: 'User not found in Firebase',
        userId: userId
      };
    }
  } catch (error) {
    console.error('❌ Error restoring user:', error);
    throw new Error(`Failed to restore user: ${error.message}`);
  }
};

/**
 * Reset ALL users' stats (admin only)
 * @returns {Promise<Object>} - Result of the operation
 */
export const resetAllUserStats = async () => {
  try {
    console.log('🔄 Resetting ALL user stats...');
    
    // 1. Reset in Firebase
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    const resetPromises = snapshot.docs.map(async (doc) => {
      const resetStats = {
        totalPoints: 0,
        wordsLearned: 0,
        gamesPlayed: 0,
        streak: 0,
        longestStreak: 0,
        level: 1,
        accuracy: 0,
        correctAnswers: 0,
        totalQuestions: 0,
        lastUpdated: new Date().toISOString()
      };
      
      await updateDoc(doc.ref, {
        stats: resetStats,
        'progress.totalPoints': 0,
        'progress.wordsLearned': 0,
        'progress.gamesPlayed': 0,
        'progress.streak': 0,
        'progress.longestStreak': 0,
        'progress.level': 1,
        removedFromLeaderboard: false // Reset removed flag too
      });
    });
    
    await Promise.all(resetPromises);
    console.log('✅ All Firebase stats reset');
    
    // 2. Reset in Local Storage
    const localData = getLeaderboard();
    const updatedLocal = localData.map(entry => ({
      ...entry,
      totalPoints: 0,
      wordsLearned: 0,
      gamesPlayed: 0,
      streak: 0,
      level: 1,
      lastUpdated: new Date().toISOString()
    }));
    
    saveLeaderboard(updatedLocal);
    console.log('✅ All local storage stats reset');
    
    return {
      success: true,
      message: 'All user stats reset successfully',
      totalUsers: snapshot.size
    };
  } catch (error) {
    console.error('❌ Error resetting all stats:', error);
    throw new Error(`Failed to reset all stats: ${error.message}`);
  }
};

/**
 * Get user progress details
 */
export const getUserProgress = async (userId) => {
  try {
    // Check Firebase first
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        exists: true,
        source: 'firebase',
        stats: data.stats || {},
        progress: data.progress || {},
        email: data.email || '',
        displayName: data.displayName || 'Anonymous',
        removedFromLeaderboard: data.removedFromLeaderboard || false
      };
    }
    
    // Check local storage
    const localData = getLeaderboard();
    const localUser = localData.find(entry => entry.userId === userId);
    
    if (localUser) {
      return {
        exists: true,
        source: 'local',
        stats: {
          totalPoints: localUser.totalPoints || 0,
          wordsLearned: localUser.wordsLearned || 0,
          gamesPlayed: localUser.gamesPlayed || 0,
          streak: localUser.streak || 0,
          level: localUser.level || 1
        },
        displayName: localUser.username || 'Player'
      };
    }
    
    return {
      exists: false,
      source: 'none'
    };
  } catch (error) {
    console.error('❌ Error getting user progress:', error);
    throw error;
  }
};