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
  usdt: number;
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
// Exchange Rate Constants
// ==========================================

export type CurrencyType = 'coins' | 'gems' | 'usdt';

export interface ExchangeRate {
  from: CurrencyType;
  to: CurrencyType;
  rate: number; // how many 'to' units you get for 1 'from' unit
  label: string;
}

// Core rates
export const USDT_TO_GOLD = 175;       // 1 USDT = 175 Gold
export const DIAMOND_TO_USDT = 5;      // 1 Diamond = 5 USDT
export const DIAMOND_TO_GOLD = USDT_TO_GOLD * DIAMOND_TO_USDT; // 1 Diamond = 875 Gold
export const EXCHANGE_FEE_PERCENT = 2; // 2% fee
export const GOLD_TO_THB = 0.183;      // 1 Gold ≈ 0.183 THB (display only)

export const EXCHANGE_PAIRS: ExchangeRate[] = [
  { from: 'coins', to: 'gems',  rate: 1 / DIAMOND_TO_GOLD, label: '🪙 Gold → 💎 Diamond' },
  { from: 'gems',  to: 'coins', rate: DIAMOND_TO_GOLD,     label: '💎 Diamond → 🪙 Gold' },
  { from: 'coins', to: 'usdt',  rate: 1 / USDT_TO_GOLD,    label: '🪙 Gold → 💵 USDT' },
  { from: 'usdt',  to: 'coins', rate: USDT_TO_GOLD,        label: '💵 USDT → 🪙 Gold' },
  { from: 'gems',  to: 'usdt',  rate: DIAMOND_TO_USDT,     label: '💎 Diamond → 💵 USDT' },
  { from: 'usdt',  to: 'gems',  rate: 1 / DIAMOND_TO_USDT, label: '💵 USDT → 💎 Diamond' },
];

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
  image: string; // card image path in public/cards/
  bonusDamage: number;
  rarity: RewardRarity;
  description: string;
}

export const AVAILABLE_CARDS: BoostCard[] = [
  { id: 'card-free-blast', name: 'Free Blast Ticket', icon: '🎟️', image: '/cards/card_01_free_blast_ticket.png', bonusDamage: 5, rarity: 'Common', description: 'Free Shot ×1' },
  { id: 'card-discount-coupon', name: 'Discount Coupon', icon: '🏷️', image: '/cards/card_02_discount_coupon.png', bonusDamage: 10, rarity: 'Rare', description: '50% OFF Shop' },
  { id: 'card-free-blast-epic', name: 'Free Blast Ticket ×10', icon: '🎫', image: '/cards/card_03_free_blast_ticket_epic.png', bonusDamage: 30, rarity: 'Legendary', description: 'Free Shot ×10' },
  { id: 'card-item-box', name: 'Free Item Box', icon: '📦', image: '/cards/card_04_free_item_box.png', bonusDamage: 15, rarity: 'Rare', description: 'Random Item ×1' },
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
  // Stats from gun_stats_design
  dmg: number;
  energy: number;
  durability: number;
  cooldownSec: number; // seconds
}

