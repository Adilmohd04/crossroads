import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, DynamicRetrievalMode } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY || '';
const API_KEY_2 = process.env.GEMINI_API_KEY_2 || '';

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
      return NextResponse.json({ error: 'No API keys configured' }, { status: 500 });
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
      return NextResponse.json({ error: 'All models failed to return content' }, { status: 502 });
    }

    const cleaned = text.replace(/```json\n?/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return NextResponse.json(parsed);

  } catch (e: any) {
    console.error('API opportunities error:', e);
    return NextResponse.json({ error: e.message || 'Error during opportunity search' }, { status: 500 });
  }
}
