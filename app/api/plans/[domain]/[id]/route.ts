import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const DOMAIN_MAP: Record<string, string> = {
    business: "businessPlan",
    health: "healthPlan",
    learning: "learningPlan",
    mindset: "mindsetPlan",
    productivity: "productivityPlan",
    relationships: "relationshipPlan",
    networking: "networkingPlan",
    life: "lifePlan",
};

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ domain: string; id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { domain, id } = await params;
        const modelName = DOMAIN_MAP[domain];

        if (!modelName) {
            return NextResponse.json({ error: "Invalid domain" }, { status: 400 });
        }

        const plan = await (prisma as any)[modelName].findUnique({
            where: {
                id: id,
                userId: session.user.id,
            },
            include: {
                weeks: {
                    include: {
                        tasks: {
                            orderBy: { dayNumber: "asc" },
                        },
                    },
                    orderBy: { weekNumber: "asc" },
                },
            },
        });

        if (!plan) {
            return NextResponse.json({ error: "Plan not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, plan });
    } catch (error: any) {
        console.error(`[Plans API] Error fetching plan:`, error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
