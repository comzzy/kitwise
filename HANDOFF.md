# AssemblyAI integration — handoff from the AssemblyAI Agent

_Exported 2026-10-20. This folder contains a scoping conversation with AssemblyAI's onboarding agent and the starter code it produced._

## Instructions for the coding agent picking this up

1. Read the conversation below — it has the use case, the decisions already made, and working starter code (shipped as the files listed under **Files**).
2. Ground yourself in AssemblyAI's live docs before writing code — training data goes stale fast here:
   - Docs MCP server (streamable HTTP, no auth needed): `https://www.assemblyai.com/docs/mcp` — semantic docs search + full-page reads + OpenAPI queries.
   - Or install the official agent skill: `npx skills add AssemblyAI/assemblyai-skill`
3. Use the official SDKs (`pip install assemblyai==1.6.1` / `npm install assemblyai@4.41.5`). The API key comes from the `ASSEMBLYAI_API_KEY` environment variable (see `.env.example`). The auth header is the raw key — **no `Bearer` prefix** (except the Voice Agent API, which does use Bearer).
4. Continue from where the conversation leaves off.

## Files

- `package.json`
- `env.example`
- `tsconfig.json`
- `next-env.d`
- `next.config`
- `types.ts`
- `schema.ts`
- `demo-plan.ts`
- `persistence.ts`
- `route.ts`
- `pcm-processor.js`
- `Illustrations.tsx`
- `Reveal.tsx`
- `Waveform.tsx`
- `useVoiceAgent.ts`
- `ManualSetup.tsx`
- `BuildReport.tsx`
- `AssistantScreen.tsx`
- `LandingPage.tsx`
- `page.tsx`
- `layout.tsx`
- `globals.css`

## The conversation

### You

Build "Kitwise" — a hands-free voice assistant that guides people through assembling flat-pack furniture and DIY kits, step by step, by conversation.

PRODUCT
- Upload a PDF or photo of an assembly manual; Kitwise converts the wordless diagrams into clear spoken steps.
- Parts check: reads out the parts list ("8 cam locks, 4 dowels…"), user confirms by voice, missing parts are flagged instantly.
- Interruptible: user can cut in mid-step ("which screw?", "slower", "say that differently") and it re-explains without restarting.
- Mistake guard: before irreversible steps (glue, cutting, pinning parts) it pauses and asks the user to confirm orientation.
- Progress memory: always knows the current step; "where was I?" resumes after a break.
- Tool coach: names the tool needed, gives tips (don't overtighten, use the pilot hole), suggests substitutes.
- Two-person mode: splits instructions between Person A and Person B.
- Voice style: selectable accent/pace, including Nigerian English, relaxed or brisk.
- Build report at the end: time taken, missing parts, checklist — exportable.

TECH
- AssemblyAI Universal Streaming speech-to-text for live hands-free input with turn detection and barge-in.
- AssemblyAI streaming Text-to-Speech (wss://streaming-tts.assemblyai.com/v1/ws) for low-latency spoken replies.
- AssemblyAI LLM Gateway for manual parsing and dialogue.
- Next.js app, API key kept server-side, deployable to Vercel.

UI / DESIGN (use the attached image only as a style reference; do not reuse any of its text or content)
- Palette: warm cream background (#FDF0C8 / #FBE9B7), olive green (#8A8F4A), soft purple (#9B5FB0), coral-orange accents (#F28C5B), soft pink and light blue as secondary.
- Typography: friendly hand-drawn/rounded display font for headings (e.g. "Gochi Hand" or "Patrick Hand"), clean readable font for body text.
- Flat illustrated style: soft blob shapes, small starburst accents, illustrated hands holding tools, flat-pack panels and screws instead of yarn.
- Pages: landing page (hero, how it works, feature sections, live demo CTA) and the assistant screen (current step card, parts checklist, progress bar, mic state indicator, live transcript).
- Fully responsive: polished on desktop and mobile.
- Animate end to end: entrance animations on scroll, floating/drifting illustrations, animated mic waveform while listening and speaking, smooth step transitions, checklist ticks animating in.
- Tone of all copy: direct, confident, human — no filler, no buzzwords, no exclamation-mark spam.

### AssemblyAI Agent

Kitwise is a good fit for a Next.js application using:

- **Universal-3.6 Pro Streaming** for browser-mic transcription, balanced turn detection, and fast `SpeechStarted` barge-in events.
- **LLM Gateway** for structured manual extraction, dialogue, rewording, safety gates, and the final build report.
- Server-side persistence for the manual, current step, confirmations, missing parts, and elapsed time.

One necessary correction: `wss://streaming-tts.assemblyai.com/v1/ws` is not a supported AssemblyAI endpoint. We don’t offer standalone TTS. For AssemblyAI speech output, use our **Voice Agent API**, which bundles STT, LLM, TTS, turn detection, and interruption handling. If you need separate orchestration exactly as specified, pair our Streaming STT and LLM Gateway with another TTS provider.

For the strongest MVP, I’d use the Voice Agent API for the live conversation while calling application tools to read/update Kitwise’s durable build state. It already handles barge-in and emits user/agent transcripts. Keep PDF/image parsing in a separate server route because manual ingestion is asynchronous and needs structured validation.

Important product constraints:

- Browser connections receive a short-lived token from a Next.js server route; the API key never reaches client JavaScript.
- Nigerian English is supported as **input language** through English recognition, but our current voice catalog does not list a Nigerian-accent output voice. Expose only verified voices and label UK/US accents accurately.
- Voice and output format are selected when a session begins and cannot change mid-session. Pace can be implemented through concise prompting; volume is mutable.
- Persist progress outside the WebSocket so “where was I?” survives reconnects, breaks, and deployments.
- Treat manual interpretation as guidance, not certainty. Before glue, drilling, cutting, pinning, or irreversible fastening, require an explicit orientation confirmation.

Start the project with pinned SDK dependencies:

```bash
npx create-next-app@latest kitwise --typescript --tailwind --eslint --app
cd kitwise
npm install assemblyai@4.41.5 zod
```

This server-only token route is the correct foundation for the browser assistant:

```typescript title="app/api/voice-token/route.ts"
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "ASSEMBLYAI_API_KEY is not configured" },
      { status: 500 },
    );
  }

  const query = new URLSearchParams({
    expires_in_seconds: "60",
    max_session_duration_seconds: "7200",
  });

  const response = await fetch(
    `https://agents.assemblyai.com/v1/token?${query}`,
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return NextResponse.json(
      { error: "Could not create a voice session token" },
      { status: response.status },
    );
  }

  return NextResponse.json(await response.json(), {
    headers: { "Cache-Control": "no-store" },
  });
}
```

Add this locally and in Vercel’s server-side environment:

```bash
# .env.local
ASSEMBLYAI_API_KEY=your_key_from_the_dashboard
```

The complete build should then be split into four layers:

- Landing and assistant interfaces with the specified palette, responsive cards, motion, waveform, and illustrated CSS/SVG assets.
- A browser audio client using 24 kHz mono PCM, echo cancellation, and immediate playback-buffer flushing on interruption.
- Agent tools such as `get_current_step`, `confirm_parts`, `set_progress`, `confirm_hazard`, and `finish_build`.
- A validated `BuildPlan` schema containing parts, tools, steps, hazards, visual references, two-person assignments, and confidence flags.

The attached image itself cannot reach this chat, so I can follow the written design direction but cannot inspect that reference. Exporting this conversation downloads the code files as a zip for local development.

### You

Build the complete Next.js MVP now using the Voice Agent API. Include every file: landing page and assistant screen with the full cream/olive/purple/coral hand-drawn design, responsive desktop and mobile, animations throughout (scroll entrances, floating illustrations, live mic waveform, step transitions, animated checklist ticks), manual upload and parsing to a BuildPlan, parts check, mistake guard confirmations, progress resume, tool tips, two-person mode, and the end-of-build report. Copy should be direct and human, no filler.

### AssemblyAI Agent

Below is a complete MVP arranged as a fresh Next.js App Router project. It includes the browser Voice Agent client, dynamic inline agent configuration, client-side progress tools, local resume, manual parsing, report export, responsive styling, and motion.

One product boundary is reflected in the implementation: our LLM Gateway’s documented chat-completions input is text, not PDF/image vision. Kitwise extracts text from PDFs in the browser and sends that text to the Gateway. Image-only PDFs and photos use an editable manual-notes fallback rather than pretending the diagrams were parsed. For production-grade wordless-diagram interpretation, connect a vision/OCR service before the `BuildPlan` extraction route.

Create the project, replace its files with these, then run:

```bash
npm install
cp .env.example .env.local
npm run dev
```

```json title="package.json"
{
  "name": "kitwise",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "assemblyai": "4.41.5",
    "lucide-react": "0.468.0",
    "next": "15.1.6",
    "pdfjs-dist": "4.10.38",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "zod": "3.24.1"
  },
  "devDependencies": {
    "@types/node": "22.10.7",
    "@types/react": "19.0.7",
    "@types/react-dom": "19.0.3",
    "eslint": "9.18.0",
    "eslint-config-next": "15.1.6",
    "typescript": "5.7.3"
  }
}
```

```env title=".env.example"
ASSEMBLYAI_API_KEY=
```

```json title="tsconfig.json"
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

