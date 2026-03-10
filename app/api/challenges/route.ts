import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { addDays } from "date-fns";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { title, focus, description, durationDays, autoCreateTodos, force } = await req.json();

        if (!title || !focus || !durationDays) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const userId = session.user.id;
        const startDate = new Date();
        const endDate = addDays(startDate, parseInt(durationDays));

        // Conflict check: only one active challenge allowed unless force true
        if (!force) {
            const activeChallenge = await prisma.challenge.findFirst({
                where: { userId, status: "active" }
            });

            if (activeChallenge) {
                return NextResponse.json(
                    { error: "Conflict", message: "You already have an active challenge. Replace it?" },
                    { status: 409 }
                );
            }
        }

        // Deactivate previous active challenges if forcing
        if (force) {
            await prisma.challenge.updateMany({
                where: { userId, status: "active" },
                data: { status: "completed" } // or "failed" if preferred
            });
        }

        const challenge = await prisma.challenge.create({
            data: {
                title,
                focus,
                description,
                durationDays: parseInt(durationDays),
                autoCreateTodos: !!autoCreateTodos,
                startDate,
                endDate,
                userId,
                status: "active",
            },
        });

        return NextResponse.json(challenge);
    } catch (error) {
        console.error("Error creating challenge:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const challenges = await prisma.challenge.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(challenges);
    } catch (error) {
        console.error("Error fetching challenges:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
