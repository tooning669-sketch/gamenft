'use client';
import React, { useState, useEffect } from 'react';
import { REWARD_ITEMS, RewardRarity, RewardItemDef } from '@/lib/gameTypes';
import { fetchConfig, saveConfig } from '@/lib/adminApi';
import { Save, RotateCcw, Plus, Trash2, Loader2 } from 'lucide-react';

type EditableItem = RewardItemDef & { _key: string };
const toEditable = (items: RewardItemDef[]): EditableItem[] =>
  items.map((it, i) => ({ ...it, _key: `${it.name}-${i}` }));
const initData = () => ({
  Common: toEditable(REWARD_ITEMS.Common),
  Rare: toEditable(REWARD_ITEMS.Rare),
  Legendary: toEditable(REWARD_ITEMS.Legendary),
});
const rarityColors: Record<RewardRarity, string> = { Common: '#9ca3af', Rare: '#818cf8', Legendary: '#fbbf24' };

export default function RewardsTab() {
  const [data, setData] = useState(initData);
  const [activeRarity, setActiveRarity] = useState<RewardRarity>('Common');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfig().then((cfg) => {
      if (cfg.rewards) {
        const r = cfg.rewards as Record<RewardRarity, RewardItemDef[]>;
        setData({
          Common: toEditable(r.Common || REWARD_ITEMS.Common),
          Rare: toEditable(r.Rare || REWARD_ITEMS.Rare),
          Legendary: toEditable(r.Legendary || REWARD_ITEMS.Legendary),
        });
      }
    }).finally(() => setLoading(false));
  }, []);

  const items = data[activeRarity];
  const updateItem = (key: string, field: string, value: string | number) => {
    setData((prev) => ({ ...prev, [activeRarity]: prev[activeRarity].map((it) => it._key === key ? { ...it, [field]: value } : it) }));
    setSaved(false);
  };
  const removeItem = (key: string) => { setData((prev) => ({ ...prev, [activeRarity]: prev[activeRarity].filter((it) => it._key !== key) })); };
  const addItem = () => {
    setData((prev) => ({ ...prev, [activeRarity]: [...prev[activeRarity], { _key: `new-${Date.now()}`, name: 'New Item', icon: '🎁', description: 'Description' }] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Strip _key before saving
      const clean = {
        Common: data.Common.map(({ _key, ...rest }) => rest),
        Rare: data.Rare.map(({ _key, ...rest }) => rest),
        Legendary: data.Legendary.map(({ _key, ...rest }) => rest),
      };
      await saveConfig('rewards', clean);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { alert('Save failed: ' + (e as Error).message); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center gap-2 text-slate-400 p-8"><Loader2 size={20} className="animate-spin" /> Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #a5f3fc, #22d3ee)' }}>Rewards & Drop Items</h1>
        <p className="text-sm text-slate-400 mt-1">Manage reward items • <span className="text-teal-400">Synced to Turso DB</span></p>
      </div>
      <div className="flex gap-2">
        {(['Common', 'Rare', 'Legendary'] as RewardRarity[]).map((r) => (
          <button key={r} onClick={() => setActiveRarity(r)} className="px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer"
            style={{ background: r === activeRarity ? `${rarityColors[r]}20` : 'transparent', color: r === activeRarity ? rarityColors[r] : '#64748b', border: `1px solid ${r === activeRarity ? `${rarityColors[r]}40` : 'transparent'}` }}>
            {r} ({data[r].length})
          </button>
        ))}
      </div>
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 bg-slate-900/40">
                <th className="text-left py-3 px-4">Icon</th><th className="text-left py-3 px-4">Name</th><th className="text-left py-3 px-4">Description</th>
                <th className="text-center py-3 px-4">Currency</th><th className="text-center py-3 px-4">Min</th><th className="text-center py-3 px-4">Max</th><th className="text-center py-3 px-4">Del</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it._key} className="border-t" style={{ borderColor: 'rgba(45,212,191,0.06)' }}>
                  <td className="py-2 px-4"><input value={it.icon} onChange={(e) => updateItem(it._key, 'icon', e.target.value)} className="w-12 px-1 py-1 rounded bg-slate-900/60 border border-slate-700/30 text-center text-lg focus:outline-none" /></td>
                  <td className="py-2 px-4"><input value={it.name} onChange={(e) => updateItem(it._key, 'name', e.target.value)} className="w-full px-2 py-1 rounded bg-slate-900/60 border border-slate-700/30 text-teal-200 text-sm focus:outline-none" /></td>
                  <td className="py-2 px-4"><input value={it.description} onChange={(e) => updateItem(it._key, 'description', e.target.value)} className="w-full px-2 py-1 rounded bg-slate-900/60 border border-slate-700/30 text-slate-300 text-sm focus:outline-none" /></td>
                  <td className="py-2 px-4 text-center">
                    <select value={it.currency || ''} onChange={(e) => updateItem(it._key, 'currency', e.target.value || undefined as unknown as string)}
                      className="px-2 py-1 rounded bg-slate-900/60 border border-slate-700/30 text-sm text-amber-300 focus:outline-none">
                      <option value="">None</option><option value="coins">Coins</option><option value="gems">Gems</option><option value="usdt">USDT</option><option value="btc">BTC</option>
                    </select>
                  </td>
                  <td className="py-2 px-4"><input type="number" value={it.min ?? ''} onChange={(e) => updateItem(it._key, 'min', Number(e.target.value))} className="w-20 px-2 py-1 rounded bg-slate-900/60 border border-slate-700/30 text-sm text-right text-cyan-300 focus:outline-none" /></td>
                  <td className="py-2 px-4"><input type="number" value={it.max ?? ''} onChange={(e) => updateItem(it._key, 'max', Number(e.target.value))} className="w-20 px-2 py-1 rounded bg-slate-900/60 border border-slate-700/30 text-sm text-right text-cyan-300 focus:outline-none" /></td>
                  <td className="py-2 px-4 text-center"><button onClick={() => removeItem(it._key)} className="text-red-400/60 hover:text-red-400 transition-colors cursor-pointer"><Trash2 size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={addItem} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 hover:bg-indigo-500/25 transition-all cursor-pointer"><Plus size={16} /> Add Item</button>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 hover:bg-teal-500/30 transition-all cursor-pointer disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {saved ? '✓ Saved to DB!' : 'Save to Database'}
        </button>
        <button onClick={() => { setData(initData()); setSaved(false); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-slate-700/30 text-slate-400 border border-slate-600/30 hover:bg-slate-700/50 transition-all cursor-pointer"><RotateCcw size={16} /> Reset</button>
      </div>
    </div>
  );
}
