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
  ShieldCheck,
  Users,
  Target,
  Award,
  Activity,
  Clock,
  Dumbbell,
  Zap,
  Heart,
  Pill,
  ArrowLeft,
  Home
} from "lucide-react"
import Link from "next/link"

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
// 2. ICON MAPPING
// ==================================================================
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ShieldCheck: ShieldCheck,
  Users: Users,
  Target: Target,
  Award: Award,
  Activity: Activity,
  Clock: Clock,
  Dumbbell: Dumbbell,
  Zap: Zap,
  Heart: Heart,
  Pill: Pill,
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
// 4. THEME CLASSES
// ==================================================================
const themeColorClass = "bg-blue-600";
const themeTextClass = "text-blue-600";
const themeBorderClass = "border-blue-600";

// ==================================================================
// 5. FALLBACK DATA
// ==================================================================
const fallbackModules: LearningModule[] = [
  {
    icon: "ShieldCheck",
    title: "Vertiefung: Produktvorteile",
    description: "Argumentation für Magnesiumcitrat 130.",
    content: [
      "<b>Citratform:</b> Hat eine hohe Bioverfügbarkeit und wird schnell aufgenommen.",
      "<b>Reinheit:</b> Apothekenqualität garantiert Reinheit ohne unnötige Zusatzstoffe.",
      "<b>Dosierung:</b> 130mg ist ideal für eine flexible, über den Tag verteilte Einnahme.",
    ],
    quiz: {
      question: "Ein Kunde fragt nach dem Unterschied zu günstigen Drogerie-Produkten. Was ist das stärkste Argument?",
      answers: [
        { text: "Unsere Packung hat ein schöneres Design.", isCorrect: false },
        { text: "Die Citratform ist körpereigenem Magnesium ähnlich und besonders gut verfügbar.", isCorrect: true },
        { text: "Es ist doppelt so hoch dosiert wie alle anderen.", isCorrect: false },
      ],
    },
  },
  {
    icon: "Users",
    title: "Training: Risikogruppen erkennen",
    description: "Wer profitiert am meisten?",
    content: [
      "<b>Wadenkrämpfe:</b> Ein klassisches Anzeichen für Mangel.",
      "<b>Diuretika-Einnahme:</b> Erhöhter Bedarf durch Ausscheidung.",
      "<b>Stress & Sport:</b> Aktive Menschen verbrauchen deutlich mehr Mineralstoffe.",
    ],
    quiz: {
      question: "Eine ältere Kundin löst ein Rezept für Wassertabletten (Diuretika) ein. Warum ist Magnesium hier wichtig?",
      answers: [
        { text: "Diuretika erhöhen die Magnesium-Ausscheidung über die Nieren.", isCorrect: true },
        { text: "Weil Diuretika den Magen beruhigen.", isCorrect: false },
        { text: "Ältere Menschen brauchen eigentlich weniger Magnesium.", isCorrect: false },
      ],
    },
  },
  {
    icon: "Clock",
    title: "Anwendung & Einnahme",
    description: "Die richtige Beratung zur Einnahme.",
    content: [
      "<b>Zeitpunkt:</b> Bei nächtlichen Wadenkrämpfen idealerweise abends.",
      "<b>Verteilung:</b> Kleinere Dosen über den Tag werden besser resorbiert als eine große Einzeldosis.",
      "<b>Wechselwirkung:</b> 2-3 Stunden Abstand zu Antibiotika (Tetracycline) halten.",
    ],
    quiz: {
      question: "Ein Kunde klagt über nächtliche Wadenkrämpfe. Welche Einnahmeempfehlung gibst du?",
      answers: [
        { text: "Morgens nüchtern mit Kaffee.", isCorrect: false },
        { text: "Direkt vor dem Sport.", isCorrect: false },
        { text: "Abends vor dem Schlafengehen, um den Spiegel über Nacht zu halten.", isCorrect: true },
      ],
    },
  },
  {
    icon: "Dumbbell",
    title: "Sport & Regeneration",
    description: "Warum Sportler mehr brauchen.",
    content: [
      "<b>Schweißverlust:</b> Elektrolyte gehen beim Schwitzen verloren.",
      "<b>Muskelfunktion:</b> Magnesium ist essenziell für die Entspannung nach Kontraktion.",
      "<b>Energie:</b> Ohne Magnesium kein Energiestoffwechsel (ATP).",
    ],
    quiz: {
      question: "Ein Marathonläufer fragt nach Unterstützung. Was sagst du?",
      answers: [
        { text: "Magnesium hilft nur gegen Muskelkater, nicht für die Leistung.", isCorrect: false },
        { text: "Es unterstützt den Energiestoffwechsel und gleicht Verluste durch Schwitzen aus.", isCorrect: true },
        { text: "Er sollte lieber nur Calcium nehmen.", isCorrect: false },
      ],
    },
  }
];

