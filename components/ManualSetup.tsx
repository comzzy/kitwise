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