import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// ============================================================
// 🎮 LANDSCAPE MOBILE FIX — Game-Only Zoom (FINAL)
// ============================================================
// Ang zoom ay nag-a-apply LANG kapag nasa loob ng GAME.
// Ginamit ang mas gentle na scale (0.88-0.95) para puno
// yung screen pero hindi naman sobrang laki.
// ============================================================

function applyLandscapeFix() {
  const root = document.getElementById('root');
  if (!root) return;

  const isLandscape = window.innerWidth > window.innerHeight;
  const isSmallHeight = window.innerHeight <= 600;

  // ✅ I-detect kung nasa loob ng GAME
  const isInGame = !!(
    document.querySelector('.sq-play-wrapper') ||
    document.querySelector('.sq-main-card') ||
    document.querySelector('.mg-cards') ||
    document.querySelector('.mg-play-wrapper') ||
    document.querySelector('.sq-book-select-wrapper')
  );

  // ✅ Mag-zoom LANG kapag nasa GAME at landscape mobile
  if (isLandscape && isSmallHeight && isInGame) {
    // ✅ Sakto lang na scale — medyo malaki na para puno ang screen
    let scale = 0.95;
    if (window.innerHeight <= 360) {
      scale = 0.78;
    } else if (window.innerHeight <= 400) {
      scale = 0.85;
    } else if (window.innerHeight <= 440) {
      scale = 0.90;
    } else if (window.innerHeight <= 500) {
      scale = 0.94;
    } else {
      scale = 0.98;
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

// Apply on orientation change
window.addEventListener('orientationchange', () => {
  setTimeout(applyLandscapeFix, 200);
});

// Periodic check
setInterval(applyLandscapeFix, 1000);

// ============================================================

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)