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

  return (
    <button
      onClick={() => onClick(ball)}
      disabled={ball.isPopping}
      className={`
        relative w-full aspect-square rounded-full cursor-pointer
        transition-all duration-150 select-none
        hover:scale-110 hover:z-10
        active:scale-95
        ${ball.isHit ? 'animate-ball-hit' : ''}
        ${ball.isPopping ? 'animate-ball-pop pointer-events-none' : ''}
      `}
      style={{
        background: `radial-gradient(circle at 35% 35%, ${ball.gradientFrom}, ${ball.gradientTo})`,
        boxShadow: `
          inset 0 -4px 8px rgba(0,0,0,0.3),
          inset 0 4px 8px rgba(255,255,255,0.2),
          0 4px 12px rgba(0,0,0,0.4),
          0 0 15px ${ball.color}40
        `,
      }}
    >
      {/* Shine highlight */}
      <div
        className="absolute top-[15%] left-[20%] w-[30%] h-[25%] rounded-full opacity-60"
        style={{
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.8), transparent)',
        }}
      />

      {/* HP Number */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-bold text-white drop-shadow-lg leading-none"
          style={{
            fontSize: 'clamp(10px, 2.5vw, 18px)',
            textShadow: '0 1px 3px rgba(0,0,0,0.8)',
          }}
        >
          {ball.hp}
        </span>
        <span
          className="text-yellow-300 leading-none mt-0.5"
          style={{
            fontSize: 'clamp(6px, 1.2vw, 10px)',
            textShadow: '0 0 4px rgba(234,179,8,0.5)',
          }}
        >
          {tierStars}
        </span>
      </div>

      {/* HP bar under ball */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[80%] h-1 rounded-full bg-black/40 overflow-hidden">
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

      {/* Pop particles (shown during pop) */}
      {ball.isPopping && (
        <>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-particle"
              style={{
                background: ball.color,
                top: '50%',
                left: '50%',
                '--particle-angle': `${i * 45}deg`,
                '--particle-distance': `${40 + Math.random() * 30}px`,
              } as React.CSSProperties}
            />
          ))}
        </>
      )}
    </button>
  );
}
