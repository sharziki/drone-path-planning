import { useState, useCallback, useEffect, useRef } from 'react';
import { Scene3D } from './components/Scene3D';
import { ControlPanel } from './components/ControlPanel';
import {
  findPath,
  smoothPath,
  generateObstacles,
  type Point3D,
  type Obstacle,
} from './lib/pathfinding';

const GRID_SIZE: Point3D = { x: 20, y: 10, z: 20 };
const INITIAL_START: Point3D = { x: 2, y: 2, z: 2 };
const INITIAL_TARGET: Point3D = { x: 18, y: 8, z: 18 };

function App() {
  const [dronePosition, setDronePosition] = useState<Point3D>(INITIAL_START);
  const [targetPosition] = useState<Point3D>(INITIAL_TARGET);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [path, setPath] = useState<Point3D[]>([]);
  const [smoothedPath, setSmoothedPath] = useState<Point3D[]>([]);
  const [explored, setExplored] = useState<Point3D[]>([]);
  const [isFlying, setIsFlying] = useState(false);
  const [isPlanning, setIsPlanning] = useState(false);
  const [showExplored, setShowExplored] = useState(false);
  const [obstacleCount, setObstacleCount] = useState(20);

  const flightIndexRef = useRef(0);
  const animationRef = useRef<number | null>(null);

  // Initialize obstacles
  useEffect(() => {
    const newObstacles = generateObstacles(
      obstacleCount,
      GRID_SIZE,
      INITIAL_START,
      INITIAL_TARGET
    );
    setObstacles(newObstacles);
  }, []);

  // Plan path using A*
  const handlePlanPath = useCallback(() => {
    setIsPlanning(true);
    setPath([]);
    setSmoothedPath([]);
    setExplored([]);

    // Use setTimeout to allow UI to update
    setTimeout(() => {
      const result = findPath(
        dronePosition,
        targetPosition,
        obstacles,
        GRID_SIZE,
        1,
        0.5
      );

      setPath(result.path);
      setExplored(result.explored);

      if (result.success && result.path.length > 0) {
        const smooth = smoothPath(result.path, 5);
        setSmoothedPath(smooth);
      }

      setIsPlanning(false);
    }, 50);
  }, [dronePosition, targetPosition, obstacles]);

  // Start/stop flight animation
  const handleStartFlight = useCallback(() => {
    if (isFlying) {
      // Stop flight
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      setIsFlying(false);
      return;
    }

    if (smoothedPath.length === 0) return;

    // Reset to start
    flightIndexRef.current = 0;
    setIsFlying(true);

    const animate = () => {
      if (flightIndexRef.current >= smoothedPath.length - 1) {
        setIsFlying(false);
        setDronePosition(smoothedPath[smoothedPath.length - 1]);
        return;
      }

      flightIndexRef.current += 0.5;
      const index = Math.floor(flightIndexRef.current);

      if (index < smoothedPath.length) {
        setDronePosition(smoothedPath[index]);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [isFlying, smoothedPath]);

  // Reset everything
  const handleReset = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsFlying(false);
    setDronePosition(INITIAL_START);
    setPath([]);
    setSmoothedPath([]);
    setExplored([]);
    flightIndexRef.current = 0;
  }, []);

  // Randomize obstacles
  const handleRandomize = useCallback(() => {
    handleReset();
    const newObstacles = generateObstacles(
      obstacleCount,
      GRID_SIZE,
      INITIAL_START,
      INITIAL_TARGET
    );
    setObstacles(newObstacles);
  }, [obstacleCount, handleReset]);

  // Update obstacles when count changes
  const handleObstacleCountChange = useCallback((count: number) => {
    setObstacleCount(count);
    handleReset();
    const newObstacles = generateObstacles(
      count,
      GRID_SIZE,
      INITIAL_START,
      INITIAL_TARGET
    );
    setObstacles(newObstacles);
  }, [handleReset]);

  return (
    <div className="relative w-full h-full">
      <Scene3D
        dronePosition={dronePosition}
        targetPosition={targetPosition}
        obstacles={obstacles}
        path={path}
        smoothedPath={smoothedPath}
        explored={explored}
        gridSize={GRID_SIZE}
        isFlying={isFlying}
        showExplored={showExplored}
      />

      <ControlPanel
        isFlying={isFlying}
        isPlanning={isPlanning}
        showExplored={showExplored}
        pathLength={path.length}
        exploredCount={explored.length}
        onPlanPath={handlePlanPath}
        onStartFlight={handleStartFlight}
        onReset={handleReset}
        onToggleExplored={() => setShowExplored(!showExplored)}
        onRandomize={handleRandomize}
        obstacleCount={obstacleCount}
        setObstacleCount={handleObstacleCountChange}
      />

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 right-4 text-center">
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Drag to rotate • Scroll to zoom • Click "Plan" to find path, then "Fly" to animate
        </p>
        <footer className="mt-8 py-4 text-center text-xs text-[hsl(var(--muted-foreground))] border-t border-[hsl(var(--border))]">
          Made by{' '}
          <a 
            href="https://github.com/sharziki" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[hsl(var(--primary))] hover:underline"
          >
            Sharvil Saxena
          </a>
        </footer>

      </div>
    </div>
  );
}

export default App;