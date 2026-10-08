import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// ============================================================
// 🎮 LANDSCAPE MOBILE FIX — Fill Entire Screen (No Black Bars)
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

  // Reset lahat
  root.style.zoom = '';
  root.style.transform = '';
  root.style.transformOrigin = '';
  root.style.width = '';
  root.style.height = '';
  root.style.position = '';
  root.style.top = '';
  root.style.left = '';
  root.style.right = '';
  root.style.bottom = '';
  root.style.overflow = '';
  root.style.margin = '';
  root.style.padding = '';

  if (isLandscape && isSmallHeight && isInGame) {
    // ✅ Compute scale based on viewport height
    let scale = 1.0;
    if (window.innerHeight <= 360) scale = 0.88;
    else if (window.innerHeight <= 400) scale = 0.94;
    else if (window.innerHeight <= 440) scale = 0.97;
    else if (window.innerHeight <= 500) scale = 0.99;
    else scale = 1.0;

    // ✅ Zoom #root — puno yung screen
    root.style.zoom = String(scale);
    root.style.width = `${100 / scale}vw`;
    root.style.height = `${100 / scale}dvh`;
    root.style.position = 'fixed';
    root.style.top = '0';
    root.style.left = '0';
    root.style.right = '0';
    root.style.bottom = '0';
    root.style.margin = '0';
    root.style.padding = '0';
    root.style.overflow = 'hidden';

    // ✅ Force body at html
    document.body.style.zoom = String(scale);
    document.body.style.width = `${100 / scale}vw`;
    document.body.style.height = `${100 / scale}dvh`;
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = '0';
    document.body.style.left = '0';

    document.documentElement.style.width = '100vw';
    document.documentElement.style.height = '100dvh';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.background = '#2A2845';
  } else {
    document.body.style.zoom = '';
    document.body.style.width = '';
    document.body.style.height = '';
    document.body.style.margin = '';
    document.body.style.padding = '';
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.documentElement.style.width = '';
    document.documentElement.style.height = '';
    document.documentElement.style.overflow = '';
    document.documentElement.style.background = '';
  }
}

applyLandscapeFix();
window.addEventListener('resize', applyLandscapeFix);
window.addEventListener('orientationchange', () => {
  setTimeout(applyLandscapeFix, 100);
  setTimeout(applyLandscapeFix, 300);
  setTimeout(applyLandscapeFix, 600);
});
setInterval(applyLandscapeFix, 500);

// ============================================================

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)