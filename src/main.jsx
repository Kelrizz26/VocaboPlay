import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// ============================================================
// 🎮 LANDSCAPE MOBILE FIX — Optimized (Best of Both)
// ============================================================

let isInGame = false;

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

let checkTimeout = null;
function debouncedCheck() {
  if (checkTimeout) clearTimeout(checkTimeout);
  checkTimeout = setTimeout(checkGameState, 300);
}

const observer = new MutationObserver(debouncedCheck);

const startObserver = () => {
  checkGameState();
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: false });
  }
};

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', startObserver);
} else {
  startObserver();
}

window.addEventListener('orientationchange', () => {
  setTimeout(checkGameState, 500);
});

window.addEventListener('popstate', () => setTimeout(checkGameState, 300));

document.addEventListener('click', () => {
  if (isInGame && !document.fullscreenElement) {
    enterFullscreen();
  }
});

// ============================================================

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)