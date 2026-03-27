# Deployment Quickstart

This project works best when deployed as:

- Frontend (React/Vite): Vercel
- Backend (Express from `server/`): Render/Railway
- Database: MongoDB Atlas

## 1) Deploy backend first (Render)

Create a new Web Service from this repository and set:

- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`

Environment variables:

- `NODE_ENV=production`
- `PORT=10000` (or leave unset; Render sets one)
- `MONGODB_URI=<your atlas uri>`
- `FRONTEND_URL=<your vercel url>`
- `GEMINI_API_KEY=<your key>`
- `GROQ_API_KEY=<your key>`
- `GROQ_MODEL=openai/gpt-oss-120b` (or your preferred model)
- `JSEARCH_API_KEY=<optional>`
- `RESEND_API_KEY=<optional>`
- `EMAIL_USER=<optional>`
- `JOB_DIGEST_SCHEDULE=0 9 * * *`

After deploy, note backend URL, e.g.:
`https://oneclickfolio-api.onrender.com`

## 2) Deploy frontend on Vercel

In Vercel project settings, set:

- `VITE_API_BASE_URL=https://oneclickfolio-api.onrender.com`

Then deploy from repo root:

```bash
npx vercel
```

For production:

```bash
npx vercel --prod
```

## 3) Post-deploy checks

- Frontend opens: `https://<your-app>.vercel.app`
- Backend health: `https://<your-backend>/health`
- Login and PDF upload work from deployed frontend

## 4) CORS reminder

Set backend `FRONTEND_URL` exactly to your Vercel app URL (including `https://`).
