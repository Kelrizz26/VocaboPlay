// src/components/admin/AdminStudents.jsx
// ============================================================
// ✅ ADMIN STUDENTS - Shows only students who joined teacher's activities
// ✅ CONNECTED TO AVATAR SHOP — FACE FOCUS
// ============================================================

import React, { useState } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../pages/firebase';
import ModalWrapper from './ModalWrapper';
import ConfirmDialog from './ConfirmDialog';
import { inputStyle, labelStyle, btnPrimary, btnSecondary } from './adminStyles';
import { colors, fontFamily } from '../dashboard/dashboardStyles';
import { AVATAR_SHOP_ITEMS, DEFAULT_AVATAR_ID } from '../../data/avatarShop';

// ✅ HELPER — Kunin yung avatar image galing sa Avatar Shop
const getStudentAvatar = (student) => {
  if (!student) return AVATAR_SHOP_ITEMS[0]?.image || '';
  const avatarId = student.equippedAvatar || DEFAULT_AVATAR_ID;
  const found = AVATAR_SHOP_ITEMS.find(a => a.id === avatarId);
  return found?.image || AVATAR_SHOP_ITEMS[0]?.image || '';
};

// ✅ REUSABLE — StudentAvatar (FACE FOCUS — buong mukha kita)
const StudentAvatar = ({ student, fontSize = 14 }) => {
  const [imgError, setImgError] = useState(false);
  const avatarSrc = getStudentAvatar(student);

  if (!imgError && avatarSrc) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url(${avatarSrc})`,
          // ✅ 130% — slight zoom para kita yung mukha
          backgroundSize: '130%',
          // ✅ 20% from top — focus sa mukha, hindi sa katawan
          backgroundPosition: 'center 20%',
          backgroundRepeat: 'no-repeat',
          backgroundColor: 'transparent',
          display: 'block'
        }}
        onError={() => setImgError(true)}
        aria-label={student.displayName}
      />
    );
  }

  return (
    <span style={{ color: '#fff', fontWeight: '600', fontSize }}>
      {student.displayName?.charAt(0)?.toUpperCase() || '?'}
    </span>
  );
};

const AdminStudents = ({ students, setStudents, loading, calculateAvgScore }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelected] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editForm, setEditForm] = useState({ displayName: '', email: '' });
  const [newStudent, setNewStudent] = useState({ displayName: '', email: '', username: '' });
  const [confirmAction, setConfirmAction] = useState(null);

  // Filter students based on search term
  const filtered = students.filter(s =>
    s.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add a new student to Firestore
  const addStudent = async () => {
    if (!newStudent.displayName || !newStudent.email) return alert('Fill in all fields.');

    try {
      const newStudentData = {
        displayName: newStudent.displayName,
        username: newStudent.username || newStudent.displayName.toLowerCase().replace(/\s+/g, ''),
        email: newStudent.email,
        // ✅ BAGONG AVATAR SYSTEM
        equippedAvatar: DEFAULT_AVATAR_ID,
        ownedAvatars: AVATAR_SHOP_ITEMS.filter(a => a.price === 0).map(a => a.id),
        role: 'student',
        totalPoints: 0,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        progress: {
          level: 1,
          xp: 0,
          totalPoints: 0,
          streak: 0,
          gamesPlayed: 0,
          wordsLearned: 0,
          correctAnswers: 0,
          totalAnswers: 0,
          wordPics: { gamesPlayed: 0, gamesCompleted: 0, cardsViewed: 0, correctAnswers: 0, knownWords: [], totalScore: 0 },
          quiz: { gamesCompleted: 0, correctAnswers: 0, totalQuestions: 0, bestScore: 0 },
          match: { gamesCompleted: 0, totalPairs: 0, totalMoves: 0, bestTime: 0, bestMoves: 0, perfectGames: 0 },
          guessWhat: { gamesCompleted: 0, correctAnswers: 0, totalQuestions: 0, bestScore: 0 },
          sentenceBuilder: { gamesCompleted: 0, correctAnswers: 0, totalSentences: 0, bestScore: 0 },
          shortStory: { chaptersRead: 0, quizzesPassed: 0, storiesCompleted: 0 },
          achievements: {
            firstGame: false,
            perfectScore: false,
            threeDayStreak: false,
            tenWords: false,
            masterLearner: false,
            speedDemon: false,
            vocabularyMaster: false
          }
        },
        favorites: [],
        settings: {
          emailNotifications: true,
          darkMode: false,
          language: 'en'
        }
      };

      const docRef = await addDoc(collection(db, 'users'), newStudentData);
      setStudents([...students, {
        id: docRef.id,
        ...newStudentData,
        avgScore: 0,
        gamesPlayed: 0,
        joinDate: new Date().toISOString().split('T')[0]
      }]);
      setIsAdding(false);
      setNewStudent({ displayName: '', email: '', username: '' });
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Error adding student');
    }
  };

  // Update an existing student in Firestore
  const updateStudent = async () => {
    try {
      const studentRef = doc(db, 'users', selectedStudent.id);
      await updateDoc(studentRef, {
        displayName: editForm.displayName,
        email: editForm.email
      });

      setStudents(students.map(s =>
        s.id === selectedStudent.id
          ? { ...s, displayName: editForm.displayName, email: editForm.email }
          : s
      ));
      setIsEditing(false);
      setSelected(null);
    } catch (error) {
      console.error('Error updating student:', error);
      alert('Error updating student');
    }
  };

  // Delete a student from Firestore
  const deleteStudent = async (id) => {
    try {
      await deleteDoc(doc(db, 'users', id));
      setStudents(students.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Error deleting student');
    }
  };

  // Show confirmation dialog before deleting
  const requestDeleteStudent = (id) => {
    setConfirmAction({
      title: 'Remove Student',
      message: 'This will remove the student account. This cannot be undone.',
      confirmLabel: 'Remove',
      danger: true,
      onConfirm: () => { deleteStudent(id); setConfirmAction(null); },
    });
  };

  return (
    <div>
      {/* HEADER */}
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
          }}>Student Management</h1>
          <p style={{
            fontSize: '15px',
            color: colors.textSecondary,
            margin: 0,
            fontWeight: '300',
            fontFamily
          }}>
            Students who joined your activities
          </p>
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
          }}>Total: {students.length} Student{students.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: '12px',
        padding: '4px 4px 4px 16px',
        marginBottom: '24px',
        maxWidth: '400px'
      }}>
        <span style={{ color: colors.textSecondary, marginRight: '8px' }}>🔍</span>
        <input
          type="text"
          placeholder="Search students..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            padding: '12px 0',
            border: 'none',
            background: 'transparent',
            fontSize: '14px',
            outline: 'none',
            fontFamily,
            color: colors.textPrimary
          }}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: 'none',
              color: colors.textSecondary,
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* LOADING / EMPTY / TABLE */}
      {loading.students ? (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          color: colors.textSecondary
        }}>⏳ Loading Students...</div>
      ) : students.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px',
          background: colors.surface,
          borderRadius: '8px',
          border: `1px solid ${colors.border}`
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👨‍🎓</div>
          <h3 style={{
            fontSize: '20px',
            color: colors.textPrimary,
            marginBottom: '8px'
          }}>No Students Yet</h3>
          <p style={{
            fontSize: '14px',
            color: colors.textSecondary,
            marginBottom: '24px'
          }}>
            Students will appear here once they join your live activities.
          </p>
        </div>
      ) : (
        <div style={{
          background: colors.surface,
          borderRadius: '8px',
          boxShadow: 'none',
          overflow: 'hidden',
          border: `1px solid ${colors.border}`
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily,
              minWidth: '900px'
            }}>
              <thead style={{
                background: colors.bg,
                borderBottom: `1px solid ${colors.border}`
              }}>
                <tr>
                  {['Student','Email','Avg Score','Games','Words','Streak','Join Date','Actions'].map(h => (
                    <th key={h} style={{
                      padding: '16px 20px',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: colors.textSecondary
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(student => (
                  <tr
                    key={student.id}
                    style={{
                      borderBottom: `1px solid ${colors.border}`,
                      transition: 'all .2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = colors.bg}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* ✅ AVATAR FROM SHOP — MUKHA ANG FOCUS */}
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          overflow: 'hidden',
                          background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent})`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          border: `2px solid ${colors.border}`
                        }}>
                          <StudentAvatar student={student} fontSize={16} />
                        </div>
                        <div>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: colors.textPrimary
                          }}>{student.displayName}</div>
                          <div style={{
                            fontSize: '12px',
                            color: colors.textSecondary
                          }}>Level {student.progress?.level || 1}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{
                      padding: '16px 20px',
                      fontSize: '14px',
                      color: colors.textSecondary
                    }}>{student.email}</td>
                    <td style={{
                      padding: '16px 20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: student.avgScore >= 80 ? '#2e7d32' : '#ed6c02'
                    }}>{student.avgScore}%</td>
                    <td style={{
                      padding: '16px 20px',
                      fontSize: '14px',
                      color: colors.textSecondary
                    }}>{student.progress?.gamesPlayed || 0}</td>
                    <td style={{
                      padding: '16px 20px',
                      fontSize: '14px',
                      color: colors.textSecondary
                    }}>{student.progress?.wordsLearned || 0}</td>
                    <td style={{
                      padding: '16px 20px',
                      fontSize: '14px',
                      color: student.progress?.streak > 0 ? '#2e7d32' : colors.textSecondary
                    }}>🔥 {student.progress?.streak || 0}</td>
                    <td style={{
                      padding: '16px 20px',
                      fontSize: '13px',
                      color: colors.textSecondary
                    }}>{student.joinDate}</td>
                    <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => { setSelected(student); setEditForm({ displayName: student.displayName, email: student.email }); setIsEditing(true); }}
                        style={{
                          padding: '6px 14px',
                          background: colors.bg,
                          border: `1px solid ${colors.border}`,
                          borderRadius: '8px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          marginRight: '8px',
                          color: colors.textSecondary
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setSelected(student)}
                        style={{
                          padding: '6px 14px',
                          background: '#e8f5e9',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          marginRight: '8px',
                          color: '#2e7d32'
                        }}
                      >
                        Progress
                      </button>
                      <button
                        onClick={() => requestDeleteStudent(student.id)}
                        style={{
                          padding: '6px 14px',
                          background: '#fef2f2',
                          color: '#b91c1c',
                          border: '1px solid #fee2e2',
                          borderRadius: '8px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {isAdding && (
        <ModalWrapper onClose={() => setIsAdding(false)}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '24px',
            color: colors.textPrimary
          }}>Add New Student</h2>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Display Name *</label>
            <input
              type="text"
              value={newStudent.displayName}
              onChange={e => setNewStudent({ ...newStudent, displayName: e.target.value })}
              placeholder="e.g., John Smith"
              style={inputStyle}
              autoFocus
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Username</label>
            <input
              type="text"
              value={newStudent.username}
              onChange={e => setNewStudent({ ...newStudent, username: e.target.value })}
              placeholder="e.g., johnsmith"
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: '28px' }}>
            <label style={labelStyle}>Email Address *</label>
            <input
              type="email"
              value={newStudent.email}
              onChange={e => setNewStudent({ ...newStudent, email: e.target.value })}
              placeholder="student@example.com"
              style={inputStyle}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setIsAdding(false)} style={btnSecondary}>Cancel</button>
            <button onClick={addStudent} style={btnPrimary}>Add Student</button>
          </div>
        </ModalWrapper>
      )}

      {/* Edit Student Modal */}
      {isEditing && (
        <ModalWrapper onClose={() => setIsEditing(false)}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '24px',
            color: colors.textPrimary
          }}>Edit Student</h2>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Name</label>
            <input
              type="text"
              value={editForm.displayName}
              onChange={e => setEditForm({ ...editForm, displayName: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: '28px' }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={editForm.email}
              onChange={e => setEditForm({ ...editForm, email: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setIsEditing(false)} style={btnSecondary}>Cancel</button>
            <button onClick={updateStudent} style={btnPrimary}>Save Changes</button>
          </div>
        </ModalWrapper>
      )}

      {/* Progress Modal */}
      {selectedStudent && !isEditing && (
        <ModalWrapper onClose={() => setSelected(null)}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            {/* ✅ AVATAR FROM SHOP — MALAKI SA MODAL */}
            <div style={{
              width: '88px',
              height: '88px',
              borderRadius: '50%',
              overflow: 'hidden',
              background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              border: `3px solid ${colors.accent}40`
            }}>
              <StudentAvatar student={selectedStudent} fontSize={32} />
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: colors.textPrimary,
              marginBottom: '4px'
            }}>{selectedStudent.displayName}</h3>
            <p style={{
              fontSize: '14px',
              color: colors.textSecondary,
              margin: 0
            }}>{selectedStudent.email}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <div style={{
              background: colors.bg,
              padding: '12px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: colors.accent
              }}>{selectedStudent.progress?.level || 1}</div>
              <div style={{
                fontSize: '12px',
                color: colors.textSecondary
              }}>Level</div>
            </div>
            <div style={{
              background: colors.bg,
              padding: '12px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: colors.accent
              }}>{selectedStudent.progress?.xp || 0}</div>
              <div style={{
                fontSize: '12px',
                color: colors.textSecondary
              }}>XP Points</div>
            </div>
            <div style={{
              background: colors.bg,
              padding: '12px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: colors.accent
              }}>{selectedStudent.progress?.streak || 0}</div>
              <div style={{
                fontSize: '12px',
                color: colors.textSecondary
              }}>Day Streak 🔥</div>
            </div>
            <div style={{
              background: colors.bg,
              padding: '12px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: colors.accent
              }}>{selectedStudent.avgScore || 0}%</div>
              <div style={{
                fontSize: '12px',
                color: colors.textSecondary
              }}>Avg Score</div>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: colors.textPrimary,
              marginBottom: '12px'
            }}>Games Progress</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: colors.bg, borderRadius: '8px' }}>
                <span style={{ fontSize: '13px', color: colors.textPrimary }}>🎮 Word Pics</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: colors.textPrimary }}>{selectedStudent.progress?.wordPics?.gamesPlayed || 0} plays</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: colors.bg, borderRadius: '8px' }}>
                <span style={{ fontSize: '13px', color: colors.textPrimary }}>🎯 Match Game</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: colors.textPrimary }}>{selectedStudent.progress?.match?.gamesCompleted || 0} completed</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: colors.bg, borderRadius: '8px' }}>
                <span style={{ fontSize: '13px', color: colors.textPrimary }}>❓ Quiz Master</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: colors.textPrimary }}>{selectedStudent.progress?.quiz?.gamesCompleted || 0} completed</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: colors.bg, borderRadius: '8px' }}>
                <span style={{ fontSize: '13px', color: colors.textPrimary }}>🤔 GuessWhat</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: colors.textPrimary }}>{selectedStudent.progress?.guessWhat?.gamesCompleted || 0} completed</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: colors.bg, borderRadius: '8px' }}>
                <span style={{ fontSize: '13px', color: colors.textPrimary }}>📝 Sentence Builder</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: colors.textPrimary }}>{selectedStudent.progress?.sentenceBuilder?.gamesCompleted || 0} completed</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: colors.bg, borderRadius: '8px' }}>
                <span style={{ fontSize: '13px', color: colors.textPrimary }}>📖 Short Story</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: colors.textPrimary }}>{selectedStudent.progress?.shortStory?.storiesCompleted || 0} stories</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setSelected(null)}
            style={{
              width: '100%',
              padding: '12px',
              background: colors.accent,
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
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

export default AdminStudents;