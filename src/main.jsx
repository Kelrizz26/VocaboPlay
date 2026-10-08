import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// ============================================================
// 🎮 LANDSCAPE MOBILE FIX — Fullscreen + Orientation Lock
// Walang zoom. CSS na ang bahala sa full-width via 100dvw.
// ============================================================

// ✅ Request true fullscreen + lock orientation kapag pumasok sa game
async function enterGameFullscreen() {
  try {
    const elem = document.documentElement;
    
    // Request fullscreen
    if (elem.requestFullscreen) {
      await elem.requestFullscreen({ navigationUI: 'hide' });
    } else if (elem.webkitRequestFullscreen) {
      await elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      await elem.msRequestFullscreen();
    }

    // ✅ Lock orientation to landscape (KEY para mawala black bars)
    if (screen.orientation && screen.orientation.lock) {
      try {
        await screen.orientation.lock('landscape');
      } catch (orientErr) {
        console.log('Orientation lock failed (normal sa iOS):', orientErr.message);
      }
    }
  } catch (err) {
    console.log('Fullscreen failed:', err.message);
  }
}

// ✅ Exit fullscreen kapag labas ng game
async function exitGameFullscreen() {
  try {
    if (document.fullscreenElement) {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen();
      }
    }
    
    if (screen.orientation && screen.orientation.unlock) {
      try {
        screen.orientation.unlock();
      } catch (e) {}
    }
  } catch (err) {
    console.log('Exit fullscreen failed:', err.message);
  }
}

// ✅ Check kung nasa loob ng game
function isInGame() {
  return !!(
    document.querySelector('.sq-play-wrapper') ||
    document.querySelector('.sq-main-card') ||
    document.querySelector('.mg-cards') ||
    document.querySelector('.mg-play-wrapper') ||
    document.querySelector('.sq-book-select-wrapper')
  );
}

// ✅ Convert fixed-position backgrounds sa absolute (para puno yung screen)
function fixFullScreenBackgrounds() {
  const root = document.getElementById('root');
  if (!root) return;

  const divs = root.querySelectorAll('div');
  divs.forEach(el => {
    const style = el.getAttribute('style') || '';
    
    // Reset kung na-convert na dati
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

    // ✅ Convert fixed → absolute kapag malaki yung element
    const computed = window.getComputedStyle(el);
    if (computed.position === 'fixed') {
      const rect = el.getBoundingClientRect();
      if (rect.width >= window.innerWidth * 0.6 && rect.height >= window.innerHeight * 0.6) {
        // Save original values
        el.dataset.wasConverted = 'true';
        el.dataset.origPosition = el.style.position || 'fixed';
        el.dataset.origWidth = el.style.width || '';
        el.dataset.origHeight = el.style.height || '';
        el.dataset.origTop = el.style.top || '';
        el.dataset.origLeft = el.style.left || '';
        el.dataset.origRight = el.style.right || '';
        el.dataset.origBottom = el.style.bottom || '';

        // Convert to absolute para naka-anchor sa parent
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
}

// ✅ Main function
function applyLandscapeFix() {
  const root = document.getElementById('root');
  if (!root) return;

  const wasInGame = root.dataset.wasInGame === 'true';
  const nowInGame = isInGame();

  // Track state
  root.dataset.wasInGame = nowInGame ? 'true' : 'false';

  // ✅ Enter fullscreen kapag pumasok sa game
  if (nowInGame && !wasInGame) {
    enterGameFullscreen();
  } 
  // ✅ Exit fullscreen kapag labas ng game
  else if (!nowInGame && wasInGame) {
    exitGameFullscreen();
  }

  // ✅ Fix yung fixed positioning sa mga game backgrounds
  if (nowInGame) {
    setTimeout(fixFullScreenBackgrounds, 50);
    setTimeout(fixFullScreenBackgrounds, 200);
    setTimeout(fixFullScreenBackgrounds, 500);
  }
}

// ============================================================
// INITIALIZATION
// ============================================================

// Run on load
applyLandscapeFix();

// Listeners
window.addEventListener('resize', applyLandscapeFix);
window.addEventListener('orientationchange', () => {
  setTimeout(applyLandscapeFix, 100);
  setTimeout(applyLandscapeFix, 300);
  setTimeout(applyLandscapeFix, 600);
});

// MutationObserver para sa dynamic na changes (game mount/unmount)
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

// ✅ I-trigger ang fullscreen sa unang user interaction (browser policy)
document.addEventListener('click', () => {
  const root = document.getElementById('root');
  if (root && root.dataset.wasInGame === 'true' && !document.fullscreenElement) {
    enterGameFullscreen();
  }
}, { once: false });

// Periodic check (safety net)
setInterval(applyLandscapeFix, 1000);

// ============================================================

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)