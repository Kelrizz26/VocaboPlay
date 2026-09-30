// src/components/admin/AdminActivities.jsx
// ============================================================
// ✅ ADMIN ACTIVITIES - Shows teacher-created quizzes/exams
// with PIN, Host Live, Scores, Edit, Delete, Search & Filter
// ✅ UPDATED: Edit modal now allows editing QUESTIONS and OPTIONS (A, B, C, D)
// ✅ FIXED: Only ONE option shows the ✅ checkmark (uses findIndex)
// ============================================================

import React, { useState, useMemo } from 'react';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../pages/firebase';
import ModalWrapper from './ModalWrapper';
import ConfirmDialog from './ConfirmDialog';
import { inputStyle, labelStyle, btnPrimary, btnSecondary, selectStyle } from './adminStyles';
import { colors, fontFamily, fontFamilyDisplay } from '../dashboard/dashboardStyles';

const AdminActivities = ({
  activities,
  setActivities,
  loading,
  onHostLive,
  onShowScores,
  onCreateActivity,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingActivity, setEditingActivity] = useState(null);
  const [editQuestions, setEditQuestions] = useState([]);
  const [savingEdit, setSavingEdit] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    gameType: 'quiz',
    category: '',
    difficulty: 3,
    isActive: true,
  });

  const filteredActivities = useMemo(() => {
    return activities.filter((a) => {
      const matchesSearch =
        !searchTerm ||
        a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.gamePin?.includes(searchTerm) ||
        a.category?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === 'all' || a.gameType === filterType;
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && a.isActive) ||
        (filterStatus === 'inactive' && !a.isActive);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [activities, searchTerm, filterType, filterStatus]);

  const stats = useMemo(() => {
    const total = activities.length;
    const totalQuestions = activities.reduce((sum, a) => sum + (a.totalQuestions || 0), 0);
    const totalParticipants = activities.reduce((sum, a) => sum + (a.participants || 0), 0);
    const activeCount = activities.filter((a) => a.isActive).length;
    return { total, totalQuestions, totalParticipants, activeCount };
  }, [activities]);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'quiz': return '📝';
      case 'match': return '🎯';
      case 'wordpics': return '🖼️';
      default: return '❓';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'quiz': return 'Quiz';
      case 'match': return 'Match';
      case 'wordpics': return 'Word Pics';
      default: return 'Activity';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'quiz': return colors.accent;
      case 'match': return colors.danger;
      case 'wordpics': return colors.teal;
      default: return colors.textMuted;
    }
  };

  const getDifficultyLabel = (d) => {
    const map = { 1: 'Beginner', 2: 'Easy', 3: 'Intermediate', 4: 'Advanced', 5: 'Expert' };
    return map[d] || 'Intermediate';
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return '—'; }
  };

  const toggleActive = async (activity) => {
    try {
      const ref = doc(db, 'activities', activity.id);
      await updateDoc(ref, { isActive: !activity.isActive });
      setActivities(activities.map((a) => a.id === activity.id ? { ...a, isActive: !a.isActive } : a));
    } catch (error) { console.error(error); alert('Error updating status'); }
  };

  // ============================================================
  // ✅ START EDIT — Deep copy questions so the original won't be mutated
  // ============================================================
  const startEdit = (activity) => {
    setEditingActivity(activity.id);
    setEditForm({
      title: activity.title || '',
      gameType: activity.gameType || 'quiz',
      category: activity.category || '',
      difficulty: activity.difficulty || 3,
      isActive: activity.isActive !== false,
    });
    const qs = (activity.questions || []).map((q, idx) => ({
      ...q,
      id: q.id || `q-${idx}-${Date.now()}`,
      options: Array.isArray(q.options) && q.options.length > 0
        ? [...q.options]
        : ['', '', '', ''],
    }));
    setEditQuestions(qs);
  };

  // ============================================================
  // ✅ QUESTION EDIT HANDLERS
  // ============================================================
  const updateQuestionText = (index, value) => {
    setEditQuestions(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], question: value };
      return copy;
    });
  };

  const updateOption = (qIndex, optIndex, value) => {
    setEditQuestions(prev => {
      const copy = [...prev];
      const opts = [...(copy[qIndex].options || [])];
      const oldValue = opts[optIndex];
      opts[optIndex] = value;
      const updatedQ = { ...copy[qIndex], options: opts };
      // If the option you changed was the previous correct answer, update it too
      if (copy[qIndex].correctAnswer === oldValue) {
        updatedQ.correctAnswer = value;
      }
      copy[qIndex] = updatedQ;
      return copy;
    });
  };

  const setCorrectAnswer = (qIndex, optionText) => {
    setEditQuestions(prev => {
      const copy = [...prev];
      copy[qIndex] = { ...copy[qIndex], correctAnswer: optionText };
      return copy;
    });
  };

  const addQuestionToEdit = () => {
    setEditQuestions(prev => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        type: 'custom',
        wordId: null,
        word: '',
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        difficulty: editForm.difficulty || 3,
        category: editForm.category || 'custom',
      }
    ]);
  };

  const removeQuestionFromEdit = (index) => {
    setEditQuestions(prev => prev.filter((_, i) => i !== index));
  };

  // ============================================================
  // ✅ SAVE EDIT — Validate then update Firestore
  // ============================================================
  const saveEdit = async () => {
    if (!editForm.title.trim()) {
      alert('Title is required');
      return;
    }

    for (let i = 0; i < editQuestions.length; i++) {
      const q = editQuestions[i];
      if (!q.question?.trim()) {
        alert(`Question #${i + 1} is empty. Please fill it in or remove it.`);
        return;
      }
      if (!q.options || q.options.length < 2 || !q.options[0]?.trim() || !q.options[1]?.trim()) {
        alert(`Question #${i + 1} needs at least options A and B.`);
        return;
      }
      if (!q.correctAnswer?.trim()) {
        alert(`Question #${i + 1} needs a correct answer. Please click on the ✅ next to the correct option.`);
        return;
      }
    }

    setSavingEdit(true);
    try {
      const ref = doc(db, 'activities', editingActivity);
      const updateData = {
        title: editForm.title.trim(),
        gameType: editForm.gameType,
        category: editForm.category,
        difficulty: editForm.difficulty,
        isActive: editForm.isActive,
        questions: editQuestions,
        totalQuestions: editQuestions.length,
      };
      await updateDoc(ref, updateData);
      setActivities(activities.map((a) => a.id === editingActivity ? { ...a, ...updateData } : a));
      setEditingActivity(null);
      setEditQuestions([]);
    } catch (error) {
      console.error(error);
      alert('Error saving changes: ' + error.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const cancelEdit = () => {
    setEditingActivity(null);
    setEditQuestions([]);
  };

  const deleteActivity = async (id) => {
    try {
      await deleteDoc(doc(db, 'activities', id));
      setActivities(activities.filter((a) => a.id !== id));
    } catch (error) { console.error(error); alert('Error deleting activity'); }
  };

  const requestDelete = (activity) => {
    setConfirmAction({
      title: 'Delete Activity',
      message: `Are you sure you want to delete "${activity.title}"?`,
      confirmLabel: 'Delete',
      danger: true,
      onConfirm: () => { deleteActivity(activity.id); setConfirmAction(null); },
    });
  };

  return (
    <div>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', borderBottom: `1.5px solid ${colors.border}`, paddingBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: colors.textPrimary, marginBottom: '6px', fontFamily: fontFamilyDisplay, letterSpacing: '-0.4px' }}>Activities</h1>
          <p style={{ fontSize: '15px', color: colors.textSecondary, margin: 0, fontWeight: 600, fontFamily }}>Manage all quizzes and exams created by teachers</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={onCreateActivity} style={{ padding: '12px 22px', background: colors.accent, color: colors.white, border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', fontFamily: fontFamilyDisplay, letterSpacing: '0.04em', textTransform: 'uppercase', boxShadow: `0 4px 0 ${colors.accentHover}` }}>➕ Create Activity</button>
          <span style={{ fontSize: '13px', color: colors.textSecondary, background: colors.surfaceSoft, padding: '8px 16px', borderRadius: '999px', border: `1.5px solid ${colors.border}`, fontFamily, fontWeight: 700, boxShadow: `0 2px 0 ${colors.border}` }}>Total: {stats.total} Activities</span>
        </div>
      </div>

      {/* STATS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="Total Activities" value={stats.total} icon="📋" color={colors.accent} />
        <StatCard label="Active" value={stats.activeCount} icon="✅" color={colors.success} />
        <StatCard label="Total Questions" value={stats.totalQuestions} icon="❓" color={colors.danger} />
        <StatCard label="Total Participants" value={stats.totalParticipants} icon="👥" color={colors.teal} />
      </div>

      {/* SEARCH & FILTERS */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="text" placeholder="🔍 Search by title, PIN, or category..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: '1', minWidth: '220px', padding: '12px 16px', border: `1.5px solid ${colors.border}`, borderRadius: '12px', fontSize: '14px', fontFamily, fontWeight: 600, background: colors.surfaceSoft, color: colors.textPrimary, outline: 'none', boxShadow: `0 2px 0 ${colors.border}` }} />
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ padding: '12px 16px', border: `1.5px solid ${colors.border}`, borderRadius: '12px', fontSize: '14px', fontFamily, fontWeight: 700, background: colors.surface, color: colors.textPrimary, cursor: 'pointer', outline: 'none', boxShadow: `0 2px 0 ${colors.border}` }}>
          <option value="all">All Types</option>
          <option value="quiz">📝 Quiz</option>
          <option value="match">🎯 Match</option>
          <option value="wordpics">🖼️ Word Pics</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '12px 16px', border: `1.5px solid ${colors.border}`, borderRadius: '12px', fontSize: '14px', fontFamily, fontWeight: 700, background: colors.surface, color: colors.textPrimary, cursor: 'pointer', outline: 'none', boxShadow: `0 2px 0 ${colors.border}` }}>
          <option value="all">All Status</option>
          <option value="active">✅ Active</option>
          <option value="inactive">⛔ Inactive</option>
        </select>
      </div>

      {/* ACTIVITIES GRID */}
      {loading.activities ? (
        <div style={{ textAlign: 'center', padding: '80px', background: colors.surface, borderRadius: '16px', border: `1.5px solid ${colors.border}`, color: colors.textSecondary, fontFamily, fontWeight: 600 }}>⏳ Loading Activities...</div>
      ) : filteredActivities.length === 0 ? (
        <EmptyState hasActivities={activities.length > 0} searchTerm={searchTerm} onCreateActivity={onCreateActivity} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {filteredActivities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onHostLive={onHostLive}
              onShowScores={onShowScores}
              onEdit={startEdit}
              onDelete={requestDelete}
              onToggleActive={toggleActive}
              getTypeIcon={getTypeIcon}
              getTypeLabel={getTypeLabel}
              getTypeColor={getTypeColor}
              getDifficultyLabel={getDifficultyLabel}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}

      {/* ============================================================
          EDIT MODAL — NOW WITH FULL QUESTION EDITOR!
          ============================================================ */}
      {editingActivity && (
        <ModalWrapper onClose={cancelEdit}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '24px', color: colors.textPrimary, fontFamily: fontFamilyDisplay }}>
            ✏️ Edit Activity
          </h2>

          {/* Activity Title */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Activity Title *</label>
            <input
              type="text"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              style={inputStyle}
              placeholder="e.g., Science Quiz #1"
            />
          </div>

          {/* Questions Section */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
              paddingBottom: '10px',
              borderBottom: `1.5px solid ${colors.border}`,
            }}>
              <div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 800,
                  color: colors.textPrimary,
                  fontFamily: fontFamilyDisplay,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}>
                  📝 Questions ({editQuestions.length})
                </div>
                <div style={{
                  fontSize: '12px',
                  color: colors.textSecondary,
                  fontFamily,
                  fontWeight: 600,
                  marginTop: '2px',
                }}>
                  Click the circle to mark the correct answer
                </div>
              </div>
              <button
                onClick={addQuestionToEdit}
                style={{
                  padding: '8px 14px',
                  background: colors.success,
                  color: colors.white,
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontFamily: fontFamilyDisplay,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  boxShadow: `0 3px 0 ${colors.successHover || '#5E7F55'}`,
                }}
              >
                ➕ Add Question
              </button>
            </div>

            {editQuestions.length === 0 ? (
              <div style={{
                padding: '30px',
                textAlign: 'center',
                background: colors.surfaceSoft,
                borderRadius: '12px',
                border: `1.5px dashed ${colors.border}`,
                color: colors.textSecondary,
                fontFamily,
                fontWeight: 600,
                fontSize: '13px',
              }}>
                No questions yet. Click "➕ Add Question" to start.
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                maxHeight: '55vh',
                overflowY: 'auto',
                paddingRight: '6px',
              }}>
                {editQuestions.map((q, qIndex) => {
                  // ✅ FIX: Find only the FIRST index that matches correctAnswer.
                  // Even if all options have the same text, only one will have the ✅.
                  const correctOptionIndex = (q.options || []).findIndex(
                    (opt) => opt === q.correctAnswer && opt.trim() !== ''
                  );

                  return (
                    <div
                      key={q.id || qIndex}
                      style={{
                        padding: '16px',
                        background: colors.surfaceSoft,
                        borderRadius: '14px',
                        border: `1.5px solid ${colors.border}`,
                        boxShadow: `0 2px 0 ${colors.border}`,
                      }}
                    >
                      {/* Question Header */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px',
                      }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          color: colors.accent,
                          background: `${colors.accent}15`,
                          padding: '3px 10px',
                          borderRadius: '999px',
                          fontFamily: fontFamilyDisplay,
                          border: `1px solid ${colors.accent}40`,
                          letterSpacing: '0.04em',
                        }}>
                          Q{qIndex + 1}
                        </span>
                        <button
                          onClick={() => removeQuestionFromEdit(qIndex)}
                          style={{
                            background: `${colors.danger}15`,
                            border: `1.5px solid ${colors.danger}40`,
                            color: colors.danger,
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title="Remove question"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Question Text */}
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          color: colors.textSecondary,
                          display: 'block',
                          marginBottom: '6px',
                          fontFamily: fontFamilyDisplay,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                        }}>
                          Question *
                        </label>
                        <input
                          type="text"
                          value={q.question || ''}
                          onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                          placeholder="Enter your question"
                          style={inputStyle}
                        />
                      </div>

                      {/* Options A, B, C, D */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '10px',
                        marginBottom: '12px',
                      }}>
                        {['A', 'B', 'C', 'D'].map((letter, optIndex) => {
                          const optValue = q.options?.[optIndex] || '';
                          // ✅ FIX: Only one correct — the FIRST match from findIndex
                          const isCorrect = optIndex === correctOptionIndex && optValue.trim() !== '';

                          return (
                            <div key={letter} style={{ position: 'relative' }}>
                              <label style={{
                                fontSize: '10px',
                                fontWeight: 800,
                                color: colors.textSecondary,
                                display: 'block',
                                marginBottom: '4px',
                                fontFamily: fontFamilyDisplay,
                                letterSpacing: '0.04em',
                              }}>
                                Option {letter} {(optIndex === 0 || optIndex === 1) && '*'}
                              </label>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <input
                                  type="text"
                                  value={optValue}
                                  onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                                  placeholder={`Option ${letter}${optIndex >= 2 ? ' (optional)' : ''}`}
                                  style={{
                                    ...inputStyle,
                                    borderColor: isCorrect ? colors.success : colors.border,
                                    background: isCorrect ? `${colors.success}10` : inputStyle.background,
                                  }}
                                />
                                <button
                                  onClick={() => optValue.trim() && setCorrectAnswer(qIndex, optValue)}
                                  disabled={!optValue.trim()}
                                  style={{
                                    flexShrink: 0,
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    border: `1.5px solid ${isCorrect ? colors.success : colors.border}`,
                                    background: isCorrect ? colors.success : colors.surface,
                                    color: isCorrect ? colors.white : 'transparent',
                                    cursor: optValue.trim() ? 'pointer' : 'not-allowed',
                                    opacity: optValue.trim() ? 1 : 0.5,
                                    fontSize: '14px',
                                    fontWeight: 800,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.15s ease',
                                  }}
                                  title={isCorrect ? 'Correct answer' : 'Mark as correct'}
                                >
                                  {isCorrect ? '✓' : ''}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Correct Answer Hint */}
                      {!q.correctAnswer && (
                        <div style={{
                          fontSize: '11px',
                          color: colors.danger,
                          fontFamily,
                          fontWeight: 700,
                          marginTop: '4px',
                        }}>
                          ⚠️ Please mark the correct answer by clicking the circle button.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px', paddingTop: '20px', borderTop: `1.5px solid ${colors.border}` }}>
            <button onClick={cancelEdit} style={btnSecondary} disabled={savingEdit}>
              Cancel
            </button>
            <button onClick={saveEdit} style={btnPrimary} disabled={savingEdit}>
              {savingEdit ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </ModalWrapper>
      )}

      <ConfirmDialog open={!!confirmAction} title={confirmAction?.title} message={confirmAction?.message} confirmLabel={confirmAction?.confirmLabel} danger={confirmAction?.danger} onConfirm={confirmAction?.onConfirm} onCancel={() => setConfirmAction(null)} />
    </div>
  );
};

// SUB-COMPONENTS
const StatCard = ({ label, value, icon, color }) => (
  <div style={{ background: colors.surface, border: `1.5px solid ${colors.border}`, borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: `0 2px 0 ${colors.border}` }}>
    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `${color}15`, color, border: `1.5px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>{icon}</div>
    <div><div style={{ fontSize: '22px', fontWeight: 800, color: colors.textPrimary, fontFamily: fontFamilyDisplay, lineHeight: 1.2 }}>{value}</div><div style={{ fontSize: '12px', color: colors.textSecondary, fontFamily, marginTop: '2px', fontWeight: 700 }}>{label}</div></div>
  </div>
);

const ActivityCard = ({ activity, onHostLive, onShowScores, onEdit, onDelete, onToggleActive, getTypeIcon, getTypeLabel, getTypeColor, getDifficultyLabel, formatDate }) => {
  const [hovered, setHovered] = useState(false);
  const accent = getTypeColor(activity.gameType);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ background: colors.surface, border: `1.5px solid ${hovered ? `${accent}66` : colors.border}`, borderTop: `6px solid ${accent}`, borderRadius: '16px', overflow: 'hidden', transition: 'all 0.2s ease', boxShadow: hovered ? `0 2px 0 ${colors.border}, 0 10px 24px ${colors.shadow}` : `0 2px 0 ${colors.border}`, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '18px 20px', background: `${accent}10`, borderBottom: `1.5px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${accent}20`, color: accent, border: `1.5px solid ${accent}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>{getTypeIcon(activity.gameType)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: colors.textPrimary, margin: 0, fontFamily: fontFamilyDisplay, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activity.title}</h3>
          <div style={{ fontSize: '12px', color: colors.textSecondary, fontFamily, marginTop: '2px', fontWeight: 600 }}>{getTypeLabel(activity.gameType)} • {activity.totalQuestions || 0} questions</div>
        </div>
        <span style={{ fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '999px', background: activity.isActive ? colors.successSoft : colors.dangerSoft, color: activity.isActive ? colors.success : colors.danger, border: `1.5px solid ${activity.isActive ? `${colors.success}40` : `${colors.danger}40`}`, flexShrink: 0 }}>{activity.isActive ? '● Active' : '○ Inactive'}</span>
      </div>
      <div style={{ padding: '14px 20px', background: colors.surfaceSoft, borderBottom: `1.5px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: colors.textSecondary, fontFamily, fontWeight: 700 }}>🔑 Game PIN</span>
        <span style={{ fontSize: '18px', fontWeight: 800, color: accent, fontFamily: fontFamilyDisplay, letterSpacing: '2px' }}>{activity.gamePin || '------'}</span>
      </div>
      <div style={{ padding: '16px 20px', flex: 1 }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
          <Chip>{activity.category || 'General'}</Chip>
          <Chip>⭐ {getDifficultyLabel(activity.difficulty)}</Chip>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: colors.surfaceSoft, borderRadius: '12px', border: `1.5px solid ${colors.border}`, marginBottom: '14px' }}>
          <MiniStat label="Questions" value={activity.totalQuestions || 0} />
          <div style={{ width: '1px', background: colors.border }} />
          <MiniStat label="Participants" value={activity.participants || 0} />
          <div style={{ width: '1px', background: colors.border }} />
          <MiniStat label="Created" value={formatDate(activity.createdAt)} small />
        </div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <button onClick={() => onHostLive && onHostLive(activity)} style={{ flex: 1, padding: '10px', background: colors.accent, color: colors.white, border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', fontFamily: fontFamilyDisplay, letterSpacing: '0.04em', textTransform: 'uppercase', boxShadow: `0 3px 0 ${colors.accentHover}` }}>🎮 Host Live</button>
          <button onClick={() => onShowScores && onShowScores(activity)} style={{ flex: 1, padding: '10px', background: colors.surface, color: colors.textPrimary, border: `1.5px solid ${colors.border}`, borderRadius: '12px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', fontFamily: fontFamilyDisplay, letterSpacing: '0.04em', textTransform: 'uppercase', boxShadow: `0 3px 0 ${colors.border}` }}>📊 Scores</button>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => onEdit(activity)} style={{ flex: 1, padding: '8px', background: colors.surface, color: colors.textSecondary, border: `1.5px solid ${colors.border}`, borderRadius: '10px', fontSize: '12px', fontWeight: 800, cursor: 'pointer', fontFamily: fontFamilyDisplay, letterSpacing: '0.04em', textTransform: 'uppercase', boxShadow: `0 2px 0 ${colors.border}` }}>✏️ Edit</button>
          <button onClick={() => onToggleActive(activity)} style={{ flex: 1, padding: '8px', background: colors.surface, color: colors.textSecondary, border: `1.5px solid ${colors.border}`, borderRadius: '10px', fontSize: '12px', fontWeight: 800, cursor: 'pointer', fontFamily: fontFamilyDisplay, letterSpacing: '0.04em', textTransform: 'uppercase', boxShadow: `0 2px 0 ${colors.border}` }}>{activity.isActive ? '⏸ Deactivate' : '▶ Activate'}</button>
          <button onClick={() => onDelete(activity)} style={{ padding: '8px 12px', background: `${colors.danger}12`, color: colors.danger, border: `1.5px solid ${colors.danger}40`, borderRadius: '10px', fontSize: '12px', fontWeight: 800, cursor: 'pointer', fontFamily: fontFamilyDisplay, letterSpacing: '0.04em', textTransform: 'uppercase', boxShadow: `0 2px 0 ${colors.danger}20` }}>🗑</button>
        </div>
      </div>
    </div>
  );
};

const Chip = ({ children, style }) => (
  <span style={{ fontSize: '12px', background: colors.surfaceSoft, color: colors.textSecondary, padding: '4px 10px', borderRadius: '999px', fontFamily, fontWeight: 700, border: `1.5px solid ${colors.border}`, ...style }}>{children}</span>
);

const MiniStat = ({ label, value, small }) => (
  <div style={{ textAlign: 'center', flex: 1 }}>
    <div style={{ fontSize: small ? '11px' : '16px', fontWeight: 800, color: colors.textPrimary, fontFamily: fontFamilyDisplay, lineHeight: 1.1 }}>{value}</div>
    <div style={{ fontSize: '10px', color: colors.textSecondary, fontFamily, marginTop: '2px', fontWeight: 700 }}>{label}</div>
  </div>
);

const EmptyState = ({ hasActivities, searchTerm, onCreateActivity }) => (
  <div style={{ textAlign: 'center', padding: '60px 20px', background: colors.surface, borderRadius: '16px', border: `1.5px dashed ${colors.border}` }}>
    <div style={{ fontSize: '48px', marginBottom: '12px' }}>{hasActivities ? '🔍' : '📋'}</div>
    <h3 style={{ fontSize: '18px', fontWeight: 800, color: colors.textPrimary, marginBottom: '6px', fontFamily: fontFamilyDisplay }}>{hasActivities ? 'No activities match your search' : 'No activities yet'}</h3>
    <p style={{ fontSize: '14px', color: colors.textSecondary, fontFamily, fontWeight: 600, margin: '0 0 20px 0' }}>{hasActivities ? `Try a different search term${searchTerm ? ` than "${searchTerm}"` : ''}.` : 'Activities created by teachers will appear here.'}</p>
    {!hasActivities && onCreateActivity && (
      <button onClick={onCreateActivity} style={{ padding: '12px 24px', background: colors.accent, color: colors.white, border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', fontFamily: fontFamilyDisplay, letterSpacing: '0.04em', textTransform: 'uppercase', boxShadow: `0 4px 0 ${colors.accentHover}` }}>➕ Create Your First Activity</button>
    )}
  </div>
);

export default AdminActivities;