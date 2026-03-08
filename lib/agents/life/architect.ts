import { model } from "@/lib/gemini";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { saveLifePlanTool } from "./tools";

export async function runLifeArchitect(userId: string, userGoal: string, context?: any) {
    const saveTool = saveLifePlanTool(userId);
    const tools = [saveTool];
    const modelWithTools = model.bindTools(tools);

    const missionPrompt = `You are a holistic Life Architect and High-Performance Coach.
    
    MISSION:
    Create a 30-day (4-week) transformation roadmap covering multiple life dimensions (Health, Wealth, Relationships, Spirit, Mindset).
    
    USER GOAL: ${userGoal}
    CONTEXT: ${JSON.stringify(context || {})}
    
    DIRECTIONS:
    1. Analyze the core objective and identify the root habits or changes needed.
    2. Divide the 30 days into 4 distinct phases (e.g., Foundation, Acceleration, Optimization, Mastery).
    3. Use 'save_life_blueprint_plan' to record the roadmap.
    4. Provide exactly 2-3 high-impact tasks per week.
    5. Ensure tasks are practical and actionable.
    
    CRITICAL: You MUST call 'save_life_blueprint_plan' to finalize.
    `;

    const messages = [
        new SystemMessage(missionPrompt),
        new HumanMessage("Architect my life transformation plan.")
    ];

    try {
        let iterations = 0;
        while (iterations < 5) {
            iterations++;
            const response = await modelWithTools.invoke(messages);
            messages.push(response);

            if (!response.tool_calls || response.tool_calls.length === 0) {
                return {
                    success: true,
                    message: response.content,
                    planId: null // Tool wasn't called
                };
            }

            for (const toolCall of response.tool_calls) {
                if (toolCall.name === "save_life_blueprint_plan") {
                    const output = await saveTool.invoke(toolCall.args);
                    return JSON.parse(output);
                }
            }
        }
    } catch (error) {
        console.error("Life Architect Error:", error);
        return { success: false, message: "Architecture failed. Please try again." };
    }
}
