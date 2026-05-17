'use client';
import React from 'react';
import {
  Settings, Target, Gift, DollarSign, Crosshair,
  CreditCard, ShoppingBag, Zap, Shield, Home
} from 'lucide-react';

export type AdminTab =
  | 'overview'
  | 'game-settings'
  | 'ball-tiers'
  | 'rewards'
  | 'exchange'
  | 'guns'
  | 'cards'
  | 'marketplace'
  | 'ammo';

const TABS: { id: AdminTab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'game-settings', label: 'Game Settings', icon: Settings },
  { id: 'ball-tiers', label: 'Ball & Tiers', icon: Target },
  { id: 'rewards', label: 'Rewards & Drops', icon: Gift },
  { id: 'exchange', label: 'Exchange Rates', icon: DollarSign },
  { id: 'guns', label: 'Gun Skins', icon: Crosshair },
  { id: 'cards', label: 'Boost Cards', icon: CreditCard },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
  { id: 'ammo', label: 'Ammo Types', icon: Zap },
];

interface Props {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

export default function AdminSidebar({ activeTab, onTabChange }: Props) {
  return (
    <aside
      className="w-64 shrink-0 flex flex-col gap-1 p-4 border-r h-full overflow-y-auto custom-scrollbar"
      style={{
        background: 'linear-gradient(180deg, rgba(4,24,40,0.98), rgba(6,36,50,0.95))',
        borderColor: 'rgba(45,212,191,0.12)',
      }}
    >
      <div className="flex items-center gap-2 mb-6 px-2">
        <Shield size={22} className="text-amber-400" />
        <h2
          className="text-lg font-extrabold tracking-wide text-transparent bg-clip-text"
          style={{ backgroundImage: 'linear-gradient(135deg, #fde68a, #fbbf24)' }}
        >
          ADMIN PANEL
        </h2>
      </div>

      {TABS.map((t) => {
        const active = t.id === activeTab;
        return (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer text-left"
            style={{
              background: active
                ? 'linear-gradient(135deg, rgba(45,212,191,0.15), rgba(34,211,238,0.08))'
                : 'transparent',
              color: active ? '#5eead4' : '#94a3b8',
              border: active ? '1px solid rgba(45,212,191,0.25)' : '1px solid transparent',
            }}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        );
      })}

      <div className="mt-auto pt-4 border-t" style={{ borderColor: 'rgba(45,212,191,0.1)' }}>
        <a
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-teal-300 transition-colors"
        >
          ← Back to Game
        </a>
      </div>
    </aside>
  );
}
