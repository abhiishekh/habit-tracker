    import { NextRequest, NextResponse } from 'next/server';
    import { prisma } from '@/lib/prisma';
    import { getServerSession } from 'next-auth';
    import { authOptions } from '@/lib/auth';

    export async function GET(req: NextRequest) {
        try {
            const session = await getServerSession(authOptions);
            if (!session?.user?.id) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

            const plans = await prisma.workoutPlan.findMany({
                where: { userId: session.user.id },
                include: {
                    _count: {
                        select: { workouts: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            return NextResponse.json({ success: true, plans });
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
