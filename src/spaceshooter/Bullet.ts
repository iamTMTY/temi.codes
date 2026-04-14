import type { GameObject, Position, Velocity } from './types';

export class Bullet implements GameObject {
  position: Position;
  velocity: Velocity;
  width: number;
  height: number;
  isAlive: boolean;
  color: string;

  constructor(x: number, y: number, color: string = '#50C878') {
    this.position = { x, y };
    this.velocity = { x: 0, y: -8 }; // Move upward
    this.width = 4;
    this.height = 12;
    this.isAlive = true;
    this.color = color;
  }

  update(canvasHeight: number) {
    this.position.y += this.velocity.y;

    // Remove if off screen
    if (this.position.y + this.height < 0) {
      this.isAlive = false;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.isAlive) return;

    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  collidesWith(obj: GameObject): boolean {
    return (
      this.isAlive &&
      obj.isAlive &&
      this.position.x < obj.position.x + obj.width &&
      this.position.x + this.width > obj.position.x &&
      this.position.y < obj.position.y + obj.height &&
      this.position.y + this.height > obj.position.y
    );
  }
}
