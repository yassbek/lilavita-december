"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ConvAI from "@/components/ConvAI";
import { BackgroundWave } from "@/components/background-wave";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Timer, Pill, Sparkles, Loader2, Zap, Heart, Users } from "lucide-react";

export default function InterviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId");

  const [isConnected, setIsConnected] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5 * 60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [endSignal, setEndSignal] = useState<number | undefined>(undefined);
  const [transcript, setTranscript] = useState<Array<{ role: "user" | "ai"; text: string; timestamp: string }>>([]);
  const [showIntro, setShowIntro] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    try {
      const seen = typeof window !== "undefined" ? localStorage.getItem("pharmacy_magnesium_intro_seen") : "true";
      if (!seen) setShowIntro(true);
    } catch { }
  }, []);

  useEffect(() => {
    if (!isConnected) return;
    if (!isTimerActive) return;
    if (timeLeft <= 0) {
      handleEndInterview();
      return;
    }
    const id = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, isTimerActive, timeLeft]);

  const handleEndInterview = useCallback(async () => {
    console.log("🛑 handleEndInterview aufgerufen");

    // ✅ Zeige sofort "Analyzing" (User sieht Ladescreen statt Interview)
    setIsAnalyzing(true);
    setIsTimerActive(false);

    // ✅ Stoppe den Agent
    setEndSignal(Date.now());

    // ✅ Warte 3 Sekunden - Agent stoppt in dieser Zeit
    await new Promise(resolve => setTimeout(resolve, 3000));

    const params = new URLSearchParams(searchParams);
    const nextPath = `/completion?${params.toString()}`;

    if (!transcript || transcript.length === 0) {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem('dynamicLearningData');
      }
      router.push(nextPath);
      return;
    }

    try {
      const response = await fetch(`/api/analyze-transcript?type=pharmacy_magnesium&includeOverview=true`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, applicationId }),
      });

      if (response.ok) {
        const data = await response.json();

        if (Array.isArray(data)) {
          // Backward compatibility
          sessionStorage.setItem('dynamicLearningData', JSON.stringify(data));
          sessionStorage.removeItem('dynamicLearningOverview');
        } else if (data.modules) {
          // New format
          sessionStorage.setItem('dynamicLearningData', JSON.stringify(data.modules));
          if (data.overview) {
            sessionStorage.setItem('dynamicLearningOverview', data.overview);
          }
        }
      } else {
        sessionStorage.removeItem('dynamicLearningData');
        sessionStorage.removeItem('dynamicLearningOverview');
      }
    } catch (error) {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem('dynamicLearningData');
      }
    }

    router.push(nextPath);
  }, [applicationId, router, searchParams, transcript]);

  const onConnect = useCallback(() => {
    console.log("✅ onConnect callback - Setting isConnected to true");
    setIsConnected(true);
    setIsTimerActive(true);
  }, []);

  const onDisconnect = useCallback(() => {
    console.log("❌ onDisconnect callback - Setting isConnected to false");
    setIsConnected(false);
    setIsTimerActive(false);
  }, []);

  const onMessage = useCallback((message: unknown) => {
    const m = message as { message: string; source: "user" | "ai" };
    if (!m?.message || !m?.source) return;

    console.log(`💬 Message received from ${m.source}:`, m.message);

    setTranscript((prev) => [
      ...prev,
      { role: m.source, text: m.message, timestamp: new Date().toISOString() },
    ]);

    const el = document.getElementById("transcriptScroll");
    if (el) {
      setTimeout(() => {
        el.scrollTop = el.scrollHeight;
      }, 0);
    }
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-brand animate-spin mx-auto" />
          <h2 className="text-xl font-semibold text-gray-900">Analysiere dein Gespräch...</h2>
          <p className="text-gray-600">Die KI erstellt personalisierte Lernmodule für dich.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-5">
              <div className="w-16 h-16 bg-gradient-to-br from-brand to-brand-accent rounded-lg flex items-center justify-center shadow-md">
                <Pill className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Beratungssimulation</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-gray-600 font-medium">Szenario: Magnesiumcitrat 130</p>
                  <Badge
                    variant="outline"
                    className={`px-2 py-0.5 text-xs ${isConnected ? "border-green-500 text-green-600 bg-green-50" : "border-gray-300 text-gray-600 bg-gray-50"}`}
                  >
                    {isConnected ? "● Gespräch läuft" : "○ Bereit"}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isConnected && (
                <Badge variant="destructive" className="font-medium tabular-nums py-1 px-3 text-base bg-red-100 text-red-700 border-red-200 hover:bg-red-200">
                  <Timer className="w-4 h-4 mr-2" />
                  {formatTime(timeLeft)}
                </Badge>
              )}
              <Badge variant="outline" className="border-brand text-brand bg-brand/10 font-medium">
                <Sparkles className="w-3 h-3 mr-1" />
                KI-Kunde
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Dialog open={showIntro} onOpenChange={(v) => { setShowIntro(v); if (!v) { try { localStorage.setItem("pharmacy_magnesium_intro_seen", "true"); } catch { } } }}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-brand" />
                Deine Aufgabe im HV
              </DialogTitle>
              <DialogDescription>
                <div className="space-y-3 pt-3 text-gray-700 text-base">
                  <p>Ein Kunde betritt die Apotheke. Er klagt über Wadenkrämpfe, Müdigkeit oder sucht etwas zur Entspannung. Deine Ziele:</p>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Users className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
                      <span><strong>Zielgruppen erkennen:</strong> Wadenkrämpfe, Diuretika-Einnahme, Sportler, Stress</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
                      <span><strong>Produktvorteile nennen:</strong> Citratform = hohe Bioverfügbarkeit, Apothekenqualität</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
                      <span><strong>Cross-Selling:</strong> B-Vitamine, Q10, Calcium wenn passend</span>
                    </li>
                    <li>Souverän auf Einwände reagieren (Preis, "Ich esse gesund")</li>
                  </ul>
                  <div className="bg-brand/10 p-3 rounded-md text-sm text-gray-800 mt-2 border border-brand/20">
                    <strong>💡 Tipp:</strong> Bei Diuretika-Patienten ist Magnesium besonders wichtig, da diese Medikamente den Magnesiumverlust erhöhen!
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                className="bg-gradient-to-r from-brand to-brand-accent hover:from-brand-dark hover:to-brand text-white shadow-md hover:shadow-lg transition-all"
                onClick={() => { setShowIntro(false); try { localStorage.setItem("pharmacy_magnesium_intro_seen", "true"); } catch { } }}
              >
                Simulation starten
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className={isConnected ? "grid grid-cols-1 md:grid-cols-2 gap-8 items-start h-[calc(100vh-200px)]" : "flex flex-col items-center"}>
          <div className={isConnected ? "w-full h-full flex flex-col" : "w-full md:w-1/2"}>
            <div className={isConnected ? "flex-grow relative rounded-2xl overflow-hidden shadow-lg border border-gray-200 bg-black" : ""}>
              <ConvAI
                onConnect={onConnect}
                onDisconnect={onDisconnect}
                onMessage={onMessage}
                onEnded={() => { }}
                endSignal={endSignal}
                agentKey="pharmacy_magnesium"
                avatarSrc=""
                hideTranscript
              />
            </div>
            <div className={isConnected ? "mt-6 flex justify-center" : "mt-8 flex justify-center"}>
              {isConnected ? (
                <Button
                  className="rounded-full bg-red-600 hover:bg-red-700 text-white px-8 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  size="lg"
                  onClick={handleEndInterview}
                >
                  Beratung beenden
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="rounded-full border-gray-300 hover:bg-gray-100 px-8"
                  size="lg"
                  onClick={handleEndInterview}
                >
                  Überspringen / Beenden
                </Button>
              )}
            </div>
          </div>

          {isConnected && (
            <div className="w-full h-full">
              <div className="rounded-3xl border border-gray-200 bg-white shadow-lg p-5 h-full flex flex-col" id="transcriptPanel">
                <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
                  <div className="text-sm font-bold text-gray-800 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                    Live Transkript
                  </div>
                  <span className="text-xs text-gray-400">Wird automatisch erstellt</span>
                </div>

                <div className="flex-grow overflow-auto rounded-xl p-4 text-sm bg-gray-50 space-y-4" id="transcriptScroll">
                  {transcript.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 italic">
                      <Sparkles className="w-8 h-8 mb-2 opacity-20" />
                      <p>Das Gespräch beginnt...</p>
                    </div>
                  ) : (
                    <ul className="space-y-4">
                      {transcript.map((m, i) => (
                        <li key={i} className={"flex " + (m.role === "user" ? "justify-end" : "justify-start")}>
                          <div className={
                            "max-w-[85%] rounded-2xl px-4 py-3 shadow-sm whitespace-pre-wrap break-words " +
                            (m.role === "user"
                              ? "bg-brand text-white rounded-tr-none"
                              : "bg-white border border-gray-200 text-gray-800 rounded-tl-none")
                          }>
                            <div className={`mb-1 text-[10px] uppercase tracking-wide font-bold ${m.role === 'user' ? 'text-white/80' : 'text-gray-400'}`}>
                              {m.role === "user" ? "Du (PTA/Apotheker)" : "Kunde"}
                            </div>
                            <div className="text-sm leading-relaxed">{m.text}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <div className="opacity-50">
        <BackgroundWave />
      </div>
    </div>
  );
}