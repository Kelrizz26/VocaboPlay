import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from "./firebase";
import { 
  GoogleAuthProvider, 
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1950 + 1 }, (_, i) => CURRENT_YEAR - i);

const Signup = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Multi-step flow: 'welcome' -> 'age' -> 'auth' -> 'username'
  const [step, setStep] = useState('welcome');

  // Step 1: age verification
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [outsidePH, setOutsidePH] = useState(false);

  // Step 2/3: Google auth + username
  const [tempUserData, setTempUserData] = useState(null);
  const [username, setUsername] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleAgeNext = () => {
    if (!birthMonth || !birthYear) {
      setError('Please select your birth month and year');
      return;
    }
    setError('');
    setStep('auth');
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        setError('This Google account is already registered. Please log in instead.');
        await signOut(auth);
        setLoading(false);
        return;
      }

      setTempUserData({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified
      });
      setStep('username');
      setLoading(false);
      
    } catch (error) {
      console.error('Google Sign Up Error:', error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign up cancelled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        setError('⚠️ Popup was blocked. Please allow popups for this site.');
      } else {
        setError('Failed to sign up with Google. Please try again.');
      }
      setLoading(false);
    }
  };

  const completeSignUp = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    if (!agreeTerms) {
      setError('Please agree to the Privacy Policy & Terms of Service');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = tempUserData;
      
      const userProgress = {
        level: 1,
        xp: 0,
        totalPoints: 0,
        streak: 0,
        gamesPlayed: 0,
        wordsLearned: 0,
        correctAnswers: 0,
        totalAnswers: 0,
        flashcards: { cardsViewed: 0, knownWords: [], masteredWords: [], sessionsCompleted: 0 },
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
      };

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: username,
        username: username,
        role: 'student',
        avatar: user.photoURL || '👤',
        emailVerified: true,
        googleAccount: true,
        birthMonth,
        birthYear,
        outsidePH,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        progress: userProgress,
        favorites: [],
        settings: {
          emailNotifications: true,
          darkMode: false,
          language: 'en'
        }
      });

      localStorage.setItem('userId', user.uid);
      localStorage.setItem('userDisplayName', username);
      localStorage.setItem('username', username);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('vocaboplay_progress', JSON.stringify(userProgress));
      
      const userProfile = {
        uid: user.uid,
        displayName: username,
        username: username,
        email: user.email,
        avatar: user.photoURL || '👤',
        role: 'student',
        emailVerified: true,
        googleAccount: true,
        progress: userProgress,
        settings: {
          emailNotifications: true,
          darkMode: false,
          language: 'en'
        }
      };
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
      localStorage.setItem('token', await auth.currentUser.getIdToken());
      localStorage.setItem('userType', 'student');
      
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Complete Sign Up Error:', error);
      setError('Failed to complete sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const goBackToAge = () => {
    setStep('age');
    setError('');
  };

  const goBackToAuth = () => {
    setStep('auth');
    setError('');
    setTempUserData(null);
    signOut(auth);
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Poppins', sans-serif !important;
            background: #f5f3f8;
            overflow-x: hidden;
          }
          
          .hamburger {
            display: none;
            background: none;
            border: none;
            font-size: 28px;
            cursor: pointer;
            color: #333;
            padding: 8px;
            z-index: 1001;
            transition: all 0.3s ease;
          }
          
          .hamburger:hover {
            transform: scale(1.1);
          }
          
          .overlay {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            z-index: 999;
            backdrop-filter: blur(4px);
          }
          
          .overlay.active {
            display: block;
          }
          
          .nav-mobile {
            display: none !important;
          }
          
          @keyframes float {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
            100% { transform: translateY(0px) rotate(0deg); }
          }
          
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          /* --- Mascot stage animations (Blooket-style) --- */
          @keyframes mascotBounce {
            0%, 100% { transform: translateY(0) scaleY(1); }
            45% { transform: translateY(-22px) scaleY(1.02); }
            50% { transform: translateY(-24px) scaleY(1.04); }
            55% { transform: translateY(-22px) scaleY(1.02); }
          }

          @keyframes mascotSquash {
            0%, 40%, 60%, 100% { transform: scale(1, 1); }
            48% { transform: scale(1.08, 0.9); }
            52% { transform: scale(1.08, 0.9); }
          }

          @keyframes earWiggle {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(-6deg); }
          }

          @keyframes blink {
            0%, 92%, 100% { transform: scaleY(1); }
            96% { transform: scaleY(0.1); }
          }

          @keyframes platformGlow {
            0%, 100% { opacity: 0.55; transform: translateX(-50%) scale(1); }
            50% { opacity: 0.85; transform: translateX(-50%) scale(1.08); }
          }

          @keyframes confettiDrift {
            0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0.9; }
            50% { transform: translateY(-18px) translateX(6px) rotate(180deg); opacity: 1; }
            100% { transform: translateY(0) translateX(0) rotate(360deg); opacity: 0.9; }
          }

          @keyframes twinkle {
            0%, 100% { opacity: 0.25; transform: scale(0.85); }
            50% { opacity: 0.9; transform: scale(1.15); }
          }

          @keyframes bgDrift {
            0% { background-position: 0 0; }
            100% { background-position: 120px 120px; }
          }

          .mascot-stage {
            animation: mascotBounce 3.2s ease-in-out infinite;
          }

          .mascot-squash {
            animation: mascotSquash 3.2s ease-in-out infinite;
            transform-origin: bottom center;
          }

          .mascot-ear-left {
            animation: earWiggle 3.2s ease-in-out infinite;
            transform-origin: 70% 20%;
          }

          .mascot-ear-right {
            animation: earWiggle 3.2s ease-in-out infinite 0.15s;
            transform-origin: 30% 20%;
          }

          .mascot-eyes {
            animation: blink 4.5s ease-in-out infinite;
            transform-origin: center;
          }

          .platform-glow {
            animation: platformGlow 3.2s ease-in-out infinite;
          }

          .confetti-dot {
            position: absolute;
            border-radius: 3px;
            animation: confettiDrift 3.6s ease-in-out infinite;
          }

          .bg-sparkle {
            position: absolute;
            border-radius: 50%;
            background: rgba(255,255,255,0.9);
            animation: twinkle 2.6s ease-in-out infinite;
          }

          .bg-pattern {
            position: absolute;
            inset: 0;
            opacity: 0.08;
            background-image:
              linear-gradient(rgba(255,255,255,0.6) 2px, transparent 2px),
              linear-gradient(90deg, rgba(255,255,255,0.6) 2px, transparent 2px);
            background-size: 60px 60px;
            animation: bgDrift 12s linear infinite;
          }
          
          .animate-slide-up {
            animation: slideUp 0.6s ease-out forwards;
          }
          
          .animate-fade-in {
            animation: fadeIn 0.8s ease-out forwards;
          }
          
          /* Mobile Styles */
          @media (max-width: 768px) {
            .hamburger {
              display: block;
            }
            
            .nav-desktop {
              display: none !important;
            }
            
            .nav-mobile {
              display: flex !important;
              flex-direction: column;
              position: fixed;
              top: 0;
              right: -100%;
              width: 280px;
              height: 100vh;
              background: white;
              padding: 80px 30px 30px;
              box-shadow: -10px 0 30px rgba(0,0,0,0.1);
              transition: right 0.3s ease;
              z-index: 1000;
              overflow-y: auto;
            }
            
            .nav-mobile.open {
              right: 0;
            }
            
            .nav-mobile .mobile-nav-link {
              padding: 15px 0;
              font-size: 16px !important;
              border-bottom: 1px solid #f0f0f0;
              background: none;
              border: none;
              cursor: pointer;
              font-family: 'Poppins', sans-serif;
              color: #333;
              text-align: left;
              width: 100%;
              transition: color 0.3s ease;
            }
            
            .nav-mobile .mobile-nav-link:hover {
              color: #7c6fd6;
            }
            
            .nav-mobile .login-btn {
              margin-top: 20px;
              text-align: center !important;
              justify-content: center !important;
              background: linear-gradient(135deg, #7c6fd6 0%, #9b8de8 100%) !important;
              color: white !important;
              border: none !important;
              padding: 14px !important;
              border-radius: 30px !important;
              font-weight: 600 !important;
              width: 100%;
              font-size: 16px !important;
              font-family: 'Poppins', sans-serif !important;
              cursor: pointer;
              transition: transform 0.3s ease, box-shadow 0.3s ease;
            }
            
            .nav-mobile .login-btn:active {
              transform: scale(0.95);
            }
            
            .split-container {
              flex-direction: column !important;
              padding-top: 70px !important;
            }
            
            .left-side {
              width: 100% !important;
              padding: 30px 20px !important;
              min-height: 100vh !important;
            }
            
            .right-side {
              display: none !important;
            }
            
            .card-wrapper {
              max-width: 100% !important;
              padding: 0 !important;
            }
            
            .title {
              font-size: 26px !important;
            }
            
            .subtitle {
              font-size: 13px !important;
              margin-bottom: 24px !important;
            }
            
            .google-btn, .signup-btn, .cancel-btn {
              padding: 12px 20px !important;
              font-size: 14px !important;
            }
            
            .input, .select {
              padding: 10px 14px !important;
              font-size: 13px !important;
            }
            
            .label {
              font-size: 12px !important;
            }
            
            .error-message {
              font-size: 12px !important;
              padding: 10px 12px !important;
            }
            
            .signup-text {
              font-size: 13px !important;
            }
            
            .divider-text {
              font-size: 11px !important;
            }
          }
          
          /* Tablet Styles */
          @media (min-width: 769px) and (max-width: 1024px) {
            .left-side {
              padding: 40px 30px !important;
            }
            
            .card-wrapper {
              max-width: 360px !important;
            }
            
            .title {
              font-size: 28px !important;
            }
            
            .right-side {
              padding: 30px !important;
            }
            
            .illustration-title {
              font-size: 22px !important;
            }
            
            .illustration-subtitle {
              font-size: 14px !important;
            }

            .mascot-svg-wrap {
              width: 180px !important;
            }
          }
          
          @media (min-width: 769px) {
            .nav-mobile {
              display: none !important;
            }
            .nav-desktop {
              display: flex !important;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .mascot-stage, .mascot-squash, .mascot-ear-left, .mascot-ear-right,
            .mascot-eyes, .platform-glow, .confetti-dot, .bg-sparkle, .bg-pattern {
              animation: none !important;
            }
          }
        `}
      </style>

      {/* Mobile Overlay */}
      <div 
        className={`overlay ${isMenuOpen ? 'active' : ''}`}
        onClick={() => setIsMenuOpen(false)}
      ></div>

      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(245, 243, 248, 0.95)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.05)',
        zIndex: 1000,
        padding: '15px 30px',
        transition: 'all 0.3s ease',
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div 
            onClick={() => navigate('/')}
            style={{
              background: 'linear-gradient(135deg, #7c6fd6 0%, #9b8de8 100%)',
              color: 'white',
              padding: '8px 20px',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '18px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(124, 111, 214, 0.3)',
              transition: 'all 0.3s ease',
              userSelect: 'none',
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: '800', fontSize: '22px' }}>
              VocaboPlay
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="nav-desktop" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '20px'
          }}>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: 'linear-gradient(135deg, #7c6fd6 0%, #9b8de8 100%)',
                color: 'white',
                border: 'none',
                padding: '10px 28px',
                borderRadius: '30px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(124, 111, 214, 0.3)',
                fontFamily: "'Poppins', sans-serif",
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(124, 111, 214, 0.4)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(124, 111, 214, 0.3)';
              }}
            >
              Log in
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button 
            className="hamburger"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>

          {/* Mobile Nav */}
          <div className={`nav-mobile ${isMenuOpen ? 'open' : ''}`}>
            <button
              className="mobile-nav-link"
              onClick={() => {
                navigate('/');
                setIsMenuOpen(false);
              }}
            >
              🏠 Home
            </button>
            <button
              className="mobile-nav-link"
              onClick={() => {
                navigate('/login');
                setIsMenuOpen(false);
              }}
            >
              🔑 Log in
            </button>
            <button
              className="login-btn"
              onClick={() => {
                navigate('/login');
                setIsMenuOpen(false);
              }}
            >
              Log in
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content - Split Screen */}
      <div style={styles.splitContainer}>
        {/* LEFT SIDE - Signup Form */}
        <div style={styles.leftSide}>
          <div style={styles.cardWrapper} className="animate-slide-up">

            {/* ---------- STEP 0: WELCOME ---------- */}
            {step === 'welcome' && (
              <>
                <div style={styles.badge}>
                  <span style={styles.badgeText}>🚀 Get Started</span>
                </div>

                <h1 style={styles.title}>Create your student account</h1>
                <p style={styles.subtitle}>
                  Join VocaboPlay and start leveling up your vocabulary through fun,
                  interactive games — it only takes a minute.
                </p>

                <button
                  onClick={() => setStep('age')}
                  style={styles.signupBtn}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(124, 111, 214, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(124, 111, 214, 0.2)';
                  }}
                >
                  Get Started
                </button>

                <p style={styles.signupText}>
                  Already have an account?{' '}
                  <a
                    onClick={() => navigate('/login')}
                    style={styles.loginLink}
                    onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                  >
                    Log in
                  </a>
                </p>
              </>
            )}

            {/* ---------- STEP 1: AGE VERIFICATION ---------- */}
            {step === 'age' && (
              <>
                <button
                  onClick={() => { setStep('welcome'); setError(''); }}
                  style={styles.backBtn}
                  onMouseOver={(e) => e.currentTarget.style.color = '#7c6fd6'}
                  onMouseOut={(e) => e.currentTarget.style.color = '#888'}
                >
                  ← Back
                </button>
                <h1 style={styles.title}>Age verification</h1>
                <p style={styles.subtitle}>Enter the month and year of your birth</p>

                {error && <div style={styles.errorMessage}>{error}</div>}

                <div style={styles.ageRow}>
                  <select
                    value={birthMonth}
                    onChange={(e) => setBirthMonth(e.target.value)}
                    style={styles.select}
                  >
                    <option value="">Month</option>
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>

                  <span style={styles.ageSlash}>/</span>

                  <select
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    style={styles.select}
                  >
                    <option value="">Year</option>
                    {YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <label style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={outsidePH}
                    onChange={(e) => setOutsidePH(e.target.checked)}
                    style={styles.checkbox}
                  />
                  <span>I live outside the Philippines.</span>
                </label>

                <button
                  onClick={handleAgeNext}
                  style={styles.signupBtn}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(124, 111, 214, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(124, 111, 214, 0.2)';
                  }}
                >
                  Next
                </button>

                <p style={styles.signupText}>
                  Already have an account?{' '}
                  <a
                    onClick={() => navigate('/login')}
                    style={styles.loginLink}
                    onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                  >
                    Log in
                  </a>
                </p>
              </>
            )}

            {/* ---------- STEP 2: CHOOSE AUTH METHOD ---------- */}
            {step === 'auth' && (
              <>
                <button
                  onClick={goBackToAge}
                  style={styles.backBtn}
                  onMouseOver={(e) => e.currentTarget.style.color = '#7c6fd6'}
                  onMouseOut={(e) => e.currentTarget.style.color = '#888'}
                >
                  ← Back
                </button>

                <h1 style={styles.title}>Choose an authentication method</h1>

                {error && <div style={styles.errorMessage}>{error}</div>}

                <div style={styles.signupContainer}>
                  <button
                    onClick={handleGoogleSignUp}
                    style={{
                      ...styles.googleBtn,
                      opacity: loading ? 0.7 : 1,
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                    disabled={loading}
                    onMouseOver={(e) => {
                      if (!loading) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                        e.currentTarget.style.borderColor = '#7c6fd6';
                      }
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
                      e.currentTarget.style.borderColor = '#dadce0';
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 48 48" style={{ marginRight: '12px' }}>
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                    {loading ? 'Signing up...' : 'Google'}
                  </button>

                  <p style={styles.captchaText}>This site is protected by reCAPTCHA.</p>
                </div>
              </>
            )}

            {/* ---------- STEP 3: USERNAME / LAST STEP ---------- */}
            {step === 'username' && (
              <>
                <button
                  onClick={goBackToAuth}
                  style={styles.backBtn}
                  onMouseOver={(e) => e.currentTarget.style.color = '#7c6fd6'}
                  onMouseOut={(e) => e.currentTarget.style.color = '#888'}
                >
                  ← Back
                </button>

                <h1 style={styles.title}>Last step!</h1>

                {error && <div style={styles.errorMessage}>{error}</div>}

                <div style={styles.usernameContainer}>
                  <div style={styles.googleUserInfo}>
                    {tempUserData?.photoURL ? (
                      <img src={tempUserData.photoURL} alt="Profile" style={styles.profileImg} />
                    ) : (
                      <div style={styles.googleAvatar}>👤</div>
                    )}
                    <div>
                      <p style={styles.emailText}>{tempUserData?.email}</p>
                      <p style={styles.verifiedBadge}>✅ Verified Google Account</p>
                    </div>
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Enter a username</label>
                    <input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      style={styles.input}
                      required
                      disabled={loading}
                    />
                  </div>

                  <label style={styles.checkboxRow}>
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      style={styles.checkbox}
                    />
                    <span>
                      I agree to VocaboPlay's{' '}
                      <a style={styles.inlineLink} onClick={() => navigate('/privacy')}>Privacy Policy</a>
                      {' '}&{' '}
                      <a style={styles.inlineLink} onClick={() => navigate('/terms')}>Terms of Service</a>.
                    </span>
                  </label>

                  <button
                    onClick={completeSignUp}
                    style={{
                      ...styles.signupBtn,
                      opacity: loading ? 0.7 : 1,
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                    disabled={loading}
                    onMouseOver={(e) => {
                      if (!loading) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(124, 111, 214, 0.4)';
                      }
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {loading ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>

        {/* RIGHT SIDE - Blooket-style animated mascot illustration */}
        <div style={styles.rightSide} className="animate-fade-in">
          {/* subtle tiled background pattern */}
          <div className="bg-pattern"></div>

          {/* twinkling background sparkles */}
          <span className="bg-sparkle" style={{ width: 6, height: 6, top: '14%', left: '18%', animationDelay: '0s' }}></span>
          <span className="bg-sparkle" style={{ width: 4, height: 4, top: '22%', right: '20%', animationDelay: '0.6s' }}></span>
          <span className="bg-sparkle" style={{ width: 5, height: 5, top: '68%', left: '12%', animationDelay: '1.1s' }}></span>
          <span className="bg-sparkle" style={{ width: 7, height: 7, top: '76%', right: '16%', animationDelay: '1.6s' }}></span>
          <span className="bg-sparkle" style={{ width: 4, height: 4, top: '40%', left: '8%', animationDelay: '0.3s' }}></span>
          <span className="bg-sparkle" style={{ width: 5, height: 5, top: '10%', right: '10%', animationDelay: '2s' }}></span>

          {/* confetti pieces near the mascot */}
          <span className="confetti-dot" style={{ width: 10, height: 10, background: '#ff6b6b', top: '20%', left: '30%', animationDelay: '0s' }}></span>
          <span className="confetti-dot" style={{ width: 8, height: 8, background: '#4ecdc4', top: '18%', right: '28%', animationDelay: '0.4s' }}></span>
          <span className="confetti-dot" style={{ width: 9, height: 9, background: '#ffd93d', top: '30%', right: '18%', animationDelay: '0.8s', borderRadius: '50%' }}></span>
          <span className="confetti-dot" style={{ width: 7, height: 7, background: '#a685e2', top: '26%', left: '20%', animationDelay: '1.2s', borderRadius: '50%' }}></span>
          <span className="confetti-dot" style={{ width: 9, height: 9, background: '#ff9f43', top: '34%', left: '38%', animationDelay: '0.6s' }}></span>

          <div style={styles.illustrationContainer}>
            {/* Mascot on platform */}
            <div style={styles.mascotStageWrap}>
              <div className="mascot-stage mascot-svg-wrap" style={styles.mascotSvgWrap}>
                <div className="mascot-squash">
                  <svg viewBox="0 0 200 200" width="100%" height="100%">
                    {/* horns */}
                    <path d="M75 55 C 68 30, 60 20, 55 25 C 58 40, 65 52, 75 62 Z" fill="#5b4fa8" />
                    <path d="M125 55 C 132 30, 140 20, 145 25 C 142 40, 135 52, 125 62 Z" fill="#5b4fa8" />

                    {/* ears */}
                    <g className="mascot-ear-left">
                      <ellipse cx="62" cy="78" rx="14" ry="20" fill="#c9c3ee" />
                      <ellipse cx="62" cy="78" rx="7" ry="12" fill="#e9d9e6" />
                    </g>
                    <g className="mascot-ear-right">
                      <ellipse cx="138" cy="78" rx="14" ry="20" fill="#c9c3ee" />
                      <ellipse cx="138" cy="78" rx="7" ry="12" fill="#e9d9e6" />
                    </g>

                    {/* body */}
                    <ellipse cx="100" cy="150" rx="48" ry="34" fill="#c3bdf0" />
                    {/* front legs */}
                    <rect x="70" y="165" width="14" height="22" rx="7" fill="#a89ce6" />
                    <rect x="116" y="165" width="14" height="22" rx="7" fill="#a89ce6" />

                    {/* head */}
                    <ellipse cx="100" cy="95" rx="42" ry="38" fill="#d6d1f6" />

                    {/* snout */}
                    <ellipse cx="100" cy="112" rx="18" ry="12" fill="#eae5fb" />

                    {/* eyes */}
                    <g className="mascot-eyes">
                      <circle cx="84" cy="92" r="9" fill="#2b2b3d" />
                      <circle cx="116" cy="92" r="9" fill="#2b2b3d" />
                      <circle cx="87" cy="89" r="2.5" fill="white" />
                      <circle cx="119" cy="89" r="2.5" fill="white" />
                    </g>

                    {/* blush */}
                    <ellipse cx="74" cy="104" rx="6" ry="4" fill="#f2b3c9" opacity="0.7" />
                    <ellipse cx="126" cy="104" rx="6" ry="4" fill="#f2b3c9" opacity="0.7" />

                    {/* mouth */}
                    <path d="M92 116 Q100 121 108 116" stroke="#8b7fc7" strokeWidth="2.5" fill="none" strokeLinecap="round" />

                    {/* nostrils */}
                    <circle cx="95" cy="110" r="1.4" fill="#8b7fc7" />
                    <circle cx="105" cy="110" r="1.4" fill="#8b7fc7" />
                  </svg>
                </div>
              </div>

              {/* platform / shelf like Blooket */}
              <div style={styles.platformWrap}>
                <div className="platform-glow" style={styles.platformGlow}></div>
                <div style={styles.platform}></div>
              </div>
            </div>

            <h2 style={styles.illustrationTitle}>Level up your vocabulary,</h2>
            <p style={styles.illustrationSubtitle}>one word at a time.</p>
          </div>
        </div>
      </div>
    </>
  );
};

const styles = {
  splitContainer: {
    display: 'flex',
    minHeight: '100vh',
    paddingTop: '80px',
    background: '#f5f3f8',
    overflow: 'hidden',
  },
  leftSide: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 60px',
    background: '#f5f3f8',
    minHeight: 'calc(100vh - 80px)',
  },
  cardWrapper: {
    width: '100%',
    maxWidth: '420px',
  },
  badge: {
    display: 'inline-block',
    background: 'linear-gradient(135deg, #7c6fd6 0%, #9b8de8 100%)',
    color: 'white',
    padding: '4px 16px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '16px',
    letterSpacing: '0.5px',
    fontFamily: "'Poppins', sans-serif",
  },
  badgeText: {
    fontFamily: "'Poppins', sans-serif",
  },
  title: {
    fontSize: '30px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 8px 0',
    fontFamily: "'Poppins', sans-serif",
    lineHeight: '1.2',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    margin: '0 0 28px 0',
    lineHeight: '1.4',
    fontFamily: "'Poppins', sans-serif",
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#888',
    fontSize: '13px',
    fontWeight: '600',
    fontFamily: "'Poppins', sans-serif",
    cursor: 'pointer',
    padding: '0',
    marginBottom: '18px',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'color 0.2s ease',
  },
  errorMessage: {
    padding: '12px 14px',
    backgroundColor: '#fee',
    border: '1px solid #fcc',
    borderRadius: '8px',
    color: '#c33',
    fontSize: '13px',
    marginBottom: '16px',
    fontFamily: "'Poppins', sans-serif",
  },
  ageRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '18px',
  },
  select: {
    flex: 1,
    padding: '12px 14px',
    border: '1px solid #d0d0d0',
    borderRadius: '10px',
    fontSize: '14px',
    fontFamily: "'Poppins', sans-serif",
    backgroundColor: 'white',
    color: '#333',
    outline: 'none',
    cursor: 'pointer',
  },
  ageSlash: {
    color: '#999',
    fontSize: '16px',
    fontWeight: '600',
  },
  checkboxRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    fontSize: '13px',
    color: '#555',
    fontFamily: "'Poppins', sans-serif",
    marginBottom: '24px',
    lineHeight: '1.5',
    cursor: 'pointer',
  },
  checkbox: {
    marginTop: '2px',
    width: '16px',
    height: '16px',
    accentColor: '#7c6fd6',
    cursor: 'pointer',
    flexShrink: 0,
  },
  inlineLink: {
    color: '#7c6fd6',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#333',
    margin: '0',
    fontFamily: "'Poppins', sans-serif",
  },
  input: {
    padding: '12px 16px',
    border: '1px solid #d0d0d0',
    borderRadius: '10px',
    fontSize: '14px',
    fontFamily: "'Poppins', sans-serif",
    width: '100%',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
    backgroundColor: 'white',
    color: '#333',
    outline: 'none',
  },
  signupBtn: {
    padding: '14px 28px',
    backgroundColor: '#7c6fd6',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    fontFamily: "'Poppins', sans-serif",
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    width: '100%',
    boxShadow: '0 4px 15px rgba(124, 111, 214, 0.2)',
  },
  googleBtn: {
    padding: '14px 28px',
    backgroundColor: 'white',
    color: '#333',
    border: '1px solid #dadce0',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '500',
    fontFamily: "'Poppins', sans-serif",
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  signupContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  captchaText: {
    fontSize: '12px',
    color: '#999',
    textAlign: 'center',
    fontFamily: "'Poppins', sans-serif",
    margin: 0,
  },
  usernameContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  googleUserInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#f8f8f8',
    borderRadius: '10px',
  },
  googleAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#e0e0e0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    flexShrink: 0,
  },
  profileImg: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover',
    flexShrink: 0,
  },
  emailText: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
    margin: 0,
    fontFamily: "'Poppins', sans-serif",
  },
  verifiedBadge: {
    fontSize: '12px',
    color: '#4CAF50',
    margin: 0,
    fontWeight: '500',
    fontFamily: "'Poppins', sans-serif",
  },
  signupText: {
    fontSize: '14px',
    color: '#666',
    margin: '20px 0 0 0',
    textAlign: 'center',
    fontFamily: "'Poppins', sans-serif",
  },
  loginLink: {
    color: '#7c6fd6',
    textDecoration: 'none',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif",
    transition: 'all 0.2s ease',
  },
  // RIGHT SIDE STYLES
  rightSide: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #7c6fd6 0%, #9b8de8 100%)',
    padding: '40px',
    position: 'relative',
    overflow: 'hidden',
    minHeight: 'calc(100vh - 80px)',
  },
  illustrationContainer: {
    textAlign: 'center',
    color: 'white',
    position: 'relative',
    zIndex: 2,
    padding: '20px',
    width: '100%',
    maxWidth: '440px',
  },
  mascotStageWrap: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '28px',
    height: '260px',
    justifyContent: 'flex-end',
  },
  mascotSvgWrap: {
    width: '190px',
    height: '190px',
    filter: 'drop-shadow(0 12px 18px rgba(0,0,0,0.18))',
    zIndex: 2,
  },
  platformWrap: {
    position: 'relative',
    width: '150px',
    height: '30px',
    marginTop: '-6px',
  },
  platformGlow: {
    position: 'absolute',
    left: '50%',
    top: '4px',
    width: '150px',
    height: '18px',
    background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 70%)',
  },
  platform: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    top: '8px',
    width: '130px',
    height: '14px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.22)',
    border: '1px solid rgba(255,255,255,0.3)',
  },
  illustrationTitle: {
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '4px',
    fontFamily: "'Poppins', sans-serif",
    lineHeight: '1.2',
  },
  illustrationSubtitle: {
    fontSize: '22px',
    fontWeight: '700',
    opacity: 0.95,
    fontFamily: "'Poppins', sans-serif",
  },
};

export default Signup;