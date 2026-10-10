// src/utils/backgroundMusic.js
// 🎵 MP3-BASED BACKGROUND MUSIC — BULLETPROOF VERSION
// ✅ FIX: Phantom music on first click (currentTrack no longer defaults to 'lobby')
// ✅ FIX: stop() / start() race conditions (proper timer + stale-guard)
// ✅ FIX: Auto-retry only for explicitly requested tracks (pendingTrack)
// ✅ NEW: pause() for immediate halt without reset
// ✅ NEW: Global beforeunload cleanup
// ✅ NEW: Stale audio element guards on fade/play callbacks

class BackgroundMusic {
  constructor() {
    this.enabled = true;
    this.audioElement = null;
    this.isPlaying = false;
    this.currentTrack = null;      // ✅ FIX: no more phantom 'lobby'
    this.pendingTrack = null;      // ✅ FIX: retry only explicit requests
    this.volume = 0.35;
    this.fadeInterval = null;
    this.stopTimer = null;         // ✅ FIX: track the stop timeout
    this.hasUserInteracted = false;

    // 🎵 MP3 file paths
    this.tracks = {
      lobby: '/music/lobby.mp3',        // SynoQuest music
      gameplay: '/music/gameplay.mp3',  // MatchGame music
      final: '/music/gameplay.mp3',
      victory: '/music/lobby.mp3',
      menu: '/music/lobby.mp3',
    };

    // Track-specific volumes
    this.trackVolumes = {
      lobby: 0.30,
      gameplay: 0.35,
      final: 0.40,
      victory: 0.45,
      menu: 0.25,
    };

    // Load user preferences
    try {
      const soundPref = localStorage.getItem('vocaboplay_sound');
      if (soundPref !== null) this.enabled = JSON.parse(soundPref);

      const volPref = localStorage.getItem('vocaboplay_music_volume');
      if (volPref !== null) this.volume = parseFloat(volPref);
    } catch (e) { /* ignore */ }

    // Detect first user interaction (autoplay policy workaround)
    if (typeof window !== 'undefined') {
      const markInteracted = () => {
        this.hasUserInteracted = true;
        window.removeEventListener('click', markInteracted);
        window.removeEventListener('keydown', markInteracted);
        window.removeEventListener('touchstart', markInteracted);

        // ✅ FIX: Only retry if start() was explicitly requested and blocked
        if (this.enabled && this.pendingTrack) {
          const track = this.pendingTrack;
          this.pendingTrack = null;
          this.start(track);
        }
      };
      window.addEventListener('click', markInteracted);
      window.addEventListener('keydown', markInteracted);
      window.addEventListener('touchstart', markInteracted);

      // ✅ Global safety net — kill audio when tab closes
      window.addEventListener('beforeunload', () => this.destroy());
    }
  }