```typescript title="next-env.d.ts"
/// <reference types="next" />
/// <reference types="next/image-types/global" />
```

```javascript title="next.config.mjs"
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb"
    }
  }
};

export default nextConfig;
```

```typescript title="lib/types.ts"
export type Part = {
  id: string;
  name: string;
  quantity: number;
  detail: string;
};

export type BuildStep = {
  id: string;
  title: string;
  instruction: string;
  tool: string;
  toolTip: string;
  parts: string[];
  hazard: "none" | "glue" | "cutting" | "drilling" | "pinning";
  confirmation: string;
  personA: string;
  personB: string;
};

export type BuildPlan = {
  id: string;
  title: string;
  sourceName: string;
  estimatedMinutes: number;
  parts: Part[];
  steps: BuildStep[];
  warnings: string[];
  createdAt: string;
};

export type BuildState = {
  plan: BuildPlan;
  currentStep: number;
  checkedParts: string[];
  missingParts: string[];
  completedSteps: string[];
  confirmedHazards: string[];
  twoPerson: boolean;
  startedAt: string;
  finishedAt?: string;
  transcript: { role: "user" | "agent"; text: string; at: string }[];
};

export type VoiceChoice = {
  id: "alba" | "paul" | "vera" | "ivy";
  label: string;
  accent: string;
};

export const VOICES: VoiceChoice[] = [
  { id: "alba", label: "Alba", accent: "US English" },
  { id: "paul", label: "Paul", accent: "UK English" },
  { id: "vera", label: "Vera", accent: "UK English" },
  { id: "ivy", label: "Ivy", accent: "US English" }
];
```

```typescript title="lib/schema.ts"
import { z } from "zod";

const partSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number().int().positive(),
  detail: z.string()
});

const stepSchema = z.object({
  id: z.string(),
  title: z.string(),
  instruction: z.string(),
  tool: z.string(),
  toolTip: z.string(),
  parts: z.array(z.string()),
  hazard: z.enum(["none", "glue", "cutting", "drilling", "pinning"]),
  confirmation: z.string(),
  personA: z.string(),
  personB: z.string()
});

export const buildPlanSchema = z.object({
  id: z.string(),
  title: z.string(),
  sourceName: z.string(),
  estimatedMinutes: z.number().int().positive(),
  parts: z.array(partSchema).min(1),
  steps: z.array(stepSchema).min(1),
  warnings: z.array(z.string()),
  createdAt: z.string()
});

export const manualRequestSchema = z.object({
  sourceName: z.string().min(1).max(200),
  manualText: z.string().min(20).max(150_000)
});
```

