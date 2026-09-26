// src/services/LiveGameService.js
// ============================================================
// ✅ LIVE GAME SERVICE - Real-time Firebase Logic
// WAYGROUND/QUIZIZZ STYLE - Auto-paced per student
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
export const QUESTION_TIME = 15; // ✅ 15 SECONDS per question (Wayground style)
export const BASE_POINTS = 1000;
export const TIME_PENALTY = 20; // points deducted per second
export const MAX_PLAYERS = 50;

// ============================================================
// ✅ CREATE LIVE SESSION (Teacher)
// ============================================================
export const createLiveSession = async (activityId, teacherId, teacherName) => {
  try {
    // Get activity data
    const activityRef = doc(db, 'activities', activityId);
    const activitySnap = await getDoc(activityRef);
    
    if (!activitySnap.exists()) {
      throw new Error('Activity not found');
    }

    const activityData = activitySnap.data();
    
    // Generate unique session ID
    const sessionId = `live_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create live session
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
      questionTime: QUESTION_TIME, // ✅ 15 seconds per question
      
      status: 'lobby', // 'lobby' | 'playing' | 'ended'
      currentQuestion: 0,
      
      players: [],
      
      createdAt: serverTimestamp(),
      startedAt: null,
      endedAt: null
    };

    const sessionRef = doc(db, 'liveSessions', sessionId);
    await setDoc(sessionRef, sessionData);

    console.log('✅ Live session created:', sessionId);
    
    return {
      sessionId,
      ...sessionData
    };
  } catch (error) {
    console.error('❌ Error creating live session:', error);
    throw error;
  }
};

// ============================================================
// ✅ JOIN LIVE SESSION (Student)
// ============================================================
export const joinLiveSession = async (gamePin, playerData) => {
  try {
    // Find active session by PIN
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

    // Check if session is in lobby (no late join)
    if (sessionData.status !== 'lobby') {
      throw new Error('Game already started. Cannot join now.');
    }

    // Check if already joined
    const existingPlayer = sessionData.players?.find(p => p.userId === playerData.userId);
    if (existingPlayer) {
      throw new Error('You are already in this session');
    }

    // Check max players
    if (sessionData.players?.length >= MAX_PLAYERS) {
      throw new Error('Session is full');
    }

    // Add player with currentQuestionIndex = 0
    const newPlayer = {
      userId: playerData.userId,
      name: playerData.name,
      avatarId: playerData.avatarId || 'avatar1',
      avatarImage: playerData.avatarImage || '',
      score: 0,
      correctAnswers: 0,
      answers: {},
      currentQuestionIndex: 0, // ✅ TRACK STUDENT'S CURRENT QUESTION
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
// ✅ SUBMIT ANSWER (Student) - AUTO-ADVANCE PER STUDENT
// ============================================================
export const submitAnswer = async (sessionId, playerId, questionIndex, answer, timeSpent) => {
  try {
    const sessionRef = doc(db, 'liveSessions', sessionId);
    const sessionSnap = await getDoc(sessionRef);
    
    if (!sessionSnap.exists()) {
      throw new Error('Session not found');
    }

    const sessionData = sessionSnap.data();
    const question = sessionData.questions[questionIndex];
    
    if (!question) {
      throw new Error('Question not found');
    }

    const isCorrect = answer === question.correctAnswer;
    
    // Calculate points
    let points = 0;
    if (isCorrect) {
      points = Math.max(100, BASE_POINTS - Math.floor(timeSpent * TIME_PENALTY));
    }

    // Update player
    const players = sessionData.players || [];
    const playerIndex = players.findIndex(p => p.userId === playerId);
    
    if (playerIndex === -1) {
      throw new Error('Player not found');
    }

    const updatedPlayer = {
      ...players[playerIndex],
      score: players[playerIndex].score + points,
      correctAnswers: players[playerIndex].correctAnswers + (isCorrect ? 1 : 0),
      currentQuestionIndex: questionIndex + 1, // ✅ AUTO-ADVANCE PER STUDENT!
      answers: {
        ...players[playerIndex].answers,
        [questionIndex]: {
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

    // Sort by score (for ranking)
    updatedPlayers.sort((a, b) => b.score - a.score);
    updatedPlayers.forEach((p, i) => {
      p.rank = i + 1;
    });

    await updateDoc(sessionRef, {
      players: updatedPlayers
    });

    // Also save to liveAnswers collection for analytics
    await addDoc(collection(db, 'liveAnswers'), {
      sessionId,
      playerId,
      questionIndex,
      answer,
      isCorrect,
      timeSpent,
      points,
      answeredAt: serverTimestamp()
    });

    console.log('✅ Answer submitted:', { isCorrect, points, nextQuestion: questionIndex + 1 });
    
    return {
      isCorrect,
      points,
      correctAnswer: question.correctAnswer,
      nextQuestionIndex: questionIndex + 1
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

    // Just advance the question index without adding score
    const updatedPlayer = {
      ...players[playerIndex],
      currentQuestionIndex: questionIndex + 1
    };

    const updatedPlayers = [...players];
    updatedPlayers[playerIndex] = updatedPlayer;

    await updateDoc(sessionRef, {
      players: updatedPlayers
    });

    console.log('✅ Player progress updated to question:', questionIndex + 1);
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

    // Mark as disconnected (retain score)
    const updatedPlayers = players.map(p => 
      p.userId === playerId 
        ? { ...p, isConnected: false }
        : p
    );

    await updateDoc(sessionRef, {
      players: updatedPlayers
    });

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
    
    if (!sessionSnap.exists()) {
      return null;
    }

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
  
  return players.every(p => {
    const answered = Object.keys(p.answers || {}).length;
    return answered >= totalQuestions;
  });
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
    isCompleted: answered >= totalQuestions
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