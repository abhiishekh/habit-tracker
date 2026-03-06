// app/api/agents/orchestrator/route.ts
import { runOrchestrator } from "@/lib/agents/orchestrator/orchestrator";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId, userGoal } = await req.json();
  const result = await runOrchestrator(userId, userGoal);
  return NextResponse.json(result);
}