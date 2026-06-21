import { GoogleGenerativeAI, DynamicRetrievalMode } from '@google/generative-ai';
import { IntakeData, AnalysisResult, ActionPlanResult, DecisionJournalEntry, DecisionDNA, Assumption, DimensionScores, GroundingSource } from './types';
import { buildAnalysisPrompt, buildActionPlanPrompt } from './prompts';

const API_KEY = process.env.GEMINI_API_KEY || '';
const API_KEY_2 = process.env.GEMINI_API_KEY_2 || '';
const NVIDIA_KEY = process.env.NVIDIA_API_KEY || '';

// Initialize Gemini instances (primary + backup)
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;
const genAI2 = API_KEY_2 ? new GoogleGenerativeAI(API_KEY_2) : null;

/** Hard timeout wrapper — falls back if API hasn't responded in time */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`API timeout after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}

/**
 * NVIDIA Nemotron — calls through our API route to avoid CORS.
 */
async function callNemotron(prompt: string): Promise<string> {
  const response = await fetch('/api/nemotron', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  
  if (!response.ok) throw new Error(`Nemotron proxy error: ${response.status}`);
  
  const data = await response.json();
  return data.content || '';
}

/**
 * Main function to generate assumptions and scenario comparisons.
 * Now accepts optional journal history for cross-session intelligence.
 */
export async function analyzeDecision(
  intake: IntakeData,
  history?: DecisionJournalEntry[],
  dna?: DecisionDNA
): Promise<AnalysisResult> {
  if (!genAI && !genAI2 && !NVIDIA_KEY) {
    const mock = getMockAnalysis(intake, dna);
    mock.is_mock = true;
    return mock;
  }

  const prompt = buildAnalysisPrompt(intake, history, dna);

  // Key 2 first — fresh quota, Gemini 3.1 Flash Lite has 500 RPD
  if (genAI2) {
    try {
      const result = await tryGemini(genAI2, prompt, 'gemini-3.1-flash-lite');
      if (result) return result;
    } catch { /* try next */ }
    try {
      const result = await tryGemini(genAI2, prompt, 'gemini-2.5-flash');
      if (result) return result;
    } catch { /* try next */ }
    try {
      const result = await tryGemini(genAI2, prompt, 'gemini-3.5-flash');
      if (result) return result;
    } catch { /* try next */ }
  }

  // Key 1 as last Gemini resort
  if (genAI) {
    try {
      const result = await tryGemini(genAI, prompt, 'gemini-3.1-flash-lite');
      if (result) return result;
    } catch { /* try next */ }
    try {
      const result = await tryGemini(genAI, prompt, 'gemini-2.5-flash');
      if (result) return result;
    } catch { /* try next */ }
    try {
      const result = await tryGemini(genAI, prompt, 'gemini-3.5-flash');
      if (result) return result;
    } catch { /* try Nemotron */ }
  }

  // Nemotron via API route
  if (NVIDIA_KEY) {
    try {
      const result = await firstResolved([
        withTimeout(callNemotron(prompt), 12000)
          .then((text) => {
            if (!text) return null;
            return JSON.parse(sanitizeJsonString(text)) as AnalysisResult;
          })
          .catch(() => null)
      ]);
      if (result) return result;
    } catch { /* fall through */ }
  }

  // All failed — use high-quality mock
  const mock = getMockAnalysis(intake);
  mock.is_mock = true;
  return mock;
}

/** Returns the first promise that resolves to a non-null value, with a hard overall timeout */
async function firstResolved<T>(promises: Promise<T | null>[]): Promise<T | null> {
  return new Promise((resolve) => {
    let resolved = false;
    let remaining = promises.length;

    // Hard overall timeout — if nothing works in 6 seconds, give up
    const overallTimeout = setTimeout(() => {
      if (!resolved) { resolved = true; resolve(null); }
    }, 6000);

    promises.forEach((p) => {
      p.then((val) => {
        if (val && !resolved) {
          resolved = true;
          clearTimeout(overallTimeout);
          resolve(val);
        }
        remaining--;
        if (remaining === 0 && !resolved) { resolved = true; clearTimeout(overallTimeout); resolve(null); }
      }).catch(() => {
        remaining--;
        if (remaining === 0 && !resolved) { resolved = true; clearTimeout(overallTimeout); resolve(null); }
      });
    });
  });
}

/** Try a single Gemini instance with search grounding */
async function tryGemini(ai: GoogleGenerativeAI, prompt: string, preferredModel?: string): Promise<AnalysisResult | null> {
  // Priority order: best available model with highest quota
  const modelsToTry = preferredModel
    ? [preferredModel, 'gemini-3.1-flash-lite', 'gemini-2.5-flash', 'gemini-3.5-flash']
    : ['gemini-3.1-flash-lite', 'gemini-2.5-flash', 'gemini-3.5-flash'];
  
  for (const modelName of modelsToTry) {
    try {
      const model = ai.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
        tools: [
          {
            googleSearchRetrieval: {
              dynamicRetrievalConfig: {
                mode: DynamicRetrievalMode.MODE_DYNAMIC,
                dynamicThreshold: 0.3,
              },
            },
          },
        ],
      });

      const result = await withTimeout(model.generateContent(prompt), 8000);
      const response = await result.response;
      const text = response.text();
      if (!text) continue;

      const candidates = (response as any).candidates;
      const groundingMetadata = candidates?.[0]?.groundingMetadata;
      const webSearchQueries = groundingMetadata?.webSearchQueries || [];
      const groundingChunks = groundingMetadata?.groundingChunks || [];

      const agent_search_queries: string[] = [];
      if (Array.isArray(webSearchQueries)) agent_search_queries.push(...webSearchQueries);

      const agent_sources: Array<{ title: string; url: string }> = [];
      if (Array.isArray(groundingChunks)) {
        groundingChunks.forEach((chunk: any) => {
          const title = chunk.web?.title || chunk.web?.uri || 'Source';
          const url = chunk.web?.uri || '';
          if (url) agent_sources.push({ title, url });
        });
      }

      const cleanJson = sanitizeJsonString(text);
      const parsed = JSON.parse(cleanJson) as AnalysisResult;
      parsed.agent_search_queries = agent_search_queries;
      parsed.agent_sources = agent_sources;
      return parsed;
    } catch {
      continue;
    }
  }
  return null;
}

/**
 * Main function to generate a 7-day action plan for a chosen path.
 */
export async function generateActionPlan(
  intake: IntakeData,
  chosenPath: string,
  biggestRisk: string,
  behavioralInsights?: BehaviorInsight[]
): Promise<ActionPlanResult> {
  if (!genAI && !genAI2 && !NVIDIA_KEY) {
    const mock = getMockActionPlan(intake, chosenPath, biggestRisk, behavioralInsights);
    mock.is_mock = true;
    return mock;
  }

  const prompt = buildActionPlanPrompt(intake, chosenPath, biggestRisk, behavioralInsights);

  // Key 2 first — best quota
  if (genAI2) {
    try {
      const text = await tryGeminiSimple(genAI2, prompt);
      if (text) return JSON.parse(sanitizeJsonString(text)) as ActionPlanResult;
    } catch { /* try next */ }
  }

  // Key 1 backup
  if (genAI) {
    try {
      const text = await tryGeminiSimple(genAI, prompt);
      if (text) return JSON.parse(sanitizeJsonString(text)) as ActionPlanResult;
    } catch { /* try Nemotron */ }
  }

  if (NVIDIA_KEY) {
    try {
      const text = await withTimeout(callNemotron(prompt), 12000);
      if (text) return JSON.parse(sanitizeJsonString(text)) as ActionPlanResult;
    } catch { /* fall through */ }
  }

  const mock = getMockActionPlan(intake, chosenPath, biggestRisk, behavioralInsights);
  mock.is_mock = true;
  return mock;
}

/** Simple Gemini call without search grounding (for action plans) */
async function tryGeminiSimple(ai: GoogleGenerativeAI, prompt: string): Promise<string | null> {
  // 3.1-flash-lite: 500 RPD, 15 RPM — best quota on Key 2
  // 2.5-flash: 20 RPD, 5 RPM — Key 1 backup
  const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-2.5-flash', 'gemini-3.5-flash'];
  for (const modelName of modelsToTry) {
    try {
      const model = ai.getGenerativeModel({
        model: modelName,
        generationConfig: { responseMimeType: 'application/json', temperature: 0.7 },
      });
      const result = await withTimeout(model.generateContent(prompt), 8000);
      const text = result.response.text();
      if (text) return text;
    } catch { continue; }
  }
  return null;
}

/**
 * Helper to strip out markdown backticks or formatting if Gemini returns them.
 */
function sanitizeJsonString(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

import { BehaviorInsight } from './behaviorTracker';

function getMockAnalysis(intake: IntakeData, dna?: DecisionDNA): AnalysisResult {
  const result = getMockAnalysisInternal(intake);
  if (!dna || !result.assumptions) return result;

  const dnaAssumption = {
    assumption: `That you aren't repeating your signature pattern of "${dna.blind_spot || 'optimizing for certainty'}".`,
    why_wrong: `Your Second Brain history warns that you have a habit of choosing this path type, which may cause you to overlook critical trade-offs.`,
    what_changes: `You consciously adjust your simulation weights to verify if you are acting out of fear or genuine alignment.`,
    cognitive_bias: 'Habitual Anchoring'
  };

  const newAssumptions = [dnaAssumption, ...result.assumptions].slice(0, 3);
  return { ...result, assumptions: newAssumptions };
}

