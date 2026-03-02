import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWhatsAppReminder } from '@/services/whatsapp';

export async function GET(request: { headers: { get: (arg0: string) => any; }; }) {
  // 1. Security Check (Only allow the cron provider to call this)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const now = new Date();
    const fiveMinsFromNow = new Date(now.getTime() + 5 * 60000);

    // 2. Find tasks due in the next 5 minutes
    const tasks = await prisma.todo.findMany({
      where: {
        reminderTime: { lte: fiveMinsFromNow, gte: now },
        whatsappNotified: false,
      }
    });

    // 3. Send and Update
    for (const task of tasks) {
      await sendWhatsAppReminder("8417875526", task.task);
      await prisma.todo.update({
        where: { id: task.id },
        data: { whatsappNotified: true }
      });
    }

    return NextResponse.json({ success: true, processed: tasks.length });
  } catch (error:any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}