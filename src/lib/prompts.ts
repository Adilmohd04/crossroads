import { IntakeData, DecisionJournalEntry, DecisionDNA } from './types';
import { buildHistoryContext } from './secondBrain';

export function buildAnalysisPrompt(
  intake: IntakeData,
  history?: DecisionJournalEntry[],
  dna?: DecisionDNA
): string {
  const optionsList = (intake.options || [])
    .filter((o) => o && o.trim())
    .map((o, idx) => `${idx + 1}. "${o.trim()}"`)
    .join('\n');

  const runwayMonths = intake.savings && intake.monthly_budget
    ? Math.round(intake.savings / intake.monthly_budget)
    : null;

  const dnaContext = dna 
    ? `\nUSER DECISION DNA PROFILE (LEARNED MEMORY):
Summary of their decision-making style: "${dna.summary}"
Their blind spots: "${dna.blind_spot}"
Observed patterns:
${dna.patterns.map(p => `- ${p.pattern}: ${p.insight}`).join('\n')}

CRITICAL INSTRUCTION:
The user has faced previous life decisions, and the system has learned their Decision DNA. You MUST incorporate this to challenge their patterns:
- Identify if their current decision repeats their signature blind spots or biases.
- In Task 1 (Assumptions), explicitly challenge them if they are repeating a past bias or pattern. Reference their Decision DNA in at least one assumption (e.g. "Reflecting your pattern of prioritizing safety over growth, you are assuming...").
- In Task 2 (Scenarios), adjust the confidence scores or risks to reflect their learned history.`
    : '';

  return `You are a decision reasoning engine. Give insights so specific that the user says "how did it know that about me?" Every insight must reference at least 2 of their specific inputs — NOT generic advice.

USER:
Decision: ${intake.decision}
Options:
${optionsList}
Constraints: ${intake.constraints.join(', ')}
Values (ranked): ${intake.values.join(' > ')}
Timeline: ${intake.timeline}
Fear: "${intake.fear}"
${intake.savings ? `Savings: $${intake.savings.toLocaleString()}` : ''}${intake.monthly_budget ? `, Monthly burn: $${intake.monthly_budget}` : ''}${runwayMonths ? `, Runway: ~${runwayMonths} months` : ''}
${history && history.length > 0 ? buildHistoryContext(history) : ''}
${dnaContext}

TASK 1: 3 hidden assumptions. Each MUST reference their specific fear, savings, timeline, or values. Name the cognitive bias.

TASK 2: One scenario per option. Each narrative MUST mention their fear "${intake.fear.slice(0, 60)}" or their specific numbers. Confidence scores must differ by 15+ points. For confidence_reasoning: use their actual constraints, not general statements.

TASK 3: One uncertainty paragraph specific to their situation.

RULES: Never say "you should." Never pick a winner. Use Google Search for real programs/salaries/deadlines matching their situation.

OUTPUT JSON only:
{
  "assumptions": [{"assumption":"","why_wrong":"","what_changes":"","cognitive_bias":""}],
  "scenarios": [{
    "option_name":"",
    "narrative_30_days":"","narrative_60_days":"","narrative_90_days":"",
    "confidence":0,"confidence_reasoning":"",
    "hidden_cost":"","biggest_risk":"","what_you_give_up":"",
    "alignment_score":0,
    "dimension_scores":{"financial":0,"emotional":0,"growth":0,"stability":0,"relationships":0}
  }],
  "uncertainty_disclosure":""
}`;
}

import { BehaviorInsight } from './behaviorTracker';

export function buildActionPlanPrompt(
  intake: IntakeData,
  chosenPath: string,
  risk: string,
  behavioralInsights?: BehaviorInsight[]
): string {
  const runwayMonths = intake.savings && intake.monthly_budget
    ? Math.round(intake.savings / intake.monthly_budget)
    : null;

  const behavioralCtx = behavioralInsights && behavioralInsights.length > 0
    ? `\nBEHAVIORAL OBSERVATIONS DURING SIMULATION:
The user's real-time interaction patterns revealed the following insights:
${behavioralInsights.map(insight => `- [${insight.title}] Observation: ${insight.observation.replace(/\n/g, ' ')} | Interpretation: ${insight.interpretation}`).join('\n')}

INCORPORATE THESE INSIGHTS:
- Modify/adjust the 7-day action items to directly address these observed behaviors.
- For instance, if they showed financial anxiety, ensure the plan has specific financial risk mitigation or budgeting deliverables. If they showed stated vs. revealed priority conflict, add reflection prompts or micro-actions to address this conflict.`
    : '';

  return `Generate a personalized 7-day action plan.

PERSON: chose "${chosenPath}"
Decision: ${intake.decision}
Fear: "${intake.fear}"
Top value: ${intake.values[0] || 'growth'}
Timeline: ${intake.timeline}
Constraints: ${intake.constraints.join(', ')}
${intake.savings ? `Savings: $${intake.savings.toLocaleString()}${runwayMonths ? `, ~${runwayMonths} months runway` : ''}` : ''}
Key risk: ${risk}
${behavioralCtx}

Rules: Every task = specific deliverable. No "research" or "consider." Day 1 addresses "${intake.timeline}." Reference their fear. Use Google Search for actual URLs/portals.

OUTPUT JSON only:
{
  "chosen_path":"${chosenPath}",
  "plan":[{"day":1,"action":"","why_first":"","time_of_day":"morning","reversible":true,"costs_money":false}],
  "reflection_prompt":"",
  "fallback":""
}`;
}
