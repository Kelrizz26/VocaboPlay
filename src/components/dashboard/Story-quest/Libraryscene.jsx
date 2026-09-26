import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import FloatingBook from './FloatingBook';

const LibraryScene = React.memo(() => {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.02;
    }
  });

  const shelfBooks = useMemo(() => {
    return [-3.5, -1.5, 0.5, 2.5, 4.5].map(() => (
      Array.from({ length: 10 }).map(() => ({
        height: 0.2 + Math.random() * 0.2,
        width: 0.05 + Math.random() * 0.05
      }))
    ));
  }, []);

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
          {shelfBooks[idx].map((book, bIdx) => {
            const bookX = -0.4 + (bIdx % 4) * 0.25;
            const bookY = -0.6 + Math.floor(bIdx / 4) * 1.0;
            const colors = ['#5C6AC4', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#5C6AC4', '#f472b6'];
            return (
              <mesh key={`book-${idx}-${bIdx}`} position={[bookX, bookY, 0.15]}>
                <boxGeometry args={[book.width, book.height, 0.25]} />
                <meshStandardMaterial color={colors[bIdx % colors.length]} roughness={0.6} />
              </mesh>
            );
          })}
        </group>
      ))}

      {/* Floating books */}
      {Array.from({ length: 6 }).map((_, i) => (
        <FloatingBook key={`float-${i}`} index={i} />
      ))}

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 3, 0]} intensity={0.8} color="#fcd34d" />
      <pointLight position={[-3, 2, -2]} intensity={0.3} color="#5C6AC4" />
      <pointLight position={[3, 2, -2]} intensity={0.3} color="#ec4899" />
      <directionalLight position={[5, 5, 5]} intensity={0.2} />
    </group>
  );
});

export default LibraryScene;