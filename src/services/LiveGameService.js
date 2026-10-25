// src/services/LiveGameService.js
// ============================================================
// ✅ LIVE GAME SERVICE - Real-time Firebase Logic
// WAYGROUND/QUIZIZZ STYLE - Auto-paced per student
// ✅ UPDATED: Added questionOrder randomization & hasFinished lock
// ✅ UPDATED: Added maxAttempts retake logic
// ✅ UPDATED: Removed timeLimit logic
// ✅ FIXED: Answer keys now use Q1, Q2, Q3 format for Teacher Matrix
// ============================================================

import { 
  doc, 
  getDoc, 
  updateDoc, 
  setDoc, 
  addDoc,
  collection, 
  query, 
  where, 
  getDocs, 
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { db } from '../pages/firebase';

// ============================================================
// ✅ CONSTANTS
// ============================================================
export const QUESTION_TIME = 15; 
export const BASE_POINTS = 1000;
export const TIME_PENALTY = 20; 
export const MAX_PLAYERS = 50;

// ============================================================
// ✅ HELPER: Shuffle Array (Fisher-Yates)
// ============================================================
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// ============================================================
// ✅ CREATE LIVE SESSION (Teacher)
// ============================================================
export const createLiveSession = async (activityId, teacherId, teacherName) => {
  try {
    const activityRef = doc(db, 'activities', activityId);
    const activitySnap = await getDoc(activityRef);
    
    if (!activitySnap.exists()) {
      throw new Error('Activity not found');
    }

    const activityData = activitySnap.data();
    const sessionId = `live_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const sessionData = {
      sessionId,
      activityId,
      teacherId,
      teacherName,
      activityTitle: activityData.title,
      gameType: activityData.gameType || 'quiz',
      gamePin: activityData.gamePin,
      questions: activityData.questions || [],
      totalQuestions: activityData.totalQuestions || 0,
      questionTime: QUESTION_TIME,
      maxAttempts: activityData.maxAttempts || 1,   
      status: 'lobby',
      currentQuestion: 0,
      players: [],
      createdAt: serverTimestamp(),
      startedAt: null,
      endedAt: null
    };

    const sessionRef = doc(db, 'liveSessions', sessionId);
    await setDoc(sessionRef, sessionData);

    console.log('✅ Live session created:', sessionId);
    return { sessionId, ...sessionData };
  } catch (error) {
    console.error('❌ Error creating live session:', error);
    throw error;
  }
};

// ============================================================
// ✅ JOIN LIVE SESSION (Student) - WITH RETAKES & RE-ENTRY LOCK
// ============================================================
export const joinLiveSession = async (gamePin, playerData) => {
  try {
    const sessionsQuery = query(
      collection(db, 'liveSessions'),
      where('gamePin', '==', gamePin),
      where('status', 'in', ['lobby', 'playing'])
    );
    
    const sessionsSnap = await getDocs(sessionsQuery);
    
    if (sessionsSnap.empty) {
      throw new Error('No active session found with this PIN');
    }

    const sessionDoc = sessionsSnap.docs[0];
    const sessionData = sessionDoc.data();
    const sessionRef = doc(db, 'liveSessions', sessionDoc.id);
    const maxAttempts = sessionData.maxAttempts || 1;

    const existingPlayerIndex = sessionData.players?.findIndex(p => p.userId === playerData.userId);
    
    if (existingPlayerIndex !== -1 && existingPlayerIndex !== undefined) {
      const existingPlayer = sessionData.players[existingPlayerIndex];
      const currentAttempts = existingPlayer.attemptsMade || 1;

      if (existingPlayer.hasFinished && currentAttempts >= maxAttempts) {
        throw new Error(`You have already used all ${maxAttempts} attempt(s) for this quiz.`);
      }

      if (existingPlayer.hasFinished && currentAttempts < maxAttempts) {
        const updatedPlayers = [...sessionData.players];
        updatedPlayers[existingPlayerIndex] = {
          ...existingPlayer,
          score: 0,
          correctAnswers: 0,
          answers: {},
          currentQuestionIndex: 0,
          hasFinished: false,
          attemptsMade: currentAttempts + 1,
          questionOrder: shuffleArray(Array.from({ length: sessionData.totalQuestions }, (_, i) => i)),
          isConnected: true,
        };
        
        await updateDoc(sessionRef, { players: updatedPlayers });
        console.log(`✅ Player retaking quiz (Attempt ${currentAttempts + 1}):`, playerData.userId);
        
        return {
          sessionId: sessionDoc.id,
          ...sessionData,
          players: updatedPlayers
        };
      }

      if (!existingPlayer.hasFinished) {
        const updatedPlayers = [...sessionData.players];
        updatedPlayers[existingPlayerIndex] = { ...existingPlayer, isConnected: true };
        
        await updateDoc(sessionRef, { players: updatedPlayers });
        console.log('✅ Player reconnected:', playerData.userId);
        return {
          sessionId: sessionDoc.id,
          ...sessionData,
          players: updatedPlayers
        };
      }
    }

    if (sessionData.status !== 'lobby') {
      throw new Error('Game already started. Cannot join now.');
    }

    if (sessionData.players?.length >= MAX_PLAYERS) {
      throw new Error('Session is full');
    }

    const questionOrder = shuffleArray(
      Array.from({ length: sessionData.totalQuestions }, (_, i) => i)
    );

    // ✅ FIX: Siguraduhing may pangalan, kung wala, "Student" ang fallback
    const newPlayer = {
      userId: playerData.userId,
      name: playerData.name || 'Student', // Fallback kung walang name naipasa
      avatarId: playerData.avatarId || 'avatar1',
      avatarImage: playerData.avatarImage || '',
      score: 0,
      correctAnswers: 0,
      answers: {},
      currentQuestionIndex: 0,
      hasFinished: false, 
      attemptsMade: 1,          
      questionOrder,      
      isConnected: true,
      joinedAt: new Date().toISOString(),
      rank: sessionData.players?.length + 1 || 1
    };

    await updateDoc(sessionRef, {
      players: arrayUnion(newPlayer)
    });

    console.log('✅ Joined session:', sessionDoc.id);
    return {
      sessionId: sessionDoc.id,
      ...sessionData,
      players: [...(sessionData.players || []), newPlayer]
    };
  } catch (error) {
    console.error('❌ Error joining live session:', error);
    throw error;
  }
};

// ============================================================
// ✅ SUBSCRIBE TO SESSION (Real-time)
// ============================================================
export const subscribeToSession = (sessionId, callback) => {
  const sessionRef = doc(db, 'liveSessions', sessionId);
  
  return onSnapshot(sessionRef, (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() });
    }
  });
};

// ============================================================
// ✅ START GAME (Teacher)
// ============================================================
export const startGame = async (sessionId) => {
  try {
    const sessionRef = doc(db, 'liveSessions', sessionId);
    await updateDoc(sessionRef, {
      status: 'playing',
      startedAt: new Date().toISOString()
    });
    console.log('✅ Game started');
    return true;
  } catch (error) {
    console.error('❌ Error starting game:', error);
    throw error;
  }
};

// ============================================================
// ✅ SUBMIT ANSWER (Student) - WITH RANDOMIZED ORDER
// ============================================================
export const submitAnswer = async (sessionId, playerId, questionIndex, answer, timeSpent) => {
  try {
    const sessionRef = doc(db, 'liveSessions', sessionId);
    const sessionSnap = await getDoc(sessionRef);
    
    if (!sessionSnap.exists()) {
      throw new Error('Session not found');
    }

    const sessionData = sessionSnap.data();
    const players = sessionData.players || [];
    const playerIndex = players.findIndex(p => p.userId === playerId);
    
    if (playerIndex === -1) {
      throw new Error('Player not found');
    }

    const player = players[playerIndex];
    
    const actualQuestionIndex = player.questionOrder 
      ? player.questionOrder[questionIndex] 
      : questionIndex;
      
    const question = sessionData.questions[actualQuestionIndex];
    
    if (!question) {
      throw new Error('Question not found');
    }

    const isCorrect = answer === question.correctAnswer;
    
    let points = 0;
    if (isCorrect) {
      points = Math.max(100, BASE_POINTS - Math.floor(timeSpent * TIME_PENALTY));
    }

    const nextQuestionIndex = questionIndex + 1;
    const hasFinished = nextQuestionIndex >= sessionData.totalQuestions;

    const updatedPlayer = {
      ...player,
      score: player.score + points,
      correctAnswers: player.correctAnswers + (isCorrect ? 1 : 0),
      currentQuestionIndex: nextQuestionIndex,
      hasFinished: hasFinished, 
      answers: {
        ...player.answers,
        // ✅ FIX: Ginawa nating Q1, Q2, Q3... ang key para gumana ang matrix sa teacher dashboard
        [`Q${actualQuestionIndex + 1}`]: { 
          answer,
          isCorrect,
          timeSpent,
          points,
          answeredAt: new Date().toISOString()
        }
      }
    };

    const updatedPlayers = [...players];
    updatedPlayers[playerIndex] = updatedPlayer;

    updatedPlayers.sort((a, b) => b.score - a.score);
    updatedPlayers.forEach((p, i) => {
      p.rank = i + 1;
    });

    await updateDoc(sessionRef, {
      players: updatedPlayers
    });

    await addDoc(collection(db, 'liveAnswers'), {
      sessionId,
      playerId,
      questionIndex: actualQuestionIndex,
      answer,
      isCorrect,
      timeSpent,
      points,
      answeredAt: serverTimestamp()
    });

    console.log('✅ Answer submitted:', { isCorrect, points, nextQuestion: nextQuestionIndex, hasFinished });
    
    return {
      isCorrect,
      points,
      correctAnswer: question.correctAnswer,
      nextQuestionIndex
    };
  } catch (error) {
    console.error('❌ Error submitting answer:', error);
    throw error;
  }
};

// ============================================================
// ✅ UPDATE PLAYER PROGRESS (Student) - For timeout/no answer
// ============================================================
export const updatePlayerProgress = async (sessionId, playerId, questionIndex) => {
  try {
    const sessionRef = doc(db, 'liveSessions', sessionId);
    const sessionSnap = await getDoc(sessionRef);
    
    if (!sessionSnap.exists()) return;

    const sessionData = sessionSnap.data();
    const players = sessionData.players || [];
    const playerIndex = players.findIndex(p => p.userId === playerId);
    
    if (playerIndex === -1) return;

    const player = players[playerIndex];
    
    const actualQuestionIndex = player.questionOrder 
      ? player.questionOrder[questionIndex] 
      : questionIndex;

    const nextQuestionIndex = questionIndex + 1;
    const hasFinished = nextQuestionIndex >= sessionData.totalQuestions;

    const updatedPlayer = {
      ...player,
      currentQuestionIndex: nextQuestionIndex,
      hasFinished: hasFinished, 
      answers: {
        ...player.answers,
        // ✅ FIX: Q1, Q2, Q3 key format para sa timeouts
        [`Q${actualQuestionIndex + 1}`]: { 
          answer: null,
          isCorrect: false,
          timeSpent: QUESTION_TIME,
          points: 0,
          answeredAt: new Date().toISOString(),
          timeout: true
        }
      }
    };

    const updatedPlayers = [...players];
    updatedPlayers[playerIndex] = updatedPlayer;

    await updateDoc(sessionRef, {
      players: updatedPlayers
    });

    console.log('✅ Player progress updated to question:', nextQuestionIndex, 'hasFinished:', hasFinished);
  } catch (error) {
    console.error('❌ Error updating player progress:', error);
  }
};

// ============================================================
// ✅ END GAME (Teacher)
// ============================================================
export const endGame = async (sessionId) => {
  try {
    const sessionRef = doc(db, 'liveSessions', sessionId);
    await updateDoc(sessionRef, {
      status: 'ended',
      endedAt: new Date().toISOString()
    });
    console.log('✅ Game ended');
    return true;
  } catch (error) {
    console.error('❌ Error ending game:', error);
    throw error;
  }
};

// ============================================================
// ✅ REMOVE PLAYER (Disconnect)
// ============================================================
export const removePlayer = async (sessionId, playerId) => {
  try {
    const sessionRef = doc(db, 'liveSessions', sessionId);
    const sessionSnap = await getDoc(sessionRef);
    
    if (!sessionSnap.exists()) return;

    const sessionData = sessionSnap.data();
    const players = sessionData.players || [];
    const player = players.find(p => p.userId === playerId);
    
    if (!player) return;

    const updatedPlayers = players.map(p => 
      p.userId === playerId ? { ...p, isConnected: false } : p
    );

    await updateDoc(sessionRef, { players: updatedPlayers });
    console.log('✅ Player removed:', playerId);
  } catch (error) {
    console.error('❌ Error removing player:', error);
  }
};

// ============================================================
// ✅ GET SESSION BY ID
// ============================================================
export const getSessionById = async (sessionId) => {
  try {
    const sessionRef = doc(db, 'liveSessions', sessionId);
    const sessionSnap = await getDoc(sessionRef);
    if (!sessionSnap.exists()) return null;
    return { id: sessionSnap.id, ...sessionSnap.data() };
  } catch (error) {
    console.error('❌ Error getting session:', error);
    return null;
  }
};

// ============================================================
// ✅ DELETE SESSION
// ============================================================
export const deleteSession = async (sessionId) => {
  try {
    await deleteDoc(doc(db, 'liveSessions', sessionId));
    console.log('✅ Session deleted');
    return true;
  } catch (error) {
    console.error('❌ Error deleting session:', error);
    throw error;
  }
};

// ============================================================
// ✅ CALCULATE FINAL RANKING
// ============================================================
export const calculateRankings = (players) => {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  return sorted.map((player, index) => ({
    ...player,
    rank: index + 1,
    medal: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null
  }));
};

// ============================================================
// ✅ CHECK IF ALL PLAYERS COMPLETED
// ============================================================
export const checkAllPlayersCompleted = (players, totalQuestions) => {
  if (!players || players.length === 0) return false;
  return players.every(p => p.hasFinished || Object.keys(p.answers || {}).length >= totalQuestions);
};

// ============================================================
// ✅ GET PLAYER PROGRESS
// ============================================================
export const getPlayerProgress = (player, totalQuestions) => {
  const answered = Object.keys(player.answers || {}).length;
  const percentage = totalQuestions > 0 ? Math.round((answered / totalQuestions) * 100) : 0;
  return {
    answered,
    total: totalQuestions,
    percentage,
    isCompleted: player.hasFinished || answered >= totalQuestions
  };
};

export default {
  createLiveSession,
  joinLiveSession,
  subscribeToSession,
  startGame,
  submitAnswer,
  updatePlayerProgress,
  endGame,
  removePlayer,
  getSessionById,
  deleteSession,
  calculateRankings,
  checkAllPlayersCompleted,
  getPlayerProgress
};