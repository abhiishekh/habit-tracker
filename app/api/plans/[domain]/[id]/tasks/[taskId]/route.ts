import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const TASK_MODEL_MAP: Record<string, string> = {
    business: "businessTask",
    health: "healthTask",
    learning: "learningTask",
    mindset: "mindsetTask",
    productivity: "productivityTask",
    relationships: "relationshipTask",
    networking: "networkingTask",
    life: "lifeTask",
};

const PLAN_MODEL_MAP: Record<string, string> = {
    business: "businessPlan",
    health: "healthPlan",
    learning: "learningPlan",
    mindset: "mindsetPlan",
    productivity: "productivityPlan",
    relationships: "relationshipPlan",
    networking: "networkingPlan",
    life: "lifePlan",
};

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ domain: string; id: string; taskId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { domain, id: planId, taskId } = await params;
        const taskModel = TASK_MODEL_MAP[domain];
        const planModel = PLAN_MODEL_MAP[domain];

        if (!taskModel || !planModel) {
            return NextResponse.json({ error: "Invalid domain" }, { status: 400 });
        }

        // Verify ownership
        const plan = await (prisma as any)[planModel].findUnique({
            where: { id: planId, userId: session.user.id },
        });
        if (!plan) {
            return NextResponse.json({ error: "Plan not found" }, { status: 404 });
        }

        // Find task current state
        const task = await (prisma as any)[taskModel].findUnique({
            where: { id: taskId },
        });
        if (!task) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        // Toggle completion
        const updatedTask = await (prisma as any)[taskModel].update({
            where: { id: taskId },
            data: {
                isCompleted: !task.isCompleted,
                completedAt: !task.isCompleted ? new Date() : null,
            },
        });

        return NextResponse.json({ success: true, task: updatedTask });
    } catch (error: any) {
        console.error(`[Plans API] Error toggling task:`, error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
