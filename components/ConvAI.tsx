"use client";

import { Button } from "@/components/ui/button";
import * as React from "react";
import { useCallback, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useConversation } from "@11labs/react";
import { cn } from "@/lib/utils";

async function requestMicrophonePermission(): Promise<boolean> {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    return true;
  } catch {
    console.error("Microphone permission denied");
    return false;
  }
}

async function getSignedUrl(agentKey?: string): Promise<string> {
  const qs = agentKey ? `?agentKey=${encodeURIComponent(agentKey)}` : "";
  const response = await fetch(`/api/signed-url${qs}`);
  if (!response.ok) {
    throw Error("Failed to get signed url");
  }
  // Explicitly type the expected JSON shape
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
  agentKey?: string; // selects env-based agent id on the server
  hideTranscript?: boolean; // when true, do not render internal transcript list
};

export function ConvAI(props: ConvAIProps) {
  type TranscriptEntry =
    | { kind: "system"; text: string }
    | { kind: "user" | "ai"; text: string };

  // Message shape hint from 11labs react hook events
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
      console.log("connected");
      setTranscript((t) => [...t, { kind: "system", text: "Connected" }]);
      props.onConnect?.();
    },
    onDisconnect: () => {
      console.log("disconnected");
      setTranscript((t) => [...t, { kind: "system", text: "Disconnected" }]);
      props.onDisconnect?.();
    },
    onError: (error: unknown) => {
      console.log(error);
      props.onError?.(error);
      alert("An error occurred during the conversation");
    },
    onMessage: (message: unknown) => {
      console.log(message);
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
        await conversation.endSession();
      } finally {
        props.onEnded?.();
      }
    })();
  }, [props.endSignal, conversation, props]);

  async function startConversation() {
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      alert("No permission");
      return;
    }
    const signedUrl = await getSignedUrl(props.agentKey);
    const conversationId = await conversation.startSession({ signedUrl });
    console.log(conversationId);
  }

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
    props.onEnded?.();
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
            <div
              className={cn(
                "orb my-16 mx-auto self-center",
                conversation.status === "connected" && conversation.isSpeaking
                  ? "orb-active animate-orb"
                  : conversation.status === "connected"
                  ? "animate-orb-slow orb-inactive"
                  : "orb-inactive"
              )}
            ></div>

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
