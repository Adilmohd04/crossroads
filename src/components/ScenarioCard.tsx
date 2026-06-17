'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  TrendingUp,
  Coins,
  Flame,
  Scale
} from 'lucide-react';
import { Scenario } from '../lib/types';

interface ScenarioCardProps {
  scenario: Scenario;
  index: number;
  liveScore?: number;
}

const PALETTE = [
  { color: '#3b6fff', gradient: 'linear-gradient(90deg, #3b6fff, #6366f1)', glow: 'rgba(59, 111, 255, 0.25)', bg: 'rgba(59, 111, 255, 0.08)', border: 'rgba(59, 111, 255, 0.2)' },
  { color: '#10b981', gradient: 'linear-gradient(90deg, #10b981, #06b6d4)', glow: 'rgba(16, 185, 129, 0.25)', bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.2)' },
  { color: '#f59e0b', gradient: 'linear-gradient(90deg, #f59e0b, #ef4444)', glow: 'rgba(245, 158, 11, 0.25)', bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.2)' },
  { color: '#8b5cf6', gradient: 'linear-gradient(90deg, #8b5cf6, #ec4899)', glow: 'rgba(139, 92, 246, 0.25)', bg: 'rgba(139, 92, 246, 0.08)', border: 'rgba(139, 92, 246, 0.2)' },
];

export default function ScenarioCard({ scenario, index, liveScore }: ScenarioCardProps) {
  const [activeTab, setActiveTab] = useState<'30' | '60' | '90'>('30');
  const p = PALETTE[index % PALETTE.length];

  const getConfidencePalette = (score: number) => {
    if (score >= 70) return { color: '#34d399', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.25)' };
    if (score >= 40) return { color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.25)' };
    return { color: '#fb7185', bg: 'rgba(244, 63, 94, 0.12)', border: 'rgba(244, 63, 94, 0.25)' };
  };

  const getTabNarrative = () => {
    switch (activeTab) {
      case '30': return scenario.narrative_30_days;
      case '60': return scenario.narrative_60_days;
      case '90': return scenario.narrative_90_days;
    }
  };

  const conf = getConfidencePalette(scenario.confidence);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.12, duration: 0.45 }}
      className="flex flex-col rounded-2xl p-5 md:p-6 transition-all duration-300"
      style={{
        background: 'rgba(13, 17, 32, 0.75)',
        border: `1px solid ${p.border}`,
        borderTop: `3px solid ${p.color}`,
        backdropFilter: 'blur(14px)',
      }}
      whileHover={{ boxShadow: `0 12px 40px ${p.glow}` }}
    >
      {/* Header */}
      <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-start sm:justify-between"
        style={{ borderBottom: `1px solid ${p.border}` }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md"
              style={{ background: p.bg, color: p.color, border: `1px solid ${p.border}` }}>
              Path {index + 1}
            </span>
          </div>
          <h3 className="text-sm font-bold leading-snug" style={{ color: '#f0f4ff' }}>
            {scenario.option_name}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold shrink-0 self-start"
          style={{ background: conf.bg, border: `1px solid ${conf.border}`, color: conf.color }}>
          <span>{scenario.confidence}%</span>
          <span className="text-[10px] opacity-80">Likely</span>
        </div>
      </div>

      {/* Confidence Meter */}
      <div className="mt-4 space-y-1.5">
        <div className="flex justify-between text-[10px] font-semibold" style={{ color: '#5c6b8c' }}>
          <span>Simulation Confidence</span>
          <span>{scenario.confidence}/100</span>
        </div>
        <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(99, 116, 163, 0.15)' }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${scenario.confidence}%`, background: conf.color === '#34d399' ? 'linear-gradient(90deg, #10b981, #06b6d4)' : conf.color === '#fbbf24' ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 'linear-gradient(90deg, #f43f5e, #f97316)' }} />
        </div>
        <p className="text-[10px] italic leading-relaxed" style={{ color: '#5c6b8c' }}>
          {scenario.confidence_reasoning}
        </p>
      </div>

      {/* 30/60/90 Tabs */}
      <div className="mt-5 space-y-3">
        <div className="flex rounded-xl p-1 gap-1" style={{ background: 'rgba(8, 11, 20, 0.6)' }}>
          {(['30', '60', '90'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 rounded-lg py-1.5 text-center text-xs font-bold transition-all cursor-pointer"
              style={{
                background: activeTab === tab ? p.gradient : 'transparent',
                color: activeTab === tab ? '#fff' : '#5c6b8c',
                boxShadow: activeTab === tab ? `0 2px 10px ${p.glow}` : 'none',
              }}
            >
              {tab} Days
            </button>
          ))}
        </div>

        <div className="min-h-[72px] rounded-xl p-4" style={{ background: 'rgba(8, 11, 20, 0.5)', border: '1px solid rgba(99, 116, 163, 0.1)' }}>
          <div className="flex gap-2 items-start">
            <Calendar className="h-4 w-4 shrink-0 mt-0.5" style={{ color: p.color }} />
            <AnimatePresence mode="wait">
              <motion.p
                key={activeTab}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="text-xs font-medium leading-relaxed"
                style={{ color: '#9ba8c9' }}
              >
                {getTabNarrative()}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Score Bars */}
      <div className="mt-5 space-y-3">
        {liveScore !== undefined && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="flex items-center gap-1" style={{ color: '#9ba8c9' }}>
                <TrendingUp className="h-3.5 w-3.5" style={{ color: p.color }} />
                Weighted Priority Score
              </span>
              <span className="font-black mono-value" style={{ color: p.color }}>{liveScore}%</span>
            </div>
            <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'rgba(99, 116, 163, 0.12)' }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${liveScore}%`, background: p.gradient, boxShadow: `0 0 8px ${p.glow}` }} />
            </div>
          </div>
        )}

        <div className="space-y-1">
          <div className="flex justify-between text-xs font-semibold" style={{ color: '#5c6b8c' }}>
            <span className="flex items-center gap-1">
              <Scale className="h-3.5 w-3.5" />
              AI Baseline Alignment
            </span>
            <span className="mono-value">{scenario.alignment_score}%</span>
          </div>
          <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: 'rgba(99, 116, 163, 0.12)' }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${scenario.alignment_score}%`, background: 'rgba(99, 116, 163, 0.5)' }} />
          </div>
        </div>
      </div>

      {/* Tradeoffs */}
      <div className="mt-5 space-y-4 pt-5 flex-1" style={{ borderTop: '1px solid rgba(99, 116, 163, 0.1)' }}>
        {[
          { icon: Coins, label: 'Hidden Cost', text: scenario.hidden_cost, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
          { icon: Flame, label: 'Biggest Risk', text: scenario.biggest_risk, color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.1)' },
          { icon: Scale, label: 'What You Give Up', text: scenario.what_you_give_up, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
        ].map(({ icon: Icon, label, text, color, bg }) => (
          <div key={label} className="flex gap-2.5 items-start">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
              style={{ background: bg }}>
              <Icon className="h-3.5 w-3.5" style={{ color }} />
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color }}>
                {label}
              </h4>
              <p className="text-xs font-medium leading-relaxed" style={{ color: '#9ba8c9' }}>
                {text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
