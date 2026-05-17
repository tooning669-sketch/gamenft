'use client';
import React, { useState, useEffect } from 'react';
import { TIER_CONFIG, DROP_RATES } from '@/lib/gameTypes';
import { fetchConfig, saveConfig } from '@/lib/adminApi';
import { Save, RotateCcw, Loader2 } from 'lucide-react';

type TierData = { hp: number; dropCommon: number; dropRare: number; dropLegendary: number };

const initTiers = (): Record<number, TierData> => ({
  1: { hp: TIER_CONFIG[1].hp, dropCommon: DROP_RATES[1].Common * 100, dropRare: DROP_RATES[1].Rare * 100, dropLegendary: DROP_RATES[1].Legendary * 100 },
  2: { hp: TIER_CONFIG[2].hp, dropCommon: DROP_RATES[2].Common * 100, dropRare: DROP_RATES[2].Rare * 100, dropLegendary: DROP_RATES[2].Legendary * 100 },
  3: { hp: TIER_CONFIG[3].hp, dropCommon: DROP_RATES[3].Common * 100, dropRare: DROP_RATES[3].Rare * 100, dropLegendary: DROP_RATES[3].Legendary * 100 },
});

export default function BallTiersTab() {
  const [tiers, setTiers] = useState(initTiers);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfig().then((cfg) => {
      // Merge ball_tiers (HP) and drop_rates from DB
      if (cfg.ball_tiers || cfg.drop_rates) {
        const bt = cfg.ball_tiers as Record<string, { hp: number }> | undefined;
        const dr = cfg.drop_rates as Record<string, { Common: number; Rare: number; Legendary: number }> | undefined;
        setTiers({
          1: { hp: bt?.['1']?.hp ?? TIER_CONFIG[1].hp, dropCommon: (dr?.['1']?.Common ?? DROP_RATES[1].Common) * 100, dropRare: (dr?.['1']?.Rare ?? DROP_RATES[1].Rare) * 100, dropLegendary: (dr?.['1']?.Legendary ?? DROP_RATES[1].Legendary) * 100 },
          2: { hp: bt?.['2']?.hp ?? TIER_CONFIG[2].hp, dropCommon: (dr?.['2']?.Common ?? DROP_RATES[2].Common) * 100, dropRare: (dr?.['2']?.Rare ?? DROP_RATES[2].Rare) * 100, dropLegendary: (dr?.['2']?.Legendary ?? DROP_RATES[2].Legendary) * 100 },
          3: { hp: bt?.['3']?.hp ?? TIER_CONFIG[3].hp, dropCommon: (dr?.['3']?.Common ?? DROP_RATES[3].Common) * 100, dropRare: (dr?.['3']?.Rare ?? DROP_RATES[3].Rare) * 100, dropLegendary: (dr?.['3']?.Legendary ?? DROP_RATES[3].Legendary) * 100 },
        });
      }
    }).finally(() => setLoading(false));
  }, []);

  const update = (tier: number, key: keyof TierData, val: number) => {
    setTiers((p) => ({ ...p, [tier]: { ...p[tier], [key]: val } }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save ball_tiers (HP + colors from original)
      const ballTiers = {
        1: { hp: tiers[1].hp, colors: TIER_CONFIG[1].colors },
        2: { hp: tiers[2].hp, colors: TIER_CONFIG[2].colors },
        3: { hp: tiers[3].hp, colors: TIER_CONFIG[3].colors },
      };
      const dropRates = {
        1: { Common: tiers[1].dropCommon / 100, Rare: tiers[1].dropRare / 100, Legendary: tiers[1].dropLegendary / 100 },
        2: { Common: tiers[2].dropCommon / 100, Rare: tiers[2].dropRare / 100, Legendary: tiers[2].dropLegendary / 100 },
        3: { Common: tiers[3].dropCommon / 100, Rare: tiers[3].dropRare / 100, Legendary: tiers[3].dropLegendary / 100 },
      };
      await saveConfig('ball_tiers', ballTiers);
      await saveConfig('drop_rates', dropRates);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { alert('Save failed: ' + (e as Error).message); }
    finally { setSaving(false); }
  };

  const tierColors: Record<number, string> = { 1: '#22c55e', 2: '#f97316', 3: '#eab308' };

  if (loading) return <div className="flex items-center gap-2 text-slate-400 p-8"><Loader2 size={20} className="animate-spin" /> Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text"
          style={{ backgroundImage: 'linear-gradient(135deg, #a5f3fc, #22d3ee)' }}>Ball & Tier Configuration</h1>
        <p className="text-sm text-slate-400 mt-1">Configure HP and drop rates per tier • <span className="text-teal-400">Synced to Turso DB</span></p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {([1, 2, 3] as const).map((tier) => {
          const d = tiers[tier];
          const total = d.dropCommon + d.dropRare + d.dropLegendary;
          const isValid = Math.abs(total - 100) < 0.1;
          return (
            <div key={tier} className="glass-card p-5 space-y-4" style={{ borderColor: `${tierColors[tier]}30` }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full" style={{ background: tierColors[tier] }} />
                <h3 className="font-bold text-lg" style={{ color: tierColors[tier] }}>Tier {tier}</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400">HP</label>
                  <input type="number" value={d.hp} onChange={(e) => update(tier, 'hp', Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-600/30 text-teal-200 text-sm focus:outline-none focus:border-teal-500/50" />
                </div>
                <div className="pt-2 border-t" style={{ borderColor: 'rgba(45,212,191,0.1)' }}>
                  <p className="text-xs text-slate-500 mb-2">Drop Rates {!isValid && <span className="text-red-400">(Must = 100%)</span>}</p>
                  {(['dropCommon', 'dropRare', 'dropLegendary'] as const).map((key) => {
                    const labels: Record<string, [string, string]> = { dropCommon: ['Common', '#9ca3af'], dropRare: ['Rare', '#818cf8'], dropLegendary: ['Legendary', '#fbbf24'] };
                    const [lbl, clr] = labels[key];
                    return (
                      <div key={key} className="flex items-center gap-2 mb-2">
                        <span className="text-xs w-20" style={{ color: clr }}>{lbl}</span>
                        <input type="number" step="1" value={d[key]} onChange={(e) => update(tier, key, Number(e.target.value))}
                          className="flex-1 px-2 py-1 rounded-lg bg-slate-900/80 border border-slate-600/30 text-sm text-right focus:outline-none focus:border-teal-500/50" style={{ color: clr }} />
                        <span className="text-xs text-slate-500">%</span>
                      </div>
                    );
                  })}
                  <div className="text-right text-xs mt-1" style={{ color: isValid ? '#34d399' : '#f87171' }}>Total: {total.toFixed(0)}%</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 hover:bg-teal-500/30 transition-all cursor-pointer disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {saved ? '✓ Saved to DB!' : 'Save to Database'}
        </button>
        <button onClick={() => { setTiers(initTiers()); setSaved(false); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-slate-700/30 text-slate-400 border border-slate-600/30 hover:bg-slate-700/50 transition-all cursor-pointer">
          <RotateCcw size={16} /> Reset
        </button>
      </div>
    </div>
  );
}
