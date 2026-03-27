# Drone Path Planning

3D visualization of autonomous drone navigation using A* pathfinding with obstacle avoidance. Watch the drone plan and execute flight paths through randomly generated obstacle fields.

## Features

- **3D A* Pathfinding**: Full 3D pathfinding with 26-connectivity (diagonal moves)
- **Obstacle Avoidance**: Collision detection with configurable drone radius
- **Path Smoothing**: Catmull-Rom spline interpolation for natural flight paths
- **Interactive 3D Scene**: Orbit controls with zoom, pan, and rotate
- **Real-time Animation**: Watch the drone fly along computed paths
- **Exploration Visualization**: Toggle display of A* search exploration

## How It Works

### A* Algorithm
1. Explores 3D space using priority queue based on f = g + h
2. g: actual cost from start
3. h: Euclidean distance heuristic to goal
4. Considers 26 neighbors (including diagonals)

### Path Smoothing
Uses Catmull-Rom spline interpolation to convert jagged A* paths into smooth flight trajectories suitable for drone dynamics.

### Collision Detection
AABB (Axis-Aligned Bounding Box) collision detection with configurable drone radius margin for safe obstacle clearance.

## Controls

- **Drag**: Rotate camera around scene
- **Scroll**: Zoom in/out
- **Plan**: Compute A* path from start to target
- **Fly**: Animate drone along smoothed path
- **Random**: Generate new obstacle configuration
- **Reset**: Return drone to start position

## Tech Stack

- React 19 + TypeScript
- Three.js with @react-three/fiber
- @react-three/drei helpers
- Vite
- Tailwind CSS 4

## Getting Started

```bash
npm install
npm run dev
```

## Scene Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| Grid Size | 20x10x20 | 3D space dimensions |
| Obstacles | 20 | Number of random obstacles |
| Drone Radius | 0.5 | Collision detection margin |
| Step Size | 1.0 | A* grid resolution |

## Algorithm Complexity

- **Time**: O(V log V) where V = grid cells explored
- **Space**: O(V) for open/closed sets

## License

MIT
