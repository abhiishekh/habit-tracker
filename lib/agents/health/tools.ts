// import { DynamicStructuredTool } from "@langchain/core/tools";
// import { z } from "zod";
// import { prisma } from "@/lib/prisma";

// export const saveHealthPlanTool = (userId:string)=>
// new DynamicStructuredTool({
//   name:"save_health_plan",
//   description:"Save a weekly health optimization plan",
//   schema:z.object({
//     goal:z.string(),
//     nutrition:z.array(z.string()),
//     sleepTips:z.array(z.string()),
//     stressManagement:z.array(z.string())
//   }),
//   func: async ({goal,nutrition,sleepTips,stressManagement})=>{

//     const plan = await prisma.healthPlan.create({
//       data:{
//         userId,
//         goal,
//         nutrition,
//         sleepTips,
//         stressManagement
//       }
//     })

//     return JSON.stringify({success:true,planId:plan.id})
//   }
// })

// lib/agents/health/tools.ts

import { DynamicStructuredTool } from "@langchain/core/tools";
import { z }                     from "zod";
import { prisma }                from "@/lib/prisma";

export const saveHealthPlanTool = (userId: string) =>
  new DynamicStructuredTool({
    name       : "save_health_plan",
    description: "Save a complete weekly health optimisation plan to the database.",
    schema     : z.object({
      goal             : z.string().describe("The user's health goal"),
      nutrition        : z.array(z.string()).describe("Meal plan items — breakfast, lunch, dinner, snacks"),
      sleepTips        : z.array(z.string()).describe("Specific sleep improvement habits"),
      stressManagement : z.array(z.string()).describe("Stress reduction techniques with instructions"),
      weeklySchedule   : z.array(z.string()).describe("Day-by-day routine e.g. 'Monday: 7am wake, 8am walk 30min...'"),
      supplements      : z.array(z.string()).optional().describe("Recommended supplements with dosage"),
      hydration        : z.string().optional().describe("Daily water intake target and tips"),
      weeklyGoals      : z.array(z.string()).describe("3-5 measurable goals for the week"),
    }),

    func: async ({ goal, nutrition, sleepTips, stressManagement, weeklySchedule, supplements, hydration, weeklyGoals }) => {
      try {
        const plan = await prisma.healthPlan.create({
          data: {
            userId,
            goal,
            nutrition,
            sleepTips,
            stressManagement,
            weeklySchedule,
            supplements : supplements ?? [],
            hydration   : hydration   ?? "",
            weeklyGoals,
          },
        });

        console.log("[Health Tool] ✅ Plan saved:", plan.id);
        return JSON.stringify({ success: true, planId: plan.id });

      } catch (error) {
        console.error("[Health Tool] Prisma error:", error);
        return JSON.stringify({ success: false, error: String(error) });
      }
    },
  });