```typescript title="lib/demo-plan.ts"
import type { BuildPlan } from "./types";

export const demoPlan: BuildPlan = {
  id: "demo-side-table",
  title: "Oak Side Table",
  sourceName: "Kitwise demo manual",
  estimatedMinutes: 35,
  createdAt: new Date().toISOString(),
  warnings: [
    "Do not fully tighten bolts until the frame is square.",
    "Confirm the tabletop is face-down before fastening."
  ],
  parts: [
    { id: "panel-a", name: "Tabletop", quantity: 1, detail: "Large panel, finished face" },
    { id: "leg-b", name: "Leg", quantity: 4, detail: "Long timber pieces" },
    { id: "rail-c", name: "Side rail", quantity: 4, detail: "Short frame pieces" },
    { id: "bolt-d", name: "Hex bolt", quantity: 8, detail: "M6 × 35 mm" },
    { id: "dowel-e", name: "Wooden dowel", quantity: 8, detail: "8 × 30 mm" }
  ],
  steps: [
    {
      id: "step-1",
      title: "Lay out the frame",
      instruction: "Place the four rails in a rectangle with their pilot holes facing inward.",
      tool: "No tool",
      toolTip: "Use the tabletop as a size guide, but keep its finished face protected.",
      parts: ["rail-c"],
      hazard: "none",
      confirmation: "",
      personA: "Arrange the two long rails.",
      personB: "Arrange the two short rails."
    },
    {
      id: "step-2",
      title: "Fit the dowels",
      instruction: "Push two dowels into each rail end until they sit halfway in.",
      tool: "Rubber mallet",
      toolTip: "A folded cloth and the heel of your hand can replace a rubber mallet.",
      parts: ["dowel-e", "rail-c"],
      hazard: "none",
      confirmation: "",
      personA: "Hold each rail steady.",
      personB: "Seat the dowels with light taps."
    },
    {
      id: "step-3",
      title: "Join the legs",
      instruction: "Join one leg to each corner. Keep the pilot holes facing the centre.",
      tool: "4 mm hex key",
      toolTip: "Tighten each bolt only until snug. Final tightening comes later.",
      parts: ["leg-b", "bolt-d", "rail-c"],
      hazard: "none",
      confirmation: "",
      personA: "Hold the frame upright.",
      personB: "Insert and lightly tighten the bolts."
    },
    {
      id: "step-4",
      title: "Fix the tabletop",
      instruction: "Turn the tabletop face-down on a clean blanket, centre the frame, then fasten it.",
      tool: "Phillips screwdriver",
      toolTip: "Stop when the screw head meets the bracket. Do not crush the timber.",
      parts: ["panel-a"],
      hazard: "drilling",
      confirmation: "Confirm the finished tabletop face is down on a clean, soft surface.",
      personA: "Keep the frame centred.",
      personB: "Fasten opposite corners first."
    },
    {
      id: "step-5",
      title: "Square and finish",
      instruction: "Stand the table upright, check that it does not rock, then tighten every bolt evenly.",
      tool: "4 mm hex key",
      toolTip: "Alternate corners rather than tightening one side completely.",
      parts: ["bolt-d"],
      hazard: "none",
      confirmation: "",
      personA: "Check the table for rocking.",
      personB: "Tighten the bolts in a diagonal pattern."
    }
  ]
};
```

```typescript title="lib/persistence.ts"
import type { BuildPlan, BuildState } from "./types";

const KEY = "kitwise-build-state-v1";

export function initialState(plan: BuildPlan): BuildState {
  return {
    plan,
    currentStep: 0,
    checkedParts: [],
    missingParts: [],
    completedSteps: [],
    confirmedHazards: [],
    twoPerson: false,
    startedAt: new Date().toISOString(),
    transcript: []
  };
}

export function loadState(): BuildState | null {
  if (typeof window === "undefined") return null;
  try {
    const value = localStorage.getItem(KEY);
    return value ? (JSON.parse(value) as BuildState) : null;
  } catch {
    return null;
  }
}

export function saveState(state: BuildState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function clearState() {
  localStorage.removeItem(KEY);
}
```

```typescript title="app/api/voice-token/route.ts"
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ASSEMBLYAI_API_KEY is not configured." },
      { status: 500 }
    );
  }

  const url = new URL("https://agents.assemblyai.com/v1/token");
  url.searchParams.set("expires_in_seconds", "60");
  url.searchParams.set("max_session_duration_seconds", "7200");

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: "no-store"
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: await response.text() },
      { status: response.status }
    );
  }

  return NextResponse.json(await response.json(), {
    headers: { "Cache-Control": "no-store" }
  });
}
```

```typescript title="app/api/parse-manual/route.ts"
import { NextResponse } from "next/server";
import { buildPlanSchema, manualRequestSchema } from "@/lib/schema";

export const runtime = "nodejs";
export const maxDuration = 60;

const jsonSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    sourceName: { type: "string" },
    estimatedMinutes: { type: "integer" },
    parts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          quantity: { type: "integer" },
          detail: { type: "string" }
        },
        required: ["id", "name", "quantity", "detail"],
        additionalProperties: false
      }
    },
    steps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          instruction: { type: "string" },
          tool: { type: "string" },
          toolTip: { type: "string" },
          parts: { type: "array", items: { type: "string" } },
          hazard: {
            type: "string",
            enum: ["none", "glue", "cutting", "drilling", "pinning"]
          },
          confirmation: { type: "string" },
          personA: { type: "string" },
          personB: { type: "string" }
        },
        required: [
          "id",
          "title",
          "instruction",
          "tool",
          "toolTip",
          "parts",
          "hazard",
          "confirmation",
          "personA",
          "personB"
        ],
        additionalProperties: false
      }
    },
    warnings: { type: "array", items: { type: "string" } },
    createdAt: { type: "string" }
  },
  required: [
    "id",
    "title",
    "sourceName",
    "estimatedMinutes",
    "parts",
    "steps",
    "warnings",
    "createdAt"
  ],
  additionalProperties: false
};

export async function POST(request: Request) {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ASSEMBLYAI_API_KEY is not configured." },
      { status: 500 }
    );
  }

  const parsed = manualRequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Add at least 20 characters of readable manual text." },
      { status: 400 }
    );
  }

  const { sourceName, manualText } = parsed.data;
  const response = await fetch(
    "https://llm-gateway.assemblyai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        model_region: "global",
        max_tokens: 6000,
        messages: [
          {
            role: "system",
            content:
              "Convert assembly-manual text into a safe spoken BuildPlan. Do not invent missing dimensions or part counts. Keep each instruction short and concrete. Mark glue, cutting, drilling, or pinning as hazards and write an explicit orientation confirmation. Use stable lowercase IDs. Give useful tool tips and divide every step between Person A and Person B. If the source is ambiguous, add a warning."
          },
          {
            role: "user",
            content: `Source filename: ${sourceName}\nCurrent time: ${new Date().toISOString()}\n\nManual text:\n${manualText}`
          }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "kitwise_build_plan",
            strict: true,
            schema: jsonSchema
          }
        },
        post_processing_steps: [{ type: "json-repair" }]
      })
    }
  );

  const result = await response.json();
  if (!response.ok) {
    return NextResponse.json(
      { error: result.message ?? result.error ?? "Manual parsing failed." },
      { status: response.status }
    );
  }

  try {
    const content = result.choices?.[0]?.message?.content;
    const plan = buildPlanSchema.parse(JSON.parse(content));
    return NextResponse.json(plan);
  } catch {
    return NextResponse.json(
      { error: "The manual could not be converted into a valid build plan." },
      { status: 502 }
    );
  }
}
```

