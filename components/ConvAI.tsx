"use client";

import { Button } from "@/components/ui/button";
import * as React from "react";
import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useConversation } from "@11labs/react";
import { cn } from "@/lib/utils";

async function requestMicrophonePermission(): Promise<boolean> {
  try {
    console.log("🎤 Requesting microphone permission...");
    await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log("✅ Microphone permission granted");
    return true;
  } catch (error) {
    console.error("❌ Microphone permission denied:", error);
    return false;
  }
}

async function getSignedUrl(agentKey?: string): Promise<string> {
  const qs = agentKey ? `?agentKey=${encodeURIComponent(agentKey)}` : "";
  console.log("🔑 Fetching signed URL for agent:", agentKey || "default");
  console.log("📡 API URL:", `/api/signed-url${qs}`);

  const response = await fetch(`/api/signed-url${qs}`);

  console.log("📥 Response status:", response.status, response.statusText);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Failed to get signed url:", errorText);
    throw Error("Failed to get signed url");
  }

  const data: { signedUrl: string } = await response.json();
  console.log("✅ Signed URL received:", data.signedUrl.substring(0, 50) + "...");
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

  const [transcript, setTranscript] = React.useState<TranscriptEntry[]>([]);
  const transcriptRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = transcriptRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [transcript]);

  const conversation = useConversation({
    onConnect: () => {
      console.log("✅ CONNECTED - WebSocket connection established");
      console.log("📊 Connection timestamp:", new Date().toISOString());
      setTranscript((t) => [...t, { kind: "system", text: "Connected" }]);
      props.onConnect?.();
    },
    onDisconnect: () => {
      console.log("❌ DISCONNECTED - WebSocket connection closed");
      console.log("📊 Disconnection timestamp:", new Date().toISOString());
      setTranscript((t) => [...t, { kind: "system", text: "Disconnected" }]);
      props.onDisconnect?.();
    },
    onError: (error: unknown) => {
      console.log("🚨 ERROR occurred in conversation:");
      console.log("Error object:", error);
      console.log("Error type:", typeof error);
      console.log("Error details:", JSON.stringify(error, null, 2));

      if (error instanceof Error) {
        console.log("Error message:", error.message);
        console.log("Error stack:", error.stack);
      }

      props.onError?.(error);
      alert("An error occurred during the conversation");
    },
    onMessage: (message: unknown) => {
      console.log("💬 MESSAGE received:");
      console.log("Message object:", message);
      console.log("Message type:", typeof message);
      console.log("Message details:", JSON.stringify(message, null, 2));

      const entry: TranscriptEntry = (() => {
        if (typeof message === "object" && message !== null) {
          const maybe = message as ElevenMessage;
          const src = maybe.source === "user" || maybe.source === "ai" ? maybe.source : undefined;
          if (src && typeof maybe.message === "string") {
            console.log(`  → Parsed as ${src} message:`, maybe.message);
            return { kind: src, text: maybe.message };
          }
        }
        console.log("  → Parsed as system message:", String(message));
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

    console.log("🛑 End signal received:", props.endSignal);
    lastEndSignalRef.current = props.endSignal;

    (async () => {
      try {
        console.log("📞 Ending session...");
        await conversation.endSession();
        console.log("✅ Session ended successfully");
      } catch (error) {
        console.error("❌ Error ending session:", error);
      } finally {
        props.onEnded?.();
      }
    })();
  }, [props.endSignal, conversation, props]);

  async function startConversation() {
    console.log("🚀 START CONVERSATION CLICKED");
    console.log("📋 Agent key:", props.agentKey);

    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      console.error("❌ No microphone permission");
      alert("No permission");
      return;
    }

    try {
      console.log("🔑 Getting signed URL...");
      const signedUrl = await getSignedUrl(props.agentKey);

      console.log("🚀 Starting session with signed URL...");
      console.log("📊 Session start timestamp:", new Date().toISOString());

      const conversationId = await conversation.startSession({ signedUrl });

      console.log("✅ Session started successfully");
      console.log("📞 Conversation ID:", conversationId);
      console.log("📊 Current conversation status:", conversation.status);

    } catch (error) {
      console.error("❌ Error in startConversation:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
    }
  }

  const stopConversation = useCallback(async () => {
    console.log("🛑 STOP CONVERSATION CLICKED");
    console.log("📊 Current status before stop:", conversation.status);

    try {
      await conversation.endSession();
      console.log("✅ Session ended successfully");
      props.onEnded?.();
    } catch (error) {
      console.error("❌ Error stopping conversation:", error);
    }
  }, [conversation, props]);

  // Log status changes
  useEffect(() => {
    console.log("📊 Conversation status changed:", conversation.status);
    console.log("🔊 Is speaking:", conversation.isSpeaking);
  }, [conversation.status, conversation.isSpeaking]);

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