// app/api/agents/project/route.ts
import { runProjectArchitect } from "@/lib/agents/project/architect";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId, userGoal, context } = await req.json();
  const result = await runProjectArchitect(userId, userGoal, context);
  return NextResponse.json(result);
}