import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';

const Landing = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const logoTextStyle = {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: '800',
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
          
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Poppins', sans-serif; 
            background-color: #f5f5f7;
            overflow-x: hidden;
          }
          
          img {
            max-width: 100%;
            height: auto;
          }
          
          /* ===== ANIMATIONS ===== */
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
          }
          @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(-50px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes slideInRight {
            from { opacity: 0; transform: translateX(50px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          @keyframes heroFloat1 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(-25px, 25px) scale(1.08); }
          }
          @keyframes heroFloat2 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(30px, -30px) scale(1.12); }
          }
          @keyframes heroFloat3 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(15px, 15px) scale(0.95); }
          }
          @keyframes float1 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(-30px, 30px) scale(1.1); }
          }
          @keyframes float2 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(40px, -40px) scale(1.15); }
          }
          @keyframes float3 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(20px, 20px) scale(0.9); }
          }
          @keyframes ctaFloat1 {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            25% { transform: translate(10px, -15px) rotate(5deg); }
            50% { transform: translate(-15px, -25px) rotate(-5deg); }
            75% { transform: translate(15px, -10px) rotate(3deg); }
          }
          @keyframes ctaFloat2 {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            33% { transform: translate(-20px, 15px) rotate(-8deg); }
            66% { transform: translate(20px, -15px) rotate(8deg); }
          }
          @keyframes ctaFloat3 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(-10px, 20px) scale(1.15); }
          }
          @keyframes sparkle {
            0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.6; }
            50% { transform: scale(1.3) rotate(180deg); opacity: 1; }
          }
          
          .animate-fade-in { animation: fadeIn 0.8s ease-out; }
          .animate-bounce-custom { animation: bounce 2s ease-in-out infinite; }
          .animate-slide-left { animation: slideInLeft 0.8s ease-out; }
          .animate-slide-right { animation: slideInRight 0.8s ease-out; }
          .animate-pulse-custom { animation: pulse 2s ease-in-out infinite; }
          
          /* ===== RESPONSIVE GRID ===== */
          .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 60px;
            align-items: center;
          }
          
          .grid-3 {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 40px;
            align-items: center;
          }
          
          @media (max-width: 992px) {
            .grid-2 {
              grid-template-columns: 1fr;
              gap: 40px;
              text-align: center;
            }
            .grid-3 {
              grid-template-columns: 1fr 1fr;
              gap: 30px;
            }
            .grid-3 > div:last-child {
              grid-column: span 2;
            }
          }
          
          @media (max-width: 768px) {
            .grid-3 {
              grid-template-columns: 1fr;
              gap: 20px;
            }
            .grid-3 > div:last-child {
              grid-column: span 1;
            }
          }

          /* ===== STATS STRIP ===== */
          .stats-strip {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            max-width: 900px;
            margin: 64px auto 0;
            position: relative;
            z-index: 1;
          }
          @media (max-width: 768px) {
            .stats-strip {
              grid-template-columns: repeat(2, 1fr);
              gap: 16px;
              margin-top: 48px;
            }
          }

          /* ===== GAMES SHOWCASE GRID ===== */
          .games-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
          }
          @media (max-width: 992px) {
            .games-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }
          @media (max-width: 560px) {
            .games-grid {
              grid-template-columns: 1fr;
            }
          }

          /* ===== FEATURES 4-CARD GRID ===== */
          .grid-4 {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
          }
          @media (max-width: 992px) {
            .grid-4 {
              grid-template-columns: repeat(2, 1fr);
            }
          }
          @media (max-width: 480px) {
            .grid-4 {
              grid-template-columns: 1fr;
            }
          }

          .feature-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .feature-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 12px 30px rgba(108, 92, 231, 0.18);
          }

          .game-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .game-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 16px 36px rgba(108, 92, 231, 0.22);
          }

          /* ===== HAMBURGER MENU ===== */
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
              background: linear-gradient(135deg, #6C5CE7 0%, #8B7FEE 100%) !important;
              color: white !important;
              border: none !important;
              padding: 14px !important;
              border-radius: 30px !important;
              font-weight: 600 !important;
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
            
            /* Hide floating decorations on mobile */
            .float-decor {
              display: none !important;
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
        `}
      </style>

      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #ffffff 0%, #ffffff 100%)' }}>
        
        {/* ===== OVERLAY ===== */}
        <div 
          className={`overlay ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(false)}
        ></div>
        
        {/* ===== NAVBAR ===== */}
        <nav style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 2px 20px rgba(0,0,0,0.05)',
          zIndex: 1000,
          padding: isScrolled ? '10px 20px' : '15px 20px',
          transition: 'all 0.3s ease',
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            {/* Logo */}
            <div style={{
              background: 'linear-gradient(135deg, #6C5CE7 0%, #8B7FEE 100%)',
              color: 'white',
              padding: isScrolled ? '8px 20px' : '12px 28px',
              borderRadius: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(108, 92, 231, 0.3)',
              transition: 'all 0.3s ease',
              flexShrink: 0,
            }}>
              <div style={{ 
                ...logoTextStyle, 
                fontSize: isScrolled ? '16px' : '20px', 
                transition: 'all 0.3s ease' 
              }}>
                VocaboPlay
              </div>
            </div>

       {/* ===== DESKTOP NAV ===== */}
            <div className="nav-desktop" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '24px'
            }}>
              <button
                onClick={() => scrollToSection('about')}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  fontSize: isScrolled ? '14px' : '15px', 
                  fontWeight: '500', 
                  color: '#555', 
                  fontFamily: "'Poppins', sans-serif", 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseOver={e => e.currentTarget.style.color = '#6C5CE7'}
                onMouseOut={e => e.currentTarget.style.color = '#555'}
              >
                <svg width={isScrolled ? "14" : "16"} height={isScrolled ? "14" : "16"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                About
              </button>
              <button
                onClick={() => scrollToSection('why')}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  fontSize: isScrolled ? '14px' : '15px', 
                  fontWeight: '500', 
                  color: '#555', 
                  fontFamily: "'Poppins', sans-serif", 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseOver={e => e.currentTarget.style.color = '#6C5CE7'}
                onMouseOut={e => e.currentTarget.style.color = '#555'}
              >
                <svg width={isScrolled ? "14" : "16"} height={isScrolled ? "14" : "16"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                Why
              </button>
              <button
                onClick={() => scrollToSection('how')}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  fontSize: isScrolled ? '14px' : '15px', 
                  fontWeight: '500', 
                  color: '#555', 
                  fontFamily: "'Poppins', sans-serif", 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseOver={e => e.currentTarget.style.color = '#6C5CE7'}
                onMouseOut={e => e.currentTarget.style.color = '#555'}
              >
                <svg width={isScrolled ? "14" : "16"} height={isScrolled ? "14" : "16"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"/>
                  <line x1="8" y1="12" x2="21" y2="12"/>
                  <line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/>
                  <line x1="3" y1="12" x2="3.01" y2="12"/>
                  <line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
                How
              </button>
              <button
                onClick={() => scrollToSection('start')}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  fontSize: isScrolled ? '14px' : '15px', 
                  fontWeight: '500', 
                  color: '#555', 
                  fontFamily: "'Poppins', sans-serif", 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseOver={e => e.currentTarget.style.color = '#6C5CE7'}
                onMouseOut={e => e.currentTarget.style.color = '#555'}
              >
                <svg width={isScrolled ? "14" : "16"} height={isScrolled ? "14" : "16"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                Start Now
              </button>
              <button
                onClick={() => navigate('/login')}
                style={{
                  background: 'linear-gradient(135deg, #6C5CE7 0%, #8B7FEE 100%)',
                  color: 'white',
                  border: 'none',
                  padding: isScrolled ? '10px 24px' : '12px 30px',
                  borderRadius: '30px',
                  fontSize: isScrolled ? '14px' : '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(108, 92, 231, 0.3)',
                  fontFamily: "'Poppins', sans-serif",
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Log in
              </button>
            </div>
            
            {/* ===== HAMBURGER BUTTON ===== */}
            <button 
              className="hamburger"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? '✕' : '☰'}
            </button>

            {/* ===== MOBILE NAV ===== */}
            <div className={`nav-mobile ${isMenuOpen ? 'open' : ''}`}>
              <button onClick={() => scrollToSection('about')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6C5CE7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '12px' }}>
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                About
              </button>
              <button onClick={() => scrollToSection('why')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6C5CE7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '12px' }}>
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                Why
              </button>
              <button onClick={() => scrollToSection('how')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6C5CE7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '12px' }}>
                  <line x1="8" y1="6" x2="21" y2="6"/>
                  <line x1="8" y1="12" x2="21" y2="12"/>
                  <line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/>
                  <line x1="3" y1="12" x2="3.01" y2="12"/>
                  <line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
                How
              </button>
              <button onClick={() => scrollToSection('start')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6C5CE7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '12px' }}>
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                Start Now
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

        {/* ===== HERO SECTION ===== */}
        <section style={{ 
          paddingTop: '120px', 
          paddingBottom: '60px', 
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }} className="animate-fade-in">
          {/* Floating decorations - hidden on mobile via CSS */}
          <div className="float-decor" style={{ 
            position: 'absolute', 
            width: '350px', 
            height: '350px', 
            borderRadius: '50%', 
            background: 'rgba(108, 92, 231, 0.08)', 
            top: '50px', 
            right: '5%',
            animation: 'heroFloat1 10s ease-in-out infinite',
            zIndex: 0
          }}></div>
          <div className="float-decor" style={{ 
            position: 'absolute', 
            width: '250px', 
            height: '250px', 
            borderRadius: '50%', 
            background: 'rgba(139, 127, 238, 0.06)', 
            bottom: '20px', 
            left: '8%',
            animation: 'heroFloat2 12s ease-in-out infinite',
            zIndex: 0
          }}></div>
          <div className="float-decor" style={{ 
            position: 'absolute', 
            width: '180px', 
            height: '180px', 
            borderRadius: '50%', 
            background: 'rgba(108, 92, 231, 0.05)', 
            top: '40%', 
            right: '15%',
            animation: 'heroFloat3 14s ease-in-out infinite',
            zIndex: 0
          }}></div>
          <div className="float-decor" style={{ 
            position: 'absolute', 
            width: '220px', 
            height: '220px', 
            borderRadius: '50%', 
            background: 'rgba(139, 127, 238, 0.07)', 
            bottom: '30%', 
            left: '12%',
            animation: 'heroFloat1 11s ease-in-out infinite',
            zIndex: 0
          }}></div>
          
          <div style={{ 
            maxWidth: '900px', 
            margin: '0 auto', 
            padding: '0 20px', 
            position: 'relative', 
            zIndex: 1 
          }}>
            <img 
              src="src/image/mascot.png" 
              alt="VocaboPlay Mascot" 
              style={{ 
                display: 'block',
                width: 'min(300px, 70%)', 
                height: 'auto', 
                margin: '0 auto 30px', 
                cursor: 'pointer', 
                transition: 'transform 0.3s ease',
                maxWidth: '300px',
              }}
              className="animate-bounce-custom"
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} 
            />
            <h1 style={{ 
              color: '#333', 
              fontSize: 'clamp(28px, 5vw, 45px)', 
              fontWeight: '700', 
              marginBottom: '20px', 
              lineHeight: '1.2', 
              fontFamily: "'Poppins', sans-serif",
            }}>
              Learn New Words, Play Smart, Level Up Your Vocabulary
            </h1>
            <p style={{
              fontSize: 'clamp(15px, 1.2vw, 18px)',
              color: '#666',
              maxWidth: '620px',
              margin: '0 auto',
              lineHeight: '1.7',
              fontFamily: "'Poppins', sans-serif",
            }}>
              Six interactive game modes, a growing word library, and progress tracking that keeps you coming back — vocabulary learning that actually feels like play.
            </p>

            <div className="stats-strip">
              {[
                { value: '6', label: 'Game Modes' },
                { value: '3', label: 'Difficulty Levels' },
                { value: '100%', label: 'Free to Start' },
                { value: '24/7', label: 'Learn Anytime' },
              ].map((stat, i) => (
                <div key={i} style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '18px 12px',
                  boxShadow: '0 6px 20px rgba(108, 92, 231, 0.10)',
                  border: '1px solid rgba(108, 92, 231, 0.08)',
                }}>
                  <div style={{
                    fontSize: 'clamp(22px, 2.4vw, 28px)',
                    fontWeight: '800',
                    color: '#6C5CE7',
                    fontFamily: "'Poppins', sans-serif",
                    lineHeight: 1.1,
                  }}>
                    {stat.value}
                  </div>
                  <div style={{
                    fontSize: 'clamp(11px, 1vw, 13px)',
                    color: '#777',
                    fontWeight: '600',
                    marginTop: '4px',
                    fontFamily: "'Poppins', sans-serif",
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== MASTER VOCABULARY ===== */}
        <section style={{ padding: '60px 20px', background: '#ffffff' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="grid-2">
              <div className="animate-slide-left">
                <h2 style={{ 
                  fontSize: 'clamp(28px, 4vw, 36px)', 
                  fontWeight: '700', 
                  color: '#1a1a1a', 
                  marginBottom: '25px', 
                  lineHeight: '1.3', 
                  fontFamily: "'Poppins', sans-serif" 
                }}>
                  Master Vocabulary Through Fun and Games
                </h2>
                <p style={{ 
                  fontSize: 'clamp(16px, 1.2vw, 17px)', 
                  color: '#666', 
                  lineHeight: '1.7', 
                  fontFamily: "'Poppins', sans-serif" 
                }}>
                  VocaboPlay transforms vocabulary learning into an engaging journey. Learn new words and track your progress.
                </p>
              </div>
              <div className="animate-slide-right" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img 
                  src="src/image/mascot-sitting.png" 
                  alt="Mascot" 
                  style={{ 
                    display: 'block',
                    width: 'min(280px, 60%)', 
                    height: 'auto', 
                    margin: '0 auto',
                    transition: 'transform 0.5s ease',
                    maxWidth: '280px',
                  }}
                  onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1) rotate(3deg)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'} 
                />
              </div>
            </div>
          </div>
        </section>

        {/* ===== ABOUT SECTION ===== */}
        <section id="about" style={{ padding: '60px 20px', background: 'white' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="grid-2">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img 
                  src="src/image/mascot-dad.png" 
                  alt="Mascot" 
                  style={{ 
                    display: 'block',
                    width: 'min(280px, 60%)', 
                    height: 'auto', 
                    margin: '0 auto',
                    transition: 'transform 0.5s ease',
                    maxWidth: '280px',
                  }}
                  onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05) rotate(-2deg)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'} 
                />
              </div>
              <div>
                <h2 style={{ 
                  fontSize: 'clamp(28px, 4vw, 36px)', 
                  fontWeight: '700', 
                  color: '#1a1a1a', 
                  marginBottom: '25px', 
                  lineHeight: '1.3', 
                  fontFamily: "'Poppins', sans-serif" 
                }}>
                  About VocaboPlay
                </h2>
                <p style={{ 
                  fontSize: 'clamp(16px, 1.2vw, 17px)', 
                  color: '#666', 
                  lineHeight: '1.7', 
                  marginBottom: '20px', 
                  fontFamily: "'Poppins', sans-serif" 
                }}>
                  VocaboPlay is a web-based vocabulary learning platform that integrates gamification techniques to enhance student engagement and learning effectiveness.
                </p>
                <p style={{ 
                  fontSize: 'clamp(16px, 1.2vw, 17px)', 
                  color: '#666', 
                  lineHeight: '1.7', 
                  fontFamily: "'Poppins', sans-serif" 
                }}>
                  It supports vocabulary development through structured interactive activities and progress monitoring, promoting consistent practice and improved language proficiency.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== GAMES SHOWCASE ===== */}
        <section style={{ padding: '60px 20px', background: '#f8f7ff' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: 'clamp(28px, 4vw, 36px)',
              fontWeight: '700',
              color: '#1a1a1a',
              textAlign: 'center',
              marginBottom: '14px',
              lineHeight: '1.3',
              fontFamily: "'Poppins', sans-serif"
            }}>
              Six Ways to Play, One Goal: Bigger Vocabulary
            </h2>
            <p style={{
              fontSize: 'clamp(15px, 1.1vw, 17px)',
              color: '#666',
              textAlign: 'center',
              maxWidth: '640px',
              margin: '0 auto 40px',
              lineHeight: '1.7',
              fontFamily: "'Poppins', sans-serif",
            }}>
              Every learner is different, so VocaboPlay gives you six distinct game modes — mix and match to keep practice fresh.
            </p>
            <div className="games-grid">
              {[
                { title: 'Word Pics', desc: 'Match words to pictures and build visual memory.' },
                { title: 'Quiz Master', desc: 'Timed multiple-choice quizzes that sharpen recall.' },
                { title: 'Match Game', desc: 'Pair words with meanings in a fast-paced memory game.' },
                { title: 'Guess What', desc: 'Decode clues and guess the hidden vocabulary word.' },
                { title: 'Short Story', desc: 'Read bite-sized stories, then answer comprehension quizzes.' },
                { title: 'Sentence Builder', desc: 'Arrange words into correct, meaningful sentences.' },
              ].map((game, i) => (
                <div key={i} className="game-card" style={{
                  background: 'white',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
                  border: '1px solid rgba(108, 92, 231, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: '32px 26px',
                  height: '100%',
                }}>
                  <div style={{
                    width: '48px',
                    height: '4px',
                    borderRadius: '2px',
                    background: 'linear-gradient(135deg, #6C5CE7 0%, #8B7FEE 100%)',
                    marginBottom: '18px',
                  }}></div>
                  <h3 style={{
                    fontSize: 'clamp(17px, 1.4vw, 19px)',
                    fontWeight: '700',
                    color: '#1a1a1a',
                    marginBottom: '10px',
                    fontFamily: "'Poppins', sans-serif",
                  }}>
                    {game.title}
                  </h3>
                  <p style={{
                    fontSize: 'clamp(13px, 1vw, 14px)',
                    color: '#666',
                    lineHeight: '1.6',
                    fontFamily: "'Poppins', sans-serif",
                    margin: 0,
                  }}>
                    {game.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== WHY CHOOSE ===== */}
        <section id="why" style={{ padding: '60px 20px', background: '#ffffff' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '20px',
              flexWrap: 'wrap',
              marginBottom: '40px',
              textAlign: 'center',
            }}>
              <img
                src="src/image/mascot-happy.png"
                alt="Happy Mascot"
                className="animate-pulse-custom"
                style={{ display: 'block', width: 'min(90px, 20%)', height: 'auto', maxWidth: '90px' }}
              />
              <h2 style={{
                fontSize: 'clamp(28px, 4vw, 36px)',
                fontWeight: '700',
                color: '#1a1a1a',
                lineHeight: '1.3',
                margin: 0,
                fontFamily: "'Poppins', sans-serif"
              }}>
                Why Choose VocaboPlay?
              </h2>
            </div>
            <div className="grid-4">
              {[
                { icon: '🎮', title: 'Fun Learning Experience', desc: 'Say goodbye to boring memorization! Our interactive games make vocabulary learning enjoyable and engaging.' },
                { icon: '🧠', title: 'Effective Learning', desc: 'Our methods use repetition and active recall to help you remember words better, longer.' },
                { icon: '📈', title: 'Track Your Progress', desc: 'Watch your word count, streaks, and accuracy grow with clear, motivating stats.' },
                { icon: '🌍', title: 'Learn Anywhere', desc: 'Fully responsive on mobile, tablet, and desktop — practice whenever you have a few minutes.' },
              ].map((feature, i) => (
                <div key={i} className="feature-card" style={{
                  textAlign: 'center',
                  padding: 'clamp(20px, 3vw, 28px)',
                  borderRadius: '16px',
                  background: 'white',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  border: '1px solid rgba(108, 92, 231, 0.06)',
                  height: '100%'
                }}>
                  <div style={{ fontSize: '36px', marginBottom: '12px' }}>{feature.icon}</div>
                  <h3 style={{
                    fontSize: 'clamp(17px, 1.6vw, 19px)',
                    fontWeight: '700',
                    color: '#6C5CE7',
                    marginBottom: '10px',
                    fontFamily: "'Poppins', sans-serif"
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{
                    fontSize: 'clamp(13px, 1vw, 15px)',
                    color: '#666',
                    lineHeight: '1.6',
                    fontFamily: "'Poppins', sans-serif"
                  }}>
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section id="how" style={{ 
          padding: '60px 20px', 
          background: 'linear-gradient(135deg, #8B7FEE 0%, #6C5CE7 50%, #5A4BD4 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div className="float-decor" style={{ 
            position: 'absolute', 
            width: '400px', 
            height: '400px', 
            borderRadius: '50%', 
            background: 'rgba(255, 255, 255, 0.1)', 
            top: '-100px', 
            right: '-100px',
            animation: 'float1 8s ease-in-out infinite'
          }}></div>
          <div className="float-decor" style={{ 
            position: 'absolute', 
            width: '300px', 
            height: '300px', 
            borderRadius: '50%', 
            background: 'rgba(255, 255, 255, 0.08)', 
            bottom: '-80px', 
            left: '-80px',
            animation: 'float2 10s ease-in-out infinite'
          }}></div>
          
          <div style={{ 
            maxWidth: '800px', 
            margin: '0 auto', 
            position: 'relative', 
            zIndex: 1,
            padding: '0 10px',
          }}>
            <h2 style={{ 
              fontSize: 'clamp(28px, 4vw, 36px)', 
              fontWeight: '700', 
              color: 'white', 
              textAlign: 'center', 
              marginBottom: '40px', 
              lineHeight: '1.3', 
              fontFamily: "'Poppins', sans-serif" 
            }}>
              How It Works
            </h2>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.95)', 
              borderRadius: '20px', 
              padding: 'clamp(25px, 4vw, 50px)', 
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)', 
              backdropFilter: 'blur(10px)' 
            }}>
              {[
                { num: 1, title: 'Create an Account', desc: 'Sign up for free and set up your learning profile' },
                { num: 2, title: 'Browse the Word Library', desc: 'Explore our comprehensive collection of vocabulary words. Choose words based on your level and learning goals.' },
                { num: 3, title: 'Learn Through Games', desc: 'Practice with flashcards, take quizzes, and engage with interactive activities. Learn new words in a fun, effective way!' },
                { num: 4, title: 'Track Your Progress', desc: 'Monitor your improvement, earn achievements' },
              ].map(step => (
                <div key={step.num} style={{ 
                  display: 'flex', 
                  gap: 'clamp(15px, 2vw, 25px)', 
                  marginBottom: '25px', 
                  padding: 'clamp(15px, 2vw, 25px)', 
                  borderRadius: '16px', 
                  background: 'white', 
                  transition: 'all 0.3s ease', 
                  alignItems: 'center', 
                  boxShadow: '0 4px 15px rgba(108, 92, 231, 0.1)',
                  flexDirection: window.innerWidth < 480 ? 'column' : 'row',
                  textAlign: window.innerWidth < 480 ? 'center' : 'left',
                }}
                  onMouseOver={e => e.currentTarget.style.transform = 'translateX(10px)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'translateX(0)'}
                >
                  <div style={{ 
                    width: window.innerWidth < 480 ? '50px' : '60px', 
                    height: window.innerWidth < 480 ? '50px' : '60px', 
                    background: 'linear-gradient(135deg, #6C5CE7 0%, #8B7FEE 100%)', 
                    color: 'white', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: window.innerWidth < 480 ? '20px' : '24px', 
                    fontWeight: '700', 
                    flexShrink: 0, 
                    fontFamily: "'Poppins', sans-serif" 
                  }}>
                    {step.num}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      fontSize: 'clamp(18px, 1.5vw, 20px)', 
                      fontWeight: '700', 
                      color: '#1a1a1a', 
                      marginBottom: '8px', 
                      fontFamily: "'Poppins', sans-serif" 
                    }}>
                      {step.title}
                    </h3>
                    <p style={{ 
                      fontSize: 'clamp(15px, 1vw, 16px)', 
                      color: '#666', 
                      lineHeight: '1.6', 
                      fontFamily: "'Poppins', sans-serif" 
                    }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CTA SECTION ===== */}
        <section id="start" style={{ 
          padding: '60px 20px', 
          textAlign: 'center', 
          background: 'linear-gradient(135deg, #f8f7ff 0%, #ffffff 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Floating decorations - hidden on mobile */}
          <div className="float-decor" style={{ 
            position: 'absolute', 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #6C5CE7 0%, #8B7FEE 100%)',
            opacity: 0.15,
            top: '10%', 
            left: '10%',
            animation: 'ctaFloat1 6s ease-in-out infinite'
          }}></div>
          <div className="float-decor" style={{ 
            position: 'absolute', 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #8B7FEE 0%, #6C5CE7 100%)',
            opacity: 0.12,
            top: '20%', 
            right: '15%',
            animation: 'ctaFloat2 7s ease-in-out infinite'
          }}></div>
          <div className="float-decor" style={{ 
            position: 'absolute', 
            width: '100px', 
            height: '100px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #6C5CE7 0%, #8B7FEE 100%)',
            opacity: 0.1,
            bottom: '15%', 
            right: '8%',
            animation: 'ctaFloat3 8s ease-in-out infinite'
          }}></div>
          <div className="float-decor" style={{ 
            position: 'absolute', 
            width: '70px', 
            height: '70px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #8B7FEE 0%, #6C5CE7 100%)',
            opacity: 0.13,
            bottom: '10%', 
            left: '12%',
            animation: 'ctaFloat1 9s ease-in-out infinite'
          }}></div>
          
          <div className="float-decor" style={{ position: 'absolute', top: '25%', left: '20%', fontSize: '24px', animation: 'sparkle 3s ease-in-out infinite', opacity: 0.6 }}>✨</div>
          <div className="float-decor" style={{ position: 'absolute', top: '30%', right: '25%', fontSize: '20px', animation: 'sparkle 4s ease-in-out infinite 0.5s', opacity: 0.6 }}>⭐</div>
          <div className="float-decor" style={{ position: 'absolute', bottom: '25%', left: '18%', fontSize: '22px', animation: 'sparkle 3.5s ease-in-out infinite 1s', opacity: 0.6 }}>💫</div>
          <div className="float-decor" style={{ position: 'absolute', bottom: '30%', right: '20%', fontSize: '18px', animation: 'sparkle 4.5s ease-in-out infinite 1.5s', opacity: 0.6 }}>✨</div>
          
          <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <h2 style={{ 
              fontSize: 'clamp(28px, 4vw, 36px)', 
              fontWeight: '700', 
              color: '#1a1a1a', 
              marginBottom: '30px', 
              lineHeight: '1.3', 
              fontFamily: "'Poppins', sans-serif" 
            }}>
              Ready to Start Your Vocabulary Journey?
            </h2>
            <img 
              src="src/image/mascot-skateboard.png" 
              alt="Mascot" 
              style={{ 
                display: 'block',
                width: 'min(240px, 60%)', 
                height: 'auto', 
                margin: '0 auto 40px',
                maxWidth: '240px',
              }} 
              className="animate-bounce-custom" 
            />
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '20px',
              flexWrap: 'wrap',
            }}>
              <button onClick={() => navigate('/signup')} style={{
                background: 'linear-gradient(135deg, #6C5CE7 0%, #8B7FEE 100%)',
                color: 'white',
                border: 'none',
                padding: 'clamp(14px, 2vw, 16px) clamp(30px, 4vw, 45px)',
                borderRadius: '30px',
                fontSize: 'clamp(16px, 1.5vw, 18px)',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(108, 92, 231, 0.4)',
                transition: 'all 0.3s ease',
                fontFamily: "'Poppins', sans-serif",
                width: 'auto',
              }}
                onMouseOver={e => { 
                  e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)'; 
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(108, 92, 231, 0.5)'; 
                }}
                onMouseOut={e => { 
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'; 
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(108, 92, 231, 0.4)'; 
                }}
              >
                Start Now
              </button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Landing;