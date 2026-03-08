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
import { saveHealthPlanTool }  from "./tools";

export async function runHealthArchitect(
  userId  : string,
  userGoal: string,
  context?: {
    age?            : number;
    currentWeight?  : number;
    existingIssues? : string;
    dietPreference? : string;   // "veg", "non-veg", "vegan"
    sleepHours?     : number;
  }
) {
  const tools = [saveHealthPlanTool(userId)];

  const missionPrompt = `You are a Professional Health Coach, Nutritionist, and Wellness Expert.
User Goal    : ${userGoal}
User Context : ${JSON.stringify(context || {})}
Current Date : ${new Date().toLocaleDateString()}

MISSION:
1. Design a personalised nutrition plan (meals, portions, timings)
2. Create sleep optimisation strategies specific to the user
3. Build a stress management and recovery protocol
4. Provide a day-by-day weekly health schedule
5. Recommend supplements if relevant (be specific with dosage)
6. Set hydration targets

RULES:
- Be SPECIFIC — give actual meal examples, not just "eat healthy"
- Include Indian food options where relevant (user likely in India)
- sleepTips must be actionable habits, not generic advice
- stressManagement must include at least one breathing/meditation technique

CRITICAL: You MUST call 'save_health_plan' to finalise.
Responding with text only will NOT save anything.`;

  let messages: any[] = [
    new SystemMessage(missionPrompt),
    new HumanMessage("Create my personalised health improvement plan.")
  ];

  try {
    while (true) {
      const response = await invokeWithFallback(tools, messages);
      messages.push(response);

      console.log("[Health Agent] tool_calls:", response.tool_calls?.length ?? 0);

      if (!response.tool_calls || response.tool_calls.length === 0) {
        console.warn("[Health Agent] No tool call — returning text response.");
        return {
          success: false,
          message: typeof response.content === "string"
            ? response.content
            : "Health plan could not be generated. Please try again.",
        };
      }

      for (const toolCall of response.tool_calls) {
        const tool = tools.find(t => t.name === toolCall.name);
        if (!tool) continue;

        try {
          console.log(`[Health Agent] Executing tool: ${toolCall.name}`);
          const output    = await (tool as any).invoke(toolCall.args);
          const outputStr = typeof output === "string" ? output : JSON.stringify(output);

          messages.push(new ToolMessage({
            tool_call_id: toolCall.id!,
            content     : outputStr,
          }));

          if (toolCall.name === "save_health_plan") {
            try {
              const parsed = JSON.parse(outputStr);
              console.log("[Health Agent] ✅ Plan saved. ID:", parsed.planId);
              return { ...parsed, success: true };
            } catch {
              return { success: true, message: outputStr };
            }
          }

        } catch (toolError) {
          console.error(`[Health Agent] Tool error (${toolCall.name}):`, toolError);
          messages.push(new ToolMessage({
            tool_call_id: toolCall.id!,
            content     : `Error: ${toolError instanceof Error ? toolError.message : String(toolError)}`,
          }));
        }
      }
    }

  } catch (error) {
    console.error("[Health Agent] Critical error:", error);
    return {
      success: false,
      message: "Health Architect encountered an error. Please try again.",
      error  : String(error),
    };
  }
}