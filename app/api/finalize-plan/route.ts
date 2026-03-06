import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { model } from '@/lib/gemini';
import { z } from 'zod';

const extractSchema = z.object({
    goal: z.string(),
    workouts: z.array(z.object({
        dayOfWeek: z.string(),
        focus: z.string(),
        exercises: z.array(z.object({
            exerciseId: z.string(),
            name: z.string(),
            sets: z.coerce.number(),
            reps: z.coerce.number(),
            weight: z.coerce.number().optional().default(0),
            gifUrl: z.string().optional().default(""),
            notes: z.string().optional().default(""),
        }))
    }))
});

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { content, goal } = await req.json();

        const prompt = `
      You are a world-class Data Analyst.
      Extract a structured 7-day gym workout plan from the AI Coach text analysis provided below.
      
      TEXT: "${content}"
      GOAL: "${goal}"
      
      CRITICAL: You MUST respond with ONLY a valid, minified JSON object. No markdown, no backticks, no preamble.
      
      JSON Structure:
      {
        "goal": "string",
        "workouts": [
          {
            "dayOfWeek": "string",
            "focus": "string",
            "exercises": [
              { 
            "exerciseId": "string",
            "name": "string", 
            "sets": number, 
            "reps": number, 
            "weight": number, 
            "gifUrl": "string", 
            "notes": "string" 
            }
            ]
          }
        ]
      }
      
      Constraints:
      1. Ensure every property name is in double quotes.
      2. Ensure all arrays and objects are properly closed.
      3. Use 0 for unknown weights and "" for unknown GIFs.
      4. Keep 'notes' under 15 words.
      5. DO NOT use trailing commas.
    `;


        const response = await model.invoke(prompt);
        let text = typeof response.content === 'string' ? response.content : "";

        // Improved JSON cleaning: find the first { and the last }
        const startIdx = text.indexOf('{');
        const endIdx = text.lastIndexOf('}');

        if (startIdx === -1 || endIdx === -1 || startIdx > endIdx) {
            console.error("AI Response for Finalization (No JSON):", text);
            throw new Error("The AI provided an analysis but failed to create a structured database plan. Try a more specific goal.");
        }

        const jsonStr = text.substring(startIdx, endIdx + 1);

        let extractedData;
        try {
            // Pre-process: fix common trailing commas or minor syntax issues
            let cleanedStr = jsonStr.replace(/,\s*([\]}])/g, '$1');
            // Fix missing commas between objects/arrays: }{ -> }, { or ][ -> ], [
            cleanedStr = cleanedStr.replace(/}\s*{/g, '}, {').replace(/\]\s*\[/g, '], [');
            extractedData = JSON.parse(cleanedStr);

        } catch (parseError) {
            console.error("JSON Parse Error at position:", (parseError as any).message);
            // Log a larger chunk around the error if possible
            console.error("Faulty JSON structure around failure:", jsonStr.substring(0, 2000));
            throw new Error("Finalization failed: The AI's plan was malformed. Please try a simpler goal.");
        }


        const validated = extractSchema.parse(extractedData);


        // Save to Database
        const plan = await prisma.workoutPlan.create({
            data: {
                userId: session.user.id,
                goal: validated.goal,
                weekNumber: 1,
                startDate: new Date(),
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                workouts: {
                    create: validated.workouts.map(w => ({
                        dayOfWeek: w.dayOfWeek,
                        focus: w.focus,
                        exercises: {
                            create: w.exercises.map(e => ({
                                exerciseId: e.exerciseId,
                                name: e.name,
                                sets: e.sets,
                                reps: e.reps,
                                weight: e.weight || 0,
                                gifUrl: e.gifUrl || "",
                                notes: e.notes || ""
                            }))
                        }
                    }))
                }
            }
        });

        return NextResponse.json({ success: true, planId: plan.id });

    } catch (error: any) {
        console.error("Finalize Plan Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
