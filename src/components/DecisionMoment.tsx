'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Sparkles, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface DecisionMomentProps {
  options: string[];
}

const OPTION_COLORS = [
  { gradient: 'linear-gradient(135deg, #3b6fff 0%, #6366f1 100%)', glow: 'rgba(59, 111, 255, 0.4)' },
  { gradient: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)', glow: 'rgba(16, 185, 129, 0.4)' },
  { gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)', glow: 'rgba(245, 158, 11, 0.4)' },
  { gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)', glow: 'rgba(139, 92, 246, 0.4)' },
];

export default function DecisionMoment({ options }: DecisionMomentProps) {
  const { selectPath, isLoading } = useApp();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="w-full text-center py-10 px-6 rounded-2xl max-w-2xl mx-auto relative overflow-hidden"
      style={{
        background: 'rgba(13, 17, 32, 0.8)',
        border: '1px solid rgba(59, 111, 255, 0.25)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 0 60px rgba(59, 111, 255, 0.1)',
      }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(59,111,255,0.08) 0%, transparent 70%)',
        }} />

      {/* Icon */}
      <div className="relative mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, #3b6fff, #8b5cf6)',
          boxShadow: '0 8px 24px rgba(59, 111, 255, 0.4)',
        }}>
        <div className="absolute inset-0 rounded-2xl"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)' }} />
        <Sparkles className="h-6 w-6 text-white relative z-10" />
      </div>

      <h3 className="text-xl font-black tracking-tight mb-2" style={{ color: '#f0f4ff' }}>
        The Decision Moment
      </h3>
      <p className="text-sm font-medium max-w-sm mx-auto leading-relaxed mb-8" style={{ color: '#5c6b8c' }}>
        Based on everything above — which path feels right? Committing logs this to your Decision Journal.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        {options.map((option, idx) => {
          const palette = OPTION_COLORS[idx % OPTION_COLORS.length];
          return (
            <button
              key={option + idx}
              type="button"
              disabled={isLoading}
              onClick={() => selectPath(option)}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-white transition-all disabled:pointer-events-none disabled:opacity-50 cursor-pointer relative overflow-hidden"
              style={{
                background: palette.gradient,
                boxShadow: `0 4px 20px ${palette.glow}`,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 30px ${palette.glow}`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = '';
                (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 20px ${palette.glow}`;
              }}
            >
              {/* Gloss */}
              <div className="absolute inset-0"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)' }} />
              <Compass className="h-4 w-4 shrink-0 relative z-10" />
              <span className="line-clamp-1 relative z-10">{option}</span>
              <ArrowRight className="h-4 w-4 shrink-0 relative z-10" />
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
