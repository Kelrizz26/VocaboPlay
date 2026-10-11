// src/hooks/useUserStats.js
// ✅ OPTIMIZED: Shared module-level listener store
//   - ONE onSnapshot per userId (shared across ALL components using the hook)
//   - Prevents N listeners when N components mount the same hook
//   - Grace period (15s) on unsubscribe — avoids re-read on rapid remount
//   - Instant hydration from cached state — no loading flash on re-mount
// ✅ FIXED: Maximum update depth error — data change detection (unchanged logic)
// ✅ NEW: Now exposes learnedWords array (list of words) and wordCount
// ✅ NEW: Progressive XP formula (100 + 30 per level) — matches Dashboard.jsx
// ✅ NEW: Grandfathering — keeps higher stored level (won't downgrade existing users)

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../pages/firebase';

// ============================================================
// 🎯 PROGRESSIVE XP FORMULA — matches Dashboard.jsx
// Formula: XP to next = 100 + (level - 1) × 30
// ============================================================
const XP_BASE = 100;
const XP_INCREMENT = 30;

const computeLevelFromPoints = (points) => {
  const total = points || 0;
  let level = 1;
  let accumulated = 0;
  while (level < 999) {
    const need = XP_BASE + (level - 1) * XP_INCREMENT;
    if (total >= accumulated + need) {
      accumulated += need;
      level++;
    } else break;
  }
  return level;
};

const computeCurrentXP = (points) => {
  const total = points || 0;
  let level = 1;
  let accumulated = 0;
  while (level < 999) {
    const need = XP_BASE + (level - 1) * XP_INCREMENT;
    if (total >= accumulated + need) {
      accumulated += need;
      level++;
    } else break;
  }
  return total - accumulated;
};

const computeXpToNext = (points) => {
  const level = computeLevelFromPoints(points);
  return XP_BASE + (level - 1) * XP_INCREMENT;
};

// ============================================================
// ✅ SHARED LISTENER STORE
//   - One onSnapshot per userId, shared across all hook consumers
//   - Auto-cleanup when last subscriber unmounts (with 15s grace)
//   - Cached latestState for instant re-mount
// ============================================================
const UNSUB_GRACE_MS = 15 * 1000; // 15 seconds

const listenerStore = new Map();
// Structure: userId -> {
//   unsubscribe: Function | null,
//   subscribers: Set<Function>,
//   latestState: { stats, loading, error },
//   lastDataKey: string,
//   pendingUnsubTimeout: Timeout | null,
// }

const EMPTY_STATE = { stats: null, loading: false, error: null };
const INITIAL_LOADING_STATE = { stats: null, loading: true, error: null };

const getEntry = (userId) => {
  let entry = listenerStore.get(userId);
  if (!entry) {
    entry = {
      unsubscribe: null,
      subscribers: new Set(),
      latestState: INITIAL_LOADING_STATE,
      lastDataKey: '',
      pendingUnsubTimeout: null,
    };
    listenerStore.set(userId, entry);
  }
  return entry;
};

const notifySubscribers = (entry) => {
  entry.subscribers.forEach((cb) => {
    try {
      cb(entry.latestState);
    } catch (e) {
      console.error('useUserStats subscriber error:', e);
    }
  });
};

// ============================================================
// ✅ Compute the data-change key (dedupe logic — unchanged)
// ============================================================
const computeDataKey = (data) => {
  const learnedWordsArrayRaw =
    data.learnedWordsList ||
    data.learnedWords ||
    data.wordsList ||
    [];

  return JSON.stringify({
    tp: data.totalPoints || 0,
    xp: data.xp || 0,
    lvl: data.level || 0,
    wl: data.wordsLearned || 0,
    gp: data.gamesPlayed || 0,
    acc: data.accuracy || 0,
    str: data.currentStreak || 0,
    la: data.lastActive || '',
    av: data.equippedAvatar || '',
    dw: Array.isArray(learnedWordsArrayRaw) ? learnedWordsArrayRaw.length : 0,
    dia: data.totalDiamonds || 0,
  });
};

