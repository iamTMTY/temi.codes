import type { GameObject, Position, Velocity } from './types';

export class Asteroid implements GameObject {
  position: Position;
  velocity: Velocity;
  width: number;
  height: number;
  isAlive: boolean;
  color: string;
  points: number;
  rotation: number;
  rotationSpeed: number;
  shape: number; // Different asteroid shapes
  size: 'small' | 'medium' | 'large';

  constructor(x: number, y: number, speed: number = 2, size?: 'small' | 'medium' | 'large') {
    this.position = { x, y };
    this.velocity = { x: (Math.random() - 0.5) * 1, y: speed };
    
    // Randomize size if not specified
    if (!size) {
      const rand = Math.random();
      if (rand < 0.5) {
        this.size = 'small';
      } else if (rand < 0.8) {
        this.size = 'medium';
      } else {
        this.size = 'large';
      }
    } else {
      this.size = size;
    }

    // Set dimensions based on size
    switch (this.size) {
      case 'small':
        this.width = 20;
        this.height = 20;
        this.points = 10;
        break;
      case 'medium':
        this.width = 30;
        this.height = 30;
        this.points = 20;
        break;
      case 'large':
        this.width = 45;
        this.height = 45;
        this.points = 30;
        break;
    }

    this.isAlive = true;
    this.color = '#8B7355'; // Brown/rock color
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.05;
    this.shape = Math.floor(Math.random() * 3); // 3 different shapes
  }

  update(canvasHeight: number) {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.rotation += this.rotationSpeed;

    // Remove if off screen
    if (this.position.y > canvasHeight + this.height) {
      this.isAlive = false;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.isAlive) return;

    ctx.save();
    ctx.translate(this.position.x + this.width / 2, this.position.y + this.height / 2);
    ctx.rotate(this.rotation);

    // Draw asteroid based on shape
    ctx.fillStyle = this.color;
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 5;

    const radius = this.width / 2;

    if (this.shape === 0) {
      // Irregular polygon (6 sides)
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i) / 6;
        const variance = 0.7 + Math.sin(i * 2.5) * 0.3;
        const x = Math.cos(angle) * radius * variance;
        const y = Math.sin(angle) * radius * variance;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
    } else if (this.shape === 1) {
      // Irregular polygon (8 sides)
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        const variance = 0.6 + Math.sin(i * 1.7) * 0.4;
        const x = Math.cos(angle) * radius * variance;
        const y = Math.sin(angle) * radius * variance;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
    } else {
      // Irregular polygon (5 sides)
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 * i) / 5;
        const variance = 0.8 + Math.sin(i * 3) * 0.2;
        const x = Math.cos(angle) * radius * variance;
        const y = Math.sin(angle) * radius * variance;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
    }

    ctx.fill();
    ctx.stroke();

    // Draw some crater details
    ctx.fillStyle = '#5a4a3a';
    const craterCount = this.size === 'large' ? 3 : this.size === 'medium' ? 2 : 1;
    for (let i = 0; i < craterCount; i++) {
      const angle = (Math.PI * 2 * i) / craterCount + this.rotation;
      const dist = radius * 0.4;
      const craterSize = radius * 0.15;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * dist, Math.sin(angle) * dist, craterSize, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
