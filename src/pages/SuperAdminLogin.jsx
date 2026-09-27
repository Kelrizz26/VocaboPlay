import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from "./firebase";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// ===== MUTED GAME UI PALETTE =====
const palette = {
  warmOrange: '#E9A075',
  warmOrangeShadow: '#C27E4F',
  coral: '#DB7A64',
  coralShadow: '#A95845',
  deepNavy: '#2A2845',
  bodyText: '#6B6880',
  bodyTextSoft: '#8A8799',
  cream: '#FDF9F3',
  creamSoft: '#F5EFE6',
  white: '#FFFFFF',
  border: '#EBE2D5',
  borderSoft: '#F2EBE0',
  softGreen: '#7FA574',
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
    user: (
      <>
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    lock: (
      <>
        <rect x="4" y="11" width="16" height="10" rx="2" stroke={color} strokeWidth="2" fill="none"/>
        <path d="M8 11V7a4 4 0 118 0v4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
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
    warning: (
      <>
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M12 9v4M12 17h.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', flexShrink: 0 }}>
      {icons[name] || icons.crown}
    </svg>
  );
};

const SuperAdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!email || !password) { setError('Please enter both email and password'); setLoading(false); return; }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) { setError('No account found. Please sign up first.'); setLoading(false); await auth.signOut(); return; }
      const userData = userDoc.data();
      if (userData.role !== 'super_admin') { setError('Access denied. Super Admin only.'); setLoading(false); await auth.signOut(); return; }
      const token = await user.getIdToken();
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminRole', userData.role);
      localStorage.setItem('userId', user.uid);
      localStorage.setItem('userProfile', JSON.stringify(userData));
      navigate('/super-admin-dashboard');
    } catch (error) {
      setLoading(false);
      switch (error.code) {
        case 'auth/invalid-email': setError('Invalid email address'); break;
        case 'auth/user-not-found': setError('No account found with this email'); break;
        case 'auth/wrong-password': setError('Incorrect password'); break;
        case 'auth/invalid-credential': setError('Invalid email or password'); break;
        default: setError('Failed to log in. Please try again.'); break;
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: palette.cream,
      padding: 'clamp(12px, 3vw, 40px)',
      boxSizing: 'border-box',
      fontFamily: FONT_BODY,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{
        background: palette.white,
        borderRadius: '20px',
        padding: 'clamp(24px, 5vw, 36px)',
        maxWidth: '400px',
        width: '100%',
        boxShadow: `0 10px 40px rgba(42, 40, 69, 0.10), 0 2px 0 ${palette.border}`,
        boxSizing: 'border-box',
        border: `1.5px solid ${palette.border}`,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '16px',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: `${palette.warmOrange}15`,
            border: `1.5px solid ${palette.warmOrange}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="crown" size={28} color={palette.warmOrange} />
          </div>
        </div>

        <h1 style={{
          fontSize: 'clamp(22px, 5vw, 26px)',
          fontWeight: '800',
          textAlign: 'center',
          marginBottom: '6px',
          color: palette.deepNavy,
          fontFamily: FONT_DISPLAY,
          letterSpacing: '-0.5px',
        }}>
          Super Admin
        </h1>
        <p style={{
          fontSize: 'clamp(12px, 3vw, 13px)',
          color: palette.bodyTextSoft,
          textAlign: 'center',
          marginBottom: 'clamp(20px, 4vw, 28px)',
          fontFamily: FONT_BODY,
          fontWeight: '600',
        }}>
          Master system access
        </p>

        {error && (
          <div style={{
            padding: '12px 14px',
            background: `${palette.coral}12`,
            border: `1.5px solid ${palette.coral}40`,
            borderRadius: '10px',
            color: palette.coral,
            marginBottom: '16px',
            fontSize: '12px',
            fontFamily: FONT_BODY,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <Icon name="warning" size={14} color={palette.coral} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: '800',
              marginBottom: '6px',
              color: palette.bodyTextSoft,
              fontFamily: FONT_DISPLAY,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>Email</label>
            <input
              type="email"
              placeholder="Super Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: `1.5px solid ${palette.border}`,
                borderRadius: '10px',
                fontSize: '14px',
                fontFamily: FONT_BODY,
                fontWeight: 600,
                boxSizing: 'border-box',
                outline: 'none',
                backgroundColor: palette.creamSoft,
                color: palette.deepNavy,
                transition: 'border-color 0.15s ease',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: '800',
              marginBottom: '6px',
              color: palette.bodyTextSoft,
              fontFamily: FONT_DISPLAY,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  paddingRight: '44px',
                  border: `1.5px solid ${palette.border}`,
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontFamily: FONT_BODY,
                  fontWeight: 600,
                  boxSizing: 'border-box',
                  outline: 'none',
                  backgroundColor: palette.creamSoft,
                  color: palette.deepNavy,
                }}
              />
              <button
                type="button"
                onClick={() => !loading && setShowPassword(!showPassword)}
                disabled={loading}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name={showPassword ? 'eyeOff' : 'eye'} size={16} color={palette.bodyTextSoft} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px',
              background: palette.warmOrange,
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '800',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'transform 0.1s ease, box-shadow 0.1s ease',
              fontFamily: FONT_DISPLAY,
              boxSizing: 'border-box',
              opacity: loading ? 0.7 : 1,
              boxShadow: `0 3px 0 ${palette.warmOrangeShadow}`,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
            onMouseDown={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(3px)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
            onMouseUp={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 3px 0 ${palette.warmOrangeShadow}`;
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 3px 0 ${palette.warmOrangeShadow}`;
              }
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SuperAdminLogin;