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
    const saved = loadState(initialPlan.id);
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
    clearState(build.plan.id);
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