function getMockAnalysisInternal(intake: IntakeData): AnalysisResult {
  const decision = intake.decision || '';
  const options = intake.options.filter(o => o.trim());
  const fear = intake.fear || '';
  const timeline = intake.timeline || '';
  const values = intake.values || [];

  const short = (s: string, n: number) => s.length > n ? s.slice(0, n) + '...' : s;

  function pickAssumptions(): Assumption[] {
    const result: Assumption[] = [];

    // 1. Binary framing — always relevant
    if (options.length >= 2) {
      result.push({
        assumption: `That "${short(decision, 50)}" is a choice between two fixed outcomes with no room to adjust later.`,
        why_wrong: `Most major life decisions are not permanent forks in the road. You can sequence, pause, or redirect after gathering real experience on either path. The pressure to pick "the right one" overlooks the fact that both paths teach you something useful.`,
        what_changes: `Instead of choosing a final destination, you commit to a direction for a defined period — with permission to reassess.`,
        cognitive_bias: 'False Dilemma'
      });
    }

    // 2. Timeline / urgency
    if (timeline) {
      result.push({
        assumption: `That "${short(timeline, 55)}" is a hard deadline that cannot be negotiated or re-evaluated.`,
        why_wrong: `Deadlines create useful urgency, but they can also manufacture artificial pressure. Many timelines have more flexibility than they first appear — either through extension, partial commitment, or a trial period that buys you real data.`,
        what_changes: `You separate the true external deadline from the self-imposed one, and evaluate whether acting now versus acting with more information changes the risk profile.`,
        cognitive_bias: 'Planning Fallacy'
      });
    } else {
      result.push({
        assumption: `That delaying this decision will make it harder rather than clearer.`,
        why_wrong: `Time reveals information. Your preferences, external conditions, and the actual trade-offs of each path become sharper with lived experience. The discomfort of uncertainty is not the same as a bad outcome.`,
        what_changes: `You consider a structured trial period for one option instead of forcing a permanent choice today.`,
        cognitive_bias: 'Planning Fallacy'
      });
    }

    // 3. Fear-based / values tension
    if (fear) {
      result.push({
        assumption: `That "${short(fear, 55)}" is the most probable outcome rather than one possible outcome among several.`,
        why_wrong: `Your brain assigns higher probability to the scenario you fear most — it's a survival mechanism. But the actual likelihood of that specific worst case is usually lower than your emotional estimation, and you are better equipped to handle it than you think.`,
        what_changes: `You give equal weight to neutral and positive scenarios, not just the one keeping you up at night.`,
        cognitive_bias: 'Availability Heuristic'
      });
    } else if (values.length > 0) {
      const top = values[0];
      result.push({
        assumption: `That ranking "${top}" as your top priority means the other dimensions of this decision are significantly less important.`,
        why_wrong: `Abstract rankings shift under real pressure. What you value most in a calm moment may not be what you optimize for when you actually face the trade-off. The act of choosing reveals priorities that ranking alone cannot.`,
        what_changes: `You test whether your stated priority holds up when you simulate the actual sacrifice required by each path.`,
        cognitive_bias: 'Anchoring Bias'
      });
    } else {
      result.push({
        assumption: `That you already have enough information about what each path will actually feel like day to day.`,
        why_wrong: `Most decisions are harder in anticipation than in execution. The daily reality of a path — its boredom, its small wins, its people — is something you can only evaluate after you start walking it.`,
        what_changes: `You prioritize options that let you gather real experience quickly rather than ones that require maximum commitment upfront.`,
        cognitive_bias: 'Curse of Knowledge'
      });
    }

    return result.slice(0, 3);
  }

  function pickScores(opt: string): DimensionScores {
    const def = { financial: 60, emotional: 60, growth: 65, stability: 55, relationships: 55 };
    const l = opt.toLowerCase();
    if (l.includes('financial') || l.includes('salary') || l.includes('money') || l.includes('income') || l.includes('save') || l.includes('invest')) def.financial += 20;
    if (l.includes('growth') || l.includes('learn') || l.includes('advancement') || l.includes('career') || l.includes('skill') || l.includes('developer') || l.includes('engineer')) def.growth += 20;
    if (l.includes('stable') || l.includes('safe') || l.includes('secure') || l.includes('predict') || l.includes('stay') || l.includes('college')) def.stability += 15;
    if (l.includes('family') || l.includes('relationship') || l.includes('partner') || l.includes('community') || l.includes('friend') || l.includes('people')) def.relationships += 15;
    if (l.includes('stress') || l.includes('anxiety') || l.includes('health') || l.includes('wellbeing') || l.includes('emotion') || l.includes('peace')) def.emotional += 15;
    if (l.includes('move') || l.includes('relocate') || l.includes('risk') || l.includes('start') || l.includes('challenge') || l.includes('entrepreneur') || l.includes('startup')) {
      def.growth += 15;
      def.stability -= 15;
    }
    if (l.includes('drop') || l.includes('prepar')) {
      def.growth += 10;
      def.emotional -= 10;
    }
    Object.keys(def).forEach(k => { def[k as keyof DimensionScores] = Math.max(10, Math.min(100, def[k as keyof DimensionScores])); });
    return def;
  }

  type NarrativeVariant = {
    narrative_30_days: string;
    narrative_60_days: string;
    narrative_90_days: string;
    hidden_cost: string;
    biggest_risk: string;
    what_you_give_up: string;
    confidence_reasoning: string;
  };

  function makeNarrativeFromText(opt: string, allOpts: string[]): NarrativeVariant {
    const l = opt.toLowerCase().trim();
    const stripped = opt.replace(/^(Take a |Take the |Join |Choose |Opt for |Go with |Pursue a |Pursue the |Start a |Start the |Begin a |Begin the |Proceed with )/i, '').trim();
    const shortOpt = short(stripped, 40);
    const lcStripped = stripped.toLowerCase();

    const otherOpts = allOpts.filter(o => o !== opt);
    const otherNames = otherOpts.map(o => {
      const s = o.replace(/^(Take a |Take the |Join |Choose |Opt for |Go with |Pursue a |Pursue the |Start a |Start the |Begin a |Begin the |Proceed with )/i, '').trim();
      return `"${short(s, 30)}"`;
    });
    const otherRef = otherNames.length > 0 ? otherNames.join(' or ') : 'alternative paths';

    const isStarting = /^(start|launch|begin|take|join|enroll|pursue|adopt|buy|switch|create|build|proceed|undo)/.test(l);
    const isMoving = /^(move|relocate|transfer|migrate)/.test(l);
    const isQuitting = /^(quit|leave|resign|break|drop|abandon|end)/.test(l) || l.includes('break up') || l.includes('breakup');
    const isStaying = /^(stay|keep|remain|continue|maintain|wait|hold)/.test(l);
    const isExploring = /\btry\b/.test(l) || /\btest\b/.test(l) || /\btrial\b/.test(l) || /\bfoster\b/.test(l) || /\bexplore\b/.test(l) || /\bexperiment\b/.test(l) || /\bconsult\b/.test(l) || l.includes('second opinion') || /\bget a\b/.test(l);
    const isMixed = isStarting && (l.includes('while') || l.includes('alongside') || l.includes('keep') || l.includes('current') || l.includes('existing') || (l.includes('side') && l.includes('business')));

    let narrative_30_days: string;
    if (isStaying) {
      narrative_30_days = `Choosing to "${shortOpt}" means your day-to-day life stays familiar. The first month brings the comfort of known routines and established patterns — no learning curve, no uncertainty about what to expect each morning. But the absence of change also means the urgency to pursue something different quietly dissolves. The real question is whether this is a deliberate choice or simply the path of least resistance.`;
    } else if (isQuitting) {
      narrative_30_days = `By deciding to "${shortOpt}", you make an intentional break from your current situation. The first month involves untangling commitments, adjusting to the absence of what you left behind, and beginning to rebuild. The relief of finally deciding is real, but the uncertainty of what comes next creates a restless energy that you must channel constructively rather than letting it become anxiety.`;
    } else if (isExploring) {
      narrative_30_days = `Choosing to "${shortOpt}" means gathering more information before committing. The first 30 days involve research, consultations, and testing your assumptions against reality. This measured approach reduces the risk of a wrong decision, but the extended uncertainty can be draining — you are investing time in evaluation rather than execution, and it is not always clear when you have enough information to act decisively.`;
    } else if (isMixed) {
      narrative_30_days = `Opting to "${shortOpt}" means balancing two commitments at once. The first month requires careful time management as you juggle your existing responsibilities with the demands of this new direction. Initial enthusiasm is high, but the cognitive load of switching between two tracks is immediately apparent — progress in both areas is slower than you would like, testing your patience and organizational skills.`;
    } else if (isMoving) {
      narrative_30_days = `The decision to "${shortOpt}" sets a major life change in motion. The first month is a blur of logistics — coordinating the transition, learning a new environment, and rebuilding daily routines from scratch. Excitement and exhaustion mix as everything requires more effort than expected, testing your resilience and adaptability early.`;
    } else {
      narrative_30_days = `Committing to "${shortOpt}" means stepping onto a new path. The first 30 days are intensive — you are learning unfamiliar systems, building new habits, and navigating the gap between your expectations and reality. Early momentum creates optimism, but the real test comes when the novelty fades and the daily work of sustaining this direction begins.`;
    }

    let narrative_60_days: string;
    if (isStaying) {
      narrative_60_days = `By day 60, the relief of avoiding disruption has settled into routine. You either find ways to make your current situation feel like a deliberate choice, or the dissatisfaction that prompted this decision begins to resurface. The familiarity that once felt comfortable can quietly become confining.`;
    } else if (isQuitting) {
      narrative_60_days = `Two months in, the initial adrenaline of your decision has faded. The reality of your new situation sets in — some aspects are better than expected, others are harder than anticipated. You start to see whether the problems you left were situational or internal, and whether you are building toward something better or simply recovering from what you left behind.`;
    } else if (isExploring) {
      narrative_60_days = `By now you have gathered enough information to form a clearer picture. Some initial assumptions have been confirmed, others disproven. The question shifts from "what are my options?" to "which option do I commit to?" — and the pressure to make a decision starts building as the evaluation phase naturally reaches its limit.`;
    } else if (isMixed) {
      narrative_60_days = `By day 60, one priority has likely started dominating the other. Most people naturally drift toward whichever track has more immediate deadlines or greater urgency. The risk of doing both things at a mediocre level rather than one thing well becomes increasingly real, forcing you to confront whether to maintain the balance or commit to a single direction.`;
    } else if (isMoving) {
      narrative_60_days = `Routine starts forming in your new environment. You find reliable spots, make initial connections, and learn the daily rhythms of your new location. Homesickness peaks around now, and the financial and social costs of the move become fully apparent. The new place either starts to feel like home or reveals the deeper challenges of starting over.`;
    } else {
      narrative_60_days = `By day 60, the initial excitement has settled and the real texture of this path emerges. You have faced your first real challenges and either adapted or struggled. The routine becomes established, and you begin to see whether this direction aligns with your deeper priorities. Doubts surface alongside progress, testing your commitment and forcing honest self-assessment.`;
    }

    let narrative_90_days: string;
    if (isStaying) {
      narrative_90_days = `Three months in, the weight of your decision is clear. If you have actively reinvested in your current situation, it can feel renewed and purposeful. If you have been coasting, the resentment builds and the "what if" grows louder with each passing week. Staying requires deliberate engagement to avoid drifting into passive regret.`;
    } else if (isQuitting) {
      narrative_90_days = `At the three-month mark, you have enough experience to evaluate honestly. The decision has either opened new opportunities or revealed that some of the old problems have followed you. The key question shifts from "was this the right choice?" to "what am I building now that I am here?" — a forward-looking orientation replaces the backward-looking one.`;
    } else if (isExploring) {
      narrative_90_days = `You now have enough data to make a confident decision — or you are stuck in analysis paralysis. The risk of over-consulting is real: beyond a certain point, more information does not reduce uncertainty, it just delays action. The hardest question is whether you are being thorough or unconsciously avoiding commitment.`;
    } else if (isMixed) {
      narrative_90_days = `Three months in, the sustainability of split focus is tested. Unless you have exceptional discipline, one path suffers more than the other. The question is whether you are genuinely okay with the trade-off — making progress in both areas but excellence in neither — or whether it is time to commit fully to one direction and accept the loss of the other.`;
    } else if (isMoving) {
      narrative_90_days = `You have either built a support system in your new location or struggled to form meaningful connections. The environment either energizes you or reveals that geography alone does not change your core patterns. The question becomes whether the opportunity was worth the dislocation, and whether you want to deepen roots or plan your return.`;
    } else {
      narrative_90_days = `Three months in, you have enough experience to evaluate honestly. This path has either met your expectations or revealed hidden costs you did not anticipate. The question shifts from "was this the right choice?" to "how do I make the most of where I am?" — or whether it is time to adjust course with the benefit of real experience.`;
    }

    let hidden_cost: string;
    if (isStaying) {
      hidden_cost = `The quiet erosion of ambition when comfort replaces challenge. The opportunities you pass up by not acting compound over time, and the gap between your potential and your current reality widens silently with each month that passes.`;
    } else if (isQuitting) {
      hidden_cost = `The loss of momentum, relationships, and institutional knowledge from your previous situation. Even positive departures carry a cost — burned bridges, lost seniority, and the time it takes to rebuild your standing from zero in a new context.`;
    } else if (isExploring) {
      hidden_cost = `The time and mental energy spent in evaluation rather than action. While you research and deliberate, the window for pursuing alternative paths may narrow, and options that required immediate commitment may close permanently.`;
    } else if (isMixed) {
      hidden_cost = `The difficulty of excelling in any single area when your attention is divided. The stress of constant context-switching can lead to burnout, and the feeling of being perpetually behind in both domains erodes satisfaction in each.`;
    } else if (isMoving) {
      hidden_cost = `The hidden financial and emotional costs of relocation — deposits, setup expenses, visa or legal fees — plus the significant premium of rebuilding a social network from zero. Monthly expenses in a new location often exceed initial projections by 20-30%.`;
    } else {
      hidden_cost = `The opportunity cost of time, energy, and resources committed here versus what you could have pursued instead. Every chosen path means doors not opened on the alternatives, and some of those doors may close for good.`;
    }

    let biggest_risk: string;
    if (isStaying) {
      biggest_risk = `Waking up a year from now in exactly the same position, having neither grown nor moved closer to what you actually want, while the regret of inaction compounds silently with each passing month.`;
    } else if (isQuitting) {
      biggest_risk = `Discovering that the problems you hoped to escape were internal rather than situational, leaving you with the same frustrations but fewer options, less stability, and a longer road back to where you started.`;
    } else if (isExploring) {
      biggest_risk = `Delaying commitment to the point where options narrow or external conditions change unfavorably, turning what was a manageable decision window into a forced choice under pressure with fewer good options available.`;
    } else if (isMixed) {
      biggest_risk = `Spending months stretched across two domains without making meaningful progress in either, ending up further behind than if you had committed fully to one path and accepted the trade-off.`;
    } else if (isMoving) {
      biggest_risk = `Persistent isolation if you struggle to form meaningful connections in the new environment, leading to burnout, depression, and an expensive or humbling return to where you started.`;
    } else {
      biggest_risk = `Investing significant time, energy, and financial resources into a path that ultimately does not fit, only to realize it when you have passed the point of easy return.`;
    }

    let what_you_give_up: string;
    if (otherNames.length > 0) {
      what_you_give_up = `The alternative of choosing ${otherRef}. Each of those paths comes with different experiences, growth opportunities, and trade-offs that you will not get to explore on this one.`;
    } else {
      what_you_give_up = `The experiences, growth, and serendipity that come from choosing a different direction. This path closes doors that every alternative path would have opened.`;
    }

    let confidence_reasoning: string;
    if (isStaying) {
      confidence_reasoning = `Staying has near-zero execution risk — you know exactly what this path looks like day to day. The real uncertainty is whether you will regret not having taken a chance when the opportunity was available and your circumstances allowed it.`;
    } else if (isExploring) {
      confidence_reasoning = `Gathering more information generally improves decision quality, but beyond a point it creates diminishing returns. The hardest part is knowing when you have gathered enough to act decisively versus using research as a form of avoidance.`;
    } else {
      confidence_reasoning = `Confidence is moderate because the daily reality of a new path can only be evaluated after you start walking it. Initial assumptions rarely survive full contact with real life, and adaptability matters more than the precision of your original plan.`;
    }

    return {
      narrative_30_days,
      narrative_60_days,
      narrative_90_days,
      hidden_cost,
      biggest_risk,
      what_you_give_up,
      confidence_reasoning,
    };
  }

  function pickQueries(): string[] {
    const keyTerms = [
      decision.split(/\s+/).slice(0, 3).join(' '),
      ...options.map(o => o.split(/\s+/).slice(0, 3).join(' ')),
    ].filter(Boolean);
    const queries: string[] = [];
    if (keyTerms.length > 0) queries.push(`${keyTerms[0]} comparison pros cons`);
    if (keyTerms.length > 1) queries.push(`${keyTerms[1]} risk analysis`);
    queries.push('how to make a tough life decision framework');
    return queries.slice(0, 3);
  }

  function pickSources(): GroundingSource[] {
    return [
      { title: "Farnam Street — Mental Models for Decision Making", url: "https://fs.blog/mental-models/" },
      { title: "Harvard Business Review — How to Make a Tough Choice", url: "https://hbr.org/" }
    ];
  }

  return {
    agent_search_queries: pickQueries(),
    agent_sources: pickSources(),
    assumptions: pickAssumptions(),
    scenarios: options.map((option, idx) => {
      const scores = pickScores(option);
      const narrative = makeNarrativeFromText(option, options);
      const conf = Math.max(35, Math.min(85, 55 + (scores.stability - 50) * 0.5));
      return {
        option_name: option,
        narrative_30_days: narrative.narrative_30_days,
        narrative_60_days: narrative.narrative_60_days,
        narrative_90_days: narrative.narrative_90_days,
        confidence: Math.round(conf),
        confidence_reasoning: narrative.confidence_reasoning,
        hidden_cost: narrative.hidden_cost,
        biggest_risk: narrative.biggest_risk,
        what_you_give_up: narrative.what_you_give_up,
        alignment_score: Math.round(55 + (scores.growth + scores.stability) / 10),
        dimension_scores: scores,
      };
    }),
    uncertainty_disclosure: `We cannot predict your personal discipline over time, unexpected life events, shifts in your priorities once you experience the actual path, or external factors beyond your control. These projections assume consistent effort and stable conditions — real life rarely cooperates with either.`
  };
}

