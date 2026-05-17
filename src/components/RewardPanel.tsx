'use client';

import React from 'react';
import { Reward, DROP_RATES, PlayerState } from '@/lib/gameTypes';
import { getRarityColor } from '@/lib/gameUtils';
import { Trophy, Gift, Map, Star } from 'lucide-react';

interface RewardPanelProps {
  rewards: Reward[];
  stats: { common: number; rare: number; legendary: number; total: number };
  player: PlayerState;
  onRandomize: () => void;
  onChangeMap: () => void;
  isRoundActive: boolean;
  randomizeCost: number;
}

export default function RewardPanel({ rewards, stats, player, onRandomize, onChangeMap, isRoundActive, randomizeCost }: RewardPanelProps) {
  const canAffordRandomize = player.coins >= randomizeCost;

  // Show only last 3 rewards (newest first)
  const latestRewards = rewards.slice(-3).reverse();

  return (
    <div
      className="h-full rounded-2xl p-4 sm:p-5 flex flex-col"
      style={{
        background: 'linear-gradient(180deg, rgba(6, 28, 44, 0.94), rgba(8, 48, 62, 0.88))',
        border: '1px solid rgba(45, 212, 191, 0.15)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      }}
    >
      {/* Header */}
      <h2 className="text-base font-bold text-transparent bg-clip-text uppercase tracking-wider text-center mb-4 flex items-center justify-center gap-2"
        style={{ backgroundImage: 'linear-gradient(135deg, #fde68a, #a3e635, #67e8f9)' }}>
        <Trophy size={18} className="text-amber-400" />
        Reward Rate
      </h2>

      {/* Drop rate bars */}
      <div className="space-y-3 mb-4">
        {(['Common', 'Rare', 'Legendary'] as const).map((rarity) => {
          const color = getRarityColor(rarity);
          const avgRate = ((DROP_RATES[1][rarity] + DROP_RATES[2][rarity] + DROP_RATES[3][rarity]) / 3) * 100;
          const count = rarity === 'Common' ? stats.common : rarity === 'Rare' ? stats.rare : stats.legendary;
          const starCount = rarity === 'Common' ? 1 : rarity === 'Rare' ? 2 : 3;

          return (
            <div key={rarity} className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold flex items-center gap-1" style={{ color }}>
                  {Array.from({ length: starCount }, (_, i) => (
                    <Star key={i} size={10} fill={color} stroke={color} />
                  ))}
                  {' '}{rarity.toUpperCase()}
                </span>
                <span className="text-xs text-slate-400">
                  {count}x | ~{avgRate.toFixed(0)}%
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-900/70 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${avgRate}%`,
                    background: `linear-gradient(90deg, ${color}, ${color}80)`,
                    boxShadow: `0 0 8px ${color}40`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Change Map Button — only works during active round */}
      <button
        onClick={onChangeMap}
        disabled={!isRoundActive}
        className={`
          w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider
          transition-all duration-200 cursor-pointer mb-4
          flex items-center justify-center gap-2
          ${isRoundActive
            ? 'hover:scale-105 active:scale-95'
            : 'opacity-35 cursor-not-allowed'
          }
        `}
        style={{
          background: isRoundActive
            ? 'linear-gradient(135deg, #8b5cf6, #6366f1)'
            : 'linear-gradient(135deg, #1e293b, #0f172a)',
          boxShadow: isRoundActive
            ? '0 4px 20px rgba(139, 92, 246, 0.25)'
            : 'none',
          border: isRoundActive ? '1px solid rgba(139,92,246,0.3)' : '1px solid rgba(100,116,139,0.15)',
        }}
      >
        <Map size={16} className="text-white" />
        <span className="text-white">CHANGE MAP</span>
      </button>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-teal-500/20 to-transparent mb-4" />

      {/* Rewards header — only 3 latest */}
      <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <Gift size={14} />
        Latest Rewards
      </h3>

      {/* Latest 3 rewards list */}
      <div className="space-y-2 pr-1">
        {latestRewards.length === 0 ? (
          <div className="text-center text-slate-500 text-sm py-5">
            Pop balloons to earn rewards!
          </div>
        ) : (
          latestRewards.map((reward, idx) => {
            const rarityColor = getRarityColor(reward.rarity);
            return (
              <div
                key={`${reward.id}-${idx}`}
                className="flex items-center gap-3 rounded-xl p-3 transition-all duration-200 hover:scale-[1.02] animate-slide-in"
                style={{
                  background: 'rgba(6,28,44,0.7)',
                  border: `1px solid ${rarityColor}20`,
                }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${rarityColor}12`, border: `1px solid ${rarityColor}20` }}>
                  <Gift size={16} style={{ color: rarityColor }} />
                </div>
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
                    className="flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold animate-pulse"
                    style={{
                      background: `${rarityColor}15`,
                      color: rarityColor,
                      border: `1px solid ${rarityColor}30`,
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
