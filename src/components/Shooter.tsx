'use client';

import React from 'react';
import { AmmoType } from '@/lib/gameTypes';

interface ShooterProps {
  selectedAmmo: AmmoType;
  isFiring: boolean;
}

export default function Shooter({ selectedAmmo, isFiring }: ShooterProps) {
  return (
    <div className="flex flex-col items-center mt-4">
      {/* Cannon body */}
      <div
        className={`
          relative w-16 h-20 sm:w-20 sm:h-24
          transition-transform duration-100
          ${isFiring ? 'animate-cannon-fire' : ''}
        `}
      >
        {/* Cannon barrel */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-10 sm:w-8 sm:h-12 rounded-t-lg"
          style={{
            background: `linear-gradient(180deg, ${selectedAmmo.color}, #1e293b)`,
            boxShadow: `0 -4px 15px ${selectedAmmo.glowColor}, inset 0 0 10px rgba(0,0,0,0.5)`,
          }}
        >
          {/* Barrel highlight */}
          <div className="absolute top-1 left-1 w-1.5 h-6 bg-white/20 rounded-full" />
        </div>

        {/* Cannon base */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-12 sm:w-20 sm:h-14 rounded-xl"
          style={{
            background: 'linear-gradient(180deg, #334155, #1e293b, #0f172a)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.1)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
          }}
        >
          {/* Ammo indicator orb */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xl sm:text-2xl animate-pulse-glow"
            style={{
              background: `radial-gradient(circle, ${selectedAmmo.color}40, transparent)`,
              boxShadow: `0 0 15px ${selectedAmmo.glowColor}`,
            }}
          >
            {selectedAmmo.icon}
          </div>

          {/* Base rivets */}
          <div className="absolute top-1 left-2 w-1.5 h-1.5 rounded-full bg-slate-500/50" />
          <div className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-slate-500/50" />
          <div className="absolute bottom-1 left-2 w-1.5 h-1.5 rounded-full bg-slate-500/50" />
          <div className="absolute bottom-1 right-2 w-1.5 h-1.5 rounded-full bg-slate-500/50" />
        </div>
      </div>

      {/* Platform */}
      <div
        className="w-28 h-3 sm:w-36 sm:h-4 rounded-b-lg mt-0"
        style={{
          background: 'linear-gradient(180deg, #475569, #334155)',
          boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
        }}
      />
    </div>
  );
}
