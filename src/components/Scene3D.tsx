import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Line } from '@react-three/drei';
import * as THREE from 'three';
import { type Point3D, type Obstacle } from '../lib/pathfinding';

interface DroneProps {
  position: Point3D;
  isFlying: boolean;
}

function Drone({ position, isFlying }: DroneProps) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current && isFlying) {
      // Slight hover animation
      meshRef.current.position.y = position.y + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      // Propeller rotation effect via scale pulse
      const scale = 1 + Math.sin(state.clock.elapsedTime * 20) * 0.02;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group ref={meshRef} position={[position.x, position.y, position.z]}>
      {/* Main body */}
      <mesh>
        <boxGeometry args={[0.6, 0.15, 0.6]} />
        <meshStandardMaterial color="#22c55e" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Arms */}
      {[
        [0.4, 0, 0.4],
        [0.4, 0, -0.4],
        [-0.4, 0, 0.4],
        [-0.4, 0, -0.4],
      ].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
            <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.02, 16]} />
            <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

interface ObstaclesProps {
  obstacles: Obstacle[];
}

function Obstacles({ obstacles }: ObstaclesProps) {
  return (
    <>
      {obstacles.map((obs, i) => (
        <mesh key={i} position={[obs.position.x, obs.position.y, obs.position.z]}>
          <boxGeometry args={[obs.size.x, obs.size.y, obs.size.z]} />
          <meshStandardMaterial
            color="#ef4444"
            transparent
            opacity={0.7}
            metalness={0.3}
            roughness={0.7}
          />
        </mesh>
      ))}
    </>
  );
}

interface PathLineProps {
  path: Point3D[];
  color: string;
  lineWidth?: number;
}

function PathLine({ path, color, lineWidth = 3 }: PathLineProps) {
  const points = useMemo(
    () => path.map((p) => new THREE.Vector3(p.x, p.y, p.z)),
    [path]
  );

  if (points.length < 2) return null;

  return (
    <Line
      points={points}
      color={color}
      lineWidth={lineWidth}
      dashed={false}
    />
  );
}

interface ExploredPointsProps {
  points: Point3D[];
}

function ExploredPoints({ points }: ExploredPointsProps) {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(points.length * 3);
    points.forEach((p, i) => {
      positions[i * 3] = p.x;
      positions[i * 3 + 1] = p.y;
      positions[i * 3 + 2] = p.z;
    });
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [points]);

  return (
    <points geometry={geometry}>
      <pointsMaterial color="#3b82f6" size={0.15} transparent opacity={0.4} />
    </points>
  );
}

interface TargetMarkerProps {
  position: Point3D;
  color: string;
}

function TargetMarker({ position, color }: TargetMarkerProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef} position={[position.x, position.y, position.z]}>
      <octahedronGeometry args={[0.3, 0]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
    </mesh>
  );
}

interface Scene3DProps {
  dronePosition: Point3D;
  targetPosition: Point3D;
  obstacles: Obstacle[];
  path: Point3D[];
  smoothedPath: Point3D[];
  explored: Point3D[];
  gridSize: Point3D;
  isFlying: boolean;
  showExplored: boolean;
}

export function Scene3D({
  dronePosition,
  targetPosition,
  obstacles,
  path,
  smoothedPath,
  explored,
  gridSize,
  isFlying,
  showExplored,
}: Scene3DProps) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  useEffect(() => {
    // Reset camera on mount
    if (cameraRef.current) {
      cameraRef.current.position.set(gridSize.x / 2, gridSize.y + 5, gridSize.z + 10);
      cameraRef.current.lookAt(gridSize.x / 2, gridSize.y / 2, gridSize.z / 2);
    }
  }, [gridSize]);

  return (
    <Canvas
      camera={{ position: [gridSize.x / 2, gridSize.y + 5, gridSize.z + 10], fov: 60 }}
      style={{ background: '#0a0a1a' }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 20, 10]} intensity={1} />
      <pointLight position={[-10, 20, -10]} intensity={0.5} />

      {/* Ground grid */}
      <Grid
        position={[gridSize.x / 2, 0, gridSize.z / 2]}
        args={[gridSize.x, gridSize.z]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#2a2a4a"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#4a4a6a"
        fadeDistance={50}
        fadeStrength={1}
      />

      {/* Bounding box wireframe */}
      <lineSegments position={[gridSize.x / 2, gridSize.y / 2, gridSize.z / 2]}>
        <edgesGeometry args={[new THREE.BoxGeometry(gridSize.x, gridSize.y, gridSize.z)]} />
        <lineBasicMaterial color="#3a3a5a" transparent opacity={0.5} />
      </lineSegments>

      {/* Obstacles */}
      <Obstacles obstacles={obstacles} />

      {/* Explored points */}
      {showExplored && explored.length > 0 && <ExploredPoints points={explored} />}

      {/* Path */}
      {path.length > 1 && <PathLine path={path} color="#8b5cf6" lineWidth={2} />}

      {/* Smoothed path */}
      {smoothedPath.length > 1 && (
        <PathLine path={smoothedPath} color="#22c55e" lineWidth={4} />
      )}

      {/* Target marker */}
      <TargetMarker position={targetPosition} color="#eab308" />

      {/* Drone */}
      <Drone position={dronePosition} isFlying={isFlying} />

      <OrbitControls
        target={[gridSize.x / 2, gridSize.y / 2, gridSize.z / 2]}
        maxPolarAngle={Math.PI / 2}
        minDistance={5}
        maxDistance={50}
      />
    </Canvas>
  );
}
