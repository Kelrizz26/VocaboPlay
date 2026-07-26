// src/hooks/useQuizMusic.js

import { useRef, useState, useCallback } from 'react';

const useQuizMusic = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioContextRef = useRef(null);
  const gainNodeRef = useRef(null);
  const oscillatorsRef = useRef([]);
  const intervalRef = useRef(null);

  const initAudio = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.gain.value = isMuted ? 0 : 0.1;
        gainNodeRef.current.connect(audioContextRef.current.destination);
      }
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      return true;
    } catch (e) {
      return false;
    }
  }, [isMuted]);

  const playNote = useCallback((frequency, duration = 0.2, startTime = 0) => {
    try {
      const ctx = audioContextRef.current;
      if (!ctx || isMuted) return;

      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + startTime);
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime + startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
      
      oscillator.connect(gain);
      gain.connect(gainNodeRef.current);
      
      oscillator.start(ctx.currentTime + startTime);
      oscillator.stop(ctx.currentTime + startTime + duration);
      
      oscillatorsRef.current.push(oscillator);
    } catch (e) {
      // Silent fail
    }
  }, [isMuted]);

  const playArpeggio = useCallback(() => {
    const notes = [
      { freq: 523.25, duration: 0.15 },
      { freq: 659.25, duration: 0.15 },
      { freq: 783.99, duration: 0.15 },
      { freq: 1046.5, duration: 0.25 },
    ];
    
    notes.forEach((note, i) => {
      playNote(note.freq, note.duration, i * 0.18);
    });
  }, [playNote]);

  const playBackgroundLoop = useCallback(() => {
    if (isMuted) return;
    
    playArpeggio();
    
    intervalRef.current = setTimeout(() => {
      playBackgroundLoop();
    }, 2500);
  }, [isMuted, playArpeggio]);

  const start = useCallback(() => {
    try {
      initAudio();
      if (isPlaying) return;
      
      setIsPlaying(true);
      playBackgroundLoop();
    } catch (e) {
      // Silent fail
    }
  }, [initAudio, isPlaying, playBackgroundLoop]);

  const stop = useCallback(() => {
    setIsPlaying(false);
    
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
    
    oscillatorsRef.current.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {}
    });
    oscillatorsRef.current = [];
  }, []);

  return {
    start,
    stop,
    isPlaying,
    isMuted,
    setIsMuted
  };
};

export default useQuizMusic;