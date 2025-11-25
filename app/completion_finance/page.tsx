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
  // Perenterol spezifische Icons
  Thermometer,
  AlertOctagon,
  Pill,
  Plane,
  ShieldCheck
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

// ==================================================================
// 2. ICON MAPPING (Angepasst auf Perenterol)
// ==================================================================
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Thermometer: Thermometer,
  AlertOctagon: AlertOctagon,
  Pill: Pill,
  Plane: Plane,
  ShieldCheck: ShieldCheck,
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
// 4. FALLBACK DATA (Perenterol forte)
// ==================================================================
const fallbackModules: LearningModule[] = [
  {
    icon: "Thermometer",
    title: "Einnahme & Temperatur",
    description: "Wichtige Hinweise zur Stabilität der Hefekulturen.",
    content: [
      "<b>Hitzeempfindlich:</b> <i>Saccharomyces boulardii</i> ist eine lebende Hefe.",
      "<b>Temperaturgrenze:</b> Speisen/Getränke dürfen nicht über 50°C heiß sein.",
      "<b>Einnahme:</b> Vor den Mahlzeiten unzerkaut mit Flüssigkeit.",
    ],
    quiz: {
      question: "Ein Kunde möchte die Kapsel öffnen und in heißen Tee einrühren. Was raten Sie?",
      answers: [
        { text: "Kein Problem, die Hefe ist hitzestabil.", isCorrect: false },
        { text: "Bitte nicht, da die Hefepilze bei über 50°C absterben.", isCorrect: true },
        { text: "Das geht nur mit Zitronensaft.", isCorrect: false },
      ],
    },
  },
  {
    icon: "AlertOctagon",
    title: "Sicherheit & Kontraindikationen",
    description: "Kritische Ausschlusskriterien (ZVK).",
    content: [
      "<b>ZVK:</b> Absolute Kontraindikation bei Patienten mit zentralem Venenkatheter.",
      "<b>Risiko:</b> Gefahr der Fungämie (Pilzinfektion im Blut) über Raumluft/Hände.",
      "<b>Immunsuppression:</b> Nicht bei schwer kranken Patienten anwenden.",
    ],
    quiz: {
      question: "Welcher Patient darf Perenterol forte auf keinen Fall erhalten?",
      answers: [
        { text: "Patienten, die Antibiotika nehmen.", isCorrect: false },
        { text: "Patienten mit liegendem zentralen Venenkatheter (ZVK).", isCorrect: true },
        { text: "Patienten mit Laktoseintoleranz.", isCorrect: false },
      ],
    },
  },
  {
    icon: "Pill",
    title: "Dosierung & Akne",
    description: "Unterschiedliche Dosierung je nach Indikation.",
    content: [
      "<b>Akute Diarrhö:</b> 1- bis 2-mal täglich 1 Kapsel.",
      "<b>Akne (begleitend):</b> 3-mal täglich 1 Kapsel.",
      "<b>Antibiotika:</b> Zeitgleiche Einnahme ist möglich (da Hefe antibiotikaresistent ist).",
    ],
    quiz: {
      question: "Wie ist die Dosierungsempfehlung zur unterstützenden Behandlung bei Akne?",
      answers: [
        { text: "1 Kapsel täglich.", isCorrect: false },
        { text: "3-mal täglich 1 Kapsel.", isCorrect: true },
        { text: "Nur bei Entzündungsschüben.", isCorrect: false },
      ],
    },
  },
  {
    icon: "Plane",
    title: "Reisemedizin",
    description: "Prophylaxe von Reisediarrhöen.",
    content: [
      "<b>Start:</b> Beginn 5 Tage vor der Abreise.",
      "<b>Dosis:</b> 1- bis 2-mal täglich 1 Kapsel.",
      "<b>Kinder:</b> Ab 2 Jahren geeignet (unter 2 nur nach Rücksprache).",
    ],
    quiz: {
      question: "Wann sollte mit der Einnahme zur Reiseprophylaxe begonnen werden?",
      answers: [
        { text: "Erst bei Ankunft im Urlaubsland.", isCorrect: false },
        { text: "5 Tage vor Abreise.", isCorrect: true },
        { text: "Am Tag des Abflugs als Einmalgabe.", isCorrect: false },
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
  const [quizAnswers, setQuizAnswers] = useState<(string | null)[]>([]);

  // Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const analysisTriggered = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSuccess(true), 300);

    const loadData = () => {
      try {
        // Versuche dynamische Daten zu laden
        const storedData = sessionStorage.getItem('dynamicLearningData');
        if (storedData) {
          const parsed = JSON.parse(storedData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setLearningModules(parsed);
            setCompletedModules(Array(parsed.length).fill(false));
            setQuizAnswers(Array(parsed.length).fill(null));
            setIsLoadingModules(false);
            return;
          }
        }
      } catch (e) {
        console.error("Fehler beim Laden der dynamischen Daten:", e);
      }
      // Fallback nutzen, wenn keine Daten da sind oder Fehler auftrat
      setLearningModules(fallbackModules);
      setCompletedModules(Array(fallbackModules.length).fill(false));
      setQuizAnswers(Array(fallbackModules.length).fill(null));
      setIsLoadingModules(false);
    };

    const loadTimer = setTimeout(loadData, 1500);
    return () => { clearTimeout(timer); clearTimeout(loadTimer); };
  }, []);

  // --- GEMINI API CALL ---
  const callGeminiAPI = useCallback(async (history: ChatMessage[]) => {
    setIsGeminiLoading(true);
    try {
      // Prompt angepasst auf Perenterol
      const systemPrompt = "Du bist ein erfahrener Apotheken-Coach und Experte für Perenterol (Saccharomyces boulardii). Gib kurzes, motivierendes Feedback basierend auf dem Quiz. Achte besonders auf die Sicherheitshinweise (ZVK, Temperatur).";

      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
      // Nutze das Modell aus deiner funktionierenden File
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: history.map(msg => ({ role: msg.role, parts: [{ text: msg.text }] })),
          systemInstruction: { parts: [{ text: systemPrompt }] },
        })
      });

      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "Fehler bei der Antwort.";
      setChatHistory(prev => [...prev, { role: 'model', text }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'model', text: "Ein Fehler ist aufgetreten." }]);
    } finally {
      setIsGeminiLoading(false);
    }
  }, []);

  // --- TRIGGER ANALYSIS ---
  const progress = learningModules.length > 0 ? (completedModules.filter(Boolean).length / learningModules.length) * 100 : 0;
  const allModulesCompleted = progress === 100 && learningModules.length > 0;

  useEffect(() => {
    if (allModulesCompleted && !analysisTriggered.current && learningModules.length > 0) {
      analysisTriggered.current = true;
      const summary = learningModules.map((m, i) =>
        `Frage: "${m.quiz.question}" | Antwort: "${quizAnswers[i]}"`
      ).join('\n');

      const msg: ChatMessage = { role: 'user', text: `Ich habe das Perenterol-Quiz beendet. Hier sind meine Antworten:\n${summary}\nBitte um kurzes Feedback und ob ich die Sicherheitsaspekte verstanden habe.` };
      callGeminiAPI([msg]);
    }
  }, [allModulesCompleted, callGeminiAPI, quizAnswers, learningModules]);

  const handleAnswerSelect = (modIdx: number, ansIdx: number) => {
    if (completedModules[modIdx]) return;
    const module = learningModules[modIdx];
    const isCorrect = module.quiz.answers[ansIdx].isCorrect;

    setActiveQuiz(prev => ({ ...prev, [modIdx]: { selectedAnswer: ansIdx, isCorrect } }));
    setQuizAnswers(prev => { const n = [...prev]; n[modIdx] = module.quiz.answers[ansIdx].text; return n; });
    setTimeout(() => setCompletedModules(prev => { const n = [...prev]; n[modIdx] = true; return n; }), 1000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isGeminiLoading) return;
    const newMsg: ChatMessage = { role: 'user', text: userInput };
    setChatHistory([...chatHistory, newMsg]);
    setUserInput('');
    callGeminiAPI([...chatHistory, newMsg]);
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
              {/* Farbe auf Lila angepasst für Perenterol-Vibe, oder Orange lassen wenn gewünscht */}
              <div className="w-16 h-16 bg-brand rounded-lg flex items-center justify-center shadow-sm">
                <Pill className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Training abgeschlossen</h1>
                <p className="text-gray-600">Ergebnisse & Vertiefung: Perenterol</p>
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
            Super gemacht! Hier ist dein spezifischer Lernpfad für Perenterol.
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
                  <p className="text-sm text-gray-500">Beantworte die Fragen, um die KI-Analyse zu starten.</p>
                </div>
                <div className="text-right w-1/3">
                  <p className="text-xs text-gray-500 mb-1">{Math.round(progress)}% abgeschlossen</p>
                  <Progress value={progress} className="w-full [&>*]:bg-brand" />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {learningModules.map((module, index) => {
                  const quizState = activeQuiz[index];
                  const isCompleted = completedModules[index];
                  // Icon Mapping Logik
                  const ModuleIcon = iconMap[module.icon] || iconMap.Default;

                  return (
                    <Card key={index} className={`${isCompleted ? 'border-green-500 ring-1 ring-green-100' : ''}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className={`w-10 h-10 ${isCompleted ? 'bg-green-100' : 'bg-brand/10'} rounded-lg flex items-center justify-center`}>
                            <ModuleIcon className={`w-5 h-5 ${isCompleted ? 'text-green-600' : 'text-brand'}`} />
                          </div>
                          {isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
                        </div>
                        <CardTitle className="mt-4 text-lg">{module.title}</CardTitle>
                        <CardDescription>{module.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Wichtiges Praxiswissen:</h4>
                          <ul className="space-y-2">
                            {module.content.map((item, i) => (
                              <li key={i} className="flex items-start text-xs text-gray-700">
                                <div className="w-1 h-1 bg-brand rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                                <span dangerouslySetInnerHTML={{ __html: cleanText(item) }}></span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-3">{module.quiz.question}</p>
                          <div className="space-y-2">
                            {module.quiz.answers.map((answer, answerIndex) => {
                              const isSelected = quizState?.selectedAnswer === answerIndex;
                              const buttonClass = isSelected
                                ? quizState.isCorrect ? 'bg-green-100 border-green-500 text-green-900' : 'bg-red-100 border-red-500 text-red-900'
                                : 'bg-white hover:bg-gray-50';
                              return (
                                <Button
                                  key={answerIndex}
                                  variant="outline"
                                  className={`w-full justify-start text-left h-auto py-2 px-3 whitespace-normal text-sm ${buttonClass}`}
                                  onClick={() => handleAnswerSelect(index, answerIndex)}
                                  disabled={isCompleted}
                                >
                                  {isSelected && (quizState.isCorrect ? <CheckCircle className="w-4 h-4 mr-2" /> : <XCircle className="w-4 h-4 mr-2" />)}
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
                  <CardDescription>Dein persönliches Feedback zum Thema Perenterol.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div ref={chatContainerRef} className="h-80 overflow-y-auto p-4 bg-gray-50 rounded-lg border mb-4 space-y-4">
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
                      placeholder="Stelle eine Frage zu Perenterol..."
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