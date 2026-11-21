// Web Audio API synthesizer for PlayStation 5 UI sound effects & ambient background pad.
// Runs 100% client-side with zero external audio files so it works seamlessly offline.

let sharedAudioCtx: AudioContext | null = null;
let ambientMasterGain: GainNode | null = null;
let ambientNodes: AudioNode[] = [];
let lastHoverTime = 0;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;

  if (!sharedAudioCtx) {
    sharedAudioCtx = new Ctx();
  }
  if (sharedAudioCtx.state === 'suspended') {
    void sharedAudioCtx.resume().catch(() => {
      // Ignore autoplay blocks until user gesture
    });
  }
  return sharedAudioCtx;
}

/** Gentle, ethereal PS5-inspired ambient background soundscape while in Fullscreen PS5 mode */
export function startPsAmbientSound(): void {
  const ctx = getAudioContext();
  if (!ctx || ambientMasterGain) return;

  try {
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.linearRampToValueAtTime(0.055, now + 1.6);

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(520, now);

    // Subtle slow LFO breathing filter like the PS5 dashboard shimmer
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.11, now);
    lfoGain.gain.setValueAtTime(190, now);
    lfo.connect(lfoGain);
    lfoGain.connect(lowpass.frequency);

    lowpass.connect(master);
    master.connect(ctx.destination);

    // Warm atmospheric Fmaj9 pad (F2, C3, G3, A3, E4)
    const freqs = [87.31, 130.81, 196.0, 220.0, 329.63];
    const createdNodes: AudioNode[] = [lfo, lfoGain, lowpass, master];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = idx < 2 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      // Slight gentle detune for warm spatial width
      osc.detune.setValueAtTime((idx % 2 === 0 ? 1 : -1) * (idx * 2.5), now);

      oscGain.gain.setValueAtTime(idx === 0 ? 0.32 : 0.17, now);
      osc.connect(oscGain);
      oscGain.connect(lowpass);
      osc.start(now);

      createdNodes.push(osc, oscGain);
    });

    lfo.start(now);
    ambientMasterGain = master;
    ambientNodes = createdNodes;
  } catch {
    ambientMasterGain = null;
    ambientNodes = [];
  }
}

/** Smoothly fade out and stop the PS5 ambient background soundscape */
export function stopPsAmbientSound(): void {
  const ctx = sharedAudioCtx;
  const master = ambientMasterGain;
  const nodes = ambientNodes;

  ambientMasterGain = null;
  ambientNodes = [];

  if (!ctx || !master) return;

  try {
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), now);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    window.setTimeout(() => {
      for (const node of nodes) {
        try {
          if ('stop' in node && typeof (node as OscillatorNode).stop === 'function') {
            (node as OscillatorNode).stop();
          }
          node.disconnect();
        } catch {
          // ignore already stopped nodes
        }
      }
    }, 380);
  } catch {
    // ignore errors
  }
}

/** Subtle PlayStation tile hover/focus tick */
export function playPsHoverSound(): void {
  const perfNow = performance.now();
  if (perfNow - lastHoverTime < 65) return;
  lastHoverTime = perfNow;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(640, now + 0.028);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.025, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.042);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.045);
  } catch {
    // ignore audio errors
  }
}

/** Crisp DualSense / XMB confirmation tone on button click */
export function playPsClickSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc2.type = 'triangle';

    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.038);

    osc2.frequency.setValueAtTime(1760, now);
    osc2.frequency.exponentialRampToValueAtTime(2200, now + 0.032);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.065, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.085);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + 0.09);
    osc2.stop(now + 0.09);
  } catch {
    // Ignore audio context errors
  }
}

/** Soft descending PlayStation circle/back tone when closing or returning */
export function playPsBackSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.exponentialRampToValueAtTime(392, now + 0.09);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.13);
  } catch {
    // Ignore audio context errors
  }
}

/** Warm harmonic PlayStation console chord when activating Fullscreen PS5 mode */
export function playPsBootChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const notes = [261.63, 392.0, 493.88, 587.33, 783.99];
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.linearRampToValueAtTime(0.11, now + 0.08);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.25);
    masterGain.connect(ctx.destination);

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const voiceGain = ctx.createGain();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      const start = now + idx * 0.05;
      osc.frequency.setValueAtTime(freq, start);
      voiceGain.gain.setValueAtTime(0.22 / notes.length, start);

      osc.connect(voiceGain);
      voiceGain.connect(masterGain);

      osc.start(start);
      osc.stop(now + 1.3);
    });
  } catch {
    // Ignore audio context errors
  }
}
