/**
 * Cognitive Load & Behavior Tracker
 * 
 * Observes user interaction patterns during the decision session
 * and generates meta-insights about their decision-making behavior.
 * 
 * This is agentic — the AI isn't just processing inputs, it's
 * observing the user's PROCESS and making inferences about their
 * psychological state.
 */

export interface BehaviorMetrics {
  /** Which dimension slider was adjusted most (by total change amount) */
  mostAdjustedDimension: string | null;
  /** Total number of slider adjustments */
  totalSliderChanges: number;
  /** Which constraints were toggled (and how many times) */
  constraintToggleCounts: Record<string, number>;
  /** Time spent on assumptions before moving on (ms) */
  assumptionDwellTime: number;
  /** Time spent on simulation workspace (ms) */
  simulationDwellTime: number;
  /** Session start timestamp */
  sessionStart: number;
  /** Number of times the runway simulation was tweaked */
  runwayInteractions: number;
}

export interface BehaviorInsight {
  title: string;
  observation: string;
  interpretation: string;
  icon: 'anxiety' | 'clarity' | 'avoidance' | 'exploration' | 'contradiction';
}

const initialMetrics: BehaviorMetrics = {
  mostAdjustedDimension: null,
  totalSliderChanges: 0,
  constraintToggleCounts: {},
  assumptionDwellTime: 0,
  simulationDwellTime: 0,
  sessionStart: Date.now(),
  runwayInteractions: 0,
};

let metrics: BehaviorMetrics = { ...initialMetrics };
let sliderHistory: Record<string, number[]> = {};
let phaseTimestamps: Record<string, number> = {};

// Debounce state tracking variables
let pendingSliderValues: Record<string, number> = {};
let trackingTimeouts: Record<string, NodeJS.Timeout> = {};

export function resetBehaviorTracker() {
  metrics = { ...initialMetrics, sessionStart: Date.now() };
  sliderHistory = {};
  phaseTimestamps = {};
  pendingSliderValues = {};
  // Clear any active timeouts
  Object.values(trackingTimeouts).forEach((t) => clearTimeout(t));
  trackingTimeouts = {};
}

export function flushPendingSliderChanges() {
  Object.keys(pendingSliderValues).forEach((dimension) => {
    const value = pendingSliderValues[dimension];
    if (value !== undefined) {
      if (!sliderHistory[dimension]) sliderHistory[dimension] = [];
      sliderHistory[dimension].push(value);
      metrics.totalSliderChanges++;
      delete pendingSliderValues[dimension];
    }
  });

  // Determine most adjusted dimension
  let maxChanges = 0;
  let maxDim = '';
  Object.entries(sliderHistory).forEach(([dim, values]) => {
    if (values.length > maxChanges) {
      maxChanges = values.length;
      maxDim = dim;
    }
  });
  metrics.mostAdjustedDimension = maxDim;
}

export function trackSliderChange(dimension: string, value: number) {
  // Store the latest slider value
  pendingSliderValues[dimension] = value;

  // Clear existing timeout for this dimension
  if (trackingTimeouts[dimension]) {
    clearTimeout(trackingTimeouts[dimension]);
  }

  // Set timeout to commit the change after 600ms of drag inactivity
  trackingTimeouts[dimension] = setTimeout(() => {
    const val = pendingSliderValues[dimension];
    if (val !== undefined) {
      if (!sliderHistory[dimension]) sliderHistory[dimension] = [];
      sliderHistory[dimension].push(val);
      metrics.totalSliderChanges++;
      delete pendingSliderValues[dimension];

      // Determine most adjusted
      let maxChanges = 0;
      let maxDim = '';
      Object.entries(sliderHistory).forEach(([dim, values]) => {
        if (values.length > maxChanges) {
          maxChanges = values.length;
          maxDim = dim;
        }
      });
      metrics.mostAdjustedDimension = maxDim;
    }
    delete trackingTimeouts[dimension];
  }, 600);
}

export function trackConstraintToggle(constraint: string) {
  if (!metrics.constraintToggleCounts[constraint]) {
    metrics.constraintToggleCounts[constraint] = 0;
  }
  metrics.constraintToggleCounts[constraint]++;
}

