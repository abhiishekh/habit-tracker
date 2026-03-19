import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { phone } = await req.json();

        if (!phone) {
            return Response.json({ error: "Phone number required" }, { status: 400 });
        }

        const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;

        // Check if user exists in database
        const user = await prisma.user.findFirst({
            where: { phone: formattedPhone }
        });

        return Response.json({
            registered: !!user,
            userId: user?.id || null
        });
    } catch (error) {
        console.error("Error checking user registration:", error);
        return Response.json(
            { error: "Internal server error", registered: false },
            { status: 500 }
        );
    }
}