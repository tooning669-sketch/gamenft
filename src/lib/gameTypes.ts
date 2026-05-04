// ==========================================
// Game Type Definitions
// ==========================================

export type Tier = 1 | 2 | 3;

export interface Ball {
  id: string;
  row: number;
  col: number;
  hp: number;
  maxHp: number;
  tier: Tier;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  isPopping: boolean;
  isHit: boolean;
}

export interface AmmoType {
  id: string;
  name: string;
  damage: number;
  energyCost: number;
  icon: string;
  color: string;
  glowColor: string;
  description: string;
}

export type RewardRarity = 'Common' | 'Rare' | 'Legendary';

export interface Reward {
  id: string;
  name: string;
  rarity: RewardRarity;
  icon: string;
  description: string;
  timestamp: number;
  ballTier: Tier;
}

export interface PlayerState {
  energy: number;
  maxEnergy: number;
  coins: number;
  gems: number;
  level: number;
  xp: number;
  maxXp: number;
}

export interface Projectile {
  id: string;
  targetBallId: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  ammo: AmmoType;
  active: boolean;
}

// ==========================================
// Game Constants
// ==========================================

export const GRID_ROWS = 6;
export const GRID_COLS = 7;

export const TIER_CONFIG: Record<Tier, { hp: number; colors: { color: string; from: string; to: string }[] }> = {
  1: {
    hp: 50,
    colors: [
      { color: '#22c55e', from: '#4ade80', to: '#16a34a' },
      { color: '#06b6d4', from: '#22d3ee', to: '#0891b2' },
      { color: '#3b82f6', from: '#60a5fa', to: '#2563eb' },
    ],
  },
  2: {
    hp: 100,
    colors: [
      { color: '#f97316', from: '#fb923c', to: '#ea580c' },
      { color: '#ef4444', from: '#f87171', to: '#dc2626' },
      { color: '#ec4899', from: '#f472b6', to: '#db2777' },
    ],
  },
  3: {
    hp: 200,
    colors: [
      { color: '#a855f7', from: '#c084fc', to: '#9333ea' },
      { color: '#eab308', from: '#facc15', to: '#ca8a04' },
      { color: '#f59e0b', from: '#fbbf24', to: '#d97706' },
    ],
  },
};

export const AMMO_TYPES: AmmoType[] = [
  {
    id: 'basic',
    name: 'Basic',
    damage: 10,
    energyCost: 0,
    icon: '🔵',
    color: '#3b82f6',
    glowColor: 'rgba(59, 130, 246, 0.5)',
    description: 'Standard ammo. Free to use.',
  },
  {
    id: 'heavy',
    name: 'Heavy',
    damage: 50,
    energyCost: 5,
    icon: '🔴',
    color: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.5)',
    description: 'Powerful shot. Costs 5 energy.',
  },
  {
    id: 'mega',
    name: 'Mega',
    damage: 100,
    energyCost: 15,
    icon: '⚡',
    color: '#eab308',
    glowColor: 'rgba(234, 179, 8, 0.5)',
    description: 'Devastating blast. Costs 15 energy.',
  },
];

export const REWARD_ITEMS: Record<RewardRarity, { name: string; icon: string; description: string }[]> = {
  Common: [
    { name: '10 Coins', icon: '🪙', description: 'A small pile of coins' },
    { name: '5 Coins', icon: '🪙', description: 'A few coins' },
    { name: 'HP Potion', icon: '🧪', description: 'Restores energy' },
    { name: 'Bronze Shard', icon: '🔶', description: 'A common crafting material' },
  ],
  Rare: [
    { name: '50 Coins', icon: '💰', description: 'A bag of coins' },
    { name: '5 Gems', icon: '💎', description: 'Precious gems' },
    { name: 'Dark Bat', icon: '🦇', description: 'A rare pet companion' },
    { name: 'Silver Shard', icon: '⬜', description: 'A rare crafting material' },
  ],
  Legendary: [
    { name: '250 USDT', icon: '💵', description: 'Crypto reward!' },
    { name: '50 Gems', icon: '💎', description: 'A treasure trove of gems' },
    { name: 'Angel Cat', icon: '😺', description: 'A legendary pet!' },
    { name: 'Gold NFT', icon: '🏆', description: 'A golden NFT collectible' },
  ],
};

// Drop rate tables by ball tier
// Higher tier balls have better drop rates for rare/legendary
export const DROP_RATES: Record<Tier, Record<RewardRarity, number>> = {
  1: { Common: 0.75, Rare: 0.20, Legendary: 0.05 },
  2: { Common: 0.50, Rare: 0.35, Legendary: 0.15 },
  3: { Common: 0.25, Rare: 0.40, Legendary: 0.35 },
};

// ==========================================
// Gun Level System
// ==========================================

export interface GunLevel {
  level: number;
  name: string;
  icon: string;
  damageMultiplier: number;
  color: string;
  glowColor: string;
}

