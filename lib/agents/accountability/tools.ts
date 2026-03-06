// lib/agents/accountability/tools.ts

import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const checkTodaysTasksTool = (userId: string) => new DynamicStructuredTool({
  name: "check_todays_tasks",
  description: "Fetches all tasks due today across all plans for the user.",
  schema: z.object({ date: z.string().describe("Today's date YYYY-MM-DD") }),
  func: async ({ date }) => {
    try {
      const today = new Date(date);
      const dayOfWeek = today.toLocaleDateString("en-US", { weekday: "long" });

      // Fetch from all plan types in parallel
      const [workouts, incomeTasks, projectTasks] = await Promise.all([
        prisma.workout.findMany({
          where: { 
            workoutPlan: { userId },
            dayOfWeek 
          },
          include: { exercises: true }
        }),
        prisma.incomeTask.findMany({
          where: { week: { plan: { userId } } }
          // Add date filtering based on your schema
        }),
        prisma.projectTask.findMany({
          where: { phase: { plan: { userId } }, isCompleted: false }
          // Add date filtering based on dayNumber + startDate
        })
      ]);

      return JSON.stringify({
        gymTasks: workouts.length,
        incomeTasks: incomeTasks.length,
        projectTasks: projectTasks.length,
        details: { workouts, incomeTasks, projectTasks }
      });
    } catch (err) {
      return JSON.stringify({ error: String(err) });
    }
  }
});

export const saveUserReactionTool = new DynamicStructuredTool({
  name: "save_user_reaction",
  description: "Saves user feedback/reaction to understand behavior patterns.",
  schema: z.object({
    userId: z.string(),
    feedback: z.string(),
    sentiment: z.enum(["positive", "neutral", "negative", "overwhelmed", "motivated"]),
    planType: z.enum(["gym", "income", "project", "general"]),
    suggestedAdjustment: z.string().describe("What to change in the plan based on feedback")
  }),
  func: async (args) => {
    try {
      await prisma.userFeedback.create({ data: args });
      return JSON.stringify({ saved: true });
    } catch (err) {
      return JSON.stringify({ error: String(err) });
    }
  }
});

export const markTaskCompleteTool = new DynamicStructuredTool({
  name: "mark_task_complete",
  description: "Marks a specific task as completed.",
  schema: z.object({
    taskId: z.string(),
    taskType: z.enum(["workout", "incomeTask", "projectTask"])
  }),
  func: async ({ taskId, taskType }) => {
    try {
      const modelMap = {
        workout: prisma.workout,
        incomeTask: prisma.incomeTask,
        projectTask: prisma.projectTask
      };
      await (modelMap[taskType] as any).update({
        where: { id: taskId },
        data: { isCompleted: true, completedAt: new Date() }
      });
      return JSON.stringify({ success: true });
    } catch (err) {
      return JSON.stringify({ error: String(err) });
    }
  }
});

export const replanIfNeededTool = (userId: string) => new DynamicStructuredTool({
  name: "replan_if_needed",
  description: "Triggers a re-plan of a specific domain if user is consistently failing tasks.",
  schema: z.object({
    domain: z.enum(["gym", "income", "project"]),
    reason: z.string().describe("Why replanning is needed"),
    adjustments: z.array(z.string()).describe("Specific changes to make")
  }),
  func: async ({ domain, reason, adjustments }) => {
    // Log the replan request — actual replanning triggers the domain architect again
    await prisma.replanLog.create({
      data: { userId, domain, reason, adjustments: JSON.stringify(adjustments) }
    });
    return JSON.stringify({ replanQueued: true, domain, adjustments });
  }
});