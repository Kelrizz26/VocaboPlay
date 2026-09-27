// src/utils/streakHelper.js

/**
 * Updates the user's streak in localStorage
 * @returns {number} The updated streak count
 */
export const updateStreak = () => {
  const today = new Date().toDateString();
  const lastPlayed = localStorage.getItem('vocaboplay_lastPlayed');
  
  // Get current progress
  const saved = localStorage.getItem('vocaboplay_progress');
  const currentProgress = saved ? JSON.parse(saved) : {};
  let currentStreak = currentProgress.streak || 0;
  
  // If already played today, return current streak
  if (lastPlayed === today) {
    return currentStreak;
  }
  
  // Check if played yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();
  
  let newStreak;
  if (lastPlayed === yesterdayStr) {
    // Played yesterday - increment streak
    newStreak = currentStreak + 1;
  } else {
    // Streak broken - reset to 1
    newStreak = 1;
  }
  
  // Save to localStorage
  localStorage.setItem('vocaboplay_lastPlayed', today);
  
  // Update progress
  if (saved) {
    const updatedProgress = {
      ...currentProgress,
      streak: newStreak
    };
    localStorage.setItem('vocaboplay_progress', JSON.stringify(updatedProgress));
  }
  
  return newStreak;
};

/**
 * Saves progress with streak update and syncs to Firebase
 * @param {Object} progressData - The progress data to save
 * @returns {Object} The updated progress
 */
export const saveProgressWithStreak = async (progressData) => {
  // Update streak first
  const newStreak = updateStreak();
  
  // Get existing progress
  const saved = localStorage.getItem('vocaboplay_progress');
  const currentProgress = saved ? JSON.parse(saved) : {};
  
  // Merge with new data
  const updatedProgress = {
    ...currentProgress,
    ...progressData,
    streak: newStreak
  };
  
  // Save to localStorage
  localStorage.setItem('vocaboplay_progress', JSON.stringify(updatedProgress));
  
  // 👇 SYNC TO FIREBASE - PARA MAGKAPAREHO SILA
  await syncToFirebase(updatedProgress);
  
  // Update leaderboard in localStorage
  updateLeaderboard(updatedProgress);
  
  // Dispatch event for MyProgress component
  window.dispatchEvent(new CustomEvent('progressUpdate', { 
    detail: updatedProgress 
  }));
  
  return updatedProgress;
};

/**
 * Syncs progress to Firebase
 * @param {Object} progress - The progress data to sync
 */
const syncToFirebase = async (progress) => {
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.log('No user logged in, skipping Firebase sync');
      return;
    }
    
    // Get user info
    const username = localStorage.getItem('username') || 
                     localStorage.getItem('userEmail')?.split('@')[0] || 
                     'Player';
    const avatar = localStorage.getItem('avatar') || '👤';
    const email = localStorage.getItem('userEmail') || '';
    
    // Import Firebase dynamically
    const { db } = await import('../pages/firebase');
    const { doc, setDoc } = await import('firebase/firestore');
    
    // Save to Firebase - preserve removedFromLeaderboard flag if it exists
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const existingData = userDoc.exists() ? userDoc.data() : {};
    
    await setDoc(userRef, {
      displayName: username,
      avatar: avatar,
      email: email,
      stats: {
        totalPoints: progress.totalPoints || 0,
        wordsLearned: progress.wordsLearned || 0,
        streak: progress.streak || 0,
        longestStreak: progress.longestStreak || progress.streak || 0,
        gamesPlayed: progress.gamesPlayed || 0,
        level: progress.level || 1,
        correctAnswers: progress.correctAnswers || 0,
        totalQuestions: progress.totalQuestions || progress.totalAnswers || 0,
        accuracy: progress.accuracy || 0,
        lastUpdated: new Date().toISOString()
      },
      progress: {
        totalPoints: progress.totalPoints || 0,
        wordsLearned: progress.wordsLearned || 0,
        streak: progress.streak || 0,
        gamesPlayed: progress.gamesPlayed || 0,
        level: progress.level || 1,
        correctAnswers: progress.correctAnswers || 0,
        totalAnswers: progress.totalAnswers || 0,
        // Include game-specific stats
        wordPics: progress.wordPics || {},
        quiz: progress.quiz || {},
        match: progress.match || {},
        guessWhat: progress.guessWhat || {},
        sentenceBuilder: progress.sentenceBuilder || {},
        shortStory: progress.shortStory || {},
        achievements: progress.achievements || {}
      },
      // Preserve removedFromLeaderboard flag if it exists
      removedFromLeaderboard: existingData.removedFromLeaderboard || false
    }, { merge: true });
    
    console.log('✅ Progress synced to Firebase!');
  } catch (error) {
    console.error('❌ Error syncing to Firebase:', error);
  }
};

