// app/api/agents/income/route.ts
import { runIncomeArchitect } from "@/lib/agents/income/architect";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId, userGoal, context } = await req.json();
  const result = await runIncomeArchitect(userId, userGoal, context);
  return NextResponse.json(result);
}