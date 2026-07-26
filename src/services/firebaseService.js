// src/services/firebaseService.js
import { db } from '../pages/firebase';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  deleteField,
  increment
} from 'firebase/firestore';

// ============================================================
// 1. VOCABULARY SERVICES (EXISTING - KEEP)
// ============================================================

export const getAllWords = async () => {
  try {
    const wordsRef = collection(db, 'words');
    const snapshot = await getDocs(wordsRef);
    const words = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log('✅ Fetched words from Firebase:', words.length);
    return words;
  } catch (error) {
    console.error('❌ Error fetching words:', error);
    return [];
  }
};

export const getWordsByCategory = async (category) => {
  try {
    const wordsRef = collection(db, 'words');
    const q = query(wordsRef, where('category', '==', category));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching words by category:', error);
    return [];
  }
};

export const getWordsByDifficulty = async (difficulty) => {
  try {
    const wordsRef = collection(db, 'words');
    const q = query(wordsRef, where('difficulty', '==', difficulty));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching words by difficulty:', error);
    return [];
  }
};

export const seedVocabulary = async () => {
  const vocabularyData = [
    { word: 'Participate', definition: 'To take part in an activity or discussion.', category: 'action', difficulty: 'easy', points: 5 },
    { word: 'Concentrate', definition: 'To focus all your attention on something.', category: 'focus', difficulty: 'easy', points: 5 },
    { word: 'Summarize', definition: 'To give a brief statement of the main points.', category: 'communication', difficulty: 'easy', points: 5 },
    { word: 'Analyze', definition: 'To examine something in detail.', category: 'analysis', difficulty: 'medium', points: 10 },
    { word: 'Collaborate', definition: 'To work together with others.', category: 'collaboration', difficulty: 'medium', points: 10 },
    { word: 'Demonstrate', definition: 'To show clearly with proof.', category: 'action', difficulty: 'medium', points: 10 },
    { word: 'Investigate', definition: 'To examine carefully to find facts.', category: 'analysis', difficulty: 'hard', points: 15 },
    { word: 'Communicate', definition: 'To share information with others.', category: 'communication', difficulty: 'hard', points: 15 },
    { word: 'Organize', definition: 'To arrange things in an orderly way.', category: 'action', difficulty: 'easy', points: 5 },
    { word: 'Observe', definition: 'To watch carefully and notice details.', category: 'focus', difficulty: 'easy', points: 5 },
    { word: 'Explain', definition: 'To make something clear.', category: 'communication', difficulty: 'easy', points: 5 },
    { word: 'Compare', definition: 'To find similarities and differences.', category: 'analysis', difficulty: 'medium', points: 10 },
    { word: 'Predict', definition: 'To say what will happen.', category: 'analysis', difficulty: 'medium', points: 10 },
    { word: 'Create', definition: 'To bring something into existence.', category: 'creativity', difficulty: 'easy', points: 5 },
    { word: 'Evaluate', definition: 'To judge the value of something.', category: 'analysis', difficulty: 'hard', points: 15 },
  ];

  try {
    const wordsRef = collection(db, 'words');
    for (const word of vocabularyData) {
      await addDoc(wordsRef, {
        ...word,
        createdAt: serverTimestamp()
      });
    }
    console.log('✅ Vocabulary seeded successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error seeding vocabulary:', error);
    return false;
  }
};

// ============================================================
// 2. USER STATS SERVICES (NEW - FOR LEADERBOARDS)
// ============================================================

// ✅ GET USER STATS
export const getUserStats = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        stats: data.stats || null,
        gameStats: data.gameStats || null,
        progress: data.progress || null,
        displayName: data.displayName || 'Player'
      };
    }
    return null;
  } catch (error) {
    console.error('❌ Error getting user stats:', error);
    return null;
  }
};

