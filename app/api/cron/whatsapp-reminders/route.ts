import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendInteractiveWhatsAppReminder, getWhatsAppProvider } from '@/services/whatsapp';
import { getGlobalWhatsappStatus } from '@/app/action';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  // 1. Security Check (Only allow the cron provider to call this)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // 1.5 Global Toggle Check
  const isGlobalEnabled = await getGlobalWhatsappStatus();
  if (!isGlobalEnabled) {
    return NextResponse.json({ success: true, processed: 0, message: "WhatsApp reminders are globally disabled." });
  }

  try {
    const now = new Date();
    const fiveMinsFromNow = new Date(now.getTime() + 5 * 60000);

    // 2. Find todos due in the next 5 minutes for users with WhatsApp enabled
    const todos = await prisma.todo.findMany({
      where: {
        reminderTime: { lte: fiveMinsFromNow, gte: now },
        whatsappNotified: false,
        completed: false,
        user: {
          whatsappEnabled: true,
          phone: { not: null },
        }
      },
      include: {
        user: {
          select: {
            phone: true,
            name: true,
          }
        }
      }
    });

    // 3. Send interactive notifications and Update status
    const results = [];
    for (const todo of todos) {
      if (todo?.user?.phone) {
        try {
          const provider = await getWhatsAppProvider();
          
          await sendInteractiveWhatsAppReminder(
            todo.user.phone,
            todo.task,
            todo.user.name || 'User',
            todo.id,
            provider
          );

          await prisma.todo.update({
            where: { id: todo.id },
            data: { whatsappNotified: true }
          });
          results.push({ id: todo.id, status: 'success' });
        } catch (error) {
          console.error(`Failed to send interactive WhatsApp to ${todo.user.phone}:`, error);
          results.push({ id: todo.id, status: 'error', error: String(error) });
        }
      }
    }

    return NextResponse.json({
      success: true,
      processed: todos.length,
      results
    });
  } catch (error: any) {
    console.error('Cron error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}