// app/api/agents/orchestrator/route.ts
import { runOrchestrator } from "@/lib/agents/orchestrator/orchestrator";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { userId, userGoal } = await req.json();
  const result = await runOrchestrator(userId, userGoal);
  return NextResponse.json(result);
}