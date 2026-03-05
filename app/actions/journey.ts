'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { startOfDay, format } from 'date-fns';

export async function getJourneyData() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            habits: {
                include: {
                    logs: {
                        orderBy: { date: 'desc' },
                        take: 50
                    }
                }
            },
            todos: {
                where: { completed: true },
                orderBy: { updatedAt: 'desc' },
                take: 30
            },
            tasks: {
                where: { status: 'completed' },
                orderBy: { updatedAt: 'desc' },
                take: 20
            }
        }
    });

    if (!user) throw new Error("User not found");

    const events: any[] = [];

    // Add Habit completions
    user.habits.forEach(habit => {
        habit.logs.forEach(log => {
            events.push({
                id: log.id,
                date: log.date,
                type: 'Habit',
                title: habit.name,
                description: 'Completed habit',
                icon: 'Flame'
            });
        });
    });

    // Add Todo completions
    user.todos.forEach(todo => {
        if (todo.completedAt) {
            events.push({
                id: todo.id,
                date: todo.completedAt,
                type: 'Todo',
                title: todo.task,
                description: `Completed todo in category: ${todo.category || 'General'}`,
                icon: 'CheckCircle'
            });
        }
    });

    // Add Task completions
    user.tasks.forEach(task => {
        events.push({
            id: task.id,
            date: task.updatedAt,
            type: 'Task',
            title: task.title,
            description: `Finished task: ${task.description || ''}`,
            icon: 'Target'
        });
    });

    const allEvents = events.sort((a, b) => b.date.getTime() - a.date.getTime());
    console.log(`[Journey] Fetched ${allEvents.length} events for user ${session.user.email}`);
    return allEvents;
}
