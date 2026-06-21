import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DecisionJournalEntry, DecisionDNA } from '../../../lib/types';

const API_KEY = process.env.GEMINI_API_KEY || '';
const API_KEY_2 = process.env.GEMINI_API_KEY_2 || '';

export async function POST(request: NextRequest) {
  try {
    const { history } = await request.json();
    if (!history || !Array.isArray(history) || history.length < 2) {
      return NextResponse.json({ error: 'Missing or insufficient journal history' }, { status: 400 });
    }

    const keysToTry = [];
    if (API_KEY_2) keysToTry.push(API_KEY_2);
    if (API_KEY) keysToTry.push(API_KEY);

    if (keysToTry.length === 0) {
      return NextResponse.json({ error: 'No API keys configured' }, { status: 500 });
    }

    const historyContext = history.map((entry: DecisionJournalEntry, idx: number) => `
Decision ${idx + 1}: "${entry.decision}"
- Chose: "${entry.chosen_path}" (confidence: ${entry.confidence}%)
- Options rejected: ${entry.options.filter((o: string) => o !== entry.chosen_path).join(', ')}
- Category: ${entry.category || 'general'}
- Values ranked: ${(entry.values || []).join(' > ')}
- Constraints: ${(entry.constraints || []).join(', ')}
- Reflection: ${entry.reflections || 'None yet'}
`).join('\n');

    const prompt = `You are a behavioral psychologist analyzing a person's decision-making history. Based on the following ${history.length} decisions this person has committed to, generate a concise "Decision DNA" profile.

HISTORY:
${historyContext}

INSTRUCTIONS:
1. Write a 2-3 sentence personal decision profile. Be SPECIFIC to their actual decisions — not generic. Name the actual pattern you see (e.g., "You consistently chose certainty over upside in 3 of 4 decisions" or "You repeatedly delay when social risk is involved").
2. Identify 3 specific behavioral patterns grounded in the actual decisions above. Each pattern should name what you observed, what it means psychologically, and how it will show up in future decisions.
3. Identify one specific blind spot — a systematic bias visible across multiple decisions that could lead to regret.

OUTPUT: Return ONLY valid JSON:
{
  "summary": "string — 2-3 sentence personal profile with SPECIFIC references to their actual decisions",
  "patterns": [
    {
      "pattern": "string — short memorable name for the pattern",
      "insight": "string — what this means for them specifically, grounded in their actual decision data",
      "occurrences": number,
      "sentiment": "positive" | "neutral" | "cautionary"
    }
  ],
  "blind_spot": "string — one specific, named tendency visible across multiple decisions that they should watch for"
}`;

    const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-2.5-flash', 'gemini-3.5-flash'];
    let text = '';

    for (const key of keysToTry) {
      for (const modelName of modelsToTry) {
        try {
          const genAI = new GoogleGenerativeAI(key);
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.6,
            },
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
    parsed.generated_at = new Date().toISOString();
    return NextResponse.json(parsed);

  } catch (e: any) {
    console.error('API decision-dna error:', e);
    return NextResponse.json({ error: e.message || 'Error during DNA generation' }, { status: 500 });
  }
}
