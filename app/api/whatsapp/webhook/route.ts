import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import twilio from 'twilio';
import { getGlobalWhatsappStatus } from '@/app/action';

// Twilio signature validation (optional but recommended for production)
const authToken = process.env.TWILIO_AUTH_TOKEN!;

export async function POST(request: Request) {
    try {
        // Check Global Toggle
        const isGlobalEnabled = await getGlobalWhatsappStatus();
        if (!isGlobalEnabled) {
            return new Response('WhatsApp reminders are globally disabled.', { status: 200 });
        }

        const formData = await request.formData();
        const body = formData.get('Body')?.toString().trim().toUpperCase();
        const from = formData.get('From')?.toString(); // Format: whatsapp:+91XXXXXXXXXX
        const phone = from?.replace('whatsapp:', '');

        console.log(`Received WhatsApp reply from ${phone}: ${body}`);

        if (!phone || !body) {
            return new Response('Invalid request', { status: 400 });
        }

        // Find the user by phone
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { phone: phone },
                    { phone: phone.replace('+', '') },
                    { phone: `+${phone}` }
                ]
            }
        });

        if (!user) {
            console.error(`User not found for phone: ${phone}`);
            return new Response('User not found', { status: 404 });
        }

        // Find the most recent uncompleted todo that was notified
        // Note: In a production app, you might want to track which todoId was sent in the session
        const lastTodo = await prisma.todo.findFirst({
            where: {
                userId: user.id,
                whatsappNotified: true,
                completed: false
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        if (!lastTodo) {
            return new Response('No pending todo found', { status: 200 });
        }

        let responseMessage = '';

        if (body === '1' || body.includes('YES')) {
            await prisma.todo.update({
                where: { id: lastTodo.id },
                data: { completed: true, completedAt: new Date() }
            });
            responseMessage = `Awesome job, ${user.name || 'there'}! ✅ Todo "${lastTodo.task}" marked as completed. Keep it up!`;
        }
        else if (body === '3' || body.includes('LATER')) {
            const newTime = new Date(Date.now() + 30 * 60000); // 30 mins later
            await prisma.todo.update({
                where: { id: lastTodo.id },
                data: {
                    reminderTime: newTime,
                    whatsappNotified: false // Allow it to be notified again
                }
            });
            responseMessage = `Understood! 🕒 I'll remind you about "${lastTodo.task}" again in 30 minutes.`;
        }
        else if (body === '2' || body.includes('NO')) {
            responseMessage = `No problem! 👊 Focus on your work, I'm here if you need anything else.`;
        }
        else {
            responseMessage = `Sorry, I didn't quite get that. Please reply with 1 (YES), 2 (NO), or 3 (LATER).`;
        }

        // Respond to Twilio
        const twiml = new twilio.twiml.MessagingResponse();
        twiml.message(responseMessage);

        return new Response(twiml.toString(), {
            headers: { 'Content-Type': 'text/xml' }
        });

    } catch (error) {
        console.error('Webhook error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
