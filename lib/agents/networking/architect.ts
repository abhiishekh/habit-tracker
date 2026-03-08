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
1. Design a comprehensive networking strategy to achieve the user's goal.
2. Identify high-value target audiences (people, roles, industries).
3. Create a step-by-step weekly outreach plan for 4 weeks.
4. Provide specific guidance on outreach scripts, follow-up protocols, and platform optimization.
5. Set measurable weekly targets (e.g., 10 new connections, 2 coffee chats).

RULES:
- Be AGGRESSIVE and PRACTICAL — suggest direct outreach methods, not just "be active on social media".
- Outreach scripts must be high-conversion and personalized.
- Tasks must be daily or multi-day actions.

CRITICAL: You MUST call 'save_networking_plan' to finalise.
Responding with text only will NOT save anything.`;

    let messages: any[] = [
        new SystemMessage(missionPrompt),
        new HumanMessage("Create my master networking plan to reach my goals.")
    ];

    try {
        while (true) {
            const response = await invokeWithFallback(tools, messages);
            messages.push(response);

            console.log("[Networking Agent] tool_calls:", response.tool_calls?.length ?? 0);

            if (!response.tool_calls || response.tool_calls.length === 0) {
                console.warn("[Networking Agent] No tool call — returning text response.");
                return {
                    success: false,
                    message: typeof response.content === "string"
                        ? response.content
                        : "Networking plan could not be generated. Please try again.",
                };
            }

            for (const toolCall of response.tool_calls) {
                const tool = tools.find(t => t.name === toolCall.name);
                if (!tool) continue;

                try {
                    console.log(`[Networking Agent] Executing tool: ${toolCall.name}`);
                    const output = await (tool as any).invoke(toolCall.args);
                    const outputStr = typeof output === "string" ? output : JSON.stringify(output);

                    messages.push(new ToolMessage({
                        tool_call_id: toolCall.id!,
                        content: outputStr,
                    }));

                    if (toolCall.name === "save_networking_plan") {
                        try {
                            const parsed = JSON.parse(outputStr);
                            console.log("[Networking Agent] ✅ Plan saved. ID:", parsed.planId);
                            return { ...parsed, success: true };
                        } catch {
                            return { success: true, message: outputStr };
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
}
