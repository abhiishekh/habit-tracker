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

import { invokeWithFallback }       from "../llm-router";
import { SystemMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
import { saveProductivityPlanTool } from "./tools";

export async function runProductivityArchitect(
  userId  : string,
  userGoal: string,
  context?: {
    workType?       : string;    // "remote" | "office" | "freelance" | "student"
    wakeTime?       : string;    // e.g. "6:30 AM"
    sleepTime?      : string;
    biggestBlock?   : string;    // e.g. "social media", "context switching"
    toolsUsed?      : string[];  // e.g. ["Notion", "Google Calendar"]
    hoursAvailable? : number;
  }
) {
  const tools = [saveProductivityPlanTool(userId)];

  const missionPrompt = `You are a World-Class Productivity Strategist and Systems Designer.
User Goal    : ${userGoal}
User Context : ${JSON.stringify(context || {})}
Current Date : ${new Date().toLocaleDateString()}

MISSION:
1. Design a personalised daily schedule with time blocks (include exact times)
2. Select the best focus techniques for this user's work type (Pomodoro, time-blocking, deep work etc.)
3. Build a task prioritisation system (e.g. Eisenhower Matrix, MIT method, etc.)
4. Create a morning routine that maximises energy and focus
5. Create an evening routine for recovery and next-day prep
6. Design a weekly review system to track progress and iterate
7. Identify and eliminate the user's top productivity killers

RULES:
- dailySchedule must include exact time slots: "6:30 AM – Wake + no phone 10 min"
- focusMethods must be specific with instructions e.g. "Pomodoro: 25 min work, 5 min break, after 4 cycles take 30 min"
- taskSystem must describe a full workflow the user runs every morning
- weeklyReview must be a step-by-step Sunday/Friday ritual

CRITICAL: You MUST call 'save_productivity_plan' to finalise.
Responding with text only will NOT save anything.`;

  let messages: any[] = [
    new SystemMessage(missionPrompt),
    new HumanMessage("Create my complete productivity system.")
  ];

  try {
    while (true) {
      const response = await invokeWithFallback(tools, messages);
      messages.push(response);

      console.log("[Productivity Agent] tool_calls:", response.tool_calls?.length ?? 0);

      if (!response.tool_calls || response.tool_calls.length === 0) {
        console.warn("[Productivity Agent] No tool call — returning text response.");
        return {
          success: false,
          message: typeof response.content === "string"
            ? response.content
            : "Productivity plan could not be generated. Please try again.",
        };
      }

      for (const toolCall of response.tool_calls) {
        const tool = tools.find(t => t.name === toolCall.name);
        if (!tool) continue;

        try {
          console.log(`[Productivity Agent] Executing tool: ${toolCall.name}`);
          const output    = await (tool as any).invoke(toolCall.args);
          const outputStr = typeof output === "string" ? output : JSON.stringify(output);

          messages.push(new ToolMessage({
            tool_call_id: toolCall.id!,
            content     : outputStr,
          }));

          if (toolCall.name === "save_productivity_plan") {
            try {
              const parsed = JSON.parse(outputStr);
              console.log("[Productivity Agent] ✅ Plan saved. ID:", parsed.planId);
              return { ...parsed, success: true };
            } catch {
              return { success: true, message: outputStr };
            }
          }

        } catch (toolError) {
          console.error(`[Productivity Agent] Tool error (${toolCall.name}):`, toolError);
          messages.push(new ToolMessage({
            tool_call_id: toolCall.id!,
            content     : `Error: ${toolError instanceof Error ? toolError.message : String(toolError)}`,
          }));
        }
      }
    }

  } catch (error) {
    console.error("[Productivity Agent] Critical error:", error);
    return {
      success: false,
      message: "Productivity Architect encountered an error. Please try again.",
      error  : String(error),
    };
  }
}