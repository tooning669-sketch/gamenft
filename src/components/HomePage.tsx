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

  const chainLogos: { name: string; color: string; svg: React.ReactNode }[] = [
    {
      name: 'Ethereum',
      color: '#627EEA',
      svg: (
        <svg width="28" height="28" viewBox="0 0 256 417" fill="none">
          <path d="M127.961 0L125.166 9.5V285.168L127.961 287.958L255.923 212.32L127.961 0Z" fill="#627EEA" />
          <path d="M127.962 0L0 212.32L127.962 287.959V154.158V0Z" fill="#8C9FEA" />
          <path d="M127.961 312.187L126.386 314.107V412.306L127.961 416.905L255.999 236.587L127.961 312.187Z" fill="#627EEA" />
          <path d="M127.962 416.905V312.187L0 236.587L127.962 416.905Z" fill="#8C9FEA" />
          <path d="M127.961 287.958L255.922 212.32L127.961 154.159V287.958Z" fill="#3C3C8E" />
          <path d="M0 212.32L127.962 287.958V154.159L0 212.32Z" fill="#627EEA" />
        </svg>
      ),
    },
    {
      name: 'BNB Chain',
      color: '#F0B90B',
      svg: (
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
          <path d="M16 2L9.5 8.5L12 11L16 7L20 11L22.5 8.5L16 2Z" fill="#F0B90B" />
          <path d="M5 13.5L7.5 11L10 13.5L7.5 16L5 13.5Z" fill="#F0B90B" />
          <path d="M16 12L9.5 18.5L12 21L16 17L20 21L22.5 18.5L16 12Z" fill="#F0B90B" />
          <path d="M22 13.5L24.5 11L27 13.5L24.5 16L22 13.5Z" fill="#F0B90B" />
          <path d="M16 22L13 25L16 28L19 25L16 22Z" fill="#F0B90B" />
        </svg>
      ),
    },
    {
      name: 'Polygon',
      color: '#8247E5',
      svg: (
        <svg width="28" height="28" viewBox="0 0 38 33" fill="none">
          <path d="M28.8 12.3C28.1 11.9 27.2 11.9 26.4 12.3L21.6 15.1L18.3 16.9L13.5 19.7C12.8 20.1 11.9 20.1 11.1 19.7L7.3 17.5C6.6 17.1 6.1 16.3 6.1 15.4V11.2C6.1 10.3 6.5 9.5 7.3 9.1L11 7C11.7 6.6 12.6 6.6 13.4 7L17.1 9.1C17.8 9.5 18.3 10.3 18.3 11.2V14L21.6 12V9.2C21.6 8.3 21.2 7.5 20.4 7.1L13.5 3.1C12.8 2.7 11.9 2.7 11.1 3.1L4 7.2C3.2 7.6 2.8 8.4 2.8 9.2V17.2C2.8 18.1 3.2 18.9 4 19.3L11.1 23.3C11.8 23.7 12.7 23.7 13.5 23.3L18.3 20.6L21.6 18.7L26.4 16C27.1 15.6 28 15.6 28.8 16L32.5 18.1C33.2 18.5 33.7 19.3 33.7 20.2V24.4C33.7 25.3 33.3 26.1 32.5 26.5L28.8 28.7C28.1 29.1 27.2 29.1 26.4 28.7L22.7 26.6C22 26.2 21.5 25.4 21.5 24.5V21.8L18.2 23.7V26.5C18.2 27.4 18.6 28.2 19.4 28.6L26.5 32.6C27.2 33 28.1 33 28.9 32.6L36 28.6C36.7 28.2 37.2 27.4 37.2 26.5V18.4C37.2 17.5 36.8 16.7 36 16.3L28.8 12.3Z" fill="#8247E5" />
        </svg>
      ),
    },
    {
      name: 'Arbitrum',
      color: '#28A0F0',
      svg: (
        <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
          <path d="M21.2 5L33.5 26.3L29.8 28.5L20 11.5L10.2 28.5L6.5 26.3L18.8 5H21.2Z" fill="#28A0F0" />
          <path d="M20 18L27.5 31L24 33L20 25.5L16 33L12.5 31L20 18Z" fill="#28A0F0" />
          <path d="M20 28L22.5 33H17.5L20 28Z" fill="#96BEDC" />
        </svg>
      ),
    },
    {
      name: 'OpenSea',
      color: '#2081E2',
      svg: (
        <svg width="28" height="28" viewBox="0 0 90 90" fill="none">
          <path d="M45 0C20.2 0 0 20.2 0 45C0 69.8 20.2 90 45 90C69.8 90 90 69.8 90 45C90 20.2 69.8 0 45 0ZM22.2 46.5L22.4 46.2L33.4 29.5C33.6 29.2 34 29.2 34.2 29.6C36 33.8 37.6 39 36.9 42.2C36.6 43.5 35.7 45.3 34.7 46.9C34.5 47.3 34.3 47.6 34.1 47.9C34 48.1 33.8 48.1 33.6 48.1H22.6C22.3 48.1 22.1 47.8 22.2 46.5ZM74.4 52.8C74.4 53 74.3 53.2 74.1 53.3C73.3 53.6 70.7 54.8 69.5 56.5C66.5 60.9 64.2 67.2 58.8 67.2H33.2C25 67.2 18.4 60.5 18.4 52.3V52C18.4 51.7 18.6 51.5 18.9 51.5H30.8C31.1 51.5 31.4 51.8 31.3 52.1C31.2 52.9 31.3 53.7 31.7 54.4C32.4 55.8 33.8 56.6 35.3 56.6H41.4V52.1H35.4C35 52.1 34.8 51.7 35 51.3C35.1 51.2 35.2 51 35.3 50.8C35.9 49.9 36.8 48.5 37.6 46.9C38.2 45.8 38.7 44.6 39.1 43.4C39.2 43.1 39.3 42.8 39.3 42.5C39.4 42 39.5 41.5 39.5 41C39.5 40.5 39.5 40 39.4 39.5C39.4 38.9 39.3 38.3 39.1 37.7C39 37.2 38.8 36.6 38.6 36.1C38.5 35.7 38.3 35.3 38.1 34.9C37.8 34.3 37.5 33.7 37.2 33.2C37 32.8 36.8 32.5 36.6 32.1L36.5 31.9C36.3 31.6 36.2 31.3 35.9 31L33.5 27.4C33.3 27.1 33.6 26.7 33.9 26.8L35.5 27.3L38 28.1L38.4 28.2L38.8 28.4L39.1 28.5V24.8C39.1 23.3 40.3 22.1 41.8 22.1C42.5 22.1 43.2 22.4 43.7 22.9C44.2 23.4 44.4 24.1 44.4 24.8V30.1L46.3 30.6C46.4 30.7 46.5 30.7 46.6 30.8C46.8 30.9 47.1 31.2 47.3 31.4C47.6 31.7 48.1 32.2 48.6 32.8C48.8 33 48.9 33.2 49.1 33.4C49.5 33.9 50 34.5 50.4 35.2C50.6 35.5 50.7 35.9 50.9 36.3C51.2 37 51.4 37.8 51.5 38.5C51.6 38.8 51.6 39 51.6 39.3C51.7 39.8 51.6 40.3 51.5 40.8C51.4 41.3 51.3 41.7 51 42.2C50.8 42.6 50.6 43.1 50.3 43.5C50.2 43.8 50 44 49.8 44.3C49.5 44.7 49.2 45 48.9 45.3C48.7 45.6 48.5 45.8 48.2 46.1C47.9 46.4 47.6 46.6 47.3 46.9L46.3 47.8C46.2 47.9 46.1 47.9 46 48L41.5 51.8V56.6H46.3L46.7 56.2C46.8 56.1 47 55.9 47.2 55.7C47.8 55 48.5 54.1 49.3 53C49.5 52.8 49.6 52.5 49.8 52.3C50.1 51.7 50.4 51 50.7 50.3C50.8 50 50.9 49.8 51 49.5C51.3 48.7 51.6 47.8 51.8 46.9C51.9 46.6 51.9 46.4 52 46.1C52.1 45.5 52.2 44.9 52.2 44.3C52.2 43.8 52.2 43.3 52.1 42.9C52.1 42.4 52 41.8 51.9 41.3L51.8 40.8C51.7 40.4 51.5 39.9 51.4 39.5C51 38.2 50.5 37 49.8 35.9L49.5 35.4C49.3 35 48.9 34.6 48.6 34.2C48.3 33.8 48 33.5 47.7 33.2C47.4 32.8 47 32.4 46.7 32.1L46 31.3C45.9 31.2 45.8 31.1 45.6 31.2L44.4 31.6V34.4L44.4 40.5L44.4 40.6Z" fill="#2081E2" />
        </svg>
      ),
    },
    {
      name: 'ChainLink',
      color: '#375BD2',
      svg: (
        <svg width="28" height="28" viewBox="0 0 37 42" fill="none">
          <path d="M18.5 0L15.2 1.9L3.3 8.8L0 10.7V31.3L3.3 33.2L15.2 40.1L18.5 42L21.8 40.1L33.7 33.2L37 31.3V10.7L33.7 8.8L21.8 1.9L18.5 0ZM8.5 27.4V14.6L18.5 8.9L28.5 14.6V27.4L18.5 33.1L8.5 27.4Z" fill="#375BD2" />
        </svg>
      ),
    },
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

        <div className="flex items-center justify-center gap-5 sm:gap-8 flex-wrap">
          {chainLogos.map((chain) => (
            <div key={chain.name}
              className="flex flex-col items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 hover:scale-110 cursor-default group"
              style={{
                background: 'rgba(6,28,44,0.6)',
                border: `1px solid ${chain.color}18`,
              }}
            >
              <div className="w-11 h-11 flex items-center justify-center opacity-75 group-hover:opacity-100 transition-opacity duration-300">
                {chain.svg}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider transition-colors duration-300"
                style={{ color: `${chain.color}90` }}>
                {chain.name}
              </span>
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
