import { prisma } from "@/lib/prisma";
import { model } from "@/lib/gemini"; // Your Gemini 3 Flash config
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";

// Store conversation history in memory (for non-registered users)
// Key: phone number, Value: array of messages
const conversationMemory = new Map<string, Array<{ role: string; content: string }>>();

// Track users who opted out of bot (want direct contact with Abhishek)
// Key: phone number, Value: { timestamp, reason }
const optedOutUsers = new Map<string, { timestamp: number; reason: string }>();

// Admin phone number to receive notifications
const ADMIN_PHONE = "+918417875526"; // Replace with your actual phone number

export async function POST(req: Request) {
    const { phone, text, pushname } = await req.json();

    const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;
    console.log("Sales inquiry from:", formattedPhone, text, pushname);

    // Get or initialize conversation history for this user
    if (!conversationMemory.has(formattedPhone)) {
        conversationMemory.set(formattedPhone, []);
    }
    const history = conversationMemory.get(formattedPhone)!;

    // Check if user wants to opt out of bot and talk directly to Abhishek
    const wantsDirectContact = checkIfWantsDirectContact(text);
    
    if (wantsDirectContact) {
        console.log("🚫 User wants direct contact with Abhishek - stopping bot");
        
        // Mark this user as opted out (store in a separate Map)
        optedOutUsers.set(formattedPhone, {
            timestamp: Date.now(),
            reason: "direct_contact_requested"
        });
        
        // Send acknowledgment and notify admin immediately
        const ackMessage = "Got it! I'll have Abhishek reach out to you directly. Give him a few minutes.";
        
        await fetch("http://localhost:4000/send-message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                phone: phone,
                message: ackMessage
            })
        });
        
        // Notify admin immediately
        await notifyAdminDirectContact(formattedPhone, pushname, text);
        
        return Response.json({ success: true, optedOut: true });
    }
    
    // Check if user wants to re-enable bot
    const wantsBotBack = checkIfWantsBotBack(text);
    
    if (wantsBotBack && optedOutUsers.has(formattedPhone)) {
        console.log("✅ User wants bot back - re-enabling");
        optedOutUsers.delete(formattedPhone);
        
        const welcomeBack = "Sure! I'm back. What can I help you with?";
        await fetch("http://localhost:4000/send-message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                phone: phone,
                message: welcomeBack
            })
        });
        
        return Response.json({ success: true, botReEnabled: true });
    }
    
    // If user is opted out, don't send bot messages (Abhishek handles it)
    if (optedOutUsers.has(formattedPhone)) {
        console.log("⏸️  User opted out - not sending bot response");
        return Response.json({ success: true, optedOut: true });
    }

    // Get or initialize conversation history for this user
    if (!conversationMemory.has(formattedPhone)) {
        conversationMemory.set(formattedPhone, []);
    }
    // Conversational Assistant System Prompt
    const systemPrompt = `You're chatting on behalf of Abhishek from HelloCoders.in. Chat like a normal person would - curious, helpful, no agenda.

YOUR VIBE:
- You're just having a conversation, not selling anything
- Actually curious about what they're building
- Ask follow-up questions to understand better
- Share ideas and suggestions naturally
- Listen more than you talk

GREETING (IMPORTANT):
When someone says "Hi" or first contacts you, introduce yourself properly:
"Hey! I'm Abhishek's assistant from HelloCoders. What can I help you with?"
OR
"Hi! This is Abhishek's assistant. What's up?"
OR
"Hey there! I handle inquiries for Abhishek at HelloCoders. What brings you here?"

Make it clear you're representing Abhishek, but keep it casual and natural.

HOW YOU CHAT:
- Like texting a friend who happens to know web dev
- Short messages (1-2 lines)
- Use "I", "we", "us" naturally
- Ask "why" and "what for" - understand the PURPOSE
- No sales talk, no urgency, no pushy vibes

CONVERSATION FLOW (natural, not scripted):
- After greeting, actually understand what they want to build
- Ask about their users/customers - who's this for?
- Understand the problem they're solving
- Share ideas: "Oh you could do it like this... or maybe this way?"
- Listen to their concerns/doubts - they might have better ideas
- Discuss features naturally: "What about payments? Need that?"
- Budget/timeline comes up naturally, don't force it

EXAMPLES OF GOOD RESPONSES:
User: "I need a website"
You: "Cool! What's it for?"

User: "For my restaurant"
You: "Nice! You thinking like a menu showcase or full online ordering?"

User: "Online ordering"
You: "Makes sense. Do customers usually order for pickup or delivery or both?"

User: "Both"
You: "Got it. You'll probably want payment integration then. UPI/cards?"

User: "Yes"
You: "What about tracking orders? Like showing 'preparing', 'out for delivery' etc?"

User: "Oh yeah that would be good"
You: "Cool, so basically order + payment + tracking. When were you hoping to launch this?"

WHEN TO MENTION ABHISHEK:
- After you both figured out what needs to be built
- When they seem clear on requirements
- When they ask technical questions you can't answer
- Natural transition: "Want me to get Abhishek on a call? He can probably explain the technical stuff better"

DON'T:
- Rush to ask budget
- Push for calls too early
- Sound like customer service
- Use phrases like "May I", "I'd be happy to", "Let me assist you"
- Give long explanations - just have a conversation

RED FLAGS (low priority, just chat):
- Super vague ("just checking")
- No clear project idea
- Just asking prices without context
→ Still be helpful, just share info naturally

GREEN FLAGS (understand fully, then suggest call):
- Clear project idea
- Knows their users/problem
- Asks specific questions
- Engaged in the conversation
- Mentions budget/timeline naturally

YOUR GOAL: Understand what they actually need, help them think it through, THEN connect them with Abhishek when it makes sense.

You're not trying to qualify leads - you're just being helpful and curious.

Their name: ${pushname || "there"}`;

    // Build conversation context
    const messages = [
        new SystemMessage(systemPrompt),
        ...history.map((m) =>
            m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content)
        ),
        new HumanMessage(text)
    ];

    // Get AI response
    const aiResponse = await model.invoke(messages);
    const replyText = aiResponse.content.toString();
    console.log("Sales agent response:", replyText);

    // Save to memory
    history.push({ role: "user", content: text });
    history.push({ role: "assistant", content: replyText });

    // Keep only last 10 messages to prevent memory overflow
    if (history.length > 10) {
        conversationMemory.set(formattedPhone, history.slice(-10));
    }

    // Check if we need to notify admin (lead qualification)
    const shouldNotifyAdmin = await checkIfQualifiedLead(history, text, replyText);
    
    if (shouldNotifyAdmin) {
        await notifyAdmin(formattedPhone, pushname, history);
    }

    // Send reply back to WhatsApp
    try {
        const sendResponse = await fetch("http://localhost:4000/send-message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                phone: phone, // Use original phone without country code
                message: replyText 
            })
        });

        const sendResult = await sendResponse.json();
        if (!sendResult.success) {
            console.error("Failed to send message:", sendResult.error);
        }
    } catch (sendError) {
        console.error("Error sending message to WhatsApp:", sendError);
    }

    return Response.json({ success: true, qualified: shouldNotifyAdmin });
}

