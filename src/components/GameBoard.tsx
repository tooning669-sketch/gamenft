'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Ball as BallType,
  AmmoType,
  Reward,
  PlayerState,
  BoostCard,
  GunLevel,
  GunSkin,
  MarketplaceItem,
  MarketListing,
  InventoryItem,
  AMMO_TYPES,
  GUN_LEVELS,
  GUN_SKINS,
  AVAILABLE_CARDS,
  REWARD_ITEMS,
  GRID_ROWS,
  GRID_COLS,
} from '@/lib/gameTypes';
import { generateGrid, applyDamage, rollReward } from '@/lib/gameUtils';
import TargetGrid from './TargetGrid';
import Shooter from './Shooter';
import RewardDrop from './RewardDrop';
import RewardPanel from './RewardPanel';
import PlayerPanel from './PlayerPanel';
import GunSkinPicker from './GunSkinPicker';
import CardPicker from './CardPicker';
import Marketplace from './Marketplace';
import Inventory from './Inventory';
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
  const [durability, setDurability] = useState(GUN_SKINS[0].durability);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Gun level & card boost
  const [gunLevel, setGunLevel] = useState<GunLevel>(GUN_LEVELS[0]);
  const [equippedCard, setEquippedCard] = useState<BoostCard | null>(null);

  // Gun skin state
  const [gunSkin, setGunSkin] = useState<GunSkin>(GUN_SKINS[0]);
  const [showSkinPicker, setShowSkinPicker] = useState(false);

  // Active tab (game vs marketplace vs inventory)
  const [activeTab, setActiveTab] = useState<'game' | 'marketplace' | 'inventory'>('game');

  // Card picker modal
  const [showCardPicker, setShowCardPicker] = useState(false);

  // Inventory — start with default gun + first card owned
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const defaultGun = GUN_SKINS[0];
    const defaultCard = AVAILABLE_CARDS[0];
    return [
      {
        id: `inv-init-gun`,
        itemId: defaultGun.id,
        name: defaultGun.name,
        image: defaultGun.image,
        icon: '🔫',
        category: 'guns' as const,
        rarity: defaultGun.rarity,
        quantity: 1,
        acquiredAt: Date.now(),
        durability: defaultGun.durability,
        maxDurability: defaultGun.durability,
        description: `DMG ${defaultGun.dmg} • Energy ${defaultGun.energy} • Cooldown ${defaultGun.cooldownSec}s`,
      },
      {
        id: `inv-init-card`,
        itemId: defaultCard.id,
        name: defaultCard.name,
        image: defaultCard.image,
        icon: defaultCard.icon,
        category: 'cards' as const,
        rarity: defaultCard.rarity,
        quantity: 1,
        acquiredAt: Date.now(),
        description: defaultCard.description,
      },
    ];
  });

  // Derived stats from gun skin
  const maxDurability = gunSkin.durability;
  const cooldownMs = Math.round(gunSkin.cooldownSec * 1000);

  // Aim angle for cannon rotation
  const [aimAngle, setAimAngle] = useState(0);
  const shooterRef = useRef<HTMLDivElement>(null);

  const totalBalls = GRID_ROWS * GRID_COLS;
  const ballsRemaining = balls.filter((b) => !b.isPopping && b.hp > 0).length;

  // Calculate actual damage (uses gun skin base DMG)
  const calcDamage = useCallback(() => {
    return Math.floor(gunSkin.dmg * gunLevel.damageMultiplier) + (equippedCard?.bonusDamage || 0);
  }, [gunSkin, gunLevel, equippedCard]);

  // When gun skin changes, update energy & durability
  const handleGunSkinChange = useCallback((skin: GunSkin) => {
    setGunSkin(skin);
    setPlayer((prev) => ({
      ...prev,
      energy: skin.energy,
      maxEnergy: skin.energy,
    }));
    setDurability(skin.durability);
    setCooldown(0);
  }, []);

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

  // Calculate aim angle toward clicked ball
  const updateAimAngle = useCallback((ballElement: HTMLElement) => {
    const cannonEl = document.getElementById('shooter-cannon');
    if (!cannonEl || !ballElement) return;

    const cannonRect = cannonEl.getBoundingClientRect();
    const ballRect = ballElement.getBoundingClientRect();

    const cannonCenterX = cannonRect.left + cannonRect.width / 2;
    const cannonTopY = cannonRect.top;

    const ballCenterX = ballRect.left + ballRect.width / 2;
    const ballCenterY = ballRect.top + ballRect.height / 2;

    const dx = ballCenterX - cannonCenterX;
    const dy = cannonTopY - ballCenterY; // inverted Y

    // Angle from vertical (0 = straight up)
    const angleRad = Math.atan2(dx, dy);
    let angleDeg = (angleRad * 180) / Math.PI;

    // Clamp angle to ±45 degrees
    angleDeg = Math.max(-45, Math.min(45, angleDeg));

    setAimAngle(angleDeg);
  }, []);

  const handleBallClick = useCallback(
    (ball: BallType) => {
      if (ball.isPopping || ball.hp <= 0) return;

      // Check cooldown
      if (cooldown > 0) return;

      // Check durability
      if (durability <= 0) return;

      // Check energy
      if (player.energy < selectedAmmo.energyCost) return;

      // Calculate aim angle
      const ballElement = document.getElementById(`ball-wrapper-${ball.id}`);
      if (ballElement) {
        updateAimAngle(ballElement);
      }

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

      // Start cooldown (from gun skin stats)
      setCooldown(cooldownMs);

      // Fire animation
      setIsFiring(true);
      setTimeout(() => setIsFiring(false), 200);

      // Apply damage with gun level multiplier + card bonus
      const totalDamage = calcDamage();
      const updatedBall = applyDamage(ball, totalDamage);

      // Show floating damage number
      const damageId = `dmg-${Date.now()}-${Math.random()}`;
      if (ballElement) {
        const rect = ballElement.getBoundingClientRect();
        setDamageNumbers((prev) => [
          ...prev,
          {
            id: damageId,
            x: rect.left + rect.width / 2,
            y: rect.top,
            damage: totalDamage,
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

        // Auto-add reward item to inventory
        const isGunReward = reward.name.toLowerCase().includes('cannon') || reward.name.toLowerCase().includes('blaster') || reward.name.toLowerCase().includes('turret');
        const isCardReward = reward.name.toLowerCase().includes('ticket') || reward.name.toLowerCase().includes('coupon') || reward.name.toLowerCase().includes('box');
        const rewardCategory = isGunReward ? 'guns' : isCardReward ? 'cards' : 'special';

        // Find matching gun skin for gun-type rewards
        const matchedGun = GUN_SKINS.find(g => g.name === reward.name);

        const invItem: InventoryItem = {
          id: `inv-reward-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          itemId: reward.id,
          name: reward.name,
          image: matchedGun?.image || '',
          icon: reward.icon,
          category: rewardCategory as 'guns' | 'cards' | 'special',
          rarity: reward.rarity,
          quantity: 1,
          acquiredAt: Date.now(),
          description: reward.description,
          ...(matchedGun ? { durability: matchedGun.durability, maxDurability: matchedGun.durability } : {}),
        };

        setInventory((prev) => {
          // Stack same-name non-gun items
          if (!matchedGun) {
            const existing = prev.find((i) => i.name === reward.name);
            if (existing) {
              return prev.map((i) => i.name === reward.name ? { ...i, quantity: i.quantity + 1 } : i);
            }
          }
          return [...prev, invItem];
        });
      }
    },
    [selectedAmmo, player.energy, cooldown, durability, calcDamage, updateAimAngle]
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
    setDurability(maxDurability);
    setCooldown(0);
    setActiveReward(null);
    setAimAngle(0);
  }, [player.coins]);

  const handleRewardComplete = useCallback(() => {
    setActiveReward(null);
  }, []);

  // Handle marketplace purchase (from shop)
  const handleMarketPurchase = useCallback((item: MarketplaceItem, currency: 'coins' | 'gems') => {
    setPlayer((prev) => {
      const price = item.discount ? Math.floor(item.priceCoins * (1 - item.discount / 100)) : item.priceCoins;
      if (currency === 'coins') {
        return { ...prev, coins: prev.coins - price };
      } else {
        return { ...prev, gems: prev.gems - item.priceGems };
      }
    });
    // Look up gun skin data for durability
    const matchedGun = item.category === 'guns' ? GUN_SKINS.find(g => g.name === item.name) : null;
    // Add to inventory
    setInventory((prev) => {
      // Don't stack guns (each has unique durability)
      if (matchedGun) {
        return [...prev, {
          id: `inv-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          itemId: item.id,
          name: item.name,
          image: item.image,
          icon: item.icon,
          category: item.category,
          rarity: item.rarity,
          quantity: 1,
          acquiredAt: Date.now(),
          durability: matchedGun.durability,
          maxDurability: matchedGun.durability,
          description: `DMG ${matchedGun.dmg} • Energy ${matchedGun.energy} • Cooldown ${matchedGun.cooldownSec}s`,
        }];
      }
      const existing = prev.find((i) => i.itemId === item.id);
      if (existing) {
        return prev.map((i) => i.itemId === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        id: `inv-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        itemId: item.id,
        name: item.name,
        image: item.image,
        icon: item.icon,
        category: item.category,
        rarity: item.rarity,
        quantity: 1,
        acquiredAt: Date.now(),
        description: item.description,
      }];
    });
  }, []);

  // Handle buy from P2P player listing
  const handleBuyFromPlayer = useCallback((listing: MarketListing) => {
    setPlayer((prev) => ({ ...prev, coins: prev.coins - listing.priceCoins }));
    const matchedGun = listing.item.category === 'guns' ? GUN_SKINS.find(g => g.name === listing.item.name) : null;
    setInventory((prev) => {
      if (matchedGun) {
        return [...prev, {
          id: `inv-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          itemId: listing.item.id,
          name: listing.item.name,
          image: listing.item.image,
          icon: listing.item.icon,
          category: listing.item.category,
          rarity: listing.item.rarity,
          quantity: 1,
          acquiredAt: Date.now(),
          durability: matchedGun.durability,
          maxDurability: matchedGun.durability,
          description: `DMG ${matchedGun.dmg} • Energy ${matchedGun.energy} • Cooldown ${matchedGun.cooldownSec}s`,
        }];
      }
      const existing = prev.find((i) => i.itemId === listing.item.id);
      if (existing) {
        return prev.map((i) => i.itemId === listing.item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        id: `inv-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        itemId: listing.item.id,
        name: listing.item.name,
        image: listing.item.image,
        icon: listing.item.icon,
        category: listing.item.category,
        rarity: listing.item.rarity,
        quantity: 1,
        acquiredAt: Date.now(),
        description: listing.item.description,
      }];
    });
  }, []);

  // Handle listing item for sale
  const handleListForSale = useCallback((item: InventoryItem, _price: number) => {
    setInventory((prev) => {
      if (item.quantity <= 1) return prev.filter((i) => i.id !== item.id);
      return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i);
    });
  }, []);

  // Handle sell from inventory
  const handleSellFromInventory = useCallback((item: InventoryItem) => {
    // Quick sell for 50% of lowest market price
    const sellValue = Math.floor(200 * (item.rarity === 'Legendary' ? 5 : item.rarity === 'Rare' ? 2 : 1));
    setPlayer((prev) => ({ ...prev, coins: prev.coins + sellValue }));
    setInventory((prev) => {
      if (item.quantity <= 1) return prev.filter((i) => i.id !== item.id);
      return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i);
    });
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
          {[
            { label: 'HOME', tab: 'game' as const },
            { label: 'GAME', tab: 'game' as const },
            { label: 'MARKETPLACE', tab: 'marketplace' as const },
            { label: '🎒 BAG', tab: 'inventory' as const },
            { label: 'TOP EARNING', tab: 'game' as const },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => {
                playClickSound();
                setActiveTab(item.tab);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                (item.tab === activeTab && (item.label === 'GAME' || item.label === 'MARKETPLACE' || item.label === '🎒 BAG'))
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {item.label}
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
      <main className="flex-1 p-2 sm:p-4 lg:p-6 overflow-auto">
        {activeTab === 'game' ? (
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
                  style={{ textShadow: '0 0 20px rgba(251, 191, 36, 0.3)' }}
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
                  <span className="text-[10px] text-cyan-400">🔧{durability}/{maxDurability}</span>
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

              {/* Shooter - Centered */}
              <div className="flex justify-center" ref={shooterRef}>
                <Shooter
                  selectedAmmo={selectedAmmo}
                  isFiring={isFiring}
                  aimAngle={aimAngle}
                  energy={player.energy}
                  maxEnergy={player.maxEnergy}
                  durability={durability}
                  maxDurability={maxDurability}
                  cooldown={cooldown}
                  maxCooldown={cooldownMs}
                  gunLevel={gunLevel}
                  onGunLevelChange={setGunLevel}
                  equippedCard={equippedCard}
                  onEquipCard={setEquippedCard}
                  gunSkin={gunSkin}
                  onGunSkinClick={() => setShowSkinPicker(true)}
                  onCardSlotClick={() => setShowCardPicker(true)}
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
        ) : activeTab === 'marketplace' ? (
          /* Marketplace Tab */
          <Marketplace
            player={player}
            inventory={inventory}
            onBuyFromShop={handleMarketPurchase}
            onBuyFromPlayer={handleBuyFromPlayer}
            onListForSale={handleListForSale}
          />
        ) : (
          /* Inventory Tab */
          <Inventory
            items={inventory}
            onSellItem={handleSellFromInventory}
            onRepairItem={(item) => {
              const repairCost = Math.floor((item.rarity === 'Legendary' ? 500 : item.rarity === 'Rare' ? 250 : 100));
              if (player.coins < repairCost) return;
              playClickSound();
              setPlayer((prev) => ({ ...prev, coins: prev.coins - repairCost }));
              setInventory((prev) => prev.map((i) => i.id === item.id ? { ...i, durability: i.maxDurability } : i));
            }}
            playerCoins={player.coins}
          />
        )}
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

      {/* Gun Skin Picker Modal */}
      <GunSkinPicker
        isOpen={showSkinPicker}
        selectedSkin={gunSkin}
        onSelectSkin={handleGunSkinChange}
        onClose={() => setShowSkinPicker(false)}
      />

      {/* Card Picker Modal */}
      <CardPicker
        isOpen={showCardPicker}
        equippedCard={equippedCard}
        onSelectCard={setEquippedCard}
        onClose={() => setShowCardPicker(false)}
      />
    </div>
  );
}
