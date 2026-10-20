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