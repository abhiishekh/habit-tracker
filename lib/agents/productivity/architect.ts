// import { model } from "@/lib/gemini";
// import { SystemMessage, HumanMessage } from "@langchain/core/messages";
// import { saveProductivityPlanTool } from "./tools";

// export async function runProductivityArchitect(userId:string,userGoal:string){

// const tools=[saveProductivityPlanTool(userId)]
// const agent=model.bindTools(tools)

// const prompt=`
// You are a productivity strategist.

// Goal: ${userGoal}

// Create a system including:
// - daily schedule
// - focus techniques
// - task prioritization
// `;

// return await agent.invoke([
// new SystemMessage(prompt),
// new HumanMessage("Create productivity system")
// ])

// }

// lib/agents/productivity/architect.ts

import { invokeWithFallback } from "../llm-router";
import { SystemMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
import { saveProductivityPlanTool } from "./tools";

export async function runProductivityArchitect(
  userId: string,
  userGoal: string,
  context?: {
    workType?: string;    // "remote" | "office" | "freelance" | "student"
    wakeTime?: string;    // e.g. "6:30 AM"
    sleepTime?: string;
    biggestBlock?: string;    // e.g. "social media", "context switching"
    toolsUsed?: string[];  // e.g. ["Notion", "Google Calendar"]
    hoursAvailable?: number;
  }
) {
  const tools = [saveProductivityPlanTool(userId)];

  const missionPrompt = `You are a World-Class Productivity Strategist and Systems Designer.
User Goal    : ${userGoal}
User Context : ${JSON.stringify(context || {})}
Current Date : ${new Date().toLocaleDateString()}

MISSION:
1. Design a personalised productivity system
2. Structure it as a 4-WEEK plan with daily actionable TASKS
3. Cover daily schedule, focus techniques, routines, and reviews

OUTPUT STRUCTURE:
You MUST call 'save_productivity_plan' with this structure:
- goal (string), strategy (optional)
- weeks: array of { weekNumber, focus, tasks: [{ dayNumber, title, description, type }] }
- Each week should have 5-7 tasks
- type options: "routine", "focus", "review", "system"

RULES:
- Tasks must include exact time slots: "6:30 AM – Wake + no phone 10 min"
- Focus methods must be specific: "Pomodoro: 25 min work, 5 min break"
- Include a weekly review ritual task

CRITICAL: You MUST call 'save_productivity_plan' to finalise.
Responding with text only will NOT save anything.`;

  let messages: any[] = [
    new SystemMessage(missionPrompt),
    new HumanMessage("Create my complete productivity system.")
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

      console.log(`[Productivity Architect] API Request ${totalRequests} successful. Took ${endTime - startTime}ms. Tokens: ${tokensThisRequest} (Total Session: ${totalTokensUsed})`);

      messages.push(response);

      if (!response.tool_calls || response.tool_calls.length === 0) {
        const content = typeof response.content === "string" ? response.content : "";
        if (content.toLowerCase().includes("week") || content.toLowerCase().includes("productivity") || content.toLowerCase().includes("schedule")) {
          return {
            success: true,
            message: content,
            isMarkdownPlan: true,
            stats: { totalRequests, totalTokensUsed }
          };
        }
        return {
          success: false,
          message: content || "Productivity system could not be generated.",
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

          if (toolCall.name === "save_productivity_plan") {
            try {
              const parsed = JSON.parse(outputStr);
              return { ...parsed, success: true, stats: { totalRequests, totalTokensUsed } };
            } catch {
              return { success: true, message: outputStr, stats: { totalRequests, totalTokensUsed } };
            }
          }

        } catch (toolError) {
          console.error(`[Productivity Agent] Tool error (${toolCall.name}):`, toolError);
          messages.push(new ToolMessage({
            tool_call_id: toolCall.id!,
            content: `Error: ${toolError instanceof Error ? toolError.message : String(toolError)}`,
          }));
        }
      }
    }

  } catch (error) {
    console.error("[Productivity Agent] Critical error:", error);
    return {
      success: false,
      message: "Productivity Architect encountered an error. Please try again.",
      error: String(error),
    };
  }

  return {
    success: false,
    message: "Max iterations reached without finalizing productivity system.",
    stats: { totalRequests, totalTokensUsed }
  };
}
