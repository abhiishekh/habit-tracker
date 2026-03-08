// lib/agents/career/architect.ts

import { model } from "@/lib/gemini";

import { invokeWithFallback } from "../llm-router";
import { HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import { researchJobMarketTool, saveCareerPlanTool } from "./tools";

export async function runCareerArchitect(
  userId: string,
  userGoal: string,
  context?: {
    currentRole?: string;
    targetRole?: string;
    yearsOfExperience?: number;
    currentSkills?: string[];
    targetCompany?: string;
    hoursPerWeek?: number;
  }
) {
  const tools = [researchJobMarketTool, saveCareerPlanTool(userId)];

  const systemPrompt = `You are a Senior Career Coach and HR Strategist with 15+ years of experience.
User Goal: ${userGoal}
User Context: ${JSON.stringify(context || {})}
Current Date: ${new Date().toLocaleDateString()}
 
MISSION:
1. Call 'research_job_market' to understand what skills/certifications are needed for the target role
2. Analyze the GAP between current role/skills and target role
3. Call 'save_career_plan' with a realistic week-by-week milestone plan
4. Each milestone must have specific, actionable tasks — not vague advice

PLAN STRUCTURE RULES:
- Week 1-2: Self assessment + gap analysis + LinkedIn/resume audit
- Week 3-6: Skill building (courses, projects, certifications)
- Week 7-10: Portfolio building + networking + applications
- Week 11+: Interview prep + negotiation strategy

IMPORTANT:
- Be HYPER SPECIFIC. Don't say "improve your resume" — say "Add 3 quantified achievements to each role using the XYZ format"
- Include platform recommendations (LinkedIn, Naukri, Wellfound, etc.)
- If targetCompany is provided, tailor the entire plan around that company's hiring process
- Consider Indian job market if no location context is given (user is from India based on goal language)`;

  let messages: any[] = [
    new SystemMessage(systemPrompt),
    new HumanMessage("Create my personalized career switch roadmap with actionable weekly milestones.")
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

      console.log(`[Career Architect] API Request ${totalRequests} successful. Took ${endTime - startTime}ms. Tokens: ${tokensThisRequest} (Total Session: ${totalTokensUsed})`);

      messages.push(response);

      if (!response.tool_calls || response.tool_calls.length === 0) {
        const content = typeof response.content === "string" ? response.content : "";
        if (content.toLowerCase().includes("week") || content.toLowerCase().includes("milestone")) {
          return {
            success: true,
            message: content,
            isMarkdownPlan: true,
            stats: { totalRequests, totalTokensUsed }
          };
        }
        return {
          success: false,
          message: content || "Career plan could not be generated.",
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

          if (toolCall.name === "save_career_plan") {
            try {
              const parsed = JSON.parse(outputStr);
              return { ...parsed, success: true, stats: { totalRequests, totalTokensUsed } };
            } catch {
              return { success: true, message: outputStr, stats: { totalRequests, totalTokensUsed } };
            }
          }
        } catch (toolError) {
          console.error(`--- [Career Agent] Tool error:`, toolError);
          messages.push(new ToolMessage({
            tool_call_id: toolCall.id!,
            content: `Error: ${toolError instanceof Error ? toolError.message : String(toolError)}`
          }));
        }
      }
    }
  } catch (error) {
    console.error("Career Architect Error:", error);
    return {
      success: false,
      message: "Career Coach encountered an error. Please try again.",
      stats: { totalRequests, totalTokensUsed }
    };
  }

  return {
    success: false,
    message: "Max iterations reached without finalizing career plan.",
    stats: { totalRequests, totalTokensUsed }
  };
}
