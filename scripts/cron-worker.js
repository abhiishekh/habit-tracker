
import cron from "node-cron"
import axios from "axios";

const NEXT_JS_API = 'http://localhost:3000/api/cron/morning-briefing';
const CRON_SECRET = 'tC3osPMn74n0IpH663Gcl93cRCozcRnnV1edOSGyEiC0='; // Must match your .env

/**
 * Schedule: 'Minute Hour DayOfMonth Month DayOfWeek'
 * '0 7 * * *' = Exactly 7:00 AM every day
 */
cron.schedule('* * * * *', async () => {
    console.log(`[${new Date().toLocaleTimeString()}] ⏰ Triggering Morning Briefing...`);

    try {
        const response = await axios.get(NEXT_JS_API, {
            params: { secret: CRON_SECRET }
        });
        console.log('✅ Briefing Triggered:', response.data.message);
    } catch (error) {
        console.error('❌ Cron Trigger Failed:', error.response?.data || error.message);
    }
}, {
    scheduled: true,
    timezone: "Asia/Kolkata" // Set to your local time (Varanasi/IST)
});

console.log('🚀 UFL Cron Worker started. Running on Asia/Kolkata time.');