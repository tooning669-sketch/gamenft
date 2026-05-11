'use client';

import React from 'react';
import { Ball as BallType, GRID_COLS } from '@/lib/gameTypes';
import Ball from './Ball';

interface TargetGridProps {
  balls: BallType[];
  onBallClick: (ball: BallType) => void;
  onBallHover?: (ball: BallType) => void;
  onBallLeave?: () => void;
}

export default function TargetGrid({ balls, onBallClick, onBallHover, onBallLeave }: TargetGridProps) {
  return (
    <div className="relative w-full">
      {/* Grid background */}
      <div
        className="relative rounded-2xl p-4 sm:p-5"
        style={{
          background: 'linear-gradient(180deg, rgba(7, 89, 105, 0.42) 0%, rgba(6, 95, 70, 0.34) 100%)',
          border: '2px solid rgba(125, 211, 252, 0.36)',
          boxShadow: '0 18px 42px rgba(8,47,73,0.2), inset 0 0 24px rgba(255,255,255,0.08)',
        }}
      >
        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-yellow-200/55 rounded-tl-2xl" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-200/55 rounded-tr-2xl" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-lime-200/55 rounded-bl-2xl" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-sky-200/55 rounded-br-2xl" />

        {/* Ball grid */}
        <div
          className="grid gap-3 sm:gap-4"
          style={{
            gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
          }}
        >
          {balls.map((ball) => (
            <div
              key={ball.id}
              className={`transition-all duration-300 ${ball.isPopping ? 'scale-0 opacity-0' : ''}`}
            >
              <Ball
                ball={ball}
                onClick={onBallClick}
                onHover={onBallHover}
                onLeave={onBallLeave}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
