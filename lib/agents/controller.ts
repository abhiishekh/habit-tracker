import { geminiModel } from "../gemini";
import { exerciseResearcherTool } from "./tools";
import { prisma } from "@/lib/prisma";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";

export async function runLifeArchitect(userId: string, userGoal: string) {
  
  // 1. Define the Writing Tool inside the function to capture 'userId'
  const createTodoTool = new DynamicStructuredTool({
    name: "create_fitness_todo",
    description: "Done save th workout task to the database schedule.",
    schema: z.object({
      task: z.string().describe("Exercise name, sets, and reps"),
      reminderTime: z.string().describe("ISO string of when the user should do this"),
    }),
    func: async ({ task, reminderTime }) => {
      await prisma.todo.create({
        data: {
          userId: userId, // This uses the ID passed to the function
          task: task,
          category: "Fitness",
          reminderTime: new Date(reminderTime),
        }
      });
      return `Successfully saved ${task} to the database.`;
    },
  });

  const tools = [exerciseResearcherTool, createTodoTool];
  const modelWithTools = geminiModel.bindTools(tools);

  let messages: any[] = [
    new SystemMessage(`You are an elite fitness architect.
    1. Use 'exercise_researcher' to find the best movements for: ${userGoal}.
    2. Use 'create_fitness_todo' to save a 3-day plan into the database.
    3. Finally, give the user a summary of what you scheduled.`),
    new HumanMessage("Execute the plan.")
  ];

  while (true) {
    const response = await modelWithTools.invoke(messages);
    messages.push(response);

    if (!response.tool_calls || response.tool_calls.length === 0) {
      return response.content; 
    }

    for (const toolCall of response.tool_calls) {
      // Logic to pick the right tool to run
      const tool = tools.find(t => t.name === toolCall.name);
      if (tool) {
        console.log(`--- Executing Tool: ${tool.name} ---`);
        const output = await (tool as DynamicStructuredTool).invoke(toolCall.args);
        
        messages.push(new ToolMessage({
          tool_call_id: toolCall.id!,
          content: output
        }));
      }
    }
  }
}