// Helper to get document
const getDoc = async (docRef) => {
  const { getDoc } = await import('firebase/firestore');
  return getDoc(docRef);
};

/**
 * Gets the current streak
 * @returns {number} The current streak count
 */
export const getStreak = () => {
  const saved = localStorage.getItem('vocaboplay_progress');
  if (saved) {
    const progress = JSON.parse(saved);
    return progress.streak || 0;
  }
  return 0;
};

/**
 * Checks if user played today
 * @returns {boolean} True if played today
 */
export const hasPlayedToday = () => {
  const today = new Date().toDateString();
  const lastPlayed = localStorage.getItem('vocaboplay_lastPlayed');
  return lastPlayed === today;
};

// ============================================================
// ===== LEADERBOARD FUNCTIONS =====
// ============================================================

/**
 * Gets the leaderboard data from localStorage
 * @returns {Array} Array of leaderboard entries
 */
export const getLeaderboard = () => {
  const saved = localStorage.getItem('vocaboplay_leaderboard');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading leaderboard:', e);
      return [];
    }
  }
  return [];
};

/**
 * Saves the leaderboard data to localStorage
 * @param {Array} data - The leaderboard data to save
 */
export const saveLeaderboard = (data) => {
  try {
    localStorage.setItem('vocaboplay_leaderboard', JSON.stringify(data));
    console.log('✅ Leaderboard saved to localStorage');
  } catch (e) {
    console.error('Error saving leaderboard:', e);
  }
};

/**
 * Updates the leaderboard with current user data
 * @param {Object} progress - The current progress object
 */
export const updateLeaderboard = (progress) => {
  // Get user info from localStorage
  const userId = localStorage.getItem('userId') || 'guest';
  const username = localStorage.getItem('username') || 
                   localStorage.getItem('userEmail')?.split('@')[0] || 
                   'Player';
  const avatar = localStorage.getItem('avatar') || '👤';
  const email = localStorage.getItem('userEmail') || '';
  
  // Get existing leaderboard
  let leaderboard = getLeaderboard();
  
  // Check if user already exists
  const existingIndex = leaderboard.findIndex(entry => entry.userId === userId);
  
  // Create entry with EXACT data from progress
  const entry = {
    userId: userId,
    username: username,
    avatar: avatar,
    email: email,
    level: progress.level || 1,
    totalPoints: progress.totalPoints || 0,
    gamesPlayed: progress.gamesPlayed || 0,
    streak: progress.streak || 0,
    longestStreak: progress.longestStreak || progress.streak || 0,
    wordsLearned: progress.wordsLearned || 0,
    correctAnswers: progress.correctAnswers || 0,
    totalAnswers: progress.totalAnswers || 0,
    accuracy: progress.accuracy || 0,
    lastUpdated: new Date().toISOString()
  };
  
  if (existingIndex !== -1) {
    // Update existing - OVERWRITE WITH LATEST DATA
    leaderboard[existingIndex] = {
      ...leaderboard[existingIndex],
      ...entry
    };
  } else {
    // Add new
    leaderboard.push(entry);
  }
  
  // Sort by totalPoints descending
  leaderboard.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
  
  // Keep top 100
  if (leaderboard.length > 100) {
    leaderboard = leaderboard.slice(0, 100);
  }
  
  // Save to localStorage
  saveLeaderboard(leaderboard);
  
  // Dispatch event for Leaderboards component
  window.dispatchEvent(new CustomEvent('leaderboardUpdate', { 
    detail: leaderboard 
  }));
  
  console.log('🏆 Leaderboard updated!', entry);
};

/**
 * Check if user was removed from leaderboard and restore them on login
 * @param {string} userId - The user ID
 * @returns {Promise<boolean>} - True if restored
 */
export const checkAndRestoreUserOnLogin = async (userId) => {
  try {
    // Get user data from Firebase
    const { db } = await import('../pages/firebase');
    const { doc, getDoc } = await import('firebase/firestore');
    
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      
      // If user was removed from leaderboard, restore them
      if (data.removedFromLeaderboard === true) {
        console.log('🔄 User was removed, restoring on login...');
        const { restoreUserToLeaderboard } = await import('../services/adminService');
        const result = await restoreUserToLeaderboard(userId);
        return result.success;
      }
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error checking user restoration:', error);
    return false;
  }
};

