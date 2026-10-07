// src/hooks/useUserStats.js
// ✅ FIXED: Maximum update depth error — added data change detection to prevent redundant setState
// ✅ NEW: Now exposes learnedWords array (list of words) and wordCount
// ✅ NEW: Progressive XP formula (100 + 30 per level) — matches Dashboard.jsx
// ✅ NEW: Grandfathering — keeps higher stored level (won't downgrade existing users)

import { useState, useEffect, useRef } from 'react';
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

export const useUserStats = (userId) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ FIX: Track last data to prevent redundant setState calls
  const lastDataKeyRef = useRef('');

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const userRef = doc(db, "users", userId);
    lastDataKeyRef.current = '';

    const unsubscribe = onSnapshot(userRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();

          // ✅ FIX: Create a key from relevant fields — skip update if nothing changed
          const learnedWordsArrayRaw =
            data.learnedWordsList ||
            data.learnedWords ||
            data.wordsList ||
            [];

          const dataKey = JSON.stringify({
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

          if (dataKey === lastDataKeyRef.current) {
            // Nothing relevant changed — skip setState to avoid infinite loop
            if (loading) setLoading(false);
            return;
          }
          lastDataKeyRef.current = dataKey;

          // ✅ NEW: Progressive level computation
          // Grandfathering: keep higher of (computed from points, stored level)
          const computedFromPoints = computeLevelFromPoints(data.totalPoints || 0);
          const storedLevel = data.level || 1;
          const computedLevel = Math.max(computedFromPoints, storedLevel);

          const computedXpToNext = computeXpToNext(data.totalPoints || 0);
          const computedCurrentXP = computeCurrentXP(data.totalPoints || 0);

          const learnedWordsArray = learnedWordsArrayRaw;

          // Normalize — can be an array of strings or array of objects
          const normalizedWords = Array.isArray(learnedWordsArray)
            ? learnedWordsArray.map(w => {
                if (typeof w === 'string') return w;
                if (w && typeof w === 'object') {
                  return w.word || w.term || w.text || JSON.stringify(w);
                }
                return String(w);
              })
            : [];

          setStats({
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
              gameStats: data.gameStats || {}
            }
          });
          setLoading(false);
        } else {
          setError("User not found");
          setLoading(false);
        }
      },
      (err) => {
        console.error('Firebase listener error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { stats, loading, error };
};