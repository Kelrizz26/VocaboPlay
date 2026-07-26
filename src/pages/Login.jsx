import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { signInWithEmailAndPassword, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

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

  const handleGoogleLogin = async () => {
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
        const userData = userDoc.data();
        const userRole = userData.role || 'student';

        const userProfile = {
          uid: user.uid,
          email: user.email,
          displayName: userData.displayName || user.displayName,
          username: userData.username || user.displayName,
          avatar: userData.avatar || user.photoURL || '👤',
          role: userRole,
          progress: userData.progress || {
            wordsLearned: 0,
            gamesPlayed: 0,
            totalPoints: 0,
            level: 1,
            xp: 0,
            streak: 0,
            correctAnswers: 0,
            totalAnswers: 0,
            flashcards: { cardsViewed: 0, knownWords: [] },
            quiz: { gamesCompleted: 0, correctAnswers: 0, totalQuestions: 0 },
            match: { gamesCompleted: 0, totalPairs: 0, totalMoves: 0 },
            guessWhat: { gamesCompleted: 0, correctAnswers: 0, totalQuestions: 0 },
            sentenceBuilder: { gamesCompleted: 0, correctAnswers: 0, totalSentences: 0 },
            shortStory: { chaptersRead: 0, quizzesPassed: 0 },
            achievements: {
              firstGame: false,
              perfectScore: false,
              threeDayStreak: false,
              tenWords: false,
              masterLearner: false
            }
          },
          settings: userData.settings || {
            emailNotifications: true,
            darkMode: false,
            language: 'en'
          }
        };

        const token = await user.getIdToken();

        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('userProfile', JSON.stringify(userProfile));
        } else {
          sessionStorage.setItem('userProfile', JSON.stringify(userProfile));
        }

        localStorage.setItem('token', token);
        localStorage.setItem('userType', userRole);
        localStorage.setItem('userId', user.uid);

        if (userData.progress) {
          localStorage.setItem('vocaboplay_progress', JSON.stringify(userData.progress));
        }

        if (userRole === 'admin') {
          localStorage.setItem('adminToken', token);
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError('No account found with this Google account. Please sign up first.');
        await auth.signOut();
        setLoading(false);
      }
    } catch (error) {
      console.error('Google Login Error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Login cancelled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        setError('Popup was blocked. Please allow popups for this site.');
      } else {
        setError('Failed to login with Google. Please try again.');
      }
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userRole = userData.role || 'student';

        let userProgress = {
          wordsLearned: 0,
          gamesPlayed: 0,
          totalPoints: 0,
          level: 1,
          xp: 0,
          streak: 0,
          correctAnswers: 0,
          totalAnswers: 0,
          flashcards: { cardsViewed: 0, knownWords: [] },
          quiz: { gamesCompleted: 0, correctAnswers: 0, totalQuestions: 0 },
          match: { gamesCompleted: 0, totalPairs: 0, totalMoves: 0 },
          guessWhat: { gamesCompleted: 0, correctAnswers: 0, totalQuestions: 0 },
          sentenceBuilder: { gamesCompleted: 0, correctAnswers: 0, totalSentences: 0 },
          shortStory: { chaptersRead: 0, quizzesPassed: 0 },
          achievements: {
            firstGame: false,
            perfectScore: false,
            threeDayStreak: false,
            tenWords: false,
            masterLearner: false
          }
        };
        
        try {
          const { getUserProgress } = await import('../services/firebaseService');
          const firebaseProgress = await getUserProgress(user.uid);
          
          if (firebaseProgress) {
            userProgress = firebaseProgress;
            localStorage.setItem('vocaboplay_progress', JSON.stringify(firebaseProgress));
          } else {
            localStorage.removeItem('vocaboplay_progress');
          }
        } catch (progressError) {
          console.error('Error loading progress:', progressError);
          localStorage.removeItem('vocaboplay_progress');
        }

        const userProfile = {
          uid: user.uid,
          email: user.email,
          displayName: userData.displayName || email.split('@')[0],
          username: userData.username || email.split('@')[0],
          avatar: userData.avatar || '👤',
          role: userRole,
          progress: userProgress,
          settings: userData.settings || {
            emailNotifications: true,
            darkMode: false,
            language: 'en'
          }
        };

        const token = await user.getIdToken();

        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('userProfile', JSON.stringify(userProfile));
        } else {
          sessionStorage.setItem('userProfile', JSON.stringify(userProfile));
        }

        localStorage.setItem('token', token);
        localStorage.setItem('userType', userRole);
        localStorage.setItem('userId', user.uid);

        if (userRole === 'admin') {
          localStorage.setItem('adminToken', token);
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError('Account not found. Please contact support.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
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
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetMessage('');
    
    if (!resetEmail) {
      setResetError('Please enter your email address');
      return;
    }

    setResetLoading(true);

    try {
      await sendPasswordResetEmail(auth, resetEmail, {
        url: window.location.origin + '/login',
        handleCodeInApp: false,
      });
      
      setResetMessage('✅ Password reset email sent! Check your inbox.');
      setResetEmail('');
      
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('Password reset error:', error);
      switch (error.code) {
        case 'auth/user-not-found':
          setResetError('No account found with this email');
          break;
        case 'auth/invalid-email':
          setResetError('Invalid email address');
          break;
        default:
          setResetError('Failed to send reset email. Please try again.');
      }
    } finally {
      setResetLoading(false);
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
      maxWidth: '380px',
    },
    title: {
      fontSize: '32px',
      fontWeight: '700',
      color: '#1a1a1a',
      margin: '0 0 8px 0',
    },
    subtitle: {
      fontSize: '14px',
      color: '#666',
      margin: '0 0 30px 0',
      lineHeight: '1.4',
    },
    errorMessage: {
      padding: '12px 14px',
      backgroundColor: '#fee',
      border: '1px solid #fcc',
      borderRadius: '8px',
      color: '#c33',
      fontSize: '13px',
      marginBottom: '20px',
    },
    successMessage: {
      padding: '12px 14px',
      backgroundColor: '#e8f5e9',
      border: '1px solid #a5d6a7',
      borderRadius: '8px',
      color: '#2e7d32',
      fontSize: '13px',
      marginBottom: '20px',
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
    },
    input: {
      padding: '12px 16px',
      border: '1px solid #d0d0d0',
      borderRadius: '10px',
      fontSize: '14px',
      fontFamily: "'Poppins', sans-serif",
      width: '100%',
      boxSizing: 'border-box',
      backgroundColor: 'white',
      color: '#333',
      transition: 'all 0.2s ease',
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
      backgroundColor: 'white',
      color: '#333',
      transition: 'all 0.2s ease',
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
    bottomRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '4px',
      marginBottom: '8px',
    },
    checkbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
    },
    checkboxInput: {
      width: '16px',
      height: '16px',
      cursor: 'pointer',
      accentColor: '#7c6fd6',
    },
    checkboxLabel: {
      fontSize: '13px',
      color: '#666',
      userSelect: 'none',
    },
    forgotPassword: {
      fontSize: '13px',
      color: '#7c6fd6',
      textDecoration: 'none',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'color 0.2s ease',
    },
    loginBtn: {
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
      marginTop: '12px',
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
    signupText: {
      fontSize: '14px',
      color: '#666',
      margin: '16px 0 0 0',
      textAlign: 'center',
    },
    signupLink: {
      color: '#7c6fd6',
      textDecoration: 'none',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'color 0.2s ease',
    },
    divider: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      margin: '4px 0',
    },
    dividerLine: {
      flex: 1,
      height: '1px',
      backgroundColor: '#e0e0e0',
    },
    dividerText: {
      fontSize: '12px',
      color: '#999',
    },
    adminLinkRow: {
      marginTop: '18px',
      paddingTop: '16px',
      borderTop: '1px solid #eee',
      textAlign: 'center',
    },
    adminLinkText: {
      fontSize: '13px',
      color: '#888',
    },
    adminLink: {
      color: '#7c6fd6',
      textDecoration: 'none',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'color 0.2s ease',
    },
    modalOverlay: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      backdropFilter: 'blur(4px)',
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '20px',
      padding: '30px',
      maxWidth: '400px',
      width: '90%',
      boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      fontFamily: "'Poppins', sans-serif",
    },
    modalTitle: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#1a1a1a',
      margin: '0 0 8px 0',
      textAlign: 'center',
    },
    modalSubtitle: {
      fontSize: '14px',
      color: '#666',
      margin: '0 0 24px 0',
      textAlign: 'center',
    },
    modalActions: {
      display: 'flex',
      gap: '12px',
      marginTop: '20px',
    },
    modalCancelBtn: {
      flex: 1,
      padding: '12px',
      backgroundColor: '#f0f0f0',
      color: '#333',
      border: 'none',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      fontFamily: "'Poppins', sans-serif",
      transition: 'background 0.2s ease',
    },
    modalSendBtn: {
      flex: 1,
      padding: '12px',
      backgroundColor: '#7c6fd6',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      fontFamily: "'Poppins', sans-serif",
      transition: 'all 0.2s ease',
    },
    // RIGHT SIDE STYLES (mirrors Signup.jsx)
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
      lineHeight: '1.2',
    },
    illustrationSubtitle: {
      fontSize: '22px',
      fontWeight: '700',
      opacity: 0.95,
    },
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
          * {
            box-sizing: border-box;
          }
          body {
            font-family: 'Poppins', sans-serif !important;
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

          /* --- Mascot stage animations (Blooket-style), same as Signup --- */
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

      <div 
        className={`overlay ${isMenuOpen ? 'active' : ''}`}
        onClick={() => setIsMenuOpen(false)}
      ></div>

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
        padding: '15px 40px',
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
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: '800', fontSize: '22px' }}>
              VocaboPlay
            </div>
          </div>

          <div className="nav-desktop" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '20px'
          }}>
            <button
              onClick={() => navigate('/signup')}
              style={{
                background: 'linear-gradient(135deg, #7c6fd6 0%, #9b8de8 100%)',
                color: 'white',
                border: 'none',
                padding: '10px 28px',
                borderRadius: '30px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(124, 111, 214, 0.3)',
                fontFamily: "'Poppins', sans-serif",
                transition: 'all 0.3s ease'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Sign Up
            </button>
          </div>

          <button 
            className="hamburger"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>

          <div className={`nav-mobile ${isMenuOpen ? 'open' : ''}`}>
            <button
              className="login-btn"
              onClick={() => {
                navigate('/signup');
                setIsMenuOpen(false);
              }}
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content - Split Screen (mirrors Signup.jsx) */}
      <div style={styles.splitContainer} className="split-container">
        {/* LEFT SIDE - Login Form */}
        <div style={styles.leftSide} className="left-side">
          <div style={styles.cardWrapper} className="animate-slide-up">
            <h1 style={styles.title}>Log in</h1>
            <p style={styles.subtitle}>Log in to continue your vocabulary journey</p>

            {error && <div style={styles.errorMessage}>{error}</div>}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Email Address</label>
                <input
                  type="email"
                  placeholder="Enter your email"
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
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
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

              <div style={styles.bottomRow}>
                <label style={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={styles.checkboxInput}
                    disabled={loading}
                  />
                  <span style={styles.checkboxLabel}>Remember me</span>
                </label>
                <a 
                  href="#"
                  style={styles.forgotPassword}
                  onClick={(e) => {
                    e.preventDefault();
                    setShowForgotPassword(true);
                    setResetEmail(email || '');
                  }}
                >
                  Forgot Password?
                </a>
              </div>

              <button 
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
                {loading ? 'Logging in...' : "Let's go!"}
              </button>
            </form>

            <div style={styles.divider}>
              <span style={styles.dividerLine}></span>
              <span style={styles.dividerText}>or</span>
              <span style={styles.dividerLine}></span>
            </div>

            <button
              onClick={handleGoogleLogin}
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
              {loading ? 'Signing in...' : 'Google'}
            </button>

            <p style={styles.signupText}>
              Don't have an account? <a onClick={() => !loading && navigate('/signup')} style={{
                ...styles.signupLink,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1
              }}>Sign Up</a>
            </p>

            {/* Admin access - separate flow, login only, no signup */}
            <div style={styles.adminLinkRow}>
              <span style={styles.adminLinkText}>
                Admin?{' '}
                <a
                  onClick={() => !loading && navigate('/admin')}
                  style={{
                    ...styles.adminLink,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.5 : 1
                  }}
                  onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  Log in here
                </a>
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - Blooket-style animated mascot illustration (same as Signup.jsx) */}
        <div style={styles.rightSide} className="animate-fade-in right-side">
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

            <h2 style={styles.illustrationTitle}>Welcome back,</h2>
            <p style={styles.illustrationSubtitle}>let's keep learning.</p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div style={styles.modalOverlay} onClick={() => setShowForgotPassword(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Reset Password</h2>
            <p style={styles.modalSubtitle}>
              Enter your email address and we'll send you a link to reset your password.
            </p>

            {resetError && <div style={styles.errorMessage}>{resetError}</div>}
            {resetMessage && <div style={styles.successMessage}>{resetMessage}</div>}

            <form onSubmit={handleForgotPassword}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Email Address</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  style={styles.input}
                  required
                  disabled={resetLoading}
                />
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.modalCancelBtn}
                  onClick={() => setShowForgotPassword(false)}
                  disabled={resetLoading}
                  onMouseOver={(e) => e.currentTarget.style.background = '#e0e0e0'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#f0f0f0'}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    ...styles.modalSendBtn,
                    opacity: resetLoading ? 0.7 : 1,
                    cursor: resetLoading ? 'not-allowed' : 'pointer',
                  }}
                  disabled={resetLoading}
                  onMouseOver={(e) => !resetLoading && (e.currentTarget.style.background = '#6b5ec5')}
                  onMouseOut={(e) => e.currentTarget.style.background = '#7c6fd6'}
                >
                  {resetLoading ? 'Sending...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;