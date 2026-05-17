'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

// ==========================================
// Web Audio Procedural Sound Manager
// ==========================================

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

export function playShootSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch {}
}

export function playPopSound() {
  try {
    const ctx = getAudioContext();

    // Pop burst
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);

    // Sparkle overlay
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1400, ctx.currentTime + 0.05);
    osc2.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.15);

    gain2.gain.setValueAtTime(0.08, ctx.currentTime + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    osc2.start(ctx.currentTime + 0.05);
    osc2.stop(ctx.currentTime + 0.2);
  } catch {}
}

export function playRewardSound(isLegendary: boolean = false) {
  try {
    const ctx = getAudioContext();
    const notes = isLegendary ? [523, 659, 784, 1047] : [523, 659, 784];

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);

      gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.12 + 0.3);

      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.3);
    });
  } catch {}
}

export function playClickSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, ctx.currentTime);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  } catch {}
}

// ==========================================
// Countdown Beep Sound (3..2..1..GO!)
// ==========================================

export function playCountdownBeep(isFinal: boolean = false) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    if (isFinal) {
      // GO! — higher, longer, triumphant
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);

      // Chord overlay
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1320, ctx.currentTime);
      gain2.gain.setValueAtTime(0.12, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc2.start(ctx.currentTime);
      osc2.stop(ctx.currentTime + 0.35);
    } else {
      // Tick — short beep
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    }
  } catch {}
}

// ==========================================
// Fun / Upbeat Background Music (Chiptune)
// ==========================================

let tenseNodes: { osc: OscillatorNode; gain: GainNode }[] = [];
let tensePlaying = false;
let melodyInterval: ReturnType<typeof setInterval> | null = null;
let arpeggioInterval: ReturnType<typeof setInterval> | null = null;

