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
        background: 'linear-gradient(180deg, rgba(5, 58, 75, 0.9), rgba(8, 96, 95, 0.82))',
        border: '1px solid rgba(125, 211, 252, 0.26)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 16px 36px rgba(8,47,73,0.22)',
      }}
    >
      {/* Player Avatar & Info */}
      <div className="text-center">
        <div
          className="w-18 h-18 sm:w-20 sm:h-20 mx-auto rounded-full flex items-center justify-center text-3xl sm:text-4xl mb-3"
          style={{
            width: '4.5rem',
            height: '4.5rem',
            background: 'linear-gradient(135deg, #fb7185, #facc15, #34d399)',
            boxShadow: '0 0 25px rgba(250, 204, 21, 0.34)',
            border: '3px solid rgba(255, 255, 255, 0.55)',
          }}
        >
          🎯
        </div>
        <h2 className="text-base sm:text-lg font-bold text-white">Player#4287</h2>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-cyan-200/35 to-transparent" />

      {/* Wallet Section */}
      <div className="space-y-3">
        <h3 className="text-xs sm:text-sm font-bold text-yellow-200 uppercase tracking-wider text-center">
          👛 Wallet
        </h3>
        <div className="flex items-center justify-between rounded-lg px-4 py-3 bg-cyan-950/40 border border-yellow-300/25">
          <div className="flex items-center gap-2.5">
            <span className="text-xl sm:text-2xl">🪙</span>
            <div>
              <span className="text-sm font-bold text-yellow-400">{player.coins.toLocaleString()}</span>
              <div className="text-[10px] text-cyan-100/70">Coins</div>
            </div>
          </div>
          <button className="w-7 h-7 rounded-full bg-green-600/20 border border-green-500/40 text-green-400 text-sm flex items-center justify-center hover:bg-green-600/40 transition-colors cursor-pointer">
            +
          </button>
        </div>
        <div className="flex items-center justify-between rounded-lg px-4 py-3 bg-cyan-950/40 border border-cyan-300/25">
          <div className="flex items-center gap-2.5">
            <span className="text-xl sm:text-2xl">💎</span>
            <div>
              <span className="text-sm font-bold text-cyan-400">{player.gems.toLocaleString()}</span>
              <div className="text-[10px] text-cyan-100/70">Gems</div>
            </div>
          </div>
          <button className="w-7 h-7 rounded-full bg-green-600/20 border border-green-500/40 text-green-400 text-sm flex items-center justify-center hover:bg-green-600/40 transition-colors cursor-pointer">
            +
          </button>
        </div>
        <div className="flex items-center justify-between rounded-lg px-4 py-3 bg-cyan-950/40 border border-green-400/25">
          <div className="flex items-center gap-2.5">
            <span className="text-xl sm:text-2xl">💵</span>
            <div>
              <span className="text-sm font-bold text-green-400">{player.usdt.toFixed(2)}</span>
              <div className="text-[10px] text-cyan-100/70">USDT</div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-lg px-4 py-3 bg-cyan-950/40 border border-orange-400/25">
          <div className="flex items-center gap-2.5">
            <span className="text-xl sm:text-2xl">₿</span>
            <div>
              <span className="text-sm font-bold text-orange-400">{player.btc.toFixed(6)}</span>
              <div className="text-[10px] text-cyan-100/70">BTC</div>
            </div>
          </div>
        </div>
        {/* Open full wallet button */}
        {onOpenWallet && (
          <button
            onClick={onOpenWallet}
            className="w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-yellow-100 bg-yellow-300/15 border border-yellow-200/30 hover:bg-yellow-300/25 transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            👛 Open Full Wallet
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-cyan-200/35 to-transparent" />

      {/* Game Stats */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-cyan-50/80">Balloons Left</span>
          <span className="font-bold text-white">{ballsRemaining} / {totalBalls}</span>
        </div>
        <div className="h-2.5 rounded-full bg-cyan-950/70 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(ballsRemaining / totalBalls) * 100}%`,
              background: 'linear-gradient(90deg, #34d399, #38bdf8, #facc15)',
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
          <div key={p.rank} className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 bg-cyan-950/35 border border-cyan-200/15">
            <span className="text-lg">{p.icon}</span>
            <span className="text-xs font-semibold text-white flex-1 truncate">{p.name}</span>
            <span className="text-[11px] text-yellow-400 font-mono">🪙{p.coins.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
