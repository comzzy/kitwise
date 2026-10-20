import type { BuildPlan, BuildStep } from "./types";
import { demoPlan } from "./demo-plan";

export type KitIcon = "table" | "stool" | "bookshelf" | "desk" | "nightstand" | "shelf";

export type Kit = {
  plan: BuildPlan;
  icon: KitIcon;
  difficulty: "Easy" | "Medium" | "Tricky";
  blurb: string;
  tools: string[];
  people: string;
};

const step = (s: Omit<BuildStep, "confirmation" | "hazard"> & Partial<Pick<BuildStep, "confirmation" | "hazard">>): BuildStep => ({
  hazard: "none",
  confirmation: "",
  ...s
});

const created = "2026-10-20T00:00:00.000Z";

const barStool: BuildPlan = {
  id: "kit-bar-stool",
  title: "Bar Stool",
  sourceName: "Kitwise kit library",
  estimatedMinutes: 30,
  createdAt: created,
  warnings: [
    "Keep every bolt finger-tight until the footrest ring is on.",
    "The seat cushion faces down on a towel while you fix the legs."
  ],
  parts: [
    { id: "seat-a", name: "Seat", quantity: 1, detail: "Round padded seat with 4 threaded inserts underneath" },
    { id: "leg-b", name: "Leg", quantity: 4, detail: "Metal leg, 72 cm, angled foot cap" },
    { id: "ring-c", name: "Footrest ring", quantity: 1, detail: "Steel ring with 4 tabs" },
    { id: "bolt-d", name: "Leg bolt", quantity: 8, detail: "M6 × 20 mm, hex socket" },
    { id: "screw-e", name: "Ring screw", quantity: 4, detail: "M5 × 12 mm, Phillips head" },
    { id: "washer-f", name: "Spring washer", quantity: 8, detail: "M6, split ring" },
    { id: "glide-g", name: "Floor glide", quantity: 4, detail: "Push-in felt pad" }
  ],
  steps: [
    step({ id: "step-1", title: "Seat face-down", instruction: "Lay a towel on the floor and place the seat on it, cushion down, inserts facing up.", tool: "No tool", toolTip: "A towel stops the vinyl picking up grit and scratches.", parts: ["seat-a"], personA: "Lay out the towel.", personB: "Set the seat cushion-down." }),
    step({ id: "step-2", title: "Fit the floor glides", instruction: "Press one felt glide into the bottom of each leg until the rim sits flush.", tool: "No tool", toolTip: "Press it against the floor if your thumb is not enough.", parts: ["glide-g", "leg-b"], personA: "Hold each leg.", personB: "Press the glides in." }),
    step({ id: "step-3", title: "Attach the legs", instruction: "Line up each leg plate over two inserts, angled foot pointing outward. Add a spring washer to each bolt and screw it in finger-tight.", tool: "5 mm hex key", toolTip: "Start every bolt by hand first. If it resists, back it out and restart straight.", parts: ["leg-b", "bolt-d", "washer-f"], personA: "Hold the leg at the right angle.", personB: "Start the two bolts by hand." }),
    step({ id: "step-4", title: "Fit the footrest ring", instruction: "Slide the ring over the legs from the foot end to the tab marks, about 45 cm up, and secure each tab with a ring screw.", tool: "Phillips screwdriver", toolTip: "Tighten opposite tabs in turn so the ring stays level.", parts: ["ring-c", "screw-e"], personA: "Hold the ring level.", personB: "Drive the four screws." }),
    step({ id: "step-5", title: "Tighten the legs", instruction: "Tighten all eight leg bolts firmly, working in a cross pattern.", tool: "5 mm hex key", toolTip: "Use the long arm of the key for leverage. Stop when the spring washer is flat.", parts: ["bolt-d"], personA: "Steady the stool.", personB: "Tighten in a cross pattern." }),
    step({ id: "step-6", title: "Stand and check", instruction: "Turn the stool upright on a flat floor. Sit carefully and check it does not rock or creak.", tool: "No tool", toolTip: "If it rocks, loosen the two bolts on the high leg, press down, and retighten.", parts: [], personA: "Turn the stool over.", personB: "Do the sit test." })
  ]
};

