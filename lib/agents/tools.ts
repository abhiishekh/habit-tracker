import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import axios from "axios";

export const exerciseResearcherTool = new DynamicStructuredTool({
  name: "exercise_researcher",
  description: "Searches for specific exercises based on target muscles or body parts.",
  schema: z.object({
    bodyPart: z.string().describe("The body part to target (e.g., 'abs', 'chest', 'back')"),
  }),
  func: async ({ bodyPart }) => {
    try {
      const options = {
        method: 'GET',
        url: `https://exercisedb.p_rapidapi.com/exercises/bodyPart/${bodyPart}`,
        headers: {
          'x-rapidapi-key': process.env.EXERCISE_DB_API_KEY,
          'x-rapidapi-host': 'exercisedb.p.rapidapi.com'
        }
      };
      const response = await axios.request(options);
      // Return only the top 5 results to keep the AI's context window clean
      return JSON.stringify(response.data.slice(0, 5));
    } catch (error) {
      return "Could not fetch exercise data.";
    }
  },
});