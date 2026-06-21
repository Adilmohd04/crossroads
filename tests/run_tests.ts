import assert from 'node:assert';
import { validateIntake } from '../src/lib/types';
import { calculateCompositeScore, initializeWeightsFromValues } from '../src/lib/scoring';
import { getCashFlowForScenario, projectBalances } from '../src/lib/runway';
import {
  getMetrics,
  trackSliderChange,
  trackConstraintToggle,
  generateBehaviorInsights,
  resetBehaviorTracker,
  flushPendingSliderChanges
} from '../src/lib/behaviorTracker';

console.log('🧪 Running Crossroads Unit Tests...\n');

// 1. Test Intake Validation
try {
  console.log('1. Testing validateIntake...');
  const emptyErrors = validateIntake({});
  assert.ok(emptyErrors.length > 0, 'Empty intake should yield validation errors');

  const validErrors = validateIntake({
    decision: 'Test Decision',
    options: ['Option 1', 'Option 2'],
    constraints: ['Time pressure (deadline approaching)'],
    values: ['Intellectual growth', 'Financial stability'],
    timeline: '10 days',
    fear: 'Failing'
  });
  assert.strictEqual(validErrors.length, 0, 'Valid intake should yield no validation errors');
  console.log('   ✓ validateIntake passed.');
} catch (e) {
  console.error('   ✗ validateIntake failed:', e);
  process.exit(1);
}

// 2. Test Scoring Mathematics
try {
  console.log('2. Testing calculateCompositeScore...');
  const scores = { financial: 90, emotional: 70, growth: 80, stability: 50, relationships: 60 };
  const weights = { financial: 100, emotional: 50, growth: 50, stability: 50, relationships: 50 };

  const score = calculateCompositeScore(scores, weights);
  // Math: (90*100 + 70*50 + 80*50 + 50*50 + 60*50) / 300
  // = (9000 + 3500 + 4000 + 2500 + 3000) / 300
  // = 22000 / 300 = 73.33 -> round -> 73
  assert.strictEqual(score, 73, `Composite score should be 73, got ${score}`);
  console.log('   ✓ calculateCompositeScore math passed.');
} catch (e) {
  console.error('   ✗ calculateCompositeScore failed:', e);
  process.exit(1);
}

// 3. Test Weights Initialization
try {
  console.log('3. Testing initializeWeightsFromValues...');
  const weights = initializeWeightsFromValues(['Intellectual growth', 'Financial stability']);
  assert.strictEqual(weights.growth, 90, 'Growth weight should be initialized correctly');
  assert.strictEqual(weights.financial, 80, 'Financial weight should be initialized correctly');
  console.log('   ✓ initializeWeightsFromValues passed.');
} catch (e) {
  console.error('   ✗ initializeWeightsFromValues failed:', e);
  process.exit(1);
}

// 4. Test Behavioral DNA & Insights
try {
  console.log('4. Testing Behavior Tracker & Insights...');
  resetBehaviorTracker();

  // Simulate adjusting sliders (stated value is Work-life balance (emotional/relationships) but user spends time tweaking financial)
  trackSliderChange('financial', 80);
  trackSliderChange('growth', 90);
  trackSliderChange('relationships', 95);

  // Flush the changes instantly (bypassing debounce)
  flushPendingSliderChanges();

  // Toggling constraint
  trackConstraintToggle('Limited money/savings');
  trackConstraintToggle('Limited money/savings');

  const metrics = getMetrics();
  assert.strictEqual(metrics.totalSliderChanges, 3, 'Slider adjustments should be recorded');
  assert.strictEqual(metrics.mostAdjustedDimension, 'financial', 'Most adjusted dimension should be financial (first dimension adjusted)');

  const mockIntake = {
    decision: 'Career Choice',
    options: ['Job', 'Grad School'],
    constraints: ['Limited money/savings'],
    values: ['Work-life balance', 'Relationships/community'],
    timeline: '10 days',
    fear: 'Financial instability',
    savings: 5000,
    monthly_budget: 2000
  };

  const insights = generateBehaviorInsights(mockIntake);
  assert.ok(insights.length >= 1, 'Behavior insights should be generated');
  assert.ok(insights.some(i => i.title.includes('Hidden Tension')), 'Should detect Hidden Tension stated vs revealed priority conflict');
  console.log('   ✓ Behavior Tracker tests passed.');
} catch (e) {
  console.error('   ✗ Behavior Tracker failed:', e);
  process.exit(1);
}

// 5. Test Runway Simulator Projections
try {
  console.log('5. Testing Runway Simulator Projections...');
  
  // Test SF/NY 1.45x multiplier
  const sfResult = getCashFlowForScenario('career in SF', 3000);
  assert.strictEqual(sfResult.colMultiplier, 1.45, 'SF option should apply 1.45x COL multiplier');
  assert.strictEqual(sfResult.adjustedLivingCost, Math.round(3000 * 1.45), 'SF living cost should be 3000 * 1.45');
  
  // Test Hometown 0.85x multiplier
  const hometownResult = getCashFlowForScenario('startup hometown', 3000);
  assert.strictEqual(hometownResult.colMultiplier, 0.85, 'Hometown option should apply 0.85x COL multiplier');
  assert.strictEqual(hometownResult.adjustedLivingCost, Math.round(3000 * 0.85), 'Hometown living cost should be 3000 * 0.85');

  // Test projectBalances and depletion month calculation
  const projectResult = projectBalances('grad school study', 5000, 2000);
  assert.strictEqual(projectResult.crisisMonth, 2, 'Savings should be depleted in month 2');
  assert.strictEqual(projectResult.netFlow, -3100, 'Grad school net flow should be -3100');

  console.log('   ✓ Runway Simulator tests passed.');
} catch (e) {
  console.error('   ✗ Runway Simulator failed:', e);
  process.exit(1);
}

console.log('\n🎉 All Crossroads tests passed successfully.');
process.exit(0);
