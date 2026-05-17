'use client';
import React, { useState } from 'react';
import { MARKETPLACE_ITEMS, MarketplaceItem } from '@/lib/gameTypes';
import { Save, RotateCcw, Star } from 'lucide-react';

type EditableMarket = MarketplaceItem & { _key: string };
const initItems = (): EditableMarket[] => MARKETPLACE_ITEMS.map((m, i) => ({ ...m, _key: `${m.id}-${i}` }));

const catColors: Record<string, string> = { guns: '#ef4444', cards: '#818cf8', ammo: '#38bdf8', special: '#34d399' };

export default function MarketplaceTab() {
  const [items, setItems] = useState(initItems);
  const [saved, setSaved] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? items : items.filter((i) => i.category === filter);

  const updateItem = (key: string, field: string, value: number | string | boolean) => {
    setItems((prev) => prev.map((i) => i._key === key ? { ...i, [field]: value } : i));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem('admin_marketplace', JSON.stringify(items));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text"
          style={{ backgroundImage: 'linear-gradient(135deg, #a5f3fc, #22d3ee)' }}>Marketplace</h1>
        <p className="text-sm text-slate-400 mt-1">Manage shop items, pricing, stock and discounts</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'guns', 'cards', 'ammo', 'special'].map((cat) => (
          <button key={cat} onClick={() => setFilter(cat)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            style={{
              background: filter === cat ? 'rgba(45,212,191,0.15)' : 'transparent',
              color: filter === cat ? '#5eead4' : '#64748b',
              border: filter === cat ? '1px solid rgba(45,212,191,0.25)' : '1px solid transparent',
            }}>
            {cat} {cat !== 'all' && `(${items.filter((i) => i.category === cat).length})`}
          </button>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 bg-slate-900/40 text-xs">
                <th className="text-left py-3 px-3">Item</th>
                <th className="text-center py-3 px-2">Cat</th>
                <th className="text-center py-3 px-2">🪙 Price</th>
                <th className="text-center py-3 px-2">💎 Gems</th>
                <th className="text-center py-3 px-2">Stock</th>
                <th className="text-center py-3 px-2">Disc%</th>
                <th className="text-center py-3 px-2">⭐</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((it) => (
                <tr key={it._key} className="border-t" style={{ borderColor: 'rgba(45,212,191,0.06)' }}>
                  <td className="py-2 px-3">
                    <span className="mr-1">{it.icon}</span>
                    <span className="text-teal-200 font-medium">{it.name}</span>
                  </td>
                  <td className="py-2 px-2 text-center">
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ color: catColors[it.category], background: `${catColors[it.category]}15` }}>{it.category}</span>
                  </td>
                  <td className="py-2 px-2">
                    <input type="number" value={it.priceCoins} onChange={(e) => updateItem(it._key, 'priceCoins', Number(e.target.value))}
                      className="w-20 px-1 py-1 rounded bg-slate-900/60 border border-slate-700/30 text-amber-300 text-xs text-center focus:outline-none" />
                  </td>
                  <td className="py-2 px-2">
                    <input type="number" value={it.priceGems} onChange={(e) => updateItem(it._key, 'priceGems', Number(e.target.value))}
                      className="w-16 px-1 py-1 rounded bg-slate-900/60 border border-slate-700/30 text-cyan-300 text-xs text-center focus:outline-none" />
                  </td>
                  <td className="py-2 px-2">
                    <input type="number" value={it.stock} onChange={(e) => updateItem(it._key, 'stock', Number(e.target.value))}
                      className="w-14 px-1 py-1 rounded bg-slate-900/60 border border-slate-700/30 text-slate-300 text-xs text-center focus:outline-none" />
                  </td>
                  <td className="py-2 px-2">
                    <input type="number" value={it.discount || 0} onChange={(e) => updateItem(it._key, 'discount', Number(e.target.value))}
                      className="w-14 px-1 py-1 rounded bg-slate-900/60 border border-slate-700/30 text-green-300 text-xs text-center focus:outline-none" />
                  </td>
                  <td className="py-2 px-2 text-center">
                    <button onClick={() => updateItem(it._key, 'isFeatured', !it.isFeatured)}
                      className="cursor-pointer transition-colors"
                      style={{ color: it.isFeatured ? '#fbbf24' : '#334155' }}>
                      <Star size={14} fill={it.isFeatured ? '#fbbf24' : 'none'} />
                    </button>
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
        <button onClick={() => { setItems(initItems()); setSaved(false); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-slate-700/30 text-slate-400 border border-slate-600/30 hover:bg-slate-700/50 transition-all cursor-pointer">
          <RotateCcw size={16} /> Reset
        </button>
      </div>
    </div>
  );
}
