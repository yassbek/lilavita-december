// app/api/user-progress/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get("applicationId");

    if (!applicationId) {
      return NextResponse.json({ error: 'Missing applicationId' }, { status: 400 });
    }

    const directusUrl = `${process.env.NEXT_PUBLIC_DIRECTUS_URL || process.env.DIRECTUS_URL}/items/applications/${applicationId}`;
    const directusToken = process.env.NEXT_PUBLIC_DIRECTUS_TOKEN || process.env.DIRECTUS_STATIC_TOKEN;

    const directusRes = await fetch(directusUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${directusToken}`
      },
      // Cache-Kontrolle, um sicherzustellen, dass wir immer die neuesten Daten erhalten
      cache: 'no-store' 
    });

    if (directusRes.status === 404) {
        // Wenn die Anwendung nicht gefunden wird, ist es ein neuer Benutzer
        return NextResponse.json({ progress: null }, { status: 404 });
    }

    if (!directusRes.ok) {
      const errorData = await directusRes.json();
      console.error('Failed to fetch user progress from Directus:', errorData);
      return NextResponse.json({ error: 'Failed to fetch user progress' }, { status: directusRes.status });
    }

    const data = await directusRes.json();
    const current_interview_stage = data.data?.current_interview_stage || null; // Annahme: Feld heißt so

    return NextResponse.json({ progress: { current_interview_stage } });

  } catch (error) {
    console.error('Error in /api/user-progress:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}