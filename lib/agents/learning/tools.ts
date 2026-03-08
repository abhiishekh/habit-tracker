import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const saveLearningRoadmapTool = (userId: string) =>
  new DynamicStructuredTool({
    name: "save_learning_plan",
    description: "Save a complete structured learning roadmap with weekly tasks to the database.",
    schema: z.object({
      goal: z.string().describe("The user's learning goal"),
      strategy: z.string().optional().describe("Overall learning strategy"),
      capstoneProject: z.string().optional().describe("Final project that combines everything learned"),
      weeks: z.array(z.object({
        weekNumber: z.number(),
        focus: z.string().describe("Theme of this week e.g. 'Fundamentals of React'"),
        tasks: z.array(z.object({
          dayNumber: z.number().optional().describe("Day 1-7 of the week"),
          title: z.string().describe("Specific learning task"),
          description: z.string().describe("Detailed instructions"),
          resource: z.string().optional().describe("Course, tutorial, or book reference"),
        }))
      })).describe("Multi-week learning plan with daily tasks"),
    }),

    func: async ({ goal, strategy, capstoneProject, weeks }) => {
      try {
        const plan = await prisma.learningPlan.create({
          data: {
            userId,
            goal,
            strategy: strategy || null,
            capstoneProject: capstoneProject || null,
            weeks: {
              create: weeks.map(w => ({
                weekNumber: w.weekNumber,
                focus: w.focus,
                tasks: {
                  create: w.tasks.map(t => ({
                    dayNumber: t.dayNumber,
                    title: t.title,
                    description: t.description,
                    resource: t.resource || null,
                    isCompleted: false,
                  }))
                }
              }))
            }
          }
        });

        console.log("[Learning Tool] ✅ Plan saved:", plan.id);
        return JSON.stringify({ success: true, planId: plan.id });
      } catch (error) {
        console.error("[Learning Tool] Prisma error:", error);
        return JSON.stringify({ success: false, error: String(error) });
      }
    },
  });