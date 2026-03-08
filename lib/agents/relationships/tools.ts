// import { DynamicStructuredTool } from "@langchain/core/tools";
// import { z } from "zod";
// import { prisma } from "@/lib/prisma";

// export const saveRelationshipPlanTool=(userId:string)=>
// new DynamicStructuredTool({
// name:"save_relationship_plan",
// description:"Save relationship improvement plan",
// schema:z.object({
// goal:z.string(),
// communicationTips:z.array(z.string()),
// habits:z.array(z.string()),
// activities:z.array(z.string())
// }),
// func:async({goal,communicationTips,habits,activities})=>{

// const plan=await prisma.relationshipPlan.create({
// data:{
// userId,
// goal,
// communicationTips,
// habits,
// activities
// }
// })

// return JSON.stringify({success:true,planId:plan.id})

// }
// })

// lib/agents/relationship/tools.ts

import { DynamicStructuredTool } from "@langchain/core/tools";
import { z }                     from "zod";
import { prisma }                from "@/lib/prisma";

export const saveRelationshipPlanTool = (userId: string) =>
  new DynamicStructuredTool({
    name       : "save_relationship_plan",
    description: "Save a complete relationship improvement plan to the database.",
    schema     : z.object({
      goal                : z.string().describe("The user's relationship goal"),
      communicationTips   : z.array(z.string()).describe("Tips with real example scripts"),
      habits              : z.array(z.string()).describe("Daily micro-habits for relationship growth"),
      activities          : z.array(z.string()).describe("Specific social growth activities"),
      conflictResolution  : z.array(z.string()).describe("Step-by-step conflict resolution techniques"),
      empathyExercises    : z.array(z.string()).describe("Empathy building exercises with instructions"),
      conversationStarters: z.array(z.string()).describe("Genuine conversation starters for different contexts"),
      thirtyDayPlan       : z.array(z.string()).describe("Week-by-week 30-day relationship improvement roadmap"),
    }),

    func: async ({ goal, communicationTips, habits, activities, conflictResolution, empathyExercises, conversationStarters, thirtyDayPlan }) => {
      try {
        const plan = await prisma.relationshipPlan.create({
          data: {
            userId,
            goal,
            communicationTips,
            habits,
            activities,
            conflictResolution,
            empathyExercises,
            conversationStarters,
            thirtyDayPlan,
          },
        });

        console.log("[Relationship Tool] ✅ Plan saved:", plan.id);
        return JSON.stringify({ success: true, planId: plan.id });

      } catch (error) {
        console.error("[Relationship Tool] Prisma error:", error);
        return JSON.stringify({ success: false, error: String(error) });
      }
    },
  });