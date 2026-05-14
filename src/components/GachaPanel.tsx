'use client';

import React, { useState, useCallback } from 'react';
import ScratchCard from './ScratchCard';
import {
  RewardRarity,
  GUN_SKINS,
  AVAILABLE_CARDS,
  MARKETPLACE_ITEMS,
  GunSkin,
  BoostCard,
} from '@/lib/gameTypes';

// ==========================================
// Gacha Box Tiers
// ==========================================

interface GachaBox {
  id: string;
  name: string;
  costGems: number;
  image: string;
  color: string;
  glow: string;
  bgGradient: string;
  label: string;
}

const GACHA_BOXES: GachaBox[] = [
  {
    id: 'bronze',
    name: 'Bronze Box',
    costGems: 3,
    image: '/gacha/bronze.png',
    color: '#cd7f32',
    glow: 'rgba(205,127,50,0.45)',
    bgGradient: 'linear-gradient(135deg, #8b5e3c22, #cd7f3215)',
    label: 'Common+ Rewards',
  },
  {
    id: 'silver',
    name: 'Silver Box',
    costGems: 8,
    image: '/gacha/silver.png',
    color: '#94a3b8',
    glow: 'rgba(148,163,184,0.5)',
    bgGradient: 'linear-gradient(135deg, #64748b22, #94a3b815)',
    label: 'Rare Chance ↑',
  },
  {
    id: 'gold',
    name: 'Gold Box',
    costGems: 20,
    image: '/gacha/gold.png',
    color: '#fbbf24',
    glow: 'rgba(251,191,36,0.5)',
    bgGradient: 'linear-gradient(135deg, #d9770622, #fbbf2418)',
    label: '✨ Legendary!',
  },
];

// ==========================================
// Reward Pool & Roll Logic
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
  isCard?: boolean;
  card?: BoostCard;
}

// Rarity drop rates by box tier
const RATES: Record<string, Record<RewardRarity, number>> = {
  bronze: { Common: 0.70, Rare: 0.25, Legendary: 0.05 },
  silver: { Common: 0.40, Rare: 0.42, Legendary: 0.18 },
  gold:   { Common: 0.15, Rare: 0.40, Legendary: 0.45 },
};

// Item pool (non-currency)
interface ItemDef { name: string; icon: string; description: string; rarity: RewardRarity; }

const ITEM_POOL: ItemDef[] = [
  // Common
  { name: 'HP Potion', icon: '🧪', description: 'Restores energy', rarity: 'Common' },
  { name: 'Bronze Shard', icon: '🔶', description: 'A common crafting material', rarity: 'Common' },
  { name: 'Coin Pouch', icon: '👝', description: 'A small bag of coins', rarity: 'Common' },
  { name: 'Lucky Clover', icon: '🍀', description: 'Slight luck boost', rarity: 'Common' },
  // Rare
  { name: 'Dark Bat', icon: '🦇', description: 'A rare pet companion', rarity: 'Rare' },
  { name: 'Silver Shard', icon: '⬜', description: 'A rare crafting material', rarity: 'Rare' },
  { name: 'Energy Crystal', icon: '🔮', description: 'Restores 50 energy', rarity: 'Rare' },
  { name: 'XP Boost ×2', icon: '✨', description: 'Double XP for 10 pops', rarity: 'Rare' },
  // Legendary
  { name: 'Angel Cat', icon: '😺', description: 'A legendary pet!', rarity: 'Legendary' },
  { name: 'Gold NFT', icon: '🏆', description: 'A golden NFT collectible', rarity: 'Legendary' },
  { name: 'Mystery Box', icon: '🎁', description: 'Contains a random legendary!', rarity: 'Legendary' },
  { name: 'Coin Magnet', icon: '🧲', description: 'Auto-collect double coins', rarity: 'Legendary' },
];

