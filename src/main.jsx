import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// ============================================================
// 🎮 LANDSCAPE MOBILE FIX — Game-Only Zoom
// ============================================================
// Ang zoom ay nag-a-apply LANG kapag:
//   1. Naka-landscape ang phone (width > height)
//   2. Maliit ang height (<= 600px)
//   3. Nasa loob ng GAME (may game element sa DOM)
//
// Hindi ito nag-a-apply sa Dashboard, Word Library, at iba pa.
// ============================================================

function applyLandscapeFix() {
  const root = document.getElementById('root');
  if (!root) return;

  const isLandscape = window.innerWidth > window.innerHeight;
  const isSmallHeight = window.innerHeight <= 600;

  // ✅ I-detect kung nasa loob ng GAME (base sa game-specific DOM elements)
  const isInGame = !!(
    document.querySelector('.sq-play-wrapper') ||    // SynoQuest playing
    document.querySelector('.sq-main-card') ||        // SynoQuest (fallback)
    document.querySelector('.mg-cards') ||            // MatchGame playing
    document.querySelector('.mg-play-wrapper') ||     // MatchGame (fallback)
    document.querySelector('.sq-book-select-wrapper') // StoryQuest book select
  );

  // ✅ Mag-zoom LANG kapag nasa GAME at landscape mobile
  if (isLandscape && isSmallHeight && isInGame) {
    // ✅ Sakto lang na scale (0.80 base, hindi 0.55)
    let scale = 0.80;
    if (window.innerHeight <= 360) {
      scale = 0.65;
    } else if (window.innerHeight <= 420) {
      scale = 0.72;
    } else if (window.innerHeight <= 500) {
      scale = 0.80;
    } else {
      scale = 0.90;
    }

    root.style.zoom = String(scale);
    root.style.width = `${100 / scale}%`;
    root.style.height = `${100 / scale}%`;
    root.style.overflow = 'hidden';

    document.body.style.overflow = 'hidden';
    document.body.style.width = '100vw';
    document.body.style.height = '100dvh';
    document.documentElement.style.overflow = 'hidden';
  } else {
    // ✅ Reset kapag nasa Dashboard, portrait, o desktop
    root.style.zoom = '';
    root.style.width = '';
    root.style.height = '';
    root.style.overflow = '';
    document.body.style.overflow = '';
    document.body.style.width = '';
    document.body.style.height = '';
    document.documentElement.style.overflow = '';
  }
}

// Apply on load
applyLandscapeFix();

// Apply on resize
window.addEventListener('resize', applyLandscapeFix);

// Apply on orientation change (with small delay)
window.addEventListener('orientationchange', () => {
  setTimeout(applyLandscapeFix, 200);
});

// Periodic check — para sure na laging naka-apply
setInterval(applyLandscapeFix, 1000);

// ============================================================

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)