'use client';
import React, { useState, useEffect } from 'react';
import { AVAILABLE_CARDS, BoostCard } from '@/lib/gameTypes';
import { fetchConfig, saveConfig } from '@/lib/adminApi';
import { Save, RotateCcw, Loader2 } from 'lucide-react';

type EditableCard = BoostCard & { _key: string };
const initCards = (): EditableCard[] => AVAILABLE_CARDS.map((c, i) => ({ ...c, _key: `${c.id}-${i}` }));
const rarityClr: Record<string, string> = { Common: '#9ca3af', Rare: '#818cf8', Legendary: '#fbbf24' };

export default function CardsTab() {
  const [cards, setCards] = useState(initCards);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfig().then((cfg) => {
      if (cfg.cards && Array.isArray(cfg.cards)) {
        setCards((cfg.cards as BoostCard[]).map((c, i) => ({ ...c, _key: `${c.id}-${i}` })));
      }
    }).finally(() => setLoading(false));
  }, []);

  const updateCard = (key: string, field: string, value: number | string) => {
    setCards((prev) => prev.map((c) => c._key === key ? { ...c, [field]: value } : c));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const clean = cards.map(({ _key, ...rest }) => rest);
      await saveConfig('cards', clean);
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch (e) { alert('Save failed: ' + (e as Error).message); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center gap-2 text-slate-400 p-8"><Loader2 size={20} className="animate-spin" /> Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #a5f3fc, #22d3ee)' }}>Boost Cards</h1>
        <p className="text-sm text-slate-400 mt-1">Edit card properties • <span className="text-teal-400">Synced to Turso DB</span></p>
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
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 hover:bg-teal-500/30 transition-all cursor-pointer disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {saved ? '✓ Saved to DB!' : 'Save to Database'}
        </button>
        <button onClick={() => { setCards(initCards()); setSaved(false); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-slate-700/30 text-slate-400 border border-slate-600/30 hover:bg-slate-700/50 transition-all cursor-pointer"><RotateCcw size={16} /> Reset</button>
      </div>
    </div>
  );
}
