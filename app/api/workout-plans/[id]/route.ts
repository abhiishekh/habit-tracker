import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPermanentGifUrl } from '@/lib/utils/getPermanentGifUrl';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const plan = await prisma.workoutPlan.findUnique({
            where: { id },
            include: {
                workouts: {
                    include: {
                        exercises: true
                    },
                    orderBy: {
                        // We can order by day but they are strings, 
                        // for now we'll just return them as is or sort by ID
                    }
                }
            }
        });

        if (!plan) {
            return NextResponse.json({ error: "Plan not found" }, { status: 404 });
        }

        const workoutsWithGif = plan.workouts.map((workout) => ({
            ...workout,
            exercises: workout.exercises.map((exercise) => ({
                ...exercise,
                gifUrl: getPermanentGifUrl(exercise.exerciseId),
            })),
        }));

        return NextResponse.json({
            success: true,
            ...plan,
            workouts: workoutsWithGif,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const {id} = await params;
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const planId = id;

        const plan = await prisma.workoutPlan.findUnique({
            where: { id: planId }
        });

        if (!plan) {
            return NextResponse.json({ error: "Plan not found" }, { status: 404 });
        }

        if (plan.userId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.workoutPlan.delete({
            where: { id: planId }
        });

        return NextResponse.json({
            success: true,
            message: "Workout plan deleted successfully"
        });

    } catch (error: any) {
        console.error("DELETE ERROR:", error);
        return NextResponse.json(
            { error: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}