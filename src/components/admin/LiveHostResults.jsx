// src/components/admin/LiveHostResults.jsx
// ============================================================
// ✅ TEACHER RESULTS - FIXED: Avatar faces visible in podium
// ✅ FIXED: 1 correct = 1 point (not live game score)
// ✅ UPDATED: Added Matrix Table, Summary Stats, Print Layout
// ✅ FIXED: Robust per-question answers parsing (Q1, Q2...)
// ============================================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  subscribeToSession,
  calculateRankings,
  deleteSession
} from '../../services/LiveGameService';

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
  goldSoft: '#D9B44A',
  silver: '#9CA3AF',
  bronze: '#B07A50',
  shadow: 'rgba(42, 40, 69, 0.06)',
  shadowMd: 'rgba(42, 40, 69, 0.10)',
  danger: '#E05B5B',
  dangerSoft: '#FCEAEA',
};

const BRAND_FONT_DISPLAY = "'Fredoka', sans-serif";
const BRAND_FONT_BODY = "'Nunito', sans-serif";

// ============================================================
// ✅ Helper: Get the correct count (1 correct = 1 point)
// ============================================================
const getPoints = (player) => {
  return player?.correctAnswers || player?.correct || 0;
};

// ============================================================
// ✅ Helper: Parse a single answer value into boolean
// Handles: true, 1, "true", "1", { isCorrect: true }, { correct: true }
// ============================================================
const parseAnswerValue = (val) => {
  if (val === true || val === 1 || val === 'true' || val === '1') return true;
  if (val && typeof val === 'object') {
    if (val.isCorrect === true || val.correct === true || val.is_correct === true) return true;
  }
  return false;
};

// ============================================================
// ✅ Helper: Get answer for a specific question number (q = 1, 2, 3...)
// Handles various formats: arrays, {Q1: true}, {1: true}, {0: true}
// ============================================================
const getAnswerForQuestion = (answers, q) => {
  if (!answers) return false;

  // Format 1: Array of booleans [true, false, true...]
  if (Array.isArray(answers)) {
    return parseAnswerValue(answers[q - 1]);
  }

  // Format 2: Object with various key formats
  if (typeof answers === 'object') {
    const keysToTry = [`Q${q}`, `q${q}`, `${q}`, q, q - 1, String(q - 1)];
    for (const key of keysToTry) {
      if (Object.prototype.hasOwnProperty.call(answers, key)) {
        return parseAnswerValue(answers[key]);
      }
    }
  }

  return false;
};

