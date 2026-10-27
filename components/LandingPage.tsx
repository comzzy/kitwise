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
          <a href="/docs">Docs</a>
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
        <div className="footer-links">
          <a href="/docs">Docs</a>
        </div>
        <p>Clear instructions. Fewer wrong turns.</p>
      </footer>
    </main>
  );
}