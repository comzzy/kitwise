export const TTS_VOICES = [
  { id: "aai-audrey", label: "Audrey", note: "US English, clear and steady" },
  { id: "aai-titus", label: "Titus", note: "US English, deep" },
  { id: "aai-buford", label: "Buford", note: "British English, lively" },
  { id: "aai-lilla", label: "Lilla", note: "British English, expressive" }
] as const;

export type TtsVoiceId = (typeof TTS_VOICES)[number]["id"];
export const DEFAULT_TTS_VOICE: TtsVoiceId = "aai-audrey";
