// src/components/admin/AdminGames.jsx

import React, { useState } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../pages/firebase';
import ModalWrapper from './ModalWrapper';
import ConfirmDialog from './ConfirmDialog';
import { inputStyle, labelStyle, btnPrimary, btnSecondary, selectStyle, catColor, catBg, gameImages } from './adminStyles';
import { colors, fontFamily } from '../dashboard/dashboardStyles';

// Import images
import wordpicsImg from '../../image/Wordpics.png';
import matchgameImg from '../../image/matchgame.png';
import shortstoryImg from '../../image/shortstory.png';
import quizgameImg from '../../image/quizgame.png';
import guesswhatgameImg from '../../image/guesswhatgame.png';
import sentenceImg from '../../image/sentence.png';

const AdminGames = ({ games, setGames, loading }) => {
  const [editingGame, setEditingGame] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [hoveredGame, setHoveredGame] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [editForm, setEditForm] = useState({
    description: '',
    totalItems: 0,
    category: 'vocab',
    difficulty: 'beginner',
    timeEstimate: '5-10 min'
  });
  const [newGame, setNewGame] = useState({
    name: '',
    icon: '🎮',
    description: '',
    totalWords: 0,
    totalPairs: 0,
    totalStories: 0,
    totalQuestions: 0,
    totalSentences: 0,
    category: 'vocab',
    difficulty: 'beginner',
    timeEstimate: '5-10 min',
    image: ''
  });

  const gameImagesMap = {
    'Word Pics': wordpicsImg,
    'Match Game': matchgameImg,
    'Short Story': shortstoryImg,
    'Quiz Master': quizgameImg,
    'GuessWhat': guesswhatgameImg,
    'Sentence Builder': sentenceImg,
  };

  const getDifficultyColor = (difficulty) => {
    if (difficulty === 'beginner') return '#2E7D32';
    if (difficulty === 'intermediate') return '#B85C1A';
    if (difficulty === 'advanced') return '#B91C1C';
    return '#64748b';
  };

  const getStats = (g) => {
    if (g.name === 'Word Pics') return `${g.totalWords || 30} words`;
    if (g.name === 'Match Game') return `${g.totalPairs || 6} pairs`;
    if (g.name === 'Short Story') return `${g.totalStories || 5} stories`;
    if (g.name === 'Quiz Master') return `${g.totalQuestions || 10} questions`;
    if (g.name === 'GuessWhat') return `${g.totalQuestions || 10} questions`;
    if (g.name === 'Sentence Builder') return `${g.totalSentences || 5} sentences`;
    return '0 items';
  };

  const updateGame = async () => {
    try {
      const gameRef = doc(db, 'games', editingGame);
      const n = parseInt(editForm.totalItems) || 0;

      const updates = {
        description: editForm.description,
        category: editForm.category,
        difficulty: editForm.difficulty,
        timeEstimate: editForm.timeEstimate,
        lastUpdated: new Date().toISOString()
      };

      const game = games.find(g => g.id === editingGame);
      if (game.name === 'Word Pics') updates.totalWords = n;
      if (game.name === 'Match Game') updates.totalPairs = n;
      if (game.name === 'Short Story') updates.totalStories = n;
      if (game.name === 'Quiz Master') updates.totalQuestions = n;
      if (game.name === 'GuessWhat') updates.totalQuestions = n;
      if (game.name === 'Sentence Builder') updates.totalSentences = n;

      await updateDoc(gameRef, updates);

      setGames(games.map(g => {
        if (g.id !== editingGame) return g;
        return { ...g, ...updates, color: catColor(editForm.category), iconBg: catBg(editForm.category) };
      }));
      setEditingGame(null);
    } catch (error) {
      console.error('Error updating game:', error);
      alert('Error updating game');
    }
  };

  const addGame = async () => {
    if (!newGame.name || !newGame.description) return alert('Fill in required fields.');

    try {
      const color = catColor(newGame.category);
      const gameData = {
        ...newGame,
        timesPlayed: 0,
        avgScore: 0,
        color,
        iconBg: catBg(newGame.category),
        accentColor: color,
        lastUpdated: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'games'), gameData);
      setGames([...games, { id: docRef.id, ...gameData }]);
      setIsAdding(false);
      setNewGame({
        name: '', icon: '🎮', description: '',
        totalWords: 0, totalPairs: 0, totalStories: 0, totalQuestions: 0, totalSentences: 0,
        category: 'vocab', difficulty: 'beginner', timeEstimate: '5-10 min', image: ''
      });
    } catch (error) {
      console.error('Error adding game:', error);
      alert('Error adding game');
    }
  };

  const incrementPlayed = async (gameId) => {
    try {
      const game = games.find(g => g.id === gameId);
      const newCount = (game.timesPlayed || 0) + 1;

      const gameRef = doc(db, 'games', gameId);
      await updateDoc(gameRef, { timesPlayed: newCount });

      setGames(games.map(g => g.id === gameId ? { ...g, timesPlayed: newCount } : g));
    } catch (error) {
      console.error('Error incrementing plays:', error);
    }
  };

  const deleteGame = async (gameId) => {
    try {
      await deleteDoc(doc(db, 'games', gameId));
      setGames(games.filter(g => g.id !== gameId));
    } catch (error) {
      console.error('Error deleting game:', error);
      alert('Error deleting game');
    }
  };

  const resetStats = async (gameId) => {
    try {
      const gameRef = doc(db, 'games', gameId);
      await updateDoc(gameRef, { timesPlayed: 0, avgScore: 0 });
      setGames(games.map(g => g.id === gameId ? { ...g, timesPlayed: 0, avgScore: 0 } : g));
    } catch (error) {
      console.error('Error resetting stats:', error);
      alert('Error resetting stats');
    }
  };

  const requestDeleteGame = (gameId) => {
    setConfirmAction({
      title: 'Delete Game',
      message: 'This will permanently delete this game. This cannot be undone.',
      confirmLabel: 'Delete',
      danger: true,
      onConfirm: () => { deleteGame(gameId); setConfirmAction(null); },
    });
  };

  const requestResetStats = (gameId) => {
    setConfirmAction({
      title: 'Reset Stats',
      message: 'This will reset the play count and average score for this game.',
      confirmLabel: 'Reset',
      danger: false,
      onConfirm: () => { resetStats(gameId); setConfirmAction(null); },
    });
  };

  return (
    <div>
      {/* HEADER - REMOVED ADD GAME BUTTON */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: '32px',
        borderBottom: `1px solid ${colors.border}`,
        paddingBottom: '20px'
      }}>
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: '6px',
            fontFamily
          }}>Game Management</h1>
          <p style={{
            fontSize: '15px',
            color: colors.textSecondary,
            margin: 0,
            fontWeight: '300',
            fontFamily
          }}>Manage and configure all learning games</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{
            fontSize: '13px',
            color: colors.textSecondary,
            background: colors.bg,
            padding: '8px 16px',
            borderRadius: '90px',
            border: `1px solid ${colors.border}`,
            fontFamily
          }}>Total Games: {games.length}</span>
          {/* ✅ REMOVED: Add Game Button */}
        </div>
      </div>

      {loading.games ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px', 
          color: colors.textSecondary 
        }}>⏳ Loading Games...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {games.map(game => {
            const gameImage = game.image || gameImagesMap[game.name] || '';
            const accentColor = game.accentColor || catColor(game.category) || colors.accent;

            return (
              <div
                key={game.id}
                onMouseEnter={() => setHoveredGame(game.id)}
                onMouseLeave={() => setHoveredGame(null)}
                style={{
                  background: colors.surface,
                  border: `1px solid ${hoveredGame === game.id ? colors.accent : colors.border}`,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                  boxShadow: hoveredGame === game.id
                    ? `0 8px 16px -8px ${accentColor}30`
                    : '0 2px 4px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                }}
              >
                <div style={{
                  width: '100%',
                  height: '140px',
                  background: `linear-gradient(135deg, ${accentColor}10, ${accentColor}05)`,
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <img
                    src={gameImage}
                    alt={game.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.2s ease',
                      transform: hoveredGame === game.id ? 'scale(1.03)' : 'scale(1)',
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentNode.style.background = game.iconBg || colors.bg;
                      const fallback = document.createElement('div');
                      fallback.style.cssText = `
                        width: 100%;
                        height: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 40px;
                        color: ${accentColor};
                      `;
                      fallback.textContent = game.icon || '🎮';
                      e.target.parentNode.appendChild(fallback);
                    }}
                  />

                  <span style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '500',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: getDifficultyColor(game.difficulty),
                    textTransform: 'capitalize',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    zIndex: 1,
                    fontFamily,
                  }}>
                    {game.difficulty}
                  </span>

                  <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                    display: 'flex',
                    gap: '6px',
                    zIndex: 2,
                  }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        incrementPlayed(game.id);
                      }}
                      style={{
                        padding: '4px 8px',
                        background: 'rgba(255,255,255,0.9)',
                        border: `1px solid ${colors.border}`,
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: '600',
                        color: colors.textSecondary,
                        cursor: 'pointer',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      +1 Play
                    </button>
                  </div>
                </div>

                <div style={{ padding: '20px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '12px',
                  }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: colors.textPrimary,
                      margin: '0',
                      fontFamily,
                    }}>
                      {game.name}
                    </h3>

                    <span style={{
                      fontSize: '11px',
                      background: '#e8f5e9',
                      color: '#2e7d32',
                      padding: '2px 10px',
                      borderRadius: '8px',
                      fontWeight: '600'
                    }}>
                      Active
                    </span>
                  </div>

                  <p style={{
                    fontSize: '13px',
                    color: colors.textSecondary,
                    lineHeight: '1.5',
                    margin: '0 0 12px 0',
                    fontFamily,
                  }}>
                    {game.description}
                  </p>

                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap',
                    marginBottom: '16px',
                  }}>
                    <span style={{
                      fontSize: '12px',
                      background: colors.bg,
                      color: colors.textSecondary,
                      padding: '4px 12px',
                      borderRadius: '8px'
                    }}>
                      {getStats(game)}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      background: colors.bg,
                      color: colors.textSecondary,
                      padding: '4px 12px',
                      borderRadius: '8px'
                    }}>
                      {game.category}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      background: colors.bg,
                      color: colors.textSecondary,
                      padding: '4px 12px',
                      borderRadius: '8px'
                    }}>
                      ⏱️ {game.timeEstimate}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '20px',
                    padding: '12px',
                    background: colors.bg,
                    borderRadius: '12px',
                  }}>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{ 
                        fontSize: '18px', 
                        fontWeight: '700', 
                        color: colors.textPrimary 
                      }}>
                        {game.timesPlayed || 0}
                      </div>
                      <div style={{ 
                        fontSize: '11px', 
                        color: colors.textSecondary 
                      }}>Times Played</div>
                    </div>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: (game.avgScore || 0) >= 70 ? '#2e7d32' : '#ed6c02'
                      }}>
                        {game.avgScore > 0 ? `${game.avgScore}%` : '—'}
                      </div>
                      <div style={{ 
                        fontSize: '11px', 
                        color: colors.textSecondary 
                      }}>Avg Score</div>
                    </div>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{ 
                        fontSize: '11px', 
                        color: colors.textSecondary 
                      }}>Updated</div>
                      <div style={{ 
                        fontSize: '11px', 
                        color: colors.textSecondary 
                      }}>
                        {game.lastUpdated ? new Date(game.lastUpdated).toLocaleDateString() : 'Today'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <button
                      onClick={() => {
                        setEditingGame(game.id);
                        setEditForm({
                          description: game.description,
                          totalItems: game.totalWords || game.totalPairs || game.totalStories || game.totalQuestions || game.totalSentences || 0,
                          category: game.category,
                          difficulty: game.difficulty,
                          timeEstimate: game.timeEstimate
                        });
                      }}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: colors.accent,
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        fontFamily,
                      }}
                    >
                      Edit Game
                    </button>
                    <button
                      onClick={() => requestDeleteGame(game.id)}
                      style={{
                        padding: '10px 16px',
                        background: '#fef2f2',
                        color: '#b91c1c',
                        border: '1px solid #fee2e2',
                        borderRadius: '8px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        fontFamily,
                      }}
                    >
                      Delete
                    </button>
                  </div>

                  <button
                    onClick={() => requestResetStats(game.id)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      background: 'transparent',
                      color: colors.textSecondary,
                      border: `1px dashed ${colors.border}`,
                      borderRadius: '8px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontFamily,
                    }}
                  >
                    Reset Stats
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Game Modal - COLORS LANG PINALITAN */}
      {editingGame && (
        <ModalWrapper onClose={() => setEditingGame(null)}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            marginBottom: '24px', 
            color: colors.textPrimary 
          }}>Edit Game Settings</h2>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Description</label>
            <textarea
              value={editForm.description}
              onChange={e => setEditForm({ ...editForm, description: e.target.value })}
              rows="3"
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Category</label>
            <select value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })} style={selectStyle}>
              {[['vocab', 'Vocabulary'], ['reading', 'Reading'], ['challenge', 'Challenge']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Difficulty</label>
            <select value={editForm.difficulty} onChange={e => setEditForm({ ...editForm, difficulty: e.target.value })} style={selectStyle}>
              {[['beginner', 'Beginner'], ['intermediate', 'Intermediate'], ['advanced', 'Advanced']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Time Estimate</label>
            <input
              type="text"
              value={editForm.timeEstimate}
              onChange={e => setEditForm({ ...editForm, timeEstimate: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: '28px' }}>
            <label style={labelStyle}>Total Items</label>
            <input
              type="number"
              value={editForm.totalItems}
              onChange={e => setEditForm({ ...editForm, totalItems: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setEditingGame(null)} style={btnSecondary}>Cancel</button>
            <button onClick={updateGame} style={btnPrimary}>Save Changes</button>
          </div>
        </ModalWrapper>
      )}

      {/* Add Game Modal - COLORS LANG PINALITAN (nandito pa rin kasi may Add Student/Games function pa rin) */}
      {isAdding && (
        <ModalWrapper onClose={() => setIsAdding(false)}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            marginBottom: '24px', 
            color: colors.textPrimary 
          }}>Add New Game</h2>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Game Name *</label>
            <input
              type="text"
              value={newGame.name}
              onChange={e => setNewGame({ ...newGame, name: e.target.value })}
              placeholder="e.g., Vocabulary Race"
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Description *</label>
            <textarea
              value={newGame.description}
              onChange={e => setNewGame({ ...newGame, description: e.target.value })}
              rows="3"
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Icon (for fallback)</label>
            <select value={newGame.icon} onChange={e => setNewGame({ ...newGame, icon: e.target.value })} style={selectStyle}>
              {[['🎮', 'Game'], ['📇', 'Flashcards'], ['🎯', 'Match'], ['📖', 'Story'], ['❓', 'Quiz'], ['🤔', 'GuessWhat'], ['📝', 'Sentence Builder']].map(([v, l]) => <option key={v} value={v}>{v} {l}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Image Path *</label>
            <input
              type="text"
              value={newGame.image}
              onChange={e => setNewGame({ ...newGame, image: e.target.value })}
              placeholder="src/image/wordpics.png"
              style={inputStyle}
            />
            <small style={{ 
              color: colors.textSecondary, 
              fontSize: '11px', 
              marginTop: '4px', 
              display: 'block' 
            }}>
              Example: src/image/wordpics.png
            </small>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Category</label>
              <select value={newGame.category} onChange={e => setNewGame({ ...newGame, category: e.target.value })} style={selectStyle}>
                {[['vocab', 'Vocabulary'], ['reading', 'Reading'], ['challenge', 'Challenge']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Difficulty</label>
              <select value={newGame.difficulty} onChange={e => setNewGame({ ...newGame, difficulty: e.target.value })} style={selectStyle}>
                {[['beginner', 'Beginner'], ['intermediate', 'Intermediate'], ['advanced', 'Advanced']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: '28px' }}>
            <label style={labelStyle}>Time Estimate</label>
            <input
              type="text"
              value={newGame.timeEstimate}
              onChange={e => setNewGame({ ...newGame, timeEstimate: e.target.value })}
              placeholder="e.g., 5-10 min"
              style={inputStyle}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setIsAdding(false)} style={btnSecondary}>Cancel</button>
            <button onClick={addGame} style={btnPrimary}>Add Game</button>
          </div>
        </ModalWrapper>
      )}

      <ConfirmDialog
        open={!!confirmAction}
        title={confirmAction?.title}
        message={confirmAction?.message}
        confirmLabel={confirmAction?.confirmLabel}
        danger={confirmAction?.danger}
        onConfirm={confirmAction?.onConfirm}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
};

export default AdminGames;