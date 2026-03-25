---
description: How to run the OneClickFolio project locally
---

# 🚀 Running OneClickFolio Locally

This project has **two parts** that need to run at the same time:
1. **Backend Server** (Express + MongoDB) → handles the API, database, and AI
2. **Frontend App** (React + Vite) → the website you see in the browser

---

## 📋 Prerequisites (One-Time Setup)

Make sure you have these installed on your computer:

- **Node.js** (v18 or higher) → [Download here](https://nodejs.org/)
- **A Groq API Key** (free) → [Get one here](https://console.groq.com)

### Check if Node.js is installed:
```powershell
node --version
```
You should see something like `v18.x.x` or higher.

---

## 🏃 Steps to Run (Every Time)

### Step 1: Open TWO terminals (PowerShell windows)

You need **two separate terminals** because both servers need to run at the same time.

---

### Step 2: Start the Backend Server (Terminal 1)

```powershell
cd C:\Users\dharu\Desktop\one\Oneclickfolio\Oneclickfolio\server
npm start
```

**What you should see:**
```
🚀 Server running on port 5000
📊 Environment: development
✅ Connected to MongoDB
```

> ⚠️ If you see errors about missing modules, run `npm install` first, then `npm start` again.

---

### Step 3: Start the Frontend App (Terminal 2)

```powershell
cd C:\Users\dharu\Desktop\one\Oneclickfolio\Oneclickfolio
npm run dev
```

**What you should see:**
```
VITE ready in xxx ms

➜  Local:   http://localhost:5173/
```

> ⚠️ If you see errors about missing modules, run `npm install` first, then `npm run dev` again.

---

### Step 4: Open in Browser

Go to: **http://localhost:5173**

That's it! 🎉

---

## 🛑 How to Stop the Servers

In each terminal, press **Ctrl + C** to stop the server.

---

## 🔧 Troubleshooting

### "Cannot find module" or "Module not found" errors
Run these commands to reinstall dependencies:
```powershell
# In the root folder
cd C:\Users\dharu\Desktop\one\Oneclickfolio\Oneclickfolio
npm install

# In the server folder
cd server
npm install
```

### "Port 5000 already in use"
Something is already using port 5000. Kill it:
```powershell
# Find what's using port 5000
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess

# Kill it (replace <PID> with the actual process ID from above)
Stop-Process -Id <PID> -Force
```
Then try `npm start` again.

### "Port 5173 already in use"
Same thing, but for the frontend:
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess
Stop-Process -Id <PID> -Force
```
Then try `npm run dev` again.

### AI features not working (portfolio generation fails)
You need a **Groq API key**. Edit the file `server\.env` and add your key:
```
GROQ_API_KEY=your_actual_key_here
```
Then restart the backend server (Ctrl+C, then `npm start`).

### MongoDB connection error
The project uses a cloud MongoDB Atlas database. Make sure you have internet connectivity. If it still fails, the Atlas credentials in `server\.env` may have expired.

---

## 📁 Quick Reference

| What | Where |
|------|-------|
| **Project root** | `C:\Users\dharu\Desktop\one\Oneclickfolio\Oneclickfolio` |
| **Backend code** | `server\` folder |
| **Frontend code** | `src\` folder |
| **Backend config** | `server\.env` |
| **Frontend URL** | http://localhost:5173 |
| **Backend API URL** | http://localhost:5000 |

---

## 🧠 Remember

1. **Always start the backend FIRST**, then the frontend
2. **Both terminals must stay open** while you're using the app
3. **Ctrl + C** stops each server
4. If something breaks, try `npm install` in both directories
