import { DimensionScores } from './types';

export interface DimensionWeights {
  financial: number;
  emotional: number;
  growth: number;
  stability: number;
  relationships: number;
}

/**
 * Calculates the composite score for a scenario based on weights.
 * Normalized to 0-100.
 */
export function calculateCompositeScore(
  scores: DimensionScores,
  weights: DimensionWeights
): number {
  const totalWeight =
    weights.financial +
    weights.emotional +
    weights.growth +
    weights.stability +
    weights.relationships;

  if (totalWeight === 0) return 0;

  const weightedSum =
    scores.financial * weights.financial +
    scores.emotional * weights.emotional +
    scores.growth * weights.growth +
    scores.stability * weights.stability +
    scores.relationships * weights.relationships;

  return Math.round(weightedSum / totalWeight);
}

/**
 * Initializes dimension weights based on the user's ranked values from intake.
 * Higher ranked values boost matching dimensions.
 */
export function initializeWeightsFromValues(rankedValues: string[]): DimensionWeights {
  // Base weights start at 50 (neutral middle)
  const weights: DimensionWeights = {
    financial: 50,
    emotional: 50,
    growth: 50,
    stability: 50,
    relationships: 50,
  };

  if (!rankedValues || rankedValues.length === 0) {
    return weights;
  }

  // Value mappings to dimensions
  const mappings: Record<string, (keyof DimensionWeights)[]> = {
    'Financial stability': ['financial', 'stability'],
    'Intellectual growth': ['growth'],
    'Independence/freedom': ['emotional'],
    'Work-life balance': ['emotional', 'relationships'],
    'Career advancement': ['growth', 'financial'],
    'Making an impact': ['growth', 'emotional'],
    'Creative expression': ['growth', 'emotional'],
    'Security/predictability': ['stability'],
    'Adventure/novelty': ['emotional'],
    'Relationships/community': ['relationships'],
  };

  // Process up to top 5 ranked values
  rankedValues.forEach((val, idx) => {
    const matchedDimensions = mappings[val];
    if (!matchedDimensions) return;

    // Rank 1 (index 0) gets +40, Rank 2 gets +30, Rank 3 gets +20, etc.
    const boost = Math.max(10, 40 - idx * 10);

    matchedDimensions.forEach((dim) => {
      weights[dim] += boost;
    });
  });

  // Clamp weights between 10 and 100 to keep them in range
  const clamp = (val: number) => Math.max(10, Math.min(100, val));
  
  return {
    financial: clamp(weights.financial),
    emotional: clamp(weights.emotional),
    growth: clamp(weights.growth),
    stability: clamp(weights.stability),
    relationships: clamp(weights.relationships),
  };
}
