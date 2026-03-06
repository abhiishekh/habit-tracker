// app/api/agents/gym/route.ts
import { runLifeArchitect } from "@/lib/agents/gym/architect";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId, userGoal, weight, height, experience } = await req.json();
  const result = await runLifeArchitect(userId, userGoal, { weight, height, experience });
  return NextResponse.json(result);
}