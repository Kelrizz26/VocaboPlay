// src/utils/wordPicsUtils.js
//
// Bridges the WordPics game words (defined inside WordPicsGame.jsx) with
// the Admin > Word Library panel (AdminWords.jsx).
//
// WordPicsGame.jsx does not export its internal `wordPairs` data, so this
// file mirrors the same word list (word + the two illustrating images +
// category) purely for admin display/sync purposes.
//
// If you add/edit words directly inside WordPicsGame.jsx's `wordPairs`
// object, mirror the same change here so the admin panel stays in sync.

const IMAGE_BASE_PATH = 'src/image/';

// Tiers ordered the same way WordPicsGame.jsx levels them up.
// (hard/veryHard/expert/master in the game just re-mix these same words,
// so we only need to define each unique word once, here.)
const TIER_ORDER = ['beginner', 'easy', 'medium', 'mediumHard'];

const WORD_PICS_DATA = {
  beginner: [
    { id: 1, word: 'HAPPY', image1Key: 'happy', image2Key: 'joyful', category: '😊 Emotions' },
    { id: 2, word: 'SAD', image1Key: 'sad', image2Key: 'unhappy', category: '😢 Emotions' },
    { id: 3, word: 'BIG', image1Key: 'big', image2Key: 'large', category: '📏 Size' },
    { id: 4, word: 'SMALL', image1Key: 'small', image2Key: 'little', category: '📏 Size' },
    { id: 5, word: 'FAST', image1Key: 'fast', image2Key: 'quick', category: '🏃 Speed' },
    { id: 6, word: 'GOOD', image1Key: 'good', image2Key: 'great', category: '⭐ Quality' },
    { id: 7, word: 'BAD', image1Key: 'bad', image2Key: 'terrible', category: '💔 Quality' },
    { id: 8, word: 'GIFT', image1Key: 'gift', image2Key: 'present', category: '🎁 Objects' },
    { id: 9, word: 'FIND', image1Key: 'find', image2Key: 'discover', category: '🔍 Discovery' },
    { id: 10, word: 'FIX', image1Key: 'fix', image2Key: 'repair', category: '🔧 Actions' },
  ],
  easy: [
    { id: 1, word: 'SMART', image1Key: 'smart', image2Key: 'intelligent', category: '🧠 Intelligence' },
    { id: 2, word: 'STRONG', image1Key: 'strong', image2Key: 'powerful', category: '💪 Strength' },
    { id: 3, word: 'BRAVE', image1Key: 'brave', image2Key: 'courageous', category: '🦁 Courage' },
    { id: 4, word: 'CALM', image1Key: 'calm', image2Key: 'peaceful', category: '😌 Calmness' },
    { id: 5, word: 'RICH', image1Key: 'rich', image2Key: 'wealthy', category: '💰 Wealth' },
    { id: 6, word: 'BEAUTIFUL', image1Key: 'beautiful', image2Key: 'pretty', category: '🌸 Appearance' },
    { id: 7, word: 'UGLY', image1Key: 'ugly', image2Key: 'unattractive', category: '👹 Appearance' },
    { id: 8, word: 'FUNNY', image1Key: 'funny', image2Key: 'amusing', category: '😂 Humor' },
    { id: 9, word: 'JOURNEY', image1Key: 'journey', image2Key: 'trip', category: '🗺️ Travel' },
    { id: 10, word: 'KIND', image1Key: 'kind', image2Key: 'caring', category: '💖 Personality' },
  ],
  medium: [
    { id: 1, word: 'MAGNIFICENT', image1Key: 'magnificent', image2Key: 'extraordinary', category: '👑 Quality' },
    { id: 2, word: 'GRATEFUL', image1Key: 'grateful', image2Key: 'thankful', category: '🙏 Emotion' },
    { id: 3, word: 'MINDFUL', image1Key: 'mindful', image2Key: 'aware', category: '🧘 Personality' },
    { id: 4, word: 'INNOVATIVE', image1Key: 'innovative', image2Key: 'creative', category: '💡 Personality' },
    { id: 5, word: 'ANALYZE', image1Key: 'analyze', image2Key: 'examine', category: '🔍 Verbs' },
    { id: 6, word: 'COMPLETE', image1Key: 'complete', image2Key: 'finish', category: '✅ Verbs' },
    { id: 7, word: 'DEMONSTRATE', image1Key: 'demonstrate', image2Key: 'show', category: '👀 Verbs' },
    { id: 8, word: 'EXPLAIN', image1Key: 'explain', image2Key: 'clarify', category: '💡 Verbs' },
    { id: 9, word: 'EVALUATE', image1Key: 'evaluate', image2Key: 'judge', category: '📊 Verbs' },
    { id: 10, word: 'FORMULATE', image1Key: 'formulate', image2Key: 'create', category: '🔧 Verbs' },
  ],
  mediumHard: [
    { id: 1, word: 'PARTICIPATE', image1Key: 'participate', image2Key: 'join', category: '🤝 Verbs' },
    { id: 2, word: 'IMPROVE', image1Key: 'improve', image2Key: 'better', category: '📈 Verbs' },
    { id: 3, word: 'REVIEW', image1Key: 'review', image2Key: 'study', category: '🔄 Verbs' },
    { id: 4, word: 'INTERPRET', image1Key: 'interpret', image2Key: 'understand', category: '🧠 Verbs' },
    { id: 5, word: 'JUSTIFY', image1Key: 'justify', image2Key: 'defend', category: '📋 Verbs' },
    { id: 6, word: 'SUMMARIZE', image1Key: 'summarize', image2Key: 'condense', category: '📝 Verbs' },
    { id: 7, word: 'SYNTHESIZE', image1Key: 'synthesize', image2Key: 'combine', category: '🧩 Verbs' },
    { id: 8, word: 'CRITIQUE', image1Key: 'critique', image2Key: 'evaluate', category: '📋 Verbs' },
    { id: 9, word: 'ELABORATE', image1Key: 'elaborate', image2Key: 'explain', category: '📝 Verbs' },
    { id: 10, word: 'EDUCATE', image1Key: 'educate', image2Key: 'learn', category: '🎓 Verbs' },
  ],
};

