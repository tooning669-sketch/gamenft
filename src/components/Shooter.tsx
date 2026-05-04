'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { AmmoType, GunLevel, GunSkin, BoostCard, GUN_LEVELS, AVAILABLE_CARDS } from '@/lib/gameTypes';
import { getRarityColor } from '@/lib/gameUtils';
import { playClickSound } from './SoundManager';
import GunStatusBar from './GunStatusBar';

interface ShooterProps {
  selectedAmmo: AmmoType;
  isFiring: boolean;
  aimAngle: number; // degrees, 0 = straight up
  energy: number;
  maxEnergy: number;
  durability: number;
  maxDurability: number;
  cooldown: number;
  maxCooldown: number;
  gunLevel: GunLevel;
  onGunLevelChange: (level: GunLevel) => void;
  equippedCard: BoostCard | null;
  onEquipCard: (card: BoostCard | null) => void;
  gunSkin: GunSkin;
  onGunSkinClick: () => void;
}

export default function Shooter({
  selectedAmmo,
  isFiring,
  aimAngle,
  energy,
  maxEnergy,
  durability,
  maxDurability,
  cooldown,
  maxCooldown,
  gunLevel,
  onGunLevelChange,
  equippedCard,
  onEquipCard,
  gunSkin,
  onGunSkinClick,
}: ShooterProps) {
  const [showCardPicker, setShowCardPicker] = useState(false);

  // Cycle gun level on click
  const handleGunLevelClick = () => {
    playClickSound();
    const currentIdx = GUN_LEVELS.findIndex((g) => g.level === gunLevel.level);
    const nextIdx = (currentIdx + 1) % GUN_LEVELS.length;
    onGunLevelChange(GUN_LEVELS[nextIdx]);
  };

  // Open skin picker on gun image click
  const handleGunClick = () => {
    playClickSound();
    onGunSkinClick();
  };

  const handleCardSlotClick = () => {
    playClickSound();
    setShowCardPicker((prev) => !prev);
  };

  const handleSelectCard = (card: BoostCard) => {
    playClickSound();
    onEquipCard(card);
    setShowCardPicker(false);
  };

  const handleRemoveCard = () => {
    playClickSound();
    onEquipCard(null);
    setShowCardPicker(false);
  };

  return (
    <div className="relative flex flex-col items-center gap-2">
      {/* Gun Level Badge */}
      <div
        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer hover:scale-105 transition-all"
        onClick={handleGunLevelClick}
        title="Click to change gun level"
        style={{
          background: `linear-gradient(135deg, ${gunLevel.color}30, ${gunLevel.color}10)`,
          border: `1px solid ${gunLevel.color}60`,
          color: gunLevel.color,
          boxShadow: `0 0 12px ${gunLevel.glowColor}`,
        }}
      >
        <span>LV.{gunLevel.level}</span>
        <span>{gunLevel.name}</span>
        <span className="text-white/50">×{gunLevel.damageMultiplier}</span>
      </div>

      {/* Main shooter area: Card Slot + Cannon + Status */}
      <div className="flex items-end gap-3 sm:gap-5">
        {/* Left: Card Boost Slot */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Boost</span>

          {/* Card Slot */}
          <button
            onClick={handleCardSlotClick}
            className="relative w-14 h-18 sm:w-16 sm:h-20 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 flex flex-col items-center justify-center gap-1"
            style={{
              background: equippedCard
                ? `linear-gradient(135deg, ${getRarityColor(equippedCard.rarity)}20, ${getRarityColor(equippedCard.rarity)}08)`
                : 'linear-gradient(135deg, rgba(15,23,42,0.8), rgba(30,41,59,0.6))',
              border: equippedCard
                ? `2px solid ${getRarityColor(equippedCard.rarity)}60`
                : '2px dashed rgba(100,116,139,0.4)',
              boxShadow: equippedCard
                ? `0 0 15px ${getRarityColor(equippedCard.rarity)}30`
                : 'none',
            }}
          >
            {equippedCard ? (
              <>
                <span className="text-2xl">{equippedCard.icon}</span>
                <span className="text-[8px] font-bold text-white/80 truncate max-w-[50px]">{equippedCard.name}</span>
                <span className="text-[8px] font-bold text-green-400">+{equippedCard.bonusDamage}</span>
              </>
            ) : (
              <>
                <span className="text-2xl text-slate-500">＋</span>
                <span className="text-[8px] text-slate-500 font-semibold">Add Card</span>
              </>
            )}
          </button>

          {/* Card Picker Popup */}
          {showCardPicker && (
            <div
              className="absolute bottom-full mb-2 left-0 z-50 rounded-xl p-3 min-w-[220px] max-h-[280px] overflow-y-auto custom-scrollbar"
              style={{
                background: 'linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,41,59,0.95))',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">⚔️ Boost Cards</h4>
                <button
                  onClick={() => setShowCardPicker(false)}
                  className="text-slate-500 hover:text-white text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {equippedCard && (
                <button
                  onClick={handleRemoveCard}
                  className="w-full mb-2 py-1.5 rounded-lg text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-all cursor-pointer"
                >
                  🗑️ Remove Card
                </button>
              )}

              <div className="space-y-1.5">
                {AVAILABLE_CARDS.map((card) => {
                  const isEquipped = equippedCard?.id === card.id;
                  const rarityColor = getRarityColor(card.rarity);
                  return (
                    <button
                      key={card.id}
                      onClick={() => handleSelectCard(card)}
                      className={`
                        w-full flex items-center gap-2 rounded-lg p-2 transition-all cursor-pointer
                        hover:scale-[1.02] active:scale-95
                        ${isEquipped ? 'ring-1 ring-green-400' : ''}
                      `}
                      style={{
                        background: isEquipped ? `${rarityColor}15` : 'rgba(15,23,42,0.6)',
                        border: `1px solid ${rarityColor}30`,
                      }}
                    >
                      <span className="text-xl">{card.icon}</span>
                      <div className="flex-1 text-left">
                        <div className="text-[11px] font-bold text-white">{card.name}</div>
                        <div className="text-[9px]" style={{ color: rarityColor }}>{card.rarity} • {card.description}</div>
                      </div>
                      {isEquipped && <span className="text-green-400 text-xs">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Center: Cannon with Gun Skin Image */}
        <div className="flex flex-col items-center" id="shooter-cannon">
          {/* Cooldown overlay */}
          {cooldown > 0 && (
            <div className="text-rose-400 text-xs font-bold animate-pulse mb-1">
              ⏱️ {(cooldown / 1000).toFixed(1)}s
            </div>
          )}

          {/* Skin name badge */}
          <div
            className="text-[9px] font-bold uppercase tracking-wider mb-1 px-2 py-0.5 rounded-full"
            style={{
              color: gunSkin.color,
              background: `${gunSkin.color}15`,
              border: `1px solid ${gunSkin.color}30`,
            }}
          >
            {gunSkin.name}
          </div>

          {/* Gun Image - clickable to open skin picker */}
          <div
            className={`
              relative group cursor-pointer transition-all duration-200
              ${isFiring ? 'animate-cannon-fire' : ''}
              ${cooldown > 0 ? 'opacity-60' : ''}
            `}
            onClick={handleGunClick}
            title="Click to change weapon skin"
            style={{ transformOrigin: 'bottom center' }}
          >
            {/* Glow ring behind the gun */}
            <div
              className="absolute inset-0 rounded-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle, ${gunSkin.glowColor}, transparent 70%)`,
                filter: 'blur(8px)',
                transform: 'scale(1.2)',
              }}
            />

            {/* Gun image */}
            <div
              className="relative w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center rounded-xl overflow-visible transition-transform duration-200 group-hover:scale-110"
            >
              <Image
                src={gunSkin.image}
                alt={gunSkin.name}
                width={112}
                height={112}
                className="object-contain drop-shadow-xl pointer-events-none"
                style={{
                  filter: isFiring
                    ? `drop-shadow(0 0 12px ${selectedAmmo.color}) brightness(1.3)`
                    : `drop-shadow(0 0 6px ${gunSkin.glowColor})`,
                  transition: 'filter 0.2s',
                }}
              />

              {/* Muzzle flash on fire */}
              {isFiring && (
                <div
                  className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${selectedAmmo.color}, transparent)`,
                    animation: 'pulse-glow 0.2s ease-out',
                  }}
                />
              )}

              {/* "Click to change" hint */}
              <div
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none"
                style={{
                  background: 'rgba(15,23,42,0.9)',
                  border: `1px solid ${gunSkin.color}40`,
                  borderRadius: '6px',
                  padding: '2px 8px',
                  fontSize: '9px',
                  fontWeight: 700,
                  color: gunSkin.color,
                  boxShadow: `0 4px 12px rgba(0,0,0,0.5)`,
                }}
              >
                🎨 เปลี่ยนปืน
              </div>
            </div>
          </div>

          {/* Platform */}
          <div
            className="w-28 h-3 sm:w-36 sm:h-4 rounded-b-lg mt-1"
            style={{
              background: `linear-gradient(180deg, ${gunSkin.color}30, #334155)`,
              boxShadow: `0 4px 10px rgba(0,0,0,0.3), 0 0 10px ${gunSkin.glowColor}`,
            }}
          />

          {/* Level indicator dots */}
          <div className="flex gap-1 mt-1">
            {GUN_LEVELS.map((gl) => (
              <div
                key={gl.level}
                className="w-1.5 h-1.5 rounded-full transition-all"
                style={{
                  background: gl.level <= gunLevel.level ? gunLevel.color : 'rgba(100,116,139,0.3)',
                  boxShadow: gl.level <= gunLevel.level ? `0 0 4px ${gunLevel.glowColor}` : 'none',
                }}
              />
            ))}
          </div>
        </div>

        {/* Right: Gun Status Bars */}
        <div className="flex-shrink-0 w-[140px] sm:w-[180px]">
          <GunStatusBar
            energy={energy}
            maxEnergy={maxEnergy}
            durability={durability}
            maxDurability={maxDurability}
            cooldown={cooldown}
            maxCooldown={maxCooldown}
          />
        </div>
      </div>

      {/* Damage info line */}
      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
        <span>Base: {selectedAmmo.damage}</span>
        <span>×</span>
        <span style={{ color: gunLevel.color }}>{gunLevel.damageMultiplier}x</span>
        {equippedCard && (
          <>
            <span>+</span>
            <span className="text-green-400">{equippedCard.bonusDamage}</span>
          </>
        )}
        <span>=</span>
        <span className="font-bold text-white">
          {Math.floor(selectedAmmo.damage * gunLevel.damageMultiplier) + (equippedCard?.bonusDamage || 0)} DMG
        </span>
      </div>
    </div>
  );
}