// ✅ UPDATE USER STATS AFTER GAME (MAIN FUNCTION)
export const updateUserStats = async (userId, gameData) => {
  try {
    console.log('🔄 Updating stats for user:', userId);
    console.log('📊 Game data:', gameData);
    
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    // If user doesn't exist, create with default stats
    if (!userSnap.exists()) {
      console.log('⚠️ User not found, creating new user...');
      await createNewUser(userId);
    }
    
    // Get current data
    const userData = (await getDoc(userRef)).data();
    const currentStats = userData.stats || {};
    const currentAchievements = userData.progress?.achievements || {};
    const currentGameStats = userData.gameStats?.[gameData.gameType] || {};
    
    // ========== CALCULATE NEW STATS ==========
    
    // 1. Overall Stats
    const newTotalPoints = (currentStats.totalPoints || 0) + gameData.pointsEarned;
    const newWordsLearned = (currentStats.wordsLearned || 0) + gameData.newWordsLearned;
    const newGamesPlayed = (currentStats.gamesPlayed || 0) + 1;
    const newCorrectAnswers = (currentStats.correctAnswers || 0) + gameData.correctAnswers;
    const newTotalQuestions = (currentStats.totalQuestions || 0) + gameData.totalQuestions;
    
    // Calculate accuracy
    const newAccuracy = newTotalQuestions > 0 
      ? Math.round((newCorrectAnswers / newTotalQuestions) * 100)
      : 0;
    
    // Calculate streak
    let newCurrentStreak = 0;
    if (gameData.won) {
      newCurrentStreak = (currentStats.currentStreak || 0) + 1;
    }
    const newLongestStreak = Math.max(
      currentStats.longestStreak || 0,
      newCurrentStreak
    );
    
    // Calculate level (1 level per 100 points)
    const newLevel = Math.floor(newTotalPoints / 100) + 1;
    const newXpProgress = newTotalPoints % 100;
    
    // 2. Per-Game Stats
    const newGameStats = {
      gamesPlayed: (currentGameStats.gamesPlayed || 0) + 1,
      bestScore: Math.max(currentGameStats.bestScore || 0, gameData.pointsEarned),
      correctAnswers: (currentGameStats.correctAnswers || 0) + gameData.correctAnswers,
      totalQuestions: (currentGameStats.totalQuestions || 0) + gameData.totalQuestions,
      level: Math.floor(((currentGameStats.gamesPlayed || 0) + 1) / 5) + 1 // Level up every 5 games
    };
    
    // ========== CHECK ACHIEVEMENTS ==========
    const newAchievements = { ...currentAchievements };
    const unlocked = [];
    
    if (newGamesPlayed >= 1 && !newAchievements.firstGame) {
      newAchievements.firstGame = true;
      unlocked.push('🎯 First Game!');
    }
    if (newWordsLearned >= 10 && !newAchievements.tenWords) {
      newAchievements.tenWords = true;
      unlocked.push('📚 10 Words Learned!');
    }
    if (newLongestStreak >= 3 && !newAchievements.threeDayStreak) {
      newAchievements.threeDayStreak = true;
      unlocked.push('🔥 3-Day Streak!');
    }
    if (newAccuracy === 100 && !newAchievements.perfectScore) {
      newAchievements.perfectScore = true;
      unlocked.push('⭐ Perfect Score!');
    }
    if (newGamesPlayed >= 10 && !newAchievements.speedDemon) {
      newAchievements.speedDemon = true;
      unlocked.push('⚡ Speed Demon!');
    }
    if (newLevel >= 10 && !newAchievements.masterLearner) {
      newAchievements.masterLearner = true;
      unlocked.push('🏅 Master Learner!');
    }
    if (newWordsLearned >= 50 && !newAchievements.vocabularyMaster) {
      newAchievements.vocabularyMaster = true;
      unlocked.push('🎓 Vocabulary Master!');
    }
    
    // ========== UPDATE FIREBASE ==========
    
    // Update overall stats
    await updateDoc(userRef, {
      'stats.totalPoints': newTotalPoints,
      'stats.wordsLearned': newWordsLearned,
      'stats.gamesPlayed': newGamesPlayed,
      'stats.currentStreak': newCurrentStreak,
      'stats.longestStreak': newLongestStreak,
      'stats.level': newLevel,
      'stats.xpProgress': newXpProgress,
      'stats.accuracy': newAccuracy,
      'stats.correctAnswers': newCorrectAnswers,
      'stats.totalQuestions': newTotalQuestions,
      'progress.achievements': newAchievements,
      'lastUpdated': serverTimestamp()
    });
    
    // Update per-game stats
    await updateDoc(userRef, {
      [`gameStats.${gameData.gameType}`]: newGameStats
    });
    
    console.log('✅ Stats updated successfully!');
    console.log('📊 New stats:', {
      totalPoints: newTotalPoints,
      wordsLearned: newWordsLearned,
      gamesPlayed: newGamesPlayed,
      level: newLevel,
      accuracy: newAccuracy
    });
    
    if (unlocked.length > 0) {
      console.log('🏆 New Achievements Unlocked:', unlocked);
    }
    
    // Save to localStorage as backup
    localStorage.setItem('userStats', JSON.stringify({
      stats: {
        totalPoints: newTotalPoints,
        wordsLearned: newWordsLearned,
        gamesPlayed: newGamesPlayed,
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        level: newLevel,
        xpProgress: newXpProgress,
        accuracy: newAccuracy,
        correctAnswers: newCorrectAnswers,
        totalQuestions: newTotalQuestions
      }
    }));
    
    return { 
      stats: {
        totalPoints: newTotalPoints,
        wordsLearned: newWordsLearned,
        gamesPlayed: newGamesPlayed,
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        level: newLevel,
        xpProgress: newXpProgress,
        accuracy: newAccuracy,
        correctAnswers: newCorrectAnswers,
        totalQuestions: newTotalQuestions
      },
      achievements: unlocked
    };
    
  } catch (error) {
    console.error('❌ Error updating stats:', error);
    
    // Save to localStorage as fallback
    const pendingData = {
      userId: userId,
      gameData: gameData,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('pendingGameData', JSON.stringify(pendingData));
    
    throw error;
  }
};

// ✅ CREATE NEW USER
export const createNewUser = async (userId, displayName = 'Player') => {
  try {
    const userRef = doc(db, 'users', userId);
    
    await setDoc(userRef, {
      displayName: displayName,
      createdAt: serverTimestamp(),
      lastUpdated: serverTimestamp(),
      
      stats: {
        totalPoints: 0,
        wordsLearned: 0,
        gamesPlayed: 0,
        currentStreak: 0,
        longestStreak: 0,
        level: 1,
        xpProgress: 0,
        accuracy: 0,
        correctAnswers: 0,
        totalQuestions: 0
      },
      
      gameStats: {
        wordPics: {
          gamesPlayed: 0,
          bestScore: 0,
          correctAnswers: 0,
          totalQuestions: 0,
          level: 1
        },
        quizMaster: {
          gamesPlayed: 0,
          bestScore: 0,
          correctAnswers: 0,
          totalQuestions: 0,
          level: 1
        },
        matchGame: {
          gamesPlayed: 0,
          bestScore: 0,
          correctAnswers: 0,
          totalQuestions: 0,
          level: 1,
          bestMoves: 0,
          bestTime: 0,
          perfectGames: 0,
          totalPairs: 0
        },
        guessWhat: {
          gamesPlayed: 0,
          bestScore: 0,
          correctAnswers: 0,
          totalQuestions: 0,
          level: 1
        },
        sentenceBuilder: {
          gamesPlayed: 0,
          bestScore: 0,
          correctAnswers: 0,
          totalSentences: 0,
          level: 1
        },
        shortStory: {
          storiesCompleted: 0,
          chaptersRead: 0,
          quizzesPassed: 0,
          level: 1
        }
      },
      
      progress: {
        achievements: {
          firstGame: false,
          masterLearner: false,
          perfectScore: false,
          speedDemon: false,
          tenWords: false,
          threeDayStreak: false,
          vocabularyMaster: false
        },
        flashcards: {
          cardsViewed: 0
        },
        knownWords: [],
        masteredWords: [],
        sessionsCompleted: 0
      }
    });
    
    console.log('✅ New user created successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error creating user:', error);
    return false;
  }
};

// ✅ SYNC PENDING DATA
export const syncPendingData = async () => {
  const pendingData = localStorage.getItem('pendingGameData');
  if (pendingData) {
    try {
      const data = JSON.parse(pendingData);
      await updateUserStats(data.userId, data.gameData);
      localStorage.removeItem('pendingGameData');
      console.log('✅ Synced pending data successfully!');
      return true;
    } catch (error) {
      console.error('❌ Failed to sync pending data:', error);
      return false;
    }
  }
  return true;
};

// ✅ UPDATE DISPLAY NAME
export const updateDisplayName = async (userId, newName) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      displayName: newName,
      lastUpdated: serverTimestamp()
    });
    console.log('✅ Display name updated!');
    return true;
  } catch (error) {
    console.error('❌ Error updating display name:', error);
    return false;
  }
};

