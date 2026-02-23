# Groq API Setup Guide

## Issue Resolved ✅
Your Gemini API key was **suspended by Google**. We've successfully migrated to **Groq API**.

## Why Groq? 🚀
- ✅ **Free tier available** - No billing issues
- ✅ **Faster inference** - Better performance than Gemini
- ✅ **Reliable** - Better uptime for portfolio generation
- ✅ **Same functionality** - Handles your resume parsing perfectly

## Setup Steps

### 1. Get Your Groq API Key
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Navigate to **API Keys** section
4. Click **Create API Key**
5. Copy the generated key (keep it safe!)

### 2. Update Your .env File
Update `server/.env`:
```dotenv
PORT=5000
MONGODB_URI=mongodb+srv://giri:2004@cluster0.zou1ky3.mongodb.net/portfolio-generator
GROQ_API_KEY=your-groq-api-key-here
NODE_ENV=development
```

Replace `your-groq-api-key-here` with your actual Groq API key from step 1.

### 3. Restart Your Server
```bash
cd server
npm start
```

### 4. Test the API
Once the server is running, test it:
```bash
curl http://localhost:5000/api/portfolio/test-api
```

You should see:
```json
{
  "success": true,
  "message": "API key is valid!",
  "aiResponse": "API key works perfectly!"
}
```

## Files Updated
- ✅ `server/utils/groqAI.js` - New Groq service
- ✅ `server/routes/portfolio.js` - Uses Groq instead of Gemini
- ✅ `server/utils/dynamicDataExtractor.js` - Uses Groq
- ✅ `server/routes/portfolio_backup.js` - Uses Groq
- ✅ `server/package.json` - Added groq-sdk dependency
- ✅ `server/.env` - Replaced GEMINI_API_KEY with GROQ_API_KEY

## Groq API Models Available
We're using `mixtral-8x7b-32768` - a fast, capable model perfect for resume parsing.

Other available models:
- `llama2-70b-4096` - Larger model, more capable
- `gemma-7b-it` - Smaller, faster model

## Troubleshooting

### API Key Invalid Error
- Verify your key is copied correctly (no spaces)
- Make sure you're in the Groq console (not GitHub or other platforms)
- Try generating a new key

### Rate Limiting
- Groq free tier has generous limits suitable for personal projects
- If you hit limits, upgrade to a paid plan

### Still Getting 500 Errors?
1. Check server logs for error messages
2. Verify GROQ_API_KEY is in your .env file
3. Restart the server
4. Check if the API key is valid using the test endpoint

---
**Your portfolio generator is now powered by Groq! 🎉**
