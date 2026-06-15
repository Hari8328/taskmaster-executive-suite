// Procedural Soundscape Generator using Web Audio API for Deep Focus Mode
// 100% offline, zero-asset dependencies, synthesized directly in the browser.

export type SoundscapeType = 'rain' | 'drone' | 'alpha' | 'wind';

export class SoundscapeSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeNodes: any[] = [];
  private lfos: OscillatorNode[] = [];
  private currentVolume: number = 0.5;
  private currentType: SoundscapeType | null = null;

  constructor() {
    // Lazy initialized when user starts playing to comply with browser autoplay policies
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
    }
    // Resume context if suspended
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(volume: number) {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.currentVolume * 0.4, this.ctx.currentTime);
    }
  }

  public togglePlay(type: SoundscapeType, playing: boolean, volume: number) {
    this.currentVolume = volume;
    if (!playing) {
      this.stop();
      return;
    }

    this.initContext();
    if (this.currentType === type && this.activeNodes.length > 0) {
      // Already running
      this.setVolume(volume);
      return;
    }

    // Stop previous soundscape
    this.stop();
    this.currentType = type;

    if (!this.ctx || !this.masterGain) return;
    this.setVolume(volume);

    const now = this.ctx.currentTime;

    try {
      switch (type) {
        case 'rain':
          this.buildRainSoundscape(this.ctx, this.masterGain, now);
          break;
        case 'drone':
          this.buildCosmicDrone(this.ctx, this.masterGain, now);
          break;
        case 'alpha':
          this.buildBinauralAlpha(this.ctx, this.masterGain, now);
          break;
        case 'wind':
          this.buildForestWind(this.ctx, this.masterGain, now);
          break;
      }
    } catch (err) {
      console.error('Failed to play synthesized soundscape:', err);
    }
  }

  public stop() {
    // Stop and disconnect all processors and oscillators
    this.activeNodes.forEach(node => {
      try {
        node.stop();
      } catch (e) {}
      try {
        node.disconnect();
      } catch (e) {}
    });
    this.lfos.forEach(lfo => {
      try {
        lfo.stop();
      } catch (e) {}
      try {
        lfo.disconnect();
      } catch (e) {}
    });
    this.activeNodes = [];
    this.lfos = [];
    this.currentType = null;
  }

  // Helper: Generates a buffer containing brown noise (deeper waterfall rumble, perfect for rain)
  private createBrownNoiseBuffer(ctx: AudioContext, seconds: number = 5): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const bufferSize = sampleRate * seconds;
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Brown noise math formula: Integrate random values
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 4.0; // scale up to rich volume range
    }
    return buffer;
  }

  // 1. Cosmic Rainfall: High detail brownian noise + high-frequency rain patter + wind gusts LFO
  private buildRainSoundscape(ctx: AudioContext, destination: AudioNode, now: number) {
    const rainBuffer = this.createBrownNoiseBuffer(ctx, 4);
    
    // Main deep rumble source
    const source = ctx.createBufferSource();
    source.buffer = rainBuffer;
    source.loop = true;

    // Filter deep sub-bass to sound like heavy water drops on concrete
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(450, now);

    // Filter high chime drops
    const highpass = ctx.createBiquadFilter();
    highpass.type = 'peaking';
    highpass.frequency.setValueAtTime(1200, now);
    highpass.Q.setValueAtTime(1.0, now);
    highpass.gain.setValueAtTime(4, now);

    // Gust modulator (slow LFO for wind/rain intensity peaks)
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.08, now); // swell duration ~12 seconds
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.25, now);

    // Dynamic rain level gain node
    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.6, now);

    // Connect LFO to control rain density slightly
    lfo.connect(lfoGain);
    lfoGain.connect(rainGain.gain);

    // Signal chain
    source.connect(lowpass);
    lowpass.connect(highpass);
    highpass.connect(rainGain);
    rainGain.connect(destination);

    // Warm high chime sparklers (simulating individual splash drops procedurally)
    const splashOsc = ctx.createOscillator();
    splashOsc.type = 'triangle';
    splashOsc.frequency.setValueAtTime(80, now);
    const splashGain = ctx.createGain();
    splashGain.gain.setValueAtTime(0.03, now);
    
    splashOsc.connect(splashGain);
    splashGain.connect(destination);

    // Fire nodes
    lfo.start(now);
    source.start(now);
    splashOsc.start(now);

    this.lfos.push(lfo);
    this.activeNodes.push(source, splashOsc, rainGain, lowpass, highpass, lfoGain, splashGain);
  }

  // 2. Cosmic Drone: Harmonically rich warm low sine tones + slow resonance sweeps
  private buildCosmicDrone(ctx: AudioContext, destination: AudioNode, now: number) {
    // 3 Detuned Base Tones creating chord intervals mapping to a peaceful C Major / G
    const hzList = [65.41, 97.99, 130.81, 196.00]; // C2, G2, C3, G3
    const volumes = [0.45, 0.35, 0.3, 0.2];

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(140, now);
    lowpass.Q.setValueAtTime(2.5, now);

    // Slow sweep LFO modulating the filter cutoff frequency to sound ethereal
    const sweepLfo = ctx.createOscillator();
    sweepLfo.frequency.setValueAtTime(0.04, now); // ~25s sweep cycle
    const sweepGain = ctx.createGain();
    sweepGain.gain.setValueAtTime(60, now); // sweep 80Hz - 200Hz

    sweepLfo.connect(sweepGain);
    sweepGain.connect(lowpass.frequency);

    hzList.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      // Use triangle for harmonics
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq + (Math.random() * 0.4 - 0.2), now); // slight organic detune

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volumes[idx], now);

      osc.connect(gain);
      gain.connect(lowpass);
      osc.start(now);

      this.activeNodes.push(osc, gain);
    });

    lowpass.connect(destination);
    sweepLfo.start(now);

    this.lfos.push(sweepLfo);
    this.activeNodes.push(lowpass, sweepGain);
  }

  // 3. Alpha Wave Harmony: Left/Right binaural beat generators running at 10Hz differential in alpha band
  private buildBinauralAlpha(ctx: AudioContext, destination: AudioNode, now: number) {
    const merger = ctx.createChannelMerger(2);

    // Left Ear: 140 Hz (Pure soothing bass tone)
    const oscL = ctx.createOscillator();
    oscL.type = 'sine';
    oscL.frequency.setValueAtTime(140.0, now);
    const gainL = ctx.createGain();
    gainL.gain.setValueAtTime(0.5, now);

    // Right Ear: 150 Hz
    // 150 - 140 = 10 Hz Binaural Beat (Alpha brainwaves state for active meditation and high information processing)
    const oscR = ctx.createOscillator();
    oscR.type = 'sine';
    oscR.frequency.setValueAtTime(150.0, now);
    const gainR = ctx.createGain();
    gainR.gain.setValueAtTime(0.5, now);

    // Warm pad layer in the background to make it beautiful
    const baseOsc = ctx.createOscillator();
    baseOsc.type = 'triangle';
    baseOsc.frequency.setValueAtTime(70.0, now);
    const baseGain = ctx.createGain();
    baseGain.gain.setValueAtTime(0.18, now);

    // Signal connection splits Left and Right
    oscL.connect(gainL).connect(merger, 0, 0);
    oscR.connect(gainR).connect(merger, 0, 1);
    
    // Connect merger and base pad layer to destination
    merger.connect(destination);
    baseOsc.connect(baseGain).connect(destination);

    // Execute
    oscL.start(now);
    oscR.start(now);
    baseOsc.start(now);

    this.activeNodes.push(oscL, gainL, oscR, gainR, merger, baseOsc, baseGain);
  }

  // 4. Forest Whispers: Pinkish wind synthesis using brown noise, a dynamic bandpass, and natural oscillation
  private buildForestWind(ctx: AudioContext, destination: AudioNode, now: number) {
    const noiseBuffer = this.createBrownNoiseBuffer(ctx, 4);
    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    // Bandpass captures specific howling frequencies
    const bpFilter = ctx.createBiquadFilter();
    bpFilter.type = 'bandpass';
    bpFilter.frequency.setValueAtTime(320, now);
    bpFilter.Q.setValueAtTime(3.5, now);

    // Heavy sweeping wind LFO
    const windLfo = ctx.createOscillator();
    windLfo.frequency.setValueAtTime(0.06, now); // ~16s gusts
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(180, now); // sweep 140Hz - 500Hz

    windLfo.connect(lfoGain);
    lfoGain.connect(bpFilter.frequency);

    // Main gain block
    const windGain = ctx.createGain();
    windGain.gain.setValueAtTime(0.7, now);

    source.connect(bpFilter);
    bpFilter.connect(windGain);
    windGain.connect(destination);

    windLfo.start(now);
    source.start(now);

    this.lfos.push(windLfo);
    this.activeNodes.push(source, bpFilter, windLfo, lfoGain, windGain);
  }
}

// Single singleton instance to coordinate focus soundscapes globally across dashboard transitions
export const soundscapeSynth = new SoundscapeSynthesizer();
