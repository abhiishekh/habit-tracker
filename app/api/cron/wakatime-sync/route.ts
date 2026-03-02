import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchTodayStats } from "@/lib/vscodeStats";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    const authHeader = request.headers.get('authorization');

    // Allow both auth header (Vercel Cron) and query param (manual/test)
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && secret !== process.env.CRON_SECRET) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        console.log("Starting WakaTime sync cron job...");
        const users = await prisma.user.findMany({
            include: {
                accounts: true
            }
        });

        console.log(`Found ${users.length} users to sync.`);
        const results = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (const user of users) {
            console.log(`Syncing stats for user: ${user.email}`);
            try {
                const stats = await fetchTodayStats();

                if (stats && typeof stats !== "string") {
                    console.log(`Successfully fetched stats for ${user.email}. Total time: ${stats.totalTime}`);
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
                    results.push({ email: user.email, userId: user.id, success: true, totalTime: stats.totalTime });
                } else {
                    console.warn(`Failed to fetch stats for ${user.email}: ${stats || "No stats found"}`);
                    results.push({ email: user.email, userId: user.id, success: false, error: stats || "No stats found" });
                }
            } catch (userError: any) {
                console.error(`Error syncing user ${user.email}:`, userError);
                results.push({ email: user.email, userId: user.id, success: false, error: userError.message });
            }
        }

        console.log("WakaTime sync cron job finished.");
        return NextResponse.json({ success: true, results });
    } catch (error: any) {
        console.error("Fatal error in WakaTime sync cron:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
