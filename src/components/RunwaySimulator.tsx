'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, FlameKindling, CheckCircle } from 'lucide-react';
import { Scenario } from '../lib/types';
import { projectBalances } from '../lib/runway';

interface RunwaySimulatorProps {
  savings: number;
  initialMonthlyBudget: number;
  scenarios: Scenario[];
  onInteraction?: () => void;
}

export default function RunwaySimulator({
  savings,
  initialMonthlyBudget,
  scenarios,
  onInteraction,
}: RunwaySimulatorProps) {
  const [monthlyBudget, setMonthlyBudget] = useState(initialMonthlyBudget);
  const [showGuide, setShowGuide] = useState(false);

  // Check for crisis paths
  const crisisPaths = scenarios.map(sc => {
    const { crisisMonth } = projectBalances(sc.option_name, savings, monthlyBudget);
    return { name: sc.option_name, crisisMonth };
  }).filter(p => p.crisisMonth !== null && p.crisisMonth <= 6);

  const renderSprout = (state: 'surplus' | 'stressed' | 'bankrupt') => {
    if (state === 'surplus') {
      return (
        <svg width="24" height="28" viewBox="0 0 24 28" fill="none" className="mx-auto filter drop-shadow-[0_2px_4px_rgba(16,185,129,0.15)]">
          <path d="M2,24 L22,24" stroke="var(--border-light)" strokeWidth="1.5" />
          <path d="M12,24 Q12,14 15,10" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
          <path d="M12,17 Q8,14 10,11 Q12,11 12,17 Z" fill="#34d399" />
          <path d="M13,13 Q17,10 15,8 Q14,9 13,13 Z" fill="#059669" />
        </svg>
      );
    } else if (state === 'stressed') {
      return (
        <svg width="24" height="28" viewBox="0 0 24 28" fill="none" className="mx-auto filter drop-shadow-[0_2px_4px_rgba(202,138,4,0.15)]">
          <path d="M2,24 L22,24" stroke="var(--border-light)" strokeWidth="1.5" />
          <path d="M12,24 Q11,16 7,13" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" />
          <path d="M10,18 Q6,17 7,14 Q9,14 10,18 Z" fill="#eab308" />
        </svg>
      );
    } else {
      return (
        <svg width="24" height="28" viewBox="0 0 24 28" fill="none" className="mx-auto">
          <path d="M2,24 L22,24" stroke="var(--border-light)" strokeWidth="1.5" />
          <path d="M12,24 L12,16 M12,19 L9,17 M12,17 L15,14" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
          <circle cx="12" cy="11" r="2" fill="#ef4444" className="animate-glow-pulse" />
        </svg>
      );
    }
  };

  return (
    <div className="glass p-6 space-y-6">
      {/* ⚠️ CRISIS BANNER — shown when any path burns through savings in ≤6 months */}
      {crisisPaths.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="rounded-xl p-4 border-2 flex flex-col sm:flex-row items-start sm:items-center gap-3"
          style={{
            background: 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.03))',
            borderColor: 'rgba(239,68,68,0.3)',
          }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <span className="text-lg">🚨</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold" style={{ color: '#991b1b' }}>
              Runway Crisis Detected
            </p>
            <p className="text-xs font-medium mt-0.5" style={{ color: '#7f1d1d' }}>
              {crisisPaths.map(p => `"${p.name}" runs out of money in month ${p.crisisMonth}`).join(' · ')}
              . Try increasing savings, lowering burn rate, or choosing a lower-cost location.
            </p>
          </div>
          <div className="flex gap-1.5 shrink-0">
            {crisisPaths.map(p => (
              <span key={p.name} className="px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap"
                style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)', color: '#991b1b' }}>
                ⚠️ M{p.crisisMonth}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 pb-4 border-b border-[var(--border)]">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0 bg-[var(--green-soft)] border border-[var(--border)]">
          <FlameKindling className="h-4.5 w-4.5 text-[var(--green-light)]" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-[var(--ink)]">Campfire Burn & Cash Sprout Simulator</h4>
          <p className="mt-1 text-[11px] font-medium leading-relaxed text-[var(--body)]">
            Stress-test your runway over 12 months based on savings of{' '}
            <span className="font-bold text-[var(--green-light)]">${savings.toLocaleString()}</span>.
          </p>
        </div>
      </div>

      {/* Collapsible Explanatory Info Card */}
      <div className="rounded-xl border border-[var(--border)] text-xs bg-white/40">
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="w-full flex items-center justify-between p-3 font-semibold transition hover:bg-white/30 text-[var(--ink)]"
        >
          <span className="flex items-center gap-2 text-[11px] font-bold">
            📖 How the Campfire Simulation Works
          </span>
          <span className="text-[var(--muted)] text-[10px]">{showGuide ? 'Collapse ▲' : 'Expand ▼'}</span>
        </button>
        {showGuide && (
          <div className="p-3 pt-0 space-y-3 border-t border-[var(--border-light)] text-[var(--body)] leading-relaxed">
            <p>
              This simulator models your financial runway over a 12-month timeline using a botanical ecosystem analogy.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="space-y-1 p-2 rounded-lg bg-white/50 border border-black/5">
                <div className="font-bold flex items-center gap-1 text-[var(--ink)]">
                  🪵 Wood Burn Rate
                </div>
                <p className="text-[10px] text-slate-600">
                  Your baseline monthly living budget. Adjusting the slider simulates a tighter (frugal) or looser lifestyle.
                </p>
              </div>
              <div className="space-y-1 p-2 rounded-lg bg-white/50 border border-black/5">
                <div className="font-bold flex items-center gap-1 text-[var(--ink)]">
                  💨 COL Multiplier
                </div>
                <p className="text-[10px] text-slate-600">
                  Adjusts living costs by location: <strong>1.45x</strong> for high-cost hubs (SF, NY, London) or <strong>0.85x</strong> for remote/hometown stays.
                </p>
              </div>
              <div className="space-y-1 p-2 rounded-lg bg-white/50 border border-black/5">
                <div className="font-bold flex items-center gap-1 text-[var(--ink)]">
                  🌱 Cash Sprouts
                </div>
                <ul className="text-[10px] text-slate-600 space-y-0.5">
                  <li>🟢 <strong className="text-emerald-600">Green</strong>: Generating surplus cash.</li>
                  <li>🟡 <strong className="text-amber-600">Amber</strong>: Drawing down savings.</li>
                  <li>🔴 <strong className="text-red-600">Red</strong>: Savings dry; fire is cold.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Slider control panel */}
        <div className="md:col-span-1 rounded-xl p-4 space-y-4 bg-white/40 border border-[var(--border)]">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
              Campfire Variables
            </span>
            <span className="text-[11px] font-bold mono-value px-2 py-0.5 rounded-md bg-[var(--orange-soft)] border border-[var(--border)] text-[var(--orange-accent)]">
              ${monthlyBudget.toLocaleString()}/mo
            </span>
          </div>
          <div className="space-y-2">
            <span className="block text-xs font-bold text-[var(--ink)]">Daily Wood Burn Rate</span>
            <input
              type="range"
              min="500"
              max={Math.max(10000, initialMonthlyBudget * 2.5)}
              step="100"
              value={monthlyBudget}
              onChange={(e) => {
                setMonthlyBudget(parseInt(e.target.value));
                if (onInteraction) onInteraction();
              }}
              className="slider-range w-full"
            />
            <p className="text-[10px] font-medium leading-normal text-[var(--body)]">
              Adjust monthly burn rate to simulate tighter budgets (smaller fire) or wider budgets.
            </p>
          </div>
        </div>

        {/* Projection bars */}
        <div className="md:col-span-2 space-y-6">
          {scenarios.map((sc) => {
            const { 
              monthlyBalances, 
              crisisMonth, 
              netFlow, 
              description, 
              income, 
              adjustedLivingCost, 
              extraCosts, 
              colMultiplier 
            } = projectBalances(sc.option_name, savings, monthlyBudget);
            const hasSurplus = netFlow >= 0;

            return (
              <div key={sc.option_name} className="space-y-2.5 pb-5 last:pb-0 border-b border-[var(--border)] last:border-0">

                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold truncate max-w-[160px] sm:max-w-xs text-[var(--ink)]">
                    {sc.option_name}
                  </span>
                  {hasSurplus ? (
                    <span className="text-[10px] flex items-center gap-1 px-2 py-0.5 rounded-md font-bold bg-[var(--green-soft)] border border-[var(--border)] text-[var(--green-light)]">
                      <CheckCircle className="h-3.5 w-3.5 shrink-0" /> Thriving Ecosystem
                    </span>
                  ) : crisisMonth !== null ? (
                    <span className={`text-[10px] flex items-center gap-1 px-2 py-0.5 rounded-md font-bold ${
                      crisisMonth <= 3
                        ? 'bg-red-500/10 border border-red-500/20 text-red-500'
                        : 'bg-[var(--orange-soft)] border border-[var(--border)] text-[var(--orange-accent)]'
                    }`}>
                      <Flame className="h-3.5 w-3.5 shrink-0" /> Burnout: Month {crisisMonth}
                    </span>
                  ) : (
                    <span className="text-[10px] flex items-center gap-1 px-2 py-0.5 rounded-md font-bold bg-[var(--green-soft)] border border-[var(--border)] text-[var(--green-light)]">
                      <CheckCircle className="h-3.5 w-3.5 shrink-0" /> Stable: Runway 12+ Months
                    </span>
                  )}
                </div>

                <div className="text-[10px] font-semibold text-slate-500 text-[var(--body)]">{description}</div>

                {/* 12-month Sprout projections */}
                <div className="flex gap-1 w-full pt-1 overflow-x-auto pb-1">
                  {monthlyBalances.map((bal, mIdx) => {
                    const isBankrupt = bal <= 0;
                    let state: 'surplus' | 'stressed' | 'bankrupt' = 'surplus';
                    if (isBankrupt) state = 'bankrupt';
                    else if (!hasSurplus) state = 'stressed';

                    return (
                      <motion.div
                        key={mIdx}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: mIdx * 0.02, duration: 0.2 }}
                        className="flex-1 flex flex-col items-center min-w-[20px] origin-bottom">
                        {renderSprout(state)}
                        <span className="text-[8px] font-bold select-none mt-1 text-[var(--muted)]">
                          M{mIdx + 1}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Detailed Mathematical Report Card */}
                <div className={`p-3 rounded-lg border text-[11px] space-y-1.5 text-[var(--ink)] ${
                  hasSurplus 
                    ? 'bg-teal-500/5 border-teal-500/10' 
                    : crisisMonth !== null 
                      ? 'bg-red-500/5 border-red-500/10' 
                      : 'bg-amber-500/5 border-amber-500/10'
                }`}>
                  
                  {/* Ledger Breakdown line */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5 font-mono text-[10px] border-b pb-1 border-black/5 text-[var(--body)]">
                    <div className="flex items-center gap-1.5">
                      <span>Income: <strong className="text-[var(--green-light)]">+${income.toLocaleString()}</strong></span>
                      <span>•</span>
                      <span>Living Cost: <strong className="text-red-700">-${adjustedLivingCost.toLocaleString()}</strong> <span className="opacity-70 text-[9px]">(COL: {colMultiplier}x)</span></span>
                      {extraCosts > 0 && (
                        <>
                          <span>•</span>
                          <span>Overhead: <strong className="text-red-700">-${extraCosts.toLocaleString()}</strong></span>
                        </>
                      )}
                    </div>
                    <div className="font-bold">
                      Net Flow:{' '}
                      <span className={hasSurplus ? 'text-[var(--green-light)]' : 'text-[var(--orange-accent)]'}>
                        {hasSurplus ? '+' : '-'}${Math.abs(netFlow).toLocaleString()}/mo
                      </span>
                    </div>
                  </div>

                  {/* Narrative Diagnosis */}
                  <p className="text-[11px] leading-relaxed text-slate-700">
                    {hasSurplus ? (
                      <>
                        ✨ <strong>Thriving Ecosystem:</strong> Your income covers all expenses with a surplus of <strong>${netFlow.toLocaleString()}</strong> each month. Your starting savings of <strong>${savings.toLocaleString()}</strong> remain completely untouched, growing to <strong>${(savings + netFlow * 12).toLocaleString()}</strong> by Month 12.
                      </>
                    ) : crisisMonth !== null ? (
                      <>
                        ⚠️ <strong>Premature Freeze:</strong> You are burning through savings at a rate of <strong>${Math.abs(netFlow).toLocaleString()}/mo</strong>. Your starting savings buffer of <strong>${savings.toLocaleString()}</strong> will be completely exhausted in <strong>Month {crisisMonth}</strong>, leaving a total cumulative deficit of <strong className="text-red-700">${Math.abs(savings + netFlow * 12).toLocaleString()}</strong> by the end of the year. <em>Recommendation: Try lowering your burn rate, finding a cheaper location, or adding a supplementary income of at least ${Math.abs(netFlow).toLocaleString()}/mo to stabilize.</em>
                      </>
                    ) : (
                      <>
                        🌲 <strong>Steady Burn:</strong> You have a monthly deficit of <strong>${Math.abs(netFlow).toLocaleString()}/mo</strong>. However, your savings buffer of <strong>${savings.toLocaleString()}</strong> is strong enough to absorb the drawdown. You will finish the 12-month period safely with <strong>${(savings + netFlow * 12).toLocaleString()}</strong> remaining.
                      </>
                    )}
                  </p>
                </div>

                {!hasSurplus && crisisMonth && (
                  <div className="space-y-2">
                    {crisisMonth <= 6 ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-2.5 flex items-center gap-2 p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-700 text-[11px] font-black"
                        style={{
                          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.05)',
                        }}
                      >
                        <span className="shrink-0 text-xs">⚠️</span>
                        <span>
                          Runway critical: you&apos;d run out of money by Month {crisisMonth} on this path.
                        </span>
                      </motion.div>
                    ) : (
                      <p className="text-[9px] font-bold italic text-red-600 mt-2">
                        ⚠️ Campfire goes cold in Month {crisisMonth}. Sprouts run dry.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
