// import { DynamicStructuredTool } from "@langchain/core/tools";
// import { z } from "zod";
// import { prisma } from "@/lib/prisma";

// export const saveLearningRoadmapTool=(userId:string)=>
// new DynamicStructuredTool({
// name:"save_learning_plan",
// description:"Save learning roadmap",
// schema:z.object({
// goal:z.string(),
// skills:z.array(z.string()),
// resources:z.array(z.string()),
// weeklyPlan:z.array(z.string())
// }),
// func:async({goal,skills,resources,weeklyPlan})=>{

// const plan=await prisma.learningPlan.create({
// data:{
// userId,
// goal,
// skills,
// resources,
// weeklyPlan
// }
// })

// return JSON.stringify({success:true,planId:plan.id})

// }
// })

// lib/agents/learning/tools.ts

import { DynamicStructuredTool } from "@langchain/core/tools";
import { z }                     from "zod";
import { prisma }                from "@/lib/prisma";

export const saveLearningRoadmapTool = (userId: string) =>
  new DynamicStructuredTool({
    name       : "save_learning_plan",
    description: "Save a complete structured learning roadmap to the database.",
    schema     : z.object({
      goal                : z.string().describe("The user's learning goal"),
      skills              : z.array(z.string()).describe("Ordered list of skills to learn"),
      resources           : z.array(z.string()).describe("Specific resources — course name, URL, author"),
      weeklyPlan          : z.array(z.string()).describe("Week-by-week plan: 'Week 1: Learn X using Y, daily 1hr...'"),
      totalWeeks          : z.number().describe("Total duration in weeks"),
      dailyTimeCommitment : z.string().describe("e.g., '1.5 hours per day'"),
      checkpoints         : z.array(z.string()).describe("Testable milestones e.g. 'Build a CRUD app with React'"),
      capstoneProject     : z.string().describe("Final project that combines everything learned"),
    }),

    func: async ({ goal, skills, resources, weeklyPlan, totalWeeks, dailyTimeCommitment, checkpoints, capstoneProject }) => {
      try {
        const plan = await prisma.learningPlan.create({
          data: {
            userId,
            goal,
            skills,
            resources,
            weeklyPlan,
            totalWeeks,
            dailyTimeCommitment,
            checkpoints,
            capstoneProject,
          },
        });

        console.log("[Learning Tool] ✅ Plan saved:", plan.id);
        return JSON.stringify({ success: true, planId: plan.id });

      } catch (error) {
        console.error("[Learning Tool] Prisma error:", error);
        return JSON.stringify({ success: false, error: String(error) });
      }
    },
  });