export function markPhaseStart(phase: string) {
  phaseTimestamps[`${phase}_start`] = Date.now();
}

export function markPhaseEnd(phase: string) {
  const start = phaseTimestamps[`${phase}_start`];
  if (start) {
    const duration = Date.now() - start;
    if (phase === 'assumptions') metrics.assumptionDwellTime = duration;
    if (phase === 'simulation') metrics.simulationDwellTime = duration;
  }
}

export function trackRunwayInteraction() {
  metrics.runwayInteractions = (metrics.runwayInteractions || 0) + 1;
}

export function getMetrics(): BehaviorMetrics {
  return { ...metrics };
}

/**
 * Generates behavioral insights based on observed interaction patterns.
 * This is the "agentic" part — the AI observes PROCESS, not just inputs.
 */
function isAcademicDecision(intake: any): boolean {
  const combined = [
    intake.decision || '',
    ...(intake.options || []),
  ].join(' ').toLowerCase();
  return combined.includes('college') ||
    combined.includes('university') ||
    combined.includes('jee') ||
    combined.includes('exam') ||
    combined.includes('drop year') ||
    combined.includes('gap year') ||
    combined.includes('admission') ||
    combined.includes('entrance') ||
    combined.includes('student') ||
    combined.includes('academic') ||
    combined.includes('semester') ||
    combined.includes('curriculum');
}

