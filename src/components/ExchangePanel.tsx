'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  CurrencyType,
  USDT_TO_GOLD,
  DIAMOND_TO_USDT,
  DIAMOND_TO_GOLD,
  EXCHANGE_FEE_PERCENT,
  GOLD_TO_THB,
} from '@/lib/gameTypes';
import { playClickSound, playRewardSound } from './SoundManager';
import { Coins, Gem, DollarSign, ArrowUpDown, Check, BarChart3 } from 'lucide-react';

interface ExchangePanelProps {
  coins: number;
  gems: number;
  usdt: number;
  onExchange: (from: CurrencyType, to: CurrencyType, fromAmount: number, toAmount: number) => void;
  onClose: () => void;
}

const CURRENCY_INFO: Record<CurrencyType, { icon: string; label: string; color: string; glowColor: string }> = {
  coins: { icon: '🪙', label: 'Gold', color: '#eab308', glowColor: 'rgba(234,179,8,0.3)' },
  gems:  { icon: '💎', label: 'Diamond', color: '#06b6d4', glowColor: 'rgba(6,182,212,0.3)' },
  usdt:  { icon: '💵', label: 'USDT', color: '#22c55e', glowColor: 'rgba(34,197,94,0.3)' },
};

// Quick-swap presets
const QUICK_SWAPS: { from: CurrencyType; to: CurrencyType; amount: number; label: string }[] = [
  { from: 'coins', to: 'gems', amount: 875, label: '875🪙 → 1💎' },
  { from: 'coins', to: 'gems', amount: 4375, label: '4375🪙 → 5💎' },
  { from: 'coins', to: 'usdt', amount: 175, label: '175🪙 → 1💵' },
  { from: 'gems', to: 'coins', amount: 1, label: '1💎 → 875🪙' },
  { from: 'gems', to: 'usdt', amount: 1, label: '1💎 → 5💵' },
  { from: 'usdt', to: 'coins', amount: 1, label: '1💵 → 175🪙' },
  { from: 'usdt', to: 'gems', amount: 5, label: '5💵 → 1💎' },
];

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

function getBalance(type: CurrencyType, coins: number, gems: number, usdt: number): number {
  if (type === 'coins') return coins;
  if (type === 'gems') return gems;
  return usdt;
}

