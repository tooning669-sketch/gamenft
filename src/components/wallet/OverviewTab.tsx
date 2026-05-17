'use client';
import React from 'react';
import { Coins, Gem, DollarSign, Package, ShieldCheck, Download, Upload, ArrowRightLeft, Clock, CheckCircle } from 'lucide-react';

interface OverviewTabProps {
  playerCoins: number;
  playerGems: number;
  playerUsdt: number;
  totalItems: number;
  onGoToTab: (tab: string) => void;
}

const MOCK_TXS = [
  { type: 'Deposit', amount: 50, currency: 'USDT', status: 'Completed', date: '2026-05-17', hash: '0x8a3f...c21e' },
  { type: 'Exchange', amount: 1750, currency: 'Coins', status: 'Completed', date: '2026-05-16', hash: '0x7b2d...a91f' },
  { type: 'Withdraw', amount: 25, currency: 'USDT', status: 'Pending', date: '2026-05-15', hash: '0x3c4e...d82a' },
];

export default function OverviewTab({ playerCoins, playerGems, playerUsdt, totalItems, onGoToTab }: OverviewTabProps) {
  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Game Balance */}
        <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, rgba(6,28,44,0.95), rgba(8,48,62,0.85))', border: '1px solid rgba(45,212,191,0.2)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(234,179,8,0.15)' }}><Coins size={16} className="text-yellow-400" /></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Game Balance</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Coins</span>
              <span className="text-sm font-bold text-yellow-400">{playerCoins.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Gems</span>
              <span className="text-sm font-bold text-cyan-400">{playerGems.toLocaleString()}</span>
            </div>
            <div className="h-px bg-slate-700/50" />
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Total Items</span>
              <span className="text-sm font-bold text-teal-300">{totalItems}</span>
            </div>
          </div>
        </div>

        {/* Crypto Balance */}
        <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, rgba(6,28,44,0.95), rgba(8,48,62,0.85))', border: '1px solid rgba(34,197,94,0.25)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.15)' }}><DollarSign size={16} className="text-emerald-400" /></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Crypto Balance</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">USDT Balance</span>
              <span className="text-lg font-extrabold text-emerald-400">${playerUsdt.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Network</span>
              <span className="text-xs font-semibold text-sky-300 px-2 py-0.5 rounded-full" style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)' }}>ERC-20</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Wallet</span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1"><ShieldCheck size={12} /> Connected</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, rgba(6,28,44,0.95), rgba(8,48,62,0.85))', border: '1px solid rgba(34,211,238,0.2)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(34,211,238,0.15)' }}><ArrowRightLeft size={16} className="text-teal-300" /></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Actions</span>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Deposit USDT', icon: Download, color: '#22c55e', tab: 'deposit' },
              { label: 'Withdraw USDT', icon: Upload, color: '#f59e0b', tab: 'withdraw' },
              { label: 'Exchange Currency', icon: ArrowRightLeft, color: '#22d3ee', tab: 'exchange' },
            ].map(a => (
              <button key={a.tab} onClick={() => onGoToTab(a.tab)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
                style={{ background: `${a.color}10`, border: `1px solid ${a.color}25`, color: a.color }}>
                <a.icon size={14} />{a.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, rgba(6,28,44,0.95), rgba(8,48,62,0.85))', border: '1px solid rgba(45,212,191,0.15)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Transactions</span>
          </div>
          <button onClick={() => onGoToTab('history')} className="text-[10px] text-teal-400 font-semibold hover:underline cursor-pointer">View All</button>
        </div>
        <div className="space-y-2">
          {MOCK_TXS.map((tx, i) => (
            <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: 'rgba(8,47,73,0.5)' }}>
              <div className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${tx.type === 'Deposit' ? 'bg-emerald-500/15' : tx.type === 'Withdraw' ? 'bg-amber-500/15' : 'bg-cyan-500/15'}`}>
                  {tx.type === 'Deposit' ? <Download size={13} className="text-emerald-400" /> : tx.type === 'Withdraw' ? <Upload size={13} className="text-amber-400" /> : <ArrowRightLeft size={13} className="text-cyan-400" />}
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">{tx.type}</div>
                  <div className="text-[10px] text-slate-500">{tx.date}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-white">{tx.amount} {tx.currency}</div>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${tx.status === 'Completed' ? 'text-emerald-400 bg-emerald-500/15' : 'text-amber-400 bg-amber-500/15'}`}>{tx.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
