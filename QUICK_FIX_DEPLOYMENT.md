# 🚀 IMMEDIATE ACTIONS TO FIX YOUR DEPLOYMENT

## Problem Summary:
- ❌ Socket.io failing on Render
- ❌ 404 errors on page refresh/navigation

## Quick Fix (Do This Right Now):

### Step 1: Get Your Service URLs
1. Go to https://render.com/dashboard
2. Click on your **Backend Service**
3. Copy the URL (looks like: `https://aptitude-backend-abc123.onrender.com`)
4. Click on your **Frontend Service** 
5. Copy the URL (looks like: `https://aptitude-frontend-xyz789.onrender.com`)

### Step 2: Set Backend Environment Variables
1. In Render Dashboard → Backend Service
2. Click **Environment** (in left sidebar)
3. Add/Edit these variables:

```
CORS_ORIGIN = [paste your FRONTEND URL here]

(Keep existing: MONGODB_URI, JWT_SECRET, GEMINI_API_KEY)
```

### Step 3: Set Frontend Environment Variables
1. In Render Dashboard → Frontend Service
2. Click **Environment** (in left sidebar)
3. Add/Edit these variables:

```
VITE_API_URL = [paste your BACKEND URL here]
VITE_SOCKET_URL = [paste your BACKEND URL here]
```

### Step 4: Redeploy Both Services
1. Backend Service → Click **"Manual Deploy"** → **"Deploy latest commit"**
   - Wait until it says "Live" (green)
2. Frontend Service → Click **"Manual Deploy"** → **"Deploy latest commit"**
   - Wait until it says "Live" (green)

### Step 5: Test
1. Open your frontend URL in browser
2. Press F12 (open DevTools)
3. Go to **Console** tab
4. You should see: `✓ Socket.io connected: [id]`
5. If error, check backend logs (Backend Service → Logs)

---

## If Still Not Working:

### Check Backend Logs:
1. Render Dashboard → Backend Service
2. Click **Logs**
3. Look for error messages
4. Common issues:
   - `CORS error` = Frontend URL in CORS_ORIGIN doesn't match
   - `Cannot connect to MongoDB` = MONGODB_URI wrong
   - `undefined variable` = Env var not set

### Check Network Requests:
1. Open Frontend URL
2. Press F12 → **Network** tab
3. Try to login
4. Click on failed request
5. Check the URL in the request
6. Should be: `https://your-backend.onrender.com/api/...`
7. Not: `http://localhost:5000/api/...`

### Force Redeploy:
1. Backend → Push empty commit: 
   ```bash
   git commit --allow-empty -m "Trigger redeploy"
   git push
   ```
2. Frontend → Same process
3. Or manually click "Deploy" multiple times

---

## 📝 Example (Real Values):

**Your URLs from Render:**
- Backend: `https://aptitude-backend-a1b2c3d4.onrender.com`
- Frontend: `https://aptitude-frontend-x9y8z7w6.onrender.com`

**Backend Env Vars:**
```
CORS_ORIGIN = https://aptitude-frontend-x9y8z7w6.onrender.com
MONGODB_URI = [your atlas uri]
JWT_SECRET = [your secret]
GEMINI_API_KEY = [your key]
```

**Frontend Env Vars:**
```
VITE_API_URL = https://aptitude-backend-a1b2c3d4.onrender.com
VITE_SOCKET_URL = https://aptitude-backend-a1b2c3d4.onrender.com
```

---

## ✅ Success Indicators:
- [ ] Can login/register
- [ ] Can take a test
- [ ] Socket.io says "connected" in console
- [ ] Can refresh page without 404
- [ ] Can navigate between pages
- [ ] Admin dashboard loads
- [ ] Charts show progress

---

## 🆘 Still Stuck?

Check the detailed guides:
- [DEPLOYMENT_TROUBLESHOOTING.md](./DEPLOYMENT_TROUBLESHOOTING.md) - Full troubleshooting
- [RENDER_SETUP_COMPLETE.md](./RENDER_SETUP_COMPLETE.md) - Complete setup guide

Or look at backend logs for exact error message!
