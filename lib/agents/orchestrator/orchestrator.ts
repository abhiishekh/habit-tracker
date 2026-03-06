// lib/agents/orchestrator/orchestrator.ts


import { HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import { classifyGoalTool, saveUserProfileTool, getUserProfileTool } from "./tools";
import { runLifeArchitect } from "../gym/architect";
import { runIncomeArchitect } from "../income/architect";
import { runCareerArchitect } from "../career/architect";
import { runProjectArchitect } from "../project/architect";
import { model } from "@/lib/gemini";

export type OrchestratorResult = {
  domain: "gym" | "income" | "career" | "project" | "unknown";
  agentResult: any;
  followUpQuestions?: string[];
};

export async function runOrchestrator(
  userId: string,
  userGoal: string
): Promise<OrchestratorResult> {

  const tools = [classifyGoalTool, saveUserProfileTool, getUserProfileTool];
  const modelWithTools = model.bindTools(tools);

  const systemPrompt = `You are a Life Architect Orchestrator. Your ONLY job is to:
1. Call 'get_user_profile' to check existing user context
2. Call 'classify_goal' to understand what domain this goal belongs to
3. FINALLY, provide a raw JSON object with: { "domain": "gym"|"income"|"career"|"project", "clarifyingQuestions": [], "confidence": 0.9 }

Domains:
- "gym": weight loss, muscle gain, fitness, belly fat, workout, diet
- "income": earn money, freelance, side hustle, salary increase, 1 lakh, passive income
- "career": job switch, promotion, resume, interview, LinkedIn, new job
- "project": build app, create website, side project, startup, launch product

CRITICAL: Always call classify_goal. If user context is missing (weight/profession), 
include relevant clarifyingQuestions in your response. Ensure the FINAL response is ONLY the JSON object.`;

  const messages: any[] = [
    new SystemMessage(systemPrompt),
    new HumanMessage(`User ID: "${userId}"\nUser Goal: "${userGoal}".\n\nClassify this and check if I need more info.`)
  ];

  try {
    let classificationResult: any = null;
    let response = await modelWithTools.invoke(messages);

    let iterations = 0;
    const MAX_ITERATIONS = 5;

    // Agentic Loop: Handle tool calls until the model provides a final text response
    while (response.tool_calls && response.tool_calls.length > 0 && iterations < MAX_ITERATIONS) {
      iterations++;
      messages.push(response);

      for (const toolCall of response.tool_calls) {
        const tool = tools.find(t => t.name === toolCall.name);
        if (tool) {
          const output = await (tool as any).invoke(toolCall.args);
          const outputStr = typeof output === "string" ? output : JSON.stringify(output);

          messages.push(new ToolMessage({
            tool_call_id: toolCall.id!,
            content: outputStr
          }));

          if (toolCall.name === "classify_goal") {
            try {
              classificationResult = JSON.parse(outputStr);
            } catch {
              classificationResult = { domain: outputStr };
            }
          }
        }
      }

      // Get next response from AI
      response = await modelWithTools.invoke(messages);
    }

    const content = typeof response.content === "string"
      ? response.content
      : JSON.stringify(response.content);

    console.log("--- [Orchestrator] Final AI Content:", content);

    let finalJson: any = {};
    try {
      // Robust JSON extraction
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const cleanedJson = jsonMatch[0].replace(/```json|```/g, "").trim();
        finalJson = JSON.parse(cleanedJson);
      } else {
        finalJson = classificationResult || { domain: "unknown" };
      }
    } catch (e) {
      console.warn("JSON Parse Error in Orchestrator:", e);
      finalJson = classificationResult || { domain: "unknown" };
    }

    const domain = finalJson.domain || classificationResult?.domain || "unknown";

    // Route to the correct specialist agent
    let agentResult: any;

    switch (domain) {
      case "gym":
        // Check if we have enough context to run the gym agent directly
        // We look for weight, height, experience in the user profile or recent classification
        const userProfile = classificationResult?.userProfile || {};
        const gymContext = {
          weight: userProfile.weight || 70, // Default if not found, though better to ask
          height: userProfile.height || 170,
          experience: userProfile.experience || "beginner"
        };

        // If we have explicit context from the UI or classification, use it
        agentResult = await runLifeArchitect(userId, userGoal, gymContext);
        break;
      case "income":
        agentResult = await runIncomeArchitect(userId, userGoal);
        break;
      case "career":
        agentResult = await runCareerArchitect(userId, userGoal);
        break;
      case "project":
        agentResult = await runProjectArchitect(userId, userGoal);
        break;
      default:
        agentResult = {
          message: "I couldn't classify your goal. Could you be more specific?",
          domain: "unknown"
        };
    }

    return {
      domain,
      agentResult,
      followUpQuestions: finalJson.clarifyingQuestions || []
    };

  } catch (error) {
    console.error("Orchestrator Error:", error);
    return {
      domain: "unknown",
      agentResult: { error: String(error) }
    };
  }
}