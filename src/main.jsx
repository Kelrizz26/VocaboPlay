import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// ============================================================
// 🎮 LANDSCAPE MOBILE FIX — Game-Only Zoom (FINAL VERSION)
// ============================================================

function applyLandscapeFix() {
  const root = document.getElementById('root');
  if (!root) return;

  const isLandscape = window.innerWidth > window.innerHeight;
  const isSmallHeight = window.innerHeight <= 600;

  const isInGame = !!(
    document.querySelector('.sq-play-wrapper') ||
    document.querySelector('.sq-main-card') ||
    document.querySelector('.mg-cards') ||
    document.querySelector('.mg-play-wrapper') ||
    document.querySelector('.sq-book-select-wrapper')
  );

  if (isLandscape && isSmallHeight && isInGame) {
    // ✅ Mas mataas na scale para puno yung screen
    let scale = 1.0;
    if (window.innerHeight <= 360) {
      scale = 0.85;
    } else if (window.innerHeight <= 400) {
      scale = 0.92;
    } else if (window.innerHeight <= 440) {
      scale = 0.96;
    } else if (window.innerHeight <= 500) {
      scale = 0.98;
    } else {
      scale = 1.0;
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

applyLandscapeFix();
window.addEventListener('resize', applyLandscapeFix);
window.addEventListener('orientationchange', () => {
  setTimeout(applyLandscapeFix, 200);
});
setInterval(applyLandscapeFix, 1000);

// ============================================================

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)