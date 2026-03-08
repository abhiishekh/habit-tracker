// import { model } from "@/lib/gemini";
// import { SystemMessage, HumanMessage } from "@langchain/core/messages";
// import { saveHealthPlanTool } from "./tools";

// export async function runHealthArchitect(userId: string, userGoal: string) {

//   const tools = [saveHealthPlanTool(userId)];
//   const modelWithTools = model.bindTools(tools);

//   const prompt = `
// You are a Professional Health Coach.

// User goal: ${userGoal}

// Create a weekly plan including:
// - nutrition
// - sleep optimization
// - stress reduction
// `;

//   const res = await modelWithTools.invoke([
//     new SystemMessage(prompt),
//     new HumanMessage("Create my health improvement plan")
//   ]);

//   return res;
// }

// lib/agents/health/architect.ts

import { invokeWithFallback } from "../llm-router";
import { SystemMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
import { saveHealthPlanTool } from "./tools";

export async function runHealthArchitect(
  userId: string,
  userGoal: string,
  context?: {
    age?: number;
    currentWeight?: number;
    existingIssues?: string;
    dietPreference?: string;   // "veg", "non-veg", "vegan"
    sleepHours?: number;
  }
) {
  const tools = [saveHealthPlanTool(userId)];

  const missionPrompt = `You are a Professional Health Coach, Nutritionist, and Wellness Expert.
User Goal    : ${userGoal}
User Context : ${JSON.stringify(context || {})}
Current Date : ${new Date().toLocaleDateString()}

MISSION:
1. Design a personalised health improvement plan
2. Structure it as a 4-WEEK plan with daily actionable TASKS
3. Cover nutrition, sleep, stress management, exercise, and hydration

OUTPUT STRUCTURE:
You MUST call 'save_health_plan' with this structure:
- goal (string), strategy (optional string)
- weeks: array of { weekNumber, focus, tasks: [{ dayNumber, title, description, category }] }
- Each week should have 5-7 tasks
- category options: "nutrition", "sleep", "exercise", "stress", "hydration"

RULES:
- Be SPECIFIC — give actual meal examples, not just "eat healthy"
- Include Indian food options where relevant
- Tasks must be actionable habits, not generic advice
- Include at least one breathing/meditation technique

CRITICAL: You MUST call 'save_health_plan' to finalise.
Responding with text only will NOT save anything.`;

  let messages: any[] = [
    new SystemMessage(missionPrompt),
    new HumanMessage("Create my personalised health improvement plan.")
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

      console.log(`[Health Architect] API Request ${totalRequests} successful. Took ${endTime - startTime}ms. Tokens: ${tokensThisRequest} (Total Session: ${totalTokensUsed})`);

      messages.push(response);

      if (!response.tool_calls || response.tool_calls.length === 0) {
        const content = typeof response.content === "string" ? response.content : "";
        if (content.toLowerCase().includes("week") || content.toLowerCase().includes("nutrition")) {
          return {
            success: true,
            message: content,
            isMarkdownPlan: true,
            stats: { totalRequests, totalTokensUsed }
          };
        }
        return {
          success: false,
          message: content || "Health plan could not be generated.",
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

          if (toolCall.name === "save_health_plan") {
            try {
              const parsed = JSON.parse(outputStr);
              return { ...parsed, success: true, stats: { totalRequests, totalTokensUsed } };
            } catch {
              return { success: true, message: outputStr, stats: { totalRequests, totalTokensUsed } };
            }
          }

        } catch (toolError) {
          console.error(`[Health Agent] Tool error (${toolCall.name}):`, toolError);
          messages.push(new ToolMessage({
            tool_call_id: toolCall.id!,
            content: `Error: ${toolError instanceof Error ? toolError.message : String(toolError)}`,
          }));
        }
      }
    }

  } catch (error) {
    console.error("[Health Agent] Critical error:", error);
    return {
      success: false,
      message: "Health Architect encountered an error. Please try again.",
      error: String(error),
    };
  }

  return {
    success: false,
    message: "Max iterations reached without finalizing health plan.",
    stats: { totalRequests, totalTokensUsed }
  };
}