// ============================================================
// 3. LEADERBOARD SERVICES (NEW)
// ============================================================

// ✅ GET LEADERBOARD (REAL-TIME)
export const getLeaderboard = (category = 'totalPoints', limitCount = 20, callback) => {
  // Categories: 'totalPoints', 'wordsLearned', 'gamesPlayed', 'longestStreak'
  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('stats', '!=', null),
      orderBy(`stats.${category}`, 'desc'),
      limit(limitCount)
    );
    
    return onSnapshot(q, (snapshot) => {
      const data = [];
      let rank = 1;
      
      snapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.stats) {
          data.push({
            id: doc.id,
            rank: rank++,
            displayName: userData.displayName || 'Anonymous',
            level: userData.stats.level || 1,
            totalPoints: userData.stats.totalPoints || 0,
            wordsLearned: userData.stats.wordsLearned || 0,
            gamesPlayed: userData.stats.gamesPlayed || 0,
            longestStreak: userData.stats.longestStreak || 0,
            accuracy: userData.stats.accuracy || 0
          });
        }
      });
      
      if (callback) callback(data);
    }, (error) => {
      console.error('❌ Leaderboard error:', error);
      if (callback) callback([]);
    });
    
  } catch (error) {
    console.error('❌ Error getting leaderboard:', error);
    if (callback) callback([]);
    return () => {};
  }
};

