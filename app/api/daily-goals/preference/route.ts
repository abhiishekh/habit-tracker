import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userId = session.user.id;
        const { wakeUpTime } = await req.json();

        if (!wakeUpTime || !/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(wakeUpTime)) {
            return NextResponse.json(
                { error: "Invalid wake-up time format" },
                { status: 400 }
            );
        }

        await prisma.userProfile.upsert({
            where: { userId },
            update: { wakeUpTime },
            create: { userId, wakeUpTime }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("[Daily Goals Preference API] Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
