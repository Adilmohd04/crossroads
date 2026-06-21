'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, ToggleLeft, ToggleRight, Sparkles, Zap, ArrowUpRight, BarChart3, Sliders, DollarSign, Calendar, Eye, EyeOff } from 'lucide-react';

interface WhatIfPanelProps {
  selectedConstraints: string[];
  toggledOffConstraints: string[];
  onToggle: (constraint: string) => void;
  onInteraction?: () => void;
  impactScores?: Record<string, number>;
  sandboxSavings: number;
  setSandboxSavings: (val: number) => void;
  sandboxDeferral: number;
  setSandboxDeferral: (val: number) => void;
  originalSavings?: number;
}

function getConstraintDimension(constraint: string): string | null {
  const lowerC = constraint.toLowerCase();
  if (lowerC.includes('money') || lowerC.includes('savings') || lowerC.includes('debt') || lowerC.includes('lease') || lowerC.includes('housing') || lowerC.includes('budget') || lowerC.includes('salary') || lowerC.includes('cost')) return 'financial';
  if (lowerC.includes('geographic') || lowerC.includes('location') || lowerC.includes('distance')) return 'relationships';
  if (lowerC.includes('time') || lowerC.includes('deadline') || lowerC.includes('visa') || lowerC.includes('contract')) return 'stability';
  if (lowerC.includes('health') || lowerC.includes('stress') || lowerC.includes('anxiety') || lowerC.includes('burnout')) return 'emotional';
  if (lowerC.includes('experience') || lowerC.includes('skill') || lowerC.includes('qualification')) return 'growth';
  if (lowerC.includes('relationship') || lowerC.includes('family') || lowerC.includes('partner')) return 'relationships';
  return null;
}

const DIMENSION_LABELS: Record<string, string> = {
  financial: '💰 Financial',
  relationships: '🤝 Relationships',
  stability: '🏠 Stability',
  emotional: '💚 Emotional',
  growth: '📈 Growth',
};

function getConstraintNarrative(constraint: string): string {
  const c = constraint.toLowerCase();
  if (c.includes('money') || c.includes('savings')) return 'Your higher-cost options become viable. You could take the riskier path without the constant anxiety of running out of runway. The startup or full-time study paths open up.';
  if (c.includes('debt')) return 'Monthly obligations drop significantly. You can afford to take a lower-paying but more fulfilling role, or invest time in education without the debt pressure.';
  if (c.includes('time') || c.includes('deadline')) return 'You have space to explore without rushing. You could negotiate, test, or run small experiments before committing fully. The urgency dissolves.';
  if (c.includes('geographic') || c.includes('location')) return 'Remote opportunities and distant programs become accessible. Your options are no longer limited by where you physically are.';
  if (c.includes('family') || c.includes('relationship')) return 'You can prioritize your own growth without guilt about proximity. Long-distance becomes a temporary trade-off you choose consciously.';
  if (c.includes('health')) return 'High-intensity paths become possible. You could handle the stress of a startup or demanding program without health being the limiting factor.';
  if (c.includes('experience') || c.includes('skill')) return 'Roles that currently seem "above your level" become reachable. The gap between where you are and where you want to be shrinks.';
  if (c.includes('visa') || c.includes('immigration')) return 'International options unlock. Universities, companies, and cities that were off-limits due to status become available paths.';
  if (c.includes('lease') || c.includes('housing')) return 'You can relocate freely. The anchor keeping you in your current city disappears, opening up opportunities elsewhere.';
  return 'New options that were previously blocked by this constraint become available. The decision landscape shifts in favor of growth-oriented paths.';
}

