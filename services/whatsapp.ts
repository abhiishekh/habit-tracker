import twilio from 'twilio';
import axios from 'axios';


const META_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const META_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_WHATSAPP_FROM;

const client = twilio(accountSid, authToken);


export async function sendWhatsAppReminderMeta(userPhone: any, taskName: any) {
  const response = await fetch(
    `https://graph.facebook.com/v21.0/${process.env.WA_PHONE_NUMBER_ID}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WA_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: userPhone,
        type: "template",
        template: {
          name: "task_reminder",
          language: { code: "en" },
          components: [{
            type: "body",
            parameters: [{ type: "text", text: taskName }]
          }]
        }
      }),
    }
  );
  return response.json();
}

export async function sendWhatsAppReminderTwilio(to: string, taskName: string) {
  try {
    const message = await client.messages.create({
      body: `⏰ Habit Reminder: Don't forget to "${taskName}" today!`,
      from: fromPhone,
      to: `whatsapp:${to}` // Twilio requires the 'whatsapp:' prefix
    });

    return { success: true, sid: message.sid };
  } catch (error) {
    console.error('WhatsApp Error:', error);
    throw new Error('Failed to send WhatsApp reminder');
  }
}

export async function sendWhatsAppReminder(to: string, taskName: string, provider: 'meta' | 'twilio' = 'meta') {
  if (provider === 'meta') {
    try {
      // Meta requires a specific format: 91XXXXXXXXXX (no +)
      const formattedPhone = to.replace('+', '');

      return await axios.post(
        `https://graph.facebook.com/v21.0/${META_PHONE_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'template',
          template: {
            name: 'task_reminder', // Ensure this matches your approved Meta template
            language: { code: 'en_US' },
            components: [
              {
                type: 'body',
                parameters: [{ type: 'text', text: taskName }]
              }
            ]
          }
        },
        { headers: { Authorization: `Bearer ${META_TOKEN}` } }
      );
    } catch (error) {
      console.error('Meta API failed, falling back to Twilio...');
      // Optional: Automatic fallback to Twilio if Meta fails
      return sendTwilioMessage(to, taskName);
    }
  } else {
    return sendTwilioMessage(to, taskName);
  }
}

async function sendTwilioMessage(to: string, taskName: string) {
  return client.messages.create({
    body: `⏰ Habit Reminder: ${taskName}`,
    from: process.env.TWILIO_WHATSAPP_FROM,
    to: `whatsapp:${to.startsWith('+') ? to : '+' + to}`
  });
}

export async function sendInteractiveWhatsAppReminder(
  to: string,
  taskName: string,
  userName: string,
  todoId: string,
  provider: 'meta' | 'twilio' = 'twilio'
) {
  const message = `Hey ${userName}! 🌟\n\nYour todo "${taskName}" is about to end. Have you completed it yet?\n\nReply with:\n1️⃣ YES (to mark as done)\n2️⃣ NO (to keep it pending)\n3️⃣ LATER (remind in 30 mins)`;

  if (provider === 'meta') {
    // Meta implementation would ideally use a Template with Buttons
    // For now, using the fallback logic similar to sendWhatsAppReminder
    return sendWhatsAppReminder(to, message, 'meta');
  } else {
    // Twilio implementation
    try {
      const result = await client.messages.create({
        body: message,
        from: fromPhone,
        to: `whatsapp:${to.startsWith('+') ? to : '+' + to}`
      });
      return { success: true, sid: result.sid };
    } catch (error) {
      console.error('Twilio Interactive Error:', error);
      throw error;
    }
  }
}