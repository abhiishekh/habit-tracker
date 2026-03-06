import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // Fetch latest plan for each category (could be optimized or paginated, but fine for MVP)
        const [gym, income, project, career] = await Promise.all([
            prisma.workoutPlan.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }),
            prisma.incomePlan.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }),
            prisma.projectPlan.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }),
            prisma.careerPlan.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }),
        ]);

        const activeBlueprints = [];

        if (gym) activeBlueprints.push({ type: 'Gym', title: gym.goal, id: gym.id, link: '/workouts', icon: 'Dumbbell', color: 'text-cyan-500' });
        if (income) activeBlueprints.push({ type: 'Income', title: income.goal.substring(0, 50) + "...", id: income.id, link: `/blueprint/income/new?id=${income.id}`, icon: 'Wallet', color: 'text-emerald-500' });
        if (project) activeBlueprints.push({ type: 'Project', title: project.projectName, id: project.id, link: `/blueprint/project/new?id=${project.id}`, icon: 'Code', color: 'text-violet-500' });
        if (career) activeBlueprints.push({ type: 'Career', title: `${career.currentRole} -> ${career.targetRole}`, id: career.id, link: `/blueprint/career/new?id=${career.id}`, icon: 'BriefcaseBusiness', color: 'text-amber-500' });

        return NextResponse.json({ success: true, blueprints: activeBlueprints });
    } catch (error: any) {
        console.error("Dashboard Active Blueprints Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
