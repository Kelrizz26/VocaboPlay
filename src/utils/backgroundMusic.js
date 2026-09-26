// src/utils/backgroundMusic.js

class BackgroundMusic {
  constructor() {
    this.enabled = true;
    this.audioContext = null;
    this.isPlaying = false;
    this.currentTrack = 'lobby';
    this.noteIndex = 0;
    this.timerId = null;
    this.patternIndex = 0;
  }

  initAudio() {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  playNote(frequency, duration = 0.15, volume = 0.06, type = 'sine') {
    if (!this.enabled || !this.audioContext) return;
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (e) {}
  }

  // 🎵 BLOOKET LOBBY - Chill but catchy
  playLobby() {
    const melody = [
      523.25, 0, 587.33, 0, 659.25, 0, 587.33, 0,
      523.25, 0, 587.33, 0, 659.25, 0, 783.99, 0
    ];
    const note = melody[this.noteIndex % melody.length];
    if (note > 0) {
      this.playNote(note, 0.12, 0.06, 'sine');
      // Add a soft harmony
      setTimeout(() => {
        this.playNote(note * 1.25, 0.08, 0.03, 'sine');
      }, 40);
    }
    // Add a soft bass beat
    if (this.noteIndex % 4 === 0) {
      this.playNote(110, 0.2, 0.04, 'square');
    }
    this.noteIndex++;
  }

  // 🎵 BLOOKET GAMEPLAY - Upbeat with energy
  playGameplay() {
    const melody = [
      587.33, 659.25, 783.99, 880.00,
      783.99, 880.00, 987.77, 880.00,
      783.99, 659.25, 587.33, 523.25,
      587.33, 659.25, 783.99, 659.25
    ];
    const note = melody[this.noteIndex % melody.length];
    
    // Main melody
    this.playNote(note, 0.1, 0.07, 'sine');
    
    // Harmony (higher octave)
    setTimeout(() => {
      this.playNote(note * 1.5, 0.06, 0.035, 'sine');
    }, 30);
    
    // Beat/drum effect
    if (this.noteIndex % 2 === 0) {
      this.playNote(100, 0.1, 0.05, 'square');
    }
    if (this.noteIndex % 4 === 0) {
      this.playNote(80, 0.15, 0.04, 'square');
    }
    
    this.noteIndex++;
  }

  // 🎵 BLOOKET FINAL ROUND - Intense and fast
  playFinal() {
    const melody = [
      659.25, 783.99, 880.00, 987.77,
      1046.50, 987.77, 880.00, 783.99,
      880.00, 987.77, 1046.50, 1174.66,
      1046.50, 987.77, 880.00, 783.99
    ];
    const note = melody[this.noteIndex % melody.length];
    
    // Fast melody
    this.playNote(note, 0.06, 0.08, 'sine');
    
    // Harmony
    setTimeout(() => {
      this.playNote(note * 1.25, 0.04, 0.04, 'sine');
    }, 20);
    
    // Fast drums
    if (this.noteIndex % 2 === 0) {
      this.playNote(120, 0.06, 0.06, 'square');
    }
    if (this.noteIndex % 4 === 0) {
      this.playNote(90, 0.1, 0.05, 'square');
    }
    if (this.noteIndex % 8 === 0) {
      this.playNote(70, 0.15, 0.04, 'square');
    }
    
    this.noteIndex++;
  }

  // 🎵 BLOOKET VICTORY - Celebration music
  playVictory() {
    const melody = [
      523.25, 587.33, 659.25, 783.99,
      523.25, 587.33, 659.25, 783.99,
      659.25, 783.99, 880.00, 987.77,
      1046.50, 987.77, 880.00, 783.99
    ];
    const note = melody[this.noteIndex % melody.length];
    
    // Happy melody
    this.playNote(note, 0.15, 0.08, 'sine');
    
    // Harmony
    setTimeout(() => {
      this.playNote(note * 1.5, 0.1, 0.04, 'sine');
    }, 50);
    
    // Celebration bass
    if (this.noteIndex % 4 === 0) {
      this.playNote(130, 0.2, 0.05, 'square');
    }
    
    this.noteIndex++;
  }

  // 🎵 BLOOKET MENU - Simple loop
  playMenu() {
    const melody = [523.25, 0, 659.25, 0, 783.99, 0, 659.25, 0];
    const note = melody[this.noteIndex % melody.length];
    if (note > 0) {
      this.playNote(note, 0.15, 0.05, 'sine');
    }
    if (this.noteIndex % 8 === 0) {
      this.playNote(110, 0.3, 0.03, 'sine');
    }
    this.noteIndex++;
  }

  start(track = 'lobby') {
    if (this.isPlaying) return;
    
    this.initAudio();
    if (!this.audioContext) return;
    
    this.currentTrack = track;
    this.isPlaying = true;
    this.noteIndex = 0;
    
    const soundPref = localStorage.getItem('vocaboplay_sound');
    if (soundPref !== null) {
      this.enabled = JSON.parse(soundPref);
    }
    
    this.playLoop();
  }

  playLoop() {
    if (!this.isPlaying) return;
    
    const trackFunctions = {
      lobby: this.playLobby.bind(this),
      gameplay: this.playGameplay.bind(this),
      final: this.playFinal.bind(this),
      victory: this.playVictory.bind(this),
      menu: this.playMenu.bind(this),
    };
    
    const playFn = trackFunctions[this.currentTrack] || trackFunctions.lobby;
    playFn();
    
    const intervals = {
      lobby: 350,
      gameplay: 200,
      final: 120,
      victory: 250,
      menu: 400,
    };
    
    const interval = intervals[this.currentTrack] || 300;
    
    this.timerId = setTimeout(() => {
      this.playLoop();
    }, interval);
  }

  stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.noteIndex = 0;
  }

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stop();
    } else {
      this.start(this.currentTrack);
    }
    return this.enabled;
  }

  setTrack(track) {
    this.currentTrack = track;
    if (this.isPlaying) {
      this.stop();
      this.start(track);
    }
  }
}

const backgroundMusic = new BackgroundMusic();
export default backgroundMusic; 