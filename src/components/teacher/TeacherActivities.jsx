// src/components/teacher/TeacherActivities.jsx
// ============================================================
// ✅ TEACHER ACTIVITIES - Create quizzes/exams with auto PIN
// Teachers can create, edit, delete their own activities
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  collection, addDoc, doc, updateDoc, deleteDoc,
} from 'firebase/firestore';
import { db } from '../../pages/firebase';
import ModalWrapper from '../admin/ModalWrapper';
import ConfirmDialog from '../admin/ConfirmDialog';
import {
  inputStyle, labelStyle, btnPrimary, btnSecondary, selectStyle,
} from '../admin/adminStyles';
import { colors, fontFamily } from '../dashboard/dashboardStyles';

// ============================================================
// ✅ PIN GENERATOR - 6 digits, unique-ish
// ============================================================
const generatePin = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const TeacherActivities = ({
  activities,           // filtered to current teacher only
  setActivities,
  loading,
  teacherId,            // uid of logged-in teacher
  teacherName,
  onHostLive,
  onShowScores,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [saving, setSaving] = useState(false);

  // ===== CREATE FORM STATE =====
  const emptyQuestion = { question: '', options: ['', '', '', ''], correctIndex: 0 };
  const [createForm, setCreateForm] = useState({
    title: '',
    gameType: 'quiz',
    category: 'general',
    difficulty: 3,
    questions: [{ ...emptyQuestion }],
  });

  // ===== EDIT FORM STATE =====
  const [editForm, setEditForm] = useState({
    title: '', gameType: 'quiz', category: '', difficulty: 3, isActive: true,
  });

  // ============================================================
  // ✅ FILTER
  // ============================================================
  const filteredActivities = useMemo(() => {
    return activities.filter((a) => {
      const matchesSearch =
        !searchTerm ||
        a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.gamePin?.includes(searchTerm);
      const matchesType = filterType === 'all' || a.gameType === filterType;
      return matchesSearch && matchesType;
    });
  }, [activities, searchTerm, filterType]);

  const stats = useMemo(() => ({
    total: activities.length,
    active: activities.filter((a) => a.isActive).length,
    questions: activities.reduce((s, a) => s + (a.totalQuestions || 0), 0),
    participants: activities.reduce((s, a) => s + (a.participants || 0), 0),
  }), [activities]);

  // ============================================================
  // ✅ CREATE ACTIVITY WITH PIN
  // ============================================================
  const handleCreate = async () => {
    if (!createForm.title.trim()) return alert('Title is required');
    const validQuestions = createForm.questions.filter(
      (q) => q.question.trim() && q.options.some((o) => o.trim())
    );
    if (validQuestions.length === 0)
      return alert('Add at least one question with options');

    setSaving(true);
    try {
      const newActivity = {
        title: createForm.title.trim(),
        gameType: createForm.gameType,
        category: createForm.category.trim() || 'general',
        difficulty: createForm.difficulty,
        isActive: true,
        gamePin: generatePin(),                // ✅ AUTO PIN
        totalQuestions: validQuestions.length,
        participants: 0,
        hasCustomQuestions: true,
        createdAt: new Date().toISOString(),
        createdBy: teacherId,                   // ✅ link to teacher
        teacherName: teacherName || '',
        questions: validQuestions,
      };

      const ref = await addDoc(collection(db, 'activities'), newActivity);
      setActivities([{ id: ref.id, ...newActivity }, ...activities]);
      setShowCreate(false);
      setCreateForm({
        title: '', gameType: 'quiz', category: 'general',
        difficulty: 3, questions: [{ ...emptyQuestion }],
      });
      alert(`✅ Activity created!\nGame PIN: ${newActivity.gamePin}`);
    } catch (err) {
      console.error('Error creating activity:', err);
      alert('Error creating activity: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // ===== QUESTION EDITORS =====
  const updateQuestion = (idx, field, value) => {
    const qs = [...createForm.questions];
    qs[idx][field] = value;
    setCreateForm({ ...createForm, questions: qs });
  };
  const updateOption = (qIdx, oIdx, value) => {
    const qs = [...createForm.questions];
    qs[qIdx].options[oIdx] = value;
    setCreateForm({ ...createForm, questions: qs });
  };
  const addQuestion = () => {
    setCreateForm({
      ...createForm,
      questions: [...createForm.questions, { ...emptyQuestion }],
    });
  };
  const removeQuestion = (idx) => {
    if (createForm.questions.length === 1) return;
    setCreateForm({
      ...createForm,
      questions: createForm.questions.filter((_, i) => i !== idx),
    });
  };

  // ============================================================
  // ✅ EDIT / DELETE / TOGGLE
  // ============================================================
  const startEdit = (a) => {
    setEditingActivity(a.id);
    setEditForm({
      title: a.title || '',
      gameType: a.gameType || 'quiz',
      category: a.category || '',
      difficulty: a.difficulty || 3,
      isActive: a.isActive !== false,
    });
  };

  const saveEdit = async () => {
    if (!editForm.title.trim()) return alert('Title is required');
    try {
      await updateDoc(doc(db, 'activities', editingActivity), {
        title: editForm.title.trim(),
        gameType: editForm.gameType,
        category: editForm.category,
        difficulty: editForm.difficulty,
        isActive: editForm.isActive,
      });
      setActivities(
        activities.map((a) =>
          a.id === editingActivity ? { ...a, ...editForm } : a
        )
      );
      setEditingActivity(null);
    } catch (err) {
      alert('Error saving changes');
    }
  };

  const toggleActive = async (a) => {
    try {
      await updateDoc(doc(db, 'activities', a.id), { isActive: !a.isActive });
      setActivities(
        activities.map((x) =>
          x.id === a.id ? { ...x, isActive: !x.isActive } : x
        )
      );
    } catch (err) {
      alert('Error updating status');
    }
  };

  const deleteActivity = async (id) => {
    try {
      await deleteDoc(doc(db, 'activities', id));
      setActivities(activities.filter((a) => a.id !== id));
    } catch (err) {
      alert('Error deleting activity');
    }
  };

  const requestDelete = (a) => {
    setConfirmAction({
      title: 'Delete Activity',
      message: `Delete "${a.title}"? This cannot be undone.`,
      confirmLabel: 'Delete',
      danger: true,
      onConfirm: () => {
        deleteActivity(a.id);
        setConfirmAction(null);
      },
    });
  };

  // ============================================================
  // ✅ RENDER
  // ============================================================
  return (
    <div>
      {/* HEADER */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        marginBottom: '24px', borderBottom: `1px solid ${colors.border}`,
        paddingBottom: '20px', flexWrap: 'wrap', gap: '12px',
      }}>
        <div>
          <h1 style={{
            fontSize: '28px', fontWeight: '600',
            color: colors.textPrimary, marginBottom: '6px', fontFamily,
          }}>My Activities</h1>
          <p style={{
            fontSize: '15px', color: colors.textSecondary,
            margin: 0, fontWeight: '300', fontFamily,
          }}>Create quizzes and share the Game PIN with your students</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            ...btnPrimary,
            padding: '12px 24px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}
        >
          ➕ Create Activity
        </button>
      </div>

      {/* STATS */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px', marginBottom: '24px',
      }}>
        <StatCard label="My Activities" value={stats.total} icon="📋" color="#7c6fd6" />
        <StatCard label="Active" value={stats.active} icon="✅" color="#2e7d32" />
        <StatCard label="Questions" value={stats.questions} icon="❓" color="#B83B5E" />
        <StatCard label="Participants" value={stats.participants} icon="👥" color="#1F4E5F" />
      </div>

      {/* SEARCH + FILTER */}
      <div style={{
        display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap',
      }}>
        <input
          type="text"
          placeholder="🔍 Search by title or PIN..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1, minWidth: '220px', padding: '12px 16px',
            border: `1px solid ${colors.border}`, borderRadius: '10px',
            fontSize: '14px', fontFamily, background: colors.surface,
            color: colors.textPrimary,
          }}
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{
            padding: '12px 16px', border: `1px solid ${colors.border}`,
            borderRadius: '10px', fontSize: '14px', fontFamily,
            background: colors.surface, color: colors.textPrimary, cursor: 'pointer',
          }}
        >
          <option value="all">All Types</option>
          <option value="quiz">📝 Quiz</option>
          <option value="match">🎯 Match</option>
          <option value="wordpics">🖼️ Word Pics</option>
        </select>
      </div>

      {/* GRID */}
      {loading?.activities ? (
        <div style={{ textAlign: 'center', padding: '60px', color: colors.textSecondary }}>
          ⏳ Loading...
        </div>
      ) : filteredActivities.length === 0 ? (
        <EmptyState onCreate={() => setShowCreate(true)} />
      ) : (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '20px',
        }}>
          {filteredActivities.map((a) => (
            <ActivityCard
              key={a.id}
              activity={a}
              onHostLive={onHostLive}
              onShowScores={onShowScores}
              onEdit={startEdit}
              onDelete={requestDelete}
              onToggleActive={toggleActive}
            />
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreate && (
        <ModalWrapper onClose={() => setShowCreate(false)}>
          <h2 style={{
            fontSize: '20px', fontWeight: '600', marginBottom: '24px',
            color: colors.textPrimary, fontFamily,
          }}>➕ Create New Activity</h2>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Title *</label>
            <input
              type="text"
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              style={inputStyle}
              placeholder="e.g., Science Quiz #1"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Game Type</label>
              <select
                value={createForm.gameType}
                onChange={(e) => setCreateForm({ ...createForm, gameType: e.target.value })}
                style={selectStyle}
              >
                <option value="quiz">📝 Quiz Master</option>
                <option value="match">🎯 Match Game</option>
                <option value="wordpics">🖼️ Word Pics</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Difficulty</label>
              <select
                value={createForm.difficulty}
                onChange={(e) => setCreateForm({ ...createForm, difficulty: Number(e.target.value) })}
                style={selectStyle}
              >
                <option value={1}>⭐ Beginner</option>
                <option value={2}>⭐⭐ Easy</option>
                <option value={3}>⭐⭐⭐ Intermediate</option>
                <option value={4}>⭐⭐⭐⭐ Advanced</option>
                <option value={5}>⭐⭐⭐⭐⭐ Expert</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Category</label>
            <input
              type="text"
              value={createForm.category}
              onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
              style={inputStyle}
              placeholder="e.g., general, vocabulary"
            />
          </div>

          {/* QUESTIONS */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '12px',
            }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>
                Questions ({createForm.questions.length})
              </label>
              <button
                onClick={addQuestion}
                style={{ ...btnSecondary, padding: '6px 12px', fontSize: '12px' }}
              >➕ Add Question</button>
            </div>

            <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '6px' }}>
              {createForm.questions.map((q, qIdx) => (
                <div key={qIdx} style={{
                  border: `1px solid ${colors.border}`,
                  borderRadius: '10px', padding: '14px',
                  marginBottom: '12px', background: colors.bg,
                }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: '8px',
                  }}>
                    <strong style={{ fontSize: '13px', color: colors.textPrimary, fontFamily }}>
                      Q{qIdx + 1}
                    </strong>
                    {createForm.questions.length > 1 && (
                      <button
                        onClick={() => removeQuestion(qIdx)}
                        style={{
                          background: 'transparent', border: 'none',
                          color: '#b91c1c', cursor: 'pointer', fontSize: '14px',
                        }}
                      >🗑</button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Question..."
                    value={q.question}
                    onChange={(e) => updateQuestion(qIdx, 'question', e.target.value)}
                    style={{ ...inputStyle, marginBottom: '8px' }}
                  />
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} style={{
                      display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px',
                    }}>
                      <input
                        type="radio"
                        name={`correct-${qIdx}`}
                        checked={q.correctIndex === oIdx}
                        onChange={() => updateQuestion(qIdx, 'correctIndex', oIdx)}
                        style={{ cursor: 'pointer' }}
                      />
                      <input
                        type="text"
                        placeholder={`Option ${oIdx + 1}`}
                        value={opt}
                        onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                        style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
                      />
                    </div>
                  ))}
                  <div style={{ fontSize: '11px', color: colors.textSecondary, marginTop: '6px', fontFamily }}>
                    ⦿ Select the radio button for the correct answer
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setShowCreate(false)} style={btnSecondary} disabled={saving}>
              Cancel
            </button>
            <button onClick={handleCreate} style={btnPrimary} disabled={saving}>
              {saving ? '⏳ Creating...' : '✅ Create & Generate PIN'}
            </button>
          </div>
        </ModalWrapper>
      )}

      {/* EDIT MODAL */}
      {editingActivity && (
        <ModalWrapper onClose={() => setEditingActivity(null)}>
          <h2 style={{
            fontSize: '20px', fontWeight: '600', marginBottom: '24px',
            color: colors.textPrimary, fontFamily,
          }}>✏️ Edit Activity</h2>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Title *</label>
            <input type="text" value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              style={inputStyle} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Game Type</label>
            <select value={editForm.gameType}
              onChange={(e) => setEditForm({ ...editForm, gameType: e.target.value })}
              style={selectStyle}>
              <option value="quiz">📝 Quiz Master</option>
              <option value="match">🎯 Match Game</option>
              <option value="wordpics">🖼️ Word Pics</option>
            </select>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Category</label>
            <input type="text" value={editForm.category}
              onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
              style={inputStyle} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Difficulty</label>
            <select value={editForm.difficulty}
              onChange={(e) => setEditForm({ ...editForm, difficulty: Number(e.target.value) })}
              style={selectStyle}>
              <option value={1}>⭐ Beginner</option>
              <option value={2}>⭐⭐ Easy</option>
              <option value={3}>⭐⭐⭐ Intermediate</option>
              <option value={4}>⭐⭐⭐⭐ Advanced</option>
              <option value={5}>⭐⭐⭐⭐⭐ Expert</option>
            </select>
          </div>
          <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input type="checkbox" id="tIsActive" checked={editForm.isActive}
              onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
            <label htmlFor="tIsActive" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>
              Active (students can join)
            </label>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setEditingActivity(null)} style={btnSecondary}>Cancel</button>
            <button onClick={saveEdit} style={btnPrimary}>Save Changes</button>
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

// ============================================================
// ✅ SUB-COMPONENTS
// ============================================================
const StatCard = ({ label, value, icon, color }) => (
  <div style={{
    background: colors.surface, border: `1px solid ${colors.border}`,
    borderRadius: '12px', padding: '16px', display: 'flex',
    alignItems: 'center', gap: '12px',
  }}>
    <div style={{
      width: '42px', height: '42px', borderRadius: '10px',
      background: `${color}15`, color, display: 'flex',
      alignItems: 'center', justifyContent: 'center', fontSize: '20px',
    }}>{icon}</div>
    <div>
      <div style={{
        fontSize: '22px', fontWeight: '700', color: colors.textPrimary,
        fontFamily, lineHeight: 1.2,
      }}>{value}</div>
      <div style={{ fontSize: '12px', color: colors.textSecondary, fontFamily }}>{label}</div>
    </div>
  </div>
);

const ActivityCard = ({
  activity, onHostLive, onShowScores, onEdit, onDelete, onToggleActive,
}) => {
  const [hovered, setHovered] = useState(false);
  const typeColors = { quiz: '#7c6fd6', match: '#B83B5E', wordpics: '#1F4E5F' };
  const typeIcons = { quiz: '📝', match: '🎯', wordpics: '🖼️' };
  const typeLabels = { quiz: 'Quiz', match: 'Match', wordpics: 'Word Pics' };
  const accent = typeColors[activity.gameType] || '#64748b';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: colors.surface,
        border: `1px solid ${hovered ? accent : colors.border}`,
        borderRadius: '12px', overflow: 'hidden',
        transition: 'all 0.2s ease',
        boxShadow: hovered ? `0 8px 16px -8px ${accent}40` : '0 2px 4px rgba(0,0,0,0.02)',
        display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{
        padding: '18px 20px',
        background: `linear-gradient(135deg, ${accent}10, ${accent}05)`,
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px',
          background: `${accent}20`, color: accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px', flexShrink: 0,
        }}>{typeIcons[activity.gameType] || '❓'}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontSize: '16px', fontWeight: '600', color: colors.textPrimary,
            margin: 0, fontFamily, whiteSpace: 'nowrap',
            overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{activity.title}</h3>
          <div style={{ fontSize: '12px', color: colors.textSecondary, fontFamily }}>
            {typeLabels[activity.gameType] || 'Activity'} • {activity.totalQuestions || 0} questions
          </div>
        </div>
        <span style={{
          fontSize: '11px', fontWeight: '600', padding: '4px 10px',
          borderRadius: '12px',
          background: activity.isActive ? '#e8f5e9' : '#fee2e2',
          color: activity.isActive ? '#2e7d32' : '#b91c1c', flexShrink: 0,
        }}>{activity.isActive ? '● Active' : '○ Inactive'}</span>
      </div>

      {/* PIN */}
      <div style={{
        padding: '14px 20px', background: colors.bg,
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: '12px', color: colors.textSecondary, fontFamily }}>
          🔑 Game PIN
        </span>
        <span style={{
          fontSize: '18px', fontWeight: '700', color: accent,
          fontFamily: 'monospace', letterSpacing: '2px',
        }}>{activity.gamePin || '------'}</span>
      </div>

      <div style={{ padding: '16px 20px', flex: 1 }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
          <Chip>{activity.category || 'General'}</Chip>
          <Chip>⭐ {activity.difficulty || 3}/5</Chip>
        </div>
        <div style={{
          display: 'flex', padding: '12px', background: colors.bg,
          borderRadius: '10px', marginBottom: '14px',
        }}>
          <MiniStat label="Questions" value={activity.totalQuestions || 0} />
          <div style={{ width: '1px', background: colors.border }} />
          <MiniStat label="Participants" value={activity.participants || 0} />
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <button onClick={() => onHostLive && onHostLive(activity)} style={{
            flex: 1, padding: '10px', background: accent, color: '#fff',
            border: 'none', borderRadius: '8px', fontSize: '13px',
            fontWeight: '600', cursor: 'pointer', fontFamily,
          }}>🎮 Host Live</button>
          <button onClick={() => onShowScores && onShowScores(activity)} style={{
            flex: 1, padding: '10px', background: colors.surface,
            color: colors.textPrimary, border: `1px solid ${colors.border}`,
            borderRadius: '8px', fontSize: '13px', fontWeight: '600',
            cursor: 'pointer', fontFamily,
          }}>📊 Scores</button>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => onEdit(activity)} style={{
            flex: 1, padding: '8px', background: 'transparent',
            color: colors.textSecondary, border: `1px solid ${colors.border}`,
            borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontFamily,
          }}>✏️ Edit</button>
          <button onClick={() => onToggleActive(activity)} style={{
            flex: 1, padding: '8px', background: 'transparent',
            color: colors.textSecondary, border: `1px solid ${colors.border}`,
            borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontFamily,
          }}>{activity.isActive ? '⏸ Deactivate' : '▶ Activate'}</button>
          <button onClick={() => onDelete(activity)} style={{
            padding: '8px 12px', background: '#fef2f2', color: '#b91c1c',
            border: '1px solid #fee2e2', borderRadius: '8px',
            fontSize: '12px', cursor: 'pointer', fontFamily,
          }}>🗑</button>
        </div>
      </div>
    </div>
  );
};

