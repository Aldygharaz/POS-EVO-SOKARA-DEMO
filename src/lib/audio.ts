class AudioService {
  private audioContext: AudioContext | null = null;

  private init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  private playTone(frequency: number, type: OscillatorType, duration: number, vol = 0.1) {
    this.init();
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

    gainNode.gain.setValueAtTime(vol, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  public playSuccessBeep() {
    this.playTone(800, 'sine', 0.1, 0.1);
  }

  public playErrorBeep() {
    this.playTone(300, 'sawtooth', 0.3, 0.2);
    setTimeout(() => this.playTone(250, 'sawtooth', 0.3, 0.2), 150);
  }

  public playCheckoutSound() {
    this.playTone(1200, 'square', 0.1, 0.05);
    setTimeout(() => this.playTone(1500, 'square', 0.15, 0.05), 100);
    setTimeout(() => this.playTone(2000, 'square', 0.2, 0.05), 250);
  }
}

export const audioService = new AudioService();
