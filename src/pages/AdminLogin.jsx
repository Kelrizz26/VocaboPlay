import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from "./firebase";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // ← ADDED

  const logoTextStyle = {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: '800',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userRole = userData.role;

        if (userRole !== 'admin') {
          setError('Access denied. This account is not an admin account.');
          setLoading(false);
          await auth.signOut();
          return;
        }

        const token = await user.getIdToken();
        localStorage.setItem('adminToken', token);
        localStorage.setItem('userType', 'admin');
        localStorage.setItem('userId', user.uid);
        
        navigate('/admin/dashboard');
      } else {
        setError('User data not found. Please contact support.');
        setLoading(false);
      }

    } catch (error) {
      setLoading(false);
      
      switch (error.code) {
        case 'auth/invalid-email':
          setError('Invalid email address');
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled');
          break;
        case 'auth/user-not-found':
          setError('No account found with this email');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password');
          break;
        case 'auth/invalid-credential':
          setError('Invalid email or password');
          break;
        default:
          setError('Failed to log in. Please try again.');
          console.error('Admin login error:', error);
      }
    }
  };

  const EyeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );

  const EyeOffIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  );

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Tilt+Warp:wght@400;800&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
          
          * {
            box-sizing: border-box;
          }

          /* ===== ADDED FOR MOBILE ===== */
          .hamburger {
            display: none;
            background: none;
            border: none;
            font-size: 28px;
            cursor: pointer;
            color: #333;
            padding: 8px;
            z-index: 1001;
          }
          
          .overlay {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            z-index: 999;
          }
          
          .overlay.active {
            display: block;
          }
          
          .nav-mobile {
            display: none !important;
          }

          @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .animate-slide-up {
            animation: slideUp 0.6s ease-out forwards;
          }

          .animate-fade-in {
            animation: fadeIn 0.8s ease-out forwards;
          }

          /* --- Mascot stage animations (Blooket-style), same as Signup/Login --- */
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

          .split-container {
            display: flex;
            min-height: 100vh;
            padding-top: 80px;
            background: #f5f3f8;
            overflow: hidden;
          }

          .left-side {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 60px;
            background: #f5f3f8;
            min-height: calc(100vh - 80px);
          }

          .right-side {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #7c6fd6 0%, #9b8de8 100%);
            padding: 40px;
            position: relative;
            overflow: hidden;
            min-height: calc(100vh - 80px);
          }
          
          @media (max-width: 768px) {
            .admin-card {
              padding: 30px 20px !important;
              max-width: 100% !important;
              margin: 0 !important;
            }
            .admin-title {
              font-size: 28px !important;
            }
            .admin-subtitle {
              font-size: 13px !important;
            }
            .admin-input {
              padding: 10px 14px !important;
              font-size: 13px !important;
            }
            .admin-btn {
              padding: 12px 20px !important;
              font-size: 14px !important;
            }
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
            .nav-mobile button {
              width: 100%;
              text-align: left;
              padding: 15px 0;
              font-size: 16px !important;
              border-bottom: 1px solid #f0f0f0;
              background: none;
              border: none;
              cursor: pointer;
              font-family: 'Poppins', sans-serif;
              color: #333;
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
            }
            .admin-nav {
              padding: 15px 20px !important;
            }

            .split-container {
              flex-direction: column !important;
              padding-top: 70px !important;
            }

            .left-side {
              width: 100% !important;
              padding: 30px 20px !important;
              min-height: auto !important;
            }

            .right-side {
              display: none !important;
            }
          }
          
          @media (max-width: 480px) {
            .admin-card {
              padding: 20px 16px !important;
              margin: 0 !important;
            }
            .admin-title {
              font-size: 24px !important;
            }
          }

          /* Tablet */
          @media (min-width: 769px) and (max-width: 1024px) {
            .mascot-svg-wrap {
              width: 150px !important;
              height: 150px !important;
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

      {/* ===== OVERLAY (ADDED) ===== */}
      <div 
        className={`overlay ${isMenuOpen ? 'active' : ''}`}
        onClick={() => setIsMenuOpen(false)}
      ></div>

      {/* ===== NAVBAR ===== */}
      <nav className="admin-nav" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(245, 243, 248, 0.95)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.05)',
        zIndex: 1000,
        padding: '15px 40px',
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          {/* Logo */}
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
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{ ...logoTextStyle, fontSize: '22px' }}>
              VocaboPlay
            </div>
          </div>

        </div>
      </nav>

      {/* Main Content - Split Screen (mirrors Signup.jsx / Login.jsx) */}
      <div className="split-container">
        {/* LEFT SIDE - Admin Login Form */}
        <div className="left-side">
          <div className="admin-card animate-slide-up" style={styles.card}>
            <h1 className="admin-title" style={styles.title}>Admin</h1>
            <p className="admin-subtitle" style={styles.subtitle}>Access the VocaboPlay admin panel</p>

            {error && <div style={styles.errorMessage}>{error}</div>}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Email</label>
                <input
                  className="admin-input"
                  type="email"
                  placeholder="Enter your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input}
                  required
                  disabled={loading}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Password</label>
                <div style={styles.passwordWrapper}>
                  <input
                    className="admin-input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={styles.passwordInput}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    style={styles.showPasswordBtn}
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <button
                className="admin-btn"
                type="submit"
                style={{
                  ...styles.loginBtn,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
                onMouseOver={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(124, 111, 214, 0.4)';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(124, 111, 214, 0.2)';
                }}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Log in'}
              </button>

              <p style={styles.backText}>
                Not an admin? <a 
                  onClick={() => !loading && navigate('/login')} 
                  style={{
                    ...styles.backLink,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.5 : 1
                  }}
                >
                  User Login
                </a>
              </p>
            </form>
          </div>
        </div>

        {/* RIGHT SIDE - Blooket-style animated mascot illustration (same as Signup.jsx / Login.jsx) */}
        <div className="right-side animate-fade-in">
          <div className="bg-pattern"></div>

          <span className="bg-sparkle" style={{ width: 6, height: 6, top: '14%', left: '18%', animationDelay: '0s' }}></span>
          <span className="bg-sparkle" style={{ width: 4, height: 4, top: '22%', right: '20%', animationDelay: '0.6s' }}></span>
          <span className="bg-sparkle" style={{ width: 5, height: 5, top: '68%', left: '12%', animationDelay: '1.1s' }}></span>
          <span className="bg-sparkle" style={{ width: 7, height: 7, top: '76%', right: '16%', animationDelay: '1.6s' }}></span>
          <span className="bg-sparkle" style={{ width: 4, height: 4, top: '40%', left: '8%', animationDelay: '0.3s' }}></span>
          <span className="bg-sparkle" style={{ width: 5, height: 5, top: '10%', right: '10%', animationDelay: '2s' }}></span>

          <span className="confetti-dot" style={{ width: 10, height: 10, background: '#ff6b6b', top: '20%', left: '30%', animationDelay: '0s' }}></span>
          <span className="confetti-dot" style={{ width: 8, height: 8, background: '#4ecdc4', top: '18%', right: '28%', animationDelay: '0.4s' }}></span>
          <span className="confetti-dot" style={{ width: 9, height: 9, background: '#ffd93d', top: '30%', right: '18%', animationDelay: '0.8s', borderRadius: '50%' }}></span>
          <span className="confetti-dot" style={{ width: 7, height: 7, background: '#a685e2', top: '26%', left: '20%', animationDelay: '1.2s', borderRadius: '50%' }}></span>
          <span className="confetti-dot" style={{ width: 9, height: 9, background: '#ff9f43', top: '34%', left: '38%', animationDelay: '0.6s' }}></span>

          <div style={styles.illustrationContainer}>
            <div style={styles.mascotStageWrap}>
              <div className="mascot-stage mascot-svg-wrap" style={styles.mascotSvgWrap}>
                <div className="mascot-squash">
                  <svg viewBox="0 0 200 200" width="100%" height="100%">
                    <path d="M75 55 C 68 30, 60 20, 55 25 C 58 40, 65 52, 75 62 Z" fill="#5b4fa8" />
                    <path d="M125 55 C 132 30, 140 20, 145 25 C 142 40, 135 52, 125 62 Z" fill="#5b4fa8" />

                    <g className="mascot-ear-left">
                      <ellipse cx="62" cy="78" rx="14" ry="20" fill="#c9c3ee" />
                      <ellipse cx="62" cy="78" rx="7" ry="12" fill="#e9d9e6" />
                    </g>
                    <g className="mascot-ear-right">
                      <ellipse cx="138" cy="78" rx="14" ry="20" fill="#c9c3ee" />
                      <ellipse cx="138" cy="78" rx="7" ry="12" fill="#e9d9e6" />
                    </g>

                    <ellipse cx="100" cy="150" rx="48" ry="34" fill="#c3bdf0" />
                    <rect x="70" y="165" width="14" height="22" rx="7" fill="#a89ce6" />
                    <rect x="116" y="165" width="14" height="22" rx="7" fill="#a89ce6" />

                    <ellipse cx="100" cy="95" rx="42" ry="38" fill="#d6d1f6" />
                    <ellipse cx="100" cy="112" rx="18" ry="12" fill="#eae5fb" />

                    <g className="mascot-eyes">
                      <circle cx="84" cy="92" r="9" fill="#2b2b3d" />
                      <circle cx="116" cy="92" r="9" fill="#2b2b3d" />
                      <circle cx="87" cy="89" r="2.5" fill="white" />
                      <circle cx="119" cy="89" r="2.5" fill="white" />
                    </g>

                    <ellipse cx="74" cy="104" rx="6" ry="4" fill="#f2b3c9" opacity="0.7" />
                    <ellipse cx="126" cy="104" rx="6" ry="4" fill="#f2b3c9" opacity="0.7" />

                    <path d="M92 116 Q100 121 108 116" stroke="#8b7fc7" strokeWidth="2.5" fill="none" strokeLinecap="round" />

                    <circle cx="95" cy="110" r="1.4" fill="#8b7fc7" />
                    <circle cx="105" cy="110" r="1.4" fill="#8b7fc7" />
                  </svg>
                </div>
              </div>

              <div style={styles.platformWrap}>
                <div className="platform-glow" style={styles.platformGlow}></div>
                <div style={styles.platform}></div>
              </div>
            </div>

            <h2 style={styles.illustrationTitle}>Admin control,</h2>
            <p style={styles.illustrationSubtitle}>keep VocaboPlay running smoothly.</p>
          </div>
        </div>
      </div>
    </>
  );
};

