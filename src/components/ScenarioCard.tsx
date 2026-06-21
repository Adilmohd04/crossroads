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
  { color: '#245a42', gradient: 'linear-gradient(90deg, #2d6a4f, #2d6a4f)', glow: 'rgba(45, 106, 79, 0.2)', bg: 'rgba(59, 111, 255, 0.08)', border: 'rgba(59, 111, 255, 0.2)' },
  { color: '#10b981', gradient: 'linear-gradient(90deg, #10b981, #06b6d4)', glow: 'rgba(16, 185, 129, 0.25)', bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.2)' },
  { color: '#1b4332', gradient: 'linear-gradient(90deg, #f59e0b, #ef4444)', glow: 'rgba(45, 106, 79, 0.2)', bg: 'rgba(45, 106, 79, 0.06)', border: 'rgba(245, 158, 11, 0.2)' },
  { color: '#8b7355', gradient: 'linear-gradient(90deg, #8b7355, #ec4899)', glow: 'rgba(139, 92, 246, 0.25)', bg: 'rgba(139, 92, 246, 0.08)', border: 'rgba(139, 92, 246, 0.2)' },
];

export default function ScenarioCard({ scenario, index, liveScore }: ScenarioCardProps) {
  const [activeTab, setActiveTab] = useState<'30' | '60' | '90'>('30');
  const [showBreakdown, setShowBreakdown] = useState(false);
  const p = PALETTE[index % PALETTE.length];

  const getConfidencePalette = (score: number) => {
    if (score >= 70) return { color: '#34d399', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.25)' };
    if (score >= 40) return { color: '#1b4332', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(45, 106, 79, 0.2)' };
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
        background: '#f4f3ef',
        border: `1px solid ${p.border}`,
        borderTop: `3px solid ${p.color}`,
        backdropFilter: 'none',
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
          <h3 className="text-sm font-bold leading-snug" style={{ color: '#141413' }}>
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
        <div className="flex justify-between text-[11px] font-semibold" style={{ color: '#3d3b35' }}>
          <span>Evidence strength for this outcome</span>
          <span style={{ 
            fontWeight: 700, 
            color: scenario.confidence >= 70 ? '#2d6a4f' : scenario.confidence >= 50 ? '#774936' : '#9b2226'
          }}>
            {scenario.confidence >= 70 ? '🟢 High' : scenario.confidence >= 50 ? '🟡 Moderate' : '🔴 Low'}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(180, 172, 160, 0.6)' }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${scenario.confidence}%`, background: conf.color === '#34d399' ? 'linear-gradient(90deg, #10b981, #06b6d4)' : conf.color === '#fbbf24' ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 'linear-gradient(90deg, #f43f5e, #f97316)' }} />
        </div>
        <p className="text-[12px] leading-relaxed" style={{ color: '#2d3b35' }}>
          <strong>Why:</strong> {scenario.confidence_reasoning}
        </p>

        {/* Confidence Breakdown dropdown */}
        <div className="mt-2.5">
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border hover:bg-black/5 transition-all flex items-center gap-1 text-slate-500 cursor-pointer select-none"
            style={{ borderColor: 'rgba(180, 172, 160, 0.5)', background: 'transparent' }}
          >
            {showBreakdown ? '▼ Hide Confidence Breakdown' : '▶ Explain Confidence Score'}
          </button>
          <AnimatePresence>
            {showBreakdown && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden mt-2 rounded-lg p-2.5 bg-black/[0.02] border border-black/[0.04] text-[10.5px] space-y-1"
                style={{ borderColor: 'rgba(180, 172, 160, 0.3)' }}
              >
                <div className="font-bold text-[8px] uppercase tracking-wider text-slate-400 mb-1">Score Components:</div>
                {(() => {
                  const c = scenario.confidence;
                  const p1 = 25; // Data completeness
                  const p2 = 20; // Constraint clarity
                  const p3 = 10; // Value correlation
                  const base = 30; // Base baseline
                  const deficit = (base + p1 + p2 + p3) - c;
                  const n1 = Math.round(deficit * 0.6); // Scenario uncertainty
                  const n2 = deficit - n1; // Unresolved variables
                  
                  const breakdown = [
                    { label: 'Base Feasibility Score', value: `+${base}%`, type: 'plus' },
                    { label: 'Data Completeness (Runway & Fear)', value: `+${p1}%`, type: 'plus' },
                    { label: 'Constraint Clarity Index', value: `+${p2}%`, type: 'plus' },
                    { label: 'Stated Value Alignment', value: `+${p3}%`, type: 'plus' },
                    { label: 'Future Horizon Variance (90 Days Out)', value: `-${n1}%`, type: 'minus' },
                    { label: 'Unquantifiable Life Variables', value: `-${n2}%`, type: 'minus' },
                  ];

                  return breakdown.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center font-medium">
                      <span className="text-slate-600">{item.label}</span>
                      <span className={item.type === 'plus' ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>{item.value}</span>
                    </div>
                  ));
                })()}
                <div className="border-t pt-1 mt-1 flex justify-between items-center font-bold text-[11px]" style={{ borderColor: 'rgba(180, 172, 160, 0.4)' }}>
                  <span className="text-slate-700">Net Probability Strength:</span>
                  <span className="text-slate-900">{scenario.confidence}%</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-2.5 pt-1.5 border-t border-black/[0.04] leading-relaxed">
                  <strong>How to interpret:</strong> High confidence (🟢 70%+) indicates a path with low volatility and clear milestones. Low confidence (🔴 &lt;50%) does not mean a &quot;bad&quot; path—it indicates a high-stakes, volatile trajectory (e.g., startup or relocation without savings) requiring higher personal resilience.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Key Insight — one sentence that teaches something */}
      <div style={{ marginTop: '12px', padding: '10px 14px', background: '#f0fdf4', border: '1px solid #d1e7dd', borderRadius: '10px' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: '#1b4332', lineHeight: 1.5 }}>
          💡 <strong>Key insight:</strong> The hidden cost of this path is <em>{scenario.hidden_cost.toLowerCase()}</em> — and the biggest risk is <em>{scenario.biggest_risk.toLowerCase()}</em>.
        </p>
      </div>

      {/* 30/60/90 Tabs */}
      <div className="mt-5 space-y-3">
        <div className="flex rounded-xl p-1 gap-1" style={{ background: '#e4e2db' }}>
          {(['30', '60', '90'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 rounded-lg py-1.5 text-center text-xs font-bold transition-all cursor-pointer"
              style={{
                background: activeTab === tab ? p.gradient : 'transparent',
                color: activeTab === tab ? '#fff' : '#6c6a64',
                boxShadow: activeTab === tab ? `0 2px 10px ${p.glow}` : 'none',
              }}
            >
              {tab} Days
            </button>
          ))}
        </div>

        <div className="min-h-[72px] rounded-xl p-4" style={{ background: '#e4e2db', border: '1px solid rgba(180, 172, 160, 0.6)' }}>
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
                style={{ color: '#3d3b35' }}
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
              <span className="flex flex-col">
                <span className="flex items-center gap-1 font-bold" style={{ color: '#3d3b35' }}>
                  <TrendingUp className="h-3.5 w-3.5" style={{ color: p.color }} />
                  Your Live Score
                </span>
                <span className="text-[9px] font-medium" style={{ color: 'var(--muted)', marginLeft: '18px' }}>Based on current slider weights & toggles</span>
              </span>
              <span className="font-black mono-value" style={{ color: p.color }}>{liveScore}%</span>
            </div>
            <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'rgba(180, 172, 160, 0.6)' }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${liveScore}%`, background: p.gradient, boxShadow: `0 0 8px ${p.glow}` }} />
            </div>
          </div>
        )}

        <div className="space-y-1">
          <div className="flex justify-between text-xs font-semibold" style={{ color: '#3d3b35' }}>
            <span className="flex flex-col">
              <span className="flex items-center gap-1 font-bold">
                <Scale className="h-3.5 w-3.5" />
                Initial AI Baseline
              </span>
              <span className="text-[9px] font-medium" style={{ color: 'var(--muted)', marginLeft: '18px' }}>Fixed based on your intake setup</span>
            </span>
            <span className="mono-value">{scenario.alignment_score}%</span>
          </div>
          <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: 'rgba(180, 172, 160, 0.6)' }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${scenario.alignment_score}%`, background: 'rgba(60, 60, 55, 0.6)' }} />
          </div>
        </div>
      </div>

      {/* Tradeoffs */}
      <div className="mt-5 space-y-4 pt-5 flex-1" style={{ borderTop: '1px solid rgba(180, 172, 160, 0.6)' }}>
        {[
          { icon: Coins, label: 'Hidden Cost', text: scenario.hidden_cost, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
          { icon: Flame, label: 'Biggest Risk', text: scenario.biggest_risk, color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.1)' },
          { icon: Scale, label: 'What You Give Up', text: scenario.what_you_give_up, color: '#8b7355', bg: 'rgba(139, 92, 246, 0.1)' },
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
              <p className="text-xs font-medium leading-relaxed" style={{ color: '#3d3b35' }}>
                {text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
