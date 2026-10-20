"use client";

import { useState } from "react";
import { LandingPage } from "@/components/LandingPage";
import { AssistantScreen } from "@/components/AssistantScreen";
import type { BuildPlan } from "@/lib/types";

export default function Home() {
  const [plan, setPlan] = useState<BuildPlan | null>(null);

  return plan ? (
    <AssistantScreen initialPlan={plan} onExit={() => setPlan(null)} />
  ) : (
    <LandingPage onPlan={setPlan} />
  );
}