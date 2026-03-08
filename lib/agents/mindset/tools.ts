// import { DynamicStructuredTool } from "@langchain/core/tools";
// import { z } from "zod";
// import { prisma } from "@/lib/prisma";

// export const saveMindsetPlanTool=(userId:string)=>
// new DynamicStructuredTool({
// name:"save_mindset_plan",
// description:"Save personal growth plan",
// schema:z.object({
// goal:z.string(),
// habits:z.array(z.string()),
// exercises:z.array(z.string()),
// affirmations:z.array(z.string())
// }),
// func:async({goal,habits,exercises,affirmations})=>{

// const plan=await prisma.mindsetPlan.create({
// data:{
// userId,
// goal,
// habits,
// exercises,
// affirmations
// }
// })

// return JSON.stringify({success:true,planId:plan.id})

// }
// })

// lib/agents/mindset/tools.ts

import { DynamicStructuredTool } from "@langchain/core/tools";
import { z }                     from "zod";
import { prisma }                from "@/lib/prisma";

export const saveMindsetPlanTool = (userId: string) =>
  new DynamicStructuredTool({
    name       : "save_mindset_plan",
    description: "Save a complete mindset and personal growth plan to the database.",
    schema     : z.object({
      goal              : z.string().describe("The user's mindset/growth goal"),
      limitingBeliefs   : z.array(z.string()).describe("Core limiting beliefs identified"),
      habits            : z.array(z.string()).describe("21-day habit stack — tiny, stackable habits"),
      exercises         : z.array(z.string()).describe("Mental exercises with step-by-step instructions"),
      affirmations      : z.array(z.string()).describe("Personalised first-person present-tense affirmations"),
      journalingPrompts : z.array(z.string()).describe("Daily journaling prompts for self-reflection"),
      emergencyProtocol : z.string().describe("What to do when feeling overwhelmed — step-by-step"),
      cbtTechnique      : z.string().describe("One specific CBT reframing technique with instructions"),
    }),

    func: async ({ goal, limitingBeliefs, habits, exercises, affirmations, journalingPrompts, emergencyProtocol, cbtTechnique }) => {
      try {
        const plan = await prisma.mindsetPlan.create({
          data: {
            userId,
            goal,
            limitingBeliefs,
            habits,
            exercises,
            affirmations,
            journalingPrompts,
            emergencyProtocol,
            cbtTechnique,
          },
        });

        console.log("[Mindset Tool] ✅ Plan saved:", plan.id);
        return JSON.stringify({ success: true, planId: plan.id });

      } catch (error) {
        console.error("[Mindset Tool] Prisma error:", error);
        return JSON.stringify({ success: false, error: String(error) });
      }
    },
  });