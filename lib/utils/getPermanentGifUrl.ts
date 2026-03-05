export const getPermanentGifUrl = (exerciseId: string) => {
    const apiKey = process.env.EXERCISE_DB_API_KEY;
    return `https://exercisedb.p.rapidapi.com/image?exerciseId=${exerciseId}&resolution=360&rapidapi-key=${apiKey}`;
};