import db from './db';
import {
  GRID_ROWS, GRID_COLS, AMMO_TYPES, GUN_SKINS,
  AVAILABLE_CARDS, MARKETPLACE_ITEMS, REWARD_ITEMS,
  DROP_RATES, TIER_CONFIG,
  USDT_TO_GOLD, DIAMOND_TO_USDT, EXCHANGE_FEE_PERCENT, GOLD_TO_THB,
} from './gameTypes';

// Default configs derived from hardcoded constants
const DEFAULTS: Record<string, unknown> = {
  game_settings: {
    gridRows: GRID_ROWS,
    gridCols: GRID_COLS,
    roundTimer: 30,
    startCost: 500,
    maxRoundsPerGun: 4,
    energyCooldownHours: 4,
  },
  ball_tiers: {
    1: { hp: TIER_CONFIG[1].hp, colors: TIER_CONFIG[1].colors },
    2: { hp: TIER_CONFIG[2].hp, colors: TIER_CONFIG[2].colors },
    3: { hp: TIER_CONFIG[3].hp, colors: TIER_CONFIG[3].colors },
  },
  drop_rates: DROP_RATES,
  rewards: REWARD_ITEMS,
  exchange: {
    usdtToGold: USDT_TO_GOLD,
    diamondToUsdt: DIAMOND_TO_USDT,
    feePercent: EXCHANGE_FEE_PERCENT,
    goldToThb: GOLD_TO_THB,
  },
  guns: GUN_SKINS,
  cards: AVAILABLE_CARDS,
  marketplace: MARKETPLACE_ITEMS,
  ammo: AMMO_TYPES,
};

export async function initDatabase() {
  // Create config table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS game_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Seed defaults if empty
  for (const [key, value] of Object.entries(DEFAULTS)) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO game_config (key, value) VALUES (?, ?)`,
      args: [key, JSON.stringify(value)],
    });
  }
}

export async function getConfig(key: string): Promise<unknown | null> {
  const result = await db.execute({
    sql: `SELECT value FROM game_config WHERE key = ?`,
    args: [key],
  });
  if (result.rows.length === 0) return null;
  return JSON.parse(result.rows[0].value as string);
}

export async function getAllConfig(): Promise<Record<string, unknown>> {
  const result = await db.execute(`SELECT key, value FROM game_config`);
  const config: Record<string, unknown> = {};
  for (const row of result.rows) {
    config[row.key as string] = JSON.parse(row.value as string);
  }
  return config;
}

export async function setConfig(key: string, value: unknown): Promise<void> {
  await db.execute({
    sql: `INSERT OR REPLACE INTO game_config (key, value, updated_at) VALUES (?, ?, datetime('now'))`,
    args: [key, JSON.stringify(value)],
  });
}
