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

import { invokeWithFallback } from "../llm-router";
import { SystemMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
import { saveRelationshipPlanTool } from "./tools";

export async function runRelationshipArchitect(
  userId: string,
  userGoal: string,
  context?: {
    relationshipType?: string;   // "romantic" | "family" | "friendship" | "professional" | "social"
    currentChallenge?: string;
    introvertExtrovert?: string; // "introvert" | "extrovert" | "ambivert"
    socialAnxiety?: boolean;
  }
) {
  const tools = [saveRelationshipPlanTool(userId)];

  const missionPrompt = `You are a World-Class Relationship Coach and Social Skills Expert.
User Goal    : ${userGoal}
User Context : ${JSON.stringify(context || {})}
Current Date : ${new Date().toLocaleDateString()}

MISSION:
1. Identify core communication gaps blocking the user's goal
2. Structure it as a 4-WEEK relationship improvement plan with daily TASKS
3. Cover communication, activities, habits, and conflict resolution

OUTPUT STRUCTURE:
You MUST call 'save_relationship_plan' with this structure:
- goal (string), strategy (optional)
- weeks: array of { weekNumber, focus, tasks: [{ dayNumber, title, description, type }] }
- Each week should have 5-7 tasks
- type options: "communication", "activity", "habit", "conflict"

RULES:
- Include real example scripts: "Instead of 'you never listen', say 'I feel unheard when...'"
- Habits must be daily micro-actions: "Send one genuine compliment per day"
- Activities must be specific: "Join one meetup.com event this week"

CRITICAL: You MUST call 'save_relationship_plan' to finalise.
Responding with text only will NOT save anything.`;

  let messages: any[] = [
    new SystemMessage(missionPrompt),
    new HumanMessage("Create my personalised relationship improvement plan.")
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

      console.log(`[Relationship Architect] API Request ${totalRequests} successful. Took ${endTime - startTime}ms. Tokens: ${tokensThisRequest} (Total Session: ${totalTokensUsed})`);

      messages.push(response);

      if (!response.tool_calls || response.tool_calls.length === 0) {
        const content = typeof response.content === "string" ? response.content : "";
        if (content.toLowerCase().includes("week") || content.toLowerCase().includes("relationship") || content.toLowerCase().includes("communication")) {
          return {
            success: true,
            message: content,
            isMarkdownPlan: true,
            stats: { totalRequests, totalTokensUsed }
          };
        }
        return {
          success: false,
          message: content || "Relationship plan could not be generated.",
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

          if (toolCall.name === "save_relationship_plan") {
            try {
              const parsed = JSON.parse(outputStr);
              return { ...parsed, success: true, stats: { totalRequests, totalTokensUsed } };
            } catch {
              return { success: true, message: outputStr, stats: { totalRequests, totalTokensUsed } };
            }
          }

        } catch (toolError) {
          console.error(`[Relationship Agent] Tool error (${toolCall.name}):`, toolError);
          messages.push(new ToolMessage({
            tool_call_id: toolCall.id!,
            content: `Error: ${toolError instanceof Error ? toolError.message : String(toolError)}`,
          }));
        }
      }
    }

  } catch (error) {
    console.error("[Relationship Agent] Critical error:", error);
    return {
      success: false,
      message: "Relationship Architect encountered an error. Please try again.",
      error: String(error),
    };
  }

  return {
    success: false,
    message: "Max iterations reached without finalizing relationship plan.",
    stats: { totalRequests, totalTokensUsed }
  };
}