export default function CompletionPage() {
  // ==================================================================
  // STATE DECLARATIONS
  // ==================================================================
  const [showSuccess, setShowSuccess] = useState(false)
  const [isLoadingModules, setIsLoadingModules] = useState(true);
  const [learningModules, setLearningModules] = useState<LearningModule[]>([]);
  const [learningOverview, setLearningOverview] = useState<string>("");
  const [activeQuiz, setActiveQuiz] = useState<Record<number, { selectedAnswer: number | null; isCorrect: boolean | null }>>({});
  const [completedModules, setCompletedModules] = useState<boolean[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);

  // Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);

  // Refs
  const analysisTriggered = useRef(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // ==================================================================
  // INITIALIZATION EFFECT
  // ==================================================================
  useEffect(() => {
    const timer = setTimeout(() => setShowSuccess(true), 300);

    const loadData = () => {
      try {
        const storedData = sessionStorage.getItem('dynamicLearningData');
        const storedOverview = sessionStorage.getItem('dynamicLearningOverview');
        if (storedData) {
          const parsed = JSON.parse(storedData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setLearningModules(parsed);
            if (storedOverview) setLearningOverview(storedOverview);
            setCompletedModules(Array(parsed.length).fill(false));
            setQuizResults([]);
            setIsLoadingModules(false);
            return;
          }
        }
      } catch (e) {
        console.error("Fehler beim Laden der dynamischen Daten:", e);
      }
      // Fallback
      setLearningModules(fallbackModules);
      setCompletedModules(Array(fallbackModules.length).fill(false));
      setQuizResults([]);
      setIsLoadingModules(false);
    };

    const loadTimer = setTimeout(loadData, 1500);
    return () => { clearTimeout(timer); clearTimeout(loadTimer); };
  }, []);

  // ==================================================================
  // GEMINI API CALL
  // ==================================================================
  const callGeminiAPI = useCallback(async (history: ChatMessage[], isInitialAnalysis: boolean = false) => {
    setIsGeminiLoading(true);

    const systemPrompt = `Du bist ein erfahrener Apotheken-Coach und Experte für Magnesiumcitrat 130.

DEINE AUFGABE:
- Analysiere die Quiz-Ergebnisse des Nutzers KONKRET und SPEZIFISCH
- Nenne explizit welche Fragen richtig und welche falsch beantwortet wurden
- Erkläre bei falschen Antworten, WARUM die richtige Antwort korrekt ist
- Beziehe dich auf das pharmazeutische Fachwissen (Bioverfügbarkeit, Zielgruppen, Einnahme)
- Gib PRAKTISCHE Tipps für den Apothekenalltag
- Sei motivierend aber ehrlich - beschönige Fehler nicht
- Verwende "Du" (informell)

STRUKTUR DEINER ANALYSE:
1. 📊 Kurze Zusammenfassung (X von Y richtig, Prozent)
2. ✅ Lob für richtige Antworten - was zeigt das über das Wissen?
3. ❌ Erklärung der Fehler - warum ist die andere Antwort besser?
4. 💡 2-3 praktische Tipps für den HV-Alltag
5. 🎯 Ermutigung und nächste Schritte

Halte dich prägnant (max 300 Wörter). Antworte auf Deutsch.`;

    const fetchWithRetry = async (retries = 3, delay = 1000): Promise<unknown> => {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      try {
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
              maxOutputTokens: 600,
            }
          })
        });

        if (response.status === 503 && retries > 0) {
          console.warn(`API 503 Error. Retrying in ${delay}ms... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchWithRetry(retries - 1, delay * 2);
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Gemini API Error:", response.status, errorText);
          throw new Error(`API Error: ${response.status}`);
        }

        return await response.json();

      } catch (error) {
        if (retries > 0) {
          console.warn(`Network error. Retrying in ${delay}ms... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchWithRetry(retries - 1, delay * 2);
        }
        throw error;
      }
    };

    try {
      const result = await fetchWithRetry() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "Ich konnte leider keine Analyse erstellen. Bitte versuche es noch einmal.";
      setChatHistory(prev => [...prev, { role: 'model', text }]);
    } catch (error) {
      console.error("Final API Failure:", error);
      setChatHistory(prev => [...prev, {
        role: 'model',
        text: "Entschuldigung, es gab ein technisches Problem. Bitte versuche es in einem Moment noch einmal oder stelle mir eine direkte Frage zu deinen Ergebnissen."
      }]);
    } finally {
      setIsGeminiLoading(false);
    }
  }, []);

  // Progress calculation
  const progress = learningModules.length > 0 ? (completedModules.filter(Boolean).length / learningModules.length) * 100 : 0;
  const allModulesCompleted = progress === 100 && learningModules.length > 0;

  // ==================================================================
  // ANALYSIS TRIGGER EFFECT
  // ==================================================================
  useEffect(() => {
    if (allModulesCompleted &&
      !analysisTriggered.current &&
      quizResults.length === learningModules.length &&
      learningModules.length > 0) {
      analysisTriggered.current = true;

      const correctCount = quizResults.filter(r => r.isCorrect).length;
      const totalCount = quizResults.length;
      const percentage = Math.round((correctCount / totalCount) * 100);

      const detailedResults = quizResults.map((result, index) => {
        const status = result.isCorrect ? '✅' : '❌';
        let resultText = `${index + 1}. Modul: "${result.moduleTopic}"
   Frage: "${result.question}"
   ${status} Meine Antwort: "${result.userAnswer}"`;

        if (!result.isCorrect) {
          resultText += `
   ➡️ Richtige Antwort wäre: "${result.correctAnswer}"`;
        }
        return resultText;
      }).join('\n\n');

      const analysisPrompt = `Ich habe das Magnesiumcitrat 130 Training abgeschlossen. Hier sind meine Ergebnisse:

═══════════════════════════════════════
📊 GESAMTERGEBNIS: ${correctCount} von ${totalCount} Fragen richtig (${percentage}%)
═══════════════════════════════════════

📝 DETAILLIERTE ANTWORTEN:

${detailedResults}

═══════════════════════════════════════

Bitte analysiere meine Leistung im Detail:
1. Was habe ich gut gemacht und was zeigt das über mein Wissen?
2. Bei welchen Fragen lag ich falsch - erkläre mir bitte, warum die richtige Antwort besser ist
3. Welche konkreten Tipps hast du für meine nächste Kundenberatung zu Magnesium?`;

      const msg: ChatMessage = { role: 'user', text: analysisPrompt };
      setChatHistory([msg]);
      callGeminiAPI([msg], true);
    }
  }, [allModulesCompleted, callGeminiAPI, quizResults, learningModules.length]);

  // ==================================================================
  // ANSWER SELECTION HANDLER
  // ==================================================================
  const handleAnswerSelect = (modIdx: number, ansIdx: number) => {
    if (completedModules[modIdx]) return;
    if (activeQuiz[modIdx]?.selectedAnswer !== null && activeQuiz[modIdx]?.selectedAnswer !== undefined) return;

    const currentModule = learningModules[modIdx];
    const selectedAnswer = currentModule.quiz.answers[ansIdx];
    const isCorrect = selectedAnswer.isCorrect;
    const correctAnswer = currentModule.quiz.answers.find(a => a.isCorrect);

    setActiveQuiz(prev => ({ ...prev, [modIdx]: { selectedAnswer: ansIdx, isCorrect } }));

    setQuizResults(prev => {
      const existingIndex = prev.findIndex(r => r.moduleTopic === currentModule.title);
      if (existingIndex !== -1) {
        return prev;
      }

      return [...prev, {
        question: currentModule.quiz.question,
        userAnswer: selectedAnswer.text,
        correctAnswer: correctAnswer?.text || '',
        isCorrect: isCorrect,
        moduleTopic: currentModule.title
      }];
    });

    setTimeout(() => {
      setCompletedModules(prev => {
        const n = [...prev];
        n[modIdx] = true;
        return n;
      });
    }, 1000);
  };

  // ==================================================================
  // CHAT MESSAGE HANDLER
  // ==================================================================
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isGeminiLoading) return;

    const contextInfo = quizResults.length > 0
      ? `[Kontext: Nutzer hat ${quizResults.filter(r => r.isCorrect).length}/${quizResults.length} Fragen richtig beantwortet im Magnesium-Training]

Nutzer fragt: ${userInput}`
      : userInput;

    const displayMsg: ChatMessage = { role: 'user', text: userInput };
    const apiMsg: ChatMessage = { role: 'user', text: contextInfo };

    setChatHistory(prev => [...prev, displayMsg]);
    setUserInput('');
    callGeminiAPI([...chatHistory, apiMsg]);
  };

  // Auto-scroll Chat
  useEffect(() => {
    chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
  }, [chatHistory]);

  // ==================================================================
  // RENDER
  // ==================================================================
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/start">
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Zurück zum Start</span>
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Training abgeschlossen</h1>
            </div>

            {/* Ergebnis-Badge wenn fertig */}
            {allModulesCompleted && quizResults.length > 0 && (
              <div className="hidden sm:flex items-center space-x-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  {quizResults.filter(r => r.isCorrect).length}/{quizResults.length} richtig
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Animation Header */}
        <div className="text-center mb-10">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full transition-all duration-700 ${showSuccess ? "bg-green-100 scale-100" : "bg-gray-100 scale-90"}`}>
            <CheckCircle className={`transition-all duration-700 ${showSuccess ? "w-10 h-10 text-green-600" : "w-8 h-8 text-gray-400"}`} />
          </div>
          <h2 className={`text-2xl font-bold mt-4 transition-opacity duration-700 ${showSuccess ? "opacity-100" : "opacity-0"}`}>
            Simulation erfolgreich beendet!
          </h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Super gemacht! Beantworte die Quiz-Fragen und erhalte eine personalisierte KI-Analyse deiner Stärken und Verbesserungspotenziale.
          </p>
        </div>

        {isLoadingModules ? (
          <Card className="text-center p-8">
            <CardHeader><CardTitle>Lade Lerninhalte...</CardTitle></CardHeader>
            <CardContent>
              <div className="flex justify-center items-center space-x-2">
                <div className={`w-4 h-4 ${themeColorClass} rounded-full animate-bounce`} style={{ animationDelay: '0s' }}></div>
                <div className={`w-4 h-4 ${themeColorClass} rounded-full animate-bounce`} style={{ animationDelay: '0.2s' }}></div>
                <div className={`w-4 h-4 ${themeColorClass} rounded-full animate-bounce`} style={{ animationDelay: '0.4s' }}></div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Overview Section */}
            {learningOverview && (
              <Card className="bg-blue-50 border-blue-100">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center space-x-2 text-blue-700 text-lg">
                    <Sparkles className="w-5 h-5" />
                    <span>Dein Gesprächs-Feedback</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-900 leading-relaxed">
                    {learningOverview}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Progress Section */}
            <div className="mb-6 flex justify-between items-end">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Wissens-Check</h3>
                <p className="text-sm text-gray-500">Beantworte alle Fragen, um deine persönliche KI-Analyse zu starten.</p>
              </div>
              <div className="text-right w-1/3">
                <p className="text-xs text-gray-500 mb-1">{Math.round(progress)}% abgeschlossen</p>
                <Progress value={progress} className="w-full [&>*]:bg-blue-600" />
              </div>
            </div>

            {/* Modules Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {learningModules.map((mod, index) => {
                const quizState = activeQuiz[index];
                const isCompleted = completedModules[index];
                const ModuleIcon = iconMap[mod.icon] || iconMap.Default;

                return (
                  <Card key={index} className={`transition-all duration-300 ${isCompleted ? 'border-green-500 ring-1 ring-green-100' : 'hover:shadow-md'}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className={`w-10 h-10 ${isCompleted ? 'bg-green-100' : 'bg-blue-600/10'} rounded-lg flex items-center justify-center`}>
                          <ModuleIcon className={`w-5 h-5 ${isCompleted ? 'text-green-600' : themeTextClass}`} />
                        </div>
                        {isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
                      </div>
                      <CardTitle className="mt-4 text-lg">{mod.title}</CardTitle>
                      <CardDescription>{mod.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Lerninhalte */}
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Lerninhalte:</h4>
                        <ul className="space-y-2">
                          {mod.content.map((item, i) => (
                            <li key={i} className="flex items-start text-xs text-gray-700">
                              <div className={`w-1 h-1 ${themeColorClass} rounded-full mt-1.5 mr-2 flex-shrink-0`}></div>
                              <span dangerouslySetInnerHTML={{ __html: cleanText(item) }}></span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Quiz */}
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-3">{mod.quiz.question}</p>
                        <div className="space-y-2">
                          {mod.quiz.answers.map((answer, answerIndex) => {
                            const isSelected = quizState?.selectedAnswer === answerIndex;
                            const showCorrectAnswer = isCompleted && answer.isCorrect && !quizState?.isCorrect;

                            let buttonClass = 'bg-white hover:bg-gray-50 border-gray-200';
                            if (isSelected) {
                              buttonClass = quizState.isCorrect
                                ? 'bg-green-100 border-green-500 text-green-900'
                                : 'bg-red-100 border-red-500 text-red-900';
                            } else if (showCorrectAnswer) {
                              buttonClass = 'bg-green-50 border-green-400 text-green-800';
                            }

                            return (
                              <Button
                                key={answerIndex}
                                variant="outline"
                                className={`w-full justify-start text-left h-auto py-2 px-3 whitespace-normal text-sm ${buttonClass}`}
                                onClick={() => handleAnswerSelect(index, answerIndex)}
                                disabled={isCompleted}
                              >
                                {isSelected && (
                                  quizState.isCorrect
                                    ? <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0 text-green-600" />
                                    : <XCircle className="w-4 h-4 mr-2 flex-shrink-0 text-red-600" />
                                )}
                                {showCorrectAnswer && (
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

            {/* AI Analysis Section */}
            {allModulesCompleted && (
              <Card className={`bg-white border-2 ${themeBorderClass}/30 shadow-lg`}>
                <CardHeader>
                  <CardTitle className={`flex items-center space-x-2 ${themeTextClass}`}>
                    <Sparkles className="w-5 h-5" />
                    <span>Deine persönliche KI-Analyse</span>
                  </CardTitle>
                  <CardDescription>
                    Basierend auf deinen Antworten ({quizResults.filter(r => r.isCorrect).length}/{quizResults.length} richtig) • Stelle Folgefragen für mehr Details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div ref={chatContainerRef} className="h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg border mb-4 space-y-4">
                    {chatHistory.length === 0 && isGeminiLoading && (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-1 mb-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <p className="text-sm text-gray-500">Analysiere deine Ergebnisse...</p>
                        </div>
                      </div>
                    )}

                    {chatHistory.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-xl ${msg.role === 'user' ? `${themeColorClass} text-white` : 'bg-white border'}`}>
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                        </div>
                      </div>
                    ))}

                    {isGeminiLoading && chatHistory.length > 0 && (
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

                  {/* Chat Input */}
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Stelle eine Frage zu deinen Ergebnissen oder zu Magnesium..."
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      disabled={isGeminiLoading}
                      className="flex-grow"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={isGeminiLoading || !userInput.trim()}
                      className={`${themeColorClass} hover:opacity-90`}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Beispiel-Fragen */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <p className="text-xs text-gray-400 w-full mb-1">Beispielfragen:</p>
                    {[
                      "Erkläre mir mehr zur Bioverfügbarkeit",
                      "Welche Kunden sollte ich aktiv ansprechen?",
                      "Wie erkläre ich den Preisunterschied?"
                    ].map((question, i) => (
                      <button
                        key={i}
                        onClick={() => setUserInput(question)}
                        className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"
                        disabled={isGeminiLoading}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Zurück zum Start Button am Ende */}
            <div className="flex justify-center pt-6">
              <Link href="/start">
                <Button className="flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3">
                  <Home className="w-5 h-5" />
                  <span>Neues Training starten</span>
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}