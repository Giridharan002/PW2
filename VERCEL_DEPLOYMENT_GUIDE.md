# OneClickFolio - Vercel Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Install Vercel CLI (if not installed)
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Set up MongoDB Atlas (Free Tier)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account and cluster
3. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/database`)
4. Whitelist all IPs (0.0.0.0/0) in Network Access for Vercel

### 4. Get Google Gemini API Key
1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key
3. Copy the key for later use

### 5. Deploy to Vercel
From the project root directory (`F:/Resume-dev`), run:

```bash
vercel
```

Follow the prompts:
- **Set up and deploy**: `Y`
- **Which scope**: Select your account
- **Link to existing project**: `N`
- **Project name**: `oneclickfolio` (or your preferred name)
- **Directory**: `./` (press Enter)
- **Override settings**: `N`

### 6. Configure Environment Variables in Vercel

After the initial deployment, add these environment variables:

```bash
# Add MongoDB URI
vercel env add MONGODB_URI

# Add Gemini API Key
vercel env add GEMINI_API_KEY

# Add Frontend URL (will be your Vercel app URL)
vercel env add FRONTEND_URL

# Add Node Environment
vercel env add NODE_ENV
```

**Values to use:**
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `GEMINI_API_KEY`: Your Google Gemini API key
- `FRONTEND_URL`: `https://your-project-name.vercel.app` (you'll get this after first deploy)
- `NODE_ENV`: `production`

**OR** Set them via Vercel Dashboard:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add the variables above

### 7. Update API Base URL (if needed)

The project is already configured to use the correct API in production. The file `src/config/api.js` automatically switches between local and production API.

However, after your first deployment, verify the API URL in `src/config/api.js` matches your Vercel deployment URL.

### 8. Redeploy with Environment Variables
```bash
vercel --prod
```

This will create a production deployment with all your environment variables.

## 📋 Environment Variables Summary

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/portfolio` |
| `GEMINI_API_KEY` | Google Gemini AI API key | `AIzaSy...` |
| `FRONTEND_URL` | Your Vercel app URL | `https://oneclickfolio.vercel.app` |
| `NODE_ENV` | Environment mode | `production` |

## 🔍 Testing Your Deployment

After deployment, test these URLs:

1. **Main App**: `https://your-app.vercel.app`
2. **Login**: `https://your-app.vercel.app/login`
3. **API Health**: `https://your-app.vercel.app/api/health` (should return JSON)
4. **Public Portfolio**: `https://your-app.vercel.app/p/any-slug`

## 🐛 Troubleshooting

### Issue: API calls failing
- Check environment variables are set in Vercel dashboard
- Verify MongoDB URI is correct and IP whitelist includes 0.0.0.0/0
- Check Vercel logs: `vercel logs`

### Issue: Build fails
- Clear cache: `vercel --force`
- Check all dependencies are in package.json
- Review build logs in Vercel dashboard

### Issue: CORS errors
- Verify FRONTEND_URL environment variable matches your Vercel URL
- Check server/index.js CORS configuration

## 🔐 Security Checklist

- ✅ MongoDB Network Access set to 0.0.0.0/0 (Vercel uses dynamic IPs)
- ✅ Environment variables set in Vercel (not committed to git)
- ✅ `.env` file in `.gitignore`
- ✅ API keys kept secret

## 📊 Custom Domain (Optional)

To add a custom domain:
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. Update `FRONTEND_URL` environment variable with your custom domain

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to your Git repository:

1. Connect to GitHub:
   ```bash
   vercel git connect
   ```

2. Push changes:
   ```bash
   git add .
   git commit -m "Update"
   git push origin main
   ```

3. Vercel will automatically deploy!

## 🎯 Your Deployment URL

After deployment, you'll receive a URL like:
```
https://oneclickfolio.vercel.app
```

Share this link with anyone to access OneClickFolio!

## 📞 Support

If you encounter issues:
1. Check Vercel logs: `vercel logs --follow`
2. Review Vercel dashboard for errors
3. Verify all environment variables are set correctly

---

**Note**: Free tier limitations on Vercel:
- 100GB bandwidth/month
- Serverless function timeout: 10 seconds (can increase with environment variable)
- 6,000 serverless function executions per day

For the PDF processing AI, you may need to upgrade or optimize timeouts.
