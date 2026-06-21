'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { EyeOff, AlertTriangle, ArrowRightLeft } from 'lucide-react';
import { Assumption } from '../lib/types';

interface AssumptionCardProps {
  assumption: Assumption;
  index: number;
  isConfronted: boolean;
  onConfront: () => void;
}

export default function AssumptionCard({ assumption, index, isConfronted, onConfront }: AssumptionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12, duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col justify-between rounded-2xl p-5 md:p-6 transition-all duration-300 min-h-[300px]"
      style={{
        background: isConfronted ? 'rgba(16, 185, 129, 0.04)' : 'rgba(245, 158, 11, 0.04)',
        border: isConfronted ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(245, 158, 11, 0.18)',
        borderLeft: isConfronted ? '3px solid rgba(16, 185, 129, 0.6)' : '3px solid rgba(245, 158, 11, 0.5)',
        backdropFilter: 'none',
      }}
      whileHover={{
        boxShadow: isConfronted ? '0 8px 30px rgba(16, 185, 129, 0.08)' : '0 8px 30px rgba(192, 112, 68, 0.06)',
      }}
    >
      <div>
        {/* Card header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md text-xs font-black"
              style={{
                background: isConfronted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(217, 119, 6, 0.15)',
                color: isConfronted ? '#065f46' : '#92400e'
              }}>
              {index + 1}
            </span>
            <h4 className="text-[10px] font-black uppercase tracking-wider" style={{ color: isConfronted ? '#047857' : '#b45309' }}>
              {isConfronted ? 'Assumption Deconstructed' : 'Hidden Assumption'}
            </h4>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-black"
            style={{
              background: 'rgba(139, 92, 246, 0.08)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              color: '#6d28d9',
            }}>
            🧠 {(() => {
              if (assumption.cognitive_bias) return assumption.cognitive_bias;
              const text = (assumption.assumption + ' ' + assumption.why_wrong).toLowerCase();
              if (text.includes('move') || text.includes('relocat') || text.includes('city') || text.includes('geographic')) return 'Geographic Cure Fallacy';
              if (text.includes('money') || text.includes('finance') || text.includes('cost') || text.includes('budget') || text.includes('salary') || text.includes('saving')) return 'Loss Aversion';
              if (text.includes('time') || text.includes('deadline') || text.includes('date') || text.includes('hurry') || text.includes('quick')) return 'Hyperbolic Discounting';
              if (text.includes('stay') || text.includes('routine') || text.includes('lease') || text.includes('comfort') || text.includes('predict') || text.includes('remote')) return 'Status Quo Bias';
              if (text.includes('sure') || text.includes('confid') || text.includes('expert') || text.includes('perfect') || text.includes('optimis')) return 'Optimism Bias';
              const fallbacks = ['Availability Heuristic', 'Status Quo Bias', 'Loss Aversion', 'Optimism Bias'];
              return fallbacks[index % fallbacks.length];
            })()}
          </span>
        </div>

        <div className="space-y-4">
          {/* The assumption */}
          <div className="flex gap-2.5 items-start">
            <EyeOff className="h-4 w-4 shrink-0 mt-0.5" style={{ color: isConfronted ? '#047857' : '#b45309' }} />
            <div>
              <h5 className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: isConfronted ? '#059669' : '#d97706' }}>
                Assumption:
              </h5>
              <p className="text-xs font-semibold leading-relaxed" style={{ color: '#1b1b18', textDecoration: isConfronted ? 'line-through' : 'none', opacity: isConfronted ? 0.7 : 1 }}>
                {assumption.assumption}
              </p>
            </div>
          </div>

          {/* Why wrong */}
          <div className="flex gap-2.5 items-start pt-3"
            style={{ borderTop: isConfronted ? '1px solid rgba(16, 185, 129, 0.12)' : '1px solid rgba(245, 158, 11, 0.12)' }}>
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: isConfronted ? '#047857' : '#b45309' }} />
            <div>
              <h5 className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: isConfronted ? '#059669' : '#d97706' }}>
                Why it might not hold:
              </h5>
              <p className="text-xs font-medium leading-relaxed" style={{ color: '#3d3b35' }}>
                {assumption.why_wrong}
              </p>
            </div>
          </div>

          {/* What changes */}
          <div className="flex gap-2.5 items-start pt-3"
            style={{ borderTop: isConfronted ? '1px solid rgba(16, 185, 129, 0.12)' : '1px solid rgba(245, 158, 11, 0.12)' }}>
            <ArrowRightLeft className="h-4 w-4 shrink-0 mt-0.5" style={{ color: isConfronted ? '#047857' : '#b45309' }} />
            <div>
              <h5 className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: isConfronted ? '#059669' : '#d97706' }}>
                How the decision changes:
              </h5>
              <p className="text-xs font-medium leading-relaxed" style={{ color: '#3d3b35' }}>
                {assumption.what_changes}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Acknowledge Button */}
      <div className="mt-5 pt-3" style={{ borderTop: isConfronted ? '1px solid rgba(16, 185, 129, 0.12)' : '1px solid rgba(245, 158, 11, 0.12)' }}>
        {isConfronted ? (
          <div className="w-full py-2 rounded-xl text-xs font-black text-center bg-emerald-50 border border-emerald-500/25 text-emerald-700 flex items-center justify-center gap-1.5 select-none">
            ✓ Confronted & Resolved
          </div>
        ) : (
          <button
            type="button"
            onClick={onConfront}
            className="w-full py-2 rounded-xl text-xs font-bold text-center cursor-pointer transition-all duration-250 bg-amber-50 hover:bg-amber-100 border border-amber-200 hover:border-amber-300 text-amber-800 hover:text-amber-950"
          >
            Confront Assumption
          </button>
        )}
      </div>
    </motion.div>
  );
}
