// src/components/dashboard/WordPicsGame.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import backgroundMusic from '../../utils/backgroundMusic';
import { auth } from '../../pages/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { updateUserStats } from '../../services/firebaseService';

// ============================================================
// ===== IMAGE CONFIGURATION =====
// ============================================================
const imageBasePath = 'src/image/';

const images = {
  mascot: `${imageBasePath}mascot.png`,
  'mascot-dad': `${imageBasePath}mascot-dad.png`,
  'mascot-happy': `${imageBasePath}mascot-happy.png`,
  'mascot-sitting': `${imageBasePath}mascot-sitting.png`,
  'mascot-skateboard': `${imageBasePath}mascot-skateboard.png`,
  bokasadfavorite: `${imageBasePath}bokasadfavorite.jpg`,
  bokastudent: `${imageBasePath}bokastudent.png`,
  bokateacher: `${imageBasePath}bokateacher.png`,
  bokawelcoming: `${imageBasePath}bokawelcoming.jpg`,
  guesswhatgame: `${imageBasePath}guesswhatgame.png`,
  hide: `${imageBasePath}hide.png`,
  matchgame: `${imageBasePath}matchgame.png`,
  oepn: `${imageBasePath}oepn.png`,
  quizgame: `${imageBasePath}quizgame.png`,
  sadheart: `${imageBasePath}sadheart.jpg`,
  sentence: `${imageBasePath}sentence.png`,
  shortstory: `${imageBasePath}shortstory.png`,
  wordpics: `${imageBasePath}wordpics.png`,

  happy: `${imageBasePath}happy.png`,
  joyful: `${imageBasePath}joyful.png`,
  sad: `${imageBasePath}sad.png`,
  unhappy: `${imageBasePath}unhappy.png`,
  big: `${imageBasePath}big.png`,
  large: `${imageBasePath}large.png`,
  small: `${imageBasePath}small.png`,
  little: `${imageBasePath}little.png`,
  fast: `${imageBasePath}fast.png`,
  quick: `${imageBasePath}quick.png`,
  good: `${imageBasePath}good.png`,
  great: `${imageBasePath}great.png`,
  bad: `${imageBasePath}bad.png`,
  terrible: `${imageBasePath}terrible.png`,
  gift: `${imageBasePath}gift.png`,
  present: `${imageBasePath}present.png`,
  find: `${imageBasePath}find.png`,
  discover: `${imageBasePath}discover.png`,
  fix: `${imageBasePath}fix.png`,
  repair: `${imageBasePath}repair.png`,
  begin: `${imageBasePath}begin.png`,
  start: `${imageBasePath}start.png`,
  end: `${imageBasePath}end.png`,
  finish: `${imageBasePath}finish.png`,
  clean: `${imageBasePath}clean.png`,
  tidy: `${imageBasePath}tidy.png`,
  journey: `${imageBasePath}journey.png`,
  kind: `${imageBasePath}kind.png`,
  trip: `${imageBasePath}trip.png`,
  triumph: `${imageBasePath}triumph.png`,
  win: `${imageBasePath}win.png`,
  teach: `${imageBasePath}teach.png`,
  show: `${imageBasePath}show.png`,
  smart: `${imageBasePath}smart.png`,
  intelligent: `${imageBasePath}intelligent.png`,
  strong: `${imageBasePath}strong.png`,
  powerful: `${imageBasePath}powerful.png`,
  brave: `${imageBasePath}brave.png`,
  courageous: `${imageBasePath}courageous.png`,
  calm: `${imageBasePath}calm.png`,
  peaceful: `${imageBasePath}peaceful.png`,
  rich: `${imageBasePath}rich.png`,
  wealthy: `${imageBasePath}wealthy.png`,
  beautiful: `${imageBasePath}beautiful.png`,
  pretty: `${imageBasePath}pretty.png`,
  ugly: `${imageBasePath}ugly.png`,
  unattractive: `${imageBasePath}unattractive.png`,
  funny: `${imageBasePath}funny.png`,
  amusing: `${imageBasePath}amusing.png`,
  quiet: `${imageBasePath}quiet.png`,
  silent: `${imageBasePath}silent.png`,
  loud: `${imageBasePath}loud.png`,
  noisy: `${imageBasePath}noisy.png`,
  safe: `${imageBasePath}secure.png`,
  secure: `${imageBasePath}secure.png`,
  magnificent: `${imageBasePath}magnificent.png`,
  extraordinary: `${imageBasePath}extraordinary.png`,
  splendid: `${imageBasePath}splendid.png`,
  remarkable: `${imageBasePath}remarkable.png`,
  grateful: `${imageBasePath}grateful.png`,
  thankful: `${imageBasePath}thankful.png`,
  mindful: `${imageBasePath}mindful.png`,
  aware: `${imageBasePath}aware.png`,
  innovative: `${imageBasePath}innovative.png`,
  creative: `${imageBasePath}creative.png`,
  analyze: `${imageBasePath}analyze.png`,
  examine: `${imageBasePath}examine.png`,
  complete: `${imageBasePath}complete.png`,
  demonstrate: `${imageBasePath}demonstrate.png`,
  explain: `${imageBasePath}explain.png`,
  clarify: `${imageBasePath}clarify.png`,
  evaluate: `${imageBasePath}evaluate.png`,
  judge: `${imageBasePath}judge.png`,
  formulate: `${imageBasePath}formulate.png`,
  create: `${imageBasePath}create.png`,
  participate: `${imageBasePath}participate.png`,
  join: `${imageBasePath}join.png`,
  improve: `${imageBasePath}improve.png`,
  better: `${imageBasePath}better.png`,
  review: `${imageBasePath}review.png`,
  study: `${imageBasePath}study.png`,
  interpret: `${imageBasePath}interpret.png`,
  understand: `${imageBasePath}understand.png`,
  justify: `${imageBasePath}justify.png`,
  defend: `${imageBasePath}defend.png`,
  summarize: `${imageBasePath}summarize.png`,
  condense: `${imageBasePath}condense.png`,
  synthesize: `${imageBasePath}synthesize.png`,
  combine: `${imageBasePath}combine.png`,
  critique: `${imageBasePath}critique.png`,
  elaborate: `${imageBasePath}elaborate.png`,
  educate: `${imageBasePath}educate.png`,
  learn: `${imageBasePath}learn.png`,
  caring: `${imageBasePath}caring.png`,

  // ===== NEW: pixel-art loading background =====
  'pixel-town': `${imageBasePath}pixel-town.png`,
};

// ============================================================
// ===== FULLSCREEN BACKGROUND =====
// ============================================================
const fullScreenBg = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  overflowY: 'auto',
  backgroundImage: `linear-gradient(135deg, rgba(49,46,110,0.45), rgba(30,58,138,0.5)), url(${imageBasePath}bg-synoquest.png)`,
  backgroundSize: '130% 130%',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  animation: 'bgPan 30s ease-in-out infinite alternate',
  fontFamily: "'Poppins', 'Poppins', -apple-system, sans-serif",
};

const bgAnimationStyle = (
  <style>{`
    @keyframes bgPan {
      0% { background-position: 0% 0%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 50% 100%; }
    }
  `}</style>
);

// ============================================================
// ===== DARK CARD THEME =====
// ============================================================
const theme = {
  cardBg: 'linear-gradient(160deg, #1a1730 0%, #0d0b1a 100%)',
  cardBorder: '1px solid rgba(139,92,246,0.28)',
  cardShadow: '0 25px 60px -15px rgba(0,0,0,0.7), 0 0 0 1px rgba(139,92,246,0.05) inset',
  textPrimary: '#F5F3FF',
  textSecondary: '#C4B5FD',
  textMuted: '#9CA3AF',
  accent: '#A78BFA',
  accentGradient: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
  chipBg: 'rgba(139,92,246,0.16)',
  surfaceBg: 'rgba(255,255,255,0.06)',
  surfaceBorder: 'rgba(255,255,255,0.10)',
};

// ============================================================
// ===== HELPER FUNCTIONS =====
// ============================================================
// Generate random letter options for the puzzle
const generateLetterOptions = (word) => {
  const letters = word.split('');
  const alphabet = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
  const correctLetters = [...letters];
  const extraLetters = alphabet.filter(l => !correctLetters.includes(l));
  const numExtra = Math.floor(Math.random() * 6) + 3;
  const shuffledExtra = [...extraLetters].sort(() => Math.random() - 0.5);
  const extra = shuffledExtra.slice(0, numExtra);
  const finalLetters = [...correctLetters, ...extra];
  return finalLetters.sort(() => Math.random() - 0.5);
};

// Generate positions for blanks and visible letters
const generateBlankPositions = (word, numBlanks) => {
  const wordLength = word.length;
  const visibleCount = wordLength - numBlanks;
  const visiblePositions = [];
  const available = Array.from({ length: wordLength }, (_, i) => i);
  for (let i = 0; i < visibleCount; i++) {
    const idx = Math.floor(Math.random() * available.length);
    visiblePositions.push(available[idx]);
    available.splice(idx, 1);
  }
  visiblePositions.sort((a, b) => a - b);
  const blankPositions = [];
  for (let i = 0; i < wordLength; i++) {
    if (!visiblePositions.includes(i)) {
      blankPositions.push(i);
    }
  }
  return { visiblePositions, blankPositions };
};

// Time in seconds for life refill
const REFILL_TIME = 2;

// ============================================================
// ===== LEVEL CONFIGURATION =====
// ============================================================
const LEVEL_CONFIG = {
  1: { difficulty: 'beginner', timer: 15, label: 'Level 1 - Beginner', emoji: '🟢', questionsPerLevel: 10 },
  2: { difficulty: 'easy', timer: 15, label: 'Level 2 - Easy', emoji: '🟢', questionsPerLevel: 10 },
  3: { difficulty: 'medium', timer: 10, label: 'Level 3 - Medium', emoji: '🟡', questionsPerLevel: 10 },
  4: { difficulty: 'mediumHard', timer: 10, label: 'Level 4 - Medium-Hard', emoji: '🟡', questionsPerLevel: 10 },
  5: { difficulty: 'hard', timer: 8, label: 'Level 5 - Hard', emoji: '🟠', questionsPerLevel: 10 },
  6: { difficulty: 'veryHard', timer: 8, label: 'Level 6 - Very Hard', emoji: '🟠', questionsPerLevel: 10 },
  7: { difficulty: 'expert', timer: 5, label: 'Level 7 - Expert', emoji: '🔴', questionsPerLevel: 10 },
  8: { difficulty: 'master', timer: 5, label: 'Level 8 - Master', emoji: '👑', questionsPerLevel: 10 },
};

const MAX_LEVEL = 8;
const QUESTIONS_PER_LEVEL = 10;

