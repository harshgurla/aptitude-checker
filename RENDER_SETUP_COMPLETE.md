# Render Deployment - Complete Setup Guide

## Step-by-Step Environment Variable Configuration

### 📌 IMPORTANT: Before You Start
1. Your backend and frontend must be deployed as SEPARATE services on Render
2. Note down the exact URLs Render assigns to each (they'll be like `https://service-name-xxxx.onrender.com`)

---

## Step 1: Backend Service Environment Variables

### Go to Render Dashboard → Your Backend Service → Environment

Add these variables:

```
MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

JWT_SECRET = your-super-secret-key-min-32-characters-long-here

GEMINI_API_KEY = your-google-gemini-api-key

GEMINI_MODEL = gemini-1.5-flash

CORS_ORIGIN = https://your-frontend-service.onrender.com
(Replace with your actual frontend URL from Render)

NODE_ENV = production

PORT = 5000
```

### Example Real Values:
```
CORS_ORIGIN = https://aptitude-frontend-abc123.onrender.com
(if your frontend service is named "aptitude-frontend" and Render assigns abc123)
```

---

## Step 2: Frontend Static Site Environment Variables

### Go to Render Dashboard → Your Frontend Service → Environment

Add these variables:

```
VITE_API_URL = https://your-backend-service.onrender.com
(Replace with your actual backend URL from Render)

VITE_SOCKET_URL = https://your-backend-service.onrender.com
(Same as VITE_API_URL)
```

### Example Real Values:
```
VITE_API_URL = https://aptitude-backend-xyz789.onrender.com
VITE_SOCKET_URL = https://aptitude-backend-xyz789.onrender.com
```

---

## Step 3: Verify Your Service Names and URLs

### Backend Service:
- **Service Name:** Check in Render dashboard (should be in the URL)
- **Full URL:** `https://[service-name]-[random].onrender.com`
- **Example:** `https://aptitude-backend-a1b2c3.onrender.com`

### Frontend Service:
- **Service Name:** Check in Render dashboard
- **Full URL:** `https://[service-name]-[random].onrender.com`
- **Example:** `https://aptitude-frontend-x9y8z7.onrender.com`

---

## Step 4: Redeploy Services

### After Setting Environment Variables:

1. **Go to Backend Service** → Click **"Manual Deploy"** → **"Deploy latest commit"**
   - Wait for deployment to complete (green checkmark)

2. **Go to Frontend Service** → Click **"Manual Deploy"** → **"Deploy latest commit"**
   - Wait for deployment to complete (green checkmark)

⚠️ **Important:** Environment variables only apply AFTER redeployment!

---

## Step 5: Test the Deployment

### Test 1: Check API Connectivity
1. Open your frontend: `https://your-frontend.onrender.com`
2. Open Browser DevTools (F12)
3. Go to **Network** tab
4. Register or login
5. Check that network requests go to your backend URL

### Test 2: Check Socket.io Connection
1. Stay in DevTools
2. Go to **Console** tab
3. Should see: `🔌 Connecting to Socket.io at: https://your-backend.onrender.com`
4. Should see: `✓ Socket.io connected: [socket-id]`
5. If you see error, check backend logs

### Test 3: Check Page Navigation
1. Go to Dashboard
2. Press **Ctrl+R** (refresh page)
3. Should NOT get 404 error
4. Click other pages and navigate
5. Should work without errors

### Test 4: Check Admin Features
1. Login as admin
2. Go to `/admin`
3. Should load without errors

---

## 🔴 Troubleshooting

### ❌ Error: "Cannot POST /api/auth/login"
**Problem:** Frontend can't reach backend
**Solution:** 
1. Check VITE_API_URL is set correctly on frontend
2. Verify it matches your backend URL exactly
3. Redeploy frontend

### ❌ Error: "Socket.io connection refused"
**Problem:** Socket.io can't connect to backend
**Solution:**
1. Check VITE_SOCKET_URL on frontend (should match backend URL)
2. Check CORS_ORIGIN on backend (should match frontend URL)
3. Ensure backend is running and healthy (check Render logs)
4. Redeploy both services

### ❌ Error: "Page not found" on refresh
**Problem:** SPA routing not configured properly
**Solution:**
1. Verify `_redirects` exists in `frontend/public/`
2. Verify `render.yaml` exists in `frontend/` root
3. Ensure build command outputs to `frontend/dist`
4. Redeploy frontend

### ❌ Error: "MongoDB connection failed"
**Problem:** Database URL wrong or offline
**Solution:**
1. Copy MONGODB_URI from MongoDB Atlas (Include username and password)
2. Ensure database is not locked (check Atlas dashboard)
3. Verify IP whitelist includes Render IP (Or use 0.0.0.0/0 for testing)
4. Redeploy backend

### ❌ Error: "502 Bad Gateway"
**Problem:** Backend is crashing or not starting
**Solution:**
1. Check backend logs in Render dashboard
2. Look for error messages about missing env vars
3. Ensure all required env vars are set
4. Redeploy backend with: `node src/server.js` start command

---

## ✅ Quick Verification Checklist

- [ ] Backend service created on Render
- [ ] Frontend service created on Render
- [ ] Backend URL noted: `https://...onrender.com`
- [ ] Frontend URL noted: `https://...onrender.com`
- [ ] Backend env vars set (MONGODB_URI, JWT_SECRET, GEMINI_API_KEY, CORS_ORIGIN)
- [ ] Frontend env vars set (VITE_API_URL, VITE_SOCKET_URL)
- [ ] Both services redeployed after setting env vars
- [ ] Tested API calls in Network tab
- [ ] Tested Socket.io in Console
- [ ] Tested page refresh (no 404)
- [ ] Tested navigation between pages

---

## 📞 Need Help?

### Check Logs:
1. Render Dashboard → Service Name
2. Click "Logs" tab
3. Look for errors/warnings
4. Scroll up to see full error messages

### Common Log Messages:
- `ECONNREFUSED` = Can't reach MongoDB
- `CORS error` = CORS_ORIGIN mismatch
- `Cannot find module` = Missing dependency
- `Gemini API key invalid` = Wrong API key

---

## 🚀 Everything Working?

Congratulations! Your app is deployed. Now:
1. Share the frontend URL with users
2. Monitor Render logs for errors
3. Scale up if needed when users increase
