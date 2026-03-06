// lib/agents/income/tools.ts

import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const researchOpportunitiesTool = new DynamicStructuredTool({
  name: "research_opportunities",
  description: "Researches income opportunities based on user skills and profession.",
  schema: z.object({
    profession: z.string().describe("User's profession e.g., 'graphic designer'"),
    skills: z.array(z.string()).describe("User's skills"),
    targetIncome: z.number().describe("Target income in INR")
  }),
  func: async ({ profession, skills, targetIncome }) => {
    // This is where you'd call a web search API (Serper, Tavily, etc.)
    // For now, returns structured mock data the AI can use
    const opportunities = {
      freelancePlatforms: ["Upwork", "Fiverr", "Toptal", "Freelancer.in", "Kwork"],
      estimatedRateRange: `₹${Math.floor(targetIncome / 20)}-₹${Math.floor(targetIncome / 10)} per project`,
      quickWinStrategies: [
        `Post ${profession} portfolio on LinkedIn with #OpenToWork`,
        `Join ${profession} Facebook groups and offer free first project`,
        `Cold email 10 local businesses per day offering ${skills[0]} services`
      ],
      timeToFirstEarning: "3-7 days with aggressive outreach"
    };
    return JSON.stringify(opportunities);
  }
});

export const saveIncomePlanTool = (userId: string) => new DynamicStructuredTool({
  name: "save_income_plan",
  description: "Saves a 30-day income generation plan with weekly milestones.",
  schema: z.object({
    goal: z.string(),
    targetAmount: z.number().describe("Target amount in INR"),
    strategy: z.string().describe("Overall strategy summary"),
    weeks: z.array(z.object({
      weekNumber: z.number(),
      focus: z.string(),
      targetEarnings: z.number(),
      tasks: z.array(z.object({
        day: z.number().describe("Day 1-7 of the week"),
        action: z.string().describe("Specific action to take"),
        platform: z.string().optional(),
        timeRequired: z.number().describe("Hours needed"),
        expectedOutcome: z.string(),
        priority: z.number().min(1).max(5)
      }))
    }))
  }),
  func: async ({ goal, targetAmount, strategy, weeks }) => {
    try {
      const plan = await prisma.incomePlan.create({
        data: {
          userId,
          goal,
          targetAmount,
          strategy,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          weeks: {
            create: weeks.map(w => ({
              weekNumber: w.weekNumber,
              focus: w.focus,
              targetEarnings: w.targetEarnings,
              tasks: {
                create: w.tasks.map(t => ({
                  day: t.day,
                  action: t.action,
                  platform: t.platform || "",
                  timeRequired: t.timeRequired,
                  expectedOutcome: t.expectedOutcome,
                  priority: t.priority,
                  isCompleted: false
                }))
              }
            }))
          }
        }
      });
      return JSON.stringify({ success: true, planId: plan.id, strategy });
    } catch (error) {
      return JSON.stringify({ success: false, error: String(error) });
    }
  }
});