/**
 * Resets a user's stats in the leaderboard
 * @param {string} userId - The user ID to reset
 * @returns {boolean} Success or failure
 */
export const resetUserLeaderboard = (userId) => {
  try {
    let leaderboard = getLeaderboard();
    
    const userIndex = leaderboard.findIndex(entry => entry.userId === userId);
    
    if (userIndex !== -1) {
      // Reset all stats to 0
      leaderboard[userIndex] = {
        ...leaderboard[userIndex],
        level: 1,
        totalPoints: 0,
        gamesPlayed: 0,
        streak: 0,
        longestStreak: 0,
        wordsLearned: 0,
        correctAnswers: 0,
        totalAnswers: 0,
        accuracy: 0,
        lastUpdated: new Date().toISOString()
      };
      
      saveLeaderboard(leaderboard);
      console.log('✅ User stats reset in leaderboard:', userId);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error resetting user leaderboard:', error);
    return false;
  }
};

/**
 * Removes a user from the leaderboard
 * @param {string} userId - The user ID to remove
 * @returns {boolean} Success or failure
 */
export const removeUserFromLocalLeaderboard = (userId) => {
  try {
    let leaderboard = getLeaderboard();
    const initialLength = leaderboard.length;
    
    leaderboard = leaderboard.filter(entry => entry.userId !== userId);
    
    if (leaderboard.length < initialLength) {
      saveLeaderboard(leaderboard);
      console.log('✅ User removed from leaderboard:', userId);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error removing user from leaderboard:', error);
    return false;
  }
};

/**
 * Resets ALL users in the leaderboard
 * @returns {number} Number of users reset
 */
export const resetAllLeaderboard = () => {
  try {
    let leaderboard = getLeaderboard();
    const count = leaderboard.length;
    
    leaderboard = leaderboard.map(entry => ({
      ...entry,
      level: 1,
      totalPoints: 0,
      gamesPlayed: 0,
      streak: 0,
      longestStreak: 0,
      wordsLearned: 0,
      correctAnswers: 0,
      totalAnswers: 0,
      accuracy: 0,
      lastUpdated: new Date().toISOString()
    }));
    
    saveLeaderboard(leaderboard);
    console.log('✅ All leaderboard stats reset, users:', count);
    return count;
  } catch (error) {
    console.error('❌ Error resetting all leaderboard:', error);
    return 0;
  }
};

/**
 * Gets user's rank in leaderboard
 * @param {string} userId - The user ID
 * @returns {number} The user's rank (1-based), or -1 if not found
 */
export const getUserRank = (userId) => {
  const leaderboard = getLeaderboard();
  const index = leaderboard.findIndex(entry => entry.userId === userId);
  return index !== -1 ? index + 1 : -1;
};

/**
 * Gets top N users from leaderboard
 * @param {number} limit - Number of users to get
 * @returns {Array} Array of top users
 */
export const getTopUsers = (limit = 10) => {
  const leaderboard = getLeaderboard();
  return leaderboard.slice(0, limit);
};

/**
 * Clears the entire leaderboard
 * @returns {boolean} Success or failure
 */
export const clearLeaderboard = () => {
  try {
    localStorage.removeItem('vocaboplay_leaderboard');
    console.log('✅ Leaderboard cleared');
    return true;
  } catch (error) {
    console.error('❌ Error clearing leaderboard:', error);
    return false;
  }
};

/**
 * Gets the leaderboard with user details
 * @param {string} userId - Optional user ID to highlight
 * @returns {Array} Array of leaderboard entries with rank
 */
export const getLeaderboardWithRank = (userId = null) => {
  const leaderboard = getLeaderboard();
  
  // Add rank to each entry
  const ranked = leaderboard.map((entry, index) => ({
    ...entry,
    rank: index + 1,
    isCurrentUser: userId ? entry.userId === userId : false
  }));
  
  return ranked;
};

export default {
  updateStreak,
  saveProgressWithStreak,
  getStreak,
  hasPlayedToday,
  getLeaderboard,
  saveLeaderboard,
  updateLeaderboard,
  resetUserLeaderboard,
  removeUserFromLocalLeaderboard,
  resetAllLeaderboard,
  getUserRank,
  getTopUsers,
  clearLeaderboard,
  getLeaderboardWithRank,
  checkAndRestoreUserOnLogin
};