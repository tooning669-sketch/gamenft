'use client';
import React, { useState } from 'react';
import { playClickSound } from '../SoundManager';
import { DollarSign, Copy, AlertTriangle, Clock, ShieldCheck, Download, CheckCircle } from 'lucide-react';

interface DepositTabProps {
  playerUsdt: number;
  onTopUp?: (amount: number) => void;
}

const DEPOSIT_ADDRESS = '0x8F21a5b7C3dE9f42A1b8D6E7c90F12345678a3B';

export default function DepositTab({ playerUsdt, onTopUp }: DepositTabProps) {
  const [topUpAmount, setTopUpAmount] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    playClickSound();
    navigator.clipboard?.writeText(DEPOSIT_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(6,28,44,0.98), rgba(8,48,62,0.92))', border: '1px solid rgba(34,197,94,0.25)', backdropFilter: 'blur(12px)', boxShadow: '0 0 60px rgba(34,197,94,0.08)' }}>
        <div className="px-5 py-5 space-y-4">
          {/* Current Balance */}
          <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}>
            <div className="text-xs text-slate-400 mb-1">Current USDT Balance</div>
            <div className="text-3xl font-extrabold text-emerald-400 flex items-center justify-center gap-1.5"><DollarSign size={26} /> {playerUsdt.toFixed(2)} USDT</div>
          </div>

          {/* Network */}
          <div className="rounded-xl p-4" style={{ background: 'rgba(8,47,73,0.58)', border: '1px solid rgba(125,211,252,0.18)' }}>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Network</div>
            <div className="flex gap-2">
              {['ERC-20', 'BEP-20', 'TRC-20'].map((n, i) => (
                <button key={n} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${i === 0 ? 'text-emerald-300 bg-emerald-500/15 border border-emerald-500/30' : 'text-slate-500 bg-slate-800/50 border border-slate-700/30 hover:text-slate-300'}`}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Deposit Address */}
          <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(8,47,73,0.58)', border: '1px solid rgba(125,211,252,0.18)' }}>
            <div className="text-[10px] font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1"><ShieldCheck size={12} /> Deposit Address (ERC-20)</div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-[10px] text-green-300 font-mono bg-slate-900/60 rounded-lg p-2.5 break-all">{DEPOSIT_ADDRESS}</code>
              <button onClick={handleCopy}
                className="px-3 py-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center gap-1"
                style={{ color: copied ? '#22c55e' : '#67e8f9', background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(6,182,212,0.15)', border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'rgba(6,182,212,0.3)'}` }}>
                {copied ? <><CheckCircle size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
              </button>
            </div>

            {/* QR Placeholder */}
            <div className="flex justify-center py-3">
              <div className="w-32 h-32 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(125,211,252,0.2)' }}>
                <div className="text-center"><Download size={20} className="text-slate-600 mx-auto mb-1" /><span className="text-[9px] text-slate-600">QR Code</span></div>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <AlertTriangle size={14} className="text-amber-400 mt-0.5 shrink-0" />
            <div className="text-[10px] text-amber-400/90 leading-relaxed">
              Send only <strong>USDT</strong> on the <strong>ERC-20</strong> network to this address. Sending other tokens or using a different network may result in permanent loss of funds.
            </div>
          </div>

          {/* Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(8,47,73,0.4)' }}>
              <div className="text-[9px] text-slate-500 uppercase mb-1">Min. Deposit</div>
              <div className="text-sm font-bold text-white">$1.00</div>
            </div>
            <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(8,47,73,0.4)' }}>
              <div className="text-[9px] text-slate-500 uppercase mb-1">Est. Confirmation</div>
              <div className="text-sm font-bold text-white flex items-center justify-center gap-1"><Clock size={12} /> 1-5 min</div>
            </div>
          </div>

          {/* Quick Amount (Optional) */}
          {onTopUp && (
            <>
              <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Quick Deposit (Demo)</div>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 25, 50, 100, 250, 500, 1000, 5000].map(amt => (
                    <button key={amt} onClick={() => { playClickSound(); setTopUpAmount(String(amt)); }}
                      className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer hover:scale-105 active:scale-95 ${topUpAmount === String(amt) ? 'text-green-300 bg-green-500/20 border border-green-500/40' : 'text-slate-300 bg-slate-800/50 border border-slate-700/30 hover:bg-slate-700/50'}`}>
                      ${amt}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 flex-1 px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50">
                  <DollarSign size={16} className="text-emerald-400" />
                  <input type="number" value={topUpAmount} onChange={e => setTopUpAmount(e.target.value)} placeholder="Custom amount" min={1}
                    className="flex-1 bg-transparent text-sm font-bold text-green-400 outline-none placeholder-slate-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  <span className="text-[10px] text-slate-500 font-semibold">USDT</span>
                </div>
              </div>
              <button onClick={() => { const amt = parseFloat(topUpAmount); if (!amt || amt <= 0) return; playClickSound(); onTopUp(amt); setTopUpAmount(''); }}
                disabled={!topUpAmount || parseFloat(topUpAmount) <= 0}
                className={`w-full py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${topUpAmount && parseFloat(topUpAmount) > 0 ? 'hover:scale-[1.02] active:scale-95' : 'opacity-40 cursor-not-allowed'}`}
                style={{ background: topUpAmount && parseFloat(topUpAmount) > 0 ? 'linear-gradient(135deg, #22c55e, #10b981)' : 'rgba(30,41,59,0.5)', border: topUpAmount && parseFloat(topUpAmount) > 0 ? '1px solid rgba(34,197,94,0.5)' : '1px solid rgba(100,116,139,0.2)', boxShadow: topUpAmount && parseFloat(topUpAmount) > 0 ? '0 0 20px rgba(34,197,94,0.28)' : 'none' }}>
                <Download size={16} /><span>{topUpAmount && parseFloat(topUpAmount) > 0 ? `Deposit $${parseFloat(topUpAmount).toFixed(2)} USDT` : 'Enter Amount'}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
