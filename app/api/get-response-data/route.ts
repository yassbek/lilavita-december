// app/api/get-response-data/route.ts

import { NextRequest, NextResponse } from 'next/server';

interface TypeformAnswer {
  field: { ref: string };
  type: string;
  email?: string;
  // Andere mögliche Typen hier hinzufügen, falls benötigt
}

// Hilfsfunktion, um kurz zu warten
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const responseId = searchParams.get('responseId');
  const formId = 'yYh3nt7W'; // Deine Formular-ID

  if (!responseId) {
    return NextResponse.json({ message: 'responseId fehlt' }, { status: 400 });
  }

  const typeformToken = process.env.TYPEFORM_TOKEN;
  const directusUrl = process.env.DIRECTUS_URL;
  const directusToken = process.env.DIRECTUS_STATIC_TOKEN;

  if (!typeformToken || !directusUrl || !directusToken) {
    return NextResponse.json({ message: 'Server nicht korrekt konfiguriert' }, { status: 500 });
  }

  try {
    // 1. Hole die vollständige Antwort von der Typeform API
    const typeformApiUrl = `https://api.typeform.com/forms/${formId}/responses?included_response_ids=${responseId}`;
    const typeformApiResponse = await fetch(typeformApiUrl, {
      headers: { 'Authorization': `Bearer ${typeformToken}` }
    });
    if (!typeformApiResponse.ok) throw new Error('Fehler bei der Abfrage der Typeform-API');
    
    const responseData = await typeformApiResponse.json();
    if (!responseData.items || responseData.items.length === 0) {
      return NextResponse.json({ message: 'Typeform-Antwort nicht gefunden' }, { status: 404 });
    }

    const answers: TypeformAnswer[] = responseData.items[0].answers;
    const findAnswerByRef = (ref: string) => answers.find(a => a.field.ref === ref);
    
    // WICHTIG: Ersetze 'deine_email_ref_hier' mit dem Ref deines E-Mail-Feldes aus Typeform
    const userEmail = findAnswerByRef('deine_email_ref_hier')?.email;
    if (!userEmail) {
      throw new Error("E-Mail des Bewerbers konnte nicht aus der Typeform-Antwort extrahiert werden.");
    }

    // 2. Suche in Directus nach dem Eintrag (mit Wartezeit, falls der Webhook langsam ist)
    let application = null;
    for (let i = 0; i < 5; i++) { // Versuche es 5 Mal (insgesamt ca. 5 Sekunden)
      const directusSearchUrl = `${directusUrl}/items/applications?filter[email][_eq]=${encodeURIComponent(userEmail)}&limit=1`;
      const directusResponse = await fetch(directusSearchUrl, {
          headers: { 'Authorization': `Bearer ${directusToken}` }
      });
      if (!directusResponse.ok) throw new Error('Fehler bei der Abfrage der Directus-API');

      const directusData = await directusResponse.json();

      if (directusData.data && directusData.data.length > 0) {
        application = directusData.data[0];
        break; // Eintrag gefunden, Schleife beenden
      }
      await delay(1000); // 1 Sekunde warten und erneut versuchen
    }

    if (!application) {
      return NextResponse.json({ message: 'Bewerbung in Directus nicht gefunden (Webhook war möglicherweise zu langsam)' }, { status: 404 });
    }

    // 3. Gib die benötigten Daten zurück
    return NextResponse.json(application, { status: 200 });

  } catch (error: unknown) {
    console.error("Fehler in /api/get-response-data:", error);
    let message = 'Interner Serverfehler';
    if (
      error &&
      typeof error === 'object' &&
      'message' in error &&
      typeof (error as { message?: unknown }).message === 'string'
    ) {
      message = (error as { message: string }).message;
    }
    return NextResponse.json({ message }, { status: 500 });
  }
}