const allScenes = [
  {
    id: 0, narrator: "The Queen's Journey", emotion: 'curious',
    text: "Queen Elara found a magical book in the library. This book had the power to teach her new words. Each word she learned made her wiser and stronger.",
    vocabulary: 'Wisdom',
    wordDefinition: 'Knowledge and good judgment',
    choices: [
      { id: 'A', text: 'Knowledge and good judgment', nextScene: 1, correct: true },
      { id: 'B', text: 'Being fast and strong', nextScene: 2, correct: false },
      { id: 'C', text: 'Being rich and famous', nextScene: 3, correct: false }
    ]
  },
  {
    id: 1, narrator: "The Brave Queen", emotion: 'determined',
    text: "The Queen was brave. She decided to explore the deepest part of the library. She knew she would find amazing things there.",
    vocabulary: 'Explore',
    wordDefinition: 'To travel and discover new places',
    choices: [
      { id: 'A', text: 'To stay in one place', nextScene: 4, correct: false },
      { id: 'B', text: 'To travel and discover', nextScene: 5, correct: true },
      { id: 'C', text: 'To hide from danger', nextScene: 6, correct: false }
    ]
  },
  {
    id: 2, narrator: "The Beautiful Library", emotion: 'amazed',
    text: "The library was beautiful. Books of all colors floated in the air. The Queen felt happy and peaceful in this magical place.",
    vocabulary: 'Peaceful',
    wordDefinition: 'Calm and quiet',
    choices: [
      { id: 'A', text: 'Loud and chaotic', nextScene: 7, correct: false },
      { id: 'B', text: 'Calm and quiet', nextScene: 8, correct: true },
      { id: 'C', text: 'Dark and scary', nextScene: 9, correct: false }
    ]
  },
  {
    id: 3, narrator: "The Queen's Courage", emotion: 'thinking',
    text: "The Queen showed great courage. She was not afraid to face the unknown. Her heart was filled with hope and excitement.",
    vocabulary: 'Courage',
    wordDefinition: 'Being brave in the face of fear',
    choices: [
      { id: 'A', text: 'Being very scared', nextScene: 10, correct: false },
      { id: 'B', text: 'Being brave and fearless', nextScene: 11, correct: true },
      { id: 'C', text: 'Being lazy and weak', nextScene: 12, correct: false }
    ]
  },
  {
    id: 4, narrator: "The Queen's Discovery", emotion: 'curious',
    text: "The Queen discovered a hidden room. Inside were thousands of books. She knew this was a place of great learning.",
    vocabulary: 'Discover',
    wordDefinition: 'To find something for the first time',
    choices: [
      { id: 'A', text: 'To lose something', nextScene: 13, correct: false },
      { id: 'B', text: 'To find something new', nextScene: 14, correct: true },
      { id: 'C', text: 'To break something', nextScene: 15, correct: false }
    ]
  },
  {
    id: 5, narrator: "The Queen's Strength", emotion: 'glowing',
    text: "The Queen felt strong. She could read any book and understand any word. Her mind was powerful and sharp.",
    vocabulary: 'Powerful',
    wordDefinition: 'Having great strength or ability',
    choices: [
      { id: 'A', text: 'Being very weak', nextScene: 16, correct: false },
      { id: 'B', text: 'Having great strength', nextScene: 17, correct: true },
      { id: 'C', text: 'Being very small', nextScene: 18, correct: false }
    ]
  },
  {
    id: 6, narrator: "The Queen's Kindness", emotion: 'happy',
    text: "The Queen was kind to everyone she met. She shared her knowledge with the people of her kingdom. They loved her for her kindness.",
    vocabulary: 'Kindness',
    wordDefinition: 'Being friendly and caring',
    choices: [
      { id: 'A', text: 'Being mean and rude', nextScene: 19, correct: false },
      { id: 'B', text: 'Being friendly and caring', nextScene: 20, correct: true },
      { id: 'C', text: 'Being selfish and greedy', nextScene: 0, correct: false }
    ]
  },
  {
    id: 7, narrator: "The Queen's Dream", emotion: 'thinking',
    text: "The Queen had a dream. She dreamed of a world where everyone could read and learn. She wanted to make this dream come true.",
    vocabulary: 'Dream',
    wordDefinition: 'A hope or wish for the future',
    choices: [
      { id: 'A', text: 'A scary nightmare', nextScene: 1, correct: false },
      { id: 'B', text: 'A hope or wish', nextScene: 2, correct: true },
      { id: 'C', text: 'A boring thought', nextScene: 3, correct: false }
    ]
  },
  {
    id: 8, narrator: "The Queen's Happiness", emotion: 'glowing',
    text: "The Queen was happy. She had found the greatest treasure of all - knowledge. She knew this treasure would last forever.",
    vocabulary: 'Treasure',
    wordDefinition: 'Something very valuable and precious',
    choices: [
      { id: 'A', text: 'Something worthless', nextScene: 4, correct: false },
      { id: 'B', text: 'Something valuable', nextScene: 5, correct: true },
      { id: 'C', text: 'Something dangerous', nextScene: 6, correct: false }
    ]
  },
  {
    id: 9, narrator: "The Queen's Learning", emotion: 'wise',
    text: "The Queen loved learning. Every new word she learned opened a door to a new world. She wanted to learn everything.",
    vocabulary: 'Learning',
    wordDefinition: 'Gaining knowledge and skills',
    choices: [
      { id: 'A', text: 'Forgetting everything', nextScene: 7, correct: false },
      { id: 'B', text: 'Gaining knowledge', nextScene: 8, correct: true },
      { id: 'C', text: 'Being very bored', nextScene: 9, correct: false }
    ]
  },
  {
    id: 10, narrator: "The Queen's Adventure", emotion: 'curious',
    text: "Every day was a new adventure for the Queen. She explored the library and found new books to read. Life was exciting!",
    vocabulary: 'Adventure',
    wordDefinition: 'An exciting and unusual experience',
    choices: [
      { id: 'A', text: 'A boring routine', nextScene: 10, correct: false },
      { id: 'B', text: 'An exciting experience', nextScene: 11, correct: true },
      { id: 'C', text: 'A scary nightmare', nextScene: 12, correct: false }
    ]
  },
  {
    id: 11, narrator: "The Queen's Patience", emotion: 'thinking',
    text: "The Queen was patient. She knew that learning took time. She read each book carefully and understood every word.",
    vocabulary: 'Patient',
    wordDefinition: 'Able to wait calmly without complaining',
    choices: [
      { id: 'A', text: 'Being impatient and angry', nextScene: 13, correct: false },
      { id: 'B', text: 'Waiting calmly', nextScene: 14, correct: true },
      { id: 'C', text: 'Being very fast', nextScene: 15, correct: false }
    ]
  },
  {
    id: 12, narrator: "The Queen's Gratitude", emotion: 'happy',
    text: "The Queen was grateful for all the knowledge she had gained. She thanked the library and all the books that taught her.",
    vocabulary: 'Grateful',
    wordDefinition: 'Feeling thankful for something',
    choices: [
      { id: 'A', text: 'Feeling angry', nextScene: 16, correct: false },
      { id: 'B', text: 'Feeling thankful', nextScene: 17, correct: true },
      { id: 'C', text: 'Feeling bored', nextScene: 18, correct: false }
    ]
  },
  {
    id: 13, narrator: "The Queen's Wisdom", emotion: 'wise',
    text: "The Queen became the wisest ruler in the kingdom. Her people came to her for advice because she always gave good answers.",
    vocabulary: 'Advice',
    wordDefinition: 'A suggestion or recommendation on what to do',
    choices: [
      { id: 'A', text: 'A confusing question', nextScene: 19, correct: false },
      { id: 'B', text: 'A helpful suggestion', nextScene: 20, correct: true },
      { id: 'C', text: 'A silly joke', nextScene: 0, correct: false }
    ]
  },
  {
    id: 14, narrator: "The Queen's Imagination", emotion: 'curious',
    text: "The Queen had a great imagination. She could picture entire worlds just by reading words. Her mind was full of wonderful ideas.",
    vocabulary: 'Imagination',
    wordDefinition: 'The ability to create new ideas and pictures in your mind',
    choices: [
      { id: 'A', text: 'Having no ideas', nextScene: 1, correct: false },
      { id: 'B', text: 'Creating new ideas', nextScene: 2, correct: true },
      { id: 'C', text: 'Being very confused', nextScene: 3, correct: false }
    ]
  },
  {
    id: 15, narrator: "The Queen's Goal", emotion: 'determined',
    text: "The Queen had a goal. She wanted to read every book in the library. She worked hard every day to achieve her goal.",
    vocabulary: 'Goal',
    wordDefinition: 'Something you want to achieve',
    choices: [
      { id: 'A', text: 'Something you avoid', nextScene: 4, correct: false },
      { id: 'B', text: 'Something you want to achieve', nextScene: 5, correct: true },
      { id: 'C', text: 'Something you forget', nextScene: 6, correct: false }
    ]
  },
  {
    id: 16, narrator: "The Queen's Success", emotion: 'happy',
    text: "The Queen was successful. She had learned many new words and became very smart. Her kingdom was proud of her.",
    vocabulary: 'Success',
    wordDefinition: 'Achieving what you wanted to do',
    choices: [
      { id: 'A', text: 'Failing at something', nextScene: 7, correct: false },
      { id: 'B', text: 'Achieving your goal', nextScene: 8, correct: true },
      { id: 'C', text: 'Giving up easily', nextScene: 9, correct: false }
    ]
  },
  {
    id: 17, narrator: "The Queen's Joy", emotion: 'glowing',
    text: "The Queen felt great joy. She had found the most wonderful thing in the world - the love of learning. Her heart was full of happiness.",
    vocabulary: 'Joy',
    wordDefinition: 'A feeling of great happiness',
    choices: [
      { id: 'A', text: 'A feeling of sadness', nextScene: 10, correct: false },
      { id: 'B', text: 'A feeling of great happiness', nextScene: 11, correct: true },
      { id: 'C', text: 'A feeling of anger', nextScene: 12, correct: false }
    ]
  },
  {
    id: 18, narrator: "The Queen's Future", emotion: 'awakened',
    text: "The Queen looked to the future with hope. She knew there were still many words to learn and many books to read. Her journey would never end.",
    vocabulary: 'Future',
    wordDefinition: 'The time yet to come',
    choices: [
      { id: 'A', text: 'The time that has passed', nextScene: 13, correct: false },
      { id: 'B', text: 'The time yet to come', nextScene: 14, correct: true },
      { id: 'C', text: 'The present moment', nextScene: 15, correct: false }
    ]
  },
  {
    id: 19, narrator: "The Queen's Knowledge", emotion: 'wise',
    text: "The Queen shared her knowledge with everyone. She taught children to read and helped adults learn new things. Her kingdom became a place of learning.",
    vocabulary: 'Knowledge',
    wordDefinition: 'Information and understanding about a subject',
    choices: [
      { id: 'A', text: 'Being confused and lost', nextScene: 16, correct: false },
      { id: 'B', text: 'Information and understanding', nextScene: 17, correct: true },
      { id: 'C', text: 'Being very ignorant', nextScene: 18, correct: false }
    ]
  },
  {
    id: 20, narrator: "The Queen's Legacy", emotion: 'awakened',
    text: "The Queen's legacy lived on. She had taught her people the value of words and learning. Her kingdom became the most educated in the world.",
    vocabulary: 'Legacy',
    wordDefinition: 'Something handed down from the past',
    choices: [
      { id: 'A', text: 'Something forgotten', nextScene: 19, correct: false },
      { id: 'B', text: 'Something handed down', nextScene: 20, correct: true },
      { id: 'C', text: 'Something destroyed', nextScene: 0, correct: false }
    ]
  }
];

export default allScenes;