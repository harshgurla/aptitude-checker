# ⚡ Quick Fix Checklist for 500 Error

## 🎯 Most Likely Cause
**Missing or invalid `GEMINI_API_KEY` in Render environment variables**

## ✅ Fix in 3 Minutes:

### 1️⃣ Get Your API Key
- Go to: https://makersuite.google.com/app/apikey
- Sign in with Google
- Copy the API key (looks like: `AIzaSy...`)

### 2️⃣ Set Environment Variable
1. Render Dashboard → Backend Service → Settings
2. Scroll to "Environment"
3. Find `GEMINI_API_KEY`
4. Paste your API key
5. Click "Save Changes"

### 3️⃣ Redeploy
1. Click "Manual Deploy"
2. Select "Deploy latest commit"
3. Wait for deployment ✓

### 4️⃣ Test
1. Go to your website
2. Login as admin
3. Click "Generate Today's Questions"
4. ✅ Should work now!

---

## 🔍 If Still Getting 500 Error:

### Check Backend Logs:
1. Render Dashboard → Backend Service → Logs
2. Look for:
   - ❌ `GEMINI_API_KEY not configured` → Fix step 1-2 above
   - ❌ `API call failed` → API key is wrong or rate limited
   - ❌ `No active topic` → Create/activate a topic first

### Check Browser Console:
1. F12 → Console tab
2. Look at error message from `/api/admin/generate-questions`
3. Check Network tab to see response

---

## 📋 Verify You Have:

- [ ] GEMINI_API_KEY set in Render (not empty!)
- [ ] MONGODB_URI set in Render
- [ ] CORS_ORIGIN set in Render (your frontend URL)
- [ ] Backend redeployed after setting variables
- [ ] At least one Topic created and activated

---

## 🚀 That's It!

The improvements I made will now show you **exactly** what's wrong in the logs when you try to generate questions.

**No more mysterious 500 errors!** 🎉
