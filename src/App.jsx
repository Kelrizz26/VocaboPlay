import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// ============================================================
// 🎮 LANDSCAPE MOBILE FIX — Minimal & Stable (No Flicker)
// ============================================================

let isInGame = false;
let isFullscreenActive = false;

async function enterFullscreen() {
  try {
    const elem = document.documentElement;
    if (elem.requestFullscreen && !document.fullscreenElement) {
      await elem.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
    } else if (elem.webkitRequestFullscreen && !document.webkitFullscreenElement) {
      await elem.webkitRequestFullscreen().catch(() => {});
    }
    if (screen.orientation && screen.orientation.lock) {
      try { await screen.orientation.lock('landscape'); } catch (e) {}
    }
  } catch (err) {}
}

async function exitFullscreen() {
  try {
    if (document.fullscreenElement && document.exitFullscreen) {
      await document.exitFullscreen().catch(() => {});
    } else if (document.webkitFullscreenElement && document.webkitExitFullscreen) {
      await document.webkitExitFullscreen().catch(() => {});
    }
    if (screen.orientation && screen.orientation.unlock) {
      try { screen.orientation.unlock(); } catch (e) {}
    }
  } catch (err) {}
}

function checkGameState() {
  const nowInGame = !!(
    document.querySelector('.sq-play-wrapper') ||
    document.querySelector('.mg-cards') ||
    document.querySelector('.sq-book-select-wrapper')
  );

  if (nowInGame && !isInGame) {
    isInGame = true;
    // Add class para ma-CSS-target
    document.documentElement.classList.add('in-game');
    document.body.classList.add('in-game');
    enterFullscreen();
  } else if (!nowInGame && isInGame) {
    isInGame = false;
    document.documentElement.classList.remove('in-game');
    document.body.classList.remove('in-game');
    exitFullscreen();
  }
}

// ✅ Single listener lang — hindi nag-popol ng events
document.addEventListener('fullscreenchange', () => {
  isFullscreenActive = !!document.fullscreenElement;
  if (isFullscreenActive) {
    document.documentElement.classList.add('fullscreen-active');
    document.body.classList.add('fullscreen-active');
  } else {
    document.documentElement.classList.remove('fullscreen-active');
    document.body.classList.remove('fullscreen-active');
  }
});

// ✅ Debounced check — para hindi mag-flicker
let checkTimeout = null;
function debouncedCheck() {
  if (checkTimeout) clearTimeout(checkTimeout);
  checkTimeout = setTimeout(checkGameState, 300);
}

// ✅ Gentle observer — hindi mag-popol
const observer = new MutationObserver(debouncedCheck);

window.addEventListener('load', () => {
  checkGameState();
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: false });
  }
});

// ✅ Fallback resize listener (rare) — hindi na setInterval
window.addEventListener('orientationchange', () => {
  setTimeout(checkGameState, 500);
});

// ✅ Fullscreen retry on user interaction (browser policy)
document.addEventListener('click', () => {
  if (isInGame && !document.fullscreenElement) {
    enterFullscreen();
  }
});

// ============================================================

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)