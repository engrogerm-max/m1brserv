/**
 * Audio synthesis for app notifications (Uber-style request chime, Radar ping, Success payout sound)
 * Uses Web Audio API without requiring external audio asset files.
 */

class SoundEffects {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  // Uber-like energetic alert for incoming service request
  public playIncomingJobAlert() {
    if (!this.isEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [587.33, 880, 1174.66, 1760]; // D5, A5, D6, A6

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);
        
        gain.gain.setValueAtTime(0.25, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.35);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.4);
      });
    } catch {
      // Audio playback fails gracefully if browser blocked before user interaction
    }
  }

  // Radar ping for searching nearby professionals
  public playRadarPing() {
    if (!this.isEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, now); // C6
      osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.3); // C5

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch {
      // ignore
    }
  }

  // Success chime when job is accepted / completed / paid
  public playSuccessChime() {
    if (!this.isEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const chord = [523.25, 659.25, 783.99, 1046.5]; // C major chord

      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.2, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.7);
      });
    } catch {
      // ignore
    }
  }

  // Cash / payout sound
  public playCashRegister() {
    if (!this.isEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.55);
    } catch {
      // ignore
    }
  }

  // Gentle, soft chime for client notifications to prevent noise fatigue
  public playSoftClientAlarm() {
    if (!this.isEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Harmonious pleasant gentle sequence
      const chord = [659.25, 783.99, 987.77, 1318.51]; // E5, G5, B5, E6 (Gentle, airy)

      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine'; // Super clean and soft
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        // Add a subtle warmth second harmonic
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 2, now + idx * 0.1);

        gain.gain.setValueAtTime(0.08, now + idx * 0.1); // Low soft volume
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.65);

        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.1);
        osc2.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.7);
        osc2.stop(now + idx * 0.1 + 0.7);
      });
    } catch {
      // ignore
    }
  }

  // Admin Operational Alarm / Sirene (High Priority Multi-Pulse Alarm)
  public playAdminAlarm() {
    if (!this.isEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      
      // Siren pulse 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.linearRampToValueAtTime(587.33, now + 0.15);
      osc1.frequency.linearRampToValueAtTime(880, now + 0.3);
      osc1.frequency.linearRampToValueAtTime(587.33, now + 0.45);
      osc1.frequency.linearRampToValueAtTime(1174.66, now + 0.6);
      
      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
      
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.8);

      // Second beep alert for urgent attention
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(987.77, now + 0.85);
      osc2.frequency.setValueAtTime(1318.51, now + 0.95);
      gain2.gain.setValueAtTime(0.3, now + 0.85);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.85);
      osc2.stop(now + 1.25);
    } catch {
      // Audio playback fails gracefully if browser blocked before user interaction
    }
  }
}

export const soundManager = new SoundEffects();