function rollGacha(boxId: string): GachaResult {
  const rates = RATES[boxId] || RATES.bronze;

  // Step 1: Roll rarity
  const roll = Math.random();
  let rarity: RewardRarity = 'Common';
  if (roll < rates.Legendary) {
    rarity = 'Legendary';
  } else if (roll < rates.Legendary + rates.Rare) {
    rarity = 'Rare';
  }

  // Step 2: Decide category (40% currency, 20% gun, 15% card, 25% item)
  const catRoll = Math.random();

  // Currency (40%)
  if (catRoll < 0.40) {
    const currRoll = Math.random();
    if (currRoll < 0.35) {
      // Gold Coins 10-1000
      const amt = Math.floor(10 + Math.random() * 990);
      return { name: `${amt} Gold`, icon: '🪙', rarity, description: 'Gold coins!', currency: 'coins', amount: amt };
    } else if (currRoll < 0.60) {
      // Gems 1-3
      const amt = Math.floor(1 + Math.random() * 3);
      return { name: `${amt} Gems`, icon: '💎', rarity, description: 'Blue gems!', currency: 'gems', amount: amt };
    } else if (currRoll < 0.85) {
      // USDT 1-100
      const amt = parseFloat((1 + Math.random() * 99).toFixed(2));
      return { name: `${amt} USDT`, icon: '💵', rarity, description: 'Crypto reward!', currency: 'usdt', amount: amt };
    } else {
      // BTC 0.000005-0.001
      const amt = parseFloat((0.000005 + Math.random() * 0.000995).toFixed(6));
      return { name: `${amt} BTC`, icon: '₿', rarity, description: 'Bitcoin!', currency: 'btc', amount: amt };
    }
  }

  // Gun (20%)
  if (catRoll < 0.60) {
    const gunsOfRarity = GUN_SKINS.filter((g) => g.rarity === rarity);
    if (gunsOfRarity.length > 0) {
      const gun = gunsOfRarity[Math.floor(Math.random() * gunsOfRarity.length)];
      return {
        name: gun.name, icon: '🔫', rarity: gun.rarity,
        description: `DMG ${gun.dmg} • CD ${gun.cooldownSec}s`,
        isGun: true, gunSkin: gun,
      };
    }
  }

  // Card (15%)
  if (catRoll < 0.75) {
    const cardsOfRarity = AVAILABLE_CARDS.filter((c) => c.rarity === rarity);
    if (cardsOfRarity.length > 0) {
      const card = cardsOfRarity[Math.floor(Math.random() * cardsOfRarity.length)];
      return {
        name: card.name, icon: card.icon, rarity: card.rarity,
        description: card.description, isCard: true, card,
      };
    }
  }

  // Items (25% + fallback)
  const itemsOfRarity = ITEM_POOL.filter((i) => i.rarity === rarity);
  const pool = itemsOfRarity.length > 0 ? itemsOfRarity : ITEM_POOL.filter((i) => i.rarity === 'Common');
  const item = pool[Math.floor(Math.random() * pool.length)];
  return { name: item.name, icon: item.icon, rarity: item.rarity, description: item.description };
}

// ==========================================
// Helpers
// ==========================================

const RC = (r: RewardRarity) => r === 'Legendary' ? '#fbbf24' : r === 'Rare' ? '#38bdf8' : '#9ca3af';
const RG = (r: RewardRarity) =>
  r === 'Legendary' ? '0 0 40px rgba(251,191,36,0.7)' :
  r === 'Rare' ? '0 0 25px rgba(56,189,248,0.5)' : '0 0 12px rgba(156,163,175,0.3)';

// ==========================================
// Props
// ==========================================

interface GachaPanelProps {
  playerGems: number;
  onSpendGems: (amount: number) => void;
  onAddReward: (result: GachaResult) => void;
}

// ==========================================
// Component
// ==========================================

