// Web Audio API synthesizer for SecretArea Custom Cursor click & hover sound effects.
// Runs 100% client-side with zero external audio assets so it works seamlessly offline.

let cursorAudioCtx: AudioContext | null = null;
let cursorMasterVolume = 0.7;
let lastCursorHoverTime = 0;
let lastWheelTickTime = 0;

export type CursorSoundVariant = 'primary' | 'soft' | 'back' | 'disabled';
export type UiSoundProfile = 'windows' | 'linux' | 'macos' | 'default';

export function setUiCursorVolume(volume01: number): void {
  const clamped = Math.min(1, Math.max(0, Number.isFinite(volume01) ? volume01 : 0.7));
  cursorMasterVolume = clamped;

  if (cursorAudioCtx && cursorAudioCtx.state === 'suspended') {
    void cursorAudioCtx.resume().catch(() => {
      // Ignore autoplay lock until user gesture
    });
  }
}

function getCursorAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;

  if (!cursorAudioCtx) {
    cursorAudioCtx = new Ctx();
  }
  if (cursorAudioCtx.state === 'suspended') {
    void cursorAudioCtx.resume().catch(() => {
      // Ignore autoplay lock until user gesture
    });
  }
  return cursorAudioCtx;
}

/** Crisp tactile click sound effect with subtle OS-specific sonic character */
export function playCursorClickSound(
  variant: CursorSoundVariant = 'primary',
  profile: UiSoundProfile = 'windows'
): void {
  if (cursorMasterVolume <= 0.001) return;
  const ctx = getCursorAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const vol = Math.pow(cursorMasterVolume, 1.15);

    if (variant === 'soft') {
      // Ultra-light damped tap tailored per OS profile
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = profile === 'macos' ? 'sine' : 'triangle';
      const fStart = profile === 'macos' ? 390 : profile === 'linux' ? 610 : 520;
      const fEnd = profile === 'macos' ? 175 : profile === 'linux' ? 280 : 210;
      osc.frequency.setValueAtTime(fStart, now);
      osc.frequency.exponentialRampToValueAtTime(fEnd, now + 0.022);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(
        profile === 'macos' ? 980 : profile === 'linux' ? 1650 : 1400,
        now
      );

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(
        (profile === 'macos' ? 0.032 : profile === 'linux' ? 0.03 : 0.036) * vol,
        now + 0.003
      );
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.034);
      return;
    }

    if (variant === 'disabled') {
      // Subtle muted thud for disabled controls
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(210, now);
      osc.frequency.exponentialRampToValueAtTime(135, now + 0.055);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.045 * vol, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
      return;
    }

    if (variant === 'back') {
      // Smooth descending release tick
      const osc = ctx.createOscillator();
      const harmonic = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      harmonic.type = profile === 'macos' ? 'sine' : 'triangle';
      const startFreq = profile === 'macos' ? 490 : profile === 'linux' ? 760 : 740;
      const endFreq = profile === 'macos' ? 275 : profile === 'linux' ? 420 : 430;
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.056);

      harmonic.frequency.setValueAtTime(startFreq * (profile === 'macos' ? 1.5 : 1.45), now);
      harmonic.frequency.exponentialRampToValueAtTime(endFreq * (profile === 'macos' ? 1.5 : 1.45), now + 0.048);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(
        (profile === 'macos' ? 0.042 : profile === 'linux' ? 0.048 : 0.055) * vol,
        now + 0.005
      );
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.078);

      osc.connect(gain);
      harmonic.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      harmonic.start(now);
      osc.stop(now + 0.084);
      harmonic.stop(now + 0.084);
      return;
    }

    // macOS profile: warm liquid glass-drop marimba + silky high bell overtone
    if (profile === 'macos') {
      const body = ctx.createOscillator();
      const glassHarmonic = ctx.createOscillator();
      const shimmer = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      body.type = 'sine';
      body.frequency.setValueAtTime(380, now);
      body.frequency.exponentialRampToValueAtTime(690, now + 0.016);
      body.frequency.exponentialRampToValueAtTime(320, now + 0.058);

      glassHarmonic.type = 'sine';
      glassHarmonic.frequency.setValueAtTime(1320, now);
      glassHarmonic.frequency.exponentialRampToValueAtTime(980, now + 0.045);

      shimmer.type = 'sine';
      shimmer.frequency.setValueAtTime(1960, now + 0.005);
      shimmer.frequency.exponentialRampToValueAtTime(1520, now + 0.052);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2150, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.05 * vol, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

      body.connect(filter);
      glassHarmonic.connect(filter);
      shimmer.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      body.start(now);
      glassHarmonic.start(now);
      shimmer.start(now + 0.004);
      body.stop(now + 0.075);
      glassHarmonic.stop(now + 0.075);
      shimmer.stop(now + 0.068);
      return;
    }

    // Linux profile: dry crisp Nordic matte mechanical tactile thock
    if (profile === 'linux') {
      const thock = ctx.createOscillator();
      const click = ctx.createOscillator();
      const sub = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      thock.type = 'triangle';
      thock.frequency.setValueAtTime(295, now);
      thock.frequency.exponentialRampToValueAtTime(125, now + 0.026);

      sub.type = 'sine';
      sub.frequency.setValueAtTime(160, now);
      sub.frequency.exponentialRampToValueAtTime(88, now + 0.024);

      click.type = 'square';
      click.frequency.setValueAtTime(1240, now);
      click.frequency.exponentialRampToValueAtTime(540, now + 0.013);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(860, now);
      filter.Q.setValueAtTime(1.15, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.062 * vol, now + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.036);

      thock.connect(gain);
      sub.connect(gain);
      click.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      thock.start(now);
      sub.start(now);
      click.start(now);
      thock.stop(now + 0.04);
      sub.stop(now + 0.035);
      click.stop(now + 0.025);
      return;
    }

    // Windows / default: crisp mechanical-crystal UI click
    const snapOsc = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(1480, now);
    snapOsc.frequency.exponentialRampToValueAtTime(420, now + 0.018);

    snapGain.gain.setValueAtTime(0.0001, now);
    snapGain.gain.linearRampToValueAtTime(0.068 * vol, now + 0.002);
    snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);

    snapOsc.connect(snapGain);
    snapGain.connect(ctx.destination);
    snapOsc.start(now);
    snapOsc.stop(now + 0.025);

    const toneOsc = ctx.createOscillator();
    const toneGain = ctx.createGain();
    toneOsc.type = 'sine';
    toneOsc.frequency.setValueAtTime(880, now + 0.004);
    toneOsc.frequency.exponentialRampToValueAtTime(1240, now + 0.036);

    toneGain.gain.setValueAtTime(0.0001, now);
    toneGain.gain.linearRampToValueAtTime(0.046 * vol, now + 0.007);
    toneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.068);

    toneOsc.connect(toneGain);
    toneGain.connect(ctx.destination);
    toneOsc.start(now);
    toneOsc.stop(now + 0.074);
  } catch {
    // Ignore audio context errors safely
  }
}

