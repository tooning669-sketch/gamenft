import {
  Ball,
  Tier,
  Reward,
  RewardRarity,
  GRID_ROWS,
  GRID_COLS,
  TIER_CONFIG,
  DROP_RATES,
  REWARD_ITEMS,
  RewardItemDef,
} from './gameTypes';

// ==========================================
// Dynamic Game Config (from DB)
// ==========================================

/** Runtime config fetched from Turso DB — overrides hardcoded defaults */
export interface GameConfig {
  game_settings?: {
    gridRows?: number;
    gridCols?: number;
    roundTimer?: number;
    startCost?: number;
    maxRoundsPerGun?: number;
    energyCooldownHours?: number;
  };
  ball_tiers?: Record<string, { hp: number; colors: { color: string; from: string; to: string }[] }>;
  drop_rates?: Record<string, { Common: number; Rare: number; Legendary: number }>;
  rewards?: Record<string, RewardItemDef[]>;
  guns?: unknown[];
  ammo?: unknown[];
  cards?: unknown[];
  marketplace?: unknown[];
  exchange?: {
    usdtToGold?: number;
    diamondToUsdt?: number;
    feePercent?: number;
    goldToThb?: number;
  };
}

// Global config — set once on load
let _cfg: GameConfig = {};

export function setGameConfig(cfg: GameConfig) {
  _cfg = cfg;
}

export function getGameConfig(): GameConfig {
  return _cfg;
}

// ==========================================
// Config-aware helpers
// ==========================================

function getGridRows(): number {
  return _cfg.game_settings?.gridRows ?? GRID_ROWS;
}

function getGridCols(): number {
  return _cfg.game_settings?.gridCols ?? GRID_COLS;
}

function getTierHp(tier: Tier): number {
  const bt = _cfg.ball_tiers;
  if (bt && bt[String(tier)]) return bt[String(tier)].hp;
  return TIER_CONFIG[tier].hp;
}

function getTierColors(tier: Tier): { color: string; from: string; to: string }[] {
  const bt = _cfg.ball_tiers;
  if (bt && bt[String(tier)]?.colors) return bt[String(tier)].colors;
  return TIER_CONFIG[tier].colors;
}

function getDropRates(tier: Tier): { Common: number; Rare: number; Legendary: number } {
  const dr = _cfg.drop_rates;
  if (dr && dr[String(tier)]) return dr[String(tier)];
  return DROP_RATES[tier];
}

function getRewardItems(rarity: RewardRarity): RewardItemDef[] {
  const ri = _cfg.rewards;
  if (ri && ri[rarity]) return ri[rarity];
  return REWARD_ITEMS[rarity];
}

// ==========================================
// Grid Generation
// ==========================================

let ballIdCounter = 0;

export function generateGrid(): Ball[] {
  const balls: Ball[] = [];
  ballIdCounter = 0;

  const rows = getGridRows();
  const cols = getGridCols();

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const tier = randomTier(row);
      const hp = getTierHp(tier);
      const colors = getTierColors(tier);
      const colorSet = colors[Math.floor(Math.random() * colors.length)];

      balls.push({
        id: `ball-${ballIdCounter++}`,
        row,
        col,
        hp,
        maxHp: hp,
        tier,
        color: colorSet.color,
        gradientFrom: colorSet.from,
        gradientTo: colorSet.to,
        isPopping: false,
        isHit: false,
      });
    }
  }

  return balls;
}

// Weighted tier distribution: top rows have harder balls
function randomTier(row: number): Tier {
  const rand = Math.random();
  if (row <= 1) {
    // Top 2 rows: more Tier 3
    if (rand < 0.35) return 3;
    if (rand < 0.70) return 2;
    return 1;
  } else if (row <= 3) {
    // Middle rows: balanced
    if (rand < 0.15) return 3;
    if (rand < 0.50) return 2;
    return 1;
  } else {
    // Bottom rows: more Tier 1
    if (rand < 0.08) return 3;
    if (rand < 0.30) return 2;
    return 1;
  }
}

// ==========================================
// Damage Calculation
// ==========================================

export function applyDamage(ball: Ball, damage: number): Ball {
  const newHp = Math.max(0, ball.hp - damage);
  return {
    ...ball,
    hp: newHp,
    isHit: true,
    isPopping: newHp <= 0,
  };
}

// ==========================================
// Reward Rolling
// ==========================================

let rewardIdCounter = 0;

/** Roll a random amount between min and max (inclusive). Respects decimals for BTC. */
function rollAmount(item: RewardItemDef): number {
  const min = item.min ?? 0;
  const max = item.max ?? 0;
  const decimals = item.decimals ?? 0;
  if (decimals > 0) {
    // For BTC: random float with precision
    const val = min + Math.random() * (max - min);
    return parseFloat(val.toFixed(decimals));
  }
  // For coins/gems/usdt: random integer
  return Math.floor(min + Math.random() * (max - min + 1));
}

export function rollReward(tier: Tier): Reward {
  const rarity = rollRarity(tier);
  const items = getRewardItems(rarity);
  const item = items[Math.floor(Math.random() * items.length)];

  // Handle currency-type rewards with random amounts
  if (item.currency && item.min != null && item.max != null) {
    const amount = rollAmount(item);
    const decimals = item.decimals ?? 0;
    const displayAmount = decimals > 0 ? amount.toFixed(decimals) : amount.toString();
    return {
      id: `reward-${rewardIdCounter++}`,
      name: `${displayAmount} ${item.name}`,
      rarity,
      icon: item.icon,
      description: item.description,
      timestamp: Date.now(),
      ballTier: tier,
      currency: item.currency,
      amount,
    };
  }

  return {
    id: `reward-${rewardIdCounter++}`,
    name: item.name,
    rarity,
    icon: item.icon,
    description: item.description,
    timestamp: Date.now(),
    ballTier: tier,
  };
}

function rollRarity(tier: Tier): RewardRarity {
  const rates = getDropRates(tier);
  const rand = Math.random();

  if (rand < rates.Legendary) return 'Legendary';
  if (rand < rates.Legendary + rates.Rare) return 'Rare';
  return 'Common';
}

// ==========================================
// Utility Helpers
// ==========================================

export function getTierLabel(tier: Tier): string {
  switch (tier) {
    case 1: return 'Tier I';
    case 2: return 'Tier II';
    case 3: return 'Tier III';
  }
}

export function getRarityColor(rarity: RewardRarity): string {
  switch (rarity) {
    case 'Common': return '#9ca3af';
    case 'Rare': return '#818cf8';
    case 'Legendary': return '#fbbf24';
  }
}

export function getRarityGlow(rarity: RewardRarity): string {
  switch (rarity) {
    case 'Common': return '0 0 10px rgba(156, 163, 175, 0.3)';
    case 'Rare': return '0 0 15px rgba(129, 140, 248, 0.5)';
    case 'Legendary': return '0 0 20px rgba(251, 191, 36, 0.6), 0 0 40px rgba(251, 191, 36, 0.3)';
  }
}

export function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
