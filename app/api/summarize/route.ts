// app/api/summarize/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createDirectus, staticToken, rest, updateItem } from '@directus/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// KEINE PDF-BIBLIOTHEKEN MEHR NÖTIG!
// Wir entfernen pdf-parse, pdfjs-dist etc.

export const runtime = 'nodejs';

const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
const directusToken = process.env.NEXT_PUBLIC_DIRECTUS_TOKEN;
const geminiApiKey = process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    if (!directusUrl || !directusToken) {
      return NextResponse.json(
        { message: 'Directus URL oder privater Token ist serverseitig nicht konfiguriert.' },
        { status: 500 }
      );
    }
    if (!geminiApiKey) {
      return NextResponse.json(
        { message: 'GEMINI_API_KEY ist serverseitig nicht konfiguriert.' },
        { status: 500 }
      );
    }

    const { fileId, applicationId } = await req.json();
    if (!fileId || !applicationId) {
      return NextResponse.json({ message: 'File ID oder Application ID fehlt.' }, { status: 400 });
    }

    const directus = createDirectus(directusUrl).with(staticToken(directusToken)).with(rest());

    // Schritt 1: Datei als Buffer von Directus laden (dieser Teil bleibt gleich)
    const assetUrl = `${directusUrl}/assets/${fileId}`;
    const fileResponse = await fetch(assetUrl, {
      headers: { Authorization: `Bearer ${directusToken}` },
      cache: 'no-store',
    });

    if (!fileResponse.ok) {
      return NextResponse.json(
        { message: `Fehler beim Herunterladen der Datei: ${fileResponse.statusText}` },
        { status: 500 }
      );
    }
    const fileArrayBuffer = await fileResponse.arrayBuffer();
    
    // Schritt 2: Den Buffer in das für Gemini nötige Format umwandeln
    const fileBuffer = Buffer.from(fileArrayBuffer);
    const base64EncodedData = fileBuffer.toString('base64');
    
    const filePart = {
      inlineData: {
        data: base64EncodedData,
        mimeType: 'application/pdf',
      },
    };

    // Schritt 3: Gemini initialisieren und Prompt vorbereiten
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
Du bist ein erfahrener Startup-Analyst für einen deutschen Accelerator namens "Impact Factory".
Analysiere das beigefügte PDF-Pitchdeck und erstelle eine prägnante Zusammenfassung auf Deutsch.
Fokussiere dich auf folgende Punkte:
- Problem: Welches Problem wird adressiert?
- Lösung: Was ist die vorgeschlagene Lösung?
- Geschäftsmodell: Wie verdient das Startup Geld?
- Zielmarkt/Kundensegmente: Wer sind die Kunden?
- Impact: Welchen sozialen oder ökologischen Mehrwert schafft das Startup?
Gib nur den Fließtext der Zusammenfassung zurück, ohne Einleitung oder Überschriften.
`;
    
    // Schritt 4: Den Prompt und die Datei an Gemini senden
    const result = await model.generateContent([prompt, filePart]);
    const summary = result.response.text().trim();
    
    if (!summary) {
        throw new Error("Gemini konnte keine Zusammenfassung aus dem PDF erstellen.");
    }

    // Schritt 5: Zusammenfassung in Directus speichern
    await directus.request(
      updateItem('applications', applicationId, {
        pitchdeck: fileId,
        pitchdeck_summary: summary,
      })
    );

    return NextResponse.json(
      { message: 'Zusammenfassung erfolgreich erstellt und gespeichert.' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Ein Fehler in der /api/summarize Route ist aufgetreten:", error);
    return NextResponse.json(
      {
        message: 'Ein interner Serverfehler ist aufgetreten.',
        error: error?.message ?? String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Summarize API ist erreichbar und bereit',
    timestamp: new Date().toISOString(),
  });
}