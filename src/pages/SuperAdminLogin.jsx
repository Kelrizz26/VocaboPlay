import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from "./firebase";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const SuperAdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ===== WARM & FRIENDLY PALETTE (Matched to Mascots) =====
  const palette = {
    warmOrange: '#F4A261',
    warmOrangeShadow: '#C77E3E',
    coral: '#E76F51',
    coralShadow: '#B54A32',
    teal: '#2A9D8F',
    tealShadow: '#1E7268',
    deepNavy: '#2D2A5E',
    bodyText: '#5A587A',
    cream: '#FFF8F0',
    white: '#FFFFFF',
    border: '#E2E8F0',
  };

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

  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `linear-gradient(135deg, ${palette.cream} 0%, #FFE8D6 100%)`,
    padding: 'clamp(12px, 3vw, 40px)',
    boxSizing: 'border-box',
    fontFamily: "'Nunito', sans-serif",
  };

  const cardStyle = {
    background: 'white',
    borderRadius: 'clamp(16px, 3vw, 24px)',
    padding: 'clamp(24px, 5vw, 40px)',
    maxWidth: '400px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(45, 42, 94, 0.25)',
    boxSizing: 'border-box',
    border: `2px solid ${palette.border}`,
  };

  const titleStyle = {
    fontSize: 'clamp(22px, 5vw, 28px)',
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: '8px',
    color: palette.deepNavy,
    fontFamily: "'Fredoka', sans-serif",
    letterSpacing: '-0.5px',
  };

  const subtitleStyle = {
    fontSize: 'clamp(12px, 3vw, 14px)',
    color: palette.bodyText,
    textAlign: 'center',
    marginBottom: 'clamp(20px, 4vw, 30px)',
    fontFamily: "'Nunito', sans-serif",
    fontWeight: '600',
  };

  const errorStyle = {
    padding: 'clamp(8px, 2vw, 10px)',
    background: '#fee',
    border: '1px solid #fcc',
    borderRadius: '12px',
    color: '#c33',
    marginBottom: 'clamp(12px, 3vw, 20px)',
    fontSize: 'clamp(12px, 3vw, 13px)',
    fontFamily: "'Nunito', sans-serif",
    fontWeight: '600',
  };

  const labelStyle = {
    display: 'block',
    fontSize: 'clamp(12px, 3vw, 13px)',
    fontWeight: '700',
    marginBottom: '8px',
    color: palette.deepNavy,
    fontFamily: "'Fredoka', sans-serif",
  };

  const inputStyle = {
    width: '100%',
    padding: 'clamp(12px, 3vw, 14px)',
    border: `2px solid ${palette.border}`,
    borderRadius: '12px',
    fontSize: 'clamp(14px, 3.5vw, 15px)',
    fontFamily: "'Nunito', sans-serif",
    fontWeight: '600',
    boxSizing: 'border-box',
    outline: 'none',
    backgroundColor: 'white',
    color: palette.deepNavy,
  };

  const passwordInputStyle = {
    ...inputStyle,
    paddingRight: '45px',
  };

  const buttonStyle = {
    width: '100%',
    padding: 'clamp(14px, 3.5vw, 16px)',
    background: palette.warmOrange,
    color: 'white',
    border: 'none',
    borderRadius: '16px',
    fontSize: 'clamp(14px, 3.5vw, 16px)',
    fontWeight: '800',
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'transform 0.12s ease, box-shadow 0.12s ease',
    fontFamily: "'Fredoka', sans-serif",
    boxSizing: 'border-box',
    opacity: loading ? 0.7 : 1,
    touchAction: 'manipulation',
    boxShadow: `0 5px 0 ${palette.warmOrangeShadow}, 0 8px 16px rgba(45,42,94,0.25)`,
    letterSpacing: '0.5px',
  };

  return (
    <div style={containerStyle}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;500;600;700;800&display=swap');
        `}
      </style>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Super Admin</h1>
        <p style={subtitleStyle}>Master system access</p>

        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 'clamp(14px, 3vw, 16px)' }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              placeholder="Super Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              autoComplete="email"
              required
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: 'clamp(20px, 4vw, 24px)' }}>
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={passwordInputStyle}
                autoComplete="current-password"
                required
                disabled={loading}
              />
              <span
                onClick={() => !loading && setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: 'clamp(16px, 4vw, 18px)',
                  userSelect: 'none',
                }}
              >
                {showPassword ? '' : ''}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={buttonStyle}
            onMouseDown={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(3px)';
                e.currentTarget.style.boxShadow = `0 2px 0 ${palette.warmOrangeShadow}, 0 4px 10px rgba(45,42,94,0.2)`;
              }
            }}
            onMouseUp={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 5px 0 ${palette.warmOrangeShadow}, 0 8px 16px rgba(45,42,94,0.25)`;
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 5px 0 ${palette.warmOrangeShadow}, 0 8px 16px rgba(45,42,94,0.25)`;
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