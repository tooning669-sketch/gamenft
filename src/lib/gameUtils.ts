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
// Grid Generation
// ==========================================

let ballIdCounter = 0;

export function generateGrid(): Ball[] {
  const balls: Ball[] = [];
  ballIdCounter = 0;

  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const tier = randomTier(row);
      const config = TIER_CONFIG[tier];
      const colorSet = config.colors[Math.floor(Math.random() * config.colors.length)];

      balls.push({
        id: `ball-${ballIdCounter++}`,
        row,
        col,
        hp: config.hp,
        maxHp: config.hp,
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
  const items = REWARD_ITEMS[rarity];
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
  const rates = DROP_RATES[tier];
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
