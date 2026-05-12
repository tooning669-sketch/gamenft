'use client';

import React, { useState, useEffect } from 'react';

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
  const tvl = useCounter(1250000);
  const dailyActive = useCounter(3421);

  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: '🎮',
      title: 'Play to Earn',
      desc: 'Pop bubbles and earn real crypto rewards including USDT, Gold coins, and rare NFT items.',
      color: '#22c55e',
      glowColor: 'rgba(34,197,94,0.2)',
    },
    {
      icon: '🔫',
      title: 'NFT Weapons',
      desc: 'Collect 13 unique weapons from Common to Legendary. Each gun has unique stats and rarity.',
      color: '#8b5cf6',
      glowColor: 'rgba(139,92,246,0.2)',
    },
    {
      icon: '🏪',
      title: 'Marketplace',
      desc: 'Trade weapons and items with other players. Buy from the shop or sell P2P for profit.',
      color: '#f59e0b',
      glowColor: 'rgba(245,158,11,0.2)',
    },
    {
      icon: '💵',
      title: 'USDT Rewards',
      desc: 'Convert your in-game earnings to real USDT. Withdraw anytime with low gas fees.',
      color: '#06b6d4',
      glowColor: 'rgba(6,182,212,0.2)',
    },
  ];

  const steps = [
    {
      num: '01',
      icon: '👛',
      title: 'Connect Wallet',
      desc: 'Link your MetaMask or any Web3 wallet to start playing.',
    },
    {
      num: '02',
      icon: '🎮',
      title: 'Play & Shoot',
      desc: 'Pop bubbles in 30-second rounds. Higher tier balls = better rewards.',
    },
    {
      num: '03',
      icon: '💰',
      title: 'Earn & Trade',
      desc: 'Collect NFT weapons, trade on marketplace, and withdraw USDT.',
    },
  ];

  const partners = [
    { name: 'Ethereum', icon: '⟠', color: '#627EEA' },
    { name: 'BNB Chain', icon: '⬡', color: '#F0B90B' },
    { name: 'Polygon', icon: '⬡', color: '#8247E5' },
    { name: 'Arbitrum', icon: '⬡', color: '#28A0F0' },
    { name: 'OpenSea', icon: '🌊', color: '#2081E2' },
    { name: 'ChainLink', icon: '⬡', color: '#375BD2' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-16 sm:space-y-24 pb-16">

      {/* ===== HERO SECTION ===== */}
      <section className="relative text-center py-12 sm:py-20">
        {/* Floating glow orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 left-[15%] w-40 h-40 rounded-full opacity-20 animate-pulse"
            style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.6), transparent 70%)' }} />
          <div className="absolute top-20 right-[20%] w-32 h-32 rounded-full opacity-15 animate-pulse"
            style={{ background: 'radial-gradient(circle, rgba(250,204,21,0.6), transparent 70%)', animationDelay: '1s' }} />
          <div className="absolute bottom-0 left-[40%] w-48 h-48 rounded-full opacity-15 animate-pulse"
            style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.5), transparent 70%)', animationDelay: '0.5s' }} />
        </div>

        <div className="relative z-10 space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest"
            style={{
              background: 'linear-gradient(135deg, rgba(250,204,21,0.15), rgba(56,189,248,0.08))',
              border: '1px solid rgba(250,204,21,0.35)',
              color: '#fde68a',
            }}>
            <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Live on Ethereum Mainnet
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black leading-none">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-cyan-200 to-yellow-200"
              style={{ textShadow: '0 0 80px rgba(56,189,248,0.3)' }}>
              BUBBLE
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-rose-300"
              style={{ textShadow: '0 0 80px rgba(251,191,36,0.3)' }}>
              BLAST
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-cyan-100/70 max-w-2xl mx-auto leading-relaxed font-medium">
            The ultimate <span className="text-yellow-300 font-bold">Play-to-Earn</span> bubble shooter.
            Pop bubbles, collect <span className="text-cyan-300 font-bold">NFT weapons</span>,
            and earn <span className="text-green-300 font-bold">real crypto rewards</span>.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              onClick={onPlayNow}
              className="group relative px-10 py-4 rounded-2xl text-lg font-black uppercase tracking-wider
                transition-all duration-300 cursor-pointer hover:scale-110 active:scale-95
                flex items-center gap-3"
              style={{
                background: 'linear-gradient(135deg, #fb7185, #facc15, #22c55e, #38bdf8)',
                boxShadow: '0 8px 32px rgba(251,191,36,0.35), 0 0 60px rgba(45,212,191,0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
                border: '2px solid rgba(255,255,255,0.5)',
                textShadow: '0 2px 8px rgba(0,0,0,0.5)',
              }}
            >
              <span className="text-2xl">🎮</span>
              <span className="text-white">PLAY NOW</span>
            </button>
            <a
              href="#how-it-works"
              className="px-8 py-4 rounded-2xl text-base font-bold uppercase tracking-wider
                transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95
                flex items-center gap-2"
              style={{
                background: 'rgba(8,47,73,0.6)',
                border: '1px solid rgba(125,211,252,0.35)',
                color: '#bae6fd',
              }}
            >
              <span>📖</span>
              Learn More
            </a>
          </div>

          {/* Quick stats under hero */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 pt-8">
            {[
              { label: 'Players', value: totalPlayers.toLocaleString(), icon: '👥' },
              { label: 'Rewards Paid', value: `$${totalRewards.toLocaleString()}`, icon: '💰' },
              { label: 'Daily Active', value: dailyActive.toLocaleString(), icon: '🔥' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-xl sm:text-2xl font-black text-white flex items-center justify-center gap-1.5">
                  <span>{stat.icon}</span>
                  {stat.value}
                </div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-cyan-200 to-lime-200">
            Why Bubble Blast?
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
            The most rewarding Web3 game on the blockchain
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <div
              key={i}
              className="relative rounded-2xl p-6 transition-all duration-300 cursor-default"
              style={{
                background: hoveredFeature === i
                  ? `linear-gradient(135deg, ${f.color}12, ${f.color}06)`
                  : 'linear-gradient(135deg, rgba(7,47,62,0.8), rgba(8,96,95,0.5))',
                border: `1px solid ${hoveredFeature === i ? f.color + '40' : 'rgba(125,211,252,0.15)'}`,
                boxShadow: hoveredFeature === i ? `0 0 30px ${f.glowColor}` : 'none',
                transform: hoveredFeature === i ? 'translateY(-4px)' : 'translateY(0)',
              }}
              onMouseEnter={() => setHoveredFeature(i)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-black text-white mb-2">{f.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              <div className="absolute top-4 right-4 w-8 h-8 rounded-full opacity-20"
                style={{ background: `radial-gradient(circle, ${f.color}, transparent)` }} />
            </div>
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-200">
            How It Works
          </h2>
          <p className="text-sm text-slate-400 mt-2">Start earning in 3 simple steps</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="relative rounded-2xl p-6 text-center group hover:scale-[1.03] transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(7,47,62,0.85), rgba(8,96,95,0.6))',
                border: '1px solid rgba(125,211,252,0.2)',
              }}>
              {/* Step number */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-sm font-black"
                style={{
                  background: 'linear-gradient(135deg, #38bdf8, #22d3ee)',
                  boxShadow: '0 4px 16px rgba(56,189,248,0.3)',
                  color: '#0c4a6e',
                }}>
                STEP {step.num}
              </div>
              <div className="text-5xl mt-4 mb-4">{step.icon}</div>
              <h3 className="text-lg font-black text-white mb-2">{step.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>

              {/* Connecting arrow (hidden on last step) */}
              {i < steps.length - 1 && (
                <div className="hidden sm:block absolute top-1/2 -right-3 text-cyan-400/40 text-2xl font-bold">→</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ===== LIVE STATS SECTION ===== */}
      <section>
        <div className="rounded-2xl p-8 sm:p-10"
          style={{
            background: 'linear-gradient(135deg, rgba(7,47,62,0.9), rgba(8,96,95,0.7))',
            border: '1px solid rgba(125,211,252,0.25)',
            boxShadow: '0 0 40px rgba(56,189,248,0.08)',
          }}>
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-200 via-emerald-200 to-cyan-200">
              📊 Platform Statistics
            </h2>
            <p className="text-[11px] text-slate-500 mt-1">Real-time data from the blockchain</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {[
              { label: 'Total Value Locked', value: `$${tvl.toLocaleString()}`, icon: '🔒', color: '#22c55e' },
              { label: 'Total Players', value: totalPlayers.toLocaleString(), icon: '👥', color: '#38bdf8' },
              { label: 'Rewards Distributed', value: `$${totalRewards.toLocaleString()}`, icon: '💰', color: '#fbbf24' },
              { label: 'NFTs Minted', value: '45,230', icon: '🎨', color: '#a78bfa' },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-4 rounded-xl"
                style={{
                  background: `${stat.color}08`,
                  border: `1px solid ${stat.color}20`,
                }}>
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-xl sm:text-2xl font-black" style={{ color: stat.color }}>{stat.value}</div>
                <div className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WEAPON SHOWCASE ===== */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-purple-200 to-violet-200">
            🔫 Legendary Arsenal
          </h2>
          <p className="text-sm text-slate-400 mt-2">Collect and trade 13 unique NFT weapons</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { name: 'Fire Demon', img: '/guns/gun_10_fire_demon.png', rarity: 'Legendary', color: '#fbbf24', dmg: 140 },
            { name: 'Shadow Cannon', img: '/guns/gun_12_shadow_cannon.png', rarity: 'Legendary', color: '#fbbf24', dmg: 160 },
            { name: 'Neon Blaster', img: '/guns/gun_13_neon_blaster.png', rarity: 'Legendary', color: '#fbbf24', dmg: 85 },
            { name: 'Ocean Beast', img: '/guns/gun_11_ocean_beast.png', rarity: 'Legendary', color: '#fbbf24', dmg: 90 },
          ].map((gun) => (
            <div key={gun.name} className="rounded-xl overflow-hidden group hover:scale-[1.05] transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(7,47,62,0.9), rgba(8,96,95,0.7))',
                border: `1px solid ${gun.color}30`,
                boxShadow: `0 0 20px ${gun.color}10`,
              }}>
              <div className="aspect-square flex items-center justify-center p-4"
                style={{ background: `radial-gradient(circle, ${gun.color}10, transparent 70%)` }}>
                <img src={gun.img} alt={gun.name} className="w-full h-full object-contain group-hover:scale-110 transition-all duration-300" />
              </div>
              <div className="p-3 border-t" style={{ borderColor: `${gun.color}15` }}>
                <div className="text-sm font-bold text-white">{gun.name}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase"
                    style={{ color: gun.color, background: `${gun.color}15`, border: `1px solid ${gun.color}25` }}>
                    {gun.rarity}
                  </span>
                  <span className="text-[10px] font-bold text-rose-400">💥 DMG {gun.dmg}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== PARTNERS & CHAINS ===== */}
      <section>
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-200 via-sky-200 to-slate-200">
            Supported Chains & Partners
          </h2>
        </div>

        <div className="flex items-center justify-center gap-6 sm:gap-10 flex-wrap">
          {partners.map((p) => (
            <div key={p.name} className="flex flex-col items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-110 cursor-default"
              style={{
                background: `${p.color}08`,
                border: `1px solid ${p.color}20`,
              }}>
              <span className="text-3xl" style={{ color: p.color }}>{p.icon}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{p.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== SECURITY & AUDIT ===== */}
      <section>
        <div className="rounded-2xl p-6 sm:p-8 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(7,47,62,0.8), rgba(8,96,95,0.6))',
            border: '1px solid rgba(125,211,252,0.18)',
          }}>
          <h3 className="text-xl font-black text-white mb-4">🔒 Security & Trust</h3>
          <div className="flex items-center justify-center gap-6 sm:gap-10 flex-wrap">
            {[
              { icon: '✅', label: 'CertiK Audited', color: '#22c55e' },
              { icon: '🛡️', label: 'Anti-Bot Protected', color: '#38bdf8' },
              { icon: '🔐', label: 'Smart Contract Verified', color: '#a78bfa' },
              { icon: '📜', label: 'Open Source', color: '#fbbf24' },
            ].map((badge) => (
              <div key={badge.label} className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                style={{
                  background: `${badge.color}08`,
                  border: `1px solid ${badge.color}20`,
                }}>
                <span className="text-lg">{badge.icon}</span>
                <span className="text-xs font-bold" style={{ color: badge.color }}>{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="text-center py-8">
        <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-lime-200 to-cyan-200 mb-4">
          Ready to Start Earning?
        </h2>
        <p className="text-sm text-slate-400 mb-8 max-w-md mx-auto">
          Join thousands of players already earning real crypto rewards every day.
        </p>
        <button
          onClick={onPlayNow}
          className="px-12 py-5 rounded-2xl text-xl font-black uppercase tracking-wider
            transition-all duration-300 cursor-pointer hover:scale-110 active:scale-95
            flex items-center gap-3 mx-auto"
          style={{
            background: 'linear-gradient(135deg, #fb7185, #facc15, #22c55e, #38bdf8)',
            boxShadow: '0 8px 32px rgba(251,191,36,0.35), 0 0 60px rgba(45,212,191,0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
            border: '2px solid rgba(255,255,255,0.5)',
            textShadow: '0 2px 8px rgba(0,0,0,0.5)',
          }}
        >
          <span className="text-2xl">🚀</span>
          <span className="text-white">LAUNCH GAME</span>
        </button>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t pt-8 pb-4" style={{ borderColor: 'rgba(125,211,252,0.15)' }}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎮</span>
            <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-200 to-yellow-200">
              BUBBLE BLAST
            </span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-yellow-300/15 text-yellow-200 border border-yellow-200/30 font-bold">
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
