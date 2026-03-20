import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import twilio from 'twilio';
import { getGlobalWhatsappStatus } from '@/app/action';

// Twilio signature validation (optional but recommended for production)
const authToken = process.env.TWILIO_AUTH_TOKEN!;

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
        return new Response(challenge, { status: 200 });
    }
    return new Response('Forbidden', { status: 403 });
}

export async function POST(request: Request) {
    try {
        // Check Global Toggle
        const isGlobalEnabled = await getGlobalWhatsappStatus();
        if (!isGlobalEnabled) {
            return new Response('WhatsApp reminders are globally disabled.', { status: 200 });
        }

        const contentType = request.headers.get('content-type') || '';
        let phone = '';
        let body = '';
        let buttonPayload = '';

        if (contentType.includes('application/json')) {
            // Meta (WhatsApp Business API)
            const json = await request.json();
            const message = json.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
            
            if (!message) return new Response('No message found', { status: 200 });

            phone = message.from; // format: 91XXXXXXXXXX
            if (message.type === 'interactive' && message.interactive?.type === 'button_reply') {
                buttonPayload = message.interactive.button_reply.id;
                body = message.interactive.button_reply.title.toUpperCase();
            } else if (message.type === 'text') {
                body = message.text.body.trim().toUpperCase();
            }
        } else {
            // Twilio (Form Data)
            const formData = await request.formData();
            body = formData.get('Body')?.toString().trim().toUpperCase() || '';
            const from = formData.get('From')?.toString(); // Format: whatsapp:+91XXXXXXXXXX
            phone = from?.replace('whatsapp:', '') || '';
        }

        console.log(`Received WhatsApp reply from ${phone}: ${body} (Payload: ${buttonPayload})`);

        if (!phone || (!body && !buttonPayload)) {
            return new Response('Invalid request', { status: 400 });
        }

        // Find the user by phone
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { phone: phone },
                    { phone: phone.replace('+', '') },
                    { phone: `+${phone}` },
                    { phone: phone.startsWith('91') ? `+${phone}` : phone }
                ]
            }
        });

        if (!user) {
            console.error(`User not found for phone: ${phone}`);
            return new Response('User not found', { status: 404 });
        }

        let targetTodoId = '';
        if (buttonPayload) {
            if (buttonPayload.startsWith('DONE_')) targetTodoId = buttonPayload.replace('DONE_', '');
            if (buttonPayload.startsWith('LATER_')) targetTodoId = buttonPayload.replace('LATER_', '');
        }

        let todo;
        if (targetTodoId) {
            todo = await prisma.todo.findUnique({ where: { id: targetTodoId } });
        } else {
            // Fallback to last notified todo
            todo = await prisma.todo.findFirst({
                where: {
                    userId: user.id,
                    whatsappNotified: true,
                    completed: false
                },
                orderBy: { updatedAt: 'desc' }
            });
        }

        if (!todo) {
            return new Response('No pending todo found', { status: 200 });
        }

        let responseMessage = '';

        if (buttonPayload.startsWith('DONE_') || body === '1' || body.includes('DONE') || body.includes('YES')) {
            await prisma.todo.update({
                where: { id: todo.id },
                data: { completed: true, completedAt: new Date() }
            });
            responseMessage = `Awesome job, ${user.name || 'there'}! ✅ Todo "${todo.task}" marked as completed. Keep it up!`;
        }
        else if (buttonPayload.startsWith('LATER_') || body === '3' || body.includes('LATER')) {
            const newTime = new Date(Date.now() + 30 * 60000); // 30 mins later
            await prisma.todo.update({
                where: { id: todo.id },
                data: {
                    reminderTime: newTime,
                    whatsappNotified: false
                }
            });
            responseMessage = `Understood! 🕒 I'll remind you about "${todo.task}" again in 30 minutes.`;
        }
        else if (body === '2' || body.includes('NO')) {
            responseMessage = `No problem! 👊 Focus on your work, I'm here if you need anything else.`;
        }
        else {
            responseMessage = `Sorry, I didn't quite get that. Please use the buttons or reply with 1 (YES), 2 (NO), or 3 (LATER).`;
        }

        // Response handling
        if (contentType.includes('application/json')) {
            // For Meta, we typically send a message back via API, not via the webhook response body
            // But we can respond with 200 OK
            return new Response('OK', { status: 200 });
        } else {
            // Respond to Twilio
            const twiml = new twilio.twiml.MessagingResponse();
            twiml.message(responseMessage);
            return new Response(twiml.toString(), {
                headers: { 'Content-Type': 'text/xml' }
            });
        }

    } catch (error) {
        console.error('Webhook error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
