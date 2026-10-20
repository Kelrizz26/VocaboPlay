// src/components/admin/LiveHostResults.jsx
// ============================================================
// ✅ TEACHER RESULTS - FIXED PODIUM TEXT CLARITY + FULL BODY AVATARS
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

const getPoints = (player) => {
  return player?.correctAnswers || player?.correct || 0;
};

const parseAnswerValue = (val) => {
  if (val === true || val === 1 || val === 'true' || val === '1') return true;
  if (val && typeof val === 'object') {
    if (val.isCorrect === true || val.correct === true || val.is_correct === true) return true;
  }
  return false;
};

const getAnswerForQuestion = (answers, q) => {
  if (!answers) return false;
  if (Array.isArray(answers)) return parseAnswerValue(answers[q - 1]);
  if (typeof answers !== 'object') return false;
  if (Object.prototype.hasOwnProperty.call(answers, `Q${q}`)) return parseAnswerValue(answers[`Q${q}`]);
  if (Object.prototype.hasOwnProperty.call(answers, `q${q}`)) return parseAnswerValue(answers[`q${q}`]);

  const hasZeroKey =
    Object.prototype.hasOwnProperty.call(answers, 0) ||
    Object.prototype.hasOwnProperty.call(answers, '0');

  if (hasZeroKey) {
    if (Object.prototype.hasOwnProperty.call(answers, q - 1)) return parseAnswerValue(answers[q - 1]);
    if (Object.prototype.hasOwnProperty.call(answers, String(q - 1))) return parseAnswerValue(answers[String(q - 1)]);
    return false;
  }

  if (Object.prototype.hasOwnProperty.call(answers, q)) return parseAnswerValue(answers[q]);
  if (Object.prototype.hasOwnProperty.call(answers, String(q))) return parseAnswerValue(answers[String(q)]);
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

  const questionNumbers = Array.from({ length: totalQ }, (_, i) => i + 1);
  const hasAnyAnswersData = players.some(p => p?.answers && Object.keys(p.answers || {}).length > 0);

  return (
    <div style={styles.container}>
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

      <div style={styles.confettiBg} className="no-print"></div>

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.header}
        className="no-print"
      >
        <h1 style={styles.title}>🎉 Game Over!</h1>
        <p style={styles.subtitle}>{session?.activityTitle}</p>
      </motion.div>

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

      <div style={styles.contentWrapper} className="no-print">
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

      {totalQ > 0 && (
        <div style={styles.matrixSection} className="print-only">
          <h2 style={styles.matrixTitle} className="no-print">📋 Question Breakdown (Matrix)</h2>

          {!hasAnyAnswersData && (
            <div style={{ marginBottom: '12px', padding: '10px 14px', background: `rgba(224, 91, 91, 0.15)`, border: `1.5px solid ${palette.danger}`, borderRadius: '10px', color: palette.danger, fontSize: '12px', fontWeight: 700, fontFamily: BRAND_FONT_BODY }}>
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
                  {questionNumbers.map(q => <th key={`Q${q}`} style={styles.th}>Q{q}</th>)}
                  <th style={styles.th}>Correct</th>
                  <th style={styles.th}>Incorrect</th>
                </tr>
              </thead>
              <tbody>
                {rankedPlayers.map((player, index) => {
                  const correct = getPoints(player);
                  const incorrect = totalQ - correct;
                  const originalPlayer = players.find(p => p.userId === player.userId);
                  const answersSource = originalPlayer?.answers || player?.answers;

                  return (
                    <tr key={player.userId} style={index % 2 === 0 ? styles.trEven : styles.trOdd}>
                      <td style={styles.td}>{index + 1}</td>
                      <td style={{...styles.td, textAlign: 'left', fontWeight: 'bold'}}>{player.name}</td>
                      <td style={styles.td}>{correct}/{totalQ}</td>
                      {questionNumbers.map(q => {
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

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} style={styles.actions} className="no-print">
        <button onClick={handlePrint} style={styles.printBtn}>🖨️ Print Scores</button>
        <button onClick={handleBackToDashboard} style={styles.backBtn}>🏠 Back to Dashboard</button>
      </motion.div>
    </div>
  );
};

const styles = {
  container: {
    width: '100vw',
    minHeight: '100vh',
    padding: '24px clamp(16px, 3vw, 40px)',
    fontFamily: BRAND_FONT_BODY,
    backgroundImage: `url('/image/quiz-bg.png')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    backgroundRepeat: 'no-repeat',
    color: palette.white, 
    position: 'relative',
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center', 
  },
  confettiBg: {
    position: 'absolute',
    inset: 0,
    background: `radial-gradient(circle at 20% 30%, ${palette.warmOrange}05 0%, transparent 50%), radial-gradient(circle at 80% 70%, ${palette.teal}05 0%, transparent 50%)`,
    pointerEvents: 'none',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: '1200px',
    display: 'flex',
    flexDirection: 'column',
  },
  header: { textAlign: 'center', marginBottom: '40px', position: 'relative', zIndex: 1 },
  title: { fontSize: '48px', fontWeight: '800', margin: '0 0 8px 0', fontFamily: BRAND_FONT_DISPLAY, color: palette.white, letterSpacing: '-0.5px', textShadow: '0 4px 12px rgba(0,0,0,0.3)' },
  subtitle: { fontSize: '18px', color: palette.white, margin: 0, fontWeight: 600, textShadow: '0 2px 6px rgba(0,0,0,0.3)' },
  
  podiumSection: { display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '20px', marginBottom: '40px', position: 'relative', zIndex: 1, flexWrap: 'wrap', width: '100%' },
  podiumCard: { background: palette.deepNavy, border: `1.5px solid ${palette.deepNavyLight}`, borderRadius: '24px', padding: '24px 20px', textAlign: 'center', minWidth: '180px', boxShadow: `0 12px 32px rgba(0,0,0,0.3)` },
  podium1st: { padding: '32px 24px', borderColor: `${palette.gold}`, borderWidth: '3px', boxShadow: `0 12px 32px rgba(0,0,0,0.4)` },
  podium2nd: { borderColor: `${palette.silver}`, borderWidth: '3px' },
  podium3rd: { borderColor: `${palette.bronze}`, borderWidth: '3px' },
  
  podiumRank: { fontSize: '48px', marginBottom: '12px' },
  
  // ✅ FULL BODY AVATAR (PODIUM)
  podiumAvatar: { 
    width: '90px', 
    height: '120px', 
    borderRadius: '16px', 
    background: palette.creamSoft, 
    overflow: 'hidden', 
    margin: '0 auto 12px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    border: `1.5px solid ${palette.warmOrange}80` 
  },
  podiumAvatarImg: { 
    width: '100%', 
    height: '100%', 
    objectFit: 'contain', 
    padding: '4px' 
  },
  
  podiumAvatarEmoji: { fontSize: '40px' },
  podiumName: { fontSize: '18px', fontWeight: '800', marginBottom: '4px', fontFamily: BRAND_FONT_DISPLAY, color: palette.white },
  podiumScore: { fontSize: '20px', fontWeight: '800', color: palette.white, fontFamily: BRAND_FONT_DISPLAY, textShadow: '0 2px 4px rgba(0,0,0,0.3)' },
  
  leaderboardSection: { background: palette.deepNavy, borderRadius: '20px', padding: '24px', marginBottom: '24px', border: `1.5px solid ${palette.deepNavyLight}`, boxShadow: `0 12px 32px rgba(0,0,0,0.3)`, position: 'relative', zIndex: 1, width: '100%' },
  leaderboardTitle: { fontSize: '20px', fontWeight: '800', margin: '0 0 20px 0', fontFamily: BRAND_FONT_DISPLAY, color: palette.white, letterSpacing: '-0.3px' },
  leaderboardList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  leaderboardItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: palette.deepNavyLight, borderRadius: '12px', border: `1.5px solid #4A476B`, boxShadow: `0 4px 12px rgba(0,0,0,0.2)` },
  rankBadge: { fontSize: '18px', fontWeight: '800', width: '40px', textAlign: 'center', fontFamily: BRAND_FONT_DISPLAY, color: palette.white },
  
  // ✅ FULL BODY AVATAR (LEADERBOARD)
  playerAvatarSmall: { 
    width: '36px', 
    height: '48px', 
    borderRadius: '8px', 
    background: palette.creamSoft, 
    overflow: 'hidden', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    flexShrink: 0, 
    border: `1.5px solid ${palette.warmOrange}80` 
  },
  avatarImgSmall: { 
    width: '100%', 
    height: '100%', 
    objectFit: 'contain', 
    padding: '2px' 
  },
  
  avatarEmojiSmall: { fontSize: '20px' },
  playerName: { flex: 1, fontSize: '15px', fontWeight: '700', fontFamily: BRAND_FONT_BODY, color: palette.white },
  playerStats: { display: 'flex', gap: '16px', alignItems: 'center' },
  statItem: { fontSize: '13px', color: palette.bodyTextSoft, fontWeight: 600 },
  statPoints: { fontSize: '16px', fontWeight: '800', color: palette.gold, fontFamily: BRAND_FONT_DISPLAY },

  matrixSection: { background: palette.deepNavy, borderRadius: '20px', padding: '24px', marginBottom: '24px', border: `1.5px solid ${palette.deepNavyLight}`, boxShadow: `0 12px 32px rgba(0,0,0,0.3)`, position: 'relative', zIndex: 1, width: '100%', maxWidth: '1200px' },
  matrixTitle: { fontSize: '20px', fontWeight: '800', margin: '0 0 20px 0', fontFamily: BRAND_FONT_DISPLAY, color: palette.white, letterSpacing: '-0.3px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px', fontFamily: BRAND_FONT_BODY },
  th: { background: palette.deepNavyLight, color: palette.white, padding: '10px 8px', border: `1.5px solid #4A476B`, fontWeight: '800', textAlign: 'center', whiteSpace: 'nowrap' },
  td: { padding: '8px', border: `1.5px solid #4A476B`, textAlign: 'center', color: palette.white },
  trEven: { background: 'transparent' },
  trOdd: { background: 'rgba(255,255,255,0.03)' },

  actions: { display: 'flex', justifyContent: 'center', gap: '16px', position: 'relative', zIndex: 1 },
  printBtn: { padding: '16px 40px', background: palette.teal, color: palette.white, border: 'none', borderRadius: '16px', fontSize: '16px', fontWeight: '800', cursor: 'pointer', fontFamily: BRAND_FONT_DISPLAY, transition: 'all 0.15s ease', boxShadow: `0 4px 0 ${palette.tealShadow}, 0 8px 24px rgba(0,0,0,0.2)`, letterSpacing: '0.04em', textTransform: 'uppercase' },
  backBtn: { padding: '16px 40px', background: palette.warmOrange, color: palette.white, border: 'none', borderRadius: '16px', fontSize: '16px', fontWeight: '800', cursor: 'pointer', fontFamily: BRAND_FONT_DISPLAY, transition: 'all 0.15s ease', boxShadow: `0 4px 0 ${palette.warmOrangeShadow}, 0 8px 24px rgba(0,0,0,0.2)`, letterSpacing: '0.04em', textTransform: 'uppercase' },
};

export default LiveHostResults;