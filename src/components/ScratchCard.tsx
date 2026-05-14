'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { RewardRarity, GUN_SKINS, AVAILABLE_CARDS } from '@/lib/gameTypes';

// ==========================================
// Scratch Card Symbols & Prizes
// ==========================================

interface ScratchSymbol {
  icon: string;
  label: string;
  color: string;
}

const SYMBOLS: ScratchSymbol[] = [
  { icon: '🪙', label: 'Gold', color: '#fbbf24' },
  { icon: '💎', label: 'Gems', color: '#38bdf8' },
  { icon: '💵', label: 'USDT', color: '#22c55e' },
  { icon: '₿', label: 'BTC', color: '#f97316' },
  { icon: '🔫', label: 'Gun', color: '#f43f5e' },
  { icon: '🃏', label: 'Card', color: '#a855f7' },
  { icon: '🎁', label: 'Item', color: '#ec4899' },
  { icon: '⭐', label: 'Jackpot', color: '#eab308' },
  { icon: '🍀', label: 'Lucky', color: '#10b981' },
];

// Card tiers
interface CardTier {
  id: string;
  name: string;
  costGems: number;
  color: string;
  glow: string;
  matchBonus: number; // multiplier for match prize
}

const CARD_TIERS: CardTier[] = [
  { id: 'bronze', name: 'Bronze Card', costGems: 2, color: '#cd7f32', glow: 'rgba(205,127,50,0.4)', matchBonus: 1 },
  { id: 'silver', name: 'Silver Card', costGems: 5, color: '#94a3b8', glow: 'rgba(148,163,184,0.45)', matchBonus: 2 },
  { id: 'gold', name: 'Gold Card', costGems: 15, color: '#fbbf24', glow: 'rgba(251,191,36,0.5)', matchBonus: 4 },
];

// Winning lines (row, col, diagonal indices)
const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8], // rows
  [0,3,6],[1,4,7],[2,5,8], // cols
  [0,4,8],[2,4,6],         // diagonals
];

