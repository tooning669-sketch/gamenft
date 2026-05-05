'use client';

import React, { useState } from 'react';
import { InventoryItem, MarketCategory } from '@/lib/gameTypes';
import { getRarityColor } from '@/lib/gameUtils';
import { playClickSound } from './SoundManager';

interface InventoryProps {
  items: InventoryItem[];
  onSellItem: (item: InventoryItem) => void;
  onRepairItem: (item: InventoryItem) => void;
  playerCoins: number;
}

const TABS: { key: MarketCategory | 'all'; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: '📦' },
  { key: 'guns', label: 'Weapons', icon: '🔫' },
  { key: 'cards', label: 'Cards', icon: '🃏' },
  { key: 'ammo', label: 'Ammo', icon: '💣' },
  { key: 'special', label: 'Items', icon: '✨' },
];

function getRepairCost(rarity: string) {
  return rarity === 'Legendary' ? 500 : rarity === 'Rare' ? 250 : 100;
}

export default function Inventory({ items, onSellItem, onRepairItem, playerCoins }: InventoryProps) {
  const [selectedTab, setSelectedTab] = useState<MarketCategory | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const filtered = selectedTab === 'all' ? items : items.filter((i) => i.category === selectedTab);
  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="flex flex-col gap-4 sm:gap-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
          🎒 INVENTORY
        </h2>
        <p className="text-[11px] text-slate-500 mt-1">
          {totalItems} items in your bag • Tap an item for actions
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 justify-center flex-wrap">
        {TABS.map((tab) => {
          const isActive = selectedTab === tab.key;
          const count = tab.key === 'all' ? items.length : items.filter((i) => i.category === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => { playClickSound(); setSelectedTab(tab.key); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer hover:scale-105 active:scale-95"
              style={{
                background: isActive ? 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(34,211,238,0.08))' : 'rgba(15,23,42,0.6)',
                border: isActive ? '1px solid rgba(34,211,238,0.5)' : '1px solid rgba(100,116,139,0.2)',
                color: isActive ? '#67e8f9' : '#94a3b8',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {count > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px]"
                  style={{ background: isActive ? 'rgba(34,211,238,0.3)' : 'rgba(100,116,139,0.2)' }}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Items Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-xl"
          style={{ background: 'rgba(15,23,42,0.5)', border: '1px dashed rgba(100,116,139,0.3)' }}>
          <span className="text-4xl">🎒</span>
          <span className="text-sm text-slate-500 font-semibold">Your bag is empty</span>
          <span className="text-[11px] text-slate-600">Buy items from the Marketplace or pop balloons!</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((item) => {
            const rarityColor = getRarityColor(item.rarity);
            const isSelected = selectedItem?.id === item.id;
            const hasDurability = item.durability !== undefined && item.maxDurability !== undefined;
            const isBroken = hasDurability && item.durability! <= 0;
            const durabilityPercent = hasDurability ? (item.durability! / item.maxDurability!) * 100 : 100;
            const repairCost = getRepairCost(item.rarity);
            const canAffordRepair = playerCoins >= repairCost;

            return (
              <div
                key={item.id}
                className={`relative rounded-xl overflow-hidden transition-all duration-200 cursor-pointer hover:scale-[1.03] ${isSelected ? 'ring-2 ring-cyan-400' : ''} ${isBroken ? 'ring-1 ring-red-500/50' : ''}`}
                onClick={() => { playClickSound(); setSelectedItem(isSelected ? null : item); }}
                style={{
                  background: 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.8))',
                  border: `1px solid ${isBroken ? 'rgba(239,68,68,0.4)' : rarityColor + '30'}`,
                }}
              >
                {/* Quantity badge */}
                {item.quantity > 1 && (
                  <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full text-[10px] font-black text-white"
                    style={{ background: 'rgba(99,102,241,0.8)' }}>
                    ×{item.quantity}
                  </div>
                )}

                {/* Broken badge */}
                {isBroken && (
                  <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full text-[10px] font-black text-red-400 animate-pulse"
                    style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)' }}>
                    💔 BROKEN
                  </div>
                )}

                {/* Image */}
                <div className="w-full aspect-square flex items-center justify-center p-3"
                  style={{
                    background: `radial-gradient(circle, ${rarityColor}08, transparent)`,
                    filter: isBroken ? 'grayscale(0.6) brightness(0.7)' : 'none',
                  }}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-4xl">{item.icon}</span>
                  )}
                </div>

                {/* Info */}
                <div className="p-2 pt-1 border-t" style={{ borderColor: `${rarityColor}15` }}>
                  <div className="text-[11px] font-bold text-white truncate">{item.name}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase"
                      style={{ color: rarityColor, background: `${rarityColor}15`, border: `1px solid ${rarityColor}25` }}>
                      {item.rarity}
                    </span>
                    <span className="text-[8px] text-slate-500">{item.category}</span>
                  </div>

                  {/* Description */}
                  {item.description && (
                    <div className="text-[9px] text-slate-500 mt-1 truncate">{item.description}</div>
                  )}

                  {/* Durability Bar (for guns) */}
                  {hasDurability && (
                    <div className="mt-1.5 space-y-0.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-semibold text-cyan-400/80">🔧 Durability</span>
                        <span className="text-[9px] text-slate-500 font-mono">{item.durability}/{item.maxDurability}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${durabilityPercent}%`,
                            background: durabilityPercent > 60
                              ? 'linear-gradient(90deg, #06b6d4, #22d3ee)'
                              : durabilityPercent > 30
                                ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                                : durabilityPercent > 0
                                  ? 'linear-gradient(90deg, #ef4444, #f87171)'
                                  : '#374151',
                            boxShadow: durabilityPercent > 0 ? `0 0 6px ${durabilityPercent > 60 ? 'rgba(6,182,212,0.4)' : durabilityPercent > 30 ? 'rgba(245,158,11,0.4)' : 'rgba(239,68,68,0.4)'}` : 'none',
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Action overlay */}
                {isSelected && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-black/70 rounded-xl animate-slide-in">
                    {/* Repair button (only for items with durability that are not at max) */}
                    {hasDurability && item.durability! < item.maxDurability! && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (canAffordRepair) {
                            onRepairItem(item);
                            setSelectedItem(null);
                          }
                        }}
                        disabled={!canAffordRepair}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          canAffordRepair
                            ? 'text-green-400 bg-green-500/20 border border-green-500/40 hover:bg-green-500/30 hover:scale-105 active:scale-95'
                            : 'text-slate-500 bg-slate-700/30 border border-slate-600/30 cursor-not-allowed opacity-60'
                        }`}
                      >
                        🔧 Repair {isBroken ? '(BROKEN)' : ''} • 🪙{repairCost}
                      </button>
                    )}

                    {/* Sell button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); onSellItem(item); setSelectedItem(null); }}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-amber-400 bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 transition-all cursor-pointer hover:scale-105 active:scale-95"
                    >
                      🏪 Sell on Market
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
