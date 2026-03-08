// app/api/agents/gym/route.ts
import { runGymArchitect } from "@/lib/agents/gym/architect";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { userId, userGoal, weight, height, experience } = await req.json();
  const result = await runGymArchitect(userId, userGoal, { weight, height, experience });
  return NextResponse.json(result);
}