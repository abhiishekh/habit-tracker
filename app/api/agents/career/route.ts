// app/api/agents/career/route.ts
import { runCareerArchitect } from "@/lib/agents/career/architect";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId, userGoal, context } = await req.json();
  const result = await runCareerArchitect(userId, userGoal, context);
  return NextResponse.json(result);
}