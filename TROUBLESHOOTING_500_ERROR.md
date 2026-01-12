# 🔧 500 Error Troubleshooting Guide

## The Error You Got:
```
Failed to load resource: the server responded with a status of 500 ()
Mutation error: te
https://aptitude-checker.onrender.com/api/admin/generate-questions
```

## ✅ What I Fixed:

I've added **detailed logging and error handling** to help diagnose the issue. When you redeploy, the Render logs will show exactly what's failing.

---

## 🎯 Steps to Fix:

### Step 1: Check Your Render Environment Variables

1. **Go to Render Dashboard** → Your Backend Service
2. **Click Settings** → **Environment**
3. **Verify these variables exist**:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-secret-key
JWT_EXPIRY=7d
GEMINI_API_KEY=your-gemini-api-key ✅ CRITICAL
GEMINI_MODEL=gemini-1.5-flash
CORS_ORIGIN=https://your-frontend-url.onrender.com
```

**Most common issue**: Missing or incorrect `GEMINI_API_KEY`

### Step 2: Test Your Gemini API Key

1. Get a free key from: https://makersuite.google.com/app/apikey
2. Make sure it's not empty or placeholder text
3. Copy the exact key into Render environment variables

### Step 3: Redeploy Backend

1. Go to **Render Dashboard** → **Your Backend Service**
2. Click **Manual Deploy** → **Deploy latest commit**
3. Wait for deployment to complete

### Step 4: Check Backend Logs

1. Go to **Render Dashboard** → **Your Backend Service**
2. Click **Logs**
3. Look for messages starting with:
   - `🔧 [initializeGemini]` - API key initialization
   - `❌ [generateQuestionsAI]` - Specific error details
   - `🤖 [generateQuestionsAI]` - Progress logs

---

## 🐛 Common Errors & Solutions:

### Error: "GEMINI_API_KEY not configured in environment variables"
**Solution**: 
1. Set `GEMINI_API_KEY` in Render environment variables
2. Get key from: https://makersuite.google.com/app/apikey
3. Redeploy backend

### Error: "API call failed"
**Solution**:
1. Check your Gemini API key is correct
2. Check you haven't exceeded rate limit (60 req/min free tier)
3. Wait a few minutes and try again

### Error: "Failed to parse JSON response"
**Solution**:
1. Gemini is returning malformed JSON
2. This usually means the API is having issues
3. Wait a few minutes and try again
4. The system will retry 3 times automatically

### Error: "No active topic found"
**Solution**:
1. Go to Admin Dashboard
2. Check that a Topic is activated
3. Seed the database with topics if none exist

### Error: "Questions already generated for today"
**Solution**:
This is NOT an error - it means questions were already generated
- Button will be disabled with countdown
- Try again after midnight (UTC timezone)

---

## 📊 How to Debug:

### 1. Check Render Logs
```
Render Dashboard → Service → Logs
Look for patterns like:
✓ [generateQuestionsManually] ...
❌ [functionName] Error message
```

### 2. Check Browser Console
```
F12 → Console tab
Look for error messages and network requests
```

### 3. Check Network Tab
```
F12 → Network tab
Click on the failed request to see:
- Request URL
- Request headers
- Response status
- Response body (error details)
```

### 4. Check MongoDB
```
MongoDB Atlas → Collections → Questions
Verify questions are being saved
Count documents to check
```

---

## 🚀 After Fixing:

1. **Redeploy backend** (already done - auto-deployed)
2. **Try generating questions again**
3. **Check Render logs** for:
   ```
   ✓ [generateQuestionsAI] Successfully generated X questions
   ✅ [generateQuestionsManually] Success!
   ```

---

## 📋 Validation Checklist:

- [ ] GEMINI_API_KEY is set in Render environment
- [ ] GEMINI_API_KEY is correct (not placeholder)
- [ ] CORS_ORIGIN matches frontend URL
- [ ] MongoDB connection string is valid
- [ ] At least one Topic exists and is active
- [ ] Backend has been redeployed
- [ ] Frontend has been redeployed

---

## 💡 What Happens Now:

When you click "Generate Questions":

1. **[Step 1]** `generateQuestionsManually` controller starts
   - Logs: `📌 [generateQuestionsManually] Starting...`
   - Gets active topic
   - Checks for existing questions

2. **[Step 2]** `generateTodayQuestions` service starts
   - Logs: `🚀 [generateTodayQuestions] Starting...`
   - Iterates through difficulty levels (easy, medium, hard)

3. **[Step 3]** `generateQuestionsAI` function starts
   - Logs: `🤖 [generateQuestionsAI] Generating...`
   - Calls Gemini API
   - Retries up to 3 times on failure
   - Parses response
   - Validates questions

4. **[Step 4]** Questions are saved to MongoDB
   - Logs: `✓ Generated X questions`

5. **[Step 5]** Response sent to frontend
   - Logs: `✅ Success!`

**If any step fails**, the logs will tell you exactly what went wrong!

---

## 🆘 Still Having Issues?

1. **Check Render Logs** - Copy error message
2. **Check browser Network tab** - See what response backend sent
3. **Verify API key** - Test key at https://makersuite.google.com/app/apikey
4. **Try different topic** - Some topics might work better
5. **Wait and retry** - Sometimes API is slow to respond

The new logging makes it much easier to see what's happening! 🎯
