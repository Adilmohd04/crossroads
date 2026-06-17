import { GoogleGenerativeAI, DynamicRetrievalMode } from '@google/generative-ai';
import { IntakeData, AnalysisResult, ActionPlanResult } from './types';
import { buildAnalysisPrompt, buildActionPlanPrompt } from './prompts';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

// Initialize Gemini if key exists
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

/** Hard timeout wrapper — falls back to mock if Gemini hasn't responded in 5s */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Gemini timeout after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}

/**
 * Main function to generate assumptions and scenario comparisons.
 */
export async function analyzeDecision(intake: IntakeData): Promise<AnalysisResult> {
  // If no API key is set, fall back to mock data
  if (!genAI) {
    console.warn('Gemini API key not found. Using mock data fallback.');
    return getMockAnalysis(intake);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
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

    const prompt = buildAnalysisPrompt(intake);
    // Race against 5-second hard timeout so demo never hangs on slow networks
    const result = await withTimeout(model.generateContent(prompt), 5000);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error('Gemini returned an empty response.');
    }

    // Attempt to clean JSON in case of markdown wraps
    const cleanJson = sanitizeJsonString(text);
    return JSON.parse(cleanJson) as AnalysisResult;
  } catch (error) {
    console.error('Error in analyzeDecision API call:', error);
    console.warn('API call failed or timed out. Falling back to mock data generator.');
    return getMockAnalysis(intake);
  }
}

/**
 * Main function to generate a 7-day action plan for a chosen path.
 */
export async function generateActionPlan(
  intake: IntakeData,
  chosenPath: string,
  biggestRisk: string
): Promise<ActionPlanResult> {
  if (!genAI) {
    console.warn('Gemini API key not found. Using mock data fallback.');
    return getMockActionPlan(intake, chosenPath, biggestRisk);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
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

    const prompt = buildActionPlanPrompt(intake, chosenPath, biggestRisk);
    // Race against 5-second hard timeout so demo never hangs
    const result = await withTimeout(model.generateContent(prompt), 5000);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error('Gemini returned an empty response.');
    }

    const cleanJson = sanitizeJsonString(text);
    return JSON.parse(cleanJson) as ActionPlanResult;
  } catch (error) {
    console.error('Error in generateActionPlan API call:', error);
    console.warn('API call failed or timed out. Falling back to mock action plan generator.');
    return getMockActionPlan(intake, chosenPath, biggestRisk);
  }
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

/**
 * === MOCK DATA GENERATOR ===
 * Generates high-quality, realistic decision scenarios on the fly.
 */
