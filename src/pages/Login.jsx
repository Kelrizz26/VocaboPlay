import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { signInWithEmailAndPassword, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

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
  danger: '#DB7A64',
};

const FONT_DISPLAY = "'Fredoka', sans-serif";
const FONT_BODY = "'Nunito', sans-serif";

// ===== DUOTONE SVG ICONS =====
const Icon = ({ name, size = 20, color = palette.bodyTextSoft }) => {
  const icons = {
    eye: (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" fill="none"/>
      </>
    ),
    eyeOff: (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <line x1="1" y1="1" x2="23" y2="23" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      </>
    ),
    menu: (
      <path d="M3 12h18M3 6h18M3 18h18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    ),
    close: (
      <path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
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
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', flexShrink: 0 }}>
      {icons[name] || icons.eye}
    </svg>
  );
};

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const chunkyButton = (bg, shadowColor, size = 'md') => {
    const sizes = {
      sm: { padding: '8px 16px', fontSize: '13px', radius: '8px' },
      md: { padding: '12px 24px', fontSize: '15px', radius: '12px' },
      lg: { padding: '16px 32px', fontSize: '18px', radius: '14px' },
    };
    const s = sizes[size];
    return {
      background: bg, color: palette.white, border: 'none', borderRadius: s.radius,
      fontWeight: '800', cursor: 'pointer', fontFamily: FONT_DISPLAY,
      fontSize: s.fontSize, padding: s.padding, boxShadow: `0 3px 0 ${shadowColor}`,
      transition: 'transform 0.1s ease, box-shadow 0.1s ease',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      textTransform: 'uppercase', letterSpacing: '0.05em',
    };
  };
  const pressButton = (e, s) => { e.currentTarget.style.transform = 'translateY(3px)'; e.currentTarget.style.boxShadow = 'none'; };
  const releaseButton = (e, s) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 3px 0 ${s}`; };

  // ✅ NEW: Helper para i-update yung lastActive timestamp sa Firestore
  const updateLastActive = async (uid) => {
    try {
      await updateDoc(doc(db, 'users', uid), {
        lastActive: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error updating lastActive:', err);
    }
  };

  const handleGoogleLogin = async () => {
    setError(''); setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userRole = userData.role || 'student';
        if (userRole === 'admin' || userRole === 'super_admin') {
          setError('Please use the Admin Login page.');
          await auth.signOut(); setLoading(false); return;
        }

        // ✅ NEW: Update lastActive timestamp sa Firestore
        await updateLastActive(user.uid);

        const userProfile = {
          uid: user.uid, email: user.email,
          displayName: userData.displayName || user.displayName,
          username: userData.username || user.displayName,
          avatar: userData.avatar || user.photoURL || '👤',
          role: userRole,
          progress: userData.progress || { wordsLearned: 0, gamesPlayed: 0, totalPoints: 0, level: 1, xp: 0, streak: 0, correctAnswers: 0, totalAnswers: 0 },
          settings: userData.settings || { emailNotifications: true, darkMode: false, language: 'en' }
        };
        const token = await user.getIdToken();
        if (rememberMe) { localStorage.setItem('rememberMe', 'true'); localStorage.setItem('userProfile', JSON.stringify(userProfile)); }
        else sessionStorage.setItem('userProfile', JSON.stringify(userProfile));
        localStorage.setItem('token', token);
        localStorage.setItem('userType', userRole);
        localStorage.setItem('userId', user.uid);
        if (userData.progress) localStorage.setItem('vocaboplay_progress', JSON.stringify(userData.progress));
        navigate('/dashboard');
      } else {
        setError('No account found with this Google account. Please sign up first.');
        await auth.signOut(); setLoading(false);
      }
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') setError('Login cancelled. Please try again.');
      else if (error.code === 'auth/popup-blocked') setError('Popup was blocked. Please allow popups for this site.');
      else setError('Failed to login with Google. Please try again.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    if (!email || !password) { setError('Please fill in all fields'); setLoading(false); return; }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userRole = userData.role || 'student';
        if (userRole === 'admin' || userRole === 'super_admin') {
          setError('Please use the Admin Login page.'); setLoading(false); await auth.signOut(); return;
        }

        // ✅ NEW: Update lastActive timestamp sa Firestore
        await updateLastActive(user.uid);

        let userProgress = userData.progress || { wordsLearned: 0, gamesPlayed: 0, totalPoints: 0, level: 1, xp: 0, streak: 0 };
        try {
          const { getUserProgress } = await import('../services/firebaseService');
          const firebaseProgress = await getUserProgress(user.uid);
          if (firebaseProgress) { userProgress = firebaseProgress; localStorage.setItem('vocaboplay_progress', JSON.stringify(firebaseProgress)); }
          else localStorage.removeItem('vocaboplay_progress');
        } catch (progressError) { console.error('Error loading progress:', progressError); localStorage.removeItem('vocaboplay_progress'); }
        const userProfile = {
          uid: user.uid, email: user.email,
          displayName: userData.displayName || email.split('@')[0],
          username: userData.username || email.split('@')[0],
          avatar: userData.avatar || '👤',
          role: userRole, progress: userProgress,
          settings: userData.settings || { emailNotifications: true, darkMode: false, language: 'en' }
        };
        const token = await user.getIdToken();
        if (rememberMe) { localStorage.setItem('rememberMe', 'true'); localStorage.setItem('userProfile', JSON.stringify(userProfile)); }
        else sessionStorage.setItem('userProfile', JSON.stringify(userProfile));
        localStorage.setItem('token', token);
        localStorage.setItem('userType', userRole);
        localStorage.setItem('userId', user.uid);
        if (userData.progress) localStorage.setItem('vocaboplay_progress', JSON.stringify(userData.progress));
        navigate('/dashboard');
      } else {
        setError('Account not found. Please contact support.'); setLoading(false);
      }
    } catch (error) {
      switch (error.code) {
        case 'auth/invalid-email': setError('Invalid email address'); break;
        case 'auth/user-disabled': setError('This account has been disabled'); break;
        case 'auth/user-not-found': setError('No account found with this email'); break;
        case 'auth/wrong-password': setError('Incorrect password'); break;
        case 'auth/invalid-credential': setError('Invalid email or password'); break;
        default: setError('Failed to log in. Please try again.');
      }
    } finally { setLoading(false); }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetError(''); setResetMessage('');
    if (!resetEmail) { setResetError('Please enter your email address'); return; }
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail, { url: window.location.origin + '/login', handleCodeInApp: false });
      setResetMessage('Password reset email sent! Check your inbox.');
      setResetEmail('');
      setTimeout(() => { setShowForgotPassword(false); setResetMessage(''); }, 3000);
    } catch (error) {
      switch (error.code) {
        case 'auth/user-not-found': setResetError('No account found with this email'); break;
        case 'auth/invalid-email': setResetError('Invalid email address'); break;
        default: setResetError('Failed to send reset email. Please try again.');
      }
    } finally { setResetLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;500;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { font-family: 'Nunito', sans-serif; background: ${palette.cream}; overflow-x: hidden; width: 100%; max-width: 100vw; }
        .login-page-root { width: 100%; overflow-x: hidden; }
        .hamburger { display: none; background: none; border: none; cursor: pointer; color: ${palette.deepNavy}; padding: 8px; z-index: 1001; }
        .overlay { display: none; position: fixed; inset: 0; background: rgba(42, 40, 69, 0.5); z-index: 999; backdrop-filter: blur(4px); }
        .overlay.active { display: block; }
        .nav-mobile { display: none !important; }
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
        .split-container { display: flex; min-height: 100vh; padding-top: 80px; background: ${palette.white}; overflow: hidden; width: 100%; }
        .left-side { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px 60px; background: ${palette.cream}; min-height: calc(100vh - 80px); }
        .right-side { flex: 1; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, ${palette.warmOrange} 0%, ${palette.coral} 100%); padding: 40px; position: relative; overflow: hidden; min-height: calc(100vh - 80px); }
        .card-wrapper { width: 100%; max-width: 380px; background: ${palette.white}; border: 1.5px solid ${palette.border}; border-radius: 20px; box-shadow: 0 10px 30px rgba(42, 40, 69, 0.10); padding: clamp(24px, 3vw, 36px); box-sizing: border-box; }
        @media (max-width: 768px) {
          .hamburger { display: block !important; }
          .nav-desktop { display: none !important; }
          .nav-mobile { display: flex !important; flex-direction: column; position: fixed; top: 0; right: -100%; width: 280px; max-width: 85vw; height: 100vh; background: white; padding: 80px 30px 30px; box-shadow: -10px 0 30px rgba(42, 40, 69, 0.1); transition: right 0.3s ease; z-index: 1000; overflow-y: auto; }
          .nav-mobile.open { right: 0 !important; }
          .nav-mobile button { padding: 15px 0; font-size: 16px !important; border-bottom: 1px solid #f0f0f0; background: none; border: none; cursor: pointer; font-family: 'Nunito', sans-serif; font-weight: 600; color: ${palette.deepNavy}; text-align: left; width: 100%; }
          .split-container { flex-direction: column !important; padding-top: 65px !important; }
          .left-side { width: 100% !important; padding: 16px 14px 24px !important; min-height: auto !important; flex: none !important; }
          .right-side { display: flex !important; position: relative !important; width: 100% !important; flex: none !important; min-height: auto !important; padding: 24px 16px 36px !important; }
          .card-wrapper { max-width: 100% !important; width: 100% !important; padding: 22px 18px !important; border-radius: 20px !important; }
        }
        @media (min-width: 769px) { .nav-mobile { display: none !important; } .nav-desktop { display: flex !important; } }
        @media (prefers-reduced-motion: reduce) { .mascot-stage, .mascot-squash, .mascot-ear-left, .mascot-ear-right, .mascot-eyes, .platform-glow { animation: none !important; } }
      `}</style>

      <div className="login-page-root">
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
                onClick={() => navigate('/signup')}
                style={{ ...chunkyButton(palette.teal, palette.tealShadow, 'sm'), padding: '10px 28px', fontSize: '14px', whiteSpace: 'nowrap' }}
                onMouseDown={e => pressButton(e, palette.tealShadow)}
                onMouseUp={e => releaseButton(e, palette.tealShadow)}
                onMouseLeave={e => releaseButton(e, palette.tealShadow)}
              >
                Sign Up
              </button>
            </div>

            <button className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
              <Icon name={isMenuOpen ? 'close' : 'menu'} size={24} color={palette.deepNavy} />
            </button>

            <div className={`nav-mobile ${isMenuOpen ? 'open' : ''}`}>
              <button onClick={() => { navigate('/'); setIsMenuOpen(false); }}>🏠 Home</button>
              <button onClick={() => { navigate('/signup'); setIsMenuOpen(false); }}>✨ Sign Up</button>
              <button
                style={{ marginTop: 20, textAlign: 'center', background: palette.warmOrange, color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 800, boxShadow: `0 3px 0 ${palette.warmOrangeShadow}`, fontFamily: FONT_DISPLAY }}
                onClick={() => { navigate('/signup'); setIsMenuOpen(false); }}
              >
                Sign Up
              </button>
            </div>
          </div>
        </nav>

        <div className="split-container">
          <div className="left-side">
            <div className="card-wrapper animate-slide-up">
              <h1 style={{ fontSize: 28, fontWeight: 800, color: palette.deepNavy, margin: '0 0 8px 0', fontFamily: FONT_DISPLAY, letterSpacing: '-0.5px' }}>Log in</h1>
              <p style={{ fontSize: 14, color: palette.bodyText, margin: '0 0 28px 0', lineHeight: 1.5, fontFamily: FONT_BODY, fontWeight: 500 }}>Log in to continue your vocabulary journey</p>

              {error && <div style={{ padding: '12px 14px', background: `${palette.coral}12`, border: `1.5px solid ${palette.coral}40`, borderRadius: 10, color: palette.coral, fontSize: 12, marginBottom: 16, fontFamily: FONT_BODY, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="warning" size={13} color={palette.coral} />{error}</div>}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 800, color: palette.bodyTextSoft, fontFamily: FONT_DISPLAY, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email Address</label>
                  <input
                    type="email" placeholder="Enter your email" value={email}
                    onChange={(e) => setEmail(e.target.value)} required disabled={loading}
                    style={{ padding: '12px 14px', border: `1.5px solid ${palette.border}`, borderRadius: 10, fontSize: 14, fontFamily: FONT_BODY, fontWeight: 600, width: '100%', boxSizing: 'border-box', background: palette.creamSoft, color: palette.deepNavy, outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 800, color: palette.bodyTextSoft, fontFamily: FONT_DISPLAY, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Password</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password}
                      onChange={(e) => setPassword(e.target.value)} required disabled={loading}
                      style={{ padding: '12px 14px', paddingRight: 44, border: `1.5px solid ${palette.border}`, borderRadius: 10, fontSize: 14, fontFamily: FONT_BODY, fontWeight: 600, width: '100%', boxSizing: 'border-box', background: palette.creamSoft, color: palette.deepNavy, outline: 'none' }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={loading}
                      style={{ position: 'absolute', right: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
                      <Icon name={showPassword ? 'eyeOff' : 'eye'} size={16} color={palette.bodyTextSoft} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} disabled={loading}
                      style={{ width: 16, height: 16, cursor: 'pointer', accentColor: palette.warmOrange }} />
                    <span style={{ fontSize: 12, color: palette.bodyText, fontFamily: FONT_BODY, fontWeight: 600 }}>Remember me</span>
                  </label>
                  <a href="#" style={{ fontSize: 12, color: palette.warmOrange, textDecoration: 'none', cursor: 'pointer', fontWeight: 700, fontFamily: FONT_BODY }}
                    onClick={(e) => { e.preventDefault(); setShowForgotPassword(true); setResetEmail(email || ''); }}>
                    Forgot Password?
                  </a>
                </div>

                <button type="submit" disabled={loading}
                  style={{ ...chunkyButton(palette.warmOrange, palette.warmOrangeShadow, 'lg'), width: '100%', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                  onMouseDown={(e) => !loading && pressButton(e, palette.warmOrangeShadow)}
                  onMouseUp={(e) => !loading && releaseButton(e, palette.warmOrangeShadow)}
                  onMouseLeave={(e) => !loading && releaseButton(e, palette.warmOrangeShadow)}
                >
                  {loading ? 'Logging in...' : "Let's go!"}
                </button>
              </form>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '20px 0' }}>
                <span style={{ flex: 1, height: 1.5, background: palette.border, borderRadius: 2 }}></span>
                <span style={{ fontSize: 11, color: palette.bodyTextSoft, fontFamily: FONT_DISPLAY, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>or</span>
                <span style={{ flex: 1, height: 1.5, background: palette.border, borderRadius: 2 }}></span>
              </div>

              <button onClick={handleGoogleLogin} disabled={loading}
                style={{ padding: '14px 20px', backgroundColor: palette.white, color: palette.deepNavy, border: `1.5px solid ${palette.border}`, borderRadius: 12, fontSize: 14, fontWeight: 700, fontFamily: FONT_DISPLAY, cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', boxShadow: `0 2px 0 ${palette.border}`, opacity: loading ? 0.7 : 1 }}
                onMouseOver={(e) => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 4px 0 ${palette.border}`; } }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 2px 0 ${palette.border}`; }}
              >
                <svg width="18" height="18" viewBox="0 0 48 48" style={{ marginRight: 10 }}>
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                {loading ? 'Signing in...' : 'Continue with Google'}
              </button>

              <p style={{ fontSize: 14, color: palette.bodyText, margin: '20px 0 0 0', textAlign: 'center', fontFamily: FONT_BODY, fontWeight: 600 }}>
                Don't have an account? <a onClick={() => !loading && navigate('/signup')} style={{ color: palette.warmOrange, fontWeight: 800, cursor: 'pointer' }}>Sign Up</a>
              </p>

              <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1.5px solid ${palette.border}`, textAlign: 'center' }}>
                <span style={{ fontSize: 12, color: palette.bodyText, fontFamily: FONT_BODY, fontWeight: 600 }}>
                  Admin? <a onClick={() => !loading && navigate('/admin')} style={{ color: palette.coral, fontWeight: 800, cursor: 'pointer' }}>Log in here</a>
                </span>
              </div>
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
              <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4, fontFamily: FONT_DISPLAY, lineHeight: 1.2 }}>Welcome back,</h2>
              <p style={{ fontSize: 20, fontWeight: 700, opacity: 0.95, fontFamily: FONT_DISPLAY }}>let's keep learning.</p>
            </div>
          </div>
        </div>

        {showForgotPassword && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(42, 40, 69, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(4px)', padding: 16 }} onClick={() => setShowForgotPassword(false)}>
            <div style={{ background: palette.white, borderRadius: 20, padding: 28, maxWidth: 400, width: '100%', boxShadow: '0 20px 50px rgba(42, 40, 69, 0.25)', border: `1.5px solid ${palette.border}`, boxSizing: 'border-box' }} onClick={(e) => e.stopPropagation()}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: palette.deepNavy, margin: '0 0 8px 0', textAlign: 'center', fontFamily: FONT_DISPLAY }}>Reset Password</h2>
              <p style={{ fontSize: 13, color: palette.bodyText, margin: '0 0 20px 0', textAlign: 'center', fontFamily: FONT_BODY, fontWeight: 500 }}>Enter your email address and we'll send you a link to reset your password.</p>

              {resetError && <div style={{ padding: '10px 14px', background: `${palette.coral}12`, border: `1.5px solid ${palette.coral}40`, borderRadius: 10, color: palette.coral, fontSize: 12, marginBottom: 16, fontFamily: FONT_BODY, fontWeight: 600 }}>{resetError}</div>}
              {resetMessage && <div style={{ padding: '10px 14px', background: `${palette.softGreen}12`, border: `1.5px solid ${palette.softGreen}40`, borderRadius: 10, color: palette.softGreen, fontSize: 12, marginBottom: 16, fontFamily: FONT_BODY, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="check" size={13} color={palette.softGreen} />{resetMessage}</div>}

              <form onSubmit={handleForgotPassword}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
                  <label style={{ fontSize: 11, fontWeight: 800, color: palette.bodyTextSoft, fontFamily: FONT_DISPLAY, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email Address</label>
                  <input
                    type="email" placeholder="Enter your email" value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)} required disabled={resetLoading}
                    style={{ padding: '12px 14px', border: `1.5px solid ${palette.border}`, borderRadius: 10, fontSize: 14, fontFamily: FONT_BODY, fontWeight: 600, width: '100%', boxSizing: 'border-box', background: palette.creamSoft, color: palette.deepNavy, outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" onClick={() => setShowForgotPassword(false)} disabled={resetLoading}
                    style={{ flex: 1, padding: 12, background: palette.creamSoft, color: palette.deepNavy, border: `1.5px solid ${palette.border}`, borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: FONT_DISPLAY }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={resetLoading}
                    style={{ flex: 1, padding: 12, background: palette.warmOrange, color: palette.white, border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: resetLoading ? 'not-allowed' : 'pointer', fontFamily: FONT_DISPLAY, boxShadow: `0 3px 0 ${palette.warmOrangeShadow}`, opacity: resetLoading ? 0.7 : 1 }}
                    onMouseDown={(e) => !resetLoading && pressButton(e, palette.warmOrangeShadow)}
                    onMouseUp={(e) => !resetLoading && releaseButton(e, palette.warmOrangeShadow)}
                    onMouseLeave={(e) => !resetLoading && releaseButton(e, palette.warmOrangeShadow)}>
                    {resetLoading ? 'Sending...' : 'Reset Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Login;