// src/components/admin/AdminActivities.jsx
// ============================================================
// ✅ ADMIN ACTIVITIES - Shows teacher-created quizzes/exams
// with PIN, Host Live, Scores, Edit, Delete, Search & Filter
// ✅ UPDATED: Added "Create Activity" button
// ============================================================

import React, { useState, useMemo } from 'react';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../pages/firebase';
import ModalWrapper from './ModalWrapper';
import ConfirmDialog from './ConfirmDialog';
import { inputStyle, labelStyle, btnPrimary, btnSecondary, selectStyle } from './adminStyles';
import { colors, fontFamily } from '../dashboard/dashboardStyles';

const AdminActivities = ({
  activities,
  setActivities,
  loading,
  onHostLive,
  onShowScores,
  onCreateActivity,   // ✅ BAGONG PROP
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingActivity, setEditingActivity] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    gameType: 'quiz',
    category: '',
    difficulty: 3,
    isActive: true,
  });

  // ============================================================
  // ✅ FILTERED ACTIVITIES
  // ============================================================
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

  // ============================================================
  // ✅ STATS
  // ============================================================
  const stats = useMemo(() => {
    const total = activities.length;
    const totalQuestions = activities.reduce(
      (sum, a) => sum + (a.totalQuestions || 0),
      0
    );
    const totalParticipants = activities.reduce(
      (sum, a) => sum + (a.participants || 0),
      0
    );
    const activeCount = activities.filter((a) => a.isActive).length;
    return { total, totalQuestions, totalParticipants, activeCount };
  }, [activities]);

  // ============================================================
  // ✅ HELPERS
  // ============================================================
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
      case 'quiz': return '#7c6fd6';
      case 'match': return '#B83B5E';
      case 'wordpics': return '#1F4E5F';
      default: return '#64748b';
    }
  };

  const getDifficultyLabel = (d) => {
    const map = { 1: 'Beginner', 2: 'Easy', 3: 'Intermediate', 4: 'Advanced', 5: 'Expert' };
    return map[d] || 'Intermediate';
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  // ============================================================
  // ✅ ACTIONS
  // ============================================================
  const toggleActive = async (activity) => {
    try {
      const ref = doc(db, 'activities', activity.id);
      await updateDoc(ref, { isActive: !activity.isActive });
      setActivities(
        activities.map((a) =>
          a.id === activity.id ? { ...a, isActive: !a.isActive } : a
        )
      );
    } catch (error) {
      console.error('Error toggling activity:', error);
      alert('Error updating activity status');
    }
  };

  const startEdit = (activity) => {
    setEditingActivity(activity.id);
    setEditForm({
      title: activity.title || '',
      gameType: activity.gameType || 'quiz',
      category: activity.category || '',
      difficulty: activity.difficulty || 3,
      isActive: activity.isActive !== false,
    });
  };

  const saveEdit = async () => {
    if (!editForm.title.trim()) {
      alert('Title is required');
      return;
    }
    try {
      const ref = doc(db, 'activities', editingActivity);
      await updateDoc(ref, {
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
    } catch (error) {
      console.error('Error updating activity:', error);
      alert('Error saving changes');
    }
  };

  const deleteActivity = async (id) => {
    try {
      await deleteDoc(doc(db, 'activities', id));
      setActivities(activities.filter((a) => a.id !== id));
    } catch (error) {
      console.error('Error deleting activity:', error);
      alert('Error deleting activity');
    }
  };

  const requestDelete = (activity) => {
    setConfirmAction({
      title: 'Delete Activity',
      message: `Are you sure you want to delete "${activity.title}"? This will permanently remove the activity and cannot be undone.`,
      confirmLabel: 'Delete',
      danger: true,
      onConfirm: () => {
        deleteActivity(activity.id);
        setConfirmAction(null);
      },
    });
  };

  // ============================================================
  // ✅ RENDER
  // ============================================================
  return (
    <div>
      {/* ===== HEADER ===== */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '24px',
          borderBottom: `1px solid ${colors.border}`,
          paddingBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: '600',
              color: colors.textPrimary,
              marginBottom: '6px',
              fontFamily,
            }}
          >
            Activities
          </h1>
          <p
            style={{
              fontSize: '15px',
              color: colors.textSecondary,
              margin: 0,
              fontWeight: '300',
              fontFamily,
            }}
          >
            Manage all quizzes and exams created by teachers
          </p>
        </div>

        {/* ✅ HEADER ACTIONS - Create Button + Total */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={onCreateActivity}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #A78BFA 0%, #7C4DFF 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              fontFamily,
              boxShadow: '0 4px 0 #5B34B8, 0 6px 14px rgba(124, 77, 255, 0.25)',
              transition: 'transform 0.12s ease',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(3px)';
              e.currentTarget.style.boxShadow = '0 1px 0 #5B34B8';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 0 #5B34B8, 0 6px 14px rgba(124, 77, 255, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 0 #5B34B8, 0 6px 14px rgba(124, 77, 255, 0.25)';
            }}
          >
            ➕ Create Activity
          </button>

          <span
            style={{
              fontSize: '13px',
              color: colors.textSecondary,
              background: colors.bg,
              padding: '8px 16px',
              borderRadius: '90px',
              border: `1px solid ${colors.border}`,
              fontFamily,
            }}
          >
            Total: {stats.total} {stats.total === 1 ? 'Activity' : 'Activities'}
          </span>
        </div>
      </div>

      {/* ===== STATS CARDS ===== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <StatCard label="Total Activities" value={stats.total} icon="📋" color="#7c6fd6" />
        <StatCard label="Active" value={stats.activeCount} icon="✅" color="#2e7d32" />
        <StatCard label="Total Questions" value={stats.totalQuestions} icon="❓" color="#B83B5E" />
        <StatCard label="Total Participants" value={stats.totalParticipants} icon="👥" color="#1F4E5F" />
      </div>

      {/* ===== SEARCH & FILTERS ===== */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          placeholder="🔍 Search by title, PIN, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: '1',
            minWidth: '220px',
            padding: '12px 16px',
            border: `1px solid ${colors.border}`,
            borderRadius: '10px',
            fontSize: '14px',
            fontFamily,
            background: colors.surface,
            color: colors.textPrimary,
          }}
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{
            padding: '12px 16px',
            border: `1px solid ${colors.border}`,
            borderRadius: '10px',
            fontSize: '14px',
            fontFamily,
            background: colors.surface,
            color: colors.textPrimary,
            cursor: 'pointer',
          }}
        >
          <option value="all">All Types</option>
          <option value="quiz">📝 Quiz</option>
          <option value="match">🎯 Match</option>
          <option value="wordpics">🖼️ Word Pics</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '12px 16px',
            border: `1px solid ${colors.border}`,
            borderRadius: '10px',
            fontSize: '14px',
            fontFamily,
            background: colors.surface,
            color: colors.textPrimary,
            cursor: 'pointer',
          }}
        >
          <option value="all">All Status</option>
          <option value="active">✅ Active</option>
          <option value="inactive">⛔ Inactive</option>
        </select>
      </div>

      {/* ===== ACTIVITIES GRID ===== */}
      {loading.activities ? (
        <div style={{ textAlign: 'center', padding: '60px', color: colors.textSecondary }}>
          ⏳ Loading Activities...
        </div>
      ) : filteredActivities.length === 0 ? (
        <EmptyState
          hasActivities={activities.length > 0}
          searchTerm={searchTerm}
          onCreateActivity={onCreateActivity}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '20px',
          }}
        >
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

      {/* ===== EDIT MODAL ===== */}
      {editingActivity && (
        <ModalWrapper onClose={() => setEditingActivity(null)}>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '24px',
              color: colors.textPrimary,
              fontFamily,
            }}
          >
            ✏️ Edit Activity
          </h2>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Activity Title *</label>
            <input
              type="text"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              style={inputStyle}
              placeholder="e.g., Vocabulary Quiz #1"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Game Type</label>
            <select
              value={editForm.gameType}
              onChange={(e) => setEditForm({ ...editForm, gameType: e.target.value })}
              style={selectStyle}
            >
              <option value="quiz">📝 Quiz Master</option>
              <option value="match">🎯 Match Game</option>
              <option value="wordpics">🖼️ Word Pics</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Category</label>
            <input
              type="text"
              value={editForm.category}
              onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
              style={inputStyle}
              placeholder="e.g., general, vocabulary"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Difficulty</label>
            <select
              value={editForm.difficulty}
              onChange={(e) =>
                setEditForm({ ...editForm, difficulty: Number(e.target.value) })
              }
              style={selectStyle}
            >
              <option value={1}>⭐ Beginner</option>
              <option value={2}>⭐⭐ Easy</option>
              <option value={3}>⭐⭐⭐ Intermediate</option>
              <option value={4}>⭐⭐⭐⭐ Advanced</option>
              <option value={5}>⭐⭐⭐⭐⭐ Expert</option>
            </select>
          </div>

          <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              id="isActive"
              checked={editForm.isActive}
              onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label
              htmlFor="isActive"
              style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}
            >
              Active (students can join)
            </label>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setEditingActivity(null)} style={btnSecondary}>
              Cancel
            </button>
            <button onClick={saveEdit} style={btnPrimary}>
              Save Changes
            </button>
          </div>
        </ModalWrapper>
      )}

      {/* ===== CONFIRM DELETE ===== */}
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
  <div
    style={{
      background: colors.surface,
      border: `1px solid ${colors.border}`,
      borderRadius: '12px',
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    }}
  >
    <div
      style={{
        width: '42px',
        height: '42px',
        borderRadius: '10px',
        background: `${color}15`,
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div>
      <div
        style={{
          fontSize: '22px',
          fontWeight: '700',
          color: colors.textPrimary,
          fontFamily,
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: '12px',
          color: colors.textSecondary,
          fontFamily,
          marginTop: '2px',
        }}
      >
        {label}
      </div>
    </div>
  </div>
);

const ActivityCard = ({
  activity,
  onHostLive,
  onShowScores,
  onEdit,
  onDelete,
  onToggleActive,
  getTypeIcon,
  getTypeLabel,
  getTypeColor,
  getDifficultyLabel,
  formatDate,
}) => {
  const [hovered, setHovered] = useState(false);
  const accent = getTypeColor(activity.gameType);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: colors.surface,
        border: `1px solid ${hovered ? accent : colors.border}`,
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        boxShadow: hovered
          ? `0 8px 16px -8px ${accent}40`
          : '0 2px 4px rgba(0,0,0,0.02)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ===== CARD HEADER ===== */}
      <div
        style={{
          padding: '18px 20px',
          background: `linear-gradient(135deg, ${accent}10, ${accent}05)`,
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: `${accent}20`,
            color: accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            flexShrink: 0,
          }}
        >
          {getTypeIcon(activity.gameType)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              fontSize: '16px',
              fontWeight: '600',
              color: colors.textPrimary,
              margin: 0,
              fontFamily,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {activity.title}
          </h3>
          <div
            style={{
              fontSize: '12px',
              color: colors.textSecondary,
              fontFamily,
              marginTop: '2px',
            }}
          >
            {getTypeLabel(activity.gameType)} • {activity.totalQuestions || 0} questions
          </div>
        </div>
        <span
          style={{
            fontSize: '11px',
            fontWeight: '600',
            padding: '4px 10px',
            borderRadius: '12px',
            background: activity.isActive ? '#e8f5e9' : '#fee2e2',
            color: activity.isActive ? '#2e7d32' : '#b91c1c',
            flexShrink: 0,
          }}
        >
          {activity.isActive ? '● Active' : '○ Inactive'}
        </span>
      </div>

      {/* ===== PIN DISPLAY ===== */}
      <div
        style={{
          padding: '14px 20px',
          background: colors.bg,
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontSize: '12px',
            color: colors.textSecondary,
            fontFamily,
          }}
        >
          🔑 Game PIN
        </span>
        <span
          style={{
            fontSize: '18px',
            fontWeight: '700',
            color: accent,
            fontFamily: 'monospace',
            letterSpacing: '2px',
          }}
        >
          {activity.gamePin || '------'}
        </span>
      </div>

      {/* ===== CARD BODY ===== */}
      <div style={{ padding: '16px 20px', flex: 1 }}>
        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            marginBottom: '14px',
          }}
        >
          <Chip>{activity.category || 'General'}</Chip>
          <Chip>⭐ {getDifficultyLabel(activity.difficulty)}</Chip>
          {activity.hasCustomQuestions && (
            <Chip style={{ background: '#fff3e0', color: '#ff9800' }}>
              ✏️ Custom
            </Chip>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '12px',
            background: colors.bg,
            borderRadius: '10px',
            marginBottom: '14px',
          }}
        >
          <MiniStat label="Questions" value={activity.totalQuestions || 0} />
          <div style={{ width: '1px', background: colors.border }} />
          <MiniStat label="Participants" value={activity.participants || 0} />
          <div style={{ width: '1px', background: colors.border }} />
          <MiniStat label="Created" value={formatDate(activity.createdAt)} small />
        </div>

        {/* ===== PRIMARY ACTIONS ===== */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <button
            onClick={() => onHostLive && onHostLive(activity)}
            style={{
              flex: 1,
              padding: '10px',
              background: accent,
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            🎮 Host Live
          </button>
          <button
            onClick={() => onShowScores && onShowScores(activity)}
            style={{
              flex: 1,
              padding: '10px',
              background: colors.surface,
              color: colors.textPrimary,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            📊 Scores
          </button>
        </div>

        {/* ===== SECONDARY ACTIONS ===== */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onEdit(activity)}
            style={{
              flex: 1,
              padding: '8px',
              background: 'transparent',
              color: colors.textSecondary,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily,
            }}
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => onToggleActive(activity)}
            style={{
              flex: 1,
              padding: '8px',
              background: 'transparent',
              color: colors.textSecondary,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily,
            }}
          >
            {activity.isActive ? '⏸ Deactivate' : '▶ Activate'}
          </button>
          <button
            onClick={() => onDelete(activity)}
            style={{
              padding: '8px 12px',
              background: '#fef2f2',
              color: '#b91c1c',
              border: '1px solid #fee2e2',
              borderRadius: '8px',
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily,
            }}
          >
            🗑
          </button>
        </div>
      </div>
    </div>
  );
};

const Chip = ({ children, style }) => (
  <span
    style={{
      fontSize: '12px',
      background: colors.bg,
      color: colors.textSecondary,
      padding: '4px 10px',
      borderRadius: '8px',
      fontFamily,
      ...style,
    }}
  >
    {children}
  </span>
);

const MiniStat = ({ label, value, small }) => (
  <div style={{ textAlign: 'center', flex: 1 }}>
    <div
      style={{
        fontSize: small ? '11px' : '16px',
        fontWeight: '700',
        color: colors.textPrimary,
        fontFamily,
      }}
    >
      {value}
    </div>
    <div
      style={{
        fontSize: '10px',
        color: colors.textSecondary,
        fontFamily,
        marginTop: '2px',
      }}
    >
      {label}
    </div>
  </div>
);

const EmptyState = ({ hasActivities, searchTerm, onCreateActivity }) => (
  <div
    style={{
      textAlign: 'center',
      padding: '60px 20px',
      background: colors.surface,
      borderRadius: '12px',
      border: `1px dashed ${colors.border}`,
    }}
  >
    <div style={{ fontSize: '48px', marginBottom: '12px' }}>
      {hasActivities ? '🔍' : '📋'}
    </div>
    <h3
      style={{
        fontSize: '18px',
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: '6px',
        fontFamily,
      }}
    >
      {hasActivities ? 'No activities match your search' : 'No activities yet'}
    </h3>
    <p
      style={{
        fontSize: '14px',
        color: colors.textSecondary,
        fontFamily,
        margin: '0 0 20px 0',
      }}
    >
      {hasActivities
        ? `Try a different search term${searchTerm ? ` than "${searchTerm}"` : ''} or clear the filters.`
        : 'Activities created by teachers will appear here.'}
    </p>

    {/* ✅ Create button sa empty state */}
    {!hasActivities && onCreateActivity && (
      <button
        onClick={onCreateActivity}
        style={{
          padding: '12px 24px',
          background: 'linear-gradient(135deg, #A78BFA 0%, #7C4DFF 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '700',
          cursor: 'pointer',
          fontFamily,
          boxShadow: '0 4px 0 #5B34B8',
        }}
      >
        ➕ Create Your First Activity
      </button>
    )}
  </div>
);

export default AdminActivities;