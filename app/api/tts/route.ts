import { NextResponse } from "next/server";
import { DEFAULT_TTS_VOICE, TTS_VOICES } from "@/lib/tts-voices";

export const runtime = "nodejs";

const ENDPOINT = "https://tts.us.assemblyai.com/v1/speech";
const MAX_CHARS = 800;

// GET: health check and the list of voices the app offers.
export async function GET() {
  return NextResponse.json({
    model: "assemblyai-tts-1",
    configured: Boolean(process.env.ASSEMBLYAI_API_KEY),
    defaultVoice: DEFAULT_TTS_VOICE,
    voices: TTS_VOICES
  });
}

// POST { text, voiceId } -> audio/wav from AssemblyAI TTS-1.
export async function POST(request: Request) {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ASSEMBLYAI_API_KEY is not configured." }, { status: 500 });
  }

  let body: { text?: unknown; voiceId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send JSON with a text field." }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) return NextResponse.json({ error: "text is required." }, { status: 400 });
  if (text.length > MAX_CHARS) {
    return NextResponse.json({ error: `text is limited to ${MAX_CHARS} characters.` }, { status: 400 });
  }

  const voiceId = TTS_VOICES.some((v) => v.id === body.voiceId)
    ? (body.voiceId as string)
    : DEFAULT_TTS_VOICE;

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { Authorization: apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice_id: voiceId, container: "wav", stream: false }),
    cache: "no-store"
  });

  if (!response.ok) {
    return NextResponse.json({ error: await response.text() }, { status: response.status });
  }

  return new Response(await response.arrayBuffer(), {
    headers: {
      "Content-Type": "audio/wav",
      "Cache-Control": "no-store",
      "X-TTS-Voice-Id": response.headers.get("x-tts-voice-id") ?? voiceId,
      "X-TTS-Model": response.headers.get("x-tts-model") ?? "assemblyai-tts-1"
    }
  });
}
