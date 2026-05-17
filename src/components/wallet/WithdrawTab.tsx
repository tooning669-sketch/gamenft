'use client';
import React, { useState, useMemo } from 'react';
import { playClickSound } from '../SoundManager';
import { DollarSign, AlertTriangle, Upload, ShieldCheck } from 'lucide-react';

interface WithdrawTabProps { playerUsdt: number; }

const FEE_RATE = 0.01; // 1%
const MIN_WITHDRAW = 5;

export default function WithdrawTab({ playerUsdt }: WithdrawTabProps) {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const numAmt = parseFloat(amount) || 0;
  const fee = useMemo(() => numAmt * FEE_RATE, [numAmt]);
  const receive = useMemo(() => Math.max(0, numAmt - fee), [numAmt, fee]);
  const canWithdraw = address.length >= 10 && numAmt >= MIN_WITHDRAW && numAmt <= playerUsdt;

  return (
    <div className="max-w-lg mx-auto">
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(6,28,44,0.98), rgba(8,48,62,0.92))', border: '1px solid rgba(245,158,11,0.25)', backdropFilter: 'blur(12px)', boxShadow: '0 0 60px rgba(245,158,11,0.06)' }}>
        <div className="px-5 py-5 space-y-4">
          {/* Balance */}
          <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}>
            <div className="text-xs text-slate-400 mb-1">Available Balance</div>
            <div className="text-3xl font-extrabold text-emerald-400 flex items-center justify-center gap-1.5"><DollarSign size={26} /> {playerUsdt.toFixed(2)} USDT</div>
          </div>

          {/* Network */}
          <div className="rounded-xl p-4" style={{ background: 'rgba(8,47,73,0.58)', border: '1px solid rgba(125,211,252,0.18)' }}>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Network</div>
            <div className="flex gap-2">
              {['ERC-20', 'BEP-20', 'TRC-20'].map((n, i) => (
                <button key={n} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${i === 0 ? 'text-amber-300 bg-amber-500/15 border border-amber-500/30' : 'text-slate-500 bg-slate-800/50 border border-slate-700/30 hover:text-slate-300'}`}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Withdraw Address */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Withdraw Address</div>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Enter wallet address (0x...)"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 text-sm font-mono text-white outline-none placeholder-slate-600 focus:border-amber-500/50 transition-all" />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Amount</span>
              <span className="text-[10px] text-slate-500">Available: <span className="text-white font-semibold">{playerUsdt.toFixed(2)}</span></span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50">
              <DollarSign size={16} className="text-amber-400" />
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" min={0}
                className="flex-1 bg-transparent text-sm font-bold text-white outline-none placeholder-slate-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
              <button onClick={() => { playClickSound(); setAmount(String(playerUsdt)); }} className="text-[10px] font-bold text-amber-400 hover:text-amber-300 cursor-pointer">MAX</button>
            </div>
          </div>

          {/* Summary */}
          {numAmt > 0 && (
            <div className="rounded-xl p-3 space-y-1.5" style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(125,211,252,0.16)' }}>
              <div className="flex justify-between text-[11px]"><span className="text-slate-500">Withdraw Amount</span><span className="text-white font-semibold">{numAmt.toFixed(2)} USDT</span></div>
              <div className="flex justify-between text-[11px]"><span className="text-slate-500">Fee (1%)</span><span className="text-rose-400 font-semibold">-{fee.toFixed(2)} USDT</span></div>
              <div className="h-px bg-slate-700/50 my-1" />
              <div className="flex justify-between text-[11px]"><span className="text-slate-500">You Will Receive</span><span className="text-green-400 font-bold text-sm">{receive.toFixed(2)} USDT</span></div>
            </div>
          )}

          {/* Warning */}
          <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <AlertTriangle size={14} className="text-amber-400 mt-0.5 shrink-0" />
            <div className="text-[10px] text-amber-400/90 leading-relaxed">
              Please double-check the withdrawal address and network. Transactions are <strong>irreversible</strong> and cannot be cancelled once confirmed. Minimum withdrawal: <strong>${MIN_WITHDRAW} USDT</strong>.
            </div>
          </div>

          {/* Confirm */}
          <button disabled={!canWithdraw}
            className={`w-full py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${canWithdraw ? 'hover:scale-[1.02] active:scale-95' : 'opacity-40 cursor-not-allowed'}`}
            style={{ background: canWithdraw ? 'linear-gradient(135deg, #f59e0b, #f97316)' : 'rgba(30,41,59,0.5)', border: canWithdraw ? '1px solid rgba(245,158,11,0.5)' : '1px solid rgba(100,116,139,0.2)', boxShadow: canWithdraw ? '0 0 20px rgba(245,158,11,0.28)' : 'none' }}>
            <Upload size={16} /><span>{canWithdraw ? `Confirm Withdraw $${receive.toFixed(2)}` : !address ? 'Enter Address' : numAmt < MIN_WITHDRAW ? `Min $${MIN_WITHDRAW}` : numAmt > playerUsdt ? 'Insufficient Balance' : 'Enter Details'}</span>
          </button>

          <p className="text-[9px] text-center text-slate-500 flex items-center justify-center gap-1"><ShieldCheck size={10} /> Withdrawals are processed within 10-30 minutes</p>
        </div>
      </div>
    </div>
  );
}
