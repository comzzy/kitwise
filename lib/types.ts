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