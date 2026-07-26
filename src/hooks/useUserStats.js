// src/hooks/useUserStats.js
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../pages/firebase';  // ✅ Tama na 'to!

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
              gamesPlayed: data.gamesPlayed || 0,
              totalPoints: data.totalPoints || 0,
              level: data.level || 1,
              xp: data.xp || 0,
              streak: data.currentStreak || 0,
              accuracy: data.accuracy || 0,
              xpToNext: data.xpToNext || 100,
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