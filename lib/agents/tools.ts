
// import { DynamicStructuredTool } from "@langchain/core/tools";
// import { z } from "zod";
// import { prisma } from "@/lib/prisma";


// export const exerciseResearcherTool = new DynamicStructuredTool({
//   name: "exercise_researcher",
//   description: "Searches for specific exercises based on target muscles or body parts.",
//   schema: z.object({
//     bodyPart: z.string().describe("The body part to target (e.g., 'abs', 'chest', 'back')"),
//   }),
//   func: async ({ bodyPart }) => {
//     try {
//       const options = {
//         method: 'GET',
//         url: `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${bodyPart}`,
//         headers: {
//           'x-rapidapi-key': process.env.EXERCISE_DB_API_KEY || "",
//           'x-rapidapi-host': 'exercisedb.p.rapidapi.com'
//         }
//       };
//       const response = await fetch(options.url, { headers: options.headers as any });
//       const data = await response.json();

//       if (!Array.isArray(data)) {
//         console.error("ExerciseDB API returned non-array data:", data);
//         return "The exercise database search failed. Please skip research and use your general knowledge for this goal.";
//       }

//       // Return only the top 5 results to keep the AI's context window clean
//       return JSON.stringify(data.slice(0, 5));
//     } catch (error) {
//       console.error("Exercise Researcher Tool Error:", error);
//       return "The exercise researcher is currently unavailable. Please provide a plan based on your general fitness expertise.";
//     }

//   },
// });

// export const createWeeklyWorkoutTool = (userId: string) => new DynamicStructuredTool({
//   name: "save_weekly_workout_plan",
//   description: "Saves a full 7-day workout plan with specific exercises and AI justifications.",
//   schema: z.object({
//     goal: z.string().describe("The user's fitness goal"),
//     userWant: z.string().describe("What the user wants in their own words"),
//     ourUnderstanding: z.string().describe("AI's understanding of the user's needs"),
//     whatWhyGiving: z.string().describe("What is being provided and why"),
//     whyBestForGoal: z.string().describe("Why this specific plan is the best for the user's goal"),
//     workouts: z.array(z.object({
//       dayOfWeek: z.string().describe("e.g., 'Monday'"),
//       focus: z.string().describe("e.g., 'Chest & Triceps'"),
//       exercises: z.array(z.object({
//         exerciseId: z.string().describe("The 'id' field from ExerciseDB"),
//         name: z.string(),
//         sets: z.number(),
//         reps: z.number(),
//         weight: z.union([z.number(), z.string()]).optional().describe("The weight in kg. Just the number."),
//         gifUrl: z.string().optional(),
//         notes: z.string().optional(),
//       }))
//     }))
//   }),
//   func: async ({ goal, userWant, ourUnderstanding, whatWhyGiving, whyBestForGoal, workouts }) => {
//     try {
//       console.log("Saving Workout Plan for User:", userId);
//       const plan = await prisma.workoutPlan.create({
//         data: {
//           userId,
//           goal,
//           weekNumber: 1,
//           startDate: new Date(),
//           endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//           workouts: {
//             create: workouts.map(w => ({
//               dayOfWeek: w.dayOfWeek,
//               focus: w.focus,
//               exercises: {
//                 create: w.exercises.map(e => ({
//                   exerciseId: e.exerciseId,
//                   name: e.name,
//                   sets: e.sets,
//                   reps: e.reps,
//                   weight: e.weight ? parseFloat(String(e.weight).replace(/[^0-9.]/g, '')) || 0 : 0,
//                   gifUrl: e.gifUrl || "",
//                   notes: e.notes || ""
//                 }))
//               }
//             }))
//           }
//         }
//       });

//       console.log("Workout Plan Saved Successfully:", plan.id);
//       return JSON.stringify({
//         message: "Weekly workout plan successfully saved.",
//         planId: plan.id,
//         justifications: {
//           userWant,
//           ourUnderstanding,
//           whatWhyGiving,
//           whyBestForGoal
//         }
//       });
//     } catch (error) {
//       console.error("Prisma Error during Workout Plan Save:", error);
//       return "Failed to save workout plan.";
//     }
//   }

// });

import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Utility to prevent 429 Rate Limits
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const exerciseResearcherTool = new DynamicStructuredTool({
  name: "exercise_researcher",
  description: "Searches for specific exercises based on target muscles or body parts.",
  schema: z.object({
    bodyPart: z.string().describe("The body part to target (e.g., 'abs', 'chest', 'back')"),
  }),
  func: async ({ bodyPart }) => {
    try {
      // 1. ADD THROTTLING: Wait 1 second before calling the API to stay safe
      await sleep(1000);

      const options = {
        method: 'GET',
        url: `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${bodyPart}`,
        headers: {
          'x-rapidapi-key': process.env.EXERCISE_DB_API_KEY || "",
          'x-rapidapi-host': 'exercisedb.p.rapidapi.com'
        }
      };

      const response = await fetch(options.url, { headers: options.headers as any });
      const data = await response.json();

      if (!Array.isArray(data)) {
        return "The exercise database search failed. Use your general knowledge.";
      }

      // Return ID, Name, and Instructions (Exclude the temporary gifUrl)
      const cleanData = data.slice(0, 5).map(ex => ({
        id: ex.id,
        name: ex.name,
        instructions: ex.instructions
      }));

      return JSON.stringify(cleanData);
    } catch (error) {
      return "Researcher unavailable. Provide a plan based on general expertise.";
    }
  },
});

export const createWeeklyWorkoutTool = (userId: string) => new DynamicStructuredTool({
  name: "save_weekly_workout_plan",
  description: "Saves a full 7-day workout plan with specific exercises.",
  schema: z.object({
    goal: z.string().describe("The user's fitness goal"),
    // AI Justification fields (Ensure these exist in your Prisma WorkoutPlan model!)
    ourUnderstanding: z.string(),
    whyBestForGoal: z.string(),
    workouts: z.array(z.object({
      dayOfWeek: z.string(),
      focus: z.string(),
      exercises: z.array(z.object({
        exerciseId: z.string().describe("The permanent ID from ExerciseDB"),
        name: z.string(),
        sets: z.number(),
        reps: z.number(),
        weight: z.union([z.number(), z.string()]).optional(),
        notes: z.string().optional(),
      }))
    }))
  }),
  func: async ({ goal, ourUnderstanding, whyBestForGoal, workouts }) => {
    try {
      const plan = await prisma.workoutPlan.create({
        data: {
          userId,
          goal,
          // If you updated your schema to include these, uncomment them:
          // architectNotes: ourUnderstanding, 
          // logicJustification: whyBestForGoal,
          weekNumber: 1,
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          workouts: {
            create: workouts.map(w => ({
              dayOfWeek: w.dayOfWeek,
              focus: w.focus,
              exercises: {
                create: w.exercises.map(e => ({
                  exerciseId: e.exerciseId,
                  name: e.name,
                  sets: e.sets,
                  reps: e.reps,
                  weight: e.weight ? parseFloat(String(e.weight).replace(/[^0-9.]/g, '')) || 0 : 0,
                  notes: e.notes || ""
                }))
              }
            }))
          }
        }
      });

      return JSON.stringify({
        success: true,
        message: "Weekly workout plan successfully saved.",
        planId: plan.id,
        justification: whyBestForGoal
      });
    } catch (error) {
      console.error("Prisma Error:", error);
      return JSON.stringify({
        success: false,
        message: "Failed to save plan. Try a simpler structure.",
        error: String(error)
      });
    }
  }
});