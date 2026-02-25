export async function fetchTodayStats() {
    const apiKey = process.env.WAKATIME_API
    if (!apiKey) {
        return "API Key Missing"
    }
    // 1. Base64 Encode your API Key
    const encodedKey = Buffer.from(apiKey).toString('base64');

    // 2. Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    const url = `https://wakatime.com/api/v1/users/current/summaries?start=${today}&end=${today}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${encodedKey}`
            }
        });

        const data = await response.json();
        const dayData = data.data[0];

        // This gives you total time in a human-readable format (e.g., "3 hrs 20 mins")
        const totalTime = data.cumulative_total.text;
        const totalSeconds = data.cumulative_total.seconds;

        console.log(`Today's Progress: ${totalTime}`);
        // return data;
        return {
            totalTime: dayData.grand_total.text,
            projects: dayData.projects,   // Array of {name, total_seconds, text}
            languages: dayData.languages, // Array of {name, total_seconds, text}
            categories: dayData.categories // e.g., "Coding", "Meeting", "Debugging"
        };
    } catch (error) {
        console.error("Error fetching WakaTime data:", error);
    }
}