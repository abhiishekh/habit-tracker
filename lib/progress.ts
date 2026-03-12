import { prisma } from "@/lib/prisma";
import { startOfDay, subDays, addDays, isBefore } from "date-fns";

/**
 * Processes missed daily progress updates for a user.
 */
export async function processUserDailyProgress(userId: string) {
    const user = (await prisma.user.findUnique({
        where: { id: userId },
        include: { 
            progressTrees: { orderBy: { createdAt: 'desc' }, take: 1 }
        }
    })) as any;

    if (!user) return;

    const today = startOfDay(new Date());
    // Use the last day we actually EVALUATED. If never, start from the day before creation.
    let lastEvaluatedDay = user.lastProgressUpdate ? startOfDay(user.lastProgressUpdate) : startOfDay(subDays(user.createdAt || new Date(), 1));

    let tempStreak = user.totalStreakDays || 0;
    let tempShields = user.streakShields || 0;
    let tempContinuity = user.streakShieldContinuity || 0;
    let tempGrowth = user.progressTrees?.[0]?.growthLevel || 0;
    let tempStatus = user.progressTrees?.[0]?.status || "healthy";
    
    // We process every day from (lastEvaluatedDay + 1) up to (today - 1)
    let dayToProcess = addDays(lastEvaluatedDay, 1);
    let updated = false;

    while (isBefore(dayToProcess, today)) {
        updated = true;
        const tomorrowOfProcess = addDays(dayToProcess, 1);
        
        // Fetch todos for this specific day
        const dayTodos = await prisma.todo.findMany({
            where: {
                userId,
                OR: [
                    { reminderTime: { gte: dayToProcess, lt: tomorrowOfProcess } },
                    { 
                        AND: [
                            { reminderTime: null },
                            { createdAt: { gte: dayToProcess, lt: tomorrowOfProcess } }
                        ]
                    }
                ]
            }
        });

        const total = dayTodos.length;
        const completed = dayTodos.filter((t: any) => t.completed).length; 
        const completionRate = total > 0 ? (completed / total) * 100 : 0;

        if (total > 0) {
            if (completionRate >= 50) {
                // Success
                tempStreak += 1;
                tempContinuity += 1;
                tempGrowth = Math.min(100, tempGrowth + 5);
                tempStatus = "healthy";

                if (tempContinuity >= 3) {
                    tempShields += 1;
                    tempContinuity = 0;
                }
            } else {
                // Failure: Check for shield
                if (tempShields > 0) {
                    tempShields -= 1;
                    tempContinuity = 0; 
                    tempStatus = "healthy"; 
                } else {
                    tempStreak = 0;
                    tempContinuity = 0;
                    tempGrowth = Math.max(0, tempGrowth - 10);
                    tempStatus = "dry";
                }
            }
        } else {
            // No todos: Streak preserved, continuity broken
            tempContinuity = 0;
        }

        lastEvaluatedDay = dayToProcess;
        dayToProcess = addDays(dayToProcess, 1);
    }

    if (updated) {
        // Role Evaluation
        let newRoleTitle = user.roleTitle;
        let newRoleLevel = user.roleLevel;
        
        if (tempStreak >= 20) { newRoleTitle = "Legend"; newRoleLevel = 5; }
        else if (tempStreak >= 15) { newRoleTitle = "Grandmaster"; newRoleLevel = 4; }
        else if (tempStreak >= 10) { newRoleTitle = "Master"; newRoleLevel = 3; }
        else if (tempStreak >= 7) { newRoleTitle = "Warrior"; newRoleLevel = 2; }
        else if (tempStreak >= 5) { newRoleTitle = "Apprentice"; newRoleLevel = 1; }
        else { newRoleTitle = "Beginner"; newRoleLevel = 0; }

        const existingTree = user.progressTrees?.[0];
        
        await prisma.user.update({
            where: { id: userId },
            data: {
                totalStreakDays: tempStreak,
                streakShields: tempShields,
                streakShieldContinuity: tempContinuity,
                roleTitle: newRoleTitle,
                roleLevel: newRoleLevel,
                lastProgressUpdate: lastEvaluatedDay,
                progressTrees: existingTree ? {
                    update: {
                        where: { id: existingTree.id },
                        data: {
                            growthLevel: tempGrowth,
                            status: tempStatus
                        }
                    }
                } : {
                    create: {
                        growthLevel: tempGrowth,
                        status: tempStatus,
                        type: "overall",
                        trees: []
                    }
                }
            }
        });
    }

    return {
        shields: tempShields,
        streak: tempStreak,
        growth: tempGrowth
    };
}
