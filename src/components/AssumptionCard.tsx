'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { EyeOff, AlertTriangle, ArrowRightLeft } from 'lucide-react';
import { Assumption } from '../lib/types';

interface AssumptionCardProps {
  assumption: Assumption;
  index: number;
}

export default function AssumptionCard({ assumption, index }: AssumptionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col rounded-2xl p-5 md:p-6 transition-all duration-300"
      style={{
        background: 'rgba(245, 158, 11, 0.05)',
        border: '1px solid rgba(245, 158, 11, 0.2)',
        borderLeft: '3px solid rgba(245, 158, 11, 0.6)',
        backdropFilter: 'blur(12px)',
      }}
      whileHover={{
        borderColor: 'rgba(245, 158, 11, 0.4)',
        boxShadow: '0 8px 30px rgba(245, 158, 11, 0.12)',
      }}
    >
      {/* Card header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="flex h-6 w-6 items-center justify-center rounded-md text-xs font-black"
          style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
          {index + 1}
        </span>
        <h4 className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#fbbf24' }}>
          Hidden Assumption
        </h4>
      </div>

      <div className="space-y-4">
        {/* The assumption */}
        <div className="flex gap-2.5 items-start">
          <EyeOff className="h-4 w-4 shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
          <div>
            <h5 className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: '#fbbf24' }}>
              Assumption:
            </h5>
            <p className="text-xs font-semibold leading-relaxed" style={{ color: '#e2e8f0' }}>
              {assumption.assumption}
            </p>
          </div>
        </div>

        {/* Why wrong */}
        <div className="flex gap-2.5 items-start pt-3"
          style={{ borderTop: '1px solid rgba(245, 158, 11, 0.15)' }}>
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
          <div>
            <h5 className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: '#fbbf24' }}>
              Why it might not hold:
            </h5>
            <p className="text-xs font-medium leading-relaxed" style={{ color: '#9ba8c9' }}>
              {assumption.why_wrong}
            </p>
          </div>
        </div>

        {/* What changes */}
        <div className="flex gap-2.5 items-start pt-3"
          style={{ borderTop: '1px solid rgba(245, 158, 11, 0.15)' }}>
          <ArrowRightLeft className="h-4 w-4 shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
          <div>
            <h5 className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: '#fbbf24' }}>
              How the decision changes:
            </h5>
            <p className="text-xs font-medium leading-relaxed" style={{ color: '#9ba8c9' }}>
              {assumption.what_changes}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
