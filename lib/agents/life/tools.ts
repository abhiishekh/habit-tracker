import { prisma } from "@/lib/prisma";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

export const saveLifePlanTool = (userId: string) => new DynamicStructuredTool({
    name: "save_life_blueprint_plan",
    description: "Saves a holistic life transformation plan with weekly objectives.",
    schema: z.object({
        goal: z.string().describe("The primary life objective"),
        currentStatus: z.string().describe("User's current situation summary"),
        priority: z.string().describe("Top priority area"),
        timeframe: z.string().describe("Target timeframe or review cycle"),
        weeklyTasks: z.array(z.object({
            week: z.number().describe("Week number (1-4)"),
            day: z.number().optional().describe("Day number (1-7)"),
            title: z.string().describe("Task title"),
            description: z.string().describe("Task detail"),
            expectedOutcome: z.string().describe("What is achieved by this task"),
            priority: z.enum(["High", "Medium", "Low"]).default("Medium"),
            deadline: z.string().optional().describe("ISO date string for completion"),
        })).describe("List of strategic growth tasks across 4 weeks"),
    }),
    func: async (input) => {
        try {
            // 1. Save the Life Plan
            const lifePlan = await prisma.lifePlan.create({
                data: {
                    userId,
                    goal: input.goal,
                    currentStatus: input.currentStatus,
                    priority: input.priority,
                    timeframe: input.timeframe,
                },
            });

            // 2. Save the Blueprint Tasks
            const tasks = input.weeklyTasks.map(task => ({
                userId,
                planId: lifePlan.id,
                planType: "Life",
                weekNumber: task.week,
                dayNumber: task.day || null,
                title: task.title,
                description: task.description,
                expectedOutcome: task.expectedOutcome,
                priority: task.priority,
                deadline: task.deadline ? new Date(task.deadline) : null,
            }));

            await prisma.blueprintTask.createMany({
                data: tasks,
            });

            return JSON.stringify({
                success: true,
                message: "Life Transformation Blueprint architected and saved successfully.",
                planId: lifePlan.id
            });
        } catch (error) {
            console.error("Error saving Life plan:", error);
            return JSON.stringify({ success: false, message: "Internal Database Error" });
        }
    },
});
