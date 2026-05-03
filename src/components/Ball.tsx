'use client';

import React from 'react';
import { Ball as BallType } from '@/lib/gameTypes';

interface BallProps {
  ball: BallType;
  onClick: (ball: BallType) => void;
}

export default function Ball({ ball, onClick }: BallProps) {
  const hpPercent = (ball.hp / ball.maxHp) * 100;

  // Tier star indicator
  const tierStars = '★'.repeat(ball.tier);

  // Kawaii face based on HP
  const getFace = () => {
    if (ball.isPopping) return { eyes: '✕ ✕', mouth: '〰' };
    if (hpPercent > 70) return { eyes: '◕ ◕', mouth: '◡' }; // Happy
    if (hpPercent > 40) return { eyes: '◑ ◐', mouth: '~' }; // Worried
    if (hpPercent > 15) return { eyes: '◉ ◉', mouth: '△' }; // Scared
    return { eyes: '× ×', mouth: 'ω' }; // Critical
  };

  const face = getFace();
  const animDelay = `${(ball.row * 7 + ball.col) * 0.15}s`;

  return (
    <div className="relative" id={`ball-wrapper-${ball.id}`}>
      <button
        onClick={() => onClick(ball)}
        disabled={ball.isPopping}
        className={`
          relative w-full aspect-square rounded-full cursor-pointer
          transition-all duration-150 select-none
          hover:scale-110 hover:z-10
          active:scale-95
          ${ball.isHit ? 'animate-ball-hit' : ''}
          ${ball.isPopping ? 'animate-ball-pop pointer-events-none' : 'animate-balloon-float'}
        `}
        style={{
          background: `radial-gradient(circle at 35% 30%, ${ball.gradientFrom}dd, ${ball.gradientFrom}, ${ball.gradientTo})`,
          boxShadow: `
            inset 0 -6px 12px rgba(0,0,0,0.25),
            inset 0 6px 12px rgba(255,255,255,0.25),
            0 6px 16px rgba(0,0,0,0.35),
            0 0 20px ${ball.color}35
          `,
          animationDelay: animDelay,
        }}
      >
        {/* Big shine highlight */}
        <div
          className="absolute top-[10%] left-[15%] w-[40%] h-[30%] rounded-full opacity-70"
          style={{
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.9), rgba(255,255,255,0.3) 50%, transparent)',
          }}
        />

        {/* Small secondary shine */}
        <div
          className="absolute top-[20%] right-[22%] w-[12%] h-[12%] rounded-full opacity-50"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.8), transparent)',
          }}
        />

        {/* Kawaii face */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Eyes */}
          <div
            className="text-white font-bold leading-none tracking-wider"
            style={{
              fontSize: 'clamp(6px, 1.8vw, 12px)',
              textShadow: '0 1px 2px rgba(0,0,0,0.5)',
              letterSpacing: '0.15em',
            }}
          >
            {face.eyes}
          </div>
          {/* Mouth */}
          <div
            className="text-white leading-none -mt-0.5"
            style={{
              fontSize: 'clamp(5px, 1.4vw, 10px)',
              textShadow: '0 1px 2px rgba(0,0,0,0.4)',
            }}
          >
            {face.mouth}
          </div>
          {/* HP number */}
          <span
            className="font-bold text-white/90 drop-shadow-lg leading-none mt-0.5"
            style={{
              fontSize: 'clamp(7px, 1.8vw, 13px)',
              textShadow: '0 1px 3px rgba(0,0,0,0.8)',
            }}
          >
            {ball.hp}
          </span>
        </div>

        {/* Tier stars */}
        <div className="absolute -top-0.5 left-1/2 -translate-x-1/2">
          <span
            className="text-yellow-300 leading-none"
            style={{
              fontSize: 'clamp(5px, 1vw, 8px)',
              textShadow: '0 0 4px rgba(234,179,8,0.6)',
            }}
          >
            {tierStars}
          </span>
        </div>

        {/* HP bar under ball */}
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-[80%] h-1 rounded-full bg-black/40 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${hpPercent}%`,
              background: hpPercent > 60
                ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                : hpPercent > 30
                  ? 'linear-gradient(90deg, #eab308, #fbbf24)'
                  : 'linear-gradient(90deg, #ef4444, #f87171)',
            }}
          />
        </div>

        {/* Blush cheeks when happy */}
        {hpPercent > 70 && (
          <>
            <div
              className="absolute rounded-full opacity-30"
              style={{
                width: '16%',
                height: '10%',
                top: '42%',
                left: '12%',
                background: '#ff6b9d',
              }}
            />
            <div
              className="absolute rounded-full opacity-30"
              style={{
                width: '16%',
                height: '10%',
                top: '42%',
                right: '12%',
                background: '#ff6b9d',
              }}
            />
          </>
        )}

        {/* Pop particles (shown during pop) */}
        {ball.isPopping && (
          <>
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full animate-particle"
                style={{
                  width: i % 3 === 0 ? '6px' : '4px',
                  height: i % 3 === 0 ? '6px' : '4px',
                  background: i % 2 === 0 ? ball.color : '#fff',
                  top: '50%',
                  left: '50%',
                  '--particle-angle': `${i * 36}deg`,
                  '--particle-distance': `${40 + Math.random() * 35}px`,
                } as React.CSSProperties}
              />
            ))}
          </>
        )}
      </button>

      {/* Balloon string/ribbon */}
      {!ball.isPopping && ball.hp > 0 && (
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <svg width="8" height="14" viewBox="0 0 8 14" className="animate-string-sway" style={{ animationDelay: animDelay }}>
            <path
              d="M4 0 C4 3, 2 5, 4 7 C6 9, 3 11, 4 14"
              stroke={ball.color}
              strokeWidth="1.5"
              fill="none"
              opacity="0.6"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
