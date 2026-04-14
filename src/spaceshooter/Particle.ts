import type { Position, Velocity } from './types';

export class Particle {
  position: Position;
  velocity: Velocity;
  radius: number;
  life: number;
  maxLife: number;
  color: string;

  constructor(x: number, y: number, color: string = '#50C878') {
    this.position = { x, y };
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 3 + 1;
    this.velocity = {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed,
    };
    this.radius = Math.random() * 3 + 1;
    this.life = 1;
    this.maxLife = 1;
    this.color = color;
  }

  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.life -= 0.02;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  isAlive(): boolean {
    return this.life > 0;
  }
}