export const GUN_LEVELS: GunLevel[] = [
  { level: 1, name: 'Iron Cannon', icon: '🔫', damageMultiplier: 1.0, color: '#64748b', glowColor: 'rgba(100,116,139,0.4)' },
  { level: 2, name: 'Silver Cannon', icon: '🔫', damageMultiplier: 1.5, color: '#818cf8', glowColor: 'rgba(129,140,248,0.5)' },
  { level: 3, name: 'Gold Cannon', icon: '🔫', damageMultiplier: 2.0, color: '#fbbf24', glowColor: 'rgba(251,191,36,0.5)' },
];

// ==========================================
// Boost Card System
// ==========================================

export interface BoostCard {
  id: string;
  name: string;
  icon: string;
  bonusDamage: number;
  rarity: RewardRarity;
  description: string;
}

export const AVAILABLE_CARDS: BoostCard[] = [
  { id: 'card-fire-spirit', name: 'Fire Spirit', icon: '🔥', bonusDamage: 5, rarity: 'Common', description: '+5 DMG per shot' },
  { id: 'card-ice-golem', name: 'Ice Golem', icon: '🧊', bonusDamage: 10, rarity: 'Rare', description: '+10 DMG per shot' },
  { id: 'card-thunder-dragon', name: 'Thunder Dragon', icon: '🐉', bonusDamage: 20, rarity: 'Rare', description: '+20 DMG per shot' },
  { id: 'card-dark-wizard', name: 'Dark Wizard', icon: '🧙', bonusDamage: 15, rarity: 'Rare', description: '+15 DMG per shot' },
  { id: 'card-angel-knight', name: 'Angel Knight', icon: '⚔️', bonusDamage: 30, rarity: 'Legendary', description: '+30 DMG per shot' },
  { id: 'card-cosmic-cat', name: 'Cosmic Cat', icon: '🐱', bonusDamage: 50, rarity: 'Legendary', description: '+50 DMG per shot' },
];

// ==========================================
// Gun Skin System
// ==========================================

export interface GunSkin {
  id: string;
  name: string;
  image: string; // path in public/guns/
  rarity: RewardRarity;
  color: string;      // theme color for UI accents
  glowColor: string;
}

export const GUN_SKINS: GunSkin[] = [
  { id: 'skin-vine-cannon', name: 'Vine Cannon', image: '/guns/gun_01_vine_cannon.png', rarity: 'Common', color: '#22c55e', glowColor: 'rgba(34,197,94,0.5)' },
  { id: 'skin-kawaii-tank', name: 'Kawaii Tank', image: '/guns/gun_02_kawaii_tank.png', rarity: 'Common', color: '#f472b6', glowColor: 'rgba(244,114,182,0.5)' },
  { id: 'skin-candy-tank', name: 'Candy Tank', image: '/guns/gun_03_candy_tank.png', rarity: 'Common', color: '#fb923c', glowColor: 'rgba(251,146,60,0.5)' },
  { id: 'skin-dragon-cannon', name: 'Dragon Cannon', image: '/guns/gun_04_dragon_cannon.png', rarity: 'Rare', color: '#ef4444', glowColor: 'rgba(239,68,68,0.5)' },
  { id: 'skin-crystal-fortress', name: 'Crystal Fortress', image: '/guns/gun_05_crystal_fortress.png', rarity: 'Rare', color: '#a78bfa', glowColor: 'rgba(167,139,250,0.5)' },
  { id: 'skin-golden-knight', name: 'Golden Knight', image: '/guns/gun_06_golden_knight.png', rarity: 'Rare', color: '#fbbf24', glowColor: 'rgba(251,191,36,0.5)' },
  { id: 'skin-mecha-turret', name: 'Mecha Turret', image: '/guns/gun_07_mecha_turret.png', rarity: 'Rare', color: '#38bdf8', glowColor: 'rgba(56,189,248,0.5)' },
  { id: 'skin-ice-golem', name: 'Ice Golem', image: '/guns/gun_08_ice_golem.png', rarity: 'Rare', color: '#22d3ee', glowColor: 'rgba(34,211,238,0.5)' },
  { id: 'skin-steampunk', name: 'Steampunk', image: '/guns/gun_09_steampunk.png', rarity: 'Rare', color: '#a16207', glowColor: 'rgba(161,98,7,0.5)' },
  { id: 'skin-fire-demon', name: 'Fire Demon', image: '/guns/gun_10_fire_demon.png', rarity: 'Legendary', color: '#dc2626', glowColor: 'rgba(220,38,38,0.6)' },
  { id: 'skin-ocean-beast', name: 'Ocean Beast', image: '/guns/gun_11_ocean_beast.png', rarity: 'Legendary', color: '#0ea5e9', glowColor: 'rgba(14,165,233,0.6)' },
  { id: 'skin-shadow-cannon', name: 'Shadow Cannon', image: '/guns/gun_12_shadow_cannon.png', rarity: 'Legendary', color: '#7c3aed', glowColor: 'rgba(124,58,237,0.6)' },
  { id: 'skin-neon-blaster', name: 'Neon Blaster', image: '/guns/gun_13_neon_blaster.png', rarity: 'Legendary', color: '#e879f9', glowColor: 'rgba(232,121,249,0.6)' },
];
