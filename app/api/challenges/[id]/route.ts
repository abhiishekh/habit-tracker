import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const challengeId = id;

        // Verify ownership
        const challenge = await prisma.challenge.findUnique({
            where: { id: challengeId, userId }
        });

        if (!challenge) {
            return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
        }

        await prisma.challenge.delete({
            where: { id: challengeId }
        });

        return NextResponse.json({ message: "Challenge deleted successfully" });
    } catch (error) {
        console.error("Error deleting challenge:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
