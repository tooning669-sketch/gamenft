'use client';
import React, { useState } from 'react';
import { AMMO_TYPES, AmmoType } from '@/lib/gameTypes';
import { Save, RotateCcw } from 'lucide-react';

type EditableAmmo = AmmoType & { _key: string };
const initAmmo = (): EditableAmmo[] => AMMO_TYPES.map((a, i) => ({ ...a, _key: `${a.id}-${i}` }));

export default function AmmoTab() {
  const [ammo, setAmmo] = useState(initAmmo);
  const [saved, setSaved] = useState(false);

  const updateAmmo = (key: string, field: string, value: number | string) => {
    setAmmo((prev) => prev.map((a) => a._key === key ? { ...a, [field]: value } : a));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem('admin_ammo', JSON.stringify(ammo));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text"
          style={{ backgroundImage: 'linear-gradient(135deg, #a5f3fc, #22d3ee)' }}>Ammo Types</h1>
        <p className="text-sm text-slate-400 mt-1">Configure ammo damage and energy costs</p>
      </div>

      <div className="space-y-4">
        {ammo.map((a) => (
          <div key={a._key} className="glass-card p-5" style={{ borderColor: `${a.color}30` }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{a.icon}</span>
              <div>
                <p className="font-bold text-lg" style={{ color: a.color }}>{a.name}</p>
                <p className="text-xs text-slate-400">{a.description}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/40 border border-slate-700/20">
                <label className="text-xs text-slate-400">Damage</label>
                <input type="number" value={a.damage} onChange={(e) => updateAmmo(a._key, 'damage', Number(e.target.value))}
                  className="w-20 px-2 py-1 rounded bg-slate-900/60 border border-slate-700/30 text-red-300 text-sm text-center focus:outline-none" />
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/40 border border-slate-700/20">
                <label className="text-xs text-slate-400">Energy Cost</label>
                <input type="number" value={a.energyCost} onChange={(e) => updateAmmo(a._key, 'energyCost', Number(e.target.value))}
                  className="w-20 px-2 py-1 rounded bg-slate-900/60 border border-slate-700/30 text-amber-300 text-sm text-center focus:outline-none" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 hover:bg-teal-500/30 transition-all cursor-pointer">
          <Save size={16} /> {saved ? '✓ Saved!' : 'Save'}
        </button>
        <button onClick={() => { setAmmo(initAmmo()); setSaved(false); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-slate-700/30 text-slate-400 border border-slate-600/30 hover:bg-slate-700/50 transition-all cursor-pointer">
          <RotateCcw size={16} /> Reset
        </button>
      </div>
    </div>
  );
}
