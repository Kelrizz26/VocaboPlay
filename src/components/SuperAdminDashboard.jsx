import React, { useState, useEffect } from 'react';
import { auth, db } from '../pages/firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';

// ===== MUTED GAME UI PALETTE (soft, not too bright) =====
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
  shadow: 'rgba(42, 40, 69, 0.06)',
  shadowMd: 'rgba(42, 40, 69, 0.10)',
  danger: '#DB7A64',
  dangerShadow: '#A95845',
};

const FONT_DISPLAY = "'Fredoka', sans-serif";
const FONT_BODY = "'Nunito', sans-serif";

// ===== DUOTONE SVG ICONS =====
const Icon = ({ name, size = 20, color = palette.bodyTextSoft }) => {
  const icons = {
    crown: (
      <>
        <path d="M3 17l2-10 5 5 2-7 2 7 5-5 2 10H3z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M3 21h18" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      </>
    ),
    chart: (
      <path d="M18 20V10M12 20V4M6 20v-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    ),
    user: (
      <>
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    graduation: (
      <>
        <path d="M22 10L12 5 2 10l10 5 10-5z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M6 12v5c0 1 3 3 6 3s6-2 6-3v-5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    clipboard: (
      <>
        <rect x="8" y="2" width="8" height="4" rx="1" stroke={color} strokeWidth="2" fill="none"/>
        <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    trophy: (
      <>
        <path d="M6 4h12v4a6 6 0 01-12 0V4z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M6 8H4a2 2 0 002 2M18 8h2a2 2 0 01-2 2M9 18h6M10 21h4M12 14v4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    logout: (
      <>
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M16 17l5-5-5-5M21 12H9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', flexShrink: 0 }}>
      {icons[name] || icons.crown}
    </svg>
  );
};

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');

  // Check if super admin
  useEffect(() => {
    const checkAuth = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/super-admin-login');
        return;
      }
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role !== 'super_admin') {
          navigate('/admin');
          return;
        }
      }
    };
    checkAuth();
  }, [navigate]);

  // Fetch all data
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const teachersSnap = await getDocs(query(collection(db, 'users'), where('role', 'in', ['admin', 'super_admin'])));
        const teachersList = [];
        teachersSnap.forEach((doc) => teachersList.push({ id: doc.id, ...doc.data() }));
        setTeachers(teachersList);

        const studentsSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'student')));
        const studentsList = [];
        studentsSnap.forEach((doc) => studentsList.push({ id: doc.id, ...doc.data() }));
        setStudents(studentsList);

        const activitiesSnap = await getDocs(collection(db, 'activities'));
        const activitiesList = [];
        activitiesSnap.forEach((doc) => activitiesList.push({ id: doc.id, ...doc.data() }));
        setActivities(activitiesList);

        const scoresSnap = await getDocs(collection(db, 'scores'));
        const scoresList = [];
        scoresSnap.forEach((doc) => scoresList.push({ id: doc.id, ...doc.data() }));
        setScores(scoresList);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: palette.cream, fontFamily: FONT_BODY }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;500;600;700;800&display=swap');`}</style>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            border: `3px solid ${palette.border}`, 
            borderTop: `3px solid ${palette.warmOrange}`, 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite', 
            margin: '0 auto 18px' 
          }} />
          <p style={{ color: palette.bodyTextSoft, fontFamily: FONT_DISPLAY, fontWeight: 700, margin: 0 }}>Loading Master Dashboard...</p>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: palette.cream, fontFamily: FONT_BODY }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Nunito', sans-serif; background: ${palette.cream}; }
        .super-admin-stat {
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .super-admin-stat:hover {
          transform: translateY(-3px);
          border-color: ${palette.warmOrange}40 !important;
          box-shadow: 0 8px 22px ${palette.shadowMd} !important;
        }
        .super-admin-row {
          transition: background 0.15s ease;
        }
        .super-admin-row:hover {
          background: ${palette.creamSoft} !important;
        }
      `}</style>

      {/* ===== TOP BAR (Muted Deep Navy) ===== */}
      <div style={{ 
        background: `linear-gradient(135deg, ${palette.deepNavy} 0%, ${palette.deepNavyLight} 100%)`, 
        color: 'white', 
        padding: '20px 40px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderBottom: `1px solid rgba(233, 160, 117, 0.15)`,
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <h1 style={{ 
          fontSize: '22px', 
          fontWeight: '800', 
          margin: 0, 
          fontFamily: FONT_DISPLAY,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          letterSpacing: '-0.3px',
        }}>
          <Icon name="crown" size={22} color={palette.warmOrange} />
          Super Admin Dashboard
        </h1>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', opacity: 0.75, fontFamily: FONT_BODY, fontWeight: 600 }}>
            Logged in as Super Admin
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: '9px 18px',
              background: palette.danger,
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: '800',
              cursor: 'pointer',
              fontFamily: FONT_DISPLAY,
              boxShadow: `0 3px 0 ${palette.dangerShadow}`,
              transition: 'transform 0.1s ease, box-shadow 0.1s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
            onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(3px)'; e.currentTarget.style.boxShadow = 'none'; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 3px 0 ${palette.dangerShadow}`; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 3px 0 ${palette.dangerShadow}`; }}
          >
            <Icon name="logout" size={12} color={palette.white} />
            Logout
          </button>
        </div>
      </div>

      {/* ===== NAVIGATION TABS ===== */}
      <div style={{ padding: '20px 40px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {[
          { id: 'overview', label: 'Overview', icon: 'chart' },
          { id: 'teachers', label: 'Teachers', icon: 'user' },
          { id: 'students', label: 'Students', icon: 'graduation' },
          { id: 'activities', label: 'Activities', icon: 'clipboard' },
          { id: 'scores', label: 'Scores', icon: 'trophy' },
        ].map((tab) => {
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              style={{
                padding: '10px 18px',
                background: isActive ? `${palette.warmOrange}15` : palette.white,
                color: isActive ? palette.warmOrange : palette.bodyText,
                border: isActive ? `1.5px solid ${palette.warmOrange}` : `1.5px solid ${palette.border}`,
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '13px',
                fontFamily: FONT_DISPLAY,
                boxShadow: isActive ? `0 2px 0 ${palette.warmOrange}40` : `0 2px 0 ${palette.border}`,
                transition: 'all 0.18s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
              }}
            >
              <Icon name={tab.icon} size={14} color={isActive ? palette.warmOrange : palette.bodyTextSoft} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ===== CONTENT ===== */}
      <div style={{ padding: '0 40px 40px' }}>
        {activeSection === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {[
              { value: teachers.length, label: 'Teachers', color: palette.warmOrange, icon: 'user' },
              { value: students.length, label: 'Students', color: palette.softGreen, icon: 'graduation' },
              { value: activities.length, label: 'Activities', color: palette.teal, icon: 'clipboard' },
              { value: scores.length, label: 'Scores Recorded', color: palette.coral, icon: 'trophy' },
            ].map((stat, i) => (
              <div 
                key={i}
                className="super-admin-stat"
                style={{ 
                  background: palette.white, 
                  padding: '20px', 
                  borderRadius: '14px', 
                  boxShadow: `0 2px 0 ${palette.border}`, 
                  border: `1.5px solid ${palette.border}`,
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: `${stat.color}15`,
                  border: `1.5px solid ${stat.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 12,
                }}>
                  <Icon name={stat.icon} size={16} color={stat.color} />
                </div>
                <h3 style={{ 
                  fontSize: '28px', 
                  margin: '0 0 4px 0', 
                  color: stat.color, 
                  fontFamily: FONT_DISPLAY, 
                  fontWeight: 800,
                  lineHeight: 1,
                }}>{stat.value}</h3>
                <p style={{ 
                  margin: '0', 
                  color: palette.bodyTextSoft, 
                  fontSize: '11px', 
                  fontFamily: FONT_DISPLAY, 
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}>{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'teachers' && (
          <div style={{ 
            background: palette.white, 
            padding: '24px', 
            borderRadius: '16px', 
            boxShadow: `0 2px 0 ${palette.border}`, 
            border: `1.5px solid ${palette.border}` 
          }}>
            <h2 style={{ 
              marginTop: 0, 
              fontFamily: FONT_DISPLAY, 
              color: palette.deepNavy, 
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '18px',
              marginBottom: '18px',
            }}>
              <Icon name="user" size={18} color={palette.warmOrange} />
              All Teachers
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONT_BODY, minWidth: '400px' }}>
                <thead>
                  <tr style={{ borderBottom: `1.5px solid ${palette.border}` }}>
                    <th style={{ padding: '12px', textAlign: 'left', color: palette.bodyTextSoft, fontFamily: FONT_DISPLAY, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: palette.bodyTextSoft, fontFamily: FONT_DISPLAY, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>Email</th>
                    <th style={{ padding: '12px', textAlign: 'center', color: palette.bodyTextSoft, fontFamily: FONT_DISPLAY, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((teacher) => (
                    <tr key={teacher.id} className="super-admin-row" style={{ borderBottom: `1.5px solid ${palette.borderSoft}` }}>
                      <td style={{ padding: '12px', fontWeight: 700, color: palette.deepNavy, fontFamily: FONT_DISPLAY }}>{teacher.displayName || teacher.email?.split('@')[0]}</td>
                      <td style={{ padding: '12px', color: palette.bodyText, fontWeight: 600 }}>{teacher.email}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{ 
                          padding: '4px 12px', 
                          borderRadius: '999px', 
                          fontSize: '10px', 
                          fontWeight: 800, 
                          fontFamily: FONT_DISPLAY,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          background: teacher.role === 'super_admin' ? `${palette.warmOrange}15` : `${palette.softGreen}15`, 
                          color: teacher.role === 'super_admin' ? palette.warmOrange : palette.softGreen,
                          border: `1px solid ${teacher.role === 'super_admin' ? palette.warmOrange + '40' : palette.softGreen + '40'}`,
                        }}>
                          {teacher.role.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === 'students' && (
          <div style={{ 
            background: palette.white, 
            padding: '24px', 
            borderRadius: '16px', 
            boxShadow: `0 2px 0 ${palette.border}`, 
            border: `1.5px solid ${palette.border}` 
          }}>
            <h2 style={{ 
              marginTop: 0, 
              fontFamily: FONT_DISPLAY, 
              color: palette.deepNavy, 
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '18px',
              marginBottom: '18px',
            }}>
              <Icon name="graduation" size={18} color={palette.softGreen} />
              All Students
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONT_BODY, minWidth: '400px' }}>
                <thead>
                  <tr style={{ borderBottom: `1.5px solid ${palette.border}` }}>
                    <th style={{ padding: '12px', textAlign: 'left', color: palette.bodyTextSoft, fontFamily: FONT_DISPLAY, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: palette.bodyTextSoft, fontFamily: FONT_DISPLAY, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>Email</th>
                    <th style={{ padding: '12px', textAlign: 'right', color: palette.bodyTextSoft, fontFamily: FONT_DISPLAY, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="super-admin-row" style={{ borderBottom: `1.5px solid ${palette.borderSoft}` }}>
                      <td style={{ padding: '12px', fontWeight: 700, color: palette.deepNavy, fontFamily: FONT_DISPLAY }}>{student.displayName || student.email?.split('@')[0]}</td>
                      <td style={{ padding: '12px', color: palette.bodyText, fontWeight: 600 }}>{student.email}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 800, color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>{student.totalPoints || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === 'activities' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
            {activities.map((activity) => (
              <div 
                key={activity.id} 
                className="super-admin-stat"
                style={{ 
                  background: palette.white, 
                  padding: '20px', 
                  borderRadius: '14px', 
                  boxShadow: `0 2px 0 ${palette.border}`, 
                  border: `1.5px solid ${palette.border}` 
                }}
              >
                <h4 style={{ 
                  margin: '0 0 10px 0', 
                  fontFamily: FONT_DISPLAY, 
                  color: palette.deepNavy, 
                  fontWeight: 800,
                  fontSize: '15px',
                }}>{activity.title}</h4>
                <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: palette.bodyText, fontFamily: FONT_BODY, fontWeight: 600 }}>
                  <strong style={{ color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>PIN:</strong> {activity.gamePin}
                </p>
                <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: palette.bodyText, fontFamily: FONT_BODY, fontWeight: 600 }}>
                  <strong style={{ color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>Teacher:</strong> {activity.teacherName || 'Unknown'}
                </p>
                <p style={{ margin: '0', fontSize: '12px', color: palette.bodyText, fontFamily: FONT_BODY, fontWeight: 600 }}>
                  <strong style={{ color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>Participants:</strong> {activity.participants || 0}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'scores' && (
          <div style={{ 
            background: palette.white, 
            padding: '24px', 
            borderRadius: '16px', 
            boxShadow: `0 2px 0 ${palette.border}`, 
            border: `1.5px solid ${palette.border}` 
          }}>
            <h2 style={{ 
              marginTop: 0, 
              fontFamily: FONT_DISPLAY, 
              color: palette.deepNavy, 
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '18px',
              marginBottom: '18px',
            }}>
              <Icon name="trophy" size={18} color={palette.coral} />
              All Scores
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONT_BODY, minWidth: '400px' }}>
                <thead>
                  <tr style={{ borderBottom: `1.5px solid ${palette.border}` }}>
                    <th style={{ padding: '12px', textAlign: 'left', color: palette.bodyTextSoft, fontFamily: FONT_DISPLAY, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>Student</th>
                    <th style={{ padding: '12px', textAlign: 'right', color: palette.bodyTextSoft, fontFamily: FONT_DISPLAY, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>Score</th>
                    <th style={{ padding: '12px', textAlign: 'right', color: palette.bodyTextSoft, fontFamily: FONT_DISPLAY, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((score) => (
                    <tr key={score.id} className="super-admin-row" style={{ borderBottom: `1.5px solid ${palette.borderSoft}` }}>
                      <td style={{ padding: '12px', fontWeight: 700, color: palette.deepNavy, fontFamily: FONT_DISPLAY }}>{score.studentName}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 800, color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>{score.score}</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: palette.bodyTextSoft, fontSize: '11px', fontWeight: 600 }}>{new Date(score.completedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;