const bookshelf: BuildPlan = {
  id: "kit-bookshelf-3-tier",
  title: "3-Tier Bookshelf",
  sourceName: "Kitwise kit library",
  estimatedMinutes: 45,
  createdAt: created,
  warnings: [
    "Fix the shelf to the wall with the anti-tip strap before loading it.",
    "Cam locks only turn a half-turn. Forcing them strips the chipboard."
  ],
  parts: [
    { id: "side-a", name: "Side panel", quantity: 2, detail: "106 × 30 cm, pre-drilled, cam holes facing in" },
    { id: "shelf-b", name: "Shelf", quantity: 3, detail: "76 × 29 cm, cam bolts on both ends" },
    { id: "top-c", name: "Top panel", quantity: 1, detail: "80 × 30 cm, finished edge on the front" },
    { id: "back-d", name: "Back board", quantity: 1, detail: "Thin hardboard, 104 × 78 cm" },
    { id: "cam-e", name: "Cam lock", quantity: 12, detail: "15 mm round metal cam" },
    { id: "cambolt-f", name: "Cam bolt", quantity: 12, detail: "Threaded pin, 34 mm" },
    { id: "dowel-g", name: "Wooden dowel", quantity: 16, detail: "8 × 30 mm" },
    { id: "nail-h", name: "Back-panel nail", quantity: 20, detail: "Small flat-head nail, 20 mm" },
    { id: "strap-i", name: "Anti-tip strap", quantity: 1, detail: "Strap with 2 screws and 1 wall plug" }
  ],
  steps: [
    step({ id: "step-1", title: "Screw in the cam bolts", instruction: "Screw a cam bolt into each small hole on the ends of the three shelves and the top panel, until only the neck shows.", tool: "Phillips screwdriver", toolTip: "Leave about 9 mm showing. Too deep and the cam cannot grab it.", parts: ["cambolt-f", "shelf-b", "top-c"], personA: "Hand over each panel.", personB: "Screw in the bolts." }),
    step({ id: "step-2", title: "Glue and fit the dowels", instruction: "Put a drop of wood glue in each dowel hole on the shelf ends and tap the dowels in halfway.", tool: "Wood glue and rubber mallet", toolTip: "One drop per hole is enough. Wipe any squeeze-out with a damp cloth straight away.", parts: ["dowel-g", "shelf-b", "top-c"], hazard: "glue", confirmation: "Confirm the dowels are going into the shelf ends, not the side panels. Glued dowels cannot come out.", personA: "Apply the glue.", personB: "Tap the dowels in." }),
    step({ id: "step-3", title: "Set the cams in the side panel", instruction: "Lay one side panel flat, cam holes up. Drop a cam into each round hole with the arrow pointing to the panel edge.", tool: "No tool", toolTip: "The open slot of the cam must face the edge so the bolt can slide in.", parts: ["cam-e", "side-a"], personA: "Hold the panel flat.", personB: "Seat and point the cams." }),
    step({ id: "step-4", title: "Join shelves to the first side", instruction: "Push the top panel and three shelves into the side panel, finished edges all at the front. Turn each cam clockwise a half-turn to lock.", tool: "Phillips screwdriver", toolTip: "Stop at the half-turn. You will feel the cam pull tight.", parts: ["shelf-b", "top-c", "side-a", "cam-e"], personA: "Hold the shelves upright.", personB: "Lock the cams." }),
    step({ id: "step-5", title: "Fit the second side", instruction: "Set cams in the second side panel, lower it onto the free shelf ends, and lock every cam.", tool: "Phillips screwdriver", toolTip: "Lower it evenly across all four dowel rows. Tilting it splits the holes.", parts: ["side-a", "cam-e"], personA: "Lower the side panel evenly.", personB: "Lock the cams." }),
    step({ id: "step-6", title: "Square the frame", instruction: "Lay the frame face-down and measure both diagonals. Push the long corner until they match.", tool: "Tape measure", toolTip: "Within 3 mm is fine. The back board will hold it square from here.", parts: [], personA: "Hold the tape on one corner.", personB: "Read and adjust." }),
    step({ id: "step-7", title: "Nail the back board", instruction: "Lay the back board on, smooth side facing in. Nail every 15 cm around the edge and along each shelf line.", tool: "Hammer", toolTip: "Pencil the shelf lines on the board first so the nails hit the shelves.", parts: ["back-d", "nail-h"], hazard: "pinning", confirmation: "Confirm the smooth side of the back board faces into the shelf and the frame is still square.", personA: "Hold the board in place.", personB: "Nail the edges." }),
    step({ id: "step-8", title: "Fix the anti-tip strap", instruction: "Stand the shelf against the wall. Screw the strap to the top panel, drill and plug the wall, then screw the strap to the wall.", tool: "Drill with 6 mm bit", toolTip: "Check for pipes and cables with a detector before drilling.", parts: ["strap-i"], hazard: "drilling", confirmation: "Confirm you have checked the wall for cables and pipes at the drill spot.", personA: "Hold the shelf against the wall.", personB: "Drill and fix the strap." })
  ]
};

