// src/components/admin/AdminOverview.jsx
// ============================================================
// ✅ ADMIN OVERVIEW — polished to match Super Admin
// ✅ CONNECTED TO AVATAR SHOP — Shows FACE of character
// ============================================================

import React, { useState } from 'react';
import { AVATAR_SHOP_ITEMS, DEFAULT_AVATAR_ID } from '../../data/avatarShop';

// ===== MUTED DASHBOARD PALETTE =====
const palette = {
  warmOrange: '#E9A075',
  warmOrangeShadow: '#C27E4F',
  coral: '#DB7A64',
  coralShadow: '#A95845',
  teal: '#4F9188',
  tealShadow: '#3A6A63',
  deepNavy: '#2A2845',
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
  danger: '#DB7A64',
  dangerShadow: '#A95845',
};

const FONT_DISPLAY = "'Fredoka', sans-serif";
const FONT_BODY = "'Nunito', sans-serif";

// ===== DUOTONE SVG ICONS =====
const Icon = ({ name, size = 18, color = palette.bodyTextSoft }) => {
  const icons = {
    students: (
      <>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="9" cy="7" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    book: (
      <>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    activities: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M8 2v4M16 2v4M3 10h18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    chart: <path d="M18 20V10M12 20V4M6 20v-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
    arrowRight: <path d="M5 12h14M12 5l7 7-7 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', flexShrink: 0 }}>
      {icons[name] || icons.chart}
    </svg>
  );
};

// ✅ HELPER — Get the avatar image from the Avatar Shop
const getStudentAvatar = (student) => {
  if (!student) return AVATAR_SHOP_ITEMS[0]?.image || '';
  const avatarId = student.equippedAvatar || DEFAULT_AVATAR_ID;
  const found = AVATAR_SHOP_ITEMS.find(a => a.id === avatarId);
  return found?.image || AVATAR_SHOP_ITEMS[0]?.image || '';
};

// ✅ REUSABLE — Student avatar (image or initial fallback)
const StudentAvatarImage = ({ student, size = 36 }) => {
  const [imgError, setImgError] = useState(false);
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
          objectPosition: 'center 15%',
          display: 'block'
        }}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <span style={{ color: palette.white, fontWeight: '800', fontSize: size * 0.45, fontFamily: FONT_DISPLAY }}>
      {student.displayName?.charAt(0)?.toUpperCase() || '?'}
    </span>
  );
};

// ===== Shared style helpers (matching Super Admin) =====
const summaryCardStyle = (color) => ({
  background: palette.white,
  padding: '16px 18px',
  borderRadius: '14px',
  boxShadow: `0 2px 0 ${palette.border}`,
  border: `1.5px solid ${palette.border}`,
  borderLeft: `4px solid ${color}`,
});

const summaryIconStyle = (color) => ({
  width: 32,
  height: 32,
  borderRadius: 8,
  background: `${color}15`,
  border: `1.5px solid ${color}30`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 10,
});

const summaryLabelStyle = {
  fontSize: '10px',
  fontWeight: 800,
  color: palette.bodyTextSoft,
  fontFamily: FONT_DISPLAY,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '4px',
};

const summaryValueStyle = (color) => ({
  fontSize: '24px',
  fontWeight: 800,
  color: color,
  fontFamily: FONT_DISPLAY,
  lineHeight: 1,
});

const cardStyle = {
  background: palette.white,
  padding: '24px',
  borderRadius: '16px',
  boxShadow: `0 2px 0 ${palette.border}`,
  border: `1.5px solid ${palette.border}`,
};

