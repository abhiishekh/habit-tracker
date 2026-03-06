import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const { isCompleted } = await req.json();

        const workout = await prisma.workout.update({
            where: { id },
            data: {
                isCompleted,
                completedAt: isCompleted ? new Date() : null
            }
        });

        return NextResponse.json({ success: true, workout });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