  // 🎵 Get or create audio element for a track
  getAudioElement(track) {
    const src = this.tracks[track] || this.tracks.lobby;

    // Reuse if same source
    if (this.audioElement && this.audioElement.dataset.track === track) {
      return this.audioElement;
    }

    // ✅ Cleanup previous element properly
    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.src = '';
        this.audioElement.load();
      } catch (e) { /* ignore */ }
      this.audioElement = null;
    }

    const audio = new Audio(src);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0;
    audio.dataset.track = track;

    audio.onerror = () => {
      console.warn(`[Music] MP3 not found: ${src}`);
      if (this.audioElement === audio) this.isPlaying = false;
    };

    // ✅ Only mutate state if this is still the active element
    audio.onplay = () => { if (this.audioElement === audio) this.isPlaying = true; };
    audio.onpause = () => { if (this.audioElement === audio) this.isPlaying = false; };

    this.audioElement = audio;
    return audio;
  }

  // 🎚️ Smooth fade to target volume
  fadeTo(targetVolume, duration = 800) {
    if (!this.audioElement) return;
    if (this.fadeInterval) clearInterval(this.fadeInterval);

    const el = this.audioElement;   // ✅ capture for stale-guard
    const startVolume = el.volume;
    const steps = Math.max(1, Math.floor(duration / 30));
    const stepTime = duration / steps;
    const volumeStep = (targetVolume - startVolume) / steps;
    let currentStep = 0;

    this.fadeInterval = setInterval(() => {
      currentStep++;
      // ✅ Abort if audio element changed (stale fade)
      if (!this.audioElement || this.audioElement !== el) {
        clearInterval(this.fadeInterval);
        this.fadeInterval = null;
        return;
      }
      const newVol = Math.max(0, Math.min(1, startVolume + volumeStep * currentStep));
      el.volume = newVol;

      if (currentStep >= steps) {
        clearInterval(this.fadeInterval);
        this.fadeInterval = null;
        el.volume = Math.max(0, Math.min(1, targetVolume));
      }
    }, stepTime);
  }

  // ▶️ Start playing music
  start(track = 'lobby') {
    if (!this.enabled) {
      this.isPlaying = false;
      return;
    }

    // ✅ Cancel any pending stop timer from a previous stop() call
    if (this.stopTimer) {
      clearTimeout(this.stopTimer);
      this.stopTimer = null;
    }

    // Same track already playing — skip restart
    if (this.isPlaying && this.currentTrack === track && this.audioElement && !this.audioElement.paused) {
      return;
    }

    const previousTrack = this.currentTrack;
    this.currentTrack = track;

    // Switch track — pause the old element
    if (previousTrack !== track && this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
      } catch (e) { /* ignore */ }
    }

    const audio = this.getAudioElement(track);
    const targetVolume = this.trackVolumes[track] || this.volume;

    // Reset volume for fade-in if starting fresh
    if (audio.paused || audio.currentTime === 0) {
      audio.volume = 0;
    }

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // ✅ Stale-guard: only apply if this audio is still the active one
          if (this.audioElement !== audio) return;
          this.isPlaying = true;
          this.fadeTo(targetVolume, 1000);
        })
        .catch((err) => {
          console.warn('[Music] Autoplay blocked:', err.message);
          if (this.audioElement === audio) {
            this.isPlaying = false;
            // ✅ Remember for retry on first user interaction
            this.pendingTrack = track;
          }
        });
    }
  }

  // ⏹️ Stop playing (with optional fade out)
  stop(fadeOut = true) {
    // ✅ Always clear the retry queue
    this.pendingTrack = null;

    // ✅ Cancel any existing stop timer (idempotent)
    if (this.stopTimer) {
      clearTimeout(this.stopTimer);
      this.stopTimer = null;
    }

    if (!this.audioElement) {
      this.isPlaying = false;
      this.currentTrack = null;
      return;
    }

    const el = this.audioElement;

    if (fadeOut && this.isPlaying) {
      this.fadeTo(0, 400);
      this.stopTimer = setTimeout(() => {
        this.stopTimer = null;
        try {
          if (el) {
            el.pause();
            el.currentTime = 0;
          }
        } catch (e) { /* ignore */ }
        // ✅ Only clear state if this element is still active
        if (this.audioElement === el) {
          this.isPlaying = false;
          this.currentTrack = null;
        }
      }, 450);
    } else {
      if (this.fadeInterval) {
        clearInterval(this.fadeInterval);
        this.fadeInterval = null;
      }
      try {
        el.pause();
        el.currentTime = 0;
      } catch (e) { /* ignore */ }
      this.isPlaying = false;
      this.currentTrack = null;
    }
  }

  // ⏸️ NEW: Immediate pause (no fade, no reset) — for temporary mute
  pause() {
    if (this.stopTimer) {
      clearTimeout(this.stopTimer);
      this.stopTimer = null;
    }
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
    if (this.audioElement) {
      try { this.audioElement.pause(); } catch (e) { /* ignore */ }
    }
    this.isPlaying = false;
  }

  // 🔄 Toggle on/off
  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('vocaboplay_sound', JSON.stringify(this.enabled));

    if (!this.enabled) {
      this.stop(false);
    } else if (this.currentTrack) {
      this.start(this.currentTrack);
    }
    return this.enabled;
  }

  // 🎵 Change track
  setTrack(track) {
    if (this.currentTrack === track && this.isPlaying) return;
    this.stop(false);
    this.currentTrack = track;
    if (this.enabled) this.start(track);
  }

  // 🔊 Set master volume (0.0 – 1.0)
  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    localStorage.setItem('vocaboplay_music_volume', String(this.volume));
    if (this.audioElement && this.isPlaying) {
      const trackVol = this.trackVolumes[this.currentTrack] || this.volume;
      this.audioElement.volume = this.volume * trackVol;
    }
  }

  // 🎚️ Get current volume
  getVolume() { return this.volume; }

  // 🔇 Set enabled state
  setEnabled(enabled) {
    this.enabled = !!enabled;
    localStorage.setItem('vocaboplay_sound', JSON.stringify(this.enabled));
    if (!this.enabled) this.stop(false);
  }

  // 🔍 Check if music is currently playing
  getIsPlaying() { return this.isPlaying; }

  // 🧹 Full cleanup
  destroy() {
    this.pendingTrack = null;
    if (this.stopTimer) {
      clearTimeout(this.stopTimer);
      this.stopTimer = null;
    }
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.src = '';
        this.audioElement.load();
      } catch (e) { /* ignore */ }
      this.audioElement = null;
    }
    this.isPlaying = false;
    this.currentTrack = null;
  }
}

const backgroundMusic = new BackgroundMusic();
export default backgroundMusic;