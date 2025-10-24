# 🚀 Deploy OneClickFolio to Vercel NOW!

## Quick Start (3 Steps)

### Step 1: Run the Deployment Script
Open PowerShell in the `F:\Resume-dev` directory and run:

```powershell
.\deploy.ps1
```

**OR** manually run:

```powershell
cd F:\Resume-dev
vercel login
vercel
```

### Step 2: Set Environment Variables

After the first deployment, go to your Vercel Dashboard and add these environment variables:

**Go to:** https://vercel.com/dashboard → Your Project → Settings → Environment Variables

**Add these 4 variables:**

| Variable Name | Value | Where to Get It |
|--------------|-------|-----------------|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/portfolio` | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Free tier |
| `GEMINI_API_KEY` | `AIzaSy...` | [Google AI Studio](https://makersuite.google.com/app/apikey) - Free |
| `FRONTEND_URL` | Your Vercel URL (e.g., `https://oneclickfolio.vercel.app`) | From Step 1 output |
| `NODE_ENV` | `production` | Just type this exactly |

**Important for MongoDB:**
- Create a free cluster on MongoDB Atlas
- Go to "Network Access" → Add IP: `0.0.0.0/0` (allows Vercel to connect)
- Get connection string from "Database" → "Connect" → "Connect your application"

### Step 3: Deploy to Production

After adding environment variables, run:

```powershell
vercel --prod
```

## ✅ You're Done!

Your OneClickFolio is now live at: `https://your-project-name.vercel.app`

### What Users Can Do:

1. **Access the App**: Share `https://your-app.vercel.app` with anyone
2. **Login/Sign Up**: Users can create accounts
3. **Upload Resume**: Upload PDF to generate portfolio
4. **Customize**: Change templates and colors
5. **Deploy Portfolio**: Get a public link like `https://your-app.vercel.app/p/user-portfolio`
6. **Share**: Users can share their portfolio link anywhere

### Test Your Deployment:

- Main app: `https://your-app.vercel.app`
- Login page: `https://your-app.vercel.app/login`
- API health: `https://your-app.vercel.app/api/health`

## 🔧 Troubleshooting

### Issue: "Build failed"
- Check if all dependencies are in package.json
- Run: `vercel --force` to clear cache

### Issue: "API not responding"
- Verify environment variables are set correctly
- Check MongoDB IP whitelist includes 0.0.0.0/0
- View logs: `vercel logs --follow`

### Issue: "CORS error"
- Make sure `FRONTEND_URL` matches your Vercel deployment URL
- Redeploy after changing env variables

## 🎯 Next Steps

1. **Custom Domain** (Optional): Add a custom domain in Vercel settings
2. **Share Link**: Give your Vercel URL to users
3. **Monitor**: Check Vercel dashboard for analytics and logs

## 📚 Need More Help?

See the detailed guide: `VERCEL_DEPLOYMENT_GUIDE.md`

---

**Note**: The free tier on Vercel and MongoDB Atlas is sufficient for testing and small-scale usage. Upgrade if you need more resources.