export default function ExchangePanel({ coins, gems, usdt, onExchange, onClose }: ExchangePanelProps) {
  const [fromCurrency, setFromCurrency] = useState<CurrencyType>('coins');
  const [toCurrency, setToCurrency] = useState<CurrencyType>('gems');
  const [amount, setAmount] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ from: string; to: string } | null>(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const [showDropdownFrom, setShowDropdownFrom] = useState(false);
  const [showDropdownTo, setShowDropdownTo] = useState(false);

  const numAmount = parseFloat(amount) || 0;
  const rate = useMemo(() => getRate(fromCurrency, toCurrency), [fromCurrency, toCurrency]);
  const rawReceive = numAmount * rate;
  const fee = rawReceive * (EXCHANGE_FEE_PERCENT / 100);
  const netReceive = rawReceive - fee;
  const fromBalance = getBalance(fromCurrency, coins, gems, usdt);
  const canExchange = numAmount > 0 && numAmount <= fromBalance && fromCurrency !== toCurrency;

  // Format display number
  const formatNum = (n: number) => {
    if (n >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
    if (n < 0.01 && n > 0) return n.toFixed(4);
    return n.toFixed(2);
  };

  // THB equivalent
  const thbValue = useMemo(() => {
    let goldEquiv = 0;
    if (fromCurrency === 'coins') goldEquiv = numAmount;
    else if (fromCurrency === 'gems') goldEquiv = numAmount * DIAMOND_TO_GOLD;
    else goldEquiv = numAmount * USDT_TO_GOLD;
    return goldEquiv * GOLD_TO_THB;
  }, [fromCurrency, numAmount]);

  const handleSwapDirection = useCallback(() => {
    setIsSwapping(true);
    playClickSound();
    setTimeout(() => {
      setFromCurrency(toCurrency);
      setToCurrency(fromCurrency);
      setAmount('');
      setIsSwapping(false);
    }, 300);
  }, [fromCurrency, toCurrency]);

  const handleExchange = useCallback(() => {
    if (!canExchange) return;
    playClickSound();
    playRewardSound(false);

    const fromInfo = CURRENCY_INFO[fromCurrency];
    const toInfo = CURRENCY_INFO[toCurrency];
    setSuccessInfo({
      from: `${formatNum(numAmount)} ${fromInfo.icon} ${fromInfo.label}`,
      to: `${formatNum(netReceive)} ${toInfo.icon} ${toInfo.label}`,
    });

    onExchange(fromCurrency, toCurrency, numAmount, netReceive);
    setShowSuccess(true);
    setAmount('');
    setTimeout(() => setShowSuccess(false), 2500);
  }, [canExchange, fromCurrency, toCurrency, numAmount, netReceive, onExchange]);

  const handleQuickSwap = useCallback((qs: typeof QUICK_SWAPS[0]) => {
    playClickSound();
    setFromCurrency(qs.from);
    setToCurrency(qs.to);
    setAmount(String(qs.amount));
  }, []);

  const handleSetPercent = useCallback((pct: number) => {
    playClickSound();
    const bal = getBalance(fromCurrency, coins, gems, usdt);
    const val = fromCurrency === 'coins' ? Math.floor(bal * pct / 100) : parseFloat((bal * pct / 100).toFixed(2));
    setAmount(String(val));
  }, [fromCurrency, coins, gems, usdt]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = () => { setShowDropdownFrom(false); setShowDropdownTo(false); };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const renderCurrencySelector = (
    selected: CurrencyType,
    showDropdown: boolean,
    setShowDropdown: (v: boolean) => void,
    onChange: (c: CurrencyType) => void,
    exclude: CurrencyType,
  ) => {
    const info = CURRENCY_INFO[selected];
    return (
      <div className="relative" onClick={e => e.stopPropagation()}>
        <button
          onClick={() => { playClickSound(); setShowDropdown(!showDropdown); }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer hover:scale-105 active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${info.color}15, ${info.color}08)`,
            border: `1px solid ${info.color}40`,
            color: info.color,
          }}
        >
          <span className="text-lg">{info.icon}</span>
          <span>{info.label}</span>
          <span className="text-[10px] opacity-60">▼</span>
        </button>
        {showDropdown && (
          <div className="absolute top-full left-0 mt-1 z-50 rounded-xl overflow-hidden min-w-[140px] animate-slide-in"
            style={{ background: 'rgba(7,47,62,0.98)', border: '1px solid rgba(125,211,252,0.3)', boxShadow: '0 10px 40px rgba(0,0,0,0.45)' }}>
            {(Object.keys(CURRENCY_INFO) as CurrencyType[]).filter(c => c !== exclude).map(c => {
              const ci = CURRENCY_INFO[c];
              return (
                <button key={c} onClick={() => { playClickSound(); onChange(c); setShowDropdown(false); setAmount(''); }}
                  className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer hover:bg-slate-700/50 ${c === selected ? 'bg-slate-700/30' : ''}`}
                  style={{ color: ci.color }}>
                  <span className="text-lg">{ci.icon}</span>
                  <span>{ci.label}</span>
                  {c === selected && <span className="ml-auto text-[10px]">✓</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden animate-skin-picker-enter"
        style={{
          background: 'linear-gradient(180deg, rgba(7,47,62,0.99), rgba(8,96,95,0.97))',
          border: '1px solid rgba(125,211,252,0.32)',
          boxShadow: '0 0 60px rgba(45,212,191,0.16), 0 0 120px rgba(56,189,248,0.06)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-5 pt-5 pb-3">
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all cursor-pointer z-10">✕</button>
          <h2 className="text-lg font-extrabold text-transparent bg-clip-text flex items-center gap-2"
            style={{ backgroundImage: 'linear-gradient(135deg, #a5f3fc, #a3e635, #fde68a)' }}>
            <ArrowUpDown size={20} className="text-teal-400" style={{ WebkitTextFillColor: 'initial' }} />
            CURRENCY EXCHANGE
          </h2>
          <p className="text-[10px] text-slate-500 mt-0.5">Swap your currencies instantly • {EXCHANGE_FEE_PERCENT}% fee</p>
        </div>

        {/* Balance Overview */}
        <div className="flex items-center justify-center gap-4 px-5 pb-3">
          {(Object.keys(CURRENCY_INFO) as CurrencyType[]).map(c => {
            const ci = CURRENCY_INFO[c];
            const bal = getBalance(c, coins, gems, usdt);
            return (
              <div key={c} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                style={{ background: `${ci.color}08`, border: `1px solid ${ci.color}15` }}>
                <span className="text-sm">{ci.icon}</span>
                <span className="text-xs font-bold" style={{ color: ci.color }}>{bal.toLocaleString()}</span>
              </div>
            );
          })}
        </div>

        {/* Exchange Card */}
        <div className="px-5 pb-4 space-y-3">
          {/* FROM section */}
          <div className="rounded-xl p-3"
            style={{ background: 'rgba(8,47,73,0.58)', border: '1px solid rgba(125,211,252,0.18)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">From</span>
              <span className="text-[10px] text-slate-500">
                Balance: <span className="text-white font-semibold">{fromBalance.toLocaleString()}</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              {renderCurrencySelector(fromCurrency, showDropdownFrom, setShowDropdownFrom, setFromCurrency, toCurrency)}
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                min={0}
                className="flex-1 bg-transparent text-right text-xl font-black text-white outline-none placeholder-slate-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            {/* Percent buttons */}
            <div className="flex gap-1.5 mt-2">
              {[25, 50, 75, 100].map(pct => (
                <button key={pct} onClick={() => handleSetPercent(pct)}
                  className="flex-1 py-1 rounded-lg text-[10px] font-bold text-slate-400 bg-slate-800/60 border border-slate-700/30 hover:text-white hover:bg-slate-700/50 transition-all cursor-pointer hover:scale-105 active:scale-95">
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Swap button */}
          <div className="flex justify-center -my-1 relative z-10">
            <button onClick={handleSwapDirection}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all cursor-pointer hover:scale-110 active:scale-90 ${isSwapping ? 'animate-spin' : ''}`}
              style={{
                background: 'linear-gradient(135deg, rgba(34,211,238,0.28), rgba(250,204,21,0.18))',
                border: '2px solid rgba(125,211,252,0.52)',
                boxShadow: '0 0 20px rgba(56,189,248,0.22)',
              }}>
              ⇅
            </button>
          </div>

          {/* TO section */}
          <div className="rounded-xl p-3"
            style={{ background: 'rgba(8,47,73,0.58)', border: '1px solid rgba(125,211,252,0.18)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">To (You Receive)</span>
              <span className="text-[10px] text-slate-500">
                Balance: <span className="text-white font-semibold">{getBalance(toCurrency, coins, gems, usdt).toLocaleString()}</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              {renderCurrencySelector(toCurrency, showDropdownTo, setShowDropdownTo, setToCurrency, fromCurrency)}
              <div className="flex-1 text-right">
                <span className={`text-xl font-black ${netReceive > 0 ? 'text-green-400' : 'text-slate-600'}`}>
                  {netReceive > 0 ? formatNum(netReceive) : '0.00'}
                </span>
              </div>
            </div>
          </div>

          {/* Rate Info */}
          {numAmount > 0 && (
            <div className="rounded-xl p-3 space-y-1.5"
              style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(125,211,252,0.16)' }}>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Exchange Rate</span>
                <span className="text-white font-semibold">
                  1 {CURRENCY_INFO[fromCurrency].icon} = {formatNum(rate)} {CURRENCY_INFO[toCurrency].icon}
                </span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Fee ({EXCHANGE_FEE_PERCENT}%)</span>
                <span className="text-rose-400 font-semibold">
                  -{formatNum(fee)} {CURRENCY_INFO[toCurrency].icon}
                </span>
              </div>
              <div className="h-px bg-slate-700/50 my-1" />
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">You Receive</span>
                <span className="text-green-400 font-bold text-sm">
                  {formatNum(netReceive)} {CURRENCY_INFO[toCurrency].icon} {CURRENCY_INFO[toCurrency].label}
                </span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">≈ THB Value</span>
                <span className="text-amber-400/70 font-semibold">
                  ฿{thbValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}

          {/* Exchange Button */}
          <button
            onClick={handleExchange}
            disabled={!canExchange}
            className={`w-full py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
              canExchange
                ? 'hover:scale-[1.02] active:scale-95'
                : 'opacity-40 cursor-not-allowed'
            }`}
            style={{
              background: canExchange
                ? 'linear-gradient(135deg, #22c55e, #38bdf8)'
                : 'rgba(30,41,59,0.5)',
              border: canExchange
                ? '1px solid rgba(125,211,252,0.5)'
                : '1px solid rgba(100,116,139,0.2)',
              boxShadow: canExchange ? '0 0 20px rgba(56,189,248,0.28)' : 'none',
            }}
          >
            <span><ArrowUpDown size={16} /></span>
            <span>{canExchange ? 'Exchange Now' : numAmount > fromBalance ? 'Insufficient Balance' : 'Enter Amount'}</span>
          </button>

          {/* Quick Swap Section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px flex-1 bg-slate-700/50" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Quick Swap</span>
              <div className="h-px flex-1 bg-slate-700/50" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {QUICK_SWAPS.map((qs, i) => {
                const fromBal = getBalance(qs.from, coins, gems, usdt);
                const canDo = fromBal >= qs.amount;
                return (
                  <button key={i} onClick={() => canDo && handleQuickSwap(qs)}
                    disabled={!canDo}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer border ${
                      canDo
                        ? 'text-slate-300 bg-slate-800/50 border-slate-700/30 hover:bg-slate-700/50 hover:scale-105 active:scale-95 hover:text-white'
                        : 'text-slate-600 bg-slate-900/30 border-slate-800/20 cursor-not-allowed opacity-50'
                    }`}>
                    {qs.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Exchange Rate Table */}
          <div className="rounded-xl p-3"
            style={{ background: 'rgba(8,47,73,0.48)', border: '1px solid rgba(125,211,252,0.14)' }}>
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><BarChart3 size={12} /> Live Rates</div>
            <div className="space-y-1">
              {[
                { label: '1 USDT', value: `${USDT_TO_GOLD} Gold`, icon: '💵', subtext: `≈ ฿${(USDT_TO_GOLD * GOLD_TO_THB).toFixed(0)}` },
                { label: '1 Diamond', value: `${DIAMOND_TO_GOLD} Gold`, icon: '💎', subtext: `= ${DIAMOND_TO_USDT} USDT` },
                { label: '1 Gold', value: `≈ ฿${GOLD_TO_THB}`, icon: '🪙', subtext: '' },
              ].map((r, i) => (
                <div key={i} className="flex items-center justify-between text-[11px] py-1">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span>{r.icon}</span> {r.label}
                  </span>
                  <div className="text-right">
                    <span className="text-white font-semibold">{r.value}</span>
                    {r.subtext && <span className="text-slate-500 text-[9px] ml-1.5">({r.subtext})</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Success overlay */}
        {showSuccess && successInfo && (
          <div className="absolute inset-0 z-30 flex items-center justify-center animate-slide-in"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
            <div className="rounded-2xl p-6 text-center space-y-3 animate-skin-picker-enter"
              style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.08))', border: '1px solid rgba(34,197,94,0.4)', boxShadow: '0 0 40px rgba(34,197,94,0.2)' }}>
              <div className="text-4xl"><Check size={40} className="text-emerald-400" /></div>
              <div className="text-lg font-black text-green-400">Exchange Successful!</div>
              <div className="text-sm text-slate-300">
                <span className="text-rose-400">{successInfo.from}</span>
                <span className="mx-2 text-slate-500">→</span>
                <span className="text-green-400">{successInfo.to}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
