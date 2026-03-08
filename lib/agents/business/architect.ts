// import { model } from "@/lib/gemini";
// import { SystemMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
// import { createBusinessPlanTool } from "./tools";

// export async function runBusinessArchitect(userId: string, userGoal: string) {

//   const writingTool = createBusinessPlanTool(userId);
//   const tools = [writingTool];

//   const modelWithTools = model.bindTools(tools);

//   const missionPrompt = `
// You are a Startup Strategist and Business Architect.

// User Goal: ${userGoal}

// MISSION:
// 1. Break the goal into a realistic business plan
// 2. Include validation steps
// 3. Define revenue strategy
// 4. Create a 30-day action roadmap

// CRITICAL:
// You MUST call 'save_business_plan' to store the plan.
// `;

//   let messages:any[] = [
//     new SystemMessage(missionPrompt),
//     new HumanMessage("Create my startup plan.")
//   ];

//   const response = await modelWithTools.invoke(messages);

//   return response;
// }

// lib/agents/business/architect.ts

import { invokeWithFallback } from "../llm-router";
import { SystemMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
import { createBusinessPlanTool } from "./tools";

export async function runBusinessArchitect(
  userId: string,
  userGoal: string,
  context?: {
    industry?: string;
    budget?: string;
    experience?: string;
    targetAudience?: string;
  }
) {
  const tools = [createBusinessPlanTool(userId)];

  const missionPrompt = `You are an elite Startup Strategist and Business Architect with 20+ years of experience.
User Goal    : ${userGoal}
User Context : ${JSON.stringify(context || {})}
Current Date : ${new Date().toLocaleDateString()}

MISSION:
1. Analyse the business idea and define the core value proposition
2. Identify the target market and ideal customer profile
3. Design a realistic revenue model (pricing, channels, monetisation)
4. Create a 4-week plan structured as WEEKS, each with daily TASKS

OUTPUT STRUCTURE:
You MUST call 'save_business_plan' with this structure:
- goal, idea, targetMarket, revenueModel (strings)
- weeks: array of { weekNumber, focus, tasks: [{ dayNumber, title, description, type }] }
- Each week should have 5-7 tasks
- type options: "validation", "marketing", "product", "operations"

RULES:
- Be SPECIFIC — no generic advice. Give platform names, price points, real tactics.
- Tasks must be actionable: "Post on IndieHackers with X headline" not "market your product"
- Every task needs a clear title and detailed description

CRITICAL: You MUST call 'save_business_plan' to finalise the plan.
Responding with text only will NOT save anything.`;

  let messages: any[] = [
    new SystemMessage(missionPrompt),
    new HumanMessage("Create my detailed startup business plan now.")
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

      console.log(`[Business Architect] API Request ${totalRequests} successful. Took ${endTime - startTime}ms. Tokens: ${tokensThisRequest} (Total Session: ${totalTokensUsed})`);

      messages.push(response);

      if (!response.tool_calls || response.tool_calls.length === 0) {
        const content = typeof response.content === "string" ? response.content : "";
        if (content.toLowerCase().includes("week") || content.toLowerCase().includes("business")) {
          return {
            success: true,
            message: content,
            isMarkdownPlan: true,
            stats: { totalRequests, totalTokensUsed }
          };
        }
        return {
          success: false,
          message: content || "Business plan could not be generated.",
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

          if (toolCall.name === "save_business_plan") {
            try {
              const parsed = JSON.parse(outputStr);
              return { ...parsed, success: true, stats: { totalRequests, totalTokensUsed } };
            } catch {
              return { success: true, message: outputStr, stats: { totalRequests, totalTokensUsed } };
            }
          }

        } catch (toolError) {
          console.error(`[Business Agent] Tool error (${toolCall.name}):`, toolError);
          messages.push(new ToolMessage({
            tool_call_id: toolCall.id!,
            content: `Error: ${toolError instanceof Error ? toolError.message : String(toolError)}`,
          }));
        }
      }
    }

  } catch (error) {
    console.error("[Business Agent] Critical error:", error);
    return {
      success: false,
      message: "Business Architect encountered an error. Please try again.",
      error: String(error),
    };
  }

  return {
    success: false,
    message: "Max iterations reached without finalizing business plan.",
    stats: { totalRequests, totalTokensUsed }
  };
}
