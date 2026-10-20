import type { BuildPlan } from "./types";

export const demoPlan: BuildPlan = {
  id: "demo-side-table",
  title: "Oak Side Table",
  sourceName: "Kitwise demo manual",
  estimatedMinutes: 35,
  createdAt: new Date().toISOString(),
  warnings: [
    "Do not fully tighten bolts until the frame is square.",
    "Confirm the tabletop is face-down before fastening."
  ],
  parts: [
    { id: "panel-a", name: "Tabletop", quantity: 1, detail: "Large panel, finished face" },
    { id: "leg-b", name: "Leg", quantity: 4, detail: "Long timber pieces" },
    { id: "rail-c", name: "Side rail", quantity: 4, detail: "Short frame pieces" },
    { id: "bolt-d", name: "Hex bolt", quantity: 8, detail: "M6 × 35 mm" },
    { id: "dowel-e", name: "Wooden dowel", quantity: 8, detail: "8 × 30 mm" }
  ],
  steps: [
    {
      id: "step-1",
      title: "Lay out the frame",
      instruction: "Place the four rails in a rectangle with their pilot holes facing inward.",
      tool: "No tool",
      toolTip: "Use the tabletop as a size guide, but keep its finished face protected.",
      parts: ["rail-c"],
      hazard: "none",
      confirmation: "",
      personA: "Arrange the two long rails.",
      personB: "Arrange the two short rails."
    },
    {
      id: "step-2",
      title: "Fit the dowels",
      instruction: "Push two dowels into each rail end until they sit halfway in.",
      tool: "Rubber mallet",
      toolTip: "A folded cloth and the heel of your hand can replace a rubber mallet.",
      parts: ["dowel-e", "rail-c"],
      hazard: "none",
      confirmation: "",
      personA: "Hold each rail steady.",
      personB: "Seat the dowels with light taps."
    },
    {
      id: "step-3",
      title: "Join the legs",
      instruction: "Join one leg to each corner. Keep the pilot holes facing the centre.",
      tool: "4 mm hex key",
      toolTip: "Tighten each bolt only until snug. Final tightening comes later.",
      parts: ["leg-b", "bolt-d", "rail-c"],
      hazard: "none",
      confirmation: "",
      personA: "Hold the frame upright.",
      personB: "Insert and lightly tighten the bolts."
    },
    {
      id: "step-4",
      title: "Fix the tabletop",
      instruction: "Turn the tabletop face-down on a clean blanket, centre the frame, then fasten it.",
      tool: "Phillips screwdriver",
      toolTip: "Stop when the screw head meets the bracket. Do not crush the timber.",
      parts: ["panel-a"],
      hazard: "drilling",
      confirmation: "Confirm the finished tabletop face is down on a clean, soft surface.",
      personA: "Keep the frame centred.",
      personB: "Fasten opposite corners first."
    },
    {
      id: "step-5",
      title: "Square and finish",
      instruction: "Stand the table upright, check that it does not rock, then tighten every bolt evenly.",
      tool: "4 mm hex key",
      toolTip: "Alternate corners rather than tightening one side completely.",
      parts: ["bolt-d"],
      hazard: "none",
      confirmation: "",
      personA: "Check the table for rocking.",
      personB: "Tighten the bolts in a diagonal pattern."
    }
  ]
};