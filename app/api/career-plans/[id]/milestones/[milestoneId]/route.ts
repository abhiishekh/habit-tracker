import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; milestoneId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: planId, milestoneId } = await params;

        // Verify the plan belongs to the user
        const plan = await prisma.careerPlan.findUnique({
            where: { id: planId, userId: session.user.id },
        });
        if (!plan) {
            return NextResponse.json({ error: "Plan not found" }, { status: 404 });
        }

        const milestone = await prisma.careerMilestone.findUnique({ where: { id: milestoneId } });
        if (!milestone) {
            return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
        }

        const updatedMilestone = await prisma.careerMilestone.update({
            where: { id: milestoneId },
            data: {
                isCompleted: !milestone.isCompleted,
                completedAt: !milestone.isCompleted ? new Date() : null,
            },
        });

        return NextResponse.json({ success: true, milestone: updatedMilestone });
    } catch (error: any) {
        console.error("Error toggling career milestone:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
