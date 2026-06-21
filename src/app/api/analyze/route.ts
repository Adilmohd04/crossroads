import { NextRequest, NextResponse } from 'next/server';
import { analyzeDecision } from '../../../lib/gemini';
import { validateIntake } from '../../../lib/types';

export async function POST(request: NextRequest) {
  try {
    const { intake, history, dna } = await request.json();
    if (!intake) {
      return NextResponse.json({ error: 'Missing intake data' }, { status: 400 });
    }

    const errors = validateIntake(intake);
    if (errors.length > 0) {
      return NextResponse.json({
        error: `Invalid intake: ${errors.map(e => e.message).join('; ')}`,
        fields: errors.map(e => e.field),
      }, { status: 400 });
    }

    const result = await analyzeDecision(intake, history, dna);
    return NextResponse.json(result);
  } catch (e: any) {
    console.error('API analyze error:', e);
    return NextResponse.json({ error: e.message || 'Error during analysis' }, { status: 500 });
  }
}