const Chip = ({ children }) => (
  <span style={{
    fontSize: '12px', background: colors.bg, color: colors.textSecondary,
    padding: '4px 10px', borderRadius: '8px', fontFamily,
  }}>{children}</span>
);

const MiniStat = ({ label, value }) => (
  <div style={{ textAlign: 'center', flex: 1 }}>
    <div style={{
      fontSize: '16px', fontWeight: '700',
      color: colors.textPrimary, fontFamily,
    }}>{value}</div>
    <div style={{
      fontSize: '10px', color: colors.textSecondary,
      fontFamily, marginTop: '2px',
    }}>{label}</div>
  </div>
);

const EmptyState = ({ onCreate }) => (
  <div style={{
    textAlign: 'center', padding: '60px 20px',
    background: colors.surface, borderRadius: '12px',
    border: `1px dashed ${colors.border}`,
  }}>
    <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
    <h3 style={{
      fontSize: '18px', fontWeight: '600',
      color: colors.textPrimary, marginBottom: '6px', fontFamily,
    }}>No activities yet</h3>
    <p style={{
      fontSize: '14px', color: colors.textSecondary,
      fontFamily, margin: '0 0 20px',
    }}>Create your first quiz and share the PIN with students.</p>
    <button onClick={onCreate} style={{ ...btnPrimary, padding: '10px 20px' }}>
      ➕ Create Activity
    </button>
  </div>
);

export default TeacherActivities;