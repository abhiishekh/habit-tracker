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

        const plans = await prisma.incomePlan.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                goal: true,
                targetAmount: true,
                isActive: true,
                createdAt: true,
                startDate: true,
                endDate: true,
                _count: { select: { weeks: true } },
            },
        });

        return NextResponse.json({ success: true, plans });
    } catch (error: any) {
        console.error("Error fetching income plans:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
