'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Ball as BallType,
  AmmoType,
  Reward,
  PlayerState,
  AMMO_TYPES,
  GRID_ROWS,
  GRID_COLS,
} from '@/lib/gameTypes';
import { generateGrid, applyDamage, rollReward } from '@/lib/gameUtils';
import TargetGrid from './TargetGrid';
import Shooter from './Shooter';
import AmmoSelector from './AmmoSelector';
import RewardDrop from './RewardDrop';
import RewardPanel from './RewardPanel';
import PlayerPanel from './PlayerPanel';
import SoundToggle, { playShootSound, playPopSound, playRewardSound, playClickSound } from './SoundManager';

const INITIAL_PLAYER: PlayerState = {
  energy: 100,
  maxEnergy: 100,
  coins: 12450,
  gems: 1250,
  level: 25,
  xp: 68,
  maxXp: 100,
};

const MAX_DURABILITY = 100;
const COOLDOWN_MS = 800; // 0.8 second cooldown between shots
const RANDOMIZE_COST = 500;

export default function GameBoard() {
  const [balls, setBalls] = useState<BallType[]>(() => generateGrid());
  const [selectedAmmo, setSelectedAmmo] = useState<AmmoType>(AMMO_TYPES[0]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [player, setPlayer] = useState<PlayerState>(INITIAL_PLAYER);
  const [isFiring, setIsFiring] = useState(false);
  const [activeReward, setActiveReward] = useState<Reward | null>(null);
  const [damageNumbers, setDamageNumbers] = useState<{ id: string; x: number; y: number; damage: number; color: string }[]>([]);

  // Gun status states
  const [durability, setDurability] = useState(MAX_DURABILITY);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalBalls = GRID_ROWS * GRID_COLS;
  const ballsRemaining = balls.filter((b) => !b.isPopping && b.hp > 0).length;

  // Energy regeneration
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayer((prev) => ({
        ...prev,
        energy: Math.min(prev.maxEnergy, prev.energy + 1),
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      cooldownRef.current = setInterval(() => {
        setCooldown((prev) => {
          const next = prev - 50;
          if (next <= 0) {
            if (cooldownRef.current) clearInterval(cooldownRef.current);
            return 0;
          }
          return next;
        });
      }, 50);
      return () => {
        if (cooldownRef.current) clearInterval(cooldownRef.current);
      };
    }
  }, [cooldown > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  // Clear hit animation
  useEffect(() => {
    const hitBalls = balls.filter((b) => b.isHit && !b.isPopping);
    if (hitBalls.length > 0) {
      const timer = setTimeout(() => {
        setBalls((prev) =>
          prev.map((b) => (b.isHit && !b.isPopping ? { ...b, isHit: false } : b))
        );
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [balls]);

  // Remove popped balls after animation
  useEffect(() => {
    const poppingBalls = balls.filter((b) => b.isPopping);
    if (poppingBalls.length > 0) {
      const timer = setTimeout(() => {
        setBalls((prev) => prev.filter((b) => !b.isPopping));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [balls]);

  // Reward stats
  const rewardStats = {
    common: rewards.filter((r) => r.rarity === 'Common').length,
    rare: rewards.filter((r) => r.rarity === 'Rare').length,
    legendary: rewards.filter((r) => r.rarity === 'Legendary').length,
    total: rewards.length,
  };

  const handleBallClick = useCallback(
    (ball: BallType) => {
      if (ball.isPopping || ball.hp <= 0) return;

      // Check cooldown
      if (cooldown > 0) return;

      // Check durability
      if (durability <= 0) return;

      // Check energy
      if (player.energy < selectedAmmo.energyCost) return;

      // Play shoot sound
      playShootSound();

      // Deduct energy
      if (selectedAmmo.energyCost > 0) {
        setPlayer((prev) => ({
          ...prev,
          energy: prev.energy - selectedAmmo.energyCost,
        }));
      }

      // Reduce durability
      const duraCost = selectedAmmo.id === 'basic' ? 1 : selectedAmmo.id === 'heavy' ? 3 : 5;
      setDurability((prev) => Math.max(0, prev - duraCost));

      // Start cooldown
      setCooldown(COOLDOWN_MS);

      // Fire animation
      setIsFiring(true);
      setTimeout(() => setIsFiring(false), 200);

      // Apply damage
      const updatedBall = applyDamage(ball, selectedAmmo.damage);

      // Show floating damage number
      const damageId = `dmg-${Date.now()}-${Math.random()}`;
      const ballElement = document.getElementById(`ball-wrapper-${ball.id}`);
      if (ballElement) {
        const rect = ballElement.getBoundingClientRect();
        setDamageNumbers((prev) => [
          ...prev,
          {
            id: damageId,
            x: rect.left + rect.width / 2,
            y: rect.top,
            damage: selectedAmmo.damage,
            color: selectedAmmo.color,
          },
        ]);
        setTimeout(() => {
          setDamageNumbers((prev) => prev.filter((d) => d.id !== damageId));
        }, 1000);
      }

      setBalls((prev) =>
        prev.map((b) => (b.id === ball.id ? updatedBall : b))
      );

      // Check if ball popped
      if (updatedBall.isPopping) {
        // Play pop sound
        playPopSound();

        // Roll reward
        const reward = rollReward(ball.tier);
        setRewards((prev) => [...prev, reward]);
        setActiveReward(reward);

        // Play reward sound
        setTimeout(() => {
          playRewardSound(reward.rarity === 'Legendary');
        }, 200);

        // Add coins/gems from reward
        setPlayer((prev) => {
          let newCoins = prev.coins;
          let newGems = prev.gems;
          let newXp = prev.xp;

          if (reward.name.includes('Coins') || reward.name.includes('USDT')) {
            const match = reward.name.match(/(\d+)/);
            if (match) newCoins += parseInt(match[1]);
          }
          if (reward.name.includes('Gem')) {
            const match = reward.name.match(/(\d+)/);
            if (match) newGems += parseInt(match[1]);
          }

          // XP for popping
          newXp += ball.tier * 5;

          return {
            ...prev,
            coins: newCoins,
            gems: newGems,
            xp: newXp > prev.maxXp ? newXp - prev.maxXp : newXp,
            level: newXp > prev.maxXp ? prev.level + 1 : prev.level,
          };
        });
      }
    },
    [selectedAmmo, player.energy, cooldown, durability]
  );

  const handleReset = useCallback(() => {
    // Check coin cost
    if (player.coins < RANDOMIZE_COST) return;

    playClickSound();

    setPlayer((prev) => ({
      ...prev,
      coins: prev.coins - RANDOMIZE_COST,
    }));
    setBalls(generateGrid());
    setRewards([]);
    setDurability(MAX_DURABILITY);
    setCooldown(0);
    setActiveReward(null);
  }, [player.coins]);

  const handleRewardComplete = useCallback(() => {
    setActiveReward(null);
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative z-10">
      {/* Header */}
      <header
        className="py-2 sm:py-3 px-4 sm:px-6 flex items-center justify-between border-b"
        style={{
          background: 'linear-gradient(90deg, rgba(15,23,42,0.95), rgba(30,41,59,0.9), rgba(15,23,42,0.95))',
          borderColor: 'rgba(99, 102, 241, 0.2)',
        }}
      >
        <div className="flex items-center gap-3">
          <h1 className="text-lg sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            💥 BUBBLE BLAST
          </h1>
          <span className="hidden sm:inline text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
            NFT
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-4 text-xs font-semibold text-slate-400">
          {['HOME', 'GAME', 'NFT', 'MARKETPLACE', 'TOP EARNING'].map((item, i) => (
            <button
              key={item}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                i === 1
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <SoundToggle />
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-xs">
            <span className="text-green-400">●</span>
            <span className="text-slate-300 font-mono">0x8F...7a3B</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-2 sm:p-4 lg:p-6 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[220px_1fr_260px] gap-3 sm:gap-4 lg:gap-6">
          {/* Left Panel - Player Info */}
          <aside className="hidden lg:block">
            <PlayerPanel
              player={player}
              ballsRemaining={ballsRemaining}
              totalBalls={totalBalls}
            />
          </aside>

          {/* Center - Game Board */}
          <div className="flex flex-col gap-3 sm:gap-4 min-h-0">
            {/* Title */}
            <div className="text-center">
              <h2
                className="text-base sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400"
                style={{
                  textShadow: '0 0 20px rgba(251, 191, 36, 0.3)',
                }}
              >
                ⭐ BUBBLE SHOOTER ⭐
              </h2>
            </div>

            {/* Mobile player info bar */}
            <div className="lg:hidden flex items-center justify-between gap-2 rounded-xl p-2 bg-slate-900/80 border border-slate-700/50">
              <div className="flex items-center gap-3">
                <span className="text-xs">🪙 <span className="text-yellow-400 font-bold">{player.coins.toLocaleString()}</span></span>
                <span className="text-xs">💎 <span className="text-cyan-400 font-bold">{player.gems.toLocaleString()}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-amber-400">⚡{player.energy}/{player.maxEnergy}</span>
                <span className="text-[10px] text-cyan-400">🔧{durability}/{MAX_DURABILITY}</span>
              </div>
            </div>

            {/* Target Grid */}
            <div className="flex-1 min-h-0">
              <div className="max-w-lg mx-auto">
                <TargetGrid
                  balls={balls.map((b) => b)}
                  onBallClick={handleBallClick}
                />
              </div>
            </div>

            {/* Shooter with status bars */}
            <div className="flex items-end justify-center">
              <div className="flex-1 max-w-xs">
                <AmmoSelector
                  selectedAmmo={selectedAmmo}
                  onSelectAmmo={setSelectedAmmo}
                  currentEnergy={player.energy}
                />
              </div>
              <Shooter
                selectedAmmo={selectedAmmo}
                isFiring={isFiring}
                energy={player.energy}
                maxEnergy={player.maxEnergy}
                durability={durability}
                maxDurability={MAX_DURABILITY}
                cooldown={cooldown}
                maxCooldown={COOLDOWN_MS}
              />
            </div>
          </div>

          {/* Right Panel - Rewards */}
          <aside className="lg:block">
            <RewardPanel
              rewards={rewards}
              stats={rewardStats}
              player={player}
              onRandomize={handleReset}
              randomizeCost={RANDOMIZE_COST}
            />
          </aside>
        </div>
      </main>

      {/* Floating damage numbers */}
      {damageNumbers.map((dn) => (
        <div
          key={dn.id}
          className="fixed pointer-events-none animate-damage-float z-50 font-black text-lg sm:text-xl"
          style={{
            left: dn.x,
            top: dn.y,
            color: dn.color,
            textShadow: `0 0 10px ${dn.color}, 0 2px 4px rgba(0,0,0,0.8)`,
          }}
        >
          -{dn.damage}
        </div>
      ))}

      {/* Reward drop popup */}
      {activeReward && (
        <RewardDrop reward={activeReward} onComplete={handleRewardComplete} />
      )}
    </div>
  );
}
