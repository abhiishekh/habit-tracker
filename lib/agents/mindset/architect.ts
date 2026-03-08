// import { model } from "@/lib/gemini";
// import { SystemMessage, HumanMessage } from "@langchain/core/messages";
// import { saveMindsetPlanTool } from "./tools";

// export async function runMindsetArchitect(userId:string,userGoal:string){

// const tools=[saveMindsetPlanTool(userId)]
// const agent=model.bindTools(tools)

// const prompt=`
// You are a mindset and personal growth coach.

// Goal: ${userGoal}

// Create a plan including:
// - mental exercises
// - daily affirmations
// - mindset habits
// `;

// return await agent.invoke([
// new SystemMessage(prompt),
// new HumanMessage("Create mindset improvement plan")
// ])

// }
// lib/agents/mindset/architect.ts

import { invokeWithFallback } from "../llm-router";
import { SystemMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
import { saveMindsetPlanTool } from "./tools";

export async function runMindsetArchitect(
  userId: string,
  userGoal: string,
  context?: {
    currentChallenges?: string;   // e.g. "procrastination, self-doubt"
    meditationExp?: string;   // "none" | "some" | "regular"
    journaling?: boolean;
    therapyHistory?: boolean;
  }
) {
  const tools = [saveMindsetPlanTool(userId)];

  const missionPrompt = `You are a World-Class Mindset Coach and Cognitive Behavioural Expert.
User Goal    : ${userGoal}
User Context : ${JSON.stringify(context || {})}
Current Date : ${new Date().toLocaleDateString()}

MISSION:
1. Identify core limiting beliefs blocking the user's goal
2. Structure it as a 4-WEEK mindset transformation plan with daily TASKS
3. Cover mental exercises, affirmations, journaling, and habit building

OUTPUT STRUCTURE:
You MUST call 'save_mindset_plan' with this structure:
- goal (string), strategy (optional)
- weeks: array of { weekNumber, focus, tasks: [{ dayNumber, title, description, type }] }
- Each week should have 5-7 tasks
- type options: "habit", "exercise", "journaling", "affirmation"

RULES:
- Affirmations in first person, present tense, specific to the goal
- Exercises must include step-by-step instructions
- Habits must be tiny and stackable (James Clear approach)
- Include a "mindset emergency" task for overwhelm situations

CRITICAL: You MUST call 'save_mindset_plan' to finalise.
Responding with text only will NOT save anything.`;

  let messages: any[] = [
    new SystemMessage(missionPrompt),
    new HumanMessage("Create my personalised mindset transformation plan.")
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

      console.log(`[Mindset Architect] API Request ${totalRequests} successful. Took ${endTime - startTime}ms. Tokens: ${tokensThisRequest} (Total Session: ${totalTokensUsed})`);

      messages.push(response);

      if (!response.tool_calls || response.tool_calls.length === 0) {
        const content = typeof response.content === "string" ? response.content : "";
        if (content.toLowerCase().includes("week") || content.toLowerCase().includes("mindset")) {
          return {
            success: true,
            message: content,
            isMarkdownPlan: true,
            stats: { totalRequests, totalTokensUsed }
          };
        }
        return {
          success: false,
          message: content || "Mindset plan could not be generated.",
          stats: { totalRequests, totalTokensUsed }
        };
      }

      for (const toolCall of response.tool_calls) {
        const tool = tools.find(t => t.name === toolCall.name);
        if (!tool) continue;

        try {
          const output = await (tool as any).invoke(toolCall.args);
          const outputStr = typeof output === "string" ? output : JSON.stringify(output);

          messages.push(new ToolMessage({
            tool_call_id: toolCall.id!,
            content: outputStr,
          }));

          if (toolCall.name === "save_mindset_plan") {
            try {
              const parsed = JSON.parse(outputStr);
              return { ...parsed, success: true, stats: { totalRequests, totalTokensUsed } };
            } catch {
              return { success: true, message: outputStr, stats: { totalRequests, totalTokensUsed } };
            }
          }

        } catch (toolError) {
          console.error(`[Mindset Agent] Tool error (${toolCall.name}):`, toolError);
          messages.push(new ToolMessage({
            tool_call_id: toolCall.id!,
            content: `Error: ${toolError instanceof Error ? toolError.message : String(toolError)}`,
          }));
        }
      }
    }

  } catch (error) {
    console.error("[Mindset Agent] Critical error:", error);
    return {
      success: false,
      message: "Mindset Architect encountered an error. Please try again.",
      error: String(error),
    };
  }

  return {
    success: false,
    message: "Max iterations reached without finalizing mindset plan.",
    stats: { totalRequests, totalTokensUsed }
  };
}
