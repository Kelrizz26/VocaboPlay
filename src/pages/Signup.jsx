import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from "./firebase";
import { 
  GoogleAuthProvider, 
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1950 + 1 }, (_, i) => CURRENT_YEAR - i);
const TEACHER_SECRET_CODE = "VOCABO2025";

// ===== MUTED GAME UI PALETTE =====
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
  danger: '#DB7A64',
};

const FONT_DISPLAY = "'Fredoka', sans-serif";
const FONT_BODY = "'Nunito', sans-serif";

// ===== DUOTONE SVG ICONS =====
const Icon = ({ name, size = 20, color = palette.bodyTextSoft }) => {
  const icons = {
    rocket: (
      <>
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    graduation: (
      <>
        <path d="M22 10L12 5 2 10l10 5 10-5z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M6 12v5c0 1 3 3 6 3s6-2 6-3v-5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    teacher: (
      <>
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    key: (
      <>
        <circle cx="7.5" cy="15.5" r="5.5" stroke={color} strokeWidth="2" fill="none"/>
        <path d="M21 2l-9.6 9.6M15.5 7.5l3 3L22 7l-3-3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    check: (
      <path d="M20 6L9 17l-5-5" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    ),
    warning: (
      <>
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M12 9v4M12 17h.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    menu: (
      <path d="M3 12h18M3 6h18M3 18h18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    ),
    close: (
      <path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    ),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', flexShrink: 0 }}>
      {icons[name] || icons.rocket}
    </svg>
  );
};

const Signup = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [teacherCode, setTeacherCode] = useState('');
  const [step, setStep] = useState('welcome');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [outsidePH, setOutsidePH] = useState(false);
  const [tempUserData, setTempUserData] = useState(null);
  const [username, setUsername] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const chunkyButton = (bg, shadowColor, size = 'md') => {
    const sizes = {
      sm: { padding: '8px 16px', fontSize: '13px', radius: '8px' },
      md: { padding: '12px 24px', fontSize: '15px', radius: '12px' },
      lg: { padding: '16px 32px', fontSize: '18px', radius: '14px' },
    };
    const s = sizes[size];
    return {
      background: bg,
      color: palette.white,
      border: 'none',
      borderRadius: s.radius,
      fontWeight: '800',
      cursor: 'pointer',
      fontFamily: FONT_DISPLAY,
      fontSize: s.fontSize,
      padding: s.padding,
      boxShadow: `0 3px 0 ${shadowColor}`,
      transition: 'transform 0.1s ease, box-shadow 0.1s ease',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    };
  };
  const pressButton = (e, s) => { e.currentTarget.style.transform = 'translateY(3px)'; e.currentTarget.style.boxShadow = 'none'; };
  const releaseButton = (e, s) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 3px 0 ${s}`; };

  const handleRoleNext = () => {
    if (!userRole) return setError('Please select whether you are a Student or Teacher');
    if (userRole === 'teacher') {
      if (!teacherCode) return setError('Please enter the Teacher Access Code');
      if (teacherCode !== TEACHER_SECRET_CODE) return setError('Invalid Teacher Access Code. Please try again.');
    }
    setError(''); setStep('age');
  };
  const handleAgeNext = () => {
    if (!birthMonth || !birthYear) return setError('Please select your birth month and year');
    setError(''); setStep('auth');
  };

  const handleGoogleSignUp = async () => {
    setError(''); setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setError('This Google account is already registered. Please log in instead.');
        await signOut(auth); setLoading(false); return;
      }
      setTempUserData({ uid: user.uid, email: user.email, displayName: user.displayName, photoURL: user.photoURL, emailVerified: user.emailVerified });
      setStep('username'); setLoading(false);
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') setError('Sign up cancelled. Please try again.');
      else if (error.code === 'auth/popup-blocked') setError('Popup was blocked. Please allow popups for this site.');
      else setError('Failed to sign up with Google. Please try again.');
      setLoading(false);
    }
  };

  const completeSignUp = async () => {
    if (!username.trim()) return setError('Please enter a username');
    if (!agreeTerms) return setError('Please agree to the Privacy Policy & Terms of Service');
    setLoading(true); setError('');
    try {
      const user = tempUserData;
      const userProgress = {
        level: 1, xp: 0, totalPoints: 0, streak: 0, gamesPlayed: 0, wordsLearned: 0, correctAnswers: 0, totalAnswers: 0,
        flashcards: { cardsViewed: 0, knownWords: [], masteredWords: [], sessionsCompleted: 0 },
        wordPics: { gamesPlayed: 0, gamesCompleted: 0, cardsViewed: 0, correctAnswers: 0, knownWords: [], totalScore: 0 },
        quiz: { gamesCompleted: 0, correctAnswers: 0, totalQuestions: 0, bestScore: 0 },
        match: { gamesCompleted: 0, totalPairs: 0, totalMoves: 0, bestTime: 0, bestMoves: 0, perfectGames: 0 },
        guessWhat: { gamesCompleted: 0, correctAnswers: 0, totalQuestions: 0, bestScore: 0 },
        sentenceBuilder: { gamesCompleted: 0, correctAnswers: 0, totalSentences: 0, bestScore: 0 },
        shortStory: { chaptersRead: 0, quizzesPassed: 0, storiesCompleted: 0 },
        achievements: { firstGame: false, perfectScore: false, threeDayStreak: false, tenWords: false, masterLearner: false, speedDemon: false, vocabularyMaster: false }
      };
      const finalRole = userRole === 'teacher' ? 'admin' : 'student';
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid, email: user.email, displayName: username, username: username,
        role: finalRole, avatar: user.photoURL || '👤', emailVerified: true, googleAccount: true,
        birthMonth, birthYear, outsidePH,
        createdAt: new Date().toISOString(), lastActive: new Date().toISOString(),
        progress: userProgress, favorites: [],
        settings: { emailNotifications: true, darkMode: false, language: 'en' }
      });
      localStorage.setItem('userId', user.uid);
      localStorage.setItem('userDisplayName', username);
      localStorage.setItem('username', username);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('vocaboplay_progress', JSON.stringify(userProgress));
      const userProfile = { uid: user.uid, displayName: username, username: username, email: user.email, avatar: user.photoURL || '👤', role: finalRole, emailVerified: true, googleAccount: true, progress: userProgress, settings: { emailNotifications: true, darkMode: false, language: 'en' } };
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
      const token = await auth.currentUser.getIdToken();

      // ✅ NEW: Trigger welcome email (fire-and-forget, hindi nag-block sa signup flow)
      fetch('/api/send-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: token }),
      }).catch(err => console.error('Welcome email trigger failed:', err));

      localStorage.setItem('token', token);
      localStorage.setItem('userType', finalRole);
      if (finalRole === 'admin') {
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminRole', 'admin');
        navigate('/admin/dashboard');
      } else navigate('/dashboard');
    } catch (error) {
      console.error('Complete Sign Up Error:', error);
      setError('Failed to complete sign up. Please try again.');
    } finally { setLoading(false); }
  };

  const goBackToWelcome = () => { setStep('welcome'); setError(''); };
  const goBackToRole = () => { setStep('role'); setError(''); setTeacherCode(''); };
  const goBackToAge = () => { setStep('age'); setError(''); };
  const goBackToAuth = () => { setStep('auth'); setError(''); setTempUserData(null); signOut(auth); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;500;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { font-family: 'Nunito', sans-serif; background: ${palette.cream}; overflow-x: hidden; width: 100%; max-width: 100vw; }
        .signup-page-root { width: 100%; overflow-x: hidden; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes mascotBounce { 0%, 100% { transform: translateY(0) scaleY(1); } 45% { transform: translateY(-22px) scaleY(1.02); } 50% { transform: translateY(-24px) scaleY(1.04); } 55% { transform: translateY(-22px) scaleY(1.02); } }
        @keyframes mascotSquash { 0%, 40%, 60%, 100% { transform: scale(1, 1); } 48% { transform: scale(1.08, 0.9); } 52% { transform: scale(1.08, 0.9); } }
        @keyframes earWiggle { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-6deg); } }
        @keyframes blink { 0%, 92%, 100% { transform: scaleY(1); } 96% { transform: scaleY(0.1); } }
        @keyframes platformGlow { 0%, 100% { opacity: 0.55; transform: translateX(-50%) scale(1); } 50% { opacity: 0.85; transform: translateX(-50%) scale(1.08); } }
        .mascot-stage { animation: mascotBounce 3.2s ease-in-out infinite; }
        .mascot-squash { animation: mascotSquash 3.2s ease-in-out infinite; transform-origin: bottom center; }
        .mascot-ear-left { animation: earWiggle 3.2s ease-in-out infinite; transform-origin: 70% 20%; }
        .mascot-ear-right { animation: earWiggle 3.2s ease-in-out infinite 0.15s; transform-origin: 30% 20%; }
        .mascot-eyes { animation: blink 4.5s ease-in-out infinite; transform-origin: center; }
        .platform-glow { animation: platformGlow 3.2s ease-in-out infinite; }
        .animate-slide-up { animation: slideUp 0.6s ease-out forwards; }
        .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
        .hamburger { display: none; background: none; border: none; cursor: pointer; color: ${palette.deepNavy}; padding: 8px; z-index: 1001; }
        .overlay { display: none; position: fixed; inset: 0; background: rgba(42, 40, 69, 0.5); z-index: 999; backdrop-filter: blur(4px); }
        .overlay.active { display: block; }
        .nav-mobile { display: none !important; }
        .split-container { display: flex; min-height: 100vh; padding-top: 80px; background: ${palette.white}; overflow: hidden; width: 100%; }
        .left-side { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px 60px; background: ${palette.cream}; min-height: calc(100vh - 80px); }
        .right-side { flex: 1; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, ${palette.warmOrange} 0%, ${palette.coral} 100%); padding: 40px; position: relative; overflow: hidden; min-height: calc(100vh - 80px); }
        .card-wrapper { width: 100%; max-width: 440px; background: ${palette.white}; border: 1.5px solid ${palette.border}; border-radius: 20px; box-shadow: 0 10px 30px rgba(42, 40, 69, 0.10); padding: clamp(24px, 3vw, 36px); box-sizing: border-box; }
        @media (min-width: 769px) and (max-width: 1024px) {
          .left-side { padding: 40px 30px !important; }
          .card-wrapper { max-width: 380px !important; }
        }
        @media (max-width: 768px) {
          html, body { overflow-x: hidden !important; width: 100% !important; }
          .hamburger { display: block !important; }
          .nav-desktop { display: none !important; }
          .nav-mobile { display: flex !important; flex-direction: column; position: fixed; top: 0; right: -100%; width: 280px; max-width: 85vw; height: 100vh; background: white; padding: 80px 30px 30px; box-shadow: -10px 0 30px rgba(42, 40, 69, 0.1); transition: right 0.3s ease; z-index: 1000; overflow-y: auto; }
          .nav-mobile.open { right: 0 !important; }
          .nav-mobile button { padding: 15px 0; font-size: 16px !important; border-bottom: 1px solid #f0f0f0; background: none; border: none; cursor: pointer; font-family: 'Nunito', sans-serif; font-weight: 600; color: ${palette.deepNavy}; text-align: left; width: 100%; }
          .split-container { flex-direction: column !important; padding-top: 65px !important; min-height: 100vh !important; overflow: visible !important; }
          .left-side { width: 100% !important; padding: 16px 14px 24px !important; min-height: auto !important; flex: none !important; }
          .right-side { display: flex !important; position: relative !important; width: 100% !important; flex: none !important; min-height: auto !important; padding: 24px 16px 36px !important; }
          .card-wrapper { max-width: 100% !important; width: 100% !important; padding: 22px 18px !important; border-radius: 20px !important; }
        }
        @media (min-width: 769px) { .nav-mobile { display: none !important; } .nav-desktop { display: flex !important; } }
        @media (prefers-reduced-motion: reduce) {
          .mascot-stage, .mascot-squash, .mascot-ear-left, .mascot-ear-right, .mascot-eyes, .platform-glow { animation: none !important; }
        }
      `}</style>

      <div className="signup-page-root">
        <div className={`overlay ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}></div>

        <nav style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          background: 'rgba(253, 249, 243, 0.98)',
          backdropFilter: 'blur(10px)',
          borderBottom: `1.5px solid ${palette.border}`,
          zIndex: 1000, padding: '15px 30px',
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div onClick={() => navigate('/')} style={{ ...chunkyButton(palette.warmOrange, palette.warmOrangeShadow, 'sm'), fontSize: '16px', padding: '8px 18px', userSelect: 'none' }}>
              VocaboPlay
            </div>

            <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <button
                onClick={() => navigate('/login')}
                style={{ ...chunkyButton(palette.teal, palette.tealShadow, 'sm'), padding: '10px 28px', fontSize: '14px', whiteSpace: 'nowrap' }}
                onMouseDown={e => pressButton(e, palette.tealShadow)}
                onMouseUp={e => releaseButton(e, palette.tealShadow)}
                onMouseLeave={e => releaseButton(e, palette.tealShadow)}
              >
                Log in
              </button>
            </div>

            <button className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
              <Icon name={isMenuOpen ? 'close' : 'menu'} size={24} color={palette.deepNavy} />
            </button>

            <div className={`nav-mobile ${isMenuOpen ? 'open' : ''}`}>
              <button onClick={() => { navigate('/'); setIsMenuOpen(false); }}>🏠 Home</button>
              <button onClick={() => { navigate('/login'); setIsMenuOpen(false); }}>🔑 Log in</button>
              <button
                style={{ marginTop: 20, textAlign: 'center', background: palette.warmOrange, color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 800, boxShadow: `0 3px 0 ${palette.warmOrangeShadow}`, fontFamily: FONT_DISPLAY }}
                onClick={() => { navigate('/login'); setIsMenuOpen(false); }}
              >
                Log in
              </button>
            </div>
          </div>
        </nav>

        <div className="split-container">
          <div className="left-side">
            <div className="card-wrapper animate-slide-up">

              {step === 'welcome' && (
                <>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: palette.warmOrange, color: 'white', padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, marginBottom: 16, boxShadow: `0 2px 0 ${palette.warmOrangeShadow}` }}>
                    <Icon name="rocket" size={12} color={palette.white} />
                    <span style={{ fontFamily: FONT_DISPLAY }}>Get Started</span>
                  </div>
                  <h1 style={{ fontSize: 28, fontWeight: 800, color: palette.deepNavy, margin: '0 0 8px 0', fontFamily: FONT_DISPLAY, lineHeight: 1.2, letterSpacing: '-0.5px' }}>
                    Create your account
                  </h1>
                  <p style={{ fontSize: 14, color: palette.bodyText, margin: '0 0 28px 0', lineHeight: 1.5, fontFamily: FONT_BODY, fontWeight: 500 }}>
                    Join VocaboPlay and start leveling up your vocabulary through fun, interactive games — it only takes a minute.
                  </p>
                  <button
                    onClick={() => setStep('role')}
                    style={{ ...chunkyButton(palette.warmOrange, palette.warmOrangeShadow, 'lg'), width: '100%' }}
                    onMouseDown={e => pressButton(e, palette.warmOrangeShadow)}
                    onMouseUp={e => releaseButton(e, palette.warmOrangeShadow)}
                    onMouseLeave={e => releaseButton(e, palette.warmOrangeShadow)}
                  >
                    Get Started
                  </button>
                  <p style={{ fontSize: 14, color: palette.bodyText, margin: '20px 0 0 0', textAlign: 'center', fontFamily: FONT_BODY, fontWeight: 600 }}>
                    Already have an account?{' '}
                    <a onClick={() => navigate('/login')} style={{ color: palette.warmOrange, fontWeight: 800, cursor: 'pointer' }}>Log in</a>
                  </p>
                </>
              )}

              {step === 'role' && (
                <>
                  <button onClick={goBackToWelcome} style={{ background: 'none', border: 'none', color: palette.bodyText, fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0, marginBottom: 18, fontFamily: FONT_DISPLAY }}>← Back</button>
                  <h1 style={{ fontSize: 28, fontWeight: 800, color: palette.deepNavy, margin: '0 0 8px 0', fontFamily: FONT_DISPLAY }}>Who are you?</h1>
                  <p style={{ fontSize: 14, color: palette.bodyText, margin: '0 0 28px 0', fontFamily: FONT_BODY, fontWeight: 500 }}>Select your role to get started</p>

                  {error && <div style={{ padding: '12px 14px', background: `${palette.coral}12`, border: `1.5px solid ${palette.coral}40`, borderRadius: '10px', color: palette.coral, fontSize: 12, marginBottom: 16, fontFamily: FONT_BODY, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="warning" size={13} color={palette.coral} />{error}</div>}

                  <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 20 }}>
                    {['student', 'teacher'].map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => { setUserRole(role); setTeacherCode(''); setError(''); }}
                        style={{
                          flex: 1, padding: '20px 14px', borderRadius: 16, cursor: 'pointer',
                          border: userRole === role ? `1.5px solid ${palette.warmOrange}` : `1.5px solid ${palette.border}`,
                          background: userRole === role ? `${palette.warmOrange}10` : palette.white,
                          boxShadow: userRole === role ? `0 3px 0 ${palette.warmOrangeShadow}` : `0 2px 0 ${palette.border}`,
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                          transition: 'all 0.2s ease', maxWidth: 170,
                          transform: userRole === role ? 'translateY(-2px)' : 'none',
                        }}
                      >
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: userRole === role ? `${palette.warmOrange}20` : palette.creamSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name={role === 'student' ? 'graduation' : 'teacher'} size={20} color={userRole === role ? palette.warmOrange : palette.bodyTextSoft} />
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: palette.deepNavy, fontFamily: FONT_DISPLAY, textTransform: 'capitalize' }}>{role}</span>
                        <span style={{ fontSize: 11, color: palette.bodyTextSoft, textAlign: 'center', fontFamily: FONT_BODY, fontWeight: 600 }}>{role === 'student' ? 'Learn and play' : 'Manage and teach'}</span>
                      </button>
                    ))}
                  </div>

                  {userRole === 'teacher' && (
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 11, fontWeight: 800, color: palette.bodyTextSoft, display: 'block', marginBottom: 6, fontFamily: FONT_DISPLAY, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Teacher Access Code</label>
                      <input
                        type="password"
                        placeholder="Enter teacher access code"
                        value={teacherCode}
                        onChange={(e) => setTeacherCode(e.target.value)}
                        style={{ padding: '12px 14px', border: `1.5px solid ${palette.border}`, borderRadius: 10, fontSize: 14, fontFamily: FONT_BODY, fontWeight: 600, width: '100%', boxSizing: 'border-box', background: palette.creamSoft, color: palette.deepNavy, outline: 'none' }}
                      />
                      <p style={{ fontSize: 11, color: palette.bodyTextSoft, marginTop: 6, fontFamily: FONT_BODY, fontWeight: 600, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <Icon name="key" size={12} color={palette.bodyTextSoft} /> Ask your administrator for the access code
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleRoleNext}
                    style={{ ...chunkyButton(palette.warmOrange, palette.warmOrangeShadow, 'lg'), width: '100%' }}
                    onMouseDown={e => pressButton(e, palette.warmOrangeShadow)}
                    onMouseUp={e => releaseButton(e, palette.warmOrangeShadow)}
                    onMouseLeave={e => releaseButton(e, palette.warmOrangeShadow)}
                  >
                    Next
                  </button>

                  <p style={{ fontSize: 14, color: palette.bodyText, margin: '20px 0 0 0', textAlign: 'center', fontFamily: FONT_BODY, fontWeight: 600 }}>
                    Already have an account? <a onClick={() => navigate('/login')} style={{ color: palette.warmOrange, fontWeight: 800, cursor: 'pointer' }}>Log in</a>
                  </p>
                </>
              )}

              {step === 'age' && (
                <>
                  <button onClick={goBackToRole} style={{ background: 'none', border: 'none', color: palette.bodyText, fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0, marginBottom: 18, fontFamily: FONT_DISPLAY }}>← Back</button>
                  <h1 style={{ fontSize: 28, fontWeight: 800, color: palette.deepNavy, margin: '0 0 8px 0', fontFamily: FONT_DISPLAY }}>Age verification</h1>
                  <p style={{ fontSize: 14, color: palette.bodyText, margin: '0 0 28px 0', fontFamily: FONT_BODY, fontWeight: 500 }}>Enter the month and year of your birth</p>

                  {error && <div style={{ padding: '12px 14px', background: `${palette.coral}12`, border: `1.5px solid ${palette.coral}40`, borderRadius: '10px', color: palette.coral, fontSize: 12, marginBottom: 16, fontFamily: FONT_BODY, fontWeight: 600 }}>{error}</div>}

                  <div style={{ display: 'flex', gap: 10, marginBottom: 18, alignItems: 'center' }}>
                    <select
                      value={birthMonth}
                      onChange={(e) => setBirthMonth(e.target.value)}
                      style={{ flex: 1, padding: '12px 14px', border: `1.5px solid ${palette.border}`, borderRadius: 10, fontSize: 14, fontFamily: FONT_BODY, fontWeight: 600, background: palette.creamSoft, color: palette.deepNavy, outline: 'none', cursor: 'pointer' }}
                    >
                      <option value="">Month</option>
                      {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <span style={{ color: palette.bodyTextSoft, fontSize: 16, fontWeight: 700 }}>/</span>
                    <select
                      value={birthYear}
                      onChange={(e) => setBirthYear(e.target.value)}
                      style={{ flex: 1, padding: '12px 14px', border: `1.5px solid ${palette.border}`, borderRadius: 10, fontSize: 14, fontFamily: FONT_BODY, fontWeight: 600, background: palette.creamSoft, color: palette.deepNavy, outline: 'none', cursor: 'pointer' }}
                    >
                      <option value="">Year</option>
                      {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: palette.bodyText, fontFamily: FONT_BODY, fontWeight: 600, marginBottom: 24, cursor: 'pointer' }}>
                    <input type="checkbox" checked={outsidePH} onChange={(e) => setOutsidePH(e.target.checked)} style={{ marginTop: 2, width: 16, height: 16, accentColor: palette.warmOrange, cursor: 'pointer' }} />
                    <span>I live outside the Philippines.</span>
                  </label>

                  <button
                    onClick={handleAgeNext}
                    style={{ ...chunkyButton(palette.warmOrange, palette.warmOrangeShadow, 'lg'), width: '100%' }}
                    onMouseDown={e => pressButton(e, palette.warmOrangeShadow)}
                    onMouseUp={e => releaseButton(e, palette.warmOrangeShadow)}
                    onMouseLeave={e => releaseButton(e, palette.warmOrangeShadow)}
                  >
                    Next
                  </button>
                </>
              )}

              {step === 'auth' && (
                <>
                  <button onClick={goBackToAge} style={{ background: 'none', border: 'none', color: palette.bodyText, fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0, marginBottom: 18, fontFamily: FONT_DISPLAY }}>← Back</button>
                  <h1 style={{ fontSize: 28, fontWeight: 800, color: palette.deepNavy, margin: '0 0 8px 0', fontFamily: FONT_DISPLAY }}>Choose an authentication method</h1>

                  {error && <div style={{ padding: '12px 14px', background: `${palette.coral}12`, border: `1.5px solid ${palette.coral}40`, borderRadius: '10px', color: palette.coral, fontSize: 12, marginBottom: 16, fontFamily: FONT_BODY, fontWeight: 600 }}>{error}</div>}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <button
                      onClick={handleGoogleSignUp}
                      disabled={loading}
                      style={{
                        padding: '14px 20px',
                        backgroundColor: palette.white,
                        color: palette.deepNavy,
                        border: `1.5px solid ${palette.border}`,
                        borderRadius: 12,
                        fontSize: 14,
                        fontWeight: 700,
                        fontFamily: FONT_DISPLAY,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        boxShadow: `0 2px 0 ${palette.border}`,
                        opacity: loading ? 0.7 : 1,
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 48 48" style={{ marginRight: 10 }}>
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                      </svg>
                      {loading ? 'Signing up...' : 'Continue with Google'}
                    </button>

                    <p style={{ fontSize: 11, color: palette.bodyTextSoft, textAlign: 'center', fontFamily: FONT_BODY, fontWeight: 600, margin: 0 }}>
                      This site is protected by reCAPTCHA.
                    </p>
                  </div>
                </>
              )}

              {step === 'username' && (
                <>
                  <button onClick={goBackToAuth} style={{ background: 'none', border: 'none', color: palette.bodyText, fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0, marginBottom: 18, fontFamily: FONT_DISPLAY }}>← Back</button>
                  <h1 style={{ fontSize: 28, fontWeight: 800, color: palette.deepNavy, margin: '0 0 8px 0', fontFamily: FONT_DISPLAY }}>Last step!</h1>

                  {error && <div style={{ padding: '12px 14px', background: `${palette.coral}12`, border: `1.5px solid ${palette.coral}40`, borderRadius: '10px', color: palette.coral, fontSize: 12, marginBottom: 16, fontFamily: FONT_BODY, fontWeight: 600 }}>{error}</div>}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: palette.creamSoft, borderRadius: 12, border: `1.5px solid ${palette.border}` }}>
                      {tempUserData?.photoURL ? (
                        <img src={tempUserData.photoURL} alt="Profile" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: palette.border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>👤</div>
                      )}
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: palette.deepNavy, margin: 0, fontFamily: FONT_BODY, wordBreak: 'break-all' }}>{tempUserData?.email}</p>
                        <p style={{ fontSize: 11, color: palette.softGreen, margin: 0, fontWeight: 700, fontFamily: FONT_BODY, display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Icon name="check" size={11} color={palette.softGreen} />
                          Verified Google Account
                        </p>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 800, color: palette.bodyTextSoft, display: 'block', marginBottom: 6, fontFamily: FONT_DISPLAY, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Enter a username</label>
                      <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                        style={{ padding: '12px 14px', border: `1.5px solid ${palette.border}`, borderRadius: 10, fontSize: 14, fontFamily: FONT_BODY, fontWeight: 600, width: '100%', boxSizing: 'border-box', background: palette.creamSoft, color: palette.deepNavy, outline: 'none' }}
                      />
                    </div>

                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: palette.bodyText, fontFamily: FONT_BODY, fontWeight: 600, cursor: 'pointer' }}>
                      <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} style={{ marginTop: 2, width: 16, height: 16, accentColor: palette.warmOrange, cursor: 'pointer' }} />
                      <span>I agree to VocaboPlay's <a style={{ color: palette.warmOrange, fontWeight: 800, cursor: 'pointer' }} onClick={() => navigate('/privacy')}>Privacy Policy</a> & <a style={{ color: palette.warmOrange, fontWeight: 800, cursor: 'pointer' }} onClick={() => navigate('/terms')}>Terms of Service</a>.</span>
                    </label>

                    <button
                      onClick={completeSignUp}
                      disabled={loading}
                      style={{ ...chunkyButton(palette.warmOrange, palette.warmOrangeShadow, 'lg'), width: '100%', opacity: loading ? 0.7 : 1 }}
                      onMouseDown={(e) => !loading && pressButton(e, palette.warmOrangeShadow)}
                      onMouseUp={(e) => !loading && releaseButton(e, palette.warmOrangeShadow)}
                      onMouseLeave={(e) => !loading && releaseButton(e, palette.warmOrangeShadow)}
                    >
                      {loading ? 'Submitting...' : 'Submit'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="right-side animate-fade-in">
            <div style={{ position: 'absolute', inset: 0, opacity: 0.08, backgroundImage: `linear-gradient(rgba(255,255,255,0.6) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.6) 2px, transparent 2px)`, backgroundSize: '60px 60px' }}></div>

            <span style={{ position: 'absolute', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', width: 6, height: 6, top: '14%', left: '18%' }}></span>
            <span style={{ position: 'absolute', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', width: 4, height: 4, top: '22%', right: '20%' }}></span>
            <span style={{ position: 'absolute', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', width: 5, height: 5, top: '68%', left: '12%' }}></span>

            <div style={{ textAlign: 'center', color: palette.white, position: 'relative', zIndex: 2, padding: 20, width: '100%', maxWidth: 440 }}>
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28, height: 220, justifyContent: 'flex-end' }}>
                <div className="mascot-stage" style={{ width: 170, height: 170, filter: 'drop-shadow(0 12px 18px rgba(0,0,0,0.18))', zIndex: 2 }}>
                  <div className="mascot-squash">
                    <svg viewBox="0 0 200 200" width="100%" height="100%">
                      <path d="M75 55 C 68 30, 60 20, 55 25 C 58 40, 65 52, 75 62 Z" fill="#5b4fa8" />
                      <path d="M125 55 C 132 30, 140 20, 145 25 C 142 40, 135 52, 125 62 Z" fill="#5b4fa8" />
                      <g className="mascot-ear-left"><ellipse cx="62" cy="78" rx="14" ry="20" fill="#c9c3ee" /><ellipse cx="62" cy="78" rx="7" ry="12" fill="#e9d9e6" /></g>
                      <g className="mascot-ear-right"><ellipse cx="138" cy="78" rx="14" ry="20" fill="#c9c3ee" /><ellipse cx="138" cy="78" rx="7" ry="12" fill="#e9d9e6" /></g>
                      <ellipse cx="100" cy="150" rx="48" ry="34" fill="#c3bdf0" />
                      <rect x="70" y="165" width="14" height="22" rx="7" fill="#a89ce6" />
                      <rect x="116" y="165" width="14" height="22" rx="7" fill="#a89ce6" />
                      <ellipse cx="100" cy="95" rx="42" ry="38" fill="#d6d1f6" />
                      <ellipse cx="100" cy="112" rx="18" ry="12" fill="#eae5fb" />
                      <g className="mascot-eyes"><circle cx="84" cy="92" r="9" fill="#2b2b3d" /><circle cx="116" cy="92" r="9" fill="#2b2b3d" /><circle cx="87" cy="89" r="2.5" fill="white" /><circle cx="119" cy="89" r="2.5" fill="white" /></g>
                      <ellipse cx="74" cy="104" rx="6" ry="4" fill="#f2b3c9" opacity="0.7" />
                      <ellipse cx="126" cy="104" rx="6" ry="4" fill="#f2b3c9" opacity="0.7" />
                      <path d="M92 116 Q100 121 108 116" stroke="#8b7fc7" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
                <div style={{ position: 'relative', width: 150, height: 30, marginTop: -6 }}>
                  <div className="platform-glow" style={{ position: 'absolute', left: '50%', top: 4, width: 150, height: 18, background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 70%)' }}></div>
                  <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 8, width: 130, height: 14, borderRadius: '50%', background: 'rgba(255,255,255,0.22)', border: '1px solid rgba(255,255,255,0.3)' }}></div>
                </div>
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4, fontFamily: FONT_DISPLAY, lineHeight: 1.2 }}>Level up your vocabulary,</h2>
              <p style={{ fontSize: 20, fontWeight: 700, opacity: 0.95, fontFamily: FONT_DISPLAY }}>one word at a time.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;