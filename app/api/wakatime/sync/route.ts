import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { fetchTodayStats } from "@/lib/vscodeStats";

export async function POST(req: Request) {
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

        const stats = await fetchTodayStats();

        if (typeof stats === "string") {
            return NextResponse.json({ error: stats }, { status: 400 });
        }

        if (!stats) {
            return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const wakaTime = await prisma.wakaTime.upsert({
            where: {
                userId_date: {
                    userId: user.id,
                    date: today,
                },
            },
            update: {
                totalTime: stats.totalTime,
                projects: stats.projects,
                languages: stats.languages,
                categories: stats.categories,
            },
            create: {
                userId: user.id,
                date: today,
                totalTime: stats.totalTime,
                projects: stats.projects,
                languages: stats.languages,
                categories: stats.categories,
            },
        });

        return NextResponse.json(wakaTime);
    } catch (error) {
        console.error("Error syncing WakaTime:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
