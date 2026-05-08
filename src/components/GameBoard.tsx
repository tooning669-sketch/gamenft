'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  Ball as BallType,
  AmmoType,
  Reward,
  PlayerState,
  BoostCard,
  GunSkin,
  MarketplaceItem,
  MarketListing,
  InventoryItem,
  AMMO_TYPES,
  GUN_SKINS,
  AVAILABLE_CARDS,
  GRID_ROWS,
  GRID_COLS,
} from '@/lib/gameTypes';
import { generateGrid, applyDamage, rollReward, getRarityColor } from '@/lib/gameUtils';
import TargetGrid from './TargetGrid';
import Shooter from './Shooter';
import RewardDrop from './RewardDrop';
import RewardPanel from './RewardPanel';
import PlayerPanel from './PlayerPanel';
import GunSkinPicker from './GunSkinPicker';
import CardPicker from './CardPicker';
import Marketplace from './Marketplace';
import Inventory from './Inventory';
import SoundToggle, { playShootSound, playPopSound, playRewardSound, playClickSound, playCountdownBeep, startTenseMusic, stopTenseMusic, playTimeUpSound } from './SoundManager';

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
const MAX_ROUNDS_PER_GUN = 4;

// Bullet projectile type
interface BulletProjectile {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  glowColor: string;
  progress: number; // 0 to 1
}

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

  // Card boost (gun level removed)
  const [equippedCard, setEquippedCard] = useState<BoostCard | null>(null);

  // Countdown state (3..2..1..GO!)
  const [countdownValue, setCountdownValue] = useState<number | null>(null); // 3,2,1,0(GO)
  const [isRoundActive, setIsRoundActive] = useState(false);

  // Round timer (30 seconds)
  const [roundTimeLeft, setRoundTimeLeft] = useState(30);
  const roundTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Round summary
  const [showRoundSummary, setShowRoundSummary] = useState(false);
  const [roundRewards, setRoundRewards] = useState<Reward[]>([]);

  // Aim line (hover) - now used for bullet projectile
  const [hoveredBallId, setHoveredBallId] = useState<string | null>(null);
  const gameBoardRef = useRef<HTMLDivElement>(null);

  // Bullet projectile state
  const [bullets, setBullets] = useState<BulletProjectile[]>([]);

  // Round counter per gun (max 4 rounds before recharge)
  const [roundsPlayed, setRoundsPlayed] = useState<Record<string, number>>({}); // gunSkinId -> rounds played

  // Energy 4h cooldown per gun
  const [energyCooldowns, setEnergyCooldowns] = useState<Record<string, number>>({}); // gunSkinId -> timestamp when cooldown started

  // Gun skin state
  const [gunSkin, setGunSkin] = useState<GunSkin>(GUN_SKINS[0]);
  const [showSkinPicker, setShowSkinPicker] = useState(false);

  // Active tab (game vs marketplace vs inventory)
  const [activeTab, setActiveTab] = useState<'game' | 'marketplace' | 'inventory'>('game');

  // Card picker modal
  const [showCardPicker, setShowCardPicker] = useState(false);

  // Helper: generate NFT-style token ID
  const genTokenId = () => `0x${Math.random().toString(16).slice(2, 10).toUpperCase()}`;

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
        tokenId: `0x${Math.random().toString(16).slice(2, 10).toUpperCase()}`,
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
        tokenId: `0x${Math.random().toString(16).slice(2, 10).toUpperCase()}`,
      },
    ];
  });

  // Track which inventory item is the equipped gun
  const [equippedGunInvId, setEquippedGunInvId] = useState<string>('inv-init-gun');

  // Derived stats from gun skin
  const maxDurability = gunSkin.durability;
  const cooldownMs = Math.round(gunSkin.cooldownSec * 1000);

  // Aim angle for cannon rotation
  const [aimAngle, setAimAngle] = useState(0);
  const shooterRef = useRef<HTMLDivElement>(null);

  const totalBalls = GRID_ROWS * GRID_COLS;
  const ballsRemaining = balls.filter((b) => !b.isPopping && b.hp > 0).length;

  // Compute owned guns & cards from inventory for pickers
  const ownedGuns = inventory
    .filter((i) => i.category === 'guns')
    .map((invItem) => {
      const skin = GUN_SKINS.find((g) => g.name === invItem.name);
      return skin ? { skin, invItem } : null;
    })
    .filter(Boolean) as { skin: GunSkin; invItem: InventoryItem }[];

  const ownedCards = inventory
    .filter((i) => i.category === 'cards')
    .map((invItem) => {
      const card = AVAILABLE_CARDS.find((c) => c.name === invItem.name);
      return card ? { card, invItem } : null;
    })
    .filter(Boolean) as { card: BoostCard; invItem: InventoryItem }[];

  // Calculate actual damage (uses gun skin base DMG, no gun level)
  const calcDamage = useCallback(() => {
    return gunSkin.dmg + (equippedCard?.bonusDamage || 0);
  }, [gunSkin, equippedCard]);

  // Energy 4h cooldown per gun
  const ENERGY_COOLDOWN_SEC = 4 * 3600; // 4 hours
  const currentCooldownStart = energyCooldowns[gunSkin.id];
  const [energyCooldownRemain, setEnergyCooldownRemain] = useState(0);
  const energyCooldownActive = currentCooldownStart != null && energyCooldownRemain > 0;

  // Current gun round count
  const currentRoundsPlayed = roundsPlayed[gunSkin.id] || 0;
  const roundsRemaining = MAX_ROUNDS_PER_GUN - currentRoundsPlayed;
  const isGunExhausted = roundsRemaining <= 0 && !energyCooldownActive;

  useEffect(() => {
    if (!currentCooldownStart) { setEnergyCooldownRemain(0); return; }
    const tick = () => {
      const elapsed = (Date.now() - currentCooldownStart) / 1000;
      const remain = Math.max(0, ENERGY_COOLDOWN_SEC - elapsed);
      setEnergyCooldownRemain(remain);
      if (remain <= 0) {
        // Cooldown done - refill energy and reset rounds
        setPlayer(prev => ({ ...prev, energy: prev.maxEnergy }));
        setEnergyCooldowns(prev => { const n = { ...prev }; delete n[gunSkin.id]; return n; });
        setRoundsPlayed(prev => { const n = { ...prev }; delete n[gunSkin.id]; return n; });
      }
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [currentCooldownStart, gunSkin.id]);

  // Auto-trigger 4h cooldown when gun exhausts all rounds
  useEffect(() => {
    if (isGunExhausted && !energyCooldowns[gunSkin.id]) {
      setEnergyCooldowns(prev => ({ ...prev, [gunSkin.id]: Date.now() }));
    }
  }, [isGunExhausted, gunSkin.id, energyCooldowns]);

  // Round timer effect
  useEffect(() => {
    if (isRoundActive && !showRoundSummary) {
      roundTimerRef.current = setInterval(() => {
        setRoundTimeLeft(prev => {
          if (prev <= 1) {
            // Time's up!
            if (roundTimerRef.current) clearInterval(roundTimerRef.current);
            setIsRoundActive(false);
            setShowRoundSummary(true);
            setRoundRewards([...rewards]);
            stopTenseMusic();
            playTimeUpSound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => { if (roundTimerRef.current) clearInterval(roundTimerRef.current); };
    }
  }, [isRoundActive, showRoundSummary]);

  // Sync gameplay durability to inventory whenever it changes
  useEffect(() => {
    if (!equippedGunInvId) return;
    setInventory((prev) =>
      prev.map((i) => i.id === equippedGunInvId ? { ...i, durability: durability } : i)
    );
  }, [durability, equippedGunInvId]);

  // When gun skin changes, save old durability then load from new gun's inventory
  const handleGunSkinChange = useCallback((skin: GunSkin) => {
    // Save current gun durability to inventory
    if (equippedGunInvId) {
      setInventory((prev) =>
        prev.map((i) => i.id === equippedGunInvId ? { ...i, durability } : i)
      );
    }
    // Find the inventory item for the new gun
    const newGunInv = inventory.find((i) => i.category === 'guns' && i.name === skin.name);
    setGunSkin(skin);
    setPlayer((prev) => ({
      ...prev,
      energy: skin.energy,
      maxEnergy: skin.energy,
    }));
    // Load durability from inventory or use max
    setDurability(newGunInv?.durability ?? skin.durability);
    setEquippedGunInvId(newGunInv?.id || '');
    setCooldown(0);
  }, [equippedGunInvId, durability, inventory]);

  // Energy regeneration removed — replaced by 4h cooldown system above

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

      // Block during countdown or round summary or round not active
      if (countdownValue !== null || showRoundSummary || !isRoundActive) return;

      // Check cooldown
      if (cooldown > 0) return;

      // Check durability
      if (durability <= 0) return;

      // Check energy
      if (player.energy < selectedAmmo.energyCost) return;

      // Calculate aim angle and spawn bullet
      const ballElement = document.getElementById(`ball-wrapper-${ball.id}`);
      if (ballElement) {
        updateAimAngle(ballElement);
        // Spawn bullet projectile
        const cannonEl = document.getElementById('shooter-cannon');
        const boardEl = gameBoardRef.current;
        if (cannonEl && boardEl) {
          const boardRect = boardEl.getBoundingClientRect();
          const cannonRect = cannonEl.getBoundingClientRect();
          const ballRect = ballElement.getBoundingClientRect();
          const bulletId = `bullet-${Date.now()}-${Math.random()}`;
          const newBullet: BulletProjectile = {
            id: bulletId,
            startX: cannonRect.left + cannonRect.width / 2 - boardRect.left,
            startY: cannonRect.top - boardRect.top,
            endX: ballRect.left + ballRect.width / 2 - boardRect.left,
            endY: ballRect.top + ballRect.height / 2 - boardRect.top,
            color: selectedAmmo.color,
            glowColor: selectedAmmo.glowColor,
            progress: 0,
          };
          setBullets(prev => [...prev, newBullet]);
          // Animate bullet
          const startTime = performance.now();
          const duration = 200; // ms
          const animateBullet = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            setBullets(prev => prev.map(b => b.id === bulletId ? { ...b, progress } : b));
            if (progress < 1) {
              requestAnimationFrame(animateBullet);
            } else {
              // Remove bullet after short delay
              setTimeout(() => setBullets(prev => prev.filter(b => b.id !== bulletId)), 100);
            }
          };
          requestAnimationFrame(animateBullet);
        }
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

      // Energy cooldown is now triggered when rounds reach max (in handleReset completion)

      // Apply damage with card bonus (no gun level)
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
          tokenId: genTokenId(),
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
    [selectedAmmo, player.energy, cooldown, durability, calcDamage, updateAimAngle, countdownValue, showRoundSummary, isRoundActive, energyCooldowns, gunSkin.id]
  );

  // Start game: deduct coins → countdown 3..2..1 → GO → start 30s timer
  const handleReset = useCallback(() => {
    if (player.coins < RANDOMIZE_COST) return;
    if (countdownValue !== null) return; // already counting down

    // Check if gun has rounds remaining
    const currentRounds = roundsPlayed[gunSkin.id] || 0;
    if (currentRounds >= MAX_ROUNDS_PER_GUN) {
      // Start recharge if not already started
      if (!energyCooldowns[gunSkin.id]) {
        setEnergyCooldowns(prev => ({ ...prev, [gunSkin.id]: Date.now() }));
      }
      return;
    }

    playClickSound();

    // Deduct coins
    setPlayer((prev) => ({
      ...prev,
      coins: prev.coins - RANDOMIZE_COST,
    }));

    // Increment round count for this gun
    setRoundsPlayed(prev => ({
      ...prev,
      [gunSkin.id]: (prev[gunSkin.id] || 0) + 1,
    }));

    // Reset game state
    setBalls(generateGrid());
    setRewards([]);
    setDurability(maxDurability);
    setCooldown(0);
    setActiveReward(null);
    setAimAngle(0);
    setShowRoundSummary(false);
    setRoundRewards([]);
    setIsRoundActive(false);
    setRoundTimeLeft(30);

    // Start countdown 3..2..1..GO
    setCountdownValue(3);
    stopTenseMusic();
    startTenseMusic();
    playCountdownBeep(false);

    // Countdown sequence
    setTimeout(() => { setCountdownValue(2); playCountdownBeep(false); }, 1000);
    setTimeout(() => { setCountdownValue(1); playCountdownBeep(false); }, 2000);
    setTimeout(() => {
      setCountdownValue(0); // GO!
      playCountdownBeep(true);
    }, 3000);
    setTimeout(() => {
      setCountdownValue(null);
      setIsRoundActive(true);
      setRoundTimeLeft(30);
    }, 3800);
  }, [player.coins, countdownValue, roundsPlayed, gunSkin.id, energyCooldowns]);

  const handleRewardComplete = useCallback(() => {
    setActiveReward(null);
  }, []);

  // Aim line hover handlers
  const handleBallHover = useCallback((ball: BallType) => {
    if (ball.isPopping || ball.hp <= 0) return;
    setHoveredBallId(ball.id);
  }, []);

  const handleBallLeave = useCallback(() => {
    setHoveredBallId(null);
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
          tokenId: genTokenId(),
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
        tokenId: genTokenId(),
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
          tokenId: genTokenId(),
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
        tokenId: genTokenId(),
      }];
    });
  }, []);

  // Handle listing item for sale — keep item in inventory, just mark with listedPrice
  const handleListForSale = useCallback((item: InventoryItem, price: number) => {
    setInventory((prev) =>
      prev.map((i) => i.id === item.id
        ? { ...i, listedPrice: price > 0 ? price : undefined }
        : i
      )
    );
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
    <div className="h-screen flex flex-col relative z-10 overflow-hidden">
      {/* Header */}
      <header
        className="py-2 sm:py-3 px-4 sm:px-6 flex items-center justify-between border-b"
        style={{
          background: 'linear-gradient(90deg, rgba(15,10,40,0.97), rgba(30,15,60,0.95), rgba(15,10,40,0.97))',
          borderColor: 'rgba(236, 72, 153, 0.3)',
        }}
      >
        <div className="flex items-center gap-3">
          <h1 className="text-lg sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            🎮 BUBBLE BLAST
          </h1>
          <span className="hidden sm:inline text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 font-semibold">
            NFT
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-4 text-xs font-semibold text-slate-400">
          {[
            { label: 'HOME', tab: 'game' as const },
            { label: 'GAME', tab: 'game' as const },
            { label: 'MARKETPLACE', tab: 'marketplace' as const },
            { label: '👛 WALLET', tab: 'inventory' as const },
            { label: 'TOP EARNING', tab: 'game' as const },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => {
                playClickSound();
                setActiveTab(item.tab);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                (item.tab === activeTab && (item.label === 'GAME' || item.label === 'MARKETPLACE' || item.label === '👛 WALLET'))
                  ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
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
      <main className="flex-1 p-2 sm:p-3 lg:p-4 overflow-hidden">
        {activeTab === 'game' ? (
          <div className="h-full mx-auto grid grid-cols-1 lg:grid-cols-[200px_1fr_240px] gap-2 sm:gap-3 lg:gap-4">
            {/* Left Panel - Player Info */}
            <aside className="hidden lg:block">
              <PlayerPanel
                player={player}
                ballsRemaining={ballsRemaining}
                totalBalls={totalBalls}
                onOpenWallet={() => { playClickSound(); setActiveTab('inventory'); }}
              />
            </aside>

            {/* Center - Game Board */}
            <div className="flex flex-col gap-2 sm:gap-3 min-h-0 h-full overflow-hidden" ref={gameBoardRef}>
              {/* Title + Round Timer */}
              <div className="text-center">
                <h2
                  className="text-base sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400"
                  style={{ textShadow: '0 0 20px rgba(251, 191, 36, 0.3)' }}
                >
                  ⭐ BUBBLE SHOOTER ⭐
                </h2>
                {/* 30s Timer Bar */}
                {isRoundActive && (
                  <div className="mt-2 max-w-lg mx-auto">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold font-mono ${roundTimeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-amber-300'}`}>
                        ⏱️ {roundTimeLeft}s
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-slate-800/80 overflow-hidden border border-amber-900/30">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${(roundTimeLeft / 30) * 100}%`,
                            background: roundTimeLeft > 15
                              ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                              : roundTimeLeft > 7
                                ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                                : 'linear-gradient(90deg, #ef4444, #f87171)',
                            boxShadow: roundTimeLeft <= 7 ? '0 0 12px rgba(239,68,68,0.6)' : '0 0 8px rgba(34,197,94,0.4)',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
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

              {/* Target Grid with Aim Line */}
              <div className="flex-1 min-h-0 relative overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-full max-w-2xl">
                    <TargetGrid
                      balls={balls.map((b) => b)}
                      onBallClick={handleBallClick}
                      onBallHover={handleBallHover}
                      onBallLeave={handleBallLeave}
                    />
                  </div>
                </div>
                {/* Bullet Projectiles */}
                {bullets.length > 0 && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" style={{ overflow: 'visible' }}>
                    {bullets.map(bullet => {
                      const cx = bullet.startX + (bullet.endX - bullet.startX) * bullet.progress;
                      const cy = bullet.startY + (bullet.endY - bullet.startY) * bullet.progress;
                      const opacity = bullet.progress >= 0.95 ? (1 - (bullet.progress - 0.95) / 0.05) : 1;
                      return (
                        <g key={bullet.id}>
                          {/* Bullet trail */}
                          <line
                            x1={bullet.startX + (bullet.endX - bullet.startX) * Math.max(0, bullet.progress - 0.3)}
                            y1={bullet.startY + (bullet.endY - bullet.startY) * Math.max(0, bullet.progress - 0.3)}
                            x2={cx}
                            y2={cy}
                            stroke={bullet.color}
                            strokeWidth="3"
                            strokeLinecap="round"
                            opacity={opacity * 0.4}
                          />
                          {/* Bullet glow */}
                          <circle cx={cx} cy={cy} r="8" fill={bullet.color} opacity={opacity * 0.15} />
                          <circle cx={cx} cy={cy} r="5" fill={bullet.color} opacity={opacity * 0.3} />
                          {/* Bullet core */}
                          <circle cx={cx} cy={cy} r="3" fill="white" opacity={opacity * 0.9} />
                          <circle cx={cx} cy={cy} r="4" fill={bullet.color} opacity={opacity * 0.7} />
                        </g>
                      );
                    })}
                  </svg>
                )}
                {/* Impact flash at target */}
                {bullets.filter(b => b.progress >= 0.9).map(bullet => (
                  <div
                    key={`impact-${bullet.id}`}
                    className="absolute pointer-events-none z-20"
                    style={{
                      left: bullet.endX - 12,
                      top: bullet.endY - 12,
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: `radial-gradient(circle, ${bullet.color}80, transparent)`,
                      opacity: 1 - bullet.progress,
                      transform: `scale(${1 + bullet.progress})`,
                    }}
                  />
                ))}
              </div>

              {/* Shooter - Centered */}
              <div className="flex justify-center" ref={shooterRef}>
                <Shooter
                  selectedAmmo={selectedAmmo}
                  isFiring={isFiring}
                  aimAngle={aimAngle}
                  durability={durability}
                  maxDurability={maxDurability}
                  cooldown={cooldown}
                  maxCooldown={cooldownMs}
                  equippedCard={equippedCard}
                  onEquipCard={setEquippedCard}
                  gunSkin={gunSkin}
                  onGunSkinClick={() => setShowSkinPicker(true)}
                  onCardSlotClick={() => setShowCardPicker(true)}
                  energyCooldownRemain={energyCooldownRemain}
                  energyCooldownActive={energyCooldownActive}
                  roundsPlayed={currentRoundsPlayed}
                  maxRounds={MAX_ROUNDS_PER_GUN}
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
            onRepairItem={(item) => {
              const repairCost = Math.floor((item.rarity === 'Legendary' ? 500 : item.rarity === 'Rare' ? 250 : 100));
              if (player.coins < repairCost) return;
              playClickSound();
              setPlayer((prev) => ({ ...prev, coins: prev.coins - repairCost }));
              setInventory((prev) => prev.map((i) => i.id === item.id ? { ...i, durability: i.maxDurability } : i));
              // If repairing the currently equipped gun, also update gameplay durability
              if (item.id === equippedGunInvId) {
                setDurability(item.maxDurability ?? gunSkin.durability);
              }
            }}
            playerCoins={player.coins}
            playerGems={player.gems}
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
        ownedGuns={ownedGuns}
        onSelectSkin={handleGunSkinChange}
        onClose={() => setShowSkinPicker(false)}
      />

      {/* Card Picker Modal */}
      <CardPicker
        isOpen={showCardPicker}
        equippedCard={equippedCard}
        ownedCards={ownedCards}
        onSelectCard={setEquippedCard}
        onClose={() => setShowCardPicker(false)}
      />

      {/* Countdown Overlay (3..2..1..GO!) */}
      {countdownValue !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 animate-skin-picker-backdrop">
          <div className="text-center">
            <div
              className="text-8xl sm:text-9xl font-black animate-countdown-pop"
              key={countdownValue}
              style={{
                color: countdownValue === 0 ? '#22c55e' : '#fbbf24',
                textShadow: countdownValue === 0
                  ? '0 0 40px rgba(34,197,94,0.8), 0 0 80px rgba(34,197,94,0.4)'
                  : '0 0 40px rgba(251,191,36,0.8), 0 0 80px rgba(251,191,36,0.4)',
              }}
            >
              {countdownValue === 0 ? 'GO!' : countdownValue}
            </div>
            <div className="text-slate-400 text-sm mt-4 font-semibold tracking-wider uppercase">
              {countdownValue === 0 ? '🔥 FIRE AT WILL!' : 'Get Ready...'}
            </div>
          </div>
        </div>
      )}

      {/* Round Summary Modal */}
      {showRoundSummary && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 animate-skin-picker-backdrop">
          <div
            className="relative w-[90vw] max-w-md rounded-2xl p-6 animate-skin-picker-enter"
            style={{
              background: 'linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,41,59,0.98))',
              border: '2px solid rgba(99, 102, 241, 0.4)',
              boxShadow: '0 0 60px rgba(99,102,241,0.3)',
            }}
          >
            <h2 className="text-xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 mb-4">
              ⏰ TIME&apos;S UP!
            </h2>
            <div className="text-center text-slate-400 text-xs mb-4">Round Complete</div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="text-lg font-bold text-white">{roundRewards.length}</div>
                <div className="text-[10px] text-slate-400">Total</div>
              </div>
              <div className="text-center p-2 rounded-xl bg-slate-800/50 border border-indigo-500/30">
                <div className="text-lg font-bold text-indigo-400">{roundRewards.filter(r => r.rarity === 'Rare').length}</div>
                <div className="text-[10px] text-slate-400">Rare</div>
              </div>
              <div className="text-center p-2 rounded-xl bg-slate-800/50 border border-amber-500/30">
                <div className="text-lg font-bold text-amber-400">{roundRewards.filter(r => r.rarity === 'Legendary').length}</div>
                <div className="text-[10px] text-slate-400">Legend</div>
              </div>
            </div>

            {/* Reward list */}
            <div className="max-h-48 overflow-y-auto space-y-1.5 custom-scrollbar mb-4">
              {roundRewards.length === 0 ? (
                <div className="text-center text-slate-500 text-sm py-4">No rewards this round</div>
              ) : (
                roundRewards.map((r, i) => {
                  const rc = getRarityColor(r.rarity);
                  return (
                    <div key={`${r.id}-${i}`} className="flex items-center gap-2 rounded-lg p-2" style={{ background: 'rgba(15,23,42,0.6)', border: `1px solid ${rc}30` }}>
                      <span className="text-lg">{r.icon}</span>
                      <span className="text-xs font-semibold text-white flex-1 truncate">{r.name}</span>
                      <span className="text-[10px] font-bold uppercase" style={{ color: rc }}>{r.rarity}</span>
                    </div>
                  );
                })
              )}
            </div>

            <button
              onClick={() => {
                playClickSound();
                setShowRoundSummary(false);
                setIsRoundActive(false);
                stopTenseMusic();
              }}
              className="w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider cursor-pointer hover:scale-105 active:scale-95 transition-all"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1, #3b82f6)',
                boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
              }}
            >
              ✅ Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
