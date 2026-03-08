// import { DynamicStructuredTool } from "@langchain/core/tools";
// import { z } from "zod";
// import { prisma } from "@/lib/prisma";

// export const createBusinessPlanTool = (userId: string) =>
//   new DynamicStructuredTool({
//     name: "save_business_plan",
//     description: "Save a startup or business execution plan.",
//     schema: z.object({
//       goal: z.string(),
//       idea: z.string(),
//       targetMarket: z.string(),
//       revenueModel: z.string(),
//       roadmap: z.array(z.string())
//     }),
//     func: async ({ goal, idea, targetMarket, revenueModel, roadmap }) => {
//       const plan = await prisma.businessPlan.create({
//         data: {
//           userId,
//           goal,
//           idea,
//           targetMarket,
//           revenueModel,
//           roadmap
//         }
//       });

//       return JSON.stringify({
//         success: true,
//         planId: plan.id
//       });
//     }
//   });

// lib/agents/business/tools.ts

import { DynamicStructuredTool } from "@langchain/core/tools";
import { z }                     from "zod";
import { prisma }                from "@/lib/prisma";

export const createBusinessPlanTool = (userId: string) =>
  new DynamicStructuredTool({
    name       : "save_business_plan",
    description: "Save a complete startup / business execution plan to the database.",
    schema     : z.object({
      goal         : z.string().describe("The user's business goal"),
      idea         : z.string().describe("Core business idea and value proposition"),
      targetMarket : z.string().describe("Ideal customer profile and market size"),
      revenueModel : z.string().describe("How the business makes money — pricing, channels"),
      validation   : z.array(z.string()).describe("Steps to validate the idea before building"),
      risks        : z.array(z.string()).describe("Top 3 risks and mitigation strategies"),
      roadmap      : z.array(z.string()).describe("High-level 30-day milestones"),
      milestones   : z.array(z.object({
        day    : z.number().describe("Day number e.g. 1, 7, 14, 30"),
        task   : z.string().describe("Specific actionable task"),
        outcome: z.string().describe("Expected result of completing this task"),
      })).describe("Day-by-day granular action plan"),
    }),

    func: async ({ goal, idea, targetMarket, revenueModel, validation, risks, roadmap, milestones }) => {
      try {
        const plan = await prisma.businessPlan.create({
          data: {
            userId,
            goal,
            idea,
            targetMarket,
            revenueModel,
            validation,
            risks,
            roadmap,
            // Store milestones as JSON string array so MongoDB is happy
            milestones: milestones.map(m => JSON.stringify(m)),
          },
        });

        console.log("[Business Tool] ✅ Plan saved:", plan.id);
        return JSON.stringify({ success: true, planId: plan.id });

      } catch (error) {
        console.error("[Business Tool] Prisma error:", error);
        return JSON.stringify({ success: false, error: String(error) });
      }
    },
  });