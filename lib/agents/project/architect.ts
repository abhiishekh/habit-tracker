import { invokeWithFallback } from "../llm-router";
import { HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import { analyzeProjectTool, saveProjectTimelineTool } from "./tools";

export async function runProjectArchitect(
  userId: string,
  projectDescription: string,
  context?: { techStack?: string; experience?: string; hoursPerDay?: number }
) {
  const tools = [analyzeProjectTool, saveProjectTimelineTool(userId)];

  const systemPrompt = `You are a Senior Software Architect and Project Manager.
Project Description: ${projectDescription}
Developer Context: ${JSON.stringify(context || {})}
Current Date: ${new Date().toLocaleDateString()}
 
MISSION:
1. Call 'analyze_project' to break down scope, features, and complexity
2. Create a realistic timeline — the MORE detail in the description, the MORE granular the timeline
3. Call 'save_project_timeline' with phases, milestones, and daily tasks
4. Include: tech stack recommendation, MVP scope, phase breakdown

RULES:
- If description is vague (< 50 words): Create high-level 3-phase plan
- If description is detailed (> 50 words): Create day-by-day granular tasks
- Always define what MVP (Minimum Viable Product) looks like
- Flag risks and blockers proactively`;

  let messages: any[] = [
    new SystemMessage(systemPrompt),
    new HumanMessage(`Plan my project: "${projectDescription}"`)
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

      console.log(`[Project Architect] API Request ${totalRequests} successful. Took ${endTime - startTime}ms. Tokens: ${tokensThisRequest} (Total Session: ${totalTokensUsed})`);

      messages.push(response);

      if (!response.tool_calls || response.tool_calls.length === 0) {
        const content = typeof response.content === "string" ? response.content : "";
        if (content.toLowerCase().includes("phase") || content.toLowerCase().includes("mvp")) {
          return {
            success: true,
            message: content,
            isMarkdownPlan: true,
            stats: { totalRequests, totalTokensUsed }
          };
        }
        return {
          success: false,
          message: content || "Project plan could not be generated.",
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
            content: outputStr
          }));

          if (toolCall.name === "save_project_timeline") {
            try {
              const parsed = JSON.parse(outputStr);
              return { ...parsed, success: true, stats: { totalRequests, totalTokensUsed } };
            } catch {
              return { success: true, message: outputStr, stats: { totalRequests, totalTokensUsed } };
            }
          }
        } catch (toolError) {
          console.error(`--- [Project Agent] Tool error:`, toolError);
          messages.push(new ToolMessage({
            tool_call_id: toolCall.id!,
            content: `Error: ${toolError instanceof Error ? toolError.message : String(toolError)}`
          }));
        }
      }
    }
  } catch (error) {
    console.error("Project Architect Error:", error);
    return {
      success: false,
      message: "Project Architect encountered an error. Please try again.",
      stats: { totalRequests, totalTokensUsed }
    };
  }

  return {
    success: false,
    message: "Max iterations reached without finalizing project plan.",
    stats: { totalRequests, totalTokensUsed }
  };
}