const cardTitleStyle = {
  margin: '0 0 16px 0',
  fontFamily: FONT_DISPLAY,
  color: palette.deepNavy,
  fontWeight: 800,
  fontSize: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  letterSpacing: '-0.2px',
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
      icon: 'students',
      color: palette.warmOrange,
      change: `${students.length} total`
    },
    {
      label: 'Active Words',
      value: String(words.length),
      icon: 'book',
      color: palette.softGreen,
      change: `${words.length} total`
    },
    {
      label: 'Total Activities',
      value: String(totalActivities),
      icon: 'activities',
      color: palette.gold,
      change: `${totalActivities} total`
    },
    {
      label: 'Avg Score',
      value: avgScore + '%',
      icon: 'chart',
      color: palette.teal,
      change: 'Class average'
    },
  ];

  return (
    <div className="admin-ov-wrapper">
      <style>{`
        @media (max-width: 768px) {
          .admin-ov-wrapper .stats-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 12px !important;
          }
          .admin-ov-wrapper .two-col {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .admin-ov-wrapper .platform-stats {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 480px) {
          .admin-ov-wrapper .stats-grid {
            grid-template-columns: 1fr !important;
          }
          .admin-ov-wrapper .platform-stats {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* ===== Page header bar (Super-Admin style) ===== */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '16px 20px',
          background: palette.white,
          borderRadius: '14px',
          border: `1.5px solid ${palette.border}`,
          boxShadow: `0 2px 0 ${palette.border}`,
        }}>
          <div>
            <h2 style={{
              margin: 0,
              fontFamily: FONT_DISPLAY,
              color: palette.deepNavy,
              fontWeight: 800,
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              letterSpacing: '-0.2px',
            }}>
              <Icon name="chart" size={18} color={palette.warmOrange} />
              Dashboard Overview
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: palette.bodyTextSoft, fontWeight: 600 }}>
              Monitor your vocabulary learning platform
            </p>
          </div>
        </div>

        {/* ===== Stat tiles (borderLeft: 4px, same as SA) ===== */}
        <div
          className="stats-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          {stats.map((s, i) => (
            <div key={i} style={summaryCardStyle(s.color)}>
              <div style={summaryIconStyle(s.color)}>
                <Icon name={s.icon} size={14} color={s.color} />
              </div>
              <div style={summaryLabelStyle}>{s.label}</div>
              <div style={summaryValueStyle(s.color)}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* ===== Two Column Layout ===== */}
        <div
          className="two-col"
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}
        >
          {/* Recent Activity */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>
              <Icon name="students" size={16} color={palette.warmOrange} />
              Recent Activity
            </h3>
            {recentStudents.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recentStudents.map((st, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      background: palette.creamSoft,
                      borderRadius: '12px',
                      border: `1.5px solid ${palette.border}`,
                    }}
                  >
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      background: palette.creamSoft,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      border: `1.5px solid ${palette.border}`,
                    }}>
                      <StudentAvatarImage student={st} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: palette.deepNavy,
                        fontFamily: FONT_BODY,
                      }}>
                        <strong style={{ fontWeight: 800 }}>{st.displayName}</strong> joined
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: palette.bodyTextSoft,
                        fontWeight: 600,
                        marginTop: '2px',
                      }}>
                        {st.joinDate || 'Recently'}
                      </div>
                    </div>
                    {st.createdAt && new Date(st.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                      <span style={{
                        fontSize: '10px',
                        background: `${palette.softGreen}15`,
                        color: palette.softGreen,
                        padding: '3px 8px',
                        borderRadius: '999px',
                        fontWeight: 800,
                        border: `1px solid ${palette.softGreen}40`,
                        fontFamily: FONT_DISPLAY,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                      }}>New</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '32px 20px',
                color: palette.bodyTextSoft,
                fontWeight: 600,
              }}>
                <div style={{
                  display: 'inline-flex',
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: palette.creamSoft,
                  border: `1.5px solid ${palette.border}`,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                }}>
                  <Icon name="students" size={24} color={palette.bodyTextSoft} />
                </div>
                <div style={{ fontSize: '13px' }}>No students yet</div>
              </div>
            )}
          </div>

          {/* Platform Stats */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>
              <Icon name="chart" size={16} color={palette.teal} />
              Platform Stats
            </h3>
            <div
              className="platform-stats"
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}
            >
              {[
                { label: 'Easy Words', value: easyWords, color: palette.softGreen },
                { label: 'Medium Words', value: mediumWords, color: palette.gold },
                { label: 'Hard Words', value: hardWords, color: palette.danger },
                { label: 'Total Plays', value: totalPlays, color: palette.warmOrange },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: '14px',
                    background: `${item.color}15`,
                    borderRadius: '12px',
                    textAlign: 'center',
                    border: `1.5px solid ${item.color}30`,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 4px 12px ${palette.shadowMd}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    fontSize: '22px',
                    fontWeight: 800,
                    color: item.color,
                    fontFamily: FONT_DISPLAY,
                    lineHeight: 1.2,
                  }}>{item.value}</div>
                  <div style={{
                    fontSize: '11px',
                    color: item.color,
                    fontWeight: 700,
                    marginTop: '2px',
                    fontFamily: FONT_DISPLAY,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== Students Summary ===== */}
        <div style={{
          background: palette.white,
          padding: students.length > 0 ? '24px' : '40px 24px',
          borderRadius: '16px',
          border: `1.5px solid ${palette.border}`,
          boxShadow: `0 2px 0 ${palette.border}`,
          textAlign: 'center',
        }}>
          {students.length === 0 && (
            <div style={{
              display: 'inline-flex',
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: palette.creamSoft,
              border: `1.5px solid ${palette.border}`,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <Icon name="students" size={32} color={palette.warmOrange} />
            </div>
          )}
          <h3 style={{
            fontSize: '18px',
            fontWeight: 800,
            color: palette.deepNavy,
            marginBottom: '6px',
            fontFamily: FONT_DISPLAY,
            letterSpacing: '-0.2px',
          }}>
            {students.length > 0 ? `students.lengthActiveStudent{students.length > 1 ? 's' : ''}` : 'No Students Yet'}
          </h3>
          <p style={{
            fontSize: '13px',
            color: palette.bodyTextSoft,
            maxWidth: '500px',
            margin: '0 auto',
            lineHeight: '1.6',
            fontFamily: FONT_BODY,
            fontWeight: 600,
          }}>
            {students.length > 0
              ? 'Students are actively learning vocabulary. Check the Students tab for detailed progress.'
              : 'No students have joined your activities yet. Share a PIN to get started!'}
          </p>
          {students.length > 0 && (
            <button
              onClick={() => setActiveMenu('Students')}
              style={{
                marginTop: '16px',
                padding: '11px 22px',
                background: palette.warmOrange,
                color: palette.white,
                border: 'none',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: FONT_DISPLAY,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                boxShadow: `0 3px 0 ${palette.warmOrangeShadow}`,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translateY(3px)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 3px 0 ${palette.warmOrangeShadow}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 3px 0 ${palette.warmOrangeShadow}`;
              }}
            >
              View All Students
              <Icon name="arrowRight" size={13} color={palette.white} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;


