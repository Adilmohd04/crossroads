'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ScoreBarProps {
  label: string;
  score: number;
  index: number;
  baselineScore: number;
  delta?: number; // non-zero when what-if constraints are toggled
}

const OPTION_PALETTE = [
  {
    gradient: 'linear-gradient(90deg, #ea580c, #ea580c)',
    glow: 'rgba(234, 88, 12, 0.3)',
    label: 'var(--orange-accent)',
    bg: 'var(--orange-soft)',
    border: 'var(--border)',
    tag: 'var(--orange-soft)',
  },
  {
    gradient: 'linear-gradient(90deg, #0d9488, #0d9488)',
    glow: 'rgba(13, 148, 136, 0.3)',
    label: 'var(--green-light)',
    bg: 'var(--green-soft)',
    border: 'var(--border)',
    tag: 'var(--green-soft)',
  },
  {
    gradient: 'linear-gradient(90deg, #16a34a, #16a34a)',
    glow: 'rgba(22, 163, 74, 0.3)',
    label: '#16a34a',
    bg: 'rgba(22, 163, 74, 0.08)',
    border: 'var(--border)',
    tag: 'rgba(22, 163, 74, 0.1)',
  },
  {
    gradient: 'linear-gradient(90deg, #8b5cf6, #8b5cf6)',
    glow: 'rgba(139, 92, 246, 0.3)',
    label: 'var(--wood)',
    bg: 'var(--wood-soft)',
    border: 'var(--border)',
    tag: 'var(--wood-soft)',
  },
];

/** Animated counter hook */
function useAnimatedCounter(target: number, duration: number = 600): number {
  const [current, setCurrent] = useState(target);
  const animRef = useRef<number | null>(null);
  const prevTarget = useRef(target);

  useEffect(() => {
    const from = prevTarget.current;
    const to = target;
    prevTarget.current = target;

    if (from === to) return;

    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = Math.round(from + (to - from) * eased);
      setCurrent(val);
      if (progress < 1) {
        animRef.current = requestAnimationFrame(tick);
      }
    };

    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [target, duration]);

  return current;
}

export default function ScoreBar({ label, score, index, baselineScore, delta = 0 }: ScoreBarProps) {
  const palette = OPTION_PALETTE[index % OPTION_PALETTE.length];
  const displayScore = useAnimatedCounter(score);
  const displayDelta = useAnimatedCounter(delta, 400);

  const hasDelta = delta !== 0;
  const isPositive = delta > 0;

  return (
    <div className="p-5 rounded-2xl transition-all duration-300 border relative overflow-hidden"
      style={{
        background: 'var(--card)',
        borderColor: hasDelta ? (isPositive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)') : 'var(--border)',
        boxShadow: hasDelta
          ? (isPositive ? '0 0 20px rgba(16, 185, 129, 0.08)' : '0 0 20px rgba(239, 68, 68, 0.08)')
          : 'var(--shadow)',
      }}>

      {/* Shimmer effect when delta active */}
      <AnimatePresence>
        {hasDelta && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: isPositive
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.03), transparent 60%)'
                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.03), transparent 60%)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Header row */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2.5">
          {/* Option number tag */}
          <div className="px-2 py-0.5 rounded-md text-[10px] font-bold border"
            style={{ background: palette.tag, color: palette.label, borderColor: 'var(--border-light)' }}>
            Option {index + 1}
          </div>
          <h5 className="text-xs font-bold truncate max-w-[180px] sm:max-w-[260px]"
            style={{ color: 'var(--ink)' }}>
            {label}
          </h5>
        </div>

        {/* Delta badge with animated counter and icon */}
        <AnimatePresence mode="wait">
          {hasDelta && (
            <motion.div
              initial={{ opacity: 0, scale: 0.6, x: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.6, x: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black border shrink-0"
              style={{
                background: isPositive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                borderColor: isPositive ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
                color: isPositive ? '#059669' : '#ef4444',
              }}>
              {isPositive
                ? <TrendingUp className="h-3.5 w-3.5" />
                : <TrendingDown className="h-3.5 w-3.5" />
              }
              <span>{displayDelta > 0 ? `+${displayDelta}` : displayDelta}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dual Scores Side-by-Side */}
      <div className="flex gap-4 items-center justify-between text-xs mb-3.5 pt-2 pb-2.5 border-t border-b" style={{ borderColor: 'var(--border-light)' }}>
        {hasDelta ? (
          <>
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Original (Before Sandbox)</span>
              <span className="text-xs font-bold mt-0.5 text-slate-500">
                {score - delta}%
              </span>
              <span className="text-[8px] text-slate-400 mt-0.5">priorities & stress-test</span>
            </div>
            
            <div className="flex items-center justify-center px-1">
              <span className="text-base font-black text-slate-300 select-none animate-pulse">→</span>
            </div>

            <div className="flex flex-col text-right">
              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Reality Shifted</span>
              <motion.span
                key={score}
                initial={{ scale: 1.25, y: -2 }}
                animate={{ scale: 1, y: 0 }}
                className="text-xs font-black mt-0.5"
                style={{ color: isPositive ? '#059669' : '#ef4444' }}
              >
                {displayScore}%
              </motion.span>
              <span className="text-[8px] mt-0.5" style={{ color: isPositive ? '#10b981' : '#f87171' }}>
                {isPositive ? 'improved' : 'decreased'}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Initial AI Baseline</span>
              <span className="text-xs font-bold mt-0.5" style={{ color: 'var(--body)' }}>{baselineScore}%</span>
              <span className="text-[8px] mt-0.5" style={{ color: 'var(--muted)' }}>from intake answers</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Your Live Score</span>
              <span className="text-xs font-bold mt-0.5" style={{ color: palette.label }}>
                {displayScore}%
              </span>
              <span className="text-[8px] mt-0.5" style={{ color: 'var(--muted)' }}>updates with sliders & toggles</span>
            </div>
          </>
        )}
      </div>

      {/* Score track with before/after indicator */}
      <div className="relative h-3 w-full rounded-full overflow-hidden"
        style={{ background: 'var(--surface)' }}>
        {/* Ghost bar (original score) */}
        {hasDelta && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score - delta}%` }}
            className="absolute top-0 left-0 h-full rounded-full"
            style={{
              background: 'rgba(180, 172, 160, 0.4)',
              zIndex: 0,
            }}
          />
        )}
        {/* Active bar */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ type: 'spring', stiffness: 45, damping: 12, delay: index * 0.1 }}
          className="absolute top-0 left-0 h-full rounded-full"
          style={{
            background: palette.gradient,
            boxShadow: `0 0 10px ${palette.glow}`,
            zIndex: 1,
          }}
        />
      </div>

      {/* Scale labels */}
      <div className="flex justify-between mt-1.5">
        {['0', '25', '50', '75', '100'].map((v) => (
          <span key={v} className="text-[9px] font-semibold" style={{ color: 'var(--muted)' }}>{v}</span>
        ))}
      </div>
    </div>
  );
}
