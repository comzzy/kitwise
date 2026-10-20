import type { BuildPlan, BuildState } from "./types";

const PREFIX = "kitwise-build-state-v2:";
const keyFor = (planId: string) => PREFIX + planId;

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

export function loadState(planId: string): BuildState | null {
  if (typeof window === "undefined") return null;
  try {
    const value = localStorage.getItem(keyFor(planId));
    return value ? (JSON.parse(value) as BuildState) : null;
  } catch {
    return null;
  }
}

export function saveState(state: BuildState) {
  localStorage.setItem(keyFor(state.plan.id), JSON.stringify(state));
}

export function clearState(planId: string) {
  localStorage.removeItem(keyFor(planId));
}