import axios from 'axios'
import mongoose from 'mongoose'

const MONGO_URI = "mongodb://localhost:27017/fitness"; // change if needed
const API_KEY = "ffbb6c561fmshc138706afca11b5p166fc1jsn83780d5fa575";

async function importExercises() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB Connected");

        const Exercise = mongoose.model(
            "Exercise",
            new mongoose.Schema({}, { strict: false }),
            "exercises"
        );

        // 🧹 Delete old exercises
        await Exercise.deleteMany({});
        console.log("Old exercises deleted");

        // 📡 Fetch exercises
        const response = await axios.get(
            "https://exercisedb.p.rapidapi.com/exercises?limit=2000",
            {
                headers: {
                    "x-rapidapi-key": API_KEY,
                    "x-rapidapi-host": "exercisedb.p.rapidapi.com",
                },
            }
        );

        const exercises = response.data;

        // 🧠 Format data
        const formatted = exercises.map((ex) => ({
            exerciseId: ex.id,
            name: ex.name,
            bodyPart: ex.bodyPart,
            equipment: ex.equipment,
            target: ex.target,
            secondaryMuscles: ex.secondaryMuscles,
            instructions: ex.instructions,
            description: ex.description,
            difficulty: ex.difficulty || "unknown",
            category: ex.category || "strength",

            // ✅ Correct GIF source
            gifUrl: `https://v2.exercisedb.io/image/${ex.id}`,
        }));

        // 📥 Insert new exercises
        await Exercise.insertMany(formatted);

        console.log(`Inserted ${formatted.length} exercises`);

        process.exit();
    } catch (err) {
        console.error("Import error:", err);
        process.exit(1);
    }
}
async function fetchExercises() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB Connected");

        const Exercise = mongoose.model(
            "Exercise",
            new mongoose.Schema({}, { strict: false }),
            "exercises" // collection name
        );

        // Fetch 3 exercises for testing
        const exercises = await Exercise.find().limit(3);

        console.log("Exercises from DB:");
        console.log(exercises);

        process.exit();

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

importExercises();
// fetchExercises();