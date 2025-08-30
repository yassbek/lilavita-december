"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ConvAI from "@/components/ConvAI";
import { BackgroundWave } from "@/components/background-wave";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Timer } from "lucide-react";

export default function InterviewFinancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId");

  const [isConnected, setIsConnected] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20 * 60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [endSignal, setEndSignal] = useState(0);
  const [transcript, setTranscript] = useState<Array<{ role: "user" | "ai"; text: string; timestamp: string }>>([]);
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    try {
      const seen = typeof window !== "undefined" ? localStorage.getItem("ifa_interview_intro_seen") : "true";
      if (!seen) setShowIntro(true);
    } catch {}
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
    setIsTimerActive(false);
    setEndSignal((s) => s + 1);
    const params = new URLSearchParams(searchParams);

    if (!applicationId) {
      router.push(`/completion_finance?${params.toString()}`);
      return;
    }

    if (!transcript || transcript.length === 0) {
      router.push(`/completion_finance?${params.toString()}`);
      return;
    }

    fetch(`/api/analyze-transcript?type=finanzierung`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript, applicationId }),
    }).catch(() => {});
    router.push(`/completion_finance?${params.toString()}`);
  }, [applicationId, router, searchParams, transcript]);

  const onConnect = useCallback(() => {
    setIsConnected(true);
    setIsTimerActive(true);
  }, []);

  const onDisconnect = useCallback(() => {
    setIsConnected(false);
    setIsTimerActive(false);
  }, []);

  const onMessage = useCallback((message: unknown) => {
    const m = message as { message: string; source: "user" | "ai" };
    if (!m?.message || !m?.source) return;
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-5">
              <div className="w-16 h-16 bg-brand rounded-lg flex items-center justify-center">
                <Image src="/impactfactory_logo.png" alt="Impact Factory Logo" width={48} height={48} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">KI-gestütztes Interview</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-gray-600">Finanzierungs-Assessment</p>
                  <Badge
                    variant="outline"
                    className={`px-2 py-0.5 text-xs ${isConnected ? "border-green-500 text-green-600 bg-green-50" : "border-gray-300 text-gray-600 bg-gray-50"}`}
                  >
                    {isConnected ? "● Live" : "○ Offline"}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isConnected && (
                <Badge variant="destructive" className="font-medium tabular-nums py-1 px-3 text-base">
                  <Timer className="w-4 h-4 mr-2" />
                  {formatTime(timeLeft)}
                </Badge>
              )}
              <Badge variant="outline" className="border-brand text-brand bg-brand/10 font-medium">
                Schritt 4 von 5
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Dialog open={showIntro} onOpenChange={(v) => { setShowIntro(v); if (!v) { try { localStorage.setItem("ifa_interview_intro_seen", "true"); } catch {} } }}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>So funktioniert dein Interview</DialogTitle>
              <DialogDescription>
                <div className="space-y-3 pt-2 text-gray-700">
                  <p>- Starte das Gespräch mit „Start conversation“ und beende es, wenn du fertig bist.</p>
                  <p>- Falls die Verbindung abbricht oder du unzufrieden bist: erneut auf „Start conversation“ klicken und neu starten.</p>
                  <p>- Mit „Nächster Schritt“ geht es sofort weiter. Gewertet wird nur der letzte Durchlauf.</p>
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => { setShowIntro(false); try { localStorage.setItem("ifa_interview_intro_seen", "true"); } catch {} }}>Verstanden</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {!isConnected ? (
          <div className="flex flex-col items-center">
            <div className="w-full md:w-1/2">
              <ConvAI
                onConnect={onConnect}
                onDisconnect={onDisconnect}
                onMessage={onMessage}
                onEnded={() => {}}
                endSignal={endSignal}
                agentKey="finance"
                avatarSrc="/anne_profile.jpeg"
                hideTranscript
              />
            </div>
            <div className="mt-6 flex justify-center">
              <Button
                variant="outline"
                className="rounded-full"
                size="lg"
                onClick={handleEndInterview}
              >
                Nächster Schritt
              </Button>
            </div>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="w-full">
            <ConvAI
              onConnect={onConnect}
              onDisconnect={onDisconnect}
              onMessage={onMessage}
              onEnded={() => {}}
              endSignal={endSignal}
              agentKey="finance"
              avatarSrc="/anne_profile.jpeg"
              hideTranscript
            />
            <div className="mt-6 flex justify-center">
              <Button
                variant="outline"
                className="rounded-full"
                size="lg"
                onClick={handleEndInterview}
              >
                Nächster Schritt
              </Button>
            </div>
          </div>
          <div className="w-full">
              <div className="rounded-3xl border bg-white shadow-md p-4 h-full" id="transcriptPanel">
                <div className="text-sm font-semibold mb-2">Live transcript</div>
                <div className="max-h-[540px] overflow-auto rounded border p-3 text-sm bg-white/60" id="transcriptScroll">
                  {transcript.length === 0 ? (
                    <div className="text-gray-500">No messages yet.</div>
                  ) : (
                    <ul className="space-y-3">
                      {transcript.map((m, i) => (
                        <li key={i} className={"flex " + (m.role === "user" ? "justify-end" : "justify-start") }>
                          <div className={("max-w-[85%] rounded-2xl px-3 py-2 whitespace-pre-wrap break-words ") + (m.role === "user" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900") }>
                            <div className="mb-1 text-[10px] uppercase tracking-wide opacity-70">
                              {m.role === "user" ? "You" : "AI"}
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
        </div>
        )}
      </main>
      <BackgroundWave />
    </div>
  );
}