// lib/agents/career/architect.ts


import { HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import { researchJobMarketTool, saveCareerPlanTool } from "./tools";
import { geminiModel } from "@/lib/gemini";

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
  const modelWithTools = geminiModel.bindTools(tools);

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

  const messages: any[] = [
    new SystemMessage(systemPrompt),
    new HumanMessage("Create my personalized career switch roadmap with actionable weekly milestones.")
  ];

  try {
    let iterations = 0;
    const MAX_ITERATIONS = 5;

    while (iterations < MAX_ITERATIONS) {
      iterations++;
      const response = await modelWithTools.invoke(messages);
      messages.push(response);

      if (!response.tool_calls || response.tool_calls.length === 0) {
        const content = typeof response.content === "string" ? response.content : "";
        if (content.toLowerCase().includes("week") || content.toLowerCase().includes("milestone")) {
          return { success: true, message: content, isMarkdownPlan: true };
        }
        return {
          success: false,
          message: content || "Career plan could not be generated. Please try again."
        };
      }

      for (const toolCall of response.tool_calls) {
        const tool = tools.find(t => t.name === toolCall.name);
        if (!tool) continue;

        try {
          const output = await (tool as any).invoke(toolCall.args);
          const outputStr = typeof output === "string" ? output : JSON.stringify(output);

          console.log(`--- [Career Agent] Tool: ${toolCall.name} Output:`, outputStr.substring(0, 300));

          messages.push(new ToolMessage({
            tool_call_id: toolCall.id!,
            content: outputStr
          }));

          if (toolCall.name === "save_career_plan") {
            try {
              const parsed = JSON.parse(outputStr);
              return { ...parsed, success: true };
            } catch {
              return { success: true, message: outputStr };
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
      error: String(error)
    };
  }
}