const desk: BuildPlan = {
  id: "kit-office-desk",
  title: "Office Desk",
  sourceName: "Kitwise kit library",
  estimatedMinutes: 60,
  createdAt: created,
  warnings: [
    "The desktop is heavy. Lift and turn it with two people.",
    "Leave the frame bolts loose until the crossbar is fitted."
  ],
  parts: [
    { id: "top-a", name: "Desktop", quantity: 1, detail: "140 × 70 cm, pre-drilled underside" },
    { id: "leg-b", name: "Leg frame", quantity: 2, detail: "Steel A-frame with levelling feet" },
    { id: "beam-c", name: "Crossbar", quantity: 1, detail: "Steel bar, 120 cm" },
    { id: "modesty-d", name: "Modesty panel", quantity: 1, detail: "Front panel, 110 × 35 cm" },
    { id: "bolt-e", name: "Frame bolt", quantity: 8, detail: "M8 × 16 mm, hex socket" },
    { id: "screw-f", name: "Wood screw", quantity: 12, detail: "4 × 16 mm, Phillips, for the desktop" },
    { id: "screw-g", name: "Panel screw", quantity: 4, detail: "4 × 12 mm, Phillips" },
    { id: "tray-h", name: "Cable tray", quantity: 1, detail: "Wire basket with 2 clips" }
  ],
  steps: [
    step({ id: "step-1", title: "Desktop face-down", instruction: "Lay a blanket on the floor and set the desktop on it, finished side down.", tool: "No tool", toolTip: "Clear the floor first. One screw under the top will dent it.", parts: ["top-a"], personA: "Lift one end.", personB: "Lift the other end." }),
    step({ id: "step-2", title: "Join the frame", instruction: "Bolt the crossbar between the two leg frames, two bolts each end, finger-tight.", tool: "6 mm hex key", toolTip: "Finger-tight means the parts still wiggle. You square them later.", parts: ["leg-b", "beam-c", "bolt-e"], personA: "Hold the leg frames upright.", personB: "Start the bolts." }),
    step({ id: "step-3", title: "Fit the modesty panel", instruction: "Screw the modesty panel to the front tabs of both leg frames.", tool: "Phillips screwdriver", toolTip: "Check which side is the front: the crossbar sits towards the back.", parts: ["modesty-d", "screw-g"], personA: "Hold the panel flush.", personB: "Drive the four screws." }),
    step({ id: "step-4", title: "Place the frame on the top", instruction: "Turn the frame upside down onto the desktop and line its brackets up with the pre-drilled holes.", tool: "No tool", toolTip: "Measure the overhang on both sides. It should match.", parts: ["leg-b"], personA: "Hold the frame in place.", personB: "Check the overhang." }),
    step({ id: "step-5", title: "Screw frame to desktop", instruction: "Drive the twelve wood screws through the brackets into the pre-drilled holes.", tool: "Phillips screwdriver", toolTip: "Use a hand screwdriver, not a drill. The screws are 16 mm and the top is 18 mm thick.", parts: ["screw-f"], hazard: "drilling", confirmation: "Confirm you are using the 16 mm wood screws and the brackets sit over the pre-drilled holes. Longer screws go through the top.", personA: "Keep the frame centred.", personB: "Drive opposite corners first." }),
    step({ id: "step-6", title: "Tighten the frame", instruction: "Tighten all eight frame bolts firmly.", tool: "6 mm hex key", toolTip: "Alternate ends so the crossbar pulls in evenly.", parts: ["bolt-e"], personA: "Steady the frame.", personB: "Tighten the bolts." }),
    step({ id: "step-7", title: "Clip on the cable tray", instruction: "Clip the cable tray under the back edge of the desktop.", tool: "No tool", toolTip: "Push each clip until it clicks.", parts: ["tray-h"], personA: "Hold the tray.", personB: "Snap the clips." }),
    step({ id: "step-8", title: "Turn upright and level", instruction: "Turn the desk upright together and twist the levelling feet until it does not rock.", tool: "No tool", toolTip: "Lift by the frame, never by the desktop edge.", parts: [], personA: "Lift the left side.", personB: "Lift the right side." })
  ]
};

