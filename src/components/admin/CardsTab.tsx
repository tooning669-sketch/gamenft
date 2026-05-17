'use client';
import React, { useState } from 'react';
import { AVAILABLE_CARDS, BoostCard } from '@/lib/gameTypes';
import { Save, RotateCcw } from 'lucide-react';

type EditableCard = BoostCard & { _key: string };
const initCards = (): EditableCard[] => AVAILABLE_CARDS.map((c, i) => ({ ...c, _key: `${c.id}-${i}` }));

const rarityClr: Record<string, string> = { Common: '#9ca3af', Rare: '#818cf8', Legendary: '#fbbf24' };

export default function CardsTab() {
  const [cards, setCards] = useState(initCards);
  const [saved, setSaved] = useState(false);

  const updateCard = (key: string, field: string, value: number | string) => {
    setCards((prev) => prev.map((c) => c._key === key ? { ...c, [field]: value } : c));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem('admin_cards', JSON.stringify(cards));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text"
          style={{ backgroundImage: 'linear-gradient(135deg, #a5f3fc, #22d3ee)' }}>Boost Cards</h1>
        <p className="text-sm text-slate-400 mt-1">Edit card bonus damage and properties</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((c) => (
          <div key={c._key} className="glass-card p-5 space-y-3" style={{ borderColor: `${rarityClr[c.rarity]}25` }}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{c.icon}</span>
              <div>
                <p className="font-bold text-teal-200">{c.name}</p>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${rarityClr[c.rarity]}18`, color: rarityClr[c.rarity] }}>{c.rarity}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-400">Bonus Damage</label>
                <input type="number" value={c.bonusDamage} onChange={(e) => updateCard(c._key, 'bonusDamage', Number(e.target.value))}
                  className="w-20 px-2 py-1 rounded bg-slate-900/60 border border-slate-700/30 text-red-300 text-sm text-center focus:outline-none" />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-400">Description</label>
                <input value={c.description} onChange={(e) => updateCard(c._key, 'description', e.target.value)}
                  className="w-40 px-2 py-1 rounded bg-slate-900/60 border border-slate-700/30 text-slate-300 text-sm focus:outline-none" />
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
        <button onClick={() => { setCards(initCards()); setSaved(false); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-slate-700/30 text-slate-400 border border-slate-600/30 hover:bg-slate-700/50 transition-all cursor-pointer">
          <RotateCcw size={16} /> Reset
        </button>
      </div>
    </div>
  );
}
