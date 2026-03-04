import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

// Centralized Gemini model configuration
export const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  maxOutputTokens: 2048,
  apiKey: process.env.GOOGLE_API_KEY,
  temperature: 0.7, // Slightly creative for fitness planning
});