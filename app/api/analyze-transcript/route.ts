import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export async function POST(request: NextRequest) {
  try {
    const { transcript, applicationId } = await request.json();
    if (!transcript || !applicationId) {
      return NextResponse.json({ error: 'Missing transcript or applicationId' }, { status: 400 });
    }

    // Prepare prompt for Gemini
    const prompt = `You are an expert reviewer. Analyze the following interview transcript and provide a JSON object with integer scores (1-10) for the following fields: team_kompetenz, team_dynamik, organisation, fuehrung, prozesse, kultur. Only return the JSON object, nothing else.\n\nTranscript:\n${JSON.stringify(transcript, null, 2)}`;

    // Call Gemini
    const geminiRes = await fetch(GEMINI_API_URL + `?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );
    const geminiData = await geminiRes.json();
    console.log('Gemini raw response:', geminiData);

    // Extract JSON from Gemini response
    let scores: any = null;
    try {
      const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
      scores = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
    } catch (e) {
      return NextResponse.json({ error: 'Failed to parse Gemini response', geminiData }, { status: 500 });
    }

    // Patch scores to Directus
    const directusUrl = `${process.env.NEXT_PUBLIC_DIRECTUS_URL || process.env.DIRECTUS_URL}/items/applications/${applicationId}`;
    const directusToken = process.env.NEXT_PUBLIC_DIRECTUS_TOKEN || process.env.DIRECTUS_STATIC_TOKEN;
    const directusRes = await fetch(directusUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${directusToken}`
      },
      body: JSON.stringify({
        team_kompetenz: scores.team_kompetenz,
        team_dynamik: scores.team_dynamik,
        organisation: scores.organisation,
        fuehrung: scores.fuehrung,
        prozesse: scores.prozesse,
        kultur: scores.kultur
      })
    });
    const directusData = await directusRes.json();
    console.log('Directus patch response:', directusData);

    return NextResponse.json({ scores, directus: directusData, gemini: geminiData });
  } catch (error) {
    console.error('Error in /api/analyze-transcript:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
} 