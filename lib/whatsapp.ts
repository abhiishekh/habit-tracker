export async function sendWhatsAppNotification(phone: string, message: string) {
  try {
    const response = await fetch('http://localhost:4000/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, message }),
    });
    return await response.json();
  } catch (error) {
    console.error("WhatsApp Bridge unreachable. Is the local server running?");
    return { success: false };
  }
}