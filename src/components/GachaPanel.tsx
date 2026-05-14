'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  RewardRarity,
  RewardItemDef,
  REWARD_ITEMS,
  GUN_SKINS,
  InventoryItem,
  GunSkin,
} from '@/lib/gameTypes';

// ==========================================
// Gacha Box Definitions
// ==========================================

interface GachaBox {
  id: string;
  name: string;
  icon: string;
  costGems: number;
  color: string;
  glowColor: string;
  gradientFrom: string;
  gradientTo: string;
  borderColor: string;
  // Drop rate overrides
  rates: Record<RewardRarity, number>;
  description: string;
  // Bonus: chance to get a gun
  gunChance: number;
}

const GACHA_BOXES: GachaBox[] = [
  {
    id: 'bronze',
    name: 'Bronze Box',
    icon: '🎁',
    costGems: 3,
    color: '#cd7f32',
    glowColor: 'rgba(205,127,50,0.4)',
    gradientFrom: '#cd7f32',
    gradientTo: '#8b5e3c',
    borderColor: 'rgba(205,127,50,0.5)',
    rates: { Common: 0.70, Rare: 0.25, Legendary: 0.05 },
    description: 'Basic rewards with a small legendary chance',
    gunChance: 0.05,
  },
  {
    id: 'silver',
    name: 'Silver Box',
    icon: '🎀',
    costGems: 8,
    color: '#c0c0c0',
    glowColor: 'rgba(192,192,192,0.5)',
    gradientFrom: '#e8e8e8',
    gradientTo: '#a0a0a0',
    borderColor: 'rgba(192,192,192,0.5)',
    rates: { Common: 0.40, Rare: 0.45, Legendary: 0.15 },
    description: 'Better odds for rare & legendary items',
    gunChance: 0.12,
  },
  {
    id: 'gold',
    name: 'Gold Box',
    icon: '👑',
    costGems: 20,
    color: '#fbbf24',
    glowColor: 'rgba(251,191,36,0.5)',
    gradientFrom: '#fde68a',
    gradientTo: '#d97706',
    borderColor: 'rgba(251,191,36,0.6)',
    rates: { Common: 0.15, Rare: 0.45, Legendary: 0.40 },
    description: 'Highest legendary chance + rare guns!',
    gunChance: 0.25,
  },
];

// ==========================================
// Gacha Result
// ==========================================

interface GachaResult {
  name: string;
  icon: string;
  rarity: RewardRarity;
  description: string;
  currency?: 'coins' | 'gems' | 'usdt' | 'btc';
  amount?: number;
  isGun?: boolean;
  gunSkin?: GunSkin;
}

function rollGacha(box: GachaBox): GachaResult {
  // Check gun chance first
  if (Math.random() < box.gunChance) {
    const rarityRoll = Math.random();
    let gunRarity: RewardRarity = 'Common';
    if (box.id === 'gold') {
      gunRarity = rarityRoll < 0.4 ? 'Legendary' : rarityRoll < 0.75 ? 'Rare' : 'Common';
    } else if (box.id === 'silver') {
      gunRarity = rarityRoll < 0.15 ? 'Legendary' : rarityRoll < 0.55 ? 'Rare' : 'Common';
    } else {
      gunRarity = rarityRoll < 0.05 ? 'Legendary' : rarityRoll < 0.3 ? 'Rare' : 'Common';
    }
    const gunsOfRarity = GUN_SKINS.filter((g) => g.rarity === gunRarity);
    const gun = gunsOfRarity[Math.floor(Math.random() * gunsOfRarity.length)];
    return {
      name: gun.name,
      icon: '🔫',
      rarity: gun.rarity,
      description: `DMG ${gun.dmg} • Energy ${gun.energy} • CD ${gun.cooldownSec}s`,
      isGun: true,
      gunSkin: gun,
    };
  }

  // Roll rarity
  const roll = Math.random();
  let rarity: RewardRarity = 'Common';
  if (roll < box.rates.Legendary) {
    rarity = 'Legendary';
  } else if (roll < box.rates.Legendary + box.rates.Rare) {
    rarity = 'Rare';
  }

  // Pick item
  const pool = REWARD_ITEMS[rarity];
  const def = pool[Math.floor(Math.random() * pool.length)];

  // Currency amount
  let amount: number | undefined;
  if (def.currency && def.min !== undefined && def.max !== undefined) {
    const raw = def.min + Math.random() * (def.max - def.min);
    amount = def.decimals ? parseFloat(raw.toFixed(def.decimals)) : Math.floor(raw);
  }

  return {
    name: def.currency && amount !== undefined ? `${amount} ${def.name}` : def.name,
    icon: def.icon,
    rarity,
    description: def.description,
    currency: def.currency,
    amount,
  };
}

