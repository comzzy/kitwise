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
      {
        error:
          result.metadata?.errors?.join("; ") ??
          result.message ??
          result.error ??
          "Manual parsing failed."
      },
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