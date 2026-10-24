// src/components/dashboard/LivePlayerGame.jsx
// ============================================================
// ✅ STUDENT LIVE GAME - FULL SIZE
// ✅ UPDATED: Randomized Questions & Options + Dere-derecho sa Results
// ✅ FIXED: Auto-save score agad pagka-tapos ng student (hindi na kailangan hintayin teacher)
// ✅ REMOVED: Global Time Limit (Teacher na lang ang mag-e-end ng game)
// ============================================================

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore'; 
import { db } from '../../pages/firebase'; 
import { subscribeToSession, submitAnswer, updatePlayerProgress, QUESTION_TIME } from '../../services/LiveGameService';
import LivePlayerResults from './LivePlayerResults';

// ===== MUTED DASHBOARD PALETTE =====
const palette = {
  warmOrange: '#E9A075', warmOrangeShadow: '#C27E4F',
  coral: '#DB7A64', coralShadow: '#A95845',
  teal: '#4F9188', tealShadow: '#3A6A63',
  deepNavy: '#2A2845', deepNavyLight: '#3A3757',
  bodyText: '#6B6880', bodyTextSoft: '#8A8799',
  cream: '#FDF9F3', creamSoft: '#F5EFE6',
  white: '#FFFFFF', border: '#EBE2D5', borderSoft: '#F2EBE0',
  softGreen: '#7FA574', softGreenShadow: '#5E7F55',
  gold: '#C9A227', shadow: 'rgba(42, 40, 69, 0.06)', shadowMd: 'rgba(42, 40, 69, 0.10)',
};

const BRAND_FONT_DISPLAY = "'Fredoka', sans-serif";
const BRAND_FONT_BODY = "'Nunito', sans-serif";

