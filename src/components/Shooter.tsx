'use client';

import React from 'react';
import { AmmoType, GunSkin, BoostCard } from '@/lib/gameTypes';
import { getRarityColor } from '@/lib/gameUtils';
import { playClickSound } from './SoundManager';
import GunStatusBar from './GunStatusBar';

interface ShooterProps {
  selectedAmmo: AmmoType;
  isFiring: boolean;
  aimAngle: number;
  durability: number;
  maxDurability: number;
  cooldown: number;
  maxCooldown: number;
  equippedCard: BoostCard | null;
  onEquipCard: (card: BoostCard | null) => void;
  gunSkin: GunSkin;
  onGunSkinClick: () => void;
  onCardSlotClick: () => void;
  energyCooldownRemain: number;
  energyCooldownActive: boolean;
}

export default function Shooter({
  selectedAmmo,
  isFiring,
  aimAngle,
  durability,
  maxDurability,
  cooldown,
  maxCooldown,
  equippedCard,
  onEquipCard,
  gunSkin,
  onGunSkinClick,
  onCardSlotClick,
  energyCooldownRemain,
  energyCooldownActive,
}: ShooterProps) {

  // Open skin picker on gun image click
  const handleGunClick = () => {
    playClickSound();
    onGunSkinClick();
  };

  const handleCardSlotClick = () => {
    playClickSound();
    onCardSlotClick();
  };

  // Format seconds to HH:MM:SS
  const formatCooldown = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative flex flex-col items-center gap-2">
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
                <img src={equippedCard.image} alt={equippedCard.name} className="w-10 h-12 object-contain rounded" />
                <span className="text-[7px] font-bold text-white/80 truncate max-w-[50px]">{equippedCard.name}</span>
              </>
            ) : (
              <>
                <span className="text-2xl text-slate-500">＋</span>
                <span className="text-[8px] text-slate-500 font-semibold">Add Card</span>
              </>
            )}
          </button>
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
              <img
                src={gunSkin.image}
                alt={gunSkin.name}
                className="w-full h-full object-contain drop-shadow-xl pointer-events-none"
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
        </div>

        {/* Right: Gun Status Bars */}
        <div className="flex-shrink-0 w-[140px] sm:w-[180px]">
          <GunStatusBar
            durability={durability}
            maxDurability={maxDurability}
            cooldown={cooldown}
            maxCooldown={maxCooldown}
            energyCooldownRemain={energyCooldownRemain}
            energyCooldownActive={energyCooldownActive}
          />
        </div>
      </div>

      {/* Damage info line */}
      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
        <span>DMG: <span className="font-bold text-white">{gunSkin.dmg}</span></span>
        {equippedCard && (
          <>
            <span>+</span>
            <span className="text-green-400">{equippedCard.bonusDamage}</span>
          </>
        )}
        <span>=</span>
        <span className="font-bold text-white">
          {gunSkin.dmg + (equippedCard?.bonusDamage || 0)} DMG
        </span>
      </div>

      {/* Energy 4h cooldown indicator */}
      {energyCooldownActive && (
        <div className="flex items-center gap-2 mt-1 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30">
          <span className="text-orange-400 text-xs animate-pulse">🔋</span>
          <span className="text-[10px] font-mono text-orange-300">{formatCooldown(energyCooldownRemain)}</span>
          <span className="text-[9px] text-orange-400/60">until recharge</span>
        </div>
      )}
    </div>
  );
}
