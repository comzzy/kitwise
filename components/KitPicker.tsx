"use client";

import { Clock, ListChecks, Gauge, Users } from "lucide-react";
import type { BuildPlan } from "@/lib/types";
import { KITS, type KitIcon } from "@/lib/kits";

const S = { stroke: "#302f26", strokeWidth: 3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function KitArt({ icon }: { icon: KitIcon }) {
  switch (icon) {
    case "stool":
      return (<svg viewBox="0 0 80 80" fill="none" aria-hidden><ellipse cx="40" cy="18" rx="20" ry="6" fill="#F28C5B" {...S} /><path d="M26 22 L18 70 M54 22 L62 70 M34 23 L32 70 M46 23 L48 70" {...S} /><ellipse cx="40" cy="52" rx="17" ry="4" {...S} /></svg>);
    case "bookshelf":
      return (<svg viewBox="0 0 80 80" fill="none" aria-hidden><rect x="16" y="8" width="48" height="64" rx="3" fill="#FDF0C8" {...S} /><path d="M16 29 H64 M16 50 H64" {...S} /><rect x="22" y="14" width="5" height="15" fill="#9B5FB0" {...S} strokeWidth={2} /><rect x="29" y="17" width="5" height="12" fill="#8A8F4A" {...S} strokeWidth={2} /><rect x="46" y="36" width="12" height="14" fill="#F28C5B" {...S} strokeWidth={2} /></svg>);
    case "desk":
      return (<svg viewBox="0 0 80 80" fill="none" aria-hidden><rect x="6" y="26" width="68" height="8" rx="2" fill="#8A8F4A" {...S} /><path d="M14 34 L10 66 M14 34 L22 66 M66 34 L58 66 M66 34 L70 66 M18 50 H62" {...S} /><rect x="30" y="12" width="20" height="14" rx="2" fill="#CBDAF0" {...S} /></svg>);
    case "nightstand":
      return (<svg viewBox="0 0 80 80" fill="none" aria-hidden><rect x="16" y="14" width="48" height="50" rx="3" fill="#F8AFC3" {...S} /><path d="M16 39 H64" {...S} /><path d="M34 27 H46 M34 52 H46" {...S} strokeWidth={4} /><path d="M22 64 V72 M58 64 V72" {...S} /></svg>);
    case "shelf":
      return (<svg viewBox="0 0 80 80" fill="none" aria-hidden><path d="M10 8 V72" {...S} strokeDasharray="4 5" /><rect x="10" y="38" width="60" height="9" rx="2" fill="#9B5FB0" {...S} /><rect x="20" y="22" width="6" height="16" fill="#FDF0C8" {...S} strokeWidth={2} /><rect x="28" y="26" width="6" height="12" fill="#F28C5B" {...S} strokeWidth={2} /><circle cx="56" cy="32" r="6" fill="#8A8F4A" {...S} strokeWidth={2} /></svg>);
    default:
      return (<svg viewBox="0 0 80 80" fill="none" aria-hidden><rect x="10" y="22" width="60" height="9" rx="2" fill="#F28C5B" {...S} /><path d="M18 31 V68 M62 31 V68 M18 44 H62" {...S} /></svg>);
  }
}

export function KitPicker({ onPlan }: { onPlan: (plan: BuildPlan) => void }) {
  return (
    <div className="kit-grid" role="list">
      {KITS.map((kit, index) => (
        <button
          role="listitem"
          key={kit.plan.id}
          className={`kit-card kit-${kit.icon}`}
          style={{ animationDelay: `${index * 70}ms` }}
          onClick={() => onPlan({ ...kit.plan, createdAt: new Date().toISOString() })}
        >
          <span className="kit-art"><KitArt icon={kit.icon} /></span>
          <span className="kit-body">
            <strong>{kit.plan.title}</strong>
            <small>{kit.blurb}</small>
            <span className="kit-meta">
              <span><ListChecks />{kit.plan.steps.length} steps</span>
              <span><Clock />{kit.plan.estimatedMinutes} min</span>
              <span className={`kit-diff diff-${kit.difficulty.toLowerCase()}`}><Gauge />{kit.difficulty}</span>
              <span><Users />{kit.people}</span>
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}
