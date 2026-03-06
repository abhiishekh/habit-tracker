// app/api/agents/accountability/route.ts
import { runAccountabilityAgent } from "@/lib/agents/accountability/architect";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId, feedback } = await req.json();
  const result = await runAccountabilityAgent(userId, feedback);
  return NextResponse.json(result);
}