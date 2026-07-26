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
    
    // Save to Firebase
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      displayName: username,
      avatar: avatar,
      email: email,
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
      }
    }, { merge: true });
    
    console.log('✅ Progress synced to Firebase!');
  } catch (error) {
    console.error('❌ Error syncing to Firebase:', error);
  }
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
 * Updates the leaderboard with current user data
 * @param {Object} progress - The current progress object
 */
export const updateLeaderboard = (progress) => {
  // Get user info from localStorage
  const userId = localStorage.getItem('userId') || 'guest';
  const username = localStorage.getItem('username') || 
                   localStorage.getItem('userEmail')?.split('@')[0] || 
                   'Player';
  
  // Get existing leaderboard
  const saved = localStorage.getItem('vocaboplay_leaderboard');
  let leaderboard = saved ? JSON.parse(saved) : [];
  
  // Check if user already exists
  const existingIndex = leaderboard.findIndex(entry => entry.userId === userId);
  
  // Create entry with EXACT data from progress
  const entry = {
    userId: userId,
    username: username,
    level: progress.level || 1,
    totalPoints: progress.totalPoints || 0,
    gamesPlayed: progress.gamesPlayed || 0,
    streak: progress.streak || 0,
    wordsLearned: progress.wordsLearned || 0,
    correctAnswers: progress.correctAnswers || 0,
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
  localStorage.setItem('vocaboplay_leaderboard', JSON.stringify(leaderboard));
  
  // Dispatch event for Leaderboards component
  window.dispatchEvent(new CustomEvent('leaderboardUpdate', { 
    detail: leaderboard 
  }));
  
  console.log('🏆 Leaderboard updated!', entry);
};