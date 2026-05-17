'use client';
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { CurrencyType, USDT_TO_GOLD, DIAMOND_TO_USDT, DIAMOND_TO_GOLD, EXCHANGE_FEE_PERCENT, GOLD_TO_THB } from '@/lib/gameTypes';
import { playClickSound, playRewardSound } from '../SoundManager';
import { Coins, Gem, DollarSign, ArrowUpDown, Check, BarChart3 } from 'lucide-react';

interface ExchangeTabProps {
  coins: number; gems: number; usdt: number;
  onExchange: (from: CurrencyType, to: CurrencyType, fromAmount: number, toAmount: number) => void;
}

const CINFO: Record<CurrencyType, { label: string; color: string; Icon: typeof Coins }> = {
  coins: { label: 'Gold', color: '#eab308', Icon: Coins },
  gems: { label: 'Diamond', color: '#06b6d4', Icon: Gem },
  usdt: { label: 'USDT', color: '#22c55e', Icon: DollarSign },
};

function getRate(from: CurrencyType, to: CurrencyType): number {
  if (from === to) return 1;
  if (from === 'coins' && to === 'gems') return 1 / DIAMOND_TO_GOLD;
  if (from === 'gems' && to === 'coins') return DIAMOND_TO_GOLD;
  if (from === 'coins' && to === 'usdt') return 1 / USDT_TO_GOLD;
  if (from === 'usdt' && to === 'coins') return USDT_TO_GOLD;
  if (from === 'gems' && to === 'usdt') return DIAMOND_TO_USDT;
  if (from === 'usdt' && to === 'gems') return 1 / DIAMOND_TO_USDT;
  return 0;
}

function getBal(type: CurrencyType, c: number, g: number, u: number) {
  return type === 'coins' ? c : type === 'gems' ? g : u;
}