// ==========================================
// Rarity helpers
// ==========================================

function rarityColor(r: RewardRarity) {
  return r === 'Legendary' ? '#fbbf24' : r === 'Rare' ? '#38bdf8' : '#9ca3af';
}

function rarityGlow(r: RewardRarity) {
  return r === 'Legendary'
    ? '0 0 30px rgba(251,191,36,0.6), 0 0 60px rgba(251,191,36,0.3)'
    : r === 'Rare'
      ? '0 0 20px rgba(56,189,248,0.5), 0 0 40px rgba(56,189,248,0.2)'
      : '0 0 12px rgba(156,163,175,0.3)';
}

// ==========================================
// Component Props
// ==========================================

interface GachaPanelProps {
  playerGems: number;
  onSpendGems: (amount: number) => void;
  onAddReward: (result: GachaResult) => void;
}

// ==========================================
// GachaPanel Component
// ==========================================

export default function GachaPanel({ playerGems, onSpendGems, onAddReward }: GachaPanelProps) {
  const [selectedBox, setSelectedBox] = useState<GachaBox>(GACHA_BOXES[0]);
  const [isOpening, setIsOpening] = useState(false);
  const [openPhase, setOpenPhase] = useState<'idle' | 'shake' | 'burst' | 'reveal'>('idle');
  const [result, setResult] = useState<GachaResult | null>(null);
  const [history, setHistory] = useState<GachaResult[]>([]);
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; delay: number }[]>([]);

  // Generate sparkles for reveal
  useEffect(() => {
    if (openPhase === 'reveal' && result) {
      const newSparkles = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: 50 + (Math.random() - 0.5) * 60,
        y: 50 + (Math.random() - 0.5) * 60,
        delay: Math.random() * 0.5,
      }));
      setSparkles(newSparkles);
    }
  }, [openPhase, result]);

  const handleOpen = useCallback(() => {
    if (isOpening || playerGems < selectedBox.costGems) return;

    setIsOpening(true);
    setResult(null);
    onSpendGems(selectedBox.costGems);

    // Roll result
    const rolled = rollGacha(selectedBox);

    // Phase 1: Shake (1s)
    setOpenPhase('shake');

    // Phase 2: Burst (0.6s)
    setTimeout(() => setOpenPhase('burst'), 1000);

    // Phase 3: Reveal (show result)
    setTimeout(() => {
      setResult(rolled);
      setOpenPhase('reveal');
      setHistory((prev) => [rolled, ...prev].slice(0, 20));
      onAddReward(rolled);
    }, 1600);

    // Reset
    setTimeout(() => {
      setIsOpening(false);
    }, 1800);
  }, [isOpening, playerGems, selectedBox, onSpendGems, onAddReward]);

  const handleClose = useCallback(() => {
    setOpenPhase('idle');
    setResult(null);
  }, []);

  const canAfford = playerGems >= selectedBox.costGems;

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300">
          🎰 Lucky Gacha
        </h2>
        <p className="text-sm text-slate-400">
          Open mystery boxes to win amazing rewards! 💎 Gems only
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/15 border border-purple-400/30 text-sm">
          <span className="text-lg">💎</span>
          <span className="font-bold text-purple-300">{playerGems.toLocaleString()}</span>
          <span className="text-slate-400 text-xs">Gems Available</span>
        </div>
      </div>

      {/* Box Selection */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {GACHA_BOXES.map((box) => {
          const isSelected = selectedBox.id === box.id;
          const affordable = playerGems >= box.costGems;
          return (
            <button
              key={box.id}
              onClick={() => { if (!isOpening) setSelectedBox(box); }}
              disabled={isOpening}
              className={`relative rounded-2xl p-4 sm:p-5 transition-all duration-300 cursor-pointer group
                ${isSelected ? 'scale-[1.04]' : 'hover:scale-[1.02]'}
                ${!affordable ? 'opacity-50' : ''}`}
              style={{
                background: isSelected
                  ? `linear-gradient(135deg, ${box.gradientFrom}18, ${box.gradientTo}12)`
                  : 'linear-gradient(135deg, rgba(7,47,62,0.85), rgba(8,96,95,0.6))',
                border: `2px solid ${isSelected ? box.borderColor : 'rgba(125,211,252,0.15)'}`,
                boxShadow: isSelected ? `0 0 30px ${box.glowColor}, inset 0 0 20px ${box.glowColor}` : 'none',
              }}
            >
              {/* Cute floating icon */}
              <div
                className="text-5xl sm:text-6xl mb-3 transition-transform duration-500"
                style={{
                  animation: isSelected ? 'gacha-float 2s ease-in-out infinite' : 'none',
                  filter: isSelected ? `drop-shadow(0 4px 12px ${box.glowColor})` : 'none',
                }}
              >
                {box.icon}
              </div>

              {/* Name */}
              <h3
                className="text-sm sm:text-base font-black mb-1"
                style={{ color: box.color }}
              >
                {box.name}
              </h3>

              {/* Cost */}
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <span className="text-base">💎</span>
                <span className="text-lg font-black text-purple-300">{box.costGems}</span>
              </div>

              {/* Description */}
              <p className="text-[10px] text-slate-400 leading-relaxed">{box.description}</p>

              {/* Drop rates mini-bar */}
              <div className="mt-3 space-y-1">
                {(['Common', 'Rare', 'Legendary'] as RewardRarity[]).map((r) => (
                  <div key={r} className="flex items-center gap-1.5">
                    <span className="text-[9px] w-14 text-right font-semibold" style={{ color: rarityColor(r) }}>
                      {r}
                    </span>
                    <div className="flex-1 h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${box.rates[r] * 100}%`,
                          background: rarityColor(r),
                          opacity: 0.7,
                        }}
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 w-8 font-mono">
                      {Math.round(box.rates[r] * 100)}%
                    </span>
                  </div>
                ))}
                {/* Gun chance */}
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[9px] w-14 text-right font-semibold text-rose-400">🔫 Gun</span>
                  <div className="flex-1 h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${box.gunChance * 100}%`,
                        background: 'linear-gradient(90deg, #fb7185, #f43f5e)',
                        opacity: 0.7,
                      }}
                    />
                  </div>
                  <span className="text-[9px] text-slate-500 w-8 font-mono">
                    {Math.round(box.gunChance * 100)}%
                  </span>
                </div>
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <div
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                  style={{
                    background: `linear-gradient(135deg, ${box.gradientFrom}, ${box.gradientTo})`,
                    boxShadow: `0 2px 8px ${box.glowColor}`,
                  }}
                >
                  ✓
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Open Button + Animation Area */}
      <div className="relative">
        <div
          className="rounded-2xl p-8 sm:p-10 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(7,47,62,0.9), rgba(8,96,95,0.7))',
            border: `2px solid ${selectedBox.borderColor}`,
            boxShadow: `0 0 40px ${selectedBox.glowColor}`,
            minHeight: '280px',
          }}
        >
          {/* Background sparkle particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  left: `${15 + i * 14}%`,
                  top: `${20 + (i % 3) * 25}%`,
                  background: selectedBox.color,
                  opacity: 0.3,
                  animation: `gacha-sparkle ${1.5 + i * 0.3}s ease-in-out infinite ${i * 0.2}s`,
                }}
              />
            ))}
          </div>

          {/* Idle / Shake / Burst phase */}
          {openPhase !== 'reveal' && (
            <div className="relative z-10">
              {/* Big box icon */}
              <div
                className="text-7xl sm:text-8xl mb-6 inline-block"
                style={{
                  animation:
                    openPhase === 'shake'
                      ? 'gacha-shake 0.15s ease-in-out infinite'
                      : openPhase === 'burst'
                        ? 'gacha-burst 0.6s ease-out forwards'
                        : 'gacha-float 3s ease-in-out infinite',
                  filter: `drop-shadow(0 8px 24px ${selectedBox.glowColor})`,
                }}
              >
                {openPhase === 'burst' ? '✨' : selectedBox.icon}
              </div>

              {/* Selected box info */}
              <h3 className="text-xl font-black mb-1" style={{ color: selectedBox.color }}>
                {selectedBox.name}
              </h3>
              <p className="text-xs text-slate-400 mb-6">{selectedBox.description}</p>

              {/* Open button */}
              <button
                onClick={handleOpen}
                disabled={isOpening || !canAfford}
                className={`
                  relative px-10 py-4 rounded-2xl text-lg font-black uppercase tracking-wider
                  transition-all duration-300 cursor-pointer
                  flex items-center gap-3 mx-auto
                  ${canAfford && !isOpening ? 'hover:scale-110 active:scale-95' : 'opacity-40 cursor-not-allowed'}
                `}
                style={{
                  background: canAfford
                    ? `linear-gradient(135deg, ${selectedBox.gradientFrom}, #a855f7, ${selectedBox.gradientTo})`
                    : 'linear-gradient(135deg, #475569, #334155)',
                  boxShadow: canAfford
                    ? `0 8px 28px ${selectedBox.glowColor}, 0 0 40px rgba(168,85,247,0.3), inset 0 1px 0 rgba(255,255,255,0.3)`
                    : 'none',
                  border: '2px solid rgba(255,255,255,0.4)',
                  textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                }}
              >
                <span className="text-2xl">{isOpening ? '⏳' : '🎰'}</span>
                <span className="text-white">{isOpening ? 'OPENING...' : 'OPEN BOX'}</span>
                <span className="flex items-center gap-1 text-sm text-purple-200">
                  💎{selectedBox.costGems}
                </span>
              </button>

              {!canAfford && (
                <p className="text-xs text-red-400 mt-3">
                  Not enough gems! Need {selectedBox.costGems - playerGems} more 💎
                </p>
              )}
            </div>
          )}

          {/* Reveal Phase */}
          {openPhase === 'reveal' && result && (
            <div className="relative z-10 animate-skin-picker-enter">
              {/* Sparkle effects */}
              {sparkles.map((s) => (
                <div
                  key={s.id}
                  className="absolute w-2 h-2 rounded-full pointer-events-none"
                  style={{
                    left: `${s.x}%`,
                    top: `${s.y}%`,
                    background: rarityColor(result.rarity),
                    animation: `gacha-sparkle 1s ease-in-out infinite ${s.delay}s`,
                  }}
                />
              ))}

              {/* Rarity label */}
              <div
                className="inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4"
                style={{
                  color: rarityColor(result.rarity),
                  background: `${rarityColor(result.rarity)}15`,
                  border: `1px solid ${rarityColor(result.rarity)}40`,
                  boxShadow: rarityGlow(result.rarity),
                }}
              >
                ★ {result.rarity} ★
              </div>

              {/* Result icon */}
              <div
                className="text-6xl sm:text-7xl mb-4 inline-block"
                style={{
                  filter: `drop-shadow(${rarityGlow(result.rarity)})`,
                  animation: 'gacha-reveal-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                }}
              >
                {result.icon}
              </div>

              {/* Item name */}
              <h3
                className="text-xl sm:text-2xl font-black mb-2"
                style={{ color: rarityColor(result.rarity) }}
              >
                {result.name}
              </h3>
              <p className="text-xs text-slate-400 mb-1">{result.description}</p>

              {result.isGun && (
                <span className="inline-block text-[10px] px-3 py-1 rounded-full bg-rose-500/15 border border-rose-400/30 text-rose-300 font-bold mt-1">
                  🔫 NFT Weapon
                </span>
              )}

              {/* Actions */}
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={handleClose}
                  className="px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
                  style={{
                    background: 'rgba(8,47,73,0.6)',
                    border: '1px solid rgba(125,211,252,0.3)',
                    color: '#bae6fd',
                  }}
                >
                  OK
                </button>
                <button
                  onClick={() => {
                    handleClose();
                    setTimeout(handleOpen, 200);
                  }}
                  disabled={playerGems < selectedBox.costGems}
                  className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer
                    ${playerGems >= selectedBox.costGems ? 'hover:scale-105 active:scale-95' : 'opacity-40 cursor-not-allowed'}`}
                  style={{
                    background: `linear-gradient(135deg, ${selectedBox.gradientFrom}80, #a855f780)`,
                    border: `1px solid ${selectedBox.borderColor}`,
                    color: '#fff',
                  }}
                >
                  🔄 Open Again 💎{selectedBox.costGems}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider text-center">
            📜 Recent Pulls
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2">
            {history.slice(0, 10).map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-xl p-2.5 transition-all duration-200 hover:scale-[1.03]"
                style={{
                  background: `${rarityColor(item.rarity)}08`,
                  border: `1px solid ${rarityColor(item.rarity)}25`,
                }}
              >
                <span className="text-lg">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold text-white truncate">{item.name}</div>
                  <div className="text-[9px] font-semibold uppercase" style={{ color: rarityColor(item.rarity) }}>
                    {item.rarity}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
