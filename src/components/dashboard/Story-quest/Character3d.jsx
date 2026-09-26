import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';

const Character3D = React.memo(({ emotion, isWalking, isSpeaking }) => {
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
});

export default Character3D;