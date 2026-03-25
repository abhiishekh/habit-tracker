import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendMetaTextMessage } from '@/services/whatsapp';
import { getGlobalWhatsappStatus } from '@/app/action';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  console.log("🚀 [Cron] WhatsApp Test Started...");

  // 1. Security Check Debugging
  // const authHeader = request.headers.get('authorization');
  // console.log("Header received:", authHeader);
  // console.log("Expected Secret:", `Bearer ${process.env.CRON_SECRET}`);

  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   console.error("❌ [Cron] Unauthorized access attempt!");
  //   return new Response('Unauthorized', { status: 401 });
  // }

  // 1.5 Global Toggle Debugging
  const isGlobalEnabled = await getGlobalWhatsappStatus();
  console.log("Global WhatsApp Enabled:", isGlobalEnabled);

  if (!isGlobalEnabled) {
    return NextResponse.json({ success: true, message: "Disabled globally." });
  }

  try {
    // 2. Database User Check
    const users = await prisma.user.findMany({
      where: {
        whatsappEnabled: true,
        phone: { not: null }, // Empty string भी चेक करें
      }
    });

    console.log(`👤 Found ${users.length} users with WhatsApp enabled.`);

    if (users.length === 0) {
      return NextResponse.json({ success: true, message: "No eligible users found in DB." });
    }

    const results = [];
    for (const user of users) {
      console.log(`📤 Attempting to send to: ${user.name} (${user.phone})`);

      try {
        const response = await sendMetaTextMessage(
          user.phone!,
          `Hello ${user.name || 'User'}! Test Cron 🚀`
        );
        console.log(`✅ Message sent to ${user.phone}. Response:`, response);
        results.push({ id: user.id, status: 'success' });
      } catch (error: any) {
        console.error(`❌ Meta Send Error for ${user.phone}:`, error.message);
        results.push({ id: user.id, status: 'error' });
      }
    }

    return NextResponse.json({ success: true, results });

  } catch (error: any) {
    console.error('🔥 Heavy Cron Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}