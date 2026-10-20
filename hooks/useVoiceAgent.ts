"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BuildState, VoiceChoice } from "@/lib/types";

type Status =
  | "idle"
  | "connecting"
  | "listening"
  | "thinking"
  | "speaking"
  | "error";

type ToolResult = {
  call_id: string;
  result: unknown;
  is_error?: boolean;
};

function bytesToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const size = 0x8000;
  for (let i = 0; i < bytes.length; i += size) {
    binary += String.fromCharCode(...bytes.subarray(i, i + size));
  }
  return btoa(binary);
}

export function useVoiceAgent({
  build,
  voice,
  pace,
  onBuildChange
}: {
  build: BuildState;
  voice: VoiceChoice["id"];
  pace: "relaxed" | "brisk";
  onBuildChange: (updater: (current: BuildState) => BuildState) => void;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [partial, setPartial] = useState("");
  const [error, setError] = useState("");

  const wsRef = useRef<WebSocket | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const workletRef = useRef<AudioWorkletNode | null>(null);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const playbackTimeRef = useRef(0);
  const readyRef = useRef(false);
  const stateRef = useRef(build);
  const lastEventRef = useRef<string | null>(null);
  const pendingToolsRef = useRef<ToolResult[]>([]);

  useEffect(() => {
    stateRef.current = build;
  }, [build]);

  const flushPlayback = useCallback(() => {
    for (const source of sourcesRef.current) {
      try {
        source.stop();
        source.disconnect();
      } catch {}
    }
    sourcesRef.current.clear();
    const context = audioRef.current;
    playbackTimeRef.current = context?.currentTime ?? 0;
  }, []);

  const playAudio = useCallback((base64: string) => {
    const context = audioRef.current;
    if (!context) return;

    const raw = atob(base64);
    const pcm = new Int16Array(raw.length / 2);
    for (let i = 0; i < pcm.length; i++) {
      pcm[i] =
        raw.charCodeAt(i * 2) |
        (raw.charCodeAt(i * 2 + 1) << 8);
    }

    const buffer = context.createBuffer(1, pcm.length, 24_000);
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < pcm.length; i++) channel[i] = pcm[i] / 32768;

    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    const startAt = Math.max(context.currentTime, playbackTimeRef.current);
    source.start(startAt);
    playbackTimeRef.current = startAt + buffer.duration;
    sourcesRef.current.add(source);
    source.onended = () => sourcesRef.current.delete(source);
  }, []);

  const sendToolResults = useCallback(() => {
    const ws = wsRef.current;
    if (
      !ws ||
      ws.readyState !== WebSocket.OPEN ||
      lastEventRef.current !== "reply.done"
    ) {
      return;
    }

    for (const tool of pendingToolsRef.current) {
      ws.send(
        JSON.stringify({
          type: "tool.result",
          call_id: tool.call_id,
          result: JSON.stringify(tool.result),
          is_error: tool.is_error ?? false
        })
      );
    }
    pendingToolsRef.current = [];
  }, []);

  const runTool = useCallback(
    (name: string, args: Record<string, unknown>) => {
      const current = stateRef.current;
      const step = current.plan.steps[current.currentStep];

      if (name === "get_build_state") {
        return {
          title: current.plan.title,
          current_step_number: current.currentStep + 1,
          total_steps: current.plan.steps.length,
          current_step: step,
          missing_parts: current.missingParts,
          two_person_mode: current.twoPerson
        };
      }

      if (name === "set_part_status") {
        const partId = String(args.part_id);
        const status = String(args.status);
        onBuildChange((value) => ({
          ...value,
          checkedParts:
            status === "present"
              ? Array.from(new Set([...value.checkedParts, partId]))
              : value.checkedParts.filter((id) => id !== partId),
          missingParts:
            status === "missing"
              ? Array.from(new Set([...value.missingParts, partId]))
              : value.missingParts.filter((id) => id !== partId)
        }));
        return { saved: true, part_id: partId, status };
      }

      if (name === "confirm_hazard") {
        if (!step || step.hazard === "none") {
          return { saved: false, reason: "This step has no safety gate." };
        }
        onBuildChange((value) => ({
          ...value,
          confirmedHazards: Array.from(
            new Set([...value.confirmedHazards, step.id])
          )
        }));
        return { saved: true, step_id: step.id };
      }

      if (name === "complete_current_step") {
        if (
          step?.hazard !== "none" &&
          !current.confirmedHazards.includes(step.id)
        ) {
          return {
            saved: false,
            blocked: true,
            reason: `Ask the user to confirm: ${step.confirmation}`
          };
        }

        onBuildChange((value) => {
          const active = value.plan.steps[value.currentStep];
          const completed = Array.from(
            new Set([...value.completedSteps, active.id])
          );
          const next = Math.min(
            value.currentStep + 1,
            value.plan.steps.length - 1
          );
          const finished = completed.length === value.plan.steps.length;
          return {
            ...value,
            completedSteps: completed,
            currentStep: next,
            finishedAt: finished ? new Date().toISOString() : value.finishedAt
          };
        });
        return { saved: true, next_step_number: current.currentStep + 2 };
      }

      if (name === "go_to_step") {
        const requested = Number(args.step_number) - 1;
        const next = Math.max(
          0,
          Math.min(current.plan.steps.length - 1, requested)
        );
        onBuildChange((value) => ({ ...value, currentStep: next }));
        return { saved: true, step_number: next + 1 };
      }

      return { error: `Unknown tool: ${name}` };
    },
    [onBuildChange]
  );

  const disconnect = useCallback(() => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "session.end" }));
    }
    readyRef.current = false;
    flushPlayback();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    sourceRef.current?.disconnect();
    workletRef.current?.disconnect();
    void audioRef.current?.close();
    wsRef.current = null;
    streamRef.current = null;
    audioRef.current = null;
    setStatus("idle");
  }, [flushPlayback]);

  const connect = useCallback(async () => {
    try {
      setError("");
      setStatus("connecting");

      const tokenResponse = await fetch("/api/voice-token", {
        cache: "no-store"
      });
      const tokenData = await tokenResponse.json();
      if (!tokenResponse.ok) throw new Error(tokenData.error);

      const context = new AudioContext();
      await context.resume();
      await context.audioWorklet.addModule("/pcm-processor.js");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: false,
          autoGainControl: true
        }
      });

      const source = context.createMediaStreamSource(stream);
      const worklet = new AudioWorkletNode(context, "kitwise-pcm", {
        processorOptions: {
          inputSampleRate: context.sampleRate,
          targetSampleRate: 24_000
        }
      });
      const silentGain = context.createGain();
      silentGain.gain.value = 0;
      source.connect(worklet);
      worklet.connect(silentGain);
      silentGain.connect(context.destination);

      audioRef.current = context;
      streamRef.current = stream;
      sourceRef.current = source;
      workletRef.current = worklet;
      playbackTimeRef.current = context.currentTime;

      const wsUrl = new URL("wss://agents.assemblyai.com/v1/ws");
      wsUrl.searchParams.set("token", tokenData.token);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      worklet.port.onmessage = (event: MessageEvent<ArrayBuffer>) => {
        if (readyRef.current && ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              type: "input.audio",
              audio: bytesToBase64(event.data)
            })
          );
        }
      };

      ws.onopen = () => {
        const current = stateRef.current;
        const stateSummary = JSON.stringify({
          title: current.plan.title,
          currentStep: current.currentStep + 1,
          totalSteps: current.plan.steps.length,
          checkedParts: current.checkedParts,
          missingParts: current.missingParts,
          completedSteps: current.completedSteps,
          confirmedHazards: current.confirmedHazards,
          twoPerson: current.twoPerson,
          steps: current.plan.steps
        });

        ws.send(
          JSON.stringify({
            type: "session.update",
            session: {
              system_prompt: `You are Kitwise, a hands-free assembly coach.
Lead with the instruction. Use short spoken sentences. No markdown, filler, hype, or exclamation marks.
The durable build state is controlled by tools. Call get_build_state before answering "where was I" or if the current step is uncertain.
For parts checks, ask about one part at a time and call set_part_status after each answer.
Never complete a hazardous step until confirm_hazard succeeds. Read the exact orientation confirmation and wait for an explicit yes.
Call complete_current_step only when the user says the step is done.
When asked "which screw", name the exact part from the current BuildPlan. If the plan is ambiguous, say so.
For "slower", use shorter sentences and one action at a time. For "say that differently", rephrase without advancing.
In two-person mode, address Person A and Person B separately.
The selected pace is ${pace}.
Initial state snapshot: ${stateSummary}`,
              greeting:
                current.completedSteps.length > 0
                  ? `Welcome back. You are on step ${current.currentStep + 1}. Say where was I when you are ready.`
                  : `Your ${current.plan.title} plan is ready. Say parts check to begin, or start building for step one.`,
              input: {
                format: { encoding: "audio/pcm" },
                transcription_mode: "balanced",
                transcription_prompt:
                  "Flat-pack furniture assembly with part codes, screws, dowels, cam locks, hex keys, and tool names.",
                continuous_partials: true,
                voice_focus: "near-field",
                keyterms: current.plan.parts
                  .flatMap((part) => [part.name, part.detail])
                  .slice(0, 100),
                turn_detection: {
                  vad_threshold: 0.5,
                  min_silence: 900,
                  max_silence: 3000,
                  interrupt_response: true,
                  interruption_delay: 100
                }
              },
              output: {
                voice,
                format: { encoding: "audio/pcm" },
                volume: 90
              },
              tools: [
                {
                  type: "function",
                  name: "get_build_state",
                  description:
                    "Read the current durable build state. Use before resuming, answering where the user was, or describing current progress.",
                  parameters: { type: "object", properties: {} },
                  execution_mode: "interactive"
                },
                {
                  type: "function",
                  name: "set_part_status",
                  description:
                    "Save whether a listed part is present or missing. Use immediately after the user confirms a part.",
                  parameters: {
                    type: "object",
                    properties: {
                      part_id: {
                        type: "string",
                        description: "Exact part ID from the BuildPlan."
                      },
                      status: {
                        type: "string",
                        enum: ["present", "missing"]
                      }
                    },
                    required: ["part_id", "status"]
                  },
                  execution_mode: "interactive"
                },
                {
                  type: "function",
                  name: "confirm_hazard",
                  description:
                    "Record explicit user confirmation of orientation before the current glue, cutting, drilling, or pinning step.",
                  parameters: { type: "object", properties: {} },
                  execution_mode: "interactive"
                },
                {
                  type: "function",
                  name: "complete_current_step",
                  description:
                    "Mark the current step complete only after the user clearly says it is finished.",
                  parameters: { type: "object", properties: {} },
                  execution_mode: "interactive"
                },
                {
                  type: "function",
                  name: "go_to_step",
                  description:
                    "Move to a requested step when the user explicitly asks to go back, skip, or resume at a numbered step.",
                  parameters: {
                    type: "object",
                    properties: {
                      step_number: {
                        type: "integer",
                        description: "One-based step number, for example 3."
                      }
                    },
                    required: ["step_number"]
                  },
                  execution_mode: "interactive"
                }
              ]
            }
          })
        );
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        const type = message.type as string;

        if (type === "session.ready") {
          readyRef.current = true;
          setStatus("listening");
        }

        if (type === "input.speech.started") {
          lastEventRef.current = type;
          flushPlayback();
          setStatus("listening");
        }

        if (type === "input.speech.stopped") setStatus("thinking");

        if (type === "transcript.user.delta") {
          setPartial(message.text ?? "");
        }

        if (type === "transcript.user") {
          setPartial("");
          onBuildChange((value) => ({
            ...value,
            transcript: [
              ...value.transcript,
              {
                role: "user" as const,
                text: message.text,
                at: new Date().toISOString()
              }
            ].slice(-30)
          }));
        }

        if (type === "reply.started") {
          lastEventRef.current = type;
          setStatus("speaking");
        }

        if (type === "reply.audio") {
          playAudio(message.audio ?? message.data);
        }

        if (type === "transcript.agent") {
          onBuildChange((value) => ({
            ...value,
            transcript: [
              ...value.transcript,
              {
                role: "agent" as const,
                text: message.text,
                at: new Date().toISOString()
              }
            ].slice(-30)
          }));
        }

        if (type === "tool.call") {
          const result = runTool(message.name, message.arguments ?? {});
          pendingToolsRef.current.push({
            call_id: message.call_id,
            result,
            is_error: Boolean(
              result &&
                typeof result === "object" &&
                "error" in result
            )
          });
          sendToolResults();
        }

        if (type === "reply.done") {
          lastEventRef.current = type;
          if (message.status === "interrupted") {
            flushPlayback();
            pendingToolsRef.current = [];
          } else {
            sendToolResults();
          }
          setStatus("listening");
        }

        if (type === "session.error") {
          setError(message.message ?? "The voice session failed.");
          setStatus("error");
        }

        if (type === "session.ended") {
          readyRef.current = false;
          setStatus("idle");
        }
      };

      ws.onerror = () => {
        setError("The voice connection failed. Start a fresh session.");
        setStatus("error");
      };

      ws.onclose = () => {
        readyRef.current = false;
        if (status !== "error") setStatus("idle");
      };
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not start the assistant."
      );
      setStatus("error");
      streamRef.current?.getTracks().forEach((track) => track.stop());
      void audioRef.current?.close();
    }
  }, [
    flushPlayback,
    onBuildChange,
    pace,
    playAudio,
    runTool,
    sendToolResults,
    status,
    voice
  ]);

  useEffect(() => {
    const end = () => {
      const ws = wsRef.current;
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "session.end" }));
      }
    };
    window.addEventListener("pagehide", end);
    return () => window.removeEventListener("pagehide", end);
  }, []);

  return {
    status,
    partial,
    error,
    connected:
      status !== "idle" && status !== "error" && status !== "connecting",
    connect,
    disconnect
  };
}