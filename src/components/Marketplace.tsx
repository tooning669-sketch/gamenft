'use client';

import React, { useState, useCallback } from 'react';
import {
  MarketplaceItem,
  MarketCategory,
  MARKETPLACE_ITEMS,
  PlayerState,
} from '@/lib/gameTypes';
import { getRarityColor } from '@/lib/gameUtils';
import { playClickSound, playRewardSound } from './SoundManager';

interface MarketplaceProps {
  player: PlayerState;
  onPurchase: (item: MarketplaceItem, currency: 'coins' | 'gems') => void;
}

const CATEGORIES: { key: MarketCategory; label: string; icon: string }[] = [
  { key: 'guns', label: 'Weapons', icon: '🔫' },
  { key: 'cards', label: 'Cards', icon: '🃏' },
  { key: 'ammo', label: 'Ammo', icon: '💣' },
  { key: 'special', label: 'Special', icon: '✨' },
];

export default function Marketplace({ player, onPurchase }: MarketplaceProps) {
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory>('guns');
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
  const [showPurchaseAnim, setShowPurchaseAnim] = useState<string | null>(null);
  const [stockMap, setStockMap] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    MARKETPLACE_ITEMS.forEach((item) => {
      map[item.id] = item.stock;
    });
    return map;
  });

  const filteredItems = MARKETPLACE_ITEMS.filter((item) => item.category === selectedCategory);
  const featuredItems = MARKETPLACE_ITEMS.filter((item) => item.isFeatured);

  const getDiscountedPrice = useCallback((price: number, discount?: number) => {
    if (!discount) return price;
    return Math.floor(price * (1 - discount / 100));
  }, []);

  const canAfford = useCallback(
    (item: MarketplaceItem, currency: 'coins' | 'gems') => {
      if (currency === 'gems') {
        return item.priceGems > 0 && player.gems >= item.priceGems;
      }
      const price = getDiscountedPrice(item.priceCoins, item.discount);
      return player.coins >= price;
    },
    [player, getDiscountedPrice]
  );

  const handleBuy = useCallback(
    (item: MarketplaceItem, currency: 'coins' | 'gems') => {
      if (!canAfford(item, currency)) return;
      if (stockMap[item.id] === 0) return;

      playClickSound();
      playRewardSound(item.rarity === 'Legendary');

      // Decrease stock
      if (stockMap[item.id] > 0) {
        setStockMap((prev) => ({ ...prev, [item.id]: prev[item.id] - 1 }));
      }

      // Mark as purchased for animation
      setPurchasedIds((prev) => new Set(prev).add(item.id));
      setShowPurchaseAnim(item.id);
      setTimeout(() => setShowPurchaseAnim(null), 1500);

      onPurchase(item, currency);
    },
    [canAfford, stockMap, onPurchase]
  );

  return (
    <div className="flex flex-col gap-4 sm:gap-6 max-w-5xl mx-auto">
      {/* Marketplace Header */}
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400">
          🏪 MARKETPLACE
        </h2>
        <p className="text-[11px] text-slate-500 mt-1">Buy weapons, cards, and items to power up!</p>
      </div>

      {/* Balance Bar */}
      <div
        className="flex items-center justify-center gap-4 sm:gap-6 py-2 px-4 rounded-xl mx-auto"
        style={{
          background: 'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,41,59,0.7))',
          border: '1px solid rgba(99,102,241,0.2)',
        }}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-lg">🪙</span>
          <span className="text-sm font-bold text-yellow-400">{player.coins.toLocaleString()}</span>
        </div>
        <div className="w-px h-5 bg-slate-700" />
        <div className="flex items-center gap-1.5">
          <span className="text-lg">💎</span>
          <span className="text-sm font-bold text-cyan-400">{player.gems.toLocaleString()}</span>
        </div>
      </div>

      {/* Featured Banner */}
      {featuredItems.length > 0 && (
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(234,179,8,0.1), rgba(168,85,247,0.08), rgba(239,68,68,0.06))',
            border: '1px solid rgba(234,179,8,0.3)',
          }}
        >
          <div className="flex items-center gap-2 px-4 py-2 border-b" style={{ borderColor: 'rgba(234,179,8,0.2)' }}>
            <span className="text-sm">⭐</span>
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Featured Items</span>
          </div>
          <div className="flex gap-3 p-3 overflow-x-auto custom-scrollbar">
            {featuredItems.map((item) => {
              const rarityColor = getRarityColor(item.rarity);
              return (
                <div
                  key={`featured-${item.id}`}
                  className="flex-shrink-0 w-[140px] flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all hover:scale-105 cursor-pointer"
                  onClick={() => {
                    setSelectedCategory(item.category);
                  }}
                  style={{
                    background: `linear-gradient(135deg, ${rarityColor}12, ${rarityColor}05)`,
                    border: `1px solid ${rarityColor}30`,
                  }}
                >
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-14 h-14 object-contain" />
                  ) : (
                    <span className="text-3xl">{item.icon}</span>
                  )}
                  <span className="text-[10px] font-bold text-white truncate max-w-full">{item.name}</span>
                  <span className="text-[9px] font-bold text-yellow-400">🪙 {item.priceCoins.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex gap-2 justify-center flex-wrap">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.key;
          const count = MARKETPLACE_ITEMS.filter((i) => i.category === cat.key).length;
          return (
            <button
              key={cat.key}
              onClick={() => {
                playClickSound();
                setSelectedCategory(cat.key);
              }}
              className={`
                flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider
                transition-all cursor-pointer hover:scale-105 active:scale-95
              `}
              style={{
                background: isActive
                  ? 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(99,102,241,0.1))'
                  : 'rgba(15,23,42,0.6)',
                border: isActive
                  ? '1px solid rgba(99,102,241,0.5)'
                  : '1px solid rgba(100,116,139,0.2)',
                color: isActive ? '#a5b4fc' : '#94a3b8',
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span
                className="ml-1 px-1.5 py-0.5 rounded-full text-[9px]"
                style={{
                  background: isActive ? 'rgba(99,102,241,0.3)' : 'rgba(100,116,139,0.2)',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredItems.map((item) => {
          const rarityColor = getRarityColor(item.rarity);
          const stock = stockMap[item.id];
          const isOutOfStock = stock === 0;
          const discountedCoins = getDiscountedPrice(item.priceCoins, item.discount);
          const isPurchaseAnim = showPurchaseAnim === item.id;

          return (
            <div
              key={item.id}
              className={`
                relative rounded-xl overflow-hidden transition-all duration-300
                ${isPurchaseAnim ? 'animate-bounce-once' : ''}
                ${isOutOfStock ? 'opacity-50' : 'hover:scale-[1.02]'}
              `}
              style={{
                background: 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.8))',
                border: `1px solid ${rarityColor}30`,
                boxShadow: item.isFeatured ? `0 0 20px ${rarityColor}15` : 'none',
              }}
            >
              {/* Discount badge */}
              {item.discount && !isOutOfStock && (
                <div
                  className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full text-[10px] font-black"
                  style={{
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    boxShadow: '0 2px 8px rgba(239,68,68,0.4)',
                  }}
                >
                  -{item.discount}%
                </div>
              )}

              {/* Out of stock overlay */}
              {isOutOfStock && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 rounded-xl">
                  <span className="text-sm font-black text-rose-400 uppercase tracking-wider">Sold Out</span>
                </div>
              )}

              {/* Card content */}
              <div className="flex gap-3 p-3">
                {/* Image / Icon */}
                <div
                  className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-xl"
                  style={{
                    background: `radial-gradient(circle, ${rarityColor}12, transparent)`,
                    border: `1px solid ${rarityColor}20`,
                  }}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
                    />
                  ) : (
                    <span className="text-3xl sm:text-4xl">{item.icon}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white truncate">{item.name}</h3>
                    <span
                      className="flex-shrink-0 text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase"
                      style={{
                        color: rarityColor,
                        background: `${rarityColor}15`,
                        border: `1px solid ${rarityColor}25`,
                      }}
                    >
                      {item.rarity}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{item.description}</p>

                  {/* Stock */}
                  {stock !== -1 && (
                    <div className="mt-1">
                      <span className="text-[9px] text-slate-500">
                        Stock: <span className={stock <= 3 ? 'text-rose-400 font-bold' : 'text-slate-400'}>{stock}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Price & Buy section */}
              <div
                className="flex items-center justify-between px-3 py-2 border-t"
                style={{ borderColor: `${rarityColor}15` }}
              >
                {/* Prices */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="text-xs">🪙</span>
                    {item.discount ? (
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-500 line-through">{item.priceCoins}</span>
                        <span className="text-xs font-bold text-yellow-400">{discountedCoins}</span>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-yellow-400">{item.priceCoins.toLocaleString()}</span>
                    )}
                  </div>
                  {item.priceGems > 0 && (
                    <>
                      <span className="text-[10px] text-slate-600">or</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs">💎</span>
                        <span className="text-xs font-bold text-cyan-400">{item.priceGems}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Buy buttons */}
                <div className="flex items-center gap-1.5">
                  {/* Buy with coins */}
                  <button
                    onClick={() => handleBuy(item, 'coins')}
                    disabled={isOutOfStock || !canAfford(item, 'coins')}
                    className={`
                      px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider
                      transition-all cursor-pointer
                      ${
                        !isOutOfStock && canAfford(item, 'coins')
                          ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-400 border border-yellow-500/30 hover:scale-105 active:scale-95 hover:from-yellow-500/30 hover:to-amber-500/30'
                          : 'bg-slate-800/50 text-slate-600 border border-slate-700/30 cursor-not-allowed'
                      }
                    `}
                  >
                    🪙 Buy
                  </button>

                  {/* Buy with gems */}
                  {item.priceGems > 0 && (
                    <button
                      onClick={() => handleBuy(item, 'gems')}
                      disabled={isOutOfStock || !canAfford(item, 'gems')}
                      className={`
                        px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider
                        transition-all cursor-pointer
                        ${
                          !isOutOfStock && canAfford(item, 'gems')
                            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 hover:scale-105 active:scale-95 hover:from-cyan-500/30 hover:to-blue-500/30'
                            : 'bg-slate-800/50 text-slate-600 border border-slate-700/30 cursor-not-allowed'
                        }
                      `}
                    >
                      💎 Buy
                    </button>
                  )}
                </div>
              </div>

              {/* Purchase success overlay */}
              {isPurchaseAnim && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-green-500/10 rounded-xl animate-slide-in">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/20 border border-green-500/40">
                    <span className="text-lg">✅</span>
                    <span className="text-sm font-bold text-green-400">Purchased!</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
