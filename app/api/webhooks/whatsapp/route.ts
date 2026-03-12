import { prisma } from "@/lib/prisma";
import { model } from "@/lib/gemini"; // Your Gemini 3 Flash config
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";

export async function POST(req: Request) {
    const { phone, text, pushname } = await req.json();

    // 1. Find the User in Prisma
    const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;
    console.log("ksdhkajsfdhaksf ", formattedPhone, text, pushname)
    const user = await prisma.user.findFirst({ where: { phone: formattedPhone } });
    if (!user) return Response.json({ error: "User not found" });

    // 2. Fetch last 5 messages for "Context"
    const history = await prisma.chatMessage.findMany({
        where: { userId: user.id },
        take: 5,
        orderBy: { createdAt: 'desc' }
    });

    // 3. Prompt the AI (Giving it a Role)
    const systemPrompt = `You are the UFL Life Architect. You are helping ${pushname} with their 90-day challenge. 
  Be disciplined, concise (max 2 sentences), and reference their history if relevant.`;

    const aiResponse = await model.invoke([
        new SystemMessage(systemPrompt),
        ...history.reverse().map((m: { role: string; content: string }) =>
            m.role === "user"
                ? new HumanMessage(m.content)
                : new AIMessage(m.content)
        ),
        new HumanMessage(text)
    ]);

    const replyText = aiResponse.content.toString();
    console.log("ai text is ", replyText)

    // 4. Save both messages to Memory
    await prisma.chatMessage.createMany({
        data: [
            { userId: user.id, role: "user", content: text },
            { userId: user.id, role: "assistant", content: replyText }
        ]
    });

    // 5. Tell the Bridge to send the reply back to WhatsApp
    await fetch("http://localhost:4000/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, message: replyText })
    });

    return Response.json({ success: true });
}