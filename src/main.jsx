import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// ============================================================
// 🎮 LANDSCAPE MOBILE FIX — With Fixed → Absolute Conversion
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
  root.style.width = '';
  root.style.height = '';
  root.style.position = '';
  root.style.top = '';
  root.style.left = '';
  root.style.overflow = '';
  root.style.margin = '';
  root.style.padding = '';

  // Reset fixed → absolute conversion
  const allDivs = root.querySelectorAll('div');
  allDivs.forEach(el => {
    if (el.dataset.wasConverted === 'true') {
      el.style.position = el.dataset.origPosition || '';
      el.style.width = el.dataset.origWidth || '';
      el.style.height = el.dataset.origHeight || '';
      el.style.top = el.dataset.origTop || '';
      el.style.left = el.dataset.origLeft || '';
      el.style.right = el.dataset.origRight || '';
      el.style.bottom = el.dataset.origBottom || '';
      delete el.dataset.wasConverted;
      delete el.dataset.origPosition;
      delete el.dataset.origWidth;
      delete el.dataset.origHeight;
      delete el.dataset.origTop;
      delete el.dataset.origLeft;
      delete el.dataset.origRight;
      delete el.dataset.origBottom;
    }
  });

  if (isLandscape && isSmallHeight && isInGame) {
    let scale = 1.0;
    if (window.innerHeight <= 360) scale = 0.88;
    else if (window.innerHeight <= 400) scale = 0.94;
    else if (window.innerHeight <= 440) scale = 0.97;
    else if (window.innerHeight <= 500) scale = 0.99;

    // ✅ Zoom #root
    root.style.zoom = String(scale);
    root.style.width = `${100 / scale}vw`;
    root.style.height = `${100 / scale}dvh`;
    root.style.position = 'fixed';
    root.style.top = '0';
    root.style.left = '0';
    root.style.overflow = 'hidden';
    root.style.margin = '0';
    root.style.padding = '0';

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

    // ✅ CRITICAL FIX: Convert all fixed-position elements to absolute
    setTimeout(() => {
      const divsToFix = root.querySelectorAll('div');
      divsToFix.forEach(el => {
        const computed = window.getComputedStyle(el);
        if (computed.position === 'fixed') {
          const rect = el.getBoundingClientRect();
          // Kung malaking elemento (nag-fill sa viewport), i-convert
          if (rect.width >= window.innerWidth * 0.7 && rect.height >= window.innerHeight * 0.7) {
            // Save original values
            el.dataset.wasConverted = 'true';
            el.dataset.origPosition = el.style.position || 'fixed';
            el.dataset.origWidth = el.style.width || '';
            el.dataset.origHeight = el.style.height || '';
            el.dataset.origTop = el.style.top || '';
            el.dataset.origLeft = el.style.left || '';
            el.dataset.origRight = el.style.right || '';
            el.dataset.origBottom = el.style.bottom || '';

            // Convert
            el.style.position = 'absolute';
            el.style.top = '0';
            el.style.left = '0';
            el.style.right = '0';
            el.style.bottom = '0';
            el.style.width = '100%';
            el.style.height = '100%';
          }
        }
      });
    }, 150);
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
setInterval(applyLandscapeFix, 800);

// ============================================================

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)