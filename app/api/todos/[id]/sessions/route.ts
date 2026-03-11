import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const {id} = await params;
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const todo = await prisma.todo.findUnique({
            where: { id: id },
            include: {
                sessions: {
                    orderBy: { order: "asc" }
                }
            }
        });

        if (!todo) {
            return NextResponse.json({ error: "Todo not found" }, { status: 404 });
        }

        return NextResponse.json(todo);
    } catch (error) {
        console.error("Error fetching sessions:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { sessionId, action } = await req.json();

        if (!sessionId || !action) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const todoSession = await prisma.todoSession.findUnique({
            where: { id: sessionId }
        });

        if (!todoSession || todoSession.todoId !== id) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        let updateData: any = {};
        const now = new Date();

        switch (action) {
            case "START":
                updateData = {
                    status: "RUNNING",
                    startedAt: todoSession.startedAt || now,
                };
                break;
            case "PAUSE":
                updateData = {
                    status: "PAUSED",
                };
                break;
            case "RESUME":
                updateData = {
                    status: "RUNNING",
                };
                break;
            case "COMPLETE":
                const startedAt = todoSession.startedAt || now;
                const durationMinutes = Math.round((now.getTime() - startedAt.getTime()) / 60000);
                updateData = {
                    status: "COMPLETED",
                    endedAt: now,
                    duration: durationMinutes,
                };
                break;
            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        const updatedSession = await prisma.todoSession.update({
            where: { id: sessionId },
            data: updateData
        });

        // Check if all sessions for this todo are completed
        if (action === "COMPLETE") {
            const allSessions = await prisma.todoSession.findMany({
                where: { todoId: id }
            });

            const allCompleted = allSessions.every(s => s.status === "COMPLETED");

            if (allCompleted) {
                await prisma.todo.update({
                    where: { id: id },
                    data: {
                        completed: true,
                        completedAt: now
                    }
                });
            }
        }

        return NextResponse.json(updatedSession);
    } catch (error) {
        console.error("Error updating session:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
