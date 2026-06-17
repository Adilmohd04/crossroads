'use client';

import React from 'react';
import { Scenario } from '../lib/types';
import ScenarioCard from './ScenarioCard';

interface ComparisonViewProps {
  scenarios: Scenario[];
  liveScores?: Record<string, number>;
}

export default function ComparisonView({ scenarios, liveScores }: ComparisonViewProps) {
  // Dynamically calculate grid columns on md/lg layouts based on number of scenarios
  const getGridClass = () => {
    switch (scenarios.length) {
      case 2:
        return 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto';
      case 4:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
      default:
        return 'grid-cols-1 md:grid-cols-3'; // Default 3 columns
    }
  };

  return (
    <div className={`grid gap-6 ${getGridClass()}`}>
      {scenarios.map((scenario, index) => (
        <ScenarioCard
          key={scenario.option_name + index}
          scenario={scenario}
          index={index}
          liveScore={liveScores ? liveScores[scenario.option_name] : undefined}
        />
      ))}
    </div>
  );
}
