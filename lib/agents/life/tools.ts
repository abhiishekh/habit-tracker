import { prisma } from "@/lib/prisma";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

export const saveLifePlanTool = (userId: string) => new DynamicStructuredTool({
    name: "save_life_blueprint_plan",
    description: "Saves a holistic life transformation plan with weekly tasks to the database.",
    schema: z.object({
        goal: z.string().describe("The primary life objective"),
        strategy: z.string().optional().describe("Overall life strategy summary"),
        weeks: z.array(z.object({
            weekNumber: z.number().describe("Week number (1-4)"),
            focus: z.string().describe("Theme of this week e.g. 'Foundation Setting'"),
            tasks: z.array(z.object({
                dayNumber: z.number().optional().describe("Day 1-7 of the week"),
                title: z.string().describe("Task title"),
                description: z.string().describe("Task detail"),
                domain: z.string().optional().describe("Life domain e.g. career, fitness, finance"),
            }))
        })).describe("4-week life transformation plan"),
    }),
    func: async ({ goal, strategy, weeks }) => {
        try {
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + (weeks.length * 7));

            const plan = await prisma.lifePlan.create({
                data: {
                    userId,
                    goal,
                    strategy: strategy || null,
                    endDate,
                    weeks: {
                        create: weeks.map(w => ({
                            weekNumber: w.weekNumber,
                            focus: w.focus,
                            tasks: {
                                create: w.tasks.map(t => ({
                                    dayNumber: t.dayNumber,
                                    title: t.title,
                                    description: t.description,
                                    domain: t.domain || null,
                                    isCompleted: false,
                                }))
                            }
                        }))
                    }
                },
            });

            console.log("[Life Tool] ✅ Plan saved:", plan.id);
            return JSON.stringify({
                success: true,
                message: "Life Transformation Blueprint architected and saved successfully.",
                planId: plan.id
            });
        } catch (error) {
            console.error("[Life Tool] Prisma error:", error);
            return JSON.stringify({ success: false, error: String(error) });
        }
    },
});