const styles = {
  card: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '20px 30px',
    width: '100%',
    maxWidth: '350px',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
  },
  title: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 8px 0',
    textAlign: 'center',
    fontFamily: "'Poppins', sans-serif",
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    margin: '0 0 30px 0',
    textAlign: 'center',
    lineHeight: '1.4',
    fontFamily: "'Poppins', sans-serif",
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
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
  },
  passwordWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  passwordInput: {
    padding: '12px 16px',
    paddingRight: '45px',
    border: '1px solid #d0d0d0',
    borderRadius: '10px',
    fontSize: '14px',
    fontFamily: "'Poppins', sans-serif",
    width: '100%',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
    backgroundColor: 'white',
    color: '#333',
  },
  showPasswordBtn: {
    position: 'absolute',
    right: '14px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
    transition: 'color 0.2s ease',
  },
  errorMessage: {
    padding: '12px 14px',
    backgroundColor: '#fee',
    border: '1px solid #fcc',
    borderRadius: '8px',
    color: '#c33',
    fontSize: '13px',
    marginBottom: '12px',
    fontFamily: "'Poppins', sans-serif",
  },
  loginBtn: {
    padding: '14px 28px',
    backgroundColor: '#7c6fd6',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '12px',
    fontFamily: "'Poppins', sans-serif",
    boxShadow: '0 4px 15px rgba(124, 111, 214, 0.2)',
  },
  backText: {
    fontSize: '14px',
    color: '#666',
    margin: '20px 0 0 0',
    textAlign: 'center',
    fontFamily: "'Poppins', sans-serif",
  },
  backLink: {
    color: '#7c6fd6',
    textDecoration: 'none',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
    fontFamily: "'Poppins', sans-serif",
  },
  // RIGHT SIDE STYLES (mirrors Signup.jsx / Login.jsx)
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

export default AdminLogin;