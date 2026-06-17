// Crossroads — TypeScript Type Definitions
// Ported from the root TYPES.ts file

// === INTAKE ===

export interface IntakeData {
  /** The decision being faced (free text) */
  decision: string;

  /** 2-4 options being considered */
  options: string[];

  /** User's constraints (selected + free text) */
  constraints: string[];

  /** Ranked values (most important first) */
  values: string[];

  /** Timeline for making the decision */
  timeline: string;

  /** User's biggest fear about deciding */
  fear: string;

  /** Optional: decision category for prompt context */
  category?: DecisionCategory;

  /** Optional savings for financial runway projections */
  savings?: number;

  /** Optional monthly survival budget for runway calculations */
  monthly_budget?: number;
}

export type DecisionCategory =
  | 'career'          // job vs grad school vs startup
  | 'relocation'      // move cities
  | 'education'       // degree vs bootcamp vs self-taught
  | 'relationship'    // stay vs leave
  | 'financial'       // invest vs save vs spend
  | 'other';

// === ANALYSIS RESULT (from Gemini Prompt 1) ===

export interface Assumption {
  /** What the user is assuming without realizing */
  assumption: string;

  /** Why this assumption might not hold */
  why_wrong: string;

  /** How the decision looks different without this assumption */
  what_changes: string;
}

export interface DimensionScores {
  financial: number;
  emotional: number;
  growth: number;
  stability: number;
  relationships: number;
}

export interface Scenario {
  /** Name of the option/path */
  option_name: string;

  /** What life looks like at 30 days */
  narrative_30_days: string;

  /** What life looks like at 60 days */
  narrative_60_days: string;

  /** What life looks like at 90 days */
  narrative_90_days: string;

  /** Confidence score 0-100 */
  confidence: number;

  /** One sentence explaining the confidence score */
  confidence_reasoning: string;

  /** A non-obvious cost the user hasn't considered */
  hidden_cost: string;

  /** The biggest thing that could go wrong */
  biggest_risk: string;

  /** What the user loses by choosing this path */
  what_you_give_up: string;

  /** 0-100 alignment with user's stated values */
  alignment_score: number;

  /** Client-side live score dimensions (0-100 each) */
  dimension_scores: DimensionScores;
}

export interface AnalysisResult {
  /** 3 hidden assumptions */
  assumptions: Assumption[];

  /** 3 scenarios (one per option) */
  scenarios: Scenario[];

  /** What the AI cannot know about this situation */
  uncertainty_disclosure: string;
}

// === ACTION PLAN (from Gemini Prompt 2) ===

export interface ActionDay {
  /** Day number (1-7) */
  day: number;

  /** Specific action to take */
  action: string;

  /** Why this needs to happen on this day */
  why_first: string;

  /** Suggested time of day */
  time_of_day: 'morning' | 'afternoon' | 'evening';

  /** Whether this action can be undone */
  reversible: boolean;

  /** Whether this action requires spending money */
  costs_money: boolean;
}

export interface ActionPlanResult {
  /** The path the user selected */
  chosen_path: string;

  /** 7 days of specific actions */
  plan: ActionDay[];

  /** Question to ask yourself on day 7 */
  reflection_prompt: string;

  /** Backup plan if this path doesn't work */
  fallback: string;
}

// === UI STATE ===

export type AppScreen = 'intake' | 'loading' | 'results' | 'plan';

export interface AppState {
  currentScreen: AppScreen;
  intake: IntakeData | null;
  analysis: AnalysisResult | null;
  selectedPath: string | null;
  actionPlan: ActionPlanResult | null;
  error: string | null;
}

export interface DecisionJournalEntry {
  id: string;
  date: string;
  decision: string;
  chosen_path: string;
  confidence: number;
  options: string[];
  reflections?: string;
}

// === VALIDATION ===

export interface ValidationError {
  field: keyof IntakeData;
  message: string;
}

export function validateIntake(data: Partial<IntakeData>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.decision?.trim()) {
    errors.push({ field: 'decision', message: 'Describe the decision you\'re facing' });
  }

  if (!data.options || data.options.filter(o => o.trim()).length < 2) {
    errors.push({ field: 'options', message: 'Provide at least 2 options you\'re considering' });
  }

  if (data.options && data.options.filter(o => o.trim()).length > 4) {
    errors.push({ field: 'options', message: 'Maximum 4 options' });
  }

  if (!data.constraints || data.constraints.length === 0) {
    errors.push({ field: 'constraints', message: 'Select at least 1 constraint' });
  }

  if (!data.values || data.values.length < 2) {
    errors.push({ field: 'values', message: 'Rank at least 2 values' });
  }

  if (!data.timeline?.trim()) {
    errors.push({ field: 'timeline', message: 'Specify your timeline for deciding' });
  }

  return errors;
}

// === CONSTANTS ===

export const CONSTRAINT_OPTIONS = [
  'Limited money/savings',
  'Student debt',
  'Family responsibilities',
  'Geographic limitation (can\'t relocate easily)',
  'Time pressure (deadline approaching)',
  'Health considerations',
  'Relationship commitments',
  'Visa/immigration status',
  'Current lease/housing',
  'Lack of experience in one option',
] as const;

export const VALUE_OPTIONS = [
  'Financial stability',
  'Intellectual growth',
  'Independence/freedom',
  'Work-life balance',
  'Career advancement',
  'Making an impact',
  'Creative expression',
  'Security/predictability',
  'Adventure/novelty',
  'Relationships/community',
] as const;

export const DECISION_CATEGORIES: { value: DecisionCategory; label: string; examples: string }[] = [
  { value: 'career', label: 'Career Decision', examples: 'Job offer, grad school, startup, career switch' },
  { value: 'relocation', label: 'Moving/Relocation', examples: 'Move cities, stay vs. go, remote vs. in-person' },
  { value: 'education', label: 'Education Path', examples: 'Degree, bootcamp, self-taught, certification' },
  { value: 'financial', label: 'Financial Decision', examples: 'Invest, save, major purchase, debt strategy' },
  { value: 'relationship', label: 'Life/Relationship', examples: 'Major life change, personal crossroads' },
  { value: 'other', label: 'Other', examples: 'Any significant decision with real trade-offs' },
];
