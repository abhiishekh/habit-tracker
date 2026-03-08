// import { DynamicStructuredTool } from "@langchain/core/tools";
// import { z } from "zod";
// import { prisma } from "@/lib/prisma";

// export const saveProductivityPlanTool=(userId:string)=>
// new DynamicStructuredTool({
// name:"save_productivity_plan",
// description:"Save productivity system",
// schema:z.object({
// goal:z.string(),
// dailySchedule:z.array(z.string()),
// focusMethods:z.array(z.string()),
// taskSystem:z.array(z.string())
// }),
// func:async({goal,dailySchedule,focusMethods,taskSystem})=>{

// const plan=await prisma.productivityPlan.create({
// data:{
// userId,
// goal,
// dailySchedule,
// focusMethods,
// taskSystem
// }
// })

// return JSON.stringify({success:true,planId:plan.id})

// }
// })

// lib/agents/productivity/tools.ts

import { DynamicStructuredTool } from "@langchain/core/tools";
import { z }                     from "zod";
import { prisma }                from "@/lib/prisma";

export const saveProductivityPlanTool = (userId: string) =>
  new DynamicStructuredTool({
    name       : "save_productivity_plan",
    description: "Save a complete productivity system to the database.",
    schema     : z.object({
      goal           : z.string().describe("The user's productivity goal"),
      dailySchedule  : z.array(z.string()).describe("Time-blocked daily schedule with exact times"),
      focusMethods   : z.array(z.string()).describe("Focus techniques with step-by-step instructions"),
      taskSystem     : z.array(z.string()).describe("Morning task prioritisation workflow steps"),
      morningRoutine : z.array(z.string()).describe("Morning routine with times and durations"),
      eveningRoutine : z.array(z.string()).describe("Evening wind-down routine with times"),
      weeklyReview   : z.string().describe("Step-by-step weekly review ritual"),
      productivityKillers : z.array(z.string()).describe("Top distractions and how to eliminate them"),
      tools          : z.array(z.string()).describe("Recommended apps/tools with specific use case"),
    }),

    func: async ({ goal, dailySchedule, focusMethods, taskSystem, morningRoutine, eveningRoutine, weeklyReview, productivityKillers, tools }) => {
      try {
        const plan = await prisma.productivityPlan.create({
          data: {
            userId,
            goal,
            dailySchedule,
            focusMethods,
            taskSystem,
            morningRoutine,
            eveningRoutine,
            weeklyReview,
            productivityKillers,
            tools,
          },
        });

        console.log("[Productivity Tool] ✅ Plan saved:", plan.id);
        return JSON.stringify({ success: true, planId: plan.id });

      } catch (error) {
        console.error("[Productivity Tool] Prisma error:", error);
        return JSON.stringify({ success: false, error: String(error) });
      }
    },
  });