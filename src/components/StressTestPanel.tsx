'use client';

import React from 'react';
import { AlertCircle, Flame, ShieldAlert, Sparkles } from 'lucide-react';

interface Stressor {
  id: string;
  name: string;
  icon: string;
  description: string;
  impactText: string;
  color: string;
  borderActive: string;
  bgActive: string;
}

const STRESSORS: Stressor[] = [
  {
    id: 'recession',
    name: 'Market Recession',
    icon: '📉',
    description: 'A sudden economic downturn squeezes budgets and makes jobs scarcer.',
    impactText: 'Financial scores drop by 20%, and stability becomes 2x more important.',
    color: '#ef4444',
    borderActive: 'rgba(239, 68, 68, 0.4)',
    bgActive: 'rgba(239, 68, 68, 0.05)',
  },
  {
    id: 'burnout',
    name: 'Burnout Crisis',
    icon: '🔥',
    description: 'Sustained stress bottoms out your energy levels and mental reserve.',
    impactText: 'Emotional scores drop by 25% on low-stability paths. Well-being priority spikes.',
    color: '#f97316',
    borderActive: 'rgba(249, 115, 22, 0.4)',
    bgActive: 'rgba(249, 115, 22, 0.05)',
  },
  {
    id: 'windfall',
    name: 'Financial Windfall',
    icon: '💰',
    description: 'You secure a sudden grant, windfall, or secondary cash source.',
    impactText: 'Financial scores boost by 20% across all paths. You can ignore financial weights.',
    color: '#10b981',
    borderActive: 'rgba(16, 185, 129, 0.4)',
    bgActive: 'rgba(16, 185, 129, 0.05)',
  },
  {
    id: 'relocation',
    name: 'Family Priority',
    icon: '🏡',
    description: 'A close relative requires you to be physically close or present.',
    impactText: 'Local/remote paths get +20% relationships; distant paths lose relationship score.',
    color: '#8b5cf6',
    borderActive: 'rgba(139, 92, 246, 0.4)',
    bgActive: 'rgba(139, 92, 246, 0.05)',
  }
];

interface StressTestPanelProps {
  activeStressor: string | null;
  onToggle: (id: string | null) => void;
}

export default function StressTestPanel({ activeStressor, onToggle }: StressTestPanelProps) {
  const currentStressor = STRESSORS.find(s => s.id === activeStressor);

  return (
    <div className="rounded-2xl p-5 space-y-6 md:p-6 h-full"
      style={{
        background: '#f4f3ef',
        border: '1px solid rgba(180, 172, 160, 0.8)',
      }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(180, 172, 160, 0.6)', paddingBottom: '12px' }}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #ea580c, #ef4444)' }} />
          <h4 className="text-sm font-bold" style={{ color: '#141413' }}>⚡ Dynamic Decision Flight Simulator</h4>
        </div>
        <p className="text-[11px] font-medium leading-relaxed" style={{ color: '#3d3b35' }}>
          Test the resilience of your options by injecting external stressors or windfalls. Watch live scores react.
        </p>
      </div>

      {/* Grid of Stressors */}
      <div className="grid grid-cols-2 gap-3">
        {STRESSORS.map((s) => {
          const isActive = activeStressor === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onToggle(isActive ? null : s.id)}
              className="flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer select-none"
              style={{
                background: isActive ? s.bgActive : '#fff',
                borderColor: isActive ? s.color : 'rgba(180, 172, 160, 0.4)',
                boxShadow: isActive ? `0 0 12px ${s.borderActive}` : 'none',
              }}
            >
              <span className="text-xl mb-1">{s.icon}</span>
              <span className="text-xs font-bold block" style={{ color: '#1b1b18' }}>{s.name}</span>
            </button>
          );
        })}
      </div>

      {/* Impact Explanation box */}
      <div className="rounded-xl p-3.5 text-xs font-medium leading-relaxed transition-all"
        style={{
          background: currentStressor ? currentStressor.bgActive : '#eae8e1',
          border: `1.5px ${currentStressor ? 'solid' : 'dashed'} ${currentStressor ? currentStressor.color : 'rgba(180, 172, 160, 0.7)'}`,
          color: currentStressor ? '#1b1b18' : '#7c7b72',
        }}>
        {currentStressor ? (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider" style={{ color: currentStressor.color }}>
              <ShieldAlert className="h-4 w-4" /> Stressor Active: {currentStressor.name}
            </div>
            <p style={{ margin: 0 }}><strong>Scenario:</strong> {currentStressor.description}</p>
            <p style={{ margin: 0, color: currentStressor.color }} className="font-semibold">
              ⚠️ <strong>Impact:</strong> {currentStressor.impactText}
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 justify-center">
            <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
            <span>Select a wildcard stressor above to run a stress simulation.</span>
          </div>
        )}
      </div>
    </div>
  );
}
