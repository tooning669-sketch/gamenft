'use client';

import React, { useState } from 'react';
import { InventoryItem, MarketCategory, GUN_SKINS } from '@/lib/gameTypes';
import { getRarityColor, getRarityGlow } from '@/lib/gameUtils';
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

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function Inventory({ items, onSellItem, onRepairItem, playerCoins }: InventoryProps) {
  const [selectedTab, setSelectedTab] = useState<MarketCategory | 'all'>('all');
  const [detailItem, setDetailItem] = useState<InventoryItem | null>(null);

  const filtered = selectedTab === 'all' ? items : items.filter((i) => i.category === selectedTab);
  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);

  // Look up full gun stats
  const getGunStats = (item: InventoryItem) => {
    return GUN_SKINS.find(g => g.name === item.name);
  };

  return (
    <>
      <div className="flex flex-col gap-4 sm:gap-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
            🎒 INVENTORY
          </h2>
          <p className="text-[11px] text-slate-500 mt-1">
            {totalItems} items in your bag • Tap an item for details
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
              const hasDurability = item.durability !== undefined && item.maxDurability !== undefined;
              const isBroken = hasDurability && item.durability! <= 0;
              const durabilityPercent = hasDurability ? (item.durability! / item.maxDurability!) * 100 : 100;
              const isListed = !!item.listedPrice;

              return (
                <div
                  key={item.id}
                  className={`relative rounded-xl overflow-hidden transition-all duration-200 cursor-pointer hover:scale-[1.03] ${isBroken ? 'ring-1 ring-red-500/50' : ''}`}
                  onClick={() => { playClickSound(); setDetailItem(item); }}
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

                  {/* Listed badge */}
                  {isListed && !isBroken && (
                    <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full text-[10px] font-black text-green-400"
                      style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)' }}>
                      📢 LISTED
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

                    {/* Durability Bar (for guns) */}
                    {hasDurability && (
                      <div className="mt-1.5">
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
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===== ITEM DETAIL MODAL ===== */}
      {detailItem && (
        <ItemDetailModal
          item={detailItem}
          gunStats={getGunStats(detailItem)}
          playerCoins={playerCoins}
          onRepair={() => { onRepairItem(detailItem); setDetailItem(null); }}
          onSell={() => { onSellItem(detailItem); setDetailItem(null); }}
          onClose={() => setDetailItem(null)}
        />
      )}
    </>
  );
}

// ==========================================
// Item Detail Modal Component
// ==========================================

interface ItemDetailModalProps {
  item: InventoryItem;
  gunStats: ReturnType<typeof GUN_SKINS.find>;
  playerCoins: number;
  onRepair: () => void;
  onSell: () => void;
  onClose: () => void;
}

function ItemDetailModal({ item, gunStats, playerCoins, onRepair, onSell, onClose }: ItemDetailModalProps) {
  const rarityColor = getRarityColor(item.rarity);
  const rarityGlow = getRarityGlow(item.rarity);
  const hasDurability = item.durability !== undefined && item.maxDurability !== undefined;
  const isBroken = hasDurability && item.durability! <= 0;
  const durabilityPercent = hasDurability ? (item.durability! / item.maxDurability!) * 100 : 100;
  const repairCost = getRepairCost(item.rarity);
  const canAffordRepair = playerCoins >= repairCost;
  const needsRepair = hasDurability && item.durability! < item.maxDurability!;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-skin-picker-backdrop"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden animate-skin-picker-enter"
        style={{
          background: 'linear-gradient(180deg, rgba(15,23,42,0.98), rgba(30,41,59,0.95))',
          border: `1px solid ${rarityColor}40`,
          boxShadow: rarityGlow,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all cursor-pointer"
        >
          ✕
        </button>

        {/* Item image section */}
        <div
          className="relative flex items-center justify-center py-8 px-6"
          style={{
            background: `radial-gradient(circle, ${rarityColor}15, transparent 70%)`,
          }}
        >
          {/* Rarity glow ring */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: `radial-gradient(circle, ${rarityColor}20, transparent 60%)`,
              filter: 'blur(20px)',
            }}
          />

          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="relative w-32 h-32 object-contain drop-shadow-xl"
              style={{ filter: isBroken ? 'grayscale(0.6) brightness(0.7)' : 'none' }}
            />
          ) : (
            <span className="relative text-6xl">{item.icon}</span>
          )}

          {/* Badges */}
          {isBroken && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black text-red-400 animate-pulse"
              style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)' }}>
              💔 BROKEN
            </div>
          )}
          {item.listedPrice && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black text-green-400"
              style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)' }}>
              📢 Listed: 🪙{item.listedPrice}
            </div>
          )}
          {item.quantity > 1 && (
            <div className="absolute top-3 right-12 px-2.5 py-1 rounded-full text-[10px] font-black text-white"
              style={{ background: 'rgba(99,102,241,0.8)' }}>
              ×{item.quantity}
            </div>
          )}
        </div>

        {/* Item details section */}
        <div className="px-5 pb-5 space-y-4">
          {/* Name + Rarity */}
          <div>
            <h3 className="text-lg font-black text-white">{item.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase"
                style={{ color: rarityColor, background: `${rarityColor}15`, border: `1px solid ${rarityColor}30` }}>
                {item.rarity}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase text-slate-400 bg-slate-800/50 border border-slate-700/30">
                {item.category}
              </span>
            </div>
            {item.description && (
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{item.description}</p>
            )}
          </div>

          {/* Gun Stats (if weapon) */}
          {gunStats && (
            <div className="rounded-xl p-3 space-y-2"
              style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <h4 className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">⚔️ Weapon Stats</h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'DMG', value: gunStats.dmg, icon: '💥', color: '#ef4444' },
                  { label: 'Energy', value: gunStats.energy, icon: '⚡', color: '#f59e0b' },
                  { label: 'Durability', value: `${item.durability ?? gunStats.durability}/${gunStats.durability}`, icon: '🔧', color: '#06b6d4' },
                  { label: 'Cooldown', value: `${gunStats.cooldownSec}s`, icon: '⏱️', color: '#8b5cf6' },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
                    style={{ background: `${stat.color}08`, border: `1px solid ${stat.color}15` }}>
                    <span className="text-sm">{stat.icon}</span>
                    <div>
                      <div className="text-[9px] text-slate-500 font-semibold uppercase">{stat.label}</div>
                      <div className="text-xs font-bold" style={{ color: stat.color }}>{stat.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Durability Bar */}
          {hasDurability && (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-semibold text-cyan-400">🔧 Durability</span>
                <span className="text-[10px] text-slate-500 font-mono">{item.durability}/{item.maxDurability}</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-800/80 overflow-hidden border border-slate-700/30">
                <div
                  className="h-full rounded-full transition-all duration-500 relative"
                  style={{
                    width: `${durabilityPercent}%`,
                    background: durabilityPercent > 60
                      ? 'linear-gradient(90deg, #06b6d4, #22d3ee)'
                      : durabilityPercent > 30
                        ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                        : durabilityPercent > 0
                          ? 'linear-gradient(90deg, #ef4444, #f87171)'
                          : '#374151',
                    boxShadow: durabilityPercent > 0
                      ? `0 0 8px ${durabilityPercent > 60 ? 'rgba(6,182,212,0.4)' : durabilityPercent > 30 ? 'rgba(245,158,11,0.4)' : 'rgba(239,68,68,0.4)'}`
                      : 'none',
                  }}
                >
                  <div className="absolute inset-0 overflow-hidden rounded-full">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-energy-shine" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Attributes */}
          <div className="rounded-xl p-3 space-y-2"
            style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(99,102,241,0.15)' }}>
            <h4 className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">📋 Attributes</h4>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">Category</span>
                <span className="text-white font-semibold capitalize">{item.category}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">Rarity</span>
                <span className="font-semibold" style={{ color: rarityColor }}>{item.rarity}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">Quantity</span>
                <span className="text-white font-semibold">{item.quantity}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">Acquired</span>
                <span className="text-white font-semibold text-[10px]">{formatDate(item.acquiredAt)}</span>
              </div>
              {item.listedPrice && (
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">Listed Price</span>
                  <span className="text-green-400 font-bold">🪙 {item.listedPrice.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* NFT Info */}
          {item.tokenId && (
            <div className="rounded-xl p-3 space-y-2"
              style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(99,102,241,0.05))', border: '1px solid rgba(139,92,246,0.2)' }}>
              <h4 className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">🔗 NFT Information</h4>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">Token ID</span>
                  <span className="text-purple-300 font-mono font-bold text-[10px]">{item.tokenId}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">Chain</span>
                  <span className="text-white font-semibold">Ethereum</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">Standard</span>
                  <span className="text-white font-semibold">ERC-721</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">Contract</span>
                  <span className="text-slate-400 font-mono text-[9px]">0x8F21...7a3B</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            {/* Repair button */}
            {needsRepair && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (canAffordRepair) {
                    playClickSound();
                    onRepair();
                  }
                }}
                disabled={!canAffordRepair}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  canAffordRepair
                    ? 'text-green-400 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/40 hover:scale-[1.02] active:scale-95'
                    : 'text-slate-500 bg-slate-700/30 border border-slate-600/30 cursor-not-allowed opacity-60'
                }`}
              >
                🔧 Repair {isBroken ? '(BROKEN)' : ''} <span className="text-yellow-400">🪙{repairCost}</span>
              </button>
            )}

            {/* Sell button */}
            <button
              onClick={(e) => { e.stopPropagation(); playClickSound(); onSell(); }}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-amber-400 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              🏪 Quick Sell
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
