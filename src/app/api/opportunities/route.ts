import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, DynamicRetrievalMode } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY || '';
const API_KEY_2 = process.env.GEMINI_API_KEY_2 || '';

function getMockOpportunities(intake: any) {
  if (!intake) {
    return {
      opportunities: [
        { name: 'Work at a Startup (YC)', provider: 'Y Combinator', cost: 'Free', format: 'Job board', deadline: 'Always open', url: 'https://www.workatastartup.com/', why_relevant: 'High-growth companies looking for talent', location: 'Multiple / Remote' },
        { name: 'Levels.fyi', provider: 'Levels.fyi', cost: 'Free', format: 'Salary database', deadline: 'N/A', url: 'https://www.levels.fyi/', why_relevant: 'Research if your compensation is competitive', location: 'Global' },
        { name: 'Google Career Certificates', provider: 'Google via Coursera', cost: '$49/month', format: 'Self-paced', deadline: 'Open', url: 'https://grow.google/certificates/', why_relevant: 'Build skills while you decide', location: 'Remote' },
      ],
      is_mock: true,
    };
  }
  const combined = ((intake.decision || '') + ' ' + ((intake.options || []) as string[]).join(' ')).toLowerCase();
  const hasEducation = combined.includes('grad') || combined.includes('master') || combined.includes('school') || combined.includes('degree') || combined.includes('bootcamp');
  const hasCareer = combined.includes('job') || combined.includes('startup') || combined.includes('offer') || combined.includes('role') || combined.includes('career');
  const hasRelocation = combined.includes('move') || combined.includes('relocat') || combined.includes('city') || combined.includes('austin') || combined.includes('nyc');

  if (hasEducation && hasCareer) {
    return {
      opportunities: [
        { name: 'Georgia Tech OMSCS', provider: 'Georgia Tech', cost: '$8,950 total', format: '100% Online', deadline: 'Rolling', url: 'https://omscs.gatech.edu/', why_relevant: 'Do the MS while working — best of both worlds', location: 'Remote' },
        { name: 'Work at a Startup (YC)', provider: 'Y Combinator', cost: 'Free', format: 'Job board', deadline: 'Always open', url: 'https://www.workatastartup.com/', why_relevant: 'Browse similar startups as backup options', location: 'Remote / On-site' },
        { name: 'Levels.fyi Salary Data', provider: 'Levels.fyi', cost: 'Free', format: 'Database', deadline: 'N/A', url: 'https://www.levels.fyi/', why_relevant: 'Verify if offers are competitive for your level and location', location: 'Global' },
        { name: 'Google Career Certificates', provider: 'Google via Coursera', cost: '$49/month', format: 'Self-paced', deadline: 'Open', url: 'https://grow.google/certificates/', why_relevant: 'Industry credential in 3-6 months as a bridge option', location: 'Remote' },
      ],
      is_mock: true,
    };
  }

  if (hasEducation) {
    return {
      opportunities: [
        { name: 'Georgia Tech OMSCS', provider: 'Georgia Tech', cost: '$8,950 total', format: '100% Online', deadline: 'Rolling', url: 'https://omscs.gatech.edu/', why_relevant: 'Top-10 CS degree you can do while working', location: 'Remote' },
        { name: 'Google Career Certificates', provider: 'Google via Coursera', cost: '$49/month', format: 'Self-paced', deadline: 'Open', url: 'https://grow.google/certificates/', why_relevant: 'Industry credential without degree commitment', location: 'Remote' },
        { name: 'GRE Prep (Free)', provider: 'Khan Academy + ETS', cost: 'Free', format: 'Self-paced', deadline: 'N/A', url: 'https://www.ets.org/gre/test-takers/general-test/prepare.html', why_relevant: 'Free GRE prep for applications', location: 'Remote' },
      ],
      is_mock: true,
    };
  }

  if (hasRelocation) {
    return {
      opportunities: [
        { name: 'Cost of Living Comparison', provider: 'Numbeo', cost: 'Free', format: 'Web tool', deadline: 'N/A', url: 'https://www.numbeo.com/cost-of-living/comparison.jsp', why_relevant: 'Compare exact costs between cities', location: 'Global' },
        { name: 'Remote Job Board', provider: 'We Work Remotely', cost: 'Free', format: 'Job board', deadline: 'Always open', url: 'https://weworkremotely.com/', why_relevant: 'Remote jobs let you stay anywhere', location: 'Remote' },
        { name: 'Nomad List', provider: 'Nomad List', cost: 'Free tier', format: 'City database', deadline: 'N/A', url: 'https://nomadlist.com/', why_relevant: 'Safety, internet, cost for 1000+ cities', location: 'Global' },
      ],
      is_mock: true,
    };
  }

  return {
    opportunities: [
      { name: 'Work at a Startup (YC)', provider: 'Y Combinator', cost: 'Free', format: 'Job board', deadline: 'Always open', url: 'https://www.workatastartup.com/', why_relevant: 'High-growth companies looking for talent', location: 'Multiple / Remote' },
      { name: 'Levels.fyi', provider: 'Levels.fyi', cost: 'Free', format: 'Salary database', deadline: 'N/A', url: 'https://www.levels.fyi/', why_relevant: 'Research if your compensation is competitive', location: 'Global' },
      { name: 'Google Career Certificates', provider: 'Google via Coursera', cost: '$49/month', format: 'Self-paced', deadline: 'Open', url: 'https://grow.google/certificates/', why_relevant: 'Build skills while you decide', location: 'Remote' },
    ],
    is_mock: true,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { intake } = await request.json();
    if (!intake) {
      return NextResponse.json({ error: 'Missing intake data' }, { status: 400 });
    }

    const keysToTry = [];
    if (API_KEY_2) keysToTry.push(API_KEY_2);
    if (API_KEY) keysToTry.push(API_KEY);

    if (keysToTry.length === 0) {
      const mock = getMockOpportunities(intake);
      return NextResponse.json(mock);
    }

    const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-2.5-flash', 'gemini-3.5-flash'];
    let text = '';

    const optionsList = intake.options.join(', ');
    const constraintsList = intake.constraints.join(', ');
    const prompt = `You are a research assistant. The user is deciding between: ${optionsList}.
Their constraints: ${constraintsList}. Their decision: "${intake.decision}".
Category: ${intake.category || 'general'}.

USE GOOGLE SEARCH to find 4-6 REAL, SPECIFIC, CURRENTLY ACTIVE opportunities that directly help them execute one of their options. These must be REAL programs/jobs/resources with REAL URLs that work today.

For each opportunity found, return:
- name: exact name of program/job/resource
- provider: organization offering it
- cost: actual cost (or "Free")
- format: online/in-person/hybrid
- deadline: actual deadline if known, or "Rolling" or "Open"
- url: the REAL working URL to apply/access
- why_relevant: one sentence on why THIS matches THEIR specific situation
- location: where it's based or "Remote"

Return ONLY valid JSON:
{"opportunities": [...]}`;

    for (const key of keysToTry) {
      for (const modelName of modelsToTry) {
        try {
          const genAI = new GoogleGenerativeAI(key);
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.4,
            },
            tools: [{
              googleSearchRetrieval: {
                dynamicRetrievalConfig: {
                  mode: DynamicRetrievalMode.MODE_DYNAMIC,
                  dynamicThreshold: 0.2,
                },
              },
            }],
          });

          const generatePromise = model.generateContent(prompt);
          const timeoutPromise = new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('timeout')), 12000)
          );

          const result = await Promise.race([
            generatePromise,
            timeoutPromise,
          ]);

          const resolvedText = (result as any).response.text();
          if (resolvedText) {
            text = resolvedText;
            break;
          }
        } catch (e) {
          console.error(`Model ${modelName} failed:`, e);
          continue;
        }
      }
      if (text) break;
    }

    if (!text) {
      const mock = getMockOpportunities(intake);
      return NextResponse.json(mock);
    }

    const cleaned = text.replace(/```json\n?/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return NextResponse.json(parsed);

  } catch (e: any) {
    console.error('API opportunities error:', e);
    const mock = getMockOpportunities(null);
    return NextResponse.json(mock);
  }
}