// src/components/dashboard/LivePlayerGame.jsx
// ============================================================
// ✅ STUDENT LIVE GAME - FULL SIZE
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeToSession, submitAnswer, updatePlayerProgress, QUESTION_TIME } from '../../services/LiveGameService';

// ===== MUTED DASHBOARD PALETTE (matches Avatar Shop) =====
const palette = {
  warmOrange: '#E9A075',
  warmOrangeShadow: '#C27E4F',
  coral: '#DB7A64',
  coralShadow: '#A95845',
  teal: '#4F9188',
  tealShadow: '#3A6A63',
  deepNavy: '#2A2845',
  deepNavyLight: '#3A3757',
  bodyText: '#6B6880',
  bodyTextSoft: '#8A8799',
  cream: '#FDF9F3',
  creamSoft: '#F5EFE6',
  white: '#FFFFFF',
  border: '#EBE2D5',
  borderSoft: '#F2EBE0',
  softGreen: '#7FA574',
  softGreenShadow: '#5E7F55',
  gold: '#C9A227',
  shadow: 'rgba(42, 40, 69, 0.06)',
  shadowMd: 'rgba(42, 40, 69, 0.10)',
};

const BRAND_FONT_DISPLAY = "'Fredoka', sans-serif";
const BRAND_FONT_BODY = "'Nunito', sans-serif";