const nightstand: BuildPlan = {
  id: "kit-bedside-2-drawer",
  title: "Bedside Table (2 drawers)",
  sourceName: "Kitwise kit library",
  estimatedMinutes: 75,
  createdAt: created,
  warnings: [
    "Runners are handed. Left (L) and right (R) are stamped on each one.",
    "Drawer bottoms slide in before the drawer back goes on."
  ],
  parts: [
    { id: "side-a", name: "Carcass side", quantity: 2, detail: "Pre-drilled for runners" },
    { id: "top-b", name: "Top", quantity: 1, detail: "45 × 40 cm, finished edges" },
    { id: "base-c", name: "Base", quantity: 1, detail: "With 4 foot holes" },
    { id: "back-d", name: "Back board", quantity: 1, detail: "Thin hardboard" },
    { id: "runner-e", name: "Drawer runner pair", quantity: 2, detail: "Each pair: 1 cabinet + 1 drawer rail, L and R" },
    { id: "front-f", name: "Drawer front", quantity: 2, detail: "With handle holes" },
    { id: "dside-g", name: "Drawer side", quantity: 4, detail: "Grooved for the bottom" },
    { id: "dback-h", name: "Drawer back", quantity: 2, detail: "Short panel" },
    { id: "dbottom-i", name: "Drawer bottom", quantity: 2, detail: "Thin hardboard" },
    { id: "handle-j", name: "Handle", quantity: 2, detail: "With 2 M4 bolts each" },
    { id: "cam-k", name: "Cam lock set", quantity: 8, detail: "Cam and bolt" },
    { id: "screw-l", name: "Runner screw", quantity: 24, detail: "3.5 × 12 mm" },
    { id: "foot-m", name: "Foot", quantity: 4, detail: "Screw-in wooden foot" }
  ],
  steps: [
    step({ id: "step-1", title: "Fit the cabinet runners", instruction: "Screw the cabinet rails to the inside of each side panel on the marked holes, L rail on the left side, wheel at the front.", tool: "Phillips screwdriver", toolTip: "Hold the side panel up as it will stand to check which side is left.", parts: ["runner-e", "side-a", "screw-l"], personA: "Hold the rail on the holes.", personB: "Drive the screws." }),
    step({ id: "step-2", title: "Build the carcass", instruction: "Join the top and base between the two sides with cam locks, finished edges to the front.", tool: "Phillips screwdriver", toolTip: "Half a turn on each cam. Stop when it pulls tight.", parts: ["top-b", "base-c", "side-a", "cam-k"], personA: "Hold the sides upright.", personB: "Lock the cams." }),
    step({ id: "step-3", title: "Square and nail the back", instruction: "Lay the carcass face-down, check the diagonals match, then nail on the back board.", tool: "Hammer", toolTip: "Nail one corner, re-check square, then do the rest.", parts: ["back-d"], hazard: "pinning", confirmation: "Confirm the carcass is square and the back board's smooth side faces in.", personA: "Hold the board.", personB: "Nail the edges." }),
    step({ id: "step-4", title: "Screw in the feet", instruction: "Turn the carcass over and screw a foot into each hole in the base.", tool: "No tool", toolTip: "Hand-tight is enough. Overdoing it strips the insert.", parts: ["foot-m"], personA: "Tip the carcass.", personB: "Screw in the feet." }),
    step({ id: "step-5", title: "Assemble drawer boxes", instruction: "For each drawer, join two sides to the front, slide the bottom into the grooves, then fix the back.", tool: "Phillips screwdriver", toolTip: "If the bottom will not slide, the sides are swapped. Grooves must face each other.", parts: ["front-f", "dside-g", "dbottom-i", "dback-h"], personA: "Build the first drawer.", personB: "Build the second drawer." }),
    step({ id: "step-6", title: "Fit drawer runners", instruction: "Screw the drawer rails to the outside bottom edge of each drawer side, L on the left, wheel at the back.", tool: "Phillips screwdriver", toolTip: "Keep the rail flush with the bottom edge or the drawer will sit crooked.", parts: ["runner-e", "screw-l"], personA: "Do the top drawer.", personB: "Do the bottom drawer." }),
    step({ id: "step-7", title: "Attach the handles", instruction: "Bolt a handle through each drawer front from the inside.", tool: "Phillips screwdriver", toolTip: "Snug only. Overtightening cracks the front.", parts: ["handle-j"], personA: "Hold the handle.", personB: "Tighten from inside." }),
    step({ id: "step-8", title: "Hang the drawers", instruction: "Rest each drawer's wheels on the cabinet rails, tilt it up and push it home. Open and close to check.", tool: "No tool", toolTip: "If it drops at the front, the rails are swapped left to right.", parts: [], personA: "Guide the wheels.", personB: "Check the drawer runs smoothly." })
  ]
};

