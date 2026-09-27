import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';

const Landing = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeLevel, setActiveLevel] = useState('A1');

  // ===== INTERACTIVE: Mouse position for parallax (desktop only) =====
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // ===== INTERACTIVE: Animated counters =====
  const [counters, setCounters] = useState({ games: 0, levels: 0, free: 0, hours: 0 });

  // ===== INTERACTIVE: Demo XP bar =====
  const [demoXp, setDemoXp] = useState(35);
  const [demoClicks, setDemoClicks] = useState(0);

  // ===== INTERACTIVE: Scroll reveal =====
  const heroStatsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);

  // ===== NAVBAR SCROLL =====
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ===== LOCK BODY SCROLL when mobile menu open =====
  useEffect(() => {
    if (isMenuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  // ===== DETECT TOUCH DEVICE =====
  useEffect(() => {
    const checkTouch = () => {
      const touch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
      setIsTouchDevice(touch);
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  // ===== PARALLAX MOUSE TRACKING (desktop only) =====
  useEffect(() => {
    if (isTouchDevice) return;
    let raf;
    const handleMouseMove = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        setMouse({ x, y });
        raf = null;
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [isTouchDevice]);

  // ===== ANIMATED COUNTERS (start when hero stats visible) =====
  useEffect(() => {
    if (!statsVisible) return;
    const duration = 1400;
    const start = performance.now();
    const targets = { games: 3, levels: 6, free: 100, hours: 24 };

    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setCounters({
        games: Math.round(targets.games * ease),
        levels: Math.round(targets.levels * ease),
        free: Math.round(targets.free * ease),
        hours: Math.round(targets.hours * ease),
      });
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [statsVisible]);

  // ===== INTERSECTION OBSERVER for reveal =====
  useEffect(() => {
    if (!heroStatsRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    observer.observe(heroStatsRef.current);
    return () => observer.disconnect();
  }, []);

  // ===== DEMO XP BAR CLICK =====
  const handleDemoXpClick = () => {
    setDemoClicks((c) => c + 1);
    setDemoXp((xp) => {
      const next = xp + 13;
      return next > 100 ? 15 : next;
    });
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  // ===== WARM & FRIENDLY PALETTE =====
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
      clock: <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
    };
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {icons[name] || icons.game}
      </svg>
    );
  };

  const cefrLevels = {
    A1: { title: 'Beginner', text: 'Basic vocabulary for familiar people, places, objects, and everyday situations.', source: 'Oxford 3000' },
    A2: { title: 'Elementary', text: 'Common vocabulary for simple conversations and everyday needs.', source: 'Oxford 3000' },
    B1: { title: 'Intermediate', text: 'More varied vocabulary for familiar topics, experiences, and communication.', source: 'Oxford 3000' },
    B2: { title: 'Upper Intermediate', text: 'A broader range of vocabulary for detailed conversations and ideas.', source: 'Oxford 3000 & Oxford 5000' },
    C1: { title: 'Advanced', text: 'Precise and flexible vocabulary for complex communication and learning.', source: 'Oxford 5000' },
    C2: { title: 'Proficient', text: 'Advanced vocabulary for expressing complex ideas with precision and nuance.', source: 'Cambridge English Vocabulary Profile' }
  };

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

  const blurredBg = (url, blurAmount = '3px') => ({
    position: 'absolute',
    inset: 0,
    backgroundImage: `url(${url})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    filter: `blur(${blurAmount})`,
    transform: isTouchDevice
      ? 'scale(1.08)'
      : `scale(1.08) translate(${mouse.x * 6}px, ${mouse.y * 6}px)`,
    transition: 'transform 0.25s ease-out',
    zIndex: 0,
  });

  // ===== 3D TILT (desktop only) =====
  const handleCardTilt = (e) => {
    if (isTouchDevice) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y / rect.height) - 0.5) * -8;
    const rotateY = ((x / rect.width) - 0.5) * 8;
    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  };
  const resetCardTilt = (e) => {
    e.currentTarget.style.transform = 'perspective(900px) rotateX(0) rotateY(0) translateY(0)';
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700;800&family=Nunito:wght@400;500;600;700;800&display=swap');
          
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { 
            overflow-x: hidden;
            width: 100%;
          }
          body { 
            font-family: 'Nunito', sans-serif; 
            background-color: ${palette.cream};
          }
          
          img { max-width: 100%; height: auto; display: block; }
          
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
          @keyframes floatShape {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            50% { transform: translate(20px, -20px) rotate(20deg); }
          }
          
          .animate-fade-in { animation: fadeIn 0.8s ease-out; }
          .animate-bounce-custom { animation: bounce 2s ease-in-out infinite; }
          .animate-slide-left { animation: slideInLeft 0.8s ease-out; }
          .animate-slide-right { animation: slideInRight 0.8s ease-out; }
          .animate-pulse-custom { animation: pulse 2s ease-in-out infinite; }
          .animate-float-shape { animation: floatShape 6s ease-in-out infinite; }
          
          .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 60px;
            align-items: center;
          }
          @media (max-width: 992px) {
            .grid-2 { grid-template-columns: 1fr; gap: 40px; text-align: center; }
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
          @media (max-width: 992px) { .games-grid { grid-template-columns: repeat(2, 1fr); } }
          @media (max-width: 560px) { .games-grid { grid-template-columns: 1fr; } }

          .grid-4 {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
          }
          @media (max-width: 992px) { .grid-4 { grid-template-columns: repeat(2, 1fr); } }
          @media (max-width: 480px) { .grid-4 { grid-template-columns: 1fr; } }

          .hero-stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            max-width: 760px;
            margin: 0 auto;
            width: 100%;
          }
          @media (max-width: 768px) { .hero-stats { grid-template-columns: repeat(2, 1fr); gap: 12px; } }
          @media (max-width: 400px) { .hero-stats { grid-template-columns: repeat(2, 1fr); gap: 10px; } }

          .section-padding { padding: 96px 24px; }
          @media (max-width: 768px) { .section-padding { padding: 64px 20px; } }
          @media (max-width: 480px) { .section-padding { padding: 48px 16px; } }

          .section-padding-hero {
            padding-top: 140px;
            padding-bottom: 80px;
            padding-left: 24px;
            padding-right: 24px;
          }
          @media (max-width: 768px) {
            .section-padding-hero { padding-top: 110px; padding-bottom: 60px; padding-left: 20px; padding-right: 20px; }
          }
          @media (max-width: 480px) {
            .section-padding-hero { padding-top: 100px; padding-bottom: 48px; padding-left: 16px; padding-right: 16px; }
          }

          .section-padding-cta { padding: 120px 24px; }
          @media (max-width: 768px) { .section-padding-cta { padding: 80px 20px; } }
          @media (max-width: 480px) { .section-padding-cta { padding: 64px 16px; } }

          @media (max-width: 768px) {
            .card-responsive { padding: 24px !important; }
            .small-card-responsive { padding: 20px !important; }
          }
          @media (max-width: 480px) {
            .card-responsive { padding: 20px !important; }
            .small-card-responsive { padding: 16px !important; }
          }

          .how-step {
            display: flex;
            gap: 24px;
            padding: 28px;
            align-items: center;
            background: white;
            border-radius: 16px;
            border: 2px solid ${palette.border};
            box-shadow: 0 4px 0 rgba(0,0,0,0.05);
            transition: transform 0.25s ease, box-shadow 0.25s ease;
          }
          .how-step:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 24px rgba(45, 42, 94, 0.1);
          }
          @media (max-width: 560px) {
            .how-step { flex-direction: column; text-align: center; gap: 16px; padding: 24px 20px; }
          }

          .feature-card { transition: transform 0.25s ease, box-shadow 0.25s ease; }
          .feature-card:hover { transform: translateY(-6px); box-shadow: 0 12px 28px rgba(45, 42, 94, 0.12); }

          .game-card { 
            transition: transform 0.25s ease, box-shadow 0.25s ease;
            will-change: transform;
          }
          .game-card:hover { box-shadow: 0 12px 28px rgba(45, 42, 94, 0.12); }

          .hamburger { display: none; background: none; border: none; cursor: pointer; padding: 8px; z-index: 1001; }
          
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

          @media (max-width: 560px) {
            .cta-title { font-size: 26px !important; }
            .cta-button { font-size: 17px !important; padding: 16px 36px !important; }
          }

          /* ===== HIDE FLOATING SHAPES ON MOBILE ===== */
          @media (max-width: 560px) {
            .animate-float-shape { display: none !important; }
          }

          /* ===== DEMO XP BAR ===== */
          .demo-xp-bar {
            max-width: 520px;
            margin: 32px auto 0;
            padding: 16px 20px;
            background: rgba(255,255,255,0.15);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border-radius: 16px;
            border: 2px solid rgba(255,255,255,0.3);
            cursor: pointer;
            user-select: none;
            transition: transform 0.15s ease, background 0.2s ease;
          }
          .demo-xp-bar:active {
            transform: scale(0.98);
          }
          @media (max-width: 480px) {
            .demo-xp-bar { padding: 12px 14px; margin-top: 24px; }
          }

          /* ===== HERO MASCOT WRAPPER ===== */
          .hero-mascot {
            display: block;
            width: min(320px, 70%);
            height: auto;
            margin: 0 auto;
            max-width: 320px;
            transition: transform 0.25s ease-out;
          }
          @media (max-width: 768px) {
            .hero-mascot { width: min(260px, 60%); max-width: 260px; }
          }
          @media (max-width: 480px) {
            .hero-mascot { width: min(220px, 65%); max-width: 220px; }
          }
        `}
      </style>

      <div style={{ minHeight: '100vh', background: palette.cream, overflowX: 'hidden' }}>
        
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
            <div style={{ ...chunkyButton(palette.teal, palette.tealShadow, 'sm'), fontSize: '18px', padding: '8px 20px' }}>
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
                    transition: 'color 0.2s ease, transform 0.2s ease',
                    textShadow: isScrolled ? 'none' : '0 2px 4px rgba(0,0,0,0.3)',
                  }}
                  onMouseOver={e => { e.currentTarget.style.color = palette.warmOrange; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseOut={e => { e.currentTarget.style.color = isScrolled ? palette.deepNavy : palette.white; e.currentTarget.style.transform = 'translateY(0)'; }}
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

          {/* ===== FLOATING DECORATIVE SHAPES (hidden on mobile via CSS) ===== */}
          <div className="animate-float-shape" style={{
            position: 'absolute',
            top: '20%',
            left: '8%',
            width: '70px',
            height: '70px',
            borderRadius: '18px',
            background: 'rgba(255,255,255,0.15)',
            border: '2px solid rgba(255,255,255,0.3)',
            zIndex: 1,
            transform: isTouchDevice ? 'none' : `translate(${mouse.x * 30}px, ${mouse.y * 30}px)`,
            transition: 'transform 0.3s ease-out',
            pointerEvents: 'none',
          }} />
          <div className="animate-float-shape" style={{
            position: 'absolute',
            bottom: '18%',
            right: '10%',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.12)',
            border: '2px solid rgba(255,255,255,0.25)',
            zIndex: 1,
            animationDelay: '1.5s',
            transform: isTouchDevice ? 'none' : `translate(${mouse.x * -25}px, ${mouse.y * -25}px)`,
            transition: 'transform 0.3s ease-out',
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

            {/* ===== HERO SUBTITLE (no typing effect — instant render) ===== */}
            <p style={{
              color: palette.white,
              fontSize: 'clamp(16px, 1.2vw, 22px)',
              fontFamily: "'Nunito', sans-serif",
              fontWeight: '600',
              lineHeight: 1.6,
              maxWidth: '700px',
              margin: '0 auto 48px',
              textShadow: '0 2px 6px rgba(0,0,0,0.5)',
            }}>
              Build your vocabulary with a CEFR-aligned word library and progress tracking that makes learning engaging, structured, and rewarding.
            </p>

            {/* ===== ANIMATED COUNTERS ===== */}
            <div className="hero-stats" ref={heroStatsRef}>
              {[
                { value: counters.games, label: 'Game Modes' },
                { value: counters.levels, label: 'CEFR Levels' },
                { value: counters.free + '%', label: 'Free to Start' },
                { value: counters.hours + '/7', label: 'Learn Anytime' },
              ].map((stat, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  borderRadius: '16px',
                  padding: '20px 12px',
                  textAlign: 'center',
                  border: '2px solid rgba(255,255,255,0.3)',
                  transition: 'transform 0.2s ease, background 0.2s ease',
                  cursor: 'default',
                }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.background = 'rgba(255,255,255,0.22)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
                >
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

            {/* ===== DEMO XP BAR (interactive, responsive) ===== */}
            <div
              className="demo-xp-bar"
              onClick={handleDemoXpClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleDemoXpClick(); }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
                color: palette.white,
                fontFamily: "'Fredoka', sans-serif",
                fontWeight: '800',
                fontSize: 'clamp(11px, 1.1vw, 13px)',
                letterSpacing: '0.05em',
                gap: '8px',
                flexWrap: 'wrap',
              }}>
                <span>🎮 Tap me — Try it!</span>
                <span>{demoXp} / 100 XP · {demoClicks} taps</span>
              </div>
              <div style={{
                width: '100%',
                height: '14px',
                background: 'rgba(45, 42, 94, 0.35)',
                borderRadius: '999px',
                overflow: 'hidden',
                border: '2px solid rgba(255,255,255,0.25)',
              }}>
                <div style={{
                  width: `${demoXp}%`,
                  height: '100%',
                  borderRadius: '999px',
                  background: `linear-gradient(90deg, ${palette.warmOrange}, #FFF8B0, ${palette.warmOrange})`,
                  backgroundSize: '200% 100%',
                  transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                }} />
              </div>
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
                  VocaboPlay transforms vocabulary learning into an engaging journey. Learn new words from a CEFR-aligned library, practice through games, and track your progress.
                </p>
              </div>
              <div className="animate-slide-right" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img 
                  src="/image/mascot-sitting.png" 
                  alt="VocaboPlay mascot sitting"
                  className="hero-mascot"
                  style={{ 
                    transform: isTouchDevice 
                      ? 'none' 
                      : `perspective(900px) rotateY(${mouse.x * 10}deg) rotateX(${mouse.y * -8}deg)`,
                    filter: `drop-shadow(0 12px 24px ${palette.warmOrange}40)`,
                  }}
                  onMouseOver={e => { if (!isTouchDevice) e.currentTarget.style.transform += ' scale(1.06)'; }}
                  onMouseOut={e => {
                    e.currentTarget.style.transform = isTouchDevice 
                      ? 'none' 
                      : `perspective(900px) rotateY(${mouse.x * 10}deg) rotateX(${mouse.y * -8}deg)`;
                  }}
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
                  className="hero-mascot"
                  style={{ 
                    transform: isTouchDevice 
                      ? 'none' 
                      : `perspective(900px) rotateY(${mouse.x * -10}deg) rotateX(${mouse.y * -8}deg)`,
                    filter: `drop-shadow(0 12px 24px ${palette.teal}40)`,
                  }}
                  onMouseOver={e => { if (!isTouchDevice) e.currentTarget.style.transform += ' scale(1.06)'; }}
                  onMouseOut={e => {
                    e.currentTarget.style.transform = isTouchDevice 
                      ? 'none' 
                      : `perspective(900px) rotateY(${mouse.x * -10}deg) rotateX(${mouse.y * -8}deg)`;
                  }}
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
                  It's built around a CEFR-aligned word library and supports vocabulary development through structured games and progress monitoring.
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
                Understand the CEFR Framework
              </h2>
              <p style={{ ...bodyStyle, maxWidth: '760px', margin: '0 auto' }}>
                The Common European Framework of Reference for Languages (CEFR) is an internationally recognized framework that VocaboPlay uses to organize vocabulary into six proficiency levels, ranging from A1 to C2. Vocabulary selection is guided by the Oxford Learner's Word Lists, particularly the Oxford 3000 and Oxford 5000, for levels A1 through C1, while the Cambridge English Vocabulary Profile is used as a reference for C2-level vocabulary.
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
                    onMouseOver={e => { if (!active) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = palette.teal; } }}
                    onMouseOut={e => { if (!active) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = palette.border; } }}
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
                }} key={activeLevel}>{activeLevel}</div>
                <div style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: '14px',
                  fontWeight: '800',
                  color: palette.bodyText,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}>{cefrLevels[activeLevel].title}</div>
              </div>

              <div key={activeLevel + '-text'}>
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
                ['CEFR', 'A1 to C2', 'Common European Framework of Reference for Languages — the international scale VocaboPlay uses to structure difficulty and progression.'],
                ['Oxford 3000 & 5000', 'A1 to C1', "Oxford Learner's CEFR-aligned word lists, used as the primary vocabulary reference from beginner through advanced levels."],
                ['Cambridge EVP', 'C2', 'The Cambridge English Vocabulary Profile, used to source proficient-level C2 vocabulary beyond the Oxford lists.'],
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
                Play Your Way to a Bigger Vocabulary
              </h2>
              <p style={{ ...bodyStyle, maxWidth: '700px', margin: '0 auto' }}>
                VocaboPlay currently features three live game modes, all built around your CEFR word library — with more modes on the way.
              </p>
            </div>
            
            <div className="games-grid">
              {[
                { title: 'Syno Quest', desc: 'Guess the word from the picture — a fun, visual way to build recall.', color: palette.teal, icon: 'game', comingSoon: false },
                { title: 'Match Game', desc: 'Connect words with their definitions in a fast-paced memory challenge.', color: palette.coral, icon: 'check', comingSoon: false },
                { title: 'Story Quest', desc: 'Read bite-sized narratives and learn vocabulary in context.', color: palette.softGreen, icon: 'chart', comingSoon: false },
                { title: 'Quiz Master', desc: 'Adaptive multiple-choice quizzes that sharpen recall.', color: palette.warmOrange, icon: 'brain', comingSoon: true },
                { title: 'GuessWhat', desc: 'Deduce the correct word from visual clues and sentence context.', color: palette.deepNavy, icon: 'play', comingSoon: true },
                { title: 'Sentence Builder', desc: 'Construct grammatically correct sentences using your vocabulary.', color: palette.teal, icon: 'arrowRight', comingSoon: true },
              ].map((game, i) => (
                <div
                  key={i}
                  className="game-card card-responsive"
                  onMouseMove={handleCardTilt}
                  onMouseLeave={resetCardTilt}
                  style={{ 
                    ...cardStyle,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    textAlign: 'left',
                    height: '100%',
                    padding: '28px',
                    borderTop: `6px solid ${game.color}`,
                    position: 'relative',
                    opacity: game.comingSoon ? 0.85 : 1,
                  }}
                >
                  {game.comingSoon && (
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: '800',
                      color: palette.bodyText,
                      background: palette.cream,
                      border: `1px solid ${palette.border}`,
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontFamily: "'Nunito', sans-serif",
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      <Icon name="clock" size={12} color={palette.bodyText} />
                      Coming Soon
                    </div>
                  )}

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
                    disabled={game.comingSoon}
                    style={{
                      ...chunkyButton(game.comingSoon ? palette.border : game.color, game.comingSoon ? palette.border : game.color + 'CC', 'sm'),
                      width: '100%',
                      padding: '12px 16px',
                      color: game.comingSoon ? palette.bodyText : palette.white,
                      cursor: game.comingSoon ? 'not-allowed' : 'pointer',
                      boxShadow: game.comingSoon ? 'none' : `0 4px 0 ${game.color}CC`,
                    }}
                    onMouseDown={e => !game.comingSoon && pressButton(e, game.color + 'CC')}
                    onMouseUp={e => !game.comingSoon && releaseButton(e, game.color + 'CC')}
                    onMouseLeave={e => !game.comingSoon && releaseButton(e, game.color + 'CC')}
                  >
                    {game.comingSoon ? 'Coming Soon' : 'Play Now'}
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
                { icon: 'brain', title: 'CEFR-Aligned', desc: 'Vocabulary organized by CEFR level, sourced from the Oxford 3000/5000 and Cambridge EVP.', color: palette.warmOrange },
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
                { num: 1, title: 'Create an Account', desc: 'Sign up for free and set up your learning profile.', color: palette.teal },
                { num: 2, title: 'Browse the CEFR Word Library', desc: 'Explore a vocabulary library organized by CEFR level, A1 through C2. Filter words by level and focus on what matches your goals.', color: palette.warmOrange },
                { num: 3, title: 'Learn Through Games', desc: 'Practice with Syno Quest, Match Game, and Story Quest — all pulling from your word library, with more game modes launching soon.', color: palette.coral },
                { num: 4, title: 'Track Your Progress', desc: 'Monitor your improvement, keep your streak going, and watch your vocabulary grow.', color: palette.softGreen },
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