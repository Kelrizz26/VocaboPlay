// src/services/diamondService.js
// ============================================================
// 💎 DIAMOND SERVICE
// Shared utility for diamond earnings, spending, and anti-farm logic
// ============================================================
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../pages/firebase';

// ============================================================
// GAME DIFFICULTY MULTIPLIERS
// ============================================================
export const GAME_DIFFICULTY = {
  synoQuest: 1.5,    // ⭐ Pinaka-mahirap (timer, lives, blanks)
  shortStory: 1.5,   // Mahirap (reading comprehension)
  quiz: 1.0,         // Medium
  guessWhat: 1.0,    // Medium
  match: 0.5,        // Easy (memory game)
};

// ============================================================
// DIAMOND REWARDS LOGIC
// ============================================================
export const DIAMOND_REWARDS = {
  // Base diamonds by accuracy
  getBaseDiamonds: (accuracy) => {
    if (accuracy < 50) return 0;   // Failed
    if (accuracy < 70) return 1;   // Okay
    if (accuracy < 90) return 2;   // Good
    if (accuracy < 100) return 3;  // Great
    return 5;                       // ⭐ PERFECT
  },

  // Anti-farm: diminishing returns per attempt today
  getAttemptMultiplier: (attemptNumber) => {
    if (attemptNumber <= 1) return 1.0;   // 1st play
    if (attemptNumber === 2) return 0.5;  // 2nd play
    if (attemptNumber === 3) return 0.25; // 3rd play
    return 0;                              // 4th+ = no rewards
  },

  // Compute final diamonds earned
  calculate: (gameId, accuracy, attemptNumber) => {
    const baseDiamonds = DIAMOND_REWARDS.getBaseDiamonds(accuracy);
    const difficultyMultiplier = GAME_DIFFICULTY[gameId] || 1.0;
    const attemptMultiplier = DIAMOND_REWARDS.getAttemptMultiplier(attemptNumber);
    const earned = Math.floor(baseDiamonds * difficultyMultiplier * attemptMultiplier);
    
    return {
      earned,
      baseDiamonds,
      difficultyMultiplier,
      attemptMultiplier,
    };
  },
};

// ============================================================
// HEART PRICES (Diamond costs)
// ============================================================
export const HEART_PRICES = [
  { id: 'one', hearts: 1, diamonds: 5, label: '1 Heart', sublabel: 'Quick fix' },
  { id: 'three', hearts: 3, diamonds: 12, label: '3 Hearts', sublabel: 'Save 3 💎', popular: true },
  { id: 'five', hearts: 5, diamonds: 18, label: 'Full Refill', sublabel: 'Save 7 💎' },
];

// ============================================================
// CLAIM DIAMONDS after playing a game
// ============================================================
export const claimGameDiamonds = async (userId, gameId, accuracy) => {
  if (!userId || !gameId) return { earned: 0, reason: 'invalid' };

  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return { earned: 0, reason: 'no-user' };

    const userData = userSnap.data();
    const today = new Date().toDateString();

    // Load today's attempts (reset if new day)
    let attemptsToday = userData.diamondsAttemptsToday || {};
    let dateKey = userData.diamondsAttemptsDate || '';
    if (dateKey !== today) {
      attemptsToday = {};
      dateKey = today;
    }

    // This is the attempt number for this game today
    const attemptNumber = (attemptsToday[gameId] || 0) + 1;

    // Calculate diamonds
    const result = DIAMOND_REWARDS.calculate(gameId, accuracy, attemptNumber);
    const earned = result.earned;

    // Update attempts
    attemptsToday[gameId] = attemptNumber;

    // Update Firestore
    const currentDiamonds = userData.totalDiamonds || 0;
    const newDiamonds = currentDiamonds + earned;

    await updateDoc(userRef, {
      totalDiamonds: newDiamonds,
      diamondsAttemptsToday: attemptsToday,
      diamondsAttemptsDate: dateKey,
    });

    console.log(`💎 [DiamondService] ${gameId}: +${earned} 💎`, {
      accuracy,
      attemptNumber,
      base: result.baseDiamonds,
      diff: result.difficultyMultiplier,
      attempt: result.attemptMultiplier,
    });

    return {
      earned,
      newBalance: newDiamonds,
      attemptNumber,
      breakdown: result,
    };
  } catch (err) {
    console.error('❌ [DiamondService] claimGameDiamonds error:', err);
    return { earned: 0, reason: 'error' };
  }
};

// ============================================================
// SPEND DIAMONDS (for buying hearts, etc.)
// ============================================================
export const spendDiamonds = async (userId, amount) => {
  if (!userId || amount <= 0) return { success: false, reason: 'invalid' };

  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return { success: false, reason: 'no-user' };

    const userData = userSnap.data();
    const currentDiamonds = userData.totalDiamonds || 0;

    if (currentDiamonds < amount) {
      return { success: false, reason: 'insufficient' };
    }

    const newDiamonds = currentDiamonds - amount;
    await updateDoc(userRef, { totalDiamonds: newDiamonds });

    console.log(`💎 [DiamondService] Spent ${amount} 💎. Balance: ${newDiamonds}`);
    return { success: true, newBalance: newDiamonds };
  } catch (err) {
    console.error('❌ [DiamondService] spendDiamonds error:', err);
    return { success: false, reason: 'error' };
  }
};

// ============================================================
// FETCH CURRENT DIAMOND BALANCE
// ============================================================
export const fetchDiamonds = async (userId) => {
  if (!userId) return 0;
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return 0;
    return userSnap.data().totalDiamonds || 0;
  } catch (err) {
    console.error('❌ [DiamondService] fetchDiamonds error:', err);
    return 0;
  }
};