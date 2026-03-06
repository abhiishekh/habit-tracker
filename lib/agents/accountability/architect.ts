// lib/agents/accountability/architect.ts

import { HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import { checkTodaysTasksTool, markTaskCompleteTool, replanIfNeededTool, saveUserReactionTool } from "./tools";
import { model } from "@/lib/gemini";

export async function runAccountabilityAgent(
  userId: string,
  userFeedback?: string  // "tasks were too hard" / "completed everything" / "skipped gym"
) {
  const tools = [checkTodaysTasksTool(userId), markTaskCompleteTool, saveUserReactionTool, replanIfNeededTool(userId)];
  const modelWithTools = model.bindTools(tools);

  const systemPrompt = `You are a Supportive Accountability Coach.
Current Date: ${new Date().toLocaleDateString()}
User ID: ${userId}
${userFeedback ? `User's Feedback Today: "${userFeedback}"` : "Running daily check-in."}

MISSION:
1. Call 'check_todays_tasks' to see what was due today across ALL plans (gym/income/project)
2. Analyze completion rate
3. If user gave feedback, call 'save_user_reaction' to log sentiment + behavior pattern
4. If completion rate < 50% for 3 days: call 'replan_if_needed' to suggest easier adjustments
5. Return: { completionRate, message, streakDays, suggestions[] }

TONE: Encouraging, never shaming. Celebrate small wins. Be a coach, not a judge.`;

  const messages: any[] = [
    new SystemMessage(systemPrompt),
    new HumanMessage(userFeedback || "Run my daily accountability check-in.")
  ];

  while (true) {
    const response = await modelWithTools.invoke(messages);
    messages.push(response);

    if (!response.tool_calls || response.tool_calls.length === 0) {
      return {
        success: true,
        message: typeof response.content === "string" ? response.content : "Check-in complete!"
      };
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
    }
  }
}