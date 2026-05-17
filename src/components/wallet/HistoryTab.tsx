'use client';
import React from 'react';
import { Clock, Download, Upload, ArrowRightLeft, FileText } from 'lucide-react';

const MOCK_HISTORY = [
  { type: 'Deposit', amount: 100, currency: 'USDT', status: 'Completed', date: '2026-05-17 14:23', hash: '0x8a3f92b1c4d5e6f7...c21e' },
  { type: 'Exchange', amount: 1750, currency: 'Coins', status: 'Completed', date: '2026-05-16 09:45', hash: '0x7b2de41f5a6b7c8d...a91f' },
  { type: 'Withdraw', amount: 25, currency: 'USDT', status: 'Pending', date: '2026-05-15 18:12', hash: '0x3c4e56d7e8f9a0b1...d82a' },
  { type: 'Deposit', amount: 50, currency: 'USDT', status: 'Completed', date: '2026-05-14 11:30', hash: '0x9d0e12f3a4b5c6d7...e93b' },
  { type: 'Exchange', amount: 5, currency: 'Gems', status: 'Completed', date: '2026-05-13 22:07', hash: '0x1a2b34c5d6e7f8g9...f04c' },
  { type: 'Withdraw', amount: 10, currency: 'USDT', status: 'Failed', date: '2026-05-12 15:55', hash: '0x4b5c67d8e9f0a1b2...a15d' },
];

function getStatusStyle(status: string) {
  if (status === 'Completed') return { color: '#34d399', bg: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)' };
  if (status === 'Pending') return { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)' };
  return { color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.25)' };
}

function getTypeIcon(type: string) {
  if (type === 'Deposit') return <Download size={13} className="text-emerald-400" />;
  if (type === 'Withdraw') return <Upload size={13} className="text-amber-400" />;
  return <ArrowRightLeft size={13} className="text-cyan-400" />;
}

export default function HistoryTab() {
  if (MOCK_HISTORY.length === 0) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-20 gap-4 rounded-2xl" style={{ background: 'rgba(6,28,44,0.6)', border: '1px dashed rgba(100,116,139,0.2)' }}>
        <FileText size={40} className="text-slate-600" />
        <span className="text-base text-slate-500 font-semibold">No transactions yet</span>
        <span className="text-xs text-slate-600">Your transaction history will appear here</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(6,28,44,0.98), rgba(8,48,62,0.92))', border: '1px solid rgba(45,212,191,0.15)', backdropFilter: 'blur(12px)' }}>
        {/* Table Header */}
        <div className="hidden sm:grid grid-cols-6 gap-2 px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b" style={{ borderColor: 'rgba(125,211,252,0.1)' }}>
          <span>Type</span><span>Amount</span><span>Currency</span><span>Status</span><span>Date</span><span>Tx Hash</span>
        </div>

        {/* Rows */}
        <div className="divide-y" style={{ borderColor: 'rgba(125,211,252,0.06)' }}>
          {MOCK_HISTORY.map((tx, i) => {
            const st = getStatusStyle(tx.status);
            return (
              <div key={i} className="grid grid-cols-2 sm:grid-cols-6 gap-2 px-5 py-3 items-center hover:bg-slate-800/30 transition-all">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${tx.type === 'Deposit' ? 'bg-emerald-500/15' : tx.type === 'Withdraw' ? 'bg-amber-500/15' : 'bg-cyan-500/15'}`}>
                    {getTypeIcon(tx.type)}
                  </div>
                  <span className="text-xs font-semibold text-white">{tx.type}</span>
                </div>
                <span className="text-xs font-bold text-white">{tx.amount.toLocaleString()}</span>
                <span className="text-xs text-slate-400 hidden sm:block">{tx.currency}</span>
                <span className="hidden sm:block">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ color: st.color, background: st.bg, border: st.border }}>{tx.status}</span>
                </span>
                <span className="text-[10px] text-slate-500 hidden sm:block">{tx.date}</span>
                <span className="text-[10px] text-slate-600 font-mono hidden sm:block truncate">{tx.hash}</span>
                {/* Mobile status */}
                <div className="sm:hidden text-right">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ color: st.color, background: st.bg, border: st.border }}>{tx.status}</span>
                  <div className="text-[9px] text-slate-500 mt-1">{tx.date}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
