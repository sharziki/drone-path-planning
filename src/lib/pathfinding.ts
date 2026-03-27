// 3D A* Pathfinding for Drone Navigation

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface Node3D extends Point3D {
  g: number; // Cost from start
  h: number; // Heuristic (estimated cost to goal)
  f: number; // Total cost (g + h)
  parent: Node3D | null;
}

export interface Obstacle {
  position: Point3D;
  size: Point3D;
}

export interface PathResult {
  path: Point3D[];
  explored: Point3D[];
  success: boolean;
}

// 3D distance heuristic (Euclidean)
function heuristic(a: Point3D, b: Point3D): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// Check if a point collides with any obstacle
function collidesWithObstacle(point: Point3D, obstacles: Obstacle[], droneRadius: number): boolean {
  for (const obs of obstacles) {
    // Check AABB collision with some margin
    const margin = droneRadius;
    if (
      point.x >= obs.position.x - obs.size.x / 2 - margin &&
      point.x <= obs.position.x + obs.size.x / 2 + margin &&
      point.y >= obs.position.y - obs.size.y / 2 - margin &&
      point.y <= obs.position.y + obs.size.y / 2 + margin &&
      point.z >= obs.position.z - obs.size.z / 2 - margin &&
      point.z <= obs.position.z + obs.size.z / 2 + margin
    ) {
      return true;
    }
  }
  return false;
}

// Check if point is within grid bounds
function inBounds(point: Point3D, gridSize: Point3D): boolean {
  return (
    point.x >= 0 && point.x < gridSize.x &&
    point.y >= 0 && point.y < gridSize.y &&
    point.z >= 0 && point.z < gridSize.z
  );
}

// Get neighboring cells (26-connected in 3D)
function getNeighbors(node: Point3D, gridSize: Point3D, stepSize: number): Point3D[] {
  const neighbors: Point3D[] = [];

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dz = -1; dz <= 1; dz++) {
        if (dx === 0 && dy === 0 && dz === 0) continue;

        const neighbor: Point3D = {
          x: node.x + dx * stepSize,
          y: node.y + dy * stepSize,
          z: node.z + dz * stepSize,
        };

        if (inBounds(neighbor, gridSize)) {
          neighbors.push(neighbor);
        }
      }
    }
  }

  return neighbors;
}

// Convert point to string key for hash map
function pointKey(p: Point3D): string {
  return `${p.x.toFixed(1)},${p.y.toFixed(1)},${p.z.toFixed(1)}`;
}

// A* pathfinding algorithm for 3D space
export function findPath(
  start: Point3D,
  goal: Point3D,
  obstacles: Obstacle[],
  gridSize: Point3D,
  stepSize: number = 1,
  droneRadius: number = 0.5
): PathResult {
  const explored: Point3D[] = [];

  // Check if start or goal is blocked
  if (collidesWithObstacle(start, obstacles, droneRadius) ||
      collidesWithObstacle(goal, obstacles, droneRadius)) {
    return { path: [], explored, success: false };
  }

  const openSet: Node3D[] = [];
  const closedSet = new Set<string>();
  const openSetKeys = new Set<string>();

  const startNode: Node3D = {
    ...start,
    g: 0,
    h: heuristic(start, goal),
    f: heuristic(start, goal),
    parent: null,
  };

  openSet.push(startNode);
  openSetKeys.add(pointKey(start));

  const maxIterations = 10000;
  let iterations = 0;

  while (openSet.length > 0 && iterations < maxIterations) {
    iterations++;

    // Get node with lowest f score
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift()!;
    const currentKey = pointKey(current);
    openSetKeys.delete(currentKey);

    explored.push({ x: current.x, y: current.y, z: current.z });

    // Check if we reached the goal
    if (heuristic(current, goal) < stepSize) {
      // Reconstruct path
      const path: Point3D[] = [];
      let node: Node3D | null = current;
      while (node) {
        path.unshift({ x: node.x, y: node.y, z: node.z });
        node = node.parent;
      }
      return { path, explored, success: true };
    }

    closedSet.add(currentKey);

    // Explore neighbors
    for (const neighborPos of getNeighbors(current, gridSize, stepSize)) {
      const neighborKey = pointKey(neighborPos);

      if (closedSet.has(neighborKey)) continue;
      if (collidesWithObstacle(neighborPos, obstacles, droneRadius)) continue;

      const moveCost = heuristic(current, neighborPos);
      const g = current.g + moveCost;

      // Check if this neighbor is in open set
      const existingIdx = openSet.findIndex(n => pointKey(n) === neighborKey);

      if (existingIdx === -1) {
        // Add new node
        const h = heuristic(neighborPos, goal);
        openSet.push({
          ...neighborPos,
          g,
          h,
          f: g + h,
          parent: current,
        });
        openSetKeys.add(neighborKey);
      } else if (g < openSet[existingIdx].g) {
        // Update existing node with better path
        openSet[existingIdx].g = g;
        openSet[existingIdx].f = g + openSet[existingIdx].h;
        openSet[existingIdx].parent = current;
      }
    }
  }

  return { path: [], explored, success: false };
}

// Generate random obstacles
export function generateObstacles(
  count: number,
  gridSize: Point3D,
  start: Point3D,
  goal: Point3D,
  minSize: number = 1,
  maxSize: number = 3
): Obstacle[] {
  const obstacles: Obstacle[] = [];
  const safeDistance = 2;

  for (let i = 0; i < count; i++) {
    let attempts = 0;
    while (attempts < 50) {
      const obstacle: Obstacle = {
        position: {
          x: Math.random() * (gridSize.x - 4) + 2,
          y: Math.random() * (gridSize.y - 4) + 2,
          z: Math.random() * (gridSize.z - 4) + 2,
        },
        size: {
          x: minSize + Math.random() * (maxSize - minSize),
          y: minSize + Math.random() * (maxSize - minSize),
          z: minSize + Math.random() * (maxSize - minSize),
        },
      };

      // Check distance from start and goal
      const distStart = heuristic(obstacle.position, start);
      const distGoal = heuristic(obstacle.position, goal);

      if (distStart > safeDistance + maxSize && distGoal > safeDistance + maxSize) {
        obstacles.push(obstacle);
        break;
      }
      attempts++;
    }
  }

  return obstacles;
}

// Smooth path using Catmull-Rom spline
export function smoothPath(path: Point3D[], segments: number = 10): Point3D[] {
  if (path.length < 2) return path;

  const smoothed: Point3D[] = [];

  for (let i = 0; i < path.length - 1; i++) {
    const p0 = path[Math.max(0, i - 1)];
    const p1 = path[i];
    const p2 = path[Math.min(path.length - 1, i + 1)];
    const p3 = path[Math.min(path.length - 1, i + 2)];

    for (let t = 0; t < segments; t++) {
      const s = t / segments;
      const s2 = s * s;
      const s3 = s2 * s;

      // Catmull-Rom coefficients
      const c0 = -0.5 * s3 + s2 - 0.5 * s;
      const c1 = 1.5 * s3 - 2.5 * s2 + 1;
      const c2 = -1.5 * s3 + 2 * s2 + 0.5 * s;
      const c3 = 0.5 * s3 - 0.5 * s2;

      smoothed.push({
        x: c0 * p0.x + c1 * p1.x + c2 * p2.x + c3 * p3.x,
        y: c0 * p0.y + c1 * p1.y + c2 * p2.y + c3 * p3.y,
        z: c0 * p0.z + c1 * p1.z + c2 * p2.z + c3 * p3.z,
      });
    }
  }

  smoothed.push(path[path.length - 1]);
  return smoothed;
}
