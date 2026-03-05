import http from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = "mongodb://localhost:27017/fitness";
const API_KEY = process.env.EXERCISE_DB_API_KEY;

const getPermanentGifUrl = (exerciseId) => {
    return `https://exercisedb.p.rapidapi.com/image?exerciseId=${exerciseId}&resolution=360&rapidapi-key=${API_KEY}`;
};

async function startServer() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        const Exercise = mongoose.model(
            "Exercise",
            new mongoose.Schema({}, { strict: false }),
            "exercises"
        );

        const server = http.createServer(async (req, res) => {
            // Add CORS headers
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

            if (req.method === 'OPTIONS') {
                res.writeHead(200);
                res.end();
                return;
            }

            if (req.url === '/exercises' && req.method === 'GET') {
                try {
                    const exercises = await Exercise.find().limit(100);
                    const formatted = exercises.map(ex => ({
                        ...ex.toObject(),
                        gifUrl: `http://localhost:${PORT}/exercise-gif/${ex.exerciseId}`
                    }));
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(formatted));
                } catch (err) {
                    res.writeHead(500);
                    res.end(JSON.stringify({ error: err.message }));
                }
            } else if (req.url.startsWith('/exercise-gif/') && req.method === 'GET') {
                const exerciseId = req.url.split('/').pop();
                const url = `https://exercisedb.p.rapidapi.com/image?exerciseId=${exerciseId}&resolution=360`;

                try {
                    const proxyRes = await fetch(url, {
                        headers: {
                            'x-rapidapi-key': API_KEY,
                            'x-rapidapi-host': 'exercisedb.p.rapidapi.com'
                        }
                    });

                    if (!proxyRes.ok) throw new Error(`RapidAPI error: ${proxyRes.status}`);

                    const arrayBuffer = await proxyRes.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);

                    res.writeHead(200, { 'Content-Type': 'image/gif' });
                    res.end(buffer);
                } catch (err) {
                    console.error("GIF Proxy error:", err);
                    res.writeHead(500);
                    res.end("Proxy error");
                }
            } else {
                res.writeHead(404);
                res.end("Not Found");
            }
        });

        const PORT = 5000;
        server.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}/`);
            console.log(`Fetch exercises at http://localhost:${PORT}/exercises`);
        });

    } catch (err) {
        console.error("Connection error:", err);
    }
}

startServer();
