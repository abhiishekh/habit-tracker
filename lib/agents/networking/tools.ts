import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const saveNetworkingPlanTool = (userId: string) =>
    new DynamicStructuredTool({
        name: "save_networking_plan",
        description: "Save a complete networking strategy with weekly tasks to the database.",
        schema: z.object({
            goal: z.string().describe("The user's networking goal"),
            strategy: z.string().optional().describe("Overall networking strategy summary"),
            weeks: z.array(z.object({
                weekNumber: z.number(),
                focus: z.string().describe("Theme of this week e.g. 'LinkedIn Outreach'"),
                tasks: z.array(z.object({
                    dayNumber: z.number().optional().describe("Day 1-7 of the week"),
                    title: z.string().describe("Specific networking action"),
                    description: z.string().describe("Detailed instructions"),
                    platform: z.enum(["LinkedIn", "Twitter", "Email", "Events", "Other"]).optional(),
                }))
            })).describe("4-week networking plan with daily tasks"),
        }),

        func: async ({ goal, strategy, weeks }) => {
            try {
                const plan = await prisma.networkingPlan.create({
                    data: {
                        userId,
                        goal,
                        strategy: strategy || null,
                        weeks: {
                            create: weeks.map(w => ({
                                weekNumber: w.weekNumber,
                                focus: w.focus,
                                tasks: {
                                    create: w.tasks.map(t => ({
                                        dayNumber: t.dayNumber,
                                        title: t.title,
                                        description: t.description,
                                        platform: t.platform || null,
                                        isCompleted: false,
                                    }))
                                }
                            }))
                        }
                    }
                });

                console.log("[Networking Tool] ✅ Plan saved:", plan.id);
                return JSON.stringify({ success: true, planId: plan.id });
            } catch (error) {
                console.error("[Networking Tool] Prisma error:", error);
                return JSON.stringify({ success: false, error: String(error) });
            }
        },
    });