// ============================================================
// ===== WORD PAIRS (10 words per level) =====
// ============================================================
const wordPairs = {
  beginner: [
    { id: 1, word: 'HAPPY', image1: images.happy, image2: images.joyful, category: '😊 Emotions' },
    { id: 2, word: 'SAD', image1: images.sad, image2: images.unhappy, category: '😢 Emotions' },
    { id: 3, word: 'BIG', image1: images.big, image2: images.large, category: '📏 Size' },
    { id: 4, word: 'SMALL', image1: images.small, image2: images.little, category: '📏 Size' },
    { id: 5, word: 'FAST', image1: images.fast, image2: images.quick, category: '🏃 Speed' },
    { id: 6, word: 'GOOD', image1: images.good, image2: images.great, category: '⭐ Quality' },
    { id: 7, word: 'BAD', image1: images.bad, image2: images.terrible, category: '💔 Quality' },
    { id: 8, word: 'GIFT', image1: images.gift, image2: images.present, category: '🎁 Objects' },
    { id: 9, word: 'FIND', image1: images.find, image2: images.discover, category: '🔍 Discovery' },
    { id: 10, word: 'FIX', image1: images.fix, image2: images.repair, category: '🔧 Actions' },
  ],
  easy: [
    { id: 1, word: 'SMART', image1: images.smart, image2: images.intelligent, category: '🧠 Intelligence' },
    { id: 2, word: 'STRONG', image1: images.strong, image2: images.powerful, category: '💪 Strength' },
    { id: 3, word: 'BRAVE', image1: images.brave, image2: images.courageous, category: '🦁 Courage' },
    { id: 4, word: 'CALM', image1: images.calm, image2: images.peaceful, category: '😌 Calmness' },
    { id: 5, word: 'RICH', image1: images.rich, image2: images.wealthy, category: '💰 Wealth' },
    { id: 6, word: 'BEAUTIFUL', image1: images.beautiful, image2: images.pretty, category: '🌸 Appearance' },
    { id: 7, word: 'UGLY', image1: images.ugly, image2: images.unattractive, category: '👹 Appearance' },
    { id: 8, word: 'FUNNY', image1: images.funny, image2: images.amusing, category: '😂 Humor' },
    { id: 9, word: 'JOURNEY', image1: images.journey, image2: images.trip, category: '🗺️ Travel' },
    { id: 10, word: 'KIND', image1: images.kind, image2: images.caring, category: '💖 Personality' },
  ],
  medium: [
    { id: 1, word: 'MAGNIFICENT', image1: images.magnificent, image2: images.extraordinary, category: '👑 Quality' },
    { id: 2, word: 'GRATEFUL', image1: images.grateful, image2: images.thankful, category: '🙏 Emotion' },
    { id: 3, word: 'MINDFUL', image1: images.mindful, image2: images.aware, category: '🧘 Personality' },
    { id: 4, word: 'INNOVATIVE', image1: images.innovative, image2: images.creative, category: '💡 Personality' },
    { id: 5, word: 'ANALYZE', image1: images.analyze, image2: images.examine, category: '🔍 Verbs' },
    { id: 6, word: 'COMPLETE', image1: images.complete, image2: images.finish, category: '✅ Verbs' },
    { id: 7, word: 'DEMONSTRATE', image1: images.demonstrate, image2: images.show, category: '👀 Verbs' },
    { id: 8, word: 'EXPLAIN', image1: images.explain, image2: images.clarify, category: '💡 Verbs' },
    { id: 9, word: 'EVALUATE', image1: images.evaluate, image2: images.judge, category: '📊 Verbs' },
    { id: 10, word: 'FORMULATE', image1: images.formulate, image2: images.create, category: '🔧 Verbs' },
  ],
  mediumHard: [
    { id: 1, word: 'PARTICIPATE', image1: images.participate, image2: images.join, category: '🤝 Verbs' },
    { id: 2, word: 'IMPROVE', image1: images.improve, image2: images.better, category: '📈 Verbs' },
    { id: 3, word: 'REVIEW', image1: images.review, image2: images.study, category: '🔄 Verbs' },
    { id: 4, word: 'INTERPRET', image1: images.interpret, image2: images.understand, category: '🧠 Verbs' },
    { id: 5, word: 'JUSTIFY', image1: images.justify, image2: images.defend, category: '📋 Verbs' },
    { id: 6, word: 'SUMMARIZE', image1: images.summarize, image2: images.condense, category: '📝 Verbs' },
    { id: 7, word: 'SYNTHESIZE', image1: images.synthesize, image2: images.combine, category: '🧩 Verbs' },
    { id: 8, word: 'CRITIQUE', image1: images.critique, image2: images.evaluate, category: '📋 Verbs' },
    { id: 9, word: 'ELABORATE', image1: images.elaborate, image2: images.explain, category: '📝 Verbs' },
    { id: 10, word: 'EDUCATE', image1: images.educate, image2: images.learn, category: '🎓 Verbs' },
  ],
  hard: [
    { id: 1, word: 'ANALYZE', image1: images.analyze, image2: images.examine, category: '🔍 Verbs' },
    { id: 2, word: 'COMPLETE', image1: images.complete, image2: images.finish, category: '✅ Verbs' },
    { id: 3, word: 'DEMONSTRATE', image1: images.demonstrate, image2: images.show, category: '👀 Verbs' },
    { id: 4, word: 'EXPLAIN', image1: images.explain, image2: images.clarify, category: '💡 Verbs' },
    { id: 5, word: 'EVALUATE', image1: images.evaluate, image2: images.judge, category: '📊 Verbs' },
    { id: 6, word: 'FORMULATE', image1: images.formulate, image2: images.create, category: '🔧 Verbs' },
    { id: 7, word: 'PARTICIPATE', image1: images.participate, image2: images.join, category: '🤝 Verbs' },
    { id: 8, word: 'IMPROVE', image1: images.improve, image2: images.better, category: '📈 Verbs' },
    { id: 9, word: 'REVIEW', image1: images.review, image2: images.study, category: '🔄 Verbs' },
    { id: 10, word: 'INTERPRET', image1: images.interpret, image2: images.understand, category: '🧠 Verbs' },
  ],
  veryHard: [
    { id: 1, word: 'JUSTIFY', image1: images.justify, image2: images.defend, category: '📋 Verbs' },
    { id: 2, word: 'SUMMARIZE', image1: images.summarize, image2: images.condense, category: '📝 Verbs' },
    { id: 3, word: 'SYNTHESIZE', image1: images.synthesize, image2: images.combine, category: '🧩 Verbs' },
    { id: 4, word: 'CRITIQUE', image1: images.critique, image2: images.evaluate, category: '📋 Verbs' },
    { id: 5, word: 'ELABORATE', image1: images.elaborate, image2: images.explain, category: '📝 Verbs' },
    { id: 6, word: 'MAGNIFICENT', image1: images.magnificent, image2: images.extraordinary, category: '👑 Quality' },
    { id: 7, word: 'GRATEFUL', image1: images.grateful, image2: images.thankful, category: '🙏 Emotion' },
    { id: 8, word: 'MINDFUL', image1: images.mindful, image2: images.aware, category: '🧘 Personality' },
    { id: 9, word: 'INNOVATIVE', image1: images.innovative, image2: images.creative, category: '💡 Personality' },
    { id: 10, word: 'EDUCATE', image1: images.educate, image2: images.learn, category: '🎓 Verbs' },
  ],
  expert: [
    { id: 1, word: 'ANALYZE', image1: images.analyze, image2: images.examine, category: '🔍 Verbs' },
    { id: 2, word: 'COMPLETE', image1: images.complete, image2: images.finish, category: '✅ Verbs' },
    { id: 3, word: 'DEMONSTRATE', image1: images.demonstrate, image2: images.show, category: '👀 Verbs' },
    { id: 4, word: 'EXPLAIN', image1: images.explain, image2: images.clarify, category: '💡 Verbs' },
    { id: 5, word: 'EVALUATE', image1: images.evaluate, image2: images.judge, category: '📊 Verbs' },
    { id: 6, word: 'FORMULATE', image1: images.formulate, image2: images.create, category: '🔧 Verbs' },
    { id: 7, word: 'PARTICIPATE', image1: images.participate, image2: images.join, category: '🤝 Verbs' },
    { id: 8, word: 'IMPROVE', image1: images.improve, image2: images.better, category: '📈 Verbs' },
    { id: 9, word: 'REVIEW', image1: images.review, image2: images.study, category: '🔄 Verbs' },
    { id: 10, word: 'INTERPRET', image1: images.interpret, image2: images.understand, category: '🧠 Verbs' },
  ],
  master: [
    { id: 1, word: 'JUSTIFY', image1: images.justify, image2: images.defend, category: '📋 Verbs' },
    { id: 2, word: 'SUMMARIZE', image1: images.summarize, image2: images.condense, category: '📝 Verbs' },
    { id: 3, word: 'SYNTHESIZE', image1: images.synthesize, image2: images.combine, category: '🧩 Verbs' },
    { id: 4, word: 'CRITIQUE', image1: images.critique, image2: images.evaluate, category: '📋 Verbs' },
    { id: 5, word: 'ELABORATE', image1: images.elaborate, image2: images.explain, category: '📝 Verbs' },
    { id: 6, word: 'MAGNIFICENT', image1: images.magnificent, image2: images.extraordinary, category: '👑 Quality' },
    { id: 7, word: 'GRATEFUL', image1: images.grateful, image2: images.thankful, category: '🙏 Emotion' },
    { id: 8, word: 'MINDFUL', image1: images.mindful, image2: images.aware, category: '🧘 Personality' },
    { id: 9, word: 'INNOVATIVE', image1: images.innovative, image2: images.creative, category: '💡 Personality' },
    { id: 10, word: 'EDUCATE', image1: images.educate, image2: images.learn, category: '🎓 Verbs' },
  ]
};

// ============================================================
// ===== GET WORDS BY LEVEL =====
// ============================================================
const getWordsByLevel = (level) => {
  const config = LEVEL_CONFIG[level] || LEVEL_CONFIG[1];
  const diff = config.difficulty;
  const words = wordPairs[diff] || wordPairs.beginner;
  return words;
};

