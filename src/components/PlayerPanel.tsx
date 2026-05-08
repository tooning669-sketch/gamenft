'use client';

import React from 'react';
import { PlayerState } from '@/lib/gameTypes';

interface PlayerPanelProps {
  player: PlayerState;
  ballsRemaining: number;
  totalBalls: number;
  onOpenWallet?: () => void;
}

export default function PlayerPanel({ player, ballsRemaining, totalBalls, onOpenWallet }: PlayerPanelProps) {
  const xpPercent = (player.xp / player.maxXp) * 100;

  return (
    <div
      className="h-full rounded-2xl p-4 sm:p-5 flex flex-col gap-4 sm:gap-5"
      style={{
        background: 'linear-gradient(180deg, rgba(15,10,40,0.95), rgba(30,15,60,0.9))',
        border: '1px solid rgba(236, 72, 153, 0.2)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 0 30px rgba(0,0,0,0.3)',
      }}
    >
      {/* Player Avatar & Info */}
      <div className="text-center">
        <div
          className="w-18 h-18 sm:w-20 sm:h-20 mx-auto rounded-full flex items-center justify-center text-3xl sm:text-4xl mb-3"
          style={{
            width: '4.5rem',
            height: '4.5rem',
            background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
            boxShadow: '0 0 25px rgba(236, 72, 153, 0.4)',
            border: '3px solid rgba(244, 114, 182, 0.5)',
          }}
        >
          🎯
        </div>
        <h2 className="text-base sm:text-lg font-bold text-white">Player#4287</h2>
        <div className="flex items-center justify-center gap-2 mt-1.5">
          <span className="text-xs sm:text-sm font-semibold text-pink-400">LV. {player.level}</span>
          <div className="w-20 sm:w-24 h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400">{xpPercent.toFixed(0)}%</span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent" />

      {/* Wallet Section */}
      <div className="space-y-3">
        <h3 className="text-xs sm:text-sm font-bold text-pink-300 uppercase tracking-wider text-center">
          👛 Wallet
        </h3>
        <div className="flex items-center justify-between rounded-lg px-4 py-3 bg-slate-800/50 border border-yellow-500/20">
          <div className="flex items-center gap-2.5">
            <span className="text-xl sm:text-2xl">🪙</span>
            <div>
              <span className="text-sm font-bold text-yellow-400">{player.coins.toLocaleString()}</span>
              <div className="text-[10px] text-slate-400">Coins</div>
            </div>
          </div>
          <button className="w-7 h-7 rounded-full bg-green-600/20 border border-green-500/40 text-green-400 text-sm flex items-center justify-center hover:bg-green-600/40 transition-colors cursor-pointer">
            +
          </button>
        </div>
        <div className="flex items-center justify-between rounded-lg px-4 py-3 bg-slate-800/50 border border-cyan-500/20">
          <div className="flex items-center gap-2.5">
            <span className="text-xl sm:text-2xl">💎</span>
            <div>
              <span className="text-sm font-bold text-cyan-400">{player.gems.toLocaleString()}</span>
              <div className="text-[10px] text-slate-400">Gems</div>
            </div>
          </div>
          <button className="w-7 h-7 rounded-full bg-green-600/20 border border-green-500/40 text-green-400 text-sm flex items-center justify-center hover:bg-green-600/40 transition-colors cursor-pointer">
            +
          </button>
        </div>
        {/* Open full wallet button */}
        {onOpenWallet && (
          <button
            onClick={onOpenWallet}
            className="w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-pink-300 bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            👛 Open Full Wallet
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent" />

      {/* Game Stats */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-300">Balloons Left</span>
          <span className="font-bold text-white">{ballsRemaining} / {totalBalls}</span>
        </div>
        <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(ballsRemaining / totalBalls) * 100}%`,
              background: 'linear-gradient(90deg, #ec4899, #a855f7)',
            }}
          />
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Top Earning Section */}
      <div className="space-y-2.5">
        <h3 className="text-xs sm:text-sm font-bold text-amber-400 uppercase tracking-wider text-center">
          🏅 Top Earning
        </h3>
        {[
          { rank: 1, name: 'CryptoKing', coins: 98750, icon: '👑' },
          { rank: 2, name: 'BubblePro', coins: 76200, icon: '🥈' },
          { rank: 3, name: 'NFT_Hero', coins: 54100, icon: '🥉' },
        ].map((p) => (
          <div key={p.rank} className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 bg-slate-800/40 border border-slate-700/30">
            <span className="text-lg">{p.icon}</span>
            <span className="text-xs font-semibold text-white flex-1 truncate">{p.name}</span>
            <span className="text-[11px] text-yellow-400 font-mono">🪙{p.coins.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