```javascript title="public/pcm-processor.js"
class KitwisePCMProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const inputRate =
      options.processorOptions?.inputSampleRate || sampleRate;
    const targetRate =
      options.processorOptions?.targetSampleRate || 24000;

    this.ratio = inputRate / targetRate;
    this.pending = [];
    this.pendingLength = 0;
    this.targetChunkLength = 1200; // 50 ms at 24 kHz
  }

  process(inputs) {
    const input = inputs[0]?.[0];
    if (!input?.length) return true;

    const outputLength = Math.max(1, Math.floor(input.length / this.ratio));
    const output = new Int16Array(outputLength);

    for (let i = 0; i < outputLength; i++) {
      const sourcePosition = i * this.ratio;
      const left = Math.floor(sourcePosition);
      const right = Math.min(left + 1, input.length - 1);
      const fraction = sourcePosition - left;
      const sample =
        (input[left] ?? 0) * (1 - fraction) +
        (input[right] ?? 0) * fraction;

      output[i] = Math.max(
        -32768,
        Math.min(32767, Math.round(sample * 32767))
      );
    }

    this.pending.push(output);
    this.pendingLength += output.length;

    if (this.pendingLength >= this.targetChunkLength) {
      const joined = new Int16Array(this.pendingLength);
      let offset = 0;
      for (const chunk of this.pending) {
        joined.set(chunk, offset);
        offset += chunk.length;
      }
      this.pending = [];
      this.pendingLength = 0;
      this.port.postMessage(joined.buffer, [joined.buffer]);
    }

    return true;
  }
}

registerProcessor("kitwise-pcm", KitwisePCMProcessor);
```

```tsx title="components/Illustrations.tsx"
export function ToolIllustration() {
  return (
    <svg viewBox="0 0 520 420" className="hero-art" aria-hidden="true">
      <path
        className="blob blob-purple"
        d="M66 88C111 8 247 18 311 55c72 41 154 113 127 207-27 95-144 144-252 116C74 350 11 186 66 88Z"
      />
      <path
        className="blob blob-blue"
        d="M330 62c54-37 137 2 135 66-2 66-89 80-139 45-41-29-35-84 4-111Z"
      />
      <g className="float-slow">
        <rect x="110" y="198" width="235" height="45" rx="16" fill="#FDF0C8" stroke="#302f26" strokeWidth="5" />
        <rect x="146" y="248" width="36" height="118" rx="14" fill="#8A8F4A" stroke="#302f26" strokeWidth="5" />
        <rect x="275" y="248" width="36" height="118" rx="14" fill="#8A8F4A" stroke="#302f26" strokeWidth="5" />
        <circle cx="130" cy="220" r="7" fill="#F28C5B" />
        <circle cx="325" cy="220" r="7" fill="#F28C5B" />
      </g>
      <g className="float-fast" transform="rotate(-18 360 160)">
        <path d="M363 89h22v165h-22z" fill="#9B5FB0" stroke="#302f26" strokeWidth="5" />
        <path d="M338 92c0-35 70-35 70 0v16h-70Z" fill="#F28C5B" stroke="#302f26" strokeWidth="5" />
      </g>
      <path d="M79 129l9 17 18 8-18 8-9 18-8-18-18-8 18-8Z" fill="#F28C5B" />
      <path d="M427 266l7 14 15 7-15 7-7 15-7-15-15-7 15-7Z" fill="#F8AFC3" />
      <path d="M346 333c28-25 65-20 81 10-28 29-64 32-92 9Z" fill="#f2bb96" stroke="#302f26" strokeWidth="5" />
      <path d="M408 343l42-49" stroke="#302f26" strokeWidth="10" strokeLinecap="round" />
    </svg>
  );
}

export function PartsIllustration() {
  return (
    <svg viewBox="0 0 270 210" className="mini-art" aria-hidden="true">
      <path d="M41 48c44-42 147-31 183 18 32 44 4 110-45 130-54 22-135-1-156-48-14-31-7-76 18-100Z" fill="#d7ddee" />
      <rect x="58" y="83" width="150" height="37" rx="9" fill="#FDF0C8" stroke="#302f26" strokeWidth="4" />
      <rect x="86" y="128" width="25" height="60" rx="7" fill="#8A8F4A" stroke="#302f26" strokeWidth="4" />
      <rect x="157" y="128" width="25" height="60" rx="7" fill="#8A8F4A" stroke="#302f26" strokeWidth="4" />
      <circle cx="50" cy="55" r="11" fill="#F28C5B" stroke="#302f26" strokeWidth="4" />
      <circle cx="220" cy="55" r="8" fill="#9B5FB0" stroke="#302f26" strokeWidth="4" />
    </svg>
  );
}
```

```tsx title="components/Reveal.tsx"
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function Reveal({
  children,
  delay = 0,
  className = ""
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { threshold: 0.15 }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
```

