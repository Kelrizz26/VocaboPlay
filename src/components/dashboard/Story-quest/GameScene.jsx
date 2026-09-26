import React, { memo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import LibraryScene from './LibraryScene';
import Character3D from './Character3D';

// ===== SEPARATE 3D SCENE COMPONENT - Memoized para hindi mag-render kada text update =====
const GameScene = memo(({ emotion, isWalking, isSpeaking }) => {
  return (
    <Canvas
      camera={{ position: [4, 3, 6], fov: 45 }}
      dpr={[1, 1]}
      style={{ 
        width: '100vw', 
        height: '100vh', 
        background: '#0a0a1a', 
        display: 'block',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 0
      }}
    >
      <LibraryScene />
      <Character3D
        emotion={emotion || 'happy'}
        isWalking={isWalking}
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
    </Canvas>
  );
});

export default GameScene;