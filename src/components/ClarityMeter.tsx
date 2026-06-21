'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ClarityMeterProps {
  value: number;
}

export default function ClarityMeter({ value }: ClarityMeterProps) {
  const circumference = 2 * Math.PI * 36;
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex items-center justify-center h-20 w-20">
        <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" strokeWidth="4" stroke="#dedad2" fill="transparent" />
          <motion.circle
            cx="40" cy="40" r="36" strokeWidth="4"
            stroke={value >= 80 ? '#2d8a5e' : '#2d6a4f'}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - (circumference * value) / 100 }}
            transition={{ type: 'spring', stiffness: 40, damping: 12 }}
          />
        </svg>
        <span className="text-lg font-bold" style={{ color: '#141413', fontFamily: 'Inter, sans-serif' }}>
          {value}%
        </span>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#3d3b35' }}>
          Your Clarity
        </p>
        <p className="text-sm font-medium" style={{ color: value >= 80 ? '#2d8a5e' : '#2d6a4f' }}>
          {value >= 80 ? '✓ Ready to choose your path' : 'Engage with the tools below to build clarity'}
        </p>
        <p className="text-[10px] mt-1" style={{ color: '#7c7b72' }}>
          {value < 80 ? 'Why? Decisions made without reflection lead to regret. This ensures you think before committing.' : ''}
        </p>
      </div>
    </div>
  );
}
