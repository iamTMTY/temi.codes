import type { GameObject, Position, Velocity } from './types';

export class Player implements GameObject {
  position: Position;
  velocity: Velocity;
  width: number;
  height: number;
  isAlive: boolean;
  speed: number;
  color: string;
  invincible: boolean;
  invincibleTime: number;
  flashTimer: number;

  constructor(x: number, y: number, color: string = '#50C878') {
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.width = 30;
    this.height = 40;
    this.isAlive = true;
    this.speed = 5;
    this.color = color;
    this.invincible = false;
    this.invincibleTime = 0;
    this.flashTimer = 0;
  }

  update(keys: Set<string>, canvasWidth: number, canvasHeight: number) {
    // Reset velocity
    this.velocity.x = 0;
    this.velocity.y = 0;

    // Handle input
    if (keys.has('arrowleft') || keys.has('a')) this.velocity.x = -this.speed;
    if (keys.has('arrowright') || keys.has('d')) this.velocity.x = this.speed;
    if (keys.has('arrowup') || keys.has('w')) this.velocity.y = -this.speed;
    if (keys.has('arrowdown') || keys.has('s')) this.velocity.y = this.speed;

    // Update position
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // Boundary checking
    this.position.x = Math.max(0, Math.min(canvasWidth - this.width, this.position.x));
    this.position.y = Math.max(0, Math.min(canvasHeight - this.height, this.position.y));

    // Update invincibility
    if (this.invincible) {
      this.invincibleTime--;
      this.flashTimer++;
      if (this.invincibleTime <= 0) {
        this.invincible = false;
      }
    }
  }

  makeInvincible(frames: number = 120) {
    this.invincible = true;
    this.invincibleTime = frames;
    this.flashTimer = 0;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.isAlive) return;

    // Flash effect when invincible
    if (this.invincible && Math.floor(this.flashTimer / 10) % 2 === 0) {
      return;
    }

    ctx.save();
    ctx.translate(this.position.x + this.width / 2, this.position.y + this.height / 2);

    // Draw rocket body
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    
    ctx.beginPath();
    ctx.moveTo(0, -this.height / 2); // Nose
    ctx.lineTo(-this.width / 3, 0); // Left side
    ctx.lineTo(-this.width / 2, this.height / 2); // Left fin
    ctx.lineTo(-this.width / 4, this.height / 3); // Left inner
    ctx.lineTo(this.width / 4, this.height / 3); // Right inner
    ctx.lineTo(this.width / 2, this.height / 2); // Right fin
    ctx.lineTo(this.width / 3, 0); // Right side
    ctx.closePath();
    ctx.fill();

    // Draw cockpit window
    ctx.fillStyle = '#61afef';
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.ellipse(0, -this.height / 6, 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw engine flames (animated)
    const flameOffset = Math.sin(Date.now() / 50) * 3;
    ctx.fillStyle = '#ff5f56';
    ctx.shadowColor = '#ff5f56';
    ctx.shadowBlur = 15;
    
    ctx.beginPath();
    ctx.moveTo(-this.width / 4, this.height / 3);
    ctx.lineTo(-this.width / 6, this.height / 2 + 8 + flameOffset);
    ctx.lineTo(0, this.height / 3);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, this.height / 3);
    ctx.lineTo(this.width / 6, this.height / 2 + 8 + flameOffset);
    ctx.lineTo(this.width / 4, this.height / 3);
    ctx.closePath();
    ctx.fill();

    // Add yellow inner flames
    ctx.fillStyle = '#ffbd2e';
    ctx.beginPath();
    ctx.moveTo(-this.width / 6, this.height / 3);
    ctx.lineTo(-this.width / 8, this.height / 2 + 4 + flameOffset / 2);
    ctx.lineTo(0, this.height / 3);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, this.height / 3);
    ctx.lineTo(this.width / 8, this.height / 2 + 4 + flameOffset / 2);
    ctx.lineTo(this.width / 6, this.height / 3);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}
