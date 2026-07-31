// src/components/dashboard/ShortStoryGame.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { updateStreak } from '../../utils/streakHelper';
import { updateUserStats } from '../../services/firebaseService';
import { auth } from '../../pages/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// ============================================================
// ===== REFILL TIME =====
// ============================================================
const REFILL_TIME = 1800; // 30 minutes

// ============================================================
// ===== SIMPLE CHARACTER =====
// ============================================================
const Character3D = ({ emotion, isWalking, isSpeaking }) => {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime;
      groupRef.current.position.y = Math.sin(time * 1.2) * 0.05;
      groupRef.current.rotation.y = Math.sin(time * 0.3) * 0.02;
    }
  });
  
  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* BODY */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.8, 1.0, 0.5]} />
        <meshStandardMaterial color="#6d5fc7" />
      </mesh>
      
      {/* SKIRT */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.0, 0.5, 0.7]} />
        <meshStandardMaterial color="#5C6AC4" />
      </mesh>
      
      {/* HEAD */}
      <mesh position={[0, 1.3, 0]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#f5d5b8" />
      </mesh>
      
      {/* HAIR */}
      <mesh position={[0, 1.45, -0.05]}>
        <sphereGeometry args={[0.45, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
        <meshStandardMaterial color="#6d4c2a" />
      </mesh>
      
      {/* HAIR - Bangs */}
      {[-0.3, -0.15, 0, 0.15, 0.3].map((x, i) => (
        <mesh key={i} position={[x, 1.5, -0.15]}>
          <boxGeometry args={[0.08, 0.03, 0.15]} />
          <meshStandardMaterial color="#6d4c2a" />
        </mesh>
      ))}
      
      {/* HAIR - Ponytails */}
      <mesh position={[-0.3, 1.2, -0.1]}>
        <boxGeometry args={[0.05, 0.2, 0.05]} />
        <meshStandardMaterial color="#6d4c2a" />
      </mesh>
      <mesh position={[0.3, 1.2, -0.1]}>
        <boxGeometry args={[0.05, 0.2, 0.05]} />
        <meshStandardMaterial color="#6d4c2a" />
      </mesh>
      
      {/* HAIR - Ribbon */}
      <mesh position={[0.25, 1.4, -0.1]}>
        <boxGeometry args={[0.08, 0.03, 0.02]} />
        <meshStandardMaterial color="#ec4899" />
      </mesh>
      <mesh position={[0.3, 1.42, -0.1]} rotation={[0, 0, 0.4]}>
        <boxGeometry args={[0.04, 0.06, 0.02]} />
        <meshStandardMaterial color="#ec4899" />
      </mesh>
      <mesh position={[0.2, 1.42, -0.1]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.04, 0.06, 0.02]} />
        <meshStandardMaterial color="#ec4899" />
      </mesh>
      
      {/* EYES */}
      <mesh position={[-0.12, 1.35, 0.4]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="white" />
        <mesh position={[0, 0, 0.05]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#1E293B" />
          <mesh position={[0.015, 0.01, 0.015]}>
            <sphereGeometry args={[0.015, 6, 6]} />
            <meshStandardMaterial color="white" />
          </mesh>
        </mesh>
      </mesh>
      <mesh position={[0.12, 1.35, 0.4]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="white" />
        <mesh position={[0, 0, 0.05]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#1E293B" />
          <mesh position={[-0.015, 0.01, 0.015]}>
            <sphereGeometry args={[0.015, 6, 6]} />
            <meshStandardMaterial color="white" />
          </mesh>
        </mesh>
      </mesh>
      
      {/* EYEBROWS */}
      <mesh position={[-0.12, 1.42, 0.4]}>
        <boxGeometry args={[0.08, 0.015, 0.02]} />
        <meshStandardMaterial color="#6d4c2a" />
      </mesh>
      <mesh position={[0.12, 1.42, 0.4]}>
        <boxGeometry args={[0.08, 0.015, 0.02]} />
        <meshStandardMaterial color="#6d4c2a" />
      </mesh>
      
      {/* MOUTH */}
      <mesh position={[0, 1.22, 0.42]}>
        <sphereGeometry args={[0.05, 8, 8, 0, Math.PI]} />
        <meshStandardMaterial color="#c0392b" />
      </mesh>
      
      {/* BLUSH */}
      <mesh position={[-0.2, 1.25, 0.38]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#f472b6" transparent opacity={0.25} />
      </mesh>
      <mesh position={[0.2, 1.25, 0.38]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#f472b6" transparent opacity={0.25} />
      </mesh>
      
      {/* ARMS */}
      <mesh position={[-0.5, 0.8, 0]}>
        <boxGeometry args={[0.08, 0.5, 0.08]} />
        <meshStandardMaterial color="#f5d5b8" />
      </mesh>
      <mesh position={[0.5, 0.8, 0]}>
        <boxGeometry args={[0.08, 0.5, 0.08]} />
        <meshStandardMaterial color="#f5d5b8" />
      </mesh>
      
      {/* LEGS */}
      <mesh position={[-0.2, -0.3, 0]}>
        <boxGeometry args={[0.12, 0.4, 0.12]} />
        <meshStandardMaterial color="#5C6AC4" />
      </mesh>
      <mesh position={[0.2, -0.3, 0]}>
        <boxGeometry args={[0.12, 0.4, 0.12]} />
        <meshStandardMaterial color="#5C6AC4" />
      </mesh>
      
      {/* SHOES */}
      <mesh position={[-0.2, -0.55, 0.05]}>
        <boxGeometry args={[0.16, 0.06, 0.2]} />
        <meshStandardMaterial color="#3d2a6a" />
      </mesh>
      <mesh position={[0.2, -0.55, 0.05]}>
        <boxGeometry args={[0.16, 0.06, 0.2]} />
        <meshStandardMaterial color="#3d2a6a" />
      </mesh>
      
      {/* NAME TAG */}
      <Text position={[0, -0.8, 0]} fontSize={0.12} color="rgba(255,255,255,0.5)" anchorX="center" anchorY="middle">
        ✦ Queen ✦
      </Text>
    </group>
  );
};

// ============================================================
// ===== 3D LIBRARY SCENE =====
// ============================================================
const LibraryScene = () => {
  const groupRef = useRef();
  
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(Date.now() * 0.0003) * 0.02;
    }
  });
  
  return (
    <group ref={groupRef}>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a0f2e" roughness={0.8} />
      </mesh>
      
      {/* Floor tiles */}
      {Array.from({ length: 10 }).map((_, i) => (
        Array.from({ length: 10 }).map((_, j) => (
          <mesh key={`tile-${i}-${j}`} rotation={[-Math.PI / 2, 0, 0]} position={[-5 + i * 1.1, -0.48, -5 + j * 1.1]}>
            <planeGeometry args={[0.8, 0.8]} />
            <meshStandardMaterial color={(i + j) % 2 === 0 ? "#2d1b4e" : "#1a0f2e"} roughness={0.9} />
          </mesh>
        ))
      ))}
      
      {/* Walls */}
      <mesh position={[0, 1.5, -6]}>
        <boxGeometry args={[12, 4, 0.5]} />
        <meshStandardMaterial color="#2d1b4e" roughness={0.7} />
      </mesh>
      <mesh position={[6, 1.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[12, 4, 0.5]} />
        <meshStandardMaterial color="#2d1b4e" roughness={0.7} />
      </mesh>
      <mesh position={[-6, 1.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[12, 4, 0.5]} />
        <meshStandardMaterial color="#2d1b4e" roughness={0.7} />
      </mesh>
      
      {/* Bookshelves */}
      {[-3.5, -1.5, 0.5, 2.5, 4.5].map((x, idx) => (
        <group key={`shelf-${idx}`} position={[x, 0, -5]}>
          <mesh position={[0, 1.2, 0]}>
            <boxGeometry args={[1.2, 2.8, 0.3]} />
            <meshStandardMaterial color="#4a2a1a" roughness={0.8} />
          </mesh>
          {[-0.8, 0, 0.8].map((y, sIdx) => (
            <mesh key={`shelf-${idx}-${sIdx}`} position={[0, y, 0]}>
              <boxGeometry args={[1.2, 0.05, 0.5]} />
              <meshStandardMaterial color="#5a3a2a" roughness={0.7} />
            </mesh>
          ))}
          {Array.from({ length: 10 }).map((_, bIdx) => {
            const bookX = -0.4 + (bIdx % 4) * 0.25;
            const bookY = -0.6 + Math.floor(bIdx / 4) * 1.0;
            const bookHeight = 0.2 + Math.random() * 0.2;
            const bookWidth = 0.05 + Math.random() * 0.05;
            const colors = ['#5C6AC4', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#5C6AC4', '#f472b6'];
            return (
              <mesh key={`book-${idx}-${bIdx}`} position={[bookX, bookY, 0.15]}>
                <boxGeometry args={[bookWidth, bookHeight, 0.25]} />
                <meshStandardMaterial color={colors[bIdx % colors.length]} roughness={0.6} />
              </mesh>
            );
          })}
        </group>
      ))}
      
      {/* Floating books */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const radius = 2 + Math.random() * 0.5;
        const time = Date.now() / 1000;
        const colors = ['#fcd34d', '#f472b6', '#60a5fa', '#34d399', '#5C6AC4', '#fb923c'];
        return (
          <group key={`float-${i}`} position={[Math.cos(angle + time * 0.05) * radius, 0.5 + Math.sin(time * 0.3 + i) * 0.3, Math.sin(angle + time * 0.05) * radius - 4]}>
            <mesh>
              <boxGeometry args={[0.2, 0.3, 0.05]} />
              <meshStandardMaterial color={colors[i % colors.length]} emissive={colors[i % colors.length]} emissiveIntensity={0.1} />
            </mesh>
          </group>
        );
      })}
      
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 3, 0]} intensity={0.8} color="#fcd34d" />
      <pointLight position={[-3, 2, -2]} intensity={0.3} color="#5C6AC4" />
      <pointLight position={[3, 2, -2]} intensity={0.3} color="#ec4899" />
      <directionalLight position={[5, 5, 5]} intensity={0.2} />
    </group>
  );
};

// ============================================================
// ===== FIXED VOCABULARY STORY SCENES (NO RANDOMIZATION) =====
// ============================================================
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

// ============================================================
// ===== MAIN GAME COMPONENT =====
// ============================================================
const ShortStoryGame = ({ onBack, updateProgress }) => {
  // ===== GAME STATE =====
  const [gameState, setGameState] = useState('intro');
  const [storyScenes, setStoryScenes] = useState(allScenes);
  const [currentScene, setCurrentScene] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [maxLives] = useState(5);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // ===== PROGRESS TRACKING =====
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAnswers, setTotalAnswers] = useState(0);
  const [sessionSaved, setSessionSaved] = useState(false);
  
  // ===== TIMER =====
  const [timer, setTimer] = useState(15);
  const [timerRunning, setTimerRunning] = useState(false);
  
  // ===== LIVES REFILL =====
  const [lastRefillTime, setLastRefillTime] = useState(Date.now());
  const [timeRemaining, setTimeRemaining] = useState('');
  const [showNoLivesMessage, setShowNoLivesMessage] = useState(false);
  
  // ===== FIREBASE USER =====
  const [currentUser, setCurrentUser] = useState(null);
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  // ===== REFS =====
  const textTimerRef = useRef(null);
  const speechSynthRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const currentTextRef = useRef('');
  const isSpeakingRef = useRef(false);

  // ============================================================
  // ===== FIREBASE AUTH - GET CURRENT USER =====
  // ============================================================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setIsUserLoaded(true);
        console.log('✅ ShortStoryGame: User loaded:', user.uid, user.email);
      } else {
        setCurrentUser(null);
        setIsUserLoaded(true);
        console.log('❌ ShortStoryGame: No user logged in');
      }
    });
    
    return () => unsubscribe();
  }, []);

  // ============================================================
  // ===== SAVE TO FIREBASE =====
  // ============================================================
  const saveGameToFirebase = async (isComplete) => {
    if (!currentUser) {
      console.log('⚠️ No user logged in, skipping Firebase save');
      return;
    }

    const userId = currentUser.uid;
    const totalScenes = storyScenes.length;
    const scenesCompleted = currentScene + 1;
    const pointsEarned = correctAnswers;

    const gameData = {
      gameType: 'shortStory',
      pointsEarned: pointsEarned,
      newWordsLearned: correctAnswers,
      correctAnswers: correctAnswers,
      totalQuestions: totalAnswers,
      won: isComplete || scenesCompleted >= totalScenes / 2,
      score: correctAnswers,
      isComplete: isComplete,
      scenesCompleted: scenesCompleted,
      totalScenes: totalScenes
    };

    try {
      console.log('💾 Saving ShortStory game to Firebase...');
      const result = await updateUserStats(userId, gameData);
      
      if (result.achievements && result.achievements.length > 0) {
        console.log('🏆 New Achievements Unlocked:', result.achievements);
        setFeedbackMessage(`🏆 New Achievements: ${result.achievements.join(', ')} 🎉`);
        setShowFeedback(true);
        setTimeout(() => setShowFeedback(false), 5000);
      }
      
      console.log('✅ ShortStory game saved to Firebase successfully!');
    } catch (error) {
      console.error('❌ Error saving to Firebase:', error);
    }
  };

  // ============================================================
  // ===== LIVES SYSTEM =====
  // ============================================================
  const checkAndRefillLives = () => {
    const now = Date.now();
    const secondsPassed = (now - lastRefillTime) / 1000;
    if (secondsPassed >= REFILL_TIME && lives < maxLives) {
      const newLives = Math.min(lives + 1, maxLives);
      setLives(newLives);
      setLastRefillTime(now);
      localStorage.setItem('storyquest_lives', JSON.stringify({
        lives: newLives,
        lastRefillTime: now
      }));
    }
  };

  const updateTimeRemaining = () => {
    const now = Date.now();
    const elapsed = (now - lastRefillTime) / 1000;
    const remaining = Math.max(0, REFILL_TIME - elapsed);
    if (remaining > 0 && lives < maxLives) {
      const minutes = Math.floor(remaining / 60);
      const seconds = Math.floor(remaining % 60);
      setTimeRemaining(`${minutes}m ${seconds}s`);
    } else if (lives >= maxLives) {
      setTimeRemaining('Full ❤️');
    } else {
      setTimeRemaining('');
    }
  };

  useEffect(() => {
    checkAndRefillLives();
    updateTimeRemaining();
    const interval = setInterval(() => {
      checkAndRefillLives();
      updateTimeRemaining();
    }, 1000);
    return () => clearInterval(interval);
  }, [lives, lastRefillTime, maxLives]);

  useEffect(() => {
    if (lives < maxLives && timeRemaining !== 'Full ❤️') {
      const interval = setInterval(updateTimeRemaining, 1000);
      return () => clearInterval(interval);
    }
  }, [lives, lastRefillTime, maxLives]);

  useEffect(() => {
    if (gameState !== 'intro') {
      localStorage.setItem('storyquest_lives', JSON.stringify({
        lives: lives,
        lastRefillTime: lastRefillTime
      }));
    }
  }, [lives, lastRefillTime, gameState]);

  useEffect(() => {
    const saved = localStorage.getItem('storyquest_lives');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const now = Date.now();
        const secondsPassed = (now - data.lastRefillTime) / 1000;
        if (secondsPassed >= REFILL_TIME && data.lives < maxLives) {
          const newLives = Math.min(data.lives + 1, maxLives);
          setLives(newLives);
          setLastRefillTime(now);
        } else {
          setLives(data.lives);
          setLastRefillTime(data.lastRefillTime);
        }
      } catch (e) {
        setLives(maxLives);
        setLastRefillTime(Date.now());
      }
    } else {
      setLives(maxLives);
      setLastRefillTime(Date.now());
    }
  }, []);

  // ============================================================
  // ===== VOICE NARRATION - FIXED: Sync with typing =====
  // ============================================================
  useEffect(() => {
    if (window.speechSynthesis) {
      speechSynthRef.current = window.speechSynthesis;
    }
    return () => {
      if (speechSynthRef.current) {
        speechSynthRef.current.cancel();
      }
    };
  }, []);

  const speakText = useCallback((text) => {
    if (!isVoiceEnabled || !window.speechSynthesis) return;
    
    // Cancel any ongoing speech
    if (speechSynthRef.current) {
      speechSynthRef.current.cancel();
    }
    
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    
    setTimeout(() => {
      if (!window.speechSynthesis) return;
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;
      utterance.lang = 'en-US';
      utterance.onstart = () => {
        setIsSpeaking(true);
        isSpeakingRef.current = true;
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        isSpeakingRef.current = false;
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        console.log('⚠️ Speech error, continuing...');
      };
      speechSynthRef.current.speak(utterance);
    }, 50);
  }, [isVoiceEnabled]);

  const stopSpeaking = useCallback(() => {
    if (speechSynthRef.current) {
      speechSynthRef.current.cancel();
      setIsSpeaking(false);
      isSpeakingRef.current = false;
    }
  }, []);

  // ============================================================
  // ===== TYPEWRITER EFFECT - FIXED: Voice syncs with typing =====
  // ============================================================
  const typeText = useCallback((text, callback) => {
    // Stop any existing speech
    stopSpeaking();
    
    setIsTyping(true);
    setDisplayText('');
    if (textTimerRef.current) clearInterval(textTimerRef.current);
    
    const textToSpeak = text;
    
    // Start speaking the FULL text immediately (while typing begins)
    if (isVoiceEnabled && textToSpeak) {
      speakText(textToSpeak);
    }
    
    let index = 0;
    
    textTimerRef.current = setInterval(() => {
      if (index < textToSpeak.length) {
        setDisplayText(prev => prev + textToSpeak[index]);
        index++;
      } else {
        clearInterval(textTimerRef.current);
        setIsTyping(false);
        if (callback) callback();
      }
    }, 25);
  }, [isVoiceEnabled, speakText, stopSpeaking]);

  // ============================================================
  // ===== SAVE PROGRESS =====
  // ============================================================
  const saveGameProgress = useCallback((isComplete = false) => {
    if (sessionSaved) return;
    setSessionSaved(true);
    
    const totalScenes = storyScenes.length;
    const scenesCompleted = currentScene + 1;
    const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
    
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
    
    const progressData = {
      gamesPlayed: 1,
      totalPoints: correctAnswers,
      xp: correctAnswers,
      wordsLearned: correctAnswers,
      totalAnswers: totalAnswers,
      correctAnswers: correctAnswers,
      streak: newStreak,
      ShortStorvGame: {
        chaptersRead: scenesCompleted,
        quizzesPassed: correctAnswers,
        storiesCompleted: isComplete ? 1 : 0
      }
    };
    
    console.log('📊 ShortStoryGame: Saving progress:', progressData);
    
    if (updateProgress) {
      updateProgress(progressData)
        .then(() => {
          console.log('✅ ShortStoryGame: Progress saved successfully!');
          console.log('📊 Accuracy:', accuracy, '%');
          console.log('🔥 Streak:', newStreak);
          console.log('📖 Scenes completed:', scenesCompleted);
        })
        .catch(err => {
          console.error('❌ ShortStoryGame: Error saving progress:', err);
        });
    }
  }, [correctAnswers, totalAnswers, currentScene, updateProgress, sessionSaved, storyScenes]);

  // ============================================================
  // ===== TIMER EFFECT =====
  // ============================================================
  useEffect(() => {
    if (timerRunning && timer > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0 && timerRunning) {
      setTimerRunning(false);
      if (selectedChoice === null && lives > 0) {
        const scene = storyScenes[currentScene];
        if (scene && scene.choices) {
          const wrongChoices = scene.choices.filter(c => !c.correct);
          if (wrongChoices.length > 0) {
            const randomWrong = wrongChoices[Math.floor(Math.random() * wrongChoices.length)];
            setSelectedChoice(randomWrong.id);
            setTotalAnswers(prev => prev + 1);
            setShowFeedback(true);
            setFeedbackType('wrong');
            setFeedbackMessage('⏰ Time\'s up! -1 life');
            
            setLives(prev => {
              const newLives = prev - 1;
              if (newLives === 0) {
                setTimeout(() => {
                  saveGameProgress(false);
                  saveGameToFirebase(false);
                  setGameState('gameover');
                  stopSpeaking();
                }, 1500);
              }
              return newLives;
            });
            
            setTimeout(() => {
              setShowFeedback(false);
              setSelectedChoice(null);
              if (lives <= 0) {
                setGameState('gameover');
                stopSpeaking();
                return;
              }
              const nextScene = storyScenes.find(s => s.id === randomWrong.nextScene);
              if (nextScene) {
                setCurrentScene(storyScenes.indexOf(nextScene));
                setTimer(15);
                setTimerRunning(true);
                typeText(nextScene.text);
              }
            }, 1500);
          }
        }
      }
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [timer, timerRunning, selectedChoice, lives, currentScene, storyScenes]);

  // ============================================================
  // ===== START GAME =====
  // ============================================================
  const startGame = () => {
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
    setStoryScenes(allScenes);
    setGameState('playing');
    setCurrentScene(0);
    setScore(0);
    setCorrectAnswers(0);
    setTotalAnswers(0);
    setTimer(15);
    setTimerRunning(true);
    setSelectedChoice(null);
    setSessionSaved(false);
    const scene = storyScenes[0] || allScenes[0];
    if (scene) {
      typeText(scene.text);
    }
  };

  // ============================================================
  // ===== HANDLE CHOICE =====
  // ============================================================
  const handleChoice = (choice) => {
    if (selectedChoice !== null || lives <= 0) return;
    
    stopSpeaking();
    setTimerRunning(false);
    setSelectedChoice(choice.id);
    setTotalAnswers(prev => prev + 1);
    setShowFeedback(true);
    
    if (choice.correct) {
      setFeedbackType('correct');
      setFeedbackMessage('✅ Excellent! You know your vocabulary! +1 point');
      setScore(prev => prev + 1);
      setCorrectAnswers(prev => prev + 1);
    } else {
      setFeedbackType('wrong');
      setFeedbackMessage('❌ Incorrect. Keep learning! -1 life');
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives === 0) {
          setTimeout(() => {
            saveGameProgress(false);
            saveGameToFirebase(false);
            setGameState('gameover');
            stopSpeaking();
          }, 1500);
        }
        return newLives;
      });
    }
    
    setTimeout(() => {
      setShowFeedback(false);
      setSelectedChoice(null);
      if (lives <= 0) {
        setGameState('gameover');
        stopSpeaking();
        return;
      }
      if (choice.nextScene !== undefined) {
        const nextScene = storyScenes.find(s => s.id === choice.nextScene);
        if (nextScene) {
          setCurrentScene(storyScenes.indexOf(nextScene));
          setTimer(15);
          setTimerRunning(true);
          typeText(nextScene.text);
          
          if (nextScene.id === 20) {
            setTimeout(() => {
              saveGameProgress(true);
              saveGameToFirebase(true);
            }, 1000);
          }
        }
      }
    }, 1500);
  };

  // ============================================================
  // ===== RESTART =====
  // ============================================================
  const restartGame = () => {
    stopSpeaking();
    setGameState('intro');
    setCurrentScene(0);
    setScore(0);
    setCorrectAnswers(0);
    setTotalAnswers(0);
    setLives(maxLives);
    setSelectedChoice(null);
    setShowFeedback(false);
    setFeedbackMessage('');
    setIsTyping(false);
    setDisplayText('');
    setTimer(15);
    setTimerRunning(false);
    setShowNoLivesMessage(false);
    setSessionSaved(false);
    setStoryScenes(allScenes);
  };

  // ============================================================
  // ===== EXIT =====
  // ============================================================
  const handleExit = () => {
    if (gameState === 'playing' && !sessionSaved) {
      saveGameProgress(false);
      saveGameToFirebase(false);
    }
    stopSpeaking(); 
    setShowExitConfirm(true);
  };
  
  const confirmExit = () => {
    stopSpeaking(); 
    setShowExitConfirm(false); 
    if (onBack) onBack();
  };
  
  const cancelExit = () => setShowExitConfirm(false);

  // ===== LOADING SCREEN =====
  if (!isUserLoaded) {
    return (
      <div style={{
        minHeight: '100vh', background: '#1E293B',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        fontFamily: "'Poppins', -apple-system, sans-serif"
      }}>
        <div style={{
          maxWidth: '420px', width: '100%', background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '40px',
          border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'white' }}>Loading...</h2>
          <p style={{ fontSize: '14px', color: '#94a3b8' }}>Please wait while we set up your adventure.</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ===== EXIT CONFIRM MODAL =====
  // ============================================================
  const ExitConfirmModal = () => (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px'
    }}>
      <div style={{
        background: 'white', borderRadius: '8px', padding: '32px',
        maxWidth: '380px', width: '100%', textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🚪</div>
        <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>Exit StoryQuest?</h3>
        <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px' }}>Your progress will be saved.</p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={confirmExit} style={{ flex: 1, padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>✅ Yes, Exit</button>
          <button onClick={cancelExit} style={{ flex: 1, padding: '12px', background: '#F8FAFC', color: '#64748B', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>❌ Cancel</button>
        </div>
      </div>
    </div>
  );

  // ============================================================
  // ===== GAME OVER SCREEN =====
  // ============================================================
  if (gameState === 'gameover') {
    const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
    return (
      <div style={{
        minHeight: '100vh', background: '#1E293B',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        fontFamily: "'Poppins', -apple-system, sans-serif"
      }}>
        <div style={{
          maxWidth: '420px', width: '100%', background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '40px',
          border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '8px' }}>💀</div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>Game Over!</h2>
          <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '20px' }}>
            You reached <strong style={{ color: '#fbbf24' }}>Scene {currentScene + 1}</strong> with <strong style={{ color: '#5C6AC4' }}>{correctAnswers}</strong> correct answers!
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '24px' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '12px' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#5C6AC4' }}>{correctAnswers}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Correct</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '12px' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#5C6AC4' }}>{currentScene + 1}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Scenes</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '12px' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#fbbf24' }}>{accuracy}%</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Accuracy</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
            <button onClick={startGame} disabled={lives <= 0} style={{ padding: '14px', background: lives > 0 ? 'linear-gradient(135deg, #5C6AC4, #5C6AC4)' : '#4a4a5a', color: lives > 0 ? 'white' : '#94a3b8', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: '600', cursor: lives > 0 ? 'pointer' : 'not-allowed' }}>{lives > 0 ? '🔄 Play Again' : '⏳ No Lives - Wait 30 mins'}</button>
            <button onClick={() => setGameState('intro')} style={{ padding: '12px', background: 'transparent', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', cursor: 'pointer', fontSize: '14px' }}>← Back to Menu</button>
            <button onClick={onBack} style={{ padding: '12px', background: 'transparent', color: '#64748b', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '14px', cursor: 'pointer', fontSize: '14px' }}>← Exit Game</button>
          </div>
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
        minHeight: '100vh', background: '#1E293B',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        fontFamily: "'Poppins', -apple-system, sans-serif"
      }}>
        {showExitConfirm && <ExitConfirmModal />}
        <div style={{
          maxWidth: '520px', width: '100%', background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '40px',
          border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center'
        }}>
          {currentUser && (
            <div style={{
              background: 'rgba(92, 106, 196, 0.12)',
              padding: '8px 16px',
              borderRadius: '12px',
              marginBottom: '16px',
              display: 'inline-block'
            }}>
              <span style={{ fontSize: '13px', color: '#5C6AC4', fontWeight: '600' }}>
                👤 {currentUser.displayName || currentUser.email || 'Player'}
              </span>
            </div>
          )}

          <div style={{
            width: '120px', height: '120px', margin: '0 auto 16px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #5C6AC4, #5C6AC4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '56px',
            animation: 'float 3s ease-in-out infinite'
          }}>📚</div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'white', marginBottom: '4px' }}>Vocabulary Quest</h1>
          <p style={{ fontSize: '16px', color: '#94a3b8', marginBottom: '4px' }}>The Dictionary of Power</p>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>📖 21 Vocabulary Words • 🎙️ Voice Narration • ⏱️ 15s Timer</p>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px', padding: '8px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <button onClick={() => setIsVoiceEnabled(!isVoiceEnabled)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: isVoiceEnabled ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: isVoiceEnabled ? '#4ade80' : '#f87171', cursor: 'pointer', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isVoiceEnabled ? '🔊 Voice On' : '🔇 Voice Off'}
            </button>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>❤️ {lives}/{maxLives}</span>
            {timeRemaining && lives < maxLives && <span style={{ fontSize: '11px', color: '#f59e0b' }}>⏳ {timeRemaining}</span>}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '24px' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '12px' }}><div style={{ fontSize: '24px', fontWeight: '700', color: '#5C6AC4' }}>🧙</div><div style={{ fontSize: '11px', color: '#94a3b8' }}>3D Character</div></div>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '12px' }}><div style={{ fontSize: '24px', fontWeight: '700', color: '#5C6AC4' }}>📖</div><div style={{ fontSize: '11px', color: '#94a3b8' }}>{allScenes.length} Words</div></div>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '12px' }}><div style={{ fontSize: '24px', fontWeight: '700', color: '#5C6AC4' }}>⏱️</div><div style={{ fontSize: '11px', color: '#94a3b8' }}>15s Timer</div></div>
          </div>
          
          {lives > 0 ? (
            <button onClick={startGame} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #5C6AC4, #5C6AC4)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', boxShadow: 'none' }}>🚀 Begin Vocabulary Adventure</button>
          ) : (
            <div style={{ width: '100%', padding: '16px', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', fontSize: '16px', fontWeight: '600' }}>
              ⏳ No Lives - Come back in {timeRemaining || '30 minutes'}
            </div>
          )}
          <button onClick={onBack} style={{ width: '100%', padding: '12px', marginTop: '8px', background: 'transparent', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', cursor: 'pointer', fontSize: '14px' }}>← Back</button>
        </div>
        <style>{`@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }`}</style>
      </div>
    );
  }

  // ============================================================
  // ===== PLAYING SCREEN =====
  // ============================================================
  if (gameState === 'playing') {
    const scene = storyScenes[currentScene] || allScenes[0];

    // Display exactly maxLives hearts (5)
    const displayHearts = () => {
      const hearts = [];
      for (let i = 0; i < maxLives; i++) {
        hearts.push(i < lives ? '❤️' : '🖤');
      }
      return hearts.join('');
    };

    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        width: '100vw', height: '100vh', background: '#1E293B',
        fontFamily: "'Poppins', -apple-system, sans-serif", overflow: 'hidden'
      }}>
        {showExitConfirm && <ExitConfirmModal />}

        {/* ===== 3D SCENE ===== */}
        <Canvas
          camera={{ position: [4, 3, 6], fov: 45 }}
          style={{ width: '100vw', height: '100vh', background: '#0a0a1a', display: 'block' }}
        >
          <LibraryScene />
          <Character3D 
            emotion={scene.emotion || 'happy'}
            isWalking={currentScene % 2 === 0}
            isSpeaking={isSpeaking}
          />
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            minDistance={2}
            maxDistance={15}
            maxPolarAngle={Math.PI / 1.8}
            target={[0, 0.8, 0]}
            dampingFactor={0.05}
          />
          <Environment preset="night" background={false} />
        </Canvas>

        {/* ===== UI OVERLAY ===== */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          pointerEvents: 'none', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', padding: '16px'
        }}>
          {/* TOP BAR */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 18px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)',
            borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)',
            pointerEvents: 'auto', maxWidth: '900px', width: '100%', margin: '0 auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: 'white', fontSize: '14px' }}>📖 Vocabulary Quest</span>
              <span style={{ padding: '2px 10px', borderRadius: '8px', background: 'rgba(124, 111, 214, 0.2)', color: '#5C6AC4', fontSize: '10px', fontWeight: '600' }}>📚 {storyScenes.length} Words</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button onClick={() => setIsVoiceEnabled(!isVoiceEnabled)} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: isVoiceEnabled ? '#4ade80' : '#f87171' }}>{isVoiceEnabled ? '🔊' : '🔇'}</button>
              <span style={{ fontSize: '14px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '2px' }}>{displayHearts()}</span>
              <span style={{ fontSize: '14px', color: '#fbbf24', fontWeight: '600' }}>⭐ {score}</span>
              <div style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: timer <= 3 ? 'rgba(239, 68, 68, 0.3)' : timer <= 5 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255,255,255,0.1)',
                border: `2px solid ${timer <= 3 ? '#ef4444' : timer <= 5 ? '#f59e0b' : 'rgba(255,255,255,0.2)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: timer <= 3 ? '#ef4444' : timer <= 5 ? '#f59e0b' : 'white',
                fontSize: '13px', fontWeight: '700'
              }}>
                {timer}
              </div>
              <button onClick={handleExit} style={{ padding: '6px 16px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', cursor: 'pointer', fontSize: '13px', fontWeight: '600', pointerEvents: 'auto' }}>✕ Exit</button>
            </div>
          </div>

          {/* BOTTOM UI */}
          <div style={{
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(16px)',
            borderRadius: '16px', padding: '16px 20px',
            border: '1px solid rgba(255,255,255,0.06)',
            pointerEvents: 'auto', maxWidth: '900px', width: '100%',
            margin: '0 auto', maxHeight: '45vh', overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '11px', color: '#94a3b8' }}>
              <span>📖 Word {currentScene + 1} of {storyScenes.length}</span>
              <span style={{ color: '#5C6AC4' }}>❤️ {lives}/{maxLives}</span>
            </div>

            {/* Scene Text Display */}
            <div style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', marginBottom: '10px', minHeight: '50px', maxHeight: '80px', overflow: 'auto' }}>
              <p style={{ color: '#e2e8f0', fontSize: '14px', lineHeight: '1.7', margin: 0 }}>
                {isTyping ? (
                  <span>{displayText}<span style={{ display: 'inline-block', width: '2px', height: '16px', background: '#5C6AC4', animation: 'blink 0.8s step-end infinite' }} /></span>
                ) : (scene.text || 'Loading...')}
                <style>{`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }`}</style>
              </p>
            </div>

            {/* UPDATED: Only shows vocabulary word, no definition/clue */}
            {scene.vocabulary && (
              <div style={{ 
                padding: '6px 12px', 
                background: 'rgba(124, 111, 214, 0.1)', 
                borderRadius: '8px', 
                marginBottom: '10px',
                display: 'inline-block'
              }}>
                <span style={{ 
                  fontSize: '15px', 
                  color: '#5C6AC4', 
                  fontWeight: '600'
                }}>
                  📚 {scene.vocabulary}
                </span>
              </div>
            )}

            {scene.choices && scene.choices.length > 0 && lives > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                {scene.choices.map((choice) => {
                  let bgColor = 'rgba(255,255,255,0.04)', borderColor = 'rgba(255,255,255,0.06)', textColor = '#e2e8f0';
                  if (selectedChoice === choice.id) {
                    if (feedbackType === 'correct') { bgColor = 'rgba(34, 197, 94, 0.2)'; borderColor = '#22c55e'; textColor = '#4ade80'; }
                    else if (feedbackType === 'wrong') { bgColor = 'rgba(239, 68, 68, 0.2)'; borderColor = '#ef4444'; textColor = '#f87171'; }
                  }
                  return (
                    <button key={choice.id} onClick={() => handleChoice(choice)} disabled={selectedChoice !== null || lives <= 0} style={{ padding: '10px 14px', borderRadius: '10px', border: `1px solid ${borderColor}`, background: bgColor, color: textColor, cursor: selectedChoice !== null || lives <= 0 ? 'default' : 'pointer', fontSize: '13px', fontWeight: '500', textAlign: 'center', fontFamily: "'Poppins', sans-serif" }}>
                      <span style={{ fontWeight: '600', marginRight: '6px' }}>{choice.id}.</span>{choice.text}
                      {selectedChoice === choice.id && feedbackType === 'correct' && <span style={{ marginLeft: '6px', color: '#4ade80' }}>✅</span>}
                      {selectedChoice === choice.id && feedbackType === 'wrong' && <span style={{ marginLeft: '6px', color: '#f87171' }}>❌</span>}
                    </button>
                  );
                })}
              </div>
            )}

            {showFeedback && (
              <div style={{ marginTop: '10px', padding: '8px', borderRadius: '10px', background: feedbackType === 'correct' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${feedbackType === 'correct' ? '#22c55e' : '#ef4444'}`, textAlign: 'center', fontSize: '13px', fontWeight: '500', color: feedbackType === 'correct' ? '#4ade80' : '#f87171' }}>
                {feedbackMessage}
              </div>
            )}

            {lives === 0 && (
              <div style={{ marginTop: '10px', padding: '10px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', textAlign: 'center', fontSize: '14px', color: '#f87171' }}>
                💀 No lives left! Game over...
                <button onClick={() => { saveGameProgress(false); saveGameToFirebase(false); setGameState('gameover'); }} style={{ marginLeft: '12px', padding: '4px 16px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#f87171', cursor: 'pointer', fontSize: '12px' }}>End Game</button>
              </div>
            )}
          </div>
        </div>

        {isSpeaking && (
          <div style={{ position: 'absolute', top: '80px', right: '30px', padding: '6px 14px', background: 'rgba(34, 197, 94, 0.15)', backdropFilter: 'blur(10px)', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#4ade80', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', pointerEvents: 'none' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%', animation: 'pulse 0.8s ease-in-out infinite' }} />
            Speaking...
            <style>{`@keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 1; transform: scale(1.3); } }`}</style>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default ShortStoryGame;