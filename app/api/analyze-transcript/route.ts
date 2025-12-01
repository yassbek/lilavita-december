// Speicherort: src/app/api/analyze-transcript/route.ts

import { NextResponse } from 'next/server';

// ==================================================================
// 1. TYPE DEFINITIONS
// ==================================================================

interface QuizAnswer {
  text: string;
  isCorrect: boolean;
}

interface Quiz {
  question: string;
  answers: QuizAnswer[];
}

interface LearningModule {
  icon: string;
  title: string;
  description: string;
  content: string[];
  quiz: Quiz;
}

interface TopicConfig {
  systemPrompt: string;
  fallbackModules: LearningModule[];
  fallbackOverview?: string;
}

// ==================================================================
// 2. THEMEN-SPEZIFISCHE KONFIGURATIONEN
// ==================================================================

const topicConfigs: Record<string, TopicConfig> = {

  // ─────────────────────────────────────────────────────────────────
  // B-VITAMINE
  // ─────────────────────────────────────────────────────────────────
  'pharmacy_b_vitamins': {
    systemPrompt: `Du bist ein erfahrener Apotheken-Coach für B-Vitamine. Analysiere das folgende Beratungsgespräch zwischen einem Apothekenmitarbeiter und einem Kunden.

FACHWISSEN B-VITAMINE:
- B-Vitamine sind wasserlöslich und arbeiten synergistisch als "Familie"
- B12-Mangel: Besonders bei Veganern, Vegetariern, älteren Menschen, PPI-Einnahme (Säureblocker hemmen B12-Aufnahme)
- Folsäure (B9): Essenziell bei Kinderwunsch, bioaktives Folat (5-MTHF) umgeht Enzymdefekte
- B2 (Riboflavin): Hochdosis (400mg) zur Migräne-Prophylaxe, färbt Urin neongelb (harmlos!)
- Biotin (B7): Für Haut, Haare, Nägel - fördert Nagelwachstum bei Nagelpilz
- B5 (Pantothensäure): Rolle im Fettstoffwechsel, relevant bei Akne
- Risikogruppen: Veganer, Senioren, Stressgeplagte, Sportler, Medikamenteneinnahme (PPI, Metformin)
- Überschüsse werden meist ausgeschieden (wasserlöslich = gute Verträglichkeit)

Identifiziere basierend auf dem Gespräch:
1. Welche Themen wurden gut erklärt?
2. Welche Wissenslücken zeigten sich?
3. Welche Zusatzverkäufe wurden verpasst?

Erstelle genau 4 personalisierte Lernmodule zu B-Vitaminen, die auf die Gesprächsanalyse zugeschnitten sind.

Antworte AUSSCHLIESSLICH mit einem JSON-Array. Format:
[
  {
    "icon": "Zap" | "Pill" | "Brain" | "Activity" | "Baby" | "Sun",
    "title": "Titel des Moduls",
    "description": "Kurze Beschreibung was gelernt wird",
    "content": [
      "<b>Punkt 1:</b> Erklärung...",
      "<b>Punkt 2:</b> Erklärung...",
      "<b>Punkt 3:</b> Erklärung..."
    ],
    "quiz": {
      "question": "Praxisnahe Quizfrage aus dem HV-Alltag",
      "answers": [
        { "text": "Antwort A", "isCorrect": false },
        { "text": "Antwort B", "isCorrect": true },
        { "text": "Antwort C", "isCorrect": false }
      ]
    }
  }
]

Wichtig: Genau eine Antwort muss "isCorrect": true haben. Die Icons müssen aus der Liste stammen.

Wenn "includeOverview" angefordert ist, füge ein Feld "overview" zum JSON-Objekt hinzu (nicht im Array, sondern als Wrapper: { "modules": [...], "overview": "..." }).
Der Overview soll eine kurze Zusammenfassung der wichtigsten Learnings aus dem Gespräch sein (max 3 Sätze).`,

    fallbackModules: [
      {
        icon: "Zap",
        title: "Basiswissen: Der B-Komplex",
        description: "Verstehe die Synergien der 'B-Familie'.",
        content: [
          "<b>Die Familie:</b> B-Vitamine sind wasserlöslich und arbeiten synergistisch.",
          "<b>Beratungs-Tipp:</b> Riboflavin (B2) färbt den Urin neongelb – harmlos.",
          "<b>Sicherheit:</b> Überschüsse werden meist einfach ausgeschieden.",
        ],
        quiz: {
          question: "Ein Kunde kommt besorgt zurück: Sein Urin ist neongelb. Deine Reaktion?",
          answers: [
            { text: "Das Präparat wurde nicht aufgenommen.", isCorrect: false },
            { text: "Beruhigen: Das kommt vom Vitamin B2 und ist harmlos.", isCorrect: true },
            { text: "Sofort absetzen, Verdacht auf Allergie.", isCorrect: false },
          ],
        },
      },
      {
        icon: "Pill",
        title: "Indikationen & Risikogruppen",
        description: "Wann ist ein B-Komplex besonders wichtig?",
        content: [
          "<b>Medikamente:</b> PPI (Säureblocker) hemmen die B12-Aufnahme.",
          "<b>Migräne:</b> B2 (400 mg) kann prophylaktisch positiv wirken.",
          "<b>Veganer:</b> B12-Supplementierung ist essenziell.",
        ],
        quiz: {
          question: "Welches B-Vitamin wird zur Migräne-Prophylaxe (Hochdosis) empfohlen?",
          answers: [
            { text: "Vitamin B1", isCorrect: false },
            { text: "Vitamin B12", isCorrect: false },
            { text: "Vitamin B2 (Riboflavin)", isCorrect: true },
          ],
        },
      },
      {
        icon: "Sun",
        title: "Haut, Haare & Nägel",
        description: "B-Vitamine in der Dermatologie.",
        content: [
          "<b>Nagelpilz:</b> Biotin fördert das Herauswachsen des gesunden Nagels.",
          "<b>Akne:</b> B5 spielt eine Rolle im Fettstoffwechsel.",
          "<b>Regeneration:</b> Biotin unterstützt die Zellerneuerung.",
        ],
        quiz: {
          question: "Warum empfiehlt man Biotin begleitend bei Nagelpilz?",
          answers: [
            { text: "Es tötet den Pilz direkt ab.", isCorrect: false },
            { text: "Es beschleunigt das Nagelwachstum für gesunden Nachwuchs.", isCorrect: true },
            { text: "Es verhindert die Ansteckung anderer Nägel.", isCorrect: false },
          ],
        },
      },
      {
        icon: "Baby",
        title: "Kinderwunsch & Folsäure",
        description: "Folsäure vs. bioaktives Folat verstehen.",
        content: [
          "<b>Schutz:</b> Senkt das Risiko für Neuralrohrdefekte.",
          "<b>Genetik:</b> Viele Frauen können synthetische Folsäure nicht optimal umwandeln.",
          "<b>Lösung:</b> Bioaktives Folat (5-MTHF) direkt verwertbar.",
        ],
        quiz: {
          question: "Was ist der Vorteil von bioaktivem Folat (5-MTHF)?",
          answers: [
            { text: "Es umgeht Enzymdefekte und ist direkt verfügbar.", isCorrect: true },
            { text: "Es ist günstiger als synthetische Folsäure.", isCorrect: false },
            { text: "Es muss seltener eingenommen werden.", isCorrect: false },
          ],
        },
      },
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // MAGNESIUMCITRAT
  // ─────────────────────────────────────────────────────────────────
  'pharmacy_magnesium': {
    systemPrompt: `Du bist ein erfahrener Apotheken-Coach für Magnesiumcitrat 130. Analysiere das folgende Beratungsgespräch zwischen einem Apothekenmitarbeiter und einem Kunden.

FACHWISSEN MAGNESIUMCITRAT 130:
- Citratform: Besonders hohe Bioverfügbarkeit im Vergleich zu Oxid oder Carbonat
- Apothekenqualität: Garantierte Reinheit, Verträglichkeit, geprüfte Qualität
- Hauptindikationen: Wadenkrämpfe, Muskelverspannungen, Stress, Erschöpfung
- Zielgruppen:
  * Patienten mit nächtlichen Wadenkrämpfen
  * Ältere Menschen mit Diuretika-Einnahme (erhöhter Magnesiumverlust!)
  * Sportler (erhöhter Bedarf durch Schwitzen)
  * Stressgeplagte (Magnesium = "Anti-Stress-Mineral")
  * Schwangere (erhöhter Bedarf)
- Einwandbehandlung Preis: "Günstige Produkte enthalten oft Magnesiumoxid mit schlechterer Bioverfügbarkeit"
- Einwandbehandlung "Ich esse gesund": "Auch bei gesunder Ernährung kann der Bedarf durch Stress, Medikamente oder Sport erhöht sein"
- Cross-Selling: B-Vitamine (Energiestoffwechsel), Q10 (Herzmuskel), Calcium (Knochen)
- Wirkung: Unterstützt Muskel- und Nervenfunktion, Energiestoffwechsel, Elektrolytgleichgewicht

Identifiziere basierend auf dem Gespräch:
1. Wurden Zielgruppen richtig erkannt?
2. Wurden Verkaufsargumente (Citratform, Qualität) genannt?
3. Wurden Kundeneinwände souverän beantwortet?
4. Wurden Cross-Selling-Chancen genutzt?

Erstelle genau 4 personalisierte Lernmodule, die auf die Gesprächsanalyse zugeschnitten sind.

Antworte AUSSCHLIESSLICH mit einem JSON-Array. Format:
[
  {
    "icon": "ShieldCheck" | "Users" | "Target" | "Zap" | "Heart" | "Activity",
    "title": "Titel des Moduls",
    "description": "Kurze Beschreibung was gelernt wird",
    "content": [
      "<b>Punkt 1:</b> Erklärung...",
      "<b>Punkt 2:</b> Erklärung...",
      "<b>Punkt 3:</b> Erklärung..."
    ],
    "quiz": {
      "question": "Praxisnahe Quizfrage aus dem HV-Alltag",
      "answers": [
        { "text": "Antwort A", "isCorrect": false },
        { "text": "Antwort B", "isCorrect": true },
        { "text": "Antwort C", "isCorrect": false }
      ]
    }
  }
]

Wichtig: Genau eine Antwort muss "isCorrect": true haben.

Wenn "includeOverview" angefordert ist, füge ein Feld "overview" zum JSON-Objekt hinzu (nicht im Array, sondern als Wrapper: { "modules": [...], "overview": "..." }).
Der Overview soll eine kurze Zusammenfassung der wichtigsten Learnings aus dem Gespräch sein (max 3 Sätze).`,

    fallbackModules: [
      {
        icon: "ShieldCheck",
        title: "Vertiefung: Produktvorteile",
        description: "Stärke deine Argumentation für Magnesiumcitrat 130.",
        content: [
          "<b>Citratform:</b> Hat eine besonders hohe Bioverfügbarkeit im Vergleich zu Oxid.",
          "<b>Reinheit:</b> Apothekenqualität garantiert geprüfte Reinheit.",
          "<b>Wirkung:</b> Ein Allrounder für Muskeln, Nerven und Energie.",
        ],
        quiz: {
          question: "Ein Kunde fragt nach dem Unterschied zu günstigen Drogerie-Produkten. Was ist dein stärkstes Argument?",
          answers: [
            { text: "Die Citratform ist für den Körper besonders gut verfügbar.", isCorrect: true },
            { text: "Unsere Packung sieht hochwertiger aus.", isCorrect: false },
            { text: "Das Produkt ist einfach teurer, also besser.", isCorrect: false },
          ],
        },
      },
      {
        icon: "Users",
        title: "Training: Zielgruppen erkennen",
        description: "Lerne, proaktiv die Kunden zu identifizieren, die am meisten profitieren.",
        content: [
          "<b>Wadenkrämpfe:</b> Ein klassisches Anzeichen für Magnesiummangel.",
          "<b>Diuretika-Einnahme:</b> Erhöhter Magnesiumverlust über die Niere.",
          "<b>Stress & Sport:</b> Aktive Menschen und Gestresste verbrauchen mehr.",
        ],
        quiz: {
          question: "Eine ältere Dame, die Diuretika nimmt, ist eine Zielgruppe, weil...",
          answers: [
            { text: "...Diuretika den Magnesiumverlust über die Niere erhöhen.", isCorrect: true },
            { text: "...ältere Menschen generell immer Magnesium brauchen.", isCorrect: false },
            { text: "...Diuretika die Magnesiumaufnahme im Darm hemmen.", isCorrect: false },
          ],
        },
      },
      {
        icon: "Target",
        title: "Einwandbehandlung meistern",
        description: "Souverän auf Kundeneinwände reagieren.",
        content: [
          "<b>Preis-Einwand:</b> Bioverfügbarkeit und Qualität betonen.",
          "<b>'Ich esse gesund':</b> Erhöhter Bedarf bei Stress, Sport, Medikamenten erklären.",
          "<b>Skepsis:</b> Konkrete Zielgruppen und Studien nennen.",
        ],
        quiz: {
          question: "Ein Kunde sagt: 'Ich nehme doch Gemüse, brauche ich das wirklich?' Deine beste Antwort?",
          answers: [
            { text: "Nein, dann brauchen Sie das wahrscheinlich nicht.", isCorrect: false },
            { text: "Auch bei gesunder Ernährung kann der Bedarf durch Stress oder Sport erhöht sein.", isCorrect: true },
            { text: "Gemüse enthält kein Magnesium, daher unbedingt supplementieren.", isCorrect: false },
          ],
        },
      },
      {
        icon: "Zap",
        title: "Cross-Selling Chancen",
        description: "Zusatzverkäufe sinnvoll platzieren.",
        content: [
          "<b>B-Vitamine:</b> Synergistisch für den Energiestoffwechsel.",
          "<b>Q10:</b> Unterstützt den Herzmuskel, besonders bei Senioren.",
          "<b>Calcium:</b> In Kombination für Knochen und Muskeln.",
        ],
        quiz: {
          question: "Welches Produkt ergänzt Magnesium sinnvoll für den Energiestoffwechsel?",
          answers: [
            { text: "Vitamin D", isCorrect: false },
            { text: "B-Vitamine", isCorrect: true },
            { text: "Zink", isCorrect: false },
          ],
        },
      },
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // PERENTEROL (SACCHAROMYCES BOULARDII)
  // ─────────────────────────────────────────────────────────────────
  'pharmacy_perenterol': {
    systemPrompt: `Du bist ein erfahrener Apotheken-Coach für Perenterol forte 250 mg. Analysiere das folgende Beratungsgespräch zwischen einem Apothekenmitarbeiter und einem Kunden.

FACHWISSEN PERENTEROL FORTE 250 MG (Saccharomyces boulardii):
- Wirkstoff: Trockenhefe aus Saccharomyces boulardii, mind. 1,8 × 10^10 lebensfähige Zellen/g
- Wirkmechanismus: 
  * Bindet pathogene Bakterien (Fimbrien-Bindung)
  * Hemmt Wachstum von E. coli, Salmonellen, Clostridium difficile, Candida
  * Erhöht Aktivität der Darm-Disaccharidasen (Laktase, Maltase, Saccharase)
  * Stärkt sekretorisches IgA im Darm

INDIKATIONEN:
- Akute Diarrhöen (symptomatische Behandlung)
- Reisediarrhöe (Vorbeugung: 5 Tage vor Abreise beginnen!)
- Sondenernährungsbedingte Diarrhöen
- Adjuvant bei chronischer Akne

DOSIERUNG:
- Akute Diarrhöe: 1-2x täglich 1 Kapsel (250-500mg)
- Reiseprophylaxe: 1-2x täglich 1 Kapsel, 5 Tage VOR Abreise beginnen
- Akne: 3x täglich 1 Kapsel
- Ab 2 Jahren zugelassen

WICHTIGE KONTRAINDIKATIONEN:
- Hefeallergie
- Zentraler Venenkatheter (Fungämie-Risiko!)
- Immunsupprimierte Patienten
- Schwerkranke Patienten

WECHSELWIRKUNGEN:
- Antimykotika (Pilzmittel) beeinträchtigen die Wirkung!
- Nicht mit Alkohol einnehmen
- Nicht zu heiß (>50°C) oder eisgekühlt einnehmen

WICHTIGE BERATUNGSHINWEISE:
- Kapsel NICHT durch Blister drücken (bricht!) - Folie abziehen
- Bei Durchfall >2 Tage oder Blut/Fieber: Arzt aufsuchen
- Flüssigkeits- und Elektrolytersatz wichtig, besonders bei Kindern
- Enthält Lactose
- Schwangerschaft/Stillzeit: Keine Daten, daher nicht empfohlen

Identifiziere basierend auf dem Gespräch:
1. Wurden Indikationen korrekt erkannt?
2. Wurden Kontraindikationen abgefragt?
3. Wurden wichtige Beratungshinweise gegeben?
4. War die Dosierungsempfehlung korrekt?

Erstelle genau 4 personalisierte Lernmodule, die auf die Gesprächsanalyse zugeschnitten sind.

Antworte AUSSCHLIESSLICH mit einem JSON-Array. Format:
[
  {
    "icon": "Shield" | "Pill" | "AlertTriangle" | "Plane" | "Users" | "Activity",
    "title": "Titel des Moduls",
    "description": "Kurze Beschreibung was gelernt wird",
    "content": [
      "<b>Punkt 1:</b> Erklärung...",
      "<b>Punkt 2:</b> Erklärung...",
      "<b>Punkt 3:</b> Erklärung..."
    ],
    "quiz": {
      "question": "Praxisnahe Quizfrage aus dem HV-Alltag",
      "answers": [
        { "text": "Antwort A", "isCorrect": false },
        { "text": "Antwort B", "isCorrect": true },
        { "text": "Antwort C", "isCorrect": false }
      ]
    }
  }
]

Wichtig: Genau eine Antwort muss "isCorrect": true haben.

Wenn "includeOverview" angefordert ist, füge ein Feld "overview" zum JSON-Objekt hinzu (nicht im Array, sondern als Wrapper: { "modules": [...], "overview": "..." }).
Der Overview soll eine kurze Zusammenfassung der wichtigsten Learnings aus dem Gespräch sein (max 3 Sätze).`,

    fallbackModules: [
      {
        icon: "Shield",
        title: "Wirkmechanismus verstehen",
        description: "Wie Saccharomyces boulardii im Darm wirkt.",
        content: [
          "<b>Pathogen-Bindung:</b> Die Hefe bindet krankmachende Bakterien über Fimbrien.",
          "<b>Enzym-Boost:</b> Erhöht die Aktivität von Laktase, Maltase und Saccharase.",
          "<b>Immunstärkung:</b> Fördert sekretorisches IgA im Darm.",
        ],
        quiz: {
          question: "Wie wirkt Saccharomyces boulardii hauptsächlich gegen Durchfallerreger?",
          answers: [
            { text: "Es tötet alle Bakterien im Darm ab.", isCorrect: false },
            { text: "Es bindet pathogene Bakterien und hemmt deren Wachstum.", isCorrect: true },
            { text: "Es stoppt die Darmperistaltik.", isCorrect: false },
          ],
        },
      },
      {
        icon: "Plane",
        title: "Reiseprophylaxe richtig beraten",
        description: "Timing ist alles bei der Reisediarrhöe-Vorbeugung.",
        content: [
          "<b>Timing:</b> 5 Tage VOR Abreise mit der Einnahme beginnen!",
          "<b>Dosierung:</b> 1-2x täglich 1 Kapsel während der gesamten Reise.",
          "<b>Zusatztipp:</b> Auf Lebensmittelhygiene vor Ort achten.",
        ],
        quiz: {
          question: "Ein Kunde fliegt in 3 Tagen nach Ägypten und will Perenterol zur Prophylaxe. Was sagst du?",
          answers: [
            { text: "Perfekt, sofort anfangen und während der Reise weiternehmen.", isCorrect: true },
            { text: "Zu spät, Prophylaxe muss 2 Wochen vorher beginnen.", isCorrect: false },
            { text: "Perenterol ist nur für akuten Durchfall, nicht zur Vorbeugung.", isCorrect: false },
          ],
        },
      },
      {
        icon: "AlertTriangle",
        title: "Kontraindikationen kennen",
        description: "Wichtige Sicherheitsabfragen im HV.",
        content: [
          "<b>Hefeallergie:</b> Absolute Kontraindikation.",
          "<b>Zentraler Venenkatheter:</b> Fungämie-Risiko - nicht abgeben!",
          "<b>Immunsuppression:</b> Bei schwerkranken oder immunsupprimierten Patienten kontraindiziert.",
        ],
        quiz: {
          question: "Ein Patient mit Portkatheter (zentraler Venenkatheter) möchte Perenterol. Was tust du?",
          answers: [
            { text: "Normal abgeben, ist ja nur Hefe.", isCorrect: false },
            { text: "Nicht abgeben - Fungämie-Risiko bei zentralem Venenkatheter!", isCorrect: true },
            { text: "Halbe Dosis empfehlen.", isCorrect: false },
          ],
        },
      },
      {
        icon: "Pill",
        title: "Praktische Anwendungshinweise",
        description: "Wichtige Details für die Beratung.",
        content: [
          "<b>Blister-Öffnung:</b> Folie abziehen, NICHT durchdrücken (Kapsel bricht!).",
          "<b>Temperatur:</b> Nicht mit heißen (>50°C) oder eiskalten Getränken.",
          "<b>Wechselwirkung:</b> Antimykotika (Pilzmittel) heben die Wirkung auf!",
        ],
        quiz: {
          question: "Ein Kunde nimmt aktuell Fluconazol (Antimykotikum). Was ist bei Perenterol zu beachten?",
          answers: [
            { text: "Kein Problem, kann zusammen eingenommen werden.", isCorrect: false },
            { text: "Das Antimykotikum beeinträchtigt die Wirkung von Perenterol.", isCorrect: true },
            { text: "Perenterol verstärkt die Wirkung von Fluconazol.", isCorrect: false },
          ],
        },
      },
    ]
  },
};

// ==================================================================
// 3. DEFAULT/FALLBACK KONFIGURATION
// ==================================================================

const defaultConfig: TopicConfig = {
  systemPrompt: `Du bist ein erfahrener Apotheken-Coach. Analysiere das folgende Beratungsgespräch und erstelle 4 passende Lernmodule mit Quiz-Fragen.

Antworte AUSSCHLIESSLICH mit einem JSON-Array. Format:
[
  {
    "icon": "Sparkles" | "Pill" | "Brain" | "Activity",
    "title": "Titel des Moduls",
    "description": "Kurze Beschreibung",
    "content": ["<b>Punkt 1:</b> ...", "<b>Punkt 2:</b> ...", "<b>Punkt 3:</b> ..."],
    "quiz": {
      "question": "Quizfrage",
      "answers": [
        { "text": "Antwort A", "isCorrect": false },
        { "text": "Antwort B", "isCorrect": true },
        { "text": "Antwort C", "isCorrect": false }
      ]
    }
  }
]
Oder wenn includeOverview=true:
{
  "modules": [...],
  "overview": "Zusammenfassung..."
}`,
  fallbackModules: [
    {
      icon: "Sparkles",
      title: "Allgemeine Beratungskompetenz",
      description: "Grundlagen der pharmazeutischen Beratung.",
      content: [
        "<b>Aktives Zuhören:</b> Kundenbedürfnisse erkennen.",
        "<b>Fragen stellen:</b> Offene Fragen für mehr Information.",
        "<b>Empfehlung:</b> Klare, begründete Produktempfehlung.",
      ],
      quiz: {
        question: "Was ist der erste Schritt in einem guten Beratungsgespräch?",
        answers: [
          { text: "Sofort ein Produkt empfehlen.", isCorrect: false },
          { text: "Aktiv zuhören und Bedürfnisse erfragen.", isCorrect: true },
          { text: "Den günstigsten Preis nennen.", isCorrect: false },
        ],
      },
    },
  ],
  fallbackOverview: "In diesem Gespräch hast du die Grundlagen der Beratung angewendet. Achte darauf, noch genauer auf die Kundenbedürfnisse einzugehen."
};

// ==================================================================
// 4. GEMINI API AUFRUF
// ==================================================================

async function callGeminiForAnalysis(transcriptText: string, topicType: string, includeOverview: boolean = false): Promise<LearningModule[] | { modules: LearningModule[], overview: string }> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";

  // Hole die richtige Konfiguration für das Thema
  const config = topicConfigs[topicType] || defaultConfig;

  if (!apiKey) {
    console.warn("Gemini API Key fehlt. Nutze Fallback-Daten für:", topicType);
    // @ts-ignore
    return { modules: config.fallbackModules, overview: config.fallbackOverview || "" };
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{
      role: 'user',
      parts: [{ text: `Hier ist das Transkript des Beratungsgesprächs:\n\n${transcriptText}` }]
    }],
    systemInstruction: {
      parts: [{ text: config.systemPrompt + (includeOverview ? "\n\nBITTE AUCH 'overview' FELD GENERIEREN WIE OBEN BESCHRIEBEN." : "") }]
    },
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
    }
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Fehler:", response.status, errorText);
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const result = await response.json();
    const modelResponseText = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!modelResponseText) {
      throw new Error("Keine Antwort von Gemini erhalten");
    }

    // Parse und validiere das JSON
    const parsedModules = JSON.parse(modelResponseText);

    // Validierung
    if (includeOverview) {
      if (Array.isArray(parsedModules)) {
        // Falls KI trotz Anweisung Array schickt
        return { modules: parsedModules, overview: "" };
      }
      if (!parsedModules.modules || !Array.isArray(parsedModules.modules)) {
        throw new Error("Ungültiges Antwortformat (erwarte { modules: [], overview: '' })");
      }
      return parsedModules;
    } else {
      if (!Array.isArray(parsedModules)) {
        // Falls KI Objekt schickt obwohl nicht angefordert
        if (parsedModules.modules && Array.isArray(parsedModules.modules)) {
          return parsedModules.modules;
        }
        throw new Error("Ungültiges Antwortformat (erwarte Array)");
      }
      return parsedModules;
    }

  } catch (error) {
    console.error("Fehler bei der Gemini-Analyse:", error);
    // @ts-ignore
    return { modules: config.fallbackModules, overview: config.fallbackOverview || "" };
  }
}

