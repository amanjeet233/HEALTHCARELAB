import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, Box, Sphere, Cylinder } from '@react-three/drei';
import React, { useRef, Suspense } from 'react';
import * as THREE from 'three';

const Microscope: React.FC = () => {
    const group = useRef<THREE.Group>(null);

    useFrame(() => {
        if (group.current) {
            group.current.rotation.y += 0.005;
        }
    });

    return (
        <group ref={group} rotation={[0.2, 0, 0]}>
            {/* Base */}
            <Box args={[3, 0.4, 3]} position={[0, -2, 0]}>
                <meshStandardMaterial color="#08555F" roughness={0.2} metalness={0.8} />
            </Box>

            {/* Arm */}
            <mesh position={[-1, 0, 0]} rotation={[0, 0, 0.2]}>
                <boxGeometry args={[0.5, 4, 0.5]} />
                <meshStandardMaterial color="#83B2BF" roughness={0.1} metalness={0.9} />
            </mesh>

            {/* Stage */}
            <Box args={[2, 0.1, 2]} position={[0, -0.5, 0]}>
                <meshStandardMaterial color="#0D2320" />
            </Box>

            {/* Lens Tube */}
            <group position={[0.5, 1, 0]} rotation={[0, 0, -0.5]}>
                <Cylinder args={[0.4, 0.4, 3, 32]}>
                    <meshStandardMaterial color="#08555F" roughness={0.2} metalness={1} />
                </Cylinder>
                <Cylinder args={[0.2, 0.2, 0.5, 32]} position={[0, 1.7, 0]}>
                    <meshStandardMaterial color="#D0E5EE" emissive="#D0E5EE" emissiveIntensity={0.5} />
                </Cylinder>
            </group>

            {/* Adjustment Knobs */}
            <Sphere args={[0.3, 16, 16]} position={[-0.8, -0.5, 0.5]}>
                <meshStandardMaterial color="#0D2320" metalness={1} roughness={0} />
            </Sphere>
        </group>
    );
};

const Microscope3D: React.FC<{ className?: string }> = React.memo(({ className }) => {
    return (
        <div className={`w-full h-full min-h-[500px] ${className}`}>
            <Canvas
                frameloop="demand"
                dpr={[1, 1]}
                performance={{ min: 0.5 }}
                gl={{ powerPreference: 'high-performance' }}
            >
                <Suspense fallback={<div className="h-full w-full flex items-center justify-center bg-transparent" />}>
                    <PerspectiveCamera makeDefault position={[0, 0, 10]} />
                    <ambientLight intensity={0.4} />
                    <pointLight position={[5, 5, 5]} intensity={1.5} />
                    <spotLight position={[-5, 5, 5]} intensity={1} angle={0.3} penumbra={1} />

                    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
                        <Microscope />
                    </Float>
                </Suspense>
            </Canvas>
        </div>
    );
});

export default Microscope3D;
