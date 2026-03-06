"use server"

import { model } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function generateGoalTasks(goal: string, situation: string, timeline: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Unauthorized");

    const prompt = `
    You are an AI life coach and productivity expert. 
    A user wants to achieve the following goal: "${goal}"
    Their current situation is: "${situation}"
    Their timeline is: "${timeline}"

    Please break this goal down into 5-7 actionable, specific, and professional tasks that the user can add to their todo list to make immediate progress.
    
    Format your response as a valid JSON array of objects. Each object MUST have these properties:
    - "task": (string) A clear, actionable description of the task.
    - "category": (string) A relevant category (e.g., "Planning", "Research", "Action", "Setup").
    
    Constraints:
    - Respond ONLY with the JSON array.
    - Do not include any introductory or concluding text.
    - Ensure the JSON is valid and properly escaped.
  `;

    try {
        const response = await model.invoke(prompt);
        const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);

        // Handle potential markdown code blocks in Gemini's response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            console.error("No JSON array found in response:", content);
            throw new Error("Failed to parse AI response. No JSON found.");
        }

        const tasks = JSON.parse(jsonMatch[0]);
        return tasks;
    } catch (error) {
        console.error("AI Generation Error:", error);
        throw new Error("Failed to generate goal plan. Please try again later.");
    }
}

export async function addAiTasksToTodos(tasks: { task: string; category?: string }[]) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) throw new Error("User not found");

    const today = new Date();
    today.setHours(9, 0, 0, 0); // Default to 9 AM today

    const data = tasks.map((t) => ({
        userId: user.id,
        task: t.task,
        category: t.category || "AI Assistant",
        reminderTime: today,
    }));

    return await prisma.todo.createMany({
        data,
    });
}
