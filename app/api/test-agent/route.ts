import { NextResponse } from 'next/server';
import { runLifeArchitect } from '@/lib/agents/controller';

export async function GET() {
  try {
    const result = await runLifeArchitect("699dcea62f527ae04ef24336", "Lose belly fat and gain muscle in 90 days");
    return NextResponse.json({ plan: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}