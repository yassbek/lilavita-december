"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import {
  CheckCircle,
  XCircle,
  Sparkles,
  Send,
  Zap,
  Pill,
  Brain,
  Activity,
  Baby,
  Sun,
  ShieldCheck,
  Users,
  Target,
  Heart,
  Shield,
  AlertTriangle,
  Plane
} from "lucide-react"

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

type ChatMessage = {
  role: 'user' | 'model';
  text: string;
};

interface QuizResult {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  moduleTopic: string;
}

// ==================================================================
// 2. ICON MAPPING (erweitert für alle Themen)
// ==================================================================
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  // B-Vitamine Icons
  Zap: Zap,
  Pill: Pill,
  Brain: Brain,
  Activity: Activity,
  Baby: Baby,
  Sun: Sun,
  // Magnesium Icons
  ShieldCheck: ShieldCheck,
  Users: Users,
  Target: Target,
  Heart: Heart,
  // Perenterol Icons
  Shield: Shield,
  AlertTriangle: AlertTriangle,
  Plane: Plane,
  // Fallback
  Sparkles: Sparkles,
  Default: Sparkles
};

// ==================================================================
// 3. HELPER FUNCTION
// ==================================================================
const cleanText = (text: string) => {
  if (!text) return "";
  return text;
};

// ==================================================================
// 4. FALLBACK DATA 
// ==================================================================
const fallbackModules: LearningModule[] = [
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
    description: "Wann ist ein B-Komplex wichtig?",
    content: [
      "<b>Medikamente:</b> PPI (Säureblocker) hemmen die B12-Aufnahme.",
      "<b>Migräne:</b> B2 (400 mg) kann positiv wirken.",
      "<b>Veganer:</b> B12-Supplementierung ist essenziell.",
    ],
    quiz: {
      question: "Welches B-Vitamin wird zur Migräne-Prophylaxe (Hochdosis) empfohlen?",
      answers: [
        { text: "Vitamin B1", isCorrect: false },
        { text: "Vitamin B12", isCorrect: false },
        { text: "Vitamin B2", isCorrect: true },
      ],
    },
  },
  {
    icon: "Sun",
    title: "Haut, Haare & Nägel",
    description: "Einsatz in der Dermatologie.",
    content: [
      "<b>Nagelpilz:</b> Biotin fördert das Herauswachsen des gesunden Nagels.",
      "<b>Akne:</b> B5 spielt eine Rolle im Fettstoffwechsel.",
      "<b>Regeneration:</b> Biotin unterstützt die Zellerneuerung.",
    ],
    quiz: {
      question: "Warum Biotin bei Nagelpilz?",
      answers: [
        { text: "Es tötet den Pilz ab.", isCorrect: false },
        { text: "Es beschleunigt das Nagelwachstum.", isCorrect: true },
        { text: "Es verhindert Ansteckung.", isCorrect: false },
      ],
    },
  },
  {
    icon: "Baby",
    title: "Kinderwunsch & Folsäure",
    description: "Folsäure vs. Folat.",
    content: [
      "<b>Schutz:</b> Senkt Risiko für Fehlbildungen.",
      "<b>Genetik:</b> Viele Frauen können synthetische Folsäure nicht optimal umwandeln.",
      "<b>Lösung:</b> Bioaktives Folat (5-MTHF) nutzen.",
    ],
    quiz: {
      question: "Vorteil von bioaktivem Folat (5-MTHF)?",
      answers: [
        { text: "Umgeht Enzymdefekte, direkt verfügbar.", isCorrect: true },
        { text: "Ist günstiger.", isCorrect: false },
        { text: "Muss seltener eingenommen werden.", isCorrect: false },
      ],
    },
  },
];

