# Kitwise

Talk your furniture together.

Kitwise is a voice assistant that walks you through building flat-pack furniture, one step at a time. You keep both hands on the job and ask questions out loud.

Live: https://kitwiseapp.vercel.app · Docs & FAQ: https://kitwiseapp.vercel.app/docs

## The problem

- Most manuals are pictures with no words, so you guess which way a panel faces.
- Missing parts turn up halfway through the build.
- Glue, nails and drilled holes can't be undone if the orientation is wrong.
- Your hands are full, so turning a page means putting something down.
- After a break, you're not sure which step you finished.

## The solution

Kitwise reads each step aloud and listens while you work. Ask "which screw?", "slower" or "where was I?" at any time, even mid-sentence. Before any step with glue, cutting, drilling or nailing, it stops and asks you to confirm the part is the right way round.

## Features

- Six ready-made kits: Oak Side Table, Bar Stool, 3-Tier Bookshelf, Office Desk, Bedside Table (2 drawers), Wall-Mounted Floating Shelf
- Illustrated steps with the tool needed and a tool tip
- Parts checklist with a flag for anything missing
- Safety checks before irreversible steps
- Two-person mode that splits the work between Person A and Person B
- Voices (Alba, Paul, Vera, Ivy) and pace (relaxed or brisk)
- Progress for each kit saved in your browser
- Live transcript of the conversation

## Tech stack

Next.js 15, React, TypeScript, deployed on Vercel. Voice runs on AssemblyAI's Voice Agent API: speech recognition and speech output over one WebSocket. The browser gets a short-lived token from `/api/voice-token`, so the API key never leaves the server.

## Run it locally

```bash
git clone https://github.com/comzzy/kitwise.git
cd kitwise
npm install
cp .env.example .env.local   # then add your key
npm run dev
```

Open http://localhost:3000.

### Environment variable

| Name | What it is |
| --- | --- |
| `ASSEMBLYAI_API_KEY` | Your AssemblyAI API key. Server-side only. |

## Deploy on Vercel

1. Import the repo at https://vercel.com/new.
2. Add `ASSEMBLYAI_API_KEY` under Project Settings → Environment Variables.
3. Deploy.

## Demo video

Watch: https://cdn.jsdelivr.net/gh/comzzy/kitwise@master/demo/kitwise-demo-v2.mp4

Music: "Carefree" by Kevin MacLeod (incompetech.com), CC BY 4.0. Narration voice: Ivy (AssemblyAI).
