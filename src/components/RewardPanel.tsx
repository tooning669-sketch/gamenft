'use client';

import React from 'react';
import { Reward, DROP_RATES } from '@/lib/gameTypes';
import { getRarityColor, formatTimestamp } from '@/lib/gameUtils';

interface RewardPanelProps {
  rewards: Reward[];
  stats: { common: number; rare: number; legendary: number; total: number };
}

export default function RewardPanel({ rewards, stats }: RewardPanelProps) {
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
      <div className="space-y-2 mb-4">
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

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent mb-3" />

      {/* Rewards header */}
      <h3 className="text-xs sm:text-sm font-bold text-indigo-300 uppercase tracking-wider mb-2">
        🎁 Rewards ({stats.total})
      </h3>

      {/* Reward list */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar min-h-0">
        {rewards.length === 0 ? (
          <div className="text-center text-slate-500 text-xs py-8">
            Pop balls to earn rewards!
          </div>
        ) : (
          [...rewards].reverse().map((reward) => {
            const rarityColor = getRarityColor(reward.rarity);
            return (
              <div
                key={reward.id}
                className="flex items-center gap-2 rounded-lg p-2 transition-all duration-200 hover:scale-[1.02] animate-slide-in"
                style={{
                  background: 'rgba(15,23,42,0.6)',
                  border: `1px solid ${rarityColor}30`,
                }}
              >
                <div className="text-lg sm:text-xl flex-shrink-0">{reward.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white truncate">{reward.name}</div>
                  <div className="flex items-center gap-1">
                    <span
                      className="text-[9px] sm:text-[10px] font-bold uppercase"
                      style={{ color: rarityColor }}
                    >
                      {reward.rarity}
                    </span>
                    <span className="text-[9px] text-slate-500">
                      {formatTimestamp(reward.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
