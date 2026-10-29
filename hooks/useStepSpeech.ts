"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TtsVoiceId } from "@/lib/tts-voices";

export function useStepSpeech() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "playing">("idle");
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setState("idle");
  }, []);

  const speak = useCallback(
    async (text: string, voiceId: TtsVoiceId) => {
      stop();
      setError(null);
      setState("loading");
      try {
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, voiceId })
        });
        if (!response.ok) throw new Error((await response.json()).error ?? "Speech failed.");
        const url = URL.createObjectURL(await response.blob());
        urlRef.current = url;
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => stop();
        setState("playing");
        await audio.play();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Speech failed.");
        setState("idle");
      }
    },
    [stop]
  );

  useEffect(() => stop, [stop]);

  return { speak, stop, state, error };
}
