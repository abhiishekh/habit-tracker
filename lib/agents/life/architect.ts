import { invokeWithFallback } from "../llm-router";
import { HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import { saveLifePlanTool } from "./tools";

export async function runLifeArchitect(userId: string, userGoal: string, context?: any) {
    const saveTool = saveLifePlanTool(userId);
    const tools = [saveTool];

    const missionPrompt = `You are a holistic Life Architect and High-Performance Coach.
    
    USER GOAL: ${userGoal}
    CONTEXT: ${JSON.stringify(context || {})}
    Current Date: ${new Date().toLocaleDateString()}
    
    MISSION:
    Create a 4-week life transformation plan covering multiple dimensions (Health, Wealth, Relationships, Spirit, Mindset).
    
    OUTPUT STRUCTURE:
    You MUST call 'save_life_blueprint_plan' with this structure:
    - goal (string), strategy (optional)
    - weeks: array of { weekNumber, focus, tasks: [{ dayNumber, title, description, domain }] }
    - Each week should have 5-7 tasks
    - domain options: "career", "fitness", "finance", "mindset", "relationships"
    
    RULES:
    - Tasks must be practical and actionable
    - Each week should have a clear theme (Foundation, Acceleration, Optimization, Mastery)
    - Cover at least 3 life dimensions per week
    
    CRITICAL: You MUST call 'save_life_blueprint_plan' to finalize.
    `;

    let messages: any[] = [
        new SystemMessage(missionPrompt),
        new HumanMessage("Architect my life transformation plan.")
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

            console.log(`[Life Architect] API Request ${totalRequests} successful. Took ${endTime - startTime}ms. Tokens: ${tokensThisRequest} (Total Session: ${totalTokensUsed})`);

            messages.push(response);

            if (!response.tool_calls || response.tool_calls.length === 0) {
                const content = typeof response.content === "string" ? response.content : "";
                if (content.toLowerCase().includes("week") || content.toLowerCase().includes("phase")) {
                    return {
                        success: true,
                        message: content,
                        isMarkdownPlan: true,
                        stats: { totalRequests, totalTokensUsed }
                    };
                }
                return {
                    success: false,
                    message: content || "Life plan could not be generated.",
                    stats: { totalRequests, totalTokensUsed }
                };
            }

            for (const toolCall of response.tool_calls) {
                if (toolCall.name === "save_life_blueprint_plan") {
                    try {
                        const output = await saveTool.invoke(toolCall.args);
                        const outputStr = typeof output === "string" ? output : JSON.stringify(output);
                        const parsed = JSON.parse(outputStr);
                        return { ...parsed, success: true, stats: { totalRequests, totalTokensUsed } };
                    } catch (err) {
                        return { success: false, message: "Failed to save life plan tool output.", stats: { totalRequests, totalTokensUsed } };
                    }
                }

                // If AI calls other tools (none currently assigned besides saveTool, but for robustness)
                const tool = tools.find(t => t.name === toolCall.name);
                if (tool) {
                    const output = await tool.invoke(toolCall.args);
                    messages.push(new ToolMessage({
                        tool_call_id: toolCall.id!,
                        content: typeof output === "string" ? output : JSON.stringify(output),
                    }));
                }
            }
        }
    } catch (error) {
        console.error("[Life Architect] Critical error:", error);
        return {
            success: false,
            message: "Life Architect encountered an error. Please try again.",
            error: String(error),
        };
    }

    return {
        success: false,
        message: "Max iterations reached without finalizing life plan.",
        stats: { totalRequests, totalTokensUsed }
    };
}
