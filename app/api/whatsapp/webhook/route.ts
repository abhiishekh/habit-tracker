import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import twilio from 'twilio';
import { getGlobalWhatsappStatus } from '@/app/action';
import { sendMetaTextMessage } from '@/services/whatsapp';

// Twilio signature validation (optional but recommended for production)
const authToken = process.env.TWILIO_AUTH_TOKEN!;

// ─── META WEBHOOK VERIFICATION ─────────────────────────────────────────────
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    // Meta sends this GET request to verify your webhook URL
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
        console.log('✅ Webhook verified successfully by Meta');
        return new Response(challenge, { status: 200 });
    }
    console.warn('❌ Webhook verification failed. Token mismatch.');
    return new Response('Forbidden', { status: 403 });
}

// ─── INCOMING MESSAGE HANDLER ──────────────────────────────────────────────
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
        let isMeta = false;

        if (contentType.includes('application/json')) {
            // ─── META (WhatsApp Business Cloud API) ────────────────────────
            isMeta = true;
            const json = await request.json();

            // Meta sends status updates (delivered, read, etc.) — ignore them
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
            // ─── TWILIO (Form Data) ────────────────────────────────────────
            const formData = await request.formData();
            body = formData.get('Body')?.toString().trim().toUpperCase() || '';
            const from = formData.get('From')?.toString(); // Format: whatsapp:+91XXXXXXXXXX
            phone = from?.replace('whatsapp:', '') || '';
        }

        console.log(`📩 Received WhatsApp reply from ${phone}: ${body} (Payload: ${buttonPayload})`);

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
            // Still reply so the user knows something is wrong
            if (isMeta) {
                try {
                    await sendMetaTextMessage(phone, "Sorry, I couldn't find your account. Please make sure your phone number is linked in the Habit Tracker app.");
                } catch (e) { /* ignore send errors for unlinked users */ }
            }
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
            const noTodoMsg = `Hey ${user.name || 'there'}! 👋 You don't have any pending todos right now. Keep up the great work!`;
            if (isMeta) {
                await sendMetaTextMessage(phone, noTodoMsg);
            }
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

        // ─── SEND REPLY BACK ───────────────────────────────────────────────
        if (isMeta) {
            // Send reply via Meta WhatsApp Cloud API
            try {
                await sendMetaTextMessage(phone, responseMessage);
                console.log(`✅ Meta reply sent to ${phone}`);
            } catch (error) {
                console.error('Failed to send Meta reply:', error);
            }
            return new Response('OK', { status: 200 });
        } else {
            // Respond to Twilio via TwiML
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
