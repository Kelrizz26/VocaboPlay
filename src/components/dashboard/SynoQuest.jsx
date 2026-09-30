// src/components/dashboard/SynoQuest.jsx
// ✅ NEW: Has recordGame prop to record in Recent Activities
// ✅ NEW: Passes the array of answered words (correct + wrong)
// ✅ FIX: saveGameToFirebase called in gameover useEffect and handleExitGame
// ✅ FIX: gameType: 'synoQuest' (camelCase consistent)
// ✅ FIX: gameStateRef so the state is always correct in async calls

import React, { useState, useEffect, useRef, useCallback } from 'react';
import backgroundMusic from '../../utils/backgroundMusic';
import { auth } from '../../pages/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { updateUserStats } from '../../services/firebaseService';

// ===== MUTED GAME UI PALETTE =====
const palette = {
  warmOrange: '#E9A075',
  warmOrangeShadow: '#C27E4F',
  coral: '#DB7A64',
  coralShadow: '#A95845',
  teal: '#4F9188',
  tealShadow: '#3A6A63',
  deepNavy: '#2A2845',
  deepNavyLight: '#3A3757',
  bodyText: '#6B6880',
  bodyTextSoft: '#8A8799',
  cream: '#FDF9F3',
  creamSoft: '#F5EFE6',
  white: '#FFFFFF',
  border: '#EBE2D5',
  borderSoft: '#F2EBE0',
  softGreen: '#7FA574',
  softGreenShadow: '#5E7F55',
  gold: '#d4af37',
  danger: '#DB7A64',
  dangerShadow: '#A95845',
};

const FONT_DISPLAY = "'Fredoka', sans-serif";
const FONT_BODY = "'Nunito', sans-serif";

// ============================================================
// ===== IMAGE CONFIGURATION =====
// ============================================================
const imageBasePath = '/image/';

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
  backgroundImage: `linear-gradient(135deg, rgba(42, 40, 69, 0.65), rgba(58, 55, 87, 0.55)), url(${imageBasePath}bg-synoquest.png)`,
  backgroundSize: '130% 130%',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  animation: 'bgPan 30s ease-in-out infinite alternate',
  fontFamily: FONT_BODY,
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
// ===== DARK CARD THEME (Muted) =====
// ============================================================
const theme = {
  cardBg: palette.white,
  cardBorder: `1.5px solid ${palette.border}`,
  cardShadow: `0 10px 40px rgba(42, 40, 69, 0.20), 0 2px 0 ${palette.border}`,
  textPrimary: palette.deepNavy,
  textSecondary: palette.bodyText,
  textMuted: palette.bodyTextSoft,
  accent: palette.warmOrange,
  accentGradient: `linear-gradient(135deg, ${palette.warmOrange} 0%, ${palette.coral} 100%)`,
  chipBg: palette.creamSoft,
  surfaceBg: palette.creamSoft,
  surfaceBorder: palette.border,
};

// ============================================================
// ===== HELPER FUNCTIONS =====
// ============================================================
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

const REFILL_TIME = 1800;

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
// ===== WORD PAIRS =====
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

const getWordsByLevel = (level) => {
  const config = LEVEL_CONFIG[level] || LEVEL_CONFIG[1];
  const diff = config.difficulty;
  const words = wordPairs[diff] || wordPairs.beginner;
  return words;
};

