// app/api/agents/accountability/route.ts
import { runAccountabilityAgent } from "@/lib/agents/accountability/architect";
import { NextRequest, NextResponse } from "next/server";
import { hasReachedBlueprintLimit } from '@/lib/subscription';

export async function POST(req: NextRequest) {
  const { userId, feedback } = await req.json();
  const result = await runAccountabilityAgent(userId, feedback);
  return NextResponse.json(result);
}
