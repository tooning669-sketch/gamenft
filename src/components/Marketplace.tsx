'use client';

import React, { useState, useCallback } from 'react';
import {
  MarketplaceItem,
  MarketCategory,
  MarketListing,
  InventoryItem,
  MARKETPLACE_ITEMS,
  SAMPLE_LISTINGS,
  PlayerState,
} from '@/lib/gameTypes';
import { getRarityColor } from '@/lib/gameUtils';
import { playClickSound, playRewardSound } from './SoundManager';

interface MarketplaceProps {
  player: PlayerState;
  inventory: InventoryItem[];
  onBuyFromShop: (item: MarketplaceItem, currency: 'coins' | 'gems') => void;
  onBuyFromPlayer: (listing: MarketListing) => void;
  onListForSale: (item: InventoryItem, price: number) => void;
}

type MarketView = 'shop' | 'p2p' | 'sell';

const CATEGORIES: { key: MarketCategory | 'all'; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: '🏪' },
  { key: 'guns', label: 'Weapons', icon: '🔫' },
  { key: 'cards', label: 'Cards', icon: '🃏' },
  { key: 'ammo', label: 'Ammo', icon: '💣' },
  { key: 'special', label: 'Special', icon: '✨' },
];

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Marketplace({ player, inventory, onBuyFromShop, onBuyFromPlayer, onListForSale }: MarketplaceProps) {
  const [view, setView] = useState<MarketView>('shop');
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory | 'all'>('all');
  const [listings, setListings] = useState<MarketListing[]>(SAMPLE_LISTINGS);
  const [showPurchaseAnim, setShowPurchaseAnim] = useState<string | null>(null);
  const [sellPrice, setSellPrice] = useState<Record<string, number>>({});
  const [shopPage, setShopPage] = useState(0);
  const [detailItem, setDetailItem] = useState<MarketplaceItem | null>(null);
  const ITEMS_PER_PAGE = 12;
  const [stockMap, setStockMap] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    MARKETPLACE_ITEMS.forEach((item) => { map[item.id] = item.stock; });
    return map;
  });

  const getDiscountedPrice = useCallback((price: number, discount?: number) => {
    if (!discount) return price;
    return Math.floor(price * (1 - discount / 100));
  }, []);

  const canAfford = useCallback((priceCoins: number) => player.coins >= priceCoins, [player.coins]);

  // Shop items
  const allFilteredShop = selectedCategory === 'all'
    ? MARKETPLACE_ITEMS
    : MARKETPLACE_ITEMS.filter((i) => i.category === selectedCategory);
  const totalPages = Math.ceil(allFilteredShop.length / ITEMS_PER_PAGE);
  const filteredShop = allFilteredShop.slice(shopPage * ITEMS_PER_PAGE, (shopPage + 1) * ITEMS_PER_PAGE);

  // P2P listings
  const filteredListings = selectedCategory === 'all'
    ? listings
    : listings.filter((l) => l.item.category === selectedCategory);

  const handleShopBuy = useCallback((item: MarketplaceItem, currency: 'coins' | 'gems') => {
    const price = currency === 'coins' ? getDiscountedPrice(item.priceCoins, item.discount) : item.priceGems;
    if (currency === 'coins' && player.coins < price) return;
    if (currency === 'gems' && player.gems < price) return;
    if (stockMap[item.id] === 0) return;

    playClickSound();
    playRewardSound(item.rarity === 'Legendary');
    if (stockMap[item.id] > 0) setStockMap((prev) => ({ ...prev, [item.id]: prev[item.id] - 1 }));
    setShowPurchaseAnim(item.id);
    setTimeout(() => setShowPurchaseAnim(null), 1500);
    onBuyFromShop(item, currency);
  }, [player, stockMap, getDiscountedPrice, onBuyFromShop]);

  const handleP2PBuy = useCallback((listing: MarketListing) => {
    if (!canAfford(listing.priceCoins)) return;
    playClickSound();
    playRewardSound(listing.item.rarity === 'Legendary');
    setListings((prev) => prev.filter((l) => l.id !== listing.id));
    setShowPurchaseAnim(listing.id);
    setTimeout(() => setShowPurchaseAnim(null), 1500);
    onBuyFromPlayer(listing);
  }, [canAfford, onBuyFromPlayer]);

  const handleListForSale = useCallback((item: InventoryItem) => {
    const price = sellPrice[item.id] || item.listedPrice || 0;
    if (price <= 0) return;
    playClickSound();
    onListForSale(item, price);

    // Check if we already have a listing for this item
    const existingListing = listings.find((l) => l.isOwnListing && l.item.id === item.itemId);
    if (existingListing) {
      // Update existing listing price
      setListings((prev) => prev.map((l) =>
        l.id === existingListing.id
          ? { ...l, priceCoins: price, item: { ...l.item, priceCoins: price } }
          : l
      ));
    } else {
      // Create new listing
      const newListing: MarketListing = {
        id: `own-${Date.now()}`,
        seller: '0x8F...7a3B',
        sellerAvatar: '👤',
        item: {
          id: item.itemId,
          name: item.name,
          description: item.description || '',
          image: item.image,
          icon: item.icon,
          category: item.category,
          rarity: item.rarity,
          priceCoins: price,
          priceGems: 0,
          stock: 1,
        },
        priceCoins: price,
        listedAt: Date.now(),
        isOwnListing: true,
      };
      setListings((prev) => [newListing, ...prev]);
    }
    setSellPrice((prev) => ({ ...prev, [item.id]: 0 }));
  }, [sellPrice, onListForSale, listings]);

  return (
    <div className="flex flex-col gap-4 sm:gap-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400">
          🏪 MARKETPLACE
        </h2>
        <p className="text-[11px] text-slate-500 mt-1">Buy from shop, trade with players, or sell your items</p>
      </div>

      {/* Balance Bar */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 py-2 px-4 rounded-xl mx-auto"
        style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,41,59,0.7))', border: '1px solid rgba(99,102,241,0.2)' }}>
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

      {/* View Tabs: Shop / Player Market / Sell */}
      <div className="flex gap-2 justify-center">
        {([
          { key: 'shop' as const, label: '🏬 Official Shop', desc: 'Buy from game' },
          { key: 'p2p' as const, label: '🤝 Player Market', desc: 'Buy from players' },
          { key: 'sell' as const, label: '💰 Sell Items', desc: 'List your items' },
        ]).map((tab) => {
          const isActive = view === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => { playClickSound(); setView(tab.key); }}
              className="flex flex-col items-center gap-0.5 px-4 sm:px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer hover:scale-105 active:scale-95"
              style={{
                background: isActive ? 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(99,102,241,0.08))' : 'rgba(15,23,42,0.6)',
                border: isActive ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(100,116,139,0.2)',
                color: isActive ? '#a5b4fc' : '#94a3b8',
              }}
            >
              <span className="text-sm">{tab.label}</span>
              <span className="text-[8px] font-normal opacity-60">{tab.desc}</span>
            </button>
          );
        })}
      </div>

      {/* Category filter (for shop & p2p) */}
      {view !== 'sell' && (
        <div className="flex gap-2 justify-center flex-wrap">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.key;
            return (
              <button key={cat.key}
                onClick={() => { playClickSound(); setSelectedCategory(cat.key); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer hover:scale-105 active:scale-95"
                style={{
                  background: isActive ? 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(99,102,241,0.1))' : 'rgba(15,23,42,0.5)',
                  border: isActive ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(100,116,139,0.15)',
                  color: isActive ? '#a5b4fc' : '#94a3b8',
                }}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ===== SHOP VIEW ===== */}
      {view === 'shop' && (
        <>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredShop.map((item) => {
            const rarityColor = getRarityColor(item.rarity);
            const stock = stockMap[item.id];
            const isOutOfStock = stock === 0;
            const discountedCoins = getDiscountedPrice(item.priceCoins, item.discount);
            const isPurchaseAnim = showPurchaseAnim === item.id;

            return (
              <div key={item.id}
                className={`relative rounded-xl overflow-hidden transition-all duration-300 ${isPurchaseAnim ? 'scale-[1.03]' : ''} ${isOutOfStock ? 'opacity-50' : 'hover:scale-[1.02]'}`}
                style={{
                  background: 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.8))',
                  border: `1px solid ${rarityColor}30`,
                  boxShadow: item.isFeatured ? `0 0 20px ${rarityColor}15` : 'none',
                }}
              >
                {item.discount && !isOutOfStock && (
                  <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full text-[10px] font-black"
                    style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white' }}>-{item.discount}%</div>
                )}
                {isOutOfStock && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 rounded-xl">
                    <span className="text-sm font-black text-rose-400 uppercase">Sold Out</span>
                  </div>
                )}

                <div className="p-2 cursor-pointer" onClick={() => setDetailItem(item)}>
                  <div className="w-full aspect-square flex items-center justify-center rounded-xl mb-2"
                    style={{ background: `radial-gradient(circle, ${rarityColor}12, transparent)`, border: `1px solid ${rarityColor}20` }}>
                    {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2" />
                      : <span className="text-3xl sm:text-4xl">{item.icon}</span>}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white truncate">{item.name}</h3>
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase"
                      style={{ color: rarityColor, background: `${rarityColor}15`, border: `1px solid ${rarityColor}25` }}>{item.rarity}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between px-3 py-2 border-t" style={{ borderColor: `${rarityColor}15` }}>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span className="text-xs">🪙</span>
                      {item.discount ? (
                        <><span className="text-[10px] text-slate-500 line-through">{item.priceCoins}</span>
                          <span className="text-xs font-bold text-yellow-400">{discountedCoins}</span></>
                      ) : <span className="text-xs font-bold text-yellow-400">{item.priceCoins.toLocaleString()}</span>}
                    </div>
                    {item.priceGems > 0 && (
                      <><span className="text-[10px] text-slate-600">or</span>
                        <div className="flex items-center gap-1"><span className="text-xs">💎</span>
                          <span className="text-xs font-bold text-cyan-400">{item.priceGems}</span></div></>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => handleShopBuy(item, 'coins')} disabled={isOutOfStock || player.coins < discountedCoins}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${!isOutOfStock && player.coins >= discountedCoins ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-400 border border-yellow-500/30 hover:scale-105 active:scale-95' : 'bg-slate-800/50 text-slate-600 border border-slate-700/30 cursor-not-allowed'}`}>
                      🪙 Buy
                    </button>
                    {item.priceGems > 0 && (
                      <button onClick={() => handleShopBuy(item, 'gems')} disabled={isOutOfStock || player.gems < item.priceGems}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${!isOutOfStock && player.gems >= item.priceGems ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 hover:scale-105 active:scale-95' : 'bg-slate-800/50 text-slate-600 border border-slate-700/30 cursor-not-allowed'}`}>
                        💎 Buy
                      </button>
                    )}
                  </div>
                </div>

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
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-4">
            <button onClick={() => { playClickSound(); setShopPage(p => Math.max(0, p-1)); }} disabled={shopPage === 0}
              className="px-4 py-2 rounded-lg text-xs font-bold text-pink-300 bg-pink-500/10 border border-pink-500/30 hover:bg-pink-500/20 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">← Prev</button>
            <span className="text-xs text-slate-400 font-mono">{shopPage + 1} / {totalPages}</span>
            <button onClick={() => { playClickSound(); setShopPage(p => Math.min(totalPages-1, p+1)); }} disabled={shopPage >= totalPages-1}
              className="px-4 py-2 rounded-lg text-xs font-bold text-pink-300 bg-pink-500/10 border border-pink-500/30 hover:bg-pink-500/20 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">Next →</button>
          </div>
        )}
        </>
      )}

      {/* ===== P2P PLAYER MARKET VIEW ===== */}
      {view === 'p2p' && (
        <div className="space-y-3">
          {filteredListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-xl"
              style={{ background: 'rgba(15,23,42,0.5)', border: '1px dashed rgba(100,116,139,0.3)' }}>
              <span className="text-4xl">🤝</span>
              <span className="text-sm text-slate-500 font-semibold">No listings available</span>
            </div>
          ) : (
            filteredListings.map((listing) => {
              const item = listing.item;
              const rarityColor = getRarityColor(item.rarity);
              const isPurchaseAnim = showPurchaseAnim === listing.id;
              return (
                <div key={listing.id}
                  className={`relative rounded-xl overflow-hidden transition-all duration-300 ${isPurchaseAnim ? 'scale-[1.02]' : 'hover:scale-[1.01]'}`}
                  style={{
                    background: listing.isOwnListing
                      ? 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(34,197,94,0.05))'
                      : 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.8))',
                    border: listing.isOwnListing ? '1px solid rgba(34,197,94,0.3)' : `1px solid ${rarityColor}20`,
                  }}
                >
                  <div className="flex items-center gap-3 p-3">
                    {/* Seller info */}
                    <div className="flex flex-col items-center gap-0.5 min-w-[50px]">
                      <span className="text-2xl">{listing.sellerAvatar}</span>
                      <span className="text-[8px] text-slate-500 font-mono">{listing.seller}</span>
                      <span className="text-[8px] text-slate-600">{timeAgo(listing.listedAt)}</span>
                    </div>

                    <div className="w-px h-12 bg-slate-700/50" />

                    {/* Item */}
                    <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-lg"
                      style={{ background: `radial-gradient(circle, ${rarityColor}10, transparent)` }}>
                      {item.image ? <img src={item.image} alt={item.name} className="w-12 h-12 object-contain" />
                        : <span className="text-2xl">{item.icon}</span>}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white truncate">{item.name}</span>
                        <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase"
                          style={{ color: rarityColor, background: `${rarityColor}15`, border: `1px solid ${rarityColor}25` }}>{item.rarity}</span>
                        {listing.isOwnListing && (
                          <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold bg-green-500/20 text-green-400 border border-green-500/30">YOUR LISTING</span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">{item.description || item.category}</p>
                    </div>

                    {/* Price & Buy */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <span className="text-sm">🪙</span>
                          <span className="text-base font-black text-yellow-400">{listing.priceCoins.toLocaleString()}</span>
                        </div>
                      </div>
                      {!listing.isOwnListing ? (
                        <button onClick={() => handleP2PBuy(listing)} disabled={!canAfford(listing.priceCoins)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${canAfford(listing.priceCoins) ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-400 border border-amber-500/30 hover:scale-105 active:scale-95' : 'bg-slate-800/50 text-slate-600 border border-slate-700/30 cursor-not-allowed'}`}>
                          Buy
                        </button>
                      ) : (
                        <button onClick={() => { playClickSound(); setListings((prev) => prev.filter((l) => l.id !== listing.id)); }}
                          className="px-4 py-2 rounded-xl text-xs font-bold uppercase text-rose-400 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

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
            })
          )}
        </div>
      )}

      {/* ===== SELL VIEW ===== */}
      {view === 'sell' && (
        <div className="space-y-3">
          {inventory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-xl"
              style={{ background: 'rgba(15,23,42,0.5)', border: '1px dashed rgba(100,116,139,0.3)' }}>
              <span className="text-4xl">📦</span>
              <span className="text-sm text-slate-500 font-semibold">No items to sell</span>
              <span className="text-[11px] text-slate-600">Buy items first from the shop!</span>
            </div>
          ) : (
            inventory.map((item) => {
              const rarityColor = getRarityColor(item.rarity);
              const price = sellPrice[item.id] ?? (item.listedPrice || 0);
              const isListed = !!item.listedPrice;
              return (
                <div key={item.id} className="rounded-xl overflow-hidden"
                  style={{
                    background: isListed
                      ? 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(34,197,94,0.06))'
                      : 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.8))',
                    border: isListed ? '1px solid rgba(34,197,94,0.3)' : `1px solid ${rarityColor}20`,
                  }}>
                  <div className="flex items-center gap-3 p-3">
                    <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-lg"
                      style={{ background: `radial-gradient(circle, ${rarityColor}10, transparent)` }}>
                      {item.image ? <img src={item.image} alt={item.name} className="w-12 h-12 object-contain" />
                        : <span className="text-2xl">{item.icon}</span>}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white truncate">{item.name}</span>
                        <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase"
                          style={{ color: rarityColor, background: `${rarityColor}15`, border: `1px solid ${rarityColor}25` }}>{item.rarity}</span>
                        {item.quantity > 1 && <span className="text-[9px] text-indigo-400 font-bold">×{item.quantity}</span>}
                        {isListed && (
                          <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold bg-green-500/20 text-green-400 border border-green-500/30 animate-pulse">
                            📢 LISTED
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-400">{item.category}</span>
                        {item.tokenId && (
                          <span className="text-[9px] text-slate-600 font-mono">NFT: {item.tokenId}</span>
                        )}
                      </div>
                    </div>

                    {/* Price input + sell/edit button */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/50">
                        <span className="text-xs">🪙</span>
                        <input
                          type="number"
                          min={1}
                          placeholder={isListed ? String(item.listedPrice) : 'Price'}
                          value={price || ''}
                          onChange={(e) => setSellPrice((prev) => ({ ...prev, [item.id]: parseInt(e.target.value) || 0 }))}
                          className="w-20 bg-transparent text-sm font-bold text-yellow-400 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                      {isListed ? (
                        <div className="flex items-center gap-1.5">
                          {/* Update price button */}
                          <button onClick={() => {
                            const newPrice = sellPrice[item.id];
                            if (newPrice && newPrice > 0 && newPrice !== item.listedPrice) {
                              playClickSound();
                              handleListForSale(item);
                              // Update listing in p2p as well
                              setListings((prev) => prev.map((l) =>
                                l.isOwnListing && l.item.id === item.itemId
                                  ? { ...l, priceCoins: newPrice, item: { ...l.item, priceCoins: newPrice } }
                                  : l
                              ));
                            }
                          }}
                            disabled={!sellPrice[item.id] || sellPrice[item.id] <= 0 || sellPrice[item.id] === item.listedPrice}
                            className="px-3 py-2 rounded-xl text-[10px] font-bold uppercase transition-all cursor-pointer bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-400 border border-amber-500/30 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            ✏️ Edit
                          </button>
                          {/* Unlist button */}
                          <button onClick={() => {
                            playClickSound();
                            onListForSale({ ...item, listedPrice: undefined } as InventoryItem, 0);
                            // Remove own listing from p2p
                            setListings((prev) => prev.filter((l) => !(l.isOwnListing && l.item.id === item.itemId)));
                            setSellPrice((prev) => ({ ...prev, [item.id]: 0 }));
                          }}
                            className="px-3 py-2 rounded-xl text-[10px] font-bold uppercase text-rose-400 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
                          >
                            ✖ Unlist
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => handleListForSale(item)} disabled={price <= 0}
                          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${price > 0 ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30 hover:scale-105 active:scale-95' : 'bg-slate-800/50 text-slate-600 border border-slate-700/30 cursor-not-allowed'}`}>
                          List
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Item Detail Popup */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-skin-picker-backdrop" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setDetailItem(null)}>
          <div className="relative w-full max-w-sm rounded-2xl overflow-hidden animate-skin-picker-enter" style={{ background: 'linear-gradient(180deg, rgba(15,10,40,0.98), rgba(30,15,60,0.95))', border: `1px solid ${getRarityColor(detailItem.rarity)}40`, boxShadow: `0 0 40px ${getRarityColor(detailItem.rarity)}20` }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setDetailItem(null)} className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all cursor-pointer">✕</button>
            <div className="flex items-center justify-center py-8" style={{ background: `radial-gradient(circle, ${getRarityColor(detailItem.rarity)}15, transparent 70%)` }}>
              {detailItem.image ? <img src={detailItem.image} alt={detailItem.name} className="w-28 h-28 object-contain" /> : <span className="text-6xl">{detailItem.icon}</span>}
            </div>
            <div className="px-5 pb-5 space-y-3">
              <div><h3 className="text-lg font-black text-white">{detailItem.name}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase" style={{ color: getRarityColor(detailItem.rarity), background: `${getRarityColor(detailItem.rarity)}15`, border: `1px solid ${getRarityColor(detailItem.rarity)}30` }}>{detailItem.rarity}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{detailItem.description}</p>
              <div className="flex items-center gap-3 pt-2">
                <div className="flex items-center gap-1"><span>🪙</span><span className="text-sm font-bold text-yellow-400">{detailItem.discount ? getDiscountedPrice(detailItem.priceCoins, detailItem.discount) : detailItem.priceCoins}</span></div>
                {detailItem.priceGems > 0 && <div className="flex items-center gap-1"><span>💎</span><span className="text-sm font-bold text-cyan-400">{detailItem.priceGems}</span></div>}
              </div>
              <button onClick={() => { handleShopBuy(detailItem, 'coins'); setDetailItem(null); }} disabled={player.coins < getDiscountedPrice(detailItem.priceCoins, detailItem.discount)}
                className="w-full py-2.5 rounded-xl text-xs font-bold uppercase cursor-pointer hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed" style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', border: '1px solid rgba(236,72,153,0.3)' }}>🪙 Buy Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
