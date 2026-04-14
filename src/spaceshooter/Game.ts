import { Player } from './Player';
import { Asteroid } from './Asteroid';
import { Bullet } from './Bullet';
import { Particle } from './Particle';
import { SoundManager } from './SoundManager';
import type { GameConfig } from './types';

export type GameState = 'START' | 'PLAYING' | 'GAME_OVER';

export class Game {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  config: GameConfig;
  player: Player;
  asteroids: Asteroid[];
  bullets: Bullet[];
  particles: Particle[];
  keys: Set<string>;
  score: number;
  lives: number;
  maxLives: number;
  gameLoop: number | null;
  lastAsteroidSpawn: number;
  asteroidSpawnInterval: number;
  lastShot: number;
  shootCooldown: number;
  state: GameState;
  soundManager: SoundManager;
  stars: Array<{ x: number; y: number; speed: number; size: number }>;
  mousePos: { x: number; y: number };
  startButton: {
    x: number;
    y: number;
    width: number;
    height: number;
    hovered: boolean;
  };

  constructor(canvas: HTMLCanvasElement, config: GameConfig) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    this.ctx = ctx;
    this.config = config;

    // Set canvas size
    this.canvas.width = config.width;
    this.canvas.height = config.height;

    // Initialize game objects
    this.player = new Player(config.width / 2 - 15, config.height - 80, config.primaryColor);
    this.asteroids = [];
    this.bullets = [];
    this.particles = [];
    this.keys = new Set();
    this.score = 0;
    this.lives = 5;
    this.maxLives = 5;
    this.gameLoop = null;
    this.lastAsteroidSpawn = 0;
    this.asteroidSpawnInterval = 1500;
    this.lastShot = 0;
    this.shootCooldown = 250;
    this.state = 'START';
    this.soundManager = new SoundManager();
    this.stars = this.generateStars();
    this.mousePos = { x: 0, y: 0 };
    
    // Start button configuration
    const buttonWidth = 180;
    const buttonHeight = 50;
    this.startButton = {
      x: (config.width - buttonWidth) / 2,
      y: config.height / 2 + 40,
      width: buttonWidth,
      height: buttonHeight,
      hovered: false,
    };

