import React from 'react';
import { colors, fontFamily } from "../dashboard/dashboardStyles";  // ✅ FIXED IMPORT PATH

const AdminOverview = ({ students, games, words, setActiveMenu }) => {
  const avgScore = students.length 
    ? Math.round(students.reduce((a, s) => a + (s.avgScore || 0), 0) / students.length) 
    : 0;

  const stats = [
    { label: 'Total Students', value: String(students.length), icon: '▣', color: colors.accent, bg: `${colors.accent}20`, change: `${students.length} total` },
    { label: 'Active Words',   value: String(words.length),    icon: '☰', color: '#2E7D32', bg: '#e8f5e9', change: `${words.length} total` },
    { label: 'Total Games',    value: String(games.length),    icon: '◉', color: '#B85C1A', bg: '#fff4e5', change: `${games.length} active` },
    { label: 'Avg Score',      value: avgScore + '%',          icon: '▦', color: colors.accent, bg: `${colors.accent}20`, change: 'Class average' },
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
            width: 30px !important;
            height: 30px !important;
            font-size: 12px !important;
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
            width: 26px !important;
            height: 26px !important;
            font-size: 10px !important;
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
          }}>Admin Overview</h1>
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
            {students.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {students
                  .sort((a, b) => new Date(b.lastActive || 0) - new Date(a.lastActive || 0))
                  .slice(0, 3)
                  .map((st, i) => (
                  <div key={i} className="activity-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: colors.bg, borderRadius: '10px', border: `1px solid ${colors.border}` }}>
                    <div className="avatar" style={{ width: '36px', height: '36px', borderRadius: '10px', overflow: 'hidden', background: st.avatar && st.avatar !== '👤' ? 'transparent' : `linear-gradient(135deg,${colors.accent},${colors.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '500', fontSize: '16px', flexShrink: 0 }}>
                      {st.avatar && st.avatar !== '👤' ? (
                        <img 
                          src={`/images/${st.avatar}`}
                          alt={st.displayName}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentNode.style.background = `linear-gradient(135deg,${colors.accent},${colors.accent})`;
                            e.target.parentNode.innerHTML = st.displayName?.charAt(0) || '?';
                          }}
                        />
                      ) : (st.displayName?.charAt(0) || '?')}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="name" style={{ fontSize: '13px', fontWeight: '500', color: colors.textPrimary, fontFamily }}>
                        <strong>{st.displayName}</strong> {st.createdAt ? 'joined' : 'active'}
                      </div>
                      <div className="date" style={{ fontSize: '11px', color: colors.textSecondary }}>{st.joinDate}</div>
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
                { label: 'Easy Words',   value: words.filter(w => w.difficulty === 'Easy' || w.difficulty === 'beginner').length,   color: '#2e7d32', bg: '#e8f5e9' },
                { label: 'Medium Words', value: words.filter(w => w.difficulty === 'Medium' || w.difficulty === 'intermediate').length, color: '#b85c1a', bg: '#fff4e5' },
                { label: 'Hard Words',   value: words.filter(w => w.difficulty === 'Hard' || w.difficulty === 'advanced').length,   color: '#a93226', bg: '#ffebee' },
                { label: 'Total Plays',  value: students.reduce((total, s) => total + (s.progress?.gamesPlayed || 0), 0), color: colors.accent, bg: `${colors.accent}20` },
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
              : 'No students have signed up yet. Students will appear here once they create an account and log in.'}
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