export default function WhatIfPanel({
  selectedConstraints,
  toggledOffConstraints,
  onToggle,
  onInteraction,
  impactScores,
  sandboxSavings,
  setSandboxSavings,
  sandboxDeferral,
  setSandboxDeferral,
  originalSavings = 0,
}: WhatIfPanelProps) {
  if (!selectedConstraints || selectedConstraints.length === 0) return null;

  const removedCount = toggledOffConstraints.length;
  const hasSandboxChanges = sandboxSavings !== originalSavings || sandboxDeferral > 0;

  const constraintImpacts = useMemo(() => {
    if (impactScores && Object.keys(impactScores).length > 0) {
      return selectedConstraints
        .map(c => ({ constraint: c, impact: impactScores[c] || 0 }))
        .sort((a, b) => b.impact - a.impact);
    }
    return selectedConstraints
      .map(c => ({ constraint: c, impact: getConstraintDimension(c) ? 1 : 0 }))
      .sort((a, b) => b.impact - a.impact);
  }, [selectedConstraints, impactScores]);

  const biggestBlocker = constraintImpacts.length > 0 ? constraintImpacts[0] : null;

  return (
    <div className="rounded-2xl p-5 md:p-6 space-y-5"
      style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.04), rgba(139,92,246,0.01))',
        border: '1px solid rgba(139, 92, 246, 0.2)',
      }}>

      {/* HEADER — What-If + Big Blocker callout */}
      <div className="flex items-start gap-3 pb-4"
        style={{ borderBottom: '1px solid rgba(139, 92, 246, 0.15)' }}>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(139,92,246,0.08))',
            border: '1px solid rgba(139, 92, 246, 0.3)',
          }}>
          <FlaskConical className="h-5 w-5" style={{ color: '#7c3aed' }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-bold" style={{ color: '#141413' }}>
              🌌 What-If Universe Simulator
            </h4>
            {(removedCount > 0 || hasSandboxChanges) && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-2 py-0.5 rounded-full text-[9px] font-bold"
                style={{ background: 'rgba(139,92,246,0.15)', color: '#7c3aed', border: '1px solid rgba(139,92,246,0.25)' }}>
                ⚡ Reality Shifted
              </motion.span>
            )}
          </div>
          <p className="mt-1 text-[11px] font-medium leading-relaxed" style={{ color: '#3d3b35' }}>
            Toggle a constraint <strong>OFF</strong> to see what happens if it disappeared.
            Or use the sliders below to change your situation entirely.
            <strong className="text-purple-700"> Every change updates the scores live.</strong>
          </p>
        </div>
      </div>

      {/* TOGGLE BUTTONS — tap to remove constraints */}
      <div className="flex flex-wrap gap-2.5">
        {selectedConstraints.map((constraint) => {
          const isOff = toggledOffConstraints.includes(constraint);
          const impact = impactScores?.[constraint];
          const blocker = biggestBlocker?.constraint === constraint ? biggestBlocker : null;

          return (
            <motion.button
              key={constraint}
              onClick={() => { onToggle(constraint); if (onInteraction) onInteraction(); }}
              whileTap={{ scale: 0.95 }}
              layout
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer"
              style={{
                background: isOff
                  ? 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(139,92,246,0.05))'
                  : '#eae8e1',
                border: isOff
                  ? '1.5px solid rgba(139,92,246,0.35)'
                  : '1px solid rgba(180,172,160,0.8)',
                color: isOff ? '#5b21b6' : '#3d3d3a',
                boxShadow: isOff ? '0 0 20px rgba(139,92,246,0.15)' : 'none',
              }}
            >
              {isOff ? <ToggleRight className="h-4 w-4" style={{ color: '#7c3aed' }} /> : <ToggleLeft className="h-4 w-4" style={{ color: '#3d3b35' }} />}
              <span>{constraint}</span>
              {isOff && impact !== undefined && impact > 0 && (
                <motion.span
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-black"
                  style={{ background: 'rgba(16,185,129,0.15)', color: '#059669' }}>
                  <ArrowUpRight className="h-2.5 w-2.5" />+{impact}
                </motion.span>
              )}
              {blocker && blocker.impact > 0 && !isOff && (
                <span className="px-1.5 py-0.5 rounded text-[8px] font-bold"
                  style={{ background: 'rgba(234,88,12,0.12)', color: '#c2410c' }}>
                  BIGGEST BLOCKER
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* BIG BLOCKER REVEAL — the "wow" moment */}
      <AnimatePresence>
        {biggestBlocker && biggestBlocker.impact > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            className="rounded-xl p-5 overflow-hidden relative"
            style={{
              background: 'linear-gradient(135deg, rgba(5,150,105,0.08), rgba(5,150,105,0.02))',
              border: '2px solid rgba(5,150,105,0.25)',
            }}>
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none"
              style={{ background: 'radial-gradient(circle at 100% 0%, #059669, transparent 70%)' }} />
            <div className="flex items-start gap-3 relative z-10">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
                style={{ background: 'rgba(5,150,105,0.15)', border: '1px solid rgba(5,150,105,0.25)' }}>
                <Zap className="h-5 w-5" style={{ color: '#059669' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-black uppercase tracking-wider"
                    style={{ color: '#059669' }}>
                    🔥 Your Biggest Blocker
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold"
                    style={{ background: 'rgba(5,150,105,0.12)', color: '#047857', border: '1px solid rgba(5,150,105,0.2)' }}>
                    #{selectedConstraints.indexOf(biggestBlocker.constraint) + 1} of {selectedConstraints.length}
                  </span>
                </div>
                <h4 className="text-base font-bold mb-1" style={{ color: '#064e3b' }}>
                  {biggestBlocker.constraint}
                </h4>
                <p className="text-xs font-semibold leading-relaxed" style={{ color: '#065f46' }}>
                  This is the one constraint holding your best path back the most.
                  Toggle it <strong>OFF</strong> above to see your scores jump by up to <strong>+{biggestBlocker.impact} points</strong>.
                </p>
              </div>
              {!toggledOffConstraints.includes(biggestBlocker.constraint) && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { onToggle(biggestBlocker.constraint); if (onInteraction) onInteraction(); }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold cursor-pointer shrink-0"
                  style={{ background: '#059669', color: '#fff', border: 'none' }}>
                  <EyeOff className="h-3.5 w-3.5" />
                  Remove It
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PARALLEL UNIVERSE SANDBOX */}
      <div className="rounded-xl p-5 space-y-5"
        style={{
          background: hasSandboxChanges
            ? 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(139,92,246,0.03))'
            : 'rgba(139,92,246,0.04)',
          border: hasSandboxChanges
            ? '1.5px solid rgba(139,92,246,0.3)'
            : '1px dashed rgba(139,92,246,0.2)',
          transition: 'all 0.3s',
        }}>
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4" style={{ color: '#7c3aed' }} />
          <h5 className="text-xs font-black uppercase tracking-wider" style={{ color: '#7c3aed' }}>
            🌌 Parallel Universe Sandbox
          </h5>
          {hasSandboxChanges && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-2 py-0.5 rounded-full text-[9px] font-bold ml-auto"
              style={{ background: 'rgba(139,92,246,0.2)', color: '#5b21b6', border: '1px solid rgba(139,92,246,0.25)' }}>
              Alternate Reality Active
            </motion.span>
          )}
        </div>
        <p className="text-[11px] font-medium leading-relaxed" style={{ color: '#3d3b35' }}>
          What if your situation changed? Slide to rewrite reality and watch all scores re-calculate instantly.
        </p>

        {/* Savings Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[11px] font-bold">
            <span style={{ color: '#1b1b18' }} className="flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5" style={{ color: '#059669' }} />
              Your Savings:
            </span>
            <span style={{ color: '#059669' }}>
              ${sandboxSavings.toLocaleString()}
              {sandboxSavings !== originalSavings && (
                <span className="text-[9px] text-slate-500 font-normal ml-1">
                  (was ${originalSavings.toLocaleString()})
                </span>
              )}
            </span>
          </div>
          <input
            type="range" min="0" max="100000" step="5000"
            value={sandboxSavings}
            onChange={(e) => { setSandboxSavings(Number(e.target.value)); if (onInteraction) onInteraction(); }}
            className="slider-range w-full cursor-pointer"
            style={{ background: 'rgba(139,92,246,0.15)' }}
          />
          <div className="flex justify-between text-[9px] font-medium" style={{ color: '#7c7b72' }}>
            <span>$0</span>
            <span>$50K</span>
            <span>$100K</span>
          </div>
        </div>

        {/* Timeline Deferral */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[11px] font-bold">
            <span style={{ color: '#1b1b18' }} className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" style={{ color: '#7c3aed' }} />
              Extra Time to Decide:
            </span>
            <span style={{ color: '#7c3aed' }}>
              {sandboxDeferral === 0 ? 'None' : `+${sandboxDeferral} Month${sandboxDeferral > 1 ? 's' : ''}`}
            </span>
          </div>
          <input
            type="range" min="0" max="6" step="1"
            value={sandboxDeferral}
            onChange={(e) => { setSandboxDeferral(Number(e.target.value)); if (onInteraction) onInteraction(); }}
            className="slider-range w-full cursor-pointer"
            style={{ background: 'rgba(139,92,246,0.15)' }}
          />
          <div className="flex justify-between text-[9px] font-medium" style={{ color: '#7c7b72' }}>
            <span>Decide now</span>
            <span>+3 months</span>
            <span>+6 months</span>
          </div>
        </div>
      </div>

      {/* IMPACT RANKING + NARRATIVE */}
      <AnimatePresence>
        {(removedCount > 0 || hasSandboxChanges) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden space-y-4">
            
            {/* Impact ranking bars */}
            {removedCount > 0 && impactScores && Object.keys(impactScores).length > 0 && (
              <div className="rounded-xl p-4 space-y-3"
                style={{ background: 'rgba(139,92,246,0.06)', border: '1px dashed rgba(139,92,246,0.2)' }}>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-3.5 w-3.5" style={{ color: '#7c3aed' }} />
                  <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#7c3aed' }}>
                    Impact Ranking
                  </span>
                </div>
                <div className="space-y-2">
                  {constraintImpacts.filter(ci => ci.impact > 0).map((ci, i) => {
                    const isActive = toggledOffConstraints.includes(ci.constraint);
                    return (
                      <div key={ci.constraint} className="flex items-center gap-2">
                        <span className="text-[10px] font-bold w-4 text-right shrink-0"
                          style={{ color: i === 0 ? '#059669' : '#6c6a64' }}>#{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between gap-2 mb-1">
                            <span className="text-[10px] font-semibold truncate"
                              style={{ color: isActive ? '#5b21b6' : '#3d3b35' }}>{ci.constraint}</span>
                            <span className="text-[10px] font-black shrink-0"
                              style={{ color: isActive ? '#059669' : '#7c7b72' }}>
                              {isActive ? `+${ci.impact} pts` : `${ci.impact} pts potential`}
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full overflow-hidden"
                            style={{ background: 'rgba(139,92,246,0.1)' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, Math.max(5, ci.impact * 5))}%` }}
                              transition={{ duration: 0.5, delay: i * 0.1 }}
                              className="h-full rounded-full"
                              style={{
                                background: i === 0
                                  ? 'linear-gradient(90deg, #059669, #10b981)'
                                  : 'linear-gradient(90deg, #7c3aed, #a78bfa)',
                              }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Life change narratives */}
            {removedCount > 0 && (
              <div className="rounded-xl p-4"
                style={{ background: '#f0fdf4', border: '1px solid #d1e7dd' }}>
                <h5 className="text-xs font-bold mb-3" style={{ color: '#1b4332' }}>
                  🌿 What your life looks like without {removedCount === 1 ? 'this constraint' : 'these constraints'}:
                </h5>
                <div className="space-y-3">
                  {toggledOffConstraints.map((c) => (
                    <div key={c} className="flex gap-2">
                      <span className="text-emerald-600 font-bold shrink-0 mt-0.5">→</span>
                      <p className="text-xs leading-relaxed" style={{ color: '#2d3b35' }}>
                        <strong style={{ color: '#2d6a4f' }}>Without "{c}":</strong> {getConstraintNarrative(c)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}