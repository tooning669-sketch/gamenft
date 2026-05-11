'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

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
// Tense / Thriller Background Music
// ==========================================

let tenseNodes: { osc: OscillatorNode; gain: GainNode }[] = [];
let tensePlaying = false;

export function startTenseMusic() {
  if (tensePlaying) return;
  try {
    const ctx = getAudioContext();

    // Low pulsing bass
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    const bassLfo = ctx.createOscillator();
    const bassLfoGain = ctx.createGain();

    bassOsc.type = 'sawtooth';
    bassOsc.frequency.setValueAtTime(55, ctx.currentTime);

    bassLfo.type = 'sine';
    bassLfo.frequency.setValueAtTime(4, ctx.currentTime); // 4Hz pulse
    bassLfoGain.gain.setValueAtTime(0.04, ctx.currentTime);

    bassLfo.connect(bassLfoGain);
    bassLfoGain.connect(bassGain.gain);
    bassOsc.connect(bassGain);
    bassGain.connect(ctx.destination);
    bassGain.gain.setValueAtTime(0.06, ctx.currentTime);

    bassOsc.start(ctx.currentTime);
    bassLfo.start(ctx.currentTime);

    tenseNodes.push({ osc: bassOsc, gain: bassGain });
    tenseNodes.push({ osc: bassLfo, gain: bassLfoGain });

    // High tension drone
    const droneOsc = ctx.createOscillator();
    const droneGain = ctx.createGain();
    droneOsc.type = 'sine';
    droneOsc.frequency.setValueAtTime(220, ctx.currentTime);
    droneOsc.frequency.linearRampToValueAtTime(280, ctx.currentTime + 30);
    droneGain.gain.setValueAtTime(0.025, ctx.currentTime);
    droneOsc.connect(droneGain);
    droneGain.connect(ctx.destination);
    droneOsc.start(ctx.currentTime);
    tenseNodes.push({ osc: droneOsc, gain: droneGain });

    // Ticking clock effect
    const tickOsc = ctx.createOscillator();
    const tickGain = ctx.createGain();
    const tickLfo = ctx.createOscillator();
    const tickLfoGain = ctx.createGain();

    tickOsc.type = 'square';
    tickOsc.frequency.setValueAtTime(1200, ctx.currentTime);
    tickLfo.type = 'square';
    tickLfo.frequency.setValueAtTime(2, ctx.currentTime); // 2Hz tick
    tickLfoGain.gain.setValueAtTime(0.015, ctx.currentTime);

    tickLfo.connect(tickLfoGain);
    tickLfoGain.connect(tickGain.gain);
    tickOsc.connect(tickGain);
    tickGain.connect(ctx.destination);
    tickGain.gain.setValueAtTime(0.015, ctx.currentTime);

    tickOsc.start(ctx.currentTime);
    tickLfo.start(ctx.currentTime);

    tenseNodes.push({ osc: tickOsc, gain: tickGain });
    tenseNodes.push({ osc: tickLfo, gain: tickLfoGain });

    tensePlaying = true;
  } catch {}
}

export function stopTenseMusic() {
  try {
    const ctx = getAudioContext();
    tenseNodes.forEach(({ osc, gain }) => {
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.stop(ctx.currentTime + 0.4);
    });
    tenseNodes = [];
    tensePlaying = false;
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
        px-2 py-1.5 rounded-lg transition-all duration-200 cursor-pointer
        text-xs font-semibold flex items-center gap-1.5
        ${muted
          ? 'bg-slate-800/60 text-slate-400 border border-slate-700/50 hover:bg-slate-700/60'
          : 'bg-cyan-400/20 text-cyan-100 border border-cyan-200/30 hover:bg-cyan-300/30'
        }
        ${className || ''}
      `}
      title={muted ? 'Turn sound on' : 'Turn sound off'}
    >
      {muted ? '🔇' : '🔊'}
      <span className="hidden sm:inline">{muted ? 'OFF' : 'ON'}</span>
    </button>
  );
}
