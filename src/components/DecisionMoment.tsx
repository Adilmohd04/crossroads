'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Sparkles, ArrowRight, Lock, Unlock, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface DecisionMomentProps {
  options: string[];
  isLocked: boolean;
  clarityIndex: number;
  checklist: {
    assumptionsResolvedCount: number;
    hasAdjustedSliders: boolean;
    hasToggledConstraints: boolean;
    hasInteractedRunway: boolean;
    runwayActive: boolean;
  };
  liveScores?: Record<string, number>;
}

const OPTION_COLORS = [
  { gradient: 'linear-gradient(135deg, #2d6a4f 0%, #2d6a4f 100%)', glow: 'rgba(59, 111, 255, 0.4)' },
  { gradient: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)', glow: 'rgba(16, 185, 129, 0.4)' },
  { gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)', glow: 'rgba(245, 158, 11, 0.4)' },
  { gradient: 'linear-gradient(135deg, #8b7355 0%, #ec4899 100%)', glow: 'rgba(139, 92, 246, 0.4)' },
];

export default function DecisionMoment({ options, isLocked, clarityIndex, checklist, liveScores }: DecisionMomentProps) {
  const { selectPath, isLoading } = useApp();

  const sortedScores = liveScores 
    ? Object.entries(liveScores).sort((a, b) => b[1] - a[1])
    : [];
  const [topOption, topScore] = sortedScores[0] || ['', 0];
  const [secondOption, secondScore] = sortedScores[1] || ['', 0];
  const hasOverwhelmingWinner = topOption && secondOption && (topScore - secondScore >= 15);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5 }}
      className="w-full py-10 px-6 rounded-2xl max-w-2xl mx-auto relative overflow-hidden transition-all duration-500"
      style={{
        background: isLocked ? '#f4f3ef' : '#f4f3ef',
        border: isLocked ? '1px solid rgba(180, 172, 160, 0.8)' : '1px solid rgba(59, 111, 255, 0.35)',
        backdropFilter: 'none',
        boxShadow: isLocked ? 'none' : '0 0 60px rgba(59, 111, 255, 0.15)',
      }}
    >
      {/* Background glow when unlocked */}
      {!isLocked && (
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(59,111,255,0.08) 0%, transparent 70%)',
          }}
        />
      )}

      {/* Icon */}
      <div className="relative mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-500"
        style={{
          background: isLocked ? 'linear-gradient(135deg, #9499a6, #334155)' : 'linear-gradient(135deg, #2d6a4f, #8b7355)',
          boxShadow: isLocked ? 'none' : '0 8px 24px rgba(59, 111, 255, 0.4)',
        }}>
        <div className="absolute inset-0 rounded-2xl"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)' }} />
        {isLocked ? (
          <Lock className="h-6 w-6 text-slate-600 relative z-10" />
        ) : (
          <Unlock className="h-6 w-6 text-white relative z-10 animate-bounce" />
        )}
      </div>

      <h3 className="text-xl font-black tracking-tight mb-2" style={{ color: '#141413' }}>
        {isLocked ? 'Decision Commitment Locked' : 'Commit to Your Choice'}
      </h3>
      
      <p className="text-sm font-medium max-w-md mx-auto leading-relaxed mb-6" style={{ color: '#3d3b35' }}>
        {isLocked 
          ? `Your Clarity Index is currently ${clarityIndex}%. Complete the workspace diagnostic tasks below to achieve a clear mind (80% minimum) and unlock the execution plan.`
          : 'Clarity achieved! Based on your priority simulations and challenged assumptions, select your path below to log it to your Decision Journal and build your roadmap.'
        }
      </p>

      {/* Checklist display */}
      {isLocked && (
        <div className="max-w-md mx-auto mb-8 rounded-xl p-4 text-left space-y-2.5 transition-all duration-300"
          style={{
            background: '#e4e2db',
            border: '1px solid rgba(180, 172, 160, 0.6)',
          }}>
          <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-600 mb-3 border-b border-slate-200 pb-1.5 flex justify-between items-center">
            <span>Workspace Checklist</span>
            <span className="mono-value text-amber-800">{clarityIndex}% / 80% Required</span>
          </h5>
          
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-2" style={{ color: checklist.assumptionsResolvedCount >= 2 ? '#047857' : '#374151' }}>
              <CheckCircle className={`h-4 w-4 ${checklist.assumptionsResolvedCount >= 2 ? 'text-emerald-700' : 'text-slate-400'}`} />
              Confront Surfaced Assumptions ({checklist.assumptionsResolvedCount}/3 acknowledged)
            </span>
            <span className="text-[10px] mono-value text-slate-500">45%</span>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-2" style={{ color: checklist.hasAdjustedSliders ? '#047857' : '#374151' }}>
              <CheckCircle className={`h-4 w-4 ${checklist.hasAdjustedSliders ? 'text-emerald-700' : 'text-slate-400'}`} />
              Calibrate Priority Weight Sliders
            </span>
            <span className="text-[10px] mono-value text-slate-500">20%</span>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-2" style={{ color: checklist.hasToggledConstraints ? '#047857' : '#374151' }}>
              <CheckCircle className={`h-4 w-4 ${checklist.hasToggledConstraints ? 'text-emerald-700' : 'text-slate-400'}`} />
              Stress-Test What-If Constraints
            </span>
            <span className="text-[10px] mono-value text-slate-500">15%</span>
          </div>

          {checklist.runwayActive && (
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-2" style={{ color: checklist.hasInteractedRunway ? '#047857' : '#374151' }}>
                <CheckCircle className={`h-4 w-4 ${checklist.hasInteractedRunway ? 'text-emerald-700' : 'text-slate-400'}`} />
                Evaluate Financial Runway
              </span>
              <span className="text-[10px] mono-value text-slate-500">10%</span>
            </div>
          )}
        </div>
      )}

      {/* Responsible AI disclaimer — always visible when unlocked */}
      {!isLocked && (
        <div className="mb-4 rounded-xl p-3 text-center border-2"
          style={{
            background: 'rgba(5, 150, 105, 0.06)',
            borderColor: 'rgba(5, 150, 105, 0.2)',
          }}>
          <p className="text-[11px] font-bold leading-relaxed" style={{ color: '#065f46' }}>
            <span className="text-emerald-700">⚠️</span> AI does not decide. The choice is always yours. 
            These scores reflect your inputs, not your future. Only you know what you can handle.
          </p>
        </div>
      )}

      {/* AI Recommendation / Scoring Tension Resolution */}
      {!isLocked && liveScores && (
        <div className="mb-6 rounded-xl p-4 text-left border"
          style={{
            background: '#ffffff',
            borderColor: 'rgba(180, 172, 160, 0.4)',
          }}>
          {hasOverwhelmingWinner ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-800 text-xs font-bold uppercase tracking-wider">
                <span>⚖️ Addressing the Tension: Dominant Path Detected</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-700 font-medium">
                Based on your calibrated weights, <strong>&ldquo;{topOption}&rdquo;</strong> scores significantly higher than your other options (a lead of <strong>{topScore - secondScore} points</strong>).
              </p>
              <p className="text-[11px] leading-relaxed text-slate-500 font-medium">
                <strong>Why doesn&apos;t Crossroads recommend it?</strong> Although the math favors this path under your current constraints, a lower-scoring option (like <em>&ldquo;{secondOption}&rdquo;</em>) might represent a growth step or adventure you actually want but are hesitant to choose. The algorithm only measures alignment with your stated inputs, not your inner conviction. Ask yourself: does the highest score feel right, or does it just feel safe?
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                <span>⚖️ Crossroads will never pick a winner</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500 font-medium">
                Your top paths are scoring closely. Even if one had a massive lead, Crossroads will never recommend or choose a path for you. A simulator can map risks and compound interest, but it cannot map your capacity to thrive under pressure. The final commitment is yours.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Options Selection */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        {options.map((option, idx) => {
          const palette = OPTION_COLORS[idx % OPTION_COLORS.length];
          return (
            <button
              key={option + idx}
              type="button"
              disabled={isLoading || isLocked}
              onClick={() => selectPath(option)}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-white transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer relative overflow-hidden"
              style={{
                background: isLocked ? 'rgba(30, 41, 59, 0.4)' : palette.gradient,
                border: isLocked ? '1px solid rgba(180, 172, 160, 0.6)' : 'none',
                boxShadow: isLocked ? 'none' : `0 4px 20px ${palette.glow}`,
              }}
              onMouseEnter={e => {
                if (!isLocked) {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 30px ${palette.glow}`;
                }
              }}
              onMouseLeave={e => {
                if (!isLocked) {
                  (e.currentTarget as HTMLElement).style.transform = '';
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 20px ${palette.glow}`;
                }
              }}
            >
              {/* Gloss */}
              {!isLocked && (
                <div className="absolute inset-0"
                  style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)' }} />
              )}
              <Compass className="h-4 w-4 shrink-0 relative z-10 text-white/90" />
              <span className="line-clamp-1 relative z-10 text-white">{option}</span>
              <ArrowRight className="h-4 w-4 shrink-0 relative z-10 text-white/90" />
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
