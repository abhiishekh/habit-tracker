import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { startOfDay } from "date-fns";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { habitId } = await req.json();

        if (!habitId) {
            return NextResponse.json({ error: "Habit ID is required" }, { status: 400 });
        }

        const userId = session.user.id;
        const today = startOfDay(new Date());

        // Check if habit exists and belongs to user
        const habit = await prisma.habit.findUnique({
            where: { id: habitId, userId }
        });

        if (!habit) {
            return NextResponse.json({ error: "Habit not found" }, { status: 404 });
        }

        // Check if todo already exists for today
        const existingTodo = await prisma.todo.findFirst({
            where: {
                userId,
                habitId,
                createdAt: { gte: today }
            }
        });

        if (existingTodo) {
            return NextResponse.json({ message: "Todo already exists for today" });
        }

        // Create todo
        const todo = await prisma.todo.create({
            data: {
                userId,
                task: `Habit: ${habit.name}`,
                category: habit.category || "Ritual",
                habitId,
                createdAt: new Date()
            }
        });

        return NextResponse.json(todo);
    } catch (error) {
        console.error("Error syncing habit to todo:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
