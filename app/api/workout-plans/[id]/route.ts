import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPermanentGifUrl } from '@/lib/utils/getPermanentGifUrl';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
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