// ============================================================
// ===== SYNOQUEST COMPONENT =====
// ============================================================
const SynoQuest = ({ onBack, updateProgress, recordGame }) => {
  const [gameState, setGameState] = useState('intro');
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

  const [currentUser, setCurrentUser] = useState(null);
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  const sessionSavedRef = useRef(false);
  const firebaseSavedRef = useRef(false);

  // ✅ FIX: gameStateRef so the state is always correct in async calls
  const gameStateRef = useRef('intro');
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // ✅ NEW: Ref for answered words (for learned words tracking)
  const answeredWordsRef = useRef([]);

  const [timer, setTimer] = useState(15);
  const [timerRunning, setTimerRunning] = useState(false);

  const [lives, setLives] = useState(5);
  const [maxLives] = useState(5);
  const [lastRefillTime, setLastRefillTime] = useState(Date.now());
  const [timeRemaining, setTimeRemaining] = useState('');
  const [hintUsed, setHintUsed] = useState(false);
  const [showNoLivesMessage, setShowNoLivesMessage] = useState(false);

  const timerIntervalRef = useRef(null);
  const lastRefillTimeRef = useRef(Date.now());
  const livesRef = useRef(5);
  const isMountedRef = useRef(true);

  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);

  const [streak, setStreak] = useState(0);

  const [answeredInLevel, setAnsweredInLevel] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [retryQuestion, setRetryQuestion] = useState(null);

  const [wrongQuestions, setWrongQuestions] = useState([]);
  const [retryPhase, setRetryPhase] = useState(false);
  const [retryIndex, setRetryIndex] = useState(0);

  const [blankPositions, setBlankPositions] = useState([]);
  const [visiblePositions, setVisiblePositions] = useState([]);
  const [userFilledBlanks, setUserFilledBlanks] = useState({});
  const [availableLetters, setAvailableLetters] = useState([]);
  const [usedLetters, setUsedLetters] = useState([]);

  const audioCtx = useRef(null);
  const gainNode = useRef(null);

  const getUserId = useCallback(() => {
    if (currentUser) return currentUser.uid;
    return 'guest';
  }, [currentUser]);

  const getLivesStorageKey = useCallback(() => {
    const userId = getUserId();
    return `synoquest_lives_${userId}`;
  }, [getUserId]);

  const getStatsStorageKey = useCallback(() => {
    const userId = getUserId();
    return `synoquest_stats_${userId}`;
  }, [getUserId]);

  const getLeaderboardStorageKey = useCallback(() => {
    const userId = getUserId();
    return `synoquest_leaderboard_${userId}`;
  }, [getUserId]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setIsUserLoaded(true);
        console.log('✅ SynoQuest: User loaded:', user.uid, user.email);
      } else {
        setCurrentUser(null);
        setIsUserLoaded(true);
        console.log('❌ SynoQuest: No user logged in');
      }
    });

    return () => unsubscribe();
  }, []);

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

  useEffect(() => {
    if (currentUser && gameState !== 'intro') {
      const key = getLivesStorageKey();
      localStorage.setItem(key, JSON.stringify({
        lives: lives,
        lastRefillTime: lastRefillTime
      }));
    }
  }, [lives, lastRefillTime, gameState, currentUser, getLivesStorageKey]);

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

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, []);

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

  useEffect(() => {
    if (!isMuted && gameState !== 'intro') {
      backgroundMusic.start('gameplay');
    }
    return () => backgroundMusic.stop();
  }, [isMuted, gameState]);

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

  const generateQuestions = (level) => {
    const words = getWordsByLevel(level);
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, QUESTIONS_PER_LEVEL);
    return selected.map(pair => createWordPuzzle(pair, level));
  };

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

  const checkIfAllAnswered = () => {
    const answeredCount = answeredQuestions.length;
    const totalQuestions = questions.length;
    return answeredCount >= totalQuestions && totalQuestions === QUESTIONS_PER_LEVEL;
  };

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

    // ✅ NEW: Track the answered word (for learned words)
    if (!answeredWordsRef.current.includes(word)) {
      answeredWordsRef.current.push(word);
    }

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
            // ❌ NO LONGER CALLED HERE — it's in the gameover useEffect now
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
  // ✅ FIXED: saveGameToFirebase — clearer logging and validation
  // ============================================================
  const saveGameToFirebase = useCallback(async () => {
    if (!currentUser) {
      console.log('⚠️ [SynoQuest] No user logged in, skipping Firebase save');
      return;
    }

    const userId = currentUser.uid;
    const totalQuestionsAnswered = questionNumber || 0;
    const totalCorrect = correctCount || 0;
    const pointsEarned = score || 0;

    const won = totalCorrect >= totalQuestionsAnswered / 2;

    const gameData = {
      gameType: 'synoQuest',
      pointsEarned: pointsEarned,
      newWordsLearned: totalCorrect,
      correctAnswers: totalCorrect,
      totalQuestions: totalQuestionsAnswered,
      won: won,
      score: pointsEarned,
      levelReached: currentLevel
    };

    console.log('💾 [SynoQuest] Saving game to Firebase...');
    console.log('   userId:', userId);
    console.log('   gameData:', gameData);

    try {
      const result = await updateUserStats(userId, gameData);

      console.log('✅ [SynoQuest] game saved successfully!');
      console.log('   result:', result);

      if (result && result.achievements && result.achievements.length > 0) {
        console.log('🏆 New Achievements Unlocked:', result.achievements);
        setFeedbackMessage(`🏆 New Achievements: ${result.achievements.join(', ')} 🎉`);
        setShowFeedback(true);
        setTimeout(() => setShowFeedback(false), 5000);
      }
    } catch (error) {
      console.error('❌ [SynoQuest] Error saving to Firebase:', error);
      console.error('   error.message:', error?.message);
      console.error('   error.code:', error?.code);
      console.error('   error.stack:', error?.stack);
    }
  }, [currentUser, questionNumber, correctCount, score, currentLevel]);

  const saveProgressOnLevelUp = async () => {
    if (!currentUser) return;

    const userId = currentUser.uid;
    const totalCorrect = correctCount || 0;
    const pointsEarned = score || 0;

    const gameData = {
      gameType: 'synoQuest',
      pointsEarned: pointsEarned,
      newWordsLearned: Math.min(totalCorrect, 5),
      correctAnswers: totalCorrect,
      totalQuestions: questionNumber || 10,
      won: true,
      score: pointsEarned,
      levelReached: currentLevel
    };

    console.log('💾 [SynoQuest] Saving progress on level up...', gameData);

    try {
      await updateUserStats(userId, gameData);
      console.log('✅ [SynoQuest] Progress saved on level up!');
    } catch (error) {
      console.error('❌ [SynoQuest] Error saving on level up:', error);
    }
  };

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

    setGameState('loading');

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
      sessionSavedRef.current = false;
      firebaseSavedRef.current = false;
      // ✅ NEW: Reset the answered words ref
      answeredWordsRef.current = [];
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
      console.log('🎮 [SynoQuest] Game started — sessionSaved & firebaseSaved reset');
    }, 2000);
  };

  const currentQuestion = questions[currentQuestionIndex];

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

      // ✅ NEW: Track the word even if it timed out
      if (!answeredWordsRef.current.includes(currentQuestion.word)) {
        answeredWordsRef.current.push(currentQuestion.word);
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
            // ❌ NO LONGER CALLED HERE — it's in the gameover useEffect now
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
  // ✅ FIXED: GAMEOVER SAVE — now calls saveGameToFirebase()
  // ============================================================
  useEffect(() => {
    if (gameState === 'gameover') {
      // 1️⃣ SAVE TO FIRESTORE (gameStats.synoQuest)
      if (!firebaseSavedRef.current && currentUser) {
        firebaseSavedRef.current = true;
        console.log('🎮 [SynoQuest] Game over detected — triggering Firebase save');
        saveGameToFirebase();
      }

      // 2️⃣ SAVE TO LOCAL PROGRESS (updateProgress)
      if (updateProgress && !sessionSavedRef.current) {
        sessionSavedRef.current = true;

        const totalQuestions = questionNumber || 0;
        const totalAnswers = totalQuestions;
        const correctAnswers = correctCount || 0;

        // ✅ NEW: Get the list of answered words
        const wordsList = [...answeredWordsRef.current];

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

        console.log(`✅ SynoQuest: Saving progress — +${score} pts, ${wordsList.length} words`);

        updateProgress({
          gamesPlayed: 1,
          totalPoints: score,
          xp: score,
          wordsLearned: correctCount,
          totalAnswers: totalAnswers,
          correctAnswers: correctAnswers,
          streak: newStreak,
          SynoQuest: {
            gamesCompleted: 1,
            correctAnswers: correctAnswers,
            totalQuestions: totalQuestions
          }
        }).then(() => {
          console.log(`✅ SynoQuest: SAVED! +${score} pts`);
          // ✅ NEW: Record to recent activities and pass the words
          if (recordGame) {
            recordGame('synoquest', score, correctCount, totalQuestions, wordsList);
          }
        }).catch(err => {
          console.error('❌ SynoQuest: Error saving progress:', err);
        });
      }
    }
  }, [gameState, score, correctCount, questionNumber, updateProgress, recordGame, currentUser, saveGameToFirebase]);

  // ============================================================
  // ✅ FIXED: EXIT GAME SAVE — saves regardless of gameState
  // ============================================================
  const handleExitGame = async () => {
    // ✅ FIX: Save regardless of gameState (except intro and loading)
    if (gameState !== 'intro' && gameState !== 'loading') {
      console.log('🚪 [SynoQuest] Exit requested — gameState:', gameState);
      console.log('   score:', score, '| correct:', correctCount, '| questions:', questionNumber);

      // 1️⃣ SAVE TO FIRESTORE
      if (!firebaseSavedRef.current && currentUser) {
        firebaseSavedRef.current = true;
        await saveGameToFirebase();
      }

      // 2️⃣ SAVE TO LOCAL PROGRESS
      if (updateProgress && !sessionSavedRef.current) {
        sessionSavedRef.current = true;
        const totalQuestions = questionNumber || 0;
        const correctAnswers = correctCount || 0;

        // ✅ NEW: Get the list of answered words
        const wordsList = [...answeredWordsRef.current];

        console.log(`✅ SynoQuest: Saving progress on exit — +${score} pts`);

        updateProgress({
          gamesPlayed: 1,
          totalPoints: score,
          xp: score,
          wordsLearned: correctCount,
          totalAnswers: totalQuestions,
          correctAnswers: correctAnswers,
          SynoQuest: {
            gamesCompleted: 1,
            correctAnswers: correctAnswers,
            totalQuestions: totalQuestions
          }
        }).then(() => {
          console.log('✅ SynoQuest: Progress saved on exit!');
          // ✅ NEW: Record to recent activities and pass the words
          if (recordGame) {
            recordGame('synoquest', score, correctCount, totalQuestions, wordsList);
          }
        }).catch(err => {
          console.error('❌ SynoQuest: Error saving progress on exit:', err);
        });
      }
    } else {
      console.log('⚠️ [SynoQuest] Exit called but gameState is', gameState, '— skipping save');
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

  const ExitConfirmModal = () => (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(42, 40, 69, 0.6)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px'
    }}>
      <div style={{
        background: palette.white, borderRadius: '18px', padding: '28px',
        maxWidth: '340px', width: '100%', textAlign: 'center',
        border: `1.5px solid ${palette.border}`,
        boxShadow: '0 20px 50px rgba(42, 40, 69, 0.3)'
      }}>
        <div style={{ fontSize: '40px', marginBottom: '8px' }}>❌</div>
        <h3 style={{ fontSize: '18px', fontWeight: '800', color: palette.deepNavy, marginBottom: '6px', fontFamily: FONT_DISPLAY }}>Exit Game?</h3>
        <p style={{ fontSize: '13px', color: palette.bodyTextSoft, marginBottom: '20px', fontFamily: FONT_BODY, fontWeight: 600 }}>Your progress will be saved.</p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={confirmExit}
            style={{
              flex: 1, padding: '10px', background: palette.danger, color: 'white',
              border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px',
              fontWeight: '800', fontFamily: FONT_DISPLAY, boxShadow: `0 3px 0 ${palette.dangerShadow}`
            }}
          >
            Yes, End
          </button>
          <button
            onClick={cancelExit}
            style={{
              flex: 1, padding: '10px', background: palette.creamSoft, color: palette.deepNavy,
              border: `1.5px solid ${palette.border}`, borderRadius: '10px', cursor: 'pointer',
              fontSize: '13px', fontWeight: '800', fontFamily: FONT_DISPLAY
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const SettingsModal = () => (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(42, 40, 69, 0.6)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
    }} onClick={() => setShowSettings(false)}>
      <div style={{
        background: palette.white, borderRadius: '18px', padding: '24px',
        maxWidth: '360px', width: '100%', maxHeight: '80vh', overflow: 'auto',
        border: `1.5px solid ${palette.border}`,
        boxShadow: '0 20px 50px rgba(42, 40, 69, 0.3)'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: '800', color: palette.deepNavy, fontFamily: FONT_DISPLAY }}>Settings</h3>
          <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: palette.bodyTextSoft }}>✕</button>
        </div>
        <div style={{ marginBottom: '16px', padding: '12px', background: palette.creamSoft, borderRadius: '10px', border: `1.5px solid ${palette.border}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', textAlign: 'center' }}>
            <div><div style={{ fontSize: '18px', fontWeight: '800', color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>{stats.gamesPlayed}</div><div style={{ fontSize: '10px', color: palette.bodyTextSoft, fontFamily: FONT_BODY, fontWeight: 600 }}>Games</div></div>
            <div><div style={{ fontSize: '18px', fontWeight: '800', color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>{stats.bestScore}</div><div style={{ fontSize: '10px', color: palette.bodyTextSoft, fontFamily: FONT_BODY, fontWeight: 600 }}>Best Score</div></div>
            <div><div style={{ fontSize: '18px', fontWeight: '800', color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>Lv.{currentLevel}</div><div style={{ fontSize: '10px', color: palette.bodyTextSoft, fontFamily: FONT_BODY, fontWeight: 600 }}>Level</div></div>
          </div>
        </div>
        <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: palette.bodyText, fontFamily: FONT_DISPLAY }}>🔊 Sound</span>
          <button onClick={() => { const newMuted = !isMuted; setIsMuted(newMuted); if (gainNode.current) gainNode.current.gain.value = newMuted ? 0 : 0.4; }} style={{ padding: '3px 14px', borderRadius: '8px', border: 'none', background: isMuted ? palette.danger : palette.softGreen, color: 'white', cursor: 'pointer', fontSize: '11px', fontWeight: '800', fontFamily: FONT_DISPLAY }}>{isMuted ? 'OFF' : 'ON'}</button>
        </div>
        <button onClick={() => { setShowLeaderboard(true); setShowSettings(false); }} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: `1.5px solid ${palette.border}`, background: palette.creamSoft, color: palette.bodyText, cursor: 'pointer', fontSize: '12px', fontWeight: '800', marginBottom: '6px', fontFamily: FONT_DISPLAY }}>🏆 Leaderboard</button>
        <button onClick={handleExitGame} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: `1.5px solid ${palette.danger}40`, background: `${palette.danger}10`, color: palette.danger, cursor: 'pointer', fontSize: '12px', fontWeight: '800', marginBottom: '6px', fontFamily: FONT_DISPLAY }}>❌ Exit Game</button>
        <button onClick={() => { setShowSettings(false); setGameState('intro'); }} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: `1.5px solid ${palette.border}`, background: palette.creamSoft, color: palette.bodyText, cursor: 'pointer', fontSize: '12px', fontWeight: '800', fontFamily: FONT_DISPLAY }}>🔄 New Game</button>
      </div>
    </div>
  );

  const LeaderboardModal = () => (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(42, 40, 69, 0.6)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
    }} onClick={() => setShowLeaderboard(false)}>
      <div style={{
        background: palette.white, borderRadius: '18px', padding: '20px',
        maxWidth: '380px', width: '100%', maxHeight: '70vh', overflow: 'auto',
        border: `1.5px solid ${palette.border}`,
        boxShadow: '0 20px 50px rgba(42, 40, 69, 0.3)'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: '800', color: palette.deepNavy, fontFamily: FONT_DISPLAY }}>🏆 Leaderboard</h3>
          <button onClick={() => setShowLeaderboard(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: palette.bodyTextSoft }}>✕</button>
        </div>
        {leaderboardData.length === 0 ? (
          <div style={{ textAlign: 'center', color: palette.bodyTextSoft, padding: '24px 0' }}><div style={{ fontSize: '36px', marginBottom: '6px' }}>📊</div><p style={{ fontSize: '13px', fontFamily: FONT_BODY, fontWeight: 600 }}>No scores yet! Keep playing!</p></div>
        ) : (
          leaderboardData.map((entry, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', padding: '8px 10px', borderRadius: '8px', background: index < 3 ? `${palette.warmOrange}10` : 'transparent', marginBottom: '4px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: index === 0 ? palette.gold : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : palette.creamSoft, color: index < 3 ? '#fff' : palette.bodyTextSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', marginRight: '10px', fontFamily: FONT_DISPLAY }}>{index + 1}</div>
              <div style={{ flex: 1 }}><div style={{ fontWeight: '800', fontSize: '13px', color: palette.deepNavy, fontFamily: FONT_DISPLAY }}>{entry.name || 'Player'}</div><div style={{ fontSize: '10px', color: palette.bodyTextSoft, fontFamily: FONT_BODY, fontWeight: 600 }}>Level {entry.level || 1} • {entry.questions || 0} questions</div></div>
              <div style={{ fontWeight: '800', fontSize: '15px', color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>{entry.score}</div>
            </div>
          ))
        )}
        <button onClick={() => setShowLeaderboard(false)} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: 'none', background: palette.warmOrange, color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: '800', marginTop: '10px', fontFamily: FONT_DISPLAY, boxShadow: `0 3px 0 ${palette.warmOrangeShadow}` }}>Close</button>
      </div>
    </div>
  );

  const NoLivesOverlay = () => {
    if (!showNoLivesMessage && lives > 0) return null;
    if (gameState !== 'playing') return null;
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(42, 40, 69, 0.75)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px'
      }}>
        <div style={{
          background: palette.white, borderRadius: '20px', padding: '32px',
          maxWidth: '380px', width: '100%', textAlign: 'center',
          border: `1.5px solid ${palette.border}`,
          boxShadow: '0 20px 50px rgba(42, 40, 69, 0.3)'
        }}>
          <div style={{ fontSize: '56px', marginBottom: '8px' }}>😢</div>
          <h3 style={{ fontSize: '22px', fontWeight: '800', color: palette.deepNavy, marginBottom: '4px', fontFamily: FONT_DISPLAY }}>No Lives Left!</h3>
          <p style={{ fontSize: '14px', color: palette.bodyTextSoft, marginBottom: '6px', fontFamily: FONT_BODY, fontWeight: 600 }}>Next heart in</p>
          <p style={{ fontSize: '28px', fontWeight: '800', color: palette.warmOrange, marginBottom: '16px', fontFamily: FONT_DISPLAY }}>{timeRemaining || '30 minutes'}</p>
          <button onClick={() => { setShowNoLivesMessage(false); setGameState('intro'); }} style={{ width: '100%', padding: '14px', background: palette.warmOrange, color: 'white', border: 'none', borderRadius: '14px', cursor: 'pointer', fontSize: '15px', fontWeight: '800', fontFamily: FONT_DISPLAY, boxShadow: `0 3px 0 ${palette.warmOrangeShadow}` }}>Back to Menu</button>
        </div>
      </div>
    );
  };

  if (gameState === 'loading') {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: FONT_BODY, zIndex: 999999, background: palette.deepNavy,
      }}>
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
          <div className="loading-scroll-track">
            <img src={images['pixel-town']} className="loading-scroll-img" alt="" onError={(e) => { e.target.style.display = 'none'; }} />
            <img src={images['pixel-town']} className="loading-scroll-img" alt="" onError={(e) => { e.target.style.display = 'none'; }} />
          </div>
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(135deg, ${palette.deepNavy}80, ${palette.deepNavyLight}90)`,
            pointerEvents: 'none'
          }} />
        </div>

        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          {[...Array(12)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute', width: '6px', height: '6px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.25)',
              top: `${10 + Math.random() * 80}%`,
              left: `${10 + Math.random() * 80}%`,
              animation: `twinkle 2s ease-in-out ${i * 0.3}s infinite`
            }} />
          ))}
        </div>

        <div style={{
          position: 'relative', zIndex: 1, textAlign: 'center',
          maxWidth: '420px', width: '100%', padding: '40px 32px',
          background: 'rgba(255, 255, 255, 0.06)',
          backdropFilter: 'blur(16px)',
          borderRadius: '24px',
          border: `1.5px solid ${palette.border}30`
        }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '28px' }}>
            <h2 style={{
              fontSize: '36px', fontWeight: '900', margin: 0,
              fontFamily: FONT_DISPLAY,
              color: palette.white,
              letterSpacing: '0.5px',
              textShadow: '0 4px 12px rgba(0,0,0,0.3)',
              animation: 'textBounce 1.4s ease-in-out infinite'
            }}>
              Loading<span className="loading-dots">...</span>
            </h2>
          </div>

          <div style={{
            position: 'relative', width: '100%', height: '30px',
            borderRadius: '20px',
            background: 'rgba(255,255,255,0.06)',
            border: `2px solid ${palette.warmOrange}60`,
            overflow: 'hidden'
          }}>
            <div className="progress-fill" style={{
              position: 'absolute', top: '3px', left: '3px', bottom: '3px',
              width: '35%', borderRadius: '16px',
              background: `linear-gradient(90deg, ${palette.teal} 0%, ${palette.warmOrange} 50%, ${palette.coral} 100%)`,
              boxShadow: `0 0 12px ${palette.warmOrange}80`,
              animation: 'progressSlide 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite'
            }} />
            <div className="progress-shimmer" />
          </div>

          <p style={{
            fontSize: '12px', color: 'rgba(255,255,255,0.65)',
            marginTop: '16px', fontStyle: 'italic',
            fontFamily: FONT_BODY, fontWeight: 600
          }}>
            Preparing your SynoQuest adventure...
          </p>
        </div>

        <style>{`
          .loading-scroll-track { display: flex; height: 100%; width: max-content; animation: loadingScroll 14s linear infinite; }
          .loading-scroll-img { height: 100%; width: auto; max-width: none; flex-shrink: 0; display: block; object-fit: contain; }
          @keyframes loadingScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
          @keyframes twinkle { 0%, 100% { opacity: 0.1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.5); } }
          @keyframes textBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
          .loading-dots { display: inline-block; animation: textBounce 1.4s ease-in-out infinite; }
          @keyframes progressSlide { 0% { left: 3px; width: 20%; } 50% { left: 40%; width: 45%; } 100% { left: 97%; width: 20%; transform: translateX(-100%); } }
          .progress-shimmer { position: absolute; top: 0; left: -40%; width: 40%; height: 100%; background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0) 100%); animation: shimmerSweep 1.8s linear infinite; }
          @keyframes shimmerSweep { 0% { left: -40%; } 100% { left: 100%; } }
        `}</style>
      </div>
    );
  }

  if (!isUserLoaded) {
    return (
      <div style={{ ...fullScreenBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {bgAnimationStyle}
        <div style={{
          background: palette.white, borderRadius: '16px', padding: '40px',
          textAlign: 'center', maxWidth: '400px', width: '100%',
          border: `1.5px solid ${palette.border}`,
          boxShadow: '0 10px 30px rgba(42,40,69,0.15)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: palette.deepNavy, fontFamily: FONT_DISPLAY }}>Loading...</h2>
          <p style={{ fontSize: '14px', color: palette.bodyTextSoft, fontFamily: FONT_BODY, fontWeight: 600 }}>Please wait while we set up your game.</p>
        </div>
      </div>
    );
  }

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
          maxWidth: '520px', width: '100%', background: theme.cardBg,
          borderRadius: '24px', padding: '32px 28px',
          border: theme.cardBorder, boxShadow: theme.cardShadow,
          textAlign: 'center'
        }}>
          <div style={{
            width: '84px', height: '84px', borderRadius: '50%',
            background: theme.accentGradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: `0 8px 24px ${palette.warmOrange}40`
          }}>
            <div style={{
              width: '50px', height: '50px', borderRadius: '12px',
              background: palette.white,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px'
            }}>📖</div>
          </div>

          {currentUser && (
            <div style={{
              background: theme.chipBg, padding: '4px 14px', borderRadius: '10px',
              marginBottom: '10px', display: 'inline-block',
              border: `1px solid ${palette.border}`
            }}>
              <span style={{ fontSize: '12px', color: palette.bodyText, fontWeight: '700', fontFamily: FONT_BODY }}>
                👤 {currentUser.displayName || currentUser.email || 'Player'}
              </span>
            </div>
          )}

          <h1 style={{ fontSize: '30px', fontWeight: '800', color: theme.textPrimary, marginBottom: '2px', letterSpacing: '-0.5px', fontFamily: FONT_DISPLAY }}>SynoQuest</h1>
          <p style={{ fontSize: '12px', color: theme.textSecondary, marginBottom: '16px', fontWeight: '600', fontFamily: FONT_BODY }}>📚 10 questions per level • 8 levels!</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginBottom: '14px', background: theme.surfaceBg, padding: '8px', borderRadius: '10px', border: `1px solid ${theme.surfaceBorder}` }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((level) => {
              const config = LEVEL_CONFIG[level];
              return (
                <div key={level} style={{
                  padding: '4px', borderRadius: '6px',
                  background: level <= 2 ? `${palette.softGreen}15` : level <= 4 ? `${palette.warmOrange}15` : level <= 6 ? `${palette.coral}15` : `${palette.danger}15`,
                  textAlign: 'center', fontSize: '9px', fontWeight: '800',
                  color: level <= 2 ? palette.softGreen : level <= 4 ? palette.warmOrange : level <= 6 ? palette.coral : palette.danger,
                  border: `1px solid ${palette.border}`,
                  fontFamily: FONT_DISPLAY
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
            <span style={{ fontSize: '12px', color: theme.textSecondary, marginLeft: '4px', fontWeight: '600', fontFamily: FONT_BODY }}>
              {lives > 0 ? `${lives}/${maxLives} lives` : 'No lives left'}
            </span>
            {lives < maxLives && timeRemaining && (
              <span style={{ fontSize: '11px', color: palette.warmOrange, fontWeight: '700', fontFamily: FONT_BODY }}>⏳ {timeRemaining}</span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '4px', marginBottom: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <span style={{ padding: '4px 12px', borderRadius: '8px', background: theme.chipBg, color: theme.textSecondary, fontSize: '11px', fontWeight: '700', fontFamily: FONT_BODY, border: `1px solid ${palette.border}` }}>✏️ 10 Q/Level</span>
            <span style={{ padding: '4px 12px', borderRadius: '8px', background: `${palette.danger}12`, color: palette.danger, fontSize: '11px', fontWeight: '700', fontFamily: FONT_BODY, border: `1px solid ${palette.danger}40` }}>⏱️ 15s→5s</span>
            <span style={{ padding: '4px 12px', borderRadius: '8px', background: `${palette.softGreen}12`, color: palette.softGreen, fontSize: '11px', fontWeight: '700', fontFamily: FONT_BODY, border: `1px solid ${palette.softGreen}40` }}>❤️ 5 Lives</span>
            <span style={{ padding: '4px 12px', borderRadius: '8px', background: `${palette.warmOrange}12`, color: palette.warmOrange, fontSize: '11px', fontWeight: '700', fontFamily: FONT_BODY, border: `1px solid ${palette.warmOrange}40` }}>💡 1 Hint</span>
          </div>

          {lives > 0 ? (
            <button onClick={startGame} style={{ width: '100%', padding: '14px', background: theme.accentGradient, color: 'white', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', boxShadow: `0 3px 0 ${palette.warmOrangeShadow}`, fontFamily: FONT_DISPLAY, textTransform: 'uppercase', letterSpacing: '0.05em' }}>🚀 Start Game</button>
          ) : (
            <div style={{ width: '100%', padding: '14px', background: theme.surfaceBg, color: theme.textSecondary, border: `1.5px solid ${palette.border}`, borderRadius: '14px', fontSize: '13px', fontWeight: '800', cursor: 'not-allowed', fontFamily: FONT_DISPLAY }}>
              ⏳ No Lives - Next heart in {timeRemaining || '30 minutes'}
            </div>
          )}
          {showFeedback && (<div style={{ marginTop: '10px', padding: '8px', borderRadius: '10px', background: `${palette.warmOrange}12`, border: `1.5px solid ${palette.warmOrange}40`, textAlign: 'center', fontSize: '12px', fontWeight: '700', color: palette.warmOrange, fontFamily: FONT_BODY }}>{feedbackMessage}</div>)}

          {onBack && (
            <button onClick={onBack} style={{ marginTop: '10px', width: '100%', padding: '10px', background: 'transparent', color: theme.textSecondary, border: `1.5px solid ${palette.border}`, borderRadius: '12px', cursor: 'pointer', fontSize: '12px', fontWeight: '800', fontFamily: FONT_DISPLAY, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              ← Back
            </button>
          )}
        </div>
      </div>
    );
  }

  if (gameState === 'gameover') {
    const accuracy = questionNumber > 0 ? Math.round((correctCount / questionNumber) * 100) : 0;
    return (
      <div style={{
        ...fullScreenBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      }}>
        {bgAnimationStyle}
        <div style={{
          maxWidth: '520px', width: '100%', background: theme.cardBg,
          borderRadius: '24px', padding: '32px 28px',
          border: theme.cardBorder, boxShadow: theme.cardShadow, textAlign: 'center'
        }}>
          <div style={{ fontSize: '60px', marginBottom: '6px' }}>💀</div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: theme.textPrimary, marginBottom: '4px', fontFamily: FONT_DISPLAY }}>Game Over!</h2>
          <p style={{ fontSize: '13px', color: theme.textSecondary, marginBottom: '16px', fontFamily: FONT_BODY, fontWeight: 600 }}>
            You reached <strong style={{ color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>Level {currentLevel}</strong> with <strong style={{ color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>{correctCount}</strong> correct answers!
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
            <div style={{ padding: '12px', background: theme.surfaceBg, borderRadius: '10px', border: `1.5px solid ${palette.border}` }}><div style={{ fontSize: '20px', fontWeight: '800', color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>{score}</div><div style={{ fontSize: '10px', color: theme.textSecondary, fontFamily: FONT_DISPLAY, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Score</div></div>
            <div style={{ padding: '12px', background: theme.surfaceBg, borderRadius: '10px', border: `1.5px solid ${palette.border}` }}><div style={{ fontSize: '20px', fontWeight: '800', color: palette.teal, fontFamily: FONT_DISPLAY }}>{accuracy}%</div><div style={{ fontSize: '10px', color: theme.textSecondary, fontFamily: FONT_DISPLAY, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Accuracy</div></div>
            <div style={{ padding: '12px', background: theme.surfaceBg, borderRadius: '10px', border: `1.5px solid ${palette.border}` }}><div style={{ fontSize: '20px', fontWeight: '800', color: palette.gold, fontFamily: FONT_DISPLAY }}>×{maxCombo}</div><div style={{ fontSize: '10px', color: theme.textSecondary, fontFamily: FONT_DISPLAY, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Best Combo</div></div>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexDirection: 'column' }}>
            <button onClick={startGame} disabled={lives <= 0} style={{ padding: '12px', background: lives > 0 ? theme.accentGradient : palette.creamSoft, color: lives > 0 ? 'white' : palette.bodyTextSoft, border: 'none', borderRadius: '12px', cursor: lives > 0 ? 'pointer' : 'not-allowed', fontSize: '13px', fontWeight: '800', boxShadow: lives > 0 ? `0 3px 0 ${palette.warmOrangeShadow}` : 'none', fontFamily: FONT_DISPLAY }}>{lives > 0 ? '🔄 Play Again' : '⏳ No Lives - Next heart in ' + timeRemaining}</button>
            <button onClick={() => setGameState('intro')} style={{ padding: '10px', background: palette.creamSoft, color: palette.bodyText, border: `1.5px solid ${palette.border}`, borderRadius: '12px', cursor: 'pointer', fontSize: '12px', fontWeight: '800', fontFamily: FONT_DISPLAY }}>Back to Menu</button>
          </div>
        </div>
      </div>
    );
  }

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
            <h2 style={{ fontSize: '14px', fontWeight: '700', color: theme.textPrimary, fontFamily: FONT_BODY }}>Generating puzzle...</h2>
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

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '8px 14px', background: 'rgba(255,255,255,0.9)', borderRadius: '14px',
          maxWidth: '520px', width: '100%', margin: '0 auto 10px',
          border: `1.5px solid ${palette.border}`,
          boxShadow: '0 4px 12px rgba(42,40,69,0.10)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => setShowSettings(true)} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', padding: '2px', color: palette.bodyText }}>⚙️</button>
            <span style={{ fontWeight: '800', color: palette.deepNavy, fontSize: '12px', fontFamily: FONT_DISPLAY }}>📝 {config.emoji} Lv.{currentLevel}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ fontSize: '10px', color: palette.bodyText, fontWeight: '800', background: palette.creamSoft, padding: '2px 10px', borderRadius: '10px', fontFamily: FONT_DISPLAY, border: `1px solid ${palette.border}` }}>
              {retryPhase ? `Retry ${retryIndex + 1}/${wrongQuestions.length}` : `${answeredInLevel}/${QUESTIONS_PER_LEVEL}`}
            </div>
            <div style={{ fontSize: '10px', color: palette.bodyText, fontWeight: '800', background: palette.creamSoft, padding: '2px 10px', borderRadius: '10px', fontFamily: FONT_DISPLAY, border: `1px solid ${palette.border}` }}>#{questionNumber}</div>
            <div style={{ display: 'flex', gap: '1px' }}>
              {[...Array(lives)].map((_, i) => (<span key={i} style={{ fontSize: '14px' }}>❤️</span>))}
              {[...Array(maxLives - lives)].map((_, i) => (<span key={i} style={{ fontSize: '14px', opacity: 0.2 }}>❤️</span>))}
            </div>

            <div style={{
              width: '30px', height: '30px', borderRadius: '50%',
              background: timer <= 3 ? `${palette.danger}20` : timer <= 5 ? `${palette.warmOrange}20` : palette.creamSoft,
              border: `2px solid ${timer <= 3 ? palette.danger : timer <= 5 ? palette.warmOrange : palette.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: timer <= 3 ? palette.danger : timer <= 5 ? palette.warmOrange : palette.deepNavy,
              fontSize: '12px', fontWeight: '800', fontFamily: FONT_DISPLAY
            }}>{timer}</div>
            <div style={{ background: palette.warmOrange, padding: '2px 14px', borderRadius: '8px', color: 'white', fontWeight: '800', fontSize: '14px', fontFamily: FONT_DISPLAY, boxShadow: `0 2px 0 ${palette.warmOrangeShadow}` }}>{score}</div>
            {comboCount >= 3 && (<div style={{ background: `${palette.gold}20`, padding: '2px 12px', borderRadius: '8px', color: palette.gold, fontWeight: '800', fontSize: '11px', border: `1.5px solid ${palette.gold}40`, fontFamily: FONT_DISPLAY }}>🔥 {comboCount}x</div>)}
            <div style={{ background: palette.creamSoft, padding: '2px 10px', borderRadius: '10px', color: palette.softGreen, fontWeight: '800', fontSize: '10px', fontFamily: FONT_DISPLAY, border: `1px solid ${palette.border}` }}>{correctCount}✅</div>
          </div>
        </div>

        <div style={{
          maxWidth: '620px',
          width: '100%', background: theme.cardBg,
          borderRadius: '24px', padding: '30px 28px',
          border: theme.cardBorder,
          boxShadow: theme.cardShadow,
          position: 'relative', overflow: 'hidden'
        }}>
          {showCorrectAnimation && (<div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `${palette.softGreen}15`, animation: 'correctFlash 0.5s ease' }} />)}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: '800', color: theme.textSecondary, fontFamily: FONT_DISPLAY }}>{config.emoji} Level {currentLevel}/{MAX_LEVEL}</span>
            <span style={{ fontSize: '13px', color: theme.textMuted, fontWeight: '700', fontFamily: FONT_DISPLAY }}>
              {retryPhase ? `Retry ${retryIndex + 1}/${wrongQuestions.length}` : `Q${answeredInLevel + 1}/${QUESTIONS_PER_LEVEL}`}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '18px', padding: '18px', background: theme.surfaceBg, borderRadius: '14px', border: `1.5px solid ${theme.surfaceBorder}`, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '120px', height: '120px', background: palette.white, borderRadius: '14px', border: `1.5px solid ${palette.border}` }}>
              <img src={currentQuestion.image1} alt={currentQuestion.word} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '14px' }}
                onError={(e) => { e.target.style.display = 'none'; const parent = e.target.parentElement; const span = document.createElement('span'); span.style.fontSize = '48px'; span.textContent = '🖼️'; parent.appendChild(span); }} />
            </div>
            <span style={{ fontSize: '30px', fontWeight: '800', color: palette.warmOrange, fontFamily: FONT_DISPLAY }}>↔️</span>
            <div style={{ position: 'relative', width: '120px', height: '120px', background: palette.white, borderRadius: '14px', border: `1.5px solid ${palette.border}` }}>
              <img src={currentQuestion.image2} alt={currentQuestion.word} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '14px' }}
                onError={(e) => { e.target.style.display = 'none'; const parent = e.target.parentElement; const span = document.createElement('span'); span.style.fontSize = '48px'; span.textContent = '🖼️'; parent.appendChild(span); }} />
            </div>
            <span style={{ fontSize: '28px', fontWeight: '800', color: theme.textPrimary, background: theme.chipBg, padding: '0 14px', borderRadius: '10px', border: `1.5px solid ${palette.border}`, fontFamily: FONT_DISPLAY }}>= ?</span>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '16px', fontSize: '15px', color: theme.textSecondary, fontWeight: '700', fontFamily: FONT_DISPLAY }}>{currentQuestion.category || 'Vocabulary'}</div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '7px', marginBottom: '18px', padding: '16px', background: theme.surfaceBg, borderRadius: '12px', border: `1.5px solid ${theme.surfaceBorder}`, flexWrap: 'wrap' }}>
            {word.split('').map((letter, index) => {
              const isVisible = visiblePositions.includes(index);
              const filledLetter = userFilledBlanks[index];
              if (isVisible) {
                return (<div key={index} style={{ width: '42px', height: '48px', background: theme.chipBg, border: `1.5px solid ${theme.surfaceBorder}`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '23px', fontWeight: '800', color: theme.textSecondary, fontFamily: FONT_DISPLAY }}>{letter}</div>);
              } else {
                return (<div key={index} onClick={() => handleBlankClick(index)} style={{ width: '42px', height: '48px', background: filledLetter ? theme.chipBg : palette.white, border: `2px ${filledLetter ? 'solid' : 'dashed'} ${filledLetter ? theme.accent : theme.surfaceBorder}`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '23px', fontWeight: '800', color: theme.textPrimary, cursor: filledLetter ? 'pointer' : 'default', transition: 'all 0.3s ease', fontFamily: FONT_DISPLAY }}>{filledLetter || ''}</div>);
              }
            })}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '7px', marginBottom: '18px', padding: '13px', background: theme.surfaceBg, borderRadius: '12px', border: `1.5px solid ${theme.surfaceBorder}`, minHeight: '48px' }}>
            {letters.map((letter, index) => {
              const isUsed = usedLetters.includes(index);
              return (<button key={index} onClick={() => handleLetterClick(letter, index)} disabled={isUsed || answered || lives === 0 || timer === 0} style={{ width: '46px', height: '46px', borderRadius: '12px', background: isUsed ? 'transparent' : theme.chipBg, border: `2px solid ${isUsed ? theme.surfaceBorder : `${palette.warmOrange}50`}`, color: isUsed ? theme.textMuted : theme.textSecondary, fontSize: '19px', fontWeight: '800', cursor: isUsed || answered || lives === 0 || timer === 0 ? 'default' : 'pointer', transition: 'all 0.15s ease', fontFamily: FONT_DISPLAY }}>{letter}</button>);
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <button onClick={() => { setUserFilledBlanks({}); setUsedLetters([]); }} disabled={answered || lives === 0 || Object.keys(userFilledBlanks).length === 0} style={{ padding: '13px', borderRadius: '14px', border: `1.5px solid ${theme.surfaceBorder}`, background: Object.keys(userFilledBlanks).length > 0 ? theme.surfaceBg : 'transparent', color: theme.textSecondary, cursor: Object.keys(userFilledBlanks).length > 0 ? 'pointer' : 'default', fontSize: '14px', fontWeight: '800', fontFamily: FONT_DISPLAY }}>🔄 Clear</button>
            <button onClick={checkWord} disabled={answered || lives === 0 || Object.keys(userFilledBlanks).length < blanks.length} style={{ padding: '13px', borderRadius: '14px', border: 'none', background: Object.keys(userFilledBlanks).length >= blanks.length ? theme.accentGradient : theme.surfaceBg, color: Object.keys(userFilledBlanks).length >= blanks.length ? 'white' : theme.textMuted, cursor: Object.keys(userFilledBlanks).length >= blanks.length ? 'pointer' : 'default', fontSize: '14px', fontWeight: '800', boxShadow: Object.keys(userFilledBlanks).length >= blanks.length ? `0 3px 0 ${palette.warmOrangeShadow}` : 'none', fontFamily: FONT_DISPLAY }}>✅ Submit</button>
          </div>

          {!answered && lives > 0 && (<button onClick={useHint} disabled={hintUsed} style={{ width: '100%', padding: '12px', borderRadius: '14px', border: `1.5px solid ${hintUsed ? theme.surfaceBorder : `${palette.gold}50`}`, background: hintUsed ? theme.surfaceBg : `${palette.gold}12`, color: hintUsed ? theme.textMuted : palette.gold, cursor: hintUsed ? 'default' : 'pointer', fontSize: '13px', fontWeight: '800', marginBottom: '12px', fontFamily: FONT_DISPLAY }}>💡 {hintUsed ? 'Hint Used (-3 secs)' : 'Need Help? Ask a Friend! (-3 secs)'}</button>)}

          {showFeedback && (<div style={{ padding: '8px', borderRadius: '10px', background: feedbackMessage.includes('✅') || feedbackMessage.includes('⬆️') || feedbackMessage.includes('🎉') ? `${palette.softGreen}15` : feedbackMessage.includes('🛡️') ? `${palette.gold}15` : `${palette.danger}15`, border: `1.5px solid ${feedbackMessage.includes('✅') || feedbackMessage.includes('⬆️') || feedbackMessage.includes('🎉') ? `${palette.softGreen}40` : feedbackMessage.includes('🛡️') ? `${palette.gold}40` : `${palette.danger}40`}`, marginBottom: '8px', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: feedbackMessage.includes('✅') || feedbackMessage.includes('⬆️') || feedbackMessage.includes('🎉') ? palette.softGreen : feedbackMessage.includes('🛡️') ? palette.gold : palette.danger, fontFamily: FONT_BODY }}>{feedbackMessage}</div>)}
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

export default SynoQuest;