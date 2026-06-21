'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import DecisionMoment from './DecisionMoment';
import { IntakeData, AnalysisResult } from '../lib/types';
import { BehaviorInsight } from '../lib/behaviorTracker';

interface CommitmentPhaseProps {
  intake: IntakeData;
  analysis: AnalysisResult;
  confrontedAssumptions: boolean[];
  behaviorInsights: BehaviorInsight[];
  isLocked: boolean;
  clarityIndex: number;
  checklist: any;
  liveScores: Record<string, number>;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

export default function CommitmentPhase({
  intake,
  analysis,
  confrontedAssumptions,
  behaviorInsights,
  isLocked,
  clarityIndex,
  checklist,
  liveScores,
}: CommitmentPhaseProps) {
  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={sectionVariants}
      className="py-16 px-6"
      style={{ background: 'transparent' }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Phase divider */}
        <div style={{ height: '1px', background: 'var(--border-light)', margin: '0 0 4rem' }} />

        {/* Phase heading */}
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'var(--green-light)', fontFamily: 'Outfit, sans-serif' }}>
            Phase IV: Commitment Decision
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold leading-tight mb-5"
            style={{ color: 'var(--green)', fontFamily: "'Fraunces', serif" }}>
            You&apos;ve challenged your assumptions, tested your priorities, and seen the tradeoffs. Time to choose.
          </h2>
          <p className="text-base leading-relaxed max-w-xl mx-auto"
            style={{ color: 'var(--body)', fontFamily: 'Inter, sans-serif' }}>
            There&apos;s no perfect answer — only the path you&apos;re ready to own.
            The AI will never pick for you. This choice is yours.
          </p>
        </div>

        {/* Responsible AI Callout */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl p-5 mb-8 text-xs font-semibold leading-relaxed border text-left"
          style={{
            background: '#fcfcfb',
            borderColor: 'rgba(180, 172, 160, 0.6)',
          }}
        >
          <div className="flex items-center gap-2 mb-3 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
            🛡️ Responsible AI Framework & Safeguards
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <h5 className="font-bold text-slate-800">Potential Risk</h5>
              <p className="text-slate-500 font-medium">Users may over-trust AI-simulated paths and narratives as exact, guaranteed futures, leading to confirmation bias or decision abdication.</p>
            </div>
            <div className="space-y-1.5">
              <h5 className="font-bold text-emerald-800">Our Mitigations</h5>
              <p className="text-emerald-700 font-medium">We model multiple parallel horizons, display transparent confidence breakdowns, force users to explicitly confront implicit cognitive assumptions, and <strong>never recommend or choose a path for you</strong>. The human remains the sole accountable decision-maker.</p>
            </div>
          </div>
        </motion.div>

        {/* NARRATIVE CONTINUITY — connect Phase 1 assumptions to the commit moment */}
        {analysis.assumptions && analysis.assumptions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl p-5 mb-6"
            style={{ background: '#f0fdf4', border: '1px solid #d1e7dd' }}
          >
            <h4 className="text-sm font-bold mb-3" style={{ color: '#1b4332' }}>
              Before you commit — revisit what we found in Step 1:
            </h4>
            <div className="space-y-2">
              {analysis.assumptions.map((a, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="text-xs font-black shrink-0 mt-0.5"
                    style={{ color: confrontedAssumptions[i] ? '#2d6a4f' : '#774936' }}>
                    {confrontedAssumptions[i] ? '✓' : '!'}
                  </span>
                  <div>
                    <span className="text-xs font-semibold" style={{ color: '#1b1b18' }}>
                      {a.cognitive_bias && <span style={{ color: '#774936' }}>[{a.cognitive_bias}] </span>}
                      {a.assumption.slice(0, 80)}{a.assumption.length > 80 ? '...' : ''}
                    </span>
                    {!confrontedAssumptions[i] && (
                      <span className="block text-[10px] mt-0.5" style={{ color: '#9b2226' }}>
                        You haven&apos;t confronted this one yet — it may still be affecting your choice.
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[11px] mt-4 pt-3 italic" style={{ borderTop: '1px solid #d1e7dd', color: '#3d3b35' }}>
              Your chosen path only makes sense if you&apos;ve genuinely reckoned with these assumptions — not just acknowledged them.
            </p>
          </motion.div>
        )}

        {/* Behavior Insights */}
        {behaviorInsights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl p-6 mb-10 space-y-5"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <Activity className="h-5 w-5" style={{ color: 'var(--green-light)' }} />
              <div>
                <h4 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>
                  What your behavior revealed
                </h4>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  The AI observed how you interacted — not just what you entered.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {behaviorInsights.map((insight, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + idx * 0.15 }}
                  className="rounded-xl p-5 space-y-2"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {insight.icon === 'anxiety' && '⚡'}
                      {insight.icon === 'contradiction' && '🔀'}
                      {insight.icon === 'clarity' && '✨'}
                      {insight.icon === 'avoidance' && '🔄'}
                      {insight.icon === 'exploration' && '🔬'}
                    </span>
                    <h5 className="text-sm font-bold" style={{ color: 'var(--green-light)' }}>
                      {insight.title}
                    </h5>
                  </div>
                  <p className="text-xs font-semibold leading-relaxed border-l-2 pl-3" style={{ color: 'var(--ink)', borderColor: 'var(--green-light)', whiteSpace: 'pre-line' }}>
                    {insight.observation}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--body)' }}>
                    {insight.interpretation}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Decision Moment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <DecisionMoment
            options={intake.options}
            isLocked={isLocked}
            clarityIndex={clarityIndex}
            checklist={checklist}
            liveScores={liveScores}
          />
        </motion.div>
      </div>
    </motion.section>
  );
}