export const GUN_SKINS: GunSkin[] = [
  // --- COMMON ---
  { id: 'skin-vine-cannon', name: 'Vine Cannon', image: '/guns/gun_01_vine_cannon.png', rarity: 'Common', color: '#22c55e', glowColor: 'rgba(34,197,94,0.5)', dmg: 30, energy: 100, durability: 120, cooldownSec: 1.8 },
  { id: 'skin-kawaii-tank', name: 'Kawaii Tank', image: '/guns/gun_02_kawaii_tank.png', rarity: 'Common', color: '#f472b6', glowColor: 'rgba(244,114,182,0.5)', dmg: 20, energy: 120, durability: 80, cooldownSec: 1.2 },
  { id: 'skin-candy-tank', name: 'Candy Tank', image: '/guns/gun_03_candy_tank.png', rarity: 'Common', color: '#fb923c', glowColor: 'rgba(251,146,60,0.5)', dmg: 25, energy: 100, durability: 100, cooldownSec: 1.5 },
  // --- RARE ---
  { id: 'skin-dragon-cannon', name: 'Dragon Cannon', image: '/guns/gun_04_dragon_cannon.png', rarity: 'Rare', color: '#ef4444', glowColor: 'rgba(239,68,68,0.5)', dmg: 75, energy: 120, durability: 100, cooldownSec: 2.2 },
  { id: 'skin-crystal-fortress', name: 'Crystal Fortress', image: '/guns/gun_05_crystal_fortress.png', rarity: 'Rare', color: '#a78bfa', glowColor: 'rgba(167,139,250,0.5)', dmg: 45, energy: 100, durability: 180, cooldownSec: 2.5 },
  { id: 'skin-golden-knight', name: 'Golden Knight', image: '/guns/gun_06_golden_knight.png', rarity: 'Rare', color: '#fbbf24', glowColor: 'rgba(251,191,36,0.5)', dmg: 60, energy: 140, durability: 130, cooldownSec: 1.6 },
  { id: 'skin-mecha-turret', name: 'Mecha Turret', image: '/guns/gun_07_mecha_turret.png', rarity: 'Rare', color: '#38bdf8', glowColor: 'rgba(56,189,248,0.5)', dmg: 35, energy: 160, durability: 110, cooldownSec: 0.9 },
  { id: 'skin-ice-golem', name: 'Ice Golem', image: '/guns/gun_08_ice_golem.png', rarity: 'Rare', color: '#22d3ee', glowColor: 'rgba(34,211,238,0.5)', dmg: 50, energy: 110, durability: 160, cooldownSec: 1.8 },
  { id: 'skin-steampunk', name: 'Steampunk', image: '/guns/gun_09_steampunk.png', rarity: 'Rare', color: '#a16207', glowColor: 'rgba(161,98,7,0.5)', dmg: 65, energy: 150, durability: 120, cooldownSec: 1.4 },
  // --- LEGENDARY ---
  { id: 'skin-fire-demon', name: 'Fire Demon', image: '/guns/gun_10_fire_demon.png', rarity: 'Legendary', color: '#dc2626', glowColor: 'rgba(220,38,38,0.6)', dmg: 140, energy: 150, durability: 140, cooldownSec: 2.0 },
  { id: 'skin-ocean-beast', name: 'Ocean Beast', image: '/guns/gun_11_ocean_beast.png', rarity: 'Legendary', color: '#0ea5e9', glowColor: 'rgba(14,165,233,0.6)', dmg: 90, energy: 200, durability: 180, cooldownSec: 1.5 },
  { id: 'skin-shadow-cannon', name: 'Shadow Cannon', image: '/guns/gun_12_shadow_cannon.png', rarity: 'Legendary', color: '#7c3aed', glowColor: 'rgba(124,58,237,0.6)', dmg: 160, energy: 130, durability: 100, cooldownSec: 2.8 },
  { id: 'skin-neon-blaster', name: 'Neon Blaster', image: '/guns/gun_13_neon_blaster.png', rarity: 'Legendary', color: '#e879f9', glowColor: 'rgba(232,121,249,0.6)', dmg: 85, energy: 180, durability: 150, cooldownSec: 0.7 },
];

// ==========================================
// Marketplace System
// ==========================================

export type MarketCategory = 'guns' | 'cards' | 'ammo' | 'special';

export interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  image: string;
  icon: string;
  category: MarketCategory;
  rarity: RewardRarity;
  priceCoins: number;
  priceGems: number; // 0 = coins only
  stock: number; // -1 = unlimited
  isFeatured?: boolean;
  discount?: number; // percent off (e.g., 20 = 20% off)
}

