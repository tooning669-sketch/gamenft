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
        className="relative rounded-2xl p-3 sm:p-4"
        style={{
          background: 'linear-gradient(180deg, rgba(15,23,42,0.8) 0%, rgba(30,41,59,0.6) 100%)',
          border: '2px solid rgba(99, 102, 241, 0.3)',
          boxShadow: '0 0 30px rgba(99, 102, 241, 0.1), inset 0 0 30px rgba(0,0,0,0.3)',
        }}
      >
        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-indigo-400/50 rounded-tl-2xl" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-indigo-400/50 rounded-tr-2xl" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-indigo-400/50 rounded-bl-2xl" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-indigo-400/50 rounded-br-2xl" />

        {/* Ball grid */}
        <div
          className="grid gap-2 sm:gap-3"
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