export function generateBehaviorInsights(intake: any): BehaviorInsight[] {
  // Flush any pending slider changes before reading metrics/generating insights
  flushPendingSliderChanges();
  const insights: BehaviorInsight[] = [];
  const m = metrics;
  const history = sliderHistory;

  if (!intake) return insights;

  const academic = isAcademicDecision(intake);
  const statedTopValue = intake.values?.[0] || '';
  const savings = intake.savings || 0;
  const fear = intake.fear || '';
  const runwayInteractions = m.runwayInteractions || 0;

  // 1. THE CONTRADICTION / HIDDEN TENSION
  if (statedTopValue && m.mostAdjustedDimension && m.totalSliderChanges >= 3) {
    const valueToSliderMap: Record<string, string> = {
      'Financial stability': 'financial',
      'Career advancement': 'growth',
      'Intellectual growth': 'growth',
      'Work-life balance': 'emotional',
      'Making an impact': 'growth',
      'Security/predictability': 'stability',
      'Independence/freedom': 'emotional',
      'Adventure/novelty': 'emotional',
      'Relationships/community': 'relationships',
      'Creative expression': 'growth',
    };
    const expectedDim = valueToSliderMap[statedTopValue];
    const actualDim = m.mostAdjustedDimension;
    const dimLabel = actualDim.charAt(0).toUpperCase() + actualDim.slice(1);
    const changes = history[actualDim]?.length || 0;
    const pct = Math.round((changes / Math.max(1, m.totalSliderChanges)) * 100);

    if (expectedDim && actualDim !== expectedDim) {
      let observation = `• Stated priority: Ranked "${statedTopValue}" as #1\n`;
      observation += `• Revealed focus: ${pct}% of slider interactions were on "${dimLabel}" weights\n`;
      if (savings > 0) {
        observation += `• Safety Buffer: Managing a cash reserve of $${savings.toLocaleString()}\n`;
      }
      if (fear) {
        observation += `• Stated fear: "${fear}"`;
      }

      let interpretation = '';
      if (statedTopValue === 'Career advancement' || statedTopValue === 'Personal Growth' || statedTopValue === 'Intellectual growth') {
        if (actualDim === 'relationships') {
          interpretation = academic
            ? `The real decision may not be drop year vs. college. The real decision is ambition vs. belonging. You state that academic or career growth is your priority, yet your interactive patterns reveal a persistent anxiety about staying connected to your current environment and community.`
            : `The real decision may not be relocation vs. staying. The real decision is growth vs. belonging. You state that professional advancement is your priority, yet your interactive patterns reveal a persistent anxiety about protecting relationships and community.`;
        } else if (actualDim === 'financial') {
          interpretation = academic
            ? `The real decision may not be study path vs. college. The real decision is growth vs. security. You say growth matters most, yet your interaction focus is dominated by minimizing downside, highlighting where your true risk aversion lives.`
            : `The real decision may not be startup vs. job. The real decision is growth vs. security. You say growth matters most, yet your interaction focus is dominated by minimizing financial downside, highlighting where your true risk aversion lives.`;
        } else {
          interpretation = `Although you ranked your primary ambition as "${statedTopValue}", your interactive adjustments focused heavily on protecting "${dimLabel}". This indicates a subconscious friction between your stated growth target and your immediate safety needs.`;
        }
      } else if (statedTopValue === 'Relationships/community' || statedTopValue === 'Work-life balance') {
        if (actualDim === 'growth' || actualDim === 'financial') {
          interpretation = `The real decision is belonging vs. ambition. You stated that community or balance is #1, but your interactive focus is dominated by maximizing growth or security tradeoffs. Ask yourself: are you keeping connections as a default, while actually craving professional expansion?`;
        } else {
          interpretation = `Your stated top value is "${statedTopValue}", but your revealed focus is "${dimLabel}". You are showing cognitive conflict between protecting your lifestyle and organizing around other survival metrics.`;
        }
      } else {
        interpretation = `Your stated priority "${statedTopValue}" is at odds with your interactive focus on "${dimLabel}". Crossroads reveals that you are optimizing for "${dimLabel}" far more than your starting questionnaire indicated.`;
      }

      insights.push({
        title: '⚡ Hidden Tension: Stated vs. Revealed Priority',
        observation,
        interpretation,
        icon: 'contradiction',
      });
    }
  }

  // 2. BEHAVIORAL SIGNAL: FINANCIAL FOCUS / UNCERTAINTY
  const financeChanges = history['financial']?.length || 0;
  if (financeChanges >= 2 || runwayInteractions > 0 || (savings > 0 && savings < 15000)) {
    let observation = `• Savings: $${savings.toLocaleString()} (limited runway)\n`;
    observation += `• Stated fear: "${fear || 'Not specified'}"\n`;
    observation += `• Financial slider adjusted ${financeChanges} times\n`;
    if (runwayInteractions > 0) {
      observation += `• Interacted with Runway Sprout Simulator ${runwayInteractions} times`;
    }

    let interpretation = '';
    if (savings > 0 && savings < 10000) {
      interpretation = academic
        ? `With only $${savings.toLocaleString()} in savings, committing to a path becomes riskier because you have less financial runway to handle unexpected costs. Even though your parents may cover expenses, your interaction patterns show this is still a concern for you.`
        : `With only $${savings.toLocaleString()} in savings, social or professional adjustments become more dangerous because you have less financial runway to absorb a difficult transition. Relocation or startup paths will trigger heightened anxiety because you lack a safety net.`;
    } else {
      interpretation = academic
        ? `Your interaction patterns show that financial considerations are filtering into your decision more than you may realize. Although a path might promise growth or prestige, the baseline cost of committing to preparation or college is something you are heavily risk-mitigating — even if someone else is paying.`
        : `Your interaction patterns show that financial considerations are your primary filter. Although a path might promise growth, the baseline financial drag of relocating or taking a pay cut is something you are heavily risk-mitigating.`;
    }

    insights.push({
      title: '🔍 Behavioral Signal: Financial Tradeoffs',
      observation,
      interpretation,
      icon: 'anxiety',
    });
  }

  // 3. BEHAVIORAL SIGNAL: DEEP EXPLORATION OR CONSTRAINT AUDIT
  const totalToggles = Object.values(m.constraintToggleCounts).reduce((a, b) => a + b, 0);
  if (totalToggles >= 3) {
    let observation = `• Toggled constraint scenarios ${totalToggles} times\n`;
    observation += `• Most revisited constraint: "${Object.entries(m.constraintToggleCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] || ''}"\n`;
    observation += `• Slider weights calibrated: ${m.totalSliderChanges} times`;

    insights.push({
      title: '🌿 Behavioral Indicator: Active Scenario Auditing',
      observation,
      interpretation: `You are aggressively stress-testing constraints to find exit paths. Swapping constraints on and off suggests you are evaluating whether your constraints (e.g., money or deadlines) are truly immovable, or if they are self-imposed boundaries you want permission to break.`,
      icon: 'exploration',
    });
  }

  return insights.slice(0, 2);
}
