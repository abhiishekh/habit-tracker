import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { fetchGithubContributions, fetchRecentCommits, fetchGithubUserStats } from "@/lib/githubStats";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            // @ts-ignore
            select: { githubApiKey: true }
        });

        // @ts-ignore
        if (!user || !user.githubApiKey) {
            return NextResponse.json({ contributions: null, commits: [] });
        }

        // 1. Get GitHub username (login)
        // @ts-ignore
        const profile = await fetchGithubUserStats(user.githubApiKey);
        if (!profile?.login) {
            return NextResponse.json({ contributions: null, commits: [] });
        }

        const username = profile.login;

        // 2. Fetch advanced stats in parallel
        // @ts-ignore
        const [contributions, commits] = await Promise.all([
            // @ts-ignore
            fetchGithubContributions(user.githubApiKey, username),
            // @ts-ignore
            fetchRecentCommits(user.githubApiKey, username)
        ]);

        return NextResponse.json({ contributions, commits });
    } catch (e: any) {
        console.error("Error in GitHub advanced API:", e);
        return NextResponse.json(
            { error: e.message },
            { status: 500 }
        );
    }
}
