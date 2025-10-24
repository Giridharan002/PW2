import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("🚨 Missing GEMINI_API_KEY in .env file");
}

const genAI = new GoogleGenerativeAI(apiKey);

// ✅ Use gemini-2.5-flash (available with this API key)
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const GeminiAIService = {
  async generateContent(prompt) {
    try {
      console.log('🤖 Generating content with Gemini AI...');
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log('✅ Gemini AI successfully generated content.');
      return {
        response: {
          text: () => text
        }
      };
    } catch (error) {
      console.error("❌ Gemini AI Error:", error);
      throw error;
    }
  },
};

// Export instance as default
export default GeminiAIService;
