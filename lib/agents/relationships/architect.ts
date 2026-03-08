// import { model } from "@/lib/gemini";
// import { SystemMessage, HumanMessage } from "@langchain/core/messages";
// import { saveRelationshipPlanTool } from "./tools";

// export async function runRelationshipArchitect(userId:string,userGoal:string){

// const tools=[saveRelationshipPlanTool(userId)]
// const agent=model.bindTools(tools)

// const prompt=`
// You are a relationship coach.

// Goal: ${userGoal}

// Create a plan including:
// - communication improvements
// - relationship habits
// - social growth activities
// `;

// return await agent.invoke([
// new SystemMessage(prompt),
// new HumanMessage("Create relationship improvement plan")
// ])

// }

// lib/agents/relationship/architect.ts

import { invokeWithFallback }       from "../llm-router";
import { SystemMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
import { saveRelationshipPlanTool } from "./tools";

export async function runRelationshipArchitect(
  userId  : string,
  userGoal: string,
  context?: {
    relationshipType? : string;   // "romantic" | "family" | "friendship" | "professional" | "social"
    currentChallenge? : string;
    introvertExtrovert? : string; // "introvert" | "extrovert" | "ambivert"
    socialAnxiety?    : boolean;
  }
) {
  const tools = [saveRelationshipPlanTool(userId)];

  const missionPrompt = `You are a World-Class Relationship Coach and Social Skills Expert.
User Goal    : ${userGoal}
User Context : ${JSON.stringify(context || {})}
Current Date : ${new Date().toLocaleDateString()}

MISSION:
1. Identify the core communication gaps blocking the user's relationship goal
2. Design specific communication improvement exercises (with scripts if needed)
3. Build a 30-day relationship habit stack
4. Create social growth activities appropriate to the relationship type
5. Include conflict resolution techniques with step-by-step scripts
6. Design a "social battery" management plan for introverts if relevant
7. Provide conversation starters and deepening techniques

RULES:
- communicationTips must include real example scripts e.g. "Instead of 'you never listen', say 'I feel unheard when...'"
- habits must be daily micro-actions: "Send one genuine compliment per day"
- activities must be specific: "Join one meetup.com event in your city this week"
- Include an empathy-building exercise with instructions

CRITICAL: You MUST call 'save_relationship_plan' to finalise.
Responding with text only will NOT save anything.`;

  let messages: any[] = [
    new SystemMessage(missionPrompt),
    new HumanMessage("Create my personalised relationship improvement plan.")
  ];

  try {
    while (true) {
      const response = await invokeWithFallback(tools, messages);
      messages.push(response);

      console.log("[Relationship Agent] tool_calls:", response.tool_calls?.length ?? 0);

      if (!response.tool_calls || response.tool_calls.length === 0) {
        console.warn("[Relationship Agent] No tool call — returning text response.");
        return {
          success: false,
          message: typeof response.content === "string"
            ? response.content
            : "Relationship plan could not be generated. Please try again.",
        };
      }

      for (const toolCall of response.tool_calls) {
        const tool = tools.find(t => t.name === toolCall.name);
        if (!tool) continue;

        try {
          console.log(`[Relationship Agent] Executing tool: ${toolCall.name}`);
          const output    = await (tool as any).invoke(toolCall.args);
          const outputStr = typeof output === "string" ? output : JSON.stringify(output);

          messages.push(new ToolMessage({
            tool_call_id: toolCall.id!,
            content     : outputStr,
          }));

          if (toolCall.name === "save_relationship_plan") {
            try {
              const parsed = JSON.parse(outputStr);
              console.log("[Relationship Agent] ✅ Plan saved. ID:", parsed.planId);
              return { ...parsed, success: true };
            } catch {
              return { success: true, message: outputStr };
            }
          }

        } catch (toolError) {
          console.error(`[Relationship Agent] Tool error (${toolCall.name}):`, toolError);
          messages.push(new ToolMessage({
            tool_call_id: toolCall.id!,
            content     : `Error: ${toolError instanceof Error ? toolError.message : String(toolError)}`,
          }));
        }
      }
    }

  } catch (error) {
    console.error("[Relationship Agent] Critical error:", error);
    return {
      success: false,
      message: "Relationship Architect encountered an error. Please try again.",
      error  : String(error),
    };
  }
}