// src/utils/backgroundMusic.js
// 🎵 MP3-BASED BACKGROUND MUSIC
// ✅ Same API as before — start(), stop(), toggle(), setTrack()
// ✅ Fade in/out, loop, volume control
// ✅ Fallback sa silence kung walang MP3
// ✅ Different music per game:
//    - SynoQuest → 'lobby' track (lobby.mp3)
//    - MatchGame → 'gameplay' track (gameplay.mp3)

class BackgroundMusic {
  constructor() {
    this.enabled = true;
    this.audioElement = null;
    this.isPlaying = false;
    this.currentTrack = 'lobby';
    this.volume = 0.35;                 // Master volume (0.0 – 1.0)
    this.fadeInterval = null;
    this.hasUserInteracted = false;

    // 🎵 MP3 file paths
    // ✅ UPDATED: Different tracks per game
    this.tracks = {
      lobby: '/music/lobby.mp3',          // SynoQuest music (tatamusic)
      gameplay: '/music/gameplay.mp3',    // MatchGame music (Retro_Game)
      final: '/music/gameplay.mp3',       // Fallback sa gameplay
      victory: '/music/lobby.mp3',        // Fallback sa lobby
      menu: '/music/lobby.mp3',           // Fallback sa lobby
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
        // Retry play kung may pending track
        if (this.enabled && !this.isPlaying && this.currentTrack) {
          this.start(this.currentTrack);
        }
      };
      window.addEventListener('click', markInteracted);
      window.addEventListener('keydown', markInteracted);
      window.addEventListener('touchstart', markInteracted);
    }
  }

  // 🎵 Get or create audio element for a track
  getAudioElement(track) {
    const src = this.tracks[track] || this.tracks.lobby;

    // Reuse if same source
    if (this.audioElement && this.audioElement.dataset.track === track) {
      return this.audioElement;
    }

    // Cleanup previous
    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.src = '';
      } catch (e) { /* ignore */ }
    }

    const audio = new Audio(src);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0;
    audio.dataset.track = track;

    audio.onerror = () => {
      console.warn(`[Music] MP3 not found: ${src}`);
      this.isPlaying = false;
    };

    audio.onplay = () => { this.isPlaying = true; };
    audio.onpause = () => { this.isPlaying = false; };

    this.audioElement = audio;
    return audio;
  }

  // 🎚️ Smooth fade to target volume
  fadeTo(targetVolume, duration = 800) {
    if (!this.audioElement) return;
    if (this.fadeInterval) clearInterval(this.fadeInterval);

    const startVolume = this.audioElement.volume;
    const steps = 20;
    const stepTime = duration / steps;
    const volumeStep = (targetVolume - startVolume) / steps;
    let currentStep = 0;

    this.fadeInterval = setInterval(() => {
      currentStep++;
      if (!this.audioElement) {
        clearInterval(this.fadeInterval);
        this.fadeInterval = null;
        return;
      }
      const newVol = Math.max(0, Math.min(1, startVolume + volumeStep * currentStep));
      this.audioElement.volume = newVol;

      if (currentStep >= steps) {
        clearInterval(this.fadeInterval);
        this.fadeInterval = null;
        this.audioElement.volume = Math.max(0, Math.min(1, targetVolume));
      }
    }, stepTime);
  }

  // ▶️ Start playing music
  start(track = 'lobby') {
    // Kung muted, huwag mag-play
    if (!this.enabled) {
      this.isPlaying = false;
      return;
    }

    // Kung same track at tumutugtog na — huwag i-restart
    if (this.isPlaying && this.currentTrack === track && this.audioElement && !this.audioElement.paused) {
      return;
    }

    const previousTrack = this.currentTrack;
    this.currentTrack = track;

    // Switch track — pause yung luma
    if (previousTrack !== track && this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
      } catch (e) { /* ignore */ }
    }

    const audio = this.getAudioElement(track);
    const targetVolume = this.trackVolumes[track] || this.volume;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.isPlaying = true;
          this.fadeTo(targetVolume, 1000);   // Fade in over 1s
        })
        .catch((err) => {
          console.warn('[Music] Autoplay blocked:', err.message);
          this.isPlaying = false;
        });
    }
  }

  // ⏹️ Stop playing (with optional fade out)
  stop(fadeOut = true) {
    if (!this.audioElement) return;

    if (fadeOut) {
      this.fadeTo(0, 600);
      setTimeout(() => {
        if (this.audioElement) {
          try {
            this.audioElement.pause();
            this.audioElement.currentTime = 0;
          } catch (e) { /* ignore */ }
        }
        this.isPlaying = false;
      }, 650);
    } else {
      try {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
      } catch (e) { /* ignore */ }

      if (this.fadeInterval) {
        clearInterval(this.fadeInterval);
        this.fadeInterval = null;
      }
      this.isPlaying = false;
    }
  }

  // 🔄 Toggle on/off
  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('vocaboplay_sound', JSON.stringify(this.enabled));

    if (!this.enabled) {
      this.stop();
    } else {
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
  getVolume() {
    return this.volume;
  }

  // 🔇 Set enabled state
  setEnabled(enabled) {
    this.enabled = !!enabled;
    localStorage.setItem('vocaboplay_sound', JSON.stringify(this.enabled));
    if (!this.enabled) this.stop();
  }

  // 🔍 Check if music is currently playing
  getIsPlaying() {
    return this.isPlaying;
  }

  // 🧹 Cleanup
  destroy() {
    if (this.fadeInterval) clearInterval(this.fadeInterval);
    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.src = '';
      } catch (e) { /* ignore */ }
    }
    this.isPlaying = false;
  }
}

const backgroundMusic = new BackgroundMusic();
export default backgroundMusic;