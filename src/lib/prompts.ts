import { IntakeData } from './types';

/**
 * Builds the prompt for Prompt 1: Assumption Check + Scenario Generation
 */
export function buildAnalysisPrompt(intake: IntakeData): string {
  const optionsList = intake.options
    .filter((o) => o.trim())
    .map((o, idx) => `Option ${idx + 1}: "${o.trim()}"`)
    .join('\n');

  const constraintsList = intake.constraints.join(', ');
  const valuesList = intake.values.join(', ');

  return `You are a decision reasoning engine. Your job is NOT to give advice or pick a winner. Your job is to help the user SEE what they're not seeing.

USER SITUATION:
- Decision: ${intake.decision}
- Options being considered:
${optionsList}
- Constraints: ${constraintsList}
- Values (ranked): ${valuesList}
- Timeline: ${intake.timeline}
- Biggest fear: ${intake.fear}

INSTRUCTIONS:

1. HIDDEN ASSUMPTIONS — Identify exactly 3 assumptions the user is making without realizing it.
   For each:
   - What they're assuming (stated as a belief they hold)
   - Why it might not be true (with specific reasoning)
   - What changes if this assumption is wrong

2. SCENARIOS — Generate exactly one scenario for each option they are considering. The array must contain exactly the same number of scenarios as there are options.
   For each scenario:
   - option_name: the path name (MUST match one of the input options exactly)
   - narrative_30_days: what life looks like at 30 days (2-3 specific sentences)
   - narrative_60_days: what life looks like at 60 days (2-3 specific sentences)
   - narrative_90_days: what life looks like at 90 days (2-3 specific sentences)
   - confidence: 0-100 score for how likely this outcome is given THEIR constraints
   - confidence_reasoning: one sentence explaining WHY this confidence score
   - hidden_cost: one non-obvious thing they haven't priced in
   - biggest_risk: one concrete thing that could go wrong
   - what_you_give_up: one specific thing they lose by choosing this path
    - alignment_score: 0-100 how well this aligns with their stated values
    - dimension_scores: an object containing 0-100 scores representing how this option ranks across five standard dimensions:
        - financial: monetary compensation, costs, financial safety net
        - emotional: stress levels, mental health, overall happiness, alignment with personal peace
        - growth: career progression, learning opportunities, skill compounding
        - stability: safety, low volatility, predictability of the path
        - relationships: quality time, location proximity, connection to family/partner/friends

3. UNCERTAINTY DISCLOSURE — One paragraph explaining what you CANNOT know about their situation and where your reasoning might be wrong.

RULES:
- NEVER say "you should" or "the best option is"
- NEVER present one scenario as clearly superior
- Always acknowledge uncertainty honestly
- Be specific to THEIR situation — no generic advice
- USE THE GOOGLE SEARCH TOOL: You must execute Google search queries to look up actual, real-world master's programs, university names, active application deadlines, and specific job openings that match the user's location, background, and constraints.
- INCLUDE REAL OPPORTUNITIES: In the scenario narratives, you must name specific, real universities (e.g. 'Imperial College MSc', 'Georgia Tech OMSCS'), actual companies, or certifications they can check out, rather than generic placeholders.
- Hidden costs must be non-obvious (not "it costs money" — something they haven't thought of)
- Confidence scores should vary meaningfully (don't make them all 70-80)
- Narratives should feel like a story about THEIR life, not abstract projections

OUTPUT: Return ONLY valid JSON matching this exact schema:
{
  "assumptions": [
    {
      "assumption": "string — what they believe without realizing",
      "why_wrong": "string — specific reason this might not hold",
      "what_changes": "string — how the decision looks different without this assumption"
    }
  ],
  "scenarios": [
    {
      "option_name": "string",
      "narrative_30_days": "string",
      "narrative_60_days": "string",
      "narrative_90_days": "string",
      "confidence": 75,
      "confidence_reasoning": "string",
      "hidden_cost": "string",
      "biggest_risk": "string",
      "what_you_give_up": "string",
      "alignment_score": 80,
      "dimension_scores": {
        "financial": 70,
        "emotional": 60,
        "growth": 80,
        "stability": 90,
        "relationships": 50
      }
    }
  ],
  "uncertainty_disclosure": "string — what the AI cannot know"
}`;
}

/**
 * Builds the prompt for Prompt 2: Action Plan Generation
 */
export function buildActionPlanPrompt(
  intake: IntakeData,
  chosenPath: string,
  risk: string
): string {
  const constraintsList = intake.constraints.join(', ');

  return `The user has analyzed their decision and made a choice. Generate a concrete, actionable 7-day plan to begin executing their chosen path.

CHOSEN PATH: ${chosenPath}
USER SITUATION: ${intake.decision}
CONSTRAINTS: ${constraintsList}
TIMELINE: ${intake.timeline}
KEY RISK IDENTIFIED: ${risk}

INSTRUCTIONS:
Generate exactly 7 days of specific actions. Each action must be:
- Specific and concrete (not "research options" — instead "search LinkedIn for 3 people in [field] and send connection requests with this message: ...")
- Time-bound (morning / afternoon / evening suggestion)
- Ordered by urgency (deadline-sensitive items first)
- Flag any irreversible steps clearly

Day 1 should always be the most urgent/time-sensitive action.
Day 7 should be a reflection + adjustment checkpoint.

Include one "if this doesn't work" fallback plan at the end.

RULES:
- Each action must be a single concrete task a person could complete in under 2 hours.
- Every action MUST name a specific deliverable: an email sent, a call made, a document drafted, a form submitted, a profile updated. Never use "research", "consider", "explore", or "look into" as the verb.
- USE GOOGLE SEARCH: Search for the actual web portal link, specific application page, or program email address associated with the chosen option, and include these specific resources in the daily tasks.
- Actions must be achievable by one person in a normal day
- Don't assume resources the user hasn't mentioned having
- Flag steps that require spending money
- Flag steps that are hard to reverse

OUTPUT: Return ONLY valid JSON matching this exact schema:
{
  "chosen_path": "string — the option they selected",
  "plan": [
    {
      "day": 1,
      "action": "string — specific action to take",
      "why_first": "string — why this needs to happen today",
      "time_of_day": "morning | afternoon | evening",
      "reversible": true,
      "costs_money": false
    }
  ],
  "reflection_prompt": "string — question to ask yourself on day 7",
  "fallback": "string — if this path doesn't work, here's your backup plan"
}`;
}
