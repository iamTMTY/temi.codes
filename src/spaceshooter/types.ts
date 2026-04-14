// Game types and interfaces
export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  x: number;
  y: number;
}

export interface GameObject {
  position: Position;
  velocity: Velocity;
  width: number;
  height: number;
  isAlive: boolean;
}

export interface GameConfig {
  width: number;
  height: number;
  backgroundColor: string;
  primaryColor: string;
}
