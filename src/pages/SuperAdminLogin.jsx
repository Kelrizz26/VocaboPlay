// src/pages/SuperAdminLogin.jsx
// ============================================================
// ✅ SUPER ADMIN LOGIN - Fully Responsive Mobile Version
// ============================================================

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
    arrowLeft: (
      <>
        <path d="M19 12H5M12 19l-7-7 7-7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
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
    <div className="sal-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;500;600;700;800&display=swap');

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        /* ============ PAGE ============ */
        .sal-page {
          min-height: 100vh;
          min-height: 100dvh; /* modern mobile browsers */
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${palette.cream};
          padding: clamp(16px, 4vw, 40px);
          padding-top: max(clamp(16px, 4vw, 40px), env(safe-area-inset-top));
          padding-bottom: max(clamp(16px, 4vw, 40px), env(safe-area-inset-bottom));
          padding-left: max(clamp(16px, 4vw, 40px), env(safe-area-inset-left));
          padding-right: max(clamp(16px, 4vw, 40px), env(safe-area-inset-right));
          box-sizing: border-box;
          font-family: ${FONT_BODY};
          position: relative;
          overflow-x: hidden;
        }

        /* ============ BACK BUTTON ============ */
        .sal-back {
          position: fixed;
          top: max(16px, env(safe-area-inset-top));
          left: max(16px, env(safe-area-inset-left));
          padding: 10px 16px;
          background: ${palette.white};
          color: ${palette.deepNavy};
          border: 1.5px solid ${palette.border};
          border-radius: 12px;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          font-family: ${FONT_DISPLAY};
          box-shadow: 0 3px 0 ${palette.border};
          transition: transform 0.1s ease, box-shadow 0.1s ease, border-color 0.15s ease, color 0.15s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          z-index: 100;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        .sal-back:hover { border-color: ${palette.warmOrange}; color: ${palette.warmOrange}; }
        .sal-back:active {
          transform: translateY(3px);
          box-shadow: none;
        }

        /* ============ CARD ============ */
        .sal-card {
          background: ${palette.white};
          border-radius: 20px;
          padding: clamp(24px, 6vw, 36px);
          max-width: 420px;
          width: 100%;
          box-shadow: 0 10px 40px rgba(42, 40, 69, 0.10), 0 2px 0 ${palette.border};
          box-sizing: border-box;
          border: 1.5px solid ${palette.border};
          animation: fadeIn 0.4s ease-out;
        }

        /* ============ INPUTS ============ */
        .sal-input {
          width: 100%;
          padding: 13px 14px;
          border: 1.5px solid ${palette.border};
          border-radius: 10px;
          font-size: 16px; /* ✅ prevents iOS auto-zoom on focus */
          font-family: ${FONT_BODY};
          font-weight: 600;
          box-sizing: border-box;
          outline: none;
          background-color: ${palette.creamSoft};
          color: ${palette.deepNavy};
          transition: border-color 0.15s ease, background-color 0.15s ease;
          -webkit-appearance: none;
          appearance: none;
        }
        .sal-input:focus {
          border-color: ${palette.warmOrange};
          background-color: ${palette.white};
        }
        .sal-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .sal-input::placeholder {
          color: ${palette.bodyTextSoft};
          font-weight: 500;
        }

        /* ============ SUBMIT BUTTON ============ */
        .sal-submit {
          width: 100%;
          padding: 14px;
          min-height: 48px; /* ✅ touch-friendly */
          background: ${palette.warmOrange};
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          transition: transform 0.1s ease, box-shadow 0.1s ease, opacity 0.15s ease;
          font-family: ${FONT_DISPLAY};
          box-sizing: border-box;
          box-shadow: 0 3px 0 ${palette.warmOrangeShadow};
          letter-spacing: 0.05em;
          text-transform: uppercase;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        .sal-submit:not(:disabled):active {
          transform: translateY(3px);
          box-shadow: none;
        }
        .sal-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* ============ PASSWORD TOGGLE ============ */
        .sal-toggle {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px; /* ✅ bigger tap target */
          display: flex;
          align-items: center;
          justify-content: center;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          border-radius: 8px;
          transition: background-color 0.15s ease;
        }
        .sal-toggle:hover { background-color: ${palette.creamSoft}; }
        .sal-toggle:disabled { cursor: not-allowed; }

        /* ============ MOBILE TWEAKS ============ */
        @media (max-width: 480px) {
          .sal-page {
            align-items: flex-start;
            padding-top: 80px; /* space for back button */
          }
          .sal-back {
            padding: 8px 12px;
            font-size: 12px;
            gap: 6px;
          }
          .sal-card {
            border-radius: 16px;
          }
        }

        /* ============ TINY PHONES ============ */
        @media (max-width: 360px) {
          .sal-page {
            padding-left: 14px;
            padding-right: 14px;
          }
          .sal-back {
            padding: 7px 10px;
            font-size: 11px;
          }
        }

        /* ============ LANDSCAPE MOBILE ============ */
        @media (max-height: 500px) and (orientation: landscape) {
          .sal-page {
            align-items: flex-start;
            padding-top: 70px;
            padding-bottom: 24px;
          }
          .sal-card {
            max-width: 460px;
          }
        }

        /* ============ REDUCED MOTION ============ */
        @media (prefers-reduced-motion: reduce) {
          .sal-card { animation: none; }
        }
      `}</style>

      {/* ✅ BACK BUTTON */}
      <button
        className="sal-back"
        onClick={() => navigate('/admin')}
        aria-label="Go back"
      >
        <Icon name="arrowLeft" size={16} color="currentColor" />
        Back
      </button>

      <div className="sal-card">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
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
          fontSize: 'clamp(22px, 5.5vw, 26px)',
          fontWeight: '800',
          textAlign: 'center',
          margin: '0 0 6px',
          color: palette.deepNavy,
          fontFamily: FONT_DISPLAY,
          letterSpacing: '-0.5px',
        }}>
          Super Admin
        </h1>
        <p style={{
          fontSize: 'clamp(12px, 3.2vw, 13px)',
          color: palette.bodyTextSoft,
          textAlign: 'center',
          margin: '0 0 clamp(20px, 5vw, 28px)',
          fontFamily: FONT_BODY,
          fontWeight: '600',
        }}>
          Master system access
        </p>

        {error && (
          <div
            role="alert"
            style={{
              padding: '12px 14px',
              background: `${palette.coral}12`,
              border: `1.5px solid ${palette.coral}40`,
              borderRadius: '10px',
              color: palette.coral,
              marginBottom: '16px',
              fontSize: '12.5px',
              fontFamily: FONT_BODY,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              lineHeight: 1.4,
            }}
          >
            <Icon name="warning" size={16} color={palette.coral} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: '14px' }}>
            <label
              htmlFor="sa-email"
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: '800',
                marginBottom: '6px',
                color: palette.bodyTextSoft,
                fontFamily: FONT_DISPLAY,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Email
            </label>
            <input
              id="sa-email"
              className="sal-input"
              type="email"
              inputMode="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              placeholder="Super Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="sa-password"
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: '800',
                marginBottom: '6px',
                color: palette.bodyTextSoft,
                fontFamily: FONT_DISPLAY,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="sa-password"
                className="sal-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={loading}
                style={{ paddingRight: '48px' }}
              />
              <button
                type="button"
                className="sal-toggle"
                onClick={() => !loading && setShowPassword(!showPassword)}
                disabled={loading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                <Icon name={showPassword ? 'eyeOff' : 'eye'} size={18} color={palette.bodyTextSoft} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="sal-submit"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SuperAdminLogin;