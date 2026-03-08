import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { runBusinessArchitect } from "@/lib/agents/business/architect";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { userGoal, context } = await req.json();
        const result = await runBusinessArchitect(session.user.id, userGoal, context);

        if (result.success) {
            return NextResponse.json(result);
        } else {
            return NextResponse.json({ error: result.message || "Failed to generate plan" }, { status: 500 });
        }
    } catch (error) {
        console.error("[Business API] Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