export const MARKETPLACE_ITEMS: MarketplaceItem[] = [
  // --- GUNS ---
  { id: 'market-vine-cannon', name: 'Vine Cannon', description: 'Nature-powered cannon with balanced stats', image: '/guns/gun_01_vine_cannon.png', icon: '🌿', category: 'guns', rarity: 'Common', priceCoins: 500, priceGems: 0, stock: -1 },
  { id: 'market-kawaii-tank', name: 'Kawaii Tank', description: 'Cute but deadly! Fast reload speed', image: '/guns/gun_02_kawaii_tank.png', icon: '🎀', category: 'guns', rarity: 'Common', priceCoins: 450, priceGems: 0, stock: -1 },
  { id: 'market-candy-tank', name: 'Candy Tank', description: 'Sweet destruction with balanced power', image: '/guns/gun_03_candy_tank.png', icon: '🍬', category: 'guns', rarity: 'Common', priceCoins: 480, priceGems: 0, stock: -1 },
  { id: 'market-dragon-cannon', name: 'Dragon Cannon', description: 'Breathes fire! High damage dealer', image: '/guns/gun_04_dragon_cannon.png', icon: '🐲', category: 'guns', rarity: 'Rare', priceCoins: 2500, priceGems: 25, stock: 10 },
  { id: 'market-crystal-fortress', name: 'Crystal Fortress', description: 'Ultimate durability tank build', image: '/guns/gun_05_crystal_fortress.png', icon: '💎', category: 'guns', rarity: 'Rare', priceCoins: 2800, priceGems: 30, stock: 8 },
  { id: 'market-golden-knight', name: 'Golden Knight', description: 'Royal power with high energy reserves', image: '/guns/gun_06_golden_knight.png', icon: '👑', category: 'guns', rarity: 'Rare', priceCoins: 3200, priceGems: 35, stock: 5 },
  { id: 'market-mecha-turret', name: 'Mecha Turret', description: 'Fastest reload in the game!', image: '/guns/gun_07_mecha_turret.png', icon: '🤖', category: 'guns', rarity: 'Rare', priceCoins: 2600, priceGems: 28, stock: 7, discount: 10 },
  { id: 'market-ice-golem', name: 'Ice Golem', description: 'Frozen fortress with massive durability', image: '/guns/gun_08_ice_golem.png', icon: '🧊', category: 'guns', rarity: 'Rare', priceCoins: 2700, priceGems: 30, stock: 6 },
  { id: 'market-steampunk', name: 'Steampunk', description: 'Victorian-era power with fast cooldown', image: '/guns/gun_09_steampunk.png', icon: '⚙️', category: 'guns', rarity: 'Rare', priceCoins: 3000, priceGems: 32, stock: 5 },
  { id: 'market-fire-demon', name: 'Fire Demon', description: 'Demonic power unleashed! Top DMG', image: '/guns/gun_10_fire_demon.png', icon: '👹', category: 'guns', rarity: 'Legendary', priceCoins: 8000, priceGems: 80, stock: 3, isFeatured: true },
  { id: 'market-ocean-beast', name: 'Ocean Beast', description: 'Sea monster with massive energy pool', image: '/guns/gun_11_ocean_beast.png', icon: '🐙', category: 'guns', rarity: 'Legendary', priceCoins: 7500, priceGems: 75, stock: 3 },
  { id: 'market-shadow-cannon', name: 'Shadow Cannon', description: 'Highest DMG weapon in existence!', image: '/guns/gun_12_shadow_cannon.png', icon: '🌑', category: 'guns', rarity: 'Legendary', priceCoins: 9500, priceGems: 95, stock: 2, isFeatured: true },
  { id: 'market-neon-blaster', name: 'Neon Blaster', description: 'Blazing fast 0.7s reload!', image: '/guns/gun_13_neon_blaster.png', icon: '💜', category: 'guns', rarity: 'Legendary', priceCoins: 8500, priceGems: 85, stock: 2, discount: 15 },
  // --- CARDS ---
  { id: 'market-free-blast', name: 'Free Blast Ticket', description: 'Get 1 free shot! No energy cost', image: '/cards/card_01_free_blast_ticket.png', icon: '🎟️', category: 'cards', rarity: 'Common', priceCoins: 200, priceGems: 0, stock: -1 },
  { id: 'market-discount-coupon', name: 'Discount Coupon', description: '50% off next marketplace purchase', image: '/cards/card_02_discount_coupon.png', icon: '🏷️', category: 'cards', rarity: 'Rare', priceCoins: 1500, priceGems: 15, stock: 10, discount: 20 },
  { id: 'market-free-blast-epic', name: 'Free Blast ×10', description: '10 free shots! Best value pack', image: '/cards/card_03_free_blast_ticket_epic.png', icon: '🎫', category: 'cards', rarity: 'Legendary', priceCoins: 5000, priceGems: 50, stock: 5, isFeatured: true },
  { id: 'market-item-box', name: 'Free Item Box', description: 'Open for random rare items', image: '/cards/card_04_free_item_box.png', icon: '📦', category: 'cards', rarity: 'Rare', priceCoins: 1800, priceGems: 18, stock: 15 },
  // --- AMMO ---
  { id: 'market-ammo-basic-50', name: 'Basic Ammo ×50', description: 'Standard ammo bulk pack', image: '', icon: '🔵', category: 'ammo', rarity: 'Common', priceCoins: 100, priceGems: 0, stock: -1 },
  { id: 'market-ammo-heavy-25', name: 'Heavy Ammo ×25', description: 'Powerful shots for tough targets', image: '', icon: '🔴', category: 'ammo', rarity: 'Rare', priceCoins: 500, priceGems: 5, stock: -1 },
  { id: 'market-ammo-mega-10', name: 'Mega Ammo ×10', description: 'Devastating blasts for bosses', image: '', icon: '⚡', category: 'ammo', rarity: 'Legendary', priceCoins: 1200, priceGems: 12, stock: 20 },
  // --- SPECIAL ---
  { id: 'market-energy-refill', name: 'Energy Refill', description: 'Instantly restore full energy', image: '', icon: '⚡', category: 'special', rarity: 'Common', priceCoins: 300, priceGems: 0, stock: -1 },
  { id: 'market-repair-kit', name: 'Repair Kit', description: 'Restore gun durability to max', image: '', icon: '🔧', category: 'special', rarity: 'Common', priceCoins: 250, priceGems: 0, stock: -1 },
  { id: 'market-xp-boost', name: 'XP Boost ×2', description: 'Double XP for next 10 pops', image: '', icon: '✨', category: 'special', rarity: 'Rare', priceCoins: 800, priceGems: 8, stock: 10 },
  { id: 'market-lucky-charm', name: 'Lucky Charm', description: 'Increase legendary drop rate 2×', image: '', icon: '🍀', category: 'special', rarity: 'Rare', priceCoins: 1500, priceGems: 15, stock: 5 },
  { id: 'market-coin-magnet', name: 'Coin Magnet', description: 'Auto-collect double coins for 5 rounds', image: '', icon: '🧲', category: 'special', rarity: 'Rare', priceCoins: 1000, priceGems: 10, stock: 8, discount: 25 },
  { id: 'market-gem-pack', name: 'Gem Pack ×100', description: 'Premium gem bundle', image: '', icon: '💎', category: 'special', rarity: 'Legendary', priceCoins: 5000, priceGems: 0, stock: 3, isFeatured: true },
  { id: 'market-mystery-box', name: 'Mystery Box', description: 'Contains a random legendary item!', image: '', icon: '🎁', category: 'special', rarity: 'Legendary', priceCoins: 6000, priceGems: 60, stock: 2, isFeatured: true },
];

