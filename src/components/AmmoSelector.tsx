'use client';

import React, { useEffect } from 'react';
import { AmmoType, AMMO_TYPES } from '@/lib/gameTypes';

interface AmmoSelectorProps {
  selectedAmmo: AmmoType;
  onSelectAmmo: (ammo: AmmoType) => void;
  currentEnergy: number;
}

export default function AmmoSelector({ selectedAmmo, onSelectAmmo, currentEnergy }: AmmoSelectorProps) {
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      if (key === '1') onSelectAmmo(AMMO_TYPES[0]);
      if (key === '2') onSelectAmmo(AMMO_TYPES[1]);
      if (key === '3') onSelectAmmo(AMMO_TYPES[2]);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectAmmo]);

  return (
    <div
      className="rounded-xl p-3 sm:p-4"
      style={{
        background: 'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,41,59,0.8))',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      <h3 className="text-xs sm:text-sm font-semibold text-indigo-300 uppercase tracking-wider mb-2 sm:mb-3 text-center">
        ⚔️ Ammo Select
      </h3>

      <div className="flex gap-2 sm:gap-3">
        {AMMO_TYPES.map((ammo, index) => {
          const isSelected = selectedAmmo.id === ammo.id;
          const canAfford = currentEnergy >= ammo.energyCost;

          return (
            <button
              key={ammo.id}
              onClick={() => canAfford && onSelectAmmo(ammo)}
              disabled={!canAfford}
              className={`
                relative flex-1 rounded-lg p-2 sm:p-3 transition-all duration-200 cursor-pointer
                ${isSelected
                  ? 'scale-105 ring-2'
                  : 'hover:scale-102 opacity-70 hover:opacity-100'
                }
                ${!canAfford ? 'opacity-30 cursor-not-allowed grayscale' : ''}
              `}
              style={{
                background: isSelected
                  ? `linear-gradient(135deg, ${ammo.color}30, ${ammo.color}10)`
                  : 'rgba(15,23,42,0.6)',
                borderColor: isSelected ? ammo.color : 'transparent',
                boxShadow: isSelected ? `0 0 20px ${ammo.glowColor}` : 'none',
                outline: isSelected ? `2px solid ${ammo.color}` : 'none',
                outlineOffset: '2px',
                border: `1px solid ${isSelected ? ammo.color + '60' : 'rgba(100,116,139,0.3)'}`,
              }}
            >
              {/* Shortcut badge */}
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-700 border border-slate-500 flex items-center justify-center">
                <span className="text-[10px] text-slate-300 font-mono">{index + 1}</span>
              </div>

              <div className="text-center">
                <div className="text-xl sm:text-2xl mb-1">{ammo.icon}</div>
                <div className="text-[10px] sm:text-xs font-bold text-white">{ammo.name}</div>
                <div
                  className="text-[10px] sm:text-xs font-semibold mt-0.5"
                  style={{ color: ammo.color }}
                >
                  -{ammo.damage} HP
                </div>
                {ammo.energyCost > 0 && (
                  <div className="text-[9px] sm:text-[10px] text-amber-400/80 mt-0.5">
                    ⚡{ammo.energyCost}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