```tsx title="components/Waveform.tsx"
export function Waveform({
  active,
  speaking = false
}: {
  active: boolean;
  speaking?: boolean;
}) {
  return (
    <div
      className={`waveform ${active ? "active" : ""} ${
        speaking ? "speaking" : ""
      }`}
      aria-label={
        active ? (speaking ? "Assistant speaking" : "Listening") : "Microphone off"
      }
    >
      {Array.from({ length: 11 }).map((_, index) => (
        <span key={index} style={{ animationDelay: `${index * 60}ms` }} />
      ))}
    </div>
  );
}
```

```typescript title="hooks/useVoiceAgent.ts"
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
                role: "user",
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
                role: "agent",
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
```

```tsx title="components/ManualSetup.tsx"
"use client";

import { useState } from "react";
import { FileText, Image, LoaderCircle, Sparkles, Upload } from "lucide-react";
import type { BuildPlan } from "@/lib/types";
import { demoPlan } from "@/lib/demo-plan";

async function extractPdfText(file: File) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  const document = await pdfjs.getDocument({
    data: await file.arrayBuffer()
  }).promise;

  const pages: string[] = [];
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(
      content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ")
    );
  }
  return pages.join("\n\n");
}

export function ManualSetup({
  onPlan
}: {
  onPlan: (plan: BuildPlan) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function parse() {
    if (!file && notes.trim().length < 20) {
      setError("Choose a PDF or add enough manual notes to build the plan.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      let text = notes.trim();
      if (file?.type === "application/pdf") {
        const extracted = await extractPdfText(file);
        text = [extracted, notes].filter(Boolean).join("\n\nUser notes:\n");
      }

      if (text.length < 20) {
        throw new Error(
          "This file has no readable text. Add the parts and steps in the notes box. Photo and wordless-diagram vision needs a separate vision/OCR service."
        );
      }

      const response = await fetch("/api/parse-manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceName: file?.name ?? "Manual notes",
          manualText: text
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      onPlan(result);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not parse this manual."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="setup-card">
      <div className="setup-copy">
        <span className="eyebrow">Set up your build</span>
        <h1>Turn the manual into a clear plan.</h1>
        <p>
          Use a text-based PDF, or paste the parts and instructions. Review
          uncertain details before you start.
        </p>
      </div>

      <label className="drop-zone">
        <input
          type="file"
          accept="application/pdf,image/*"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
        <span className="drop-icon">
          {file?.type.startsWith("image/") ? <Image /> : <Upload />}
        </span>
        <strong>{file ? file.name : "Choose a PDF or photo"}</strong>
        <small>PDF text is extracted locally. Images need notes below.</small>
      </label>

      <label className="notes-label">
        Manual text or diagram notes
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Example: Parts: 1 tabletop, 4 legs, 8 M6 bolts. Step 1: attach each leg with two bolts. Do not fully tighten until the frame is square."
        />
      </label>

      {error && <p className="error-note">{error}</p>}

      <div className="setup-actions">
        <button className="primary-button" onClick={parse} disabled={busy}>
          {busy ? <LoaderCircle className="spin" /> : <Sparkles />}
          {busy ? "Building the plan" : "Create build plan"}
        </button>
        <button className="ghost-button" onClick={() => onPlan(demoPlan)}>
          <FileText />
          Use the demo table
        </button>
      </div>
    </section>
  );
}
```

```tsx title="components/BuildReport.tsx"
"use client";

import { Download, RotateCcw } from "lucide-react";
import type { BuildState } from "@/lib/types";

function duration(start: string, finish?: string) {
  const end = finish ? new Date(finish).getTime() : Date.now();
  const minutes = Math.max(
    1,
    Math.round((end - new Date(start).getTime()) / 60_000)
  );
  return `${minutes} min`;
}

export function BuildReport({
  build,
  onRestart
}: {
  build: BuildState;
  onRestart: () => void;
}) {
  function exportReport() {
    const missing = build.plan.parts.filter((part) =>
      build.missingParts.includes(part.id)
    );
    const lines = [
      `KITWISE BUILD REPORT`,
      ``,
      `Build: ${build.plan.title}`,
      `Started: ${new Date(build.startedAt).toLocaleString()}`,
      `Finished: ${new Date(
        build.finishedAt ?? Date.now()
      ).toLocaleString()}`,
      `Time: ${duration(build.startedAt, build.finishedAt)}`,
      `Steps complete: ${build.completedSteps.length}/${build.plan.steps.length}`,
      `Two-person mode: ${build.twoPerson ? "Yes" : "No"}`,
      ``,
      `Missing parts:`,
      ...(missing.length
        ? missing.map((part) => `- ${part.quantity} × ${part.name}`)
        : ["- None reported"]),
      ``,
      `Checklist:`,
      ...build.plan.steps.map(
        (step, index) =>
          `${build.completedSteps.includes(step.id) ? "[x]" : "[ ]"} ${
            index + 1
          }. ${step.title}`
      )
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = `${build.plan.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}-report.txt`;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  }

  return (
    <section className="report-card">
      <div className="report-badge">Build complete</div>
      <h2>{build.plan.title} is done.</h2>
      <p>Keep the report with the spare parts and manual.</p>

      <div className="report-grid">
        <div>
          <strong>{duration(build.startedAt, build.finishedAt)}</strong>
          <span>Total time</span>
        </div>
        <div>
          <strong>{build.completedSteps.length}</strong>
          <span>Steps completed</span>
        </div>
        <div>
          <strong>{build.missingParts.length}</strong>
          <span>Missing parts</span>
        </div>
      </div>

      <div className="report-actions">
        <button className="primary-button" onClick={exportReport}>
          <Download />
          Export report
        </button>
        <button className="ghost-button" onClick={onRestart}>
          <RotateCcw />
          Start another build
        </button>
      </div>
    </section>
  );
}
```

