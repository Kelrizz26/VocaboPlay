// src/components/admin/AdminOverview.jsx
// ============================================================
// ✅ ADMIN OVERVIEW - Wayground/Quizizz Style
// ✅ CONNECTED TO AVATAR SHOP — Shows FACE of character
// ============================================================

import React from 'react';
import { colors, fontFamily } from "../dashboard/dashboardStyles";
import { AVATAR_SHOP_ITEMS, DEFAULT_AVATAR_ID } from '../../data/avatarShop';

// ✅ HELPER — Kunin yung avatar image galing sa Avatar Shop
const getStudentAvatar = (student) => {
  if (!student) return AVATAR_SHOP_ITEMS[0]?.image || '';
  const avatarId = student.equippedAvatar || DEFAULT_AVATAR_ID;
  const found = AVATAR_SHOP_ITEMS.find(a => a.id === avatarId);
  return found?.image || AVATAR_SHOP_ITEMS[0]?.image || '';
};

// ✅ REUSABLE — Student avatar (image or initial fallback)
// Naka-focus sa MUKHA ng character, hindi sa katawan
const StudentAvatarImage = ({ student, size = 36, borderRadius = 10 }) => {
  const [imgError, setImgError] = React.useState(false);
  const avatarSrc = getStudentAvatar(student);

  if (!imgError && avatarSrc) {
    return (
      <img
        src={avatarSrc}
        alt={student.displayName}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          // ✅ MUKHA ANG FOCUS — hindi katawan
          objectPosition: 'center 15%',
          display: 'block'
        }}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <span style={{ color: '#fff', fontWeight: '600', fontSize: size * 0.45 }}>
      {student.displayName?.charAt(0)?.toUpperCase() || '?'}
    </span>
  );
};

