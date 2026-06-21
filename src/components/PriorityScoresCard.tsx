'use client';

import React from 'react';
import { motion } from 'framer-motion';
import ScoreBar from './ScoreBar';
import { Scenario } from '../lib/types';

interface PriorityScoresCardProps {
  scenarios: Scenario[];
  liveScores: Record<string, number>;
  baseScores: Record<string, number>;
  toggledOffConstraints: string[];
  sandboxSavings: number;
  sandboxDeferral: number;
  originalSavings: number;
  cardVariants?: any;
}

export default function PriorityScoresCard({
  scenarios,
  liveScores,
  baseScores,
  toggledOffConstraints,
  sandboxSavings,
  sandboxDeferral,
  originalSavings,
  cardVariants,
}: PriorityScoresCardProps) {
  const hasChanges = toggledOffConstraints.length > 0 || sandboxSavings !== originalSavings || sandboxDeferral > 0;

  return (
    <motion.div
      variants={cardVariants}
      className="rounded-xl p-6 space-y-4 bg-[var(--card)] border border-[var(--border)]"
    >
      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
        Priority Alignment Scores
      </h4>
      <div className="grid grid-cols-1 gap-4">
        {scenarios.map((scenario, idx) => {
          const score = liveScores[scenario.option_name] ?? 0;
          const base = baseScores[scenario.option_name] ?? score;
          const delta = hasChanges ? score - base : 0;
          return (
            <ScoreBar
              key={scenario.option_name}
              label={scenario.option_name}
              score={score}
              baselineScore={scenario.alignment_score}
              index={idx}
              delta={delta}
            />
          );
        })}
      </div>
    </motion.div>
  );
}
