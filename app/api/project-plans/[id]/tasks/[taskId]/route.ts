import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; taskId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: planId, taskId } = await params;

        // Verify the plan belongs to the user
        const plan = await prisma.projectPlan.findUnique({
            where: { id: planId, userId: session.user.id },
        });
        if (!plan) {
            return NextResponse.json({ error: "Plan not found" }, { status: 404 });
        }

        const task = await prisma.projectTask.findUnique({ where: { id: taskId } });
        if (!task) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        const updatedTask = await prisma.projectTask.update({
            where: { id: taskId },
            data: {
                isCompleted: !task.isCompleted,
                completedAt: !task.isCompleted ? new Date() : null,
            },
        });

        return NextResponse.json({ success: true, task: updatedTask });
    } catch (error: any) {
        console.error("Error toggling project task:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
