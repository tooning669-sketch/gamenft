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
      className="h-full rounded-2xl p-4 sm:p-5 flex flex-col"
      style={{
        background: 'linear-gradient(180deg, rgba(5, 58, 75, 0.9), rgba(8, 96, 95, 0.82))',
        border: '1px solid rgba(125, 211, 252, 0.26)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 16px 36px rgba(8,47,73,0.22)',
      }}
    >
      {/* Header */}
      <h2 className="text-base sm:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-lime-200 to-cyan-200 uppercase tracking-wider text-center mb-4">
        🏆 Reward Rate
      </h2>

      {/* Drop rate bars */}
      <div className="space-y-3 mb-4">
        {(['Common', 'Rare', 'Legendary'] as const).map((rarity) => {
          const color = getRarityColor(rarity);
          const avgRate = ((DROP_RATES[1][rarity] + DROP_RATES[2][rarity] + DROP_RATES[3][rarity]) / 3) * 100;
          const count = rarity === 'Common' ? stats.common : rarity === 'Rare' ? stats.rare : stats.legendary;

          return (
            <div key={rarity} className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold" style={{ color }}>
                  {rarity === 'Common' && '⭐'}
                  {rarity === 'Rare' && '⭐⭐'}
                  {rarity === 'Legendary' && '⭐⭐⭐'}
                  {' '}{rarity.toUpperCase()}
                </span>
                <span className="text-xs text-slate-300">
                  {count}x | ~{avgRate.toFixed(0)}%
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-cyan-950/70 overflow-hidden">
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

      {/* Randomize Map Button (was Start Game, now changed) */}
      <button
        onClick={onRandomize}
        disabled={!canAffordRandomize}
        className={`
          w-full py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider
          transition-all duration-200 cursor-pointer mb-4
          flex items-center justify-center gap-2
          ${canAffordRandomize
            ? 'hover:scale-105 active:scale-95'
            : 'opacity-40 cursor-not-allowed'
          }
        `}
        style={{
          background: canAffordRandomize
            ? 'linear-gradient(135deg, #22c55e, #38bdf8, #facc15)'
            : 'linear-gradient(135deg, #475569, #334155)',
          boxShadow: canAffordRandomize
            ? '0 4px 20px rgba(56, 189, 248, 0.34), inset 0 1px 0 rgba(255,255,255,0.22)'
            : 'none',
          border: '1px solid rgba(255, 255, 255, 0.34)',
        }}
      >
        <span className="text-xl">🎲</span>
        <span className="text-white">เปลี่ยนแมพใหม่</span>
        <span className="text-yellow-300 text-xs">🪙{randomizeCost}</span>
      </button>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-cyan-200/35 to-transparent mb-4" />

      {/* Rewards header — only 3 latest */}
      <h3 className="text-sm sm:text-base font-bold text-yellow-200 uppercase tracking-wider mb-3">
        🎁 Latest Rewards
      </h3>

      {/* Latest 3 rewards list */}
      <div className="space-y-2 pr-1">
        {latestRewards.length === 0 ? (
          <div className="text-center text-slate-400 text-sm py-5">
            Pop balloons to earn rewards!
          </div>
        ) : (
          latestRewards.map((reward, idx) => {
            const rarityColor = getRarityColor(reward.rarity);
            return (
              <div
                key={`${reward.id}-${idx}`}
                className="flex items-center gap-3 rounded-lg p-3 transition-all duration-200 hover:scale-[1.02] animate-slide-in"
                style={{
                  background: 'rgba(8,47,73,0.56)',
                  border: `1px solid ${rarityColor}30`,
                }}
              >
                <div className="text-xl sm:text-2xl flex-shrink-0">{reward.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">
                    {reward.name}
                  </div>
                  <span
                    className="text-xs font-bold uppercase"
                    style={{ color: rarityColor }}
                  >
                    {reward.rarity}
                  </span>
                </div>
                {/* NEW badge for most recent */}
                {idx === 0 && (
                  <div
                    className="flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black animate-pulse"
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
