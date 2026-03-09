// app/api/agents/orchestrator/route.ts
import { runOrchestrator } from "@/lib/agents/orchestrator/orchestrator";
import { NextRequest, NextResponse } from "next/server";

import { hasReachedBlueprintLimit } from '@/lib/subscription';

export async function POST(req: NextRequest) {
  const { userId, userGoal } = await req.json();

  const limitReached = await hasReachedBlueprintLimit(userId);
  if (limitReached) {
    return NextResponse.json({ error: "Blueprint generation limit reached. Upgrade to Pro for unlimited AI blueprints." }, { status: 403 });
  }

  const result = await runOrchestrator(userId, userGoal);
  return NextResponse.json(result);
}