// ============================================================
// ===== WORDPICSGAME COMPONENT =====
// ============================================================
const WordPicsGame = ({ onBack, updateProgress }) => {
  // ===== GAME STATE =====
  const [gameState, setGameState] = useState('intro'); // 'intro', 'loading', 'playing', 'gameover', 'finished'
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [questions, setQuestions] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showCorrectAnimation, setShowCorrectAnimation] = useState(false);
  const [stats, setStats] = useState({ gamesPlayed: 0, bestScore: 0, totalCorrect: 0 });
  
  // ===== USER STATE =====
  const [currentUser, setCurrentUser] = useState(null);
  const [isUserLoaded, setIsUserLoaded] = useState(false);
  
  // ===== TIMER =====
  const [timer, setTimer] = useState(15);
  const [timerRunning, setTimerRunning] = useState(false);
  
  // ===== LIVES - STABLE TIMER =====
  const [lives, setLives] = useState(5);
  const [maxLives] = useState(5);
  const [lastRefillTime, setLastRefillTime] = useState(Date.now());
  const [timeRemaining, setTimeRemaining] = useState('');
  const [hintUsed, setHintUsed] = useState(false);
  const [showNoLivesMessage, setShowNoLivesMessage] = useState(false);
  
  // REFS for stable timer
  const timerIntervalRef = useRef(null);
  const lastRefillTimeRef = useRef(Date.now());
  const livesRef = useRef(5);
  const isMountedRef = useRef(true);
  
  // ===== LEVEL SYSTEM =====
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  
  // ===== STREAK =====
  const [streak, setStreak] = useState(0);
  
  // ===== TRACK QUESTIONS =====
  const [answeredInLevel, setAnsweredInLevel] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [retryQuestion, setRetryQuestion] = useState(null);
  
  // ===== RETRY PHASE =====
  const [wrongQuestions, setWrongQuestions] = useState([]);
  const [retryPhase, setRetryPhase] = useState(false);
  const [retryIndex, setRetryIndex] = useState(0);
  
  // ===== PUZZLE STATE =====
  const [blankPositions, setBlankPositions] = useState([]);
  const [visiblePositions, setVisiblePositions] = useState([]);
  const [userFilledBlanks, setUserFilledBlanks] = useState({});
  const [availableLetters, setAvailableLetters] = useState([]);
  const [usedLetters, setUsedLetters] = useState([]);
  
  // ===== AUDIO =====
  const audioCtx = useRef(null);
  const gainNode = useRef(null);

  // ============================================================
  // ===== USER-SPECIFIC STORAGE FUNCTIONS =====
  // ============================================================
  const getUserId = useCallback(() => {
    if (currentUser) {
      return currentUser.uid;
    }
    return 'guest';
  }, [currentUser]);

  const getLivesStorageKey = useCallback(() => {
    const userId = getUserId();
    return `wordpics_lives_${userId}`;
  }, [getUserId]);

  const getStatsStorageKey = useCallback(() => {
    const userId = getUserId();
    return `wordpics_stats_${userId}`;
  }, [getUserId]);

  const getLeaderboardStorageKey = useCallback(() => {
    const userId = getUserId();
    return `wordpics_leaderboard_${userId}`;
  }, [getUserId]);

  // ============================================================
  // ===== FIREBASE AUTH - GET CURRENT USER =====
  // ============================================================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setIsUserLoaded(true);
        console.log('✅ WordPicsGame: User loaded:', user.uid, user.email);
      } else {
        setCurrentUser(null);
        setIsUserLoaded(true);
        console.log('❌ WordPicsGame: No user logged in');
      }
    });
    
    return () => unsubscribe();
  }, []);

  // ============================================================
  // ===== STABLE LIVES SYSTEM =====
  // ============================================================
  const checkAndRefillLives = useCallback(() => {
    if (!currentUser || !isMountedRef.current) return;
    
    const key = getLivesStorageKey();
    const now = Date.now();
    const saved = localStorage.getItem(key);
    
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const secondsPassed = (now - data.lastRefillTime) / 1000;
        
        if (secondsPassed >= REFILL_TIME && data.lives < maxLives) {
          const newLives = Math.min(data.lives + 1, maxLives);
          setLives(newLives);
          livesRef.current = newLives;
          setLastRefillTime(now);
          lastRefillTimeRef.current = now;
          localStorage.setItem(key, JSON.stringify({
            lives: newLives,
            lastRefillTime: now
          }));
          console.log(`🔄 Refilled 1 life! Now: ${newLives}/${maxLives}`);
        } else {
          setLives(data.lives);
          livesRef.current = data.lives;
          setLastRefillTime(data.lastRefillTime);
          lastRefillTimeRef.current = data.lastRefillTime;
        }
      } catch (e) {
        console.error('Error loading lives:', e);
        setLives(maxLives);
        livesRef.current = maxLives;
        setLastRefillTime(Date.now());
        lastRefillTimeRef.current = Date.now();
        localStorage.setItem(key, JSON.stringify({
          lives: maxLives,
          lastRefillTime: Date.now()
        }));
      }
    } else {
      setLives(maxLives);
      livesRef.current = maxLives;
      setLastRefillTime(Date.now());
      lastRefillTimeRef.current = Date.now();
      localStorage.setItem(key, JSON.stringify({
        lives: maxLives,
        lastRefillTime: Date.now()
      }));
      console.log('🎉 New user! Starting with 5 lives!');
    }
  }, [currentUser, maxLives, getLivesStorageKey]);

  // Update the time remaining display for life refill
  const updateTimeRemaining = useCallback(() => {
    if (!currentUser || !isMountedRef.current) return;
    
    if (livesRef.current >= maxLives) {
      setTimeRemaining('');
      return;
    }
    
    const now = Date.now();
    const elapsed = (now - lastRefillTimeRef.current) / 1000;
    
    if (elapsed < REFILL_TIME) {
      const remaining = REFILL_TIME - elapsed;
      const minutes = Math.floor(remaining / 60);
      const seconds = Math.floor(remaining % 60);
      const secondsStr = seconds.toString().padStart(2, '0');
      setTimeRemaining(`${minutes}m ${secondsStr}s`);
    } else {
      checkAndRefillLives();
      setTimeRemaining('');
    }
  }, [currentUser, maxLives, checkAndRefillLives]);

  // ============================================================
  // ===== START TIMER - ONCE =====
  // ============================================================
  useEffect(() => {
    if (currentUser && isUserLoaded) {
      isMountedRef.current = true;
      checkAndRefillLives();
      
      setTimeout(updateTimeRemaining, 100);
      
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      
      timerIntervalRef.current = setInterval(() => {
        updateTimeRemaining();
      }, 1000);
      
      return () => {
        isMountedRef.current = false;
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
      };
    }
  }, [currentUser, isUserLoaded, checkAndRefillLives, updateTimeRemaining]);

  // ============================================================
  // ===== SAVE LIVES TO LOCALSTORAGE =====
  // ============================================================
  useEffect(() => {
    if (currentUser && gameState !== 'intro') {
      const key = getLivesStorageKey();
      localStorage.setItem(key, JSON.stringify({
        lives: lives,
        lastRefillTime: lastRefillTime
      }));
    }
  }, [lives, lastRefillTime, gameState, currentUser, getLivesStorageKey]);

  // ============================================================
  // ===== LOAD STATS & LEADERBOARD =====
  // ============================================================
  useEffect(() => {
    if (currentUser && isUserLoaded) {
      const statsKey = getStatsStorageKey();
      const savedStats = localStorage.getItem(statsKey);
      if (savedStats) {
        try {
          setStats(JSON.parse(savedStats));
        } catch (e) {
          console.error('Error loading stats:', e);
        }
      }
      
      const leaderboardKey = getLeaderboardStorageKey();
      const savedLeaderboard = localStorage.getItem(leaderboardKey);
      if (savedLeaderboard) {
        try {
          setLeaderboardData(JSON.parse(savedLeaderboard));
        } catch (e) {
          console.error('Error loading leaderboard:', e);
        }
      }
    }
  }, [currentUser, isUserLoaded, getStatsStorageKey, getLeaderboardStorageKey]);

  // ============================================================
  // ===== CLEANUP ON UNMOUNT =====
  // ============================================================
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, []);

  // ============================================================
  // ===== INITIALIZE GAME =====
  // ============================================================
  const initAudio = () => {
    try {
      if (!audioCtx.current) {
        audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
        gainNode.current = audioCtx.current.createGain();
        gainNode.current.gain.value = isMuted ? 0 : 0.4;
        gainNode.current.connect(audioCtx.current.destination);
      }
      if (audioCtx.current.state === 'suspended') {
        audioCtx.current.resume();
      }
      return true;
    } catch (e) { return false; }
  };

  // Play a tone for sound effects
  const playTone = (frequency, duration = 0.2, type = 'sine') => {
    if (isMuted) return;
    try {
      initAudio();
      if (!audioCtx.current || !gainNode.current) return;
      const oscillator = audioCtx.current.createOscillator();
      const gain = audioCtx.current.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, audioCtx.current.currentTime);
      gain.gain.setValueAtTime(0.4, audioCtx.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.current.currentTime + duration);
      oscillator.connect(gain);
      gain.connect(gainNode.current);
      oscillator.start();
      oscillator.stop(audioCtx.current.currentTime + duration);
    } catch (e) {}
  };

  // Sound effects for different game events
  const playCorrectSound = () => {
    if (isMuted) return;
    playTone(523.25, 0.12);
    setTimeout(() => playTone(659.25, 0.12), 120);
    setTimeout(() => playTone(783.99, 0.15), 240);
    setTimeout(() => playTone(1046.5, 0.2), 360);
  };

  const playWrongSound = () => {
    if (isMuted) return;
    playTone(150, 0.4, 'sawtooth');
    setTimeout(() => playTone(120, 0.3, 'sawtooth'), 200);
  };

  const playGameOverSound = () => {
    if (isMuted) return;
    playTone(400, 0.2, 'sawtooth');
    setTimeout(() => playTone(300, 0.2, 'sawtooth'), 200);
    setTimeout(() => playTone(200, 0.3, 'sawtooth'), 400);
  };

  const playLevelUpSound = () => {
    if (isMuted) return;
    playTone(440, 0.1);
    setTimeout(() => playTone(554.37, 0.1), 100);
    setTimeout(() => playTone(659.25, 0.15), 200);
    setTimeout(() => playTone(880, 0.2), 300);
  };

  // Background music control
  useEffect(() => {
    if (!isMuted && gameState !== 'intro') {
      backgroundMusic.start('gameplay');
    }
    return () => backgroundMusic.stop();
  }, [isMuted, gameState]);

  // ============================================================
  // ===== GAME FUNCTIONS =====
  // ============================================================
  // Create a word puzzle from a word pair
  const createWordPuzzle = (pair, level) => {
    const config = LEVEL_CONFIG[level] || LEVEL_CONFIG[1];
    const word = pair.word.toUpperCase();
    const numBlanks = Math.min(
      Math.floor(Math.random() * 3) + 2,
      word.length - 1
    );
    const { visiblePositions, blankPositions } = generateBlankPositions(word, numBlanks);
    const letters = word.split('');
    const letterOptions = generateLetterOptions(word);
    
    return {
      ...pair,
      word: word,
      wordDisplay: word,
      blankPositions: blankPositions,
      visiblePositions: visiblePositions,
      letters: letters,
      letterOptions: letterOptions,
      level: level,
      timer: config.timer
    };
  };

  // Generate all questions for a level
  const generateQuestions = (level) => {
    const words = getWordsByLevel(level);
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, QUESTIONS_PER_LEVEL);
    return selected.map(pair => createWordPuzzle(pair, level));
  };

  // Get the next unanswered question
  const getNextUnansweredQuestion = () => {
    if (retryQuestion && retryPhase) {
      return retryQuestion;
    }
    
    const unanswered = questions.filter((q) => 
      !answeredQuestions.includes(q.id)
    );
    
    if (unanswered.length === 0) {
      return null;
    }
    
    return unanswered[0];
  };

  // Check if all questions have been answered
  const checkIfAllAnswered = () => {
    const answeredCount = answeredQuestions.length;
    const totalQuestions = questions.length;
    return answeredCount >= totalQuestions && totalQuestions === QUESTIONS_PER_LEVEL;
  };

  // Advance to the next level
  const performLevelUp = () => {
    if (currentLevel >= MAX_LEVEL) {
      setAnsweredQuestions([]);
      setRetryQuestion(null);
      setWrongQuestions([]);
      setRetryPhase(false);
      setRetryIndex(0);
      const newQuestions = generateQuestions(currentLevel);
      setQuestions(newQuestions);
      setCurrentQuestionIndex(0);
      setAnsweredInLevel(0);
      const config = LEVEL_CONFIG[currentLevel];
      setTimer(config.timer);
      setTimerRunning(true);
      setAnswered(false);
      setHintUsed(false);
      setShowCorrectAnimation(false);
      setBlankPositions(newQuestions[0]?.blankPositions || []);
      setVisiblePositions(newQuestions[0]?.visiblePositions || []);
      setAvailableLetters(newQuestions[0]?.letterOptions || []);
      setUserFilledBlanks({});
      setUsedLetters([]);
      setFeedbackMessage(`👑 You've mastered Level ${currentLevel}! Keep going!`);
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 2000);
      return;
    }

    const newLevel = currentLevel + 1;
    setCurrentLevel(newLevel);
    setAnsweredInLevel(0);
    setAnsweredQuestions([]);
    setRetryQuestion(null);
    setWrongQuestions([]);
    setRetryPhase(false);
    setRetryIndex(0);
    
    const config = LEVEL_CONFIG[newLevel];
    const newQuestions = generateQuestions(newLevel);
    setQuestions(newQuestions);
    setCurrentQuestionIndex(0);
    setTimer(config.timer);
    setTimerRunning(true);
    setAnswered(false);
    setHintUsed(false);
    setShowCorrectAnimation(false);
    setBlankPositions(newQuestions[0]?.blankPositions || []);
    setVisiblePositions(newQuestions[0]?.visiblePositions || []);
    setAvailableLetters(newQuestions[0]?.letterOptions || []);
    setUserFilledBlanks({});
    setUsedLetters([]);
    
    setFeedbackMessage(`⬆️ LEVEL UP! ${config.emoji} ${config.label}`);
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 2500);
    playLevelUpSound();
  };

  // Process the next wrong question in retry phase
  const retryNextWrongQuestion = () => {
    if (retryIndex >= wrongQuestions.length) {
      setRetryPhase(false);
      setWrongQuestions([]);
      setRetryIndex(0);
      performLevelUp();
      return;
    }
    
    const wrongQ = wrongQuestions[retryIndex];
    
    if (!wrongQ || answeredQuestions.includes(wrongQ.id)) {
      setRetryIndex(prev => prev + 1);
      setTimeout(() => retryNextWrongQuestion(), 100);
      return;
    }
    
    const qIndex = questions.findIndex(q => q.id === wrongQ.id);
    
    if (qIndex !== -1) {
      setCurrentQuestionIndex(qIndex);
      setAnswered(false);
      setRetryQuestion(wrongQ);
      setAnsweredInLevel(retryIndex + 1);
      
      setFeedbackMessage(`🔄 Retry #${retryIndex + 1}/${wrongQuestions.length}: ${wrongQ.word}`);
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 1500);
      
      const config = LEVEL_CONFIG[currentLevel] || LEVEL_CONFIG[1];
      setTimer(config.timer);
      setTimerRunning(true);
      setHintUsed(false);
      setBlankPositions(wrongQ.blankPositions);
      setVisiblePositions(wrongQ.visiblePositions);
      setUserFilledBlanks({});
      setAvailableLetters(wrongQ.letterOptions || []);
      setUsedLetters([]);
    } else {
      setRetryIndex(prev => prev + 1);
      setTimeout(() => retryNextWrongQuestion(), 100);
    }
  };

  // Start the retry phase for wrong questions
  const startRetryPhase = () => {
    if (wrongQuestions.length === 0) {
      performLevelUp();
      return;
    }
    
    setAnsweredInLevel(0);
    setRetryPhase(true);
    setRetryIndex(0);
    
    setFeedbackMessage(`🔄 Retry Phase! ${wrongQuestions.length} wrong question(s) to fix!`);
    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
      retryNextWrongQuestion();
    }, 2000);
    playTone(440, 0.2);
  };

  // Handle answer during retry phase
  const handleRetryAnswer = (isCorrect) => {
    if (isCorrect) {
      const currentWrongQ = wrongQuestions[retryIndex];
      setWrongQuestions(prev => prev.filter(q => q.id !== currentWrongQ.id));
      
      setFeedbackMessage(`✅ Correct! You fixed your mistake! 🎉`);
      playCorrectSound();
      
      if (currentWrongQ && !answeredQuestions.includes(currentWrongQ.id)) {
        setAnsweredQuestions(prev => [...prev, currentWrongQ.id]);
      }
      
      setRetryIndex(prev => prev + 1);
      
      setShowFeedback(true);
      setTimeout(() => {
        setShowFeedback(false);
        if (retryIndex + 1 < wrongQuestions.length) {
          retryNextWrongQuestion();
        } else {
          setRetryPhase(false);
          setWrongQuestions([]);
          setRetryIndex(0);
          performLevelUp();
        }
      }, 1500);
    } else {
      setFeedbackMessage(`❌ Still wrong! Moving to next wrong question.`);
      playWrongSound();
      
      setRetryIndex(prev => prev + 1);
      
      setShowFeedback(true);
      setTimeout(() => {
        setShowFeedback(false);
        if (retryIndex + 1 < wrongQuestions.length) {
          retryNextWrongQuestion();
        } else {
          setRetryPhase(false);
          setWrongQuestions([]);
          setRetryIndex(0);
          performLevelUp();
        }
      }, 1500);
    }
  };

  // ============================================================
  // ===== CHECK WORD - UPDATED WITH FIREBASE =====
  // ============================================================
  const checkWord = async () => {
    if (answered || lives <= 0 || !currentQuestion) return;
    setTimerRunning(false);
    setAnswered(true);
    
    if (retryPhase && retryQuestion) {
      const word = currentQuestion.word;
      const blanks = currentQuestion.blankPositions || [];
      const filledWord = word.split('').map((letter, index) => {
        if (blanks.includes(index)) {
          return userFilledBlanks[index] || '_';
        }
        return letter;
      }).join('');
      const allFilled = blanks.every(pos => userFilledBlanks[pos] !== undefined);
      const isCorrect = filledWord === word && allFilled;
      
      handleRetryAnswer(isCorrect);
      return;
    }
    
    const word = currentQuestion.word;
    const blanks = currentQuestion.blankPositions || [];
    const filledWord = word.split('').map((letter, index) => {
      if (blanks.includes(index)) {
        return userFilledBlanks[index] || '_';
      }
      return letter;
    }).join('');
    const allFilled = blanks.every(pos => userFilledBlanks[pos] !== undefined);
    const isCorrect = filledWord === word && allFilled;
    
    if (isCorrect) {
      if (!answeredQuestions.includes(currentQuestion.id)) {
        console.log('✅ Correct answer:', currentQuestion.word);
        setAnsweredQuestions(prev => [...prev, currentQuestion.id]);
        setAnsweredInLevel(prev => prev + 1);
        setQuestionNumber(prev => prev + 1);
      }
      
      const newStreak = streak + 1;
      setStreak(newStreak);
      
      setFeedbackMessage(`✅ Correct! (${newStreak}x streak)`);
      
      const newCombo = comboCount + 1;
      setComboCount(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);
      const newCorrectCount = correctCount + 1;
      setCorrectCount(newCorrectCount);
      let pointsEarned = 1;
      setScore(prev => prev + pointsEarned);
      playCorrectSound();
      setShowCorrectAnimation(true);  
      setTimeout(() => setShowCorrectAnimation(false), 500);
      
    } else {
      console.log('❌ Wrong answer:', currentQuestion.word);
      setStreak(0);
      setComboCount(0);
      
      const missing = blanks.filter(pos => userFilledBlanks[pos] === undefined);
      
      if (!answeredQuestions.includes(currentQuestion.id) && !wrongQuestions.some(q => q.id === currentQuestion.id)) {
        console.log('💾 Saving wrong question for retry:', currentQuestion.word);
        setWrongQuestions(prev => [...prev, currentQuestion]);
      }
      
      if (!answeredQuestions.includes(currentQuestion.id)) {
        setAnsweredQuestions(prev => [...prev, currentQuestion.id]);
        setAnsweredInLevel(prev => prev + 1);
        setQuestionNumber(prev => prev + 1);
      }
      
      playWrongSound();
      setLives(prev => {
        const newLives = prev - 1;
        
        if (newLives === 0) {
          setFeedbackMessage(`💀 Game Over! You reached Level ${currentLevel}`);
          setShowNoLivesMessage(true);
          setTimeout(() => {
            setGameState('gameover');
            setShowFeedback(false);
            playGameOverSound();
            saveGameToFirebase();
          }, 2000);
        } else {
          setFeedbackMessage(`❌ Wrong! ${missing.length} blank(s) left. ${newLives} lives left`);
        }
        return newLives;
      });
    }
    
    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
      if (lives > 0 && gameState === 'playing') {
        generateNextQuestion();
      }
    }, 1500);
  };

  // ============================================================
  // ===== ✅ FIXED: SAVE TO FIREBASE - 1 POINT ONLY =====
  // ============================================================
  const saveGameToFirebase = async () => {
    if (!currentUser) {
      console.log('⚠️ No user logged in, skipping Firebase save');
      return;
    }

    const userId = currentUser.uid;
    const totalQuestionsAnswered = questionNumber || 0;
    const totalCorrect = correctCount || 0;
    const pointsEarned = score || 0;
    
    const won = totalCorrect >= totalQuestionsAnswered / 2;

    const gameData = {
      gameType: 'wordPics',
      pointsEarned: pointsEarned, // ✅ FIXED: 1 point per correct answer (was pointsEarned * 10)
      newWordsLearned: totalCorrect,
      correctAnswers: totalCorrect,
      totalQuestions: totalQuestionsAnswered,
      won: won,
      score: pointsEarned,
      levelReached: currentLevel
    };

    try {
      console.log('💾 Saving WordPics game to Firebase...');
      const result = await updateUserStats(userId, gameData);
      
      if (result.achievements && result.achievements.length > 0) {
        console.log('🏆 New Achievements Unlocked:', result.achievements);
        setFeedbackMessage(`🏆 New Achievements: ${result.achievements.join(', ')} 🎉`);
        setShowFeedback(true);
        setTimeout(() => setShowFeedback(false), 5000);
      }
      
      console.log('✅ WordPics game saved to Firebase successfully!');
    } catch (error) {
      console.error('❌ Error saving to Firebase:', error);
    }
  };

  // ============================================================
  // ===== ✅ FIXED: SAVE TO FIREBASE ON LEVEL UP - 1 POINT ONLY =====
  // ============================================================
  const saveProgressOnLevelUp = async () => {
    if (!currentUser) return;
    
    const userId = currentUser.uid;
    const totalCorrect = correctCount || 0;
    const pointsEarned = score || 0;
    
    const gameData = {
      gameType: 'wordPics',
      pointsEarned: pointsEarned, // ✅ FIXED: 1 point per correct answer (was pointsEarned * 5)
      newWordsLearned: Math.min(totalCorrect, 5),
      correctAnswers: totalCorrect,
      totalQuestions: questionNumber || 10,
      won: true,
      score: pointsEarned,
      levelReached: currentLevel
    };

    try {
      await updateUserStats(userId, gameData);
      console.log('✅ Progress saved on level up!');
    } catch (error) {
      console.error('❌ Error saving on level up:', error);
    }
  };

  // Generate the next question in the game
  const generateNextQuestion = () => {
    if (lives <= 0) return;
    
    if (retryPhase) {
      const currentWrongQ = wrongQuestions[retryIndex];
      if (currentWrongQ && answeredQuestions.includes(currentWrongQ.id)) {
        setWrongQuestions(prev => prev.filter(q => q.id !== currentWrongQ.id));
        const newIndex = retryIndex + 1;
        setRetryIndex(newIndex);
        
        if (newIndex < wrongQuestions.length) {
          setTimeout(() => retryNextWrongQuestion(), 500);
        } else {
          setRetryPhase(false);
          setWrongQuestions([]);
          setRetryIndex(0);
          setRetryQuestion(null);
          performLevelUp();
          saveProgressOnLevelUp();
        }
        return;
      } else if (currentWrongQ && !answeredQuestions.includes(currentWrongQ.id)) {
        return;
      }
    }
    
    const allAnswered = checkIfAllAnswered();
    
    if (allAnswered) {
      if (wrongQuestions.length > 0) {
        startRetryPhase();
        return;
      } else {
        performLevelUp();
        saveProgressOnLevelUp();
        return;
      }
    }
    
    const nextQ = getNextUnansweredQuestion();
    
    if (!nextQ) {
      if (checkIfAllAnswered()) {
        if (wrongQuestions.length > 0) {
          startRetryPhase();
        } else {
          performLevelUp();
          saveProgressOnLevelUp();
        }
      }
      return;
    }
    
    const nextIndex = questions.findIndex(q => q.id === nextQ.id);
    
    if (nextIndex !== -1) {
      setCurrentQuestionIndex(nextIndex);
      const config = LEVEL_CONFIG[currentLevel] || LEVEL_CONFIG[1];
      setTimer(config.timer);
      setTimerRunning(true);
      setAnswered(false);
      setBlankPositions(nextQ.blankPositions);
      setVisiblePositions(nextQ.visiblePositions);
      setUserFilledBlanks({});
      setAvailableLetters(nextQ.letterOptions || []);
      setUsedLetters([]);
      setHintUsed(false);
      setShowCorrectAnimation(false);
      setRetryQuestion(null);
    }
  };

  // ============================================================
  // ===== START GAME FROM INTRO WITH LOADING =====
  // ============================================================
  const startGame = () => {
    if (!currentUser) {
      setFeedbackMessage('⚠️ Please log in to play!');
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 3000);
      return;
    }

    if (lives <= 0) {
      setShowNoLivesMessage(true);
      setFeedbackMessage(`😢 No lives left! Next heart in ${timeRemaining || '30 minutes'}`);
      setShowFeedback(true);
      setTimeout(() => {
        setShowFeedback(false);
        setGameState('intro');
      }, 3000);
      return;
    }
    
    // Show loading screen first
    setGameState('loading');
    
    // After 2 seconds, initialize the game
    setTimeout(() => {
      setScore(0);
      setCorrectCount(0);
      setComboCount(0);
      setMaxCombo(0);
      setStreak(0);
      setQuestionNumber(0);
      setAnswered(false);
      setHintUsed(false);
      setCurrentLevel(1);
      setAnsweredInLevel(0);
      setAnsweredQuestions([]);
      setRetryQuestion(null);
      setWrongQuestions([]);
      setRetryPhase(false);
      setRetryIndex(0);
      setUserFilledBlanks({});
      setUsedLetters([]);
      const newQuestions = generateQuestions(1);
      setQuestions(newQuestions);
      setCurrentQuestionIndex(0);
      setBlankPositions(newQuestions[0]?.blankPositions || []);
      setVisiblePositions(newQuestions[0]?.visiblePositions || []);
      setAvailableLetters(newQuestions[0]?.letterOptions || []);
      setTimer(LEVEL_CONFIG[1].timer);
      setTimerRunning(true);
      setGameState('playing');
      setShowNoLivesMessage(false);
    }, 2000);
  };

  const currentQuestion = questions[currentQuestionIndex];

  // Use hint to reveal one blank
  const useHint = () => {
    if (!hintUsed && currentQuestion && !answered && lives > 0) {
      setHintUsed(true);
      const blanks = currentQuestion.blankPositions || [];
      const word = currentQuestion.word;
      const firstBlank = blanks.find(pos => userFilledBlanks[pos] === undefined);
      if (firstBlank !== undefined) {
        const letter = word[firstBlank];
        const newFilled = { ...userFilledBlanks, [firstBlank]: letter };
        setUserFilledBlanks(newFilled);
        const letterIndex = availableLetters.findIndex((l, idx) => 
          l === letter && !usedLetters.includes(idx)
        );
        if (letterIndex !== -1) {
          setUsedLetters([...usedLetters, letterIndex]);
        }
      }
      setFeedbackMessage('💡 Hint: One letter revealed! (-3 secs)');
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 1500);
      setTimer(prev => Math.max(1, prev - 3));
      playTone(440, 0.1);
    }
  };

  // Handle clicking a letter option
  const handleLetterClick = (letter, index) => {
    if (answered || lives <= 0 || timer === 0 || !currentQuestion) return;
    if (usedLetters.includes(index)) return;
    const blanks = currentQuestion.blankPositions || [];
    const firstEmpty = blanks.find(pos => userFilledBlanks[pos] === undefined);
    if (firstEmpty !== undefined) {
      const newFilled = { ...userFilledBlanks, [firstEmpty]: letter };
      setUserFilledBlanks(newFilled);
      setUsedLetters([...usedLetters, index]);
    }
  };

  // Handle clicking a blank to remove a letter
  const handleBlankClick = (position) => {
    if (answered || lives <= 0 || timer === 0 || !currentQuestion) return;
    if (userFilledBlanks[position] === undefined) return;
    const letter = userFilledBlanks[position];
    const newFilled = { ...userFilledBlanks };
    delete newFilled[position];
    setUserFilledBlanks(newFilled);
    const letterIndex = availableLetters.findIndex((l, idx) => 
      l === letter && !usedLetters.includes(idx)
    );
    if (letterIndex !== -1) {
      setUsedLetters(usedLetters.filter(idx => idx !== letterIndex));
    }
  };

  // ============================================================
  // ===== INITIALIZE GAME EFFECT =====
  // ============================================================
  useEffect(() => {
    if (isUserLoaded && currentUser) {
      const newQuestions = generateQuestions(1);
      setQuestions(newQuestions);
      setCurrentQuestionIndex(0);
      setScore(0);
      setCorrectCount(0);
      setComboCount(0);
      setMaxCombo(0);
      setStreak(0);
      setAnswered(false);
      setHintUsed(false);
      setTimer(LEVEL_CONFIG[1].timer);
      setTimerRunning(false);
      setGameState('intro');
      setShowNoLivesMessage(false);
      setCurrentLevel(1);
      setQuestionNumber(0);
      setAnsweredInLevel(0);
      setAnsweredQuestions([]);
      setRetryQuestion(null);
      setWrongQuestions([]);
      setRetryPhase(false);
      setRetryIndex(0);
      setBlankPositions([]);
      setVisiblePositions([]);
      setUserFilledBlanks({});
      setAvailableLetters([]);
      setUsedLetters([]);
    }
  }, [isUserLoaded, currentUser]);

  // ============================================================
  // ===== WATCH FOR CURRENT QUESTION CHANGES =====
  // ============================================================
  useEffect(() => {
    if (gameState === 'playing' && currentQuestion && !answered && lives > 0) {
      if (answeredQuestions.includes(currentQuestion.id) && !retryQuestion) {
        generateNextQuestion();
        return;
      }
      
      const config = LEVEL_CONFIG[currentLevel] || LEVEL_CONFIG[1];
      setTimer(config.timer);
      setTimerRunning(true);
      setHintUsed(false);
      setBlankPositions(currentQuestion.blankPositions || []);
      setVisiblePositions(currentQuestion.visiblePositions || []);
      setUserFilledBlanks({});
      setAvailableLetters(currentQuestion.letterOptions || []);
      setUsedLetters([]);
    } else if (lives <= 0) {
      setTimerRunning(false);
    }
  }, [currentQuestion, gameState, answered, lives]);

  // ============================================================
  // ===== TIMER EFFECT =====
  // ============================================================
  useEffect(() => {
    if (lives <= 0) {
      setTimerRunning(false);
      return;
    }
    if (timerRunning && timer > 0) {
      const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && timerRunning) {
      setAnswered(true);
      setTimerRunning(false);
      
      if (!currentQuestion) {
        generateNextQuestion();
        return;
      }
      
      if (!answeredQuestions.includes(currentQuestion.id)) {
        if (!wrongQuestions.some(q => q.id === currentQuestion.id)) {
          setWrongQuestions(prev => [...prev, currentQuestion]);
        }
        
        setAnsweredQuestions(prev => [...prev, currentQuestion.id]);
        setAnsweredInLevel(prev => prev + 1);
        setQuestionNumber(prev => prev + 1);
      }
      
      setStreak(0);
      setComboCount(0);
      playWrongSound();
      
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives === 0) {
          setFeedbackMessage(`⏰ Time's up! Game Over! You reached Level ${currentLevel}`);
          setShowNoLivesMessage(true);
          setTimeout(() => {
            setGameState('gameover');
            setShowFeedback(false);
            playGameOverSound();
            saveGameToFirebase();
          }, 2000);
        } else {
          setFeedbackMessage(`⏰ Time's up! ${newLives} lives left`);
        }
        return newLives;
      });
      
      setShowFeedback(true);
      setTimeout(() => {
        setShowFeedback(false);
        if (lives > 0 && gameState === 'playing') {
          generateNextQuestion();
        }
      }, 1500);
    }
  }, [timer, timerRunning, lives, currentLevel, currentQuestion]);

  // ============================================================
  // ===== SAVE PROGRESS TO DASHBOARD (OLD - KEPT FOR COMPATIBILITY) =====
  // ============================================================
  useEffect(() => {
    if (gameState === 'gameover' && updateProgress) {
      const totalQuestions = questionNumber || 0;
      const totalAnswers = totalQuestions;
      const correctAnswers = correctCount || 0;
      const totalGames = Math.ceil(correctAnswers / 10) || 1;
      
      const saved = localStorage.getItem('vocaboplay_progress');
      const currentProgress = saved ? JSON.parse(saved) : {};
      
      const today = new Date().toDateString();
      const lastPlayed = localStorage.getItem('vocaboplay_lastPlayed');
      let newStreak = currentProgress.streak || 0;
      
      if (!lastPlayed || lastPlayed !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        
        if (lastPlayed === yesterdayStr) {
          newStreak = (currentProgress.streak || 0) + 1;
        } else {
          newStreak = 1;
        }
        localStorage.setItem('vocaboplay_lastPlayed', today);
      }
      
      updateProgress({
        gamesPlayed: 1,
        totalPoints: score,
        xp: score,
        wordsLearned: correctCount,
        totalAnswers: totalAnswers,
        correctAnswers: correctAnswers,
        streak: newStreak,
        wordPics: {
          gamesPlayed: totalGames,
          gamesCompleted: correctAnswers >= 10 ? Math.floor(correctAnswers / 10) : 0,
          totalScore: score,
          correctAnswers: correctAnswers,
          totalQuestions: totalQuestions,
          cardsViewed: totalQuestions,
          knownWords: []
        }
      }).then(() => {
        console.log('✅ WordPicsGame: Progress saved successfully!');
      }).catch(err => {
        console.error('❌ WordPicsGame: Error saving progress:', err);
      });
    }
  }, [gameState, score, correctCount, questionNumber, updateProgress]);

  // ============================================================
  // ===== EXIT GAME =====
  // ============================================================
  const handleExitGame = async () => {
    if (gameState === 'playing') {
      await saveGameToFirebase();
      
      if (updateProgress) {
        const totalQuestions = questionNumber || 0;
        const correctAnswers = correctCount || 0;
        
        updateProgress({
          gamesPlayed: 1,
          totalPoints: score,
          xp: score,
          wordsLearned: correctCount,
          totalAnswers: totalQuestions,
          correctAnswers: correctAnswers,
          wordPics: {
            gamesPlayed: 1,
            gamesCompleted: correctAnswers >= 10 ? 1 : 0,
            totalScore: score,
            correctAnswers: correctAnswers,
            totalQuestions: totalQuestions,
            cardsViewed: totalQuestions
          }
        }).then(() => {
          console.log('✅ WordPicsGame: Progress saved on exit!');
        }).catch(err => {
          console.error('❌ WordPicsGame: Error saving progress on exit:', err);
        });
      }
    }
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    setShowExitConfirm(false);
    setShowSettings(false);
    backgroundMusic.stop();
    if (onBack) onBack();
  };

  const cancelExit = () => setShowExitConfirm(false);

  // ============================================================
  // ===== MODALS =====
  // ============================================================
  const ExitConfirmModal = () => (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px'
    }}>
      <div style={{
        background: 'white', borderRadius: '16px', padding: '28px',
        maxWidth: '340px', width: '100%', textAlign: 'center',
        boxShadow: 'none'
      }}>
        <div style={{ fontSize: '40px', marginBottom: '8px' }}> ❌</div>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1E293B', marginBottom: '6px' }}>Exit Game?</h3>
        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px' }}>Your progress will be saved.</p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={confirmExit} style={{ flex: 1, padding: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Yes, End</button>
          <button onClick={cancelExit} style={{ flex: 1, padding: '10px', background: '#F8FAFC', color: '#64748B', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Cancel</button>
        </div>
      </div>
    </div>
  );

  const SettingsModal = () => (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
    }} onClick={() => setShowSettings(false)}>
      <div style={{
        background: 'white', borderRadius: '16px', padding: '24px',
        maxWidth: '360px', width: '100%', maxHeight: '80vh', overflow: 'auto'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#1E293B' }}>Settings</h3>
          <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748B' }}>✕</button>
        </div>
        <div style={{ marginBottom: '16px', padding: '12px', background: '#F8FAFC', borderRadius: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', textAlign: 'center' }}>
            <div><div style={{ fontSize: '18px', fontWeight: '700', color: '#5C6AC4' }}>{stats.gamesPlayed}</div><div style={{ fontSize: '10px', color: '#64748B' }}>Games</div></div>
            <div><div style={{ fontSize: '18px', fontWeight: '700', color: '#5C6AC4' }}>{stats.bestScore}</div><div style={{ fontSize: '10px', color: '#64748B' }}>Best Score</div></div>
            <div><div style={{ fontSize: '18px', fontWeight: '700', color: '#5C6AC4' }}>Lv.{currentLevel}</div><div style={{ fontSize: '10px', color: '#64748B' }}>Current Level</div></div>
          </div>
        </div>
        <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>🔊 Sound</span>
          <button onClick={() => { const newMuted = !isMuted; setIsMuted(newMuted); if (gainNode.current) gainNode.current.gain.value = newMuted ? 0 : 0.4; }} style={{ padding: '3px 14px', borderRadius: '8px', border: 'none', background: isMuted ? '#ef4444' : '#10b981', color: 'white', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>{isMuted ? 'OFF' : 'ON'}</button>
        </div>
        <button onClick={() => { setShowLeaderboard(true); setShowSettings(false); }} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'transparent', color: '#64748B', cursor: 'pointer', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>🏆 Leaderboard</button>
        <button onClick={handleExitGame} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}> ❌ Exit Game</button>
        <button onClick={() => { setShowSettings(false); setGameState('intro'); }} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: 'none', background: '#F8FAFC', color: '#64748B', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>🔄 New Game</button>
      </div>
    </div>
  );

  const LeaderboardModal = () => (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
    }} onClick={() => setShowLeaderboard(false)}>
      <div style={{
        background: 'white', borderRadius: '16px', padding: '20px',
        maxWidth: '380px', width: '100%', maxHeight: '70vh', overflow: 'auto'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#1E293B' }}>🏆 Leaderboard</h3>
          <button onClick={() => setShowLeaderboard(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748B' }}>✕</button>
        </div>
        {leaderboardData.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748B', padding: '24px 0' }}><div style={{ fontSize: '36px', marginBottom: '6px' }}>📊</div><p style={{ fontSize: '13px' }}>No scores yet! Keep playing!</p></div>
        ) : (
          leaderboardData.map((entry, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', padding: '8px 10px', borderRadius: '8px', background: index < 3 ? '#f0f0ff' : 'transparent', marginBottom: '4px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#E2E8F0', color: index < 3 ? '#1E293B' : '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', marginRight: '10px' }}>{index + 1}</div>
              <div style={{ flex: 1 }}><div style={{ fontWeight: '600', fontSize: '13px', color: '#1E293B' }}>{entry.name || 'Player'}</div><div style={{ fontSize: '10px', color: '#64748B' }}>Level {entry.level || 1} • {entry.questions || 0} questions</div></div>
              <div style={{ fontWeight: '700', fontSize: '15px', color: '#5C6AC4' }}>{entry.score}</div>
            </div>
          ))
        )}
        <button onClick={() => setShowLeaderboard(false)} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: 'none', background: '#5C6AC4', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: '600', marginTop: '10px' }}>Close</button>
      </div>
    </div>
  );

  const NoLivesOverlay = () => {
    if (!showNoLivesMessage && lives > 0) return null;
    if (gameState !== 'playing') return null;
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px'
      }}>
        <div style={{
          background: 'white', borderRadius: '24px', padding: '32px',
          maxWidth: '380px', width: '100%', textAlign: 'center',
          boxShadow: 'none'
        }}>
          <div style={{ fontSize: '56px', marginBottom: '8px' }}>😢</div>
          <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#1E293B', marginBottom: '4px' }}>No Lives Left!</h3>
          <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '6px' }}>Next heart in</p>
          <p style={{ fontSize: '28px', fontWeight: '800', color: '#f59e0b', marginBottom: '16px' }}>{timeRemaining || '30 minutes'}</p>
          <button onClick={() => { setShowNoLivesMessage(false); setGameState('intro'); }} style={{ width: '100%', padding: '14px', background: '#5C6AC4', color: 'white', border: 'none', borderRadius: '14px', cursor: 'pointer', fontSize: '16px', fontWeight: '600', boxShadow: 'none' }}>Back to Menu</button>
        </div>
      </div>
    );
  };

  // ============================================================
  // ===== LOADING SCREEN (UPDATED v2 — full image visible, right-flowing scroll, forces top layer) =====
  // ============================================================
  if (gameState === 'loading') {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Poppins', -apple-system, sans-serif",
        zIndex: 999999, // sits above any parent header/nav bar
        background: '#2b2a4a', // fallback color while the image loads (or if the path is wrong)
      }}>
        {/* ===== Scrolling pixel-art background — full image visible, flows continuously to the LEFT (Flappy-Bird style forward motion) ===== */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          zIndex: 0,
        }}>
          <div className="loading-scroll-track">
            <img
              src={images['pixel-town']}
              className="loading-scroll-img"
              alt=""
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <img
              src={images['pixel-town']}
              className="loading-scroll-img"
              alt=""
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
          {/* Dark overlay so the card text stays readable */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(135deg, rgba(49,46,110,0.45), rgba(13,11,26,0.5))',
            pointerEvents: 'none'
          }} />
        </div>

        {/* Floating decorative dots (kept from before, on top of new bg) */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          pointerEvents: 'none'
        }}>
          {[...Array(12)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.25)',
              top: `${10 + Math.random() * 80}%`,
              left: `${10 + Math.random() * 80}%`,
              animation: `twinkle 2s ease-in-out ${i * 0.3}s infinite`
            }} />
          ))}
        </div>

        <div style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          maxWidth: '420px',
          width: '100%',
          padding: '40px 32px',
          background: 'rgba(13, 11, 26, 0.5)',
          backdropFilter: 'blur(16px)',
          borderRadius: '24px',
          border: '1px solid rgba(139,92,246,0.2)'
        }}>
          {/* ===== "Loading..." bubble text with sparkles ===== */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '28px' }}>
            <span className="sparkle-star" style={{ left: '-26px', top: '2px', fontSize: '18px', animationDelay: '0s' }}>✦</span>
            <h2 style={{
              fontSize: '38px',
              fontWeight: '900',
              margin: 0,
              fontFamily: "'Poppins', -apple-system, sans-serif",
              background: 'linear-gradient(180deg, #EAF6FF 0%, #7FD3FF 55%, #3FA9F5 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 2px 0px #0d0b1a) drop-shadow(0 4px 0px rgba(63,169,245,0.3))',
              letterSpacing: '0.5px',
              animation: 'textBounce 1.4s ease-in-out infinite'
            }}>
              Loading<span className="loading-dots">...</span>
            </h2>
            <span className="sparkle-star" style={{ right: '-26px', top: '-6px', fontSize: '16px', animationDelay: '0.6s' }}>✦</span>
          </div>

          {/* ===== Animated rainbow pill progress bar ===== */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: '30px',
            borderRadius: '20px',
            background: 'rgba(255,255,255,0.06)',
            border: '2px solid rgba(139,92,246,0.35)',
            overflow: 'hidden',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4)'
          }}>
            <div className="progress-fill" style={{
              position: 'absolute',
              top: '3px',
              left: '3px',
              bottom: '3px',
              width: '35%',
              borderRadius: '16px',
              background: 'linear-gradient(90deg, #4ADE80 0%, #FDE047 35%, #FB923C 60%, #F472B6 80%, #C084FC 100%)',
              boxShadow: '0 0 12px rgba(139,92,246,0.6)',
              animation: 'progressSlide 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite'
            }} />
            {/* Shimmer sheen */}
            <div className="progress-shimmer" />
          </div>

          {/* Small text */}
          <p style={{
            fontSize: '12px',
            color: '#9CA3AF',
            marginTop: '16px',
            fontStyle: 'italic'
          }}>
            Preparing your SynoQuest adventure...
          </p>
        </div>

        <style>{`
          /* ===== Continuous one-direction scroll — image shown FULLY (height-based, no cropping), flowing left (Flappy-Bird forward feel) ===== */
          .loading-scroll-track {
            display: flex;
            height: 100%;
            width: max-content;
            animation: loadingScroll 14s linear infinite;
          }
          .loading-scroll-img {
            height: 100%;
            width: auto;
            max-width: none;
            flex-shrink: 0;
            display: block;
            object-fit: contain;
          }
          @keyframes loadingScroll {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }

          @keyframes twinkle {
            0%, 100% { opacity: 0.1; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.5); }
          }

          @keyframes textBounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }

          @keyframes sparkleTwinkle {
            0%, 100% { opacity: 0.2; transform: scale(0.8) rotate(0deg); }
            50% { opacity: 1; transform: scale(1.3) rotate(20deg); }
          }

          .sparkle-star {
            position: absolute;
            color: #FDE047;
            animation: sparkleTwinkle 1.6s ease-in-out infinite;
          }

          .loading-dots {
            display: inline-block;
            animation: textBounce 1.4s ease-in-out infinite;
          }

          @keyframes progressSlide {
            0% { left: 3px; width: 20%; }
            50% { left: 40%; width: 45%; }
            100% { left: 97%; width: 20%; transform: translateX(-100%); }
          }

          .progress-shimmer {
            position: absolute;
            top: 0; left: -40%;
            width: 40%; height: 100%;
            background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0) 100%);
            animation: shimmerSweep 1.8s linear infinite;
          }

          @keyframes shimmerSweep {
            0% { left: -40%; }
            100% { left: 100%; }
          }
        `}</style>
      </div>
    );
  }

  // ============================================================
  // ===== LOADING SCREEN (Initial Firebase auth) =====
  // ============================================================
  if (!isUserLoaded) {
    return (
      <div style={{
        ...fullScreenBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {bgAnimationStyle}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1E293B' }}>Loading...</h2>
          <p style={{ fontSize: '14px', color: '#64748B' }}>Please wait while we set up your game.</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ===== INTRO SCREEN =====
  // ============================================================
  if (gameState === 'intro') {
    return (
      <div style={{
        ...fullScreenBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      }}>
        {bgAnimationStyle}
        {showSettings && <SettingsModal />}
        {showLeaderboard && <LeaderboardModal />}
        {showExitConfirm && <ExitConfirmModal />}

        <div style={{
          maxWidth: '520px',
          width: '100%',
          background: theme.cardBg,
          borderRadius: '28px',
          padding: '32px 28px',
          border: theme.cardBorder,
          boxShadow: theme.cardShadow,
          textAlign: 'center'
        }}>
          <div style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            background: theme.accentGradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 10px 30px rgba(139,92,246,0.35)'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px'
            }}>
              📖
            </div>
          </div>

          {currentUser && (
            <div style={{
              background: theme.chipBg,
              padding: '4px 14px',
              borderRadius: '10px',
              marginBottom: '10px',
              display: 'inline-block'
            }}>
              <span style={{ fontSize: '12px', color: theme.textSecondary, fontWeight: '600' }}>
                👤 {currentUser.displayName || currentUser.email || 'Player'}
              </span>
            </div>
          )}

          <h1 style={{ fontSize: '30px', fontWeight: '800', color: theme.textPrimary, marginBottom: '2px', letterSpacing: '-0.5px' }}>SynoQuest</h1>
          <p style={{ fontSize: '12px', color: theme.textSecondary, marginBottom: '16px', fontWeight: '500' }}>📚 10 questions per level • 8 levels!</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginBottom: '14px', background: theme.surfaceBg, padding: '8px', borderRadius: '10px', border: `1px solid ${theme.surfaceBorder}` }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((level) => {
              const config = LEVEL_CONFIG[level];
              return (
                <div key={level} style={{
                  padding: '4px', borderRadius: '6px',
                  background: level <= 2 ? 'rgba(139,92,246,0.14)' : level <= 4 ? 'rgba(251, 191, 36, 0.14)' : level <= 6 ? 'rgba(251, 146, 60, 0.14)' : 'rgba(239, 68, 68, 0.14)',
                  textAlign: 'center', fontSize: '9px', fontWeight: '700',
                  color: level <= 2 ? '#C4B5FD' : level <= 4 ? '#FDE68A' : level <= 6 ? '#FDBA74' : '#FCA5A5'
                }}>
                  <div style={{ fontSize: '12px' }}>{config.emoji}</div>
                  <div>Lv.{level}</div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '14px', padding: '10px', background: theme.surfaceBg, borderRadius: '10px', border: `1px solid ${theme.surfaceBorder}` }}>
            <div style={{ display: 'flex', gap: '1px' }}>
              {[...Array(lives)].map((_, i) => (<span key={i} style={{ fontSize: '18px' }}>❤️</span>))}
              {[...Array(maxLives - lives)].map((_, i) => (<span key={i} style={{ fontSize: '18px', opacity: 0.2 }}>❤️</span>))}
            </div>
            <span style={{ fontSize: '12px', color: theme.textSecondary, marginLeft: '4px', fontWeight: '600' }}>
              {lives > 0 ? `${lives}/${maxLives} lives` : 'No lives left'}
            </span>
            {lives < maxLives && timeRemaining && (
              <span style={{ fontSize: '11px', color: '#FBBF24', fontWeight: '600' }}>⏳ {timeRemaining}</span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '4px', marginBottom: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <span style={{ padding: '4px 12px', borderRadius: '8px', background: theme.chipBg, color: theme.textSecondary, fontSize: '11px', fontWeight: '600' }}>✏️ 10 Q/Level</span>
            <span style={{ padding: '4px 12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.16)', color: '#FCA5A5', fontSize: '11px', fontWeight: '600' }}>⏱️ 15s→5s</span>
            <span style={{ padding: '4px 12px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.16)', color: '#6EE7B7', fontSize: '11px', fontWeight: '600' }}>❤️ 5 Lives</span>
            <span style={{ padding: '4px 12px', borderRadius: '8px', background: 'rgba(251, 191, 36, 0.16)', color: '#FDE68A', fontSize: '11px', fontWeight: '600' }}>💡 1 Hint</span>
          </div>

          {lives > 0 ? (
            <button onClick={startGame} style={{ width: '100%', padding: '14px', background: theme.accentGradient, color: 'white', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 10px 30px rgba(139,92,246,0.4)' }}>🚀 Start Game</button>
          ) : (
            <div style={{ width: '100%', padding: '14px', background: theme.surfaceBg, color: theme.textSecondary, border: `1px solid ${theme.surfaceBorder}`, borderRadius: '14px', fontSize: '13px', fontWeight: '700', cursor: 'not-allowed' }}>
              ⏳ No Lives - Next heart in {timeRemaining || '30 minutes'}
            </div>
          )}
          {showFeedback && (<div style={{ marginTop: '10px', padding: '8px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.16)', border: '1px solid rgba(239, 68, 68, 0.3)', textAlign: 'center', fontSize: '12px', fontWeight: '500', color: '#FCA5A5' }}>{feedbackMessage}</div>)}

          {onBack && (
            <button onClick={onBack} style={{ marginTop: '10px', width: '100%', padding: '10px', background: 'transparent', color: theme.textSecondary, border: `1px solid ${theme.surfaceBorder}`, borderRadius: '12px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              ← Back
            </button>
          )}
        </div>
      </div>
    );
  }

  // ============================================================
  // ===== GAME OVER SCREEN =====
  // ============================================================
  if (gameState === 'gameover') {
    const accuracy = questionNumber > 0 ? Math.round((correctCount / questionNumber) * 100) : 0;
    return (
      <div style={{
        ...fullScreenBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      }}>
        {bgAnimationStyle}
        <div style={{
          maxWidth: '520px',
          width: '100%', background: theme.cardBg,
          borderRadius: '28px', padding: '32px 28px',
          border: theme.cardBorder,
          boxShadow: theme.cardShadow, textAlign: 'center'
        }}>
          <div style={{ fontSize: '60px', marginBottom: '6px' }}>💀</div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: theme.textPrimary, marginBottom: '4px' }}>Game Over!</h2>
          <p style={{ fontSize: '13px', color: theme.textSecondary, marginBottom: '16px' }}>
            You reached <strong style={{ color: theme.accent }}>Level {currentLevel}</strong> with <strong style={{ color: theme.accent }}>{correctCount}</strong> correct answers!
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
            <div style={{ padding: '12px', background: theme.surfaceBg, borderRadius: '10px', border: `1px solid ${theme.surfaceBorder}` }}><div style={{ fontSize: '20px', fontWeight: '700', color: theme.textPrimary }}>{score}</div><div style={{ fontSize: '10px', color: theme.textSecondary }}>Score</div></div>
            <div style={{ padding: '12px', background: theme.surfaceBg, borderRadius: '10px', border: `1px solid ${theme.surfaceBorder}` }}><div style={{ fontSize: '20px', fontWeight: '700', color: theme.textPrimary }}>{accuracy}%</div><div style={{ fontSize: '10px', color: theme.textSecondary }}>Accuracy</div></div>
            <div style={{ padding: '12px', background: theme.surfaceBg, borderRadius: '10px', border: `1px solid ${theme.surfaceBorder}` }}><div style={{ fontSize: '20px', fontWeight: '700', color: '#FBBF24' }}>×{maxCombo}</div><div style={{ fontSize: '10px', color: theme.textSecondary }}>Best Combo</div></div>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexDirection: 'column' }}>
            <button onClick={startGame} disabled={lives <= 0} style={{ padding: '12px', background: lives > 0 ? theme.accentGradient : 'rgba(255,255,255,0.08)', color: lives > 0 ? 'white' : theme.textMuted, border: 'none', borderRadius: '12px', cursor: lives > 0 ? 'pointer' : 'not-allowed', fontSize: '13px', fontWeight: '600', boxShadow: lives > 0 ? '0 10px 25px rgba(139,92,246,0.35)' : 'none' }}>{lives > 0 ? '🔄 Play Again' : '⏳ No Lives - Next heart in ' + timeRemaining}</button>
            <button onClick={() => setGameState('intro')} style={{ padding: '10px', background: 'transparent', color: theme.textSecondary, border: `1px solid ${theme.surfaceBorder}`, borderRadius: '12px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Back to Menu</button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // ===== PLAYING SCREEN =====
  // ============================================================
  if (gameState === 'playing') {
    if (!currentQuestion) {
      return (
        <div style={{
          ...fullScreenBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }}>
          {bgAnimationStyle}
          <div style={{ background: theme.cardBg, border: theme.cardBorder, boxShadow: theme.cardShadow, borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔄</div>
            <h2 style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary }}>Generating puzzle...</h2>
          </div>
        </div>
      );
    }

    const word = currentQuestion.word || '';
    const blanks = currentQuestion.blankPositions || [];
    const visiblePositions = currentQuestion.visiblePositions || [];
    const letters = currentQuestion.letterOptions || [];
    const config = LEVEL_CONFIG[currentLevel] || LEVEL_CONFIG[1];

    return (
      <div style={{
        ...fullScreenBg,
        padding: '12px',
        display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}>
        {bgAnimationStyle}
        <NoLivesOverlay />
        {showExitConfirm && <ExitConfirmModal />}
        {showSettings && <SettingsModal />}
        {showLeaderboard && <LeaderboardModal />}

        {/* HEADER */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '8px 14px', background: 'rgba(255,255,255,0.15)', borderRadius: '14px',
          maxWidth: '520px', width: '100%', margin: '0 auto 10px',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => setShowSettings(true)} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', padding: '2px', color: 'white' }}>⚙️</button>
            <span style={{ fontWeight: '600', color: 'white', fontSize: '12px' }}>📝 {config.emoji} Lv.{currentLevel}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ fontSize: '10px', color: 'white', fontWeight: '600', background: 'rgba(255,255,255,0.15)', padding: '2px 10px', borderRadius: '10px' }}>
              {retryPhase ? `Retry ${retryIndex + 1}/${wrongQuestions.length}` : `${answeredInLevel}/${QUESTIONS_PER_LEVEL}`}
            </div>
            <div style={{ fontSize: '10px', color: 'white', fontWeight: '600', background: 'rgba(255,255,255,0.15)', padding: '2px 10px', borderRadius: '10px' }}>#{questionNumber}</div>
            <div style={{ display: 'flex', gap: '1px' }}>
              {[...Array(lives)].map((_, i) => (<span key={i} style={{ fontSize: '14px' }}>❤️</span>))}
              {[...Array(maxLives - lives)].map((_, i) => (<span key={i} style={{ fontSize: '14px', opacity: 0.2 }}>❤️</span>))}
            </div>

            <div style={{
              width: '30px', height: '30px', borderRadius: '50%',
              background: timer <= 3 ? 'rgba(239, 68, 68, 0.3)' : timer <= 5 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255,255,255,0.2)',
              border: `2px solid ${timer <= 3 ? '#ef4444' : timer <= 5 ? '#f59e0b' : 'rgba(255,255,255,0.3)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: timer <= 3 ? '#ef4444' : timer <= 5 ? '#f59e0b' : 'white',
              fontSize: '12px', fontWeight: '700'
            }}>{timer}</div>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 14px', borderRadius: '8px', color: 'white', fontWeight: '700', fontSize: '14px' }}>{score}</div>
            {comboCount >= 3 && (<div style={{ background: 'rgba(251, 191, 36, 0.2)', padding: '2px 12px', borderRadius: '8px', color: '#f59e0b', fontWeight: '700', fontSize: '11px', border: '1px solid rgba(251, 191, 36, 0.2)' }}>🔥 {comboCount}x</div>)}
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: '2px 10px', borderRadius: '10px', color: 'white', fontWeight: '600', fontSize: '10px' }}>{correctCount}✅</div>
          </div>
        </div>

        {/* PUZZLE CARD */}
        <div style={{
          maxWidth: '620px',
          width: '100%', background: theme.cardBg,
          borderRadius: '24px', padding: '30px 28px',
          border: theme.cardBorder,
          boxShadow: theme.cardShadow,
          position: 'relative', overflow: 'hidden'
        }}>
          {showCorrectAnimation && (<div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(16, 185, 129, 0.12)', animation: 'correctFlash 0.5s ease' }} />)}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: '700', color: theme.textSecondary }}>{config.emoji} Level {currentLevel}/{MAX_LEVEL}</span>
            <span style={{ fontSize: '13px', color: theme.textMuted, fontWeight: '500' }}>
              {retryPhase ? `Retry ${retryIndex + 1}/${wrongQuestions.length}` : `Q${answeredInLevel + 1}/${QUESTIONS_PER_LEVEL}`}
            </span>
          </div>

          {/* TWO IMAGES */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '18px', padding: '18px', background: theme.surfaceBg, borderRadius: '14px', border: `1px solid ${theme.surfaceBorder}`, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '120px', height: '120px', background: 'rgba(255,255,255,0.9)', borderRadius: '14px' }}>
              <img src={currentQuestion.image1} alt={currentQuestion.word} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '14px' }}
                onError={(e) => { e.target.style.display = 'none'; const parent = e.target.parentElement; const span = document.createElement('span'); span.style.fontSize = '48px'; span.textContent = '🖼️'; parent.appendChild(span); }} />
            </div>
            <span style={{ fontSize: '30px', fontWeight: '700', color: theme.accent }}>↔️</span>
            <div style={{ position: 'relative', width: '120px', height: '120px', background: 'rgba(255,255,255,0.9)', borderRadius: '14px' }}>
              <img src={currentQuestion.image2} alt={currentQuestion.word} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '14px' }}
                onError={(e) => { e.target.style.display = 'none'; const parent = e.target.parentElement; const span = document.createElement('span'); span.style.fontSize = '48px'; span.textContent = '🖼️'; parent.appendChild(span); }} />
            </div>
            <span style={{ fontSize: '28px', fontWeight: '700', color: theme.textPrimary, background: theme.chipBg, padding: '0 14px', borderRadius: '10px' }}>= ?</span>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '16px', fontSize: '15px', color: theme.textSecondary, fontWeight: '600' }}>{currentQuestion.category || 'Vocabulary'}</div>

          {/* WORD DISPLAY */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '7px', marginBottom: '18px', padding: '16px', background: theme.surfaceBg, borderRadius: '12px', border: `1px solid ${theme.surfaceBorder}`, flexWrap: 'wrap' }}>
            {word.split('').map((letter, index) => {
              const isVisible = visiblePositions.includes(index);
              const filledLetter = userFilledBlanks[index];
              if (isVisible) {
                return (<div key={index} style={{ width: '42px', height: '48px', background: theme.chipBg, border: `1px solid ${theme.surfaceBorder}`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '23px', fontWeight: '700', color: theme.textSecondary }}>{letter}</div>);
              } else {
                return (<div key={index} onClick={() => handleBlankClick(index)} style={{ width: '42px', height: '48px', background: filledLetter ? theme.chipBg : 'rgba(255,255,255,0.04)', border: `2px ${filledLetter ? 'solid' : 'dashed'} ${filledLetter ? theme.accent : theme.surfaceBorder}`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '23px', fontWeight: '700', color: theme.textPrimary, cursor: filledLetter ? 'pointer' : 'default', transition: 'all 0.3s ease' }}>{filledLetter || ''}</div>);
              }
            })}
          </div>

          {/* LETTER OPTIONS */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '7px', marginBottom: '18px', padding: '13px', background: theme.surfaceBg, borderRadius: '12px', border: `1px solid ${theme.surfaceBorder}`, minHeight: '48px' }}>
            {letters.map((letter, index) => {
              const isUsed = usedLetters.includes(index);
              return (<button key={index} onClick={() => handleLetterClick(letter, index)} disabled={isUsed || answered || lives === 0 || timer === 0} style={{ width: '46px', height: '46px', borderRadius: '12px', background: isUsed ? 'rgba(255,255,255,0.03)' : theme.chipBg, border: `2px solid ${isUsed ? theme.surfaceBorder : 'rgba(139,92,246,0.3)'}`, color: isUsed ? theme.textMuted : theme.textSecondary, fontSize: '19px', fontWeight: '700', cursor: isUsed || answered || lives === 0 || timer === 0 ? 'default' : 'pointer', transition: 'all 0.15s ease', fontFamily: "'Poppins', 'Poppins', sans-serif" }}>{letter}</button>);
            })}
          </div>

          {/* ACTION BUTTONS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <button onClick={() => { setUserFilledBlanks({}); setUsedLetters([]); }} disabled={answered || lives === 0 || Object.keys(userFilledBlanks).length === 0} style={{ padding: '13px', borderRadius: '14px', border: `1px solid ${theme.surfaceBorder}`, background: Object.keys(userFilledBlanks).length > 0 ? theme.surfaceBg : 'rgba(255,255,255,0.02)', color: theme.textSecondary, cursor: Object.keys(userFilledBlanks).length > 0 ? 'pointer' : 'default', fontSize: '14px', fontWeight: '600' }}>🔄 Clear</button>
            <button onClick={checkWord} disabled={answered || lives === 0 || Object.keys(userFilledBlanks).length < blanks.length} style={{ padding: '13px', borderRadius: '14px', border: 'none', background: Object.keys(userFilledBlanks).length >= blanks.length ? theme.accentGradient : theme.surfaceBg, color: Object.keys(userFilledBlanks).length >= blanks.length ? 'white' : theme.textMuted, cursor: Object.keys(userFilledBlanks).length >= blanks.length ? 'pointer' : 'default', fontSize: '14px', fontWeight: '600', boxShadow: Object.keys(userFilledBlanks).length >= blanks.length ? '0 8px 20px rgba(139,92,246,0.35)' : 'none' }}>✅ Submit</button>
          </div>

          {/* HINT */}
          {!answered && lives > 0 && (<button onClick={useHint} disabled={hintUsed} style={{ width: '100%', padding: '12px', borderRadius: '14px', border: `1px solid ${hintUsed ? theme.surfaceBorder : 'rgba(251, 191, 36, 0.3)'}`, background: hintUsed ? theme.surfaceBg : 'rgba(251, 191, 36, 0.1)', color: hintUsed ? theme.textMuted : '#FDE68A', cursor: hintUsed ? 'default' : 'pointer', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>💡 {hintUsed ? 'Hint Used (-3 secs)' : 'Need Help? Ask a Friend! (-3 secs)'}</button>)}

          {/* FEEDBACK */}
          {showFeedback && (<div style={{ padding: '8px', borderRadius: '10px', background: feedbackMessage.includes('✅') || feedbackMessage.includes('⬆️') || feedbackMessage.includes('🎉') ? 'rgba(16, 185, 129, 0.14)' : feedbackMessage.includes('🛡️') ? 'rgba(251, 191, 36, 0.16)' : 'rgba(239, 68, 68, 0.14)', border: `1px solid ${feedbackMessage.includes('✅') || feedbackMessage.includes('⬆️') || feedbackMessage.includes('🎉') ? 'rgba(16, 185, 129, 0.3)' : feedbackMessage.includes('🛡️') ? 'rgba(251, 191, 36, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`, marginBottom: '8px', textAlign: 'center', fontSize: '12px', fontWeight: '500', color: feedbackMessage.includes('✅') || feedbackMessage.includes('⬆️') || feedbackMessage.includes('🎉') ? '#6EE7B7' : feedbackMessage.includes('🛡️') ? '#FDE68A' : '#FCA5A5' }}>{feedbackMessage}</div>)}
        </div>

        <style>{`
          @keyframes bgPan {
            0% { background-position: 0% 0%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 50% 100%; }
          }
          @keyframes correctFlash { 
            0% { opacity: 0; } 
            50% { opacity: 1; } 
            100% { opacity: 0; } 
          }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
        `}</style>
      </div>
    );
  }

  return null;
};

export default WordPicsGame;