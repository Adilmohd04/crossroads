import { NextRequest, NextResponse } from 'next/server';

const NVIDIA_KEY = process.env.NVIDIA_API_KEY || '';

export async function POST(request: NextRequest) {
  if (!NVIDIA_KEY) {
    return NextResponse.json({ error: 'No NVIDIA key configured' }, { status: 500 });
  }

  let prompt = '';
  try {
    const body = await request.json();
    prompt = body.prompt || '';
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!prompt) {
    return NextResponse.json({ error: 'No prompt provided' }, { status: 400 });
  }

  try {
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NVIDIA_KEY}`,
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-3-ultra-550b-a55b',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        top_p: 0.95,
        max_tokens: 4096,
        stream: false,
      }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error('Nemotron API error:', response.status, responseText.slice(0, 500));
      return NextResponse.json(
        { error: `Nemotron error: ${response.status}`, details: responseText.slice(0, 200) },
        { status: response.status }
      );
    }

    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error('Nemotron non-JSON response:', responseText.slice(0, 300));
      return NextResponse.json({ error: 'Non-JSON response from Nemotron' }, { status: 500 });
    }

    // Extract content — handle both standard and thinking model formats
    const message = data.choices?.[0]?.message;
    const content = message?.content || message?.reasoning_content || '';

    if (!content) {
      console.error('Nemotron empty content, raw:', JSON.stringify(data).slice(0, 300));
      return NextResponse.json({ error: 'Empty response from Nemotron' }, { status: 500 });
    }

    return NextResponse.json({ content });

  } catch (e: any) {
    console.error('Nemotron fetch failed:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
