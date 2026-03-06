import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const plan = await prisma.incomePlan.findUnique({
            where: {
                id: id,
                userId: session.user.id
            },
            include: {
                weeks: {
                    include: {
                        tasks: {
                            orderBy: {
                                day: 'asc'
                            }
                        }
                    },
                    orderBy: {
                        weekNumber: 'asc'
                    }
                }
            }
        });

        if (!plan) {
            return NextResponse.json({ error: "Plan not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, plan });
    } catch (error: any) {
        console.error("Error fetching income plan:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
