// src/components/admin/AdminLeaderboards.jsx
// ============================================================
// ✅ ADMIN LEADERBOARDS - Shows ONLY teacher's students
// Filtered by teacherId (from activities na ginawa ng teacher)
// ============================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { db, auth } from '../../pages/firebase';
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import { colors, fontFamily } from '../dashboard/dashboardStyles';
import { AVATAR_SHOP_ITEMS, DEFAULT_AVATAR_ID, RARITY_CONFIG } from '../../data/avatarShop';

// ✅ HELPER — Kunin yung avatar URL galing sa Avatar Shop
const getStudentAvatar = (student) => {
  if (!student) return AVATAR_SHOP_ITEMS[0]?.image || '';
  const avatarId = student.equippedAvatar || DEFAULT_AVATAR_ID;
  const found = AVATAR_SHOP_ITEMS.find(a => a.id === avatarId);
  return found?.image || AVATAR_SHOP_ITEMS[0]?.image || '';
};

// ✅ REUSABLE — Avatar na FACE-FOCUSED
const StudentAvatar = ({ student, size = 40, borderRadius = '50%' }) => {
  const [imgError, setImgError] = useState(false);
  const avatarSrc = getStudentAvatar(student);

  if (!imgError && avatarSrc) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url(${avatarSrc})`,
          backgroundSize: '130%',
          backgroundPosition: 'center 20%',
          backgroundRepeat: 'no-repeat',
          borderRadius: borderRadius,
          display: 'block'
        }}
        aria-label={student.displayName}
      />
    );
  }

  return (
    <span style={{ color: '#fff', fontWeight: '600', fontSize: size * 0.4 }}>
      {student.displayName?.charAt(0)?.toUpperCase() || '?'}
    </span>
  );
};

const AdminLeaderboards = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLeaderboard, setSelectedLeaderboard] = useState('points');
  const [currentTeacher, setCurrentTeacher] = useState(null);
  const [teacherActivityIds, setTeacherActivityIds] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // ============================================================
  // ✅ GET VALUE PER CATEGORY
  // ============================================================
  const getValue = useCallback((student) => {
    const stats = student.progress || student.stats || {};
    switch (selectedLeaderboard) {
      case 'points': return stats.totalPoints || student.totalPoints || 0;
      case 'words': return stats.wordsLearned || student.wordsLearned || 0;
      case 'streak': return stats.longestStreak || stats.streak || student.currentStreak || 0;
      case 'games': return stats.gamesPlayed || student.gamesPlayed || 0;
      default: return stats.totalPoints || student.totalPoints || 0;
    }
  }, [selectedLeaderboard]);

  const getUnit = useCallback(() => {
    switch (selectedLeaderboard) {
      case 'points': return 'pts';
      case 'words': return 'words';
      case 'streak': return 'days';
      case 'games': return 'games';
      default: return 'pts';
    }
  }, [selectedLeaderboard]);

  // ============================================================
  // ✅ FETCH: Students lang na nag-join sa activities ng teacher
  // ============================================================
  const fetchTeacherLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      // ✅ STEP 1: Get teacher data
      const teacherRef = doc(db, 'users', user.uid);
      const teacherDoc = await getDoc(teacherRef);
      const teacherData = teacherDoc.exists() ? teacherDoc.data() : {};
      setCurrentTeacher({
        uid: user.uid,
        displayName: teacherData.displayName || user.email?.split('@')[0] || 'Teacher',
        email: user.email || '',
        ...teacherData
      });

      // ✅ STEP 2: Get all activities ng teacher
      const activitiesQuery = query(
        collection(db, 'activities'),
        where('teacherId', '==', user.uid)
      );
      const activitiesSnap = await getDocs(activitiesQuery);
      const activityIds = activitiesSnap.docs.map(d => d.id);
      setTeacherActivityIds(activityIds);

      if (activityIds.length === 0) {
        setLeaderboardData([]);
        setLoading(false);
        return;
      }

      // ✅ STEP 3: Get scores para sa teacher's activities → student IDs
      const scoresSnap = await getDocs(collection(db, 'scores'));
      const studentIds = [];
      scoresSnap.forEach(d => {
        const s = d.data();
        if (activityIds.includes(s.activityId) && !studentIds.includes(s.studentId)) {
          studentIds.push(s.studentId);
        }
      });

      if (studentIds.length === 0) {
        setLeaderboardData([]);
        setLoading(false);
        return;
      }

      // ✅ STEP 4: Get students data (users with role=student AND in studentIds)
      const usersSnap = await getDocs(collection(db, 'users'));
      const students = usersSnap.docs
        .map(d => {
          const data = d.data();
          if (data.role === 'student' && studentIds.includes(d.id)) {
            return {
              id: d.id,
              ...data,
              displayName: data.displayName || data.email?.split('@')[0] || 'Unknown',
              username: data.username || `@${(data.displayName || 'user').toLowerCase().replace(/\s/g, '')}`,
              email: data.email || 'No email',
              equippedAvatar: data.equippedAvatar || DEFAULT_AVATAR_ID,
              progress: data.progress || {},
              stats: data.progress || {},
              totalPoints: data.totalPoints || data.progress?.totalPoints || 0,
              currentStreak: data.currentStreak || data.progress?.streak || 0
            };
          }
          return null;
        })
        .filter(s => s !== null);

      // ✅ STEP 5: Sort by selected category
      students.sort((a, b) => getValue(b) - getValue(a));

      // ✅ STEP 6: Add rank
      students.forEach((s, i) => { s.rank = i + 1; });

      setLeaderboardData(students);
      console.log(`✅ Loaded ${students.length} students for teacher ${user.uid}`);
    } catch (err) {
      console.error('❌ Error fetching admin leaderboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getValue]);

  useEffect(() => {
    fetchTeacherLeaderboard();
  }, [fetchTeacherLeaderboard]);

  // ============================================================
  // ✅ RE-SORT kapag nagbago yung category
  // ============================================================
  useEffect(() => {
    if (leaderboardData.length > 0) {
      const sorted = [...leaderboardData].sort((a, b) => getValue(b) - getValue(a));
      sorted.forEach((s, i) => { s.rank = i + 1; });
      setLeaderboardData(sorted);
    }
  }, [selectedLeaderboard, getValue]);

  // ============================================================
  // ✅ FETCH PROFILE FOR MODAL
  // ============================================================
  const fetchUserProfile = async (userId) => {
    setProfileLoading(true);
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        setSelectedProfile({
          id: userId,
          displayName: data.displayName || 'Anonymous',
          username: data.username || `@${(data.displayName || 'user').toLowerCase().replace(/\s/g, '')}`,
          email: data.email || 'No email',
          bio: data.bio || 'No bio yet',
          equippedAvatar: data.equippedAvatar || DEFAULT_AVATAR_ID,
          progress: data.progress || {},
          stats: data.progress || {},
          totalPoints: data.totalPoints || 0
        });
        setShowProfileModal(true);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  // ============================================================
  // ✅ LEADERBOARD CATEGORIES
  // ============================================================
  const leaderboardTypes = [
    { id: 'points', label: 'Total Points', icon: '⭐', color: '#5C6AC4', bg: '#EEF0FB' },
    { id: 'words', label: 'Words Learned', icon: '📚', color: '#2E7D32', bg: '#e8f5e9' },
    { id: 'streak', label: 'Longest Streak', icon: '🔥', color: '#B85C1A', bg: '#fff4e5' },
    { id: 'games', label: 'Games Played', icon: '🎮', color: '#C44545', bg: '#fee9e9' },
  ];

  const currentType = leaderboardTypes.find(t => t.id === selectedLeaderboard) || leaderboardTypes[0];

  // ============================================================
  // ✅ RENDER
  // ============================================================
  return (
    <div className="admin-lb-container" style={{
      fontFamily,
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '24px',
      color: colors.textPrimary
    }}>
      <style>{`
        @media (max-width: 768px) {
          .admin-lb-container { padding: 16px !important; }
          .admin-lb-types { grid-template-columns: 1fr 1fr !important; gap: 8px !important; }
          .admin-lb-table th, .admin-lb-table td { padding: 10px 12px !important; font-size: 12px !important; }
          .admin-lb-podium { flex-direction: column !important; align-items: center !important; gap: 16px !important; }
        }
        .admin-lb-row:hover { background: ${colors.bg} !important; }
      `}</style>

      {/* HEADER */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: '24px',
        borderBottom: `1px solid ${colors.border}`,
        paddingBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: '6px',
            fontFamily
          }}>Class Leaderboard</h1>
          <p style={{
            fontSize: '15px',
            color: colors.textSecondary,
            margin: 0,
            fontWeight: '300',
            fontFamily
          }}>
            Rankings ng iyong students — sila lang ang nag-join sa activities mo
          </p>
        </div>
        <span style={{
          fontSize: '13px',
          color: colors.textSecondary,
          background: colors.bg,
          padding: '8px 16px',
          borderRadius: '90px',
          border: `1px solid ${colors.border}`,
          fontFamily
        }}>
          {leaderboardData.length} Student{leaderboardData.length !== 1 ? 's' : ''} Enrolled
        </span>
      </div>

      {/* CATEGORY TABS */}
      <div className="admin-lb-types" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
        marginBottom: '24px'
      }}>
        {leaderboardTypes.map(type => (
          <button
            key={type.id}
            onClick={() => setSelectedLeaderboard(type.id)}
            style={{
              background: selectedLeaderboard === type.id ? type.color : colors.surface,
              border: `1px solid ${selectedLeaderboard === type.id ? type.color : colors.border}`,
              borderRadius: '14px',
              padding: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: selectedLeaderboard === type.id ? `0 4px 12px ${type.color}33` : 'none',
              fontFamily
            }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: selectedLeaderboard === type.id ? 'rgba(255,255,255,0.2)' : type.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px'
            }}>{type.icon}</div>
            <div style={{
              fontSize: '13px',
              fontWeight: '600',
              color: selectedLeaderboard === type.id ? 'white' : colors.textPrimary
            }}>{type.label}</div>
          </button>
        ))}
      </div>

      {/* LOADING */}
      {loading ? (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          background: colors.surface,
          borderRadius: '16px',
          border: `1px solid ${colors.border}`
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>⏳</div>
          <div style={{ fontSize: '15px', color: colors.textSecondary }}>Loading your class leaderboard...</div>
        </div>
      ) : error ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: `${colors.danger}15`,
          border: `1px solid ${colors.danger}40`,
          borderRadius: '16px'
        }}>
          <div style={{ fontSize: '15px', color: colors.danger, marginBottom: '12px' }}>⚠️ {error}</div>
          <button
            onClick={fetchTeacherLeaderboard}
            style={{
              padding: '10px 20px',
              background: colors.danger,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily,
              fontWeight: '600'
            }}
          >Retry</button>
        </div>
      ) : leaderboardData.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: colors.surface,
          borderRadius: '16px',
          border: `1px dashed ${colors.border}`
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏆</div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: '6px',
            fontFamily
          }}>No students yet</h3>
          <p style={{
            fontSize: '14px',
            color: colors.textSecondary,
            margin: 0,
            fontFamily
          }}>
            Kapag may nag-join nang student sa activities mo, lalabas sila dito.
          </p>
        </div>
      ) : (
        <>
          {/* TOP 3 PODIUM */}
          {leaderboardData.length >= 3 && (
            <div className="admin-lb-podium" style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              gap: '16px',
              marginBottom: '24px',
              padding: '20px',
              background: `${colors.accent}10`,
              borderRadius: '16px',
              border: `1px solid ${colors.border}`,
              flexWrap: 'wrap'
            }}>
              {/* 2nd Place */}
              {leaderboardData[1] && (
                <div
                  onClick={() => fetchUserProfile(leaderboardData[1].id)}
                  style={{ textAlign: 'center', cursor: 'pointer' }}
                >
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px',
                    border: '3px solid #a0a0a0',
                    position: 'relative'
                  }}>
                    <StudentAvatar student={leaderboardData[1]} />
                    <div style={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: '#a0a0a0',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      fontWeight: '700',
                      border: '2px solid #fff'
                    }}>2</div>
                  </div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: colors.textPrimary,
                    marginBottom: '4px',
                    fontFamily
                  }}>{leaderboardData[1].displayName}</div>
                  <div style={{
                    fontSize: '13px',
                    color: colors.textSecondary,
                    background: colors.border,
                    padding: '3px 10px',
                    borderRadius: '12px',
                    display: 'inline-block',
                    fontFamily
                  }}>{getValue(leaderboardData[1])} {getUnit()}</div>
                </div>
              )}

              {/* 1st Place */}
              {leaderboardData[0] && (
                <div
                  onClick={() => fetchUserProfile(leaderboardData[0].id)}
                  style={{ textAlign: 'center', transform: 'scale(1.08)', zIndex: 2, cursor: 'pointer' }}
                >
                  <div style={{
                    width: '96px',
                    height: '96px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: `linear-gradient(135deg, #FFD700, #FFA500)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px',
                    border: '3px solid #d4af37',
                    position: 'relative'
                  }}>
                    <StudentAvatar student={leaderboardData[0]} />
                    <div style={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      background: '#d4af37',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '15px',
                      fontWeight: '700',
                      border: '2px solid #fff'
                    }}>1</div>
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: colors.textPrimary,
                    marginBottom: '4px',
                    fontFamily
                  }}>{leaderboardData[0].displayName}</div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: colors.accent,
                    background: `${colors.accent}20`,
                    padding: '4px 12px',
                    borderRadius: '12px',
                    display: 'inline-block',
                    fontFamily
                  }}>{getValue(leaderboardData[0])} {getUnit()}</div>
                </div>
              )}

              {/* 3rd Place */}
              {leaderboardData[2] && (
                <div
                  onClick={() => fetchUserProfile(leaderboardData[2].id)}
                  style={{ textAlign: 'center', cursor: 'pointer' }}
                >
                  <div style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: `linear-gradient(135deg, #b08d6b, #8b6f4c)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px',
                    border: '3px solid #b08d6b',
                    position: 'relative'
                  }}>
                    <StudentAvatar student={leaderboardData[2]} />
                    <div style={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: '#b08d6b',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: '700',
                      border: '2px solid #fff'
                    }}>3</div>
                  </div>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: colors.textPrimary,
                    marginBottom: '4px',
                    fontFamily
                  }}>{leaderboardData[2].displayName}</div>
                  <div style={{
                    fontSize: '12px',
                    color: colors.textSecondary,
                    background: colors.border,
                    padding: '3px 10px',
                    borderRadius: '12px',
                    display: 'inline-block',
                    fontFamily
                  }}>{getValue(leaderboardData[2])} {getUnit()}</div>
                </div>
              )}
            </div>
          )}

          {/* TABLE */}
          <div style={{
            background: colors.surface,
            borderRadius: '16px',
            border: `1px solid ${colors.border}`,
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: `1px solid ${colors.border}`,
              background: colors.bg,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <h3 style={{
                fontSize: '15px',
                fontWeight: '600',
                color: colors.textPrimary,
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily
              }}>
                <span style={{ fontSize: '18px', color: currentType.color }}>{currentType.icon}</span>
                {currentType.label} Ranking
              </h3>
              <span style={{
                fontSize: '12px',
                color: colors.textSecondary,
                background: colors.surface,
                padding: '4px 10px',
                borderRadius: '12px',
                border: `1px solid ${colors.border}`,
                fontFamily
              }}>
                {leaderboardData.length} student{leaderboardData.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="admin-lb-table" style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontFamily,
                minWidth: '600px'
              }}>
                <thead>
                  <tr style={{
                    background: colors.surface,
                    borderBottom: `1px solid ${colors.border}`
                  }}>
                    <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: colors.textMuted }}>Rank</th>
                    <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: colors.textMuted }}>Student</th>
                    <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: colors.textMuted }}>Email</th>
                    <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: colors.textMuted }}>Level</th>
                    <th style={{ padding: '14px 20px', textAlign: 'right', fontSize: '12px', fontWeight: '500', color: colors.textMuted }}>{currentType.label}</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.map((student, index) => (
                    <tr
                      key={student.id}
                      className="admin-lb-row"
                      onClick={() => fetchUserProfile(student.id)}
                      style={{
                        borderBottom: index < leaderboardData.length - 1 ? `1px solid ${colors.border}` : 'none',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: student.rank === 1 ? '#f5e9d3' : student.rank === 2 ? colors.bg : student.rank === 3 ? '#ede0d4' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: student.rank === 1 ? '#b38b40' : student.rank === 2 ? colors.textSecondary : student.rank === 3 ? '#8b6f4c' : colors.textMuted,
                          fontWeight: '600',
                          fontSize: '13px',
                          fontFamily
                        }}>
                          {student.rank <= 3 ? student.rank : `#${student.rank}`}
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent})`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            border: `2px solid ${colors.border}`
                          }}>
                            <StudentAvatar student={student} />
                          </div>
                          <div>
                            <div style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              color: colors.textPrimary,
                              fontFamily
                            }}>{student.displayName}</div>
                            <div style={{
                              fontSize: '11px',
                              color: colors.textMuted,
                              fontFamily
                            }}>{student.username}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px', color: colors.textSecondary, fontSize: '13px', fontFamily }}>{student.email}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          background: colors.bg,
                          color: colors.textSecondary,
                          fontFamily
                        }}>
                          Level {student.progress?.level || 1}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <span style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: currentType.color,
                          fontFamily
                        }}>{getValue(student).toLocaleString()}</span>
                        <span style={{
                          fontSize: '11px',
                          color: colors.textMuted,
                          marginLeft: '4px',
                          fontFamily
                        }}>{getUnit()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FOOTER STATS */}
          <div style={{
            marginTop: '20px',
            padding: '16px 20px',
            background: colors.bg,
            borderRadius: '14px',
            border: `1px solid ${colors.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            fontSize: '13px',
            color: colors.textSecondary,
            fontFamily
          }}>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <span>🏆 Top: {leaderboardData[0] ? getValue(leaderboardData[0]).toLocaleString() : 0} {getUnit()}</span>
              <span>📊 Average: {leaderboardData.length > 0 ? Math.round(leaderboardData.reduce((acc, s) => acc + getValue(s), 0) / leaderboardData.length).toLocaleString() : 0} {getUnit()}</span>
            </div>
            <span style={{ color: colors.accent }}>Live • Updated just now</span>
          </div>
        </>
      )}

      {/* PROFILE MODAL */}
      {showProfileModal && selectedProfile && (
        <div
          onClick={() => setShowProfileModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: colors.surface,
              borderRadius: '20px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              fontFamily
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                overflow: 'hidden',
                background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                border: `3px solid ${colors.accent}40`
              }}>
                <StudentAvatar student={selectedProfile} />
              </div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: colors.textPrimary,
                margin: '0 0 4px'
              }}>{selectedProfile.displayName}</h2>
              <p style={{
                fontSize: '14px',
                color: colors.textSecondary,
                margin: 0
              }}>{selectedProfile.email}</p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px'
            }}>
              {[
                { label: 'Words Learned', value: selectedProfile.progress?.wordsLearned || 0, color: '#2E7D32' },
                { label: 'Games Played', value: selectedProfile.progress?.gamesPlayed || 0, color: '#C44545' },
                { label: 'Streak', value: selectedProfile.progress?.streak || 0, color: '#B85C1A' },
                { label: 'Total Points', value: selectedProfile.totalPoints || selectedProfile.progress?.totalPoints || 0, color: '#5C6AC4' }
              ].map((stat, i) => (
                <div key={i} style={{
                  background: colors.bg,
                  padding: '14px',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '22px',
                    fontWeight: '700',
                    color: stat.color
                  }}>{stat.value}</div>
                  <div style={{
                    fontSize: '11px',
                    color: colors.textSecondary,
                    marginTop: '2px'
                  }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowProfileModal(false)}
              style={{
                width: '100%',
                padding: '12px',
                background: colors.accent,
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily,
                marginTop: '20px'
              }}
            >Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLeaderboards;