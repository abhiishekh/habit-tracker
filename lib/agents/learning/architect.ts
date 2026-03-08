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

import { invokeWithFallback } from "../llm-router";
import { SystemMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
import { saveLearningRoadmapTool } from "./tools";

export async function runLearningArchitect(
  userId: string,
  userGoal: string,
  context?: {
    currentLevel?: string;   // "beginner" | "intermediate" | "advanced"
    hoursPerDay?: number;
    preferredStyle?: string;   // "video" | "reading" | "projects" | "mixed"
    targetDate?: string;
    existingSkills?: string[];
  }
) {
  const tools = [saveLearningRoadmapTool(userId)];

  const missionPrompt = `You are a World-Class Learning Architect and Instructional Designer.
User Goal    : ${userGoal}
User Context : ${JSON.stringify(context || {})}
Current Date : ${new Date().toLocaleDateString()}

MISSION:
1. Break the learning goal into specific, ordered skills to acquire
2. Structure it as a multi-WEEK plan with daily actionable TASKS
3. Define a capstone project that combines all skills learned

OUTPUT STRUCTURE:
You MUST call 'save_learning_plan' with this structure:
- goal (string), strategy (optional), capstoneProject (optional)
- weeks: array of { weekNumber, focus, tasks: [{ dayNumber, title, description, resource }] }
- Each week should have 5-7 tasks
- resource: specific course, tutorial, or book reference for each task

RULES:
- Resources must be SPECIFIC: "freeCodeCamp React course on YouTube" not just "watch YouTube"
- Tasks must include what to learn AND how to practice
- Include checkpoints — testable tasks like "Build a todo app using X"

CRITICAL: You MUST call 'save_learning_plan' to finalise.
Responding with text only will NOT save anything.`;

  let messages: any[] = [
    new SystemMessage(missionPrompt),
    new HumanMessage("Create my complete learning roadmap.")
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

      console.log(`[Learning Architect] API Request ${totalRequests} successful. Took ${endTime - startTime}ms. Tokens: ${tokensThisRequest} (Total Session: ${totalTokensUsed})`);

      messages.push(response);

      if (!response.tool_calls || response.tool_calls.length === 0) {
        const content = typeof response.content === "string" ? response.content : "";
        if (content.toLowerCase().includes("week") || content.toLowerCase().includes("learning")) {
          return {
            success: true,
            message: content,
            isMarkdownPlan: true,
            stats: { totalRequests, totalTokensUsed }
          };
        }
        return {
          success: false,
          message: content || "Learning plan could not be generated.",
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

          if (toolCall.name === "save_learning_plan") {
            try {
              const parsed = JSON.parse(outputStr);
              return { ...parsed, success: true, stats: { totalRequests, totalTokensUsed } };
            } catch {
              return { success: true, message: outputStr, stats: { totalRequests, totalTokensUsed } };
            }
          }

        } catch (toolError) {
          console.error(`[Learning Agent] Tool error (${toolCall.name}):`, toolError);
          messages.push(new ToolMessage({
            tool_call_id: toolCall.id!,
            content: `Error: ${toolError instanceof Error ? toolError.message : String(toolError)}`,
          }));
        }
      }
    }

  } catch (error) {
    console.error("[Learning Agent] Critical error:", error);
    return {
      success: false,
      message: "Learning Architect encountered an error. Please try again.",
      error: String(error),
    };
  }

  return {
    success: false,
    message: "Max iterations reached without finalizing learning plan.",
    stats: { totalRequests, totalTokensUsed }
  };
}
