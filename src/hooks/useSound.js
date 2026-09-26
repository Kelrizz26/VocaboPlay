// src/hooks/useSound.js

import { useEffect, useRef } from 'react';
import sound from '../utils/soundEffects';
import backgroundMusic from '../utils/backgroundMusic';

export const useSound = () => {
  const isMounted = useRef(true);

  useEffect(() => {
    // Initialize audio on mount
    sound.initAudio();
    
    return () => {
      isMounted.current = false;
    };
  }, []);

  // ===== SOUND EFFECTS =====
  const playCorrect = () => {
    if (isMounted.current) sound.correct();
  };

  const playWrong = () => {
    if (isMounted.current) sound.wrong();
  };

  const playVictory = () => {
    if (isMounted.current) sound.victory();
  };

  const playLevelUp = () => {
    if (isMounted.current) sound.levelUp();
  };

  const playReward = () => {
    if (isMounted.current) sound.reward();
  };

  const playMatchFound = () => {
    if (isMounted.current) sound.matchFound();
  };

  const playMatchFailed = () => {
    if (isMounted.current) sound.matchFailed();
  };

  const playCardFlip = () => {
    if (isMounted.current) sound.cardFlip();
  };

  const playTimerWarning = () => {
    if (isMounted.current) sound.timerWarning();
  };

  // ===== BACKGROUND MUSIC =====
  const startMusic = (track = 'calm') => {
    if (isMounted.current) {
      backgroundMusic.start(track);
    }
  };

  const stopMusic = () => {
    if (isMounted.current) {
      backgroundMusic.stop();
    }
  };

  const toggleMusic = () => {
    if (isMounted.current) {
      return backgroundMusic.toggle();
    }
    return false;
  };

  const setTrack = (track) => {
    if (isMounted.current) {
      backgroundMusic.setTrack(track);
    }
  };

  return {
    // Sound effects
    playCorrect,
    playWrong,
    playVictory,
    playLevelUp,
    playReward,
    playMatchFound,
    playMatchFailed,
    playCardFlip,
    playTimerWarning,
    // Background music
    startMusic,
    stopMusic,
    toggleMusic,
    setTrack,
  };
};

export default useSound;