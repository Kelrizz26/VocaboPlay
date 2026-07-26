import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../pages/firebase';
import Leaderboards from './Leaderboards';

import {
  collection,
  getDocs,
  addDoc,
  doc,
} from 'firebase/firestore';

// Import admin components
import AdminSidebar from './admin/AdminSidebar';
import AdminTopBar from './admin/AdminTopbar';
import AdminOverview from './admin/AdminOverview';
import AdminStudents from './admin/AdminStudents';
import AdminGames from './admin/AdminGames';
import AdminWords from './admin/AdminWords';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('Overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ========== REAL DATA FROM FIREBASE ==========
  const [students, setStudents] = useState([]);
  const [games, setGames] = useState([]);
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState({
    students: true,
    games: true,
    words: true
  });

  // Helper functions
  const calculateAvgScore = (progress) => {
    if (!progress || !progress.totalAnswers || progress.totalAnswers === 0) return 0;
    return Math.round((progress.correctAnswers / progress.totalAnswers) * 100);
  };

  // ========== FETCH ALL DATA FROM FIREBASE ==========
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      // Fetch students from 'users' collection
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const studentsData = usersSnapshot.docs
        .map(doc => {
          const data = doc.data();
          if (data.role === 'student') {
            return {
              id: doc.id,
              ...data,
              displayName: data.displayName || data.email?.split('@')[0] || 'Unknown',
              avgScore: calculateAvgScore(data.progress),
              gamesPlayed: data.progress?.gamesPlayed || 0,
              joinDate: data.createdAt ? new Date(data.createdAt).toISOString().split('T')[0] : 'Unknown',
              lastActive: data.lastActive || null,
              progress: data.progress || {}
            };
          }
          return null;
        })
        .filter(student => student !== null);
      
      setStudents(studentsData);
      setLoading(prev => ({ ...prev, students: false }));

      // Fetch words from 'words' collection
      const wordsSnapshot = await getDocs(collection(db, 'words'));
      const wordsData = wordsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setWords(wordsData);
      setLoading(prev => ({ ...prev, words: false }));

      // Initialize games
      await initializeGames();

    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading({
        students: false,
        games: false,
        words: false
      });
    }
  };

  const initializeGames = async () => {
    try {
      const gamesSnapshot = await getDocs(collection(db, 'games'));
      
      if (gamesSnapshot.empty) {
        const defaultGames = [
          { id: 'wordpics', name: 'Word Pics', icon: '🖼️', description: 'Guess the word from the picture! Fun and visual vocabulary learning.', totalWords: 30, timesPlayed: 0, avgScore: 0, color: '#7c6fd6', iconBg: '#F3F1F9', accentColor: '#7c6fd6', category: 'vocab', difficulty: 'beginner', timeEstimate: '5-10 min', lastUpdated: new Date().toISOString() },
          { id: 'match', name: 'Match Game', icon: '🎯', description: 'Connect words with definitions in this fast-paced memory challenge.', totalPairs: 6, timesPlayed: 0, avgScore: 0, color: '#B83B5E', iconBg: '#FDF1F4', accentColor: '#B83B5E', category: 'vocab', difficulty: 'beginner', timeEstimate: '3-5 min', lastUpdated: new Date().toISOString() },
          { id: 'short-story', name: 'Short Story', icon: '📖', description: 'Immerse yourself in narratives while learning vocabulary in context.', totalStories: 5, timesPlayed: 0, avgScore: 0, color: '#2F5D62', iconBg: '#EEF3F3', accentColor: '#2F5D62', category: 'reading', difficulty: 'intermediate', timeEstimate: '15-20 min', lastUpdated: new Date().toISOString() },
          { id: 'quiz', name: 'Quiz Master', icon: '❓', description: 'Test your knowledge with adaptive multiple choice questions.', totalQuestions: 10, timesPlayed: 0, avgScore: 0, color: '#1F4E5F', iconBg: '#E8EDF0', accentColor: '#1F4E5F', category: 'challenge', difficulty: 'intermediate', timeEstimate: '10-15 min', lastUpdated: new Date().toISOString() },
          { id: 'guesswhat', name: 'GuessWhat', icon: '🤔', description: 'Deduce the correct word from visual context clues and sentences.', totalQuestions: 10, timesPlayed: 0, avgScore: 0, color: '#C44545', iconBg: '#FCEEEE', accentColor: '#C44545', category: 'challenge', difficulty: 'advanced', timeEstimate: '8-12 min', lastUpdated: new Date().toISOString() },
          { id: 'sentence-builder', name: 'Sentence Builder', icon: '📝', description: 'Construct grammatically correct sentences using vocabulary in context.', totalSentences: 5, timesPlayed: 0, avgScore: 0, color: '#3A6B6B', iconBg: '#EDF3F3', accentColor: '#3A6B6B', category: 'vocab', difficulty: 'beginner', timeEstimate: '6-10 min', lastUpdated: new Date().toISOString() }
        ];

        for (const game of defaultGames) {
          await addDoc(collection(db, 'games'), game);
        }
        setGames(defaultGames);
      } else {
        const gamesData = gamesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setGames(gamesData);
      }
    } catch (error) {
      console.error('Error initializing games:', error);
    } finally {
      setLoading(prev => ({ ...prev, games: false }));
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('userType');
      localStorage.removeItem('userId');
      localStorage.removeItem('token');
      localStorage.removeItem('userProfile');
      localStorage.removeItem('vocaboplay_progress');
      
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
    }
  };

  // Render different views based on activeMenu
  const renderContent = () => {
    switch (activeMenu) {
      case 'Overview':
        return <AdminOverview students={students} games={games} words={words} setActiveMenu={setActiveMenu} />;
      case 'Students':
        return <AdminStudents students={students} setStudents={setStudents} loading={loading} calculateAvgScore={calculateAvgScore} />;
      case 'Games':
        return <AdminGames games={games} setGames={setGames} loading={loading} />;
      case 'Words':
        return <AdminWords words={words} setWords={setWords} loading={loading} />;
      case 'Leaderboards':
        return <Leaderboards onBack={() => setActiveMenu('Overview')} isAdmin={true} />;
      default:
        return <AdminOverview students={students} games={games} words={words} setActiveMenu={setActiveMenu} />;
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Poppins', sans-serif; background: var(--color-bg); }
        
        .admin-hamburger {
          display: none;
          position: fixed;
          top: 12px;
          left: 12px;
          z-index: 1001;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 20px;
          cursor: pointer;
          color: var(--color-text-primary);
        }
        
        .admin-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.4);
          z-index: 998;
        }
        
        .admin-overlay.active {
          display: block;
        }
        
        /* MOBILE */
        @media (max-width: 768px) {
          .admin-hamburger {
            display: block !important;
          }
          
          .admin-sidebar {
            position: fixed !important;
            top: 0 !important;
            left: -280px !important;
            width: 280px !important;
            height: 100vh !important;
            z-index: 1000 !important;
            transition: left 0.3s ease !important;
          }
          
          .admin-sidebar.open {
            left: 0 !important;
          }
          
          .admin-main-content {
            margin-left: 0 !important;
            padding: 16px !important;
            padding-top: 70px !important;
          }
          
          .admin-topbar-wrapper {
            margin-bottom: 20px !important;
          }
          
          .admin-content-wrapper {
            padding: 0 !important;
          }
        }
        
        /* DESKTOP - WALANG BINAGO, LAGING VISIBLE ANG SIDEBAR */
        @media (min-width: 769px) {
          .admin-hamburger {
            display: none !important;
          }
          .admin-sidebar {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 260px !important;
            height: 100vh !important;
            z-index: 1000 !important;
          }
          .admin-main-content {
            margin-left: 260px !important;
            padding: 24px 32px !important;
          }
          .admin-overlay {
            display: none !important;
          }
        }
        
        @media (max-width: 480px) {
          .admin-main-content {
            padding: 12px !important;
            padding-top: 65px !important;
          }
          .admin-hamburger {
            top: 10px !important;
            left: 10px !important;
            padding: 6px 10px !important;
            font-size: 18px !important;
          }
          .admin-sidebar {
            width: 260px !important;
            left: -260px !important;
          }
        }
      `}</style>

      {/* OVERLAY */}
      <div 
        className={`admin-overlay ${isSidebarOpen ? 'active' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>

     
      <button 
        className="admin-hamburger"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? '✕' : '☰'}
      </button>

      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)', fontFamily: "'Poppins', sans-serif" }}>
        
      
        <div className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <AdminSidebar 
            activeMenu={activeMenu} 
            setActiveMenu={(menu) => {
              setActiveMenu(menu);
              if (window.innerWidth <= 768) setIsSidebarOpen(false);
            }} 
            handleLogout={handleLogout} 
          />
        </div>

        {/* MAIN CONTENT */}
        <div className="admin-main-content" style={{ 
          flex: 1, 
          padding: '24px 32px', 
          overflowY: 'auto', 
          fontFamily: "'Poppins', sans-serif",
          transition: 'margin-left 0.3s ease',
        }}>
          
          {/* Top Bar */}
          <div className="admin-topbar-wrapper" style={{ marginLeft: '0' }}>
            <AdminTopBar handleLogout={handleLogout} />
          </div>

          {/* Views */}
          <div className="admin-content-wrapper">
            {renderContent()}
          </div>
          
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;