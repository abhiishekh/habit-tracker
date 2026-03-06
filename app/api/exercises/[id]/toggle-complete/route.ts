import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { completed } = await req.json();

        const result = await prisma.workout.update({
            where: { id },
            data: {
                isCompleted: completed,
                completedAt: completed ? new Date() : null
            }
        });


        return NextResponse.json({ success: true, result });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
