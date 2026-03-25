import Groq from 'groq-sdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  console.warn("⚠️ Missing GROQ_API_KEY in .env file. AI features will not work until it's set.");
}

// Initialize Groq client with proper error handling
let groq;
if (apiKey) {
  try {
    groq = new Groq({
      apiKey: apiKey,
      defaultHeaders: {
        'User-Agent': 'Portfolio-Generator/1.0'
      }
    });
    console.log('✅ Groq client initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Groq client:', error);
  }
} else {
  console.warn('⚠️ Groq client not initialized (no API key)');
}

export const GroqAIService = {
  // Model instance for backward compatibility with dynamicDataExtractor.js
  model: null,

  async generateContent(prompt) {
    try {
      console.log('🤖 Generating content with Groq AI...');

      if (!groq) {
        throw new Error("Groq client not initialized");
      }

      const modelName = process.env.GROQ_MODEL || 'meta-llama/llama-4-maverick-17b-128e-instruct';
      const message = await groq.chat.completions.create({
        model: modelName,
        max_tokens: 2048,
        temperature: 0.7,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      });

      const text = message.choices?.[0]?.message?.content || '';

      console.log('✅ Groq AI successfully generated content.');

      // Return response in same format as Gemini for compatibility
      return {
        response: {
          text: () => text
        }
      };
    } catch (error) {
      console.error("❌ Groq AI Error:", error);
      // Handle rate limit gracefully and return a structured indicator
      const status = error?.status || error?.response?.status;
      const code = error?.error?.error?.code || error?.code;
      if (status === 429 || code === 'rate_limit_exceeded') {
        const retryAfter = parseInt(error?.headers?.['retry-after'] || error?.response?.headers?.['retry-after'] || 0, 10) || 0;
        console.warn(`⚠️ Groq rate limit hit. Retry after ${retryAfter}s`);
        return { rateLimited: true, retryAfterSeconds: retryAfter };
      }
      throw error;
    }
  },

  // Support for direct model.generateContent calls from dynamicDataExtractor.js
  async setupModel() {
    return {
      generateContent: async (prompt) => {
        const result = await this.generateContent(prompt);
        return result;
      }
    };
  }
};

// Initialize model property for compatibility
GroqAIService.model = await GroqAIService.setupModel();

// Export instance as default
export default GroqAIService;