/** Airy subtle micro-tick when hovering interactive controls */
export function playCursorHoverSound(profile: UiSoundProfile = 'windows'): void {
  if (cursorMasterVolume <= 0.001) return;
  const perfNow = performance.now();
  if (perfNow - lastCursorHoverTime < 75) return;
  lastCursorHoverTime = perfNow;

  const ctx = getCursorAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = profile === 'linux' ? 'triangle' : 'sine';
    const startF = profile === 'macos' ? 490 : profile === 'linux' ? 310 : 640;
    const endF = profile === 'macos' ? 790 : profile === 'linux' ? 410 : 880;
    osc.frequency.setValueAtTime(startF, now);
    osc.frequency.exponentialRampToValueAtTime(endF, now + 0.022);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(
      (profile === 'macos' ? 0.015 : profile === 'linux' ? 0.016 : 0.017) * cursorMasterVolume,
      now + 0.004
    );
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.028);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.034);
  } catch {
    // Ignore audio errors safely
  }
}

/** Crisp peg tick as spin wheel spokes pass the top flapper */
export function playWheelTickSound(): void {
  if (cursorMasterVolume <= 0.001) return;
  const perfNow = performance.now();
  if (perfNow - lastWheelTickTime < 42) return;
  lastWheelTickTime = perfNow;

  const ctx = getCursorAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const vol = Math.pow(cursorMasterVolume, 1.15);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(980, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.016);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.048 * vol, now + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.026);
  } catch {
    // Ignore audio errors safely
  }
}

/** Uplifting 3-note chime when the Spin Wheel lands on a game */
export function playWheelWinSound(): void {
  if (cursorMasterVolume <= 0.001) return;
  const ctx = getCursorAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const vol = Math.pow(cursorMasterVolume, 1.15);
    const notes = [523.25, 659.25, 783.99, 1046.5];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + idx * 0.065;

      osc.type = idx === notes.length - 1 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime((idx === notes.length - 1 ? 0.07 : 0.048) * vol, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + 0.3);
    });
  } catch {
    // Ignore audio errors safely
  }
}

