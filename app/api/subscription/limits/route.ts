import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSubscriptionLimits, getActiveHabitCount, getWeeklyBlueprintCount } from '@/lib/subscription';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const limits = await getSubscriptionLimits(session.user.id);
        const activeHabitCount = await getActiveHabitCount(session.user.id);
        const weeklyBlueprintCount = await getWeeklyBlueprintCount(session.user.id);

        return NextResponse.json({
            isPro: limits.isPro,
            habits: {
                current: activeHabitCount,
                max: limits.maxHabits,
                hasReachedLimit: !limits.isPro && activeHabitCount >= limits.maxHabits
            },
            blueprints: {
                current: weeklyBlueprintCount,
                max: limits.maxBlueprintsPerWeek,
                hasReachedLimit: !limits.isPro && weeklyBlueprintCount >= limits.maxBlueprintsPerWeek
            }
        });

    } catch (error: any) {
        console.error('Fetch limits error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
