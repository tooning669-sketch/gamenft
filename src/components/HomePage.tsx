'use client';

import React, { useState, useEffect } from 'react';
import {
  Gamepad2, Crosshair, ShoppingBag, DollarSign, Wallet, Swords, ArrowRight,
  Users, Trophy, Activity, Shield, Lock, FileCode, BookOpen,
  ChevronRight, Rocket, Star, Zap, Target
} from 'lucide-react';

interface HomePageProps {
  onPlayNow: () => void;
}

// Animated counter hook
function useCounter(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

export default function HomePage({ onPlayNow }: HomePageProps) {
  const totalPlayers = useCounter(12847);
  const totalRewards = useCounter(892450);
  const dailyActive = useCounter(3421);

  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: Gamepad2,
      title: 'Play to Earn',
      desc: 'Pop bubbles and earn real crypto rewards including USDT, Gold coins, and rare NFT items.',
      color: '#22c55e',
      glowColor: 'rgba(34,197,94,0.15)',
    },
    {
      icon: Crosshair,
      title: 'NFT Weapons',
      desc: 'Collect 13 unique weapons from Common to Legendary. Each gun has unique stats and rarity.',
      color: '#a78bfa',
      glowColor: 'rgba(167,139,250,0.15)',
    },
    {
      icon: ShoppingBag,
      title: 'Marketplace',
      desc: 'Trade weapons and items with other players. Buy from the shop or sell P2P for profit.',
      color: '#f59e0b',
      glowColor: 'rgba(245,158,11,0.15)',
    },
    {
      icon: DollarSign,
      title: 'USDT Rewards',
      desc: 'Convert your in-game earnings to real USDT. Withdraw anytime with low gas fees.',
      color: '#22d3ee',
      glowColor: 'rgba(34,211,238,0.15)',
    },
  ];

  const steps = [
    {
      num: '01',
      icon: Wallet,
      title: 'Connect Wallet',
      desc: 'Link your MetaMask or any Web3 wallet to start playing.',
    },
    {
      num: '02',
      icon: Target,
      title: 'Play & Shoot',
      desc: 'Pop bubbles in 30-second rounds. Higher tier balls = better rewards.',
    },
    {
      num: '03',
      icon: Trophy,
      title: 'Earn & Trade',
      desc: 'Collect NFT weapons, trade on marketplace, and withdraw USDT.',
    },
  ];

  const chains = [
    { name: 'Ethereum', color: '#627EEA' },
    { name: 'BNB Chain', color: '#F0B90B' },
    { name: 'Polygon', color: '#8247E5' },
    { name: 'Arbitrum', color: '#28A0F0' },
    { name: 'OpenSea', color: '#2081E2' },
    { name: 'ChainLink', color: '#375BD2' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-20 sm:space-y-28 pb-16">

      {/* ===== HERO SECTION ===== */}
      <section className="relative text-center pt-8 sm:pt-16 pb-4">
        {/* Floating glow orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 left-[15%] w-48 h-48 rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.5), transparent 70%)', animation: 'pulse 4s ease-in-out infinite' }} />
          <div className="absolute top-24 right-[18%] w-36 h-36 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.5), transparent 70%)', animation: 'pulse 5s ease-in-out infinite 1s' }} />
          <div className="absolute bottom-0 left-[38%] w-56 h-56 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.4), transparent 70%)', animation: 'pulse 6s ease-in-out infinite 0.5s' }} />
        </div>

        <div className="relative z-10 space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest"
            style={{
              background: 'linear-gradient(135deg, rgba(34,211,238,0.1), rgba(251,191,36,0.06))',
              border: '1px solid rgba(34,211,238,0.25)',
              color: '#a5f3fc',
            }}>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live on Ethereum Mainnet
          </div>

          {/* Title */}
          <h1 className="text-6xl sm:text-8xl lg:text-9xl font-black leading-[0.9] tracking-tight">
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(135deg, #a5f3fc, #22d3ee, #67e8f9)' }}>
              BUBBLE
            </span>
            <br />
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(135deg, #fde68a, #fbbf24, #f59e0b)' }}>
              BLAST
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto leading-relaxed font-medium">
            Pop bubbles, collect <span className="text-teal-300 font-semibold">NFT weapons</span>,
            and earn <span className="text-emerald-300 font-semibold">real rewards</span>.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              onClick={onPlayNow}
              className="group relative px-10 py-4 rounded-2xl text-base font-extrabold uppercase tracking-wider
                transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95
                flex items-center gap-3"
              style={{
                background: 'linear-gradient(135deg, #22d3ee, #14b8a6, #10b981)',
                boxShadow: '0 8px 32px rgba(34,211,238,0.3), 0 0 0 1px rgba(255,255,255,0.1) inset',
                border: 'none',
              }}
            >
              <Gamepad2 size={22} className="text-white" />
              <span className="text-white">PLAY NOW</span>
            </button>
            <a
              href="#how-it-works"
              className="px-8 py-4 rounded-2xl text-sm font-bold uppercase tracking-wider
                transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95
                flex items-center gap-2"
              style={{
                background: 'rgba(6,28,44,0.7)',
                border: '1px solid rgba(45,212,191,0.25)',
                color: '#94a3b8',
              }}
            >
              <BookOpen size={16} />
              Learn More
            </a>
          </div>

          {/* Quick stats under hero */}
          <div className="flex items-center justify-center gap-4 sm:gap-8 pt-6">
            {[
              { label: 'Players', value: totalPlayers.toLocaleString(), icon: Users, color: '#38bdf8' },
              { label: 'Rewards Paid', value: `$${totalRewards.toLocaleString()}`, icon: Trophy, color: '#fbbf24' },
              { label: 'Daily Active', value: dailyActive.toLocaleString(), icon: Activity, color: '#34d399' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3 px-5 py-3 rounded-2xl"
                style={{
                  background: 'rgba(6,28,44,0.7)',
                  border: '1px solid rgba(45,212,191,0.12)',
                }}>
                <stat.icon size={20} style={{ color: stat.color }} className="flex-shrink-0" />
                <div className="text-left">
                  <div className="text-lg sm:text-xl font-extrabold text-white leading-tight">{stat.value}</div>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text"
            style={{ backgroundImage: 'linear-gradient(135deg, #a5f3fc, #67e8f9, #a3e635)' }}>
            Why Bubble Blast?
          </h2>
          <p className="text-sm text-slate-500 mt-3 max-w-md mx-auto">
            The most rewarding Web3 game on the blockchain
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="relative rounded-2xl p-6 transition-all duration-300 cursor-default group"
                style={{
                  background: hoveredFeature === i
                    ? `linear-gradient(135deg, rgba(6,28,44,0.95), ${f.color}08)`
                    : 'linear-gradient(135deg, rgba(6,28,44,0.92), rgba(8,48,62,0.7))',
                  border: `1px solid ${hoveredFeature === i ? f.color + '35' : 'rgba(45,212,191,0.1)'}`,
                  boxShadow: hoveredFeature === i ? `0 8px 32px ${f.glowColor}` : 'none',
                  transform: hoveredFeature === i ? 'translateY(-4px)' : 'translateY(0)',
                }}
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${f.color}12`, border: `1px solid ${f.color}20` }}>
                  <Icon size={24} style={{ color: f.color }} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text"
            style={{ backgroundImage: 'linear-gradient(135deg, #fde68a, #fbbf24, #f59e0b)' }}>
            How It Works
          </h2>
          <p className="text-sm text-slate-500 mt-3">Start earning in 3 simple steps</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
          {/* Connecting lines (desktop only) */}
          <div className="hidden sm:block absolute top-1/2 left-[33%] right-[33%] h-px" style={{ background: 'linear-gradient(90deg, rgba(34,211,238,0.2), rgba(251,191,36,0.2))' }} />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="relative rounded-2xl p-6 text-center group hover:scale-[1.03] transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(6,28,44,0.92), rgba(8,48,62,0.7))',
                  border: '1px solid rgba(45,212,191,0.12)',
                }}>
                {/* Step number */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-extrabold"
                  style={{
                    background: 'linear-gradient(135deg, #22d3ee, #14b8a6)',
                    boxShadow: '0 4px 16px rgba(34,211,238,0.25)',
                    color: '#042f46',
                  }}>
                  STEP {step.num}
                </div>
                <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mt-4 mb-4"
                  style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.15)' }}>
                  <Icon size={28} className="text-teal-300" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>

                {/* Connecting arrow (hidden on last step) */}
                {i < steps.length - 1 && (
                  <div className="hidden sm:flex absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 rounded-full items-center justify-center"
                    style={{ background: 'rgba(6,28,44,0.9)', border: '1px solid rgba(45,212,191,0.2)' }}>
                    <ChevronRight size={14} className="text-teal-400/60" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== WEAPON SHOWCASE ===== */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text"
            style={{ backgroundImage: 'linear-gradient(135deg, #f9a8d4, #c084fc, #a78bfa)' }}>
            Legendary Arsenal
          </h2>
          <p className="text-sm text-slate-500 mt-3">Collect and trade 13 unique NFT weapons</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { name: 'Fire Demon', img: '/guns/gun_10_fire_demon.png', rarity: 'Legendary', color: '#fbbf24', dmg: 140 },
            { name: 'Shadow Cannon', img: '/guns/gun_12_shadow_cannon.png', rarity: 'Legendary', color: '#fbbf24', dmg: 160 },
            { name: 'Neon Blaster', img: '/guns/gun_13_neon_blaster.png', rarity: 'Legendary', color: '#fbbf24', dmg: 85 },
            { name: 'Ocean Beast', img: '/guns/gun_11_ocean_beast.png', rarity: 'Legendary', color: '#fbbf24', dmg: 90 },
          ].map((gun) => (
            <div key={gun.name} className="rounded-2xl overflow-hidden group hover:scale-[1.04] transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(6,28,44,0.95), rgba(8,48,62,0.8))',
                border: `1px solid ${gun.color}20`,
              }}>
              <div className="aspect-square flex items-center justify-center p-5"
                style={{ background: `radial-gradient(circle, ${gun.color}08, transparent 70%)` }}>
                <img src={gun.img} alt={gun.name} className="w-full h-full object-contain group-hover:scale-110 transition-all duration-300" />
              </div>
              <div className="p-3 border-t" style={{ borderColor: `${gun.color}12` }}>
                <div className="text-sm font-bold text-white">{gun.name}</div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase"
                    style={{ color: gun.color, background: `${gun.color}12`, border: `1px solid ${gun.color}20` }}>
                    {gun.rarity}
                  </span>
                  <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1">
                    <Zap size={10} /> DMG {gun.dmg}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== PARTNERS & CHAINS ===== */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text"
            style={{ backgroundImage: 'linear-gradient(135deg, #e2e8f0, #a5f3fc, #e2e8f0)' }}>
            Supported Chains & Partners
          </h2>
        </div>

        <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
          {chains.map((p) => (
            <div key={p.name} className="flex flex-col items-center gap-2.5 px-5 py-3 rounded-xl transition-all duration-200 hover:scale-105 cursor-default"
              style={{
                background: `${p.color}06`,
                border: `1px solid ${p.color}15`,
              }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: `${p.color}12`, border: `1px solid ${p.color}20` }}>
                <Star size={18} style={{ color: p.color }} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{p.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== SECURITY & AUDIT ===== */}
      <section>
        <div className="rounded-2xl p-6 sm:p-8 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(6,28,44,0.9), rgba(8,48,62,0.7))',
            border: '1px solid rgba(45,212,191,0.12)',
          }}>
          <h3 className="text-lg font-bold text-white mb-5 flex items-center justify-center gap-2">
            <Shield size={20} className="text-teal-400" />
            Security & Trust
          </h3>
          <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
            {[
              { icon: Shield, label: 'CertiK Audited', color: '#22c55e' },
              { icon: Lock, label: 'Anti-Bot Protected', color: '#38bdf8' },
              { icon: Lock, label: 'Smart Contract Verified', color: '#a78bfa' },
              { icon: FileCode, label: 'Open Source', color: '#fbbf24' },
            ].map((badge) => {
              const Icon = badge.icon;
              return (
                <div key={badge.label} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
                  style={{
                    background: `${badge.color}06`,
                    border: `1px solid ${badge.color}15`,
                  }}>
                  <Icon size={16} style={{ color: badge.color }} />
                  <span className="text-xs font-bold" style={{ color: badge.color }}>{badge.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="text-center py-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text mb-4"
          style={{ backgroundImage: 'linear-gradient(135deg, #fde68a, #a3e635, #67e8f9)' }}>
          Ready to Start Earning?
        </h2>
        <p className="text-sm text-slate-500 mb-8 max-w-md mx-auto">
          Join thousands of players already earning real crypto rewards every day.
        </p>
        <button
          onClick={onPlayNow}
          className="px-12 py-5 rounded-2xl text-lg font-extrabold uppercase tracking-wider
            transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95
            flex items-center gap-3 mx-auto"
          style={{
            background: 'linear-gradient(135deg, #22d3ee, #14b8a6, #10b981)',
            boxShadow: '0 8px 32px rgba(34,211,238,0.3), 0 0 0 1px rgba(255,255,255,0.1) inset',
            border: 'none',
          }}
        >
          <Rocket size={22} className="text-white" />
          <span className="text-white">LAUNCH GAME</span>
        </button>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t pt-8 pb-4" style={{ borderColor: 'rgba(45,212,191,0.1)' }}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Gamepad2 size={20} className="text-teal-400" />
            <span className="text-sm font-extrabold text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(135deg, #a5f3fc, #fde68a)' }}>
              BUBBLE BLAST
            </span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-300 border border-yellow-400/20 font-bold">
              NFT
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500">
            <span className="hover:text-white cursor-pointer transition-colors">Docs</span>
            <span className="hover:text-white cursor-pointer transition-colors">Whitepaper</span>
            <span className="hover:text-white cursor-pointer transition-colors">GitHub</span>
            <span className="hover:text-white cursor-pointer transition-colors">Discord</span>
            <span className="hover:text-white cursor-pointer transition-colors">Twitter</span>
          </div>

          <div className="text-[10px] text-slate-600">
            © 2026 Bubble Blast. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
