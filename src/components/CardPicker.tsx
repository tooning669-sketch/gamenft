'use client';

import React, { useEffect, useRef } from 'react';
import { BoostCard, InventoryItem } from '@/lib/gameTypes';
import { getRarityColor } from '@/lib/gameUtils';
import { playClickSound } from './SoundManager';

interface CardPickerProps {
  isOpen: boolean;
  equippedCard: BoostCard | null;
  ownedCards: { card: BoostCard; invItem: InventoryItem }[];
  onSelectCard: (card: BoostCard | null) => void;
  onClose: () => void;
}

export default function CardPicker({ isOpen, equippedCard, ownedCards, onSelectCard, onClose }: CardPickerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    const timer = setTimeout(() => document.addEventListener('mousedown', handleClick), 50);
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', handleClick); };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (card: BoostCard) => {
    playClickSound();
    onSelectCard(card);
    onClose();
  };

  const handleRemove = () => {
    playClickSound();
    onSelectCard(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center animate-skin-picker-backdrop">
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, rgba(8,47,73,0.64), rgba(3,7,18,0.86))', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />

      <div
        ref={panelRef}
        className="relative z-10 w-[90vw] max-w-[600px] max-h-[80vh] rounded-2xl overflow-hidden animate-skin-picker-enter"
        style={{
          background: 'linear-gradient(135deg, rgba(7,47,62,0.98), rgba(10,96,100,0.95))',
          border: '1px solid rgba(125,211,252,0.34)',
          boxShadow: '0 0 60px rgba(45,212,191,0.16), 0 20px 60px rgba(0,0,0,0.4)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'rgba(125,211,252,0.24)' }}>
          <div className="flex items-center gap-2">
            <span className="text-xl">🃏</span>
            <h3 className="text-base sm:text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-lime-200 to-yellow-200">
              SELECT BOOST CARD
            </h3>
            <span className="text-[10px] text-slate-500 font-semibold">({ownedCards.length} owned)</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all cursor-pointer">✕</button>
        </div>

        {/* Currently equipped */}
        <div className="flex items-center gap-3 px-5 py-3 border-b" style={{ borderColor: 'rgba(125,211,252,0.18)' }}>
          {equippedCard ? (
            <>
              <div className="w-14 h-18 rounded-xl overflow-hidden flex items-center justify-center" style={{
                background: `radial-gradient(circle, ${getRarityColor(equippedCard.rarity)}20, transparent)`,
                border: `2px solid ${getRarityColor(equippedCard.rarity)}50`,
              }}>
                <img src={equippedCard.image} alt={equippedCard.name} className="w-12 h-16 object-contain" />
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Equipped</div>
                <div className="text-sm font-bold text-white">{equippedCard.name}</div>
                <div className="text-[10px] text-green-400 font-bold">+{equippedCard.bonusDamage} DMG • {equippedCard.description}</div>
              </div>
              <button onClick={handleRemove} className="ml-auto px-3 py-1.5 rounded-lg text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-all cursor-pointer">
                🗑️ Remove
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-14 h-18 rounded-xl border-2 border-dashed border-slate-600 flex items-center justify-center">
                <span className="text-2xl text-slate-500">＋</span>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">No Card Equipped</div>
                <div className="text-[10px] text-slate-400">Select a card to boost your damage</div>
              </div>
            </div>
          )}
        </div>

        {/* Card Grid — only owned cards */}
        <div className="overflow-y-auto max-h-[55vh] custom-scrollbar p-4">
          {ownedCards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <span className="text-4xl">🃏</span>
              <span className="text-sm text-slate-500 font-semibold">No cards owned</span>
              <span className="text-[11px] text-slate-600">Buy cards from the Marketplace!</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
              {ownedCards.map(({ card, invItem }) => {
                const isEquipped = equippedCard?.id === card.id;
                const rarityColor = getRarityColor(card.rarity);
                return (
                  <button
                    key={invItem.id}
                    onClick={() => handleSelect(card)}
                    className={`group relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 ${isEquipped ? 'ring-2 ring-green-400' : ''}`}
                    style={{
                      background: isEquipped ? `linear-gradient(135deg, ${rarityColor}20, ${rarityColor}08)` : 'rgba(8,47,73,0.56)',
                      border: isEquipped ? `2px solid ${rarityColor}80` : '1px solid rgba(100,116,139,0.2)',
                      boxShadow: isEquipped ? `0 0 20px ${rarityColor}30` : 'none',
                    }}
                  >
                    {isEquipped && (
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold z-10"
                        style={{ background: '#22c55e', color: '#0f172a', boxShadow: '0 0 8px rgba(34,197,94,0.6)' }}>✓</div>
                    )}

                    {/* Quantity badge */}
                    {invItem.quantity > 1 && (
                      <div className="absolute top-1 right-1 z-10 px-1.5 py-0.5 rounded-full text-[9px] font-black text-white"
                        style={{ background: 'rgba(14,165,233,0.86)' }}>
                        ×{invItem.quantity}
                      </div>
                    )}

                    {/* Card Image */}
                    <div className="w-full aspect-[3/4] max-h-[160px] relative flex items-center justify-center rounded-lg overflow-hidden transition-all duration-300 group-hover:scale-105"
                      style={{ background: `radial-gradient(circle, ${rarityColor}12, transparent)` }}>
                      <img src={card.image} alt={card.name} className="w-full h-full object-contain drop-shadow-lg"
                        style={{ filter: isEquipped ? `drop-shadow(0 0 8px ${rarityColor})` : 'none' }} />
                    </div>

                    {/* Info */}
                    <div className="w-full text-center">
                      <div className="text-[11px] font-bold text-white truncate">{card.name}</div>
                      <div className="flex items-center justify-center gap-2 mt-0.5">
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase" style={{
                          color: rarityColor, background: `${rarityColor}15`, border: `1px solid ${rarityColor}25`
                        }}>{card.rarity}</span>
                        <span className="text-[10px] font-bold text-green-400">+{card.bonusDamage} DMG</span>
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5">{card.description}</div>
                    </div>

                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      style={{ background: `radial-gradient(circle at center, ${rarityColor}08, transparent 70%)` }} />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