export function startTenseMusic() {
  if (tensePlaying) return;
  try {
    const ctx = getAudioContext();

    // === Bouncy Bass Line ===
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    const bassLfo = ctx.createOscillator();
    const bassLfoGain = ctx.createGain();

    bassOsc.type = 'square';
    bassOsc.frequency.setValueAtTime(110, ctx.currentTime);

    bassLfo.type = 'sine';
    bassLfo.frequency.setValueAtTime(8, ctx.currentTime); // 8Hz bounce
    bassLfoGain.gain.setValueAtTime(0.03, ctx.currentTime);

    bassLfo.connect(bassLfoGain);
    bassLfoGain.connect(bassGain.gain);
    bassOsc.connect(bassGain);
    bassGain.connect(ctx.destination);
    bassGain.gain.setValueAtTime(0.045, ctx.currentTime);

    bassOsc.start(ctx.currentTime);
    bassLfo.start(ctx.currentTime);

    tenseNodes.push({ osc: bassOsc, gain: bassGain });
    tenseNodes.push({ osc: bassLfo, gain: bassLfoGain });

    // === Happy Pad Chord (C major) ===
    const padFreqs = [261.63, 329.63, 392.0]; // C4, E4, G4
    padFreqs.forEach((freq) => {
      const padOsc = ctx.createOscillator();
      const padGain = ctx.createGain();
      padOsc.type = 'triangle';
      padOsc.frequency.setValueAtTime(freq, ctx.currentTime);
      padGain.gain.setValueAtTime(0.018, ctx.currentTime);
      padOsc.connect(padGain);
      padGain.connect(ctx.destination);
      padOsc.start(ctx.currentTime);
      tenseNodes.push({ osc: padOsc, gain: padGain });
    });

    // === Upbeat Arpeggio Melody (looping chiptune pattern) ===
    const melodyNotes = [
      523.25, 659.25, 783.99, 1046.50, // C5 E5 G5 C6
      783.99, 659.25, 523.25, 392.00,  // G5 E5 C5 G4
      587.33, 698.46, 880.00, 1174.66, // D5 F5 A5 D6
      880.00, 698.46, 587.33, 523.25,  // A5 F5 D5 C5
    ];
    let melodyIdx = 0;

    melodyInterval = setInterval(() => {
      try {
        const mCtx = getAudioContext();
        const noteOsc = mCtx.createOscillator();
        const noteGain = mCtx.createGain();
        noteOsc.type = 'square';
        noteOsc.frequency.setValueAtTime(melodyNotes[melodyIdx % melodyNotes.length], mCtx.currentTime);
        noteGain.gain.setValueAtTime(0.04, mCtx.currentTime);
        noteGain.gain.exponentialRampToValueAtTime(0.001, mCtx.currentTime + 0.12);
        noteOsc.connect(noteGain);
        noteGain.connect(mCtx.destination);
        noteOsc.start(mCtx.currentTime);
        noteOsc.stop(mCtx.currentTime + 0.13);
        melodyIdx++;
      } catch {}
    }, 150); // fast 16th note feel

    // === Rhythmic Hi-hat Pattern ===
    const hihatPattern = [1, 0, 1, 1, 0, 1, 1, 0]; // syncopated
    let hihatIdx = 0;

    arpeggioInterval = setInterval(() => {
      try {
        if (hihatPattern[hihatIdx % hihatPattern.length]) {
          const hCtx = getAudioContext();
          // Use noise-like sound via high-freq oscillator
          const hatOsc = hCtx.createOscillator();
          const hatGain = hCtx.createGain();
          hatOsc.type = 'square';
          hatOsc.frequency.setValueAtTime(6000 + Math.random() * 2000, hCtx.currentTime);
          hatGain.gain.setValueAtTime(0.015, hCtx.currentTime);
          hatGain.gain.exponentialRampToValueAtTime(0.001, hCtx.currentTime + 0.04);
          hatOsc.connect(hatGain);
          hatGain.connect(hCtx.destination);
          hatOsc.start(hCtx.currentTime);
          hatOsc.stop(hCtx.currentTime + 0.05);
        }
        hihatIdx++;
      } catch {}
    }, 125); // 8th note at ~120 BPM

    // === Bass Note Changes (chord progression loop) ===
    const bassNotes = [110, 110, 130.81, 130.81, 146.83, 146.83, 130.81, 130.81]; // A2 A2 C3 C3 D3 D3 C3 C3
    let bassIdx = 0;

    const bassChangeInterval = setInterval(() => {
      try {
        bassOsc.frequency.setValueAtTime(bassNotes[bassIdx % bassNotes.length], getAudioContext().currentTime);
        bassIdx++;
      } catch {}
    }, 500); // change every half second

    // Store the bass change interval for cleanup (hack: reuse a dummy oscillator)
    const dummyOsc = ctx.createOscillator();
    const dummyGain = ctx.createGain();
    dummyGain.gain.setValueAtTime(0, ctx.currentTime);
    dummyOsc.connect(dummyGain);
    dummyGain.connect(ctx.destination);
    dummyOsc.start(ctx.currentTime);
    tenseNodes.push({ osc: dummyOsc, gain: dummyGain });
    // Store interval ID on the gain node for cleanup
    (dummyGain as any).__intervalId = bassChangeInterval;

    tensePlaying = true;
  } catch {}
}

export function stopTenseMusic() {
  try {
    const ctx = getAudioContext();
    tenseNodes.forEach(({ osc, gain }) => {
      // Clean up any attached interval
      if ((gain as any).__intervalId) {
        clearInterval((gain as any).__intervalId);
      }
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.stop(ctx.currentTime + 0.4);
    });
    tenseNodes = [];
    tensePlaying = false;
    if (melodyInterval) { clearInterval(melodyInterval); melodyInterval = null; }
    if (arpeggioInterval) { clearInterval(arpeggioInterval); arpeggioInterval = null; }
  } catch {}
}

// ==========================================
// Map Change Transition Sound
// ==========================================

