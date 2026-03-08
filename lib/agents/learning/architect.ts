// import { model } from "@/lib/gemini";
// import { SystemMessage, HumanMessage } from "@langchain/core/messages";
// import { saveLearningRoadmapTool } from "./tools";

// export async function runLearningArchitect(userId:string,userGoal:string){

// const tools=[saveLearningRoadmapTool(userId)];
// const agent=model.bindTools(tools)

// const prompt=`
// You are a Learning Architect.

// User goal: ${userGoal}

// Create a structured learning roadmap with:
// - skills to learn
// - resources
// - weekly milestones
// `;

// const res=await agent.invoke([
// new SystemMessage(prompt),
// new HumanMessage("Create my learning roadmap")
// ])

// return res

// }

// lib/agents/learning/architect.ts

import { invokeWithFallback }    from "../llm-router";
import { SystemMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
import { saveLearningRoadmapTool } from "./tools";

export async function runLearningArchitect(
  userId  : string,
  userGoal: string,
  context?: {
    currentLevel?       : string;   // "beginner" | "intermediate" | "advanced"
    hoursPerDay?        : number;
    preferredStyle?     : string;   // "video" | "reading" | "projects" | "mixed"
    targetDate?         : string;
    existingSkills?     : string[];
  }
) {
  const tools = [saveLearningRoadmapTool(userId)];

  const missionPrompt = `You are a World-Class Learning Architect and Instructional Designer.
User Goal    : ${userGoal}
User Context : ${JSON.stringify(context || {})}
Current Date : ${new Date().toLocaleDateString()}

MISSION:
1. Break the learning goal into specific, ordered skills to acquire
2. Recommend the BEST free and paid resources for each skill (YouTube channels, courses, books, docs)
3. Create a week-by-week learning plan with daily time blocks
4. Define clear checkpoints — how the user knows they've mastered each skill
5. Build a capstone project idea that combines all skills learned

RULES:
- Resources must be SPECIFIC: "freeCodeCamp React course on YouTube" not just "watch YouTube"
- weeklyPlan items must include: week number, focus topic, resource, daily task
- dailyTimeCommitment must be realistic based on hoursPerDay in context
- checkpoints must be testable: "Build a todo app using X" not "understand X"

CRITICAL: You MUST call 'save_learning_plan' to finalise.
Responding with text only will NOT save anything.`;

  let messages: any[] = [
    new SystemMessage(missionPrompt),
    new HumanMessage("Create my complete learning roadmap.")
  ];

  try {
    while (true) {
      const response = await invokeWithFallback(tools, messages);
      messages.push(response);

      console.log("[Learning Agent] tool_calls:", response.tool_calls?.length ?? 0);

      if (!response.tool_calls || response.tool_calls.length === 0) {
        console.warn("[Learning Agent] No tool call — returning text response.");
        return {
          success: false,
          message: typeof response.content === "string"
            ? response.content
            : "Learning plan could not be generated. Please try again.",
        };
      }

      for (const toolCall of response.tool_calls) {
        const tool = tools.find(t => t.name === toolCall.name);
        if (!tool) continue;

        try {
          console.log(`[Learning Agent] Executing tool: ${toolCall.name}`);
          const output    = await (tool as any).invoke(toolCall.args);
          const outputStr = typeof output === "string" ? output : JSON.stringify(output);

          messages.push(new ToolMessage({
            tool_call_id: toolCall.id!,
            content     : outputStr,
          }));

          if (toolCall.name === "save_learning_plan") {
            try {
              const parsed = JSON.parse(outputStr);
              console.log("[Learning Agent] ✅ Plan saved. ID:", parsed.planId);
              return { ...parsed, success: true };
            } catch {
              return { success: true, message: outputStr };
            }
          }

        } catch (toolError) {
          console.error(`[Learning Agent] Tool error (${toolCall.name}):`, toolError);
          messages.push(new ToolMessage({
            tool_call_id: toolCall.id!,
            content     : `Error: ${toolError instanceof Error ? toolError.message : String(toolError)}`,
          }));
        }
      }
    }

  } catch (error) {
    console.error("[Learning Agent] Critical error:", error);
    return {
      success: false,
      message: "Learning Architect encountered an error. Please try again.",
      error  : String(error),
    };
  }
}