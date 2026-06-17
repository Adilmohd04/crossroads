'use client';

import React from 'react';
import { Coins, Heart, TrendingUp, Shield, Users } from 'lucide-react';
import { DimensionWeights } from '../lib/scoring';

interface DimensionSlidersProps {
  weights: DimensionWeights;
  onChange: (weights: DimensionWeights) => void;
}

interface DimensionConfig {
  key: keyof DimensionWeights;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  glow: string;
  gradient: string;
}

export default function DimensionSliders({ weights, onChange }: DimensionSlidersProps) {
  const dimensions: DimensionConfig[] = [
    {
      key: 'financial',
      label: 'Financial Outcome',
      description: 'Earnings, expenses & budget impact',
      icon: Coins,
      color: '#10b981',
      glow: 'rgba(16, 185, 129, 0.3)',
      gradient: 'linear-gradient(90deg, #10b981, #06b6d4)',
    },
    {
      key: 'emotional',
      label: 'Emotional Well-being',
      description: 'Stress levels, peace of mind & happiness',
      icon: Heart,
      color: '#f43f5e',
      glow: 'rgba(244, 63, 94, 0.3)',
      gradient: 'linear-gradient(90deg, #f43f5e, #f97316)',
    },
    {
      key: 'growth',
      label: 'Personal Growth',
      description: 'Learning, skill compounding & progression',
      icon: TrendingUp,
      color: '#3b6fff',
      glow: 'rgba(59, 111, 255, 0.3)',
      gradient: 'linear-gradient(90deg, #3b6fff, #6366f1)',
    },
    {
      key: 'stability',
      label: 'Predictability & Safety',
      description: 'Job security, low risk & routine stability',
      icon: Shield,
      color: '#f59e0b',
      glow: 'rgba(245, 158, 11, 0.3)',
      gradient: 'linear-gradient(90deg, #f59e0b, #ef4444)',
    },
    {
      key: 'relationships',
      label: 'Social & Relationships',
      description: 'Proximity to family, partner & social network',
      icon: Users,
      color: '#8b5cf6',
      glow: 'rgba(139, 92, 246, 0.3)',
      gradient: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
    },
  ];

  const handleSliderChange = (key: keyof DimensionWeights, value: number) => {
    onChange({ ...weights, [key]: value });
  };

  return (
    <div className="rounded-2xl p-5 space-y-6 md:p-6 h-full"
      style={{
        background: 'rgba(13, 17, 32, 0.75)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(99, 116, 163, 0.2)',
      }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(99, 116, 163, 0.15)', paddingBottom: '12px' }}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #3b6fff, #8b5cf6)' }} />
          <h4 className="text-sm font-bold" style={{ color: '#f0f4ff' }}>Adjust Value Weights</h4>
        </div>
        <p className="text-[11px] font-medium leading-relaxed" style={{ color: '#5c6b8c' }}>
          Drag sliders to re-rank options by your real-world priorities. Scores update live.
        </p>
      </div>

      {/* Sliders */}
      <div className="space-y-5">
        {dimensions.map((dim) => {
          const Icon = dim.icon;
          const val = weights[dim.key];
          const pct = ((val - 10) / 90) * 100; // 10–100 range → 0–100%

          return (
            <div key={dim.key} className="space-y-2 group">
              {/* Label row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
                    style={{ background: `${dim.color}18`, border: `1px solid ${dim.color}30` }}>
                    <Icon className="h-4 w-4" style={{ color: dim.color }} />
                  </div>
                  <div>
                    <span className="text-xs font-bold block" style={{ color: '#e2e8f0' }}>{dim.label}</span>
                    <span className="text-[10px] font-medium block" style={{ color: '#5c6b8c' }}>{dim.description}</span>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-lg text-xs font-bold mono-value"
                  style={{
                    background: `${dim.color}15`,
                    border: `1px solid ${dim.color}25`,
                    color: dim.color,
                    minWidth: '46px',
                    textAlign: 'center',
                  }}>
                  {val}
                </div>
              </div>

              {/* Track + fill */}
              <div className="relative h-2 rounded-full cursor-pointer"
                style={{ background: 'rgba(99, 116, 163, 0.15)' }}>
                {/* Filled portion */}
                <div className="absolute top-0 left-0 h-full rounded-full transition-all duration-200"
                  style={{
                    width: `${pct}%`,
                    background: dim.gradient,
                    boxShadow: `0 0 8px ${dim.glow}`,
                  }} />
                {/* Input overlay */}
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={val}
                  onChange={(e) => handleSliderChange(dim.key, parseInt(e.target.value))}
                  className="slider-range absolute inset-0 w-full opacity-0 cursor-pointer h-full z-10"
                  style={{ margin: 0 }}
                />
                {/* Thumb indicator */}
                <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 pointer-events-none transition-all duration-200"
                  style={{
                    left: `calc(${pct}% - 8px)`,
                    background: dim.gradient,
                    borderColor: 'rgba(255,255,255,0.2)',
                    boxShadow: `0 0 12px ${dim.glow}`,
                  }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
