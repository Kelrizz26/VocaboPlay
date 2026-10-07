import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// ============================================================
// 🎮 LANDSCAPE MOBILE FIX — JavaScript Zoom Approach
// ============================================================
// Ito ang pinaka-reliable na fix. Sa halip na umasa sa CSS
// (na hindi kayang i-override ang inline styles), direktang
// ini-scale natin yung buong #root element gamit ang JS.
//
// Bakit `zoom`:
// - Sumasabay sa LAYOUT — walang nasasayang na space
// - Supported sa Chrome, Edge, Safari (lahat ng mobile browsers)
// ============================================================

function applyLandscapeFix() {
  const root = document.getElementById('root');
  if (!root) return;

  const isLandscape = window.innerWidth > window.innerHeight;
  const isSmallHeight = window.innerHeight <= 600;

  if (isLandscape && isSmallHeight) {
    // Compute scale based on viewport height
    let scale = 0.55;
    if (window.innerHeight <= 360) {
      scale = 0.40;
    } else if (window.innerHeight <= 420) {
      scale = 0.48;
    } else if (window.innerHeight <= 500) {
      scale = 0.55;
    } else {
      scale = 0.65;
    }

    // Apply zoom to root
    root.style.zoom = String(scale);
    root.style.width = `${100 / scale}%`;
    root.style.height = `${100 / scale}%`;
    root.style.overflow = 'hidden';

    // Lock body
    document.body.style.overflow = 'hidden';
    document.body.style.width = '100vw';
    document.body.style.height = '100dvh';
    document.documentElement.style.overflow = 'hidden';
  } else {
    // Reset when not in landscape
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

// Apply on orientation change (with small delay para tapos na yung rotation)
window.addEventListener('orientationchange', () => {
  setTimeout(applyLandscapeFix, 200);
});

// Periodic check — para sure na laging naka-apply
setInterval(applyLandscapeFix, 1000);

// ============================================================

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)