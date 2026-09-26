import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';

const Landing = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeLevel, setActiveLevel] = useState('A1');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

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
    softGreen: '#8AB17D',
    softGreenShadow: '#6A8A5E',
  };

  // ===== STANDARDIZED CHUNKY BUTTON (Game UI Style) =====
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
      fontFamily: "'Fredoka', sans-serif",
      fontSize: s.fontSize,
      padding: s.padding,
      boxShadow: `0 4px 0 ${shadowColor}`,
      transition: 'transform 0.1s ease, box-shadow 0.1s ease',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    };
  };

  const pressButton = (e, shadowColor) => {
    e.currentTarget.style.transform = 'translateY(4px)';
    e.currentTarget.style.boxShadow = `0 0 0 ${shadowColor}`;
  };
  const releaseButton = (e, shadowColor) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = `0 4px 0 ${shadowColor}`;
  };

  // ===== DUOTONE ICONS (Consistent Style) =====
  const Icon = ({ name, size = 24, color = palette.white, secondaryColor = 'rgba(255,255,255,0.5)' }) => {
    const icons = {
      game: <path d="M6 12h4m-2-2v4m6-4h.01M17 12h.01M8 20h8a4 4 0 004-4V8a4 4 0 00-4-4H8a4 4 0 00-4 4v8a4 4 0 004 4z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
      brain: <path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-4.96.44 2.5 2.5 0 01-2.96-3.08 3 3 0 01-.34-5.58 2.5 2.5 0 011.32-4.24 2.5 2.5 0 011.98-3A2.5 2.5 0 019.5 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
      chart: <path d="M18 20V10M12 20V4M6 20v-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
      globe: (
        <>
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke={secondaryColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </>
      ),
      play: <path d="M5 3l14 9-14 9V3z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
      check: <path d="M20 6L9 17l-5-5" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
      arrowRight: <path d="M5 12h14M12 5l7 7-7 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
      close: <path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
      menu: <path d="M3 12h18M3 6h18M3 18h18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
    };
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {icons[name] || icons.game}
      </svg>
    );
  };

  const cefrLevels = {
    A1: { title: 'Beginner', text: 'Basic vocabulary for familiar people, places, objects, and everyday situations.', source: 'Oxford' },
    A2: { title: 'Elementary', text: 'Common vocabulary for simple conversations and everyday needs.', source: 'Oxford' },
    B1: { title: 'Intermediate', text: 'More varied vocabulary for familiar topics, experiences, and communication.', source: 'Oxford' },
    B2: { title: 'Upper Intermediate', text: 'A broader range of vocabulary for detailed conversations and ideas.', source: 'Oxford' },
    C1: { title: 'Advanced', text: 'Precise and flexible vocabulary for complex communication and learning.', source: 'Oxford' },
    C2: { title: 'Proficient', text: 'Advanced vocabulary for expressing complex ideas with precision and nuance.', source: 'Cambridge' }
  };

  // ===== STANDARDIZED CONTAINER STYLES =====
  const cardStyle = {
    background: palette.white,
    border: `2px solid ${palette.border}`,
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 4px 0 rgba(0,0,0,0.05)',
  };

  const smallCardStyle = {
    ...cardStyle,
    padding: '24px',
    borderRadius: '12px',
  };

  const headingStyle = {
    fontSize: 'clamp(26px, 3.5vw, 42px)',
    fontWeight: '800',
    color: palette.deepNavy,
    lineHeight: '1.2',
    fontFamily: "'Fredoka', sans-serif",
    marginBottom: '16px',
    letterSpacing: '-0.5px',
  };

  const bodyStyle = {
    fontSize: 'clamp(15px, 1.1vw, 17px)',
    color: palette.bodyText,
    lineHeight: '1.7',
    fontFamily: "'Nunito', sans-serif",
    fontWeight: '500',
    margin: 0,
  };

  const sectionTitle = {
    fontFamily: "'Fredoka', sans-serif",
    fontSize: 'clamp(22px, 3vw, 36px)',
    fontWeight: '800',
    color: palette.deepNavy,
    textAlign: 'center',
    marginBottom: '16px',
    letterSpacing: '-0.5px',
    lineHeight: 1.2,
  };

  // ===== BLURRED BG IMAGE LAYER =====
  const blurredBg = (url, blurAmount = '3px') => ({
    position: 'absolute',
    inset: 0,
    backgroundImage: `url(${url})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    filter: `blur(${blurAmount})`,
    transform: 'scale(1.08)',
    zIndex: 0,
  });

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700;800&family=Nunito:wght@400;500;600;700;800&display=swap');
          
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Nunito', sans-serif; 
            background-color: ${palette.cream};
            overflow-x: hidden;
          }
          
          img { max-width: 100%; height: auto; }
          
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
          
          .animate-fade-in { animation: fadeIn 0.8s ease-out; }
          .animate-bounce-custom { animation: bounce 2s ease-in-out infinite; }
          .animate-slide-left { animation: slideInLeft 0.8s ease-out; }
          .animate-slide-right { animation: slideInRight 0.8s ease-out; }
          .animate-pulse-custom { animation: pulse 2s ease-in-out infinite; }
          
          .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 60px;
            align-items: center;
          }
          
          @media (max-width: 992px) {
            .grid-2 {
              grid-template-columns: 1fr;
              gap: 40px;
              text-align: center;
            }
          }
          
          @media (max-width: 992px) {
            .cefr-level-grid { grid-template-columns: repeat(3, 1fr) !important; }
            .cefr-detail { grid-template-columns: 1fr !important; }
            .source-cards { grid-template-columns: 1fr !important; }
          }

          @media (max-width: 560px) {
            .cefr-level-grid { grid-template-columns: repeat(2, 1fr) !important; }
            .cefr-detail { text-align: center; }
          }

          .games-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
          }
          @media (max-width: 992px) {
            .games-grid { grid-template-columns: repeat(2, 1fr); }
          }
          @media (max-width: 560px) {
            .games-grid { grid-template-columns: 1fr; }
          }

          .grid-4 {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
          }
          @media (max-width: 992px) {
            .grid-4 { grid-template-columns: repeat(2, 1fr); }
          }
          @media (max-width: 480px) {
            .grid-4 { grid-template-columns: 1fr; }
          }

          /* ===== HERO STATS: 4 cols → 2 cols on mobile ===== */
          .hero-stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            max-width: 760px;
            margin: 0 auto;
            width: 100%;
          }
          @media (max-width: 768px) {
            .hero-stats { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          }
          @media (max-width: 400px) {
            .hero-stats { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          }

          /* ===== RESPONSIVE SECTION PADDING ===== */
          .section-padding {
            padding: 96px 24px;
          }
          @media (max-width: 768px) {
            .section-padding { padding: 64px 20px; }
          }
          @media (max-width: 480px) {
            .section-padding { padding: 48px 16px; }
          }

          .section-padding-hero {
            padding-top: 140px;
            padding-bottom: 80px;
            padding-left: 24px;
            padding-right: 24px;
          }
          @media (max-width: 768px) {
            .section-padding-hero {
              padding-top: 110px;
              padding-bottom: 60px;
              padding-left: 20px;
              padding-right: 20px;
            }
          }
          @media (max-width: 480px) {
            .section-padding-hero {
              padding-top: 100px;
              padding-bottom: 48px;
              padding-left: 16px;
              padding-right: 16px;
            }
          }

          .section-padding-cta {
            padding: 120px 24px;
          }
          @media (max-width: 768px) {
            .section-padding-cta { padding: 80px 20px; }
          }
          @media (max-width: 480px) {
            .section-padding-cta { padding: 64px 16px; }
          }

          /* ===== RESPONSIVE CARD PADDING ===== */
          @media (max-width: 768px) {
            .card-responsive { padding: 24px !important; }
            .small-card-responsive { padding: 20px !important; }
          }
          @media (max-width: 480px) {
            .card-responsive { padding: 20px !important; }
            .small-card-responsive { padding: 16px !important; }
          }

          /* ===== RESPONSIVE HOW IT WORKS ===== */
          .how-step {
            display: flex;
            gap: 24px;
            padding: 28px;
            align-items: center;
            background: white;
            border-radius: 16px;
            border: 2px solid ${palette.border};
            box-shadow: 0 4px 0 rgba(0,0,0,0.05);
          }
          @media (max-width: 560px) {
            .how-step {
              flex-direction: column;
              text-align: center;
              gap: 16px;
              padding: 24px 20px;
            }
          }

          .feature-card { transition: transform 0.2s ease; }
          .feature-card:hover { transform: translateY(-4px); }

          .game-card { transition: transform 0.2s ease; }
          .game-card:hover { transform: translateY(-4px); }

          .hamburger {
            display: none;
            background: none;
            border: none;
            cursor: pointer;
            padding: 8px;
            z-index: 1001;
          }
          
          @media (max-width: 768px) {
            .hamburger { display: block; }
            .nav-desktop { display: none !important; }
            
            .nav-mobile {
              display: flex !important;
              flex-direction: column;
              position: fixed;
              top: 0;
              right: -100%;
              width: 280px;
              max-width: 80vw;
              height: 100vh;
              background: white;
              padding: 80px 30px 30px;
              box-shadow: -10px 0 30px rgba(0,0,0,0.1);
              transition: right 0.3s ease;
              z-index: 1000;
              overflow-y: auto;
            }
            
            .nav-mobile.open { right: 0; }
            
            .nav-mobile button {
              width: 100%;
              text-align: left;
              padding: 15px 0;
              font-size: 16px !important;
              border-bottom: 2px solid #f0f0f0;
              background: none;
              border: none;
              cursor: pointer;
              font-family: 'Fredoka', sans-serif;
              color: ${palette.deepNavy};
              font-weight: 600;
            }
            
            .nav-mobile .login-btn {
              margin-top: 20px;
              text-align: center !important;
              justify-content: center !important;
              background: ${palette.warmOrange} !important;
              color: white !important;
              border: none !important;
              padding: 14px !important;
              border-radius: 12px !important;
              font-weight: 700 !important;
              box-shadow: 0 4px 0 ${palette.warmOrangeShadow} !important;
            }
            
            .overlay {
              display: none;
              position: fixed;
              inset: 0;
              background: rgba(0,0,0,0.5);
              z-index: 999;
            }
            
            .overlay.active { display: block; }
          }
          
          @media (min-width: 769px) {
            .nav-mobile { display: none !important; }
            .nav-desktop { display: flex !important; }
          }

          /* ===== RESPONSIVE CTA TEXT ===== */
          @media (max-width: 560px) {
            .cta-title { font-size: 26px !important; }
            .cta-button { font-size: 17px !important; padding: 16px 36px !important; }
          }
        `}
      </style>

      <div style={{ minHeight: '100vh', background: palette.cream }}>
        
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
          background: isScrolled ? 'rgba(255,248,240,0.98)' : 'transparent',
          borderBottom: isScrolled ? `2px solid ${palette.border}` : 'none',
          zIndex: 1000,
          padding: isScrolled ? '12px 24px' : '20px 24px',
          transition: 'all 0.3s ease',
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{
              ...chunkyButton(palette.teal, palette.tealShadow, 'sm'),
              fontSize: '18px',
              padding: '8px 20px',
            }}>
              VocaboPlay
            </div>

            <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              {[
                { label: 'About', id: 'about' },
                { label: 'Why', id: 'why' },
                { label: 'Levels', id: 'levels' },
                { label: 'How', id: 'how' },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => scrollToSection(item.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: '700',
                    color: isScrolled ? palette.deepNavy : palette.white,
                    fontFamily: "'Fredoka', sans-serif",
                    transition: 'color 0.2s ease',
                    textShadow: isScrolled ? 'none' : '0 2px 4px rgba(0,0,0,0.3)',
                  }}
                  onMouseOver={e => e.currentTarget.style.color = palette.warmOrange}
                  onMouseOut={e => e.currentTarget.style.color = isScrolled ? palette.deepNavy : palette.white}
                >
                  {item.label}
                </button>
              ))}
              
              <button
                onClick={() => navigate('/login')}
                style={chunkyButton(palette.coral, palette.coralShadow, 'sm')}
                onMouseDown={e => pressButton(e, palette.coralShadow)}
                onMouseUp={e => releaseButton(e, palette.coralShadow)}
                onMouseLeave={e => releaseButton(e, palette.coralShadow)}
              >
                Log in
              </button>
            </div>

            <button 
              className="hamburger"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <Icon name={isMenuOpen ? 'close' : 'menu'} color={isScrolled ? palette.deepNavy : palette.white} size={28} />
            </button>

            <div className={`nav-mobile ${isMenuOpen ? 'open' : ''}`}>
              <button onClick={() => scrollToSection('about')}>About</button>
              <button onClick={() => scrollToSection('why')}>Why</button>
              <button onClick={() => scrollToSection('levels')}>Levels</button>
              <button onClick={() => scrollToSection('how')}>How</button>
              <button onClick={() => scrollToSection('start')}>Start Now</button>
              <button 
                className="login-btn"
                onClick={() => { navigate('/login'); setIsMenuOpen(false); }}
              >
                Log in
              </button>
            </div>
          </div>
        </nav>

        {/* ===== HERO SECTION ===== */}
        <section className="section-padding-hero" style={{
          position: 'relative',
          width: '100%',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}>
          <div style={blurredBg('/image/game-world-bg.jpg', '3px')} />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, ${palette.deepNavy}50 0%, ${palette.warmOrange}40 100%)`,
            zIndex: 1,
            pointerEvents: 'none',
          }} />

          <div style={{ 
            position: 'relative', 
            zIndex: 2, 
            textAlign: 'center', 
            maxWidth: '900px', 
            padding: '0 24px',
            width: '100%',
          }}>
            
            <h1 style={{
              color: palette.white,
              fontSize: 'clamp(28px, 4vw, 52px)',
              fontWeight: '900',
              fontFamily: "'Fredoka', sans-serif",
              lineHeight: 1.15,
              marginBottom: '24px',
              letterSpacing: '-1px',
              textShadow: '0 4px 0 rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.4)',
            }}>
              Learn New Words, Play Smart,<br />
              Level Up Your Vocabulary
            </h1>

            <p style={{
              color: palette.white,
              fontSize: 'clamp(16px, 1.2vw, 22px)',
              fontFamily: "'Nunito', sans-serif",
              fontWeight: '600',
              lineHeight: 1.6,
              maxWidth: '650px',
              margin: '0 auto 48px',
              textShadow: '0 2px 6px rgba(0,0,0,0.5)',
            }}>
              Build your vocabulary with an ever-growing word library and progress tracking that makes learning engaging, structured, and rewarding.
            </p>

            <div className="hero-stats">
              {[
                { value: '6', label: 'Game Modes' },
                { value: '6', label: 'CEFR Levels' },
                { value: '100%', label: 'Free to Start' },
                { value: '24/7', label: 'Learn Anytime' },
              ].map((stat, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '16px',
                  padding: '20px 12px',
                  textAlign: 'center',
                  border: '2px solid rgba(255,255,255,0.3)',
                }}>
                  <div style={{
                    fontSize: 'clamp(20px, 2.5vw, 32px)',
                    fontWeight: '900',
                    color: palette.white,
                    fontFamily: "'Fredoka', sans-serif",
                    lineHeight: 1.1,
                    marginBottom: '8px',
                  }}>
                    {stat.value}
                  </div>
                  <div style={{
                    fontSize: 'clamp(10px, 1vw, 14px)',
                    color: 'rgba(255,255,255,0.9)',
                    fontWeight: '700',
                    fontFamily: "'Nunito', sans-serif",
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== MASTER VOCABULARY ===== */}
        <section className="section-padding" style={{ 
          position: 'relative',
          background: palette.white,
        }}>
          <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
            <div className="grid-2">
              <div className="animate-slide-left">
                <h2 style={headingStyle}>
                  Master Vocabulary Through Fun and Games
                </h2>
                <p style={bodyStyle}>
                  VocaboPlay transforms vocabulary learning into an engaging journey. Learn new words, practice through games, and track your progress.
                </p>
              </div>
              <div className="animate-slide-right" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img 
                  src="/image/mascot-sitting.png" 
                  alt="VocaboPlay mascot sitting"
                  style={{ 
                    display: 'block',
                    width: 'min(320px, 70%)', 
                    height: 'auto', 
                    margin: '0 auto',
                    transition: 'transform 0.5s ease',
                    maxWidth: '320px',
                    filter: `drop-shadow(0 12px 24px ${palette.warmOrange}40)`,
                  }}
                  onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} 
                />
              </div>
            </div>
          </div>
        </section>

        {/* ===== ABOUT ===== */}
        <section id="about" className="section-padding" style={{ 
          position: 'relative',
          background: palette.cream,
        }}>
          <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
            <div className="grid-2">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img 
                  src="/image/mascot-dad.png" 
                  alt="VocaboPlay mascot"
                  style={{ 
                    display: 'block',
                    width: 'min(320px, 70%)', 
                    height: 'auto', 
                    margin: '0 auto',
                    transition: 'transform 0.5s ease',
                    maxWidth: '320px',
                    filter: `drop-shadow(0 12px 24px ${palette.teal}40)`,
                  }}
                  onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} 
                />
              </div>
              <div>
                <h2 style={headingStyle}>
                  About VocaboPlay
                </h2>
                <p style={{ ...bodyStyle, marginBottom: '16px' }}>
                  VocaboPlay is a web-based vocabulary learning platform that integrates gamification techniques to make vocabulary practice more engaging.
                </p>
                <p style={bodyStyle}>
                  It supports vocabulary development through structured activities, games, and progress monitoring.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CEFR LEVEL GUIDE ===== */}
        <section id="levels" className="section-padding" style={{
          position: 'relative',
          background: palette.white,
        }}>
          <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div style={{
                display: 'inline-block',
                fontSize: '13px',
                fontWeight: '800',
                color: palette.teal,
                background: `${palette.teal}15`,
                padding: '8px 16px',
                borderRadius: '999px',
                fontFamily: "'Nunito', sans-serif",
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}>
                Vocabulary Level Guide
              </div>
              <h2 style={sectionTitle}>
                Understand Your CEFR Level
              </h2>
              <p style={{
                ...bodyStyle,
                maxWidth: '700px',
                margin: '0 auto',
              }}>
                CEFR provides the difficulty framework, while Oxford and Cambridge vocabulary resources help guide word selection across the levels.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
              gap: '12px',
              marginBottom: '32px',
            }} className="cefr-level-grid">
              {Object.keys(cefrLevels).map(level => {
                const active = activeLevel === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setActiveLevel(level)}
                    aria-pressed={active}
                    style={{
                      background: active ? palette.teal : palette.white,
                      color: active ? palette.white : palette.deepNavy,
                      border: `2px solid ${active ? palette.teal : palette.border}`,
                      borderRadius: '12px',
                      padding: '14px 8px',
                      cursor: 'pointer',
                      fontFamily: "'Fredoka', sans-serif",
                      fontSize: 'clamp(16px, 2vw, 20px)',
                      fontWeight: '700',
                      boxShadow: active ? `0 4px 0 ${palette.tealShadow}` : 'none',
                      transform: active ? 'translateY(-2px)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {level}
                  </button>
                );
              })}
            </div>

            <div className="card-responsive cefr-detail" style={{
              ...cardStyle,
              display: 'grid',
              gridTemplateColumns: '1fr 1.6fr',
              gap: '32px',
              alignItems: 'center',
            }}>
              <div style={{
                background: palette.cream,
                borderRadius: '12px',
                padding: '32px',
                textAlign: 'center',
                border: `2px solid ${palette.border}`,
              }}>
                <div style={{
                  fontFamily: "'Fredoka', sans-serif",
                  fontSize: 'clamp(40px, 6vw, 56px)',
                  lineHeight: 1,
                  fontWeight: '800',
                  color: palette.teal,
                  marginBottom: '12px',
                }}>{activeLevel}</div>
                <div style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: '14px',
                  fontWeight: '800',
                  color: palette.bodyText,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}>{cefrLevels[activeLevel].title}</div>
              </div>

              <div>
                <h3 style={{
                  fontFamily: "'Fredoka', sans-serif",
                  fontSize: 'clamp(22px, 3vw, 28px)',
                  fontWeight: '700',
                  color: palette.deepNavy,
                  marginBottom: '12px',
                }}>
                  {activeLevel} — {cefrLevels[activeLevel].title}
                </h3>
                <p style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: '16px',
                  lineHeight: '1.7',
                  color: palette.bodyText,
                  marginBottom: '20px',
                }}>
                  {cefrLevels[activeLevel].text}
                </p>
                <div style={{
                  display: 'inline-block',
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: '13px',
                  fontWeight: '700',
                  color: palette.coral,
                  background: `${palette.coral}15`,
                  padding: '6px 12px',
                  borderRadius: '6px',
                }}>
                  Vocabulary reference: {cefrLevels[activeLevel].source}
                </div>
              </div>
            </div>

            <div style={{
              marginTop: '32px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
            }} className="source-cards">
              {[
                ['CEFR', 'A1 to C2', 'A framework for describing language proficiency.'],
                ['Oxford', 'A1 to C1', 'CEFR-aligned vocabulary references used for word selection.'],
                ['Cambridge', 'A1 to C2', 'Vocabulary information including advanced C2 vocabulary.'],
              ].map(([name, level, desc]) => (
                <div key={name} className="small-card-responsive" style={smallCardStyle}>
                  <div style={{
                    fontFamily: "'Fredoka', sans-serif",
                    fontSize: '20px',
                    fontWeight: '700',
                    color: palette.deepNavy,
                    marginBottom: '4px',
                  }}>{name}</div>
                  <div style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: '12px',
                    fontWeight: '800',
                    color: palette.warmOrange,
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>{level}</div>
                  <p style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: palette.bodyText,
                    margin: 0,
                  }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== GAMES SHOWCASE ===== */}
        <section className="section-padding" style={{ 
          position: 'relative',
          background: palette.cream,
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={sectionTitle}>
                Six Ways to Play, One Goal: Bigger Vocabulary
              </h2>
              <p style={{ ...bodyStyle, maxWidth: '700px', margin: '0 auto' }}>
                Every learner is different, so VocaboPlay gives you six distinct game modes — mix and match to keep practice fresh.
              </p>
            </div>
            
            <div className="games-grid">
              {[
                { title: 'Word Pics', desc: 'Match words to pictures and build visual memory.', color: palette.teal, icon: 'game' },
                { title: 'Quiz Master', desc: 'Timed multiple-choice quizzes that sharpen recall.', color: palette.warmOrange, icon: 'brain' },
                { title: 'Match Game', desc: 'Pair words with meanings in a fast-paced memory game.', color: palette.coral, icon: 'check' },
                { title: 'Guess What', desc: 'Decode clues and guess the hidden vocabulary word.', color: palette.softGreen, icon: 'play' },
                { title: 'Short Story', desc: 'Read bite-sized stories, then answer comprehension quizzes.', color: palette.deepNavy, icon: 'chart' },
                { title: 'Sentence Builder', desc: 'Arrange words into correct, meaningful sentences.', color: palette.teal, icon: 'arrowRight' },
              ].map((game, i) => (
                <div key={i} className="game-card card-responsive" style={{ 
                  ...cardStyle,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  textAlign: 'left',
                  height: '100%',
                  padding: '28px',
                  borderTop: `6px solid ${game.color}`,
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: game.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                    boxShadow: `0 4px 0 rgba(0,0,0,0.15)`,
                  }}>
                    <Icon name={game.icon} size={24} color={palette.white} secondaryColor="rgba(255,255,255,0.5)" />
                  </div>
                  
                  <h3 style={{
                    fontSize: 'clamp(20px, 2.5vw, 24px)',
                    fontWeight: '800',
                    color: palette.deepNavy,
                    marginBottom: '8px',
                    fontFamily: "'Fredoka', sans-serif",
                  }}>
                    {game.title}
                  </h3>
                  
                  <p style={{
                    fontSize: '15px',
                    color: palette.bodyText,
                    lineHeight: '1.6',
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: '500',
                    marginBottom: '24px',
                    flex: 1,
                  }}>
                    {game.desc}
                  </p>
                  
                  <button 
                    style={{
                      ...chunkyButton(game.color, game.color + 'CC', 'sm'),
                      width: '100%',
                      padding: '12px 16px',
                    }}
                    onMouseDown={e => pressButton(e, game.color + 'CC')}
                    onMouseUp={e => releaseButton(e, game.color + 'CC')}
                    onMouseLeave={e => releaseButton(e, game.color + 'CC')}
                  >
                    Play Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== WHY CHOOSE ===== */}
        <section id="why" className="section-padding" style={{ 
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={blurredBg('/image/why-choose-bg.jpg', '4px')} />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(255, 255, 255, 0.65)',
            zIndex: 1,
            pointerEvents: 'none',
          }} />

          <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <img
                  src="/image/mascot-happy.png"
                  alt="Happy Mascot"
                  className="animate-pulse-custom"
                  style={{ 
                    display: 'block', 
                    width: 'clamp(70px, 10vw, 120px)',
                    height: 'auto', 
                    maxWidth: '120px',
                    filter: `drop-shadow(0 10px 25px ${palette.warmOrange}50)`,
                  }}
                />
                <h2 style={{ ...sectionTitle, margin: 0 }}>
                  Why Choose VocaboPlay?
                </h2>
              </div>
            </div>
            
            <div className="grid-4">
              {[
                { icon: 'game', title: 'Fun Learning', desc: 'Interactive games make vocabulary learning enjoyable and engaging.', color: palette.teal },
                { icon: 'brain', title: 'Effective Learning', desc: 'Repetition and active recall help you remember words better, longer.', color: palette.warmOrange },
                { icon: 'chart', title: 'Track Progress', desc: 'Watch your word count, streaks, and accuracy grow with clear stats.', color: palette.coral },
                { icon: 'globe', title: 'Learn Anywhere', desc: 'Fully responsive on mobile, tablet, and desktop — practice anytime.', color: palette.softGreen },
              ].map((feature, i) => (
                <div key={i} className="feature-card small-card-responsive" style={{ 
                  ...smallCardStyle,
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: `${feature.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                  }}>
                    <Icon name={feature.icon} size={28} color={feature.color} secondaryColor={`${feature.color}80`} />
                  </div>
                  <h3 style={{
                    fontSize: 'clamp(18px, 2vw, 20px)',
                    fontWeight: '800',
                    color: palette.deepNavy,
                    marginBottom: '10px',
                    fontFamily: "'Fredoka', sans-serif",
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: palette.bodyText,
                    lineHeight: '1.6',
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: '500',
                    margin: 0,
                  }}>
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section id="how" className="section-padding" style={{ 
          position: 'relative',
          background: palette.white,
        }}>
          <div style={{ 
            maxWidth: '900px', 
            margin: '0 auto', 
          }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={sectionTitle}>
                How It Works
              </h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                { num: 1, title: 'Create an Account', desc: 'Sign up for free and set up your learning profile', color: palette.teal },
                { num: 2, title: 'Browse the Word Library', desc: 'Explore our comprehensive collection of vocabulary words. Choose words based on your level and learning goals.', color: palette.warmOrange },
                { num: 3, title: 'Learn Through Games', desc: 'Practice with flashcards, take quizzes, and engage with interactive activities. Learn new words in a fun, effective way!', color: palette.coral },
                { num: 4, title: 'Track Your Progress', desc: 'Monitor your improvement, earn achievements', color: palette.softGreen },
              ].map(step => (
                <div key={step.num} className="how-step">
                  <div style={{ 
                    width: '64px', 
                    height: '64px', 
                    background: step.color,
                    color: palette.white, 
                    borderRadius: '16px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '28px', 
                    fontWeight: '800', 
                    flexShrink: 0, 
                    fontFamily: "'Fredoka', sans-serif",
                    boxShadow: `0 4px 0 rgba(0,0,0,0.15)`,
                  }}>
                    {step.num}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      fontSize: 'clamp(18px, 2.5vw, 22px)', 
                      fontWeight: '800', 
                      color: palette.deepNavy, 
                      marginBottom: '6px', 
                      fontFamily: "'Fredoka', sans-serif",
                    }}>
                      {step.title}
                    </h3>
                    <p style={{ 
                      fontSize: '15px', 
                      color: palette.bodyText, 
                      lineHeight: '1.6', 
                      fontFamily: "'Nunito', sans-serif",
                      fontWeight: '500',
                      margin: 0,
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
        <section id="start" className="section-padding-cta" style={{ 
          position: 'relative',
          textAlign: 'center',
          overflow: 'hidden',
        }}>
          <div style={blurredBg('/image/why-choose-bg.jpg', '4px')} />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(135deg, ${palette.deepNavy}80 0%, ${palette.teal}80 100%)`,
            zIndex: 1,
            pointerEvents: 'none',
          }} />

          <div style={{ 
            maxWidth: '800px', 
            margin: '0 auto', 
            position: 'relative', 
            zIndex: 2,
          }}>
            <h2 className="cta-title" style={{ 
              fontSize: 'clamp(26px, 4vw, 48px)', 
              fontWeight: '900', 
              color: palette.white, 
              marginBottom: '32px', 
              lineHeight: '1.2', 
              fontFamily: "'Fredoka', sans-serif",
              letterSpacing: '-0.5px',
              textShadow: '0 4px 0 rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.4)',
            }}>
              Ready to Start Your<br />
              Vocabulary Journey?
            </h2>

            <img 
              src="/image/mascot-skateboard.png" 
              alt="Mascot" 
              style={{ 
                display: 'block',
                width: 'min(280px, 65%)', 
                height: 'auto', 
                margin: '0 auto 50px',
                maxWidth: '280px',
                filter: `drop-shadow(0 12px 24px rgba(0,0,0,0.3))`,
              }} 
              className="animate-bounce-custom" 
            />

            <button 
              onClick={() => navigate('/signup')} 
              className="cta-button"
              style={{
                ...chunkyButton(palette.warmOrange, palette.warmOrangeShadow, 'lg'),
                fontSize: '20px',
                padding: '18px 48px',
              }}
              onMouseDown={e => pressButton(e, palette.warmOrangeShadow)}
              onMouseUp={e => releaseButton(e, palette.warmOrangeShadow)}
              onMouseLeave={e => releaseButton(e, palette.warmOrangeShadow)}
            >
              Start Now
            </button>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Landing;