// ==========================================
// Inventory System
// ==========================================

export interface InventoryItem {
  id: string;
  itemId: string; // reference to MarketplaceItem or card/gun id
  name: string;
  image: string;
  icon: string;
  category: MarketCategory;
  rarity: RewardRarity;
  quantity: number;
  acquiredAt: number; // timestamp
  // Durability tracking (for guns)
  durability?: number;
  maxDurability?: number;
  // Description for tooltip / detail
  description?: string;
  // NFT Token ID (auto-generated)
  tokenId?: string;
  // Current listing price on marketplace (undefined = not listed)
  listedPrice?: number;
}

// ==========================================
// P2P Market Listing System
// ==========================================

export interface MarketListing {
  id: string;
  seller: string; // wallet address or username
  sellerAvatar: string;
  item: MarketplaceItem;
  priceCoins: number;
  listedAt: number;
  isOwnListing?: boolean;
}

// Sample P2P listings from other "players"
export const SAMPLE_LISTINGS: MarketListing[] = [
  { id: 'listing-1', seller: '0xAb3...f21', sellerAvatar: '🦊', item: MARKETPLACE_ITEMS[9], priceCoins: 7200, listedAt: Date.now() - 3600000 },
  { id: 'listing-2', seller: '0x7Fc...d82', sellerAvatar: '🐺', item: MARKETPLACE_ITEMS[12], priceCoins: 7800, listedAt: Date.now() - 7200000 },
  { id: 'listing-3', seller: '0xE14...a09', sellerAvatar: '🦁', item: MARKETPLACE_ITEMS[13], priceCoins: 150, listedAt: Date.now() - 1800000 },
  { id: 'listing-4', seller: '0x9B2...c44', sellerAvatar: '🐉', item: MARKETPLACE_ITEMS[3], priceCoins: 2200, listedAt: Date.now() - 5400000 },
  { id: 'listing-5', seller: '0xD87...e15', sellerAvatar: '🦅', item: MARKETPLACE_ITEMS[16], priceCoins: 4200, listedAt: Date.now() - 900000 },
  { id: 'listing-6', seller: '0x3A1...b77', sellerAvatar: '🐸', item: MARKETPLACE_ITEMS[17], priceCoins: 1600, listedAt: Date.now() - 10800000 },
  { id: 'listing-7', seller: '0xF56...d33', sellerAvatar: '🦇', item: MARKETPLACE_ITEMS[10], priceCoins: 6800, listedAt: Date.now() - 2700000 },
  { id: 'listing-8', seller: '0x2C9...a61', sellerAvatar: '🐙', item: MARKETPLACE_ITEMS[15], priceCoins: 1300, listedAt: Date.now() - 14400000 },
];
