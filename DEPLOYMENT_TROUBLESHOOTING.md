# Deployment Troubleshooting Guide - Socket.io & 404 Errors

## Problem 1: Socket.io Failing in Production

**Root Cause:** The frontend doesn't know the backend URL on Render deployment.

**Solution:** Set environment variables on Render dashboard.

### Steps to Fix Socket.io:

1. **Go to Render Dashboard** → Select your backend service
2. **Click "Environment"** in the left sidebar
3. **Add/Update these variables:**
   - `CORS_ORIGIN`: Your deployed frontend URL (e.g., `https://your-frontend.onrender.com`)
   - Keep `MONGODB_URI`, `GEMINI_API_KEY`, `JWT_SECRET` as is

4. **For Frontend Service** → Click "Environment"
5. **Add these variables:**
   - `VITE_API_URL`: Your deployed backend URL (e.g., `https://your-backend.onrender.com`)
   - `VITE_SOCKET_URL`: Same as backend URL (e.g., `https://your-backend.onrender.com`)

**Example values for Render:**
```
VITE_API_URL=https://aptitude-backend.onrender.com
VITE_SOCKET_URL=https://aptitude-backend.onrender.com
CORS_ORIGIN=https://aptitude-frontend.onrender.com
```

---

## Problem 2: 404 Errors on Page Refresh/Navigation

**Root Cause:** Static site not configured to serve SPA routes correctly.

**Solution:** Ensure `_redirects` and `render.yaml` are in place (already done, but verify).

### Verification Checklist:

- ✅ `frontend/public/_redirects` exists with: `/*    /index.html   200`
- ✅ `frontend/render.yaml` exists with proper redirects
- ✅ Build command is: `npm run build`
- ✅ Publish directory is: `dist`

---

## Problem 3: Socket.io Connection Issues

**Additional Fix:** Update Socket.io client configuration to handle production URLs.

### Frontend Socket.io Setup:

The `useSocket.js` hook needs to use the proper Render backend URL.

**Current code uses:**
```javascript
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
```

This is correct, but ensure the environment variable is set on Render.

---

## Quick Checklist for Render Deployment:

### Backend Service:
- [ ] Name: something like `aptitude-backend`
- [ ] Build Command: `npm install`
- [ ] Start Command: `node src/server.js`
- [ ] Node version: 18 or higher
- [ ] Environment Variables Set:
  - [ ] `MONGODB_URI`
  - [ ] `GEMINI_API_KEY`
  - [ ] `JWT_SECRET`
  - [ ] `CORS_ORIGIN` = frontend URL
  - [ ] `GEMINI_MODEL` = `gemini-1.5-flash`
  - [ ] `NODE_ENV` = `production`

### Frontend Static Site:
- [ ] Name: something like `aptitude-frontend`
- [ ] Build Command: `cd frontend && npm install && npm run build`
- [ ] Publish Directory: `frontend/dist`
- [ ] Environment Variables Set:
  - [ ] `VITE_API_URL` = backend URL
  - [ ] `VITE_SOCKET_URL` = backend URL

---

## Testing After Deployment:

1. **Test API calls:** Open browser DevTools → Network tab → Make a test
2. **Check API requests:** Should go to your deployed backend URL
3. **Check Socket.io:** Open Console → Should show socket connection
4. **Test page refresh:** Go to `/dashboard`, refresh page (Ctrl+R) → Should work
5. **Test navigation:** Click links, use back button → Should work without 404s

---

## If Issues Persist:

### Check Backend Logs:
- Go to Render dashboard → Your backend service
- Click "Logs"
- Look for:
  - CORS errors
  - Connection errors
  - MongoDB connection issues

### Check Frontend Deployment:
- Go to Render dashboard → Your frontend service
- Click "Logs"
- Look for build errors

### Common Issues:
- ❌ VITE variables not set → Frontend can't find backend
- ❌ CORS_ORIGIN mismatch → Socket.io fails with CORS error
- ❌ Wrong build command → `dist` folder not created
- ❌ MongoDB offline → Tests can't be saved

---

## Environment Variable Template:

**Create a `.env.production` file for reference:**

```env
# Backend
NODE_ENV=production
PORT=5000
MONGODB_URI=your-atlas-uri
JWT_SECRET=your-strong-secret
GEMINI_API_KEY=your-api-key
GEMINI_MODEL=gemini-1.5-flash
CORS_ORIGIN=https://your-frontend.onrender.com

# Frontend (in Render env vars)
VITE_API_URL=https://your-backend.onrender.com
VITE_SOCKET_URL=https://your-backend.onrender.com
```

---

## Still Having Issues?

1. **Redeploy both services** after setting env vars (Render doesn't auto-reload)
   - Backend: Click "Manual Deploy" → "Deploy latest commit"
   - Frontend: Same process

2. **Clear browser cache** (Ctrl+Shift+Delete on Chrome)

3. **Check that URLs are HTTPS**, not HTTP

4. **Verify `.env` is NOT in git** (check `.gitignore`)

5. **Check that `render.yaml` is in root of `frontend/` folder**