// Generate a 3x3 grid with guaranteed match chance based on tier
function generateGrid(tierId: string): ScratchSymbol[] {
  const grid: ScratchSymbol[] = [];
  const matchChance = tierId === 'gold' ? 0.55 : tierId === 'silver' ? 0.35 : 0.20;

  if (Math.random() < matchChance) {
    // Force one winning line
    const line = WIN_LINES[Math.floor(Math.random() * WIN_LINES.length)];
    const winSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    // Fill grid randomly first
    for (let i = 0; i < 9; i++) {
      grid.push(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
    }
    // Place winning symbol on the line
    for (const idx of line) {
      grid[idx] = winSymbol;
    }
  } else {
    // Random grid (avoid accidental 3-match)
    for (let i = 0; i < 9; i++) {
      grid.push(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
    }
    // Break any accidental matches
    for (const line of WIN_LINES) {
      if (grid[line[0]].icon === grid[line[1]].icon && grid[line[1]].icon === grid[line[2]].icon) {
        const others = SYMBOLS.filter(s => s.icon !== grid[line[0]].icon);
        grid[line[2]] = others[Math.floor(Math.random() * others.length)];
      }
    }
  }
  return grid;
}

// Get prize for matching symbol
function getMatchPrize(symbol: ScratchSymbol, bonus: number): { name: string; icon: string; rarity: RewardRarity; description: string; currency?: string; amount?: number; isGun?: boolean; gunSkin?: any; isCard?: boolean } {
  switch (symbol.icon) {
    case '🪙': {
      const amt = Math.floor((50 + Math.random() * 450) * bonus);
      return { name: `${amt} Gold`, icon: '🪙', rarity: bonus >= 4 ? 'Legendary' : bonus >= 2 ? 'Rare' : 'Common', description: 'Gold coins!', currency: 'coins', amount: amt };
    }
    case '💎': {
      const amt = Math.floor((1 + Math.random() * 2) * bonus);
      return { name: `${amt} Gems`, icon: '💎', rarity: 'Rare', description: 'Blue gems!', currency: 'gems', amount: amt };
    }
    case '💵': {
      const amt = parseFloat(((5 + Math.random() * 45) * bonus).toFixed(2));
      return { name: `${amt} USDT`, icon: '💵', rarity: 'Rare', description: 'Crypto!', currency: 'usdt', amount: amt };
    }
    case '₿': {
      const amt = parseFloat(((0.00005 + Math.random() * 0.0005) * bonus).toFixed(6));
      return { name: `${amt} BTC`, icon: '₿', rarity: 'Legendary', description: 'Bitcoin!', currency: 'btc', amount: amt };
    }
    case '🔫': {
      const guns = GUN_SKINS.filter(g => bonus >= 4 ? true : bonus >= 2 ? g.rarity !== 'Legendary' : g.rarity === 'Common');
      const gun = guns[Math.floor(Math.random() * guns.length)];
      return { name: gun.name, icon: '🔫', rarity: gun.rarity, description: `DMG ${gun.dmg}`, isGun: true, gunSkin: gun };
    }
    case '🃏': {
      const cards = AVAILABLE_CARDS;
      const card = cards[Math.floor(Math.random() * cards.length)];
      return { name: card.name, icon: card.icon, rarity: card.rarity, description: card.description, isCard: true };
    }
    case '⭐': {
      const amt = Math.floor((200 + Math.random() * 800) * bonus);
      return { name: `⭐ JACKPOT ${amt} Gold!`, icon: '⭐', rarity: 'Legendary', description: 'JACKPOT!', currency: 'coins', amount: amt };
    }
    default: {
      const amt = Math.floor((20 + Math.random() * 80) * bonus);
      return { name: `${amt} Gold`, icon: '🪙', rarity: 'Common', description: 'Consolation prize', currency: 'coins', amount: amt };
    }
  }
}

// Consolation prize (no match)
function getConsolation(): { name: string; icon: string; rarity: RewardRarity; description: string; currency: string; amount: number } {
  const amt = 10 + Math.floor(Math.random() * 40);
  return { name: `${amt} Gold`, icon: '🪙', rarity: 'Common', description: 'ปลอบใจ~', currency: 'coins', amount: amt };
}

const RC = (r: RewardRarity) => r === 'Legendary' ? '#fbbf24' : r === 'Rare' ? '#38bdf8' : '#9ca3af';

// ==========================================
// Props
// ==========================================

interface ScratchCardProps {
  playerGems: number;
  onSpendGems: (n: number) => void;
  onAddReward: (result: any) => void;
}

// ==========================================
// Component
// ==========================================

export default function ScratchCard({ playerGems, onSpendGems, onAddReward }: ScratchCardProps) {
  const [tier, setTier] = useState<CardTier>(CARD_TIERS[1]);
  const [grid, setGrid] = useState<ScratchSymbol[] | null>(null);
  const [revealed, setRevealed] = useState<boolean[]>(Array(9).fill(false));
  const [winLine, setWinLine] = useState<number[] | null>(null);
  const [prize, setPrize] = useState<any>(null);
  const [phase, setPhase] = useState<'buy' | 'scratch' | 'result'>('buy');

  const allRevealed = revealed.every(Boolean);

  // Check for matches when all revealed
  const checkMatches = useCallback((g: ScratchSymbol[]) => {
    for (const line of WIN_LINES) {
      if (g[line[0]].icon === g[line[1]].icon && g[line[1]].icon === g[line[2]].icon) {
        setWinLine(line);
        const p = getMatchPrize(g[line[0]], tier.matchBonus);
        setPrize(p);
        onAddReward(p);
        setTimeout(() => setPhase('result'), 600);
        return;
      }
    }
    // No match — consolation
    setWinLine(null);
    const c = getConsolation();
    setPrize(c);
    onAddReward(c);
    setTimeout(() => setPhase('result'), 600);
  }, [tier, onAddReward]);

  const handleBuy = useCallback(() => {
    if (playerGems < tier.costGems) return;
    onSpendGems(tier.costGems);
    const g = generateGrid(tier.id);
    setGrid(g);
    setRevealed(Array(9).fill(false));
    setWinLine(null);
    setPrize(null);
    setPhase('scratch');
  }, [playerGems, tier, onSpendGems]);

  const handleScratch = useCallback((idx: number) => {
    if (phase !== 'scratch' || revealed[idx]) return;
    const newRevealed = [...revealed];
    newRevealed[idx] = true;
    setRevealed(newRevealed);

    // Check if all revealed
    if (newRevealed.every(Boolean) && grid) {
      checkMatches(grid);
    }
  }, [phase, revealed, grid, checkMatches]);

  const handleReset = useCallback(() => {
    setPhase('buy');
    setGrid(null);
    setPrize(null);
    setWinLine(null);
  }, []);

  const canAfford = playerGems >= tier.costGems;

  return (
    <div className="space-y-6">

      {/* Tier selector */}
      {phase === 'buy' && (
        <div className="grid grid-cols-3 gap-3">
          {CARD_TIERS.map((t) => {
            const active = tier.id === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTier(t)}
                className="rounded-xl p-3 sm:p-4 text-center transition-all duration-300 cursor-pointer"
                style={{
                  background: active ? `${t.color}15` : 'rgba(7,47,62,0.6)',
                  border: `2px solid ${active ? t.color + '50' : 'rgba(125,211,252,0.12)'}`,
                  boxShadow: active ? `0 0 25px ${t.glow}` : 'none',
                  transform: active ? 'scale(1.04)' : 'scale(1)',
                }}
              >
                <div className="text-3xl mb-2">🎫</div>
                <div className="text-sm font-black" style={{ color: t.color }}>{t.name}</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <span className="text-xs">💎</span>
                  <span className="text-base font-black text-purple-200">{t.costGems}</span>
                </div>
                <div className="text-[9px] text-slate-400 mt-1">
                  {t.id === 'gold' ? 'Match ×4 โบนัส!' : t.id === 'silver' ? 'Match ×2 โบนัส' : 'แม่นยำ!'}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Main area */}
      <div
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(7,35,51,0.95), rgba(10,70,80,0.85))',
          border: `2px solid ${tier.color}30`,
          boxShadow: `0 0 40px ${tier.glow}`,
          minHeight: phase === 'buy' ? '260px' : '380px',
        }}
      >
        <div className="relative z-10 flex flex-col items-center justify-center p-6 sm:p-8" style={{ minHeight: phase === 'buy' ? '260px' : '380px' }}>

          {/* BUY PHASE */}
          {phase === 'buy' && (
            <>
              <div className="text-6xl mb-4" style={{ animation: 'gacha-float 3s ease-in-out infinite', filter: `drop-shadow(0 6px 16px ${tier.glow})` }}>🎫</div>
              <h3 className="text-lg font-black mb-1" style={{ color: tier.color }}>{tier.name}</h3>
              <p className="text-xs text-slate-400 mb-1">ขูดช่อง 3×3 — ตรงกัน 3 ตัวเป็นแนว = ชนะ!</p>
              <p className="text-[10px] text-cyan-100/40 mb-5">โบนัสจับคู่: ×{tier.matchBonus}</p>
              <button
                onClick={handleBuy}
                disabled={!canAfford}
                className={`px-10 py-4 rounded-2xl text-base font-black uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-3
                  ${canAfford ? 'hover:scale-110 active:scale-95' : 'opacity-35 cursor-not-allowed'}`}
                style={{
                  background: canAfford ? `linear-gradient(135deg, ${tier.color}, #a855f7, #ec4899)` : '#334155',
                  boxShadow: canAfford ? `0 8px 30px ${tier.glow}` : 'none',
                  border: '2px solid rgba(255,255,255,0.3)',
                  textShadow: '0 2px 6px rgba(0,0,0,0.5)',
                }}
              >
                <span className="text-xl">🎫</span>
                <span className="text-white">ซื้อการ์ด</span>
                <span className="text-sm text-purple-200">💎{tier.costGems}</span>
              </button>
              {!canAfford && <p className="text-xs text-rose-400/80 mt-3">💎 เพชรไม่พอ!</p>}
            </>
          )}

          {/* SCRATCH PHASE */}
          {phase === 'scratch' && grid && (
            <>
              <p className="text-xs text-cyan-100/60 mb-4">แตะเพื่อขูดแต่ละช่อง! ตรง 3 แนว = ชนะ 🎉</p>
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-4">
                {grid.map((sym, i) => {
                  const isRevealed = revealed[i];
                  const isWin = winLine?.includes(i);
                  return (
                    <button
                      key={i}
                      onClick={() => handleScratch(i)}
                      disabled={isRevealed}
                      className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl transition-all duration-300 cursor-pointer overflow-hidden"
                      style={{
                        background: isRevealed
                          ? isWin
                            ? `radial-gradient(circle, ${sym.color}30, rgba(7,35,51,0.8))`
                            : 'rgba(7,35,51,0.7)'
                          : `linear-gradient(135deg, ${tier.color}60, ${tier.color}30)`,
                        border: isRevealed
                          ? isWin
                            ? `2px solid ${sym.color}80`
                            : '1px solid rgba(125,211,252,0.15)'
                          : `2px solid ${tier.color}40`,
                        boxShadow: isRevealed
                          ? isWin ? `0 0 20px ${sym.color}50` : 'none'
                          : `inset 0 2px 8px rgba(255,255,255,0.15), 0 4px 12px ${tier.glow}`,
                        transform: isRevealed ? 'scale(1)' : 'scale(1)',
                      }}
                    >
                      {isRevealed ? (
                        <div className="flex flex-col items-center justify-center h-full animate-skin-picker-enter">
                          <span className="text-3xl sm:text-4xl" style={{ filter: isWin ? `drop-shadow(0 0 8px ${sym.color})` : 'none' }}>
                            {sym.icon}
                          </span>
                          <span className="text-[8px] font-bold mt-0.5" style={{ color: sym.color }}>{sym.label}</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <span className="text-2xl sm:text-3xl opacity-60" style={{ animation: 'gacha-sparkle 2s ease-in-out infinite' }}>✨</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-500">เหลืออีก {revealed.filter(r => !r).length} ช่อง</p>
            </>
          )}

          {/* RESULT PHASE */}
          {phase === 'result' && prize && (
            <div className="text-center animate-skin-picker-enter">
              {winLine ? (
                <>
                  <div className="text-5xl mb-3" style={{ animation: 'gacha-reveal-bounce 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>🎉</div>
                  <div className="inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-3"
                    style={{ color: RC(prize.rarity), background: `${RC(prize.rarity)}15`, border: `2px solid ${RC(prize.rarity)}40` }}>
                    ★ {prize.rarity} MATCH! ★
                  </div>
                </>
              ) : (
                <div className="text-4xl mb-3">😊</div>
              )}
              <div className="text-5xl mb-3" style={{ filter: `drop-shadow(0 0 12px ${RC(prize.rarity)})` }}>{prize.icon}</div>
              <h3 className="text-xl sm:text-2xl font-black mb-1" style={{ color: RC(prize.rarity) }}>{prize.name}</h3>
              <p className="text-xs text-slate-400 mb-1">{prize.description}</p>
              {winLine && <p className="text-[10px] text-amber-300/70 mb-2">×{tier.matchBonus} Match Bonus!</p>}
              <div className="flex items-center justify-center gap-3 mt-5">
                <button onClick={handleReset}
                  className="px-7 py-3 rounded-xl text-sm font-bold cursor-pointer hover:scale-105 active:scale-95 transition-all"
                  style={{ background: 'rgba(15,50,70,0.8)', border: '1px solid rgba(125,211,252,0.3)', color: '#bae6fd' }}>
                  OK ✨
                </button>
                <button
                  onClick={() => { handleReset(); setTimeout(handleBuy, 200); }}
                  disabled={playerGems < tier.costGems}
                  className={`px-7 py-3 rounded-xl text-sm font-bold cursor-pointer transition-all ${playerGems >= tier.costGems ? 'hover:scale-105 active:scale-95' : 'opacity-35 cursor-not-allowed'}`}
                  style={{ background: `linear-gradient(135deg, ${tier.color}90, #a855f780)`, border: `1px solid ${tier.color}50`, color: '#fff' }}>
                  🔄 ขูดอีก! 💎{tier.costGems}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
