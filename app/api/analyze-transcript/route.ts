import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// Definieren Sie die Konfigurationen für verschiedene Interview-Typen
const INTERVIEW_CONFIGS = {
    "team-reife": {
        directusCollection: "applications",
        prompt: (transcript) => `Du bist ein erfahrener Gutachter für das Accelerator-Programm der Impact Factory. Deine Spezialisierung liegt in der Bewertung der Team- und Organisationsreife von Impact Startups, die sich für die Acceleration-Phase bewerben.

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
    "Ein aktives Netzwerk aus Mentoren und Beratern schließt Kompetenzlücken und wird regelmäßig genutzt.",
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
${JSON.stringify(transcript, null, 2)}`,
        fields: [
            "team_kompetenz", "team_dynamik", "organisation", "fuehrung", "prozesse", "kultur",
            "ai_staerken", "ai_verbesserungsbereiche", "ai_empfehlungen"
        ],
    },
    "impact": {
        directusCollection: "impact", // Hier wird die neue Collection definiert
        prompt: (transcript) => `Du bist ein erfahrener Gutachter für das Accelerator-Programm der Impact Factory. Deine Spezialisierung liegt in der Bewertung der Impact-Reife von Startups.

Deine Aufgabe ist es, das am Ende dieses Prompts eingefügte Interview-Transkript eines Bewerber-Startups sorgfältig zu analysieren. Basierend auf deiner Analyse sollst du ein JSON-Objekt erstellen, das die Impact-Reife des Startups bewertet.

Gib ausschließlich das JSON-Objekt zurück. Füge keine Erklärungen, Einleitungen oder Kommentare hinzu.

Anweisungen zur Erstellung des JSON-Objekts

Bewerte die folgenden Bereiche auf einer Skala von 1 bis 100, basierend auf den Informationen aus dem Transkript.
- mission_sdg_fit (1-100): Wie stark ist die Verbindung zwischen der Mission des Startups und den UN-Nachhaltigkeitszielen (SDGs)?
- theory_of_change (1-100): Wie klar und nachvollziehbar ist die Theorie des Wandels des Startups?
- kpi_and_data (1-100): Wie gut sind die wichtigsten Impact-KPIs definiert und werden die Daten systematisch erfasst?
- imm_process (1-100): Gibt es einen etablierten Prozess für Impact Measurement and Management?
- reporting_communication (1-100): Wie transparent und effektiv ist die Kommunikation über den erzielten Impact?
- continuous_improvement (1-100): Wie wird der Impact-Messprozess kontinuierlich verbessert?

Zusätzlich erstelle die folgenden Arrays mit prägnanten, aussagekräftigen Zeichenketten in deutscher Sprache:
- ai_staerken (Array of Strings): Liste 3-5 konkrete und belegbare Stärken auf, die du im Transkript identifiziert hast.
- ai_verbesserungsbereiche (Array of Strings): Liste 2-3 zentrale Schwächen, Risiken oder Kompetenzlücken auf.
- ai_empfehlungen (Array of Strings): Gib 2-3 klare, umsetzbare Handlungsempfehlungen, die direkt auf die identifizierten Verbesserungsbereiche eingehen.

Zu analysierendes Transkript:
${JSON.stringify(transcript, null, 2)}`,
        fields: [
            "mission_sdg_fit", "theory_of_change", "kpi_and_data",
            "imm_process", "reporting_communication", "continuous_improvement",
            "ai_staerken", "ai_verbesserungsbereiche", "ai_empfehlungen"
        ],
    },
    "finanzierung": { // Neuer Eintrag für das Finanzierungs-Interview
        directusCollection: "financing", // Die Collection, die Sie erstellt haben
        prompt: (transcript) => `Du bist ein erfahrener Gutachter für das Accelerator-Programm der Impact Factory. Deine Spezialisierung liegt in der Bewertung der Finanzierungsreife von Impact Startups, die sich für die Acceleration-Phase bewerben.

Deine Aufgabe ist es, das am Ende dieses Prompts eingefügte Interview-Transkript eines Bewerber-Startups sorgfältig zu analysieren. Basierend auf deiner Analyse und der untenstehenden Wissensbasis sollst du ein JSON-Objekt erstellen, das die Finanzierungsreife des Startups bewertet.

Gib ausschließlich das JSON-Objekt zurück. Füge keine Erklärungen, Einleitungen oder Kommentare hinzu.

Wissensbasis und Bewertungsrahmen für Finanzierungsreife:

Ein Startup mit idealer Finanzierungsreife verkörpert Folgendes:
- Klare Finanzierungsstrategie: Bewusste Entscheidung für/gegen Venture Case, definierter Kapitalbedarf (12-18 Monate) und klare Ziele für die Runde.
- Intelligenter Kapitalmix: Begründete Auswahl aus Equity, Fremdkapital, Blended Finance, Förder- und philanthropischen Mitteln.
- Fundiertes Finanzmodell: Bottom-Up Forecast, Szenarienanalyse, Kenntnis wichtiger Finanz-KPIs (MRR, Burn Rate, CAC, LTV, Cash Runway).
- Wirkungsmessung & Reporting: Messung des gesellschaftlichen Impacts nach IRIS+, GIIRS oder EVPA-Rahmenwerk, regelmäßiges Wirkungsreporting an Investoren.
- Sauberes Cap Table Setup: Keine Dead Equity, Gründerteam hält noch über 80% der Anteile, aktives Cap Table Management.
- Investor Alignment: Klare Vorstellung von passenden Impact-Investoren und Kapitalgebern.
- Post-Raising & Exit-Strategie: Strukturierte Meilensteinplanung, Follow-Up-Runden-Vorbereitung, realistische Exit-Strategie.
- Risikobewältigung: Erkennen von Risiken für die Finanzierungsstrategie und klare Maßnahmen zu deren Bewältigung.

Anweisungen zur Erstellung des JSON-Objekts

1. Bewertung der numerischen Scores (1-100):

Bewerte die folgenden Bereiche auf einer Skala von 1 bis 100, basierend auf den Informationen aus dem Transkript und dem oben definierten Idealprofil.

- financing_strategy_score (1-100): Wie klar und fundiert ist die Finanzierungsstrategie für die nächsten 18 Monate?
- capital_mix_score (1-100): Wie passend ist der geplante Kapitalmix und wie gut ist er begründet?
- financial_kpis_score (1-100): Wie gut werden Finanz-KPIs zur Steuerung genutzt und ist der Finanzplan fundiert?
- impact_kpis_score (1-100): Wie systematisch wird der Impact gemessen und berichtet?
- cap_table_score (1-100): Wie sauber ist die Cap Table Struktur und das Management?
- investor_alignment_score (1-100): Wie klar ist die Vorstellung von passenden Investoren und deren Ansprache?
- risk_strategy_score (1-100): Wie gut werden Risiken für die Finanzierungsstrategie erkannt und adressiert?

Verwende die folgende Skala als Richtlinie:
    81-100 (Exzellent): Entspricht dem Idealprofil. Kaum Schwächen erkennbar.
    61-80 (Gut): Starke Grundlagen sind vorhanden, aber noch Entwicklungspotenzial.
    41-60 (Solide): Basis erkennbar, aber signifikante Lücken.
    21-40 (Ausbaufähig): Grundlegende Elemente fehlen.
    1-20 (Mangelhaft): Kritische Schwächen in fast allen Bereichen.

2. Erstellung der Text-Arrays:

Fülle die folgenden Arrays mit prägnanten, aussagekräftigen Zeichenketten in deutscher Sprache.

- ai_staerken (Array of Strings): Liste 3-5 konkrete und belegbare Stärken auf, die du im Transkript identifiziert hast.
- ai_verbesserungsbereiche (Array of Strings): Liste 2-3 zentrale Schwächen oder Risiken.
- ai_empfehlungen (Array of Strings): Gib 2-3 klare, umsetzbare Handlungsempfehlungen.

Zu analysierendes Transkript:
${JSON.stringify(transcript, null, 2)}`,
        fields: [
            "financing_strategy_score", "capital_mix_score", "financial_kpis_score",
            "impact_kpis_score", "cap_table_score", "investor_alignment_score", "risk_strategy_score",
            "ai_staerken", "ai_verbesserungsbereiche", "ai_empfehlungen"
        ],
    },
    "marketing": { // Neuer Eintrag für das Marketing-Interview
        directusCollection: "marketing", // Die Collection, die Sie erstellt haben
        prompt: (transcript) => `Du bist ein erfahrener Gutachter für das Accelerator-Programm der Impact Factory. Deine Spezialisierung liegt in der Bewertung der Marketingreife von Impact Startups, die sich für die Acceleration-Phase bewerben.

Deine Aufgabe ist es, das am Ende dieses Prompts eingefügte Interview-Transkript eines Bewerber-Startups sorgfältig zu analysieren. Basierend auf deiner Analyse und der untenstehenden Wissensbasis sollst du ein JSON-Objekt erstellen, das die Marketingreife des Startups bewertet.

Gib ausschließlich das JSON-Objekt zurück. Füge keine Erklärungen, Einleitungen oder Kommentare hinzu.

Wissensbasis und Bewertungsrahmen für Marketingreife:

Ein Startup mit idealer Marketingreife verkörpert Folgendes:
- Klare Purpose-Kommunikation: Die Mission und Werte des Startups werden klar, authentisch und überzeugend kommuniziert (z.B. Golden Circle, Storytelling).
- Präzise Marktpositionierung: Das Startup hat seinen Zielmarkt segmentiert, die Zielgruppen klar definiert und sich einzigartig positioniert (STP-Modell).
- Effektive Wachstumsstrategien: Es werden datengetriebene Experimente und schnelle Iterationen zur Nutzergewinnung und -bindung eingesetzt (Growth Hacking, Pirate Metrics).
- Ganzheitlicher Marketing-Mix: Alle Aspekte des Angebots (Produkt, Preis, Vertrieb, Kommunikation, Menschen, Prozesse, physische Nachweise) werden systematisch und kundenorientiert betrachtet (7Ps).
- Starke Wettbewerbsdifferenzierung: Das Startup hebt sich klar vom Wettbewerb ab, idealerweise durch die Schaffung neuer, unbestrittener Märkte (Blue Ocean Strategy).
- Datengetriebene Analyse: Marketingaktivitäten werden kontinuierlich durch die Analyse relevanter Metriken und Diagnoseinstrumente verbessert.
- Authentische Markenführung: Die Marke ist glaubwürdig und baut langfristiges Vertrauen auf, indem sie ihre Werte konsequent lebt.

Anweisungen zur Erstellung des JSON-Objekts:

1. Bewertung der numerischen Scores (1-100):

Bewerte die folgenden Bereiche auf einer Skala von 1 bis 100, basierend auf den Informationen aus dem Transkript und dem oben definierten Idealprofil.

- purpose_communication_score (1-100): Wie klar und überzeugend wird die Mission kommuniziert?
- market_positioning_score (1-100): Wie präzise ist die Marktsegmentierung und Positionierung?
- growth_strategy_score (1-100): Wie effektiv sind die Wachstumsstrategien und die Experimentierkultur?
- marketing_mix_score (1-100): Wie ganzheitlich und kundenorientiert ist der Marketing-Mix?
- competitive_differentiation_score (1-100): Wie stark ist die Wettbewerbsdifferenzierung und Innovationsfähigkeit?
- data_analytics_score (1-100): Wie gut werden Daten zur Marketingoptimierung genutzt?
- brand_authenticity_score (1-100): Wie authentisch und vertrauenswürdig ist die Markenführung?

Verwende die folgende Skala als Richtlinie:
    81-100 (Exzellent): Entspricht dem Idealprofil. Kaum Schwächen erkennbar.
    61-80 (Gut): Starke Grundlagen sind vorhanden, aber noch Entwicklungspotenzial.
    41-60 (Solide): Basis erkennbar, aber signifikante Lücken.
    21-40 (Ausbaufähig): Grundlegende Elemente fehlen.
    1-20 (Mangelhaft): Kritische Schwächen in fast allen Bereichen.

2. Erstellung der Text-Arrays:

Fülle die folgenden Arrays mit prägnanten, aussagekräftigen Zeichenketten in deutscher Sprache.

- ai_staerken (Array of Strings): Liste 3-5 konkrete und belegbare Stärken auf, die du im Transkript identifiziert hast.
- ai_verbesserungsbereiche (Array of Strings): Liste 2-3 zentrale Schwächen oder Risiken.
- ai_empfehlungen (Array of Strings): Gib 2-3 klare, umsetzbare Handlungsempfehlungen.

Zu analysierendes Transkript:
${JSON.stringify(transcript, null, 2)}`,
        fields: [
            "purpose_communication_score", "market_positioning_score", "growth_strategy_score",
            "marketing_mix_score", "competitive_differentiation_score", "data_analytics_score",
            "brand_authenticity_score",
            "ai_staerken", "ai_verbesserungsbereiche", "ai_empfehlungen"
        ],
    },
};