// ==================================================================
// 5. API ROUTE HANDLER
// ==================================================================

export async function POST(request: Request) {
  try {
    // Query-Parameter auslesen (type=pharmacy_b_vitamins etc.)
    const { searchParams } = new URL(request.url);
    const topicType = searchParams.get('type') || 'default';
    const includeOverview = searchParams.get('includeOverview') === 'true';

    // Body auslesen
    const body = await request.json();
    const { transcript, applicationId } = body;

    console.log(`[API] Analyse gestartet für Thema: ${topicType}, ApplicationId: ${applicationId || 'none'}`);

    // Wenn kein Transkript vorhanden, Fallback-Daten senden
    if (!transcript || transcript.length === 0) {
      console.log("[API] Kein Transkript empfangen, nutze Fallback-Module.");
      const config = topicConfigs[topicType] || defaultConfig;
      if (includeOverview) {
        return NextResponse.json({ modules: config.fallbackModules, overview: config.fallbackOverview || "" });
      }
      return NextResponse.json(config.fallbackModules);
    }

    // Transkript in lesbaren String umwandeln
    const transcriptText = transcript
      .map((msg: { role: string; text: string }) => `${msg.role === 'user' ? 'Mitarbeiter' : 'Kunde'}: ${msg.text}`)
      .join('\n');

    console.log(`[API] Transkript-Länge: ${transcriptText.length} Zeichen`);

    // KI-Analyse aufrufen
    const result = await callGeminiForAnalysis(transcriptText, topicType, includeOverview);

    console.log(`[API] Analyse fertig.`);

    if (includeOverview) {
      // Wenn result ein Array ist, dann ist es nur modules (Fallback oder altes Format)
      if (Array.isArray(result)) {
        return NextResponse.json({ modules: result, overview: "" });
      }
      return NextResponse.json(result);
    } else {
      // Wenn result ein Objekt mit modules ist, geben wir nur modules zurück für Backward Compat
      if (!Array.isArray(result) && (result as any).modules) {
        return NextResponse.json((result as any).modules);
      }
      return NextResponse.json(result);
    }

  } catch (error) {
    console.error("[API] Fehler im Handler:", error);

    // Bei Fehler: Versuche das Thema aus der URL zu lesen für passende Fallbacks
    try {
      const { searchParams } = new URL(request.url);
      const topicType = searchParams.get('type') || 'default';
      const config = topicConfigs[topicType] || defaultConfig;
      return NextResponse.json(config.fallbackModules, { status: 500 });
    } catch {
      return NextResponse.json(defaultConfig.fallbackModules, { status: 500 });
    }
  }
}

// ==================================================================
// 6. OPTIONAL: GET HANDLER FÜR DEBUGGING
// ==================================================================

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const topicType = searchParams.get('type');

  return NextResponse.json({
    availableTopics: Object.keys(topicConfigs),
    requestedTopic: topicType,
    hasFallback: topicType ? !!topicConfigs[topicType] : false,
  });
}