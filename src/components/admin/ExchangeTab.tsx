'use client';
import React, { useState } from 'react';
import { USDT_TO_GOLD, DIAMOND_TO_USDT, EXCHANGE_FEE_PERCENT, GOLD_TO_THB } from '@/lib/gameTypes';
import { Save, RotateCcw } from 'lucide-react';

export default function ExchangeTab() {
  const [rates, setRates] = useState({
    usdtToGold: USDT_TO_GOLD,
    diamondToUsdt: DIAMOND_TO_USDT,
    feePercent: EXCHANGE_FEE_PERCENT,
    goldToThb: GOLD_TO_THB,
  });
  const [saved, setSaved] = useState(false);

  const diamondToGold = rates.usdtToGold * rates.diamondToUsdt;

  const update = (key: keyof typeof rates, val: number) => {
    setRates((p) => ({ ...p, [key]: val }));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem('admin_exchange', JSON.stringify(rates));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text"
          style={{ backgroundImage: 'linear-gradient(135deg, #a5f3fc, #22d3ee)' }}>Exchange Rates</h1>
        <p className="text-sm text-slate-400 mt-1">Configure currency exchange rates and fees</p>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Core Rates</h3>
        {[
          { label: '1 USDT = ? Gold', value: rates.usdtToGold, key: 'usdtToGold' as const, color: '#fbbf24' },
          { label: '1 Diamond = ? USDT', value: rates.diamondToUsdt, key: 'diamondToUsdt' as const, color: '#22d3ee' },
          { label: 'Exchange Fee', value: rates.feePercent, key: 'feePercent' as const, color: '#fb7185', suffix: '%' },
          { label: '1 Gold ≈ ? THB', value: rates.goldToThb, key: 'goldToThb' as const, color: '#34d399' },
        ].map((r) => (
          <div key={r.key} className="flex items-center justify-between gap-4 py-3 px-4 rounded-xl bg-slate-800/40 border border-slate-700/20">
            <span className="text-sm font-medium text-slate-300">{r.label}</span>
            <div className="flex items-center gap-2">
              <input type="number" step="any" value={r.value}
                onChange={(e) => update(r.key, Number(e.target.value))}
                className="w-28 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-600/30 text-sm text-right focus:outline-none focus:border-teal-500/50"
                style={{ color: r.color }} />
              {r.suffix && <span className="text-xs text-slate-500">{r.suffix}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-6">
        <h3 className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-3">Derived Rates (Auto-calculated)</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="px-4 py-3 rounded-xl bg-slate-800/40 border border-slate-700/20">
            <p className="text-slate-400 text-xs">1 Diamond = Gold</p>
            <p className="text-lg font-bold text-amber-300">{diamondToGold.toLocaleString()}</p>
          </div>
          <div className="px-4 py-3 rounded-xl bg-slate-800/40 border border-slate-700/20">
            <p className="text-slate-400 text-xs">1 USDT ≈ THB</p>
            <p className="text-lg font-bold text-emerald-300">{(rates.usdtToGold * rates.goldToThb).toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 hover:bg-teal-500/30 transition-all cursor-pointer">
          <Save size={16} /> {saved ? '✓ Saved!' : 'Save'}
        </button>
        <button onClick={() => { setRates({ usdtToGold: USDT_TO_GOLD, diamondToUsdt: DIAMOND_TO_USDT, feePercent: EXCHANGE_FEE_PERCENT, goldToThb: GOLD_TO_THB }); setSaved(false); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-slate-700/30 text-slate-400 border border-slate-600/30 hover:bg-slate-700/50 transition-all cursor-pointer">
          <RotateCcw size={16} /> Reset
        </button>
      </div>
    </div>
  );
}