export function playMapChangeSound() {
  try {
    const ctx = getAudioContext();

    // Whoosh sweep up
    const sweepOsc = ctx.createOscillator();
    const sweepGain = ctx.createGain();
    sweepOsc.type = 'sawtooth';
    sweepOsc.frequency.setValueAtTime(200, ctx.currentTime);
    sweepOsc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.3);
    sweepOsc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.5);
    sweepGain.gain.setValueAtTime(0.08, ctx.currentTime);
    sweepGain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.15);
    sweepGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    sweepOsc.connect(sweepGain);
    sweepGain.connect(ctx.destination);
    sweepOsc.start(ctx.currentTime);
    sweepOsc.stop(ctx.currentTime + 0.5);

    // Sparkle chime overlay
    const chimeNotes = [784, 988, 1175, 1568]; // G5, B5, D6, G6
    chimeNotes.forEach((freq, i) => {
      const chimeOsc = ctx.createOscillator();
      const chimeGain = ctx.createGain();
      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(freq, ctx.currentTime + 0.1 + i * 0.06);
      chimeGain.gain.setValueAtTime(0.06, ctx.currentTime + 0.1 + i * 0.06);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1 + i * 0.06 + 0.25);
      chimeOsc.connect(chimeGain);
      chimeGain.connect(ctx.destination);
      chimeOsc.start(ctx.currentTime + 0.1 + i * 0.06);
      chimeOsc.stop(ctx.currentTime + 0.1 + i * 0.06 + 0.25);
    });

    // Low thud impact
    const thudOsc = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thudOsc.type = 'sine';
    thudOsc.frequency.setValueAtTime(80, ctx.currentTime + 0.25);
    thudOsc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.5);
    thudGain.gain.setValueAtTime(0.1, ctx.currentTime + 0.25);
    thudGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
    thudOsc.connect(thudGain);
    thudGain.connect(ctx.destination);
    thudOsc.start(ctx.currentTime + 0.25);
    thudOsc.stop(ctx.currentTime + 0.55);
  } catch {}
}

// ==========================================
// Time Up Sound
// ==========================================

export function playTimeUpSound() {
  try {
    const ctx = getAudioContext();
    // Descending alarm
    const notes = [880, 660, 440, 330];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.12);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.12);
    });
  } catch {}
}

// ==========================================
// Ambient Background Sound
// ==========================================

let ambientNodes: { osc: OscillatorNode; gain: GainNode }[] = [];
let ambientPlaying = false;

export function startAmbient() {
  if (ambientPlaying) return;
  try {
    const ctx = getAudioContext();

    // Soft pad chord
    const freqs = [130.81, 164.81, 196.0, 261.63];
    freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);

      osc.start(ctx.currentTime);
      ambientNodes.push({ osc, gain });
    });

    ambientPlaying = true;
  } catch {}
}

export function stopAmbient() {
  try {
    ambientNodes.forEach(({ osc, gain }) => {
      gain.gain.exponentialRampToValueAtTime(0.001, getAudioContext().currentTime + 0.5);
      osc.stop(getAudioContext().currentTime + 0.6);
    });
    ambientNodes = [];
    ambientPlaying = false;
  } catch {}
}

// ==========================================
// Sound Toggle UI Component
// ==========================================

interface SoundToggleProps {
  className?: string;
}

export default function SoundToggle({ className }: SoundToggleProps) {
  const [muted, setMuted] = useState(true);

  const toggle = useCallback(() => {
    if (muted) {
      startAmbient();
      setMuted(false);
    } else {
      stopAmbient();
      setMuted(true);
    }
  }, [muted]);

  return (
    <button
      onClick={toggle}
      className={`
        px-2.5 py-2 rounded-xl transition-all duration-200 cursor-pointer
        text-xs font-semibold flex items-center gap-1.5
        ${muted
          ? 'bg-slate-800/60 text-slate-400 border border-slate-700/40 hover:bg-slate-700/60 hover:text-slate-300'
          : 'bg-teal-500/15 text-teal-200 border border-teal-400/30 hover:bg-teal-400/25'
        }
        ${className || ''}
      `}
      title={muted ? 'Turn sound on' : 'Turn sound off'}
    >
      {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      <span className="hidden sm:inline">{muted ? 'OFF' : 'ON'}</span>
    </button>
  );
}
