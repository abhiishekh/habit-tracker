import { sendMorningBriefing } from "@/lib/briefing";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // 1. Security Check
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Business Logic
  try {
    // You can fetch all users with 7am wakeup time here
    // For now, testing with your specific phone
    await sendMorningBriefing("699df15f40bbd872a0413530", "916386640595");
    
    return NextResponse.json({ success: true, message: "Messages sent to Bridge" });
  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}