```tsx title="components/AssistantScreen.tsx"
"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CircleStop,
  Hammer,
  Mic,
  RotateCcw,
  Users,
  Volume2
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { BuildPlan, BuildState, VoiceChoice } from "@/lib/types";
import {
  clearState,
  initialState,
  loadState,
  saveState
} from "@/lib/persistence";
import { VOICES } from "@/lib/types";
import { useVoiceAgent } from "@/hooks/useVoiceAgent";
import { Waveform } from "./Waveform";
import { BuildReport } from "./BuildReport";

export function AssistantScreen({
  initialPlan,
  onExit
}: {
  initialPlan: BuildPlan;
  onExit: () => void;
}) {
  const [build, setBuild] = useState<BuildState>(() => initialState(initialPlan));
  const [voice, setVoice] = useState<VoiceChoice["id"]>("alba");
  const [pace, setPace] = useState<"relaxed" | "brisk">("relaxed");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = loadState();
    if (saved?.plan.id === initialPlan.id) setBuild(saved);
    setHydrated(true);
  }, [initialPlan.id]);

  useEffect(() => {
    if (hydrated) saveState(build);
  }, [build, hydrated]);

  const updateBuild = useCallback(
    (updater: (current: BuildState) => BuildState) => {
      setBuild((current) => updater(current));
    },
    []
  );

  const agent = useVoiceAgent({
    build,
    voice,
    pace,
    onBuildChange: updateBuild
  });

  const current = build.plan.steps[build.currentStep];
  const finished =
    build.completedSteps.length === build.plan.steps.length &&
    Boolean(build.finishedAt);

  const progress = useMemo(
    () =>
      Math.round(
        (build.completedSteps.length / build.plan.steps.length) * 100
      ),
    [build]
  );

  function move(delta: number) {
    setBuild((value) => ({
      ...value,
      currentStep: Math.max(
        0,
        Math.min(value.plan.steps.length - 1, value.currentStep + delta)
      )
    }));
  }

  function completeStep() {
    if (
      current.hazard !== "none" &&
      !build.confirmedHazards.includes(current.id)
    ) {
      return;
    }

    setBuild((value) => {
      const completed = Array.from(
        new Set([...value.completedSteps, current.id])
      );
      const isFinished = completed.length === value.plan.steps.length;
      return {
        ...value,
        completedSteps: completed,
        currentStep: Math.min(
          value.currentStep + 1,
          value.plan.steps.length - 1
        ),
        finishedAt: isFinished ? new Date().toISOString() : value.finishedAt
      };
    });
  }

  function restart() {
    agent.disconnect();
    clearState();
    onExit();
  }

  if (finished) {
    return (
      <main className="assistant-shell report-shell">
        <BuildReport build={build} onRestart={restart} />
      </main>
    );
  }

  return (
    <main className="assistant-shell">
      <nav className="assistant-nav">
        <button className="brand-button" onClick={onExit}>
          <span className="brand-mark">K</span>
          Kitwise
        </button>
        <div className="nav-progress">
          <span>
            Step {build.currentStep + 1} of {build.plan.steps.length}
          </span>
          <div className="progress-track">
            <i style={{ width: `${progress}%` }} />
          </div>
          <strong>{progress}%</strong>
        </div>
        <button className="round-button" onClick={restart} aria-label="New build">
          <RotateCcw />
        </button>
      </nav>

      <div className="assistant-grid">
        <section className="work-column">
          <div className="step-card" key={current.id}>
            <div className="step-meta">
              <span>Current step</span>
              <span className="tool-pill">
                <Hammer /> {current.tool}
              </span>
            </div>

            <h1>{current.title}</h1>
            <p className="step-instruction">{current.instruction}</p>

            <div className="tool-tip">
              <Hammer />
              <div>
                <strong>Tool coach</strong>
                <p>{current.toolTip}</p>
              </div>
            </div>

            {current.hazard !== "none" && (
              <div className="hazard-card">
                <AlertTriangle />
                <div>
                  <strong>Check before you continue</strong>
                  <p>{current.confirmation}</p>
                  <button
                    className={
                      build.confirmedHazards.includes(current.id)
                        ? "confirmed-button"
                        : "hazard-button"
                    }
                    onClick={() =>
                      setBuild((value) => ({
                        ...value,
                        confirmedHazards: Array.from(
                          new Set([...value.confirmedHazards, current.id])
                        )
                      }))
                    }
                  >
                    <Check />
                    {build.confirmedHazards.includes(current.id)
                      ? "Orientation confirmed"
                      : "I have checked the orientation"}
                  </button>
                </div>
              </div>
            )}

            {build.twoPerson && (
              <div className="people-grid">
                <div>
                  <span>Person A</span>
                  <p>{current.personA}</p>
                </div>
                <div>
                  <span>Person B</span>
                  <p>{current.personB}</p>
                </div>
              </div>
            )}

            <div className="step-actions">
              <button
                className="square-button"
                onClick={() => move(-1)}
                disabled={build.currentStep === 0}
              >
                <ArrowLeft />
              </button>
              <button
                className="complete-button"
                onClick={completeStep}
                disabled={
                  current.hazard !== "none" &&
                  !build.confirmedHazards.includes(current.id)
                }
              >
                <Check />
                Mark step done
              </button>
              <button
                className="square-button"
                onClick={() => move(1)}
                disabled={build.currentStep === build.plan.steps.length - 1}
              >
                <ArrowRight />
              </button>
            </div>
          </div>

          <div className="voice-panel">
            <div className={`mic-orb ${agent.status}`}>
              {agent.status === "speaking" ? <Volume2 /> : <Mic />}
            </div>
            <div className="voice-copy">
              <strong>
                {agent.status === "idle" && "Voice guide is off"}
                {agent.status === "connecting" && "Connecting"}
                {agent.status === "listening" && "Listening"}
                {agent.status === "thinking" && "Working that out"}
                {agent.status === "speaking" && "Kitwise is speaking"}
                {agent.status === "error" && "Voice connection stopped"}
              </strong>
              <span>
                {agent.partial ||
                  "Ask “which screw?”, “slower”, or “where was I?”"}
              </span>
            </div>
            <Waveform
              active={agent.connected}
              speaking={agent.status === "speaking"}
            />
            <button
              className={agent.connected ? "stop-button" : "mic-button"}
              onClick={agent.connected ? agent.disconnect : agent.connect}
              disabled={agent.status === "connecting"}
            >
              {agent.connected ? <CircleStop /> : <Mic />}
              {agent.connected ? "Stop" : "Start voice"}
            </button>
          </div>

          {agent.error && <p className="error-note">{agent.error}</p>}

          <div className="voice-settings">
            <label>
              Voice
              <select
                value={voice}
                onChange={(event) =>
                  setVoice(event.target.value as VoiceChoice["id"])
                }
                disabled={agent.connected}
              >
                {VOICES.map((choice) => (
                  <option value={choice.id} key={choice.id}>
                    {choice.label} · {choice.accent}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Pace
              <select
                value={pace}
                onChange={(event) =>
                  setPace(event.target.value as "relaxed" | "brisk")
                }
              >
                <option value="relaxed">Relaxed</option>
                <option value="brisk">Brisk</option>
              </select>
            </label>
            <button
              className={`mode-button ${build.twoPerson ? "active" : ""}`}
              onClick={() =>
                setBuild((value) => ({
                  ...value,
                  twoPerson: !value.twoPerson
                }))
              }
            >
              <Users />
              Two-person mode
            </button>
          </div>
        </section>

        <aside className="side-column">
          <section className="side-card">
            <div className="side-heading">
              <div>
                <span>Before you build</span>
                <h2>Parts check</h2>
              </div>
              <strong>
                {build.checkedParts.length}/{build.plan.parts.length}
              </strong>
            </div>

            <div className="parts-list">
              {build.plan.parts.map((part) => {
                const checked = build.checkedParts.includes(part.id);
                const missing = build.missingParts.includes(part.id);
                return (
                  <div
                    className={`part-row ${checked ? "checked" : ""} ${
                      missing ? "missing" : ""
                    }`}
                    key={part.id}
                  >
                    <button
                      className="tick"
                      onClick={() =>
                        setBuild((value) => ({
                          ...value,
                          checkedParts: checked
                            ? value.checkedParts.filter((id) => id !== part.id)
                            : [...value.checkedParts, part.id],
                          missingParts: value.missingParts.filter(
                            (id) => id !== part.id
                          )
                        }))
                      }
                    >
                      {checked && <Check />}
                    </button>
                    <div>
                      <strong>
                        {part.quantity} × {part.name}
                      </strong>
                      <span>{part.detail}</span>
                    </div>
                    <button
                      className="missing-button"
                      onClick={() =>
                        setBuild((value) => ({
                          ...value,
                          missingParts: missing
                            ? value.missingParts.filter((id) => id !== part.id)
                            : [...value.missingParts, part.id],
                          checkedParts: value.checkedParts.filter(
                            (id) => id !== part.id
                          )
                        }))
                      }
                    >
                      {missing ? "Missing" : "Flag"}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="side-card transcript-card">
            <div className="side-heading">
              <div>
                <span>Last few turns</span>
                <h2>Live transcript</h2>
              </div>
            </div>
            <div className="transcript-list" aria-live="polite">
              {build.transcript.length === 0 ? (
                <p className="empty-copy">
                  Start voice guidance. Your latest turns appear here.
                </p>
              ) : (
                build.transcript.slice(-8).map((line, index) => (
                  <div className={`transcript-line ${line.role}`} key={index}>
                    <span>{line.role === "user" ? "You" : "Kitwise"}</span>
                    <p>{line.text}</p>
                  </div>
                ))
              )}
              {agent.partial && (
                <div className="transcript-line user partial">
                  <span>You</span>
                  <p>{agent.partial}</p>
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
```

