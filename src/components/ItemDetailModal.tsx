'use client';

import React from 'react';
import { InventoryItem, GUN_SKINS } from '@/lib/gameTypes';
import { getRarityColor, getRarityGlow } from '@/lib/gameUtils';
import { playClickSound } from './SoundManager';
import {
  Coins, Wrench, Clock, Link2, FileText, Zap,
  AlertTriangle, Check, Tag, Swords
} from 'lucide-react';

function getRepairCost(rarity: string) {
  return rarity === 'Legendary' ? 500 : rarity === 'Rare' ? 250 : 100;
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

interface ItemDetailModalProps {
  item: InventoryItem;
  playerCoins: number;
  onRepair: () => void;
  onClose: () => void;
}

export default function ItemDetailModal({ item, playerCoins, onRepair, onClose }: ItemDetailModalProps) {
  const gunStats = GUN_SKINS.find(g => g.name === item.name);
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
        <button onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all cursor-pointer">✕</button>

        {/* Item image */}
        <div className="relative flex items-center justify-center py-8 px-6"
          style={{ background: `radial-gradient(circle, ${rarityColor}15, transparent 70%)` }}>
          <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(circle, ${rarityColor}20, transparent 60%)`, filter: 'blur(20px)' }} />
          {item.image ? (
            <img src={item.image} alt={item.name} className="relative w-32 h-32 object-contain drop-shadow-xl"
              style={{ filter: isBroken ? 'grayscale(0.6) brightness(0.7)' : 'none' }} />
          ) : (
            <span className="relative text-6xl">{item.icon}</span>
          )}
          {isBroken && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold text-red-400 animate-pulse flex items-center gap-0.5"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <AlertTriangle size={10} /> BROKEN
            </div>
          )}
          {item.listedPrice && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-400 flex items-center gap-0.5"
              style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
              <Tag size={10} /> Listed: <Coins size={10} />{item.listedPrice}
            </div>
          )}
          {item.quantity > 1 && (
            <div className="absolute top-3 right-12 px-2.5 py-1 rounded-full text-[10px] font-black text-white"
              style={{ background: 'rgba(14,165,233,0.86)' }}>×{item.quantity}</div>
          )}
        </div>

        {/* Details */}
        <div className="px-5 pb-5 space-y-4">
          <div>
            <h3 className="text-lg font-black text-white">{item.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase"
                style={{ color: rarityColor, background: `${rarityColor}15`, border: `1px solid ${rarityColor}30` }}>{item.rarity}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase text-slate-400 bg-slate-800/50 border border-slate-700/30">{item.category}</span>
            </div>
            {item.description && <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{item.description}</p>}
          </div>

          {gunStats && (
            <div className="rounded-xl p-3 space-y-2" style={{ background: 'rgba(8,47,73,0.56)', border: '1px solid rgba(125,211,252,0.18)' }}>
              <h4 className="text-[10px] font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1"><Swords size={12} /> Weapon Stats</h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'DMG', value: gunStats.dmg, lucideIcon: Zap, color: '#ef4444' },
                  { label: 'Energy', value: gunStats.energy, lucideIcon: Zap, color: '#f59e0b' },
                  { label: 'Durability', value: `${item.durability ?? gunStats.durability}/${gunStats.durability}`, lucideIcon: Wrench, color: '#06b6d4' },
                  { label: 'Cooldown', value: `${gunStats.cooldownSec}s`, lucideIcon: Clock, color: '#38bdf8' },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
                    style={{ background: `${stat.color}08`, border: `1px solid ${stat.color}15` }}>
                    <stat.lucideIcon size={16} style={{ color: stat.color }} />
                    <div>
                      <div className="text-[9px] text-slate-500 font-semibold uppercase">{stat.label}</div>
                      <div className="text-xs font-bold" style={{ color: stat.color }}>{stat.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasDurability && (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-semibold text-cyan-400 flex items-center gap-1"><Wrench size={12} /> Durability</span>
                <span className="text-[10px] text-slate-500 font-mono">{item.durability}/{item.maxDurability}</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-800/80 overflow-hidden border border-slate-700/30">
                <div className="h-full rounded-full transition-all duration-500 relative"
                  style={{
                    width: `${durabilityPercent}%`,
                    background: durabilityPercent > 60 ? 'linear-gradient(90deg, #06b6d4, #22d3ee)' : durabilityPercent > 30 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : durabilityPercent > 0 ? 'linear-gradient(90deg, #ef4444, #f87171)' : '#374151',
                  }}>
                  <div className="absolute inset-0 overflow-hidden rounded-full">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-energy-shine" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-xl p-3 space-y-2" style={{ background: 'rgba(8,47,73,0.56)', border: '1px solid rgba(125,211,252,0.18)' }}>
            <h4 className="text-[10px] font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1"><FileText size={12} /> Attributes</h4>
            <div className="space-y-1.5">
              {[
                { l: 'Category', v: item.category, c: 'text-white capitalize' },
                { l: 'Rarity', v: item.rarity, c: '', style: { color: rarityColor } },
                { l: 'Quantity', v: String(item.quantity), c: 'text-white' },
                { l: 'Acquired', v: formatDate(item.acquiredAt), c: 'text-white text-[10px]' },
              ].map(a => (
                <div key={a.l} className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">{a.l}</span>
                  <span className={`font-semibold ${a.c}`} style={a.style}>{a.v}</span>
                </div>
              ))}
              {item.listedPrice && (
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">Listed Price</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-0.5"><Coins size={10} /> {item.listedPrice.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {item.tokenId && (
            <div className="rounded-xl p-3 space-y-2" style={{ background: 'linear-gradient(135deg, rgba(56,189,248,0.08), rgba(52,211,153,0.05))', border: '1px solid rgba(125,211,252,0.2)' }}>
              <h4 className="text-[10px] font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1"><Link2 size={12} /> NFT Information</h4>
              <div className="space-y-1.5">
                {[
                  { l: 'Token ID', v: item.tokenId, c: 'text-sky-300 font-mono font-bold text-[10px]' },
                  { l: 'Chain', v: 'Ethereum', c: 'text-white font-semibold' },
                  { l: 'Standard', v: 'ERC-721', c: 'text-white font-semibold' },
                  { l: 'Contract', v: '0x8F21...7a3B', c: 'text-slate-400 font-mono text-[9px]' },
                ].map(a => (
                  <div key={a.l} className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">{a.l}</span>
                    <span className={a.c}>{a.v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasDurability && (
            <div className="flex gap-2 pt-1">
              <button
                onClick={(e) => { e.stopPropagation(); if (canAffordRepair && needsRepair) { playClickSound(); onRepair(); } }}
                disabled={!canAffordRepair || !needsRepair}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  needsRepair && canAffordRepair ? 'text-green-400 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/40 hover:scale-[1.02] active:scale-95'
                  : needsRepair && !canAffordRepair ? 'text-slate-500 bg-slate-700/30 border border-slate-600/30 cursor-not-allowed opacity-60'
                  : 'text-cyan-400/60 bg-cyan-500/5 border border-cyan-500/20 cursor-default'
                }`}
              >
                {needsRepair
                  ? <><Wrench size={14} /> Repair {isBroken ? '(BROKEN)' : ''} <span className="text-yellow-400 flex items-center gap-0.5"><Coins size={12} />{repairCost}</span></>
                  : <><Check size={14} /> Full Durability</>
                }
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
