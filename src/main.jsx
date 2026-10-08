import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// ============================================================
// 🎮 LANDSCAPE MOBILE FIX — Clean + Debounced
// ============================================================

let fixTimeout = null;
let isCurrentlyInGame = false;

// ✅ Request true fullscreen + lock orientation
async function enterGameFullscreen() {
  try {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      await elem.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
    } else if (elem.webkitRequestFullscreen) {
      await elem.webkitRequestFullscreen().catch(() => {});
    }
    if (screen.orientation && screen.orientation.lock) {
      try {
        await screen.orientation.lock('landscape');
      } catch (e) {}
    }
  } catch (err) {}
}

async function exitGameFullscreen() {
  try {
    if (document.fullscreenElement) {
      if (document.exitFullscreen) {
        await document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen().catch(() => {});
      }
    }
    if (screen.orientation && screen.orientation.unlock) {
      try { screen.orientation.unlock(); } catch (e) {}
    }
  } catch (err) {}
}

function isInGame() {
  return !!(
    document.querySelector('.sq-play-wrapper') ||
    document.querySelector('.sq-main-card') ||
    document.querySelector('.mg-cards') ||
    document.querySelector('.mg-play-wrapper') ||
    document.querySelector('.sq-book-select-wrapper')
  );
}

// ✅ Convert fixed-position backgrounds sa absolute
function fixFullScreenBackgrounds() {
  const root = document.getElementById('root');
  if (!root) return;

  const divs = root.querySelectorAll('div');
  divs.forEach(el => {
    const computed = window.getComputedStyle(el);
    if (computed.position === 'fixed') {
      const rect = el.getBoundingClientRect();
      // Kung malaki yung element (>60% ng viewport), i-convert
      if (rect.width >= window.innerWidth * 0.6 && rect.height >= window.innerHeight * 0.6) {
        el.style.position = 'absolute';
        el.style.top = '0';
        el.style.left = '0';
        el.style.right = '0';
        el.style.bottom = '0';
        el.style.width = '100%';
        el.style.height = '100%';
        el.style.maxWidth = '100%';
        el.style.maxHeight = '100%';
        el.style.minWidth = '100%';
        el.style.minHeight = '100%';
        el.setAttribute('data-fixed-converted', 'true');
      }
    }
  });
}

// ✅ Main function — DEBOUNCED para hindi mag-flicker
function applyLandscapeFix() {
  // Clear previous timeout
  if (fixTimeout) clearTimeout(fixTimeout);
  
  fixTimeout = setTimeout(() => {
    const nowInGame = isInGame();

    // ✅ Enter fullscreen kapag pumasok sa game
    if (nowInGame && !isCurrentlyInGame) {
      isCurrentlyInGame = true;
      enterGameFullscreen();
      // Apply fix pagkatapos ng fullscreen
      setTimeout(fixFullScreenBackgrounds, 100);
      setTimeout(fixFullScreenBackgrounds, 300);
      setTimeout(fixFullScreenBackgrounds, 600);
    } 
    // ✅ Exit fullscreen kapag labas ng game
    else if (!nowInGame && isCurrentlyInGame) {
      isCurrentlyInGame = false;
      exitGameFullscreen();
    }
    // ✅ Kapag nasa game pa, re-apply lang ng fix (walang fullscreen re-trigger)
    else if (nowInGame) {
      fixFullScreenBackgrounds();
    }
  }, 150);
}

// ============================================================
// INITIALIZATION
// ============================================================

applyLandscapeFix();

window.addEventListener('resize', applyLandscapeFix);
window.addEventListener('orientationchange', () => {
  setTimeout(applyLandscapeFix, 100);
  setTimeout(applyLandscapeFix, 300);
});

// MutationObserver — debounced na, hindi mag-flicker
const observer = new MutationObserver(() => {
  applyLandscapeFix();
});

if (document.body) {
  observer.observe(document.body, { childList: true, subtree: true });
} else {
  window.addEventListener('DOMContentLoaded', () => {
    observer.observe(document.body, { childList: true, subtree: true });
  });
}

// ✅ Fullscreen sa unang user interaction
document.addEventListener('click', () => {
  if (isCurrentlyInGame && !document.fullscreenElement) {
    enterGameFullscreen();
  }
});

// ============================================================

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)