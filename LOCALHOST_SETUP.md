# 🚀 OneClickFolio - Local Development Setup

## 📋 Prerequisites

Before running the project locally, make sure you have:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (local or Atlas) - [Download here](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Google Gemini API Key** - [Get free key](https://makersuite.google.com/app/apikey)

---

## 🔧 Setup Instructions

### Step 1: Install Dependencies

Open PowerShell in the project root directory (`F:\Resume-dev`) and run:

```powershell
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Step 2: Create Environment File

Create a `.env` file in the `server` directory:

```powershell
# Create .env file
New-Item -Path ".\server\.env" -ItemType File -Force
```

Add these environment variables to `server/.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb+srv://giri:2004@cluster0.zou1ky3.mongodb.net/portfolio-generator

# Google Gemini AI Configuration
GEMINI_API_KEY=AIzaSyDpKqOR0e0cj-qnapk4lLrn5UB-3tKyZz8

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# File Upload Configuration
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=application/pdf

# Logging
LOG_LEVEL=info
```

---

## ▶️ Running the Project

You need to run **both** the frontend and backend servers.

### Option 1: Run Both Servers (Recommended)

Open **TWO** PowerShell windows:

**Terminal 1 - Backend Server:**
```powershell
cd F:\Resume-dev\server
npm start
```

**Terminal 2 - Frontend Dev Server:**
```powershell
cd F:\Resume-dev
npm run dev
```

### Option 2: Run with npm-run-all (if installed)

If you have `npm-run-all` package:

```powershell
npm install -g npm-run-all
```

Then add this script to root `package.json` and run:

```powershell
npm run dev:all
```

---

## 🌐 Access the Application

After both servers are running:

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **API Health Check:** http://localhost:5000/api/health

---

## 📂 Project Structure

```
F:\Resume-dev\
├── server/               # Backend (Express + MongoDB)
│   ├── index.js         # Main server file
│   ├── routes/          # API routes
│   ├── models/          # Database models
│   ├── utils/           # AI processing, PDF extraction
│   └── .env             # Environment variables (create this)
│
├── src/                 # Frontend (React + Vite)
│   ├── components/      # React components
│   ├── context/         # Auth context
│   ├── services/        # API services
│   └── config/          # API configuration
│
├── api/                 # Vercel serverless functions
├── public/              # Static assets
└── package.json         # Root dependencies
```

---

## 🔍 Verify Setup

### 1. Check Backend is Running

```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing
```

Should return:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-10-23T09:23:00.000Z"
}
```

### 2. Check Frontend is Running

Open browser: http://localhost:5173

You should see the OneClickFolio login page.

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to MongoDB"

**Solution 1:** Using MongoDB Atlas (Cloud)
- Make sure your IP is whitelisted in MongoDB Atlas
- Go to Network Access → Add IP: `0.0.0.0/0` (allow all)

**Solution 2:** Using Local MongoDB
- Install MongoDB Community Edition
- Start MongoDB service:
  ```powershell
  net start MongoDB
  ```
- Update `MONGODB_URI` in `.env`:
  ```
  MONGODB_URI=mongodb://localhost:27017/portfolio-generator
  ```

### Issue: "Port 5000 already in use"

**Solution:**
```powershell
# Find process using port 5000
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess

# Kill the process (replace PID with actual process ID)
Stop-Process -Id <PID> -Force
```

Or change the port in `server/.env`:
```env
PORT=5001
```

### Issue: "CORS error" in browser console

**Solution:**
- Make sure backend is running
- Check `FRONTEND_URL` in `server/.env` matches your frontend URL
- Restart backend server after changing `.env`

### Issue: "Gemini API error"

**Solution:**
- Verify your `GEMINI_API_KEY` is correct
- Check API quota: https://makersuite.google.com/app/apikey
- Get a new free key if needed

### Issue: Frontend shows blank page

**Solution:**
```powershell
# Clear node modules and reinstall
cd F:\Resume-dev
Remove-Item -Recurse -Force node_modules
npm install

# Clear Vite cache
Remove-Item -Recurse -Force .vite
npm run dev
```

---

## 🛠️ Development Commands

### Frontend Commands (from root directory)

```powershell
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Backend Commands (from server directory)

```powershell
# Start server
npm start

# Start with auto-reload (if nodemon is installed)
npm run dev

# Run tests (if tests exist)
npm test
```

---

## 📝 Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Backend server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/portfolio` |
| `GEMINI_API_KEY` | Google AI API key | `AIzaSy...` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `NODE_ENV` | Environment mode | `development` |

---

## 🎯 Quick Start (TL;DR)

```powershell
# Terminal 1: Backend
cd F:\Resume-dev\server
npm install
# Create .env with your credentials
npm start

# Terminal 2: Frontend
cd F:\Resume-dev
npm install
npm run dev

# Open browser: http://localhost:5173
```

---

## 🚀 Making Changes

### Frontend Changes
1. Edit files in `src/` directory
2. Vite will auto-reload changes
3. View changes at http://localhost:5173

### Backend Changes
1. Edit files in `server/` directory
2. Restart server manually or use nodemon
3. Test API at http://localhost:5000

---

## 📚 Additional Resources

- **React Documentation:** https://react.dev/
- **Vite Documentation:** https://vitejs.dev/
- **Express Documentation:** https://expressjs.com/
- **MongoDB Documentation:** https://docs.mongodb.com/
- **Gemini API Documentation:** https://ai.google.dev/docs

---

## 💡 Tips

1. **Always run backend first** before frontend
2. **Check console logs** for errors in both terminals
3. **Clear browser cache** if styles don't update
4. **Use incognito mode** to test fresh sessions
5. **Keep MongoDB running** while developing

---

## 🎉 Success!

If both servers are running without errors, you're ready to develop! 

Create an account, upload a resume, and test the AI portfolio generation locally.

**Happy Coding! 🚀**
