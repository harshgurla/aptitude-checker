# Render Deployment - SPA Routing Fix

## The Problem
After deploying to Render, clicking links or refreshing pages shows "Page not found" error.

## Root Cause
Render Static Sites need specific configuration for Single Page Applications (SPA) to handle client-side routing.

## Solution - Update Render Dashboard Settings

### Go to your Frontend Service on Render:

1. **Click on your frontend service** (e.g., "aptitude-frontend")
2. **Go to Settings**
3. **Scroll to "Publish Directory"**
   - Should be: `dist` (not `frontend/dist`)
4. **Check "Redirects/Rewrites"** section
   - If not available, this is handled by `_redirects` file

### Verify Build Settings:

**Build Command:**
```
npm install && npm run build
```

**Publish Directory:**
```
dist
```

**Important:** If your service is in a subdirectory (frontend/), the paths should be relative to that subdirectory.

---

## Files Already Updated:

✅ `frontend/public/_redirects` - Redirects all routes to index.html
✅ `frontend/render.yaml` - Updated with proper SPA configuration  
✅ `frontend/vite.config.js` - Configured build output directory
✅ `frontend/public/404.html` - Fallback for 404 errors

---

## Next Steps:

### Option 1: Redeploy (Automatic)
Just push the changes and Render will redeploy:
```bash
git add -A
git commit -m "Fix SPA routing on Render"
git push origin main
```

### Option 2: Manual Redeploy
1. Go to Render Dashboard
2. Click your frontend service
3. Click **"Manual Deploy"** → **"Deploy latest commit"**

---

## Verify After Deployment:

1. Go to your deployed frontend URL
2. Navigate to `/dashboard`
3. Press **Ctrl+R** (refresh) - should NOT show 404
4. Click "Take Another Test" - should work
5. Click "Back to Dashboard" - should work

---

## If Still Not Working:

### Check Render Service Type:
- Go to Render Dashboard → Your Frontend Service
- Check "Type" - should be **"Static Site"** not "Web Service"

### If it's a Web Service instead of Static Site:
You need to recreate it as a Static Site:

1. **Create New Static Site:**
   - Click "New +" → "Static Site"
   - Connect your GitHub repo
   - Set Root Directory: `frontend` (or leave blank if at root)
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

2. **Add Environment Variables:**
   - `VITE_API_URL` = your backend URL
   - `VITE_SOCKET_URL` = your backend URL

3. **Delete old Web Service** (if needed)

---

## Alternative: Use Netlify or Vercel

If Render continues having issues, these platforms have better SPA support:

### Netlify:
- Automatically detects `_redirects` file
- Perfect for SPAs

### Vercel:
- Uses `vercel.json` (already configured)
- Zero-config SPA support
