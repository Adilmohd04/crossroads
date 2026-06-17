'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Sunrise,
  Sun,
  Moon,
  AlertOctagon,
  DollarSign,
  HelpCircle,
  Undo2,
  AlertTriangle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { ActionPlanResult } from '../lib/types';
import { useApp } from '../context/AppContext';

interface ActionPlanProps {
  actionPlan: ActionPlanResult;
}

const DAY_GRADIENTS = [
  'linear-gradient(135deg, #3b6fff, #6366f1)',
  'linear-gradient(135deg, #6366f1, #8b5cf6)',
  'linear-gradient(135deg, #8b5cf6, #ec4899)',
  'linear-gradient(135deg, #10b981, #06b6d4)',
  'linear-gradient(135deg, #f59e0b, #f97316)',
  'linear-gradient(135deg, #3b6fff, #10b981)',
  'linear-gradient(135deg, #8b5cf6, #3b6fff)',
];

export default function ActionPlan({ actionPlan }: ActionPlanProps) {
  const { resetApp } = useApp();

  const getTimeIcon = (time: 'morning' | 'afternoon' | 'evening') => {
    switch (time) {
      case 'morning':   return <Sunrise className="h-3.5 w-3.5" style={{ color: '#fbbf24' }} />;
      case 'afternoon': return <Sun     className="h-3.5 w-3.5" style={{ color: '#f97316' }} />;
      case 'evening':   return <Moon    className="h-3.5 w-3.5" style={{ color: '#818cf8' }} />;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.12 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -12 },
    show:   { opacity: 1, x: 0 },
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-12">

      {/* Timeline */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative pl-6 space-y-5 sm:pl-8"
        style={{ borderLeft: '1px solid rgba(59, 111, 255, 0.25)', marginLeft: '20px' }}
      >
        {actionPlan.plan.map((dayPlan, idx) => (
          <motion.div key={dayPlan.day} variants={itemVariants} className="relative">

            {/* Timeline node */}
            <div className="absolute -left-[37px] sm:-left-[47px] top-3 flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-black text-white"
              style={{
                background: DAY_GRADIENTS[idx % DAY_GRADIENTS.length],
                boxShadow: `0 0 12px rgba(59, 111, 255, 0.4)`,
                border: '2px solid rgba(8, 11, 20, 0.8)',
              }}>
              {dayPlan.day}
            </div>

            {/* Day card */}
            <div className="rounded-2xl p-4 transition-all duration-300"
              style={{
                background: 'rgba(13, 17, 32, 0.75)',
                border: '1px solid rgba(99, 116, 163, 0.18)',
                backdropFilter: 'blur(12px)',
              }}>
              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {/* Time badge */}
                <div className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold capitalize"
                  style={{ background: 'rgba(99, 116, 163, 0.12)', border: '1px solid rgba(99, 116, 163, 0.2)', color: '#9ba8c9' }}>
                  {getTimeIcon(dayPlan.time_of_day)}
                  <span>{dayPlan.time_of_day}</span>
                </div>

                {dayPlan.reversible ? (
                  <div className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold"
                    style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
                    <Undo2 className="h-3 w-3 shrink-0" />
                    <span>Reversible</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold"
                    style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.2)', color: '#fb7185' }}>
                    <AlertOctagon className="h-3 w-3 shrink-0" />
                    <span>Irreversible</span>
                  </div>
                )}

                {dayPlan.costs_money && (
                  <div className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold"
                    style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', color: '#fbbf24' }}>
                    <DollarSign className="h-3 w-3 shrink-0" />
                    <span>Requires Budget</span>
                  </div>
                )}
              </div>

              {/* Action text */}
              <p className="text-xs font-bold leading-relaxed" style={{ color: '#e2e8f0' }}>
                {dayPlan.action}
              </p>

              {/* Why first */}
              <div className="mt-3 pt-2.5 text-[10px] font-medium italic leading-relaxed"
                style={{ borderTop: '1px solid rgba(99, 116, 163, 0.12)', color: '#5c6b8c' }}>
                <strong style={{ color: '#9ba8c9' }}>Why first: </strong>{dayPlan.why_first}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Reflection Prompt */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85, duration: 0.4 }}
        className="rounded-2xl p-5 flex items-start gap-4"
        style={{
          background: 'rgba(59, 111, 255, 0.06)',
          border: '1px solid rgba(59, 111, 255, 0.2)',
          borderLeft: '3px solid rgba(59, 111, 255, 0.6)',
        }}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ background: 'rgba(59, 111, 255, 0.12)', border: '1px solid rgba(59, 111, 255, 0.2)' }}>
          <HelpCircle className="h-5 w-5" style={{ color: '#7ba7ff' }} />
        </div>
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-wider mb-1.5" style={{ color: '#7ba7ff' }}>
            Day 7 Reflection Prompt
          </h4>
          <p className="text-xs font-semibold leading-relaxed" style={{ color: '#9ba8c9' }}>
            {actionPlan.reflection_prompt}
          </p>
        </div>
      </motion.div>

      {/* Fallback Plan */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.95, duration: 0.4 }}
        className="rounded-2xl p-5 flex items-start gap-4"
        style={{
          background: 'rgba(245, 158, 11, 0.05)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          borderLeft: '3px solid rgba(245, 158, 11, 0.6)',
        }}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
          <AlertTriangle className="h-5 w-5" style={{ color: '#fbbf24' }} />
        </div>
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-wider mb-1.5" style={{ color: '#fbbf24' }}>
            Contingency Fallback Plan
          </h4>
          <p className="text-xs font-semibold leading-relaxed" style={{ color: '#9ba8c9' }}>
            {actionPlan.fallback}
          </p>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.05 }}
        className="pt-4 text-center"
      >
        <button
          onClick={resetApp}
          className="btn-primary inline-flex text-sm px-8 py-4"
        >
          <Sparkles className="h-4 w-4" />
          <span>Test Another Decision</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </motion.div>
    </div>
  );
}
