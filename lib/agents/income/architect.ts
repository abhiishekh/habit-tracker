
import { model } from "@/lib/gemini";
import { invokeWithFallback } from "../llm-router";
import { HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import { saveIncomePlanTool, researchOpportunitiesTool } from "./tools";

export async function runIncomeArchitect(
  userId: string,
  userGoal: string,
  context?: { profession?: string; skills?: string[]; currentIncome?: number }
) {
  const tools = [researchOpportunitiesTool, saveIncomePlanTool(userId)];

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

  let messages: any[] = [
    new SystemMessage(systemPrompt),
    new HumanMessage("Create my personalized income generation plan.")
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

      console.log(`[Income Architect] API Request ${totalRequests} successful. Took ${endTime - startTime}ms. Tokens: ${tokensThisRequest} (Total Session: ${totalTokensUsed})`);

      messages.push(response);

      if (!response.tool_calls || response.tool_calls.length === 0) {
        const content = typeof response.content === "string" ? response.content : "";
        if (content.toLowerCase().includes("week") || content.toLowerCase().includes("step") || content.toLowerCase().includes("income")) {
          return {
            success: true,
            message: content,
            isMarkdownPlan: true,
            stats: { totalRequests, totalTokensUsed }
          };
        }
        return {
          success: false,
          message: content || "Income plan could not be generated.",
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

          if (toolCall.name === "save_income_plan") {
            try {
              const parsed = JSON.parse(outputStr);
              return { ...parsed, success: true, stats: { totalRequests, totalTokensUsed } };
            } catch {
              return { success: true, message: outputStr, stats: { totalRequests, totalTokensUsed } };
            }
          }
        } catch (toolError) {
          console.error(`--- [Income Agent] Tool error:`, toolError);
          messages.push(new ToolMessage({
            tool_call_id: toolCall.id!,
            content: `Error: ${toolError instanceof Error ? toolError.message : String(toolError)}`
          }));
        }
      }
    }
  } catch (error) {
    console.error("Income Architect Error:", error);
    return {
      success: false,
      message: "Income Strategist encountered an error. Please try again.",
      stats: { totalRequests, totalTokensUsed }
    };
  }

  return {
    success: false,
    message: "Max iterations reached without finalizing income plan.",
    stats: { totalRequests, totalTokensUsed }
  };
}
