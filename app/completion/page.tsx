"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { BookOpen, Target, Users, ShieldCheck, CheckCircle, XCircle, ArrowRight, Award, Sparkles, Send } from "lucide-react"

// Simuliert die Analyseergebnisse basierend auf dem Schulungs-PDF
const learningModulesData = [
  {
    icon: ShieldCheck,
    title: "Vertiefung: Produktvorteile",
    description: "Stärke deine Argumentation, um die hohe Qualität von Magnesiumcitrat 130 gegenüber Drogerieprodukten hervorzuheben.",
    content: [
      "**Citratform:** Hat eine hohe Bioverfügbarkeit und ist besonders gut verträglich.",
      "**Reinheit:** Apothekenqualität garantiert Reinheit und korrekte Dosierung.",
      "**Wirkung:** Ein Allrounder für Muskeln, Nerven und den Energiestoffwechsel.",
    ],
    quiz: {
      question: "Ein Kunde fragt nach dem Unterschied zu günstigen Produkten aus der Drogerie. Was ist dein stärkstes Argument?",
      answers: [
        { text: "Die Citratform ist für den Körper besonders gut verfügbar und verträglich.", isCorrect: true },
        { text: "Unsere Packung sieht hochwertiger aus.", isCorrect: false },
        { text: "Es ist teurer und daher besser.", isCorrect: false },
      ],
    },
  },
  {
    icon: Users,
    title: "Training: Zielgruppen erkennen",
    description: "Lerne, proaktiv die Kunden zu identifizieren, die am meisten von Magnesiumcitrat 130 profitieren.",
    content: [
      "**Wadenkrämpfe:** Ein klassisches Anzeichen für Magnesiummangel.",
      "**Diuretika-Einnahme:** Ältere Kunden, die Entwässerungstabletten nehmen, haben oft einen erhöhten Bedarf.",
      "**Stress & Sport:** Aktive und gestresste Menschen verbrauchen mehr Magnesium.",
    ],
    quiz: {
      question: "Eine ältere Dame, die regelmäßig Diuretika abholt, wäre eine ideale Zielgruppe, weil...",
      answers: [
        { text: "...ältere Menschen immer Magnesium brauchen.", isCorrect: false },
        { text: "...Diuretika den Magnesiumverlust im Körper erhöhen können.", isCorrect: true },
        { text: "...sie wahrscheinlich auch Sport macht.", isCorrect: false },
      ],
    },
  },
  {
    icon: Target,
    title: "Meisterklasse: Einwände behandeln",
    description: "Antworte souverän auf typische Einwände und stärke das Vertrauen deiner Kunden in deine Empfehlung.",
    content: [
      "**Einwand 'Zu teuer':** Bestätigen und den gesundheitlichen Nutzen (Verfügbarkeit, Reinheit) hervorheben.",
      "**Einwand 'Gesunde Ernährung reicht':** Anerkennen, aber auf erhöhten Bedarf in bestimmten Lebenssituationen (Stress, Sport) hinweisen.",
    ],
    quiz: {
      question: "Auf den Einwand 'Ich ernähre mich gesund, das reicht doch!' reagierst du am besten mit:",
      answers: [
        { text: "Nein, das stimmt so nicht.", isCorrect: false },
        { text: "Das ist eine gute Basis. In stressigen Zeiten oder bei viel Sport kann der Bedarf aber trotzdem erhöht sein.", isCorrect: true },
        { text: "Sie müssen dieses Produkt kaufen.", isCorrect: false },
      ],
    },
  },
];

type ChatMessage = {
  role: 'user' | 'model';
  text: string;
};

