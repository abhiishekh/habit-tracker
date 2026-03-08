import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const saveProductivityPlanTool = (userId: string) =>
  new DynamicStructuredTool({
    name: "save_productivity_plan",
    description: "Save a complete productivity system with weekly tasks to the database.",
    schema: z.object({
      goal: z.string().describe("The user's productivity goal"),
      strategy: z.string().optional().describe("Overall productivity strategy"),
      weeks: z.array(z.object({
        weekNumber: z.number(),
        focus: z.string().describe("Theme of this week e.g. 'Deep Work Setup'"),
        tasks: z.array(z.object({
          dayNumber: z.number().optional().describe("Day 1-7 of the week"),
          title: z.string().describe("Specific productivity action"),
          description: z.string().describe("Detailed instructions"),
          type: z.enum(["routine", "focus", "review", "system"]).optional(),
        }))
      })).describe("4-week productivity build-up plan"),
    }),

    func: async ({ goal, strategy, weeks }) => {
      try {
        const plan = await prisma.productivityPlan.create({
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

        console.log("[Productivity Tool] ✅ Plan saved:", plan.id);
        return JSON.stringify({ success: true, planId: plan.id });
      } catch (error) {
        console.error("[Productivity Tool] Prisma error:", error);
        return JSON.stringify({ success: false, error: String(error) });
      }
    },
  });