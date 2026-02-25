
import { fetchTodayStats } from "@/lib/vscodeStats";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const data = await fetchTodayStats();
        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json(
            { error: e.message },
            { status: 500 }
        );
    }
}