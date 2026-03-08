import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const saveMindsetPlanTool = (userId: string) =>
  new DynamicStructuredTool({
    name: "save_mindset_plan",
    description: "Save a complete mindset and personal growth plan with weekly tasks to the database.",
    schema: z.object({
      goal: z.string().describe("The user's mindset/growth goal"),
      strategy: z.string().optional().describe("Overall mindset strategy"),
      weeks: z.array(z.object({
        weekNumber: z.number(),
        focus: z.string().describe("Theme of this week e.g. 'Overcoming Limiting Beliefs'"),
        tasks: z.array(z.object({
          dayNumber: z.number().optional().describe("Day 1-7 of the week"),
          title: z.string().describe("Specific mindset task or exercise"),
          description: z.string().describe("Detailed step-by-step instructions"),
          type: z.enum(["habit", "exercise", "journaling", "affirmation"]).optional(),
        }))
      })).describe("4-week mindset transformation plan"),
    }),

    func: async ({ goal, strategy, weeks }) => {
      try {
        const plan = await prisma.mindsetPlan.create({
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
                    type: t.type || null,
                    isCompleted: false,
                  }))
                }
              }))
            }
          }
        });

        console.log("[Mindset Tool] ✅ Plan saved:", plan.id);
        return JSON.stringify({ success: true, planId: plan.id });
      } catch (error) {
        console.error("[Mindset Tool] Prisma error:", error);
        return JSON.stringify({ success: false, error: String(error) });
      }
    },
  });