// beginner/easy -> Easy, medium/mediumHard -> Medium.
// (The game's hard/veryHard/expert/master levels just re-mix these same
// words at faster timers, so nothing above "Medium" is needed here.)
const tierToDifficultyLabel = (tier) => {
  if (tier === 'beginner' || tier === 'easy') return 'Easy';
  return 'Medium';
};

const stripLeadingEmoji = (text = '') => text.replace(/^[^a-zA-Z]+/, '').trim() || 'Vocabulary';

const toTitleCase = (word = '') =>
  word.length ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word;

/**
 * Returns every WordPics word (deduplicated by word text) formatted for
 * display in the Admin > Word Library > "WordPics Words" tab.
 */
export function getAllWordPicsWords() {
  const seen = new Set();
  const result = [];

  TIER_ORDER.forEach((tier) => {
    (WORD_PICS_DATA[tier] || []).forEach((item) => {
      const key = item.word.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);

      result.push({
        id: `${tier}-${item.id}`,
        word: item.word,
        category: stripLeadingEmoji(item.category),
        difficulty: tierToDifficultyLabel(tier),
        level: tier,
        tier,
        synonymHint: item.image2Key,
        image1: `${IMAGE_BASE_PATH}${item.image1Key}.png`,
        image2: `${IMAGE_BASE_PATH}${item.image2Key}.png`,
      });
    });
  });

  return result;
}

/**
 * Converts WordPics word objects (as returned by getAllWordPicsWords) into
 * the full shape expected by AdminWords.jsx when writing to the Firestore
 * `words` collection. Always returns a non-empty `definition`, since
 * Firestore rejects `undefined` field values.
 */
export function formatWordPicsForLibrary(wordsData) {
  return (wordsData || []).map((w) => {
    const titleWord = toTitleCase(w.word);
    const synonymWord = w.synonymHint ? w.synonymHint.toLowerCase() : '';

    return {
      word: w.word,
      definition: synonymWord
        ? `"${titleWord}" means having a similar quality to "${synonymWord}." (Auto-generated from WordPics — edit to fit your lesson.)`
        : `A vocabulary word introduced through the WordPics game. Edit this definition to fit your lesson.`,
      category: w.category || 'Vocabulary',
      difficulty: tierToDifficultyLabel(w.tier),
      wordPicsLevel: w.tier,
      wordPicsId: w.id,
      image1: w.image1 || '',
      image2: w.image2 || '',
      teacherNote: `WordPics vocabulary word from the "${w.category || 'Vocabulary'}" category (${w.tier || 'medium'} tier).`,
      examples: synonymWord
        ? [`"The word '${titleWord}' is similar in meaning to '${synonymWord}.'"`]
        : [`"This is an example sentence using the word '${titleWord}.'"`],
      synonyms: synonymWord ? [synonymWord] : [],
      antonyms: [],
    };
  });
}