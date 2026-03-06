// lib/agents/project/tools.ts

import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const analyzeProjectTool = new DynamicStructuredTool({
  name: "analyze_project",
  description: "Analyzes project description and returns scope, complexity, and tech recommendations.",
  schema: z.object({
    projectName: z.string(),
    coreFeatures: z.array(z.string()),
    complexity: z.enum(["simple", "medium", "complex"]),
    recommendedStack: z.object({
      frontend: z.string(),
      backend: z.string(),
      database: z.string(),
      deployment: z.string()
    }),
    estimatedDays: z.number(),
    mvpFeatures: z.array(z.string()).describe("Minimum features for first launch"),
    risks: z.array(z.string())
  }),
  func: async (args) => JSON.stringify(args)
});

export const saveProjectTimelineTool = (userId: string) => new DynamicStructuredTool({
  name: "save_project_timeline",
  description: "Saves a complete project timeline with phases and daily tasks.",
  schema: z.object({
    projectName: z.string(),
    description: z.string(),
    techStack: z.string(),
    totalDays: z.number(),
    mvpDescription: z.string(),
    phases: z.array(z.object({
      phaseNumber: z.number(),
      phaseName: z.string().describe("e.g., 'Setup & Auth', 'Core Features', 'Launch'"),
      startDay: z.number(),
      endDay: z.number(),
      tasks: z.array(z.object({
        dayNumber: z.number(),
        title: z.string(),
        description: z.string(),
        estimatedHours: z.number(),
        type: z.enum(["design", "frontend", "backend", "database", "testing", "deployment", "research"]),
        isCompleted: z.boolean().default(false)
      }))
    }))
  }),
  func: async ({ projectName, description, techStack, totalDays, mvpDescription, phases }) => {
    try {
      const project = await prisma.projectPlan.create({
        data: {
          userId,
          projectName,
          description,
          techStack,
          totalDays,
          mvpDescription,
          startDate: new Date(),
          endDate: new Date(Date.now() + totalDays * 24 * 60 * 60 * 1000),
          phases: {
            create: phases.map(p => ({
              phaseNumber: p.phaseNumber,
              phaseName: p.phaseName,
              startDay: p.startDay,
              endDay: p.endDay,
              tasks: {
                create: p.tasks.map(t => ({
                  dayNumber: t.dayNumber,
                  title: t.title,
                  description: t.description,
                  estimatedHours: t.estimatedHours,
                  type: t.type,
                  isCompleted: false
                }))
              }
            }))
          }
        }
      });
      return JSON.stringify({ success: true, projectId: project.id });
    } catch (error) {
      return JSON.stringify({ success: false, error: String(error) });
    }
  }
});