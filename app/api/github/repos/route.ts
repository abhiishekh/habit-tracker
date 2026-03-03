import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { fetchGithubRepos } from "@/lib/githubStats";

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
            return NextResponse.json({ repos: [] }); // No token set, return empty
        }

        // @ts-ignore
        const repos = await fetchGithubRepos(user.githubApiKey);
        return NextResponse.json({ repos });
    } catch (e: any) {
        console.error("Error fetching GitHub repos API:", e);
        return NextResponse.json(
            { error: e.message },
            { status: 500 }
        );
    }
}