const LivePlayerGame = ({ session: initialSession, playerId, onGameEnd, completeActivity }) => {
  const [session, setSession] = useState(initialSession);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [feedback, setFeedback] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false); 
  const questionStartRef = useRef(null);

  const sessionSavedRef = useRef(false);
  const answersRef = useRef({});
  const savedScoreRef = useRef(false); 

  // ✅ Effect 1: Subscribe to Session Updates
  useEffect(() => {
    if (!initialSession?.sessionId) return;

    const unsubscribe = subscribeToSession(initialSession.sessionId, (data) => {
      setSession(data);

      if (data.status === 'ended') {
        // Fallback: Save score if teacher ends the game before student finishes
        if (completeActivity && !sessionSavedRef.current && !savedScoreRef.current) {
          sessionSavedRef.current = true;
          savedScoreRef.current = true; 
          
          const myPlayer = data.players?.find(p => p.userId === playerId);
          const myCorrect = myPlayer?.correctAnswers || myPlayer?.correct || 0;
          const totalQ = data.totalQuestions || 0;
          const activityId = data.activityId || initialSession?.activityId || null;
          
          if (activityId) {
            completeActivity(activityId, myCorrect, myCorrect, totalQ, answersRef.current);
          }
        }
        if (!isFinished) {
           onGameEnd(data);
        }
      }
    });

    return () => unsubscribe();
  }, [initialSession?.sessionId, onGameEnd, completeActivity, playerId, initialSession?.activityId, isFinished]);

  // ✅ Effect 2: Reset state per question
  useEffect(() => {
    if (session?.status !== 'playing') return;
    setSelectedAnswer(null);
    setHasAnswered(false);
    setFeedback(null);
    setTimeLeft(QUESTION_TIME);
    questionStartRef.current = Date.now();
  }, [currentQuestionIndex, session?.status]);

  // ✅ Effect 3: Per-question timer
  useEffect(() => {
    if (session?.status !== 'playing') return;
    if (hasAnswered) return;
    if (isFinished) return; 

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - questionStartRef.current) / 1000);
      const remaining = Math.max(0, QUESTION_TIME - elapsed);
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        handleTimeout();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [currentQuestionIndex, hasAnswered, isFinished, session?.status]);

  const handleTimeout = async () => {
    if (hasAnswered || isFinished) return;
    setHasAnswered(true);
    setFeedback({ isCorrect: false, points: 0, timeout: true });
    
    const myPlayer = session?.players?.find(p => p.userId === playerId);
    const actualQIndex = myPlayer?.questionOrder?.[currentQuestionIndex];
    answersRef.current[`Q${actualQIndex + 1}`] = false;

    try {
      await updatePlayerProgress(session.sessionId, playerId, currentQuestionIndex);
    } catch (error) {
      console.error('Error updating progress:', error);
    }

    setTimeout(() => { moveToNextQuestion(); }, 1500);
  };

  const handleSelectAnswer = async (option) => {
    if (hasAnswered || timeLeft === 0 || isFinished) return;

    setSelectedAnswer(option);
    setHasAnswered(true);

    try {
      const timeSpent = (Date.now() - questionStartRef.current) / 1000;
      const result = await submitAnswer(
        session.sessionId, playerId, currentQuestionIndex, option, timeSpent
      );

      setFeedback({
        isCorrect: result.isCorrect,
        points: result.points,
        correctAnswer: result.correctAnswer
      });

      const myPlayer = session?.players?.find(p => p.userId === playerId);
      const actualQIndex = myPlayer?.questionOrder?.[currentQuestionIndex];
      answersRef.current[`Q${actualQIndex + 1}`] = result.isCorrect;

      setTimeout(() => { moveToNextQuestion(); }, 1500);

    } catch (error) {
      console.error('Error submitting answer:', error);
      setFeedback({ isCorrect: false, points: 0, error: true });
      setTimeout(() => { moveToNextQuestion(); }, 1500);
    }
  };

  const moveToNextQuestion = () => {
    if (isFinished) return; 
    const nextIndex = currentQuestionIndex + 1;
    
    if (nextIndex >= session.totalQuestions) {
      setIsFinished(true);
      setFeedback(null);
      
      // ✅ AUTO-SAVE: Save score to database when student finishes
      if (!savedScoreRef.current && completeActivity) {
        savedScoreRef.current = true;
        
        const saveFinalScore = async () => {
          try {
            const sessionRef = doc(db, 'liveSessions', session.sessionId);
            const snap = await getDoc(sessionRef);
            
            if (snap.exists()) {
              const data = snap.data();
              const myPlayer = data.players?.find(p => p.userId === playerId);
              
              if (myPlayer) {
                completeActivity(
                  data.activityId,
                  myPlayer.correctAnswers || 0,
                  myPlayer.correctAnswers || 0,
                  data.totalQuestions || 0,
                  myPlayer.answers || {}
                );
              }
            }
          } catch (err) {
            console.error("Error auto-saving score:", err);
          }
        };
        
        saveFinalScore();
      }
      return;
    }
    setCurrentQuestionIndex(nextIndex);
  };

  const myPlayer = session?.players?.find(p => p.userId === playerId);
  const actualQuestionIndex = myPlayer?.questionOrder?.[currentQuestionIndex];
  const currentQuestion = session?.questions?.[actualQuestionIndex];
  
  const shuffledOptions = useMemo(() => {
    if (!currentQuestion || !currentQuestion.options) return [];
    const opts = [...currentQuestion.options];
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    return opts;
  }, [actualQuestionIndex, currentQuestion?.options]);

  const myCorrectCount = myPlayer?.correctAnswers || myPlayer?.correct || 0;
  const myScore = myCorrectCount;

  const sortedPlayers = [...(session?.players || [])].sort((a, b) => {
    const aScore = a.correctAnswers || a.correct || 0;
    const bScore = b.correctAnswers || b.correct || 0;
    return bScore - aScore;
  });
  const myRank = sortedPlayers.findIndex(p => p.userId === playerId) + 1;

  // ✅ RENDER RESULTS KAPAG TAPOS NA
  if (isFinished) {
    return <LivePlayerResults session={session} playerId={playerId} onExit={() => onGameEnd(session)} />;
  }

  if (!currentQuestion) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ fontWeight: 700, fontFamily: BRAND_FONT_DISPLAY, fontSize: '18px', color: palette.white }}>Loading question...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.gameInner}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <p style={styles.questionCounter}>
              Question {currentQuestionIndex + 1} of {session.totalQuestions}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {/* ✅ PER-QUESTION TIMER (Global timer removed) */}
            <div style={{
              ...styles.timerBox,
              background: timeLeft <= 5 ? palette.coral : timeLeft <= 10 ? palette.warmOrange : palette.softGreen
            }}>
              <span style={styles.timerIcon}>⏱️</span>
              <span style={styles.timerText}>{timeLeft}s</span>
            </div>
          </div>
        </div>

        {/* My Score Bar */}
        <div style={styles.scoreBar}>
          <div style={styles.scoreItem}>
            <span style={styles.scoreLabelSmall}>Score</span>
            <span style={styles.scoreValueSmall}>{myScore}</span>
          </div>
          <div style={styles.divider}></div>
          <div style={styles.scoreItem}>
            <span style={styles.scoreLabelSmall}>Rank</span>
            <span style={styles.scoreValueSmall}>#{myRank}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={styles.progressBar}>
          <motion.div
            style={styles.progressFill}
            animate={{ width: `${((currentQuestionIndex + 1) / session.totalQuestions) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Question */}
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.questionCard}
        >
          <h2 style={styles.questionText}>{currentQuestion.question}</h2>
        </motion.div>

        {/* Options */}
        <div className="live-options-grid" style={styles.optionsGrid}>
          {shuffledOptions.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrectAnswer = option === currentQuestion.correctAnswer;
            const showCorrect = hasAnswered && isCorrectAnswer;
            const showWrong = hasAnswered && isSelected && !isCorrectAnswer;

            return (
              <motion.button
                key={index}
                whileHover={!hasAnswered ? { scale: 1.02, backgroundColor: palette.deepNavyLight } : {}}
                whileTap={!hasAnswered ? { scale: 0.98 } : {}}
                onClick={() => handleSelectAnswer(option)}
                disabled={hasAnswered}
                style={{
                  ...styles.optionBtn,
                  ...(showCorrect ? styles.optionCorrect : {}),
                  ...(showWrong ? styles.optionWrong : {}),
                  ...(isSelected && !hasAnswered ? styles.optionSelected : {}),
                  cursor: hasAnswered ? 'default' : 'pointer',
                }}
              >
                <div style={{
                  ...styles.optionLabel,
                  ...(showCorrect ? styles.optionLabelCorrect : {}),
                  ...(showWrong ? styles.optionLabelWrong : {}),
                }}>
                  {String.fromCharCode(65 + index)}
                </div>
                <div style={styles.optionText}>{option}</div>
                {showCorrect && <span style={styles.resultIcon}>✅</span>}
                {showWrong && <span style={styles.resultIcon}>❌</span>}
              </motion.button>
            );
          })}
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{
                ...styles.feedbackBox,
                background: feedback.isCorrect ? `rgba(127, 165, 116, 0.95)` : feedback.timeout ? `rgba(233, 160, 117, 0.95)` : `rgba(219, 122, 100, 0.95)`, 
                borderColor: 'rgba(255, 255, 255, 0.5)'
              }}
            >
              {feedback.isCorrect ? (
                <><div style={styles.feedbackIcon}>🎉</div><div style={{...styles.feedbackTitle, color: palette.white}}>Correct!</div><div style={{...styles.feedbackPoints, color: palette.white}}>+1 pt</div></>
              ) : feedback.timeout ? (
                <><div style={styles.feedbackIcon}>⏰</div><div style={{...styles.feedbackTitle, color: palette.white}}>Time's up!</div><div style={{...styles.feedbackPoints, color: palette.white}}>+0 pts</div></>
              ) : (
                <><div style={styles.feedbackIcon}>😢</div><div style={{...styles.feedbackTitle, color: palette.white}}>Wrong answer</div><div style={{...styles.feedbackPoints, color: palette.white}}>+0 pts</div></>
              )}
              <div style={{...styles.feedbackWait, color: 'rgba(255,255,255,0.8)'}}>
                {currentQuestionIndex + 1 >= session.totalQuestions ? 'Showing results...' : 'Next question coming...'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', width: '100vw', backgroundImage: `url('/image/quiz-bg.png')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed', backgroundRepeat: 'no-repeat', padding: 'clamp(16px, 3vw, 40px)', fontFamily: BRAND_FONT_BODY, color: palette.white, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' },
  gameInner: { width: '100%', maxWidth: 'min(1200px, 100%)', display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 1.8vw, 20px)', flex: 1, justifyContent: 'center' },
  loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100vw', backgroundImage: `url('/image/quiz-bg.png')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed', backgroundRepeat: 'no-repeat' },
  spinner: { width: '56px', height: '56px', border: `4px solid rgba(255,255,255,0.3)`, borderTop: `4px solid ${palette.white}`, borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' },
  headerLeft: { flex: 1 },
  questionCounter: { fontSize: 'clamp(14px, 1.6vw, 20px)', color: palette.white, textShadow: '0 2px 4px rgba(0,0,0,0.3)', margin: 0, fontWeight: 800, fontFamily: BRAND_FONT_DISPLAY, letterSpacing: '0.02em' },
  timerBox: { display: 'flex', alignItems: 'center', gap: '8px', padding: 'clamp(10px, 1.4vw, 16px) clamp(16px, 2vw, 24px)', borderRadius: '16px', transition: 'background 0.3s', boxShadow: `0 8px 24px rgba(0,0,0,0.15)`, border: `2px solid rgba(255,255,255,0.8)`, color: palette.white },
  timerIcon: { fontSize: 'clamp(18px, 2vw, 24px)' },
  timerText: { fontSize: 'clamp(20px, 2.4vw, 30px)', fontWeight: '800', fontFamily: BRAND_FONT_DISPLAY },
  scoreBar: { background: palette.deepNavy, borderRadius: '18px', padding: 'clamp(12px, 1.8vw, 20px) clamp(20px, 3vw, 40px)', display: 'flex', justifyContent: 'space-around', alignItems: 'center', border: `1.5px solid ${palette.deepNavyLight}`, boxShadow: `0 8px 24px rgba(0,0,0,0.25)` },
  scoreItem: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  scoreLabelSmall: { fontSize: 'clamp(11px, 1.2vw, 14px)', color: palette.bodyTextSoft, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', fontFamily: BRAND_FONT_DISPLAY },
  scoreValueSmall: { fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: '800', marginTop: '4px', fontFamily: BRAND_FONT_DISPLAY, color: palette.white },
  divider: { width: '2px', height: 'clamp(30px, 4vw, 44px)', background: palette.deepNavyLight },
  progressBar: { width: '100%', height: 'clamp(8px, 1vw, 12px)', background: palette.deepNavy, borderRadius: '6px', overflow: 'hidden', border: `1.5px solid ${palette.deepNavyLight}`, boxShadow: `0 2px 4px rgba(0,0,0,0.2)` },
  progressFill: { height: '100%', background: `linear-gradient(90deg, ${palette.softGreen}, ${palette.teal})`, borderRadius: '6px' },
  questionCard: { background: palette.deepNavy, borderRadius: '22px', padding: 'clamp(20px, 3vw, 40px)', border: `1.5px solid ${palette.deepNavyLight}`, borderTop: `6px solid ${palette.teal}`, textAlign: 'center', boxShadow: `0 12px 32px rgba(0,0,0,0.25)` },
  questionText: { fontSize: 'clamp(20px, 2.6vw, 32px)', fontWeight: '800', margin: 0, lineHeight: 1.4, fontFamily: BRAND_FONT_DISPLAY, color: palette.white, letterSpacing: '-0.3px' },
  optionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gridAutoFlow: 'row', gap: 'clamp(10px, 1.6vw, 16px)' },
  optionBtn: { background: palette.deepNavy, padding: 'clamp(14px, 1.8vw, 22px) clamp(16px, 2vw, 26px)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: 'clamp(12px, 1.6vw, 18px)', border: `1.5px solid ${palette.deepNavyLight}`, color: palette.white, textAlign: 'left', fontFamily: BRAND_FONT_BODY, fontSize: 'clamp(14px, 1.5vw, 18px)', fontWeight: '700', transition: 'all 0.2s', boxShadow: `0 4px 12px rgba(0,0,0,0.2)`, minHeight: 'clamp(60px, 8vh, 90px)' },
  optionSelected: { background: palette.deepNavyLight, border: `2px solid ${palette.warmOrange}`, boxShadow: `0 4px 16px ${palette.warmOrange}40` },
  optionCorrect: { background: `rgba(127, 165, 116, 0.3)`, border: `2px solid ${palette.softGreen}`, boxShadow: `0 4px 12px ${palette.softGreen}20` },
  optionWrong: { background: `rgba(219, 122, 100, 0.3)`, border: `2px solid ${palette.coral}`, boxShadow: `0 4px 12px ${palette.coral}20` },
  optionLabel: { width: 'clamp(36px, 4vw, 52px)', height: 'clamp(36px, 4vw, 52px)', borderRadius: '50%', background: palette.deepNavyLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(16px, 1.8vw, 22px)', fontWeight: '800', flexShrink: 0, fontFamily: BRAND_FONT_DISPLAY, border: `1.5px solid #4A476B`, color: palette.white, transition: 'all 0.2s' },
  optionLabelCorrect: { background: palette.softGreen, color: palette.white, border: `1.5px solid ${palette.softGreen}` },
  optionLabelWrong: { background: palette.coral, color: palette.white, border: `1.5px solid ${palette.coral}` },
  optionText: { flex: 1 },
  resultIcon: { fontSize: 'clamp(20px, 2.4vw, 28px)' },
  feedbackBox: { borderRadius: '18px', padding: 'clamp(16px, 2vw, 24px)', textAlign: 'center', border: '2px solid', boxShadow: `0 12px 32px rgba(0,0,0,0.3)` },
  feedbackIcon: { fontSize: 'clamp(36px, 5vw, 52px)', marginBottom: '6px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' },
  feedbackTitle: { fontSize: 'clamp(18px, 2.2vw, 26px)', fontWeight: '800', marginBottom: '4px', fontFamily: BRAND_FONT_DISPLAY, textShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  feedbackPoints: { fontSize: 'clamp(22px, 2.8vw, 32px)', fontWeight: '800', fontFamily: BRAND_FONT_DISPLAY, textShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  feedbackWait: { fontSize: 'clamp(12px, 1.2vw, 14px)', marginTop: '8px', fontWeight: 700 },
};

if (typeof document !== 'undefined' && !document.querySelector('#liveplayer-styles')) {
  const style = document.createElement('style');
  style.id = 'liveplayer-styles';
  style.textContent = `
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    @media (max-width: 560px) { .live-options-grid { grid-template-columns: 1fr !important; } }
  `;
  document.head.appendChild(style);
}

export default LivePlayerGame;