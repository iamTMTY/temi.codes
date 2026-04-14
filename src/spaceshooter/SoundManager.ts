// Sound manager for game audio

interface Sound {
  play: () => void;
}

export class SoundManager {
  private sounds: Map<string, Sound>;
  private audioContext: AudioContext | null;
  private enabled: boolean;
  private masterGain: GainNode | null;

  constructor() {
    this.sounds = new Map();
    this.audioContext = null;
    this.enabled = false;
    this.masterGain = null;
  }

  async initialize() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      
      // Create simple sound effects using oscillators
      await this.createSounds();
    } catch (error) {
      console.warn('Audio context not supported', error);
    }
  }

  private async createSounds() {
    if (!this.audioContext) return;

    // Create shoot sound
    this.createShootSound();
    
    // Create explosion sound
    this.createExplosionSound();
    
    // Create hit sound
    this.createHitSound();
  }

  private createShootSound() {
    // Laser shoot sound
    const sound: Sound = {
      play: () => {
        if (!this.enabled || !this.audioContext || !this.masterGain) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
      }
    };
    
    this.sounds.set('shoot', sound);
  }

  private createExplosionSound() {
    // Explosion sound
    const sound: Sound = {
      play: () => {
        if (!this.enabled || !this.audioContext || !this.masterGain) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
      }
    };
    
    this.sounds.set('explosion', sound);
  }

  private createHitSound() {
    // Hit/damage sound
    const sound: Sound = {
      play: () => {
        if (!this.enabled || !this.audioContext || !this.masterGain) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.15);
        
        gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.15);
      }
    };
    
    this.sounds.set('hit', sound);
  }

  play(soundName: string) {
    const sound = this.sounds.get(soundName);
    if (sound && this.enabled) {
      sound.play();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled() {
    return this.enabled;
  }
}
