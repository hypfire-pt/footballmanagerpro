/**
 * Match sound effects using Web Audio API
 */
class MatchSoundEffects {
  private audioContext: AudioContext | null = null;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  private playTone(frequency: number, duration: number, volume: number = 0.3) {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  private playChord(frequencies: number[], duration: number, volume: number = 0.2) {
    frequencies.forEach(freq => this.playTone(freq, duration, volume));
  }

  goal() {
    // Triumphant chord progression
    setTimeout(() => this.playChord([523.25, 659.25, 783.99], 0.3, 0.3), 0);
    setTimeout(() => this.playChord([587.33, 739.99, 880.00], 0.3, 0.3), 150);
    setTimeout(() => this.playChord([659.25, 830.61, 987.77], 0.5, 0.3), 300);
    
    // Add crowd roar simulation
    this.crowdRoar();
  }

  private crowdRoar() {
    if (!this.audioContext) return;

    const bufferSize = this.audioContext.sampleRate * 1.5;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    // Create white noise for crowd effect
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;

    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1.5);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    source.start();
  }

  shotOnTarget() {
    // Tense ascending tone
    this.playTone(440, 0.1, 0.2);
    setTimeout(() => this.playTone(554.37, 0.15, 0.25), 50);
  }

  missedShot() {
    // Disappointed descending tone
    this.playTone(659.25, 0.1, 0.15);
    setTimeout(() => this.playTone(523.25, 0.2, 0.15), 80);
  }

  yellowCard() {
    // Warning beep
    this.playTone(880, 0.15, 0.3);
    setTimeout(() => this.playTone(880, 0.15, 0.3), 200);
  }

  redCard() {
    // Harsh alarm
    this.playTone(1046.50, 0.2, 0.35);
    setTimeout(() => this.playTone(932.33, 0.2, 0.35), 150);
    setTimeout(() => this.playTone(830.61, 0.3, 0.35), 300);
  }

  save() {
    // Quick rising tone
    this.playTone(329.63, 0.08, 0.2);
    setTimeout(() => this.playTone(523.25, 0.12, 0.25), 60);
  }

  corner() {
    // Building tension
    this.playTone(392.00, 0.15, 0.15);
  }

  whistle() {
    // Referee whistle simulation
    this.playTone(2093, 0.3, 0.2);
  }

  closeCall() {
    // Tense moment
    this.playChord([440, 554.37, 659.25], 0.2, 0.15);
  }
}

export const matchSounds = new MatchSoundEffects();