const LiveHostResults = ({ session: initialSession, onPlayAgain, onBackToDashboard }) => {
  const [session, setSession] = useState(initialSession);

  useEffect(() => {
    if (!initialSession?.sessionId) return;
    const unsubscribe = subscribeToSession(initialSession.sessionId, (data) => {
      setSession(data);
    });
    return () => unsubscribe();
  }, [initialSession?.sessionId]);

  const players = session?.players || [];
  const rankedPlayers = calculateRankings(players);
  const totalQ = session?.totalQuestions || 0;

  const podiumPlayers = rankedPlayers.slice(0, 3);
  const otherPlayers = rankedPlayers.slice(3);

  // ============================================================
  // ✅ SUMMARY STATS (Average, Highest, Lowest)
  // ============================================================
  const summaryStats = React.useMemo(() => {
    if (players.length === 0) return { average: 0, highest: 0, lowest: 0 };
    const scores = players.map(p => getPoints(p));
    const total = scores.reduce((sum, s) => sum + s, 0);
    return {
      average: (total / players.length).toFixed(1),
      highest: Math.max(...scores),
      lowest: Math.min(...scores)
    };
  }, [players]);

  const handleBackToDashboard = async () => {
    if (session?.sessionId) {
      await deleteSession(session.sessionId);
    }
    onBackToDashboard();
  };

  const handlePrint = () => {
    window.print();
  };

  // Generate array for Q1 to Q20 (or however many total questions)
  const questionNumbers = Array.from({ length: totalQ }, (_, i) => i + 1);

  // ✅ Check if at least one player has answers data (for warning banner)
  const hasAnyAnswersData = players.some(p => p?.answers && Object.keys(p.answers || {}).length > 0);

  return (
    <div style={styles.container}>
      {/* ✅ PRINT CSS - This will adjust the layout when Print is clicked */}
      <style>
        {`
          @media print {
            @page { size: landscape; margin: 10mm; }
            body { background: white !important; color: black !important; }
            .no-print { display: none !important; }
            .print-only { display: block !important; }
            .print-table { width: 100%; border-collapse: collapse; font-size: 11px; }
            .print-table th, .print-table td { border: 1px solid #000; padding: 4px; text-align: center; }
            .print-table th { background: #f0f0f0; }
            .print-header { text-align: left; margin-bottom: 20px; }
            .print-summary { display: flex; gap: 20px; margin-bottom: 15px; font-weight: bold; }
            .correct-cell { color: green; font-weight: bold; }
            .incorrect-cell { color: red; font-weight: bold; }
          }
        `}
      </style>

      {/* Confetti background */}
      <div style={styles.confettiBg} className="no-print"></div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.header}
        className="no-print"
      >
        <h1 style={styles.title}>🎉 Game Over!</h1>
        <p style={styles.subtitle}>{session?.activityTitle}</p>
      </motion.div>

      {/* ============================================================
          PRINT HEADER (Only visible when printing)
          ============================================================ */}
      <div className="print-only" style={{ display: 'none', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', margin: '0 0 10px 0' }}>Quiz Report: {session?.activityTitle}</h1>
        <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>
          <strong>Date:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
        <div style={{ display: 'flex', gap: '20px', fontSize: '14px' }}>
          <span><strong>Average Score:</strong> {summaryStats.average}</span>
          <span><strong>Highest Score:</strong> {summaryStats.highest}</span>
          <span><strong>Lowest Score:</strong> {summaryStats.lowest}</span>
        </div>
      </div>

      {/* ============================================================
          ON-SCREEN PODIUM & LEADERBOARD (Hidden when printing)
          ============================================================ */}
      <div className="no-print">
        {/* Podium */}
        <div style={styles.podiumSection}>
          {podiumPlayers[1] && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ ...styles.podiumCard, ...styles.podium2nd }}>
              <div style={styles.podiumRank}>🥈</div>
              <div style={styles.podiumAvatar}>
                {podiumPlayers[1].avatarImage ? <img src={podiumPlayers[1].avatarImage} alt={podiumPlayers[1].name} style={styles.podiumAvatarImg} /> : <span style={styles.podiumAvatarEmoji}>👤</span>}
              </div>
              <div style={styles.podiumName}>{podiumPlayers[1].name}</div>
              <div style={styles.podiumScore}>{getPoints(podiumPlayers[1])} pts</div>
            </motion.div>
          )}
          {podiumPlayers[0] && (
            <motion.div initial={{ opacity: 0, y: 50, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.1, type: 'spring' }} style={{ ...styles.podiumCard, ...styles.podium1st }}>
              <div style={styles.podiumRank}>🥇</div>
              <div style={styles.podiumAvatar}>
                {podiumPlayers[0].avatarImage ? <img src={podiumPlayers[0].avatarImage} alt={podiumPlayers[0].name} style={styles.podiumAvatarImg} /> : <span style={styles.podiumAvatarEmoji}>👤</span>}
              </div>
              <div style={styles.podiumName}>{podiumPlayers[0].name}</div>
              <div style={styles.podiumScore}>{getPoints(podiumPlayers[0])} pts</div>
            </motion.div>
          )}
          {podiumPlayers[2] && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ ...styles.podiumCard, ...styles.podium3rd }}>
              <div style={styles.podiumRank}>🥉</div>
              <div style={styles.podiumAvatar}>
                {podiumPlayers[2].avatarImage ? <img src={podiumPlayers[2].avatarImage} alt={podiumPlayers[2].name} style={styles.podiumAvatarImg} /> : <span style={styles.podiumAvatarEmoji}>👤</span>}
              </div>
              <div style={styles.podiumName}>{podiumPlayers[2].name}</div>
              <div style={styles.podiumScore}>{getPoints(podiumPlayers[2])} pts</div>
            </motion.div>
          )}
        </div>

        {/* Leaderboard */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} style={styles.leaderboardSection}>
          <h2 style={styles.leaderboardTitle}>📊 Full Leaderboard</h2>
          <div style={styles.leaderboardList}>
            {rankedPlayers.map((player, index) => (
              <div key={player.userId} style={styles.leaderboardItem}>
                <div style={styles.rankBadge}>{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}</div>
                <div style={styles.playerAvatarSmall}>
                  {player.avatarImage ? <img src={player.avatarImage} alt={player.name} style={styles.avatarImgSmall} /> : <span style={styles.avatarEmojiSmall}>👤</span>}
                </div>
                <div style={styles.playerName}>{player.name}</div>
                <div style={styles.playerStats}>
                  <span style={styles.statItem}>✅ {getPoints(player)}/{totalQ}</span>
                  <span style={styles.statPoints}>{getPoints(player)} pts</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ============================================================
          MATRIX TABLE (This is what appears in Print)
          ============================================================ */}
      {totalQ > 0 && (
        <div style={styles.matrixSection} className="print-only">
          <h2 style={styles.matrixTitle} className="no-print">📋 Question Breakdown (Matrix)</h2>

          {/* ✅ Warning if no per-question answers data */}
          {!hasAnyAnswersData && (
            <div style={{
              marginBottom: '12px',
              padding: '10px 14px',
              background: palette.dangerSoft,
              border: `1.5px solid ${palette.danger}40`,
              borderRadius: '10px',
              color: palette.danger,
              fontSize: '12px',
              fontWeight: 700,
              fontFamily: BRAND_FONT_BODY,
            }}>
              ⚠️ Warning: No per-question answers data found for this session. The matrix will show all as incorrect. Please ensure the game saves each player's answers during the quiz.
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table className="print-table" style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Rank</th>
                  <th style={{...styles.th, textAlign: 'left'}}>Student Name</th>
                  <th style={styles.th}>Score</th>
                  {questionNumbers.map(q => (
                    <th key={`Q${q}`} style={styles.th}>Q{q}</th>
                  ))}
                  <th style={styles.th}>Correct</th>
                  <th style={styles.th}>Incorrect</th>
                </tr>
              </thead>
              <tbody>
                {rankedPlayers.map((player, index) => {
                  const correct = getPoints(player);
                  const incorrect = totalQ - correct;
                  // ✅ Look up original player from `players` array to get the freshest answers data
                  const originalPlayer = players.find(p => p.userId === player.userId);
                  const answersSource = originalPlayer?.answers || player?.answers;

                  return (
                    <tr key={player.userId} style={index % 2 === 0 ? styles.trEven : styles.trOdd}>
                      <td style={styles.td}>{index + 1}</td>
                      <td style={{...styles.td, textAlign: 'left', fontWeight: 'bold'}}>{player.name}</td>
                      <td style={styles.td}>{correct}/{totalQ}</td>
                      {questionNumbers.map(q => {
                        // ✅ FIX: Use flexible parser that handles arrays, {Q1: true}, {1: true}, etc.
                        const isCorrect = getAnswerForQuestion(answersSource, q);
                        return (
                          <td key={`Q${q}`} style={styles.td}>
                            {isCorrect ? <span className="correct-cell">✅</span> : <span className="incorrect-cell">❌</span>}
                          </td>
                        );
                      })}
                      <td style={styles.td}>{correct}</td>
                      <td style={styles.td}>{incorrect}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Actions */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} style={styles.actions} className="no-print">
        <button onClick={handlePrint} style={styles.printBtn}>
          🖨️ Print Scores
        </button>
        <button onClick={handleBackToDashboard} style={styles.backBtn}>
          🏠 Back to Dashboard
        </button>
      </motion.div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px',
    fontFamily: BRAND_FONT_BODY,
    minHeight: '100vh',
    background: palette.cream,
    color: palette.deepNavy,
    position: 'relative',
    overflow: 'hidden',
  },
  confettiBg: {
    position: 'absolute',
    inset: 0,
    background: `radial-gradient(circle at 20% 30%, ${palette.warmOrange}10 0%, transparent 50%), radial-gradient(circle at 80% 70%, ${palette.teal}10 0%, transparent 50%)`,
    pointerEvents: 'none',
  },
  header: { textAlign: 'center', marginBottom: '40px', position: 'relative', zIndex: 1 },
  title: { fontSize: '48px', fontWeight: '800', margin: '0 0 8px 0', fontFamily: BRAND_FONT_DISPLAY, color: palette.deepNavy, letterSpacing: '-0.5px' },
  subtitle: { fontSize: '18px', color: palette.bodyTextSoft, margin: 0, fontWeight: 600 },
  podiumSection: { display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '20px', marginBottom: '40px', position: 'relative', zIndex: 1, flexWrap: 'wrap' },
  podiumCard: { background: palette.white, border: `1.5px solid ${palette.border}`, borderRadius: '24px', padding: '24px 20px', textAlign: 'center', minWidth: '180px', boxShadow: `0 2px 0 ${palette.border}, 0 8px 24px ${palette.shadow}` },
  podium1st: { padding: '32px 24px', background: `${palette.gold}12`, borderColor: `${palette.gold}66`, boxShadow: `0 2px 0 ${palette.gold}40, 0 12px 32px ${palette.shadowMd}` },
  podium2nd: { background: `${palette.silver}12`, borderColor: `${palette.silver}66` },
  podium3rd: { background: `${palette.bronze}12`, borderColor: `${palette.bronze}66` },
  podiumRank: { fontSize: '48px', marginBottom: '12px' },
  podiumAvatar: { width: '80px', height: '80px', borderRadius: '50%', background: palette.creamSoft, overflow: 'hidden', margin: '0 auto 12px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', position: 'relative', border: `1.5px solid ${palette.border}` },
  podiumAvatarImg: { width: '100%', height: '130%', objectFit: 'cover', objectPosition: 'center 15%', position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)' },
  podiumAvatarEmoji: { fontSize: '40px', marginTop: '16px' },
  podiumName: { fontSize: '18px', fontWeight: '800', marginBottom: '4px', fontFamily: BRAND_FONT_DISPLAY, color: palette.deepNavy },
  podiumScore: { fontSize: '20px', fontWeight: '800', color: palette.gold, fontFamily: BRAND_FONT_DISPLAY },
  leaderboardSection: { background: palette.white, borderRadius: '20px', padding: '24px', marginBottom: '24px', border: `1.5px solid ${palette.border}`, boxShadow: `0 2px 0 ${palette.border}, 0 8px 24px ${palette.shadow}`, position: 'relative', zIndex: 1 },
  leaderboardTitle: { fontSize: '20px', fontWeight: '800', margin: '0 0 20px 0', fontFamily: BRAND_FONT_DISPLAY, color: palette.deepNavy, letterSpacing: '-0.3px' },
  leaderboardList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  leaderboardItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: palette.creamSoft, borderRadius: '12px', border: `1.5px solid ${palette.border}`, boxShadow: `0 2px 0 ${palette.border}` },
  rankBadge: { fontSize: '18px', fontWeight: '800', width: '40px', textAlign: 'center', fontFamily: BRAND_FONT_DISPLAY, color: palette.deepNavy },
  playerAvatarSmall: { width: '40px', height: '40px', borderRadius: '50%', background: palette.white, overflow: 'hidden', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', flexShrink: 0, position: 'relative', border: `1.5px solid ${palette.border}` },
  avatarImgSmall: { width: '100%', height: '130%', objectFit: 'cover', objectPosition: 'center 15%', position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)' },
  avatarEmojiSmall: { fontSize: '20px', marginTop: '8px' },
  playerName: { flex: 1, fontSize: '15px', fontWeight: '700', fontFamily: BRAND_FONT_BODY, color: palette.deepNavy },
  playerStats: { display: 'flex', gap: '16px', alignItems: 'center' },
  statItem: { fontSize: '13px', color: palette.bodyTextSoft, fontWeight: 600 },
  statPoints: { fontSize: '16px', fontWeight: '800', color: palette.gold, fontFamily: BRAND_FONT_DISPLAY },

  // MATRIX STYLES
  matrixSection: { background: palette.white, borderRadius: '20px', padding: '24px', marginBottom: '24px', border: `1.5px solid ${palette.border}`, boxShadow: `0 2px 0 ${palette.border}, 0 8px 24px ${palette.shadow}`, position: 'relative', zIndex: 1 },
  matrixTitle: { fontSize: '20px', fontWeight: '800', margin: '0 0 20px 0', fontFamily: BRAND_FONT_DISPLAY, color: palette.deepNavy, letterSpacing: '-0.3px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px', fontFamily: BRAND_FONT_BODY },
  th: { background: palette.creamSoft, color: palette.deepNavy, padding: '10px 8px', border: `1.5px solid ${palette.border}`, fontWeight: '800', textAlign: 'center', whiteSpace: 'nowrap' },
  td: { padding: '8px', border: `1.5px solid ${palette.border}`, textAlign: 'center', color: palette.deepNavy },
  trEven: { background: palette.white },
  trOdd: { background: palette.cream },

  actions: { display: 'flex', justifyContent: 'center', gap: '16px', position: 'relative', zIndex: 1 },
  printBtn: { padding: '16px 40px', background: palette.teal, color: palette.white, border: 'none', borderRadius: '16px', fontSize: '16px', fontWeight: '800', cursor: 'pointer', fontFamily: BRAND_FONT_DISPLAY, transition: 'all 0.15s ease', boxShadow: `0 4px 0 ${palette.tealShadow}`, letterSpacing: '0.04em', textTransform: 'uppercase' },
  backBtn: { padding: '16px 40px', background: palette.warmOrange, color: palette.white, border: 'none', borderRadius: '16px', fontSize: '16px', fontWeight: '800', cursor: 'pointer', fontFamily: BRAND_FONT_DISPLAY, transition: 'all 0.15s ease', boxShadow: `0 4px 0 ${palette.warmOrangeShadow}`, letterSpacing: '0.04em', textTransform: 'uppercase' },
};

export default LiveHostResults;