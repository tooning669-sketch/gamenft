'use client';

import React, { useEffect, useRef } from 'react';
import { GunSkin, InventoryItem, RewardRarity } from '@/lib/gameTypes';
import { getRarityColor } from '@/lib/gameUtils';
import { playClickSound } from './SoundManager';

interface GunSkinPickerProps {
  isOpen: boolean;
  selectedSkin: GunSkin;
  ownedGuns: { skin: GunSkin; invItem: InventoryItem }[];
  onSelectSkin: (skin: GunSkin) => void;
  onClose: () => void;
}

const RARITY_ORDER: RewardRarity[] = ['Common', 'Rare', 'Legendary'];
const RARITY_LABELS: Record<RewardRarity, string> = {
  Common: '⚪ Common',
  Rare: '🔵 Rare',
  Legendary: '🟡 Legendary',
};

export default function GunSkinPicker({
  isOpen,
  selectedSkin,
  ownedGuns,
  onSelectSkin,
  onClose,
}: GunSkinPickerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Delay to avoid immediate close from the click that opened it
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClick);
    }, 50);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [isOpen, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const skinsByRarity = RARITY_ORDER.map((rarity) => ({
    rarity,
    guns: ownedGuns.filter((g) => g.skin.rarity === rarity),
  })).filter(({ guns }) => guns.length > 0);

  const handleSelect = (skin: GunSkin) => {
    playClickSound();
    onSelectSkin(skin);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center animate-skin-picker-backdrop">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.7), rgba(0,0,0,0.9))',
          backdropFilter: 'blur(8px)',
        }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative z-10 w-[90vw] max-w-[700px] max-h-[80vh] rounded-2xl overflow-hidden animate-skin-picker-enter"
        style={{
          background: 'linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,41,59,0.95))',
          border: '1px solid rgba(99,102,241,0.3)',
          boxShadow: '0 0 60px rgba(99,102,241,0.15), 0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3 border-b"
          style={{ borderColor: 'rgba(99,102,241,0.2)' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">🎨</span>
            <h3 className="text-base sm:text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              SELECT YOUR WEAPON
            </h3>
            <span className="text-[10px] text-slate-500 font-semibold">({ownedGuns.length} owned)</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Currently selected */}
        <div
          className="flex items-center gap-3 px-5 py-3 border-b"
          style={{
            borderColor: 'rgba(99,102,241,0.15)',
            background: `linear-gradient(90deg, ${selectedSkin.color}10, transparent)`,
          }}
        >
          <div
            className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center"
            style={{
              background: `radial-gradient(circle, ${selectedSkin.color}20, transparent)`,
              border: `2px solid ${selectedSkin.color}50`,
              boxShadow: `0 0 12px ${selectedSkin.glowColor}`,
            }}
          >
            <img
              src={selectedSkin.image}
              alt={selectedSkin.name}
              className="w-10 h-10 object-contain"
            />
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Equipped</div>
            <div className="text-sm font-bold text-white">{selectedSkin.name}</div>
            <div className="flex gap-2 mt-1">
              <span className="text-[9px] text-rose-400 font-bold">⚔️{selectedSkin.dmg}</span>
              <span className="text-[9px] text-amber-400 font-bold">⚡{selectedSkin.energy}</span>
              <span className="text-[9px] text-cyan-400 font-bold">🔧{selectedSkin.durability}</span>
              <span className="text-[9px] text-green-400 font-bold">⏱️{selectedSkin.cooldownSec}s</span>
            </div>
          </div>
          <span
            className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold uppercase"
            style={{
              color: getRarityColor(selectedSkin.rarity),
              background: `${getRarityColor(selectedSkin.rarity)}15`,
              border: `1px solid ${getRarityColor(selectedSkin.rarity)}30`,
            }}
          >
            {selectedSkin.rarity}
          </span>
        </div>

        {/* Skin grid — only owned guns */}
        <div className="overflow-y-auto max-h-[55vh] custom-scrollbar p-4 space-y-4">
          {ownedGuns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <span className="text-4xl">🔫</span>
              <span className="text-sm text-slate-500 font-semibold">No weapons owned</span>
              <span className="text-[11px] text-slate-600">Buy weapons from the Marketplace!</span>
            </div>
          ) : (
            skinsByRarity.map(({ rarity, guns }) => (
              <div key={rarity}>
                {/* Rarity header */}
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: getRarityColor(rarity) }}
                  >
                    {RARITY_LABELS[rarity]}
                  </span>
                  <div
                    className="flex-1 h-px"
                    style={{ background: `linear-gradient(90deg, ${getRarityColor(rarity)}30, transparent)` }}
                  />
                  <span className="text-[10px] text-slate-500">{guns.length} owned</span>
                </div>

                {/* Skin cards */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {guns.map(({ skin, invItem }) => {
                    const isSelected = selectedSkin.id === skin.id;
                    const rarityColor = getRarityColor(skin.rarity);
                    const isBroken = invItem.durability !== undefined && invItem.durability <= 0;
                    const duraPercent = invItem.durability !== undefined && invItem.maxDurability
                      ? (invItem.durability / invItem.maxDurability) * 100 : 100;
                    return (
                      <button
                        key={invItem.id}
                        onClick={() => !isBroken && handleSelect(skin)}
                        disabled={isBroken}
                        className={`
                          group relative flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all duration-200
                          ${isBroken ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'}
                          ${isSelected ? 'ring-2 ring-offset-1 ring-offset-transparent' : ''}
                        `}
                        style={{
                          background: isSelected
                            ? `linear-gradient(135deg, ${rarityColor}20, ${rarityColor}08)`
                            : 'rgba(15,23,42,0.6)',
                          border: isSelected
                            ? `2px solid ${rarityColor}80`
                            : '1px solid rgba(100,116,139,0.2)',
                          boxShadow: isSelected
                            ? `0 0 20px ${skin.glowColor}, inset 0 0 15px ${rarityColor}10`
                            : 'none',
                          ...(isSelected ? { ringColor: rarityColor } : {}),
                        }}
                      >
                        {/* Selected check */}
                        {isSelected && (
                          <div
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold z-10"
                            style={{
                              background: rarityColor,
                              color: '#0f172a',
                              boxShadow: `0 0 8px ${skin.glowColor}`,
                            }}
                          >
                            ✓
                          </div>
                        )}

                        {/* Broken badge */}
                        {isBroken && (
                          <div className="absolute top-1 left-1 z-10 px-1.5 py-0.5 rounded-full text-[8px] font-black text-red-400"
                            style={{ background: 'rgba(239,68,68,0.3)', border: '1px solid rgba(239,68,68,0.5)' }}>
                            💔
                          </div>
                        )}

                        {/* Gun image */}
                        <div
                          className="w-14 h-14 sm:w-16 sm:h-16 relative flex items-center justify-center rounded-lg overflow-hidden transition-all duration-300 group-hover:scale-110"
                          style={{
                            background: `radial-gradient(circle, ${rarityColor}10, transparent)`,
                            filter: isBroken ? 'grayscale(0.6) brightness(0.7)' : 'none',
                          }}
                        >
                          <img
                            src={skin.image}
                            alt={skin.name}
                            className="w-14 h-14 object-contain drop-shadow-lg"
                            style={{
                              filter: isSelected ? `drop-shadow(0 0 6px ${skin.glowColor})` : 'none',
                            }}
                          />
                        </div>

                        {/* Name */}
                        <span
                          className="text-[10px] sm:text-[11px] font-bold truncate max-w-full"
                          style={{ color: isSelected ? rarityColor : '#cbd5e1' }}
                        >
                          {skin.name}
                        </span>

                        {/* Stats mini */}
                        <div className="flex flex-wrap justify-center gap-x-1.5 gap-y-0.5">
                          <span className="text-[8px] text-rose-400 font-semibold">⚔️{skin.dmg}</span>
                          <span className="text-[8px] text-amber-400 font-semibold">⚡{skin.energy}</span>
                          <span className="text-[8px] text-cyan-400 font-semibold">🔧{invItem.durability ?? skin.durability}/{skin.durability}</span>
                          <span className="text-[8px] text-green-400 font-semibold">⏱️{skin.cooldownSec}s</span>
                        </div>

                        {/* Durability mini-bar */}
                        <div className="w-full h-1 rounded-full bg-slate-800/80 overflow-hidden mt-0.5">
                          <div className="h-full rounded-full transition-all"
                            style={{
                              width: `${duraPercent}%`,
                              background: duraPercent > 60 ? '#06b6d4' : duraPercent > 30 ? '#f59e0b' : duraPercent > 0 ? '#ef4444' : '#374151',
                            }}
                          />
                        </div>

                        {/* Hover glow effect */}
                        <div
                          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                          style={{
                            background: `radial-gradient(circle at center, ${rarityColor}08, transparent 70%)`,
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
