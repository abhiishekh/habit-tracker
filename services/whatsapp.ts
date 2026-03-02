

export async function sendWhatsAppReminder(userPhone: any, taskName: any) {
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