// Helper: Check if lead is qualified and ready for admin notification
async function checkIfQualifiedLead(
    history: Array<{ role: string; content: string }>,
    latestUserMessage: string,
    latestAiResponse: string
): Promise<boolean> {
    // Only notify after substantial conversation (at least 10+ messages)
    if (history.length < 10) return false;
    
    const conversationText = history.map(m => m.content).join(" ").toLowerCase();
    const userMessages = history.filter(m => m.role === "user").map(m => m.content.toLowerCase()).join(" ");
    
    // Check if they've discussed requirements in depth
    const hasDetailedDiscussion = history.length >= 12; // At least 6 back-and-forth exchanges
    
    // Check if project scope is clear
    const hasProjectType = /website|app|ecommerce|web|mobile|design|development|software|platform|landing.*page|portal/i.test(conversationText);
    
    // Check if they've discussed features/functionality (not just "I need a website")
    const discussedFeatures = /payment|login|database|admin|dashboard|api|integration|tracking|notification|cart|checkout|profile|search/i.test(conversationText);
    
    // Check if timeline was naturally discussed
    const hasTimeline = /deadline|timeline|when|urgent|asap|week|month|days?|launch|need.*by|ready.*by/i.test(conversationText);
    
    // Check if budget was naturally discussed (not pushed)
    const hasBudget = /budget|price|cost|\$|₹|rupees|rs\.?\s*\d+|thousand|lakh|k\s|15k|50k|lac|affordable|expensive/i.test(conversationText);
    
    // Check if AI suggested connecting with Abhishek and user responded positively
    const aiSuggestedCall = /abhishek|call|chat|connect|talk.*him|discuss.*him/i.test(latestAiResponse.toLowerCase());
    const userAgreed = /yes|sure|yeah|okay|sounds good|let'?s|when|cool|perfect|great|that.*work/i.test(latestUserMessage.toLowerCase());
    
    // Check engagement level - multiple questions from user shows serious interest
    const userQuestionCount = (userMessages.match(/\?/g) || []).length;
    const highEngagement = userQuestionCount >= 2;
    
    // Qualified if:
    // 1. Had detailed discussion (12+ messages)
    // 2. Project type is clear
    // 3. Discussed actual features/functionality
    // 4. Either timeline OR budget came up naturally
    // 5. User is engaged (asking questions)
    // 6. AI suggested call AND user agreed
    
    const isQualified = hasDetailedDiscussion 
                     && hasProjectType 
                     && discussedFeatures 
                     && (hasTimeline || hasBudget)
                     && highEngagement
                     && aiSuggestedCall 
                     && userAgreed;
    
    console.log('Lead Qualification Check:', {
        messageCount: history.length,
        hasDetailedDiscussion,
        hasProjectType,
        discussedFeatures,
        hasTimeline,
        hasBudget,
        highEngagement,
        aiSuggestedCall,
        userAgreed,
        isQualified
    });
    
    return isQualified;
}

