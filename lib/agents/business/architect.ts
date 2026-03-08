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

import { invokeWithFallback }  from "../llm-router";
import { SystemMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
import { createBusinessPlanTool } from "./tools";

export async function runBusinessArchitect(
  userId : string,
  userGoal: string,
  context?: {
    industry?        : string;
    budget?          : string;
    experience?      : string;
    targetAudience?  : string;
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
4. List 3-5 market validation steps the user should do FIRST
5. Identify top 3 risks and mitigation strategies
6. Build a 30-day action roadmap with specific daily/weekly tasks

RULES:
- Be SPECIFIC — no generic advice. Give platform names, price points, real tactics.
- roadmap items must be actionable: "Post on IndieHackers with X headline" not "market your product"
- milestones must include a day number, task, and expected outcome

CRITICAL: You MUST call 'save_business_plan' to finalise the plan.
Responding with text only will NOT save anything.`;

  let messages: any[] = [
    new SystemMessage(missionPrompt),
    new HumanMessage("Create my detailed startup business plan now.")
  ];

  try {
    while (true) {
      const response = await invokeWithFallback(tools, messages);
      messages.push(response);

      console.log("[Business Agent] tool_calls:", response.tool_calls?.length ?? 0);

      // ── No tool call → AI responded with text only ──────────
      if (!response.tool_calls || response.tool_calls.length === 0) {
        console.warn("[Business Agent] No tool call — returning text response.");
        return {
          success: false,
          message: typeof response.content === "string"
            ? response.content
            : "Business plan could not be generated. Please try again."
        };
      }

      // ── Execute every tool the AI requested ─────────────────
      for (const toolCall of response.tool_calls) {
        const tool = tools.find(t => t.name === toolCall.name);
        if (!tool) continue;

        try {
          console.log(`[Business Agent] Executing tool: ${toolCall.name}`);
          const output    = await (tool as any).invoke(toolCall.args);
          const outputStr = typeof output === "string" ? output : JSON.stringify(output);

          messages.push(new ToolMessage({
            tool_call_id: toolCall.id!,
            content     : outputStr,
          }));

          // ── Save tool finished → return result ───────────────
          if (toolCall.name === "save_business_plan") {
            try {
              const parsed = JSON.parse(outputStr);
              console.log("[Business Agent] ✅ Plan saved. ID:", parsed.planId);
              return { ...parsed, success: true };
            } catch {
              return { success: true, message: outputStr };
            }
          }

        } catch (toolError) {
          console.error(`[Business Agent] Tool error (${toolCall.name}):`, toolError);
          messages.push(new ToolMessage({
            tool_call_id: toolCall.id!,
            content     : `Error: ${toolError instanceof Error ? toolError.message : String(toolError)}`,
          }));
        }
      }
    }

  } catch (error) {
    console.error("[Business Agent] Critical error:", error);
    return {
      success: false,
      message: "Business Architect encountered an error. Please try again.",
      error  : String(error),
    };
  }
}