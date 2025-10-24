# Vercel Deployment Fix - Environment Variables

## Required Environment Variables

Add these environment variables to your Vercel project settings:

1. **MONGODB_URI**: Your MongoDB connection string
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/database`

2. **FRONTEND_URL**: Your Vercel domain
   - Example: `https://oneclickfolio-new.vercel.app`

3. **NODE_ENV**: Set to `production`

4. **GOOGLE_AI_API_KEY**: Your Google AI API key (if using AI features)

5. **EMAIL_SERVICE_API_KEY**: Your email service key (if using email features)

## How to Add Environment Variables in Vercel:

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable with the appropriate value
5. Redeploy your project

## Fixed Issues:

1. ✅ **API Routes**: Restructured API routes for Vercel serverless functions
2. ✅ **Dependencies**: Added server dependencies to root package.json
3. ✅ **CORS**: Updated CORS configuration for your domain
4. ✅ **Database**: Added proper MongoDB connection handling
5. ✅ **Vercel Config**: Simplified vercel.json configuration

## Next Steps:

1. Add the environment variables to Vercel
2. Redeploy your project
3. Test the login functionality

The login should now work properly!
