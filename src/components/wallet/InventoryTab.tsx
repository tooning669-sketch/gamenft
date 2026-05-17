'use client';
import React, { useState } from 'react';
import { InventoryItem, MarketCategory, GUN_SKINS } from '@/lib/gameTypes';
import { getRarityColor } from '@/lib/gameUtils';
import { playClickSound } from '../SoundManager';
import { Package, Crosshair, CreditCard, Sparkles, Backpack, AlertTriangle, Megaphone, Wrench, Check, Coins, Zap, Clock, FileText, Link2, Swords, Tag } from 'lucide-react';

interface InventoryTabProps {
  items: InventoryItem[];
  onRepairItem: (item: InventoryItem) => void;
  playerCoins: number;
}

const TABS: { key: MarketCategory | 'all'; label: string; icon: typeof Package }[] = [
  { key: 'all', label: 'All', icon: Package },
  { key: 'guns', label: 'Weapons', icon: Crosshair },
  { key: 'cards', label: 'Cards', icon: CreditCard },
  { key: 'ammo', label: 'Ammo', icon: Package },
  { key: 'special', label: 'Items', icon: Sparkles },
];

function getRepairCost(rarity: string) {
  return rarity === 'Legendary' ? 500 : rarity === 'Rare' ? 250 : 100;
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getRarityGlow(rarity: string) {
  if (rarity === 'Legendary') return '0 0 30px rgba(251,191,36,0.2)';
  if (rarity === 'Rare') return '0 0 20px rgba(56,189,248,0.15)';
  return 'none';
}

export default function InventoryTab({ items, onRepairItem, playerCoins }: InventoryTabProps) {
  const [selectedTab, setSelectedTab] = useState<MarketCategory | 'all'>('all');
  const [detailItem, setDetailItem] = useState<InventoryItem | null>(null);

  const filtered = selectedTab === 'all' ? items : items.filter((i) => i.category === selectedTab);

  const getGunStats = (item: InventoryItem) => GUN_SKINS.find(g => g.name === item.name);

  return (
    <>
      <div className="flex flex-col gap-4 max-w-5xl mx-auto">
        {/* Category Tabs */}
        <div className="flex gap-2 justify-center flex-wrap">
          {TABS.map((tab) => {
            const isActive = selectedTab === tab.key;
            const count = tab.key === 'all' ? items.length : items.filter((i) => i.category === tab.key).length;
            return (
              <button key={tab.key} onClick={() => { playClickSound(); setSelectedTab(tab.key); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer hover:scale-105 active:scale-95"
                style={{
                  background: isActive ? 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(34,211,238,0.08))' : 'rgba(15,23,42,0.6)',
                  border: isActive ? '1px solid rgba(34,211,238,0.5)' : '1px solid rgba(100,116,139,0.2)',
                  color: isActive ? '#67e8f9' : '#94a3b8',
                }}>
                <span>{tab.icon && <tab.icon size={13} />}</span>
                <span>{tab.label}</span>
                {count > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px]" style={{ background: isActive ? 'rgba(34,211,238,0.3)' : 'rgba(100,116,139,0.2)' }}>{count}</span>}
              </button>
            );
          })}
        </div>

        {/* Items Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-xl" style={{ background: 'rgba(6,28,44,0.6)', border: '1px dashed rgba(100,116,139,0.2)' }}>
            <Backpack size={36} className="text-slate-600" />
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
                <div key={item.id}
                  className={`relative rounded-xl overflow-hidden transition-all duration-200 cursor-pointer hover:scale-[1.03] ${isBroken ? 'ring-1 ring-red-500/50' : ''}`}
                  onClick={() => { playClickSound(); setDetailItem(item); }}
                  style={{ background: 'linear-gradient(135deg, rgba(7,47,62,0.9), rgba(8,96,95,0.72))', border: `1px solid ${isBroken ? 'rgba(239,68,68,0.4)' : rarityColor + '30'}` }}>
                  {item.quantity > 1 && <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full text-[10px] font-black text-white" style={{ background: 'rgba(14,165,233,0.86)' }}>x{item.quantity}</div>}
                  {isBroken && <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold text-red-400 animate-pulse flex items-center gap-0.5" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}><AlertTriangle size={10} /> BROKEN</div>}
                  {isListed && !isBroken && <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-400 flex items-center gap-0.5" style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}><Megaphone size={10} /> LISTED</div>}
                  <div className="w-full aspect-square flex items-center justify-center p-3" style={{ background: `radial-gradient(circle, ${rarityColor}08, transparent)`, filter: isBroken ? 'grayscale(0.6) brightness(0.7)' : 'none' }}>
                    {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-contain" /> : <span className="text-4xl">{item.icon}</span>}
                  </div>
                  <div className="p-2 pt-1 border-t" style={{ borderColor: `${rarityColor}15` }}>
                    <div className="text-[11px] font-bold text-white truncate">{item.name}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase" style={{ color: rarityColor, background: `${rarityColor}15`, border: `1px solid ${rarityColor}25` }}>{item.rarity}</span>
                      <span className="text-[8px] text-slate-500">{item.category}</span>
                    </div>
                    {hasDurability && (
                      <div className="mt-1.5"><div className="h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${durabilityPercent}%`, background: durabilityPercent > 60 ? 'linear-gradient(90deg, #06b6d4, #22d3ee)' : durabilityPercent > 30 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : durabilityPercent > 0 ? 'linear-gradient(90deg, #ef4444, #f87171)' : '#374151' }} />
                      </div></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Item Detail Modal */}
      {detailItem && (() => {
        const item = items.find(i => i.id === detailItem.id) || detailItem;
        const gunStats = getGunStats(item);
        const rarityColor = getRarityColor(item.rarity);
        const rarGlow = getRarityGlow(item.rarity);
        const hasDur = item.durability !== undefined && item.maxDurability !== undefined;
        const isBrk = hasDur && item.durability! <= 0;
        const durPct = hasDur ? (item.durability! / item.maxDurability!) * 100 : 100;
        const repCost = getRepairCost(item.rarity);
        const canRepair = playerCoins >= repCost;
        const needsRep = hasDur && item.durability! < item.maxDurability!;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-skin-picker-backdrop" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={() => setDetailItem(null)}>
            <div className="relative w-full max-w-md rounded-2xl overflow-hidden animate-skin-picker-enter" style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.98), rgba(30,41,59,0.95))', border: `1px solid ${rarityColor}40`, boxShadow: rarGlow }} onClick={e => e.stopPropagation()}>
              <button onClick={() => setDetailItem(null)} className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all cursor-pointer">X</button>
              <div className="relative flex items-center justify-center py-8 px-6" style={{ background: `radial-gradient(circle, ${rarityColor}15, transparent 70%)` }}>
                {item.image ? <img src={item.image} alt={item.name} className="relative w-32 h-32 object-contain drop-shadow-xl" style={{ filter: isBrk ? 'grayscale(0.6) brightness(0.7)' : 'none' }} /> : <span className="relative text-6xl">{item.icon}</span>}
              </div>
              <div className="px-5 pb-5 space-y-4">
                <div>
                  <h3 className="text-lg font-black text-white">{item.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase" style={{ color: rarityColor, background: `${rarityColor}15`, border: `1px solid ${rarityColor}30` }}>{item.rarity}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase text-slate-400 bg-slate-800/50 border border-slate-700/30">{item.category}</span>
                  </div>
                  {item.description && <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{item.description}</p>}
                </div>
                {gunStats && (
                  <div className="rounded-xl p-3 space-y-2" style={{ background: 'rgba(8,47,73,0.56)', border: '1px solid rgba(125,211,252,0.18)' }}>
                    <h4 className="text-[10px] font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1"><Swords size={12} /> Weapon Stats</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {[{ label: 'DMG', value: gunStats.dmg, ic: Zap, color: '#ef4444' }, { label: 'Energy', value: gunStats.energy, ic: Zap, color: '#f59e0b' }, { label: 'Durability', value: `${item.durability ?? gunStats.durability}/${gunStats.durability}`, ic: Wrench, color: '#06b6d4' }, { label: 'Cooldown', value: `${gunStats.cooldownSec}s`, ic: Clock, color: '#38bdf8' }].map(s => (
                        <div key={s.label} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg" style={{ background: `${s.color}08`, border: `1px solid ${s.color}15` }}>
                          <s.ic size={16} style={{ color: s.color }} />
                          <div><div className="text-[9px] text-slate-500 font-semibold uppercase">{s.label}</div><div className="text-xs font-bold" style={{ color: s.color }}>{s.value}</div></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="rounded-xl p-3 space-y-2" style={{ background: 'rgba(8,47,73,0.56)', border: '1px solid rgba(125,211,252,0.18)' }}>
                  <h4 className="text-[10px] font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1"><FileText size={12} /> Attributes</h4>
                  <div className="space-y-1.5">
                    {[['Category', <span key="c" className="capitalize">{item.category}</span>], ['Rarity', <span key="r" style={{ color: rarityColor }}>{item.rarity}</span>], ['Quantity', item.quantity], ['Acquired', <span key="a" className="text-[10px]">{formatDate(item.acquiredAt)}</span>]].map(([l, v], i) => (
                      <div key={i} className="flex justify-between items-center text-[11px]"><span className="text-slate-500">{l}</span><span className="text-white font-semibold">{v}</span></div>
                    ))}
                  </div>
                </div>
                {item.tokenId && (
                  <div className="rounded-xl p-3 space-y-2" style={{ background: 'linear-gradient(135deg, rgba(56,189,248,0.08), rgba(52,211,153,0.05))', border: '1px solid rgba(125,211,252,0.2)' }}>
                    <h4 className="text-[10px] font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1"><Link2 size={12} /> NFT Information</h4>
                    <div className="space-y-1.5">
                      {[['Token ID', <span key="t" className="text-sky-300 font-mono text-[10px]">{item.tokenId}</span>], ['Chain', 'Ethereum'], ['Standard', 'ERC-721']].map(([l, v], i) => (
                        <div key={i} className="flex justify-between items-center text-[11px]"><span className="text-slate-500">{l}</span><span className="text-white font-semibold">{v}</span></div>
                      ))}
                    </div>
                  </div>
                )}
                {hasDur && (
                  <div className="flex gap-2 pt-1">
                    <button onClick={e => { e.stopPropagation(); if (canRepair && needsRep) { playClickSound(); onRepairItem(detailItem); setDetailItem(null); } }}
                      disabled={!canRepair || !needsRep}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${needsRep && canRepair ? 'text-green-400 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/40 hover:scale-[1.02] active:scale-95' : needsRep && !canRepair ? 'text-slate-500 bg-slate-700/30 border border-slate-600/30 cursor-not-allowed opacity-60' : 'text-cyan-400/60 bg-cyan-500/5 border border-cyan-500/20 cursor-default'}`}>
                      {needsRep ? <><Wrench size={14} /> Repair {isBrk ? '(BROKEN)' : ''} <span className="text-yellow-400 flex items-center gap-0.5"><Coins size={12} />{repCost}</span></> : <><Check size={14} /> Full Durability</>}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}
