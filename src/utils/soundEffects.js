// src/utils/soundEffects.js

class SoundEffects {
  constructor() {
    this.enabled = true;
    this.audioContext = null;
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
      console.warn('Audio init error:', e);
      return false;
    }
  }

  playTone(frequency, duration = 0.15, type = 'sine', volume = 0.3) {
    if (!this.enabled) return;
    try {
      this.initAudio();
      if (!this.audioContext) return;
      
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
    } catch (e) {
      console.warn('Play tone error:', e);
    }
  }

  // ✅ Correct Answer - Happy chime
  correct() {
    this.playTone(523.25, 0.1, 'sine', 0.4);
    setTimeout(() => this.playTone(659.25, 0.1, 'sine', 0.4), 100);
    setTimeout(() => this.playTone(783.99, 0.15, 'sine', 0.4), 200);
  }

  // ❌ Wrong Answer - Buzz
  wrong() {
    this.playTone(200, 0.3, 'sawtooth', 0.2);
  }

  // 🏆 Victory - Celebration
  victory() {
    const notes = [523.25, 587.33, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.15, 'sine', 0.35), i * 120);
    });
    setTimeout(() => this.playTone(1046.5, 0.3, 'sine', 0.4), notes.length * 120 + 100);
  }

  // ⭐ Level Up
  levelUp() {
    this.playTone(440, 0.1, 'sine', 0.3);
    setTimeout(() => this.playTone(554.37, 0.1, 'sine', 0.3), 100);
    setTimeout(() => this.playTone(659.25, 0.15, 'sine', 0.4), 200);
  }

  // 🎁 Reward
  reward() {
    this.playTone(659.25, 0.1, 'sine', 0.35);
    setTimeout(() => this.playTone(783.99, 0.1, 'sine', 0.35), 80);
    setTimeout(() => this.playTone(1046.5, 0.2, 'sine', 0.4), 160);
  }

  // 🎯 Match Found
  matchFound() {
    this.playTone(440, 0.08, 'sine', 0.3);
    setTimeout(() => this.playTone(554.37, 0.08, 'sine', 0.3), 80);
  }

  // ❌ Match Failed
  matchFailed() {
    this.playTone(300, 0.2, 'sawtooth', 0.15);
  }

  // 🃏 Card Flip
  cardFlip() {
    this.playTone(600, 0.05, 'sine', 0.15);
  }

  // ⏰ Timer Warning
  timerWarning() {
    this.playTone(800, 0.1, 'square', 0.15);
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}

const sound = new SoundEffects();
export default sound;