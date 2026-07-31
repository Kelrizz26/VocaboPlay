// src/components/dashboard/story-quest/FloatingBook.jsx

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

// ============================================================
// ===== FLOATING BOOK =====
// ===== Each book now animates its own position every frame via
// ===== useFrame (smooth, stable), instead of recomputing a random
// ===== position on every React re-render (which caused the jumpy /
// ===== unstable look whenever the typewriter effect updated text). =====
// ============================================================
export const FLOATING_BOOK_COLORS = ['#fcd34d', '#f472b6', '#60a5fa', '#34d399', '#5C6AC4', '#fb923c'];

const FloatingBook = React.memo(({ index }) => {
  const meshRef = useRef();
  const angle = (index / 6) * Math.PI * 2;
  // Radius is randomized once per book instance (stable ref), not every render
  const radiusRef = useRef(2 + Math.random() * 0.5);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime;
      const radius = radiusRef.current;
      meshRef.current.position.x = Math.cos(angle + t * 0.05) * radius;
      meshRef.current.position.z = Math.sin(angle + t * 0.05) * radius - 4;
      meshRef.current.position.y = 0.5 + Math.sin(t * 0.3 + index) * 0.3;
    }
  });

  const color = FLOATING_BOOK_COLORS[index % FLOATING_BOOK_COLORS.length];

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[0.2, 0.3, 0.05]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.1} />
    </mesh>
  );
});

export default FloatingBook;