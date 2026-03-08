import { invokeWithFallback } from "../llm-router";
import { SystemMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
import { saveNetworkingPlanTool } from "./tools";

export async function runNetworkingArchitect(
    userId: string,
    userGoal: string,
    context?: {
        currentNetwork?: string;
        targetIndustry?: string;
        preferredPlatforms?: string[];
    }
) {
    const tools = [saveNetworkingPlanTool(userId)];

    const missionPrompt = `You are a World-Class Networking Strategist and Career Connector.
User Goal    : ${userGoal}
User Context : ${JSON.stringify(context || {})}
Current Date : ${new Date().toLocaleDateString()}

MISSION:
1. Design a comprehensive networking strategy
2. Structure it as a 4-WEEK plan with daily actionable TASKS
3. Cover outreach, follow-ups, platform optimization, and events

OUTPUT STRUCTURE:
You MUST call 'save_networking_plan' with this structure:
- goal (string), strategy (optional)
- weeks: array of { weekNumber, focus, tasks: [{ dayNumber, title, description, platform }] }
- Each week should have 5-7 tasks
- platform options: "LinkedIn", "Twitter", "Email", "Events", "Other"

RULES:
- Be AGGRESSIVE and PRACTICAL — suggest direct outreach methods
- Include outreach scripts and follow-up protocols
- Tasks must be daily actions with measurable outcomes

CRITICAL: You MUST call 'save_networking_plan' to finalise.
Responding with text only will NOT save anything.`;

    let messages: any[] = [
        new SystemMessage(missionPrompt),
        new HumanMessage("Create my master networking plan to reach my goals.")
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

            console.log(`[Networking Architect] API Request ${totalRequests} successful. Took ${endTime - startTime}ms. Tokens: ${tokensThisRequest} (Total Session: ${totalTokensUsed})`);

            messages.push(response);

            if (!response.tool_calls || response.tool_calls.length === 0) {
                const content = typeof response.content === "string" ? response.content : "";
                if (content.toLowerCase().includes("week") || content.toLowerCase().includes("outreach")) {
                    return {
                        success: true,
                        message: content,
                        isMarkdownPlan: true,
                        stats: { totalRequests, totalTokensUsed }
                    };
                }
                return {
                    success: false,
                    message: content || "Networking plan could not be generated.",
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

                    if (toolCall.name === "save_networking_plan") {
                        try {
                            const parsed = JSON.parse(outputStr);
                            return { ...parsed, success: true, stats: { totalRequests, totalTokensUsed } };
                        } catch {
                            return { success: true, message: outputStr, stats: { totalRequests, totalTokensUsed } };
                        }
                    }

                } catch (toolError) {
                    console.error(`[Networking Agent] Tool error (${toolCall.name}):`, toolError);
                    messages.push(new ToolMessage({
                        tool_call_id: toolCall.id!,
                        content: `Error: ${toolError instanceof Error ? toolError.message : String(toolError)}`,
                    }));
                }
            }
        }
    } catch (error) {
        console.error("[Networking Agent] Critical error:", error);
        return {
            success: false,
            message: "Networking Architect encountered an error. Please try again.",
            error: String(error),
        };
    }

    return {
        success: false,
        message: "Max iterations reached without finalizing networking plan.",
        stats: { totalRequests, totalTokensUsed }
    };
}