export default function CompletionPage() {
  const [showSuccess, setShowSuccess] = useState(false)
  const [isLoadingModules, setIsLoadingModules] = useState(true);
  const [learningModules, setLearningModules] = useState<LearningModule[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Record<number, { selectedAnswer: number | null; isCorrect: boolean | null }>>({});
  const [completedModules, setCompletedModules] = useState<boolean[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]); // NEU: Detaillierte Ergebnisse

  // Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const analysisTriggered = useRef(false);

  // Transkript aus dem Interview laden
  const [interviewTranscript, setInterviewTranscript] = useState<string>('');

  useEffect(() => {
    const timer = setTimeout(() => setShowSuccess(true), 300);

    const loadData = () => {
      try {
        // Dynamische Module laden
        const storedData = sessionStorage.getItem('dynamicLearningData');
        if (storedData) {
          const parsed = JSON.parse(storedData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setLearningModules(parsed);
            setCompletedModules(Array(parsed.length).fill(false));
            setQuizResults([]);
            setIsLoadingModules(false);
          }
        } else {
          // Fallback
          setLearningModules(fallbackModules);
          setCompletedModules(Array(fallbackModules.length).fill(false));
          setQuizResults([]);
          setIsLoadingModules(false);
        }

        // Interview-Transkript laden (falls vorhanden)
        const transcript = sessionStorage.getItem('interviewTranscript');
        if (transcript) {
          setInterviewTranscript(transcript);
        }
      } catch (e) {
        console.error("Fehler beim Laden der Daten:", e);
        setLearningModules(fallbackModules);
        setCompletedModules(Array(fallbackModules.length).fill(false));
        setIsLoadingModules(false);
      }
    };

    const loadTimer = setTimeout(loadData, 1500);
    return () => { clearTimeout(timer); clearTimeout(loadTimer); };
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // VERBESSERTE GEMINI API FUNKTION
  // ═══════════════════════════════════════════════════════════════
  const callGeminiAPI = useCallback(async (history: ChatMessage[], isInitialAnalysis: boolean = false) => {
    setIsGeminiLoading(true);

    try {
      // Detaillierter System-Prompt für echte Analyse
      const systemPrompt = `Du bist ein erfahrener Apotheken-Coach und Trainer. Deine Aufgabe ist es, dem Mitarbeiter konstruktives, personalisiertes Feedback zu geben.

WICHTIGE REGELN:
1. Beziehe dich KONKRET auf die Quiz-Antworten des Mitarbeiters
2. Nenne SPEZIFISCH welche Fragen richtig/falsch beantwortet wurden
3. Erkläre bei falschen Antworten, warum die richtige Antwort korrekt ist
4. Gib PRAKTISCHE Tipps für den Apothekenalltag
5. Sei motivierend aber ehrlich
6. Verwende "Du" (informell)
7. Halte dich kurz und prägnant (max 200 Wörter)

STRUKTUR DEINER ANTWORT:
- Starte mit einer kurzen Zusammenfassung (X von Y richtig)
- Lobe konkret, was gut war
- Erkläre Fehler und die richtigen Antworten
- Gib 1-2 praktische Tipps für den HV
- Ende mit einer Ermutigung`;

      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: history.map(msg => ({
            role: msg.role === 'model' ? 'model' : 'user',
            parts: [{ text: msg.text }]
          })),
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API Error:", response.status, errorText);
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "Entschuldigung, ich konnte keine Analyse erstellen.";
      setChatHistory(prev => [...prev, { role: 'model', text }]);
    } catch (err) {
      console.error("Gemini Fehler:", err);
      setChatHistory(prev => [...prev, {
        role: 'model',
        text: "Es gab ein technisches Problem. Bitte versuche es erneut oder stelle mir eine direkte Frage zu deinen Quiz-Ergebnissen."
      }]);
    } finally {
      setIsGeminiLoading(false);
    }
  }, []);

  // Progress berechnen
  const progress = learningModules.length > 0 ? (completedModules.filter(Boolean).length / learningModules.length) * 100 : 0;
  const allModulesCompleted = progress === 100 && learningModules.length > 0;

  // ═══════════════════════════════════════════════════════════════
  // VERBESSERTE ANALYSE-TRIGGER
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (allModulesCompleted && !analysisTriggered.current && quizResults.length > 0) {
      analysisTriggered.current = true;

      // Detaillierte Zusammenfassung erstellen
      const correctCount = quizResults.filter(r => r.isCorrect).length;
      const totalCount = quizResults.length;

      // Detaillierter Prompt mit allen Informationen
      let analysisPrompt = `Ich habe gerade das Apotheken-Training abgeschlossen. Hier sind meine Quiz-Ergebnisse:

📊 ERGEBNIS: ${correctCount} von ${totalCount} Fragen richtig (${Math.round(correctCount / totalCount * 100)}%)

📝 DETAILLIERTE ANTWORTEN:
`;

      quizResults.forEach((result, index) => {
        const status = result.isCorrect ? '✅' : '❌';
        analysisPrompt += `
${index + 1}. ${result.moduleTopic}
   Frage: "${result.question}"
   ${status} Meine Antwort: "${result.userAnswer}"
   ${!result.isCorrect ? `   ➡️ Richtige Antwort: "${result.correctAnswer}"` : ''}
`;
      });

      // Falls Transkript vorhanden, auch das hinzufügen
      if (interviewTranscript) {
        analysisPrompt += `

📞 AUSZUG AUS MEINEM BERATUNGSGESPRÄCH:
${interviewTranscript.substring(0, 1000)}${interviewTranscript.length > 1000 ? '...' : ''}
`;
      }

      analysisPrompt += `

Bitte gib mir ein persönliches Feedback zu meiner Leistung. Was habe ich gut gemacht? Wo muss ich noch üben? Welche Tipps hast du für meinen nächsten Kundenkontakt?`;

      const msg: ChatMessage = { role: 'user', text: analysisPrompt };
      setChatHistory([msg]);
      callGeminiAPI([msg], true);
    }
  }, [allModulesCompleted, callGeminiAPI, quizResults, interviewTranscript]);

  // ═══════════════════════════════════════════════════════════════
  // VERBESSERTE ANTWORT-AUSWAHL
  // ═══════════════════════════════════════════════════════════════
  const handleAnswerSelect = (modIdx: number, ansIdx: number) => {
    if (completedModules[modIdx]) return;

    const currentModule = learningModules[modIdx];
    const selectedAnswer = currentModule.quiz.answers[ansIdx];
    const isCorrect = selectedAnswer.isCorrect;
    const correctAnswer = currentModule.quiz.answers.find(a => a.isCorrect);

    // Quiz-State aktualisieren
    setActiveQuiz(prev => ({ ...prev, [modIdx]: { selectedAnswer: ansIdx, isCorrect } }));

    // Detailliertes Ergebnis speichern
    setQuizResults(prev => [...prev, {
      question: currentModule.quiz.question,
      userAnswer: selectedAnswer.text,
      correctAnswer: correctAnswer?.text || '',
      isCorrect: isCorrect,
      moduleTopic: currentModule.title
    }]);

    // Modul als abgeschlossen markieren
    setTimeout(() => {
      setCompletedModules(prev => {
        const n = [...prev];
        n[modIdx] = true;
        return n;
      });
    }, 1000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isGeminiLoading) return;

    // Kontext für Folgefragen mitgeben
    const contextMessage = quizResults.length > 0
      ? `(Kontext: Der Nutzer hat ${quizResults.filter(r => r.isCorrect).length}/${quizResults.length} Quiz-Fragen richtig beantwortet)\n\nNutzer fragt: ${userInput}`
      : userInput;

    const newMsg: ChatMessage = { role: 'user', text: userInput }; // Zeige nur die User-Frage an
    const apiMsg: ChatMessage = { role: 'user', text: contextMessage }; // Sende Kontext mit

    setChatHistory(prev => [...prev, newMsg]);
    setUserInput('');
    callGeminiAPI([...chatHistory, apiMsg]);
  };

  useEffect(() => {
    chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
  }, [chatHistory]);

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-5">
              <div className="w-16 h-16 bg-brand rounded-lg flex items-center justify-center shadow-sm">
                <Pill className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Training abgeschlossen</h1>
                <p className="text-gray-600">Ergebnisse & Vertiefung</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-10">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full transition-all duration-700 ${showSuccess ? "bg-green-100 scale-100" : "bg-gray-100 scale-90"}`}>
            <CheckCircle className={`transition-all duration-700 ${showSuccess ? "w-10 h-10 text-green-600" : "w-8 h-8 text-gray-400"}`} />
          </div>
          <h2 className={`text-2xl font-bold mt-4 transition-opacity duration-700 ${showSuccess ? "opacity-100" : "opacity-0"}`}>
            Simulation erfolgreich beendet!
          </h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Super gemacht! Nutze die folgenden Module, um dein Wissen zu festigen und dein Zertifikat freizuschalten.
          </p>
        </div>

        {isLoadingModules ? (
          <Card className="text-center p-8">
            <CardHeader><CardTitle>Lade Lerninhalte...</CardTitle></CardHeader>
            <CardContent>
              <div className="flex justify-center items-center space-x-2">
                <div className="w-4 h-4 bg-brand rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-4 h-4 bg-brand rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-4 h-4 bg-brand rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            <div>
              <div className="mb-6 flex justify-between items-end">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Wissens-Check</h3>
                  <p className="text-sm text-gray-500">Beantworte die Fragen, um die Analyse zu starten.</p>
                </div>
                <div className="text-right w-1/3">
                  <p className="text-xs text-gray-500 mb-1">{Math.round(progress)}% abgeschlossen</p>
                  <Progress value={progress} className="w-full [&>*]:bg-brand" />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {learningModules.map((mod, index) => {
                  const quizState = activeQuiz[index];
                  const isCompleted = completedModules[index];
                  const ModuleIcon = iconMap[mod.icon] || iconMap.Default;

                  return (
                    <Card key={index} className={`${isCompleted ? 'border-green-500 ring-1 ring-green-100' : ''}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className={`w-10 h-10 ${isCompleted ? 'bg-green-100' : 'bg-brand/10'} rounded-lg flex items-center justify-center`}>
                            <ModuleIcon className={`w-5 h-5 ${isCompleted ? 'text-green-600' : 'text-brand'}`} />
                          </div>
                          {isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
                        </div>
                        <CardTitle className="mt-4 text-lg">{mod.title}</CardTitle>
                        <CardDescription>{mod.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Wichtiges Praxiswissen:</h4>
                          <ul className="space-y-2">
                            {mod.content.map((item, i) => (
                              <li key={i} className="flex items-start text-xs text-gray-700">
                                <div className="w-1 h-1 bg-brand rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                                <span dangerouslySetInnerHTML={{ __html: cleanText(item) }}></span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-3">{mod.quiz.question}</p>
                          <div className="space-y-2">
                            {mod.quiz.answers.map((answer, answerIndex) => {
                              const isSelected = quizState?.selectedAnswer === answerIndex;
                              const showCorrect = isCompleted && answer.isCorrect;

                              let buttonClass = 'bg-white hover:bg-gray-50';
                              if (isSelected) {
                                buttonClass = quizState.isCorrect
                                  ? 'bg-green-100 border-green-500 text-green-900'
                                  : 'bg-red-100 border-red-500 text-red-900';
                              } else if (showCorrect && !quizState?.isCorrect) {
                                // Zeige die richtige Antwort wenn falsch gewählt
                                buttonClass = 'bg-green-50 border-green-300 text-green-800';
                              }

                              return (
                                <Button
                                  key={answerIndex}
                                  variant="outline"
                                  className={`w-full justify-start text-left h-auto py-2 px-3 whitespace-normal text-sm ${buttonClass}`}
                                  onClick={() => handleAnswerSelect(index, answerIndex)}
                                  disabled={isCompleted}
                                >
                                  {isSelected && (quizState.isCorrect
                                    ? <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                                    : <XCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                                  )}
                                  {showCorrect && !isSelected && !quizState?.isCorrect && (
                                    <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0 text-green-600" />
                                  )}
                                  {answer.text}
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {allModulesCompleted && (
              <Card className="bg-white border-brand/20 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-brand">
                    <Sparkles className="w-5 h-5" />
                    <span>KI-Analyse & Coaching</span>
                  </CardTitle>
                  <CardDescription>
                    Dein persönliches Feedback basierend auf deinen Antworten
                    ({quizResults.filter(r => r.isCorrect).length}/{quizResults.length} richtig)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div ref={chatContainerRef} className="h-80 overflow-y-auto p-4 bg-gray-50 rounded-lg border mb-4 space-y-4">
                    {chatHistory.length === 0 && !isGeminiLoading && (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <p>Analyse wird geladen...</p>
                      </div>
                    )}
                    {chatHistory.map((msg, index) => (
                      <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-brand text-white' : 'bg-white border shadow-sm'}`}>
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                      </div>
                    ))}
                    {isGeminiLoading && (
                      <div className="flex justify-start">
                        <div className="p-3 rounded-xl bg-white border">
                          <div className="flex items-center space-x-1">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <Input
                      placeholder="Stelle eine Frage zu deinen Ergebnissen..."
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      disabled={isGeminiLoading}
                      className="flex-grow"
                    />
                    <Button type="submit" disabled={isGeminiLoading || !userInput.trim()} className="bg-brand hover:bg-brand/90">
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {allModulesCompleted && (
              <div className="flex justify-center pt-4">
                <Button variant="outline" onClick={() => window.location.href = '/'} size="lg">
                  Zurück zur Übersicht
                </Button>
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  )
}