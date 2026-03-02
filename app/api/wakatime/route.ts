import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const stats = await prisma.wakaTime.findUnique({
            where: {
                userId_date: {
                    userId: user.id,
                    date: today,
                },
            },
        });

        if (!stats) {
            return NextResponse.json({ message: "No stats found for today" }, { status: 404 });
        }

        return NextResponse.json(stats);
    } catch (e: any) {
        console.error("Error fetching WakaTime stats:", e);
        return NextResponse.json(
            { error: e.message },
            { status: 500 }
        );
    }
}