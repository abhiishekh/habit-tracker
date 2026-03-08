import { runLifeArchitect } from "@/lib/agents/life/architect";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { userGoal, context } = await req.json();
        const userId = "user_placeholder"; // In a real app, get from auth

        const result = await runLifeArchitect(userId, userGoal, context);
        return NextResponse.json({ success: true, ...result });
    } catch (error) {
        console.error("Life Agent API Error:", error);
        return NextResponse.json({ success: false, message: "Architecture Failed" }, { status: 500 });
    }
}
