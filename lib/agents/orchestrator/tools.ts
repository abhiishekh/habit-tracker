// lib/agents/orchestrator/tools.ts

import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const classifyGoalTool = new DynamicStructuredTool({
  name: "classify_goal",
  description: "Classifies the user's goal into a domain and returns what clarifying info is needed.",
  schema: z.object({
    domain: z.enum(["gym", "income", "career", "project", "unknown"]),
    confidence: z.number().min(0).max(1),
    reasoning: z.string(),
    clarifyingQuestions: z.array(z.string()).optional()
      .describe("Questions to ask user if more context is needed"),
    estimatedTimeframe: z.string().optional()
      .describe("e.g., '30 days', '3 months'")
  }),
  func: async (args) => {
    // Just pass through the classification — the AI fills this in
    return JSON.stringify(args);
  }
});

export const saveUserProfileTool = new DynamicStructuredTool({
  name: "save_user_profile",
  description: "Saves or updates the user's profile context for better personalization.",
  schema: z.object({
    id: z.string(),
    profession: z.string().optional(),
    skills: z.array(z.string()).optional(),
    monthlyIncome: z.number().optional(),
    fitnessLevel: z.string().optional(),
    primaryGoal: z.string().optional()
  }),
  func: async ({ id, ...profileData }) => {
    try {
      // Upsert into a UserProfile table
      const profile = await prisma.user.upsert({
        where: { id },
        update: profileData,
        create: { id, ...profileData }
      });
      return JSON.stringify({ success: true, profile });
    } catch (err) {
      return JSON.stringify({ success: false, error: String(err) });
    }
  }
});

export const getUserProfileTool = new DynamicStructuredTool({
  name: "get_user_profile",
  description: "Retrieves existing user profile to personalize the plan.",
  schema: z.object({ id: z.string() }),
  func: async ({ id }) => {
    try {
      // Basic validation for MongoDB ObjectId (24 hex characters)
      if (!/^[0-9a-fA-F]{24}$/.test(id)) {
        return JSON.stringify({ found: false, error: "Invalid ID format" });
      }
      const profile = await prisma.user.findUnique({ where: { id } });
      return JSON.stringify(profile || { found: false });
    } catch (err) {
      return JSON.stringify({ found: false, error: String(err) });
    }
  }
});