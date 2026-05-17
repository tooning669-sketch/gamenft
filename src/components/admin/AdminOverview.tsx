'use client';
import React, { useState, useEffect } from 'react';
import {
  Gamepad2, Target, Gift, DollarSign, Crosshair,
  CreditCard, ShoppingBag, Zap, TrendingUp, Loader2, Database
} from 'lucide-react';
import { fetchConfig } from '@/lib/adminApi';
import {
  GRID_ROWS, GRID_COLS, AMMO_TYPES, GUN_SKINS,
  AVAILABLE_CARDS, MARKETPLACE_ITEMS, REWARD_ITEMS, DROP_RATES,
  GunSkin, AmmoType, MarketplaceItem, RewardItemDef, RewardRarity,
} from '@/lib/gameTypes';

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <div className="glass-card p-5 flex items-center gap-4" style={{ borderColor: `${color}22` }}>
      <div className="p-3 rounded-xl" style={{ background: `${color}18` }}><Icon size={22} style={{ color }} /></div>
      <div>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-xl font-bold" style={{ color }}>{value}</p>
      </div>
    </div>
  );
}

export default function AdminOverview() {
  const [config, setConfig] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfig().then(setConfig).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center gap-2 text-slate-400 p-8"><Loader2 size={20} className="animate-spin" /> Loading from database...</div>;

  // Use DB data or fallback to defaults
  const gs = (config?.game_settings || { gridRows: GRID_ROWS, gridCols: GRID_COLS }) as { gridRows: number; gridCols: number };
  const guns = (config?.guns || GUN_SKINS) as GunSkin[];
  const marketplace = (config?.marketplace || MARKETPLACE_ITEMS) as MarketplaceItem[];
  const rewards = (config?.rewards || REWARD_ITEMS) as Record<RewardRarity, RewardItemDef[]>;
  const ammo = (config?.ammo || AMMO_TYPES) as AmmoType[];
  const cards = (config?.cards || AVAILABLE_CARDS) as unknown[];
  const dropRates = (config?.drop_rates || DROP_RATES) as Record<string, { Common: number; Rare: number; Legendary: number }>;

  const totalRewardItems = (rewards.Common?.length || 0) + (rewards.Rare?.length || 0) + (rewards.Legendary?.length || 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #a5f3fc, #22d3ee)' }}>Dashboard Overview</h1>
        <p className="text-sm text-slate-400 mt-1 flex items-center gap-1.5">
          <Database size={14} className="text-teal-400" /> Live data from Turso database
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Target} label="Grid Size" value={`${gs.gridRows}×${gs.gridCols}`} color="#22d3ee" />
        <StatCard icon={Crosshair} label="Gun Skins" value={guns.length} color="#f59e0b" />
        <StatCard icon={ShoppingBag} label="Shop Items" value={marketplace.length} color="#a78bfa" />
        <StatCard icon={Gift} label="Reward Items" value={totalRewardItems} color="#fb7185" />
        <StatCard icon={Zap} label="Ammo Types" value={ammo.length} color="#38bdf8" />
        <StatCard icon={CreditCard} label="Boost Cards" value={cards.length} color="#34d399" />
        <StatCard icon={Gamepad2} label="Ball Tiers" value="3" color="#fbbf24" />
        <StatCard icon={TrendingUp} label="Exchange Pairs" value="6" color="#e879f9" />
      </div>

      <div className="glass-card p-6">
        <h3 className="text-sm font-bold text-teal-300 uppercase tracking-wider mb-4">Drop Rate by Tier (from DB)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b" style={{ borderColor: 'rgba(45,212,191,0.1)' }}>
                <th className="text-left py-2 px-3">Tier</th>
                <th className="text-center py-2 px-3">⭐ Common</th>
                <th className="text-center py-2 px-3">⭐⭐ Rare</th>
                <th className="text-center py-2 px-3">⭐⭐⭐ Legendary</th>
              </tr>
            </thead>
            <tbody>
              {['1', '2', '3'].map((tier) => {
                const r = dropRates[tier] || { Common: 0, Rare: 0, Legendary: 0 };
                return (
                  <tr key={tier} className="border-b" style={{ borderColor: 'rgba(45,212,191,0.06)' }}>
                    <td className="py-3 px-3 font-bold text-teal-200">Tier {tier}</td>
                    <td className="py-3 px-3 text-center text-slate-300">{(r.Common * 100).toFixed(0)}%</td>
                    <td className="py-3 px-3 text-center text-indigo-300">{(r.Rare * 100).toFixed(0)}%</td>
                    <td className="py-3 px-3 text-center text-amber-300">{(r.Legendary * 100).toFixed(0)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-sm font-bold text-teal-300 uppercase tracking-wider mb-4">Gun Skins Summary (from DB)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b" style={{ borderColor: 'rgba(45,212,191,0.1)' }}>
                <th className="text-left py-2 px-3">Name</th><th className="text-center py-2 px-3">Rarity</th>
                <th className="text-center py-2 px-3">DMG</th><th className="text-center py-2 px-3">Energy</th>
                <th className="text-center py-2 px-3">Durability</th><th className="text-center py-2 px-3">Cooldown</th>
              </tr>
            </thead>
            <tbody>
              {guns.map((g) => (
                <tr key={g.id} className="border-b" style={{ borderColor: 'rgba(45,212,191,0.06)' }}>
                  <td className="py-2.5 px-3 font-semibold" style={{ color: g.color }}>{g.name}</td>
                  <td className="py-2.5 px-3 text-center text-xs">
                    <span className="px-2 py-0.5 rounded-full" style={{
                      background: g.rarity === 'Legendary' ? 'rgba(251,191,36,0.15)' : g.rarity === 'Rare' ? 'rgba(129,140,248,0.15)' : 'rgba(156,163,175,0.15)',
                      color: g.rarity === 'Legendary' ? '#fbbf24' : g.rarity === 'Rare' ? '#818cf8' : '#9ca3af',
                    }}>{g.rarity}</span>
                  </td>
                  <td className="py-2.5 px-3 text-center text-red-300">{g.dmg}</td>
                  <td className="py-2.5 px-3 text-center text-amber-300">{g.energy}</td>
                  <td className="py-2.5 px-3 text-center text-cyan-300">{g.durability}</td>
                  <td className="py-2.5 px-3 text-center text-slate-300">{g.cooldownSec}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
