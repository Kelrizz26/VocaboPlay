import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// ============================================================
// 🎮 LANDSCAPE FIX — Simple, No Flicker
// ============================================================

let isInGame = false;
let isFullscreenActive = false;

async function enterFullscreen() {
  try {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
    }
    if (screen.orientation && screen.orientation.lock) {
      try { await screen.orientation.lock('landscape'); } catch (e) {}
    }
  } catch (e) {}
}

async function exitFullscreen() {
  try {
    if (document.fullscreenElement && document.exitFullscreen) {
      await document.exitFullscreen().catch(() => {});
    }
    if (screen.orientation && screen.orientation.unlock) {
      try { screen.orientation.unlock(); } catch (e) {}
    }
  } catch (e) {}
}

// ✅ SIMPLE check — hindi nag-popol
function checkGameState() {
  const nowInGame = !!(
    document.querySelector('.sq-play-wrapper') ||
    document.querySelector('.mg-cards') ||
    document.querySelector('.sq-book-select-wrapper')
  );

  if (nowInGame === isInGame) return;

  isInGame = nowInGame;

  if (nowInGame) {
    document.documentElement.classList.add('in-game');
    document.body.classList.add('in-game');
    enterFullscreen();
  } else {
    document.documentElement.classList.remove('in-game');
    document.body.classList.remove('in-game');
    exitFullscreen();
  }
}

// ✅ Fullscreen change listener (para sa class toggle)
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

// ✅ Check kapag may navigation (react-router)
window.addEventListener('popstate', () => setTimeout(checkGameState, 300));

// ✅ Check after route changes — debounced
let routeCheckTimer = null;
const observer = new MutationObserver(() => {
  if (routeCheckTimer) clearTimeout(routeCheckTimer);
  routeCheckTimer = setTimeout(checkGameState, 400);
});

// ✅ Start observer after DOM ready
const startObserver = () => {
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: false });
    checkGameState();
  }
};

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', startObserver);
} else {
  startObserver();
}

// ✅ Fullscreen retry on click (browser policy)
document.addEventListener('click', () => {
  if (isInGame && !document.fullscreenElement) {
    enterFullscreen();
  }
});

// ============================================================

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)