import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const saveHealthPlanTool = (userId: string) =>
  new DynamicStructuredTool({
    name: "save_health_plan",
    description: "Save a complete weekly health optimisation plan with actionable tasks to the database.",
    schema: z.object({
      goal: z.string().describe("The user's health goal"),
      strategy: z.string().optional().describe("Overall health strategy summary"),
      weeks: z.array(z.object({
        weekNumber: z.number(),
        focus: z.string().describe("Theme of this week e.g. 'Sleep Optimisation'"),
        tasks: z.array(z.object({
          dayNumber: z.number().optional().describe("Day 1-7 of the week"),
          title: z.string().describe("Specific health action"),
          description: z.string().describe("Detailed instructions"),
          category: z.enum(["nutrition", "sleep", "exercise", "stress", "hydration"]).optional(),
        }))
      })).describe("4-week health plan with daily tasks"),
    }),

    func: async ({ goal, strategy, weeks }) => {
      try {
        const plan = await prisma.healthPlan.create({
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
                    category: t.category || null,
                    isCompleted: false,
                  }))
                }
              }))
            }
          }
        });

        console.log("[Health Tool] ✅ Plan saved:", plan.id);
        return JSON.stringify({ success: true, planId: plan.id });
      } catch (error) {
        console.error("[Health Tool] Prisma error:", error);
        return JSON.stringify({ success: false, error: String(error) });
      }
    },
  });