// Helper: Send notification to admin about qualified lead
async function notifyAdmin(
    clientPhone: string,
    clientName: string,
    history: Array<{ role: string; content: string }>
) {
    // Format the conversation naturally
    const conversationLog = history
        .map((m, i) => {
            const speaker = m.role === "user" ? clientName || "Client" : "Assistant";
            return `${speaker}: ${m.content}`;
        })
        .join("\n\n");

    const adminMessage = `🔥 QUALIFIED LEAD - They're Ready!

👤 ${clientName || "Client"}
📞 ${clientPhone}

💬 Full Conversation:
${conversationLog.slice(0, 600)}${conversationLog.length > 600 ? "\n\n...[conversation continued]" : ""}

⏰ ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour: '2-digit', minute: '2-digit' })}

✅ They understand what they need. Call them now!`;

    try {
        await fetch("http://localhost:4000/send-message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                phone: ADMIN_PHONE.replace("+", ""), // Remove + for consistency
                message: adminMessage 
            })
        });
        console.log("✅ Admin notified about qualified lead");
    } catch (error) {
        console.error("❌ Failed to notify admin:", error);
    }
}

// Optional: Cleanup old conversations periodically (run every hour)
setInterval(() => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    // This is a simple implementation; in production, store timestamps with each conversation
    if (conversationMemory.size > 100) {
        console.log("🧹 Cleaning up old conversations...");
        // Keep only the 50 most recent conversations
        const entries = Array.from(conversationMemory.entries());
        conversationMemory.clear();
        entries.slice(-50).forEach(([phone, history]) => {
            conversationMemory.set(phone, history);
        });
    }
    
    // Clean up opted-out users after 24 hours (auto re-enable bot)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    for (const [phone, data] of optedOutUsers.entries()) {
        if (data.timestamp < oneDayAgo) {
            console.log(`🔄 Auto re-enabling bot for ${phone} after 24h`);
            optedOutUsers.delete(phone);
        }
    }
}, 60 * 60 * 1000);

// Helper: Check if user wants to stop bot and talk directly to Abhishek
function checkIfWantsDirectContact(message: string): boolean {
    const lowerMsg = message.toLowerCase().trim();
    
    // Direct opt-out phrases
    const optOutPhrases = [
        /don'?t\s*(message|text|msg|reply)/i,
        /stop\s*(messaging|texting|replying|the bot|this)/i,
        /just\s*(want|need).*talk.*abhishek/i,
        /want.*speak.*abhishek/i,
        /connect.*me.*abhishek/i,
        /talk.*abhishek.*directly/i,
        /i'?ll\s*wait.*abhishek/i,
        /call\s*me\s*directly/i,
        /no\s*(bot|assistant|auto)/i,
        /want.*real\s*person/i,
        /abhishek.*only/i,
        /stop.*bot/i,
        /disable.*bot/i,
        /turn.*off/i,
        /pause.*this/i
    ];
    
    return optOutPhrases.some(pattern => pattern.test(lowerMsg));
}

// Helper: Check if user wants bot to resume
function checkIfWantsBotBack(message: string): boolean {
    const lowerMsg = message.toLowerCase().trim();
    
    const reEnablePhrases = [
        /start.*again/i,
        /resume/i,
        /continue/i,
        /enable.*bot/i,
        /turn.*on/i,
        /bot.*back/i,
        /assistant.*back/i,
        /help\s*me/i,
        /i.*need.*help/i,
        /quick.*question/i,
        /can\s*you/i
    ];
    
    return reEnablePhrases.some(pattern => pattern.test(lowerMsg));
}

// Helper: Notify admin when user requests direct contact
async function notifyAdminDirectContact(
    clientPhone: string,
    clientName: string,
    message: string
) {
    const adminMessage = `🔴 DIRECT CONTACT REQUEST

👤 ${clientName || "Client"}
📞 ${clientPhone}

💬 Their message:
"${message}"

⚠️ They asked to stop the bot and talk to you directly.
📞 Call them ASAP!

⏰ ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour: '2-digit', minute: '2-digit' })}`;

    try {
        await fetch("http://localhost:4000/send-message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                phone: ADMIN_PHONE.replace("+", ""), 
                message: adminMessage 
            })
        });
        console.log("✅ Admin notified about direct contact request");
    } catch (error) {
        console.error("❌ Failed to notify admin:", error);
    }
}