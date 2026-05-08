'use client';

import React from 'react';

interface GunStatusBarProps {
  durability: number;
  maxDurability: number;
  cooldown: number;
  maxCooldown: number;
  energyCooldownRemain: number;
  energyCooldownActive: boolean;
  roundsPlayed: number;
  maxRounds: number;
}

export default function GunStatusBar({
  durability,
  maxDurability,
  cooldown,
  maxCooldown,
  energyCooldownRemain,
  energyCooldownActive,
  roundsPlayed,
  maxRounds,
}: GunStatusBarProps) {
  const durabilityPercent = (durability / maxDurability) * 100;
  const cooldownPercent = maxCooldown > 0 ? (cooldown / maxCooldown) * 100 : 0;
  const isCoolingDown = cooldown > 0;

  // Energy cooldown progress (4h = 14400s)
  const energyCdTotal = 14400;
  const energyCdPercent = energyCooldownActive
    ? ((energyCdTotal - energyCooldownRemain) / energyCdTotal) * 100
    : 100;

  const roundsRemaining = maxRounds - roundsPlayed;
  const isExhausted = roundsRemaining <= 0;

  const formatCooldown = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    return `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
  };

  return (
    <div
      className="rounded-xl p-4 space-y-3.5"
      style={{
        background: 'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,41,59,0.8))',
        border: '1px solid rgba(236,72,153,0.2)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      <h3 className="text-xs sm:text-sm font-semibold text-pink-300 uppercase tracking-wider text-center">
        🔫 Gun Status
      </h3>

      {/* Energy / Rounds Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-amber-400 flex items-center gap-1">
            ⚡ Energy
          </span>
          <span className="text-xs text-amber-200/80 font-mono">
            {isExhausted ? '0' : roundsRemaining}/{maxRounds} rounds
          </span>
        </div>
        {/* Round segments */}
        <div className="flex gap-1.5">
          {Array.from({ length: maxRounds }).map((_, i) => {
            const isFilled = i < roundsRemaining;
            return (
              <div
                key={i}
                className="flex-1 h-4 rounded-sm overflow-hidden border transition-all duration-300"
                style={{
                  borderColor: isFilled ? 'rgba(245,158,11,0.3)' : 'rgba(100,116,139,0.2)',
                  background: isFilled
                    ? 'linear-gradient(180deg, #f59e0b, #d97706)'
                    : 'rgba(15,23,42,0.6)',
                  boxShadow: isFilled ? '0 0 6px rgba(245,158,11,0.3)' : 'none',
                }}
              >
                {isFilled && (
                  <div className="w-full h-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-energy-shine" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4h Recharge Timer */}
      {(energyCooldownActive || isExhausted) && (
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-orange-400 flex items-center gap-1">
              🔋 Recharging...
            </span>
            <span className="text-xs text-orange-200/80 font-mono">
              {energyCooldownActive ? formatCooldown(energyCooldownRemain) : 'Start next round'}
            </span>
          </div>
          {energyCooldownActive && (
            <div className="h-3 rounded-full bg-slate-800/80 overflow-hidden border border-orange-900/30">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${energyCdPercent}%`,
                  background: 'linear-gradient(90deg, #f97316, #fb923c)',
                  boxShadow: '0 0 6px rgba(249,115,22,0.4)',
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Durability Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1">
            🔧 Durability
          </span>
          <span className="text-xs text-cyan-200/80 font-mono">
            {durability}/{maxDurability}
          </span>
        </div>
        <div className="h-3 rounded-full bg-slate-800/80 overflow-hidden border border-cyan-900/30">
          <div
            className="h-full rounded-full transition-all duration-500 relative"
            style={{
              width: `${durabilityPercent}%`,
              background: durabilityPercent > 60
                ? 'linear-gradient(90deg, #06b6d4, #22d3ee)'
                : durabilityPercent > 30
                  ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                  : 'linear-gradient(90deg, #ef4444, #f87171)',
              boxShadow: `0 0 8px ${durabilityPercent > 60 ? 'rgba(6,182,212,0.4)' : durabilityPercent > 30 ? 'rgba(245,158,11,0.4)' : 'rgba(239,68,68,0.4)'}`,
            }}
          >
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-energy-shine" />
            </div>
          </div>
        </div>
      </div>

      {/* Cooldown Timer */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className={`text-xs font-semibold flex items-center gap-1 ${isCoolingDown ? 'text-rose-400' : 'text-green-400'}`}>
            ⏱️ {isCoolingDown ? 'Cooling...' : 'Ready!'}
          </span>
          {isCoolingDown && (
            <span className="text-xs text-rose-200/80 font-mono animate-pulse">
              {(cooldown / 1000).toFixed(1)}s
            </span>
          )}
        </div>
        <div className="h-3 rounded-full bg-slate-800/80 overflow-hidden border border-rose-900/30">
          <div
            className="h-full rounded-full transition-all duration-100"
            style={{
              width: isCoolingDown ? `${100 - cooldownPercent}%` : '100%',
              background: isCoolingDown
                ? 'linear-gradient(90deg, #f43f5e, #fb7185)'
                : 'linear-gradient(90deg, #22c55e, #4ade80)',
              boxShadow: isCoolingDown
                ? '0 0 8px rgba(244,63,94,0.4)'
                : '0 0 8px rgba(34,197,94,0.4)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