```tsx title="components/LandingPage.tsx"
"use client";

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileUp,
  Headphones,
  Mic,
  PackageCheck,
  Users
} from "lucide-react";
import { ManualSetup } from "./ManualSetup";
import { PartsIllustration, ToolIllustration } from "./Illustrations";
import { Reveal } from "./Reveal";
import type { BuildPlan } from "@/lib/types";

const features = [
  {
    icon: PackageCheck,
    title: "Count every part",
    copy: "Kitwise reads the list aloud and records what is present or missing."
  },
  {
    icon: Mic,
    title: "Interrupt at any point",
    copy: "Ask which screw, request a slower explanation, or jump back a step."
  },
  {
    icon: AlertTriangle,
    title: "Stop before mistakes",
    copy: "Glue, cutting, drilling and pinning wait for an orientation check."
  },
  {
    icon: Users,
    title: "Work as a pair",
    copy: "Each step is divided into clear tasks for Person A and Person B."
  }
];

export function LandingPage({
  onPlan
}: {
  onPlan: (plan: BuildPlan) => void;
}) {
  return (
    <main className="landing">
      <nav className="landing-nav">
        <a className="brand" href="#top">
          <span className="brand-mark">K</span>
          Kitwise
        </a>
        <div className="nav-links">
          <a href="#how">How it works</a>
          <a href="#features">Features</a>
        </div>
        <a className="nav-cta" href="#start">
          Start a build <ArrowRight />
        </a>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <span className="eyebrow">
            <Headphones /> Hands-free build guidance
          </span>
          <h1>
            Build it right,
            <em> one clear step at a time.</em>
          </h1>
          <p>
            Turn a flat-pack manual into spoken instructions. Keep both hands on
            the job and ask questions whenever something is unclear.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#start">
              Set up my build <ArrowRight />
            </a>
            <a className="text-button" href="#how">
              See how it works
            </a>
          </div>
          <div className="trust-row">
            <span><CheckCircle2 /> Interruptible</span>
            <span><CheckCircle2 /> Progress saved</span>
            <span><CheckCircle2 /> Safety checks</span>
          </div>
        </div>
        <div className="hero-visual">
          <ToolIllustration />
          <div className="speech-card speech-one">“Which screw goes here?”</div>
          <div className="speech-card speech-two">“Use the short M6 bolt.”</div>
        </div>
      </section>

      <section className="how-section" id="how">
        <Reveal className="section-intro">
          <span className="eyebrow">How it works</span>
          <h2>From confusing diagrams to a calm conversation.</h2>
        </Reveal>

        <div className="how-grid">
          {[
            {
              n: "01",
              icon: FileUp,
              title: "Add the manual",
              copy: "Choose a text-based PDF or paste the parts and steps."
            },
            {
              n: "02",
              icon: PackageCheck,
              title: "Check the kit",
              copy: "Confirm each panel, fitting and fastener before assembly."
            },
            {
              n: "03",
              icon: Headphones,
              title: "Build by voice",
              copy: "Listen, interrupt, clarify and continue without touching the screen."
            }
          ].map((item, index) => (
            <Reveal className="how-card" delay={index * 120} key={item.n}>
              <span className="step-number">{item.n}</span>
              <item.icon />
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="feature-section" id="features">
        <div className="feature-art-panel">
          <PartsIllustration />
          <h2>Know what is next. Know what can go wrong.</h2>
          <p>
            The current step, tool, parts and safety gate stay visible throughout
            the build.
          </p>
        </div>
        <div className="feature-list">
          {features.map((feature, index) => (
            <Reveal className="feature-row" delay={index * 80} key={feature.title}>
              <span><feature.icon /></span>
              <div>
                <h3>{feature.title}</h3>
                <p>{feature.copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="start-section" id="start">
        <ManualSetup onPlan={onPlan} />
      </section>

      <footer>
        <a className="brand" href="#top">
          <span className="brand-mark">K</span>
          Kitwise
        </a>
        <p>Clear instructions. Fewer wrong turns.</p>
      </footer>
    </main>
  );
}
```

