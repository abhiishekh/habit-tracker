import { prisma } from "@/lib/prisma";

export async function sendMorningBriefing(userId: string, phone: string) {
  // 1. Get current day (e.g., "Monday")
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  // 2. Fetch the active plan and today's workout
  const workoutPlan = await prisma.workoutPlan.findFirst({
    where: { 
        userId: userId, 
        isActive: true 
    },
    include: {
      workouts: {
        where: { dayOfWeek: today },
        include: { exercises: true }
      }
    }
  });

  // 3. Handle Rest Days
  if (!workoutPlan || workoutPlan.workouts.length === 0) {
    const restMsg = `🌅 *Good morning Abhishek!* \n\nToday is a *Rest & Recovery* day. Focus on your nutrition and hit your protein goals! 🥗`;
    return await callWhatsappBridge(phone, restMsg);
  }

  const workout = workoutPlan.workouts[0];

  // 4. Format the Workout Message
  let message = `🚀 *UFL DAILY BRIEFING: ${today.toUpperCase()}* 🚀\n\n`;
  message += `Today's Focus: *${workout.focus}*\n`;
  message += `----------------------------\n\n`;

  workout.exercises.forEach((ex, i) => {
    message += `${i + 1}. *${ex.name}*\n`;
    message += `   ∟ ${ex.sets} sets x ${ex.reps} reps\n`;
  });

  message += `\n*Note:* Reply 'DONE' once you finish the session to update your 90-day progress! 💪`;

  // 5. Send to Bridge
  return await callWhatsappBridge(phone, message);
}

/**
 * Helper to talk to your Bridge running on Port 4000
 */
async function callWhatsappBridge(phone: string, message: string) {
    try {
        const response = await fetch("http://localhost:4000/send-message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone, message }),
        });
        return await response.json();
    } catch (error) {
        console.error("Bridge Error:", error);
        return { success: false, error: "Bridge unreachable" };
    }
}