import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { runLifeArchitect } from '@/lib/agents/controller';

import { hasReachedBlueprintLimit } from '@/lib/subscription';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limitReached = await hasReachedBlueprintLimit(session.user.id);
    if (limitReached) {
      return NextResponse.json({ error: "Blueprint generation limit reached. Upgrade to Pro for unlimited AI blueprints." }, { status: 403 });
    }

    const body = await req.json();
    const { goal, currentSituation, timeline, height, weight, experience, refinement } = body;

    // Trigger your agent army
    const result = await runLifeArchitect(session.user.id, goal, {
      height: Number(height),
      weight: Number(weight),
      experience,
      refinement
    });

    return NextResponse.json({ success: true, plan: result });

  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}