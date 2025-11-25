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
  Dumbbell
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
// 4. FALLBACK DATA (Expanded: More Modules & Answers)
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

  // Theme Color (Ratiopharm Orange)
  const themeColorClass = "bg-brand";
  const themeTextClass = "text-brand";
  const themeBorderClass = "border-brand";

  // Init Effect (Load Data & Animation)
  useEffect(() => {
    const timer = setTimeout(() => setShowSuccess(true), 300);

    const loadData = () => {
      try {
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
      // Fallback loading
      setLearningModules(fallbackModules);
      setCompletedModules(Array(fallbackModules.length).fill(false));
      setQuizAnswers(Array(fallbackModules.length).fill(null));
      setIsLoadingModules(false);
    };

    const loadTimer = setTimeout(loadData, 1500);
    return () => { clearTimeout(timer); clearTimeout(loadTimer); };
  }, []);

  // --- ROBUST GEMINI API CALL WITH RETRY ---
  const callGeminiAPI = useCallback(async (history: ChatMessage[]) => {
    setIsGeminiLoading(true);

    const fetchWithRetry = async (retries = 3, delay = 1000): Promise<any> => {
      const systemPrompt = "Du bist ein erfahrener Apotheken-Coach und Experte für Magnesiumcitrat 130. Deine Aufgabe ist es, die Leistung des Nutzers zu analysieren und weiterführende Fragen zum Produkt, zur Wirkung und zur Kundenberatung klar und präzise zu beantworten. Bleibe stets in deiner Rolle als Coach.";
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
      // Updated Model URL to a newer preview version or standard endpoint
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: history.map(msg => ({ role: msg.role, parts: [{ text: msg.text }] })),
            systemInstruction: { parts: [{ text: systemPrompt }] },
          })
        });

        // Handle 503 Service Unavailable specifically
        if (response.status === 503 && retries > 0) {
          console.warn(`API 503 Error. Retrying in ${delay}ms... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchWithRetry(retries - 1, delay * 2); // Exponential backoff
        }

        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        return await response.json();

      } catch (error) {
        if (retries > 0) {
          // Also retry on network errors (fetch throws)
          console.warn(`Network error. Retrying in ${delay}ms... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchWithRetry(retries - 1, delay * 2);
        }
        throw error;
      }
    };

    try {
      const result = await fetchWithRetry();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "Ich konnte leider keine Antwort generieren. Bitte versuche es noch einmal.";
      setChatHistory(prev => [...prev, { role: 'model', text }]);
    } catch (error) {
      console.error("Final API Failure:", error);
      setChatHistory(prev => [...prev, { role: 'model', text: "Entschuldigung, der Server ist gerade überlastet (Fehler 503). Bitte versuche es in einem Moment noch einmal." }]);
    } finally {
      setIsGeminiLoading(false);
    }
  }, []);

  // Trigger Analysis when all modules are done
  const progress = learningModules.length > 0 ? (completedModules.filter(Boolean).length / learningModules.length) * 100 : 0;
  const allModulesCompleted = progress === 100 && learningModules.length > 0;

  useEffect(() => {
    if (allModulesCompleted && !analysisTriggered.current && learningModules.length > 0) {
      analysisTriggered.current = true;
      const summary = learningModules.map((m, i) =>
        `Frage: "${m.quiz.question}" | Antwort: "${quizAnswers[i]}"`
      ).join('\n');

      const msg: ChatMessage = {
        role: 'user',
        text: `Ich habe soeben die Lernmodule abgeschlossen. Hier ist eine Zusammenfassung meiner Antworten:\n\n${summary}\n\nBitte gib mir auf dieser Grundlage eine kurze, motivierende Analyse meiner Leistung.`
      };
      callGeminiAPI([msg]);
    }
  }, [allModulesCompleted, callGeminiAPI, quizAnswers, learningModules]);

  // Handlers
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
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-5">
              <div className={`w-16 h-16 ${themeColorClass} rounded-lg flex items-center justify-center shadow-sm`}>
                <Award className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Auswertung & Lernpfad</h1>
                <p className="text-gray-600">Dein persönliches Magnesium-Trainingsprogramm</p>
              </div>
            </div>
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
            Super gemacht! Nutze die folgenden Module, um dein Wissen zu Magnesiumcitrat zu festigen.
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
            <div>
              {/* Progress Section */}
              <div className="mb-6 flex justify-between items-end">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Wissens-Check</h3>
                  <p className="text-sm text-gray-500">Beantworte die Fragen, um die Analyse zu starten.</p>
                </div>
                <div className="text-right w-1/3">
                  <p className="text-xs text-gray-500 mb-1">{Math.round(progress)}% abgeschlossen</p>
                  <Progress value={progress} className={`w-full [&>*]:${themeColorClass}`} />
                </div>
              </div>

              {/* Modules Grid */}
              <div className="grid gap-6 md:grid-cols-2">
                {learningModules.map((module, index) => {
                  const quizState = activeQuiz[index];
                  const isCompleted = completedModules[index];
                  const ModuleIcon = iconMap[module.icon] || iconMap.Default;

                  return (
                    <Card key={index} className={`${isCompleted ? 'border-green-500 ring-1 ring-green-100' : ''}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className={`w-10 h-10 ${isCompleted ? 'bg-green-100' : 'bg-brand/10'} rounded-lg flex items-center justify-center`}>
                            <ModuleIcon className={`w-5 h-5 ${isCompleted ? 'text-green-600' : themeTextClass}`} />
                          </div>
                          {isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
                        </div>
                        <CardTitle className="mt-4 text-lg">{module.title}</CardTitle>
                        <CardDescription>{module.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Lerninhalte:</h4>
                          <ul className="space-y-2">
                            {module.content.map((item, i) => (
                              <li key={i} className="flex items-start text-xs text-gray-700">
                                <div className={`w-1 h-1 ${themeColorClass} rounded-full mt-1.5 mr-2 flex-shrink-0`}></div>
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

            {/* AI Analysis Section */}
            {allModulesCompleted && (
              <Card className={`bg-white ${themeBorderClass}/30 shadow-sm`}>
                <CardHeader>
                  <CardTitle className={`flex items-center space-x-2 ${themeTextClass}`}>
                    <Sparkles className="w-5 h-5" />
                    <span>Deine persönliche KI-Analyse</span>
                  </CardTitle>
                  <CardDescription>Stelle hier weiterführende Fragen an deinen Apotheken-Coach.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div ref={chatContainerRef} className="h-80 overflow-y-auto p-4 bg-gray-50 rounded-lg border mb-4 space-y-4">
                    {chatHistory.map((msg, index) => (
                      <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-xl text-sm ${msg.role === 'user' ? `${themeColorClass} text-white` : 'bg-white border shadow-sm'}`}>
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
                      placeholder="Stelle eine Frage..."
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      disabled={isGeminiLoading}
                      className="flex-grow"
                    />
                    <Button type="submit" disabled={isGeminiLoading || !userInput.trim()} className={`${themeColorClass} hover:opacity-90`}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>

                  <div className="mt-4 flex justify-center pt-4">
                    <Button variant="outline" onClick={() => window.location.href = '/start'} size="lg">
                      Zurück zur Startseite
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  )
}