export default function CompletionPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState<Record<number, { selectedAnswer: number | null; isCorrect: boolean | null }>>({});
  // This state now tracks "attempted" modules, not just "correctly completed" ones.
  const [attemptedModules, setAttemptedModules] = useState<boolean[]>(Array(learningModulesData.length).fill(false));

  // State for Gemini Chat
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const analysisTriggered = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnalyzing(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleAnswerSelect = (moduleIndex: number, answerIndex: number) => {
    // Prevent changing the answer once submitted.
    if (attemptedModules[moduleIndex]) return;

    const isCorrect = learningModulesData[moduleIndex].quiz.answers[answerIndex].isCorrect;
    setActiveQuiz(prev => ({
      ...prev,
      [moduleIndex]: { selectedAnswer: answerIndex, isCorrect: isCorrect }
    }));
    
    // Mark module as "attempted" regardless of correctness to update progress.
    setAttemptedModules(prevAttempted => {
        const newAttempted = [...prevAttempted];
        newAttempted[moduleIndex] = true;
        return newAttempted;
    });
  };

  const progress = (attemptedModules.filter(Boolean).length / learningModulesData.length) * 100;
  const allModulesAttempted = attemptedModules.every(Boolean);

  const callGeminiAPI = useCallback(async (history: ChatMessage[]) => {
    setIsGeminiLoading(true);
    try {
      const systemPrompt = "Du bist ein erfahrener Apotheken-Coach und Experte für Magnesiumcitrat 130. Deine Aufgabe ist es, die Leistung des Nutzers basierend auf seinen konkreten Quiz-Antworten zu analysieren. Auch wenn Antworten falsch sind, bleibe positiv und biete konstruktives Feedback an, um die Wissenslücken zu schließen. Gib ein kurzes, motivierendes Feedback und eröffne dann die Möglichkeit für weiterführende Fragen. Bleibe stets in deiner Rolle als Coach.";
      
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

      if (!apiKey) {
        console.log("API Key is missing, but proceeding in preview environment.");
      }
      
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

      const payload = {
        contents: history.map(msg => ({ role: msg.role, parts: [{ text: msg.text }] })),
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        },
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const result = await response.json();
      const modelResponse = result.candidates?.[0]?.content?.parts?.[0]?.text || "Ich konnte leider keine Antwort generieren. Bitte versuche es noch einmal.";
      setChatHistory(prev => [...prev, { role: 'model', text: modelResponse }]);
    } catch (error) {
      console.error("Gemini API error:", error);
      setChatHistory(prev => [...prev, { role: 'model', text: "Entschuldigung, es ist ein Fehler aufgetreten. Bitte versuche es später erneut." }]);
    } finally {
      setIsGeminiLoading(false);
    }
  }, []);
  
  // Effect to trigger initial analysis when all modules are attempted
  useEffect(() => {
    if (allModulesAttempted && !analysisTriggered.current) {
      analysisTriggered.current = true;
      
      const analysisPrompt = learningModulesData.map((module, index) => {
        const quizState = activeQuiz[index];
        if (quizState && typeof quizState.selectedAnswer === 'number') {
          const selectedAnswer = module.quiz.answers[quizState.selectedAnswer];
          return `Modul "${module.title}":\n- Frage: "${module.quiz.question}"\n- Meine Antwort: "${selectedAnswer.text}" (${quizState.isCorrect ? 'Korrekt' : 'Falsch'})`;
        }
        return `Modul "${module.title}": Keine Antwort aufgezeichnet.`;
      }).join('\n\n');

      const initialUserMessageText = `Ich habe die Lernmodule zu Magnesiumcitrat 130 abgeschlossen. Hier ist eine Zusammenfassung meiner Antworten. Bitte gib mir eine kurze, motivierende Analyse meiner Leistung basierend auf diesen spezifischen Antworten (gehe dabei auch auf die falschen Antworten ein) und eröffne dann die Möglichkeit für ein weiterführendes Gespräch.\n\n---\n\n${analysisPrompt}`;

      const initialUserMessage: ChatMessage = {
        role: 'user',
        text: initialUserMessageText
      };

      setChatHistory([initialUserMessage]);
      callGeminiAPI([initialUserMessage]);
    }
  }, [allModulesAttempted, callGeminiAPI, activeQuiz]);
  
  // Effect to scroll chat to bottom
  useEffect(() => {
    chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
  }, [chatHistory]);


  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isGeminiLoading) return;
    const newUserMessage: ChatMessage = { role: 'user', text: userInput };
    const newHistory = [...chatHistory, newUserMessage];
    setChatHistory(newHistory);
    setUserInput('');
    callGeminiAPI(newHistory);
  };


  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Auswertung & Lernpfad</h1>
              <p className="text-gray-600">Dein persönliches Trainingsprogramm basierend auf der Simulation.</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isAnalyzing ? (
          <Card className="text-center p-8">
            <CardHeader>
              <CardTitle>Analysiere deine Antworten...</CardTitle>
              <CardDescription>Dein persönlicher Lernpfad wird erstellt.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center items-center space-x-2">
                <div className="w-4 h-4 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-4 h-4 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-4 h-4 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div>
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Dein Lernfortschritt</h2>
              <Progress value={progress} className="w-full [&>*]:bg-purple-600" />
              <p className="text-sm text-gray-600 mt-2">{Math.round(progress)}% abgeschlossen</p>
            </div>

            <div className="space-y-6">
              {learningModulesData.map((module, index) => {
                const quizState = activeQuiz[index];
                const isAttempted = attemptedModules[index];
                const wasCorrect = quizState?.isCorrect === true;

                return (
                  <Card key={index} className={`${isAttempted ? (wasCorrect ? 'border-green-500' : 'border-red-500') : ''}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isAttempted ? (wasCorrect ? 'bg-green-100' : 'bg-red-100') : 'bg-purple-600/20'}`}>
                          <module.icon className={`w-5 h-5 ${isAttempted ? (wasCorrect ? 'text-green-600' : 'text-red-600') : 'text-purple-600'}`} />
                        </div>
                        <span>{module.title}</span>
                        {isAttempted && (wasCorrect ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />)}
                      </CardTitle>
                      <CardDescription>{module.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <h4 className="font-semibold text-gray-800 mb-2">Lerninhalte:</h4>
                      <ul className="space-y-2 mb-6">
                        {module.content.map((item, i) => (
                           <li key={i} className="flex items-start space-x-2">
                            <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                             <p className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: item }}></p>
                           </li>
                        ))}
                      </ul>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-3">Wissens-Check:</h4>
                        <p className="text-sm text-gray-700 mb-4">{module.quiz.question}</p>
                        <div className="space-y-2">
                          {module.quiz.answers.map((answer, answerIndex) => {
                            const isSelected = quizState?.selectedAnswer === answerIndex;
                            const buttonClass = isSelected
                              ? quizState.isCorrect ? 'bg-green-200 border-green-500 text-green-900' : 'bg-red-200 border-red-500 text-red-900'
                              : 'bg-white hover:bg-gray-100';
                            return (
                              <Button key={answerIndex} variant="outline" className={`w-full justify-start text-left h-auto whitespace-normal ${buttonClass}`} onClick={() => handleAnswerSelect(index, answerIndex)} disabled={isAttempted}>
                                {isSelected && (quizState.isCorrect ? <CheckCircle className="w-4 h-4 mr-2"/> : <XCircle className="w-4 h-4 mr-2"/>)}
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
            
            {allModulesAttempted && (
                 <Card className="mt-8">
                     <CardHeader>
                         <CardTitle className="flex items-center space-x-2">
                             <Sparkles className="w-6 h-6 text-purple-600"/>
                             <span>Deine persönliche KI-Analyse</span>
                         </CardTitle>
                         <CardDescription>Stelle hier weiterführende Fragen an deinen persönlichen Apotheken-Coach.</CardDescription>
                     </CardHeader>
                     <CardContent>
                         <div ref={chatContainerRef} className="h-80 overflow-y-auto p-4 bg-gray-50 rounded-lg border mb-4 space-y-4">
                             {chatHistory.map((msg, index) => (
                                 <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                     <div className={`max-w-md p-3 rounded-xl ${msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-white border'}`}>
                                         <p className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></p>
                                     </div>
                                 </div>
                             ))}
                             {isGeminiLoading && (
                                <div className="flex justify-start">
                                    <div className="max-w-md p-3 rounded-xl bg-white border">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                        </div>
                                    </div>
                                 </div>
                             )}
                         </div>
                         <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                            <Input 
                                type="text"
                                placeholder="Stelle eine Frage..."
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                disabled={isGeminiLoading}
                                className="flex-grow"
                            />
                            <Button type="submit" disabled={isGeminiLoading || !userInput.trim()} className="bg-purple-600 hover:bg-purple-700">
                                <Send className="w-4 h-4"/>
                            </Button>
                         </form>
                     </CardContent>
                 </Card>
            )}
          </div>
        )}
      </main>
    </div>
  )
}