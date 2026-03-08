import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const saveNetworkingPlanTool = (userId: string) =>
    new DynamicStructuredTool({
        name: "save_networking_plan",
        description: "Save a complete networking strategy and weekly tasks to the database.",
        schema: z.object({
            goal: z.string().describe("The user's networking goal"),
            targetAudience: z.array(z.string()).describe("List of people, companies, or industries to target"),
            outreachStrategy: z.string().describe("The primary method of outreach (e.g., LinkedIn, Email, Events)"),
            platforms: z.array(z.string()).describe("Platforms used for networking"),
            weeks: z.array(z.object({
                weekNumber: z.number(),
                tasks: z.array(z.object({
                    title: z.string(),
                    description: z.string().optional(),
                    expectedOutcome: z.string().optional(),
                    priority: z.number().default(1),
                    dayNumber: z.number().optional()
                }))
            })).describe("Weekly task distribution for the networking plan")
        }),

        func: async ({ goal, targetAudience, outreachStrategy, platforms, weeks }) => {
            try {
                const startDate = new Date();
                const endDate = new Date();
                endDate.setDate(startDate.getDate() + (weeks.length * 7));

                const plan = await prisma.networkingPlan.create({
                    data: {
                        userId,
                        goal,
                        targetAudience,
                        outreachStrategy,
                        platforms,
                        startDate,
                        endDate,
                        isActive: true
                    },
                });

                // Save tasks to the unified BlueprintTask model
                const taskData = weeks.flatMap(week =>
                    week.tasks.map(task => ({
                        userId,
                        planId: plan.id as any,
                        planType: "networking",
                        weekNumber: week.weekNumber,
                        dayNumber: task.dayNumber,
                        title: task.title,
                        description: task.description,
                        expectedOutcome: task.expectedOutcome,
                        priority: task.priority,
                        deadline: new Date(startDate.getTime() + ((week.weekNumber - 1) * 7 + (task.dayNumber || 1)) * 24 * 60 * 60 * 1000)
                    }))
                );

                await prisma.blueprintTask.createMany({
                    data: taskData
                });

                console.log("[Networking Tool] ✅ Plan and tasks saved:", plan.id);
                return JSON.stringify({ success: true, planId: plan.id });

            } catch (error) {
                console.error("[Networking Tool] Prisma error:", error);
                return JSON.stringify({ success: false, error: String(error) });
            }
        },
    });
