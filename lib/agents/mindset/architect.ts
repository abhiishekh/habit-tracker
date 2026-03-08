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

import { invokeWithFallback }  from "../llm-router";
import { SystemMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
import { saveMindsetPlanTool } from "./tools";

export async function runMindsetArchitect(
  userId  : string,
  userGoal: string,
  context?: {
    currentChallenges? : string;   // e.g. "procrastination, self-doubt"
    meditationExp?     : string;   // "none" | "some" | "regular"
    journaling?        : boolean;
    therapyHistory?    : boolean;
  }
) {
  const tools = [saveMindsetPlanTool(userId)];

  const missionPrompt = `You are a World-Class Mindset Coach and Cognitive Behavioural Expert.
User Goal    : ${userGoal}
User Context : ${JSON.stringify(context || {})}
Current Date : ${new Date().toLocaleDateString()}

MISSION:
1. Identify the core limiting beliefs blocking the user's goal
2. Design daily mental exercises to rewire negative patterns (be specific with instructions)
3. Create personalised morning and evening affirmations (write them out fully)
4. Build a 21-day habit stack for sustained mindset change
5. Include at least one CBT (Cognitive Behavioural Therapy) reframing technique
6. Suggest journaling prompts to process emotions and track growth

RULES:
- Affirmations must be written in first person, present tense, specific to the goal
- exercises must include step-by-step instructions (e.g. "4-7-8 breathing: inhale 4s, hold 7s, exhale 8s")
- habits must be tiny and stackable — James Clear "habit stacking" approach
- Include a "mindset emergency" protocol for when the user feels overwhelmed

CRITICAL: You MUST call 'save_mindset_plan' to finalise.
Responding with text only will NOT save anything.`;

  let messages: any[] = [
    new SystemMessage(missionPrompt),
    new HumanMessage("Create my personalised mindset transformation plan.")
  ];

  try {
    while (true) {
      const response = await invokeWithFallback(tools, messages);
      messages.push(response);

      console.log("[Mindset Agent] tool_calls:", response.tool_calls?.length ?? 0);

      if (!response.tool_calls || response.tool_calls.length === 0) {
        console.warn("[Mindset Agent] No tool call — returning text response.");
        return {
          success: false,
          message: typeof response.content === "string"
            ? response.content
            : "Mindset plan could not be generated. Please try again.",
        };
      }

      for (const toolCall of response.tool_calls) {
        const tool = tools.find(t => t.name === toolCall.name);
        if (!tool) continue;

        try {
          console.log(`[Mindset Agent] Executing tool: ${toolCall.name}`);
          const output    = await (tool as any).invoke(toolCall.args);
          const outputStr = typeof output === "string" ? output : JSON.stringify(output);

          messages.push(new ToolMessage({
            tool_call_id: toolCall.id!,
            content     : outputStr,
          }));

          if (toolCall.name === "save_mindset_plan") {
            try {
              const parsed = JSON.parse(outputStr);
              console.log("[Mindset Agent] ✅ Plan saved. ID:", parsed.planId);
              return { ...parsed, success: true };
            } catch {
              return { success: true, message: outputStr };
            }
          }

        } catch (toolError) {
          console.error(`[Mindset Agent] Tool error (${toolCall.name}):`, toolError);
          messages.push(new ToolMessage({
            tool_call_id: toolCall.id!,
            content     : `Error: ${toolError instanceof Error ? toolError.message : String(toolError)}`,
          }));
        }
      }
    }

  } catch (error) {
    console.error("[Mindset Agent] Critical error:", error);
    return {
      success: false,
      message: "Mindset Architect encountered an error. Please try again.",
      error  : String(error),
    };
  }
}