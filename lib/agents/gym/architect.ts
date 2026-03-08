
import { model } from "@/lib/gemini";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { invokeWithFallback } from "../llm-router";
import { HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import { createWeeklyWorkoutTool, exerciseResearcherTool } from "./tools";


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
  const agent = model.bindTools([createTodoTool]);

  const res = await agent.invoke([
    ["system", "You are a Master Fitness Architect. Break the user's 90-day goal into a 7-day initial 'Action Phase'. Use the tools to populate their schedule."],
    ["human", userGoal],
  ]);

  return res;
}

export async function runGymArchitect(userId: string, userGoal: string, context: { weight: number, height: number, experience: string, refinement?: string }) {
  const writingTool = createWeeklyWorkoutTool(userId);
  const tools = [exerciseResearcherTool, writingTool];

  const missionPrompt = `You are a Senior Gym Trainer and Exercise Scientist. 
    User Context: Weight ${context.weight}kg, Height ${context.height}cm, Level: ${context.experience}.
    Goal: ${userGoal}.
    ${context.refinement ? `REFINEMENT REQUEST: ${context.refinement}` : ""}
    
    Current Date: ${new Date().toLocaleDateString()}.
    
    MISSION:
    1. Research expert exercises using 'exercise_researcher'.
    2. Use 'save_weekly_workout_plan' to create a 7-day structure.
    3. Ensure you include the 'notes' (form tips) found during research.
    4. Provide 'ourUnderstanding' and 'whyBestForGoal' justifications in the 'save_weekly_workout_plan' tool.
    5. For weights, provide only numeric values (e.g., 20) in kg. Do not add text like 'each' or 'kg'. 
    
    CRITICAL: You MUST call 'save_weekly_workout_plan' to finalize the plan in the database. 
    
    FALLBACK FORMATTING: If for any reason you cannot call the tool, you MUST provide a clean, detailed 7-day workout plan in MARKDOWN format in your text response. Include days, exercises, sets, reps, and weights.
    
    Research the exercises FIRST, then call the save tool with all the details. Always ensure the 'notes' field contains the form tips you researched.`;


  let messages: any[] = [
    new SystemMessage(missionPrompt),
    new HumanMessage(context.refinement ? "Refine my gym workout plan based on the feedback." : "Generate my expert 7-day Gym Workout Plan with exercises, sets, and reps.")
  ];

  let totalTokensUsed = 0;
  let totalRequests = 0;
  const MAX_ITERATIONS = 5;
  let iterations = 0;

  try {
    while (iterations < MAX_ITERATIONS) {
      iterations++;
      totalRequests++;

      const startTime = Date.now();
      const response = await invokeWithFallback(tools, messages);
      const endTime = Date.now();

      const usageMetadata = response?.response_metadata?.usage_metadata;
      const tokensThisRequest = (usageMetadata as any)?.total_tokens || 0;
      totalTokensUsed += tokensThisRequest;

      console.log(`[Gym Architect] API Request ${totalRequests} successful. Took ${endTime - startTime}ms. Tokens: ${tokensThisRequest} (Total Session: ${totalTokensUsed})`);

      messages.push(response);

      if (!response.tool_calls || response.tool_calls.length === 0) {
        const content = typeof response.content === 'string' ? response.content : "";
        if (content.toLowerCase().includes("day") || content.toLowerCase().includes("exercise")) {
          return {
            success: true,
            message: content,
            isMarkdownPlan: true,
            stats: { totalRequests, totalTokensUsed },
            justifications: {
              userWant: userGoal,
              ourUnderstanding: "Generated markdown plan as fallback.",
              whatWhyGiving: "Direct workout schedule provided in text.",
              whyBestForGoal: "Detailed structure provided for immediate use."
            }
          };
        }

        return {
          success: false,
          message: content || "AI failed to finalize a structured plan.",
          stats: { totalRequests, totalTokensUsed },
          justifications: {
            userWant: "Analysis in progress...",
            ourUnderstanding: content || "Technical analysis was provided without tool calls.",
            whatWhyGiving: "No specific plan was saved yet.",
            whyBestForGoal: "Please try again or refine your prompt."
          }
        };
      }

      for (const toolCall of response.tool_calls) {
        const tool = tools.find(t => t.name === toolCall.name);
        if (tool) {
          try {
            const output = await (tool as any).invoke(toolCall.args);
            const outputString = typeof output === 'string' ? output : JSON.stringify(output);

            messages.push(new ToolMessage({
              tool_call_id: toolCall.id!,
              content: outputString
            }));

            if (tool.name === "save_weekly_workout_plan") {
              try {
                const parsed = JSON.parse(outputString);
                return { ...parsed, success: true, stats: { totalRequests, totalTokensUsed } };
              } catch (e) {
                if (outputString.toLowerCase().includes("success")) {
                  return { success: true, message: outputString, stats: { totalRequests, totalTokensUsed } };
                }
                return { success: false, message: "Save tool output was invalid.", error: outputString, stats: { totalRequests, totalTokensUsed } };
              }
            }
          } catch (toolError) {
            console.error(`--- [Gym Agent] Tool ${tool.name} execution error:`, toolError);
            messages.push(new ToolMessage({
              tool_call_id: toolCall.id!,
              content: `Error: ${toolError instanceof Error ? toolError.message : String(toolError)}`
            }));
          }
        }
      }
    }
  } catch (error) {
    console.error("Gym Architect Error:", error);
    return {
      success: false,
      message: "The AI Coach encountered a brain freeze. Please try again.",
      stats: { totalRequests, totalTokensUsed }
    };
  }

  return {
    success: false,
    message: "Max iterations reached without finalizing gym plan.",
    stats: { totalRequests, totalTokensUsed }
  };
}
