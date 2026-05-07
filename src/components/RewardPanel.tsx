'use client';

import React from 'react';
import { Reward, DROP_RATES, PlayerState } from '@/lib/gameTypes';
import { getRarityColor } from '@/lib/gameUtils';

interface RewardPanelProps {
  rewards: Reward[];
  stats: { common: number; rare: number; legendary: number; total: number };
  player: PlayerState;
  onRandomize: () => void;
  randomizeCost: number;
}

export default function RewardPanel({ rewards, stats, player, onRandomize, randomizeCost }: RewardPanelProps) {
  const canAffordRandomize = player.coins >= randomizeCost;

  // Show only last 3 rewards (newest first)
  const latestRewards = rewards.slice(-3).reverse();

  return (
    <div
      className="h-full rounded-2xl p-3 sm:p-4 flex flex-col"
      style={{
        background: 'linear-gradient(180deg, rgba(15,23,42,0.95), rgba(30,41,59,0.9))',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 0 30px rgba(0,0,0,0.3)',
      }}
    >
      {/* Header */}
      <h2 className="text-sm sm:text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 uppercase tracking-wider text-center mb-3">
        🏆 Reward Rate
      </h2>

      {/* Drop rate bars */}
      <div className="space-y-2 mb-3">
        {(['Common', 'Rare', 'Legendary'] as const).map((rarity) => {
          const color = getRarityColor(rarity);
          const avgRate = ((DROP_RATES[1][rarity] + DROP_RATES[2][rarity] + DROP_RATES[3][rarity]) / 3) * 100;
          const count = rarity === 'Common' ? stats.common : rarity === 'Rare' ? stats.rare : stats.legendary;

          return (
            <div key={rarity} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold" style={{ color }}>
                  {rarity === 'Common' && '⭐'}
                  {rarity === 'Rare' && '⭐⭐'}
                  {rarity === 'Legendary' && '⭐⭐⭐'}
                  {' '}{rarity.toUpperCase()}
                </span>
                <span className="text-[10px] text-slate-400">
                  {count}x | ~{avgRate.toFixed(0)}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${avgRate}%`,
                    background: `linear-gradient(90deg, ${color}, ${color}80)`,
                    boxShadow: `0 0 6px ${color}60`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Randomize Map Button */}
      <button
        onClick={onRandomize}
        disabled={!canAffordRandomize}
        className={`
          w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider
          transition-all duration-200 cursor-pointer mb-3
          flex items-center justify-center gap-2
          ${canAffordRandomize
            ? 'hover:scale-105 active:scale-95'
            : 'opacity-40 cursor-not-allowed'
          }
        `}
        style={{
          background: canAffordRandomize
            ? 'linear-gradient(135deg, #8b5cf6, #6366f1, #3b82f6)'
            : 'linear-gradient(135deg, #475569, #334155)',
          boxShadow: canAffordRandomize
            ? '0 4px 20px rgba(99, 102, 241, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
            : 'none',
          border: '1px solid rgba(139, 92, 246, 0.3)',
        }}
      >
        <span className="text-lg">🎲</span>
        <span className="text-white">START GAME</span>
        <span className="text-yellow-300 text-[10px]">🪙{randomizeCost}</span>
      </button>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent mb-3" />

      {/* Rewards header — only 3 latest */}
      <h3 className="text-xs sm:text-sm font-bold text-indigo-300 uppercase tracking-wider mb-2">
        🎁 Latest Rewards
      </h3>

      {/* Latest 3 rewards list */}
      <div className="space-y-1.5 pr-1">
        {latestRewards.length === 0 ? (
          <div className="text-center text-slate-500 text-xs py-4">
            Pop balloons to earn rewards!
          </div>
        ) : (
          latestRewards.map((reward, idx) => {
            const rarityColor = getRarityColor(reward.rarity);
            return (
              <div
                key={`${reward.id}-${idx}`}
                className="flex items-center gap-2 rounded-lg p-2 transition-all duration-200 hover:scale-[1.02] animate-slide-in"
                style={{
                  background: 'rgba(15,23,42,0.6)',
                  border: `1px solid ${rarityColor}30`,
                }}
              >
                <div className="text-lg sm:text-xl flex-shrink-0">{reward.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white truncate">
                    {reward.name}
                  </div>
                  <span
                    className="text-[9px] sm:text-[10px] font-bold uppercase"
                    style={{ color: rarityColor }}
                  >
                    {reward.rarity}
                  </span>
                </div>
                {/* NEW badge for most recent */}
                {idx === 0 && (
                  <div
                    className="flex-shrink-0 px-2 py-0.5 rounded-full text-[9px] font-black animate-pulse"
                    style={{
                      background: `${rarityColor}20`,
                      color: rarityColor,
                      border: `1px solid ${rarityColor}40`,
                    }}
                  >
                    NEW
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />
    </div>
  );
}
