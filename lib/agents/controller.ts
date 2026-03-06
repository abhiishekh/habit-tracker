import { model } from "../gemini";
import { createWeeklyWorkoutTool, exerciseResearcherTool } from "./gym/tools";
import { prisma } from "@/lib/prisma";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";

export async function runLifeArchitect(userId: string, userGoal: string, context: { weight: number, height: number, experience: string, refinement?: string }) {
  const writingTool = createWeeklyWorkoutTool(userId);
  const tools = [exerciseResearcherTool, writingTool];
  const modelWithTools = model.bindTools(tools);

  const missionPrompt = `You are a Senior Gym Trainer and Exercise Scientist. 
    User Context: Weight ${context.weight}kg, Height ${context.height}cm, Level: ${context.experience}.
    Goal: ${userGoal}.
    ${context.refinement ? `REFINEMENT REQUEST: ${context.refinement}` : ""}
    
    Current Date: ${new Date().toLocaleDateString()}.
    
    MISSION:
    1. Research expert exercises using 'exercise_researcher'.
    2. Use 'save_weekly_workout_plan' to create a 7-day structure.
    3. Ensure you include the 'notes' (form tips) found during research.
    4. Provide 'ourUnderstanding' and 'whyBestForGoal' justifications in the 'save_weekly_workout_plan' tool.
    5. For weights, provide only numeric values (e.g., 20) in kg. Do not add text like 'each' or 'kg'. 
    
    CRITICAL: You MUST call 'save_weekly_workout_plan' to finalize the plan in the database. 
    
    FALLBACK FORMATTING: If for any reason you cannot call the tool, you MUST provide a clean, detailed 7-day workout plan in MARKDOWN format in your text response. Include days, exercises, sets, reps, and weights.
    
    Research the exercises FIRST, then call the save tool with all the details. Always ensure the 'notes' field contains the form tips you researched.`;


  let messages: any[] = [
    new SystemMessage(missionPrompt),
    new HumanMessage(context.refinement ? "Refine my gym workout plan based on the feedback." : "Generate my expert 7-day Gym Workout Plan with exercises, sets, and reps.")
  ];

  try {
    while (true) {
      const response = await modelWithTools.invoke(messages);

      if (!response) {
        throw new Error("AI Model returned an empty response. This might be due to model service issues or safety filters.");
      }

      messages.push(response);

      console.log("AI Response Content:", response.content);
      if (response.tool_calls && response.tool_calls.length > 0) {
        console.log(`--- [Agent] AI requested ${response.tool_calls.length} tool calls ---`);
      }

      if (!response.tool_calls || response.tool_calls.length === 0) {
        console.log("--- [Agent] No more tool calls. Finalizing. ---");
        return {
          success: false,
          message: typeof response.content === 'string' ? response.content : "AI failed to finalize a structured plan.",
          justifications: {
            userWant: "Analysis in progress...",
            ourUnderstanding: typeof response.content === 'string' ? response.content : "Technical analysis was provided without tool calls.",
            whatWhyGiving: "No specific plan was saved yet.",
            whyBestForGoal: "Please try again or refine your prompt."
          }
        };
      }

      for (const toolCall of response.tool_calls) {
        const tool = tools.find(t => t.name === toolCall.name);
        if (tool) {
          console.log(`--- [Agent] Executing Tool: ${tool.name} with args:`, toolCall.args);
          try {
            const output = await (tool as any).invoke(toolCall.args);
            const outputString = typeof output === 'string' ? output : JSON.stringify(output);
            console.log(`--- [Agent] Tool ${tool.name} Output (truncated): ---`, outputString.substring(0, 300));

            messages.push(new ToolMessage({
              tool_call_id: toolCall.id!,
              content: outputString
            }));

            if (tool.name === "save_weekly_workout_plan") {
              try {
                const parsed = JSON.parse(outputString);
                console.log("--- [Agent] Successfully processed save tool. ---");
                return { ...parsed, success: true };
              } catch (e) {
                console.warn("--- [Agent] Tool output was not valid JSON, but plan might be saved. ---");
                return { success: true, message: outputString };
              }
            }
          } catch (toolError) {
            console.error(`--- [Agent] Tool ${tool.name} execution error:`, toolError);
            messages.push(new ToolMessage({
              tool_call_id: toolCall.id!,
              content: `Error: ${toolError instanceof Error ? toolError.message : String(toolError)}`
            }));
          }
        }
      }
    }
  } catch (error) {
    console.error("Critical AI Controller Error:", error);
    return {
      success: false,
      message: "The AI Coach encountered a brain freeze. This can happen with very complex requests. Try refreshing or simplifying your goal.",
      justifications: {
        userWant: "Error during generation",
        ourUnderstanding: String(error),
        whatWhyGiving: "Service interruption",
        whyBestForGoal: "Please try again."
      }
    };
  }
}
