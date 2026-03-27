import { Play, Pause, RotateCcw, Eye, EyeOff, Route, Shuffle } from 'lucide-react';

interface ControlPanelProps {
  isFlying: boolean;
  isPlanning: boolean;
  showExplored: boolean;
  pathLength: number;
  exploredCount: number;
  onPlanPath: () => void;
  onStartFlight: () => void;
  onReset: () => void;
  onToggleExplored: () => void;
  onRandomize: () => void;
  obstacleCount: number;
  setObstacleCount: (count: number) => void;
}

export function ControlPanel({
  isFlying,
  isPlanning,
  showExplored,
  pathLength,
  exploredCount,
  onPlanPath,
  onStartFlight,
  onReset,
  onToggleExplored,
  onRandomize,
  obstacleCount,
  setObstacleCount,
}: ControlPanelProps) {
  return (
    <div className="absolute top-4 left-4 w-72 space-y-4">
      {/* Title */}
      <div className="p-4 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] backdrop-blur-sm bg-opacity-90">
        <h1 className="text-xl font-bold text-[hsl(var(--foreground))]">
          Drone Path Planning
        </h1>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
          3D A* pathfinding with obstacle avoidance
        </p>
      </div>

      {/* Controls */}
      <div className="p-4 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] backdrop-blur-sm bg-opacity-90 space-y-3">
        <h2 className="text-sm font-medium text-[hsl(var(--foreground))]">Controls</h2>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onPlanPath}
            disabled={isFlying || isPlanning}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-[hsl(var(--primary))] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Route className="w-4 h-4" />
            {isPlanning ? 'Planning...' : 'Plan'}
          </button>

          <button
            onClick={onStartFlight}
            disabled={pathLength === 0 || isPlanning}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-[hsl(var(--drone))] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFlying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isFlying ? 'Stop' : 'Fly'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onRandomize}
            disabled={isFlying}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] rounded-lg text-sm font-medium hover:bg-[hsl(var(--muted))] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Shuffle className="w-4 h-4" />
            Random
          </button>

          <button
            onClick={onReset}
            disabled={isFlying}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] rounded-lg text-sm font-medium hover:bg-[hsl(var(--muted))] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>

        <button
          onClick={onToggleExplored}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] rounded-lg text-sm font-medium hover:bg-[hsl(var(--muted))] transition-colors"
        >
          {showExplored ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showExplored ? 'Hide Explored' : 'Show Explored'}
        </button>
      </div>

      {/* Settings */}
      <div className="p-4 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] backdrop-blur-sm bg-opacity-90 space-y-3">
        <h2 className="text-sm font-medium text-[hsl(var(--foreground))]">Settings</h2>

        <div>
          <label className="text-xs text-[hsl(var(--muted-foreground))]">
            Obstacles: {obstacleCount}
          </label>
          <input
            type="range"
            min={5}
            max={50}
            value={obstacleCount}
            onChange={(e) => setObstacleCount(parseInt(e.target.value))}
            disabled={isFlying}
            className="w-full h-2 bg-[hsl(var(--secondary))] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[hsl(var(--primary))]"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] backdrop-blur-sm bg-opacity-90">
        <h2 className="text-sm font-medium text-[hsl(var(--foreground))] mb-2">Statistics</h2>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[hsl(var(--muted-foreground))]">Path Length:</span>
            <span className="ml-1 text-[hsl(var(--foreground))]">{pathLength} nodes</span>
          </div>
          <div>
            <span className="text-[hsl(var(--muted-foreground))]">Explored:</span>
            <span className="ml-1 text-[hsl(var(--foreground))]">{exploredCount} nodes</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] backdrop-blur-sm bg-opacity-90">
        <h2 className="text-sm font-medium text-[hsl(var(--foreground))] mb-2">Legend</h2>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-[#22c55e]" />
            <span className="text-[hsl(var(--muted-foreground))]">Drone / Smoothed Path</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-[#eab308]" />
            <span className="text-[hsl(var(--muted-foreground))]">Target</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-[#ef4444]" />
            <span className="text-[hsl(var(--muted-foreground))]">Obstacles</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-[#8b5cf6]" />
            <span className="text-[hsl(var(--muted-foreground))]">Raw A* Path</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-[#3b82f6]" />
            <span className="text-[hsl(var(--muted-foreground))]">Explored Nodes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
