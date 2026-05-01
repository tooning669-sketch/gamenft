'use client';

import React, { useEffect, useState } from 'react';
import { Reward } from '@/lib/gameTypes';
import { getRarityColor, getRarityGlow } from '@/lib/gameUtils';

interface RewardDropProps {
  reward: Reward;
  onComplete: () => void;
}

export default function RewardDrop({ reward, onComplete }: RewardDropProps) {
  const [stage, setStage] = useState<'enter' | 'show' | 'exit'>('enter');

  useEffect(() => {
    // Enter → Show
    const showTimer = setTimeout(() => setStage('show'), 100);
    // Show → Exit
    const exitTimer = setTimeout(() => setStage('exit'), 2000);
    // Complete callback
    const completeTimer = setTimeout(() => onComplete(), 2500);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const rarityColor = getRarityColor(reward.rarity);
  const rarityGlow = getRarityGlow(reward.rarity);

  return (
    <div
      className={`
        fixed inset-0 flex items-center justify-center z-50 pointer-events-none
        transition-opacity duration-300
        ${stage === 'enter' ? 'opacity-0' : stage === 'exit' ? 'opacity-0' : 'opacity-100'}
      `}
    >
      {/* Backdrop flash */}
      <div
        className={`
          absolute inset-0 transition-opacity duration-300
          ${stage === 'show' ? 'opacity-30' : 'opacity-0'}
        `}
        style={{ background: `radial-gradient(circle, ${rarityColor}40, transparent)` }}
      />

      {/* Reward card */}
      <div
        className={`
          relative px-6 py-4 sm:px-8 sm:py-6 rounded-2xl text-center
          transition-all duration-500
          ${stage === 'show' ? 'scale-100 translate-y-0' : 'scale-50 translate-y-10'}
        `}
        style={{
          background: 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.95))',
          border: `2px solid ${rarityColor}`,
          boxShadow: rarityGlow,
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Rarity label */}
        <div
          className="text-xs font-bold uppercase tracking-widest mb-2"
          style={{ color: rarityColor }}
        >
          {reward.rarity === 'Legendary' && '✨ '}
          {reward.rarity}
          {reward.rarity === 'Legendary' && ' ✨'}
        </div>

        {/* Icon */}
        <div className="text-4xl sm:text-5xl mb-2 animate-bounce-once">
          {reward.icon}
        </div>

        {/* Item name */}
        <div className="text-lg sm:text-xl font-bold text-white">
          {reward.name}
        </div>

        {/* Description */}
        <div className="text-xs text-slate-400 mt-1">
          {reward.description}
        </div>

        {/* Sparkle effects for legendary */}
        {reward.rarity === 'Legendary' && (
          <>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-sparkle"
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${10 + Math.random() * 80}%`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
