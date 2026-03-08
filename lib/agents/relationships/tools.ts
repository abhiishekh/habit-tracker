import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const saveRelationshipPlanTool = (userId: string) =>
  new DynamicStructuredTool({
    name: "save_relationship_plan",
    description: "Save a complete relationship improvement plan with weekly tasks to the database.",
    schema: z.object({
      goal: z.string().describe("The user's relationship goal"),
      strategy: z.string().optional().describe("Overall relationship improvement strategy"),
      weeks: z.array(z.object({
        weekNumber: z.number(),
        focus: z.string().describe("Theme of this week e.g. 'Active Listening'"),
        tasks: z.array(z.object({
          dayNumber: z.number().optional().describe("Day 1-7 of the week"),
          title: z.string().describe("Specific relationship action"),
          description: z.string().describe("Detailed instructions with example scripts"),
          type: z.enum(["communication", "activity", "habit", "conflict"]).optional(),
        }))
      })).describe("4-week relationship improvement plan"),
    }),

    func: async ({ goal, strategy, weeks }) => {
      try {
        const plan = await prisma.relationshipPlan.create({
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

        console.log("[Relationship Tool] ✅ Plan saved:", plan.id);
        return JSON.stringify({ success: true, planId: plan.id });
      } catch (error) {
        console.error("[Relationship Tool] Prisma error:", error);
        return JSON.stringify({ success: false, error: String(error) });
      }
    },
  });