export default function GachaPanel({ playerGems, onSpendGems, onAddReward }: GachaPanelProps) {
  const [mode, setMode] = useState<'box' | 'scratch'>('box');
  const [selectedBox, setSelectedBox] = useState<GachaBox>(GACHA_BOXES[1]);
  const [phase, setPhase] = useState<'idle' | 'shake' | 'burst' | 'reveal'>('idle');
  const [result, setResult] = useState<GachaResult | null>(null);
  const [history, setHistory] = useState<GachaResult[]>([]);
  const [isOpening, setIsOpening] = useState(false);

  const canAfford = playerGems >= selectedBox.costGems;

  const handleOpen = useCallback(() => {
    if (isOpening || !canAfford) return;
    setIsOpening(true);
    setResult(null);
    onSpendGems(selectedBox.costGems);

    const rolled = rollGacha(selectedBox.id);

    setPhase('shake');
    setTimeout(() => setPhase('burst'), 900);
    setTimeout(() => {
      setResult(rolled);
      setPhase('reveal');
      setHistory((prev) => [rolled, ...prev].slice(0, 20));
      onAddReward(rolled);
    }, 1400);
    setTimeout(() => setIsOpening(false), 1500);
  }, [isOpening, canAfford, selectedBox, onSpendGems, onAddReward]);

  const dismiss = useCallback(() => {
    setPhase('idle');
    setResult(null);
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-8">

      {/* ====== HEADER ====== */}
      <div className="text-center space-y-3">
        <h2
          className="text-4xl sm:text-5xl font-black"
          style={{
            background: 'linear-gradient(135deg, #f9a8d4, #c084fc, #67e8f9)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 2px 8px rgba(192,132,252,0.4))',
          }}
        >
          🎰 Lucky Gacha
        </h2>
        <p className="text-sm text-cyan-100/60">
          เปิดกล่องสุ่มลุ้นรางวัลสุดพิเศษ! ใช้ 💎 เพชรเท่านั้น
        </p>
        {/* Gem balance pill */}
        <div
          className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(168,85,247,0.1))',
            border: '1px solid rgba(168,85,247,0.4)',
            boxShadow: '0 0 20px rgba(168,85,247,0.15)',
          }}
        >
          <span className="text-xl">💎</span>
          <span className="font-black text-lg text-purple-200">{playerGems.toLocaleString()}</span>
        </div>
      </div>

      {/* ====== MODE TOGGLE ====== */}
      <div className="flex items-center justify-center">
        <div
          className="inline-flex rounded-xl overflow-hidden"
          style={{
            background: 'rgba(7,35,51,0.7)',
            border: '1px solid rgba(125,211,252,0.2)',
          }}
        >
          {[
            { id: 'box' as const, icon: '🎁', label: 'เปิดกล่อง' },
            { id: 'scratch' as const, icon: '🎫', label: 'ขูดการ์ด' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className="px-6 sm:px-8 py-3 text-sm font-bold transition-all duration-300 cursor-pointer flex items-center gap-2"
              style={{
                background: mode === m.id
                  ? 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(236,72,153,0.2))'
                  : 'transparent',
                color: mode === m.id ? '#e9d5ff' : '#94a3b8',
                borderBottom: mode === m.id ? '2px solid #a855f7' : '2px solid transparent',
              }}
            >
              <span className="text-lg">{m.icon}</span>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* ====== SCRATCH MODE ====== */}
      {mode === 'scratch' ? (
        <ScratchCard
          playerGems={playerGems}
          onSpendGems={onSpendGems}
          onAddReward={(r: any) => {
            setHistory((prev) => [r, ...prev].slice(0, 20));
            onAddReward(r);
          }}
        />
      ) : (
      <>

      {/* ====== BOX SELECTOR ====== */}
      <div className="grid grid-cols-3 gap-3 sm:gap-5">
        {GACHA_BOXES.map((box) => {
          const active = selectedBox.id === box.id;
          return (
            <button
              key={box.id}
              onClick={() => { if (!isOpening) setSelectedBox(box); }}
              disabled={isOpening}
              className="relative rounded-2xl p-3 sm:p-5 transition-all duration-300 cursor-pointer group text-center"
              style={{
                background: active ? box.bgGradient : 'rgba(7,47,62,0.6)',
                border: `2px solid ${active ? box.color + '60' : 'rgba(125,211,252,0.12)'}`,
                boxShadow: active ? `0 0 35px ${box.glow}, inset 0 0 25px ${box.glow}` : 'none',
                transform: active ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              {/* Box image */}
              <div className="relative mx-auto w-20 h-20 sm:w-28 sm:h-28 mb-3">
                <img
                  src={box.image}
                  alt={box.name}
                  className="w-full h-full object-contain transition-transform duration-500"
                  style={{
                    animation: active ? 'gacha-float 2.5s ease-in-out infinite' : 'none',
                    filter: active ? `drop-shadow(0 6px 16px ${box.glow})` : 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))',
                  }}
                />
                {/* Sparkle dots around active box */}
                {active && (
                  <>
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="absolute w-1.5 h-1.5 rounded-full"
                        style={{
                          background: box.color,
                          top: `${10 + i * 20}%`,
                          left: i % 2 === 0 ? '-8%' : '100%',
                          animation: `gacha-sparkle ${1 + i * 0.3}s ease-in-out infinite ${i * 0.2}s`,
                        }}
                      />
                    ))}
                  </>
                )}
              </div>

              {/* Name */}
              <h3 className="text-sm sm:text-base font-black mb-1" style={{ color: box.color }}>
                {box.name}
              </h3>

              {/* Cost */}
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-sm">💎</span>
                <span className="text-base sm:text-lg font-black text-purple-200">{box.costGems}</span>
              </div>

              {/* Label */}
              <div
                className="mt-2 text-[10px] font-bold px-2 py-1 rounded-full inline-block"
                style={{
                  color: box.color,
                  background: `${box.color}12`,
                  border: `1px solid ${box.color}25`,
                }}
              >
                {box.label}
              </div>

              {/* Check mark */}
              {active && (
                <div
                  className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                  style={{
                    background: `linear-gradient(135deg, ${box.color}, ${box.color}cc)`,
                    boxShadow: `0 2px 10px ${box.glow}`,
                  }}
                >
                  ✓
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ====== OPENING AREA ====== */}
      <div
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(7,35,51,0.95), rgba(10,70,80,0.85))',
          border: `2px solid ${selectedBox.color}30`,
          boxShadow: `0 0 50px ${selectedBox.glow}, inset 0 0 30px rgba(0,0,0,0.3)`,
          minHeight: '320px',
        }}
      >
        {/* Subtle bg particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: 3 + (i % 3) * 2,
                height: 3 + (i % 3) * 2,
                left: `${8 + i * 12}%`,
                top: `${15 + (i % 4) * 20}%`,
                background: selectedBox.color,
                opacity: 0.15,
                animation: `gacha-sparkle ${2 + i * 0.4}s ease-in-out infinite ${i * 0.3}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center p-8 sm:p-10" style={{ minHeight: '320px' }}>

          {/* === IDLE & SHAKE PHASE === */}
          {(phase === 'idle' || phase === 'shake') && (
            <>
              {/* Big box image */}
              <div className="relative mb-6">
                <img
                  src={selectedBox.image}
                  alt={selectedBox.name}
                  className="w-32 h-32 sm:w-40 sm:h-40 object-contain"
                  style={{
                    animation:
                      phase === 'shake'
                        ? 'gacha-shake 0.1s ease-in-out infinite'
                        : 'gacha-float 3s ease-in-out infinite',
                    filter: `drop-shadow(0 10px 30px ${selectedBox.glow})`,
                  }}
                />
                {/* Glow ring during shake */}
                {phase === 'shake' && (
                  <div
                    className="absolute inset-0 rounded-full animate-pulse"
                    style={{
                      background: `radial-gradient(circle, ${selectedBox.color}30, transparent 70%)`,
                      transform: 'scale(1.5)',
                    }}
                  />
                )}
              </div>

              {/* Open button */}
              <button
                onClick={handleOpen}
                disabled={isOpening || !canAfford}
                className={`
                  relative px-10 sm:px-14 py-4 sm:py-5 rounded-2xl text-base sm:text-lg font-black uppercase tracking-wider
                  transition-all duration-300 cursor-pointer flex items-center gap-3
                  ${canAfford && !isOpening ? 'hover:scale-110 active:scale-95' : 'opacity-35 cursor-not-allowed'}
                `}
                style={{
                  background: canAfford
                    ? `linear-gradient(135deg, ${selectedBox.color}, #a855f7, #ec4899)`
                    : 'linear-gradient(135deg, #334155, #1e293b)',
                  boxShadow: canAfford
                    ? `0 8px 30px ${selectedBox.glow}, 0 0 50px rgba(168,85,247,0.25), inset 0 1px 0 rgba(255,255,255,0.25)`
                    : 'none',
                  border: '2px solid rgba(255,255,255,0.3)',
                  textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                }}
              >
                <span className="text-2xl">{isOpening ? '✨' : '🎰'}</span>
                <span className="text-white">{isOpening ? 'Opening...' : 'OPEN!'}</span>
                <span className="text-sm text-purple-200 flex items-center gap-1">💎 {selectedBox.costGems}</span>
              </button>

              {!canAfford && (
                <p className="text-xs text-rose-400/80 mt-3 flex items-center gap-1">
                  💎 เพชรไม่พอ! ต้องการอีก {selectedBox.costGems - playerGems}
                </p>
              )}
            </>
          )}

          {/* === BURST PHASE === */}
          {phase === 'burst' && (
            <div className="flex items-center justify-center" style={{ minHeight: '200px' }}>
              <div
                className="text-8xl"
                style={{ animation: 'gacha-burst 0.6s ease-out forwards' }}
              >
                ✨
              </div>
            </div>
          )}

          {/* === REVEAL PHASE === */}
          {phase === 'reveal' && result && (
            <div className="text-center animate-skin-picker-enter">
              {/* Rarity badge */}
              <div
                className="inline-block px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4"
                style={{
                  color: RC(result.rarity),
                  background: `${RC(result.rarity)}15`,
                  border: `2px solid ${RC(result.rarity)}40`,
                  boxShadow: RG(result.rarity),
                }}
              >
                ★ {result.rarity} ★
              </div>

              {/* Icon */}
              <div
                className="text-7xl sm:text-8xl mb-4 inline-block"
                style={{
                  filter: `drop-shadow(${RG(result.rarity)})`,
                  animation: 'gacha-reveal-bounce 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards',
                }}
              >
                {result.icon}
              </div>

              {/* Name */}
              <h3
                className="text-2xl sm:text-3xl font-black mb-1"
                style={{ color: RC(result.rarity) }}
              >
                {result.name}
              </h3>
              <p className="text-xs text-slate-400 mb-2">{result.description}</p>

              {/* Tag if gun or card */}
              {result.isGun && (
                <span className="inline-block text-[10px] px-3 py-1 rounded-full bg-rose-500/15 border border-rose-400/30 text-rose-300 font-bold">
                  🔫 NFT Weapon
                </span>
              )}
              {result.isCard && (
                <span className="inline-block text-[10px] px-3 py-1 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 font-bold">
                  🃏 Boost Card
                </span>
              )}

              {/* Buttons */}
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={dismiss}
                  className="px-8 py-3 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
                  style={{
                    background: 'rgba(15,50,70,0.8)',
                    border: '1px solid rgba(125,211,252,0.3)',
                    color: '#bae6fd',
                  }}
                >
                  OK ✨
                </button>
                <button
                  onClick={() => { dismiss(); setTimeout(handleOpen, 200); }}
                  disabled={playerGems < selectedBox.costGems}
                  className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer
                    ${playerGems >= selectedBox.costGems ? 'hover:scale-105 active:scale-95' : 'opacity-35 cursor-not-allowed'}`}
                  style={{
                    background: `linear-gradient(135deg, ${selectedBox.color}90, #a855f780)`,
                    border: `1px solid ${selectedBox.color}50`,
                    color: '#fff',
                  }}
                >
                  🔄 อีกครั้ง! 💎{selectedBox.costGems}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ====== HISTORY ====== */}
      {history.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
            📜 ประวัติการสุ่ม
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2">
            {history.slice(0, 10).map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 rounded-xl p-2.5 transition-all hover:scale-[1.03]"
                style={{
                  background: `${RC(item.rarity)}08`,
                  border: `1px solid ${RC(item.rarity)}20`,
                }}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-white truncate">{item.name}</div>
                  <div className="text-[9px] font-bold uppercase" style={{ color: RC(item.rarity) }}>
                    {item.rarity}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      </> /* end box mode */
      )}
    </div>
  );
}
