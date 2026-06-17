'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';

interface ScoreBarProps {
  label: string;
  score: number;
  index: number;
  isWinning: boolean;
  delta?: number; // non-zero when what-if constraints are toggled
}

const OPTION_PALETTE = [
  {
    gradient: 'linear-gradient(90deg, #3b6fff, #6366f1)',
    glow: 'rgba(59, 111, 255, 0.4)',
    label: '#7ba7ff',
    bg: 'rgba(59, 111, 255, 0.08)',
    border: 'rgba(59, 111, 255, 0.2)',
    tag: 'rgba(59, 111, 255, 0.15)',
  },
  {
    gradient: 'linear-gradient(90deg, #10b981, #06b6d4)',
    glow: 'rgba(16, 185, 129, 0.4)',
    label: '#34d399',
    bg: 'rgba(16, 185, 129, 0.08)',
    border: 'rgba(16, 185, 129, 0.2)',
    tag: 'rgba(16, 185, 129, 0.15)',
  },
  {
    gradient: 'linear-gradient(90deg, #f59e0b, #ef4444)',
    glow: 'rgba(245, 158, 11, 0.4)',
    label: '#fbbf24',
    bg: 'rgba(245, 158, 11, 0.08)',
    border: 'rgba(245, 158, 11, 0.2)',
    tag: 'rgba(245, 158, 11, 0.15)',
  },
  {
    gradient: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
    glow: 'rgba(139, 92, 246, 0.4)',
    label: '#a78bfa',
    bg: 'rgba(139, 92, 246, 0.08)',
    border: 'rgba(139, 92, 246, 0.2)',
    tag: 'rgba(139, 92, 246, 0.15)',
  },
];

export default function ScoreBar({ label, score, index, isWinning, delta = 0 }: ScoreBarProps) {
  const palette = OPTION_PALETTE[index % OPTION_PALETTE.length];

  return (
    <div className="p-5 rounded-2xl transition-all duration-300"
      style={{
        background: isWinning
          ? 'rgba(59, 111, 255, 0.05)'
          : 'rgba(13, 17, 32, 0.70)',
        border: isWinning
          ? '1px solid rgba(59, 111, 255, 0.35)'
          : `1px solid ${palette.border}`,
        backdropFilter: 'blur(12px)',
        boxShadow: isWinning ? '0 0 30px rgba(59, 111, 255, 0.15)' : 'none',
      }}>

      {/* Header row */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2.5">
          {/* Option number tag */}
          <div className="px-2 py-0.5 rounded-md text-[10px] font-bold"
            style={{ background: palette.tag, color: palette.label, border: `1px solid ${palette.border}` }}>
            Option {index + 1}
          </div>
          <h5 className="text-xs font-bold truncate max-w-[180px] sm:max-w-[260px]"
            style={{ color: '#e2e8f0' }}>
            {label}
          </h5>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isWinning && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold animate-glow-pulse"
              style={{
                background: 'rgba(59, 111, 255, 0.15)',
                border: '1px solid rgba(59, 111, 255, 0.35)',
                color: '#7ba7ff',
              }}>
              <Crown className="h-3 w-3" />
              Best Match
            </div>
          )}
          {delta !== 0 && (
            <div className="px-2 py-0.5 rounded-md text-[10px] font-black"
              style={{
                background: delta > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                border: `1px solid ${delta > 0 ? 'rgba(16, 185, 129, 0.35)' : 'rgba(244, 63, 94, 0.35)'}`,
                color: delta > 0 ? '#34d399' : '#fb7185',
              }}>
              {delta > 0 ? `+${delta}` : delta}
            </div>
          )}
          <div className="text-xl font-black mono-value" style={{ color: palette.label }}>
            {score}%
          </div>
        </div>
      </div>

      {/* Score track */}
      <div className="h-3 w-full rounded-full overflow-hidden"
        style={{ background: 'rgba(99, 116, 163, 0.12)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ type: 'spring', stiffness: 45, damping: 12, delay: index * 0.1 }}
          className="h-full rounded-full"
          style={{
            background: palette.gradient,
            boxShadow: `0 0 10px ${palette.glow}`,
          }}
        />
      </div>

      {/* Scale labels */}
      <div className="flex justify-between mt-1.5">
        {['0', '25', '50', '75', '100'].map((v) => (
          <span key={v} className="text-[9px] font-semibold" style={{ color: '#3a4a6b' }}>{v}</span>
        ))}
      </div>
    </div>
  );
}
