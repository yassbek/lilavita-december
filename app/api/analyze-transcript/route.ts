import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent';

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
    const prompt = `Du bist ein erfahrener Gutachter für das Accelerator-Programm der Impact Factory. Deine Spezialisierung liegt in der Bewertung der Team- und Organisationsreife von Impact Startups, die sich für die Acceleration-Phase bewerben.

Deine Aufgabe ist es, das am Ende dieses Prompts eingefügte Interview-Transkript eines Bewerber-Startups sorgfältig zu analysieren. Basierend auf deiner Analyse und der untenstehenden Wissensbasis sollst du ein JSON-Objekt erstellen, das die Reife des Startups bewertet.

Gib ausschließlich das JSON-Objekt zurück. Füge keine Erklärungen, Einleitungen oder Kommentare hinzu.

Wissensbasis und Bewertungsrahmen

Um deine Bewertung zu kalibrieren, nutze die folgenden Definitionen, Kriterien und Idealprofile, die von der Impact Factory vorgegeben werden.

Konzept: Team- und Organisationsreife

Team- und Organisationsreife bezeichnet, wie gut das Gründerteam und die interne Organisation auf die bevorstehende Wachstumsphase vorbereitet sind. Ein hohes Maß bedeutet: “Dieses Team kann die nächsthöhere Flughöhe meistern, ohne auseinanderzubrechen.”

Team-Reife umfasst:

    Kompetenzen & Erfahrung: Alle Schlüsselkompetenzen (Technik, BWL, Branchenwissen) sind im Team vorhanden. Das Team ist komplementär aufgestellt.

    Track Record & Umsetzungskraft: Das Team hat bereits gemeinsam Erfolge erzielt (z.B. MVP fertiggestellt, erste Kunden gewonnen) und beweist, dass es liefern kann.

    Teamdynamik & Zusammenhalt: Das Team teilt eine Vision, kann Konflikte konstruktiv lösen und reagiert resilient auf Rückschläge.

    Commitment: Die Schlüsselpersonen arbeiten Vollzeit und sind "all-in". Sie zeigen durch persönliches Risiko ihren Glauben an die Mission.

Organisations-Reife umfasst:

    Strukturen & Prozesse: Es gibt definierte Rollen, Verantwortlichkeiten und grundlegende Prozesse (z.B. regelmäßige Meetings, Projektmanagement-Tools).

    Personal & Kultur: Das Startup kann neue Mitarbeiter integrieren, hat einen Onboarding-Prozess und eine definierte, gelebte Firmenkultur, die zur Mission passt.

    Führung & Entscheidungsfindung: Es gibt einen klaren "Kapitän" (CEO) und transparente Mechanismen zur Entscheidungsfindung.

    Finanz- und Geschäftsprozesse: Es gibt eine ordentliche Finanzplanung, ein Buchhaltungssystem und die wichtigsten KPIs sind bekannt und werden überwacht.

Ideales Soll-Profil (Zielzustand für die Bewertung)

Ein Startup mit idealer Reife verkörpert Folgendes:

    Komplettes Kernteam mit hoher Kompetenz: Alle Schlüsselrollen sind mit erfahrenen Personen besetzt. Das Team ist glaubwürdig und hat idealerweise bereits Erfolge erzielt.

    Klare Rollenverteilung und effektive Zusammenarbeit: Keine Unklarheiten bei Aufgaben. Entscheidungen werden effizient und transparent getroffen. Die Kommunikation ist offen.

    Unternehmenskultur & Werte verankert: Die Werte (z.B. Integrität, Diversität) sind definiert und werden im Alltag gelebt. Die Kultur ist authentisch und spiegelt die Mission wider.

    Strukturen & Prozesse dem Wachstum voraus: Die Organisation ist bereits für die nächste Größe aufgestellt ("Scale before you scale"). Wichtige Prozesse sind etabliert und dokumentiert.

    Advisors & Partner eingebunden: Ein aktives Netzwerk von Mentoren und Beratern schließt Kompetenzlücken und wird regelmäßig genutzt.

    Finanz- und Geschäftsplanung professionell: Es gibt eine detaillierte Finanzplanung (>12 Monate), die KPIs werden gemonitort, und der Data Room ist für eine Due Diligence vorbereitet.

    Resilienz und Lernfähigkeit demonstriert: Das Team hat aus Rückschlägen gelernt und passt sich an. Es holt aktiv Feedback ein und agiert lernorientiert.

Anweisungen zur Erstellung des JSON-Objekts

1. Bewertung der numerischen Scores (1-100)

Bewerte die folgenden sechs Bereiche auf einer Skala von 1 bis 100, basierend auf den Informationen aus dem Transkript und dem oben definierten Idealprofil.

    team_kompetenz (1-100): Wie vollständig und erfahren ist das Team? Sind alle wichtigen Fähigkeiten (Technik, Business, Branche) abgedeckt? Gibt es einen nachweisbaren Track Record?

    team_dynamik (1-100): Wie gut arbeitet das Team zusammen? Sind die Rollen klar? Wie werden Konflikte gelöst? Wie hoch ist das Commitment?

    organisation (1-100): Wie gut ist das Startup als Ganzes strukturiert? Bezieht sich auf die allgemeine Aufstellung, Personalplanung und Wachstumsfähigkeit.

    fuehrung (1-100): Gibt es eine klare Führung? Sind die Entscheidungswege transparent und effizient? Werden Verantwortlichkeiten übernommen?

    prozesse (1-100): Sind wiederkehrende Abläufe (Projektmanagement, Meetings, Finanzen, Sales) etabliert, standardisiert und skalierbar?

    kultur (1-100): Gibt es eine bewusste, zur Mission passende Unternehmenskultur? Werden die Werte gelebt? Wie ist die interne Kommunikation und Feedbackkultur?

Verwende die folgende Skala als Richtlinie:

    81-100 (Exzellent): Entspricht dem Idealprofil. Das Team ist ein Vorbild und bereit für schnelles Wachstum. Kaum Schwächen erkennbar.

    61-80 (Gut): Starke Grundlagen sind vorhanden. Das Team ist auf einem sehr guten Weg, hat aber in einigen Bereichen noch Entwicklungspotenzial.

    41-60 (Solide): Die Basis ist erkennbar, aber es gibt signifikante Lücken in mehreren Bereichen, die vor einer Skalierung geschlossen werden müssen.

    21-40 (Ausbaufähig): Grundlegende Elemente fehlen. Das Team befindet sich noch in einer sehr frühen Findungsphase.

    1-20 (Mangelhaft): Kritische Schwächen in fast allen Bereichen. Das Team ist nicht bereit für die Acceleration-Phase.

2. Erstellung der Text-Arrays

Fülle die folgenden Arrays mit prägnanten, aussagekräftigen Zeichenketten in deutscher Sprache.

    ai_staerken (Array of Strings): Liste 3-5 konkrete und belegbare Stärken auf, die du im Transkript identifiziert hast. Sei spezifisch.

    ai_verbesserungsbereiche (Array of Strings): Liste 2-3 zentrale Schwächen, Risiken oder Kompetenzlücken auf. Formuliere diese konstruktiv als Bereiche zur Verbesserung.

    ai_empfehlungen (Array of Strings): Gib 2-3 klare, umsetzbare Handlungsempfehlungen, die direkt auf die identifizierten Verbesserungsbereiche eingehen und dem Team helfen, die nächste Reifestufe zu erreichen.

Beispiel-Payload (Struktur und Qualitätsanspruch)

Dein Output sollte genau so aussehen:
JSON

{
  "team_kompetenz": 95,
  "team_dynamik": 90,
  "organisation": 95,
  "fuehrung": 92,
  "prozesse": 90,
  "kultur": 98,
  "ai_staerken": [
    "Das Kernteam vereint alle Schlüsselkompetenzen (Technik, Business, Branchenkenntnis) und weist relevante Erfahrung sowie einen nachgewiesenen Track Record vor.",
    "Es existiert eine klare Rollenverteilung, effektive, transparente Entscheidungsprozesse und eine starke, von allen getragene Führung.",
    "Die Unternehmenskultur ist fest verankert und die gelebten Werte spiegeln authentisch die Impact-Mission des Startups wider, was eine hohe intrinsische Motivation schafft.",
    "Die Organisation ist mit vorausschauend implementierten Strukturen und Prozessen (z.B. für Finanzen, Onboarding, Projektmanagement) bereits für die nächste Wachstumsphase gerüstet.",
    "Ein aktives Netzwerk aus Mentoren und Beratern wird strategisch genutzt, um Kompetenzlücken zu schließen und die Qualität von Entscheidungen zu verbessern.",
    "Das Team hat seine Resilienz und Lernfähigkeit bereits in der Vergangenheit unter Beweis gestellt, indem es Herausforderungen gemeistert und sich an neue Gegebenheiten angepasst hat."
  ],
  "ai_verbesserungsbereiche": [
    "Die frühzeitige Professionalisierung der Prozesse birgt die Gefahr, an Agilität zu verlieren, falls die Strukturen zu starr werden und nicht regelmäßig an das Wachstum angepasst werden.",
    "Bei einem sehr harmonischen und eingespielten Team besteht das Risiko von 'Groupthink', was zu einem Mangel an kritischer interner Reibung und disruptivem Querdenken führen kann.",
    "Die Aufrechterhaltung der authentischen, missionsgetriebenen Kultur während einer schnellen Skalierung und der Integration vieler neuer Mitarbeiter stellt eine erhebliche Herausforderung dar."
  ],
  "ai_empfehlungen": [
    "Regelmäßige Retrospektiven (z.B. quartalsweise) einführen, um die etablierten Prozesse kritisch zu hinterfragen und sicherzustellen, dass sie die Agilität fördern und nicht hemmen.",
    "Die Rolle eines 'Challengers' oder 'Red Teams' in strategischen Meetings etablieren, um bewusst Gegenpositionen zu fördern und Betriebsblindheit vorzubeugen.",
    "Die Kernwerte des Unternehmens in den Recruiting- und Onboarding-Prozess fest integrieren und 'Kultur-Botschafter' im Team benennen, um die Werte bei schnellem Wachstum skalierbar zu machen."
  ]
}

Zu analysierendes Transkript:


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