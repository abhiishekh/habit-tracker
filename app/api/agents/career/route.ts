import { runCareerArchitect } from "@/lib/agents/career/architect";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userGoal, context } = await req.json();
    const result = await runCareerArchitect(session.user.id, userGoal, context);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Career AI Generation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}