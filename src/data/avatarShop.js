// src/data/avatarShop.js

// ============================================================
// ✅ AVATAR SHOP ITEMS - PRE-MADE CHARACTERS (20 TOTAL)
// ============================================================
export const AVATAR_SHOP_ITEMS = [
  {
    id: 'avatar1',
    name: 'Gon Freecss',
    image: '/image/avatar1.png',
    price: 0,
    rarity: 'free',
    anime: 'Hunter x Hunter',
    description: 'The cheerful young Hunter!'
  },
  {
    id: 'avatar2',
    name: 'Character 2',
    image: '/image/avatar2.png',
    price: 0,
    rarity: 'free',
    anime: 'Anime',
    description: 'A brave warrior!'
  },
  {
    id: 'avatar3',
    name: 'Character 3',
    image: '/image/avatar3.png',
    price: 0,
    rarity: 'free',
    anime: 'Anime',
    description: 'A mysterious hero!'
  },
  {
    id: 'avatar4',
    name: 'Character 4',
    image: '/image/avatar4.png',
    price: 100,
    rarity: 'common',
    anime: 'Anime',
    description: 'A skilled fighter!'
  },
  {
    id: 'avatar5',
    name: 'Character 5',
    image: '/image/avatar5.png',
    price: 100,
    rarity: 'common',
    anime: 'Anime',
    description: 'A loyal friend!'
  },
  {
    id: 'avatar6',
    name: 'Character 6',
    image: '/image/avatar6.png',
    price: 100,
    rarity: 'common',
    anime: 'Anime',
    description: 'A clever strategist!'
  },
  {
    id: 'avatar7',
    name: 'Character 7',
    image: '/image/avatar7.png',
    price: 500,
    rarity: 'rare',
    anime: 'Anime',
    description: 'A powerful ally!'
  },
  {
    id: 'avatar8',
    name: 'Character 8',
    image: '/image/avatar8.png',
    price: 500,
    rarity: 'rare',
    anime: 'Anime',
    description: 'A legendary warrior!'
  },
  {
    id: 'avatar9',
    name: 'Character 9',
    image: '/image/avatar9.png',
    price: 500,
    rarity: 'rare',
    anime: 'Anime',
    description: 'A silent assassin!'
  },
  {
    id: 'avatar10',
    name: 'Character 10',
    image: '/image/avatar10.png',
    price: 1000,
    rarity: 'epic',
    anime: 'Anime',
    description: 'An elite champion!'
  },
  {
    id: 'avatar11',
    name: 'Character 11',
    image: '/image/avatar11.png',
    price: 1000,
    rarity: 'epic',
    anime: 'Anime',
    description: 'A legendary master!'
  },
  {
    id: 'avatar12',
    name: 'Character 12',
    image: '/image/avatar12.png',
    price: 1000,
    rarity: 'epic',
    anime: 'Anime',
    description: 'A mystical sorcerer!'
  },
  {
    id: 'avatar13',
    name: 'Character 13',
    image: '/image/avatar13.png',
    price: 5000,
    rarity: 'legendary',
    anime: 'Anime',
    description: 'The ultimate legend!'
  },
  {
    id: 'avatar14',
    name: 'Character 14',
    image: '/image/avatar14.png',
    price: 5000,
    rarity: 'legendary',
    anime: 'Anime',
    description: 'A divine warrior!'
  },
  {
    id: 'avatar15',
    name: 'Character 15',
    image: '/image/avatar15.png',
    price: 5000,
    rarity: 'legendary',
    anime: 'Anime',
    description: 'A celestial being!'
  },
  {
    id: 'avatar16',
    name: 'Character 16',
    image: '/image/avatar16.png',
    price: 10000,
    rarity: 'mythic',
    anime: 'Anime',
    description: 'A god-tier fighter!'
  },
  {
    id: 'avatar17',
    name: 'Character 17',
    image: '/image/avatar17.png',
    price: 10000,
    rarity: 'mythic',
    anime: 'Anime',
    description: 'The chosen one!'
  },
  {
    id: 'avatar18',
    name: 'Character 18',
    image: '/image/avatar18.png',
    price: 10000,
    rarity: 'mythic',
    anime: 'Anime',
    description: 'A transcendent being!'
  },
  {
    id: 'avatar19',
    name: 'Character 19',
    image: '/image/avatar19.png',
    price: 10000,
    rarity: 'mythic',
    anime: 'Anime',
    description: 'An eternal legend!'
  },
  {
    id: 'avatar20',
    name: 'Character 20',
    image: '/image/avatar20.png',
    price: 10000,
    rarity: 'mythic',
    anime: 'Anime',
    description: 'The ultimate god!'
  }
];

// ============================================================
// ✅ RARITY CONFIG
// ============================================================
export const RARITY_CONFIG = {
  free: { label: '🎁 FREE', color: '#4CAF50', bg: '#e8f5e9', border: '#4CAF50', glow: 'none' },
  common: { label: '🟢 Common', color: '#4CAF50', bg: '#f1f8e9', border: '#8bc34a', glow: 'none' },
  rare: { label: '🔵 Rare', color: '#2196F3', bg: '#e3f2fd', border: '#2196F3', glow: '0 0 15px rgba(33, 150, 243, 0.4)' },
  epic: { label: '🟣 Epic', color: '#9C27B0', bg: '#f3e5f5', border: '#9C27B0', glow: '0 0 20px rgba(156, 39, 176, 0.5)' },
  legendary: { label: '🟡 Legendary', color: '#FF9800', bg: '#fff3e0', border: '#FF9800', glow: '0 0 25px rgba(255, 152, 0, 0.6)' },
  mythic: { label: '💎 Mythic', color: '#E91E63', bg: '#fce4ec', border: '#E91E63', glow: '0 0 30px rgba(233, 30, 99, 0.7)' }
};

// ============================================================
// ✅ HELPER FUNCTIONS
// ============================================================
export const getAvatarById = (id) => AVATAR_SHOP_ITEMS.find(item => item.id === id);
export const getFreeAvatars = () => AVATAR_SHOP_ITEMS.filter(item => item.price === 0);
export const getAvatarsByRarity = (rarity) => AVATAR_SHOP_ITEMS.filter(item => item.rarity === rarity);

// ============================================================
// ✅ DEFAULT EQUIPPED AVATAR
// ============================================================
export const DEFAULT_AVATAR_ID = 'avatar1';