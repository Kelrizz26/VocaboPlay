// src/hooks/useUserStats.js
// ✅ NEW: Now exposes learnedWords array (list of words)
//          and wordCount (for the count)

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../pages/firebase';

export const useUserStats = (userId) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const userRef = doc(db, "users", userId);

    // Real-time listener
    const unsubscribe = onSnapshot(userRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();

          // ✅ Dynamic level computation (every 100 XP = 1 level)
          // If there's a saved level, use it. If not, compute from XP.
          const computedLevel = data.level || Math.floor((data.xp || 0) / 100) + 1;
          const computedXpToNext = computedLevel * 100;

          // ✅ NEW: Get the learned words array
          // Support various possible field names
          const learnedWordsArray =
            data.learnedWordsList ||    // ✅ New field name
            data.learnedWords ||         // ✅ Alternative
            data.wordsList ||            // ✅ Alternative
            [];

          // ✅ NEW: Normalize — can be an array of strings or array of objects
          const normalizedWords = Array.isArray(learnedWordsArray)
            ? learnedWordsArray.map(w => {
                if (typeof w === 'string') return w;
                if (w && typeof w === 'object') {
                  return w.word || w.term || w.text || JSON.stringify(w);
                }
                return String(w);
              })
            : [];

          // Transform Firebase data to match dashboard format
          setStats({
            ...data,
            // Map Firebase fields to what dashboard expects
            uid: userId,
            displayName: data.displayName || 'User',
            email: data.email || '',
            avatar: data.avatar || '👤',
            role: data.role || 'student',
            progress: {
              wordsLearned: data.wordsLearned || 0,
              // ✅ NEW: Array of words (for modal display)
              learnedWords: normalizedWords,
              // ✅ NEW: Ring count (just the count) — based on array length if available
              wordsLearnedCount: normalizedWords.length || data.wordsLearned || 0,
              gamesPlayed: data.gamesPlayed || 0,
              totalPoints: data.totalPoints || 0,
              level: computedLevel,                 // ✅ Dynamic level
              xp: data.xp || 0,
              streak: data.currentStreak || 0,
              accuracy: data.accuracy || 0,
              xpToNext: computedXpToNext,           // ✅ Dynamic xpToNext
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