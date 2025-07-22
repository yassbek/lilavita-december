"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  MicOff,
  Phone,
  PhoneOff,
  Volume2,
  MessageSquare,
  User,
  Sparkles,
} from "lucide-react"
import { useConversation } from "@elevenlabs/react"
import Image from "next/image";
import { useSearchParams } from "next/navigation"

export default function InterviewPage() {
  const router = useRouter()
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
  const [interviewStartedAt, setInterviewStartedAt] = useState<Date | null>(null)
  const [interviewEndedAt, setInterviewEndedAt] = useState<Date | null>(null)
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId");

  // Helper: Append message to transcript
  const appendToTranscript = useCallback((role: "user" | "ai", text: string) => {
    setTranscript((prev) => [...prev, { role, text, timestamp: new Date().toISOString() }])
  }, [])

  // ElevenLabs conversation hook
  const conversation = useConversation({
    onConnect: () => {
      setIsConnected(true)
      setConnecting(false)
      setConnectionError(null)
      setInterviewStartedAt(new Date())
    },
    onDisconnect: () => {
      setIsConnected(false)
      setConnecting(false)
    },
    onMessage: (message) => {
      if (typeof message === "string") {
        appendToTranscript("ai", message)
      } else if (typeof message === "object" && message !== null) {
        if (typeof message.message === "string") {
          appendToTranscript("ai", message.message)
        } else if (typeof message.text === "string") {
          appendToTranscript("ai", message.text)
        } else {
          appendToTranscript("ai", JSON.stringify(message))
        }
      }
    },
    onError: (error) => {
      setConnectionError(error?.message || "Unknown error")
      setConnecting(false)
    },
  })

  // Camera/mic permission and video setup
  useEffect(() => {
    let didCancel = false
    async function setupCamera() {
      setPermissionError(null)
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setPermissionError("Camera/microphone not supported in this browser.")
          setHasPermissions(false)
          return
        }
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        if (didCancel) return
        streamRef.current = mediaStream
        setHasPermissions(true)
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      } catch (error: any) {
        setPermissionError("Failed to get camera/microphone permissions.")
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

  // Start interview (agent connection)
  const startInterview = async () => {
    setConnectionError(null)
    if (!hasPermissions) {
      setPermissionError("Camera/microphone permissions required.")
      return
    }
    setConnecting(true)
    try {
      await conversation.startSession({
        agentId: "nIUEIdEBk48Ul9rgT1Fp", // ElevenLabs agent ID
      })
      // Interview start time is set in onConnect
    } catch (error: any) {
      setConnectionError(error?.message || "Failed to start interview.")
      setConnecting(false)
    }
  }

  // End interview: end session, send transcript to Directus, then navigate
  const endInterview = async () => {
    setInterviewEndedAt(new Date())
    await conversation.endSession()
    try {
      await sendTranscriptToDirectus()
    } catch (err) {
      // Optionally handle/report error
    }
    setTimeout(() => {
      router.push("/completion")
    }, 2000)
  }

  // Send transcript to Directus
  const sendTranscriptToDirectus = async () => {
    if (!transcript.length || !applicationId) return;
    const url = process.env.NEXT_PUBLIC_DIRECTUS_URL + `/items/applications/${applicationId}`;
    const token = process.env.NEXT_PUBLIC_DIRECTUS_TOKEN;
    const payload = {
      transcript,
      started_at: interviewStartedAt?.toISOString() || null,
      ended_at: interviewEndedAt?.toISOString() || new Date().toISOString(),
      // Optionally add user/session info here
    };
    await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  }

  // User message sending (if you want to allow user text input, add here)
  // Example: appendToTranscript("user", userMessage)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                {/* Replace Sparkles icon and text with logo */}
                <Image src="/impactfactory_logo.png" alt="Impact Factory Logo" height={40} width={160} className="h-10 w-auto" />
                <div>
                  {/* Optionally, you can keep the subtitle below the logo */}
                  <p className="text-sm text-gray-600">AI-Powered Readiness Assessment</p>
                </div>
              </div>
              <Badge
                variant="outline"
                className={`${
                  isConnected
                    ? "border-green-500 text-green-600 bg-green-50"
                    : "border-gray-300 text-gray-600 bg-gray-50"
                }`}
              >
                {isConnected ? "● Live" : "○ Disconnected"}
              </Badge>
            </div>
            <Badge variant="outline" className="border-brand-gold text-brand-gold bg-yellow-50 font-medium">
              Step 3 of 4
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Interview Area */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Interview Status */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-black mb-2">
              {isConnected ? "Interview in Progress" : "Ready to Begin Your Interview"}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {isConnected
                ? "You're now connected with our AI interviewer. Speak naturally and answer questions about your startup's readiness."
                : "Click 'Start Interview' when you're ready to begin your conversation with our AI interviewer."}
            </p>
          </div>

          {/* Video Section */}
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* User Video */}
              <Card className="overflow-hidden border-2 border-gray-200 shadow-lg">
                <CardContent className="p-0 relative">
                  <div className="aspect-video bg-gray-50">
                    {hasPermissions && !isCameraOff ? (
                      <video ref={videoRef} autoPlay muted className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <div className="text-center">
                          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                            <User className="w-10 h-10 text-gray-400" />
                          </div>
                          <p className="text-gray-600 font-medium">
                            {!hasPermissions ? "Camera Access Required" : "Camera Off"}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {!hasPermissions ? "Please allow camera access to continue" : "Enable camera to be visible"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Label */}
                  <div className="absolute bottom-4 left-4">
                    <div className="bg-black bg-opacity-75 px-3 py-1 rounded-full">
                      <span className="text-white text-sm font-medium">You</span>
                    </div>
                  </div>

                  {/* Mute Indicator */}
                  {isMuted && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-red-500 p-2 rounded-full shadow-lg">
                        <MicOff className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Agent */}
              <Card className="overflow-hidden border-2 border-brand-gold shadow-lg">
                <CardContent className="p-0 relative">
                  <div className="aspect-video bg-gradient-to-br from-brand-gold via-yellow-400 to-yellow-500 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <MessageSquare className="w-12 h-12 text-white" />
                      </div>
                      <h3 className="text-white font-bold text-xl mb-1">AI Interviewer</h3>
                      <p className="text-white text-sm opacity-90">Impact Factory Assessment</p>
                      {conversation.isSpeaking && (
                        <div className="mt-3 flex items-center justify-center space-x-1">
                          <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-white rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-white rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* AI Label */}
                  <div className="absolute bottom-4 left-4">
                    <div className="bg-black bg-opacity-75 px-3 py-1 rounded-full">
                      <span className="text-white text-sm font-medium">AI Agent</span>
                    </div>
                  </div>

                  {/* Speaking Indicator */}
                  {conversation.isSpeaking && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-green-500 p-2 rounded-full shadow-lg animate-pulse">
                        <Volume2 className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center py-8">
            {/* Main Action Button Only, Centered */}
            {!isConnected ? (
              <Button
                onClick={startInterview}
                disabled={!hasPermissions || connecting}
                className="bg-brand-gold hover:bg-yellow-500 text-black font-bold px-8 py-4 text-lg rounded-full shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <Phone className="w-5 h-5 mr-3" />
                Start Interview
              </Button>
            ) : (
              <Button
                onClick={endInterview}
                className="bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-4 text-lg rounded-full shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <PhoneOff className="w-5 h-5 mr-3" />
                End Interview
              </Button>
            )}
          </div>

          {/* Status Message */}
          {isConnected && (
            <div className="mt-8 text-center">
              <div className="inline-flex items-center space-x-3 bg-green-50 px-6 py-3 rounded-full border border-green-200">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 font-medium">Interview in progress - Speak naturally</span>
              </div>
            </div>
          )}
          {!hasPermissions && (
            <div className="mt-8 text-center">
              <div className="inline-flex items-center space-x-3 bg-yellow-50 px-6 py-3 rounded-full border border-yellow-200">
                <span className="text-yellow-700 font-medium">
                  Camera and microphone access required to continue
                </span>
              </div>
            </div>
          )}
          {permissionError && (
            <div className="mt-8 text-center">
              <div className="inline-flex items-center space-x-3 bg-red-50 px-6 py-3 rounded-full border border-red-200">
                <span className="text-red-700 font-medium">{permissionError}</span>
              </div>
            </div>
          )}
          {connectionError && (
            <div className="mt-8 text-center">
              <div className="inline-flex items-center space-x-3 bg-red-50 px-6 py-3 rounded-full border border-red-200">
                <span className="text-red-700 font-medium">{connectionError}</span>
              </div>
            </div>
          )}

          {/* Interview Tips */}
          {!isConnected && (
            <div className="max-w-4xl mx-auto">
              <Card className="border border-gray-200 bg-gray-50">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-black mb-4 text-center">Interview Tips</h3>
                  <div className="grid md:grid-cols-3 gap-6 text-sm">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-brand-gold rounded-full flex items-center justify-center mx-auto mb-3">
                        <MessageSquare className="w-6 h-6 text-black" />
                      </div>
                      <h4 className="font-medium text-black mb-2">Speak Clearly</h4>
                      <p className="text-gray-600">
                        Answer questions naturally and clearly. The AI will assess your responses in real-time.
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-brand-gold rounded-full flex items-center justify-center mx-auto mb-3">
                        <Sparkles className="w-6 h-6 text-black" />
                      </div>
                      <h4 className="font-medium text-black mb-2">Be Authentic</h4>
                      <p className="text-gray-600">
                        Share genuine insights about your startup, team, and vision for impact.
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-brand-gold rounded-full flex items-center justify-center mx-auto mb-3">
                        <User className="w-6 h-6 text-black" />
                      </div>
                      <h4 className="font-medium text-black mb-2">Stay Focused</h4>
                      <p className="text-gray-600">
                        The interview covers technology, team, and impact readiness. Stay engaged throughout.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
