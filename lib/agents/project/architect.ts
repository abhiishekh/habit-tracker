// lib/agents/project/architect.ts

import { HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import { analyzeProjectTool, saveProjectTimelineTool } from "./tools";
import { model } from "@/lib/gemini";

export async function runProjectArchitect(
  userId: string,
  projectDescription: string,
  context?: { techStack?: string; experience?: string; hoursPerDay?: number }
) {
  const tools = [analyzeProjectTool, saveProjectTimelineTool(userId)];
  const modelWithTools = model.bindTools(tools);

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

  const messages: any[] = [
    new SystemMessage(systemPrompt),
    new HumanMessage(`Plan my project: "${projectDescription}"`)
  ];

  let iterations = 0;
  const MAX_ITERATIONS = 5;

  while (iterations < MAX_ITERATIONS) {
    iterations++;
    const response = await modelWithTools.invoke(messages);
    messages.push(response);

    if (!response.tool_calls || response.tool_calls.length === 0) {
      const content = typeof response.content === "string" ? response.content : "";
      if (content.toLowerCase().includes("phase") || content.toLowerCase().includes("mvp")) {
        return { success: true, message: content, isMarkdownPlan: true };
      }
      return { success: false, message: content || "Project plan could not be generated." };
    }

    for (const toolCall of response.tool_calls) {
      const tool = tools.find(t => t.name === toolCall.name);
      if (!tool) continue;

      const output = await (tool as any).invoke(toolCall.args);
      const outputStr = typeof output === "string" ? output : JSON.stringify(output);

      messages.push(new ToolMessage({
        tool_call_id: toolCall.id!,
        content: outputStr
      }));

      if (toolCall.name === "save_project_timeline") {
        try {
          return { ...JSON.parse(outputStr), success: true };
        } catch {
          return { success: true, message: outputStr };
        }
      }
    }
  }
}