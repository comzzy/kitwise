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