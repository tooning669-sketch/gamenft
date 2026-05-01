'use client';

import React from 'react';

interface EnergyBarProps {
  current: number;
  max: number;
}

export default function EnergyBar({ current, max }: EnergyBarProps) {
  const percent = (current / max) * 100;

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-[10px] sm:text-xs font-semibold text-amber-400">⚡ Energy</span>
        <span className="text-[10px] sm:text-xs text-amber-300/80 font-mono">
          {current}/{max}
        </span>
      </div>
      <div className="h-2.5 sm:h-3 rounded-full bg-slate-800/80 overflow-hidden border border-amber-900/30">
        <div
          className="h-full rounded-full transition-all duration-500 relative"
          style={{
            width: `${percent}%`,
            background: percent > 50
              ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
              : percent > 25
                ? 'linear-gradient(90deg, #f97316, #fb923c)'
                : 'linear-gradient(90deg, #ef4444, #f87171)',
            boxShadow: `0 0 8px ${percent > 50 ? 'rgba(245,158,11,0.4)' : percent > 25 ? 'rgba(249,115,22,0.4)' : 'rgba(239,68,68,0.4)'}`,
          }}
        >
          {/* Animated shine */}
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-energy-shine" />
          </div>
        </div>
      </div>
    </div>
  );
}
