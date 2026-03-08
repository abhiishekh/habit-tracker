import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const tasks = await prisma.blueprintTask.findMany({
            where: {
                userId: session.user.id,
                planId: id as any,
            },
            orderBy: [
                { weekNumber: "asc" },
                { dayNumber: "asc" },
            ],
        });

        return NextResponse.json({ success: true, tasks });
    } catch (error) {
        console.error("[Blueprint Tasks API] Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { taskId, isCompleted } = await req.json();

        const task = await prisma.blueprintTask.update({
            where: {
                id: taskId,
                userId: session.user.id,
            },
            data: {
                isCompleted,
                completedAt: isCompleted ? new Date() : null,
            },
        });

        return NextResponse.json({ success: true, task });
    } catch (error) {
        console.error("[Blueprint Tasks PATCH API] Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
