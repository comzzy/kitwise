import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import "./docs.css";

export const metadata: Metadata = {
  title: "Docs — Kitwise",
  description:
    "What Kitwise is, the problems it solves, how to use it, and answers to common questions."
};

const sections = [
  { id: "what", label: "What Kitwise is" },
  { id: "problem", label: "The problem" },
  { id: "solution", label: "How Kitwise helps" },
  { id: "guide", label: "Step-by-step guide" },
  { id: "faq", label: "FAQ" }
];

const problems = [
  ["Diagrams with no words", "Most manuals are pictures only. You end up squinting at a drawing, guessing which way a panel faces."],
  ["Missing parts, found too late", "You often discover a bolt is missing halfway through, with the piece half built and nowhere to put it."],
  ["Mistakes you can't undo", "Glue sets, nails go in, holes get drilled. Get the orientation wrong and there is no going back."],
  ["Full hands, paper manual", "You're holding a panel with one hand and a screwdriver with the other. Turning a page means putting something down."],
  ["Two people, no plan", "Building with a friend sounds easier, until you are both holding the same side and nobody is reaching for the screws."],
  ["Losing your place", "Take a break for dinner and when you come back, you're not sure which step you finished."]
];

const features = [
  ["Parts check", "Before you start, Kitwise reads the parts list aloud. You say what you have, and it notes anything missing so you know before you begin, not halfway in."],
  ["Interrupt any time", "You don't have to wait for it to finish talking. Ask “which screw?” mid-sentence and it stops to answer."],
  ["Mistake guard", "Before any step with glue, cutting, drilling or nailing, Kitwise pauses and asks you to confirm the part is the right way round. It won't move on until you do."],
  ["Progress memory", "Your progress is saved in your browser as you go. Close the tab, come back later, and pick up on the same step."],
  ["Tool coach", "Every step names the tool you need and gives a small tip, like starting bolts by hand so they don't cross-thread."],
  ["Two-person mode", "Switch it on and each step is split into a job for Person A and a job for Person B."],
  ["Build report", "When you finish, you can download a short report of what was built, which parts were missing, and which safety checks you confirmed."]
];

const steps = [
  ["Open Kitwise", "Go to kitwiseapp.vercel.app on a laptop, tablet or phone and tap “Start a build”."],
  ["Pick a kit", "Choose one of the ready-made kits, like the Bar Stool or the 3-Tier Bookshelf. Each one already has its parts, tools, steps and safety checks. You can also upload your own manual as a text PDF or paste in typed notes."],
  ["Allow the microphone", "When you start the voice guide, your browser will ask to use your microphone. Say yes, or Kitwise can't hear you."],
  ["Tap “Start voice”", "Pick a voice and a pace if you like, then tap Start voice. From here you can put the phone down and use your hands."],
  ["Check your parts", "Kitwise reads out each part. Answer as you go, for example “got all eight” or “I'm missing one washer”."],
  ["Follow the steps", "It explains one step at a time and tells you which tool to use. Say “done” or “next” when you're ready to move on."],
  ["Interrupt whenever you need", "Cut in at any time: “which screw?”, “slower please”, “go back a step”, or “where was I?”."],
  ["Confirm risky steps", "Before glue, nails or drilling, it asks you to check the part is the right way round. Say yes once you've looked."],
  ["Building with someone?", "Tap “Two-person mode” and each step is split between Person A and Person B."],
  ["Finish and download", "After the last step you'll see a summary. Tap the download button to save your build report."]
];

const phrases = [
  "“Which screw goes here?”",
  "“Can you say that slower?”",
  "“Go back a step.”",
  "“Where was I?”",
  "“What tool do I need?”",
  "“I'm missing a part.”",
  "“Done, what's next?”",
  "“Yes, it's facing the right way.”"
];

const faqs = [
  ["Do I need to touch the screen?", "Only to get started: choosing a kit, allowing the microphone and tapping Start voice. After that the whole build can be done by talking."],
  ["What if I'm missing a part?", "Just say so during the parts check, or at any point later. Kitwise marks it as missing, keeps going where it can, and lists it in your build report so you know what to ask the seller for."],
  ["Can two people use it?", "Yes. Turn on Two-person mode and every step shows a task for Person A and a task for Person B, so you're not both reaching for the same thing."],
  ["What happens if I take a break?", "Your progress is saved in this browser as you go. When you come back on the same device and browser, open the same kit and you'll be on the step where you left off. You can also ask “where was I?”."],
  ["Which furniture is supported?", "There are ready-made kits for an Oak Side Table, Bar Stool, 3-Tier Bookshelf, Office Desk, Bedside Table with two drawers, and a Wall-Mounted Floating Shelf. For anything else, you can try your own manual."],
  ["Can I use my own manual?", "Yes, if it has real text in it: a text-based PDF, or notes you type or paste in. Manuals that are only photos or scanned pictures can't be read yet, so for those, type the parts and steps in yourself or pick a ready-made kit."],
  ["Does it record or store my audio?", "Kitwise doesn't save any recordings. Your voice is streamed to the voice service only while the voice guide is on, so it can understand you and reply. What Kitwise keeps is a short text transcript of the conversation, shown on screen and saved in your browser with your progress."],
  ["Is my data private?", "There are no accounts, and your build progress lives in your own browser's storage, not on a Kitwise server. The private API key never leaves the server; your browser only gets a short-lived token that expires after 60 seconds if it isn't used. If you upload a manual, its text is sent to an AI service to turn it into steps."],
  ["Which browsers and devices work?", "A recent browser with microphone access, such as Chrome, Edge or Safari,, on a laptop, tablet or phone. Headphones or a nearby speaker help in a noisy room."],
  ["What voices are available?", "Four: Alba and Ivy (US English), and Paul and Vera (UK English). You can also choose a relaxed or brisk pace."]
];