export async function POST(request: NextRequest) {
    try {
        const { transcript, applicationId } = await request.json();
        if (!transcript || !applicationId) {
            return NextResponse.json({ error: 'Missing transcript or applicationId' }, { status: 400 });
        }

        const { searchParams } = new URL(request.url);
        const interviewType = searchParams.get("type") || "team-reife";

        const config = INTERVIEW_CONFIGS[interviewType];
        if (!config) {
            return NextResponse.json({ error: 'Invalid interview type' }, { status: 400 });
        }

        // Dynamischer Prompt-Aufbau
        const finalPrompt = config.prompt(transcript);

        // Gemini-API-Aufruf
        const geminiRes = await fetch(GEMINI_API_URL + `?key=${process.env.GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: finalPrompt }] }]
                })
            }
        );
        const geminiData = await geminiRes.json();
        console.log('Gemini raw response:', geminiData);

        // Extract JSON from Gemini response
        let scores: { [key: string]: unknown } = {};
        try {
            const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
            scores = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
        } catch {
            console.error('Failed to parse Gemini response:', geminiData);
            return NextResponse.json({ error: 'Failed to parse Gemini response' }, { status: 500 });
        }

        // Prepare the payload for Directus dynamically
        const directusPayload: { [key: string]: unknown } = {
            transcript: transcript
        };
        config.fields.forEach(field => {
            if (scores[field] !== undefined) {
                directusPayload[field] = scores[field];
            }
        });
        
        // Füge die applications_id zur Payload hinzu, falls es eine neue Collection ist
        if (interviewType === "impact" || interviewType === "finanzierung" || interviewType === "marketing") {
             directusPayload.applications_id = applicationId;
        }

        const directusToken = process.env.NEXT_PUBLIC_DIRECTUS_TOKEN || process.env.DIRECTUS_STATIC_TOKEN;

        // Je nach Interview-Typ wird entweder eine bestehende Anwendung aktualisiert (PATCH)
        // oder ein neuer Eintrag in der spezifischen Collection erstellt (POST)
        let directusRes;
        if (interviewType === "impact" || interviewType === "finanzierung" || interviewType === "marketing") {
            const directusUrl = `${process.env.NEXT_PUBLIC_DIRECTUS_URL || process.env.DIRECTUS_URL}/items/${config.directusCollection}`;
            directusRes = await fetch(directusUrl, {
                method: 'POST', // POST für das Erstellen eines neuen Eintrags
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${directusToken}`
                },
                body: JSON.stringify(directusPayload)
            });
        } else {
            const directusUrl = `${process.env.NEXT_PUBLIC_DIRECTUS_URL || process.env.DIRECTUS_URL}/items/applications/${applicationId}`;
            directusRes = await fetch(directusUrl, {
                method: 'PATCH', // PATCH für die Aktualisierung eines bestehenden Eintrags
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${directusToken}`
                },
                body: JSON.stringify(directusPayload)
            });
        }
        
        const directusData = await directusRes.json();
        console.log('Directus response:', directusData);

        if (!directusRes.ok) {
            return NextResponse.json({ error: 'Failed to write to Directus', directusData }, { status: directusRes.status });
        }

        return NextResponse.json({ scores, directus: directusData, gemini: geminiData });
    } catch (error) {
        console.error('Error in /api/analyze-transcript:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
