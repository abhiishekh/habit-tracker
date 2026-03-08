import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const createBusinessPlanTool = (userId: string) =>
  new DynamicStructuredTool({
    name: "save_business_plan",
    description: "Save a complete startup / business execution plan with weekly tasks to the database.",
    schema: z.object({
      goal: z.string().describe("The user's business goal"),
      idea: z.string().describe("Core business idea and value proposition"),
      targetMarket: z.string().describe("Ideal customer profile and market size"),
      revenueModel: z.string().describe("How the business makes money — pricing, channels"),
      weeks: z.array(z.object({
        weekNumber: z.number(),
        focus: z.string().describe("Theme of this week e.g. 'Market Validation'"),
        tasks: z.array(z.object({
          dayNumber: z.number().optional().describe("Day 1-7 of the week"),
          title: z.string().describe("Specific actionable task"),
          description: z.string().describe("Detailed instructions for the task"),
          type: z.enum(["validation", "marketing", "product", "operations"]).optional(),
        }))
      })).describe("4-week plan with daily tasks"),
    }),

    func: async ({ goal, idea, targetMarket, revenueModel, weeks }) => {
      try {
        const plan = await prisma.businessPlan.create({
          data: {
            userId,
            goal,
            idea,
            targetMarket,
            revenueModel,
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

        console.log("[Business Tool] ✅ Plan saved:", plan.id);
        return JSON.stringify({ success: true, planId: plan.id });
      } catch (error) {
        console.error("[Business Tool] Prisma error:", error);
        return JSON.stringify({ success: false, error: String(error) });
      }
    },
  });