function Starburst({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
      <path d="M50 2 58 32 88 18 70 44 98 54 66 60 78 92 50 72 22 92 34 60 2 54 30 44 12 18 42 32Z" />
    </svg>
  );
}

export default function DocsPage() {
  return (
    <main className="landing docs-page">
      <nav className="landing-nav">
        <a className="brand" href="/">
          <span className="brand-mark">K</span>
          Kitwise
        </a>
        <div className="nav-links">
          <a href="/#how">How it works</a>
          <a href="/#features">Features</a>
          <a href="/docs" aria-current="page">Docs</a>
        </div>
        <a className="nav-cta" href="/#start">
          Start a build <ArrowRight />
        </a>
      </nav>

      <header className="docs-hero">
        <svg className="docs-blob docs-blob-a" viewBox="0 0 200 200" aria-hidden="true">
          <path className="blob blob-purple" d="M44 -58C57 -47 67 -31 70 -14C73 4 69 23 59 38C48 53 31 64 12 68C-7 72 -28 69 -44 58C-60 47 -71 28 -73 9C-75 -11 -68 -31 -55 -43C-41 -55 -20 -60 -2 -58C16 -56 31 -69 44 -58Z" transform="translate(100 100)" />
        </svg>
        <Starburst className="docs-star docs-star-a" />
        <Starburst className="docs-star docs-star-b" />
        <span className="eyebrow">Docs</span>
        <h1>
          Kitwise, <em>explained in two minutes.</em>
        </h1>
        <p>
          What it is, why it exists, how to use it, and answers to the
          questions people usually ask.
        </p>
      </header>

      <div className="docs-layout">
        <aside className="docs-toc">
          <details open>
            <summary>On this page</summary>
            <ol>
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`}>{s.label}</a>
                </li>
              ))}
            </ol>
          </details>
        </aside>

        <div className="docs-content">
          <section id="what" className="docs-section">
            <Reveal className="docs-card">
              <span className="docs-num">01</span>
              <h2>What Kitwise is</h2>
              <p>
                Kitwise is a hands-free voice guide for putting together
                flat-pack furniture and DIY kits. Instead of reading a manual,
                you talk to it, and it walks you through the build one step at
                a time.
              </p>
              <p>
                Think of it as a patient friend standing next to you who has
                already read the instructions. You can ask questions, ask it to
                slow down, or go back, all without putting your tools down.
              </p>
            </Reveal>
          </section>

          <section id="problem" className="docs-section">
            <Reveal className="docs-intro">
              <span className="docs-num">02</span>
              <h2>The problem</h2>
              <p>
                Most people have a flat-pack story. Usually it goes wrong in one
                of these ways.
              </p>
            </Reveal>
            <div className="docs-grid">
              {problems.map(([title, copy], i) => (
                <Reveal className="docs-mini" delay={(i % 2) * 90} key={title}>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </Reveal>
              ))}
            </div>
          </section>

          <section id="solution" className="docs-section">
            <Reveal className="docs-intro">
              <span className="docs-num">03</span>
              <h2>How Kitwise helps</h2>
              <p>Each feature is there to fix one of those problems.</p>
            </Reveal>
            <div className="docs-list">
              {features.map(([title, copy], i) => (
                <Reveal className="docs-row" delay={i * 50} key={title}>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </Reveal>
              ))}
            </div>
            <Reveal className="docs-card docs-tech">
              <h3>What's under the hood</h3>
              <p>
                The conversation runs on AssemblyAI's Voice Agent API. One
                live connection handles listening, knowing when you've finished
                speaking, letting you cut in, and speaking back in a natural
                voice. That's why it feels like a conversation rather than a
                walkie-talkie.
              </p>
              <p>
                The secret API key stays on the Kitwise server. Your browser
                only receives a short-lived token, valid for 60 seconds, to open
                the voice session.
              </p>
            </Reveal>
          </section>

          <section id="guide" className="docs-section">
            <Reveal className="docs-intro">
              <span className="docs-num">04</span>
              <h2>Step-by-step guide</h2>
              <p>Here's a full build, from opening the site to the last screw.</p>
            </Reveal>
            <ol className="docs-steps">
              {steps.map(([title, copy], i) => (
                <Reveal className="docs-step" delay={40} key={title}>
                  <span className="docs-step-n">{i + 1}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{copy}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
            <Reveal className="docs-card docs-say">
              <h3>Things you can say</h3>
              <ul>
                {phrases.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <p className="docs-note">
                You don't need exact words. Say it the way you'd say it to a
                person.
              </p>
            </Reveal>
          </section>

          <section id="faq" className="docs-section">
            <Reveal className="docs-intro">
              <span className="docs-num">05</span>
              <h2>Questions people ask</h2>
            </Reveal>
            <div className="docs-faq">
              {faqs.map(([q, a]) => (
                <details className="docs-faq-item" key={q}>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </section>

          <Reveal className="docs-card docs-cta">
            <h2>Ready to build something?</h2>
            <a className="primary-button" href="/#start">
              Start a build <ArrowRight />
            </a>
          </Reveal>
        </div>
      </div>

      <footer>
        <a className="brand" href="/">
          <span className="brand-mark">K</span>
          Kitwise
        </a>
        <div className="footer-links">
          <a href="/">Home</a>
          <a href="/docs">Docs</a>
        </div>
        <p>Clear instructions. Fewer wrong turns.</p>
      </footer>
    </main>
  );
}
