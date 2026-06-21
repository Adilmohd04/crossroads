import { GoogleGenerativeAI, DynamicRetrievalMode } from '@google/generative-ai';
import { IntakeData, AnalysisResult, ActionPlanResult, DecisionJournalEntry, DecisionDNA } from './types';
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
  const decisionLower = intake.decision.toLowerCase();
  const optionsLower = intake.options.map(o => o.toLowerCase()).join(' ');
  const combined = decisionLower + ' ' + optionsLower;

  const isJobVsGrad =
    (combined.includes('job') || combined.includes('offer') || combined.includes('employ')) &&
    (combined.includes('grad') || combined.includes('school') || combined.includes('master') || combined.includes('mba'));

  const isRelocation =
    combined.includes('move') ||
    combined.includes('relocate') ||
    combined.includes('city') ||
    combined.includes('cities');

  const isRelationship =
    intake.category === 'relationship' ||
    combined.includes('relationship') ||
    combined.includes('partner') ||
    combined.includes('breakup') ||
    combined.includes('marry') ||
    combined.includes('marriage') ||
    combined.includes('dating') ||
    combined.includes('stay vs leave') ||
    combined.includes('long distance') ||
    combined.includes('distance');

  const isFinancial =
    intake.category === 'financial' ||
    combined.includes('invest') ||
    combined.includes('save') ||
    combined.includes('buy') ||
    combined.includes('house') ||
    combined.includes('mortgage') ||
    combined.includes('debt') ||
    combined.includes('stock') ||
    combined.includes('crypto') ||
    combined.includes('budget');

  const isEducation =
    intake.category === 'education' ||
    combined.includes('bootcamp') ||
    combined.includes('boot camp') ||
    combined.includes('degree') ||
    combined.includes('self-taught') ||
    combined.includes('self taught') ||
    combined.includes('certification') ||
    combined.includes('online course') ||
    (combined.includes('school') && !isJobVsGrad);

  // Pre-canned high-quality response for Job vs. Grad School
  if (isJobVsGrad && intake.options.length >= 2) {
    const optJob = intake.options[0] || 'Take the software engineering job';
    const optGrad = intake.options[1] || 'Do a Master\'s in AI';
    const optStartup = intake.options[2] || 'Start an AI startup';

    return {
      agent_search_queries: [
        "Georgia Tech OMSCS tuition cost 2026",
        "average developer salary startup series B",
        "MBA vs Software Engineer opportunity cost calculator"
      ],
      agent_sources: [
        { title: "Georgia Tech OMSCS Tuition & Fees", url: "https://omscs.gatech.edu/omscs-tuition-free-fees" },
        { title: "Y Combinator Work at a Startup salaries", url: "https://www.workatastartup.com/" },
        { title: "Numbeo Cost of Living Index", url: "https://www.numbeo.com/" }
      ],
      assumptions: [
        {
          assumption: 'That grad school guarantees a higher starting salary and a more prestigious career path.',
          why_wrong: 'In tech, experience and building projects often compound faster than academic credentials. For some specializations like AI research, an MS helps, but it is not a blanket guarantee.',
          what_changes: 'You might place more weight on immediate compensation and hands-on professional growth over credentials.',
          cognitive_bias: 'Anchoring Bias'
        },
        {
          assumption: 'That the job offer will wait for you or remain active if you defer or delay deciding.',
          why_wrong: 'Mid-sized companies and startups operate on immediate resource requirements. Delaying beyond 10-14 days often leads to the offer being rescinded.',
          what_changes: 'The urgency of securing employment becomes a harder constraint than academic timelines.',
          cognitive_bias: 'Planning Fallacy'
        },
        {
          assumption: 'That you will have the same energy and risk tolerance for a startup or relocation 2 years from now.',
          why_wrong: 'Life conditions changes quickly. Debt, lease commitments, and changing relationship dynamics frequently lock people into stable paths as they get older.',
          what_changes: 'You realize that some paths (like a high-risk startup) are easier to test right now than later.',
          cognitive_bias: 'Status Quo Bias'
        }
      ],
      scenarios: [
        {
          option_name: optJob,
          narrative_30_days: 'You complete onboarding, meet your team, and begin writing code. You adapt to a structured 9-to-5 workday and establish a steady routine.',
          narrative_60_days: 'You ship your first minor feature. The regular bi-weekly paycheck starts accumulating in your savings, relieving immediate financial anxiety.',
          narrative_90_days: 'You feel integrated into the engineering lifecycle. You begin learning corporate dynamics, though you sometimes wonder if you are missing out on cutting-edge research.',
          confidence: 85,
          confidence_reasoning: 'The company is established, stable, and has extended a formal offer, reducing execution variables.',
          hidden_cost: 'Lost momentum in deep specialized research and academic networks.',
          biggest_risk: 'Becoming pigeonholed in legacy codebases and slow career progression.',
          what_you_give_up: 'Two years of dedicated intellectual focus and academic credentials.',
          alignment_score: 90,
          dimension_scores: {
            financial: 90,
            emotional: 75,
            growth: 70,
            stability: 85,
            relationships: 80
          }
        },
        {
          option_name: optGrad,
          narrative_30_days: 'You relocate to campus, attend graduate orientations, and buy textbooks. The workload is intense from week one.',
          narrative_60_days: 'You are submerged in problem sets, reading papers, and coding up academic algorithms. Your bank account shrinks as tuition bills hit.',
          narrative_90_days: 'You are working with peers on research projects. You feel intellectually challenged but stressed about internships and student loan accumulation.',
          confidence: 70,
          confidence_reasoning: 'Academic systems are highly structured, but relocation and funding loans introduce stress elements.',
          hidden_cost: 'Opportunity cost of $150K+ in lost wages, in addition to tuition interest.',
          biggest_risk: 'Graduating into an uncertain job market with significantly higher debt.',
          what_you_give_up: 'Financial comfort, immediate stability, and living in the same city as your current network.',
          alignment_score: 75,
          dimension_scores: {
            financial: 30,
            emotional: 60,
            growth: 95,
            stability: 70,
            relationships: 50
          }
        },
        ...(intake.options.length > 2 ? [{
          option_name: optStartup,
          narrative_30_days: 'You spend 12 hours a day building prototypes, purchasing domain names, and writing pitch decks. Energy is high but chaos is standard.',
          narrative_60_days: 'You pitch to angel investors and receive polite rejections. Savings are dropping, and the product is buggy.',
          narrative_90_days: 'You have a minimal viable product and 50 signups. The threat of running out of money looms, forcing you to consider freelance work to survive.',
          confidence: 35,
          confidence_reasoning: 'Startups have a 90% failure rate; launching without capital introduces extreme execution risks.',
          hidden_cost: 'Strained personal relationships due to long working hours and chronic financial stress.',
          biggest_risk: 'Burning through your entire $15k savings in 4 months with no working prototype.',
          what_you_give_up: 'A stable income, health insurance benefits, and regular working hours.',
          alignment_score: 80,
          dimension_scores: {
            financial: 40,
            emotional: 50,
            growth: 90,
            stability: 20,
            relationships: 40
          }
        }] : [])
      ],
      uncertainty_disclosure: 'We cannot predict the macroeconomic environment (e.g. tech hiring freezes) or personal factors like your endurance under high-stress conditions. These scores assume standard efforts and market conditions.'
    };
  }

  // Pre-canned high-quality response for Education path
  if (isEducation && intake.options.length >= 2) {
    // Dynamically match narratives to options based on their content
    const scenarios = intake.options.filter(o => o.trim()).map((option) => {
      const optLower = option.toLowerCase();
      
      if (optLower.includes('bootcamp') || optLower.includes('academy') || optLower.includes('intensive')) {
        return {
          option_name: option,
          narrative_30_days: 'You begin the intensive program. Days are 10-12 hours of coding. The cohort keeps you accountable and the pace is demanding.',
          narrative_60_days: 'You complete your first major projects. Your GitHub fills up. Career coaching sessions begin and you start preparing for interviews.',
          narrative_90_days: 'Program wraps up. Your portfolio has 3-4 deployed projects. Job applications are going out. The skills are real but the job market is competitive.',
          confidence: 68,
          confidence_reasoning: 'Bootcamps have strong placement rates when you put in the work, but employer brand recognition varies.',
          hidden_cost: 'The tuition ($15-20K) plus 3 months of zero income while your savings drain.',
          biggest_risk: 'Graduating into a saturated junior market where bootcamp graduates compete with CS degree holders.',
          what_you_give_up: 'Immediate income and the option to learn at your own pace.',
          alignment_score: 78,
          dimension_scores: { financial: 35, emotional: 70, growth: 88, stability: 40, relationships: 60 },
        };
      } else if (optLower.includes('startup') || optLower.includes('job') || optLower.includes('offer') || optLower.includes('accept') || optLower.includes('remote')) {
        return {
          option_name: option,
          narrative_30_days: 'You onboard at the startup, meet the team, and start shipping code in your first week. The pace is fast and you learn by doing.',
          narrative_60_days: 'You own a small feature area. The paycheck stabilizes your finances. You learn production systems but wonder if you are building the right skills.',
          narrative_90_days: 'You are fully contributing. Your resume now shows real company experience. But the startup code quality is mixed and mentorship is limited.',
          confidence: 80,
          confidence_reasoning: 'A real offer with a start date is the lowest-risk path — the job exists and they want you.',
          hidden_cost: 'Potential skill stagnation if the startup has no senior engineers to learn from.',
          biggest_risk: 'Getting stuck doing maintenance work with no one to push your technical growth.',
          what_you_give_up: 'Structured learning, peer cohort, and dedicated time for deep skill development.',
          alignment_score: 82,
          dimension_scores: { financial: 85, emotional: 65, growth: 60, stability: 80, relationships: 70 },
        };
      } else {
        // Self-taught / portfolio / independent path
        return {
          option_name: option,
          narrative_30_days: 'You set up your learning plan, pick a project idea, and start building. The freedom feels good but no one is checking on your progress.',
          narrative_60_days: 'You have one project partially built. Motivation dips on hard days. Without deadlines, you sometimes skip coding sessions.',
          narrative_90_days: 'You have 1-2 portfolio pieces but inconsistent depth. You realize you need external accountability to stay on track.',
          confidence: 42,
          confidence_reasoning: 'Self-directed learning has the highest dropout rate. Without structure, sustained progress is the exception.',
          hidden_cost: 'The invisible cost of lost time when you go down wrong tutorials and have no mentor to redirect you.',
          biggest_risk: 'Spending 6 months "learning" without producing anything employers would hire you for.',
          what_you_give_up: 'Structured accountability, peer pressure, and a credential/brand signal.',
          alignment_score: 55,
          dimension_scores: { financial: 80, emotional: 50, growth: 55, stability: 30, relationships: 50 },
        };
      }
    });

    return {
      agent_search_queries: [
        "App Academy job placement rate 2026",
        "remote startup junior developer salary range",
        "self-taught developer portfolio examples that get hired"
      ],
      agent_sources: [
        { title: "App Academy Career Outcomes Report", url: "https://www.appacademy.io/outcomes" },
        { title: "We Work Remotely — Junior Dev Jobs", url: "https://weworkremotely.com/" },
        { title: "The Odin Project — Free Full Stack Curriculum", url: "https://www.theodinproject.com/" }
      ],
      assumptions: [
        {
          assumption: 'That a formal credential (bootcamp or degree) is required to get hired as a developer.',
          why_wrong: 'Many companies hire based on portfolio and demonstrated skills. A strong GitHub with deployed projects can outweigh credentials — especially at startups.',
          what_changes: 'The self-taught path becomes more viable if you commit to building publicly visible projects.',
          cognitive_bias: 'Authority Bias'
        },
        {
          assumption: 'That accepting the job now means giving up learning forever.',
          why_wrong: 'Most developers learn primarily ON the job. The startup would teach you production skills no bootcamp covers. Learning and earning aren\'t mutually exclusive.',
          what_changes: 'The startup offer becomes a "paid learning opportunity" rather than a "sacrifice of education."',
          cognitive_bias: 'False Dilemma'
        },
        {
          assumption: 'That you need to decide your entire career path right now.',
          why_wrong: 'You can do the startup for 1 year, save money, then do a bootcamp or degree later with financial cushion. Sequencing exists.',
          what_changes: 'Instead of "which path is THE path," you think "what\'s the best FIRST step that keeps doors open?"',
          cognitive_bias: 'Permanence Illusion'
        }
      ],
      scenarios,
      uncertainty_disclosure: 'We cannot predict the specific startup\'s stability, the bootcamp\'s current hiring network strength, or your personal discipline levels for self-teaching. These projections assume standard effort and current market conditions.'
    };
  }

  // Pre-canned high-quality response for Relocation
  if (isRelocation && intake.options.length >= 2) {
    const optMove = intake.options[0] || 'Move to the new city';
    const optStay = intake.options[1] || 'Stay in your current city';

    return {
      agent_search_queries: [
        "rent comparison Numbeo Austin vs New York City",
        "Nomad List city index ratings Austin Texas",
        "cost of relocating moving estimator index"
      ],
      agent_sources: [
        { title: "Numbeo Cost of Living and Rent Index", url: "https://www.numbeo.com/cost-of-living/" },
        { title: "Nomad List Austin Scorecard & Safety Info", url: "https://nomadlist.com/" }
      ],
      assumptions: [
        {
          assumption: 'That moving to a new city automatically resolves feelings of stagnation or routine.',
          why_wrong: 'Internal habits and social routines travel with you. If you struggle to network locally, a new city will amplify that isolation initially.',
          what_changes: 'You begin viewing moving as an accelerator for change, rather than a magical cure.',
          cognitive_bias: 'Geographic Cure Fallacy'
        },
        {
          assumption: 'That staying in your current city prevents your career from growing.',
          why_wrong: 'With remote work and local tech meetups, career growth is highly dependent on self-education and proactive outreach, not just geographical coordinates.',
          what_changes: 'You look at how you can shake up your current environment if you choose to stay.',
          cognitive_bias: 'Availability Heuristic'
        },
        {
          assumption: 'That long-distance relationships or friendships will remain unchanged with remote communication.',
          why_wrong: 'Out of sight often leads to a natural drift in conversational frequency, requiring significant deliberate effort to maintain bonds.',
          what_changes: 'You price in the emotional work required to preserve your current support systems.',
          cognitive_bias: 'Optimism Bias'
        }
      ],
      scenarios: [
        {
          option_name: optMove,
          narrative_30_days: 'You unpack boxes in a new apartment, learn local transit, and feel a mixture of excitement and deep isolation during weekends.',
          narrative_60_days: 'You start finding favorite coffee shops and attend local meetups. You feel a sense of independence but miss familiar faces.',
          narrative_90_days: 'You have a small local circle and feel proud of navigating the transition. The city begins to feel like home, though your budget is tighter.',
          confidence: 65,
          confidence_reasoning: 'Relocation success depends heavily on active networking and managing high moving expenses.',
          hidden_cost: 'The financial drag of setup costs, security deposits, and higher cost of living.',
          biggest_risk: 'Severe isolation leading to burnout in your new job.',
          what_you_give_up: 'Daily proximity to your family, current partner, or long-term friends.',
          alignment_score: 85,
          dimension_scores: {
            financial: 60,
            emotional: 70,
            growth: 85,
            stability: 50,
            relationships: 40
          }
        },
        {
          option_name: optStay,
          narrative_30_days: 'You renew your current lease or stay put. Life is comfortable and predictable. You spend time with your regular friend group.',
          narrative_60_days: 'You feel a slight pang of FOMO when seeing others move, but enjoy your stable routines and cheap living costs.',
          narrative_90_days: 'You have saved money, but feel a lingering sense of "what if." You realize you must proactively seek new local projects to avoid stagnation.',
          confidence: 90,
          confidence_reasoning: 'Familiarity reduces uncertainty to near zero, though stagnation remains a possibility.',
          hidden_cost: 'The opportunity cost of not expanding your worldview and personal independence.',
          biggest_risk: 'Settling into a comfortable routine that delays your personal growth.',
          what_you_give_up: 'The adventure, new opportunities, and career clusters of a major tech hub.',
          alignment_score: 70,
          dimension_scores: {
            financial: 85,
            emotional: 80,
            growth: 50,
            stability: 90,
            relationships: 85
          }
        }
      ],
      uncertainty_disclosure: 'We cannot predict how easily you will form a new social network or if the cost of housing in the new city will surge unexpectedly.'
    };
  }

  // Pre-canned high-quality response for Relationship
  if (isRelationship && intake.options.length >= 2) {
    const optRel = intake.options[0] || 'Prioritize relationship';
    const optInd = intake.options[1] || 'Prioritize individual path';

    return {
      agent_search_queries: [
        "long distance relationship success rates statistics",
        "couples relocation adjustment studies family science",
        "cohabitation transition timeline recommendations"
      ],
      agent_sources: [
        { title: "Gottman Institute — Long Distance Relationships", url: "https://www.gottman.com/blog/key-to-long-distance-relationships/" },
        { title: "Psychology Today — Couples Moving and Strains", url: "https://www.psychologytoday.com/" }
      ],
      assumptions: [
        {
          assumption: 'That the relationship can survive indefinite long-distance without a concrete timeline for closing the gap.',
          why_wrong: 'Relational science shows that long-distance works best when there is a shared, visible horizon for when the separation will end. Without an agreed end-date, emotional erosion eventually takes a toll.',
          what_changes: 'You focus on sequencing the decision—defining a timeline for reunification rather than treating long-distance as a permanent state.',
          cognitive_bias: 'Optimism Bias'
        },
        {
          assumption: 'That relocating or compromising for your partner means giving up your career ambition entirely.',
          why_wrong: 'Compromising on geography does not mean stagnant career growth. It forces you to explore hybrid roles, remote work options, or secondary career hubs which can expand your adaptability.',
          what_changes: 'You start looking for alternative professional anchors in the new location, rather than viewing it as a loss of identity.',
          cognitive_bias: 'False Dilemma'
        },
        {
          assumption: 'That staying in the current setup will fix underlying feelings of relationship stagnation.',
          why_wrong: 'If routine or mismatched timelines are causing friction, staying in place will likely compound that resentment over time. A geographical stable state does not automatically resolve emotional drift.',
          what_changes: 'You realize that whether you move or stay, active and difficult conversations about your shared future must happen.',
          cognitive_bias: 'Status Quo Bias'
        }
      ],
      scenarios: [
        {
          option_name: optRel,
          narrative_30_days: 'You prioritize proximity or align plans with your partner. The relief of being close brings immediate warmth, though you feel slight anxiety about the professional adjustments.',
          narrative_60_days: 'You establish a shared household or routine. Daily intimacy is high, but small friction points emerge over personal space and career sacrifices.',
          narrative_90_days: 'Three months in, the relational bond is stronger. However, if you compromised your career location, you find yourself having to work twice as hard to build a local network.',
          confidence: 75,
          confidence_reasoning: 'Staying close or closing the gap eliminates the emotional distance risk, but shifts execution friction onto career adaptation.',
          hidden_cost: 'Potential career momentum lag and subtle feelings of resentment if sacrifices feel one-sided.',
          biggest_risk: 'Compromising your career setup only to experience relational strain later.',
          what_you_give_up: 'Total geographical freedom and immediate optimization of your individual career trajectory.',
          alignment_score: 80,
          dimension_scores: {
            financial: 60,
            emotional: 80,
            growth: 60,
            stability: 85,
            relationships: 90
          }
        },
        {
          option_name: optInd,
          narrative_30_days: 'You choose your individual career/geographical path. You feel independent and focused, but late-night calls with your partner are bittersweet.',
          narrative_60_days: 'You dive into your career or new city. The work is fulfilling, but the lack of physical presence makes maintaining connection feel like a chore.',
          narrative_90_days: 'Your personal growth is high, but the emotional cost of distance is clear. You realize you are leading parallel lives, forcing a serious conversation about long-term goals.',
          confidence: 55,
          confidence_reasoning: 'Individual path execution is highly predictable, but keeping a relationship alive across distance carries significant emotional friction.',
          hidden_cost: 'Constant cognitive load of checking in and coordinating schedules across different cities.',
          biggest_risk: 'Emotional drift and progressive weakening of your partner bond.',
          what_you_give_up: 'Daily companionship, shared routines, and immediate support from your partner.',
          alignment_score: 70,
          dimension_scores: {
            financial: 80,
            emotional: 50,
            growth: 90,
            stability: 65,
            relationships: 50
          }
        }
      ],
      uncertainty_disclosure: 'We cannot predict your partner\'s individual resilience, changing career timelines, or emotional shifts under distance constraints.'
    };
  }

  // Pre-canned high-quality response for Financial
  if (isFinancial && intake.options.length >= 2) {
    const optInv = intake.options[0] || 'Aggressive investment / major purchase';
    const optSav = intake.options[1] || 'Maintain high liquidity / pay down debt';

    return {
      agent_search_queries: [
        "mortgage vs renting opportunity cost calculator 2026",
        "average index fund returns historical vs inflation adjusted",
        "debt avalanche vs snowball strategy returns analysis"
      ],
      agent_sources: [
        { title: "Investopedia — Rent vs Buy Calculator", url: "https://www.investopedia.com/articles/personal-finance/083115/renting-vs-buying-house-pros-and-cons.asp" },
        { title: "Bogleheads Investment Philosophy", url: "https://www.bogleheads.org/wiki/Bogleheads%C2%AE_investment_philosophy" }
      ],
      assumptions: [
        {
          assumption: 'That real estate or investment returns will follow historical patterns without unexpected market corrections.',
          why_wrong: 'Short-term market cycles are volatile and unpredictable. Buying a home or investing right before a correction can lock up capital or result in paper losses.',
          what_changes: 'You increase your cash reserves to withstand a potential multi-year market downturn.',
          cognitive_bias: 'Anchoring Bias'
        },
        {
          assumption: 'That renting is "throwing money away" compared to homeownership.',
          why_wrong: 'Renting buys flexibility and caps your monthly costs. Buying has massive unrecoverable costs (taxes, interest, maintenance, transaction fees) that often exceed rent over short horizons (<5 years).',
          what_changes: 'You treat renting as paying for flexibility, allowing you to move for job opportunities.',
          cognitive_bias: 'Sunk Cost Fallacy'
        },
        {
          assumption: 'That your current income level is completely secure for the duration of a long-term loan or mortgage.',
          why_wrong: 'Macroeconomic shifts, company downsizings, or industry disruptions can impact your earning potential. Assuming permanent income security leads to over-leveraging.',
          what_changes: 'You size your recurring obligations based on a conservative survival income, not your peak salary.',
          cognitive_bias: 'Planning Fallacy'
        }
      ],
      scenarios: [
        {
          option_name: optInv,
          narrative_30_days: 'You allocate capital or sign loan papers. The immediate excitement of a new asset is tempered by a drop in liquid bank account balances.',
          narrative_60_days: 'Initial setup costs, taxes, or market fluctuations happen. You adjust your monthly spending to accommodate the new cash allocation pattern.',
          narrative_90_days: 'The asset settles into your net worth. You feel proud of building equity, but your monthly budget is tighter, leaving less room for spontaneous trips or leisure.',
          confidence: 70,
          confidence_reasoning: 'Asset acquisition has a structured process, but market volatility or maintenance expenses introduce variables.',
          hidden_cost: 'Reduced liquidity, transaction fees, and opportunity cost of locking up cash that could fund career pivots.',
          biggest_risk: 'An unexpected expense forcing you to liquidate assets at a loss.',
          what_you_give_up: 'Financial flexibility, liquidity buffer, and peace of mind from having cash in hand.',
          alignment_score: 75,
          dimension_scores: {
            financial: 85,
            emotional: 60,
            growth: 70,
            stability: 80,
            relationships: 60
          }
        },
        {
          option_name: optSav,
          narrative_30_days: 'You park cash in safe, liquid yields or pay off high-interest debt. The immediate safety feels comforting, but you wonder if your money should work harder.',
          narrative_60_days: 'Your net worth grows steadily without volatility. You enjoy having a low-stress buffer, but feel a slight pang of FOMO seeing others buy assets.',
          narrative_90_days: 'You have a mountain of liquid buffer or zero debt. Your monthly overhead is low. You realize this cash gives you leverage to take career risks or relocate on short notice.',
          confidence: 90,
          confidence_reasoning: 'Debt reduction and high yield savings have guaranteed returns and near-zero volatility.',
          hidden_cost: 'Inflation erosion of cash value and potential missing of a market upswing.',
          biggest_risk: 'Sitting on cash for too long, missing compounding growth opportunities.',
          what_you_give_up: 'Potential asset appreciation and leverage benefits of real estate or stock market returns.',
          alignment_score: 80,
          dimension_scores: {
            financial: 75,
            emotional: 80,
            growth: 60,
            stability: 95,
            relationships: 70
          }
        }
      ],
      uncertainty_disclosure: 'We cannot predict future interest rate changes, real estate market fluctuations, inflation rate spikes, or unexpected personal emergencies.'
    };
  }

  // Dynamic fallback for custom inputs
  return {
    agent_search_queries: [
      "decision matrix frameworks under uncertainty",
      "how to surface hidden biases cognitive science",
      "contingency action plan design best practices"
    ],
    agent_sources: [
      { title: "Farnam Street Mental Models Decision Guide", url: "https://fs.blog/mental-models/" },
      { title: "Harvard Business Review Decisive Action Plan", url: "https://hbr.org/" }
    ],
    assumptions: [
      {
        assumption: `That you must choose immediately without gathering further data.`,
        why_wrong: `Many timelines have hidden flexibility. Negotiating for another week or running a low-cost trial is often possible.`,
        what_changes: `You gain time to perform validation before committing.`,
        cognitive_bias: 'Urgency Bias'
      },
      {
        assumption: `That one path is entirely positive while the other is mostly negative.`,
        why_wrong: `Every major choice has hidden tradeoffs. A high-growth path has high stress; a stable path has low excitement.`,
        what_changes: `You stop looking for a 'perfect' choice and start choosing which tradeoffs you prefer.`,
        cognitive_bias: 'Black-and-White Thinking'
      },
      {
        assumption: `That your current constraints (like money or location) are permanent.`,
        why_wrong: `Financial situations and location boundaries shift. Modeling decisions as permanent locks leads to paralysis.`,
        what_changes: `You look at decisions on a shorter horizon (e.g. 1-2 years) rather than the rest of your life.`,
        cognitive_bias: 'Permanence Illusion'
      }
    ],
    scenarios: intake.options.filter(o => o.trim()).map((option, idx) => {
      const presets = [
        { financial: 80, emotional: 60, growth: 75, stability: 70, relationships: 65 },
        { financial: 55, emotional: 85, growth: 60, stability: 80, relationships: 90 },
        { financial: 40, emotional: 50, growth: 90, stability: 30, relationships: 45 },
        { financial: 70, emotional: 70, growth: 80, stability: 60, relationships: 75 }
      ];
      return {
        option_name: option,
        narrative_30_days: `You take the first steps on "${option}". You adjust to the immediate changes in your daily schedule, feeling a mix of anticipation and caution.`,
        narrative_60_days: `You are fully immersed in this path. The initial excitement settles into a routine, and you begin dealing with the day-to-day challenges.`,
        narrative_90_days: `Three months in, you have adapted. You are seeing the first concrete results of your choice, though some tradeoffs are now fully visible.`,
        confidence: [80, 60, 45, 75][idx % 4],
        confidence_reasoning: `Based on your stated constraints like "${intake.timeline}" and fears about "${intake.fear.slice(0, 30)}...".`,
        hidden_cost: `Opportunity cost of completely neglecting other options.`,
        biggest_risk: `Losing motivation if results don't compound as fast as expected.`,
        what_you_give_up: `The freedom and potential upside of the other options you had to reject.`,
        alignment_score: [90, 75, 65, 80][idx % 4],
        dimension_scores: presets[idx % 4]
      };
    }),
    uncertainty_disclosure: `We cannot know your long-term discipline level or unexpected external events that might disrupt these paths.`
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
    fallback: `If this path becomes unviable, pivot to your backup plan: Maintain active contact with your alternative options, update your portfolio/resume weekly, and budget for a 3-month transition window.`
  };
}