const LivePlayerGame = ({ session: initialSession, playerId, onGameEnd }) => {
  const [session, setSession] = useState(initialSession);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [feedback, setFeedback] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isWaiting, setIsWaiting] = useState(false);
  const questionStartRef = useRef(null);

  useEffect(() => {
    if (!initialSession?.sessionId) return;

    const unsubscribe = subscribeToSession(initialSession.sessionId, (data) => {
      setSession(data);

      if (data.status === 'ended') {
        onGameEnd(data);
      }
    });

    return () => unsubscribe();
  }, [initialSession?.sessionId, onGameEnd]);

  useEffect(() => {
    if (session?.status !== 'playing') return;

    setSelectedAnswer(null);
    setHasAnswered(false);
    setFeedback(null);
    setTimeLeft(QUESTION_TIME);
    setIsWaiting(false);
    questionStartRef.current = Date.now();
  }, [currentQuestionIndex, session?.status]);

  useEffect(() => {
    if (session?.status !== 'playing') return;
    if (hasAnswered) return;
    if (isWaiting) return;

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
  }, [currentQuestionIndex, hasAnswered, isWaiting, session?.status]);

  const handleTimeout = async () => {
    if (hasAnswered) return;
    setHasAnswered(true);
    setFeedback({ isCorrect: false, points: 0, timeout: true });

    try {
      await updatePlayerProgress(session.sessionId, playerId, currentQuestionIndex);
    } catch (error) {
      console.error('Error updating progress:', error);
    }

    setTimeout(() => {
      moveToNextQuestion();
    }, 1500);
  };

  const handleSelectAnswer = async (option) => {
    if (hasAnswered || timeLeft === 0) return;

    setSelectedAnswer(option);
    setHasAnswered(true);

    try {
      const timeSpent = (Date.now() - questionStartRef.current) / 1000;
      const result = await submitAnswer(
        session.sessionId,
        playerId,
        currentQuestionIndex,
        option,
        timeSpent
      );

      setFeedback({
        isCorrect: result.isCorrect,
        points: result.points,
        correctAnswer: result.correctAnswer
      });

      setTimeout(() => {
        moveToNextQuestion();
      }, 1500);

    } catch (error) {
      console.error('Error submitting answer:', error);
      setFeedback({ isCorrect: false, points: 0, error: true });

      setTimeout(() => {
        moveToNextQuestion();
      }, 1500);
    }
  };

  const moveToNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex >= session.totalQuestions) {
      setIsWaiting(true);
      setFeedback(null);
      return;
    }

    setCurrentQuestionIndex(nextIndex);
  };

  const currentQuestion = session?.questions?.[currentQuestionIndex];
  const myPlayer = session?.players?.find(p => p.userId === playerId);
  const myScore = myPlayer?.score || 0;

  const sortedPlayers = [...(session?.players || [])].sort((a, b) => b.score - a.score);
  const myRank = sortedPlayers.findIndex(p => p.userId === playerId) + 1;

  // ============================================================
  // ✅ WAITING SCREEN (Last question done) - FULL SIZE
  // ============================================================
  if (isWaiting) {
    return (
      <div style={styles.container}>
        <div style={styles.waitingContainer}>
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            style={styles.waitingEmoji}
          >
            🎉
          </motion.div>

          <h1 style={styles.waitingTitle}>All done!</h1>
          <p style={styles.waitingSubtitle}>
            Waiting for other players to finish...
          </p>

          <div style={styles.waitingStats}>
            <div style={styles.waitingStatItem}>
              <div style={styles.waitingStatLabel}>Score</div>
              <div style={styles.waitingStatValue}>{myScore}</div>
            </div>
            <div style={styles.waitingStatDivider} />
            <div style={styles.waitingStatItem}>
              <div style={styles.waitingStatLabel}>Rank</div>
              <div style={styles.waitingStatValue}>#{myRank}</div>
            </div>
          </div>

          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={styles.waitingSpinner}
          >
            <div style={styles.spinnerDot} />
            <div style={{ ...styles.spinnerDot, animationDelay: '0.2s' }} />
            <div style={{ ...styles.spinnerDot, animationDelay: '0.4s' }} />
          </motion.div>
        </div>
      </div>
    );
  }

  // ============================================================
  // ✅ LOADING
  // ============================================================
  if (!currentQuestion) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ fontWeight: 700, fontFamily: BRAND_FONT_DISPLAY, fontSize: '18px', color: palette.deepNavy }}>Loading question...</p>
      </div>
    );
  }

  // ============================================================
  // ✅ MAIN GAME SCREEN - FULL SIZE
  // ============================================================
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
          <div style={{
            ...styles.timerBox,
            background: timeLeft <= 5 ? palette.coral : timeLeft <= 10 ? palette.warmOrange : palette.softGreen
          }}>
            <span style={styles.timerIcon}>⏱️</span>
            <span style={styles.timerText}>{timeLeft}s</span>
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
            animate={{
              width: `${((currentQuestionIndex + 1) / session.totalQuestions) * 100}%`
            }}
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
        <div style={styles.optionsGrid}>
          {currentQuestion.options?.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrectAnswer = option === currentQuestion.correctAnswer;
            const showCorrect = hasAnswered && isCorrectAnswer;
            const showWrong = hasAnswered && isSelected && !isCorrectAnswer;

            return (
              <motion.button
                key={index}
                whileHover={!hasAnswered ? { scale: 1.02 } : {}}
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
                <div style={styles.optionLabel}>
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
                background: feedback.isCorrect
                  ? `${palette.softGreen}18`
                  : feedback.timeout
                    ? `${palette.warmOrange}18`
                    : `${palette.coral}18`,
                borderColor: feedback.isCorrect
                  ? `${palette.softGreen}80`
                  : feedback.timeout
                    ? `${palette.warmOrange}80`
                    : `${palette.coral}80`
              }}
            >
              {feedback.isCorrect ? (
                <>
                  <div style={styles.feedbackIcon}>🎉</div>
                  <div style={styles.feedbackTitle}>Correct!</div>
                  <div style={styles.feedbackPoints}>+{feedback.points} pts</div>
                </>
              ) : feedback.timeout ? (
                <>
                  <div style={styles.feedbackIcon}>⏰</div>
                  <div style={styles.feedbackTitle}>Time's up!</div>
                  <div style={styles.feedbackPoints}>+0 pts</div>
                </>
              ) : (
                <>
                  <div style={styles.feedbackIcon}>😢</div>
                  <div style={styles.feedbackTitle}>Wrong answer</div>
                  <div style={styles.feedbackPoints}>+0 pts</div>
                </>
              )}
              <div style={styles.feedbackWait}>
                {currentQuestionIndex + 1 >= session.totalQuestions
                  ? 'Finishing up...'
                  : 'Next question coming...'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    width: '100vw',
    background: palette.cream,
    padding: 'clamp(16px, 3vw, 40px)',
    fontFamily: BRAND_FONT_BODY,
    color: palette.deepNavy,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
  },
  gameInner: {
    width: '100%',
    maxWidth: 'min(1200px, 100%)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(12px, 1.8vw, 20px)',
    flex: 1,
    justifyContent: 'center',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    width: '100vw',
    background: palette.cream,
  },
  spinner: {
    width: '56px',
    height: '56px',
    border: `4px solid ${palette.border}`,
    borderTop: `4px solid ${palette.warmOrange}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
  },
  headerLeft: {
    flex: 1,
  },
  questionCounter: {
    fontSize: 'clamp(14px, 1.6vw, 20px)',
    color: palette.bodyText,
    margin: 0,
    fontWeight: 800,
    fontFamily: BRAND_FONT_DISPLAY,
    letterSpacing: '0.02em',
  },
  timerBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: 'clamp(10px, 1.4vw, 16px) clamp(16px, 2vw, 24px)',
    borderRadius: '16px',
    transition: 'background 0.3s',
    boxShadow: `0 3px 0 ${palette.shadowMd}`,
    border: `2px solid ${palette.white}`,
    color: palette.white,
  },
  timerIcon: {
    fontSize: 'clamp(18px, 2vw, 24px)',
  },
  timerText: {
    fontSize: 'clamp(20px, 2.4vw, 30px)',
    fontWeight: '800',
    fontFamily: BRAND_FONT_DISPLAY,
  },
  scoreBar: {
    background: palette.white,
    borderRadius: '18px',
    padding: 'clamp(12px, 1.8vw, 20px) clamp(20px, 3vw, 40px)',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    border: `1.5px solid ${palette.border}`,
    boxShadow: `0 2px 0 ${palette.border}, 0 6px 16px ${palette.shadow}`,
  },
  scoreItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  scoreLabelSmall: {
    fontSize: 'clamp(11px, 1.2vw, 14px)',
    color: palette.bodyTextSoft,
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    fontFamily: BRAND_FONT_DISPLAY,
  },
  scoreValueSmall: {
    fontSize: 'clamp(22px, 3vw, 34px)',
    fontWeight: '800',
    marginTop: '4px',
    fontFamily: BRAND_FONT_DISPLAY,
    color: palette.deepNavy,
  },
  divider: {
    width: '2px',
    height: 'clamp(30px, 4vw, 44px)',
    background: palette.border,
  },
  progressBar: {
    width: '100%',
    height: 'clamp(8px, 1vw, 12px)',
    background: palette.creamSoft,
    borderRadius: '6px',
    overflow: 'hidden',
    border: `1.5px solid ${palette.border}`,
  },
  progressFill: {
    height: '100%',
    background: `linear-gradient(90deg, ${palette.softGreen}, ${palette.teal})`,
    borderRadius: '6px',
  },
  questionCard: {
    background: palette.white,
    borderRadius: '22px',
    padding: 'clamp(20px, 3vw, 40px)',
    border: `1.5px solid ${palette.border}`,
    borderTop: `6px solid ${palette.teal}`,
    textAlign: 'center',
    boxShadow: `0 2px 0 ${palette.border}, 0 8px 24px ${palette.shadow}`,
  },
  questionText: {
    fontSize: 'clamp(20px, 2.6vw, 32px)',
    fontWeight: '800',
    margin: 0,
    lineHeight: 1.4,
    fontFamily: BRAND_FONT_DISPLAY,
    color: palette.deepNavy,
    letterSpacing: '-0.3px',
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(240px, 30vw, 380px), 1fr))',
    gap: 'clamp(10px, 1.6vw, 16px)',
  },
  optionBtn: {
    background: palette.white,
    padding: 'clamp(14px, 1.8vw, 22px) clamp(16px, 2vw, 26px)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: 'clamp(12px, 1.6vw, 18px)',
    border: `1.5px solid ${palette.border}`,
    color: palette.deepNavy,
    textAlign: 'left',
    fontFamily: BRAND_FONT_BODY,
    fontSize: 'clamp(14px, 1.5vw, 18px)',
    fontWeight: '700',
    transition: 'all 0.2s',
    boxShadow: `0 2px 0 ${palette.border}`,
    minHeight: 'clamp(60px, 8vh, 90px)',
  },
  optionSelected: {
    background: palette.creamSoft,
    border: `2px solid ${palette.warmOrange}80`,
    boxShadow: `0 2px 0 ${palette.warmOrange}40`,
  },
  optionCorrect: {
    background: `${palette.softGreen}18`,
    border: `2px solid ${palette.softGreen}80`,
    boxShadow: `0 2px 0 ${palette.softGreen}40`,
  },
  optionWrong: {
    background: `${palette.coral}18`,
    border: `2px solid ${palette.coral}80`,
    boxShadow: `0 2px 0 ${palette.coral}40`,
  },
  optionLabel: {
    width: 'clamp(36px, 4vw, 52px)',
    height: 'clamp(36px, 4vw, 52px)',
    borderRadius: '50%',
    background: palette.creamSoft,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'clamp(16px, 1.8vw, 22px)',
    fontWeight: '800',
    flexShrink: 0,
    fontFamily: BRAND_FONT_DISPLAY,
    border: `1.5px solid ${palette.border}`,
    color: palette.deepNavy,
  },
  optionText: {
    flex: 1,
  },
  resultIcon: {
    fontSize: 'clamp(20px, 2.4vw, 28px)',
  },
  feedbackBox: {
    borderRadius: '18px',
    padding: 'clamp(16px, 2vw, 24px)',
    textAlign: 'center',
    border: '2px solid',
  },
  feedbackIcon: {
    fontSize: 'clamp(36px, 5vw, 52px)',
    marginBottom: '6px',
  },
  feedbackTitle: {
    fontSize: 'clamp(18px, 2.2vw, 26px)',
    fontWeight: '800',
    marginBottom: '4px',
    fontFamily: BRAND_FONT_DISPLAY,
    color: palette.deepNavy,
  },
  feedbackPoints: {
    fontSize: 'clamp(22px, 2.8vw, 32px)',
    fontWeight: '800',
    color: palette.gold,
    fontFamily: BRAND_FONT_DISPLAY,
  },
  feedbackWait: {
    fontSize: 'clamp(12px, 1.2vw, 14px)',
    color: palette.bodyTextSoft,
    marginTop: '8px',
    fontWeight: 700,
  },
  // Waiting screen
  waitingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    width: '100%',
    textAlign: 'center',
    padding: 'clamp(20px, 4vw, 60px)',
  },
  waitingEmoji: {
    fontSize: 'clamp(72px, 10vw, 120px)',
    marginBottom: '24px',
    filter: 'drop-shadow(0 6px 16px rgba(42, 40, 69, 0.2))',
  },
  waitingTitle: {
    fontSize: 'clamp(30px, 4vw, 52px)',
    fontWeight: '800',
    margin: '0 0 12px 0',
    fontFamily: BRAND_FONT_DISPLAY,
    color: palette.deepNavy,
    letterSpacing: '-0.5px',
  },
  waitingSubtitle: {
    fontSize: 'clamp(15px, 1.8vw, 22px)',
    color: palette.bodyText,
    margin: '0 0 40px 0',
    fontWeight: 600,
  },
  waitingStats: {
    background: palette.white,
    borderRadius: '24px',
    padding: 'clamp(24px, 3vw, 44px) clamp(40px, 6vw, 80px)',
    display: 'flex',
    alignItems: 'center',
    gap: 'clamp(32px, 5vw, 64px)',
    marginBottom: '40px',
    border: `1.5px solid ${palette.border}`,
    boxShadow: `0 2px 0 ${palette.border}, 0 8px 24px ${palette.shadow}`,
  },
  waitingStatItem: {
    textAlign: 'center',
  },
  waitingStatLabel: {
    fontSize: 'clamp(12px, 1.3vw, 15px)',
    color: palette.bodyTextSoft,
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    marginBottom: '6px',
    fontFamily: BRAND_FONT_DISPLAY,
  },
  waitingStatValue: {
    fontSize: 'clamp(32px, 4vw, 52px)',
    fontWeight: '800',
    color: palette.gold,
    fontFamily: BRAND_FONT_DISPLAY,
  },
  waitingStatDivider: {
    width: '2px',
    height: 'clamp(50px, 6vw, 80px)',
    background: palette.border,
  },
  waitingSpinner: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerDot: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    background: palette.warmOrange,
    animation: 'pulse 1s ease-in-out infinite',
  },
};

if (typeof document !== 'undefined' && !document.querySelector('#liveplayer-styles')) {
  const style = document.createElement('style');
  style.id = 'liveplayer-styles';
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.3); opacity: 0.5; }
    }
  `;
  document.head.appendChild(style);
}

export default LivePlayerGame;