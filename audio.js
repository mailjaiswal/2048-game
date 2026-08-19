// Web Audio API Procedural Sound Effects Engine for 2048
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.volume = 0.3;
    
    // Load mute preference
    const savedMute = localStorage.getItem('2048_sound_muted');
    if (savedMute !== null) {
      this.enabled = savedMute === 'false';
    }
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('2048_sound_muted', (!this.enabled).toString());
    if (this.enabled) {
      this.init();
      this.playTone(440, 0.08, 'sine', 0.15);
    }
    return this.enabled;
  }

  // Generic tone generator with envelope
  playTone(freq, duration, type = 'sine', gainVal = this.volume, startDelay = 0) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const startTime = this.ctx.currentTime + startDelay;
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      gainNode.gain.setValueAtTime(0.001, startTime);
      gainNode.gain.exponentialRampToValueAtTime(gainVal, startTime + 0.015);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  // Slide whoosh
  playSlide() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.07);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  }

  // Dynamic merge sound scaling pitch with tile value
  playMerge(tileValue = 4) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      // Calculate pitch based on tile value exponent
      const power = Math.min(14, Math.max(1, Math.round(Math.log2(tileValue))));
      const baseFreq = 260 + (power * 45); // higher power -> higher harmonious pitch

      const now = this.ctx.currentTime;
      
      // Fundamental pop
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(baseFreq, now);
      osc1.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.08);

      gain1.gain.setValueAtTime(0.18, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.13);

      // Harmonious chime for higher numbers
      if (tileValue >= 64) {
        this.playTone(baseFreq * 1.25, 0.15, 'sine', 0.1, 0.02);
      }
      if (tileValue >= 512) {
        this.playTone(baseFreq * 1.5, 0.2, 'sine', 0.12, 0.04);
      }
    } catch (e) {}
  }

  // Win Fanfare (2048 reached)
  playWin() {
    if (!this.enabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      this.playTone(freq, 0.35, 'triangle', 0.22, idx * 0.11);
    });
  }

  // Game over melancholic chord
  playGameOver() {
    if (!this.enabled) return;
    const notes = [392.00, 349.23, 311.13, 261.63]; // G4, F4, Eb4, C4
    notes.forEach((freq, idx) => {
      this.playTone(freq, 0.35, 'sawtooth', 0.08, idx * 0.14);
    });
  }

  // Undo button click
  playUndo() {
    this.playTone(330, 0.09, 'sine', 0.12);
  }

  // Button click
  playClick() {
    this.playTone(600, 0.04, 'sine', 0.08);
  }

  // Haptic feedback (Vibration)
  vibrate(ms = 25) {
    if (navigator.vibrate) {
      try {
        navigator.vibrate(ms);
      } catch (e) {}
    }
  }
}

window.soundEngine = new SoundEngine();
