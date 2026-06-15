export class SoundscapeSynthesizer {
  ctx = null;
  masterGain = null;
  activeNodes = [];
  lfos = [];
  currentVolume = 0.5;
  currentType = null;
  constructor() {
  }
  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }
  setVolume(volume) {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.currentVolume * 0.4, this.ctx.currentTime);
    }
  }
  togglePlay(type, playing, volume) {
    this.currentVolume = volume;
    if (!playing) {
      this.stop();
      return;
    }
    this.initContext();
    if (this.currentType === type && this.activeNodes.length > 0) {
      this.setVolume(volume);
      return;
    }
    this.stop();
    this.currentType = type;
    if (!this.ctx || !this.masterGain) return;
    this.setVolume(volume);
    const now = this.ctx.currentTime;
    try {
      switch (type) {
        case "rain":
          this.buildRainSoundscape(this.ctx, this.masterGain, now);
          break;
        case "drone":
          this.buildCosmicDrone(this.ctx, this.masterGain, now);
          break;
        case "alpha":
          this.buildBinauralAlpha(this.ctx, this.masterGain, now);
          break;
        case "wind":
          this.buildForestWind(this.ctx, this.masterGain, now);
          break;
      }
    } catch (err) {
      console.error("Failed to play synthesized soundscape:", err);
    }
  }
  stop() {
    this.activeNodes.forEach((node) => {
      try {
        node.stop();
      } catch (e) {
      }
      try {
        node.disconnect();
      } catch (e) {
      }
    });
    this.lfos.forEach((lfo) => {
      try {
        lfo.stop();
      } catch (e) {
      }
      try {
        lfo.disconnect();
      } catch (e) {
      }
    });
    this.activeNodes = [];
    this.lfos = [];
    this.currentType = null;
  }
  // Helper: Generates a buffer containing brown noise (deeper waterfall rumble, perfect for rain)
  createBrownNoiseBuffer(ctx, seconds = 5) {
    const sampleRate = ctx.sampleRate;
    const bufferSize = sampleRate * seconds;
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 4;
    }
    return buffer;
  }
  // 1. Cosmic Rainfall: High detail brownian noise + high-frequency rain patter + wind gusts LFO
  buildRainSoundscape(ctx, destination, now) {
    const rainBuffer = this.createBrownNoiseBuffer(ctx, 4);
    const source = ctx.createBufferSource();
    source.buffer = rainBuffer;
    source.loop = true;
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(450, now);
    const highpass = ctx.createBiquadFilter();
    highpass.type = "peaking";
    highpass.frequency.setValueAtTime(1200, now);
    highpass.Q.setValueAtTime(1, now);
    highpass.gain.setValueAtTime(4, now);
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.08, now);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.25, now);
    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.6, now);
    lfo.connect(lfoGain);
    lfoGain.connect(rainGain.gain);
    source.connect(lowpass);
    lowpass.connect(highpass);
    highpass.connect(rainGain);
    rainGain.connect(destination);
    const splashOsc = ctx.createOscillator();
    splashOsc.type = "triangle";
    splashOsc.frequency.setValueAtTime(80, now);
    const splashGain = ctx.createGain();
    splashGain.gain.setValueAtTime(0.03, now);
    splashOsc.connect(splashGain);
    splashGain.connect(destination);
    lfo.start(now);
    source.start(now);
    splashOsc.start(now);
    this.lfos.push(lfo);
    this.activeNodes.push(source, splashOsc, rainGain, lowpass, highpass, lfoGain, splashGain);
  }
  // 2. Cosmic Drone: Harmonically rich warm low sine tones + slow resonance sweeps
  buildCosmicDrone(ctx, destination, now) {
    const hzList = [65.41, 97.99, 130.81, 196];
    const volumes = [0.45, 0.35, 0.3, 0.2];
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(140, now);
    lowpass.Q.setValueAtTime(2.5, now);
    const sweepLfo = ctx.createOscillator();
    sweepLfo.frequency.setValueAtTime(0.04, now);
    const sweepGain = ctx.createGain();
    sweepGain.gain.setValueAtTime(60, now);
    sweepLfo.connect(sweepGain);
    sweepGain.connect(lowpass.frequency);
    hzList.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq + (Math.random() * 0.4 - 0.2), now);
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
  buildBinauralAlpha(ctx, destination, now) {
    const merger = ctx.createChannelMerger(2);
    const oscL = ctx.createOscillator();
    oscL.type = "sine";
    oscL.frequency.setValueAtTime(140, now);
    const gainL = ctx.createGain();
    gainL.gain.setValueAtTime(0.5, now);
    const oscR = ctx.createOscillator();
    oscR.type = "sine";
    oscR.frequency.setValueAtTime(150, now);
    const gainR = ctx.createGain();
    gainR.gain.setValueAtTime(0.5, now);
    const baseOsc = ctx.createOscillator();
    baseOsc.type = "triangle";
    baseOsc.frequency.setValueAtTime(70, now);
    const baseGain = ctx.createGain();
    baseGain.gain.setValueAtTime(0.18, now);
    oscL.connect(gainL).connect(merger, 0, 0);
    oscR.connect(gainR).connect(merger, 0, 1);
    merger.connect(destination);
    baseOsc.connect(baseGain).connect(destination);
    oscL.start(now);
    oscR.start(now);
    baseOsc.start(now);
    this.activeNodes.push(oscL, gainL, oscR, gainR, merger, baseOsc, baseGain);
  }
  // 4. Forest Whispers: Pinkish wind synthesis using brown noise, a dynamic bandpass, and natural oscillation
  buildForestWind(ctx, destination, now) {
    const noiseBuffer = this.createBrownNoiseBuffer(ctx, 4);
    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;
    const bpFilter = ctx.createBiquadFilter();
    bpFilter.type = "bandpass";
    bpFilter.frequency.setValueAtTime(320, now);
    bpFilter.Q.setValueAtTime(3.5, now);
    const windLfo = ctx.createOscillator();
    windLfo.frequency.setValueAtTime(0.06, now);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(180, now);
    windLfo.connect(lfoGain);
    lfoGain.connect(bpFilter.frequency);
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
export const soundscapeSynth = new SoundscapeSynthesizer();