function getMockAnalysis(intake: IntakeData): AnalysisResult {
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
      assumptions: [
        {
          assumption: 'That grad school guarantees a higher starting salary and a more prestigious career path.',
          why_wrong: 'In tech, experience and building projects often compound faster than academic credentials. For some specializations like AI research, an MS helps, but it is not a blanket guarantee.',
          what_changes: 'You might place more weight on immediate compensation and hands-on professional growth over credentials.'
        },
        {
          assumption: 'That the job offer will wait for you or remain active if you defer or delay deciding.',
          why_wrong: 'Mid-sized companies and startups operate on immediate resource requirements. Delaying beyond 10-14 days often leads to the offer being rescinded.',
          what_changes: 'The urgency of securing employment becomes a harder constraint than academic timelines.'
        },
        {
          assumption: 'That you will have the same energy and risk tolerance for a startup or relocation 2 years from now.',
          why_wrong: 'Life conditions changes quickly. Debt, lease commitments, and changing relationship dynamics frequently lock people into stable paths as they get older.',
          what_changes: 'You realize that some paths (like a high-risk startup) are easier to test right now than later.'
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
    const optA = intake.options[0] || 'Pursue a university degree';
    const optB = intake.options[1] || 'Complete an intensive bootcamp';
    const optC = intake.options[2] || 'Go self-taught / online courses';

    return {
      assumptions: [
        {
          assumption: 'That a formal degree is required to get hired in your target field.',
          why_wrong: 'Most modern tech employers — especially startups and mid-size companies — evaluate candidates on portfolio and demonstrated skills. A degree signals baseline credibility but doesn\'t override a strong GitHub profile or shipped products.',
          what_changes: 'You would weight the bootcamp or self-taught path higher, since time-to-employment and portfolio output are more important than the credential itself.'
        },
        {
          assumption: 'That a bootcamp\'s shorter timeline means lower quality knowledge.',
          why_wrong: 'Structured bootcamps with strong hiring networks consistently place graduates into junior roles within 3-6 months. The tradeoff is breadth vs. depth — they optimize for job-readiness, not academic completeness.',
          what_changes: 'You reconsider the definition of "ready" — job-ready in 4 months vs. academically complete in 4 years are different goals that require different paths.'
        },
        {
          assumption: 'That self-teaching is free and therefore low-commitment.',
          why_wrong: 'Self-directed learning has the highest dropout rate of any educational path. Without structured deadlines, peer accountability, or a mentor, most self-taught learners plateau or abandon the path within 6 months.',
          what_changes: 'You price in the hidden cost of accountability infrastructure (mentorship, paid courses, peer cohorts) that makes self-teaching viable, which erodes the perceived cost advantage.'
        }
      ],
      scenarios: [
        {
          option_name: optA,
          narrative_30_days: 'You enroll, pay tuition, and begin foundational coursework. The first month is adjustment — adapting to academic pacing and identifying your specialization track.',
          narrative_60_days: 'You complete your first semester of core modules. Your bank account reflects tuition debt but your conceptual grounding is strong. You begin applying for internships.',
          narrative_90_days: 'You are midway through year one, immersed in theory and academic projects. Peers are getting internships; you feel both intellectually stimulated and acutely aware of the opportunity cost.',
          confidence: 75,
          confidence_reasoning: 'Degree programs are structured and reliable, but time-to-employment and total cost reduce the short-term confidence score given your stated constraints.',
          hidden_cost: 'The 2-4 year opportunity cost of not earning industry income, compounding alongside student debt interest.',
          biggest_risk: 'Graduating into a skills market that has shifted during your study period, leaving your degree less relevant than expected.',
          what_you_give_up: 'The ability to begin earning, building a portfolio, and compounding real experience immediately.',
          alignment_score: 78,
          dimension_scores: { financial: 30, emotional: 65, growth: 90, stability: 70, relationships: 75 }
        },
        {
          option_name: optB,
          narrative_30_days: 'You begin the intensive program. Days are 10-12 hours of coding. The pace is aggressive and the cohort accountability keeps you engaged.',
          narrative_60_days: 'You complete the first major project milestone. Your portfolio begins to take shape. You join career coaching sessions and start applying to junior roles.',
          narrative_90_days: 'You finish the program or are in the final weeks. Your resume and GitHub now reflect tangible projects. First technical interviews begin.',
          confidence: 68,
          confidence_reasoning: 'Strong if you stay disciplined through the intensity, but cohort dropout rates and employer skepticism of unknown bootcamp brands introduce variability.',
          hidden_cost: 'The narrow skill stack — bootcamps optimize for a specific stack, leaving gaps in computer science fundamentals that surface in technical interviews.',
          biggest_risk: 'Enrolling in a bootcamp with a weak hiring network that doesn\'t have active employer relationships in your target market.',
          what_you_give_up: 'Academic depth, alumni prestige networks, and the broad conceptual foundations a degree provides.',
          alignment_score: 82,
          dimension_scores: { financial: 55, emotional: 70, growth: 78, stability: 50, relationships: 65 }
        },
        ...(intake.options.length > 2 ? [{
          option_name: optC,
          narrative_30_days: 'You set up your learning environment, pick a curriculum, and begin daily coding sessions. The freedom feels exciting and the zero cost feels smart.',
          narrative_60_days: 'You have completed 3-4 online modules. Progress feels slower than expected. You miss having a peer group or instructor to unblock you when stuck.',
          narrative_90_days: 'You have a partial portfolio but inconsistent depth. The lack of structure has slowed you down. You reconsider adding accountability mechanisms like a mentor or paid cohort.',
          confidence: 42,
          confidence_reasoning: 'Self-directed learning has the highest dropout rate. Without accountability structures, sustained daily progress over 90 days is the exception, not the norm.',
          hidden_cost: 'The invisible cost of time wasted on wrong tutorials, shallow rabbit holes, and lack of a curated curriculum designed to get you hired.',
          biggest_risk: 'Plateauing after foundational concepts without a mentor to push you into advanced territory that employers actually test for.',
          what_you_give_up: 'Peer accountability, structured mentorship, and the credentialing signal that both bootcamps and degrees provide.',
          alignment_score: 65,
          dimension_scores: { financial: 80, emotional: 55, growth: 65, stability: 30, relationships: 50 }
        }] : [])
      ],
      uncertainty_disclosure: 'We cannot predict your specific discipline levels, the bootcamp\'s current hiring network quality, or shifts in the job market for the tech stack you are targeting. These scores are generalizations based on industry averages.'
    };
  }

  // Pre-canned high-quality response for Relocation
  if (isRelocation && intake.options.length >= 2) {
    const optMove = intake.options[0] || 'Move to the new city';
    const optStay = intake.options[1] || 'Stay in your current city';

    return {
      assumptions: [
        {
          assumption: 'That moving to a new city automatically resolves feelings of stagnation or routine.',
          why_wrong: 'Internal habits and social routines travel with you. If you struggle to network locally, a new city will amplify that isolation initially.',
          what_changes: 'You begin viewing moving as an accelerator for change, rather than a magical cure.'
        },
        {
          assumption: 'That staying in your current city prevents your career from growing.',
          why_wrong: 'With remote work and local tech meetups, career growth is highly dependent on self-education and proactive outreach, not just geographical coordinates.',
          what_changes: 'You look at how you can shake up your current environment if you choose to stay.'
        },
        {
          assumption: 'That long-distance relationships or friendships will remain unchanged with remote communication.',
          why_wrong: 'Out of sight often leads to a natural drift in conversational frequency, requiring significant deliberate effort to maintain bonds.',
          what_changes: 'You price in the emotional work required to preserve your current support systems.'
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

  // Dynamic fallback for custom inputs
  return {
    assumptions: [
      {
        assumption: `That you must choose immediately without gathering further data.`,
        why_wrong: `Many timelines have hidden flexibility. Negotiating for another week or running a low-cost trial is often possible.`,
        what_changes: `You gain time to perform validation before committing.`
      },
      {
        assumption: `That one path is entirely positive while the other is mostly negative.`,
        why_wrong: `Every major choice has hidden tradeoffs. A high-growth path has high stress; a stable path has low excitement.`,
        what_changes: `You stop looking for a 'perfect' choice and start choosing which tradeoffs you prefer.`
      },
      {
        assumption: `That your current constraints (like money or location) are permanent.`,
        why_wrong: `Financial situations and location boundaries shift. Modeling decisions as permanent locks leads to paralysis.`,
        what_changes: `You look at decisions on a shorter horizon (e.g. 1-2 years) rather than the rest of your life.`
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
  biggestRisk: string
): ActionPlanResult {
  return {
    chosen_path: chosenPath,
    plan: [
      {
        day: 1,
        action: `Audit your immediate obligations and clear 2 hours on your calendar. Create a 'Decision Log' documenting why you chose "${chosenPath}" to refer back to when doubt creeps in.`,
        why_first: `Day 1 requires building psychological momentum and capturing your clarity before daily distractions interfere.`,
        time_of_day: 'morning',
        reversible: true,
        costs_money: false
      },
      {
        day: 2,
        action: `Reach out to 2 people in your network who have walked a similar path or work in a related field. Ask them: 'What was the biggest mistake you made in your first 3 months?'`,
        why_first: `Learning from others' mistakes is the fastest way to mitigate the risk of: "${biggestRisk}".`,
        time_of_day: 'afternoon',
        reversible: true,
        costs_money: false
      },
      {
        day: 3,
        action: `List all necessary tools, software, or subscriptions required for this path. If any require payment, review if there are free tiers first.`,
        why_first: `Helps you manage constraints and prevents impulsive spending.`,
        time_of_day: 'evening',
        reversible: true,
        costs_money: false
      },
      {
        day: 4,
        action: `Take the first irreversible step (e.g. notify the other party of deferral/rejection, draft a formal acceptance letter, or schedule a key meeting).`,
        why_first: `Bridges the gap between thinking and acting. Commit to the decision.`,
        time_of_day: 'morning',
        reversible: false,
        costs_money: false
      },
      {
        day: 5,
        action: `Set up a clean digital workspace (Trello, Notion, or physical notebook) dedicated solely to tracking this transition. Outline your weekly goals for the next month.`,
        why_first: `Provides structure to your daily routines now that you are committed.`,
        time_of_day: 'afternoon',
        reversible: true,
        costs_money: false
      },
      {
        day: 6,
        action: `Address your biggest fear: "${intake.fear}". Spend 1 hour writing down a worst-case scenario plan ('fear-setting') detailing what you will do if that fear becomes reality.`,
        why_first: `Demystifying your fear prevents self-sabotage and subconscious avoidance.`,
        time_of_day: 'evening',
        reversible: true,
        costs_money: false
      },
      {
        day: 7,
        action: `Review your progress. Compare your experience this week against your 30-day narrative. Adjust your tasks for the upcoming week based on what you learned.`,
        why_first: `Day 7 is the reflection checkpoint to ensure your actions remain aligned with your core values.`,
        time_of_day: 'afternoon',
        reversible: true,
        costs_money: false
      }
    ],
    reflection_prompt: `Looking at your actions this week, did you act out of excitement for the path ahead, or out of fear of what you left behind?`,
    fallback: `If this path becomes unviable, pivot to your backup plan: Maintain active contact with your alternative options, update your portfolio/resume weekly, and budget for a 3-month transition window.`
  };
}
