// lib/agents/income/architect.ts

import { HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import { saveIncomePlanTool, researchOpportunitiesTool } from "./tools";
import { geminiModel } from "@/lib/gemini";

export async function runIncomeArchitect(
  userId: string,
  userGoal: string,
  context?: { profession?: string; skills?: string[]; currentIncome?: number }
) {
  const tools = [researchOpportunitiesTool, saveIncomePlanTool(userId)];
  const modelWithTools = geminiModel.bindTools(tools);

  const systemPrompt = `You are a Senior Financial Coach and Income Strategist.
User Goal: ${userGoal}
User Context: ${JSON.stringify(context || {})}
Current Date: ${new Date().toLocaleDateString()}

MISSION:
1. Call 'research_opportunities' to find relevant income paths for the user's skills/profession
2. Create a realistic 30-day income action plan broken into weekly sprints
3. Call 'save_income_plan' to persist the plan with daily/weekly tasks
4. Each task must have: action, expectedOutcome, timeRequired (hours), priority (1-5)

IMPORTANT:
- Be SPECIFIC. Don't say "apply for freelance jobs" — say "Post on Upwork with these exact keywords..."
- Include realistic income targets per week
- Factor in the user's current skills and profession`;

  const messages: any[] = [
    new SystemMessage(systemPrompt),
    new HumanMessage("Create my personalized income generation plan.")
  ];

  let iterations = 0;
  const MAX_ITERATIONS = 5;

  while (iterations < MAX_ITERATIONS) {
    iterations++;
    const response = await modelWithTools.invoke(messages);
    messages.push(response);

    if (!response.tool_calls || response.tool_calls.length === 0) {
      const content = typeof response.content === "string" ? response.content : "";
      if (content.toLowerCase().includes("week") || content.toLowerCase().includes("step")) {
        return { success: true, message: content, isMarkdownPlan: true };
      }
      return { success: false, message: content || "Income plan could not be generated." };
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

      if (toolCall.name === "save_income_plan") {
        try {
          return { ...JSON.parse(outputStr), success: true };
        } catch {
          return { success: true, message: outputStr };
        }
      }
    }
  }
}