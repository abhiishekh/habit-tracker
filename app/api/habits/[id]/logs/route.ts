import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { startOfDay } from "date-fns";

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const habitId = params.id;
        const userId = session.user.id;
        const today = startOfDay(new Date());

        // Check if habit belongs to user
        const habit = await prisma.habit.findUnique({
            where: { id: habitId, userId }
        });

        if (!habit) {
            return NextResponse.json({ error: "Habit not found" }, { status: 404 });
        }

        // Check if already logged today
        const existingLog = await prisma.habitLog.findFirst({
            where: {
                habitId,
                date: { gte: today }
            }
        });

        if (existingLog) {
            return NextResponse.json({ message: "Already logged for today" });
        }

        const log = await prisma.habitLog.create({
            data: {
                habitId,
                date: new Date(),
                completed: true
            }
        });

        return NextResponse.json(log);
    } catch (error) {
        console.error("Error logging habit:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