// ============================================================
// ✅ Compute normalized stats (unchanged logic)
// ============================================================
const computeStatsFromData = (userId, data) => {
  const learnedWordsArrayRaw =
    data.learnedWordsList ||
    data.learnedWords ||
    data.wordsList ||
    [];

  // ✅ Progressive level computation + grandfathering
  const computedFromPoints = computeLevelFromPoints(data.totalPoints || 0);
  const storedLevel = data.level || 1;
  const computedLevel = Math.max(computedFromPoints, storedLevel);

  const computedXpToNext = computeXpToNext(data.totalPoints || 0);
  const computedCurrentXP = computeCurrentXP(data.totalPoints || 0);

  // Normalize — can be array of strings or array of objects
  const normalizedWords = Array.isArray(learnedWordsArrayRaw)
    ? learnedWordsArrayRaw.map((w) => {
        if (typeof w === 'string') return w;
        if (w && typeof w === 'object') {
          return w.word || w.term || w.text || JSON.stringify(w);
        }
        return String(w);
      })
    : [];

  return {
    ...data,
    uid: userId,
    displayName: data.displayName || 'User',
    email: data.email || '',
    avatar: data.avatar || '👤',
    role: data.role || 'student',
    progress: {
      wordsLearned: data.wordsLearned || 0,
      learnedWords: normalizedWords,
      wordsLearnedCount: normalizedWords.length || data.wordsLearned || 0,
      gamesPlayed: data.gamesPlayed || 0,
      totalPoints: data.totalPoints || 0,
      level: computedLevel,
      xp: computedCurrentXP,
      streak: data.currentStreak || 0,
      accuracy: data.accuracy || 0,
      xpToNext: computedXpToNext,
      lastPlayed: data.lastActive || null,
      gameStats: data.gameStats || {},
    },
  };
};

// ============================================================
// ✅ Ensure the shared listener is running for this userId
// ============================================================
const ensureListener = (userId) => {
  const entry = getEntry(userId);

  // Cancel pending unsubscribe (component came back within grace period)
  if (entry.pendingUnsubTimeout) {
    clearTimeout(entry.pendingUnsubTimeout);
    entry.pendingUnsubTimeout = null;
  }

  // Already running — reuse
  if (entry.unsubscribe) return entry;

  const userRef = doc(db, 'users', userId);

  entry.unsubscribe = onSnapshot(
    userRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const newKey = computeDataKey(data);

        // Skip redundant setState if nothing relevant changed
        if (newKey === entry.lastDataKey) {
          if (entry.latestState.loading) {
            entry.latestState = { ...entry.latestState, loading: false };
            notifySubscribers(entry);
          }
          return;
        }
        entry.lastDataKey = newKey;

        const newStats = computeStatsFromData(userId, data);
        entry.latestState = { stats: newStats, loading: false, error: null };
        notifySubscribers(entry);
      } else {
        entry.latestState = { stats: null, loading: false, error: 'User not found' };
        notifySubscribers(entry);
      }
    },
    (err) => {
      console.error('Firebase listener error:', err);
      entry.latestState = { stats: null, loading: false, error: err.message };
      notifySubscribers(entry);
    }
  );

  return entry;
};

// ============================================================
// ✅ Release — schedule unsubscribe after grace period
// ============================================================
const releaseListener = (userId) => {
  const entry = listenerStore.get(userId);
  if (!entry) return;
  if (entry.subscribers.size > 0) return; // Someone is still using it
  if (!entry.unsubscribe) return;

  // Clear any existing pending timeout (shouldn't happen, but safe)
  if (entry.pendingUnsubTimeout) {
    clearTimeout(entry.pendingUnsubTimeout);
  }

  entry.pendingUnsubTimeout = setTimeout(() => {
    const current = listenerStore.get(userId);
    if (!current) return;
    if (current.subscribers.size > 0) return; // Re-subscribed during grace period
    if (current.unsubscribe) {
      current.unsubscribe();
      current.unsubscribe = null;
    }
    current.pendingUnsubTimeout = null;
    // Keep the entry in the map so re-mount is instant
    // (stale data will be replaced by next listener snapshot)
  }, UNSUB_GRACE_MS);
};

// ============================================================
// ✅ HOOK
// ============================================================
export const useUserStats = (userId) => {
  // ✅ Hydrate from any existing entry — instant render, no loading flash
  const [state, setState] = useState(() => {
    if (!userId) return EMPTY_STATE;
    const existing = listenerStore.get(userId);
    return existing?.latestState || INITIAL_LOADING_STATE;
  });

  useEffect(() => {
    if (!userId) {
      setState(EMPTY_STATE);
      return;
    }

    // Start or reuse the shared listener
    const entry = ensureListener(userId);

    // Sync immediately with the latest known state
    setState(entry.latestState);

    // Subscribe to future updates
    const subscriber = (newState) => {
      setState(newState);
    };
    entry.subscribers.add(subscriber);

    return () => {
      entry.subscribers.delete(subscriber);
      releaseListener(userId);
    };
  }, [userId]);

  return state;
};