```tsx title="app/page.tsx"
"use client";

import { useState } from "react";
import { LandingPage } from "@/components/LandingPage";
import { AssistantScreen } from "@/components/AssistantScreen";
import type { BuildPlan } from "@/lib/types";

export default function Home() {
  const [plan, setPlan] = useState<BuildPlan | null>(null);

  return plan ? (
    <AssistantScreen initialPlan={plan} onExit={() => setPlan(null)} />
  ) : (
    <LandingPage onPlan={setPlan} />
  );
}
```

```tsx title="app/layout.tsx"
import type { Metadata } from "next";
import { Nunito, Patrick_Hand } from "next/font/google";
import "./globals.css";

const body = Nunito({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap"
});

const display = Patrick_Hand({
  subsets: ["latin"],
  variable: "--font-display",
  weight: "400",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Kitwise — Hands-free build guidance",
  description:
    "A conversational assistant for flat-pack furniture and DIY kits."
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${body.variable} ${display.variable}`}>
        {children}
      </body>
    </html>
  );
}
```

```css title="app/globals.css"
:root {
  --cream: #fdf0c8;
  --cream-2: #fbe9b7;
  --paper: #fffaf0;
  --olive: #8a8f4a;
  --olive-dark: #555a2d;
  --purple: #9b5fb0;
  --purple-dark: #6f387f;
  --coral: #f28c5b;
  --pink: #f8afc3;
  --blue: #cbdaf0;
  --ink: #302f26;
  --muted: #6f6b5e;
  --line: rgba(48, 47, 38, 0.16);
  --shadow: 0 20px 50px rgba(86, 72, 43, 0.13);
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  color: var(--ink);
  background: var(--cream);
  font-family: var(--font-body), sans-serif;
}

button,
select,
textarea,
input {
  font: inherit;
}

button,
a {
  -webkit-tap-highlight-color: transparent;
}

button {
  color: inherit;
}

a {
  color: inherit;
  text-decoration: none;
}

h1,
h2,
h3,
.brand,
.brand-button {
  font-family: var(--font-display), cursive;
  font-weight: 400;
  letter-spacing: 0.01em;
}

p {
  line-height: 1.65;
}

svg {
  flex: 0 0 auto;
}

.landing {
  overflow: hidden;
  min-height: 100vh;
  background:
    radial-gradient(circle at 6% 8%, rgba(248, 175, 195, 0.55), transparent 20rem),
    radial-gradient(circle at 95% 24%, rgba(203, 218, 240, 0.72), transparent 22rem),
    var(--cream);
}

.landing-nav,
.assistant-nav {
  position: relative;
  z-index: 20;
  max-width: 1220px;
  margin: auto;
  padding: 22px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand,
.brand-button {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 29px;
}

.brand-button {
  border: 0;
  background: transparent;
  cursor: pointer;
}

.brand-mark {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  color: white;
  background: var(--purple);
  border: 2px solid var(--ink);
  border-radius: 50% 45% 52% 42%;
  box-shadow: 3px 3px 0 var(--ink);
  transform: rotate(-6deg);
}

.nav-links {
  display: flex;
  gap: 36px;
  color: var(--muted);
  font-weight: 800;
}

.nav-links a:hover {
  color: var(--purple-dark);
}

.nav-cta,
.primary-button,
.ghost-button,
.mic-button,
.stop-button,
.complete-button,
.hazard-button,
.confirmed-button {
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border: 2px solid var(--ink);
  border-radius: 14px 18px 13px 17px;
  padding: 10px 19px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 4px 4px 0 var(--ink);
  transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease;
}

.nav-cta {
  background: var(--olive);
  color: white;
}

.primary-button {
  color: white;
  background: var(--purple);
}

.ghost-button {
  background: var(--paper);
}

.primary-button:hover,
.ghost-button:hover,
.nav-cta:hover,
.mic-button:hover,
.stop-button:hover,
.complete-button:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 var(--ink);
}

.primary-button:active,
.ghost-button:active,
.nav-cta:active,
.mic-button:active,
.stop-button:active,
.complete-button:active {
  transform: translate(2px, 2px);
  box-shadow: 1px 1px 0 var(--ink);
}

.primary-button:disabled,
.ghost-button:disabled,
.complete-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.primary-button svg,
.ghost-button svg,
.nav-cta svg,
.mic-button svg,
.stop-button svg,
.complete-button svg {
  width: 20px;
  height: 20px;
}

.hero {
  min-height: 690px;
  max-width: 1220px;
  padding: 72px 28px 110px;
  margin: auto;
  display: grid;
 

*(Response hit the length limit. Say "continue" and I'll pick up exactly where I stopped.)*