const floatingShelf: BuildPlan = {
  id: "kit-floating-shelf",
  title: "Wall-Mounted Floating Shelf",
  sourceName: "Kitwise kit library",
  estimatedMinutes: 40,
  createdAt: created,
  warnings: [
    "Scan for pipes and cables before every hole.",
    "Max load is 15 kg on solid wall, less on plasterboard. Use the right plugs."
  ],
  parts: [
    { id: "shelf-a", name: "Shelf", quantity: 1, detail: "80 × 22 cm, hollow back with 2 rod holes" },
    { id: "bracket-b", name: "Hidden bracket", quantity: 1, detail: "Steel bar with 2 support rods" },
    { id: "screw-c", name: "Wall screw", quantity: 4, detail: "5 × 60 mm" },
    { id: "plug-d", name: "Wall plug", quantity: 4, detail: "8 mm masonry plug" },
    { id: "grub-e", name: "Grub screw", quantity: 2, detail: "Locks the shelf to the rods" }
  ],
  steps: [
    step({ id: "step-1", title: "Mark the height", instruction: "Hold the bracket on the wall at the height you want and mark a level line along its top.", tool: "Spirit level and pencil", toolTip: "Measure from the ceiling, not the floor. Floors are rarely level.", parts: ["bracket-b"], personA: "Hold the bracket.", personB: "Check level and mark." }),
    step({ id: "step-2", title: "Mark and scan the holes", instruction: "Mark through the four bracket holes, then run a detector over each mark.", tool: "Cable and pipe detector", toolTip: "Never drill straight above or below a socket or switch.", parts: [], personA: "Hold the bracket.", personB: "Mark and scan." }),
    step({ id: "step-3", title: "Drill the holes", instruction: "Drill four 8 mm holes, 65 mm deep, on the marks.", tool: "Drill with 8 mm masonry bit", toolTip: "Wrap tape round the bit at 65 mm as a depth stop.", parts: [], hazard: "drilling", confirmation: "Confirm the detector showed no cables or pipes at all four marks and you are wearing eye protection.", personA: "Hold a vacuum under the bit.", personB: "Drill." }),
    step({ id: "step-4", title: "Plug the holes", instruction: "Tap a wall plug into each hole until flush.", tool: "Hammer", toolTip: "If a plug spins, the hole is too wide. Use a larger plug.", parts: ["plug-d"], personA: "Hold the plug straight.", personB: "Tap it in." }),
    step({ id: "step-5", title: "Fix the bracket", instruction: "Screw the bracket to the wall, rods pointing out. Check level before the last turn.", tool: "Drill on screw setting or screwdriver", toolTip: "Use a low clutch setting so you do not strip the plugs.", parts: ["bracket-b", "screw-c"], personA: "Hold the level on the bracket.", personB: "Drive the screws." }),
    step({ id: "step-6", title: "Slide on the shelf", instruction: "Slide the shelf onto the rods until it sits tight to the wall.", tool: "No tool", toolTip: "Wiggle it side to side as you push. Do not hammer it on.", parts: ["shelf-a"], personA: "Hold one end.", personB: "Hold the other end." }),
    step({ id: "step-7", title: "Lock the shelf", instruction: "Tighten the two grub screws underneath the shelf to lock it onto the rods.", tool: "2.5 mm hex key", toolTip: "Snug them up. The shelf should not lift off.", parts: ["grub-e"], personA: "Press the shelf to the wall.", personB: "Tighten the grub screws." })
  ]
};

const toolsOf = (plan: BuildPlan) =>
  Array.from(new Set(plan.steps.map((s) => s.tool).filter((t) => t !== "No tool")));

const make = (plan: BuildPlan, icon: KitIcon, difficulty: Kit["difficulty"], blurb: string, people: string): Kit => ({
  plan, icon, difficulty, blurb, people, tools: toolsOf(plan)
});

export const KITS: Kit[] = [
  make(barStool, "stool", "Easy", "Four legs, one ring, one hex key.", "1 person"),
  make(bookshelf, "bookshelf", "Medium", "Cam locks, dowels and a wall strap.", "2 recommended"),
  make(desk, "desk", "Medium", "Steel frame under a heavy top.", "2 people"),
  make(nightstand, "nightstand", "Tricky", "Carcass, two drawers, handed runners.", "1–2 people"),
  make(floatingShelf, "shelf", "Medium", "Level, scan, drill, slide on.", "2 recommended"),
  make(demoPlan, "table", "Easy", "The quick five-step demo table.", "1–2 people")
];
