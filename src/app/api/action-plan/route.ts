import { NextRequest, NextResponse } from 'next/server';
import { generateActionPlan } from '../../../lib/gemini';
import { validateIntake } from '../../../lib/types';

export async function POST(request: NextRequest) {
  try {
    const { intake, pathName, risk, insights } = await request.json();
    if (!intake || !pathName) {
      return NextResponse.json({ error: 'Missing decision context' }, { status: 400 });
    }

    const errors = validateIntake(intake);
    if (errors.length > 0) {
      return NextResponse.json({
        error: `Invalid intake: ${errors.map(e => e.message).join('; ')}`,
        fields: errors.map(e => e.field),
      }, { status: 400 });
    }

    const result = await generateActionPlan(intake, pathName, risk, insights);
    return NextResponse.json(result);
  } catch (e: any) {
    console.error('API action plan error:', e);
    return NextResponse.json({ error: e.message || 'Error during plan generation' }, { status: 500 });
  }
}
