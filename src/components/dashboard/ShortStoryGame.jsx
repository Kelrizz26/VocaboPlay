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
// ===== STORY SCENES DATA =====
// ============================================================
const storyScenes = [
  {
    id: 0, narrator: "A powerful Queen", emotion: 'curious',
    text: "In the heart of the old kingdom, there was a library that no one had entered for a hundred years. Queen Elara stood before its ancient doors.",
    choices: [
      { id: 'A', text: '🔓 Try to open the door', nextScene: 1, correct: true },
      { id: 'B', text: '🔍 Look for another entrance', nextScene: 2, correct: false },
      { id: 'C', text: '📖 Read the inscription', nextScene: 3, correct: false }
    ],
    vocabulary: 'Ancient', wordDefinition: 'Very old or belonging to a time long past'
  },
  {
    id: 1, narrator: "The Mysterious Door", emotion: 'determined',
    text: "The Queen pushed the heavy door. It creaked open, revealing a vast hall filled with books that seemed to glow with their own light.",
    choices: [
      { id: 'A', text: '📚 Explore the bookshelves', nextScene: 4, correct: true },
      { id: 'B', text: '🔦 Look for a light source', nextScene: 5, correct: false },
      { id: 'C', text: '👻 Call out to see if anyone is there', nextScene: 6, correct: false }
    ],
    vocabulary: 'Illuminate', wordDefinition: 'To light up or make something brighter'
  },
  {
    id: 2, narrator: "The Secret Passage", emotion: 'sneaky',
    text: "The Queen found a hidden passage behind a tapestry. It led to a small room filled with scrolls and ancient maps.",
    choices: [
      { id: 'A', text: '🗺️ Study the maps', nextScene: 4, correct: true },
      { id: 'B', text: '📜 Read the scrolls', nextScene: 5, correct: false },
      { id: 'C', text: '🚪 Go back to the main hall', nextScene: 1, correct: false }
    ],
    vocabulary: 'Discover', wordDefinition: 'To find something unexpectedly'
  },
  {
    id: 3, narrator: "The Inscription", emotion: 'thinking',
    text: '"Only those who seek knowledge shall find it," the inscription read. The Queen realized this was a test of her determination.',
    choices: [
      { id: 'A', text: '🔑 Try the door again', nextScene: 1, correct: false },
      { id: 'B', text: '🔍 Look for clues', nextScene: 2, correct: false },
      { id: 'C', text: '📖 Speak the words aloud', nextScene: 4, correct: true }
    ],
    vocabulary: 'Determination', wordDefinition: 'The quality of being determined'
  },
  {
    id: 4, narrator: "The Heart of the Library", emotion: 'amazed',
    text: "The Queen discovered the heart of the library - a magnificent room where books floated and whispered their secrets.",
    choices: [
      { id: 'A', text: '📖 Read a floating book', nextScene: 7, correct: true },
      { id: 'B', text: '🔮 Touch the glowing orb', nextScene: 8, correct: false },
      { id: 'C', text: '🕊️ Follow the whispering voices', nextScene: 9, correct: false }
    ],
    vocabulary: 'Wisdom', wordDefinition: 'The quality of having experience and knowledge'
  },
  {
    id: 5, narrator: "The Dark Corner", emotion: 'scared',
    text: "In the darkest corner, the Queen found a book that seemed to be alive. It pulsed with strange energy.",
    choices: [
      { id: 'A', text: '📖 Open the book', nextScene: 7, correct: false },
      { id: 'B', text: '🔮 Try to understand its power', nextScene: 8, correct: true },
      { id: 'C', text: '🚫 Leave it alone', nextScene: 9, correct: false }
    ],
    vocabulary: 'Mysterious', wordDefinition: 'Difficult to understand or explain'
  },
  {
    id: 6, narrator: "The Echo", emotion: 'confused',
    text: "The Queen's voice echoed through the halls. She realized the library had been waiting for someone brave enough to enter.",
    choices: [
      { id: 'A', text: '🎵 Sing a song', nextScene: 7, correct: false },
      { id: 'B', text: '📖 Speak your name', nextScene: 8, correct: true },
      { id: 'C', text: '🌙 Wait for the moon', nextScene: 9, correct: false }
    ],
    vocabulary: 'Courage', wordDefinition: 'The ability to do something that frightens one'
  },
  {
    id: 7, narrator: "The Guardian Spirit", emotion: 'wise',
    text: "A guardian spirit appeared. 'You have shown great courage, Queen. Continue your journey, for knowledge is endless.'",
    choices: [
      { id: 'A', text: '📖 Continue exploring', nextScene: 8, correct: true },
      { id: 'B', text: '🔮 Ask for a blessing', nextScene: 9, correct: false },
      { id: 'C', text: '🕊️ Thank the guardian', nextScene: 0, correct: false }
    ],
    vocabulary: 'Guardian', wordDefinition: 'A person who protects or defends something'
  },
  {
    id: 8, narrator: "The Queen's Vision", emotion: 'glowing',
    text: "The book pulsed with ancient power. The Queen felt a surge of energy as she touched it. She saw visions of the library's past.",
    choices: [
      { id: 'A', text: '📖 Embrace the vision', nextScene: 9, correct: true },
      { id: 'B', text: '🔮 Try to control the power', nextScene: 10, correct: false },
      { id: 'C', text: '🚫 Close the book and step back', nextScene: 11, correct: false }
    ],
    vocabulary: 'Vision', wordDefinition: 'A mental image of something'
  },
  {
    id: 9, narrator: "The Whispering Voice", emotion: 'awakened',
    text: "A voice whispered: 'The library is alive, and it remembers everything. Seek the Chamber of Echoes to unlock its greatest secret.'",
    choices: [
      { id: 'A', text: '🔍 Find the Chamber of Echoes', nextScene: 10, correct: true },
      { id: 'B', text: '📖 Search for more clues', nextScene: 11, correct: false },
      { id: 'C', text: '🕊️ Wait for the voice to speak again', nextScene: 12, correct: false }
    ],
    vocabulary: 'Chamber', wordDefinition: 'A large room or hall'
  },
  {
    id: 10, narrator: "The Chamber of Echoes", emotion: 'amazed',
    text: "The Queen found the Chamber of Echoes - a vast circular room where every whisper repeated a thousand times.",
    choices: [
      { id: 'A', text: '📖 Read the glowing book', nextScene: 11, correct: true },
      { id: 'B', text: '🔮 Listen to the echoes', nextScene: 12, correct: false },
      { id: 'C', text: '🕊️ Call out to the library', nextScene: 13, correct: false }
    ],
    vocabulary: 'Echo', wordDefinition: 'A sound that is repeated'
  },
  {
    id: 11, narrator: "The Magic Orb", emotion: 'curious',
    text: "The Queen touched the glowing orb. It showed her the history of the library - how it was built by ancient scholars.",
    choices: [
      { id: 'A', text: '📖 Explore the library\'s history', nextScene: 12, correct: true },
      { id: 'B', text: '🔮 Ask the orb a question', nextScene: 13, correct: false },
      { id: 'C', text: '🕊️ Share the vision with others', nextScene: 14, correct: false }
    ],
    vocabulary: 'Preserve', wordDefinition: 'To maintain or keep safe from harm'
  },
  {
    id: 12, narrator: "The Queen's Trial", emotion: 'determined',
    text: "The library presented the Queen with a final trial - she had to prove her worth by solving the riddle of the infinite pages.",
    choices: [
      { id: 'A', text: '📖 Solve the riddle', nextScene: 13, correct: true },
      { id: 'B', text: '🔮 Ask for help from the library', nextScene: 14, correct: false },
      { id: 'C', text: '🕊️ Trust your instincts', nextScene: 15, correct: false }
    ],
    vocabulary: 'Riddle', wordDefinition: 'A question requiring ingenuity to find its answer'
  },
  {
    id: 13, narrator: "The Infinite Pages", emotion: 'curious',
    text: "The Queen opened the infinite book. It contained every story ever written and every story that would ever be written.",
    choices: [
      { id: 'A', text: '📖 Read a random page', nextScene: 14, correct: true },
      { id: 'B', text: '🔮 Search for a specific story', nextScene: 15, correct: false },
      { id: 'C', text: '🕊️ Close the book and reflect', nextScene: 16, correct: false }
    ],
    vocabulary: 'Possibility', wordDefinition: 'Something that is possible or may happen'
  },
  {
    id: 14, narrator: "The Library's Spirit", emotion: 'wise',
    text: "The spirit of the library appeared. 'You have proven yourself worthy, Queen. The knowledge of the ages is now yours to explore.'",
    choices: [
      { id: 'A', text: '📖 Begin your eternal exploration', nextScene: 15, correct: true },
      { id: 'B', text: '🔮 Ask for a specific boon', nextScene: 16, correct: false },
      { id: 'C', text: '🕊️ Share this gift with the world', nextScene: 17, correct: false }
    ],
    vocabulary: 'Eternal', wordDefinition: 'Lasting or existing forever'
  },
  {
    id: 15, narrator: "The Eternal Queen", emotion: 'glowing',
    text: "The Queen became the Eternal Guardian - a protector of infinite knowledge. She would spend her days exploring the endless library.",
    choices: [
      { id: 'A', text: '📖 Continue exploring', nextScene: 16, correct: true },
      { id: 'B', text: '🔮 Seek deeper secrets', nextScene: 17, correct: false },
      { id: 'C', text: '🕊️ Share your knowledge with others', nextScene: 18, correct: false }
    ],
    vocabulary: 'Eternal', wordDefinition: 'Lasting or existing forever'
  },
  {
    id: 16, narrator: "The Wisdom of Ages", emotion: 'thinking',
    text: "The Queen accessed the wisdom of ages - the combined knowledge of every scholar who had ever entered the library.",
    choices: [
      { id: 'A', text: '📖 Read the collective memory', nextScene: 17, correct: true },
      { id: 'B', text: '🔮 Ask the collective a question', nextScene: 18, correct: false },
      { id: 'C', text: '🕊️ Share the wisdom with the world', nextScene: 19, correct: false }
    ],
    vocabulary: 'Collective', wordDefinition: 'Done by people acting as a group'
  },
  {
    id: 17, narrator: "The Library's Guardian", emotion: 'wise',
    text: "The Queen was appointed as the new Guardian of the Library. She would protect the ancient knowledge and guide future seekers.",
    choices: [
      { id: 'A', text: '📖 Begin your guardianship', nextScene: 18, correct: true },
      { id: 'B', text: '🔮 Explore hidden sections', nextScene: 19, correct: false },
      { id: 'C', text: '🕊️ Invite others to learn', nextScene: 20, correct: false }
    ],
    vocabulary: 'Guardian', wordDefinition: 'A person who protects or defends something'
  },
  {
    id: 18, narrator: "The Infinite Journey", emotion: 'happy',
    text: "The Queen's journey continued, with new discoveries around every corner. The library was infinite, and so was her thirst for knowledge.",
    choices: [
      { id: 'A', text: '📖 Continue the adventure', nextScene: 19, correct: true },
      { id: 'B', text: '🔮 Seek the library\'s oldest secret', nextScene: 20, correct: false },
      { id: 'C', text: '🕊️ Rest and reflect on your journey', nextScene: 0, correct: false }
    ],
    vocabulary: 'Adventure', wordDefinition: 'An exciting and unusual experience'
  },
  {
    id: 19, narrator: "The Oldest Secret", emotion: 'curious',
    text: "The Queen discovered the library's oldest secret - a book written by the founder herself. It revealed the true purpose of the library.",
    choices: [
      { id: 'A', text: '📖 Read the founder\'s book', nextScene: 20, correct: true },
      { id: 'B', text: '🔮 Pass the knowledge forward', nextScene: 0, correct: false },
      { id: 'C', text: '🕊️ Keep the secret safe', nextScene: 18, correct: false }
    ],
    vocabulary: 'Preserve', wordDefinition: 'To maintain or keep safe from harm'
  },
  {
    id: 20, narrator: "The New Beginning", emotion: 'awakened',
    text: "Every ending is a new beginning. The Queen closed one book and opened another, ready for the next chapter of her endless adventure.",
    choices: [
      { id: 'A', text: '📖 Start a new chapter', nextScene: 0, correct: true },
      { id: 'B', text: '🔮 Search for something new', nextScene: 18, correct: false },
      { id: 'C', text: '🕊️ Share your story with the world', nextScene: 17, correct: false }
    ],
    vocabulary: 'Beginning', wordDefinition: 'The point at which something starts'
  }
];

