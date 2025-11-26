"use client";

import { Button } from "@/components/ui/button";
import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useConversation } from "@11labs/react";
import { cn } from "@/lib/utils";

async function requestMicrophonePermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      }
    });

    // Keep stream active
    stream.getAudioTracks().forEach(track => {
      track.enabled = true;
    });

    return true;
  } catch (error) {
    console.error("Microphone permission denied:", error);
    return false;
  }
}

async function getSignedUrl(agentKey?: string): Promise<string> {
  const qs = agentKey ? `?agentKey=${encodeURIComponent(agentKey)}` : "";
  const response = await fetch(`/api/signed-url${qs}`);

  if (!response.ok) {
    throw Error("Failed to get signed url");
  }

  const data: { signedUrl: string } = await response.json();
  return data.signedUrl;
}

type ConvAIProps = {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: unknown) => void;
  onMessage?: (message: unknown) => void;
  endSignal?: number;
  onEnded?: () => void;
  agentKey?: string;
  hideTranscript?: boolean;
  avatarSrc?: string;
};

export function ConvAI(props: ConvAIProps) {
  type TranscriptEntry =
    | { kind: "system"; text: string }
    | { kind: "user" | "ai"; text: string };

  type ElevenMessage = {
    message?: string;
    source?: "user" | "ai" | string;
  };

  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const [isManualDisconnect, setIsManualDisconnect] = useState(false);
  const conversationIdRef = useRef<string | null>(null);

  useEffect(() => {
    const el = transcriptRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [transcript]);

  const conversation = useConversation({
    onConnect: () => {
      console.log("✅ Connected");
      setIsManualDisconnect(false);
      setTranscript((t) => [...t, { kind: "system", text: "Connected" }]);
      props.onConnect?.();
    },
    onDisconnect: () => {
      console.log("❌ Disconnected");

      // Nur onDisconnect callback aufrufen wenn manuell disconnected
      if (isManualDisconnect) {
        setTranscript((t) => [...t, { kind: "system", text: "Disconnected" }]);
        props.onDisconnect?.();
      } else {
        // Auto-reconnect bei unerwarteter Trennung
        console.log("🔄 Unexpected disconnect, attempting reconnect...");
        setTimeout(() => {
          if (conversationIdRef.current) {
            startConversation();
          }
        }, 1000);
      }
    },
    onError: (error: unknown) => {
      console.error("🚨 Error:", error);
      props.onError?.(error);
    },
    onMessage: (message: unknown) => {
      console.log("💬 Message:", message);

      const entry: TranscriptEntry = (() => {
        if (typeof message === "object" && message !== null) {
          const maybe = message as ElevenMessage;
          const src = maybe.source === "user" || maybe.source === "ai" ? maybe.source : undefined;
          if (src && typeof maybe.message === "string") {
            return { kind: src, text: maybe.message };
          }
        }
        return { kind: "system", text: String(message) };
      })();

      setTranscript((t) => [...t, entry]);
      props.onMessage?.(message);
    },
  });

  const lastEndSignalRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (props.endSignal === undefined) return;
    if (props.endSignal === lastEndSignalRef.current) return;

    lastEndSignalRef.current = props.endSignal;

    (async () => {
      try {
        setIsManualDisconnect(true);
        await conversation.endSession();
      } finally {
        conversationIdRef.current = null;
        props.onEnded?.();
      }
    })();
  }, [props.endSignal, conversation, props]);

  async function startConversation() {
    try {
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        alert("Microphone permission required");
        return;
      }

      const signedUrl = await getSignedUrl(props.agentKey);

      const conversationId = await conversation.startSession({
        signedUrl,
      });

      conversationIdRef.current = conversationId;
      console.log("✅ Session started:", conversationId);

    } catch (error) {
      console.error("❌ Error starting conversation:", error);
      alert("Failed to start conversation. Please try again.");
    }
  }

  const stopConversation = useCallback(async () => {
    try {
      setIsManualDisconnect(true);
      await conversation.endSession();
      conversationIdRef.current = null;
      props.onEnded?.();
    } catch (error) {
      console.error("Error stopping conversation:", error);
    }
  }, [conversation, props]);

  return (
    <div className={"flex justify-center items-center gap-x-4"}>
      <Card className={"rounded-3xl w-full bg-white shadow-md"}>
        <CardContent>
          <CardHeader>
            <CardTitle className={"text-center"}>
              {conversation.status === "connected"
                ? conversation.isSpeaking
                  ? `Agent is speaking`
                  : "Agent is listening"
                : "Disconnected"}
            </CardTitle>
            <div className="mt-2 flex items-center justify-center gap-2 text-sm">
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1",
                  conversation.status === "connected"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-700"
                )}
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    conversation.status === "connected" ? "bg-green-600" : "bg-gray-400"
                  )}
                />
                {conversation.status === "connected" ? "Online" : "Offline"}
              </span>
            </div>
          </CardHeader>
          <div className={"flex flex-col items-center gap-y-4 text-center"}>
            <div className="relative my-16 mx-auto self-center">
              <div
                className={cn(
                  "orb z-0",
                  conversation.status === "connected" && conversation.isSpeaking
                    ? "orb-active animate-orb"
                    : conversation.status === "connected"
                      ? "animate-orb-slow orb-inactive"
                      : "orb-inactive"
                )}
              ></div>
              {props.avatarSrc ? (
                <Image
                  src={props.avatarSrc}
                  alt="Avatar"
                  width={220}
                  height={220}
                  priority
                  className="absolute inset-0 m-auto h-[220px] w-[220px] rounded-full object-cover pointer-events-none z-10"
                />
              ) : null}
            </div>

            <Button
              variant={"outline"}
              className={"rounded-full"}
              size={"lg"}
              disabled={conversation.status === "connected"}
              onClick={startConversation}
            >
              Start conversation
            </Button>
            <Button
              variant={"outline"}
              className={"rounded-full"}
              size={"lg"}
              onClick={stopConversation}
            >
              End conversation
            </Button>

            {!props.hideTranscript && (
              <div className="mx-6 mt-4 text-left">
                <div className="text-sm font-semibold mb-2">Live transcript</div>
                <div
                  ref={transcriptRef}
                  className="max-h-64 overflow-auto rounded border p-3 text-sm bg-white/60"
                >
                  {transcript.length === 0 ? (
                    <div className="text-gray-500">No messages yet.</div>
                  ) : (
                    <ul className="space-y-3">
                      {transcript.map((e: TranscriptEntry, i: number) => {
                        if (e.kind === "system") {
                          return (
                            <li key={i} className="text-center text-xs text-gray-500">
                              {e.text}
                            </li>
                          );
                        }
                        const isUser = e.kind === "user";
                        return (
                          <li key={i} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
                            <div
                              className={cn(
                                "max-w-[85%] rounded-2xl px-3 py-2 whitespace-pre-wrap break-words",
                                isUser ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
                              )}
                            >
                              <div className="mb-1 text-[10px] uppercase tracking-wide opacity-70">
                                {isUser ? "You" : "AI"}
                              </div>
                              <div className="text-sm leading-relaxed">{e.text}</div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ConvAI;