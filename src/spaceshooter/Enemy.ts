import type { GameObject, Position, Velocity } from './types';

export class Enemy implements GameObject {
  position: Position;
  velocity: Velocity;
  width: number;
  height: number;
  isAlive: boolean;
  color: string;
  points: number;

  constructor(x: number, y: number, speed: number = 2) {
    this.position = { x, y };
    this.velocity = { x: 0, y: speed };
    this.width = 25;
    this.height = 25;
    this.isAlive = true;
    this.color = '#ff5f56'; // Red enemies
    this.points = 10;
  }

  update(canvasHeight: number) {
    this.position.y += this.velocity.y;

    // Remove if off screen
    if (this.position.y > canvasHeight) {
      this.isAlive = false;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.isAlive) return;

    ctx.save();
    ctx.translate(this.position.x + this.width / 2, this.position.y + this.height / 2);

    // Draw enemy ship (inverted triangle)
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;
    
    ctx.beginPath();
    ctx.moveTo(0, this.height / 2);
    ctx.lineTo(-this.width / 2, -this.height / 2);
    ctx.lineTo(this.width / 2, -this.height / 2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}
