'use client';

import React from 'react';
import { PlayerState } from '@/lib/gameTypes';
import { Wallet, Coins, Gem, DollarSign, Bitcoin, Target } from 'lucide-react';

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
        background: 'linear-gradient(180deg, rgba(6, 28, 44, 0.94), rgba(8, 48, 62, 0.88))',
        border: '1px solid rgba(45, 212, 191, 0.15)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      }}
    >
      {/* Player Avatar & Info */}
      <div className="text-center">
        <div
          className="mx-auto rounded-full flex items-center justify-center text-2xl mb-3"
          style={{
            width: '4.5rem',
            height: '4.5rem',
            background: 'linear-gradient(135deg, #22d3ee, #14b8a6, #10b981)',
            boxShadow: '0 0 24px rgba(34,211,238,0.25)',
            border: '3px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <Target size={28} className="text-white" />
        </div>
        <h2 className="text-base font-bold text-white">Player#4287</h2>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-teal-500/20 to-transparent" />

      {/* Wallet Section */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold text-teal-300 uppercase tracking-wider text-center flex items-center justify-center gap-1.5">
          <Wallet size={14} />
          Wallet
        </h3>
        <div className="flex items-center justify-between rounded-xl px-4 py-3 bg-slate-900/50 border border-yellow-500/15">
          <div className="flex items-center gap-2.5">
            <Coins size={20} className="text-yellow-400" />
            <div>
              <span className="text-sm font-bold text-yellow-400">{player.coins.toLocaleString()}</span>
              <div className="text-[10px] text-slate-500">Coins</div>
            </div>
          </div>
          <button className="w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-sm flex items-center justify-center hover:bg-emerald-500/25 transition-colors cursor-pointer">
            +
          </button>
        </div>
        <div className="flex items-center justify-between rounded-xl px-4 py-3 bg-slate-900/50 border border-cyan-500/15">
          <div className="flex items-center gap-2.5">
            <Gem size={20} className="text-cyan-400" />
            <div>
              <span className="text-sm font-bold text-cyan-400">{player.gems.toLocaleString()}</span>
              <div className="text-[10px] text-slate-500">Gems</div>
            </div>
          </div>
          <button className="w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-sm flex items-center justify-center hover:bg-emerald-500/25 transition-colors cursor-pointer">
            +
          </button>
        </div>
        <div className="flex items-center justify-between rounded-xl px-4 py-3 bg-slate-900/50 border border-emerald-500/15">
          <div className="flex items-center gap-2.5">
            <DollarSign size={20} className="text-emerald-400" />
            <div>
              <span className="text-sm font-bold text-emerald-400">{player.usdt.toFixed(2)}</span>
              <div className="text-[10px] text-slate-500">USDT</div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-xl px-4 py-3 bg-slate-900/50 border border-orange-500/15">
          <div className="flex items-center gap-2.5">
            <Bitcoin size={20} className="text-orange-400" />
            <div>
              <span className="text-sm font-bold text-orange-400">{player.btc.toFixed(6)}</span>
              <div className="text-[10px] text-slate-500">BTC</div>
            </div>
          </div>
        </div>
        {/* Open full wallet button */}
        {onOpenWallet && (
          <button
            onClick={onOpenWallet}
            className="w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-teal-200 bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <Wallet size={14} />
            Open Full Wallet
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-teal-500/20 to-transparent" />

      {/* Game Stats */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Balloons Left</span>
          <span className="font-bold text-white">{ballsRemaining} / {totalBalls}</span>
        </div>
        <div className="h-2.5 rounded-full bg-slate-900/70 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(ballsRemaining / totalBalls) * 100}%`,
              background: 'linear-gradient(90deg, #22d3ee, #14b8a6, #fbbf24)',
            }}
          />
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

    </div>
  );
}
