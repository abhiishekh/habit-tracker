
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { geminiModel } from "../gemini";

// 1. Define the Tool: How the AI talks to Prisma
const createTodoTool = new DynamicStructuredTool({
  name: "create_workout_todo",
  description: "Creates a fitness todo in the user's schedule",
  schema: z.object({
    task: z.string().describe("The exercise name and sets/reps (e.g. Bench Press 3x10)"),
    reminderTime: z.string().describe("ISO string of the workout time"),
    category: z.string().default("Fitness"),
  }),
  func: async ({ task, reminderTime, category }) => {
    // Logic to call prisma.todo.create
    return "Todo created successfully";
  },
});

// 2. The Agent Logic
export async function generateInitialPlan(userGoal: string, userId: string) {
//   const llm = new ChatOpenAI({ modelName: "gpt-4o", temperature: 0 });
  const agent = geminiModel.bindTools([createTodoTool]);
  
  const res = await agent.invoke([
    ["system", "You are a Master Fitness Architect. Break the user's 90-day goal into a 7-day initial 'Action Phase'. Use the tools to populate their schedule."],
    ["human", userGoal],
  ]);
  
  return res;
}