// ============================================================
// ===== MAIN GAME COMPONENT =====
// ============================================================
const ShortStoryGame = ({ onBack, updateProgress }) => {
  // ===== GAME STATE =====
  const [gameState, setGameState] = useState('intro');
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
  // ===== ✅ NEW: SAVE TO FIREBASE =====
  // ============================================================
  const saveGameToFirebase = async (isComplete) => {
    if (!currentUser) {
      console.log('⚠️ No user logged in, skipping Firebase save');
      return;
    }

    const userId = currentUser.uid;
    const totalScenes = storyScenes.length;
    const scenesCompleted = currentScene + 1;
    const pointsEarned = score;

    const gameData = {
      gameType: 'shortStory',
      pointsEarned: pointsEarned,
      newWordsLearned: correctAnswers, // Each correct = new word learned
      correctAnswers: correctAnswers,
      totalQuestions: totalAnswers,
      won: isComplete || scenesCompleted >= totalScenes / 2,
      score: score,
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
  // ===== VOICE NARRATION =====
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
    if (speechSynthRef.current) speechSynthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    utterance.lang = 'en-US';
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    speechSynthRef.current.speak(utterance);
  }, [isVoiceEnabled]);

  const stopSpeaking = useCallback(() => {
    if (speechSynthRef.current) {
      speechSynthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // ============================================================
  // ===== TYPEWRITER EFFECT =====
  // ============================================================
  const typeText = useCallback((text, callback) => {
    setIsTyping(true);
    setDisplayText('');
    if (textTimerRef.current) clearInterval(textTimerRef.current);
    if (isVoiceEnabled) speakText(text);
    let index = 0;
    textTimerRef.current = setInterval(() => {
      if (index < text.length) {
        setDisplayText(prev => prev + text[index]);
        index++;
      } else {
        clearInterval(textTimerRef.current);
        setIsTyping(false);
        if (callback) callback();
      }
    }, 18);
  }, [isVoiceEnabled, speakText]);

  // ============================================================
  // ===== SAVE PROGRESS - UPDATED with ShortStorvGame =====
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
    
    // ✅ UPDATED: Use ShortStorvGame to match Firebase
    const progressData = {
      gamesPlayed: 1,
      totalPoints: score,
      xp: score,
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
  }, [score, correctAnswers, totalAnswers, currentScene, updateProgress, sessionSaved]);

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
        setLives(prev => {
          const newLives = prev - 1;
          setTotalAnswers(prevTotal => prevTotal + 1);
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
        setFeedbackType('wrong');
        setFeedbackMessage('⏰ Time\'s up! -1 life');
        setShowFeedback(true);
        setTimeout(() => {
          setShowFeedback(false);
        }, 1500);
      }
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [timer, timerRunning, selectedChoice, lives]);

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
    setGameState('playing');
    setCurrentScene(0);
    setScore(0);
    setCorrectAnswers(0);
    setTotalAnswers(0);
    setTimer(15);
    setTimerRunning(true);
    setSelectedChoice(null);
    setSessionSaved(false);
    const scene = storyScenes[0];
    if (scene) {
      typeText(scene.text);
    }
  };

  // ============================================================
  // ===== HANDLE CHOICE - UPDATED: 1 point only =====
  // ============================================================
  const handleChoice = (choice) => {
    if (selectedChoice !== null || lives <= 0) return;
    setTimerRunning(false);
    stopSpeaking();
    setSelectedChoice(choice.id);
    setTotalAnswers(prev => prev + 1);
    setShowFeedback(true);
    
    if (choice.correct) {
      setFeedbackType('correct');
      setFeedbackMessage('✅ Excellent choice! +1 point'); // CHANGED from +10 to +1
      setScore(prev => prev + 1); // CHANGED from +10 to +1
      setCorrectAnswers(prev => prev + 1);
    } else {
      setFeedbackType('wrong');
      setFeedbackMessage('❌ Not quite. -1 life');
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
            You reached <strong style={{ color: '#fbbf24' }}>Scene {currentScene + 1}</strong> with <strong style={{ color: '#5C6AC4' }}>{score}</strong> points!
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '24px' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '12px' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#5C6AC4' }}>{score}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Score</div>
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
          }}>📖</div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'white', marginBottom: '4px' }}>Story Quest</h1>
          <p style={{ fontSize: '16px', color: '#94a3b8', marginBottom: '4px' }}>The Infinite Library</p>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>🏛️ 3D World • 🎙️ Voice Narration • ⏱️ 15s Timer</p>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px', padding: '8px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <button onClick={() => setIsVoiceEnabled(!isVoiceEnabled)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: isVoiceEnabled ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: isVoiceEnabled ? '#4ade80' : '#f87171', cursor: 'pointer', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isVoiceEnabled ? '🔊 Voice On' : '🔇 Voice Off'}
            </button>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>❤️ {lives}/{maxLives}</span>
            {timeRemaining && lives < maxLives && <span style={{ fontSize: '11px', color: '#f59e0b' }}>⏳ {timeRemaining}</span>}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '24px' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '12px' }}><div style={{ fontSize: '24px', fontWeight: '700', color: '#5C6AC4' }}>🧙</div><div style={{ fontSize: '11px', color: '#94a3b8' }}>3D Character</div></div>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '12px' }}><div style={{ fontSize: '24px', fontWeight: '700', color: '#5C6AC4' }}>♾️</div><div style={{ fontSize: '11px', color: '#94a3b8' }}>{storyScenes.length} Scenes</div></div>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '12px' }}><div style={{ fontSize: '24px', fontWeight: '700', color: '#5C6AC4' }}>⏱️</div><div style={{ fontSize: '11px', color: '#94a3b8' }}>15s Timer</div></div>
          </div>
          
          {lives > 0 ? (
            <button onClick={startGame} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #5C6AC4, #5C6AC4)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', boxShadow: 'none' }}>🚀 Begin Adventure</button>
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
    const scene = storyScenes[currentScene] || storyScenes[0];

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
              <span style={{ fontWeight: '600', color: 'white', fontSize: '14px' }}>📖 StoryQuest</span>
              <span style={{ padding: '2px 10px', borderRadius: '8px', background: 'rgba(124, 111, 214, 0.2)', color: '#5C6AC4', fontSize: '10px', fontWeight: '600' }}>♾️ {storyScenes.length} Scenes</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button onClick={() => setIsVoiceEnabled(!isVoiceEnabled)} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: isVoiceEnabled ? '#4ade80' : '#f87171' }}>{isVoiceEnabled ? '🔊' : '🔇'}</button>
              <span style={{ fontSize: '14px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '2px' }}>❤️ {Array(Math.max(0, lives)).fill('❤️').join('')}{Array(Math.max(0, maxLives - lives)).fill('🖤').join('')}</span>
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
              <span>📖 Scene {currentScene + 1} of {storyScenes.length}</span>
              <span style={{ color: '#5C6AC4' }}>❤️ {lives}/{maxLives}</span>
            </div>

            <div style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', marginBottom: '10px', minHeight: '50px', maxHeight: '80px', overflow: 'auto' }}>
              <p style={{ color: '#e2e8f0', fontSize: '14px', lineHeight: '1.7', margin: 0 }}>
                {isTyping ? (
                  <span>{displayText}<span style={{ display: 'inline-block', width: '2px', height: '16px', background: '#5C6AC4', animation: 'blink 0.8s step-end infinite' }} /></span>
                ) : (scene.text || 'Loading...')}
                <style>{`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }`}</style>
              </p>
            </div>

            {scene.vocabulary && (
              <div style={{ padding: '6px 12px', background: 'rgba(124, 111, 214, 0.1)', borderRadius: '8px', marginBottom: '10px', border: '1px solid rgba(124, 111, 214, 0.2)' }}>
                <div style={{ fontSize: '12px', color: '#5C6AC4', fontWeight: '600' }}>📚 <strong>{scene.vocabulary}</strong><span style={{ color: '#94a3b8', fontWeight: '400', marginLeft: '8px' }}>{scene.wordDefinition}</span></div>
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