    this.setupEventListeners();
    this.soundManager.initialize();
  }

  generateStars() {
    const stars = [];
    for (let i = 0; i < 50; i++) {
      stars.push({
        x: Math.random() * this.config.width,
        y: Math.random() * this.config.height,
        speed: 0.5 + Math.random() * 1.5,
        size: Math.random() < 0.3 ? 2 : 1,
      });
    }
    return stars;
  }

  setupEventListeners() {
    const handleKeyDown = (e: KeyboardEvent) => {
      this.keys.add(e.key.toLowerCase());
      
      // Shoot on space (only during gameplay)
      if (e.key === ' ' && this.state === 'PLAYING') {
        e.preventDefault();
        this.shoot();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      this.keys.delete(e.key.toLowerCase());
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mousePos.x = e.clientX - rect.left;
      this.mousePos.y = e.clientY - rect.top;

      // Check button hover
      if (this.state === 'START' || this.state === 'GAME_OVER') {
        this.startButton.hovered = this.isPointInButton(this.mousePos.x, this.mousePos.y);
        this.canvas.style.cursor = this.startButton.hovered ? 'pointer' : 'crosshair';
      }
    };

    const handleClick = (e: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if ((this.state === 'START' || this.state === 'GAME_OVER') && this.isPointInButton(x, y)) {
        this.handleStartButton();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    this.canvas.addEventListener('mousemove', handleMouseMove);
    this.canvas.addEventListener('click', handleClick);

    // Store references for cleanup
    (this.canvas as any)._keydownHandler = handleKeyDown;
    (this.canvas as any)._keyupHandler = handleKeyUp;
    (this.canvas as any)._mousemoveHandler = handleMouseMove;
    (this.canvas as any)._clickHandler = handleClick;
  }

  resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.config.width = width;
    this.config.height = height;

    // Recenter player
    if (this.player) {
      this.player.position.x = Math.min(this.player.position.x, width - this.player.width);
      this.player.position.y = Math.min(this.player.position.y, height - this.player.height);
      
      // If resetting completely, center them
      if (this.state === 'START') {
        this.player.position = {
          x: width / 2 - this.player.width / 2,
          y: height - 80
        };
      }
    }

    // Recenter button
    const buttonWidth = 180;
    const buttonHeight = 50;
    this.startButton = {
      x: (width - buttonWidth) / 2,
      y: height / 2 + 40,
      width: buttonWidth,
      height: buttonHeight,
      hovered: false,
    };

    // Regenerate stars for new dimensions
    this.stars = this.generateStars();
  }

  isPointInButton(x: number, y: number): boolean {
    return (
      x >= this.startButton.x &&
      x <= this.startButton.x + this.startButton.width &&
      y >= this.startButton.y &&
      y <= this.startButton.y + this.startButton.height
    );
  }

  handleStartButton() {
    if (this.state === 'START') {
      this.state = 'PLAYING';
      this.canvas.style.cursor = 'crosshair';
    } else if (this.state === 'GAME_OVER') {
      this.reset();
      this.state = 'PLAYING';
      this.canvas.style.cursor = 'crosshair';
    }
  }

  shoot() {
    const now = Date.now();
    if (now - this.lastShot > this.shootCooldown) {
      const bullet = new Bullet(
        this.player.position.x + this.player.width / 2 - 2,
        this.player.position.y,
        this.config.primaryColor
      );
      this.bullets.push(bullet);
      this.lastShot = now;
      this.soundManager.play('shoot');
    }
  }

  spawnAsteroid() {
    const x = Math.random() * (this.config.width - 50);
    const speed = 1.5 + Math.random() * 2;
    this.asteroids.push(new Asteroid(x, -50, speed));
  }

  createExplosion(x: number, y: number, color: string, count: number = 15) {
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(x, y, color));
    }
  }

  checkCollisions() {
    // Bullet-Asteroid collisions
    this.bullets.forEach((bullet) => {
      this.asteroids.forEach((asteroid) => {
        if (bullet.collidesWith(asteroid)) {
          bullet.isAlive = false;
          asteroid.isAlive = false;
          this.score += asteroid.points;
          this.createExplosion(
            asteroid.position.x + asteroid.width / 2,
            asteroid.position.y + asteroid.height / 2,
            asteroid.color,
            20
          );
          this.soundManager.play('explosion');
        }
      });
    });

    // Player-Asteroid collisions
    if (!this.player.invincible) {
      this.asteroids.forEach((asteroid) => {
        if (this.checkPlayerCollision(asteroid)) {
          asteroid.isAlive = false;
          this.lives--;
          this.player.makeInvincible(120); // 2 seconds at 60fps
          this.createExplosion(
            asteroid.position.x + asteroid.width / 2,
            asteroid.position.y + asteroid.height / 2,
            this.config.primaryColor,
            25
          );
          this.soundManager.play('hit');

          if (this.lives <= 0) {
            this.gameOver();
          }
        }
      });
    }
  }

  checkPlayerCollision(asteroid: Asteroid): boolean {
    // Simple AABB collision with some padding
    const padding = 5;
    return (
      this.player.isAlive &&
      asteroid.isAlive &&
      this.player.position.x + padding < asteroid.position.x + asteroid.width &&
      this.player.position.x + this.player.width - padding > asteroid.position.x &&
      this.player.position.y + padding < asteroid.position.y + asteroid.height &&
      this.player.position.y + this.player.height - padding > asteroid.position.y
    );
  }

  update() {
    if (this.state !== 'PLAYING') return;

    const now = Date.now();

    // Update player
    this.player.update(this.keys, this.config.width, this.config.height);

    // Spawn asteroids
    if (now - this.lastAsteroidSpawn > this.asteroidSpawnInterval) {
      this.spawnAsteroid();
      this.lastAsteroidSpawn = now;
      // Gradually increase difficulty
      this.asteroidSpawnInterval = Math.max(600, this.asteroidSpawnInterval - 15);
    }

    // Update bullets
    this.bullets.forEach((bullet) => bullet.update(this.config.height));
    this.bullets = this.bullets.filter((bullet) => bullet.isAlive);

    // Update asteroids
    this.asteroids.forEach((asteroid) => asteroid.update(this.config.height));
    this.asteroids = this.asteroids.filter((asteroid) => asteroid.isAlive);

    // Check collisions
    this.checkCollisions();

    // Update particles
    this.particles.forEach((particle) => particle.update());
    this.particles = this.particles.filter((particle) => particle.isAlive());

    // Update stars
    this.stars.forEach((star) => {
      star.y += star.speed;
      if (star.y > this.config.height) {
        star.y = 0;
        star.x = Math.random() * this.config.width;
      }
    });
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = this.config.backgroundColor;
    this.ctx.fillRect(0, 0, this.config.width, this.config.height);

    // Draw stars
    this.drawStars();

    if (this.state === 'START') {
      this.drawStartScreen();
    } else if (this.state === 'PLAYING') {
      this.drawGame();
    } else if (this.state === 'GAME_OVER') {
      this.drawGameOver();
    }
  }

  drawStars() {
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.stars.forEach((star) => {
      this.ctx.fillRect(star.x, star.y, star.size, star.size);
    });
  }

  drawStartScreen() {
    const centerX = this.config.width / 2;
    const centerY = this.config.height / 2;

    // Draw animated background gradient circles
    const time = Date.now() / 1000;
    for (let i = 0; i < 3; i++) {
      const radius = 80 + i * 40 + Math.sin(time + i) * 20;
      const alpha = 0.05 - i * 0.015;
      
      const gradient = this.ctx.createRadialGradient(
        centerX, centerY - 40, 0,
        centerX, centerY - 40, radius
      );
      gradient.addColorStop(0, `rgba(80, 200, 120, ${alpha})`);
      gradient.addColorStop(1, 'rgba(80, 200, 120, 0)');
      
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, this.config.width, this.config.height);
    }

    // Draw some floating asteroids in background
    for (let i = 0; i < 3; i++) {
      const x = this.config.width * (0.2 + i * 0.3);
      const y = 60 + Math.sin(time * 0.5 + i * 2) * 20;
      const size = 15 + i * 5;
      
      this.ctx.save();
      this.ctx.globalAlpha = 0.3;
      this.ctx.translate(x, y);
      this.ctx.rotate(time * 0.3 + i);
      
      this.ctx.fillStyle = '#8B7355';
      this.ctx.strokeStyle = '#654321';
      this.ctx.lineWidth = 1;
      
      this.ctx.beginPath();
      for (let j = 0; j < 6; j++) {
        const angle = (Math.PI * 2 * j) / 6;
        const variance = 0.7 + Math.sin(j * 2.5) * 0.3;
        const px = Math.cos(angle) * size * variance;
        const py = Math.sin(angle) * size * variance;
        if (j === 0) this.ctx.moveTo(px, py);
        else this.ctx.lineTo(px, py);
      }
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
      
      this.ctx.restore();
    }

    // Title with glow effect
    this.ctx.save();
    this.ctx.fillStyle = this.config.primaryColor;
    this.ctx.shadowColor = this.config.primaryColor;
    this.ctx.shadowBlur = 30;
    this.ctx.font = 'bold 36px "Orbitron", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('SPACE SHOOTER', centerX, centerY - 70);
    this.ctx.restore();

    // Subtitle
    this.ctx.fillStyle = '#aaa';
    this.ctx.font = '16px "Rajdhani", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Destroy asteroids and survive!', centerX, centerY - 30);

    // Draw Start Game button
    const btn = this.startButton;
    const hoverScale = btn.hovered ? 1.05 : 1;
    const btnX = btn.x + btn.width / 2 - (btn.width * hoverScale) / 2;
    const btnY = btn.y + btn.height / 2 - (btn.height * hoverScale) / 2;
    const btnWidth = btn.width * hoverScale;
    const btnHeight = btn.height * hoverScale;

    // Button shadow
    if (btn.hovered) {
      this.ctx.shadowColor = this.config.primaryColor;
      this.ctx.shadowBlur = 20;
    }

    // Button background
    const buttonGradient = this.ctx.createLinearGradient(
      btnX, btnY, 
      btnX, btnY + btnHeight
    );
    if (btn.hovered) {
      buttonGradient.addColorStop(0, this.config.primaryColor);
      buttonGradient.addColorStop(1, '#3a9e5f');
    } else {
      buttonGradient.addColorStop(0, 'rgba(80, 200, 120, 0.8)');
      buttonGradient.addColorStop(1, 'rgba(58, 158, 95, 0.8)');
    }
    
    this.ctx.fillStyle = buttonGradient;
    this.ctx.fillRect(btnX, btnY, btnWidth, btnHeight);

    // Button border
    this.ctx.strokeStyle = btn.hovered ? '#fff' : this.config.primaryColor;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(btnX, btnY, btnWidth, btnHeight);
    this.ctx.shadowBlur = 0;

    // Button text
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.font = 'bold 18px "Orbitron", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('START GAME', btn.x + btn.width / 2, btn.y + btn.height / 2 + 6);

    // Instructions
    this.ctx.fillStyle = '#666';
    this.ctx.font = '12px "Rajdhani", sans-serif';
    this.ctx.fillText('WASD or ARROW KEYS to move | SPACE to shoot', centerX, this.config.height - 40);
  }

  drawGame() {
    // Draw game objects
    this.player.draw(this.ctx);
    this.bullets.forEach((bullet) => bullet.draw(this.ctx));
    this.asteroids.forEach((asteroid) => asteroid.draw(this.ctx));
    this.particles.forEach((particle) => particle.draw(this.ctx));

    // Draw HUD
    this.drawHUD();
  }

  drawHUD() {
    this.ctx.save();

    // Score
    this.ctx.fillStyle = this.config.primaryColor;
    this.ctx.font = 'bold 16px "Orbitron", monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`SCORE: ${this.score}`, 10, 25);

    // Lives
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 14px "Orbitron", monospace';
    this.ctx.fillText('LIVES:', 10, 50);

    // Draw life icons (hearts/ships)
    for (let i = 0; i < this.maxLives; i++) {
      const x = 70 + i * 20;
      const y = 43;
      
      if (i < this.lives) {
        this.ctx.fillStyle = this.config.primaryColor;
      } else {
        this.ctx.fillStyle = '#333';
      }

      // Draw small rocket icon
      this.ctx.beginPath();
      this.ctx.moveTo(x, y - 5);
      this.ctx.lineTo(x - 4, y + 5);
      this.ctx.lineTo(x + 4, y + 5);
      this.ctx.closePath();
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  drawGameOver() {
    // Draw final game state
    this.drawGame();

    // Overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.config.width, this.config.height);

    const centerX = this.config.width / 2;
    const centerY = this.config.height / 2;

    // Game Over text
    this.ctx.save();
    this.ctx.fillStyle = '#ff5f56';
    this.ctx.shadowColor = '#ff5f56';
    this.ctx.shadowBlur = 25;
    this.ctx.font = 'bold 40px "Orbitron", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', centerX, centerY - 60);
    this.ctx.restore();

    // Final score
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 22px "Orbitron", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`FINAL SCORE: ${this.score}`, centerX, centerY - 10);

    // Draw Restart button
    const btn = this.startButton;
    const hoverScale = btn.hovered ? 1.05 : 1;
    const btnX = btn.x + btn.width / 2 - (btn.width * hoverScale) / 2;
    const btnY = btn.y + btn.height / 2 - (btn.height * hoverScale) / 2;
    const btnWidth = btn.width * hoverScale;
    const btnHeight = btn.height * hoverScale;

    // Button shadow
    if (btn.hovered) {
      this.ctx.shadowColor = this.config.primaryColor;
      this.ctx.shadowBlur = 20;
    }

    // Button background
    const buttonGradient = this.ctx.createLinearGradient(
      btnX, btnY,
      btnX, btnY + btnHeight
    );
    if (btn.hovered) {
      buttonGradient.addColorStop(0, this.config.primaryColor);
      buttonGradient.addColorStop(1, '#3a9e5f');
    } else {
      buttonGradient.addColorStop(0, 'rgba(80, 200, 120, 0.8)');
      buttonGradient.addColorStop(1, 'rgba(58, 158, 95, 0.8)');
    }

    this.ctx.fillStyle = buttonGradient;
    this.ctx.fillRect(btnX, btnY, btnWidth, btnHeight);

    // Button border
    this.ctx.strokeStyle = btn.hovered ? '#fff' : this.config.primaryColor;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(btnX, btnY, btnWidth, btnHeight);
    this.ctx.shadowBlur = 0;

    // Button text
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.font = 'bold 18px "Orbitron", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('PLAY AGAIN', btn.x + btn.width / 2, btn.y + btn.height / 2 + 6);
  }

  start() {
    // Just start the render loop - don't change state
    // The state is 'START' by default and will change when button is clicked
    const gameStep = () => {
      this.update();
      this.draw();
      this.gameLoop = requestAnimationFrame(gameStep);
    };
    gameStep();
  }

  gameOver() {
    this.state = 'GAME_OVER';
  }

  stop() {
    if (this.gameLoop !== null) {
      cancelAnimationFrame(this.gameLoop);
      this.gameLoop = null;
    }
  }

  reset() {
    this.player = new Player(
      this.config.width / 2 - 15,
      this.config.height - 80,
      this.config.primaryColor
    );
    this.asteroids = [];
    this.bullets = [];
    this.particles = [];
    this.score = 0;
    this.lives = this.maxLives;
    this.lastAsteroidSpawn = Date.now();
    this.asteroidSpawnInterval = 1500;
  }

  toggleSound(): boolean {
    return this.soundManager.toggle();
  }

  cleanup() {
    this.stop();
    
    // Remove event listeners
    if ((this.canvas as any)._keydownHandler) {
      window.removeEventListener('keydown', (this.canvas as any)._keydownHandler);
    }
    if ((this.canvas as any)._keyupHandler) {
      window.removeEventListener('keyup', (this.canvas as any)._keyupHandler);
    }
    if ((this.canvas as any)._mousemoveHandler) {
      this.canvas.removeEventListener('mousemove', (this.canvas as any)._mousemoveHandler);
    }
    if ((this.canvas as any)._clickHandler) {
      this.canvas.removeEventListener('click', (this.canvas as any)._clickHandler);
    }
  }
}
