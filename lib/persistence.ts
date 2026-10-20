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