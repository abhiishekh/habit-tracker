import { NextRequest, NextResponse } from 'next/server';

// 1. GET: Webhook Verification (Meta Dashboard के लिए)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const WEBHOOK_VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'abcdefghijklmnopqrstuvwxyz';

  if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
    console.log("✅ Webhook Verified!");
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("📩 New Webhook Event:", JSON.stringify(body, null, 2));

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (message?.type === 'button') {
      const buttonText = message.button.text; 
      const buttonPayload = message.button.payload; 
      const from = message.from; 

      console.log(`👤 User ${from} clicked: ${buttonText}`);

      // यहाँ आप अपना Prisma Logic लिख सकते हैं:
      // if (buttonText === 'Done ✅') { updateHabitStatus(from, 'completed') }
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error) {
    console.error("❌ Webhook Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}