const AdminOverview = ({ students, games, words, setActiveMenu, activities = [] }) => {
  const avgScore = students.length
    ? Math.round(students.reduce((a, s) => a + (s.avgScore || 0), 0) / students.length)
    : 0;

  const totalActivities = activities.length;

  const recentStudents = [...students]
    .sort((a, b) => {
      const dateA = new Date(a.lastActive || a.createdAt || 0);
      const dateB = new Date(b.lastActive || b.createdAt || 0);
      return dateB - dateA;
    })
    .slice(0, 3);

  const easyWords = words.filter(w =>
    w.difficulty === 'Easy' ||
    w.difficulty === 'beginner' ||
    w.difficulty === 1
  ).length;

  const mediumWords = words.filter(w =>
    w.difficulty === 'Medium' ||
    w.difficulty === 'intermediate' ||
    w.difficulty === 2 ||
    w.difficulty === 3
  ).length;

  const hardWords = words.filter(w =>
    w.difficulty === 'Hard' ||
    w.difficulty === 'advanced' ||
    w.difficulty === 4 ||
    w.difficulty === 5
  ).length;

  const totalPlays = students.reduce(
    (total, s) => total + (s.progress?.gamesPlayed || 0),
    0
  );

  const stats = [
    {
      label: 'Total Students',
      value: String(students.length),
      icon: '▣',
      color: colors.accent,
      bg: `${colors.accent}20`,
      change: `${students.length} total`
    },
    {
      label: 'Active Words',
      value: String(words.length),
      icon: '☰',
      color: '#2E7D32',
      bg: '#e8f5e9',
      change: `${words.length} total`
    },
    {
      label: 'Total Activities',
      value: String(totalActivities),
      icon: '◉',
      color: '#B85C1A',
      bg: '#fff4e5',
      change: `${totalActivities} total`
    },
    {
      label: 'Avg Score',
      value: avgScore + '%',
      icon: '▦',
      color: colors.accent,
      bg: `${colors.accent}20`,
      change: 'Class average'
    },
  ];

  return (
    <div className="admin-ov-wrapper">
      <style>{`
        @media (max-width: 768px) {
          .admin-ov-wrapper .stats-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 10px !important;
          }
          .admin-ov-wrapper .stats-grid .stat-card {
            padding: 14px !important;
          }
          .admin-ov-wrapper .stats-grid .stat-card .stat-value {
            font-size: 22px !important;
          }
          .admin-ov-wrapper .stats-grid .stat-card .stat-icon {
            width: 36px !important;
            height: 36px !important;
            font-size: 16px !important;
          }
          .admin-ov-wrapper .stats-grid .stat-card .stat-change {
            font-size: 9px !important;
            padding: 2px 6px !important;
          }
          .admin-ov-wrapper .two-col {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .admin-ov-wrapper .two-col .col-card {
            padding: 16px !important;
          }
          .admin-ov-wrapper .platform-stats {
            grid-template-columns: 1fr 1fr !important;
            gap: 6px !important;
          }
          .admin-ov-wrapper .platform-stats .stat-item {
            padding: 10px !important;
          }
          .admin-ov-wrapper .platform-stats .stat-item .stat-num {
            font-size: 18px !important;
          }
          .admin-ov-wrapper .activity-item {
            padding: 8px 10px !important;
          }
          .admin-ov-wrapper .activity-item .avatar {
            width: 32px !important;
            height: 32px !important;
          }
          .admin-ov-wrapper .activity-item .name {
            font-size: 12px !important;
          }
          .admin-ov-wrapper .activity-item .date {
            font-size: 10px !important;
          }
          .admin-ov-wrapper .header h1 {
            font-size: 20px !important;
          }
          .admin-ov-wrapper .header p {
            font-size: 12px !important;
          }
          .admin-ov-wrapper .students-summary {
            padding: 16px !important;
          }
          .admin-ov-wrapper .students-summary h3 {
            font-size: 14px !important;
          }
          .admin-ov-wrapper .students-summary p {
            font-size: 12px !important;
          }
          .admin-ov-wrapper .students-summary button {
            font-size: 12px !important;
            padding: 6px 16px !important;
          }
        }
        @media (max-width: 480px) {
          .admin-ov-wrapper .stats-grid {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }
          .admin-ov-wrapper .stats-grid .stat-card {
            padding: 12px !important;
          }
          .admin-ov-wrapper .stats-grid .stat-card .stat-value {
            font-size: 20px !important;
          }
          .admin-ov-wrapper .platform-stats .stat-item {
            padding: 8px !important;
          }
          .admin-ov-wrapper .platform-stats .stat-item .stat-num {
            font-size: 16px !important;
          }
          .admin-ov-wrapper .two-col .col-card {
            padding: 12px !important;
          }
          .admin-ov-wrapper .header h1 {
            font-size: 18px !important;
          }
          .admin-ov-wrapper .activity-item {
            padding: 6px 8px !important;
            gap: 8px !important;
          }
          .admin-ov-wrapper .activity-item .avatar {
            width: 28px !important;
            height: 28px !important;
          }
        }
      `}</style>

      <div>
        {/* Header Section */}
        <div className="header" style={{
          marginBottom: '24px',
          borderBottom: `1px solid ${colors.border}`,
          paddingBottom: '16px'
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '500',
            color: colors.textPrimary,
            marginBottom: '4px',
            fontFamily
          }}>Dashboard Overview</h1>
          <p style={{
            fontSize: '13px',
            color: colors.textSecondary,
            margin: 0,
            fontWeight: '400',
            fontFamily
          }}>Monitor your vocabulary learning platform</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4,1fr)',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {stats.map((s, i) => (
            <div key={i}
              className="stat-card"
              style={{
                background: colors.surface,
                borderRadius: '12px',
                padding: '20px',
                border: `1px solid ${colors.border}`,
                transition: 'all 0.2s ease',
                cursor: 'default'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = `${s.color}40`;
                e.currentTarget.style.backgroundColor = `${s.color}15`;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.backgroundColor = colors.surface;
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <div className="stat-icon" style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: s.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  color: s.color
                }}>{s.icon}</div>
                <span className="stat-change" style={{
                  fontSize: '11px',
                  color: colors.textSecondary,
                  background: colors.bg,
                  padding: '4px 8px',
                  borderRadius: '12px',
                  border: `1px solid ${colors.border}`,
                  fontWeight: '400'
                }}>{s.change}</span>
              </div>
              <div className="stat-value" style={{
                fontSize: '28px',
                fontWeight: '500',
                color: colors.textPrimary,
                marginBottom: '2px',
                fontFamily,
                lineHeight: 1.2
              }}>{s.value}</div>
              <div style={{ fontSize: '13px', color: colors.textSecondary, fontWeight: '400' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          {/* Recent Activity */}
          <div className="col-card" style={{ background: colors.surface, borderRadius: '12px', padding: '20px', border: `1px solid ${colors.border}` }}>
            <h3 style={{ fontSize: '15px', fontWeight: '500', color: colors.textPrimary, margin: '0 0 16px 0', fontFamily }}>Recent Activity</h3>
            {recentStudents.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recentStudents.map((st, i) => (
                  <div key={i} className="activity-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: colors.bg, borderRadius: '10px', border: `1px solid ${colors.border}` }}>
                    {/* ✅ AVATAR FROM SHOP — FACE FOCUS */}
                    <div className="avatar" style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <StudentAvatarImage student={st} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="name" style={{ fontSize: '13px', fontWeight: '500', color: colors.textPrimary, fontFamily }}>
                        <strong>{st.displayName}</strong> joined
                      </div>
                      <div className="date" style={{ fontSize: '11px', color: colors.textSecondary }}>
                        {st.joinDate || 'Recently'}
                      </div>
                    </div>
                    {st.createdAt && new Date(st.createdAt) > new Date(Date.now() - 7*24*60*60*1000) && (
                      <span style={{ fontSize: '10px', background: '#e8f5e9', color: '#2e7d32', padding: '3px 8px', borderRadius: '12px', fontWeight: '500' }}>New</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px', color: colors.textSecondary }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>👋</div>
                <div style={{ fontSize: '13px' }}>No students yet</div>
              </div>
            )}
          </div>

          {/* Platform Stats */}
          <div className="col-card" style={{ background: colors.surface, borderRadius: '12px', padding: '20px', border: `1px solid ${colors.border}` }}>
            <h3 style={{ fontSize: '15px', fontWeight: '500', color: colors.textPrimary, margin: '0 0 16px 0', fontFamily }}>Platform Stats</h3>
            <div className="platform-stats" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { label: 'Easy Words',   value: easyWords,   color: '#2e7d32', bg: '#e8f5e9' },
                { label: 'Medium Words', value: mediumWords, color: '#b85c1a', bg: '#fff4e5' },
                { label: 'Hard Words',   value: hardWords,   color: '#a93226', bg: '#ffebee' },
                { label: 'Total Plays',  value: totalPlays,  color: colors.accent, bg: `${colors.accent}20` },
              ].map((item, i) => (
                <div key={i} className="stat-item" style={{ padding: '14px', background: item.bg, borderRadius: '12px', textAlign: 'center', border: '1px solid transparent', transition: 'all 0.2s ease' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = item.color + '30';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}>
                  <div className="stat-num" style={{ fontSize: '22px', fontWeight: '500', color: item.color, fontFamily, lineHeight: 1.2 }}>{item.value}</div>
                  <div style={{ fontSize: '11px', color: item.color, fontWeight: '400', marginTop: '2px' }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Students Summary */}
        <div className="students-summary" style={{ background: colors.surface, padding: students.length > 0 ? '20px' : '48px 24px', borderRadius: '12px', border: `1px solid ${colors.border}`, textAlign: 'center' }}>
          {students.length === 0 && <div style={{ fontSize: '40px', marginBottom: '12px' }}>👋</div>}
          <h3 style={{ fontSize: '16px', fontWeight: '500', color: colors.textPrimary, marginBottom: '4px', fontFamily }}>
            {students.length > 0 ? `${students.length} Active Student${students.length > 1 ? 's' : ''}` : 'No Students Yet'}
          </h3>
          <p style={{ fontSize: '13px', color: colors.textSecondary, maxWidth: '500px', margin: '0 auto', lineHeight: '1.5', fontFamily }}>
            {students.length > 0
              ? 'Students are actively learning vocabulary. Check the Students tab for detailed progress.'
              : 'No students have joined your activities yet. Share a PIN to get started!'}
          </p>
          {students.length > 0 && (
            <button
              onClick={() => setActiveMenu('Students')}
              style={{
                marginTop: '16px',
                padding: '8px 20px',
                background: colors.accent,
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '400',
                cursor: 'pointer',
                fontFamily,
                transition: 'all 0.2s ease',
                boxShadow: 'none'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = colors.accent;
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = `0 4px 12px ${colors.accent}40`;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = colors.accent;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(124, 111, 214, 0.2)';
              }}
            >
              View All Students
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;