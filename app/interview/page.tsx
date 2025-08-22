"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image";
import { useConversation } from "@elevenlabs/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MicOff, Phone, PhoneOff, Volume2, User, Timer } from "lucide-react"

export default function InterviewPage() {
    const router = useRouter()
    const searchParams = useSearchParams();
    const applicationId = searchParams.get("applicationId");

    const [isConnected, setIsConnected] = useState(false)
    const [isMuted] = useState(false)
    const [isCameraOff] = useState(false)
    const [hasPermissions, setHasPermissions] = useState(false)
    const [permissionError, setPermissionError] = useState<string | null>(null)
    const [connecting, setConnecting] = useState(false)
    const [connectionError, setConnectionError] = useState<string | null>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const [transcript, setTranscript] = useState<Array<{ role: "user" | "ai"; text: string; timestamp: string }>>([])

    // Status für den Timer
    const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 Minuten in Sekunden
    const [isTimerActive, setIsTimerActive] = useState(false);


    const appendToTranscript = useCallback((role: "user" | "ai", text: string) => {
        setTranscript((prev) => [...prev, { role, text, timestamp: new Date().toISOString() }])
    }, [])

    const conversation = useConversation({
        onConnect: () => {
            setIsConnected(true)
            setConnecting(false)
            setConnectionError(null)
            setIsTimerActive(true); // Timer starten, wenn die Verbindung steht
        },
        onDisconnect: () => {
            setIsConnected(false)
            setConnecting(false)
            setIsTimerActive(false); // Timer anhalten
        },
        onMessage: (props: { message: string; source: "user" | "ai" }) => {
            appendToTranscript(props.source, props.message);
        },
        onError: (error: { message?: string } | string) => {
            let message: string;
            if (typeof error === 'string') {
                message = error;
            } else {
                message = error?.message || "Unknown error";
            }
            setConnectionError(message)
            setConnecting(false)
        },
    })

    useEffect(() => {
        let didCancel = false
        async function setupCamera() {
            setPermissionError(null)
            try {
                if (!navigator.mediaDevices?.getUserMedia) {
                    setPermissionError("Kamera/Mikrofon wird nicht unterstützt.")
                    return
                }
                const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                if (didCancel) return
                streamRef.current = mediaStream
                setHasPermissions(true)
            } catch {
                setPermissionError("Kamera-/Mikrofonberechtigungen erforderlich.")
                setHasPermissions(false)
            }
        }
        setupCamera()
        return () => {
            didCancel = true
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop())
            }
        }
    }, [])

    useEffect(() => {
        if (hasPermissions && !isCameraOff && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
        }
    }, [hasPermissions, isCameraOff, videoRef, streamRef]);

    useEffect(() => {
        const handleBeforeUnload = () => {
            if (isConnected) {
                conversation.endSession();
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [conversation, isConnected]);

    // Effekt für die Timer-Logik
    useEffect(() => {
        // Timer läuft nur, wenn er aktiv ist und eine Verbindung besteht
        if (!isTimerActive || !isConnected) return;

        // Wenn die Zeit abgelaufen ist, Interview beenden
        if (timeLeft <= 0) {
            endInterview();
            return;
        }

        // Jede Sekunde die Zeit reduzieren
        const intervalId = setInterval(() => {
            setTimeLeft((prevTime) => prevTime - 1);
        }, 1000);

        // Aufräumfunktion, um den Intervall zu stoppen
        return () => clearInterval(intervalId);
    }, [isTimerActive, isConnected, timeLeft]);


    const startInterview = async () => {
        setConnectionError(null)
        if (!hasPermissions) {
            setPermissionError("Berechtigungen sind erforderlich.")
            return
        }
        setConnecting(true)
        try {
            await conversation.startSession({
                agentId: "nIUEIdEBk48Ul9rgT1Fp",
                connectionType: "webrtc",
            })
        } catch (error) {
            let message = "Interview konnte nicht gestartet werden.";
            if (error instanceof Error) {
                message = error.message;
            }
            setConnectionError(message);
            setConnecting(false);
        }
    }

    const sendTranscriptToDirectus = async () => {
        if (!applicationId || transcript.length === 0) return;
        
        const url = `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/items/applications/${applicationId}`;
        const token = process.env.NEXT_PUBLIC_DIRECTUS_TOKEN;

        if (!token) {
            console.error("Directus Fehler: Token fehlt.");
            return;
        }

        try {
            await fetch(url, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ transcript }),
            });
        } catch (err) {
            console.error("Netzwerkfehler beim Senden an Directus:", err);
        }
    }

    // Die endInterview Funktion wird jetzt als useCallback deklariert, um sie stabil zu machen
    const endInterview = useCallback(async () => {
        setIsTimerActive(false); // Timer anhalten
        await conversation.endSession();
        await sendTranscriptToDirectus();

        const params = new URLSearchParams(searchParams);
        router.push(`/completion?${params.toString()}`);

        fetch('/api/analyze-transcript', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transcript, applicationId }),
        })
        .then(res => res.json())
        .then(data => console.log("Gemini analyze-transcript response:", data))
        .catch(err => console.error("Error calling analyze-transcript:", err));
    }, [applicationId, conversation, router, searchParams, transcript]);

    // Funktion zur Zeitformatierung
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
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
                                    <p className="text-gray-600">Readiness Assessment</p>
                                    <Badge
                                        variant="outline"
                                        className={`px-2 py-0.5 text-xs ${isConnected ? "border-green-500 text-green-600 bg-green-50" : "border-gray-300 text-gray-600 bg-gray-50"}`}
                                    >
                                        {isConnected ? "● Live" : "○ Offline"}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        {/* Timer-Anzeige im Header */}
                        <div className="flex items-center space-x-4">
                            {isConnected && (
                                <Badge variant="destructive" className="font-medium tabular-nums py-1 px-3 text-base">
                                    <Timer className="w-4 h-4 mr-2" />
                                    {formatTime(timeLeft)}
                                </Badge>
                            )}
                            <Badge variant="outline" className="border-brand text-brand bg-brand/10 font-medium">
                                Schritt 1 von 5
                            </Badge>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            {isConnected ? "Interview läuft" : "Bereit für dein Interview"}
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            {isConnected
                                ? "Du bist jetzt mit unserem KI-Interviewer verbunden. Sprich natürlich und beantworte die Fragen."
                                : "Klicke auf 'Interview starten', wenn du bereit für das Gespräch mit unserem KI-Interviewer bist."}
                        </p>
                    </div>

                    <div className="max-w-5xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Dein Video */}
                            <Card className="overflow-hidden border-2 border-gray-200 shadow-lg">
                                <CardContent className="p-0 relative">
                                    <div className="aspect-video bg-gray-100">
                                        {hasPermissions && !isCameraOff ? (
                                            <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                <div className="text-center text-gray-500">
                                                    <User className="w-10 h-10 mx-auto mb-2" />
                                                    <p className="font-medium">
                                                        {!hasPermissions ? "Kamerazugriff erforderlich" : "Kamera aus"}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-full">
                                        <span className="text-white text-sm font-medium">Du</span>
                                    </div>
                                    {isMuted && (
                                        <div className="absolute top-4 right-4 bg-red-500 p-2 rounded-full shadow-lg">
                                            <MicOff className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* KI-Agent */}
                            <Card className={`overflow-hidden border-2 border-brand shadow-lg transition-transform duration-300 ease-in-out ${conversation.isSpeaking ? 'scale-[1.02]' : 'scale-100'}`}>
                                <CardContent className="p-0 relative">
                                    <div className="aspect-video relative">
                                        <Image
                                            src="/roman_profile.jpeg"
                                            alt="Profilbild des KI-Interviewers Roman"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-full">
                                        <span className="text-white text-sm font-medium">KI Agent</span>
                                    </div>
                                    {conversation.isSpeaking && (
                                        <div className="absolute top-4 right-4 bg-white/30 p-2 rounded-full shadow-lg animate-pulse">
                                            <Volume2 className="w-5 h-5 text-white" />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Button-Container mit Zusatztext */}
                    <div className="flex flex-col items-center justify-center py-6">
                        {!isConnected ? (
                            <Button
                                onClick={startInterview}
                                disabled={!hasPermissions || connecting}
                                className="bg-brand hover:bg-brand/90 text-black font-bold px-8 py-4 text-lg rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 disabled:bg-gray-300 disabled:scale-100"
                            >
                                <Phone className="w-5 h-5 mr-3" />
                                {connecting ? "Verbinde..." : "Interview starten"}
                            </Button>
                        ) : (
                            <>
                                <Button
                                    onClick={endInterview}
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 text-lg rounded-full shadow-lg transition-all duration-200 transform hover:scale-105"
                                >
                                    <PhoneOff className="w-5 h-5 mr-3" />
                                    Interview beenden
                                </Button>
                                <p className="text-gray-500 text-sm mt-4 text-center">
                                    Wenn Sie fertig sind, drücken Sie auf &apos;Interview beenden&apos;.<br />
                                    Die Weiterleitung kann einen Moment dauern, während Ihr Gespräch analysiert wird.
                                </p>
                            </>
                        )}
                    </div>

                    {(permissionError || connectionError) && (
                        <div className="text-center">
                            <div className="inline-flex items-center bg-red-50 px-5 py-2 rounded-full border border-red-200">
                                <span className="text-red-700 font-medium">{permissionError || connectionError}</span>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}