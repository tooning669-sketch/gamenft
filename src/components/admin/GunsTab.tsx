'use client';
import React, { useState } from 'react';
import { GUN_SKINS, GunSkin } from '@/lib/gameTypes';
import { Save, RotateCcw } from 'lucide-react';

type EditableGun = GunSkin & { _key: string };

const initGuns = (): EditableGun[] =>
  GUN_SKINS.map((g, i) => ({ ...g, _key: `${g.id}-${i}` }));

const rarityBg: Record<string, string> = {
  Common: 'rgba(156,163,175,0.12)',
  Rare: 'rgba(129,140,248,0.12)',
  Legendary: 'rgba(251,191,36,0.12)',
};
const rarityClr: Record<string, string> = {
  Common: '#9ca3af', Rare: '#818cf8', Legendary: '#fbbf24',
};

export default function GunsTab() {
  const [guns, setGuns] = useState(initGuns);
  const [saved, setSaved] = useState(false);

  const updateGun = (key: string, field: string, value: number | string) => {
    setGuns((prev) => prev.map((g) => g._key === key ? { ...g, [field]: value } : g));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem('admin_guns', JSON.stringify(guns));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text"
          style={{ backgroundImage: 'linear-gradient(135deg, #a5f3fc, #22d3ee)' }}>Gun Skins</h1>
        <p className="text-sm text-slate-400 mt-1">Edit damage, energy, durability, and cooldown for each gun</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 bg-slate-900/40">
                <th className="text-left py-3 px-4">Gun</th>
                <th className="text-center py-3 px-3">Rarity</th>
                <th className="text-center py-3 px-3">DMG</th>
                <th className="text-center py-3 px-3">Energy</th>
                <th className="text-center py-3 px-3">Durability</th>
                <th className="text-center py-3 px-3">Cooldown (s)</th>
              </tr>
            </thead>
            <tbody>
              {guns.map((g) => (
                <tr key={g._key} className="border-t" style={{ borderColor: 'rgba(45,212,191,0.06)' }}>
                  <td className="py-2.5 px-4 font-semibold" style={{ color: g.color }}>{g.name}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: rarityBg[g.rarity], color: rarityClr[g.rarity] }}>{g.rarity}</span>
                  </td>
                  <td className="py-2 px-3">
                    <input type="number" value={g.dmg} onChange={(e) => updateGun(g._key, 'dmg', Number(e.target.value))}
                      className="w-16 px-2 py-1 rounded bg-slate-900/60 border border-slate-700/30 text-red-300 text-sm text-center focus:outline-none" />
                  </td>
                  <td className="py-2 px-3">
                    <input type="number" value={g.energy} onChange={(e) => updateGun(g._key, 'energy', Number(e.target.value))}
                      className="w-16 px-2 py-1 rounded bg-slate-900/60 border border-slate-700/30 text-amber-300 text-sm text-center focus:outline-none" />
                  </td>
                  <td className="py-2 px-3">
                    <input type="number" value={g.durability} onChange={(e) => updateGun(g._key, 'durability', Number(e.target.value))}
                      className="w-16 px-2 py-1 rounded bg-slate-900/60 border border-slate-700/30 text-cyan-300 text-sm text-center focus:outline-none" />
                  </td>
                  <td className="py-2 px-3">
                    <input type="number" step="0.1" value={g.cooldownSec} onChange={(e) => updateGun(g._key, 'cooldownSec', Number(e.target.value))}
                      className="w-16 px-2 py-1 rounded bg-slate-900/60 border border-slate-700/30 text-slate-300 text-sm text-center focus:outline-none" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 hover:bg-teal-500/30 transition-all cursor-pointer">
          <Save size={16} /> {saved ? '✓ Saved!' : 'Save'}
        </button>
        <button onClick={() => { setGuns(initGuns()); setSaved(false); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-slate-700/30 text-slate-400 border border-slate-600/30 hover:bg-slate-700/50 transition-all cursor-pointer">
          <RotateCcw size={16} /> Reset
        </button>
      </div>
    </div>
  );
}
