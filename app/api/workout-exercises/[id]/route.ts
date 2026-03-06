import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const { completedSets } = await req.json();

        const exercise = await prisma.workoutExercise.update({
            where: { id },
            data: { completedSets: Number(completedSets) }
        });

        return NextResponse.json({ success: true, exercise });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