// ✅ GET LEADERBOARD (ONE-TIME)
export const getLeaderboardOnce = async (category = 'totalPoints', limitCount = 20) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('stats', '!=', null),
      orderBy(`stats.${category}`, 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    const data = [];
    let rank = 1;
    
    snapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData.stats) {
        data.push({
          id: doc.id,
          rank: rank++,
          displayName: userData.displayName || 'Anonymous',
          level: userData.stats.level || 1,
          totalPoints: userData.stats.totalPoints || 0,
          wordsLearned: userData.stats.wordsLearned || 0,
          gamesPlayed: userData.stats.gamesPlayed || 0,
          longestStreak: userData.stats.longestStreak || 0,
          accuracy: userData.stats.accuracy || 0
        });
      }
    });
    
    return data;
  } catch (error) {
    console.error('❌ Error getting leaderboard:', error);
    return [];
  }
};

// ============================================================
// 4. OLD USER PROGRESS (KEEP FOR COMPATIBILITY)
// ============================================================

export const getUserProgress = async (userId) => {
  try {
    const progressRef = doc(db, 'userProgress', userId);
    const progressDoc = await getDoc(progressRef);
    
    if (progressDoc.exists()) {
      console.log('✅ Found existing progress for user:', userId);
      return progressDoc.data();
    } else {
      // Create default progress
      const defaultProgress = {
        userId: userId,
        level: 1,
        xp: 0,
        totalPoints: 0,
        streak: 0,
        gamesPlayed: 0,
        wordsLearned: 0,
        correctAnswers: 0,
        totalAnswers: 0,
        lastActive: new Date().toISOString(),
        flashcards: { cardsViewed: 0, knownWords: [], masteredWords: [], sessionsCompleted: 0 },
        quiz: { gamesCompleted: 0, correctAnswers: 0, totalQuestions: 0, bestScore: 0 },
        match: { gamesCompleted: 0, totalPairs: 0, totalMoves: 0, bestTime: 0, bestMoves: 0, perfectGames: 0 },
        guessWhat: { gamesCompleted: 0, correctAnswers: 0, totalQuestions: 0, bestScore: 0 },
        sentenceBuilder: { gamesCompleted: 0, correctAnswers: 0, totalSentences: 0, bestScore: 0 },
        shortStory: { chaptersRead: 0, quizzesPassed: 0, storiesCompleted: 0 },
        achievements: {
          firstGame: false,
          perfectScore: false,
          threeDayStreak: false,
          tenWords: false,
          masterLearner: false,
          speedDemon: false,
          vocabularyMaster: false
        }
      };
      
      await setDoc(progressRef, defaultProgress);
      console.log('✅ Created default progress for user:', userId);
      return defaultProgress;
    }
  } catch (error) {
    console.error('❌ Error getting user progress:', error);
    return null;
  }
};

export const updateUserProgress = async (userId, updates) => {
  try {
    console.log('🔵 SAVING TO FIREBASE:', { userId, updates });
    
    const progressRef = doc(db, 'userProgress', userId);
    const progressDoc = await getDoc(progressRef);
    let currentProgress = {};
    
    if (progressDoc.exists()) {
      currentProgress = progressDoc.data();
    }
    
    const newProgress = {
      ...currentProgress,
      ...updates,
      lastUpdated: serverTimestamp(),
      lastActive: new Date().toISOString()
    };
    
    if (newProgress.xp !== undefined) {
      newProgress.level = Math.floor(newProgress.xp / 100) + 1;
    }
    
    if (!newProgress.achievements) {
      newProgress.achievements = {};
    }
    
    if (newProgress.gamesPlayed >= 1 && !newProgress.achievements.firstGame) {
      newProgress.achievements.firstGame = true;
    }
    if (newProgress.wordsLearned >= 10 && !newProgress.achievements.tenWords) {
      newProgress.achievements.tenWords = true;
    }
    if (updates.achievements?.perfectScore) {
      newProgress.achievements.perfectScore = true;
    }
    
    await setDoc(progressRef, newProgress, { merge: true });
    
    console.log('✅ PROGRESS SAVED TO FIREBASE SUCCESSFULLY!');
    return true;
    
  } catch (error) {
    console.error('❌ FIREBASE ERROR:', error);
    return false;
  }
};