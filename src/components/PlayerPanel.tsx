'use client';

import React from 'react';
import { PlayerState } from '@/lib/gameTypes';

interface PlayerPanelProps {
  player: PlayerState;
  ballsRemaining: number;
  totalBalls: number;
}

export default function PlayerPanel({ player, ballsRemaining, totalBalls }: PlayerPanelProps) {
  const xpPercent = (player.xp / player.maxXp) * 100;

  return (
    <div
      className="h-full rounded-2xl p-3 sm:p-4 flex flex-col gap-3 sm:gap-4"
      style={{
        background: 'linear-gradient(180deg, rgba(15,23,42,0.95), rgba(30,41,59,0.9))',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 0 30px rgba(0,0,0,0.3)',
      }}
    >
      {/* Player Avatar & Info */}
      <div className="text-center">
        <div
          className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full flex items-center justify-center text-2xl sm:text-3xl mb-2"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
            border: '2px solid rgba(165, 180, 252, 0.5)',
          }}
        >
          🎯
        </div>
        <h2 className="text-sm sm:text-base font-bold text-white">Player#4287</h2>
        <div className="flex items-center justify-center gap-1.5 mt-1">
          <span className="text-[10px] sm:text-xs font-semibold text-indigo-400">LV. {player.level}</span>
          <div className="w-16 sm:w-20 h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
          <span className="text-[9px] text-slate-500">{xpPercent.toFixed(0)}%</span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

      {/* Currency */}
      <div className="space-y-2">
        <div className="flex items-center justify-between rounded-lg px-3 py-2 bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg">🪙</span>
            <span className="text-xs font-semibold text-yellow-400">{player.coins.toLocaleString()}</span>
          </div>
          <button className="w-5 h-5 rounded-full bg-green-600/20 border border-green-500/40 text-green-400 text-xs flex items-center justify-center hover:bg-green-600/40 transition-colors">
            +
          </button>
        </div>
        <div className="flex items-center justify-between rounded-lg px-3 py-2 bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg">💎</span>
            <span className="text-xs font-semibold text-cyan-400">{player.gems.toLocaleString()}</span>
          </div>
          <button className="w-5 h-5 rounded-full bg-green-600/20 border border-green-500/40 text-green-400 text-xs flex items-center justify-center hover:bg-green-600/40 transition-colors">
            +
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

      {/* Game Stats */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Balloons Left</span>
          <span className="font-bold text-white">{ballsRemaining} / {totalBalls}</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(ballsRemaining / totalBalls) * 100}%`,
              background: 'linear-gradient(90deg, #6366f1, #a855f7)',
            }}
          />
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Top Earning Section */}
      <div className="space-y-2">
        <h3 className="text-[10px] sm:text-xs font-bold text-amber-400 uppercase tracking-wider text-center">
          🏅 Top Earning
        </h3>
        {[
          { rank: 1, name: 'CryptoKing', coins: 98750, icon: '👑' },
          { rank: 2, name: 'BubblePro', coins: 76200, icon: '🥈' },
          { rank: 3, name: 'NFT_Hero', coins: 54100, icon: '🥉' },
        ].map((p) => (
          <div key={p.rank} className="flex items-center gap-2 rounded-lg px-2 py-1.5 bg-slate-800/40 border border-slate-700/30">
            <span className="text-sm">{p.icon}</span>
            <span className="text-[10px] font-semibold text-white flex-1 truncate">{p.name}</span>
            <span className="text-[9px] text-yellow-400 font-mono">🪙{p.coins.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