export default function ExchangeTab({ coins, gems, usdt, onExchange }: ExchangeTabProps) {
  const [fromCurrency, setFromCurrency] = useState<CurrencyType>('coins');
  const [toCurrency, setToCurrency] = useState<CurrencyType>('gems');
  const [amount, setAmount] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [showDdFrom, setShowDdFrom] = useState(false);
  const [showDdTo, setShowDdTo] = useState(false);

  const numAmt = parseFloat(amount) || 0;
  const rate = useMemo(() => getRate(fromCurrency, toCurrency), [fromCurrency, toCurrency]);
  const rawRcv = numAmt * rate;
  const fee = rawRcv * (EXCHANGE_FEE_PERCENT / 100);
  const netRcv = rawRcv - fee;
  const fromBal = getBal(fromCurrency, coins, gems, usdt);
  const canEx = numAmt > 0 && numAmt <= fromBal && fromCurrency !== toCurrency;

  const fmt = (n: number) => { if (n >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 2 }); if (n < 0.01 && n > 0) return n.toFixed(4); return n.toFixed(2); };

  const handleSwap = useCallback(() => {
    setIsSwapping(true); playClickSound();
    setTimeout(() => { setFromCurrency(toCurrency); setToCurrency(fromCurrency); setAmount(''); setIsSwapping(false); }, 300);
  }, [fromCurrency, toCurrency]);

  const handleExchange = useCallback(() => {
    if (!canEx) return;
    playClickSound(); playRewardSound(false);
    onExchange(fromCurrency, toCurrency, numAmt, netRcv);
    setShowSuccess(true); setAmount('');
    setTimeout(() => setShowSuccess(false), 2500);
  }, [canEx, fromCurrency, toCurrency, numAmt, netRcv, onExchange]);

  const handlePct = useCallback((pct: number) => {
    playClickSound();
    const bal = getBal(fromCurrency, coins, gems, usdt);
    const val = fromCurrency === 'coins' ? Math.floor(bal * pct / 100) : parseFloat((bal * pct / 100).toFixed(2));
    setAmount(String(val));
  }, [fromCurrency, coins, gems, usdt]);

  useEffect(() => {
    const h = () => { setShowDdFrom(false); setShowDdTo(false); };
    document.addEventListener('click', h); return () => document.removeEventListener('click', h);
  }, []);

  const renderSelector = (sel: CurrencyType, showDd: boolean, setDd: (v: boolean) => void, onChange: (c: CurrencyType) => void, excl: CurrencyType) => {
    const ci = CINFO[sel];
    return (
      <div className="relative" onClick={e => e.stopPropagation()}>
        <button onClick={() => { playClickSound(); setDd(!showDd); }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer hover:scale-105 active:scale-95"
          style={{ background: `${ci.color}15`, border: `1px solid ${ci.color}40`, color: ci.color }}>
          <ci.Icon size={16} /><span>{ci.label}</span><span className="text-[10px] opacity-60">&#9660;</span>
        </button>
        {showDd && (
          <div className="absolute top-full left-0 mt-1 z-50 rounded-xl overflow-hidden min-w-[140px] animate-slide-in" style={{ background: 'rgba(7,47,62,0.98)', border: '1px solid rgba(125,211,252,0.3)', boxShadow: '0 10px 40px rgba(0,0,0,0.45)' }}>
            {(Object.keys(CINFO) as CurrencyType[]).filter(c => c !== excl).map(c => {
              const i = CINFO[c];
              return (<button key={c} onClick={() => { playClickSound(); onChange(c); setDd(false); setAmount(''); }}
                className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer hover:bg-slate-700/50 ${c === sel ? 'bg-slate-700/30' : ''}`} style={{ color: i.color }}>
                <i.Icon size={16} /><span>{i.label}</span>{c === sel && <span className="ml-auto text-[10px]"><Check size={12} /></span>}
              </button>);
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(6,28,44,0.98), rgba(8,48,62,0.92))', border: '1px solid rgba(125,211,252,0.25)', backdropFilter: 'blur(12px)', boxShadow: '0 0 60px rgba(45,212,191,0.1)' }}>
        {/* Balance Overview */}
        <div className="flex items-center justify-center gap-4 px-5 py-4 border-b" style={{ borderColor: 'rgba(125,211,252,0.1)' }}>
          {(Object.keys(CINFO) as CurrencyType[]).map(c => {
            const ci = CINFO[c]; const bal = getBal(c, coins, gems, usdt);
            return (<div key={c} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: `${ci.color}08`, border: `1px solid ${ci.color}15` }}>
              <ci.Icon size={14} style={{ color: ci.color }} /><span className="text-xs font-bold" style={{ color: ci.color }}>{bal.toLocaleString()}</span>
            </div>);
          })}
        </div>

        <div className="px-5 py-4 space-y-3">
          {/* FROM */}
          <div className="rounded-xl p-3" style={{ background: 'rgba(8,47,73,0.58)', border: '1px solid rgba(125,211,252,0.18)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">From</span>
              <span className="text-[10px] text-slate-500">Balance: <span className="text-white font-semibold">{fromBal.toLocaleString()}</span></span>
            </div>
            <div className="flex items-center gap-3">
              {renderSelector(fromCurrency, showDdFrom, setShowDdFrom, setFromCurrency, toCurrency)}
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" min={0}
                className="flex-1 bg-transparent text-right text-xl font-black text-white outline-none placeholder-slate-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
            </div>
            <div className="flex gap-1.5 mt-2">
              {[25, 50, 75, 100].map(p => (
                <button key={p} onClick={() => handlePct(p)} className="flex-1 py-1 rounded-lg text-[10px] font-bold text-slate-400 bg-slate-800/60 border border-slate-700/30 hover:text-white hover:bg-slate-700/50 transition-all cursor-pointer hover:scale-105 active:scale-95">{p === 100 ? 'Max' : `${p}%`}</button>
              ))}
            </div>
          </div>

          {/* Swap */}
          <div className="flex justify-center -my-1 relative z-10">
            <button onClick={handleSwap} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-90 ${isSwapping ? 'animate-spin' : ''}`}
              style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.28), rgba(250,204,21,0.18))', border: '2px solid rgba(125,211,252,0.52)', boxShadow: '0 0 20px rgba(56,189,248,0.22)' }}>
              <ArrowUpDown size={18} className="text-teal-300" />
            </button>
          </div>

          {/* TO */}
          <div className="rounded-xl p-3" style={{ background: 'rgba(8,47,73,0.58)', border: '1px solid rgba(125,211,252,0.18)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">To (You Receive)</span>
              <span className="text-[10px] text-slate-500">Balance: <span className="text-white font-semibold">{getBal(toCurrency, coins, gems, usdt).toLocaleString()}</span></span>
            </div>
            <div className="flex items-center gap-3">
              {renderSelector(toCurrency, showDdTo, setShowDdTo, setToCurrency, fromCurrency)}
              <div className="flex-1 text-right"><span className={`text-xl font-black ${netRcv > 0 ? 'text-green-400' : 'text-slate-600'}`}>{netRcv > 0 ? fmt(netRcv) : '0.00'}</span></div>
            </div>
          </div>

          {/* Rate Info */}
          {numAmt > 0 && (
            <div className="rounded-xl p-3 space-y-1.5" style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(125,211,252,0.16)' }}>
              <div className="flex justify-between text-[11px]"><span className="text-slate-500">Exchange Rate</span><span className="text-white font-semibold">1 {CINFO[fromCurrency].label} = {fmt(rate)} {CINFO[toCurrency].label}</span></div>
              <div className="flex justify-between text-[11px]"><span className="text-slate-500">Fee ({EXCHANGE_FEE_PERCENT}%)</span><span className="text-rose-400 font-semibold">-{fmt(fee)} {CINFO[toCurrency].label}</span></div>
              <div className="h-px bg-slate-700/50 my-1" />
              <div className="flex justify-between text-[11px]"><span className="text-slate-500">You Receive</span><span className="text-green-400 font-bold text-sm">{fmt(netRcv)} {CINFO[toCurrency].label}</span></div>
            </div>
          )}

          {/* Confirm */}
          <button onClick={handleExchange} disabled={!canEx}
            className={`w-full py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${canEx ? 'hover:scale-[1.02] active:scale-95' : 'opacity-40 cursor-not-allowed'}`}
            style={{ background: canEx ? 'linear-gradient(135deg, #22c55e, #38bdf8)' : 'rgba(30,41,59,0.5)', border: canEx ? '1px solid rgba(125,211,252,0.5)' : '1px solid rgba(100,116,139,0.2)', boxShadow: canEx ? '0 0 20px rgba(56,189,248,0.28)' : 'none' }}>
            <ArrowUpDown size={16} /><span>{canEx ? 'Confirm Exchange' : numAmt > fromBal ? 'Insufficient Balance' : 'Enter Amount'}</span>
          </button>

          {/* Live Rates */}
          <div className="rounded-xl p-3" style={{ background: 'rgba(8,47,73,0.48)', border: '1px solid rgba(125,211,252,0.14)' }}>
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><BarChart3 size={12} /> Live Rates</div>
            <div className="space-y-1">
              {[{ l: '1 USDT', v: `${USDT_TO_GOLD} Gold`, s: '' }, { l: '1 Diamond', v: `${DIAMOND_TO_GOLD} Gold`, s: `= ${DIAMOND_TO_USDT} USDT` }, { l: '1 Gold', v: `= ${GOLD_TO_THB} THB`, s: '' }].map((r, i) => (
                <div key={i} className="flex items-center justify-between text-[11px] py-1">
                  <span className="text-slate-400">{r.l}</span>
                  <div className="text-right"><span className="text-white font-semibold">{r.v}</span>{r.s && <span className="text-slate-500 text-[9px] ml-1.5">({r.s})</span>}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Success overlay */}
        {showSuccess && (
          <div className="absolute inset-0 z-30 flex items-center justify-center animate-slide-in" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
            <div className="rounded-2xl p-6 text-center space-y-3 animate-skin-picker-enter" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.08))', border: '1px solid rgba(34,197,94,0.4)', boxShadow: '0 0 40px rgba(34,197,94,0.2)' }}>
              <Check size={40} className="text-emerald-400 mx-auto" />
              <div className="text-lg font-black text-green-400">Exchange Successful!</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