/**
 * === MOCK ACTION PLAN GENERATOR ===
 * Generates an actionable 7-day plan on the fly.
 */
function getMockActionPlan(
  intake: IntakeData,
  chosenPath: string,
  biggestRisk: string,
  behavioralInsights?: BehaviorInsight[]
): ActionPlanResult {
  const basePlan = [
    {
      day: 1,
      action: `Audit your immediate obligations and clear 2 hours on your calendar. Create a 'Decision Log' documenting why you chose "${chosenPath}" to refer back to when doubt creeps in.`,
      why_first: `Day 1 requires building psychological momentum and capturing your clarity before daily distractions interfere.`,
      time_of_day: 'morning' as const,
      reversible: true,
      costs_money: false
    },
    {
      day: 2,
      action: `Reach out to 2 people in your network who have walked a similar path or work in a related field. Ask them: 'What was the biggest mistake you made in your first 3 months?'`,
      why_first: `Learning from others' mistakes is the fastest way to mitigate the risk of: "${biggestRisk}".`,
      time_of_day: 'afternoon' as const,
      reversible: true,
      costs_money: false
    },
    {
      day: 3,
      action: `List all necessary tools, software, or subscriptions required for this path. If any require payment, review if there are free tiers first.`,
      why_first: `Helps you manage constraints and prevents impulsive spending.`,
      time_of_day: 'evening' as const,
      reversible: true,
      costs_money: false
    },
    {
      day: 4,
      action: `Take the first irreversible step (e.g. notify the other party of deferral/rejection, draft a formal acceptance letter, or schedule a key meeting).`,
      why_first: `Bridges the gap between thinking and acting. Commit to the decision.`,
      time_of_day: 'morning' as const,
      reversible: false,
      costs_money: false
    },
    {
      day: 5,
      action: `Set up a clean digital workspace (Trello, Notion, or physical notebook) dedicated solely to tracking this transition. Outline your weekly goals for the next month.`,
      why_first: `Provides structure to your daily routines now that you are committed.`,
      time_of_day: 'afternoon' as const,
      reversible: true,
      costs_money: false
    },
    {
      day: 6,
      action: `Address your biggest fear: "${intake.fear}". Spend 1 hour writing down a worst-case scenario plan ('fear-setting') detailing what you will do if that fear becomes reality.`,
      why_first: `Demystifying your fear prevents self-sabotage and subconscious avoidance.`,
      time_of_day: 'evening' as const,
      reversible: true,
      costs_money: false
    },
    {
      day: 7,
      action: `Review your progress. Compare your experience this week against your 30-day narrative. Adjust your tasks for the upcoming week based on what you learned.`,
      why_first: `Day 7 is the reflection checkpoint to ensure your actions remain aligned with your core values.`,
      time_of_day: 'afternoon' as const,
      reversible: true,
      costs_money: false
    }
  ];

  // Dynamically tailor plan based on user behaviors
  if (behavioralInsights && behavioralInsights.length > 0) {
    behavioralInsights.forEach((insight) => {
      if (insight.title.includes('Hidden Tension')) {
        basePlan[6] = {
          day: 7,
          action: `Reflect on the Hidden Tension: your stated top value was "${intake.values[0]}" but your interactive behavior heavily prioritized other trade-offs. Write down why this gap exists.`,
          why_first: `Surfacing stated vs. revealed value differences prevents buyers remorse or early path abandonment.`,
          time_of_day: 'evening' as const,
          reversible: true,
          costs_money: false
        };
      }
      if (insight.title.includes('Financial Tradeoffs')) {
        basePlan[2] = {
          day: 3,
          action: `Mitigate Financial Anxiety: Map out a strict 90-day survival budget based on the Runway Sprout Simulator parameters and lock down $${(intake.savings || 1000).toLocaleString()} as emergency cash.`,
          why_first: `Proactively securing a liquid cash cushion dampens career stress and supports a clear headspace.`,
          time_of_day: 'afternoon' as const,
          reversible: true,
          costs_money: false
        };
      }
      if (insight.title.includes('Active Scenario Auditing')) {
        basePlan[4] = {
          day: 5,
          action: `Review Constraint Workarounds: You spent significant effort stress-testing your limits. Identify the single constraint you toggled off that had the most positive score impact, and draft a plan to bypass it.`,
          why_first: `Harnessing the creative workarounds discovered during the simulation converts hypothetical hope into execution power.`,
          time_of_day: 'morning' as const,
          reversible: true,
          costs_money: false
        };
      }
    });
  }

  return {
    chosen_path: chosenPath,
    plan: basePlan,
    reflection_prompt: behavioralInsights && behavioralInsights.length > 0
      ? `Looking back at your behavior during simulations, does this plan feel like it resolves the internal tension between what you wanted and what you actually optimized for?`
      : `Looking at your actions this week, did you act out of excitement for the path ahead, or out of fear of what you left behind?`,
    fallback: `If this path becomes unviable, pivot to your backup plan: Maintain active contact with your alternative options, update your resume and skills weekly, and budget for a 3-month transition window.`
  };
}
