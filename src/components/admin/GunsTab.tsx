'use client';
import React, { useState, useEffect } from 'react';
import { GUN_SKINS, GunSkin } from '@/lib/gameTypes';
import { fetchConfig, saveConfig } from '@/lib/adminApi';
import { Save, RotateCcw, Loader2 } from 'lucide-react';

type EditableGun = GunSkin & { _key: string };
const initGuns = (): EditableGun[] => GUN_SKINS.map((g, i) => ({ ...g, _key: `${g.id}-${i}` }));
const rarityBg: Record<string, string> = { Common: 'rgba(156,163,175,0.12)', Rare: 'rgba(129,140,248,0.12)', Legendary: 'rgba(251,191,36,0.12)' };
const rarityClr: Record<string, string> = { Common: '#9ca3af', Rare: '#818cf8', Legendary: '#fbbf24' };

export default function GunsTab() {
  const [guns, setGuns] = useState(initGuns);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfig().then((cfg) => {
      if (cfg.guns && Array.isArray(cfg.guns)) {
        setGuns((cfg.guns as GunSkin[]).map((g, i) => ({ ...g, _key: `${g.id}-${i}` })));
      }
    }).finally(() => setLoading(false));
  }, []);

  const updateGun = (key: string, field: string, value: number | string) => {
    setGuns((prev) => prev.map((g) => g._key === key ? { ...g, [field]: value } : g));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const clean = guns.map(({ _key, ...rest }) => rest);
      await saveConfig('guns', clean);
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch (e) { alert('Save failed: ' + (e as Error).message); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center gap-2 text-slate-400 p-8"><Loader2 size={20} className="animate-spin" /> Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #a5f3fc, #22d3ee)' }}>Gun Skins</h1>
        <p className="text-sm text-slate-400 mt-1">Edit gun stats • <span className="text-teal-400">Synced to Turso DB</span></p>
      </div>
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-slate-400 bg-slate-900/40">
              <th className="text-left py-3 px-4">Gun</th><th className="text-center py-3 px-3">Rarity</th>
              <th className="text-center py-3 px-3">DMG</th><th className="text-center py-3 px-3">Energy</th>
              <th className="text-center py-3 px-3">Durability</th><th className="text-center py-3 px-3">Cooldown</th>
            </tr></thead>
            <tbody>
              {guns.map((g) => (
                <tr key={g._key} className="border-t" style={{ borderColor: 'rgba(45,212,191,0.06)' }}>
                  <td className="py-2.5 px-4 font-semibold" style={{ color: g.color }}>{g.name}</td>
                  <td className="py-2.5 px-3 text-center"><span className="px-2 py-0.5 rounded-full text-xs" style={{ background: rarityBg[g.rarity], color: rarityClr[g.rarity] }}>{g.rarity}</span></td>
                  <td className="py-2 px-3"><input type="number" value={g.dmg} onChange={(e) => updateGun(g._key, 'dmg', Number(e.target.value))} className="w-16 px-2 py-1 rounded bg-slate-900/60 border border-slate-700/30 text-red-300 text-sm text-center focus:outline-none" /></td>
                  <td className="py-2 px-3"><input type="number" value={g.energy} onChange={(e) => updateGun(g._key, 'energy', Number(e.target.value))} className="w-16 px-2 py-1 rounded bg-slate-900/60 border border-slate-700/30 text-amber-300 text-sm text-center focus:outline-none" /></td>
                  <td className="py-2 px-3"><input type="number" value={g.durability} onChange={(e) => updateGun(g._key, 'durability', Number(e.target.value))} className="w-16 px-2 py-1 rounded bg-slate-900/60 border border-slate-700/30 text-cyan-300 text-sm text-center focus:outline-none" /></td>
                  <td className="py-2 px-3"><input type="number" step="0.1" value={g.cooldownSec} onChange={(e) => updateGun(g._key, 'cooldownSec', Number(e.target.value))} className="w-16 px-2 py-1 rounded bg-slate-900/60 border border-slate-700/30 text-slate-300 text-sm text-center focus:outline-none" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 hover:bg-teal-500/30 transition-all cursor-pointer disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {saved ? '✓ Saved to DB!' : 'Save to Database'}
        </button>
        <button onClick={() => { setGuns(initGuns()); setSaved(false); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-slate-700/30 text-slate-400 border border-slate-600/30 hover:bg-slate-700/50 transition-all cursor-pointer"><RotateCcw size={16} /> Reset</button>
      </div>
    </div>
  );
}
