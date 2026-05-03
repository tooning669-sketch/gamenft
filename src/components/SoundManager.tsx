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
          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30'
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
