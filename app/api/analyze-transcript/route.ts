import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export async function POST(request: NextRequest) {
  try {
    const { transcript, applicationId } = await request.json();
    if (!transcript || !applicationId) {
      return NextResponse.json({ error: 'Missing transcript or applicationId' }, { status: 400 });
    }

    // Prepare prompt for Gemini
    // Instruct Gemini to return a JSON object with:
    // - Integer scores (1-10) for: team_kompetenz, team_dynamik, organisation, fuehrung, prozesse, kultur
    // - Arrays of strings for:
    //   - ai_staerken: strengths (list of strengths identified in the transcript)
    //   - ai_verbesserungsbereiche: areas for improvement (list of weaknesses or areas to improve)
    //   - ai_empfehlungen: recommendations (list of actionable recommendations)
    const prompt = `You are an expert reviewer. Analyze the following interview transcript and provide a JSON object with:
- Integer scores (1-10) for the following fields: team_kompetenz, team_dynamik, organisation, fuehrung, prozesse, kultur.
- An array of strings for each of the following fields:
  - ai_staerken: strengths (list of strengths identified in the transcript)
  - ai_verbesserungsbereiche: areas for improvement (list of weaknesses or areas to improve)
  - ai_empfehlungen: recommendations (list of actionable recommendations for the team/organization)
Only return the JSON object, nothing else.

Transcript:
${JSON.stringify(transcript, null, 2)}`;

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
    type Scores = {
      team_kompetenz?: number;
      team_dynamik?: number;
      organisation?: number;
      fuehrung?: number;
      prozesse?: number;
      kultur?: number;
      ai_staerken?: string[];
      ai_verbesserungsbereiche?: string[];
      ai_empfehlungen?: string[];
      [key: string]: unknown;
    };
    let scores: Scores = {};
    try {
      const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
      scores = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
    } catch {
      return NextResponse.json({ error: 'Failed to parse Gemini response', geminiData }, { status: 500 });
    }

    // Patch scores and AI analysis fields to Directus
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
        kultur: scores.kultur,
        ai_staerken: scores.ai_staerken, // array of strengths
        ai_verbesserungsbereiche: scores.ai_verbesserungsbereiche, // array of areas for improvement
        ai_empfehlungen: scores.ai_empfehlungen // array of recommendations
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