import React, { useState, useEffect } from 'react';
import { auth, db } from '../pages/firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';

// ===== BRAND PALETTE (matches Landing) =====
const palette = {
  darkPurple: '#7C4DFF',
  violetDeep: '#5B34B8',
  purple: '#8B5CF6',
  softPurple: '#A78BFA',
  violetPale: '#F1ECFF',
  pastelViolet: '#F3EEFF',
  heading: '#2d2a5e',
  body: '#3d3a6b',
  white: '#FFFFFF',
  border: '#EDE7FB',
};

const chunkyButton = (bg, shadowColor) => ({
  background: bg,
  color: '#ffffff',
  border: '2px solid rgba(255,255,255,0.6)',
  borderRadius: '14px',
  fontWeight: '800',
  cursor: 'pointer',
  boxShadow: `0 4px 0 ${shadowColor}, 0 6px 14px rgba(45,42,94,0.18)`,
  transition: 'transform 0.12s ease, box-shadow 0.12s ease',
  fontFamily: "'Fredoka', sans-serif",
});
const pressBtn = (e, shadowColor) => {
  e.currentTarget.style.transform = 'translateY(3px)';
  e.currentTarget.style.boxShadow = `0 1px 0 ${shadowColor}, 0 3px 8px rgba(45,42,94,0.15)`;
};
const releaseBtn = (e, shadowColor) => {
  e.currentTarget.style.transform = 'translateY(0)';
  e.currentTarget.style.boxShadow = `0 4px 0 ${shadowColor}, 0 6px 14px rgba(45,42,94,0.18)`;
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
        // Teachers
        const teachersSnap = await getDocs(query(collection(db, 'users'), where('role', 'in', ['admin', 'super_admin'])));
        const teachersList = [];
        teachersSnap.forEach((doc) => teachersList.push({ id: doc.id, ...doc.data() }));
        setTeachers(teachersList);

        // Students
        const studentsSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'student')));
        const studentsList = [];
        studentsSnap.forEach((doc) => studentsList.push({ id: doc.id, ...doc.data() }));
        setStudents(studentsList);

        // Activities
        const activitiesSnap = await getDocs(collection(db, 'activities'));
        const activitiesList = [];
        activitiesSnap.forEach((doc) => activitiesList.push({ id: doc.id, ...doc.data() }));
        setActivities(activitiesList);

        // Scores
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: palette.pastelViolet }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;500;600;700;800&display=swap');`}</style>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '50px', height: '50px', border: `4px solid ${palette.border}`, borderTop: `4px solid ${palette.darkPurple}`, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
          <p style={{ color: palette.body, fontFamily: "'Fredoka', sans-serif", fontWeight: 700 }}>Loading Master Dashboard...</p>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: palette.pastelViolet, fontFamily: "'Nunito', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Nunito', sans-serif; }
      `}</style>

      {/* Top Bar */}
      <div style={{ background: 'linear-gradient(135deg, #7C4DFF 0%, #8B5CF6 100%)', color: 'white', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid rgba(255,255,255,0.2)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0, fontFamily: "'Fredoka', sans-serif" }}>👑 Super Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', opacity: 0.9, fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>Logged in as Super Admin</span>
          <button
            onClick={handleLogout}
            style={{ ...chunkyButton('#f44336', '#B71C1C'), padding: '8px 16px', fontSize: '13px' }}
            onMouseDown={(e) => pressBtn(e, '#B71C1C')}
            onMouseUp={(e) => releaseBtn(e, '#B71C1C')}
            onMouseLeave={(e) => releaseBtn(e, '#B71C1C')}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ padding: '20px 40px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {[
          { id: 'overview', label: '📊 Overview' },
          { id: 'teachers', label: '👨‍🏫 Teachers' },
          { id: 'students', label: '🎓 Students' },
          { id: 'activities', label: '📝 Activities' },
          { id: 'scores', label: '🏆 Scores' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            style={{
              padding: '12px 20px',
              background: activeSection === tab.id ? 'linear-gradient(135deg, #A78BFA 0%, #7C4DFF 100%)' : palette.white,
              color: activeSection === tab.id ? 'white' : palette.heading,
              border: activeSection === tab.id ? '2px solid rgba(255,255,255,0.6)' : `2px solid ${palette.border}`,
              borderRadius: '14px',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '14px',
              fontFamily: "'Fredoka', sans-serif",
              boxShadow: activeSection === tab.id ? '0 4px 0 #5B34B8' : '0 3px 0 #EDE7FB',
              transition: 'all 0.2s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '20px 40px' }}>
        {activeSection === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div style={{ background: palette.white, padding: '20px', borderRadius: '16px', boxShadow: '0 6px 18px rgba(124, 77, 255, 0.10)', border: `2px solid ${palette.border}` }}>
              <h3 style={{ fontSize: '32px', margin: '0', color: palette.darkPurple, fontFamily: "'Fredoka', sans-serif", fontWeight: 800 }}>{teachers.length}</h3>
              <p style={{ margin: '0', color: palette.body, fontSize: '13px', fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>Teachers</p>
            </div>
            <div style={{ background: palette.white, padding: '20px', borderRadius: '16px', boxShadow: '0 6px 18px rgba(124, 77, 255, 0.10)', border: `2px solid ${palette.border}` }}>
              <h3 style={{ fontSize: '32px', margin: '0', color: '#2e7d32', fontFamily: "'Fredoka', sans-serif", fontWeight: 800 }}>{students.length}</h3>
              <p style={{ margin: '0', color: palette.body, fontSize: '13px', fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>Students</p>
            </div>
            <div style={{ background: palette.white, padding: '20px', borderRadius: '16px', boxShadow: '0 6px 18px rgba(124, 77, 255, 0.10)', border: `2px solid ${palette.border}` }}>
              <h3 style={{ fontSize: '32px', margin: '0', color: '#b85c1a', fontFamily: "'Fredoka', sans-serif", fontWeight: 800 }}>{activities.length}</h3>
              <p style={{ margin: '0', color: palette.body, fontSize: '13px', fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>Activities</p>
            </div>
            <div style={{ background: palette.white, padding: '20px', borderRadius: '16px', boxShadow: '0 6px 18px rgba(124, 77, 255, 0.10)', border: `2px solid ${palette.border}` }}>
              <h3 style={{ fontSize: '32px', margin: '0', color: '#1a237e', fontFamily: "'Fredoka', sans-serif", fontWeight: 800 }}>{scores.length}</h3>
              <p style={{ margin: '0', color: palette.body, fontSize: '13px', fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>Scores Recorded</p>
            </div>
          </div>
        )}

        {activeSection === 'teachers' && (
          <div style={{ background: palette.white, padding: '24px', borderRadius: '16px', boxShadow: '0 6px 18px rgba(124, 77, 255, 0.10)', border: `2px solid ${palette.border}` }}>
            <h2 style={{ marginTop: 0, fontFamily: "'Fredoka', sans-serif", color: palette.heading, fontWeight: 800 }}>👨‍🏫 All Teachers</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Nunito', sans-serif" }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${palette.border}` }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: palette.heading, fontFamily: "'Fredoka', sans-serif", fontSize: '13px' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: palette.heading, fontFamily: "'Fredoka', sans-serif", fontSize: '13px' }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: palette.heading, fontFamily: "'Fredoka', sans-serif", fontSize: '13px' }}>Role</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher.id} style={{ borderBottom: `1px solid ${palette.border}` }}>
                    <td style={{ padding: '12px', fontWeight: 700, color: palette.heading }}>{teacher.displayName || teacher.email?.split('@')[0]}</td>
                    <td style={{ padding: '12px', color: palette.body, fontWeight: 600 }}>{teacher.email}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, fontFamily: "'Fredoka', sans-serif", background: teacher.role === 'super_admin' ? palette.darkPurple : '#e8f5e9', color: teacher.role === 'super_admin' ? 'white' : '#2e7d32' }}>
                        {teacher.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeSection === 'students' && (
          <div style={{ background: palette.white, padding: '24px', borderRadius: '16px', boxShadow: '0 6px 18px rgba(124, 77, 255, 0.10)', border: `2px solid ${palette.border}` }}>
            <h2 style={{ marginTop: 0, fontFamily: "'Fredoka', sans-serif", color: palette.heading, fontWeight: 800 }}>🎓 All Students</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Nunito', sans-serif" }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${palette.border}` }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: palette.heading, fontFamily: "'Fredoka', sans-serif", fontSize: '13px' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: palette.heading, fontFamily: "'Fredoka', sans-serif", fontSize: '13px' }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: palette.heading, fontFamily: "'Fredoka', sans-serif", fontSize: '13px' }}>Points</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} style={{ borderBottom: `1px solid ${palette.border}` }}>
                    <td style={{ padding: '12px', fontWeight: 700, color: palette.heading }}>{student.displayName || student.email?.split('@')[0]}</td>
                    <td style={{ padding: '12px', color: palette.body, fontWeight: 600 }}>{student.email}</td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 800, color: palette.darkPurple, fontFamily: "'Fredoka', sans-serif" }}>{student.totalPoints || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeSection === 'activities' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
            {activities.map((activity) => (
              <div key={activity.id} style={{ background: palette.white, padding: '20px', borderRadius: '16px', boxShadow: '0 6px 18px rgba(124, 77, 255, 0.10)', border: `2px solid ${palette.border}` }}>
                <h4 style={{ margin: '0 0 8px 0', fontFamily: "'Fredoka', sans-serif", color: palette.heading, fontWeight: 800 }}>{activity.title}</h4>
                <p style={{ margin: '0', fontSize: '13px', color: palette.body, fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>
                  <strong style={{ color: palette.darkPurple }}>PIN:</strong> {activity.gamePin} | <strong style={{ color: palette.darkPurple }}>Teacher:</strong> {activity.teacherName || 'Unknown'}
                </p>
                <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: palette.body, fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>
                  <strong style={{ color: palette.darkPurple }}>Participants:</strong> {activity.participants || 0}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'scores' && (
          <div style={{ background: palette.white, padding: '24px', borderRadius: '16px', boxShadow: '0 6px 18px rgba(124, 77, 255, 0.10)', border: `2px solid ${palette.border}` }}>
            <h2 style={{ marginTop: 0, fontFamily: "'Fredoka', sans-serif", color: palette.heading, fontWeight: 800 }}>🏆 All Scores</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Nunito', sans-serif" }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${palette.border}` }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: palette.heading, fontFamily: "'Fredoka', sans-serif", fontSize: '13px' }}>Student</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: palette.heading, fontFamily: "'Fredoka', sans-serif", fontSize: '13px' }}>Score</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: palette.heading, fontFamily: "'Fredoka', sans-serif", fontSize: '13px' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((score) => (
                  <tr key={score.id} style={{ borderBottom: `1px solid ${palette.border}` }}>
                    <td style={{ padding: '12px', fontWeight: 700, color: palette.heading }}>{score.studentName}</td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 800, color: palette.darkPurple, fontFamily: "'Fredoka', sans-serif" }}>{score.score}</td>
                    <td style={{ padding: '12px', textAlign: 'right', color: palette.body, fontSize: '12px', fontWeight: 600 }}>{new Date(score.completedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;